import api from './axios'

export const login = (email, password) =>
  api.post('/auth/login/', { email, password }).then((r) => r.data)

export const logout = (refreshToken) =>
  api.post('/auth/logout/', { refresh: refreshToken }).then((r) => r.data)

export const getMe = () =>
  api.get('/auth/me/').then((r) => r.data)

export const listUsers = () =>
  api.get('/auth/users/').then((r) => r.data)
