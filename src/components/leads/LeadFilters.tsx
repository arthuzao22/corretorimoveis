'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Filter, X, Search } from 'lucide-react'

const ORIGEM_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'site', label: 'Site' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'perfil', label: 'Perfil' },
  { value: 'imovel', label: 'Imóvel' },
  { value: 'whatsapp', label: 'WhatsApp' },
]

const PRIORITY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'BAIXA', label: 'Baixa' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'URGENTE', label: 'Urgente' },
]

interface LeadFiltersProps {
  currentFilters?: any
  kanbanColumns?: Array<{
    id: string
    name: string
    color: string | null
  }>
}

export function LeadFilters({ currentFilters, kanbanColumns = [] }: LeadFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState({
    search: currentFilters?.search || '',
    kanbanColumnId: currentFilters?.kanbanColumnId || '',
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
      search: '',
      kanbanColumnId: '',
      priority: '',
      origem: '',
      dateFrom: '',
      dateTo: '',
    })
    router.push(window.location.pathname)
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '')

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
          <Filter className="w-4 h-4 text-slate-600" />
        </div>
        <span className="font-semibold text-slate-800">Filtros Avancados</span>
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="ml-auto px-4 py-2 text-sm bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-1.5 font-medium"
          >
            <X className="w-4 h-4" />
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 bg-white text-slate-800 placeholder:text-slate-400 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Kanban Column Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Fase do Funil
          </label>
          <select
            value={filters.kanbanColumnId}
            onChange={(e) => handleFilterChange('kanbanColumnId', e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 bg-white text-slate-800 transition-colors"
          >
            <option value="">Todas as Fases</option>
            {kanbanColumns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.name}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Prioridade
          </label>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 bg-white text-slate-800 transition-colors"
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
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Origem
          </label>
          <select
            value={filters.origem}
            onChange={(e) => handleFilterChange('origem', e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 bg-white text-slate-800 transition-colors"
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
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Data Inicial
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 bg-white text-slate-800 transition-colors"
          />
        </div>

        {/* Date To Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Data Final
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 bg-white text-slate-800 transition-colors"
          />
        </div>
      </div>
    </div>
  )
}
