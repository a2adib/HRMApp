import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.organizations.models import Organization, AccessPoint
from apps.employees.models import Employee
from apps.shifts.models import Shift
from apps.attendance.models import AttendanceRecord
from apps.wifi_attendance.models import WiFiSession
from apps.wifi_attendance.services import ingest_wifi_event_batch, reconcile_daily_attendance


class Command(BaseCommand):
    help = "Simulates realistic enterprise RADIUS Wi-Fi accounting traffic across various workforce scenarios."

    def add_arguments(self, parser):
        parser.add_argument('--org-slug', type=str, default='acme-global', help='Target organization slug')
        parser.add_argument('--date', type=str, default=None, help='Target date in YYYY-MM-DD (defaults to today)')
        parser.add_argument('--reconcile', action='store_true', help='Trigger nightly reconciliation after simulation')

    def handle(self, *args, **options):
        org_slug = options['org_slug']
        org = Organization.objects.filter(slug=org_slug).first()
        if not org:
            org = Organization.objects.first()

        if not org:
            self.stdout.write(self.style.ERROR("No organization found in database."))
            return

        target_date_str = options['date']
        if target_date_str:
            sim_date = datetime.date.fromisoformat(target_date_str)
        else:
            sim_date = timezone.now().date()

        self.stdout.write(self.style.NOTICE(f"=== Simulating Enterprise Wi-Fi Traffic for {org.name} on {sim_date} ==="))

        # Fetch Access Points
        aps = list(AccessPoint.objects.filter(organization=org, is_active=True))
        if not aps:
            self.stdout.write(self.style.WARNING("No access points found. Simulation creating temporary mock AP."))
            ap_mac = "00:1A:1E:17:F1:80"
        else:
            ap_mac = aps[0].mac_address

        ap_mac_2 = aps[1].mac_address if len(aps) > 1 else "00:1A:1E:17:F1:81"

        # Fetch Employees
        employees = list(Employee.objects.filter(organization=org, employment_status='ACTIVE'))
        if not employees:
            self.stdout.write(self.style.ERROR("No active employees found to simulate."))
            return

        events = []

        # Scenario 1: Punctual Employee (Arrives 08:55 AM, Leaves 06:15 PM)
        emp1 = employees[0]
        emp1_user = emp1.network_username or emp1.work_email
        start_1 = datetime.datetime.combine(sim_date, datetime.time(8, 55, 0))
        end_1 = datetime.datetime.combine(sim_date, datetime.time(18, 15, 0))
        events.append({
            'called_station_id': ap_mac,
            'user_name': emp1_user,
            'calling_station_id': "F4:D4:88:51:2A:91",
            'nas_ip_address': '10.0.1.1',
            'session_start': start_1.isoformat() + "Z",
            'session_end': end_1.isoformat() + "Z",
            'session_duration_seconds': int((end_1 - start_1).total_seconds()),
        })
        self.stdout.write(f"  [Scenario 1] Punctual arrival: {emp1_user} (08:55 - 18:15)")

        # Scenario 2: Late Employee (Arrives 09:35 AM past 15m grace)
        if len(employees) > 1:
            emp2 = employees[1]
            emp2_user = emp2.network_username or emp2.work_email
            start_2 = datetime.datetime.combine(sim_date, datetime.time(9, 35, 0))
            end_2 = datetime.datetime.combine(sim_date, datetime.time(18, 5, 0))
            events.append({
                'called_station_id': ap_mac,
                'user_name': emp2_user,
                'calling_station_id': "F4:D4:88:51:2A:92",
                'nas_ip_address': '10.0.1.1',
                'session_start': start_2.isoformat() + "Z",
                'session_end': end_2.isoformat() + "Z",
                'session_duration_seconds': int((end_2 - start_2).total_seconds()),
            })
            self.stdout.write(f"  [Scenario 2] Late arrival: {emp2_user} (09:35 - 18:05)")

        # Scenario 3: Roaming Device with Flapping (< 3 min gap between AP-1 and AP-2)
        if len(employees) > 2:
            emp3 = employees[2]
            emp3_user = emp3.network_username or emp3.work_email
            # Leg 1: 09:00 - 11:30 at AP 1
            s3_start_a = datetime.datetime.combine(sim_date, datetime.time(9, 0, 0))
            s3_end_a = datetime.datetime.combine(sim_date, datetime.time(11, 30, 0))
            events.append({
                'called_station_id': ap_mac,
                'user_name': emp3_user,
                'calling_station_id': "F4:D4:88:51:2A:93",
                'nas_ip_address': '10.0.1.1',
                'session_start': s3_start_a.isoformat() + "Z",
                'session_end': s3_end_a.isoformat() + "Z",
                'session_duration_seconds': int((s3_end_a - s3_start_a).total_seconds()),
            })

            # Leg 2: 11:32 - 17:30 at AP 2 (2 minute roam gap - should be merged without flapping)
            s3_start_b = datetime.datetime.combine(sim_date, datetime.time(11, 32, 0))
            s3_end_b = datetime.datetime.combine(sim_date, datetime.time(17, 30, 0))
            events.append({
                'called_station_id': ap_mac_2,
                'user_name': emp3_user,
                'calling_station_id': "F4:D4:88:51:2A:93",
                'nas_ip_address': '10.0.1.2',
                'session_start': s3_start_b.isoformat() + "Z",
                'session_end': s3_end_b.isoformat() + "Z",
                'session_duration_seconds': int((s3_end_b - s3_start_b).total_seconds()),
            })
            self.stdout.write(f"  [Scenario 3] Roaming device with flapping: {emp3_user} (AP1 -> AP2 in 2 mins)")

        # Scenario 4: Unknown MAC / Unregistered AP (should be ignored gracefully)
        events.append({
            'called_station_id': "FF:EE:DD:CC:BB:AA",
            'user_name': emp1_user,
            'calling_station_id': "F4:D4:88:51:2A:99",
            'nas_ip_address': '192.168.99.1',
            'session_start': datetime.datetime.combine(sim_date, datetime.time(8, 0, 0)).isoformat() + "Z",
            'session_end': datetime.datetime.combine(sim_date, datetime.time(9, 0, 0)).isoformat() + "Z",
            'session_duration_seconds': 3600,
        })
        self.stdout.write("  [Scenario 4] Unknown Access Point MAC: FF:EE:DD:CC:BB:AA (Expected: IGNORED)")

        # Scenario 5: Unknown User (e.g. guest or contractor)
        events.append({
            'called_station_id': ap_mac,
            'user_name': 'guest-visitor-992',
            'calling_station_id': "A4:B4:C4:D4:E4:F4",
            'nas_ip_address': '10.0.1.1',
            'session_start': datetime.datetime.combine(sim_date, datetime.time(10, 0, 0)).isoformat() + "Z",
            'session_end': datetime.datetime.combine(sim_date, datetime.time(12, 0, 0)).isoformat() + "Z",
            'session_duration_seconds': 7200,
        })
        self.stdout.write("  [Scenario 5] Unknown User: guest-visitor-992 (Expected: IGNORED)")

        # Ingest batch
        received, processed = ingest_wifi_event_batch(org, events)

        self.stdout.write(self.style.SUCCESS(
            f"\nIngestion Complete: {received} raw events received, {processed} valid sessions processed."
        ))

        # Check records
        records = AttendanceRecord.objects.filter(organization=org, attendance_date=sim_date)
        self.stdout.write("\nGenerated Attendance Records:")
        for r in records:
            self.stdout.write(
                f"  - {r.employee.first_name} {r.employee.last_name}: "
                f"Status={r.status}, In={r.first_check_in.strftime('%H:%M') if r.first_check_in else '--'}, "
                f"Out={r.last_check_out.strftime('%H:%M') if r.last_check_out else '--'}, "
                f"Hours={round(r.total_work_minutes / 60.0, 1)}h, Late={r.late_minutes}m, Source={r.source}"
            )

        if options['reconcile']:
            self.stdout.write("\nTriggering nightly reconciliation...")
            reconciled = reconcile_daily_attendance(organization=org, target_date=sim_date)
            self.stdout.write(self.style.SUCCESS(f"Reconciliation finished. {reconciled} employee records evaluated."))
