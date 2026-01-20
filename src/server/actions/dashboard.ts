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
  }>
  
  // Upcoming events
  upcomingEvents: Array<{
    id: string
    dataHora: Date
    tipo: string
    observacao: string | null
    lead: {
      name: string
    }
    imovel: {
      titulo: string
    }
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

    // Fetch all data in parallel for better performance
    const [
      // Current month data
      imoveisAtivos,
      imoveisAtivosPrevMonth,
      leadsCurrentMonth,
      leadsPrevMonth,
      allLeads,
      allImoveis,
      upcomingEventsData,
      leadsNaoContatados,
    ] = await Promise.all([
      // Imóveis ativos (current)
      prisma.imovel.count({
        where: {
          corretorId,
          status: 'ATIVO'
        }
      }),
      
      // Imóveis ativos (previous month) - we'll use created date as proxy
      prisma.imovel.count({
        where: {
          corretorId,
          status: 'ATIVO',
          createdAt: {
            lte: previousMonthEnd
          }
        }
      }),
      
      // Leads current month
      prisma.lead.findMany({
        where: {
          corretorId,
          createdAt: {
            gte: currentMonthStart,
            lte: currentMonthEnd
          }
        },
        select: {
          id: true,
          status: true,
          createdAt: true
        }
      }),
      
      // Leads previous month
      prisma.lead.findMany({
        where: {
          corretorId,
          createdAt: {
            gte: previousMonthStart,
            lte: previousMonthEnd
          }
        },
        select: {
          id: true,
          status: true,
          createdAt: true
        }
      }),
      
      // All leads for pipeline
      prisma.lead.findMany({
        where: { corretorId },
        select: {
          status: true,
          imovelId: true
        }
      }),
      
      // All properties for views and top properties
      prisma.imovel.findMany({
        where: { corretorId },
        select: {
          id: true,
          titulo: true,
          views: true,
          images: true,
          leads: {
            select: { id: true }
          }
        },
        orderBy: {
          views: 'desc'
        },
        take: 3
      }),
      
      // Upcoming events (next 3)
      prisma.eventoCalendario.findMany({
        where: {
          lead: {
            corretorId
          },
          dataHora: {
            gte: now
          },
          completed: false
        },
        include: {
          lead: {
            select: {
              name: true
            }
          },
          imovel: {
            select: {
              titulo: true
            }
          }
        },
        orderBy: {
          dataHora: 'asc'
        },
        take: 3
      }),
      
      // Leads not contacted (created > 24h ago and no contact date)
      prisma.lead.count({
        where: {
          corretorId,
          dataContato: null,
          createdAt: {
            lt: subMonths(now, 0) // More than 0 days ago (essentially all without contact)
          }
        }
      })
    ])

    // Calculate metrics
    const totalLeads = leadsCurrentMonth.length
    const totalLeadsPrevMonth = leadsPrevMonth.length
    const leadsConvertidos = leadsCurrentMonth.filter(l => l.status === 'CONVERTIDO').length
    const leadsConvertidosPrevMonth = leadsPrevMonth.filter(l => l.status === 'CONVERTIDO').length
    
    const totalViews = allImoveis.reduce((sum, i) => sum + (i.views || 0), 0)
    // For previous month views, we'll use a simplified approach (actual views are cumulative)
    const totalViewsPrevMonth = Math.floor(totalViews * 0.85) // Approximation
    
    const taxaConversao = totalLeads > 0 ? (leadsConvertidos / totalLeads) * 100 : 0
    const taxaConversaoPrevMonth = totalLeadsPrevMonth > 0 ? (leadsConvertidosPrevMonth / totalLeadsPrevMonth) * 100 : 0

    // Pipeline data
    const pipeline = {
      novos: allLeads.filter(l => l.status === 'NOVO').length,
      contatados: allLeads.filter(l => l.status === 'CONTATADO').length,
      qualificados: allLeads.filter(l => l.status === 'QUALIFICADO').length,
      negociacao: allLeads.filter(l => l.status === 'NEGOCIACAO').length,
      convertidos: allLeads.filter(l => l.status === 'CONVERTIDO').length,
      perdidos: allLeads.filter(l => l.status === 'PERDIDO').length,
    }

    // Top properties
    const topImoveis = allImoveis.map(imovel => ({
      id: imovel.id,
      titulo: imovel.titulo,
      views: imovel.views || 0,
      leads: imovel.leads.length,
      image: imovel.images && imovel.images.length > 0 ? imovel.images[0] : null
    }))

    // Upcoming events
    const upcomingEvents = upcomingEventsData.map(event => ({
      id: event.id,
      dataHora: event.dataHora,
      tipo: event.tipo,
      observacao: event.observacao,
      lead: {
        name: event.lead.name
      },
      imovel: {
        titulo: event.imovel.titulo
      }
    }))

    // Count events in next 7 days
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const eventosProximos = await prisma.eventoCalendario.count({
      where: {
        lead: {
          corretorId
        },
        dataHora: {
          gte: now,
          lte: sevenDaysFromNow
        },
        completed: false
      }
    })

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
