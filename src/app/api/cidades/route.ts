import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cidades = await prisma.cidade.findMany({
      where: {
        ativo: true,
      },
      select: {
        id: true,
        nome: true,
        uf: true,
        slug: true,
      },
      orderBy: [
        { nome: 'asc' },
      ],
    })

    return NextResponse.json({ success: true, cidades })
  } catch (error) {
    console.error('Error fetching cidades:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
}
