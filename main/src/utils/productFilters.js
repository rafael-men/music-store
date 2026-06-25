const ORIGIN_NATIONAL_KEYWORDS = ['nacional', '(nac)', '[nac]', ' nac ', 'br ', 'brasil']
const ORIGIN_IMPORTED_KEYWORDS = ['importado', 'imported', '(imp)', '[imp]', ' imp ', 'import ']

const USED_KEYWORDS = ['usado', 'used', 'seminovo', 'semi-novo', 'segunda mão', 'segunda mao']

const norm = (s) => (s || '').toLowerCase()

export const getOrigin = (product) => {
  const t = ` ${norm(product.title)} `
  if (ORIGIN_IMPORTED_KEYWORDS.some((k) => t.includes(k))) return 'IMPORTED'
  if (ORIGIN_NATIONAL_KEYWORDS.some((k) => t.includes(k))) return 'NATIONAL'
  return null
}

export const getCondition = (product) => {
  const t = ` ${norm(product.title)} `
  if (USED_KEYWORDS.some((k) => t.includes(k))) return 'USED'
  return 'NEW'
}


const GENRE_CATEGORIES = [
  { value: 'ROCK',           label: 'Rock' },
  { value: 'HARD_ROCK',      label: 'Hard Rock' },
  { value: 'HEAVY_METAL',    label: 'Heavy Metal' },
  { value: 'BLACK_METAL',    label: 'Black Metal' },
  { value: 'DEATH_METAL',    label: 'Death Metal' },
  { value: 'NU_METAL',       label: 'Nu Metal' },
  { value: 'SLUDGE_METAL',   label: 'Sludge Metal' },
  { value: 'PROG_METAL',     label: 'Metal Progressivo' },
  { value: 'POP',            label: 'Pop' },
  { value: 'FOLK',           label: 'Folk' },
  { value: 'ELECTRONIC',     label: 'Eletrônica' },
  { value: 'BRAZILLIAN_MUSIC', label: 'Brasileira' },
  { value: 'INTERNATIONAL',  label: 'Internacional' },
  { value: 'UNDERGROUND',    label: 'Underground' },
]

export const availableGenres = (products) => {
  const present = new Set()
  for (const p of products) {
    for (const cat of p.categories || []) {
      if (GENRE_CATEGORIES.some((g) => g.value === cat)) present.add(cat)
    }
  }
  return GENRE_CATEGORIES.filter((g) => present.has(g.value))
}

export const hasGenre = (product, genre) => (product.categories || []).includes(genre)


const MERCH_TYPES = [
  { value: 'CAMISETA', label: 'Camiseta', keywords: ['camiseta', 'shirt', 't-shirt', 'tshirt', 'regata'] },
  { value: 'MOLETOM',  label: 'Moletom',  keywords: ['moletom', 'hoodie', 'casaco'] },
  { value: 'JAQUETA',  label: 'Jaqueta',  keywords: ['jaqueta', 'jacket'] },
  { value: 'BONE',     label: 'Boné',     keywords: ['boné', 'bone', 'cap', 'chapéu', 'beanie', 'gorro'] },
  { value: 'ACESSORIO', label: 'Acessórios', keywords: ['adesivo', 'patch', 'chaveiro', 'caneca', 'mug', 'poster', 'pôster', 'pulseira', 'colar'] },
]

export const getMerchType = (product) => {
  const t = norm(product.title)
  for (const type of MERCH_TYPES) {
    if (type.keywords.some((k) => t.includes(k))) return type.value
  }
  return null
}

export const availableMerchTypes = (products) => {
  const present = new Set()
  for (const p of products) {
    const t = getMerchType(p)
    if (t) present.add(t)
  }
  return MERCH_TYPES.filter((m) => present.has(m.value))
}
