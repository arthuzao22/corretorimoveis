import React from 'react'
import { cn, getButtonClasses, tailwindClasses } from '@/lib/design-system'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'success'
  size?: 'sm' | 'md' | 'lg' | {
    xs?: 'sm' | 'md'
    sm?: 'sm' | 'md'
    md?: 'md' | 'lg'
    lg?: 'md' | 'lg'
  }
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
  /** Make button full width (100%) */
  fullWidth?: boolean
  /** Enable responsive sizing automatically */
  responsive?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  fullWidth = false,
  responsive = false,
  ...props
}: ButtonProps) {
  // Mapear variantes para o design system
  const variantMap: Record<string, keyof typeof tailwindClasses.button.variants> = {
    primary: 'primary',
    secondary: 'secondary',
    danger: 'danger',
    outline: 'outline',
    ghost: 'ghost',
    success: 'success',
  }

  // Handle responsive sizing
  let responsiveClasses = ''
  if (responsive || typeof size === 'object') {
    const sizeConfig = typeof size === 'object' ? size : { xs: 'sm', md: 'md', lg: 'lg' }
    
    // Build responsive size classes
    const sizeClasses = []
    if (sizeConfig.xs) {
      sizeClasses.push(getButtonClasses(variantMap[variant], sizeConfig.xs))
    }
    if (sizeConfig.sm) {
      sizeClasses.push(`sm:${getButtonClasses(variantMap[variant], sizeConfig.sm)}`)
    }
    if (sizeConfig.md) {
      sizeClasses.push(`md:${getButtonClasses(variantMap[variant], sizeConfig.md)}`)
    }
    if (sizeConfig.lg) {
      sizeClasses.push(`lg:${getButtonClasses(variantMap[variant], sizeConfig.lg)}`)
    }
    
    responsiveClasses = sizeClasses.join(' ')
  }

  const sizeMap: Record<string, keyof typeof tailwindClasses.button.sizes> = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  }

  const baseSize = typeof size === 'string' ? size : 'md'

  return (
    <button
      className={cn(
        responsiveClasses || getButtonClasses(variantMap[variant], sizeMap[baseSize]),
        isLoading && 'opacity-70 cursor-wait',
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : leftIcon}
      
      <span className={cn(isLoading && 'ml-0')}>{children}</span>
      
      {!isLoading && rightIcon}
    </button>
  )
}
