import React from 'react'
import { Mail, Phone, Calendar, Users, Edit } from 'lucide-react'
import { StatusBadge, PriorityBadge } from '@/components/leads/StatusBadge'
import { LeadStatus, LeadPriority } from '@prisma/client'

interface Lead {
  id: string
  name: string
  email?: string | null
  phone: string
  message?: string | null
  status: LeadStatus
  priority: LeadPriority
  createdAt: Date | string
  updatedAt?: Date | string
  dataContato?: Date | string | null
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
  origem?: string | null
}

interface LeadTableProps {
  leads: Lead[]
  onLeadClick?: (lead: Lead) => void
}

export function LeadTable({ leads, onLeadClick }: LeadTableProps) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">Nenhum lead ainda</p>
      </div>
    )
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '-'
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('pt-BR')
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Cliente</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Imóvel</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Último Contato</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Corretor</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Prioridade</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-4 px-4">
                <div>
                  <p className="font-medium text-gray-900">{lead.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600"
                      >
                        <Phone className="w-3 h-3" />
                        {lead.phone}
                      </a>
                    )}
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600"
                      >
                        <Mail className="w-3 h-3" />
                        {lead.email}
                      </a>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                {lead.imovel ? (
                  <p className="text-sm text-blue-600 font-medium truncate max-w-xs">
                    {lead.imovel.titulo}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    {lead.origem === 'landing' ? 'Contato via Landing' : 'Sem imóvel'}
                  </p>
                )}
              </td>
              <td className="py-4 px-4">
                <div className="text-sm text-gray-600">
                  {formatDate(lead.dataContato || lead.updatedAt)}
                </div>
              </td>
              <td className="py-4 px-4">
                {lead.corretor ? (
                  <p className="text-sm text-gray-700">{lead.corretor.user.name}</p>
                ) : (
                  <p className="text-sm text-gray-400">-</p>
                )}
              </td>
              <td className="py-4 px-4">
                <StatusBadge status={lead.status} size="sm" />
              </td>
              <td className="py-4 px-4">
                <PriorityBadge priority={lead.priority} size="sm" />
              </td>
              <td className="py-4 px-4">
                {onLeadClick && (
                  <button
                    onClick={() => onLeadClick(lead)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
