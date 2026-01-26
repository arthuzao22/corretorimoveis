/**
 * Background Sync Manager
 * Handles queuing and syncing of pending requests when back online
 */

import { offlineStorage, type PendingRequest } from './offline-storage'

class BackgroundSyncManager {
  private syncInProgress = false

  /**
   * Enqueue a pending request to be synced when back online
   */
  async enqueuePendingRequest(request: Omit<PendingRequest, 'id' | 'timestamp'>): Promise<void> {
    const pendingRequest: PendingRequest = {
      ...request,
      timestamp: Date.now(),
      retryCount: 0
    }

    await offlineStorage.save('pendingRequests', pendingRequest)
    console.log('📥 Request enqueued for sync:', request.url)

    // Try to register background sync if available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready
        await (registration as any).sync.register('sync-pending-requests')
        console.log('✅ Background sync registered')
      } catch (error) {
        console.warn('⚠️ Background sync not available:', error)
        // Fallback: try to sync immediately if online
        if (navigator.onLine) {
          this.syncPendingRequests()
        }
      }
    } else {
      // Fallback: try to sync immediately if online
      if (navigator.onLine) {
        this.syncPendingRequests()
      }
    }
  }

  /**
   * Sync all pending requests when back online
   */
  async syncPendingRequests(): Promise<void> {
    if (this.syncInProgress) {
      console.log('⏳ Sync already in progress')
      return
    }

    if (!navigator.onLine) {
      console.log('📡 Offline - sync postponed')
      return
    }

    this.syncInProgress = true
    console.log('🔄 Starting sync of pending requests...')

    try {
      const pendingRequests = await offlineStorage.getAll<PendingRequest>('pendingRequests')
      
      if (pendingRequests.length === 0) {
        console.log('✅ No pending requests to sync')
        return
      }

      console.log(`📤 Syncing ${pendingRequests.length} pending requests...`)

      let successCount = 0
      let failCount = 0

      for (const request of pendingRequests) {
        try {
          // Build fetch options
          const fetchOptions: RequestInit = {
            method: request.method,
            headers: {
              'Content-Type': 'application/json',
              ...request.headers
            }
          }

          if (request.body) {
            fetchOptions.body = JSON.stringify(request.body)
          }

          // Attempt to sync
          const response = await fetch(request.url, fetchOptions)

          if (response.ok) {
            // Success - remove from queue
            await offlineStorage.remove('pendingRequests', request.id!)
            successCount++
            console.log(`✅ Synced: ${request.url}`)
          } else {
            // Server error - increment retry count
            const updatedRequest = {
              ...request,
              retryCount: (request.retryCount || 0) + 1
            }

            // Remove if max retries reached (10)
            if (updatedRequest.retryCount >= 10) {
              await offlineStorage.remove('pendingRequests', request.id!)
              failCount++
              console.error(`❌ Max retries reached for: ${request.url}`)
            } else {
              await offlineStorage.save('pendingRequests', updatedRequest)
              failCount++
              console.warn(`⚠️ Sync failed (retry ${updatedRequest.retryCount}): ${request.url}`)
            }
          }
        } catch (error) {
          // Network error - keep in queue
          const updatedRequest = {
            ...request,
            retryCount: (request.retryCount || 0) + 1
          }

          if (updatedRequest.retryCount >= 10) {
            await offlineStorage.remove('pendingRequests', request.id!)
            failCount++
            console.error(`❌ Max retries reached for: ${request.url}`)
          } else {
            await offlineStorage.save('pendingRequests', updatedRequest)
            failCount++
            console.error(`❌ Network error syncing: ${request.url}`, error)
          }
        }
      }

      console.log(`✅ Sync complete: ${successCount} success, ${failCount} failed`)

      // Notify app of sync completion
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_COMPLETE',
          success: successCount,
          failed: failCount
        })
      }
    } catch (error) {
      console.error('❌ Error during sync:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  /**
   * Get count of pending requests
   */
  async getPendingCount(): Promise<number> {
    return await offlineStorage.count('pendingRequests')
  }

  /**
   * Get all pending requests
   */
  async getPendingRequests(): Promise<PendingRequest[]> {
    return await offlineStorage.getAll<PendingRequest>('pendingRequests')
  }

  /**
   * Clear all pending requests
   */
  async clearPendingRequests(): Promise<void> {
    await offlineStorage.clear('pendingRequests')
    console.log('✅ All pending requests cleared')
  }
}

// Singleton instance
export const backgroundSyncManager = new BackgroundSyncManager()

// Setup auto-sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('📡 Connection restored - syncing...')
    backgroundSyncManager.syncPendingRequests()
  })
}
