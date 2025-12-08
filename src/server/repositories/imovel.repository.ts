import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export interface ImovelSearchParams {
  tipo?: 'VENDA' | 'ALUGUEL' | 'TODOS'
  cidade?: string
  estado?: string
  valorMin?: number
  valorMax?: number
  quartos?: number
  banheiros?: number
  areaMin?: number
  areaMax?: number
  corretorId?: string
  status?: 'ATIVO' | 'INATIVO' | 'VENDIDO' | 'ALUGADO'
  destaque?: boolean
  page?: number
  perPage?: number
}

export const imovelRepository = {
  async findById(id: string) {
    return prisma.imovel.findUnique({
      where: { id },
      include: {
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

  async findMany(params: ImovelSearchParams = {}) {
    const {
      tipo,
      cidade,
      estado,
      valorMin,
      valorMax,
      quartos,
      banheiros,
      areaMin,
      areaMax,
      corretorId,
      status = 'ATIVO',
      destaque,
      page = 1,
      perPage = 12,
    } = params

    const where: Prisma.ImovelWhereInput = {
      status,
      ...(tipo && tipo !== 'TODOS' && { tipo }),
      ...(cidade && { cidade: { contains: cidade, mode: 'insensitive' } }),
      ...(estado && { estado: { contains: estado, mode: 'insensitive' } }),
      ...(valorMin && { valor: { gte: valorMin } }),
      ...(valorMax && { valor: { lte: valorMax } }),
      ...(quartos && { quartos: { gte: quartos } }),
      ...(banheiros && { banheiros: { gte: banheiros } }),
      ...(areaMin && { area: { gte: areaMin } }),
      ...(areaMax && { area: { lte: areaMax } }),
      ...(corretorId && { corretorId }),
      ...(destaque !== undefined && { destaque }),
    }

    const [imoveis, total] = await Promise.all([
      prisma.imovel.findMany({
        where,
        include: {
          corretor: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: [
          { destaque: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.imovel.count({ where }),
    ])

    return {
      imoveis,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  },

  async create(data: Prisma.ImovelCreateInput) {
    return prisma.imovel.create({
      data,
      include: {
        corretor: {
          include: {
            user: true,
          },
        },
      },
    })
  },

  async update(id: string, data: Prisma.ImovelUpdateInput) {
    return prisma.imovel.update({
      where: { id },
      data,
      include: {
        corretor: {
          include: {
            user: true,
          },
        },
      },
    })
  },

  async delete(id: string) {
    return prisma.imovel.delete({
      where: { id },
    })
  },

  async incrementViews(id: string) {
    return prisma.imovel.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    })
  },

  async getStats(corretorId?: string) {
    const where = corretorId ? { corretorId } : {}

    const [total, ativos, vendidos, alugados] = await Promise.all([
      prisma.imovel.count({ where }),
      prisma.imovel.count({ where: { ...where, status: 'ATIVO' } }),
      prisma.imovel.count({ where: { ...where, status: 'VENDIDO' } }),
      prisma.imovel.count({ where: { ...where, status: 'ALUGADO' } }),
    ])

    return { total, ativos, vendidos, alugados }
  },
}
