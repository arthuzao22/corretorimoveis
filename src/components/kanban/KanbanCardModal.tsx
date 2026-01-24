'use client'

import { X, Save, Loader2, Plus, Calendar, Building2, Mail, Phone, MessageSquare, User, Clock, Tag, Edit2, MapPin, Sparkles, History, CheckCircle2, AlertCircle, ChevronRight, ArrowRight, User as UserIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { LeadPriority } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { LeadTimeline } from '@/components/leads/LeadTimeline'
import { TagManager } from '@/components/leads/TagManager'
import { EventCard } from '@/components/ui/EventCard'
import { QuickEventForm } from '@/components/eventos/QuickEventForm'
import { CommentSection } from '@/components/kanban/CommentSection'
import { updateLeadStatus } from '@/server/actions/leads'
import { getLeadTimeline } from '@/server/actions/timeline'
import { addTimelineEntry } from '@/server/actions/timeline'
import { moveLeadToColumn } from '@/server/actions/kanban'
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
  columns?: Array<{
    id: string
    name: string
    color: string | null
  }>
}

export function KanbanCardModal({ lead, isOpen, onClose, onUpdate, columns }: KanbanCardModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [timeline, setTimeline] = useState<any[]>([])
  const [loadingTimeline, setLoadingTimeline] = useState(true)
  const [showEventForm, setShowEventForm] = useState(false)
  const [availableImoveis, setAvailableImoveis] = useState<Array<{ id: string; titulo: string }>>([])
  const [loadingImoveis, setLoadingImoveis] = useState(false)
  const [movingColumn, setMovingColumn] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'info' | 'events' | 'comments' | 'history'>('details')

  const [editData, setEditData] = useState({
    priority: lead.priority,
    description: lead.description || '',
    anotacoes: lead.anotacoes || '',
    imovelId: lead.imovel?.id || '',
  })

  useEffect(() => {
    if (isOpen) {
      loadTimeline()
      loadAvailableImoveis()
      setEditData({
        priority: lead.priority,
        description: lead.description || '',
        anotacoes: lead.anotacoes || '',
        imovelId: lead.imovel?.id || '',
      })
      setIsEditing(false)
      setShowEventForm(false)
      setActiveTab('details')
    }
  }, [isOpen, lead])

  const loadAvailableImoveis = async () => {
    setLoadingImoveis(true)
    try {
      const response = await fetch('/api/imoveis')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.imoveis) {
          setAvailableImoveis(
            data.imoveis.map((imovel: any) => ({
              id: imovel.id,
              titulo: imovel.titulo,
            }))
          )
        }
      }
    } catch (error) {
      console.error('Error loading imoveis:', error)
    } finally {
      setLoadingImoveis(false)
    }
  }

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
        imovelId: editData.imovelId || undefined,
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

  const handleEventSave = async (eventData: any) => {
    try {
      const response = await fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      })

      const data = await response.json()

      if (data.success) {
        await addTimelineEntry(
          lead.id,
          'EVENT_SCHEDULED',
          `Evento agendado: ${eventData.tipo} para ${new Date(eventData.dataHora).toLocaleDateString('pt-BR')}`
        )

        setShowEventForm(false)
        onUpdate?.()
        loadTimeline()
      } else {
        throw new Error(data.error || 'Erro ao criar evento')
      }
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    }
  }

  const handleColumnMove = async (targetColumnId: string) => {
    if (targetColumnId === lead.kanbanColumn?.id || !targetColumnId) return

    setMovingColumn(true)
    try {
      const result = await moveLeadToColumn({
        leadId: lead.id,
        columnId: targetColumnId
      })

      if (result.success) {
        await loadTimeline()
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
  const overdueEvents = lead.eventos?.filter(e => !e.completed && new Date(e.dataHora) <= new Date()) || []
  const completedEvents = lead.eventos?.filter(e => e.completed) || []

  const priorityColors: Record<LeadPriority, string> = {
    BAIXA: 'bg-blue-500',
    MEDIA: 'bg-yellow-500',
    ALTA: 'bg-orange-500',
    URGENTE: 'bg-red-500',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal Container - Fullscreen on mobile, centered on desktop */}
      <div className="bg-white md:rounded-2xl shadow-2xl w-full h-full md:max-w-5xl md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 md:slide-in-from-bottom-4 duration-300">

        {/* Mobile Header - Only visible on mobile */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${priorityColors[lead.priority]} flex items-center justify-center shadow-md`}>
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 truncate max-w-[180px]">{lead.name}</h2>
              <p className="text-xs text-slate-500">
                {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true, locale: ptBR })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Tabs - Only visible on mobile */}
        <div className="md:hidden flex gap-1 px-2 py-2 border-b border-slate-200 bg-slate-50 overflow-x-auto">
          {[
            { id: 'details', label: 'Detalhes', icon: Sparkles },
            { id: 'info', label: 'Dados', icon: User },
            { id: 'events', label: 'Eventos', icon: Calendar, badge: lead.eventos?.length },
            { id: 'comments', label: 'Chat', icon: MessageSquare },
            { id: 'history', label: 'Histórico', icon: History },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap relative ${activeTab === tab.id
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Left Sidebar - Lead Info (Hidden on mobile, shown in tabs) */}
        <div className="hidden md:flex md:w-80 bg-gradient-to-br from-slate-50 to-slate-100 border-r border-slate-200 flex-col">
          {/* Header with Priority Indicator */}
          <div className="p-6 border-b border-slate-200/60">
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-xl ${priorityColors[lead.priority]} flex items-center justify-center shadow-lg`}>
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-800 truncate">{lead.name}</h2>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="p-4 space-y-2">
            <a
              href={`tel:${lead.phone}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/60 hover:border-indigo-300 hover:shadow-sm transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500">Telefone</p>
                <p className="text-sm font-medium text-slate-700 truncate group-hover:text-indigo-600 transition-colors">{lead.phone}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400" />
            </a>

            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/60 hover:border-indigo-300 hover:shadow-sm transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-medium text-slate-700 truncate group-hover:text-indigo-600 transition-colors">{lead.email}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400" />
              </a>
            )}
          </div>

          {/* Property Card */}
          {lead.imovel && (
            <div className="px-4 pb-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                <div className="flex items-start gap-2 mb-2">
                  <Building2 className="w-4 h-4 mt-0.5 opacity-80" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs opacity-80">Interesse em</p>
                    <p className="font-semibold truncate">{lead.imovel.titulo}</p>
                  </div>
                </div>
                {(lead.imovel.cidade || lead.imovel.endereco) && (
                  <p className="text-xs opacity-80 flex items-center gap-1 mt-2">
                    <MapPin className="w-3 h-3" />
                    {lead.imovel.cidade || lead.imovel.endereco}
                  </p>
                )}
                {lead.imovel.valor && (
                  <p className="text-xl font-bold mt-3">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(lead.imovel.valor)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Column Selector */}
          {columns && columns.length > 0 && (
            <div className="px-4 pb-4">
              <p className="text-xs font-medium text-slate-500 mb-2 px-1">Mover para:</p>
              <div className="flex flex-wrap gap-1.5">
                {columns.map(column => (
                  <button
                    key={column.id}
                    onClick={() => handleColumnMove(column.id)}
                    disabled={movingColumn || column.id === lead.kanbanColumn?.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${column.id === lead.kanbanColumn?.id
                      ? 'text-white shadow-md scale-105'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm'
                      } ${movingColumn ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={
                      column.id === lead.kanbanColumn?.id
                        ? { backgroundColor: column.color || '#6b7280' }
                        : {}
                    }
                  >
                    {column.name}
                  </button>
                ))}
              </div>
              {movingColumn && (
                <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Movendo...
                </p>
              )}
            </div>
          )}

          {/* Tags */}
          <div className="px-4 pb-4 mt-auto">
            <p className="text-xs font-medium text-slate-500 mb-2 px-1 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Tags
            </p>
            <TagManager leadId={lead.id} currentTags={lead.tags || []} onUpdate={onUpdate} />
          </div>

          {/* Footer */}
          {lead.corretor && (
            <div className="p-4 border-t border-slate-200/60 bg-white/50">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Corretor</p>
              <p className="text-sm font-medium text-slate-700">{lead.corretor.user.name}</p>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar with Tabs and Close - Desktop only */}
          <div className="hidden md:flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-slate-200">
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
              {[
                { id: 'details', label: 'Detalhes', icon: Sparkles },
                { id: 'events', label: `Eventos (${(lead.eventos?.length || 0)})`, icon: Calendar },
                { id: 'comments', label: 'Comentários', icon: MessageSquare },
                { id: 'history', label: 'Histórico', icon: History },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-md text-xs md:text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Initial Message */}
                {lead.message && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <h4 className="text-sm font-semibold text-blue-800">Mensagem Inicial</h4>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{lead.message}</p>
                  </div>
                )}

                {/* Priority */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Prioridade</label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      {(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'] as LeadPriority[]).map(p => (
                        <button
                          key={p}
                          onClick={() => setEditData({ ...editData, priority: p })}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${editData.priority === p
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                            }`}
                        >
                          {p === 'BAIXA' && 'Baixa'}
                          {p === 'MEDIA' && 'Média'}
                          {p === 'ALTA' && 'Alta'}
                          {p === 'URGENTE' && 'Urgente'}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <PriorityBadge priority={lead.priority} />
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Descrição</label>
                  {isEditing ? (
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[120px] text-sm resize-none transition-all"
                      placeholder="Adicione detalhes sobre o lead..."
                    />
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-700 min-h-[80px] border border-slate-100">
                      {lead.description || <span className="text-slate-400 italic">Nenhuma descrição</span>}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Anotações Internas</label>
                  {isEditing ? (
                    <textarea
                      value={editData.anotacoes}
                      onChange={(e) => setEditData({ ...editData, anotacoes: e.target.value })}
                      className="w-full px-4 py-3 border border-amber-200 bg-amber-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent min-h-[100px] text-sm resize-none transition-all"
                      placeholder="Anotações privadas..."
                    />
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-slate-700 min-h-[60px]">
                      {lead.anotacoes || <span className="text-slate-400 italic">Nenhuma anotação</span>}
                    </div>
                  )}
                </div>

                {/* Property Selection (Edit Mode) */}
                {isEditing && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Imóvel de Interesse</label>
                    <select
                      value={editData.imovelId}
                      onChange={(e) => setEditData({ ...editData, imovelId: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                    >
                      <option value="">Nenhum imóvel vinculado</option>
                      {availableImoveis.map((imovel) => (
                        <option key={imovel.id} value={imovel.id}>
                          {imovel.titulo}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'info' && (
              <div className="space-y-6 md:hidden">
                {/* Contact Info */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Informações de Contato
                  </h4>
                  
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100 hover:border-green-200 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-green-600 font-medium">Telefone</p>
                      <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-green-600 transition-colors">{lead.phone}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-green-400 group-hover:text-green-600" />
                  </a>

                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}`}
                      className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 hover:border-blue-200 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-600 font-medium">Email</p>
                        <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-blue-600 transition-colors">{lead.email}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-blue-400 group-hover:text-blue-600" />
                    </a>
                  )}
                </div>

                {/* Property Card */}
                {lead.imovel && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                      <Building2 className="w-4 h-4" />
                      Interesse
                    </h4>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                      <div className="flex items-start gap-2 mb-3">
                        <Building2 className="w-5 h-5 mt-0.5 opacity-80" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs opacity-80">Imóvel de interesse</p>
                          <p className="font-semibold text-base truncate">{lead.imovel.titulo}</p>
                        </div>
                      </div>
                      {(lead.imovel.cidade || lead.imovel.endereco) && (
                        <p className="text-xs opacity-90 flex items-center gap-1 mb-3">
                          <MapPin className="w-3 h-3" />
                          {lead.imovel.cidade || lead.imovel.endereco}
                        </p>
                      )}
                      {lead.imovel.valor && (
                        <p className="text-2xl font-bold">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(lead.imovel.valor)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4" />
                    Tags
                  </h4>
                  <TagManager leadId={lead.id} currentTags={lead.tags || []} onUpdate={onUpdate} />
                </div>

                {/* Column Selector */}
                {columns && columns.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                      <ArrowRight className="w-4 h-4" />
                      Mover Lead
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {columns.map(column => (
                        <button
                          key={column.id}
                          onClick={() => handleColumnMove(column.id)}
                          disabled={movingColumn || column.id === lead.kanbanColumn?.id}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            column.id === lead.kanbanColumn?.id
                              ? 'text-white shadow-md scale-105'
                              : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm'
                          } ${movingColumn ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          style={
                            column.id === lead.kanbanColumn?.id
                              ? { backgroundColor: column.color || '#6b7280' }
                              : {}
                          }
                        >
                          {column.name}
                        </button>
                      ))}
                    </div>
                    {movingColumn && (
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Movendo...
                      </p>
                    )}
                  </div>
                )}

                {/* Corretor Info */}
                {lead.corretor && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                      <UserIcon className="w-4 h-4" />
                      Corretor Responsável
                    </h4>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{lead.corretor.user.name}</p>
                          <p className="text-xs text-slate-500">Responsável pelo lead</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-6">
                {/* Create Event Button / Form */}
                {!showEventForm ? (
                  <button
                    onClick={() => setShowEventForm(true)}
                    className="w-full p-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Agendar Novo Evento
                  </button>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <QuickEventForm
                      leadId={lead.id}
                      leadName={lead.name}
                      onSave={handleEventSave}
                      onCancel={() => setShowEventForm(false)}
                      imoveis={availableImoveis}
                      defaultImovel={lead.imovel ? { id: lead.imovel.id, titulo: lead.imovel.titulo } : null}
                    />
                  </div>
                )}

                {/* Overdue Events */}
                {overdueEvents.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Atrasados ({overdueEvents.length})
                    </h4>
                    <div className="space-y-2">
                      {overdueEvents.map(evento => (
                        <EventCard key={evento.id} evento={evento as any} variant="compact" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming Events */}
                {upcomingEvents.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Próximos ({upcomingEvents.length})
                    </h4>
                    <div className="space-y-2">
                      {upcomingEvents.map(evento => (
                        <EventCard key={evento.id} evento={evento as any} variant="compact" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Events */}
                {completedEvents.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Concluídos ({completedEvents.length})
                    </h4>
                    <div className="space-y-2">
                      {completedEvents.map(evento => (
                        <EventCard key={evento.id} evento={evento as any} variant="compact" />
                      ))}
                    </div>
                  </div>
                )}

                {lead.eventos?.length === 0 && !showEventForm && (
                  <div className="text-center py-12 text-slate-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Nenhum evento agendado</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="h-[500px]">
                <CommentSection
                  leadId={lead.id}
                  currentUserId={lead.corretor?.id || ''}
                  isAdmin={false}
                />
              </div>
            )}

            {activeTab === 'history' && (
              <LeadTimeline timeline={timeline} loading={loadingTimeline} />
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
            {isEditing ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="px-5"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5"
              >
                <Edit2 className="w-4 h-4" />
                Editar Lead
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

