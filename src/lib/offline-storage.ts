/**
 * IndexedDB Manager for Offline-First Data Storage
 * Stores leads, properties, and pending requests for offline access
 */

export interface PendingRequest {
  id?: number
  url: string
  method: string
  body?: any
  headers?: Record<string, string>
  timestamp: number
  retryCount?: number
}

export interface AppState {
  key: string
  value: any
  timestamp: number
}

class OfflineStorage {
  private dbName = 'corretor-db'
  private version = 1
  private db: IDBDatabase | null = null
  private initPromise: Promise<IDBDatabase> | null = null

  /**
   * Initialize the IndexedDB database
   */
  async init(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db
    }

    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        console.error('❌ IndexedDB error:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('✅ IndexedDB initialized')
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Store for leads
        if (!db.objectStoreNames.contains('leads')) {
          const leadStore = db.createObjectStore('leads', { keyPath: 'id' })
          leadStore.createIndex('timestamp', 'timestamp', { unique: false })
          leadStore.createIndex('status', 'status', { unique: false })
        }
        
        // Store for properties (imoveis)
        if (!db.objectStoreNames.contains('imoveis')) {
          const imovelStore = db.createObjectStore('imoveis', { keyPath: 'id' })
          imovelStore.createIndex('timestamp', 'timestamp', { unique: false })
          imovelStore.createIndex('tipo', 'tipo', { unique: false })
        }
        
        // Store for pending requests (sync queue)
        if (!db.objectStoreNames.contains('pendingRequests')) {
          const requestStore = db.createObjectStore('pendingRequests', { 
            keyPath: 'id', 
            autoIncrement: true 
          })
          requestStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
        
        // Store for app state
        if (!db.objectStoreNames.contains('appState')) {
          db.createObjectStore('appState', { keyPath: 'key' })
        }
        
        console.log('✅ IndexedDB stores created')
      }
    })

    return this.initPromise
  }

  /**
   * Save a single item to a store
   */
  async save(store: string, data: any): Promise<void> {
    await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(store, 'readwrite')
      const objectStore = transaction.objectStore(store)
      const request = objectStore.put(data)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Save multiple items to a store
   */
  async saveMany(store: string, items: any[]): Promise<void> {
    await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(store, 'readwrite')
      const objectStore = transaction.objectStore(store)
      
      let completed = 0
      const total = items.length
      
      items.forEach(item => {
        const request = objectStore.put(item)
        request.onsuccess = () => {
          completed++
          if (completed === total) {
            resolve()
          }
        }
        request.onerror = () => reject(request.error)
      })
    })
  }

  /**
   * Get a single item from a store by key
   */
  async get<T = any>(store: string, key: string | number): Promise<T | null> {
    await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(store, 'readonly')
      const objectStore = transaction.objectStore(store)
      const request = objectStore.get(key)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get all items from a store
   */
  async getAll<T = any>(store: string): Promise<T[]> {
    await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(store, 'readonly')
      const objectStore = transaction.objectStore(store)
      const request = objectStore.getAll()

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get items from a store by index
   */
  async getByIndex<T = any>(
    store: string, 
    indexName: string, 
    value: any
  ): Promise<T[]> {
    await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(store, 'readonly')
      const objectStore = transaction.objectStore(store)
      const index = objectStore.index(indexName)
      const request = index.getAll(value)

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Remove a single item from a store
   */
  async remove(store: string, key: string | number): Promise<void> {
    await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(store, 'readwrite')
      const objectStore = transaction.objectStore(store)
      const request = objectStore.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Clear all items from a store
   */
  async clear(store: string): Promise<void> {
    await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(store, 'readwrite')
      const objectStore = transaction.objectStore(store)
      const request = objectStore.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Count items in a store
   */
  async count(store: string): Promise<number> {
    await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(store, 'readonly')
      const objectStore = transaction.objectStore(store)
      const request = objectStore.count()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Clear all data (useful for logout)
   */
  async clearAll(): Promise<void> {
    await this.init()
    const stores = ['leads', 'imoveis', 'pendingRequests', 'appState']
    
    await Promise.all(stores.map(store => this.clear(store)))
    console.log('✅ All offline data cleared')
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorage()
