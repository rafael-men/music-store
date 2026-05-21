import { formatCategory } from '../../../utils/categories'

export const FALLBACK_IMAGE_URL = '/assets/652292.png'

export const CATEGORY_OPTIONS = [
  'DEATH_METAL', 'NEW_ARRIVALS', 'DAILY_DEALS', 'BLACK_METAL', 'POP',
  'BRAZILLIAN_MUSIC', 'INTERNATIONAL', 'FOLK', 'PROG_METAL', 'ROCK',
  'ELECTRONIC', 'NU_METAL', 'HARD_ROCK', 'SLUDGE_METAL', 'HEAVY_METAL',
  'UNDERGROUND', 'CD', 'VINYL', 'OFFICIAL_MERCHANDISE',
].map((c) => ({ label: formatCategory(c), value: c }))

export const emptyForm = {
  title: '',
  description: '',
  price: null,
  imageUrl: '',
  categories: [],
  stockQuantity: 0,
  available: true,
}
