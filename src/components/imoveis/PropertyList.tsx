'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Edit2, 
  Trash2, 
  MapPin, 
  BedDouble, 
  Bath, 
  Car, 
  Maximize, 
  Eye,
  TrendingUp,
  Building2
} from 'lucide-react'
import { ImovelTipo, ImovelStatus } from '@prisma/client'

interface Imovel {
  id: string
  titulo: string
  tipo: ImovelTipo
  status: ImovelStatus
  valor: number
  endereco: string
  cidade: string
  estado: string
  bairro?: string | null
  quartos?: number | null
  banheiros?: number | null
  suites?: number | null
  area?: number | null
  garagem?: number | null
  images: string[]
  views: number
  destaque: boolean
  createdAt: Date | string
}

interface PropertyListProps {
  imoveis: Imovel[]
  onDelete: (id: string) => Promise<void>
  loading?: boolean
  emptyMessage?: string
}

const STATUS_CONFIG = {
  ATIVO: { label: 'Ativo', color: 'bg-green-600' },
  INATIVO: { label: 'Inativo', color: 'bg-gray-600' },
  VENDIDO: { label: 'Vendido', color: 'bg-blue-600' },
  ALUGADO: { label: 'Alugado', color: 'bg-purple-600' },
}

export function PropertyList({ imoveis, onDelete, loading, emptyMessage }: PropertyListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este imóvel?')) return
    
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-xl h-64"></div>
          </div>
        ))}
      </div>
    )
  }

  if (imoveis.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">{emptyMessage || 'Nenhum imóvel encontrado'}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {imoveis.map((imovel) => (
        <Card key={imovel.id} className="group hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col h-full">
            {/* Image */}
            <div className="relative h-48 -m-6 mb-4 overflow-hidden rounded-t-xl">
              {imovel.images && imovel.images.length > 0 ? (
                <img
                  src={imovel.images[0]}
                  alt={imovel.titulo}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-gray-400" />
                </div>
              )}

              {/* Status Badge */}
              <span
                className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg ${
                  STATUS_CONFIG[imovel.status]?.color || 'bg-gray-600'
                }`}
              >
                {STATUS_CONFIG[imovel.status]?.label || imovel.status}
              </span>

              {/* Destaque Badge */}
              {imovel.destaque && (
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white shadow-lg flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Destaque
                </span>
              )}

              {/* Views Counter */}
              <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {imovel.views}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                  {imovel.titulo}
                </h3>
                
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">
                    {imovel.bairro && `${imovel.bairro}, `}
                    {imovel.cidade} - {imovel.estado}
                  </span>
                </div>

                <p className="text-2xl font-bold text-green-600">
                  R$ {imovel.valor.toLocaleString('pt-BR')}
                </p>
              </div>

              {/* Property Features */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                {imovel.quartos != null && (
                  <div className="flex items-center gap-1">
                    <BedDouble className="w-4 h-4" />
                    <span>{imovel.quartos}</span>
                  </div>
                )}
                {imovel.banheiros != null && (
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    <span>{imovel.banheiros}</span>
                  </div>
                )}
                {imovel.garagem != null && (
                  <div className="flex items-center gap-1">
                    <Car className="w-4 h-4" />
                    <span>{imovel.garagem}</span>
                  </div>
                )}
                {imovel.area != null && (
                  <div className="flex items-center gap-1">
                    <Maximize className="w-4 h-4" />
                    <span>{imovel.area}m²</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                <Link href={`/corretor/imoveis/${imovel.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(imovel.id)}
                  disabled={deletingId === imovel.id}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {deletingId === imovel.id ? 'Excluindo...' : ''}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
