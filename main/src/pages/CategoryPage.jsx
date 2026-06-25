import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Tag, SlidersHorizontal, X } from 'lucide-react'
import ProductCard from '../Components/ProductCard'
import { productsApi } from '../api/products'
import { extractErrorMessage } from '../api/client'
import CategoryFilters from './category/CategoryFilters'
import {
  getOrigin,
  getCondition,
  availableGenres,
  hasGenre,
  availableMerchTypes,
  getMerchType,
} from '../utils/productFilters'

const categoryMeta = {
  'black-metal':               { label: 'Black Metal',                  category: 'BLACK_METAL',           accent: 'text-purple-400',  border: 'border-purple-500/20', description: 'O som mais sombrio e atmosférico do metal extremo.' },
  'death-metal':               { label: 'Death Metal',                  category: 'DEATH_METAL',           accent: 'text-red-400',     border: 'border-red-500/20',    description: 'Riffs pesados, baterias brutais e vocais guturais.' },
  'pop':                       { label: 'Pop',                          category: 'POP',                   accent: 'text-pink-400',    border: 'border-pink-500/20',   description: 'Os maiores hits da música pop mundial.' },
  'brasileira':                { label: 'Brasileira',                   category: 'BRAZILLIAN_MUSIC',      accent: 'text-yellow-400',  border: 'border-yellow-500/20', description: 'O melhor da música nacional.' },
  'produtos-licenciados':      { label: 'Produtos Licenciados',         category: 'OFFICIAL_MERCHANDISE',  accent: 'text-orange-400',  border: 'border-orange-500/20', description: 'Merchandise oficial das suas bandas favoritas.' },
  'vinil':                     { label: 'Vinil',                        category: 'VINYL',                 accent: 'text-blue-400',    border: 'border-blue-500/20',   description: 'A experiência analógica e o som quente do vinil.' },
  'cds-importados-e-nacionais':{ label: 'CDs Importados e Nacionais',   category: 'CD',                    accent: 'text-cyan-400',    border: 'border-cyan-500/20',   description: 'CDs originais importados e nacionais.' },
  'nu-metal':                  { label: 'Nu Metal',                     category: 'NU_METAL',              accent: 'text-green-400',   border: 'border-green-500/20',  description: 'A fusão pesada de metal, rap e rock alternativo.' },
  'metal-progressivo':         { label: 'Metal Progressivo',            category: 'PROG_METAL',            accent: 'text-indigo-400',  border: 'border-indigo-500/20', description: 'Estruturas complexas, virtuosismo técnico e atmosferas conceituais.' },
}

const MUSIC_CATEGORIES = new Set(['CD', 'VINYL'])
const MERCH_CATEGORIES = new Set(['OFFICIAL_MERCHANDISE'])

const initialFilters = {
  search: '',
  origin: 'ALL',
  condition: 'ALL',
  minPrice: '',
  maxPrice: '',
  genres: [],
  merchTypes: [],
}

const CategoryPage = () => {
  const { slug } = useParams()
  const meta = categoryMeta[slug]

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!meta) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError('')
    setFilters(initialFilters)
    productsApi
      .list({ category: meta.category })
      .then((data) => {
        if (!cancelled) setProducts(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, 'Falha ao carregar produtos.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [meta])

  const isMusic = meta && MUSIC_CATEGORIES.has(meta.category)
  const isMerch = meta && MERCH_CATEGORIES.has(meta.category)

  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 0 }
    const prices = products.map((p) => p.price || 0)
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [products])

  const genres = useMemo(() => (isMusic ? availableGenres(products) : []), [products, isMusic])
  const merchTypes = useMemo(() => (isMerch ? availableMerchTypes(products) : []), [products, isMerch])

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    const min = filters.minPrice ? Number(filters.minPrice) : null
    const max = filters.maxPrice ? Number(filters.maxPrice) : null
    return products.filter((p) => {
      if (search && !(p.title || '').toLowerCase().includes(search)) return false
      if (min != null && (p.price || 0) < min) return false
      if (max != null && (p.price || 0) > max) return false
      if (filters.origin !== 'ALL' && getOrigin(p) !== filters.origin) return false
      if (filters.condition !== 'ALL' && getCondition(p) !== filters.condition) return false
      if (filters.genres.length > 0 && !filters.genres.some((g) => hasGenre(p, g))) return false
      if (filters.merchTypes.length > 0) {
        const type = getMerchType(p)
        if (!type || !filters.merchTypes.includes(type)) return false
      }
      return true
    })
  }, [products, filters])

  const resetFilters = () => setFilters(initialFilters)

  if (!meta) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <p className="text-gray-400">Categoria não encontrada.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="container mx-auto px-4 pt-8 pb-16">
        <div className={`border-l-4 ${meta.border.replace('border-', 'border-l-').replace('/20', '')} pl-4 mb-8`}>
          <div className="flex items-center gap-2 mb-1">
            <Tag size={14} className={`${meta.accent} shrink-0`} />
            <span className="text-xs text-gray-500 uppercase tracking-widest">Categoria</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-bold ${meta.accent}`}>{meta.label}</h1>
          <p className="text-gray-400 text-sm mt-1">{meta.description}</p>
        </div>

        {loading && <div className="text-center py-24 text-gray-500">Carregando produtos...</div>}

        {error && !loading && (
          <div className="bg-red-900/20 border border-red-900/40 rounded-xl p-6 text-center text-red-300 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-24 text-gray-600">
            <p className="text-lg">Nenhum produto encontrado nesta categoria.</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
            <div className="hidden lg:block">
              <CategoryFilters
                filters={filters}
                setFilters={setFilters}
                priceRange={priceRange}
                genres={genres}
                merchTypes={merchTypes}
                onReset={resetFilters}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-500">
                  {filtered.length} de {products.length} {products.length === 1 ? 'produto' : 'produtos'}
                </p>
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 text-xs font-medium text-gray-300 bg-white/[0.05] border border-white/[0.1] px-3 py-1.5 rounded-lg hover:bg-white/10"
                >
                  <SlidersHorizontal size={13} />
                  Filtros
                </button>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-500 text-sm">
                  Nenhum produto corresponde aos filtros aplicados.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                  {filtered.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden flex"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="ml-auto w-80 max-w-[85vw] h-full overflow-y-auto bg-gray-900 border-l border-white/10 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Filtros</h3>
                <button type="button" onClick={() => setMobileOpen(false)} aria-label="Fechar">
                  <X size={20} className="text-gray-400 hover:text-white" />
                </button>
              </div>
              <CategoryFilters
                filters={filters}
                setFilters={setFilters}
                priceRange={priceRange}
                genres={genres}
                merchTypes={merchTypes}
                onReset={resetFilters}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryPage
