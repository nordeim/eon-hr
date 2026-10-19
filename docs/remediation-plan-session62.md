# Remediation Plan — Session 62 / Parity Round 61: The Dark-Mode Border-Color Census

**Census instrument**: `scripts/r62-border-census.mjs` — the computed
`border-color` of every visibly-bordered element in `main` (all four
sides, width>0 + style!=none, transparent sides skipped, buttons
INCLUDED — button borders were never read by any prior census), all 49
routes, paired live in DARK mode, deduped (tag|color) set comparison.
Batches: 17/16/16 (`/tmp/r62-b{1,2,3}.log`). Pre-fix: **29/49 MATCH,
20 DIFF**. Decomposition: `scripts/r62-probe.mjs` (element-level
inventory) + `scripts/r62-probe-cmp.mjs` (symmetric class-set diff).

## The recorded blind spot this round fills

The prior censuses covered fills (r57 CTAs light, r58 badges light, r59
union dark) and text colors (r60/r61 non-button text dark) — **borders
were never censused**. The r61 round found the compliance chips'
borders only incidentally. This census found border-family divergences
on 20 routes, including a BOTH-THEME checkbox-border bug no fill/text
census could ever see.

## Root causes (families)

- **A. The frozen light-mode literal** — the Customize button pins
  `border-[#e5e5e5]` (a session-3 light measurement); REF's button rides
  the flipping `border-input` token. Light identical, dark divergent.
- **B. The wrong token on a shared component** — the Checkbox borders
  ride `border-primary`, but the clone's `--primary` is the nav-blue
  repurposing (#1877f2, both themes); REF's checkbox border rides REF's
  own flipping `--primary`: **#171717 light / #fafafa dark**. A
  both-theme divergence (light: REF #171717 vs clone #1877f2).
- **C. The unpinned-shade oklch drift (trap 2)** — `border-green-200`
  renders `lab(92.42% -26.47 12.94)` on the clone vs REF's pinned
  `rgb(187,247,208)` (#bbf7d0) — live-measured on securitysettings.
  New consumers this round also need amber-200, cyan-300, cyan-50.
- **D. The border-slate-200 card family** — REF's page cards carry an
  explicit `border-slate-200` (unflipping: light #e2e8f0 borders in
  DARK mode); the clone's cards ride the flipping `border` token (dark
  #262626). 9 cards across 7 routes + the attendance stat-card hover
  members + the Report Type card restructure.
- **E. The per-color action buttons** — REF's attendance carries three
  outline buttons with explicit border colors (Devices cyan-300,
  Settings slate-300, Dashboard blue-300) + per-color hover fills.
- **F. The per-stage kanban columns** — REF's five columns carry
  per-stage `border-2` colors (slate/blue/amber/green/red); the clone
  generalized one column (the session-11 pin — the same single-measure
  blind spot as r59's taskmanager chips).
- **G. The calendar th family** — REF's shiftcalendar ths carry
  `border-b border-slate-200 bg-white` + a weekend variant.
- **H. The thead tr recipes** — REF's assetmanagement/payrollmodule
  put `border-b border-slate-200 bg-slate-50` on the header ROW;
  REF's recruitment puts the border on the THEAD itself (no tr border)
  where the clone's shared TableHeader adds `[&_tr]:border-b`.
- **I. The tag divergence** — REF's profile role badge is a DIV; the
  clone's is a SPAN (border census reads tag|color pairs).
- **J. The flattened severity cards** — REF's compliance severity
  cards are two-level (border card > inner `p-4 text-center` > value +
  label divs); the clone flattened `p-4 text-center` onto the card.
- **K. The missing textarea member** — REF's textareas carry
  `resize-none` (2/2 measured: companywall + interviewassistant).

## Fixes (TDD — RED first)

| ID | File(s) | Change |
|----|---------|--------|
| R62-A | `dashboard/customize-button.tsx` | drop the hardcoded `border-[#e5e5e5]` — the outline variant's `border-input` supplies light #e5e5e5 (identical) + dark #262626 (REF's measured flip) |
| R62-B | `ui/checkbox.tsx` | `border border-primary` → `border border-[#171717] dark:border-[#fafafa]` (REF's live pair; the --primary token stays the documented nav-blue repurposing) |
| R62-C | `globals.css` @theme | pin `--color-green-200: #bbf7d0`, `--color-amber-200: #fde68a`, `--color-cyan-300: #67e8f9`, `--color-cyan-50: #ecfeff` (v3 sRGB; ends the lab() drift + serves the new E/F consumers) |
| R62-D | training/loans/offboarding/companywall/hrletters/analytics/profile/compliance/attendance pages | the 9 cards gain `border-slate-200` (REF's unflipping pair); loans/offboarding empty-state cards rewrite to REF's exact recipe (`rounded-xl border bg-card text-card-foreground shadow col-span-full border-slate-200`, wrapper `grid gap-6 md:grid-cols-1 lg:grid-cols-2`, inner `p-12 text-center`); compliance At-Risk + `overflow-hidden`; attendance Report Type card → REF's 3-level shape (Card border-slate-200 > `p-4` > `flex gap-4 items-center`); attendance stat cards + `hover:shadow-lg transition-shadow` |
| R62-E | attendance page | Devices + `border-cyan-300 hover:bg-cyan-50`; Settings + `border-slate-300 hover:bg-accent` (border-input → slate-300); Dashboard + `border-blue-300 hover:bg-blue-50` |
| R62-F | recruitmentkanban page | wrapper div `flex-shrink-0 w-64` + per-stage column classes: Applied `bg-slate-100 border-slate-300`, Interviewing `bg-blue-50 border-blue-200`, Offer `bg-amber-50 border-amber-200`, Hired `bg-green-50 border-green-200`, Rejected `bg-red-50 border-red-200`, all `rounded-lg border-2 p-3 min-h-[400px]` |
| R62-G | shiftcalendar page | ths + `border-b border-slate-200 bg-white`; Sat/Sun ths + `bg-slate-50 text-slate-400` |
| R62-H | assetmanagement + payrollmodule pages | header `<TableRow>` + `border-slate-200 bg-slate-50`; recruitment page: `<TableHeader className="bg-slate-50 border-b border-slate-200 [&_tr]:border-0">` ×2 (REF carries no inner-tr border) |
| R62-I | profile page | the role badge `<span>` → `<div>`, drop `shrink-0` (REF's member set live-measured; the "Admin" text stays — the documented data-level divergence R59-C) |
| R62-J | compliancedashboard page | the 4 severity cards restructure to REF's two-level shape: card `rounded-xl bg-card text-card-foreground shadow border border-{sev}-200` > inner `p-4 text-center` > value `font-bold mb-1 text-3xl text-{sev}-700` + label `text-slate-500 text-xs` |
| R62-K | `ui/input.tsx` (Textarea) | base + `resize-none` |

## Legacy pins to amend (the re-measured-truth protocol)

- **R48-C2b** (checkbox): `border border-primary` → the literal pair.
- Any pin asserting the loans/offboarding hand-rolled card classes
  (`shadow-sm`, `lg:col-span-2`) — amend to REF's live recipe.
- Any pin asserting the kanban column classes (uniform slate) — amend
  to the per-stage map.
- Any pin asserting the attendance Report-Type card / action button
  classes — amend.

## Documented allowances (no fix — verified this round)

- **employees** — the seeded rows' cards/badges (data leaves) + the
  documented `bg-[buttonface]` member (the session-14 UA-tracking pin).
- **careers** — REF's live demo company data (buttons render from data).
- **interviewassistant** — the r48-C1 AI Analysis superset card.
- **attendance** — the admin superset's two cards (the R61-documented
  admin superset; census-visible by design).
- **onboardingtemplates** — the 404 Go-Home `<a>` vs REF's `<button>`
  (the r36 documented superset).
- **profile** — the badge text "Admin" (the seed role, load-bearing).
- **The muted-foreground mapping note** — REF's `--muted-foreground`
  = neutral-500 (#737373) light / #a3a3a3 dark; REF AUTHORS
  `text-slate-500` (#64748b) on its subtitles. The clone's token pins
  #64748b (subtitle parity) and its tabs/select author the neutral
  literals (tab parity) — computed parity on every censused dimension;
  the class-string divergence is the documented byte-parity allowance
  (a token-level re-map would ripple through all 49 routes' text
  surfaces; not this round's scope).

## Verification plan

1. TDD RED: unit pins in `tests/unit/recipes.test.ts` (the R62 family
   + the amended legacy pins) — all RED before the fixes.
2. GREEN: apply the fixes; unit suite green (858 + new).
3. E2E: `tests/e2e/session62-border-colors.spec.ts` — computed border
   truth, both themes where applicable (the Customize pair, the
   checkbox pair, the pinned palettes as rgb(), the card borders in
   dark, the attendance button trio, the kanban column five, the
   calendar ths, the thead rows, the severity structure, resize-none).
4. Post-fix census re-run (3 batches) — target **44/49** (the 5
   documented allowances above).
5. Full gates: lint 0/0 · tsc ✓ · unit · build ✓ · E2E full suite
   (no flakes; kill manual :3100 servers first — the rate-limiter trap).
6. Screenshots (the dev server running the remediated codebase) under
   `docs/screenshots/`.

## Post-fix census projection

29 → **44/49** MATCH. Remaining DIFFs = the five documented allowances
(employees, careers, attendance-admin, interviewassistant, onboardingtemplates).

---

## Completion record (filled post-execution)

- **TDD RED confirmed**: 15 failing / 711 old green (the R62 describe block).
- **GREEN**: all eleven fix families applied (A..K); 873/873 unit
  (three legacy pins amended: R48-C2b checkbox border, R59-B kanban
  config lines, R39-E1 textarea base).
- **E2E**: 14/14 session-62 specs (computed border truth; the spec's
  own first-run defects fixed: setDark-after-goto, the Settings
  strict-mode sibling locator, the kanban ancestor axis, the
  bg-slate-50 expectation) + the session-49 R48-C2 amendment →
  **327/327 full suite** (the documented session-58 switch/checkbox
  flake fired once mid-verification; 5/5 in isolation).
- **Gates**: lint 0/0 · tsc ✓ · 873/873 unit · build ✓ · 327/327
  E2E · **post-fix census 44/49** (exactly the projection; the five
  documented allowances verified as the remaining DIFFs) · DB
  pristine 1/1/2 (the loading-probe user swept).
- **Screenshots**: 20 paired captures (the 294–313 set) → 496 files,
  all hash-verified distinct (the 310 pair re-captured element-scoped
  — the LOC attendance page fits the viewport, no scroll content).
- **Docs**: session_127 narrative, AGENTS session-62 layer + the
  truncated-class-string lesson, CLAUDE 1200-pyramid, README tails,
  SKILL 3.45.0 §72, this record, the worklog.
