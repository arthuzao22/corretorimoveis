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
  search?: string // Busca textual
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

  const { kanbanColumnId, priority, origem, dateFrom, dateTo, search } = params
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

  // Add text search support
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } }
    ]
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
      // Novos campos CRM
      score: true,
      temperatura: true,
      ultimaInteracao: true,
      proximoContato: true,
      valorInteresse: true,
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Meus Leads</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {leads.length} {leads.length === 1 ? 'lead encontrado' : 'leads encontrados'} {pagination.hasNextPage ? '(mostrando os primeiros)' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-xl border border-indigo-100">
          <Users className="w-5 h-5" />
          <span className="font-bold">{leads.length}</span>
          <span className="text-indigo-500 text-sm">leads</span>
        </div>
      </div>

      {/* Stats Cards - Kanban Columns */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {columnStats.map((stat) => (
          <div
            key={stat.id}
            className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: stat.color || '#6b7280' }}
              />
              <p className="text-sm text-slate-600 truncate">{stat.name}</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">
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
