from rest_framework import permissions
from apps.core.viewsets import TenantModelViewSet
from apps.core.permissions import IsHRAdmin
from .models import Department, Designation
from .serializers import DepartmentSerializer, DesignationSerializer


class DepartmentViewSet(TenantModelViewSet):
    serializer_class = DepartmentSerializer
    queryset = Department.objects.all()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsHRAdmin()]
        return [permissions.IsAuthenticated()]


class DesignationViewSet(TenantModelViewSet):
    serializer_class = DesignationSerializer
    queryset = Designation.objects.all()
    filterset_fields = ['department']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsHRAdmin()]
        return [permissions.IsAuthenticated()]
