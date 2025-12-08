'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { getAllLeads } from '@/server/actions/leads'

type Lead = {
  id: string
  name: string
  email: string
  phone: string
  message?: string
  createdAt: Date
  imovel?: {
    id: string
    titulo: string
    tipo: string
  } | null
  corretor: {
    user: {
      name: string
      email: string
    }
  }
}

export default function LeadsAdminPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  const loadLeads = async () => {
    const result = await getAllLeads()
    if (result.success && result.leads) {
      setLeads(result.leads as any)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadLeads()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Todos os Leads</h1>

      {leads.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">
            Nenhum lead registrado ainda.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <Card key={lead.id}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {lead.name}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Email:</span> {lead.email}
                    </p>
                    <p>
                      <span className="font-medium">Telefone:</span> {lead.phone}
                    </p>
                    <p>
                      <span className="font-medium">Imóvel de interesse:</span>{' '}
                      {lead.imovel?.titulo || 'Imóvel não informado / removido'}
                    </p>
                    <p>
                      <span className="font-medium">Corretor:</span>{' '}
                      {lead.corretor.user.name} ({lead.corretor.user.email})
                    </p>
                    {lead.message && (
                      <p>
                        <span className="font-medium">Mensagem:</span> {lead.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(lead.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
