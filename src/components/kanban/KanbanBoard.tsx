'use client'

import { useState } from 'react'
import { KanbanColumn } from './KanbanColumn'
import { moveLeadToColumn } from '@/server/actions/kanban'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()

  const handleDragStart = (lead: LeadData, columnId: string) => {
    setDraggedLead(lead)
    setDraggedFromColumn(columnId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (targetColumnId: string) => {
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
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 px-2">
      {board.columns.map(column => (
        <KanbanColumn
          key={column.id}
          column={column}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          isDragging={draggedFromColumn === column.id}
          isMoving={isMoving}
        />
      ))}
    </div>
  )
}
