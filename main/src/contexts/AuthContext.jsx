import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/auth'
import { tokenStorage } from '../api/client'

const AuthContext = createContext(null)

const decodeJwt = (token) => {
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

const userFromToken = (token) => {
  const claims = decodeJwt(token)
  if (!claims) return null
  if (claims.exp && claims.exp * 1000 < Date.now()) return null
  return {
    id: claims.userId || claims.sub,
    email: claims.email || claims.sub,
    role: claims.role,
    name: claims.name,
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = tokenStorage.get()
    return token ? userFromToken(token) : null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = tokenStorage.get()
    if (token && !user) {
      const u = userFromToken(token)
      if (u) setUser(u)
      else tokenStorage.clear()
    }
  }, [user])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const data = await authApi.login({ email, password })
      const token = data.token || data.accessToken
      if (!token) throw new Error('Resposta de login sem token.')
      tokenStorage.set(token)
      const u = userFromToken(token) || {
        id: data.userId,
        email: data.email || email,
        role: data.role,
        name: data.name,
      }
      setUser(u)
      return u
    } finally {
      setLoading(false)
    }
  }

  const register = async (payload) => {
    setLoading(true)
    try {
      return await authApi.register(payload)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authApi.logout().catch(() => {})
    tokenStorage.clear()
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
