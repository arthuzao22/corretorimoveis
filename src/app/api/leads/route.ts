import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export const dynamic = 'force-dynamic'

// Validation schema for query parameters
const querySchema = z.object({
  statusId: z.string().optional(),
  corretorId: z.string().optional(),
  origem: z.enum(['site', 'landing', 'perfil', 'imovel', 'whatsapp']).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
})

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
      statusId: searchParams.get('statusId') || undefined,
      corretorId: searchParams.get('corretorId') || undefined,
      origem: searchParams.get('origem') || undefined,
      limit: searchParams.get('limit') || '20',
      cursor: searchParams.get('cursor') || undefined,
    })

    // Build where clause
    const where: any = {}

    // For corretores, only show their own leads
    // For admins, allow filtering by corretorId or show all
    if (session.user.role === 'CORRETOR') {
      where.corretorId = session.user.corretorId
    } else if (session.user.role === 'ADMIN' && params.corretorId) {
      where.corretorId = params.corretorId
    }

    if (params.statusId) {
      where.statusConfigId = params.statusId
    }

    if (params.origem) {
      where.origem = params.origem
    }

    // Cursor-based pagination
    const take = params.limit + 1 // Fetch one more to check if there's a next page
    const queryOptions: any = {
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        message: true,
        origem: true,
        status: true,
        anotacoes: true,
        dataContato: true,
        dataAgendamento: true,
        createdAt: true,
        updatedAt: true,
        imovel: {
          select: {
            id: true,
            titulo: true,
          },
        },
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

    const leads = await prisma.lead.findMany(queryOptions)

    // Check if there's a next page
    const hasNextPage = leads.length > params.limit
    const results = hasNextPage ? leads.slice(0, -1) : leads
    const nextCursor = hasNextPage ? leads[leads.length - 2].id : null

    return NextResponse.json({
      success: true,
      leads: results,
      pagination: {
        nextCursor,
        hasNextPage,
        limit: params.limit,
      },
    })
  } catch (error) {
    console.error('Error fetching leads:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}
