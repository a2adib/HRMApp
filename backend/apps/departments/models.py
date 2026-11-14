from django.db import models
from apps.core.models import TenantBaseModel


class Department(TenantBaseModel):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='children'
    )
    head_of_department = models.ForeignKey(
        'employees.Employee',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='headed_departments'
    )

    class Meta(TenantBaseModel.Meta):
        db_table = 'departments'
        unique_together = ('organization', 'code')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class Designation(TenantBaseModel):
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='designations'
    )
    title = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    level = models.IntegerField(default=1)

    class Meta(TenantBaseModel.Meta):
        db_table = 'designations'
        unique_together = ('organization', 'department', 'code')
        ordering = ['level', 'title']

    def __str__(self):
        return f"{self.title} ({self.department.code})"
