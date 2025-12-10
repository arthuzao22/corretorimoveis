'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Filter, X } from 'lucide-react'

const ORIGEM_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'site', label: 'Site' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'perfil', label: 'Perfil' },
  { value: 'imovel', label: 'Imóvel' },
  { value: 'whatsapp', label: 'WhatsApp' },
]

interface Status {
  id: string
  nome: string
  slug: string
}

export function LeadFilters({ currentFilters }: { currentFilters?: any }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [statusList, setStatusList] = useState<Status[]>([])
  const [filters, setFilters] = useState({
    statusId: currentFilters?.statusId || '',
    origem: currentFilters?.origem || '',
  })

  useEffect(() => {
    // Fetch lead status
    fetch('/api/lead-status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatusList(data.statusList)
        }
      })
      .catch((err) => console.error('Error fetching status:', err))
  }, [])

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`?${params.toString()}`)
  }

  const handleClear = () => {
    setFilters({
      statusId: '',
      origem: '',
    })
    router.push(window.location.pathname)
  }

  const hasActiveFilters = filters.statusId || filters.origem

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-blue-600" />
        <span className="font-medium text-gray-700">Filtros</span>
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="ml-auto px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Limpar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.statusId}
            onChange={(e) => handleFilterChange('statusId', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos</option>
            {statusList.map((status) => (
              <option key={status.id} value={status.id}>
                {status.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Origem Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Origem
          </label>
          <select
            value={filters.origem}
            onChange={(e) => handleFilterChange('origem', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {ORIGEM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
