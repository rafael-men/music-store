import axios from 'axios'
import { formatCategory } from '../utils/categories'

const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY
const RAPIDAPI_KEY = process.env.REACT_APP_RAPIDAPI_KEY

const CACHE_KEY = 'carousel_cache_v1'
const QUERY_CACHE_KEY = 'carousel_query_cache_v1'
const RATE_LIMITED_KEY = 'carousel_rate_limited_until'

const loadCache = () => {
  try {
    return JSON.parse(sessionStorage.getItem(CACHE_KEY) || '{}')
  } catch {
    return {}
  }
}

const saveCache = (cache) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch { }
}

const loadQueryCache = () => {
  try {
    return JSON.parse(sessionStorage.getItem(QUERY_CACHE_KEY) || '{}')
  } catch {
    return {}
  }
}

const saveQueryCache = (cache) => {
  try {
    sessionStorage.setItem(QUERY_CACHE_KEY, JSON.stringify(cache))
  } catch { }
}

const isRateLimited = () => {
  const until = Number(sessionStorage.getItem(RATE_LIMITED_KEY) || 0)
  return until > Date.now()
}

const setRateLimited = (durationMs = 5 * 60 * 1000) => {
  try {
    sessionStorage.setItem(RATE_LIMITED_KEY, String(Date.now() + durationMs))
  } catch { }
}

const inFlightQueries = new Map()

const groq = axios.create({
  baseURL: 'https://api.groq.com/openai/v1',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${GROQ_API_KEY}`,
  },
})

const unsplashRapid = axios.create({
  baseURL: 'https://unsplash-image-search-api.p.rapidapi.com',
  headers: {
    'Content-Type': 'application/json',
    'x-rapidapi-host': 'unsplash-image-search-api.p.rapidapi.com',
    'x-rapidapi-key': RAPIDAPI_KEY,
  },
})

const generateDescription = async (product) => {
  if (!GROQ_API_KEY) return null
  try {
    const friendlyCategories = (product.categories || [])
      .map((c) => formatCategory(c))
      .filter(Boolean)

    const { data } = await groq.post('/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: [
            'Você escreve descrições curtas e empolgantes para banners de uma loja de discos e merchandise musical.',
            'Regras OBRIGATÓRIAS:',
            '- Idioma: português do Brasil, tom de marketing.',
            '- Máximo 100 caracteres.',
            '- NUNCA use palavras em CAPS LOCK, underscores (_), nomes de enum (ex: BLACK_METAL, DEATH_METAL, NU_METAL) ou códigos técnicos.',
            '- Use sempre nomes legíveis com espaço e capitalização correta: "Black Metal", "Death Metal", "Nu Metal", "Hard Rock", "Heavy Metal", "Prog Metal", "Sludge Metal".',
            '- NÃO traduza nomes de bandas, álbuns ou gêneros musicais (mantenha em inglês quando for o caso).',
            '- NÃO use aspas, emojis, hashtags ou markdown.',
            '- NÃO repita literalmente o título do produto.',
            '- Foque em estimular a compra: use verbos como "garanta", "leve", "ouça", "descubra", "celebre".',
          ].join('\n'),
        },
        {
          role: 'user',
          content: `Produto: ${product.title}\nGêneros (use exatamente estes nomes, sem underscores nem caps): ${friendlyCategories.join(', ')}\n\nEscreva uma chamada de marketing de até 100 caracteres em português.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 60,
    })
    const raw = data?.choices?.[0]?.message?.content?.trim()
    if (!raw) return null
    const cleaned = raw
      .replace(/^["']|["']$/g, '')
      .replace(/\b[A-Z][A-Z0-9]+(?:_[A-Z0-9]+)+\b/g, (match) => formatCategory(match))
    return cleaned
  } catch {
    return null
  }
}

const buildImageQuery = (product) => {
  const cats = (product.categories || [])
    .filter((c) => !['CD', 'VINYL', 'NEW_ARRIVALS', 'DAILY_DEALS', 'OFFICIAL_MERCHANDISE'].includes(c))
    .map((c) => c.toLowerCase().replace(/_/g, ' '))
  if (cats.length > 0) return `${cats[0]} music concert`
  return 'music concert stage'
}

const fetchCandidatesForQuery = async (query) => {
  const cache = loadQueryCache()
  if (cache[query]) return cache[query]

  if (isRateLimited()) return []

  if (inFlightQueries.has(query)) return inFlightQueries.get(query)

  const promise = (async () => {
    try {
      const { data } = await unsplashRapid.get('/search', { params: { page: 1, query } })
      const results = data?.data?.results || []
      const urls = results
        .map((r) => r?.urls?.regular || r?.urls?.full)
        .filter(Boolean)
      cache[query] = urls
      saveQueryCache(cache)
      return urls
    } catch (err) {
      const status = err?.response?.status
      if (status === 429) {
        setRateLimited()
        if (process.env.NODE_ENV === 'development') {
          console.warn('[carousel] rate-limit (429) — desabilitando Unsplash por 5 min')
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.error('[carousel] erro ao buscar imagem:', status, err?.message)
      }
      return []
    } finally {
      inFlightQueries.delete(query)
    }
  })()

  inFlightQueries.set(query, promise)
  return promise
}

const searchImageCandidates = async (product) => {
  if (!RAPIDAPI_KEY) {
    console.warn('[carousel] REACT_APP_RAPIDAPI_KEY não definido — pulando busca no Unsplash')
    return []
  }
  const query = buildImageQuery(product)
  return fetchCandidatesForQuery(query)
}

const normalizeUrl = (url) => {
  if (!url) return ''
  try {
    const u = new URL(url)
    return `${u.origin}${u.pathname}`
  } catch {
    return url.split('?')[0]
  }
}

const pickUniqueImage = (candidates, used) => {
  if (!candidates || candidates.length === 0) return null
  for (const url of candidates) {
    const key = normalizeUrl(url)
    if (!used.has(key)) {
      used.add(key)
      return url
    }
  }
  const pool = candidates.slice(0, 10)
  const pick = pool[Math.floor(Math.random() * pool.length)]
  if (pick) used.add(normalizeUrl(pick))
  return pick
}

export const generateCarousel = async (products) => {
  if (!Array.isArray(products) || products.length === 0) return []

  const cache = loadCache()
  let cacheChanged = false
  const usedImages = new Set()

  const stages = products.map((product) => {
    const cached = cache[product.id]
    if (cached?.description && cached?.imageUrl) {
      usedImages.add(normalizeUrl(cached.imageUrl))
      return { product, cached, fromCache: true }
    }
    return { product, cached, fromCache: false }
  })

  const fetchedStages = await Promise.all(
    stages.map(async (stage) => {
      if (stage.fromCache) return stage
      const [description, candidates] = await Promise.all([
        stage.cached?.description
          ? Promise.resolve(stage.cached.description)
          : generateDescription(stage.product),
        stage.cached?.imageUrl
          ? Promise.resolve([stage.cached.imageUrl])
          : searchImageCandidates(stage.product),
      ])
      return { ...stage, description, candidates }
    })
  )

  const enriched = fetchedStages.map((stage) => {
    if (stage.fromCache) {
      return { ...stage.product, ...stage.cached }
    }
    const imageUrl = pickUniqueImage(stage.candidates, usedImages)
    const next = {
      description: stage.description || stage.cached?.description,
      imageUrl: imageUrl || stage.cached?.imageUrl || null,
    }
    cache[stage.product.id] = next
    cacheChanged = true
    return { ...stage.product, ...next }
  })

  if (cacheChanged) saveCache(cache)
  return enriched
}
