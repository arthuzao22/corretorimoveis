import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Se não houver token, redirecionar para login (rotas protegidas somente)
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
  // Match apenas as rotas realmente protegidas.
  // Deixamos as páginas públicas do corretor (ex: /corretor/[slug]) fora do matcher.
  matcher: [
    '/admin/:path*',
    '/corretor/dashboard',
    '/corretor/dashboard/:path*',
    '/corretor/imoveis',
    '/corretor/imoveis/:path*',
    '/corretor/leads',
    '/corretor/leads/:path*',
    '/corretor/minha-landing',
    '/corretor/minha-landing/:path*',
    '/corretor/calendario',
    '/corretor/calendario/:path*'
  ]
}

// Note: /lp/:path* is public and doesn't need authentication
