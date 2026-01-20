'use client'

import { useState, useCallback } from 'react'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCardModal } from './KanbanCardModal'
import { moveLeadToColumn } from '@/server/actions/kanban'
import { useRouter } from 'next/navigation'
import { LeadPriority, LeadStatus } from '@prisma/client'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { Settings2, Search, Filter, X } from 'lucide-react'

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
    valor: number
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
  const [isMoving, setIsMoving] = useState(false)
  const [selectedLead, setSelectedLead] = useState<LeadData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<LeadPriority | 'ALL'>('ALL')
  const [corretorFilter, setCorretorFilter] = useState<string>('ALL')
  const [isFiltersVisible, setIsFiltersVisible] = useState(true)

  const onDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result

    // Dropped outside or no change
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    const sourceColumn = board.columns.find(col => col.id === source.droppableId)
    const destColumn = board.columns.find(col => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    // Optimistically update UI
    const sourceLeads = Array.from(sourceColumn.leads)
    const [movedLead] = sourceLeads.splice(source.index, 1)

    // Add to destination
    const destLeads = Array.from(destColumn.leads)
    destLeads.splice(destination.index, 0, movedLead)

    // Update board state
    const newColumns = board.columns.map(col => {
      if (col.id === source.droppableId) {
        return { ...col, leads: sourceLeads, leadCount: sourceLeads.length }
      }
      if (col.id === destination.droppableId) {
        return { ...col, leads: destLeads, leadCount: destLeads.length }
      }
      return col
    })

    setBoard(prev => ({ ...prev, columns: newColumns }))

    // If columns are different, call server action
    if (source.droppableId !== destination.droppableId) {
      setIsMoving(true)
      const result = await moveLeadToColumn({
        leadId: draggableId,
        columnId: destination.droppableId
      })

      if (result.success) {
        router.refresh()
      } else {
        // Revert on failure (could be implemented better but keeping simple for now)
        console.error("Failed to move lead")
        router.refresh()
      }
      setIsMoving(false)
    }
  }, [board, router])

  const handleCardClick = useCallback((lead: LeadData) => {
    setSelectedLead(lead)
    setIsModalOpen(true)
  }, [])

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedLead(null), 200)
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
    <div className="flex flex-col h-[calc(100vh-140px)] bg-gray-50/50 rounded-xl overflow-hidden shadow-inner border border-gray-200/60">
      {/* Header & Filters */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{initialBoard.name}</h2>
            <p className="text-sm text-gray-500">Gerencie leads e oportunidades</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFiltersVisible(!isFiltersVisible)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${isFiltersVisible ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Settings2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        {isFiltersVisible && (
          <div className="flex flex-col md:flex-row gap-3 animate-in slide-in-from-top-2 duration-200">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as LeadPriority | 'ALL')}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:bg-white transition-colors"
            >
              <option value="ALL">Todas as prioridades</option>
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Média</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
            </select>

            {/* Corretor Filter */}
            {uniqueCorretores.length > 1 && (
              <select
                value={corretorFilter}
                onChange={(e) => setCorretorFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:bg-white transition-colors"
              >
                <option value="ALL">Todos os corretores</option>
                {uniqueCorretores.map(corretor => (
                  <option key={corretor.id} value={corretor.id}>
                    {corretor.user.name}
                  </option>
                ))}
              </select>
            )}

            {/* Clear Filters Button */}
            {(searchQuery || priorityFilter !== 'ALL' || corretorFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setPriorityFilter('ALL')
                  setCorretorFilter('ALL')
                }}
                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Limpar
              </button>
            )}
          </div>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="h-full flex px-4 pt-4 pb-2 gap-4 min-w-max">
            {filteredBoard.columns.map(column => (
              <KanbanColumn
                key={column.id}
                column={column}
                onCardClick={handleCardClick}
                isDragging={false}
                isMoving={isMoving}
              />
            ))}
          </div>
        </div>
      </DragDropContext>

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
    </div>
  )
}
