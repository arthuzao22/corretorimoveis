import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const imovel = await prisma.imovel.findUnique({
      where: { id },
      include: {
        corretor: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!imovel) {
      return NextResponse.json(
        { error: 'Imóvel não encontrado' },
        { status: 404 }
      )
    }

    // Incrementar visualizações
    await prisma.imovel.update({
      where: { id },
      data: {
        views: {
          increment: 1
        }
      }
    })

    return NextResponse.json(imovel)
  } catch (error) {
    console.error('Error fetching imovel:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar imóvel' },
      { status: 500 }
    )
  }
}
