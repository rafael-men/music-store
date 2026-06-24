import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { cartApi } from '../api/cart'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

const emptyCart = { id: null, userId: null, items: [], total: 0 }

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [cart, setCart] = useState(emptyCart)
  const [loading, setLoading] = useState(false)
  const lastUserIdRef = useRef(null)


  if (lastUserIdRef.current !== (user?.id || null)) {
    lastUserIdRef.current = user?.id || null
    if (cart.userId && cart.userId !== (user?.id || null) && cart !== emptyCart) {
      setCart(emptyCart)
    }
  }

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setCart(emptyCart)
      return
    }
    setLoading(true)
    try {
      const data = await cartApi.get(user.id)
      setCart(data || emptyCart)
    } catch (err) {
      if (err?.response?.status === 404) {
        setCart({ ...emptyCart, userId: user.id })
      }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addItem = useCallback(async (item) => {
    if (!isAuthenticated || !user?.id) return null
    const updated = await cartApi.addItem(user.id, item)
    setCart(updated)
    return updated
  }, [isAuthenticated, user?.id])

  const removeItem = useCallback(async (productId) => {
    if (!isAuthenticated || !user?.id) return null
    const updated = await cartApi.removeItem(user.id, productId)
    setCart(updated)
    return updated
  }, [isAuthenticated, user?.id])

  const clear = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return null
    const updated = await cartApi.clear(user.id)
    setCart(updated)
    return updated
  }, [isAuthenticated, user?.id])

  const itemCount = useMemo(
    () => (cart?.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0),
    [cart]
  )

  const value = useMemo(
    () => ({ cart, itemCount, loading, refresh, addItem, removeItem, clear, setCart }),
    [cart, itemCount, loading, refresh, addItem, removeItem, clear]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
