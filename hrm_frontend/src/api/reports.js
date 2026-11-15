import api from './axios'

export const getEmployeeDashboard = () =>
  api.get('/dashboard/employee/').then((r) => r.data)

export const getManagerDashboard = () =>
  api.get('/dashboard/manager/').then((r) => r.data)

export const getHRDashboard = () =>
  api.get('/dashboard/hr/').then((r) => r.data)

export const getAttendanceReport = (params = {}) =>
  api.get('/reports/attendance/', { params }).then((r) => r.data)

export const getLeaveReport = (params = {}) =>
  api.get('/reports/leave/', { params }).then((r) => r.data)

export const getPayrollSummary = (params = {}) =>
  api.get('/payroll/summary/', { params }).then((r) => r.data)
