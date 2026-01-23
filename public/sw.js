// Enhanced Service Worker with modular cache strategies
const VERSION = '2.0.0'
const CACHE_PREFIX = 'corretor'

// Cache configurations with TTL and strategies
const CACHE_STRATEGIES = {
  static: {
    name: `${CACHE_PREFIX}-static-v1`,
    ttl: 365 * 24 * 60 * 60, // 1 year
    strategy: 'cache-first'
  },
  api: {
    name: `${CACHE_PREFIX}-api-v1`,
    ttl: 7 * 24 * 60 * 60, // 7 days
    strategy: 'stale-while-revalidate'
  },
  html: {
    name: `${CACHE_PREFIX}-html-v1`,
    ttl: 24 * 60 * 60, // 1 day
    strategy: 'network-first'
  },
  images: {
    name: `${CACHE_PREFIX}-images-v1`,
    ttl: 30 * 24 * 60 * 60, // 30 days
    strategy: 'cache-first'
  }
}

// Static assets to pre-cache
const PRECACHE_URLS = [
  '/offline.html',
  '/manifest.json',
  '/icons/icon-512.svg'
]

// Helper: Get cache name based on URL
function getCacheConfig(url) {
  if (url.includes('/api/')) return CACHE_STRATEGIES.api
  if (url.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i)) return CACHE_STRATEGIES.images
  if (url.match(/\.(js|css|woff|woff2|ttf|eot)$/i)) return CACHE_STRATEGIES.static
  return CACHE_STRATEGIES.html
}

// Helper: Check if cached response is still valid (TTL)
function isCacheValid(cachedResponse, ttl) {
  if (!cachedResponse) return false
  
  const cachedTime = cachedResponse.headers.get('sw-cached-time')
  if (!cachedTime) return true // No timestamp, assume valid
  
  const now = Date.now()
  const age = now - parseInt(cachedTime, 10)
  return age < ttl * 1000
}

// Helper: Add timestamp to response
function addCacheTimestamp(response) {
  const clonedResponse = response.clone()
  const headers = new Headers(clonedResponse.headers)
  headers.set('sw-cached-time', Date.now().toString())
  
  return clonedResponse.blob().then(body => {
    return new Response(body, {
      status: clonedResponse.status,
      statusText: clonedResponse.statusText,
      headers: headers
    })
  })
}

// Strategy: Network-First (try network, fallback to cache)
async function networkFirst(request, cacheName, ttl) {
  try {
    const response = await fetch(request)
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName)
      const responseToCache = await addCacheTimestamp(response)
      cache.put(request, responseToCache.clone())
      return response
    }
    return response
  } catch (error) {
    const cached = await caches.match(request)
    if (cached && isCacheValid(cached, ttl)) {
      return cached
    }
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html')
    }
    throw error
  }
}

// Strategy: Cache-First (use cache, fallback to network)
async function cacheFirst(request, cacheName, ttl) {
  const cached = await caches.match(request)
  if (cached && isCacheValid(cached, ttl)) {
    return cached
  }
  
  try {
    const response = await fetch(request)
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName)
      const responseToCache = await addCacheTimestamp(response)
      cache.put(request, responseToCache.clone())
    }
    return response
  } catch (error) {
    if (cached) return cached
    throw error
  }
}

// Strategy: Stale-While-Revalidate (return cache immediately, update in background)
async function staleWhileRevalidate(request, cacheName, ttl) {
  const cached = await caches.match(request)
  
  const fetchPromise = fetch(request).then(async response => {
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName)
      const responseToCache = await addCacheTimestamp(response)
      cache.put(request, responseToCache.clone())
    }
    return response
  }).catch(() => cached)
  
  // Return cached version immediately if valid, otherwise wait for network
  if (cached && isCacheValid(cached, ttl)) {
    return cached
  }
  
  return fetchPromise
}

// Install event
self.addEventListener('install', event => {
  console.log(`✅ Service Worker v${VERSION} installing...`)
  
  event.waitUntil(
    caches.open(CACHE_STRATEGIES.static.name).then(cache => {
      return cache.addAll(PRECACHE_URLS).catch(err => {
        console.warn('⚠️ Some precache URLs failed:', err)
      })
    }).then(() => {
      console.log('✅ Service Worker installed successfully')
      return self.skipWaiting()
    })
  )
})

// Activate event
self.addEventListener('activate', event => {
  console.log(`🔄 Service Worker v${VERSION} activating...`)
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      // Delete old caches
      const validCacheNames = Object.values(CACHE_STRATEGIES).map(s => s.name)
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!validCacheNames.includes(cacheName) && cacheName.startsWith(CACHE_PREFIX)) {
            console.log('🧹 Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('✅ Service Worker activated')
      return self.clients.claim()
    })
  )
})

// Fetch event
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return
  }

  // Skip authentication requests (always go to network)
  if (url.pathname.includes('/api/auth/')) {
    return
  }

  // Get cache configuration
  const config = getCacheConfig(url.href)
  
  // Apply appropriate strategy
  event.respondWith(
    (async () => {
      try {
        switch (config.strategy) {
          case 'network-first':
            return await networkFirst(request, config.name, config.ttl)
          case 'cache-first':
            return await cacheFirst(request, config.name, config.ttl)
          case 'stale-while-revalidate':
            return await staleWhileRevalidate(request, config.name, config.ttl)
          default:
            return await fetch(request)
        }
      } catch (error) {
        console.error('Fetch error:', error)
        
        // For navigation, show offline page
        if (request.mode === 'navigate') {
          const offlinePage = await caches.match('/offline.html')
          if (offlinePage) return offlinePage
        }
        
        // Return error response
        return new Response('Network error', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' })
        })
      }
    })()
  )
})

// Background Sync - for pending requests when back online
self.addEventListener('sync', event => {
  console.log('🔄 Background sync triggered:', event.tag)
  
  if (event.tag === 'sync-pending-requests') {
    event.waitUntil(syncPendingRequests())
  }
})

// Helper: Sync pending requests from IndexedDB
async function syncPendingRequests() {
  // This would integrate with IndexedDB to sync pending requests
  console.log('📤 Syncing pending requests...')
  // Implementation would go here when IndexedDB is ready
}

// Push notification event
self.addEventListener('push', event => {
  console.log('📬 Push notification received')
  
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Corretor Imobiliário'
  const options = {
    body: data.body || 'Nova notificação',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    data: data.data || {}
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification clicked:', event.notification.tag)
  event.notification.close()
  
  const urlToOpen = event.notification.data?.url || '/corretor/dashboard'
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      // Check if there's already a window open
      for (const client of clients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      // Open new window if none found
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen)
      }
    })
  )
})

// Message event - for communication with clients
self.addEventListener('message', event => {
  console.log('📨 Message received:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: VERSION })
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.startsWith(CACHE_PREFIX)) {
              return caches.delete(cacheName)
            }
          })
        )
      }).then(() => {
        event.ports[0].postMessage({ success: true })
      })
    )
  }
})

console.log(`🚀 Service Worker v${VERSION} loaded`)
