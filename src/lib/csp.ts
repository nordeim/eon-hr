/**
 * The CSP nonce pipeline (session-70, R70-B) — the pure superset.
 *
 * REF serves NO Content-Security-Policy at all (measured in the r68
 * header census), so any correct policy strictly exceeds the reference's
 * transport-layer hardening — the "production-ready superset" mandate.
 * The r68 plan deferred CSP as "its own project" (a Next.js CSP needs a
 * nonce pipeline: inline scripts + hydration chunks); this round builds
 * it with the official Next.js middleware-nonce pattern:
 *
 *   src/proxy.ts generates a per-request nonce, sets the CSP on the
 *   REQUEST headers — Next.js reads the nonce from the request CSP header
 *   and stamps it on every script it renders (the documented auto-nonce
 *   mechanism) — and on the response. The root layout stamps the nonce
 *   on its own inline scripts (the THEME_BOOT boot + the JSON-LD blocks:
 *   CSP applies to non-executable script types too).
 *
 * The policy is strict because the app earns it: the full-source URL
 * sweep (session-70) reads ZERO external runtime resources — every
 * asset self-hosted, no external fonts/images/scripts/connect endpoints
 * (only placeholder strings in seed data). 'strict-dynamic' lets the
 * nonce'd bootstrap load its hydration chunks without listing hashes.
 *
 * Deliberate omissions (each pinned by tests/unit/csp.test.ts):
 *   - NO upgrade-insecure-requests: the local standalone + E2E transport
 *     is plain HTTP — UIR would upgrade subresource requests to https
 *     and break them. HSTS (the r68 set) already covers TLS-fronted
 *     deployments.
 *   - style-src is SPLIT per the CSP spec (session-71, R71-A): 
 *     style-src-elem gates <style> ELEMENTS — 'self' (TW4's compiled CSS
 *     rides a <link>) + the nonce (the one authored login cascade-mirror
 *     block, moved to the server login layout for the stamping) — while
 *     style-src-attr gates inline style ATTRIBUTES, which keep
 *     'unsafe-inline': the Radix popper positioning, vaul drawer transforms
 *     and recharts svg styles write DYNAMIC runtime values that cannot be
 *     nonce'd or hashed. The split takes the element-side hardening and
 *     documents the attribute reality instead of pretending at a hash
 *     pipeline (a blocked injected <style> element can no longer exfiltrate
 *     via CSS; the attributes were never the exfil vector anyway).
 *     Dev adds 'unsafe-inline' to style-src-elem — Turbopack injects
 *     <style> elements for CSS in dev (the mirror of the dev-only
 *     script-src 'unsafe-eval' allowance).
 *
 *   - The Trusted-Types rung (session-72, R72-A, production-only):
 *     `require-trusted-types-for 'script'` makes every DOM XSS sink
 *     (innerHTML et al.) require a Trusted* value, and `trusted-types
 *     default` is the policy-NAME allowlist — only the 'default' policy
 *     may exist, so attacker-JS cannot mint a new policy. The pass-through
 *     default policy is created by the nonced TT_BOOT bootstrap in the
 *     root layout (FIRST authored <head> script, before the flight data
 *     parses — no client sink write can precede it). The r72 census
 *     green-lit the rung: ZERO raw DOM-XSS sinks in the source and
 *     exactly five dangerouslySetInnerHTML members, all server-rendered,
 *     constant-authored and nonced. HONEST SCOPE: a pass-through default
 *     policy does not sanitize — the rung's value is the enforcement
 *     machinery + the policy-name control + the DOMPurify-ready
 *     foundation. Chromium-only enforcement (other engines ignore the
 *     pair); dev stays WITHOUT it (Turbopack's injected scripts/evals
 *     would trip it — the mirror of the dev-only unsafe-eval).
 *
 *   - worker-src 'self' (session-72, R72-B): the explicit member for the
 *     offline-shell service worker (public/sw.js). The CSP3 fallback
 *     chain would inherit it from script-src 'self'; the explicit member
 *     documents the PWA contract. Present in BOTH shapes (inert without
 *     a SW).
 */

export function buildCsp(nonce: string, isDev = false): string {
  const scriptSrc = ["script-src 'self'", `'nonce-${nonce}'`, "'strict-dynamic'"];
  const connectSrc = ["connect-src 'self'"];
  const styleSrcElem = ["style-src-elem 'self'", `'nonce-${nonce}'`];
  const isProd = !isDev;
  if (isDev) {
    // Next dev (Turbopack fast-refresh) evals modules and talks to the
    // HMR websocket — the production standalone needs neither. Dev also
    // injects <style> elements for CSS, so style-src-elem keeps
    // 'unsafe-inline' in dev only.
    scriptSrc.push("'unsafe-eval'");
    connectSrc.push("ws:");
    styleSrcElem.push("'unsafe-inline'");
  }
  const directives = [
    "default-src 'self'",
    scriptSrc.join(" "),
    styleSrcElem.join(" "),
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    connectSrc.join(" "),
    "worker-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
  ];
  // R72-A: the Trusted-Types pair rides PRODUCTION ONLY (dev's
  // Turbopack pipeline injects scripts/evals that would trip the
  // enforcement — the mirror of the dev-only unsafe-eval allowance).
  if (isProd) {
    directives.push("trusted-types default", "require-trusted-types-for 'script'");
  }
  return directives.join("; ");
}
