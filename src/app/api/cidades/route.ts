import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getClientIp, RateLimitPresets } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // SECURITY: Rate limiting to prevent abuse
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(`cidades:${ip}`, RateLimitPresets.VERY_LENIENT)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: rateLimitResult.error },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
          }
        }
      )
    }

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

    return NextResponse.json(
      { success: true, data: cidades },
      {
        headers: {
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
        }
      }
    )
  } catch (error) {
    console.error('Error fetching cidades:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
}
