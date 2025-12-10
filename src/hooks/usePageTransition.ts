'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useLoading } from '@/context/LoadingContext'

export function usePageTransition() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { stopLoading } = useLoading()

  useEffect(() => {
    // Quando a rota muda, para o loading
    stopLoading()
  }, [pathname, searchParams, stopLoading])

  return null
}
