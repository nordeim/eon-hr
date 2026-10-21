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
 *   - style-src keeps 'unsafe-inline': TW4's compiled CSS rides a
 *     <link> ('self'), but the inline style ATTRIBUTES (Radix popper
 *     positioning, vaul drawer transforms, recharts svg styles) need
 *     the inline allowance — a nonce'd style pipeline would touch every
 *     primitive for zero reference delta (REF ships none of this).
 */

export function buildCsp(nonce: string, isDev = false): string {
  const scriptSrc = ["script-src 'self'", `'nonce-${nonce}'`, "'strict-dynamic'"];
  const connectSrc = ["connect-src 'self'"];
  if (isDev) {
    // Next dev (Turbopack fast-refresh) evals modules and talks to the
    // HMR websocket — the production standalone needs neither.
    scriptSrc.push("'unsafe-eval'");
    connectSrc.push("ws:");
  }
  return [
    "default-src 'self'",
    scriptSrc.join(" "),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    connectSrc.join(" "),
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
  ].join("; ");
}
