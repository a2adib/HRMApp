from rest_framework import permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.core.viewsets import TenantModelViewSet
from apps.core.permissions import IsManagerOrHRAdmin
from .models import Employee
from .serializers import EmployeeSerializer


class EmployeeViewSet(TenantModelViewSet):
    serializer_class = EmployeeSerializer
    queryset = Employee.objects.all().select_related('department', 'designation', 'office', 'manager')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'designation', 'office', 'employment_status']
    search_fields = ['first_name', 'last_name', 'employee_code', 'work_email', 'network_username']
    ordering_fields = ['first_name', 'last_name', 'employee_code', 'joining_date']

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_superuser or user.role == 'HR_ADMIN':
            return qs
        if user.role == 'MANAGER':
            # Manager sees direct reports and themselves
            emp = getattr(user, 'employee', None)
            if emp:
                return qs.filter(models.Q(manager=emp) | models.Q(id=emp.id))
        # Regular employee sees active employees (directory)
        return qs.filter(employment_status='ACTIVE')

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [permissions.IsAuthenticated(), IsManagerOrHRAdmin()]
        return [permissions.IsAuthenticated()]
