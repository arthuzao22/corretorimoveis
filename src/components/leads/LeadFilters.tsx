'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Filter, X } from 'lucide-react'
import { LeadStatus, LeadPriority } from '@prisma/client'

const ORIGEM_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'site', label: 'Site' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'perfil', label: 'Perfil' },
  { value: 'imovel', label: 'Imóvel' },
  { value: 'whatsapp', label: 'WhatsApp' },
]

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'NOVO', label: 'Novo' },
  { value: 'CONTATADO', label: 'Contatado' },
  { value: 'ACOMPANHAMENTO', label: 'Follow-up' },
  { value: 'VISITA_AGENDADA', label: 'Visita Agendada' },
  { value: 'QUALIFICADO', label: 'Qualificado' },
  { value: 'NEGOCIACAO', label: 'Negociando' },
  { value: 'FECHADO', label: 'Fechado' },
  { value: 'CONVERTIDO', label: 'Convertido' },
  { value: 'PERDIDO', label: 'Perdido' },
]

const PRIORITY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'BAIXA', label: 'Baixa' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'URGENTE', label: 'Urgente' },
]

export function LeadFilters({ currentFilters }: { currentFilters?: any }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState({
    status: currentFilters?.status || '',
    priority: currentFilters?.priority || '',
    origem: currentFilters?.origem || '',
    dateFrom: currentFilters?.dateFrom || '',
    dateTo: currentFilters?.dateTo || '',
  })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    
    router.push(`?${params.toString()}`)
  }

  const handleClear = () => {
    setFilters({
      status: '',
      priority: '',
      origem: '',
      dateFrom: '',
      dateTo: '',
    })
    router.push(window.location.pathname)
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '')

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-purple-600" />
        <span className="font-semibold text-gray-900">Filtros Avançados</span>
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="ml-auto px-4 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1 border border-red-200"
          >
            <X className="w-4 h-4" />
            Limpar Filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prioridade
          </label>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
          >
            {ORIGEM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date From Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Inicial
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
          />
        </div>

        {/* Date To Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Final
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
          />
        </div>
      </div>
    </div>
  )
}
