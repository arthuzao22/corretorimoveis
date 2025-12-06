import React from 'react'
import { Mail, Phone, Calendar } from 'lucide-react'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  message?: string | null
  createdAt: Date
  imovel: {
    titulo: string
  }
}

interface LeadTableProps {
  leads: Lead[]
}

export function LeadTable({ leads }: LeadTableProps) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">Nenhum lead ainda</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Cliente</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Contato</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Imóvel</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Data</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-4 px-4">
                <div>
                  <p className="font-medium text-gray-900">{lead.name}</p>
                  {lead.message && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{lead.message}</p>
                  )}
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${lead.email}`} className="hover:text-blue-600">
                      {lead.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${lead.phone}`} className="hover:text-blue-600">
                      {lead.phone}
                    </a>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <p className="text-sm text-blue-600 font-medium">{lead.imovel.titulo}</p>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Users({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}
