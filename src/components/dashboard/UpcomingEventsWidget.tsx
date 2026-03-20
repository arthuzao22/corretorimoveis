'use client'

import { useState, useEffect } from 'react'
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
  VISITA: 'bg-sky-500/20 text-sky-400',
  ACOMPANHAMENTO: 'bg-amber-500/20 text-amber-400',
  REUNIAO: 'bg-emerald-500/20 text-emerald-400',
  URGENTE: 'bg-rose-500/20 text-rose-400',
  GERAL: 'bg-muted text-muted-foreground'
}

const eventTypeLabels = {
  VISITA: 'Visita',
  ACOMPANHAMENTO: 'Follow-up',
  REUNIAO: 'Reunião',
  URGENTE: 'Urgente',
  GERAL: 'Geral'
}

export function UpcomingEventsWidget({ events }: UpcomingEventsWidgetProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (events.length === 0) {
    return (
      <Card>
        <h2 className="text-lg font-semibold mb-4 text-foreground">Proximos Eventos</h2>
        <p className="text-muted-foreground text-center py-8">Nenhum evento agendado.</p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-foreground">Proximos Eventos</h2>
        <Link href="/corretor/calendario" className="text-primary hover:text-primary/80 text-sm font-medium">
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
              className="p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${eventTypeColors[tipo] || 'bg-muted text-muted-foreground'}`}>
                  {eventTypeLabels[tipo] || event.tipo}
                </span>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span suppressHydrationWarning>
                    {mounted ? format(eventDate, 'HH:mm', { locale: ptBR }) : '--:--'}
                  </span>
                </div>
              </div>

              <div className="mb-2">
                <p className="font-medium text-foreground">
                  {event.lead?.name || 'Evento geral'}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  <span suppressHydrationWarning>
                    {mounted ? format(eventDate, "dd 'de' MMMM", { locale: ptBR }) : '-- de ---'}
                  </span>
                </p>
              </div>

              {event.imovel && (
                <p className="text-sm text-muted-foreground flex items-start gap-1">
                  <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="truncate">{event.imovel.titulo}</span>
                </p>
              )}

              {event.observacao && (
                <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2">{event.observacao}</p>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
