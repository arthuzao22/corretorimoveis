import { Card } from '@/components/ui/Card'
import { LeadFilters } from '@/components/leads/LeadFilters'
import { LeadsList } from '@/components/leads/LeadsList'
import { Users } from 'lucide-react'
import { Suspense } from 'react'
import { TableSkeleton } from '@/components/skeletons'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export const dynamic = 'force-dynamic'

async function LeadsContent({ searchParams }: { searchParams: any }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'CORRETOR') {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Acesso não autorizado</p>
        </div>
      </div>
    )
  }

  const { statusId, origem } = searchParams

  // Build query params for API
  const params = new URLSearchParams()
  if (statusId) params.set('statusId', statusId)
  if (origem) params.set('origem', origem)
  params.set('limit', '20')

  // Fetch from API
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  // We need to pass the session cookie for authenticated requests
  const headers: HeadersInit = {}
  
  const response = await fetch(`${baseUrl}/api/leads?${params.toString()}`, {
    cache: 'no-store',
    headers,
  })
  
  const data = await response.json()

  const leads = data.success ? data.leads : []
  const pagination = data.pagination || { nextCursor: null, hasNextPage: false, limit: 20 }

  // Calculate stats from all leads (we'd need a separate endpoint for total stats)
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
            {leads.length} {leads.length === 1 ? 'lead' : 'leads'} {pagination.hasNextPage ? '(mostrando os primeiros)' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg">
          <Users className="w-5 h-5" />
          <span className="font-semibold">{leads.length}+</span>
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
      <LeadFilters currentFilters={searchParams} />

      {/* Leads List */}
      <LeadsList
        initialLeads={leads}
        initialPagination={pagination}
        filters={searchParams}
      />
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
