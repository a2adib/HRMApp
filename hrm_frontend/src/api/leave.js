import api from './axios'

export const createLeave = (data) =>
  api.post('/leave', data).then((r) => r.data)

export const getMyLeaves = () =>
  api.get('/leave').then((r) => r.data)

export const getAllLeaves = () =>
  api.get('/leave/all').then((r) => r.data)

export const updateLeaveStatus = (id, status) =>
  api.put(`/leave/${id}/status`, { status }).then((r) => r.data)
