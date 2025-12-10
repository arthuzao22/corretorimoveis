'use client'

import { Suspense } from 'react'
import { usePageTransition } from '@/hooks/usePageTransition'

function PageTransitionHandlerInner() {
  usePageTransition()
  return null
}

export function PageTransitionHandler() {
  return (
    <Suspense fallback={null}>
      <PageTransitionHandlerInner />
    </Suspense>
  )
}
