const VERSION = 'v30';
const CACHE_PREFIX = 's2ktux-';
const STATIC_CACHE = `${CACHE_PREFIX}static-${VERSION}`;
const PAGE_CACHE = `${CACHE_PREFIX}pages-${VERSION}`;
const MEDIA_CACHE = `${CACHE_PREFIX}media-${VERSION}`;
const CURRENT_CACHES = new Set([STATIC_CACHE, PAGE_CACHE, MEDIA_CACHE]);

// El shell común se guarda de entrada; cada motor se cachea al abrirlo por primera vez.
// Así un alumno de Linux no descarga también Docker y Kubernetes.
const PRECACHE = [
  './',
  'index.html',
  'site-shell.css?v=5ba23c5af75b',
  'visual-system.css?v=35555b4494e9',
  'site-shell.js?v=20260826-phase3',
  'fonts.css?v=20260822-local',
  'learning-pages.css?v=20260822-static2',
  'learning-pages.js?v=20260822-static2',
  'manifest.webmanifest',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/fonts/press-start-2p-latin-400.woff2',
  'assets/fonts/vt323-latin-400.woff2',
  'assets/fonts/share-tech-mono-latin-400.woff2',
  'assets/fonts/space-mono-latin-400.woff2',
  'assets/fonts/space-mono-latin-700.woff2'
];

const PAGE_CACHE_LIMIT = 80;
const MEDIA_CACHE_LIMIT = 96;

const scopeUrl = path => new URL(path, self.registration.scope).href;

const mayCache = (response, allowOpaque = false) => Boolean(
  response && (response.ok || (allowOpaque && response.type === 'opaque'))
);

async function trimCache(cacheName, limit) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const surplus = keys.length - limit;
  if (surplus > 0) await Promise.all(keys.slice(0, surplus).map(key => cache.delete(key)));
}

async function store(cacheName, request, response, limit, allowOpaque = false) {
  if (!mayCache(response, allowOpaque)) return;
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
    if (limit) await trimCache(cacheName, limit);
  } catch (_) {
    // Cuota llena, respuesta opaca no almacenable o pestaña cerrada: la red sigue funcionando.
  }
}

async function precacheOne(path) {
  const request = new Request(scopeUrl(path), { cache: 'reload' });
  const response = await fetch(request);
  if (!response.ok) throw new Error(`Precache ${path}: HTTP ${response.status}`);
  await store(STATIC_CACHE, request, response);
}

self.addEventListener('install', event => {
  // Cada recurso es independiente: una imagen ausente no invalida todo el shell.
  // No se usa skipWaiting: una versión nueva no sustituye el código de una sesión abierta.
  event.waitUntil(Promise.allSettled(PRECACHE.map(precacheOne)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter(name => name.startsWith(CACHE_PREFIX) && !CURRENT_CACHES.has(name))
      .map(name => caches.delete(name)));
  })());
});

async function offlineFallback(req) {
  const pageCache = await caches.open(PAGE_CACHE);
  const shellCache = await caches.open(STATIC_CACHE);
  const exact = await pageCache.match(req) || await shellCache.match(req);
  if (exact) return exact;

  // Una navegación con parámetros puede reutilizar su documento base precacheado.
  if (req.mode === 'navigate') {
    const url = new URL(req.url);
    const cleanRequest = new Request(`${url.origin}${url.pathname}`);
    const cleanDocument = await pageCache.match(cleanRequest) || await shellCache.match(cleanRequest);
    if (cleanDocument) return cleanDocument;
  }

  // Contrato importante: JavaScript, CSS, JSON e imágenes nunca reciben index.html.
  return req.mode==='navigate' ? caches.match('index.html') : Response.error();
}

async function networkFirst(req, cacheName, limit) {
  try {
    const response = await fetch(req);
    await store(cacheName, req, response, limit);
    return response;
  } catch (_) {
    return offlineFallback(req);
  }
}

async function cacheFirst(req, cacheName, limit, allowOpaque = false) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const response = await fetch(req);
    await store(cacheName, req, response, limit, allowOpaque);
    return response;
  } catch (_) {
    return Response.error();
  }
}

function staleWhileRevalidate(event, cacheName, limit, allowOpaque = false) {
  const req = event.request;
  const update = fetch(req).then(async response => {
    await store(cacheName, req, response, limit, allowOpaque);
    return response;
  });

  return caches.open(cacheName).then(cache => cache.match(req)).then(cached => {
    if (cached) {
      event.waitUntil(update.catch(() => undefined));
      return cached;
    }
    return update.catch(() => Response.error());
  });
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req, PAGE_CACHE, PAGE_CACHE_LIMIT));
    return;
  }

  if (sameOrigin) {
    const path = url.pathname.toLowerCase();
    const isHtml = path.endsWith('.html') || (req.headers.get('accept') || '').includes('text/html');
    const isCode = ['script', 'style', 'worker'].includes(req.destination)
      || /\.(?:js|css|mjs|webmanifest|json)$/.test(path);
    const isMedia = ['image', 'font', 'audio', 'video'].includes(req.destination)
      || /\.(?:avif|gif|ico|jpe?g|png|svg|webp|woff2?|mp3|mp4)$/.test(path);

    if (isHtml) {
      // Los fragmentos de lecciones también son HTML, pero no reciben el fallback de portada.
      event.respondWith(networkFirst(req, PAGE_CACHE, PAGE_CACHE_LIMIT));
    } else if (isCode) {
      // El código de una misma versión se mantiene estable durante la sesión.
      event.respondWith(cacheFirst(req, STATIC_CACHE));
    } else if (isMedia) {
      event.respondWith(staleWhileRevalidate(event, MEDIA_CACHE, MEDIA_CACHE_LIMIT));
    }
    return;
  }

  // Analítica, vídeos y cualquier otro tercero pasan por red y nunca ocupan
  // almacenamiento offline. Las fuentes ya se sirven desde este mismo origen.
});
