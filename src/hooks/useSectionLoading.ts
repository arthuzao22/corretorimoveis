'use client'

import { useContext } from 'react'
import { LoadingContext } from '@/context/LoadingContext'

/**
 * Hook for managing section-level loading states
 * 
 * Provides isolated loading state for a specific section (modal, drawer, card)
 * without affecting global loading state
 * 
 * @param sectionId - Unique identifier for the section
 * 
 * @example
 * const { isLoading, start, stop } = useSectionLoading('lead-modal')
 * 
 * const handleSave = async () => {
 *   start()
 *   try {
 *     await saveData()
 *   } finally {
 *     stop()
 *   }
 * }
 */
export function useSectionLoading(sectionId: string) {
  const context = useContext(LoadingContext)
  
  if (context === undefined) {
    throw new Error('useSectionLoading must be used within a LoadingProvider')
  }

  const { startSectionLoading, stopSectionLoading, sectionLoadings } = context

  return {
    isLoading: sectionLoadings.get(sectionId) ?? false,
    start: () => startSectionLoading(sectionId),
    stop: () => stopSectionLoading(sectionId),
  }
}

/**
 * Hook for managing field-level loading states
 * 
 * Provides isolated loading state for a specific field (button, input)
 * 
 * @param fieldId - Unique identifier for the field
 * 
 * @example
 * const { isLoading, start, stop } = useFieldLoading('submit-button')
 */
export function useFieldLoading(fieldId: string) {
  const context = useContext(LoadingContext)
  
  if (context === undefined) {
    throw new Error('useFieldLoading must be used within a LoadingProvider')
  }

  const { startFieldLoading, stopFieldLoading, fieldLoadings } = context

  return {
    isLoading: fieldLoadings.get(fieldId) ?? false,
    start: () => startFieldLoading(fieldId),
    stop: () => stopFieldLoading(fieldId),
  }
}
