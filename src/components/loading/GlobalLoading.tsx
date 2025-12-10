'use client'

import { useLoading } from '@/context/LoadingContext'
import { useEffect, useState } from 'react'

interface GlobalLoadingProps {
  /** Variante do loading: 'spinner' | 'dots' | 'pulse' */
  variant?: 'spinner' | 'dots' | 'pulse'
  /** Cor primária do loading */
  color?: string
  /** Texto exibido durante o loading */
  text?: string
  /** Mostrar texto */
  showText?: boolean
}

export function GlobalLoading({ 
  variant = 'spinner',
  color = '#2563eb', // blue-600
  text = 'Carregando...',
  showText = true
}: GlobalLoadingProps) {
  const { isLoading } = useLoading()
  const [visible, setVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isLoading) {
      setShouldRender(true)
      // Pequeno delay para permitir a animação de entrada
      requestAnimationFrame(() => {
        setVisible(true)
      })
    } else {
      setVisible(false)
      // Aguarda a animação de saída antes de remover do DOM
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (!shouldRender) return null

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      role="alert"
      aria-busy="true"
      aria-label="Carregando página"
    >
      <div className={`flex flex-col items-center gap-4 transition-transform duration-300 ${
        visible ? 'scale-100' : 'scale-95'
      }`}>
        {/* Spinner Variant */}
        {variant === 'spinner' && (
          <div className="relative">
            <div 
              className="w-12 h-12 rounded-full border-4 border-gray-200"
              style={{ borderTopColor: color }}
            >
              <style jsx>{`
                div {
                  animation: spin 1s linear infinite;
                }
                @keyframes spin {
                  to {
                    transform: rotate(360deg);
                  }
                }
              `}</style>
            </div>
            {/* Brilho interno */}
            <div 
              className="absolute inset-0 w-12 h-12 rounded-full opacity-20"
              style={{ 
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)` 
              }}
            />
          </div>
        )}

        {/* Dots Variant */}
        {variant === 'dots' && (
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full"
                style={{ 
                  backgroundColor: color,
                  animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`
                }}
              />
            ))}
            <style jsx>{`
              @keyframes bounce {
                0%, 80%, 100% {
                  transform: scale(0.6);
                  opacity: 0.5;
                }
                40% {
                  transform: scale(1);
                  opacity: 1;
                }
              }
            `}</style>
          </div>
        )}

        {/* Pulse Variant */}
        {variant === 'pulse' && (
          <div className="relative flex items-center justify-center">
            <div 
              className="w-16 h-16 rounded-full opacity-75"
              style={{ 
                backgroundColor: color,
                animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
              }}
            />
            <div 
              className="absolute w-10 h-10 rounded-full"
              style={{ backgroundColor: color }}
            />
            <style jsx>{`
              @keyframes ping {
                75%, 100% {
                  transform: scale(1.5);
                  opacity: 0;
                }
              }
            `}</style>
          </div>
        )}

        {/* Loading Text */}
        {showText && (
          <p className="text-gray-600 font-medium text-sm animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  )
}
