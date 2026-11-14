from rest_framework import permissions
from apps.core.viewsets import TenantModelViewSet
from apps.core.permissions import IsHRAdmin
from .models import Holiday
from .serializers import HolidaySerializer


class HolidayViewSet(TenantModelViewSet):
    serializer_class = HolidaySerializer
    queryset = Holiday.objects.all()
    filterset_fields = ['office', 'holiday_date']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsHRAdmin()]
        return [permissions.IsAuthenticated()]
