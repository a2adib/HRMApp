import datetime
from django.utils import timezone
from django.db import models
from rest_framework.views import APIView
from rest_framework import permissions, status
from rest_framework.response import Response

from apps.core.permissions import IsManagerOrHRAdmin, IsHRAdmin
from apps.employees.models import Employee
from apps.attendance.models import AttendanceRecord, AttendanceAdjustment
from apps.leaves.models import LeaveRequest, LeaveBalance
from apps.departments.models import Department
from apps.holidays.models import Holiday
from apps.notifications.models import Announcement


class EmployeeDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        emp = getattr(user, 'employee', None)
        if not emp:
            return Response({"detail": "Employee profile required."}, status=status.HTTP_404_NOT_FOUND)

        today = timezone.localdate()
        today_record = AttendanceRecord.objects.filter(employee=emp, attendance_date=today).first()

        # Weekly attendance metrics (last 7 days)
        start_week = today - datetime.timedelta(days=6)
        week_records = AttendanceRecord.objects.filter(
            employee=emp,
            attendance_date__gte=start_week,
            attendance_date__lte=today
        ).order_by('attendance_date')

        daily_hours = []
        for d in range(7):
            dt = start_week + datetime.timedelta(days=d)
            rec = next((r for r in week_records if r.attendance_date == dt), None)
            daily_hours.append({
                "date": str(dt),
                "day_name": dt.strftime('%a'),
                "work_hours": round((rec.total_work_minutes / 60.0), 1) if rec else 0.0,
                "status": rec.status if rec else ("WEEKEND" if dt.weekday() in [5, 6] else "ABSENT")
            })

        # Leave balances
        balances = LeaveBalance.objects.filter(employee=emp, year=today.year).select_related('leave_type')
        balance_data = [{
            "leave_type": b.leave_type.name,
            "allocated": float(b.allocated_days),
            "used": float(b.used_days),
            "pending": float(b.pending_days),
            "remaining": float(b.remaining_days),
        } for b in balances]

        # Upcoming holidays
        holidays = Holiday.objects.filter(
            organization=emp.organization,
            holiday_date__gte=today
        ).order_by('holiday_date')[:5]
        holiday_data = [{
            "name": h.name,
            "date": str(h.holiday_date),
        } for h in holidays]

        # Pinned announcements
        announcements = Announcement.objects.filter(
            organization=emp.organization,
            is_pinned=True
        )[:3]
        announcement_data = [{
            "title": a.title,
            "content": a.content[:150] + '...' if len(a.content) > 150 else a.content,
            "publish_date": a.publish_date.isoformat(),
        } for a in announcements]

        return Response({
            "employee": {
                "id": str(emp.id),
                "name": f"{emp.first_name} {emp.last_name}",
                "employee_code": emp.employee_code,
                "department": emp.department.name if emp.department else None,
                "designation": emp.designation.title if emp.designation else None,
            },
            "today_attendance": {
                "status": today_record.status if today_record else "NOT_CHECKED_IN",
                "first_check_in": today_record.first_check_in.isoformat() if today_record and today_record.first_check_in else None,
                "last_check_out": today_record.last_check_out.isoformat() if today_record and today_record.last_check_out else None,
                "total_work_minutes": today_record.total_work_minutes if today_record else 0,
                "source": today_record.source if today_record else None,
            },
            "weekly_hours": daily_hours,
            "leave_balances": balance_data,
            "upcoming_holidays": holiday_data,
            "announcements": announcement_data,
        })


class ManagerDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsManagerOrHRAdmin]

    def get(self, request):
        user = request.user
        org = user.organization
        mgr_emp = getattr(user, 'employee', None)

        team_qs = Employee.objects.filter(organization=org, employment_status='ACTIVE')
        if user.role == 'MANAGER' and mgr_emp:
            team_qs = team_qs.filter(models.Q(manager=mgr_emp) | models.Q(id=mgr_emp.id))

        total_team = team_qs.count()
        today = timezone.localdate()
        today_records = AttendanceRecord.objects.filter(
            organization=org,
            employee__in=team_qs,
            attendance_date=today
        )

        present_count = today_records.filter(status='PRESENT').count()
        late_count = today_records.filter(status='LATE').count()
        leave_count = today_records.filter(status='ON_LEAVE').count()
        absent_count = max(0, total_team - (present_count + late_count + leave_count))

        # Pending approvals
        pending_leaves = LeaveRequest.objects.filter(
            organization=org,
            employee__in=team_qs,
            status='PENDING'
        ).count()

        pending_adjustments = AttendanceAdjustment.objects.filter(
            organization=org,
            requested_by__in=team_qs,
            review_status='PENDING'
        ).count()

        return Response({
            "metrics": {
                "total_team_members": total_team,
                "present_today": present_count,
                "late_today": late_count,
                "on_leave_today": leave_count,
                "absent_today": absent_count,
                "pending_leave_approvals": pending_leaves,
                "pending_attendance_adjustments": pending_adjustments,
            }
        })


class HRDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHRAdmin]

    def get(self, request):
        user = request.user
        org = user.organization

        total_employees = Employee.objects.filter(organization=org, employment_status='ACTIVE').count()
        today = timezone.localdate()

        today_records = AttendanceRecord.objects.filter(organization=org, attendance_date=today)
        present_count = today_records.filter(status='PRESENT').count()
        late_count = today_records.filter(status='LATE').count()
        on_leave_count = today_records.filter(status='ON_LEAVE').count()
        half_day_count = today_records.filter(status='HALF_DAY').count()
        absent_count = max(0, total_employees - (present_count + late_count + on_leave_count + half_day_count))

        att_rate = ((present_count + late_count) / total_employees * 100.0) if total_employees > 0 else 0.0

        pending_leaves = LeaveRequest.objects.filter(organization=org, status='PENDING').count()
        pending_adjustments = AttendanceAdjustment.objects.filter(organization=org, review_status='PENDING').count()

        # Department breakdown
        departments = Department.objects.filter(organization=org, is_deleted=False)
        dept_data = []
        for dept in departments:
            d_total = dept.employees.filter(employment_status='ACTIVE').count()
            d_present = today_records.filter(employee__department=dept, status__in=['PRESENT', 'LATE']).count()
            dept_data.append({
                "department_id": str(dept.id),
                "department": dept.name,
                "total_employees": d_total,
                "present_today": d_present,
                "attendance_rate": round((d_present / d_total * 100.0), 1) if d_total > 0 else 0.0,
            })

        # 30-day attendance trend
        trend = []
        start_30 = today - datetime.timedelta(days=29)
        all_30_records = AttendanceRecord.objects.filter(
            organization=org,
            attendance_date__gte=start_30,
            attendance_date__lte=today
        )
        for i in range(30):
            d = start_30 + datetime.timedelta(days=i)
            recs = [r for r in all_30_records if r.attendance_date == d]
            p = len([r for r in recs if r.status in ['PRESENT', 'LATE']])
            rate = round((p / total_employees * 100.0), 1) if total_employees > 0 else 0.0
            trend.append({"date": str(d), "rate": rate, "present": p})

        return Response({
            "metrics": {
                "total_employees": total_employees,
                "present_today": present_count,
                "late_today": late_count,
                "half_day_today": half_day_count,
                "absent_today": absent_count,
                "on_leave_today": on_leave_count,
                "attendance_rate_percentage": round(att_rate, 1),
                "pending_leave_requests": pending_leaves,
                "pending_attendance_adjustments": pending_adjustments,
            },
            "department_breakdown": dept_data,
            "attendance_trend": trend,
        })


class AttendanceReportView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsManagerOrHRAdmin]

    def get(self, request):
        org = request.user.organization
        from_date_str = request.query_params.get('from_date')
        to_date_str = request.query_params.get('to_date')
        dept_id = request.query_params.get('department_id')

        today = timezone.localdate()
        from_date = datetime.date.fromisoformat(from_date_str) if from_date_str else today - datetime.timedelta(days=30)
        to_date = datetime.date.fromisoformat(to_date_str) if to_date_str else today

        records = AttendanceRecord.objects.filter(
            organization=org,
            attendance_date__gte=from_date,
            attendance_date__lte=to_date
        ).select_related('employee', 'shift', 'employee__department')

        if dept_id:
            records = records.filter(employee__department_id=dept_id)

        rows = [{
            "employee_code": r.employee.employee_code,
            "employee_name": f"{r.employee.first_name} {r.employee.last_name}",
            "department": r.employee.department.name if r.employee.department else "",
            "date": str(r.attendance_date),
            "status": r.status,
            "first_check_in": r.first_check_in.isoformat() if r.first_check_in else "",
            "last_check_out": r.last_check_out.isoformat() if r.last_check_out else "",
            "total_work_minutes": r.total_work_minutes,
            "late_minutes": r.late_minutes,
            "source": r.source,
        } for r in records]

        return Response({
            "from_date": str(from_date),
            "to_date": str(to_date),
            "total_records": len(rows),
            "data": rows,
        })


class LeaveReportView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsManagerOrHRAdmin]

    def get(self, request):
        org = request.user.organization
        year = int(request.query_params.get('year', timezone.now().year))
        dept_id = request.query_params.get('department_id')

        balances = LeaveBalance.objects.filter(organization=org, year=year).select_related('employee', 'leave_type', 'employee__department')
        if dept_id:
            balances = balances.filter(employee__department_id=dept_id)

        rows = [{
            "employee_code": b.employee.employee_code,
            "employee_name": f"{b.employee.first_name} {b.employee.last_name}",
            "department": b.employee.department.name if b.employee.department else "",
            "leave_type": b.leave_type.name,
            "allocated_days": float(b.allocated_days),
            "used_days": float(b.used_days),
            "remaining_days": float(b.remaining_days),
        } for b in balances]

        return Response({
            "year": year,
            "total_records": len(rows),
            "data": rows,
        })
