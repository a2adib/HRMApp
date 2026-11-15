import re
import datetime
from django.utils import timezone
from django.db import transaction, models
from django.utils.dateparse import parse_datetime
from .models import WiFiSession
from apps.organizations.models import AccessPoint, Organization
from apps.employees.models import Employee
from apps.attendance.models import AttendanceRecord, AttendanceEvent
from apps.attendance.services import get_employee_shift_for_date, recalculate_attendance_record
from apps.holidays.models import Holiday
from apps.leaves.models import LeaveRequest


def normalize_mac(mac):
    """
    Normalizes any MAC address format to standard upper-case colon-separated format (AA:BB:CC:DD:EE:FF).
    Supports:
      - 00:1A:1E:17:F1:80
      - 00-1A-1E-17-F1-80
      - 001a.1e17.f180 (Cisco notation)
      - 001A1E17F180 (Raw hex)
    """
    if not mac:
        return ""
    clean = re.sub(r'[^a-fA-F0-9]', '', str(mac)).upper()
    if len(clean) == 12:
        return ':'.join(clean[i:i+2] for i in range(0, 12, 2))
    return str(mac).strip().upper()


def consolidate_wifi_sessions(emp_sessions, flapping_threshold_seconds=300):
    """
    Applies network flapping suppression and roaming consolidation to a list of WiFiSessions.
    If session B starts within flapping_threshold_seconds of session A ending,
    they are merged into a continuous presence block.
    """
    if not emp_sessions:
        return []

    # Sort strictly by session start time
    sorted_sessions = sorted(emp_sessions, key=lambda s: s.session_start)

    blocks = []
    current_block = None

    for s in sorted_sessions:
        if current_block is None:
            current_block = {
                'start': s.session_start,
                'end': s.session_end,
                'first_ap': s.access_point,
                'last_ap': s.access_point,
                'sessions': [s]
            }
        else:
            # Check gap between current block end and next session start
            gap = (s.session_start - current_block['end']).total_seconds()

            # If overlapping or within flapping threshold
            if gap <= flapping_threshold_seconds:
                # Extend block end if this session ends later
                if s.session_end > current_block['end']:
                    current_block['end'] = s.session_end
                    current_block['last_ap'] = s.access_point
                current_block['sessions'].append(s)
            else:
                blocks.append(current_block)
                current_block = {
                    'start': s.session_start,
                    'end': s.session_end,
                    'first_ap': s.access_point,
                    'last_ap': s.access_point,
                    'sessions': [s]
                }

    if current_block:
        blocks.append(current_block)

    return blocks


@transaction.atomic
def ingest_wifi_event_batch(organization, events_data):
    """
    Ingests a raw batch of RADIUS accounting sessions, stages them into WiFiSession,
    and triggers the consolidation and attendance pipeline.
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

        # Lookup AP within organization
        if raw_mac not in ap_cache:
            ap_cache[raw_mac] = AccessPoint.objects.filter(
                organization=organization,
                mac_address=raw_mac,
                is_active=True
            ).first()
        ap = ap_cache[raw_mac]

        # Lookup Employee by network_username or work email
        if raw_user not in emp_cache:
            # Match either network_username or email prefix
            emp = Employee.objects.filter(
                organization=organization,
                network_username__iexact=raw_user,
                employment_status='ACTIVE'
            ).first()

            if not emp and '@' in raw_user:
                emp = Employee.objects.filter(
                    organization=organization,
                    work_email__iexact=raw_user,
                    employment_status='ACTIVE'
                ).first()

            emp_cache[raw_user] = emp

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
            calling_station_id=normalize_mac(item.get('calling_station_id', '')),
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
def process_staged_wifi_sessions(sessions, flapping_threshold_minutes=5):
    """
    Consolidates valid pending WiFiSessions using flapping suppression,
    creates unified AttendanceEvents, and recalculates AttendanceRecords.
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
    threshold_seconds = flapping_threshold_minutes * 60

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

        # Apply continuous roaming & flapping suppression
        consolidated_blocks = consolidate_wifi_sessions(emp_sessions, threshold_seconds)

        for block in consolidated_blocks:
            # Check-in association event for block start
            AttendanceEvent.objects.create(
                organization=org,
                attendance_record=record,
                employee=employee,
                event_type='WIFI_ASSOCIATION',
                timestamp=block['start'],
                source='WIFI',
                access_point=block['first_ap'],
                metadata={
                    'session_count': len(block['sessions']),
                    'consolidated_roaming': True,
                    'wifi_session_ids': [str(s.id) for s in block['sessions']]
                }
            )

            # Check-out disassociation event for block end
            AttendanceEvent.objects.create(
                organization=org,
                attendance_record=record,
                employee=employee,
                event_type='WIFI_DISASSOCIATION',
                timestamp=block['end'],
                source='WIFI',
                access_point=block['last_ap'],
                metadata={
                    'session_count': len(block['sessions']),
                    'consolidated_roaming': True,
                    'wifi_session_ids': [str(s.id) for s in block['sessions']]
                }
            )

            # Mark all constituent sessions as PROCESSED
            for s in block['sessions']:
                s.status = 'PROCESSED'
                s.save(update_fields=['status', 'updated_at'])
                processed_count += 1

        # Recalculate record unless locked by admin correction
        if not record.is_finalized:
            recalculate_attendance_record(record)

    return processed_count


@transaction.atomic
def reconcile_daily_attendance(organization=None, target_date=None):
    """
    Nightly reconciliation engine.
    1. Processes any remaining pending WiFiSessions for target_date.
    2. For every active employee, ensures an AttendanceRecord exists.
    3. If employee was absent, evaluates whether target_date is a Holiday, Weekend, or Approved Leave.
    4. Auto-closes unclosed open sessions.
    """
    if target_date is None:
        target_date = timezone.now().date() - datetime.timedelta(days=1)

    orgs = [organization] if organization else Organization.objects.filter(is_active=True)
    total_reconciled = 0

    for org in orgs:
        # 1. Process pending sessions
        pending_sessions = WiFiSession.objects.filter(
            organization=org,
            status='PENDING',
            session_start__date=target_date
        )
        if pending_sessions.exists():
            process_staged_wifi_sessions(list(pending_sessions))

        # 2. Iterate all active employees
        active_employees = Employee.objects.filter(
            organization=org,
            employment_status='ACTIVE'
        ).select_related('user')

        for emp in active_employees:
            record = AttendanceRecord.objects.filter(
                organization=org,
                employee=emp,
                attendance_date=target_date
            ).first()

            shift = get_employee_shift_for_date(emp, target_date)

            if not record:
                # Check Holiday
                is_holiday = Holiday.objects.filter(
                    organization=org,
                    holiday_date=target_date
                ).first()

                # Check Leave
                approved_leave = LeaveRequest.objects.filter(
                    organization=org,
                    employee=emp,
                    status='APPROVED',
                    start_date__lte=target_date,
                    end_date__gte=target_date
                ).first()

                if is_holiday:
                    initial_status = 'HOLIDAY'
                    notes = f"Public Holiday: {is_holiday.name}"
                elif approved_leave:
                    initial_status = 'ON_LEAVE'
                    notes = f"Approved Leave: {approved_leave.leave_type.name}"
                elif target_date.weekday() in [5, 6]:  # Saturday, Sunday
                    initial_status = 'WEEKEND'
                    notes = "Scheduled Weekend Rest"
                else:
                    initial_status = 'ABSENT'
                    notes = "No punch or Wi-Fi session recorded"

                record = AttendanceRecord.objects.create(
                    organization=org,
                    employee=emp,
                    attendance_date=target_date,
                    shift=shift,
                    status=initial_status,
                    source='SYSTEM',
                    notes=notes,
                    is_finalized=True
                )
            else:
                # Auto-close open sessions if employee checked in but never checked out
                if record.first_check_in and not record.last_check_out and shift:
                    tz = timezone.get_current_timezone()
                    shift_end_dt = timezone.make_aware(
                        datetime.datetime.combine(target_date, shift.end_time), tz
                    )
                    record.last_check_out = shift_end_dt
                    record.notes = (record.notes or "") + " [Auto-closed missing check-out at shift end]"
                    recalculate_attendance_record(record)

                record.is_finalized = True
                record.save(update_fields=['is_finalized', 'last_check_out', 'notes'])

            total_reconciled += 1

    return total_reconciled
