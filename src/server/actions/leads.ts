'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

const leadSchema = z.object({
  imovelId: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  message: z.string().optional()
})

export async function createLead(data: z.infer<typeof leadSchema>) {
  try {
    const validatedData = leadSchema.parse(data)

    // Buscar o imóvel para obter o corretorId
    const imovel = await prisma.imovel.findUnique({
      where: { id: validatedData.imovelId }
    })

    if (!imovel) {
      return { success: false, error: 'Imóvel não encontrado' }
    }

    // Get the initial Kanban column from the global board
    const initialColumn = await prisma.kanbanColumn.findFirst({
      where: {
        board: {
          isGlobal: true
        },
        isInitial: true
      }
    })

    if (!initialColumn) {
      return { success: false, error: 'Coluna inicial do Kanban não encontrada. Configure o sistema primeiro.' }
    }

    const lead = await prisma.lead.create({
      data: {
        ...validatedData,
        corretorId: imovel.corretorId,
        kanbanColumnId: initialColumn.id // Auto-assign to initial column
      }
    })

    // Create timeline entry for lead creation
    await prisma.leadTimeline.create({
      data: {
        leadId: lead.id,
        action: 'CREATED',
        description: `Lead criado e atribuído à coluna "${initialColumn.name}"`,
        metadata: {
          source: 'lead_creation',
          initialColumn: initialColumn.name,
          columnId: initialColumn.id
        }
      }
    })

    return { success: true, leadId: lead.id }
  } catch (error) {
    console.error('Create lead error:', error)
    return { success: false, error: 'Erro ao enviar contato' }
  }
}

export async function getMyLeads(filters?: { status?: string }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'CORRETOR' || !session.user.corretorId) {
      return { success: false, error: 'Não autorizado' }
    }

    const where: { corretorId: string; status?: any } = {
      corretorId: session.user.corretorId
    }

    if (filters?.status) {
      where.status = filters.status as any
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        imovel: {
          select: {
            id: true,
            titulo: true,
            tipo: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { success: true, leads }
  } catch (error) {
    console.error('Get leads error:', error)
    return { success: false, error: 'Erro ao buscar leads' }
  }
}

export async function getAllLeads() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Não autorizado' }
    }

    const leads = await prisma.lead.findMany({
      include: {
        imovel: {
          select: {
            id: true,
            titulo: true,
            tipo: true
          }
        },
        corretor: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { success: true, leads }
  } catch (error) {
    console.error('Get all leads error:', error)
    return { success: false, error: 'Erro ao buscar leads' }
  }
}

const updateLeadSchema = z.object({
  leadId: z.string(),
  // Status is removed - should only be updated via Kanban column assignment
  priority: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
  anotacoes: z.string().optional(),
  description: z.string().optional(),
  dataContato: z.string().optional(),
  dataAgendamento: z.string().optional()
})

export async function updateLeadStatus(data: z.infer<typeof updateLeadSchema>) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'CORRETOR' && session.user.role !== 'ADMIN')) {
      return { success: false, error: 'Não autorizado' }
    }

    const validatedData = updateLeadSchema.parse(data)

    // Verify lead belongs to this corretor (for non-admins)
    const lead = await prisma.lead.findUnique({
      where: { id: validatedData.leadId }
    })

    if (!lead) {
      return { success: false, error: 'Lead não encontrado' }
    }

    if (session.user.role === 'CORRETOR' && lead.corretorId !== session.user.corretorId) {
      return { success: false, error: 'Lead não encontrado' }
    }

    interface LeadUpdateData {
      updatedAt: Date
      priority?: typeof validatedData.priority
      anotacoes?: string | null
      description?: string | null
      dataContato?: Date
      dataAgendamento?: Date
    }

    const updateData: LeadUpdateData = {
      updatedAt: new Date()
    }

    // Status is NOT updated here - only via Kanban moveLeadToColumn
    if (validatedData.priority) updateData.priority = validatedData.priority
    if (validatedData.anotacoes !== undefined) updateData.anotacoes = validatedData.anotacoes
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.dataContato) updateData.dataContato = new Date(validatedData.dataContato)
    if (validatedData.dataAgendamento) updateData.dataAgendamento = new Date(validatedData.dataAgendamento)

    const updatedLead = await prisma.lead.update({
      where: { id: validatedData.leadId },
      data: updateData,
      include: {
        imovel: {
          select: {
            id: true,
            titulo: true
          }
        },
        corretor: {
          select: {
            id: true,
            user: {
              select: {
                name: true
              }
            }
          }
        },
        statusConfig: {
          select: {
            id: true,
            nome: true,
            cor: true
          }
        }
      }
    })

    // Timeline entry for status changes is now handled by moveLeadToColumn in kanban.ts
    // Only add timeline for priority changes if needed
    if (validatedData.priority && validatedData.priority !== lead.priority) {
      await prisma.leadTimeline.create({
        data: {
          leadId: validatedData.leadId,
          action: 'STATUS_CHANGED',
          description: `Prioridade alterada de ${lead.priority} para ${validatedData.priority}`,
          metadata: {
            oldPriority: lead.priority,
            newPriority: validatedData.priority
          }
        }
      })
    }

    return { success: true, lead: updatedLead }
  } catch (error) {
    console.error('Update lead status error:', error)
    return { success: false, error: 'Erro ao atualizar lead' }
  }
}
