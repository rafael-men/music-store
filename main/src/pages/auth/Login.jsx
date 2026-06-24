import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { Music2, Mail, Lock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { extractErrorMessage } from '../../api/client'

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim())

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleBlur = (field) => () => setTouched((prev) => ({ ...prev, [field]: true }))

  const fieldErrors = {
    email: !form.email.trim()
      ? 'Informe seu e-mail.'
      : !isValidEmail(form.email) ? 'E-mail inválido.' : '',
    password: !form.password ? 'Informe sua senha.' : '',
  }
  const showError = (field) => touched[field] && fieldErrors[field]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setTouched({ email: true, password: true })

    const firstError = Object.values(fieldErrors).find(Boolean)
    if (firstError) {
      setError(firstError)
      return
    }

    setLoading(true)
    try {
      await login(form.email.trim(), form.password)
      navigate('/')
    } catch (err) {
      setError(extractErrorMessage(err, 'E-mail ou senha inválidos.'))
    } finally {
      setLoading(false)
    }
  }

  const inputOk = 'w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors'
  const inputErr = 'w-full bg-gray-800 border border-red-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors'

  return (
    <div className="min-h-screen bg-transparent text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Music2 size={28} className="text-white" />
            <span className="text-2xl font-bold tracking-wide">Music Store</span>
          </div>
          <h1 className="text-xl font-semibold text-white">Bem-vindo de volta</h1>
          <p className="text-sm text-gray-400 mt-1">Entre para acessar sua conta</p>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8">
          {error && (
            <div className="mb-4">
              <Message severity="error" text={error} className="w-full" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-400 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" />
                <InputText
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  onBlur={handleBlur('email')}
                  placeholder="voce@email.com"
                  className={showError('email') ? inputErr : inputOk}
                />
              </div>
              {showError('email') && <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-400 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-20" />
                <Password
                  inputId="password"
                  value={form.password}
                  onChange={handleChange('password')}
                  onBlur={handleBlur('password')}
                  placeholder="Sua senha"
                  feedback={false}
                  toggleMask
                  inputClassName={`${showError('password') ? inputErr : inputOk} pr-10`}
                  pt={{
                    root: { className: 'w-full block' },
                    iconField: { root: { className: 'w-full block' } },
                    hideIcon: { className: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-200 cursor-pointer' },
                    showIcon: { className: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-200 cursor-pointer' },
                  }}
                />
              </div>
              {showError('password') && <p className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black text-sm font-medium py-2.5 rounded-lg hover:bg-gray-200 transition-colors border-0 disabled:opacity-60"
              label={loading ? 'Entrando...' : 'Entrar'}
            />
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-600 uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          <p className="text-center text-sm text-gray-400">
            Ainda não tem conta?{' '}
            <Link to="/register" className="text-white font-medium no-underline hover:underline">
              Cadastre-se
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

export default Login
