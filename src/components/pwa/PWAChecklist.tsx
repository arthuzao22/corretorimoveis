'use client'

import { useEffect, useState } from 'react'
import { Check, AlertCircle, Loader2 } from 'lucide-react'

interface CheckItem {
  key: string
  label: string
  status: 'checking' | 'pass' | 'fail'
  description?: string
}

export function PWAChecklist() {
  const [checks, setChecks] = useState<CheckItem[]>([
    { key: 'https', label: 'HTTPS Ativo', status: 'checking' },
    { key: 'serviceWorker', label: 'Service Worker Suportado', status: 'checking' },
    { key: 'serviceWorkerActive', label: 'Service Worker Ativo', status: 'checking' },
    { key: 'manifest', label: 'Manifest.json Configurado', status: 'checking' },
    { key: 'icons', label: 'Ícones Configurados', status: 'checking' },
    { key: 'responsive', label: 'Meta Viewport', status: 'checking' },
    { key: 'cacheApi', label: 'Cache API', status: 'checking' },
    { key: 'indexedDb', label: 'IndexedDB', status: 'checking' },
    { key: 'notifications', label: 'Notificações', status: 'checking' },
    { key: 'offlinePage', label: 'Página Offline', status: 'checking' }
  ])

  useEffect(() => {
    const runChecks = async () => {
      const newChecks: CheckItem[] = []

      // 1. HTTPS
      const isSecure = window.location.protocol === 'https:' || 
                       window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1'
      newChecks.push({
        key: 'https',
        label: 'HTTPS Ativo',
        status: isSecure ? 'pass' : 'fail',
        description: isSecure ? 'Site servido via HTTPS' : 'Requer HTTPS para PWA'
      })

      // 2. Service Worker Support
      const swSupported = 'serviceWorker' in navigator
      newChecks.push({
        key: 'serviceWorker',
        label: 'Service Worker Suportado',
        status: swSupported ? 'pass' : 'fail',
        description: swSupported ? 'Navegador suporta Service Workers' : 'Navegador não suporta'
      })

      // 3. Service Worker Active
      let swActive = false
      if (swSupported) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations()
          swActive = registrations.length > 0 && registrations.some(r => r.active)
        } catch {
          swActive = false
        }
      }
      newChecks.push({
        key: 'serviceWorkerActive',
        label: 'Service Worker Ativo',
        status: swActive ? 'pass' : 'fail',
        description: swActive ? 'Service Worker registrado e ativo' : 'Aguardando registro'
      })

      // 4. Manifest
      const hasManifest = !!document.querySelector('link[rel="manifest"]')
      newChecks.push({
        key: 'manifest',
        label: 'Manifest.json Configurado',
        status: hasManifest ? 'pass' : 'fail',
        description: hasManifest ? 'Manifest encontrado' : 'Manifest não encontrado'
      })

      // 5. Icons
      const hasIcons = !!document.querySelector('link[rel="icon"]')
      newChecks.push({
        key: 'icons',
        label: 'Ícones Configurados',
        status: hasIcons ? 'pass' : 'fail',
        description: hasIcons ? 'Ícones do app configurados' : 'Faltam ícones'
      })

      // 6. Viewport
      const hasViewport = !!document.querySelector('meta[name="viewport"]')
      newChecks.push({
        key: 'responsive',
        label: 'Meta Viewport',
        status: hasViewport ? 'pass' : 'fail',
        description: hasViewport ? 'Meta viewport configurado' : 'Falta meta viewport'
      })

      // 7. Cache API
      const hasCacheApi = 'caches' in window
      newChecks.push({
        key: 'cacheApi',
        label: 'Cache API',
        status: hasCacheApi ? 'pass' : 'fail',
        description: hasCacheApi ? 'Cache API disponível' : 'Cache API não disponível'
      })

      // 8. IndexedDB
      const hasIndexedDb = !!window.indexedDB
      newChecks.push({
        key: 'indexedDb',
        label: 'IndexedDB',
        status: hasIndexedDb ? 'pass' : 'fail',
        description: hasIndexedDb ? 'IndexedDB disponível' : 'IndexedDB não disponível'
      })

      // 9. Notifications
      const hasNotifications = 'Notification' in window && 'PushManager' in window
      newChecks.push({
        key: 'notifications',
        label: 'Notificações',
        status: hasNotifications ? 'pass' : 'fail',
        description: hasNotifications ? 'Push Notifications suportadas' : 'Não suportadas'
      })

      // 10. Offline Page
      let hasOfflinePage = false
      if (swActive && 'caches' in window) {
        try {
          const cacheNames = await caches.keys()
          for (const name of cacheNames) {
            const cache = await caches.open(name)
            const response = await cache.match('/offline.html')
            if (response) {
              hasOfflinePage = true
              break
            }
          }
        } catch {
          hasOfflinePage = false
        }
      }
      newChecks.push({
        key: 'offlinePage',
        label: 'Página Offline',
        status: hasOfflinePage ? 'pass' : 'fail',
        description: hasOfflinePage ? 'Página offline em cache' : 'Página offline não encontrada'
      })

      setChecks(newChecks)
    }

    runChecks()
  }, [])

  const passed = checks.filter(c => c.status === 'pass').length
  const total = checks.length
  const percentage = Math.round((passed / total) * 100)

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">PWA Checklist</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">
            {passed}/{total}
          </span>
          <div className={`text-xs font-semibold px-2 py-1 rounded ${
            percentage === 100 ? 'bg-green-100 text-green-700' :
            percentage >= 70 ? 'bg-blue-100 text-blue-700' :
            percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {percentage}%
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {checks.map((check) => (
          <div 
            key={check.key} 
            className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 mt-0.5">
              {check.status === 'checking' ? (
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              ) : check.status === 'pass' ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${
                check.status === 'pass' ? 'text-gray-900' : 
                check.status === 'fail' ? 'text-red-600' : 
                'text-gray-500'
              }`}>
                {check.label}
              </p>
              {check.description && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {check.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {percentage === 100 && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800 font-medium">
            🎉 Todos os checks passaram! PWA totalmente configurado.
          </p>
        </div>
      )}
    </div>
  )
}
