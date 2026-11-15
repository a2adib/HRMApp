import api from './axios'

export const listDepartments = (params = {}) =>
  api.get('/departments/', { params }).then((r) => r.data)

export const createDepartment = (data) =>
  api.post('/departments/', data).then((r) => r.data)

export const updateDepartment = (id, data) =>
  api.patch(`/departments/${id}/`, data).then((r) => r.data)

export const deleteDepartment = (id) =>
  api.delete(`/departments/${id}/`).then((r) => r.data)

export const listDesignations = (params = {}) =>
  api.get('/designations/', { params }).then((r) => r.data)

export const createDesignation = (data) =>
  api.post('/designations/', data).then((r) => r.data)
