'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { revalidatePath } from 'next/cache'

// =============================================
// VALIDATION SCHEMAS
// =============================================

const moveLeadSchema = z.object({
  leadId: z.string(),
  columnId: z.string(),
})

const createColumnSchema = z.object({
  boardId: z.string(),
  name: z.string().min(1),
  order: z.number().int().min(0),
  color: z.string().optional(),
  isInitial: z.boolean().optional(),
  isFinal: z.boolean().optional(),
})

const updateColumnSchema = z.object({
  columnId: z.string(),
  name: z.string().min(1).optional(),
  order: z.number().int().min(0).optional(),
  color: z.string().optional(),
  isInitial: z.boolean().optional(),
  isFinal: z.boolean().optional(),
})

const updatePermissionsSchema = z.object({
  userId: z.string(),
  canEditBoard: z.boolean().optional(),
  canEditColumns: z.boolean().optional(),
})

// =============================================
// KANBAN BOARD OPERATIONS
// =============================================

export async function getKanbanBoard(boardId?: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return { success: false, error: 'Não autorizado' }
    }

    // If no boardId provided, get the global board
    let board
    if (boardId) {
      board = await prisma.kanbanBoard.findUnique({
        where: { id: boardId },
        include: {
          columns: {
            include: {
              _count: {
                select: { leads: true }
              }
            },
            orderBy: { order: 'asc' }
          }
        }
      })

      // Check permissions
      if (board && !board.isGlobal) {
        if (session.user.role !== 'ADMIN' && board.ownerId !== session.user.id) {
          return { success: false, error: 'Acesso negado' }
        }
      }
    } else {
      // Get global board
      board = await prisma.kanbanBoard.findFirst({
        where: { isGlobal: true },
        include: {
          columns: {
            include: {
              _count: {
                select: { leads: true }
              }
            },
            orderBy: { order: 'asc' }
          }
        }
      })
    }

    if (!board) {
      return { success: false, error: 'Board não encontrado' }
    }

    // Get leads for each column
    const columnsWithLeads = await Promise.all(
      board.columns.map(async (column) => {
        const where: any = { kanbanColumnId: column.id }
        
        // Filter by corretor if not admin
        if (session.user.role === 'CORRETOR' && session.user.corretorId) {
          where.corretorId = session.user.corretorId
        }

        const leads = await prisma.lead.findMany({
          where,
          include: {
            imovel: {
              select: {
                id: true,
                titulo: true,
              }
            },
            corretor: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true,
                  }
                }
              }
            },
            kanbanColumn: {
              select: {
                id: true,
                name: true,
                color: true,
              }
            },
            tags: {
              select: {
                id: true,
                tag: {
                  select: {
                    id: true,
                    name: true,
                    color: true,
                  }
                }
              }
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
                  }
                }
              },
              orderBy: {
                dataHora: 'asc'
              }
            }
          },
          orderBy: { updatedAt: 'desc' }
        })

        return {
          ...column,
          leads,
          leadCount: leads.length
        }
      })
    )

    return {
      success: true,
      board: {
        ...board,
        columns: columnsWithLeads
      }
    }
  } catch (error) {
    console.error('Get kanban board error:', error)
    return { success: false, error: 'Erro ao buscar board' }
  }
}

// Helper function to get just columns for filters
export async function getKanbanColumns() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return { success: false, error: 'Não autorizado' }
    }

    // Get global board columns
    const board = await prisma.kanbanBoard.findFirst({
      where: { isGlobal: true },
      include: {
        columns: {
          select: {
            id: true,
            name: true,
            color: true,
            order: true,
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!board) {
      return { success: false, error: 'Board não encontrado' }
    }

    return { success: true, columns: board.columns }
  } catch (error) {
    console.error('Get kanban columns error:', error)
    return { success: false, error: 'Erro ao buscar colunas' }
  }
}

export async function moveLeadToColumn(data: z.infer<typeof moveLeadSchema>) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'CORRETOR' && session.user.role !== 'ADMIN')) {
      return { success: false, error: 'Não autorizado' }
    }

    const validatedData = moveLeadSchema.parse(data)

    // Verify lead ownership
    const lead = await prisma.lead.findUnique({
      where: { id: validatedData.leadId },
      include: {
        kanbanColumn: true
      }
    })

    if (!lead) {
      return { success: false, error: 'Lead não encontrado' }
    }

    if (session.user.role === 'CORRETOR' && lead.corretorId !== session.user.corretorId) {
      return { success: false, error: 'Acesso negado' }
    }

    // Get target column
    const targetColumn = await prisma.kanbanColumn.findUnique({
      where: { id: validatedData.columnId }
    })

    if (!targetColumn) {
      return { success: false, error: 'Coluna não encontrada' }
    }

    const oldColumnName = lead.kanbanColumn?.name || 'Sem coluna'

    // Update lead
    const updatedLead = await prisma.lead.update({
      where: { id: validatedData.leadId },
      data: {
        kanbanColumnId: validatedData.columnId,
        updatedAt: new Date()
      },
      include: {
        imovel: {
          select: {
            id: true,
            titulo: true
          }
        },
        kanbanColumn: true
      }
    })

    // Add timeline entry
    await prisma.leadTimeline.create({
      data: {
        leadId: validatedData.leadId,
        action: 'KANBAN_MOVED',
        description: `Lead movido de "${oldColumnName}" para "${targetColumn.name}"`,
        metadata: {
          fromColumn: oldColumnName,
          toColumn: targetColumn.name,
          fromColumnId: lead.kanbanColumnId,
          toColumnId: targetColumn.id
        }
      }
    })

    revalidatePath('/corretor/kanban')

    return { success: true, lead: updatedLead }
  } catch (error) {
    console.error('Move lead error:', error)
    return { success: false, error: 'Erro ao mover lead' }
  }
}

// =============================================
// COLUMN MANAGEMENT
// =============================================

export async function createColumn(data: z.infer<typeof createColumnSchema>) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return { success: false, error: 'Não autorizado' }
    }

    // Check permissions
    const canEdit = await checkColumnEditPermission(session.user)
    if (!canEdit) {
      return { success: false, error: 'Sem permissão para editar colunas' }
    }

    const validatedData = createColumnSchema.parse(data)

    // If setting as initial, unset other initial columns in the same board
    if (validatedData.isInitial) {
      await prisma.kanbanColumn.updateMany({
        where: { 
          boardId: validatedData.boardId,
          isInitial: true
        },
        data: { isInitial: false }
      })
    }

    const column = await prisma.kanbanColumn.create({
      data: validatedData
    })

    revalidatePath('/corretor/kanban')
    revalidatePath('/corretor/kanban/editor')

    return { success: true, column }
  } catch (error) {
    console.error('Create column error:', error)
    return { success: false, error: 'Erro ao criar coluna' }
  }
}

export async function updateColumn(data: z.infer<typeof updateColumnSchema>) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return { success: false, error: 'Não autorizado' }
    }

    // Check permissions
    const canEdit = await checkColumnEditPermission(session.user)
    if (!canEdit) {
      return { success: false, error: 'Sem permissão para editar colunas' }
    }

    const { columnId, ...updates } = updateColumnSchema.parse(data)

    // Get the column to find its boardId
    const existingColumn = await prisma.kanbanColumn.findUnique({
      where: { id: columnId },
      select: { boardId: true }
    })

    if (!existingColumn) {
      return { success: false, error: 'Coluna não encontrada' }
    }

    // If setting as initial, unset other initial columns in the same board
    if (updates.isInitial) {
      await prisma.kanbanColumn.updateMany({
        where: { 
          boardId: existingColumn.boardId,
          isInitial: true,
          id: { not: columnId }
        },
        data: { isInitial: false }
      })
    }

    const column = await prisma.kanbanColumn.update({
      where: { id: columnId },
      data: updates
    })

    revalidatePath('/corretor/kanban')
    revalidatePath('/corretor/kanban/editor')

    return { success: true, column }
  } catch (error) {
    console.error('Update column error:', error)
    return { success: false, error: 'Erro ao atualizar coluna' }
  }
}

export async function deleteColumn(columnId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Apenas administradores podem deletar colunas' }
    }

    // Check if column has leads
    const leadCount = await prisma.lead.count({
      where: { kanbanColumnId: columnId }
    })

    if (leadCount > 0) {
      return { success: false, error: `Esta coluna contém ${leadCount} leads. Mova-os antes de deletar.` }
    }

    await prisma.kanbanColumn.delete({
      where: { id: columnId }
    })

    revalidatePath('/corretor/kanban')
    revalidatePath('/corretor/kanban/editor')

    return { success: true }
  } catch (error) {
    console.error('Delete column error:', error)
    return { success: false, error: 'Erro ao deletar coluna' }
  }
}

export async function reorderColumns(boardId: string, columnOrders: { id: string; order: number }[]) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return { success: false, error: 'Não autorizado' }
    }

    // Check permissions
    const canEdit = await checkColumnEditPermission(session.user)
    if (!canEdit) {
      return { success: false, error: 'Sem permissão para editar colunas' }
    }

    // Update each column's order
    await Promise.all(
      columnOrders.map(({ id, order }) =>
        prisma.kanbanColumn.update({
          where: { id },
          data: { order }
        })
      )
    )

    revalidatePath('/corretor/kanban')
    revalidatePath('/corretor/kanban/editor')

    return { success: true }
  } catch (error) {
    console.error('Reorder columns error:', error)
    return { success: false, error: 'Erro ao reordenar colunas' }
  }
}

// =============================================
// PERMISSIONS
// =============================================

export async function getKanbanPermissions(userId?: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return { success: false, error: 'Não autorizado' }
    }

    const targetUserId = userId || session.user.id

    // Only admins can view other users' permissions
    if (session.user.role !== 'ADMIN' && targetUserId !== session.user.id) {
      return { success: false, error: 'Acesso negado' }
    }

    const permissions = await prisma.kanbanPermission.findUnique({
      where: { userId: targetUserId }
    })

    return {
      success: true,
      permissions: permissions || {
        canEditBoard: session.user.role === 'ADMIN',
        canEditColumns: session.user.role === 'ADMIN'
      }
    }
  } catch (error) {
    console.error('Get permissions error:', error)
    return { success: false, error: 'Erro ao buscar permissões' }
  }
}

export async function updateKanbanPermissions(data: z.infer<typeof updatePermissionsSchema>) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Apenas administradores podem atualizar permissões' }
    }

    const validatedData = updatePermissionsSchema.parse(data)

    const permissions = await prisma.kanbanPermission.upsert({
      where: { userId: validatedData.userId },
      create: {
        userId: validatedData.userId,
        canEditBoard: validatedData.canEditBoard ?? false,
        canEditColumns: validatedData.canEditColumns ?? false,
      },
      update: {
        canEditBoard: validatedData.canEditBoard,
        canEditColumns: validatedData.canEditColumns,
      }
    })

    return { success: true, permissions }
  } catch (error) {
    console.error('Update permissions error:', error)
    return { success: false, error: 'Erro ao atualizar permissões' }
  }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

async function checkColumnEditPermission(user: any): Promise<boolean> {
  if (user.role === 'ADMIN') return true

  const permissions = await prisma.kanbanPermission.findUnique({
    where: { userId: user.id }
  })

  return permissions?.canEditColumns || false
}
