'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export interface UserData {
  id: string
  name?: string | null
  email?: string | null
  role: 'ADMIN' | 'CORRETOR' | 'VISITANTE'
  corretorId?: string
  approved?: boolean
}

export function useUser() {
  const { data: session, status } = useSession()
  const [slug, setSlug] = useState<string | null>(null)
  const loading = status === 'loading'

  useEffect(() => {
    // Buscar slug do corretor se disponível
    if (session?.user?.corretorId) {
      fetch(`/api/corretor/${session.user.corretorId}/slug`)
        .then(res => res.json())
        .then(data => setSlug(data.slug))
        .catch(() => setSlug(null))
    }
  }, [session?.user?.corretorId])

  const user: UserData | null = session?.user ? {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: (session.user.role as 'ADMIN' | 'CORRETOR') || 'VISITANTE',
    corretorId: session.user.corretorId,
    approved: session.user.approved
  } : null

  return {
    user,
    role: user?.role || 'VISITANTE',
    slug,
    loading,
    isAuthenticated: !!session
  }
}
