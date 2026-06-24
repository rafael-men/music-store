import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Users, ShoppingBag, LogOut, Music2, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const NAV_ITEMS = [
  { to: '/admin', label: 'Visão geral', Icon: LayoutDashboard, end: true },
  { to: '/admin/pedidos', label: 'Pedidos', Icon: ShoppingBag },
  { to: '/admin/produtos', label: 'Produtos', Icon: Package },
  { to: '/admin/usuarios', label: 'Usuários', Icon: Users },
]

const AdminSidebar = ({ open, onClose }) => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const displayName = user?.name || user?.email?.split('@')[0] || 'Admin'

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen w-64 glass-card border-r border-white/[0.08]
          flex flex-col transition-transform duration-200 rounded-none
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              <Music2 size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-none mb-1">Painel</p>
              <p className="text-sm font-semibold text-white truncate leading-none">Music Store</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white transition-colors shrink-0"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-gray-800">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Logado como</p>
          <p className="text-xs text-gray-300 truncate">{displayName}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm no-underline transition-colors
                ${isActive
                  ? 'bg-white text-black font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
