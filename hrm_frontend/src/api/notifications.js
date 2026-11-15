import api from './axios'

export const listNotifications = () =>
  api.get('/notifications/').then((r) => r.data)

export const markNotificationRead = (id) =>
  api.post(`/notifications/${id}/mark_read/`).then((r) => r.data)

export const markAllNotificationsRead = () =>
  api.post('/notifications/mark_all_read/').then((r) => r.data)

export const listAnnouncements = () =>
  api.get('/announcements/').then((r) => r.data)

export const createAnnouncement = (data) =>
  api.post('/announcements/', data).then((r) => r.data)
