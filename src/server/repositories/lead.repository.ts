import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export interface LeadSearchParams {
  corretorId?: string
  imovelId?: string
  status?: 'NOVO' | 'CONTATADO' | 'QUALIFICADO' | 'NEGOCIACAO' | 'CONVERTIDO' | 'PERDIDO'
  page?: number
  perPage?: number
}

export const leadRepository = {
  async findById(id: string) {
    return prisma.lead.findUnique({
      where: { id },
      include: {
        imovel: {
          select: {
            id: true,
            titulo: true,
            tipo: true,
            valor: true,
          },
        },
        corretor: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })
  },

  async findMany(params: LeadSearchParams = {}) {
    const {
      corretorId,
      imovelId,
      status,
      page = 1,
      perPage = 20,
    } = params

    const where: Prisma.LeadWhereInput = {
      ...(corretorId && { corretorId }),
      ...(imovelId && { imovelId }),
      ...(status && { status }),
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          imovel: {
            select: {
              id: true,
              titulo: true,
              tipo: true,
              valor: true,
              images: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.lead.count({ where }),
    ])

    return {
      leads,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  },

  async create(data: Prisma.LeadCreateInput) {
    return prisma.lead.create({
      data,
      include: {
        imovel: true,
        corretor: {
          include: {
            user: true,
          },
        },
      },
    })
  },

  async update(id: string, data: Prisma.LeadUpdateInput) {
    return prisma.lead.update({
      where: { id },
      data,
      include: {
        imovel: true,
      },
    })
  },

  async delete(id: string) {
    return prisma.lead.delete({
      where: { id },
    })
  },

  async getStats(corretorId?: string) {
    const where = corretorId ? { corretorId } : {}

    const [total, novos, contatados, qualificados, convertidos] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.count({ where: { ...where, status: 'NOVO' } }),
      prisma.lead.count({ where: { ...where, status: 'CONTATADO' } }),
      prisma.lead.count({ where: { ...where, status: 'QUALIFICADO' } }),
      prisma.lead.count({ where: { ...where, status: 'CONVERTIDO' } }),
    ])

    return { total, novos, contatados, qualificados, convertidos }
  },

  async getRecentLeads(corretorId: string, limit: number = 10) {
    // Limit maximum to prevent performance issues
    const maxLimit = Math.min(limit, 50)
    
    return prisma.lead.findMany({
      where: { corretorId },
      include: {
        imovel: {
          select: {
            id: true,
            titulo: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: maxLimit,
    })
  },
}
