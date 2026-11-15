import api from './axios'

export const getTodayAttendance = () =>
  api.get('/attendance/today/').then((r) => r.data)

export const getAttendanceHistory = (params = {}) =>
  api.get('/attendance/history/', { params }).then((r) => r.data)

export const getMonthlyAttendance = (params = {}) =>
  api.get('/attendance/monthly/', { params }).then((r) => r.data)

export const getTeamAttendance = (params = {}) =>
  api.get('/attendance/team/', { params }).then((r) => r.data)

export const checkIn = (data = {}) =>
  api.post('/attendance/check-in/', data).then((r) => r.data)

export const checkOut = (data = {}) =>
  api.post('/attendance/check-out/', data).then((r) => r.data)

export const listAdjustments = (params = {}) =>
  api.get('/attendance/adjustments/', { params }).then((r) => r.data)

export const createAdjustment = (data) =>
  api.post('/attendance/adjustments/', data).then((r) => r.data)

export const approveAdjustment = (id, data = {}) =>
  api.post(`/attendance/adjustments/${id}/approve/`, data).then((r) => r.data)

export const rejectAdjustment = (id, data = {}) =>
  api.post(`/attendance/adjustments/${id}/reject/`, data).then((r) => r.data)
