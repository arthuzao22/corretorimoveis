import { Card } from '@/components/ui/Card'
import { LeadFilters } from '@/components/leads/LeadFilters'
import { LeadsList } from '@/components/leads/LeadsList'
import { Users } from 'lucide-react'
import { Suspense } from 'react'
import { TableSkeleton } from '@/components/skeletons'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface SearchParams {
  status?: string
  priority?: string
  origem?: string
  dateFrom?: string
  dateTo?: string
  cursor?: string
}

async function LeadsContent({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'CORRETOR' || !session.user.corretorId) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Acesso não autorizado</p>
        </div>
      </div>
    )
  }

  const { status, priority, origem, dateFrom, dateTo } = params
  const limit = 20

  // Build where clause
  const where: any = {
    corretorId: session.user.corretorId,
  }

  if (status) {
    where.status = status
  }

  if (priority) {
    where.priority = priority
  }

  if (origem) {
    where.origem = origem
  }

  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) {
      where.createdAt.gte = new Date(dateFrom)
    }
    if (dateTo) {
      where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z')
    }
  }

  // Fetch leads directly from database (server-side)
  const leadsQuery = await prisma.lead.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      message: true,
      origem: true,
      status: true,
      priority: true,
      anotacoes: true,
      dataContato: true,
      dataAgendamento: true,
      createdAt: true,
      updatedAt: true,
      imovel: {
        select: {
          id: true,
          titulo: true,
        },
      },
      corretor: {
        select: {
          id: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
      statusConfig: {
        select: {
          id: true,
          nome: true,
          cor: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit + 1, // Fetch one extra to check for next page
  })

  // Check if there's a next page
  const hasNextPage = leadsQuery.length > limit
  const leads = hasNextPage ? leadsQuery.slice(0, -1) : leadsQuery
  const nextCursor = hasNextPage ? leads[leads.length - 1].id : null

  const pagination = {
    nextCursor,
    hasNextPage,
    limit,
  }

  // Calculate stats from current page
  const stats = {
    total: leads.length,
    novos: leads.filter((l: any) => l.status === 'NOVO').length,
    contatados: leads.filter((l: any) => l.status === 'CONTATADO').length,
    acompanhamento: leads.filter((l: any) => l.status === 'ACOMPANHAMENTO').length,
    visitaAgendada: leads.filter((l: any) => l.status === 'VISITA_AGENDADA').length,
    negociacao: leads.filter((l: any) => l.status === 'NEGOCIACAO').length,
    fechados: leads.filter((l: any) => l.status === 'FECHADO' || l.status === 'CONVERTIDO').length,
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
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-600">Novos</p>
          <p className="text-2xl font-bold text-blue-600">{stats.novos}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-600">Contatados</p>
          <p className="text-2xl font-bold text-purple-600">{stats.contatados}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-600">Follow-up</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.acompanhamento}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-600">Visitas</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.visitaAgendada}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-600">Negociando</p>
          <p className="text-2xl font-bold text-orange-600">{stats.negociacao}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-600">Fechados</p>
          <p className="text-2xl font-bold text-green-600">{stats.fechados}</p>
        </div>
      </div>

      {/* Filters */}
      <LeadFilters currentFilters={params} />

      {/* Leads List */}
      <LeadsList
        initialLeads={leads}
        initialPagination={pagination}
        filters={params}
      />
    </div>
  )
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <Suspense fallback={<TableSkeleton rows={8} />}>
      <LeadsContent searchParams={searchParams} />
    </Suspense>
  )
}
