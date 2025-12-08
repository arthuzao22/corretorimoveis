'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

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

export async function createLandingBloco(data: {
  corretorId: string
  tipo: string
  titulo?: string
  subtitulo?: string
  texto?: string
  imagens?: string[]
  videoUrl?: string
  config?: any
}) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Não autorizado' }
    }

    // Pegar a última ordem
    const lastBloco = await prisma.landingBloco.findFirst({
      where: { corretorId: data.corretorId },
      orderBy: { ordem: 'desc' }
    })

    const ordem = lastBloco ? lastBloco.ordem + 1 : 0

    const bloco = await prisma.landingBloco.create({
      data: {
        corretorId: data.corretorId,
        tipo: data.tipo,
        titulo: data.titulo,
        subtitulo: data.subtitulo,
        texto: data.texto,
        imagens: data.imagens || [],
        videoUrl: data.videoUrl,
        config: data.config,
        ordem,
        ativo: true
      }
    })

    return { success: true, bloco }
  } catch (error) {
    console.error('Create landing bloco error:', error)
    return { success: false, error: 'Erro ao criar bloco' }
  }
}

export async function updateLandingBloco(blocoId: string, data: {
  titulo?: string
  subtitulo?: string
  texto?: string
  imagens?: string[]
  videoUrl?: string
  ativo?: boolean
  config?: any
}) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Não autorizado' }
    }

    const bloco = await prisma.landingBloco.update({
      where: { id: blocoId },
      data
    })

    return { success: true, bloco }
  } catch (error) {
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

    // Atualizar ordem de cada bloco
    await Promise.all(
      blocoIds.map((id, index) =>
        prisma.landingBloco.update({
          where: { id },
          data: { ordem: index }
        })
      )
    )

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

    return { success: true }
  } catch (error) {
    console.error('Toggle landing ativa error:', error)
    return { success: false, error: 'Erro ao atualizar status da landing' }
  }
}

// Public Actions

export async function getPublicLanding(slug: string) {
  try {
    const corretor = await prisma.corretorProfile.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            name: true
          }
        },
        landingBlocos: {
          where: { ativo: true },
          orderBy: { ordem: 'asc' }
        },
        imoveis: {
          where: { status: 'ATIVO' },
          orderBy: { createdAt: 'desc' },
          take: 8
        }
      }
    })

    if (!corretor || !corretor.landingAtiva) {
      return { success: false, error: 'Landing não encontrada' }
    }

    // Converter Decimal para número nos imóveis
    const corretorWithNumbers = {
      ...corretor,
      imoveis: corretor.imoveis.map(imovel => ({
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
}) {
  try {
    const lead = await prisma.lead.create({
      data: {
        corretorId: data.corretorId,
        imovelId: data.imovelId || null,
        name: data.name,
        phone: data.phone,
        email: data.email,
        message: data.message,
        origem: 'landing'
      }
    })

    return { success: true, lead }
  } catch (error) {
    console.error('Create lead from landing error:', error)
    return { success: false, error: 'Erro ao criar lead' }
  }
}
