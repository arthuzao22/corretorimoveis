'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { LeadTable } from '@/components/ui/LeadTable'
import { getMyLeads } from '@/server/actions/leads'
import { Users } from 'lucide-react'

type Lead = {
  id: string
  name: string
  email: string
  phone: string
  message?: string | null
  createdAt: Date
  imovel: {
    id: string
    titulo: string
    tipo: string
  }
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  const loadLeads = async () => {
    const result = await getMyLeads()
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Leads</h1>
          <p className="text-gray-600 mt-1">
            {leads.length} {leads.length === 1 ? 'lead recebido' : 'leads recebidos'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg">
          <Users className="w-5 h-5" />
          <span className="font-semibold">{leads.length}</span>
        </div>
      </div>

      {leads.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Você ainda não recebeu nenhum lead.</p>
            <p className="text-sm text-gray-400 mt-2">
              Os leads aparecem quando alguém demonstra interesse em seus imóveis.
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <LeadTable leads={leads} />
        </Card>
      )}
    </div>
  )
}
