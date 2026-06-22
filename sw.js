/**
 * Service Worker — cache-first offline strategy.
 * Bump CACHE_NAME when assets change to force a fresh install.
 */

const CACHE_NAME = 'workout-v3';

const ASSETS = [
    '/index.html',
    '/manifest.json',
    '/css/style.css',
    '/js/data.js',
    '/js/audio.js',
    '/js/workout.js',
    '/js/app.js',
    '/js/screens/home.js',
    '/js/screens/exercise.js',
    '/js/screens/cooldown.js',
    '/js/screens/complete.js',
    '/js/screens/settings.js',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache =>
            // Cache each asset individually — one failure won't abort the rest.
            Promise.all(
                ASSETS.map(url =>
                    cache.add(url).catch(err => console.warn('[SW] failed to cache', url, err))
                )
            )
        ).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    // For full-page navigations, always serve index.html from cache.
    // This handles '/', any hash route, and cold starts while offline.
    if (e.request.mode === 'navigate') {
        e.respondWith(
            caches.match('/index.html')
                .then(cached => cached || fetch(e.request))
        );
        return;
    }

    // For everything else (JS, CSS, images): cache-first.
    e.respondWith(
        caches.match(e.request)
            .then(cached => cached || fetch(e.request))
    );
});
