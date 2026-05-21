import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Pencil } from 'lucide-react'
import { adminTablePt, adminColumnPt, adminPaginatorProps } from '../../components/tableStyles'
import { STATUS_META } from '../../../utils/orderStatus'
import { formatBRL, formatDate } from '../../../utils/format'
import { formatAddressShort, formatAddressFull } from '../../../utils/address'

const idTemplate = (row) => (
  <span className="font-mono text-xs text-white">#{row.id?.slice(-8) || '—'}</span>
)

const customerTemplate = (row) => (
  <div className="min-w-0">
    <p className="text-sm text-white truncate leading-tight">{row.customer}</p>
    <p className="text-xs text-gray-500 truncate">{row.email}</p>
  </div>
)

const addressTemplate = (row) => (
  <span className="text-xs text-gray-300" title={formatAddressFull(row.address)}>
    {formatAddressShort(row.address)}
  </span>
)

const statusTemplate = (row) => {
  const meta = STATUS_META[row.status] || STATUS_META.PENDING
  const StatusIcon = meta.Icon
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${meta.color} ${meta.bg} ${meta.border} border px-2 py-0.5 rounded-full`}>
      <StatusIcon size={11} />
      {meta.label}
    </span>
  )
}

const totalTemplate = (row) => (
  <span className="text-sm font-medium text-green-400">{formatBRL(row.total)}</span>
)

const trackingTemplate = (row) =>
  row.trackingCode
    ? <span className="text-xs font-mono text-gray-300">{row.trackingCode}</span>
    : <span className="text-xs text-gray-600">—</span>

const dateTemplate = (row) => (
  <span className="text-xs text-gray-400">{formatDate(row.createdAt)}</span>
)

const OrdersTable = ({ orders, loading, onEdit }) => {
  const actionsTemplate = (row) => (
    <button
      type="button"
      onClick={() => onEdit(row)}
      aria-label={`Editar pedido ${row.id}`}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-300 border border-gray-700 px-2.5 py-1 rounded-lg hover:border-gray-500 hover:text-white transition-colors"
    >
      <Pencil size={12} />
      Editar
    </button>
  )

  return (
    <DataTable
      value={orders}
      pt={adminTablePt}
      rowHover
      stripedRows
      loading={loading}
      {...adminPaginatorProps}
      emptyMessage={loading ? 'Carregando...' : 'Nenhum pedido encontrado.'}
    >
      <Column header="Pedido"    body={idTemplate}       pt={adminColumnPt} />
      <Column header="Cliente"   body={customerTemplate} pt={adminColumnPt} />
      <Column header="Endereço"  body={addressTemplate}  pt={adminColumnPt} />
      <Column header="Total"     body={totalTemplate}    pt={adminColumnPt} />
      <Column header="Status"    body={statusTemplate}   pt={adminColumnPt} />
      <Column header="Rastreio"  body={trackingTemplate} pt={adminColumnPt} />
      <Column header="Data"      body={dateTemplate}     pt={adminColumnPt} />
      <Column header=""          body={actionsTemplate}  pt={adminColumnPt} />
    </DataTable>
  )
}

export default OrdersTable
