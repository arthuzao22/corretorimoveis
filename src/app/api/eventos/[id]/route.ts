import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export const dynamic = 'force-dynamic'

// Validation schema for updating an event
const updateEventoSchema = z.object({
  leadId: z.string().min(1, 'Lead é obrigatório').optional(),
  imovelId: z.string().min(1, 'Imóvel é obrigatório').optional(),
  dataHora: z.string().datetime('Data e hora inválida').optional(),
  observacao: z.string().optional().nullable(),
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
    }) as any

    if (!evento) {
      return NextResponse.json(
        { success: false, error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    // Check authorization
    if (session.user.role === 'CORRETOR') {
      if (evento.lead.corretorId !== session.user.corretorId) {
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
        valor: Number(evento.imovel.valor),
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
      if (existingEvento.lead.corretorId !== session.user.corretorId) {
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

      if (session.user.role === 'CORRETOR' && lead.corretorId !== session.user.corretorId) {
        return NextResponse.json(
          { success: false, error: 'Você não tem permissão para usar este lead' },
          { status: 403 }
        )
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

      if (session.user.role === 'CORRETOR' && imovel.corretorId !== session.user.corretorId) {
        return NextResponse.json(
          { success: false, error: 'Você não tem permissão para usar este imóvel' },
          { status: 403 }
        )
      }
    }

    // Update the event
    const updateData: any = {}
    if (validatedData.leadId) updateData.leadId = validatedData.leadId
    if (validatedData.imovelId) updateData.imovelId = validatedData.imovelId
    if (validatedData.dataHora) updateData.dataHora = new Date(validatedData.dataHora)
    if (validatedData.observacao !== undefined) updateData.observacao = validatedData.observacao

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
    }) as any

    // Serialize Decimal values
    const serializedEvento = {
      ...evento,
      imovel: {
        ...evento.imovel,
        valor: Number(evento.imovel.valor),
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
      if (existingEvento.lead.corretorId !== session.user.corretorId) {
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
