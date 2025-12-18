'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { MapPin, Loader2, AlertCircle } from 'lucide-react'

interface PropertyMapProps {
  latitude: number
  longitude: number
  title?: string
  address?: string
  className?: string
  zoom?: number
  height?: string
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export function PropertyMap({
  latitude,
  longitude,
  title = 'Localização do Imóvel',
  address,
  className = '',
  zoom = 15,
  height = '400px',
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API Key não configurada')
      setLoading(false)
      return
    }

    if (!latitude || !longitude) {
      setError('Coordenadas não fornecidas')
      setLoading(false)
      return
    }

    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places', 'marker'],
        })

        await loader.load()

        if (!mapRef.current) return

        const position = { lat: Number(latitude), lng: Number(longitude) }

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: position,
          zoom: zoom,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
          ],
        })

        // Add marker
        const marker = new google.maps.Marker({
          position: position,
          map: mapInstance,
          title: title,
          animation: google.maps.Animation.DROP,
        })

        // Add info window
        if (title || address) {
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 250px;">
                <h3 style="font-weight: bold; margin-bottom: 4px; color: #1f2937;">${title}</h3>
                ${address ? `<p style="font-size: 14px; color: #6b7280;">${address}</p>` : ''}
              </div>
            `,
          })

          marker.addListener('click', () => {
            infoWindow.open(mapInstance, marker)
          })

          // Open info window by default
          infoWindow.open(mapInstance, marker)
        }

        setMap(mapInstance)
        setLoading(false)
      } catch (err) {
        console.error('Error loading Google Maps:', err)
        setError('Erro ao carregar o mapa')
        setLoading(false)
      }
    }

    initMap()
  }, [latitude, longitude, title, address, zoom])

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-gray-700 font-medium">{error}</p>
          {!GOOGLE_MAPS_API_KEY && (
            <p className="text-xs text-gray-500 mt-2">
              Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY nas variáveis de ambiente
            </p>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative rounded-lg overflow-hidden shadow-lg ${className}`}>
      <div ref={mapRef} style={{ height, width: '100%' }} />
      
      {/* Map overlay with address */}
      {address && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 max-w-xs">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">{address}</p>
          </div>
        </div>
      )}
    </div>
  )
}
