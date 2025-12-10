import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const statusList = await prisma.imovelStatusConfig.findMany({
      where: {
        ativo: true,
      },
      select: {
        id: true,
        nome: true,
        slug: true,
        cor: true,
        ordem: true,
      },
      orderBy: {
        ordem: 'asc',
      },
    })

    return NextResponse.json({ success: true, statusList })
  } catch (error) {
    console.error('Error fetching imovel status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch property status' },
      { status: 500 }
    )
  }
}
