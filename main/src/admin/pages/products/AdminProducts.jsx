import { useEffect, useMemo, useRef, useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { Package, Search, Plus } from 'lucide-react'
import { productsApi } from '../../../api/products'
import { extractErrorMessage } from '../../../api/client'
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog'
import ProductsTable from './ProductsTable'
import ProductFormDialog from './ProductFormDialog'
import { FALLBACK_IMAGE_URL, emptyForm } from './constants'

const validateForm = (form) => {
  if (!form.title.trim()) return 'Informe o título.'
  if (!form.description.trim()) return 'Informe a descrição.'
  if (form.price == null || form.price <= 0) return 'Informe um preço válido.'
  if (!form.categories || form.categories.length === 0) return 'Selecione ao menos uma categoria.'
  if (form.stockQuantity == null || form.stockQuantity < 0) return 'Estoque inválido.'
  return ''
}

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [deleting, setDeleting] = useState(null)
  const [deletingInProgress, setDeletingInProgress] = useState(false)

  const toast = useRef(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    productsApi
      .list()
      .then((data) => { if (!cancelled) setProducts(Array.isArray(data) ? data : []) })
      .catch((err) => { if (!cancelled) setError(extractErrorMessage(err, 'Falha ao carregar produtos.')) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const normalized = useMemo(() => {
    const filtered = !search
      ? products
      : products.filter((p) => (p.title || '').toLowerCase().includes(search.toLowerCase()))
    return filtered.map((p) => ({
      ...p,
      available: p.available ?? (p.stockQuantity > 0),
      stock: p.stock ?? p.stockQuantity ?? 0,
      categories: p.categories || [],
    }))
  }, [search, products])

  const openCreate = () => {
    setEditing('create')
    setEditForm(emptyForm)
    setFormError('')
  }

  const openEdit = (row) => {
    setEditing('edit')
    setEditForm({
      _id: row.id,
      title: row.title || '',
      description: row.description || '',
      price: typeof row.price === 'number' ? row.price : null,
      imageUrl: row.imageUrl || '',
      categories: row.categories || [],
      stockQuantity: row.stockQuantity ?? row.stock ?? 0,
      available: row.available ?? true,
    })
    setFormError('')
  }

  const closeEdit = () => {
    setEditing(null)
    setEditForm(emptyForm)
    setFormError('')
  }

  const handleSave = async () => {
    const err = validateForm(editForm)
    if (err) { setFormError(err); return }

    setSaving(true)
    try {
      const payload = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        price: editForm.price,
        imageUrl: editForm.imageUrl.trim() || FALLBACK_IMAGE_URL,
        categories: editForm.categories,
        maxInstallments: 1,
        stockQuantity: editForm.stockQuantity,
        available: editForm.available,
      }

      let saved
      if (editing === 'create') {
        saved = await productsApi.create(payload)
        setProducts((prev) => [saved, ...prev])
      } else {
        saved = await productsApi.update(editForm._id, payload)
        setProducts((prev) => prev.map((p) => (p.id === editForm._id ? saved : p)))
      }

      toast.current?.show({
        severity: 'success',
        summary: editing === 'create' ? 'Produto criado' : 'Produto atualizado',
        detail: saved.title,
        life: 2500,
      })
      closeEdit()
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Falha ao salvar produto.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setDeletingInProgress(true)
    try {
      await productsApi.remove(deleting.id)
      setProducts((prev) => prev.filter((p) => p.id !== deleting.id))
      toast.current?.show({
        severity: 'success',
        summary: 'Produto removido',
        detail: deleting.title,
        life: 2500,
      })
      setDeleting(null)
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao remover',
        detail: extractErrorMessage(err, 'Falha ao remover produto.'),
        life: 3500,
      })
    } finally {
      setDeletingInProgress(false)
    }
  }

  return (
    <div>
      <Toast ref={toast} position="top-right" />

      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <Package size={22} className="text-white" />
          <h1 className="text-2xl font-bold text-white">Produtos</h1>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors border-0 shrink-0"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Novo produto</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>
      <p className="text-sm text-gray-400 mb-6">Cadastre, edite e gerencie o catálogo da loja.</p>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <InputText
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produtos..."
          className="w-full glass-card rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
        />
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-900/40 rounded-lg px-4 py-3 mb-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <ProductsTable
        products={normalized}
        loading={loading}
        onEdit={openEdit}
        onDelete={setDeleting}
      />

      <ProductFormDialog
        mode={editing}
        form={editForm}
        setForm={setEditForm}
        error={formError}
        saving={saving}
        onSave={handleSave}
        onClose={closeEdit}
      />

      <ConfirmDeleteDialog
        visible={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deletingInProgress}
        title="Remover produto?"
        description={deleting ? `${deleting.title} será removido permanentemente do catálogo.` : ''}
      />
    </div>
  )
}

export default AdminProducts
