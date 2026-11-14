from django.db import models
from apps.core.models import TenantBaseModel


class AuditLog(TenantBaseModel):
    ACTION_CHOICES = (
        ('CREATE', 'Create Entity'),
        ('UPDATE', 'Update Entity'),
        ('DELETE', 'Delete Entity'),
        ('ADJUST', 'Attendance Adjustment'),
        ('AUTH', 'Authentication Event'),
    )

    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='audit_logs'
    )
    action = models.CharField(max_length=32, choices=ACTION_CHOICES)
    entity_name = models.CharField(max_length=64, db_index=True)
    entity_id = models.CharField(max_length=64, db_index=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    diff = models.JSONField(default=dict, blank=True)

    class Meta(TenantBaseModel.Meta):
        db_table = 'audit_logs'
        ordering = ['-created_at']

    def __str__(self):
        user_str = self.user.email if self.user else "System"
        return f"{self.action} on {self.entity_name}:{self.entity_id} by {user_str}"
