import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'

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

const SearchBar = ({ onSubmit }) => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFiltersOpen(false)
      }
    }
    if (filtersOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [filtersOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (category) params.set('category', category)
    if (minPrice) params.set('min', minPrice)
    if (maxPrice) params.set('max', maxPrice)
    navigate(`/busca?${params.toString()}`)
    setFiltersOpen(false)
    onSubmit?.()
  }

  const clearFilters = () => {
    setCategory('')
    setMinPrice('')
    setMaxPrice('')
  }

  const activeFilterCount = [category, minPrice, maxPrice].filter(Boolean).length

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar produtos..."
            className="w-full glass-card rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
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
