import uuid
from django.db import models
from .context import get_current_tenant_id


class TenantQuerySet(models.QuerySet):
    def filter_by_current_tenant(self):
        tenant_id = get_current_tenant_id()
        if tenant_id:
            return self.filter(organization_id=tenant_id)
        return self

    def alive(self):
        return self.filter(is_deleted=False)

    def delete(self):
        return self.update(is_deleted=True)

    def hard_delete(self):
        return super().delete()


class TenantManager(models.Manager.from_queryset(TenantQuerySet)):
    def get_queryset(self):
        qs = super().get_queryset().filter(is_deleted=False)
        tenant_id = get_current_tenant_id()
        if tenant_id:
            return qs.filter(organization_id=tenant_id)
        return qs


class AllObjectsManager(models.Manager.from_queryset(TenantQuerySet)):
    """Unfiltered manager including soft-deleted and cross-tenant records."""
    pass


class TenantBaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name="%(app_label)s_%(class)s_set",
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False, db_index=True)

    objects = TenantManager()
    all_objects = AllObjectsManager()

    class Meta:
        abstract = True
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.organization_id:
            tenant_id = get_current_tenant_id()
            if tenant_id:
                self.organization_id = tenant_id
        super().save(*args, **kwargs)

    def delete(self, using=None, keep_parents=False):
        self.is_deleted = True
        self.save(update_fields=['is_deleted', 'updated_at'])

    def hard_delete(self, using=None, keep_parents=False):
        super().delete(using=using, keep_parents=keep_parents)
