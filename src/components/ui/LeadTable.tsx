import React from 'react'
import { Mail, Phone, MessageCircle, Users, Edit } from 'lucide-react'
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

// Helper to get avatar color based on name
const getAvatarColor = (name: string) => {
  const colors = [
    'bg-purple-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500',
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

// Temperature indicator component
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

  // Check if lead needs attention (no interaction for 3+ days)
  const needsAttention = (lead: Lead) => {
    const lastInteraction = lead.ultimaInteracao || lead.dataContato || lead.createdAt
    if (!lastInteraction) return false
    
    const date = typeof lastInteraction === 'string' ? new Date(lastInteraction) : lastInteraction
    const daysSince = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
    return daysSince >= 3
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
    <div className="overflow-x-auto">
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
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
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
                className={`hover:bg-gray-50 transition-colors ${attention ? 'bg-orange-50' : ''} ${selectedLeads.includes(lead.id) ? 'bg-purple-50' : ''}`}
              >
                {onSelectionChange && (
                  <td className="py-4 px-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={(e) => handleSelectOne(lead.id, e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
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
                          <span className="text-orange-600 font-medium whitespace-nowrap">⚠️ Sem contato há 3+ dias</span>
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
  )
}
