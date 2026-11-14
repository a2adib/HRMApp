from django.db import models
from apps.core.models import TenantBaseModel


class AttendanceRecord(TenantBaseModel):
    STATUS_CHOICES = (
        ('PRESENT', 'Present'),
        ('LATE', 'Late'),
        ('HALF_DAY', 'Half Day'),
        ('ABSENT', 'Absent'),
        ('ON_LEAVE', 'On Leave'),
        ('HOLIDAY', 'Holiday'),
        ('WEEKEND', 'Weekend'),
    )
    SOURCE_CHOICES = (
        ('WIFI', 'Wi-Fi Tracking'),
        ('MANUAL', 'Manual Punch'),
        ('ADMIN_CORRECTION', 'Admin Correction'),
    )

    employee = models.ForeignKey(
        'employees.Employee',
        on_delete=models.CASCADE,
        related_name='attendance_records'
    )
    shift = models.ForeignKey(
        'shifts.Shift',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='attendance_records'
    )
    attendance_date = models.DateField(db_index=True)
    first_check_in = models.DateTimeField(blank=True, null=True)
    last_check_out = models.DateTimeField(blank=True, null=True)
    total_work_minutes = models.IntegerField(default=0)
    late_minutes = models.IntegerField(default=0)
    early_departure_minutes = models.IntegerField(default=0)
    overtime_minutes = models.IntegerField(default=0)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='ABSENT')
    source = models.CharField(max_length=32, choices=SOURCE_CHOICES, default='WIFI')
    is_finalized = models.BooleanField(default=False)
    notes = models.TextField(blank=True, null=True)

    class Meta(TenantBaseModel.Meta):
        db_table = 'attendance_records'
        unique_together = ('organization', 'employee', 'attendance_date')
        ordering = ['-attendance_date']
        indexes = [
            models.Index(fields=['organization', 'attendance_date', 'status']),
            models.Index(fields=['employee', 'attendance_date']),
        ]

    def __str__(self):
        return f"{self.employee.employee_code} - {self.attendance_date}: {self.status}"


class AttendanceEvent(TenantBaseModel):
    EVENT_TYPES = (
        ('CHECK_IN', 'Check In'),
        ('CHECK_OUT', 'Check Out'),
        ('WIFI_ASSOCIATION', 'Wi-Fi Association'),
        ('WIFI_DISASSOCIATION', 'Wi-Fi Disassociation'),
    )
    SOURCE_CHOICES = (
        ('WIFI', 'Wi-Fi Ingest'),
        ('MOBILE_APP', 'Mobile App'),
        ('WEB_PORTAL', 'Web Portal'),
        ('ADMIN', 'Admin Intervention'),
    )

    attendance_record = models.ForeignKey(
        AttendanceRecord,
        on_delete=models.CASCADE,
        related_name='events'
    )
    employee = models.ForeignKey(
        'employees.Employee',
        on_delete=models.CASCADE,
        related_name='attendance_events'
    )
    event_type = models.CharField(max_length=32, choices=EVENT_TYPES)
    timestamp = models.DateTimeField(db_index=True)
    source = models.CharField(max_length=32, choices=SOURCE_CHOICES, default='WIFI')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    access_point = models.ForeignKey(
        'organizations.AccessPoint',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='attendance_events'
    )
    metadata = models.JSONField(default=dict, blank=True)

    class Meta(TenantBaseModel.Meta):
        db_table = 'attendance_events'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.employee.employee_code} - {self.event_type} @ {self.timestamp}"


class AttendanceAdjustment(TenantBaseModel):
    REVIEW_CHOICES = (
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )

    attendance_record = models.ForeignKey(
        AttendanceRecord,
        on_delete=models.CASCADE,
        related_name='adjustments'
    )
    requested_by = models.ForeignKey(
        'employees.Employee',
        on_delete=models.CASCADE,
        related_name='requested_adjustments'
    )
    reviewed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='reviewed_adjustments'
    )
    original_status = models.CharField(max_length=32)
    requested_status = models.CharField(max_length=32, choices=AttendanceRecord.STATUS_CHOICES)
    original_check_in = models.DateTimeField(blank=True, null=True)
    requested_check_in = models.DateTimeField(blank=True, null=True)
    original_check_out = models.DateTimeField(blank=True, null=True)
    requested_check_out = models.DateTimeField(blank=True, null=True)
    reason = models.TextField()
    review_status = models.CharField(max_length=32, choices=REVIEW_CHOICES, default='PENDING')
    review_notes = models.TextField(blank=True, null=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    class Meta(TenantBaseModel.Meta):
        db_table = 'attendance_adjustments'
        ordering = ['-created_at']

    def __str__(self):
        return f"Adj for {self.attendance_record.employee.employee_code} ({self.review_status})"
