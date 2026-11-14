from rest_framework import permissions
from apps.core.viewsets import TenantModelViewSet
from apps.core.permissions import IsHRAdmin
from .models import Shift, EmployeeShift
from .serializers import ShiftSerializer, EmployeeShiftSerializer


class ShiftViewSet(TenantModelViewSet):
    serializer_class = ShiftSerializer
    queryset = Shift.objects.all()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsHRAdmin()]
        return [permissions.IsAuthenticated()]


class EmployeeShiftViewSet(TenantModelViewSet):
    serializer_class = EmployeeShiftSerializer
    queryset = EmployeeShift.objects.all().select_related('employee', 'shift')
    filterset_fields = ['employee', 'shift', 'is_active']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsHRAdmin()]
        return [permissions.IsAuthenticated()]
