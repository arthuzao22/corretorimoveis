'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Building2, Clock, Calendar, AlertCircle } from 'lucide-react'
import { TagBadge } from '@/components/ui/TagBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'

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
    dataHora: Date | string
    completed: boolean
  }>
}

interface LeadCardProps {
  lead: LeadData
  onDragStart: () => void
  onClick?: () => void
  isDisabled: boolean
}

export function LeadCard({ lead, onDragStart, onClick, isDisabled }: LeadCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  
  const daysSinceCreated = Math.floor(
    (new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  const isAging = daysSinceCreated > 7

  // Check for upcoming events
  const now = new Date()
  const upcomingEvents = lead.eventos?.filter(e => !e.completed && new Date(e.dataHora) > now) || []
  const hasUpcomingEvents = upcomingEvents.length > 0

  // Check for overdue events
  const overdueEvents = lead.eventos?.filter(e => !e.completed && new Date(e.dataHora) <= now) || []
  const hasOverdueEvents = overdueEvents.length > 0

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger click if we're not dragging
    if (!isDragging) {
      onClick?.()
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation()
    setIsDragging(true)
    onDragStart()
  }

  const handleDragEnd = () => {
    // Reset drag state after a short delay
    setTimeout(() => setIsDragging(false), 100)
  }

  return (
    <div
      draggable={!isDisabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${isAging ? 'border-l-4 border-l-orange-400' : ''} ${
        hasOverdueEvents ? 'border-l-4 border-l-red-500' : ''
      }`}
    >
      <div className="space-y-2">
        {/* Lead Name */}
        <h4 className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
          {lead.name}
        </h4>

        {/* Property */}
        {lead.imovel && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Building2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{lead.imovel.titulo}</span>
          </div>
        )}

        {/* Tags */}
        {lead.tags && lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {lead.tags.slice(0, 2).map((lt) => (
              <TagBadge
                key={lt.id}
                name={lt.tag.name}
                color={lt.tag.color}
                size="sm"
              />
            ))}
            {lead.tags.length > 2 && (
              <span className="text-xs text-gray-500 px-2 py-0.5">
                +{lead.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Priority Badge and Indicators */}
        <div className="flex items-center gap-2 flex-wrap">
          <PriorityBadge priority={lead.priority} />

          {/* Event Indicators */}
          {hasOverdueEvents && (
            <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              <AlertCircle className="w-3 h-3" />
              <span>Atrasado</span>
            </div>
          )}

          {hasUpcomingEvents && !hasOverdueEvents && (
            <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              <Calendar className="w-3 h-3" />
              <span>{upcomingEvents.length}</span>
            </div>
          )}

          {/* Aging Indicator */}
          {isAging && !hasOverdueEvents && (
            <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
              <Clock className="w-3 h-3" />
              <span>{daysSinceCreated}d</span>
            </div>
          )}
        </div>

        {/* Time since created */}
        <div className="text-xs text-gray-500">
          Criado{' '}
          {formatDistanceToNow(new Date(lead.createdAt), {
            addSuffix: true,
            locale: ptBR,
          })}
        </div>
      </div>
    </div>
  )
}
