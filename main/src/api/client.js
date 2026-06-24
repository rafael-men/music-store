import axios from 'axios'

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080'

const TOKEN_KEY = 'auth_token'

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenStorage.clear()
      const path = window.location.pathname
      if (path.startsWith('/admin') && path !== '/admin/login') {
        window.location.href = '/admin/login'
      } else if (!['/login', '/register', '/admin/login'].includes(path)) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const extractErrorMessage = (error, fallback = 'Erro inesperado.') => {
  const data = error?.response?.data
  if (typeof data === 'string') return data
  if (data?.message) return data.message
  if (data?.error) return data.error
  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors.map((e) => e.message || e).join(' ')
  }
  return error?.message || fallback
}


export const extractOrderErrorMessage = (error, fallback = 'Falha ao processar pedido.') => {
  const status = error?.response?.status
  const raw = error?.response?.data?.message || ''
  if (status === 409 && /estoque|out.?of.?stock/i.test(raw)) {
    return 'Produto sem estoque suficiente. Atualize seu carrinho e tente novamente.'
  }
  if (status === 502) {
    return 'Não foi possível confirmar o estoque agora. Tente novamente em instantes.'
  }
  if (status === 409) {
    return raw || 'Operação em conflito com o estado atual do pedido.'
  }
  return extractErrorMessage(error, fallback)
}

export default api
