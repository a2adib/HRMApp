from rest_framework import permissions
from apps.core.permissions import IsHRAdmin
from apps.core.viewsets import TenantModelViewSet
from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogViewSet(TenantModelViewSet):
    serializer_class = AuditLogSerializer
    queryset = AuditLog.objects.all().select_related('user')
    permission_classes = [permissions.IsAuthenticated, IsHRAdmin]
    filterset_fields = ['action', 'entity_name', 'user']
