'use client'

import { useState, memo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Building2, Clock, Calendar, AlertCircle, Phone, User as UserIcon } from 'lucide-react'
import { TagBadge } from '@/components/ui/TagBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { LeadPriority } from '@prisma/client'
import { Draggable } from '@hello-pangea/dnd'

interface LeadData {
  id: string
  name: string
  priority: LeadPriority
  createdAt: Date
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
    dataHora: Date | string
    completed: boolean
  }>
}

interface LeadCardProps {
  lead: LeadData
  index: number
  onClick?: () => void
  isDisabled: boolean
}

export function LeadCard({ lead, index, onClick, isDisabled }: LeadCardProps) {
  const daysSinceCreated = Math.floor(
    (new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  const isAging = daysSinceCreated > 7

  // Check for upcoming events
  const now = new Date()
  const upcomingEvents = lead.eventos?.filter(e => !e.completed && new Date(e.dataHora) > now) || []
  
  // Check for overdue events
  const overdueEvents = lead.eventos?.filter(e => !e.completed && new Date(e.dataHora) <= now) || []
  const hasOverdueEvents = overdueEvents.length > 0

  return (
    <Draggable draggableId={lead.id} index={index} isDragDisabled={isDisabled}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
          }}
          onClick={onClick}
          className={`
            group relative bg-white rounded-xl p-4 shadow-sm border border-gray-100 
            hover:shadow-md transition-all duration-200 cursor-pointer
            ${snapshot.isDragging ? 'shadow-lg rotate-2 scale-105 z-50' : ''}
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {/* Priority Stripe */}
          <div 
            className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${
              lead.priority === 'URGENTE' ? 'bg-red-500' :
              lead.priority === 'ALTA' ? 'bg-orange-500' :
              lead.priority === 'MEDIA' ? 'bg-yellow-500' :
              'bg-blue-400'
            }`} 
          />

          <div className="pl-3 space-y-3">
            {/* Header: Name & Time */}
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-gray-800 text-sm group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                {lead.name}
              </h4>
              <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: false, locale: ptBR }).replace('aproximadamente ', '')}
              </span>
            </div>

            {/* Property Info */}
            {lead.imovel && (
              <div className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                <Building2 className="w-3.5 h-3.5 mt-0.5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-700 truncate">{lead.imovel.titulo}</p>
                  {lead.imovel.valor && (
                    <p className="text-green-600 font-semibold mt-0.5">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(Number(lead.imovel.valor))}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tags & Badges Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Event Status Pills */}
              {hasOverdueEvents && (
                <div title="Atividades Atrasadas" className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                  <AlertCircle className="w-3 h-3" />
                  <span>Atenção</span>
                </div>
              )}
              
              {upcomingEvents.length > 0 && !hasOverdueEvents && (
                <div title="Próximas Atividades" className="flex items-center gap-1 text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                  <Calendar className="w-3 h-3" />
                  <span>{upcomingEvents.length}</span>
                </div>
              )}

               {isAging && !hasOverdueEvents && (
                <div title="Lead Sem Atividade Recente" className="flex items-center gap-1 text-[10px] font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-100">
                  <Clock className="w-3 h-3" />
                  <span>+7 dias</span>
                </div>
              )}

              {/* Tags */}
              {lead.tags?.slice(0, 2).map((lt) => (
                <span 
                  key={lt.id}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium border"
                  style={{ 
                    backgroundColor: lt.tag.color + '15', 
                    color: lt.tag.color,
                    borderColor: lt.tag.color + '30'
                  }}
                >
                  {lt.tag.name}
                </span>
              ))}
              {(lead.tags?.length || 0) > 2 && (
                <span className="text-[10px] text-gray-400">+{lead.tags!.length - 2}</span>
              )}
            </div>

            {/* Footer: Broker Avatar/Name */}
            <div className="flex items-center justify-between border-t border-gray-50 pt-2 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <UserIcon className="w-3 h-3" />
                </div>
                <span className="max-w-[100px] truncate">{lead.corretor.user.name.split(' ')[0]}</span>
              </div>
              
              {/* Quick Actions (Visible on Hover could go here, but kept simple for now) */}
              <button className="text-gray-300 hover:text-blue-500 transition-colors">
                <Phone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}

// Memoize component to prevent unnecessary re-renders
export const LeadCardMemo = memo(LeadCard, (prevProps, nextProps) => {
  return (
    prevProps.lead.id === nextProps.lead.id &&
    prevProps.lead.name === nextProps.lead.name &&
    prevProps.lead.priority === nextProps.lead.priority &&
    prevProps.isDisabled === nextProps.isDisabled &&
    prevProps.index === nextProps.index &&
    JSON.stringify(prevProps.lead.tags) === JSON.stringify(nextProps.lead.tags) &&
    JSON.stringify(prevProps.lead.eventos) === JSON.stringify(nextProps.lead.eventos)
  )
})
