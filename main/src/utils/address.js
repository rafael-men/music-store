export const formatAddressShort = (address) => {
  if (!address) return '—'
  const { city, state } = address
  if (city && state) return `${city}/${state}`
  return city || state || '—'
}

export const formatAddressFull = (address) => {
  if (!address) return ''
  const parts = []
  if (address.street) parts.push(address.street + (address.number ? `, ${address.number}` : ''))
  if (address.complement) parts.push(address.complement)
  if (address.neighborhood) parts.push(address.neighborhood)
  if (address.city || address.state) parts.push(`${address.city || ''}${address.state ? '/' + address.state : ''}`)
  if (address.zipCode) parts.push(`CEP ${address.zipCode}`)
  return parts.join(' · ')
}
