import datetime
import math
from django.utils import timezone
from django.db import transaction, models
from .models import AttendanceRecord, AttendanceEvent
from apps.shifts.models import Shift, EmployeeShift
from apps.holidays.models import Holiday


def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees).
    Returns distance in meters.
    """
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return None
    try:
        lat1, lon1, lat2, lon2 = map(math.radians, [float(lat1), float(lon1), float(lat2), float(lon2)])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
        c = 2 * math.asin(math.sqrt(a))
        r = 6371000  # Earth radius in meters
        return c * r
    except (ValueError, TypeError):
        return None


def verify_office_geofence(employee, latitude, longitude):
    """
    Verifies whether the provided GPS coordinates fall within the employee's assigned office geofence.
    """
    if latitude is None or longitude is None:
        return {
            "verified": False,
            "distance_meters": None,
            "allowed_radius_meters": None,
            "office_name": None,
            "office_id": None,
            "reason": "Missing coordinates"
        }

    office = getattr(employee, 'office', None)
    if not office or office.latitude is None or office.longitude is None:
        # Check any office configured for the organization
        org_offices = employee.organization.offices.filter(
            latitude__isnull=False,
            longitude__isnull=False,
            is_active=True
        )
        if not org_offices.exists():
            return {
                "verified": False,
                "distance_meters": None,
                "allowed_radius_meters": None,
                "office_name": None,
                "office_id": None,
                "reason": "No office coordinates configured"
            }
        best_office = None
        min_dist = float('inf')
        for off in org_offices:
            dist = calculate_haversine_distance(latitude, longitude, off.latitude, off.longitude)
            if dist is not None and dist < min_dist:
                min_dist = dist
                best_office = off
        office = best_office

    dist = calculate_haversine_distance(latitude, longitude, office.latitude, office.longitude)
    if dist is None:
        return {
            "verified": False,
            "distance_meters": None,
            "allowed_radius_meters": None,
            "office_name": office.name,
            "office_id": str(office.id),
            "reason": "Distance calculation failed"
        }

    radius = getattr(office, 'geofence_radius_meters', None) or getattr(office, 'radius_meters', 250)
    is_inside = (dist <= radius)

    return {
        "verified": is_inside,
        "distance_meters": round(dist, 2),
        "allowed_radius_meters": radius,
        "office_name": office.name,
        "office_id": str(office.id),
        "reason": "Inside geofence" if is_inside else f"Distance {round(dist, 1)}m exceeds allowed radius {radius}m"
    }


def get_employee_shift_for_date(employee, date):
    """Retrieve active shift assignment for the employee on the given date."""
    assignment = EmployeeShift.objects.filter(
        employee=employee,
        start_date__lte=date,
        is_active=True
    ).filter(
        models.Q(end_date__gte=date) | models.Q(end_date__isnull=True)
    ).select_related('shift').first()

    if assignment:
        return assignment.shift

    # Fallback to default organization shift
    return Shift.objects.filter(organization=employee.organization, is_deleted=False).first()


@transaction.atomic
def record_punch(employee, event_type, timestamp=None, source='MANUAL', latitude=None, longitude=None, access_point=None, metadata=None):
    """
    Records a punch (check-in / check-out), creates AttendanceEvent,
    and updates/recalculates the parent AttendanceRecord.
    If GPS coordinates are provided, verifies office geofence.
    """
    if timestamp is None:
        timestamp = timezone.now()

    punch_date = timestamp.date()
    organization = employee.organization
    meta = dict(metadata or {})

    # Evaluate Geofence if coordinates are provided
    geofence_info = None
    if latitude is not None and longitude is not None:
        geofence_info = verify_office_geofence(employee, latitude, longitude)
        meta['geofence'] = geofence_info
        if geofence_info.get('verified') is True:
            source = 'MOBILE_GEOFENCE'

    # Find or create daily attendance record
    shift = get_employee_shift_for_date(employee, punch_date)
    record, created = AttendanceRecord.objects.get_or_create(
        organization=organization,
        employee=employee,
        attendance_date=punch_date,
        defaults={
            'shift': shift,
            'status': 'ABSENT',
            'source': source,
        }
    )

    if not created and source == 'MOBILE_GEOFENCE' and record.source in ['MANUAL', 'MOBILE_APP']:
        record.source = 'MOBILE_GEOFENCE'

    # Log event
    event = AttendanceEvent.objects.create(
        organization=organization,
        attendance_record=record,
        employee=employee,
        event_type=event_type,
        timestamp=timestamp,
        source=source,
        latitude=latitude,
        longitude=longitude,
        access_point=access_point,
        metadata=meta
    )

    # Recalculate record unless locked by admin
    if not record.is_finalized:
        recalculate_attendance_record(record)

    return record, event


def recalculate_attendance_record(record):
    """
    Recalculates check-in, check-out, work minutes, late arrival, and status
    based on all associated events for the day.
    """
    events = record.events.filter(is_deleted=False).order_by('timestamp')
    if not events.exists():
        return record

    first_in = None
    last_out = None

    for ev in events:
        if ev.event_type in ['CHECK_IN', 'WIFI_ASSOCIATION']:
            if first_in is None or ev.timestamp < first_in:
                first_in = ev.timestamp
        elif ev.event_type in ['CHECK_OUT', 'WIFI_DISASSOCIATION']:
            if last_out is None or ev.timestamp > last_out:
                last_out = ev.timestamp

    # If only one punch exists and it's a check-in
    if first_in and not last_out:
        # Check if latest event is check-out
        latest_event = events.last()
        if latest_event and latest_event.event_type == 'CHECK_OUT':
            last_out = latest_event.timestamp

    record.first_check_in = first_in
    record.last_check_out = last_out

    # Shift calculations
    shift = record.shift
    if not shift:
        shift = get_employee_shift_for_date(record.employee, record.attendance_date)
        record.shift = shift

    late_minutes = 0
    work_minutes = 0
    early_departure_minutes = 0
    overtime_minutes = 0

    if first_in and shift:
        # Determine shift start datetime for this date
        tz = timezone.get_current_timezone()
        shift_start_dt = timezone.make_aware(
            datetime.datetime.combine(record.attendance_date, shift.start_time), tz
        )
        grace_limit = shift_start_dt + datetime.timedelta(minutes=shift.grace_period_minutes)

        if first_in > grace_limit:
            delay = (first_in - shift_start_dt).total_seconds() / 60.0
            late_minutes = max(0, int(delay))

    if first_in and last_out and last_out > first_in:
        raw_duration = int((last_out - first_in).total_seconds() / 60.0)
        # Deduct break duration if applicable
        break_mins = shift.break_duration_minutes if shift else 60
        work_minutes = max(0, raw_duration - break_mins)

        if shift:
            shift_end_dt = timezone.make_aware(
                datetime.datetime.combine(record.attendance_date, shift.end_time), tz
            )
            if last_out < shift_end_dt:
                early = (shift_end_dt - last_out).total_seconds() / 60.0
                early_departure_minutes = max(0, int(early))
            elif last_out > shift_end_dt:
                extra = (last_out - shift_end_dt).total_seconds() / 60.0
                overtime_minutes = max(0, int(extra))

    record.late_minutes = late_minutes
    record.early_departure_minutes = early_departure_minutes
    record.total_work_minutes = work_minutes
    record.overtime_minutes = overtime_minutes

    # Evaluate Status
    if first_in:
        half_day_threshold = shift.half_day_threshold_minutes if shift else 240
        if late_minutes > 0:
            record.status = 'LATE'
        elif work_minutes > 0 and work_minutes < half_day_threshold:
            record.status = 'HALF_DAY'
        else:
            record.status = 'PRESENT'
    else:
        # Check if holiday
        is_holiday = Holiday.objects.filter(
            organization=record.organization,
            holiday_date=record.attendance_date
        ).exists()
        if is_holiday:
            record.status = 'HOLIDAY'
        elif record.attendance_date.weekday() in [5, 6]:  # Saturday, Sunday
            record.status = 'WEEKEND'
        else:
            record.status = 'ABSENT'

    record.save()
    return record
