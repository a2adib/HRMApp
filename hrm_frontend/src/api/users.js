import api from './axios'

export const getUsers = () =>
  api.get('/users').then((r) => r.data)

export const addUser = (data) =>
  api.post('/users', data).then((r) => r.data)

export const getAssignedEmployees = () =>
  api.get('/users/employees').then((r) => r.data)
