'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'

export function InstallPrompt() {
  const { isInstallable, isIOS, isStandalone, promptInstall } = usePWA()
  const [dismissed, setDismissed] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if already dismissed
    const wasDismissed = localStorage.getItem('pwa-install-dismissed')
    if (wasDismissed) {
      const dismissedTime = parseInt(wasDismissed, 10)
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true)
        return
      }
    }

    // Show prompt after 3 seconds if installable and not already installed
    if ((isInstallable || isIOS) && !isStandalone) {
      const timer = setTimeout(() => setShowPrompt(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [isInstallable, isIOS, isStandalone])

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    setDismissed(true)
    setShowPrompt(false)
  }

  const handleInstall = async () => {
    const success = await promptInstall()
    if (success) {
      handleDismiss()
    }
  }

  // Don't show if already installed or dismissed
  if (isStandalone || dismissed || !showPrompt) {
    return null
  }

  // iOS prompt with manual instructions
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-5 duration-500">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl shadow-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex-shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Instalar Portal Corretor</h3>
              <p className="text-xs text-indigo-100 mt-1">
                Toque em{' '}
                <svg className="inline w-4 h-4 -mt-0.5 mx-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
                {' '}e depois em &quot;Adicionar à Tela Inicial&quot;
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleDismiss}
                  className="flex-1 px-3 py-1.5 bg-white/20 backdrop-blur text-white text-xs font-medium rounded-lg hover:bg-white/30 transition-colors"
                >
                  Entendi
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-indigo-200 hover:text-white transition-colors flex-shrink-0"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Android/Desktop prompt with install button
  if (!isInstallable) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex-shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Instalar Portal Corretor</h3>
            <p className="text-xs text-indigo-100 mt-1">
              Acesse seus leads e imóveis offline, receba notificações e tenha acesso mais rápido
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="flex-1 px-3 py-2 bg-white text-indigo-600 text-xs font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Instalar Agora
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 bg-white/20 backdrop-blur text-white text-xs font-medium rounded-lg hover:bg-white/30 transition-colors"
              >
                Agora não
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-indigo-200 hover:text-white transition-colors flex-shrink-0"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
