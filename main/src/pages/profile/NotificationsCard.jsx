import { useEffect, useState } from 'react'
import { Bell, ChevronDown, ChevronUp, Package, Truck, CheckCircle2, XCircle } from 'lucide-react'
import { notificationsApi } from '../../api/notifications'
import { formatDateTime } from '../../utils/format'

const TYPE_META = {
  ORDER_CONFIRMED: { Icon: Package,       color: 'text-blue-400'   },
  ORDER_SHIPPED:   { Icon: Truck,         color: 'text-cyan-400'   },
  ORDER_DELIVERED: { Icon: CheckCircle2,  color: 'text-green-400'  },
  ORDER_CANCELLED: { Icon: XCircle,       color: 'text-red-400'    },
  GENERAL:         { Icon: Bell,          color: 'text-gray-400'   },
}

const NotificationsCard = ({ userId }) => {
  const [expanded, setExpanded] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    if (!userId) return
    setLoading(true)
    setError('')
    notificationsApi.byUser(userId)
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        setNotifications(list)
      })
      .catch(() => setError('Falha ao carregar notificações.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleToggle = async () => {
    const willExpand = !expanded
    setExpanded(willExpand)
    if (willExpand && unreadCount > 0) {
      const unread = notifications.filter((n) => !n.read)
      setNotifications((prev) => prev.map((n) => n.read ? n : { ...n, read: true }))
      await Promise.all(unread.map((n) => notificationsApi.markAsRead(n.id).catch(() => {})))
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-4">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center gap-4 px-6 py-4 text-left text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-150"
      >
        <Bell size={16} className="text-gray-500 shrink-0" />
        <span className="flex-1">Notificações</span>
        {unreadCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
            {unreadCount}
          </span>
        )}
        {expanded ? <ChevronUp size={14} className="text-gray-600" /> : <ChevronDown size={14} className="text-gray-600" />}
      </button>

      {expanded && (
        <div className="border-t border-gray-800 max-h-80 overflow-y-auto">
          {loading ? (
            <p className="text-xs text-gray-500 px-6 py-4">Carregando...</p>
          ) : error ? (
            <p className="text-xs text-red-400 px-6 py-4">{error}</p>
          ) : notifications.length === 0 ? (
            <p className="text-xs text-gray-500 px-6 py-6 text-center">Nenhuma notificação ainda.</p>
          ) : (
            <ul className="divide-y divide-gray-800">
              {notifications.map((n) => {
                const meta = TYPE_META[n.type] || TYPE_META.GENERAL
                const Icon = meta.Icon
                return (
                  <li key={n.id} className="px-6 py-3 flex items-start gap-3">
                    <Icon size={14} className={`${meta.color} mt-0.5 shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 leading-snug">{n.message}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{formatDateTime(n.createdAt)}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationsCard
