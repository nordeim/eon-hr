# Remediation Plan — Session 12 / Parity Round 11

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app)
computed-style diffing at 1440×900 + 390×844, data-injected audit round
(clone APIs populated, then pristine DB restored), plus the session-15
prompts (data-injected audit; expenses/leavemanagement border-b CardHeader
deep-dive). All recipes below re-measured live on the reference during this
session (footer, expenses, leavemanagement, documenttracker, evaluations,
analyticsdashboard, payrollmodule, templates, communications, employees,
securitysettings, surveyanalytics, hrreports, attendancedashboard,
advancedanalytics) — the reference has NOT been redeployed since session 11
(all route headers byte-identical).

## Systemic components (shared)

- **R11-A Sidebar footer** — the reference renders a left-aligned cluster,
  not justify-between, and 36×36 icon buttons:
  ```
  div.flex.flex-col.gap-2.border-t.border-slate-200.dark:border-slate-800.p-4   (255×121 @ desktop)
  ├── div.flex.items-center.gap-2.mb-2        (223×36)
  │   ├── button ghost h-9 w-9  Bell          (36×36, 16px svg, haspopup dialog)
  │   ├── button ghost h-9 w-9  Moon          (36×36, 16px svg, select-none)
  │   └── button outline h-8 px-3 text-xs font-semibold text-slate-700
  │       border-slate-300 min-w-[64px] Languages+عربي                      (80×32)
  └── button ghost h-9 px-4 py-2 w-full justify-start gap-3 hover:bg-slate-100
      ├── div.w-9.h-9 gradient circle + CircleUser 16px    (36×36 avatar)
      └── div.flex-1.min-w-0.text-left
          ├── p.font-medium.text-slate-900.text-sm.truncate   (name)
          └── p.text-xs.text-slate-500.truncate               (email)
  ```
  Geometry: footer 255×121@779; عربي 80×32; user 223×36@848; mobile drawer
  footer 255×36@792 (user button row only differs by documented rounding).
  The clone's current footer: `p-3` + `justify-between` 32×32 buttons +
  `p-2` user trigger (231×52) — rebuild per recipe. Same recipe for desktop
  rail and mobile drawer (shared SidebarFooter).

- **R11-B EmptyState conditional margin + variants** — the reference's
  empty-state P carries `mb-4` ONLY when an action follows (expenses:
  `text-slate-500` no mb-4; templates: `text-slate-500 mb-4` because its
  superset CTA follows). Make the description margin conditional. Add the
  **iconChip** variant: `w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4
  flex items-center justify-center` with a 32px slate-400 icon (templates,
  64px circle instead of the bare 64px icon).

- **R11-V Systemic table recipe** — reference th: `text-left py-3 px-4
  font-medium text-slate-500` (45px @ 20px text) vs clone `h-10 px-3
  text-muted-foreground` (40px). Reference empty-row td: `py-12 text-center
  text-slate-400` (117px row, colSpan). Measured on payrollmodule
  ("Payslips — October 2026" card); apply to ui/table.tsx (th) + the
  shared empty-row markup used by data tables.

- **StatCard horizontal variant precision (R11-D driver)** —
  documenttracker stat row: `p-4 flex items-center gap-3`, tile
  `w-11 h-11 rounded-xl bg-{color}-100` (44px), value `text-2xl`+label
  `text-sm` in a 48px block → 80px card, `border-0 shadow-sm`,
  `grid grid-cols-2 md:grid-cols-4 gap-4`. The variant exists; ensure the
  tile classes + card classes match exactly.

## Per-page gaps

- **R11-C templates** — empty state switches to the iconChip variant
  (slate-100 circle + 32px icon); P keeps mb-4 (the clone's CTA superset
  follows it).
- **R11-D documenttracker** — page renders: header (kicker chip 225×36 +
  H1 + P + 2 buttons 178/168) > stat row (4× 80px horizontal cards) >
  filter row `flex flex-wrap gap-3 items-center` (search `relative flex-1
  min-w-64` + chip group `flex bg-white border border-slate-200 rounded-lg
  p-1 gap-1`, chips `px-3 py-1.5 rounded text-xs font-medium transition-all
  capitalize` — texts All/valid/expiring soon/expired/pending upload,
  active `bg-blue-600 text-white`, rest `text-slate-600 hover:bg-slate-50`)
  > empty card `p-6 py-16 text-center` with a bare 48px icon (mb-3) and a
  single P `text-slate-500` "No documents found" (no h3, no action).
  Replaces the current Tabs + EmptyState structure.
- **R11-E expenses** — table card: CardHeader `flex flex-col space-y-1.5
  p-6 border-b border-slate-200` with a DIV title `font-semibold
  leading-none tracking-tight` "Expense Claims" (65px header); CardContent
  `p-0` > `p-12 text-center` empty (64px icon, h3 mb-2, P without mb-4,
  NO action — the page-header CTA is the affordance). Remove the clone's
  redundant card-header CTA.
- **R11-F leavemanagement** — same border-b CardHeader + DIV title "My
  Leave Requests"; CardContent `p-6` > `text-center py-12` (200px) with a
  64px icon and a single P `text-slate-500` "No leave requests yet"
  (no h3, no action, no mb-4).
- **R11-G allleaverequests** — same border-b CardHeader + DIV title
  pattern for its table card (empty-mode sweep).
- **R11-H payroll** — records card gets the search-toolbar treatment:
  standalone `relative max-w-sm` search input row + border-b CardHeader
  with DIV title + `p-0` content with the systemic table empty mode.
- **R11-I payrollmodule** — between stats and table: standalone search
  `relative max-w-sm` (384px, Search icon + h-9 input); table card header
  DIV title "Payslips — October 2026"; header actions: search INPUT
  (`flex h-9 rounded-md border border-input` 160px) + 2 buttons.
- **R11-J assetmanagement** — REF search input (`relative max-w-sm`) +
  border-b card header + empty rows `py-12` (systemic).
- **R11-K recruitment** — tab spacing (gap-1 pill group) + the jobs tab
  renders the toolbar+table recipe (the clone's functional card grid
  stays as the documented superset; align the tab pill + table empty row).
- **R11-L training** — 4px y-offset on the empty card interior
  (documented sub-pixel; verify only).
- **R11-M organogram** — spacing residuals (verify only).
- **R11-N evaluations** — centered equal-width tabs: tablist
  `h-9 items-center justify-center rounded-lg p-1 text-muted-foreground
  bg-white border border-slate-200 grid w-full max-w-lg mx-auto
  grid-cols-3` (512×36) with triggers 167px each (12px icons, 24px
  height); stat row = 4× 74px cards `p-4 flex items-center gap-3` with
  value-in-tile (`w-10 h-10 rounded-xl bg-slate-100` tile, SPAN
  `text-lg font-bold text-slate-700` value inside; label SPAN
  `text-sm text-slate-600` right); row header `flex justify-between
  items-center` (h3 `font-semibold text-slate-800 flex items-center
  gap-2` + h-8 button 125px); empty state `text-center py-10
  text-slate-400 bg-white rounded-xl border border-slate-200` single line.
- **R11-O employees** — at 0 employees the reference renders NOTHING
  below the filter row (no table, no empty state). Gate the clone's
  table/empty-state on employees.length > 0.
- **R11-P communications** — channel cards: `rounded-xl border bg-card
  text-card-foreground shadow border-slate-200 hover:shadow-lg
  transition-all?` with `p-8 text-center` interior: iconChip
  `w-16 h-16 bg-{color}-100 rounded-full mx-auto mb-4` (32px icon) + h3
  `font-semibold text-slate-900 mb-2` (24px, NOT text-lg) + P `text-sm
  text-slate-600` — NO buttons in the cards.
- **R11-Q settings** — tab pill recipe + card header + field tiles
  (verify + align residuals).
- **R11-R analyticsdashboard** — full restructure to the reference's
  stacked layout:
  - header: H1 `text-3xl font-bold text-slate-900` (36px, NO kicker) +
    P `text-slate-500 mt-1`; actions `flex items-center gap-3`:
    date-range button `flex h-9 items-center justify-between
    whitespace-nowrap rounded-md border border-input` (144px) + 2 buttons
  - stat row: `grid grid-cols-2 md:grid-cols-4 gap-4` — 166px compact
    cards
  - chart stack `space-y-6`:
    1. "Hiring Trend — New Employees per Month" FULL-WIDTH 1120×358,
       CardHeader p-6 (title+desc) + `p-6 pt-0`, AREA chart 260px
    2. `grid md:grid-cols-2 gap-6` — "Attendance vs Leave Trend" +
       "Monthly Expense Trend (SAR)" 548×338, charts 240px (bar/line)
    3. `grid md:grid-cols-3 gap-6` — "Employees by Department" +
       "Employment Types" + "Leave Types Distribution" 357×318, pies 220px
    4. "Employee Status Breakdown" FULL-WIDTH 1120×178 + Export button
       in header; content `p-6 pt-0` > `flex flex-wrap gap-3` status
       chips ("0 active" / "0 on leave" / "0 suspended" / "0
       terminated" / "0 resigned")
- **R11-S securitysettings** — `max-w-4xl mx-auto space-y-8` wrapper;
  alert card `border-2 border-orange-500 bg-orange-50` `p-6` with
  `flex items-center gap-4` (48px icon + title/desc); main card
  CardHeader border-b + `p-6` content > `space-y-6` rows `flex
  items-center justify-between p-4 bg-slate-50 rounded-lg` (56px each) +
  footer `flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200`
  (h-9 button); second card `p-6` > `space-y-3 text-sm text-slate-600`
  compact recommendations.
- **R11-T surveyanalytics** — stat row 146px compact (with icons);
  charts: "Sentiment Distribution" 240 + "Sentiment Trend Over Time" 240
  + "Response Count & Avg Sentiment by Survey" 260.
- **R11-U remaining chart pages** — hrreports: chart "Employees by
  status" plot 320px (+ stat row 90px mini-centered, data table);
  attendancedashboard: 2× 260px charts + 146px compact stats;
  advancedanalytics: 3× 300px charts ("Headcount Trend", "Department
  Distribution", "Payroll Trend (Last 6 Months)") + 170px standard
  stats.
- **companywall feed wrapper (R11-B companion)** — the feed column is a
  `space-y-6` stack (posts as siblings), not a single wrapping card.

## Execution plan (TDD)

1. RED pins in tests/unit/recipes.test.ts (new session-12 describe
   blocks): footer recipe, EmptyState conditional margin + iconChip,
   systemic table th/empty-row, documenttracker chips + bare empty,
   expenses/leavemanagement/allleaverequests DIV-title border-b headers,
   payroll/payrollmodule search toolbar + header, assetmanagement search,
   evaluations tablist/stat/empty recipes, employees zero-render,
   communications channel cards, analyticsdashboard stack + status
   chips, securitysettings rows, chart-page heights (surveyanalytics/
   hrreports/attendancedashboard/advancedanalytics), templates iconChip,
   companywall space-y-6 feed.
2. GREEN: shared components first (sidebar footer, EmptyState, table,
   StatCard), then the per-page sweep.
3. Gates: lint → typecheck → unit → build → E2E (86; update the span→div
   avatar assertions if the footer avatar changes tag).
4. Live dual-browser re-verification of every fixed surface + full-route
   sweep + mobile-nav regression (drawer footer included).
5. Data-injected re-check is NOT repeated (performed during the audit;
   clone's CRUD surfaces verified production-grade; DB restored to
   pristine: users=1, employees=1, leaveBalances=2).

## Documented non-goals / supersets kept

- Reference's own bugs kept out: kanban page overflow, attendance
  docW 1558, templates' dead P mb-4 is HONORED via the iconChip+CTA
  recipe (the clone's CTA is the documented superset).
- 247/248 sidebar sub-pixel rounding and the ≤4px y-fitting offsets on
  fitting-superset pages remain documented acceptable.
- The clone keeps functional supersets: expenses page-header CTA (REF
  parity), templates CTA, recruitment card grid, fitting internal
  scrolls.
