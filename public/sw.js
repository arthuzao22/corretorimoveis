// Service Worker para PWA
const CACHE_NAME = 'corretor-v1'
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-512.svg',
]

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('✅ Service Worker instalado')
      return cache.addAll(urlsToCache).catch(() => {
        // Continua mesmo se algum URL falhar
        console.warn('Alguns URLs não puderam ser cacheados')
      })
    })
  )
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🧹 Limpando cache antigo:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', event => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip API calls (let them fail gracefully)
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Offline' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      })
    )
    return
  }

  // Network first strategy
  event.respondWith(
    fetch(request)
      .then(response => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response
        }

        // Clone the response
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache)
        })

        return response
      })
      .catch(() => {
        // Return cached version or offline page
        return caches.match(request).then(cachedResponse => {
          return cachedResponse || new Response('Offline', { status: 503 })
        })
      })
  )
})
