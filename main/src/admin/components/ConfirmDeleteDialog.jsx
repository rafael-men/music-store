import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { AlertTriangle } from 'lucide-react'
import { dialogPt } from './primeReactPt'

const ConfirmDeleteDialog = ({
  visible,
  onCancel,
  onConfirm,
  loading = false,
  title = 'Remover item?',
  description = 'Esta ação não pode ser desfeita.',
  warning = null,
  confirmLabel = 'Remover',
  loadingLabel = 'Removendo...',
}) => (
  <Dialog
    visible={visible}
    onHide={onCancel}
    showHeader={false}
    modal
    dismissableMask
    pt={dialogPt('max-w-sm')}
  >
    <div>
      <div className="p-5 text-center">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle size={22} className="text-red-400" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
        {warning && <p className="text-xs text-yellow-400 mt-2">{warning}</p>}
      </div>
      <div className="flex gap-2 px-5 pb-5">
        <Button
          type="button"
          onClick={onCancel}
          label="Cancelar"
          className="flex-1 text-sm font-medium text-gray-300 border border-gray-700 py-2 rounded-lg hover:border-gray-500 hover:text-white transition-colors bg-transparent"
        />
        <Button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          label={loading ? loadingLabel : confirmLabel}
          className="flex-1 text-sm font-medium text-white bg-red-600 py-2 rounded-lg hover:bg-red-500 transition-colors border-0 disabled:opacity-60"
        />
      </div>
    </div>
  </Dialog>
)

export default ConfirmDeleteDialog
