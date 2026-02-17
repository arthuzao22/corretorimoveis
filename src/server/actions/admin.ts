'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { serializeImoveis } from '@/lib/utils/serializers'
import { revalidatePath } from 'next/cache'

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
            createdAt: true,
            kanbanPermission: {
              select: {
                canEditBoard: true,
                canEditColumns: true
              }
            }
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

    // SECURITY FIX: Revalidate paths to ensure fresh data
    revalidatePath('/admin/corretores')
    revalidatePath('/admin/dashboard')

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
    const imoveis = serializeImoveis(imoveisRaw)

    return { success: true, imoveis }
  } catch (error) {
    console.error('Get all imoveis error:', error)
    return { success: false, error: 'Erro ao buscar imóveis' }
  }
}

/**
 * Promover usuário a ADMIN
 * SECURITY: Apenas ADMINs existentes podem promover
 */
export async function promoteUserToAdmin(userId: string, reason?: string) {
  try {
    const session = await getServerSession(authOptions)

    // CRITICAL: Apenas admins podem promover
    if (!session?.user || session.user.role !== 'ADMIN') {
      console.warn('[SECURITY] Unauthorized admin promotion attempt:', {
        attemptedBy: session?.user?.id || 'anonymous',
        targetUser: userId,
        timestamp: new Date().toISOString()
      })
      return {
        success: false,
        error: 'Não autorizado - apenas administradores podem promover usuários'
      }
    }

    // Verificar usuário alvo
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, admin: true }
    })

    if (!targetUser) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    if (targetUser.role === 'ADMIN') {
      return { success: false, error: 'Usuário já é administrador' }
    }

    // Prevenir auto-promoção
    if (targetUser.id === session.user.id) {
      return { success: false, error: 'Você não pode promover a si mesmo' }
    }

    // Atualizar role
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' }
    })

    // Criar perfil admin
    await prisma.admin.create({
      data: { userId: userId }
    })

    // AUDIT LOG
    console.log('[AUDIT] Admin promotion:', {
      promotedBy: session.user.id,
      promotedByEmail: session.user.email,
      promotedUser: userId,
      targetEmail: targetUser.email,
      reason: reason || 'No reason provided',
      timestamp: new Date().toISOString()
    })

    return {
      success: true,
      message: `Usuário ${targetUser.name} promovido a administrador`
    }
  } catch (error) {
    console.error('[ERROR] Promote admin error:', error)
    return { success: false, error: 'Erro ao promover usuário' }
  }
}

/**
 * Remover privilégios admin (demote para CORRETOR)
 * SECURITY: Apenas ADMINs, com proteções contra lockout
 */
export async function demoteAdminToCorretor(userId: string, reason?: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Não autorizado' }
    }

    // Prevenir auto-demotion
    if (userId === session.user.id) {
      return {
        success: false,
        error: 'Você não pode remover seus próprios privilégios'
      }
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true }
    })

    if (!targetUser) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    if (targetUser.role !== 'ADMIN') {
      return { success: false, error: 'Usuário não é administrador' }
    }

    // Prevenir lockout: manter pelo menos 1 admin
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN', active: true }
    })

    if (adminCount <= 1) {
      return {
        success: false,
        error: 'Não é possível remover o último administrador do sistema'
      }
    }

    // Demote usuário
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'CORRETOR' }
    })

    // Deletar perfil admin
    await prisma.admin.deleteMany({
      where: { userId: userId }
    })

    // Criar perfil corretor se não existir
    const existingProfile = await prisma.corretorProfile.findUnique({
      where: { userId: userId }
    })

    if (!existingProfile) {
      const slug = targetUser.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        + '-' + userId.substring(0, 6)

      await prisma.corretorProfile.create({
        data: { userId: userId, slug }
      })
    }

    // Audit log
    console.log('[AUDIT] Admin demotion:', {
      demotedBy: session.user.id,
      demotedUser: userId,
      targetEmail: targetUser.email,
      reason: reason || 'No reason provided',
      timestamp: new Date().toISOString()
    })

    return {
      success: true,
      message: `${targetUser.name} teve privilégios de administrador removidos`
    }
  } catch (error) {
    console.error('[ERROR] Demote admin error:', error)
    return { success: false, error: 'Erro ao remover privilégios' }
  }
}
