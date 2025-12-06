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
          console.log('User not found or inactive')
          return null
        }

        const isPasswordValid = await verifyPassword(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          console.log('Invalid password')
          return null
        }

        console.log('Login successful:', {
          email: user.email,
          role: user.role,
          hasAdmin: !!user.admin,
          hasCorretor: !!user.corretorProfile
        })

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
    signIn: '/login'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
}
