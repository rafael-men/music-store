import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, ArrowLeft } from 'lucide-react'
import ProductCard from '../Components/ProductCard'
import { productsApi } from '../api/products'
import { readJSON, writeJSON } from '../utils/storage'

const RecentlyViewed = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const stored = readJSON(localStorage, 'recentlyViewed', [])
    const viewedIds = Array.isArray(stored) ? stored : []

    if (viewedIds.length === 0) {
      setLoading(false)
      return
    }

    Promise.all(
      viewedIds.map((id) => productsApi.get(id).catch(() => null))
    )
      .then((items) => {
        if (cancelled) return
        const valid = items.filter(Boolean)
        setProducts(valid)
        if (valid.length !== viewedIds.length) {
          writeJSON(localStorage, 'recentlyViewed', valid.map((p) => p.id))
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [])

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="container mx-auto px-4 pt-8 pb-16">
        <div className="border-l-4 border-l-gray-400 pl-4 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-gray-400 shrink-0" />
            <span className="text-xs text-gray-500 uppercase tracking-widest">Histórico</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Vistos Recentemente</h1>
          <p className="text-gray-400 text-sm mt-1">Produtos que você visitou anteriormente.</p>
        </div>

        {loading && (
          <div className="text-center py-24 text-gray-500 text-sm">Carregando histórico...</div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-24 text-gray-600">
            <Clock size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg mb-2">Nenhum produto visitado ainda.</p>
            <p className="text-sm text-gray-700 mb-6">Explore o catálogo e volte aqui para ver seu histórico.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 no-underline text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg transition-all duration-200"
            >
              <ArrowLeft size={14} />
              Ir para a loja
            </Link>
          </div>
        )}

        {!loading && products.length > 0 && (
          <>
            <p className="text-xs text-gray-500 mb-6">{products.length} {products.length === 1 ? 'produto' : 'produtos'} visitados</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default RecentlyViewed
