'use client'

import { ReactNode } from 'react'
import { useWindowDimensions } from '@/hooks/useBreakpoint'
import { getResponsiveColumns, getResponsiveSpacing, type Breakpoint } from '@/lib/responsive'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  /** Number of columns per breakpoint */
  cols?: Partial<Record<Breakpoint, number>>
  /** Gap/spacing per breakpoint */
  gap?: Partial<Record<Breakpoint, string>>
  /** Whether to use grid or flex layout */
  layout?: 'grid' | 'flex'
  /** Alignment for flex layout */
  align?: 'start' | 'center' | 'end' | 'stretch'
  /** Justify content for flex layout */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

/**
 * ResponsiveContainer Component
 * 
 * Provides responsive grid or flex container with breakpoint-based columns and spacing
 * 
 * @example
 * <ResponsiveContainer cols={{ xs: 1, md: 2, lg: 3 }} gap={{ xs: '1rem', lg: '2rem' }}>
 *   <Card />
 *   <Card />
 *   <Card />
 * </ResponsiveContainer>
 */
export function ResponsiveContainer({
  children,
  className = '',
  cols,
  gap,
  layout = 'grid',
  align = 'stretch',
  justify = 'start',
}: ResponsiveContainerProps) {
  const { width } = useWindowDimensions()
  
  const columns = getResponsiveColumns(width, cols)
  const spacing = getResponsiveSpacing(width, gap)

  const alignMap = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }

  const justifyMap = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  }

  if (layout === 'grid') {
    return (
      <div
        className={`grid ${alignMap[align]} ${className}`}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: spacing,
        }}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      className={`flex flex-wrap ${alignMap[align]} ${justifyMap[justify]} ${className}`}
      style={{
        gap: spacing,
      }}
    >
      {children}
    </div>
  )
}
