import datetime
import pytest
from rest_framework.test import APIClient
from apps.organizations.models import Organization, Office
from apps.accounts.models import User
from apps.departments.models import Department, Designation
from apps.employees.models import Employee
from apps.leaves.models import LeaveType, LeaveBalance, LeaveRequest
from apps.leaves.services import apply_leave, approve_leave_request, reject_leave_request
from apps.attendance.models import AttendanceRecord


@pytest.mark.django_db
class TestLeaveManagement:
    def setup_method(self):
        self.client = APIClient()
        self.org = Organization.objects.create(name='Leave Org', slug='leave-org')
        self.office = Office.objects.create(organization=self.org, name='HQ')
        self.dept = Department.objects.create(organization=self.org, name='Design', code='DES')
        self.des = Designation.objects.create(organization=self.org, department=self.dept, title='Designer', code='DES')

        self.hr_user = User.objects.create_user(
            email='hr@leave.com',
            password='Password123!',
            organization=self.org,
            role='HR_ADMIN'
        )

        self.emp_user = User.objects.create_user(
            email='emp@leave.com',
            password='Password123!',
            organization=self.org,
            role='EMPLOYEE'
        )

        self.employee = Employee.objects.create(
            organization=self.org,
            user=self.emp_user,
            employee_code='LEAVE-EMP-01',
            first_name='Alice',
            last_name='Wonder',
            work_email='emp@leave.com',
            joining_date=datetime.date(2024, 1, 1),
            department=self.dept,
            designation=self.des,
            office=self.office
        )

        self.leave_type = LeaveType.objects.create(
            organization=self.org,
            name='Annual Leave',
            code='AL',
            default_quota_days=15.0
        )

        self.balance = LeaveBalance.objects.create(
            organization=self.org,
            employee=self.employee,
            leave_type=self.leave_type,
            year=2026,
            allocated_days=15.0,
            remaining_days=15.0,
            used_days=0.0,
            pending_days=0.0
        )

    def test_apply_leave_reserves_pending_balance(self):
        start = datetime.date(2026, 11, 23)  # Monday
        end = datetime.date(2026, 11, 25)    # Wednesday (3 business days)

        req = apply_leave(
            employee=self.employee,
            leave_type=self.leave_type,
            start_date=start,
            end_date=end,
            reason='Family trip'
        )

        self.balance.refresh_from_db()
        assert req.status == 'PENDING'
        assert req.total_days == 3.0
        assert self.balance.pending_days == 3.0
        assert self.balance.remaining_days == 12.0

    def test_approve_leave_deducts_balance_and_updates_attendance(self):
        start = datetime.date(2026, 11, 23)
        end = datetime.date(2026, 11, 24)  # 2 days

        req = apply_leave(
            employee=self.employee,
            leave_type=self.leave_type,
            start_date=start,
            end_date=end,
            reason='Personal reasons'
        )

        approve_leave_request(req, self.hr_user, review_notes='Approved!')
        req.refresh_from_db()
        self.balance.refresh_from_db()

        assert req.status == 'APPROVED'
        assert self.balance.used_days == 2.0
        assert self.balance.pending_days == 0.0

        # Verify AttendanceRecord created with status ON_LEAVE
        att_rec = AttendanceRecord.objects.filter(
            employee=self.employee,
            attendance_date=start
        ).first()
        assert att_rec is not None
        assert att_rec.status == 'ON_LEAVE'
        assert att_rec.is_finalized is True

    def test_reject_leave_restores_balance(self):
        start = datetime.date(2026, 11, 23)
        end = datetime.date(2026, 11, 24)

        req = apply_leave(
            employee=self.employee,
            leave_type=self.leave_type,
            start_date=start,
            end_date=end,
            reason='Emergency'
        )

        reject_leave_request(req, self.hr_user, review_notes='Team understaffed')
        req.refresh_from_db()
        self.balance.refresh_from_db()

        assert req.status == 'REJECTED'
        assert self.balance.used_days == 0.0
        assert self.balance.pending_days == 0.0
        assert self.balance.remaining_days == 15.0
