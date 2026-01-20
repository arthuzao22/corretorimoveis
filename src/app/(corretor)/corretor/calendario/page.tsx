'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Calendar as CalendarIcon, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Calendario } from './components/Calendario'
import { EventoModalEnhanced } from './components/EventoModalEnhanced'
import { useEventos, type Evento } from '@/hooks/useEventos'
import { addTimelineEntry } from '@/server/actions/timeline'

interface Lead {
  id: string
  name: string
}

interface Imovel {
  id: string
  titulo: string
}

export default function CalendarioPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null)
  const [viewingEvento, setViewingEvento] = useState<Evento | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const { loading, error, fetchEventos, createEvento, updateEvento, deleteEvento } = useEventos()

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setInitialLoading(true)
    try {
      // Fetch eventos
      const eventosData = await fetchEventos()
      if (eventosData) {
        setEventos(eventosData.eventos)
      }

      // Fetch leads
      const leadsResponse = await fetch('/api/leads')
      if (leadsResponse.ok) {
        const leadsData = await leadsResponse.json()
        if (leadsData.success && leadsData.leads) {
          setLeads(
            leadsData.leads.map((lead: any) => ({
              id: lead.id,
              name: lead.name,
            }))
          )
        }
      }

      // Fetch imoveis
      const imoveisResponse = await fetch('/api/imoveis')
      if (imoveisResponse.ok) {
        const imoveisData = await imoveisResponse.json()
        if (imoveisData.success && imoveisData.imoveis) {
          setImoveis(
            imoveisData.imoveis.map((imovel: any) => ({
              id: imovel.id,
              titulo: imovel.titulo,
            }))
          )
        }
      }
    } catch (err) {
      console.error('Error loading data:', err)
      showFeedback('error', 'Erro ao carregar dados')
    } finally {
      setInitialLoading(false)
    }
  }

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedbackMessage({ type, message })
    setTimeout(() => setFeedbackMessage(null), 5000)
  }

  const handleDateClick = (date: Date) => {
    // Calendar is now read-only - events can only be created from kanban cards
    // This function is kept for future reference but does nothing
    return
  }

  const handleEventClick = (evento: Evento) => {
    setViewingEvento(evento)
  }

  const handleEditClick = () => {
    if (viewingEvento) {
      setSelectedEvento(viewingEvento)
      setViewingEvento(null)
      setIsModalOpen(true)
    }
  }

  const handleDeleteClick = async () => {
    if (!viewingEvento) return

    if (confirm('Tem certeza que deseja excluir este evento?')) {
      const success = await deleteEvento(viewingEvento.id)
      if (success) {
        setEventos((prev) => prev.filter((e) => e.id !== viewingEvento.id))
        setViewingEvento(null)
        showFeedback('success', 'Evento excluído com sucesso')
      } else {
        showFeedback('error', error || 'Erro ao excluir evento')
      }
    }
  }

  const handleCompleteEvent = async () => {
    if (!viewingEvento) return

    const updated = await updateEvento(viewingEvento.id, { completed: true })
    if (updated) {
      setEventos((prev) =>
        prev.map((e) => (e.id === viewingEvento.id ? updated : e))
      )
      setViewingEvento(null)

      // Add timeline entry
      await addTimelineEntry(
        viewingEvento.lead.id,
        'EVENT_COMPLETED',
        `Evento concluído: ${viewingEvento.tipo}`
      )

      showFeedback('success', 'Evento marcado como concluído')
    } else {
      showFeedback('error', 'Erro ao marcar evento como concluído')
    }
  }

  const handleSaveEvento = async (data: {
    leadId: string
    imovelId: string
    tipo: any
    dataHora: string
    observacao?: string
  }) => {
    if (selectedEvento) {
      // Update existing event
      const updated = await updateEvento(selectedEvento.id, data)
      if (updated) {
        setEventos((prev) =>
          prev.map((e) => (e.id === selectedEvento.id ? updated : e))
        )
        setIsModalOpen(false)
        setSelectedEvento(null)
        showFeedback('success', 'Evento atualizado com sucesso')
      } else {
        showFeedback('error', 'Erro ao atualizar evento')
      }
    } else {
      // Create new event
      const created = await createEvento(data)
      if (created) {
        setEventos((prev) => [...prev, created])
        setIsModalOpen(false)

        // Add timeline entry
        await addTimelineEntry(
          data.leadId,
          'EVENT_SCHEDULED',
          `Evento agendado: ${data.tipo} para ${new Date(data.dataHora).toLocaleDateString('pt-BR')}`
        )

        showFeedback('success', 'Evento criado com sucesso')
      } else {
        showFeedback('error', 'Erro ao criar evento')
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEvento(null)
  }

  const handleCloseViewing = () => {
    setViewingEvento(null)
  }

  const getEventTypeColor = (tipo: string) => {
    const colors: Record<string, string> = {
      VISITA: 'bg-blue-500',
      ACOMPANHAMENTO: 'bg-yellow-500',
      REUNIAO: 'bg-green-500',
      URGENTE: 'bg-red-500',
    }
    return colors[tipo] || 'bg-gray-500'
  }

  const getEventTypeLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      VISITA: 'Visita',
      ACOMPANHAMENTO: 'Follow-up',
      REUNIAO: 'Reunião',
      URGENTE: 'Urgente',
    }
    return labels[tipo] || tipo
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CalendarIcon size={32} className="text-purple-600" />
              Calendário de Eventos
            </h1>
            <p className="text-gray-600 mt-2">
              Visualize seus agendamentos com leads e imóveis
            </p>
            <p className="text-sm text-indigo-600 mt-1 bg-indigo-50 inline-block px-3 py-1 rounded-full">
              ℹ️ Para criar eventos, abra um card do Kanban
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {feedbackMessage && (
        <div
          className={`mb-6 p-4 rounded-lg ${feedbackMessage.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
            }`}
        >
          {feedbackMessage.message}
        </div>
      )}

      {/* Empty State */}
      {!initialLoading && eventos.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center mb-8">
          <CalendarIcon size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum evento marcado ainda
          </h3>
          <p className="text-gray-600 mb-4">
            Crie eventos diretamente nos cards do Kanban
          </p>
          <Link href="/corretor/kanban">
            <Button className="inline-flex items-center gap-2">
              Ir para Kanban
            </Button>
          </Link>
        </div>
      )}

      {/* Calendar */}
      <Calendario
        eventos={eventos}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
        loading={initialLoading}
      />

      {/* Event Modal */}
      <EventoModalEnhanced
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvento}
        evento={selectedEvento}
        leads={leads}
        imoveis={imoveis}
        loading={loading}
      />

      {/* Event Details Modal */}
      {viewingEvento && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && handleCloseViewing()}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden">
            {/* Header with Event Type */}
            <div className={`p-6 ${viewingEvento.tipo === 'URGENTE' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
                viewingEvento.tipo === 'VISITA' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                  viewingEvento.tipo === 'REUNIAO' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                    'bg-gradient-to-r from-amber-500 to-orange-500'
              } text-white`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm mb-3">
                    {getEventTypeLabel(viewingEvento.tipo)}
                  </span>
                  <h2 className="text-2xl font-bold">Detalhes do Evento</h2>
                  <p className="text-white/80 mt-1">
                    {new Date(viewingEvento.dataHora).toLocaleString('pt-BR', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <button
                  onClick={handleCloseViewing}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Lead Info */}
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <CalendarIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Lead</p>
                  <p className="text-lg font-bold text-slate-800">{viewingEvento.lead.name}</p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {viewingEvento.lead.phone && (
                      <a href={`tel:${viewingEvento.lead.phone}`} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                        📞 {viewingEvento.lead.phone}
                      </a>
                    )}
                    {viewingEvento.lead.email && (
                      <a href={`mailto:${viewingEvento.lead.email}`} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                        ✉️ {viewingEvento.lead.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Property Info */}
              <div className="p-4 border border-slate-200 rounded-xl">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Imóvel</p>
                <p className="text-lg font-semibold text-slate-800">{viewingEvento.imovel?.titulo ?? 'Sem título'}</p>
                {(viewingEvento.imovel?.endereco || viewingEvento.imovel?.cidade) && (
                  <p className="text-sm text-slate-500 mt-1">
                    {viewingEvento.imovel?.endereco ?? ''}{viewingEvento.imovel?.cidade ? `, ${viewingEvento.imovel.cidade}` : ''}{viewingEvento.imovel?.estado ? ` - ${viewingEvento.imovel.estado}` : ''}
                  </p>
                )}
                {viewingEvento.imovel?.valor != null && (
                  <p className="text-lg font-bold text-emerald-600 mt-2">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(viewingEvento.imovel.valor))}
                  </p>
                )}
              </div>

              {/* Observation */}
              {viewingEvento.observacao && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-xs font-medium text-amber-700 uppercase tracking-wider mb-2">Observação</p>
                  <p className="text-slate-700">{viewingEvento.observacao}</p>
                </div>
              )}

              {/* Completed Badge */}
              {viewingEvento.completed && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  <span className="text-emerald-800 font-semibold">Evento concluído</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <Button
                variant="danger"
                onClick={handleDeleteClick}
                className="flex items-center gap-2"
              >
                <Trash2 size={16} />
                Excluir
              </Button>
              {!viewingEvento.completed && (
                <Button
                  onClick={handleCompleteEvent}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle size={16} />
                  Marcar Concluído
                </Button>
              )}
              <Button
                onClick={handleEditClick}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Editar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
