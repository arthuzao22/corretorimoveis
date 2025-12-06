'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

const imovelSchema = z.object({
  titulo: z.string().min(5),
  descricao: z.string().min(20),
  tipo: z.enum(['VENDA', 'ALUGUEL']),
  valor: z.number().positive(),
  endereco: z.string().min(5),
  cidade: z.string().min(2),
  estado: z.string().length(2),
  cep: z.string().optional(),
  images: z.array(z.string().url()).min(1, 'Pelo menos uma imagem é obrigatória').default([])
})

export async function createImovel(data: z.infer<typeof imovelSchema>) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'CORRETOR') {
      return { success: false, error: 'Não autorizado' }
    }

    if (!session.user.corretorId) {
      return { success: false, error: 'Perfil de corretor não encontrado' }
    }

    const validatedData = imovelSchema.parse(data)

    const imovel = await prisma.imovel.create({
      data: {
        ...validatedData,
        corretorId: session.user.corretorId
      }
    })

    return { success: true, imovelId: imovel.id }
  } catch (error) {
    console.error('Create imovel error:', error)
    return { success: false, error: 'Erro ao criar imóvel' }
  }
}

export async function updateImovel(id: string, data: Partial<z.infer<typeof imovelSchema>>) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'CORRETOR') {
      return { success: false, error: 'Não autorizado' }
    }

    // Verificar se o imóvel pertence ao corretor
    const imovel = await prisma.imovel.findUnique({
      where: { id }
    })

    if (!imovel || imovel.corretorId !== session.user.corretorId) {
      return { success: false, error: 'Imóvel não encontrado' }
    }

    const updatedImovel = await prisma.imovel.update({
      where: { id },
      data
    })

    // Converter Decimal para número
    const imovelSerializado = {
      ...updatedImovel,
      valor: Number(updatedImovel.valor)
    }

    return { success: true, imovel: imovelSerializado }
  } catch (error) {
    console.error('Update imovel error:', error)
    return { success: false, error: 'Erro ao atualizar imóvel' }
  }
}

export async function deleteImovel(id: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'CORRETOR') {
      return { success: false, error: 'Não autorizado' }
    }

    // Verificar se o imóvel pertence ao corretor
    const imovel = await prisma.imovel.findUnique({
      where: { id }
    })

    if (!imovel || imovel.corretorId !== session.user.corretorId) {
      return { success: false, error: 'Imóvel não encontrado' }
    }

    await prisma.imovel.delete({
      where: { id }
    })

    return { success: true }
  } catch (error) {
    console.error('Delete imovel error:', error)
    return { success: false, error: 'Erro ao deletar imóvel' }
  }
}

export async function getMyImoveis() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'CORRETOR') {
      return { success: false, error: 'Não autorizado' }
    }

    const imoveis = await prisma.imovel.findMany({
      where: {
        corretorId: session.user.corretorId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Converter Decimal para número
    const imoveisSerializados = imoveis.map(imovel => ({
      ...imovel,
      valor: Number(imovel.valor)
    }))

    return { success: true, imoveis: imoveisSerializados }
  } catch (error) {
    console.error('Get imoveis error:', error)
    return { success: false, error: 'Erro ao buscar imóveis' }
  }
}

export async function getImovelById(id: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'CORRETOR') {
      return { success: false, error: 'Não autorizado' }
    }

    const imovel = await prisma.imovel.findUnique({
      where: { id }
    })

    if (!imovel || imovel.corretorId !== session.user.corretorId) {
      return { success: false, error: 'Imóvel não encontrado' }
    }

    // Converter Decimal para número
    const imovelSerializado = {
      ...imovel,
      valor: Number(imovel.valor)
    }

    return { success: true, imovel: imovelSerializado }
  } catch (error) {
    console.error('Get imovel error:', error)
    return { success: false, error: 'Erro ao buscar imóvel' }
  }
}
