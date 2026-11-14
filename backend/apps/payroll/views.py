from django.utils import timezone
from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework.response import Response
from apps.core.permissions import IsHRAdmin
from apps.employees.models import Employee
from apps.attendance.models import AttendanceRecord


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
