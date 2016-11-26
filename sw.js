const version = 'v1';

self.oninstall = event => event.waitUntil(self.skipWaiting());

self.onfetch = event => {
  event.respondWith(async function () {
    try {
      const response = await fetch(event.request);
      const cache = await caches.open(version);

      cache.put(event.request, response);

      return response.clone();
    } catch(_) { /* ignore errors */ }

    const response = await caches.match(event.request);

    return response || new Response(404);
  }());
};
