import React from 'react'
import { cn, getButtonClasses, tailwindClasses } from '@/lib/design-system'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'success'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
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

  return (
    <button
      className={cn(
        getButtonClasses(variantMap[variant], sizeMap[size]),
        isLoading && 'opacity-70 cursor-wait',
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
