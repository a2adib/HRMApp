from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from apps.core.views import HealthzView, ReadyzView
from apps.accounts.views import (
    CustomLoginView,
    CustomTokenRefreshView,
    LogoutView,
    CurrentUserProfileView,
    UserListView
)
from apps.organizations.views import OrganizationViewSet, OfficeViewSet, AccessPointViewSet
from apps.departments.views import DepartmentViewSet, DesignationViewSet
from apps.employees.views import EmployeeViewSet
from apps.shifts.views import ShiftViewSet, EmployeeShiftViewSet
from apps.holidays.views import HolidayViewSet
from apps.attendance.views import (
    TodayAttendanceView,
    AttendanceHistoryView,
    MonthlyAttendanceView,
    TeamAttendanceView,
    CheckInView,
    CheckOutView,
    AttendanceAdjustmentViewSet
)
from apps.wifi_attendance.views import InternalWiFiEventsView, WiFiSessionViewSet
from apps.leaves.views import LeaveTypeViewSet, LeaveBalanceViewSet, LeaveRequestViewSet
from apps.notifications.views import NotificationViewSet, AnnouncementViewSet
from apps.reports.views import (
    EmployeeDashboardView,
    ManagerDashboardView,
    HRDashboardView,
    AttendanceReportView,
    LeaveReportView
)
from apps.payroll.views import (
    PayrollSummaryView,
    SalaryStructureViewSet,
    PayrollPeriodViewSet,
    PayslipViewSet
)
from apps.audit.views import AuditLogViewSet

# API v1 Router
router = DefaultRouter()
router.register(r'organizations', OrganizationViewSet, basename='organization')
router.register(r'offices', OfficeViewSet, basename='office')
router.register(r'access-points', AccessPointViewSet, basename='access-point')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'designations', DesignationViewSet, basename='designation')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'shifts', ShiftViewSet, basename='shift')
router.register(r'employee-shifts', EmployeeShiftViewSet, basename='employee-shift')
router.register(r'holidays', HolidayViewSet, basename='holiday')
router.register(r'attendance/adjustments', AttendanceAdjustmentViewSet, basename='attendance-adjustment')
router.register(r'wifi-sessions', WiFiSessionViewSet, basename='wifi-session')
router.register(r'leaves/types', LeaveTypeViewSet, basename='leave-type')
router.register(r'leaves/balances', LeaveBalanceViewSet, basename='leave-balance')
router.register(r'leaves', LeaveRequestViewSet, basename='leave-request')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'announcements', AnnouncementViewSet, basename='announcement')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')
router.register(r'payroll/salary-structures', SalaryStructureViewSet, basename='salary-structure')
router.register(r'payroll/periods', PayrollPeriodViewSet, basename='payroll-period')
router.register(r'payroll/payslips', PayslipViewSet, basename='payslip')

urlpatterns = [
    path('admin/', admin.site.urls),

    # Health & Readiness Probes
    path('healthz/', HealthzView.as_view(), name='healthz'),
    path('readyz/', ReadyzView.as_view(), name='readyz'),
    path('api/v1/healthz/', HealthzView.as_view(), name='api_healthz'),
    path('api/v1/readyz/', ReadyzView.as_view(), name='api_readyz'),

    # OpenAPI Schema & Swagger Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Authentication Endpoints
    path('api/v1/auth/login/', CustomLoginView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('api/v1/auth/me/', CurrentUserProfileView.as_view(), name='auth_me'),
    path('api/v1/auth/users/', UserListView.as_view(), name='user_list'),

    # Attendance Custom Endpoints
    path('api/v1/attendance/today/', TodayAttendanceView.as_view(), name='attendance_today'),
    path('api/v1/attendance/history/', AttendanceHistoryView.as_view(), name='attendance_history'),
    path('api/v1/attendance/monthly/', MonthlyAttendanceView.as_view(), name='attendance_monthly'),
    path('api/v1/attendance/team/', TeamAttendanceView.as_view(), name='attendance_team'),
    path('api/v1/attendance/check-in/', CheckInView.as_view(), name='attendance_check_in'),
    path('api/v1/attendance/check-out/', CheckOutView.as_view(), name='attendance_check_out'),

    # Wi-Fi Internal M2M Event Ingestion
    path('api/v1/internal/wifi-events/', InternalWiFiEventsView.as_view(), name='internal_wifi_events'),

    # Dashboard Metrics
    path('api/v1/dashboard/employee/', EmployeeDashboardView.as_view(), name='dashboard_employee'),
    path('api/v1/dashboard/manager/', ManagerDashboardView.as_view(), name='dashboard_manager'),
    path('api/v1/dashboard/hr/', HRDashboardView.as_view(), name='dashboard_hr'),

    # Analytical Reports & Payroll
    path('api/v1/reports/attendance/', AttendanceReportView.as_view(), name='reports_attendance'),
    path('api/v1/reports/leave/', LeaveReportView.as_view(), name='reports_leave'),
    path('api/v1/payroll/summary/', PayrollSummaryView.as_view(), name='payroll_summary'),

    # ViewSet Router Inclusion
    path('api/v1/', include(router.urls)),
]
