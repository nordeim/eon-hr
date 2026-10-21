import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Pin file tracing to this project so the standalone server always lands
  // at .next/standalone/server.js — even when the repo is cloned inside a
  // parent workspace that has its own lockfile.
  outputFileTracingRoot: path.join(import.meta.dirname, "."),
  reactStrictMode: false,
  // Hide the floating Next.js dev-tools button — it is a dev-mode-only
  // overlay that would otherwise appear in docs/screenshots/ captures and
  // does not exist in production (visual-parity hygiene).
  devIndicators: false,
  // Next 16's dev-origin protection silently blocks dev chunks for other
  // origins (unhydrated page, native form GET fallbacks) — allow localhost,
  // 127.0.0.1 and the sandbox preview host (docs/Tailwind-V4-Validation-
  // Report.md §trap log c).
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "preview-chat-5bfe59f5-c893-4b45-a3ea-ad5caa2ef1af.space-z.ai",
    "*.space-z.ai",
  ],
  // Session 51 (R51-A): the /Dashboard route-casing alias. REF's platform
  // serves routes case-insensitively — its canonical dashboard URL is the
  // CAPITAL /Dashboard (its own /organizationsetup + /dynamicdashboard
  // redirects land there) while its internal links use the lowercase
  // form. Next.js on a case-sensitive FS serves only /dashboard, so the
  // capital form 404'd. The rewrite serves the dashboard at /Dashboard
  // with the URL bar UNCHANGED (exactly like REF — not a redirect), the
  // content/metadata/auth-guard riding the real lowercase route. Scope:
  // the canonical form only — a re-export DIRECTORY (Dashboard/ beside
  // dashboard/) would collide on case-insensitive checkouts (macOS).
  //
  // Session 55 (R55-B): the ROOT serve — the same URL-unchanged-rewrite
  // pattern for `/`. REF's SPA maps its index route to the dashboard:
  // `/` renders the dashboard content with the URL staying at `/` (the
  // r55 census phase B), and its post-login redirect lands there (phase
  // A). The clone's root was a server REDIRECT to /dashboard (the URL
  // bar changed — src/app/page.tsx, now removed: beforeFiles rewrites
  // precede the filesystem, so the page was dead code). Logged-out `/`
  // is guarded by the edge proxy (src/proxy.ts) before the rewrite
  // ever runs.
  async rewrites() {
    return [
      { source: "/Dashboard", destination: "/dashboard" },
      { source: "/", destination: "/dashboard" },
    ];
  },
  // Session 69 (R69-A): the HTTP-layer parity set. The live REF platform
  // serves a 5-header security set on every response (measured via
  // curl -sI on https://eon.base44.app/login — the layer 67 rounds of
  // DOM-level audits never censused); the clone's standalone served none.
  // Source "/:path*" covers every route — pages AND /api/* — exactly
  // like the REF platform. HSTS included: browsers ignore it over plain
  // HTTP (the local/E2E transport), it protects real TLS-fronted
  // deployments, and it matches REF exactly. No CSP: REF serves none
  // (measured) and a Next.js CSP needs its own nonce pipeline.
  // Pinned by tests/e2e/session69-security-headers.spec.ts (R69-Aa/b).
  //
  // Session 73 (R73-B): the security-isolation rung — the second pass
  // the session_157 frontier ordered. Re-measured this round (curl -sI):
  // the live REF serves NO cross-origin isolation policies on any
  // surface, so the trio is a pure superset (and response-layer: zero
  // rendered bytes — the byte-stability chain unaffected by
  // construction):
  //   cross-origin-opener-policy: same-origin — windows share
  //     references only with same-origin openers (the tabnabbing /
  //     window-confusion class).
  //   cross-origin-resource-policy: same-origin — no other origin may
  //     embed this origin's resources; lands on EVERY response the
  //     catch-all covers (pages, /api/*, /_next/static chunks, public/
  //     assets — measured this round), which is exactly the opt-in the
  //     document's own subresource loads need under COEP.
  //   cross-origin-embedder-policy: require-corp — the document may
  //     only load subresources that opt in via CORP or CORS. EARNED: the
  //     whole-source URL sweep (session-70, re-verified) reads ZERO
  //     external runtime resources — every asset self-hosted; the social
  //     glyphs are inline SVG; recharts/Radix pull no cross-origin
  //     fetches. Pinned RED-first by
  //     tests/e2e/session73-security-isolation.spec.ts (R73-Ba/b/c).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(self), microphone=(self), geolocation=(self), payment=(self), usb=(self), magnetometer=(), gyroscope=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
};

export default nextConfig;
