import { Receipt, XCircle, Printer } from 'lucide-react'
import CopyButton from '../../Components/CopyButton'
import { formatBRL, formatDateTime } from '../../utils/format'

const ReceiptModal = ({ order, onClose }) => {
  const { receipt } = order
  if (!receipt) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-white" />
            <h3 className="text-base font-semibold text-white">Recibo de pagamento</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <XCircle size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          <div className="text-center pb-4 border-b border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Valor pago</p>
            <p className="text-2xl font-bold text-green-400">{formatBRL(order.total)}</p>
            <p className="text-xs text-gray-500 mt-2">via PIX</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Nº do recibo</span>
              <span className="text-white font-mono">{receipt.number}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Pago em</span>
              <span className="text-white">{formatDateTime(receipt.paidAt)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Pedido</span>
              <span className="text-white font-mono text-xs">#{order.id}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Pagador</span>
              <span className="text-white">{receipt.payerName}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">CPF</span>
              <span className="text-white font-mono">{receipt.payerDocument}</span>
            </div>
            <div className="pt-3 border-t border-gray-800">
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-500 shrink-0">ID da transação</span>
                <span className="text-white font-mono text-xs break-all text-right">{receipt.pixTxId}</span>
              </div>
              <div className="mt-1 flex justify-end">
                <CopyButton text={receipt.pixTxId} label="Copiar ID" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 text-sm font-medium text-gray-300 border border-gray-700 py-2 rounded-lg hover:border-gray-500 hover:text-white transition-colors"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-medium text-black bg-white py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Printer size={14} />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReceiptModal
