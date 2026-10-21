import { test, expect } from "@playwright/test";

// Session-71 (parity round 70) — the TLS-fronted deployment story's
// CONTRACT PIN (R71-B).
//
// Context: the r69 5-header set already serves HSTS
// (strict-transport-security max-age=31536000), but HSTS "only bites
// behind real TLS" — the session-151 candidate list recorded the
// missing piece as "a TLS-fronted deployment story". The app's whole
// origin chain resolves from the PROXY headers, not configuration:
//   x-forwarded-proto + host  →  metadataBase  →  per-route canonicals
//   + og/twitter URLs  →  sitemap.xml <loc> set  →  robots.txt Sitemap
// (src/app/layout.tsx, src/app/sitemap.ts, src/app/robots.ts — all
// read headers() the same way; the cookie scheme derivation rides the
// same proto). Behind a TLS-terminating reverse proxy (nginx/Caddy —
// the DEPLOYMENT.md §8 examples), the proxy forwards X-Forwarded-Proto:
// https and every one of those surfaces flips to the https origin
// with ZERO app changes.
//
// VERIFIED LIVE pre-pin (curl on the :3200 standalone, this round):
// the spoofed header already resolves https:// locs + Sitemap +
// canonical. This spec LOCKS that contract (the r67 verification-pin
// pattern: the mechanism exists and is correct; the pin ensures a
// future refactor cannot silently break TLS deployments) — it is
// expected GREEN on the current build, unlike the R71-A RED pair.

test.describe("session-71 TLS-front proxy contract (R71-B, the x-forwarded-proto origin chain)", () => {
  test("R71-B1: the sitemap <loc> set resolves the forwarded https origin", async ({ request }) => {
    const res = await request.get("/sitemap.xml", {
      headers: { "x-forwarded-proto": "https" },
    });
    expect(res.status()).toBe(200);
    const xml = await res.text();
    const locs = xml.match(/<loc>([^<]+)<\/loc>/g) ?? [];
    expect(locs.length).toBeGreaterThanOrEqual(62);
    for (const loc of locs) {
      expect(loc, `the loc ${loc} rides https behind the TLS proxy`).toContain("<loc>https://");
    }
    // The same request WITHOUT the header stays http — the resolution
    // is per-request, not a build-time constant.
    const plain = await request.get("/sitemap.xml");
    const plainXml = await plain.text();
    expect(plainXml).toContain("<loc>http://");
  });

  test("R71-B2: the robots Sitemap line resolves the forwarded https origin", async ({ request }) => {
    const res = await request.get("/robots.txt", {
      headers: { "x-forwarded-proto": "https" },
    });
    expect(res.status()).toBe(200);
    const body = await res.text();
    // The r70 renderer normalization (documented in the round record):
    // Next renders the robots directive "User-Agent:" — the robots
    // spec is case-insensitive; assert the semantic contract.
    expect(body).toContain("User-Agent:");
    expect(body).toContain("Disallow: /api/");
    expect(body).toMatch(/^Sitemap: https:\/\//m);
  });

  test("R71-B3: the page canonical/og URLs resolve the forwarded https origin (the metadataBase chain)", async ({ request }) => {
    const res = await request.get("/login", {
      headers: { "x-forwarded-proto": "https" },
    });
    expect(res.status()).toBeLessThan(400);
    const html = await res.text();
    // The canonical link resolves via the root layout's metadataBase —
    // the same headers()-derived origin as the sitemap/robots.
    expect(html).toMatch(/<link rel="canonical" href="https:\/\//);
    // The og:url member of the same chain.
    expect(html).toMatch(/property="og:url" content="https:\/\//);
  });
});
