'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { LandingTheme, landingThemePresets, generateThemeCSS } from '@/types/landing'

interface LandingThemeContextType {
  theme: LandingTheme
  cssVariables: React.CSSProperties
}

const LandingThemeContext = createContext<LandingThemeContextType | null>(null)

export function useLandingTheme() {
  const context = useContext(LandingThemeContext)
  if (!context) {
    throw new Error('useLandingTheme must be used within a LandingThemeProvider')
  }
  return context
}

interface LandingThemeProviderProps {
  children: React.ReactNode
  theme?: Partial<LandingTheme> | null
}

export function LandingThemeProvider({ children, theme: customTheme }: LandingThemeProviderProps) {
  // Mesclar tema customizado com tema padrão
  const theme = useMemo<LandingTheme>(() => {
    const defaultTheme = landingThemePresets['modern-blue']
    
    if (!customTheme) return defaultTheme
    
    // Se tiver um ID de preset, usar como base
    const baseTheme = customTheme.id && landingThemePresets[customTheme.id] 
      ? landingThemePresets[customTheme.id]
      : defaultTheme

    return {
      ...baseTheme,
      ...customTheme,
      colors: { ...baseTheme.colors, ...customTheme.colors },
      typography: { ...baseTheme.typography, ...customTheme.typography },
      spacing: { ...baseTheme.spacing, ...customTheme.spacing },
      style: { ...baseTheme.style, ...customTheme.style },
    }
  }, [customTheme])

  // Gerar variáveis CSS
  const cssVariables = useMemo<React.CSSProperties>(() => ({
    '--landing-primary': theme.colors.primary,
    '--landing-secondary': theme.colors.secondary,
    '--landing-accent': theme.colors.accent,
    '--landing-background': theme.colors.background,
    '--landing-surface': theme.colors.surface,
    '--landing-text': theme.colors.text,
    '--landing-heading': theme.colors.heading,
    '--landing-muted': theme.colors.muted,
  } as React.CSSProperties), [theme])

  return (
    <LandingThemeContext.Provider value={{ theme, cssVariables }}>
      <style dangerouslySetInnerHTML={{ __html: generateThemeCSS(theme) }} />
      {children}
    </LandingThemeContext.Provider>
  )
}

// Componentes estilizados que usam o tema
interface ThemedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function ThemedButton({ 
  variant = 'primary', 
  size = 'md',
  className = '',
  children,
  ...props 
}: ThemedButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50'
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }
  
  const variants = {
    primary: 'bg-[var(--landing-primary)] text-white hover:opacity-90',
    secondary: 'bg-[var(--landing-secondary)] text-white hover:opacity-90',
    outline: 'border-2 border-[var(--landing-primary)] text-[var(--landing-primary)] hover:bg-[var(--landing-primary)] hover:text-white',
  }

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} rounded-[var(--landing-border-radius)] ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

interface ThemedHeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4'
  children: React.ReactNode
  className?: string
}

export function ThemedHeading({ as: Component = 'h2', children, className = '' }: ThemedHeadingProps) {
  const sizes = {
    h1: 'text-4xl md:text-5xl lg:text-6xl',
    h2: 'text-3xl md:text-4xl lg:text-5xl',
    h3: 'text-2xl md:text-3xl',
    h4: 'text-xl md:text-2xl',
  }

  return (
    <Component 
      className={`font-[var(--landing-heading-font)] font-[var(--landing-heading-weight)] text-[var(--landing-heading)] ${sizes[Component]} ${className}`}
      style={{ fontFamily: 'var(--landing-heading-font)' }}
    >
      {children}
    </Component>
  )
}

interface ThemedTextProps {
  children: React.ReactNode
  className?: string
  muted?: boolean
}

export function ThemedText({ children, className = '', muted = false }: ThemedTextProps) {
  return (
    <p 
      className={`font-[var(--landing-body-font)] text-[${muted ? 'var(--landing-muted)' : 'var(--landing-text)'}] ${className}`}
      style={{ 
        fontFamily: 'var(--landing-body-font)',
        color: muted ? 'var(--landing-muted)' : 'var(--landing-text)',
      }}
    >
      {children}
    </p>
  )
}

interface ThemedSectionProps {
  children: React.ReactNode
  className?: string
  surface?: boolean
}

export function ThemedSection({ children, className = '', surface = false }: ThemedSectionProps) {
  return (
    <section 
      className={`py-[var(--landing-section-padding)] ${className}`}
      style={{ 
        backgroundColor: surface ? 'var(--landing-surface)' : 'var(--landing-background)',
      }}
    >
      <div 
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 'var(--landing-content-width)' }}
      >
        {children}
      </div>
    </section>
  )
}

interface ThemedCardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
}

export function ThemedCard({ children, className = '', hoverable = false }: ThemedCardProps) {
  return (
    <div 
      className={`
        bg-[var(--landing-surface)] 
        rounded-[var(--landing-border-radius)] 
        shadow-[var(--landing-shadow)]
        ${hoverable ? 'hover:shadow-lg transition-shadow duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
