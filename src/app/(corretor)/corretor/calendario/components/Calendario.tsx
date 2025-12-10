'use client'

import React, { useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCalendario, type CalendarView } from '@/hooks/useCalendario'
import type { Evento } from '@/hooks/useEventos'

interface CalendarioProps {
  eventos: Evento[]
  onDateClick: (date: Date) => void
  onEventClick: (evento: Evento) => void
  loading?: boolean
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

  const renderMonthView = () => {
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    return (
      <div className="bg-white rounded-lg shadow">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 border-b">
          {weekDays.map((day) => (
            <div
              key={day}
              className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-700"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {calendarDays.map((day, idx) => {
            const dateKey = day.toISOString().split('T')[0]
            const dayEventos = eventosPorData.get(dateKey) || []
            const today = isToday(day)
            const currentMonth = isCurrentMonth(day)

            return (
              <div
                key={idx}
                className={`bg-white min-h-[100px] p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !currentMonth ? 'opacity-40' : ''
                }`}
                onClick={() => onDateClick(day)}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    today
                      ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center'
                      : currentMonth
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}
                >
                  {day.getDate()}
                </div>

                {/* Events for this day */}
                <div className="space-y-1">
                  {dayEventos.slice(0, 3).map((evento) => (
                    <div
                      key={evento.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(evento)
                      }}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded truncate hover:bg-blue-200 cursor-pointer"
                    >
                      {formatTime(evento.dataHora)} - {evento.lead.name}
                    </div>
                  ))}
                  {dayEventos.length > 3 && (
                    <div className="text-xs text-gray-500 px-2">
                      +{dayEventos.length - 3} mais
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
      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map((day, idx) => {
            const dateKey = day.toISOString().split('T')[0]
            const dayEventos = eventosPorData.get(dateKey) || []
            const today = isToday(day)

            return (
              <div
                key={idx}
                className="bg-white min-h-[400px] p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => onDateClick(day)}
              >
                <div className="text-center mb-3">
                  <div className="text-xs text-gray-500 uppercase">
                    {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </div>
                  <div
                    className={`text-lg font-semibold ${
                      today
                        ? 'bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto'
                        : 'text-gray-900'
                    }`}
                  >
                    {day.getDate()}
                  </div>
                </div>

                <div className="space-y-2">
                  {dayEventos.map((evento) => (
                    <div
                      key={evento.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(evento)
                      }}
                      className="text-sm bg-blue-100 text-blue-800 p-2 rounded hover:bg-blue-200 cursor-pointer"
                    >
                      <div className="font-medium truncate">{evento.lead.name}</div>
                      <div className="text-xs flex items-center gap-1 mt-1">
                        <Clock size={12} />
                        {formatTime(evento.dataHora)}
                      </div>
                    </div>
                  ))}
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {currentDate.toLocaleDateString('pt-BR', { 
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </h3>
        </div>

        {dayEventos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CalendarIcon size={48} className="mx-auto mb-3 opacity-30" />
            <p>Nenhum evento marcado para este dia</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayEventos.map((evento) => (
              <div
                key={evento.id}
                onClick={() => onEventClick(evento)}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-lg">
                      {evento.lead.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {evento.imovel.titulo}
                    </div>
                    {evento.observacao && (
                      <div className="text-sm text-gray-500 mt-2">
                        {evento.observacao}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 font-medium">
                    <Clock size={16} />
                    {formatTime(evento.dataHora)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">{displayText}</h2>
          <Button variant="outline" onClick={goToToday} className="text-sm">
            Hoje
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevious}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNext}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* View selector */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => changeView('month')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                view === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => changeView('week')}
              className={`px-3 py-2 text-sm font-medium border-x border-gray-300 transition-colors ${
                view === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => changeView('day')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                view === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Dia
            </button>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando eventos...</p>
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
