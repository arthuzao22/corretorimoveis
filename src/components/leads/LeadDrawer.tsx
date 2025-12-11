'use client'

import { X, Save, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { LeadStatus, LeadPriority } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import { StatusBadge, PriorityBadge } from './StatusBadge'
import { LeadTimeline } from './LeadTimeline'
import { updateLeadStatus } from '@/server/actions/leads'
import { getLeadTimeline } from '@/server/actions/timeline'

interface LeadDrawerProps {
  lead: {
    id: string
    name: string
    email?: string | null
    phone: string
    message?: string | null
    status: LeadStatus
    priority: LeadPriority
    anotacoes?: string | null
    dataContato?: Date | string | null
    dataAgendamento?: Date | string | null
    createdAt: Date | string
    imovel?: {
      id: string
      titulo: string
    } | null
    corretor?: {
      id: string
      user: {
        name: string
      }
    }
  }
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
}

export function LeadDrawer({ lead, isOpen, onClose, onUpdate }: LeadDrawerProps) {
  const [status, setStatus] = useState<LeadStatus>(lead.status)
  const [priority, setPriority] = useState<LeadPriority>(lead.priority)
  const [anotacoes, setAnotacoes] = useState(lead.anotacoes || '')
  const [loading, setLoading] = useState(false)
  const [timeline, setTimeline] = useState<any[]>([])
  const [loadingTimeline, setLoadingTimeline] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'timeline'>('details')

  useEffect(() => {
    if (isOpen) {
      setStatus(lead.status)
      setPriority(lead.priority)
      setAnotacoes(lead.anotacoes || '')
      loadTimeline()
    }
  }, [isOpen, lead])

  const loadTimeline = async () => {
    setLoadingTimeline(true)
    try {
      const result = await getLeadTimeline(lead.id)
      if (result.success && result.timeline) {
        setTimeline(result.timeline)
      }
    } catch (error) {
      console.error('Error loading timeline:', error)
    } finally {
      setLoadingTimeline(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const result = await updateLeadStatus({
        leadId: lead.id,
        status,
        priority,
        anotacoes,
      })

      if (result.success) {
        onUpdate?.()
        onClose()
      } else {
        alert(result.error || 'Erro ao atualizar lead')
      }
    } catch (error) {
      console.error('Error updating lead:', error)
      alert('Erro ao atualizar lead')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-hidden flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{lead.name}</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                <StatusBadge status={status} />
                <PriorityBadge priority={priority} />
              </div>
              {lead.imovel && (
                <p className="text-purple-100 text-sm">
                  Imóvel: {lead.imovel.titulo}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'details'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Detalhes
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'timeline'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Timeline
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' ? (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Informações de Contato
                </h3>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Telefone
                  </label>
                  <p className="text-gray-900">{lead.phone}</p>
                </div>
                {lead.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Email
                    </label>
                    <p className="text-gray-900">{lead.email}</p>
                  </div>
                )}
                {lead.message && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Mensagem Inicial
                    </label>
                    <p className="text-gray-700 text-sm">{lead.message}</p>
                  </div>
                )}
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LeadStatus)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="NOVO">Novo</option>
                  <option value="CONTATADO">Contatado</option>
                  <option value="ACOMPANHAMENTO">Follow-up</option>
                  <option value="VISITA_AGENDADA">Visita Agendada</option>
                  <option value="QUALIFICADO">Qualificado</option>
                  <option value="NEGOCIACAO">Negociando</option>
                  <option value="FECHADO">Fechado</option>
                  <option value="CONVERTIDO">Convertido</option>
                  <option value="PERDIDO">Perdido</option>
                </select>
              </div>

              {/* Priority Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridade
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as LeadPriority)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="BAIXA">Baixa</option>
                  <option value="MEDIA">Média</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anotações
                </label>
                <textarea
                  value={anotacoes}
                  onChange={(e) => setAnotacoes(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Adicione suas anotações sobre este lead..."
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-4">
                {lead.dataContato && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Último Contato
                    </label>
                    <p className="text-gray-900">
                      {new Date(lead.dataContato).toLocaleDateString('pt-BR', {
                        dateStyle: 'long',
                      })}
                    </p>
                  </div>
                )}
                {lead.dataAgendamento && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Próxima Visita
                    </label>
                    <p className="text-gray-900">
                      {new Date(lead.dataAgendamento).toLocaleDateString(
                        'pt-BR',
                        {
                          dateStyle: 'long',
                        }
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Agent Info */}
              {lead.corretor && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-purple-900">
                    Corretor Responsável
                  </label>
                  <p className="text-purple-700 font-medium">
                    {lead.corretor.user.name}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                Histórico de Atividades
              </h3>
              {loadingTimeline ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : (
                <LeadTimeline timeline={timeline} />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'details' && (
          <div className="bg-gray-50 border-t border-gray-200 p-4 flex-shrink-0">
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
