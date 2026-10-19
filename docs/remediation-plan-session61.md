# Remediation Plan — Session 61 (Parity Round 60): The Dark-Mode Text-Color Census

**Date:** 2026-10-19 · **Round:** 60 (internal session 61) · **Status:** EXECUTING

## Context

Round 59 (session 60) closed the dark-mode FILL family (button fills incl.
backgroundImage + non-button leaf fills, 39/49 → 45/49). Its closing
frontier named the next census family: **the dark-mode TEXT-COLOR layer
beyond buttons** — the recorded blind spot ("the prior censuses never
read button TEXT colors", extended past buttons entirely).

**The census** (`scripts/r61-textcolor-census.mjs`): the computed `color`
of every text-bearing NON-button element (h1–h6, text leaves, non-button
svg icons) + input/textarea `::placeholder` colors, all 49 routes, paired
live in dark mode (the shared `localStorage darkMode="true"` contract),
1440×900 both sides, REF @ eon.base44.app vs the seeded LOC standalone
on :3200. Comparison: the deduped **set of (tag|color) pairs** —
text-agnostic so the seeded-LOC vs zero-data-REF populations don't
generate noise (the r60 lesson 5 — set-comparison can hide inversions —
is answered by the probe phase: every DIFF decomposed element-level with
classes + both-theme verification).

**Result: pre-fix 23/49 MATCH.** 26 DIFF routes triaged into 8
documented allowances (the data-driven family + timing artifacts) and
**19 real findings** (R61-A … R61-W), verified element-level via 7 probe
scripts (`scripts/r61-probe1..7.mjs`). Two findings are BOTH-theme gaps
the light-mode censuses never saw (the compliance chip values + labels,
the evaluations tile colors — the text-color dimension was never
censused in light either).

## The findings

### R61-A — the unpinned-shade family (trap 2, systemic)

The census's `lab()` serializations exposed four MORE unpinned shades in
active use (r59 pinned sixteen; r60 added orange-200/50 — these four
remained). REF renders the v3 sRGB values; the clone drifts oklch:

| Shade | REF (v3 sRGB) | Clone (drifts) | Verified sites |
|---|---|---|---|
| orange-500 | `#f97316` rgb(249,115,22) | lab(64.27…) | hrreports stat value p, compliancedashboard alerts icon svg, performancemanagement circle-alert svg |
| orange-700 | `#c2410c` rgb(194,65,12) | lab(46.46…) | securitysettings warning p, advancedanalytics stat value p, compliance chip value |
| orange-900 | `#7c2d12` rgb(124,45,18) | lab(30.29…) | securitysettings "Security Configuration Required" h3 |
| purple-500 | `#a855f7` rgb(168,85,247) | lab(52.01…) | workflowautomation zap svg, performancemanagement award svg |

Fix: pin all four in `src/app/globals.css` `@theme` (the r59 precedent).
The `border-orange-500` call sites (2) ride the same pin.

### R61-B — the search-icon family: authored `text-slate-400`, unflipping

REF authors `text-slate-400` on its search/filter input icons
(rgb(148,163,184) in BOTH themes — live-verified). The clone rides
`text-muted-foreground` (light slate-500 — one shade off; dark
neutral-400 #a3a3a3 — visibly grayer). Six call sites to convert:

- `payroll/page.tsx:261` · `chat/page.tsx:225` + `:397` ·
  `documenttracker/page.tsx:265` · `assetmanagement/page.tsx:291` ·
  `recruitmentkanban/page.tsx:291`

(already matching: employees, payrollmodule, careers,
compliancedashboard — `text-slate-400` authored.)

### R61-C — the compliance severity chips: colored DIV values + xs slate-500 labels (BOTH themes)

REF's second stat row (Expired / ≤7 / ≤15 / ≤30) renders
`div.text-3xl font-bold mb-1 text-{red,orange,yellow,blue}-700`
(unflipping, both themes — live-verified light AND dark) +
`div.text-xs text-slate-500` labels. The clone renders the shared
mini-centered StatCard: `p.text-3xl font-bold text-slate-900` values +
`p.text-sm text-slate-600` labels. The hrreports/npref mini-centered
recipe is correct for THOSE pages (REF renders P there — verified); the
compliance chips are a different recipe. Fix: hand-roll the four chips
in `compliancedashboard/page.tsx` (the StatCard stays for the icon row).

### R61-D — the compliance alerts/at-risk icons

- The at-risk row icon: clone `FileWarning h-4 w-4 text-orange-500` →
  REF `TriangleAlert w-4 h-4 text-orange-500` (shape only).
- The at-risk empty state: clone `FileWarning mx-auto h-16 w-16`
  (64px, inheriting) → REF `CircleCheckBig w-12 h-12 mx-auto mb-3
  text-green-400` (48px, pinned shade).

### R61-E — the evaluations stat-tile value colors (BOTH themes)

REF's value-in-tile spans carry per-tile colors:
Total=slate-700 (matches today) · Completed=`text-green-700` ·
In Progress=`text-orange-700` · Not Started=`text-slate-500`.
The clone renders all four slate-700 (the r11 pin generalized from one
tile). Fix: `valueClassName` per call site (twMerge lets the call site
win — the shiftcalendar precedent).

### R61-F — the evaluations tab-strip gap (the lost r11 mt-6)

Measured: the TabsList→stat-card gap REF 24px vs LOC 8px (everything
below the tab strip sits 16px high on the clone). The r11 recipe comment
("the base mt-2 is overridden to mt-6 per trap 4") is in the source but
the `mt-6` member is gone. Fix: restore `mt-6` on the evaluations
TabsContent.

### R61-G — the securitysettings recommendations icons

REF's "Security Recommendations" rows render `lucide-shield w-5 h-5
text-blue-600 flex-shrink-0` (20px blue, 5 rows). The clone renders
`lucide-circle-check-big h-3 w-3 mr-1` (12px, slate-600 inherited) —
the r48-C2 check glyph generalized from the feature rows. Fix: the
Shield icon + members.

### R61-H — the chat "Messages" h2

REF authors `text-lg font-bold text-slate-900` (unflipping). The clone
rides `text-foreground` (flips to #fafafa in dark). Fix: authored
slate-900.

### R61-I — the chat search wrapper geometry

The clone's chat search wrapper carries `relative px-4 pb-4` (h:52) —
the pb-4 inflates the wrapper so `top-1/2` centers the icon 8px below
the input's center. REF's wrapper is bare `relative` (h:36, icon
centered on the input). Fix: move the padding to the row container, the
icon `left-7` → `left-3`.

### R61-J — the payroll empty-state icon

REF's payroll records empty state renders `DollarSign w-16 h-16 mx-auto
mb-4 text-slate-300`. The clone renders the EmptyState default (Inbox).
Fix: pass the custom icon. (The loans page already renders DollarSign
correctly — verified.)

### R61-K — the payrollai suggestions card

REF renders a CardHeader with the CardTitle "AI Suggestions"
(`font-semibold leading-none tracking-tight`) + CardContent p-6 (the
empty-state content at x:313). The clone renders no CardHeader + p-12
(content at x:337). Fix: add the CardHeader, p-12 → p-6.

### R61-L — the interviewassistant invented copy

REF renders: the select (placeholder "Select candidate" — the standard
shadcn placeholder at zero candidates too) + the notes textarea + the
Analyze button. The clone adds: the conditional placeholder "No
candidates yet", the hint "Add candidates in Recruitment first, or
analyze unassigned notes.", and the at-rest results placeholder (the
sparkles icon + "Strengths, weaknesses and follow-up questions.").
Fix: the standard placeholder; retire the hint; the results section
renders only when an analysis exists (the functional superset stays).

### R61-M — the hrassistant empty pane

REF's zero-message pane renders NOTHING (no icon). The clone renders
`Sparkles mb-3 h-8 w-8 text-slate-300` (the r47-E5 "icon only" pin is
superseded by today's measurement — REF changed or the pin measured a
different route). Fix: remove the icon (the empty pane renders nothing).

### R61-N — the hrassistantchat "No chats" line

REF: `text-sm text-slate-500 p-4 text-center` (slate-500 unflipping +
the p-4 text-center members). The clone: `text-sm
text-muted-foreground` (flips in dark). Fix: the authored recipe.

### R61-O — the profile kicker subtitle

REF's mobile-kicker subtitle "Manage your account" renders
`text-slate-400` (rgb(148,163,184) — live-verified via the hidden
kicker read). The clone renders `text-xs text-slate-500 truncate`.
Other pages' kicker subtitles match at slate-500 — a per-page REF
variance. Fix: a `mobileKickerSubtitleClassName` escape hatch on
PageHeader; the profile passes slate-400.

### R61-P — the surveyanalytics chart legend

REF's "Response Count & Avg Sentiment" legend: "Responses" **blue-500
#3b82f6** + "Avg Sentiment %" emerald-500, DOM order
[Responses, Avg Sentiment %]. The clone: Responses **blue-600 #2563eb**
+ "Avg sentiment", DOM order [Avg sentiment, Responses]. Fix: the fill
+ name + verify/adjust the series order post-fix.

### R61-Q — the analytics chart legend (remove)

REF's analytics page renders NO chart legends (verified: zero legend
spans). The clone renders one ("Active", blue-600). Fix: remove the
`<Legend />` from `analytics/charts.tsx:48`.

### R61-R — the advancedanalytics chart legend (remove)

REF renders no legend on the payroll-trend chart. The clone renders
"Payroll (SAR)" (emerald). Fix: remove the `<Legend />` from
`advancedanalytics/charts.tsx:87`. (The recharts-tooltip-label #fafafa
p DIFF is a cursor/timing artifact — documented, not fixed.)

### R61-S — the workflowautomation header icon

REF: `Zap w-4 h-4 text-purple-600`. The clone: Sparkles. Fix: the shape
(color already matches via the parent span).

### R61-T — the compliance header icon

REF: `Shield w-4 h-4 text-red-600`. The clone: ShieldCheck. Fix: the
shape (color matches).

### R61-U — the performancemanagement stat icons

REF: Target(blue-500) · **CircleCheckBig**(green-500) ·
**CircleAlert**(orange-500) · **Award**(purple-500). The clone:
Target · Target · Target · Star. Fix: the three shapes.

### R61-V — the recruitment filter row icon

REF: `Filter w-4 h-4 text-slate-400` (x:305 y:453). The clone:
`Users h-4 w-4 text-muted-foreground`. Fix: the shape + color (the
R61-B family).

### R61-W — the attendance restricted-card icon

REF's "Access Restricted" card renders `ShieldAlert h-8 w-8
text-red-500` (239,68,68 — live-verified). The clone authors
`text-red-600`. Fix: red-500 (in the non-admin branch — the clone's
admin-superset branch is the documented R13-D divergence).

## The documented allowances (no fix)

1. **employees** — the seeded rows (names/badges in foreground +
   emerald-700) vs REF's zero state; REF's blue-600 svg = the transient
   `refresh-cw` loading icon (read-timing artifact, verified: not
   present on a settled re-read).
2. **careers** — REF's live job postings (data-driven).
3. **profile** — the role badge "Admin" vs REF's "User" (R59-C, the
   seed's admin role is load-bearing).
4. **attendance** — the admin-gated overview superset vs REF's
   restricted card (R13-D).
5. **shiftcalendar** — the seeded stats (1 employee, 31 unassigned
   days).
6. **onboardingtemplates** — both sides 404; the DIFF = the 404 Go-Home
   icon allowance (R60-G).
7. **advancedanalytics** — the recharts tooltip label (a cursor-hover
   artifact) + the KPI data values.
8. **recruitment** — REF's live job-card trending icons (data-driven).

## Execution plan (TDD)

1. **RED**: unit pins in `tests/unit/recipes.test.ts` (the R61 family)
   + `tests/unit/tokens.test.ts` (the four palette pins) — all failing
   against the current source, old 834 green.
2. **GREEN** (order):
   a. R61-A the four @theme pins
   b. R61-B/V the six+one search/filter icons
   c. R61-C/D the compliance chips + icons
   d. R61-E/F the evaluations tiles + mt-6
   e. R61-G–J the security/chat/payroll families
   f. R61-K/L/M/N/O the payrollai/interview/hrassistant/chat-kicker/profile
   g. R61-P/Q/R the chart legends
   s. R61-S/T/U/W the icon shapes
3. **E2E**: `tests/e2e/session61-textcolor.spec.ts` — computed truth,
   both themes where applicable: the four palette rgb() renders, the
   compliance chip pair, the evaluations tile colors, the search icons
   both themes, the chat h2 + No-chats line dark pair, the
   recommendations shields, the payroll DollarSign empty icon, the
   payrollai CardHeader, the interviewassistant at-rest contract, the
   hrassistant empty pane, the chart legend presence/absence, the
   legend colors/names.
4. **Gates**: lint 0/0 · tsc ✓ · unit ≥ 834+ · build ✓ · E2E full suite
   (no flakes) · post-fix census re-run (the 26 DIFF routes)
   · DB pristine 1/1/2.
5. Screenshots (the R61 evidence pairs) → docs/screenshots/.
6. Docs: session_124 journal, AGENTS session-61 layer, CLAUDE/README
   counts, SKILL 3.44.0 + §71, worklog.

## Validation record (pre-execution)

- All 19 findings verified element-level on BOTH sides (7 probe
  scripts, both-theme verification for R61-C/E).
- The 8 allowances verified data-driven or timing-artifact.
- Call sites grepped and enumerated (the six search icons, the chart
  Legends, the icon imports).
- No finding contradicts a standing pin; three findings supersede
  documented assumptions (r47-E5's icon, r48-C2's recommendations
  glyph, r11's generalized slate-700) — the pins will be amended to the
  re-measured truths.

## Completion record (2026-10-19)

**EXECUTED IN FULL.** The 19 findings + 1 addendum (R61-X, the
requestreports th — decomposed in probe2 but dropped from the first plan
draft; caught by the post-fix census re-run and fixed) are closed:

- **R61-A** — the four @theme pins (orange-500/700/900, purple-500) +
  the green-400 pin (R61-D's fix made it active, exposing its own drift)
- **R61-B/V** — the seven search/filter icons (payroll, chat x2,
  documenttracker, assetmanagement, recruitmentkanban, recruitment)
- **R61-C** — the compliance chips hand-rolled (per-severity borders +
  colored DIV values + xs slate-500 DIV labels; the mini-centered
  StatCard stays for hrreports/npref)
- **R61-D** — TriangleAlert row + the 48px green-400 CircleCheckBig empty
- **R61-E/F** — the per-tile valueClassName + the StatCard span honoring
  it + the restored mt-6
- **R61-G..J** — the Shield glyphs, the chat h2 + bare wrapper, the
  DollarSign empty icon
- **R61-K..O** — the payrollai CardHeader + p-6/py-12 stack, the
  interviewassistant standard placeholder + hint removal, the
  hrassistant empty pane, the No-chats recipe, the kicker escape hatch
- **R61-P/Q/R** — the surveyanalytics legend (blue-500 + the name + the
  DefaultLegendContent reorder — recharts 3's auto order ignores BOTH
  the Bar mount order and the YAxis declaration order, measured) + the
  two Legend removals
- **R61-S/T/U/W** — the four icon shapes + red-500
- **R61-X** — the requestreports tr members

**Pins**: 24 unit (23 RED-first R61 + 1 R61-X; the R22-D/R30-B1/R35-C2/
R48-C2/R48-C6/R17-B legacy pins amended to the re-measured truths) +
18 E2E (`tests/e2e/session61-textcolor.spec.ts` — computed truth, both
themes where applicable).

**Gates**: lint 0/0 · tsc ✓ · **858/858 unit** (+24) · build ✓ ·
**314/314 E2E** (+18, no flakes — the session-58 switch/checkbox
documented flake fired once mid-verification, 11/11 green in isolation
per the flake-check) · post-fix census **40/49** (the nine remaining
DIFFs documented: the profile role badge + the hidden-kicker-icon
census artifact, the interviewassistant superset card, the
shiftcalendar seeded stats, the advancedanalytics tooltip artifact +
KPI data, the recruitment/employees/careers live- and seeded-data
leaves, the onboardingtemplates 404 icon, the attendance admin
superset) · DB pristine 1/1/2.

**The round's instrument finds** (recorded in the journals): the
manual-:3100-server trap (an in-memory rate limiter poisoned the
reused-port playwright runs mid-suite — always kill manual servers
before test:e2e); the purge P2003 chain (a leaked fixture row made
every subsequent global-setup purge die silently at the employee sweep
— the purge now walks the FKs first); the census's missing w:0 filter
(hidden kicker/sr-only svgs pollute the tag|color sets — the r60
lesson re-learned for the text-color read); the transient refresh-cw
(REF's loading-state icon appears only mid-fetch); the recharts-3
legend-order behavior; lucide-react's Filter=funnel class rename.
