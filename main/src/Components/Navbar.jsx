import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Music2, Menu, X, Heart, Search, LogIn, LogOut } from 'lucide-react'
import SearchBar from './SearchBar'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

const CartIcon = ({ size = 18 }) => {
  const { itemCount } = useCart()
  return (
    <span className="relative inline-flex">
      <ShoppingCart size={size} />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </span>
  )
}

const Navbar = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const [isMobileOpen, setMobileOpen] = useState(false)
  const [isMobileSearchOpen, setMobileSearchOpen] = useState(false)

  const displayName = user?.name || user?.email?.split('@')[0] || 'Conta'

  const handleLogout = () => {
    logout()
    setMobileOpen(false)
    navigate('/')
  }

  return (
    <nav className='text-white bg-black border-b border-gray-800 sticky top-0 z-50'>
      <div className='container mx-auto px-4 py-3 flex justify-between items-center gap-4'>
        <Link to='/' className='flex items-center gap-2 no-underline text-white group shrink-0'>
          <Music2 size={22} className='text-white' />
          <span className='text-xl font-bold tracking-wide group-hover:text-gray-300 transition-colors duration-200 hidden sm:inline'>Music Store</span>
        </Link>

        <div className='hidden md:block flex-1 max-w-xl'>
          <SearchBar />
        </div>

        <div className='hidden md:flex items-center gap-6 shrink-0'>
          <Link to="/favoritos" className='flex items-center gap-2 text-sm font-medium no-underline text-gray-300 hover:text-white transition-colors duration-200'>
            <Heart size={18} />
            <span>Favoritos</span>
          </Link>
          <Link to="/carrinho" className='flex items-center gap-2 text-sm font-medium no-underline text-gray-300 hover:text-white transition-colors duration-200'>
            <CartIcon size={18} />
            <span>Carrinho</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/perfil" className='flex items-center gap-2 text-sm font-medium no-underline text-gray-300 hover:text-white transition-colors duration-200'>
                <User size={18} />
                <span className='max-w-[120px] truncate'>{displayName}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sair"
                className='text-gray-400 hover:text-red-400 transition-colors duration-200'
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link to="/login" className='flex items-center gap-2 text-sm font-medium no-underline text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-colors duration-200 px-4 py-1.5 rounded-lg'>
              <LogIn size={16} />
              <span>Entrar</span>
            </Link>
          )}
        </div>

        <div className='flex items-center gap-2 md:hidden'>
          <button
            className='text-gray-300 hover:text-white transition-colors p-1'
            onClick={() => { setMobileSearchOpen((v) => !v); setMobileOpen(false) }}
            aria-label="Buscar"
          >
            {isMobileSearchOpen ? <X size={22} /> : <Search size={22} />}
          </button>
          <button
            className='text-gray-300 hover:text-white transition-colors p-1'
            onClick={() => { setMobileOpen((v) => !v); setMobileSearchOpen(false) }}
            aria-label="Menu"
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileSearchOpen && (
        <div className="border-t border-gray-800 p-3 md:hidden">
          <SearchBar onSubmit={() => setMobileSearchOpen(false)} />
        </div>
      )}

      {isMobileOpen && (
        <div className="border-t border-gray-800 py-3 md:hidden flex flex-col">
          <Link
            to="/favoritos"
            onClick={() => setMobileOpen(false)}
            className='flex items-center justify-center gap-2 py-2 no-underline text-gray-300 hover:text-white transition-colors'
          >
            <Heart size={16} />
            <span>Favoritos</span>
          </Link>
          <Link
            to="/carrinho"
            onClick={() => setMobileOpen(false)}
            className='flex items-center justify-center gap-2 py-2 no-underline text-gray-300 hover:text-white transition-colors'
          >
            <CartIcon size={16} />
            <span>Carrinho</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/perfil"
                onClick={() => setMobileOpen(false)}
                className='flex items-center justify-center gap-2 py-2 no-underline text-gray-300 hover:text-white transition-colors'
              >
                <User size={16} />
                <span>{displayName}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className='flex items-center justify-center gap-2 py-2 text-red-400 hover:text-red-300 transition-colors'
              >
                <LogOut size={16} />
                <span>Sair</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className='mx-4 mt-2 flex items-center justify-center gap-2 py-2 no-underline text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-colors rounded-lg'
            >
              <LogIn size={16} />
              <span>Entrar</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
