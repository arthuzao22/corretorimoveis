'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

const landingPageSchema = z.object({
  temaCor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
  fundoCor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
  bannerUrl: z.string().url().optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  tituloLP: z.string().min(3).max(200),
  subtituloLP: z.string().min(3).max(300),
  textoCTA: z.string().min(3).max(100)
})

/**
 * ADMIN ONLY: Get all landing pages
 */
export async function getAllLandingPages() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Não autorizado' }
    }

    const corretores = await prisma.corretorProfile.findMany({
      select: {
        id: true,
        slug: true,
        cidade: true,
        landingAtiva: true,
        temaCor: true,
        fundoCor: true,
        tituloLP: true,
        user: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            imoveis: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { success: true, corretores }
  } catch (error) {
    console.error('Get all landing pages error:', error)
    return { success: false, error: 'Erro ao buscar landing pages' }
  }
}

/**
 * ADMIN ONLY: Get landing page details for a specific corretor
 */
export async function getLandingPageByCorretorId(corretorId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Não autorizado' }
    }

    const corretor = await prisma.corretorProfile.findUnique({
      where: { id: corretorId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!corretor) {
      return { success: false, error: 'Corretor não encontrado' }
    }

    return { success: true, corretor }
  } catch (error) {
    console.error('Get landing page error:', error)
    return { success: false, error: 'Erro ao buscar landing page' }
  }
}

/**
 * ADMIN ONLY: Update landing page for a corretor
 */
export async function updateLandingPage(
  corretorId: string, 
  data: z.infer<typeof landingPageSchema>
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Não autorizado' }
    }

    const validatedData = landingPageSchema.parse(data)

    const updatedCorretor = await prisma.corretorProfile.update({
      where: { id: corretorId },
      data: {
        temaCor: validatedData.temaCor,
        fundoCor: validatedData.fundoCor,
        bannerUrl: validatedData.bannerUrl || null,
        logoUrl: validatedData.logoUrl || null,
        tituloLP: validatedData.tituloLP,
        subtituloLP: validatedData.subtituloLP,
        textoCTA: validatedData.textoCTA
      }
    })

    return { success: true, corretor: updatedCorretor }
  } catch (error: unknown) {
    console.error('Update landing page error:', error)
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as unknown as { issues: Array<{ message: string }> }
      return { success: false, error: zodError.issues[0].message }
    }
    return { success: false, error: 'Erro ao atualizar landing page' }
  }
}

/**
 * ADMIN ONLY: Toggle landing page active status
 */
export async function toggleLandingActive(corretorId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Não autorizado' }
    }

    const corretor = await prisma.corretorProfile.findUnique({
      where: { id: corretorId }
    })

    if (!corretor) {
      return { success: false, error: 'Corretor não encontrado' }
    }

    const updated = await prisma.corretorProfile.update({
      where: { id: corretorId },
      data: { landingAtiva: !corretor.landingAtiva }
    })

    return { success: true, landingAtiva: updated.landingAtiva }
  } catch (error) {
    console.error('Toggle landing active error:', error)
    return { success: false, error: 'Erro ao atualizar status' }
  }
}

/**
 * CORRETOR: Get own landing page (view only)
 */
export async function getMyLandingPage() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'CORRETOR') {
      return { success: false, error: 'Não autorizado' }
    }

    if (!session.user.corretorId) {
      return { success: false, error: 'Perfil de corretor não encontrado' }
    }

    const corretor = await prisma.corretorProfile.findUnique({
      where: { id: session.user.corretorId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!corretor) {
      return { success: false, error: 'Perfil não encontrado' }
    }

    return { success: true, corretor }
  } catch (error) {
    console.error('Get my landing page error:', error)
    return { success: false, error: 'Erro ao buscar landing page' }
  }
}

/**
 * PUBLIC: Get landing page by slug for public view
 */
export async function getPublicLandingPage(slug: string) {
  try {
    const corretorRaw = await prisma.corretorProfile.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            name: true
          }
        },
        imoveis: {
          where: {
            status: 'ATIVO'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 12
        }
      }
    })

    if (!corretorRaw) {
      return { success: false, error: 'Landing page não encontrada' }
    }

    // Converter Decimal para número nos imóveis
    const corretor = {
      ...corretorRaw,
      imoveis: corretorRaw.imoveis.map(imovel => ({
        ...imovel,
        valor: Number(imovel.valor)
      }))
    }

    return { success: true, corretor }
  } catch (error) {
    console.error('Get public landing page error:', error)
    return { success: false, error: 'Erro ao buscar landing page' }
  }
}
