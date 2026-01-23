'use client'

import { memo, useCallback } from 'react'
import { LeadCardMemo } from './LeadCard'
import { LeadPriority, LeadStatus } from '@prisma/client'
import { Droppable } from '@hello-pangea/dnd'
import { MoreHorizontal, Plus } from 'lucide-react'

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

interface KanbanColumnProps {
  column: ColumnData
  onCardClick?: (lead: LeadData) => void
  isDragging: boolean
  isMoving: boolean
}

export function KanbanColumn({
  column,
  onCardClick,
  isDragging,
  isMoving
}: KanbanColumnProps) {

  const bgColor = column.color || '#6B7280'

  // Calculate total property value in this column
  const totalValue = column.leads.reduce((sum, lead) => {
    return sum + (lead.imovel?.valor ? Number(lead.imovel.valor) : 0)
  }, 0)

  return (
    <div className="flex-shrink-0 w-[280px] sm:w-80 md:w-[320px] lg:w-80 flex flex-col h-full max-h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between p-2 sm:p-3 mb-2 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-100/50 shadow-sm group hover:bg-white/80 transition-colors">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-sm ring-2 ring-white flex-shrink-0"
            style={{ backgroundColor: bgColor }}
          />
          <div className="flex flex-col min-w-0 flex-1">
            <h3 className="font-bold text-gray-800 text-xs sm:text-sm truncate">{column.name}</h3>
            <span className="text-[10px] text-gray-500 font-medium truncate">
              {column.leadCount} {column.leadCount === 1 ? 'lead' : 'leads'}
              {totalValue > 0 && (
                <span className="ml-1 text-gray-400 hidden sm:inline">
                  • {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    notation: 'compact',
                    compactDisplay: 'short'
                  }).format(totalValue)}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 hidden sm:block">
            <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Leads Container */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1 space-y-2 sm:space-y-3 overflow-y-auto px-1 pb-4
              transition-colors duration-200 rounded-xl
              ${snapshot.isDraggingOver ? 'bg-indigo-50/50 ring-2 ring-indigo-100/50' : ''}
            `}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#CBD5E1 transparent'
            }}
          >
            {column.leads.map((lead, index) => (
              <LeadCardMemo
                key={lead.id}
                lead={lead}
                index={index}
                onClick={() => onCardClick?.(lead)}
                isDisabled={isMoving}
              />
            ))}
            {provided.placeholder}

            {column.leads.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-20 sm:h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-xs font-medium bg-gray-50/50">
                Solte um cartão aqui
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
