import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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
  }
  imovel: {
    id: string
    titulo: string
    endereco: string
    cidade: string
    estado: string
    valor: { toNumber(): number } | number
  }
}

// Validation schema for creating an event
const createEventoSchema = z.object({
  leadId: z.string().min(1, 'Lead é obrigatório'),
  imovelId: z.string().min(1, 'Imóvel é obrigatório'),
  dataHora: z.string().datetime('Data e hora inválida'),
  observacao: z.string().optional(),
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

    // Verify that the lead and imovel belong to the user
    const lead = await prisma.lead.findUnique({
      where: { id: validatedData.leadId },
      include: { corretor: true },
    })

    const imovel = await prisma.imovel.findUnique({
      where: { id: validatedData.imovelId },
      include: { corretor: true },
    })

    if (!lead || !imovel) {
      return NextResponse.json(
        { success: false, error: 'Lead ou imóvel não encontrado' },
        { status: 404 }
      )
    }

    // Check authorization
    if (session.user.role === 'CORRETOR') {
      if (lead.corretorId !== session.user.corretorId || 
          imovel.corretorId !== session.user.corretorId) {
        return NextResponse.json(
          { success: false, error: 'Você não tem permissão para criar evento com este lead ou imóvel' },
          { status: 403 }
        )
      }
    }

    // Create the event
    const evento = await prisma.eventoCalendario.create({
      data: {
        leadId: validatedData.leadId,
        imovelId: validatedData.imovelId,
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
    const where: any = {}

    // For corretores, only show events with their own leads/imoveis
    if (session.user.role === 'CORRETOR') {
      where.lead = {
        corretorId: session.user.corretorId,
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
    const queryOptions: any = {
      where,
      select: {
        id: true,
        dataHora: true,
        observacao: true,
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
    const serializedEventos = results.map((evento: EventoWithRelations) => ({
      ...evento,
      imovel: {
        ...evento.imovel,
        valor: typeof evento.imovel.valor === 'number' ? evento.imovel.valor : evento.imovel.valor.toNumber(),
      },
    }))

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
