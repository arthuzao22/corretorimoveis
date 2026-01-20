'use client'

import { Card } from '@/components/ui/Card'
import { Calendar, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface UpcomingEvent {
  id: string
  dataHora: Date
  tipo: string
  observacao: string | null
  lead: {
    name: string
  }
  imovel: {
    titulo: string
  }
}

interface UpcomingEventsWidgetProps {
  events: UpcomingEvent[]
}

const eventTypeColors = {
  VISITA: 'bg-blue-100 text-blue-700',
  ACOMPANHAMENTO: 'bg-green-100 text-green-700',
  REUNIAO: 'bg-purple-100 text-purple-700',
  URGENTE: 'bg-red-100 text-red-700'
}

const eventTypeLabels = {
  VISITA: 'Visita',
  ACOMPANHAMENTO: 'Acompanhamento',
  REUNIAO: 'Reunião',
  URGENTE: 'Urgente'
}

export function UpcomingEventsWidget({ events }: UpcomingEventsWidgetProps) {
  if (events.length === 0) {
    return (
      <Card>
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Próximos Eventos</h2>
        <p className="text-gray-500 text-center py-8">Nenhum evento agendado.</p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Próximos Eventos</h2>
        <Link href="/corretor/calendario" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          Ver calendário →
        </Link>
      </div>
      <div className="space-y-4">
        {events.map((event) => {
          const eventDate = new Date(event.dataHora)
          const tipo = event.tipo as keyof typeof eventTypeColors
          
          return (
            <div
              key={event.id}
              className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${eventTypeColors[tipo] || 'bg-gray-100 text-gray-700'}`}>
                  {eventTypeLabels[tipo] || event.tipo}
                </span>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {format(eventDate, 'HH:mm', { locale: ptBR })}
                </div>
              </div>
              
              <div className="mb-2">
                <p className="font-medium text-gray-900">{event.lead.name}</p>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  {format(eventDate, "dd 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
              
              <p className="text-sm text-gray-700 flex items-start gap-1">
                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="truncate">{event.imovel.titulo}</span>
              </p>
              
              {event.observacao && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{event.observacao}</p>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
