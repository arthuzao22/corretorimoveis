'use server'

import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'CORRETOR'])
})

export async function registerUser(data: z.infer<typeof registerSchema>) {
  try {
    // Validar dados
    const validatedData = registerSchema.parse(data)

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return { success: false, error: 'Email já cadastrado' }
    }

    // Hash da senha
    const hashedPassword = await hashPassword(validatedData.password)

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role
      }
    })

    // Se for corretor, criar perfil
    if (validatedData.role === 'CORRETOR') {
      const slug = validatedData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        + '-' + user.id.substring(0, 6)

      await prisma.corretorProfile.create({
        data: {
          userId: user.id,
          slug
        }
      })
    }

    // Se for admin, criar perfil admin
    if (validatedData.role === 'ADMIN') {
      await prisma.admin.create({
        data: {
          userId: user.id
        }
      })
    }

    return { success: true, userId: user.id }
  } catch (error) {
    console.error('Register error:', error)
    return { success: false, error: 'Erro ao registrar usuário' }
  }
}
