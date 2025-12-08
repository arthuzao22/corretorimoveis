import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ corretorId: string }> }
) {
  try {
    const { corretorId } = await params
    
    const corretor = await prisma.corretorProfile.findUnique({
      where: { id: corretorId },
      select: { slug: true }
    })

    if (!corretor) {
      return NextResponse.json({ error: 'Corretor não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ slug: corretor.slug })
  } catch (error) {
    console.error('Error fetching corretor slug:', error)
    return NextResponse.json({ error: 'Erro ao buscar slug' }, { status: 500 })
  }
}
