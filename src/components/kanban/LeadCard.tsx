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
            group relative bg-white rounded-xl p-4 border border-slate-100 
            hover:border-slate-200 hover:shadow-md transition-all duration-200 cursor-pointer
            ${snapshot.isDragging ? 'shadow-xl rotate-1 scale-[1.02] z-50 border-indigo-200' : 'shadow-sm'}
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {/* Priority Stripe */}
          <div
            className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${lead.priority === 'URGENTE' ? 'bg-red-500' :
                lead.priority === 'ALTA' ? 'bg-amber-500' :
                  lead.priority === 'MEDIA' ? 'bg-yellow-400' :
                    'bg-slate-300'
              }`}
          />

          <div className="pl-3 space-y-3">
            {/* Header: Name & Time */}
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                {lead.name}
              </h4>
              <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0 bg-slate-50 px-1.5 py-0.5 rounded">
                {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: false, locale: ptBR }).replace('aproximadamente ', '')}
              </span>
            </div>

            {/* Property Info */}
            {lead.imovel && (
              <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <Building2 className="w-3.5 h-3.5 mt-0.5 text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-700 truncate">{lead.imovel.titulo}</p>
                  {lead.imovel.valor && (
                    <p className="text-emerald-600 font-bold mt-0.5">
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
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {/* Event Status Pills */}
              {hasOverdueEvents && (
                <div title="Atividades Atrasadas" className="flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100">
                  <AlertCircle className="w-3 h-3" />
                  <span>Atrasado</span>
                </div>
              )}

              {upcomingEvents.length > 0 && !hasOverdueEvents && (
                <div title="Proximas Atividades" className="flex items-center gap-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                  <Calendar className="w-3 h-3" />
                  <span>{upcomingEvents.length} evento{upcomingEvents.length > 1 ? 's' : ''}</span>
                </div>
              )}

              {isAging && !hasOverdueEvents && (
                <div title="Lead Sem Atividade Recente" className="flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                  <Clock className="w-3 h-3" />
                  <span>Inativo</span>
                </div>
              )}

              {/* Tags */}
              {lead.tags?.slice(0, 2).map((lt) => (
                <span
                  key={lt.id}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium border"
                  style={{
                    backgroundColor: lt.tag.color + '12',
                    color: lt.tag.color,
                    borderColor: lt.tag.color + '25'
                  }}
                >
                  {lt.tag.name}
                </span>
              ))}
              {(lead.tags?.length || 0) > 2 && (
                <span className="text-[10px] text-slate-400 font-medium">+{lead.tags!.length - 2}</span>
              )}
            </div>

            {/* Footer: Broker Avatar/Name */}
            <div className="flex items-center justify-between border-t border-slate-50 pt-2.5 mt-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-[10px]">
                  {lead.corretor.user.name.charAt(0)}
                </div>
                <span className="max-w-[100px] truncate font-medium">{lead.corretor.user.name.split(' ')[0]}</span>
              </div>

              {/* Quick Actions */}
              <button className="text-slate-300 hover:text-indigo-500 transition-colors p-1 rounded hover:bg-indigo-50">
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
  // Fast path: check primitive values and lengths first
  if (
    prevProps.lead.id !== nextProps.lead.id ||
    prevProps.lead.name !== nextProps.lead.name ||
    prevProps.lead.priority !== nextProps.lead.priority ||
    prevProps.isDisabled !== nextProps.isDisabled ||
    prevProps.index !== nextProps.index
  ) {
    return false
  }

  // Check tags by length and first tag id (lightweight comparison)
  const prevTagsLen = prevProps.lead.tags?.length ?? 0
  const nextTagsLen = nextProps.lead.tags?.length ?? 0
  if (prevTagsLen !== nextTagsLen) return false
  if (prevTagsLen > 0 && prevProps.lead.tags![0].id !== nextProps.lead.tags![0].id) return false

  // Check eventos by length and first event completed status
  const prevEventosLen = prevProps.lead.eventos?.length ?? 0
  const nextEventosLen = nextProps.lead.eventos?.length ?? 0
  if (prevEventosLen !== nextEventosLen) return false
  if (prevEventosLen > 0) {
    const prevFirst = prevProps.lead.eventos![0]
    const nextFirst = nextProps.lead.eventos![0]
    if (prevFirst.id !== nextFirst.id || prevFirst.completed !== nextFirst.completed) return false
  }

  return true
})

