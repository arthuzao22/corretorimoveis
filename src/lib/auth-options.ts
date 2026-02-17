import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            corretorProfile: true,
            admin: true
          }
        })

        if (!user || !user.active) {
          return null
        }

        const isPasswordValid = await verifyPassword(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          corretorId: user.corretorProfile?.id,
          approved: user.corretorProfile?.approved || false
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.corretorId = user.corretorId
        token.approved = user.approved
      }
      
      // SECURITY: Validate user is still active on every request
      // This prevents disabled users from using cached JWT tokens
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { active: true, role: true }
        })
        
        // If user is inactive or deleted, invalidate the token
        if (!dbUser || !dbUser.active) {
          return {} as any // Return empty token to force logout
        }
        
        // Update role if it changed (e.g., promoted/demoted)
        if (dbUser.role !== token.role) {
          token.role = dbUser.role
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.corretorId = token.corretorId as string
        session.user.approved = token.approved as boolean
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Se a URL já é absoluta e é do mesmo domínio, usar ela
      if (url.startsWith(baseUrl)) return url
      // Se começa com /, é relativa ao baseUrl
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Caso contrário, redirecionar para o baseUrl
      return baseUrl
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/signout',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 dias (reduzido de 30 dias por segurança)
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production'
}
