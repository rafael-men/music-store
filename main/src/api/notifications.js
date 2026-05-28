import api from './client'

export const notificationsApi = {
  byUser: (userId) => api.get(`/notifications/user/${userId}`).then((r) => r.data),
  unread: (userId) => api.get(`/notifications/user/${userId}/unread`).then((r) => r.data),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
}
