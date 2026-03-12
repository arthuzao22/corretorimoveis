'use client'

import { useState } from 'react'
import { Filter, X, Home, Key } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface PropertyFilters {
  tipo?: 'VENDA' | 'ALUGUEL' | 'ALL'
  status?: 'ATIVO' | 'INATIVO' | 'VENDIDO' | 'ALUGADO' | 'COMPRADO' | 'OCUPADO' | 'ALL'
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

const VENDA_STATUS_OPTIONS = [
  { value: 'ATIVO', label: 'Ativo', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'VENDIDO', label: 'Vendido', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'COMPRADO', label: 'Comprado', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { value: 'OCUPADO', label: 'Ocupado', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'ALUGADO', label: 'Alugado', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
]

const ALUGUEL_STATUS_OPTIONS = [
  { value: 'ATIVO', label: 'Ativo', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'ALUGADO', label: 'Alugado', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'OCUPADO', label: 'Ocupado', color: 'bg-orange-100 text-orange-700 border-orange-300' },
]

export function PropertyFiltersBar({ filters, onFiltersChange, onClearFilters }: PropertyFiltersBarProps) {
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = Object.values(filters).some(v => v && v !== 'ALL')

  const updateFilter = (key: keyof PropertyFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined }
    // When changing tipo, reset status to avoid invalid combinations
    if (key === 'tipo') {
      newFilters.status = undefined
    }
    onFiltersChange(newFilters)
  }

  const getStatusOptions = () => {
    if (filters.tipo === 'VENDA') return VENDA_STATUS_OPTIONS
    if (filters.tipo === 'ALUGUEL') return ALUGUEL_STATUS_OPTIONS
    return []
  }

  const showStatusSubfilters = filters.tipo === 'VENDA' || filters.tipo === 'ALUGUEL'
  const statusOptions = getStatusOptions()

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
          placeholder="Buscar por titulo, endereco ou bairro..."
          value={filters.searchQuery || ''}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          className="w-full"
        />
      </div>

      {/* Category Tabs - Aluguel / Venda */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => updateFilter('tipo', filters.tipo === 'ALL' || !filters.tipo ? 'ALL' : 'ALL')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !filters.tipo || filters.tipo === 'ALL'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => updateFilter('tipo', 'VENDA')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            filters.tipo === 'VENDA'
              ? 'bg-blue-600 text-white'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
          }`}
        >
          <Home className="w-4 h-4" />
          Venda
        </button>
        <button
          onClick={() => updateFilter('tipo', 'ALUGUEL')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            filters.tipo === 'ALUGUEL'
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <Key className="w-4 h-4" />
          Aluguel
        </button>
      </div>

      {/* Status Sub-filters - shown when Venda or Aluguel is selected */}
      {showStatusSubfilters && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
            Status do Imovel ({filters.tipo === 'VENDA' ? 'Venda' : 'Aluguel'})
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateFilter('status', 'ALL')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                !filters.status || filters.status === 'ALL'
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Todos
            </button>
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateFilter('status', opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  filters.status === opt.value
                    ? opt.color + ' border-current font-semibold'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Additional Filters Grid */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Min Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor minimo
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
              Valor maximo
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
              Quartos (minimo)
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
