'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

const profileSchema = z.object({
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  bio: z.string().max(500).optional(),
  photo: z.string().url().optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  cidade: z.string().optional()
})

export async function updateCorretorProfile(data: z.infer<typeof profileSchema>) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'CORRETOR') {
      return { success: false, error: 'Não autorizado' }
    }

    if (!session.user.corretorId) {
      return { success: false, error: 'Perfil de corretor não encontrado' }
    }

    const validatedData = profileSchema.parse(data)

    // Verificar se o slug já está em uso por outro corretor
    const existingProfile = await prisma.corretorProfile.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingProfile && existingProfile.id !== session.user.corretorId) {
      return { success: false, error: 'Este slug já está em uso' }
    }

    // Atualizar perfil
    const updatedProfile = await prisma.corretorProfile.update({
      where: { id: session.user.corretorId },
      data: {
        slug: validatedData.slug,
        bio: validatedData.bio || null,
        photo: validatedData.photo || null,
        whatsapp: validatedData.whatsapp || null,
        cidade: validatedData.cidade || null
      }
    })

    return { success: true, profile: updatedProfile }
  } catch (error: any) {
    console.error('Update profile error:', error)
    if (error?.issues) {
      return { success: false, error: error.issues[0].message }
    }
    return { success: false, error: 'Erro ao atualizar perfil' }
  }
}

export async function getMyProfile() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'CORRETOR') {
      return { success: false, error: 'Não autorizado' }
    }

    if (!session.user.corretorId) {
      return { success: false, error: 'Perfil de corretor não encontrado' }
    }

    const profile = await prisma.corretorProfile.findUnique({
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

    if (!profile) {
      return { success: false, error: 'Perfil não encontrado' }
    }

    return { success: true, profile }
  } catch (error) {
    console.error('Get profile error:', error)
    return { success: false, error: 'Erro ao buscar perfil' }
  }
}

export async function checkSlugAvailability(slug: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'CORRETOR') {
      return { success: false, error: 'Não autorizado' }
    }

    const profile = await prisma.corretorProfile.findUnique({
      where: { slug }
    })

    // Se não existe, está disponível
    if (!profile) {
      return { success: true, available: true }
    }

    // Se existe mas é do próprio corretor, está disponível
    if (profile.id === session.user.corretorId) {
      return { success: true, available: true }
    }

    // Slug está em uso por outro corretor
    return { success: true, available: false }
  } catch (error) {
    console.error('Check slug error:', error)
    return { success: false, error: 'Erro ao verificar slug' }
  }
}
