'use client'

import { useState, useEffect } from 'react'
import { ImovelCard } from '@/components/ui/ImovelCard'
import { Building2, Loader2 } from 'lucide-react'

interface ImoveisListProps {
  initialImoveis: any[]
  initialPagination: {
    nextCursor: string | null
    hasNextPage: boolean
    limit: number
  }
  filters: any
}

export function ImoveisList({ initialImoveis, initialPagination, filters }: ImoveisListProps) {
  const [imoveis, setImoveis] = useState(initialImoveis)
  const [pagination, setPagination] = useState(initialPagination)
  const [loading, setLoading] = useState(false)

  // Reset state when filters change
  useEffect(() => {
    setImoveis(initialImoveis)
    setPagination(initialPagination)
  }, [initialImoveis, initialPagination])

  const loadMore = async () => {
    if (!pagination.hasNextPage || loading) return

    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.set(key, String(value))
        }
      })
      
      // Add cursor
      if (pagination.nextCursor) {
        params.set('cursor', pagination.nextCursor)
      }
      
      params.set('limit', '12')

      const response = await fetch(`/api/imoveis?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setImoveis((prev) => [...prev, ...data.imoveis])
        setPagination(data.pagination)
      } else {
        console.error('Error loading more imoveis:', data.error)
        alert('Erro ao carregar mais imóveis. Tente novamente.')
      }
    } catch (error) {
      console.error('Error loading more imoveis:', error)
      alert('Erro ao carregar mais imóveis. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (imoveis.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
          <Building2 className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg">
          Nenhum imóvel encontrado com os filtros selecionados.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Tente ajustar os filtros de busca.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {imoveis.map((imovel: any) => (
          <ImovelCard key={imovel.id} imovel={imovel} />
        ))}
      </div>

      {/* Load More Button */}
      {pagination.hasNextPage && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Carregando...
              </>
            ) : (
              'Carregar Mais'
            )}
          </button>
        </div>
      )}

      {/* End of results */}
      {!pagination.hasNextPage && imoveis.length > 0 && (
        <div className="mt-12 text-center">
          <p className="text-gray-500">
            Você visualizou todos os {imoveis.length} imóveis disponíveis
          </p>
        </div>
      )}
    </div>
  )
}
