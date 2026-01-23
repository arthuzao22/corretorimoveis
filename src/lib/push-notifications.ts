/**
 * Push Notifications Manager
 * Handles push notification subscriptions and showing notifications
 */

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  data?: any
  actions?: NotificationAction[]
  vibrate?: number[]
}

class PushNotificationManager {
  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    )
  }

  /**
   * Get current permission status
   */
  getPermission(): NotificationPermission {
    if (!this.isSupported()) {
      return 'denied'
    }
    return Notification.permission
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Push notifications not supported')
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    const permission = await Notification.requestPermission()
    console.log(`🔔 Notification permission: ${permission}`)
    return permission
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.isSupported()) {
      throw new Error('Push notifications not supported')
    }

    // Request permission first
    const permission = await this.requestPermission()
    if (permission !== 'granted') {
      console.warn('⚠️ Notification permission not granted')
      return null
    }

    try {
      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        // Create new subscription
        // Note: You'll need to set NEXT_PUBLIC_VAPID_PUBLIC_KEY in your .env
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        
        if (!vapidPublicKey) {
          console.warn('⚠️ VAPID public key not configured')
          return null
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
        })

        console.log('✅ Push subscription created')
      }

      return subscription
    } catch (error) {
      console.error('❌ Error subscribing to push:', error)
      throw error
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.isSupported()) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        const success = await subscription.unsubscribe()
        console.log('✅ Push subscription removed')
        return success
      }

      return true
    } catch (error) {
      console.error('❌ Error unsubscribing from push:', error)
      return false
    }
  }

  /**
   * Show a local notification (doesn't require push server)
   */
  async notify(options: NotificationOptions): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Notifications not supported')
    }

    const permission = await this.requestPermission()
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted')
    }

    try {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
        badge: options.badge || '/icons/icon-96x96.png',
        tag: options.tag || 'default',
        requireInteraction: options.requireInteraction || false,
        data: options.data || {},
        actions: options.actions,
        vibrate: options.vibrate || [200, 100, 200]
      })

      console.log('✅ Notification shown:', options.title)
    } catch (error) {
      console.error('❌ Error showing notification:', error)
      throw error
    }
  }

  /**
   * Send notification with predefined templates
   */
  async notifyNewLead(leadName: string, leadId: string): Promise<void> {
    await this.notify({
      title: '🎯 Novo Lead',
      body: `${leadName} demonstrou interesse em um imóvel`,
      tag: 'new-lead',
      data: { url: `/corretor/leads/${leadId}` },
      actions: [
        { action: 'view', title: 'Ver Lead' },
        { action: 'dismiss', title: 'Dispensar' }
      ]
    })
  }

  async notifyUpcomingEvent(eventTitle: string, eventId: string): Promise<void> {
    await this.notify({
      title: '📅 Evento Próximo',
      body: `${eventTitle} começa em breve`,
      tag: 'upcoming-event',
      requireInteraction: true,
      data: { url: `/corretor/eventos/${eventId}` },
      actions: [
        { action: 'view', title: 'Ver Evento' },
        { action: 'snooze', title: 'Lembrar em 10 min' }
      ]
    })
  }

  async notifyLeadStatusChange(leadName: string, newStatus: string, leadId: string): Promise<void> {
    await this.notify({
      title: '🔄 Status Atualizado',
      body: `${leadName} → ${newStatus}`,
      tag: 'lead-status',
      data: { url: `/corretor/leads/${leadId}` }
    })
  }

  /**
   * Helper: Convert VAPID key from base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
  }
}

// Singleton instance
export const pushNotificationManager = new PushNotificationManager()
