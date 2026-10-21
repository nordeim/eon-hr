import { test, expect } from "@playwright/test";

// Session-73 (parity round 72) — the PWA manifest-linkage completion
// (R73-C): the authed-shell gap the r72 census mis-reported.
//
// The r72 plan claimed "the clone already superSETS the manifest surface
// (every-page linkage, self-hosted icons)" — measured FALSE this round:
// the manifest link lives ONLY in src/app/login/layout.tsx; the root
// layout's generateMetadata and src/lib/meta.ts's pageMetadata() set NO
// manifest, so the ENTIRE authed app shell serves ZERO
// <link rel="manifest"> (live-measured on the authed dashboard:
// manifest:false). The service worker registers on every page (r72,
// controlled:true), but Chrome's installability criteria need the
// manifest LINK on the page being installed — the surface where users
// live has none.
//
// R73-C hoists manifest + the apple-touch-icon to the ROOT layout's
// metadata: Next's per-field inheritance carries them to every route the
// child does not override (login's own values are identical). The
// elements are non-visual (head-layer): the byte-stability chain holds.
//
// The pin (RED on the unpatched build — the authed shell has no
// manifest link):
//   R73-Ca: the AUTHED dashboard links the manifest + the apple icon.
//   R73-Cb: the login page keeps its standing manifest contract.
//   R73-Cc: the served manifest carries Chrome's installability fields
//           (name, 192+512 icons, start_url, display:standalone) — the
//           structural installability pin (the SW + fetch handler ship
//           since r72; a registered SW is the other install criterion).
//   R73-Cd: the service worker controls the authed page (the standing
//           r72 contract re-pinned on the patched build).

test.describe("session-73 PWA manifest-linkage completion (R73-C)", () => {
  test("R73-Ca: the AUTHED dashboard links the manifest + apple-touch-icon (the hoist)", async ({ page }) => {
    await page.goto("/dashboard");
    const manifest = page.locator('link[rel="manifest"]');
    await expect(manifest).toHaveAttribute("href", "/manifest.json");
    const apple = page.locator('link[rel="apple-touch-icon"]');
    await expect(apple).toHaveAttribute("href", "/apple-touch-icon.png");
  });

  test("R73-Cb: the login page keeps the standing manifest contract", async ({ page }) => {
    // login's own layout sets manifest + icons — unchanged by the hoist.
    await page.goto("/login");
    const manifest = page.locator('link[rel="manifest"]');
    await expect(manifest).toHaveAttribute("href", "/manifest.json");
  });

  test("R73-Cc: the served manifest carries the installability fields", async ({ request }) => {
    const res = await request.get("/manifest.json");
    expect(res.status()).toBe(200);
    const manifest = (await res.json()) as {
      name: string;
      icons: { src: string; sizes: string; type: string }[];
      start_url: string;
      display: string;
    };
    expect(manifest.name).toBe("Eon HR");
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
    const sizes = manifest.icons.map((i) => i.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    // self-hosted: the r72 superset (REF's icons are external supabase URLs)
    for (const icon of manifest.icons) {
      expect(icon.src.startsWith("/")).toBe(true);
    }
  });

  test("R73-Cd: the service worker controls the authed page (the r72 contract on the patched build)", async ({ page }) => {
    // The r72-proven pattern (session72-pwa-offline.spec.ts R72-B3):
    // ready waits for the ACTIVE worker (register on 'load' → install →
    // skipWaiting → activate → clients.claim); the reload makes the
    // controller state explicit.
    await page.goto("/dashboard");
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    const controlled = await page.evaluate(
      () => !!(navigator.serviceWorker && navigator.serviceWorker.controller),
    );
    expect(controlled).toBe(true);
  });
});
