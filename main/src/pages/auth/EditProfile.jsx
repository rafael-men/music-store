import { useRef, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { Divider } from 'primereact/divider'
import { Dropdown } from 'primereact/dropdown'
import { ArrowLeft, Mail, Lock, User, IdCard, MapPin, Upload, Trash2, Camera } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { authApi } from '../../api/auth'
import { extractErrorMessage } from '../../api/client'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // 5MB
const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const PHOTO_MAX_DIMENSION = 256

const fileToCompressedDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Imagem inválida.'))
      img.onload = () => {
        const scale = Math.min(1, PHOTO_MAX_DIMENSION / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })

const UF_OPTIONS = [
  { label: 'AC', value: 'AC' }, { label: 'AL', value: 'AL' }, { label: 'AP', value: 'AP' },
  { label: 'AM', value: 'AM' }, { label: 'BA', value: 'BA' }, { label: 'CE', value: 'CE' },
  { label: 'DF', value: 'DF' }, { label: 'ES', value: 'ES' }, { label: 'GO', value: 'GO' },
  { label: 'MA', value: 'MA' }, { label: 'MT', value: 'MT' }, { label: 'MS', value: 'MS' },
  { label: 'MG', value: 'MG' }, { label: 'PA', value: 'PA' }, { label: 'PB', value: 'PB' },
  { label: 'PR', value: 'PR' }, { label: 'PE', value: 'PE' }, { label: 'PI', value: 'PI' },
  { label: 'RJ', value: 'RJ' }, { label: 'RN', value: 'RN' }, { label: 'RS', value: 'RS' },
  { label: 'RO', value: 'RO' }, { label: 'RR', value: 'RR' }, { label: 'SC', value: 'SC' },
  { label: 'SP', value: 'SP' }, { label: 'SE', value: 'SE' }, { label: 'TO', value: 'TO' },
]

const onlyDigits = (value) => String(value || '').replace(/\D/g, '')

const maskCpf = (value) => {
  const d = onlyDigits(value).slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

const maskCep = (value) => {
  const d = onlyDigits(value).slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

const isValidCpf = (value) => {
  const cpf = onlyDigits(value)
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i], 10) * (10 - i)
  let check = (sum * 10) % 11
  if (check === 10) check = 0
  if (check !== parseInt(cpf[9], 10)) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i], 10) * (11 - i)
  check = (sum * 10) % 11
  if (check === 10) check = 0
  return check === parseInt(cpf[10], 10)
}

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim())

const validatePassword = (value) => {
  if (!value) return ''
  if (value.length < 8) return 'A senha deve ter no mínimo 8 caracteres.'
  if (!/[A-Z]/.test(value)) return 'A senha deve conter uma letra maiúscula.'
  if (!/\d/.test(value)) return 'A senha deve conter um número.'
  if (!/[@#$%^&+=!*]/.test(value)) return 'A senha deve conter um caractere especial (@#$%^&+=!*).'
  return ''
}

const DEFAULT_PHOTO = 'https://i.pinimg.com/736x/c0/74/9b/c0749b7cc401421662ae901ec8f9f660.jpg'

const emptyForm = {
  name: '',
  email: '',
  cpf: '',
  profilePhotoUrl: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
  password: '',
  confirmPassword: '',
}

const EditProfile = () => {
  const navigate = useNavigate()
  const { user: authUser, isAuthenticated } = useAuth()
  const fileInputRef = useRef(null)
  const [form, setForm] = useState(emptyForm)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(DEFAULT_PHOTO)
  const [photoError, setPhotoError] = useState('')
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !authUser?.id) return
    let cancelled = false
    authApi
      .getById(authUser.id)
      .then((data) => {
        if (cancelled) return
        const addr = data.address || {}
        setForm({
          name: data.name || '',
          email: data.email || '',
          cpf: data.cpf || '',
          profilePhotoUrl: data.profilePhotoUrl || '',
          street: addr.street || '',
          number: addr.number || '',
          complement: addr.complement || '',
          neighborhood: addr.neighborhood || '',
          city: addr.city || '',
          state: addr.state || '',
          zipCode: addr.zipCode || '',
          password: '',
          confirmPassword: '',
        })
        if (data.profilePhotoUrl) setPhotoPreview(data.profilePhotoUrl)
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, 'Falha ao carregar dados do perfil.'))
      })
    return () => { cancelled = true }
  }, [isAuthenticated, authUser?.id])

  const handlePhotoSelect = async (e) => {
    setPhotoError('')
    const file = e.target.files?.[0]
    if (!file) return
    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError('Formato inválido. Use JPG, PNG ou WEBP.')
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError('Arquivo muito grande. Tamanho máximo: 5MB.')
      return
    }
    setPhotoFile(file)
    try {
      const dataUrl = await fileToCompressedDataUrl(file)
      setPhotoPreview(dataUrl)
      setForm((prev) => ({ ...prev, profilePhotoUrl: dataUrl }))
    } catch (err) {
      setPhotoError('Não foi possível processar a imagem.')
    }
  }

  const handlePhotoRemove = () => {
    setPhotoFile(null)
    setPhotoPreview(DEFAULT_PHOTO)
    setForm((prev) => ({ ...prev, profilePhotoUrl: '' }))
    setPhotoError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleChange = (field) => (e) => setField(field, e.target.value)
  const handleBlur = (field) => () => setTouched((prev) => ({ ...prev, [field]: true }))

  const fieldErrors = {
    name: !form.name.trim() ? 'Informe seu nome.' : '',
    email: !form.email.trim()
      ? 'Informe seu e-mail.'
      : !isValidEmail(form.email) ? 'E-mail inválido.' : '',
    cpf: form.cpf && !isValidCpf(form.cpf) ? 'CPF inválido.' : '',
    password: validatePassword(form.password),
    confirmPassword: form.password && form.password !== form.confirmPassword
      ? 'As senhas não coincidem.'
      : '',
    zipCode: form.zipCode && onlyDigits(form.zipCode).length !== 8 ? 'CEP inválido.' : '',
  }

  const showError = (field) => touched[field] && fieldErrors[field]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setTouched({
      name: true, email: true, cpf: true,
      password: true, confirmPassword: true,
      zipCode: true,
    })

    if (photoError) {
      setError(photoError)
      return
    }

    const firstError = Object.values(fieldErrors).find(Boolean)
    if (firstError) {
      setError(firstError)
      return
    }

    setLoading(true)
    try {
      const hasAddress = form.zipCode || form.street || form.city || form.state
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        cpf: form.cpf || null,
        profilePhotoUrl: form.profilePhotoUrl || null,
        address: hasAddress ? {
          street: form.street || null,
          number: form.number || null,
          complement: form.complement || null,
          neighborhood: form.neighborhood || null,
          city: form.city || null,
          state: form.state || null,
          zipCode: form.zipCode || null,
        } : null,
      }
      if (form.password) payload.password = form.password
      await authApi.update(authUser.id, payload)
      setSuccess('Dados atualizados com sucesso.')
      setForm((prev) => ({ ...prev, password: '', confirmPassword: '' }))
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível salvar as alterações.'))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => navigate('/perfil')

  const inputClass = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors'
  const inputErrorClass = 'w-full bg-gray-800 border border-red-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors'
  const inputWithIconClass = 'w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors'
  const inputWithIconErrorClass = 'w-full bg-gray-800 border border-red-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors'
  const labelClass = 'block text-xs font-medium text-gray-400 mb-1.5'
  const errorClass = 'text-xs text-red-400 mt-1'

  const passwordPt = {
    root: { className: 'w-full block' },
    iconField: { root: { className: 'w-full block' } },
    hideIcon: { className: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-200 cursor-pointer' },
    showIcon: { className: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-200 cursor-pointer' },
  }

  const dropdownPt = {
    root: { className: 'w-full h-[38px] bg-gray-800 border border-gray-700 rounded-lg flex items-center hover:border-gray-600 focus-within:border-gray-500 transition-colors' },
    input: { className: 'bg-transparent border-0 text-white text-sm px-3 flex-1 focus:outline-none focus:shadow-none' },
    trigger: { className: 'text-gray-500 w-8 flex items-center justify-center shrink-0' },
    panel: { className: 'bg-gray-800 border border-gray-700 rounded-lg mt-1 shadow-xl shadow-black/40 overflow-hidden' },
    list: { className: 'list-none m-0 p-1' },
    item: { className: 'text-sm text-gray-200 px-3 py-2 hover:bg-gray-700 cursor-pointer list-none rounded' },
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <Link
          to="/perfil"
          className="inline-flex items-center gap-2 text-sm text-gray-400 no-underline hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Voltar ao perfil
        </Link>

        <h2 className="text-2xl font-bold text-white mb-2">Editar perfil</h2>
        <p className="text-sm text-gray-400 mb-8">Atualize os seus dados pessoais e endereço.</p>

        <div className="glass-card rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Alterar foto de perfil"
              className="relative group w-20 h-20 shrink-0 rounded-full overflow-hidden border-2 border-gray-700 hover:border-gray-500 transition-colors"
            >
              <img
                src={photoPreview}
                alt="Profile preview"
                onError={(e) => { e.currentTarget.src = DEFAULT_PHOTO }}
                className="w-full h-full object-cover"
              />
              <span className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-white" />
              </span>
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white truncate">{form.name || 'Seu nome'}</h3>
              <p className="text-gray-500 text-sm truncate mb-2">{form.email || 'seu@email.com'}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-300 border border-gray-700 px-3 py-1.5 rounded-lg hover:border-gray-500 hover:text-white transition-colors"
                >
                  <Upload size={12} />
                  {photoFile ? 'Trocar foto' : 'Enviar foto'}
                </button>
                {photoFile && (
                  <button
                    type="button"
                    onClick={handlePhotoRemove}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400 border border-red-900/50 px-3 py-1.5 rounded-lg hover:border-red-700 hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={12} />
                    Remover
                  </button>
                )}
              </div>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_PHOTO_TYPES.join(',')}
            onChange={handlePhotoSelect}
            className="hidden"
          />
          {photoError ? (
            <p className="text-xs text-red-400 mt-3">{photoError}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-3">JPG, PNG ou WEBP — máximo 5MB.</p>
          )}
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8">
          {error && (
            <div className="mb-4">
              <Message severity="error" text={error} className="w-full" />
            </div>
          )}
          {success && (
            <div className="mb-4">
              <Message severity="success" text={success} className="w-full" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex items-center gap-2 mb-1">
              <User size={14} className="text-gray-500" />
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Dados pessoais</span>
            </div>

            <div>
              <label htmlFor="name" className={labelClass}>Nome completo</label>
              <InputText
                id="name"
                value={form.name}
                onChange={handleChange('name')}
                onBlur={handleBlur('name')}
                placeholder="Seu nome"
                className={showError('name') ? inputErrorClass : inputClass}
              />
              {showError('name') && <p className={errorClass}>{fieldErrors.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className={labelClass}>E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" />
                  <InputText
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    onBlur={handleBlur('email')}
                    placeholder="voce@email.com"
                    className={showError('email') ? inputWithIconErrorClass : inputWithIconClass}
                  />
                </div>
                {showError('email') && <p className={errorClass}>{fieldErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="cpf" className={labelClass}>CPF</label>
                <div className="relative">
                  <IdCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" />
                  <InputText
                    id="cpf"
                    value={form.cpf}
                    onChange={(e) => setField('cpf', maskCpf(e.target.value))}
                    onBlur={handleBlur('cpf')}
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    maxLength={14}
                    className={showError('cpf') ? inputWithIconErrorClass : inputWithIconClass}
                  />
                </div>
                {showError('cpf') && <p className={errorClass}>{fieldErrors.cpf}</p>}
              </div>
            </div>

            <Divider className="my-2 border-gray-800" />

            <div className="flex items-center gap-2 mb-1">
              <Lock size={14} className="text-gray-500" />
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Alterar senha (opcional)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className={labelClass}>Nova senha</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-20" />
                  <Password
                    inputId="password"
                    value={form.password}
                    onChange={handleChange('password')}
                    onBlur={handleBlur('password')}
                    placeholder="Deixe vazio para manter"
                    toggleMask
                    inputClassName={`${showError('password') ? inputWithIconErrorClass : inputWithIconClass} pr-10`}
                    pt={passwordPt}
                  />
                </div>
                {showError('password') && <p className={errorClass}>{fieldErrors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className={labelClass}>Confirmar nova senha</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-20" />
                  <Password
                    inputId="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    placeholder="Repita a nova senha"
                    feedback={false}
                    toggleMask
                    disabled={!form.password}
                    inputClassName={`${showError('confirmPassword') ? inputWithIconErrorClass : inputWithIconClass} pr-10 ${!form.password ? 'opacity-50 cursor-not-allowed' : ''}`}
                    pt={passwordPt}
                  />
                </div>
                {showError('confirmPassword') && <p className={errorClass}>{fieldErrors.confirmPassword}</p>}
              </div>
            </div>

            <Divider className="my-2 border-gray-800" />

            <div className="flex items-center gap-2 mb-1">
              <MapPin size={14} className="text-gray-500" />
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Endereço</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="street" className={labelClass}>Rua</label>
                <InputText
                  id="street"
                  value={form.street}
                  onChange={handleChange('street')}
                  placeholder="Av. Brasil"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="number" className={labelClass}>Número</label>
                <InputText
                  id="number"
                  value={form.number}
                  onChange={(e) => setField('number', onlyDigits(e.target.value).slice(0, 10))}
                  placeholder="123"
                  inputMode="numeric"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="complement" className={labelClass}>Complemento</label>
                <InputText
                  id="complement"
                  value={form.complement}
                  onChange={handleChange('complement')}
                  placeholder="Apto 42"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="neighborhood" className={labelClass}>Bairro</label>
                <InputText
                  id="neighborhood"
                  value={form.neighborhood}
                  onChange={handleChange('neighborhood')}
                  placeholder="Centro"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="city" className={labelClass}>Cidade</label>
                <InputText
                  id="city"
                  value={form.city}
                  onChange={handleChange('city')}
                  placeholder="São Paulo"
                  className={inputClass}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="state" className={labelClass}>UF</label>
                <Dropdown
                  inputId="state"
                  value={form.state}
                  onChange={(e) => setField('state', e.value)}
                  options={UF_OPTIONS}
                  placeholder="UF"
                  pt={dropdownPt}
                />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <label htmlFor="zipCode" className={labelClass}>CEP</label>
                <InputText
                  id="zipCode"
                  value={form.zipCode}
                  onChange={(e) => setField('zipCode', maskCep(e.target.value))}
                  onBlur={handleBlur('zipCode')}
                  placeholder="00000-000"
                  inputMode="numeric"
                  maxLength={9}
                  className={showError('zipCode') ? inputErrorClass : inputClass}
                />
                {showError('zipCode') && <p className={errorClass}>{fieldErrors.zipCode}</p>}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-auto sm:flex-1 bg-transparent text-gray-300 text-sm font-medium py-2.5 rounded-lg border border-gray-700 hover:border-gray-500 hover:text-white transition-colors"
                label="Cancelar"
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto sm:flex-1 bg-white text-black text-sm font-medium py-2.5 rounded-lg hover:bg-gray-200 transition-colors border-0 disabled:opacity-60"
                label={loading ? 'Salvando...' : 'Salvar alterações'}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditProfile
