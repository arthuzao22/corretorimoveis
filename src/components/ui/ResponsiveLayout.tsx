'use client'

import React from 'react'
import { cn } from '@/lib/design-system'

// ===================================
// PAGE CONTAINER
// ===================================
interface PageContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

const maxWidthClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-[1536px]',
  full: 'max-w-full',
}

export function PageContainer({ 
  children, 
  className,
  maxWidth = 'xl'
}: PageContainerProps) {
  return (
    <div className={cn(
      'w-full mx-auto px-4 sm:px-6 lg:px-8',
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  )
}

// ===================================
// PAGE HEADER
// ===================================
interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  backButton?: React.ReactNode
  className?: string
}

export function PageHeader({ 
  title, 
  subtitle, 
  actions,
  backButton,
  className 
}: PageHeaderProps) {
  return (
    <div className={cn(
      'flex flex-col gap-4 mb-6 lg:mb-8',
      className
    )}>
      {/* Back button */}
      {backButton && (
        <div className="flex-shrink-0">
          {backButton}
        </div>
      )}
      
      {/* Title & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {subtitle}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

// ===================================
// RESPONSIVE GRID
// ===================================
interface ResponsiveGridProps {
  children: React.ReactNode
  columns?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ResponsiveGrid({ 
  children, 
  columns = { default: 1, sm: 2, lg: 3 },
  gap = 'md',
  className 
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4 lg:gap-6',
    lg: 'gap-6 lg:gap-8',
  }
  
  const getGridColsClass = () => {
    const classes = []
    if (columns.default) classes.push(`grid-cols-${columns.default}`)
    if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`)
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`)
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`)
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`)
    return classes.join(' ')
  }
  
  return (
    <div className={cn(
      'grid',
      getGridColsClass(),
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  )
}

// ===================================
// STACK (Flex Column)
// ===================================
interface StackProps {
  children: React.ReactNode
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Stack({ children, gap = 'md', className }: StackProps) {
  const gapClasses = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  }
  
  return (
    <div className={cn('flex flex-col', gapClasses[gap], className)}>
      {children}
    </div>
  )
}

// ===================================
// INLINE (Flex Row)
// ===================================
interface InlineProps {
  children: React.ReactNode
  gap?: 'xs' | 'sm' | 'md' | 'lg'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  wrap?: boolean
  className?: string
}

export function Inline({ 
  children, 
  gap = 'md', 
  align = 'center',
  justify = 'start',
  wrap = false,
  className 
}: InlineProps) {
  const gapClasses = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  }
  
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }
  
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  }
  
  return (
    <div className={cn(
      'flex',
      gapClasses[gap],
      alignClasses[align],
      justifyClasses[justify],
      wrap && 'flex-wrap',
      className
    )}>
      {children}
    </div>
  )
}

// ===================================
// SECTION
// ===================================
interface SectionProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
  padding?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Section({ 
  children, 
  title,
  description,
  actions,
  padding = 'md',
  className 
}: SectionProps) {
  const paddingClasses = {
    sm: 'py-4 lg:py-6',
    md: 'py-6 lg:py-8',
    lg: 'py-8 lg:py-12',
  }
  
  return (
    <section className={cn(paddingClasses[padding], className)}>
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 lg:mb-6">
          <div>
            {title && (
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-gray-500 mt-0.5">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  )
}

// ===================================
// DIVIDER
// ===================================
interface DividerProps {
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export function Divider({ className, orientation = 'horizontal' }: DividerProps) {
  if (orientation === 'vertical') {
    return <div className={cn('w-px h-full bg-gray-200', className)} />
  }
  
  return <hr className={cn('border-gray-200', className)} />
}

// ===================================
// EMPTY STATE
// ===================================
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      {icon && (
        <div className="w-16 h-16 text-gray-300 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-md mb-4">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  )
}

// ===================================
// SKELETON LOADERS
// ===================================
interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({ 
  className, 
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200'
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }
  
  return (
    <div 
      className={cn(baseClasses, variantClasses[variant], className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <Skeleton variant="rectangular" className="h-32 w-full mb-4" />
      <Skeleton className="w-3/4 mb-2" />
      <Skeleton className="w-1/2 mb-4" />
      <div className="flex gap-2">
        <Skeleton variant="circular" width={32} height={32} />
        <div className="flex-1">
          <Skeleton className="w-24 mb-1" />
          <Skeleton className="w-16" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b border-gray-50 flex gap-4">
          {[1, 2, 3, 4].map((j) => (
            <Skeleton key={j} className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// ===================================
// BADGE
// ===================================
interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ 
  children, 
  variant = 'default',
  size = 'sm',
  className 
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    success: 'bg-green-50 text-green-700 border-green-100',
    warning: 'bg-orange-50 text-orange-700 border-orange-100',
    danger: 'bg-red-50 text-red-700 border-red-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
  }
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1 font-medium rounded-full border',
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      {children}
    </span>
  )
}

// ===================================
// AVATAR
// ===================================
interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  }
  
  const initials = name
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'
  
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={cn(
          'rounded-full object-cover',
          sizeClasses[size],
          className
        )}
      />
    )
  }
  
  return (
    <div className={cn(
      'rounded-full bg-indigo-100 flex items-center justify-center font-semibold text-indigo-600',
      sizeClasses[size],
      className
    )}>
      {initials}
    </div>
  )
}
