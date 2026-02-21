import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export const dynamic = 'force-dynamic'

// Type for evento with included relations
type EventoWithRelations = {
  id: string
  dataHora: Date
  observacao: string | null
  createdAt: Date
  updatedAt: Date
  lead: {
    id: string
    name: string
    phone: string
    email: string | null
    corretor: {
      id: string
      user: {
        name: string
      }
    }
  } | null
  imovel: {
    id: string
    titulo: string
    endereco: string
    cidade: string
    estado: string
    valor: { toNumber(): number } | number
  } | null
}

// Validation schema for creating an event
const createEventoSchema = z.object({
  leadId: z.string().optional().transform((val) => val && val.length > 0 ? val : undefined),
  imovelId: z.string().optional().transform((val) => val && val.length > 0 ? val : undefined),
  tipo: z.enum(['VISITA', 'ACOMPANHAMENTO', 'REUNIAO', 'URGENTE', 'GERAL']).default('VISITA'),
  dataHora: z.string().min(1, 'Data e hora é obrigatória').transform((val) => {
    // Accept both datetime-local format (YYYY-MM-DDTHH:mm) and ISO format
    const date = new Date(val)
    if (isNaN(date.getTime())) {
      throw new Error('Data e hora inválida')
    }
    return date.toISOString()
  }),
  observacao: z.string().optional(),
}).refine((data) => {
  // For non-GERAL types, leadId and imovelId are required
  if (data.tipo !== 'GERAL') {
    return !!data.leadId && !!data.imovelId
  }
  return true
}, {
  message: 'Lead e Imóvel são obrigatórios para este tipo de evento',
  path: ['leadId'],
})

// Validation schema for query parameters
const querySchema = z.object({
  leadId: z.string().optional(),
  imovelId: z.string().optional(),
  dataInicio: z.string().datetime().optional(),
  dataFim: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createEventoSchema.parse(body)

    // Verify that the lead and imovel belong to the user (only if provided)
    if (validatedData.leadId) {
      const lead = await prisma.lead.findUnique({
        where: { id: validatedData.leadId },
        include: { corretor: true },
      })

      if (!lead) {
        return NextResponse.json(
          { success: false, error: 'Lead não encontrado' },
          { status: 404 }
        )
      }

      if (session.user.role === 'CORRETOR') {
        const { corretorId } = session.user
        if (!corretorId || lead.corretorId !== corretorId) {
          return NextResponse.json(
            { success: false, error: 'Você não tem permissão para usar este lead' },
            { status: 403 }
          )
        }
      }
    }

    if (validatedData.imovelId) {
      const imovel = await prisma.imovel.findUnique({
        where: { id: validatedData.imovelId },
        include: { corretor: true },
      })

      if (!imovel) {
        return NextResponse.json(
          { success: false, error: 'Imóvel não encontrado' },
          { status: 404 }
        )
      }

      if (session.user.role === 'CORRETOR') {
        const { corretorId } = session.user
        if (!corretorId || imovel.corretorId !== corretorId) {
          return NextResponse.json(
            { success: false, error: 'Você não tem permissão para usar este imóvel' },
            { status: 403 }
          )
        }
      }
    }

    // Create the event
    const evento = await prisma.eventoCalendario.create({
      data: {
        ...(validatedData.leadId ? { lead: { connect: { id: validatedData.leadId } } } : {}),
        ...(validatedData.imovelId ? { imovel: { connect: { id: validatedData.imovelId } } } : {}),
        tipo: validatedData.tipo as any, // GERAL will be recognized after prisma generate
        dataHora: new Date(validatedData.dataHora),
        observacao: validatedData.observacao,
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        imovel: {
          select: {
            id: true,
            titulo: true,
            endereco: true,
            cidade: true,
            estado: true,
            valor: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      evento,
    })
  } catch (error) {
    console.error('Error creating evento:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Falha ao criar evento' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)

    // Parse and validate query parameters
    const params = querySchema.parse({
      leadId: searchParams.get('leadId') || undefined,
      imovelId: searchParams.get('imovelId') || undefined,
      dataInicio: searchParams.get('dataInicio') || undefined,
      dataFim: searchParams.get('dataFim') || undefined,
      limit: searchParams.get('limit') || '50',
      cursor: searchParams.get('cursor') || undefined,
    })

    // Build where clause
    const where: Prisma.EventoCalendarioWhereInput = {}

    // For corretores, only show events with their own leads/imoveis
    if (session.user.role === 'CORRETOR') {
      const { corretorId } = session.user
      if (!corretorId) {
        return NextResponse.json(
          { success: false, error: 'Usuário não possui perfil de corretor' },
          { status: 403 }
        )
      }
      where.lead = {
        corretorId: corretorId,
      }
    }

    if (params.leadId) {
      where.leadId = params.leadId
    }

    if (params.imovelId) {
      where.imovelId = params.imovelId
    }

    // Date range filter
    if (params.dataInicio || params.dataFim) {
      where.dataHora = {}
      if (params.dataInicio) {
        where.dataHora.gte = new Date(params.dataInicio)
      }
      if (params.dataFim) {
        where.dataHora.lte = new Date(params.dataFim)
      }
    }

    // Cursor-based pagination
    const take = params.limit + 1 // Fetch one more to check if there's a next page
    const queryOptions: Prisma.EventoCalendarioFindManyArgs = {
      where,
      select: {
        id: true,
        tipo: true,
        dataHora: true,
        observacao: true,
        completed: true,
        createdAt: true,
        updatedAt: true,
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            corretor: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        imovel: {
          select: {
            id: true,
            titulo: true,
            endereco: true,
            cidade: true,
            estado: true,
            valor: true,
          },
        },
      },
      orderBy: {
        dataHora: 'asc' as const,
      },
      take,
    }

    if (params.cursor) {
      queryOptions.cursor = { id: params.cursor }
      queryOptions.skip = 1 // Skip the cursor itself
    }

    const eventos = await prisma.eventoCalendario.findMany(queryOptions) as unknown as EventoWithRelations[]

    // Check if there's a next page
    const hasNextPage = eventos.length > params.limit
    const results = hasNextPage ? eventos.slice(0, -1) : eventos
    const nextCursor = hasNextPage ? results[results.length - 1]?.id : null

    // Serialize Decimal values
    const serializedEventos = results.map((evento: EventoWithRelations) => {
      if (!evento.imovel) {
        return evento
      }
      let valorNumerico = 0
      if (evento.imovel.valor) {
        valorNumerico = typeof evento.imovel.valor === 'number'
          ? evento.imovel.valor
          : evento.imovel.valor.toNumber()
      }
      return {
        ...evento,
        imovel: {
          ...evento.imovel,
          valor: valorNumerico,
        },
      }
    })

    return NextResponse.json({
      success: true,
      eventos: serializedEventos,
      pagination: {
        nextCursor,
        hasNextPage,
        limit: params.limit,
      },
    })
  } catch (error) {
    console.error('Error fetching eventos:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Parâmetros inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Falha ao buscar eventos' },
      { status: 500 }
    )
  }
}
