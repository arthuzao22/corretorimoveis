'use client'

import { useEffect, useState } from 'react'

export function PWAStatus() {
  const [status, setStatus] = useState<{
    isSecure: boolean
    swSupported: boolean
    swInstalled: boolean
    isInstalled: boolean
  } | null>(null)

  useEffect(() => {
    const checkPWA = async () => {
      const isSecure =
        window.location.protocol === 'https:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'

      const swSupported = 'serviceWorker' in navigator
      let swInstalled = false

      if (swSupported) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        swInstalled = registrations.length > 0
      }

      const isInstalled =
        window.matchMedia('(display-mode: standalone)').matches ||
        // @ts-ignore
        (window.navigator.standalone === true)

      setStatus({
        isSecure,
        swSupported,
        swInstalled,
        isInstalled,
      })
    }

    checkPWA()
  }, [])

  if (!status) return null

  const allGood = status.isSecure && status.swSupported && status.swInstalled

  return (
    <div className="fixed bottom-4 right-4 max-w-sm z-50">
      <div className={`rounded-lg border shadow-lg p-4 ${
        status.isInstalled
          ? 'bg-green-50 border-green-200'
          : allGood
            ? 'bg-blue-50 border-blue-200'
            : 'bg-orange-50 border-orange-200'
      }`}>
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {status.isInstalled ? (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : allGood ? (
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0v.01M12 21a9 9 0 100-18 9 9 0 000 18z" />
              </svg>
            )}
          </div>
          <div className="flex-1 text-sm">
            {status.isInstalled && (
              <>
                <p className="font-semibold text-green-900">✅ App Instalado</p>
                <p className="text-green-700 text-xs">Você está rodando a versão instalada</p>
              </>
            )}
            {!status.isInstalled && allGood && (
              <>
                <p className="font-semibold text-blue-900">✅ PWA Pronto</p>
                <p className="text-blue-700 text-xs">
                  Service Worker ativo. Clique no botão &quot;Instalar&quot; no navegador.
                </p>
              </>
            )}
            {!allGood && (
              <>
                <p className="font-semibold text-orange-900">⚠️ PWA Não Ativo</p>
                <ul className="text-orange-700 text-xs mt-2 space-y-1">
                  {!status.isSecure && <li>❌ Requer HTTPS</li>}
                  {!status.swSupported && <li>❌ Service Workers não suportados</li>}
                  {status.swSupported && !status.swInstalled && <li>⏳ Service Worker instalando...</li>}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
