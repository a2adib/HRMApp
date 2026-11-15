import datetime
import pytest
from django.utils import timezone
from rest_framework.test import APIClient
from apps.organizations.models import Organization, Office, AccessPoint
from apps.accounts.models import User
from apps.departments.models import Department, Designation
from apps.employees.models import Employee
from apps.shifts.models import Shift
from apps.attendance.models import AttendanceRecord, AttendanceEvent
from apps.wifi_attendance.models import WiFiSession
from apps.wifi_attendance.services import (
    normalize_mac,
    consolidate_wifi_sessions,
    ingest_wifi_event_batch,
    reconcile_daily_attendance,
)
from apps.wifi_attendance.tasks import (
    process_pending_wifi_sessions_task,
    nightly_attendance_reconciliation_task,
)


@pytest.mark.django_db
class TestWiFiIntegration:
    def setup_method(self):
        self.client = APIClient()
        self.org = Organization.objects.create(name='WiFi Org', slug='wifi-org')
        self.office = Office.objects.create(organization=self.org, name='Tech Center')
        self.dept = Department.objects.create(organization=self.org, name='R&D', code='RD')
        self.des = Designation.objects.create(organization=self.org, department=self.dept, title='Dev', code='DEV')

        self.user = User.objects.create_user(
            email='wifi.user@acme.com',
            password='Password123!',
            organization=self.org,
            role='EMPLOYEE'
        )

        self.employee = Employee.objects.create(
            organization=self.org,
            user=self.user,
            employee_code='WIFI-EMP-01',
            first_name='Network',
            last_name='Tester',
            work_email='wifi.user@acme.com',
            joining_date='2024-01-01',
            department=self.dept,
            designation=self.des,
            office=self.office,
            network_username='nettester'
        )

        self.ap = AccessPoint.objects.create(
            organization=self.org,
            office=self.office,
            name='AP-Floor-1',
            mac_address='00:1A:1E:17:F1:99'
        )

        self.ap2 = AccessPoint.objects.create(
            organization=self.org,
            office=self.office,
            name='AP-Floor-2',
            mac_address='00:1A:1E:17:F1:98'
        )

        self.shift = Shift.objects.create(
            organization=self.org,
            name='Default Shift',
            code='DEF',
            start_time='09:00:00',
            end_time='18:00:00',
            grace_period_minutes=15,
            break_duration_minutes=60
        )

    def test_normalize_mac_formats(self):
        expected = "00:1A:1E:17:F1:80"
        assert normalize_mac("00:1A:1E:17:F1:80") == expected
        assert normalize_mac("00-1A-1E-17-F1-80") == expected
        assert normalize_mac("001a.1e17.f180") == expected
        assert normalize_mac("001A1E17F180") == expected
        assert normalize_mac("") == ""

    def test_internal_wifi_events_unauthorized_without_token(self):
        response = self.client.post('/api/v1/internal/wifi-events/', {
            'organization_id': str(self.org.id),
            'events': []
        })
        assert response.status_code == 403

    def test_internal_wifi_events_ingestion_and_attendance_generation(self):
        token = 'hrm-internal-service-token-wifi-collector-2026'
        payload = {
            'organization_id': str(self.org.id),
            'batch_id': 'batch-001',
            'events': [
                {
                    'called_station_id': '00:1A:1E:17:F1:99',
                    'user_name': 'nettester',
                    'calling_station_id': 'A1:B2:C3:D4:E5:F6',
                    'session_start': '2026-11-15T08:50:00Z',
                    'session_end': '2026-11-15T17:30:00Z',
                    'session_duration_seconds': 31200
                }
            ]
        }

        response = self.client.post(
            '/api/v1/internal/wifi-events/',
            payload,
            format='json',
            HTTP_X_SERVICE_TOKEN=token
        )
        assert response.status_code == 202
        assert response.data['status'] == 'ACCEPTED'
        assert response.data['events_received'] == 1
        assert response.data['events_processed'] == 1

        # Verify WiFiSession created
        session = WiFiSession.objects.filter(employee=self.employee).first()
        assert session is not None
        assert session.status == 'PROCESSED'

        # Verify AttendanceRecord created with source=WIFI
        record = AttendanceRecord.objects.filter(employee=self.employee).first()
        assert record is not None
        assert record.source == 'WIFI'
        assert record.status == 'PRESENT'

    def test_flapping_suppression_and_roaming(self):
        """
        Tests that two WiFi sessions 2 minutes apart across two APs
        are merged into a continuous presence block without creating extra flapping events.
        """
        now = timezone.now()
        leg1_start = now.replace(hour=9, minute=0, second=0, microsecond=0)
        leg1_end = now.replace(hour=11, minute=30, second=0, microsecond=0)
        # Leg 2 begins 2 minutes later at AP-Floor-2
        leg2_start = now.replace(hour=11, minute=32, second=0, microsecond=0)
        leg2_end = now.replace(hour=17, minute=0, second=0, microsecond=0)

        events = [
            {
                'called_station_id': self.ap.mac_address,
                'user_name': 'nettester',
                'calling_station_id': 'A1:B2:C3:D4:E5:F6',
                'session_start': leg1_start.isoformat(),
                'session_end': leg1_end.isoformat(),
                'session_duration_seconds': 9000
            },
            {
                'called_station_id': self.ap2.mac_address,
                'user_name': 'nettester',
                'calling_station_id': 'A1:B2:C3:D4:E5:F6',
                'session_start': leg2_start.isoformat(),
                'session_end': leg2_end.isoformat(),
                'session_duration_seconds': 19680
            }
        ]

        received, processed = ingest_wifi_event_batch(self.org, events)
        assert received == 2
        assert processed == 2

        # Verify attendance record covers whole interval
        record = AttendanceRecord.objects.get(employee=self.employee, attendance_date=now.date())
        assert record.first_check_in == leg1_start
        assert record.last_check_out == leg2_end
        assert record.status == 'PRESENT'

        # Only 2 events created (1 unified association, 1 unified disassociation)
        # instead of 4 fragmented events
        events_count = AttendanceEvent.objects.filter(attendance_record=record).count()
        assert events_count == 2

    def test_late_arrival_beyond_grace_period(self):
        """
        Shift starts at 09:00 with 15m grace. Arrival at 09:35 should be flagged LATE (35m late).
        """
        target_date = datetime.date(2026, 11, 16)
        tz = timezone.get_current_timezone()
        start = timezone.make_aware(datetime.datetime.combine(target_date, datetime.time(9, 35, 0)), tz)
        end = timezone.make_aware(datetime.datetime.combine(target_date, datetime.time(18, 5, 0)), tz)

        events = [
            {
                'called_station_id': self.ap.mac_address,
                'user_name': 'nettester',
                'calling_station_id': 'A1:B2:C3:D4:E5:F6',
                'session_start': start.isoformat(),
                'session_end': end.isoformat(),
                'session_duration_seconds': int((end - start).total_seconds())
            }
        ]

        ingest_wifi_event_batch(self.org, events)
        record = AttendanceRecord.objects.get(employee=self.employee, attendance_date=target_date)
        assert record.status == 'LATE'
        assert record.late_minutes == 35

    def test_unregistered_ap_and_unknown_user_handling(self):
        now = timezone.now()
        events = [
            {
                'called_station_id': 'FF:FF:FF:FF:FF:FF',  # Unknown AP
                'user_name': 'nettester',
                'session_start': now.isoformat(),
                'session_end': (now + datetime.timedelta(hours=1)).isoformat(),
                'session_duration_seconds': 3600
            },
            {
                'called_station_id': self.ap.mac_address,
                'user_name': 'nonexistent-user-999',  # Unknown User
                'session_start': now.isoformat(),
                'session_end': (now + datetime.timedelta(hours=1)).isoformat(),
                'session_duration_seconds': 3600
            }
        ]

        received, processed = ingest_wifi_event_batch(self.org, events)
        assert received == 2
        assert processed == 0  # Neither processed into attendance

        ignored = WiFiSession.objects.filter(status='IGNORED')
        assert ignored.count() == 2

    def test_nightly_reconciliation_and_celery_task(self):
        target_date = datetime.date(2026, 11, 13)  # Friday (weekday)
        reconciled = nightly_attendance_reconciliation_task(target_date_str=target_date.isoformat())
        assert reconciled >= 1

        record = AttendanceRecord.objects.get(employee=self.employee, attendance_date=target_date)
        assert record.status == 'ABSENT'
        assert record.is_finalized is True
