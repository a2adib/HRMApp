from django.db import models
from apps.core.models import TenantBaseModel


class WiFiSession(TenantBaseModel):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Processing'),
        ('PROCESSED', 'Processed into Attendance'),
        ('IGNORED', 'Ignored (Unknown AP or User)'),
        ('ERROR', 'Error during processing'),
    )

    access_point = models.ForeignKey(
        'organizations.AccessPoint',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='wifi_sessions'
    )
    employee = models.ForeignKey(
        'employees.Employee',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='wifi_sessions'
    )
    raw_mac_address = models.CharField(max_length=32, db_index=True)
    raw_username = models.CharField(max_length=128, db_index=True)
    calling_station_id = models.CharField(max_length=32, blank=True, null=True)
    nas_ip = models.GenericIPAddressField(blank=True, null=True)
    session_start = models.DateTimeField(db_index=True)
    session_end = models.DateTimeField(db_index=True)
    duration_seconds = models.IntegerField(default=0)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='PENDING')
    error_message = models.TextField(blank=True, null=True)

    class Meta(TenantBaseModel.Meta):
        db_table = 'wifi_sessions'
        ordering = ['-session_start']
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['raw_username', 'session_start']),
        ]

    def __str__(self):
        return f"WiFi: {self.raw_username} @ {self.raw_mac_address} ({self.status})"
