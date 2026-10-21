# Session 70 — the SEO-surface parity pair + the CSP nonce-pipeline superset (narrative)

Parity round 69, executed 2026-10-21. The workspace SURVIVED this time —
`git pull` fast-forwarded `1322530..34b7c2b` (docs/session_147.md, the
session-69 closing transcript) with the environment intact (.env with the
QUOTED pair, db/custom.db, node_modules, a surviving :3201 zero-tenant
standalone). The four-doc review (session_146 + remediation-plan-session69
+ the worklog tail + session_147) confirmed the frontier: R68 complete
(the 32nd deploy audited non-visual, the HTTP-layer 5-header parity set
shipped, E2E 370/370 at push time), the recorded backlog EMPTY of open
visual/functional items, the standing watches = the deploy watch (re-arm
at the post-32nd finals) + the Next.js patch watch (16.4.3+) + the
Turnstile login-side watch + the superset-expansion consideration
(session_147's own suggestion: the CSP nonce pipeline).

## The round in one paragraph

Both watches read QUIET (no 33rd deploy; 16.4.2 still the latest stable;
the re-auth clean), so the round converted the r68 lesson — "census new
LAYERS, not just new members" — into a second HTTP-layer sweep, this time
below the response headers, and it found the last uncensured member of
the SEO layer: the live REF serves a 61-entry `sitemap.xml` + a robots
`Sitemap:` directive the clone had neither of. R70-A closed the gap with
the Next metadata routes (the 62-entry canonical registry, origin-resolved
like the metadataBase, live-diff-verified REF 61 ⊆ clone 62 with the one
`/dashboard` superset member). R70-B took session_147's suggestion and
built the CSP nonce pipeline — the FIRST security-policy superset (REF
serves none) — on the official Next.js middleware-nonce pattern, with the
strict `'self'` baseline earned by a full-source URL sweep that reads
zero external runtime resources, and the full E2E suite as the functional
proof that no script was blocked. Both families RED-first pinned; the
mobile surface byte-stable across a SIXTH round; all gates green at
922/922 unit + 374/374 E2E.

## The two fix families

**R70-A — the SEO surface reaches full parity.** The measured REF
evidence (docs/ref-sitemap-r70.xml): 61 `<url>` entries — `/` at priority
1.0 + the 60 app routes at 0.8, every one `changefreq weekly`, no
`lastmod` — plus the robots.txt Sitemap declaration. The clone's answer:
`src/lib/sitemap-routes.ts` (the 61-slug canonical registry — the
session-32 complete page set in the clone's lowercase canonical form —
with a unit pin that readdirSync-compares the registry against the
`(app)` route tree so a new route without a registry member fails the
gate) + `src/app/sitemap.ts` (the metadata route; origin via headers(),
exactly the metadataBase pattern) + `src/app/robots.ts` (REF's directive
set + the clone's standing `Disallow: /api/` superset + the
origin-resolved Sitemap line) with the old static `public/robots.txt`
deleted (a static file shadows the route). The URL-set diff ran live:
REF's 61 ⊆ the clone's 62, the one superset member `/dashboard` — the
clone's canonical dashboard route, whose page canonical points there
(REF omits it only because its dashboard IS `/`). Two renderer
normalizations documented rather than "fixed": Next serializes priority
1 as `1` (xsd:decimal-equal to REF's `1.0`) and renders the robots
directive `User-Agent:` (the robots spec is case-insensitive) — the
lesson recorded: assert the semantic contract, not the renderer's bytes.

**R70-B — the CSP nonce pipeline, the first security-policy superset.**
The r68 plan had deferred CSP as "its own project"; the assessment this
round: the project is small when the app earns the strictness. The
full-source URL sweep found ZERO external runtime resources (only
placeholder strings in seed data) — no external fonts, images, scripts,
or connect endpoints — so `default-src 'self'` is the correct baseline.
The pattern: `src/lib/csp.ts` (`buildCsp(nonce, isDev)` — script-src
`'self' 'nonce-N' 'strict-dynamic'`, style-src `'unsafe-inline'` for the
Radix/vaul/recharts inline style attributes, NO upgrade-insecure-
requests (it would break the plain-HTTP standalone + E2E transport;
HSTS covers TLS), dev adds `'unsafe-eval'` + `ws:`) + `src/proxy.ts`
extended (the per-request nonce set on the REQUEST headers — Next reads
the nonce from the request CSP header and stamps it on every script it
renders, the documented auto-nonce mechanism, curl-verified on the
served chunks — AND on the response; the matcher widened to include
/login + /logout, the R55-C auth-redirect explicitly scoped past them)
+ the root layout noncing its own inline scripts (the THEME_BOOT
pre-paint boot + the two JSON-LD blocks — CSP applies to non-executable
script types too). The functional proof is the suite itself: any blocked
script breaks hydration and fails specs loudly — **374/374 green under
the policy**.

## The standing checks

The mobile-menu cycle green end-to-end (toggle → the drawer opens with
Dashboard/Training LMS/Assets/Staff Requests → the Training LMS link
navigates to /training → auto-close `open:false` verified — the r69
template's auto-close eval had an unbalanced paren, caught and
re-verified directly). The byte-stability pair: **474 BYTE-MATCHES the
r69 456 pair on both sides (md5-identical: ref e24ad06…, loc e3df921…)
— the SIX-round chain (474≡456≡438≡418≡402≡366)** — the quiet REF plus
two header/meta-layer fix families changed zero rendered bytes. The
TW-v4 scan clean (`!important` 15, oklch all comments). DB pristine
(users = [sepnetflix2023@outlook.com] only).

## The sweep's other findings (recorded, supersets kept)

REF's unknown-route response is HTTP 200 (the SPA shell) — the clone's
proper 404 with its session-aware not-found page stays the
production-grade superset. REF's manifest.json + favicon 302-redirect to
platform infra — the clone self-hosts its manifest + the full icon
family. The HTTP-layer sweep #2 closes with the transport layer fully
censused: the 5-header security set (r68), the CSP superset (this
round), the sitemap/robots SEO pair (this round), the cookie + cache
layers measured and either matched or superseded.

## Gates

lint 0/0 · tsc ✓ · **922/922 unit** (+12: the 7-spec sitemap seam + the
5-spec csp seam) · build ✓ · **E2E 374/374 (5.6m, zero flakes; +4 pins,
RED-first)** · byte-stability 474≡456 (the six-round chain) · DB
pristine · the watches both quiet. Screenshots: the 458–475 set (18
files → 658 on disk; all 9 same-number pairs hash-distinct).

## Frontier after this round

The recorded backlog remains EMPTY of open visual/functional items — the
matrix complete (r66), the transport layer parity-hardened + superseded
(r68–r69: headers, CSP), the SEO surface complete (this round), the
security patches current. The standing watches: the deploy watch (re-arm
at the post-32nd finals — unchanged, both sides quiet), the Next.js
patch watch (16.4.3+), and the Turnstile platform rollout (the
login-side watch item; an enforced challenge would break the watch's own
re-auth and require a login-surface re-audit + a clone-side bot-guard
decision). The next-layer superset candidates, in candor order: a
TLS-fronted deployment story (HSTS only bites behind real TLS), CSP
style-src hardening (a nonce'd style pipeline — touches every Radix
primitive for zero REF delta), and whatever the next deploy carries.
