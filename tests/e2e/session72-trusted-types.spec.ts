import { test, expect } from "@playwright/test";

// Session-72 (parity round 71) — the Trusted-Types rung (R72-A, the CSP
// strictness ladder's next step).
//
// Context: the candor-ordered superset candidates from session_155 named
// "the remaining CSP strictness rungs (a Trusted-Types story)". The r72
// sink census green-lit it: the whole source reads ZERO raw DOM-XSS sinks
// (innerHTML/outerHTML/insertAdjacentHTML/document.write — all zero) and
// exactly FIVE dangerouslySetInnerHTML members — every one
// server-rendered, constant-authored (JSON.stringify of constant
// objects or template-literal CSS) and nonce'd. No dynamic or
// user-derived content reaches any sink.
//
// The rung (CSP3):
//   - `require-trusted-types-for 'script'` — every DOM XSS sink
//     (innerHTML et al.) requires a TrustedHTML/TrustedScript/
//     TrustedScriptURL value; plain strings are rejected.
//   - `trusted-types default` — the policy-NAME allowlist: only the
//     'default' policy may exist, so a future attacker-with-JS cannot
//     mint a new policy name; any page code that passes a plain string
//     to a sink is auto-wrapped by the default policy.
//   - the nonced TT_BOOT bootstrap (root layout, FIRST authored script
//     in <head>, production-only) creates the pass-through default
//     policy — createHTML/createScript/createScriptURL identity
//     functions. HONEST SCOPE NOTE: a pass-through default policy does
//     not sanitize anything — the rung's value is the enforcement
//     MACHINERY (policy-name control + loud console violations for any
//     future sink) and the DOMPurify-ready foundation; the five current
//     sinks are constant-authored + nonced, nothing to sanitize.
//   - `worker-src 'self'` — the explicit member for R72-B's service
//     worker (the CSP3 fallback chain would inherit it from script-src
//     'self'; the explicit member documents the contract).
//
// Chromium-only enforcement (Firefox/Safari ignore the directives —
// graceful). REF serves no CSP at all (measured r68) and no TT
// directives — a pure superset, zero visual impact. The functional
// proof: the console probe (dialog + drawer + chart under enforcement,
// zero violations) + the FULL suite green.

test.describe("session-72 Trusted-Types rung (R72-A)", () => {
  test("R72-A1: the CSP carries trusted-types default + require-trusted-types-for + worker-src (both page classes)", async ({ request }) => {
    for (const path of ["/login", "/dashboard"]) {
      const res = await request.get(path);
      expect(res.status()).toBeLessThan(400);
      const csp = res.headers()["content-security-policy"];
      expect(csp, `the CSP header on ${path}`).toBeTruthy();
      expect(csp).toContain("trusted-types default");
      expect(csp).toContain("require-trusted-types-for 'script'");
      expect(csp).toContain("worker-src 'self'");
      // The r70/r71 shape holds underneath the new rung.
      expect(csp).toContain("script-src 'self' 'nonce-");
      expect(csp).toContain("style-src-elem 'self' 'nonce-");
      expect(csp).toContain("style-src-attr 'unsafe-inline'");
      expect(csp).not.toContain("upgrade-insecure-requests");
    }
  });

  test("R72-A2: the served HTML carries the nonced TT default-policy bootstrap", async ({ request }) => {
    const res = await request.get("/login");
    expect(res.status()).toBeLessThan(400);
    const html = await res.text();
    // The bootstrap: a nonced inline script creating the 'default'
    // pass-through policy (window.trustedTypes feature-detected).
    const m = html.match(/<script([^>]*)>([^<]*trustedTypes[^<]*)<\/script>/);
    expect(m, "an inline script mentioning trustedTypes").toBeTruthy();
    expect(m![1], `the bootstrap script tag is nonced: ${m![1]}`).toContain('nonce="');
    expect(m![2]).toContain("createPolicy");
    expect(m![2]).toContain("'default'");
  });

  test("R72-A3: LIVE enforcement — the default policy exists and a ROGUE policy name THROWS", async ({ page }) => {
    await page.goto("/dashboard");
    // The default policy exists (created by the TT_BOOT bootstrap) —
    // pre-change no policy is created: defaultPolicy reads null.
    const hasDefault = await page.evaluate(
      () => !!(window as unknown as { trustedTypes?: { defaultPolicy?: unknown } }).trustedTypes?.defaultPolicy,
    );
    expect(hasDefault, "trustedTypes.defaultPolicy exists").toBeTruthy();
    // The policy-name allowlist: 'rogue-r72' is not in the `trusted-types`
    // allowlist (only 'default'), so creating it THROWS. Pre-change (no
    // trusted-types directive) any name is allowed: the call succeeds
    // and this assertion fails — the RED contract.
    const rogueOutcome = await page.evaluate(() => {
      try {
        (window as unknown as { trustedTypes: { createPolicy: (n: string, r: object) => unknown } }).trustedTypes.createPolicy("rogue-r72", { createHTML: (s: string) => s });
        return "NO-THROW";
      } catch (e) {
        return `THROWS:${(e as Error).name}`;
      }
    });
    expect(rogueOutcome).toContain("THROWS");
  });
});
