'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EventoTipo } from '@prisma/client'

interface EventoModalEnhancedProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    leadId: string
    imovelId: string
    tipo: EventoTipo
    dataHora: string
    observacao?: string
  }) => void
  evento?: any | null
  leads: Array<{ id: string; name: string }>
  imoveis: Array<{ id: string; titulo: string }>
  loading?: boolean
}

const EVENT_TYPES: Array<{
  value: EventoTipo
  label: string
  color: string
  bgColor: string
  description: string
}> = [
  {
    value: 'VISITA',
    label: 'Visita',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    description: 'Visita ao imóvel com o cliente',
  },
  {
    value: 'ACOMPANHAMENTO',
    label: 'Follow-up',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50 border-yellow-200',
    description: 'Acompanhamento do lead',
  },
  {
    value: 'REUNIAO',
    label: 'Reunião',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    description: 'Reunião com cliente ou equipe',
  },
  {
    value: 'URGENTE',
    label: 'Urgente',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    description: 'Evento urgente que requer atenção imediata',
  },
]

export function EventoModalEnhanced({
  isOpen,
  onClose,
  onSave,
  evento,
  leads,
  imoveis,
  loading = false,
}: EventoModalEnhancedProps) {
  const [formData, setFormData] = useState({
    leadId: '',
    imovelId: '',
    tipo: 'VISITA' as EventoTipo,
    dataHora: '',
    observacao: '',
  })
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (evento) {
      setFormData({
        leadId: evento.leadId || '',
        imovelId: evento.imovelId || '',
        tipo: evento.tipo || 'VISITA',
        dataHora: evento.dataHora
          ? new Date(evento.dataHora).toISOString().slice(0, 16)
          : '',
        observacao: evento.observacao || '',
      })
    } else {
      // Reset form for new event
      setFormData({
        leadId: '',
        imovelId: '',
        tipo: 'VISITA',
        dataHora: '',
        observacao: '',
      })
    }
    setValidationError(null)
  }, [evento, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.leadId || !formData.imovelId || !formData.dataHora) {
      setValidationError('Por favor, preencha todos os campos obrigatórios')
      return
    }

    setValidationError(null)
    onSave({
      leadId: formData.leadId,
      imovelId: formData.imovelId,
      tipo: formData.tipo,
      dataHora: formData.dataHora,
      observacao: formData.observacao,
    })
  }

  if (!isOpen) return null

  const selectedEventType = EVENT_TYPES.find((t) => t.value === formData.tipo)

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6" />
                  {evento ? 'Editar Evento' : 'Novo Evento'}
                </h2>
                <p className="text-indigo-100 mt-1">
                  Agende visitas, reuniões e acompanhamentos
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-indigo-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Validation Error */}
            {validationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
                <span className="text-sm">{validationError}</span>
              </div>
            )}

            {/* Event Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tipo de Evento *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {EVENT_TYPES.map((eventType) => (
                  <button
                    key={eventType.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, tipo: eventType.value })
                    }
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.tipo === eventType.value
                        ? `${eventType.bgColor} border-current ${eventType.color}`
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold mb-1">{eventType.label}</div>
                    <div className="text-xs opacity-75">
                      {eventType.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Lead Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lead *
              </label>
              <select
                value={formData.leadId}
                onChange={(e) =>
                  setFormData({ ...formData, leadId: e.target.value })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="">Selecione um lead</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Property Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Imóvel *
              </label>
              <select
                value={formData.imovelId}
                onChange={(e) =>
                  setFormData({ ...formData, imovelId: e.target.value })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="">Selecione um imóvel</option>
                {imoveis.map((imovel) => (
                  <option key={imovel.id} value={imovel.id}>
                    {imovel.titulo}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Data e Hora *
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={formData.dataHora}
                  onChange={(e) =>
                    setFormData({ ...formData, dataHora: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                />
                <Clock className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={formData.observacao}
                onChange={(e) =>
                  setFormData({ ...formData, observacao: e.target.value })
                }
                rows={4}
                placeholder="Adicione detalhes sobre este evento..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white text-gray-900"
              />
            </div>

            {/* Summary Card */}
            {formData.leadId && formData.imovelId && formData.dataHora && (
              <div
                className={`p-4 rounded-lg border-2 ${selectedEventType?.bgColor} ${selectedEventType?.color}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span className="font-semibold">Resumo do Evento</span>
                </div>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Tipo:</strong> {selectedEventType?.label}
                  </p>
                  <p>
                    <strong>Lead:</strong>{' '}
                    {leads.find((l) => l.id === formData.leadId)?.name}
                  </p>
                  <p>
                    <strong>Imóvel:</strong>{' '}
                    {imoveis.find((i) => i.id === formData.imovelId)?.titulo}
                  </p>
                  <p>
                    <strong>Data/Hora:</strong>{' '}
                    {new Date(formData.dataHora).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {evento ? 'Atualizar' : 'Criar'} Evento
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
