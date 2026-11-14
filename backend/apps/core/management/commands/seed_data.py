import datetime
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


class Command(BaseCommand):
    help = 'Seeds realistic enterprise demo data for HRM platform'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting enterprise HRM data seeding...'))

        # 1. Organizations
        acme, _ = Organization.objects.get_or_create(
            slug='acme-global',
            defaults={
                'name': 'Acme Global Technologies',
                'domain': 'acme-corp.com',
                'timezone': 'America/New_York',
                'logo_url': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
            }
        )

        beta, _ = Organization.objects.get_or_create(
            slug='beta-innovations',
            defaults={
                'name': 'Beta Innovations Ltd',
                'domain': 'beta-innovations.com',
                'timezone': 'Europe/London',
            }
        )

        # 2. Offices
        hq_office, _ = Office.objects.get_or_create(
            organization=acme,
            name='Austin HQ Campus',
            defaults={
                'address': '500 W 2nd St, Austin, TX 78701',
                'latitude': 30.267153,
                'longitude': -97.743057,
                'radius_meters': 200,
                'timezone': 'America/Chicago',
            }
        )

        ny_office, _ = Office.objects.get_or_create(
            organization=acme,
            name='New York Branch',
            defaults={
                'address': '350 5th Ave, New York, NY 10118',
                'latitude': 40.748817,
                'longitude': -73.985428,
                'radius_meters': 150,
                'timezone': 'America/New_York',
            }
        )

        # 3. Access Points
        ap1, _ = AccessPoint.objects.get_or_create(
            organization=acme,
            office=hq_office,
            mac_address='00:1A:1E:17:F1:80',
            defaults={
                'name': 'HQ-Floor3-West-AP01',
                'ip_address': '10.0.1.10',
                'location_description': 'Floor 3 Engineering Wing',
            }
        )

        ap2, _ = AccessPoint.objects.get_or_create(
            organization=acme,
            office=hq_office,
            mac_address='00:1A:1E:17:F1:81',
            defaults={
                'name': 'HQ-Floor3-East-AP02',
                'ip_address': '10.0.1.11',
                'location_description': 'Floor 3 Design & Product Wing',
            }
        )

        # 4. Departments
        eng_dept, _ = Department.objects.get_or_create(
            organization=acme,
            code='ENG',
            defaults={'name': 'Engineering'}
        )
        prd_dept, _ = Department.objects.get_or_create(
            organization=acme,
            code='PRD',
            defaults={'name': 'Product & Design'}
        )
        hr_dept, _ = Department.objects.get_or_create(
            organization=acme,
            code='HR',
            defaults={'name': 'People & Human Resources'}
        )

        # 5. Designations
        des_vp_eng, _ = Designation.objects.get_or_create(
            organization=acme,
            department=eng_dept,
            code='VP-ENG',
            defaults={'title': 'VP of Engineering', 'level': 5}
        )
        des_sr_eng, _ = Designation.objects.get_or_create(
            organization=acme,
            department=eng_dept,
            code='SR-SDE',
            defaults={'title': 'Senior Backend Engineer', 'level': 3}
        )
        des_fe_eng, _ = Designation.objects.get_or_create(
            organization=acme,
            department=eng_dept,
            code='FE-SDE',
            defaults={'title': 'Frontend Engineer', 'level': 2}
        )
        des_lead_des, _ = Designation.objects.get_or_create(
            organization=acme,
            department=prd_dept,
            code='LEAD-DES',
            defaults={'title': 'Lead Product Designer', 'level': 4}
        )
        des_hr_dir, _ = Designation.objects.get_or_create(
            organization=acme,
            department=hr_dept,
            code='HR-DIR',
            defaults={'title': 'HR Director', 'level': 5}
        )

        # 6. Shifts
        standard_shift, _ = Shift.objects.get_or_create(
            organization=acme,
            code='STD-DAY',
            defaults={
                'name': 'Standard Day Shift',
                'shift_type': 'FIXED',
                'start_time': datetime.time(9, 0),
                'end_time': datetime.time(18, 0),
                'break_duration_minutes': 60,
                'grace_period_minutes': 15,
                'half_day_threshold_minutes': 240,
                'full_day_threshold_minutes': 420,
            }
        )

        # 7. Leave Types
        annual_leave, _ = LeaveType.objects.get_or_create(
            organization=acme,
            code='ANNUAL',
            defaults={
                'name': 'Annual Leave',
                'default_quota_days': 20.0,
                'is_paid': True,
                'max_carryover_days': 5.0,
            }
        )
        sick_leave, _ = LeaveType.objects.get_or_create(
            organization=acme,
            code='SICK',
            defaults={
                'name': 'Sick Leave',
                'default_quota_days': 10.0,
                'is_paid': True,
                'requires_attachment': True,
            }
        )
        casual_leave, _ = LeaveType.objects.get_or_create(
            organization=acme,
            code='CASUAL',
            defaults={
                'name': 'Casual Leave',
                'default_quota_days': 5.0,
                'is_paid': True,
            }
        )

        # 8. Users & Employees
        # Super Admin
        admin_user, _ = User.objects.get_or_create(
            email='admin@acme-corp.com',
            defaults={
                'organization': acme,
                'role': 'SUPER_ADMIN',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin_user.set_password('Admin123!')
        admin_user.save()

        # HR Admin
        hr_user, _ = User.objects.get_or_create(
            email='sarah.jenkins@acme-corp.com',
            defaults={
                'organization': acme,
                'role': 'HR_ADMIN',
                'is_staff': True,
            }
        )
        hr_user.set_password('Password123!')
        hr_user.save()

        hr_emp, _ = Employee.objects.get_or_create(
            user=hr_user,
            defaults={
                'organization': acme,
                'employee_code': 'EMP-001',
                'first_name': 'Sarah',
                'last_name': 'Jenkins',
                'work_email': 'sarah.jenkins@acme-corp.com',
                'phone_number': '+1-512-555-0101',
                'joining_date': datetime.date(2023, 1, 15),
                'department': hr_dept,
                'designation': des_hr_dir,
                'office': hq_office,
                'network_username': 'sjenkins',
                'avatar_url': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&auto=format&fit=crop&q=80',
            }
        )

        # Manager
        mgr_user, _ = User.objects.get_or_create(
            email='marcus.brody@acme-corp.com',
            defaults={
                'organization': acme,
                'role': 'MANAGER',
                'is_staff': False,
            }
        )
        mgr_user.set_password('Password123!')
        mgr_user.save()

        mgr_emp, _ = Employee.objects.get_or_create(
            user=mgr_user,
            defaults={
                'organization': acme,
                'employee_code': 'EMP-002',
                'first_name': 'Marcus',
                'last_name': 'Brody',
                'work_email': 'marcus.brody@acme-corp.com',
                'phone_number': '+1-512-555-0102',
                'joining_date': datetime.date(2023, 3, 1),
                'department': eng_dept,
                'designation': des_vp_eng,
                'office': hq_office,
                'network_username': 'mbrody',
                'avatar_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80',
            }
        )

        # Employee 1
        emp1_user, _ = User.objects.get_or_create(
            email='alex.rivera@acme-corp.com',
            defaults={
                'organization': acme,
                'role': 'EMPLOYEE',
            }
        )
        emp1_user.set_password('Password123!')
        emp1_user.save()

        emp1, _ = Employee.objects.get_or_create(
            user=emp1_user,
            defaults={
                'organization': acme,
                'employee_code': 'EMP-003',
                'first_name': 'Alex',
                'last_name': 'Rivera',
                'work_email': 'alex.rivera@acme-corp.com',
                'phone_number': '+1-512-555-0103',
                'joining_date': datetime.date(2024, 2, 1),
                'department': eng_dept,
                'designation': des_sr_eng,
                'office': hq_office,
                'manager': mgr_emp,
                'network_username': 'arivera',
                'avatar_url': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&auto=format&fit=crop&q=80',
            }
        )

        # Employee 2
        emp2_user, _ = User.objects.get_or_create(
            email='elena.rostova@acme-corp.com',
            defaults={
                'organization': acme,
                'role': 'EMPLOYEE',
            }
        )
        emp2_user.set_password('Password123!')
        emp2_user.save()

        emp2, _ = Employee.objects.get_or_create(
            user=emp2_user,
            defaults={
                'organization': acme,
                'employee_code': 'EMP-004',
                'first_name': 'Elena',
                'last_name': 'Rostova',
                'work_email': 'elena.rostova@acme-corp.com',
                'phone_number': '+1-512-555-0104',
                'joining_date': datetime.date(2024, 4, 15),
                'department': prd_dept,
                'designation': des_lead_des,
                'office': hq_office,
                'manager': mgr_emp,
                'network_username': 'erostova',
                'avatar_url': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
            }
        )

        # Beta Organization Employee (for tenant isolation verification)
        beta_user, _ = User.objects.get_or_create(
            email='oliver.smith@beta-innovations.com',
            defaults={
                'organization': beta,
                'role': 'EMPLOYEE',
            }
        )
        beta_user.set_password('Password123!')
        beta_user.save()

        # Department in Beta
        beta_dept, _ = Department.objects.get_or_create(
            organization=beta,
            code='OPS',
            defaults={'name': 'Operations'}
        )
        beta_des, _ = Designation.objects.get_or_create(
            organization=beta,
            department=beta_dept,
            code='OP-SPEC',
            defaults={'title': 'Operations Specialist', 'level': 2}
        )
        beta_office, _ = Office.objects.get_or_create(
            organization=beta,
            name='London HQ',
            defaults={'timezone': 'Europe/London'}
        )

        beta_emp, _ = Employee.objects.get_or_create(
            user=beta_user,
            defaults={
                'organization': beta,
                'employee_code': 'BETA-001',
                'first_name': 'Oliver',
                'last_name': 'Smith',
                'work_email': 'oliver.smith@beta-innovations.com',
                'joining_date': datetime.date(2024, 1, 10),
                'department': beta_dept,
                'designation': beta_des,
                'office': beta_office,
                'network_username': 'osmith',
            }
        )

        # 9. Shifts & Leave Balances
        all_emps = [hr_emp, mgr_emp, emp1, emp2]
        current_year = timezone.now().year

        for emp in all_emps:
            EmployeeShift.objects.get_or_create(
                organization=acme,
                employee=emp,
                shift=standard_shift,
                start_date=emp.joining_date,
                defaults={'is_active': True}
            )

            for lt in [annual_leave, sick_leave, casual_leave]:
                LeaveBalance.objects.get_or_create(
                    organization=acme,
                    employee=emp,
                    leave_type=lt,
                    year=current_year,
                    defaults={
                        'allocated_days': lt.default_quota_days,
                        'remaining_days': lt.default_quota_days,
                        'used_days': 0.0,
                        'pending_days': 0.0,
                    }
                )

        # 10. Sample Attendance History (past 7 days for Alex Rivera)
        today = timezone.localdate()
        for i in range(7):
            d = today - datetime.timedelta(days=i)
            if d.weekday() < 5:  # Weekday
                status_choice = 'PRESENT' if i % 4 != 0 else 'LATE'
                late_mins = 0 if status_choice == 'PRESENT' else 18
                first_in_time = datetime.time(8, 55) if status_choice == 'PRESENT' else datetime.time(9, 18)
                tz = timezone.get_current_timezone()
                in_dt = timezone.make_aware(datetime.datetime.combine(d, first_in_time), tz)
                out_dt = timezone.make_aware(datetime.datetime.combine(d, datetime.time(18, 5)), tz)

                rec, _ = AttendanceRecord.objects.get_or_create(
                    organization=acme,
                    employee=emp1,
                    attendance_date=d,
                    defaults={
                        'shift': standard_shift,
                        'first_check_in': in_dt,
                        'last_check_out': out_dt,
                        'total_work_minutes': 490,
                        'late_minutes': late_mins,
                        'status': status_choice,
                        'source': 'WIFI',
                    }
                )

                # Wi-Fi Session record
                WiFiSession.objects.get_or_create(
                    organization=acme,
                    employee=emp1,
                    access_point=ap1,
                    raw_mac_address=ap1.mac_address,
                    raw_username=emp1.network_username,
                    session_start=in_dt,
                    session_end=out_dt,
                    defaults={
                        'duration_seconds': 490 * 60,
                        'status': 'PROCESSED',
                    }
                )

        # 11. Sample Holiday
        Holiday.objects.get_or_create(
            organization=acme,
            holiday_date=datetime.date(current_year, 12, 25),
            defaults={
                'name': 'Christmas Day',
                'is_recurring': True,
                'description': 'Company observed public holiday',
            }
        )

        # 12. Sample Announcements & Notifications
        Announcement.objects.get_or_create(
            organization=acme,
            title='Annual Company All-Hands Meeting',
            defaults={
                'content': 'Join us this Thursday at 2:00 PM EST for our Q4 strategy review and roadmap reveal.',
                'published_by': hr_user,
                'is_pinned': True,
            }
        )

        Notification.objects.get_or_create(
            organization=acme,
            recipient=emp1_user,
            title='Attendance Verified',
            defaults={
                'message': 'Your Wi-Fi attendance session for today has been logged and verified.',
                'notification_type': 'ATTENDANCE',
                'is_read': False,
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded enterprise HRM database!'))
        self.stdout.write(self.style.SUCCESS('Default Demo Credentials:'))
        self.stdout.write(self.style.NOTICE('  Admin:    admin@acme-corp.com / Admin123!'))
        self.stdout.write(self.style.NOTICE('  HR:       sarah.jenkins@acme-corp.com / Password123!'))
        self.stdout.write(self.style.NOTICE('  Manager:  marcus.brody@acme-corp.com / Password123!'))
        self.stdout.write(self.style.NOTICE('  Employee: alex.rivera@acme-corp.com / Password123!'))
