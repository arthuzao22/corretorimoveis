'use server'

import { prisma } from '@/lib/prisma'
import { Prisma, LeadStatus } from '@prisma/client'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { revalidatePath } from 'next/cache'

const leadSchema = z.object({
  imovelId: z.string(),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  message: z.string().max(1000).optional(),
  honeypot: z.string().optional() // Anti-spam honeypot field
})

export async function createLead(data: z.infer<typeof leadSchema>) {
  try {
    // SECURITY: Anti-spam honeypot check
    if (data.honeypot && data.honeypot.trim() !== '') {
      console.warn('[SECURITY] Honeypot triggered for public createLead')
      return { success: false, error: 'Invalid submission' }
    }

    const validatedData = leadSchema.parse(data)

    // Buscar o imóvel para obter o corretorId
    const imovel = await prisma.imovel.findUnique({
      where: { id: validatedData.imovelId },
      include: {
        corretor: {
          include: { user: { select: { active: true } } }
        }
      }
    })

    if (!imovel) {
      return { success: false, error: 'Imóvel não encontrado' }
    }

    // SECURITY: Verificar se o corretor está ativo
    if (!imovel.corretor?.user?.active) {
      return { success: false, error: 'Corretor não disponível' }
    }

    // Sanitize text inputs
    const sanitizedName = validatedData.name.trim()
    const sanitizedMessage = validatedData.message?.trim() || null

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
        name: sanitizedName,
        email: validatedData.email,
        phone: validatedData.phone,
        message: sanitizedMessage,
        imovelId: validatedData.imovelId,
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

    revalidatePath('/corretor/kanban')
    revalidatePath('/corretor/leads')

    return { success: true, leadId: lead.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Dados inválidos' }
    }
    console.error('Create lead error:', error)
    return { success: false, error: 'Erro ao enviar contato' }
  }
}

// =============================================
// CRIAR LEAD DIRETAMENTE PELO KANBAN
// =============================================

const kanbanLeadSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  phone: z.string().min(10, 'Telefone deve ter no mínimo 10 dígitos'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  message: z.string().optional(),
  imovelId: z.string().optional(), // OPCIONAL - pode criar lead sem imóvel
  kanbanColumnId: z.string().optional() // Coluna específica ou usa inicial
})

export async function createLeadFromKanban(data: z.infer<typeof kanbanLeadSchema>) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'CORRETOR' || !session.user.corretorId) {
      return { success: false, error: 'Não autorizado' }
    }

    const validatedData = kanbanLeadSchema.parse(data)

    // ============================================
    // SECURITY FIX: Validar ownership do imóvel
    // ============================================
    if (validatedData.imovelId) {
      const imovel = await prisma.imovel.findUnique({
        where: { id: validatedData.imovelId },
        select: { id: true, corretorId: true, titulo: true }
      })

      if (!imovel) {
        return {
          success: false,
          error: 'Imóvel não encontrado. Selecione um imóvel válido.'
        }
      }

      if (imovel.corretorId !== session.user.corretorId) {
        // Log de tentativa IDOR para auditoria
        console.warn('[SECURITY] IDOR attempt:', {
          userId: session.user.id,
          corretorId: session.user.corretorId,
          attemptedImovelId: validatedData.imovelId,
          actualOwner: imovel.corretorId,
          timestamp: new Date().toISOString()
        })

        return {
          success: false,
          error: 'Este imóvel não pertence ao seu perfil. Selecione um de seus próprios imóveis.'
        }
      }
    }

    // Determinar a coluna do Kanban
    let columnId = validatedData.kanbanColumnId
    let columnName = ''

    if (!columnId) {
      // Buscar coluna inicial se não especificada
      const initialColumn = await prisma.kanbanColumn.findFirst({
        where: {
          board: { isGlobal: true },
          isInitial: true
        }
      })

      if (!initialColumn) {
        return { success: false, error: 'Coluna inicial do Kanban não encontrada' }
      }
      columnId = initialColumn.id
      columnName = initialColumn.name
    } else {
      // Buscar nome da coluna especificada
      const column = await prisma.kanbanColumn.findUnique({
        where: { id: columnId }
      })
      columnName = column?.name || 'Coluna'
    }

    // Criar lead (ownership validado)
    const lead = await prisma.lead.create({
      data: {
        name: validatedData.name,
        phone: validatedData.phone,
        email: validatedData.email || null,
        message: validatedData.message || null,
        imovelId: validatedData.imovelId || null,
        corretorId: session.user.corretorId,
        kanbanColumnId: columnId,
        origem: 'kanban'
      },
      include: {
        imovel: {
          select: {
            id: true,
            titulo: true
          }
        }
      }
    })

    // Timeline com rastreamento de validação
    await prisma.leadTimeline.create({
      data: {
        leadId: lead.id,
        action: 'CREATED',
        description: `Lead criado via Kanban na coluna "${columnName}"`,
        metadata: {
          source: 'kanban_creation',
          columnId,
          columnName,
          hasImovel: !!validatedData.imovelId,
          ownershipValidated: !!validatedData.imovelId
        }
      }
    })

    return { success: true, lead }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Create lead from kanban error:', error)
    return { success: false, error: 'Erro ao criar lead' }
  }
}

export async function getMyLeads(filters?: { status?: string }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'CORRETOR' || !session.user.corretorId) {
      return { success: false, error: 'Não autorizado' }
    }

    const where: Prisma.LeadWhereInput = {
      corretorId: session.user.corretorId
    }

    if (filters?.status) {
      where.status = filters.status as LeadStatus
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
  dataAgendamento: z.string().optional(),
  imovelId: z.string().optional()
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
      imovelId?: string | null
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
    if (validatedData.imovelId !== undefined) updateData.imovelId = validatedData.imovelId || null

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

// =============================================
// NOVOS SERVER ACTIONS - CRM AVANÇADO
// =============================================

const updateTemperaturaSchema = z.object({
  leadId: z.string(),
  temperatura: z.enum(['quente', 'morno', 'frio'])
})

export async function updateLeadTemperatura(leadId: string, temperatura: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'CORRETOR') {
      return { success: false, error: 'Não autorizado' }
    }

    const result = updateTemperaturaSchema.safeParse({ leadId, temperatura })
    if (!result.success) {
      return { success: false, error: 'Dados inválidos' }
    }

    // Verify lead belongs to this corretor
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    })

    if (!lead || lead.corretorId !== session.user.corretorId) {
      return { success: false, error: 'Lead não encontrado' }
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: { temperatura }
    })

    // Add timeline entry
    await prisma.leadTimeline.create({
      data: {
        leadId,
        action: 'STATUS_CHANGED',
        description: `Temperatura alterada para ${temperatura}`,
        metadata: {
          oldTemperatura: lead.temperatura,
          newTemperatura: temperatura
        }
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Update temperatura error:', error)
    return { success: false, error: 'Erro ao atualizar temperatura' }
  }
}

const updateScoreSchema = z.object({
  leadId: z.string(),
  score: z.number().min(0).max(100)
})

export async function updateLeadScore(leadId: string, score: number) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'CORRETOR') {
      return { success: false, error: 'Não autorizado' }
    }

    const result = updateScoreSchema.safeParse({ leadId, score })
    if (!result.success) {
      return { success: false, error: 'Score deve estar entre 0 e 100' }
    }

    // Verify lead belongs to this corretor
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    })

    if (!lead || lead.corretorId !== session.user.corretorId) {
      return { success: false, error: 'Lead não encontrado' }
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: { score }
    })

    return { success: true }
  } catch (error) {
    console.error('Update score error:', error)
    return { success: false, error: 'Erro ao atualizar score' }
  }
}

// =============================================
// BULK OPERATIONS
// =============================================

const bulkUpdateTemperaturaSchema = z.object({
  leadIds: z.array(z.string()),
  temperatura: z.enum(['quente', 'morno', 'frio'])
})

export async function bulkUpdateTemperatura(data: z.infer<typeof bulkUpdateTemperaturaSchema>) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'CORRETOR') {
      return { success: false, error: 'Não autorizado' }
    }

    const result = bulkUpdateTemperaturaSchema.safeParse(data)
    if (!result.success) {
      return { success: false, error: 'Dados inválidos' }
    }

    const { leadIds, temperatura } = result.data

    // Update all leads that belong to this corretor
    await prisma.lead.updateMany({
      where: {
        id: { in: leadIds },
        corretorId: session.user.corretorId
      },
      data: { temperatura }
    })

    return { success: true }
  } catch (error) {
    console.error('Bulk update temperatura error:', error)
    return { success: false, error: 'Erro ao atualizar temperatura em lote' }
  }
}

const bulkDeleteLeadsSchema = z.object({
  leadIds: z.array(z.string())
})

export async function bulkDeleteLeads(data: z.infer<typeof bulkDeleteLeadsSchema>) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'CORRETOR') {
      return { success: false, error: 'Não autorizado' }
    }

    const result = bulkDeleteLeadsSchema.safeParse(data)
    if (!result.success) {
      return { success: false, error: 'Dados inválidos' }
    }

    const { leadIds } = result.data

    // SECURITY FIX: Soft delete — marca status como PERDIDO em vez de deletar
    // Isso preserva timeline, tags, comments e permite recuperação
    await prisma.lead.updateMany({
      where: {
        id: { in: leadIds },
        corretorId: session.user.corretorId
      },
      data: {
        status: 'PERDIDO',
        updatedAt: new Date()
      }
    })

    revalidatePath('/corretor/leads')
    revalidatePath('/corretor/kanban')

    return { success: true }
  } catch (error) {
    console.error('Bulk delete leads error:', error)
    return { success: false, error: 'Erro ao arquivar leads em lote' }
  }
}
