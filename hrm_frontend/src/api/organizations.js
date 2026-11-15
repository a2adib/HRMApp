import api from './axios'

export const listOrganizations = () =>
  api.get('/organizations/').then((r) => r.data)

export const updateOrganization = (id, data) =>
  api.patch(`/organizations/${id}/`, data).then((r) => r.data)

export const listOffices = () =>
  api.get('/offices/').then((r) => r.data)

export const createOffice = (data) =>
  api.post('/offices/', data).then((r) => r.data)
