'use client'

import { LeadCard } from './LeadCard'

interface LeadData {
  id: string
  name: string
  priority: string
  createdAt: Date
  imovel?: {
    id: string
    titulo: string
  } | null
  corretor: {
    id: string
    user: {
      name: string
    }
  }
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
  const handleDragOver = (e: React.DragEvent) => {
    onDragOver(e)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    onDrop(column.id)
  }

  const bgColor = column.color || '#6B7280'

  return (
    <div
      className="flex-shrink-0 w-80 bg-gray-50 rounded-lg flex flex-col max-h-[calc(100vh-250px)]"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div
        className="px-4 py-3 rounded-t-lg flex items-center justify-between"
        style={{ backgroundColor: bgColor + '20', borderLeft: `4px solid ${bgColor}` }}
      >
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

      {/* Leads Container */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        {column.leads.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Nenhum lead nesta coluna
          </div>
        ) : (
          column.leads.map(lead => (
            <LeadCard
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
