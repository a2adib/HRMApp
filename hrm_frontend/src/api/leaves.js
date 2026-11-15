import api from './axios'

export const listLeaveRequests = (params = {}) =>
  api.get('/leaves/', { params }).then((r) => r.data)

export const getLeaveRequest = (id) =>
  api.get(`/leaves/${id}/`).then((r) => r.data)

export const applyLeave = (data) =>
  api.post('/leaves/', data).then((r) => r.data)

export const approveLeave = (id, data = {}) =>
  api.post(`/leaves/${id}/approve/`, data).then((r) => r.data)

export const rejectLeave = (id, data = {}) =>
  api.post(`/leaves/${id}/reject/`, data).then((r) => r.data)

export const listLeaveTypes = (params = {}) =>
  api.get('/leaves/types/', { params }).then((r) => r.data)

export const createLeaveType = (data) =>
  api.post('/leaves/types/', data).then((r) => r.data)

export const listLeaveBalances = (params = {}) =>
  api.get('/leaves/balances/', { params }).then((r) => r.data)
