import datetime
from django.utils import timezone
from django.db import transaction
from .models import AttendanceRecord, AttendanceEvent
from apps.shifts.models import Shift, EmployeeShift
from apps.holidays.models import Holiday


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
    """
    if timestamp is None:
        timestamp = timezone.now()

    punch_date = timestamp.date()
    organization = employee.organization

    # Find or create daily attendance record
    shift = get_employee_shift_for_date(employee, punch_date)
    record, _ = AttendanceRecord.objects.get_or_create(
        organization=organization,
        employee=employee,
        attendance_date=punch_date,
        defaults={
            'shift': shift,
            'status': 'ABSENT',
            'source': source,
        }
    )

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
        metadata=metadata or {}
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
