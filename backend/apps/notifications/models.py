from django.db import models
from apps.core.models import TenantBaseModel


class Notification(TenantBaseModel):
    TYPE_CHOICES = (
        ('ATTENDANCE', 'Attendance Alert'),
        ('LEAVE', 'Leave Update'),
        ('ANNOUNCEMENT', 'Company Announcement'),
        ('SYSTEM', 'System Alert'),
    )

    recipient = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=32, choices=TYPE_CHOICES, default='SYSTEM')
    is_read = models.BooleanField(default=False)
    action_url = models.CharField(max_length=255, blank=True, null=True)

    class Meta(TenantBaseModel.Meta):
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"To {self.recipient.email}: {self.title}"


class Announcement(TenantBaseModel):
    title = models.CharField(max_length=255)
    content = models.TextField()
    published_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='announcements'
    )
    target_department = models.ForeignKey(
        'departments.Department',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='announcements'
    )
    is_pinned = models.BooleanField(default=False)
    publish_date = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(blank=True, null=True)

    class Meta(TenantBaseModel.Meta):
        db_table = 'announcements'
        ordering = ['-is_pinned', '-publish_date']

    def __str__(self):
        return self.title
