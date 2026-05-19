import { useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Hero from '../Components/Hero'
import ProductCarousel from '../Components/ProductCarousel'
import { productsApi } from '../api/products'
import { extractErrorMessage } from '../api/client'

const sections = [
  { key: 'NEW_ARRIVALS', title: 'Recém Chegados',          fallbackCategories: ['NEW_ARRIVALS'] },
  { key: 'DEATH_METAL',  title: 'Baseado no que você viu', fallbackCategories: ['DEATH_METAL', 'BLACK_METAL'] },
  { key: 'DAILY_DEALS',  title: 'Ofertas da Semana',        fallbackCategories: ['DAILY_DEALS'] },
]

const groupProducts = (products) => {
  const groups = {}
  for (const section of sections) {
    groups[section.key] = products.filter((p) =>
      (p.categories || []).some((c) => section.fallbackCategories.includes(c))
    )
  }
  for (const section of sections) {
    if (groups[section.key].length === 0) {
      groups[section.key] = products.slice(0, 8)
    }
  }
  return groups
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

  const groups = groupProducts(products)

  return (
    <div className="min-h-screen bg-gray-950">
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

        {!loading && !error && products.length > 0 && sections.map(({ key, title }) => (
          <ProductCarousel key={key} title={title} items={groups[key] || []} />
        ))}
      </div>
    </div>
  )
}

export default MainPage
