'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2, Calendar as CalendarIcon, Clock, Eye, MapPin, User, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type EventoTipo = 'VISITA' | 'ACOMPANHAMENTO' | 'REUNIAO' | 'URGENTE' | 'GERAL'

interface EventoModalEnhancedProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    leadId?: string
    imovelId?: string
    tipo: EventoTipo
    dataHora: string
    observacao?: string
  }) => void
  evento?: any | null
  leads: Array<{ id: string; name: string }>
  imoveis: Array<{ id: string; titulo: string }>
  loading?: boolean
  initialDate?: Date | null
}

const EVENT_TYPES: Array<{
  value: EventoTipo
  label: string
  icon: string
  color: string
  bgColor: string
  description: string
}> = [
    {
      value: 'VISITA',
      label: 'Visita',
      icon: '📋',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50 border-blue-200',
      description: 'Visita ao imóvel com o cliente',
    },
    {
      value: 'ACOMPANHAMENTO',
      label: 'Follow-up',
      icon: '🔄',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50 border-amber-200',
      description: 'Acompanhamento do lead',
    },
    {
      value: 'REUNIAO',
      label: 'Reunião',
      icon: '🤝',
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50 border-emerald-200',
      description: 'Reunião com cliente ou equipe',
    },
    {
      value: 'URGENTE',
      label: 'Urgente',
      icon: '🚨',
      color: 'text-red-700',
      bgColor: 'bg-red-50 border-red-200',
      description: 'Evento urgente que requer atenção imediata',
    },
    {
      value: 'GERAL',
      label: 'Geral',
      icon: '📌',
      color: 'text-slate-700',
      bgColor: 'bg-slate-50 border-slate-200',
      description: 'Evento geral ou lembrete pessoal',
    },
  ]

// Types that require lead and imovel
const TYPES_REQUIRING_LEAD = ['VISITA', 'ACOMPANHAMENTO', 'REUNIAO', 'URGENTE']

export function EventoModalEnhanced({
  isOpen,
  onClose,
  onSave,
  evento,
  leads,
  imoveis,
  loading = false,
  initialDate,
}: EventoModalEnhancedProps) {
  const [formData, setFormData] = useState({
    leadId: '',
    imovelId: '',
    tipo: 'GERAL' as EventoTipo,
    dataHora: '',
    observacao: '',
  })
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (evento) {
      // Edit mode — populate from existing event
      setFormData({
        leadId: evento.lead?.id || evento.leadId || '',
        imovelId: evento.imovel?.id || evento.imovelId || '',
        tipo: evento.tipo || 'VISITA',
        dataHora: evento.dataHora
          ? new Date(evento.dataHora).toISOString().slice(0, 16)
          : '',
        observacao: evento.observacao || '',
      })
    } else {
      // Create mode — use initialDate if provided
      const defaultDate = initialDate
        ? new Date(initialDate.getTime() - initialDate.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
        : ''

      setFormData({
        leadId: '',
        imovelId: '',
        tipo: 'GERAL',
        dataHora: defaultDate,
        observacao: '',
      })
    }
    setValidationError(null)
  }, [evento, isOpen, initialDate])

  const requiresLeadImovel = TYPES_REQUIRING_LEAD.includes(formData.tipo)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.dataHora) {
      setValidationError('Por favor, informe a data e hora do evento')
      return
    }

    if (requiresLeadImovel && (!formData.leadId || !formData.imovelId)) {
      setValidationError(`Lead e Imóvel são obrigatórios para eventos do tipo "${EVENT_TYPES.find(t => t.value === formData.tipo)?.label}"`)
      return
    }

    setValidationError(null)
    onSave({
      ...(formData.leadId ? { leadId: formData.leadId } : {}),
      ...(formData.imovelId ? { imovelId: formData.imovelId } : {}),
      tipo: formData.tipo,
      dataHora: formData.dataHora,
      observacao: formData.observacao || undefined,
    })
  }

  if (!isOpen) return null

  const selectedEventType = EVENT_TYPES.find((t) => t.value === formData.tipo)
  const selectedLead = leads.find((l) => l.id === formData.leadId)
  const selectedImovel = imoveis.find((i) => i.id === formData.imovelId)

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
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
                className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EVENT_TYPES.map((eventType) => (
                  <button
                    key={eventType.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, tipo: eventType.value })
                    }
                    className={`p-3 rounded-lg border-2 transition-all text-left ${formData.tipo === eventType.value
                        ? `${eventType.bgColor} border-current ${eventType.color} ring-1 ring-current/20`
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
                      }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-sm">
                      <span>{eventType.icon}</span>
                      {eventType.label}
                    </div>
                    <div className="text-[11px] opacity-70 mt-1 leading-tight">
                      {eventType.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Lead Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                Lead {requiresLeadImovel ? '*' : '(opcional)'}
              </label>
              <select
                value={formData.leadId}
                onChange={(e) =>
                  setFormData({ ...formData, leadId: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="">
                  {requiresLeadImovel ? 'Selecione um lead' : 'Nenhum lead (evento geral)'}
                </option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Property Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                Imóvel {requiresLeadImovel ? '*' : '(opcional)'}
              </label>
              <select
                value={formData.imovelId}
                onChange={(e) =>
                  setFormData({ ...formData, imovelId: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="">
                  {requiresLeadImovel ? 'Selecione um imóvel' : 'Nenhum imóvel (evento geral)'}
                </option>
                {imoveis.map((imovel) => (
                  <option key={imovel.id} value={imovel.id}>
                    {imovel.titulo}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                Data e Hora *
              </label>
              <input
                type="datetime-local"
                value={formData.dataHora}
                onChange={(e) =>
                  setFormData({ ...formData, dataHora: e.target.value })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                Observações
              </label>
              <textarea
                value={formData.observacao}
                onChange={(e) =>
                  setFormData({ ...formData, observacao: e.target.value })
                }
                rows={3}
                placeholder="Adicione detalhes sobre este evento..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white text-gray-900"
              />
            </div>

            {/* Summary Card */}
            {formData.dataHora && (
              <div
                className={`p-4 rounded-lg border-2 ${selectedEventType?.bgColor} ${selectedEventType?.color}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4" />
                  <span className="font-semibold text-sm">Resumo do Evento</span>
                </div>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Tipo:</strong> {selectedEventType?.icon} {selectedEventType?.label}
                  </p>
                  {selectedLead && (
                    <p>
                      <strong>Lead:</strong> {selectedLead.name}
                    </p>
                  )}
                  {selectedImovel && (
                    <p>
                      <strong>Imóvel:</strong> {selectedImovel.titulo}
                    </p>
                  )}
                  {!selectedLead && !selectedImovel && formData.tipo === 'GERAL' && (
                    <p className="text-xs opacity-70 italic">Evento geral sem lead/imóvel associado</p>
                  )}
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
