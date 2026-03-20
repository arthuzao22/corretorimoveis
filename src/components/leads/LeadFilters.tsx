'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Filter, X, Search, ChevronDown } from 'lucide-react'

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
  const [expanded, setExpanded] = useState(false)
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

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v !== '' && k !== 'search').length

  return (
    <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4 md:mb-6">
        <div className="w-8 h-8 md:w-9 md:h-9 bg-slate-100 rounded-xl flex items-center justify-center">
          <Filter className="w-4 h-4 text-slate-600" />
        </div>
        <span className="font-semibold text-slate-800 text-sm md:text-base">Filtros</span>
        {activeFilterCount > 0 && (
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[11px] font-bold">{activeFilterCount}</span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1 font-medium"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Bar — always visible */}
      <div className="mb-4 md:mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 md:pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 bg-white text-slate-800 placeholder:text-slate-400 transition-colors text-sm"
          />
        </div>
      </div>

      {/* Filter grid — collapsible on mobile */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 ${expanded ? 'block' : 'hidden md:grid'}`}>
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
