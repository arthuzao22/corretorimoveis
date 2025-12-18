import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export const dynamic = 'force-dynamic'

// Type for evento with included relations for GET
type EventoWithFullRelations = {
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
    corretorId: string
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
    corretorId: string
  }
}

// Type for evento with basic relations for UPDATE
type EventoWithBasicRelations = {
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
    kanbanColumnId: string | null
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

// Validation schema for updating an event
const updateEventoSchema = z.object({
  leadId: z.string().min(1, 'Lead é obrigatório').optional(),
  imovelId: z.string().min(1, 'Imóvel é obrigatório').optional(),
  dataHora: z.string().datetime('Data e hora inválida').optional(),
  observacao: z.string().optional().nullable(),
  completed: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const evento = await prisma.eventoCalendario.findUnique({
      where: { id },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            corretorId: true,
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
            corretorId: true,
          },
        },
      },
    }) as unknown as EventoWithFullRelations | null

    if (!evento) {
      return NextResponse.json(
        { success: false, error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    // Check authorization
    if (session.user.role === 'CORRETOR') {
      const { corretorId } = session.user
      if (!corretorId) {
        return NextResponse.json(
          { success: false, error: 'Usuário não possui perfil de corretor' },
          { status: 403 }
        )
      }
      if (evento.lead.corretorId !== corretorId) {
        return NextResponse.json(
          { success: false, error: 'Você não tem permissão para ver este evento' },
          { status: 403 }
        )
      }
    }

    // Serialize Decimal values
    const serializedEvento = {
      ...evento,
      imovel: {
        ...evento.imovel,
        valor: typeof evento.imovel.valor === 'number' ? evento.imovel.valor : evento.imovel.valor.toNumber(),
      },
    }

    return NextResponse.json({
      success: true,
      evento: serializedEvento,
    })
  } catch (error) {
    console.error('Error fetching evento:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao buscar evento' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateEventoSchema.parse(body)

    // Find existing event
    const existingEvento = await prisma.eventoCalendario.findUnique({
      where: { id },
      include: {
        lead: {
          select: {
            corretorId: true,
          },
        },
        imovel: {
          select: {
            corretorId: true,
          },
        },
      },
    })

    if (!existingEvento) {
      return NextResponse.json(
        { success: false, error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    // Check authorization
    if (session.user.role === 'CORRETOR') {
      const { corretorId } = session.user
      if (!corretorId) {
        return NextResponse.json(
          { success: false, error: 'Usuário não possui perfil de corretor' },
          { status: 403 }
        )
      }
      if (existingEvento.lead.corretorId !== corretorId) {
        return NextResponse.json(
          { success: false, error: 'Você não tem permissão para editar este evento' },
          { status: 403 }
        )
      }
    }

    // If updating leadId or imovelId, verify ownership
    if (validatedData.leadId) {
      const lead = await prisma.lead.findUnique({
        where: { id: validatedData.leadId },
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

    // Update the event
    const updateData: any = {}
    if (validatedData.leadId) updateData.leadId = validatedData.leadId
    if (validatedData.imovelId) updateData.imovelId = validatedData.imovelId
    if (validatedData.dataHora) updateData.dataHora = new Date(validatedData.dataHora)
    if (validatedData.observacao !== undefined) updateData.observacao = validatedData.observacao
    if (validatedData.completed !== undefined) updateData.completed = validatedData.completed

    const evento = await prisma.eventoCalendario.update({
      where: { id },
      data: updateData,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            kanbanColumnId: true,
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
    }) as unknown as EventoWithBasicRelations

    // If event was marked as completed and it's a VISITA, auto-move lead to next column
    if (validatedData.completed === true && existingEvento.tipo === 'VISITA') {
      try {
        // Find the "Acompanhamento" column
        const acompanhamentoColumn = await prisma.kanbanColumn.findFirst({
          where: {
            name: 'Acompanhamento',
            board: { isGlobal: true }
          }
        })

        if (acompanhamentoColumn && evento.lead.kanbanColumnId !== acompanhamentoColumn.id) {
          // Move lead to Acompanhamento column
          await prisma.lead.update({
            where: { id: evento.lead.id },
            data: {
              kanbanColumnId: acompanhamentoColumn.id,
              updatedAt: new Date()
            }
          })

          // Add timeline entry
          await prisma.leadTimeline.create({
            data: {
              leadId: evento.lead.id,
              action: 'KANBAN_MOVED',
              description: 'Lead movido automaticamente para "Acompanhamento" após visita concluída',
              metadata: {
                autoMoved: true,
                reason: 'visit_completed',
                eventId: evento.id
              }
            }
          })
        }
      } catch (error) {
        console.error('Error auto-moving lead after visit completion:', error)
        // Don't fail the event update if auto-move fails
      }
    }

    // Serialize Decimal values
    let valorNumericoPut = 0
    if (evento.imovel?.valor) {
      valorNumericoPut = typeof evento.imovel.valor === 'number' 
        ? evento.imovel.valor 
        : evento.imovel.valor.toNumber()
    }
    const serializedEvento = {
      ...evento,
      imovel: {
        ...evento.imovel,
        valor: valorNumericoPut,
      },
    }

    return NextResponse.json({
      success: true,
      evento: serializedEvento,
    })
  } catch (error) {
    console.error('Error updating evento:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Falha ao atualizar evento' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Find existing event
    const existingEvento = await prisma.eventoCalendario.findUnique({
      where: { id },
      include: {
        lead: {
          select: {
            corretorId: true,
          },
        },
      },
    })

    if (!existingEvento) {
      return NextResponse.json(
        { success: false, error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    // Check authorization
    if (session.user.role === 'CORRETOR') {
      const { corretorId } = session.user
      if (!corretorId) {
        return NextResponse.json(
          { success: false, error: 'Usuário não possui perfil de corretor' },
          { status: 403 }
        )
      }
      if (existingEvento.lead.corretorId !== corretorId) {
        return NextResponse.json(
          { success: false, error: 'Você não tem permissão para excluir este evento' },
          { status: 403 }
        )
      }
    }

    // Delete the event
    await prisma.eventoCalendario.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Evento excluído com sucesso',
    })
  } catch (error) {
    console.error('Error deleting evento:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao excluir evento' },
      { status: 500 }
    )
  }
}
