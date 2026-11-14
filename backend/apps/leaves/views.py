from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError

from apps.core.permissions import IsHRAdmin, IsManagerOrHRAdmin
from apps.core.viewsets import TenantModelViewSet
from .models import LeaveType, LeaveBalance, LeaveRequest
from .serializers import LeaveTypeSerializer, LeaveBalanceSerializer, LeaveRequestSerializer
from .services import apply_leave, approve_leave_request, reject_leave_request


class LeaveTypeViewSet(TenantModelViewSet):
    serializer_class = LeaveTypeSerializer
    queryset = LeaveType.objects.all()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsHRAdmin()]
        return [permissions.IsAuthenticated()]


class LeaveBalanceViewSet(TenantModelViewSet):
    serializer_class = LeaveBalanceSerializer
    queryset = LeaveBalance.objects.all().select_related('leave_type', 'employee')
    filterset_fields = ['employee', 'year']

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_superuser or user.role in ['HR_ADMIN', 'MANAGER']:
            return qs
        emp = getattr(user, 'employee', None)
        if emp:
            return qs.filter(employee=emp)
        return qs.none()


class LeaveRequestViewSet(TenantModelViewSet):
    serializer_class = LeaveRequestSerializer
    queryset = LeaveRequest.objects.all().select_related('leave_type', 'employee', 'reviewed_by')
    filterset_fields = ['status', 'leave_type', 'employee']

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_superuser or user.role == 'HR_ADMIN':
            return qs
        if user.role == 'MANAGER':
            emp = getattr(user, 'employee', None)
            if emp:
                return qs.filter(models.Q(employee__manager=emp) | models.Q(employee=emp))
        emp = getattr(user, 'employee', None)
        if emp:
            return qs.filter(employee=emp)
        return qs.none()

    def create(self, request, *args, **kwargs):
        emp = getattr(request.user, 'employee', None)
        if not emp:
            return Response({"detail": "Employee profile required to apply for leave."}, status=status.HTTP_400_BAD_REQUEST)

        leave_type_id = request.data.get('leave_type')
        start_date_str = request.data.get('start_date')
        end_date_str = request.data.get('end_date')
        reason = request.data.get('reason', '')
        attachment_url = request.data.get('attachment_url')

        try:
            leave_type = LeaveType.objects.get(id=leave_type_id, organization=request.user.organization)
            start_date = timezone.datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = timezone.datetime.strptime(end_date_str, '%Y-%m-%d').date()

            leave_req = apply_leave(
                employee=emp,
                leave_type=leave_type,
                start_date=start_date,
                end_date=end_date,
                reason=reason,
                attachment_url=attachment_url
            )
            serializer = self.get_serializer(leave_req)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsManagerOrHRAdmin])
    def approve(self, request, pk=None):
        leave_req = self.get_object()
        notes = request.data.get('review_notes', '')
        try:
            approved = approve_leave_request(leave_req, request.user, review_notes=notes)
            return Response(self.get_serializer(approved).data)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsManagerOrHRAdmin])
    def reject(self, request, pk=None):
        leave_req = self.get_object()
        notes = request.data.get('review_notes', '')
        try:
            rejected = reject_leave_request(leave_req, request.user, review_notes=notes)
            return Response(self.get_serializer(rejected).data)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
