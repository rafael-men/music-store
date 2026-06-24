import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/swiper-bundle.css'
import ProductImage from './ProductImage'
import { productsApi } from '../api/products'
import { generateCarousel } from '../api/carousel'
import { formatCategory } from '../utils/categories'

const Hero = () => {
  const navigate = useNavigate()
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    productsApi
      .list()
      .then(async (products) => {
        if (cancelled) return
        const sorted = [...products].sort((a, b) => {
          const ad = new Date(a.createdAt || 0).getTime()
          const bd = new Date(b.createdAt || 0).getTime()
          return bd - ad
        })
        const latest = sorted.slice(0, 4)
        if (latest.length === 0) {
          setSlides([])
          return
        }
        setSlides(latest.map((p) => ({
          id: p.id,
          title: p.title,
          description: `Confira ${p.title}`,
          imageUrl: null,
          categories: p.categories,
        })))

        const enriched = await generateCarousel(latest)
        if (cancelled) return
        setSlides(enriched.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description || `Confira ${p.title}`,
          imageUrl: p.imageUrl || null,
          categories: p.categories,
        })))
      })
      .catch(() => { if (!cancelled) setSlides([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading && slides.length === 0) {
    return (
      <section className="w-full glass-card rounded-none border-x-0 border-t-0" style={{ height: 'clamp(320px, 55vh, 600px)' }}>
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-gray-500 text-sm">Carregando destaques...</p>
        </div>
      </section>
    )
  }

  if (slides.length === 0) return null

  return (
    <section className="w-full overflow-hidden hero-swiper">
      <style>{`
        .hero-swiper .swiper-button-next,
        .hero-swiper .swiper-button-prev {
          color: rgba(255, 255, 255, 0.85);
          top: 40%;
          width: 44px;
          height: 44px;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(4px);
          border-radius: 9999px;
          transition: background 0.2s ease;
        }
        .hero-swiper .swiper-button-prev { left: 16px; }
        .hero-swiper .swiper-button-next { right: 16px; }
        .hero-swiper .swiper-button-next::after,
        .hero-swiper .swiper-button-prev::after {
          font-size: 18px;
          font-weight: 700;
        }
        .hero-swiper .swiper-button-next:hover,
        .hero-swiper .swiper-button-prev:hover {
          color: rgba(255, 255, 255, 1);
          background: rgba(0, 0, 0, 0.55);
        }
        .hero-swiper .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          background: rgba(255, 255, 255, 1);
        }
      `}</style>
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation
        pagination={{ clickable: true }}
        loop={slides.length > 1}
        slidesPerView={1}
        className="w-full"
      >
        {slides.map((slide) => {
          const mainCategory = (slide.categories || [])[0]
          return (
            <SwiperSlide key={slide.id}>
              <div
                className="relative w-full cursor-pointer"
                style={{ height: 'clamp(320px, 55vh, 600px)' }}
                onClick={() => navigate(`/produto/${slide.id}`)}
              >
                <ProductImage
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gray-300 mb-2">
                    {mainCategory ? formatCategory(mainCategory) : 'Destaque'}
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                    {slide.title}
                  </h2>
                  <p className="text-gray-200 text-sm sm:text-base max-w-xl drop-shadow">
                    {slide.description}
                  </p>
                  <span className="inline-block mt-4 text-xs font-medium text-white bg-white/20 border border-white/30 backdrop-blur-sm px-4 py-1.5 rounded-full hover:bg-white/30 transition-colors duration-200">
                    Ver detalhes →
                  </span>
                </div>
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>
    </section>
  )
}

export default Hero
