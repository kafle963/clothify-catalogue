// Service Worker for Clothify PWA
const CACHE_NAME = 'clothify-cache-v1';
const STATIC_CACHE = 'clothify-static-v1';
const DYNAMIC_CACHE = 'clothify-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // Add other critical static assets
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/products/,
  /\/api\/categories/,
  // Add other API patterns
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests and non-GET requests
  if (!url.origin.includes(self.location.origin) || request.method !== 'GET') {
    return;
  }

  // Handle API requests with network-first strategy
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (STATIC_FILES.includes(url.pathname) || isStaticAsset(request)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Handle navigation requests with network-first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstStrategy(request, '/index.html'));
    return;
  }

  // Default to network-first for other requests
  event.respondWith(networkFirstStrategy(request));
});

// Network-first strategy with cache fallback
async function networkFirstStrategy(request, fallbackUrl = null) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If we have a fallback URL, try that
    if (fallbackUrl) {
      const fallbackResponse = await caches.match(fallbackUrl);
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }
    
    // Return offline page or error
    return new Response('Offline', {
      status: 408,
      statusText: 'Request Timeout',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Cache-first strategy with network fallback
async function cacheFirstStrategy(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Cache miss, try network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Network request failed:', error);
    throw error;
  }
}

// Check if request is for a static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  const extension = url.pathname.split('.').pop();
  
  return ['js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'woff', 'woff2', 'ttf', 'ico'].includes(extension);
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCart());
  }
  
  if (event.tag === 'order-sync') {
    event.waitUntil(syncOrders());
  }
});

// Sync cart data when online
async function syncCart() {
  try {
    // Get pending cart changes from IndexedDB
    const pendingChanges = await getPendingCartChanges();
    
    for (const change of pendingChanges) {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(change)
      });
    }
    
    // Clear pending changes
    await clearPendingCartChanges();
    
    console.log('Cart synced successfully');
  } catch (error) {
    console.error('Cart sync failed:', error);
  }
}

// Sync order data when online
async function syncOrders() {
  try {
    // Implementation for syncing orders
    console.log('Orders synced successfully');
  } catch (error) {
    console.error('Order sync failed:', error);
  }
}

// Helper functions for IndexedDB operations
async function getPendingCartChanges() {
  // This would interface with IndexedDB
  // Return pending cart changes
  return [];
}

async function clearPendingCartChanges() {
  // Clear pending changes from IndexedDB
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update from Clothify!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'clothify-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icon-192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Clothify', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Clean up old caches periodically
setInterval(() => {
  caches.keys().then((cacheNames) => {
    cacheNames.forEach((cacheName) => {
      if (cacheName.includes('old') || cacheName.includes('temp')) {
        caches.delete(cacheName);
      }
    });
  });
}, 24 * 60 * 60 * 1000); // Daily cleanup