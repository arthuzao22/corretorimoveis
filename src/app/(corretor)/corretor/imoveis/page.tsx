'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getMyImoveis, deleteImovel } from '@/server/actions/imoveis'
import { ShareButtons } from '@/components/imoveis/ShareButtons'
import { QRCodeModal } from '@/components/imoveis/QRCodeModal'
import { PropertyFiltersBar } from '@/components/imoveis/PropertyFiltersBar'
import { ViewAndSortControls, ViewType, SortOption } from '@/components/imoveis/ViewAndSortControls'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Eye, Home, Bed, Bath, Car } from 'lucide-react'

type Imovel = {
  id: string
  titulo: string
  tipo: string
  status: string
  valor: number
  cidade: string
  estado: string
  bairro?: string
  endereco?: string
  quartos?: number
  banheiros?: number
  garagem?: number
  area?: number
  views?: number
  images: string[]
  createdAt: Date
}

interface PropertyFilters {
  tipo?: 'VENDA' | 'ALUGUEL' | 'ALL'
  status?: 'ATIVO' | 'INATIVO' | 'VENDIDO' | 'ALUGADO' | 'COMPRADO' | 'OCUPADO' | 'ALL'
  minValor?: string
  maxValor?: string
  bairro?: string
  quartos?: string
  searchQuery?: string
}

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [loading, setLoading] = useState(true)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [selectedImovel, setSelectedImovel] = useState<Imovel | null>(null)
  const [view, setView] = useState<ViewType>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('createdAt')
  const [filters, setFilters] = useState<PropertyFilters>({})

  const loadImoveis = async () => {
    const result = await getMyImoveis()
    if (result.success && result.imoveis) {
      setImoveis(result.imoveis as any)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadImoveis()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este imóvel?')) {
      return
    }

    const result = await deleteImovel(id)
    if (result.success) {
      loadImoveis()
    } else {
      alert(result.error)
    }
  }

  const handleQRCodeClick = (imovel: Imovel) => {
    setSelectedImovel(imovel)
    setQrModalOpen(true)
  }

  // Filter and sort properties
  const filteredAndSortedImoveis = useMemo(() => {
    let result = [...imoveis]

    // Apply filters
    if (filters.tipo && filters.tipo !== 'ALL') {
      result = result.filter(i => i.tipo === filters.tipo)
    }
    if (filters.status && filters.status !== 'ALL') {
      result = result.filter(i => i.status === filters.status)
    }
    if (filters.minValor) {
      const min = Number(filters.minValor)
      result = result.filter(i => Number(i.valor) >= min)
    }
    if (filters.maxValor) {
      const max = Number(filters.maxValor)
      result = result.filter(i => Number(i.valor) <= max)
    }
    if (filters.bairro) {
      const bairroLower = filters.bairro.toLowerCase()
      result = result.filter(i => i.bairro?.toLowerCase().includes(bairroLower))
    }
    if (filters.quartos) {
      const min = Number(filters.quartos)
      result = result.filter(i => (i.quartos || 0) >= min)
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      result = result.filter(i => 
        i.titulo.toLowerCase().includes(query) ||
        i.endereco?.toLowerCase().includes(query) ||
        i.bairro?.toLowerCase().includes(query) ||
        i.cidade.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    switch (sortBy) {
      case 'createdAt':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'valor-asc':
        result.sort((a, b) => Number(a.valor) - Number(b.valor))
        break
      case 'valor-desc':
        result.sort((a, b) => Number(b.valor) - Number(a.valor))
        break
      case 'views':
        result.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
      case 'titulo':
        result.sort((a, b) => a.titulo.localeCompare(b.titulo))
        break
    }

    return result
  }, [imoveis, filters, sortBy])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Meus Imoveis</h1>
          <p className="text-slate-500 mt-1 text-sm">Gerencie seus imoveis cadastrados</p>
        </div>
        <Link href="/corretor/imoveis/novo">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors text-sm font-medium shadow-sm">
            <Plus className="w-4 h-4" />
            Novo Imovel
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : imoveis.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Nenhum imovel cadastrado</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">Comece cadastrando seu primeiro imovel para exibi-lo aos seus clientes.</p>
            <Link href="/corretor/imoveis/novo">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors text-sm font-medium shadow-sm">
                <Plus className="w-4 h-4" />
                Cadastrar Primeiro Imovel
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Filters */}
          <PropertyFiltersBar
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={() => setFilters({})}
          />

          {/* View and Sort Controls */}
          <ViewAndSortControls
            view={view}
            onViewChange={setView}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalCount={filteredAndSortedImoveis.length}
          />

          {/* Properties Grid/List */}
          {filteredAndSortedImoveis.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="text-center py-12 px-6">
                <p className="text-slate-500 mb-4">Nenhum imovel encontrado com os filtros selecionados.</p>
                <button 
                  onClick={() => setFilters({})} 
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          ) : (
            <div className={view === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
              {filteredAndSortedImoveis.map((imovel) => (
                <div key={imovel.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all overflow-hidden">
                  <div className={view === 'list' ? 'flex gap-4 p-4' : 'flex flex-col h-full'}>
                    {/* Image Preview */}
                    {imovel.images && imovel.images.length > 0 && (
                      <div className={`relative ${view === 'list' ? 'w-48 h-32 rounded-xl flex-shrink-0' : 'h-48'} overflow-hidden`}>
                        <img
                          src={imovel.images[0]}
                          alt={imovel.titulo}
                          className="w-full h-full object-cover"
                        />
                        <span
                          className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            imovel.status === 'ATIVO'
                              ? 'bg-emerald-500 text-white'
                              : imovel.status === 'VENDIDO'
                              ? 'bg-blue-500 text-white'
                              : imovel.status === 'ALUGADO'
                              ? 'bg-amber-500 text-white'
                              : imovel.status === 'COMPRADO'
                              ? 'bg-indigo-500 text-white'
                              : imovel.status === 'OCUPADO'
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-500 text-white'
                          }`}
                        >
                          {imovel.status}
                        </span>
                      </div>
                    )}
                    
                    <div className={`flex-1 ${view === 'grid' ? 'p-4' : ''}`}>
                      <h3 className="text-base font-bold text-slate-800 mb-2 line-clamp-2">
                        {imovel.titulo}
                      </h3>
                      
                      <div className="flex-1 space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                            imovel.tipo === 'VENDA' 
                              ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {imovel.tipo === 'VENDA' ? 'Venda' : 'Aluguel'}
                          </span>
                        </div>
                        <p className="text-xl font-bold text-slate-900">
                          R$ {Number(imovel.valor).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-slate-500 text-sm">
                          {imovel.cidade}, {imovel.estado}
                        </p>
                        
                        {/* Property Features */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                          {imovel.quartos && (
                            <span className="flex items-center gap-1">
                              <Bed className="w-3.5 h-3.5" />
                              {imovel.quartos}
                            </span>
                          )}
                          {imovel.banheiros && (
                            <span className="flex items-center gap-1">
                              <Bath className="w-3.5 h-3.5" />
                              {imovel.banheiros}
                            </span>
                          )}
                          {imovel.garagem && (
                            <span className="flex items-center gap-1">
                              <Car className="w-3.5 h-3.5" />
                              {imovel.garagem}
                            </span>
                          )}
                          {imovel.views !== undefined && (
                            <span className="flex items-center gap-1 ml-auto">
                              <Eye className="w-3.5 h-3.5" />
                              {imovel.views}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Share Buttons */}
                      <div className="mt-4 mb-3 pt-3 border-t border-slate-100">
                        <ShareButtons
                          imovelId={imovel.id}
                          titulo={imovel.titulo}
                          valor={imovel.valor}
                          cidade={imovel.cidade}
                          estado={imovel.estado}
                          onQRCodeClick={() => handleQRCodeClick(imovel)}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Link href={`/corretor/imoveis/${imovel.id}/editar`} className="flex-1">
                          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                            <Edit2 className="w-4 h-4" />
                            Editar
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(imovel.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Deletar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* QR Code Modal */}
      {selectedImovel && (
        <QRCodeModal
          imovelId={selectedImovel.id}
          titulo={selectedImovel.titulo}
          isOpen={qrModalOpen}
          onClose={() => {
            setQrModalOpen(false)
            setSelectedImovel(null)
          }}
        />
      )}
    </div>
  )
}
