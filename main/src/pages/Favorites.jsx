import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ArrowLeft, LogIn } from 'lucide-react'
import { useFavorites } from '../contexts/FavoritesContext'
import ProductCard from '../Components/ProductCard'
import { useAuth } from '../contexts/AuthContext'
import { productsApi } from '../api/products'
import { extractErrorMessage } from '../api/client'

const Favorites = () => {
  const { isAuthenticated } = useAuth()
  const { favorites, loading: favoritesLoading } = useFavorites()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    setLoading(true)
    productsApi
      .list()
      .then((data) => {
        if (!cancelled) setProducts(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, 'Falha ao carregar produtos.'))
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center glass-card rounded-2xl p-8">
          <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4">
            <Heart size={22} className="text-white" />
          </div>
          <h2 className="text-lg font-semibold mb-1">Faça login para ver seus favoritos</h2>
          <p className="text-sm text-gray-400 mb-6">Você precisa estar logado para salvar e visualizar produtos favoritos.</p>
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
  }

  const filtered = products.filter((p) => favorites.has(p.id))
  const isLoading = loading || favoritesLoading

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="container mx-auto px-4 pt-8 pb-16">

        <div className="border-l-4 border-l-red-500 pl-4 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Heart size={14} className="text-red-400 shrink-0" />
            <span className="text-xs text-gray-500 uppercase tracking-widest">Lista</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Meus Favoritos</h1>
          <p className="text-gray-400 text-sm mt-1">Produtos que você salvou para depois.</p>
        </div>

        {isLoading && (
          <div className="text-center py-24 text-gray-500 text-sm">Carregando favoritos...</div>
        )}

        {error && !isLoading && (
          <div className="bg-red-900/20 border border-red-900/40 rounded-xl p-6 text-center text-red-300 text-sm">
            {error}
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <div className="text-center py-24 text-gray-600">
            <Heart size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg mb-2">Nenhum favorito ainda.</p>
            <p className="text-sm text-gray-700 mb-6">Clique no coração em qualquer produto para salvá-lo aqui.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 no-underline text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg transition-all duration-200"
            >
              <ArrowLeft size={14} />
              Ir para a loja
            </Link>
          </div>
        )}

        {!isLoading && !error && filtered.length > 0 && (
          <>
            <p className="text-xs text-gray-500 mb-6">
              {filtered.length} {filtered.length === 1 ? 'produto' : 'produtos'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Favorites
