export const formatBRL = (value) =>
  (typeof value === 'number' ? value : 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatDate = (iso, options = { day: '2-digit', month: '2-digit', year: 'numeric' }) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', options) : '—'

export const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—'
