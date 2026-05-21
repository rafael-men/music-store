import { MapPin } from 'lucide-react'

const DeliveryAddress = ({ address }) => {
  if (!address) return null
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3">
      <div className="flex items-start gap-2">
        <MapPin size={13} className="text-gray-400 mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-0.5">Endereço de entrega</p>
          <p className="text-[13px] text-gray-300 leading-snug">{address}</p>
        </div>
      </div>
    </div>
  )
}

export default DeliveryAddress
