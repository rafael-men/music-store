import { useEffect, useMemo, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Hero from '../Components/Hero'
import ProductCarousel from '../Components/ProductCarousel'
import CategoryBanners from '../Components/CategoryBanners'
import ArtistBanners from '../Components/ArtistBanners'
import ConcertsSection from '../Components/ConcertsSection'
import { productsApi } from '../api/products'
import { extractErrorMessage } from '../api/client'

const DEALS_PRICE_LIMIT = 100

const isDeal = (product) => {
  const cats = product.categories || []
  if (cats.includes('DAILY_DEALS')) return true
  if (typeof product.price === 'number' && product.price > 0 && product.price <= DEALS_PRICE_LIMIT) return true
  return false
}

const matchesCategories = (product, cats) =>
  (product.categories || []).some((c) => cats.includes(c))

const groupProducts = (products) => {
  const featured = products
    .filter((p) => matchesCategories(p, ['NEW_ARRIVALS']))
    .slice(0, 14)
  const deals = products
    .filter(isDeal)
    .sort((a, b) => (a.price || 0) - (b.price || 0))
    .slice(0, 10)
  const recommended = products
    .filter((p) => matchesCategories(p, ['DEATH_METAL', 'BLACK_METAL', 'HEAVY_METAL']))
    .slice(0, 10)

 
  return {
    featured:    featured.length    ? featured    : products.slice(0, 14),
    deals:       deals.length       ? deals       : products.slice(0, 10),
    recommended: recommended.length ? recommended : products.slice(10, 20),
  }
}

const MainPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    productsApi
      .list()
      .then((data) => {
        if (!cancelled) setProducts(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, 'Não foi possível carregar os produtos.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const groups = useMemo(() => groupProducts(products), [products])

  return (
    <div className="min-h-screen bg-transparent">
      <Hero />
      <div className="container mx-auto px-4 pt-8 pb-16">
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Bem-vindo à Music Store</h1>
          <p className="text-gray-400 text-sm sm:text-base">A melhor loja de artigos musicais</p>
        </div>

        {loading && (
          <div className="text-center py-20 text-gray-500">Carregando produtos...</div>
        )}

        {error && !loading && (
          <div className="bg-red-900/20 border border-red-900/40 rounded-xl p-6 text-center text-red-300 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20 text-gray-500 text-sm">
            Nenhum produto cadastrado no momento.
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <ProductCarousel title="Recém Chegados" items={groups.featured} />
            <CategoryBanners />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-2">
              <ProductCarousel title="Ofertas da Semana" items={groups.deals} compact />
              <ProductCarousel title="Baseado no que você viu" items={groups.recommended} compact />
            </div>
            <ArtistBanners />
            <ConcertsSection />
          </>
        )}
      </div>
    </div>
  )
}

export default MainPage
