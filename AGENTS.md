# AGENTS.md — Eon HR

High-signal operating notes for AI coding agents working in this repo. Read
`CLAUDE.md` for the full development constitution and
`Project_Architecture_Document.md` for architecture rationale.

## Commands

| Task | Command |
|---|---|
| Install | `bun install` |
| Dev server | `bun run dev` (port 3000) |
| Lint | `bun run lint` |
| Typecheck | `bun run typecheck` |
| Unit tests | `bun run test` (Vitest, 789 specs) |
| E2E tests | `bun run test:e2e` (Playwright, 252 specs — needs `bun run build` first; the runner does NOT build for you) |
| Production build | `bun run build` (standalone output at `.next/standalone/`) |
| Push schema | `bun run db:push` |
| Seed | `bun run db:seed` |
| Single unit test | `bunx vitest run tests/unit/auth.test.ts` |
| Single E2E spec | `bunx playwright test tests/e2e/mobile-navigation.spec.ts` |

**Gate order before any commit**: `lint → typecheck → test → build`. E2E is
the pre-push gate (`docs/how-to-git-push-using-ssh-wrapper_SKILL.md` rule 2).

## Database path — the one rule you cannot break

`DATABASE_URL="file:../db/custom.db"` in `.env` resolves **against
`prisma/schema.prisma`** — not the CWD — for BOTH the Prisma CLI and the
runtime. The runtime rule is implemented in `src/lib/db-path.ts` and pinned
by `tests/db-path.test.ts` (15 specs, including the Next standalone
`process.chdir` trap). The database therefore always lives at
`<repo>/db/custom.db`. NEVER "fix" a path by making it CWD-relative or
absolute; if a tool sees a different file, an exported `DATABASE_URL` env var
is overriding `.env` — unset it first (`unset DATABASE_URL`).

**Never manually edit `package.json`** — add dependencies with `bun add`.

## Environment

- `.env` is gitignored; copy `.env.example`. `AUTH_SECRET` must be ≥16 chars
  and is REQUIRED in production — enforced at boot by
  `src/instrumentation.ts` (`register()` → `assertProductionSecret()`); the
  standalone server refuses to serve (instrumentation error, HTTP 500)
  without it. Pinned by `tests/unit/auth.test.ts`.
- An exported `DATABASE_URL` in your shell silently overrides `.env` for the
  Prisma CLI — always `unset DATABASE_URL` before `db:push`/`db:seed` if the
  db file lands in the wrong place.

## Tailwind CSS 4 — read the trap log first

`docs/Tailwind-V4-Validation-Report.md` (appendix "Project Trap Log") pins
six v3→v4 engine differences already fixed in `src/app/globals.css`:

1. Theme vars must be full `hsl()`/hex values — bare triplets under
   `@theme inline` resolve to transparent.
2. The v3-era palette is pinned in `@theme` (v4's oklch defaults drift
   1–3 sRGB units per channel).
3. Parity-critical gradients use `bg-[linear-gradient(...)]` (v4 interpolates
   `bg-gradient-to-*` in oklab) — including the shell canvas, the per-page
   canvases, and every CTA gradient (session 6: per-page colors — payroll
   green→emerald, attendance blue→cyan, compliance red→orange, chat purple,
   templates indigo, workflows pink).
4. **No `mt-*`/`mb-*` utilities on children of `space-y-*`/`space-x-*`
   containers** — v3's selector specificity overrides them, v4's `:where()`
   wrapper does not. Use flex `gap` layouts instead.
5. `--shadow-sm` is pinned to v3 geometry; v4 shifted the whole shadow scale
   one notch.
6. v4's `space-y-*` selector flipped (margin-block-end on `:not(:last-child)`
   vs v3's margin-top on `* + *`) — a `display:none` FIRST sibling no longer
   offsets the second child; restore the v3 offset with an explicit `mt-*`
   on the second child (see the dashboard welcome row).

Also: CSS comments containing `*/` sequences (e.g. `mt-*/mb-*` inside a
comment) terminate the comment and corrupt `@theme` — write "margin-top"
instead. `next.config.ts` sets `allowedDevOrigins` because Next 16's
dev-origin protection silently blocks chunks for 127.0.0.1 and the sandbox
preview host.

## Conventions

- **API envelope**: every route handler returns
  `{ ok: true, data } | { ok: false, error: { code, message, fieldErrors? } }`
  via `src/lib/api.ts` helpers (`ok`, `err`, `guard`, `requireUser`,
  `requireRole`, `parseBody`). Nothing throws across the boundary.
- **Money**: integer minor units (1 SAR = 100 halalas) end to end. Convert at
  form boundaries (`Math.round(Number(v) * 100)`), display with
  `formatSar()`. Floats never touch money.
- **Validation**: Zod at every boundary; schemas in `src/lib/validation.ts`
  or co-located in the route file.
- **Auth**: HMAC cookie sessions (`src/lib/auth.ts`); pages under
  `src/app/(app)/` are guarded by its `layout.tsx`. Role gates:
  `requireRole(["admin", "hr"])` for admin mutations.
- **Pages**: `"use client"` pages fetch `/api/*`; analytics pages are server
  components querying `db` directly with a `"use client"` chart component
  sibling (Recharts needs plain serializable props — no `Date` objects
  across the boundary).
- **Prisma JSON fields** (tasks, conditions, participants…): parse with
  `try { JSON.parse(x || "[]") } catch { [] }` — never trust the shape.
- **Rate limiter**: login allows 10 attempts/IP/15 min (in-memory map in the
  login route). Keep total real logins per E2E run under that budget — the
  auth setup project signs in ONCE and reuses storageState.

## Testing quirks

- Playwright needs `bun .next/standalone/server.js` to exist → run
  `bun run build` before `test:e2e` after changing code.
- E2E uses an isolated `db/e2e.db` (global-setup pushes + seeds it); the dev
  server's `db/custom.db` is never touched by tests.
- Browser binaries: `bunx playwright install chromium` once.
- Strict-mode locators: scope headings with `exact: true` when a page
  contains both a title and a "All {Title}" card heading.

## Responsive boundary — md (768px), not lg (session 7)

The reference switches between mobile chrome (top bar + drawer + bottom
tabs) and the desktop sidebar at **md (768px)** — verified by viewport
sweep at 700/767/768/800/900/1024 on both apps. The shell classes are
`hidden md:flex` (sidebar) and `md:hidden` (all mobile chrome); never
re-introduce `lg:` chrome classes.

## Mobile page kickers (session 7; re-pinned session 9)

Seven "category A" routes render the reference's mobile kicker (`md:hidden
bg-white border-b border-slate-200 px-4 py-3`, h1 18px/700) and hide
their desktop PageHeader below md via `mobileKicker` +
`mobileHeader="hidden"` props: employees, payroll, taskmanager,
leavemanagement, expenses, loans (+ profile: kicker only, header stays).
The other ~35 routes render their full header at mobile (reference
behavior). Pinned by `tests/unit/shell-recipes.test.ts` + E2E.
**Session 9 (R8-G): the kicker is a STATIC bar** — the redeployed
reference's `sticky top-0` sits inside a non-scrolling wrapper stack, so
the bar scrolls away with the content (only the 73px top bar stays
pinned). Do not re-add `sticky top-[73px]`.

## PageHeader contract (sessions 5–11)

Six badge recipes (raised-48/raised-36/flat36/flat36-sm/flat48/flat-tight)
pin badge/h1/subtitle positions; **the raised mt-8 offset lives on the ROW**
(`recipe.row`), badge pages only, so `sm:items-center` lands the actions
cluster on the h1 row like the reference (taskmanager y=116, employees
y=46). **Session 11 (R10-E): the reference has TWO action-alignment
patterns** — items-center (h1 row: taskmanager, payroll, expenses,
leavemanagement, employees) and **items-start (badge row)** for
offboarding, compliancedashboard, allleaverequests, workflowautomation
(y=32), loans (y=64, raised), advancedanalytics (y=32); those six pages
pass `actionsStart`. Actions cluster is `gap-3`. Four pages
(training, evaluations, companywall, organogram) pass `centered` for the
reference's text-center headers — **session 10 (R9-A): `centered` also adds
`flex-1`** so the title block fills the row and the text centers at the
content center (848 at 1440); a shrink-to-fit flex child centers at its
own content width instead (off by 152–327px). Five small pages
(recruitmentkanban, hrreports, staffrequests, notificationpreferences,
workflowconfigpage) use `size="md"` (24px h1). The per-page matrix is
pinned by `tests/unit/recipes.test.ts`.

**Session 11 (R10-F..I): four headers are action-free on the reference** —
hrletters, surveys, announcements and payrollengine render NO header
button; their create/generate affordances live in content furniture (the
loans-recipe empty-state CTA, the grid's empty-state cell, a CTA below
the bare slate-400 line, and payrollengine's toolbar card with Month +
Department + the flat emerald-600 Generate Payroll button).

## StatCard variant map (session 10, R9-D)

The reference renders EIGHT per-page stat-card variants — the session-6
"one recipe" was a 2-page generalization. `StatCard` takes `variant=`:

| Variant | Geometry | Pages |
|---|---|---|
| standard (default) | p-6, 48px tile, 30px value, 170h, `gap-6 md:grid-cols-4` | payroll, advancedanalytics, expenses, surveys |
| compact | p-5, 40px tile, 24px value, 146h, `grid-cols-2 md:4 gap-4` | recruitment, compliancedashboard, assetmanagement, attendancedashboard, surveyanalytics, analyticsdashboard (+hint) |
| compact-s | compact with 20px value, 142h | payrollmodule |
| mini | p-4, no tile, 24px value, 82h, **border-0 + shadow-sm, xs slate-500 label, per-card colored value** (session 11) | shiftcalendar |
| mini-centered | p-4 text-center, no tile, 30px value, 86-90h | hrreports, notificationpreferences (3-col + Mark All Read card) |
| horizontal | p-4 flex gap-3, 44px tile left, 24px value, 80h | documenttracker |
| no-tile | p-6, 30px value, 110h | performancemanagement (md:4), workflowautomation (md:3) |
| tile-right | p-6, 48px tile right-aligned, 30px value, 138h | analytics |

/templates and /evaluations render NO stat row (the reference has none).
Button icons in parity contexts carry `mr-2` on top of the button's
gap-2 (the reference's 16px effective icon-text gap — measured again on
the attendance cluster).

## Attendance header + toolbar (session 10, R9-E)

Seven header buttons in the reference's exact sizes: Print/PDF/Excel at
h-8/12px outline; Devices (teal-700 text), Settings, Dashboard
(blue-700 text) at h-9/14px outline; Import Attendance as the cyan
gradient CTA. The reference squeezes its title to a 312px two-line wrap
and lets the PAGE overflow (docW 1558 at 1440 — its own bug); the clone
keeps the title on one line and wraps the cluster to a second row
(`sm:flex-wrap`) — the documented fitting superset, same category as the
stat-row fitting. A Report Type toolbar card (label + three-option
select: All Staff Report / Individual Employee / Department Report)
sits between the header and the stats and drives the stat row's scope.
The session-5 `leading-[2]` title quirk is GONE from the redeployed
reference — never re-add it.

## Session-11 recipe layer (parity round 10)

- **Toast viewport (R10-D)**: `fixed top-0 z-[100] flex max-h-screen w-full
  flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto` + 420px max
  width — the reference renders it even when empty; the toast CARD
  interior is unmeasurable (the reference never fires one).
- **Companywall composer (R10-C)**: CardContent p-6 > `flex items-start
  gap-4` row (40px sRGB-gradient avatar, 16px initials) + `flex-1
  space-y-4` column (textarea rows=3, `space-y-3` label group with a
  `block leading-5` label, justify-between action row). Photo/Video are
  GHOST buttons (borderless, 90px); every icon carries mr-2.
- **Shiftcalendar (R10-J)**: standalone `flex flex-wrap items-center gap-4`
  toolbar (36px chevrons + `font-semibold text-slate-800 min-w-36
  text-center` month label + All Departments w-48 select) between the
  header and stats; the calendar is a `w-full border-collapse text-xs`
  TABLE (th py-3 px-2; cells `border border-slate-100 align-top p-1
  min-h-[80px]` with the day number `text-slate-400 mb-1` and the
  slate-300 `assign` affordance); the summary card header is
  `border-slate-100`.
- **Recruitmentkanban (R10-K)**: full-width page (`p-4 md:p-8`, no
  max-w) — header (Add Applicant only) > `flex flex-col sm:flex-row
  gap-3` filter row (search flex-1 + All Jobs w-48) > board `flex gap-4
  overflow-x-auto pb-4` with five `w-64 shrink-0` columns
  (`rounded-lg border-2 bg-slate-100 border-slate-300` p-3.5, h3
  text-sm slate-700 + count badge, `min-h-32` drop zone). The reference's
  own page overflows horizontally (docW 1664 at 1440) — the clone keeps
  the fitting internal scroll (documented superset, attendance category).
- **Reports selector (R10-L)**: a WHITE bordered wrapping pill
  (`inline-flex items-center justify-center rounded-lg p-1 bg-white
  border border-slate-200 flex-wrap h-auto`), rows centered with no row
  gap; every chip carries a 16px icon (gap-2).
- **Profile identity card (R10-M)**: `flex items-center gap-6` — 96px
  sRGB-gradient circle with the 64px circle-user icon (NOT initials), h2
  text-2xl name, email mb-3, the Change Photo button below the email,
  role badge (blue-50/700) pinned right.
- **EmptyState icon mb-4 (R10 follow-up)**: the reference's empty-state
  icons carry mb-4 (icon bottom → h3 = 16px, re-measured on payroll AND
  loans) — the component's icon wrapper gained it (every empty state had
  been 16px short).
- **CardTitle two recipes**: border-b CardHeader titles render
  `leading-none` (16px box — hrletters/leavemanagement/expenses pattern);
  regular in-card titles (dashboard) keep `text-base` (24px). Clone call
  sites in border-b headers pass `className="leading-none"`.
- **hrletters/surveys/announcements/payrollengine (R10-F..I)**: headers
  action-free; empty states per the reference (hrletters icon/h3/p at the
  measured y's + the loans-recipe CTA superset; announcements bare
  `py-16 text-slate-400` line + small CTA; payrollengine border-0 toolbar
  card + p-6 py-20 rest card with the 56px icon).

## Session-12 recipe layer (parity round 11)

- **Sidebar footer (R11-A)**: `div.flex.flex-col.gap-2.border-t.border-slate-200
  .dark:border-slate-800.p-4` (255×121) — a LEFT-ALIGNED cluster, never
  justify-between. Row 1 `div.flex.items-center.gap-2.mb-2`: Bell + Moon
  ghost `h-9 w-9` (36×36, 16px svg) + عربي outline `h-8 px-3 text-xs
  font-semibold text-slate-700 border-slate-300 min-w-[64px]` (80×32).
  Row 2: user button ghost `h-9 px-4 py-2 w-full justify-start gap-3
  hover:bg-slate-100` with a 36px sRGB-gradient circle avatar (16px
  CircleUser) + `flex-1 min-w-0 text-left` name/email column. Mobile
  drawer footer 255×36@792 (same recipe, documented 1px rounding).
- **EmptyState conditional margin (R11-B)**: the description P carries
  `mb-4` ONLY when an action follows it (expenses: no mb-4; templates:
  mb-4 because its superset CTA follows). The component takes
  `descriptionClassName` per call site; companywall's feed stack is
  `space-y-6`.
- **EmptyState iconChip variant (R11-C)**: templates renders a 64px
  `bg-slate-100 rounded-full` circle with a 32px slate-400 icon inside
  (`iconChip` prop) instead of the bare 64px icon.
- **Systemic table recipe (R11-V)**: reference th = `text-left py-3 px-4
  font-medium text-slate-500` (45px @ 20px text); empty-row td = `py-12
  text-center text-slate-400` colSpan (117px). Lives in `ui/table.tsx`.
- **documenttracker (R11-D)**: horizontal stat row (`grid grid-cols-2
  md:grid-cols-4 gap-4`, tiles `p-4 flex items-center gap-3` + 44px chip
  + `text-2xl` value + `text-xs` label, cards `border-0 shadow-sm`, 80px);
  filter row = search input + 5 lowercase `capitalize` chips (no Tabs);
  bare empty = `p-6 py-16` + 48px icon mb-3 + single P (no h3).
- **expenses/leavemanagement/allleaverequests (R11-E/F/G)**: DIV-title
  `p-6 border-b` card headers (not CardTitle); leavemanagement/allleaverequests
  empties are `p-6` content + `py-12` inner + 64px icon `mx-auto mb-4` +
  single P (no h3, no mb-4).
- **payroll/payrollmodule (R11-H/I)**: standalone search-toolbar card
  (`border-0 shadow-sm` p-4 with a max-w-sm input) + DIV-title records
  header; payrollmodule's empty row uses the systemic table pattern.
  Payroll's empty KEEPS its CTA (re-measured).
- **evaluations (R11-N)**: tablist = `w-full max-w-lg mx-auto grid
  grid-cols-3` (167px equal triggers); the stat row renders INSIDE the
  active tab below the tablist, tiles are value-in-tile (`p-4 text-center`,
  `text-2xl` value over `text-xs` label, 74px); empty = `py-10 text-center
  text-slate-400`.
- **employees zero-render (R11-O)**: at 0 employees the reference renders
  NOTHING below the filter row — no table, no empty state.
- **communications (R11-P)**: channel cards are centered `p-8` with a 64px
  icon + h3 + P and NO button (`gap-6 md:grid-cols-3` grid).
- **analyticsdashboard (R11-R)**: content sits directly in the canvas (NO
  max-w-7xl wrapper); full-width stack = 166px stat row → full-width area
  (260px) → 2-col bar/line (240px) → 3-col pies (220px) → full-width line;
  chart-card titles are `text-base` (24px); all 5 status chips render even
  at zero counts.
- **Chart pages (R11-U)**: hrreports (320px chart + data table card),
  attendancedashboard (260px), advancedanalytics (300px), surveyanalytics
  (24px gap between chart rows) — charts render UNCONDITIONALLY (no data
  gating, no EmptyState fallback); R11-page cards carry
  `border-slate-200` + `shadow`.
- **securitysettings (R11-S)**: plain `p-4 bg-slate-50 rounded-lg` rows
  (switch + label + description inline) + compact recommendation rows;
  the danger-zone alert keeps its p-6 wrapper.

## Session-13 recipe layer (parity round 12)

- **notificationpreferences (R12-A)**: stat tiles are `mini-centered`
  with `labelClassName="text-xs text-slate-500"` (16px line — 86px
  tiles) + per-tile value colors (Unread `text-red-500`, Total
  `text-blue-600`); both card headers are TITLE-ONLY (no CardDescription);
  preference rows are `flex items-center justify-between py-3 border-b
  last:border-0` (61px) with a left `flex items-center gap-3` cluster —
  32×32 icon chip (`p-2 bg-slate-100 rounded-lg`, 16px icon) + text column
  (`p text-sm font-medium text-slate-800` + `p text-xs text-slate-500`);
  the save row is `pt-2 flex justify-end` (44px) with an iconed button
  (Save mr-2, 185×36); the recent-notifications empty is the SIMPLE
  recipe — `text-center py-8 text-slate-400` + 32px icon mb-2 + one
  text-sm P (no EmptyState, no h3).
- **hrreports (R12-B/C/D/G)**: the report-builder toolbar is a GRID
  (`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4`) of BARE field
  divs — the inline `<label class="text-xs text-slate-500 font-medium">`
  + newline whitespace + mt-1 control replicate the reference's 64px
  line-box stacking (do NOT wrap the field in flex — it changes the
  height); the header subtitle is FLUSH under the h1
  (`subtitleClassName="mt-0 text-slate-500"` — 52px title block) unlike
  the other md-size pages; the actions cluster is `flex gap-2` with
  mr-2 iconed buttons (145/144px); stat values carry per-tile colors
  (blue-600 / orange-500 / purple-600) with `text-slate-500` labels; the
  data-table container keeps the card's horizontal padding (`p-6 pt-0`,
  no full-bleed px-0).
- **analytics (R12-E)** — distinct from analyticsdashboard: STACKED stat
  tiles (`tile-right` variant — label text-sm slate-500 on TOP, value
  text-3xl bold mt-2, hint text-xs slate-500 mt-2, 48×48 tile top-right,
  138px cards) in `grid md:grid-cols-4 gap-6`; chart cards carry
  border-b headers (`p-6 border-b border-slate-200`, DIV title
  `font-semibold leading-none tracking-tight`, no description) + `p-6`
  content with 300px charts in `grid lg:grid-cols-2 gap-6` (548px
  tiles); the Onboarding Summary is `grid md:grid-cols-3 gap-8` of plain
  text stacks (label `text-sm text-slate-500 mb-2` + value `text-2xl
  font-bold` in slate-900/green-600/indigo-600 — no icons, no borders);
  charts render UNCONDITIONALLY (no EmptyState gating).
- **staffrequests (R12-F)**: the `My Requests (N)` trigger is `px-3 py-1`
  (137px inside the 145px pill) — NOT `h-7 px-4` (145px); the pill carries
  no self-start.
- **PageHeader prop additions (R12-D)**: `subtitleClassName` and
  `actionsClassName` allow per-page overrides; the DEFAULTS are unchanged
  (mt-1 subtitle, gap-3 cluster).
- **StatCard prop additions (R12-A/G/E)**: `labelClassName` (per-page
  label size/color override); `tile-right` now renders the stacked
  recipe and its own hint (the generic hint is skipped for tile-right).

## Session-14 recipe layer (parity round 13)

- **Iconed-button margins (R13-A, systemic)**: the reference's iconed
  buttons carry `mr-2` on the svg ON TOP of the button's `gap-2` (16px
  effective icon-text gap) — or `mr-1` (4px) on some in-card buttons.
  Pinned call sites: employees Import CSV (145), payroll Reports & Export
  (185), payrollmodule Generate All (153), taskmanager New Project/Kanban/
  Projects (149/117/121), attendancedashboard Export Report (163) +
  in-card Export (93, mr-1), documenttracker Run Alert Check (178),
  surveyanalytics Run AI Analysis (171), analyticsdashboard Export CSV/PDF
  (145/144), advancedanalytics Schedule Report (179 — the DEFAULT gradient
  variant, not outline), compliancedashboard Notify All x3 (166/173/173,
  mr-1). The attendance cluster (R9) and hrreports exports (R12) already
  carried it.
- **Tab pills — two recipes**: `bg-muted` (staffrequests, the shadcn
  default) vs `bg-white border border-slate-200` (evaluations since R11;
  NOW ALSO settings 971px, profile 507px, attendance 471px,
  compliancedashboard 331px). The white pills are the DEFAULT
  shrink-wrapped TabsList (never stretch full-width). Tab roots use
  `space-y-6` with every TabsContent `mt-0` — the default `mt-2` STACKS
  with the pill's 24px margin (inline-flex margins don't collapse).
- **Tab trigger icon recipes (measured)**: settings/profile triggers =
  16px svg with `mr-2` (h-4 w-4 mr-2, no gap); attendance = `gap-2`
  trigger class, 16px svg, no margin; compliancedashboard = `gap-1`,
  12px svg (h-3 w-3). Lucide icons default to 24px — every tab icon needs
  an explicit size class.
- **Field recipes (line-box stacking — the R12-B lesson generalized)**:
  the reference's form fields are BARE divs (`space-y-2`) with an INLINE
  label (text-sm leading-none) + the control carrying `mt-2` (profile 68px
  fields, payrollengine 64px with `leading-5` on the wrapper, reports
  filters 68px). Do NOT wrap fields in flex or use pt-*/space-y-3 — the
  inline label's line box provides the top offset.
- **settings (R13-B)**: 7 iconed tabs (Building2/Workflow/Clock/Users/
  Plug/Palette/FileText); Company card = border-b CardHeader
  (`flex flex-col space-y-1.5`, title-only `font-semibold leading-none`)
  with the iconed h-9 Edit in a `flex justify-between` row + `p-6`
  content > space-y-6 > `grid md:grid-cols-2 gap-6` of read-only p-4
  tiles (label `text-sm text-slate-500 mb-1` + value `font-medium`);
  631px card.
- **profile (R13-C)**: exactly 4 iconed tabs (User/Lock/Globe/
  SlidersHorizontal, default "general" — no User tab); General tab =
  border-b DIV-title header + p-6 form (space-y-6: `grid md:grid-cols-2
  gap-6` of 68px fields + `flex justify-end` Save Changes iconed 164x36
  INSIDE the form — no CardFooter); identity h2 keeps no truncate.
- **attendance stat tabs (R13-D)**: Mark Attendance / Employee Summary /
  Records (the first tab is NOT Dashboard); non-admins render the
  access-restricted recipe (`flex flex-col items-center justify-center
  py-16`, 64px `bg-red-100 rounded-full` chip + 32px icon,
  `H3.text-lg font-semibold mb-2`, `P.text-slate-500 max-w-sm`); the
  admin form stays the superset.
- **compliancedashboard (R13-E)**: header Run Compliance Scan is
  TEXT-ONLY (184px); the tab content stack = mini-centered 90px stat row
  (Expiring <=7/15/30 + Expired) + notify row (`flex flex-wrap gap-2`,
  mr-1 icons) + toolbar (`flex flex-wrap gap-3 p-4`: bare 16px search
  svg + w-48 input + two w-36 selects + `ml-auto` "N at-risk documents")
  + table card (title-only p-3 header + `p-0` content + the systemic
  180px py-12 empty).
- **reports (R13-F)**: each category tab = ONE card: border-b CardHeader
  with a 20px-iconed `font-semibold leading-none` title + p-6 content
  wrapping `grid md:grid-cols-2 lg:grid-cols-3 gap-4` of 346x126 tiles
  (p-4, two-line H3 `text-slate-900 mb-3`, `flex gap-2` of two flex-1
  iconed 152x32 CSV/PDF buttons); Report Filters card below (title-only
  header + `grid md:grid-cols-4` of Date From/To/Department/Status).
- **offboarding (R13-G)**: content in `grid md:grid-cols-2
  lg:grid-cols-3`; the empty state is ONE `col-span-full` card (238px,
  icon + h3 + P — NO CTA; the affordance is the header button).
- **surveys zero-render (R13)**: at 0 surveys the reference renders
  NOTHING below the stat row (the employees zero-render pattern) — the
  empty card + New Survey CTA were removed.
- **Selects (R13-H)**: surveyanalytics All Surveys w-48 (192) + Export
  `size="sm"` h-8 (97x32, iconed mr-2); analyticsdashboard range w-36
  (144); attendancedashboard department w-44 (176).
- **StatCard no-tile variant (R13-I)**: `flex items-center justify-between`
  row — text stack left (value `text-3xl font-bold mb-1`) + bare 40x40
  icon right (per-page blue/green/orange/purple-500 text colors);
  108px cards (performancemanagement md:4, workflowautomation md:3).
- **taskmanager (R13-J)**: every board column renders its (possibly
  empty) `space-y-2` list container (empty columns 60px, not 48px); the
  count badge is a DIV.
- **payrollengine (R13-K)**: toolbar field wrappers `space-y-2 leading-5`
  + `mt-2` controls (64px fields, 132px card).
- **shiftcalendar (R13-L)**: the chevrons + month label ride their own
  `gap-2` cluster (232px) inside the gap-4 toolbar; Shift Swaps renders
  as an ANCHOR (`asChild` + href="/ShiftSwap" — the reference's casing
  quirk) opening the clone's superset dialog; employees view toggles
  render Grid first (42px), List second (40px, active).
- **hrreports (R13-L)**: the Group By select defaults to an EMPTY
  trigger (`useState("")` + `SelectValue placeholder=""`); Status Filter
  shows "All".

## Session-15 recipe layer (parity round 14)

- **recruitment (R14-A)**: the tab pill is the WHITE shrink-wrap recipe
  (`bg-white border border-slate-200`, 439px) — NOT `bg-secondary`; the
  first two triggers carry 12px lucide icons with `gap-1` (Users on
  Applicants & Ranking 190, Sparkles on AI CV Upload 131 — the compliance
  trigger recipe); Job Postings stays icon-less (108).
- **training (R14-B)**: the category chip row is `role="group"` (a
  tablist whose children are aria-pressed toggles is invalid ARIA — REF
  renders a plain div); the Training Platforms h2 row renders EMPTY
  (32px — REF has NO create affordance anywhere on the page); the clone's
  superset CTA lives BELOW the empty-state line (loans-recipe) and the
  with-data grid carries a trailing dashed Add Platform tile.
- **performancemanagement (R14-C)**: the tab pill is the white recipe
  (296px).
- **staffrequests (R14-D)**: the My Requests pill sits in a PLAIN BLOCK
  wrapper — NEVER a `flex flex-col` child (cross-axis stretch blows the
  inline-flex pill to 1120px and centers the trigger at x=779; REF: pill
  145px@288, trigger 137px@292). Prior rounds compared w×h only — always
  pin X too.
- **profile (R14-E)**: the Language/Timezone card renders under
  `TabsContent value="preferences"` (a copy-paste value="general" stacked
  it under the General form and left the preferences tab empty); General
  keeps exactly the 4 reference fields; Change Photo carries
  `type="button"` (no implicit submit).
- **compliancedashboard (R14-F)**: the three Notify All buttons render at
  `size="sm"` (h-8, 32px, text-xs) — 166/173/173 with mr-1 icons.

## Session-16 recipe layer (parity round 15)

- **Tab-pill inactive color (R15-A, systemic)**: the reference's inactive
  tab triggers render its `--muted-foreground` TOKEN **#737373**
  (rgb(115,115,115) — pinned as `--color-neutral-500`); the clone's
  muted-foreground token (#64748B slate-500) is NOT the tab color — the
  session-6 "token never visibly renders" claim was wrong for tab
  surfaces. `ui/tabs.tsx` TabsList + the reports selector + the
  staffrequests pill all carry `text-neutral-500`; the muted-foreground
  TOKEN itself stays #64748b (300+ usages render REF's explicit slate
  classes).
- **Sidebar footer colors (R15-B)**: Bell ghost = slate-600
  (rgb(71,85,105)), Moon ghost = zinc-700 (#3F3F46 — pinned
  `--color-zinc-700`), user name = zinc-700 (the session-6 slate-900
  reading is stale — REF redeployed). Applies to the desktop sidebar AND
  the mobile drawer footer (same component).
- **Actions cluster fitting (R15-C)**: NO `shrink-0` on the PageHeader
  default actions cluster — a shrink-0 child keeps its natural width
  inside the wrapping header row and overflows at mid viewports
  (attendance docW 1199 at 1100). Shrinking only engages under
  constraint, so fitting pages render identically.
- **organogram (R15-D)**: a BARE centered card (NO CardHeader) inside
  `overflow-x-auto pb-8` > `min-w-max flex justify-center p-8`; the
  empty state is the SIMPLE recipe (64px slate-300 icon mb-4 + ONE
  16px slate-500 line, 783×202 card) — with-data trees ride `p-8`
  inside the same wrapper.
- **staffrequests (R15-E)**: the pill renders `bg-secondary` (#F5F5F5 —
  REF's surface), NOT bg-muted; the default scope is `"mine"` (the
  trigger renders the reference's selected look — white bg + #0A0A0A —
  at load; the toggle-to-all remains the superset).

## Session-17 recipe layer (parity round 16)

- **StatCard tile is FLEX-CENTERED, never padded (R16-D, systemic)**:
  REF's 48×48 tile computes `padding: 0` — `flex h-12 w-12
  items-center justify-center` with the 24px svg centered by flexbox.
  A `p-3` tile has min-content 48 (padding + svg) and CANNOT
  flex-shrink; the flex-centered tile shrinks to the bare svg (24px) at
  constrained card widths — measured byte-exact on /analytics @768
  (tile 24px@749, pad 0, svg 24@749 both sides; LOC docW 797 → 773;
  REF's 768 is its overflow-auto wrapper clamp). compact/horizontal
  tiles were already flex-centered — only standard/tile-right carried
  p-3.
- **workflowautomation zero-render (R16-B)**: at 0 workflows the
  reference renders NOTHING below the stat row (wrapper 306 = header +
  stats only — the employees/surveys pattern); the create affordance is
  the header CTA. The loading spinner stays (transient superset).
- **chat zero states (R16-C)**: sidebar = `div.p-8.text-center` with a
  48px MessageCircle (`mx-auto mb-3 text-slate-300`) + ONE
  `p.text-sm.text-slate-500` line "No conversations yet" (319×144,
  p 255×20); right pane = BARE `flex flex-1 items-center
  justify-center` (NO p-8) wrapping `div.text-center` with an 80px
  MessageCircle (`mx-auto mb-4 text-slate-300`) + h3 + p (156px
  content @340, h3 @436). The list container is a bare `flex-1
  overflow-y-auto` — row padding lives INSIDE the with-data branch.
- **surveys Avg Sentiment zero value (R16-A)**: "0%" (the number stays
  at zero surveys — never a bare "%").
- **employees filter-row fitting (R16-E)**: the search is shrinkable
  under constraint — wrapper `relative flex-1 md:flex-initial` + input
  `w-full md:max-w-64` (256px at 1440, shrinks in the 768–815 band so
  the row fits the 448px content area; docW 796 → 768). REF overflows
  the same row (849 — its own bug); the clone fits (superset).
- **Tablet-band audit lessons**: REF's own overflows at 768 (attendance
  1558, settings 1291, employees 849, payroll/taskmanager/hrreports/
  recruitment/leavemanagement/profile/chat) live in its `flex-1
  overflow-auto` wrapper; pills never wrap (settings/profile = parity);
  the hrreports 900–1024 band is a 1px knife-edge on REF (its title+cluster
  fill the row exactly) where the clone's wrapped cluster shifts the h1
  4px — the documented fitting-superset family.

## Session-18 recipe layer (parity round 17)

- **Header row breakpoint (R17-A, per-page)**: REF's default-family
  header rows switch flex-col → flex-row at **md (768)** (`flex flex-col
  md:flex-row justify-between items-start md:items-center gap-4` — the
  never-swept 640–767 band, first audited this round); the clone's
  PageHeader row switched at sm (640). Nine pages render REF=column
  (title full-width, actions below) vs LOC=row in that band: payrollmodule,
  documenttracker, recruitmentkanban, assetmanagement, attendance,
  recruitment, shiftcalendar, staffrequests, attendancedashboard — they
  pass `rowBreakpoint="md"`. REF is per-page inconsistent:
  templates/workflowconfigpage are UNPREFIXED always-rows (`flex
  items-center justify-between mb-8|mb-6`) and the actionsStart family is
  always-row — those keep the sm default (row at 640–767; column below =
  the fitting superset). attendance's fitting wrap is `md:flex-wrap`
  (follows the row).
- **Profile kicker back button (R17-B)**: REF's /profile kicker is a
  distinct variant — a leading **36×36 ghost ArrowLeft** (`h-9 w-9`, svg
  `w-5 h-5` classes but 16px rendered — the button base's
  `[&_svg]:size-4` wins on BOTH apps) at (32,105) navigating to
  /Dashboard, + a `text-xs text-slate-500 truncate` subtitle
  "Manage your account" (row 44px, kicker 69px vs the standard 53px).
  The other seven kickers carry neither (byte-identical sweep). The
  clone links to the casing-fixed `/dashboard` (documented deviation) and
  adds an aria-label REF lacks (a11y superset). **Lesson: always pin X —
  the h1 y was pinned but its x (32 vs 80) never was.**
- **640–767 band audit lessons**: settle ≥2.2s before reading REF mobile
  geometry (the 61px top-bar mid-hydration artifact also produces 12px
  h1 y-deltas and phantom h=80 "wraps"); REF's hrreports renders BLANK
  below ~768 (only the Base44 badge — its own dead-mobile bug; the
  working clone page is the superset, /employeeselfservice family);
  print stylesheets: ZERO `@media print` rules on either side (the new
  parity dimension audited clean); the documenttracker @390 cluster is a
  0.23px knife-edge (buttons byte-identical at 178.14/168.09; REF's row
  358.23 overflows invisibly and fits one line, the clone's 358.00 wraps
  Add Document — the hrreports knife-edge family).

## Session-19 recipe layer (parity round 18 — the interaction dimension)

The first keyboard/focus-ring audit (real Tab presses, full computed
outline + box-shadow dumps). **Tab traversal ORDER is byte-identical** on
all swept surfaces; the ring recipes were not. REF's focus taxonomy:

- **Buttons (all variants) + Radix select triggers**: `focus-visible:ring-1
  focus-visible:ring-ring` — a 1px #0A0A0A ring, NO offset. The Button
  base and select.tsx carry it (R18-A/F).
- **Sidebar leaf links + group buttons + sub-items**:
  `focus-visible:ring-2 focus-visible:ring-sidebar-ring` — **2px blue-500
  #3B82F6** (REF's `--sidebar-ring` token), NOT the dark global ring.
  Token pinned in globals.css; three call sites in sidebar-nav.tsx
  (R18-C).
- **Tab triggers + switches**: `ring-2 ring-ring ring-offset-2` — 4px
  total (white 2 + dark 2). TabsTrigger gained the offset (R18-G);
  switches already had it.
- **Inputs/Textareas**: `ring-2 ring-ring ring-offset-2` (R18-B) — the
  base offset is 2, never 1.
- **Login page scope** (R18-E): REF redefines `--ring: 240 10% 3.9%`
  (zinc-950 #09090B) locally — the Sign in ring is `ring-[#09090b]`, and
  the email/password inputs carry the page pair `focus:border-slate-400
  focus-visible:ring-slate-400`. **v4 lesson**: the ring-color override
  must use the SAME variant as the base (`focus-visible:`, not `focus:`)
  — tailwind-merge only dedups within a variant, and the bare `focus:`
  utility loses the v4 cascade battle against the base's
  `focus-visible:ring-ring`.
- **The mobile hamburger** (a bare button) carries the button recipe
  (R18-D).
- Bottom tabs / quick-action links / "View all" / login socials render
  the BROWSER-DEFAULT `auto 1px` outline on both apps (no custom classes
  — parity; the rgba-vs-lab serialization of the auto color is the same
  dark 50% in different color spaces).

**Sub-390 band (320–389) swept clean**: settled probes byte-identical on
the fitting pages; every other diff is REF's own overflow family extended
below 390 (attendance 943–1199, settings pill 1003–1259, shiftcalendar
732–988, recruitmentkanban 1376–1632, documenttracker 390–646, payroll
344@320, profile 539) where the clone fits or overflows less. **Settle
lesson: REF needs ≥5s at odd sub-390 widths** (2.4s captured the 61px
mid-hydration state at 344/389).

## Session-20 recipe layer (parity round 19 — the hover dimension)

The first systematic hover/active-state audit (real CDP mouse moves; LOC
probed through the v4 `@media (hover: hover)` polyfill — the probe browser
reports hover:none, so v4 hover variants never apply headless while REF's
v3-era rules do; the asymmetry is probe-only, real desktops match).

- **Sidebar leaf + sub-item hover (R19-A, systemic)**: REF renders
  `hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
  hover:opacity-80` → settled zinc-100 **#F4F4F5** bg + **#18181B** text +
  0.8 opacity. The old `hover:bg-[#e4e6eb]` pin was stale (settled
  re-measure; mid-transition reads at ~750ms show the 0.2s transition in
  flight — settle >= 2s).
- **Active leaf hover text (R19-B)**: text flips to #18181B (REF's
  custom-primary-bg beats its hover bg, so the tile stays blue).
- **Footer ghost buttons (R19-C/C2)**: bell + moon hover `bg-accent
  text-accent-foreground` (#F5F5F5 + #171717); the bell SVG OWNS
  `text-slate-600` (an element's own class beats the parent's hover color —
  the icon stays slate-600 under hover; put colors on the SVG, not the
  button).
- **User name span (R19-D)**: `text-slate-900` rgb(15,23,42) — the R15
  zinc-700 reading measured the BUTTON's inherited color, not the span.
- **Import CSV (R19-F)**: REF's blue-tinted outline — `border-blue-300
  text-blue-700 hover:bg-blue-50` on the outline variant.
- **Dropdown menu items (R19-L)**: BOTH items (incl. Logout) focus in
  `focus:bg-accent focus:text-accent-foreground` — the red Logout text
  turns #171717 on hover (REF-measured; the focus:text beats text-red-600).
- **Login (R19-H/I)**: Sign in carries `shadow-sm`; the forgot link has NO
  hover:underline.
- **Mobile (R19-J/K)**: hamburger inherits foreground (#0A0A0A) + hovers
  bg-slate-100 + accent-foreground; bottom tabs have NO hover classes.
- **Staffrequests (R19-G)**: placeholder `"Search requests..."` — three
  ASCII dots, not U+2026.
- **Probe lessons**: agent-browser eval args are shell-escaped (single-quote
  browser JS; snapshot regexes must allow `[expanded=false, ref=eN]` and
  never end with `\)`); measure the STYLED element (REF's quick chips
  style an inner div of a class-less anchor — the anchor shows no hover).

## Session-21 recipe layer (parity round 20 — the pressed dimension)

The first `:active` (pressed-state) audit (real mouse-down holds via
agent-browser `mouse move/down/up`; the "missing mousedown-hold tooling"
from the session-32 frontier note exists). **Click-safe protocol: move the
pointer away BEFORE `mouse up`** — releasing over the element fires a real
click (the first draft toggled REF's عربي to "EN" and expanded groups
mid-probe). v4 does NOT media-wrap `active:` variants (only `hover:*` rides
in `@media (hover: hover)`) — so active rules apply in the probe browser
and on touch directly.

- **Group button pressed (R20-A)**: REF presses GRAY — its
  active:bg-sidebar-accent + active:text beat its hover:bg-blue-50 in v3
  rule order. The clone's trigger carries
  `active:bg-[#f4f4f5] active:text-[#18181b]`; v4 emits active: AFTER
  hover: in the utilities output, so the pressed state wins on desktops.
- **Expanded group hover (R20-E)**: REF's group button has a SECOND hover
  recipe — `data-[state=open]:hover:bg-sidebar-accent
  data-[state=open]:hover:text-sidebar-accent-foreground` (gray when the
  group is open; blue when collapsed). Found only because a drawer probe
  expanded a group mid-measurement; the r19 audit probed collapsed only.
- **Leaf/sub-item active: pair (R20-C)**: REF authors the active: pair on
  ALL sidebar links; the clone mirrors it on the inactive branches
  (desktop-pressed already matched via hover — the classes restore the
  authored recipe and the TAP-press moment, where :active fires without
  :hover).
- **Active leaf (R20-D — a documented deviation)**: REF's active leaf keeps
  its blue bg under press because its custom-primary-bg is an UNLAYERED
  custom class. The clone's `bg-primary` is a v4 utility — an active:bg
  variant would win specificity ((0,2,0) vs (0,1,0)) and wrongly gray the
  tile — so the clone adds ONLY `active:text-[#18181b]` (REF's measured
  pressed text; bg stays #1877F2).
- **Active bottom tab pill (R20-B — a visible mobile gap every prior round
  missed)**: REF's active mobile bottom tab carries `bg-blue-50`
  (rgb(239,246,255) — pixel-verified; the mobile audits compared label
  color/geometry but never the tab's own background). Pinned in the E2E
  active-tab test.
- **Polyfill v2 (probe tooling)**: the r19 hover polyfill appended a second
  `@layer utilities` block at the END — moving hover rules AFTER active:
  rules and breaking the pressed-state cascade under the probe (on real
  desktops the original order stands). v2 fetches each same-origin sheet,
  brace-matches the `@media (hover: hover)` blocks, splices out the
  wrappers, and REPLACES the `<link>` with a `<style>` at the same DOM
  position — order preserved.
- Everything else presses FLAT on both apps (no active: classes anywhere
  else): CTAs, outline buttons, ghost buttons, menu items (the red Logout
  turns #171717 under press via its focus recipe on both), login surfaces,
  hamburger (rides hover), inactive bottom tabs.

## Session-22 recipe layer (parity round 21 — the motion dimension)

The first transitions/animations audit (static CSSOM enumeration of every
transition/animation/@keyframes rule on both apps + DOM classList audit +
empirical requestAnimationFrame frame-sampling of live transitions).

- **The enter/exit animation family (R21-B, systemic)**: REF animates its
dropdowns, dialogs and select content with the tailwindcss-animate plugin
utilities (`data-[state=open]:animate-in` + `fade-in-0` + `zoom-in-95` →
computed `animation: enter 0.15s ease` — measured on the user menu, the
loans dialog and the attendance select). The clone's shadcn components
carried the exact same classes but v4 generated NO CSS for them (0
animation rules in the built output — plugin utilities don't exist in
CSS-first v4). Fix: a hand-authored `@utility` subset in globals.css
(`@keyframes enter/exit` reading `--tw-enter-*`/`--tw-exit-*` custom
properties + animate-in/out, fade-in/out(-0), zoom-in/out-95,
slide-in-from-left/out-to-left/from-bottom-2). No `initial` custom-property
resets (the v3 plugin's cascade trick — every animated surface here is
portal-mounted, so inheritance can't leak); the select content + sidebar
user dropdown got the missing classes added.
- **The mobile drawer slide (R21-C, the round's visible mobile gap)**: REF
slides the 288px drawer in over 500ms with cubic-bezier(0.32,0.72,0,1)
(vaul), closes over ~300ms, overlay fades ~150ms. The clone's drawer
POPPED instantly — Radix Portal mounts the Content fresh with
data-state=open already set, and a transition needs a state change on a
live element; animations run from mount. Fix: animate-in/out +
slide-in-from-left/out-to-left + `data-[state=open]:[animation-duration:
500ms] data-[state=closed]:[animation-duration:300ms]` + the vaul bezier
via an arbitrary property. Radix waits for animationend before unmounting,
so the close plays too (verified ~305ms slide + ~170ms fade).
- **Group trigger transition (R21-A)**: REF's group buttons carry
`transition-all duration-200` like every nav item; the clone's had
`transition-colors` (150ms). Frame-sampled: REF settles ~269ms, the clone
~229ms; after the fix ~272ms. One-word class change.
- **Chevron snap (R21-D)**: REF's group chevron carries NO transition
classes (computed `all 0s` — the rotate-90 toggles instantly). The clone's
200ms swing was an extra; removed.
- **Toast enter (R21-E, superset polish)**: the toast cards' state-gated
animate class never fired (no data-state attribute on the divs); replaced
with an ungated `animate-in fade-in slide-in-from-bottom-2` (REF's sonner
toasts animate but are unmeasurable — every triggering control is dead
there).
- **Dormant REF CSS (documented non-gaps)**: the sidebar collapse family
(3 ease-linear divs — no trigger at ≥768), accordion-down/up +
data-motion rules (group expand is INSTANT on REF — 728→516 in one
frame), base44-fade-in/scale-in keyframes (no navigation animations fire),
badge-spin, and prefers-reduced-motion (REF's only rule is sonner-library
internal; no app-level recipe exists to mirror — the a11y item stays open
on both apps).
- **Probe lessons**: agent-browser eval does NOT await Promise-based
expressions (run the async work via window globals + follow-up reads);
snapshot refs need attribute-tolerant regexes (`\[[^\]]*ref=`);
`$`-prefixed passwords must be single-quoted in shell fills ($Abcd1234
expands to empty in double quotes); drawer-close needs Escape or a real
pointerdown (the overlay ignores synthetic .click()).

## Session-23 recipe layer (parity round 22 — the scroll dimension)

The first scroll audit (static CSSOM enumeration of every scroll-relevant
rule on both apps with @layer-aware walking + live DOM census + empirical
scrolling + a full 46-route docH sweep).

- **NO scrollbar styling ANYWHERE (R22-A, systemic)**: REF authors zero
  scrollbar rules (computed `auto` on every scroll container — the sidebar
  nav scrolls live at 872>690 on expanded-group pages). The clone's
  session-1 `.scrollbar-thin` class (6px slate-300 thumb) was deleted from
  globals.css + the sidebar nav + the dialog content. A dead
  `.scrollbar-thin` rule may still appear in the BUILT css — v4 generates
  core utilities from scanner hits on comments/test literals (the same
  registry-noise family as `.scroll-mt-24`); no element carries the class.
- **The v4 trailing space-y margin (R22-B — trap 6's sibling)**: v4's
  `space-y-*` emits `margin-block-end` on `:not(:last-child)` — the ACTIVE
  TabsContent followed only by display:none Radix siblings kept mb-24,
  leaving 24px dead space below tab cards (measured /settings docH 943 vs
  REF 919; compliance stack 572 vs 551). REF's v3 (margin-top on `* + *`)
  never trails. Fix: `mb-0!` on the TabsContent base in `ui/tabs.tsx`
  (the pill's own mb-24 keeps the pill→card gap). The four `space-y-6`
  tab roots (settings, attendance, compliancedashboard, profile) are
  covered; `reports-browser.tsx` already used `flex flex-col gap-6` (gap
  ignores display:none children — the alternative pattern).
- **The loans dialog — the REF recipe (R22-C)**: 672px (`max-w-2xl`),
  H2-only header (NO description), `space-y-2` field rows, the
  always-rendered Requesting-for card (`p-4 bg-blue-50 rounded-lg` >
  `flex items-center gap-3 mb-3` > 20px user icon + the 2-line stack
  text-sm slate-600 / font-semibold slate-900, "Select employee"
  placeholder), the `grid grid-cols-2 gap-4` of Loan Type (Standard /
  Emergency / Salary Advance / Personal) + Amount (SAR) + Duration
  (Months) + the read-only Monthly Installment (`p-2.5 bg-slate-100
  border border-slate-200 rounded-md text-center` — "SAR 0.00",
  prefix + 2 decimals, NOT formatSar's suffix form), Reason
  (`min-h-[60px]`), Paid From, and `flex justify-end gap-3` actions
  (Cancel + Submit Request). Schema: Loan gained `loanType` + `paidFrom`;
  the loans table gained the Type column (REF's table unmeasurable —
  zero-data). The dialog's `max-h-[85vh]` + `oy-auto` stay as the fitting
  superset (REF's un-capped dialog clips on short viewports — its own
  family).
- **Two per-page table recipes (R22-E/F)**: hrreports th = `px-3 py-2
  text-left text-xs font-semibold text-slate-600 uppercase` (33px) with
  LOWERCASE DOM texts uppercased by CSS; at 0 records the table renders
  the HEADER ROW ONLY (no empty state — card 139px). attendancedashboard
  th = `text-left py-2 px-3 text-slate-500 font-medium` (37px, ALL six
  columns left-aligned); at 0 rows the header-only table + a bare
  `text-center text-slate-400 py-8` P "No employees found for selected
  filter." as the table's SIBLING. The systemic 45px `py-3 px-4` recipe
  (R11-V) still governs the other tables.
- **Compliance monitor tab (R22-D)**: the stat tile order is Expired,
  ≤7, ≤15, ≤30 (Expired FIRST) and the table card title is "At-Risk
  Employees" (not "Document Expiry Monitor").
- **Scroll non-gaps (documented)**: mobile scroll behavior byte-identical
  (pinned top bar, static kicker, same scroll range — empirically
  re-verified); `overscroll-behavior: contain` on body matches (Radix
  RemoveScroll / vaul); nothing authored scroll-behavior/snap/margin on
  either side; zero JS scroll APIs in the clone; REF's fixed sidebar vs
  the clone's sticky = architecture difference with zero visible
  divergence (nav scroll containers byte-exact).
- **docH residuals (knife-edge family)**: compliance toolbar -2 + table
  card -1 (net -3), /advancedanalytics -2, the attendancedashboard -46
  (the clone's seeded data row vs REF's P-empty — unmeasurable-on-REF),
  /attendance -68 (REF's own overflow family), /employeeselfservice
  +310 (REF's dead "Loading your profile..." page — the clone's working
  page is the documented superset).
- **Probe lessons**: ALWAYS restart the :3200 standalone server after a
  rebuild (the running process serves 404s once `.next/standalone` is
  replaced under it); full-sweep docH reads can catch mid-hydration
  states (REF /employees transiently read 1010, settled 900 — re-probe
  before flagging); `agent-browser fill` drives React state where the
  native-setter + input-event trick does not.

## Page architecture (session 6) — where padding and gradients live

The reference paints its canvas per page; `main` is BARE
(`flex-1 flex flex-col pb-20 md:pb-0` — no padding). Every page renders:

```
main
└── page root: min-h-screen bg-[linear-gradient(to_right_bottom,X,Y)] p-4 md:p-8
    └── content wrapper: mx-auto flex w-full max-w-7xl flex-col gap-8
```

Per-page gradient map (measured): payroll green-50→blue-50, payrollmodule
green→emerald, payrollengine emerald→teal, training/communications/
hrassistantchat purple→blue, expenses purple→pink, interviewassistant
purple→indigo, recruitment indigo→blue, allleaverequests/documenttracker
blue→indigo, attendance(+dashboard) blue→cyan, evaluations/hrletters
indigo→purple, compliancedashboard red→orange, organogram teal→green,
surveys teal→cyan, surveyanalytics teal→slate, shiftcalendar violet→indigo,
performancemanagement slate→indigo, workflowautomation slate→purple; the
rest slate→blue; employees/analytics/templates/announcements/
recruitmentkanban/notificationpreferences/hrreports/workflowconfigpage/
staffrequests/dashboard have NO canvas (plain roots, some with p-6 +
narrow max-w — see `docs/remediation-plan-session6.md` §S2). The shell
canvas gradient (slate-50→blue-50, sRGB) lives on the AppShell root div.

Do NOT re-add padding to `main` or move gradients to `body` — both are
reference-measured contracts pinned by tests.

## Add-Employee wizard — an INLINE view, not a modal (session 7)

The reference renders its 4-step wizard as a page-replacing view: back
button (outline ArrowLeft 36×36) + 30px/700 h1 + max-w-4xl card (gradient
blue-50→indigo-50 header with UserPlus, p-8 interior, 48px icon-circle step
rail with green passed-connectors, 96px photo-upload circle on step 1,
border-t footer). The employees page swaps `list | wizard` views; ALL
footer buttons stay `type="button"` (AP-5). Never wrap it in a Dialog
again. Session 8 closed the interior residuals: the card header gradient
is sRGB-pinned `bg-[linear-gradient(to_right,#eff6ff,#eef2ff)]` (trap 3 —
the last unpinned gradient), the advancing CTA carries a trailing
ArrowRight (w-4 h-4 ml-2 — 97px Next), and field rows use the 68px wrapper
recipe (`pt-1` + `leading-4` label → 84px pitch, 872px step-1 card).

## Session-24 layer — parity round 23: the cursor + selection dimension

The never-swept interaction layer (session_38's suggested next step):
computed `cursor` / `user-select` / `caret-color` census on 4 surfaces +
element-level parent-chain walks (Chrome INHERITS user-select, so the
chain pinpoints the authoring element) + a full 46-route user-select
classification + login census via throwaway sessions. REF's stylesheet is
UNREADABLE to CSSOM walking (its rules live behind a cross-origin/blob
sheet — zero hits on a cssText scan that found the computed behavior), so
computed DOM census is the only ground truth on that side.

**R23-A (the button cursor — systemic)**: Tailwind v3's preflight ships
`button { cursor: pointer }`; v4 REMOVED it. Every REF button computes
pointer (group toggles, header chrome, dialogs, login — 100% of measured
buttons, all enabled); every clone button computed default (except
tabs/switch/CTA tiles carrying explicit `cursor-pointer` utilities). Fix:
`@layer base { button { cursor: pointer } }` in globals.css —
utility-layer cursor classes (`disabled:cursor-not-allowed`) keep winning
the v4 cascade, so no existing surface regresses.

**R23-B (the touch-pan-y select-none wrapper)**: REF wraps page content in
`div.touch-pan-y` (computes `user-select: none`) between
`div.relative.overflow-hidden` and the page root — everything inside
inherits none (h1, cards, CTA tiles, table text, INPUTS), while portaled
surfaces (dialogs/dropdowns/drawer) escape to auto. The 46-route sweep
classifies REF: EXACTLY 8 routes are none-wrapped — /dashboard,
/employees, /payroll, /attendance, /leavemanagement, /expenses, /loans,
/taskmanager (the base44 core-module family); the other 37 content routes
compute auto (REF per-page inconsistent — its /settings renders the tabs
directly in the page root with NO touch-pan-y layer). Fix: `select-none`
on exactly those 8 clone page roots (chrome + portals stay auto — the
computed map matches REF on every route; attendance tabs + page inputs +
the Customize button + the CTA tiles all inherit none like REF).

**Non-gaps (measured)**: caret-color rgb(10,10,10) both; ::selection zero
authored rules + identical empirical application; input cursor text/
default per type; link pointer (UA); table cells auto; kanban zero
[draggable] both; dialog buttons auto/pointer (portal escape both);
the moon's self-authored select-none (the clone already matched). Blocked
(zero-data REF): checkbox cursor, [role=option] cursor, disabled-button
cursor (REF renders no disabled button on any measurable surface).

**Pins**: 5 new (tests/unit/recipes.test.ts session-24 block — the base
rule, the 8 roots, and a NEGATIVE scope lock on /settings for the 38 auto
routes). Gates: lint 0/0 · tsc ✓ · 416/416 unit · build ✓ · 86/86 E2E.
Live-verified: 13-20/13-20 buttons pointer per surface, login 6/6, the
8 routes none + 3 auto representatives, attendance tab none, employees
input none, loans dialog portal escape, canonical 12-route geometry
12/12 + mobile top bar 390×73 (zero layout impact).

## Session-25 layer — parity round 24: the a11y-attribute dimension

The never-swept family (session_40's suggested next step): full role +
aria-* + label-wiring census on 4 canonical surfaces (summed), then
element-level dumps of every divergent family + targeted probes (loans
dialog, login via throwaway sessions, the mobile drawer).

**R24-A (the aria-controls contract)**: REF's 9 sidebar group toggles
carry `aria-controls` in BOTH states (its older Radix sets it
unconditionally — radix-:rh: etc. measured on every collapsed group);
the clone's Radix only authors it while the content is mounted. Fix: a
stable `React.useId()` per group passed to BOTH the Collapsible Trigger
(`aria-controls={contentId}`) and Content (`id={contentId}`) — user
props spread AFTER Radix's own in the v1.1.x source, so the override
holds collapsed AND matches the mounted id open. Verified: 8/8 toggles
carry it, all resolving.

**R24-B (the notifications bell popover)**: REF's bell (sidebar footer)
is a Radix Popover trigger — aria-haspopup="dialog" + aria-expanded +
aria-controls (all measured, persisting closed) — opening a 384×175
popover at x=0 y=617 (bg-popover white, rounded-md border shadow-md,
sideOffset 4, 16px LEFT of the bell via alignOffset −16): header
`flex items-center justify-between px-4 py-3 border-b` with
`h3.font-semibold.text-slate-900` "Notifications" (16px/600) + an empty
gap-2 cluster, body `max-h-[480px] overflow-y-auto` → `py-8 text-center
text-slate-500` with `Bell h-8 w-8 mx-auto mb-2 opacity-30` + `p.text-sm`
"No notifications yet" (slate-500). The clone's bell was a DEAD button
(the only measured surface where REF did more). Fix: the shadcn
`ui/popover.tsx` primitive + the exact recipe; the same stable-id trick
keeps aria-controls authored closed. Verified byte-exact: 384×175 @
x=0 y=617, h3 16px/600, p rgb(100,116,139); works from the mobile
drawer too (Radix portals out).

**The census map (4 routes summed)**: roles — tab 7/7, tablist 1/1,
tabpanel 1/1 identical; progressbar ref=0 loc=2 (the leave-balance
Radix Progress — clone superset kept). aria — controls 44/10 (the R24-A
gap family), expanded 41/37, haspopup 9/5 (the R24-B gap family),
selected 7/7, labelledby 1/1, orientation 1/1; clone supersets kept:
aria-label 18 vs 4, aria-current 4 vs 0, aria-hidden 175 vs 0, all
buttons named vs REF's 10 unnamed svg-only (bell/moon/list/grid).
Non-gaps: login a11y byte-identical (labels/for + placeholders +
unnamed=0); the drawer role=dialog contract identical (no aria-modal
both); REF's loans-dialog `aria-describedby` is a DANGLING reference
(broken on REF — the clone's conditional describedby is correct and
stays); REF's 2 base44-branded imgs per route are platform branding,
not replicated.

**Pins**: 4 new (tests/unit/recipes.test.ts session-25 block — the
stable-id contract, the popover primitive + recipe, and a NEGATIVE
scope lock: only the bell gains the popover). Gates: lint 0/0 · tsc ✓ ·
420/420 unit · build ✓ · 86/86 E2E. Live-verified: 8/8 group controls,
the full bell contract (hp/exp/ctrl), the popover byte-exact geometry,
canonical 12-route 12/12 MATCH, mobile chrome unchanged (tabs/drawer
byte-identical).

## Session-26 layer — parity round 25: the SEO/meta dimension

The never-swept family (session_42's suggested next step): full `<head>`
census on the canonical 12 routes + login (title/lang/charset/viewport/
robots/description/og:*/twitter:*/canonical/icon/apple/manifest/
theme-color/JSON-LD), then element-level dumps (the /employees full-tag
dump, the login extras, the JSON-LD contents, REF's manifest.json, and
REF's og:image render geometry).

**REF's mechanical per-route rules**: title = `<slug capitalized> |
Eon HR` (/taskmanager → "Taskmanager | Eon HR" — the route slug, NOT the
human "Tasks & Projects"; dashboard + login = plain "Eon HR" — REF
serves its dashboard at "/"); description = "<Slug> on Eon HR. <base>"
for single-word slugs, plain base for compound slugs (the generator's
humanize fails on compounds); og 6 per app route (title/description/
image/url/type/site_name) + twitter 5 (card/title/description/image —
REF's twitter:url is not a standard Card tag, og:url is the fallback);
canonical per-route absolute; JSON-LD WebSite + Organization on every
route (+BreadcrumbList on login); login adds apple-touch-icon + manifest
+ theme-color #000000 + og:image:width/height/alt.

**The clone's gaps (all fixed)**: title "Eon HR" on EVERY route (the
tab-visible gap), zero og/twitter/canonical/JSON-LD, and NO icon link at
all (public/favicon.svg existed but was never referenced — the tab had
no favicon).

**R25-A (src/lib/meta.ts + 46 per-route layouts)**: `pageMetadata(route)`
implements the mechanical rules; a 5-line server `layout.tsx` in every
(app) route dir exports it (client pages cannot export metadata — the
idiomatic Next 16 pattern; codemod `scripts/r25-codemod-layouts.mjs`).
**R25-B/C (root layout generateMetadata)**: `metadataBase` derived from
`headers()` (x-forwarded-proto + host) so canonical/og:image/og:url
resolve against the ACTUAL serving origin (absolute per-origin,
byte-structural parity, self-consistent on any deployment). og:type +
og:site_name repeat PER-ROUTE in the helper — Next REPLACES the parent
openGraph object with the child's (root defaults alone vanish; verified
live). **R25-D (assets)**: the family generated from
public/eon-logo.png (`scripts/r25-gen-assets.py`): og-image.png 1200×630
(white #FEFEFE canvas, logo content ~1107×429 centered — REF's supabase
/render/image/ composition measured and reproduced), icon-192/512
(square full logo, REF's manifest icons), apple-touch-icon.png 180×180;
public/manifest.json (REF's field set, own copy). **R25-E (JSON-LD)**:
root layout renders WebSite + Organization (origin from headers());
login adds BreadcrumbList (Home → login).

**Documented divergences**: REF's description base copy is leftover
OnboardFlow-template junk ("Streamline your new hire onboarding...") —
the clone keeps its own copy with the same structural prefix rule; REF's
assets are supabase-hosted base44 platform storage — the clone
self-hosts the same-logo family; REF's manifest start_url/scope are
absolute platform URLs — the clone ships the portable relative form;
REF's /dashboard canonical is "/" (serves / directly) — the clone's is
/dashboard (root redirects); REF's og:image:alt is "Base44 link
preview" — the clone uses "Eon HR"; viewport serializes "1" not "1.0"
(Next default — semantically identical).

**Pins**: 12 new (tests/unit/recipes.test.ts session-26 block — the
mechanical title/description rules BEHAVIORALLY (module import), the
og/twitter/canonical fields, the root-layout metadataBase/JSON-LD, the
login distribution, the 46-layout coverage fs-scan, PNG IHDR dimensions,
manifest fields). Gates: lint 0/0 · tsc ✓ · 432/432 unit · build ✓ ·
86/86 E2E. Live-verified: **13/13 titles byte-identical + 13/13
structure OK** (canonical/og/twitter/icons/jsonld/login extras), the
12-route geometry sweep 12/12 MATCH (metadata moves nothing), mobile
chrome unchanged.

### Session 27 — parity round 26: the reduced-motion + drag-drop dimensions

**Audit basis**: emulated-media census (`agent-browser set media
reduced-motion`, computed-DOM ground truth) + the FIRST keyboard Tab-order
sweep (login 8/8 MATCH — REF's extra tab-9 stop is the base44 "Close
badge" platform artifact; dashboard 14/16 — the 2 diffs are the clone's
kept aria-label supersets on bell/moon, REF's buttons are unnamed) + the
kanban drag census (REF: zero draggables, documented since session-21).

**The finding**: BOTH apps ignore `prefers-reduced-motion` — under
emulated reduce the group/leaf transitions still compute 0.2s, the drawer
panel `enter 0.5s`, the dropdown `enter 0.15s` on BOTH (sonner internals
are the only reduced-motion-aware rules on either side). The WCAG 2.3.3
a11y gap was open on both apps.

**R26-A (the reduced-motion SUPERSET — globals.css)**: a top-level
UNLAYERED `@media (prefers-reduced-motion: reduce)` block pins the
modern-normalize recipe — `animation-duration: 0.01ms !important`,
`animation-iteration-count: 1 !important`, `transition-duration: 0.01ms
!important`, `scroll-behavior: auto !important` on `*, ::before,
::after`. Two hard constraints: (1) 0.01ms durations, NEVER `animation:
none` — Radix waits for `animationend` before unmounting portal content
(at 0.01ms every animation completes instantly and the event fires — the
drawer close stays clean, live-verified); (2) unlayered + `!important` so
the block beats the v4 utilities layer (the session-21 unlayered-class
lesson). Under DEFAULT media the block is inert — parity byte-identical
(the 12-route geometry + mobile chrome + motion regressions re-proved).

**R26-B (the kanban drag-drop SUPERSET — taskmanager)**: REF ships zero
draggables while its cards LOOK grabbable (the cursor-grab recipe) — the
clone wires real HTML5 DnD onto the existing `moveTask` PATCH path:
cards `draggable` + `onDragStart` (dataTransfer payload + the mid-drag
`opacity-50` affordance, live-verified 0.5 → 1 on dragend), columns
`onDragOver` preventDefault (the HTML5 contract) + a `ring-blue-500/40`
highlight while dragging + `onDrop` → moveTask (optimistic state +
toast). The "Move to" dropdown stays as the keyboard/a11y path. E2E:
`tests/e2e/taskmanager-dnd.spec.ts` — synthetic DragEvents (HTML5 DnD
cannot be driven by mouse events), create → drag Backlog→Done → toast →
reload → persisted → cleanup.

**Pins**: 6 new (tests/unit/recipes.test.ts session-27 block — the
reduced-motion block's presence/recipe/unlayeredness/media-scoping + the
DnD source contract: draggable/setData/preventDefault/onDrop/moveTask).
Gates: lint 0/0 · tsc ✓ · 438/438 unit · build ✓ · 87/87 E2E.
Live-verified: LOC calms under reduce (1e-05s) while REF keeps animating
(0.2s/0.15s/0.5s); under default LOC computes 0.2s/0.15s — byte-parity;
the 12-route geometry 12/12 MATCH; mobile chrome byte-identical; the
mid-drag opacity + drop-target rings VLM/DOM-verified.

## Session-28 recipe layer (parity round 27 — the DnD depth)

- **R27-A (recruitment pipeline DnD superset)**: the recruitmentkanban
candidate cards are HTML5-draggable (REF ships zero draggables on the
pipeline — re-verified round 27) — `draggable` + `onDragStart`
(dataTransfer payload + a `dragCandId` state driving the mid-drag
`opacity-50`) + `onDragEnd`; the w-64 columns are drop zones
(`onDragOver`/`onDragEnter` preventDefault + the `ring-blue-500/40`
highlight on non-source columns + `onDrop` → the existing `onMove` stage
PATCH). The "Move to" dropdown stays as the keyboard/a11y path. The
card carries `cursor-grab active:cursor-grabbing` (the hover-state-only
superset — a draggable card that does not look draggable is a usability
defect; same category as the round-24 aria-label supersets).
- **R27-B (taskmanager within-column reorder superset)**: `Task.position
Int @default(0)`; GET orders `[{ position: "asc" }, { createdAt: "desc"
}]` (untouched columns keep the newest-first render — all positions tie
at 0); PATCH accepts `order: string[]` (the full ordered id list for one
column — reassigns position 0..n-1 in a transaction, existence-validated);
the kanban cards are insertion drop targets (`onDragOver` + a `dragOverId`
state driving a `ring-2 ring-inset ring-blue-500/40` insertion ring on
the hovered card; `onDrop` on a card inserts BEFORE it — the column
body append stays via `reorderTask(id, col, null)`). Optimistic state:
array order IS render order (splice before the insertion point).
- **Probe-tooling lessons**: ALWAYS pin both viewports before sweeping —
the ref session defaulted to 800×900 and produced two phantom DIFFs
(/payroll y=136 vs 116: at 800px the title column shrinks to min-content
186px — the badge wraps to 56px, the subtitle to 3 lines; /profile
x=288 vs 336: the centered header re-centers). React state does NOT
flush inside a single eval — dispatch and read in SEPARATE evals. Chrome
serializes modern colors as lab() — the ring-blue-500/40 shadow reads
`lab(54.6 8.76 -65.79 / 0.4)`, match on geometry or parse tolerantly.
- **Pins**: 7 new (tests/unit/recipes.test.ts session-28 block). Gates:
lint 0/0 · tsc ✓ · 445/445 unit · build ✓ · 89/89 E2E (+2 first-run
passes: tests/e2e/recruitment-dnd.spec.ts + the within-column reorder
test). Live-verified: the pipeline round-trip (applied → interviewing,
persisted, opacity 0.5→1, cursor grab); the reorder round-trip
(Beta,Alpha → Alpha,Beta, persisted via position); the round-26
cross-column regression PASS; the 12-route geometry 12/12 MATCH (at
pinned 1440×900); mobile chrome byte-identical; the insertion ring
DOM-verified + pixel-verified (rgb(177,205,251) = blue-500@40% over
white — VLM cannot perceive the subtle 2px ring, documented).

## Session-29 recipe layer (parity round 28 — within-stage ordering + print)

- **R28-A (recruitment within-stage ordering superset)**: the round-27
  Task pattern applied to Candidate — `position Int @default(0)` (db
  pushed; rows backfill 0), GET orders `[{ position: "asc" },
  { appliedAt: "desc" }]` (untouched stages keep the newest-first
  render), PATCH accepts `order: string[]` (one stage's full ordered id
  list; position = index in a `$transaction`, existence-validated,
  NOT_FOUND on mismatch). The pipeline cards are insertion drop targets
  (`dragOverId` → the `ring-2 ring-inset ring-blue-500/40` ring;
  `onDrop` inserts BEFORE with `stopPropagation`; column-body drops
  append). **The order computes over the FULL `candidates` array, NOT
  the filtered `visible` view** — an active job filter or search cannot
  corrupt persisted positions. The cross-stage toast stays
  `${name} → ${Label}` (the round-27 E2E contract); same-stage reorders
  toast "Order updated".
- **R28-B (print superset)**: an UNLAYERED `@media print` block in
  globals.css (the reduced-motion placement rule — unlayered !important
  beats every v4 cascade layer; zero screen-media impact): `aside,
  header, nav, [data-radix-portal] { display: none !important }` (the
  app shell's elements are the ONLY such tags in the tree — census),
  `main { padding-bottom: 0 !important }` (drop pb-20), `body > div
  { min-height: 0 !important }` (drop min-h-screen), `.rounded-xl,
  table tr { break-inside: avoid }` (cards/rows never split across
  pages). REF ships zero print rules (session-18 census) — the print
  output becomes clean while REF's stays chrome-laden.
- **Probe-tooling lessons**: agent-browser's `set media` supports only
  dark|light|reduced-motion — print emulation lives in the Playwright
  layer (`page.emulateMedia({ media: "print" })`), which is why the
  print verification is the permanent tests/e2e/print-media.spec.ts
  (also the cascade proof: under print the sidebar computes
  display:none vs `flex` from `md:flex`). The FIRST `body > div` is
  Next.js's hidden bootstrap div — locate the app root as
  `body > div.min-h-screen`. Loc cookie flakes after server restarts
  (0/12 login-page signature) — re-run scripts/auth-r22.mjs.
- **Pins**: 6 new (tests/unit/recipes.test.ts session-29 block). Gates:
  lint 0/0 · tsc ✓ · 451/451 unit · build ✓ · 91/91 E2E (+2 first-run
  passes: the recruitment within-stage reorder + the print-media
  spec). Live-verified: the reorder round-trip (Beta,Alpha →
  Alpha,Beta, persisted via position — VLM confirmed the insertion
  ring on Beta + the mid-drag opacity on Alpha); the print emulation
  VLM-confirmed (no sidebar, content-only "Employees" page) + the
  screen contrast shot; the 12-route geometry 12/12 MATCH (pinned
  1440×900); mobile chrome byte-identical (the one DRAWER DIFF was a
  transient un-registered click — re-run clean). DB pristine.

## Session-30 recipe layer (parity round 29 — the sidebar leaf-gap + organogram DnD + print color)

- **The round's find (R29-A — a REAL at-rest parity bug, 28 rounds
  undetected)**: the standing audits pin h1 geometry only; a
  sidebar-internal census (full nav y-map, buttons AND links) found
  the expanded-group trailing gap diverges — REF's next root item
  sits at +4px (AI HR Assistant y=865, Settings group y=905), the
  clone's nested leaf-ul (`mt-1 mb-1`) added mb-1 + the root gap =
  +8px (869/909). The LEADING side always matched (first leaf y=577
  both — REF via the root gap, the clone via mt-1), which is why the
  session-5 pin got the top right and over-generalized the bottom.
  FIX: the leaf-list ul drops `mb-1` (`mt-1 flex flex-col gap-1
  pl-4` — the session-5 pin corrected); post-fix both sides read
  865/905 byte-identical; the same SidebarNav renders the mobile
  drawer, and the mobile chrome audit re-ran clean.
- **R29-B (the organogram drag-drop superset)**: REF ships zero
  draggables on /organogram (re-verified; zero-data empty state
  byte-identical). The page keeps the server tree-build and delegates
  the render to the client island `organogram-tree.tsx` (the
  page-folder convention): node cards draggable + dataTransfer +
  mid-drag opacity-50 + the round-27 cursor-grab affordance; drop
  targets with dragOverId → `ring-2 ring-inset ring-blue-500/40`;
  `reparent` = client cycle guard (the tree walk precedes any
  request) → optimistic surgery (remove/insert/recount — local forest
  IS render order) → `PATCH /api/employees { managerId }` → toast
  `${name} now reports to ${target}` → `router.refresh()` (server is
  truth; the island re-syncs from refreshed props). The API PATCH
  gains the ancestor-walk cycle guard (1000-deep walk from the
  proposed manager; VALIDATION "This manager assignment would create
  a reporting cycle" — the render cycle guard tolerates corrupt
  data, the API must not create it). Keyboard path: the employee edit
  form (unchanged). E2E +2: the re-parent round-trip (A→B→C chain,
  drag C onto A, depth 2→1, persisted after reload) + the cycle
  rejection (drag A onto its own descendant C — toast, no move, no
  persistence).
- **R29-C (the print color fidelity)**: the round-28 print block
  gains `* { print-color-adjust: exact !important;
  -webkit-print-color-adjust: exact !important }` (browsers strip
  backgrounds from print by default — the economy default would
  blank every badge/chart fill/table tint) + `@page { margin: 10mm }`
  (consistent print margins; browser defaults vary 10–12mm).
  Media-scoped like the rest of the block — zero screen impact. The
  E2E print-media spec pins the computed `print-color-adjust: exact`
  on cards under emulation. The print-button-on-report-pages idea is
  CONSIDERED AND DEFERRED (a visible at-rest button would break
  visual parity on report surfaces).
- **Probe-tooling lessons**: (1) the standing audits pin h1 geometry
  only — sidebar internals drifted undetected since session 5; a
  sidebar-internal census (buttons AND links together — REF's
  "Training LMS"/"Assets"/"Staff Requests"/"AI HR Assistant" are
  single-route anchors, not collapsible buttons) is now part of the
  round's probes; (2) Chrome serializes ring box-shadows with the
  inset geometry LAST — the ring assertion must match `/0px 0px 0px
  2px inset/`, not `/2px 0px 0px 0px/` (one E2E regex fix, the ring
  rendered correctly on the first run); (3) in-page fetch evals
  break on JSON bodies (double quotes inside double quotes) — drive
  the API from Node with the session cookie instead.
- **Pins**: 6 new (tests/unit/recipes.test.ts session-30 block) + the
  session-5 sub-list pin corrected. Gates: lint 0/0 · tsc ✓ · 457/457
  unit · build ✓ · 93/93 E2E (+2: the organogram re-parent + cycle
  rejection, both first-run passes after the regex fix). Live-
  verified: the sidebar geometry 865=865 / 905=905 byte-identical;
  the re-parent round-trip (ring lab(54.6 8.76 -65.79 / 0.4) 0px 0px
  0px 2px inset + opacity 0.5 + depths 0/1/2 → C moves 2→1,
  persisted); the cycle rejection; the print CSS ships
  print-color-adjust + @page; 12/12 redeploy MATCH; mobile chrome
  byte-identical; 5 new screenshots (94 evidence, 95 the organogram
  ring VLM-confirmed, 96 the sidebar fixed geometry, 97/97b the
  print-color pair VLM-confirmed) + 02/11 standards refreshed → 112
  PNG captures. DB pristine.

## Session-31 recipe layer (parity round 30 — the drawer border + chat structure + legacy /assets + the swipe superset)

- **Standing audits**: redeploy 12/12 MATCH (viewports pinned 1440×900 from
  the start); mobile chrome byte-identical (tabs/kicker/drawer overlay —
  no Tailwind v4 bug); with-data — REF still zero-data (blocked,
  documented); the round-29 sidebar-internal census re-run — collapsed
  groups 141→621, expanded leaves 577→829, roots 865/905 all
  byte-identical (the fix holds; re-collapse leaves no residual margin).
- **The round's new probes**: (1) the sidebar collapse-boundary census
  (collapsed → expand → re-collapse, all three states byte-identical);
  (2) the drawer EXPANDED-state census at 390×844 — the internal nav
  y-map matches, but the panel's BORDER did not: REF ships
  `border-right: 1px #e5e5e5` (the default border color — NOT the
  desktop sidebar's slate-200 token; REF uses different border colors on
  the two surfaces and so does the clone after the fix); (3) the
  bottom-tab active-state route sweep — 18 routes, Home/Staff/Tasks/
  Attendance/Profile highlighting + kickers identical on all (verified
  non-gap, first full sweep); (4) the orphan-route census — REF serves a
  LEGACY page at /assets the clone 404'd on (the sidebar links to
  /assetmanagement on both apps; the modern page is byte-identical).
- **R30-A (the drawer border parity fix)**: `border-r` on the drawer
  `DialogPrimitive.Content` — the width-1 border picks up the base
  layer's `#e5e5e5` (REF's measured rgb(229,229,229), the clone's
  `--color-border`). Panel stays 288px (border-box). Live-verified:
  computed borderRightWidth 1px + color rgb(229,229,229) byte-identical.
- **R30-B (the /hrassistantchat empty-state restoration)**: the left
  card becomes REF's natural-height recipe — `Card border-slate-200` +
  `CardHeader` (`border-b border-slate-200 p-4`) with a `CardTitle
  className="text-sm"` "Active Chats" (14px/600 #0a0a0a, the DEFAULT
  20px line box — leading-[1.5]'s 21px pushed the body line 1px low)
  + the `max-h-96 space-y-1 overflow-y-auto p-2` body holding a plain
  `text-sm text-muted-foreground` "No chats" (y=302) — NOT a stretched
  column card with a centered iconed EmptyState. The right pane wraps
  in a bare `lg:col-span-3` div; its empty state is the h-full card's
  centered block: `CardContent` (`flex h-full items-center
  justify-center`, the default p-6 pt-0) around a `text-center` div
  with the 64px slate-300 **MessageSquare** (mb-4 wrapper, y=449 —
  path-fingerprinted `M21 15a2 2 0 0 1-2 2H7l-4 4V5…`) over the single
  16px slate-500 line (y=529). The extra copy ("Start a new chat to
  ask a question." / "Your HR assistant answers questions…") is gone.
- **R30-C (the legacy /assets route)**: a NEW page replicating REF's
  orphan contract — flat36 always-row header (`flex-row justify-between
  items-start` at EVERY width, measured side-by-side at 390px), the
  green→blue canvas (`bg-[linear-gradient(to_right_bottom,#f0fdf4,
  #eff6ff)]`, trap 3), the `border-slate-200` card with the
  `border-b bg-slate-50` header band (the leading-none 16px/600
  "Assets" title, h=16) + `CardContent p-0` holding the `p-12
  text-center` empty state (the 64px slate-300 **Inbox** —
  path-fingerprinted — over "No assets yet"). The Add Asset dialog:
  Asset Name / Type (Laptop/Desktop/Phone/Tablet/Monitor/Other) /
  Serial Number / Assign To (Optional) — POSTs the shared /api/assets;
  the API's zod enum gains desktop + tablet (the modern page's filter
  stays REF's contract). Route metadata via the mechanical
  `pageMetadata("/assets")` (the R25-A4 coverage pin's count 46→47).
  With data (unverifiable — the with-data frontier): a divide-y asset
  list (the superset on a REF-stub surface).
- **R30-D (the drawer swipe-to-close superset)**: touch handlers on the
  drawer panel — a horizontal-dominant leftward drag live-translates
  the panel (`translateX(dx)`, transition suppressed mid-drag); past
  the 96px threshold the release closes (tailwindcss-animate's exit
  keyframes define only the `to` state, so the close animation
  continues from the CURRENT inline transform — no snap-back); below it
  the panel springs back along the drawer's own curve. Zero at-rest
  impact. E2E via CDP `Input.dispatchTouchEvent`.
- **Probe-tooling lessons**: (1) text-only DOM censuses miss icons —
  REF's /assets empty state's 80px gap was a 64px Inbox + mb-4
  (invisible to a text-node census; the subtree's kids:2 was the tell);
  (2) CDP touch dispatches need the enter animation settled (a touch
  landing mid-flight targets the OVERLAY — the panel hasn't slid under
  the finger, and the overlay is the Content's SIBLING so the React
  handlers never see it) + ~100ms inter-phase frames (back-to-back
  dispatches drop the touchMove — the round-26 separate-evals lesson,
  touch edition); (3) Radix renders the overlay and the panel as
  SIBLINGS in the portal — locate the panel by its own geometry, not
  the overlay's children.
- **Pins**: 7 new (tests/unit/recipes.test.ts session-31 block) + the
  R25-A4 route count updated. Gates: lint 0/0 · tsc ✓ · 464/464 unit ·
  build ✓ · 100/100 E2E (+7: the chat empty-state contract, the legacy
  page contract, the add-asset round-trip, the drawer border, the
  threshold close, the sub-threshold spring-back with a non-vacuous
  mid-gesture transform poll, the /assets row in the navigation sweep). Live-verified: the drawer border
  byte-identical; the chat y-map byte-identical (title 257 / line 302 /
  icon 449 / line 529); the /assets y-map byte-identical (desktop:
  kicker 40, h1 84, sub 136, button 32/1274, card 196, band 197/65,
  Inbox 310, line 390; mobile: h1 141, button 89/240, card 281/16);
  12/12 redeploy MATCH; mobile chrome byte-identical; sidebar navmap
  865/905. 6 new screenshots (98 evidence, 99/99b the drawer border
  pair, 100 the chat page, 101/101b the legacy /assets desktop+mobile
  — VLM-confirmed) + 02/11 standards refreshed → 118 PNG captures. DB
  pristine.

## Session-32 recipe layer (parity round 31 — the orphan-route hunt: 14 new routes)

- **The round's method (the big find)**: REF's SPA bundle
  (`/assets/index-C-IrDy5f.js`, 2.2MB) carries the FULL page registry —
  `VKe={…61 keys}` — plus the mechanical path function
  `We(name)="/"+name.toLowerCase().replace(/ /g,"-")`. Cross-referencing
  the 61 registry names against the clone's 47 routes found **14 routes
  REF serves that the clone 404'd on**. ALL render inside the app shell
  (main x=256, 17 nav items — measured). Route-coverage parity is now
  COMPLETE: the clone serves all 61 registry routes.
- **R31-A (the 10 real pages)**: /careers (the blue→indigo sRGB hero
  `bg-[linear-gradient(to_right,#2563eb,#4f46e5)] text-white py-16
  text-center`, 48px white h1 y=64 + 20px blue-200 line y=128; the
  company chips + 548px job grid are with-data only; zero-data = the
  "No Open Positions / Check back later for new opportunities!" card;
  REF's job list FLUCTUATES per load — its backend data, documented
  divergence), /employeeportal (canvas `from-blue-50 to-indigo-100 flex
  items-center justify-center`; max-w-md shadow-xl card, p-8 text-center;
  the 64px bg-blue-100 ClipboardList circle mb-4 + **H2 20px/700** "No
  Onboarding Found" y=448 + 16px line y=484), /externaljobapplication
  (blue→indigo canvas; centered 36px h1 y=32 + 18px sub **mt-3** y=84;
  wrapper **space-y-12** (48px, NOT the standard 32 — card y=160);
  CardContent p-6 pt-0 > div **pt-12** > 64px slate-300 Briefcase mb-4
  y=209 + h3 20px mb-2 y=289 + 16px slate-600 line y=325 — the ICON
  rides FIRST), /hrassistant (max-w-4xl mx-auto; the flat36 centered
  header — kicker pill "AI HR Assistant" y=40 + 36px h1 y=84 + 18px line
  y=136; shadow-xl chat card CardContent p-0 with the h-[460px] message
  area + "Ask me anything about HR..." textarea + 48px icon send button;
  persists via the existing /api/ai-chat, single-pane), /payrollai (the
  /assets green→blue canvas twin; flat36 + "Run AI Analysis" gradient
  button y=32; 3-col gap-6 p-6 170h stat tiles; the 64px green-500
  CheckCircle empty), /payrollreports (**a page-specific header recipe**
  — hand-rolled, NOT PageHeader: the badge pill + green-600 WhatsApp CTA
  ride a row at y=56 (24px below canvas top), 36px h1 y=108, 16px sub
  y=156 — distinct from the standard raised-36 116/168; 4×72h horizontal
  stat tiles; p-4 filter card; Monthly/Tax/History white pills h-7;
  border-b p-6 pb-3 report card), /requestreports + /requestsettings
  (canvas `min-h-screen flex w-full from-slate-50 to-blue-50`; the
  CENTERED 24px h1 y=32 + Back ghost (12px h-8 x=288) + sub **mt-0**
  FLUSH y=64 — the hrreports mt-0 recipe; requestsettings' cards are
  `max-w-[960px] mx-auto`), /shiftswap (violet→blue canvas
  `bg-[linear-gradient(to_right_bottom,#f5f3ff,#eff6ff)]`; flat36 + 4×82h
  horizontal tiles; the violet-600 "My Requests" pill + ghost "Peer
  Approval (N)" row y=315; 48px slate-300 ArrowLeft empty), /tenantsetup
  (canvas from-blue-50 to-indigo-50 centered; max-w-2xl **shadow** card;
  CardHeader border-b p-6 text-center: the 64px bg-blue-100 Users circle
  **mb-[22px]** — v4's space-y flip means REF's v3 mb-4+space-y-1.5
  STACK to 22px while v4's :where() lets mb-4 win, so the explicit
  mb-[22px] + the h2 `font-semibold tracking-tight text-2xl` + 16px line
  y=358; CardContent p-6 form space-y-6 with h-11 inputs + `pt-4` on the
  justify-end Continue row — card h=483, y=209).
- **R31-B (the 2 aliases)**: /organizationsetup + /dynamicdashboard
  re-export the dashboard page component; both take the plain "Eon HR"
  title (PLAIN_TITLE_ROUTES) — REF renders the dashboard byte-identical
  there (bodyLen 322, 4 cards, "Welcome back" h1).
- **R31-C (the 2 blank stubs)**: /home + /employeedetail render `null`
  with the mechanical titles — REF renders NOTHING in main on both
  (verified twice; ?id= changes nothing; a path segment → REF's own
  404). Pinned: main has zero h1/h3/button.
- **R31-S (the schema supersets)**: `ShiftSwap` (requesterId → Employee,
  swapDate, notes?, status pending|peer_approved|manager_review|
  approved|rejected) + `ApprovalConfig` (category, level 1-3, approverId
  → Employee, @@unique triple). APIs: /api/shiftswaps (GET list+counts,
  POST, PATCH status, DELETE) + /api/approval-config (GET, POST
  admin/hr, DELETE admin/hr). The pages wire real data (careers/
  externaljobapplication → JobPosting; employeeportal → OnboardingProcess
  with the progress superset; payrollai/payrollreports/requestreports →
  aggregations with a real CSV export; requestsettings → the Add-approver
  round-trip; tenantsetup → the Company PATCH; shiftswap → the full
  request round-trip).
- **Probe-tooling lessons**: (1) the standing audit's `aside`-selector
  navmap reads REF EMPTY (REF's sidebar is div-based — locate items via
  `div.min-h-screen button/a` + x<260; the audit script's drawer click
  also flakes on cold sessions — the dedicated probes are the truth);
  (2) the standalone server restart needs the OLD next-server killed by
  PID (`ss -tlnp` — pkill -f server.js misses it; an EADDRINUSE failure
  leaves the STALE build serving, which reads as page errors on new
  routes); (3) eval strings with `//` comments die when joined to one
  line (the comment eats the rest — strip comments from probe evals);
  (4) the v4 space-y flip bites INSIDE cards too (REF's v3 mb-4 +
  space-y-1.5 stack to 22px; v4's :where() wrapper lets the utility
  win — use explicit mb-[22px]).
- **Pins**: 16 new (tests/unit/recipes.test.ts session-32 block) + the
  R25-A4 route count 47→61. Gates: lint 0/0 · tsc ✓ · 480/480 unit (+16)
  · build ✓ · 121/121 E2E (+21: 12 navigation rows/specials + the
  orphan-routes spec's 10 — the blanks/aliases/empty-state contracts +
  the shiftswap round-trip + the requestsettings Add round-trip + the
  tenantsetup PATCH with company restore). Live-verified: 13/14 routes
  byte-identical (the /careers line diff is REF's fluctuating live job
  data — h1+hero byte-identical, the zero-data contract verified
  matching on the empty load); 12/12 redeploy MATCH; mobile chrome
  byte-identical (tabs/kicker/drawer border); sidebar navmap 865/905. 9
  new screenshots (102 evidence, 103/103b the shiftswap pair, 104
  tenantsetup, 105 careers, 106 payrollai, 107 hrassistant, 108 mobile
  shiftswap) + 02/11 standards refreshed → 127 PNG captures. DB pristine.


## Session 33 (parity round 32) — THE DARK THEME + RTL + SWIPE-TO-OPEN

The footer-controls census: REF's Moon toggles a REAL shadcn-neutral dark
theme (html.dark + `localStorage darkMode="true"`, persisted across
reloads) and REF's عربي flips the app to **RTL mode** (dir=rtl +
`localStorage app_lang="ar"`; strings stay English — its i18n is not
wired; the layout mirrors; the drawer stays left-anchored). The clone's
controls were display-only stubs. Plus a 31-round-invisible LIGHT find:
REF's desktop aside is authored `bg-white` (rgb 255,255,255) — every
prior audit compared sidebar GEOMETRY or the MOBILE drawer (the
`--sidebar-background` token = #fafafa on both apps), never the desktop
aside's computed background.

- **globals.css**: restructured to the shadcn runtime-var pattern —
  `:root` (light pins verbatim) + `.dark` (REF's extracted neutral
  palette: background #0a0a0a, border #262626, primary-foreground
  #171717, muted-foreground #a3a3a3, sidebar #18181b) + `@theme inline`
  var() indirection. `--color-primary` does NOT flip (REF's active-nav
  blue survives dark — measured #1877F2). Body follows `var(--background)`.
- **THE v4 TRAP (new, session 33)**: v4's `dark:` variant defaults to
  the prefers-color-scheme MEDIA query — the class strategy must be
  declared: `@custom-variant dark (&:where(.dark, .dark *));`. Without
  it, every dark: utility compiles to a media query that never fires
  under html.dark (found via E2E: the moon icon's dark:hidden stayed
  visible).
- **app-shell**: canvas `dark:bg-[linear-gradient(...,#0f172a,#1e293b)]`
  (slate-900→800, sRGB-pinned); aside → `border-slate-200
  dark:border-slate-800 bg-white dark:bg-slate-900`; mobile header/nav
  `dark:bg-slate-900 dark:border-slate-800`; bottom tabs
  `dark:text-slate-400` / `dark:bg-blue-900/20 dark:text-blue-400`.
- **sidebar-nav**: brand h2 `dark:text-white`; moon `dark:text-zinc-100`
  (REF's sidebar-foreground token flip) + a class-driven Moon↔Sun swap
  (dark:hidden/hidden dark:block — never desyncs); the Moon/عربي
  persistence contracts; عربي flips `document.documentElement.dir` +
  app_lang, title → "التبديل إلى الإنجليزية" in Arabic mode.
- **layout.tsx**: the pre-paint THEME_BOOT script (darkMode + app_lang
  applied before first paint — no FOUC, reload-persistent like REF).
- **button dark variant**: `dark:bg-[#fafafa]` (REF's bg-primary flip —
  measured on the /hrassistant send button: #fafafa bg + #171717 text).
- **tabs**: `dark:text-neutral-400` (REF's dark tab-inactive, 0 0% 63.9%).
- **Readability supersets (dark-only, light untouched)**:
  checkbox/avatar/chat-bubble text stays white in dark (REF's zero-data
  surfaces never render these in dark — unmeasurable; the token flip
  would put #171717 text on the unchanged blue).
- **Swipe-to-open** (R32-C): a rightward, horizontal-dominant touch
  starting within 32px of the left edge (≥24px travel) opens the drawer
  — the R30-D interaction-state pattern; handlers on the main column.
- **Pins**: 12 new (session-33 block) + the tokens.test evolution
  (:root/.dark/@theme slices, the indirection map, dark pins) + 6 legacy
  pins updated to the restructured literals. Gates: lint 0/0 · tsc ✓ ·
  493/493 unit (+13 net) · build ✓ · 133/133 E2E (+12: the dark-mode
  spec's 8 — toggle/persistence/boot/icon/mobile-chrome/light-back +
  the RTL triple — and the swipe-to-open spec's 4).
  Live-verified: the dark sweep byte-identical (body/canvas/card/
  sidebar/tabs/drawer rgb(24,24,27)+#262626 on both apps); RTL mirrors
  (sidebar x=1184, h1 x=623); light regressions 12/12 + mobile chrome +
  navmap byte-identical. 5 probe DIFFs all resolved as artifacts (the
  to-right/90deg serialization, the lab()/rgba() notation on
  blue-900/20 — same color, the zero-rect display:none decoy button in
  drawer probes — filter width>0, the aside-fallback in RTL probes, the
  un-settled kicker transient). 6 new screenshots (109/109b the dark
  pair, 110 dark settings, 111 dark mobile drawer, 112 RTL, 113 light
  restored) → 133 PNG captures. DB pristine.

## Session 34 (parity round 33) — THE WIRED-PAGE AT-REST AUDIT + THE LOGIN ALERT

The round-31 orphan-route hunt wired data supersets into nine pages and
then audited "h1+hero byte-identical" — the BODIES below the headers
were never inventoried. This round's census (button/input/text
inventories on all nine + the form-error dimension — the login error,
never audited) found six pages carrying genuine at-rest gaps; REF's
asset fingerprints were UNCHANGED (`index-BGNH4KkS.css`) — clone-side
drift, not REF movement.

- **R33-A /payrollreports (the headline rebuild)**: canvas slate-50→
  blue-50 (sRGB-pinned — was blue→indigo); the white-pill kicker
  (`px-4 py-2 bg-white rounded-full shadow-sm mb-4` + the 16px blue
  BarChart3) with the green-600 WhatsApp CTA (MessageCircle; SOLID —
  `bg-none` suppresses the default variant's gradient, a bg-image that
  paints OVER any bg-color) riding the pill row at y=56; the filter
  card (Label fs12 above the w-full select in `space-y-1 flex-1
  min-w-[180px]` — the v4 inline-label trap AGAIN: v3's space-y put mt
  on the following block, v4 puts mb on the inline label (ignored
  vertically) — explicit `mt-1` on the trigger, the login fix); the
  4-col grid tab list (Monthly active=white, Tax & Deductions, History,
  **Custom** — inert on REF); the summary card (`flex flex-col
  md:flex-row justify-between gap-3` header: the INLINE-Calendar title
  + the mt-1 sub | `flex gap-2 flex-wrap`: the w-40 month input +
  FileSpreadsheet/FileText mr-1 CSV/PDF) with the stats INSIDE (labels
  `text-xs text-slate-500 mb-1` + `font-bold text-lg` values colored
  blue-700/red-600/green-700/slate-700) and the 8-col table (thead
  bg-slate-50, th `text-xs font-bold uppercase text-slate-600`; the
  colspan "No records for {YYYY-MM}" TD). Tabs+card ride a space-y-4
  wrapper inside the space-y-6 flow.
- **R33-B /requestreports**: the stat tiles reverted to the stock Card
  recipe (`shadow` + the default border token); the 4 section cards
  (Requests by Category / Status Breakdown / Financial Amount by
  Category (SAR) / Top Requesters — 2×2, CardHeader p-6 + content
  `p-6 pt-0` with `text-slate-400 text-center py-8` "No data"/"No
  financial requests"); the Request Log card with its 7-col table;
  the right controls gap-2.
- **R33-C /requestsettings**: rebuilt to REF's forms — the Approval
  card (the 4-col row: Approver name + Approver email + Level select +
  Add dark) + the 3 static "LEVEL N APPROVERS / None set" rows
  (space-y-2; the heads carry icons: Shield blue-600 / Users
  purple-600, w-5 h-5); the Limits card (the 3-row grid: Limit
  name/Finance/Monthly + Sub-type/Max requests/Max amount + All
  Staff/Add Limit + "No limits configured"); the header is
  LEFT-aligned Back+title (not centered) in `p-4 md:p-8 max-w-5xl
  mx-auto`; the Back ghost is the default sm (85px, ArrowLeft mr-2
  h-4). The API accepts name+email (resolved against Employee —
  SQLite has no case-insensitive equals; JS-side match).
- **R33-D /shiftswap**: the "Request Swap" header button REMOVED
  (REF's at-rest carries exactly the two tab pills); REF's empty text
  on both tabs ("No swap requests in this category"); the pills sit in
  REF's `flex gap-1 bg-white border border-slate-200 p-1 rounded-xl`
  container; the superset entry is now the invisible-at-rest **"n"
  keyboard shortcut** (Gmail/Linear pattern — no at-rest chrome).
- **R33-E /careers**: the page's own canvas (blue-50→indigo-50); the
  hero restructured (max-w-6xl mx-auto px-4 > text-center > h1 mb-4 +
  blue-100 sub mb-8 + the job-search input — hero h=302); the "Browse
  by Company" H2 + REF's chip geometry (h-46 rounded-md outline, no
  All-Companies chip); the search filters client-side (superset).
- **R33-F /payrollai**: the empty state (CircleCheckBig w-16 h-16
  mx-auto mb-4 text-green-500 + "All Clear!" + "No payroll
  adjustments needed"); the CTA is the GREEN gradient variant riding
  the badge row (actionsStart, y=32 — was the blue default at y=80).
- **R33-G the login Alert**: the new `src/components/ui/alert.tsx`
  (shadcn Alert/AlertTitle/AlertDescription — the className props MERGE
  via cn, the round's component lesson); the login error rebuilt on it
  (`bg-red-50/70 border-red-200 rounded-xl` + the text-red-700
  description — REF-measured 368×54 at y=738). The login STACK was
  also never audited: rebuilt to REF's (p-4 outer, ONE padded wrapper >
  `flex flex-col items-center text-center space-y-6 sm:space-y-8`,
  two `space-y-1.5`-structured field DIVs — the label leading-5 (lh
  20px) + the input wrapper's explicit mt-1.5, the v4 inline-label
  space-y trap's second sighting; noValidate REMOVED so the empty
  submit keeps REF's HTML5 blocking).
- **R33-H /settings**: the cards carry `border-slate-200` (the 3-unit
  deferred micro-diff).
- **The v4 trap (new, session 34)**: v4's `space-y-*` puts margin on
  `:not(:last-child)` — when the first child is an INLINE label, its
  margin-bottom is IGNORED vertically (inline boxes), so v3's
  label→input gap silently collapses by the space-y amount. Fix:
  explicit `mt-*` on the following BLOCK (login fields + the
  payrollreports filter select).
- **The button lesson**: the default variant's CTA GRADIENT is a
  background-IMAGE — it paints OVER any bg-color a className adds
  (tailwind-merge can't dedupe across the bg-image/bg-color groups).
  Solid-color buttons need `bg-none` (or a real variant).
- **Pins**: 14 new (session-34 block) + R31-C1/C5/C6/C7/C8 evolved to
  the rebuilt structures. Gates: lint 0/0 · tsc ✓ · **507/507 unit
  (+14)** · build ✓ · **135/135 E2E (+2: the login-error spec — the
  Alert geometry + the empty-submit HTML5 contract)**.
  Live-verified: the 5 wired pages' button/color/geometry inventories
  MATCH byte-identically (the payrollai "DIFF" is the documented
  to-right/90deg serialization); the login stack + Alert pair MATCH;
  the standing audits hold (dark sweep artifacts unchanged, light
  redeploy 12/12 + mobile chrome + navmap, verify-r33: 19/19 MATCH,
  0 DIFFs). 11 new screenshots (114-119 the wired-page pairs + 118
  careers hero + 119 payrollai + 120 the login-error pair) → 145 PNG
  captures. DB pristine.

## Session 35 (parity round 34) — THE DIALOG INTERIORS + THE DEEP-RTL FIND

Round 33 audited the wired pages' at-rest bodies; this round took the
frontier's next dimensions: the dialog interiors (the loans + assets
dialogs — the only two REF-exposed — measured geometrically for the
first time), the deep-RTL polish, and the payrollreports tab contents.
REF's CSS chunk was UNCHANGED (`index-BGNH4KkS.css`) and its account
still zero-data — every diff was clone-side.

- **R34-A /assets dialog**: rebuilt to byte-identical geometry (box
  512×372, every element y-for-y with REF): the H2-only header (the
  invented description line removed — the loans pattern), the Type +
  Serial 2-col `grid grid-cols-2 gap-4` row (223+223, was stacked
  full-width), and the text-only 102×36 Add button (the Plus icon
  removed).
- **R34-B /loans dialog**: the Monthly Installment value is REF's P —
  `text-base font-semibold text-blue-700` inside the matched
  slate-100 box (was a plain neutral DIV); the Paid From input's
  invented placeholder removed; every control gains `mt-2` (below).
- **R34-C the systemic dialog recipes**: `DialogTitle` → `text-lg
  font-semibold leading-none` (REF-measured 18px/18px/600 on BOTH
  dialogs — every dialog title in the app) and **the backdrop
  `bg-black/80`** (REF's overlay is rgba(0,0,0,0.8); the shadcn
  default /50 was a 30-point never-audited gap the verification
  screenshots caught).
- **R34-D the deep-RTL find (the headline)**: REF's desktop sidebar
  does NOT mirror in عربي mode. Its architecture = an in-flow
  TRANSPARENT peer spacer (mirrors with dir) + a FIXED painting panel
  (left:0/right:1184 — never flips; internals mirror via the cascading
  dir). REF's RTL: panel at x=0..256 over the main area's start edge,
  main 0..1184, transparent gap at 1184..1440. The round-32 "RTL
  mirror matches" verification had measured the PEER (which mirrors) —
  the aside-selector artifact's desktop twin. The clone now ships
  REF's exact architecture (LTR verified visually unchanged). **Plus
  the surface correction**: REF's visible sidebar = the inner
  `bg-sidebar` div (#FAFAFA light, pixel-verified; #18181b dark,
  computed — NOT slate-900) — the round-32 "authored bg-white" pin had
  measured the COVERED container; the aside now uses the token, the
  same surface as the drawer.
- **R34-E /payrollreports tabs wired (the superset)**: REF's triggers
  are still inert (re-verified) — the clone's four tabs now render
  real aggregates on controlled state: Tax & Deductions (per-employee
  breakdown + effective rate), History (the periods table), Custom
  (from/to + employee + Generate). The at-rest Monthly DOM is
  byte-identical (pinned).
- **THE v4 TRAPS (new, session 35)**: (1) the inline-label gap
  collapse was silently affecting BOTH dialogs — REF's v3 space-y-2
  renders 12px label→control, the clone's 4px; compensated with
  explicit `mt-2` on every control (the session-34 recipe at dialog
  scale). (2) **The Radix native-select last-child trap**: Radix's
  hidden `<select>` renders AFTER the trigger, so v4's
  `:not(:last-child)` puts the space-y mb on the TRIGGER — a phantom
  8px inside every Select wrapper (REF's v3 `* + *` never did).
  Select-ending wrappers DROP space-y; the mt-2 carries the gap alone.
- **Pins**: 14 new (the session-35 block: A1-3, B1-2, C1-3, D1-2,
  E1-4) + the R32-A4/R30-era aside pins evolved to the token surface.
  Gates: lint 0/0 · tsc ✓ · **521/521 unit (+14)** · build ✓ ·
  **142/142 E2E (+7: the payrollreports-tabs spec + the
  dialog-interiors spec)**.
  Live-verified: both dialogs byte-identical element-by-element (the
  asset box 512×372 y-for-y; the loans ±1px); the overlay 1 unit; the
  RTL pair surfaces identical (2-4% text-boundary noise); the dark
  sidebar #18181b both apps; the mobile chrome + navmap byte-identical
  (drawer 288@x0 / header 73h / tabs 766y+78h; nav y-positions exact);
  the wizard empty-submit + the loans/asset required matrices match.
  11 new screenshots (121 the RTL pair, 122/123 the dialog pairs,
  124-126 the tabs, 127 the dark sidebar pair) → 156 PNG captures. DB
  pristine.

## Session 36 (parity round 35) — THE RE-MEASURE: THE CENSUS'S BLIND SPOTS + THE PREFETCH-LOGOUT BUG

**Scope**: the round's live verification found what the census missed —
the user menu's fixed width, the settings header actions, two never-built
dialogs, the Quick Presets, the Logs island, the 404 vertical recipe, and
a self-logout bug the whole test pyramid had sailed over.

- **The w-48 amendment (R35-A)**: REF's user menu is a FIXED `w-48`
  (192px), not content-sized — the initial build rendered 128. The items
  are `CircleUser` + `LogOut`, both `mr-2` ON TOP of the item's `gap-2`
  → 16px icon-to-text (60→92, measured on both items). The enter
  animation (zoom-in-95) races geometry reads — poll to ≥190 before
  measuring (the 191/190 failures were the transform's tail, not the
  width).
- **THE PREFETCH-LOGOUT BUG (R35-A amendment)**: the Logout item was
  first built as a `<Link href="/logout">` — Next PREFETCHES Link
  targets when they mount, the prefetch GETs the /logout ROUTE HANDLER,
  and its GET clears the session cookie. The menu logged the user out
  the moment it OPENED. Found live (the browser session died after
  every user-menu measurement); the E2E never caught it because no spec
  navigated afterward. Fix: a real `<button>` + `window.location.href`.
  Regression guard: user-menu.spec's navigate-after-open test + pin A6.
- **The R35-F family (the census's blind spots, all live-measured)**:
  (F1/F4/F10) the four settings header actions are the DARK SOLID
  (bg rgb(23,23,23) + white + icon) — the clone had the blue gradient
  CTA on all four; (F2) the Create Approval Workflow dialog — max-w-3xl,
  the five Type options (Leave/Expense/Loan/Payroll/Recruitment — the
  API's APPLIES_TO extended), Approval Levels + Add Level (outline
  size-sm) + level cards (H4 + Trash2 red-600 remove + the three
  measured placeholders + Mandatory); (F5/F6) the Add Shift dialog —
  max-w-lg, the seven fields ("e.g., M, E, N" / "0" placeholders), the
  Shift model's code/breakMinutes/toleranceMinutes columns, and the
  shape-discriminated POST /api/shifts (employeeId = assignment, else
  definition — the body is read ONCE: a fetch Request's stream is
  single-use); (F7) Save Theme = dark solid + the lucide-save mr-2 icon
  (151×36; the clone's gradient was 119); (F8) the Quick Presets —
  three outline cards (h-auto p-4 flex-col items-start gap-2, 346×86,
  three w-6 h-6 rounded swatches; Facebook #1877f2/#42b72a/#e4e6eb,
  Professional Blue #3b82f6/#6366f1/#e0e7ff, Fresh Green
  #10b981/#059669/#d1fae5), click populates the color fields; (F9) the
  Logs filter island — mb-6 p-4 bg-slate-50 rounded-lg space-y-4 wraps
  the grid + Clear Filters (the wrapper's p-4 gives REF's 195px columns
  — the clone's bare grid rendered 201); (F11) the 404 wrapper —
  min-h-screen + p-6 + the slate-50 page background (content centers at
  y=306 of 900; the clone's 70vh-min + 160px bottom padding centered at
  226 — an 80px offset); (F12) Go Home carries the 16px Home icon
  (123×38 with it, 99 without); (F13) the Logs empty carries the 48px
  FileText slate-300 icon (the census had recorded "no icon").
- **The auth-sessions.mjs quoting fix**: the demo password starts with
  `$` — double quotes in the shell expanded it to an empty string (both
  password boxes filled as ""). Single-quote the fill values.
- **Pins**: 24 new this round (A1-6, B1-2, C1-3, D1-4, E1-7, F1-13 —
  minus overlaps: the R35-E block from the first pass + the A5/A6/F
  amendments). Gates: lint 0/0 · tsc ✓ · **556/556 unit** · build ✓ ·
  **157/157 E2E** (+15: user-menu ×2, not-found ×2, settings-tabs ×10,
  compliance-filters — see the spec files).
  Live: **11/12 pair MATCH** (user menu, compliance select, all six
  settings tabs, mobile chrome, bell popover, login stack) + the 404
  pair identical except Go Home = the clone's real `<a>` (REF renders a
  JS button — the navigation superset, geometry 123×38 equal). 16 new
  screenshots (128-135, ref+loc pairs) → 172 PNG captures. DB pristine
  (the E2E probes clean up after themselves).

## Session 37 (parity round 36) — THE FORM-CONTRACT FAMILY: the empty-submit probe

**Scope**: round 35 named the frontier ("form-error surfaces on the new
dialogs"); the probe that opened it — empty-submit every dialog on REF
and read the DOM — found something bigger than error text: REF's dialogs
are real `<form>` documents with NATIVE validation, and the round-35
rebuilds (built from geometry-only census data) shipped button-driven
dialogs with invented inline-error Ps.

- **The empty-submit probe (the round's method)**: click Create with
  empty fields on REF → the dialog STAYS OPEN, no DOM error text, focus
  jumps to the Name input — the browser's native `required` tooltip.
  REF's contract on every dialog: DialogContent > (header, outside) +
  (`<form class="space-y-4">` wrapping fields AND footer); required on
  the primary fields; Cancel/Add Level etc. explicit `type="button"`;
  Create `type="submit"`. An untyped `<button>` reports `type:"submit"`
  in the DOM and submits the form it sits in — REF sets type="button"
  explicitly on the non-primary actions. Radix renders its hidden
  native `<select>` only when the Select participates in a form — its
  absence on the clone was the missing-form symptom, not a Select
  recipe drift.
- **R36-A (the two settings dialogs)**: the Create Approval Workflow +
  Add Shift dialogs converted to the form architecture (the invented
  "Workflow/Shift name is required" inline Ps deleted — API failures
  now surface via the page's toast pattern, the superset). Add Shift's
  content diffs: Name/Start/End carry required, **Break defaults 60 and
  Tolerance defaults 0** (the clone shipped empty strings), and the
  Status row rides INSIDE the grid as the 7th cell (223px column + the
  w-full trigger — the clone's hard-pinned w-[223px] full-width row
  rendered the same but was the wrong recipe).
- **R36-B (the Add Department rebuild)**: the dialog interior had never
  been re-measured since its invention (round 35 took the tab body
  only). REF: max-w-lg (512×372), three stacked space-y-2 fields —
  **"Department Name \*"** (required, ph "e.g., Human Resources"),
  **Description** (ph "Brief description"), **Manager Email**
  (type=email, ph "manager@company.com") — footer flex justify-end
  gap-3 with Cancel + **Create** (the clone's submit said "Add
  Department"). The clone's Name+Code pair ("Sales"/"SLS"), max-w-md,
  and bg-card inputs were all invented. The Department model + the
  departments API gained description/managerEmail columns (db:push;
  code stays in the API for compat — the wizard still reads it).
- **R36-C (the asset dialog's text layer)**: the round-34 interior
  audit measured geometry, not placeholder text — REF's Name ph is
  "e.g., Macbook Air 2024" (clone: "e.g. MacBook Pro 16\""), the
  Serial ph is EMPTY (clone: "Optional"), the option reads "Not
  assigned" (clone: "Not Assigned"). The loans dialog re-probed CLEAN —
  the round-34 loans rebuild was complete.
- **THE v4 INLINE-LABEL RE-FIRE (the mt-2 amendment)**: the rebuilt
  dialogs initially rendered the label→input gap at 4px vs REF's 12
  (the departments dialog measured 348 vs REF's 372 — exactly 3×8px).
  The verified asset-dialog recipe applied to all three: Input cells =
  space-y-2 wrapper + `className="mt-2"` on the Input; Select cells =
  BARE div (no space-y — the Radix native-select last-child trap) +
  `className="mt-2"` on the trigger. Both recipes measure 12px on REF.
- **The E2E flake cascade (three races, all live-debugged)**: (1) the
  Add Department post-create assertion `getByText("E2E Probe
  Department")` resolved to BOTH the list row AND the toast's
  description ("…is ready.") — a strict-mode violation that raced the
  toast's auto-dismiss; on failure the cleanup never ran and the
  leftover broke the NEXT run's empty-recipes spec (the cascade). Fix:
  `{ exact: true }` + a describe-level pre-clean + an ASSERTED cleanup
  (the fire-and-forget delete had failed silently once). (2) 511 vs
  512 — the zoom-in-95 enter animation's tail again (the round-35
  precedent: ±1 tolerance). (3) the Logs test read mid-load
  (hasEmptyLine=false, rowCount=0 — the counter renders before the
  list settles): an expect.poll to the settled state, then one read.
- **The verify-r36 script lessons (two)**: (1) multi-line evals through
  execSync + JSON.stringify leave literal `\n` sequences that break
  the CLI's JS parser — EVERY multi-line record before the fix was a
  VACUOUS MATCH (both sides ERR → undefined === undefined). Flatten
  newlines before stringify. (2) The round-35 `ref=` regex bug
  re-introduced: `\[ref=` never matches `[expanded=false, ref=e…]`
  attribute lines — REF's dialog triggers carry aria-expanded, so
  every REF-side dialog click silently no-opped. `ref=(\w+)\]` without
  the bracket requirement (the verify-r35 fix, re-applied).
- **Pins**: 13 new (A1-A6, B1-B4, C1-C3). Gates: lint 0/0 · tsc ✓ ·
  **569/569 unit** · build ✓ · **158/158 E2E** (+1: the Add
  Department dialog spec with the pre-clean/asserted-cleanup pattern;
  the workflow/shift specs gained the native-validation + defaults
  assertions). Live: **22/22 pair MATCH** (verify-r36.mjs — the form
  contracts, required attrs, defaults, button types, placeholders, the
  status trigger, the department 512×372, the asset text layer) + the
  empty-submit pair (both keep the dialog open, focus on Name) + the
  standing audits (mobile nav/drawer byte-identical, navmap 13-item
  byte-identical, bell 384×175 identical, Quick Actions
  geometry-identical). No redeploy (login static build + app chunks
  all unchanged); REF still zero-data. 8 new screenshots (136-139,
  ref+loc pairs) → **180 PNG captures**. DB pristine.

## Session 38 (parity round 37) — THE KEYBOARD/FOCUS DIMENSION: the DialogTrigger family

**Scope**: round 36 named the frontier ("audit keyboard/focus flows —
Tab order in dialogs"). The census: open each dialog on both apps,
record activeElement after open, Tab ×10 reading focus each press, then
Escape and read the restore target.

- **The green half (recorded)**: Tab orders are structurally IDENTICAL
  on all five parity dialogs (initial focus = the first tabbable; the
  sequence follows the DOM: fields → footer → the Close X → wrap; the
  time inputs cycle their internal segments identically — native
  browser behavior). The staffrequests "New Request" trigger on REF is
  a plain type=submit with NO dialog semantics — the clone's plain
  trigger there is correct parity, deliberately outside the conversion.
- **R37-A — the DialogTrigger conversion (the round's core)**: REF's
  triggers on /assets, /loans and the three /settings tabs are Radix
  DialogTriggers — live-measured `aria-expanded="false"` +
  `aria-haspopup="dialog"` + `aria-controls="radix-:…:"` + type=button
  — and on close focus RETURNS TO THE TRIGGER. The clone's five plain
  `<Button onClick={setOpen}>` triggers dropped focus to BODY. Root
  cause (read from the installed @radix-ui/react-dialog 1.2.0):
  `DialogContentModal`'s `onCloseAutoFocus` focuses
  `context.triggerRef.current` — null without a DialogTrigger — and
  its `event.preventDefault()` ALSO suppresses the FocusScope's
  fallback (`focus(previouslyFocusedElement)`). The fix: the
  Radix-native `<DialogTrigger asChild>` at all five sites — which
  REQUIRES the mechanical root-lift (the trigger must sit inside its
  Dialog root's context, and all five roots wrapped only the Content):
  the `<Dialog open onOpenChange>` wrapper moves up to enclose the
  trigger region + dialog component (renders no DOM — layout
  untouched); the dialog components drop their own roots and render
  bare `<DialogContent>`. The Button sets no `type`, so the trigger's
  type="button" survives the Slot merge (REF's measured type).
- **R37-B**: the asset dialog's submit was `disabled={saving ||
  !form.name.trim()}` — a disabled button leaves the Tab order and
  deadens the empty-submit; REF keeps it enabled (native validation
  fires). Now `disabled={saving}` only.
- **R37-C**: REF's interior Add Level = 113×32 (`w-4 h-4 mr-1` — the
  session-35 census documented 113 but never pinned it); the clone's
  mr-2 measured 117 and shifted the dialog's right-edge stack (Cancel
  x 911 vs 907). One-class fix. E2E pins a 110–115 window: headless
  Chromium rasterizes the text ~2px narrower than the paired browser
  (the tolerance precedent).
- **R37-D — the loans text/contract layer** (the round-36 lesson
  repeated: geometry audits miss text): the Reason textarea is
  `required` on REF with the placeholder "Hi, I'm buying an apartment
  and I need a loan for the down payment." (the clone's "e.g. Family
  relocation…" was invented); the Amount input DEFAULTS to "0"; the
  Paid From input PREFILLS "New Era LLC" (stable across re-opens — a
  hardcoded form default in REF's code; REF's own company is "Demo",
  so the literal is not company-driven); REF's number inputs carry NO
  min/max/step (required only — the clone's invented constraints
  changed the native validation surface; the API's Zod + toast is the
  enforced superset); the silent-return client guard
  (`amount <= 0 → return`) is the round-36 anti-pattern — with the "0"
  prefill an immediate submit now flows to the API and toasts.
- **R37-E — the SelectTrigger placeholder-state color (the addendum)**:
  the screenshot pixel-diff (3.73% vs the ~1.1% baseline) traced to two
  finds. REF renders a trigger in its PLACEHOLDER state (Radix's
  `data-placeholder`, already set on every trigger) in neutral-500
  rgb(115,115,115) — valued triggers stay dark; dark mode flips the
  placeholder to #a3a3a3 (neutral-400). NOT the muted-foreground token
  (slate-500 #64748b — a different REF gray). The systemic fix rides
  the trigger recipe: `data-[placeholder]:text-neutral-500
  dark:data-[placeholder]:text-neutral-400` in ui/select.tsx.
- **R37-F — the loans Requesting-for card's border**: REF's card is
  `p-4 bg-blue-50 rounded-lg border border-blue-200` (1px
  rgb(191,219,254), unchanged in dark); the clone's borderless card
  was 2px short — the 698-vs-696 dialog height that shifted the whole
  interior 1px (dlgY 102 vs 101). After the fix the pair measured
  byte-identical and the pixel-diff dropped to 1.41% (baseline band).
- **The probe lessons (three)**: (1) a 220ms inter-press settle is too
  fast for Tab-sequence reads — a "skipped Cancel" artifact that a
  300ms manual trace disproved (ground truth: Cancel IS tabbable; only
  the DISABLED submit is skipped); 300ms+ is the floor. (2) the drawer
  probe needs an explicit closed-state reset (Escape + wait) — a second
  run through an already-open drawer CLOSES it and reads the mid-exit
  frame (the x=-244 artifact). (3) NO `//` comments inside flattened
  evals — a flattened `//` swallows the closing `})()` (the round-36
  newline lesson's inverse); and property-based reads (`i.type`)
  over CSS attribute selectors (`[type=text]`) — REF's paid-from input
  carries no explicit type attribute.
- **The E2E races fixed en route**: the legacy-assets toast-name
  strict-mode violation (getByText matched the row AND the toast
  description — the round-36 class re-fired under the longer suite;
  exact:true, with the serial left non-exact since it rides inside
  "Desktop · R30-SN-001") and the loans initial-focus assertion
  (assert focus-inside-dialog via poll, not the first input — the
  loans dialog's first tabbable is the Employee combobox).
- **Pins**: 13 new (A1-A5, B1, C1, D1-D4, E1, F1; three earlier pins
  amended — R35-F10 and R22-C3 for the new markup, the D-block pins
  recalibrated for comments-in-source). Gates: lint 0/0 · tsc ✓ ·
  **582/582 unit** · build ✓ · **165/165 E2E** (+7: the five
  focus-restore pairs, the trigger aria contract, the asset at-rest
  enabled submit, the loans text layer, the Add Level window). Live:
  **13/13 pair MATCH** (verify-r37.mjs — the restore targets, the
  focused-after-open, the loans text layer, the asset submit, the Add
  Level geometry) + the standing audits (mobile tabs byte-identical;
  the drawer pair manually re-verified after a transient click — 288px
  @ x=0, #FAFAFA, 1px #e5e5e5; navmap, bell, quick actions). No
  redeploy (login static build + app chunks all unchanged); REF still
  zero-data. 8 new screenshots (140-143, ref+loc pairs) → **188 PNG
  captures**. DB pristine.

## Session 39 (parity round 38) — THE LOGIN REDEPLOY RE-AUDIT: the mobile-viewport dimension

**Scope**: REF's /login static JS chunk changed (index-CneaUv24.js →
index-BYE5Ojxh.js) while every other build fingerprint held — the login
page re-audited end to end, at 1440×900 AND (for the first time ever)
390×844. The desktop geometry was already byte-identical; every finding
was a recipe, mobile-viewport, or DOM-structure diff.

- **R38-A — the responsive input family**: REF's login inputs are
  `h-11 sm:h-12` (44px mobile / 48px ≥640px) with `text-base
  md:text-sm` (16px mobile / 14px ≥768px); the Sign in button is
  `h-11 sm:h-12`. The clone's flat h-12/text-sm rendered 48px/14px at
  mobile. Applied at the PAGE level (the shared Input base is untouched
  — the app pages keep their pinned recipes; tailwind-merge dedups
  h-9→h-11, text-sm→text-base).
- **R38-B — the placeholder color**: `placeholder:text-slate-600`
  (rgb(71,85,105)) — NOT the base's muted-foreground slate-500.
- **R38-C — the two-build palette lesson**: REF's login inputs compute
  zinc-950 rgb(9,9,11) — the login static build's --card-foreground is
  the ZINC palette while the app build's is neutral-950 #0A0A0A. The
  clone's login card pins `text-[#09090b]` literally (putting it on the
  root main is NOT enough — the card's own text-card-foreground overrides
  inheritance; the E2E caught the first attempt).
- **R38-D — the sm:hidden spacer**: REF renders
  `div.mt-8.text-center.text-xs.text-slate-400.sm:hidden > p:&nbsp;`
  below the card — invisible but layout-affecting: the card pins to y=16
  and the mobile page scrolls 18px (862 vs 844). Cloned.
- **R38-E — the Sign in recipes**: inline-flex, gap-1, whitespace-nowrap,
  px-3 py-2 (not px-4), transition-all duration-200 (not 150ms
  colors-only — the motion dimension).
- **R38-F — the social family + the per-button wrapper**: type=submit ×3
  (inert — outside the form), text-[16px], group, span-wrapped labels,
  and the icon divs `transition-transform duration-200` — **ONLY Google's
  carries -ml-4** (live-measured: Google div x=84.8 with ml=-16;
  Microsoft/Apple have no pull and sit at 84.6/98.2 on their own text
  widths). A uniform -ml-4 mis-places Microsoft by 8px (the negative
  margin shrinks the flex sum → more free space → the border box lands
  16px left of the margin box). The group/transition-transform members
  are inert (no hover trigger — verified).
- **R38-G/H/I**: the canvas root is a `<main>` (the clone's was a div);
  the title block is shrink-to-fit (NO w-full — blockW 317); the login
  inputs' `shadow-none` remnant deleted (computed "none" parity — the
  Input base sets no at-rest shadow).
- **R38-J — the links row (the round's most visible mobile find)**:
  `flex flex-col sm:flex-row items-center justify-between gap-2
  sm:gap-0` — the links STACK at mobile. The clone's flat row made the
  two buttons' intrinsic widths (118+176=294) exactly fill the 294px row
  → flex-shrink wrapped BOTH labels to two lines (h=40 each). Plus:
  Forgot carries font-medium + transition-colors; the Sign up span is
  `font-medium text-slate-700`.
- **R38-K — the or-divider**: REF's continuous-line pattern — an absolute
  full-width 1px slate-200 line with the centered "or" chip
  (`bg-white px-3 text-slate-500 font-medium tracking-wider`) on top, NOT
  two line segments (and the "or" is slate-500, not slate-400).
- **R38-L — the logo family**: the `relative group` wrapper + the glow
  layer (`absolute inset-0` slate-200→300 gradient, `rounded-full
  blur-xl opacity-30 group-hover:opacity-40 transition-opacity
  duration-300`) + the circle as a SPAN with `group-hover:shadow-xl` +
  alt="Eon HR logo".
- **R38-M — the icon glyphs (the pixel-diff addendum)**: the clone's
  Microsoft icon shipped viewBox 0 0 23 23 (REF: 24 24) and a different
  Apple glyph — both replaced with REF's exact paths.
- **Kept supersets (documented)**: the autoComplete attrs
  (email/current-password — REF has none), the focus-visible:ring-slate-400
  variant (the R18-E lesson), the role=separator on the divider.
- **The probe lessons**: (1) **the stale-:3200-server trap** — after
  `bun run build`, a running standalone server keeps serving the OLD
  manifest's chunk hashes; the rebuilt CSS 500s ("Internal Server Error"
  as the body) and the page renders UNSTYLED while the HTML liveness
  check still passes — kill the :3200 process after EVERY rebuild. (2)
  The login at mobile was a never-probed viewport — 37 rounds of
  desktop-only auditing had missed an entire responsive dimension. (3)
  The comments-in-source regex inflation (round-37's lesson): reword the
  comment, don't recalibrate the count.
- **Pins**: 16 new (G1, A1-A2, B1, C1-via-E2E, D1, E1, F1-F2, I1, J1-J2,
  K1, L1-L2, H1, M1; three earlier pins amended — R18-E/R19-H anchors,
  the E2E img name). Gates: lint 0/0 · tsc ✓ · **598/598 unit** ·
  build ✓ · **167/167 E2E** (+2). Live: the desktop pair MATCH (the
  four documented non-gaps aside); the mobile pair byte-identical (email
  y=516 h=44 font 16px, card y=16, scrollHeight 862, icon x 85/85/98,
  links y=718/746 h=20); the standing audits 5/5. Pixel-diffs: desktop
  0.84% (below baseline), mobile 3.27% (REF's builder badge — the
  documented non-clone — plus font AA). 8 screenshots (144-147) →
  **196 PNG captures**. DB pristine.

## Session 40 — parity round 39 (the shell restructure + the input migration + the careers org view)

REF's login JS chunk redeployed twice more since round 38 (`BYE5Ojxh` →
`Cqb_n9sO` → `BIuE7r17`; the login CSS and both app chunks unchanged),
and the round's census opened three fronts at once. All recipes below
live-measured on both apps (docs/remediation-plan-session40.md).

**Front 1 — the login re-audit**: the social buttons DROPPED
`type="submit"` (REF renders no type — the attribute was inert outside
the form); and the login proved **THEME-INERT** (the round-38 frontier):
with `darkMode="true"` armed, REF's login preserves the key but never
applies `html.dark` (or `dir=rtl`) — the login build ships no theme
boot. The clone's THEME_BOOT now returns early on `/login`; the app
pages still boot from the same keys after sign-in (verified live both
sides). The login inputs keep the pre-migration family via explicit
counters (`shadow-none transition-none ring-offset-background
focus-visible:ring-2 focus-visible:ring-offset-2`) — REF's login build
did not pick up the app-side base migration (the two-build split).

**Front 2 — the global Input/Textarea/Select migration** (a silent
post-round-19 redeploy, caught by re-measuring the loans dialog): the
v4 shadcn family — `bg-transparent` (was bg-card), `text-base
md:text-sm` (16px mobile — the never-probed mobile-font dimension),
at-rest `shadow-sm`, focus `ring-1` offset-0 (was ring-2 + offset-2),
`file:text-foreground`; the Textarea `min-h-[60px]` (was 80); the
SelectTrigger gains `shadow-sm` + `ring-offset-background` + the
`focus:` prefix. Page-level overrides recalibrated: careers hero input
(`pl-12 py-6 text-lg bg-white`, h=50) and tenantsetup (drop the stale
h-11s).

**Front 3 — the app-shell restructure** (REF's shadcn Sidebar
architecture, the round's structural core): unclassed root div >
`group/sidebar-wrapper` (inline `--sidebar-width: 16rem;
--sidebar-width-icon: 3rem`) > the canvas (+ inert `safe-area-inset`);
the sidebar is a `div.group.peer.hidden.text-sidebar-foreground.md:block`
(NOT an aside — REF authors no aria-hidden anywhere) wrapping the RTL
peer spacer + the fixed panel (`bg-white dark:bg-slate-900` container,
inner `data-sidebar="sidebar"` div painting the bg-sidebar token); the
mobile header lives INSIDE main (REF's exact string + inert
`safe-area-top`); ALL page content rides a `flex-1 overflow-auto` scroll
container (the document itself no longer scrolls the page); the bottom
nav is the canvas's child (`md:hidden fixed bottom-0 left-0 right-0 …
safe-area-bottom z-50`, explicit left/right). The toggle adopts REF's
v4 Button family + `data-sidebar="trigger"` + the sr-only name span
(the clone keeps aria-label/type/aria-expanded — the documented a11y
superset). The brand block nests (flex-col gap-2 outer > flex
items-center gap-3 row > `flex-1 min-w-0` text container — stretches to
155px — with the h2 + a truncate `p` sub). The print superset follows:
the escaped `.group\/sidebar-wrapper` selector hides the sidebar subtree
and `main > div { overflow: visible }` un-clips the scroller for print.

**Careers** (the with-data surface, finally measurable — REF's public
board carries 517 cross-tenant company chips): the chips are the v4
Button outline family (`h-auto py-3 px-4`, h=46) in a `flex gap-3
flex-wrap`; a count h3 ("N Open Position(s)", text-xl font-semibold)
rides between the section and the grid; and the chips NAVIGATE —
`/careers?org=<slug>` renders the org view (the back button, the
org-name h2 text-3xl, the filtered count). The clone's org state is
URL-driven via useSearchParams (the (app) layout is dynamic — cookies —
so no Suspense boundary).

**The round's engineering lessons**:
- **`w-[--sidebar-width]` does NOT compile under v4** — the v3-era
  bracket form generates the invalid raw `width:--sidebar-width` (no
  var() wrapper); REF's own CSS ships `width:var(--sidebar-width)`.
  The v4 parenthesis form `w-(--sidebar-width)` generates the identical
  output. Rendering parity over class-string parity when the two
  diverge (the gradient-arbitrary-value precedent).
- **v4's automatic content detection scans docs/*.md** — the
  remediation plans' recipe quotes (bracket class strings) generated
  dead CSS rules; `@source not "../../docs"` in globals.css keeps the
  emitted CSS clean.
- **The scroll container changed the scrolling element** — E2E specs
  reaching into `main`'s children or relying on body scroll needed
  re-scoping (five specs + the orphan-routes emptiness check); the
  print block needed the overflow reset.
- **The v4/v3 shadow-slot serialization non-gap**: v4 composes
  5 shadow slots (all transparent at rest) vs REF's v3-era 3 — the
  rendered result is identical (at-rest shadow-sm, focus 1px ring +
  shadow-sm); only the serialized string differs (the lab()/rgba()
  category).
- **REF-side bug documented, not cloned**: REF's /loans dialog crashes
  to a blank page at mobile 390 (works at desktop) — the /Dashboard
  case precedent.

**Pins**: 21 new (A1, B1, C1, D1, E1, F1, H1-O1, P1, Q1, R1, S1, U1,
V1, W1) + 12 predecessors amended (R18-B/D/F, R19-J, R30-A1, R32-A4,
R33-E2, R34-D1/D2, R38-F1, R38-I1, the brand-header pin, R6-A in
shell-recipes). Gates: lint 0/0 · tsc ✓ · **619/619 unit** (+21) ·
build ✓ · **174/174 E2E** (+7). Live: verify-r39.mjs 4/7 raw MATCH —
the 3 diffs are the documented non-gaps (the shadow-none
transparent-zeros string, the v4 shadow-slot serialization, REF's
cross-tenant careers data vs the clone's empty tenant); the shell tree
pair byte-identical (peer/scroller/header/surface); the standing audits
5/5; tenantsetup mobile byte-identical (card x=16 w=358, input 36). 16
screenshots (148-155) → **212 PNG captures**. DB pristine.

## Session 41 — parity round 40 (the careers family + the login button members)

REF's login redeployed a FOURTH consecutive time — and for the first
since round 35 the CSS changed too (JS `BIuE7r17` → `C-ulo5ek`; CSS
`D0Q6-tUz` → `BIWjBcok`; the app chunks unchanged). The CSS delta is
platform font-face infrastructure (Wix Madefor, Dazzed, Azeret Mono —
the `.font-base44` utility's family) UNUSED by the Eon HR login: every
login recipe re-measured byte-identical at desktop AND mobile (card
x=16 y=16 w=358, docH 862, email h=44/16px, icons 85/85/98, links
y=718/746); theme-inert re-verified. **The toaster frontier resolved**:
REF's one fireable notification — the failed-login error — renders a
shadcn Alert (role=alert, bg-red-50/70 border-red-200 rounded-xl, the
red-700 description) INSIDE the form, and the clone's is byte-identical
(class + rect x=536 y=738 w=368 h=54 + parent).

**The round's core — the careers mobile pixel-diff** (round-39's
deferred frontier): the hero geometry was byte-identical but the pair
diffed 25.41%. The forensics decomposed it into the round's findings
(docs/remediation-plan-session41.md):

- **R40-A — the login Sign in button's base members**: REF's carries
  the login build's `ring-offset-background` + the `[&_svg]` guards
  (inert at rest; the ring stays the zinc-950 literal per the two-build
  split). Added for DOM class parity.
- **R40-B — the board content wrapper**: `max-w-6xl mx-auto px-4
  py-12` on BOTH views (the clone's `p-4 md:p-8` started the content
  32px high at mobile — a round-39 miss).
- **R40-C — the zero-card family** (careers + external share it): the
  Card carries `text-center py-12` itself (shadow from the base, the
  DEFAULT border rgb(229,229,229) — no slate-200 override), the bare
  `p-6 pt-0` CardContent, the briefcase `w-16 h-16 text-slate-300
  mx-auto mb-4` (w-first), the h3 `…mb-2`, the `text-slate-600` line —
  and the message is STATE-DEPENDENT: "Check back later for new
  opportunities!" (the empty board AND the org view, both measured) vs
  "No jobs match your search. Try different keywords." (the
  search-filtered zero).
- **R40-D — the count heading row**: `mb-4 flex items-center
  justify-between` (a flex row ready for a right-side element), shared
  by the board and the org view.
- **R40-E — the job card** (REF's first measurable with-data card):
  Card `shadow hover:shadow-lg transition-shadow` (no slate border);
  the CardHeader's title row (`flex items-start justify-between mb-3`)
  with the left block (`flex items-center gap-3` > the title div
  `font-semibold tracking-tight text-xl` + the company `p.text-sm
  text-slate-600`) and the right **Open badge — a DIV** (hand-rolled to
  REF's full string: rounded-md border px-2.5 py-0.5 text-xs
  font-semibold + focus rings + border-transparent + shadow +
  hover:bg-primary/80 + bg-green-100 text-green-700); the meta stack
  `space-y-2 text-sm text-slate-600` with FOUR icon rows (building2 /
  map-pin / clock — the type LOWERCASE — / dollar-sign salary);
  CardContent `p-6 pt-4` with the description `line-clamp-3 mb-4` and
  the full-width "View Details & Apply" gradient CTA.
- **R40-F — the apply flow**: the CTA navigates to
  `/externaljobapplication?org=<company-slug>&job=<title-slug>`
  (REF's capitalized-path artifact aside). REF's own target renders its
  zero-state for the params — the clone's superset RESOLVES them (the
  external page slug-filters its list; no match keeps the zero-state).
- **R40-G — the org view structure**: the `div.mb-8` wraps the back
  button (ghost + mb-4) + the org h2; the count row + list follow
  unwrapped.
- **R40-H — the model**: JobPosting + `company` + `salaryRange`
  (nullable, additive; the jobs API's JobInput gains both). The chips
  are built from `j.company` — REF's chips are COMPANIES (the clone's
department-based chips were semantically wrong).
- **R40-I — the external page**: the wrapper `max-w-6xl mx-auto` (no
  space-y-12) + the header `text-center mb-12` with the h1 `mb-3` +
  the card joining the R40-C family.

**The hero pixel-diff closure**: after the fixes the residual is
REF's DATA-DRIVEN horizontal overflow — a long whitespace-nowrap
company chip forces its canvas to 569px at a 390 viewport, stretching
the banner gradient (live-confirmed: REF's banner w=569 vs the clone's
390, same sRGB endpoints); the clone with equivalent data behaves
identically (the same flex semantics). The count-row rhythm rows
(480-520) collapsed to zero post-fix.

**Pins**: 17 new (A1, B1, C1-C2, D1, E1-E5, F1, G1, H1-H2, I1-I3) +
1 amended (R31-C3's icon order `w-16 h-16`). Gates: lint 0/0 · tsc ✓ ·
**636/636 unit** (+17) · build ✓ · **180/180 E2E** (+6; the workflow
Add-Level width hit its documented tolerance flake once, stable on
re-run). Live: verify-r40.mjs 3/6 raw MATCH — the 3 diffs documented
(the trap-3 gradient class-string, the org-view data + cursor-pointer
superset, the external superset resolving the seeded job); the
zero-card family + the board + the login members MATCH; the standing
audits 5/5; 8 screenshots (156-159) → **220 PNG captures**. DB
pristine (users=1, employees=1, leaveBalances=2).

## Session 42 — parity round 41 (the footer focus family + the native select)

The redeploy watch went QUIET for the first time in five rounds (all
four fingerprints unchanged), so the frontier came from the session-38
named remainder: **the keyboard/focus flows in the popovers/menus** —
round 37 walked the dialogs; the menu family never. The instrument
(open → initial focus → Tab/Arrow sequence → Escape → restore, both
apps) found the bell Popover and the user DropdownMenu structurally
IDENTICAL (the bell's content renders `div role=dialog` 384×175 @
(0,617), focus lands on the content and stays trapped through Tab ×8,
Escape restores the trigger; the menu's ArrowDown/Up/Home/End walk and
the restore match). The whole-shell Tab sweep verified every sidebar
element renders the IDENTICAL blue-500 ring both sides — and exposed
the round's findings on the surfaces BEYOND the sidebar
(docs/remediation-plan-session42.md):

- **R41-A — the footer ghost family's v4 Button base**: REF's bell /
  moon / عربي / user-trigger carry the full base string; the clone's
  hand-rolled twins rendered the BROWSER-DEFAULT outline under
  keyboard focus (REF rings `rgb(10,10,10) 0 0 0 1px`). All four
  adopted verbatim — the bell gains `relative` (the unread-badge
  context), the moon `select-none`, عربي the outline-variant string,
  the trigger the disabled/svg guards.
- **R41-B — the moon's conditional glyph**: REF renders ONE
  state-driven svg (moon in light / sun in dark, no color class — the
  color INHERITS the sidebar-foreground token); the clone's two-svg
  dark-hidden pair switched to the conditional render.
- **R41-T — the sidebar-foreground token fix**: the clone's light value
  was the app-foreground slate-800 `hsl(221 39% 11%)`; REF's is the
  shadcn zinc-700 `240 5.3% 26.1%` (the moon's inheritance renders
  #3F3F46 / #F4F4F5 — measured both themes both apps).
- **R41-C — the user-menu items are plain Radix divs on REF** (182px
  full-row stretch); the clone's asChild-wrapped a/button surfaced
  their tags and the Logout button SHRANK to 96px (the highlight pill
  covered half the row). Plain items now; My Profile navigates via
  onSelect + router.push, Logout keeps the anti-prefetch location.href
  (the R35-A6 contract — the handler, not the tag).
- **R41-D — the employees filter row** (four independent gaps): the
  search FIXED at `md:w-64` (256px — REF re-measured 256 at 1440 AND
  768; the r17 flex-initial/max-w-64 arrangement silently rendered 228
  after the round-39 input migration, leaving the select at x=541 vs
  REF's 569); the select DEFAULTS to "active" (three fresh loads); the
  select's bg is the UA `buttonface` (**a Tailwind v4 engine trap**:
  v4's preflight resets native select backgrounds to transparent,
  v3/REF keeps the OS gray rgb(239,239,239) — restored via
  `bg-[buttonface]`, the system keyword tracks the browser theme); the
  focus recipe `focus:ring-2 focus:ring-blue-500` (2px blue-500 — not
  the token ring-1) + REF's authored order (py-2 intrinsic height, no
  h-9).
- **R41-E — the shadcn Sidebar data-sidebar family** (additive DOM
  parity): REF's shell carries the component's full attribute map
  (header/content/group/group-label/group-content/menu/menu-button ×13
  /menu-item ×5 — the standalone links only, the group toggles sit
  bare — /footer); the clone had only sidebar + trigger. All added;
  the toggle lis dropped (bare Collapsible triggers like REF — the
  ul's flex gap-1 spacing unchanged).

**Pins**: 12 new (A1-A4, B1, C1, D1-D4/D5, E1, T1) + 6 amended (R15-B,
R19-C/C2, R32-A5, R35-A5/A6 + the R8-E shell pin). Gates: lint 0/0 ·
tsc ✓ · **648/648 unit** (+12) · build ✓ · **185/185 E2E** (+5 — the
session42-footer-focus spec; one input-family tolerance flake in the
first full run, stable on the single-spec re-run AND the full re-run).
Live: verify-r41.mjs 5/6 raw MATCH — the footer family (svg classes +
rendered sizes/colors) byte-identical incl. the authored `w-5 h-5`
glyphs overridden to 16px by the base guard; the user-menu items (div +
182×32); the employees row (256/569/36/"active"/rgb(239,239,239)); the
data-sidebar map; the dark-mode moon (single sun glyph + inherited
color). The 1 documented diff: the focus-walk probe's break condition
(REF's bell carries no aria-label — the a11y superset — so the
sequences start at different elements; every read on BOTH sides rings,
and the outline solid/none split is the documented two-build non-gap).
The standing audits 5/5 post-change (one transient toggle-race on the
REF drawer, clean on re-run); 8 screenshots (160-163) → **228 PNG
captures**. DB pristine (users=1, employees=1, leaveBalances=2).

## Session 43 — parity round 42 (the login redeploy re-audit: the input base migration)

REDEPLOY DETECTED — login-scoped, **JS + CSS both** (login JS
`index-C-ulo5ek.js` → `index-DRs9_-5K.js`, login CSS `index-BIWjBcok.css`
→ `index-DPOrvWRk.css`; both app fingerprints quiet — the first
CSS-touching login deploy since round 38). The CSS delta is the same
platform font-face batch round 40 documented (Wix Madefor/Dazzed/Azeret
Mono + `.font-base44` — 0 consumers). The rendered surface stayed
byte-identical on both bands (card/inputs/social/or-chip/links/title all
MATCH; the failed-login Alert re-fired and byte-identical at 368×54
@(536,738)); the redeploy changed the AUTHORED recipes
(docs/remediation-plan-session43.md):

- **R42-A — the login inputs' verbatim base migration**: REF's new
  login-build input component carries the ring-2/offset-2 family IN BASE
  (`py-2 text-base ring-offset-background … focus-visible:ring-2
  focus-visible:ring-ring focus-visible:ring-offset-2 … md:text-sm`)
  with the page tail `pl-10 h-11 sm:h-12 bg-slate-50/50
  border-slate-200 focus:border-slate-400 focus:ring-slate-400
  rounded-xl placeholder:text-slate-600` — the ring member switched to
  the PLAIN focus: variant (tailwind-merge no longer dedups ring-ring),
  and the round-39 two-build split counters (`shadow-none
  transition-none`) are GONE (REF's new base ships no shadow/transition
  members to counter). The clone CANNOT reach the string by overriding
  the shared v4 Input (tailwind-merge overrides but never deletes) — the
  login inputs are now HAND-AUTHORED elements carrying REF's verbatim
  string (REF's own login build ships its own input component; the
  two-build architecture honored). The shared Input stays for app pages.
- **R42-B — the Sign in ring token + the login --ring override**: the
  button's `focus-visible:ring-[#09090b]` (the r38 hex pin) →
  `focus-visible:ring-ring` (REF's token member) over a login-scoped
  `[--ring:#09090b]` on the root main (REF's login build sets
  `--ring: 240 10% 3.9%` at :root — the two-build palette split; the
  clone scopes it to the login subtree so app pages keep the shared
  neutral token; full-value form per trap 1).
- **R42-C — the w-full column restructure**: REF's column has THREE
  direct children — the social `space-y-3` group (ONLY the three
  buttons), the `relative my-6` divider, and the form; the clone's
  nested single space-y-3 wrapper retired (render-neutral: the column
  measures 522px both sides — the divider's my-6 owns the 24px gaps).
- **R42-D — the field wrapper adopts space-y-1.5**: REF's field DIV
  carries `space-y-1.5` with a BARE `relative` inner; the clone keeps
  the explicit `mt-1.5` on the relative wrapper (the trap-6 v4
  restoration — v4's `:where()` space-y lands on the INLINE label where
  vertical margins are ignored; the dashboard welcome-row pattern).
- **The keyboard/focus remainder CLOSED**: the Shift+Tab reverse walks
  (the session-38 named remainder) read on both surfaces both apps —
  the login walk (Sign in → password → email → Apple → Microsoft) and
  the dashboard footer walk (عربي → moon → bell → Settings → AI HR
  Assistant → Analytics → Communications) structurally IDENTICAL (the
  only text diff is the clone's aria-label supersets).

**The round's E2E lesson — the transition-settled ring read**: the Sign
in's `transition-all duration-200` (the R38-E1 motion pin) TRANSITIONS
the ring box-shadow in — a shadow read immediately after the Tab press
lands mid-transition and shows the at-rest slots (the custom properties
are already set; the box-shadow lags 200ms). Both apps behave
identically; the spec waits past the window before reading.

**Pins**: 8 new (A1-A4, B1-B2, C1, D1) + 5 amended (R18-E's input pair +
Sign in pin, R38-G1/A2/I1, R39-C1, R40-A1). Gates: lint 0/0 · tsc ✓ ·
**656/656 unit** (+8) · build ✓ · **190/190 E2E** (+5 — the
session43-login-redeploy spec; one session40 input-family tolerance
flake in the first full run, stable on the single-spec re-run AND the
full re-run). Live: verify-r42 5/8 raw MATCH — the input DOM strings
(sorted content — tw-merge reorders, content is the contract), the Sign
in DOM string, the w-full column structure, and both bands' geometry
MATCH; the focused Sign in ring renders IDENTICAL on both sides (white
2px + rgb(9,9,11) 4px — the v4 transparent-zeros prefix the documented
serialization non-gap); the field wrapper's `mt-1.5` is the documented
trap-6 superset; `--ring` resolves 240 10% 3.9% vs #09090b (the trap-1
two-build form split). The standing audits 5/5 post-change; 8
screenshots (164-167) → **236 PNG captures**. DB pristine (users=1,
employees=1, leaveBalances=2).

## Session 44 — parity round 43 (the sidebar shadcn architecture + the desktop collapse)

The redeploy watch was QUIET (all four build fingerprints matched the
round-42 records) — the frontier came from the standing list: the s40
shell restructure adopted REF's OUTER peer architecture, but the
sidebar's INNER authored surface was never census'd beyond the r41
attribute names. The round census'd it end to end (DOM tree + exact
class strings + both collapse states + rendered geometry + hover
renders) and found **REF's sidebar is the full shadcn Sidebar component
architecture** — plus a genuine functional gap that survived 42 rounds
(docs/remediation-plan-session44.md):

- **THE FUNCTIONAL GAP — the desktop collapse**: REF's trigger
  COLLAPSES the sidebar to a 47px icon rail (the shadcn
  `collapsible=icon` mode — the peer flips `data-collapsible=""` ↔
  `"icon"` + `data-state`; every s40 member already answered, only the
  state was missing). REF's trigger lives in the same `md:hidden`
  mobile header (0×0 at desktop — dormant UI, reachable only
  programmatically); the clone reproduces the authored matchMedia
  branch (≥768px toggles the collapse, below opens the drawer). Rail
  geometry live-measured on both: 48px wrap, 47px inner (the border),
  32×32 buttons (the `!size-8 !p-2` members — the v3 LEADING-!
  important forms DO compile under the installed v4.3.3, verified
  empirically before adopting), group-label opacity-0/-mt-8, brand h2
  0-width, footer spill documented (overflow visible, scrollWidth 128).
- **R43-C — the SidebarNav restructure** (verbatim REF strings): the
  content is a `data-sidebar=content` DIV (the nav ELEMENT retires —
  the print block's `nav` selector now covers only the bottom tabs),
  `flex min-h-0 flex-1 flex-col gap-2 overflow-auto
  group-data-[collapsible=icon]:overflow-hidden p-3`; the group p-2
  wrapper, the group-label with its `transition-[margin,opacity]` +
  rail members (authors slate-500, not the muted token), group-content
  w-full, menu ul `flex w-full min-w-0 flex-col gap-1`; every nav
  button carries the full shadcn `peer/menu-button` base + the
  attribute contract `data-size="default" data-active="false"` (REF
  authors the literal false on EVERY link — even the active one; the
  base's `data-[active=true]:*` members are dead code on REF); the
  toggle interior restructure (`div.flex.items-center.justify-between.
  w-full.px-3.py-2.5` > `div.flex.items-center.gap-3` + chevron) with
  the GLYPH SWAP (chevron-down open / chevron-right collapsed, no
  rotation); the no-ul submenu (`div.pl-4.space-y-1` with direct
  `li.group/menu-item.relative` children); leaf/subleaf/toggle tails
  with the HOVER-PAIR SPLIT (only leaves carry
  `hover:bg-sidebar-accent hover:text-sidebar-accent-foreground` —
  that is how the toggle's blue-50/blue-700 hover survives) and the
  dead `hover:custom-accent-bg` member (a hand-authored class — its
  hover: variant generates nothing, mirrored for DOM parity).
- **The toggle icon 20px puzzle**: the base's `[&>svg]:size-4` guard
  is a DIRECT-child selector — the leaf icons sit at the top level
  (authored w-5 h-5, rendered 16px) but the toggle's icon rides the
  interior wrapper two levels deep (the guard misses it — the authored
  20px renders, live-measured on both).
- **Typography**: leaf/toggle label spans carry `font-medium` (500,
  live-measured — the clone rendered 400, a real visual diff that
  survived 42 rounds); subleaf spans carry `text-sm` (the active
  subleaf's 500 inherits from its link's font-medium).
- **The active recipe**: `custom-primary-bg text-white font-medium
  shadow-sm` + the INLINE `style="background-color: rgb(24, 119,
  242)"` (render-redundant with the class's unlayered !important — an
  authored attribute mirrored), NOT `bg-primary`.
- **R43-D — the token corrections**: light `--sidebar-accent` was a
  WRONG blue tint (214 95% 93%) and `--sidebar-accent-foreground` was
  missing entirely → REF's zinc-100/zinc-900 light + zinc-800/zinc-100
  dark; the `--primary-color: #1877f2` / `--accent-color: #e4e6eb`
  vars + the two UNLAYERED custom rules (`.custom-primary-bg` /
  `.custom-accent-bg`, both `!important`) land in globals.css.

**Pins**: 14 new (D1-D3, C1-C9, A1-A2) + 17 amended (session-5 ×4,
R18-C, R19-A/B, R20-A/C/D/E, R21-A/D, R22-A1, R29-A1, R34-D1, R41-E1 —
the hex hover/pressed forms retired to the token members, the chevron
pin flipped to the glyph swap, the nav-anchor pins moved to the content
div). Gates: lint 0/0 · tsc ✓ · **670/670 unit** (+14) · build ✓ ·
**198/198 E2E** (+8 — the session44-sidebar-collapse spec: the peer
attrs, the programmatic rail collapse + geometry, the label/brand
collapse, the expand-back, the mobile matchMedia branch, the 19/11
counts + attribute contract, the active recipe + inline style, the
chevron glyph pair; one session40 input-family tolerance flake in the
first full run, stable on the single-spec re-run AND the full re-run).
Live: verify-r43 **9/9 MATCH** — the peer attrs, the family strings,
the leaf/active/toggle authored sets (normalized — tw-merge dedupes
flex/items-center and resolves gap-2/gap-3, both render gap-3; REF's
raw concatenation keeps both, the stylesheet's numeric order makes
gap-3 win there too), the submenu + counts, the rail geometry (both
apps collapsed LIVE), the tokens both themes (Chrome resolves the
clone's hsl() token form to hex — the resolver normalizes both to rgb
triples), the hover renders (the v2 polyfill unwrapped 5 media blocks
on LOC; REF applies directly — the leaf zinc-100 + the closed toggle
blue-50 both MATCH), the short-viewport scroll. The standing audits
5/5 + the route sweep 12/12 post-change; 8 screenshots (168-171) →
**244 PNG captures**. DB pristine (users=1, employees=1,
leaveBalances=2).

**The round's transferable lessons**: (1) the v3 leading-`!` important
forms still compile under Tailwind 4.3.3 (verified empirically with the
repo's own @tailwindcss/postcss before adoption — don't assume the v4
upgrade guide's "moved to the end" broke the legacy parse); (2) the
`[&>svg]` guard is a direct-child selector — nesting an icon one level
deeper is a legitimate way to keep its authored size; (3) Chrome's
newer engines RESOLVE color-function-valued custom properties in
getComputedStyle (the clone's `hsl(...)` tokens read back as hex;
REF's raw triples stay as-is — normalize both to rgb before comparing).

## Session 45 — parity round 44 (the login interior: the runtime-injected ring cascade + the icon color family)

The redeploy watch fired TWICE mid-session (the 8th + 9th login
deploys — login JS `DRs9_-5K → DsVpN8yE → CTDe-raE`, login CSS
`0a_RfWl5 → NS4V-1t3`; the app fingerprints `C-IrDy5f`/`BGNH4KkS`
quiet throughout). Per the round-42 precedent this triggers a full
login re-audit; the census re-ran against the final live build and
every finding held identically across BOTH new builds. The rendered
geometry MATCHED everywhere (the second consecutive login redeploy
that changed authored recipes, not rendered geometry) — the round's
vein was the dimensions 43 rounds never reached: the rendered COLORS
and the loading interior.

- **R44-A — THE RUNTIME-INJECTED TAILWIND BLOCK (the headline
  mechanism)**: REF's login ships a SECOND Tailwind stylesheet as an
  inline `<style>` (199 rules, 17,813 bytes — a complete v3.4.17
  build: preflight + the auth widget's JIT subset) injected by the
  platform runtime into the HEAD AFTER the linked stylesheet. Its two
  plain-`:focus` selectors (`.focus\:border-slate-400:focus` +
  `.focus\:ring-slate-400:focus`) sit at equal specificity with but
  LATER IN DOCUMENT ORDER than the linked CSS's
  `.focus-visible\:ring-ring:focus-visible` — so they WIN the
  cascade: REF's keyboard-focused email/password inputs render a
  SLATE-400 ring (rgb(148,163,184) 4px, live-read under a real Tab on
  both bands). The clone rendered the zinc-950 token ring (v4 orders
  focus-visible after focus, and the login-scoped `[--ring:#09090b]`
  resolves the token). The block's other 197 rules are same-value
  re-declarations with no later-conflicting rules on the login
  elements (the flip analysis isolated the ring pair as the only
  cascade flip); the app pages carry NO inline block (login-only) and
  `focus:ring-slate-400`/`focus:border-slate-400` appear nowhere else
  in the clone's source — the fix is naturally scoped. **The fix**: a
  `<style>` element rendered IN PLACE inside the login's root main (a
  plain style tag — no `precedence` prop, so React 19 keeps it in the
  body, after the head links — the same winning cascade position
  REF's runtime achieves) carrying REF's two verbatim rules. The
  inputs' class strings stay REF-verbatim — the fix is PURE CASCADE.
- **R44-B — the field icon pair**: REF's login build ships the OLDER
  lucide revision. The Mail glyph: the envelope rect renders FIRST +
  the older flap arc (`m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7`);
  the current lucide-react ships path-first + the `8.991 5.727 a2`
  arc — so the lucide-react Mail/Lock imports RETIRED and both icons
  became hand-authored svgs with REF's verbatim glyphs, the standard
  lucide attr set (stroke-width 2, linecap/linejoin round), and the
  verbatim class `lucide lucide-mail absolute left-3 top-1/2
  transform -translate-y-1/2 h-4 w-4 text-slate-500` — THREE member
  diffs vs the clone: **text-slate-500** (the clone authored
  slate-400 — the icons rendered LIGHTER: rgb(100,116,139) vs
  rgb(148,163,184)), the v3 **`transform`** member (present on REF,
  absent on the clone), and `pointer-events-none` (the clone's a11y
  superset — KEPT absent for REF parity, the icons sit above the
  inputs' left padding not the click target). The Lock glyph matches
  (rect + shackle path) — only its class string needed the migration.
- **R44-C — the social icon family's fills** (three real color
  diffs): C1 the **Apple logo** — REF authors `fill="#000000"` ON THE
  PATH with NO svg-level fill → renders BLACK; the clone's
  `fill="currentColor"` at the svg level rendered the button's
  slate-700 (rgb(51,65,85)); C2 the **Microsoft squares** — REF's own
  path order is red(TL) → **BLUE(TR)** → **GREEN(BL)** → yellow(BR),
  NOT the real logo's green/blue arrangement the clone shipped; C3
  the **Google icon's path attribute order** — REF serializes `d`
  before `fill` (a DOM serialization parity item).
- **R44-D — the loading state** (never census'd — the E2E specs
  assert the Alert, not the submit interior): REF's Sign in swaps its
  text to **"Signing in..."** + disables + renders the spinner
  `lucide lucide-loader-circle mr-2 h-4 w-4 animate-spin` (the glyph
  `M21 12a9 9 0 1 1-6.219-8.56` matches the clone's Loader2 — only
  the text swap + the `mr-2` member were missing; the button's gap-1
  stacks with it identically, both sides ship both).
- **R44-E — the title/subtitle member order** (render-neutral
  authored-recipe migration): REF authors
  `text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight` +
  `text-slate-500 text-sm sm:text-base font-medium`; the clone
  authored the same sets in a different order.

**Documented non-gaps re-verified this round**: the card's
`text-[#09090b]` resolved-hex pin + the two trap-3 sRGB gradient
pins; the `mt-1.5` trap-6 superset; the autoComplete attrs (the kept
a11y superset); the `lab()`/`rgba()` serialization split on
`bg-slate-50/50` — re-proven PIXEL-identical via canvas
rasterization ([247,249,251,128] both sides) before dismissal; the
action elements are BUTTONS on both apps (round-40's "links" records
measured the pre-redeploy anchors — REF's login now renders "Forgot
password?" + "Need an account? Sign up" as buttons, already migrated
at round 38).

**Pins**: 11 new (A1-A2, B1-B3, C1-C3, D1-D2, E1) + 2 amended
(R19-H — the slice anchor, the button text became conditional;
R38-M1 — the glyph contract widened, the fill semantics + square
order + attr order moved to the R44-C pins). Gates: lint 0/0 · tsc ✓
· **681/681 unit** (+11) · build ✓ · **203/203 E2E** (+5 — the
session45-login-interior spec: the field icon colors + glyphs, the
social fills, the keyboard-focused slate-400 ring (the real-Tab read,
transition-settled), the loading-state interior via route
interception, the title order). Live: verify-r44 **7/8 raw / 8/8
semantic MATCH** — the one raw DIFF is the documented trap-1
serialization split (`hsl(240 10% 3.9%)` ≡ `#09090b`); the matched
pairs: the Tab-focused ring (slate-400 both apps — the cascade fix
proven live), the icon rendered colors, the loading-state snapshot,
the title classes, the at-rest regression set, the style block's
document position. The standing audits 5/5 + the route sweep 12/12
post-change; 8 screenshots (172-175) → **252 PNG captures**. DB
pristine (users=1, employees=1, leaveBalances=2).

**The round's transferable lessons**: (1) the cascade analysis
required the FULL document — the linked stylesheet's byte order said
focus-visible should win; the SECOND, runtime-injected inline
`<style>` after it is what flips the ring color (head-vs-body
position matters, not byte order within one file); (2) the
loading-state capture needs the state HELD — the state lasts <40ms on
REF (the E2E used route interception to hold the API open; the live
probe used a same-tick snapshot); (3) serialization splits deserve
pixel proof before dismissal — the `lab()`/`rgba()` split on
`bg-slate-50/50` converted to [249,250,252] via lab math (one red
unit off the pinned hex) but rasterized PIXEL-identical (the alpha
path differs, the composite lands the same).

## Session 46 (parity round 45) — the hidden view-swapped login flows

**Context**: the workspace reset again (the round's code work from the
interrupted prior window was lost uncommitted) — every contract
re-derived from fresh live measurements. Baseline gates green at the
cloned HEAD (681 unit · 203 E2E). **Redeploy watch: the 11th login
deploy** (login JS `BerEzxez` → `CcAnCcTT`, login CSS `NS4V-1t3` →
`BWytzgpi`, the app fingerprints quiet) — per the round-42 precedent a
full login re-audit ran first: the r44 fixes ALL held on the new build
(the icon family, the title/action row, the at-rest geometry, the
failed-login Alert); the react-hot-toast block left the login's runtime
style set (the sonner block remains — platform runtime, no login flow
fires a toast).

**The round's discovery — TWO hidden view-swapped flows behind the
login's action buttons** (44 rounds never censused them: they leave no
DOM trace until clicked). The card's `w-full` column swaps its ENTIRE
content — the logo, the welcome title, the social row, and the
or-divider all unmount:

1. **The password-reset flow** ("Forgot password?"): the back button
   (`-mb-2` + the hand-authored arrow-left) + the title group + the
   one-field form (`space-y-4 sm:space-y-5`); the CTA swaps to
   "Sending..." + the r44 mr-2 spinner family; the submit renders the
   **"Check your email" success view** — the icon circle (the
   older-lucide mail at slate-700 h-7/w-7 sm:h-8/w-8) + the two-line P
   with the `font-medium text-slate-900` email span + the GREEN Alert
   (`bg-green-50/70 border-green-200` + `text-green-700`) + the
   full-width back button. **Anti-enumeration verified live** (a
   non-existent email renders the identical view).
2. **The sign-up flow** ("Sign up"): a BARE `space-y-4` wrapper (16px
   both bands — the reset's `sm:space-y-6` gives 24px desktop), the H2
   DIRECT (no title group, no subtitle), the three-field form
   (`space-y-3 sm:space-y-4` around a bare `space-y-3` fields group —
   ids email/password/confirmPassword, placeholders
   "you@example.com"/"Min. 8 characters"/"Re-enter password"); the
   duplicate-email error renders INSIDE the form with REF's verbatim
   copy **"A user with this email already exists"**; the CTA swaps to
   "Creating account...".

**The sibling input family**: the hidden views' inputs ship the shared
base with `h-10 sm:h-11` (44px) + `placeholder:text-slate-400` — NOT
the sign-in pair's `h-11 sm:h-12` + `placeholder:text-slate-600`; the
reset copy carries `text-base` mid-string, the signup trio carries the
`text-sm sm:text-base` responsive pair at the tail. The field icons
are the same older-lucide glyphs at **slate-400** (the sign-in pair is
the re-measured slate-500). NO autocomplete attrs.

**The trap-6 rhythm restorations** (v4's `:where` space-y mb loses to
the authored `-mb-2`, and v4's label mb is ignored on the inline
label): the reset title group authors `mt-4 sm:mt-6`, the signup H2
authors `mt-4`, and the field units' relative wrappers author the r42
`mt-1.5` — REF's v3 runtime supplies the same margins its DOM never
carries.

**The `--foreground` fix**: REF's login build sets zinc-950
(`240 10% 3.9%`) at `:root` — the r42 `--ring` precedent's sibling.
The login main now pins `[--foreground:#09090b]` (the Alert family's
`text-foreground` resolves rgb(9,9,11); the app pages keep the shared
neutral token).

**The API seams** (the functional superset): `POST /api/auth/forgot-password` (zod + the login-family rate limiter; ALWAYS ok — the
anti-enumeration contract, no account-existence signal either way) and
`POST /api/auth/signup` (the verbatim duplicate copy on 409; the
new-email path creates the user + sets the session cookie — the
auto-login redirect to the null-safe dashboard; the client also guards
the confirm-mismatch path with "Passwords do not match").

**Pins**: 16 new (A1-A6, B1-B4, C1-C3, D1-D2, E1) + 5 amended (R38-G1
the foreground member; R18-E + R38-A2 + R39-C1 + R44-A2 — the four
count pins re-anchored to the sign-in form region now that the sibling
input family exists). Gates: lint 0/0 · tsc ✓ · **697/697 unit** (+16)
· build ✓ · **209/209 E2E** (+6 — the session46-login-flows spec).
Live: **verify-r45 13/13 MATCH** — both views' rhythm both bands (the
y/h geometry contract; the mt/mb mechanism split documented — v3 lands
mt on following siblings, v4 mb on preceding, the same rendered gaps),
the sibling input classes + the slate-400 icons, the success view, the
duplicate Alert (canvas-rasterized bg 254,242,242,179 BOTH apps — the
lab() split pixel-proven), both loading interiors, the `--foreground`
resolution, the at-rest r44 regression, the view-swap behavior. The
standing audits 5/5 + the route sweep 12/12 post-change; 10
screenshots (176-179) → **262 PNG captures**. DB pristine (the
loading-probe's throwaway signup caught + cleaned: users=1).

**The round's transferable lessons**: (1) the census must CLICK the
dead ends — two full flows with complete contracts (views, loading
swaps, a success state, an error copy, an anti-enumeration contract)
hid behind two buttons that 44 rounds of probing left unfired because
their failure mode (an error Alert) looked terminal; (2) REF's silent
aria-label drop on the sidebar trigger broke a 9-round-old probe
finder — probe finders should match the accessible name by EITHER
mechanism (the aria-label OR the sr-only text), and the clone's extra
attrs are kept supersets; (3) the v3/v4 space-y margin-side split
(mt-on-following vs mb-on-preceding) makes raw mt/mb values
un-comparable across the apps — the y/h geometry is the contract; the
authored restorations (mt-4/mt-4 sm:mt-6/mt-1.5) must be stripped from
class comparisons as documented supersets.

## Session 47 (parity round 46) — the zero-state app-page interiors

**Context**: workspace reset again — fresh clone at `36ae4c8`, env
rebuilt, baseline gates green (697 unit · 209 E2E). **Redeploy watch: the
12th login deploy** (login JS `CcAnCcTT` → `D3V2Rni1`, login CSS
`BWytzgpi` → `bfirUl4Z`, app quiet) — visually quiet: verify-r45 13/13 on
the new build, the failed-login Alert byte-identical, theme-inert holds,
the runtime style-block census unchanged. **A 13th login deploy shipped
MID-round** (`D3V2Rni1` → `Dwv9uuCD`, `bfirUl4Z` → `CpjiugAb`, app
quiet) — re-audited: verify-r45 13/13 again.

**The round's vein — the zero-state app-page interiors** (never censused:
the route sweep pins h1s only). The method's unlock: a ZERO-TENANT
scratch server (:3201, schema + the demo user ONLY — mirroring REF's
0-employee tenant) so the zero-data pages compare like-for-like; the
seeded :3200 stays the with-data superset reference. Census instruments:
probe-r46-census-a..h.mjs.

**The findings**:

1. **The page-root families** (the 12-route map): REF wraps SEVEN pages
   (dashboard, employees, payroll, taskmanager, leavemanagement,
   expenses, loans) in a `relative overflow-hidden > touch-pan-y` pair —
   the platform's page-level touch/clip container; attendance NESTS the
   pair inside its gradient root (the only measured page that nests);
   the third member (the absolute-top deco, opacity:0, the refresh-cw
   scroll widget) is invisible platform runtime — non-clone. The
   gradient pages ship v3 `bg-gradient-to-br from-X-50 to-Y-50` forms —
   the clone rendered the SAME colors via arbitrary-value strings but
   MISSED the `dark:` pairs (a real dark-mode diff on
   taskmanager/attendance/profile). staffrequests is the bare
   `p-4 md:p-8 max-w-7xl mx-auto space-y-6` wrapper. The page-root
   `select-none` family LEFT REF (only the shell chrome — the bottom-nav
   anchors + the footer ghost buttons — keeps it).
2. **The CardTitle TAG is the div** — the session-6 comment already
   called it "the Base44 title div" but the scaffold kept the h3; the
   census reads 4 × `div.font-semibold tracking-tight text-base` on REF's
   dashboard and zero tracking-tight h3s anywhere.
3. **THE CENSUS CORRECTION** (the round's transferable lesson): the
   first read "REF hides the payroll/recruitment stats at zero" was an
   INSTRUMENT ARTIFACT — both the outline reader (h1-h4/p/button) and
   the stat detector (P.text-3xl) were P-based, and REF renders its
   standard/compact stat values + labels as DIVs. REF renders the stats
   at ZERO (caught live during the verify's text-level read); the
   conditionals were reverted and the REAL diffs fixed instead: the icon
   families (payroll dollar-sign/trending-up/calendar + per-color tiles;
   recruitment circle-check-big/trending-up + indigo/blue/green/purple
   tiles + the compact slate-500 label; doctracker
   file-text/circle-check-big/triangle-alert/circle-x) and the StatCard
   per-variant element tags (standard + compact values → DIV, horizontal
   label → P).
4. **The dashboard zero-state**: REF renders the DEFAULT leave-balances
   UI (Annual Leave 21/21 + the full bg-blue-500 bar; Sick Leave 30/30 +
   bg-green-500) — not an empty state; the quick-action items are BARE
   anchors wrapping the styled div (the clone styled the anchor itself);
   the Customize button rides in a `flex items-center gap-3` wrapper.
5. **The profile**: the hidden avatar file input (`id="avatar"
   accept="image/*" class="hidden"` between the email line and the Change
   Photo button), the input-id family (`full_name`/`email`/`phone`/
   `job_title` — the pf-* set retired), and the audit-note line REMOVED
   (REF renders none; the audit-logging superset stays backend-side).
6. **The icon glyphs**: the employees Import-CSV upload is REF's
   OLD-lucide revision (tray-first — the installed 0.525 ships the newer
   arrow-first) → hand-authored; the search icon is circle-first
   `text-slate-400` with the v3 `transform` member (the clone rendered
   text-muted-foreground = slate-500); the taskmanager view toggle is
   `Kanban` (the clone's KanbanSquare is the rect-first SquareKanban).
7. **The training zero-state** renders message-only (no create button) —
   the session-15 zero-state CTA retired; the with-data entry stays the
   grid's dashed add-tile.

**Kept supersets (documented)**: the attendance toolbar wrap + hero-row
v4 splits (session-10 R9-E + session-16/17 — the fitting superset vs
REF's own 1558px overflow), the StatCard tile architecture (h-12 w-12
flex-centered vs REF's p-3 — same rendered 48px), the PageHeader
badge/hero translations, the welcome-row `mt-8` (trap-6 restoration).

**Pins**: 21 new (A1-A5, B1-B2 corrected, C1-C4, D1, E1-E3, F1-F3, G1-G2,
H1) + 11 amended (the CardTitle, the kicker, the two icon pins, the
training affordance, R23-B1/B2/B3..B8/B-scope, R37-A3). Gates: lint 0/0 ·
tsc ✓ · **718/718 unit** (+21) · build ✓ · **217/217 E2E** (+8 — the
session47-zerostate-interiors spec). Live: **verify-r46 25/25 MATCH**
(the 12-route root map, the stat zones, the tags, the dashboard
interior, the profile family, the glyphs, the dark pairs) + verify-r45
13/13 (the 13th-deploy re-audit) + standing audits 5/5 + route sweep
12/12. 8 screenshots (180-183) → **270 PNG**. DB pristine (the
loading-probe user swept AGAIN — the notificationPref dependent found
this time). The comments-in-source trap fired ONCE (a fresh comment
quoting the retired select-none — reworded to prose). The probe-tooling
lessons: the `//`-comment one-liner trap (re-fired from census-a —
split-join collapses comments), the template-literal `\S` escape
(`` `text-\S+` `` arrives at the browser as `text-S+` — write `\\S`),
and the agent-browser screenshot CLI needs ABSOLUTE paths.

## Session 48 (parity round 47) — the unmapped-route interiors

**Context**: fresh pull to `def9974` (docs-only delta), env intact,
baseline gates green (718 unit · 217 E2E). **Redeploy watch: the 14th
login deploy** (login JS `Dwv9uuCD` → `CSVhrsEz`, CSS `CpjiugAb` quiet,
app quiet) — visually quiet: verify-r45 13/13. **A 15th login deploy
shipped at round end** (`CSVhrsEz` → `DCDf2KCA`, CSS + app quiet) —
re-audited: verify-r45 13/13 again. The login build stays under ACTIVE
development — the watch stays armed.

**The round's vein — the unmapped-route interiors**: r46 covered 12
canonical routes; this round censused the REMAINING ~46 (three census
batches + the rows/stats/rootmap/zone readers + the svg-class probe —
svg.className is an SVGAnimatedString, invisible to class-string
readers; read via getAttribute). All live REF @1440×900 vs the
zero-tenant :3201.

**THE INSTRUMENT CORRECTION (the round's transferable lesson)**: the
census/zone readers JOIN adjacent child text nodes with `' '` — JSX
interpolation (`Peer Approval ({count})`) produces phantom spaces
(`Peer Approval ( 0 )`). Raw-textContent verification DISSOLVED the
entire suspected "space-in-template" family (shiftswap, surveys,
analytics, securitysettings, hrreports, the dashboard welcome — all
byte-identical renders). **A text-outline instrument may never be
trusted for spacing claims — compare raw `textContent` only** (the r46
lesson extended).

**The findings + fixes**:

1. **The kicker family**: every clone kicker h1 missed REF's
   `dark:text-white` pair (a REAL dark-mode diff — component fix) + the
   dashboard's hand-rolled kicker was the pre-r46 form (the r46 A5 fix
   updated PageHeader but missed the copy — the aliases inherit via
   re-export).
2. **The rootmap (48 routes)**: 27 pages still shipped the arbitrary
   `bg-[linear-gradient]` forms → the v3 `bg-gradient-to-br` swaps; the
   `mx-auto flex w-full max-w-Nxl flex-col gap-N` wrappers → REF's
   `max-w-Nxl mx-auto space-y-N` verbatim (organogram = `max-w-FULL`,
   chat/hrassistantchat/employees = NO space member, hrreports/
   workflowconfigpage/notificationpreferences = the p-6 family); the
   merged-root five (assetmanagement/analyticsdashboard/
   attendancedashboard/surveyanalytics/payrollmodule) carry `p-4
   md:p-8 space-y-8` + the gradient ON the root with NO inner max-w
   wrapper; the bare roots (announcements/recruitmentkanban
   `p-4 md:p-8 space-y-6`; requestreports/requestsettings the verbatim
   root + the extra gradient wrapper dropped); payrollreports gained
   the PageCanvas trio; employeeportal += `p-4`; the stubs — /home is
   literally `<div></div>`, /employeedetail is the centered CSS
   spinner, /employeeselfservice mirrors REF's centered loader for the
   suspense phase (the resolved no-profile state stays the informative
   superset — the DOCUMENTED divergence).
3. **The header-row family**: REF's md rows carry the UNPREFIXED
   `justify-between items-start` members (base) + `md:flex-row
   md:items-center`; six pages gained `rowBreakpoint="md"`
   (analyticsdashboard, surveyanalytics, payrollengine, hrletters,
   shiftswap, surveys); performancemanagement gained `actionsStart`.
4. **The stat family (the biggest)**: StatCard gained per-call-site
   `valueTag`/`labelTag` overrides + `tileRowClassName`; the no-tile
   rewrite CORRECTED the session-14 R13-I contract (REF renders
   label-TOP p + value-BELOW p mt-1 + the BARE per-color svg — the
   session-14 reader mis-attributed the order); the TILE family: REF's
   tiles carry GEOMETRY + BG only, the icon size + color ride the svg's
   own classes (compact `w-10 h-10 … mb-3` rendered DIRECTLY — no flex
   wrapper; standard/tile-right `w-12 h-12`); 13 pages' call sites
   updated (the icon names too: compliance circle-x/triangle-alert/
   circle-check-big/shield, assetmanagement package/laptop/
   circle-check-big/wrench, attendance users/circle-check-big/
   circle-x/clock/trending-up, payrollmodule dollar-sign ×4,
   surveyanalytics minus, expenses circle-check-big/dollar-sign,
   surveys message-square/eye/users/trending-up); the four analytics
   compacts pass p/p + slate-600 labels; advancedanalytics/payrollai/
   allleaverequests pass p/p + mt-4 values (REF's tile row has no mb)
   + advancedanalytics' REAL label diffs ("Avg Tenure (months)", "At
   Risk (AI Prediction)").
5. **The zero-state affordances** (the r46 training precedent
   extended): announcements (no button + the bare DIV empty),
   hrletters (the bare-svg empty + NO button), templates (the
   duplicate empty-state button deduped to the row CTA + REF's
   always-row header hand-rolled), performancemanagement (no count
   line + no empty card at zero + the REF tab-panel classes), and
   hrassistant (no suggestion line). The create flows ride WITH-DATA
   header actions where REF's zero state has no entry.
6. **The quick hits**: compliance's At-Risk card header
   (`bg-slate-50 py-3 px-4` + the flex gap-2 title + the classless
   empty P), requestreports' integer stat value, and
   recruitmentkanban's stage chips = REF's badge-form DIVs
   (`bg-slate-200 text-slate-700` + the focus ring family — NOT the
   h-[22px] badge the census's tag-only read implied).

**Pins**: 27 new (A1-A2, B1-B7, C1-C3, D1a-D2d, E1-E5, F1-F3) + 20
amended (the dashboard/kicker/row/48px-tile/r46-icon/R30-C1/R31-C5..
D1/R33-A1/R8-D/R8-F/R10-F/R10-H/R10-J pins + 2 E2E: the kicker
position contract, the tenantsetup heading). Gates: lint 0/0 · tsc ✓ ·
**745/745 unit** (+27) · build ✓ · **228/228 E2E** (+11 — the
session48-unmapped-interiors spec). Live: **verify-r47 24/24 MATCH**
(the 48-route rootmap, the stat zones with the tile contracts, the
kicker dark pair, the affordances, the stubs, the quick hits —
normalized for the documented render-neutral splits: class order via
sorted members, the mb-0 restoration strip, the React suspense
comment markers) + verify-r46 25/25 + verify-r45 13/13 (the 15th
deploy) + standing audits 5/5 + route sweep 12/12. 18 screenshots
(184-192 REF + zero-tenant pairs) → **294 PNG**. DB pristine (the
loading-probe user swept again — the verify-r45 trap re-fires every
window). The tooling lessons: the Next standalone server does NOT load
`.env` — pass DATABASE_URL inline on restart; the agent-browser evals
flake under sustained load (the verify's evalOn retries once).

## Session 49 (parity round 48, re-executed) — the bare hero architecture

**Context**: the original round-48 window completed its GREEN body but
was LOST to a workspace reset before the push landed (the local commit
never reached the remote). This session re-ran the round from a FRESH
census (`scripts/probe-r49-*.mjs` — headers/path/zone/sub/eval — plus
`scripts/r49-boot-loc0.mjs`, the one-call zero-tenant orchestrator:
fresh zero.db + :3201 boot + loc0 re-auth, everything inside one
process tree) and pushed at the FIRST green gate stack
(`5eda040`), then verified/documented after — the lost-work lesson
institutionalized.

**The round's vein — the hero-block architecture, re-measured**: REF
renders the hero block CLASSLESS (`DIV[]`) on EVERY measured page
(taskmanager and leavemanagement included) — the clone's `min-w-0` +
`flex-1` wrapper retired universally (the r47 "documented translation"
flipped). The findings: (A) the BARE-15 family — no hero row at all
(organogram/companywall/evaluations/training/hrassistant text-center;
reports/interviewassistant/securitysettings/communications/settings/
profile/analytics/notificationpreferences/announcements classless;
hrassistantchat `mb-6`) → the new `bare` prop; (B) the always-row
families are UNPREFIXED (`flex justify-between items-start` on the
always-start eight; `flex items-center justify-between` on
hrreports/requestreports + the mb-variants) → the new `alwaysRow`
prop; (C) the md-family passes (taskmanager/leavemanagement/expenses)
+ loans joins payrollreports' SHORT hidden row; (D) the actions
clusters — bare `flex gap-2` (hrreports/requestreports,
actionsBare) or SINGLE actions rendered DIRECTLY in the row (nine
pages, actionsUnwrapped — REF wraps only MULTI-button clusters); (E)
the chart family renders DUAL-direction CartesianGrids (all 14
`vertical={false}` pins retired across the 6 charts.tsx files — the
line counts stay Recharts internals, direction parity is the
contract).

**The C pages**: interviewassistant's TWO-CARD grid (Select Candidate
+ Interview Notes, the short Candidate/Notes labels, the clone's AI
Analysis riding column one as the superset); securitysettings' alert
(H3 `text-lg font-semibold text-orange-900` + circle-alert
`w-12 h-12 text-orange-600` + P text-sm text-orange-700) + the slate
DIV badges (rounded-md font-semibold + the focus members) +
circle-check-big `w-3 h-3 mr-1` + the FIRST live-measured checkbox
(the OLD shadcn form: `border border-primary shadow … ring-1`, no
checked-border, no cursor-pointer); payrollreports REBUILT (the
mobile kicker with the h-9 w-9 select-none back button + the SHORT
hidden always-row + the classless flat36-sm hero + the WhatsApp CTA
DIRECT in the row with `text-white` (not the #fafafa token) + the
full-width mobile copy in a md:hidden div + the Radix-verbatim tabs
with ALL FOUR panels mounted + the bare `px-4 py-3` Monthly th family
— the tax/history/custom cards stay the REF-unmeasured superset);
hrreports' form labels on the Label component (`text-xs
text-slate-500` — twMerge collapses leading-none under the later
text-xs; member-wise assertions only); evaluations' Radix-verbatim
panels (`ring-offset-background … space-y-6`); requestreports'
HORIZONTAL-BARE stats (the 40×40 rounded-lg tile with the svg's own
w-5 h-5 classes + the P text-2xl/P text-xs pair inside a CLASSLESS
div + the DEFAULT bordered card — a new stat-card variant) + the
pb-2 pr-4 th family + the always-row header (the Back ghost `h-8
px-3 text-xs` + the classless h1/p block + the bare flex gap-2
cluster); analytics' BARE root (`p-4 md:p-8` only — no gradient
canvas, no full-height wrapper — plus the verbatim `max-w-7xl mx-auto
space-y-8` content wrapper, the trap-4 audit clean);
recruitmentkanban + chat + templates confirmed conforming.

**The F module — the WORKING avatar upload (the functional
superset)**: REF's Change Photo button + hidden input now WORK — the
96×96 center-crop canvas downscale (JPEG 0.85, a few KiB) → `POST
/api/profile/avatar` (the guard/requireUser/parseBody convention + a
256 KiB data-URL cap + the profile.avatar_changed audit log) → the
optimistic swap; the purge script resets user avatars (the seed's
upsert never touches avatarUrl). E2E-pinned with a real PNG upload.

**The G fixes**: profile's stray wrap-level icon-only footer P (cruft
REF lacks) removed; hrassistant's badge glyph Bot at text-blue-600
(was purple); assets' Laptop at text-green-600 (was blue) + the CTA
re-pinned to REF's UTILITY-form green gradient
(`bg-gradient-to-r from-green-600 to-emerald-600` +
`hover:bg-primary/90` — the endpoints match the r6 sRGB pair); the
Button base's cursor-pointer retired; the kicker back button carries
REF's select-none.

**Pins**: 26 new (A1-A5, C1-C9 + C2b/C3b/C7b, E, F1-F2, G1-G6) + 13
amended predecessors (R8-A, R9-A, R15-C, R30-C1, R31-C6, R33-A1,
R34-E2/E3/E4, R37-A1, R46-F1, R47-D1b, R47-F2). Gates: lint 0/0 ·
tsc ✓ · **771/771 unit** (+26) · build ✓ · **243/243 E2E** (+16 —
the session-49 bare-interiors spec). Live: **verify-r48 29/29 pairs
MATCH** (member-set normalized: the class-order variance, the dark:
superset pairs, the guard-span icon translation, the tab token pair,
the mt-8/space-y margin collapse, the hover token aliases, the
Recharts direction-parity) + standing audits 5/5 + route sweep 12/12.
26 screenshots (193-218, REF + zero-tenant pairs) → **320 PNG**. DB
pristine (users=1, employees=1, balances=2, avatarUrl=null).
`.env.example` verified.

**The tooling lessons**: the demo password `$Abcd1234` inside DOUBLE
quotes gets shell-expanded — the browser fills an EMPTY password and
the login silently bounces to `/login?` (single-quote it); the
stale-server trap re-learned — `pkill -f "standalone/server"` NEVER
matches (Next renames to `next-server (v16.4.0)`), and a stale
:3201 holder serves DEAD chunk names (500s → no hydration → the
login form's NATIVE submit) — kill by port-derived PID (`ss -tlnp`)
before every boot; the PageHeader rewrite's fragment-block bug (the
HeroBlock fragment attached the h1 DIRECTLY to the row, losing REF's
row > DIV[] nesting) was caught by the spec's parentElement walk —
TDD catching the component rewrite, exactly as designed.


## Session 50 (parity round 49) — the never-deep-measured interiors

Fresh clone to `c2ed36e` (the owner's session_100 journal — the round-48
re-execution narrative, docs-only). The baseline held (771/771 unit ·
243/243 E2E at the landed round-48 state); the window ran the
**deep-interior census of the ~15 never-measured routes** — the last
frontier vein — with payrollmodule's slow-load finally solved (an 11s
settle; every prior round's eval timed out on that page).

**The census** (`scripts/r50-eval.txt` — the shared deep reader, via
`probe-r50-deep.mjs` REF-side + `r50-boot-loc0.mjs` zero-tenant LOC):
the never-measured interiors hid a whole **glyph family** —
payrollmodule's Generate All carried Wand2 where REF renders
`calculator`; payrollengine's Generate Payroll carried Cog (REF:
calculator); surveyanalytics' Run AI Analysis carried Sparkles (REF:
brain); notificationpreferences' Mark All Read carried CheckCheck (REF:
check) with the switch rows' whole icon set wrong (REF: mail / bell /
check / bell / smartphone / bell, all `w-4 h-4 text-slate-600` — the
clone had CheckCircle2/UserPlus/XCircle/Megaphone/Info) and the Recent
zero state rendering FileText where REF renders `bell … opacity-30`;
employeeportal's zero card rendered a 64px rounded-full chip +
ClipboardList where REF renders the `briefcase w-8 h-8 text-blue-600`
DIRECT; shiftswap's badge + zero glyphs were CalendarDays/ArrowLeft
(REF: arrow-left-right both).

**The structures**: shiftswap's stat cards carried no icons at all (REF:
the inline family — users blue-600 / clock yellow-600 / calendar
orange-600 / circle-check-big green-600, `w-5 h-5`) on border-slate-200
shadow-sm cards (REF: the plain Card); the pills were h-9 (REF: py-2)
with hover:bg-slate-100 (REF: slate-50); the empty card was p-6 +
py-10 wrapper (REF: p-12 text-center + the glyph direct + the mt-less
slate-500 line). **staffrequests' toggle was a hand-rolled chip — REF
renders the RADIX TABS form** (TabsList + a single trigger + TabsContent
mt-2 with the zero state DIRECT in the panel — no Card wrapper; the
CTA's mt-4 rides the button itself); the search icon's muted token and
the file-text's slate-400 became REF's slate-400/slate-300 literals.
payrollmodule's search icon dropped pointer-events-none for REF's
slate-400 literal, and the shared Table wrapper's inert `w-full` retired
(REF: bare `overflow-x-auto` — the r11 contract, finally literal).
payrollengine's two flat cards gained REF's `shadow-sm`.
requestsettings' cards went plain with `p-6 space-y-4` interiors +
slate-500 subtitles + mr-1 Plus glyphs. hrletters' CardTitle keeps the
leading-none pass (REF's plain form differs only by the base's inert
text-base — both 16px — the documented byte-parity backlog pair).

**The verified-matching census routes** (pinned for regression in the
spec): payrollmodule's dollar-sign stat family + bare th + the
`Payslips — October 2026` CardTitle; surveyanalytics' icon-stat family
+ recharts surfaces; surveys' DIV/DIV stats + "0%" tight text; payrollai
end-to-end; requestsettings' CardTitle/level-approver forms; the
careers/externaljobapplication heroes; the organizationsetup +
dynamicdashboard alias pins (R31-B1) and the ess superset hold.

**Pins**: 18 new (A1-A8, B1-B8 + B4b/B4c) + 5 amended predecessors (the
R12-F trigger, the R13-A payrollmodule/surveyanalytics icon pins, the
R14-D pill wrapper, the R15-E pill surface — all evolved to the Tabs
form or the new glyphs). Gates: lint 0/0 · tsc ✓ · **789/789 unit**
(+18) · build ✓ · **252/252 E2E** (+10 — the session-50 deep-interiors
spec). Live: **verify-r49 13/13 pairs MATCH** (the census routes,
member-set + COMPUTED-STYLE normalized — the round's instrument upgrade:
svg reads now carry `16x16/rgb(...)` computed geometry, which subsumes
the guard-size translation family and catches REAL color drift; the
documented pairs: #fafafa≡#fff on the CTA text, the lab() serialization
on yellow-600, the recharts mount order) + standing audits 5/5 + route
sweep 12/12 + **verify-r45 13/13 ×2** (the 16TH login deploy
`DCDf2KCA`→`BBQoN-vG` mid-round and a 17TH `BBQoN-vG`→`DJGK9Qoy` at
round end — the login surface visually quiet through both). 26
screenshots (219-231 pairs + the numbering check) → **366 PNG**. DB
pristine (users=1 — the verify-r45 loading-probe user swept AGAIN, the
known per-window trap; employees=1, balances=2, avatarUrl=null).
`.env.example` verified.

**The tooling lessons**: the SVG census trap — `el.className` on SVG
elements is an SVGAnimatedString, not a string (`.replace` throws);
every reader must go through `getAttribute('class')`; the
agent-browser childNodes phantom-space artifact — React SSR inserts
`<!-- -->` separators between adjacent text children, and a childNodes
walk shows them as `" "` text entries (textContent itself is tight —
verify with a raw read before pinning any "spaced text" diff); the
paramiko shim's wrapper needs the explicit `--remote
git@github.com:nordeim/eon-hr.git` (its DEFAULT_REMOTE is the
task-management repo — a dry-run against the default fails
non-fast-forward against an unrelated history); the orchestrator's
outer run() must exceed verify-r45's full runtime (a 120s cap
ETIMEDOUT the whole audit — the buffered output is lost on timeout).\n