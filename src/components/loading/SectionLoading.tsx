'use client'

import { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface SectionLoadingProps {
  /** Whether loading is active */
  isLoading: boolean
  /** Unique section identifier */
  sectionId: string
  /** Loading variant */
  variant?: 'overlay' | 'skeleton' | 'spinner'
  /** Number of skeleton lines to show */
  skeletonLines?: number
  /** Children to render when not loading */
  children?: ReactNode
  /** Custom loading message */
  message?: string
  /** Color for spinner/loader */
  color?: string
}

/**
 * SectionLoading Component
 * 
 * Provides loading states for sections like modals, drawers, and cards.
 * Less intrusive than GlobalLoading, maintains visual context.
 * 
 * @example
 * <SectionLoading isLoading={isLoading} sectionId="lead-modal" variant="overlay">
 *   <div>Content here</div>
 * </SectionLoading>
 */
export function SectionLoading({
  isLoading,
  sectionId,
  variant = 'overlay',
  skeletonLines = 3,
  children,
  message = 'Carregando...',
  color = '#6366F1', // indigo-500
}: SectionLoadingProps) {
  // Overlay variant - shows spinner over content with semi-transparent backdrop
  if (variant === 'overlay') {
    return (
      <div className="relative" data-section-id={sectionId}>
        {children}
        
        {isLoading && (
          <div 
            className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-lg animate-in fade-in duration-200"
            role="status"
            aria-label={message}
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 
                className="w-8 h-8 animate-spin" 
                style={{ color }} 
              />
              <p className="text-sm text-gray-600 font-medium">
                {message}
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Skeleton variant - shows placeholder skeleton
  if (variant === 'skeleton') {
    if (isLoading) {
      return (
        <div className="animate-pulse space-y-4" data-section-id={sectionId}>
          {Array.from({ length: skeletonLines }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )
    }
    return <>{children}</>
  }

  // Spinner variant - shows just a centered spinner
  if (variant === 'spinner') {
    if (isLoading) {
      return (
        <div 
          className="flex items-center justify-center p-8" 
          data-section-id={sectionId}
          role="status"
          aria-label={message}
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 
              className="w-8 h-8 animate-spin" 
              style={{ color }} 
            />
            <p className="text-sm text-gray-600 font-medium">
              {message}
            </p>
          </div>
        </div>
      )
    }
    return <>{children}</>
  }

  return <>{children}</>
}

/**
 * Skeleton component for custom skeleton layouts
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded ${className}`} 
      role="status" 
      aria-label="Carregando..."
    />
  )
}

/**
 * SkeletonText - For text placeholders
 */
export function SkeletonText({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number
  className?: string 
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} 
        />
      ))}
    </div>
  )
}

/**
 * SkeletonCard - For card placeholders
 */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`border border-gray-200 rounded-lg p-4 space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  )
}
