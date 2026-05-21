import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { XCircle } from 'lucide-react'
import { dialogPt } from './primeReactPt'

const DialogShell = ({
  visible,
  onHide,
  eyebrow,
  title,
  children,
  onCancel,
  onConfirm,
  cancelLabel = 'Cancelar',
  confirmLabel = 'Salvar',
  loadingLabel = 'Salvando...',
  loading = false,
  maxWidth = 'max-w-md',
}) => (
  <Dialog visible={visible} onHide={onHide} showHeader={false} modal dismissableMask pt={dialogPt(maxWidth)}>
    <div className="flex flex-col max-h-[90vh]">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between shrink-0">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{eyebrow}</p>
          )}
          <p className="text-sm font-semibold text-white truncate">{title}</p>
        </div>
        <button
          type="button"
          onClick={onHide}
          className="text-gray-500 hover:text-white transition-colors shrink-0"
          aria-label="Fechar"
        >
          <XCircle size={20} />
        </button>
      </div>

      <div className="p-5 space-y-3 overflow-y-auto flex-1 min-h-0">
        {children}
      </div>

      <div className="flex gap-2 px-5 py-4 border-t border-gray-800 shrink-0">
        <Button
          type="button"
          onClick={onCancel || onHide}
          label={cancelLabel}
          className="flex-1 text-sm font-medium text-gray-300 border border-gray-700 py-2 rounded-lg hover:border-gray-500 hover:text-white transition-colors bg-transparent"
        />
        <Button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          label={loading ? loadingLabel : confirmLabel}
          className="flex-1 text-sm font-medium text-black bg-white py-2 rounded-lg hover:bg-gray-200 transition-colors border-0 disabled:opacity-60"
        />
      </div>
    </div>
  </Dialog>
)

export default DialogShell
