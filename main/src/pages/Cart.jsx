import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Trash2, ShoppingBag, Check, Truck, QrCode, LogIn, Plus, Minus } from 'lucide-react'
import ProductImage from '../Components/ProductImage'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { extractErrorMessage } from '../api/client'
import { calculateShipping, isValidCep, extractShippingError } from '../api/shipping-form'
import { productsApi } from '../api/products'
import { ordersApi } from '../api/orders'

const formatBRL = (value) =>
  (typeof value === 'number' ? value : 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const LoginRequired = () => (
  <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4 py-12">
    <div className="w-full max-w-md text-center bg-gray-900 border border-gray-800 rounded-2xl p-8">
      <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4">
        <ShoppingCart size={22} className="text-white" />
      </div>
      <h2 className="text-lg font-semibold mb-1">Faça login para acessar o carrinho</h2>
      <p className="text-sm text-gray-400 mb-6">Você precisa estar logado para ver e gerenciar seus produtos.</p>
      <div className="flex flex-col gap-2">
        <Link to="/login" className="inline-flex items-center justify-center gap-2 text-sm font-medium text-black bg-white py-2.5 rounded-lg no-underline hover:bg-gray-200 transition-colors">
          <LogIn size={14} />
          Entrar
        </Link>
        <Link to="/register" className="inline-flex items-center justify-center text-sm font-medium text-gray-300 border border-gray-700 py-2.5 rounded-lg no-underline hover:border-gray-500 hover:text-white transition-colors">
          Criar conta
        </Link>
      </div>
    </div>
  </div>
)

const CartContent = ({ userId }) => {
  const { cart, loading, addItem, removeItem, clear } = useCart()
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)

  const [cep, setCep] = useState('')
  const [frete, setFrete] = useState(null)
  const [freteCalculado, setFreteCalculado] = useState(false)
  const [freteOptions, setFreteOptions] = useState([])
  const [freteSelected, setFreteSelected] = useState(null)
  const [freteLoading, setFreteLoading] = useState(false)
  const [freteError, setFreteError] = useState('')
  const [ordered, setOrdered] = useState(false)
  const [orderInfo, setOrderInfo] = useState(null)

  const items = cart?.items || []
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  const totalComFrete = subtotal + (frete ?? 0)

  const handleAddOne = async (item) => {
    setUpdating(true)
    try {
      await addItem({
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: 1,
      })
    } catch (err) {
      setError(extractErrorMessage(err, 'Falha ao atualizar carrinho.'))
    } finally {
      setUpdating(false)
    }
  }

  const handleRemoveOne = async (item) => {
    setUpdating(true)
    try {
      await removeItem(item.productId)
      if (item.quantity > 1) {
        await addItem({
          productId: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity - 1,
        })
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Falha ao atualizar carrinho.'))
    } finally {
      setUpdating(false)
    }
  }

  const handleRemoveAll = async (item) => {
    setUpdating(true)
    try {
      await removeItem(item.productId)
    } catch (err) {
      setError(extractErrorMessage(err, 'Falha ao remover item.'))
    } finally {
      setUpdating(false)
    }
  }

  const handleCepChange = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    const masked = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
    setCep(masked)
    if (freteCalculado) {
      setFreteCalculado(false)
      setFrete(null)
      setFreteOptions([])
      setFreteSelected(null)
    }
  }

  const handleSelectFrete = (option) => {
    setFreteSelected(option.id)
    setFrete(option.price)
  }

  const handleCalcularFrete = async () => {
    setFreteError('')
    if (!isValidCep(cep)) {
      setFreteError('Digite um CEP válido (8 dígitos).')
      return
    }
    if (items.length === 0) {
      setFreteError('Adicione itens ao carrinho primeiro.')
      return
    }
    setFreteLoading(true)
    try {
      const enriched = await Promise.all(
        items.map(async (item) => {
          try {
            const product = await productsApi.get(item.productId)
            return { ...item, categories: product?.categories || [] }
          } catch {
            return { ...item, categories: [] }
          }
        })
      )
      const results = await calculateShipping({ toCep: cep, items: enriched })
      setFreteOptions(results)
      if (results.length === 0) {
        setFreteError('Nenhum serviço de entrega disponível para este CEP.')
        setFrete(null)
        setFreteCalculado(false)
        return
      }
      setFreteSelected(results[0].id)
      setFrete(results[0].price)
      setFreteCalculado(true)
    } catch (err) {
      setFreteError(extractShippingError(err))
      setFreteOptions([])
      setFrete(null)
      setFreteCalculado(false)
    } finally {
      setFreteLoading(false)
    }
  }

  const handleFinalize = async () => {
    setError('')
    if (!freteCalculado || !freteSelected) {
      setError('Calcule e escolha uma opção de frete antes de finalizar.')
      return
    }
    if (items.length === 0) {
      setError('Seu carrinho está vazio.')
      return
    }
    setUpdating(true)
    try {
      const selectedOption = freteOptions.find((o) => o.id === freteSelected)
      const created = await ordersApi.create({
        userId,
        paymentMethod: 'PIX',
        shippingCost: frete ?? 0,
        shippingService: selectedOption ? `${selectedOption.company} ${selectedOption.name}` : null,
        shippingCarrier: selectedOption?.company || null,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          image: item.image || '/assets/652292.png',
          price: item.price,
          quantity: item.quantity,
        })),
      })
      await clear()
      setOrderInfo({
        id: created?.id || null,
        total: totalComFrete,
      })
      setOrdered(true)
    } catch (err) {
      setError(extractErrorMessage(err, 'Falha ao finalizar pedido.'))
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Carregando carrinho...</p>
      </div>
    )
  }

  if (ordered) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Pedido realizado!</h2>
          <p className="text-gray-400 text-sm mb-1">Você pode acompanhar o pedido na sua área de pedidos.</p>
          {orderInfo?.id && (
            <p className="text-[11px] font-mono text-gray-500 mb-1">#{orderInfo.id}</p>
          )}
          <p className="text-green-400 font-bold text-lg mb-6">{formatBRL(orderInfo?.total ?? 0)}</p>
          <p className="text-gray-600 text-xs">
            Status: <span className="text-yellow-500 font-medium">Aguardando pagamento</span>
          </p>
          <Link
            to="/perfil/pedidos"
            className="inline-block mt-6 text-sm font-medium text-black bg-white px-4 py-2 rounded-lg no-underline hover:bg-gray-200 transition-colors"
          >
            Ver meus pedidos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart size={24} className="text-white" />
          <h2 className="text-2xl font-bold text-white">Meu Carrinho</h2>
          {items.length > 0 && (
            <span className="ml-auto text-xs text-gray-500">
              {items.reduce((s, i) => s + i.quantity, 0)} {items.reduce((s, i) => s + i.quantity, 0) === 1 ? 'item' : 'itens'}
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-900/40 rounded-lg px-4 py-3 mb-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-1">Seu carrinho está vazio.</p>
            <Link
              to="/"
              className="inline-block mt-4 text-sm text-gray-400 hover:text-white no-underline border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg transition-colors"
            >
              Explorar produtos
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {items.map(item => (
                <div key={item.productId} className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <ProductImage src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover shrink-0 bg-gray-800" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-100 truncate mb-1">{item.name}</p>
                    <p className="text-xs text-gray-500 mb-2">{formatBRL(item.price)} cada</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRemoveOne(item)}
                        disabled={updating}
                        aria-label="Diminuir quantidade"
                        className="w-7 h-7 rounded-md border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white transition-colors flex items-center justify-center disabled:opacity-40"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm text-white min-w-[24px] text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleAddOne(item)}
                        disabled={updating}
                        aria-label="Aumentar quantidade"
                        className="w-7 h-7 rounded-md border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white transition-colors flex items-center justify-center disabled:opacity-40"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="text-green-400 font-bold text-base">{formatBRL(item.price * item.quantity)}</p>
                    <button
                      className="text-gray-600 hover:text-red-500 transition-colors duration-200 p-1"
                      onClick={() => handleRemoveAll(item)}
                      disabled={updating}
                      aria-label="Remover item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                <Truck size={13} className="inline mr-1.5 mb-0.5" />
                Calcular Frete
              </p>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  placeholder="Digite seu CEP"
                  maxLength={9}
                  inputMode="numeric"
                  className="flex-1 min-w-0 bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                />
                <button
                  onClick={handleCalcularFrete}
                  disabled={freteLoading}
                  className="shrink-0 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-60"
                >
                  {freteLoading ? 'Calculando...' : 'Calcular'}
                </button>
              </div>

              {freteError && (
                <p className="text-xs text-red-400 mb-3">{freteError}</p>
              )}

              {freteOptions.length > 0 && (
                <div className="mb-6 max-h-56 overflow-y-auto pr-1 flex flex-col gap-1">
                  {freteOptions.map((opt) => {
                    const active = freteSelected === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectFrete(opt)}
                        className={`text-left flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md border transition-colors ${
                          active
                            ? 'bg-green-500/10 border-green-500/40'
                            : 'bg-gray-800/60 border-gray-700 hover:border-gray-500'
                        }`}
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
                        <span className={`text-xs font-bold shrink-0 ${active ? 'text-green-400' : 'text-gray-200'}`}>
                          {formatBRL(opt.price)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
              {freteOptions.length === 0 && <div className="mb-3" />}
              <div className="space-y-2 mb-6 pb-4 border-b border-gray-800">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-gray-200">{formatBRL(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Frete</span>
                  <span className={freteCalculado ? 'text-gray-200' : 'text-gray-600'}>
                    {freteCalculado ? formatBRL(frete) : 'Não calculado'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-800">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-xl font-bold text-white">{formatBRL(totalComFrete)}</span>
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Método de Pagamento</p>
              <div className="flex items-center gap-3 bg-gray-800 border border-green-500/30 rounded-xl px-4 py-3 mb-6">
                <div className="text-green-400 shrink-0">
                  <QrCode size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">PIX</p>
                  <p className="text-xs text-gray-400">Pagamento instantâneo — única forma aceita</p>
                </div>
                <div className="w-4 h-4 rounded-full bg-green-500 shrink-0 flex items-center justify-center">
                  <Check size={10} className="text-black" />
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mb-6 leading-relaxed">
                {freteCalculado
                  ? 'Ao finalizar, seu pedido é criado e fica aguardando pagamento.'
                  : 'Calcule o frete e escolha uma opção antes de finalizar.'}
              </p>

              <button
                onClick={handleFinalize}
                disabled={updating || !freteCalculado || !freteSelected}
                className="w-full py-3 rounded-xl font-semibold text-sm bg-green-500 text-black hover:bg-green-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Processando...' : 'Finalizar com PIX'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const Cart = () => {
  const { isAuthenticated, user } = useAuth()
  return isAuthenticated && user?.id
    ? <CartContent userId={user.id} />
    : <LoginRequired />
}

export default Cart
