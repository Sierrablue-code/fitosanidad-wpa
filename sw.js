const CACHE_NAME = "miapp-cache-v1"; // ¡Recuerda cambiar esto a v2, v3, etc., con cada actualización!
const urlsToCache = [
  "/mapaEcuablueFitosanidad.html",
  "/ecualasos.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Service Worker: Intentando precachear...');
      return cache.addAll(urlsToCache);
    }).catch(error => {
      console.error('Service Worker: Fallo en el precaching de URLs:', error);
      // Si el precaching falla, puedes decidir si quieres que la instalación del SW también falle.
      // throw error; // Descomenta si quieres que la instalación falle con errores de precaching
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", event => {
  // --- ¡NUEVA LÓGICA AQUÍ! ---
  // Si la petición es para favicon.ico, devuelve una respuesta 204 (No Content)
  // para evitar el 404 y que el Service Worker no intente cachearlo o fallar por ello.
  if (event.request.url.endsWith('/favicon.ico')) {
    event.respondWith(new Response(null, { status: 204, statusText: 'No Content' }));
    return; // Detiene el procesamiento para esta petición
  }
  // --- FIN DE LA NUEVA LÓGICA ---

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(error => {
      console.error('Service Worker: Error en fetch para:', event.request.url, error);
      // Puedes añadir lógica para devolver una página offline si es necesario
      // return caches.match('/offline.html');
    })
  );
});
