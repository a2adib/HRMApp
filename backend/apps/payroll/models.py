from decimal import Decimal
from django.db import models
from django.utils import timezone
from apps.core.models import TenantBaseModel


class SalaryStructure(TenantBaseModel):
    employee = models.OneToOneField(
        'employees.Employee',
        on_delete=models.CASCADE,
        related_name='salary_structure'
    )
    base_salary = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    housing_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    transport_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    medical_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    other_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    tax_deduction_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    provident_fund_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    effective_from = models.DateField(default=timezone.now)
    is_active = models.BooleanField(default=True)

    class Meta(TenantBaseModel.Meta):
        db_table = 'salary_structures'
        ordering = ['employee__employee_code']

    def __str__(self):
        return f"Salary for {self.employee.employee_code} ({self.base_salary})"

    @property
    def total_allowances(self):
        return (
            self.housing_allowance +
            self.transport_allowance +
            self.medical_allowance +
            self.other_allowance
        )

    @property
    def gross_salary(self):
        return self.base_salary + self.total_allowances


class PayrollPeriod(TenantBaseModel):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('PROCESSING', 'Processing'),
        ('PROCESSED', 'Processed'),
        ('PAID', 'Paid'),
    )

    year = models.IntegerField()
    month = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='DRAFT')
    total_gross = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    total_deductions = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    total_net = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    processed_at = models.DateTimeField(blank=True, null=True)
    processed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='processed_payrolls'
    )

    class Meta(TenantBaseModel.Meta):
        db_table = 'payroll_periods'
        unique_together = ('organization', 'year', 'month')
        ordering = ['-year', '-month']

    def __str__(self):
        return f"{self.organization.name} - Payroll {self.year}-{self.month:02d} ({self.status})"


class Payslip(TenantBaseModel):
    STATUS_CHOICES = (
        ('GENERATED', 'Generated'),
        ('APPROVED', 'Approved'),
        ('PAID', 'Paid'),
    )

    payroll_period = models.ForeignKey(
        PayrollPeriod,
        on_delete=models.CASCADE,
        related_name='payslips'
    )
    employee = models.ForeignKey(
        'employees.Employee',
        on_delete=models.CASCADE,
        related_name='payslips'
    )
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2)
    total_allowances = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    overtime_hours = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('0.00'))
    overtime_pay = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    gross_earnings = models.DecimalField(max_digits=12, decimal_places=2)
    unpaid_absence_days = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    absence_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    tax_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    provident_fund = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    other_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total_deductions = models.DecimalField(max_digits=12, decimal_places=2)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='GENERATED')
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta(TenantBaseModel.Meta):
        db_table = 'payslips'
        unique_together = ('payroll_period', 'employee')
        ordering = ['-payroll_period__year', '-payroll_period__month', 'employee__employee_code']

    def __str__(self):
        return f"Payslip {self.employee.employee_code} - {self.payroll_period.year}/{self.payroll_period.month:02d} (Net: {self.net_salary})"
