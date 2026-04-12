const CACHE_NAME = 'compiler-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/manifest.json',
    '/images/visual-studio-code-1.svg',
    'https://fonts.googleapis.com/icon?family=Material+Icons+Round'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    if (requestUrl.pathname === '/compile') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return new Response(
                    JSON.stringify({ error: "Network Error", details: "أنت في وضع عدم الاتصال (Offline). لا يمكن الوصول للمترجم." }),
                    { headers: { 'Content-Type': 'application/json' } }
                );
            })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request).then(networkResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    if (event.request.method === 'GET' && !requestUrl.protocol.startsWith('chrome-extension')) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            });
        })
    );
});