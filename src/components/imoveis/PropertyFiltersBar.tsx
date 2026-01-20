'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface PropertyFilters {
  tipo?: 'VENDA' | 'ALUGUEL' | 'ALL'
  status?: 'ATIVO' | 'INATIVO' | 'VENDIDO' | 'ALUGADO' | 'ALL'
  minValor?: string
  maxValor?: string
  bairro?: string
  quartos?: string
  searchQuery?: string
}

interface PropertyFiltersBarProps {
  filters: PropertyFilters
  onFiltersChange: (filters: PropertyFilters) => void
  onClearFilters: () => void
}

export function PropertyFiltersBar({ filters, onFiltersChange, onClearFilters }: PropertyFiltersBarProps) {
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = Object.values(filters).some(v => v && v !== 'ALL')

  const updateFilter = (key: keyof PropertyFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value || undefined })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filtros</h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              Ativos
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Limpar
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showFilters ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
      </div>

      {/* Search Bar - Always Visible */}
      <div className="mb-3">
        <Input
          type="text"
          placeholder="Buscar por título, endereço ou bairro..."
          value={filters.searchQuery || ''}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          className="w-full"
        />
      </div>

      {/* Filters Grid */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={filters.tipo || 'ALL'}
              onChange={(e) => updateFilter('tipo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">Todos</option>
              <option value="VENDA">Venda</option>
              <option value="ALUGUEL">Aluguel</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status || 'ALL'}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">Todos</option>
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
              <option value="VENDIDO">Vendido</option>
              <option value="ALUGADO">Alugado</option>
            </select>
          </div>

          {/* Min Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor mínimo
            </label>
            <Input
              type="number"
              placeholder="R$ 0"
              value={filters.minValor || ''}
              onChange={(e) => updateFilter('minValor', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Max Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor máximo
            </label>
            <Input
              type="number"
              placeholder="R$ 0"
              value={filters.maxValor || ''}
              onChange={(e) => updateFilter('maxValor', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Bairro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bairro
            </label>
            <Input
              type="text"
              placeholder="Digite o bairro"
              value={filters.bairro || ''}
              onChange={(e) => updateFilter('bairro', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Quartos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quartos (mínimo)
            </label>
            <select
              value={filters.quartos || ''}
              onChange={(e) => updateFilter('quartos', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Qualquer</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
