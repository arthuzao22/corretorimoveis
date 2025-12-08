import { Bed, Bath, Square, Car, Eye, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export function PropertyDetails({ imovel }: { imovel: any }) {
  const features = [
    { icon: Bed, label: 'Quartos', value: imovel.quartos },
    { icon: Bath, label: 'Banheiros', value: imovel.banheiros },
    { icon: Square, label: 'Área', value: imovel.area ? `${imovel.area}m²` : null },
    { icon: Car, label: 'Garagem', value: imovel.garagem },
    { icon: Eye, label: 'Visualizações', value: imovel.views },
    { icon: Calendar, label: 'Publicado', value: formatDate(imovel.createdAt) },
  ].filter(f => f.value != null && f.value !== 0)

  if (features.length === 0) return null

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">Características</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <feature.icon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">{feature.label}</p>
              <p className="font-semibold text-gray-900">{feature.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
