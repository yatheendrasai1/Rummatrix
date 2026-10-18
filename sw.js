// Rummatrix service worker: lets the app install and open offline.
// - the page itself is fetched network-first (so updates show up), falling back to the saved copy
// - icons, sounds and fonts are served from the cache and refreshed in the background
const CACHE = 'rummatrix-v4';
const PRECACHE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon.svg', 'fonts/fonts.css',
  'fonts/Bangers-FeVQS0BTqb0h60ACH55Q2A.woff2',
  'fonts/Inter-UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2',
  'fonts/JetBrainsMono-tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPxDcwg.woff2',
  'fonts/Lora-0QIvMX1D_JOuMwr7Iw.woff2',
  'fonts/PlayfairDisplay-nuFiD-vYSZviVYUb_rj3ij__anPXDTzYgA.woff2',
  'fonts/Rajdhani-LDI2apCSOBg7S-QT7pa8FvOreec.woff2',
  'fonts/Rajdhani-LDI2apCSOBg7S-QT7pb0EPOreec.woff2',
  'fonts/Rajdhani-LDI2apCSOBg7S-QT7pbYF_Oreec.woff2',
  'fonts/TitilliumWeb-NaPDcZTIAOhVxoMyOr9n_E7ffBzCGItzYw.woff2',
  'fonts/TitilliumWeb-NaPDcZTIAOhVxoMyOr9n_E7ffEDBGItzYw.woff2',
  'fonts/TitilliumWeb-NaPDcZTIAOhVxoMyOr9n_E7ffHjDGItzYw.woff2',
  'fonts/TitilliumWeb-NaPecZTIAOhVxoMyOr9n_E7fdMPmDQ.woff2'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!sameOrigin && !isFont) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put('index.html', copy));
        return res;
      }).catch(() => caches.match('index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // everything else: answer from the cache if we can, and refresh it in the background
  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(req).then((hit) => {
        const refresh = fetch(req).then((res) => {
          if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
          return res;
        }).catch(() => hit);
        return hit || refresh;
      })
    )
  );
});
