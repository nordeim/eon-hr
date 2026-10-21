import { test, expect } from "@playwright/test";

// Session-69 (parity round 68) — the HTTP-layer parity pins.
//
// Context: 67 rounds of audits lived at the DOM/computed-style layer; the
// HTTP response-header layer was never censused. The live REF serves a
// 5-header security set on every response (measured via curl -sI on
// https://eon.base44.app/login, session-69):
//   permissions-policy: camera=(self), microphone=(self), geolocation=(self),
//                       payment=(self), usb=(self), magnetometer=(),
//                       gyroscope=()
//   referrer-policy: strict-origin-when-cross-origin
//   strict-transport-security: max-age=31536000
//   x-content-type-options: nosniff
//   x-frame-options: DENY
// The clone's standalone served NONE of them (next.config.ts had no
// headers(); src/proxy.ts adds none). R69-A adds the exact REF set via
// next.config.ts headers() — source "/:path**" so every route (pages AND
// /api/*) carries the set, exactly like the REF platform.
//
// Design notes:
// - HSTS is included although the standalone serves plain HTTP here:
//   browsers ignore the header over insecure transport, it protects real
//   TLS-fronted deployments, and it matches REF exactly. No CSP: the REF
//   serves none (measured) and a Next.js CSP needs its own nonce pipeline.
// - x-frame-options: DENY is safe — the app never frames itself (0
//   iframes on the REF login recon, zero iframe usage in the codebase).
// - Header-name case is transport-normalized (HTTP/2 lowercases); the
//   assertions read the case-insensitive Playwright response headers API.

const EXPECTED = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "strict-transport-security": "max-age=31536000",
  "permissions-policy":
    "camera=(self), microphone=(self), geolocation=(self), payment=(self), usb=(self), magnetometer=(), gyroscope=()",
} as const;

test.describe("session-69 security-headers parity (R69-A, HTTP layer)", () => {
  for (const [route, kind] of [
    ["/login", "page"],
    ["/api/health", "api"],
  ] as const) {
    test(`R69-A${kind === "api" ? "b" : "a"}: the ${kind} route ${route} serves REF's 5-header security set`, async ({ request }) => {
      const res = await request.get(route);
      // The request must itself succeed (health returns 200 on the seeded
      // build; login is the public page).
      expect(res.status()).toBeLessThan(400);
      const headers = res.headers();
      for (const [name, value] of Object.entries(EXPECTED)) {
        expect(headers[name], `${name} on ${route}`).toBe(value);
      }
    });
  }
});
