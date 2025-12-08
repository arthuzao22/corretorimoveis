import { getMyLeads } from '@/server/actions/leads'
import { Card } from '@/components/ui/Card'
import { LeadTable } from '@/components/ui/LeadTable'
import { LeadFilters } from '@/components/leads/LeadFilters'
import { Users } from 'lucide-react'
import { Suspense } from 'react'
import { TableSkeleton } from '@/components/skeletons'

export const dynamic = 'force-dynamic'

async function LeadsContent({ searchParams }: { searchParams: any }) {
  const status = searchParams.status || undefined
  const result = await getMyLeads({ status })
  const leads = result.success && result.leads ? result.leads : []

  // Calculate stats
  const stats = {
    total: leads.length,
    novos: leads.filter((l: any) => l.status === 'NOVO').length,
    contatados: leads.filter((l: any) => l.status === 'CONTATADO').length,
    qualificados: leads.filter((l: any) => l.status === 'QUALIFICADO').length,
    convertidos: leads.filter((l: any) => l.status === 'CONVERTIDO').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Leads</h1>
          <p className="text-gray-600 mt-1">
            {stats.total} {stats.total === 1 ? 'lead recebido' : 'leads recebidos'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg">
          <Users className="w-5 h-5" />
          <span className="font-semibold">{stats.total}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Novos</p>
          <p className="text-2xl font-bold text-blue-600">{stats.novos}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Contatados</p>
          <p className="text-2xl font-bold text-purple-600">{stats.contatados}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Qualificados</p>
          <p className="text-2xl font-bold text-orange-600">{stats.qualificados}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Convertidos</p>
          <p className="text-2xl font-bold text-green-600">{stats.convertidos}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Taxa Conv.</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.total > 0 ? Math.round((stats.convertidos / stats.total) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <LeadFilters currentStatus={status} />

      {/* Leads Table */}
      {leads.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {status ? 'Nenhum lead encontrado com este filtro.' : 'Você ainda não recebeu nenhum lead.'}
            </p>
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

export default function LeadsPage({ searchParams }: { searchParams: any }) {
  return (
    <Suspense fallback={<TableSkeleton rows={8} />}>
      <LeadsContent searchParams={searchParams} />
    </Suspense>
  )
}
