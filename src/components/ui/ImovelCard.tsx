import React from 'react'
import Link from 'next/link'
import { MapPin, Eye } from 'lucide-react'
import Image from 'next/image'

interface ImovelCardProps {
  id: string
  titulo: string
  valor: number
  tipo: string
  cidade: string
  estado: string
  images: string[]
  views?: number
}

export function ImovelCard({ id, titulo, valor, tipo, cidade, estado, images, views }: ImovelCardProps) {
  const primeiraImagem = images[0] || '/placeholder-property.jpg'
  
  return (
    <Link href={`/imovel/${id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gray-200">
          {primeiraImagem && (
            <img
              src={primeiraImagem}
              alt={titulo}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          )}
          {/* Badge de tipo */}
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              tipo === 'VENDA' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
            }`}>
              {tipo === 'VENDA' ? 'Venda' : 'Aluguel'}
            </span>
          </div>
          {/* Views counter */}
          {views !== undefined && (
            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
              <Eye className="w-3 h-3 text-white" />
              <span className="text-xs text-white">{views}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {titulo}
          </h3>
          
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4" />
            <span>{cidade}, {estado}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                R$ {Number(valor).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
