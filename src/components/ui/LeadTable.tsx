import React from 'react'
import { Mail, Phone, MessageCircle, Users, Edit, ChevronRight, Clock, CalendarDays } from 'lucide-react'
import { PriorityBadge } from '@/components/leads/StatusBadge'
import { KanbanColumnBadge } from '@/components/leads/KanbanColumnBadge'
import { TagBadge } from '@/components/ui/TagBadge'
import { LeadPriority } from '@prisma/client'

interface Lead {
  id: string
  name: string
  email?: string | null
  phone: string
  message?: string | null
  priority: LeadPriority
  createdAt: Date | string
  updatedAt?: Date | string
  dataContato?: Date | string | null
  ultimaInteracao?: Date | string | null
  proximoContato?: Date | string | null
  score?: number
  temperatura?: string
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
  kanbanColumn?: {
    id: string
    name: string
    color: string | null
  } | null
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
    completed: boolean
  }>
  origem?: string | null
}

interface LeadTableProps {
  leads: Lead[]
  onLeadClick?: (lead: Lead) => void
  selectedLeads?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
}

// Helper to get initials from name
const getInitials = (name: string) => {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

// Helper to get avatar color based on name — soft professional tones
const getAvatarColor = (name: string) => {
  const colors = [
    'bg-indigo-600',
    'bg-violet-600',
    'bg-blue-600',
    'bg-cyan-600',
    'bg-emerald-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-slate-600',
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

// Priority color dot
const getPriorityColor = (priority: LeadPriority) => {
  const map: Record<LeadPriority, string> = {
    BAIXA: 'bg-slate-300',
    MEDIA: 'bg-blue-400',
    ALTA: 'bg-amber-400',
    URGENTE: 'bg-red-500',
  }
  return map[priority] || 'bg-slate-300'
}

const getPriorityLabel = (priority: LeadPriority) => {
  const map: Record<LeadPriority, string> = {
    BAIXA: 'Baixa',
    MEDIA: 'Média',
    ALTA: 'Alta',
    URGENTE: 'Urgente',
  }
  return map[priority] || priority
}

// Temperature indicator component — compact for mobile
const TemperaturaIndicator = ({ temperatura }: { temperatura?: string }) => {
  const temperaturas = {
    quente: { emoji: '🔥', label: 'Quente', color: 'bg-red-100 text-red-700' },
    morno: { emoji: '🟡', label: 'Morno', color: 'bg-yellow-100 text-yellow-700' },
    frio: { emoji: '❄️', label: 'Frio', color: 'bg-blue-100 text-blue-700' },
  }
  
  const temp = temperaturas[temperatura as keyof typeof temperaturas] || temperaturas.morno
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${temp.color}`}>
      <span>{temp.emoji}</span>
      <span>{temp.label}</span>
    </span>
  )
}

export function LeadTable({ leads, onLeadClick, selectedLeads = [], onSelectionChange }: LeadTableProps) {
  // Constants
  const ATTENTION_THRESHOLD_DAYS = 3 // Days without interaction before highlighting
  
  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">Nenhum lead ainda</p>
      </div>
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    if (checked) {
      onSelectionChange(leads.map(l => l.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectOne = (leadId: string, checked: boolean) => {
    if (!onSelectionChange) return
    if (checked) {
      onSelectionChange([...selectedLeads, leadId])
    } else {
      onSelectionChange(selectedLeads.filter(id => id !== leadId))
    }
  }

  const allSelected = onSelectionChange && leads.length > 0 && selectedLeads.length === leads.length
  const someSelected = onSelectionChange && selectedLeads.length > 0 && selectedLeads.length < leads.length

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '-'
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  // Check if lead needs attention (no interaction for ATTENTION_THRESHOLD_DAYS)
  // Considers: ultimaInteracao, dataContato, updatedAt (includes Kanban moves), and completed events
  const needsAttention = (lead: Lead) => {
    // Get the most recent activity date from multiple sources
    const possibleDates: Date[] = []
    
    // 1. Explicit interaction date
    if (lead.ultimaInteracao) {
      const d = typeof lead.ultimaInteracao === 'string' ? new Date(lead.ultimaInteracao) : lead.ultimaInteracao
      possibleDates.push(d)
    }
    
    // 2. Contact date
    if (lead.dataContato) {
      const d = typeof lead.dataContato === 'string' ? new Date(lead.dataContato) : lead.dataContato
      possibleDates.push(d)
    }
    
    // 3. Last update (includes Kanban movements)
    if (lead.updatedAt) {
      const d = typeof lead.updatedAt === 'string' ? new Date(lead.updatedAt) : lead.updatedAt
      possibleDates.push(d)
    }
    
    // 4. Check completed events (most recent)
    if (lead.eventos && lead.eventos.length > 0) {
      const completedEvents = lead.eventos
        .filter(e => e.completed)
        .map(e => typeof e.dataHora === 'string' ? new Date(e.dataHora) : e.dataHora)
      
      if (completedEvents.length > 0) {
        const mostRecentEvent = new Date(Math.max(...completedEvents.map(d => d.getTime())))
        possibleDates.push(mostRecentEvent)
      }
    }
    
    // 5. If lead has upcoming events scheduled, don't mark as needing attention
    if (lead.eventos && lead.eventos.length > 0) {
      const now = new Date()
      const hasUpcomingEvent = lead.eventos.some(e => 
        !e.completed && new Date(e.dataHora) > now
      )
      if (hasUpcomingEvent) return false
    }
    
    // 6. If there's a proximoContato scheduled, don't mark as needing attention
    if (lead.proximoContato) {
      const followUp = typeof lead.proximoContato === 'string' ? new Date(lead.proximoContato) : lead.proximoContato
      if (followUp > new Date()) return false
    }
    
    // If no dates found, use createdAt
    if (possibleDates.length === 0) {
      const created = typeof lead.createdAt === 'string' ? new Date(lead.createdAt) : lead.createdAt
      possibleDates.push(created)
    }
    
    // Get the most recent date
    const lastActivity = new Date(Math.max(...possibleDates.map(d => d.getTime())))
    const daysSince = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
    
    return daysSince >= ATTENTION_THRESHOLD_DAYS
  }

  // Get next upcoming event
  const getNextEvent = (lead: Lead) => {
    if (!lead.eventos || lead.eventos.length === 0) return null
    
    const upcoming = lead.eventos
      .filter(e => !e.completed && new Date(e.dataHora) > new Date())
      .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
    
    return upcoming[0] || null
  }

  return (
    <>
      {/* ═══ Mobile Layout ═══ */}
      <div className="block md:hidden">
        {/* Select All Bar */}
        {onSelectionChange && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200/60">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected || false}
                ref={input => {
                  if (input) input.indeterminate = someSelected || false
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-3 h-3 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <span className="text-[13px] font-medium text-slate-500">
                {selectedLeads.length > 0 
                  ? `${selectedLeads.length} selecionado${selectedLeads.length > 1 ? 's' : ''}`
                  : 'Selecionar todos'
                }
              </span>
            </label>
          </div>
        )}

        {/* Lead Cards */}
        <div className="divide-y divide-slate-100/80">
          {leads.map((lead) => {
            const attention = needsAttention(lead)
            const nextEvent = getNextEvent(lead)
            const isSelected = selectedLeads.includes(lead.id)
            
            return (
              <div 
                key={lead.id}
                onClick={() => onLeadClick?.(lead)}
                className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer active:bg-slate-50/80 transition-all duration-150 ${
                  isSelected 
                    ? 'bg-indigo-50 border-l-[3px] border-l-indigo-500 pl-[13px]' 
                    : 'bg-white border-l-[3px] border-l-transparent'
                }`}
              >
                {/* Left: Checkbox */}
                {onSelectionChange && (
                  <div className="pt-1.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectOne(lead.id, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-3 h-3 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                )}

                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={`w-11 h-11 rounded-full ${getAvatarColor(lead.name)} flex items-center justify-center text-white font-semibold text-sm`}>
                    {getInitials(lead.name)}
                  </div>
                  {/* Priority dot indicator */}
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${getPriorityColor(lead.priority)}`} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  {/* Row 1: Name + Temperatura */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[15px] font-semibold text-slate-900 truncate leading-tight">
                      {lead.name}
                    </h3>
                    {lead.temperatura && (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        lead.temperatura === 'quente' ? 'bg-red-50 text-red-600' :
                        lead.temperatura === 'frio' ? 'bg-blue-50 text-blue-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {lead.temperatura === 'quente' ? '🔥 Quente' : lead.temperatura === 'frio' ? '❄️ Frio' : '☀️ Morno'}
                      </span>
                    )}
                  </div>

                  {/* Row 2: Phone */}
                  <p className="text-[13px] text-slate-500 mt-0.5 leading-tight">{lead.phone}</p>

                  {/* Row 3: Kanban stage + Priority label + Score */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {lead.kanbanColumn && (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-[3px] rounded-md"
                        style={{
                          backgroundColor: `${lead.kanbanColumn.color || '#6366f1'}15`,
                          color: lead.kanbanColumn.color || '#6366f1',
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: lead.kanbanColumn.color || '#6366f1' }}
                        />
                        {lead.kanbanColumn.name}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-medium">
                      {getPriorityLabel(lead.priority)}
                    </span>
                    {(lead.score ?? 0) > 0 && (
                      <>
                        <span className="text-slate-200">·</span>
                        <span className={`text-[11px] font-bold ${
                          (lead.score || 0) >= 70 ? 'text-emerald-600' : (lead.score || 0) >= 40 ? 'text-amber-600' : 'text-slate-400'
                        }`}>
                          {lead.score} pts
                        </span>
                      </>
                    )}
                  </div>

                  {/* Row 4: Tags — only if present */}
                  {lead.tags && lead.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                      {lead.tags.slice(0, 2).map((lt) => (
                        <span
                          key={lt.id}
                          className="text-[10px] font-semibold px-1.5 py-[2px] rounded"
                          style={{
                            backgroundColor: `${lt.tag.color}15`,
                            color: lt.tag.color,
                          }}
                        >
                          {lt.tag.name}
                        </span>
                      ))}
                      {lead.tags.length > 2 && (
                        <span className="text-[10px] text-slate-400">+{lead.tags.length - 2}</span>
                      )}
                    </div>
                  )}

                  {/* Row 5: Next event or Attention warning */}
                  {nextEvent ? (
                    <div className="flex items-center gap-1.5 mt-2">
                      <CalendarDays className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                      <span className="text-[11px] text-indigo-600 font-medium">{nextEvent.tipo}</span>
                      <span className="text-[11px] text-slate-400">· {formatDate(nextEvent.dataHora)}</span>
                    </div>
                  ) : attention ? (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Clock className="w-3 h-3 text-amber-500 flex-shrink-0" />
                      <span className="text-[11px] text-amber-600 font-medium">Sem interação há {ATTENTION_THRESHOLD_DAYS}+ dias</span>
                    </div>
                  ) : null}

                  {/* Row 6: Quick Actions */}
                  <div className="flex items-center gap-1 mt-2.5">
                    {lead.phone && (
                      <>
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[11px] font-medium text-emerald-700">WhatsApp</span>
                        </a>
                        <a
                          href={`tel:${lead.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center justify-center w-8 h-8 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                        </a>
                      </>
                    )}
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center w-8 h-8 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Right: Chevron */}
                <div className="pt-2 flex-shrink-0">
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Desktop Layout - Existing Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {onSelectionChange && (
                <th className="py-3 px-4 w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={input => {
                      if (input) input.indeterminate = someSelected || false
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
              )}
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Cliente</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Temperatura</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Score</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Tags</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Próximo Evento</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Prioridade</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map((lead) => {
              const attention = needsAttention(lead)
              const nextEvent = getNextEvent(lead)
              
              return (
                <tr 
                  key={lead.id} 
                  className={`hover:bg-gray-50 transition-all duration-150 ${attention ? 'bg-orange-50' : ''} ${selectedLeads.includes(lead.id) ? 'bg-indigo-50/70 ring-1 ring-inset ring-indigo-100' : ''}`}
                >
                  {onSelectionChange && (
                    <td className="py-4 px-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={(e) => handleSelectOne(lead.id, e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar with initials */}
                      <div className={`w-10 h-10 rounded-full ${getAvatarColor(lead.name)} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                        {getInitials(lead.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{lead.name}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          {lead.phone && (
                            <span className="truncate">{lead.phone}</span>
                          )}
                          {attention && (
                            <span className="text-amber-600 font-medium whitespace-nowrap">Sem atividade ({ATTENTION_THRESHOLD_DAYS}+ dias)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <TemperaturaIndicator temperatura={lead.temperatura} />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                          style={{ width: `${lead.score || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-8 text-right">{lead.score || 0}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {lead.tags && lead.tags.length > 0 ? (
                        lead.tags.slice(0, 2).map((lt) => (
                          <TagBadge 
                            key={lt.id}
                            name={lt.tag.name}
                            color={lt.tag.color}
                            size="xs"
                          />
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                      {lead.tags && lead.tags.length > 2 && (
                        <span className="text-xs text-gray-500">+{lead.tags.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {nextEvent ? (
                      <div className="text-sm">
                        <p className="text-gray-900 font-medium">{nextEvent.tipo}</p>
                        <p className="text-gray-500 text-xs">{formatDate(nextEvent.dataHora)}</p>
                      </div>
                    ) : lead.proximoContato ? (
                      <div className="text-sm">
                        <p className="text-gray-900 font-medium">Follow-up</p>
                        <p className="text-gray-500 text-xs">{formatDate(lead.proximoContato)}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {lead.kanbanColumn ? (
                      <KanbanColumnBadge column={lead.kanbanColumn} size="sm" />
                    ) : (
                      <span className="text-xs text-gray-400 italic">Sem coluna</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <PriorityBadge priority={lead.priority} size="sm" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {/* Quick action buttons */}
                      {lead.phone && (
                        <>
                          <a
                            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="WhatsApp"
                            className="p-1.5 hover:bg-green-50 rounded transition-colors"
                          >
                            <MessageCircle className="w-4 h-4 text-green-600" />
                          </a>
                          <a
                            href={`tel:${lead.phone}`}
                            title="Ligar"
                            className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Phone className="w-4 h-4 text-blue-600" />
                          </a>
                        </>
                      )}
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          title="Email"
                          className="p-1.5 hover:bg-purple-50 rounded transition-colors"
                        >
                          <Mail className="w-4 h-4 text-purple-600" />
                        </a>
                      )}
                      {onLeadClick && (
                        <button
                          onClick={() => onLeadClick(lead)}
                          title="Editar"
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
