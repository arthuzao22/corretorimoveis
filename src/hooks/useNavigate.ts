'use client'

import { useRouter } from 'next/navigation'
import { useLoading } from '@/context/LoadingContext'
import { useCallback } from 'react'

/**
 * Hook para navegação programática com loading automático
 * Use este hook quando precisar navegar via código (não via link)
 * 
 * @example
 * const { navigateTo, navigateBack } = useNavigate()
 * 
 * // Navegar para uma página
 * navigateTo('/dashboard')
 * 
 * // Voltar para página anterior
 * navigateBack()
 */
export function useNavigate() {
  const router = useRouter()
  const { startLoading } = useLoading()

  const navigateTo = useCallback((href: string) => {
    // Verifica se é mesma página
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      const targetPath = href.split('?')[0].split('#')[0]
      
      if (currentPath === targetPath) {
        router.push(href)
        return
      }
    }

    startLoading()
    router.push(href)
  }, [router, startLoading])

  const navigateBack = useCallback(() => {
    startLoading()
    router.back()
  }, [router, startLoading])

  const navigateReplace = useCallback((href: string) => {
    startLoading()
    router.replace(href)
  }, [router, startLoading])

  const navigateRefresh = useCallback(() => {
    startLoading()
    router.refresh()
  }, [router, startLoading])

  return {
    navigateTo,
    navigateBack,
    navigateReplace,
    navigateRefresh
  }
}
