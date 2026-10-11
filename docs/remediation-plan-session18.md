# Remediation Plan — Session 18 / Parity Round 17

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app)
computed-style diffing at 1440×900 + 390×844 + the r16 tablet band
(768/900/1024) extended to the REMAINING 28 routes + **the first sweep of the
never-audited 640–767 band** (all 46 routes @700, settled probes) + **the
first print-stylesheet audit** (session_26's suggested new dimension).
Redeploy check PASSED (12 probe routes byte-identical — REF unchanged since
round 16). Mobile navigation audited end-to-end per the standing user
priority: top bar (390×73 white sticky + 1px slate-200), bottom tabs
(78@766, x-pitches 10/79/139/204/313, 14px labels, 20px icons, active
rgb(37,99,235)), drawer (288×844 #FAFAFA z-50 fixed via the geometry-located
probe; links 141/301/421/461/581; footer 121@723; overlay 390×844 z-50;
hamburger 28×28@24,22), kicker (53@89, 18px/700, scroll-away), md boundary
(767 mobile chrome → 800 desktop sidebar) — **all byte-identical, no
Tailwind v4 bug** (two probe artifacts run to ground: REF's sidebar is a
`DIV md:block` 256px — not `aside/nav`; REF's hamburger carries no
aria-label — the clone's is the documented a11y superset).

Full 46-route desktop sweep at 1440: **46/46 OK** (zero diffs at the probe
layer). Tablet sweep of the remaining 28 routes + the 640–767 band sweep
surfaced 2 gap groups (R17-A/B) + a large documented non-gap set.

## Verified non-gaps (documented, no action)

- **Mid-hydration artifacts (the 61px top-bar family)**: the fast @700 sweep
  showed 12px y-deltas and phantom REF h1 wraps (h=80) on pages whose top
  bar had not yet settled (documented since session 14). Settled re-probes
  (2.2s+) match byte-for-byte. Always settle before reading REF mobile
  geometry.
- **REF's own tablet/mobile overflows** (its `flex-1 overflow-auto` wrapper
  family, extended by this round's sweeps): /analyticsdashboard 975@768,
  /assetmanagement 879@768, /attendancedashboard 832@768, /documenttracker
  901@768–900, /organogram 1135–1167@700–1024, /payrollmodule 744@390 and
  1032@768+, /recruitmentkanban 1376@700 and 1664@768, /shiftcalendar
  988@700 and 1020@768–900, /attendance 943–1199@700, /chat 741@700,
  /compliancedashboard 707@700 — plus the r16 family. The clone fits
  (fitting superset); REF's single-line titles at 768 on payrollmodule /
  recruitmentkanban are fed by this overflow (its row is 712 wide inside a
  1032-wide page) — the clone's wrapped cluster/title at exactly 768–815
  is the documented fitting-superset family (hrreports knife-edge
  category).
- **documenttracker @390 cluster knife-edge (0.23px)**: buttons
  byte-identical (Run Alert Check 178.14 + Add Document 168.09, gap 12);
  REF's row is 358.23 wide (0.23px invisible overflow — its own bug) so
  both buttons fit one line; the clone's row is exactly 358.00 so Add
  Document wraps. Same category as the r16 hrreports 1px knife-edge.
- **REF hrreports is BLANK below ~768**: renders only the "Edit with
  Base44" badge at 390 and 700 (body empty; works at 900+) — REF's own
  dead-mobile bug. The clone's working page stands as the superset (the
  /employeeselfservice family).
- **Print stylesheet**: ZERO `@media print` rules on either side — the new
  parity dimension is clean (both rely on browser defaults; attendance's
  Print button exists on both).
- **h1 block-width furniture**: settings (236 vs 971), reports (502 vs
  668), hrassistantchat (358 vs 668), organogram (668 vs 847) — left-aligned
  text at identical x/y; the block-width delta is invisible (Category-A
  furniture family). Partially normalizes after R17-A.
- **actionsStart family + templates/workflowconfigpage below 640**: REF's
  rows are UNPREFIXED always-row (`flex justify-between items-start` /
  `flex items-center justify-between mb-8|mb-6`) and overflow at 390 (docW
  422–456); the clone's `sm:` rows go column below 640 and fit — the
  documented fitting superset. At 640–767 both render row ✓.
- **settings @700**: no header Edit on either side (the Edit lives in the
  Company card, R13-B); only the pill overflow differs (both over — the
  documented pill family).

## Gap groups

- **R17-A (PageHeader default-recipe row breakpoint — 9 pages, the round's
  core find)**: REF's default-family header rows switch
  `flex-col → flex-row` at **md (768)** (`flex flex-col md:flex-row
  justify-between items-start md:items-center gap-4`, verified on
  payrollmodule/documenttracker/recruitmentkanban/assetmanagement/
  attendance/recruitment/shiftcalendar/staffrequests/attendancedashboard);
  the clone's PageHeader row switches at **sm (640)**. The never-audited
  640–767 band therefore renders REF = COLUMN (title full-width single
  line, actions below) vs LOC = ROW (title squeezed beside actions —
  attendancedashboard's h1 wraps 2-line at 700, staffrequests' title block
  shrinks 668→351, payrollmodule's title 712-wide-REF vs squeezed-LOC).
  REF is per-page inconsistent: templates/workflowconfigpage are
  ALWAYS-row (`flex items-center justify-between mb-8|mb-6`) and the six
  actionsStart pages are always-row — those keep the current `sm:`
  behavior (row at 640–767 ✓, column below = fitting superset). Fix: a
  `rowBreakpoint?: "sm" | "md"` prop on PageHeader (default "sm" — zero
  change for every other page); the 9 verified pages pass
  `rowBreakpoint="md"`. attendance's `className="sm:flex-wrap"` becomes
  `md:flex-wrap` (the R9-E fitting wrap engages only in row mode).
- **R17-B (profile mobile kicker back button + subtitle — the always-pin-X
  lesson again)**: REF's /profile kicker is a distinct variant: a leading
  **36×36 ghost button** (`h-9 w-9`, lucide `ArrowLeft` at **w-5 h-5**,
  no aria-label on REF) at (32,105) that navigates to /Dashboard, + a
  title block `flex-1 min-w-0` containing the h1 (18px/700, @80,101) AND
  a `p.text-xs.text-slate-500.truncate` subtitle "Manage your account"
  (16px) — row 44px, kicker 69px (vs the standard 53px h1-only recipe the
  other 7 kickers use, all byte-identical). The clone renders the standard
  53px kicker (h1 @32, no button, no subtitle). Fix: PageHeader's
  mobileKicker gains `mobileKickerBack` (renders the ghost ArrowLeft
  button as a Link to /dashboard — the clone's documented casing-fix
  deviation, with an aria-label a11y superset) + `mobileKickerSubtitle`
  (the text-xs line); the profile page passes both.

## Execution order (TDD)

1. RED pins: `tests/unit/shell-recipes.test.ts` — update the R8-A row pins
   to the `rowBreakpoint` template (default sm: unchanged; md: variant
   renders `md:flex-row md:justify-between md:items-center|items-start`);
   pin the 9 pages carrying `rowBreakpoint="md"`; pin attendance's
   `md:flex-wrap`; pin the profile kicker recipe (ghost h-9 w-9 ArrowLeft
   w-5 h-5 + flex-1 min-w-0 title block + text-xs slate-500 subtitle +
   /dashboard link).
2. GREEN: PageHeader `rowBreakpoint` + kicker variants; the 9 pages pass
   the prop; attendance `md:flex-wrap`; profile `mobileKickerBack` +
   `mobileKickerSubtitle="Manage your account"`.
3. Gates: lint → typecheck → unit → build → E2E (86).
4. Live dual-browser re-verification: the 9 pages at 700 (column, title
   full-width, actions below) + at 1440 (unchanged) + the profile kicker
   at 390 (button 36@32,105, h1 @80, subtitle line, kicker 69) + full-route
   sweep re-run + mobile regression (kickers on the other 7 pages +
   drawer/tabs/top bar).
5. Screenshots refresh + docs (AGENTS session-18 layer, SKILL v3.1.0,
   PAD [S18], CLAUDE/README counts, session log, worklog).

## Documented non-goals / supersets kept

- The clone keeps fitting where REF overflows (the extended tablet family
  above) — REF's overflow bugs are not cloned.
- The clone's 390 column headers on the always-row REF pages (actionsStart
  family, templates, workflowconfigpage) stay (fitting superset).
- The documenttracker 0.23px knife-edge wrap stays (fixing it would
  require an invisible overflow or breaking the pinned gap-3).
- The profile back button links to /dashboard (casing-fixed), not REF's
  /Dashboard quirk; it carries an aria-label (a11y superset) — both
  documented deviations.
- hrreports keeps its working mobile page (REF's blank-at-mobile is its
  own bug).

## Completion record (session 18)

Both gap groups executed TDD-first (7 new pins, all RED before
implementation; 2 stale pins updated — the R8-A row pin and the R10-E
actionsStart pin now assert the `rowBreakpoint` template instead of the
sm: literals): R17-A the per-page header rowBreakpoint taxonomy — nine
pages (payrollmodule, documenttracker, recruitmentkanban,
assetmanagement, attendance, recruitment, shiftcalendar, staffrequests,
attendancedashboard) pass `rowBreakpoint="md"`; at 700 both sides render
COLUMN with full-width single-line titles (h/y byte-identical;
staffrequests 668=668, attendancedashboard's title no longer wraps);
templates/workflowconfigpage/actionsStart keep the sm default (verified
unchanged); attendance's wrap is md:flex-wrap. R17-B the profile kicker
back button + subtitle — kicker 69px byte-exact (ghost 36×36 @32,105
with the ArrowLeft [16px rendered on both apps — the button base's
`[&_svg]:size-4` wins over the svg's w-5 h-5 classes], h1 @80,101,
subtitle "Manage your account" @80,129); the clone's button is an `<a>`
with identical geometry/classes (the documented internal-DOM-choice
family) linking to the casing-fixed /dashboard with an aria-label.
Gates: lint 0/0 · tsc · 363/363 unit (+7) · build · 86/86 E2E. Live
dual-browser verification: nine @700 column/column; nine @1440 9/9
canonical sweep OK; full 46-route re-run 46/46 OK; tablet bands =
documented families only; mobile regression clean; the other seven
kickers byte-identical (53px, h1 @32,101). 11 screenshots captured
(6 new: 53/54/55/56 band-700 + 57/58 kicker-mobile) → 65 total. DB
pristine (users=1, employees=1, leaveBalances=2, payroll=0, expenses=0).
