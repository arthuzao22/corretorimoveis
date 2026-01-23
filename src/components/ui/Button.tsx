import React from 'react'
import { cn, getButtonClasses, tailwindClasses } from '@/lib/design-system'
import { Loader2 } from 'lucide-react'

type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'success'
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
  /** Make button full width (100%) */
  fullWidth?: boolean
  /** Enable responsive sizing - smaller on mobile, larger on desktop */
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

  const sizeMap: Record<string, keyof typeof tailwindClasses.button.sizes> = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  }

  // Add responsive classes if enabled
  let responsiveClasses = ''
  if (responsive) {
    // Mobile: smaller, Desktop: normal or larger
    if (size === 'lg') {
      responsiveClasses = 'text-sm px-3 py-2 md:text-base md:px-6 md:py-3'
    } else if (size === 'md') {
      responsiveClasses = 'text-xs px-3 py-1.5 md:text-sm md:px-4 md:py-2'
    } else {
      responsiveClasses = 'text-xs px-2 py-1 md:text-sm md:px-3 md:py-1.5'
    }
  }

  return (
    <button
      className={cn(
        !responsive && getButtonClasses(variantMap[variant], sizeMap[size]),
        responsive && responsiveClasses,
        responsive && `rounded-lg font-medium transition-all`,
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
