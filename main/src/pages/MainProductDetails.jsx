import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Typography } from '@material-tailwind/react'
import { Truck, ShoppingCart, CreditCard, Heart } from 'lucide-react'
import StockBadge from '../Components/StockBadge'
import ProductCard from '../Components/ProductCard'
import ProductImage from '../Components/ProductImage'
import { useFavorites } from '../contexts/FavoritesContext'
import { formatCategory } from '../utils/categories'
import { useLoginPrompt } from '../hooks/useLoginPrompt'
import LoginPromptModal from '../Components/LoginPromptModal'
import { productsApi } from '../api/products'
import { useCart } from '../contexts/CartContext'
import { extractErrorMessage } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { calculateShipping, isValidCep, extractShippingError } from '../api/shipping-form'

const formatBRL = (value) =>
  (typeof value === 'number' ? value : 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const ProductDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const { addItem } = useCart()
  const [cep, setCep] = useState('')
  const [freteOptions, setFreteOptions] = useState([])
  const [freteLoading, setFreteLoading] = useState(false)
  const [freteError, setFreteError] = useState('')
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addedToCart, setAddedToCart] = useState(false)

  const { toggle, isFavorite } = useFavorites()
  const favorited = isFavorite(product?.id)
  const { requireAuth, open, close, config } = useLoginPrompt()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setProduct(null)
    setRelated([])

    productsApi
      .get(id)
      .then(async (data) => {
        if (cancelled) return
        setProduct(data)

        const prev = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
        const updated = [data.id, ...prev.filter((i) => i !== data.id)].slice(0, 20)
        localStorage.setItem('recentlyViewed', JSON.stringify(updated))

        const firstCategory = (data.categories || [])[0]
        if (firstCategory) {
          try {
            const list = await productsApi.list({ category: firstCategory })
            if (cancelled) return
            const filtered = (Array.isArray(list) ? list : [])
              .filter((p) => p.id !== data.id)
              .slice(0, 4)
            setRelated(filtered)
          } catch {
            if (!cancelled) setRelated([])
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, 'Produto não encontrado.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id])

  const handleFavorite = () =>
    requireAuth(() => toggle(product.id), {
      title: 'Faça login para favoritar',
      message: 'Você precisa estar logado para adicionar produtos aos favoritos.',
    })

  const handleBuyNow = () =>
    requireAuth(() => alert(`Você comprou: ${product.title}`), {
      title: 'Faça login para comprar',
      message: 'Você precisa estar logado para finalizar a compra.',
    })

  const handleAddToCart = () =>
    requireAuth(async () => {
      try {
        await addItem({
          productId: product.id,
          name: product.title,
          image: product.imageUrl || '/assets/652292.png',
          price: product.price,
          quantity: 1,
        })
        setAddedToCart(true)
        setTimeout(() => setAddedToCart(false), 2500)
      } catch (err) {
        alert(extractErrorMessage(err, 'Falha ao adicionar ao carrinho.'))
      }
    }, {
      title: 'Faça login para adicionar ao carrinho',
      message: 'Você precisa estar logado para adicionar produtos ao carrinho.',
    })

  const handleCepChange = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    const masked = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
    setCep(masked)
  }

  const handleFrete = async () => {
    setFreteError('')
    if (!isValidCep(cep)) {
      setFreteError('Digite um CEP válido (8 dígitos).')
      return
    }
    if (!product) return
    setFreteLoading(true)
    try {
      const results = await calculateShipping({
        toCep: cep,
        items: [{
          productId: product.id,
          name: product.title,
          price: product.price,
          quantity: 1,
          categories: product.categories || [],
        }],
      })
      setFreteOptions(results)
      if (results.length === 0) setFreteError('Nenhum serviço de entrega disponível para este CEP.')
    } catch (err) {
      setFreteError(extractShippingError(err))
      setFreteOptions([])
    } finally {
      setFreteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Carregando produto...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <p className="text-gray-400 text-lg text-center">{error || 'Produto não catalogado.'}</p>
      </div>
    )
  }

  const stock = product.stockQuantity ?? product.stock ?? 0

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:order-1 lg:w-2/5 bg-black flex items-center justify-center shrink-0" style={{ minHeight: '400px' }}>
              <ProductImage
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-contain max-h-[560px]"
              />
            </div>
            <div className="lg:order-2 lg:w-3/5 flex flex-col p-6 md:p-8">

              <div className="flex flex-wrap gap-2 mb-4">
                {(product.categories || []).map(cat => (
                  <span key={cat} className="text-xs px-3 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                    {formatCategory(cat)}
                  </span>
                ))}
              </div>

              <div className="flex items-start justify-between gap-3 mb-3">
                <Typography variant="h3" className="text-white font-bold text-xl sm:text-2xl leading-snug">
                  {product.title}
                </Typography>
                <button
                  onClick={handleFavorite}
                  className={`shrink-0 p-2 rounded-full border transition-all duration-200 ${
                    favorited
                      ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30'
                      : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-red-400 hover:border-red-500/50'
                  }`}
                  aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                  <Heart size={18} fill={favorited ? 'currentColor' : 'none'} />
                </button>
              </div>

              <Typography variant="h2" className="text-green-400 font-bold mb-3 text-3xl">
                {formatBRL(product.price)}
              </Typography>

              <div className="mb-4">
                <StockBadge stock={stock} showLabel />
              </div>

              <hr className="border-t border-gray-800 my-4" />

              <Typography className="text-gray-400 text-sm leading-relaxed mb-6">
                {product.description}
              </Typography>

              <hr className="border-t border-gray-800 my-4" />
              <div className="mb-6">
                <Typography className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Truck size={13} /> Calcular Frete
                </Typography>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="Digite seu CEP"
                    maxLength={9}
                    inputMode="numeric"
                    className="flex-1 min-w-0 bg-gray-800 text-white placeholder-gray-500 border border-gray-600 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-gray-400"
                  />
                  <button
                    onClick={handleFrete}
                    disabled={freteLoading}
                    className="shrink-0 bg-yellow-500 text-white font-semibold py-2 px-5 rounded-full hover:bg-yellow-400 transition-colors duration-200 text-sm disabled:opacity-60"
                  >
                    {freteLoading ? 'Calculando...' : 'Calcular'}
                  </button>
                </div>
                {freteError && (
                  <Typography className="text-red-400 text-xs mt-3">{freteError}</Typography>
                )}
                {freteOptions.length > 0 && (
                  <div className="mt-3 max-h-56 overflow-y-auto pr-1 flex flex-col gap-1">
                    {freteOptions.map((opt) => (
                      <div
                        key={opt.id}
                        className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-gray-800/60 border border-gray-700"
                      >
                        <div className="min-w-0">
                          <p className="text-xs text-white font-medium leading-tight truncate">
                            {opt.company} {opt.name}
                          </p>
                          <p className="text-[10px] text-gray-400 leading-tight">
                            {opt.deliveryTime
                              ? `${opt.deliveryTime} ${opt.deliveryTime === 1 ? 'dia útil' : 'dias úteis'}`
                              : 'Prazo a confirmar'}
                          </p>
                        </div>
                        <span className="text-xs font-bold shrink-0 text-green-400">
                          {formatBRL(opt.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <button
                  onClick={handleBuyNow}
                  disabled={stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors duration-200 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                >
                  <CreditCard size={16} /> Comprar Agora
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-600 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors duration-200 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  <ShoppingCart size={16} /> {addedToCart ? 'Adicionado!' : 'Adicionar ao Carrinho'}
                </button>
              </div>

            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Produtos Relacionados</h2>
              <span className="text-xs text-gray-500">{related.length} {related.length === 1 ? 'produto' : 'produtos'}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <LoginPromptModal visible={open} onHide={close} {...config} />
    </div>
  )
}

export default ProductDetails
