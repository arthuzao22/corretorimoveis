'use client'

import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAStatus {
  isInstalled: boolean
  isInstallable: boolean
  isIOS: boolean
  isAndroid: boolean
  isStandalone: boolean
  isMobile: boolean
}

let deferredPrompt: BeforeInstallPromptEvent | null = null

export function usePWA() {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isInstallable: false,
    isIOS: false,
    isAndroid: false,
    isStandalone: false,
    isMobile: false,
  })

  useEffect(() => {
    // Detectar plataforma
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)
    const isMobile = isIOS || isAndroid
    
    // Detectar se está em modo standalone (instalado)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://') ||
      new URLSearchParams(window.location.search).get('source') === 'pwa'

    setStatus(prev => ({
      ...prev,
      isIOS,
      isAndroid,
      isMobile,
      isStandalone,
      isInstalled: isStandalone,
    }))

    // Listener para evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      deferredPrompt = e as BeforeInstallPromptEvent
      setStatus(prev => ({ ...prev, isInstallable: true }))
    }

    // Listener para quando app é instalado
    const handleAppInstalled = () => {
      deferredPrompt = null
      setStatus(prev => ({ 
        ...prev, 
        isInstalled: true, 
        isInstallable: false 
      }))
    }

    // Listener para mudança de display mode
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setStatus(prev => ({ 
        ...prev, 
        isStandalone: e.matches,
        isInstalled: e.matches,
      }))
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    
    const displayModeQuery = window.matchMedia('(display-mode: standalone)')
    displayModeQuery.addEventListener('change', handleDisplayModeChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      displayModeQuery.removeEventListener('change', handleDisplayModeChange)
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.warn('Install prompt not available')
      return false
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        deferredPrompt = null
        setStatus(prev => ({ 
          ...prev, 
          isInstallable: false,
          isInstalled: true,
        }))
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error prompting install:', error)
      return false
    }
  }, [])

  return {
    ...status,
    promptInstall,
  }
}

// Componente para prompt de instalação
interface InstallPromptProps {
  onDismiss?: () => void
}

export function InstallPrompt({ onDismiss }: InstallPromptProps) {
  const { isInstallable, isIOS, isStandalone, promptInstall } = usePWA()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Verificar se já foi dispensado anteriormente
    const wasDismissed = localStorage.getItem('pwa-install-dismissed')
    if (wasDismissed) {
      const dismissedTime = parseInt(wasDismissed, 10)
      // Se foi dispensado há menos de 7 dias, não mostrar
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true)
      }
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    setDismissed(true)
    onDismiss?.()
  }

  const handleInstall = async () => {
    const success = await promptInstall()
    if (success) {
      handleDismiss()
    }
  }

  // Não mostrar se já está instalado, foi dispensado ou não é instalável
  if (isStandalone || dismissed) return null

  // Prompt para iOS (instruções manuais)
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm">Instalar Portal Corretor</h3>
            <p className="text-xs text-gray-500 mt-1">
              Toque no botão de compartilhar{' '}
              <svg className="inline w-4 h-4 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {' '}e depois em "Adicionar à Tela Inicial"
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  // Prompt para Android/Desktop
  if (!isInstallable) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">Instalar Portal Corretor</h3>
          <p className="text-xs text-gray-500 mt-1">
            Instale o app para acesso rápido e funcionar offline
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Instalar
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-gray-600 text-xs font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-500"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Componente utilitário para detectar se está em PWA
export function PWAOnly({ children }: { children: React.ReactNode }) {
  const { isStandalone } = usePWA()
  
  if (!isStandalone) return null
  
  return <>{children}</>
}

// Componente utilitário para mostrar apenas em browser
export function BrowserOnly({ children }: { children: React.ReactNode }) {
  const { isStandalone } = usePWA()
  
  if (isStandalone) return null
  
  return <>{children}</>
}
