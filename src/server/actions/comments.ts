'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// =============================================
// TYPES
// =============================================

export interface CommentData {
    id: string
    content: string
    images: string[]
    createdAt: Date
    author: {
        id: string
        name: string
    }
}

// =============================================
// SERVER ACTIONS
// =============================================

/**
 * Creates a new comment on a lead card
 */
export async function createComment(
    leadId: string,
    content: string,
    images: string[] = []
): Promise<{ success: boolean; comment?: CommentData; error?: string }> {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return { success: false, error: 'Não autorizado' }
        }

        // Validate content
        if (!content || content.trim().length === 0) {
            return { success: false, error: 'Comentário não pode estar vazio' }
        }

        if (content.length > 5000) {
            return { success: false, error: 'Comentário muito longo (máximo 5000 caracteres)' }
        }

        // Verify lead exists and user has access
        const lead = await prisma.lead.findFirst({
            where: {
                id: leadId,
                corretor: {
                    userId: session.user.id
                }
            }
        })

        // Allow admin access to any lead
        const isAdmin = session.user.role === 'ADMIN'

        if (!lead && !isAdmin) {
            return { success: false, error: 'Lead não encontrado ou sem permissão' }
        }

        // If admin, verify lead exists at all
        if (isAdmin && !lead) {
            const leadExists = await prisma.lead.findUnique({
                where: { id: leadId }
            })
            if (!leadExists) {
                return { success: false, error: 'Lead não encontrado' }
            }
        }

        // Create comment
        const comment = await prisma.leadComment.create({
            data: {
                leadId,
                authorId: session.user.id,
                content: content.trim(),
                images
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        revalidatePath(`/corretor/kanban`)

        return {
            success: true,
            comment: {
                id: comment.id,
                content: comment.content,
                images: comment.images,
                createdAt: comment.createdAt,
                author: comment.author
            }
        }
    } catch (error) {
        console.error('Error creating comment:', error)
        return { success: false, error: 'Erro ao criar comentário' }
    }
}

/**
 * Gets all comments for a lead
 */
export async function getLeadComments(
    leadId: string
): Promise<{ success: boolean; comments?: CommentData[]; error?: string }> {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return { success: false, error: 'Não autorizado' }
        }

        // Get comments ordered by creation date (oldest first, like chat)
        const comments = await prisma.leadComment.findMany({
            where: { leadId },
            orderBy: { createdAt: 'asc' },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        return {
            success: true,
            comments: comments.map(c => ({
                id: c.id,
                content: c.content,
                images: c.images,
                createdAt: c.createdAt,
                author: c.author
            }))
        }
    } catch (error) {
        console.error('Error fetching comments:', error)
        return { success: false, error: 'Erro ao carregar comentários' }
    }
}

/**
 * Deletes a comment (only author or admin can delete)
 */
export async function deleteComment(
    commentId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return { success: false, error: 'Não autorizado' }
        }

        // Find the comment
        const comment = await prisma.leadComment.findUnique({
            where: { id: commentId },
            include: {
                author: { select: { id: true } }
            }
        })

        if (!comment) {
            return { success: false, error: 'Comentário não encontrado' }
        }

        // Check authorization: only author or admin can delete
        const isAuthor = comment.author.id === session.user.id
        const isAdmin = session.user.role === 'ADMIN'

        if (!isAuthor && !isAdmin) {
            return { success: false, error: 'Sem permissão para deletar este comentário' }
        }

        // Delete comment
        await prisma.leadComment.delete({
            where: { id: commentId }
        })

        revalidatePath(`/corretor/kanban`)

        return { success: true }
    } catch (error) {
        console.error('Error deleting comment:', error)
        return { success: false, error: 'Erro ao deletar comentário' }
    }
}
