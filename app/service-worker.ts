// Minimal service worker placeholder to enable build-time generation.
// This implementation provides basic offline caching behaviour and keeps
// TypeScript happy inside the Next.js app directory.

type ExtendableEventWithWaitUntil = Event & {
  waitUntil(promise: Promise<unknown> | void): void
}

type FetchEventWithMethods = ExtendableEventWithWaitUntil & {
  request: Request
  respondWith(promise: Promise<Response> | Response): void
}

const CACHE_NAME = 'nava-cache-v1'
const URLS_TO_CACHE: readonly string[] = ['/', '/workflows', '/screenshots', '/history']

self.addEventListener('install', (event: Event) => {
  const installEvent = event as ExtendableEventWithWaitUntil
  installEvent.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  )
})

self.addEventListener('fetch', (event: Event) => {
  const fetchEvent = event as FetchEventWithMethods
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(fetchEvent.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        const responseToCache = response.clone()

        void caches.open(CACHE_NAME).then((cache) => {
          cache.put(fetchEvent.request, responseToCache)
        })

        return response
      })
    })
  )
})

self.addEventListener('activate', (event: Event) => {
  const activateEvent = event as ExtendableEventWithWaitUntil
  activateEvent.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
          return undefined
        })
      )
    )
  )
})
