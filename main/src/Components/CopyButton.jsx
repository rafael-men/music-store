import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

const CopyButton = ({ text, label = 'Copiar' }) => {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.error(e)
    }
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
    >
      {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
      {copied ? 'Copiado' : label}
    </button>
  )
}

export default CopyButton
