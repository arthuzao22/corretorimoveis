/**
 * Responsive Utilities and Breakpoint System
 * 
 * Provides breakpoint constants and utilities for responsive design
 * Following mobile-first approach
 */

/**
 * Breakpoint definitions matching Tailwind CSS defaults
 */
export const BREAKPOINTS = {
  xs: 0,      // Mobile (0-640px)
  sm: 640,    // Tablet small (640px+)
  md: 768,    // Tablet (768px+)
  lg: 1024,   // Desktop small (1024px+)
  xl: 1280,   // Desktop (1280px+)
  '2xl': 1536 // Desktop large (1536px+)
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/**
 * Breakpoint labels for display purposes
 */
export const BREAKPOINT_LABELS: Record<Breakpoint, string> = {
  xs: 'Mobile',
  sm: 'Tablet Small',
  md: 'Tablet',
  lg: 'Desktop',
  xl: 'Desktop Large',
  '2xl': 'Desktop XL'
}

/**
 * Get the current breakpoint based on window width
 */
export function getCurrentBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS['2xl']) return '2xl'
  if (width >= BREAKPOINTS.xl) return 'xl'
  if (width >= BREAKPOINTS.lg) return 'lg'
  if (width >= BREAKPOINTS.md) return 'md'
  if (width >= BREAKPOINTS.sm) return 'sm'
  return 'xs'
}

/**
 * Check if current width matches a breakpoint
 */
export function isBreakpoint(width: number, breakpoint: Breakpoint): boolean {
  return width >= BREAKPOINTS[breakpoint]
}

/**
 * Check if device is mobile
 */
export function isMobile(width: number): boolean {
  return width < BREAKPOINTS.md
}

/**
 * Check if device is tablet
 */
export function isTablet(width: number): boolean {
  return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg
}

/**
 * Check if device is desktop
 */
export function isDesktop(width: number): boolean {
  return width >= BREAKPOINTS.lg
}

/**
 * Responsive value selector
 * Returns the appropriate value based on current breakpoint
 */
export function getResponsiveValue<T>(
  width: number,
  values: Partial<Record<Breakpoint, T>>,
  defaultValue: T
): T {
  const bp = getCurrentBreakpoint(width)
  
  // Try to find value for current breakpoint or fallback to smaller ones
  const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs']
  const currentIndex = breakpointOrder.indexOf(bp)
  
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const key = breakpointOrder[i]
    if (values[key] !== undefined) {
      return values[key] as T
    }
  }
  
  return defaultValue
}

/**
 * Touch device detection
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Grid column calculator for responsive layouts
 */
export function getResponsiveColumns(
  width: number,
  cols?: Partial<Record<Breakpoint, number>>
): number {
  if (!cols) {
    // Default responsive columns
    if (width >= BREAKPOINTS.xl) return 4
    if (width >= BREAKPOINTS.lg) return 3
    if (width >= BREAKPOINTS.md) return 2
    return 1
  }
  
  return getResponsiveValue(width, cols, 1)
}

/**
 * Spacing calculator for responsive layouts
 */
export function getResponsiveSpacing(
  width: number,
  spacing?: Partial<Record<Breakpoint, string>>
): string {
  const defaultSpacing: Partial<Record<Breakpoint, string>> = {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
  }
  
  return getResponsiveValue(width, spacing || defaultSpacing, '1rem')
}
