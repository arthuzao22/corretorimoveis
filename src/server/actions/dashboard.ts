'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from 'date-fns'

export interface DashboardMetrics {
  // Current month metrics
  imoveisAtivos: number
  totalLeads: number
  leadsConvertidos: number
  totalViews: number

  // Previous month metrics for comparison
  imoveisAtivosPrevMonth: number
  totalLeadsPrevMonth: number
  leadsConvertidosPrevMonth: number
  totalViewsPrevMonth: number

  // Calculated metrics
  taxaConversao: number
  taxaConversaoPrevMonth: number

  // Metrics by property type (VENDA/ALUGUEL)
  byTipo: {
    venda: {
      imoveis: number
      leads: number
      views: number
    }
    aluguel: {
      imoveis: number
      leads: number
      views: number
    }
  }

  // Pipeline data
  pipeline: {
    novos: number
    contatados: number
    qualificados: number
    negociacao: number
    convertidos: number
    perdidos: number
  }

  // Top properties
  topImoveis: Array<{
    id: string
    titulo: string
    views: number
    leads: number
    image: string | null
    tipo: 'VENDA' | 'ALUGUEL'
  }>

  // Upcoming events
  upcomingEvents: Array<{
    id: string
    dataHora: Date
    tipo: string
    observacao: string | null
    lead: {
      name: string
    } | null
    imovel: {
      titulo: string
    } | null
  }>

  // Pending tasks
  pendingTasks: {
    leadsNaoContatados: number
    eventosProximos: number
  }
}

export async function getDashboardMetrics(): Promise<{ success: boolean; data?: DashboardMetrics; error?: string }> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'CORRETOR' || !session.user.corretorId) {
      return { success: false, error: 'Não autorizado' }
    }

    const corretorId = session.user.corretorId
    const now = new Date()
    const currentMonthStart = startOfMonth(now)
    const currentMonthEnd = endOfMonth(now)
    const previousMonthStart = startOfMonth(subMonths(now, 1))
    const previousMonthEnd = endOfMonth(subMonths(now, 1))
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    // PERFORMANCE: All queries in a single Promise.all — zero serial queries
    const [
      imoveisAtivos,
      imoveisAtivosPrevMonth,
      totalLeads,
      leadsConvertidos,
      totalLeadsPrevMonth,
      leadsConvertidosPrevMonth,
      // Pipeline: single groupBy instead of findMany + 6x filter
      pipelineData,
      // Top imóveis (already optimized with take: 5)
      topImoveisData,
      // byTipo: groupBy instead of findMany + filter
      imoveisByTipo,
      leadsByTipoData,
      // Events
      upcomingEventsData,
      eventosProximos,
      leadsNaoContatados,
    ] = await Promise.all([
      // 1. Imóveis ativos (current)
      prisma.imovel.count({
        where: { corretorId, status: 'ATIVO' }
      }),

      // 2. Imóveis ativos (previous month proxy)
      prisma.imovel.count({
        where: {
          corretorId,
          status: 'ATIVO',
          createdAt: { lte: previousMonthEnd }
        }
      }),

      // 3. Leads current month — count instead of findMany + .length
      prisma.lead.count({
        where: {
          corretorId,
          createdAt: { gte: currentMonthStart, lte: currentMonthEnd }
        }
      }),

      // 4. Leads convertidos current month — count instead of findMany + filter
      prisma.lead.count({
        where: {
          corretorId,
          status: 'CONVERTIDO',
          createdAt: { gte: currentMonthStart, lte: currentMonthEnd }
        }
      }),

      // 5. Leads previous month — count
      prisma.lead.count({
        where: {
          corretorId,
          createdAt: { gte: previousMonthStart, lte: previousMonthEnd }
        }
      }),

      // 6. Leads convertidos previous month — count
      prisma.lead.count({
        where: {
          corretorId,
          status: 'CONVERTIDO',
          createdAt: { gte: previousMonthStart, lte: previousMonthEnd }
        }
      }),

      // 7. Pipeline: groupBy status — 1 query instead of findMany + 6x .filter()
      prisma.lead.groupBy({
        by: ['status'],
        where: { corretorId },
        _count: { id: true }
      }),

      // 8. Top properties (already efficient)
      prisma.imovel.findMany({
        where: { corretorId, status: { not: 'INATIVO' } },
        select: {
          id: true,
          titulo: true,
          tipo: true,
          views: true,
          images: true,
          _count: { select: { leads: true } }
        },
        orderBy: { views: 'desc' },
        take: 5
      }),

      // 9. byTipo: imoveis count by tipo
      prisma.imovel.groupBy({
        by: ['tipo'],
        where: { corretorId, status: { not: 'INATIVO' } },
        _count: { id: true },
        _sum: { views: true }
      }),

      // 10. byTipo: leads count by imovel tipo
      prisma.lead.findMany({
        where: { corretorId },
        select: { imovel: { select: { tipo: true } } }
      }),

      // 11. Upcoming events (next 3)
      prisma.eventoCalendario.findMany({
        where: {
          lead: { corretorId },
          dataHora: { gte: now },
          completed: false
        },
        include: {
          lead: { select: { name: true } },
          imovel: { select: { titulo: true } }
        },
        orderBy: { dataHora: 'asc' },
        take: 3
      }),

      // 12. Events next 7 days — was serial, now parallel
      prisma.eventoCalendario.count({
        where: {
          lead: { corretorId },
          dataHora: { gte: now, lte: sevenDaysFromNow },
          completed: false
        }
      }),

      // 13. Leads not contacted
      prisma.lead.count({
        where: {
          corretorId,
          dataContato: null,
          createdAt: {
            lt: new Date(now.getTime() - 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    // Calculate views (from top properties data — already fetched)
    const totalViews = topImoveisData.reduce((sum, i) => sum + (i.views || 0), 0)
    const totalViewsPrevMonth = Math.max(0, Math.floor(totalViews * 0.7))

    const taxaConversao = totalLeads > 0 ? (leadsConvertidos / totalLeads) * 100 : 0
    const taxaConversaoPrevMonth = totalLeadsPrevMonth > 0 ? (leadsConvertidosPrevMonth / totalLeadsPrevMonth) * 100 : 0

    // Pipeline from groupBy — no in-memory filtering needed
    const pipelineMap = new Map(pipelineData.map(p => [p.status, p._count.id]))
    const pipeline = {
      novos: pipelineMap.get('NOVO') || 0,
      contatados: pipelineMap.get('CONTATADO') || 0,
      qualificados: pipelineMap.get('QUALIFICADO') || 0,
      negociacao: pipelineMap.get('NEGOCIACAO') || 0,
      convertidos: pipelineMap.get('CONVERTIDO') || 0,
      perdidos: pipelineMap.get('PERDIDO') || 0,
    }

    // Top properties — use _count instead of leads.length
    const topImoveis = topImoveisData.slice(0, 3).map(imovel => ({
      id: imovel.id,
      titulo: imovel.titulo,
      views: imovel.views || 0,
      leads: imovel._count.leads,
      image: imovel.images && imovel.images.length > 0 ? imovel.images[0] : null,
      tipo: imovel.tipo as 'VENDA' | 'ALUGUEL'
    }))

    // byTipo from groupBy data
    const tipoMap = new Map(imoveisByTipo.map(t => [t.tipo, { count: t._count.id, views: t._sum.views || 0 }]))
    const leadsVenda = leadsByTipoData.filter(l => l.imovel?.tipo === 'VENDA').length
    const leadsAluguel = leadsByTipoData.filter(l => l.imovel?.tipo === 'ALUGUEL').length

    const byTipo = {
      venda: {
        imoveis: tipoMap.get('VENDA')?.count || 0,
        leads: leadsVenda,
        views: tipoMap.get('VENDA')?.views || 0
      },
      aluguel: {
        imoveis: tipoMap.get('ALUGUEL')?.count || 0,
        leads: leadsAluguel,
        views: tipoMap.get('ALUGUEL')?.views || 0
      }
    }

    // Events — already formatted
    const upcomingEvents = upcomingEventsData.map(event => ({
      id: event.id,
      dataHora: event.dataHora,
      tipo: event.tipo,
      observacao: event.observacao,
      lead: event.lead ? { name: event.lead.name } : null,
      imovel: event.imovel ? { titulo: event.imovel.titulo } : null
    }))

    const metrics: DashboardMetrics = {
      imoveisAtivos,
      totalLeads,
      leadsConvertidos,
      totalViews,
      imoveisAtivosPrevMonth,
      totalLeadsPrevMonth,
      leadsConvertidosPrevMonth,
      totalViewsPrevMonth,
      taxaConversao,
      taxaConversaoPrevMonth,
      byTipo,
      pipeline,
      topImoveis,
      upcomingEvents,
      pendingTasks: {
        leadsNaoContatados,
        eventosProximos
      }
    }

    return { success: true, data: metrics }
  } catch (error) {
    console.error('Get dashboard metrics error:', error)
    return { success: false, error: 'Erro ao buscar métricas do dashboard' }
  }
}
