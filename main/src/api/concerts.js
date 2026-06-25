import axios from 'axios'
import { readJSON, writeJSON } from '../utils/storage'

const API_KEY = process.env.REACT_APP_CONCERTS_API_KEY
const API_HOST = 'concerts-artists-events-tracker.p.rapidapi.com'

const CACHE_KEY = 'concerts_cache_v1'
const RATE_LIMITED_KEY = 'concerts_rate_limited_until'
const CACHE_TTL_MS = 60 * 60 * 1000

const client = axios.create({
  baseURL: `https://${API_HOST}`,
  headers: {
    'x-rapidapi-host': API_HOST,
    'x-rapidapi-key': API_KEY,
  },
})

const isFresh = (entry) =>
  !!entry?.cachedAt && (Date.now() - entry.cachedAt) < CACHE_TTL_MS

const isRateLimited = () => {
  const until = Number(localStorage.getItem(RATE_LIMITED_KEY) || 0)
  return until > Date.now()
}

const setRateLimited = (durationMs = 5 * 60 * 1000) => {
  try {
    localStorage.setItem(RATE_LIMITED_KEY, String(Date.now() + durationMs))
  } catch { }
}

const cacheGet = (key) => {
  const cache = readJSON(localStorage, CACHE_KEY, {})
  const entry = cache?.[key]
  return isFresh(entry) ? entry.value : null
}

const cacheSet = (key, value) => {
  const cache = readJSON(localStorage, CACHE_KEY, {}) || {}
  cache[key] = { value, cachedAt: Date.now() }
  writeJSON(localStorage, CACHE_KEY, cache)
}

const normalizeArtistEvents = (rawData) => {
  const data = rawData?.data || rawData || {}
  const events = data.events || data.upcoming_events || data.upcomingEvents || []
  if (!Array.isArray(events)) return []
  return events.map((e) => ({
    id: e.id || e.event_id || `${e.datetime_local || e.datetime}-${e.venue?.name || ''}`,
    name: e.title || e.tour_name || e.short_title || e.name || 'Show',
    tour: e.tour_name || e.tour || null,
    datetime: e.datetime_local || e.datetime || e.start_date || e.date || null,
    venue: e.venue?.name || e.venue_name || null,
    city: e.venue?.city || e.city || null,
    state: e.venue?.state || e.venue?.region || e.state || null,
    country: e.venue?.country || e.country || null,
    ticketsUrl: e.tickets_url || e.url || e.ticket_url || null,
    image: e.image || e.banner || null,
  }))
}

export const searchArtist = async (query) => {
  if (!API_KEY) throw new Error('REACT_APP_CONCERTS_API_KEY não configurado.')
  if (!query || !query.trim()) return null

  const cacheKey = `search:${query.trim().toLowerCase()}`
  const cached = cacheGet(cacheKey)
  if (cached) return cached

  if (isRateLimited()) {
    throw new Error('Limite de buscas atingido. Tente novamente em alguns minutos.')
  }

  try {
    const { data } = await client.get('/search', { params: { keyword: query.trim() } })
    const list = data?.data || data || []
    const first = Array.isArray(list) ? list[0] : list
    if (!first) {
      cacheSet(cacheKey, null)
      return null
    }
    const artist = {
      id: first.id || first.artist_id || first.entity_id,
      name: first.name || first.title || query,
      image: first.image || first.banner_image || first.image_url || null,
    }
    cacheSet(cacheKey, artist)
    return artist
  } catch (err) {
    if (err?.response?.status === 429) {
      setRateLimited()
      throw new Error('Limite de requisições atingido. Aguarde alguns minutos.')
    }
    throw err
  }
}

export const fetchArtistEvents = async (artistId) => {
  if (!API_KEY) throw new Error('REACT_APP_CONCERTS_API_KEY não configurado.')
  if (!artistId) return []

  const cacheKey = `events:${artistId}`
  const cached = cacheGet(cacheKey)
  if (cached) return cached

  if (isRateLimited()) {
    throw new Error('Limite de buscas atingido. Tente novamente em alguns minutos.')
  }

  try {
    const { data } = await client.get('/artist/events', { params: { artist_id: artistId } })
    const events = normalizeArtistEvents(data)
    cacheSet(cacheKey, events)
    return events
  } catch (err) {
    if (err?.response?.status === 429) {
      setRateLimited()
      throw new Error('Limite de requisições atingido. Aguarde alguns minutos.')
    }
    throw err
  }
}

export const searchConcerts = async (query) => {
  const artist = await searchArtist(query)
  if (!artist || !artist.id) return { artist: null, events: [] }
  const events = await fetchArtistEvents(artist.id)
  return { artist, events }
}
