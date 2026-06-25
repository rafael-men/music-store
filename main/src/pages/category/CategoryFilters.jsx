import { Search, X } from 'lucide-react'

const Section = ({ title, children }) => (
  <div className="border-b border-white/[0.06] pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">{title}</p>
    {children}
  </div>
)

const Checkbox = ({ checked, onChange, label, count }) => (
  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors py-1">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 accent-white bg-transparent cursor-pointer"
    />
    <span className="flex-1">{label}</span>
    {typeof count === 'number' && (
      <span className="text-[11px] text-gray-500">{count}</span>
    )}
  </label>
)

const Radio = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors py-1">
    <input
      type="radio"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 accent-white bg-transparent cursor-pointer"
    />
    <span>{label}</span>
  </label>
)

const CategoryFilters = ({
  filters,
  setFilters,
  priceRange,
  genres,
  merchTypes,
  onReset,
}) => {
  const showGenres = genres && genres.length > 0
  const showMerchTypes = merchTypes && merchTypes.length > 0

  const toggleGenre = (value) => {
    setFilters((f) => ({
      ...f,
      genres: f.genres.includes(value)
        ? f.genres.filter((g) => g !== value)
        : [...f.genres, value],
    }))
  }

  const toggleMerchType = (value) => {
    setFilters((f) => ({
      ...f,
      merchTypes: f.merchTypes.includes(value)
        ? f.merchTypes.filter((t) => t !== value)
        : [...f.merchTypes, value],
    }))
  }

  const hasActive =
    filters.search ||
    filters.origin !== 'ALL' ||
    filters.condition !== 'ALL' ||
    filters.genres.length > 0 ||
    filters.merchTypes.length > 0 ||
    filters.minPrice ||
    filters.maxPrice

  return (
    <aside className="glass-card rounded-2xl p-5 sticky top-24 self-start">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">Filtros</h3>
        {hasActive && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors"
          >
            <X size={11} />
            Limpar
          </button>
        )}
      </div>

      <Section title="Buscar">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="Nome do produto"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
          />
        </div>
      </Section>

      <Section title="Faixa de preço">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
            placeholder={`R$ ${Math.floor(priceRange.min)}`}
            min="0"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
          />
          <span className="text-gray-500 text-xs">—</span>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
            placeholder={`R$ ${Math.ceil(priceRange.max)}`}
            min="0"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
          />
        </div>
      </Section>

      <Section title="Origem">
        <Radio
          checked={filters.origin === 'ALL'}
          onChange={() => setFilters((f) => ({ ...f, origin: 'ALL' }))}
          label="Todos"
        />
        <Radio
          checked={filters.origin === 'NATIONAL'}
          onChange={() => setFilters((f) => ({ ...f, origin: 'NATIONAL' }))}
          label="Nacional"
        />
        <Radio
          checked={filters.origin === 'IMPORTED'}
          onChange={() => setFilters((f) => ({ ...f, origin: 'IMPORTED' }))}
          label="Importado"
        />
      </Section>

      <Section title="Condição">
        <Radio
          checked={filters.condition === 'ALL'}
          onChange={() => setFilters((f) => ({ ...f, condition: 'ALL' }))}
          label="Todos"
        />
        <Radio
          checked={filters.condition === 'NEW'}
          onChange={() => setFilters((f) => ({ ...f, condition: 'NEW' }))}
          label="Novo"
        />
        <Radio
          checked={filters.condition === 'USED'}
          onChange={() => setFilters((f) => ({ ...f, condition: 'USED' }))}
          label="Usado"
        />
      </Section>

      {showGenres && (
        <Section title="Gênero">
          <div className="max-h-56 overflow-y-auto pr-1">
            {genres.map((g) => (
              <Checkbox
                key={g.value}
                checked={filters.genres.includes(g.value)}
                onChange={() => toggleGenre(g.value)}
                label={g.label}
              />
            ))}
          </div>
        </Section>
      )}

      {showMerchTypes && (
        <Section title="Tipo">
          {merchTypes.map((t) => (
            <Checkbox
              key={t.value}
              checked={filters.merchTypes.includes(t.value)}
              onChange={() => toggleMerchType(t.value)}
              label={t.label}
            />
          ))}
        </Section>
      )}
    </aside>
  )
}

export default CategoryFilters
