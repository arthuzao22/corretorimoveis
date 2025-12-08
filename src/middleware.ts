import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Se não houver token, deixar o withAuth lidar
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Verificar se admin está tentando acessar área de corretor
    if (path.startsWith('/corretor') && token.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }

    // Verificar se corretor está tentando acessar área de admin
    if (path.startsWith('/admin') && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/corretor/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/corretor/:path*',
    '/admin/:path*'
  ]
}

// Note: /lp/:path* is public and doesn't need authentication
