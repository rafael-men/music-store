import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { InputNumber } from 'primereact/inputnumber'
import { MultiSelect } from 'primereact/multiselect'
import { Checkbox } from 'primereact/checkbox'
import ProductImage from '../../../Components/ProductImage'
import DialogShell from '../../components/DialogShell'
import { formatCategory } from '../../../utils/categories'
import { inputClass, labelClass, multiSelectPt, numberInputPt } from '../../components/primeReactPt'
import { CATEGORY_OPTIONS } from './constants'

const ProductFormDialog = ({ mode, form, setForm, error, saving, onSave, onClose }) => {
  if (!mode) return null
  const isCreate = mode === 'create'

  return (
    <DialogShell
      visible={!!mode}
      onHide={onClose}
      eyebrow={isCreate ? 'Novo produto' : 'Editar produto'}
      title={isCreate ? 'Cadastrar no catálogo' : form.title || '—'}
      onConfirm={onSave}
      loading={saving}
      confirmLabel={isCreate ? 'Criar produto' : 'Salvar alterações'}
      maxWidth="max-w-2xl"
    >
      {error && (
        <div className="bg-red-900/20 border border-red-900/40 rounded-lg px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass}>Título</label>
        <InputText
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Nome do produto"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Descrição</label>
        <InputTextarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
          autoResize
          placeholder="Descrição detalhada"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>URL da imagem (opcional)</label>
        <InputText
          value={form.imageUrl}
          onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
          placeholder="https://..."
          className={inputClass}
        />
        <p className="text-[11px] text-gray-500 mt-1">
          Se vazio, será usada uma imagem padrão.
        </p>
        <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-gray-700 bg-gray-800">
          <ProductImage src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Categorias</label>
        <MultiSelect
          value={form.categories}
          onChange={(e) => setForm((f) => ({ ...f, categories: e.value }))}
          options={CATEGORY_OPTIONS}
          placeholder="Selecione categorias"
          filter
          display="comma"
          pt={multiSelectPt}
        />
        {form.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {form.categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-200 border border-gray-700"
              >
                {formatCategory(cat)}
                <button
                  type="button"
                  onClick={() => setForm((f) => ({
                    ...f,
                    categories: f.categories.filter((c) => c !== cat),
                  }))}
                  aria-label={`Remover ${formatCategory(cat)}`}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Preço (R$)</label>
          <InputNumber
            value={form.price}
            onValueChange={(e) => setForm((f) => ({ ...f, price: e.value }))}
            mode="decimal"
            minFractionDigits={2}
            maxFractionDigits={2}
            placeholder="0,00"
            pt={numberInputPt}
          />
        </div>
        <div>
          <label className={labelClass}>Estoque</label>
          <InputNumber
            value={form.stockQuantity}
            onValueChange={(e) => setForm((f) => ({ ...f, stockQuantity: e.value ?? 0 }))}
            min={0}
            pt={numberInputPt}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Checkbox
          inputId="available"
          checked={form.available}
          onChange={(e) => setForm((f) => ({ ...f, available: e.checked }))}
        />
        <label htmlFor="available" className="text-sm text-gray-300 cursor-pointer">
          Produto ativo (visível na loja)
        </label>
      </div>
    </DialogShell>
  )
}

export default ProductFormDialog
