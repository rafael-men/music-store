import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { ShieldCheck, Mail, Lock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { extractErrorMessage } from '../../api/client'

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim())

const AdminLogin = () => {
  const navigate = useNavigate()
  const { login, logout } = useAuth()
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
      const user = await login(form.email.trim(), form.password)
      if (user?.role !== 'ADMIN') {
        logout()
        setError('Esta conta não tem permissão de administrador.')
        return
      }
      navigate('/admin')
    } catch (err) {
      setError(extractErrorMessage(err, 'Credenciais inválidas.'))
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
          <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-4">
            <ShieldCheck size={26} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-white">Painel administrativo</h1>
          <p className="text-sm text-gray-400 mt-1">Acesso restrito a administradores</p>
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
                  placeholder="admin@musicstore.com"
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black text-sm font-medium py-2.5 rounded-lg hover:bg-gray-200 transition-colors border-0 mt-2 disabled:opacity-60"
              label={loading ? 'Entrando...' : 'Entrar no painel'}
            />
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
