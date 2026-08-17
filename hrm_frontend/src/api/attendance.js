import api from './axios'

export const markAttendance = () =>
  api.post('/attendance/mark').then((r) => r.data)

export const getMyAttendance = () =>
  api.get('/attendance/logs').then((r) => r.data)

export const getAllAttendance = () =>
  api.get('/attendance/all').then((r) => r.data)

export const exportAttendance = () =>
  api.get('/attendance/export', { responseType: 'blob' }).then((r) => r.data)
