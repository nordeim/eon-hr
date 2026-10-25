# Remediation Plan — Session 94 / Parity Round 93: the with-data applicant-pipeline round

**The frontier.** The r93 round seeded the REF's three-job tenant (R93-H), which
turned every "with-data" surface readable for the first time: the public board's
org view, the apply flow's URL contract, the applicant dialog's Job Posting
select, the recruitment filters with data. This round walked those surfaces
cross-side with the seeded tenant live on both sides, and re-read the standing
watches (the dark-band theming, the recharts grid class, the login ladder).

**The opening read — the 63rd login deploy, NON-VISUAL.** The login asset
filenames moved again (JS `index-DlxedS3b` → `index-BBWvc7Mt`, CSS
`index-CrV5b32v` → `index-ByKl99Mk`; the app side QUIET at the recorded
`C-IrDy5f`/`BGNH4KkS`). The full standing ladder ran GREEN: the fresh login pair
**BYTE-IDENTICAL** to the standing `69aa4241…` baseline (the r88-instrument
probe) · standing audits 5/5 · route sweep 12/12 · verify-r45 13/13 ·
verify-r49 12/13 (one member reclassified this round — R94-C below) · Turnstile
0 widgets rendered (the config still ships the key + the enabled flags — the
standing state) · the experiment-assignment probe: variant `tagline`
(auth-signup-free-tagline v19, visitor `2a4fcbf8…`) — read via the
`/api/frontend-config.js` endpoint (the `window.__APP_CONFIG__` global is gone
from the page in the current generation — the probe's URL form).

**The with-data findings.**

| # | Surface | The REF's live contract | The clone's state | Action |
|---|---|---|---|---|
| R94-A | careers org view — the heading block | `<div class="mb-8"><button …mb-4>← Back to all companies</button><div class="flex items-center gap-4"><div><h2 class="text-3xl font-bold text-slate-900">{Org}</h2><p class="text-slate-600">Explore career opportunities</p></div></div></div>` — the org h2 rides inside a `flex items-center gap-4` wrapper with a `text-slate-600` subtitle | The bare h2 (no wrapper, no subtitle) — R40-G's capture predated the subtitle | **TDD FIX** |
| R94-B | the careers/public route pushes | The chip click pushes **`/Careers?org={slug}`**, the back button **`/Careers`**, the card's "View Details & Apply" **`/ExternalJobApplication?org={slug}&job={slug}`** — all CAPITALIZED in the address bar (the REF's SPA serves both casings; the address bar carries the capitalized form) | All three push the lowercase paths | **TDD FIX** (push the capitalized forms + `next.config.ts` rewrites so the capitalized URLs serve the lowercase routes — rewrites preserve the address bar) |
| R94-C | the `zero-externaljobapplication` verify-r49 member | The REF's `/externaljobapplication` makes **NO JobPosting fetch at all** (resource timing: 14 entries, zero job queries) — the "No Open Positions" zero state is a static render. The page joins the **REF-inert class** (with payrollengine/payrollmodule) | The clone's page fetches `?status=active` and renders the seeded job — the documented working superset (R40-I + R93-H) | **PROBE AMENDMENT** — the member's zero-state svg/card comparison is obsolete at seeded data; keep the container/heading pins, drop the data-dependent keys |
| — | Add Applicant — the Job Posting select | The REF's select renders **ZERO options** with its own 3-job tenant (clean session, no rate-limit interference; the console shows the `Error creating audit log: 403` signature — the same REF-broken class as the staffrequests New Request dialog) | The clone lists all 3 seeded jobs — the working superset | **DOCUMENT** (the REF-broken classification; no clone change) |
| — | recruitment with-data | Stats `1 / 0 / 0 / —` (Active Jobs / Total Applicants / Shortlisted / Avg AI Score), the tabs, the "0 candidates" table, the All Jobs filter options `All Jobs, HR Manager, HR Director, System Admin` | Identical (live-verified line for line) | **AT PARITY** |
| — | Job Postings cards with-data | The R93-H card contract (text-lg title, "dept · location", the raw lowercase draft badge slate-100/slate-600, line-clamp-2) | The R93-H implementation | **AT PARITY** (live re-verified) |
| — | the careers board | Hero + "Browse by Company" (the REF's chips are the platform's ORGANIZATION entities — 100+ tenants; the data-volume class) + "N Open Position(s)" + the R93-H card | The R93-H board (chips from the job's company — the single-tenant equivalent; the chip→org-view→back flow and the count/zero-state messages match live) | **AT PARITY** (the org-dimension difference is the documented platform/data-volume class) |

**The standing watches re-read (no change):**
- **The recharts grid class** (attendancedashboard): REF 15 vertical gridlines +
  7 horizontals vs the clone's 19 + 7 — the classified recharts 2.x-vs-3.x
  residual, unchanged (NOT decouplable via the 3.x API — the r88 finding).
- **The dark-band theming**: the experiment system active with the same
  `tagline` experiment; the standing watch carried.
- **The REF-inert classification sweep** (the r94 queue item): spot-census of
  the rarely-visited routes — /organogram (display-only, no action buttons),
  /companywall (the composer trio — the r88 fixes verified standing),
  /dynamicdashboard (the Customize button at x=1269 y=64 w=140 h=36 —
  cross-side IDENTICAL). No new unclassified surfaces.

**The hover probe caveat** (documented, no action): the careers Apply button's
hover is not measurable headlessly — Tailwind v4's `hover:` variants sit behind
`@media (hover: hover)`, which headless Chromium does not match. The REF's own
`hover:bg-primary/90` is a background-COLOR under a background-IMAGE (the
gradient) — visually inert on both readings. The clone's pinned-hex gradient
form stands (the r40 trap-3 capture).

## The fixes

### R94-A — the org-view heading block
`src/app/(app)/careers/page.tsx` — the org view's heading section becomes the
REF's structure: the `flex items-center gap-4` wrapper, the inner `div`, the
`h2.text-3xl.font-bold.text-slate-900`, and the new
`p.text-slate-600` "Explore career opportunities" subtitle.

### R94-B — the capitalized route pushes
1. `src/app/(app)/careers/page.tsx` — three pushes flip to the REF's address-bar
   form: `openOrg` → `/Careers?org=${slug}`, `backToAll` → `/Careers`, the
   apply CTA → `/ExternalJobApplication?org=…&job=…`.
2. `next.config.ts` — the rewrites: `{ source: "/Careers", destination:
   "/careers" }` and `{ source: "/ExternalJobApplication", destination:
   "/externaljobapplication" }` (Next matches case-sensitively; the lowercase
   filesystem routes keep working; the rewrites preserve the query string and
   the address bar).

### R94-C — the verify-r49 member amendment
`scripts/verify-r49.mjs` — the `zero-externaljobapplication` pair's key list
drops `svgs` and `cards` (the data-dependent members); `rootCls`, `h1Cls`,
`h1Text` stay (the container contract IS at parity). A comment records the
classification: the REF's page makes no jobs fetch — the zero state is static.

## The test plan (TDD)

**RED first** — `tests/e2e/session94-pipeline.spec.ts`:
- A1: the org view renders the `Explore career opportunities` subtitle and the
  h2 inside the REF's wrapper (asserted via the DOM structure).
- B1: the chip click lands on `/Careers?org=…` (capitalized, the address bar).
- B2: the apply CTA lands on `/ExternalJobApplication?org=…&job=…` and the page
  renders (the rewrite serves it; the heading + the param-resolved job).
- B3: direct entry — `goto("/Careers")` renders the board; `goto(
  "/ExternalJobApplication")` renders the external page (the rewrite path).

**Amendments to the standing specs (the URL contracts):**
- `session40-restructure.spec.ts` (the org-view test): the URL regexes flip to
  the capitalized form (`/Careers?org=acme-rockets`, back → `/Careers`); add
  the subtitle assertion.
- `session41-careers-family.spec.ts` (the apply-CTA test): the URL regex flips
  to `/ExternalJobApplication?org=…&job=…`.

**Unit pins** — the session94 additions to the recipe-pins spec: the careers
source pins the subtitle string, the three capitalized push paths, and
`next.config.ts` pins the two rewrites.

## Gates

lint 0/0 · tsc ✓ · unit 981+pins ✓ · build 116/116 · E2E 538 + the new members
· DB pristine at close (the loading-probe user swept — the verify-r49 probe's
documented artifact) · the evidence chain (screenshots) · the mobile-menu
cycle + the R90-B sheet re-verified on the remediated build.

## Execution appendix (filled at close)

- **RED**: the session94 E2E spec 4/4 failed as designed against the unmodified
  build (the org-view structure, the two URL contracts, the rewrite direct
  entry); the unit pins 3/3 failed as designed (981 passing alongside).
- **GREEN**: R94-A the org-view heading block (the `flex items-center gap-4`
  wrapper + the `Explore career opportunities` subtitle) · R94-B the three
  capitalized pushes + the two `next.config.ts` rewrites · R94-C the
  verify-r49 member's key list trimmed to `["rootCls", "h1Cls", "h1Text"]`
  with the classification comment. The GREEN-phase catches: the R40-F1 pin
  (the apply CTA's verbatim push string) and the R51-A2 pin (the rewrite
  scope census) — both legacy pins amended to the new contracts (the
  verbatim-source lesson re-applied). The session40/41 URL regexes amended to
  the capitalized forms; the session40 org-view test gained the subtitle
  assertion.
- **Gates**: lint 0/0 · tsc ✓ · **984/984 unit** (981 + 3 R94 pins; the two
  legacy pins amended in place) · build ✓ 116/116 · **E2E 542/542** (the 538
  standing + the 4 new session94 members — 11.0m, zero flakes).
- **The live post-fix verify**: the org view + the chip/apply/back flows
  re-read on the remediated :3200 standalone (the address bar carries
  `/Careers?org=…`, `/ExternalJobApplication?org=…&job=…`, `/Careers`); the
  mobile-menu cycle + the wizard's Contract Type through the R90-B bottom
  sheet GREEN; the verify-r49 ladder re-run 13/13.
- **The evidence chain**: r94 screenshots (the org view, the apply flow, the
  capitalized bars, the recruitment with-data pair) — see
  docs/screenshots/ (chain numbering recorded in the worklog).
- **DB pristine**: the loading-probe user (the verify-r49 probe's artifact)
  swept at close; the e2e.db lifecycle left clean by the purge script.
