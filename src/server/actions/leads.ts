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

    const lead = await prisma.lead.create({
      data: {
        ...validatedData,
        corretorId: imovel.corretorId
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
  status: z.enum(['NOVO', 'CONTATADO', 'QUALIFICADO', 'NEGOCIACAO', 'CONVERTIDO', 'PERDIDO']),
  anotacoes: z.string().optional()
})

export async function updateLeadStatus(data: z.infer<typeof updateLeadSchema>) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'CORRETOR') {
      return { success: false, error: 'Não autorizado' }
    }

    const validatedData = updateLeadSchema.parse(data)

    // Verify lead belongs to this corretor
    const lead = await prisma.lead.findUnique({
      where: { id: validatedData.leadId }
    })

    if (!lead || lead.corretorId !== session.user.corretorId) {
      return { success: false, error: 'Lead não encontrado' }
    }

    const updatedLead = await prisma.lead.update({
      where: { id: validatedData.leadId },
      data: {
        status: validatedData.status,
        anotacoes: validatedData.anotacoes,
        updatedAt: new Date()
      }
    })

    return { success: true, lead: updatedLead }
  } catch (error) {
    console.error('Update lead status error:', error)
    return { success: false, error: 'Erro ao atualizar status do lead' }
  }
}
