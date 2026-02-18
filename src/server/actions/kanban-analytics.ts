'use server'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
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

    const where: Prisma.LeadWhereInput = {}

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

    const columnIds = board.columns.map(c => c.id)
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

    // PERFORMANCE: 2 parallel queries instead of N+1+N waterfall (was 100+ queries)
    const [leadsGrouped, allMoves] = await Promise.all([
      // Single groupBy replaces N individual count queries
      prisma.lead.groupBy({
        by: ['kanbanColumnId'],
        where: {
          ...where,
          kanbanColumnId: { in: columnIds }
        },
        _count: { id: true }
      }),
      // Single query for ALL KANBAN_MOVED entries replaces N*M individual queries
      prisma.leadTimeline.findMany({
        where: {
          action: 'KANBAN_MOVED',
          lead: where,
        },
        select: {
          leadId: true,
          createdAt: true,
          metadata: true,
        },
        orderBy: { createdAt: 'asc' }
      }),
    ])

    // Build leadsPerColumn from groupBy result
    const columnCountMap = new Map(
      leadsGrouped.map(g => [g.kanbanColumnId, g._count.id])
    )

    const leadsPerColumn = board.columns.map(column => ({
      columnId: column.id,
      columnName: column.name,
      color: column.color,
      count: columnCountMap.get(column.id) || 0
    }))

    const totalLeads = leadsPerColumn.reduce((sum, c) => sum + c.count, 0)
    const closedCount = closedColumns.reduce((sum, c) => sum + (columnCountMap.get(c.id) || 0), 0)
    const lostCount = lostColumns.reduce((sum, c) => sum + (columnCountMap.get(c.id) || 0), 0)
    const finalLeadsCount = finalColumns.reduce((sum, c) => sum + (columnCountMap.get(c.id) || 0), 0)

    // PERFORMANCE: Calculate avg time per column from pre-fetched moves (pure in-memory)
    // Group moves by leadId for efficient next-move lookups
    const movesByLead = new Map<string, Array<{ createdAt: Date; toColumnId: string }>>()
    for (const move of allMoves) {
      const metadata = move.metadata as Record<string, string> | null
      const toColumnId = metadata?.toColumnId
      if (!toColumnId) continue

      if (!movesByLead.has(move.leadId)) {
        movesByLead.set(move.leadId, [])
      }
      movesByLead.get(move.leadId)!.push({
        createdAt: move.createdAt,
        toColumnId,
      })
    }

    // Calculate avg time per column — all in-memory, zero additional queries
    const avgTimePerColumn = board.columns.map(column => {
      let totalHours = 0
      let count = 0

      for (const [, leadMoves] of movesByLead) {
        // leadMoves are already sorted by createdAt (from query orderBy)
        for (let i = 0; i < leadMoves.length; i++) {
          if (leadMoves[i].toColumnId === column.id) {
            // Find next move = next item in the sorted array
            const endTime = i + 1 < leadMoves.length
              ? leadMoves[i + 1].createdAt
              : new Date()
            const hours = (endTime.getTime() - leadMoves[i].createdAt.getTime()) / (1000 * 60 * 60)
            totalHours += hours
            count++
          }
        }
      }

      const avgHours = count > 0 ? totalHours / count : 0

      return {
        columnId: column.id,
        columnName: column.name,
        avgHours: Math.round(avgHours * 10) / 10,
        avgDays: Math.round((avgHours / 24) * 10) / 10
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
          user: { select: { name: true } },
          _count: { select: { leads: true } }
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
        closedVsLostRatio: (closedCount + lostCount) > 0
          ? Math.round((closedCount / (closedCount + lostCount)) * 100 * 10) / 10
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
