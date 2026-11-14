import pytest
from rest_framework.test import APIClient
from apps.organizations.models import Organization, Office, AccessPoint
from apps.accounts.models import User
from apps.departments.models import Department, Designation
from apps.employees.models import Employee
from apps.shifts.models import Shift
from apps.attendance.models import AttendanceRecord
from apps.wifi_attendance.models import WiFiSession


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

        self.shift = Shift.objects.create(
            organization=self.org,
            name='Default Shift',
            code='DEF',
            start_time='09:00:00',
            end_time='18:00:00'
        )

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
