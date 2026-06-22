/**
 * Service Worker — cache-first offline strategy.
 * Bump CACHE_NAME when assets change to force a refresh.
 */

const CACHE_NAME = 'workout-v2';

const ASSETS = [
    '/',
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
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
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
    e.respondWith(
        caches.match(e.request)
            .then(cached => cached || fetch(e.request))
    );
});
