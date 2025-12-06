import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    role: string
    corretorId?: string
    approved?: boolean
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role: string
      corretorId?: string
      approved?: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    corretorId?: string
    approved?: boolean
  }
}
