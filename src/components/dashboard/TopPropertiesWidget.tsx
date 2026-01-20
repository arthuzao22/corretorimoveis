'use client'

import { Card } from '@/components/ui/Card'
import { Eye, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface TopProperty {
  id: string
  titulo: string
  views: number
  leads: number
  image: string | null
}

interface TopPropertiesWidgetProps {
  properties: TopProperty[]
}

export function TopPropertiesWidget({ properties }: TopPropertiesWidgetProps) {
  if (properties.length === 0) {
    return (
      <Card>
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Imóveis Mais Visualizados</h2>
        <p className="text-gray-500 text-center py-8">Nenhum imóvel com visualizações ainda.</p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Imóveis Mais Visualizados</h2>
        <Link href="/corretor/imoveis" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          Ver todos →
        </Link>
      </div>
      <div className="space-y-4">
        {properties.map((property, index) => (
          <Link
            key={property.id}
            href={`/corretor/imoveis/${property.id}/editar`}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
          >
            {/* Ranking number */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {index + 1}
            </div>
            
            {/* Property image */}
            {property.image ? (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={property.image}
                  alt={property.titulo}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0" />
            )}
            
            {/* Property info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{property.titulo}</h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {property.views} visualizações
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {property.leads} leads
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  )
}
