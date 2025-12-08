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

    // Bloquear acesso à área de admin para não-admins
    if (path.startsWith('/admin') && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/403', req.url))
    }

    // Bloquear acesso à área de corretor para não-corretores
    if (path.startsWith('/corretor') && token.role !== 'CORRETOR') {
      return NextResponse.redirect(new URL('/403', req.url))
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

// Rotas públicas que não precisam de autenticação:
// - /lp/:path* (landing pages públicas)
// - /imovel/:path* (páginas de imóveis públicas)
// - /(public)/corretor/:slug (perfil público do corretor)
// - /login, /register, / (home)

