export const safeJSONParse = (raw, fallback) => {
  if (raw == null) return fallback
  try {
    const parsed = JSON.parse(raw)
    return parsed == null ? fallback : parsed
  } catch {
    return fallback
  }
}

export const readJSON = (storage, key, fallback) => {
  try {
    return safeJSONParse(storage.getItem(key), fallback)
  } catch {
    return fallback
  }
}

export const writeJSON = (storage, key, value) => {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
  }
}
