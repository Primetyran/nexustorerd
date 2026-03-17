const CACHE_NAME = "nexustorerd-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/static/js/main.chunk.js",
  "/static/js/bundle.js",
  "/static/js/vendors~main.chunk.js"
];

// Instalar y cachear recursos
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(() => {
        // Si falla algún asset no bloqueamos la instalación
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activar y limpiar caches viejos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Estrategia: Network first, cache fallback
self.addEventListener("fetch", event => {
  // Solo interceptar requests del mismo origen
  if (!event.request.url.startsWith(self.location.origin)) return;
  // No interceptar Firebase
  if (event.request.url.includes("firebaseapp") || event.request.url.includes("googleapis")) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Guardar copia en cache
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // Sin red → usar cache
        return caches.match(event.request).then(cached => {
          return cached || caches.match("/index.html");
        });
      })
  );
});
