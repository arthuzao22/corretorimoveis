'use client'

import { memo, useCallback } from 'react'
import { LeadCardMemo } from './LeadCard'
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

interface KanbanColumnProps {
  column: ColumnData
  onDragStart: (lead: LeadData, columnId: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (columnId: string) => void
  onCardClick?: (lead: LeadData) => void
  isDragging: boolean
  isMoving: boolean
}

export function KanbanColumn({
  column,
  onDragStart,
  onDragOver,
  onDrop,
  onCardClick,
  isDragging,
  isMoving
}: KanbanColumnProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    onDragOver(e)
  }, [onDragOver])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    onDrop(column.id)
  }, [onDrop, column.id])

  const bgColor = column.color || '#6B7280'

  // Calculate total property value in this column
  const totalValue = column.leads.reduce((sum, lead) => {
    return sum + (lead.imovel?.valor ? Number(lead.imovel.valor) : 0)
  }, 0)

  return (
    <div
      className="flex-shrink-0 w-80 bg-gray-50 rounded-lg flex flex-col max-h-[calc(100vh-250px)]"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div
        className="px-4 py-3 rounded-t-lg"
        style={{ backgroundColor: bgColor + '20', borderLeft: `4px solid ${bgColor}` }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{column.name}</h3>
            <span
              className="px-2 py-1 text-xs font-medium rounded-full"
              style={{ backgroundColor: bgColor + '30', color: bgColor }}
            >
              {column.leadCount}
            </span>
          </div>
          {column.isFinal && (
            <span className="text-xs text-gray-500 font-medium">Final</span>
          )}
        </div>
        {/* Total Value */}
        {totalValue > 0 && (
          <div className="text-xs text-gray-600 font-medium">
            Total: {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(totalValue)}
          </div>
        )}
      </div>

      {/* Leads Container */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        {column.leads.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Nenhum lead nesta coluna
          </div>
        ) : (
          column.leads.map(lead => (
            <LeadCardMemo
              key={lead.id}
              lead={lead}
              onDragStart={() => onDragStart(lead, column.id)}
              onClick={() => onCardClick?.(lead)}
              isDisabled={isMoving}
            />
          ))
        )}
      </div>
    </div>
  )
}
