import { test, expect } from "@playwright/test";

// Session-71 (parity round 70) — the CSP completion pair (R71-A).
//
// Context: the r70 delta audit (this round's recent-changes review) found
// a completeness gap in the R70-B nonce pipeline: the ROOT layout's two
// JSON-LD blocks carry the nonce, but the LOGIN layout's own
// BreadcrumbList script serves WITHOUT one — curl-verified live
// (`<script type="application/ld+json">` bare). CSP gates non-executable
// script types too, so the browser blocks the breadcrumb block silently
// (nothing executes, nothing renders differently — the full suite could
// not catch it). The same audit swept the whole served surface for
// <style> ELEMENTS: the login page's session-45 focus-cascade mirror is
// the ONLY one (every app route + 404 + logout read zero) — so the
// style-src hardening the session-151 candidate called "a nonce'd style
// pipeline touching every Radix primitive" reshapes into the CSP spec's
// elem/attr SPLIT:
//   - style-src-elem 'self' 'nonce-N' — <style> ELEMENTS must be
//     nonce'd (the linked CSS rides 'self'; the one authored login
//     block gets the layout's nonce — moved to the server login layout
//     because the client page cannot read headers()).
//   - style-src-attr 'unsafe-inline' — inline style ATTRIBUTES stay
//     allowed: the Radix popper px offsets, vaul drawer transforms and
//     recharts svg styles are DYNAMIC runtime values that cannot be
//     nonce'd or hashed. The split takes the element-side hardening and
//     documents the attribute reality instead of pretending.
// Dev adds 'unsafe-inline' to style-src-elem (Turbopack injects <style>
// elements in dev — the mirror of the dev-only script-src
// 'unsafe-eval' + ws: allowances).
//
// The REF serves no CSP at all (measured r68), so every hardening here
// remains a pure superset with zero visual impact. The functional proof
// is the FULL E2E suite on the patched build (any blocked stylesheet
// shifts computed geometry and fails the suite loudly) + the console
// violation probe documented in the round record.

test.describe("session-71 CSP completion (R71-A, the elem/attr split + the missed nonce)", () => {
  test("R71-A1: the CSP header carries the style-src elem/attr split — and no blanket style-src", async ({ request }) => {
    const res = await request.get("/login");
    expect(res.status()).toBeLessThan(400);
    const csp = res.headers()["content-security-policy"];
    expect(csp, "the CSP header").toBeTruthy();

    // The split shape (src/lib/csp.ts buildCsp, production).
    expect(csp).toContain("style-src-elem 'self' 'nonce-");
    expect(csp).toContain("style-src-attr 'unsafe-inline'");
    // The blanket directive is GONE — the specific pair replaces it.
    expect(csp).not.toMatch(/(?:^|; )style-src /);
    // The rest of the r70 shape holds unchanged.
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'nonce-");
    expect(csp).toContain("'strict-dynamic'");
    expect(csp).not.toContain("upgrade-insecure-requests");
  });

  test("R71-A2: the login HTML — the <style> element and EVERY ld+json script carry nonces (zero un-nonced)", async ({ request }) => {
    const res = await request.get("/login");
    expect(res.status()).toBeLessThan(400);
    const html = await res.text();

    // The one authored <style> element (the session-45 focus-cascade
    // mirror, moved to the server login layout) carries the nonce.
    const styleTags = html.match(/<style[^>]*>/g) ?? [];
    expect(styleTags.length, "the login page's single <style> element").toBeGreaterThanOrEqual(1);
    for (const tag of styleTags) {
      expect(tag, `the style tag is nonced: ${tag}`).toContain('nonce="');
    }

    // EVERY application/ld+json block is nonced — the r70 gap was the
    // login layout's BreadcrumbList; the root layout's WebSite +
    // Organization blocks ride the same page. Zero un-nonced members.
    const ldTags = html.match(/<script type="application\/ld\+json"[^>]*>/g) ?? [];
    expect(ldTags.length, "the three JSON-LD blocks (WebSite + Organization + BreadcrumbList)").toBeGreaterThanOrEqual(3);
    for (const tag of ldTags) {
      expect(tag, `the ld+json tag is nonced: ${tag}`).toContain('nonce="');
    }
  });

  test("R71-A3: the authed app page serves the same split policy (the second page class)", async ({ request }) => {
    const res = await request.get("/dashboard");
    expect(res.status()).toBeLessThan(400);
    const csp = res.headers()["content-security-policy"];
    expect(csp).toBeTruthy();
    expect(csp).toContain("style-src-elem 'self' 'nonce-");
    expect(csp).toContain("style-src-attr 'unsafe-inline'");
    expect(csp).not.toMatch(/(?:^|; )style-src /);
    // The app surface serves ZERO <style> elements (the r71 audit) —
    // the linked 'self' CSS is the only element-side load.
    const html = await res.text();
    expect(html).not.toMatch(/<style[^>]*>/);
  });
});
