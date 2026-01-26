/**
 * Notification Badge Manager
 * Handles app badge updates on the installed PWA icon
 */

class NotificationBadgeManager {
  /**
   * Check if Badge API is supported
   */
  isSupported(): boolean {
    return 'setAppBadge' in navigator && 'clearAppBadge' in navigator
  }

  /**
   * Set app badge count
   */
  async setBadge(count: number): Promise<void> {
    if (!this.isSupported()) {
      console.warn('⚠️ Badge API not supported')
      return
    }

    try {
      if (count > 0) {
        await (navigator as any).setAppBadge(count)
        console.log(`✅ Badge set to ${count}`)
      } else {
        await this.clearBadge()
      }
    } catch (error) {
      console.error('❌ Error setting badge:', error)
    }
  }

  /**
   * Clear app badge
   */
  async clearBadge(): Promise<void> {
    if (!this.isSupported()) {
      return
    }

    try {
      await (navigator as any).clearAppBadge()
      console.log('✅ Badge cleared')
    } catch (error) {
      console.error('❌ Error clearing badge:', error)
    }
  }

  /**
   * Increment badge count
   */
  async incrementBadge(amount: number = 1): Promise<void> {
    // Note: There's no API to get current badge count
    // You'll need to track this in your app state or localStorage
    const currentCount = this.getCurrentCount()
    await this.setBadge(currentCount + amount)
    this.saveCount(currentCount + amount)
  }

  /**
   * Decrement badge count
   */
  async decrementBadge(amount: number = 1): Promise<void> {
    const currentCount = this.getCurrentCount()
    const newCount = Math.max(0, currentCount - amount)
    await this.setBadge(newCount)
    this.saveCount(newCount)
  }

  /**
   * Get current badge count from localStorage
   */
  private getCurrentCount(): number {
    if (typeof window === 'undefined') return 0
    const count = localStorage.getItem('app-badge-count')
    return count ? parseInt(count, 10) : 0
  }

  /**
   * Save badge count to localStorage
   */
  private saveCount(count: number): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('app-badge-count', count.toString())
  }
}

// Singleton instance
export const badgeManager = new NotificationBadgeManager()
