'use server'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getCorretorBySlug } from '@/lib/corretor'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// SECURITY: Zod schemas para prevenir mass assignment no config
const landingBlocoConfigSchema = z.object({
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  layout: z.enum(['full', 'half', 'third', 'two-thirds']).optional(),
  alignment: z.enum(['left', 'center', 'right']).optional(),
  padding: z.string().optional(),
  margin: z.string().optional(),
  borderRadius: z.string().optional(),
  showTitle: z.boolean().optional(),
  showSubtitle: z.boolean().optional(),
  customCss: z.string().max(500).optional(),
}).passthrough().optional() // passthrough allows extra keys for flexibility but validates known ones

const createLandingBlocoSchema = z.object({
  corretorId: z.string().min(1),
  tipo: z.string().min(1),
  titulo: z.string().max(200).optional(),
  subtitulo: z.string().max(300).optional(),
  texto: z.string().max(5000).optional(),
  imagens: z.array(z.string().url()).optional(),
  videoUrl: z.string().url().optional().or(z.literal('')),
  config: landingBlocoConfigSchema,
})

const updateLandingBlocoSchema = z.object({
  titulo: z.string().max(200).optional(),
  subtitulo: z.string().max(300).optional(),
  texto: z.string().max(5000).optional(),
  imagens: z.array(z.string().url()).optional(),
  videoUrl: z.string().url().optional().or(z.literal('')).or(z.null()),
  ativo: z.boolean().optional(),
  config: landingBlocoConfigSchema,
})

// Admin Actions

export async function getAllLandings() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Não autorizado' }
    }

    const corretores = await prisma.corretorProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            landingBlocos: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { success: true, corretores }
  } catch (error) {
    console.error('Get all landings error:', error)
    return { success: false, error: 'Erro ao buscar landings' }
  }
}

export async function getLandingByCorretor(corretorId: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return { success: false, error: 'Não autorizado' }
    }

    // Admin pode ver qualquer landing, corretor só pode ver a própria
    if (session.user.role !== 'ADMIN') {
      const corretorProfile = await prisma.corretorProfile.findFirst({
        where: { userId: session.user.id }
      })

      if (!corretorProfile || corretorProfile.id !== corretorId) {
        return { success: false, error: 'Não autorizado' }
      }
    }

    const corretor = await prisma.corretorProfile.findUnique({
      where: { id: corretorId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        landingBlocos: {
          orderBy: {
            ordem: 'asc'
          }
        }
      }
    })

    if (!corretor) {
      return { success: false, error: 'Corretor não encontrado' }
    }

    return { success: true, corretor }
  } catch (error) {
    console.error('Get landing by corretor error:', error)
    return { success: false, error: 'Erro ao buscar landing' }
  }
}

export async function createLandingBloco(data: z.infer<typeof createLandingBlocoSchema>) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Não autorizado' }
    }

    // SECURITY: Validar input com Zod
    const validatedData = createLandingBlocoSchema.parse(data)

    // Pegar a última ordem
    const lastBloco = await prisma.landingBloco.findFirst({
      where: { corretorId: validatedData.corretorId },
      orderBy: { ordem: 'desc' }
    })

    const ordem = lastBloco ? lastBloco.ordem + 1 : 0

    const bloco = await prisma.landingBloco.create({
      data: {
        corretorId: validatedData.corretorId,
        tipo: validatedData.tipo,
        titulo: validatedData.titulo,
        subtitulo: validatedData.subtitulo,
        texto: validatedData.texto,
        imagens: validatedData.imagens || [],
        videoUrl: validatedData.videoUrl || null,
        config: (validatedData.config || {}) as Prisma.InputJsonValue,
        ordem,
        ativo: true
      }
    })

    revalidatePath('/admin/landings')

    return { success: true, bloco }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Dados inválidos' }
    }
    console.error('Create landing bloco error:', error)
    return { success: false, error: 'Erro ao criar bloco' }
  }
}

export async function updateLandingBloco(blocoId: string, data: z.infer<typeof updateLandingBlocoSchema>) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Não autorizado' }
    }

    // SECURITY: Validar input com Zod — previne mass assignment
    const validatedData = updateLandingBlocoSchema.parse(data)

    const bloco = await prisma.landingBloco.update({
      where: { id: blocoId },
      data: {
        titulo: validatedData.titulo,
        subtitulo: validatedData.subtitulo,
        texto: validatedData.texto,
        imagens: validatedData.imagens,
        videoUrl: validatedData.videoUrl,
        ativo: validatedData.ativo,
        config: validatedData.config ? (validatedData.config as Prisma.InputJsonValue) : undefined,
      }
    })

    revalidatePath('/admin/landings')

    return { success: true, bloco }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Dados inválidos' }
    }
    console.error('Update landing bloco error:', error)
    return { success: false, error: 'Erro ao atualizar bloco' }
  }
}

export async function deleteLandingBloco(blocoId: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Não autorizado' }
    }

    await prisma.landingBloco.delete({
      where: { id: blocoId }
    })

    return { success: true }
  } catch (error) {
    console.error('Delete landing bloco error:', error)
    return { success: false, error: 'Erro ao deletar bloco' }
  }
}

export async function reorderLandingBlocos(corretorId: string, blocoIds: string[]) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Não autorizado' }
    }

    // Atualizar ordem de cada bloco sequencialmente para evitar race conditions
    for (let index = 0; index < blocoIds.length; index++) {
      await prisma.landingBloco.update({
        where: { id: blocoIds[index] },
        data: { ordem: index }
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Reorder landing blocos error:', error)
    return { success: false, error: 'Erro ao reordenar blocos' }
  }
}

export async function toggleLandingAtiva(corretorId: string, ativa: boolean) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Não autorizado' }
    }

    await prisma.corretorProfile.update({
      where: { id: corretorId },
      data: { landingAtiva: ativa }
    })

    revalidatePath('/admin/landings')
    revalidatePath('/lp')

    return { success: true }
  } catch (error) {
    console.error('Toggle landing ativa error:', error)
    return { success: false, error: 'Erro ao atualizar status da landing' }
  }
}

// Public Actions

export async function getPublicLanding(slug: string) {
  try {
    const corretor = await getCorretorBySlug(slug, { includeImoveis: true, includeLandingBlocosFull: true, imoveisTake: 8 })

    if (!corretor || !corretor.landingAtiva) {
      return { success: false, error: 'Landing não encontrada' }
    }

    // Converter Decimal para número nos imóveis
    const corretorWithNumbers = {
      ...corretor,
      imoveis: corretor.imoveis.map((imovel: any) => ({
        ...imovel,
        valor: Number(imovel.valor)
      }))
    }

    return { success: true, corretor: corretorWithNumbers }
  } catch (error) {
    console.error('Get public landing error:', error)
    return { success: false, error: 'Erro ao buscar landing' }
  }
}

export async function createLeadFromLanding(data: {
  corretorId: string
  name: string
  phone: string
  email?: string
  message?: string
  imovelId?: string
  honeypot?: string // Anti-spam honeypot field
}) {
  try {
    // SECURITY: Anti-spam honeypot check
    // If honeypot field is filled, it's likely a bot
    if (data.honeypot && data.honeypot.trim() !== '') {
      console.warn('[SECURITY] Honeypot triggered for lead creation')
      return { success: false, error: 'Invalid submission' }
    }

    // SECURITY: Input validation with Zod
    const leadSchema = z.object({
      corretorId: z.string().min(1),
      name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
      phone: z.string().min(10, 'Telefone inválido').max(20),
      email: z.string().email('Email inválido').optional().or(z.literal('')),
      message: z.string().max(1000).optional(),
      imovelId: z.string().optional()
    })

    const validatedData = leadSchema.parse(data)

    // SECURITY: Sanitize text inputs to prevent XSS
    const sanitizedName = validatedData.name.trim()
    const sanitizedMessage = validatedData.message?.trim() || null

    // VALIDAÇÃO DE SEGURANÇA: Verificar se corretor existe e está ativo
    const corretor = await prisma.corretorProfile.findUnique({
      where: { id: validatedData.corretorId },
      include: { user: { select: { active: true } } }
    })

    if (!corretor || !corretor.user.active) {
      return { success: false, error: 'Corretor não encontrado' }
    }

    const lead = await prisma.lead.create({
      data: {
        corretorId: validatedData.corretorId,
        imovelId: validatedData.imovelId || null,
        name: sanitizedName,
        phone: validatedData.phone,
        email: validatedData.email || null,
        message: sanitizedMessage,
        origem: 'landing'
      }
    })

    return { success: true, lead }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Dados inválidos' }
    }
    console.error('Create lead from landing error:', error)
    return { success: false, error: 'Erro ao criar lead' }
  }
}
