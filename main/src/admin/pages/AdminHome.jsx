import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Package, Users, TrendingUp, Clock, CheckCircle2, Truck, XCircle } from 'lucide-react'
import { ordersApi } from '../../api/orders'
import { productsApi } from '../../api/products'
import { usersApi } from '../../api/users'
import { extractErrorMessage } from '../../api/client'

const STATUS_META = {
  PENDING:   { label: 'Pendente',   Icon: Clock,        color: 'text-yellow-400' },
  CONFIRMED: { label: 'Confirmado', Icon: CheckCircle2, color: 'text-blue-400' },
  SHIPPED:   { label: 'Enviado',    Icon: Truck,        color: 'text-cyan-400' },
  DELIVERED: { label: 'Entregue',   Icon: CheckCircle2, color: 'text-green-400' },
  CANCELLED: { label: 'Cancelado',  Icon: XCircle,      color: 'text-red-400' },
}

const shortcuts = [
  { to: '/admin/pedidos',  label: 'Gerenciar pedidos',   description: 'Ver, atualizar status e adicionar rastreamento.', Icon: ShoppingBag },
  { to: '/admin/produtos', label: 'Catálogo de produtos', description: 'Cadastrar, editar e remover produtos da loja.',  Icon: Package },
  { to: '/admin/usuarios', label: 'Usuários',            description: 'Listar e gerenciar contas de clientes.',          Icon: Users },
]

const formatBRL = (value) =>
  (typeof value === 'number' ? value : 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const isCurrentMonth = (iso) => {
  if (!iso) return false
  const d = new Date(iso)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

const AdminHome = () => {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      ordersApi.list().catch(() => []),
      productsApi.list().catch(() => []),
      usersApi.list().catch(() => []),
    ])
      .then(([o, p, u]) => {
        if (cancelled) return
        setOrders(Array.isArray(o) ? o : [])
        setProducts(Array.isArray(p) ? p : [])
        setUsers(Array.isArray(u) ? u : [])
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, 'Falha ao carregar dashboard.'))
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const usersById = useMemo(() => {
    const m = {}
    for (const u of users) m[u.id] = u
    return m
  }, [users])

  const stats = useMemo(() => {
    const monthRevenue = orders
      .filter((o) => o.status !== 'CANCELLED' && isCurrentMonth(o.createdAt))
      .reduce((sum, o) => sum + (o.total || 0), 0)
    const pending = orders.filter((o) => o.status === 'PENDING').length
    const activeProducts = products.filter((p) => p.available !== false).length
    return [
      { label: 'Receita do mês',       value: formatBRL(monthRevenue), Icon: TrendingUp, accent: 'text-green-400' },
      { label: 'Pedidos pendentes',    value: String(pending),         Icon: Clock,      accent: 'text-yellow-400' },
      { label: 'Produtos ativos',      value: String(activeProducts),  Icon: Package,    accent: 'text-cyan-400' },
      { label: 'Usuários cadastrados', value: String(users.length),    Icon: Users,      accent: 'text-purple-400' },
    ]
  }, [orders, products, users])

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5)
  }, [orders])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Visão geral</h1>
        <p className="text-sm text-gray-400 mt-1">Resumo da operação da loja.</p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-900/40 rounded-lg px-4 py-3 mb-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map(({ label, value, Icon, accent }) => (
          <div key={label} className="glass-card rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs text-gray-500">{label}</span>
              <Icon size={16} className={accent} />
            </div>
            <p className="text-2xl font-bold text-white">{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
        {shortcuts.map(({ to, label, description, Icon }) => (
          <Link
            key={to}
            to={to}
            className="glass-card rounded-xl p-4 no-underline hover:border-gray-600 transition-colors group"
          >
            <Icon size={20} className="text-gray-400 group-hover:text-white transition-colors mb-3" />
            <p className="text-sm font-semibold text-white mb-1">{label}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
          </Link>
        ))}
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white">Pedidos recentes</h2>
          <Link to="/admin/pedidos" className="text-xs text-gray-400 no-underline hover:text-white transition-colors">
            Ver todos →
          </Link>
        </div>
        {loading ? (
          <div className="px-5 py-8 text-center text-gray-500 text-sm">Carregando...</div>
        ) : recentOrders.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-500 text-sm">Nenhum pedido ainda.</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {recentOrders.map((o) => {
              const meta = STATUS_META[o.status] || STATUS_META.PENDING
              const StatusIcon = meta.Icon
              const customerName = usersById[o.userId]?.name || o.userId || '—'
              return (
                <div key={o.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-800/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono text-white truncate">#{o.id}</p>
                    <p className="text-xs text-gray-500 truncate">{customerName}</p>
                  </div>
                  <span className="text-sm font-medium text-green-400 shrink-0">{formatBRL(o.total)}</span>
                  <span className={`inline-flex items-center gap-1 text-xs ${meta.color} shrink-0`}>
                    <StatusIcon size={12} />
                    {meta.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminHome
