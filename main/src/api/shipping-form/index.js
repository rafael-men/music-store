import axios from 'axios'
import { dimensionsForProduct } from '../../utils/productDimensions'

const FROM_CEP = process.env.REACT_APP_MELHOR_ENVIO_FROM_CEP

const melhorEnvio = axios.create({
  baseURL: '/melhor-envio',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

export const normalizeCep = (raw = '') => String(raw).replace(/\D/g, '')

export const isValidCep = (raw) => normalizeCep(raw).length === 8

const toMelhorEnvioProduct = (item) => {
  const dims = dimensionsForProduct({
    categories: item.categories,
    name: item.name || item.title,
  })
  return {
    id: String(item.productId || item.id),
    width: dims.width,
    height: dims.height,
    length: dims.length,
    weight: dims.weight,
    insurance_value: Number(item.price) || 0,
    quantity: item.quantity || 1,
  }
}

const SERVICE_LABELS = {
  1: 'PAC',
  2: 'SEDEX',
  3: 'Mini Envios',
  4: 'eSedex',
}

export const calculateShipping = async ({ toCep, items, signal } = {}) => {
  if (!FROM_CEP) {
    throw new Error('CEP de origem não configurado.')
  }
  if (!isValidCep(toCep)) {
    throw new Error('CEP inválido.')
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Carrinho vazio.')
  }

  const payload = {
    from: { postal_code: normalizeCep(FROM_CEP) },
    to:   { postal_code: normalizeCep(toCep) },
    products: items.map(toMelhorEnvioProduct),
  }

  const { data } = await melhorEnvio.post('/shipment/calculate', payload, { signal })

  return (Array.isArray(data) ? data : [])
    .filter((option) => !option.error && option.price)
    .map((option) => ({
      id: String(option.id),
      name: option.name || SERVICE_LABELS[option.id] || `Serviço ${option.id}`,
      company: option.company?.name || 'Correios',
      price: Number(option.price),
      deliveryTime: option.delivery_time,
      deliveryRange: option.delivery_range,
    }))
    .sort((a, b) => a.price - b.price)
}

export const extractShippingError = (err, fallback = 'Falha ao calcular frete.') => {
  if (err?.response?.data?.message) return err.response.data.message
  if (err?.message) return err.message
  return fallback
}
