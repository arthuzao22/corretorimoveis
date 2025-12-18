'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// =====================================================
// SCHEMAS
// =====================================================

const CreateTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
})

const UpdateTagSchema = z.object({
  tagId: z.string(),
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})

const AddTagToLeadSchema = z.object({
  leadId: z.string(),
  tagId: z.string(),
})

const RemoveTagFromLeadSchema = z.object({
  leadId: z.string(),
  tagId: z.string(),
})

// =====================================================
// TYPES
// =====================================================

type ActionResult<T = void> = {
  success: boolean
  error?: string
  data?: T
}

// =====================================================
// TAG CRUD OPERATIONS
// =====================================================

export async function createTag(
  data: z.infer<typeof CreateTagSchema>
): Promise<ActionResult<{ id: string; name: string; color: string }>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { success: false, error: 'Não autorizado' }
    }

    const validatedData = CreateTagSchema.parse(data)

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    // Check if tag with same name already exists for this user
    const existing = await prisma.tag.findUnique({
      where: {
        name_userId: {
          name: validatedData.name,
          userId: user.id,
        },
      },
    })

    if (existing) {
      return { success: false, error: 'Já existe uma tag com este nome' }
    }

    // Create tag
    const tag = await prisma.tag.create({
      data: {
        name: validatedData.name,
        color: validatedData.color,
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
    })

    revalidatePath('/corretor/leads')
    revalidatePath('/corretor/kanban')

    return { success: true, data: tag }
  } catch (error) {
    console.error('Error creating tag:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Dados inválidos' }
    }
    return { success: false, error: 'Erro ao criar tag' }
  }
}

export async function updateTag(
  data: z.infer<typeof UpdateTagSchema>
): Promise<ActionResult<{ id: string; name: string; color: string }>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { success: false, error: 'Não autorizado' }
    }

    const validatedData = UpdateTagSchema.parse(data)

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    // Check ownership
    const tag = await prisma.tag.findUnique({
      where: { id: validatedData.tagId },
    })

    if (!tag) {
      return { success: false, error: 'Tag não encontrada' }
    }

    // Only owner or admin can update
    if (tag.userId !== user.id && user.role !== 'ADMIN') {
      return { success: false, error: 'Sem permissão para editar esta tag' }
    }

    // Update tag
    const updated = await prisma.tag.update({
      where: { id: validatedData.tagId },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.color && { color: validatedData.color }),
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
    })

    revalidatePath('/corretor/leads')
    revalidatePath('/corretor/kanban')

    return { success: true, data: updated }
  } catch (error) {
    console.error('Error updating tag:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Dados inválidos' }
    }
    return { success: false, error: 'Erro ao atualizar tag' }
  }
}

export async function deleteTag(tagId: string): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { success: false, error: 'Não autorizado' }
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    // Check ownership
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    })

    if (!tag) {
      return { success: false, error: 'Tag não encontrada' }
    }

    // Only owner or admin can delete
    if (tag.userId !== user.id && user.role !== 'ADMIN') {
      return { success: false, error: 'Sem permissão para excluir esta tag' }
    }

    // Delete tag (cascade will remove lead_tags)
    await prisma.tag.delete({
      where: { id: tagId },
    })

    revalidatePath('/corretor/leads')
    revalidatePath('/corretor/kanban')

    return { success: true }
  } catch (error) {
    console.error('Error deleting tag:', error)
    return { success: false, error: 'Erro ao excluir tag' }
  }
}

export async function getTags(): Promise<ActionResult<Array<{ id: string; name: string; color: string }>>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { success: false, error: 'Não autorizado' }
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    // Get user's tags and global tags
    const tags = await prisma.tag.findMany({
      where: {
        OR: [
          { userId: user.id },
          { userId: null }, // Global tags
        ],
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return { success: true, data: tags }
  } catch (error) {
    console.error('Error fetching tags:', error)
    return { success: false, error: 'Erro ao buscar tags' }
  }
}

// =====================================================
// LEAD TAG OPERATIONS
// =====================================================

export async function addTagToLead(
  data: z.infer<typeof AddTagToLeadSchema>
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { success: false, error: 'Não autorizado' }
    }

    const validatedData = AddTagToLeadSchema.parse(data)

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        corretorProfile: true,
      },
    })

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    // Check lead ownership
    const lead = await prisma.lead.findUnique({
      where: { id: validatedData.leadId },
    })

    if (!lead) {
      return { success: false, error: 'Lead não encontrado' }
    }

    // Only owner or admin can add tags
    if (lead.corretorId !== user.corretorProfile?.id && user.role !== 'ADMIN') {
      return { success: false, error: 'Sem permissão para editar este lead' }
    }

    // Check if tag exists
    const tag = await prisma.tag.findUnique({
      where: { id: validatedData.tagId },
    })

    if (!tag) {
      return { success: false, error: 'Tag não encontrada' }
    }

    // Check if already tagged
    const existing = await prisma.leadTag.findUnique({
      where: {
        leadId_tagId: {
          leadId: validatedData.leadId,
          tagId: validatedData.tagId,
        },
      },
    })

    if (existing) {
      return { success: false, error: 'Tag já adicionada a este lead' }
    }

    // Add tag
    await prisma.leadTag.create({
      data: {
        leadId: validatedData.leadId,
        tagId: validatedData.tagId,
      },
    })

    revalidatePath('/corretor/leads')
    revalidatePath('/corretor/kanban')

    return { success: true }
  } catch (error) {
    console.error('Error adding tag to lead:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Dados inválidos' }
    }
    return { success: false, error: 'Erro ao adicionar tag' }
  }
}

export async function removeTagFromLead(
  data: z.infer<typeof RemoveTagFromLeadSchema>
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { success: false, error: 'Não autorizado' }
    }

    const validatedData = RemoveTagFromLeadSchema.parse(data)

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        corretorProfile: true,
      },
    })

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    // Check lead ownership
    const lead = await prisma.lead.findUnique({
      where: { id: validatedData.leadId },
    })

    if (!lead) {
      return { success: false, error: 'Lead não encontrado' }
    }

    // Only owner or admin can remove tags
    if (lead.corretorId !== user.corretorProfile?.id && user.role !== 'ADMIN') {
      return { success: false, error: 'Sem permissão para editar este lead' }
    }

    // Remove tag
    await prisma.leadTag.deleteMany({
      where: {
        leadId: validatedData.leadId,
        tagId: validatedData.tagId,
      },
    })

    revalidatePath('/corretor/leads')
    revalidatePath('/corretor/kanban')

    return { success: true }
  } catch (error) {
    console.error('Error removing tag from lead:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Dados inválidos' }
    }
    return { success: false, error: 'Erro ao remover tag' }
  }
}
