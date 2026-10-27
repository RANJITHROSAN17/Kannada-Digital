/* Kannada Saathi offline shell: cache-first for same-origin GET requests. */
const CACHE = 'kannada-saathi-v4';

// Both lists are generated: audio MP3s live in public/, hashed JS/CSS/fonts are
// emitted by scripts/generate-precache.mjs after `vite build`. A failed entry
// must never prevent the rest of the shell from installing.
try {
  importScripts('./audio-precache.js', './asset-precache.js');
} catch {
  /* older browsers / missing optional lists: runtime caching still works */
}
const ASSET_PRECACHE = self.KANNADA_ASSET_PRECACHE || [];
const AUDIO_PRECACHE = self.KANNADA_AUDIO_PRECACHE || [];
const CORE_PRECACHE = ['./', './index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(async (cache) => {
        await Promise.allSettled(CORE_PRECACHE.map((url) => cache.add(url)));
        await Promise.allSettled(ASSET_PRECACHE.map((url) => cache.add(url)));
        await Promise.allSettled(AUDIO_PRECACHE.map((url) => cache.add(url)));
      })
      .catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    // Vite's static responses carry `Vary: Origin`; precache requests and
    // module-script requests can therefore differ. Our assets are same-origin
    // static files, so ignoring Vary here is safe and fixes offline reloads.
    caches.match(request, { ignoreVary: true }).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          // Only navigations may fall back to the cached app shell. Returning
          // index.html for a missing JS/CSS asset would break module scripts.
          if (request.mode === 'navigate') return caches.match('./index.html', { ignoreVary: true });
          return Response.error();
        });
    }),
  );
});
