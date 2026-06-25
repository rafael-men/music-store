import { useState } from 'react'
import { Search, Calendar, MapPin, Ticket, ExternalLink, Loader2, Music2 } from 'lucide-react'
import { searchConcerts } from '../api/concerts'

const PRESET_ARTISTS = ['Tool', 'Katatonia', 'Opeth', 'Iron Maiden', 'Metallica', 'Slipknot']

const formatDateBadge = (iso) => {
  if (!iso) return { day: '--', month: '---', year: '' }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { day: '--', month: '---', year: '' }
  return {
    day:   String(d.getDate()).padStart(2, '0'),
    month: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase(),
    year:  String(d.getFullYear()),
    time:  d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  }
}

const ConcertsSection = () => {
  const [query, setQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [artist, setArtist] = useState(null)
  const [events, setEvents] = useState([])

  const runSearch = async (q) => {
    const trimmed = (q || '').trim()
    if (!trimmed) return
    setQuery(trimmed)
    setActiveQuery(trimmed)
    setLoading(true)
    setError('')
    setEvents([])
    setArtist(null)
    try {
      const { artist: a, events: ev } = await searchConcerts(trimmed)
      setArtist(a)
      setEvents(ev)
      if (!a) setError(`Não encontramos artistas chamados "${trimmed}".`)
    } catch (err) {
      setError(err?.message || 'Falha ao buscar shows.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    runSearch(query)
  }

  return (
    <section className="mb-10 mt-6 relative overflow-hidden">
      <div aria-hidden className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-pink-600/20 blur-3xl pointer-events-none" />
      <div aria-hidden className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

      <div className="relative glass-card rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-400/40 flex items-center justify-center">
            <Music2 size={18} className="text-pink-300" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-pink-300">Ao vivo</p>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Próximos shows e turnês</h2>
          </div>
        </div>
        <p className="text-sm text-gray-400 mb-5">Veja datas e compre ingressos das suas bandas favoritas.</p>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar shows por banda (ex: Iron Maiden)"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-400/50 focus:bg-white/[0.06] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Buscar
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mb-6">
          {PRESET_ARTISTS.map((name) => {
            const active = activeQuery.toLowerCase() === name.toLowerCase()
            return (
              <button
                key={name}
                type="button"
                onClick={() => runSearch(name)}
                disabled={loading}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? 'bg-pink-500 border-pink-400 text-white'
                    : 'bg-white/[0.04] border-white/[0.1] text-gray-300 hover:border-pink-400/50 hover:text-white'
                } disabled:opacity-50`}
              >
                {name}
              </button>
            )
          })}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Procurando shows…</span>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-900/20 border border-red-900/40 rounded-lg px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && !activeQuery && (
          <div className="text-center py-10 text-gray-500 text-sm">
            Comece clicando em uma banda acima ou buscando pelo nome.
          </div>
        )}

        {!loading && !error && activeQuery && events.length === 0 && artist && (
          <div className="text-center py-10 text-gray-500 text-sm">
            Nenhum show futuro listado para <span className="text-gray-300 font-semibold">{artist.name}</span>.
          </div>
        )}

        {!loading && events.length > 0 && (
          <>
            {artist && (
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/[0.08]">
                {artist.image && (
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-12 h-12 rounded-full object-cover border border-white/10"
                    loading="lazy"
                  />
                )}
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-gray-500">Próximos shows de</p>
                  <p className="text-lg font-bold text-white">{artist.name}</p>
                </div>
                <span className="ml-auto text-xs text-gray-500">{events.length} {events.length === 1 ? 'data' : 'datas'}</span>
              </div>
            )}

            <ul className="flex flex-col gap-2.5 max-h-[520px] overflow-y-auto pr-1">
              {events.map((ev) => {
                const date = formatDateBadge(ev.datetime)
                return (
                  <li
                    key={ev.id}
                    className="flex items-stretch gap-3 sm:gap-4 bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 sm:p-4 hover:border-pink-400/30 hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="shrink-0 w-16 sm:w-20 flex flex-col items-center justify-center bg-pink-600/15 border border-pink-400/30 rounded-lg py-2">
                      <span className="text-[10px] font-bold uppercase text-pink-300 leading-none">{date.month}</span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{date.day}</span>
                      <span className="text-[10px] text-gray-400 leading-none">{date.year}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-semibold text-white leading-tight mb-1 line-clamp-2">
                        {ev.tour || ev.name}
                      </p>
                      {ev.venue && (
                        <p className="inline-flex items-center gap-1 text-[12px] text-gray-300">
                          <MapPin size={12} className="text-gray-500 shrink-0" />
                          <span className="truncate">{ev.venue}</span>
                        </p>
                      )}
                      <p className="text-[11px] text-gray-400 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        {(ev.city || ev.country) && (
                          <span>{[ev.city, ev.state, ev.country].filter(Boolean).join(' · ')}</span>
                        )}
                        {date.time && date.time !== '00:00' && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={11} />
                            {date.time}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center">
                      {ev.ticketsUrl ? (
                        <a
                          href={ev.ticketsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-pink-600 hover:bg-pink-500 px-3 sm:px-4 py-2 rounded-md no-underline transition-colors"
                        >
                          <Ticket size={14} />
                          <span className="hidden sm:inline">Ingressos</span>
                          <ExternalLink size={11} className="opacity-70" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-gray-500 italic px-2">Ingressos indisponíveis</span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
    </section>
  )
}

export default ConcertsSection
