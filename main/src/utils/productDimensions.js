const PRESETS = {
  VINYL:                { weight: 0.30, width: 32, height: 32, length: 1 },
  CD:                   { weight: 0.10, width: 14, height: 12, length: 1 },
  OFFICIAL_MERCHANDISE: { weight: 0.25, width: 30, height: 25, length: 3 },
  DEFAULT:              { weight: 0.30, width: 20, height: 20, length: 5 },
}

const fromName = (name = '') => {
  const n = name.toLowerCase()
  if (n.includes('vinyl') || n.includes('vinil') || n.includes('lp')) return PRESETS.VINYL
  if (n.includes('cd')) return PRESETS.CD
  if (n.includes('camiseta') || n.includes('moletom') || n.includes('regata') || n.includes('shirt')) return PRESETS.OFFICIAL_MERCHANDISE
  return null
}

export const dimensionsForProduct = ({ categories, name } = {}) => {
  const cats = categories || []
  if (cats.includes('VINYL')) return PRESETS.VINYL
  if (cats.includes('CD')) return PRESETS.CD
  if (cats.includes('OFFICIAL_MERCHANDISE')) return PRESETS.OFFICIAL_MERCHANDISE
  return fromName(name) || PRESETS.DEFAULT
}
