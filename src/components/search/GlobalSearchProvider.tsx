'use client'

import { GlobalSearch } from './GlobalSearch'
import { useGlobalSearch } from '@/hooks/useGlobalSearch'

export function GlobalSearchProvider({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useGlobalSearch()

  return (
    <>
      {children}
      <GlobalSearch isOpen={isOpen} onClose={close} />
    </>
  )
}
