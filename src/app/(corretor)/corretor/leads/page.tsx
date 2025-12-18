import { Card } from '@/components/ui/Card'
import { LeadFilters } from '@/components/leads/LeadFilters'
import { LeadsList } from '@/components/leads/LeadsList'
import { Users } from 'lucide-react'
import { Suspense } from 'react'
import { TableSkeleton } from '@/components/skeletons'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { getKanbanColumns } from '@/server/actions/kanban'

export const dynamic = 'force-dynamic'

interface SearchParams {
  kanbanColumnId?: string
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

  // Get kanban columns for filter
  const columnsResult = await getKanbanColumns()
  const kanbanColumns = columnsResult.success ? columnsResult.columns || [] : []

  const { kanbanColumnId, priority, origem, dateFrom, dateTo } = params
  const limit = 20

  // Build where clause
  const where: any = {
    corretorId: session.user.corretorId,
  }

  if (kanbanColumnId) {
    where.kanbanColumnId = kanbanColumnId
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
      description: true,
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
      kanbanColumn: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      tags: {
        select: {
          id: true,
          tag: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      },
      eventos: {
        select: {
          id: true,
          tipo: true,
          dataHora: true,
          observacao: true,
          completed: true,
          imovel: {
            select: {
              titulo: true,
            },
          },
        },
        orderBy: {
          dataHora: 'asc',
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

  // Calculate stats from Kanban columns
  const columnStats = kanbanColumns.map(column => ({
    id: column.id,
    name: column.name,
    color: column.color,
    count: leads.filter((l: any) => l.kanbanColumnId === column.id).length,
  }))

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

      {/* Stats Cards - Kanban Columns */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {columnStats.map((stat) => (
          <div
            key={stat.id}
            className="bg-white rounded-lg p-4 border-l-4 shadow-sm hover:shadow-md transition-shadow"
            style={{ borderLeftColor: stat.color || '#6b7280' }}
          >
            <p className="text-sm text-gray-600">{stat.name}</p>
            <p className="text-2xl font-bold" style={{ color: stat.color || '#6b7280' }}>
              {stat.count}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <LeadFilters currentFilters={params} kanbanColumns={kanbanColumns} />

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
