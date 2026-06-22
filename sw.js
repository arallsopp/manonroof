/**
 * Service Worker — cache-first offline strategy.
 * Bump CACHE_NAME when assets change to force a fresh install.
 */

const CACHE_NAME = 'workout-v4';

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
    '/images/pushups.png',
    '/images/shoulder_taps.png',
    '/images/commandos.png',
    '/images/lat_pull_pushup_1.png',
    '/images/lat_pull_pushup_2.png',
    '/images/lat_pull_pushup_3.png',
    '/images/plank_toe_touches.png',
    '/images/calf_hops.png',
    '/images/crunch_pause.png',
    '/images/oblique_r.png',
    '/images/oblique_l.png',
    '/images/twisting_tabletop.png',
    '/images/reverse_crunch.png',
    '/images/leg_hip_lift.png',
    '/images/plank_knee_tucks.png',
    '/images/frog_extensions.png',
    '/images/skullcrusher.png',
    '/images/mountain_climbers.png',
    '/images/lateral_pushup.png',
    '/images/plank_rows.png',
    '/images/superman_hold.png',
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
