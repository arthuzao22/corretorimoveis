'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

interface KanbanFilters {
  dateFrom?: string
  dateTo?: string
  agentId?: string
  boardId?: string
}

export async function getKanbanMetrics(filters?: KanbanFilters) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return { success: false, error: 'Não autorizado' }
    }

    const where: any = {}

    // Apply filters
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo + 'T23:59:59.999Z')
      }
    }

    // Filter by agent
    if (filters?.agentId) {
      if (session.user.role !== 'ADMIN') {
        return { success: false, error: 'Acesso negado' }
      }
      where.corretorId = filters.agentId
    } else if (session.user.role === 'CORRETOR') {
      where.corretorId = session.user.corretorId
    }

    // Get board with columns
    const board = await prisma.kanbanBoard.findFirst({
      where: filters?.boardId ? { id: filters.boardId } : { isGlobal: true },
      include: {
        columns: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!board) {
      return { success: false, error: 'Board não encontrado' }
    }

    // Get leads per column
    const leadsPerColumn = await Promise.all(
      board.columns.map(async (column) => {
        const count = await prisma.lead.count({
          where: {
            ...where,
            kanbanColumnId: column.id
          }
        })

        return {
          columnId: column.id,
          columnName: column.name,
          color: column.color,
          count
        }
      })
    )

    // Get total leads
    const totalLeads = await prisma.lead.count({ where })

    // Get closed vs lost
    const finalColumns = board.columns.filter(c => c.isFinal)
    const closedColumns = finalColumns.filter(c => 
      c.name.toLowerCase().includes('fechado') || 
      c.name.toLowerCase().includes('ganho') ||
      c.name.toLowerCase().includes('convertido')
    )
    const lostColumns = finalColumns.filter(c => 
      c.name.toLowerCase().includes('perdido') ||
      c.name.toLowerCase().includes('cancelado')
    )

    const closedCount = await prisma.lead.count({
      where: {
        ...where,
        kanbanColumnId: { in: closedColumns.map(c => c.id) }
      }
    })

    const lostCount = await prisma.lead.count({
      where: {
        ...where,
        kanbanColumnId: { in: lostColumns.map(c => c.id) }
      }
    })

    // Calculate average time per column using timeline data
    const avgTimePerColumn = await Promise.all(
      board.columns.map(async (column) => {
        const moves = await prisma.leadTimeline.findMany({
          where: {
            action: 'KANBAN_MOVED',
            lead: where,
            metadata: {
              path: ['toColumnId'],
              equals: column.id
            }
          },
          include: {
            lead: {
              select: {
                id: true,
                createdAt: true
              }
            }
          }
        })

        // Calculate time spent (simplified - from entry to next move or now)
        let totalHours = 0
        let count = 0

        for (const move of moves) {
          // Find next move for this lead
          const nextMove = await prisma.leadTimeline.findFirst({
            where: {
              leadId: move.leadId,
              action: 'KANBAN_MOVED',
              createdAt: { gt: move.createdAt }
            },
            orderBy: { createdAt: 'asc' }
          })

          const endTime = nextMove ? nextMove.createdAt : new Date()
          const hours = (endTime.getTime() - move.createdAt.getTime()) / (1000 * 60 * 60)
          
          totalHours += hours
          count++
        }

        const avgHours = count > 0 ? totalHours / count : 0

        return {
          columnId: column.id,
          columnName: column.name,
          avgHours: Math.round(avgHours * 10) / 10,
          avgDays: Math.round((avgHours / 24) * 10) / 10
        }
      })
    )

    // Conversion rate (simplified - leads that reached final columns)
    const finalLeadsCount = await prisma.lead.count({
      where: {
        ...where,
        kanbanColumnId: { in: finalColumns.map(c => c.id) }
      }
    })

    const conversionRate = totalLeads > 0 
      ? Math.round((closedCount / totalLeads) * 100 * 10) / 10 
      : 0

    // Leads per agent (admin only)
    let leadsPerAgent: Array<{ agentId: string; agentName: string; totalLeads: number }> = []
    if (session.user.role === 'ADMIN') {
      const agents = await prisma.corretorProfile.findMany({
        include: {
          user: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              leads: true
            }
          }
        }
      })

      leadsPerAgent = agents.map(agent => ({
        agentId: agent.id,
        agentName: agent.user.name,
        totalLeads: agent._count.leads
      }))
    }

    return {
      success: true,
      metrics: {
        totalLeads,
        leadsPerColumn,
        closedCount,
        lostCount,
        closedVsLostRatio: totalLeads > 0 
          ? Math.round((closedCount / (closedCount + lostCount || 1)) * 100 * 10) / 10 
          : 0,
        conversionRate,
        avgTimePerColumn,
        leadsPerAgent,
        finalLeadsCount
      }
    }
  } catch (error) {
    console.error('Get kanban metrics error:', error)
    return { success: false, error: 'Erro ao buscar métricas' }
  }
}
