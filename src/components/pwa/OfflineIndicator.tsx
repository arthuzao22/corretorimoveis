'use client'

import { useEffect, useState } from 'react'
import { WifiOff, Wifi, CloudOff } from 'lucide-react'
import { useOffline } from '@/hooks/useOffline'
import { backgroundSyncManager } from '@/lib/background-sync'

export function OfflineIndicator() {
  const { isOnline, isOffline, wasOffline } = useOffline()
  const [pendingCount, setPendingCount] = useState(0)
  const [showIndicator, setShowIndicator] = useState(false)
  const [showReconnectedBanner, setShowReconnectedBanner] = useState(false)

  useEffect(() => {
    // Update pending count
    const updatePendingCount = async () => {
      const count = await backgroundSyncManager.getPendingCount()
      setPendingCount(count)
    }

    updatePendingCount()
    const interval = setInterval(updatePendingCount, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const updateIndicator = () => {
      if (isOffline) {
        setShowIndicator(true)
      } else {
        setShowIndicator(false)
        
        // Show reconnected banner briefly if was offline
        if (wasOffline) {
          setShowReconnectedBanner(true)
          setTimeout(() => setShowReconnectedBanner(false), 3000)
        }
      }
    }

    updateIndicator()
  }, [isOnline, isOffline, wasOffline])

  // Reconnected banner
  if (showReconnectedBanner) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300">
        <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <Wifi className="w-4 h-4" />
          <span className="text-sm font-medium">
            Conexão restaurada
            {pendingCount > 0 && ` • Sincronizando ${pendingCount} ${pendingCount === 1 ? 'item' : 'itens'}...`}
          </span>
        </div>
      </div>
    )
  }

  // Offline indicator
  if (!showIndicator) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300">
      <div className="bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Você está offline</span>
            {pendingCount > 0 && (
              <span className="text-xs text-orange-100">
                {pendingCount} {pendingCount === 1 ? 'alteração pendente' : 'alterações pendentes'}
              </span>
            )}
          </div>
          <CloudOff className="w-4 h-4 ml-2" />
        </div>
      </div>
    </div>
  )
}
