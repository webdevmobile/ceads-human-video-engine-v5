const CACHE = "ceads-hve-v26-shell";
const SHELL = [
  "./",
  "./index.html",
  "./assets/css/styles.css",
  "./assets/js/config.js",
  "./assets/js/app.js",
  "./assets/img/favicon.webp",
  "./assets/img/ceads-logo-primary-hq-mobile.webp",
  "./assets/visuals/thumbnails/vsl-mobile.webp"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    return (await cache.match(request)) || (await cache.match("./index.html"));
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }
  if (/\.(?:css|js|webp|png|jpg|jpeg|svg|ico|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
  }
});
