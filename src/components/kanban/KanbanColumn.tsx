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
    imovel?: {
      titulo: string
    } | null
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
      <div className="flex items-center justify-between p-3 sm:p-3.5 mb-3 rounded-xl bg-white border border-slate-100 shadow-sm group hover:border-slate-200 hover:shadow-md transition-all">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div
            className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
            style={{ backgroundColor: bgColor }}
          />
          <div className="flex flex-col min-w-0 flex-1">
            <h3 className="font-bold text-slate-800 text-sm truncate">{column.name}</h3>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <span>{column.leadCount} {column.leadCount === 1 ? 'lead' : 'leads'}</span>
              {totalValue > 0 && (
                <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded hidden sm:inline">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    notation: 'compact',
                    compactDisplay: 'short'
                  }).format(totalValue)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors hidden sm:block">
            <MoreHorizontal className="w-4 h-4" />
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
              flex-1 space-y-2.5 overflow-y-auto px-1 pb-4
              transition-all duration-200 rounded-xl
              ${snapshot.isDraggingOver ? 'bg-indigo-50/60 ring-2 ring-indigo-200/60' : ''}
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
              <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs font-medium bg-slate-50/50 gap-1">
                <Plus className="w-4 h-4 text-slate-300" />
                <span>Solte um lead aqui</span>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
