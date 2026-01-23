'use client'

import { useLoading } from '@/context/LoadingContext'
import { useEffect, useState } from 'react'

interface GlobalLoadingProps {
  /** Variante do loading: 'spinner' | 'dots' | 'pulse' | 'progress' */
  variant?: 'spinner' | 'dots' | 'pulse' | 'progress'
  /** Cor primária do loading */
  color?: string
  /** Texto exibido durante o loading */
  text?: string
  /** Mostrar texto */
  showText?: boolean
  /** Progresso de 0-100 (apenas para variant='progress') */
  progress?: number
  /** Etapas do processo de loading */
  steps?: string[]
  /** Índice da etapa atual (0-based) */
  currentStep?: number
  /** Mostrar backdrop com blur */
  showBackdrop?: boolean
}

export function GlobalLoading({ 
  variant = 'spinner',
  color = '#2563eb', // blue-600
  text = 'Carregando...',
  showText = true,
  progress = 0,
  steps,
  currentStep,
  showBackdrop = true,
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

  const backdropClass = showBackdrop 
    ? 'bg-white/80 backdrop-blur-sm' 
    : 'bg-transparent pointer-events-none'

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center ${backdropClass} transition-opacity duration-300 ${
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

        {/* Progress Bar Variant */}
        {variant === 'progress' && (
          <div className="w-64">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.max(0, progress))}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            {progress > 0 && (
              <div className="text-center mt-2 text-xs text-gray-500">
                {Math.round(progress)}%
              </div>
            )}
          </div>
        )}

        {/* Loading Text */}
        {showText && (
          <p className="text-gray-600 font-medium text-sm animate-pulse">
            {text}
          </p>
        )}

        {/* Steps Progress */}
        {steps && steps.length > 0 && (
          <div className="mt-2 space-y-1.5 min-w-[250px]">
            {steps.map((step, index) => {
              const isComplete = currentStep !== undefined && index < currentStep
              const isCurrent = currentStep === index
              const isPending = currentStep !== undefined && index > currentStep

              return (
                <div
                  key={index}
                  className={`flex items-center gap-2 text-xs transition-opacity ${
                    isPending ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  {/* Step indicator */}
                  <div
                    className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isComplete
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'border-2 text-gray-600'
                        : 'border border-gray-300 text-gray-400'
                    }`}
                    style={isCurrent ? { borderColor: color } : undefined}
                  >
                    {isComplete ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span className="text-[10px]">{index + 1}</span>
                    )}
                  </div>

                  {/* Step text */}
                  <span
                    className={`${
                      isCurrent ? 'text-gray-800 font-medium' : 'text-gray-600'
                    }`}
                  >
                    {step}
                  </span>

                  {/* Current spinner */}
                  {isCurrent && (
                    <div
                      className="w-3 h-3 border-2 border-gray-300 border-t-transparent rounded-full animate-spin ml-auto"
                      style={{ borderTopColor: color }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
