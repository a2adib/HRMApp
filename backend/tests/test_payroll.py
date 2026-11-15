import pytest
import datetime
from decimal import Decimal
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

from apps.organizations.models import Organization, Office
from apps.departments.models import Department, Designation
from apps.employees.models import Employee
from apps.accounts.models import User
from apps.attendance.models import AttendanceRecord
from apps.payroll.models import SalaryStructure, PayrollPeriod, Payslip
from apps.payroll.services import calculate_monthly_payroll


@pytest.mark.django_db
class TestPayrollEngine:
    def setup_method(self):
        self.org = Organization.objects.create(name="Payroll Tech", slug="payroll-tech")
        self.office = Office.objects.create(organization=self.org, name="Main Office")
        self.dept = Department.objects.create(organization=self.org, name="Finance")
        self.desig = Designation.objects.create(organization=self.org, department=self.dept, title="Accountant")

        # Admin user
        self.admin_user = User.objects.create_user(
            email="hr@payrolltech.com",
            password="AdminPassword123!",
            organization=self.org,
            role="HR_ADMIN"
        )

        # Employee user
        self.emp_user = User.objects.create_user(
            email="emp@payrolltech.com",
            password="EmpPassword123!",
            organization=self.org,
            role="EMPLOYEE"
        )
        self.emp = Employee.objects.create(
            organization=self.org,
            user=self.emp_user,
            employee_code="EMP-PAY-001",
            first_name="Jane",
            last_name="Doe",
            work_email="emp@payrolltech.com",
            joining_date=datetime.date(2026, 1, 1),
            department=self.dept,
            designation=self.desig,
            office=self.office
        )

        # Set specific salary structure for Jane
        self.salary = SalaryStructure.objects.create(
            organization=self.org,
            employee=self.emp,
            base_salary=Decimal('5000.00'),
            housing_allowance=Decimal('800.00'),
            transport_allowance=Decimal('300.00'),
            medical_allowance=Decimal('200.00'),
            tax_deduction_percentage=Decimal('10.00'),
            provident_fund_percentage=Decimal('5.00')
        )

        self.client = APIClient()

    def test_payroll_calculation_service_with_overtime_and_absence(self):
        year, month = 2026, 10
        # Create attendance records for October 2026:
        # 1 present with 120 minutes overtime
        AttendanceRecord.objects.create(
            organization=self.org,
            employee=self.emp,
            attendance_date=datetime.date(year, month, 5),
            status='PRESENT',
            total_work_minutes=600,
            overtime_minutes=120
        )
        # 2 absent days
        AttendanceRecord.objects.create(
            organization=self.org,
            employee=self.emp,
            attendance_date=datetime.date(year, month, 6),
            status='ABSENT'
        )
        AttendanceRecord.objects.create(
            organization=self.org,
            employee=self.emp,
            attendance_date=datetime.date(year, month, 7),
            status='ABSENT'
        )

        period, payslips = calculate_monthly_payroll(self.org, year, month, processed_by=self.admin_user)

        assert period.status == 'PROCESSED'
        assert len(payslips) == 1
        slip = payslips[0]
        assert slip.employee == self.emp
        assert slip.basic_salary == Decimal('5000.00')
        assert slip.total_allowances == Decimal('1300.00') # 800 + 300 + 200
        assert slip.unpaid_absence_days == Decimal('2.00')
        assert slip.absence_deduction > Decimal('0.00')
        assert slip.overtime_hours == Decimal('2.00')
        assert slip.overtime_pay > Decimal('0.00')
        assert slip.net_salary > Decimal('0.00')
        assert slip.net_salary == slip.gross_earnings - slip.total_deductions

    def test_generate_payroll_api_as_hr_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post('/api/v1/payroll/periods/generate/', {
            "year": 2026,
            "month": 11
        })
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data['period']['year'] == 2026
        assert data['period']['month'] == 11
        assert data['period']['status'] == 'PROCESSED'
        assert data['total_payslips_generated'] == 1

    def test_employee_cannot_generate_payroll_permission(self):
        self.client.force_authenticate(user=self.emp_user)
        response = self.client.post('/api/v1/payroll/periods/generate/', {
            "year": 2026,
            "month": 11
        })
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_employee_my_payslips_endpoint(self):
        # Generate payroll first
        calculate_monthly_payroll(self.org, 2026, 11, processed_by=self.admin_user)

        # Authenticate as employee
        self.client.force_authenticate(user=self.emp_user)
        response = self.client.get('/api/v1/payroll/payslips/my-payslips/')
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) >= 1
        assert data[0]['employee_code'] == 'EMP-PAY-001'
        assert data[0]['period_label'] == '2026-11'
        assert 'net_salary' in data[0]
