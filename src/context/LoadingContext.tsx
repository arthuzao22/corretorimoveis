'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface LoadingContextType {
  // Global loading (full page)
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
  
  // Section loading (modals, drawers, cards)
  sectionLoadings: Map<string, boolean>
  startSectionLoading: (sectionId: string) => void
  stopSectionLoading: (sectionId: string) => void
  
  // Field loading (buttons, inputs)
  fieldLoadings: Map<string, boolean>
  startFieldLoading: (fieldId: string) => void
  stopFieldLoading: (fieldId: string) => void
}

export const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  // Global loading state
  const [isLoading, setIsLoading] = useState(false)
  
  // Section loading states
  const [sectionLoadings, setSectionLoadings] = useState<Map<string, boolean>>(new Map())
  
  // Field loading states
  const [fieldLoadings, setFieldLoadings] = useState<Map<string, boolean>>(new Map())

  // Global loading controls
  const startLoading = useCallback(() => {
    setIsLoading(true)
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  // Section loading controls
  const startSectionLoading = useCallback((sectionId: string) => {
    setSectionLoadings(prev => {
      const next = new Map(prev)
      next.set(sectionId, true)
      return next
    })
  }, [])

  const stopSectionLoading = useCallback((sectionId: string) => {
    setSectionLoadings(prev => {
      const next = new Map(prev)
      next.delete(sectionId)
      return next
    })
  }, [])

  // Field loading controls
  const startFieldLoading = useCallback((fieldId: string) => {
    setFieldLoadings(prev => {
      const next = new Map(prev)
      next.set(fieldId, true)
      return next
    })
  }, [])

  const stopFieldLoading = useCallback((fieldId: string) => {
    setFieldLoadings(prev => {
      const next = new Map(prev)
      next.delete(fieldId)
      return next
    })
  }, [])

  return (
    <LoadingContext.Provider 
      value={{ 
        isLoading, 
        startLoading, 
        stopLoading,
        sectionLoadings,
        startSectionLoading,
        stopSectionLoading,
        fieldLoadings,
        startFieldLoading,
        stopFieldLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}
