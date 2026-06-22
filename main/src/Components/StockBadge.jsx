const StockBadge = ({ stock, showLabel = false }) => {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
        {showLabel ? 'Sem estoque' : 'Esgotado'}
      </span>
    )
  }
  if (stock === 1) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
        Último disponível
      </span>
    )
  }
  if (stock <= 3) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
        {showLabel ? `${stock} em estoque` : `Últimas ${stock} unidades`}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
      {showLabel ? `${stock} em estoque` : 'Em estoque'}
    </span>
  )
}

export default StockBadge
