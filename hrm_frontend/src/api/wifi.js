import api from './axios'

export const listAccessPoints = (params = {}) =>
  api.get('/access-points/', { params }).then((r) => r.data)

export const createAccessPoint = (data) =>
  api.post('/access-points/', data).then((r) => r.data)

export const updateAccessPoint = (id, data) =>
  api.patch(`/access-points/${id}/`, data).then((r) => r.data)

export const deleteAccessPoint = (id) =>
  api.delete(`/access-points/${id}/`).then((r) => r.data)

export const listWifiSessions = (params = {}) =>
  api.get('/wifi-sessions/', { params }).then((r) => r.data)
