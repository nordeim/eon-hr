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
//
// Session-74 (R74-C): the cache-generation mechanism. The r72 design
// left the cache name un-bumped since r72 — two lifecycle defects the
// round's fresh-eyes audit measured: (a) THE FROZEN SHELL — the SHELL
// precache re-fetches only at the install event, and install re-fires
// only when sw.js bytes change, so every existing client held the
// r72-era shell bytes indefinitely (a latent update bug: the day a
// shell asset changes, every installed client serves the stale copy
// forever unless someone remembers the hand-bump); (b) THE UNBOUNDED
// CHUNK CACHE — /_next/static chunks accumulated cache-first into
// the same-named cache across every deploy with nothing evicting
// them (a slow storage leak bounded only by the browser's own
// whole-origin eviction). The fix:
//   - GEN + the generation-stamped SHELL_CACHE — bump on ANY
//     shell-asset change (the activate sweep migrates old-generation
//     clients); the shell-drift tripwire in tests/unit/pwa-surface
//     .test.ts (R74-C1) pins the SHELL asset bytes to the generation
//     so the bump protocol is EXECUTABLE, not prose.
//   - the STABLE CHUNKS_CACHE — immutable hash-named chunks survive
//     generation bumps (a shell-only change does not re-download the
//     chunk set).
//   - the CHUNKS_CAP bound — the accumulation is trimmed oldest-first
//     on every put.

const GEN = "r74";
// = `eon-hr-shell-${GEN}` — kept literal for the grep-able served contract
const SHELL_CACHE = "eon-hr-shell-r74";
// stable across generations: chunks survive shell bumps, bounded by
const CHUNKS_CACHE = "eon-hr-chunks";
const CHUNKS_CAP = 120;
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
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL_CACHE && k !== CHUNKS_CACHE).map((k) => caches.delete(k))))
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
        caches.open(CHUNKS_CACHE).then(async (cache) => {
          const hit = await cache.match(req);
          if (hit) return hit;
          const res = await fetch(req);
          if (res.ok) {
            await cache.put(req, res.clone());
            // Session-74 (R74-C2): the bound. Cache Storage keys() return
            // insertion order in Chromium (the spec does not guarantee
            // the order — worst case the trim removes a random still-valid
            // chunk that lazily re-fetches, harmless). Oldest-first trim
            // keeps the cross-deploy accumulation bounded.
            const keys = await cache.keys();
            if (keys.length > CHUNKS_CAP) {
              for (const k of keys.slice(0, keys.length - CHUNKS_CAP)) {
                await cache.delete(k);
              }
            }
          }
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
