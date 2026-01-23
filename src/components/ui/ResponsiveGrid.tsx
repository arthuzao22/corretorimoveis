'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/design-system'

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  /** Columns configuration using Tailwind grid classes */
  cols?: {
    xs?: number  // 1-12
    sm?: number  // 1-12
    md?: number  // 1-12
    lg?: number  // 1-12
    xl?: number  // 1-12
    '2xl'?: number  // 1-12
  }
  /** Gap size */
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  /** Whether items should have equal height */
  equalHeight?: boolean
}

/**
 * ResponsiveGrid Component
 * 
 * Simplified grid component that uses Tailwind's responsive grid utilities
 * Perfect for forms and card layouts
 * 
 * @example
 * <ResponsiveGrid cols={{ xs: 1, md: 2, lg: 3 }} gap="md">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </ResponsiveGrid>
 */
export function ResponsiveGrid({
  children,
  className = '',
  cols = { xs: 1, md: 2, lg: 3 },
  gap = 'md',
  equalHeight = false,
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  }

  // Build grid column classes
  const gridColClasses = []
  
  if (cols.xs) gridColClasses.push(`grid-cols-${cols.xs}`)
  if (cols.sm) gridColClasses.push(`sm:grid-cols-${cols.sm}`)
  if (cols.md) gridColClasses.push(`md:grid-cols-${cols.md}`)
  if (cols.lg) gridColClasses.push(`lg:grid-cols-${cols.lg}`)
  if (cols.xl) gridColClasses.push(`xl:grid-cols-${cols.xl}`)
  if (cols['2xl']) gridColClasses.push(`2xl:grid-cols-${cols['2xl']}`)

  return (
    <div
      className={cn(
        'grid',
        gridColClasses.join(' '),
        gapClasses[gap],
        equalHeight && 'auto-rows-fr',
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * GridItem - Optional wrapper for grid items with span control
 */
interface GridItemProps {
  children: ReactNode
  className?: string
  /** Column span per breakpoint */
  colSpan?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  /** Row span per breakpoint */
  rowSpan?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
}

export function GridItem({
  children,
  className = '',
  colSpan,
  rowSpan,
}: GridItemProps) {
  const spanClasses = []

  // Column spans
  if (colSpan?.xs) spanClasses.push(`col-span-${colSpan.xs}`)
  if (colSpan?.sm) spanClasses.push(`sm:col-span-${colSpan.sm}`)
  if (colSpan?.md) spanClasses.push(`md:col-span-${colSpan.md}`)
  if (colSpan?.lg) spanClasses.push(`lg:col-span-${colSpan.lg}`)
  if (colSpan?.xl) spanClasses.push(`xl:col-span-${colSpan.xl}`)
  if (colSpan?.['2xl']) spanClasses.push(`2xl:col-span-${colSpan['2xl']}`)

  // Row spans
  if (rowSpan?.xs) spanClasses.push(`row-span-${rowSpan.xs}`)
  if (rowSpan?.sm) spanClasses.push(`sm:row-span-${rowSpan.sm}`)
  if (rowSpan?.md) spanClasses.push(`md:row-span-${rowSpan.md}`)
  if (rowSpan?.lg) spanClasses.push(`lg:row-span-${rowSpan.lg}`)
  if (rowSpan?.xl) spanClasses.push(`xl:row-span-${rowSpan.xl}`)
  if (rowSpan?.['2xl']) spanClasses.push(`2xl:row-span-${rowSpan['2xl']}`)

  return (
    <div className={cn(spanClasses.join(' '), className)}>
      {children}
    </div>
  )
}
