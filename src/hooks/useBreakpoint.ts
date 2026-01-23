'use client'

import { useState, useEffect } from 'react'
import { BREAKPOINTS, getCurrentBreakpoint, type Breakpoint } from '@/lib/responsive'

/**
 * Hook to detect and track current responsive breakpoint
 * 
 * @returns Current breakpoint ('xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl')
 * 
 * @example
 * const breakpoint = useBreakpoint()
 * if (breakpoint === 'xs') {
 *   // Mobile layout
 * }
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'lg' // SSR default
    return getCurrentBreakpoint(window.innerWidth)
  })

  useEffect(() => {
    const handleResize = () => {
      const newBreakpoint = getCurrentBreakpoint(window.innerWidth)
      setBreakpoint(newBreakpoint)
    }

    // Set initial value
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return breakpoint
}

/**
 * Hook to check if current viewport matches a specific breakpoint or larger
 * 
 * @param breakpoint - The breakpoint to check
 * @returns true if current viewport is >= breakpoint
 * 
 * @example
 * const isDesktop = useBreakpointMatch('lg')
 */
export function useBreakpointMatch(breakpoint: Breakpoint): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth >= BREAKPOINTS[breakpoint]
  })

  useEffect(() => {
    const handleResize = () => {
      setMatches(window.innerWidth >= BREAKPOINTS[breakpoint])
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoint])

  return matches
}

/**
 * Hook to check if device is mobile (< md breakpoint)
 */
export function useIsMobile(): boolean {
  return !useBreakpointMatch('md')
}

/**
 * Hook to check if device is tablet (md to lg)
 */
export function useIsTablet(): boolean {
  const isMd = useBreakpointMatch('md')
  const isLg = useBreakpointMatch('lg')
  return isMd && !isLg
}

/**
 * Hook to check if device is desktop (>= lg)
 */
export function useIsDesktop(): boolean {
  return useBreakpointMatch('lg')
}

/**
 * Hook to get window dimensions
 */
export function useWindowDimensions() {
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768 }
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  })

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return dimensions
}
