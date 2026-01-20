'use client'

import React, { useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCalendario, type CalendarView } from '@/hooks/useCalendario'
import type { Evento } from '@/hooks/useEventos'

interface CalendarioProps {
  eventos: Evento[]
  onDateClick: (date: Date) => void
  onEventClick: (evento: Evento) => void
  loading?: boolean
}

const EVENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  VISITA: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  ACOMPANHAMENTO: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  REUNIAO: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  URGENTE: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
}

export function Calendario({
  eventos,
  onDateClick,
  onEventClick,
  loading = false,
}: CalendarioProps) {
  const {
    currentDate,
    view,
    viewRange,
    displayText,
    goToToday,
    goToNext,
    goToPrevious,
    changeView,
  } = useCalendario()

  // Group events by date
  const eventosPorData = useMemo(() => {
    const map = new Map<string, Evento[]>()
    eventos.forEach((evento) => {
      const date = new Date(evento.dataHora)
      const dateKey = date.toISOString().split('T')[0]
      const existing = map.get(dateKey) || []
      map.set(dateKey, [...existing, evento])
    })
    return map
  }, [eventos])

  // Generate calendar days for month view
  const calendarDays = useMemo(() => {
    if (view !== 'month') return []

    const days: Date[] = []
    const start = new Date(viewRange.start)
    const end = new Date(viewRange.end)

    let current = new Date(start)
    while (current <= end) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }, [view, viewRange])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const getEventColors = (tipo: string) => {
    return EVENT_COLORS[tipo] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' }
  }

  const renderMonthView = () => {
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Week day headers */}
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
          {weekDays.map((day, idx) => (
            <div
              key={day}
              className={`py-3 text-center text-xs font-semibold uppercase tracking-wider ${idx === 0 ? 'text-red-500' : 'text-slate-500'
                }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dateKey = day.toISOString().split('T')[0]
            const dayEventos = eventosPorData.get(dateKey) || []
            const today = isToday(day)
            const currentMonth = isCurrentMonth(day)
            const isWeekend = day.getDay() === 0 || day.getDay() === 6

            return (
              <div
                key={idx}
                className={`min-h-[110px] p-2 border-b border-r border-slate-100 cursor-pointer transition-all hover:bg-slate-50 ${!currentMonth ? 'bg-slate-50/50' : 'bg-white'
                  } ${isWeekend && currentMonth ? 'bg-slate-50/30' : ''}`}
                onClick={() => onDateClick(day)}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div
                    className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-all ${today
                        ? 'bg-indigo-600 text-white shadow-md'
                        : currentMonth
                          ? isWeekend
                            ? 'text-red-500'
                            : 'text-slate-700'
                          : 'text-slate-300'
                      }`}
                  >
                    {day.getDate()}
                  </div>
                  {dayEventos.length > 0 && (
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                      {dayEventos.length}
                    </span>
                  )}
                </div>

                {/* Events for this day */}
                <div className="space-y-1">
                  {dayEventos.slice(0, 2).map((evento) => {
                    const colors = getEventColors(evento.tipo)
                    return (
                      <div
                        key={evento.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick(evento)
                        }}
                        className={`text-[11px] ${colors.bg} ${colors.text} px-2 py-1 rounded-md truncate hover:shadow-sm cursor-pointer transition-all border ${colors.border}`}
                      >
                        <span className="font-medium">{formatTime(evento.dataHora)}</span>
                        <span className="mx-1">·</span>
                        <span>{evento.lead.name}</span>
                      </div>
                    )
                  })}
                  {dayEventos.length > 2 && (
                    <div className="text-[10px] text-indigo-600 font-medium px-2 hover:underline cursor-pointer">
                      +{dayEventos.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    const days: Date[] = []
    const start = new Date(viewRange.start)

    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dateKey = day.toISOString().split('T')[0]
            const dayEventos = eventosPorData.get(dateKey) || []
            const today = isToday(day)

            return (
              <div
                key={idx}
                className="min-h-[450px] p-3 border-r border-slate-100 last:border-r-0 cursor-pointer hover:bg-slate-50/50 transition-colors"
                onClick={() => onDateClick(day)}
              >
                <div className="text-center mb-4">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">
                    {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </div>
                  <div
                    className={`text-xl font-bold mt-1 ${today
                        ? 'bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto shadow-md'
                        : 'text-slate-800'
                      }`}
                  >
                    {day.getDate()}
                  </div>
                </div>

                <div className="space-y-2">
                  {dayEventos.map((evento) => {
                    const colors = getEventColors(evento.tipo)
                    return (
                      <div
                        key={evento.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick(evento)
                        }}
                        className={`text-sm ${colors.bg} ${colors.text} p-3 rounded-xl hover:shadow-md cursor-pointer transition-all border ${colors.border}`}
                      >
                        <div className="font-semibold truncate">{evento.lead.name}</div>
                        <div className="text-xs flex items-center gap-1.5 mt-1.5 opacity-80">
                          <Clock size={12} />
                          {formatTime(evento.dataHora)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const dateKey = currentDate.toISOString().split('T')[0]
    const dayEventos = (eventosPorData.get(dateKey) || []).sort(
      (a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime()
    )

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-slate-800">
            {currentDate.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </h3>
        </div>

        {dayEventos.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <CalendarIcon size={56} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Nenhum evento marcado para este dia</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {dayEventos.map((evento) => {
              const colors = getEventColors(evento.tipo)
              return (
                <div
                  key={evento.id}
                  onClick={() => onEventClick(evento)}
                  className={`border-2 ${colors.border} rounded-xl p-5 hover:shadow-lg cursor-pointer transition-all group`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                          <User className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">
                            {evento.lead.name}
                          </div>
                          <div className="text-sm text-slate-500 flex items-center gap-2">
                            <Building2 size={14} />
                            {evento.imovel.titulo}
                          </div>
                        </div>
                      </div>
                      {evento.observacao && (
                        <p className="text-sm text-slate-600 mt-3 pl-[52px]">{evento.observacao}</p>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 ${colors.text} font-semibold text-lg`}>
                      <Clock size={18} />
                      {formatTime(evento.dataHora)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800">{displayText}</h2>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Hoje
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Navigation */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={goToPrevious}
              className="p-2 hover:bg-white rounded-md transition-colors text-slate-600"
              disabled={loading}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goToNext}
              className="p-2 hover:bg-white rounded-md transition-colors text-slate-600"
              disabled={loading}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* View selector */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            {[
              { value: 'month', label: 'Mês' },
              { value: 'week', label: 'Semana' },
              { value: 'day', label: 'Dia' },
            ].map((v) => (
              <button
                key={v.value}
                onClick={() => changeView(v.value as CalendarView)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${view === v.value
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                  }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-500">Carregando eventos...</p>
        </div>
      ) : (
        <>
          {view === 'month' && renderMonthView()}
          {view === 'week' && renderWeekView()}
          {view === 'day' && renderDayView()}
        </>
      )}
    </div>
  )
}

