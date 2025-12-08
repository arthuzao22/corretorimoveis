import React from 'react'
import Link from 'next/link'
import { MapPin, Eye, Bed, Bath, Square, Car } from 'lucide-react'
import Image from 'next/image'

interface ImovelCardProps {
  imovel: {
    id: string
    titulo: string
    valor: number | string
    tipo: string
    cidade: string
    estado: string
    images: string[]
    views?: number
    quartos?: number | null
    banheiros?: number | null
    area?: number | string | null
    garagem?: number | null
  }
}

export function ImovelCard({ imovel }: ImovelCardProps) {
  const { id, titulo, valor, tipo, cidade, estado, images, views, quartos, banheiros, area, garagem } = imovel
  const primeiraImagem = images[0] || '/placeholder-property.jpg'
  
  return (
    <Link href={`/imovel/${id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col">
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
            <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
              tipo === 'VENDA' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
            }`}>
              {tipo === 'VENDA' ? 'Venda' : 'Aluguel'}
            </span>
          </div>
          {/* Views counter */}
          {views !== undefined && views > 0 && (
            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
              <Eye className="w-3 h-3 text-white" />
              <span className="text-xs text-white">{views}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {titulo}
          </h3>
          
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4" />
            <span>{cidade}, {estado}</span>
          </div>

          {/* Features */}
          {(quartos || banheiros || area || garagem) && (
            <div className="flex items-center gap-3 mb-3 text-sm text-gray-600 flex-wrap">
              {quartos && (
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  <span>{quartos}</span>
                </div>
              )}
              {banheiros && (
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4" />
                  <span>{banheiros}</span>
                </div>
              )}
              {area && (
                <div className="flex items-center gap-1">
                  <Square className="w-4 h-4" />
                  <span>{Number(area)}m²</span>
                </div>
              )}
              {garagem && (
                <div className="flex items-center gap-1">
                  <Car className="w-4 h-4" />
                  <span>{garagem}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-auto">
            <p className="text-2xl font-bold text-blue-600">
              R$ {Number(valor).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
