'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { z } from 'zod'

const messageTemplateSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  mensagem: z.string().min(10, 'Mensagem deve ter no mínimo 10 caracteres'),
  categoria: z.enum(['BOAS_VINDAS', 'ACOMPANHAMENTO', 'AGENDAMENTO', 'POS_VISITA', 'OUTRO']).default('OUTRO')
})

export async function createMessageTemplate(data: z.infer<typeof messageTemplateSchema>) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'CORRETOR' || !session.user.corretorId) {
      return { success: false, error: 'Não autorizado' }
    }

    const validatedData = messageTemplateSchema.parse(data)

    const template = await prisma.messageTemplate.create({
      data: {
        nome: validatedData.nome,
        mensagem: validatedData.mensagem,
        categoria: validatedData.categoria,
        corretorId: session.user.corretorId
      }
    })

    return { success: true, template }
  } catch (error) {
    console.error('Create message template error:', error)
    return { success: false, error: 'Erro ao criar template' }
  }
}

export async function getMyMessageTemplates() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'CORRETOR' || !session.user.corretorId) {
      return { success: false, error: 'Não autorizado' }
    }

    const templates = await prisma.messageTemplate.findMany({
      where: {
        corretorId: session.user.corretorId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { success: true, templates }
  } catch (error) {
    console.error('Get message templates error:', error)
    return { success: false, error: 'Erro ao buscar templates' }
  }
}

export async function updateMessageTemplate(id: string, data: Partial<z.infer<typeof messageTemplateSchema>>) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'CORRETOR' || !session.user.corretorId) {
      return { success: false, error: 'Não autorizado' }
    }

    // Validate partial data with Zod
    const validatedData = messageTemplateSchema.partial().parse(data)

    // Verify template belongs to this corretor
    const template = await prisma.messageTemplate.findUnique({
      where: { id }
    })

    if (!template || template.corretorId !== session.user.corretorId) {
      return { success: false, error: 'Template não encontrado' }
    }

    const updatedTemplate = await prisma.messageTemplate.update({
      where: { id },
      data: {
        nome: validatedData.nome,
        mensagem: validatedData.mensagem,
        categoria: validatedData.categoria,
      }
    })

    return { success: true, template: updatedTemplate }
  } catch (error) {
    console.error('Update message template error:', error)
    return { success: false, error: 'Erro ao atualizar template' }
  }
}

export async function deleteMessageTemplate(id: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'CORRETOR' || !session.user.corretorId) {
      return { success: false, error: 'Não autorizado' }
    }

    // Verify template belongs to this corretor
    const template = await prisma.messageTemplate.findUnique({
      where: { id }
    })

    if (!template || template.corretorId !== session.user.corretorId) {
      return { success: false, error: 'Template não encontrado' }
    }

    await prisma.messageTemplate.delete({
      where: { id }
    })

    return { success: true }
  } catch (error) {
    console.error('Delete message template error:', error)
    return { success: false, error: 'Erro ao deletar template' }
  }
}
