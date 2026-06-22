/**
 * Service Worker — cache-first offline strategy.
 * Bump CACHE_NAME when assets change to force a fresh install.
 */

const CACHE_NAME = 'workout-v5';

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
    '/icons/icon-192.jpg',
    '/icons/icon-512.jpg',
    '/images/pushups.jpg',
    '/images/shoulder_taps.jpg',
    '/images/commandos.jpg',
    '/images/lat_pull_pushup_1.jpg',
    '/images/lat_pull_pushup_2.jpg',
    '/images/lat_pull_pushup_3.jpg',
    '/images/plank_toe_touches.jpg',
    '/images/calf_hops.jpg',
    '/images/crunch_pause.jpg',
    '/images/oblique_r.jpg',
    '/images/oblique_l.jpg',
    '/images/twisting_tabletop.jpg',
    '/images/reverse_crunch.jpg',
    '/images/leg_hip_lift.jpg',
    '/images/plank_knee_tucks.jpg',
    '/images/frog_extensions.jpg',
    '/images/skullcrusher.jpg',
    '/images/mountain_climbers.jpg',
    '/images/lateral_pushup.jpg',
    '/images/plank_rows.jpg',
    '/images/superman_hold.jpg',
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
