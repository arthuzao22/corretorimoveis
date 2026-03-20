'use client'

import {
  X, Save, Loader2, Plus, Calendar, ArrowRight,
  Phone, Mail, MessageSquare, User, FileText, Clock,
  ChevronRight, Thermometer, Star, StickyNote, Building2,
  Tag, CalendarDays, Activity
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LeadStatus, LeadPriority } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from './StatusBadge'
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
      } | null
    }>
  }
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
}

const tabs = [
  { key: 'details' as const, label: 'Detalhes', icon: FileText },
  { key: 'tags' as const, label: 'Tags', icon: Tag },
  { key: 'events' as const, label: 'Eventos', icon: CalendarDays },
  { key: 'timeline' as const, label: 'Histórico', icon: Activity },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function getScoreColor(score: number) {
  if (score >= 70) return 'text-emerald-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-slate-400'
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
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setClosing(false)
      setPriority(lead.priority)
      setAnotacoes(lead.anotacoes || '')
      setDescription(lead.description || '')
      setScore(lead.score || 0)
      setTemperatura(lead.temperatura || 'morno')
      loadTimeline()
      loadKanbanColumns()
    }
  }, [isOpen, lead])

  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(() => {
      onClose()
      setClosing(false)
    }, 250)
  }, [onClose])

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

      if (score !== lead.score) {
        const scoreResult = await updateLeadScore(lead.id, score)
        if (!scoreResult.success) {
          console.error('Error updating score:', scoreResult.error)
        }
      }

      if (temperatura !== lead.temperatura) {
        const tempResult = await updateLeadTemperatura(lead.id, temperatura)
        if (!tempResult.success) {
          console.error('Error updating temperatura:', tempResult.error)
        }
      }

      onUpdate?.()
      handleClose()
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

  const createdDate = typeof lead.createdAt === 'string' ? new Date(lead.createdAt) : lead.createdAt

  return (
    <>
      {/* Overlay with blur */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          closing ? 'bg-black/0 backdrop-blur-0' : 'bg-black/40 backdrop-blur-sm'
        }`}
        onClick={handleClose}
      />

      {/* Drawer Panel — fullscreen on mobile, max-w on desktop */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-full md:max-w-[680px] bg-white z-50 overflow-hidden flex flex-col shadow-[-8px_0_30px_-12px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out ${
          closing ? 'translate-x-full' : 'animate-drawer-slide-in'
        }`}
      >
        {/* ─── Header ─── */}
        <div className="relative flex-shrink-0 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

          <div className="relative px-5 pt-5 pb-4 md:px-6 md:pt-6 md:pb-5">
            {/* Top row: close button */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Avatar */}
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 ring-2 ring-white/30">
                  <span className="text-white font-bold text-sm md:text-base">{getInitials(lead.name)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg md:text-xl font-bold text-white truncate leading-tight">{lead.name}</h2>
                  <p className="text-indigo-100 text-xs md:text-sm mt-0.5">
                    Criado em {createdDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/25 text-white/80 hover:text-white transition-all duration-200 flex-shrink-0 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-2 flex-wrap">
              {lead.kanbanColumn ? (
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm ring-1 ring-white/20"
                  style={{
                    backgroundColor: `${lead.kanbanColumn.color || '#6366f1'}cc`,
                    color: '#ffffff',
                  }}
                >
                  {lead.kanbanColumn.name}
                </span>
              ) : (
                <StatusBadge status={lead.status} size="sm" />
              )}
              <PriorityBadge priority={priority} />
              {lead.imovel && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/15 text-white backdrop-blur-sm ring-1 ring-white/20">
                  <Building2 className="w-3 h-3" />
                  <span className="truncate max-w-[140px]">{lead.imovel.titulo}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ─── Tab Bar ─── */}
        <div className="flex-shrink-0 border-b border-slate-200 bg-slate-50/80">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key
              const count = tab.key === 'tags' ? (lead.tags?.length || 0) 
                          : tab.key === 'events' ? upcomingEvents.length 
                          : 0
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-2 text-xs md:text-sm font-medium transition-all duration-200 relative ${
                    isActive
                      ? 'text-indigo-600'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {count > 0 && (
                    <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                      isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-600 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ─── Scrollable Content ─── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-4 md:p-6">
            {/* ══════ DETAILS TAB ══════ */}
            {activeTab === 'details' && (
              <div className="space-y-5">
                {/* Contact Card */}
                <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <User className="w-4 h-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-700">Contato</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400 font-medium">Telefone</p>
                        <p className="text-sm font-medium text-slate-800">{lead.phone}</p>
                      </div>
                    </div>
                    {lead.email && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-4 h-4 text-sky-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-400 font-medium">Email</p>
                          <p className="text-sm font-medium text-slate-800 truncate">{lead.email}</p>
                        </div>
                      </div>
                    )}
                    {lead.message && (
                      <div className="flex items-start gap-3 pt-1">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MessageSquare className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-400 font-medium mb-1">Mensagem Inicial</p>
                          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-2.5">{lead.message}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Description */}
                <section>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    Descrição
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none transition-all duration-200 placeholder:text-slate-400"
                    placeholder="Descreva as necessidades e observações..."
                  />
                </section>

                {/* Priority */}
                <section>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                    <Star className="w-4 h-4 text-slate-400" />
                    Prioridade
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {([
                      { value: 'BAIXA', label: 'Baixa', color: 'emerald' },
                      { value: 'MEDIA', label: 'Média', color: 'amber' },
                      { value: 'ALTA', label: 'Alta', color: 'orange' },
                      { value: 'URGENTE', label: 'Urgente', color: 'red' },
                    ] as const).map((p) => {
                      const isActive = priority === p.value
                      const colorMap = {
                        emerald: { active: 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-emerald-500/20', hover: 'hover:border-emerald-300' },
                        amber: { active: 'border-amber-500 bg-amber-50 text-amber-700 ring-amber-500/20', hover: 'hover:border-amber-300' },
                        orange: { active: 'border-orange-500 bg-orange-50 text-orange-700 ring-orange-500/20', hover: 'hover:border-orange-300' },
                        red: { active: 'border-red-500 bg-red-50 text-red-700 ring-red-500/20', hover: 'hover:border-red-300' },
                      }
                      const c = colorMap[p.color]
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setPriority(p.value)}
                          className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                            isActive ? `${c.active} ring-2` : `border-slate-200 text-slate-500 ${c.hover}`
                          }`}
                        >
                          {p.label}
                        </button>
                      )
                    })}
                  </div>
                </section>

                {/* Score + Temperatura row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Score */}
                  <section className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <Thermometer className="w-4 h-4 text-slate-400" />
                        Score
                      </label>
                      <span className={`text-2xl font-bold tabular-nums ${getScoreColor(score)}`}>{score}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={score}
                      onChange={(e) => setScore(parseInt(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-200 accent-indigo-600"
                    />
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2">
                      <div
                        className="h-full rounded-full transition-all duration-300 ease-out"
                        style={{
                          width: `${score}%`,
                          background: score >= 70 ? 'linear-gradient(90deg, #10b981, #059669)' : score >= 40 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #94a3b8, #64748b)',
                        }}
                      />
                    </div>
                  </section>

                  {/* Temperatura */}
                  <section className="rounded-xl border border-slate-200 bg-white p-4">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-3">
                      🌡️ Temperatura
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { value: 'quente', emoji: '🔥', label: 'Quente', active: 'border-red-400 bg-red-50 text-red-700 ring-red-400/20', hover: 'hover:border-red-300 hover:bg-red-50/50' },
                        { value: 'morno', emoji: '🟡', label: 'Morno', active: 'border-amber-400 bg-amber-50 text-amber-700 ring-amber-400/20', hover: 'hover:border-amber-300 hover:bg-amber-50/50' },
                        { value: 'frio', emoji: '❄️', label: 'Frio', active: 'border-sky-400 bg-sky-50 text-sky-700 ring-sky-400/20', hover: 'hover:border-sky-300 hover:bg-sky-50/50' },
                      ] as const).map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setTemperatura(t.value)}
                          className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all duration-200 ${
                            temperatura === t.value ? `${t.active} ring-2` : `border-slate-200 text-slate-500 ${t.hover}`
                          }`}
                        >
                          <span className="text-base leading-none">{t.emoji}</span>
                          <span className="text-[11px] font-semibold">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Notes */}
                <section>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                    <StickyNote className="w-4 h-4 text-slate-400" />
                    Anotações Internas
                  </label>
                  <textarea
                    value={anotacoes}
                    onChange={(e) => setAnotacoes(e.target.value)}
                    rows={4}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none transition-all duration-200 placeholder:text-slate-400"
                    placeholder="Anotações privadas sobre este lead..."
                  />
                </section>

                {/* Dates */}
                {(lead.dataContato || lead.dataAgendamento) && (
                  <section className="flex flex-wrap gap-3">
                    {lead.dataContato && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Último Contato</p>
                          <p className="text-sm font-medium text-slate-700">
                            {new Date(lead.dataContato).toLocaleDateString('pt-BR', { dateStyle: 'medium' })}
                          </p>
                        </div>
                      </div>
                    )}
                    {lead.dataAgendamento && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-100">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <div>
                          <p className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider">Próxima Visita</p>
                          <p className="text-sm font-medium text-indigo-700">
                            {new Date(lead.dataAgendamento).toLocaleDateString('pt-BR', { dateStyle: 'medium' })}
                          </p>
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {/* Kanban Move */}
                {kanbanColumns.length > 0 && (
                  <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                      <h4 className="text-sm font-semibold text-slate-700">Mover para</h4>
                      {movingColumn && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500 ml-auto" />}
                    </div>
                    <div className="p-3 flex gap-2 flex-wrap">
                      {kanbanColumns.map((col: any) => {
                        const isCurrent = lead.kanbanColumn?.id === col.id
                        return (
                          <button
                            key={col.id}
                            onClick={() => handleMoveColumn(col.id)}
                            disabled={isCurrent || movingColumn}
                            className={`group px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                              isCurrent
                                ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-default'
                                : 'hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                            }`}
                            style={!isCurrent ? {
                              borderColor: `${col.color || '#6b7280'}40`,
                              color: col.color || '#6b7280',
                              backgroundColor: `${col.color || '#6b7280'}08`,
                            } : undefined}
                          >
                            {isCurrent && (
                              <span className="inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                {col.name}
                              </span>
                            )}
                            {!isCurrent && (
                              <span className="flex items-center gap-1">
                                <ChevronRight className="w-3 h-3 opacity-0 -ml-1 group-hover:opacity-100 transition-opacity" />
                                {col.name}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </section>
                )}

                {/* Corretor */}
                {lead.corretor && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider">Corretor Responsável</p>
                      <p className="text-sm font-semibold text-indigo-700">{lead.corretor.user.name}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════ TAGS TAB ══════ */}
            {activeTab === 'tags' && (
              <TagManager
                leadId={lead.id}
                currentTags={lead.tags || []}
                onTagsChange={onUpdate}
              />
            )}

            {/* ══════ EVENTS TAB ══════ */}
            {activeTab === 'events' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">Eventos</h3>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/corretor/calendario?lead=${lead.id}`)}
                    className="flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Novo Evento
                  </Button>
                </div>

                {upcomingEvents.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Próximos</p>
                    <div className="space-y-2.5">
                      {upcomingEvents.map((evento) => (
                        <EventCard
                          key={evento.id}
                          tipo={evento.tipo}
                          dataHora={evento.dataHora}
                          imovelTitulo={evento.imovel?.titulo}
                          observacao={evento.observacao || undefined}
                          completed={evento.completed}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {pastEvents.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Passados</p>
                    <div className="space-y-2.5 opacity-70">
                      {pastEvents.slice(0, 5).map((evento) => (
                        <EventCard
                          key={evento.id}
                          tipo={evento.tipo}
                          dataHora={evento.dataHora}
                          imovelTitulo={evento.imovel?.titulo}
                          observacao={evento.observacao || undefined}
                          completed={evento.completed}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {upcomingEvents.length === 0 && pastEvents.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-7 h-7 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium mb-1">Nenhum evento agendado</p>
                    <p className="text-slate-400 text-sm mb-5">Crie um evento para acompanhar este lead</p>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/corretor/calendario?lead=${lead.id}`)}
                    >
                      Criar Primeiro Evento
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* ══════ TIMELINE TAB ══════ */}
            {activeTab === 'timeline' && (
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-4">Histórico de Atividades</h3>
                {loadingTimeline ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
                      <p className="text-sm text-slate-400">Carregando histórico...</p>
                    </div>
                  </div>
                ) : (
                  <LeadTimeline timeline={timeline} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── Footer ─── */}
        {activeTab === 'details' && (
          <div className="flex-shrink-0 border-t border-slate-200 bg-white px-4 py-3 md:px-6 md:py-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={handleClose}
                disabled={loading}
                className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm shadow-indigo-600/20 hover:shadow-md hover:shadow-indigo-600/25 transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
              >
                {loading ? (
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
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes drawer-slide-in {
          from {
            transform: translateX(100%);
            opacity: 0.8;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-drawer-slide-in {
          animation: drawer-slide-in 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }
      `}</style>
    </>
  )
}
