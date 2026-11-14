from rest_framework import viewsets, permissions
from .permissions import IsTenantScoped


class TenantModelViewSet(viewsets.ModelViewSet):
    """
    Base ModelViewSet that enforces:
    1. Authentication requirement.
    2. Tenant object permission checks.
    3. Automatic organization assignment on creation.
    4. Tenant-scoped querysets.
    """
    permission_classes = [permissions.IsAuthenticated, IsTenantScoped]

    def get_queryset(self):
        qs = super().get_queryset()
        tenant_id = getattr(self.request, 'tenant_id', None)
        if tenant_id and not self.request.user.is_superuser:
            if hasattr(qs.model, 'organization_id'):
                return qs.filter(organization_id=tenant_id)
        return qs

    def perform_create(self, serializer):
        tenant_id = getattr(self.request, 'tenant_id', None)
        if hasattr(serializer.Meta.model, 'organization') and tenant_id:
            serializer.save(organization_id=tenant_id)
        else:
            serializer.save()
