import { Clock, CheckCircle2, Truck, XCircle, QrCode } from 'lucide-react'

export const STATUS_META = {
  PENDING:   { label: 'Pagamento pendente', Icon: Clock,        color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  CONFIRMED: { label: 'Confirmado',         Icon: CheckCircle2, color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30' },
  SHIPPED:   { label: 'Enviado',            Icon: Truck,        color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30' },
  DELIVERED: { label: 'Entregue',           Icon: CheckCircle2, color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30' },
  CANCELLED: { label: 'Cancelado',          Icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30' },
}

export const PAYMENT_META = {
  PIX: { label: 'PIX', Icon: QrCode },
}

export const STATUS_FILTERS = [
  { value: 'ALL',       label: 'Todos' },
  { value: 'PENDING',   label: 'Pendentes' },
  { value: 'CONFIRMED', label: 'Confirmados' },
  { value: 'SHIPPED',   label: 'Enviados' },
  { value: 'DELIVERED', label: 'Entregues' },
  { value: 'CANCELLED', label: 'Cancelados' },
]
