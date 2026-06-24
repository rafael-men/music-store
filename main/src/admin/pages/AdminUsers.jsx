import { useEffect, useMemo, useRef, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { Toast } from 'primereact/toast'
import { Users, Search, ShieldCheck, User as UserIcon, Trash2, AlertTriangle } from 'lucide-react'
import { adminTablePt, adminColumnPt, adminPaginatorProps } from '../components/tableStyles'
import { usersApi } from '../../api/users'
import { extractErrorMessage } from '../../api/client'
import { useAuth } from '../../contexts/AuthContext'

const tablePt = adminTablePt
const columnPt = adminColumnPt

const AdminUsers = () => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [deletingInProgress, setDeletingInProgress] = useState(false)
  const toast = useRef(null)

  const handleDelete = async () => {
    if (!deleting) return
    setDeletingInProgress(true)
    try {
      await usersApi.remove(deleting.id)
      setUsers((prev) => prev.filter((u) => u.id !== deleting.id))
      toast.current?.show({
        severity: 'success',
        summary: 'Usuário removido',
        detail: deleting.name || deleting.email,
        life: 2500,
      })
      setDeleting(null)
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao remover',
        detail: extractErrorMessage(err, 'Falha ao remover usuário.'),
        life: 3500,
      })
    } finally {
      setDeletingInProgress(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    usersApi
      .list()
      .then((data) => {
        if (!cancelled) setUsers(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, 'Falha ao carregar usuários.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    if (!search) return users
    const q = search.toLowerCase()
    return users.filter((u) =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.cpf || '').includes(search)
    )
  }, [search, users])

  const userTemplate = (row) => (
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
        {row.profilePhotoUrl ? (
          <img src={row.profilePhotoUrl} alt={row.name} className="w-full h-full object-cover" />
        ) : (
          <UserIcon size={14} className="text-gray-500" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-white truncate">{row.name}</p>
        <p className="text-xs text-gray-500 truncate">{row.email}</p>
      </div>
    </div>
  )

  const cpfTemplate = (row) => (
    <span className="text-xs font-mono text-gray-400">{row.cpf || '—'}</span>
  )

  const roleTemplate = (row) => (
    row.role === 'ADMIN' ? (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-full">
        <ShieldCheck size={11} />
        Admin
      </span>
    ) : (
      <span className="inline-flex items-center text-[11px] font-medium text-gray-400 bg-gray-800 border border-gray-700 px-2 py-0.5 rounded-full">
        Cliente
      </span>
    )
  )

  const favoritesTemplate = (row) => (
    <span className="text-sm text-gray-300">{(row.favoriteProductIds || []).length}</span>
  )

  const cityTemplate = (row) => (
    <span className="text-xs text-gray-400">
      {row.address?.city ? `${row.address.city}/${row.address.state}` : '—'}
    </span>
  )

  const actionsTemplate = (row) => {
    const isSelf = currentUser?.id === row.id
    return (
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setDeleting(row)}
          disabled={isSelf}
          aria-label="Remover usuário"
          title={isSelf ? 'Você não pode remover sua própria conta' : 'Remover usuário'}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
        >
          <Trash2 size={14} />
        </button>
      </div>
    )
  }

  return (
    <div>
      <Toast ref={toast} position="top-right" />

      <div className="flex items-center gap-3 mb-2">
        <Users size={22} className="text-white" />
        <h1 className="text-2xl font-bold text-white">Usuários</h1>
      </div>
      <p className="text-sm text-gray-400 mb-6">Lista de contas cadastradas na plataforma.</p>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <InputText
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail ou CPF"
          className="w-full glass-card rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
        />
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-900/40 rounded-lg px-4 py-3 mb-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <DataTable
        value={filtered}
        pt={tablePt}
        rowHover
        stripedRows
        loading={loading}
        {...adminPaginatorProps}
        emptyMessage={loading ? 'Carregando...' : 'Nenhum usuário encontrado.'}
      >
        <Column header="Usuário"   body={userTemplate}      pt={columnPt} />
        <Column header="CPF"       body={cpfTemplate}       pt={columnPt} />
        <Column header="Cidade"    body={cityTemplate}      pt={columnPt} />
        <Column header="Favoritos" body={favoritesTemplate} pt={columnPt} />
        <Column header="Tipo"      body={roleTemplate}      pt={columnPt} />
        <Column header=""          body={actionsTemplate}   pt={columnPt} />
      </DataTable>

      <Dialog
        visible={!!deleting}
        onHide={() => setDeleting(null)}
        showHeader={false}
        modal
        dismissableMask
        pt={{
          mask: { className: 'bg-black/70 backdrop-blur-sm' },
          root: { className: 'w-full max-w-sm mx-4' },
          content: { className: 'glass-card rounded-2xl overflow-hidden p-0' },
        }}
      >
        {deleting && (
          <div>
            <div className="p-5 text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={22} className="text-red-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Remover usuário?</h3>
              <p className="text-sm text-gray-400">
                <span className="text-gray-200">{deleting.name || deleting.email}</span> será removido permanentemente.
              </p>
              {deleting.role === 'ADMIN' && (
                <p className="text-xs text-yellow-400 mt-2">
                  Atenção: esta conta tem privilégios de administrador.
                </p>
              )}
            </div>
            <div className="flex gap-2 px-5 pb-5">
              <Button
                type="button"
                onClick={() => setDeleting(null)}
                label="Cancelar"
                className="flex-1 text-sm font-medium text-gray-300 border border-gray-700 py-2 rounded-lg hover:border-gray-500 hover:text-white transition-colors bg-transparent"
              />
              <Button
                type="button"
                onClick={handleDelete}
                disabled={deletingInProgress}
                label={deletingInProgress ? 'Removendo...' : 'Remover'}
                className="flex-1 text-sm font-medium text-white bg-red-600 py-2 rounded-lg hover:bg-red-500 transition-colors border-0 disabled:opacity-60"
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}

export default AdminUsers
