import api from './client'

export const authApi = {
  login: (credentials) => api.post('/users/login', credentials).then((r) => r.data),
  register: (payload) => api.post('/users/register', payload).then((r) => r.data),
  logout: () => api.post('/users/logout').then((r) => r.data),
  getById: (id) => api.get(`/users/${id}`).then((r) => r.data),
  update: (id, payload) => api.put(`/users/${id}`, payload).then((r) => r.data),
}
