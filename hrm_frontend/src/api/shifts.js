import api from './axios'

export const listShifts = (params = {}) =>
  api.get('/shifts/', { params }).then((r) => r.data)

export const createShift = (data) =>
  api.post('/shifts/', data).then((r) => r.data)

export const updateShift = (id, data) =>
  api.patch(`/shifts/${id}/`, data).then((r) => r.data)

export const deleteShift = (id) =>
  api.delete(`/shifts/${id}/`).then((r) => r.data)

export const listEmployeeShifts = (params = {}) =>
  api.get('/employee-shifts/', { params }).then((r) => r.data)

export const assignEmployeeShift = (data) =>
  api.post('/employee-shifts/', data).then((r) => r.data)
