import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ArrowLeft, ShoppingBag, LogIn } from 'lucide-react'
import OrderCard from './OrderCard'
import { STATUS_FILTERS } from './constants'
import { useAuth } from '../../contexts/AuthContext'
import { ordersApi } from '../../api/orders'
import { extractErrorMessage } from '../../api/client'

const LoginRequired = () => (
  <div className="min-h-screen bg-transparent text-white flex items-center justify-center px-4 py-12">
    <div className="w-full max-w-md text-center glass-card rounded-2xl p-8">
      <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4">
        <Package size={22} className="text-white" />
      </div>
      <h2 className="text-lg font-semibold mb-1">Faça login para ver seus pedidos</h2>
      <p className="text-sm text-gray-400 mb-6">Você precisa estar logado para acompanhar o histórico.</p>
      <Link to="/login" className="inline-flex items-center justify-center gap-2 text-sm font-medium text-black bg-white py-2.5 px-4 rounded-lg no-underline hover:bg-gray-200 transition-colors">
        <LogIn size={14} />
        Entrar
      </Link>
    </div>
  </div>
)

const MyOrdersContent = ({ userId }) => {
  const [filter, setFilter] = useState('ALL')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    ordersApi.byUser(userId)
      .then((data) => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : []
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        setOrders(list)
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, 'Falha ao carregar pedidos.'))
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [userId])

  const filtered = useMemo(() => {
    if (filter === 'ALL') return orders
    return orders.filter((o) => o.status === filter)
  }, [filter, orders])

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-3xl">
        <Link
          to="/perfil"
          className="inline-flex items-center gap-2 text-sm text-gray-400 no-underline hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Voltar ao perfil
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Package size={22} className="text-white" />
          <h2 className="text-2xl font-bold text-white">Meus pedidos</h2>
        </div>
        <p className="text-sm text-gray-400 mb-6">Acompanhe o status e histórico dos seus pedidos.</p>

        {error && (
          <div className="bg-red-900/20 border border-red-900/40 rounded-lg px-4 py-3 mb-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                filter === f.value
                  ? 'bg-white text-black border-white'
                  : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-600 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 text-sm">Carregando pedidos...</div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <ShoppingBag size={36} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 mb-1">
              {filter === 'ALL' ? 'Você ainda não tem pedidos.' : 'Nenhum pedido nesta categoria.'}
            </p>
            {filter === 'ALL' && (
              <Link
                to="/"
                className="inline-block mt-3 text-sm text-white font-medium no-underline hover:underline"
              >
                Explorar produtos →
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const MyOrders = () => {
  const { isAuthenticated, user } = useAuth()
  return isAuthenticated && user?.id
    ? <MyOrdersContent userId={user.id} />
    : <LoginRequired />
}

export default MyOrders
