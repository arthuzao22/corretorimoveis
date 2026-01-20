'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { serializeImovel, serializeImoveis } from '@/lib/utils/serializers'

const imovelSchema = z.object({
  // Campos obrigatórios
  titulo: z.string().min(5, 'Título deve ter no mínimo 5 caracteres'),
  descricao: z.string().min(20, 'Descrição deve ter no mínimo 20 caracteres'),
  tipo: z.enum(['VENDA', 'ALUGUEL']),
  valor: z.number().positive('Valor deve ser positivo'),
  endereco: z.string().min(5, 'Endereço é obrigatório'),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado deve ter 2 letras'),
  images: z.array(z.string().url()).min(1, 'Pelo menos uma imagem é obrigatória'),

  // Campos opcionais - relacionamentos
  statusConfigId: z.string().optional(),
  cidadeId: z.string().optional(),

  // Campos opcionais - localização
  cep: z.string().optional(),
  bairro: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),

  // Campos opcionais - características
  quartos: z.number().int().nonnegative().optional(),
  banheiros: z.number().int().nonnegative().optional(),
  suites: z.number().int().nonnegative().optional(),
  area: z.number().positive().optional(),
  areaTerreno: z.number().positive().optional(),
  garagem: z.number().int().nonnegative().optional(),

  // Campos opcionais - valores
  condominio: z.number().nonnegative().optional(),
  iptu: z.number().nonnegative().optional(),

  // Campos opcionais - extras
  destaque: z.boolean().default(false),
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
      data: {
        ...data,
        // Garantir que campos opcionais null/undefined sejam tratados corretamente
        statusConfigId: data.statusConfigId || null,
        cidadeId: data.cidadeId || null,
        cep: data.cep || null,
        bairro: data.bairro || null,
        quartos: data.quartos ?? null,
        banheiros: data.banheiros ?? null,
        suites: data.suites ?? null,
        area: data.area ?? null,
        areaTerreno: data.areaTerreno ?? null,
        garagem: data.garagem ?? null,
        condominio: data.condominio ?? null,
        iptu: data.iptu ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
      }
    })

    return { success: true, imovel: serializeImovel(updatedImovel) }
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
      include: {
        cidadeRef: {
          select: {
            id: true,
            nome: true,
            uf: true,
          }
        },
        statusConfig: {
          select: {
            id: true,
            nome: true,
            cor: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { success: true, imoveis: serializeImoveis(imoveis) }
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
      where: { id },
      include: {
        cidadeRef: {
          select: {
            id: true,
            nome: true,
            uf: true,
          }
        },
        statusConfig: {
          select: {
            id: true,
            nome: true,
            cor: true,
          }
        }
      }
    })

    if (!imovel || imovel.corretorId !== session.user.corretorId) {
      return { success: false, error: 'Imóvel não encontrado' }
    }

    return { success: true, imovel: serializeImovel(imovel) }
  } catch (error) {
    console.error('Get imovel error:', error)
    return { success: false, error: 'Erro ao buscar imóvel' }
  }
}
