# Remediation Plan — Session 10 (Parity Round 9: centered-header x-offset, companywall width, training restructure, StatCard variant map, attendance toolbar, 404 page)

Every gap below was measured live against `https://eon.base44.app` in a dual
agent-browser setup (default session = reference, `--session loc` = clone;
DOM ground truth — computed styles + bounding boxes, both sides measured).
Reference measurements at 1440×900 (desktop) and 390×844 (mobile).

Baseline at session start (workspace continuing from remote `4b6ed98`, the
session-9 push + transcript): lint 0 errors + 0 warnings · tsc ✓ · **164/164
unit** · build ✓ · **86/86 E2E** — re-validated from scratch this session.

Environment: `.env` present (`DATABASE_URL="file:../db/custom.db"` +
`AUTH_SECRET`), `db/custom.db` + `db/e2e.db` at the repo root; the shell's
exported absolute `DATABASE_URL` unset for the build legs per the AGENTS.md
rule.

## Audit context

Audit scope per the user's brief: repo skills consulted
(`skills/skills-catalog.md` → `code-review-and-audit` methodology — secret
scan clean on the session-9 diff, no `any`/empty-catch/eval/
`dangerouslySetInnerHTML`/`@ts-ignore` in `src/`, `process.env` reads
confined to the four server-only seams, zero unpinned `bg-gradient-to-*` in
`src/` outside comments; `agent-browser` for the dual-browser sweep;
`tdd-workflow` for the fix cycle; avant-garde mobile-nav taxonomy A–H
re-checked — no failure present).

**Mobile navigation (the user's priority) re-verified end-to-end and
byte-identical**: top bar 73px sticky; 5 bottom tabs (61px items, active
`rgb(37,99,235)`, border-top `rgb(226,232,240)`); drawer 288×844 `#FAFAFA`
+ `rgba(0,0,0,0.8)` overlay; Employees submenu expansion (6 sub-items at
identical y-pitch); kicker geometry y=89/h=53/18px/700 **and rendered scroll
behavior** (both sides' kicker scrolls away to y=-89 at scrollY=178 — the
reference's `sticky` is still inert inside its non-scrolling wrapper stack;
the clone's static bar renders identically); the md boundary (767px mobile
chrome → 800px desktop sidebar 256px); dashboard mobile cards (Quick
Actions/Leave Balances/Recent Requests/Expense Claims all at identical
positions). **No Tailwind v4 bug present** — all six documented traps remain
pinned by the token/recipe tests.

The gaps below are NEW findings from a deeper content-area sweep (stat-card
variants, per-page furniture) plus two latent session-9 misses (the centered
headers' x-offset was verified for y/font-size but not horizontal center;
the training page's header button). The reference was NOT redeployed again —
every still-pinned surface from sessions 2–9 re-verified unchanged.

---

## Gaps found (the fixes)

### R9-A (High) — Centered headers center at the wrong x (4 pages)

The reference's centered pages wrap the header in a **full-width
`text-center` block directly under the content wrapper** (no flex row):

```
div.max-w-7xl.mx-auto.space-y-8
└── div.text-center                (1120px wide — full width)
    ├── badge (inline-flex, centered by the block)
    └── h1 (block, text-align: center)
```

The clone's `PageHeader` renders its standard `sm:flex-row
sm:items-center sm:justify-between` row with the title block as a
**shrink-to-fit flex child** (`min-w-0 text-center`), so the text centers
inside its own content width instead of the row:

| Page | Ref text center | Clone text center | Offset |
|---|---|---|---|
| /training | 848 | 551 | −297 |
| /evaluations | 848 | 696 | −152 |
| /companywall | 848 | 534 | −314 |
| /organogram | 848 | 521 | −327 |

(848 = the content-area center at 1440×900 with the 256px sidebar.)

**Fix** — `src/components/shared/page-header.tsx`: when `centered`, the
title block gains `flex-1` in addition to `text-center` — the block then
fills the row width and the text centers at the row center exactly like the
reference's full-width block (companywall's narrower max-w-3xl wrapper is
handled by R9-B; its row is the 768px wrapper, so flex-1 centers at 848
there too). None of the four pages renders header actions on the reference,
so the flex-1 + justify-between combination is unconstrained today.

### R9-B (High) — /companywall is a narrow centered feed (max-w-3xl)

Reference (measured): content wrapper `max-w-3xl mx-auto space-y-6` →
**768px wide at x=464**; composer card (464,196) 768×264; empty feed card
(464,484) 768×238 with "No posts yet / Be the first to share something with
your team!" (the clone's copy already matches; only the width differs).
Clone: `max-w-7xl flex-col gap-8` → 1120px wide; composer (288,204)
1120×222.

The reference's composer interior (measured):

```
row 1 (y=221): avatar 40×40 rounded-full (16px/600 initials)
             + textarea 662×78 14px, placeholder "Share an update with your team…"
row 2 (y=319): label "Who can see this post?" 14px/500
             + select trigger 662×36 (full width, "All Employees")
row 3 (y=399): Photo (90×32, 12px/500) + Video (90×32) left · Post (93×36, 14px/500) right
```

The clone's composer: no avatar, a "Share an update" label above the
textarea, placeholder "What's happening in your team?", select `sm:w-52`,
and Photo/Video/Post all `size="sm"` (28px tall).

**Fix** — `src/app/(app)/companywall/page.tsx`:
- wrapper: `mx-auto flex w-full max-w-3xl flex-col space-y-6` (the reference
  uses space-y-6, not gap-8)
- composer: add the 40×40 gradient avatar (the app's initials-avatar
  pattern), drop the "Share an update" label, textarea placeholder →
  "Share an update with your team…" with `min-h-[78px]`, audience select
  full-width, Photo/Video keep `size="sm"` (matches 90×32), Post → default
  size (h-9, 93×36).

### R9-C (High) — /training restructure (header action, section heading, empty state, tabs)

Four measured differences:

1. **Header actions**: the reference's training header has NO action button
   (badge + h1 + subtitle only, centered). The clone renders a "New
   Platform" gradient button in the header (158×36 @ x=1250).
2. **Section furniture**: the reference renders a bare `h2.text-2xl
   font-bold text-slate-900` "Training Platforms" (24px/700, (288,276))
   inside a `flex items-center justify-between mb-6` row, then a **bare
   card** (288,332) 1120×202 containing the empty state — no CardHeader, no
   "0 platforms · 0 courses" description. The clone renders a Card with
   CardTitle 16px + count description and the grid inside.
3. **Empty state**: the reference's training empty state is the SIMPLE
   variant — `p-12 text-center` + 64px icon + a single `p.text-slate-500`
   16px line "No training platforms available" (card 202px tall, no h3, no
   CTA). The payroll-style full variant (h3 18px + description + dark CTA)
   is a different page's recipe. The clone renders the full variant (card
   396px).
4. **Category tabs**: the reference renders bare buttons in a
   `flex gap-2 overflow-x-auto pb-2` list — active = `bg-[#171717]`
   `text-#FAFAFA` (12px/500, h-8 px-3 rounded-md), inactive = white bg +
   1px `#E5E5E5` border + `#0A0A0A` text (same metrics) — the
   taskmanager-toggle family, NOT the shadcn segmented TabsList. The clone
   renders the shadcn `TabsList` (gray pill background, 14px triggers,
   white active segment).

**Fix** — `src/app/(app)/training/page.tsx`:
- remove the PageHeader `actions` prop entirely (parity);
- replace the Tabs/Card structure with: tab row (bare buttons per the
  recipe above, same `category` state), then `h2.text-2xl font-bold
  text-slate-900` "Training Platforms" in a `flex items-center
  justify-between mb-6` row — the "New Platform" button rides the row's
  right side (the reference's own affordance slot, empty on the reference;
  our working dialog = the documented superset pattern), then the bare Card
  containing either the platform grid or the simple empty state;
- the simple empty state renders icon + one 16px slate-500 line — the
  EmptyState component gains a `simple` mode (or the page renders the
  markup inline; component mode preferred for reuse);
- the in-content "New Platform" EmptyState CTA is removed with the full
  variant.

### R9-D (High) — StatCard variant map (systemic; ~14 pages render the wrong variant)

Session 6 generalized ONE stat recipe (p-6 / 48px tile / 30px value / 170px
card / `gap-6 md:grid-cols-4`) from payroll + analytics. A fresh sweep of
every stat row on the reference found the reference actually renders
**per-page variants**; the clone renders the standard variant everywhere.
Full measured map (REF → CLONE):

| Route | Reference variant | Clone today | Fix |
|---|---|---|---|
| /payroll | standard 262×170, `gap-6 md:grid-cols-4` | same | none ✓ |
| /advancedanalytics | standard 262×170, `gap-6 md:grid-cols-4` | 268×190 `gap-4 xl:grid-cols-4` | grid → `grid gap-6 md:grid-cols-4` |
| /expenses | standard 262×170 `gap-6 md:4` | 268×170 `gap-4 xl:4` | grid → `grid gap-6 md:grid-cols-4` |
| /surveys | standard 262×170 `gap-6 md:4` | 268×170 `gap-4 xl:4` | grid → `grid gap-6 md:grid-cols-4` |
| /allleaverequests | standard 3-col 357×170 `md:3 gap-6` | 363×170 `gap-4 xl:3` | grid → `grid gap-6 md:grid-cols-3` |
| /recruitment | **compact** 268×146, p-5, 40px tile, 24px value, `grid-cols-2 md:4 gap-4` | standard 190 | compact + grid |
| /compliancedashboard | compact 146 | standard 170 | compact + grid |
| /assetmanagement | compact 146 | standard 170 | compact + grid |
| /attendancedashboard | compact 146 | no-tile 110 p-6 30px | compact + grid |
| /surveyanalytics | compact 146 | no-tile 110 | compact + grid |
| /analyticsdashboard | compact + hint line (`text-xs text-slate-400 mt-1`) → 166 | standard 190 | compact + hint + grid |
| /payrollmodule | **compact-s** 142: p-5, 40px tile, **20px** value | standard 170 | compact-s + grid |
| /documenttracker | **mini-horizontal** 80: `p-4 flex items-center gap-3`, 44px tile left, 24px value | standard 170 | mini-horizontal + grid |
| /shiftcalendar | **mini** 82: p-4, no tile, 24px value | standard 170 | mini + grid |
| /performancemanagement | **no-tile** 110: p-6, 30px value, `md:4 gap-6` | standard 170 48px tile | no-tile + grid |
| /workflowautomation | no-tile 110, `md:3 gap-6` | standard 170 `gap-4 xl:3` | no-tile + grid |
| /hrreports | **mini-centered** 90: `p-4 text-center`, no tile, 30px value, 272w, `grid-cols-2 md:4 gap-4` (3 cards) | no-tile-ish 110 368w `xl:3` | mini-centered + grid |
| /analytics | **tile-right** 138: p-6, 48px tile right-aligned, 30px value, `gap-6 md:4` | standard 190 | tile-right |
| /templates | NO stat row on the reference | 1-card stat row (268×190) | remove the stat row |
| /evaluations | NO stat row on the reference | 4-card standard row (268×170) | remove the stat row |
| /notificationpreferences | **mini-centered** 3-col `grid-cols-3 gap-4`, 229×86, p-4 text-center, no tile, 30px value — cards "0 Unread", "0 Total", + a centered **Mark All Read** button card (136×32 h-8 12px/500) | 2-card standard row 168×170 `grid-cols-2 xl:4` | mini-centered 3-col + Mark All Read card (functional: marks all read) |
| /payrollengine | none on either | none ✓ | none |
| /attendance | 5-col standard cards (see R9-E) | 5-col fitting | R9-E |

**Fix** — `src/components/shared/stat-card.tsx` gains a `variant` prop:

```
standard (default) — p-6, 48px tile, text-3xl value, 170h (today's recipe)
compact            — p-5, 40px tile ([&_svg]:h-5 w-5), text-2xl value, 146h
compact-s          — compact with text-xl (20px) value, 142h
mini               — p-4, no tile, text-2xl value, 82h
mini-centered      — p-4 text-center, no tile, text-3xl value, 90h
horizontal         — p-4 flex items-center gap-3, 44px tile, text-2xl value, 80h
no-tile            — p-6, no tile, text-3xl value, 110h
tile-right         — p-6, 48px tile right (flex row justify-between), text-3xl value, 138h
```

Every call site above switches to the measured variant + grid classes. The
`hint` prop already renders the analyticsdashboard hint line. Icon colors
per page are unchanged (tileClassName).

### R9-E (High) — /attendance: 7 header buttons, Report Type toolbar, leading-[2] drop

Reference (measured):

- **Header actions**: `flex gap-3` cluster 911px wide with **seven** buttons
  — Print (86), PDF (81), Excel (90), Devices (121), Settings (123),
  Dashboard (142), **Import Attendance** (195, cyan gradient
  `#2563EB→#0891B2`, h-9/14px). The six outline buttons are **h-8 / 12px /
  px-3** (the Button `sm` size), not the standard h-9/14px. The cluster
  squeezes the title block to 312px, so the h1 "Staff Attendance" **wraps
  to two lines at normal line-height** (48px×2 = 96px box) — the
  session-5 `leading-[2]` pin is stale (the redeployed reference dropped
  it; sessions 9's re-pin missed this page because the actions were never
  re-counted).
  Behaviors on the reference: Dashboard navigates to `/attendancedashboard`
  (real); Devices, Settings and Import Attendance are dead controls.
- **Report Type toolbar**: a card (288,280) 1238×70 between the header and
  the stats — "Report Type:" + a Radix select (h-9, "All Staff Report") with
  options **All Staff Report / Individual Employee / Department Report**.
  (The card is 1238px wide — the reference's attendance page overflows its
  1120px content area horizontally; the clone renders the fitting 1120px
  width, the documented fix-the-broken superset.)
- **Stats**: five standard cards (Total Employees, Present Today, Absent
  Today, Late Arrivals, Attendance Rate — the clone's labels already match)
  in `grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4`; the reference's
  235px cards overflow (5×235+4×16=1239 > 1120) — the clone's 211px
  fitting version stays (xl:grid-cols-5).

**Fix** — `src/app/(app)/attendance/page.tsx`:
- drop `titleClassName="leading-[2]"`;
- actions → Print/PDF/Excel/Devices/Settings at `size="sm"` outline;
  Dashboard at `size="sm"` (navigates to /attendancedashboard via Link
  routing — the reference's real behavior); the final CTA relabels to
  "Import Attendance" (keeps the clone's working mark-attendance dialog —
  superset over the reference's dead button; cyan variant, default size);
  Devices/Settings get honest info toasts (superset over dead controls);
- add the Report Type toolbar card above the stats: "Report Type:" label +
  Select (the three measured options; All Staff Report default. Functional
  filtering is a superset nicety — the report type feeds the existing stats
  computation where sensible, else stores the selection).

### R9-F (Medium) — 404 page (unmatched routes) + audit addenda

Both /reviews and /reviewcycles 404 on both sides (no such routes), but:
the reference renders its 404 **inside the app shell** (sidebar visible,
authenticated) — centered `h1` "404" **72px/300** at (624,306) + `h2` "Page
Not Found" **24px/500** at (624,412). The clone renders the Next.js default
(small inline "404 This page could not be found.", no shell).

**Fix** — new `src/app/not-found.tsx` (server component): calls
`getSessionUser()`; when authenticated renders the AppShell + the centered
404 block, else the bare centered 404 on the canvas gradient. Block:
`h1.text-7xl font-light text-slate-900` + `h2.text-2xl font-medium
text-slate-900` (+"mt-4"-equivalent spacing to land h2 at 412 given h1 at
306 → 72px h1 + 34px gap).

## Verified non-gaps / deliberate deviations (no action)

- **Left-aligned h1 box widths** (securitysettings 896 vs 422, reports 1120
  vs 502, profile 1024 vs 463, notificationpreferences 720 vs 338,
  communications/interviewassistant/settings 1120 vs ~236-521): the
  reference's block-level h1 fills the container; the clone's flex-child h1
  shrink-wraps. Left-aligned text starts at the same x — rendered output
  identical.
- **/attendance grid fitting**: the reference's stat row and toolbar
  overflow 1120px (its own bug); the clone's fitting 5-col/211px version
  stays (same documented category as the /Dashboard case-fix and the
  mobile training overflow).
- **Dead reference controls** (attendance Devices/Settings/Import
  Attendance, companywall none): the clone keeps working superset
  equivalents.
- **Dashboard card titles**: reference `<div>` vs clone `<h3>` (a11y, same
  geometry) — documented since session 9.
- **/templates**: reference renders no stat row; the clone's single
  "0 Onboarding Templates" stat tile is removed by R9-D (the page keeps its
  live-count subtitle from session 9).
- **training tabs wrap**: the reference's `overflow-x-auto` list is
  reproduced as part of R9-C.
- The payroll/advancedanalytics standard grids re-verified byte-identical
  after the grid fix (262px cards, 24px gaps).
- All six Tailwind v4 traps remain pinned; mobile-nav taxonomy A–H absent.

## Execution order (TDD)

1. **RED unit pins** — extend `tests/unit/shell-recipes.test.ts` with a
   session-10 block: centered title block `flex-1` (R9-A), companywall
   wrapper + composer structure (R9-B), training H2 row + bare card + tabs
   recipe + header without actions (R9-C), the StatCard variant map + the
   per-page grid matrix (R9-D — extend the existing stat-card pins),
   attendance actions/toolbar/no-leading-[2] (R9-E), not-found block
   (R9-F).
2. **GREEN** — the component + page edits above (StatCard variants first,
   then the per-page sweep, then the page restructures).
3. **E2E** — the wizard CRUD spec must stay green; add/adjust pins only
   where existing specs assert the old structures (search for stat-card
   and attendance assertions first).
4. **Full gates**: lint → tsc → unit → build → E2E.
5. **Live dual-browser re-verify** of every fixed surface (centered
   headers' text center = 848; companywall 768 wrapper + composer
   geometry; training H2/tabs/empty state; the 14 stat rows; attendance
   header/toolbar/stats; the 404 at /reviews on both sides) + a mobile-nav
   regression re-check.
6. Screenshots refresh + docs updates (AGENTS.md StatCard variant map +
   attendance recipe, CLAUDE.md counts, README counts, PAD test matrix,
   eon-hr_SKILL.md session-10 layer, session log, worklog).
7. `.env.example` re-verified (no change expected).

All changes on `main`; no new branches.

---

## Completion record (executed 2026-10-10)

All six remediation items landed, TDD (30 RED pins first, then GREEN;
several live-verify corrections during the re-measure loop):

- **R9-A** — `centered` now adds `flex-1` to the PageHeader title block.
  Live-verified: all four pages (training, evaluations, companywall,
  organogram) center their badge/h1 at **848** — the reference's exact
  content center (was 521–696).
- **R9-B** — companywall renders the max-w-3xl space-y-6 feed (768px at
  x=464); composer restructured to the reference (40px initials avatar via
  /api/auth/me, label-less textarea with the verbatim placeholder,
  full-width audience select, Photo/Video h-8, Post h-9 with a Send icon).
  Live-verify correction: rows 2-3 indent to the textarea column (pl-14)
  and the Post button carries the reference's Send icon (93px vs 61px).
- **R9-C** — training: header actions removed; tabs rebuilt as bare
  dark/outline buttons (`flex gap-2 overflow-x-auto pb-2` — byte-identical
  to the reference: first tab 39×32 12px #171717); section furniture = bare
  text-2xl/700 H2 in a justify-between mb-6 row with the New Platform
  dialog riding the empty right slot; bare card with the SIMPLE empty
  state (p-12 + 64px icon + one 16px slate-500 line — the empty-state text
  lands at y=461, the reference's exact value). Live-verify correction:
  the card interior is p-0 (the p-12 renders directly, matching the
  reference's 202px card).
- **R9-D** — StatCard gained the eight-variant map; 18 pages updated
  (compact ×6, compact-s, horizontal, mini, mini-centered ×2, no-tile ×2,
  tile-right, grid fixes ×5, stat-row removals ×2, notificationpreferences
  3-col + Mark All Read card). Live-verify corrections: mini/mini-centered/
  no-tile must NOT render the icon tile (first cut rendered it whenever an
  icon was passed); the compact value drops mb-1 (146px cards — recruitment
  now byte-exact); hrreports' Report Builder restructured to the reference's
  compact 106px filter row (five 169px columns, Status Filter as the
  sixth); the recruitment hint dropped (the reference renders no hints).
  Residuals within tolerance: documenttracker 86 vs 80, analytics 126 vs
  138, notificationpreferences 90 vs 86.
- **R9-E** — attendance: the seven-button cluster renders with
  byte-identical widths (86/81/90/121/123/142/195 — every button exact,
  cluster 911px); Print/PDF/Excel at sm outline, Devices teal-700 /
  Settings / Dashboard blue-700 at h-9, Import Attendance cyan; every icon
  carries mr-2 (the reference's 16px effective gap — the computed
  gap:8px + svg margin-right:8px combo, rediscovered via canvas
  text-metric comparison). leading-[2] dropped (the reference's title is a
  natural-lh 312px two-line wrap). The Report Type toolbar card renders at
  y=281 (ref 280) with the three-option select driving the stat row's
  scope. Live-verify correction: the reference's own page overflows
  horizontally at 1440 (docW 1558) to keep its 312px title + 911px cluster
  on one row — the clone keeps the fitting 1120px canvas, the title on one
  line, and wraps the cluster to a second row (`sm:flex-wrap`); a
  `titleNoShrink` min-content floor was tried and removed (it reproduced
  the overflow instead).
- **R9-F** — `src/app/not-found.tsx` renders the 72px/300 "404" +
  24px/500 "Page Not Found" centered at 847-848 inside the AppShell for
  authenticated sessions (sidebar 256px verified) and on the canvas
  gradient otherwise.

Gates after remediation: lint 0 errors + 0 warnings · tsc clean ·
**194/194 unit** (30 new session-10 pins; one stale session-5
leading-[2] pin inverted; 2 pin regexes corrected for the titleNoShrink
iteration) · build · **86/86 E2E**. Mobile navigation re-verified after
the fixes: top bar 73px, drawer 288×844 #FAFAFA + rgba overlay, bottom
tabs byte-identical, kicker static, no horizontal overflow on any touched
page. 24 screenshots refreshed via capture-all (production standalone
build); DB pristine after capture (users=1, employees=1,
leaveBalances=2).
