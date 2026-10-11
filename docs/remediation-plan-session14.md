# Remediation Plan — Session 14 / Parity Round 13

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app)
computed-style diffing at 1440×900 + 390×844. Redeploy check PASSED
(route h1s byte-identical on 11 probe routes — REF unchanged since round 12).
Mobile navigation audited end-to-end per the standing user priority: top bar
(73px), bottom tabs (78@766, 5 tabs byte-identical incl. x-pitches
10/79/139/204/313), drawer (288×844 #FAFAFA z-50, overlay rgba(0,0,0,0.8),
footer 121@723), submenu expansion (links at identical y's), kicker (53px@89,
18px/700) + scroll-away (−64 at scrollY 200, top bar pinned), md boundary
(767 mobile chrome → 800 desktop 256px sidebar) — **all byte-identical, no
Tailwind v4 bug**. A transient 61px REF top-bar reading was diagnosed as a
mid-hydration measurement, not a redeploy.

Full 46-route sweep + iconed-button enumeration + per-page DOM dumps found
the round-13 gap groups below. The dominant systemic find: **the reference's
iconed buttons carry `mr-2` (8px) or `mr-1` (4px) on the svg ON TOP of the
button's `gap-2`** — previously pinned only for the attendance cluster (R9)
and hrreports exports (R12); ten more call sites are missing it.

## Verified non-gaps (documented, no action)

- **h1 block-width furniture** (settings, securitysettings, communications,
  reports, interviewassistant, hrassistantchat, profile, analytics,
  notificationpreferences): REF h1 fills the content flow, clone
  shrink-wraps — zero visual impact for left-aligned titles (documented
  since round 12). The profile h1 IS present (an earlier "missing h1" was
  a probe race).
- **REF's own bugs kept as fitting supersets**: /attendance docW 1558 +
  2-line h1; /recruitmentkanban docW 1664; /employeeselfservice stuck at
  "Loading your profile…".
- **hrletters/surveys/announcements empty-state CTAs** ("New Request"/"New
  Survey"/"New Announcement" at y=474/611/276): content-position CTAs —
  the documented R10-F..I superset, NOT header buttons.
- **staffrequests pill stays `bg-muted`** (measured rgb(245,245,245) — the
  shadcn default); the WHITE pill recipe (`bg-white border border-slate-200`,
  same as evaluations since R11) applies to settings/attendance/compliance
  only.
- **Attendance admin form**: the clone's seeded user is admin; REF's is not
  (its Mark Attendance tab shows an access-restricted state). The admin
  form is the functional superset; the access-restricted recipe is added
  for non-admins.
- **REF 471/971/331px pills are shrink-wrapped** — the default TabsList
  geometry; only the clone's settings pill currently stretches full-width.

## Gap groups

- **R13-A systemic iconed-button margins (the round's core find)**:
  REF svg margins measured per call site; clone renders mr-0 → every
  affected button is +8px (mr-2) or +4px (mr-1) narrow. Call sites:
  - mr-2 (+8): employees Import CSV (145), payroll Reports & Export (185),
    payrollmodule Generate All (153), taskmanager New Project (149) +
    Kanban (117) + Projects (121), attendancedashboard Export Report (163),
    documenttracker Run Alert Check (178), surveyanalytics Run AI Analysis
    (171), analyticsdashboard Export CSV (145) + Export PDF (144),
    advancedanalytics Schedule Report (179), settings Edit (93×36 iconed
    h-9 — part of R13-B), profile Save Changes (164 — part of R13-C).
  - mr-1 (+4): attendancedashboard in-card Export (93), compliancedashboard
    Notify All ×3 (166/173/173 — part of R13-E).
- **R13-B settings**: TabsList = default shrink-wrap + `bg-white border
  border-slate-200` (971×36, NOT full-width bg-secondary); 7 iconed tab
  triggers (16px svg, Company 115 / Approval Workflows 186 / Shifts 87 /
  Departments 140 / Integrations 132 / Theme & Layout 164 / System Logs
  137, h-28); Company tab card: CardHeader `flex flex-col space-y-1.5`
  title-only (DIV `font-semibold leading-none tracking-tight` 16px) with
  the iconed h-9 Edit button in a `flex justify-between items-center` row;
  content `p-6` > `space-y-6` > `grid md:grid-cols-2 gap-6` of read-only
  tiles (523×80: `p-4` with `P.text-sm.text-slate-500.mb-1` label +
  `P.font-medium.text-slate-900` value) — card 631px total.
- **R13-C profile**: remove the extra "User" tab (REF has exactly 4:
  General/Security/Social Accounts/Preferences); iconed triggers (16px)
  in a shrink-wrapped `bg-white border` pill (507×36); General tab: border-b
  DIV-title header "Personal Information" (`font-semibold leading-none
  tracking-tight`) + `p-6` form (`space-y-6`: `grid md:grid-cols-2 gap-6`
  of `space-y-2` fields — `LABEL.text-sm.font-medium.leading-none` + h-9
  input; then `flex justify-end` Save Changes iconed 164×36 INSIDE the
  form); drop the `truncate` on the identity-card h2 (777 vs 765 measured
  width artifact); LOC's other tabs stay as functional superset content.
- **R13-D attendance stat-tab block**: default shrink-wrapped pill (471×36)
  + `bg-white border border-slate-200`; iconed triggers (16px) renamed to
  **Mark Attendance / Employee Summary / Records** (first tab is NOT
  "Dashboard"); Mark Attendance content for non-admins = access-restricted
  recipe (`flex flex-col items-center justify-center`, 64px
  `bg-red-100 rounded-full` chip + 32px icon, `H3.text-lg.font-semibold
  text-slate-900.mb-2`, `P.text-slate-500.max-w-sm`); admin content stays
  the superset marking form.
- **R13-E compliancedashboard**: header Run Compliance Scan is TEXT-ONLY
  (184px, no icon); stat-tab block: default pill (331×36) + `bg-white
  border` with two 12px-iconed triggers "Document Expiry Monitor" (219) /
  "All Alerts" (102); active tab = second stat row (`grid grid-cols-2
  md:grid-cols-4` of 268×90 mini-centered tiles) + notify row
  (`flex flex-wrap gap-2`, three 32px buttons with mr-1 icons, starting
  x=288) + toolbar (`flex flex-wrap gap-3`: bare 16px search svg + INPUT
  h-9 w-48(192) + two 144×36 selects "All Types"/"All" +
  `SPAN.text-sm.text-slate-500.ml-auto` "N at-risk documents") + table
  card (title-only `text-sm font-semibold` header + `p-0` systemic
  py-12 empty). LOC's five "(0)" filter chips are replaced by the tab
  structure.
- **R13-F reports**: active tab content = ONE card (`rounded-xl border
  bg-card`, 387px) with CardHeader `flex flex-col space-y-1.5` carrying a
  **20px svg icon + `font-semibold leading-none tracking-tight` title**;
  content `p-6` wrapping `grid md:grid-cols-2 lg:grid-cols-3` of 346×126
  tiles (`p-4`: `H3.font-semibold.text-slate-900.mb-3` two-line title +
  `flex gap-2` with two 152×32 iconed buttons); below the tab stack a
  "Report Filters" card (title-only header + `p-6` `grid md:grid-cols-4`
  [68]: Date From / Date To / Department / Status). LOC's 1-col grid of
  363×200 cards with 74px buttons is replaced.
- **R13-G offboarding**: content wrapped in `grid md:grid-cols-2
  lg:grid-cols-3`; empty = ONE full-width card (238px) with the standard
  EmptyState (p-12 text-center, 64px icon, `H3.text-lg` mb-2, P) and **NO
  CTA** (remove the duplicate New Offboarding button — the affordance
  lives in the header only).
- **R13-H selects + Export variants**: surveyanalytics All Surveys select
  w-48 (192); its Export button is the h-8 variant (97×32, px-3 text-xs,
  iconed mr-2); analyticsdashboard range select w-36 (144); attendancedashboard
  department select w-44 (176).
- **R13-I StatCard no-tile variant** (performancemanagement md:4,
  workflowautomation md:3): interior is a `flex` row — text stack
  (text-3xl value + text-sm label) LEFT + 40×40 icon RIGHT (svg 40px);
  108px cards (clone renders 104px icon-less stacks).
- **R13-J taskmanager**: every board column renders its (possibly empty)
  task-list container (`div.space-y-2`) — the space-y-3 gap contributes
  +12px on empty columns (REF 60px columns); count badge is a DIV (clone:
  SPAN).
- **R13-K payrollengine**: toolbar field wrappers use `space-y-2` (8px
  label→control gap, 64px fields, card 132px) — clone renders space-y-1
  (60px fields, 128px card).
- **R13-L small pins**: hrreports Status Filter select renders an EMPTY
  default trigger (REF shows no text — 169px geometry already matches);
  shiftcalendar "Shift Swaps" header affordance is an ANCHOR (Link) not a
  button (geometry identical 147×36@1261,72); shiftcalendar month label
  width 160px vs clone min-w-36 (144) — widen to min-w-40.

## Execution order (TDD)

1. RED pins in tests/unit/recipes.test.ts (session-14 describe blocks):
   the mr-2/mr-1 matrix per page, settings pill + card recipe, profile
   tabs + form card, attendance pill + tab names + access-restricted
   recipe, compliance structure, reports tiles + filters card, offboarding
   CTA-less empty, select widths + Export variant, no-tile variant row,
   taskmanager empty column + badge, payrollengine space-y-2, hrreports
   empty status default, shiftcalendar Link + min-w-40.
2. GREEN: shared components first (stat-card no-tile variant), then the
   per-page sweeps (R13-B/C/D/E/F/G single-page rebuilds; R13-A/H/L
   targeted class edits).
3. Gates: lint → typecheck → unit → build → E2E (86).
4. Live dual-browser re-verification of every fixed surface + full-route
   sweep + mobile-nav regression.
5. Screenshots refresh + docs (AGENTS session-14 layer, SKILL §26, PAD
   [S14], CLAUDE/README counts, session log, worklog).

## Documented non-goals / supersets kept

- The clone keeps every empty-state CTA documented in R10-F..I
  (hrletters/surveys/announcements) and the templates CTA — only the
  offboarding duplicate is removed (REF has none and its affordance is
  the header button).
- LOC's admin-only marking form, working employeeselfservice page, and
  data-driven texts ("1 records") remain functional supersets.
- The shiftcalendar Link swap is semantic parity (identical geometry).
- Category-A h1 furniture stays (documented since round 12).

## Completion record (session 14)

All twelve gap groups executed TDD-first (39 new pins; 37 RED + 2 refined
during implementation; 1 stale session-11 pin corrected after the gap-2
cluster decode): R13-A iconed-button margins (10 call sites + the
gradient-variant Schedule Report), R13-B settings pill + Company card,
R13-C profile tabs + General form, R13-D attendance tabs +
access-restricted recipe, R13-E compliance restructure, R13-F reports
category cards + tiles + filters, R13-G offboarding col-span-full empty,
R13-H selects + Export variant, R13-I no-tile StatCard flex row, R13-J
taskmanager empty column + DIV badge, R13-K payrollengine 64px fields,
R13-L small pins (hrreports empty Group By, shiftcalendar gap-2 cluster +
anchor CTA, employees toggle order, surveys zero-render). Gates: lint
0/0 · tsc · 324/324 unit · build · 86/86 E2E (one badge-selector spec
updated). Live dual-browser verification: 34/37 checks byte-exact; the
three residuals are documented (profile h2 Category-A block-fill,
attendance +24px from the reference's own 2-line header, compliance 1px
sub-pixel). Full-route sweep re-run — all fixed surfaces out of the diff;
mobile regression clean.
