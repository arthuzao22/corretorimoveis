'use client'

import { useMemo } from 'react'

interface GoogleMapsIframeProps {
  endereco?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
  numero?: string
  height?: string
  width?: string
  className?: string
}

export function GoogleMapsIframe({
  endereco,
  bairro,
  cidade,
  estado,
  cep,
  numero,
  height = '300px',
  width = '100%',
  className = ''
}: GoogleMapsIframeProps) {
  // Função para construir o endereço completo
  const buildFullAddress = () => {
    const parts = []
    
    // Endereço principal (logradouro + número)
    if (endereco) {
      let address = endereco.trim()
      if (numero && !endereco.includes(numero)) {
        address += `, ${numero}`
      }
      parts.push(address)
    }
    
    // Bairro
    if (bairro) {
      parts.push(bairro.trim())
    }
    
    // Cidade e Estado
    if (cidade && estado) {
      parts.push(`${cidade.trim()} - ${estado.trim().toUpperCase()}`)
    } else if (cidade) {
      parts.push(cidade.trim())
    }
    
    // CEP
    if (cep) {
      parts.push(cep.trim())
    }
    
    return parts.filter(Boolean).join(', ')
  }

  // Memoizar o endereço completo e URL do iframe
  const fullAddress = useMemo(() => buildFullAddress(), [endereco, bairro, cidade, estado, cep, numero])
  
  const iframeUrl = useMemo(() => {
    if (!fullAddress) return null
    
    // Sanitizar e codificar o endereço para URL
    const encodedAddress = encodeURIComponent(fullAddress)
    
    // URL base do Google Maps para embed
    return `https://www.google.com/maps?q=${encodedAddress}&output=embed`
  }, [fullAddress])

  // Verificar se temos endereço mínimo necessário
  const hasMinimumAddress = endereco && cidade

  if (!hasMinimumAddress) {
    return (
      <div 
        className={`border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center ${className}`}
        style={{ height, width }}
      >
        <div className="text-center text-gray-500 p-4">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-sm font-medium">Mapa do Google</p>
          <p className="text-xs">Preencha o endereço e cidade para visualizar</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header com endereço */}
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">📍</span>
          <span className="text-sm text-gray-600 truncate">{fullAddress}</span>
        </div>
      </div>
      
      {/* Iframe do Google Maps */}
      <iframe
        src={iframeUrl || ''}
        width={width}
        height={height}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Mapa: ${fullAddress}`}
        className="w-full"
      />
    </div>
  )
}

// Componente auxiliar para validar se o endereço está completo o suficiente para exibir o mapa
export function shouldShowMap(endereco?: string, cidade?: string): boolean {
  return Boolean(endereco && endereco.trim().length >= 5 && cidade && cidade.trim().length >= 2)
}