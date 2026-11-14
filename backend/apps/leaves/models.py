from django.db import models
from apps.core.models import TenantBaseModel


class LeaveType(TenantBaseModel):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50)
    default_quota_days = models.DecimalField(max_digits=4, decimal_places=1, default=0.0)
    is_paid = models.BooleanField(default=True)
    requires_attachment = models.BooleanField(default=False)
    max_carryover_days = models.DecimalField(max_digits=4, decimal_places=1, default=0.0)

    class Meta(TenantBaseModel.Meta):
        db_table = 'leave_types'
        unique_together = ('organization', 'code')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class LeaveBalance(TenantBaseModel):
    employee = models.ForeignKey(
        'employees.Employee',
        on_delete=models.CASCADE,
        related_name='leave_balances'
    )
    leave_type = models.ForeignKey(
        LeaveType,
        on_delete=models.CASCADE,
        related_name='employee_balances'
    )
    year = models.IntegerField(db_index=True)
    allocated_days = models.DecimalField(max_digits=4, decimal_places=1, default=0.0)
    used_days = models.DecimalField(max_digits=4, decimal_places=1, default=0.0)
    pending_days = models.DecimalField(max_digits=4, decimal_places=1, default=0.0)
    remaining_days = models.DecimalField(max_digits=4, decimal_places=1, default=0.0)

    class Meta(TenantBaseModel.Meta):
        db_table = 'leave_balances'
        unique_together = ('organization', 'employee', 'leave_type', 'year')
        ordering = ['leave_type__name']

    def __str__(self):
        return f"{self.employee.employee_code} - {self.leave_type.name}: {self.remaining_days} remaining"


class LeaveRequest(TenantBaseModel):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled'),
    )

    employee = models.ForeignKey(
        'employees.Employee',
        on_delete=models.CASCADE,
        related_name='leave_requests'
    )
    leave_type = models.ForeignKey(
        LeaveType,
        on_delete=models.PROTECT,
        related_name='requests'
    )
    start_date = models.DateField(db_index=True)
    end_date = models.DateField(db_index=True)
    total_days = models.DecimalField(max_digits=4, decimal_places=1)
    reason = models.TextField()
    attachment_url = models.URLField(max_length=512, blank=True, null=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    reviewed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='reviewed_leaves'
    )
    review_notes = models.TextField(blank=True, null=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    class Meta(TenantBaseModel.Meta):
        db_table = 'leave_requests'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee.employee_code} ({self.leave_type.code}): {self.start_date} to {self.end_date} [{self.status}]"
