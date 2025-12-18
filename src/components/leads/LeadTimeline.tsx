'use client'

import { TimelineAction } from '@prisma/client'
import {
  CheckCircle,
  MessageSquare,
  Calendar,
  CalendarCheck,
  Mail,
  Phone,
  Edit,
  Clock,
  Columns,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TimelineEntry {
  id: string
  action: TimelineAction
  description: string
  metadata?: any
  createdAt: Date | string
}

interface LeadTimelineProps {
  timeline: TimelineEntry[]
}

const actionConfig: Record<
  TimelineAction,
  { icon: React.ComponentType<any>; color: string; label: string }
> = {
  CREATED: {
    icon: CheckCircle,
    color: 'text-blue-600 bg-blue-50',
    label: 'Criado',
  },
  STATUS_CHANGED: {
    icon: Edit,
    color: 'text-purple-600 bg-purple-50',
    label: 'Status Alterado',
  },
  NOTE_ADDED: {
    icon: MessageSquare,
    color: 'text-gray-600 bg-gray-50',
    label: 'Nota Adicionada',
  },
  EVENT_SCHEDULED: {
    icon: Calendar,
    color: 'text-indigo-600 bg-indigo-50',
    label: 'Evento Agendado',
  },
  EVENT_COMPLETED: {
    icon: CalendarCheck,
    color: 'text-green-600 bg-green-50',
    label: 'Evento Concluído',
  },
  CONTACT_MADE: {
    icon: Phone,
    color: 'text-orange-600 bg-orange-50',
    label: 'Contato Realizado',
  },
  EMAIL_SENT: {
    icon: Mail,
    color: 'text-cyan-600 bg-cyan-50',
    label: 'Email Enviado',
  },
  WHATSAPP_SENT: {
    icon: MessageSquare,
    color: 'text-green-600 bg-green-50',
    label: 'WhatsApp Enviado',
  },
  KANBAN_MOVED: {
    icon: Columns,
    color: 'text-purple-600 bg-purple-50',
    label: 'Kanban Movido',
  },
}

export function LeadTimeline({ timeline }: LeadTimelineProps) {
  if (timeline.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">Nenhuma atividade registrada ainda</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {timeline.map((entry, index) => {
        const config = actionConfig[entry.action]
        const Icon = config.icon
        const createdDate =
          typeof entry.createdAt === 'string'
            ? new Date(entry.createdAt)
            : entry.createdAt

        return (
          <div key={entry.id} className="flex gap-3">
            {/* Icon */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.color}`}
            >
              <Icon className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-medium text-gray-900">{config.label}</p>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDistanceToNow(createdDate, {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{entry.description}</p>

                {/* Metadata */}
                {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-600 space-y-1">
                      {Object.entries(entry.metadata).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <span className="font-medium">{key}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Line */}
            {index < timeline.length - 1 && (
              <div className="absolute left-5 top-10 w-0.5 h-full bg-gray-200 -z-10" />
            )}
          </div>
        )
      })}
    </div>
  )
}
