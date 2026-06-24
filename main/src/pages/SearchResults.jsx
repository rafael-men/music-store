import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon } from 'lucide-react'
import ProductCard from '../Components/ProductCard'
import { productsApi } from '../api/products'
import { extractErrorMessage } from '../api/client'
import { formatCategory } from '../utils/categories'

const SearchResults = () => {
  const [params] = useSearchParams()
  const q = (params.get('q') || '').trim()
  const category = params.get('category') || ''
  const minPrice = params.get('min') ? Number(params.get('min')) : 0
  const maxPrice = params.get('max') ? Number(params.get('max')) : Infinity

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    const reqParams = {}
    if (q) reqParams.search = q
    if (category) reqParams.category = category
    productsApi
      .list(reqParams)
      .then((data) => {
        if (!cancelled) setProducts(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, 'Falha ao buscar produtos.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [q, category])

  const results = useMemo(
    () => products.filter((p) => {
      const price = typeof p.price === 'number' ? p.price : 0
      return price >= minPrice && price <= maxPrice
    }),
    [products, minPrice, maxPrice]
  )

  const hasFilter = q || category || params.get('min') || params.get('max')

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="container mx-auto px-4 pt-8 pb-16">
        <div className="border-l-4 border-l-gray-500 pl-4 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <SearchIcon size={14} className="text-gray-400 shrink-0" />
            <span className="text-xs text-gray-500 uppercase tracking-widest">Busca</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {q ? `Resultados para "${q}"` : 'Resultados da busca'}
          </h1>
          {hasFilter && (
            <p className="text-gray-400 text-sm mt-1">
              {category && <span className="mr-3">Categoria: <span className="text-gray-200">{formatCategory(category)}</span></span>}
              {(params.get('min') || params.get('max')) && (
                <span>
                  Preço: R${minPrice.toFixed(0)} – {maxPrice === Infinity ? '∞' : `R$${maxPrice.toFixed(0)}`}
                </span>
              )}
            </p>
          )}
        </div>

        {loading && <div className="text-center py-24 text-gray-500">Buscando...</div>}

        {error && !loading && (
          <div className="bg-red-900/20 border border-red-900/40 rounded-xl p-6 text-center text-red-300 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="text-center py-24 text-gray-600">
            <p className="text-lg">Nenhum produto encontrado com esses filtros.</p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <>
            <p className="text-xs text-gray-500 mb-6">
              {results.length} {results.length === 1 ? 'produto' : 'produtos'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SearchResults
