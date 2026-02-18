'use server'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { TimelineAction } from '@prisma/client'

export async function addTimelineEntry(
  leadId: string,
  action: TimelineAction,
  description: string,
  metadata?: Prisma.InputJsonValue
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return { success: false, error: 'Não autorizado' }
    }

    // Verify lead belongs to this corretor (for non-admins)
    if (session.user.role === 'CORRETOR' && session.user.corretorId) {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { corretorId: true },
      })

      if (!lead || lead.corretorId !== session.user.corretorId) {
        return { success: false, error: 'Lead não encontrado' }
      }
    }

    const entry = await prisma.leadTimeline.create({
      data: {
        leadId,
        action,
        description,
        metadata,
      },
    })

    return { success: true, entry }
  } catch (error) {
    console.error('Add timeline entry error:', error)
    return { success: false, error: 'Erro ao adicionar entrada na timeline' }
  }
}

export async function getLeadTimeline(leadId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return { success: false, error: 'Não autorizado' }
    }

    // Verify lead belongs to this corretor (for non-admins)
    if (session.user.role === 'CORRETOR' && session.user.corretorId) {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { corretorId: true },
      })

      if (!lead || lead.corretorId !== session.user.corretorId) {
        return { success: false, error: 'Lead não encontrado' }
      }
    }

    const timeline = await prisma.leadTimeline.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, timeline }
  } catch (error) {
    console.error('Get timeline error:', error)
    return { success: false, error: 'Erro ao buscar timeline' }
  }
}
