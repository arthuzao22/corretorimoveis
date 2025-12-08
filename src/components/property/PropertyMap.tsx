'use client'

import { MapPin } from 'lucide-react'

interface PropertyMapProps {
  latitude: number
  longitude: number
  title: string
}

export function PropertyMap({ latitude, longitude, title }: PropertyMapProps) {
  // Using Google Maps embed for simplicity
  // In production, consider using a proper map library like Leaflet or Google Maps API
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${latitude},${longitude}`

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-900">Localização</h2>
      </div>
      
      <div className="bg-gray-100 rounded-lg p-4 text-center">
        <p className="text-gray-600">Mapa estático de localização</p>
        <p className="text-sm text-gray-500 mt-2">
          Coordenadas: {latitude}, {longitude}
        </p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Ver no Google Maps
        </a>
      </div>
    </div>
  )
}
