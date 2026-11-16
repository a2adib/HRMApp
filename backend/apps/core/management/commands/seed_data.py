import datetime
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction

from apps.organizations.models import Organization, Office, AccessPoint
from apps.accounts.models import User
from apps.departments.models import Department, Designation
from apps.employees.models import Employee
from apps.shifts.models import Shift, EmployeeShift
from apps.holidays.models import Holiday
from apps.leaves.models import LeaveType, LeaveBalance, LeaveRequest
from apps.attendance.models import AttendanceRecord, AttendanceEvent
from apps.wifi_attendance.models import WiFiSession
from apps.notifications.models import Notification, Announcement
from apps.payroll.models import SalaryStructure, PayrollPeriod, Payslip


class Command(BaseCommand):
    help = 'Cleans all fake/legacy data and seeds Govaly enterprise workspace'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clean',
            action='store_true',
            default=True,
            help='Delete all existing data before seeding Govaly'
        )

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Cleaning legacy/fake data and initializing Govaly workspace...'))

        # 1. Complete wipe of old demo data
        if options.get('clean', True):
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("TRUNCATE TABLE organizations CASCADE;")
            self.stdout.write(self.style.SUCCESS('Purged all legacy records.'))

        # 2. Organization: Govaly
        govaly = Organization.objects.create(
            name='Govaly',
            slug='govaly',
            domain='govaly.com',
            timezone='Asia/Dhaka',
            is_active=True
        )

        # 3. Office: Govaly HQ
        office = Office.objects.create(
            organization=govaly,
            name='Govaly Headquarters',
            address='House 42, Road 11, Banani, Dhaka, Bangladesh',
            latitude=Decimal('23.793700'),
            longitude=Decimal('90.406600'),
            radius_meters=300,
            geofence_radius_meters=300,
            timezone='Asia/Dhaka',
            is_active=True
        )

        # 4. Access Points for Wi-Fi Tracking
        ap_tech = AccessPoint.objects.create(
            organization=govaly,
            office=office,
            name='AP-GOVALY-TECH-01',
            mac_address='00:1A:1E:17:F1:80',
            ip_address='10.10.1.10',
            location_description='Technology & Engineering Wing',
            is_active=True
        )
        ap_exec = AccessPoint.objects.create(
            organization=govaly,
            office=office,
            name='AP-GOVALY-EXEC-02',
            mac_address='00:1A:1E:17:F1:81',
            ip_address='10.10.1.11',
            location_description='Executive & People Operations Wing',
            is_active=True
        )

        # 5. Departments
        dept_exec = Department.objects.create(
            organization=govaly,
            name='Executive Leadership',
            code='EXEC'
        )
        dept_hr = Department.objects.create(
            organization=govaly,
            name='Human Resources',
            code='HR'
        )
        dept_tech = Department.objects.create(
            organization=govaly,
            name='Technology & Engineering',
            code='TECH'
        )

        # 6. Designations
        desig_ceo = Designation.objects.create(
            organization=govaly,
            department=dept_exec,
            title='Chief Executive Officer',
            code='CEO'
        )
        desig_hr = Designation.objects.create(
            organization=govaly,
            department=dept_hr,
            title='HR Administrator',
            code='HR-ADMIN'
        )
        desig_lead = Designation.objects.create(
            organization=govaly,
            department=dept_tech,
            title='Tech Team Lead',
            code='TECH-LEAD'
        )
        desig_swe = Designation.objects.create(
            organization=govaly,
            department=dept_tech,
            title='Software Engineer',
            code='SWE'
        )

        # 7. Shift
        shift = Shift.objects.create(
            organization=govaly,
            name='Standard Enterprise Shift',
            code='STANDARD',
            start_time=datetime.time(9, 0),
            end_time=datetime.time(18, 0),
            grace_period_minutes=15,
            break_duration_minutes=60,
            half_day_threshold_minutes=240
        )

        # 8. Leave Types
        lt_annual = LeaveType.objects.create(
            organization=govaly,
            name='Annual Leave',
            code='ANNUAL',
            default_quota_days=Decimal('15.0'),
            is_paid=True
        )
        lt_casual = LeaveType.objects.create(
            organization=govaly,
            name='Casual Leave',
            code='CASUAL',
            default_quota_days=Decimal('10.0'),
            is_paid=True
        )
        lt_sick = LeaveType.objects.create(
            organization=govaly,
            name='Sick Leave',
            code='SICK',
            default_quota_days=Decimal('10.0'),
            is_paid=True
        )

        today = timezone.localdate()
        joining_date = datetime.date(2025, 1, 1)

        # 9. Create Users and Employees
        # User 1: Adib (CEO)
        user_adib = User.objects.create_user(
            email='adib@govaly.com',
            password='Pass@1234!',
            organization=govaly,
            role='SUPER_ADMIN',
            is_staff=True,
            is_superuser=True
        )
        emp_adib = Employee.objects.create(
            organization=govaly,
            user=user_adib,
            employee_code='GV-001',
            first_name='Adib',
            last_name='(CEO)',
            work_email='adib@govaly.com',
            phone_number='+8801700000001',
            joining_date=joining_date,
            department=dept_exec,
            designation=desig_ceo,
            office=office,
            manager=None,
            network_username='adib',
            employment_status='ACTIVE'
        )
        SalaryStructure.objects.create(
            organization=govaly,
            employee=emp_adib,
            base_salary=Decimal('15000.00'),
            housing_allowance=Decimal('2500.00'),
            transport_allowance=Decimal('1000.00'),
            medical_allowance=Decimal('1000.00'),
            tax_deduction_percentage=Decimal('10.00'),
            provident_fund_percentage=Decimal('5.00')
        )

        # User 2: Tech (HR Admin)
        user_tech = User.objects.create_user(
            email='tech@govaly.com',
            password='Pass@1234!',
            organization=govaly,
            role='HR_ADMIN',
            is_staff=True
        )
        emp_tech = Employee.objects.create(
            organization=govaly,
            user=user_tech,
            employee_code='GV-002',
            first_name='Tech',
            last_name='HR',
            work_email='tech@govaly.com',
            phone_number='+8801700000002',
            joining_date=joining_date,
            department=dept_hr,
            designation=desig_hr,
            office=office,
            manager=emp_adib,
            network_username='tech',
            employment_status='ACTIVE'
        )
        SalaryStructure.objects.create(
            organization=govaly,
            employee=emp_tech,
            base_salary=Decimal('6500.00'),
            housing_allowance=Decimal('1000.00'),
            transport_allowance=Decimal('500.00'),
            medical_allowance=Decimal('500.00'),
            tax_deduction_percentage=Decimal('5.00'),
            provident_fund_percentage=Decimal('3.00')
        )

        # User 3: Fahim (Tech Team Lead)
        user_fahim = User.objects.create_user(
            email='fahim@govaly.com',
            password='Pass@1234!',
            organization=govaly,
            role='MANAGER'
        )
        emp_fahim = Employee.objects.create(
            organization=govaly,
            user=user_fahim,
            employee_code='GV-003',
            first_name='Fahim',
            last_name='(Lead)',
            work_email='fahim@govaly.com',
            phone_number='+8801700000003',
            joining_date=joining_date,
            department=dept_tech,
            designation=desig_lead,
            office=office,
            manager=emp_adib,
            network_username='fahim',
            employment_status='ACTIVE'
        )
        SalaryStructure.objects.create(
            organization=govaly,
            employee=emp_fahim,
            base_salary=Decimal('8500.00'),
            housing_allowance=Decimal('1500.00'),
            transport_allowance=Decimal('800.00'),
            medical_allowance=Decimal('600.00'),
            tax_deduction_percentage=Decimal('7.00'),
            provident_fund_percentage=Decimal('4.00')
        )

        # User 4: Abrar (Tech Team Member)
        user_abrar = User.objects.create_user(
            email='abrar@govaly.com',
            password='Pass@1234!',
            organization=govaly,
            role='EMPLOYEE'
        )
        emp_abrar = Employee.objects.create(
            organization=govaly,
            user=user_abrar,
            employee_code='GV-004',
            first_name='Abrar',
            last_name='(Engineer)',
            work_email='abrar@govaly.com',
            phone_number='+8801700000004',
            joining_date=joining_date,
            department=dept_tech,
            designation=desig_swe,
            office=office,
            manager=emp_fahim,
            network_username='abrar',
            employment_status='ACTIVE'
        )
        SalaryStructure.objects.create(
            organization=govaly,
            employee=emp_abrar,
            base_salary=Decimal('5500.00'),
            housing_allowance=Decimal('1000.00'),
            transport_allowance=Decimal('500.00'),
            medical_allowance=Decimal('400.00'),
            tax_deduction_percentage=Decimal('5.00'),
            provident_fund_percentage=Decimal('3.00')
        )

        # Assign shifts and leave balances
        for emp in [emp_adib, emp_tech, emp_fahim, emp_abrar]:
            EmployeeShift.objects.create(
                organization=govaly,
                employee=emp,
                shift=shift,
                start_date=joining_date,
                is_active=True
            )
            for lt in [lt_annual, lt_casual, lt_sick]:
                LeaveBalance.objects.create(
                    organization=govaly,
                    employee=emp,
                    leave_type=lt,
                    year=today.year,
                    allocated_days=lt.default_quota_days,
                    used_days=Decimal('0.00'),
                    pending_days=Decimal('0.00'),
                    remaining_days=lt.default_quota_days
                )

        # 10. Sample Attendance for the current date & recent days
        for day_offset in range(5, -1, -1):
            rec_date = today - datetime.timedelta(days=day_offset)
            if rec_date.weekday() < 5:  # Monday - Friday
                for emp in [emp_adib, emp_tech, emp_fahim, emp_abrar]:
                    checkin_dt = timezone.make_aware(datetime.datetime.combine(rec_date, datetime.time(9, 5)))
                    checkout_dt = timezone.make_aware(datetime.datetime.combine(rec_date, datetime.time(18, 10)))
                    rec, _ = AttendanceRecord.objects.get_or_create(
                        organization=govaly,
                        employee=emp,
                        attendance_date=rec_date,
                        defaults={
                            'shift': shift,
                            'first_check_in': checkin_dt,
                            'last_check_out': checkout_dt,
                            'total_work_minutes': 485,
                            'late_minutes': 0,
                            'overtime_minutes': 10,
                            'status': 'PRESENT',
                            'source': 'WIFI'
                        }
                    )
                    AttendanceEvent.objects.create(
                        organization=govaly,
                        attendance_record=rec,
                        employee=emp,
                        event_type='CHECK_IN',
                        timestamp=checkin_dt,
                        source='WIFI',
                        access_point=ap_tech if emp in [emp_fahim, emp_abrar] else ap_exec
                    )
                    AttendanceEvent.objects.create(
                        organization=govaly,
                        attendance_record=rec,
                        employee=emp,
                        event_type='CHECK_OUT',
                        timestamp=checkout_dt,
                        source='WIFI',
                        access_point=ap_tech if emp in [emp_fahim, emp_abrar] else ap_exec
                    )

        # 11. Welcome Announcement
        Announcement.objects.create(
            organization=govaly,
            published_by=user_adib,
            title='Welcome to Govaly Enterprise HRM Platform',
            content='Govaly HRM Platform is officially live with Automated Wi-Fi Tracking, Hybrid GPS Geofencing, and Monthly Payroll.',
            is_pinned=True
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded Govaly workspace!'))
        self.stdout.write(self.style.NOTICE('--------------------------------------------------'))
        self.stdout.write(self.style.NOTICE('1. CEO:             adib@govaly.com   | Pass: Pass@1234!'))
        self.stdout.write(self.style.NOTICE('2. HR Admin:        tech@govaly.com   | Pass: Pass@1234!'))
        self.stdout.write(self.style.NOTICE('3. Tech Team Lead:  fahim@govaly.com  | Pass: Pass@1234!'))
        self.stdout.write(self.style.NOTICE('4. Tech Member:     abrar@govaly.com  | Pass: Pass@1234!'))
        self.stdout.write(self.style.NOTICE('--------------------------------------------------'))
