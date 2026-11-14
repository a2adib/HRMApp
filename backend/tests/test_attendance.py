import datetime
import pytest
from django.utils import timezone
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.organizations.models import Organization, Office
from apps.departments.models import Department, Designation
from apps.employees.models import Employee
from apps.shifts.models import Shift
from apps.attendance.models import AttendanceRecord
from apps.attendance.services import record_punch


@pytest.mark.django_db
class TestAttendanceEngine:
    def setup_method(self):
        self.client = APIClient()
        self.org = Organization.objects.create(name='Attendance Org', slug='att-org')
        self.office = Office.objects.create(organization=self.org, name='Main HQ')
        self.dept = Department.objects.create(organization=self.org, name='Tech', code='TECH')
        self.des = Designation.objects.create(organization=self.org, department=self.dept, title='Dev', code='DEV')

        self.user = User.objects.create_user(
            email='att.emp@acme.com',
            password='Password123!',
            organization=self.org,
            role='EMPLOYEE'
        )

        self.employee = Employee.objects.create(
            organization=self.org,
            user=self.user,
            employee_code='EMP-ATT-01',
            first_name='John',
            last_name='Doe',
            work_email='att.emp@acme.com',
            joining_date=datetime.date(2024, 1, 1),
            department=self.dept,
            designation=self.des,
            office=self.office,
            network_username='jdoe'
        )

        self.shift = Shift.objects.create(
            organization=self.org,
            name='Standard 9 to 6',
            code='S96',
            start_time=datetime.time(9, 0),
            end_time=datetime.time(18, 0),
            break_duration_minutes=60,
            grace_period_minutes=15,
            half_day_threshold_minutes=240,
            full_day_threshold_minutes=420
        )

    def test_punctual_check_in(self):
        # 08:55 AM check-in
        tz = timezone.get_current_timezone()
        dt = timezone.make_aware(datetime.datetime(2026, 11, 15, 8, 55), tz)
        record, event = record_punch(self.employee, 'CHECK_IN', timestamp=dt, source='MANUAL')

        assert record.status == 'PRESENT'
        assert record.late_minutes == 0

    def test_late_check_in_after_grace_period(self):
        # 09:25 AM check-in (grace ends at 09:15)
        tz = timezone.get_current_timezone()
        dt = timezone.make_aware(datetime.datetime(2026, 11, 15, 9, 25), tz)
        record, event = record_punch(self.employee, 'CHECK_IN', timestamp=dt, source='MANUAL')

        assert record.status == 'LATE'
        assert record.late_minutes == 25

    def test_full_day_work_duration_and_break_deduction(self):
        # In at 09:00, Out at 18:00 (9 hours total = 540m - 60m break = 480m work)
        tz = timezone.get_current_timezone()
        in_dt = timezone.make_aware(datetime.datetime(2026, 11, 15, 9, 0), tz)
        out_dt = timezone.make_aware(datetime.datetime(2026, 11, 15, 18, 0), tz)

        record_punch(self.employee, 'CHECK_IN', timestamp=in_dt)
        record, _ = record_punch(self.employee, 'CHECK_OUT', timestamp=out_dt)

        assert record.total_work_minutes == 480
        assert record.late_minutes == 0
        assert record.status == 'PRESENT'

    def test_mobile_check_in_api(self):
        login_res = self.client.post('/api/v1/auth/login/', {
            'email': 'att.emp@acme.com',
            'password': 'Password123!'
        })
        token = login_res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.post('/api/v1/attendance/check-in/', {
            'latitude': 30.267,
            'longitude': -97.743,
            'device_info': 'iPhone 15 Pro'
        })
        assert response.status_code == 201
        assert response.data['detail'] == 'Check-in successful.'
