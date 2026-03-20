'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'

interface SearchFiltersProps {
  currentFilters: any
}

export function SearchFilters({ currentFilters }: SearchFiltersProps) {
  const router = useRouter()
  const [filters, setFilters] = useState({
    tipo: currentFilters.tipo || 'TODOS',
    cidade: currentFilters.cidade || '',
    estado: currentFilters.estado || '',
    valorMin: currentFilters.valorMin || '',
    valorMax: currentFilters.valorMax || '',
    quartos: currentFilters.quartos || '',
    banheiros: currentFilters.banheiros || '',
  })

  const handleSearch = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'TODOS') {
        params.set(key, String(value))
      }
    })
    router.push(`/imoveis?${params.toString()}`)
  }

  const handleClear = () => {
    setFilters({
      tipo: 'TODOS',
      cidade: '',
      estado: '',
      valorMin: '',
      valorMax: '',
      quartos: '',
      banheiros: '',
    })
    router.push('/imoveis')
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
          <Filter className="w-4 h-4 text-slate-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">Filtros de Busca</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tipo de Imovel
          </label>
          <select
            value={filters.tipo}
            onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-colors text-slate-800"
          >
            <option value="TODOS">Todos</option>
            <option value="VENDA">Venda</option>
            <option value="ALUGUEL">Aluguel</option>
          </select>
        </div>

        {/* Cidade */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Cidade
          </label>
          <input
            type="text"
            value={filters.cidade}
            onChange={(e) => setFilters({ ...filters, cidade: e.target.value })}
            placeholder="Ex: Sao Paulo"
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-colors text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Estado
          </label>
          <input
            type="text"
            value={filters.estado}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            placeholder="Ex: SP"
            maxLength={2}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-colors text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Quartos */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Quartos (minimo)
          </label>
          <select
            value={filters.quartos}
            onChange={(e) => setFilters({ ...filters, quartos: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-colors text-slate-800"
          >
            <option value="">Qualquer</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>

        {/* Valor Min */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Valor Minimo
          </label>
          <input
            type="number"
            value={filters.valorMin}
            onChange={(e) => setFilters({ ...filters, valorMin: e.target.value })}
            placeholder="R$ 0"
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-colors text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Valor Max */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Valor Maximo
          </label>
          <input
            type="number"
            value={filters.valorMax}
            onChange={(e) => setFilters({ ...filters, valorMax: e.target.value })}
            placeholder="R$ 0"
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-colors text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Banheiros */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Banheiros (minimo)
          </label>
          <select
            value={filters.banheiros}
            onChange={(e) => setFilters({ ...filters, banheiros: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-colors text-slate-800"
          >
            <option value="">Qualquer</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-end gap-2">
          <button
            onClick={handleSearch}
            className="flex-1 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Search className="w-4 h-4" />
            Buscar
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
            title="Limpar filtros"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
