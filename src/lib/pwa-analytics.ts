/**
 * PWA Analytics
 * Monitor cache usage, performance metrics, and PWA health
 */

export interface CacheMetrics {
  usage: number
  quota: number
  percentUsed: number
  caches: Record<string, number>
}

export interface PWAMetrics {
  timestamp: Date
  isOnline: boolean
  isInstalled: boolean
  serviceWorkerActive: boolean
  cacheMetrics: CacheMetrics | null
  userAgent: string
  networkType?: string
  effectiveType?: string
}

class PWAAnalytics {
  /**
   * Get storage estimation (cache size)
   */
  async getCacheSize(): Promise<StorageEstimate | null> {
    if ('estimate' in navigator.storage) {
      try {
        return await navigator.storage.estimate()
      } catch (error) {
        console.error('❌ Error getting cache size:', error)
        return null
      }
    }
    return null
  }

  /**
   * Get detailed cache metrics
   */
  async getCacheMetrics(): Promise<CacheMetrics | null> {
    if (!('caches' in window)) {
      return null
    }

    try {
      const estimate = await this.getCacheSize()
      const cacheNames = await caches.keys()
      
      const sizes: Record<string, number> = {}
      for (const name of cacheNames) {
        const cache = await caches.open(name)
        const keys = await cache.keys()
        sizes[name] = keys.length
      }

      return {
        usage: estimate?.usage || 0,
        quota: estimate?.quota || 0,
        percentUsed: estimate?.usage && estimate?.quota 
          ? (estimate.usage / estimate.quota) * 100 
          : 0,
        caches: sizes
      }
    } catch (error) {
      console.error('❌ Error getting cache metrics:', error)
      return null
    }
  }

  /**
   * Check if app is installed (standalone mode)
   */
  isAppInstalled(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-ignore
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://') ||
      new URLSearchParams(window.location.search).get('source') === 'pwa'
    )
  }

  /**
   * Check if service worker is active
   */
  async isServiceWorkerActive(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      return registrations.length > 0 && registrations.some(r => r.active)
    } catch (error) {
      return false
    }
  }

  /**
   * Get comprehensive PWA metrics
   */
  async getMetrics(): Promise<PWAMetrics> {
    return {
      timestamp: new Date(),
      isOnline: navigator.onLine,
      isInstalled: this.isAppInstalled(),
      serviceWorkerActive: await this.isServiceWorkerActive(),
      cacheMetrics: await this.getCacheMetrics(),
      userAgent: navigator.userAgent,
      // @ts-ignore - NetworkInformation API
      networkType: navigator.connection?.type,
      // @ts-ignore
      effectiveType: navigator.connection?.effectiveType
    }
  }

  /**
   * Log metrics to console (useful for debugging)
   */
  async logMetrics(): Promise<void> {
    const metrics = await this.getMetrics()
    console.group('📊 PWA Metrics')
    console.log('Timestamp:', metrics.timestamp.toISOString())
    console.log('Online:', metrics.isOnline ? '✅' : '❌')
    console.log('Installed:', metrics.isInstalled ? '✅' : '❌')
    console.log('Service Worker:', metrics.serviceWorkerActive ? '✅' : '❌')
    
    if (metrics.cacheMetrics) {
      console.log('Cache Usage:', 
        `${(metrics.cacheMetrics.usage / 1024 / 1024).toFixed(2)} MB / ${(metrics.cacheMetrics.quota / 1024 / 1024).toFixed(2)} MB (${metrics.cacheMetrics.percentUsed.toFixed(2)}%)`
      )
      console.log('Caches:', metrics.cacheMetrics.caches)
    }
    
    if (metrics.effectiveType) {
      console.log('Network:', metrics.effectiveType)
    }
    
    console.groupEnd()
  }

  /**
   * Send metrics to analytics endpoint (optional)
   */
  async sendMetrics(endpoint: string = '/api/analytics/pwa'): Promise<void> {
    try {
      const metrics = await this.getMetrics()
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      })
      console.log('✅ Metrics sent to analytics')
    } catch (error) {
      console.error('❌ Error sending metrics:', error)
    }
  }

  /**
   * Clear all caches (useful for debugging)
   */
  async clearAllCaches(): Promise<void> {
    if (!('caches' in window)) {
      return
    }

    try {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
      console.log('✅ All caches cleared')
    } catch (error) {
      console.error('❌ Error clearing caches:', error)
    }
  }

  /**
   * Get service worker version
   */
  async getServiceWorkerVersion(): Promise<string | null> {
    if (!('serviceWorker' in navigator)) {
      return null
    }

    try {
      if (!navigator.serviceWorker.controller) {
        return null
      }

      return new Promise((resolve) => {
        const messageChannel = new MessageChannel()
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.version || null)
        }
        
        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_VERSION' },
          [messageChannel.port2]
        )

        // Timeout after 1 second
        setTimeout(() => resolve(null), 1000)
      })
    } catch (error) {
      return null
    }
  }
}

// Singleton instance
export const pwaAnalytics = new PWAAnalytics()
