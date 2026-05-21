import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Pencil, Trash2 } from 'lucide-react'
import ProductImage from '../../../Components/ProductImage'
import { adminTablePt, adminColumnPt, adminPaginatorProps } from '../../components/tableStyles'
import { formatCategory } from '../../../utils/categories'
import { formatBRL } from '../../../utils/format'

const productTemplate = (row) => (
  <div className="flex items-center gap-3 min-w-0">
    <ProductImage
      src={row.imageUrl}
      alt={row.title}
      className="w-10 h-10 rounded-lg object-cover shrink-0 bg-gray-800"
    />
    <p className="text-sm text-white truncate">{row.title}</p>
  </div>
)

const categoriesTemplate = (row) => (
  <div className="flex flex-wrap gap-1">
    {row.categories.slice(0, 2).map((cat) => (
      <span key={cat} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
        {formatCategory(cat)}
      </span>
    ))}
    {row.categories.length > 2 && (
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-500 border border-gray-700">
        +{row.categories.length - 2}
      </span>
    )}
  </div>
)

const priceTemplate = (row) => (
  <span className="text-sm font-medium text-green-400">{formatBRL(row.price)}</span>
)

const stockTemplate = (row) => (
  <span className={`text-sm font-medium ${row.stock === 0 ? 'text-red-400' : row.stock < 10 ? 'text-yellow-400' : 'text-gray-300'}`}>
    {row.stock}
  </span>
)

const statusTemplate = (row) => (
  <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border ${
    row.available
      ? 'text-green-400 bg-green-500/10 border-green-500/30'
      : 'text-gray-400 bg-gray-800 border-gray-700'
  }`}>
    {row.available ? 'Ativo' : 'Inativo'}
  </span>
)

const ProductsTable = ({ products, loading, onEdit, onDelete }) => {
  const actionsTemplate = (row) => (
    <div className="flex items-center gap-1 justify-end">
      <button
        type="button"
        onClick={() => onEdit(row)}
        aria-label="Editar"
        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
      >
        <Pencil size={14} />
      </button>
      <button
        type="button"
        onClick={() => onDelete(row)}
        aria-label="Remover"
        className="p-1.5 rounded-lg text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )

  return (
    <DataTable
      value={products}
      pt={adminTablePt}
      rowHover
      stripedRows
      loading={loading}
      {...adminPaginatorProps}
      emptyMessage={loading ? 'Carregando...' : 'Nenhum produto encontrado.'}
    >
      <Column header="Produto"    body={productTemplate}    pt={adminColumnPt} />
      <Column header="Categorias" body={categoriesTemplate} pt={adminColumnPt} />
      <Column header="Preço"      body={priceTemplate}      pt={adminColumnPt} />
      <Column header="Estoque"    body={stockTemplate}      pt={adminColumnPt} />
      <Column header="Status"     body={statusTemplate}     pt={adminColumnPt} />
      <Column header=""           body={actionsTemplate}    pt={adminColumnPt} />
    </DataTable>
  )
}

export default ProductsTable
