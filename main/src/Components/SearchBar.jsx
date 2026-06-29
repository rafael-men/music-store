import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react'
import ProductImage from './ProductImage'
import { productsApi } from '../api/products'

const CATEGORIES = [
  { label: 'Black Metal',          value: 'BLACK_METAL' },
  { label: 'Death Metal',          value: 'DEATH_METAL' },
  { label: 'Heavy Metal',          value: 'HEAVY_METAL' },
  { label: 'Nu Metal',             value: 'NU_METAL' },
  { label: 'Hard Rock',            value: 'HARD_ROCK' },
  { label: 'Rock',                 value: 'ROCK' },
  { label: 'Prog Metal',           value: 'PROG_METAL' },
  { label: 'Sludge Metal',         value: 'SLUDGE_METAL' },
  { label: 'Pop',                  value: 'POP' },
  { label: 'Folk',                 value: 'FOLK' },
  { label: 'Eletrônica',           value: 'ELECTRONIC' },
  { label: 'Música Brasileira',    value: 'BRAZILLIAN_MUSIC' },
  { label: 'Internacional',        value: 'INTERNATIONAL' },
  { label: 'Underground',          value: 'UNDERGROUND' },
  { label: 'CD',                   value: 'CD' },
  { label: 'Vinil',                value: 'VINYL' },
  { label: 'Merchandise Oficial',  value: 'OFFICIAL_MERCHANDISE' },
]

const DEBOUNCE_MS = 250
const MAX_RESULTS = 5
const formatBRL = (value) =>
  (typeof value === 'number' ? value : 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const SearchBar = ({ onSubmit }) => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [allResults, setAllResults] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const containerRef = useRef(null)
  const debounceRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFiltersOpen(false)
        setSuggestionsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])


  useEffect(() => {
    const trimmed = query.trim()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (abortRef.current) abortRef.current.abort()

    if (trimmed.length < 2) {
      setAllResults([])
      setLoadingSuggestions(false)
      return
    }

    setLoadingSuggestions(true)
    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController()
      abortRef.current = controller
      try {
        const data = await productsApi.list({ search: trimmed })
        if (controller.signal.aborted) return
        setAllResults(Array.isArray(data) ? data : [])
      } catch (err) {
        if (controller.signal.aborted || err?.name === 'CanceledError') return
        setAllResults([])
      } finally {
        if (!controller.signal.aborted) setLoadingSuggestions(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const handleSubmit = (e) => {
    e?.preventDefault?.()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (category) params.set('category', category)
    if (minPrice) params.set('min', minPrice)
    if (maxPrice) params.set('max', maxPrice)
    navigate(`/busca?${params.toString()}`)
    setFiltersOpen(false)
    setSuggestionsOpen(false)
    onSubmit?.()
  }

  const handleSuggestionClick = () => {
    setSuggestionsOpen(false)
    onSubmit?.()
  }

  const clearFilters = () => {
    setCategory('')
    setMinPrice('')
    setMaxPrice('')
  }

  const activeFilterCount = [category, minPrice, maxPrice].filter(Boolean).length
  const visibleSuggestions = allResults.slice(0, MAX_RESULTS)
  const showSuggestions = suggestionsOpen && query.trim().length >= 2 && !filtersOpen

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSuggestionsOpen(true) }}
            onFocus={() => setSuggestionsOpen(true)}
            placeholder="Buscar produtos..."
            className="w-full glass-card rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
            autoComplete="off"
          />
          {loadingSuggestions && (
            <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 animate-spin" />
          )}
        </div>
        <button
          type="button"
          onClick={() => { setFiltersOpen((v) => !v); setSuggestionsOpen(false) }}
          aria-label="Filtros"
          className={`relative p-2 rounded-lg border transition-colors ${filtersOpen ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-600'}`}
        >
          <SlidersHorizontal size={16} />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </form>

   
      {showSuggestions && (
        <div className="absolute left-0 right-12 mt-2 glass-popover rounded-xl overflow-hidden z-50">
          {loadingSuggestions && visibleSuggestions.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500 text-xs">Buscando...</div>
          ) : visibleSuggestions.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500 text-xs">
              Nenhum resultado para "<span className="text-gray-300">{query.trim()}</span>"
            </div>
          ) : (
            <>
              <ul className="max-h-80 overflow-y-auto py-1">
                {visibleSuggestions.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/produto/${p.id}`}
                      onClick={handleSuggestionClick}
                      className="flex items-center gap-3 px-3 py-2 no-underline hover:bg-white/[0.06] transition-colors"
                    >
                      <ProductImage
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-10 h-10 rounded-md object-cover shrink-0 bg-gray-800"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate leading-tight">{p.title}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{formatBRL(p.price)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full text-center text-xs font-medium text-pink-300 hover:text-white hover:bg-white/[0.06] px-4 py-3 border-t border-white/[0.08] transition-colors"
              >
                Ver todos os {allResults.length} {allResults.length === 1 ? 'resultado' : 'resultados'} →
              </button>
            </>
          )}
        </div>
      )}

      {filtersOpen && (
        <div className="absolute right-0 mt-2 w-72 glass-card rounded-xl shadow-xl shadow-black/50 p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white">Filtros</h4>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
              >
                <X size={12} /> Limpar
              </button>
            )}
          </div>

          <label className="block text-xs text-gray-400 mb-1">Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white mb-3 focus:outline-none focus:border-gray-500"
          >
            <option value="">Todas</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <label className="block text-xs text-gray-400 mb-1">Faixa de preço (R$)</label>
          <div className="flex items-center gap-2 mb-4">
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Mín"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
            />
            <span className="text-gray-600 text-xs">até</span>
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Máx"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-white text-black text-sm font-medium py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  )
}

export default SearchBar
