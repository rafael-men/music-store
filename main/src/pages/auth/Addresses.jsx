import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Plus, Pencil, Trash2, Star, Check, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { addressesApi } from '../../api/addresses'
import { extractErrorMessage } from '../../api/client'

const emptyForm = {
  label: '',
  zipCode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  isDefault: false,
}

const maskCep = (v = '') => {
  const digits = String(v).replace(/\D/g, '').slice(0, 8)
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}

const AddressesContent = ({ userId }) => {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await addressesApi.list(userId)
      setList(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(extractErrorMessage(err, 'Falha ao carregar endereços.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [userId]) 

  const startCreate = () => {
    setEditing('new')
    setForm(emptyForm)
  }

  const startEdit = (addr) => {
    setEditing(addr.id)
    setForm({
      label: addr.label || '',
      zipCode: maskCep(addr.zipCode || ''),
      street: addr.street || '',
      number: addr.number || '',
      complement: addr.complement || '',
      neighborhood: addr.neighborhood || '',
      city: addr.city || '',
      state: addr.state || '',
      isDefault: !!addr.isDefault,
    })
  }

  const cancel = () => { setEditing(null); setForm(emptyForm) }

  const handleSave = async () => {
    if (!form.label.trim()) {
      setError('Dê um nome para o endereço (ex: Casa).')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, zipCode: form.zipCode.replace(/\D/g, '') }
      if (editing === 'new') {
        await addressesApi.create(userId, payload)
      } else {
        await addressesApi.update(userId, editing, payload)
      }
      cancel()
      await refresh()
    } catch (err) {
      setError(extractErrorMessage(err, 'Falha ao salvar endereço.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remover este endereço?')) return
    try {
      await addressesApi.remove(userId, id)
      await refresh()
    } catch (err) {
      setError(extractErrorMessage(err, 'Falha ao remover endereço.'))
    }
  }

  const handleSetDefault = async (id) => {
    try {
      await addressesApi.setDefault(userId, id)
      await refresh()
    } catch (err) {
      setError(extractErrorMessage(err, 'Falha ao definir endereço padrão.'))
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-3xl">
        <Link to="/perfil" className="inline-flex items-center gap-2 text-sm text-gray-400 no-underline hover:text-white transition-colors mb-6">
          <ArrowLeft size={16} />
          Voltar ao perfil
        </Link>

        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <MapPin size={22} className="text-white" />
            <h2 className="text-2xl font-bold text-white">Meus endereços</h2>
          </div>
          {editing === null && (
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-black bg-white px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Plus size={14} />
              Novo
            </button>
          )}
        </div>
        <p className="text-sm text-gray-400 mb-6">Cadastre múltiplos endereços e escolha um padrão para entregas.</p>

        {error && (
          <div className="bg-red-900/20 border border-red-900/40 rounded-lg px-4 py-3 mb-4 text-sm text-red-300">{error}</div>
        )}

        {editing !== null && (
          <div className="glass-card rounded-2xl p-5 mb-6">
            <h3 className="text-base font-semibold text-white mb-4">
              {editing === 'new' ? 'Novo endereço' : 'Editar endereço'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <Field label="Nome (ex: Casa, Trabalho)" required>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  maxLength={60}
                  className={inputClass}
                />
              </Field>
              <Field label="CEP">
                <input
                  type="text"
                  value={form.zipCode}
                  onChange={(e) => setForm((f) => ({ ...f, zipCode: maskCep(e.target.value) }))}
                  maxLength={9}
                  inputMode="numeric"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3 mb-3">
              <Field label="Rua">
                <input type="text" value={form.street} onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))} className={inputClass} />
              </Field>
              <Field label="Número">
                <input type="text" value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} className={inputClass} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <Field label="Complemento">
                <input type="text" value={form.complement} onChange={(e) => setForm((f) => ({ ...f, complement: e.target.value }))} className={inputClass} />
              </Field>
              <Field label="Bairro">
                <input type="text" value={form.neighborhood} onChange={(e) => setForm((f) => ({ ...f, neighborhood: e.target.value }))} className={inputClass} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_80px] gap-3 mb-4">
              <Field label="Cidade">
                <input type="text" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className={inputClass} />
              </Field>
              <Field label="UF">
                <input type="text" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value.toUpperCase().slice(0, 2) }))} className={inputClass} />
              </Field>
            </div>

            <label className="flex items-center gap-2 mb-5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                className="w-4 h-4 accent-white"
              />
              <span className="text-sm text-gray-300">Definir como endereço padrão</span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-medium text-black bg-white py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
              >
                <Check size={14} />
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={cancel}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-gray-300 border border-gray-700 px-4 py-2 rounded-lg hover:border-gray-500 hover:text-white transition-colors"
              >
                <X size={14} />
                Cancelar
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500 text-sm">Carregando endereços...</div>
        ) : list.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center">
            <MapPin size={32} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Você ainda não tem endereços cadastrados.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {list.map((addr) => (
              <AddressCard
                key={addr.id}
                address={addr}
                onEdit={() => startEdit(addr)}
                onDelete={() => handleDelete(addr.id)}
                onSetDefault={() => handleSetDefault(addr.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const inputClass = 'w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors'

const Field = ({ label, required, children }) => (
  <label className="block">
    <span className="block text-[11px] font-medium text-gray-400 mb-1">
      {label}{required && <span className="text-red-400 ml-1">*</span>}
    </span>
    {children}
  </label>
)

const AddressCard = ({ address, onEdit, onDelete, onSetDefault }) => {
  const lines = [
    [address.street, address.number].filter(Boolean).join(', '),
    address.complement,
    address.neighborhood,
    [address.city, address.state].filter(Boolean).join('/'),
    address.zipCode && `CEP ${maskCep(address.zipCode)}`,
  ].filter(Boolean)

  return (
    <div className={`glass-card rounded-xl p-4 ${address.isDefault ? 'border-yellow-400/40' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-base font-semibold text-white truncate">{address.label}</h3>
          {address.isDefault && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-yellow-300 bg-yellow-500/15 border border-yellow-400/30 px-2 py-0.5 rounded-full">
              <Star size={10} fill="currentColor" />
              PADRÃO
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!address.isDefault && (
            <button
              type="button"
              onClick={onSetDefault}
              title="Definir como padrão"
              aria-label="Definir como padrão"
              className="p-1.5 text-gray-400 hover:text-yellow-300 hover:bg-white/[0.05] rounded transition-colors"
            >
              <Star size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            title="Editar"
            aria-label="Editar"
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/[0.05] rounded transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Remover"
            aria-label="Remover"
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/[0.05] rounded transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {lines.length === 0 ? (
        <p className="text-[13px] text-gray-500 italic">Endereço sem dados — clique em editar.</p>
      ) : (
        <ul className="text-[13px] text-gray-300 leading-relaxed">
          {lines.map((line, i) => <li key={i}>{line}</li>)}
        </ul>
      )}
    </div>
  )
}

const Addresses = () => {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated || !user?.id) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <p className="text-gray-400 text-sm">Faça login para gerenciar seus endereços.</p>
      </div>
    )
  }
  return <AddressesContent userId={user.id} />
}

export default Addresses
