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
  } | null
  imovel: {
    titulo: string
  } | null
}

interface UpcomingEventsWidgetProps {
  events: UpcomingEvent[]
}

const eventTypeColors = {
  VISITA: 'bg-blue-100 text-blue-700',
  ACOMPANHAMENTO: 'bg-amber-100 text-amber-700',
  REUNIAO: 'bg-emerald-100 text-emerald-700',
  URGENTE: 'bg-red-100 text-red-700',
  GERAL: 'bg-slate-100 text-slate-700'
}

const eventTypeLabels = {
  VISITA: 'Visita',
  ACOMPANHAMENTO: 'Follow-up',
  REUNIAO: 'Reunião',
  URGENTE: 'Urgente',
  GERAL: 'Geral'
}

export function UpcomingEventsWidget({ events }: UpcomingEventsWidgetProps) {
  if (events.length === 0) {
    return (
      <Card>
        <h2 className="text-lg font-semibold mb-4 text-slate-800">Proximos Eventos</h2>
        <p className="text-slate-500 text-center py-8">Nenhum evento agendado.</p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-slate-800">Proximos Eventos</h2>
        <Link href="/corretor/calendario" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
          Ver calendario
        </Link>
      </div>
      <div className="space-y-3">
        {events.map((event) => {
          const eventDate = new Date(event.dataHora)
          const tipo = event.tipo as keyof typeof eventTypeColors

          return (
            <div
              key={event.id}
              className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${eventTypeColors[tipo] || 'bg-slate-100 text-slate-700'}`}>
                  {eventTypeLabels[tipo] || event.tipo}
                </span>
                <div className="text-sm text-slate-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {format(eventDate, 'HH:mm', { locale: ptBR })}
                </div>
              </div>

              <div className="mb-2">
                <p className="font-medium text-slate-800">
                  {event.lead?.name || 'Evento geral'}
                </p>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  {format(eventDate, "dd 'de' MMMM", { locale: ptBR })}
                </p>
              </div>

              {event.imovel && (
                <p className="text-sm text-slate-600 flex items-start gap-1">
                  <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="truncate">{event.imovel.titulo}</span>
                </p>
              )}

              {event.observacao && (
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{event.observacao}</p>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
