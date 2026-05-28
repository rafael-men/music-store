import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight, LogOut, Pencil, LogIn, User as UserIcon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { authApi } from '../api/auth'
import NotificationsCard from './profile/NotificationsCard'

const DEFAULT_PHOTO = 'https://i.pinimg.com/736x/c0/74/9b/c0749b7cc401421662ae901ec8f9f660.jpg'

const ProfileLoginRequired = () => (
  <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4 py-12">
    <div className="w-full max-w-md text-center bg-gray-900 border border-gray-800 rounded-2xl p-8">
      <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4">
        <UserIcon size={22} className="text-white" />
      </div>
      <h2 className="text-lg font-semibold mb-1">Faça login para acessar seu perfil</h2>
      <p className="text-sm text-gray-400 mb-6">Você precisa estar logado para ver seus dados, pedidos e notificações.</p>
      <div className="flex flex-col gap-2">
        <Link to="/login" className="inline-flex items-center justify-center gap-2 text-sm font-medium text-black bg-white py-2.5 rounded-lg no-underline hover:bg-gray-200 transition-colors">
          <LogIn size={14} />
          Entrar
        </Link>
        <Link to="/register" className="inline-flex items-center justify-center text-sm font-medium text-gray-300 border border-gray-700 py-2.5 rounded-lg no-underline hover:border-gray-500 hover:text-white transition-colors">
          Criar conta
        </Link>
      </div>
    </div>
  </div>
)

const ProfileContent = ({ authUser, onLogout }) => {
  const [user, setUser] = useState({
    name: authUser?.name || authUser?.email?.split('@')[0] || 'Usuário',
    email: authUser?.email || '',
    profileImage: DEFAULT_PHOTO,
  })

  useEffect(() => {
    if (!authUser?.id) return
    let cancelled = false
    authApi
      .getById(authUser.id)
      .then((data) => {
        if (cancelled) return
        setUser({
          name: data.name || authUser.email?.split('@')[0] || 'Usuário',
          email: data.email || authUser.email || '',
          profileImage: data.profilePhotoUrl || DEFAULT_PHOTO,
        })
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [authUser?.id])

  const menuItems = [
    { label: 'Meus Pedidos', Icon: Package, to: '/perfil/pedidos' },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-10 max-w-xl">
        <h2 className="text-2xl font-bold text-white mb-8">Meu Perfil</h2>

        <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4 flex items-center gap-5">
          <img
            src={user.profileImage}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-700 shrink-0"
          />
          <div className="flex-1 min-w-0 pr-10 sm:pr-0">
            <h3 className="text-xl font-semibold text-white truncate">{user.name}</h3>
            <p className="text-gray-500 text-sm mt-0.5 truncate">{user.email}</p>
          </div>
          <Link
            to="/perfil/editar"
            aria-label="Editar perfil"
            className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 border border-gray-700 no-underline hover:border-gray-500 hover:text-white transition-all duration-200 sm:static sm:flex sm:items-center sm:gap-1.5 sm:text-xs sm:font-medium sm:px-3 sm:py-1.5 sm:shrink-0"
          >
            <Pencil size={12} />
            <span className="hidden sm:inline">Editar</span>
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-4">
          {menuItems.map(({ label, Icon, to }, index) => {
            const className = `w-full flex items-center gap-4 px-6 py-4 text-left text-sm text-gray-300 no-underline hover:bg-gray-800 hover:text-white transition-colors duration-150 ${index < menuItems.length - 1 ? 'border-b border-gray-800' : ''}`
            const content = (
              <>
                <Icon size={16} className="text-gray-500 shrink-0" />
                <span className="flex-1">{label}</span>
                <ChevronRight size={14} className="text-gray-600" />
              </>
            )
            return to ? (
              <Link key={label} to={to} className={className}>{content}</Link>
            ) : (
              <button key={label} className={className}>{content}</button>
            )
          })}
        </div>

        <NotificationsCard userId={authUser?.id} />

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-red-500 border border-red-900/50 hover:bg-red-900/20 hover:border-red-700 transition-all duration-200"
        >
          <LogOut size={15} />
          Sair da Conta
        </button>
      </div>
    </div>
  )
}

const Profile = () => {
  const { isAuthenticated, user: authUser, logout } = useAuth()
  return isAuthenticated
    ? <ProfileContent authUser={authUser} onLogout={logout} />
    : <ProfileLoginRequired />
}

export default Profile
