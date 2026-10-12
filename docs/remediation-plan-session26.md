# Remediation Plan — Session 26 / Parity Round 25

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app)
**the SEO/meta dimension audit** — the never-swept family per session_42's
suggested next steps ("the SEO/meta dimension (title/description/og tags
were never swept)"). Method: full `<head>` census on the canonical 12 routes
+ login (title, lang, charset, viewport, robots, description, og:*, twitter:*,
canonical, icon/apple-touch/manifest links, theme-color, JSON-LD), then
element-level dumps of every divergent family (the /employees full-tag dump,
the login extras, the JSON-LD contents, REF's manifest.json, and REF's
og:image render geometry).

Standing audits this round: **redeploy check PASSED** (12 canonical routes,
h1 text/font/x/y byte-identical — REF unchanged since round 24). **Mobile
navigation audit PASSED** (top strip 342×40 transparent @ (24,16) both —
the r24 probe's `topbar:false` on REF re-explained: REF's hamburger carries
its accessible name as visually-hidden TEXT, not aria-label, and no
`svg.lucide-menu`; hamburger 28×28 @ (24,22) both; tabs x=10/79/139/204/313
byte-identical; drawer 288×844 #FAFAFA z-50; kicker "Dashboard" y=101 h=28
fs=18px; md boundary 800: tabs vanish both, sidebar brand H2 x=76 y=25
18px/700 both — no Tailwind v4 bug). **With-data re-check**: REF still
renders zero data (0 rows on employees/payroll/leavemanagement/taskmanager)
— the frontier stays blocked (documented).

## The SEO/meta map (measured)

**The census (13 routes summed)** — REF vs LOC:

| family | REF | LOC | verdict |
|---|---|---|---|
| document.title | per-route mechanical | "Eon HR" everywhere | **GAP (tab-visible)** |
| meta description | per-route mechanical | one static | GAP (copy junk on REF) |
| og:* | 6 per app route (title/description/image/url/type/site_name); 9 on login (+width/height/alt) | 0 | **GAP** |
| twitter:* | 5 per app route (title/description/image/card/url); 6 on login (+image:alt) | 0 | **GAP** |
| canonical | per-route absolute | none | **GAP** |
| icon link | square logo PNG (supabase) | none (favicon.svg unreferenced!) | **GAP** |
| apple-touch-icon / manifest / theme-color | login only (#000000, /manifest.json) | none | **GAP (login distribution)** |
| JSON-LD | 2 per app route (WebSite + Organization); 3 on login (+BreadcrumbList) | 0 | **GAP** |
| lang / charset / robots | en / utf-8 / none | en / utf-8 / none | match |
| viewport | width=device-width, initial-scale=1.0 | ..., initial-scale=1 | non-gap (semantically identical; Next default serialization) |

**REF's mechanical per-route rules (the generator contract)**:

1. **Title** = `<Slug[0] capitalized + slug[1:]> | Eon HR` — e.g.
   /employees → "Employees | Eon HR", /taskmanager → "Taskmanager | Eon HR"
   (NOT the human title "Tasks & Projects"), /compliancedashboard →
   "Compliancedashboard | Eon HR". The dashboard and login pages are the
   exceptions: plain "Eon HR" (REF serves the dashboard at "/" — canonical
   "/" — and the login is the platform shell).
2. **Description** = "<Slug> on Eon HR. <base>" for the 8 measured
   single-word routes (employees, payroll, expenses, loans, attendance,
   settings, profile, reports); plain <base> for compound-slug routes
   (taskmanager, leavemanagement, compliancedashboard) and dashboard/login.
   REF's <base> is leftover base44 OnboardFlow-template copy ("Streamline
   your new hire onboarding with OnboardFlow. Automate paperwork, track
   progress, and ensure a smooth start for every employee. Perfect for
   growing businesses." — the full text, also in REF's manifest.json).
3. **og:url / canonical** = the route's absolute URL; og:type=website;
   og:site_name="Eon HR"; og:image = a 1200×630 render of the EONHR logo
   (white canvas #FEFEFE, logo content ~1107×429 centered — measured bbox;
   the raw asset is the 1563×1563 square PNG, content bbox 1440×562 ratio
   2.56 ≈ REF render's 2.58 — same logo family the clone already ships as
   public/eon-logo.png).
4. **twitter** = card=summary_large_image + title/description/image/url
   (twitter:url is NOT a standard Twitter Card tag — scrapers fall back to
   og:url; documented non-goal).
5. **Login extras (the platform-shell distribution)**: og:image:width=1200,
   og:image:height=630, og:image:alt, twitter:image:alt,
   theme-color #000000, apple-touch-icon, link manifest.
6. **JSON-LD**: WebSite {"name":"Eon HR","@context":"https://schema.org",
   "@type":"WebSite","url":<origin>} + Organization {"name":"Eon HR",
   "logo":<logo URL>} on every route; login adds BreadcrumbList
   (Home → login).
7. **manifest.json**: name/short_name "Eon HR", description (the base
   copy), icons 192×192 + 512×512 (both the square logo PNG), start_url
   (origin root), display standalone, theme_color #000000,
   background_color #ffffff, scope (origin).

**The clone's current state**: a single root-layout metadata (title default
"Eon HR" + template "%s | Eon HR" never used — no page exports a title; one
static description; no og/twitter/canonical/icons/jsonld). public/favicon.svg
and public/robots.txt exist but the HTML never links an icon — the tab shows
no favicon at all. Most (app) pages are client components ("use client") —
they cannot export metadata, hence the per-route-layout strategy below.

## Gap groups

- **R25-A (per-route titles + descriptions)**: create `src/lib/meta.ts` —
  `pageMetadata(route: string): Metadata` implementing REF's mechanical
  title rule (slug-capitalized + " | Eon HR"; the route layout for
  /dashboard passes the special-case) and per-route descriptions
  "<Name> on Eon HR. <clone base>" with the clone's OWN base copy. Then a
  per-route `layout.tsx` (server, 5 lines) in each of the 44 (app) route
  dirs exporting `pageMetadata("<route>")` — client pages cannot export
  metadata; the tiny server layout is the idiomatic Next 16 pattern.
- **R25-B (openGraph + twitter cards)**: root layout gains site-level
  openGraph (type=website, site_name="Eon HR", images=[/og-image.png]) and
  twitter (card=summary_large_image, images) defaults; the helper adds the
  per-route og:title/description/url + twitter:title/description/image.
  Next shallow-merges nested metadata objects, so site defaults survive
  per-route overrides.
- **R25-C (canonicals + dynamic metadataBase)**: the helper sets
  `alternates.canonical` per route; the root layout's `generateMetadata`
  derives `metadataBase` from `headers().host` (protocol-aware) so every
  relative URL (canonical, og:image, og:url) resolves against the ACTUAL
  serving origin — byte-structural parity with REF's absolute URLs,
  self-consistent on any deployment. Documented divergence: REF's
  /dashboard canonicals to "/" (REF serves / directly); the clone's root
  redirects to /dashboard, so its canonical is /dashboard.
- **R25-D (icons + og:image + manifest + theme-color)**: generate the asset
  family from public/eon-logo.png (PIL script → committed): og-image.png
  (1200×630, white canvas, logo scaled to ~1202² centered — the REF
  composition), icon-192.png + icon-512.png (square, full logo — REF's
  manifest icons are the raw square logo), apple-touch-icon.png (180×180).
  Root layout links icons.icon=/icon-192.png; login/layout.tsx adds
  icons.apple, manifest="/manifest.json", viewport.themeColor="#000000",
  og:image width/height/alt + twitter:image:alt. public/manifest.json with
  the clone's own copy (name/short_name "Eon HR", icons 192+512,
  start_url "/", display standalone, theme #000000, background #ffffff,
  scope "/").
- **R25-E (JSON-LD)**: the root layout renders two script tags (WebSite +
  Organization with the headers()-derived origin and /eon-logo.png) on
  every route; login/layout.tsx adds BreadcrumbList (Home → login).

## Verified non-gaps (documented, no action)

- lang=en, charset=utf-8, robots absent — identical both sides.
- viewport "initial-scale=1" vs "1.0" — semantically identical (Next's
  default serialization); not worth string-hacking.
- twitter:url — not a standard Twitter Card tag (og:url is the documented
  fallback); REF's base44 generator emits it, scrapers ignore it.
  Non-goal.

## Documented divergences (clone supersets / REF junk not replicated)

- REF's OnboardFlow description copy is leftover base44-template junk
  referencing a different product (same family as the base44 branding
  imgs) — the clone keeps its own base copy with the same structural
  prefix rule. Documented since the copy is invisible in-app.
- REF's og:image/icon/apple-touch-icon/manifest assets are supabase-hosted
  base44 platform storage — the clone self-hosts the same-logo family
  (public/eon-logo.png derived).
- REF's manifest start_url/scope are absolute platform URLs; the clone
  ships the portable relative form ("/").
- REF's /dashboard canonical is "/" (serves / directly); the clone's is
  /dashboard (root redirects). Structural parity maintained per-origin.
- REF's 60+ modulepreload links on /login are base44 platform build
  artifacts — not replicated.
- REF's og:image:alt is "Base44 link preview" (platform branding); the
  clone uses its own alt text.

## Execution order (TDD)

1. RED pins (`tests/unit/recipes.test.ts` session-26 block):
   - meta.ts: the title rule (single-word capitalization; the dashboard
     special-case), the description prefix rule, canonical + og + twitter
     fields (source pins).
   - root layout: generateMetadata with headers()-based metadataBase,
     og:site_name/type, twitter:card, icons, and the two JSON-LD scripts.
   - login/layout.tsx: the absolute "Eon HR" title, theme-color,
     manifest, apple-touch-icon, og image dims/alt, BreadcrumbList.
   - coverage pin: every (app) route dir has a layout.tsx exporting
     `pageMetadata("<route>")` (fs scan, count == route count).
   - assets pin: og-image.png parses as 1200×630 PNG, icon-192/512 and
     apple-touch-icon.png exist with the right IHDR dimensions; manifest
     carries the REF field set.
2. GREEN: the PIL asset script → public assets; src/lib/meta.ts; root
   layout edits; login/layout.tsx; the 44 per-route layouts (codemod
   script, output reviewed).
3. Gates: lint → typecheck → unit → build → E2E (86) — restart :3200
   after the build (the stale-server lesson).
4. Live dual-browser verification: the 13-route head census re-run —
   titles MATCH REF exactly on all 13; description structure matches;
   og/twitter/canonical resolve absolute per-origin; login extras; JSON-LD
   presence; icon links; the canonical 12-route geometry sweep (metadata
   must not move geometry); mobile chrome spot check.
5. Screenshots: the og-image asset, the login meta evidence, 2 standards
   refreshed → docs/screenshots/.
6. Docs: AGENTS session-26 layer + counts, SKILL §38 + counts, PAD
   [S26], CLAUDE/README counts, session log (docs/session_44.md),
   worklog, this plan's completion record.

## Completion record (session 26)

All 5 gap groups executed TDD-first (12 new pins in
tests/unit/recipes.test.ts, all RED before implementation → GREEN; two
pin corrections mid-flight — the og/twitter title expectations (REF's
og:title IS the full templated string) and the image alt field name;
one live-verification strengthening — og:type/og:site_name now repeat
per-route after the Next openGraph-replacement behavior was caught):

- **R25-A**: src/lib/meta.ts (pageMetadata — the mechanical
  title/description rules, behaviorally pinned via module import) + 46
  per-route server layouts (scripts/r25-codemod-layouts.mjs; client
  pages cannot export metadata).
- **R25-B/C**: the root layout's generateMetadata derives metadataBase
  from headers() (x-forwarded-proto + host) — canonical/og URLs resolve
  absolute against the actual serving origin; og:type + siteName repeat
  per-route (the merge discovery).
- **R25-D**: scripts/r25-gen-assets.py → public/og-image.png (1200×630,
  REF's white-canvas composition), icon-192.png, icon-512.png,
  apple-touch-icon.png (180), public/manifest.json (REF's field set,
  own copy).
- **R25-E**: WebSite + Organization JSON-LD in the root layout;
  BreadcrumbList + theme-color + manifest + apple-touch-icon + og:image
  dims/alt on login/layout.tsx.

Gates: lint 0/0 · tsc ✓ · 432/432 unit (+12) · build ✓ · 86/86 E2E.
Live-verified: 13/13 titles byte-identical + 13/13 structure OK; the
12-route geometry sweep 12/12 MATCH; mobile chrome clean. 3 evidence
screenshots (83/84/85) + 3 standards refreshed → 98 total. DB pristine
(users=1, employees=1, leaveBalances=2, payroll=0, expenses=0).
