import { Link } from 'react-router-dom'
import { Dialog } from 'primereact/dialog'
import { LogIn, X } from 'lucide-react'

const LoginPromptModal = ({
  visible,
  onHide,
  title = 'Faça login para continuar',
  message = 'Você precisa estar logado para realizar esta ação.',
}) => (
  <Dialog
    visible={visible}
    onHide={onHide}
    showHeader={false}
    modal
    dismissableMask
    pt={{
      mask: { className: 'bg-black/70 backdrop-blur-sm' },
      root: { className: 'w-full max-w-sm mx-4' },
      content: { className: 'glass-popover rounded-2xl overflow-hidden p-0' },
    }}
  >
    <div className="relative p-6 text-center">
      <button
        type="button"
        onClick={onHide}
        aria-label="Fechar"
        className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
      >
        <X size={18} />
      </button>

      <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4">
        <LogIn size={22} className="text-white" />
      </div>

      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-400 mb-5">{message}</p>

      <div className="flex flex-col gap-2">
        <Link
          to="/login"
          onClick={onHide}
          className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-black bg-white py-2.5 rounded-lg no-underline hover:bg-gray-200 transition-colors"
        >
          <LogIn size={14} />
          Entrar
        </Link>
        <Link
          to="/register"
          onClick={onHide}
          className="w-full inline-flex items-center justify-center text-sm font-medium text-gray-300 border border-gray-700 py-2.5 rounded-lg no-underline hover:border-gray-500 hover:text-white transition-colors"
        >
          Criar conta
        </Link>
      </div>
    </div>
  </Dialog>
)

export default LoginPromptModal
