import datetime
from django.utils import timezone
from django.db import models
from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action

from apps.core.permissions import IsManagerOrHRAdmin, IsHRAdmin
from apps.core.viewsets import TenantModelViewSet
from .models import AttendanceRecord, AttendanceAdjustment
from .serializers import AttendanceRecordSerializer, AttendanceAdjustmentSerializer
from .services import record_punch, verify_office_geofence


class TodayAttendanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        emp = getattr(user, 'employee', None)
        if not emp:
            return Response({"detail": "No linked employee profile found."}, status=status.HTTP_404_NOT_FOUND)

        today = timezone.localdate()
        record = AttendanceRecord.objects.filter(
            organization=emp.organization,
            employee=emp,
            attendance_date=today
        ).first()

        if not record:
            return Response({
                "attendance_date": str(today),
                "status": "NOT_CHECKED_IN",
                "first_check_in": None,
                "last_check_out": None,
                "total_work_minutes": 0,
                "late_minutes": 0,
                "source": None,
            })

        serializer = AttendanceRecordSerializer(record)
        return Response(serializer.data)


class AttendanceHistoryView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AttendanceRecordSerializer

    def get_queryset(self):
        user = self.request.user
        emp = getattr(user, 'employee', None)
        if not emp:
            return AttendanceRecord.objects.none()

        qs = AttendanceRecord.objects.filter(employee=emp)
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        if year and month:
            qs = qs.filter(attendance_date__year=year, attendance_date__month=month)
        return qs.order_by('-attendance_date')


class MonthlyAttendanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        target_emp_id = request.query_params.get('employee_id')
        if target_emp_id and (user.is_superuser or user.role in ['HR_ADMIN', 'MANAGER']):
            from apps.employees.models import Employee
            emp = Employee.objects.filter(id=target_emp_id, organization=user.organization).first()
        else:
            emp = getattr(user, 'employee', None)

        if not emp:
            return Response({"detail": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)

        now = timezone.now()
        year = int(request.query_params.get('year', now.year))
        month = int(request.query_params.get('month', now.month))

        records = AttendanceRecord.objects.filter(
            employee=emp,
            attendance_date__year=year,
            attendance_date__month=month
        ).order_by('attendance_date')

        present_count = records.filter(status='PRESENT').count()
        late_count = records.filter(status='LATE').count()
        half_day_count = records.filter(status='HALF_DAY').count()
        absent_count = records.filter(status='ABSENT').count()
        leave_count = records.filter(status='ON_LEAVE').count()
        total_hours = sum(r.total_work_minutes for r in records) / 60.0

        return Response({
            "year": year,
            "month": month,
            "employee_id": str(emp.id),
            "employee_name": f"{emp.first_name} {emp.last_name}",
            "summary": {
                "present_days": present_count,
                "late_days": late_count,
                "half_days": half_day_count,
                "absent_days": absent_count,
                "leave_days": leave_count,
                "total_work_hours": round(total_hours, 1),
            },
            "records": AttendanceRecordSerializer(records, many=True).data
        })


class TeamAttendanceView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsManagerOrHRAdmin]

    def get(self, request):
        user = request.user
        today = timezone.localdate()
        date_str = request.query_params.get('date')
        if date_str:
            try:
                today = datetime.date.fromisoformat(date_str)
            except ValueError:
                pass

        org = user.organization
        from apps.employees.models import Employee
        emp_qs = Employee.objects.filter(organization=org, employment_status='ACTIVE')

        if user.role == 'MANAGER':
            mgr_emp = getattr(user, 'employee', None)
            if mgr_emp:
                emp_qs = emp_qs.filter(models.Q(manager=mgr_emp) | models.Q(id=mgr_emp.id))

        dept_id = request.query_params.get('department_id')
        if dept_id:
            emp_qs = emp_qs.filter(department_id=dept_id)

        records_map = {
            r.employee_id: r
            for r in AttendanceRecord.objects.filter(organization=org, attendance_date=today)
        }

        team_status = []
        for emp in emp_qs:
            rec = records_map.get(emp.id)
            team_status.append({
                "employee_id": str(emp.id),
                "employee_code": emp.employee_code,
                "name": f"{emp.first_name} {emp.last_name}",
                "department": emp.department.name if emp.department else None,
                "status": rec.status if rec else "ABSENT",
                "first_check_in": rec.first_check_in.isoformat() if rec and rec.first_check_in else None,
                "last_check_out": rec.last_check_out.isoformat() if rec and rec.last_check_out else None,
                "source": rec.source if rec else None,
            })

        return Response({
            "date": str(today),
            "total_team_members": len(team_status),
            "members": team_status
        })


class CheckInView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        emp = getattr(request.user, 'employee', None)
        if not emp:
            return Response({"detail": "Employee profile required for check-in."}, status=status.HTTP_400_BAD_REQUEST)

        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        device_info = request.data.get('device_info', '')
        enforce_geofence = request.data.get('enforce_geofence', False)

        if enforce_geofence:
            geofence_check = verify_office_geofence(emp, lat, lng)
            if not geofence_check.get('verified'):
                return Response({
                    "detail": "Check-in rejected: Outside authorized office geofence radius.",
                    "geofence": geofence_check
                }, status=status.HTTP_400_BAD_REQUEST)

        record, event = record_punch(
            employee=emp,
            event_type='CHECK_IN',
            source='MOBILE_APP',
            latitude=lat,
            longitude=lng,
            metadata={'device_info': device_info}
        )

        geofence_meta = event.metadata.get('geofence')

        return Response({
            "detail": "Check-in successful.",
            "record": AttendanceRecordSerializer(record).data,
            "geofence": geofence_meta
        }, status=status.HTTP_201_CREATED)


class CheckOutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        emp = getattr(request.user, 'employee', None)
        if not emp:
            return Response({"detail": "Employee profile required for check-out."}, status=status.HTTP_400_BAD_REQUEST)

        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        device_info = request.data.get('device_info', '')
        enforce_geofence = request.data.get('enforce_geofence', False)

        if enforce_geofence:
            geofence_check = verify_office_geofence(emp, lat, lng)
            if not geofence_check.get('verified'):
                return Response({
                    "detail": "Check-out rejected: Outside authorized office geofence radius.",
                    "geofence": geofence_check
                }, status=status.HTTP_400_BAD_REQUEST)

        record, event = record_punch(
            employee=emp,
            event_type='CHECK_OUT',
            source='MOBILE_APP',
            latitude=lat,
            longitude=lng,
            metadata={'device_info': device_info}
        )

        geofence_meta = event.metadata.get('geofence')

        return Response({
            "detail": "Check-out successful.",
            "record": AttendanceRecordSerializer(record).data,
            "geofence": geofence_meta
        }, status=status.HTTP_201_CREATED)


class AttendanceAdjustmentViewSet(TenantModelViewSet):
    serializer_class = AttendanceAdjustmentSerializer
    queryset = AttendanceAdjustment.objects.all().select_related('attendance_record', 'requested_by')

    def perform_create(self, serializer):
        emp = getattr(self.request.user, 'employee', None)
        record = serializer.validated_data['attendance_record']
        serializer.save(
            organization=self.request.user.organization,
            requested_by=emp,
            original_status=record.status,
            original_check_in=record.first_check_in,
            original_check_out=record.last_check_out
        )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsManagerOrHRAdmin])
    def approve(self, request, pk=None):
        adj = self.get_object()
        adj.review_status = 'APPROVED'
        adj.reviewed_by = request.user
        adj.reviewed_at = timezone.now()
        adj.review_notes = request.data.get('review_notes', '')
        adj.save()

        # Apply correction to record and lock
        record = adj.attendance_record
        if adj.requested_status:
            record.status = adj.requested_status
        if adj.requested_check_in:
            record.first_check_in = adj.requested_check_in
        if adj.requested_check_out:
            record.last_check_out = adj.requested_check_out
        record.source = 'ADMIN_CORRECTION'
        record.is_finalized = True
        record.notes = f"Corrected via adjustment {adj.id}: {adj.reason}"
        record.save()

        return Response({"detail": "Adjustment approved and applied to attendance record."})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsManagerOrHRAdmin])
    def reject(self, request, pk=None):
        adj = self.get_object()
        adj.review_status = 'REJECTED'
        adj.reviewed_by = request.user
        adj.reviewed_at = timezone.now()
        adj.review_notes = request.data.get('review_notes', '')
        adj.save()
        return Response({"detail": "Adjustment rejected."})
