import { Clock, CheckCircle2, Truck, XCircle } from 'lucide-react'

export const STATUS_OPTIONS = [
  { label: 'Pendente',   value: 'PENDING' },
  { label: 'Confirmado', value: 'CONFIRMED' },
  { label: 'Enviado',    value: 'SHIPPED' },
  { label: 'Entregue',   value: 'DELIVERED' },
  { label: 'Cancelado',  value: 'CANCELLED' },
]

export const STATUS_META = {
  PENDING:   { label: 'Pendente',   Icon: Clock,        color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  CONFIRMED: { label: 'Confirmado', Icon: CheckCircle2, color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30' },
  SHIPPED:   { label: 'Enviado',    Icon: Truck,        color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30' },
  DELIVERED: { label: 'Entregue',   Icon: CheckCircle2, color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30' },
  CANCELLED: { label: 'Cancelado',  Icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30' },
}

export const ALLOWED_TRANSITIONS = {
  PENDING:   ['PENDING', 'CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CONFIRMED', 'SHIPPED', 'CANCELLED'],
  SHIPPED:   ['SHIPPED', 'DELIVERED'],
  DELIVERED: ['DELIVERED'],
  CANCELLED: ['CANCELLED'],
}

export const TRACKING_EDITABLE_STATUSES = new Set(['CONFIRMED', 'SHIPPED'])

export const isTransitionAllowed = (from, to) => {
  const allowed = ALLOWED_TRANSITIONS[from] || [from]
  return allowed.includes(to)
}
