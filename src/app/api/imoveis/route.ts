import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { serializeImoveis } from '@/lib/utils/serializers'

export const dynamic = 'force-dynamic'

// Validation schema for query parameters
const querySchema = z.object({
  tipo: z.enum(['VENDA', 'ALUGUEL']).optional(),
  cidadeId: z.string().optional(),
  statusId: z.string().optional(),
  minValor: z.coerce.number().positive().optional(),
  maxValor: z.coerce.number().positive().optional(),
  quartos: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  cursor: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate query parameters
    const params = querySchema.parse({
      tipo: searchParams.get('tipo') || undefined,
      cidadeId: searchParams.get('cidadeId') || undefined,
      statusId: searchParams.get('statusId') || undefined,
      minValor: searchParams.get('minValor') || undefined,
      maxValor: searchParams.get('maxValor') || undefined,
      quartos: searchParams.get('quartos') || undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') || '12',
      cursor: searchParams.get('cursor') || undefined,
    })

    // Build where clause
    const where: any = {
      status: 'ATIVO', // Only show active properties
    }

    if (params.tipo) {
      where.tipo = params.tipo
    }

    if (params.cidadeId) {
      where.cidadeId = params.cidadeId
    }

    if (params.statusId) {
      where.statusConfigId = params.statusId
    }

    if (params.minValor !== undefined) {
      where.valor = { ...where.valor, gte: params.minValor }
    }

    if (params.maxValor !== undefined) {
      where.valor = { ...where.valor, lte: params.maxValor }
    }

    if (params.quartos !== undefined) {
      where.quartos = { gte: params.quartos }
    }

    if (params.search) {
      where.OR = [
        { titulo: { contains: params.search, mode: 'insensitive' } },
        { descricao: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    // Cursor-based pagination
    const take = params.limit + 1 // Fetch one more to check if there's a next page
    const queryOptions: any = {
      where,
      select: {
        id: true,
        titulo: true,
        tipo: true,
        valor: true,
        endereco: true,
        cidade: true,
        estado: true,
        quartos: true,
        banheiros: true,
        area: true,
        images: true,
        destaque: true,
        createdAt: true,
        corretor: {
          select: {
            id: true,
            slug: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        cidadeRef: {
          select: {
            id: true,
            nome: true,
            uf: true,
          },
        },
        statusConfig: {
          select: {
            id: true,
            nome: true,
            cor: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc' as const,
      },
      take,
    }

    if (params.cursor) {
      queryOptions.cursor = { id: params.cursor }
      queryOptions.skip = 1 // Skip the cursor itself
    }

    const imoveis = await prisma.imovel.findMany(queryOptions)

    // Check if there's a next page
    const hasNextPage = imoveis.length > params.limit
    const results = hasNextPage ? imoveis.slice(0, -1) : imoveis
    const nextCursor = hasNextPage ? results[results.length - 1].id : null

    // Serialize Decimal values
    const serializedImoveis = serializeImoveis(results)

    return NextResponse.json({
      success: true,
      imoveis: serializedImoveis,
      pagination: {
        nextCursor,
        hasNextPage,
        limit: params.limit,
      },
    })
  } catch (error) {
    console.error('Error fetching imoveis:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}
