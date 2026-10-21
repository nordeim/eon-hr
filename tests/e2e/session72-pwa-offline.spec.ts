import { test, expect, type APIRequestContext } from "@playwright/test";

// Session-72 (parity round 71) — the PWA/offline story (R72-B, the
// functional superset).
//
// Context: the candor-ordered candidates from session_155 named "a
// PWA/offline story (the manifest already self-hosted)". The r72
// census measured both sides: REF links /manifest.json on its LOGIN
// surface only (with a stale platform-template description and
// EXTERNAL supabase-hosted icons), links NO manifest on its authed
// dashboard shell, and registers ZERO service workers on any surface
// (getRegistrations() read 0, no controller). The clone links the
// self-hosted manifest on EVERY page (relative icons, the honest
// description — the standing zero-external-resources policy) but has
// NO service worker: no public/sw.js, no registration anywhere.
//
// The rung: the offline shell —
//   - public/sw.js: the generation-stamped CACHE (session-74's
//     R74-C amendment: SHELL_CACHE `eon-hr-shell-r74` + the stable
//     `eon-hr-chunks` — the static shell:
//     /offline.html + the manifest + the icons + the logo + og-image,
//     precached at install) + cache-first for /_next/static/ chunks +
//     NAVIGATIONS: network-only with the offline fallback to the
//     cached /offline.html on fetch failure. Page HTML is NEVER
//     cached and NEVER served from cache (the authed-HTML leak-free
//     design); /api/ and everything else: pass-through.
//   - public/offline.html: a minimal static page, CSP-clean by
//     construction (zero <script>, zero <style> ELEMENTS — inline
//     style attributes only) so it stays valid even if the CSP ever
//     extends to public surfaces.
//   - the nonced SW_REGISTRATION inline script in the root layout
//     (production-only): in dev the SW would cache-serve stale
//     Turbopack chunks and break HMR — dev stays SW-free; the E2E
//     suite + the standalone servers run the production build.
//
// REF has none of this — a pure functional superset. The proof stack:
// the un-authed sw.js fetch (installable while logged out), the live
// registration + control, the offline fallback, and the FULL suite
// green WITH the SW active.

test.describe("session-72 PWA/offline story (R72-B)", () => {
  test("R72-B1: GET /sw.js UN-AUTHED — 200, the JS content-type, the 5-header set, the semantic contract", async ({ playwright }) => {
    // A bare request context (NO storageState cookies): a logged-out
    // first visit must be able to fetch + register the worker.
    const bare: APIRequestContext = await playwright.request.newContext();
    const res = await bare.get("/sw.js");
    expect(res.status(), "the un-authed sw.js fetch").toBe(200);
    const ct = res.headers()["content-type"] ?? "";
    expect(ct).toContain("javascript");
    // The r69 5-header set rides public files too (next.config.ts
    // headers(), source /:path*).
    for (const h of ["x-content-type-options", "x-frame-options", "referrer-policy", "strict-transport-security", "permissions-policy"]) {
      expect(res.headers()[h], `the ${h} header on /sw.js`).toBeTruthy();
    }
    const body = await res.text();
    // The semantic contract (never the exact bytes): the versioned cache,
    // the offline.html fallback, the never-cache-HTML design. The
    // session-74 amendment (R74-C3): the generation-stamped name.
    expect(body).toContain("eon-hr-shell-r74");
    expect(body).toContain("offline.html");
    expect(body).toContain("navigate");
    expect(body).toContain("skipWaiting");
    expect(body).toContain("clients.claim");
    await bare.dispose();
  });

  test("R72-B2: the served page HTML carries the nonced SW-registration script (production only)", async ({ request }) => {
    const res = await request.get("/login");
    expect(res.status()).toBeLessThan(400);
    const html = await res.text();
    const m = html.match(/<script([^>]*)>([^<]*serviceWorker[^<]*)<\/script>/);
    expect(m, "an inline script registering the service worker").toBeTruthy();
    expect(m![1], `the registration script is nonced: ${m![1]}`).toContain('nonce="');
    expect(m![2]).toContain("/sw.js");
  });

  test("R72-B3: the LIVE registration — ready resolves, scope '/', the page is controlled after reload", async ({ page }) => {
    await page.goto("/dashboard");
    // ready waits for the ACTIVE worker (register on 'load' → install →
    // skipWaiting → activate → clients.claim).
    const scope = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready;
      return reg.scope;
    });
    expect(scope.endsWith("/"), "the registration scope is top-level '/'").toBeTruthy();
    // clients.claim takes control of the open page; the reload makes the
    // controller state explicit either way.
    await page.reload();
    const controlled = await page.evaluate(() => !!navigator.serviceWorker.controller);
    expect(controlled, "the reloaded page is controlled by the worker").toBeTruthy();
  });

  test("R72-B4: THE OFFLINE FALLBACK — setOffline(true) navigations land on the offline page", async ({ page, context }) => {
    // Register + precache first (the shell including /offline.html).
    await page.goto("/dashboard");
    await page.evaluate(() => navigator.serviceWorker.ready);
    await context.setOffline(true);
    // Network-only navigation + fetch failure → the cached offline
    // fallback. Page HTML is never cached, so a DIFFERENT route still
    // falls back (the leak-free design proves itself).
    await page.goto("/settings");
    await expect(page.getByText("You're offline")).toBeVisible();
    await expect(page.getByText(/Eon HR/)).toBeVisible();
    await context.setOffline(false);
  });
});
