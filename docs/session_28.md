# Session 28 — Parity Round 17: Per-page header rowBreakpoint taxonomy + the profile kicker back button + the first 640–767 band sweep

Continuing the parity cycle after round 16 (`69b04db` + session-log
`a977ef0`). The owner's brief pointed at session_26/27 +
remediation-plan-session17; session_26's suggested next steps were: re-run
the redeploy check first, extend the tablet-band sweep to the remaining
~29 routes, and consider a print-stylesheet audit as a new parity
dimension.

Workspace had been RESET (fresh sandbox): fresh clone at `a977ef0`; `.env`
recreated (`DATABASE_URL="file:../db/custom.db"` + fresh AUTH_SECRET);
`bun install`; `db:push` + `db:seed` (pristine users=1, employees=1,
leaveBalances=2, payroll=0, expenses=0). The documented shell
`DATABASE_URL` trap hit again (the sandbox pre-exports an absolute
`file:/home/z/my-project/db/custom.db` that overrides `.env`) — every
DB/build command guarded with `env -u DATABASE_URL`.

**Baseline gates: lint 0/0 · tsc ✓ · 356/356 unit · build ✓ · 86/86 E2E**
— the `a977ef0` push state exactly. Static audit of the R16 diff
(`6389482..69b04db`): clean (0 `any`, no console.log/secrets).

Skills consulted (repo `skills/`): tdd (red→green vertical slices, seam
discipline), agent-browser (dual-session probing), clone-app-pat-pro
(computed styles as ground truth), tailwind-patterns (v4 CSS-first rules).

**Redeploy check PASSED** — 12 probe routes byte-identical (h1
text/font/x/y); REF unchanged since round 16.

**Mobile navigation audit (user priority)**: top bar 390×73 sticky white +
1px slate-200 border; bottom tabs at x 10/79/139/204/313, 14px labels,
20px icons, active rgb(37,99,235); drawer 288×844 #FAFAFA z-50 fixed
(geometry-located probe; links 141/301/421/461/581, footer 121@723,
overlay 390×844 z-50, hamburger 28×28@24,22); kicker 53@89 + scroll-away;
md boundary 767/800 — **all byte-identical, no Tailwind v4 bug**. Two
probe artifacts run to ground and documented: REF's sidebar is a
`DIV md:block` (256px) not `aside/nav`; REF's hamburger carries no
aria-label (the clone's is the documented a11y superset).

**Full 46-route desktop sweep (1440×900): 46/46 OK** — zero diffs at the
probe layer.

**Tablet-band sweep extended to the remaining 28 routes (768/900/1024)**
plus — the round's frontier — **the FIRST 640–767 band sweep** (all 46
routes @700, settled probes): this never-audited band between the 390
mobile audits and the 768+ tablet sweeps surfaced the round's two gap
groups and a large documented non-gap set (REF's overflow family extends;
the 61px mid-hydration artifact also produces 12px h1 y-deltas and phantom
h=80 "wraps" — settled re-probes match). **Print-stylesheet audit** (the
new dimension): ZERO `@media print` rules on either side — parity clean.

- **R17-A (header row breakpoint — 9 pages, the round's core find)**:
  REF's default-family header rows switch flex-col → flex-row at **md
  (768)**; the clone's PageHeader row switched at **sm (640)**. In the
  640–767 band REF renders COLUMN (title full-width, actions below) while
  LOC rendered ROW (title squeezed beside actions — attendancedashboard's
  and documenttracker's titles wrapped 2-line, staffrequests' title block
  shrank 668→351). Nine affected pages: payrollmodule, documenttracker,
  recruitmentkanban, assetmanagement, attendance, recruitment,
  shiftcalendar, staffrequests, attendancedashboard. REF is per-page
  inconsistent — templates/workflowconfigpage are UNPREFIXED always-rows
  and the actionsStart family is always-row — so the fix is a per-page
  `rowBreakpoint?: "sm" | "md"` prop (default sm — byte-identical for
  every other page); the nine pass `rowBreakpoint="md"`. attendance's
  R9-E fitting wrap follows the row (`sm:flex-wrap` → `md:flex-wrap`).
- **R17-B (profile kicker back button — the always-pin-X lesson again)**:
  REF's /profile kicker is a distinct variant: a leading **36×36 ghost
  ArrowLeft** (`h-9 w-9`, svg `w-5 h-5` classes but 16px rendered — the
  button base's `[&_svg]:size-4` wins on BOTH apps) at (32,105)
  navigating to /Dashboard + a `text-xs text-slate-500 truncate` subtitle
  "Manage your account" — row 44px, kicker **69px** (vs the standard
  53px h1-only recipe). The other seven kickers carry neither
  (byte-identical sweep — the profile variant had gone unnoticed because
  the h1's Y was pinned but its X (32 vs 80) never was). The clone gains
  `mobileKickerBack` (ghost Button asChild wrapping a Link to the
  casing-fixed /dashboard — documented deviation, with an aria-label REF
  lacks) + `mobileKickerSubtitle`.

`docs/remediation-plan-session18.md` written (2 gap groups + non-goals +
the band/knife-edge/blank-page lessons) and codebase-validated before
execution.

**TDD**: 7 new pins (all RED first) → GREEN; 2 stale pins updated (the
R8-A row pin + the R10-E actionsStart pin — both now assert the
`rowBreakpoint` template instead of the sm: literals).

**Gates: lint 0/0 · tsc ✓ · 363/363 unit (+7) · build ✓ · 86/86 E2E.**

**Live dual-browser verification**: the nine pages at 700 render
column/column with full-width single-line titles on both sides
(staffrequests 668=668, attendancedashboard h1 single-line, payrollmodule
title 304 vs 668 full-width — h/y byte-identical); at 1440 the nine pages
byte-identical (canonical sweep 9/9 OK); the full 46-route sweep re-run
46/46 OK — no regressions; the tablet bands (768/900/1024, r16 + r17
sweeps) = the documented diff families only; mobile regression clean (the
7 standard kickers 53px @ h1 32,101; drawer/tabs/top bar byte-identical);
the profile kicker byte-exact (btn 36@32,105 — rendered as an `<a>` with
identical geometry/classes, the documented DIV-vs-P internal-DOM family;
h1 @80,101; subtitle @80,129; kicker 69 both). DB pristine
(users=1, employees=1, leaveBalances=2, payroll=0, expenses=0).

**11 screenshots** captured/refreshed (6 new: 53-payrollmodule-band-700,
54-staffrequests-band-700, 55-attendancedashboard-band-700,
56-templates-band-700 (the always-row contrast page),
57-profile-kicker-mobile-390, 58-employees-kicker-mobile-390; 5 standards
refreshed) → 65 total. VLM spot-checks confirmed both fixed surfaces (the
profile kicker's back arrow + title + subtitle; the payrollmodule
full-width title with the action row below).

Documentation updated: AGENTS session-18 layer + 363 specs; SKILL v3.1.0
+ §30; PAD [S18] row + Last Updated + test-distribution table; CLAUDE
449-spec pyramid + session-18 pins; README 363 specs + 65 captures; this
session log; worklog; remediation-plan completion record.

## Session complete — parity round 17 pushed to `nordeim/eon-hr@main`

**Audit**: redeploy check (REF unchanged), mobile navigation verified
byte-identical end-to-end (no Tailwind v4 bug), 46-route sweep 46/46 OK,
the tablet sweep COMPLETED (remaining 28 routes), the FIRST 640–767 band
sweep, and the first print-stylesheet audit (clean).

**Fixes**: 2 gap groups with 7 new TDD pins — the per-page
**rowBreakpoint taxonomy** (nine REF-md pages render column headers in
the 640–767 band like REF; templates/workflowconfigpage/actionsStart keep
the always-row sm default) and the **profile kicker back button +
subtitle** (the 69px variant with the ghost ArrowLeft).

**Gates**: lint 0/0 · tsc ✓ · **363/363 unit** · build ✓ · **86/86 E2E**
· 11 screenshots · DB pristine.

**Suggested next steps**: re-run the redeploy check next round; the
viewport matrix is now fully swept (390 / 640–767 / 768 / 900 / 1024 /
1100 / 1280 / 1440) — the remaining frontier is the sub-640 band below
390 (320–389, if the reference supports small phones) and the with-data
story stays blocked on REF's zero-data state; consider an interaction
parity dimension next (focus rings / keyboard traversal order) as the
geometry map approaches saturation.
