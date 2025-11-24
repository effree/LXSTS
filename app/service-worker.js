/**
 * LXSTS Service Worker
 * Provides offline functionality and caches local assets
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `lxsts-${CACHE_VERSION}`;

// Static assets to cache on install
const STATIC_ASSETS = [
    // HTML pages
    '/',
    '/index.html',
    '/home.html',
    '/list.html',
    '/all.html',
    '/offline.html',

    // CSS
    '/css/styles.css',
    '/css/fonts.css',

    // JavaScript libraries
    '/lib/bootstrap/bootstrap.bundle.min.js',
    '/lib/jquery/jquery-1.12.4.min.js',
    '/lib/jquery-ui/jquery-ui.min.js',
    '/lib/jquery-ui/jquery-ui.min.css',

    // Application JavaScript
    '/js/api.js',
    '/js/init.js',
    '/js/list-editor.js',
    '/js/jquery.dirty.js',
    '/js/jquery.ui.touchpunch.js',
    '/js/fa.js',

    // Fonts - Montserrat
    '/fonts/montserrat/montserrat-v26-latin-regular.woff2',
    '/fonts/montserrat/montserrat-v26-latin-700.woff2',

    // Fonts - Lato
    '/fonts/lato/lato-v24-latin-regular.woff2',
    '/fonts/lato/lato-v24-latin-700.woff2',
    '/fonts/lato/lato-v24-latin-italic.woff2',
    '/fonts/lato/lato-v24-latin-700italic.woff2',

    // Icons
    '/favicon.ico',
    '/favicon-16x16.png',
    '/favicon-32x32.png',
    '/apple-touch-icon.png',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/site.webmanifest'
];

// Install event - cache all static assets
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Installation complete');
                return self.skipWaiting(); // Activate immediately
            })
            .catch(error => {
                console.error('[Service Worker] Installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => cacheName !== CACHE_NAME)
                        .map(cacheName => {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activation complete');
                return self.clients.claim(); // Take control immediately
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle same-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // API calls: Network-only (data must be fresh)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request).catch(() => {
                return new Response(
                    JSON.stringify({ error: 'You are offline. Please try again when connected.' }),
                    {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
            })
        );
        return;
    }

    // Static assets: Cache-first (fast loading)
    if (isStaticAsset(url.pathname)) {
        event.respondWith(
            caches.match(request)
                .then(cached => {
                    if (cached) {
                        return cached;
                    }

                    // Not in cache, fetch and cache it
                    return fetch(request).then(response => {
                        // Only cache successful responses
                        if (response && response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(request, responseClone);
                            });
                        }
                        return response;
                    });
                })
                .catch(() => {
                    // If both cache and network fail, return offline page for HTML
                    if (request.headers.get('accept').includes('text/html')) {
                        return caches.match('/offline.html');
                    }
                })
        );
        return;
    }

    // HTML pages: Network-first (always try to get latest)
    event.respondWith(
        fetch(request)
            .then(response => {
                // Cache the response for offline use
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(request).then(cached => {
                    return cached || caches.match('/offline.html');
                });
            })
    );
});

// Helper function to determine if a path is a static asset
function isStaticAsset(pathname) {
    const staticExtensions = ['.js', '.css', '.woff2', '.woff', '.ttf', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webmanifest'];
    return staticExtensions.some(ext => pathname.endsWith(ext)) ||
        pathname.startsWith('/lib/') ||
        pathname.startsWith('/fonts/');
}

// Listen for messages from the client
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});