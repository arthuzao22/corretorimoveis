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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Imóveis</h1>
          <p className="text-gray-600 mt-1">Gerencie seus imóveis cadastrados</p>
        </div>
        <Link href="/corretor/imoveis/novo">
          <Button className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Novo Imóvel
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : imoveis.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">Você ainda não cadastrou nenhum imóvel.</p>
            <Link href="/corretor/imoveis/novo">
              <Button>Cadastrar Primeiro Imóvel</Button>
            </Link>
          </div>
        </Card>
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
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhum imóvel encontrado com os filtros selecionados.</p>
                <Button onClick={() => setFilters({})} variant="secondary" className="mt-4">
                  Limpar Filtros
                </Button>
              </div>
            </Card>
          ) : (
            <div className={view === 'grid' ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
              {filteredAndSortedImoveis.map((imovel) => (
                <Card key={imovel.id}>
                  <div className={view === 'list' ? 'flex gap-4' : 'flex flex-col h-full'}>
                    {/* Image Preview */}
                    {imovel.images && imovel.images.length > 0 && (
                      <div className={`relative ${view === 'list' ? 'w-48 h-32' : 'h-48 -m-6 mb-4'} overflow-hidden ${view === 'list' ? 'rounded-lg flex-shrink-0' : 'rounded-t-xl'}`}>
                        <img
                          src={imovel.images[0]}
                          alt={imovel.titulo}
                          className="w-full h-full object-cover"
                        />
                        <span
                          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
                            imovel.status === 'ATIVO'
                              ? 'bg-green-600 text-white'
                              : imovel.status === 'VENDIDO'
                              ? 'bg-blue-600 text-white'
                              : imovel.status === 'ALUGADO'
                              ? 'bg-yellow-600 text-white'
                              : imovel.status === 'COMPRADO'
                              ? 'bg-purple-600 text-white'
                              : imovel.status === 'OCUPADO'
                              ? 'bg-orange-600 text-white'
                              : 'bg-gray-600 text-white'
                          }`}
                        >
                          {imovel.status}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {imovel.titulo}
                      </h3>
                      
                      <div className="flex-1 space-y-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Tipo:</span>{' '}
                          {imovel.tipo === 'VENDA' ? 'Venda' : 'Aluguel'}
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          R$ {Number(imovel.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p>
                          <span className="font-medium">Localização:</span>{' '}
                          {imovel.cidade}, {imovel.estado}
                        </p>
                        
                        {/* Property Features */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 pt-2">
                          {imovel.quartos && (
                            <span className="flex items-center gap-1">
                              <Bed className="w-3 h-3" />
                              {imovel.quartos} quartos
                            </span>
                          )}
                          {imovel.banheiros && (
                            <span className="flex items-center gap-1">
                              <Bath className="w-3 h-3" />
                              {imovel.banheiros} banheiros
                            </span>
                          )}
                          {imovel.garagem && (
                            <span className="flex items-center gap-1">
                              <Car className="w-3 h-3" />
                              {imovel.garagem} vagas
                            </span>
                          )}
                        </div>
                        
                        {/* Views */}
                        {imovel.views !== undefined && (
                          <p className="flex items-center gap-1 text-xs text-gray-500">
                            <Eye className="w-3 h-3" />
                            {imovel.views} visualizações
                          </p>
                        )}
                      </div>
                      
                      {/* Share Buttons */}
                      <div className="mt-4 mb-4">
                        <ShareButtons
                          imovelId={imovel.id}
                          titulo={imovel.titulo}
                          valor={imovel.valor}
                          cidade={imovel.cidade}
                          estado={imovel.estado}
                          onQRCodeClick={() => handleQRCodeClick(imovel)}
                        />
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <Link href={`/corretor/imoveis/${imovel.id}/editar`} className="flex-1">
                          <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                            <Edit2 className="w-4 h-4" />
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(imovel.id)}
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Deletar
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
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
