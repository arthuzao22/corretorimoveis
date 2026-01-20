'use client'

import { X, Save, Loader2, Plus, Calendar, Flame, Snowflake, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LeadStatus, LeadPriority } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import { StatusBadge, PriorityBadge as OldPriorityBadge } from './StatusBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { LeadTimeline } from './LeadTimeline'
import { TagManager } from './TagManager'
import { EventCard } from '@/components/ui/EventCard'
import { updateLeadStatus, updateLeadScore, updateLeadTemperatura } from '@/server/actions/leads'
import { getLeadTimeline } from '@/server/actions/timeline'
import { getKanbanColumns, moveLeadToColumn } from '@/server/actions/kanban'

interface LeadDrawerProps {
  lead: {
    id: string
    name: string
    email?: string | null
    phone: string
    message?: string | null
    description?: string | null
    status: LeadStatus
    priority: LeadPriority
    anotacoes?: string | null
    dataContato?: Date | string | null
    dataAgendamento?: Date | string | null
    createdAt: Date | string
    score?: number
    temperatura?: string
    kanbanColumn?: {
      id: string
      name: string
      color: string | null
    } | null
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
    tags?: Array<{
      id: string
      tag: {
        id: string
        name: string
        color: string
      }
    }>
    eventos?: Array<{
      id: string
      tipo: string
      dataHora: Date | string
      observacao?: string | null
      completed: boolean
      imovel: {
        titulo: string
      }
    }>
  }
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
}

export function LeadDrawer({ lead, isOpen, onClose, onUpdate }: LeadDrawerProps) {
  const router = useRouter()
  const [priority, setPriority] = useState<LeadPriority>(lead.priority)
  const [anotacoes, setAnotacoes] = useState(lead.anotacoes || '')
  const [description, setDescription] = useState(lead.description || '')
  const [score, setScore] = useState(lead.score || 0)
  const [temperatura, setTemperatura] = useState(lead.temperatura || 'morno')
  const [loading, setLoading] = useState(false)
  const [timeline, setTimeline] = useState<any[]>([])
  const [loadingTimeline, setLoadingTimeline] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'tags' | 'events' | 'timeline'>('details')
  const [kanbanColumns, setKanbanColumns] = useState<any[]>([])
  const [movingColumn, setMovingColumn] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setPriority(lead.priority)
      setAnotacoes(lead.anotacoes || '')
      setDescription(lead.description || '')
      setScore(lead.score || 0)
      setTemperatura(lead.temperatura || 'morno')
      loadTimeline()
      loadKanbanColumns()
    }
  }, [isOpen, lead])

  const loadKanbanColumns = async () => {
    try {
      const result = await getKanbanColumns()
      if (result.success && result.columns) {
        setKanbanColumns(result.columns)
      }
    } catch (error) {
      console.error('Error loading kanban columns:', error)
    }
  }

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
      // Update basic lead info
      const result = await updateLeadStatus({
        leadId: lead.id,
        priority,
        anotacoes,
        description,
      })

      if (!result.success) {
        alert(result.error || 'Erro ao atualizar lead')
        return
      }

      // Update score if changed
      if (score !== lead.score) {
        const scoreResult = await updateLeadScore(lead.id, score)
        if (!scoreResult.success) {
          console.error('Error updating score:', scoreResult.error)
        }
      }

      // Update temperatura if changed
      if (temperatura !== lead.temperatura) {
        const tempResult = await updateLeadTemperatura(lead.id, temperatura)
        if (!tempResult.success) {
          console.error('Error updating temperatura:', tempResult.error)
        }
      }

      onUpdate?.()
      onClose()
    } catch (error) {
      console.error('Error updating lead:', error)
      alert('Erro ao atualizar lead')
    } finally {
      setLoading(false)
    }
  }

  const handleMoveColumn = async (columnId: string) => {
    if (columnId === lead.kanbanColumn?.id) return
    
    setMovingColumn(true)
    try {
      const result = await moveLeadToColumn({
        leadId: lead.id,
        columnId,
      })
      if (result.success) {
        onUpdate?.()
      } else {
        alert(result.error || 'Erro ao mover lead')
      }
    } catch (error) {
      console.error('Error moving lead:', error)
      alert('Erro ao mover lead')
    } finally {
      setMovingColumn(false)
    }
  }

  if (!isOpen) return null

  const upcomingEvents = lead.eventos?.filter(e => !e.completed && new Date(e.dataHora) > new Date()) || []
  const pastEvents = lead.eventos?.filter(e => e.completed || new Date(e.dataHora) <= new Date()) || []

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
                {lead.kanbanColumn ? (
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: lead.kanbanColumn.color || '#6366f1',
                      color: '#ffffff',
                    }}
                  >
                    {lead.kanbanColumn.name}
                  </span>
                ) : (
                  <StatusBadge status={lead.status} />
                )}
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
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'details'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Detalhes
            </button>
            <button
              onClick={() => setActiveTab('tags')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'tags'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tags {lead.tags && lead.tags.length > 0 && `(${lead.tags.length})`}
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'events'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Eventos {upcomingEvents.length > 0 && `(${upcomingEvents.length})`}
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
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

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição do Lead
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Descreva as características, necessidades e observações sobre este lead..."
                />
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

              {/* Score and Temperatura */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Score Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score de Interesse
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={score}
                      onChange={(e) => setScore(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-10 text-right">{score}</span>
                    </div>
                  </div>
                </div>

                {/* Temperatura Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperatura
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTemperatura('quente')}
                      className={`flex-1 px-3 py-2 rounded-lg border-2 transition-colors ${
                        temperatura === 'quente'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <span className="text-lg">🔥</span>
                      <span className="block text-xs mt-1">Quente</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemperatura('morno')}
                      className={`flex-1 px-3 py-2 rounded-lg border-2 transition-colors ${
                        temperatura === 'morno'
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-gray-200 hover:border-yellow-300'
                      }`}
                    >
                      <span className="text-lg">🟡</span>
                      <span className="block text-xs mt-1">Morno</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemperatura('frio')}
                      className={`flex-1 px-3 py-2 rounded-lg border-2 transition-colors ${
                        temperatura === 'frio'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <span className="text-lg">❄️</span>
                      <span className="block text-xs mt-1">Frio</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anotações Internas
                </label>
                <textarea
                  value={anotacoes}
                  onChange={(e) => setAnotacoes(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Adicione suas anotações privadas sobre este lead..."
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

              {/* Mini-Kanban - Mover para outra coluna */}
              {kanbanColumns.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Mover para:
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    {kanbanColumns.map((col: any) => {
                      const isCurrent = lead.kanbanColumn?.id === col.id
                      return (
                        <button
                          key={col.id}
                          onClick={() => handleMoveColumn(col.id)}
                          disabled={isCurrent || movingColumn}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                            isCurrent
                              ? 'border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed'
                              : 'hover:scale-105 hover:shadow-md'
                          }`}
                          style={{
                            borderColor: isCurrent ? undefined : col.color || '#6b7280',
                            color: isCurrent ? undefined : col.color || '#6b7280',
                            backgroundColor: isCurrent ? undefined : `${col.color || '#6b7280'}10`,
                          }}
                        >
                          {isCurrent && '✓ '}
                          {col.name}
                        </button>
                      )
                    })}
                  </div>
                  {movingColumn && (
                    <p className="text-sm text-gray-500 mt-2">Movendo lead...</p>
                  )}
                </div>
              )}

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
          ) : activeTab === 'tags' ? (
            <div>
              <TagManager
                leadId={lead.id}
                currentTags={lead.tags || []}
                onTagsChange={onUpdate}
              />
            </div>
          ) : activeTab === 'events' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Eventos</h3>
                <Button
                  onClick={() => {
                    router.push(`/corretor/calendario?lead=${lead.id}`)
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Novo Evento
                </Button>
              </div>

              {upcomingEvents.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Próximos</h4>
                  <div className="space-y-3">
                    {upcomingEvents.map((evento) => (
                      <EventCard
                        key={evento.id}
                        tipo={evento.tipo}
                        dataHora={evento.dataHora}
                        imovelTitulo={evento.imovel.titulo}
                        observacao={evento.observacao || undefined}
                        completed={evento.completed}
                        onClick={() => {
                          // TODO: Open event detail
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {pastEvents.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Passados</h4>
                  <div className="space-y-3">
                    {pastEvents.slice(0, 5).map((evento) => (
                      <EventCard
                        key={evento.id}
                        tipo={evento.tipo}
                        dataHora={evento.dataHora}
                        imovelTitulo={evento.imovel.titulo}
                        observacao={evento.observacao || undefined}
                        completed={evento.completed}
                        onClick={() => {
                          // TODO: Open event detail
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {upcomingEvents.length === 0 && pastEvents.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Nenhum evento agendado</p>
                  <Button
                    onClick={() => {
                      router.push(`/corretor/calendario?lead=${lead.id}`)
                    }}
                  >
                    Criar Primeiro Evento
                  </Button>
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
        {(activeTab === 'details') && (
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
