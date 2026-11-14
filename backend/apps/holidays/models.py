from django.db import models
from apps.core.models import TenantBaseModel


class Holiday(TenantBaseModel):
    office = models.ForeignKey(
        'organizations.Office',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='holidays'
    )
    name = models.CharField(max_length=255)
    holiday_date = models.DateField(db_index=True)
    is_recurring = models.BooleanField(default=False)
    description = models.TextField(blank=True, null=True)

    class Meta(TenantBaseModel.Meta):
        db_table = 'holidays'
        unique_together = ('organization', 'office', 'holiday_date')
        ordering = ['holiday_date']

    def __str__(self):
        return f"{self.name} ({self.holiday_date})"
