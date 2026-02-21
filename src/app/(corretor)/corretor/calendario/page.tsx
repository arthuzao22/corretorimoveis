'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Calendario } from './components/Calendario'
import { EventoModalEnhanced } from './components/EventoModalEnhanced'
import { EventoDetalhesModal } from './components/EventoDetalhesModal'
import { useEventos, type Evento, type EventoTipo } from '@/hooks/useEventos'
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
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

  // --- Event handlers ---

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setSelectedEvento(null) // null = create mode
    setIsModalOpen(true)
  }

  const handleEventClick = (evento: Evento) => {
    setViewingEvento(evento)
  }

  const handleEditClick = () => {
    if (viewingEvento) {
      setSelectedEvento(viewingEvento)
      setSelectedDate(null)
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

      // Add timeline entry only if event has a lead
      if (viewingEvento.lead?.id) {
        await addTimelineEntry(
          viewingEvento.lead.id,
          'EVENT_COMPLETED',
          `Evento concluído: ${viewingEvento.tipo}`
        )
      }

      showFeedback('success', 'Evento marcado como concluído')
    } else {
      showFeedback('error', 'Erro ao marcar evento como concluído')
    }
  }

  const handleSaveEvento = async (data: {
    leadId?: string
    imovelId?: string
    tipo: EventoTipo
    dataHora: string
    observacao?: string
  }) => {
    if (selectedEvento && selectedEvento.id) {
      // UPDATE — editing an existing event
      const updated = await updateEvento(selectedEvento.id, data)
      if (updated) {
        setEventos((prev) =>
          prev.map((e) => (e.id === selectedEvento.id ? updated : e))
        )
        setIsModalOpen(false)
        setSelectedEvento(null)
        setSelectedDate(null)
        showFeedback('success', 'Evento atualizado com sucesso')
      } else {
        showFeedback('error', 'Erro ao atualizar evento')
      }
    } else {
      // CREATE — new event
      const created = await createEvento(data as any)
      if (created) {
        setEventos((prev) => [...prev, created])
        setIsModalOpen(false)
        setSelectedDate(null)

        // Add timeline entry only if has a lead
        if (data.leadId) {
          await addTimelineEntry(
            data.leadId,
            'EVENT_SCHEDULED',
            `Evento agendado: ${data.tipo} para ${new Date(data.dataHora).toLocaleDateString('pt-BR')}`
          )
        }

        showFeedback('success', 'Evento criado com sucesso')
      } else {
        showFeedback('error', 'Erro ao criar evento')
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEvento(null)
    setSelectedDate(null)
  }

  const handleCloseViewing = () => {
    setViewingEvento(null)
  }

  const handleNewEvent = () => {
    setSelectedDate(new Date())
    setSelectedEvento(null)
    setIsModalOpen(true)
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
              Gerencie seus agendamentos com leads e imóveis
            </p>
          </div>
          <Button
            onClick={handleNewEvent}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Novo Evento
          </Button>
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
            Clique em &quot;Novo Evento&quot; ou em uma data no calendário para criar seu primeiro evento
          </p>
          <Button onClick={handleNewEvent} className="inline-flex items-center gap-2">
            <Plus size={18} />
            Criar Primeiro Evento
          </Button>
        </div>
      )}

      {/* Calendar */}
      <Calendario
        eventos={eventos}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
        loading={initialLoading}
      />

      {/* Event Create/Edit Modal */}
      <EventoModalEnhanced
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvento}
        evento={selectedEvento}
        leads={leads}
        imoveis={imoveis}
        loading={loading}
        initialDate={selectedDate}
      />

      {/* Event Details Modal */}
      {viewingEvento && (
        <EventoDetalhesModal
          evento={viewingEvento}
          onClose={handleCloseViewing}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onComplete={handleCompleteEvent}
          loading={loading}
        />
      )}
    </div>
  )
}
