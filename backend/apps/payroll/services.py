import datetime
import calendar
from decimal import Decimal
from django.utils import timezone
from django.db import transaction
from .models import SalaryStructure, PayrollPeriod, Payslip
from apps.employees.models import Employee
from apps.attendance.models import AttendanceRecord


@transaction.atomic
def calculate_monthly_payroll(organization, year, month, processed_by=None):
    """
    Automated Monthly Payroll Calculation Engine:
    Aggregates attendance, calculates overtime, deducts unpaid absences,
    computes taxes/provident fund, and generates employee payslips.
    """
    last_day = calendar.monthrange(year, month)[1]
    start_date = datetime.date(year, month, 1)
    end_date = datetime.date(year, month, last_day)

    period, _ = PayrollPeriod.objects.get_or_create(
        organization=organization,
        year=year,
        month=month,
        defaults={
            'start_date': start_date,
            'end_date': end_date,
            'status': 'PROCESSING'
        }
    )

    employees = Employee.objects.filter(
        organization=organization,
        employment_status='ACTIVE'
    ).select_related('department', 'designation')

    payslips = []
    total_gross = Decimal('0.00')
    total_deductions = Decimal('0.00')
    total_net = Decimal('0.00')

    # Count standard working days in this month (Monday through Friday)
    weekdays_count = sum(
        1 for day in range(1, last_day + 1)
        if datetime.date(year, month, day).weekday() < 5
    )
    standard_working_days = max(1, weekdays_count)

    for emp in employees:
        # Retrieve or create default salary structure
        salary, _ = SalaryStructure.objects.get_or_create(
            organization=organization,
            employee=emp,
            defaults={
                'base_salary': Decimal('4500.00'),
                'housing_allowance': Decimal('500.00'),
                'transport_allowance': Decimal('250.00'),
                'medical_allowance': Decimal('150.00'),
                'other_allowance': Decimal('0.00'),
                'tax_deduction_percentage': Decimal('5.00'),
                'provident_fund_percentage': Decimal('3.00'),
            }
        )

        records = AttendanceRecord.objects.filter(
            employee=emp,
            attendance_date__year=year,
            attendance_date__month=month
        )

        half_days = records.filter(status='HALF_DAY').count()
        absent_days = records.filter(status='ABSENT').count()
        unpaid_absence_days = Decimal(str(absent_days)) + (Decimal(str(half_days)) * Decimal('0.5'))

        total_ot_mins = sum(r.overtime_minutes for r in records)
        overtime_hours = round(Decimal(str(total_ot_mins)) / Decimal('60.0'), 2)

        # Rates computation
        daily_rate = round(salary.base_salary / Decimal(str(standard_working_days)), 2)
        hourly_rate = round(daily_rate / Decimal('8.0'), 2)

        # Earnings
        overtime_pay = round(overtime_hours * hourly_rate * Decimal('1.5'), 2)
        total_allowances = salary.total_allowances
        gross_earnings = salary.base_salary + total_allowances + overtime_pay

        # Deductions
        absence_deduction = round(unpaid_absence_days * daily_rate, 2)
        tax_deduction = round(gross_earnings * (salary.tax_deduction_percentage / Decimal('100.0')), 2)
        provident_fund = round(salary.base_salary * (salary.provident_fund_percentage / Decimal('100.0')), 2)
        emp_deductions = absence_deduction + tax_deduction + provident_fund

        net_salary = max(Decimal('0.00'), gross_earnings - emp_deductions)

        payslip, _ = Payslip.objects.update_or_create(
            payroll_period=period,
            employee=emp,
            defaults={
                'organization': organization,
                'basic_salary': salary.base_salary,
                'total_allowances': total_allowances,
                'overtime_hours': overtime_hours,
                'overtime_pay': overtime_pay,
                'gross_earnings': gross_earnings,
                'unpaid_absence_days': unpaid_absence_days,
                'absence_deduction': absence_deduction,
                'tax_deduction': tax_deduction,
                'provident_fund': provident_fund,
                'other_deductions': Decimal('0.00'),
                'total_deductions': emp_deductions,
                'net_salary': net_salary,
                'status': 'GENERATED'
            }
        )

        payslips.append(payslip)
        total_gross += gross_earnings
        total_deductions += emp_deductions
        total_net += net_salary

    period.total_gross = total_gross
    period.total_deductions = total_deductions
    period.total_net = total_net
    period.status = 'PROCESSED'
    period.processed_at = timezone.now()
    if processed_by:
        period.processed_by = processed_by
    period.save()

    return period, payslips
