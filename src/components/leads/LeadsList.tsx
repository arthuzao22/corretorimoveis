'use client'

import { useState, useEffect } from 'react'
import { LeadTable } from '@/components/ui/LeadTable'
import { Users, Loader2 } from 'lucide-react'

interface LeadsListProps {
  initialLeads: any[]
  initialPagination: {
    nextCursor: string | null
    hasNextPage: boolean
    limit: number
  }
  filters: any
}

export function LeadsList({ initialLeads, initialPagination, filters }: LeadsListProps) {
  const [leads, setLeads] = useState(initialLeads)
  const [pagination, setPagination] = useState(initialPagination)
  const [loading, setLoading] = useState(false)

  // Reset state when filters change
  useEffect(() => {
    setLeads(initialLeads)
    setPagination(initialPagination)
  }, [initialLeads, initialPagination])

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
      
      params.set('limit', '20')

      const response = await fetch(`/api/leads?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setLeads((prev) => [...prev, ...data.leads])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error loading more leads:', error)
    } finally {
      setLoading(false)
    }
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
          <Users className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg">
          Nenhum lead encontrado com os filtros selecionados.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Tente ajustar os filtros de busca.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <LeadTable leads={leads} />
      </div>

      {/* Load More Button */}
      {pagination.hasNextPage && (
        <div className="flex justify-center">
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
      {!pagination.hasNextPage && leads.length > 0 && (
        <div className="text-center">
          <p className="text-gray-500">
            Você visualizou todos os {leads.length} leads
          </p>
        </div>
      )}
    </div>
  )
}
