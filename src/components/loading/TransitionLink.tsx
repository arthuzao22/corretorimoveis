'use client'

import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/navigation'
import { useLoading } from '@/context/LoadingContext'
import { ReactNode, MouseEvent } from 'react'

interface TransitionLinkProps extends LinkProps {
  children: ReactNode
  className?: string
  target?: string
  rel?: string
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
}

/**
 * Link com transição de loading automática
 * Use este componente ao invés do Link padrão para ter loading automático
 */
export function TransitionLink({ 
  children, 
  href, 
  className,
  target,
  rel,
  onClick,
  ...props 
}: TransitionLinkProps) {
  const router = useRouter()
  const { startLoading } = useLoading()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Executa onClick personalizado se existir
    if (onClick) {
      onClick(e)
    }

    // Se for link externo ou com target, não intercepta
    if (target === '_blank' || typeof href === 'string' && (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:'))) {
      return
    }

    // Se o evento foi prevenido, não faz nada
    if (e.defaultPrevented) {
      return
    }

    // Se é mesma página (hash link), não mostra loading
    const currentPath = window.location.pathname
    const targetPath = typeof href === 'string' ? href.split('?')[0].split('#')[0] : href.pathname
    
    if (currentPath === targetPath) {
      return
    }

    // Inicia o loading
    startLoading()
  }

  return (
    <Link 
      href={href} 
      className={className}
      target={target}
      rel={rel}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  )
}
