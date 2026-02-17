import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getClientIp, RateLimitPresets } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // SECURITY: Rate limiting to prevent abuse
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(`imovel-status:${ip}`, RateLimitPresets.VERY_LENIENT)
    
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

    return NextResponse.json(
      { success: true, data: statusList },
      {
        headers: {
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
        }
      }
    )
  } catch (error) {
    console.error('Error fetching imovel status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch property status' },
      { status: 500 }
    )
  }
}
