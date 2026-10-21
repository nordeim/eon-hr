// Eon HR — the offline-shell service worker (session-72, R72-B).
//
// The PWA-layer census measured REF: a login-surface-only manifest link
// (stale platform-template description, EXTERNAL supabase icons), NO
// manifest on the authed shell, and ZERO registered service workers on
// any surface. The clone already superSETS the manifest surface
// (every-page linkage, self-hosted icons — the standing
// zero-external-resources policy); this worker adds the missing piece:
// THE OFFLINE SHELL.
//
// The design is deliberately minimal and leak-free:
//   - The STATIC SHELL precaches at install: /offline.html (the
//     fallback page) + the manifest + the icons + the logo + the
//     og-image — everything a logged-out first visit needs to install
//     and everything the offline fallback needs to render.
//   - /_next/static/ chunks ride cache-first (immutable build assets —
//     the hash-named files change only when the build changes).
//   - NAVIGATIONS are NETWORK-ONLY with the offline fallback: page
//     HTML is NEVER cached and NEVER served from cache. No authed
//     HTML is persisted to the Cache Storage, no stale page is ever
//     served, no session data can leak between users on a shared
//     machine through the cache.
//   - EVERYTHING ELSE — /api/ included — passes through untouched: the
//     worker never handles it, so every data route stays live.
//
// Registered by the nonced SW_REGISTRATION bootstrap in the root
// layout (production-only — dev's Turbopack fast-refresh would break
// on stale cached chunks). skipWaiting + clients.claim make updates
// immediate; the activate handler deletes any cache outside the
// current version's name.
//
// The unit pins (tests/unit/pwa-surface.test.ts) lock the semantic
// contract: the versioned cache name, the shell list, the EXACTLY-ONE
// caches.match (the offline fallback), and the absence of any page-HTML
// caching.

const CACHE = "eon-hr-shell-r72";
const SHELL = [
  "/offline.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/eon-logo.png",
  "/og-image.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Static build assets: cache-first (immutable, hash-named chunks).
  if (req.method === "GET") {
    const url = new URL(req.url);
    if (url.origin === self.location.origin && url.pathname.startsWith("/_next/static/")) {
      event.respondWith(
        caches.open(CACHE).then(async (cache) => {
          const hit = await cache.match(req);
          if (hit) return hit;
          const res = await fetch(req);
          if (res.ok) cache.put(req, res.clone());
          return res;
        }),
      );
      return;
    }
  }

  // Navigations: network-only. On fetch failure (offline), fall back
  // to the cached offline page. The page's own HTML is NEVER cached
  // and NEVER served from cache — the authed-HTML leak-free design.
  if (req.mode === "navigate") {
    const offlineUrl = "/offline.html";
    event.respondWith(fetch(req).catch(() => caches.match(offlineUrl)));
    return;
  }

  // Everything else (API routes, images, fonts, prefetches): the
  // worker does not intervene.
});
