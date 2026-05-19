import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard'

const ProductCarousel = ({ title, items }) => {
  const scrollerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

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

  if (!items || items.length === 0) return null

  return (
    <section className="mb-14 mt-10">
      <div className="flex items-center mb-5">
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>

      <div className="relative md:px-12">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Anterior"
          disabled={!canScrollLeft}
          className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-gray-900 border border-gray-700 text-gray-300 transition-all duration-200 hover:bg-gray-800 hover:border-gray-500 hover:text-white disabled:opacity-0 disabled:pointer-events-none ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`}
        >
          <ChevronLeft size={18} />
        </button>

        <div
          ref={scrollerRef}
          className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory pb-3 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((product) => (
            <div key={product.id} className="snap-start shrink-0 w-52 sm:w-48 md:w-52 flex">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Próximo"
          disabled={!canScrollRight}
          className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-gray-900 border border-gray-700 text-gray-300 transition-all duration-200 hover:bg-gray-800 hover:border-gray-500 hover:text-white disabled:opacity-0 disabled:pointer-events-none ${canScrollRight ? 'opacity-100' : 'opacity-0'}`}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  )
}

export default ProductCarousel
