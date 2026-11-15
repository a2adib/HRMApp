from django.utils import timezone
from rest_framework.views import APIView
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action

from apps.core.permissions import IsHRAdmin, IsManagerOrHRAdmin
from apps.core.viewsets import TenantModelViewSet
from apps.employees.models import Employee
from apps.attendance.models import AttendanceRecord

from .models import SalaryStructure, PayrollPeriod, Payslip
from .serializers import SalaryStructureSerializer, PayrollPeriodSerializer, PayslipSerializer
from .services import calculate_monthly_payroll


class SalaryStructureViewSet(TenantModelViewSet):
    serializer_class = SalaryStructureSerializer
    permission_classes = [permissions.IsAuthenticated, IsHRAdmin]
    queryset = SalaryStructure.objects.all().select_related('employee')
    filterset_fields = ['employee', 'is_active']
    search_fields = ['employee__employee_code', 'employee__first_name', 'employee__last_name']


class PayrollPeriodViewSet(TenantModelViewSet):
    serializer_class = PayrollPeriodSerializer
    permission_classes = [permissions.IsAuthenticated, IsHRAdmin]
    queryset = PayrollPeriod.objects.all().prefetch_related('payslips')
    filterset_fields = ['year', 'month', 'status']

    @action(detail=False, methods=['post'], url_path='generate')
    def generate_payroll(self, request):
        now = timezone.now()
        year = int(request.data.get('year', now.year))
        month = int(request.data.get('month', now.month))

        if not (1 <= month <= 12):
            return Response({"detail": "Month must be an integer between 1 and 12."}, status=status.HTTP_400_BAD_REQUEST)

        period, payslips = calculate_monthly_payroll(
            organization=request.user.organization,
            year=year,
            month=month,
            processed_by=request.user
        )

        return Response({
            "detail": f"Monthly payroll for {year}-{month:02d} processed successfully.",
            "period": PayrollPeriodSerializer(period).data,
            "total_payslips_generated": len(payslips),
            "payslips": PayslipSerializer(payslips, many=True).data
        }, status=status.HTTP_201_CREATED)


class PayslipViewSet(TenantModelViewSet):
    serializer_class = PayslipSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Payslip.objects.all().select_related('employee', 'payroll_period')
    filterset_fields = ['payroll_period', 'payroll_period__year', 'payroll_period__month', 'employee', 'status']

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == 'EMPLOYEE':
            emp = getattr(user, 'employee', None)
            if emp:
                return qs.filter(employee=emp)
            return qs.none()
        return qs

    @action(detail=False, methods=['get'], url_path='my-payslips')
    def my_payslips(self, request):
        emp = getattr(request.user, 'employee', None)
        if not emp:
            return Response({"detail": "Employee profile required to view payslips."}, status=status.HTTP_404_NOT_FOUND)

        payslips = Payslip.objects.filter(
            organization=request.user.organization,
            employee=emp
        ).order_by('-payroll_period__year', '-payroll_period__month')

        return Response(PayslipSerializer(payslips, many=True).data)


class PayrollSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHRAdmin]

    def get(self, request):
        org = request.user.organization
        now = timezone.now()
        year = int(request.query_params.get('year', now.year))
        month = int(request.query_params.get('month', now.month))

        employees = Employee.objects.filter(organization=org, employment_status='ACTIVE').select_related('department', 'designation')

        summary = []
        for emp in employees:
            records = AttendanceRecord.objects.filter(
                employee=emp,
                attendance_date__year=year,
                attendance_date__month=month
            )
            present_days = records.filter(status__in=['PRESENT', 'LATE']).count()
            absent_days = records.filter(status='ABSENT').count()
            leave_days = records.filter(status='ON_LEAVE').count()
            total_work_minutes = sum(r.total_work_minutes for r in records)
            total_overtime_minutes = sum(r.overtime_minutes for r in records)

            summary.append({
                "employee_id": str(emp.id),
                "employee_code": emp.employee_code,
                "name": f"{emp.first_name} {emp.last_name}",
                "department": emp.department.name if emp.department else "",
                "designation": emp.designation.title if emp.designation else "",
                "present_days": present_days,
                "absent_days": absent_days,
                "leave_days": leave_days,
                "total_work_hours": round(total_work_minutes / 60.0, 1),
                "overtime_hours": round(total_overtime_minutes / 60.0, 1),
            })

        return Response({
            "year": year,
            "month": month,
            "total_employees": len(summary),
            "summary": summary
        })
