import { test, expect } from "@playwright/test";

// Session-70 (parity round 69) — the SEO-surface parity pins (R70-A).
//
// Context: the r68 lesson ("census new LAYERS, not just new members") sent
// this round's HTTP-layer sweep below the response headers, and it found
// the last uncensured member of the SEO layer: the live REF serves
//   GET /sitemap.xml → 200 application/xml — 61 <url> entries: "/" at
//     priority 1.0 + its 60 app routes at 0.8, every one
//     <changefreq>weekly</changefreq>, no <lastmod>
//   GET /robots.txt  → "User-agent: *" / "Allow: /" / "Sitemap: …/sitemap.xml"
// (measured via curl, session-70; saved as docs/ref-sitemap-r70.xml).
// The clone served NO sitemap route at all and its static robots.txt
// carried no Sitemap directive — a gap in the very layer the clone
// otherwise supersedes (r25/r31: per-route titles, canonicals resolved
// against the serving origin, JSON-LD, the manifest + og-image family).
//
// Design notes:
// - The clone's URL set = REF's 61-URL list mirrored in the clone's
//   CANONICAL lowercase form + "/dashboard" (the clone's own canonical
//   dashboard route — the page's <link rel=canonical> points there; REF
//   omits it only because its dashboard IS "/") = 62 entries, the
//   one-entry superset documented.
// - URLs resolve against the serving origin (headers()-derived, exactly
//   like the root layout's metadataBase) — localhost:3100 under E2E,
//   any real domain in production.
// - robots.ts (the dynamic route) replaces the static public/robots.txt
//   and KEEPS the clone's "Disallow: /api/" (the production-grade
//   superset member REF lacks) while adding the Sitemap directive.

test.describe("session-70 SEO-surface parity (R70-A)", () => {
  test("R70-Aa: /sitemap.xml serves the full route registry with REF's structure", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("xml");

    const xml = await res.text();
    // The sitemaps.org namespace — the same schema REF's sitemap declares.
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

    // The 62-entry set: the origin root + the 61 canonical app routes.
    const locs = xml.match(/<loc>/g) ?? [];
    expect(locs.length).toBe(62);

    // REF's structure: every entry weekly; the root at 1.0, the rest 0.8.
    // (Next serializes priority 1 as "1" — xsd:decimal-equivalent to
    // REF's "1.0"; a documented renderer normalization, like the compact
    // XML vs REF's pretty-print — the semantic contract is what's pinned.)
    expect((xml.match(/<changefreq>weekly<\/changefreq>/g) ?? []).length).toBe(62);
    expect((xml.match(/<priority>1<\/priority>/g) ?? []).length).toBe(1);
    expect((xml.match(/<priority>0\.8<\/priority>/g) ?? []).length).toBe(61);
    // REF serves no <lastmod> — neither do we.
    expect(xml).not.toContain("<lastmod>");

    // Origin resolution: the URLs carry the serving origin (localhost:3100
    // under E2E — the same host the canonical/og URLs resolve against).
    const base = new URL(res.url()).origin;
    expect(xml).toContain(`<loc>${base}/</loc>`);

    // Spot members: the root, the clone's canonical dashboard, the big
    // modules, the recovered orphan routes (session-32 registry), and the
    // two REF-listed dashboard aliases.
    for (const slug of [
      "/dashboard",
      "/employees",
      "/payroll",
      "/training",
      "/recruitment",
      "/careers",
      "/shiftswap",
      "/tenantsetup",
      "/organizationsetup",
      "/dynamicdashboard",
      "/home",
      "/employeedetail",
    ]) {
      expect(xml, `${slug} in the sitemap`).toContain(`<loc>${base}${slug}</loc>`);
    }
  });

  test("R70-Ab: /robots.txt serves the REF directive set + the Sitemap line", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();

    // REF's robots contract… (Next's robots renderer capitalizes the
    // directive as "User-Agent:" where REF serves "User-agent:" — the
    // robots spec is case-insensitive for directives; documented
    // renderer normalization, the semantic contract pinned here)
    expect(body).toContain("User-Agent: *");
    expect(body).toContain("Allow: /");
    // …plus the Sitemap directive REF carries (resolved against the
    // serving origin, exactly like the sitemap's own URLs)…
    const base = new URL(res.url()).origin;
    expect(body).toContain(`Sitemap: ${base}/sitemap.xml`);
    // …while keeping the clone's production-grade Disallow: /api/ (the
    // documented superset member — the API is not for crawlers).
    expect(body).toContain("Disallow: /api/");
  });
});
