import datetime
from django.utils import timezone
from django.db import transaction
from django.utils.dateparse import parse_datetime
from .models import WiFiSession
from apps.organizations.models import AccessPoint
from apps.employees.models import Employee
from apps.attendance.models import AttendanceRecord, AttendanceEvent
from apps.attendance.services import get_employee_shift_for_date, recalculate_attendance_record


def normalize_mac(mac):
    if not mac:
        return ""
    clean = mac.replace('-', ':').replace('.', '').upper()
    return clean


@transaction.atomic
def ingest_wifi_event_batch(organization, events_data):
    """
    Ingests a raw batch of RADIUS accounting sessions, stages them into WiFiSession,
    and runs the processing pipeline.
    """
    staged_sessions = []
    ap_cache = {}
    emp_cache = {}

    for item in events_data:
        raw_mac = normalize_mac(item.get('called_station_id', ''))
        raw_user = item.get('user_name', '').strip()
        start_str = item.get('session_start')
        end_str = item.get('session_end')
        duration = int(item.get('session_duration_seconds', 0))

        start_dt = parse_datetime(start_str) if isinstance(start_str, str) else start_str
        end_dt = parse_datetime(end_str) if isinstance(end_str, str) else end_str

        if not start_dt:
            continue
        if not end_dt:
            end_dt = start_dt + datetime.timedelta(seconds=duration)

        # Lookup AP
        if raw_mac not in ap_cache:
            ap_cache[raw_mac] = AccessPoint.objects.filter(
                organization=organization,
                mac_address=raw_mac,
                is_active=True
            ).first()
        ap = ap_cache[raw_mac]

        # Lookup Employee by network_username
        if raw_user not in emp_cache:
            emp_cache[raw_user] = Employee.objects.filter(
                organization=organization,
                network_username=raw_user,
                employment_status='ACTIVE'
            ).first()
        emp = emp_cache[raw_user]

        status = 'PENDING'
        error = None
        if not ap:
            status = 'IGNORED'
            error = f"Unregistered or inactive Access Point MAC: {raw_mac}"
        elif not emp:
            status = 'IGNORED'
            error = f"Unregistered enterprise network username: {raw_user}"

        session = WiFiSession.objects.create(
            organization=organization,
            access_point=ap,
            employee=emp,
            raw_mac_address=raw_mac,
            raw_username=raw_user,
            calling_station_id=item.get('calling_station_id', ''),
            nas_ip=item.get('nas_ip_address'),
            session_start=start_dt,
            session_end=end_dt,
            duration_seconds=duration,
            status=status,
            error_message=error
        )
        staged_sessions.append(session)

    # Process valid staged sessions
    processed_count = process_staged_wifi_sessions(staged_sessions)
    return len(staged_sessions), processed_count


@transaction.atomic
def process_staged_wifi_sessions(sessions):
    """
    Consolidates valid pending WiFiSessions into AttendanceEvents and updates AttendanceRecords.
    """
    valid_sessions = [s for s in sessions if s.status == 'PENDING' and s.employee and s.access_point]
    if not valid_sessions:
        return 0

    # Group by (employee, date)
    grouped = {}
    for s in valid_sessions:
        att_date = s.session_start.date()
        key = (s.employee_id, att_date)
        if key not in grouped:
            grouped[key] = []
        grouped[key].append(s)

    processed_count = 0

    for (emp_id, att_date), emp_sessions in grouped.items():
        employee = emp_sessions[0].employee
        org = employee.organization
        shift = get_employee_shift_for_date(employee, att_date)

        record, _ = AttendanceRecord.objects.get_or_create(
            organization=org,
            employee=employee,
            attendance_date=att_date,
            defaults={
                'shift': shift,
                'status': 'ABSENT',
                'source': 'WIFI',
            }
        )

        # Sort sessions chronologically
        emp_sessions.sort(key=lambda s: s.session_start)

        # Flapping filter & event creation
        for s in emp_sessions:
            # Check-in event
            AttendanceEvent.objects.create(
                organization=org,
                attendance_record=record,
                employee=employee,
                event_type='WIFI_ASSOCIATION',
                timestamp=s.session_start,
                source='WIFI',
                access_point=s.access_point,
                metadata={'wifi_session_id': str(s.id)}
            )

            # Check-out event
            AttendanceEvent.objects.create(
                organization=org,
                attendance_record=record,
                employee=employee,
                event_type='WIFI_DISASSOCIATION',
                timestamp=s.session_end,
                source='WIFI',
                access_point=s.access_point,
                metadata={'wifi_session_id': str(s.id)}
            )

            s.status = 'PROCESSED'
            s.save(update_fields=['status', 'updated_at'])
            processed_count += 1

        if not record.is_finalized:
            recalculate_attendance_record(record)

    return processed_count
