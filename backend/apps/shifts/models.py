import datetime
from django.db import models
from apps.core.models import TenantBaseModel


class Shift(TenantBaseModel):
    SHIFT_TYPE_CHOICES = (
        ('FIXED', 'Fixed Hours'),
        ('FLEXIBLE', 'Flexible Hours'),
        ('ROTATING', 'Rotating Shift'),
    )

    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50)
    shift_type = models.CharField(max_length=32, choices=SHIFT_TYPE_CHOICES, default='FIXED')
    start_time = models.TimeField(default=datetime.time(9, 0))
    end_time = models.TimeField(default=datetime.time(18, 0))
    break_duration_minutes = models.IntegerField(default=60)
    grace_period_minutes = models.IntegerField(default=15)
    half_day_threshold_minutes = models.IntegerField(default=240)
    full_day_threshold_minutes = models.IntegerField(default=420)
    is_night_shift = models.BooleanField(default=False)

    class Meta(TenantBaseModel.Meta):
        db_table = 'shifts'
        unique_together = ('organization', 'code')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')})"


class EmployeeShift(TenantBaseModel):
    employee = models.ForeignKey(
        'employees.Employee',
        on_delete=models.CASCADE,
        related_name='shift_assignments'
    )
    shift = models.ForeignKey(
        Shift,
        on_delete=models.CASCADE,
        related_name='employee_assignments'
    )
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta(TenantBaseModel.Meta):
        db_table = 'employee_shifts'
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.employee.employee_code} -> {self.shift.name} (from {self.start_date})"
