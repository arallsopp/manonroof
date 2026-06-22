/**
 * App entry point — bootstraps on DOMContentLoaded.
 * Registers the service worker for offline PWA support.
 */

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
}

document.addEventListener('DOMContentLoaded', () => {
    WorkoutController.init();
});
