import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { Divider } from 'primereact/divider'
import { Dropdown } from 'primereact/dropdown'
import { Music2, Mail, Lock, User, IdCard, MapPin } from 'lucide-react'
import { authApi } from '../../api/auth'
import { extractErrorMessage } from '../../api/client'

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

const initialForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  cpf: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
}

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
  if (!value) return 'Defina uma senha.'
  if (value.length < 8) return 'A senha deve ter no mínimo 8 caracteres.'
  if (!/[A-Z]/.test(value)) return 'A senha deve conter uma letra maiúscula.'
  if (!/\d/.test(value)) return 'A senha deve conter um número.'
  if (!/[@#$%^&+=!*]/.test(value)) return 'A senha deve conter um caractere especial (@#$%^&+=!*).'
  return ''
}

const Register = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    confirmPassword: form.confirmPassword && form.password !== form.confirmPassword
      ? 'As senhas não coincidem.'
      : '',
    zipCode: form.zipCode && onlyDigits(form.zipCode).length !== 8 ? 'CEP inválido.' : '',
  }

  const showError = (field) => touched[field] && fieldErrors[field]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setTouched({
      name: true, email: true, cpf: true,
      password: true, confirmPassword: true, zipCode: true,
    })

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
        password: form.password,
        cpf: form.cpf || null,
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
      await authApi.register(payload)
      navigate('/login')
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível concluir o cadastro.'))
    } finally {
      setLoading(false)
    }
  }

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
    <div className="min-h-screen bg-transparent text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Music2 size={28} className="text-white" />
            <span className="text-2xl font-bold tracking-wide">Music Store</span>
          </div>
          <h1 className="text-xl font-semibold text-white">Criar conta</h1>
          <p className="text-sm text-gray-400 mt-1">Preencha os dados para começar</p>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8">
          {error && (
            <div className="mb-4">
              <Message severity="error" text={error} className="w-full" />
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className={labelClass}>Senha</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-20" />
                  <Password
                    inputId="password"
                    value={form.password}
                    onChange={handleChange('password')}
                    onBlur={handleBlur('password')}
                    placeholder="Mínimo 8 caracteres"
                    toggleMask
                    inputClassName={`${showError('password') ? inputWithIconErrorClass : inputWithIconClass} pr-10`}
                    pt={passwordPt}
                  />
                </div>
                {showError('password') && <p className={errorClass}>{fieldErrors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className={labelClass}>Confirmar senha</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-20" />
                  <Password
                    inputId="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    placeholder="Repita a senha"
                    feedback={false}
                    toggleMask
                    inputClassName={`${showError('confirmPassword') ? inputWithIconErrorClass : inputWithIconClass} pr-10`}
                    pt={passwordPt}
                  />
                </div>
                {showError('confirmPassword') && <p className={errorClass}>{fieldErrors.confirmPassword}</p>}
              </div>
            </div>

            <Divider className="my-2 border-gray-800" />

            <div className="flex items-center gap-2 mb-1">
              <MapPin size={14} className="text-gray-500" />
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Endereço (opcional)</span>
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black text-sm font-medium py-2.5 rounded-lg hover:bg-gray-200 transition-colors border-0 mt-2 disabled:opacity-60"
              label={loading ? 'Criando conta...' : 'Criar conta'}
            />
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-600 uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          <p className="text-center text-sm text-gray-400">
            Já tem conta?{' '}
            <Link to="/login" className="text-white font-medium no-underline hover:underline">
              Entrar
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          <Link to="/" className="text-gray-600 no-underline hover:text-gray-400 transition-colors">
            ← Voltar para a loja
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
