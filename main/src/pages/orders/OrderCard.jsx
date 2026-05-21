import { useState } from 'react'
import {
  ChevronDown, ChevronUp, Truck, QrCode, Receipt, ExternalLink,
} from 'lucide-react'
import ProductImage from '../../Components/ProductImage'
import CopyButton from '../../Components/CopyButton'
import DeliveryAddress from './DeliveryAddress'
import ReceiptModal from './ReceiptModal'
import { STATUS_META, PAYMENT_META } from './constants'
import { formatBRL, formatDateTime } from '../../utils/format'

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)

  const status = STATUS_META[order.status] || STATUS_META.PENDING
  const StatusIcon = status.Icon
  const payment = PAYMENT_META[order.paymentMethod] || { label: order.paymentMethod, Icon: QrCode }
  const PaymentIcon = payment.Icon
  const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full text-left p-4 hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Pedido</p>
              <p className="text-sm font-mono font-medium text-white truncate">#{order.id}</p>
            </div>
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${status.color} ${status.bg} ${status.border} border px-2 py-0.5 rounded-full shrink-0`}>
              <StatusIcon size={11} />
              {status.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-400">
            <span>{formatDateTime(order.createdAt)}</span>
            <span className="text-gray-700">•</span>
            <span>{itemsCount} {itemsCount === 1 ? 'item' : 'itens'}</span>
            <span className="text-gray-700">•</span>
            <span className="inline-flex items-center gap-1">
              <PaymentIcon size={11} />
              {payment.label}
            </span>
          </div>

          <div className="flex items-end justify-between gap-2 mt-3">
            <div className="min-w-0">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total pago</p>
              <span className="text-lg font-bold text-green-400">{formatBRL(order.total)}</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 shrink-0">
              {expanded ? 'Recolher' : 'Detalhes'}
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </span>
          </div>
        </button>

        {expanded && (
          <div className="border-t border-gray-800 p-3 sm:p-4 bg-gray-950/40 space-y-3">
            <div>
              <p className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-2">Itens</p>
              <div className="flex flex-col gap-2">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-2.5">
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0 bg-gray-800"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate leading-tight">{item.name}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {item.quantity}x {formatBRL(item.price)}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-200 shrink-0">
                      {formatBRL(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-400">Total</span>
                <span className="text-sm font-bold text-green-400">{formatBRL(order.total)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-xl p-3">
              <PaymentIcon size={16} className="text-gray-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white leading-tight">Pago via {payment.label}</p>
                {order.receipt ? (
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">
                    {order.receipt.number}
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-500 mt-0.5">Aguardando pagamento</p>
                )}
              </div>
              {order.receipt && (
                <button
                  type="button"
                  onClick={() => setShowReceipt(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-300 border border-gray-700 px-2.5 py-1.5 rounded-lg hover:border-gray-500 hover:text-white transition-colors shrink-0"
                >
                  <Receipt size={12} />
                  <span className="hidden xs:inline">Ver </span>recibo
                </button>
              )}
            </div>

            {order.shipping?.code && (
              <div className="bg-cyan-500/5 border border-cyan-500/30 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Truck size={13} className="text-cyan-400 shrink-0" />
                  <p className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider">Rastreamento</p>
                </div>
                <div className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 mb-2">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">
                    Código {order.shipping.carrier ? `· ${order.shipping.carrier}` : ''}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-mono font-semibold text-white truncate">{order.shipping.code}</p>
                    <CopyButton text={order.shipping.code} label="Copiar" />
                  </div>
                </div>
                {order.shipping.trackingUrl && (
                  <a
                    href={order.shipping.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-medium text-black bg-white px-4 py-2 rounded-lg no-underline hover:bg-gray-200 transition-colors"
                  >
                    <Truck size={13} />
                    Rastrear pedido
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            )}

            <DeliveryAddress address={order.shipping?.address} />

            {order.status === 'PENDING' && (
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-black bg-white py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <QrCode size={13} />
                Finalizar pagamento
              </button>
            )}
          </div>
        )}
      </div>

      {showReceipt && <ReceiptModal order={order} onClose={() => setShowReceipt(false)} />}
    </>
  )
}

export default OrderCard
