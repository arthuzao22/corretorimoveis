'use client'

import { LayoutGrid, List, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export type ViewType = 'grid' | 'list'
export type SortOption = 'createdAt' | 'valor-asc' | 'valor-desc' | 'views' | 'titulo'

interface ViewAndSortControlsProps {
  view: ViewType
  onViewChange: (view: ViewType) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  totalCount: number
}

export function ViewAndSortControls({ view, onViewChange, sortBy, onSortChange, totalCount }: ViewAndSortControlsProps) {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {/* Results count */}
      <div className="text-sm text-gray-600">
        <span className="font-medium text-gray-900">{totalCount}</span> {totalCount === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="createdAt">Mais recentes</option>
            <option value="valor-asc">Menor preço</option>
            <option value="valor-desc">Maior preço</option>
            <option value="views">Mais visualizados</option>
            <option value="titulo">Título (A-Z)</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
          <button
            onClick={() => onViewChange('grid')}
            className={`p-1.5 rounded ${
              view === 'grid'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Visualização em grade"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={`p-1.5 rounded ${
              view === 'list'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Visualização em lista"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
