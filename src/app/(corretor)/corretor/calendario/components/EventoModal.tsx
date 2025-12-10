'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Evento } from '@/hooks/useEventos'

interface Lead {
  id: string
  name: string
}

interface Imovel {
  id: string
  titulo: string
}

interface EventoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    leadId: string
    imovelId: string
    dataHora: string
    observacao?: string
  }) => void
  evento?: Evento | null
  leads: Lead[]
  imoveis: Imovel[]
  loading?: boolean
}

export function EventoModal({
  isOpen,
  onClose,
  onSave,
  evento,
  leads,
  imoveis,
  loading = false,
}: EventoModalProps) {
  const [formData, setFormData] = useState({
    leadId: '',
    imovelId: '',
    dataHora: '',
    observacao: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (evento) {
      // Editing mode
      setFormData({
        leadId: evento.lead.id,
        imovelId: evento.imovel.id,
        dataHora: new Date(evento.dataHora).toISOString().slice(0, 16),
        observacao: evento.observacao || '',
      })
    } else {
      // Create mode
      setFormData({
        leadId: '',
        imovelId: '',
        dataHora: '',
        observacao: '',
      })
    }
    setErrors({})
  }, [evento, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.leadId) newErrors.leadId = 'Selecione um lead'
    if (!formData.imovelId) newErrors.imovelId = 'Selecione um imóvel'
    if (!formData.dataHora) newErrors.dataHora = 'Selecione data e hora'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Convert to ISO string for API
    const dataHoraISO = new Date(formData.dataHora).toISOString()

    onSave({
      leadId: formData.leadId,
      imovelId: formData.imovelId,
      dataHora: dataHoraISO,
      observacao: formData.observacao || undefined,
    })
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {evento ? 'Editar Evento' : 'Novo Evento'}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Lead Select */}
          <div>
            <label htmlFor="leadId" className="block text-sm font-medium text-gray-700 mb-1">
              Lead *
            </label>
            <select
              id="leadId"
              value={formData.leadId}
              onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={loading}
            >
              <option value="" className="text-gray-500">Selecione um lead</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id} className="text-gray-900">
                  {lead.name}
                </option>
              ))}
            </select>
            {errors.leadId && (
              <span className="text-sm text-red-600 mt-1">{errors.leadId}</span>
            )}
          </div>

          {/* Imovel Select */}
          <div>
            <label htmlFor="imovelId" className="block text-sm font-medium text-gray-700 mb-1">
              Imóvel *
            </label>
            <select
              id="imovelId"
              value={formData.imovelId}
              onChange={(e) => setFormData({ ...formData, imovelId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={loading}
            >
              <option value="" className="text-gray-500">Selecione um imóvel</option>
              {imoveis.map((imovel) => (
                <option key={imovel.id} value={imovel.id} className="text-gray-900">
                  {imovel.titulo}
                </option>
              ))}
            </select>
            {errors.imovelId && (
              <span className="text-sm text-red-600 mt-1">{errors.imovelId}</span>
            )}
          </div>

          {/* Data e Hora */}
          <div>
            <label htmlFor="dataHora" className="block text-sm font-medium text-gray-700 mb-1">
              Data e Hora *
            </label>
            <input
              type="datetime-local"
              id="dataHora"
              value={formData.dataHora}
              onChange={(e) => setFormData({ ...formData, dataHora: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={loading}
            />
            {errors.dataHora && (
              <span className="text-sm text-red-600 mt-1">{errors.dataHora}</span>
            )}
          </div>

          {/* Observação */}
          <div>
            <label htmlFor="observacao" className="block text-sm font-medium text-gray-700 mb-1">
              Observação
            </label>
            <textarea
              id="observacao"
              value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900"
              rows={4}
              placeholder="Adicione uma observação sobre este evento..."
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
