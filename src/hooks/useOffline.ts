'use client'

import { useState, useEffect } from 'react'

export interface OfflineStatus {
  isOnline: boolean
  isOffline: boolean
  wasOffline: boolean
  effectiveType?: string
  downlink?: number
  rtt?: number
}

/**
 * Hook to monitor online/offline status and network quality
 */
export function useOffline() {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    wasOffline: false
  })

  useEffect(() => {
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine
      
      setStatus(prev => ({
        isOnline,
        isOffline: !isOnline,
        wasOffline: prev.isOffline,
        // @ts-expect-error - NetworkInformation API
        effectiveType: navigator.connection?.effectiveType,
        // @ts-expect-error - NetworkInformation API
        downlink: navigator.connection?.downlink,
        // @ts-expect-error - NetworkInformation API
        rtt: navigator.connection?.rtt
      }))

      // Log status change
      if (isOnline) {
        console.log('📡 Connection restored')
      } else {
        console.log('📡 Connection lost')
      }
    }

    // Listen to online/offline events
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Listen to connection changes (if available)
    // @ts-expect-error - NetworkInformation API
    if (navigator.connection) {
      // @ts-expect-error - NetworkInformation API
      navigator.connection.addEventListener('change', updateOnlineStatus)
    }

    // Initial update
    updateOnlineStatus()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      // @ts-expect-error - NetworkInformation API
      if (navigator.connection) {
        // @ts-expect-error - NetworkInformation API
        navigator.connection.removeEventListener('change', updateOnlineStatus)
      }
    }
  }, [])

  return status
}
