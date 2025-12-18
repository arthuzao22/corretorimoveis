'use client'

import { useState } from 'react'
import { X, Save, Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EventoTipo } from '@prisma/client'

interface QuickEventFormProps {
  leadId: string
  leadName: string
  onSave: (data: {
    leadId: string
    imovelId: string
    tipo: EventoTipo
    dataHora: string
    observacao?: string
  }) => Promise<void>
  onCancel: () => void
  imoveis: Array<{ id: string; titulo: string }>
}

const EVENT_TYPES: Array<{
  value: EventoTipo
  label: string
  color: string
}> = [
  { value: 'VISITA', label: 'Visita', color: 'bg-blue-500' },
  { value: 'ACOMPANHAMENTO', label: 'Follow-up', color: 'bg-yellow-500' },
  { value: 'REUNIAO', label: 'Reunião', color: 'bg-green-500' },
  { value: 'URGENTE', label: 'Urgente', color: 'bg-red-500' },
]

export function QuickEventForm({ leadId, leadName, onSave, onCancel, imoveis }: QuickEventFormProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    imovelId: '',
    tipo: 'VISITA' as EventoTipo,
    dataHora: '',
    observacao: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.imovelId || !formData.dataHora) {
      setError('Preencha todos os campos obrigatórios')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await onSave({
        leadId,
        imovelId: formData.imovelId,
        tipo: formData.tipo,
        dataHora: formData.dataHora,
        observacao: formData.observacao,
      })
      
      // Reset form
      setFormData({
        imovelId: '',
        tipo: 'VISITA',
        dataHora: '',
        observacao: '',
      })
    } catch (err) {
      console.error('Error saving event:', err)
      setError('Erro ao criar evento')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-600" />
          Criar Novo Evento
        </h4>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Event Type */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Tipo de Evento *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {EVENT_TYPES.map((eventType) => (
              <button
                key={eventType.value}
                type="button"
                onClick={() => setFormData({ ...formData, tipo: eventType.value })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.tipo === eventType.value
                    ? `${eventType.color} text-white shadow-md`
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                }`}
              >
                {eventType.label}
              </button>
            ))}
          </div>
        </div>

        {/* Property */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Imóvel *
          </label>
          <select
            value={formData.imovelId}
            onChange={(e) => setFormData({ ...formData, imovelId: e.target.value })}
            required
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Selecione um imóvel</option>
            {imoveis.map((imovel) => (
              <option key={imovel.id} value={imovel.id}>
                {imovel.titulo}
              </option>
            ))}
          </select>
        </div>

        {/* Date/Time */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Data e Hora *
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              value={formData.dataHora}
              onChange={(e) => setFormData({ ...formData, dataHora: e.target.value })}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Clock className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Observações
          </label>
          <textarea
            value={formData.observacao}
            onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
            rows={2}
            placeholder="Detalhes do evento..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={saving}
            className="flex items-center gap-1.5"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Criar Evento
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
