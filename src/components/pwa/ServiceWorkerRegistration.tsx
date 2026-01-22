'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Only register in browser
    if (typeof window === 'undefined') return

    // Só ativa em HTTPS ou localhost
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers não são suportados')
      return
    }

    const isSecure = window.location.protocol === 'https:' || 
                     window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1'

    if (!isSecure) {
      console.warn('Service Workers requerem HTTPS ou localhost')
      return
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registrado:', registration)
        
        // Check for updates a cada hora
        setInterval(() => {
          registration.update()
        }, 3600000)
      })
      .catch(error => {
        console.error('❌ Service Worker registration falhou:', error)
      })

    // Listen for SW updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Novo Service Worker ativado')
      // Aqui você pode mostrar um toast pedindo para o usuário recarregar
    })
  }, [])

  return null
}
