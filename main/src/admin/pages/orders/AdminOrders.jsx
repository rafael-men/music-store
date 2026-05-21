import { useEffect, useMemo, useRef, useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Toast } from 'primereact/toast'
import { ShoppingBag, Search } from 'lucide-react'
import { ordersApi } from '../../../api/orders'
import { usersApi } from '../../../api/users'
import { extractErrorMessage } from '../../../api/client'
import { STATUS_OPTIONS, STATUS_META, TRACKING_EDITABLE_STATUSES, isTransitionAllowed } from '../../../utils/orderStatus'
import { dropdownPt } from '../../components/primeReactPt'
import OrdersTable from './OrdersTable'
import OrderEditDialog from './OrderEditDialog'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [usersById, setUsersById] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(null)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const toast = useRef(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      ordersApi.list().catch(() => []),
      usersApi.list().catch(() => []),
    ])
      .then(([ordersData, usersData]) => {
        if (cancelled) return
        const userMap = {}
        for (const u of usersData || []) userMap[u.id] = u
        setUsersById(userMap)
        setOrders(Array.isArray(ordersData) ? ordersData : [])
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, 'Falha ao carregar pedidos.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const enriched = useMemo(
    () => orders.map((o) => {
      const user = usersById[o.userId]
      return {
        ...o,
        customer: user?.name || '—',
        email: user?.email || o.userId,
        address: user?.address || null,
        itemsCount: (o.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0),
      }
    }),
    [orders, usersById]
  )

  const filtered = useMemo(() => {
    return enriched.filter((o) => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        (o.id || '').toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q)
      const matchStatus = !statusFilter || o.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [enriched, search, statusFilter])

  const openEdit = (row) => {
    setEditing(row)
    setEditForm({
      status: row.status,
      trackingCode: row.trackingCode || '',
      carrier: row.carrier || 'Correios',
      trackingUrl: row.trackingUrl || '',
    })
  }

  const closeEdit = () => {
    setEditing(null)
    setEditForm(null)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      let updated = null

      if (!isTransitionAllowed(editing.status, editForm.status)) {
        toast.current?.show({
          severity: 'warn',
          summary: 'Transição não permitida',
          detail: `Não é possível mudar de ${STATUS_META[editing.status].label} para ${STATUS_META[editForm.status].label}.`,
          life: 3500,
        })
        return
      }

      if (editForm.status && editForm.status !== editing.status) {
        updated = await ordersApi.updateStatus(editing.id, editForm.status)
      }

      const canEditTracking = TRACKING_EDITABLE_STATUSES.has(editForm.status || editing.status)
      if (canEditTracking && editForm.trackingCode && editForm.carrier) {
        updated = await ordersApi.updateTracking(editing.id, {
          trackingCode: editForm.trackingCode.trim(),
          carrier: editForm.carrier.trim(),
          trackingUrl: editForm.trackingUrl?.trim() || null,
        })
      }

      if (updated) {
        setOrders((prev) => prev.map((o) => (o.id === editing.id ? updated : o)))
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Pedido atualizado',
        detail: `#${editing.id} salvo com sucesso.`,
        life: 2500,
      })
      closeEdit()
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao salvar',
        detail: extractErrorMessage(err, 'Falha ao atualizar pedido.'),
        life: 3500,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Toast ref={toast} position="top-right" />

      <div className="flex items-center gap-3 mb-2">
        <ShoppingBag size={22} className="text-white" />
        <h1 className="text-2xl font-bold text-white">Pedidos</h1>
      </div>
      <p className="text-sm text-gray-400 mb-6">Gerencie pedidos, atualize status e adicione códigos de rastreio.</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" />
          <InputText
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por pedido, cliente ou e-mail"
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
          />
        </div>
        <Dropdown
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.value)}
          options={STATUS_OPTIONS}
          placeholder="Todos os status"
          showClear
          pt={{
            ...dropdownPt,
            root: { className: 'w-full sm:w-56 h-[38px] bg-gray-900 border border-gray-800 rounded-lg flex items-center hover:border-gray-600 focus-within:border-gray-500 transition-colors' },
          }}
        />
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-900/40 rounded-lg px-4 py-3 mb-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <OrdersTable orders={filtered} loading={loading} onEdit={openEdit} />

      <OrderEditDialog
        order={editing}
        form={editForm}
        setForm={setEditForm}
        saving={saving}
        onSave={handleSave}
        onClose={closeEdit}
      />
    </div>
  )
}

export default AdminOrders
