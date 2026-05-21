import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from 'primereact/card'
import { Heart, ShoppingCart, Check } from 'lucide-react'
import ProductImage from './ProductImage'
import { formatCategory } from '../utils/categories'
import { useFavorites } from '../contexts/FavoritesContext'
import { useCart } from '../contexts/CartContext'
import { useLoginPrompt } from '../hooks/useLoginPrompt'
import { extractErrorMessage } from '../api/client'
import LoginPromptModal from './LoginPromptModal'

const formatPrice = (value) => {
  if (typeof value === 'number') {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }
  return value
}

const ProductCard = ({ product }) => {
  const { toggle, isFavorite } = useFavorites()
  const favorited = isFavorite(product.id)
  const { addItem } = useCart()
  const { requireAuth, open, close, config } = useLoginPrompt()
  const [added, setAdded] = useState(false)
  const [adding, setAdding] = useState(false)
  const stock = product.stockQuantity ?? product.stock ?? 0
  const outOfStock = stock === 0

  const handleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    requireAuth(() => toggle(product.id), {
      title: 'Faça login para favoritar',
      message: 'Você precisa estar logado para adicionar produtos aos favoritos.',
    })
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    requireAuth(async () => {
      setAdding(true)
      try {
        await addItem({
          productId: product.id,
          name: product.title,
          image: product.imageUrl || '/assets/652292.png',
          price: product.price,
          quantity: 1,
        })
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
      } catch (err) {
        alert(extractErrorMessage(err, 'Falha ao adicionar ao carrinho.'))
      } finally {
        setAdding(false)
      }
    }, {
      title: 'Faça login para adicionar ao carrinho',
      message: 'Você precisa estar logado para adicionar produtos ao carrinho.',
    })
  }

  return (
    <>
      <Card
        unstyled
        header={
          <div className="relative bg-black w-full overflow-hidden aspect-square">
            <ProductImage
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <button
              type="button"
              onClick={handleFavorite}
              aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              className={`absolute top-2 right-2 p-1.5 rounded-full border backdrop-blur-sm transition-all duration-200 ${
                favorited
                  ? 'bg-red-500/30 border-red-500/60 text-red-400 hover:bg-red-500/40'
                  : 'bg-black/50 border-white/20 text-gray-300 hover:text-red-400 hover:border-red-500/50'
              }`}
            >
              <Heart size={14} fill={favorited ? 'currentColor' : 'none'} />
            </button>
          </div>
        }
        footer={
          <div className="flex items-stretch gap-1.5">
            <Link
              to={`/produto/${product.id}`}
              className="flex-1 text-center no-underline text-[11px] font-medium bg-white text-black py-1.5 px-2 rounded-md hover:bg-gray-200 transition-colors duration-200"
            >
              Ver Detalhes
            </Link>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding || outOfStock}
              aria-label={outOfStock ? 'Sem estoque' : 'Adicionar ao carrinho'}
              className={`shrink-0 inline-flex items-center justify-center w-8 rounded-md border transition-colors duration-200 ${
                added
                  ? 'bg-green-500/20 border-green-500/50 text-green-400'
                  : 'border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {added ? <Check size={13} /> : <ShoppingCart size={13} />}
            </button>
          </div>
        }
        pt={{
          root:    { className: 'group h-full flex flex-col rounded-xl border border-gray-800 bg-gray-900 overflow-hidden hover:border-gray-600 hover:shadow-lg hover:shadow-black/50 hover:-translate-y-0.5 transition-all duration-300 cursor-default' },
          body:    { className: 'flex flex-col flex-1 p-2.5 sm:p-3' },
          content: { className: 'flex flex-col flex-1 p-0' },
          footer:  { className: 'pt-2.5 mt-auto' },
        }}
      >
        <div className="flex flex-wrap gap-1 mb-1.5">
          {product.categories.slice(0, 3).map((cat) => (
            <span key={cat} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700 transition-colors duration-150">
              {formatCategory(cat)}
            </span>
          ))}
        </div>
        <p className="text-[13px] font-semibold text-gray-100 leading-snug mb-1.5 line-clamp-2">{product.title}</p>
        <p className="text-sm font-bold text-green-400 mt-auto">{formatPrice(product.price)}</p>
      </Card>

      <LoginPromptModal visible={open} onHide={close} {...config} />
    </>
  )
}

export default ProductCard
