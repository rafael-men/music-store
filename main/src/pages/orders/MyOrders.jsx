import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ArrowLeft, ShoppingBag } from 'lucide-react'
import OrderCard from './OrderCard'
import { STATUS_FILTERS } from './constants'
import { mockOrders } from './mockOrders'

const MyOrders = () => {
  const [filter, setFilter] = useState('ALL')
  const [orders] = useState(mockOrders)

  const filtered = useMemo(() => {
    if (filter === 'ALL') return orders
    return orders.filter((o) => o.status === filter)
  }, [filter, orders])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
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

        {filtered.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
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

export default MyOrders
