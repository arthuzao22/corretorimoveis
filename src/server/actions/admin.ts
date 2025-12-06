'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export async function getAllCorretores() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Não autorizado' }
    }

    const corretores = await prisma.corretorProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            active: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            imoveis: true,
            leads: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { success: true, corretores }
  } catch (error) {
    console.error('Get corretores error:', error)
    return { success: false, error: 'Erro ao buscar corretores' }
  }
}

export async function approveCorretor(corretorId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Não autorizado' }
    }

    await prisma.corretorProfile.update({
      where: { id: corretorId },
      data: { approved: true }
    })

    return { success: true }
  } catch (error) {
    console.error('Approve corretor error:', error)
    return { success: false, error: 'Erro ao aprovar corretor' }
  }
}

export async function toggleUserActive(userId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Não autorizado' }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { active: !user.active }
    })

    return { success: true }
  } catch (error) {
    console.error('Toggle user active error:', error)
    return { success: false, error: 'Erro ao atualizar usuário' }
  }
}

export async function getAllImoveisAdmin() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Não autorizado' }
    }

    const imoveisRaw = await prisma.imovel.findMany({
      include: {
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

    // Converter Decimal para número
    const imoveis = imoveisRaw.map(imovel => ({
      ...imovel,
      valor: Number(imovel.valor)
    }))

    return { success: true, imoveis }
  } catch (error) {
    console.error('Get all imoveis error:', error)
    return { success: false, error: 'Erro ao buscar imóveis' }
  }
}
