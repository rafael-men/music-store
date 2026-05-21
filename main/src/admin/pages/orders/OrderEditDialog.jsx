import { useMemo } from 'react'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { MapPin } from 'lucide-react'
import DialogShell from '../../components/DialogShell'
import {
  inputClass, inputDisabledClass, labelClass, dropdownPt,
} from '../../components/primeReactPt'
import {
  STATUS_OPTIONS, ALLOWED_TRANSITIONS, TRACKING_EDITABLE_STATUSES,
} from '../../../utils/orderStatus'
import { formatBRL, formatDate } from '../../../utils/format'
import { formatAddressFull } from '../../../utils/address'

const OrderEditDialog = ({ order, form, setForm, saving, onSave, onClose }) => {
  const allowedNextStatuses = useMemo(() => {
    if (!order) return STATUS_OPTIONS
    const allowed = new Set(ALLOWED_TRANSITIONS[order.status] || [order.status])
    return STATUS_OPTIONS.map((opt) => ({
      ...opt,
      disabled: !allowed.has(opt.value),
    }))
  }, [order])

  const canEditTracking = order && TRACKING_EDITABLE_STATUSES.has(form?.status || order.status)

  if (!order || !form) return null

  return (
    <DialogShell
      visible={!!order}
      onHide={onClose}
      eyebrow="Editar pedido"
      title={<span className="font-mono">#{order.id}</span>}
      onConfirm={onSave}
      loading={saving}
      confirmLabel="Salvar alterações"
      maxWidth="max-w-lg"
    >
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-gray-500 mb-0.5">Cliente</p>
          <p className="text-white truncate">{order.customer}</p>
          <p className="text-gray-500 truncate text-[11px]">{order.email}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-0.5">Total pago</p>
          <p className="text-green-400 font-medium">{formatBRL(order.total)}</p>
          <p className="text-gray-500 text-[11px]">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      {order.address && (
        <div className="bg-gray-800/40 border border-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <MapPin size={12} className="text-gray-400" />
            <p className="text-[11px] text-gray-400 uppercase tracking-wider">Endereço de entrega</p>
          </div>
          <p className="text-xs text-gray-200 leading-relaxed">
            {formatAddressFull(order.address) || '—'}
          </p>
        </div>
      )}

      <div>
        <label className={labelClass}>Status</label>
        <Dropdown
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.value }))}
          options={allowedNextStatuses}
          optionDisabled="disabled"
          pt={dropdownPt}
        />
        <p className="text-[11px] text-gray-500 mt-1">
          Apenas transições válidas estão habilitadas.
        </p>
      </div>

      <div className={canEditTracking ? '' : 'opacity-60'}>
        <label className={labelClass}>
          Código de rastreio
          {!canEditTracking && (
            <span className="ml-2 text-[10px] text-yellow-400 normal-case">
              Disponível após confirmação do pagamento
            </span>
          )}
        </label>
        <InputText
          value={form.trackingCode}
          onChange={(e) => setForm((f) => ({ ...f, trackingCode: e.target.value }))}
          placeholder="BR123456789MS"
          disabled={!canEditTracking}
          className={canEditTracking ? inputClass : inputDisabledClass}
        />
      </div>

      <div className={canEditTracking ? '' : 'opacity-60'}>
        <label className={labelClass}>Transportadora</label>
        <InputText
          value={form.carrier}
          onChange={(e) => setForm((f) => ({ ...f, carrier: e.target.value }))}
          placeholder="Correios"
          disabled={!canEditTracking}
          className={canEditTracking ? inputClass : inputDisabledClass}
        />
      </div>
    </DialogShell>
  )
}

export default OrderEditDialog
