'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Calendario } from './components/Calendario'
import { EventoModal } from './components/EventoModal'
import { useEventos, type Evento } from '@/hooks/useEventos'

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
    // Open modal with pre-filled date
    setSelectedEvento(null)
    setIsModalOpen(true)
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

  const handleSaveEvento = async (data: {
    leadId: string
    imovelId: string
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
        showFeedback('error', error || 'Erro ao atualizar evento')
      }
    } else {
      // Create new event
      const created = await createEvento(data)
      if (created) {
        setEventos((prev) => [...prev, created])
        setIsModalOpen(false)
        showFeedback('success', 'Evento criado com sucesso')
      } else {
        showFeedback('error', error || 'Erro ao criar evento')
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CalendarIcon size={32} />
              Calendário de Eventos
            </h1>
            <p className="text-gray-600 mt-2">
              Gerencie seus agendamentos com leads e imóveis
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedEvento(null)
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Feedback Messages */}
      {feedbackMessage && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            feedbackMessage.type === 'success'
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
          <p className="text-gray-600 mb-6">
            Comece criando seu primeiro evento de calendário
          </p>
          <Button
            onClick={() => {
              setSelectedEvento(null)
              setIsModalOpen(true)
            }}
            className="inline-flex items-center gap-2"
          >
            <Plus size={20} />
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

      {/* Event Modal */}
      <EventoModal
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detalhes do Evento</h2>
                <button
                  onClick={handleCloseViewing}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Data e Hora</label>
                  <p className="text-lg text-gray-900">
                    {new Date(viewingEvento.dataHora).toLocaleString('pt-BR', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Lead</label>
                  <p className="text-lg text-gray-900">{viewingEvento.lead.name}</p>
                  {viewingEvento.lead.phone && (
                    <p className="text-sm text-gray-600">{viewingEvento.lead.phone}</p>
                  )}
                  {viewingEvento.lead.email && (
                    <p className="text-sm text-gray-600">{viewingEvento.lead.email}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Imóvel</label>
                  <p className="text-lg text-gray-900">{viewingEvento.imovel?.titulo ?? 'Sem título'}</p>
                  <p className="text-sm text-gray-600">
                    {viewingEvento.imovel?.endereco ?? ''}{viewingEvento.imovel?.cidade ? `, ${viewingEvento.imovel.cidade}` : ''}{viewingEvento.imovel?.estado ? ` - ${viewingEvento.imovel.estado}` : ''}
                  </p>
                  {viewingEvento.imovel?.valor != null && (
                    <p className="text-sm font-medium text-green-600 mt-1">
                      R$ {Number(viewingEvento.imovel.valor).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>

                {viewingEvento.observacao && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Observação</label>
                    <p className="text-gray-900">{viewingEvento.observacao}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-6 border-t">
                <Button variant="danger" onClick={handleDeleteClick} className="flex items-center gap-2">
                  <Trash2 size={16} />
                  Excluir
                </Button>
                <Button onClick={handleEditClick}>Editar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
