import api from './client'

export const addressesApi = {
  list:       (userId)               => api.get(`/users/${userId}/addresses`).then((r) => r.data),
  create:     (userId, payload)      => api.post(`/users/${userId}/addresses`, payload).then((r) => r.data),
  update:     (userId, id, payload)  => api.put(`/users/${userId}/addresses/${id}`, payload).then((r) => r.data),
  remove:     (userId, id)           => api.delete(`/users/${userId}/addresses/${id}`).then((r) => r.data),
  setDefault: (userId, id)           => api.post(`/users/${userId}/addresses/${id}/default`).then((r) => r.data),
}
