# Remediation Plan — Session 13 / Parity Round 12

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app)
computed-style diffing at 1440×900 + 390×844 + the md boundary (767/800),
plus the session-17 suggested deep-dives (loans/staffrequests empty-state
pixel audit — both verified byte-identical; data-injected table audit —
passed, DB restored pristine). Redeploy check: REF unchanged since round 11
(route h1s + sidebar footer byte-identical). Mobile navigation audited
end-to-end per the standing user priority: top bar, bottom tabs, drawer,
submenu, kicker geometry + scroll-away, md boundary — all byte-identical,
no Tailwind v4 bug.

## Verified non-gaps (documented, no action)

- **h1 block-width furniture**: on settings, securitysettings,
  communications, reports, interviewassistant, hrassistantchat, profile,
  analytics the REF renders its h1 directly in the content flow (block,
  fills 1120/1024/896px) while the clone wraps it in the PageHeader flex
  row (shrink-to-fit `min-w-0` column). Positions, fonts, weights and
  every following element's geometry are identical — left-aligned text
  renders the same. The centered-title group (training, evaluations,
  companywall, organogram) already carries the flex-1 fill and matches.
- **REF's own bugs kept as fitting supersets**: /attendance docW 1558 +
  2-line h1; /recruitmentkanban docW 1664; /employeeselfservice stuck at
  "Loading your profile…" (REF dead page — the clone renders fully).
- **loans/staffrequests empty states** (session-17 suggestion):
  loans byte-identical (64px icon @277, h3 @357, p @393, CTA @433);
  staffrequests identical except the tab trigger width (R12-F below).
- **Data-injected audit** (session-17 suggestion): payrollmodule and
  expenses tables render data rows correctly (61px rows under the
  session-12 th recipe), analytics tiles go data-driven, dashboard
  unaffected; DB restored to pristine (users=1, employees=1,
  leaveBalances=2, payroll=0, expenses=0).

## Gap groups

- **R12-A notificationpreferences** (the largest):
  - Stat tiles: label is a `<p class="text-xs …">` (12px/16px) → tiles
    86px (clone renders a div at 14px/20px → 90px).
  - Both card headers: title-only (72px, no description line).
  - Preference rows: `flex items-center justify-between py-3 border-b
    last:border-0` (61px) with a left cluster `flex items-center gap-3`
    — 32×32 icon chip (`p-2 bg-slate-100 rounded-lg`, 16px svg) + text
    column (`p text-sm font-medium text-slate-800` + `p text-xs
    text-slate-500`). Clone rows lack the icon chip and border-b and use
    gap-4 (60px).
  - Save row: `pt-2 flex justify-end` (44px) at the end of the content
    stack; button 185×36 with a 16px Save icon (mr-2). Clone renders a
    separately padded row (60px) with a 153×36 iconless button.
  - Card 2 header: `flex items-center justify-between`, title-only.
  - Card 2 empty: simple `text-center py-8 text-slate-400` — 32px svg +
    one `text-sm` P "No notifications yet" (124px). Clone renders the
    full EmptyState (p-12, 64px icon, h3 + p, 236px).

- **R12-B hrreports toolbar card**: interior is a GRID — `grid
  grid-cols-2 md:grid-cols-4 lg:grid-cols-6(?)` with 64px field tiles
  (card 106px). Clone renders `flex flex-wrap gap-4` with 56px tiles
  (card 98px).

- **R12-C hrreports table card**: the table container keeps the card's
  horizontal padding (`p-6 pt-0`, table 1086 wide). Clone strips it
  (`p-6 pt-0 px-0 pb-0`, table 1134 full-bleed).

- **R12-D hrreports header**: subtitle sits directly under the h1 (no
  mt-1 → 52px title block, p at y=56); actions cluster is `flex gap-2`
  (not gap-3); Export CSV/Export PDF buttons carry the 16px icon with
  mr-2 (145/144px vs the clone's 137/136px).

- **R12-E analytics page** (distinct from analyticsdashboard):
  - Stat tiles 138px, stacked recipe: label `<p class="text-sm
    text-slate-500">` TOP, value `<p class="text-3xl font-bold
    text-slate-900 mt-2">`, delta `<p class="text-xs text-slate-500
    mt-2">`; 48×48 icon chip (`w-12 h-12 bg-{c}-100 rounded-xl`) pinned
    right via `flex items-start justify-between`. Clone renders the
    tile-right variant (126px, value+label in a row).
  - Chart cards: `border-b border-slate-200` headers (65px, DIV title
    `font-semibold leading-none tracking-tight`, NO description) +
    `p-6` content with 300px charts. Chart grid is `grid lg:grid-cols-2
    gap-6` (548px tiles). Clone: gap-4 (552px), 98px headers with
    descriptions, 280px charts.
  - Onboarding Summary card: border-b header (title-only) + `p-6`
    content with `grid md:grid-cols-3 gap-8` of plain text stacks
    (label `text-sm text-slate-500 mb-2` + value `text-2xl font-bold`
    with per-tile colors: slate-900 / green-600 / indigo-600; 60px
    rows). Clone renders a dl of bordered icon tiles (82px rows).

- **R12-F staffrequests tab trigger**: REF trigger is `px-3 py-1`
  (137px inside a 145px pill); clone renders `h-7 px-4` (145px inside a
  153px pill). Also drop the `self-start` on the pill (REF parent is a
  bare div; geometry identical either way, align verbatim).

## Execution order (TDD)

1. RED pins in tests/unit/recipes.test.ts (session-13 describe blocks):
   notificationpreferences (stat label p, title-only headers, row
   border-b + icon chip, save row, simple empty), hrreports (toolbar
   grid, table padding, header subtitle/actions), analytics (stacked
   tile variant, border-b chart headers, gap-6 grid, summary text
   stacks), staffrequests trigger classes.
2. GREEN: StatCard `stacked-right` variant (R12-E), then the per-page
   sweeps (notificationpreferences, hrreports, analytics, staffrequests).
3. Gates: lint → typecheck → unit → build → E2E (86).
4. Live dual-browser re-verification of every fixed surface + the
   full-route sweep + mobile-nav regression.
5. Screenshots refresh + docs (AGENTS session-13 layer, SKILL §25, PAD
   [S13], CLAUDE/README counts, session log, worklog).

## Documented non-goals / supersets kept

- The clone keeps its sr-only "Navigation menu" heading in the mobile
  drawer (a11y superset, zero visual impact — REF has none).
- Category-A h1 block-width differences stay (DOM furniture, zero
  visual impact — see above).
- REF's dead/stuck pages (employeeselfservice loading loop) stay broken
  on the reference; the clone's working pages are the superset.
- The clone's data-driven texts (e.g. "Data Table (1 records)" with the
  seeded employee vs REF's "0 records") are expected DB content
  differences, not recipe gaps.

## Completion record (session 13)

All six gap groups executed TDD-first (20 new pins; 19 RED + 1 refined):
R12-A notificationpreferences, R12-B/C/D/G hrreports, R12-E analytics,
R12-F staffrequests, plus the PageHeader (subtitleClassName,
actionsClassName) and StatCard (labelClassName, stacked tile-right, own
hint) prop additions. Gates: lint 0/0 · tsc · 285/285 unit · build ·
86/86 E2E. Live dual-browser verification: notificationpreferences
(56/86@104/604@214/222@842), hrreports (52/106/90/418 + interiors),
analytics (64/138@128/415@298/175@745) byte-exact; staffrequests trigger
137×28; the hrreports table card's 197-vs-139 delta is exactly the
seeded data row (expected DB content difference). Live-verification
corrections folded back in: nprefs empty icon mb-3→mb-2; analytics
duplicate-hint fix. Mobile regression clean; full-route sweep re-run —
all fixed surfaces out of the diff.
