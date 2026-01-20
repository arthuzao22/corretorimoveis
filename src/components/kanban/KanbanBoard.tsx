'use client'

import { useState, useCallback } from 'react'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCardModal } from './KanbanCardModal'
import { moveLeadToColumn } from '@/server/actions/kanban'
import { useRouter } from 'next/navigation'
import { LeadPriority, LeadStatus } from '@prisma/client'

interface LeadData {
  id: string
  name: string
  email?: string | null
  phone: string
  message?: string | null
  description?: string | null
  priority: LeadPriority
  status: LeadStatus
  anotacoes?: string | null
  createdAt: Date
  dataContato?: Date | null
  dataAgendamento?: Date | null
  kanbanColumnId?: string | null
  imovel?: {
    id: string
    titulo: string
    valor: any
  } | null
  corretor: {
    id: string
    user: {
      name: string
    }
  }
  kanbanColumn?: {
    id: string
    name: string
    color: string | null
  } | null
  tags?: Array<{
    id: string
    tag: {
      id: string
      name: string
      color: string
    }
  }>
  eventos?: Array<{
    id: string
    tipo: string
    dataHora: Date | string
    observacao?: string | null
    completed: boolean
    imovel: {
      titulo: string
    }
  }>
}

interface ColumnData {
  id: string
  name: string
  color: string | null
  order: number
  isFinal: boolean
  leads: LeadData[]
  leadCount: number
}

interface KanbanBoardProps {
  initialBoard: {
    id: string
    name: string
    columns: ColumnData[]
  }
}

export function KanbanBoard({ initialBoard }: KanbanBoardProps) {
  const [board, setBoard] = useState(initialBoard)
  const [draggedLead, setDraggedLead] = useState<LeadData | null>(null)
  const [draggedFromColumn, setDraggedFromColumn] = useState<string | null>(null)
  const [isMoving, setIsMoving] = useState(false)
  const [selectedLead, setSelectedLead] = useState<LeadData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<LeadPriority | 'ALL'>('ALL')
  const [corretorFilter, setCorretorFilter] = useState<string>('ALL')

  const handleDragStart = useCallback((lead: LeadData, columnId: string) => {
    setDraggedLead(lead)
    setDraggedFromColumn(columnId)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(async (targetColumnId: string) => {
    if (!draggedLead || !draggedFromColumn || targetColumnId === draggedFromColumn) {
      setDraggedLead(null)
      setDraggedFromColumn(null)
      return
    }

    setIsMoving(true)

    const result = await moveLeadToColumn({
      leadId: draggedLead.id,
      columnId: targetColumnId
    })

    if (result.success) {
      // Optimistically update UI
      setBoard(prev => {
        const newColumns = prev.columns.map(col => {
          if (col.id === draggedFromColumn) {
            return {
              ...col,
              leads: col.leads.filter(l => l.id !== draggedLead.id),
              leadCount: col.leadCount - 1
            }
          }
          if (col.id === targetColumnId) {
            return {
              ...col,
              leads: [draggedLead, ...col.leads],
              leadCount: col.leadCount + 1
            }
          }
          return col
        })

        return { ...prev, columns: newColumns }
      })

      router.refresh()
    }

    setDraggedLead(null)
    setDraggedFromColumn(null)
    setIsMoving(false)
  }, [draggedLead, draggedFromColumn, router])

  const handleCardClick = useCallback((lead: LeadData) => {
    setSelectedLead(lead)
    setIsModalOpen(true)
  }, [])

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedLead(null), 200) // Delay to allow animation
  }, [])

  const handleModalUpdate = useCallback(() => {
    router.refresh()
  }, [router])

  // Filter function
  const filterLeads = useCallback((leads: LeadData[]) => {
    return leads.filter(lead => {
      // Search filter (name, email, phone)
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          lead.name.toLowerCase().includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.phone.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Priority filter
      if (priorityFilter !== 'ALL' && lead.priority !== priorityFilter) {
        return false
      }

      // Corretor filter
      if (corretorFilter !== 'ALL' && lead.corretor.id !== corretorFilter) {
        return false
      }

      return true
    })
  }, [searchQuery, priorityFilter, corretorFilter])

  // Get unique corretores for filter
  const uniqueCorretores = Array.from(
    new Map(
      initialBoard.columns.flatMap(col => 
        col.leads.map(lead => [lead.corretor.id, lead.corretor])
      )
    ).values()
  )

  // Apply filters to columns
  const filteredBoard = {
    ...board,
    columns: board.columns.map(column => ({
      ...column,
      leads: filterLeads(column.leads),
      leadCount: filterLeads(column.leads).length
    }))
  }

  return (
    <>
      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Priority Filter */}
          <div className="w-full md:w-48">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as LeadPriority | 'ALL')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Todas as prioridades</option>
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Média</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>

          {/* Corretor Filter */}
          {uniqueCorretores.length > 1 && (
            <div className="w-full md:w-48">
              <select
                value={corretorFilter}
                onChange={(e) => setCorretorFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Todos os corretores</option>
                {uniqueCorretores.map(corretor => (
                  <option key={corretor.id} value={corretor.id}>
                    {corretor.user.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clear Filters Button */}
          {(searchQuery || priorityFilter !== 'ALL' || corretorFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setPriorityFilter('ALL')
                setCorretorFilter('ALL')
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 px-2">
        {filteredBoard.columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onCardClick={handleCardClick}
            isDragging={draggedFromColumn === column.id}
            isMoving={isMoving}
          />
        ))}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <KanbanCardModal
          lead={selectedLead}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onUpdate={handleModalUpdate}
          columns={board.columns.map(col => ({
            id: col.id,
            name: col.name,
            color: col.color
          }))}
        />
      )}
    </>
  )
}
