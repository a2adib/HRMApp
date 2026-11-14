from django.db import models
from apps.core.models import TenantBaseModel


class Employee(TenantBaseModel):
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('PROBATION', 'Probation'),
        ('SUSPENDED', 'Suspended'),
        ('TERMINATED', 'Terminated'),
    )

    user = models.OneToOneField(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='employee'
    )
    employee_code = models.CharField(max_length=50, db_index=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    work_email = models.EmailField(max_length=255)
    phone_number = models.CharField(max_length=32, blank=True, null=True)
    gender = models.CharField(max_length=16, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    joining_date = models.DateField()
    employment_status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='ACTIVE')

    department = models.ForeignKey(
        'departments.Department',
        on_delete=models.PROTECT,
        related_name='employees'
    )
    designation = models.ForeignKey(
        'departments.Designation',
        on_delete=models.PROTECT,
        related_name='employees'
    )
    office = models.ForeignKey(
        'organizations.Office',
        on_delete=models.PROTECT,
        related_name='employees'
    )
    manager = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='direct_reports'
    )

    # RADIUS / 802.1X Enterprise Wi-Fi identity
    network_username = models.CharField(
        max_length=128,
        blank=True,
        null=True,
        db_index=True,
        help_text="RADIUS Accounting User-Name for passive Wi-Fi attendance"
    )
    avatar_url = models.URLField(max_length=512, blank=True, null=True)

    class Meta(TenantBaseModel.Meta):
        db_table = 'employees'
        unique_together = ('organization', 'employee_code')
        ordering = ['employee_code']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.employee_code})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
