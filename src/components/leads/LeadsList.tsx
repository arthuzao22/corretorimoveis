'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LeadTable } from '@/components/ui/LeadTable'
import { LeadDrawer } from './LeadDrawer'
import { BulkActionsBar } from './BulkActionsBar'
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
  const router = useRouter()
  const [leads, setLeads] = useState(initialLeads)
  const [pagination, setPagination] = useState(initialPagination)
  const [loading, setLoading] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])

  // Reset state when filters change
  useEffect(() => {
    setLeads(initialLeads)
    setPagination(initialPagination)
    setSelectedLeads([]) // Clear selection on filter change
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
      } else {
        console.error('Error loading more leads:', data.error)
        alert('Erro ao carregar mais leads. Tente novamente.')
      }
    } catch (error) {
      console.error('Error loading more leads:', error)
      alert('Erro ao carregar mais leads. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleLeadClick = (lead: any) => {
    setSelectedLead(lead)
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    setSelectedLead(null)
  }

  const handleLeadUpdate = () => {
    router.refresh()
  }

  const handleBulkActionComplete = () => {
    setSelectedLeads([])
    handleLeadUpdate()
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

  const hasBulkBar = selectedLeads.length > 0

  return (
    <div className="space-y-6">
      {/* Bulk Actions Bar — fixed at bottom, rendered portal-style */}
      {hasBulkBar && (
        <BulkActionsBar
          selectedCount={selectedLeads.length}
          selectedLeadIds={selectedLeads}
          onClear={() => setSelectedLeads([])}
          onComplete={handleBulkActionComplete}
        />
      )}

      <div className={`bg-white rounded-xl md:rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all ${hasBulkBar ? 'pb-28 md:pb-24' : ''}`}>
        <LeadTable 
          leads={leads} 
          onLeadClick={handleLeadClick}
          selectedLeads={selectedLeads}
          onSelectionChange={setSelectedLeads}
        />
      </div>

      {/* Load More Button */}
      {pagination.hasNextPage && (
        <div className="flex justify-center px-4 md:px-0">
          <button
            onClick={loadMore}
            disabled={loading}
            className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-sm"
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

      {/* Lead Drawer */}
      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          isOpen={isDrawerOpen}
          onClose={handleDrawerClose}
          onUpdate={handleLeadUpdate}
        />
      )}
    </div>
  )
}
