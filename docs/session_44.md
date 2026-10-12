# Session 44 — Parity Round 25: The SEO/meta dimension

Continuing the parity cycle after round 24 (`a6d028b` + session log
`2d8fd6e`). The owner's brief pointed at session_42/43 +
remediation-plan-session25; session_42's suggested next steps were:
re-run the redeploy check, the with-data story (still blocked on REF's
zero-data state), the checkbox focus recipe (still no measurable REF
surface), reduced-motion (open on both apps), the form-validation
error-surface dimension (still hidden by REF's zero-data state), and
the NEW dimensions — the drag-and-drop/keyboard-shortcut dimension and
**the SEO/meta dimension (title/description/og tags were never swept)**.
The SEO/meta dimension became this round's core (fully measurable on
zero-data REF — the head lives in the DOM regardless of data).

Workspace SURVIVED (git pull `a6d028b` → `2d8fd6e`, session_43.md
added); `.env` intact (`DATABASE_URL="file:../db/custom.db"`); DB
pristine (users=1/employees=1/leaveBalances=2/payroll=0/expenses=0);
node_modules intact. One baseline incident: a throwaway diagnostic
script in `scripts/` tripped lint (`no-require-imports`) — deleted, lint
0/0 restored. The production build was re-run in the foreground after a
silently-killed background nohup attempt (the background-process
lesson: subshell `( … & )` detachment survives; `setsid nohup … &` did
not).

**Baseline gates: lint 0/0 · tsc ✓ · 420/420 unit · build ✓ · 86/86
E2E** — the `2d8fd6e` state exactly.

Skills consulted (repo `skills/`): tdd (red→green, strengthened pins
after live verification), agent-browser (dual-session probing),
clone-app-pat-pro (DOM census as ground truth — the `<head>` is DOM),
tailwind-patterns (v4 layer/cascade rules — not needed this round; the
dimension was Next-metadata-side).

**Redeploy check PASSED** — 12 canonical routes byte-identical (h1
text/font/x/y; the width deltas on attendance/settings/profile/reports
remain the documented REF-overflow family). REF unchanged since round
24. **Mobile navigation audit PASSED** — the r24 probe's
`topbar:false`-on-REF reading finally ROOT-CAUSED: REF's hamburger
carries its accessible name as visually-hidden TEXT ("Toggle Sidebar"),
not aria-label, and renders no `svg.lucide-menu`; direct measurement:
top strip 342×40 transparent @ (24,16) BOTH, hamburger 28×28 @ (24,22)
BOTH, tabs x=10/79/139/204/313 byte-identical, drawer 288×844 #FAFAFA
z-50, kicker "Dashboard" y=101 h=28 fs=18px, 800px boundary: tabs
vanish both + sidebar brand H2 x=76 y=25 18px/700 both — no Tailwind v4
bug. **With-data re-check**: REF still renders zero data (0 rows on 4
surfaces) — the frontier stays blocked (documented).

**The round's core — the FIRST SEO/meta dimension audit**:

- **The census (13 routes: the canonical 12 + login)**: REF ships a
  per-route mechanical head contract — title `<slug-capitalized> |
  Eon HR` (/taskmanager → "Taskmanager | Eon HR" — the route slug, NOT
  the human "Tasks & Projects"; dashboard + login → plain "Eon HR"
  because REF serves its dashboard at "/"); description "<Slug> on Eon
  HR. <base>" for single-word slugs and plain base for compound slugs
  (the base44 humanize fails on compounds); og 6 per app route
  (title/description/image/url/type/site_name) + twitter 5
  (card/title/description/image — twitter:url is not a standard Card
  tag; og:url is the fallback); canonical per-route absolute; icon =
  the EONHR logo PNG; JSON-LD WebSite + Organization on every route;
  login adds apple-touch-icon + /manifest.json + theme-color #000000 +
  og:image:width/height/alt + twitter:image:alt + a 3rd JSON-LD
  (BreadcrumbList Home → login). REF's og:image is a 1200×630 supabase
  /render/image/ of the square EONHR logo (white #FEFEFE canvas, logo
  content ~1107×429 centered — bbox measured; the clone's
  public/eon-logo.png content bbox 1440×562 ratio 2.56 ≈ REF's 2.58:
  the same logo). REF's manifest: name/short_name "Eon HR", icons
  192+512 (the raw square logo), start_url/scope absolute platform
  URLs, display standalone, theme #000000, background #ffffff. REF's
  description base copy is leftover OnboardFlow-template junk
  ("Streamline your new hire onboarding with OnboardFlow. … Perfect for
  growing businesses." — full text recovered from the manifest).
- **The clone's gaps (all of them)**: title "Eon HR" on EVERY route
  (the tab-visible gap — REF's per-route titles are the visible
  surface), ONE static description, ZERO og/twitter/canonical/JSON-LD,
  and NO icon link at all (public/favicon.svg existed but was never
  referenced — the browser tab had no favicon).

`docs/remediation-plan-session26.md` written (5 gap groups + the census
map + documented divergences) and codebase-validated before execution
(the client-page constraint discovered: most (app) pages are "use
client" — they cannot export metadata, hence the per-route-layout
strategy).

**TDD**: 12 new pins (tests/unit/recipes.test.ts session-26 block —
all RED before implementation). Two pin corrections mid-flight (the
og/twitter title expectations were wrong: REF's og:title is the FULL
templated string "Employees | Eon HR", not the bare "Employees"; and
Next's image alt field is `alt`, not `imageAlt`). GREEN:

- **R25-A**: `src/lib/meta.ts` created — `pageMetadata(route)`
  implementing the mechanical rules (slug-capitalized title; the
  dashboard special-case `{ absolute: "Eon HR" }`; "<Name> on Eon HR."
  description prefix + the clone's OWN base copy; canonical; og;
  twitter) + a 5-line server `layout.tsx` in each of the 46 (app) route
  dirs (codemod `scripts/r25-codemod-layouts.mjs`).
- **R25-B/C**: the root layout's `generateMetadata` derives
  `metadataBase` from `headers()` (x-forwarded-proto + host) —
  canonical/og:image/og:url resolve absolute against the ACTUAL serving
  origin. **The merge discovery**: Next REPLACES the parent openGraph
  object with the child's — og:type + og:site_name must repeat
  PER-ROUTE in the helper or they vanish (the first live verification
  caught it; the helper + login layout now carry them, and the pin was
  strengthened to lock the behavior).
- **R25-D**: the asset family generated from public/eon-logo.png
  (`scripts/r25-gen-assets.py`): og-image.png 1200×630 (white #FEFEFE
  canvas, logo scaled 1202² centered — REF's composition), icon-192 /
  icon-512 (square full logo), apple-touch-icon.png 180×180;
  public/manifest.json (REF's field set, the clone's own copy,
  portable relative start_url/scope).
- **R25-E**: the root layout renders the WebSite + Organization
  JSON-LD scripts (origin from headers()); login/layout.tsx adds the
  BreadcrumbList + theme-color #000000 + manifest + apple-touch-icon +
  og:image width/height/alt.

**Gates: lint 0/0 · tsc ✓ · 432/432 unit (+12) · build ✓ · 86/86 E2E.**

**Live dual-browser verification** (all green): **13/13 titles
byte-identical** ("Eon HR", "Employees | Eon HR", … "Taskmanager |
Eon HR", "Compliancedashboard | Eon HR", login "Eon HR") + **13/13
structure OK** — per-route canonical absolute against the serving
origin, og:title/url/type/site_name/image, twitter
card/title/description/image, icon link, 2 JSON-LD schemas on app
routes; login carries theme #000000 + manifest + apple-touch-icon +
og:image 1200×630 + alt + the BreadcrumbList. The canonical 12-route
geometry sweep re-run 12/12 MATCH (metadata moves nothing); the mobile
chrome regression clean (tabs/drawer byte-identical).

**3 new evidence screenshots** (83-seo-meta-head-contract — the
round's full census report rendered as an evidence page, 84-seo-og-
image-asset, 85-login-meta-shell) + 3 standards refreshed (02-dashboard
×3 variants, 11-mobile-dashboard) → **98 total**.

Documentation updated: AGENTS session-26 layer + 432 specs; SKILL v3.9.0
+ §38 + counts (recipes 295); PAD [S26] row + test table + Last
Updated; CLAUDE 518-spec pyramid; README 432 specs + 98 captures + the
SEO/meta parity row; this session log; worklog; remediation-plan
completion record.

## Session complete — parity round 25 ready for push

**Audit**: redeploy check (REF unchanged), mobile navigation verified
byte-identical (no Tailwind v4 bug — the r24 probe artifact
root-caused: REF's hamburger is text-named, not aria-labeled), with-data
re-check (still blocked), and the FIRST SEO/meta dimension audit — the
full 13-route head census with element-level dumps (the mechanical
title/description rules, the og/twitter families, REF's manifest.json,
the og:image render geometry, the JSON-LD contents).

**Fixes (5 gap groups, TDD)**: the per-route mechanical titles (the
tab-visible gap — every route now titles like REF), the og/twitter card
family (zero → the full contract), per-route canonicals on a
headers()-derived metadataBase (absolute per-origin, self-consistent on
any deployment), the self-hosted asset family (og-image/icons/manifest
from the same EonHR logo), and the JSON-LD schemas (WebSite +
Organization + the login BreadcrumbList).

**Gates**: lint 0/0 · tsc ✓ · **432/432 unit (+12)** · build ✓ ·
**86/86 E2E** · 3 new screenshots · DB pristine.

**Suggested next steps**: re-run the redeploy check next round; the
remaining frontier — the with-data story (re-check whether the
reference gains data), the checkbox focus recipe (still no measurable
REF surface), reduced-motion (open on both apps), the form-validation
error-surface dimension (still hidden by REF's zero-data state), the
drag-and-drop/keyboard-shortcut dimension (the kanban has zero
draggables on REF — documented), and the print/reading dimension beyond
the session-18 print stylesheet audit.
