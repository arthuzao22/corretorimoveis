import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { serializeImovel } from '@/lib/utils/serializers'
import { checkRateLimit, getClientIp, RateLimitPresets } from '@/lib/rate-limit'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // SECURITY: Rate limiting to prevent view count manipulation
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(`imovel-view:${ip}:${id}`, RateLimitPresets.LENIENT)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
          }
        }
      )
    }
    
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

    // SECURITY FIX: Increment views only if rate limit allows
    // This prevents bots from artificially inflating view counts
    // Rate limit is 30 views per minute per IP per property
    await prisma.imovel.update({
      where: { id },
      data: {
        views: {
          increment: 1
        }
      }
    })

    // Converter Decimal para número
    const imovelSerializado = serializeImovel(imovel)

    return NextResponse.json(imovelSerializado, {
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching imovel:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar imóvel' },
      { status: 500 }
    )
  }
}
