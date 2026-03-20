'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, Filter, X } from 'lucide-react'

interface FilterBarProps {
  currentFilters: any
}

interface Cidade {
  id: string
  nome: string
  uf: string
}

interface Status {
  id: string
  nome: string
  slug: string
}

export function FilterBar({ currentFilters }: FilterBarProps) {
  const router = useRouter()
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [statusList, setStatusList] = useState<Status[]>([])
  const [filters, setFilters] = useState({
    tipo: currentFilters.tipo || '',
    cidadeId: currentFilters.cidadeId || '',
    statusId: currentFilters.statusId || '',
    minValor: currentFilters.minValor || '',
    maxValor: currentFilters.maxValor || '',
    quartos: currentFilters.quartos || '',
    search: currentFilters.search || '',
  })

  useEffect(() => {
    // Fetch cidades
    fetch('/api/cidades')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setCidades(data.data)
        }
      })
      .catch((err) => console.error('Error fetching cidades:', err))

    // Fetch imovel status
    fetch('/api/imovel-status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setStatusList(data.data)
        }
      })
      .catch((err) => console.error('Error fetching status:', err))
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value))
      }
    })
    router.push(`/imoveis?${params.toString()}`)
  }

  const handleClear = () => {
    setFilters({
      tipo: '',
      cidadeId: '',
      statusId: '',
      minValor: '',
      maxValor: '',
      quartos: '',
      search: '',
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
        {/* Search */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Buscar
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Buscar por titulo ou descricao..."
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-colors text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tipo
          </label>
          <select
            value={filters.tipo}
            onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-colors text-slate-800"
          >
            <option value="">Todos</option>
            <option value="VENDA">Venda</option>
            <option value="ALUGUEL">Aluguel</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Status
          </label>
          <select
            value={filters.statusId}
            onChange={(e) => setFilters({ ...filters, statusId: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-colors text-slate-800"
          >
            <option value="">Todos</option>
            {statusList?.map((status) => (
              <option key={status.id} value={status.id}>
                {status.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Cidade */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Cidade
          </label>
          <select
            value={filters.cidadeId}
            onChange={(e) => setFilters({ ...filters, cidadeId: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-colors text-slate-800"
          >
            <option value="">Todas</option>
            {cidades?.map((cidade) => (
              <option key={cidade.id} value={cidade.id}>
                {cidade.nome} - {cidade.uf}
              </option>
            ))}
          </select>
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
            <option value="5">5+</option>
          </select>
        </div>

        {/* Valor Min */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Valor Minimo
          </label>
          <input
            type="number"
            value={filters.minValor}
            onChange={(e) => setFilters({ ...filters, minValor: e.target.value })}
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
            value={filters.maxValor}
            onChange={(e) => setFilters({ ...filters, maxValor: e.target.value })}
            placeholder="R$ 0"
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-colors text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-end gap-2 md:col-span-2 lg:col-span-1">
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
