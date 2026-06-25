import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const ARTISTS = [
  {
    name: 'Tool',
    tagline: 'Discografia completa',
    image: 'https://akamai.sscdn.co/uploadfile/letras/fotos/a/1/e/f/a1efe3ed557c9d23a2cef05f7be7db86.jpg',
    query: 'tool',
    cta: 'Explorar coleção',
  },
  {
    name: 'Katatonia',
    tagline: 'Doom metal melódico',
    image: 'https://i.scdn.co/image/ab67616d0000b2739b61484e5515745a00a23096',
    query: 'katatonia',
    cta: 'Ver produtos',
  },
  {
    name: 'Opeth',
    tagline: 'Progressivo sueco',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTybN5e_9icXjGzhmhhR1w657eZ-k5L5lvVGDeyf5YsH8AL-niqPEVbV5g&s=10',
    query: 'opeth',
    cta: 'Ver produtos',
  },
]

const AUTO_DELAY = 6000

const ArtistBanners = () => {
  const navigate = useNavigate()
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setActive((i) => (i + 1) % ARTISTS.length), AUTO_DELAY)
    return () => clearInterval(t)
  }, [paused])

  const goTo = (i) => setActive((i + ARTISTS.length) % ARTISTS.length)
  const goPrev = () => goTo(active - 1)
  const goNext = () => goTo(active + 1)

  const goToArtist = (query) => navigate(`/busca?q=${encodeURIComponent(query)}`)

  const sideArtists = ARTISTS.filter((_, i) => i !== active)

  return (
    <section className="mb-10 mt-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Bandas em destaque</h2>
        <span className="hidden sm:flex items-center gap-1">
          {ARTISTS.map((a, i) => (
            <button
              key={a.name}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Mostrar ${a.name}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[420px] md:h-[460px]">

        <div
          className="md:col-span-2 relative overflow-hidden rounded-2xl glass-card group"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {ARTISTS.map((a, i) => (
            <div
              key={a.name}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === active ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={a.image}
                alt={a.name}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-pink-300 mb-2">{a.tagline}</p>
                <h3 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">{a.name}</h3>
                <button
                  type="button"
                  onClick={() => goToArtist(a.query)}
                  className="inline-flex items-center gap-2 text-sm font-bold text-white bg-pink-600 hover:bg-pink-500 px-5 py-2.5 rounded-md transition-colors"
                >
                  {a.cta}
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={goPrev}
            aria-label="Banda anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-white/40 text-white/80 hover:text-white hover:border-white flex items-center justify-center transition-all opacity-0 md:opacity-0 group-hover:opacity-100 backdrop-blur-sm bg-black/20"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Próxima banda"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-white/40 text-white/80 hover:text-white hover:border-white flex items-center justify-center transition-all opacity-0 md:opacity-0 group-hover:opacity-100 backdrop-blur-sm bg-black/20"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="hidden md:grid grid-rows-2 gap-4">
          {sideArtists.map((a) => (
            <button
              key={a.name}
              type="button"
              onClick={() => goToArtist(a.query)}
              className="relative overflow-hidden rounded-2xl glass-card text-left group cursor-pointer"
            >
              <img
                src={a.image}
                alt={a.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-pink-300 mb-1">{a.tagline}</p>
                <h3 className="text-xl font-extrabold text-white mb-2 drop-shadow">{a.name}</h3>
                <span className="inline-block text-[11px] font-bold text-white bg-pink-600 group-hover:bg-pink-500 px-3 py-1 rounded transition-colors">
                  Ver produtos
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ArtistBanners
