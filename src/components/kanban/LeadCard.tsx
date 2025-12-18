'use client'

import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Building2, Clock } from 'lucide-react'
import Link from 'next/link'

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

interface LeadCardProps {
  lead: LeadData
  onDragStart: () => void
  isDisabled: boolean
}

const priorityColors: Record<string, string> = {
  BAIXA: 'bg-gray-100 text-gray-700 border-gray-300',
  MEDIA: 'bg-blue-50 text-blue-700 border-blue-300',
  ALTA: 'bg-orange-50 text-orange-700 border-orange-300',
  URGENTE: 'bg-red-50 text-red-700 border-red-300',
}

const priorityLabels: Record<string, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
}

export function LeadCard({ lead, onDragStart, isDisabled }: LeadCardProps) {
  const daysSinceCreated = Math.floor(
    (new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  const isAging = daysSinceCreated > 7
  
  // Safe priority access with fallback
  const priorityColor = priorityColors[lead.priority] || priorityColors.MEDIA
  const priorityLabel = priorityLabels[lead.priority] || 'Média'

  return (
    <div
      draggable={!isDisabled}
      onDragStart={onDragStart}
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-move ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${isAging ? 'border-l-4 border-l-orange-400' : ''}`}
    >
      <div className="space-y-2">
        {/* Lead Name */}
        <Link href={`/corretor/leads?selected=${lead.id}`} className="block">
          <h4 className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
            {lead.name}
          </h4>
        </Link>

        {/* Property */}
        {lead.imovel && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Building2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{lead.imovel.titulo}</span>
          </div>
        )}

        {/* Priority Badge */}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded border ${priorityColor}`}>
            {priorityLabel}
          </span>

          {/* Aging Indicator */}
          {isAging && (
            <div className="flex items-center gap-1 text-xs text-orange-600">
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
