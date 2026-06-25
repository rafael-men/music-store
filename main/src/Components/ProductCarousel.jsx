import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard'

const AUTO_SCROLL_INTERVAL = 5000

const ProductCarousel = ({ title, items, compact = false }) => {
  const scrollerRef = useRef(null)
  const containerRef = useRef(null)
  const autoTimerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [hovered, setHovered] = useState(false)

  const updateScrollState = () => {
    const el = scrollerRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < maxScroll - 4)
  }

  useEffect(() => {
    updateScrollState()
    const el = scrollerRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [items])

  const scrollBy = (direction) => {
    const el = scrollerRef.current
    if (!el) return
    const amount = el.clientWidth * 0.85 * direction
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }


  useEffect(() => {
    if (hovered || !items || items.length === 0) {
      clearInterval(autoTimerRef.current)
      return
    }
    autoTimerRef.current = setInterval(() => {
      const el = scrollerRef.current
      if (!el) return
      const maxScroll = el.scrollWidth - el.clientWidth
      if (el.scrollLeft >= maxScroll - 4) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: el.clientWidth * 0.85, behavior: 'smooth' })
      }
    }, AUTO_SCROLL_INTERVAL)
    return () => clearInterval(autoTimerRef.current)
  }, [hovered, items])

  if (!items || items.length === 0) return null

  const itemWidth = compact
    ? 'w-44 sm:w-40 md:w-44 lg:w-48'
    : 'w-52 sm:w-44 md:w-40 lg:w-44 xl:w-48'

  return (
    <section
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="mb-10"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className={`font-bold text-white ${compact ? 'text-base' : 'text-xl'}`}>{title}</h2>
        <div className={`hidden md:flex items-center gap-1 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Anterior"
            disabled={!canScrollLeft}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-white/10 text-gray-300 bg-white/[0.03] hover:bg-white/10 hover:text-white transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Próximo"
            disabled={!canScrollRight}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-white/10 text-gray-300 bg-white/[0.03] hover:bg-white/10 hover:text-white transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((product) => (
          <div key={product.id} className={`snap-start shrink-0 ${itemWidth} flex`}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}

export default ProductCarousel
