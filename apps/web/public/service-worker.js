const CACHE_VERSION = 'mtqh-shell-v1'
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/favicon-32.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-192-any.png',
  '/icons/icon-512-any.png',
  '/icons/apple-touch-icon.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(STATIC_ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))))
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/app') || url.pathname === '/login' || url.pathname === '/lupa-password' || url.pathname === '/akun-menunggu-aktivasi') return

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => {
      const copy = response.clone()
      event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.put('/', copy)))
      return response
    }).catch(async () => (await caches.match('/')) || caches.match('/offline.html')))
    return
  }

  if (['style', 'script', 'image', 'font'].includes(request.destination)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (!response.ok) return response
      const copy = response.clone()
      event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy)))
      return response
    })))
  }
})
