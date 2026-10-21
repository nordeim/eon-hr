import { test, expect } from "@playwright/test";

// Session-70 (parity round 69) — the CSP nonce pipeline pins (R70-B).
//
// Context: the r68 round closed the HTTP-layer parity gap (REF's 5-header
// security set) and recorded CSP as the next superset candidate ("a
// Next.js CSP needs its own nonce pipeline — REF serves none, measured").
// This round builds it as a PURE SUPERSET: the reference platform serves
// no Content-Security-Policy at all, so any correct policy strictly
// exceeds the reference's hardening with zero visual impact.
//
// Design (the official Next.js middleware-nonce pattern):
// - src/proxy.ts generates a per-request nonce and sets the CSP on the
//   REQUEST headers — Next.js reads the nonce from the request CSP header
//   and stamps it on every script it renders (the documented auto-nonce
//   mechanism) — AND on the response.
// - The root layout stamps the nonce on its own inline scripts (the
//   THEME_BOOT pre-paint boot + the two JSON-LD blocks: CSP applies to
//   non-executable script types too).
// - Production policy: default-src 'self'; script-src 'self' 'nonce-N'
//   'strict-dynamic'; style-src SPLIT per the CSP spec (session-71,
//   R71-A): style-src-elem 'self' 'nonce-N' for <style> ELEMENTS (TW4's
//   compiled CSS rides a <link>; the one authored login cascade-mirror
//   block carries the layout's nonce) + style-src-attr 'unsafe-inline'
//   for inline style ATTRIBUTES (Radix, vaul, recharts — dynamic
//   runtime values that cannot be nonce'd or hashed); img-src 'self'
//   data: blob:; font-src 'self' data:; connect-src 'self'; base-uri
//   'self'; form-action 'self'; frame-ancestors 'none'; object-src
//   'none'.
//   NO upgrade-insecure-requests: the local standalone + E2E transport
//   is plain HTTP — UIR would upgrade subresources to https and break
//   them (HSTS already covers the TLS-fronted production case).
// - The clone loads ZERO external runtime resources (the full-source URL
//   sweep found only placeholder strings in seed data) — default-src
//   'self' is therefore the strict-but-correct baseline.
//
// The functional proof is the FULL E2E suite on the patched build: any
// blocked script breaks hydration and fails the suite loudly. These pins
// lock the header contract itself on both page classes (the logged-out
// login surface + the authed app surface).

test.describe("session-70 CSP nonce pipeline (R70-B, the superset)", () => {
  for (const [route, kind] of [
    ["/login", "logged-out"],
    ["/dashboard", "authed"],
  ] as const) {
    test(`R70-B${route === "/login" ? "a" : "b"}: the ${kind} page ${route} serves the nonce CSP`, async ({ request }) => {
      const res = await request.get(route);
      expect(res.status()).toBeLessThan(400);
      const csp = res.headers()["content-security-policy"];
      expect(csp, `the CSP header on ${route}`).toBeTruthy();

      // The strict superset shape (src/lib/csp.ts buildCsp, production).
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self' 'nonce-");
      expect(csp).toContain("'strict-dynamic'");
      // Amended session-71 (R71-A): the blanket style-src directive is
      // replaced by the elem/attr split — elements take the nonce,
      // attributes keep 'unsafe-inline' (the documented necessity).
      expect(csp).toContain("style-src-elem 'self' 'nonce-");
      expect(csp).toContain("style-src-attr 'unsafe-inline'");
      expect(csp).not.toMatch(/(?:^|; )style-src /);
      expect(csp).toContain("img-src 'self' data: blob:");
      expect(csp).toContain("font-src 'self' data:");
      expect(csp).toContain("connect-src 'self'");
      expect(csp).toContain("base-uri 'self'");
      expect(csp).toContain("form-action 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("object-src 'none'");
      // The transport-breaking directive must stay absent (the E2E
      // standalone serves plain HTTP).
      expect(csp).not.toContain("upgrade-insecure-requests");

      // The auto-nonce proof: Next stamped the per-request nonce on the
      // scripts it rendered (the HTML carries nonce= attributes).
      const html = await res.text();
      expect(html).toMatch(/<script[^>]+nonce="/);
    });
  }
});
