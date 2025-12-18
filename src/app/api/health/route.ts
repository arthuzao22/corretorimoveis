import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    const responseTime = Date.now() - startTime

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'corretor-imoveis-api',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: {
          status: 'connected',
          responseTime: `${responseTime}ms`
        },
        api: {
          status: 'operational'
        }
      },
      uptime: process.uptime(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Content-Type': 'application/json',
      }
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'corretor-imoveis-api',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: {
          status: 'disconnected',
          responseTime: `${responseTime}ms`,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        api: {
          status: 'degraded'
        }
      },
      uptime: process.uptime(),
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Content-Type': 'application/json',
      }
    })
  }
}

// Optional: HEAD request for simple alive check
export async function HEAD() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return new NextResponse(null, { status: 200 })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}
