'use client'

import { MapPin } from 'lucide-react'
import { PropertyMap as GooglePropertyMap } from '@/components/maps/PropertyMap'

interface PropertyMapProps {
  latitude: number
  longitude: number
  title: string
  address?: string
}

export function PropertyMap({ latitude, longitude, title, address }: PropertyMapProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-900">Localização</h2>
      </div>
      
      <GooglePropertyMap
        latitude={latitude}
        longitude={longitude}
        title={title}
        address={address}
        height="450px"
      />
      
      <div className="mt-4">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center w-full"
        >
          Abrir no Google Maps
        </a>
      </div>
    </div>
  )
}

