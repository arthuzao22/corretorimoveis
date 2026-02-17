'use server'

import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

// Schema SEM role (não aceita mais do usuário)
const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  // role REMOVIDO - não controlado pelo usuário
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

    // ============================================
    // SECURITY FIX: Role SEMPRE CORRETOR
    // Admins devem ser criados via endpoint privilegiado
    // ============================================
    const HARDCODED_ROLE = 'CORRETOR' as const

    // Criar usuário - role é hardcoded, nunca do input do usuário
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: HARDCODED_ROLE  // SEMPRE CORRETOR para registro público
      }
    })

    // Log de auditoria
    console.log('[AUDIT] User registered:', {
      userId: user.id,
      email: user.email,
      role: user.role,
      timestamp: new Date().toISOString()
    })

    // Criar perfil de corretor (sempre criado pois role é sempre CORRETOR)
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

    return { success: true, userId: user.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('[ERROR] Register error:', error)
    return { success: false, error: 'Erro ao registrar usuário' }
  }
}
