'use client'

import { X, Save, Loader2, Plus, Calendar, Building2, Mail, Phone, MessageSquare, User, Clock, Tag, Edit2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { LeadPriority } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { TagBadge } from '@/components/ui/TagBadge'
import { LeadTimeline } from '@/components/leads/LeadTimeline'
import { TagManager } from '@/components/leads/TagManager'
import { EventCard } from '@/components/ui/EventCard'
import { updateLeadStatus } from '@/server/actions/leads'
import { getLeadTimeline } from '@/server/actions/timeline'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Lead {
  id: string
  name: string
  email?: string | null
  phone: string
  message?: string | null
  description?: string | null
  priority: LeadPriority
  anotacoes?: string | null
  createdAt: Date | string
  kanbanColumn?: {
    id: string
    name: string
    color: string | null
  } | null
  imovel?: {
    id: string
    titulo: string
    endereco?: string
    cidade?: string
    estado?: string
    valor?: number
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
    imovel?: {
      titulo: string
    }
  }>
}

interface KanbanCardModalProps {
  lead: Lead
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
}

export function KanbanCardModal({ lead, isOpen, onClose, onUpdate }: KanbanCardModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [timeline, setTimeline] = useState<any[]>([])
  const [loadingTimeline, setLoadingTimeline] = useState(true)
  
  const [editData, setEditData] = useState({
    priority: lead.priority,
    description: lead.description || '',
    anotacoes: lead.anotacoes || '',
  })

  useEffect(() => {
    if (isOpen) {
      loadTimeline()
      // Reset form when opening
      setEditData({
        priority: lead.priority,
        description: lead.description || '',
        anotacoes: lead.anotacoes || '',
      })
      setIsEditing(false)
    }
  }, [isOpen, lead])

  const loadTimeline = async () => {
    setLoadingTimeline(true)
    const result = await getLeadTimeline(lead.id)
    if (result.success && result.timeline) {
      setTimeline(result.timeline)
    }
    setLoadingTimeline(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await updateLeadStatus({
        leadId: lead.id,
        priority: editData.priority,
        description: editData.description,
        anotacoes: editData.anotacoes,
      })

      if (result.success) {
        setIsEditing(false)
        onUpdate?.()
        loadTimeline()
      } else {
        alert(result.error || 'Erro ao salvar')
      }
    } catch (error) {
      alert('Erro ao salvar alterações')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const upcomingEvents = lead.eventos?.filter(e => !e.completed && new Date(e.dataHora) > new Date()) || []
  const overdueEvents = lead.eventos?.filter(e => !e.completed && new Date(e.dataHora) <= new Date()) || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      {/* Modal Container - Trello Style */}
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">{lead.name}</h2>
            </div>
            
            {/* Status Badge */}
            {lead.kanbanColumn && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-600">Coluna:</span>
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: lead.kanbanColumn.color || '#6b7280' }}
                >
                  {lead.kanbanColumn.name}
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Contact Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Informações de Contato
                </h3>
                
                <div className="space-y-2 bg-gray-50 rounded-lg p-4">
                  {lead.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                        {lead.email}
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                      {lead.phone}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-gray-500" />
                    Criado {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true, locale: ptBR })}
                  </div>
                </div>
              </div>

              {/* Initial Message */}
              {lead.message && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Mensagem Inicial</h4>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-gray-700">
                    {lead.message}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Property Info */}
            <div className="space-y-4">
              {lead.imovel && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Imóvel de Interesse
                  </h3>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{lead.imovel.titulo}</h4>
                    {lead.imovel.endereco && (
                      <p className="text-sm text-gray-600 mb-1">{lead.imovel.endereco}</p>
                    )}
                    {(lead.imovel.cidade || lead.imovel.estado) && (
                      <p className="text-sm text-gray-600">
                        {lead.imovel.cidade}{lead.imovel.cidade && lead.imovel.estado && ' - '}{lead.imovel.estado}
                      </p>
                    )}
                    {lead.imovel.valor && (
                      <p className="text-lg font-bold text-green-600 mt-2">
                        R$ {lead.imovel.valor.toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Priority */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Prioridade</h4>
                {isEditing ? (
                  <select
                    value={editData.priority}
                    onChange={(e) => setEditData({ ...editData, priority: e.target.value as LeadPriority })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="BAIXA">Baixa</option>
                    <option value="MEDIA">Média</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                ) : (
                  <PriorityBadge priority={lead.priority} />
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </h3>
            <TagManager leadId={lead.id} currentTags={lead.tags || []} onUpdate={onUpdate} />
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Descrição</h3>
            {isEditing ? (
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                placeholder="Adicione detalhes sobre o lead..."
              />
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 min-h-[100px]">
                {lead.description || <span className="text-gray-400">Nenhuma descrição</span>}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Anotações</h3>
            {isEditing ? (
              <textarea
                value={editData.anotacoes}
                onChange={(e) => setEditData({ ...editData, anotacoes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                placeholder="Anotações internas..."
              />
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700 min-h-[80px]">
                {lead.anotacoes || <span className="text-gray-400">Nenhuma anotação</span>}
              </div>
            )}
          </div>

          {/* Events */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Eventos ({(lead.eventos?.length || 0)})
              </h3>
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Criar Evento
              </Button>
            </div>

            {overdueEvents.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-red-600 mb-2">Atrasados</p>
                <div className="space-y-2">
                  {overdueEvents.map(evento => (
                    <EventCard key={evento.id} evento={evento as any} variant="compact" />
                  ))}
                </div>
              </div>
            )}

            {upcomingEvents.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-blue-600 mb-2">Próximos</p>
                <div className="space-y-2">
                  {upcomingEvents.map(evento => (
                    <EventCard key={evento.id} evento={evento as any} variant="compact" />
                  ))}
                </div>
              </div>
            )}

            {lead.eventos?.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhum evento agendado
              </p>
            )}
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Histórico</h3>
            <LeadTimeline timeline={timeline} loading={loadingTimeline} />
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div>
            {lead.corretor && (
              <p className="text-xs text-gray-500">
                Corretor: <span className="font-medium">{lead.corretor.user.name}</span>
              </p>
            )}
          </div>
          
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? (
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
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
