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
| Unit tests | `bun run test` (Vitest, 1001 specs) |
| E2E tests | `bun run test:e2e` (Playwright, 550 specs — needs `bun run build` first; the runner does NOT build for you) |
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
## Session 51 (parity round 50) — the route-casing alias + the mobile-nav census

Pulled to `f228a08` (the owner's session_102 journal — docs-only on the
landed round-49 `c1c44e7`); the baseline held (789/789 unit · 252/252
E2E). The round's census re-verified the frontier's live edges and found
one real functional gap.

**The 18TH login deploy** (JS `DJGK9Qoy` → `ChN8O3_i`, CSS quiet) —
verify-r45 re-audited standalone: **13/13 MATCH** (the standing-run
orchestrator's embedded copy ETIMEDOUT under load — the documented
cap-trap; the standalone run is authoritative). App side quiet through
the deploy: standing audits **5/5** + route sweep **12/12**.

**THE FINDING — the /Dashboard route-casing gap**: REF's platform
serves routes case-insensitively (both `/Dashboard` — its canonical
form, the target of its own /organizationsetup + /dynamicdashboard
redirects — and `/dashboard`, its internal-link form, render the
dashboard; the lowercase URL stays lowercase). The clone 404'd on the
capital form. **The fix**: a `next.config.ts` rewrite
`/Dashboard → /dashboard` — the URL bar keeps `/Dashboard` exactly like
REF (a rewrite, not a redirect), the content/metadata/auth-guard riding
the real lowercase route. Chosen over an R31-B1-style re-export
DIRECTORY because `Dashboard/` beside `dashboard/` collides on
case-insensitive checkouts (macOS). Scope: the canonical form only.
Pinned by R51-A1/A2 (unit) + the session-51 casing spec (3 E2E: the
URL-unchanged serve, the lowercase regression guard, the auth-guard
ride-through) + a live paired read (path/h1/title/widgets MATCH).

**The mobile navigation census** (the round's called-out surface, paired
live at 390×844 on /dashboard): the kicker EXACT (`md:hidden sticky
top-0 z-20 … px-4 py-3 safe-area-top`, h=53, y=89, the scroll-away
truth — scrollY 178 both sides); the header EXACT; the bottom bar +
five tabs render-equal (member-order-only variances + the clone's
`pb-[env(safe-area-inset-bottom)]` safe-area superset member; the
active tab computes identically — rgb(37,99,235) on rgb(239,246,255));
the drawer render-equal (w=288, borderR 1px #e5e5e5, bg #fafafa, the
500ms/300ms slide timings — REF authors `data-[state=*]:duration-*`,
the clone the explicit `[animation-duration:*]` utilities; the footer
census: REF's 13 = the clone's 12 + REF's sheet-Close which REF itself
hides via `[&>button]:hidden`; REF's 2 unlabeled buttons = the clone's
aria-label supersets; the overlay computes rgba(0,0,0,0.8) both sides).

**The byte-parity backlog assessed**: the CardTitle text-base/
leading-none per-page pair (the DIV base matches REF's default form;
the leading-none pages' text-base is inert — a DIV inherits 16px), the
badge-span leading-5 no-op (text-sm's default IS leading-5), the
#fafafa/#fff CTA-text pair (REF per-button inconsistent, computed
equal), the chart line-count/mount-order pairs — all documented
render-equal allowances, no action.

**Pins**: 2 new (R51-A1/A2) + the session-51 casing spec (3). Gates:
lint 0/0 · tsc ✓ · **791/791 unit** (+2) · build ✓ · **255/255 E2E**
(+3). 8 screenshots (232-235 pairs — the mobile at-rest chrome, the
drawer open, the casing alias desktop + mobile) → **380 PNG**. DB
pristine (the verify-r45 loading-probe user swept AGAIN — the known
per-window trap; sweep-loading-probe.ts persisted). The doc-count
refresh: CLAUDE/README/AGENTS/SKILL aligned to 791/255 (the CLAUDE
table and the SKILL State line had drifted sessions behind).

**The round's instrument lessons**: the agent-browser eval flakes on
long one-shot reads (split the drawer panel/footer reads — the
zone-probe's combined eval failed both sides while the split reads
worked); a `div.md\:hidden`-sticky filter on a 404 page finds nothing —
always confirm the page rendered before reading interiors (the casing
gap masqueraded as a missing kicker for one probe iteration); the
`:3200` standalone server SURVIVES the orchestrator's process exit
(sometimes) — always kill-by-port before rebooting on a new build.

## Session 52 (parity round 51) — the nav-registry drift check + the drawer-group census

Fresh clone to `6a39a75` (the owner's session_104 journal —
docs-only on the landed round-50 `01c4c2d`); baseline gates ALL
GREEN (791/791 unit · 255/255 E2E — the one session-40 input-family
flake re-verified green isolated, the documented dialog-animation read
under load). The census re-armed the frontier's live edges and extended
them with two new measurements.

**The 19TH login deploy** (JS `ChN8O3_i` → `CimHfPLG`, CSS `CpjiugAb`
quiet, app fingerprints `C-IrDy5f`/`BGNH4KkS` unchanged) — verify-r45
re-audited standalone: **13/13 MATCH**. App side quiet through the
deploy: standing audits **5/5** + route sweep **12/12** + **verify-r49
13/13** (the newest deep-interior instrument re-run as the confirmation
ladder).

**THE NAV-REGISTRY DRIFT CHECK** (a new census — REF's login build is
under ACTIVE development; its nav tree could have grown modules the
clone lacks): all 8 REF groups expanded live, the complete tree read,
and compared against the clone's `NAV_ITEMS` — **44/44 links match**
(same hrefs, labels, order; the 5 bottom tabs + the dashboard's
in-page links all present in the clone's 61-route registry). No new
REF modules. **Pinned** (R52-A1/A2): the ordered 44-href registry
tripwire — any future drift on EITHER side surfaces as a RED pin
immediately.

**The mobile drawer's EXPANDED-GROUP interior** (the user-called-out
surface's last unpaired zone — round 50 pinned the at-rest chrome +
panel/footer; the expanded groups' interiors were E2E-covered but
never paired-live): the Employees + Analytics groups paired at
390×844 — the group trigger heads member-set MATCH; the sub-item
family **computed-truth MATCH** (gap 12px, display flex, padding, 32px
rows, 16px icons, rgb(71,85,105)). The one cls delta: REF's sub-item
class lists carry `gap-2 gap-3` + a duplicated `flex` (its runtime
CONCATENATES the shadcn base with the per-item extensions) while the
clone's `cn()` dedupes to `gap-3` — the computed cascade resolves both
to the same rendered family (the round-50 tab member-order allowance's
sibling). **Pinned** (R52-B): the E2E computed-contract — the expanded
group's sub-items compute gap 12px / display flex / 32px rows — so a
Tailwind engine change or a nav refactor cannot silently drift the
drawer's interior.

**The doc-count refresh** (the census's codebase validation surfaced
stale structural counts — the test counts were current but the
route/API/model counts had drifted): CLAUDE (51→54 API endpoints,
60→61 routes, the stale "47 routes render" E2E claim → the 61-route
registry, 793/256 + the session-52 tails), README (45→47 models ×3,
49→54 handlers, 46→61 (app) routes, 255→256), PAD (45→47 models ×3,
the 748-line schema). Historical session layers stay untouched (the
r51 precedent).

**Pins**: 2 unit (R52-A1/A2) + 1 E2E (R52-B). Gates: lint 0/0 ·
tsc ✓ · **793/793 unit** (+2) · build ✓ · **256/256 E2E** (+1).

**The round's instrument lessons**: the agent-browser long-eval flake
re-hit (a ~1.2k-char one-shot failed under rapid sequencing on BOTH
apps while the same eval ran clean standalone — the retry guard +
the split reads are the standing fix; the r52 evalOn pattern: parse
agent-browser's pretty-printed object output directly, unwrap quoted
scalars, retry once on command failure); the computed-truth census
method — when the platforms differ in class-list CONSTRUCTION
(concatenation vs merge), pin the computed cascade result (gap/
display/padding), never the class bytes; the workspace-reap pattern
(boot the :3200 server inside every orchestrator call — the sandbox
reaps detached processes between calls; the agent-browser daemon
survives because it self-daemonizes).

## Session 53 (parity round 52) — the 20th-deploy re-audit + the bottom-nav active-state family

Fresh clone to `da2abaf` (the owner's session_106 journal — the
session-52 process log, docs-only on the landed round-51 `17182a9`);
baseline gates ALL GREEN (793/793 unit · 256/256 E2E, no flakes). The
census re-armed the live edges through the round's deploy event and
completed the called-out surface's state family.

**The 20TH login deploy — the first to change BOTH chunks** (JS
`CimHfPLG` → `C2ujlke6`, CSS `CpjiugAb` → `D5oCh2kx`; app
fingerprints `C-IrDy5f`/`BGNH4KkS` unchanged) — verify-r45 re-audited
standalone: **13/13 MATCH**. App side quiet through the deploy:
standing audits **5/5** + route sweep **12/12** + **verify-r49 13/13**
(the confirmation ladder).

**THE NAV-REGISTRY DRIFT RE-CHECK**: both chunks of the login build
churned — the strongest re-read justification yet. BOTH sides'
complete desktop trees re-read live (all groups expanded, 1440×900):
**52 entries each — 10 group triggers + 44 leaves — labels, hrefs,
and order all MATCH**. Zero drift through the 20th deploy; the
R52-A1/A2 tripwires remain the standing guard.

**THE BOTTOM-NAV ACTIVE-STATE FAMILY** (the user-called-out surface's
last state gap — rounds 50/51 censused the active tab on /dashboard
only): all FIVE tab routes paired live at 390×844 — each route
highlights exactly its own tab (Home/Staff/Tasks/Attendance/Profile),
the active tab computing `rgb(37,99,235)` on the `rgb(239,246,255)`
pill, the siblings `rgb(71,85,105)` on transparent, icons tracking
their labels — identical both sides on all five routes. **Pinned**
(R53-A): the E2E test walking the four unpaired tab routes asserting
each tab's active computed styles + an inactive sibling — a
nav-config active-matching regression (pathname === href is exact) or
a Tailwind engine change now surfaces as a RED pin immediately.

**The audit's small fix**: the vitest.config.ts header comment still
carried another project's domain list ("router, clarify questions,
plan sanitizer, check-in mapping" — the task-management heritage);
aligned to the real unit seams (db-path, auth, utils, tokens,
validation, the recipe pins). No behavior change.

**Pins**: 1 E2E (R53-A). Gates: lint 0/0 · tsc ✓ · **793/793 unit**
(unchanged) · build ✓ · **257/257 E2E** (+1).

**The round's instrument lesson**: the per-route state-family census
— when a state recipe (the active tab) is route-dependent, census
the family across EVERY route that exhibits it, not just the first
(/dashboard); the E2E pin then walks the same family so the
active-matching logic is guarded per-route, not per-recipe.

## Session 54 (parity round 53) — the mobile-nav interaction walk

Fresh clone to `aad1e74` (the owner's session_108 journal — docs-only
on the landed round-52 `dc2201c`); baseline gates ALL GREEN (793/793
unit · 257/257 E2E, no flakes). The census took the user-called-out
surface to its deepest level: the full user journey paired live.

**The deploy watch: both sides QUIET** — login `C2ujlke6`/`D5oCh2kx`
unchanged (no 21st deploy), app `C-IrDy5f`/`BGNH4KkS` unchanged.
The standing audits **5/5** + route sweep **12/12** + **verify-r49
13/13** + **verify-r45 13/13** (the full confirmation ladder).

**THE MOBILE-NAV INTERACTION WALK** (`scripts/r54-census.mjs`, both
apps at 390×844, seven paired phases): the at-rest chrome (hamburger
28×28 + the 5-tab bar) MATCH · the hamburger tap's settled drawer
family (overlay rgba(0,0,0,0.8), panel 288px/#fafafa/#e5e5e5 border,
transform settled — computed-truth only; the panel class bytes are
the documented construction allowance) MATCH · the drawer's DEFAULT
group-state map (all 9 aria-controls triggers collapsed) MATCH · the
Payroll group expansion round-trip (aria flip + 5 sub-items) MATCH ·
**the leaf-tap round-trip — the ONE interaction divergence**: REF
navigates to /training and KEEPS the drawer open (data-state=open at
500ms/1900ms); the clone navigates and CLOSES it. This is the
**documented reference regression** found at session 10/11 (3/3
trials then; the SKILL §21 deviation list), re-verified live 43
rounds and 20 login deploys later — the deviation direction is kept
(the clone's auto-close is the superset: standard mobile UX + the
pathname-change effect covering browser-back) · the overlay tap
(full pointerdown/up sequence — Radix ignores bare click() dispatches)
MATCH · the bottom-tab tap + active pair MATCH. **Verdict: 7/9, the
2 DIFFs both being the documented deviation — no new gaps.**

**Pinned** (R54-A): the drawer's default collapsed-group map E2E
guard — all 8 nav group triggers + the footer bell render
aria-expanded="false" at first open, the collapsed groups' sub-item
leaves hidden (the full-menu pin asserts the 13 labels render but
not the collapsed-default contract). Plus the E2E comment fix: the
drawer-geometry test's "(closing happens via overlay tap / Esc /
navigation)" line implied navigation-close is REF behavior — now
cites the documented deviation instead.

**Pins**: 1 E2E (R54-A). Gates: lint 0/0 · tsc ✓ · **793/793 unit**
(unchanged) · build ✓ · **258/258 E2E** (+1).

**The round's instrument lessons**: the interaction-walk census —
when a surface's static families are all pinned (rounds 50–52), the
next frontier is the full user journey (open → expand → navigate →
dismiss); the interaction family is where never-paired-live
divergences hide. The visible-link rule: a raw selector click hits
the FIRST DOM match — on the clone that's the hidden desktop-sidebar
copy (DOM order differs between the platforms) — filter for
visibility before clicking. The symmetric-settling rule: paired
reads must settle for the same delay after their dispatches (the
mid-exit read is a false DIFF). The Radix overlay rule: the
outside-close contract listens for pointerdown/up, not bare
click() — synthetic overlay taps need the full pointer sequence.

## Session 55 (parity round 54) — the auth-boundary navigation walk

Workspace continued from `dcf2f22` (the owner's session_110 journal,
docs-only on the landed round-53 `7207390`); baseline gates ALL GREEN
(793/793 unit · 258/258 E2E, no flakes). The census took the §64
lesson to the surface every prior round passed THROUGH but never
measured: the URL-level user journey at the session boundary.

**The deploy watch: both sides QUIET** — login `C2ujlke6`/`D5oCh2kx`
unchanged (no 21st deploy), app `C-IrDy5f`/`BGNH4KkS` unchanged.
The confirmation ladder green: standing audits **5/5** + route sweep
**12/12** + **verify-r49 13/13** + **verify-r45 13/13**.

**THE AUTH-BOUNDARY NAVIGATION WALK** (`scripts/r55-census.mjs`,
seven paired phases, desktop 1440×900): **1/7 MATCH — six real
functional gaps, one family.** REF's post-login landing is the ROOT
`/` (which serves the dashboard URL-unchanged); the clone landed at
`/dashboard`. REF's logged-out guard carries the REQUESTED absolute
URL as `from_url`; the clone's (app) layout hardcoded
`from_url=/dashboard` for every route (App Router layouts receive no
pathname). REF's logout carries the CURRENT page as `from_url`; the
clone's `/logout` dropped the context. REF's from_url is the FULL
ABSOLUTE URL; the clone's login only honored path-form params. The
deep-link round-trip (share a URL → sign in → land where you meant
to go) worked on REF and broke on the clone.

**The fixes** (all closed, post-fix census **7/7 MATCH**):

- **The root rewrite** (`next.config.ts`, `{ source: "/",
  destination: "/dashboard" }` — the session-51 URL-unchanged-serve
  pattern's sibling): the dashboard serves AT the root like REF's
  index route; `src/app/page.tsx` removed (dead code under a
  beforeFiles rewrite).
- **The edge proxy** (`src/proxy.ts` — Next 16's proxy.ts convention,
  middleware.ts being the deprecated name): cookie-presence guard at
  the edge carrying `from_url=<the request's absolute URL>` (built on
  the Host header — the browser's actual authority; `req.nextUrl`'s
  re-derived origin spells the host differently in standalone mode).
  The (app) layout's full HMAC + DB verify stays as defense-in-depth
  for present-but-invalid cookies.
- **The resolver** (`src/lib/login-redirect.ts`):
  `resolveFromUrl(from, origin)` accepts path-form AND same-origin
  absolute URLs; foreign origins, `//`, and `/\` are rejected (the
  open-redirect guard) — the login's default replace target became
  the ROOT.
- **The logout carry** (`src/app/logout/route.ts`): the same-origin
  Referer rides as `from_url` (the user-menu logout navigates via
  `window.location.href` — the browser attaches the current page).

**Pinned**: R55-A..E (6 E2E — the root landing, the root-serve
rewrite, the deep-link round-trip, the logout carry, the open-redirect
guard, the authed-/login stays) + the 9-form resolver unit table +
the R51-A2 rewrite-scope pin updated for the root entry + the
session-47 signup-landing pin updated to the root landing. Gates:
lint 0/0 · tsc ✓ · **802/802 unit** (+9) · build ✓ · **264/264 E2E**
(+6; the one session-40 input-family flake re-verified green isolated
— the documented dialog-animation read under load).

**The round's instrument lessons**: the auth-boundary walk — the
census frontier is not just surfaces; the JOURNEYS BETWEEN surfaces
(sign-in, guard, logout) are themselves a parity family, and every
prior round passed through them unmeasured; the in-place sign-in
rule (a capture that re-opens `/login` fresh wipes the guard's
from_url param — sign in AT the guard's landing when the round-trip
is the evidence); the oneLine eval rule re-hit (multi-line eval
expressions fail on the literal `\n` between tokens — one-line every
expression before stringify).

## Session 56 (parity round 55) — the history journey walk + the read-only surface family

Workspace continued from `a720c84` (git pull brought the owner's
session_112 journal — docs-only on the landed round-54). Baseline
gates ALL GREEN (802/802 unit · 264/264 E2E, no flakes). The census
took the §65 lesson to the next journey layer: the **history
stack's walks** — back, forward, scroll restore, the drawer journey,
the tab journey (the layer every census passes THROUGH after
sign-in, never measured as the object) — plus the **read-only
surface family** the mobile-grid reconnaissance surfaced.

**The deploy watch: both sides QUIET** — login `C2ujlke6`/`D5oCh2kx`
unchanged (no 21st deploy), app `C-IrDy5f`/`BGNH4KkS` unchanged.
The confirmation ladder green: standing audits **5/5** + route sweep
**12/12** + **verify-r49 13/13** + **verify-r45 13/13**.

**THE HISTORY JOURNEY WALK** (`scripts/r56-census.mjs`, seven
paired phases at 1440×900 + the mobile drawer phase at 390×844):
the simple back + forward restore + the two-deep chain + the scroll
restoration + the settings tab journey + the /Dashboard casing +
the mobile drawer journey — 6/7 walk contracts MATCH; the mobile
drawer journey is the documented session-10 deviation re-verified
through its back-navigation extension (REF keeps the drawer open
through the leaf tap AND the back; the clone closes — the superset).
The scroll-restoration note: both apps restore in steady state;
REF's FIRST popstate after a fresh load can reset to top (the SPA
initial-mount race — non-deterministic, [0,40,40] across 3 runs) —
not a contract, no change.

**THE READ-ONLY SURFACE FAMILY** (the supplementary census — four
real visual gaps in REF's `bg-slate-50` read-only recipe, ALL
closed):

- **R56-A — the settings Company Information tiles**: REF renders
  the 9 read-only tiles as `p-4 bg-slate-50 rounded-lg` (computed
  `rgb(248,250,252)` + 8px) with the **Address tile's UNPREFIXED
  `col-span-2`** — the always-on span that forces the 2-track
  implicit grid below md (at 390px REF computes 2 content-sized
  tracks; the clone rendered plain `p-4` tiles with a single
  stacked 921px column). The longest-lived gap of the family: the
  R13-B pin covered the grid + label classes, never the tile
  interiors.
- **R56-B — the profile identity Email**: REF renders it as a
  **disabled input with an authored `bg-slate-50`**; the clone
  rendered it fully editable.
- **R56-C — the profile Phone/Job Title placeholders**: REF renders
  both empty fields bare; the clone carried authored placeholders
  (an early-build authoring, never REF-verified).
- **R56-D — the hrreports thead row**: REF's header row carries
  `border-b bg-slate-50` (computed `rgb(248,250,252)`, 33px,
  inert — no hover tint); the clone rode the shadcn TableRow default
  (transparent + hover tint).

**R56-E — THE HISTORY-STACK CORRUPTION (recorded, not fixed)**: the
census's two-deep chain found the clone's back-back landing on the
pre-load page — root-caused with the Navigation API entry dumps
(`scripts/r56-probe8.mjs`, 5/5 deterministic in the isolated repro,
generic across routes; the beforeFiles rewrite is INNOCENT,
verified with plain routes): after a **full document load of any
(app) route**, the **second client-side navigation** replaces the
fresh-loaded entry's URL with a duplicate of the entry below it —
`["/profile", "/"]` → click → `["/profile", "/", "/staffrequests"]`
→ click → `["/profile", "/profile", "/staffrequests", "/training"]`.
The user loses the page they landed on (back-back skips it). The
clone's own code performs no history manipulation — a **Next.js
16.4.0 App Router framework bug**. Not fixable in-app without
hand-patching framework internals; the E2E pins the CORRECT
one-click back contract (which holds), the repro script stays the
standing detector, and the follow-up is the Next upgrade watch.
See `docs/remediation-plan-session56.md` §B for the evidence trail.

**Pinned**: R56-A..E (5 E2E in
`tests/e2e/session56-readonly-family.spec.ts` — computed-truth: the
tiles' bg/radius/span map, the mobile 2-track grid, the Email
disabled+bg, the absent placeholders, the thead bg, the one-click
back) + 4 unit pins (the R56-A..D recipe family in
`tests/unit/recipes.test.ts`). Gates: lint 0/0 · tsc ✓ ·
**806/806 unit** (+4) · build ✓ · **269/269 E2E** (+5). The
post-fix census re-run: **10/11 MATCH** (the one DIFF = the
documented drawer deviation).

**The round's instrument lessons**: the Navigation API
(`navigation.entries()`) is the ground truth for history-stack
forensics — the URL bar and `history.length` cannot distinguish a
replaced entry from a truncated one; the `agent-browser set
viewport` must be verified with `window.innerWidth` in the SAME
session before mobile-grid measurements (the default viewport is
~1280 and `set viewport` failures are silent); and the two-parse
eval wrapper — agent-browser returns raw objects unquoted and
string values quoted, so the census's `ev()` ERR-wraps half its
returns (the string-equality comparison still holds — compare the
RAW forms, not extracted fields).

## Session 57 (parity round 56) — the affordance-stub family

Workspace re-cloned from `a43972e` (the prior session's R57 work was
lost uncommitted in a workspace reset — this round REDID it from the
landed round-55 state). Baseline gates ALL GREEN (806/806 unit ·
269/269 E2E, 1 dialog-interiors R37-C timing flake green in
isolation). The census took the interaction dimension to the layer
every census SEES but never presses — **the affordance-stub family**
(buttons that fire info toasts in the clone where REF opens real
dialogs / hidden file inputs, plus two invented profile tab interiors).

**The deploy watch: the login side deployed again** — login JS
`C2ujlke6` → `DEszsFDJ` (CSS `D5oCh2kx` unchanged, the app side
`C-IrDy5f`/`BGNH4KkS` unchanged; the login deploys keep rolling).
Per protocol the login re-audit ran: **verify-r45 13/13 MATCH — the
deploy is a non-visual rebuild**. The confirmation ladder green after
the REF session re-auth (the stale-session DIFF pattern of the r56
record): standing **5/5** + sweep **12/12** + **verify-r49 13/13**.

**THE AFFORDANCE-STUB CENSUS** (`scripts/r57-census.mjs`, five paired
phases at 1440×900 — pre-fix **0/6 MATCH**, post-fix **6/6**):

- **R57-A — the employees Import CSV**: REF opens the real **"Bulk
  Import Employees"** dialog (`max-w-5xl max-h-[90vh]` — the
  file-spreadsheet icon title, the 4-step info alert, the `w-full`
  template button, the `border-2 border-dashed` dropzone with the
  filename swap + Process File → "Processing..." states, the
  Cancel/X footer). REF's own **Process File is broken live** (fails
  "Failed to parse CSV file" on its own template's format) — the
  clone ships the WORKING superset: the exact template blob
  (7 columns, live-captured), the client-side parse, per-row
  validation (REF's destructive "Validation Errors:" alert), the
  review table, and `POST /api/employees/import` (admin/hr gate,
  full_name split, duplicate-email skip, the honest
  created/skipped summary).
- **R57-B — the wall Photo/Video**: REF triggers a hidden
  `#media-upload` input (`accept="image/*,video/*"`, class `hidden`,
  ONE shared input for both buttons). The clone completes the flow
  (the superset): the picked file previews in the composer, rides
  the post as multipart FormData, lands in `db/uploads/`, is served
  by `GET /api/media/[name]` (serve-by-extension, strict
  name-guarded), and renders on the post card.
- **R57-C — the settings WhatsApp Connect**: REF opens the real
  **"Configure WhatsApp API"** dialog (`max-w-lg` — the 3 fields
  with REF's placeholders + required pair, the Cancel / Save
  Configuration footer). REF's Save closes silently (nothing
  stored, no tile change — measured); the clone persists to the new
  **`Integration` model (schema at 48 models)** + a success toast.
  **SMS Gateway "Configure" and ZKT "Connect" are no-ops on REF
  too** (measured: no dialog) — the clone's info toasts there are
  the REF-parity stubs, unchanged.
- **R57-D — the profile Social Accounts tab**: REF renders the
  **"Connected Accounts"** card — the 4 `flex items-center gap-4`
  rows (the 48px icon tiles: LinkedIn `bg-blue-100`/`text-blue-600`,
  Twitter `bg-sky-100`/`text-sky-600`, GitHub
  `bg-slate-100`/`text-slate-700`, Facebook
  `bg-blue-100`/`text-blue-700`) + label + URL input (REF's
  placeholders) + the "Save Accounts" footer. The clone's tab was
  INVENTED (the Google/Microsoft/Slack "Connect" list) — rebuilt
  verbatim; the save persists to the 4 new User fields
  (linkedinUrl/twitterUrl/githubUrl/facebookUrl).
- **R57-E — the profile Preferences tab**: REF renders the TWO-card
  recipe — the **Notification Preferences** card (2
  `p-4 bg-slate-50 rounded-lg` toggle rows: Email + Push, both
  checked + the submit "Save Preferences") and the **Danger Zone**
  card (`border-red-200 dark:border-red-900` frame, the
  `text-red-600` plain-div title — NO CardTitle/CardDescription
  pattern, the destructive "Delete My Account" → the DELETE-typed
  confirmation dialog: the destructive alert, the PH "DELETE"
  input, the col-reverse footer, the destructive button disabled
  until the exact word). The clone's tab was the
  duplicate-`value="preferences"` structural bug (the session-15
  language/timezone artifact — REF has no language/timezone card
  anywhere on /profile) — rebuilt verbatim; the superset:
  `pushEnabled` persisted, `DELETE /api/profile` with the explicit
  relation walk, the full deletion round-trip (signup → delete →
  /login).
- **R57-p — the palette pins**: the **sky** family (bg-sky-100 /
  text-sky-600 — UNPINNED, v4's oklch default rendered them in
  lab()) + **red-200/400/800/900** (the Danger Zone frame) added to
  the `@theme` pins.

**Pinned**: 7 unit (the R57-A..p recipe family in
`tests/unit/recipes.test.ts`, RED-first) + 7 E2E
(`tests/e2e/session57-affordance-stubs.spec.ts` — computed truth:
the dialog recipes, the import round-trip, the media round-trip +
the served content-type, the sky/red computed colors, the
DELETE-typed gate + the full deletion round-trip). Four legacy pins
followed their recipes to the new homes (R19-F / R46-G1 / the
session-47 mr-2 amendment → `bulk-import-dialog.tsx`; the R14-E pin
inverted to the REF-verified truth — the artifact's ABSENCE).
Gates: lint 0/0 · tsc ✓ · **813/813 unit** (+7) · build ✓ ·
**276/276 E2E** (+7, no flakes) · post-fix census **6/6 MATCH** ·
DB pristine (1/1/2).

## Session 58 (parity round 57) — the CTA-fill recipe family

Workspace re-cloned from `4648058` (the round-56 landing; the repo
moved to `/home/z/eon-hr` — the standing scripts' hardcoded absolute
paths patched to derive the repo from the script location,
`verify-r49.mjs`). Baseline gates ALL GREEN (813/813 unit · 276/276
E2E, 1 session-40 flake green in isolation). The census took the fill
dimension to the computed background of every primary action — **the
CTA-fill recipe family** (`scripts/r58-fills-final.mjs`, all 50
routes, paired live).

**The deploy watch: the login side deployed again (the 22nd)** —
login JS `DEszsFDJ` → `DclSb8FG`, login CSS `D5oCh2kx` → `V5v1Fmok`
(BOTH rolled; the app side quiet). Login re-audit: **verify-r45 13/13
MATCH — a non-visual rebuild**. Ladder green after the REF re-auth:
standing **5/5** + sweep **12/12** + **verify-r49 13/13**.

**REF maintains FIVE fill recipes; the clone had converged on one
gradient.** The taxonomy (all live-measured):

1. **The blue gradient CTA** (pinned session-4) — the clone matches
   everywhere REF uses it (employees, attendance, payroll, loans'
   header, offboarding, templates, workflowautomation, compliancedashboard,
   assetmanagement, leavemanagement, allleaverequests, payrollai,
   advancedanalytics, hrassistantchat, careers…).
2. **The DARK solid** — `bg-primary` **#171717** (hover /90, dark
   #fafafa). Drift sites closed (R58-1..7): the wall Post, the
   profile's four saves, the loans empty-state CTA, tenantsetup
   Continue, securitysettings Save (REF's LOCK glyph, not
   ShieldCheck), the hrassistant send (**48×36** default-size
   icon-only — not a 48×48 square), the employees view-toggle pair
   (dark + `size="sm"`).
3. **The BLUE-600 solid** — `bg-blue-600 hover:bg-blue-700`
   (#2563EB→#1D4ED8, palette-pinned). Sites (R58-8..12): staffrequests
   New Request, documenttracker Add Document, workflowconfigpage ×2
   (the inline `className="bg-blue-600"` hack painted over by the
   gradient default — background-image wins over background-color —
   retired for the variant), recruitmentkanban Add Applicant,
   notificationpreferences Save Preferences.
4. **The INDIGO-600 solid** (R58-13..14): evaluations New Review
   (size sm, 125×32), performancemanagement Set New Goal.
5. **The TEAL-600 solid** (R58-15): surveyanalytics Run AI Analysis
   (teal-700 `#0f766e` added to the `@theme` pins — it was
   unpinned).

Plus: **R58-16** — REF's REVERSED gradient on recruitment's Post New
Job (`from-indigo-600 to-blue-600` — the `indigoBlue` variant);
**R58-17** — expenses' New Expense is REF's purple→pink (the existing
`pink` variant); **R58-18 (P1)** — the assets' Add Asset rendered NO
fill at all (the `bg-none` + v3-utility authoring: background-image:
none sorts AFTER the gradient utilities in v4's single cascade layer
— near-white text on transparent, effectively invisible); now
`variant="green"`.

**R58-19..20 — the form-control checked fills**: the shared Switch +
Checkbox resolved `data-[state=checked]:bg-primary` against
`--color-primary` (#1877F2 — the Facebook blue the theme deliberately
carries for the active-nav custom classes) — every checked control
rendered the Facebook blue where REF renders the dark #171717
(verified on the profile Preferences pair, the six notif-prefs
switches, the four securitysettings checkboxes). Both components pin
the literals (#171717, dark #fafafa); the token stays for the nav.

**R58-24 — the toggle order + gap re-measure**: REF renders the
employees view-toggle pair **LIST FIRST** (x=1301), GRID second
(x=1349), `flex gap-2` (8px) — the session-14 "Grid first" order
flipped in one of the 22 deploys since (and the clone's gap-1
measured 4px). Post-fix the pair reads byte-identical both sides.

**R58-21** — the interviewassistant Analyze Interview is `w-full` as
a direct child of the `p-6 space-y-4` card body (not nested in the
notes' `space-y-2` div).

**R58-22 — the profile DELETE walk's three missing non-cascade
relations** (the Phase-2 audit, live-verified `P2003` on a throwaway
db copy): `Asset.assignedToId` (detach), `Review.reviewerId`
(required — the reviewer's pending reviews go),
`SurveyResponse.employeeId` (required — the responses go). Any
account whose employee held any of them could NOT be deleted (the
r57 round-trip only exercised a fresh signup user). The walk clears
all three; the E2E guard plants all three rows on a fresh user and
deletes cleanly. **R58-23** — the posts multipart path now enforces
the JSON path's content `max(2000)`.

**Pinned**: 10 unit (the R58 family in `tests/unit/recipes.test.ts`,
RED-first) + 10 E2E (`tests/e2e/session58-cta-fills.spec.ts` —
computed truth: the fills per route, the switch/checkbox colors, the
toggle geometry + round-trip, the send geometry, the w-full CTA, the
multipart cap, the with-data deletion round-trip). Gates: lint 0/0 ·
tsc ✓ · **823/823 unit** (+10) · build ✓ · **286/286 E2E** (+10, no
flakes) · post-fix census **16/16 fills MATCH** · DB pristine (1/1/2).

**The round's instrument lessons**: (1) a bash `$(...)` substitution
mangles the nested template strings — the census verification loop
produced false MATCHes until the reads moved into the node `evalOn`
path; (2) hover states contaminate computed-color reads (the parked
mouse holds `:hover` — Chromium serializes the `/90` color-mix as
`lab()`/`oklab()`), move the mouse away before at-rest reads; (3) the
fill census reader must classify "any non-plain fill", not the
expected set — the first reader MISSED REF's indigo/teal solids; (4)
`to right` vs `90deg` is Chromium's serialization equivalence, not a
drift; (5) JSX attribute expressions take plain `/* */` comments —
`{/* */}` inside `actions={…}` is a parse error.

## Session 59 (parity round 58) — the badge/chip fill family

Workspace re-cloned from `5275d41` (the round-57 landing + the
session-118 docs). Baseline gates ALL GREEN (823/823 unit · 285/286
E2E, the session-58 switch/checkbox spec 11/11 green in isolation —
the documented flake-check). The deploy watch: the login side deployed
AGAIN (the 23rd: login JS `DclSb8FG`→`CpCk8Zmk`, CSS
`V5v1Fmok`→`A8a43VEI`; the app side quiet) — verify-r45 13/13 MATCH, a
non-visual rebuild; the ladder green after the REF re-auth (standing
5/5 + sweep 12/12 + verify-r49 13/13).

**The census (`scripts/r59-badge-census.mjs`, all 49 routes, paired
live): every NON-button leaf's computed fill** — the layer the r58
button census sees but never reads. Pre-fix 44/49, post-fix 47/49 (the
two documented allowances below).

- **R59-A — the taskmanager count chips are STATUS-TINTED per column**:
  Backlog `bg-slate-100 text-slate-700`, To Do `bg-blue-100
  text-blue-700`, In Progress `bg-yellow-100 text-yellow-700`, Review
  `bg-purple-100 text-purple-700`, Done `bg-green-100 text-green-700`
  (the chip shape + REF's transition/focus members). The clone rendered
  the uniform slate — the session-6 pin measured only Backlog and
  generalized (the census blind spot pattern).
- **R59-B — the recruitmentkanban stage chips**: Applied
  `bg-slate-200`, Interviewing `bg-blue-100`, Offer `bg-amber-100`
  (REF keeps TWO warning shades across its own pages — amber here,
  yellow on the taskmanager), Hired `bg-green-100`, Rejected
  `bg-red-100`, all `text-*-700`. The class prefix was already
  byte-identical; only the tint members drifted. The dead `dot` config
  members retired.
- **R59-E — the securitysettings Enabled form**: REF's badge carries
  the **CircleCheckBig glyph** (`w-3 h-3 mr-1`, 92px vs the clone's
  76px) + the `shadow hover:bg-primary/80 border-green-200` members;
  the Disabled form stays the plain slate. The r48 round had measured
  only the zero-state Disabled form; the census's "timing artifact"
  DIFF decomposed into the wait lesson AND this real 16px gap.
- **R59-D — the trap-2 palette sweep**: the census's `lab()`
  serializations exposed the oklch drift on every unpinned shade in
  active use. Sixteen pins landed: yellow-100/600/700,
  amber-100/400/600/700, red-100, purple-100/700, emerald-100/700,
  violet-100/700, pink-600 (the v3 hexes, byte-identical to the
  REF-measured rgb() truths) — ending the drift on the Badge variants,
  the compliance alerts, the analytics icon colors, and the
  communications/payrollmodule chips.
- **R59-C — documented allowance**: the profile role badge recipe
  matches byte-for-byte; the TEXT reads "Admin" (the clone's seed —
  load-bearing for the requireRole superset gates + the admin-gated
  E2E round-trips) vs REF's "User". Do NOT flip the seed role.
- **The with-data frontier re-verified**: REF's own Create Employee
  wizard is a silent no-op live (4 steps → Create → no row, no toast)
  — the employees-table surfaces stay REF-unmeasurable; the clone's
  working wizard remains the superset.

**Pinned**: 5 unit (the R59 family in `tests/unit/recipes.test.ts`,
RED-first — the two chip maps, the sixteen pins, the single-use guard)
+ 6 E2E (`tests/e2e/session59-badge-fills.spec.ts` — computed truth:
the ten chip fills, the palette rgb() renders vs lab(), the seeded
Active badge's pinned emerald pair, the five securitysettings badges
with the icon + 92px geometry). Gates: lint 0/0 · tsc ✓ · **828/828
unit** (+5) · build ✓ · **291/291 E2E** (+6, no flakes) · post-fix
census 47/49 · DB pristine (1/1/2).

## Session 60 (parity round 59) — the dark-mode fill family

Workspace re-cloned from `cfce320`. Baseline gates ALL GREEN (828/828
unit · 290/291 E2E, the session-58 switch/checkbox spec 11/11 green in
isolation — the documented flake-check). The deploy watch: BOTH SIDES
QUIET (login `CpCk8Zmk`/`A8a43VEI`, app `C-IrDy5f`/`BGNH4KkS`); the
confirmation ladder green (standing 5/5 + sweep 12/12 + verify-r49
13/13 + verify-r45 13/13).

**The census (`scripts/r60-darkfill-census.mjs`, all 49 routes, paired
live, DARK mode via the shared localStorage contract): the union read
— button fills INCLUDING backgroundImage + the non-button leaf fills.
Pre-fix 39/49, post-fix 45/49** (the four remaining DIFFs documented:
the profile role text, the employees with-data leaves, REF's live
careers postings, the 404 tag superset).

- **R60-A — the checkbox dark pair + the both-themes glyph**: REF's
  dark form = bg #fafafa (its dark --primary) + the #171717 check
  (primary-foreground) + the glyph authored `h-4 w-4` (14×16 rendered
  — the flex shrink, REF-measured). The r58 pin (#171717 + the
  invented dark:text-white, built on "REF never renders a checkbox in
  dark" — disproven: five rows render) and the r48 h-3 w-3 were both
  superseded. Fix: `dark:data-[state=checked]:bg-[#fafafa]` + the
  token + h-4 w-4.
- **R60-B — the employees default view is GRID**: REF boots
  GRID-active (three fresh loads + the reload test — nothing
  persists); the clone booted list. The r58-24 "byte-identical" was a
  set-comparison blind spot. Three legacy E2E flows updated.
- **R60-C — the settings Company edit is an INLINE 12-field form
  flip**: REF's press replaces the card content with the measured
  recipe (the 2-col 24px-gap grid, the 12 labels, the placeholder
  strings verbatim, Save Changes in the header + the lucide-save
  glyph, Cancel at the bottom-right). The clone's dialog retired; the
  schema/API gain logoUrl/city/country; the working PATCH superset
  stays (REF's own form renders empty + its Save is a silent no-op).
- **R60-D — the compliance notify tints**: per-severity members on the
  outline base (red/orange/yellow-600 text + *-200 border + *-50
  hover — the tints do NOT flip in dark). Four palette pins
  (orange-200/50, yellow-200/50).
- **R60-E — the blue-600 text split**: REF authors literal text-white
  on workflowconfigpage x2 + notificationpreferences (255,255,255 both
  themes); recruitmentkanban/staffrequests/documenttracker/the chat's
  new-chat keep the flipping primary-foreground token. The clone had
  both sides inverted. The prior censuses never read button text
  colors.
- **R60-F — the payrollengine Generate Payroll is the FLAT emerald
  solid** (backgroundImage: none, both themes): the clone's className
  authoring left the default gradient in the class list —
  tailwind-merge does not conflict bg-emerald-600 with the arbitrary
  gradient image class, so the gradient PAINTED OVER the emerald in
  BOTH themes. A P1-family bug a color-only census cannot see; fixed
  via the new `emerald` variant.
- **R60-G (documented)** — the 404 Go Home: byte-identical computed
  fills both themes; REF renders a button, the clone keeps the
  r36-documented <a>-link superset.

**Pinned**: 6 unit (RED-first; the R32-A9/R48-C2b/R58-8..12 legacy
pins amended to the re-measured truths) + 6 E2E
(`tests/e2e/session60-dark-fills.spec.ts` — computed truth, both
themes). Gates: lint 0/0 · tsc ✓ · **834/834 unit** (+6) · build ✓ ·
**297/297 E2E** (+6, no flakes) · post-fix census 45/49 · DB pristine
(1/1/2 — the sweep gained the non-cascade FK walk: the stray's
NotificationPreference P2003'd the bare delete).

## Session 59 instrument lessons (the badge-fill census, carry-forward)

**The r59 lessons** (the badge-fill census): (1) `agent-browser close --all`
RESETS THE VIEWPORT — re-opened sessions default to 1280×577 and the
verify scripts ride the ref session's existing viewport, so always
re-set 1440×900 on the ref session after any reset (a fresh-opened
ref produced a 12/13 verify-r49 with pure viewport-artifact chart
widths); (2) data-gated badge reads need CONTENT waits, not fixed
milliseconds (the census missed REF's four Enabled badges at 400ms —
the Loader2 gate); (3) the census leaf filter (children.length > 0)
hides icon-bearing badges — the census is the survey, the E2E pin
(icon class + geometry) is the contract; (4) a "false DIFF" deserves
one more look — the securitysettings artifact decomposed into a
timing lesson AND a real 16px structural gap (the CircleCheckBig
glyph).

## Session 60 instrument lessons (the dark-fill census, carry-forward)

**The r60 lessons**: (1) **the `"$Abcd1234"` shell-expansion trap** — a
password fill passed in DOUBLE quotes inside an execSync template
literal expands the unset shell variable to EMPTY; every "re-auth"
silently fails and the browser keeps its stale cookie (the symptom:
sessions that "refuse" to re-auth + intermittent login-page reads);
always single-quote; (2) REF's session TTL is short (~5 min
idle/sequential-load) — the census re-auths every 15 routes +
login-page detection, and a combined orchestrator can outlive the
cookie — run ladder components individually when the combined run
shows session-death DIFFs; (3) **a bg+backgroundImage census beats a
backgroundColor-only census** — the payrollengine bug computed the
"right" color while the gradient image painted over it; (4) the
client-rendered 404 needs content waits (the Go Home renders after the
client boot; REF renders it server-side); (5) **set-comparison hides
mapping inversions** — the r58-24 "byte-identical" claim compared fill
sets, not per-button mappings; (6) color reads must settle the
150ms transition-colors after a theme toggle (a mid-flight read
catches the blend — rgb(60,60,60) between #fafafa and #171717).

## Session 57 instrument lessons (carry-over, from the round-56 record)

**The r57 lessons**: (1) a bare eval `.click()` on a
Radix TabsTrigger fires no `pointerdown` and the tab NEVER
activates — the paired-phase tab interactions must use the
browser's REAL click path (snapshot ref → `agent-browser click`);
(2) `//` comments inside a census eval template swallow the rest of
the expression when the newlines collapse to spaces (the
one-line join) — keep eval templates comment-free; (3) the
two-parse `ev()` wrapper ERR-wraps bare-string returns — every
state read must return JSON (the session-56 §instrument lesson,
re-learned); (4) the exported-`DATABASE_URL` trap re-fires per
tool-call (the shell is not persistent for unsets) — prefix every
db-touching command with `unset DATABASE_URL` or
`env -u DATABASE_URL`.

## Session 61 (parity round 60) — the dark-mode text-color family

Workspace continued from `3417545`. Baseline gates ALL GREEN (834/834
unit · 297/297 E2E). Deploy watch BOTH SIDES QUIET
(`CpCk8Zmk`/`A8a43VEI` + `C-IrDy5f`/`BGNH4KkS`); the confirmation
ladder green (standing 5/5 + sweep 12/12 + verify-r49 13/13 +
verify-r45 13/13).

**The census (`scripts/r61-textcolor-census.mjs`, 49 routes, paired
live, DARK): the computed `color` of every text-bearing NON-button
element (h1–h6, text leaves, non-button icons) + ::placeholder
colors — the recorded r59/r60 blind spot closed. Comparison: the
deduped (tag|color) set, text-agnostic; every DIFF decomposed
element-level (7 probes). Pre-fix 23/49, post-fix 40/49** (nine
documented DIFFs: the profile role badge + a hidden-kicker-icon
census artifact, the interviewassistant r48-C1 superset card, four
data-driven leaves, the onboardingtemplates 404 icon, the attendance
admin superset).

- **R61-A**: the four unpinned shades pinned (orange-500/700/900,
  purple-500 — the lab() serializations) + green-400 (the fix's own
  new consumer).
- **R61-B/V**: the seven search/filter icons — REF authors
  `text-slate-400` unflipping; the clone rode the flipping
  muted-foreground token (payroll, chat ×2, documenttracker,
  assetmanagement, recruitmentkanban, recruitment + Users→Filter).
- **R61-C**: the compliance severity chips hand-rolled — per-severity
  card borders + DIV values (text-3xl font-bold mb-1 text-*-700,
  unflipping, both themes) + DIV labels (text-xs text-slate-500);
  NOT the mini-centered StatCard (which stays for hrreports/npref —
  REF renders P values there, a different recipe).
- **R61-D/E/F/G**: the at-risk TriangleAlert + the 48px green-400
  empty state; the evaluations per-tile value colors (the StatCard
  span honors valueClassName) + the lost r11 mt-6 restored (the
  tab→stats gap REF 24px vs clone 8px); the securitysettings blue
  Shield glyphs (the r48-C2 check was a feature-row generalization).
- **R61-H..K**: the chat h2 slate-900 + the BARE search wrapper (the
  px-4 pb-4 centered the icon 8px low); the payroll DollarSign empty
  icon; the payrollai CardHeader + p-6/py-12 stack.
- **R61-L..O**: the interviewassistant standard placeholder + the
  hint retired (the AI Analysis card stays — the r48-C1 superset);
  the hrassistant empty pane renders NOTHING (r47-E5 superseded);
  the No-chats `text-sm text-slate-500 p-4 text-center`; the profile
  kicker slate-400 (the `mobileKickerSubtitleClassName` escape hatch).
- **R61-P/Q/R**: the surveyanalytics legend — Responses blue-500 +
  "Avg Sentiment %" + the DOM order via the DefaultLegendContent
  reorder (**recharts 3's auto order ignores both the Bar mount
  order and the YAxis declaration order**); the analytics +
  advancedanalytics Legends removed (REF ships none).
- **R61-S/T/U/W/X**: the icon shapes (Zap, Shield, CircleCheckBig/
  CircleAlert/Award) + the attendance red-500 + the requestreports
  tr members (`border-b text-left text-slate-500` — the post-fix
  census's own catch: decomposed in probe2 but dropped from the
  first plan draft, re-found by the re-run).
- **The purge FK-walk fix**: a leaked R58-22 fixture row made every
  subsequent global-setup purge DIE SILENTLY at the employee sweep
  (P2003, swallowed as non-fatal) — the stale rows then poisoned
  `findFirst`-based assertions. The purge walks the FKs first now
  (fixtures → employees → the non-cascade user dependents).

**Pinned**: 24 unit (RED-first; the R22-D/R30-B1/R35-C2/R48-C2/
R48-C6/R17-B legacy pins amended to the re-measured truths) + 18 E2E
(`tests/e2e/session61-textcolor.spec.ts` — computed truth, both
themes). Gates: lint 0/0 · tsc ✓ · **858/858 unit** (+24) · build ✓ ·
**314/314 E2E** (+18, no flakes — the session-58 switch/checkbox
flake fired once mid-verification, 11/11 in isolation) · post-fix
census 40/49 · DB pristine 1/1/2.

## Session 61 instrument lessons (the text-color census, carry-forward)

**The r61 lessons**: (1) **the manual-:3100-server trap** — an
in-memory login rate limiter (LIMIT 10/15min, per-IP "local" for
every test) accumulated across debug logins + reused-port playwright
runs → mid-suite 403 lockouts; always kill manual servers before
`test:e2e` (playwright reuses an occupied port); (2) **a silently
failing purge is worse than no purge** — the leftovers compound and
poison `findFirst` assertions; walk the FKs first; (3) **the
text-color census needs the w:0 filter** — hidden kicker/sr-only
svgs pollute the tag|color sets (the profile's back-icon renders via
`asChild` as an `<a>`, so `closest('button')` doesn't exclude it);
(4) **REF's transient refresh-cw**: a blue-600 loading icon appears
only mid-fetch (y:-52) — settled re-reads don't show it; (5) the
recharts-3 legend order ignores both the Bar mount and YAxis
declaration orders — the DefaultLegendContent reorder is the
deterministic path (the `payload` prop is omitted from the
recharts-3 public types).

## Session 62 (parity round 61) — the dark-mode border-color family

Workspace re-cloned from `4cd0aa4` (the round-60 landing + the
session_126 narrative; the sandbox reset wiped the local artifacts —
the environment + the census instrument rebuilt per protocol).
Baseline gates ALL GREEN (858/858 unit · 314/314 E2E). Deploy watch:
**the 25th login deploy detected** (login JS `Bt_cFPps`→`Doo5f9jm` +
a new `frontend-config` chunk; login CSS + the app side quiet) —
re-audited NON-VISUAL via the full ladder (standing 5/5 + sweep
12/12 + verify-r49 13/13 + **verify-r45 13/13**).

**The census (`scripts/r62-border-census.mjs`, 49 routes, paired
live, DARK, three batches): the computed `border-color` of every
visibly-bordered element in `main` (all four sides, width>0 +
style!=none, transparent sides skipped, buttons INCLUDED — button
borders were never read by any prior census) — the recorded r60/r61
blind spot closed. Comparison: the deduped (tag|color) set; every
DIFF decomposed element-level (`scripts/r62-probe.mjs` +
`r62-probe-cmp.mjs`, the symmetric class-set diff). Pre-fix 29/49,
post-fix 44/49** (five documented DIFFs: the employees seeded leaves,
the attendance admin superset, the interviewassistant r48-C1
superset card, the onboardingtemplates 404 `<a>` superset, REF's
live careers data).

- **R62-A**: the dashboard Customize button's frozen session-3
  literal (`border-[#e5e5e5]`, a light-mode measurement) retired —
  the outline variant's `border-input` token supplies the identical
  light pair + REF's measured dark flip (#262626).
- **R62-B**: the Checkbox border rode `border-primary` — but the
  clone's `--primary` is the documented nav-blue repurposing
  (#1877f2 both themes) while REF's checkbox border rides REF's own
  FLIPPING `--primary` (**#171717 light / #fafafa dark, both
  live-measured) — a BOTH-theme divergence no fill/text census could
  see. Fixed with the literal pair (the established fill-literal
  pattern in the same file).
- **R62-C**: four new @theme pins — green-200 #bbf7d0 (the
  securitysettings lab(92.42% -26.47 12.94) drift, live-measured) +
  amber-200 #fde68a + cyan-300 #67e8f9 + cyan-50 #ecfeff (the new
  E/F consumers).
- **R62-D**: the border-slate-200 card family — REF's page cards
  stay LIGHT-bordered in dark (unflipping); nine cards across seven
  routes + the loans/offboarding empty-state rewrites to REF's live
  recipe (text-card-foreground shadow col-span-full, wrapper `grid
  gap-6 md:grid-cols-1 lg:grid-cols-2`) + the compliance At-Risk
  overflow-hidden + the attendance Report-Type card to REF's 3-level
  shape (Card > p-4 > `flex gap-4 items-center`) + the attendance
  stat cards' `hover:shadow-lg transition-shadow`.
- **R62-E**: the attendance action-button trio — Devices
  `border-cyan-300 hover:bg-cyan-50`, Settings `border-slate-300
  hover:bg-accent`, Dashboard `border-blue-300 hover:bg-blue-50`
  (per-color outline borders, member-set measured live).
- **R62-F**: the recruitmentkanban columns are PER-STAGE (slate/
  blue/amber/green/red border-2 + bg pairs inside `flex-shrink-0
  w-64` wrappers, p-3 + min-h-[400px]) — the session-11 pin had
  generalized the Applied column's slate to all five (the r59
  single-measure blind spot again).
- **R62-G**: the shiftcalendar ths carry `border-b border-slate-200
  bg-white` + the weekend variant (bg-slate-50 text-slate-400).
- **R62-H**: REF's thead recipes vary per page —
  assetmanagement/payrollmodule put `border-b border-slate-200
  bg-slate-50` on the header ROW; recruitment puts the border on the
  THEAD itself (the shared TableHeader's `[&_tr]:border-b`
  neutralized there via `[&_tr]:border-0`).
- **R62-I**: the profile role badge is a DIV (the census reads
  tag|color sets — the clone's span diverged; shrink-0 retired, the
  "Admin" text stays the documented data allowance).
- **R62-J**: the compliance severity cards restructured to REF's
  two-level shape (the border on the card, `p-4 text-center` on the
  inner wrapper — was flattened).
- **R62-K**: the shared Textarea base + `resize-none` (REF measured
  2/2: companywall + interviewassistant).

**The muted-foreground mapping note** (documented, no fix): REF's
`--muted-foreground` = neutral-500 (#737373) light / #a3a3a3 dark,
but REF AUTHORS `text-slate-500` (#64748b) on its subtitles; the
clone's token pins #64748b (subtitle parity) and its tabs/select
carry the neutral-500/400 literals (tab parity) — computed parity
on every censused dimension; a token-level re-map would ripple
through all 49 routes' text surfaces (a future round's scope).

**Pinned**: 15 unit (RED-first; the R48-C2b/R59-B/R39-E1 legacy pins
amended to the re-measured truths) + 14 E2E
(`tests/e2e/session62-border-colors.spec.ts` — computed border
truth, both themes where applicable; the session-49 R48-C2 spec
amended). Gates: lint 0/0 · tsc ✓ · **873/873 unit** (+15) ·
build ✓ · **327/327 E2E** (+14, the session-58 switch/checkbox
documented flake fired once mid-verification, 5/5 in isolation) ·
post-fix census 44/49 · DB pristine 1/1/2 (the loading-probe user
swept).

## Session 62 instrument lessons (the border-color census, carry-forward)

**The r62 lessons**: (1) **the rect-visibility filter for border
reads** — an element can carry a visible border with zero content
(height 0 + border-b renders 1px+ in the rect); filter by
`rect.width === 0 && rect.height === 0` only, never by text content
(the r61 w:0 lesson applied to borders); (2) **the truncated
class-string trap** — tw-merge reorders members, so a 170-char
prefix comparison produces false member-diffs; compare SORTED
member SETS (`[...el.classList].sort()`) before declaring a member
missing (the companywall textarea "missing min-h-[60px]" was a
false positive — the member sat past the cut); (3) **the
frozen-literal family** — light-mode measurements pinned as hex
literals (#e5e5e5) don't flip; a token that matches in light can
hide a dark divergence for months (audited: this was the only
authored border literal); (4) **REF's borders live on three
different elements per recipe family** — page cards (the card),
tables (the row on assetmanagement/payrollmodule, the thead on
recruitment), calendars (the th) — never generalize one measured
site to a shared component; (5) **the both-theme bugs hide from
single-theme censuses** — the checkbox border diverged in LIGHT
too (#171717 vs #1877f2) but every prior census read fills/text,
never borders; (6) the census batches must save DIFF dumps to
files — a mid-batch tool timeout otherwise loses the batch.

## Session 63 (parity round 62) — the light-mode text-color census

Workspace carried the round-61 landing (`f4bf0bd`); environment rebuilt
per protocol (`.env` with `DATABASE_URL="file:../db/custom.db"` + the
generated AUTH_SECRET, db pushed + seeded, playwright chromium).
Baseline gates ALL GREEN (873/873 unit · 327/327 E2E). Deploy watch:
**the 26th login deploy detected** (login JS `Doo5f9jm`→`D3ArZVPB` +
CSS `A8a43VEI`→`OJK0Y98H` — the first CSS-side login change since
round 45) — re-audited NON-VISUAL via the full ladder (standing 5/5 +
sweep 12/12 + verify-r49 13/13 + **verify-r45 13/13** — all 13 login
pairs MATCH). The watch finals updated to the post-26th truths.

**The census (`scripts/r63-lighttext-census.mjs`, 49 routes, paired
live, LIGHT, three batches with DIFF dumps): the computed `color` of
every text-bearing element in `main` — headings, text leaves, svgs,
BUTTONS INCLUDED (button text/icon colors were never read by any
prior census in ANY theme — the r60/r61/r62 blind spot closed) —
plus `::placeholder` colors. The recorded gaps this round fills: (1)
no computed text census ever ran in LIGHT; (2) button text was never
censused in any theme; (3) the documented byte-parity backlog —
REF's `--muted-foreground` = neutral-500 #737373 (the clone's token
pins slate-500 #64748b) — surfaced as the 15-route placeholder
family. Pre-fix 26/49, post-fix 41/49** (every remaining DIFF
decomposed + documented: the employees seeded leaves + REF's
transient refresh-cw, the taskmanager mid-load read (steady-state
MATCH re-confirmed), the profile asChild back-arrow artifact, the
attendance admin superset, the interviewassistant r48-C1 superset
card, the advancedanalytics hidden-tooltip census artifact, the
onboardingtemplates 404 `<a>` superset, REF's live careers data).

- **R63-A**: the Input + Textarea `::placeholder` moved from the
  token rider (`placeholder:text-muted-foreground` → the clone's
  slate-500 tint, WRONG in light) to REF's muted LITERAL pair
  (`placeholder:text-[#737373] dark:placeholder:text-[#a3a3a3]` —
  the R62-B checkbox pattern; the token itself stays pinned for the
  subtitle/tab parity) — a 15-route light-mode divergence ended.
- **R63-B**: the hrreports empty Group By trigger — REF's trigger
  has NO `data-placeholder` attribute (its runtime mounts the
  trigger differently) and renders the trigger's OWN foreground pair
  (#0a0a0a/#fafafa), while the clone's Radix fires data-placeholder →
  the R37-E neutral literal painted it. A BOTH-theme button-text
  divergence (button text was never censused). The instance override
  carries BOTH variant members (`data-[placeholder]:text-foreground
  dark:data-[placeholder]:text-foreground` — the dark: member is
  required: cn()/tw-merge replaces the base member per variant, so a
  light-only override leaves the base's dark member live); the
  base's R37-E literal stays (the loans dialog pin).
- **R63-C**: the profile kicker subtitle is the FLIPPING pair —
  slate-500 light / slate-400 dark (the r61-O pin froze the dark
  measurement for both themes; the r63 light census + the 390×844
  re-measure caught the light side).
- **R63-D**: the shiftcalendar assign affordance is iconed —
  `text-xs text-slate-300 hover:text-blue-500 flex items-center
  gap-0.5 mt-1` + a `lucide-plus w-3 h-3` (unflipping slate-300,
  both themes live-measured). The "+N more" overflow button (a
  with-data superset surface, REF-unmeasurable at the demo's zero
  state) keeps the r11 recipe.
- **R63-E**: the shiftcalendar summary header — the census "color
  diff" was a CHILDREN-FILTER artifact (a title that carries an icon
  is invisible to the leaf read; the color always matched); the real
  divergences are structural: the header's `pb-3` override + the
  title's `text-base flex items-center gap-2` members + the
  `lucide-users w-4 h-4` icon riding the foreground pair.
- **R63-F**: the recruitment AI Score th carries the
  `lucide-trending-up w-3 h-3` icon inside a `flex items-center
  gap-1` wrapper (both tables; th slate-600 unflipping).
- **R63-G**: the attendance restricted card — REF's icon is
  `lucide-x` NOT the shield (the r61-W color fix kept the
  un-measured SHAPE; color censuses cannot see icon shapes) + the h3
  is `text-slate-800` (unflipping 30,41,59 — was slate-900). Both
  surfaces render for non-admins only — recipe-aligned per the
  r61-W precedent (the census's REF session user is non-admin, the
  LOC admin seed is not; the unit pin holds it member-level).

Also documented (no fix): the advancedanalytics recharts tooltip —
REF's recharts mounts the hidden tooltip node WITH a default label,
the clone's mounts it empty; `visibility: hidden` at rest on both —
an at-rest-invisible census artifact, NOT a visual divergence
(hover parity holds). TDD: 7 unit pins (the R63 block) RED-first +
three legacy pins amended to the re-measured truths (R39-D1 the
placeholder literal pair; R61-O the flipping pair; R61-W the X icon)
+ the session-14 hrreports regex window widened (300→1200 — the
recipe comment now sits between the label and the SelectValue).
E2E: +6 chromium specs (`tests/e2e/session63-light-text.spec.ts` —
computed pairs, both themes, setDark AFTER goto) + the session-61
R61-O spec amended to the flipping pair. Gates: lint 0/0 · tsc ✓ ·
**880/880 unit** (+7) · build ✓ · **333/333 E2E** (the two
documented transients — the session-58 switch/checkbox flake + the
session-40 dialog-animation read — both fired once mid-verification,
both 5/5 in isolation per the flake-check) · post-fix census 41/49 ·
12 screenshot files (the 314–325 pair set) · deploy watch both
sides quiet (post-26th finals) · DB pristine.

## Session 63 instrument lessons (the light-text census, carry-forward)

**The r63 lessons**: (1) **the standalone static-copy trap** —
`npx next build` alone leaves `.next/standalone/.next/static` EMPTY
(the copy steps live in the `bun run build` script); the E2E webServer
then serves UNSTYLED pages whose computed colors read as the Chrome
UA defaults (::placeholder = rgb(117,117,117), the Material gray) —
always build via the package script; (2) **the dark-variant
specificity lesson** — Tailwind v4's dark: variants compile to
`:where(.dark,.dark *)` (ZERO specificity), so a base member and an
instance override tie on specificity and resolve by FILE ORDER in
dark — but the operative resolver is cn()/tw-merge, which REPLACES
the base member per variant at merge time; an instance override must
author BOTH variant members or the base's dark member stays live
(the R63-B lesson, twice-learned); (3) **the children-filter
artifact** — a title that carries an icon is invisible to the leaf
text read; decompose a "color diff" to the STRUCTURE (icon, members,
paddings) before pinning a color that already matched; (4) **the
visibility:hidden tooltip** — recharts mounts its tooltip node at
rest (hidden) with a default label on REF but empty on the clone —
at-rest-invisible census artifacts are documentation, not fixes;
(5) **the single-viewport page** — a page whose content fits one
900px viewport makes two full-page captures byte-identical (the
318/320 collision); capture the second surface at a different
viewport (the 390×844 mobile pair), and note the agent-browser
viewport state can go stale after restore cycles — spin a FRESH
session when the capture size doesn't stick; (6) **the pin-defect
trio** — (a) a source COMMENT containing the retired member breaks
the pin's `.not.toContain` (the attendance shield comment), (b) a
recipe comment between a label and its control breaks legacy regex
windows (the hrreports 300→1200), (c) a globally-scoped
`.not.toContain` breaks when another element legitimately shares the
retired class (the shiftcalendar "+N more" overflow button — scope
retirement assertions to the measured surface or pin the sharer
positively with its allowance reason).

## Session 64 (parity round 63) — the light-mode border-color census

Workspace rebuilt from scratch (fresh clone at `b1ab187` — the round-62
landing; environment per protocol: `.env` with
`DATABASE_URL="file:../db/custom.db"` + the generated AUTH_SECRET, db
pushed + seeded, playwright chromium). Baseline gates ALL GREEN
(880/880 unit · 327/327→333/333 E2E — the fresh-clone suite ran clean).
Deploy watch: BOTH SIDES QUIET (the post-26th finals held — JS
`D3ArZVPB` / CSS `OJK0Y98H`; no 27th deploy).

**The census (`scripts/r64-lightborder-census.mjs`, 49 routes, paired
live, LIGHT, three batches with DIFF dumps): the computed border-color
of every visibly-bordered element in main, buttons included — the LAST
uncensured cell of the computed-color matrix (fill r57 light + r59
dark, text r60 dark + r62 light, border r61 dark + r63 light). Pre-fix
44/49 — the best pre-fix state of any census round (the light recipes
were the original cloning baseline; 7 rounds of pins hold them). All 5
DIFFs decomposed to DOCUMENTED ALLOWANCES (`r64-probe.mjs`): employees
(the seeded grid card + its "Full Time" badge), attendance (the "Today's
Overview" + "Recent Records" admin superset cards), interviewassistant
(the r48-C1 AI Analysis card), onboardingtemplates (the r36 404 Go-Home
anchor — members byte-identical, tag superset), careers (REF's live
demo company buttons). Post-fix re-run: 44/49 unchanged — the census
stands. ZERO border fixes required.**

The round's real finds came from the census's set-comparison inversion
risk — closed via the element-level symmetric diff (`r64-probe-cmp.mjs`)
plus two per-dimension probes the payroll input's class-string diff
motivated:

- **R64-A — the iconed-search-input left padding (4 routes)**:
  `r64-probe2.mjs` (all 49 routes, both sides) read every iconed input's
  computed paddingLeft — REF clears the `absolute left-3` search icon
  with pl-10 (payroll — 40px) or pl-9 (payrollmodule / documenttracker
  / assetmanagement — 36px); the clone rendered the same wrappers
  WITHOUT the padding member (typed text started at 12px and collided
  with the icon — a visible UX defect). employees / chat /
  staffrequests / careers already carried their measured members.
  Session-12's R11-H pin measured the payroll toolbar's outer geometry
  (862px / relative / flex-1) but never the interior padding — a
  51-round-old measurement gap, live-caught.
- **R64-B..E — the placeholder-TEXT dimension (`r64-probe3.mjs`, all 49
  routes, both sides — r60/r63 read placeholder COLORS only)**: 45/49
  verbatim pre-fix; 4 authored strings diverged from REF's live copy —
  the compliance search ("Search employee..." — the query filters
  document name AND employeeName), the recruitmentkanban search
  ("Search applicants..."), the interviewassistant notes textarea (REF's
  verbatim observations string — the R61-L pin held the SELECT's
  placeholder only), and the tenantsetup wizard ("Acme Corporation" /
  "admin@acme.com" — the R31-C10 pin held the labels). Post-fix:
  49/49. The clone's aria-labels (a documented a11y superset REF lacks)
  follow the REF semantics ("Search employee" / "Search applicants").

TDD: 5 unit pins (the R64 block, RED-first) + 6 E2E
(`tests/e2e/session64-light-border.spec.ts` — the 4 paddings computed,
the 4 placeholder surfaces, and the round's border-census truth pin:
the payroll search input rides the border-input token pair
rgb(229,229,229) light / rgb(38,38,38) dark). Gates: lint 0/0 · tsc ✓ ·
**885/885 unit** (+5) · build ✓ · **339/339 E2E** (+6, zero flakes —
both documented transients stayed quiet) · post-fix probes 9/9 padding
+ 49/49 text + 44/49 border (unchanged, all allowances) · 18
screenshot files (the 326–343 pair set: the 4 typed-text padding pairs,
the 4 placeholder pairs, the mobile drawer pair @390×844 — the
standing mobile-menu check evidence; 520 files total, hash-verified
distinct) · deploy watch quiet · DB pristine.

## Session 64 instrument lessons (the light-border census, carry-forward)

**The r64 lessons**: (1) **the zero-fix census is legitimate — and the
inversion probe is where the yield hides**: a census can come back
all-allowance (the light border did — 44/49 pre-fix) yet the round
still produced 5 real fixes, because the element-level symmetric diff
surfaced an authorship split whose downstream dimension (padding) had
never been measured; after a zero-DIFF census, run at least one
per-dimension probe on the family the census shares a surface with;
(2) **color censuses cannot see PADDING** — the iconed-search family's
left padding was never in any computed read, and byte-level geometry
pins held only the pages measured WITH the member (employees / chat /
staffrequests / careers); 4 sibling pages authored without it drifted
for 51 rounds; (3) **the placeholder-TEXT dimension was never censused**
— r60/r63 read the ::placeholder COLORS; the text values were only
byte-pinned on measured surfaces, and 4 authored strings survived —
copy census is cheap (one attribute read, all routes) and catches
invented strings no color read can see; (4) **the fresh-session
screenshot protocol** — spin fresh agent-browser sessions for viewport-
sensitive captures (the r63 stale-viewport lesson applied: fresh
"ref64"/"loc64" sessions, zero stale-state fights); (5) **the tw-merge
member-order mirage** — the post-fix clone inputs serialize their
members in REF's order (`focus-visible:ring-1 focus-visible:ring-ring`
first) because tw-merge reorders on merge; compare sorted member SETS
(the r62 lesson, re-confirmed in the probe2 tails).

## Session 65 (parity round 64) — the geometry census (padding + border-radius)

Workspace rebuilt from scratch (fresh clone at `c10ab5b` — the
round-63 landing; environment per protocol: `.env` with
`DATABASE_URL="file:../db/custom.db"` + the generated AUTH_SECRET, db
pushed + seeded, playwright chromium; the exported-DATABASE_URL trap
unset). Baseline gates ALL GREEN (885/885 unit · 338+1 E2E — the
session-42 user-menu transient fired once mid-suite, 6/6 isolated per
the flake-check; it joins the documented transient family).
**Deploy watch: THE 28TH LOGIN DEPLOY DETECTED** — login JS
`D3ArZVPB`→`DcjXLM5U` + CSS `OJK0Y98H`→`D_pxMX7I` (the frontend-config
chunk held; the app side quiet `C-IrDy5f`/`BGNH4KkS`). The full
confirmation ladder re-audited it **NON-VISUAL**: standing 5/5 + sweep
12/12 + verify-r49 13/13 + verify-r45 13/13. The watch finals are the
post-28th hashes. (The first ladder run read the LOGIN page on every
route — 0/5 + 0/12: the deploy invalidated every REF session; a fresh
re-auth restored the truth. The stale-session artifact is now recorded.)

**The census (`scripts/r65-geometry-census.mjs`, 49 routes, paired
live, LIGHT, three batches with DIFF dumps): the computed padding (4
sides) + border-radius of every geometry-bearing element in main,
buttons included — the FIRST full-population read of the two dimensions
every color census was blind to (the r64 lesson: color censuses cannot
see PADDING; only the 9 iconed-search inputs had ever been
padding-measured). Pre-fix 32/49. All 17 DIFFs decomposed
element-level (`r65-probe.mjs` + `r65-probe-cmp.mjs` the symmetric
tuple diff with class/rect/text attribution + `r65-probe2.mjs` the
per-tile recipe probe across the 18 stat-tile pages): 7 fix families +
the 5 documented-allowance routes. Post-fix: 44/49 — exactly the
projection, the DIFF set byte-identical to the allowance tuples.**

The seven families:

- **R65-A — the StatCard standard-variant tile is PADDING-DRIVEN**:
  REF live-measures `bg-{c}-100 p-3 rounded-xl` 48×48 (12px padding +
  the 24px svg) on payroll / expenses / surveys / attendance; the
  clone rendered the R16-D-era fixed `w-12 h-12 rounded-xl` (padding
  0) everywhere. The session-17 "NOT p-3" note was a generalization
  error — its zero-padding measurement was taken on the OTHER 48px
  pages (advancedanalytics / analytics tile-right / allleaverequests /
  payrollai), which REF renders FIXED (the per-tile probe split the
  family). Fix: the standard tile base is `p-3 rounded-xl …` with the
  `tileFixed` escape (the three fixed pages pass it; tile-right is
  fixed by contract — the first post-fix census run caught the
  tile-right regression on /analytics and the condition gained
  `|| variant === "tile-right"`).
- **R65-B — the td/th UA-padding restoration (a REAL TW v4 engine
  difference)**: v4's preflight carries the UNIVERSAL padding reset
  (`*,:after,:before,::backdrop{…;margin:0;padding:0}`) which zeroes
  the Chrome UA's `td,th{padding:1px}`; REF's runtime keeps it — every
  unstyled cell side rides the surviving 1px (the py-10/py-12
  empty-state tds on recruitment/assetmanagement/payrollmodule, the
  requestreports pb-2 pr-4 ths, the shiftcalendar cells). Fix: a
  base-layer restoration `th, td { padding: 1px; }` in globals.css
  (the R23-A cursor precedent — v4's preflight dropped what REF's
  runtime keeps; utilities still win the cascade).
- **R65-C — the chat column header**: REF authors ONE `p-4 border-b
  border-slate-200` wrapper containing the h2 row (`flex
  items-center justify-between mb-4`) and the BARE relative search
  wrapper; the clone's split authoring (a padded h2 row + a padded
  search div) **dropped the border-b entirely** — the r63 border
  census matched because the page's other slate-200 borders satisfied
  the set comparison (set blindness the geometry census's per-element
  attribution closed). The new-chat button is also padding-driven
  (px-3, 40×32) — the clone authored w-10 fixed. Fix: REF's exact
  recipe (the border-b restored; R61-H/I icon+h2 contracts hold).
- **R65-D — the compliance filter row is a bordered white box**: REF's
  live full member set (`flex flex-wrap gap-3 items-center bg-white
  p-4 rounded-xl border border-slate-200`); the clone rendered the
  bare `flex flex-wrap gap-3 p-4` (no bg/radius/border) — the fill
  censuses couldn't see it (the clone's Card root supplied an
  identical white tuple — set blindness again).
- **R65-E — the hrassistant geometry**: REF's pane is
  `h-[500px] overflow-y-auto p-6 space-y-4`, the input row
  `border-t p-4 flex gap-3`, the textarea `min-h-[60px]` — the clone
  authored 460px/p-4/flex-col-gap-3 + p-3 + 48px (visible layout
  differences: the pane 40px shorter, the row 20px shorter). The send
  Button keeps the R58-6 pin (verified unchanged).
- **R65-F — the requestreports Back button's py-2 leak**: the
  default-size + className override (`h-8 rounded-md px-3 text-xs`)
  let the base `py-2` survive tw-merge as an 8px vertical pad REF
  does not render (0px 12px live). Fix: `variant="ghost" size="sm"`
  (REF's authored member set).
- **R65-G — the `--radius-sm` token**: REF's live runtime computes
  `rounded-sm` at **4px** (the v4 scale — v3's `rounded` slot;
  measured on the securitysettings checkboxes, the only visible-at-rest
  rounded-sm surface). The clone's @theme pinned the v3-default 2px —
  an early-session assumption never computed-verified. Fix:
  `--radius-sm: 0.25rem` (the other three radii census-verified at
  v3 values).

TDD: 9 unit pins (the R65 block, RED-first — 7 new + 2 legacy
amendments: the session-10 tile pin → the two-form contract, the R48-C7
Back pin → the sm size; the R60-E chat-member pin re-ordered for px-3)
+ 7 E2E (`tests/e2e/session65-geometry.spec.ts` — computed truth: the
padded tiles 12px + the tileFixed 0px, the td/th 1px reads, the chat
wrapper border-b + the px-3 button, the compliance box, the
hrassistant heights, the Back padding, the checkbox radius). Gates:
lint 0/0 · tsc ✓ · **892/892 unit** · build ✓ · **346/346 E2E** (the
session-58 switch/checkbox documented transient fired once mid-suite,
11/11 isolated per the flake-check) · post-fix census 44/49 · 24
screenshots (the 344–367 pair set — the four p-3 tile pages, the chat
column header, the compliance box, the hrassistant geometry, the
checkboxes, the Back+th, the two td-restoration pairs, the mobile
drawer pair @390×844; the 366 pair byte-matches the r64 342 pair —
cross-round byte-stability of the standing surface) → 550 files · DB
pristine.

## Session 65 instrument lessons (the geometry census, carry-forward)

1. **The rounded-full serialization split**: TW v4 authors
   `calc(infinity * 1px)` which Chrome serializes as `33554432px`
   (2^25) while REF's v3-era `9999px` stays `9999px` — both render
   fully round. A geometry census MUST normalize any radius ≥ 9999 to a
   `full` token or the serialization family drowns the real DIFFs (the
   first run read 2/17 with the family as the only noise).
2. **No `//` comments inside eval strings** — `evalOn` flattens
   newlines and a `//` comment swallows the rest of the one-liner; the
   census read broke until the comment moved to the .mjs header (the
   r64 census kept its READ comment-free; the lesson generalizes to
   every instrument).
3. **A deploy invalidates every REF session — re-auth before the
   ladder**: the 28th deploy logged the shared "ref" session out, and
   the standing-run + routesweep scripts assume a pre-authed session —
   the first ladder run read the LOGIN page's "Welcome to Eon HR" h1
   on every route (0/5 + 0/12, every route the same read). The
   deploy-watch → re-auth → ladder ordering is now the protocol; a
   uniform identical read across all routes is the stale-session
   signature.
4. **The set-comparison blindness has a second face**: the r64
   inversion lesson was same-color-different-element false MATCHes;
   the r65 finds were same-set-DIFFERENT-STRUCTURE false MATCHes — the
   chat's missing border-b and the compliance's missing box hid behind
   tuples other elements supplied. Per-element attribution (class +
   rect + text) on the census's OWN read surfaces is the triage
   instrument; set equality is the alarm, not the verdict.
5. **A frozen measurement can be a frozen GENERALIZATION**: the R16-D
   "NOT p-3" tile note was a real measurement applied to the wrong
   population — the probe2 per-page split (p-3 on the four classic
   standard pages, fixed on the analytics family) is the pattern for
   any "family" pin that has never been re-measured per page.

## Session 66 (parity round 65) — the margin/gap census (margin 4 sides + rowGap/columnGap)

Workspace rebuilt from scratch (fresh clone at `0a31b7c` — the
round-64 landing; environment per protocol: `.env` with
`DATABASE_URL="file:../db/custom.db"` + the generated AUTH_SECRET, db
pushed + seeded, playwright chromium; the exported-DATABASE_URL trap
unset). Baseline gates: lint 0/0 · tsc ✓ · 892/892 unit · build ✓ ·
E2E 345/346 — the one failure was the "session-58 switch/checkbox
transient" firing CONSISTENTLY in isolation (3× consecutive): root
cause isolated and RETIRED — the R58-19 spec counted
`[aria-checked=true]` immediately after goto with NO wait, racing the
async security-settings fetch (the count read 0 while `settings ===
null`; the post-failure snapshot showed the correct 4 checked). The
wait mirrors the switches block; 3× green post-fix. The "documented
transient family" shrinks by one — its real mechanism was a
count-without-wait race all along.

**Deploy watch: THE 29TH LOGIN DEPLOY DETECTED** — login JS
`DcjXLM5U`→`q8Uif46n` + CSS `D_pxMX7I`→`CiCfCTzx` (the app side
QUIET `C-IrDy5f`/`BGNH4KkS`). The full confirmation ladder re-audited
it **NON-VISUAL** after a fresh re-auth: standing 5/5 + sweep 12/12 +
verify-r49 13/13 + verify-r45 13/13. The watch finals are the
post-29th hashes.

**The census** (`scripts/r66-margin-census.mjs` — the computed margin
(4 sides) + rowGap/columnGap of every margin/gap-bearing element in
main, 49 routes, paired live, LIGHT, three batches with DIFF dumps):
the FIRST full-population read of the two dimensions NO census had
ever covered. **Pre-fix 19/49.** The round's instrument work ran TWO
normalization marks: mark I (one-sided space-y pairs → `v:N`) still
left positional noise (v3 puts the ZERO on the FIRST child, v4 on the
LAST — and the tuple bundles each element's own gap, so position-equal
sets diverged anyway); **mark II** parses the parent's `space-y-N`
value from its class (the rem scale mapped to px, the LAST matching
token wins — responsive variants sort after plain ones) and emits
position-independent `v:N` for every child whose pair is (0,0),
(N,0), (0,N) or (N,N). Batch 1 rose 1/17 → 4/17 on the same code.

All 30 DIFFs decomposed element-level (`r66-probe` the same-normalized
inventory + `r66-probe-cmp` the symmetric diff + targeted live
probes): **18 fix families + 4 documented allowances** (employees
seeded, attendance admin superset, careers live data,
interviewassistant r48-C1). Post-fix: **45/49** — better than the
plan's 43 projection (onboardingtemplates + evaluations matched after
their fixes).

The eighteen families (the plan records the full member sets):

- **R66-A the PageCanvas scroll band**: REF renders an
  `absolute top-0 left-0 right-0 flex justify-center items-center h-20
  -mt-20` band (a transform:none div holding the refresh-cw
  `w-6 h-6 text-blue-600` spinner) on all 8 PageCanvas routes — the
  r47-A measurement documented it "non-clone"; the census's
  `-80,0,0,0` REF-only family (×8) promoted it to clone (clipped
  invisible at rest; PageCanvas now renders it).
- **R66-B the EmptyState icon is SVG-authored**: REF puts
  `w-16 h-16 mx-auto mb-4 text-slate-300` ON THE SVG (computed mx-auto
  = the 479/303/96px census family); the clone's wrapper + `[&_svg]`
  scaling div retired — cloneElement injects the member set, the
  icons fixed to REF's live names (offboarding LogOut→UserMinus,
  companywall gains the House, hrassistantchat Sparkles→MessageSquare;
  its SECOND hand-authored pane empty + training's hand-authored empty
  adopted the same form).
- **R66-C the StatCard tileFixed row**: REF's second standard form —
  the tileFixed pages render the row WITHOUT mb-3 (the value's mt-4 P
  form was already pinned at the call sites; allleaverequests censused
  MATCH via set-absorption — the census MATCH ≠ element parity, the
  third face of set blindness).
- **R66-D the employees row/grid**: REF's row is the alwaysRow family
  (`hidden md:flex items-center justify-between mb-8` — NO gap
  member); the grid is `grid md:grid-cols-2 lg:grid-cols-3 gap-6`.
- **R66-E the Radix tabs rhythm**: REF's Tabs root carries space-y-6
  (the List/Content are its space-y children) and the
  evaluations empty-line rides a space-y-3 block. The v4 TRAP found
  executing: the inline-flex TabsList's space-y mb NEVER COLLAPSES
  with the content's mt (48px vs REF's 24) — the fix is the R22-B
  `mb-0!` kill on the List + the content's own mt-6 (census v:24 both
  sides, visual 24 both engines). Recruitment + evaluations +
  performancemanagement.
- **R66-F the actions-cluster per-page truth** (the session-5 "gap-3"
  frozen generalization re-measured live): REF has THREE forms —
  `flex gap-3` multi-button clusters (employees/taskmanager/attendance,
  unchanged), `flex gap-2` (staffrequests → `actionsBare`), and the
  RAW BUTTON with no wrapper at all (expenses/loans/recruitment/
  recruitmentkanban/workflowconfigpage → `actionsUnwrapped`).
- **R66-G the companywall audience group**: `space-y-2` + the
  leading-none Label (the R10-C `space-y-3` + `block leading-5` pin
  was a frozen measurement — REF's live form re-measured).
- **R66-H the payrollengine form groups**: `space-y-2 leading-5` →
  `space-y-1` (+ the inputs' own mt-2 members retired — the v4 child
  utility wins over the space-y gap, a literal 8px REF does not
  render).
- **R66-I the requestsettings empty line**: REF wraps it in a
  `space-y-2` div (member order `text-slate-400 text-sm`).
- **R66-J the tenantsetup circle + footer**: `mx-auto mb-4` (the
  custom `mb-[22px]` retired) + the Continue right-aligns via its OWN
  `ml-auto` (the footer is not justify-end; the census read the
  resolved 527.047px).
- **R66-K the workflowconfigpage CTA**: the button carries `mt-4`
  DIRECTLY (the wrapper div retired).
- **R66-L the performancemanagement tabs + goals grid**: the bare
  `grid gap-6` (no responsive cols — REF's authored form) + the
  mt-6/mb-0! rhythm.
- **R66-M the shiftswap card wrapper**: REF's pills ride the page
  space-y-8 DIRECTLY (the census read their 32px top margin); ONLY
  the card rides a `space-y-4` wrapper (single child at zero).
- **R66-N the surveyanalytics chart section**: ONE
  `grid md:grid-cols-2 gap-6` with the third card `md:col-span-2`
  INSIDE it (the clone's space-y-6 > grid > sibling structure was
  render-equal but structurally divergent — the same-visual-
  different-STRUCTURE family).
- **R66-O the offboarding empty grid + the workflowautomation grid
  gate**: `gap-6` added (REF's 24px empty-grid gap); the
  workflowautomation grid renders ONLY with data (REF renders NOTHING
  below the stat row at zero — the R16-B pattern; the census read the
  empty grid's gap tuple REF never emits).
- **R66-P the hrassistant settled pane**: EMPTY (the R65-E loader
  div leaked into the settled state — retired; REF's pane renders
  nothing at rest).
- **R66-Q the chat new-chat button**: the `gap-2` shadcn base member
  restored on the hand-authored R65-C2 form.
- **R66-R the recruitmentkanban root + drop zone**: the middle
  `flex flex-col space-y-6` wrapper retired (REF's root is the flat
  R10-K `p-4 md:p-8 space-y-6`); the zone is REF's BARE
  `min-h-32 rounded-md` with the with-data card stack on an inner
  gap-2 wrapper (the zero-state zone renders empty; the superset DnD
  keeps its spacing).

TDD: 18 unit pins (the R66 block, RED-first) + 5 legacy-pin
amendments (the R13-K payrollengine group value; the R46-A1
non-clone REVERSAL; the R58 tenantsetup member set; the R60-E
workflowconfigpage regex; the R14-A/C pill pins for the mb-0! member)
+ 1 legacy E2E amendment (the session-31 hrassistantchat icon
locator) + 14 E2E (`tests/e2e/session66-margin-gap.spec.ts` —
computed truth: the -80px band, the 479px centered icon margins, the
0px/12px tile rows, the employees 0px row + 24px grid, the 8px
staffrequests cluster + the expenses raw button, the companywall 8px
group, the payrollengine 4px group, the tenantsetup 16px circle +
ml-auto, the 16px workflowconfigpage CTA, the 24px PM tabs rhythm +
24px grid, the 32px shiftswap pills-to-card + the v:16 wrapper, the
2-track surveyanalytics grid + col-span, the EMPTY hrassistant pane,
the 8px chat gap). Gates: lint 0/0 · tsc ✓ · **910/910 unit** (+18) ·
build ✓ · **360/360 E2E** (+14; the amended session-31 spec green) ·
post-fix census **45/49** · 36 screenshots (the 368–403 pair set →
580 files; no ref/loc collisions; the 402 mobile pair byte-matches
the r65 366 pair — cross-round byte-stability of the standing
surface) · DB pristine.

## Session 66 instrument lessons (the margin/gap census, carry-forward)

1. **The space-y direction flip is a POSITION problem, not just a
   value problem**: v3 puts the zero margin on the FIRST child, v4 on
   the LAST — per-element one-sided normalization (mark I) still
   leaves DIFFs because the tuple bundles each element's own gap.
   Parse the PARENT's authored space-y value and emit `v:N` for every
   boundary-shaped pair (mark II) — position-independent on both
   engines.
2. **A census MATCH can be a set-absorption false MATCH** (the third
   face of set blindness): allleaverequests censused MATCH while its
   StatCard row carried mb-3 REF does not render — another element
   supplied the identical tuple. Set equality is the alarm; per-element
   probes are the verdict; the E2E pins are the contract.
3. **The inline-flex margins never collapse**: an inline-flex child's
   space-y margin-bottom does NOT collapse with the next sibling's
   margin-top (margins of inline-level boxes never collapse) — a
   space-y-6 Tabs root under v4 DOUBLES the tabs→content gap (24+24).
   The R22-B `mb-0!` kill on the List + the content's own mt is the
   compensation pattern (census v:24 + visual 24 on both engines).
4. **A census read can be a mid-load transient**: REF's evaluations
   tabs read `mr=0, ml=304` at census time (+6.4s post-open) but
   `(304,304)` settled — the loading state had a different container.
   Element-level re-probes at rest are the tiebreaker; never fix
   against a transient read.
5. **A pinned "transient" can be a real spec race**: the session-58
   switch/checkbox flake fired 3× consecutively on the cold-cache
   sandbox — the count-ran-before-fetch race was always the mechanism;
   the "documented transient" framing masked it. When a transient
   fires in isolation, retire the race, don't re-run.
6. **A frozen measurement can drift ON REF's side**: the R10-C
   companywall `space-y-3 + block leading-5` pin was a real measurement
   — REF's live form is now `space-y-2` + leading-none. Re-measure any
   pin the census contradicts before amending the clone; the pin may
   be recording a REF that no longer exists.

## Session 67 (parity round 66) — the dark-mode geometry/spacing re-census (the matrix-completion verification round)

Workspace rebuilt from scratch (fresh clone at `07fcfbf` — the
round-65 landing; environment per protocol: `.env` with
`DATABASE_URL="file:../db/custom.db"` + a QUOTED generated AUTH_SECRET
(the standing-run greps the quoted form — an unquoted value greps
empty and the instrumentation gate refuses the boot), db pushed +
seeded at `<repo>/db/custom.db`, playwright chromium; the
exported-DATABASE_URL trap HIT AND RESOLVED — the sandbox re-exports
`DATABASE_URL=file:/home/z/my-project/db/custom.db` per invocation, so
EVERY db-touching command runs with an in-invocation `unset
DATABASE_URL`). Baseline gates: lint 0/0 · tsc ✓ · **910/910 unit** ·
build ✓ · E2E 359/360 — the one failure RETIRED below (the R37-C spec
race).

**Deploy watch (`scripts/r67-deploy-watch.mjs`, the post-29th finals
armed): THE 30TH LOGIN DEPLOY DETECTED** — login JS
`q8Uif46n`→`DwY57mhH` + CSS `CiCfCTzx`→`BpSyi-cD` (the app side QUIET
`C-IrDy5f`/`BGNH4KkS`). After a fresh re-auth of the shared REF
session (the stale-session lesson), the full confirmation ladder
re-audited the 30th **NON-VISUAL**: standing 5/5 + sweep 12/12 +
verify-r49 13/13 + verify-r45 13/13. The watch finals are the
post-30th hashes.

**The frontier (the round-65 completion record's next cell)**: the
computed-style matrix covered color × both themes (r57–r63) and the
LIGHT cells of geometry (r65) + spacing (r66); the two DARK cells of
the geometry/spacing axes — theme-invariant BY AUTHORING (no `dark:`
geometry/spacing members exist in the corpus) — had never been
computed-verified. The instruments: `r67-dark-geometry-census.mjs`
(the r65 population re-read in dark) + `r67-dark-margin-census.mjs`
(the r66 population re-read in dark), both armed via
`localStorage darkMode="true"` + the boot script's pre-paint class
(verified live via the body background `rgb(10,10,10)` after
navigation — the sanity print that checks html.dark immediately after
the set correctly reads FALSE: the class applies on the NEXT load).

**The censuses — the FIRST VERIFICATION-ONLY round in the project's
history (zero fix families on the two axes)**:
- **Dark geometry 44/49** — the 5 DIFFs are the standing documented
  allowances, byte-identical tuples: employees (seeded grid cards),
  attendance (admin superset), interviewassistant (r48-C1),
  onboardingtemplates (the r36 `<a>` superset — identical
  `8,16,8,16|r:8` geometry, the tag is the superset), careers (live
  demo data + hero superset).
- **Dark margin/gap 45/49** — the 4 DIFFs are the standing allowances
  (employees, attendance, interviewassistant, careers).
- **The theme-invariance byte-proof (the round's strongest evidence)**:
  the DIFF routes re-read in LIGHT vs DARK produce BYTE-IDENTICAL
  census tuples on BOTH axes (the 5-route geometry re-read + the
  4-route margin re-read, diffed file-vs-file: zero differences). The
  geometry + spacing axes are computed-verified theme-invariant end to
  end.

**The R37-C spec race RETIRED (the one real defect found)**: the
full-suite baseline's 359/360 failure — the session-38 Add-Level
width pin measured **109.06px** vs the 110–115 range — passed 3×
isolated. Root cause (the r66 lesson-5 family, a MEASURE-without-
settle race): the dialog's `data-[state=open]:zoom-in-95`
animate-in means `toBeVisible()` passes at MOUNT while the scale
transition is in flight — 113 × mid-transition scale ≈ 109.06
exactly. The fix: the poll-until-stable read (two consecutive equal
widths = settled, ×12 @120ms) in `tests/e2e/dialog-interiors.spec.ts`.

**The mobile-menu standing check (the standing user emphasis)**: the
full functional cycle verified — toggle → drawer opens with the nav
links (Dashboard, Training LMS, Assets, Staff Requests, AI HR
Assistant…), the "Training LMS" link navigates to `/training`
(auto-close on route change), Escape closes the re-opened drawer. The
byte-stability pair: the 418 LIGHT mobile drawer pair @390×844
**byte-matches the r66 402 pair on BOTH sides** (and transitively the
r65 366 pair — three-round byte-stability of the standing surface).
The DARK mobile drawer pair (420/421) captured as the new
dark-surface evidence.

TDD: **zero unit pins (zero source changes — a verification round)**;
+6 E2E (`tests/e2e/session67-dark-geometry.spec.ts` — the
theme-invariance contract locked with computed truth: the boot-script
dark contract incl. the /login theme-inert R39-B split, the dark
StatCard padded/tileFixed row twins, the dark scroll band, the dark
svg-authored empty-state margins, the dark employees grid +
alwaysRow, the dark tenantsetup circle + ml-auto). Gates: lint 0/0 ·
tsc ✓ · **910/910 unit** (unchanged) · build ✓ · **366/366 E2E**
(+6; the hardened R37-C green) · the censuses 44/49 + 45/49 (all
allowances) · 18 screenshots (the 404–421 pair set → 604 files; the
418 pair byte-matches the r66 set) · DB pristine.

## Session 67 instrument lessons (the dark re-census, carry-forward)

1. **The measure-without-settle race**: an animated surface (dialog
   zoom-in-95) passes `toBeVisible()` at mount while the transform is
   still in flight — a geometry read taken then measures the
   ANIMATION, not the element (109.06 = 113 × mid-scale). The
   poll-until-stable read (two consecutive equal values) is the
   settle contract for any geometry read on an animated surface.
2. **The theme re-census needs a NAVIGATION after the localStorage
   write**: the boot script applies html.dark pre-paint on LOAD —
   setting `darkMode="true"` does not toggle the CURRENT page (only
   the Moon handler does). The census route-opens all navigate, so
   the reads are correctly dark — but a sanity print checking
   html.dark immediately after the set reads FALSE by design; verify
   dark via the post-navigation body background instead.
3. **A verification round still needs the allowance byte-proof**: a
   census that returns all-allowance is weak evidence alone (the r64
   zero-fix lesson); the byte-identity diff — the same routes re-read
   in LIGHT vs DARK, tuples compared file-vs-file — is the strong
   form: it proves theme-invariance PER ROUTE, not just per axis.
4. **The per-batch DIFF dump OVERWRITES by default**: the r62
   mid-batch dump protocol saves each batch's DIFFs, but re-running a
   later batch overwrites the file — re-run the DIFF routes as their
   own batch (or set the R67_DUMP env) before byte-diffing across
   reads.
5. **The AUTH_SECRET quoting contract**: the standing-run/ladder
   scripts grep `AUTH_SECRET="\K[^"]+` — the QUOTED form — from
   `.env`; an unquoted secret greps empty and the instrumentation
   gate refuses the boot ("AUTH_SECRET is required in production").
   `.env` values follow the `.env.example` form: quoted.

## Session 68 (parity round 67) — the Next.js security-patch upgrade + the history-bug closure + the 31st-deploy ladder + the drift re-census

The matrix was complete (r66); this round converted the recorded
frontier. Baseline on 16.4.0 reproduced first: lint 0/0 · tsc ✓ ·
910/910 unit · build ✓ · **E2E 366/366 (5.5m, zero flakes)**.

**THE UPGRADE WATCH IS ACTIONABLE — next 16.4.0 → 16.4.2**
(`bun add next@16.4.2 eslint-config-next@16.4.2`; package.json pinned
to the exact patch version). 16.4.1 (2026-10-14) ships TWO CRITICAL
unauthenticated-RCE security fixes (use-cache functions returning
typed arrays + the Image Optimization API when SVG files are used)
plus a High Server-Actions DoS fix; 16.4.2 (2026-10-15) adds the
Turbopack snapshot-consistency + module-graph backports. A
production-ready codebase cannot stay on 16.4.0 against two
critical unauthenticated RCEs. Post-upgrade gates: lint 0/0 · tsc ✓
· **910/910 unit** · build ✓ (22.4s compile) · **E2E 366/366 on the
upgraded build (5.6m, zero flakes)** — the upgrade is
regression-free at every gate.

**THE HISTORY BUG IS FIXED UPSTREAM — the one recorded functional
divergence CLOSES** (R56-E / the session-56 §B record). The revived
detector (`scripts/r68-history-detector.mjs`, the Navigation API
entries dump — the session-56 repro shape, determinism pre-step:
`about:blank` first, else a re-run inherits the previous stack):
after a full load + two client-side navigations the entries grow
push-only (prefix preserved, one entry per click, ZERO adjacent
duplicates) and back-back REACHES the loaded page — the 16.4.0
corruption (the loaded entry replaced by the entry-below duplicate,
back-back skipping the loaded page, 5/5 deterministic) is GONE
between 16.4.0 and 16.4.2. Locked with 2 computed-truth E2E pins in
`tests/e2e/session68-history-closure.spec.ts`: R68-A the two-deep
back contract (back-back after load + two client navigations lands
on the loaded page) + R68-B the push-only entries contract (the
entry list: +1 per click, prefix preserved, no adjacent duplicates,
the pushed tail in order) — green on the first run; a future
framework upgrade that reintroduces the corruption trips the gate.

**THE 31ST LOGIN DEPLOY — detected by `scripts/r68-deploy-watch.mjs`
(post-30th finals armed): login JS `DwY57mhH`→`8hcVVGz2`, login CSS
QUIET (`BpSyi-cD`), the app side QUIET (`C-IrDy5f`/`BGNH4KkS`)**.
After a fresh re-auth of the shared REF session, the full
confirmation ladder re-audited the 31st **NON-VISUAL**: standing
5/5 + sweep 12/12 + verify-r49 13/13 + verify-r45 13/13 — on the
UPGRADED :3200 standalone (a free re-validation that the standing
audits hold on 16.4.2). The watch finals are the post-31st hashes.

**THE REF-DRIFT RE-CENSUS (the r63 light-text instrument re-run
against the CURRENT REF — the color censuses last ran ≥3 REF deploys
ago): 42/49 MATCH, NO DRIFT** — better than the r63 post-fix 41/49
(the r63-era taskmanager mid-load transient now MATCHES at steady
state). Every DIFF decomposes to the documented allowance set
exactly: employees (the seeded grid cards), profile (the asChild
back-arrow tag artifact), attendance (the admin superset),
interviewassistant (the r48-C1 card), advancedanalytics (the hidden
recharts-tooltip mount), onboardingtemplates (the r36 `<a>`
superset), careers (REF's live data). The placeholder literal pairs
(`rgb(115,115,115)` on every censused route), the muted text pairs,
and the neutral literal overrides all held — **the
muted-foreground/--primary token question CLOSES as architectural**:
the token re-map has zero user-visible surface (every computed
surface carries its literal override; the census is the evidence).

**The standing checks**: the mobile-menu full functional cycle
(toggle → the drawer opens with the nav links → the Training LMS
link navigates to /training → auto-close on the route change,
`open:false` verified) + **the byte-stability pair: the 438 LIGHT
mobile drawer pair @390×844 BYTE-MATCHES the r67 418 pair on BOTH
sides** (md5-identical) — a FOUR-round byte-stability chain
(438 ≡ 418 ≡ 402 ≡ 366) and the FIRST CROSS-VERSION byte-proof
(418 captured on 16.4.0, 438 on 16.4.2: the upgrade changed zero
rendered bytes of the standing surface; the REF side identical also
re-confirms the 31st deploy left the app surface untouched). The
TW-v4 standing scan: `!important` 15 (baseline held), the oklch
hits all comments. Screenshots: the 422–439 pair set (18 files,
616 total) — the LIGHT route pairs on the upgraded build (the
light complement to r67's dark theme), the mobile drawer pair, the
inline functional cycle. DB pristine (the verify-r45
loading-probe user swept per the r61 protocol).

TDD: +2 E2E (the history-closure contract) · zero unit pins (zero
app-source changes; the upgrade's regression proof is the full
366/366 suite on 16.4.2 + the new pins → **368/368**). Gates: lint
0/0 · tsc ✓ · 910/910 unit · build ✓ · **E2E 368/368** · DB
pristine. `next`/`eslint-config-next` pinned at 16.4.2; the
`bun.lock` + `package.json` are the upgrade's manifest.

## Session 68 instrument lessons (carry-forward)

1. **A re-run detector inherits the live session's stack**: the
   history detector's first run was clean evidence, but the re-run's
   e0 read showed the PREVIOUS run's entries — `agent-browser open`
   on the URL the tab already sits at is a same-URL reload (no new
   entry), and the session's Navigation entries persist. The
   determinism pre-step: `open about:blank` first (a document change
   resets the starting stack), then the app URL.
2. **agent-browser eval returns two shapes**: a JSON-encoded string
   for scalars, PRETTY-PRINTED JSON (multi-line, real newlines) for
   arrays — the parse chain must try the plain parse before the
   double-decode, else array reads come back "ERR:" + the raw text
   and the verdict machinery reads a polluted value.
3. **The background-process launch pattern**: `setsid nohup … &`
   inside `( … & )` detached from the tool's process group; the
   plain `nohup … & disown` died silently (0-byte log, no process)
   when the invocation returned — reproduce the working pattern
   exactly for any long E2E/census run.
4. **The sleep-units trap, hit AGAIN**: `sleep 2500` in a shell
   chain means 2500 SECONDS (41 minutes), not 2.5s — the session-67
   "units error" lesson is standing; the fresh instance cost a
   60s tool timeout. Shell sleeps are SECONDS; write `sleep 2.5`.
5. **The deploy-watch verdict splits by side**: the 31th deploy
   changed the LOGIN JS only (CSS + the app side quiet) — the
   protocol still requires the full ladder (a login-side change can
   presage an app rollout), and the byte-stability pair is the
   independent app-surface re-confirmation.

## Session 69 (parity round 68) — the 32nd-deploy confirmation ladder + the HTTP-layer security-headers parity set

The recorded backlog came out of round 67 empty of open visual/
functional items; this round converted the standing watches and the
open superset consideration. Baseline reproduced on the fresh clone
first: lint 0/0 · tsc ✓ · 910/910 unit · build ✓ · **E2E 368/368
(5.6m, zero flakes)**.

**THE 32ND LOGIN DEPLOY — detected by `scripts/r69-deploy-watch.mjs`
(the post-31st finals armed)**: login JS `8hcVVGz2`→`CKnh3tRk` plus a
NEW `api/frontend-config.js?v=3` script (login CSS QUIET `BpSyi-cD`;
the app side QUIET `C-IrDy5f`/`BGNH4KkS`). The frontend-config
payload is a Base44 PLATFORM-level config (Datadog tokens, the
Turnstile site key, `TURNSTILE_LOGIN_ENABLED: "true"`, the Google
client ID, platform URLs) — NOT an Eon-HR-app change. The login DOM
recon: structurally unchanged (the same 7 buttons, one form,
email+password, ZERO Turnstile iframes/widgets rendered for this
session). Per the standing protocol the full confirmation ladder ran
anyway (a login-side change can presage an app rollout): after a
fresh re-auth, standing **5/5** + sweep **12/12** + verify-r49
**13/13** + verify-r45 **13/13** (the login-view family — the direct
paired audit of the changed surface) → **NON-VISUAL**. The watch
finals are the post-32nd hashes. The Turnstile rollout is recorded
as a standing note: while the challenge stays unenforced for our
flow, no clone-side action; an enforced rollout would break the
watch's own re-auth and require a login-surface re-audit + a
clone-side bot-guard decision.

**The Next.js patch watch: QUIET** — `npm view next` reads 16.4.2 as
the latest stable (16.5.0 is canary-only). The codebase is current;
the watch stays armed.

**R69-A — THE HTTP-LAYER PARITY SET (the round's fix family, the
first below the DOM layer in the project's history)**. 67 rounds of
audits lived at the DOM/computed-style layer; the HTTP response-
header layer was never censused. The live REF serves a 5-header
security set on every response (`curl -sI https://eon.base44.app/
login`): `x-content-type-options: nosniff` · `x-frame-options:
DENY` · `referrer-policy: strict-origin-when-cross-origin` ·
`strict-transport-security: max-age=31536000` ·
`permissions-policy: camera=(self), microphone=(self),
geolocation=(self), payment=(self), usb=(self), magnetometer=(),
gyroscope=()`. The clone's standalone served NONE (next.config.ts
had no `headers()`; src/proxy.ts adds none; zero existing tests).
TDD: the pin RED first (`tests/e2e/session69-security-headers.spec.ts`
R69-Aa/R69-Ab — page route + API route, 2 specs failing on the
headerless build) → `headers()` added to next.config.ts (source
`/:path*` — every route, pages AND `/api/*`, exactly like the REF
platform; HSTS included: browsers ignore it over plain HTTP, it
protects real TLS-fronted deployments, it matches REF; no CSP — REF
serves none, measured, and a Next.js CSP needs its own nonce
pipeline) → re-build → pin GREEN (3/3) → curl parity verified
against the standalone (page + API both carry the set; values
byte-identical to REF — the casing difference is transport-level
HTTP/1.1 vs HTTP/2 normalization). **E2E 368 → 370.**

**The standing checks**: the mobile-menu full functional cycle
(toggle → the drawer opens with Dashboard/Training LMS/Assets/
Staff Requests/AI HR Assistant → the Training LMS link navigates to
/training → auto-close `open:false` verified) + **the byte-stability
pair: the 456 LIGHT mobile drawer pair @390×844 BYTE-MATCHES the r68
438 pair on BOTH sides (md5-identical) — the FIVE-round chain
(456 ≡ 438 ≡ 418 ≡ 402 ≡ 366)**; the 32nd deploy left the mobile
surface byte-identical AND the header patch changed zero rendered
bytes. The TW-v4 standing scan: `!important` 15 (baseline held),
the oklch hits all comments. Screenshots: the 440–457 set (18 files
→ 640 on disk; all 9 same-number pairs hash-distinct) — the LOGIN
page pair on the 32nd-deploy REF (captured logged-out, fresh
sessions, BEFORE the auth) + the LIGHT standing route pairs
(dashboard, payroll, employees, attendance, training, recruitment,
settings) + the mobile drawer pair. DB pristine (the verify-r45
loading-probe user swept per the r61 protocol).

TDD: +2 E2E (the security-headers pins) + **1 legacy unit amendment
(R51-A2)** — the rewrite-scope pin's regex matched `source:` literals
across the WHOLE config file, so the headers() block's own
`source: "/:path*"` (Next's headers API shares the key name) tripped
it; per the r65/r66 legacy-amendment protocol the pin now reads the
REWRITES() BLOCK (its true contract: exactly the two entries) and
ADDITIONALLY pins the headers contract (exactly one catch-all; the two
config surfaces kept separate). Gates: lint 0/0 · tsc ✓ · 910/910 unit
· build ✓ · **E2E 370/370** · the ladder NON-VISUAL (43/43) ·
byte-stability 456≡438 · DB pristine. `.env.example` verified (only
DATABASE_URL + AUTH_SECRET are read — the process.env sweep re-run
this round).

## Session 70 (parity round 69) — the SEO-surface parity pair (sitemap + robots Sitemap directive) + the CSP nonce pipeline (the first security-policy superset)

**The round's motivation.** The recorded backlog stayed EMPTY of open
visual/functional items; the standing watches were the deploy watch
(post-32nd finals), the Next.js patch watch (16.4.3+), and the
superset-expansion consideration. The r68 lesson ("census new LAYERS,
not just new members") sent the sweep below the response headers, and
it found the last uncensused member of the SEO layer:

1. **The deploy watch (scripts/r70-deploy-watch.mjs): BOTH SIDES
   QUIET** — no 33rd deploy (login JS `CKnh3tRk` + CSS `BpSyi-cD` +
   the frontend-config preload; the app side `C-IrDy5f`/`BGNH4KkS`
   all hold); the fresh re-auth clean (Turnstile stays unenforced for
   our session/IP — the standing login-side watch item). NO ladder
   required.
2. **The Next.js patch watch: QUIET** — 16.4.2 remains the latest
   stable (16.5.0 canary-only). No action.
3. **THE SEO-SURFACE GAP FOUND (R70-A)**: the live REF serves
   `sitemap.xml` (200, application/xml — 61 `<url>` entries: `/` at
   priority 1.0 + its 60 app routes at 0.8, every one
   `<changefreq>weekly</changefreq>`, no `<lastmod>`; saved as
   docs/ref-sitemap-r70.xml) and its robots.txt declares the sitemap
   (`Sitemap: …/sitemap.xml`). The clone served NO sitemap route and
   its static robots.txt carried no Sitemap directive. Fixed with the
   Next metadata routes: `src/lib/sitemap-routes.ts` (the 61-slug
   canonical registry — the session-32 complete page set in the
   clone's lowercase canonical form — + the pure `buildSitemap`
   builder) + `src/app/sitemap.ts` (origin resolved via headers(),
   exactly like the root layout's metadataBase) + `src/app/robots.ts`
   (the dynamic robots: REF's directive set + the clone's superset
   `Disallow: /api/` + the origin-resolved Sitemap line) with
   `public/robots.txt` DELETED (the static file would shadow the
   route). The URL-set diff vs REF, verified live: REF's 61 ⊆ the
   clone's 62, the one superset member `/dashboard` (the clone's
   canonical dashboard route — its page canonical points there; REF
   omits it only because its dashboard IS `/`). Two renderer
   normalizations documented (not divergences): Next serializes
   priority 1 as "1" (xsd:decimal-equivalent to REF's "1.0") and
   capitalizes the robots directive "User-Agent:" (the robots spec is
   case-insensitive); the sitemap XML is compact where REF
   pretty-prints — the semantic contract is what's pinned.
4. **THE CSP NONCE PIPELINE (R70-B) — the first security-policy
   SUPERSET** (REF serves no CSP at all — measured in the r68
   census): the official Next.js middleware-nonce pattern. `src/lib/
   csp.ts` (`buildCsp(nonce, isDev)` — default-src 'self'; script-src
   'self' 'nonce-N' 'strict-dynamic'; style-src 'self' 'unsafe-inline'
   (the inline style ATTRIBUTES — Radix/vaul/recharts — need it; TW4's
   compiled CSS rides a <link>); img-src 'self' data: blob:; font-src
   'self' data:; connect-src 'self'; base-uri/form-action 'self';
   frame-ancestors 'none'; object-src 'none'; NO upgrade-insecure-
   requests — it would break the plain-HTTP standalone + E2E
   transport; dev adds 'unsafe-eval' + ws: for fast-refresh/HMR).
   `src/proxy.ts` extended: a per-request nonce, the CSP set on the
   REQUEST headers (Next reads the nonce from the request CSP header
   and stamps it on every script it renders — the documented
   auto-nonce mechanism, curl-verified: the chunks carry
   `nonce="…"`), the matcher widened to include /login + /logout
   (documents with scripts), the auth-redirect explicitly scoped past
   the two auth pages. The root layout stamps the nonce on its own
   inline scripts (the THEME_BOOT boot + the two JSON-LD blocks — CSP
   applies to non-executable script types too). The strictness is
   earned: the full-source URL sweep reads ZERO external runtime
   resources (only placeholder strings in seed data). The functional
   proof: the FULL E2E suite green on the patched build — any blocked
   script would break hydration and fail the suite loudly.
5. **The standing checks**: the mobile-menu cycle green (toggle →
   the drawer opens with Dashboard/Training LMS/Assets/Staff
   Requests → the Training LMS link navigates to /training →
   auto-close `open:false` verified); the byte-stability pair 474
   BYTE-MATCHES the r69 456 pair on BOTH sides (md5-identical: ref
   e24ad06…, loc e3df921…) — the SIX-round chain
   (474≡456≡438≡418≡402≡366): the quiet REF + the header/meta-layer
   fix families changed zero rendered bytes; the TW-v4 scan clean
   (`!important` 15, oklch all comments); DB pristine (users =
   [sepnetflix2023@outlook.com] only). Also swept: REF's soft-404
   (HTTP 200 SPA shell on unknown routes — the clone's proper 404 is
   the production-grade superset, kept) + REF's manifest/favicon
   302-redirects (the clone self-hosts both).

TDD: +12 unit (the 7-spec seo-surface seam — the registry-vs-filesystem
readdirSync comparison pin + the builder shape; the 5-spec csp seam —
the exact prod/dev directive strings) + 4 E2E (the sitemap/robots pair
+ the CSP header/nonce pair, both page classes), RED-first confirmed
(4 failed on the unpatched build → 5/5 green after). Gates: lint 0/0 ·
tsc ✓ · **922/922 unit** · build ✓ · **E2E 374/374 (5.6m, zero
flakes)** · byte-stability 474≡456 · DB pristine. Screenshots: the
458–475 set (18 files → 658 on disk; all 9 same-number pairs
hash-distinct). TRAP retired: the first detached E2E launch died
silently (18-byte log) — the surviving pattern is the parenthesized
subshell `(setsid nohup … < /dev/null &)`; the r69 screenshots
template's auto-close eval had an unbalanced paren (re-verified
directly: `open:false`).

## Session 71 (parity round 70) — the CSP completion pair (the missed JSON-LD nonce + the style-src elem/attr split) + the TLS-fronted deployment story + the 33rd-deploy ladder + the drawer-instrument correction

**The round's motivation.** The recorded backlog stayed EMPTY of open
visual/functional items; the standing watches were the deploy watch (the
post-32nd finals), the patch watch, the Turnstile rollout, and the
candor-ordered superset candidates from session_151: "a TLS-fronted
deployment story (HSTS only bites behind real TLS), CSP style-src
hardening (a nonce'd style pipeline — touches every Radix primitive for
zero REF delta), and whatever the next deploy carries."

1. **The r71 deploy watch (scripts/r71-deploy-watch.mjs, the post-32nd
   finals armed): THE 33RD LOGIN DEPLOY DETECTED** — login JS
   `CKnh3tRk`→`BCr9BMlh` (login CSS QUIET `BpSyi-cD`; the
   frontend-config preload holds; the app side QUIET
   `C-IrDy5f`/`BGNH4KkS`). The fresh re-auth succeeded clean (Turnstile
   unenforced — the standing login-side watch item). The full
   confirmation ladder: standing **5/5** + sweep **12/12** (the r52
   orchestrator) + verify-r49 **13/13** (the zero-tenant :3201 boot) +
   verify-r45 **13/13** (the login-view family via r52-login-reaudit) →
   **THE 33RD LOGIN DEPLOY IS NON-VISUAL** — byte-confirmed by the
   476 login pair ≡ the r70 458 pair on BOTH sides. The watch finals
   are the post-33rd hashes. The patch watch: QUIET (16.4.2 the latest
   stable).
2. **THE R70 DELTA AUDIT FOUND A REAL COMPLETENESS GAP**: the root
   layout's two JSON-LD blocks carry the nonce, but the LOGIN LAYOUT's
   own BreadcrumbList script served WITHOUT one (curl-verified live:
   a bare `<script type="application/ld+json">`) — CSP gates
   non-executable script types too, so the browser blocked the
   breadcrumb silently (nothing renders differently; the suite could
   not catch it). The same audit swept the whole served surface for
   `<style>` ELEMENTS: the login page's session-45 focus-cascade
   mirror is the ONLY one (27 app routes + 404 + logout read zero) —
   so the style-src hardening reshaped into the CSP spec's elem/attr
   SPLIT instead of a hash pipeline: **style-src-elem 'self'
   'nonce-N'** (elements: the linked CSS + the one authored login
   block, moved to the SERVER login layout for the stamping — a
   client page cannot read headers()) + **style-src-attr
   'unsafe-inline'** (attributes: the Radix popper px offsets, vaul
   drawer transforms and recharts svg styles are DYNAMIC runtime
   values that cannot be nonce'd or hashed — the split takes the
   element-side hardening and documents the attribute reality). Dev
   adds 'unsafe-inline' to style-src-elem (Turbopack injects <style>
   elements in dev — the mirror of the dev-only script-src
   'unsafe-eval' + ws: allowances).
3. **THE TLS-FRONTED DEPLOYMENT STORY (R71-B)**: HSTS is served (r69)
   but "only bites behind real TLS" — the missing piece is the PROXY
   CONTRACT, verified live and now PINNED
   (tests/e2e/session71-tls-origin.spec.ts): with
   `x-forwarded-proto: https` the sitemap locs, the robots Sitemap
   line, AND the canonical/og URLs all resolve `https://` — the
   metadataBase → canonical/og → sitemap → robots origin chain makes
   the TLS story zero-config (no site-URL env var exists or is
   needed). DEPLOYMENT.md rewritten to match the measured truth: the
   Eon HR name (the guide still said "ORBITAL"), the 42-handler/54-
   endpoint counts (it said 16), the honest env table (the
   `NEXT_PUBLIC_SITE_URL` row DELETED — nothing reads it; only
   DATABASE_URL + AUTH_SECRET), and the NEW §8: the nginx + Caddy
   proxy examples + the x-forwarded-proto contract table + why the
   app serves its own security headers and no
   upgrade-insecure-requests.
4. **THE DRAWER-INSTRUMENT CORRECTION (the round's evidence lesson)**:
   the 492 byte-stability capture initially FAILED to byte-match the
   474 pair on BOTH sides — the investigation found TWO instrument
   defects, not code changes: (a) the r70 template's
   `button[aria-label="Toggle Sidebar"]` selector NEVER matched on REF
   since the r46 redeploy dropped the aria-label — every r66-r70 REF
   "drawer pair" actually captured the drawer CLOSED (the six-round
   chain proved byte-stability of a CLOSED REF drawer; the
   probe-r37 amendment knew this — the screenshot scripts never got
   it); (b) a raw eval `b.click()` (the programmatic open) triggers
   vaul/Radix onOpenAutoFocus — the first menu button renders its
   focus-visible ring (a 1,160px band at y179-215) — a different
   legitimate state than the user-realistic mouse open. The CORRECTED
   mechanism (the accessible-name snapshot ref, mouse-based, works on
   both sides): **the LOC 492 pair BYTE-MATCHES the 474 pair
   (md5-identical e3df921…) — the SEVEN-round chain
   492≡474≡456≡438≡418≡402≡366 HOLDS through the r71 fix families**
   (the CSP completion + the TLS story changed zero rendered bytes),
   and the REF side is captured OPEN for the first time (bfaa0da…,
   the corrected baseline for future rounds; ref-vs-loc open-drawer
   diff 3.6% — text antialiasing + the allowance families, the panel
   means within 4 sRGB units, the scrims identical). The
   r71-screenshots.mjs script carries the corrected mechanism forward.
5. **The standing checks**: the mobile-menu cycle green TWICE — the
   inline probe (dialog + select popper + 9 recharts svgs + the vaul
   drawer all ZERO CSP violations under the hardened policy) + the
   screenshots script's own cycle (drawer state → Training LMS
   CLICKED:/training → auto-close `open:false`, the fixed eval reading
   it natively). The TW-v4 scan clean (`!important` 15, oklch all
   comments). DB pristine (the known loading-probe user swept per the
   r61 protocol → users = [sepnetflix2023@outlook.com] only).

TDD: +2 unit (the R71-A csp seam additions: the prod elem/attr split
+ the NO-blanket-style-src pin + the dev 'unsafe-inline' elem pin; the
R44-A1 legacy pin amended to the layout — the cascade mirror's new
home) + 6 E2E (the R71-A1..A3 hardening triple + the R71-B1..B3 TLS
contract triple — B expected GREEN pre-change, the r67 verification-
pin pattern, verified live by curl first; one assertion-vs-renderer
normalization: the robots "User-Agent:" capitalization, the r70
lesson repeating on the round's own spec). The session70-csp pin
amended to the new split contract. Gates: lint 0/0 · tsc ✓ ·
**924/924 unit** · build ✓ · **E2E 380/380 (5.9m, zero flakes)** ·
byte-stability 492≡474 (the seven-round chain, LOC side; the REF
baseline corrected) · the ladder 43/43 NON-VISUAL · DB pristine.
Screenshots: the 476-492 set (18 files → 676 tracked on disk; all 9
same-number pairs hash-distinct; the route pairs byte-stable vs r70
on both sides — the 33rd deploy byte-confirmed non-visual). TRAP
retired (infrastructure, not source): the fresh machine's playwright
cache held chromium-1200 while @playwright/test 1.63 expects
chromium_headless_shell-1248 — the first suite launch failed 367/374
with browserType.launch Executable-doesn't-exist; `bunx playwright
install chromium` retired it (classify the gate before touching
source: reproduce, then split infrastructure failure from code
debt).

## Session 72 (parity round 71) — the Trusted-Types rung (the CSP strictness ladder's next step) + the PWA/offline story (the service worker + the offline fallback) + the 34th-deploy ladder

**The round's motivation.** The recorded backlog stayed EMPTY of open
visual/functional items; the standing watches were the deploy watch
(the post-33rd finals), the patch watch, the Turnstile rollout, and the
candor-ordered superset candidates from session_155: "the remaining CSP
strictness rungs (a Trusted-Types story), a PWA/offline story (the
manifest already self-hosted), and whatever the next deploy carries."

1. **The r72 deploy watch (scripts/r72-deploy-watch.mjs, the post-33rd
   finals armed): THE 34TH LOGIN DEPLOY DETECTED** — login JS
   `BCr9BMlh`→`DOgRuj38` (login CSS QUIET `BpSyi-cD`; the
   frontend-config preload holds; the app side QUIET
   `C-IrDy5f`/`BGNH4KkS`). The fresh re-auth succeeded clean (Turnstile
   stays unenforced — the standing login-side watch item). The full
   confirmation ladder: standing **5/5** + sweep **12/12** (the r52
   orchestrator, seeded :3200) + verify-r49 **13/13** (the zero-tenant
   :3201 boot — one 0/13 read on a zero.db re-create race, re-run
   green: infrastructure, classified before touching source) +
   verify-r45 **13/13** (the login-view family) → **THE 34TH LOGIN
   DEPLOY IS NON-VISUAL** — byte-confirmed by the 493 login pair ≡ the
   r71 476 pair on BOTH sides. The watch finals are the post-34th
   hashes. The patch watch: QUIET (16.4.2 still the latest stable).
2. **R72-A THE TRUSTED-TYPES RUNG (the pure superset deepened)**. The
   r72 sink census green-lit it: the whole source reads ZERO raw
   DOM-XSS sinks (innerHTML/outerHTML/insertAdjacentHTML/
   document.write — all zero) and exactly FIVE
   dangerouslySetInnerHTML members — every one server-rendered,
   constant-authored (JSON.stringify of constant objects or
   template-literal CSS) and nonce'd. The rung (CSP3):
   `require-trusted-types-for 'script'` (every DOM XSS sink requires a
   Trusted* value) + `trusted-types default` (the policy-NAME
   allowlist — only the 'default' policy may exist, so attacker-JS
   cannot mint a new policy) + the nonced TT_BOOT bootstrap in the
   root layout (FIRST authored <head> script, production-only; the
   pass-through default policy: createHTML/createScript/
   createScriptURL identity functions). HONEST SCOPE: a pass-through
   default policy does not sanitize — the rung's value is the
   enforcement machinery + the policy-name control + the
   DOMPurify-ready foundation; the five sinks are constant-authored
   and nonced, nothing to sanitize. Chromium-only enforcement (other
   engines ignore the pair); dev stays WITHOUT it (Turbopack's
   injected scripts/evals would trip it — the mirror of the dev-only
   unsafe-eval allowance). The LIVE enforcement pin: creating a ROGUE
   policy name THROWS under the allowlist (RED pre-change — any name
   was allowed).
3. **R72-B THE PWA/OFFLINE STORY (the functional superset)**. The
   PWA-layer census measured REF: a login-surface-only manifest link
   (a stale platform-template description mentioning "OnboardFlow",
   EXTERNAL supabase-hosted icons), NO manifest on the authed shell,
   and ZERO registered service workers on any surface. The clone
   already superSETS the manifest surface (every-page linkage,
   self-hosted icons — the standing zero-external-resources policy);
   the missing piece was the OFFLINE SHELL, now shipped:
   `public/sw.js` (CACHE `eon-hr-shell-r72`: the static shell
   precached at install — /offline.html + the manifest + the icons +
   the logo + the og-image; /_next/static/ chunks cache-first;
   NAVIGATIONS network-only with the offline fallback to the cached
   /offline.html on fetch failure. Page HTML is NEVER cached and
   NEVER served from cache — the authed-HTML leak-free design; /api/
   and everything else passes through untouched) +
   `public/offline.html` (CSP-clean by construction: zero <script>,
   zero <style> ELEMENTS — inline style attributes only) + the nonced
   SW_REGISTRATION bootstrap in the root layout (production-only:
   dev's Turbopack fast-refresh would break on stale cached chunks).
   The proof: the un-authed /sw.js fetch (200 + the 5-header set),
   the live registration (ready resolves, scope '/', the reloaded
   page controlled), and the offline fallback (setOffline(true) → a
   navigation lands on the offline page).
4. **The standing checks**: the mobile-menu cycle green (toggle → the
   drawer with Dashboard/Training LMS/Assets/Staff Requests → the
   Training LMS link CLICKED:/training → auto-close `open:false`);
   the byte-stability pair 509 BYTE-MATCHES the r71 492 pair on
   BOTH sides (loc `e3df921…`, ref `bfaa0da…`) — the EIGHT-round
   chain 509≡492≡474≡456≡438≡418≡402≡366: both r72 fix families
   (the new non-visual <head> boots) changed zero rendered bytes, and
   the corrected open-drawer REF baseline reproduces; the TW-v4 scan
   clean (`!important` 15, oklch all comments); DB pristine (the
   probe user swept per the r61 protocol mid-round; users =
   [sepnetflix2023@outlook.com] only at close).

TDD: +13 unit (the csp seam's TT pair + worker-src pins in both
shapes; the pwa-surface seam: the SW semantic contract — the
versioned cache, the shell list, the EXACTLY-ONE caches.match, the
skipWaiting/clients.claim — + the offline page's CSP-clean
construction + the manifest's self-hosted icons superset + the
root-layout source pins) + 7 E2E (the R72-A triple RED-first —
the directives, the nonced bootstrap, the LIVE rogue-policy-THROWS
enforcement probe — + the R72-B quadruple — the un-authed sw.js
fetch, the nonced registration script, the live registration +
control, the offline fallback). One assertion-vs-authoring
normalization (the /sw.js quote style — the semantic contract, not
the authoring style). Gates: lint 0/0 · tsc ✓ · **937/937 unit** ·
build ✓ · **E2E 387/387 (6.2m, zero flakes — the SEQUENTIAL run; the
mid-round 379/380+1-target-crash read was CONCURRENT-load
infrastructure, the organogram spec 3/3 green in isolation)** ·
byte-stability 509≡492 (the eight-round chain) · the ladder 43/43
NON-VISUAL · 694 tracked screenshots (+18) · DB pristine. TRAPS
retired (both infrastructure, classified before touching source):
the zero.db re-create race (re-run green) and the
concurrent-ladder chromium target-crash (the load lesson: the
ladder is port-safe with the suite but not LOAD-safe — run the
final proof sequentially).

## Session 73 (parity round 72) — the security-isolation rung (COOP + CORP + COEP) + the PWA manifest-linkage completion (the authed-shell gap) + the 35th-deploy ladder

**The round's motivation.** The session-72 completion record left the
backlog EMPTY of open visual/functional items; the standing watches
were the deploy watch (the post-34th finals), the patch watch, the
Turnstile rollout, and the candor-ordered superset candidates from
session_157: "the remaining PWA rungs (a web-app-installability pass,
the offline-page styling parity), a security-headers second pass
(COOP/COEP/CORP — REF serves none, the superset stays open), and
whatever the next deploy carries." The deploy carried.

1. **The r73 deploy watch (the r72 instrument re-armed at the post-34th
   finals): THE 35TH LOGIN DEPLOY DETECTED** — login JS
   `DOgRuj38`→`BANnI-PC` AND login CSS `BpSyi-cD`→`COgwiEvt` (the FIRST
   CSS movement since r70; the frontend-config preload holds; the app
   side QUIET `C-IrDy5f`/`BGNH4KkS`). The fresh re-auth clean (Turnstile
   stays unenforced — the standing login-side watch item; the login DOM
   census re-read the unchanged 7-button set + one email/password form +
   zero rendered Turnstile widgets). The full confirmation ladder: the
   fresh logged-out login pair BYTE-IDENTICAL to the r72 493 REF
   baseline (`69aa4241…`) + standing **5/5** + sweep **12/12** +
   verify-r49 **13/13** + verify-r45 **13/13** → **THE 35TH LOGIN DEPLOY
   IS NON-VISUAL**. The watch re-armed at the post-35th finals
   (scripts/r73-deploy-watch.mjs) reads BOTH SIDES QUIET. The patch
   watch: QUIET (16.4.2 still the latest stable).
2. **R73-B THE SECURITY-ISOLATION RUNG (the transport-layer superset
   deepened).** Re-measured this round (curl -sI): the live REF serves
   NO Cross-Origin-Opener-Policy, NO Cross-Origin-Embedder-Policy, and
   NO Cross-Origin-Resource-Policy on any surface — the r68 finding
   holds; the trio is a pure superset, response-layer (zero rendered
   bytes). Shipped on the r69 catch-all (the same `/:path*` source, so
   every response carries them — pages, /api/*, /_next/static chunks,
   public/ assets: measured on /login, /api/health, a chunk, and
   public/sw.js): COOP `same-origin` (windows share references only
   with same-origin openers) + CORP `same-origin` (no other origin may
   embed this origin's resources) + COEP `require-corp` (the document
   may only load subresources that opt in via CORP/CORS — EARNED by the
   standing zero-external-resources URL sweep; the social glyphs are
   inline SVG, recharts/Radix pull nothing cross-origin).
3. **R73-C THE PWA MANIFEST-LINKAGE COMPLETION (the found-and-fixed
   bug).** The r72 census claimed "every-page linkage" for the manifest;
   measured FALSE — the link lived only in the login layout, so the
   ENTIRE authed shell (61 routes) served zero `<link rel="manifest">`
   while the service worker registered on every page (live-measured on
   the authed dashboard: `manifest:false`). Chrome's installability
   criteria need the link on the page being installed. The fix hoists
   `manifest: "/manifest.json"` + the apple-touch-icon to the ROOT
   layout's metadata (Next's per-field inheritance carries them to
   every route the child does not override; login's own identical
   values stay). Non-visual head elements — zero rendered bytes.
4. **THE NINE-ROUND BYTE CHAIN HOLDS** — the 526 drawer pair
   BYTE-MATCHES the r72 509 pair on BOTH sides (loc `e3df921…`, ref
   `bfaa0da…`): 526≡509≡492≡474≡456≡438≡418≡402≡366. The 510 login
   pair BYTE-MATCHES the r72 493 pair on BOTH sides — both r73 fix
   families changed zero rendered bytes AND the 35th deploy left both
   surfaces byte-identical. The mobile-menu functional cycle green:
   toggle → the drawer (Dashboard/Training LMS/Assets/Staff Requests) →
   Training LMS CLICKED:/training → auto-close `open:false`.
5. **THE DEPENDENCY AUDIT RECORDED** — `bun audit` reads exactly two
   advisories, both HIGH, both DEV-TOOLING transitive chains, both
   upstream-blocked: `braces@3.0.3` (GHSA-vfj7-8cjw-p6xm — the
   eslint-config-next→fast-glob→micromatch chain; 3.0.3 IS the latest
   published version — no ecosystem fix exists) and `deepmerge-ts@7.1.5`
   (GHSA-ggr8-5vv4-36mx — the prisma→@prisma/config chain pins the ^7
   line; the fix ships only in Prisma 8, still RC). Neither is in the
   runtime standalone graph; neither is attacker-reachable. A surgical
   `bun update` attempt was REVERTED (it pollutes package.json with two
   fake direct deps while leaving the real nested consumer untouched).
   Recorded as accepted dev-chain advisories with the upstream watch.

**TDD:** +7 E2E (RED-first both families — the R73-B triple: the trio
absent on the page route, the API route, and /sw.js; the R73-C
quadruple: the authed dashboard's manifest + apple links (RED on the
unpatched build), the login's standing manifest contract, the served
manifest's installability fields, and the SW control via the
r72-proven ready+reload pattern (the first draft's direct read raced
the registration lifecycle — the timing, not the contract, fixed by
following the r72 pattern)). Gates: lint 0/0 · tsc ✓ · **937/937
unit** · build ✓ · **E2E 394/394 (6.5m, zero flakes — the SEQUENTIAL
run)** · byte-stability 526≡509 (the nine-round chain, both sides) +
510≡493 (the login pair, both sides) · the ladder standing 5/5 + sweep
12/12 + verify-r49 13/13 + verify-r45 13/13 · 711 tracked screenshots
(+17) · DB pristine. TRAPS retired (all infrastructure, classified
before touching source): the playwright chromium-cache mismatch (the
environment held 1200-series browsers while 1.63 needs 1248 —
`bunx playwright install chromium` restores it) and the SW-control
timing race (ready+reload, never a direct post-goto read).

## Session 74 (parity round 73) — the PWA installability end-to-end pass (Chrome's own zero-errors verdict) + the SW cache-lifecycle hardening (the generation mechanism) + the 36th-deploy ladder

**The 36TH LOGIN DEPLOY DETECTED + LADDERED NON-VISUAL** — login JS `BANnI-PC`→`index-CiBFwtqW` (the `frontend-config` preload holding) AND login CSS `COgwiEvt`→`index-B9rzNd1e` (the second CSS movement in two rounds; the app side QUIET `C-IrDy5f`/`BGNH4KkS`); the fresh re-auth clean (Turnstile stays unenforced — the standing login-side watch item; the login DOM census unchanged: the social-button set, one email/password form, zero rendered Turnstile widgets). Audited NON-VISUAL via the full confirmation ladder: the fresh login probe pair BYTE-IDENTICAL to the r73 510 baseline on the REF side (`69aa4241…`) + standing 5/5 + sweep 12/12 + verify-r49 13/13 + verify-r45 13/13. The watch re-armed at the post-36th finals (`scripts/r74-deploy-watch.mjs`: login JS `index-CiBFwtqW` + CSS `index-B9rzNd1e`; the app side `C-IrDy5f`/`BGNH4KkS`) reads BOTH SIDES QUIET. The patch watch QUIET (16.4.2 the latest stable). The dependency watch AMENDED: the deepmerge-ts fix HAS shipped upstream inside `@prisma/config@7.10.1` (deepmerge-ts 8.0.2) and Prisma's `latest` dist-tag rides the 8.0.0-RC line — but the repo's stable `prisma@6.19.3` pins `@prisma/config: 6.19.3` EXACTLY (lockfile-verified, no caret) and the 6.x line ends at 6.19.3, so the advisory stays accepted with the watch re-recorded at "a 6.x backport or the repo's Prisma major upgrade" (braces 3.0.3 still the latest published — no fix exists).

**R74-B THE PWA INSTALLABILITY END-TO-END PASS (the candor-ordered candidate, measured FIRST)**: the r73 completion record claimed the installability chain "structurally complete" — a documented-but-unmeasured assertion, exactly the class the r73 lesson warns about. Measured via Chrome's own installability checker (CDP `Page.getInstallabilityErrors`, the instrument Lighthouse's installable audit rides — `scripts/r74-installability-probe.mjs`): **ZERO installability errors on BOTH surfaces** — the logged-out /login AND the authed /dashboard (`installabilityErrors: []` twice: the manifest link, the field set, the 192/512 icon decodes, the SW registration with a fetch handler, and the secure context all verified by the browser itself). The claim measured TRUE; pinned by `tests/e2e/session74-pwa-installability.spec.ts` (R74-B1a/b — green today, the standing-contract precedent: an icon swap, a manifest field edit, a SW-registration change, or a header/CSP change that breaks any criterion turns the pin RED). The `beforeinstallprompt` capture CONSIDERED AND DECLINED: the browser's own install affordances (omnibox icon / menu) work with zero page code; a page-side capture exists only to drive a CUSTOM install UI, which has no REF counterpart (the offline-page-polish deferral precedent).

**R74-C THE SW CACHE-LIFECYCLE HARDENING (the round's found-and-fixed bug — the fresh-eyes audit of the r72-era worker)**: two lifecycle defects measured — (a) THE FROZEN SHELL: the SHELL precache re-fetches only at the install event, and install re-fires only when sw.js bytes change; the un-bumped `eon-hr-shell-r72` name meant every existing client held the r72-era shell bytes indefinitely (a latent update bug: the day a shell asset changes, every installed client serves the stale copy forever unless someone remembers the hand-bump); (b) THE UNBOUNDED CHUNK CACHE: /_next/static chunks accumulated cache-first into the same-named cache across every deploy with nothing evicting them (a slow storage leak bounded only by the browser's whole-origin eviction). Fixed by the generation mechanism in `public/sw.js`: `GEN = "r74"` + the generation-stamped `SHELL_CACHE = "eon-hr-shell-r74"` (the activate sweep migrates old-generation clients — this sw.js byte change finally EXERCISES the update path: every r72-generation client re-installs, re-precaches, and sweeps the old cache) + the stable cross-generation `CHUNKS_CACHE = "eon-hr-chunks"` (immutable hash-named chunks survive shell bumps — no re-download) + the `CHUNKS_CAP = 120` oldest-first trim on every put (the insertion-order assumption documented in-source; the Cache Storage spec does not guarantee key order — worst case a random still-valid chunk lazily re-fetches). The bump protocol turned EXECUTABLE: the shell-drift tripwire (`tests/unit/pwa-surface.test.ts` R74-C1) pins the sha256 of the six SHELL asset bytes to the GEN — an asset edit without a bump goes RED with the bump-guiding message, and a bump without the digest update goes RED too. Pinned RED-first: the R74-C0..C3 unit quadruple failing on the unpatched build (the mechanism absent) → 14/14 green after; the r72 spec family amended to the generation-stamped name (the unit versioned-cache pin + the E2E R72-B1 served-contract), the whole r72/r73 PWA family green on the patched build (the offline fallback, the SW control, the manifest linkage, the un-authed sw.js fetch all ride the amended worker).

**THE TEN-ROUND BYTE CHAIN HOLDS** — the 543 drawer pair BYTE-MATCHES the r73 526 pair on BOTH sides (loc `e3df921…`, ref `bfaa0da…`: 543≡526≡509≡492≡474≡456≡438≡418≡402≡366) and the 527 login pair BYTE-MATCHES the r73 510 pair on BOTH sides (`bd718ed…` / `69aa4241…`) — both fix families (the worker-layer generation mechanism + the head/test-layer pins) changed zero rendered bytes AND the 36th deploy left both surfaces byte-identical; all seven standing route pairs byte-stable vs the r73 set on both sides. The mobile-menu functional cycle green: toggle → the drawer (Dashboard/Training LMS/Assets/Staff Requests) → the Training LMS link CLICKED:/training → auto-close `open:false`.

Gates: lint 0/0 · tsc ✓ · **941/941 unit (+4)** · build ✓ · **E2E 396/396 (+2 pins, zero flakes, 6.5m — the SEQUENTIAL proof run)** · byte-stability 543≡526 (the ten-round chain, both sides) + 527≡510 (the login pair, both sides) + the route pairs stable · the ladder standing 5/5 + sweep 12/12 + verify-r49 13/13 + verify-r45 13/13 · 729 tracked screenshots (+18, the 527-543 set) · DB pristine (the probe user swept; users = the demo account only). TRAPS retired (all infrastructure, classified before touching source): the playwright chromium-cache mismatch AGAIN (the environment held 1200-series browsers while 1.63 needs 1248 — `bunx playwright install chromium` restores it), the agent-browser daemon overload (stale sessions crash the native thread creation — `--all close` + restart restores it; the first watch re-run's eval timeouts read the LOGIN page's bundles as the app side: verify the authed surface on a warm session before classifying a deploy), and the exported-DATABASE_URL trap ACTIVE again (unset per invocation; the wrong-path DB swept).

## Session 75 (parity round 74 — completed across sessions; the tool-outage survivor) — the audit-only round: the deploy watch both-sides-quiet + the Lighthouse first-party audit 100/100/100 + the ELEVEN-round byte chain

**THE ROUND SPANNED SESSIONS** — session 75 was interrupted three times by the session-level gateway outage (the `403 Forbidden / broken session` class, documented in `docs/session_165.md`); its R75-A layer (environment, baseline gates, the deploy watch, the standing checks) interim-saved @ `e82368c` with R75-B partial (sw.js + the auth layer audited clean). The resuming session completed the round through **micro-task delegation** (the main session's tool plane stayed down the whole round; each fresh subagent session holds a working plane for a bounded call window — the instrument lesson below).

**THE R75 DEPLOY WATCH: BOTH SIDES QUIET — no 37th deploy.** The logged-out login page serves the post-36th finals byte-for-byte (login JS `index-CiBFwtqW` + CSS `index-B9rzNd1e`, both live 200s); the app side equally quiet (the root HTML references exactly `assets/index-C-IrDy5f.js` + `index-BGNH4KkS.css`, both serving 200). Nothing moved on either surface; no confirmation ladder required. The watch stays armed at the same finals for the next round.

**THE HTTPS-ORIGIN PROBE (the R75-B resume point): NO HTTPS ORIGIN IN SCOPE** — port 3000 serves nothing, no `cloudflared` in the sandbox. The recorded frontier candidate ("a real-Chrome install smoke on a deployed HTTPS origin") is **BLOCKED-IN-SCOPE** in this environment; the standing installability evidence remains the r74 pins (Chrome's own zero-errors verdict, executable in the E2E suite).

**THE LIGHTHOUSE FIRST-PARTY AUDIT (the fallback fresh-eyes candidate): 100/100/100.** Lighthouse 13.5.0 (via `bunx` — no dependency change, the lockfile untouched) against the production standalone on `:3200`: the logged-out `/login` AND the root `/` (307 → `/login?from_url=…`) score **accessibility 100 · best-practices 100 · seo 100** with ZERO flagged weighted audits (color-contrast, html-has-lang, image-alt, aria-allowed-attr, document-title, meta-description, robots-txt, canonical, errors-in-console, inspector-issues, valid-source-maps, is-on-https — all pass; localhost is a secure context). The PWA category is REMOVED upstream in Lighthouse ≥12 — the repo's executable PWA oracle stays Chrome's own installability checker (the r74 pins).

**THE STANDING CHECKS RE-VERIFIED at HEAD `a976895`:** the TW-v4 scan clean (15 `!important`, all globals.css; the oklch census precisely confirmed **comments-only** — 6/6 occurrences inside `/* … */` prose blocks documenting the trap-2 palette pin, zero active calls, zero in .ts/.tsx) · DB pristine (`users = ["sepnetflix2023@outlook.com"]`, the r61 protocol) · `bun audit` UNCHANGED (the two upstream-blocked dev-chain advisories: braces 3.0.3 still latest published; deepmerge-ts <8 under prisma's exact `@prisma/config` 6.x pin) · the Next.js patch watch QUIET (16.4.2 latest stable; `16.5.0-canary.21` approaching) · secrets zero · XSS sinks zero (session 165's read at this HEAD, zero source changes since).

**THE BYTE-STABILITY PROOFS (`scripts/r75-screenshots.mjs`, numbers 545-561):** the 561 mobile drawer pair BYTE-MATCHES the r74 543 pair on BOTH sides (loc `e3df921…`, ref `bfaa0da5…` — the ELEVEN-round chain 561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366) · the 545 login pair BYTE-MATCHES the r74 527 pair on BOTH sides (`bd718ed0…` / `69aa4241…`) · all seven standing route pairs BYTE-STABLE vs the r74 set on both sides (dashboard, payroll, employees, attendance, training, recruitment, settings). The mobile-menu functional cycle green: toggle → the drawer (Dashboard/Training LMS/Assets/Staff Requests) → the Training LMS link CLICKED:/training → auto-close `open:false` — no TW-v4 regression in the mobile navigation.

**ZERO DEFECTS FOUND — ZERO SOURCE CHANGES.** The fresh-eyes audit (sw.js + auth layer in session 165; the Lighthouse triple-100 this round) found nothing to fix; the round's diff is the instrument (`scripts/r75-screenshots.mjs`), the evidence (18 screenshots, 545-561 → 747 tracked), and the docs layer. The codebase at HEAD `a976895` is the r74-remediated state, already production-green. The plan: `docs/remediation-plan-session75.md`; the narratives: `docs/session_165.md` + `docs/session_166.md`.

**THE INSTRUMENT LESSONS (the outage-survivor round):** (1) the session-level gateway outage can persist for the main session's tool plane across a whole round — the working mechanism is MICRO-TASK DELEGATION (each fresh subagent session holds a working plane for ~5-8 calls; structure the round as a sequence of small, self-contained delegated tasks with verbatim-content instructions for anything prose-heavy); (2) the sandbox supervisor kills the ENTIRE process tree of each command shell at invocation boundaries — `nohup`/`setsid`/`disown` do NOT survive; a double-fork daemonizer that reparents to PID 1 does (the `:3200` server rode one through multiple session breaks); (3) background nohup'd long test runs die the same way — run long suites in the FOREGROUND with output redirected to a log file; (4) the chromium-cache trap again (the cache held r1200 browsers while `@playwright/test` 1.64.1 needs r1248 — `bunx playwright install chromium` restores it; a browser-cache/environment fix only, never a source problem).

Gates: lint 0/0 · tsc ✓ · **941/941 unit** · build ✓ · **E2E 396/396 (6.3m, zero flakes — the sequential proof)** · byte-stability 561≡543 (the eleven-round chain, both sides) + 545≡527 (the login pair, both sides) + the route pairs stable · **747 tracked screenshots (+18, the 545-561 set)** · DB pristine.

## Session 76 (parity round 75) — the double-deploy round: the 37th + the 38th login deploys both laddered non-visual + the bundle forensics (the chunk-graph rebuild mechanism) + the TWELVE-round byte chain

**THE ROUND FIRED THE DEPLOY WATCH TWICE.** The r76 watch (armed at the post-36th finals) read **THE 37TH LOGIN DEPLOY** at the opening — login JS `index-CiBFwtqW`→`index-BVGv30vf` (the `frontend-config` preload holding; login CSS QUIET `index-B9rzNd1e`; the app side QUIET `C-IrDy5f`/`BGNH4KkS`). The fresh re-auth clean (Turnstile unenforced — the standing login-side watch item; the login DOM census unchanged: the social-button set, one email/password form, zero rendered Turnstile widgets). The full confirmation ladder: the fresh logged-out login pair BYTE-IDENTICAL to the standing `69aa4241…` baseline + standing **5/5** + sweep **12/12** + verify-r49 **13/13** + verify-r45 **13/13** → NON-VISUAL. Then, while fetching the 37th's bundle for the forensic diff, the raw HTML served `index-CXV35yah` — **THE 38TH LOGIN DEPLOY, ~10 MINUTES AFTER THE 37TH**; the watch re-read confirmed login JS `BVGv30vf`→`CXV35yah` (CSS + the app side again QUIET), and the full ladder re-ran green on the new deploy (the fresh login pair again byte-identical; 5/5 + 12/12 + 13/13 + 13/13 again) → NON-VISUAL.

**THE BUNDLE FORENSICS (the round's fresh-eyes instrument): BOTH DEPLOYS ARE CHUNK-GRAPH REBUILDS.** Three entry generations fetched live (the 36th 97530 bytes / the 37th 97529 / the 38th 97529 — three distinct md5s); the generation-over-generation diff is ~840 REGENERATED CHUNK-HASH REFERENCES in the `__vite__mapDeps` dependency map (`mixpanelUtils`, `i18n`, `UserAppMain`, `axiosClient`, `vendor-utils`, …) while the entry bundle's own code stays the same size and the login page's rendered output stays BYTE-IDENTICAL (the PNG proof) — a platform-side rebuild with ZERO rendered change. The watch re-armed at the post-38th finals (login JS `index-CXV35yah` + CSS `index-B9rzNd1e`; the app side `C-IrDy5f`/`BGNH4KkS`) reads BOTH SIDES QUIET. **THE DEPLOY-CADENCE WATCH (new):** two non-visual rebuilds inside ~10 minutes — expect further deploys of the same class; ladder them the same way.

**THE STANDING CHECKS at HEAD `61ac313`:** the patch watch QUIET (next 16.4.2 the latest stable, dist-tags.latest = 16.4.2) · `bun audit` UNCHANGED (the two upstream-blocked dev-chain advisories: braces ≤3.0.3 — still the latest published; deepmerge-ts <8 under prisma's exact `@prisma/config` 6.x pin) · the TW-v4 scan clean (15 `!important` all globals.css; oklch 6/6 comments-only) · secrets zero · the raw DOM-XSS sink census ZERO-UNSAFE (the 9 pattern matches classified: 2 comments + 4 JSON-LD `JSON.stringify` blocks + 3 constant-authored nonced boot scripts + 1 constant style block — all server-rendered, all nonced, zero user input) · DB pristine after the sweep (the verify-r45 signup-flow probe user `loading-probe@example.com` swept per the r61 protocol; users = [sepnetflix2023@outlook.com], employees 1/1, balances 2/2).

**THE BYTE-STABILITY PROOFS (`scripts/r76-screenshots.mjs`, numbers 563-579):** the 579 mobile drawer pair BYTE-MATCHES the r75 561 pair on BOTH sides (loc `e3df921…`, ref `bfaa0da5…` — the TWELVE-round chain 579≡561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366) · the 563 login pair BYTE-MATCHES the r75 545 pair on BOTH sides (`bd718ed0…` / `69aa4241…`) — past BOTH deploys · all seven standing route pairs (565 dashboard, 567 payroll, 569 employees, 571 attendance, 573 training, 575 recruitment, 577 settings) BYTE-STABLE vs the r75 set on both sides. **THE MOBILE-MENU FUNCTIONAL CYCLE GREEN** (the standing user emphasis): toggle → the drawer (Dashboard / Training LMS / Assets / Staff Requests) → the Training LMS link CLICKED:/training → the URL lands on /training → the drawer auto-closes (`open: false`) — no TW-v4 regression.

**ZERO DEFECTS FOUND — ZERO SOURCE CHANGES** (the third consecutive audit-only round). The round's diff: the three instruments (`scripts/r76-deploy-watch.mjs` + `scripts/r76-login-probe.mjs` + `scripts/r76-screenshots.mjs`), the evidence (18 screenshots, 563-579 → 765 tracked), and the docs layer. The plan: `docs/remediation-plan-session76.md`; the narrative: `docs/session_168.md`.

**THE INSTRUMENT TRAPS RETIRED (all infrastructure, classified before touching source):** (1) the STALE REF SESSION COOKIE after a deploy — the first ladder read 0/5 + 0/12 because the deploy invalidated the `ref` session's auth and every authed route read the login page's h1; re-auth + re-run green (the "verify the authed surface on a warm session" lesson re-proven); (2) the FRESH-SESSION VIEWPORT DEFAULT — after a daemon reset the re-authed `ref` session defaulted to 1280px while the ladder's loc0 read 1440px, making every responsive recharts container read narrow (the surveyanalytics "diff" was pure viewport); always `set viewport 1440 900` before reads; (3) the agent-browser daemon overload (`spawnSync /bin/sh EAGAIN` under many live sessions — `close --all` + pkill + restart), with the side effect that `close --all` wipes the warm `ref` session auth (re-auth after every reset); (4) the chromium-cache trap again (r1200 held vs r1248 needed — `bunx playwright install chromium`); (5) the exported-`DATABASE_URL` trap ACTIVE again (`env -u` per invocation; the wrong-path DB swept); (6) the verify-r45 signup-flow probe user swept per the r61 protocol.

Gates: lint 0/0 · tsc ✓ · **941/941 unit** · build ✓ · **E2E 396/396 (6.3m, zero flakes — the sequential proof)** · byte-stability 579≡561 (the twelve-round chain, both sides) + 563≡545 (the login pair, both sides, past both deploys) + the route pairs stable · **765 tracked screenshots (+18, the 563-579 set)** · DB pristine.

## Session 77 (parity round 76) — the triple-deploy round: the 39th + the 40th login deploys both laddered non-visual (the CSS movement classified as a dead-code sweep) + the transfer-weight audit (the first page-weight measurement) + the THIRTEEN-round byte chain

**THE ROUND FIRED THE DEPLOY WATCH TWICE — AND THE FIRST ONE MOVED THE CSS.** The r76 watch (armed at the post-38th finals) read **THE 39TH LOGIN DEPLOY** at the opening — login JS `index-CXV35yah`→`index-BOwtYlPm` AND login CSS `index-B9rzNd1e`→`index-DS1aCkan` (the FIRST login-CSS movement since the 35th deploy; the `frontend-config` preload holding; the app side QUIET `C-IrDy5f`/`BGNH4KkS`). A CSS movement makes the ladder critical — and the ladder ran on the current generation: the fresh re-auth clean (Turnstile unenforced), the login DOM census unchanged (the six-button set, one form, zero Turnstile widgets), and the fresh logged-out login pair **BYTE-IDENTICAL** to the standing `69aa4241…` baseline. Then the probe's census read login JS `index-HY4zt1AJ` — **THE 40TH LOGIN DEPLOY, ~20 MINUTES AFTER THE 39TH** (a third generation inside one round; CSS quiet at `DS1aCkan`), confirming the deploy-cadence watch's prediction. The full ladder on the current generation: the fresh login pair byte-identical + standing **5/5** + sweep **12/12** + verify-r49 **13/13** + verify-r45 **13/13** → **BOTH DEPLOYS NON-VISUAL** (the 39th's CSS is transitively PNG-proven: the byte-identical pair ran ON the CSS it shipped).

**THE CSS-DELTA CLASSIFICATION: THE 39TH'S CSS MOVEMENT IS A DEAD-CODE SWEEP.** Both CSS generations fetched live (902707 → 902076 bytes, a 631-byte shrink); the rule-level diff reads **8 arbitrary-value utility rules REMOVED** (`bg-[#e2e5ee]`, `bg-[#e9eef6]`, `bg-[#fbfcfd]`, `border-[#d6e6fe]/70`, the `.dark:` variants, `dark:text-[#868aa5]`) + **1 ADDED** (`sm:grid-cols-[11rem_minmax(0,1fr)]`). A usage sweep of the current entry bundle and the served login HTML found **ZERO references** to any removed name — dead utilities from an older login-app iteration, swept by the platform build. The JS entry sizes: 97529 → 97481 bytes — the near-same-size chunk-graph-rebuild signature (the r75 mechanism).

**THE TRANSFER-WEIGHT AUDIT (the round's fresh-eyes instrument — the FIRST page-weight measurement in the program):** both apps measured per standing surface via the browser's own PerformanceResourceTiming (`scripts/r77-asset-audit.mjs`). **ALL ROUTES HEALTHY** on the LOC side — no route over 2 MiB total transfer, no single asset over 1.5 MiB; the authed routes decode 834-900 KiB each, LEANER than the REF SPA's ~2.3 MiB decoded bundle (the architecture trade: REF ships 3.9 KiB HTML shells + one big SPA; LOC server-renders 59-74 KiB HTML + smaller per-route payloads). The REF record: login 76 requests / 1809 KiB decoded. Zero anomalies, zero findings.

**THE STANDING CHECKS at HEAD `2ec8d57`:** the patch watch QUIET (next 16.4.2 the latest stable; the 16.5 line at `16.5.0-canary.21`) · `bun audit` UNCHANGED (the two upstream-blocked dev-chain advisories) · the TW-v4 scan clean (15 `!important` all globals.css; oklch 6/6 comments-only) · secrets zero · the raw DOM-XSS sink census ZERO-UNSAFE (the 9 pattern matches classified: 2 comments + 3 JSON-LD `JSON.stringify` blocks + 3 constant-authored nonced boot scripts + 1 constant style block) · DB pristine after the sweep (the verify-r45 signup-flow probe user swept per the r61 protocol — AFTER the last ladder run; users = [sepnetflix2023@outlook.com] at close).

**THE BYTE-STABILITY PROOFS (`scripts/r77-screenshots.mjs`, numbers 581-597):** the 597 mobile drawer pair BYTE-MATCHES the r76 579 pair on BOTH sides (loc `e3df921…`, ref `bfaa0da5…` — the THIRTEEN-round chain 597≡579≡561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366) · the 581 login pair BYTE-MATCHES the r76 563 pair on BOTH sides (`bd718ed0…` / `69aa4241…`) — past BOTH deploys AND the CSS movement · all seven standing route pairs BYTE-STABLE vs the r76 set on both sides. **THE MOBILE-MENU FUNCTIONAL CYCLE GREEN** (the standing user emphasis): toggle → the drawer (Dashboard / Training LMS / Assets / Staff Requests) → the Training LMS link CLICKED:/training → the URL lands on /training → the drawer auto-closes (`open: false`) — no TW-v4 regression.

**ZERO DEFECTS FOUND — ZERO SOURCE CHANGES** (the fourth consecutive audit-only round). The round's diff: the three instruments (`scripts/r77-login-probe.mjs` + `scripts/r77-asset-audit.mjs` + `scripts/r77-screenshots.mjs`), the evidence (18 screenshots, 581-597 → 784 tracked), and the docs layer. The plan: `docs/remediation-plan-session77.md`; the narrative: `docs/session_170.md`.

**THE INSTRUMENT TRAPS RETIRED (all infrastructure, classified before touching source):** (1) the agent-browser daemon overload AGAIN — the first standing-run read 0/5 with the `loc` session stuck on `about:blank` and a `CDP command timed out: Runtime.evaluate` on the diagnostic; `close --all` + pkill + restart + re-auth restores it (the r75 protocol re-proven, including the close-all-wipes-the-ref-auth side effect); (2) the exported-`DATABASE_URL` trap ACTIVE (`env -u` per invocation); (3) the verify-r45 signup-flow probe user swept AFTER the last ladder run (it re-creates itself on every ladder execution — the sweep must follow the final one); (4) the sandbox `/tmp` does not persist between tool invocations — fetch forensic artifacts to a repo-local scratch dir (swept before the commit).

Gates: lint 0/0 · tsc ✓ · **941/941 unit** · build ✓ · **E2E 396/396 (6.3m, zero flakes — the sequential proof)** · byte-stability 597≡579 (the thirteen-round chain, both sides) + 581≡563 (the login pair, both sides, past both deploys and the CSS movement) + the route pairs stable · **784 tracked screenshots (+18, the 581-597 set)** · DB pristine.

## Session 78 (parity round 77) — the quadruple-deploy cadence round: three login generations each fully laddered non-visual (the four CSS movements classified: a design-system library update + dead-code sweeps) + the full-route console census (the first runtime-cleanliness proof) + the FOURTEEN-round byte chain

**THE ROUND'S WINDOW READ THE LOGIN SIDE AT THREE NEW GENERATIONS — AND MOVED THE LOGIN CSS FOUR TIMES.** The r78 watch (armed at the post-40th finals) read the **43RD-LINE LOGIN DEPLOY** at the opening — login JS `index-HY4zt1AJ`→`index-tq_Kql0L` AND login CSS `index-DS1aCkan`→`index-IXVC2MOA` (the `frontend-config` preload holding; the app side QUIET `C-IrDy5f`/`BGNH4KkS` — the first app-side read stayed on /login on a fill-timing miss, NOT a Turnstile rollout: the DOM census read the standing six-button set, one form, zero Turnstile widgets). The **44TH-LINE** landed at the first round-end read (login JS `tq_Kql0L`→`C-2DbpoC` + CSS `IXVC2MOA`→`COIHZiZl` — the deploy INVALIDATED the warm ref session cookie, the stale-cookie trap now firing on EVERY deploy at this cadence), and the **45TH-LINE** at the second (login JS `C-2DbpoC`→`t01Y3EV6` + CSS `COIHZiZl`→`o5aKXf2B`). **EVERY GENERATION FULLY LADDERED NON-VISUAL** — three complete confirmation-ladder runs, each: the fresh logged-out login pair **BYTE-IDENTICAL** to the standing `69aa4241…` baseline + standing **5/5** + sweep **12/12** + verify-r49 **13/13** + verify-r45 **13/13**.

**THE CSS-DELTA CLASSIFICATION (the round's forensic work — three generations fetched live from `/static/`, the old hashed assets remaining served):** `DS1aCkan` 902076 → `wkqf_TRn` 902111 (+35 B: 0 removed / 1 added — the dead `.\!inline`) → `IXVC2MOA` 903315 (**THE PLATFORM DESIGN-SYSTEM LIBRARY UPDATE**: 4 dead utilities removed — including the 39th deploy's OWN 11rem grid utility, swept by the platform itself — + 11 utilities added + **6 new dark-theme design tokens** — `--fs-card-title:18px` + the five sky-badge semantic tokens: a sky-badge component family and card-title typography being staged in the platform stylesheet) → `COIHZiZl` 903044 (−271 B: **3 dead utilities removed** — `bg-[#fff0d1]`, `text-muted-foreground/50`, `focus-visible:text-neutral-600`) → `o5aKXf2B` 902852 (−192 B: **2 dead utilities removed** — `border-[#ddd8d2]`, `bg-[#f1eeea]` — the sweep continuing). A precise full-name usage sweep found **ZERO references** to any moved utility in the current entry JS or the served login HTML, on every generation. The entry JS sizes: 97481 → 97481 → 97477 → 97477 bytes — the chunk-graph-rebuild signature throughout.

**THE FRESH-EYES INSTRUMENT — THE FULL-ROUTE CONSOLE CENSUS (`scripts/r78-console-census.mjs`): the program's FIRST RUNTIME-CLEANLINESS PROOF.** Byte-parity PNGs prove the pixels match but cannot prove zero runtime errors — a route can render pixel-identical while throwing console errors. The census walks the ENTIRE 61-route registry (imported from the codebase's own `src/lib/sitemap-routes.ts` APP_ROUTES) on the LOC standalone (:3200, seeded DB, a dedicated authed session): per route — console clear → open → settle → read the error/warning/http-fail counts via the browser's own console capture. **VERDICT: 61/61 routes console-CLEAN** (zero errors, zero warnings, zero HTTP failures) — a NEW evidence angle, zero defects.

**THE STANDING CHECKS at HEAD `d6bdf3c`:** the patch watch QUIET (next 16.4.2 the latest stable; the 16.5 line still at canary) · `bun audit` UNCHANGED (the two upstream-blocked dev-chain advisories) · the TW-v4 scan clean (15 `!important` all globals.css; oklch 6/6 comments-only) · secrets zero · the raw DOM-XSS sink census ZERO-UNSAFE (the 9 pattern matches classified) · DB pristine after the sweep (the verify-r45 signup-flow probe user swept per the r61 protocol AFTER the last ladder run; users = [sepnetflix2023@outlook.com] at close).

**THE BYTE-STABILITY PROOFS (`scripts/r78-screenshots.mjs`, numbers 599-615, with the two standing pairs RE-CAPTURED on the 44th-line generation via `scripts/r78-final-pairs.mjs`):** the 615 mobile drawer pair BYTE-MATCHES the r77 597 pair on BOTH sides (loc `e3df921…`, ref `bfaa0da5…` — the FOURTEEN-round chain 615≡597≡579≡561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366) and the 599 login pair BYTE-MATCHES the r77 581 pair on BOTH sides (`bd718ed0…` / `69aa4241…`) — past the whole observed deploy line — and all seven standing route pairs (601-613) BYTE-STABLE vs the r77 set on both sides. **THE MOBILE-MENU FUNCTIONAL CYCLE GREEN** (the standing user emphasis): toggle → the drawer (Dashboard / Training LMS / Assets / Staff Requests) → the Training LMS link CLICKED:/training → the URL lands on /training → the drawer auto-closes (`open: false`) — no TW-v4 regression.

**THE ROUND'S RECONSTRUCTION NOTE:** the pre-crash attempt at this round (a sandbox outage + a full workspace reset) had laddered two generations (the 41st + the 42nd) before its uncommitted work was lost; this session rebuilt the environment from a fresh clone and re-derived every result from scratch — the generations it observed superseded the lost ones, and the round carries the full evidence chain on its own reads.

**ZERO DEFECTS FOUND — ZERO SOURCE CHANGES** (the fifth consecutive audit-only round). The round's diff: the seven instruments (`scripts/r78-deploy-watch.mjs` + `r78-login-probe.mjs` + `r78-css-delta.mjs` + `r78-css-diff.mjs` + `r78-console-census.mjs` + `r78-screenshots.mjs` + `r78-final-pairs.mjs`), the evidence (18 screenshots, 599-615 → 802 tracked), and the docs layer. The plan: `docs/remediation-plan-session78.md`; the narrative: `docs/session_173.md`.

**THE INSTRUMENT TRAPS RETIRED (all infrastructure, classified before touching source):** (1) the WORKSPACE RESET (the sandbox outage took everything — the round rebuilt from a fresh clone and re-derived every result); (2) the SUPERVISOR PROCESS-TREE KILL (a background-spawned E2E run died at the tool-call boundary — the r74 lesson re-proven: long test runs go FOREGROUND + logfile); (3) the agent-browser daemon overload TWICE (the WorkerThreadsTaskRunner crash + a transient `Cannot fork` resource exhaustion — `close --all` + pkill -9 + respawn + re-auth each time); (4) the stale REF session cookie after EVERY deploy at this cadence (twice — the 0/5 + 0/12 + 1/13 signature; re-auth + re-run green each time); (5) the chromium-cache trap PRE-RETIRED (r1248 installed in the background before the E2E gate); (6) the CSS-asset path lesson (the login stylesheet lives under `/static/`, and the OLD HASHED GENERATIONS REMAIN SERVED — which is what makes generation-over-generation CSS forensics possible without a live archive).

Gates: lint 0/0 · tsc ✓ · **941/941 unit** · build ✓ · **E2E 396/396 (6.5m, zero flakes — the sequential proof)** · byte-stability 615≡597 (the fourteen-round chain, both sides) + 599≡581 (the login pair, both sides) + the route pairs stable · **802 tracked screenshots (+18, the 599-615 set)** · DB pristine.

## Session 79 (parity round 78) — the triple-generation round: the 46th + the 47th + the 48th login deploys each fully laddered non-visual (the fifth + sixth CSS movements classified as design-system staging) + the FIRST ACCESSIBILITY CENSUS (every finding REF-authored parity) + the FIFTEEN-round byte chain

**THE ROUND'S WINDOW READ THE LOGIN SIDE AT THREE MORE GENERATIONS AND MOVED THE LOGIN CSS TWICE MORE.** The r79 watch (armed at the post-45th finals) read the **46TH-LINE LOGIN DEPLOY** at the opening — login JS `index-t01Y3EV6`→`index-Cyrjqt_z` AND login CSS `index-o5aKXf2B`→`index-C36NwD0S` (the FIFTH login-CSS movement of the cadence era; the `frontend-config` preload holding; the app side QUIET `C-IrDy5f`/`BGNH4KkS`; the login DOM census unchanged: the six-button set, one form, zero Turnstile widgets). The **47TH-LINE** landed at the first round-end read (login JS `Cyrjqt_z`→`gpurZBVX`, CSS QUIET — a JS-only chunk-graph rebuild), and the **48TH-LINE** at the closing read (login JS `gpurZBVX`→`DhIwzCCd` AND CSS `C36NwD0S`→`DbFNLHjM` — the SIXTH movement). **EVERY GENERATION FULLY LADDERED NON-VISUAL** — three complete confirmation-ladder runs, each: the fresh logged-out login pair **BYTE-IDENTICAL** to the standing `69aa4241…` baseline + standing **5/5** + sweep **12/12** + verify-r49 **13/13** + verify-r45 **13/13**.

**THE CSS-DELTA CLASSIFICATION (two movements fetched live from `/static/`, the old hashed generations remaining served):** `o5aKXf2B` 902852 → `C36NwD0S` 903178 (+326 B: **0 removed / 2 added** — `.bg-[#f1f3f4]` + `.shadow-[0_1px_3px_rgba(15,23,42,0.12)]`, both DEAD: a precise full-name usage sweep found ZERO references in the current entry JS or the served login HTML) → `DbFNLHjM` 903211 (+33 B: **0 removed / 1 added** — `.min-w-[560px]`, ZERO usages). The classification: **DESIGN-SYSTEM STAGING** — utilities staged ahead of use, the r78 sky-badge pattern continuing; the entry JS sizes 97477 → 97382 → 97382 bytes (the near-same-size chunk-graph-rebuild signature).

**THE FRESH-EYES INSTRUMENT — THE FIRST ACCESSIBILITY CENSUS (`scripts/r79-a11y-census.mjs` + `r79-a11y-detail.mjs`): the program's first a11y evidence angle.** The program had proven pixels, runtime cleanliness, transfer weight and installability — never the WCAG 2.2 AA claim. The census walks the ENTIRE 61-route registry reading DOM-declarative signals per route (html lang, title, viewport meta, img alts, form-control accessible names, button/link names, iframe titles, positive tabindex, skipped heading levels). Raw findings: 20 routes with an h1→h3 heading skip, 8 unnamed buttons, 1 placeholder-only WEAK note — and the detail read classifies **EVERY finding REF-authored parity**: the REF renders the IDENTICAL `H2:EonHR → H1:<title> → H3:<sections>` structure on every flagged route and carries the SAME-OR-MORE nameless buttons (its unnamed `role=checkbox` family, the unnamed combobox trigger, its `inline-flex` icon buttons — on /payroll and /taskmanager the REF reads 2 unnamed where the LOC reads ZERO), while the LOC keeps its documented aria-label supersets. **ZERO clone-authored a11y defects.**

**THE FINGERPRINT-REGEX BLIND SPOT (the round's instrument finding):** the deploy watch's `{6,}` fingerprint regex never surfaced the FIVE-character `badge.js` nor the platform runtime scripts (the google gsi client, `cdn.tailwindcss.com`) — the raw script-src census now documents the login page's full 5-src set, and `/static/js/badge.js` (21914 bytes) renders the `base44-edit-badge` (a 197×39 "Edit with" chip at the bottom-right) — the session-2 documented deliberate deviation (the builder badge is not cloned), present in the REF baseline PNGs all along.

**THE STANDING CHECKS at HEAD `0072fa9`:** the patch watch QUIET (next 16.4.2 the latest stable; the 16.5 line at `16.5.0-canary.23`) · `bun audit` UNCHANGED (the two upstream-blocked dev-chain advisories) · the TW-v4 scan clean (15 `!important` all globals.css; oklch 6/6 comments-only) · secrets zero · the raw DOM-XSS sink census ZERO-UNSAFE (the 9 pattern matches classified: 2 comments + 3 JSON-LD `JSON.stringify` blocks + 3 constant-authored nonced boot scripts + 1 constant style block) · DB pristine after the sweep (the verify-r45 signup-flow probe user swept per the r61 protocol AFTER the last ladder run; users = [sepnetflix2023@outlook.com] at close).

**THE BYTE-STABILITY PROOFS (`scripts/r79-screenshots.mjs`, numbers 616-632, the two standing pairs RE-CAPTURED on BOTH the 47th and 48th generations via `scripts/r79-final-pairs.mjs`):** the 632 mobile drawer pair BYTE-MATCHES the r78 615 pair on BOTH sides (loc `e3df921…`, ref `bfaa0da5…` — the FIFTEEN-round chain 632≡615≡597≡579≡561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366) and the 616 login pair BYTE-MATCHES the r78 599 pair on BOTH sides (`bd718ed0…` / `69aa4241…`) — past the whole observed deploy line — and all seven standing route pairs (618-630) BYTE-STABLE vs the r78 set on both sides. **THE MOBILE-MENU FUNCTIONAL CYCLE GREEN** (the standing user emphasis): toggle → the drawer (Dashboard / Training LMS / Assets / Staff Requests) → the Training LMS link CLICKED:/training → the URL lands on /training → the drawer auto-closes (`open: false`) — no TW-v4 regression.

**ZERO DEFECTS FOUND — ZERO SOURCE CHANGES** (the sixth consecutive audit-only round). The round's diff: the seven instruments (`scripts/r79-deploy-watch.mjs` + `r79-login-probe.mjs` + `r79-css-delta.mjs` + `r79-a11y-census.mjs` + `r79-a11y-detail.mjs` + `r79-screenshots.mjs` + `r79-final-pairs.mjs`), the evidence (18 screenshots, 616-632 → 820 tracked), and the docs layer. The plan: `docs/remediation-plan-session79.md`; the narrative: `docs/session_176.md`.

**THE INSTRUMENT TRAPS RETIRED (all infrastructure, classified before touching source):** (1) the `/bin/sh` QUOTING TRAP — the long a11y-census eval payload with embedded quotes truncated at the shell's double-quote processing ("Unexpected end of input"); the fix is the agent-browser `-b` BASE64 eval mode (the documented escaping-safe route, now the long-payload pattern); (2) the exported-`DATABASE_URL` trap ACTIVE (including on `r72-db-sweep.mjs` — the "Unable to open the database file" signature; `env -u` per invocation); (3) the agent-browser daemon overload THREE times (a `Cannot fork` at spawn, a crash, and an eval-degradation mode with stuck sessions mid-sweep — `close --all` + `pkill -9` + respawn + re-auth each time); (4) the chromium-cache trap PRE-RETIRED (r1248 installed foreground before the gate — the background nohup spawn died silently at the tool-call boundary); (5) the fingerprint-regex blind spot DOCUMENTED (the 5-char `badge.js` + the platform runtime scripts invisible to every r74-r79 watch read — the raw script-src census now on the record).

Gates: lint 0/0 · tsc ✓ · **941/941 unit** · build ✓ · **E2E 396/396 (6.4m, zero flakes — the sequential proof)** · byte-stability 632≡615 (the fifteen-round chain, both sides, re-proven on the 47th AND 48th generations) + 616≡599 (the login pair, both sides) + the route pairs stable · **820 tracked screenshots (+18, the 616-632 set)** · DB pristine.

## Session 80 (parity round 79) — the quadruple-generation cadence round: the 49th + 50th + 51st login deploys each fully laddered non-visual + the 52nd step-1-proven at the close (the seventh CSS movement classified as staging, the eighth as a dead-code sweep) + the FIRST MOBILE VIEWPORT MATRIX (zero clone-authored mobile-width defects) + the SIXTEEN-round byte chain

**THE ROUND'S WINDOW READ THE LOGIN SIDE AT FOUR MORE GENERATIONS — AND THE CADENCE COMPRESSED BELOW THE LADDER-CYCLE TIME.** The r80 watch (armed at the post-48th finals) read the **49TH-LINE LOGIN DEPLOY** at the opening — login JS `index-DhIwzCCd`→`index-BSFaMTna` AND login CSS `index-DbFNLHjM`→`index-8FhcPnw7` (the SEVENTH login-CSS movement of the cadence era; the app side QUIET `C-IrDy5f`/`BGNH4KkS`; the login DOM census unchanged). The **50TH-LINE** landed at the round-end read (login JS `BSFaMTna`→`DcJH718L`, CSS QUIET — a JS-only chunk-graph rebuild), the **51ST-LINE** at the closing read (`DcJH718L`→`171Edxk3`, CSS QUIET), and the **52ND-LINE DURING the closing pair-capture** (`171Edxk3`→`index-By5t4Bdg` AND CSS `8FhcPnw7`→`index-dbXqk6oa` — the EIGHTH movement). **EVERY GENERATION FULLY LADDERED NON-VISUAL** (three complete confirmation-ladder runs, each: the fresh login pair **BYTE-IDENTICAL** to the standing `69aa4241…` baseline + standing **5/5** + sweep **12/12** + verify-r49 **13/13** + verify-r45 **13/13**); the 52nd carries its critical first-rung evidence at the close (the fresh login pair byte-identical + the CSS delta classified) with the full standing ladder as r81's opening read — the app side QUIET through every generation (the standing results carry across login-side-only deploys).

**THE CSS-DELTA CLASSIFICATION (the seventh + eighth movements, both fetched live from `/static/`):** the seventh `DbFNLHjM` 903211 → `8FhcPnw7` 904194 (+983 B: **1 removed / 9 added** — the `.sm:right-3` swept; the `.me-1`, `.max-w-[1312px]`, `.align-[-0.125em]`, `.mix-blend-color`, the two `.transition-[…]` customs, `.supports-[align-items:safe_flex-end]`, `.dark:bg-red-600`, `.motion-reduce:[*]:!translate-x-0` staged — **DESIGN-SYSTEM STAGING**, zero usages on the precise full-name sweep); the eighth `8FhcPnw7` 904194 → `dbXqk6oa` 903630 (−564 B: **16 removed / 0 added** — a pure DEAD-CODE SWEEP of the platform's own accumulated staged utilities: the `bottom-[…px]`/`left-[158px]` coordinates, the `w-[221px]/[263px]`+`h-[164px]` dims, the peer-has textarea rule, the `md:/lg:` padding family — ZERO usages). The entry JS sizes 97382 → 97447 → 97447 → 97450 bytes (the chunk-graph-rebuild signature; the js `.length`≠bytes subtlety documented — 4 multi-byte chars make 97443 code-units read under the 97447-byte truth).

**THE FRESH-EYES INSTRUMENT — THE FIRST MOBILE VIEWPORT MATRIX (`scripts/r80-viewport-recon` + `-classify` + `-matrix` + `-detail` + `-careers-detail`): the program's first mobile-width parity proof.** The byte chain and the standing audits had proven 1440x900 everywhere and 390x844 on the nav surfaces only — the CONTENT routes' mobile rendering was never measured (the exact surface where a TW-v4 responsive bug would bite). The matrix walks the 12-route sweep set on BOTH sides at 390x844 reading shell+geometry signals (the header class + height, the main rect, sidebar visibility, **HORIZONTAL OVERFLOW**, the badge, the toggle naming) compared member-wise under the two documented translations (the badge = the session-2 REF-only deviation; the toggle name = the session-46 aria-label superset). RAW: 6/12 MATCH, 6 FINDs — every one classified: FIVE routes overflow on BOTH sides with the same shell authors (REF-authored, three byte-identical widths: 550/550, 600/600, 1003/1003); **/careers DIVERGES (ref 602 overflow vs loc 390 fits) — DATA-AUTHORED, PROVEN LIVE: seeding the REF's widest `whitespace-nowrap` company chip ("TALENT SEEKER HUMAN RESOURCES AND MANAGEMENT CONSULTANCY LLC", 570px) into the LOC DB reproduced the REF's EXACT overflow signature (chip 570 / board 602 / scrollW 602 / overflow true), the probe swept after.** VERDICT: the 390x844 surface is parity-locked across the sweep set — ZERO clone-authored mobile-width defects, no TW-v4 responsive bug; the LOC's dual-shell superset (the desktop shell collapsed at mobile + the mobile shell) renders both breakpoints identically to the REF's single shell.

**THE SCREENSHOT SET + THE SIXTEEN-ROUND BYTE CHAIN (`scripts/r80-screenshots.mjs`, numbers 633-663, the two standing pairs RE-CAPTURED on the 50th AND 51st generations via `scripts/r80-final-pairs.mjs`):** the 649 mobile drawer pair BYTE-MATCHES the r79 632 pair on BOTH sides (loc `e3df921…`, ref `bfaa0da5…` — the SIXTEEN-round chain 649≡632≡615≡597≡579≡561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366) and the 633 login pair BYTE-MATCHES the r79 616 pair on BOTH sides (`bd718ed0…` / `69aa4241…`) and all seven standing route pairs (635-647) BYTE-STABLE vs the r79 set on both sides + **THE FIRST MOBILE-WIDTH BASELINES (651-663)** — the seven standing routes captured per-side at 390x844, the fresh-eyes angle's chained evidence for r81+. **THE MOBILE-MENU FUNCTIONAL CYCLE GREEN** (the standing user emphasis): toggle → the drawer (Dashboard / Training LMS / Assets / Staff Requests) → the Training LMS link CLICKED:/training → the URL lands on /training → the drawer auto-closes (`open: false`) — no TW-v4 regression. 32 PNGs; **the tracked count corrected to the git truth: 814 pre-round → 846** (the r79 record's 820 was a 6-file arithmetic drift).

**THE r72 DB-SWEEP INSTRUMENT FIX (the round's only repo-file change besides the instruments):** the verify-r45 signup flow now seeds a `NotificationPreference` row for the loading-probe user — an FK the sweep's fallback missed (P2003 on the bare re-delete); the fallback now clears every known dependent (employee, notificationPreference, notification, auditLog) before the retry, and the sweep ran clean three times this round.

**THE STANDING CHECKS at HEAD `be5a05c`:** the patch watch QUIET (next 16.4.2 the latest stable; the 16.5 line at `16.5.0-canary.23`) · `bun audit` UNCHANGED (the two upstream-blocked dev-chain advisories) · the TW-v4 scan clean (15 `!important` all globals.css; oklch 6/6 comments-only) · secrets zero · the raw DOM-XSS sink census ZERO-UNSAFE (the 9 pattern matches classified) · DB pristine at close (users = [sepnetflix2023@outlook.com], employees 1, balances 2, jobs 0).

**ZERO DEFECTS FOUND — ZERO SOURCE CHANGES** (the seventh consecutive audit-only round). The round's diff: the ten instruments (`scripts/r80-deploy-watch.mjs` + `r80-login-probe.mjs` + `r80-css-usage-sweep.mjs` + `r80-viewport-recon.mjs` + `r80-viewport-classify.mjs` + `r80-viewport-matrix.mjs` + `r80-viewport-detail.mjs` + `r80-careers-detail.mjs` + `r80-screenshots.mjs` + `r80-final-pairs.mjs`) + the r72-sweep fix + the evidence (32 screenshots, 633-663) + the docs layer. The plan: `docs/remediation-plan-session80.md`; the narrative: `docs/session_179.md`.

**THE INSTRUMENT TRAPS RETIRED (all infrastructure, classified before touching source):** (1) the agent-browser daemon's **dead-session degradation** (a NEW overload signature: the loc session silently dies to about:blank with failing evals rather than the r79 stuck-evals mode; TWICE this round; the reset protocol — `close --all` + `pkill -9` + respawn + re-auth — restored it each time at the FIRST degradation read); (2) the exported-`DATABASE_URL` trap ACTIVE on the third consecutive sandbox (the `env -u` guard on every invocation); (3) the chromium-cache trap PRE-RETIRED (r1248 installed FOREGROUND — the fresh sandbox carried only the stale r1200); (4) the /bin/sh quoting trap applied pre-emptively (every long-payload instrument built on the base64 eval mode from the start; the one shell-quoted attempt failed with the exact predicted signature); (5) the js `.length`≠bytes subtlety documented (size claims pin via stat, not string length — the UTF-16 code-unit count reads 4 under the byte truth on the current entry).

Gates: lint 0/0 · tsc ✓ · **941/941 unit** · build ✓ · **E2E 396/396 (6.6m, zero flakes — the sequential proof)** · byte-stability 649≡632 (the sixteen-round chain, both sides, re-proven on the 50th AND 51st generations) + 633≡616 (the login pair, both sides) + the route pairs stable · **846 tracked screenshots (+32, the 633-663 set including the first mobile-width baselines)** · DB pristine.

## Session 81 (parity round 80) — the tablet-band remediation round: the 52nd fully laddered at the opening + the 53rd fully laddered + the 54th step-1-proven at the close (the ninth CSS movement a pure dead-code sweep) + THE TABLET (md-boundary) VIEWPORT MATRIX + THE lg-BAND GRID CENSUS finding THREE clone-authored defects, ALL TDD-FIXED (the first source changes in eight rounds) + the SEVENTEEN-round byte chain

**THE OPENING READ: BOTH SIDES QUIET + THE 52ND'S FULL LADDER.** The r81 watch (armed at the post-52nd finals) read the login side QUIET (`index-By5t4Bdg`/`index-dbXqk6oa`) and the app side QUIET (`C-IrDy5f`/`BGNH4KkS`); the login DOM census unchanged (the six-button set, one form, zero Turnstile, zero iframes). Per the standing carry-forward, the 52nd generation — step-1-proven at the r80 close — received its FULL standing ladder as this session's opening read: the fresh logged-out login pair **BYTE-IDENTICAL** to the standing `69aa4241…` baseline (`scripts/r81-login-probe.mjs`) + standing **5/5** + sweep **12/12** + verify-r49 **13/13** + verify-r45 **13/13** → **NON-VISUAL.**

**THE FRESH-EYES INSTRUMENT — THE TABLET (md-BOUNDARY) VIEWPORT MATRIX + THE lg-BAND GRID CENSUS (`scripts/r81-tablet-recon.mjs` + `r81-tablet-matrix.mjs` + `r81-tablet-detail.mjs`): three clone-authored defects found in the never-measured responsive band, all TDD-fixed.** The program's responsive parity proof had covered 1440x900 (the standing chain) and 390x844 (the r80 mobile matrix + the 651-663 baselines); the session-7 R6-A sweep verified the NAV SHELL boundary only — the CONTENT routes at the md boundary (768x1024) and the whole 1024-1279 lg band were NEVER audited (the tablet middle: the last unmeasured band, a classic TW-v4 off-by-one surface). The recon proved the shell boundary parity-locked (the mobile header unmounts with identical classes, the desktop sidebar mounts with main x=256 w=512 IDENTICAL, the 767 edge keeps the mobile chrome live on both sides); the matrix read RAW 2/12 MATCH / 10 FINDs at 768; the detail reads (the overflow-author census, the grid-to-body chain diff, the transient min-content clamp, the fonts census — the fonts IDENTICAL) classified every FIND and surfaced THREE defects: **R81-A /attendance's stats grid carried `xl:grid-cols-5` where the REF rides `lg:grid-cols-5`** (live-measured at 1024: the REF FIVE computed columns, the LOC THREE, across the whole 1024-1279 band — invisible to the 390/1440 audits: grid-cols-2 at 390, 5 columns at 1440 on both); **R81-B /payroll's PageHeader row omitted `rowBreakpoint="md"`** (the sm default's members vs the REF's md family — visually inert: display:none below md on both sides, row at md+, the raised offset rowY=64 identical, the 1440 geometry byte-identical — the DOM member contract aligned); **R81-C THE ACTIONS-CLUSTER WRAP CLASS** (the r81 cluster census — 34 pages read on BOTH sides @1024 — measured the REF PER-PAGE INCONSISTENT: payrollmodule + attendancedashboard wrap (the clone default matches), staffrequests rides `flex gap-2` (actionsBare ✓), recruitment/expenses/leavemanagement/recruitmentkanban render single actions directly (actionsUnwrapped ✓), the alwaysRow 13 all match, and FIVE pages — payroll, taskmanager, documenttracker, attendance, assetmanagement — ride the BARE UNWRAPPED `flex gap-3`; the clone's flex-wrap default (the session-16 anti-overflow choice) on those five COLLAPSED their header rows at tablet where the REF's rows keep their natural min-content and the page overflows — the REF-authored-overflow parity class). The mechanism hunt pinned it: the chains are structurally IDENTICAL; Tailwind's grid-cols-4 = `repeat(4, minmax(0, 1fr))` has NO min-content floor (the transient width clamp collapses the tracks to 0); the growth author is the header ROW (the REF's unwrapped 339px cluster + hero-min ≈ 540px row-min → main 605 → scrollW 861 at 768). **THE FIX'S LIVE EFFECT AT EVERY BAND:** at 768 the payroll/taskmanager/documenttracker overflows went **BYTE-IDENTICAL** (861/861, 847/847, 901/901 — was 861/768, 847/768, 901/768; attendance converged 791→1231 toward the REF's 1558, the remainder the records data); at 390 the attendance overflow went **BYTE-IDENTICAL** (943/943 — was 943/503, CORRECTING the r80 misclassification: that delta was the cluster mechanism, not data); at 1440 the attendance cluster's wrap WAS ENGAGED pre-fix (the 7-button cluster 1190px > the 1120px wrap — the pre-fix LOC rendered it 2-line where the REF renders ONE line 911px h=36, a standing-width divergence invisible to every prior audit: the PNG chains are per-side and no member audit read the cluster's line count) — post-fix the LOC renders it IDENTICAL; the lg-band census went from 2 FINDs to **12/12 MATCH.**

**THE TDD PROOFS — `tests/e2e/session81-lg-band.spec.ts` (7 tests, RED → GREEN):** R81-A the attendance grid FIVE columns at 1024 + the `lg:grid-cols-5` member + the boundary (3 at 768, 5 at 1440); R81-B the payroll row's md-family members + the below-md hidden boundary; R81-C the five bare-cluster pages render `flex gap-3` + the payroll @768 overflow parity (scrollW > innerW) + the wrap-variant regression guard (payrollmodule + attendancedashboard KEEP flex-wrap). All RED pre-fix on the exact defect assertions; all GREEN post-fix; the full suite **403/403** (the 396 standing + the 7 new, zero regressions, zero flakes, 6.6m).

**THE NEW INSTRUMENT TRAP — THE r45 PROBE-USER COOKIE CONTAMINATION:** the verify-r45 signup flow (ladder step 5) leaves the `loc` browser session authed as `loading-probe@example.com`; every subsequent loc-side read runs as the wrong identity (the /profile read renders the probe user's data). The tablet matrix's first /profile read was contaminated (a raw 581-vs-571 mainRect delta that VANISHED on the clean re-auth — the clean read is byte-identical 571/571 + 827/827 both-sides overflow); the r80 mobile matrix's /profile read was ALSO probe-authored (its conclusion held, on the wrong-user evidence — re-classified on the clean read). The protocol: **re-auth the loc session as the seeded user after every r45 ladder run, before any subsequent loc-side read.**

**THE BYTE CHAINS (`scripts/r81-screenshots.mjs`, numbers 665-709, 46 PNGs → 898 tracked (the 852 pre-round git truth — the r80 record's 846 was another 6-file arithmetic drift, corrected here)):** the login pair 665 ≡ the r80 633 pair on BOTH sides (`bd718ed0…` / `69aa4241…`) + the mobile drawer pair 681 ≡ the r80 649 pair on BOTH sides (loc `e3df921…`, ref `bfaa0da5…` — the SEVENTEEN-round chain 681≡649≡632≡615≡597≡579≡561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366) — both standing pairs RE-CAPTURED on the closing 54th generation (`scripts/r81-final-pairs.mjs`) so the chain claims are made on the generation the round closes on. The seven 1440 route pairs (667-679): 6/7 BYTE-STABLE both sides with **673-attendance-light-loc DRIFTING BY DESIGN** (the R81-C unwrap re-authors the attendance cluster at 1440; the ref side STABLE — the drift IS the remediation's 1440-band proof). The mobile re-baselines (683-695): 6/7 BYTE-STABLE with **689-attendance-390-loc DRIFTING BY DESIGN** (the unwrap re-authors the attendance mobile overflow toward the REF's own 943 signature). **THE FIRST TABLET-WIDTH (768x1024) PER-SIDE BASELINES (697-709)** — the seven standing routes at the md boundary, the chained evidence byte-compared from r82 onward. **THE MOBILE-MENU FUNCTIONAL CYCLE GREEN** (toggle → the drawer with Dashboard/Training LMS/Assets/Staff Requests → the Training LMS link CLICKED:/training → the URL lands on /training → the drawer auto-closes `open: false` — the standing user emphasis, no TW-v4 regression).

**THE ROUND-END DEPLOY READS: THE 53RD FULLY LADDERED + THE 54TH STEP-1-PROVEN.** The round-end watch read the **53RD-LINE LOGIN DEPLOY** (login JS `By5t4Bdg`→`CYumVlcN` AND CSS `dbXqk6oa`→`-4Ltml9o` — the NINTH login-CSS movement; the app side QUIET); the FULL LADDER GREEN on the 53rd (the fresh login pair BYTE-IDENTICAL + standing 5/5 + sweep 12/12 + verify-r49 13/13 + verify-r45 13/13 → NON-VISUAL, after the daemon's spawn-err degradation — the reset protocol at the first degradation read). The ninth movement's forensics: `dbXqk6oa` 903630 → `-4Ltml9o` 903434 (**−196 B: 5 removed / 0 added** — the `.pb-72`, `.sm:w-[320px]`, `.sm:py-5`, `.sm:pb-48`, `.lg:px-[72px]` rules swept); the PRECISE full-name usage sweep against the real 53rd entry (`index-CYumVlcN.js`, 97493 bytes via stat): **ZERO usages — a pure DEAD-CODE SWEEP** (the second consecutive). **THE 54TH-LINE landed during the forensics** (login JS `CYumVlcN`→`index-Bl8PUA_n`, CSS QUIET; the entry 97493 bytes — the same size, the chunk-graph-rebuild signature): step-1-proven at the close (the fresh login pair BYTE-IDENTICAL); the full standing ladder on the 54th-or-newer = r82's opening read (the app side QUIET through every generation).

**THE STANDING CHECKS at the round's close:** the patch watch QUIET (16.4.2 the latest stable; the 16.5 line at 16.5.0-canary.23) · `bun audit` UNCHANGED (the two upstream-blocked dev-chain advisories) · the TW-v4 scan clean (15 `!important` all globals.css; oklch 6/6 comments-only — re-verified POST-FIX) · secrets zero · the DOM-XSS sink census ZERO-UNSAFE · DB pristine at close (the r72 sweep ran clean after the last ladder/E2E run; users = [sepnetflix2023@outlook.com], employees 1, balances 2, jobs 0).

**THE INSTRUMENT TRAPS RETIRED (all infrastructure, classified before touching source):** (1) **the r45 probe-user cookie contamination** (the NEW trap — the protocol addition above); (2) the agent-browser daemon overload THREE times (the spawn-err degradation, then the r79 stuck-evals mode — the session-list command itself hung at 60s; the reset protocol each time at the FIRST degradation read); (3) the E2E-server resource crash (the "Target crashed"/ERR_ABORTED cascade under the two-standalone + daemon load — the stale :3201 verify server killed + the daemon closed restored it); (4) the exported-`DATABASE_URL` trap ACTIVE (the fourth consecutive sandbox); (5) the chromium-cache trap PRE-RETIRED (r1248 FOREGROUND — the fresh sandbox carried only the stale r1200); (6) **the sweep-usage argv subtlety** (the entry name must be the FULL `index-NAME.js` filename — the bare hash fetches a 22-byte 404 and the sweep reads false-NEGATIVE against an empty string; the ninth movement's classification re-run valid).

**THREE CLONE-AUTHORED DEFECTS FOUND — ALL TDD-FIXED** (the first source changes in eight rounds: the attendance grid member, the payroll row member, the cluster-wrap class across five pages + the PageHeader `actionsNowrap` variant). The round's diff: the three source fixes + the session81-lg-band spec (7 tests) + the seven instruments (`scripts/r81-deploy-watch.mjs` + `r81-login-probe.mjs` + `r81-tablet-recon.mjs` + `r81-tablet-matrix.mjs` + `r81-tablet-detail.mjs` + `r81-screenshots.mjs` + `r81-final-pairs.mjs`) + the evidence (46 screenshots, 665-709) + the docs layer. The plan: `docs/remediation-plan-session81.md`; the narrative: `docs/session_182.md`.

Gates: lint 0/0 · tsc ✓ · **941/941 unit (post-fix)** · build ✓ · **E2E 403/403 (6.6m, zero flakes — the 396 standing + the 7 new)** · byte-stability 681≡649 (the seventeen-round chain, both sides, re-proven on the closing 54th generation) + 665≡633 (the login pair, both sides) + the route pairs stable (6/7, the attendance drift BY DESIGN, the ref side stable) + the mobile re-baselines stable (6/7, the attendance drift BY DESIGN) + the first tablet baselines (697-709) · **898 tracked screenshots (+46 — the 852 pre-round git truth; the r80 record's 846 was a 6-file arithmetic drift, corrected here)** · DB pristine.


## Session 82 (parity round 81) — the breakpoint-boundary remediation round: the 55th login deploy fully laddered at the opening and holding through the whole round + THE BREAKPOINT-BOUNDARY MATRIX (the sm 640 + xl 1280 edges + their 639/1279 off-by-one edges — the last two unmeasured TW-v4 breakpoint surfaces, closing the responsive-band program) finding ONE clone-authored defect, TDD-FIXED (the attendance row-level wrap — the r81 "records data" misclassification corrected) + the EIGHTEEN-round byte chain + the first boundary-width baselines

**THE OPENING READ: THE 55TH-LINE LOGIN DEPLOY DETECTED + FULLY LADDERED NON-VISUAL.** The r82 watch (armed at the post-54th finals) read the login side at a NEW generation — login JS `index-Bl8PUA_n`→`index-BdweUDbT`, login CSS QUIET at `index--4Ltml9o` (a JS-only movement, the chunk-graph-rebuild signature); the app side QUIET (`C-IrDy5f`/`BGNH4KkS`); the login DOM census unchanged (the six-button set, one form, zero Turnstile, zero iframes). The FULL CONFIRMATION LADDER ran on the 55th as this session's opening read (per the r81 carry-forward — the 54th-or-newer): the fresh logged-out login pair **BYTE-IDENTICAL** to the standing `69aa4241…` baseline (`scripts/r82-login-probe.mjs`) + standing **5/5** + sweep **12/12** (the r52 orchestrator, first-try clean) + verify-r49 **13/13** + verify-r45 **13/13** → **NON-VISUAL.** The r81 trap protocol applied at the ladder's close: the loc session re-authed as the seeded user (the verify-r45 signup flow leaves it as the probe user — the contamination trap documented r81).

**THE FRESH-EYES INSTRUMENT — THE BREAKPOINT-BOUNDARY MATRIX (`scripts/r82-boundary-recon.mjs` + `r82-boundary-matrix.mjs` + `r82-boundary-detail.mjs` + `r82-attendance-deep.mjs` + `r82-toolbar-census.mjs` + `r82-hero-cluster.mjs`): ONE clone-authored defect found in the last two unmeasured breakpoint surfaces, TDD-fixed.** The program's responsive parity proof had covered 1440x900 (the standing chain), 390x844 (the r80 mobile matrix), 768x1024 + the 767 edge (the r81 tablet matrix), and the 1024-1279 lg band (the r81 grid census) — but the **sm edge (640 + the 639 off-by-one) and the xl edge (1280 + the 1279 off-by-one) were NEVER audited**: the last two TW-v4 breakpoint boundaries (the exact class where an xl:-vs-lg: member bug bites — the R81-A lesson). The recon walked /dashboard on BOTH sides at 640/639/1280/1279 and proved the shells parity-locked (the mobile chrome live at 640 and 639, unmounted at 1280 and 1279, the main geometry identical, zero overflow on the shell). The matrix walked the 12-route sweep set at 640 AND 1280 (LIGHT, authed sessions) reading shell+geometry+**the computed grid-column census** member-wise: RAW 9/12 MATCH at BOTH widths, with the R81-A fix confirmed at the xl edge (the attendance stats grid renders FIVE columns on both sides at 1280). The three FINDs at each width, classified: **/employees DATA-AUTHORED** (the REF tenant's 0 employees vs the LOC's 1 seeded card grid — the standing seeded-difference class, live-read on the REF: "Manage your 0 employees" with an empty list); **/careers DATA-AUTHORED** (the r80 chip-seed proof class — the REF's 1 job posting vs the LOC's 0-job board); **/attendance — R82-A, THE ROUND'S DEFECT.**

**R82-A — /attendance's PageHeader row carried an extra `md:flex-wrap` member the REF's row lacks — the r81 "records data" misclassification CORRECTED.** The detail reads surfaced the mechanism chain: the REF's /attendance renders the **ACCESS RESTRICTED state for this user** (its /profile reads the role chip "User"; the page shows the stats grid with role-scoped zeros — "0 Total Employees, 0 Present Today, 0 Absent Today, 0 Late Arrivals, 0% Attendance Rate" — plus the "Access Restricted / Only Admin or Security role users can mark attendance" notice; NO records section at all) while the LOC's seeded user is admin (the full Today's Overview + Recent Records superset — the clone's role gate already implemented: the restricted recipe at the `!canMark` branch with the r61/r63-measured icon/color/copy, the API's `requireRole(["admin","hr","security"])`). **The r81 classification correction:** the r81 record attributed the attendance @768 remainder (LOC 1231 vs REF 1558) to "the records data" — the deep read proves the REF renders NO records; the remainder was the ROW-WRAP member. The mechanism (the `r82-hero-cluster.mjs` census, measured live @1280 on both sides): the clusters are IDENTICAL (`flex gap-3`, min-content 911, the same seven buttons) and the heroes are IDENTICAL (min-content 312) — but the REF's row is `flex flex-col md:flex-row justify-between items-start md:items-center gap-4` (min-content **1238** = hero 312 + gap 16 + cluster 911 — no wrap, so the page overflows by design: **scrollW 1558 CONSTANT across 768/1024/1280/1440**), while the LOC's row carried `md:flex-wrap` (a session-10 R9-E anti-overflow choice predating the REF-authored-overflow parity standard established r79/r81; min-content **911** = the widest member — the row wrapped, the page fitted at 1280+). FIXED: the wrap member removed (`src/app/(app)/attendance/page.tsx`) — **the attendance page now renders BYTE-IDENTICAL with the REF at EVERY md+ band: scrollW 1558 + main 256+1302 at 768, 1024, 1280 AND 1440 (was 1280/1024 at 1280), the hero geometry identical to the pixel ({312 wide, rowH 216, titleH 96} both sides), the 390 mobile band UNAFFECTED (943/943 byte-identical, the flex-col row).**

**THE TDD PROOFS — `tests/e2e/session82-boundary.spec.ts` (4 tests, RED → GREEN):** the row's no-wrap md-family contract (no flex-wrap member anywhere); the hero squeeze to the REF's 312px min-content; the page overflow parity at the md+ bands (scrollW 1558, the REF-measured constant); the 390 regression guard (943). All RED pre-fix on the exact defect assertions; all GREEN post-fix; the full suite **407/407** (the 403 standing + the 4 new, zero regressions, zero flakes, 6.6m). The R17-A unit pin (`tests/unit/shell-recipes.test.ts`) UPDATED to guard the new contract — the session-18 pin asserted the OLD wrap member (the fitting-wrap choice); it now asserts its ABSENCE + the `rowBreakpoint="md"` member, with the history documented in-place (the pin's contract changed deliberately with the full measurement evidence; the unit gate 941/941 post-update).

**THE BYTE CHAINS (`scripts/r82-screenshots.mjs`, numbers 711-783, 74 PNGs → 966 tracked):** the login pair 711 ≡ the r81 665 pair on BOTH sides (`bd718ed0…` / `69aa4241…`) + the mobile drawer pair 727 ≡ the r81 681 pair on BOTH sides (loc `e3df921…`, ref `bfaa0da5…` — the **EIGHTEEN-round chain** 727≡681≡649≡632≡615≡597≡579≡561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366) — both standing pairs captured ON the 55th generation (the generation the round closes on: **the 55th HELD through the whole round** — the round-end watch read the same fingerprints as the opening, no 56th deploy, so no re-capture needed). The seven 1440 route pairs (713-725): 6/7 BYTE-STABLE both sides with **719-attendance-light-loc DRIFTING BY DESIGN** (the R82-A fix re-authors the 1440 rendering to the REF's 312px two-line hero + the 1558 overflow; the ref side STABLE — the drift IS the remediation's 1440-band proof). The mobile re-baselines (729-741): **7/7 BYTE-STABLE** both sides (the fix is inert at 390 — the flex-col row; the 943/943 proven live). The tablet re-baselines (743-755): 6/7 BYTE-STABLE with **749-t-attendance-768-loc DRIFTING BY DESIGN** (toward the REF's 1558 — was the r81 wrapped 1231). **THE FIRST BOUNDARY-WIDTH PER-SIDE BASELINES (757-769 the sm edge 640x1024 + 771-783 the xl edge 1280x1024)** — the seven standing routes at both boundaries, the chained evidence byte-compared from r83 onward (the responsive-band program's completion set). **THE MOBILE-MENU FUNCTIONAL CYCLE GREEN** (toggle → the drawer → the Training LMS link CLICKED:/training → the URL lands on /training → the drawer auto-closes — the standing user emphasis, no TW-v4 regression).

**THE STANDING CHECKS at the round's close (re-verified POST-FIX):** the patch watch QUIET (16.4.2 the latest stable; the 16.5 line at 16.5.0-canary.23) · `bun audit` UNCHANGED (the two upstream-blocked dev-chain advisories) · the TW-v4 scan clean (15 `!important` all globals.css; oklch 6/6 comments-only; zero row-level flex-wrap anywhere in the pages) · secrets zero · the DOM-XSS sink census ZERO-UNSAFE (the same classified family) · **DB pristine at close** (the r72 sweep ran clean after the last ladder/E2E run; users = [sepnetflix2023@outlook.com], employees 1, balances 2, jobs 0).

**ONE CLONE-AUTHORED DEFECT FOUND — TDD-FIXED** (the second consecutive remediation round). The round's diff: the single source fix (the attendance row-wrap removal + the updated in-source comment) + the session82-boundary spec (4 tests) + the R17-A unit-pin update + the nine instruments (`scripts/r82-deploy-watch.mjs` + `r82-login-probe.mjs` + `r82-boundary-recon.mjs` + `r82-boundary-matrix.mjs` + `r82-boundary-detail.mjs` + `r82-attendance-deep.mjs` + `r82-toolbar-census.mjs` + `r82-hero-cluster.mjs` + `r82-screenshots.mjs` + the `r82-db-verify.mjs` helper) + the evidence (74 screenshots, 711-783) + the docs layer. The plan: `docs/remediation-plan-session82.md`; the narrative: `docs/session_185.md`.

Gates: lint 0/0 · tsc ✓ · **941/941 unit (post-fix, the R17-A pin updated to the new contract)** · build ✓ · **E2E 407/407 (6.6m, zero flakes — the 403 standing + the 4 new)** · byte-stability 727≡681 (the eighteen-round chain, both sides, on the closing 55th generation) + 711≡665 (the login pair, both sides) + the route pairs stable (6/7, the attendance drift BY DESIGN, the ref side stable) + the mobile re-baselines stable (7/7) + the tablet re-baselines stable (6/7, the attendance drift BY DESIGN) + the first boundary-width baselines (757-783) · **966 tracked screenshots (+74 — the 892 pre-round PNG git truth; the 898 all-files count included the 6 HTML evidence files, the accounting split recorded here)** · DB pristine.


## Session 83 (parity round 82) — the theme-direction audit round: the 55th login deploy holding through a SECOND consecutive single-generation round + THE DARK-MODE + RTL (THEME-DIRECTION) MATRIX (the two toggle states never measured by the program's 966 LIGHT+LTR PNGs) reading ZERO clone-authored defects — the states parity-locked, pinned by the session83-theme spec + the NINETEEN-round byte chain + the first dark/RTL baselines

**THE OPENING READ: BOTH SIDES QUIET — THE 55TH HELD; THE FULL LADDER GREEN NON-VISUAL.** The r83 watch (`scripts/r83-deploy-watch.mjs`, armed at the post-55th finals) read both sides QUIET (login JS `index-BdweUDbT` + CSS `index--4Ltml9o`; the app side `C-IrDy5f`/`BGNH4KkS`; the login DOM census unchanged — the six-button set, one form, zero Turnstile, zero iframes). Per the r82 carry-forward, the full ladder ran as this session's opening read on the 55th: the fresh logged-out login pair **BYTE-IDENTICAL** to the standing `69aa4241…` baseline (`scripts/r83-login-probe.mjs`) + standing **5/5** + sweep **12/12** + verify-r49 **13/13** + verify-r45 **13/13** → **NON-VISUAL.**

**THE OPENING-LADDER TRAPS (all infrastructure, retired before the audit began):** (1) **the ref stale-cookie re-fired** — the r52 orchestrator re-auths only the loc session; the `ref` session's cookie had expired since the r82 round, so the first standing+sweep read returned **0/5 + 0/12 all-DIFF** (every REF route bouncing to `/login?from_url=…`, the login h1 "Welcome to Eon HR" reading as the route h1) — the careful re-auth of BOTH sessions restored standing 5/5 + sweep 12/12, and the protocol gained a clause: **re-auth the ref session before EVERY standing/sweep run**; (2) **verify-r49's missing careful-retry** — a loc0 fill-timing miss read as a systematic 1/13 all-DIFF (every route on /login); the re-run 13/13 green, and the r78 retry pattern was ADDED to `scripts/verify-r49.mjs` in-place; (3) the r45 probe-user DB contamination — swept by the standing r72 instrument; (4) the stale :3201 verify server — killed at the ladder's close (the r81 lesson).

**THE CODE AUDIT (the repo skills' lens — `skills/web-app-foundation` + the catalog): the r82 diff CLEAN.** The r82 round's source diff (the single attendance row-wrap removal + the updated in-source comment + the session82-boundary spec + the R17-A pin update) re-reviewed against the foundation skill's contracts (§18 the TW-v4 trap register — zero row-level flex-wrap; §13 the testing strategy — the regression guards in place): documented, measured, regression-guarded — no findings. The standing checks green: the patch watch QUIET (16.4.2 the latest stable; the 16.5 line at 16.5.0-canary.24) · `bun audit` UNCHANGED · the TW-v4 scan clean (15 `!important` all globals.css; oklch 6/6 comments-only) · secrets zero · the DOM-XSS sink census the same classified ZERO-UNSAFE family.

**THE FRESH-EYES INSTRUMENT — THE DARK-MODE + RTL (THEME-DIRECTION) MATRIX (`scripts/r83-theme-recon.mjs` + `r83-theme-matrix.mjs` + `r83-theme-mobile.mjs`): ZERO clone-authored defects — the states parity-locked.** The motivation: all 966 standing PNGs are LIGHT+LTR; the two toggle states both apps carry (localStorage `darkMode` → `html.dark`; `app_lang=ar` → `dir=rtl`, the عربي button) had NEVER been measured. **The toggle UI recon:** the Moon buttons **GEOMETRY-IDENTICAL** on both sides (@1440: x=60 y=796 36×36, the same Button component classes, the same siblings BUTTON/BUTTON/عربي — the REF's nameless icon-only button found via the `svg.lucide-moon` selector after a text/aria census missed it; the LOC keeps its documented `aria-label` superset "Switch to dark mode") + the عربي pair IDENTICAL (80×32 @ x=104). **The dark matrix** (the 7 standing routes × both sides, darkMode=true + LTR): **6/7 MATCH** on every theme+geometry member (htmlCls=dark, bodyBg rgb(10,10,10), the sidebar foreground, the first-card background, the heading colors, sidebar 0+256, main 256+1184, scrollW) — the one FIND (/attendance headCol) classified by the deep read as **an instrument read-order artifact over the standing role-divergence**: the census read `h2 || h1`, the REF's restricted /attendance renders ZERO h2s (falling through to its hidden "EonHR" h1, pinned slate-900) while the LOC's admin superset renders the theme-aware "Today's Overview" h2 — and the member-level h1 census is **PIXEL-IDENTICAL both sides** (the hidden "EonHR" h1 + the visible "Staff Attendance" h1 {text-slate-900, 48px, x=288 y=84 w=312 h=96} — the REF's own dark mode leaves the pinned slate-900 title un-themed; the clone matches it exactly). **The RTL matrix:** 6/7 MATCH, the same FIND classified identically. **The geometry-invariance proof (the re-paint-not-re-flow contract):** dark ≡ light on every measured route (dashboard {main 256+1184, scrollW 1440}, attendance {256+1302, 1558}, payroll {256+1184, 1440} — identical across the states); RTL mirrors EXACTLY (dashboard mainX 256→0 with the sidebar flipping to 1184+256; attendance mainX → -118 — the mirrored overflow — with the widths and scrollW unchanged). **The mobile drawer in both states (the standing user emphasis):** DARK — the drawer bg **rgb(24,24,27)** (zinc-900) on BOTH sides, dir ltr, w=288, the same link set; RTL — bg rgb(250,250,250), dir rtl, w=288 on BOTH sides; and the functional cycle GREEN in dark (toggle → the drawer → the Training LMS link CLICKED:/training → the URL lands on /training → the auto-close — no TW-v4 regression in either theme state).

**THE CONTRACT PINS — `tests/e2e/session83-theme.spec.ts` (5 tests, all GREEN — the standing-contract green-pin pattern, the behavior live-proven before pinning):** R83-A the dark boot + the re-paint-not-re-flow invariance (html.dark + bodyBg rgb(10,10,10) + mainRect/scrollW identical to the LIGHT read); R83-B the RTL boot + the exact mirror (dir=rtl + mainX 0 / the sidebar 1184+256 with mainW and scrollW held); R83-C the login theme-inertia (the session-40 R39-B contract — html.dark never applies on /login with the key armed); R83-D the toggle pair geometry (Moon x=60 36×36 + عربي x=104 80×32); R83-E the dark mobile drawer (bg rgb(24,24,27) + the Training LMS nav cycle → auto-close). Two first-draft instrument bugs fixed in place (an about:blank localStorage SecurityError — evaluate before the first goto; and the mobile readiness signal — the "Welcome back" h1 is HIDDEN at 390 on BOTH sides, live-verified on the REF, the REF-authored mobile behavior). The full suite: **412/412 (6.7m, zero flakes — the 407 standing + the 5 new).**

**THE BYTE CHAINS (`scripts/r83-screenshots.mjs`, numbers 785-889, 106 PNGs → 1072 tracked):** the login pair 785 ≡ the r82 711 pair on BOTH sides (`bd718ed0…` / `69aa4241…`) + the mobile drawer pair 801 ≡ the r82 727 pair on BOTH sides (loc `e3df921…`, ref `bfaa0da5…` — the **NINETEEN-round chain** 801≡727≡681≡649≡632≡615≡597≡579≡561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366). The 1440 route pairs (787-799): **7/7 BYTE-STABLE both sides** — the first fully-stable @1440 set since the r82 fix landed in the r82 captures. The mobile re-baselines (803-815): 6/7 stable with **805-m-payroll-390-REF DRIFTING — REF DATA-AUTHORED** (the REF tenant's payroll records EMPTIED between rounds: the live "No payroll records" empty state + "0 SAR / 0 Employees / 0 Approved" — the same tenant-emptying class as the r82 "0 employees" note; the desktop pair 789 STABLE because the records section sits below the 1440x900 fold, invisible to the capture; the LOC side 7/7 STABLE; the double-capture determinism check passed — today's REF state stable, the r82 baseline captured the pre-emptying state; the r83 capture `062ad84b…` becomes the chained baseline). The tablet re-baselines (817-829): **7/7 STABLE.** The sm-boundary re-baselines (831-843): **7/7 STABLE — the FIRST byte-compare of the r82 boundary set, holding.** The xl-boundary re-baselines (845-857): **7/7 STABLE.** **THE FIRST DARK-MODE + RTL BASELINES (859-871 dark + 873-885 RTL @1440 + 887 the dark drawer pair + 889 the RTL drawer pair @390)** — the theme-direction program's chained evidence for r84+. The mobile-menu cycle GREEN. **The round's own instrument bug caught in-round:** the r83-screenshots widthRoutePair initially captured the mobile set at 390x1024 (the boundary-pattern height) — the whole set read 7/7 DRIFT on BOTH sides; re-captured at the standing **390x844** (the height is part of the baseline contract; six of seven re-read STABLE immediately, the payroll-ref finding then classified as above).

**THE ROUND-END READS: THE 55TH HELD THROUGH A SECOND CONSECUTIVE ROUND.** The round-end watch read the SAME fingerprints as the opening (login JS `index-BdweUDbT` + CSS `index--4Ltml9o`; the app side `C-IrDy5f`/`BGNH4KkS`) — no 56th deploy; the deploy cadence quiet for two full rounds. **The full standing ladder on the 55th-or-newer = r84's opening read.** The DB swept to pristine (the r72 instrument; users = [sepnetflix2023@outlook.com], employees 1, balances 2, jobs 0).

**ZERO CLONE-AUTHORED DEFECTS — the parity PROOF extended, not the FIX** (the first round to extend the measured-and-pinned contract rather than remediate it: the r81/r82 fixes holding on their own surfaces). The round's diff: the session83-theme spec (5 tests) + the verify-r49 careful-retry hardening + the instruments (`scripts/r83-deploy-watch.mjs` + `r83-login-probe.mjs` + `r83-theme-recon.mjs` + `r83-theme-matrix.mjs` + `r83-theme-mobile.mjs` + `r83-screenshots.mjs`) + the evidence (106 screenshots, 785-889) + the docs layer. The plan: `docs/remediation-plan-session83.md`; the narrative: `docs/session_188.md`.

Gates: lint 0/0 · tsc ✓ · **941/941 unit** · build ✓ · **E2E 412/412 (6.7m, zero flakes — the 407 standing + the 5 new)** · byte-stability 801≡727 (the nineteen-round chain, both sides, on the holding 55th generation) + 785≡711 (the login pair, both sides) + the route pairs 7/7 + the tablet 7/7 + the boundary sets 7/7+7/7 (the first boundary byte-compare) + the mobile 6/7 (the payroll-ref drift REF DATA-AUTHORED) + the first dark/RTL baselines (859-889) · **1072 tracked screenshots (+106)** · DB pristine.


## Session 84 (parity round 83) — the export/print toolbar action round: the 55th login deploy holding through a THIRD consecutive single-generation round + THE EXPORT/PRINT TOOLBAR ACTION MATRIX (the r83 close-out's first suggested frontier — never audited) finding ONE clone-authored defect (R84-A the assetmanagement Export icon's missed `mr-2`, the session-14 R13-A recipe's last call site) TDD-FIXED + R84-B the payrollreports PDF upgraded to the REAL print dialog (the session-29 print superset in one click) + the TWENTY-round byte chain + the FIRST dark/RTL byte-compares (7/7+7/7)

**THE OPENING READ: BOTH SIDES QUIET — THE 55TH HELD THROUGH A THIRD CONSECUTIVE ROUND; THE FULL LADDER GREEN NON-VISUAL.** The r84 watch (`scripts/r84-deploy-watch.mjs`, re-armed at the unchanged post-55th finals) read both sides QUIET (login JS `index-BdweUDbT` + CSS `index--4Ltml9o`; the app side `C-IrDy5f`/`BGNH4KkS`; the login DOM census unchanged — the six-button set, one form, zero Turnstile, zero iframes). Per the r83 carry-forward, the full ladder ran as this session's opening read on the 55th: the fresh logged-out login pair **BYTE-IDENTICAL** to the standing `69aa4241…` baseline (`scripts/r84-login-probe.mjs`) + standing **5/5** + sweep **12/12** + verify-r49 **13/13** (the r83 careful-retry working — first try) + verify-r45 **13/13** → **NON-VISUAL.** The r83 ref-re-auth protocol applied BEFORE the standing/sweep run (no stale-cookie trap this round); the close-out traps retired (the loc session re-authed as the seeded user + the stale `:3201` killed + the r45 probe user swept by the r72 instrument under `env -u`).

**THE SESSION'S ENVIRONMENT NOTE.** The workspace was RESET (the sixth reset of the record): fresh clone @ `e75dc3f`; the environment rebuilt from zero (.env + bun install 525 + db:generate/push/seed, DB pristine verified). **The exported-`DATABASE_URL` trap ACTIVE for the SEVENTH consecutive sandbox** (`file:/home/z/my-project/db/custom.db` — the `env -u` guard per invocation throughout).

**THE CODE AUDIT (the repo skills' lens — `skills/web-app-foundation` + the catalog): the r83 diff CLEAN.** The session83-theme spec (computed-style assertions per §18 T8, behavior tests per §13.5, the localStorage state cleaned at every close) + the verify-r49 careful-retry (idempotent, the lesson citation in-place): no findings. The standing checks on the rebuilt environment: lint 0/0 · tsc clean · 941/941 unit · build OK · the standalone healthy · the patch watch QUIET (16.4.2; the 16.5 line at canary.24) · `bun audit` UNCHANGED · the TW-v4 scan clean (15 `!important` all globals.css; oklch 6/6 comments-only; zero row-level `md:flex-wrap`) · secrets zero.

**THE FRESH-EYES INSTRUMENT — THE EXPORT/PRINT TOOLBAR ACTION MATRIX (`scripts/r84-export-recon.mjs` + the live functional probes).** The second r83-candidate (the form-validation error states) was checked and closed first: the login empty-submit recon read BOTH sides on the browser-native HTML5 validation (`checkValidity()` false + "Please fill out this field.", `form.noValidate: false`, zero custom error UI) — parity, nothing to remediate. The export recon (the full 59-route walk, both sides): the cluster lives on exactly FIVE routes both sides — /attendance {Print, PDF, Excel} · /assetmanagement {Export} · /attendancedashboard {Export Report, Export} · /payrollreports {CSV, PDF} · /surveyanalytics {Export} — **59/59 label-set MATCH, zero DIVERGE.** The functional probes (the surface never measured): the REF's cluster is **1-real + 1-stub + 7-dead** (/attendance Print → `window.print()` the one REAL action; /payrollreports PDF → `window.open("")` a BLANK-WINDOW stub; the other seven read NOTHING on click — no print/open/toast/download, not disabled); the LOC ships REAL functional exports on every route (the CSV downloads on assetmanagement/attendancedashboard/payrollreports/surveyanalytics + the print dialog on attendance Print) — **the standing superset doctrine verified end to end for the first time.**

**R84-A — THE ASSETMANAGEMENT EXPORT ICON'S MISSED `mr-2` (the session-14 R13-A systemic pattern's missed call site).** The width census found ONE divergent member: the Export button REF 112×36 vs LOC 104×36. The deep read: the REF's icon carries `lucide-download w-4 h-4 mr-2` — the `mr-2` ON TOP of the Button's `gap-2` (the R13-A recipe, the 16px effective icon-text gap) — while the LOC's icon rode bare (sized 16px by the Button's `[&_svg]:size-4`), leaving the `gap-2` alone (8px). The defect ISOLATED: the same page's Add Asset carries `mr-2` (134×134 both sides), the selects match (176/160), and every other cluster member route-matched (93×32, 78×32, 77×32, 97×32). **FIXED (TDD): `<Download className="mr-2" aria-hidden="true" />` — the post-fix live read 112×36 + the icon's mr-2, byte-parity with the REF.**

**R84-B — THE PAYROLLREPORTS PDF UPGRADED TO THE REAL PRINT DIALOG.** The REF's button opens a BLANK window (a broken stub); the LOC's old behavior toasted an advisory "use your browser's print dialog". The session-29 R28-B/R29-C print superset already ships the print CSS (`@media print`: the chrome hidden, the dialogs suppressed, the tab-bar reset, `print-color-adjust: exact`, the `@page` margins) — **the button now calls `window.print()` directly** (one click → the print dialog → "Save as PDF" produces the print-optimized document), superseding both the REF's broken stub and the clone's inert toast. **FIXED (TDD): the post-fix live read `window.print` called once, zero toasts.**

**THE CONTRACT PINS — `tests/e2e/session84-export.spec.ts` (5 tests, all GREEN — the standing-contract green-pin pattern):** R84-A the Export geometry (112×36 + the icon's `mr-2`) · R84-B the PDF's real print dialog (`window.print` on click, stubbed in the harness) · R84-C the cluster membership contract (the FIVE routes' label sets + the sampled non-cluster routes' emptiness — the readiness signal is `main`, NOT the Toggle Sidebar button: /dashboard's employee-portal shell carries no such button, the instrument bug caught in the RED phase) · R84-D the attendance Print parity · R84-E the toast-superset (the distinct PDF/Excel toast descriptions). **RED pre-fix exactly as designed** (R84-A 112≠104 + R84-B no print call; C/D/E green), **GREEN post-fix 5/5.** Two instrument traps retired in-round: the fresh-sandbox chromium (r1248 installed FOREGROUND — the standing lesson) and the **ERR_ABORTED resource cascade** (the :3200 standalone + the agent-browser daemon + the e2e server triple load — the r81 lesson re-fired; cleared by killing the servers/daemon before the E2E runs).

**THE BYTE CHAINS (`scripts/r84-screenshots.mjs`, numbers 891-999, 110 PNGs → 1182 tracked):** the login pair **891 ≡ 785 both sides** (`bd718ed0…`/`69aa4241…`) + the mobile drawer pair **911 ≡ 801 both sides** (loc `e3df921…`, ref `bfaa0da5…` — the **TWENTY-round chain** 911≡801≡727≡681≡649≡632≡615≡597≡579≡561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366). The 1440 route pairs (893-905): **7/7 STABLE both sides** (the round's fixes touch other routes). **THE NEW FIX-EVIDENCE BASELINES (907 assetmanagement + 909 payrollreports — the routes' FIRST per-side captures, for the r85+ chain).** The mobile re-baselines (913-925): **7/7 STABLE** (the payroll-ref pair comparing against the r83 re-baseline — the post-tenant-emptying state, holding). The tablet (927-939): **7/7 STABLE.** The sm-boundary (941-953): **7/7 STABLE.** The xl-boundary (955-967): **7/7 STABLE.** **THE FIRST DARK-MODE BYTE-COMPARE (969-981 vs the r83 859-871): 7/7 STABLE both sides. THE FIRST RTL BYTE-COMPARE (983-995 vs the r83 873-885): 7/7 STABLE both sides** — the r83 carry-forward duty discharged. The theme drawer pairs (997/999): **STABLE both sides.** The r83 height-contract lesson applied IN THE SCRIPT this time (the widthRoutePair parameterizes the height — the mobile set at 390×844, the boundary/tablet sets at ×1024). **THE MOBILE-MENU CYCLE GREEN** (the standing user emphasis: toggle → the drawer → the Training LMS link CLICKED:/training → /training → the auto-close — no TW-v4 regression).

**THE ROUND-END READS: THE 55TH HELD THROUGH A THIRD CONSECUTIVE ROUND.** The round-end watch read the SAME fingerprints as the opening — no 56th deploy; the cadence quiet for three full rounds. **The full standing ladder on the 55th-or-newer = r85's opening read.**

**ONE CLONE-AUTHORED DEFECT FIXED + ONE SUPERSET UPGRADE.** The round's diff: the two source fixes (the assetmanagement Export icon's `mr-2` + the payrollreports PDF's `window.print()`, both with the in-source classification comments) + the session84-export spec (5 tests) + the instruments (`scripts/r84-deploy-watch.mjs` + `r84-login-probe.mjs` + `r84-export-recon.mjs` + `r84-screenshots.mjs`) + the evidence (110 screenshots, 891-999) + the docs layer. The plan: `docs/remediation-plan-session84.md`; the narrative: `docs/session_191.md`.

Gates: lint 0/0 · tsc ✓ · **941/941 unit** · build ✓ · **E2E 417/417 (6.8m, zero flakes — the 412 standing + the 5 new)** · byte-stability 911≡801 (the twenty-round chain, both sides, on the holding 55th generation) + 891≡785 (the login pair, both sides) + the route pairs 7/7 + the mobile/tablet/boundary sets 7/7 each + the first dark/RTL byte-compares 7/7+7/7 + the fix-evidence baselines (907/909) · **1182 tracked screenshots (+110)** · DB pristine (users = [sepnetflix2023@outlook.com], employees 1, balances 2, jobPostings 0).


## Session 85 (parity round 84) — the keyboard-navigation cycle round: the 55th login deploy holding through a FOURTH consecutive round at the opening + THE KEYBOARD-NAVIGATION CYCLE (the last of the r83 close-out's named candidates — the tab walks, the focus-visible rings, the drawer's keyboard contract — never audited; every one of the 1182 standing PNGs an at-rest unfocused capture) finding TWO clone-authored defects, BOTH TDD-FIXED (R85-A the TW-v4 preflight's 50%-alpha UA focus rings + R85-B the never-replicated Base44 platform badge) + the logo-derivative follow-up + the mid-round workspace reset survived with a BYTE-DETERMINISTIC REPLAY + TWO round-end deploys (the 56th + the 57th) each step-1-proven NON-VISUAL

**THE OPENING READ: BOTH SIDES QUIET — THE 55TH HELD THROUGH A FOURTH CONSECUTIVE ROUND; THE FULL LADDER GREEN NON-VISUAL.** The r85 watch (re-armed at the unchanged post-55th finals) read both sides QUIET (login JS `index-BdweUDbT` + CSS `index--4Ltml9o`; the app side `C-IrDy5f`/`BGNH4KkS`; the DOM census unchanged). The full ladder on the 55th: the fresh logged-out login pair **BYTE-IDENTICAL** to the standing `69aa4241…` baseline (`scripts/r85-login-probe.mjs`) + standing **5/5** + sweep **12/12** + verify-r49 **13/13** + verify-r45 **13/13** → **NON-VISUAL.** The r83 ref-re-auth protocol applied BEFORE the standing/sweep run; the close-out traps retired. Baseline gates: lint 0/0 · tsc clean · 941/941 unit · build OK · the standing checks green (patch watch QUIET 16.4.2/canary.24 · audit UNCHANGED · the TW-v4 scan clean 15+6+0 · secrets zero in src/).

**THE CODE AUDIT (the repo skills' lens): the r84 diff CLEAN** — the two source fixes re-reviewed in context (recipe-consistent + the in-source classification comments) + the session84-export spec (computed-geometry per §18 T8, behavior tests per §13.5): no findings.

**THE FRESH-EYES INSTRUMENT — THE KEYBOARD-NAVIGATION CYCLE (`scripts/r85-keyboard-recon.mjs` + `r85-keyboard-deep.mjs` + `r85-keyboard-focus-png.mjs`).** THE TAB WALKS: the login sequence (REF 9 stops: the 3 socials → email → password → Sign in → Forgot → Sign up → **the icon-only `#badge-close`** → wrap; LOC 8 stops — the same first eight) + the dashboard sequence **15/15 IDENTICAL** (the nav order + the header buttons, the LOC's aria superset). THE DRAWER'S KEYBOARD CONTRACT: **PARITY end to end** (open → focus lands on Employees → the trap holds → Escape closes → post-Escape BODY both sides). THE FOCUS RINGS: the custom-ringed surfaces' visible box-shadow layers IDENTICAL (the login inputs' white 2px + slate-400 4px, the CTA's white + zinc-950, the nav's blue-500); **the divergence on the UA-default `outline: auto` elements — REF opaque `rgb(16,16,16)` vs LOC `oklab(0.140764 … / 0.5)` — pixel-proven (1692 differing pixels on the focused social button).**

**R85-A — THE TW-V4 PREFLIGHT'S 50%-ALPHA UA FOCUS RINGS.** The mechanism (the blank-page control + the CSSOM walk + the served-CSS grep): the preflight pins `* { outline-color: color-mix(in oklab, var(--ring) 50%, transparent) }` (escalated from `var(--ring)` under `@supports`) — every UA-default focus ring renders at #0a0a0a/50; the REF (Base44's own design system) rides the raw UA default (opaque). **The fix's first form — `outline-color: auto` — was REJECTED BY THE PARSE in the parity browser** (HeadlessChrome/155's CSSOM drops the longhand-auto rule while Chrome 1248 accepts it; plus the `transition-all duration-200` makes immediate post-Tab reads catch the transition midpoint). **THE ROBUST FIX: the pinned resolved literal `* { outline-color: rgb(16, 16, 16) }`** in globals.css's `@layer base` (same-layer-later — wins over the preflight + the shadcn `outline-ring/50` @apply; the utilities-layer outline-color members unaffected; the ring-utility family unaffected — outline-style none/hidden). The post-fix live read: `auto 1px rgb(16, 16, 16)` — IDENTICAL to the REF; the focused-screenshot cross-side diff collapsed from 515 cells to 6 AA-noise cells.

**R85-B — THE NEVER-REPLICATED BASE44 PLATFORM BADGE.** The REF's ninth tab stop is `#base44-edit-badge` — the platform's "Edit with Base44" floating badge injected on **EVERY page** (login + authed + mobile): fixed bottom-right 16px, z-999999, the 197x39 black pill (border rgb(38,38,38), radius 6, the twin shadow, the -apple-system stack) carrying the orange symbol img 20x20 + "Edit with" 12px + the wordmark img 56x14 + `#badge-close` 18x18 (session-only dismissal — the node unmounts with NO storage key, reappears on reload; the body click INERT for this user). **The clone rendered NOTHING there — a visible parity gap on every route that hid from the protocol for 20+ rounds**: the per-side byte chains compare each side against ITSELF (the badge rode the REF's own baselines all along — 323 dark corner pixels in every standing REF login capture vs 0 on the LOC), and the text-bearing DOM census can't see the icon-only close button. **FIXED (TDD): `src/components/shared/base44-edit-badge.tsx`** in the root layout (every route) — the REF-measured structure verbatim, the assets VENDORED (`public/base44-symbol-orange.png` + `public/base44-wordmark.png` — the zero-external-resources doctrine), the session-only close (React state, no storage — the REF's probed behavior), the pill an anchor to base44.app with `tabIndex={-1}` (**the functional superset over the REF's click-inert badge** while keeping the REF's exact tab order), print-hidden (the session-29 print-superset class). The standing mobile-navigation five-tab test adapted (dismisses the badge first — authentically as a real user; the badge covers the 390px tab bar's right end exactly as on the REF).

**THE R85-B FOLLOW-UP — THE LOGIN LOGO DERIVATIVE.** The program's FIRST cross-side pixel comparison (the focused-state pair) surfaced a third finding: the login logo img differed by ~350 AA-level pixels inside its 96x96 box — the LOC rode the 1563px full-res original while the REF loads its exact **192px supabase derivative** (different downscale resampling). FIXED: `public/eon-logo-192.png` vendored byte-for-byte (supabase byte-stable, md5-verified across fetches), the login img repointed (the full-res original stays for the JSON-LD logo URL); the residual collapsed to ~46 px of ±1-channel subpixel noise (classified, below the parity bar).

**THE CONTRACT PINS — `tests/e2e/session85-keyboard.spec.ts` (7 tests):** R85-A the opaque ring (RED pre-fix) · R85-B1 the badge geometry (RED) · R85-B2 the session-only close + reload restore (RED) · R85-B3 the authed-route mount (RED) · R85-C the 9-stop tab order (RED: 8 stops) · R85-D the drawer's keyboard contract (GREEN — parity already holding) · R85-E the inputs' visible ring layers (GREEN). **RED pre-fix exactly as designed (5 RED + 2 GREEN), GREEN post-fix 7/7.**

**THE MID-ROUND WORKSPACE RESET (the SEVENTH of the record) — SURVIVED WITH A BYTE-DETERMINISTIC REPLAY.** The entire uncommitted round (both fixes, the spec, the instruments, the docs, the first 112-PNG evidence set) was lost at the docs-layer stage; the recovery (fresh clone @ `87f748b` + the environment rebuilt + the round re-executed from knowledge) reproduced **every LOC PNG md5 identically** — the badge/logo/ring fixes render identically, the assets re-vendor to identical md5s, the re-run suite 424/424. The standing lesson: commit early, commit often.

**THE ROUND'S INSTRUMENT TRAPS (all retired):** THE STANDALONE ZOMBIE — Next.js renames the server process to `next-server (v16.4.2)`, so a missed port-kill left a PRE-FIX server holding :3200 while the new boot died EADDRINUSE (diagnosed by the served CSS chunk name; kill by PID from `ss -tlnp` + verify the chunk name after every reboot) · the daemon overload at the recon's start (reset at the first dead read) · the recon's `slice(0,56)` box-shadow truncation (the "transparent ring" false alarm) · the CSSOM space-serialization search artifact · the transition-all focus-read timing (the 450ms settle).

**THE BYTE CHAINS (`scripts/r85-screenshots.mjs`, numbers 1001-1111, 112 PNGs → 1294 tracked):** every REF capture **STABLE** against the r84 set (the 55th held through the round's captures); every LOC capture **DRIFT-BY-DESIGN** (the badge + the logo + the ring enter every LOC frame — the new md5s the chained baselines); **the focused pair 1017 = the keyboard surface's FIRST per-side baseline** (the r86+ chain); the r84 fix-evidence baselines' first byte-compare (1019/1021 vs 907/909); the mobile-menu cycle GREEN (the Training LMS CLICKED → /training → the auto-close — no TW-v4 regression under the badge).

**THE ROUND-END DEPLOY READS — TWO GENERATIONS IN ONE ROUND (the cadence re-compressed).** **THE 56TH** (login JS `index-BdweUDbT → index-Cixyggh5`, a JS-only chunk-graph movement; CSS/app quiet; the census unchanged) — **STEP-1-PROVEN: the fresh login pair BYTE-IDENTICAL → NON-VISUAL.** **THE 57TH** (login JS `index-Cixyggh5 → index-BgH6kzLl`; CSS/app quiet; the census unchanged) — **STEP-1-PROVEN: the fresh login pair BYTE-IDENTICAL → NON-VISUAL.** The watch RE-ARMED at the post-57th finals; the full standing ladder on the 57th-or-newer = r86's opening read (the r84 round-end-deploy precedent).

**TWO DEFECTS FIXED + ONE FOLLOW-UP + THE PROTOCOL EXTENDED.** The round's diff: the two source fixes (the globals.css outline-color restore + the Base44EditBadge component + the root-layout mount + the print rule) + the logo derivative + the vendored assets (3 PNGs) + the session85-keyboard spec (7 tests) + the mobile-navigation test adaptation + the instruments (`scripts/r85-deploy-watch.mjs` + `r85-login-probe.mjs` + `r85-keyboard-recon.mjs` + `r85-focus-png-diff.py` + `r85-screenshots.mjs`) + the evidence (112 screenshots, 1001-1111) + the docs layer. The plan: `docs/remediation-plan-session85.md`; the narrative: `docs/session_193.md`.

Gates: lint 0/0 · tsc ✓ · **941/941 unit** · build ✓ · **E2E 424/424 (7.1m, zero flakes — the 417 standing + the 7 new)** · byte-stability every-REF-STABLE vs the r84 set + every-LOC-DRIFT-BY-DESIGN (the badge/logo/ring re-baseline) + the focused pair 1017 (the first keyboard-surface baseline) + the 907/909 first byte-compare · **1294 tracked screenshots (+112)** · DB pristine (users = [sepnetflix2023@outlook.com], employees 1, balances 2, jobPostings 0).

## Session 86 (parity round 85) — the cross-side at-rest pixel-diff round: the 58th login deploy fully laddered NON-VISUAL at the opening (JS + the NEW frontend-config script + the first CSS movement since the 43rd line) + THE CROSS-SIDE AT-REST PIXEL-DIFF PROTOCOL (the r85 close-out's named frontier — the program's FIRST REF↔LOC pixel comparison at scale, every finding per-side byte-stable) finding SEVEN clone-authored defects, ALL TDD-FIXED (R86-A the payrollreports five-member structural divergence incl. the NEW TW-v4 space-y margin-collapse trap + R86-B the payroll month default + R86-C/D/F/G four path-data-verified icon identities + R86-E the Actions th alignment) + the NEW standing finding: NON-DETERMINISTIC REF-SIDE THEME VARIANCE

**THE OPENING READ: THE 58TH LOGIN DEPLOY — FULLY LADDERED NON-VISUAL.** Login JS `index-BgH6kzLl → index-DzlN4LV0` + a NEW NAMED `frontend-config` script (`/api/frontend-config.js?v=3` — a 1,529-byte `window.__APP_CONFIG__` bootstrap carrying backend URLs AND A TURNSTILE_SITE_KEY, with the login census still reading ZERO widgets — the rollout CONFIGURED-BUT-NOT-RENDERED, the standing Turnstile watch ESCALATED to key-shipped/rollout-pending) + the login CSS `index--4Ltml9o → index-BD8HgQNX` (the first login-CSS movement since the 43rd-line sweeps); the app side QUIET `C-IrDy5f`/`BGNH4KkS`. The full ladder: the fresh login pair **BYTE-IDENTICAL** to the standing `69aa4241…` baseline + standing **5/5** + sweep **12/12** + verify-r49 **13/13** (the first run 10/13 — three REF-side timing flakes, clean on the careful re-run) + verify-r45 **13/13** → **NON-VISUAL.** The CSS forensic: the new 904,220-byte login CSS structurally unchanged. Close-out traps retired (the ref re-auth BEFORE the standing run; the loc careful re-auth; the r45 probe user swept; DB pristine).

**THE CODE AUDIT (the repo skills' lens — `skills/web-application` §12/§18): the r85 diff CLEAN.** The patch watch MOVED: `16.4.3` stable (bug-fix backports, NO security content — the 14 Oct 2026 security update shipped in 16.4.1, already covered by the pinned 16.4.2) → **HOLD at 16.4.2** per the standing precedent (lockfile-verified; canary `16.5.0-canary.25`). The TW-v4 scan: **16 `!important`** (r85's badge print rule added the 16th; the docs' count-lockstep fixed this round). Secrets zero; oklch comments-only.

**THE FRESH-EYES INSTRUMENT — THE CROSS-SIDE AT-REST PIXEL-DIFF PROTOCOL** (`scripts/r86-crossdiff-capture.mjs` + `-diff.py` + `-triage.mjs` + the `-verify.mjs` post-fix pass): ten at-rest pairs @1440×900 LIGHT LTR; **every pair per-side BYTE-STABLE against the r85 baselines** — the findings are long-standing deltas invisible to the per-side chains by design. The pass found EIGHT structural clusters → triaged into THREE data-driven classes (the REF's emptied tenant: employees/recruitment; the role-scoped attendance state) and **SEVEN clone-authored defects.**

**R86-A — THE PAYROLLREPORTS FIVE-MEMBER STRUCTURAL DIVERGENCE** (296 differing cells): **A1** the thead-level header typography (REF `<thead className="bg-slate-50 text-slate-600 text-xs uppercase">` with bare alignment th's → 12px/700/UPPERCASE, the row h40; the LOC rode the table's text-sm → 14px Title-case, h44); **A2 the +24px container offset — A NEW TW-v4 TRAP CLASS (the space-y margin-collapse family): the REF's v3-style space-y puts margin-TOP on `sibling ~ sibling` children; the container's first DOM child is the `md:hidden` mobile sticky header (display:none at desktop), so the second child's (the desktop header row's) mt24 COLLAPSES out of the padding-less max-w-7xl container → the whole page sits 24px lower (y56 vs y32); TW v4's space-y compiles to `margin-block-end` on `:not(:last-child)` — no first-child margin-top, no collapse. FIXED with `className="mt-6"` on the PageHeader usage (the existing extension point; inert at mobile where the REF has no offset either)**; **A3** the CardHeader's invented `border-b` (REF borderless `flex flex-col space-y-1.5 p-6 pb-3`) + the title block (the REF's FLEX DIV `…flex items-center gap-2` h20 vs the LOC's `<p>`+inline-svg line-box 36px, +16px below); **A4** the stats section (REF: CardContent `p-0` + the grid's own `p-4 border-b border-slate-100` + `bg-slate-50 rounded-lg p-3` boxed cells with DIV children, h105 vs the LOC's h48). **R86-B** the payroll month filter's empty default (the REF pre-fills "October 2026"). **R86-C/D/F/G** four icon-identity defects, path-data-verified (Company `Building2`→`Settings`; Approval Workflows `Workflow`→`CircleCheckBig`; training's empty `GraduationCap`→`Video`; payroll's Reports & Export `FileDown`→`ChartColumn`; the settings Edit `Pencil`→`SquarePen`). **R86-E** the assetmanagement Actions th (the `text-right` override dropped — the component default text-left matches the REF verbatim).

**THE CONTRACT PINS — `tests/e2e/session86-crossdiff.spec.ts` (9 tests):** A1/A2/A3+A4/B/C/D/E RED pre-fix as designed (+F/G added after their verify-pass discovery), **GREEN 9/9, the full suite 433/433** (the 424 standing + the 9 new — 7.2m, zero flakes after the selector-timing fix). Three unit-side R13 recipe pins amended to the corrected icons (the count-lockstep rule; 941/941 unchanged). **THE POST-FIX PIXEL RE-VERIFY: payrollreports 296 → 0 structural cells** (the AA-noise floor); training 0; the residuals subpixel border-AA (below the bar, computed styles verified IDENTICAL).

**THE BYTE CHAINS (`scripts/r86-screenshots.mjs` + `-complete.mjs`, numbers 1113-1223, 112 PNGs → 1406 tracked):** the login + focused pairs both STABLE; the routes @1440 exactly the five remediated routes DRIFT-BY-DESIGN (LOC), the untouched four STABLE, **every REF STABLE at the primary surfaces**; the drawer pairs both STABLE; the mobile-menu cycle GREEN. **THE BAND/THEME REF VARIANCE (a NEW standing finding):** 10 REF captures drifted at the secondary bands — the recheck pass (`scripts/r86-ref-drift-recheck.mjs`) classified 6 TRANSIENT and proved the cause by the decisive live re-read: **NON-DETERMINISTIC REF-SIDE THEME VARIANCE — the REF's dark sidebar flips between two palettes ((24,24,27) zinc / (15,23,42) navy) across sessions with NO deploy.** The affected baselines re-anchored at the r86 captures; the r87 chain re-compares.

**THE ROUND'S TRAPS (all retired):** THE NINTH-SANDBOX DB VARIANT (no exported `DATABASE_URL` for the first time — the CLI/seed resolve the relative URL CWD-anchored OUTSIDE the repo → P2021; the fix: the per-invocation absolute pin) · the standalone port default (PORT=3200 explicit) · the eval `//` comment trap · the mid-round chromium cache wipe · **THE SANDBOX READ-LAYER CACHE CORRUPTION (bash/python read `const onthFilter` — a missing `[m` — while the Read/Edit tools and the compilers saw the valid bytes; the AST parse proof settled it)** · the VLM's crop-level misreads (settled by computed styles).

Gates: lint 0/0 · tsc ✓ · **941/941 unit** · build ✓ · **E2E 433/433 (zero flakes)** · byte-stability: the primary surfaces REF-STABLE + the five remediated routes DRIFT-BY-DESIGN + the band/theme variance classified · **1406 tracked screenshots (+112)** · DB pristine (users = [sepnetflix2023@outlook.com], employees 1, balances 2, jobPostings 0). The plan: `docs/remediation-plan-session86.md`; the narrative: `docs/session_195.md`; the SKILL §96 (v3.69.0).

## Session 86 companion pass — the second execution of the round-85 frontier, reconciled onto the published round (2d0b604): TWO defects the first pass did not reach, TDD-FIXED + pinned (R86-H the drawer panel's missing text-sidebar-foreground — the r41 token fix's missing call site, the moon reading the body default rgb(10,10,10) instead of zinc-700; R86-E the recruitment CTA's Plus→UserPlus glyph) + the mobile-geometry GUARD (the published A2 mechanism stays mobile-inert at y89) + the companion evidence (1225/1227 — the drawer pair ZERO cross-side cells) + the lucide-version watch (the REF ships a different lucide build)

**THE RECONCILIATION.** A second agent sandbox executed the same frontier in parallel (fresh clone @ 6a190c0, pre-push): its independent pixel harvest found the same defect family (re-verified live on the published build: the wrapper y56 · the thead recipe h40 · the month default · the ChartColumn glyph) plus TWO defects the published round did not reach — contributed back as this companion commit. The second pass MISSED the first pass's ChartColumn find (its 2-cell read classified AA; the first pass's path-data verification proved it real) — the union keeps both passes' fixes: ELEVEN defects total across the two executions.

**R86-H — the drawer panel's missing text-sidebar-foreground.** The desktop sidebar's wrapper carries the class (app-shell.tsx ~170); the drawer panel did not — the panel's one color-inheriting member (the theme toggle) read the body default rgb(10,10,10) instead of the REF's --sidebar-foreground zinc-700 rgb(63,63,70). FIXED: the class on the panel. **The selector trap (pinned in the spec's comment)**: a bare querySelector([aria-label="Switch to dark mode"]) matches the HIDDEN desktop moon (display:none at 390, earlier in DOM order, inheriting the correct token) — scope to [role=dialog].

**R86-E — the recruitment PNJ glyph.** The REF carries lucide-user-plus w-4 h-4 mr-2 (49 white pixels vs the plain plus's 21; the text geometry identical). FIXED with the REF's class form.

**THE COMPANION PINS — tests/e2e/session86-companion.spec.ts (3 tests)**: the drawer moon's zinc-700 (dialog-scoped) · the user-plus glyph · the payrollreports mobile guard (y89 at 390 — the published A2 mt-6 mechanism is mobile-inert). GREEN 3/3; the published 9-test spec still GREEN; the mobile-navigation suite GREEN; **the full suite 436/436** (the 433 standing + the 3 companion, 7.3m, zero flakes).

**THE EVIDENCE (1225/1227)**: the recruitment pair (vs 1125: ref STABLE · loc DRIFT-BY-DESIGN; the PNJ icon cell GONE cross-side — the residual 9 cells = the classified data-drift stat + the tab AA) · the mobile drawer pair (vs 1135: ref STABLE · loc DRIFT-BY-DESIGN; **the cross-side diff ZERO cells — pixel-perfect**) · the mobile-menu cycle GREEN.

**THE NEW STANDING WATCH — the lucide-version glyph drift**: the REF's palette icon carries DIFFERENT path data from lucide 0.525.0's (the REF ships a different lucide build) — the AA residual at icon edges; vendoring the REF's icon set is the escalation if a delta ever crosses the parity bar. The 7px mobile-overflow chain is now fully documented (the thead typography → the table min-content → the mobile overflow width → the CTA stretch → the centered content — one root cause, two symptoms).

Gates: lint 0/0 · tsc ✓ · 941/941 unit · build ✓ · **E2E 436/436 (zero flakes)** · byte-stability ref-STABLE/loc-DRIFT-BY-DESIGN on both companion pairs · the drawer pair ZERO cross-side cells · **1408 tracked screenshots (+2: 1225/1227)** · DB pristine. The companion diff: the two source fixes + the companion spec (3 tests) + the evidence (2 pairs) + the docs layer (the companion appendix on the plan + session_197 + this layer + the CLAUDE/README/SKILL clauses + the worklog entry).

## Session 87 (parity round 86) — the payrollreports TAB-INTERIOR round: the 58th deploy holding through a second consecutive round (the full ladder green: the login pair byte-identical to 69aa4241 + 5/5 + 12/12 + 13/13 + 13/13) + THE TAB-INTERIOR CROSS-SIDE PROTOCOL (the r86 close-out's named frontier — the Tax/History/Custom panels were wired as the session-35 superset WITHOUT measuring the REF, whose triggers were believed inert) finding THREE invented interiors, ALL TDD-REBUILT to the REF-measured recipes (R87-A the Tax panel: the trending-up title icon + the From/To range toolbar + the SEVEN-column breakdown · R87-B the History panel: the dollar-sign title + the NINE-column per-employee history · R87-C the Custom panel: the THREE-card architecture with the FOURTEEN column chips + the REACTIVE preview, NO Generate button) + R87-D the latent PayrollRow field-map defect + the LUCIDE-VERSION ESCALATION FIRED (the filter glyph vendored) + the lucide glyph census (43/55 identical, 8 AA-residual) + the NEW standing finding: the REF LIGHT-MODE BUILD VARIANT

**THE FRONTIER.** The r87 instrument (`r87-tabinterior-capture.mjs` + `-deep.mjs`) clicks each tab cross-side, settles, captures, and pixel-diffs: **monthly 0 (the r86 fix holds) · tax 93 · history 117 · custom 219 structural cells** — the three never-measured panels were session-35 inventions (the round believed the REF's triggers inert; they are interactive). The deep probe extracted the REF recipes member by member (title icons, descriptions, toolbars, column sets, classes, geometry, empty states), and the rebuilds landed each contract exactly.

**R87-D — THE LATENT FIELD-MAP DEFECT (the plan's validation-pass find):** the PayrollRow map read `r.employeeName`/`r.grossPay`/`r.netPay` — fields the raw API records NEVER carry (GET /api/payroll returns the Prisma shape: `employee.firstName/lastName`, `basicSalary`, `netSalary`); the zero-data state masked it since session 35. The map now derives employeeName/gross/net/basic/status from the real record shape — the data rows render correctly for the first time.

**THE POST-FIX FOLLOW-UPS (the re-verify's harvest):** (1) **the S35 inline-label gap collapse, re-found at toolbar scale** — v4's `space-y-1` puts the 4px margin on the inline LABEL (vertical margins on inline boxes are IGNORED), collapsing the label→control gap by 4px on the tax From/To toolbar + the custom filters grid; the house fix (explicit `mt-1` on every control — the login-fix pattern) was mutation-tested on the live DOM before the edit (label mb→0 + input mt-4px reproduced the REF's exact y431/h64 geometry). (2) **THE LUCIDE-VERSION ESCALATION FIRED** — the REF's Report Filters glyph is the CLASSIC triangle `lucide-filter` (`polygon 22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3`); lucide 0.525 renamed it Funnel with different path geometry — pixel-proven **maxdelta 221** (ABOVE the AA floor, unlike the r86 palette find); the vendored `RefFilterGlyph` component carries the REF's exact polygon + class. (3) the preview title's **trailing space** ("Report Preview␣" — the 5px records-span shift; the `{"Report Preview "}` form). (4) **the preview-export DISABLED contract** — the REF disables the Report Preview's CSV/PDF at 0 records (opacity-0.5, live-read) while the Monthly/Tax/History exports stay enabled (their 0-cell pairs prove it); `disabled={previewRows.length === 0}`.

**THE PIXEL PROOF:** **all four tab pairs PIXEL-PERFECT — monthly 0 · tax 93→0 · history 117→0 · custom 219→0 diff cells (maxdelta 4, the AA floor)**; the at-rest Monthly surface **byte-identical** to the r86 baseline (md5 `7b1c83bd…` == 1133) — the whole-page render unchanged by the rebuild.

**THE INSTRUMENT TRAPS (retired):** the Radix-tab DOM-click trap (`element.click()` does NOT activate a TabsTrigger — the snapshot-ref click is the working form); the agent-browser eval multiline trap (single-line expressions only); the probe-session retirement (any `close --all` kills every standing session — each instrument owns its auth); the stale-viewport trap (an unset 1024 viewport produced a phantom container "delta"); the post-click focus ring (the newer Radix programmatic focus — kept as the a11y superset; the instrument blurs before capture).

**THE LUCIDE GLYPH CENSUS (the frontier #2, quantified):** 14 standing routes both sides — **43 of 55 rendered names carry IDENTICAL path data; 8 differ** (users, laptop, square-check-big, trending-up, download, clock, palette, mail — all AA-residual, pixel-proven below the bar). **The watch's rule is now empirical: the vendoring escalation fires per-icon only when a path delta crosses the visible bar — ONCE this round (the filter glyph), zero across the other eight.**

**THE NEW STANDING FINDING — THE REF LIGHT-MODE BUILD VARIANT:** the mid-round captures caught the REF serving a second build variant per page load: the light sidebar at **#FFFFFF** (vs the pinned #FAFAFA), the brand row with EXTENDED text, and the preview buttons rendered at exactly 50% opacity (the disabled variant) — with NO deploy (the login byte-stable, the standard variant serving on the next loads). The r86 dark-sidebar flip's family, now documented in light mode: the platform serves TWO builds non-deterministically; the clone renders the STANDARD variant (the one every at-rest round measured and pinned).

**THE LOCKSTEP AMENDMENTS:** the three session-35 unit pins (R34-E2/E3/E4) amended to the REF contract (the count 941 unchanged); the session-35 `payrollreports-tabs.spec.ts` (4 stale assertions on the invented interiors) amended (the round-trip coverage kept); the AGENTS command row's stale 433 fixed to 446.

Gates: lint 0/0 · tsc ✓ · 941/941 unit · build ✓ · **E2E 446/446 (the 436 standing + the 10 new, 7.8m, zero flakes)** · the four tab pairs pixel-perfect · the at-rest byte-identical both sides · the mobile-menu cycle GREEN (open → Training LMS → /training → auto-close) · DB pristine (users = [sepnetflix2023@outlook.com], employees 1, balances 2, jobPostings 0) · 1416 tracked screenshots (+8: the 1229/1231/1233/1235 pairs). The round's diff: the payrollreports page (the three panel rebuilds + the field-map fix + the mt-1 toolbar/grid fixes + the vendored RefFilterGlyph + the trailing space + the disabled contract) + the session87 spec (10 tests) + the amended unit pins + the amended session-35 e2e spec + the instruments (r87-tabinterior-capture/deep + r87-glyph-census + r87-mobile-cycle) + the evidence (8 PNGs + the census JSON) + the docs layer (the plan + its execution appendix + session_199.md + this layer + the SKILL 3.70.0/§97 + the CLAUDE/README/AGENTS count-lockstep + the worklog entry).
## Session 87 (parity round 86, the second execution) — the full-registry cross-side pixel-diff round: the standing cross-side at-rest pixel-diff protocol extended to the REMAINING 52 registry routes (the program's first COMPLETE 61-route cross-side coverage) finding FOURTEEN clone-authored defects, ALL TDD-FIXED (the icon-identity family — assets Inbox→Laptop + organogram Network→Users + chat MessageSquarePlus→Plus + offboarding CircleCheckBig→Users + the employeeportal bg-blue-100 circle wrapper; the payrollmodule empty sentence; the interviewassistant at-rest card set — the AI Analysis card now analysis-conditional, the word counter dropped, the h16 title divs, the rows-12 textarea + the label-groups' +8 trailing-slot spacing; the payrollai h16 title; the reports border-slate-200+shadow family at BOTH card levels; the tenantsetup h68 fields via pb-2 + the payrollengine h64 fields; the loans container offset — the space-y-8 member of the r86-A2 margin-collapse class; the dynamicdashboard nav-active alias mapping; the attendancedashboard LineChart→grouped BarChart + recharts 3.x's Legend itemSorter={null}) + the 58th deploy holding QUIET through the round (the full ladder green at the opening) + the theme-variance re-compare CONFIRMING the non-deterministic REF-side dark theming (3/7 dark routes flipped, no deploy, the LOC stable)

**The round's fresh-eyes instrument:** `r87-crossdiff-capture/diff/triage/deep/deep2/deep3/deep4/verify` — all 52 remaining authed routes captured cross-side @1440×900 LIGHT LTR, PIL grid-diffed (13 MINOR/AA + 39 STRUCTURAL), every cluster triaged (8 data-driven classified + 14 clone-authored fixed). The data-driven set: the REF's progressively-emptied tenant (advancedanalytics/analytics/analyticsdashboard stats, careers' live public job board, employeeselfservice's REF-side profile-loading loop, profile's role badge, shiftcalendar's employee count).

**THE CONTRACT PINS:** `tests/e2e/session87-crossdiff.spec.ts` (14 tests) RED 14/14 as designed → GREEN; FIVE standing pins amended in the same commit (the count-lockstep rule: the R30-C1 assets Inbox→Laptop, the R48-C1 interviewassistant titles→div + the conditional card, the R61-K payrollai CardTitle→div, the R66-J tenantsetup footer justify-between, the R50-A7 employeeportal bare-glyph→circle-wrapper — the stale-measurement retirement).

**THE POST-FIX PIXEL RE-VERIFY:** closed to the AA/MINOR floor — employeeportal 61→2, payrollai 51→2, dynamicdashboard 12→2, assets 7→4, organogram 8→3, loans 113→4, chat/offboarding at the version-AA class; improved with classified residuals (carried forward with the probe data): interviewassistant 188→67 (the placeholder-wrap member), reports 167→77 (the wrap/shift class), payrollengine 99→20 (the month-input micro-offset), payrollmodule 16→11 (the Actions-th column member), tenantsetup 124→123 (a title-area font-level delta + a -6 card member), attendancedashboard 191 (the header-row layout member — the REF's filters sit inline at y60 — + the chart2 gridlines + the data-driven bottom table).

**THE THEME-VARIANCE RE-COMPARE (the r86 watch's decisive read):** 3/7 REF dark routes DRIFTED (dashboard/payroll/attendance) + 4 stable — the NON-DETERMINISTIC REF-SIDE THEMING CONFIRMED (the r86 prediction: "flips again = the non-deterministic theming confirmed"); the LOC dark side all STABLE. The dark drawer pair drifted identically on both sides (the capture-condition class; the r88 chain re-baselines at 1295).

**THE BYTE CHAIN (r87-screenshots, numbers 1237-1295 after the +12 cumulative merge renumber clearing the companion's 1225/1227 + the tab-interior pass's 1229-1235, 60 PNGs → 1478 tracked with the parallel passes' +12):** the login pair + the seven standing pairs BOTH SIDES STABLE + the fourteen remediated-route re-baselines (1253-1279 post-renumber) + the mobile-menu cycle GREEN (the Training LMS click → /training → the auto-close; the chain script's initial RED was a one-character case bug in the snapshot matcher — fixed).

**The carried-forward queue (r88 candidates):** the surveyanalytics 3-chart reconfiguration (the biggest remaining structural divergence — the REF's chart set: an empty-at-zero chart + two -100..100 reference-scale charts vs the LOC's category bar + time series + bare chart), the attendancedashboard header member, the tenantsetup title member, the reports wrap class, the lucide-composition drift (the shared icons' path-coordinate-level version differences — Users/Clock/SquareCheckBig/Laptop; a version pin is RISKY while five r86-verified icons match the pinned 0.525), the shiftswap stat-badge offset, the unresolved AA-class smalls (compliancedashboard/evaluations/surveys/templates/workflowautomation/workflowconfigpage/performancemanagement/staffrequests/requestsettings/requestreports/allleaverequests).

Gates: lint 0/0 · tsc ✓ · **941/941 unit** · build ✓ · **E2E 460/460 (the 433 standing + the 3 companion + the 14 new + the 10 tab-interior, zero flakes)** · byte-stability: the primary surfaces both sides STABLE + the REF dark variance CONFIRMED · **1478 tracked screenshots (+72: the companion's 1225/1227 + the tab-interior pass's 1229-1235 + the renumbered chain)** · DB pristine (users = [sepnetflix2023@outlook.com], employees 1, balances 2, jobPostings 0). The plan: `docs/remediation-plan-session87.md`; the narrative: `docs/session_200.md`; the SKILL §98 (v3.72.0 — the triple-union merge).

**THE PARALLEL-SESSION RECONCILIATION (the merge landing):** the push preflight (`git ls-remote` at the wrapper's step 4) read the remote main ahead — the session-86 COMPANION pass (`b5ba83e`: R86-H the drawer panel's `text-sidebar-foreground` + R86-E the recruitment UserPlus glyph, the 3-test companion spec, the evidence pair 1225/1227) + the owner's log (`329fc43`) already published. The union: the five-file merge (AGENTS/CLAUDE/README/SKILL/worklog — both session layers kept), this round's narrative renumbered `session_197.md`→`session_199.md` (the companion's transcript owns 197, the owner's log 198), the byte chain renumbered +4 (1229-1287, clearing the companion's 1225/1227), and the counts lockstepped to the union totals (E2E 450 = the 433 standing + the 3 companion + the 14 new · 1391 total · 1470 tracked PNGs). The merged tree re-verified with the full gates before the landing.

**THE SECOND PARALLEL-SESSION RECONCILIATION (merge #2):** the second push preflight read the remote ahead again — `258e538`, a THIRD parallel session-87 execution (the payrollreports TAB-INTERIOR round: the Tax/History/Custom panels TDD-rebuilt to the REF recipes, the latent PayrollRow field-map fix, the lucide-version escalation fired, the glyph census, the REF light-mode build-variant finding — 10 new specs, evidence at 1229-1235, its own session_199/plan/§97). The second union: their published layers verbatim (session_199 keeps its number, their plan the base with this round's as the full-registry appendix, their SKILL §97 the number) · this narrative renumbered session_199→session_200 + the SKILL §97→§98 · the byte chain renumbered +8 (1237-1295, the cumulative +12) · the counts lockstepped to the triple-union totals (E2E 460 = the 433 standing + the 3 companion + the 14 full-registry + the 10 tab-interior · 1401 total · 1478 tracked PNGs). The merged tree re-verified with the full gates before the landing.

The round's instrument traps (all retired): the background-process reaper (foreground + resume), the daemon overload, the mid-round chromium cache wipe (the standing r1248 lesson re-fired), the JSX comment placement trap (the {/* */} form is INVALID in the attribute/ternary-expression positions), the stale standalone serving the old build after a rebuild (kill-by-PID + re-verify), the read-layer cache corruption (ACTIVE — the Read tool + compilers over bash reads), the MultiEdit phantom-partial-apply (verify the file state after every failed batch).


## Session 88 / Parity Round 87 — the chart-suite + stale-measurement round

The r87 close-out's named frontier #1 — **the surveyanalytics 3-chart reconfiguration** ("the biggest remaining structural divergence") — executed together with the named residuals the same probes re-measured. Seven routes re-captured cross-side, every STRUCTURAL cluster localized, **SEVENTEEN defect members ALL TDD-FIXED** (R88-A1..A3 the surveyanalytics zero-state chart suite: the empty surface / the -100..100 reference scale with the left YAxis / the right-axis scale + the legend pair — the round's key recharts lesson: 3.x computes no axis ticks for empty/all-null data even with an explicit domain; the explicit `ticks` ladder + `allowDataOverflow` are BOTH required (the #7362 handling); R88-B1..B4 the attendancedashboard family: the missing month input (the superset wired via the `?month=` round-trip), the chart1 geometry + the 19-tick 2.x-cadence mimic (the XAxis height pin — 3.x auto-grows the band for the inherited 16px font), the Clock-In grid-only form, the summary card's plain h80 header + "Rate" + the plain-table rebuild; R88-C the tenantsetup +6 header (the space-y collision class, third instance — v4's margin-bottom-on-not-last-child collides with the circle's mb-4); R88-D1..D5 the reports icon family (the bare 20px title icons, the Plane/DollarSign/Shield/FileCheck tab swaps — the full 11-glyph census, the shared RefFilterGlyph, the Download pair, the card-header gradient band — the sRGB-pinned trap-3 form); R88-E1..E3 the hrreports grid-only chart + the FileSpreadsheet/Download pair + the Data Table icon; R88-F the shiftswap 40px stat tiles (the R49-B1 STALE-MEASUREMENT RETIREMENT — the R50-A7 precedent); R88-G/G3/G4 the companywall composer (the inline-label space-y trap at 8px scale, the trigger's leading users icon, the Post button's disabled-at-empty state — pixel-proven via the 50%-opacity capture against the computed-style probe's misleading enabled read). The residual pass harvested four more members (the recharts 3.x LEGEND RESERVATION — 24px inside the svg vs 2.x's sibling; the tenantsetup fields' interior gap; the circle's Building2 icon; the reports gradient) + retired the instrument finds (the hrreports loading-state capture artifact — the client-fetching pages need ≥6s settles; the querySelector DOM-order trap — the 3.x legend-icon svgs precede the chart svgs).

Gates: lint 0/0 · tsc ✓ · **941/941 unit** · build ✓ · **E2E 476/476 (the 460 standing + the 16 new session88-chartrecipes pins, 8.5m, zero flakes)** · the post-fix pixel re-verify: tenantsetup/shiftswap/companywall CLOSED to the sidebar AA band, reports max11, hrreports max59, surveyanalytics max26 (the hairline AA), attendancedashboard carrying the classified residuals (the data-driven table row + the recharts-version grid class — 15 even-day verticals vs 19 axis ticks, NOT decouplable via the 3.x API; every visible member live-verified matching) · the byte chain (1297-1341, 46 PNGs → 1531 tracked): the login + standing pairs BOTH SIDES STABLE (the REF light-sidebar variant flip on employees/attendance + 2/7 REF dark flips — the standing theming watch; the LOC recruitment drift = the companion's post-merge R86-E baseline shift) · the mobile-menu cycle GREEN by the manual proof (the script's timing race documented + patched) · DB pristine (the probe user swept at the close). The plan: `docs/remediation-plan-session88.md`; the narrative: `docs/session_202.md`; the SKILL §99 (v3.73.0).



## Session 88 (parity round 87, the second execution) — THE MOBILE-BAND CROSS-SIDE ROUND (the r87 close-out's named frontier: the first full-registry cross-side pass at 390×844 — all 61 authed routes) finding TWELVE clone-authored defects, ALL TDD-FIXED

**The round's fresh-eyes instrument:** `r88-mobile-capture/diff/triage/crop-diff` + the VLM crop reads + both-sides DOM probes + **the 3× reload stability verification** (`r88-variant-stability2.mjs` — every pinned recipe re-read on fresh loads against the r87 second-build-variant finding; all twelve STABLE 3/3). The read: **39 STRUCTURAL / 22 MINOR/AA** on the 61-route mobile registry; the triage: 8 data-driven clusters classified (careers' live job board, employeeselfservice's REF-side loading loop, the 0-vs-1 stats family, the bottom tables, the avatar/name/role) + **TWELVE clone-authored defects**:

- **R88-A the reports CATEGORY ICON family** — four glyph identities on one page: calendar-days→**Plane**, banknote→**DollarSign**, heart-handshake→**Shield**, file-text→**FileCheck** (the r86-E/R87 glyph-identity class)
- **R88-B the advancedanalytics Schedule Report CTA** — CalendarClock→**Plus** (paths M5 12h14 ~ M12 5v14)
- **R88-C the surveyanalytics ZERO-DATA CHARTS** — data=[] at zero responses on the Distribution + the Trend (the invented X axes retired; the queue's #1 structural divergence). The version-class residual documented: the REF's Trend Y-domain tick labels at zero data render only on recharts 2.x
- **R88-D the analyticsdashboard actions cluster** — `flex-nowrap` (the REF's unwrapped `flex items-center gap-3`): the REF-authored mobile overflow chain — the 456px natural-width cluster → the 488 root scroll → the subtitle ONE line (h=24)
- **R88-E the attendancedashboard MONTH FILTER** — the missing functional member: a `type=month` w-40 input FIRST in the actions, wired to `?month=YYYY-MM` (the server reads the param — window/title/day-count reload; the functional SUPERSET)
- **R88-F the profile icon family** — Camera→**Upload** (Change Photo), User→**CircleUser** (General), Globe→**Share2** (Social)
- **R88-G the chat conversations column** — **always visible** (the REF's `w-80 border-r flex flex-col`): the prior `hidden md:flex` was a clone-authored responsive invention leaving mobile users NO way to open a conversation — a functional regression AND a visual defect (the fix restores both)
- **R88-H the shiftcalendar table** — the REF's inline **min-width: 700px** (100px day columns + the one-row toolbar follow from the overflow)
- **R88-I the workflowconfigpage empty-state card** — the missed `text-card-foreground` (the r87-I card-family call site)
- **R88-J the shiftswap stat-card TILES** — the r49 "inline icon family" pin RETIRED as a stale measurement: the live REF renders `w-10 h-10 rounded-xl bg-*-100` tiles with the icon inside
- **R88-K the tenantsetup hero glyph** — Users→**Building2**
- **R88-L the companywall audience filter** — the **Users** glyph inside the trigger's `flex items-center gap-2` wrapper

**THE CONTRACT PINS:** `tests/e2e/session88-mobileband.spec.ts` (12 tests) RED 12/12 as designed → GREEN; the lockstep amendments: the recipes.test.ts profile tab pair (User→CircleUser, Globe→Share2) + the Schedule Report glyph (CalendarClock→Plus).

**THE POST-FIX MOBILE RE-VERIFY:** chat **73→4**, shiftcalendar **101→3**, shiftswap **65→2**, workflowconfigpage **11→2**, analyticsdashboard **120→29**; the residuals carried with classifications (the data-driven sets + the tenantsetup title member + the companywall composer offset + the surveyanalytics version class). **THE DESKTOP-BAND REGRESSION CHECK:** the changed surfaces clean (chat 4, shiftswap 3, workflowconfigpage 4, profile 9 cells); the standing E2E pins the primary guard.

**THE MOBILE-MENU CYCLE: GREEN** on the remediated build (open → Training LMS → /training → auto-close; no TW-v4 regression under the twelve fixes; the mobile-navigation suite 17/17 inside the 472).

**THE BYTE CHAIN (r88-screenshots, numbers 1297-1345 + the dev-server set 1347-1357 → 1534 tracked PNGs):** the login standing pair **BYTE-IDENTICAL** to `69aa4241…` (the 58th holding through a THIRD consecutive round) + the twelve mobile re-baselines + the twelve desktop guards + the six DEV-SERVER captures (the running-codebase evidence).

Gates: lint 0/0 · tsc ✓ · 941/941 unit · build ✓ · **E2E 472/472 (the 460 standing + the 12 new, 8.1m, zero flakes)** · the login pair byte-identical · 1534 tracked screenshots (+56) · DB pristine. The plan: `docs/remediation-plan-session88.md`; the narrative: `docs/session_202.md`; the SKILL §99 (v3.73.0).

The round's traps (retired): the chromium version wipe (1200 vs 1248 — the r1248 lesson re-fired), the daemon-overload class (three firings), the resource-exhaustion EAGAIN class, the MultiEdit phantom-partial-apply re-fired, the strict-mode hidden-sidebar selector class (the unique-subtitle-anchor form), the recharts-3.x tick-selector mismatch, the stale-viewport triage ghost, the exported-DATABASE_URL trap (the TENTH consecutive sandbox).


**THE FOURTH PARALLEL-SESSION RECONCILIATION (merge #4, the session-88 union):** the push preflight (the wrapper's step 4) read the remote main ahead at `b180558` — a THIRD parallel session-88 execution (`ab4b93a`, the CHART-SUITE + STALE-MEASUREMENT round: the surveyanalytics 3-chart reconfiguration with the recharts 2.x-vs-3.x zero-state contract decoded (the explicit `ticks` ladder + `allowDataOverflow`, the legend reservation, the XAxis auto-grow), the attendancedashboard family (the month input + the chart geometry + the plain-table rebuild), the reports 11-glyph census + the shared RefFilterGlyph extraction, the tenantsetup +6 header, the hrreports grid-only chart, the shiftswap 40px tiles — the same find as this round's R88-J, the companywall composer trio — E2E 476/476, its own session_202/plan/§99) + the owner's prompt archive (`c9845d8`/`b180558`, docs-only). THE UNION: the published deeper forms kept (reports/shiftswap/companywall/attendancedashboard/tenantsetup + the surveyanalytics explicit-tick-ladder — this round's R88-C spec amended to the union contract: the Distribution EMPTY + the Trend's 5-tick reference ladder) · this round's unique members kept (the advancedanalytics Plus, the analyticsdashboard flex-nowrap chain, the profile icon family, the chat always-visible column, the shiftcalendar 700px min-width, the workflowconfigpage token, the 12-test mobile-band spec) · the docs union (`session_202.md` keeps the published number, this narrative renumbered `session_203.md`; the published plan base + this round's mobile-band appendix; the SKILL §99 published / §100 this round, v3.74.0) · the byte chain renumbered +44 (1343-1389 + the dev set 1391-1401) with the duplicate 1297 login pair retired (byte-identical both sides, blob-verified — the identical evidence stands at 1237 + 1391) · the counts lockstepped to the union totals (E2E 488 = the 460 standing + the 12 mobile-band + the 16 chart-recipes · 1429 total specs · 1576 tracked PNGs = the 1478 base + the 46 published + this round's 54 unique).

Gates (the merged tree, re-verified before the landing): lint 0/0 · tsc ✓ · 941/941 unit · build ✓ · E2E **488/488** (the 460 standing + the 12 mobile-band + the 16 chart-recipes, 8.6m, zero flakes — all four spec families green together) · **1576 tracked PNGs** · DB pristine.

**SESSION 89 (file narrative: session_205) — THE MOBILE-BAND CLOSE-OUT ROUND (parity round 88):** the r89 queue executed — (1) THE DARK/RTL MOBILE BANDS' FIRST CROSS-SIDE PASS (the frontier named by the session-88 close-out, never compared in 88 prior sessions): both sides toggled through their own drawer controls, captured as at-rest pairs at 390×844, PIL grid-diffed — the dark /training page 2 hot pixels (max delta 19, the bottom-tab label AA), the dark open drawer 3 (max delta 12, the icon column), the RTL /training page 1 (max delta 19), the RTL open drawer 1 (max delta 9) — **ALL FOUR BANDS AT PARITY**, the whole-layout RTL mirror verified in both engines (the fixed panel physically left, the peer spacer right). (2) THE MOBILE-MENU DEEP VERIFICATION (the owner-directed focus): the full cycle both sides with computed-style extraction at every step — the open drawer **0 hot cells / max delta 0** (byte-level parity); the Employees expansion identical (the six sub-items, the 11-link census, the active-route styling `rgb(24,119,242)`+white computed-identical); the Training LMS navigation lands `/training` both sides with the REF dialog STAYING OPEN (data-state=open at +2s) and the clone AUTO-CLOSING (the documented superset); the state-matched at-rest diff 5 hot pixels (the 16px submenu icon column AA). **THREE TEST-METHODOLOGY ARTIFACT CLASSES named and retired** (each produced a false STRUCTURAL reading until isolated — now capture-protocol members): (a) the route mismatch (the drawer overlay shows the page behind it — match routes before capturing), (b) the programmatic-click focus ring (`element.click()` leaves `:focus`; 9,994 blue ghost pixels — blur before capture), (c) the native-click hover residue (agent-browser's click leaves the cursor on the element; the REF's `data-[state=open]:hover:bg-sidebar-accent` zinc-100 ghost — the clone's class string verified verbatim-identical; move the mouse to a neutral element). (3) THE r89 RESIDUALS RE-PROBED AND CLOSED: the tenantsetup title font member (computed-style-verified identical — 24px/600 rgb(250,250,250) etc. — 1-hot-pixel at-rest) and the companywall composer offset (1-hot-pixel) both **NO LONGER REPRODUCE** on the current deploy. (4) **R89-B THE RTL LANG MEMBER (the round's one live-measured defect, TDD-fixed):** REF's عربي sets `dir=rtl` **AND `lang=ar`** (live-measured both directions: EN restores `dir=ltr | lang=en`); the clone flipped only `dir` — `lang` stuck at the SSR default. Fix: `document.documentElement.lang = next === "EN" ? "ar" : "en"` in onLangClick + the THEME_BOOT `setAttribute("lang","ar")` alongside the dir set (the R32-A10 boot contract extended — reload-persistent). Pins: recipes.test.ts +3 (R89-B1/B2/B3, RED→GREEN) + the dark-mode.spec.ts trio amended (the click, the reload, the toggle-back). (5) THE COUNT LOCKSTEP: unit **944** (941+3) · E2E **488** (amendments only) · **1432 total specs** · **1585 tracked PNGs** (the byte chain 1403-1419: the dashboard, the open drawer, the expanded group, the /training auto-close proof, the dark band, the RTL drawer with lang=ar, the post-reset dashboard, tenantsetup, companywall).

Gates (session 89, at close): lint 0/0 · tsc ✓ · **944/944 unit** · build ✓ 116/116 · E2E **488/488** (8.7m, zero flakes) · DB pristine · the standing watches carried (the deploy watch RE-ARMED on the 58th-or-newer, Turnstile zero-widgets, the patch watch HOLD at 16.4.2, the recharts grid class, the theme-variance root cause). The plan: `docs/remediation-plan-session89.md`; the narrative: `docs/session_205.md`; the SKILL v3.75.0.


## Session 89 / Parity Round 88 — the DARK/RTL MOBILE-BAND round (the r88 close-out's named frontier: the first cross-side pass over the theme-direction states at 390×844 — the full 61-route registry in DARK and in RTL) + the standing user emphasis (the mobile-menu cycle) + the carried queue (both items verified already closed by the parallel round's published fixes)

**THE OPENING READ — the 59TH LOGIN DEPLOY (NON-VISUAL):** the login JS moved `index-DzlN4LV0 → index-BWZiPLrS` with the `frontend-config` script now on the LOGIN page too — carrying `TURNSTILE_SITE_KEY` + `TURNSTILE_LOGIN_ENABLED: "true"` (the standing Turnstile escalation: the login arming now CONFIGURED, but 0 widgets render — verified). The full standing ladder GREEN: the fresh login pair **BYTE-IDENTICAL** to the `69aa4241…` baseline + standing 5/5 + sweep 12/12 (after the documented cookie re-auth) + verify-r49 13/13 + verify-r45 13/13.

**THE THEME-VARIANCE ROOT CAUSE DECODED (the queue's named item):** the documented non-deterministic REF theme/build variants are the platform's **per-visitor A/B experiment system** — `window.__APP_CONFIG__.PRE_AUTH_EXPERIMENTS` assigns a `visitor_id` per session and serves variant builds (two fresh sessions read `auth-signup-free-tagline: "tagline"` vs `"control"` — direct evidence, no deploy). The capture protocol gains the standing experiment-assignment probe.

**THE DARK MOBILE-BAND READ: 26 IDENTICAL / 13 MINOR-AA / 22 STRUCTURAL** — the base dark palettes, headers, bottom navs, and cards render pixel-identical on 26 of 61 routes (the session-83 dark architecture holds). The triage (the digest + cluster-locate + VLM-with-DOM-verification discipline — five VLM misreads caught): **4 REF-BROKEN routes** (below), **10 data-driven/role classes**, **5 clone-authored defects — ALL TDD-FIXED (RED 6/6 → GREEN)**:

- **R89-A the attendancedashboard tick-font inversion + the mobile Export-button off-canvas chain** — the REF's XAxis ticks render at **11px** (3× stable, both themes; the YAxis at the inherited 16px — the MIXED form; the r88-B2 round's 16px XAxis claim was a measurement error in that parallel round). THE FIX: the 11px XAxis pin restored + the YAxis 16px pin + the REF's authored `overflow-x-auto > w-full text-sm` card-body wrapper + the Export button in a `w-full md:w-auto` wrapper (the verified simulation renders the REF's exact form: x=16/y=217/w=163 — the button was OFF-CANVAS at x=376 on the 390 viewport, unreachable at scroll-x=0).
- **R89-B′ the analyticsdashboard tick inversion (the mirror — the second execution's B; the published R89-B is the RTL lang member)** — the REF renders ALL ticks there at the inherited 16px; the LOC's three stale `tick={{ fontSize: 11 }}` pins removed.
- **R89-C the requestsettings approver-email input** — `type="email"` → the REF's `type="text"`.
- **R89-D the hrassistantchat grid height** — the REF's `h-[calc(100vh-250px)]` applies at ALL widths (594px at mobile); the LOC's `lg:`-gated form rendered 329px. THE FIX: the unconditional height. **POST-FIX: the route CLOSED to IDENTICAL (max2).**
- **R89-E the profile kicker placement (the 32px mobile offset)** — the REF hoists the mobile kicker OUT of the content column (`p-4 > [kicker, max-w-5xl]` — profile-specific; every other kicker page matches the root placement). THE FIX: the exported `PageHeaderMobileKicker` + the profile page renders it at the root. **POST-FIX: 86 → 5 cells.**

**THE REF-BROKEN MOBILE SET (4 routes — the functional-superset proof):** the REF renders `hrreports` + `interviewassistant` as an **EMPTY `#root`** (the full React crash) and `employeeselfservice` + `employeedetail` as an empty shell — below ~640px, theme-independent, live-verified. The clone renders all four fully. **The r88 classification of employeeselfservice ("the data-driven loading-loop class") is RETRACTED** — it was the empty shell.

**THE RTL MOBILE-BAND READ: 0 IDENTICAL / 34 MINOR-AA / 27 STRUCTURAL** — the second half of the frontier (`app_lang="ar"`, LIGHT). The capture-validity trap retired (the VLM direction misjudgment disproven by the decisive byte-compare: a fresh verified-`dir=rtl` capture md5-identical to the band file). The read: the systematic bidi AA floor (34 routes ≤5) + the same residual classes as the dark band + two RTL-specific members flagged for r90 (the assetmanagement chevron, the allleaverequests icon spacing).

**THE MOBILE-MENU CYCLE GREEN** on the baseline AND the fixed build (open → Training LMS → `/training` → the auto-close; no TW-v4 regression under the five fixes). **THE LOCKSTEP AMENDMENTS:** the R88-B2 e2e pin (the wrong-axis claim — the Y-tick contract clarified) + the R61-O/R63-C/R17-B unit pins (the kicker props moved to the standalone component — five amended, the count 941 unchanged).

Gates: lint 0/0 · tsc ✓ · 941/941 unit · build ✓ · **E2E 494/494** (the 488 standing + the 6 new, 8.9m, zero flakes) · the login pair byte-identical · **1605 tracked PNGs in the union tree** (this execution's chain renumbered +18 → 1421-1451; the published execution's 1403-1419) · DB pristine · `.env.example` re-verified. The plan: `docs/remediation-plan-session89.md`; the narrative: `docs/session_205.md`; the SKILL §101 (v3.75.0).
## Session 90 / Parity Round 89 — the RTL select-mirroring + mobile bottom-sheet round (v3.77.0)

**The frontier:** the r89 close-out's two flagged RTL-specific members — the assetmanagement select-chevron position and the allleaverequests header icon spacing — plus the standing adoption of the experiment-assignment probe and the re-armed deploy watch. The opening read detected the **60TH LOGIN DEPLOY** (login JS `index-BWZiPLrS → index-CrrEG27W`, CSS → `index-BlYK4iZ6`, app-side QUIET) and ran the FULL STANDING LADDER: the fresh login pair **BYTE-IDENTICAL** (NON-VISUAL) + standing 5/5 + sweep 12/12 + verify-r49 13/13 + verify-r45 13/13 + the Turnstile census 0 widgets. The experiment probe ran as the standing capture step (three visitors this round: `control`/`tagline`/`tagline`).

**THE OPEN-STATE FRONTIER (the selects were never opened cross-side before — the at-rest bands never saw it).** The triage of the two flagged members:

- **R90-A the mobile select trigger's RTL chevron** — TDD-FIXED (with the round's own revision): the REF swaps the WHOLE trigger form at the responsive boundary — the MOBILE trigger is a plain button (no role/aria/data-state/dir, live-verified: computed rtl, the chevron MIRRORED to the start side) while the DESKTOP trigger carries the stock Radix `dir="ltr"` stamp (live-measured at 1440 RTL: computed ltr, the chevron right). The initial blanket dir-strip was REVISED to the two-viewport contract after the desktop probe read the REF's desktop form (the viewport-axis measurement lesson — the per-axis tick census class generalized).
- **R90-B the REF's RESPONSIVE SELECT** — TDD-FIXED: the desktop popper swaps for a **BOTTOM-SHEET DIALOG below 768px** (the breakpoint live-verified: 736/640 → sheet, 768 → popper). The recipe extracted verbatim (the bg-black/80 overlay, the rounded-t-[10px] sheet, the 100px muted drag handle, the generic "Select an option" h2, the max-h-[60vh] list, the min-h-[44px] option buttons with the selected blue-50 family + the blue Check). The implementation renders NO Radix at mobile: the plain-button trigger + the span SelectValue (the authored-children pattern — the companywall Users glyph — preserved) + the dropped Content + the portal sheet fed from the page's own SelectItems (one source of truth). Three GREEN-phase traps retired: the hidden native `<select>` (a Root without its Trigger defaults isFormControl=true — caught by the R88-D legacy pin), the nested SelectValue (inside the trigger — the recursive replacement), the authored-interior pattern.
- **R90-C the assetmanagement option inventories** — TDD-FIXED: STATUS gained `Returned` + `Pending Return` (the clone's Repair/Retired filter entries retired; the StatusBadge map extended; the schema's free-string status needs no migration) and TYPE is the REF's twelve EMOJI-LABELED entries (💻 laptop … 📦 other — the labels ride the SelectItem children so the popper, the sheet and the dialog render the same set).
- **The allleaverequests member CLOSED as the AA/subpixel floor**: the pill geometry is IDENTICAL to 0.01px cross-side (x=185.98 w=188.02; gap 8px; radius 9999px) and the deltas ride the REF's own 0.66px svg undersizing (15.34 vs the clone's clean 16.00 w-4) + a 0.65px text width — glyph-edge pixels at delta ≤158. The clone's 16.00 is the correct render; chasing the REF's artifact would replicate it.

**The verification:** the cross-side sheet comparison reads IDENTICAL recipes both sides (the sheet y=262 h=582; the handle; the h2; the list classes; 12 options both sides; the selected blue-50 + the Check) · the RTL mobile re-capture: assetmanagement **6 hot/max245 → 2 hot/max11 (MINOR — the chevron now mirrors)** · the mobile-menu cycle GREEN on the remediated build (open → Training LMS → /training → the auto-close superset) · **Gates: lint 0/0 · tsc ✓ · 950/950 unit · build ✓ 116/116 · E2E 501/501** (the 494 standing + the 7 session90 pins, 8.8m, zero flakes) · DB pristine · `.env.example` re-verified · **the evidence chain 1453-1467 (10 PNGs) → 1615 tracked PNGs**. The plan: `docs/remediation-plan-session90.md`; the narrative: `docs/session_208.md`; the SKILL §102 (v3.77.0).

**The r91 queue:** the dropdown-menu family's responsive-swap question (the select was verified this round; the dropdowns were not), the other pages' option inventories cross-side (the open-state read), the dark-band data residuals' re-reads, the recharts-version grid class (the standing watch), the 60th-or-newer login ladder (the re-armed watch).

## Session 91 / Parity Round 90 — the open-state inventory round (v3.78.0)

**The frontier:** the r90 close-out's queue — the dropdown-menu family's responsive question + the other pages' option inventories (the open-state read generalized from r90's assetmanagement probe to the whole filtered surface) + the standing watches.

**THE OPENING READ:** the **61ST LOGIN DEPLOY detected** (login JS `index-CrrEG27W` → `index-34zv7ZR0`; CSS + app QUIET) → the full standing ladder GREEN: the fresh login pair **BYTE-IDENTICAL** (`69aa4241efa1` — the 61st NON-VISUAL) + standing 5/5 + sweep 12/12 + verify-r49 13/13 + verify-r45 13/13 + Turnstile 0 · the experiment probe (`tagline`, two fresh visitors).

**THE DROPDOWN-MENU FAMILY'S RESPONSIVE QUESTION — ANSWERED: NO SWAP (the classification finding).** The user menu probed cross-side at 390×844 through the drawer: the REF opens the STANDARD Radix popper (x=79 y=714 w=192 h=74, `dir="ltr"`, the shadcn recipe, "My Profile"/"Logout") — the LOC IDENTICAL. The r90-B bottom-sheet swap is select-family-only. Pinned R91-D1 (the guard). **The probe's traps:** the Radix dropdown opens on POINTERDOWN (synthetic clicks fail silently on menu triggers — the native CDP click via the snapshot `@ref` refs required) · agent-browser 0.39's XPath selectors broken (`//button` → "Element not found" — the snapshot-ref path is the working form) · the EAGAIN daemon bounce (the cleanup + re-auth protocol).

**THE SYSTEMATIC INVENTORY SWEEP (both sides, every combobox opened + read):** attendance + compliancedashboard AT PARITY · the loans dialog CLOSED at parity (the 4 loan types + the 672×698 geometry + the seven labels identical) · the recruitment job filter = the documented data-volume class (the REF's 3-job tenant vs the clone's jobless seed).

**THE THREE DEFECTS, ALL TDD-FIXED (RED 10/10 as designed → GREEN 12/12):**
- **R91-A the staffrequests option inventories** — the REF's CATEGORY seven (All/Finance/HR/IT/Operations/Tools & Equipment/Other vs the clone's General/Facilities/Admin inventions) + the STATUS workflow seven (Pending/L1 Approved/L2 Approved/Approved/Rejected/Completed vs the clone's In Progress/Resolved) + the vocabulary coherence fix (the Start button advances pending→l1_approved→l2_approved→approved; the Respond dialog completes/rejects — every reachable state inside the filter set) + the API PATCH enum + the Zod category enum + the StatusBadge l1/l2 members.
- **R91-B the hrreports FOUR-ENTITY report builder** (the round's biggest member) — the REF reports over Employees/Staff Requests/Expense Claims/Leave Requests with entity-dependent group-bys + table headers (the live-read contract table), the constant 6-value status union (per-entity matching; out-of-vocabulary values match nothing), the Bar/Line/Pie order, the carry-if-valid groupBy, and the run-only-when-grouped contract (the 0/0/0 initial state the old API achieved by accidental validation-rejection — restored explicitly). The StaffRequest schema gained `amount Int?` (the REF's entity field, proven by its group-by + table column; nullable — the REF's own dialog is broken so no input surface).
- **R91-C the recruitment inventories + the Add Applicant contract** — the table filter's 7 RAW lowercase statuses (new/reviewed/shortlisted/interview scheduled/offered/hired/rejected — the REF's separate pipeline vocabulary vs the kanban's 5-stage `stage` field) + the stage→status mapping predicate + the 3-mode sort (AI Score/Application Date/Experience) + the Add Applicant dialog rebuilt to the REF's seven fields (Full Name*/Email*/Phone/Experience (years)/Job Posting/Source/Cover Letter — the Source set Direct/Bayt/Linkedin/Facebook/Referral/Website; the clone's Stage select was an invention — new applicants land in "applied") + the Candidate schema's experience/source/coverLetter fields.

**THE REF-BROKEN FINDING:** the REF's staffrequests New Request dialog mounts then instantly closes (its open path's `Error creating audit log: 403` — the REF's own backend denies the audit write). The dialog's interior is unverifiable on the REF; the FILTER sets are the ground truth; the clone's working dialog stays the functional superset.

**The verification:** the live post-fix re-read (all three surfaces' option sets matching the REF verbatim + the entity-switch headers + the mobile sheet on the new selects + the mobile-menu cycle GREEN) · **the evidence chain 1469-1483** (8 PNGs) → **1623 tracked PNGs**.

Gates: lint 0/0 · tsc ✓ · **963/963 unit** (950 + 13 R91 pins) · build ✓ 116/116 · **E2E 512/512** (the 501 standing + the 11 new, 9.4m, zero flakes — after the two GREEN-phase regressions retired: the R88-E1 grid-only form + the R61-A 0/0/0 stats, both riding the run-only-when-grouped contract) · DB pristine.

**The r92 queue:** the remaining unopened surfaces (the dialogs' interior selects beyond loans — the requestsettings approver chain, the workflowautomation forms), the seed-data parity question (the REF's 3-job tenant vs the clone's jobless seed — the data-volume class, a scoped decision), the dark-band data residuals, the recharts grid class (the standing watch), the 61st-or-newer login ladder (re-armed).

## Session 92 / Parity Round 91 — the dialog-interior inventory round (v3.79.0)

**The frontier:** the r91 sweep read the AT-REST comboboxes; the r92 queue's insight — the "selectless at rest" pages hold their selects INSIDE DIALOGS (a whole surface the open-state discipline had never reached). The dialog-interior sweep (route → the New/Add button → the dialog → every interior select opened + read, both sides, + the full label/input/geometry read) found THIRTEEN clone-authored divergences, ALL TDD-FIXED (RED → GREEN 15/15).

**THE THIRTEEN:** R92-A/B/C the requestsettings limit selects (the category seven = the staffrequests vocabulary + All Categories; the period four Daily/Weekly/Monthly/Annual; the scope two All Staff/Specific Employee) · R92-D the workflowautomation dialog REBUILT as the REF's event-based builder (Trigger Type: the six lifecycle events New Employee Onboarding/Employee Offboarding/Work Anniversary/Birthday/Probation End/Contract Renewal + Target Department (Optional) + the Actions builder: Action Type Send Email/Create Task/Send Notification/Assign Template + Delay (days) + Email Message + Add Action; 768 wide; the Workflow schema's triggerType + targetDepartment + the actions JSON list) · R92-E the leave dialogs ×2 (Employee + the SEVEN types in the REF's non-alphabetical order + Total Days + Supporting Document (Optional) with the file input; 672; LeaveRequest.attachmentName; the seed's +3 types) · R92-F the documenttracker (the TEN-type taxonomy + Document Number "e.g. A123456" + the real Upload Document input; 576; the API's union enum keeps the compliance page's own verified set) · R92-G the payroll grouped form (Overtime Hours + the Allowances group Housing/Transport/Food/Other + the Deductions group Late Days/Absent Days/Unpaid Leave/Loans/Insurance/Other; NO Bonus/Status fields; 672; PayrollRecord.overtimeHours + notes) · R92-H the task dialog (Task Title + Assign To employee select; the Status/Project selects retired — new tasks default backlog) · R92-I the goal dialog (the Category five Productivity/Quality/Skills/Leadership/Innovation + Priority Low/Medium/High/Critical + Target Date; 672; Goal.priority) · R92-J the review dialog (Employee* + Review Period* + the RAW lowercase FIVE incl. promotion + Review Date + Create & Notify; ReviewCycle.reviewDate + the auto-created employee Review row) · R92-K the offboarding fields (Notice Date/Termination Date/Final Settlement; the Reason retired from the dialog) · R92-L the Assign Shift width 448 · R92-M the payslip dialog (Employee* + Bonus (SAR) + Notes + Generate Payslip — generating from the baseSalary).

**THE AT-PARITY SET:** the assets Add Asset (the six types + the geometry), the task Priority set, the loans level select, the shiftcalendar labels — plus the REF-INERT buttons (leavemanagement/expenses/templates + training/announcements/hrletters with no creation surface at all): the clone's working dialogs stay the functional supersets.

**The verification:** the live post-fix re-reads matching verbatim · the mobile-menu cycle GREEN (open → Training LMS → /training → the auto-close) · the R90-B mobile sheet GREEN on the new selects (the category select at 390 opens the sheet with the seven options) · the leave dialog rendering the full contract at 390.

Gates: lint 0/0 · tsc ✓ · **974/974 unit** (963 + 11 R92 pins; the R35-C3 documents pin amended to the ten-type union) · build ✓ 116/116 · **E2E 526/526** (the 512 standing + the 14 new, 9.7m, zero flakes) · DB pristine · the evidence chain 1485-1509 → **1643 tracked PNGs**.

**The round's traps:** the PWA service-worker offline cache (the SW served the offline fallback after the :3200 restart — the unregister protocol) · the bash-reaper on BOTH nohup AND setsid (the node-spawn boot survives) · the zoom-in-95 measurement trap (dialog geometry AFTER the open animation settles) · the Radix placeholder-at-empty-string (value="" is a value; the placeholder renders only at undefined) · the leave-type non-alphabetical order · the spec's manual-login dead-end (the storageState is the pattern).

**The r93 queue:** the unreadable REF interiors (the employee selects on its zero-employee pages), the seed-jobs parity decision (standing), the dark-band data residuals + the recharts grid class (standing), the 61st-or-newer login ladder (re-armed — both sides quiet this round).

## Session 93 / Parity Round 92 — the unscanned creation surfaces round (v3.80.0)

**The frontier:** the r92 sweep read DIALOG interiors; the r93 queue's insight — every creation surface that renders as an INLINE VIEW or a FULL-PAGE EDITOR was the third open-state blind spot (the employees Add Employee wizard, the recruitment Post New Job form, the workflowconfigpage editor). The round walked them cross-side (the 4-step wizard stepped through with no-creation Cancel exits; the inline forms + editors captured at the DOM level) and found EIGHT clone-authored divergences, ALL TDD-FIXED (RED 11/11 as designed → GREEN 13/13; A4 — the wizard's Employment Type four — already at parity).

**THE EIGHT:** R93-A the employee wizard's five field members (the step-1 placeholders John Doe/john@company.com/john@personal.com/+966 5XX XXX XXX; "Reports To" in the LEFT column not a spanned "Manager"; the Contract Type FOUR Indefinite/Fixed Term/Probation/Internship; the Basic Salary (SAR) number field riding the payload's minor-unit conversion; the 3×2 no-span step-3 order) · R93-B the Post New Job INLINE FORM (shadow-xl card + the indigo→blue gradient header between the tab bar and the filter row: Job Title*/Department*/Location/Employment Type — the -ship set Full Time/Part Time/Contract/Internship — /Job Description*/Requirements with its "List required skills..." placeholder + Cancel/Create Job; the dialog retired; the tabs controlled) · R93-C the workflowconfigpage's FULL-PAGE EDITOR (← Back + Workflow Name/Applies To (Staff Requests, Expense Claims)/Active switch/Min-Max Amount (SAR)/Categories (comma separated, blank = all) + the LEVELS BUILDER — the blue numbered circle + the w-48 name input + the trash button, Approver Type SIX (Staff Requests/Expense Claims/Specific User(s)/Department Head/Direct Manager/Any Admin), Auto-approve after (hours), the Approver Emails field riding the Specific User(s) type, Add Level — + Cancel/Save Workflow; the API's expense_claims + the level-object union keeping the settings dialog's legacy shape) · R93-D the Schedule Recurring Report dialog (512×380: Report Name/Report Type six (Attendance/Payroll/Overtime/Leave/Turnover/Headcount) | Frequency four (Daily/Weekly/Monthly/Quarterly) same row/Recipients ph "email@company.com" + Add; Cancel/Schedule Report; no description) · R93-E the Send Payslips via WhatsApp DIALOG (672: Select Payroll Month + the month input + Send All on one row; the data-driven payslip area with the "No payrolls found for {period}" line; Close — the clone fired a bare toast) · R93-F the New Chat dialog (Start New Chat, "Project name (optional)", Cancel/Create — the clone POSTed directly) · R93-G the Add Applicant BARE form (no description, NO placeholders, the 3-row textarea — 512×522) · R93-H the job-postings family (the draft|active vocabulary with the raw lowercase badges slate-100/slate-600 + green-100/green-700 rounded-md semibold; the REF's THREE-JOB TENANT seeded — HR Manager draft/HR Director draft/System Admin active with the verbatim description blobs, the idempotent postedAt-carrying upserts; the card contract: text-lg title + "dept · location" + badge + line-clamp-2 + "N applicants" + the Upload CV outline button wired as the CV-tab deep-link superset; the stats counting ACTIVE jobs; the careers + externaljobapplication pages listing only active).

**THE AT-PARITY/INERT SET:** the payrollengine/payrollmodule generate buttons (REF-inert; the working supersets stay), the staffrequests New Request (REF-BROKEN — the r91 finding).

**The verification:** the live post-fix re-reads matching verbatim · the mobile-menu cycle GREEN · the wizard's Contract Type through the R90-B bottom sheet at 390 (the four options in the sheet).

Gates: lint 0/0 · tsc ✓ · **981/981 unit** (974 + 7 R93 pins; the R58-8..12 + R58-16 pins amended to the new openers) · build ✓ 116/116 · **E2E 538/538** (the 526 standing + the 12 new; the session40/41 careers specs amended for the seeded tenant — the zero-board tests via the API route-intercept, the with-data counts at two, the apply-CTA scoped to the posted card) · DB pristine (the purge script's new E2E-prefixed chat sweep — the ai-chat API has no DELETE route) · the evidence chain 1510-1522 → **1650 tracked PNGs**.

**The round's traps:** THE LOST PUSH (the round's first full TDD execution landed as a local commit but the sandbox reset destroyed it before the push — a round is not landed until the push is verified; the wrapper step is part of the critical path) · the floating base44 wordmark badge intercepting pointer events over the editor footer (hidden for the spec's click) · the stats LOAD RACE (read after the "N candidates" wait, not at goto) · the two-Close strict-mode (the footer's + the built-in X) · the quoted-JSX-text unit pins (assert the verbatim source, not quoted strings).

**The r94 queue:** the REF-inert classification sweep (any remaining unscanned routes), the dark-band data residuals + the recharts grid class (standing), the login ladder re-armed at the current generation (NON-VISUAL this round), the with-data applicant-pipeline contracts against the seeded jobs.

## Session 94 / Parity Round 93 — the with-data applicant-pipeline round (v3.81.0)

**The frontier:** the r93 seed (the REF's three-job tenant) made every WITH-DATA surface readable for the first time — the public board's org view, the apply flow's URL contract, the applicant dialog's Job Posting select, the recruitment filters with data — and this round walked them cross-side with identical tenants live on both sides.

**THE OPENING READ:** the **63RD LOGIN DEPLOY detected** (login JS `index-DlxedS3b` → `index-BBWvc7Mt`, CSS `index-CrV5b32v` → `index-ByKl99Mk`; the app side QUIET at the recorded `C-IrDy5f`/`BGNH4KkS`) → the full standing ladder GREEN: the fresh login pair **BYTE-IDENTICAL** (`69aa4241efa1…` — the 63rd NON-VISUAL) + standing 5/5 + sweep 12/12 + verify-r45 13/13 + verify-r49 12/13→**reclassified to 13/13 this round** (below) + Turnstile 0 widgets rendered (the config still ships the key + the enabled flags) + the experiment probe `tagline` (auth-signup-free-tagline v19 — read via the `/api/frontend-config.js` endpoint: the `window.__APP_CONFIG__` page global is gone in the current generation).

**THE WITH-DATA FINDINGS:** TWO clone-authored divergences, both TDD-FIXED (RED 3/3 unit + 4/4 E2E → GREEN) · **R94-A** the careers org-view heading block (the REF wraps the org h2 in a `flex items-center gap-4` wrapper with the `text-slate-600` "Explore career opportunities" subtitle — live-captured at `/Careers?org=demo`; the clone rendered the bare h2) · **R94-B** the CAPITALIZED route pushes (the REF's chip → `/Careers?org={slug}`, the back → `/Careers`, the apply CTA → `/ExternalJobApplication?org={slug}&job={slug}` — the address bar carries the capital forms; the clone now pushes the same, with the two `next.config.ts` rewrites serving the lowercase filesystem routes URL-unchanged — the R51-A `/Dashboard` precedent extended to the public flow) · **R94-C** the verify-r49 `zero-externaljobapplication` member RECLASSIFIED (the REF's page makes NO JobPosting fetch — resource timing: zero job queries; the static zero state — the REF-INERT class; the member keeps rootCls/h1Cls/h1Text, drops the data-dependent keys).

**THE AT-PARITY SET (live-verified with data both sides):** the recruitment stats `1/0/0/—` + the tabs + the "0 candidates" table + the All Jobs filter options (the identical 3-job list) · the careers board + the R93-H job cards · the Job Postings tab cards. **THE REF-BROKEN SET:** the Add Applicant dialog's Job Posting select renders ZERO options on the REF with its own 3-job tenant (the console's `Error creating audit log: 403` — the staffrequests class; the clone's working select stays the superset).

**THE STANDING WATCHES HELD:** the recharts grid class (REF 15 verticals + 7 horizontals vs the clone's 19 + 7 — the classified 2.x-vs-3.x residual, unchanged) · the dark-band theming (the experiment system active, the same experiment) · the REF-inert spot-census (organogram display-only, the companywall composer trio standing, the dynamicdashboard Customize at x=1269 y=64 w=140 h=36 — cross-side identical) — the classification list is now CLOSED (no unscanned routes remain).

**The verification:** the live post-fix re-reads (the org view + the chip/apply/back flows on the remediated standalone — the address bars carry the capital forms) · the mobile-menu cycle GREEN (open → Training LMS → /training → the auto-close) · the wizard's Contract Type through the R90-B bottom sheet GREEN (the four options).

Gates: lint 0/0 · tsc ✓ · **984/984 unit** (981 + 3 R94 pins; the R40-F1/R51-A2 legacy pins amended to the new contracts) · build ✓ 116/116 · **E2E 542/542** (the 538 standing + the 4 new; the session40/41 URL regexes amended to the capitalized forms) · DB pristine (the loading-probe user swept) · the evidence chain 1523-1529 (7 PNGs) → **1658 tracked PNGs**.

**The round's traps:** THE EXPORTED-DATABASE_URL GUARD RE-FIRED on the fresh sandbox (the environment exports `DATABASE_URL=file:/home/z/my-project/db/custom.db` — an absolute path into the repo's PARENT — silently overriding `.env` for the Prisma CLI: the first push+seed wrote a seeded DB to the parent while the repo's `db/custom.db` stayed empty, and the standalone read the empty file → P2021 login failures; the recovery = purge the poisoned artifact + `env -u DATABASE_URL` on every DB command) · the experiment-probe URL form (read `/api/frontend-config.js` directly — the page global is gone) · the headless hover dead-end (Tailwind v4's `hover:` sits behind `@media (hover: hover)` which headless Chromium never matches — no hover state is measurable in this environment; the REF's own careers-apply hover is a color under a gradient, visually inert regardless) · the screenshot CWD (agent-browser saves relative to the daemon's CWD — always pass ABSOLUTE paths).

**The r95 queue:** the with-data DIALOG interiors the seeded tenant enables (the recruitmentkanban pipeline with applicants, the job detail surfaces), the standing watches (the 63rd-or-newer login ladder re-armed, the recharts grid class, the dark-band theming).

## Session 95 / Parity Round 94 — the with-data recruitment-family round (v3.82.0)

**The frontier:** the r95 queue — the recruitmentkanban pipeline + the job detail surfaces with the seeded three-job tenant live on both sides, plus the standing watches.

**THE OPENING READ:** the **64TH LOGIN DEPLOY detected** (login JS `index-BBWvc7Mt` → `index-CI-M8KyE`; CSS UNCHANGED at `index-ByKl99Mk`; the app side QUIET at `C-IrDy5f`/`BGNH4KkS`) → the full standing ladder GREEN: the fresh login pair **BYTE-IDENTICAL** (`69aa4241…` — the 64th NON-VISUAL) + standing 5/5 + sweep 12/12 + verify-r45 13/13 + verify-r49 13/13 + Turnstile 0 + the experiment probe (the system active, a fresh visitor on the `control` variant of auth-signup-free-tagline v19 — read via `/api/frontend-config.js`).

**THE ROUND'S FINDING — ONE whole-surface divergence, TDD-FIXED (RED 5/5 unit + 5/5 E2E → GREEN):** **R95-A the AI CV Upload tab REBUILT** — the REF's tab is a FILE-UPLOAD surface (a single stacked column: the "Select Job Position" label + the `w-96` combobox with the placeholder "Choose a job posting..." and the "{title} — {dept}" options for ALL jobs incl. drafts, NO default — verified 3× on fresh loads; the CONDITIONAL dropzone: the DISABLED slate form at rest `text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300` + "Select a job position above to start uploading CVs", the ACTIVE indigo form with a job `border-2 border-dashed border-indigo-200 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer` + "Upload Candidate CV" + "PDF, DOC, DOCX — AI will parse & score automatically" + the hidden `accept=".pdf,.doc,.docx"` input). The clone had INVENTED a 2-col paste-text form (Candidate Name/Email/CV Text/Analyze CV) — never cross-side verified until this round. The superset preserved: `src/lib/cv-text.ts` (the ZERO-DEPENDENCY client-side extraction — the .docx ZIP central-directory walk + the .pdf FlateDecode stream scan, both on the browser-native DecompressionStream; the printable scrub fallback; the <40-alphanumeric guard; the filename-stem name derivation) + the analysis result card renders below only after an upload.

**THE GREEN-PHASE GEOMETRY CATCHES (live-measured both sides):** the v4 space-y trap RE-FIRED on the INLINE label (v4's margin-block-end on the inline label is layout-inert; the REF's v3 margin-top rides the BLOCK button — the trap-#6 remedy: the explicit second-child `mt-2` + `text-base leading-6` for the REF's 24px strut; the block landed byte-identical: panel y426 h258, block y426 h68, label y430 h16, combo y458 w384 h36) · the mobile w-96 leak (`w-full max-w-96`) · the PRE-EXISTING tablist min-content overflow (the three labels force 471px at 390 — bisected; fixed with `flex-wrap` on the pill, dormant at desktop, the pill re-verified byte-identical y366 w439 h36 cross-side) · the Radix portal scope (the E2E option assertions at the PAGE level) · the `&amp;` verbatim-source pin.

**THE REF-BROKEN/INERT SET (documented, no clone change):** the kanban job combobox renders ONLY "All Jobs" with its own 3-job tenant (clean-session verified — the audit-log-403 family) · the Add Applicant CREATION path fails on the REF (the full form submit leaves the dialog open, nothing created, `App state check failed: 403` — the with-applicants kanban interiors are UNREADABLE there; the clone's working pipeline stays the superset) · the Upload CV card button is INERT on the REF (a MutationObserver read ZERO DOM changes — the clone's CV-tab deep-link superset stays, re-verified landing on the rebuilt tab with the job preselected).

**THE AT-PARITY SET:** interviewassistant (the h1/classes/labels/combos/placeholder identical; the REF's candidate select empty at its 0-candidate tenant) · the kanban surface (the columns + badges + the 512×522 Add Applicant dialog + the Source set) · the Job Postings cards (the R93-H contract, not clickable, verbatim text).

**The verification:** the at-rest + active dropzone byte-identical cross-side · the mobile-menu cycle GREEN (open → Training LMS → /training → the auto-close) · the R90-B bottom sheet GREEN on the new job select (the 3 jobs, em-dash format) · the mobile scrollWidth 390 (clean).

Gates: lint 0/0 · tsc ✓ · **995/995 unit** (984 + 6 cv-text + 5 R95 pins; the R14-A/R66-E legacy pins amended to the flex-wrap contract) · build ✓ 116/116 · **E2E 547/547** (the 542 standing + the 5 new) · DB pristine · the evidence chain (8 r95 PNGs) → **1671 tracked PNGs**.

**The round's traps:** THE E2E-CONCURRENCY RESOURCE CLASS (the full Playwright gate run while the agent-browser daemon holds sessions SIGABRTs the workers — 11 casualties at 0-3ms, all 21/21 GREEN on the idle re-run; close every browser before the gate) · the v4-space-y-on-inline-label trap (the new member of the trap-#6 family) · the strut difference (the REF's 16px/24px body inheritance vs the clone's 14px/20px app context — an 8px combo shift fixed with `text-base leading-6`).

**The r96 queue:** the with-applicants pipeline interiors through the CLONE's working superset (the kanban card + the applicant detail surfaces), the standing watches (the 64th-or-newer login ladder re-armed, the recharts grid class, the dark-band theming), the mobile-overflow spot-census on the other tabbed routes.

## Session 96 / Parity Round 95 — the with-applicants superset-interiors round (v3.83.0)

**The frontier:** the r95 close-out's queue — the with-applicants pipeline interiors the CLONE's working creation path enables (the REF's own creation paths are the documented 403-broken class), the remaining mobile-overflow spot-census on the other tabbed routes (the r95 pill-wrap pattern), the neo-crm session-187 tech-stack pattern check (the v4 space-y INLINE-FLOW variant), and the standing watches.

**THE OPENING READ:** the **65TH LOGIN DEPLOY detected** (login JS `index-CI-M8KyE` → `index-Cb4GrjTt`; CSS UNCHANGED at `index-ByKl99Mk`; the app side QUIET at `C-IrDy5f`/`BGNH4KkS`) → the full standing ladder GREEN: the fresh login pair **BYTE-IDENTICAL** (`69aa4241…` — the 65th NON-VISUAL) + standing 5/5 + sweep 12/12 + verify-r45 13/13 + verify-r49 13/13 + Turnstile configured-but-0-rendered (the config now also carries `TURNSTILE_PASSWORD_RESET_ENABLED`) + the experiment probe (the system active, a fresh visitor on the `tagline` variant of auth-signup-free-tagline v19).

**THE ROUND'S CLASSIFICATION: ZERO clone-authored divergences — the first pure verification + classification round of the series.** Every flagged candidate resolved to byte-parity, a standing classification, or a REF-broken hold:

- **R96-A the REF's Add Applicant creation re-test — STILL BROKEN, the classification DEEPENED:** the dialog opens (the 512×522 contract, the seven labels: Full Name */Email */Phone/Experience (years)/Job Posting/Source/Cover Letter) but the Job Posting combobox ("Select job") opens an **EMPTY `role=listbox`** (the popover DOM read: `data-state=open`, zero options rendered). The required field can never be satisfied → the creation path is uncompletable AT ITS ROOT — the same audit-log-403 family as the page-level filter comboboxes. The clone's working pipeline stays the superset.
- **R96-B the clone's with-applicants interiors — ALL WORKING (end-to-end through the clone's own paths):** the Add Applicant dialog (512×522, the native job select with all 3 jobs + the 6-source set) → the POST fires + the dialog closes + the kanban card appears (228×111 at x302 y220 — the initials avatar "RT", the name, the job, the "RT · Applied" chip, the Move-to affordance) · the applicants TABLE row (6 cells: the avatar+name+email, the job, "Not scored" + the progress bar, the skills "—", the Applied badge, the 32×32 actions trigger) · the Actions dropdown (the Move-to menu: Interviewing/Offer/Hired/Rejected + Remove — the current stage excluded; w128 at x1267) · the stats row (1 active job · N applicants · 0 shortlisted · "—") · the interviewassistant's candidate combobox WITH DATA (the options render "Unassigned" + "R96 Menu Probe · HR Manager" — the REF's own opens empty at its 0-candidate tenant) · the PATCH move (applied → interviewing) + the DELETE cleanup · the mobile 390 kanban card fully visible (x30 y377 w228). Evidence: 3 PNGs (r96-loc-kanban-card / r96-loc-actions-menu / r96-loc-kanban-mobile).
- **R96-C the mobile-overflow census — FULL PARITY (the round's headline):** every flagged route renders the REF's own overflow BYTE-IDENTICALLY — settings 1003=1003 (the 7-trigger tablist w971=971), attendance 943=943 (w471), profile 539=539 (w507), payrollreports 583=583 (w551), compliancedashboard 451=451, recruitment 550=550 (w439, the triggers at the same x positions) + recruitmentkanban 1376=1376 (the 5 columns × w256 at x=16/288/560/832/1104). **The r96 queue's premise (the pill-wrap pattern "applies wherever a tablist's min-content exceeds 390") is RETIRED — the REF itself overflows the same way at the same widths; the parity contract is to overflow identically, not to wrap cleanly.** The r95 flex-wrap on the recruitment pill stays DORMANT (the applicants table floors both sides' page min-content at 550 — verified at 390 AND 360; the wrap can never engage). The root cause chain (the applicants TABLE's min-content → the flex-1 main's `min-width:auto` → the page stretch) is the REF's own architecture, faithfully cloned.
- **The r95 "/recruitment empty below ~640" claim RETIRED:** the REF now renders /recruitment at every width (360/390/640/700/767 all non-empty — a recent deploy fixed it). The documented REF-broken mobile set otherwise HOLDS (hrreports + interviewassistant still empty #root; employeeselfservice still the loading shell; employeedetail still the empty shell).
- **R96-D the v4 space-y INLINE-FLOW scan (the neo-crm D-187a3 lesson): 0 LIVE INSTANCES** — all 14 heuristic hits (dashboard/employeeportal/payrollreports/requestreports ×4/requestsettings/shiftcalendar/login ×3/not-found/select.tsx) resolve to block-level direct children (`li`, `div.flex`, `w-full flex` buttons); the standing cures (R95's explicit mt-2 + the login family) cover the real cases. Documented as a watch, not a defect.
- **The standing watches ALL GREEN:** the recharts grid class HELD (5=5 charts, 7=7 horizontals, the 16-vs-23 verticals = the classified 2.x-vs-3.x residual) · the patch watch: next 16.4.3 published, the 16.4.2 HOLD stands (the neo-crm repo holds the same) · TW-v4 oklch scan clean · secrets zero.

**THE GATES:** lint 0/0 · tsc ✓ · 995/995 unit · build ✓ 116/116 · E2E 546 passed + 1 resource-pressure casualty re-verified 13/13 on the idle machine (the documented E2E-concurrency class; NO source changes this round — the opening baseline IS the closing gate) · DB pristine at close (the loading-probe user + the r96 test candidates swept) · the evidence chain (4 r96 PNGs).

**THE ROUND'S TRAPS:** the bash double-quote `$` expansion silently emptied the login password (`"$Abcd1234"` through double quotes → `$Abcd` expands to empty — single-quote the password in every agent-browser fill) · the `//` comment inside an eval expression swallows the rest after the one-lining join (no comments inside eval strings) · the agent-browser thread exhaustion (EAGAIN on spawn) after rapid session cycling — the cleanup: pkill the headless shells, restart :3200 if it died, batch the browser work into fewer scripts · the :3200 auth limiter (10 logins/15min) forces a standalone restart every ~10 scripted sessions.

## Session 97 / Parity Round 96 — the real-file CV-flow round (v3.84.0)

**The frontier:** the r96 close-out's queue — the AI CV Upload tab's with-data flow with a REAL `.docx`/`.pdf` (until now E2E-exercised with a `.txt` only), the kanban within-column DnD (resolved COVERED by the existing spec on inspection), the REF-mobile-render sweep, and the standing watches.

**THE OPENING READ:** the REF QUIET at the 65th deploy state (the login asset fingerprints unchanged — login JS `index-Cb4GrjTt.js`, CSS `index-ByKl99Mk.css`; no 66th deploy) → the FULL STANDING LADDER GREEN: the fresh login pair BYTE-IDENTICAL (`69aa4241…`) + standing 5/5 (the first run's drawer miss = the first-click absorption transient; the re-run clean) + sweep 12/12 + verify-r45 13/13 + verify-r49 13/13.

**THE ROUND'S ONE DEFECT — R97-A the `.pdf` TJ-array extraction (VERIFIED, TDD-FIXED):** `src/lib/cv-text.ts`'s `pdfTextOperators` matched only strings DIRECTLY followed by a text operator (`(…) Tj|TJ|'|"`); real-world PDF writers (Word's Save-as-PDF, Acrobat, kerned LaTeX) emit the ARRAY form — `[(Senior HR Manager) -120 (with payroll)] TJ` — where the strings ride inside the brackets followed by positioning numbers. The old regex yielded ZERO strings on a TJ-array stream (empirically verified) → a real .pdf CV surfaced "Couldn't read the CV text" — the tab's core promise ("PDF, DOC, DOCX — AI will parse & score automatically") failed on the dominant real-world form. **The fix:** the two-alternative scan (the direct form + the full array form with the same unescape rules, reading order preserved) · RED 3/3 as designed → GREEN 9/9 (the GREEN-phase catch: the escaped-parens spec's first content ran UNDER the 40-alphanumeric guard — the fixture, not the regex, was short).

**R97-B the real-file E2E (born-green 2/2, MUTATION-PROOFED):** the new `tests/e2e/session97-realfile-cvflow.spec.ts` drives a real-shaped `.docx` (the shared zip-fixture builder) and a TJ-carrying `.pdf` through the actual UI → the analysis card → the persisted API row (nonzero aiScore asserted) → the cleanup. The mutation proof (the pre-R97 regex restored): exactly 1 RED (the TJ spec) while the docx spec stayed green — unique teeth.

**THE STANDING CLASSIFICATIONS RE-VERIFIED (no clone change):** the REF-broken mobile set HOLDS (hrreports + interviewassistant empty `#root`; employeeselfservice the loading shell; employeedetail the empty shell; /recruitment renders at 390 — the r96 retirement holds) · the REF's Add Applicant creation STILL BROKEN (the dialog opens 512×522 with the seven labels; the Job Posting combobox opens an EMPTY listbox — count 0) · the mobile-nav cross-side pair PARITY (the REF's 28px `lucide-panel-left` hamburger + its 288px fixed drawer byte-match the clone's contract) · the kanban within-column DnD COVERED · the patch watch HOLD at ^16.4.2 (16.4.3 published) · TW-v4 oklch clean · secrets zero.

**THE GATES:** lint 0/0 · tsc ✓ · 998/998 unit (995 + 3 R97 pins) · build ✓ 116/116 · E2E 549/549 (the 547 standing + the 2 new; the final gate ALONE) · DB pristine at close (candidates 0) · the evidence chain (11 r97 PNGs; the analysis card VLM-verified).

**THE ROUND'S TRAPS:** the `offsetParent` visibility fallacy (Chrome reports `offsetParent === null` for `position:fixed` portals — Radix dialogs/drawers read as ABSENT; the fixed-aware check: `getBoundingClientRect().width > 0` + the computed position) · the agent-browser text-selector syntax (the Playwright-style `>> text=` chaining is NOT agent-browser syntax — those clicks fail silently; the snapshot-ref click is the reliable path) · the `$`-password double-quote trap re-fired once (the `fill` + single-quoted shell words is the standing cure) · the first-click absorption (the standing audit's 4/5 first run → 5/5 re-run; the tab clicks need a selected-state verify + re-click) · the :3200 lifecycle pair (the auth limiter restart + the EADDRINUSE pkill settle ≥2-3s).

## Session 98 / Parity Round 97 — the multi-stream + octal-escape CV-flow round (v3.85.0)

**The frontier:** the r97 close-out's queue — the CV-flow frontier's two named candidates (the octal-escape unescaping class + the multi-stream real PDF pin), the REF-broken mobile set on watch, and the standing watches.

**THE OPENING READ: the 66TH LOGIN DEPLOY classified NON-VISUAL** (login JS `index-Cb4GrjTt` → `index-DmiZE53r`, CSS `index-ByKl99Mk` → `index-puMd6fDW` — BOTH moved, but the fresh login pair renders BYTE-IDENTICAL to the standing `69aa4241…` baseline; the census intact: the 6 buttons, the 2 inputs, "Welcome to Eon HR", no Turnstile) → the FULL STANDING LADDER GREEN: standing 5/5 (the first run's `found:false` pairs were the UNAUTHED sessions — `auth-sessions.mjs` must run BEFORE the probes) + sweep 12/12 + verify-r45 13/13 + verify-r49 13/13.

**THE ROUND'S PRIMARY DEFECT — R98-A the multi-stream PDF scan (VERIFIED, TDD-FIXED):** `src/lib/cv-text.ts`'s stream scan set `streamRe.lastIndex = end` (the position of `endstream`) — but `/stream\r?\n/g` then re-matched the "stream" INSIDE "end"**`stream`**`\r\n`, so every chunk after the first started at the PREVIOUS endstream (object-dict garbage + the next stream's compressed bytes) and failed to inflate → **every stream after the first was silently lost**. Empirically verified with a crafted two-stream PDF: page 1 extracted, page 2 absent — a multi-page CV (the norm) yielded page 1 only. The r97 queue's assumption "the scanner handles it" was WRONG — the §109 fixture-form blind spot one round deeper (the r95/r97 fixtures were all single-stream; the bug survived two rounds of green gates). **The fix:** skip past the whole `endstream` token (`streamRe.lastIndex = end + "endstream".length`) · RED 2/2 as designed → GREEN 12/12.

**R98-B the octal escapes (VERIFIED, TDD-FIXED):** PDF strings carry non-ASCII as octal escapes under WinAnsiEncoding (`\227` = em-dash, `\351` = é, curly quotes `\223/\224` — how Word/Acrobat write the characters CVs are full of); the old unescape handled only `\(`, `\)`, `\\`, `\n`, leaving literal `\227` garbage. **The fix:** a single-pass alternation unescape (octal `\ddd` mod-256 + the WinAnsi 0x80–0x9F delta map + Latin-1 0xA0–0xFF + `\n\r\t\b\f` → space + the line continuation `\<EOL>`); the `\\053`-vs-`\053` disambiguation (an escaped backslash followed by digits is NOT an octal escape) pinned by a born-green guard spec — a sequential replace cannot tell them apart, the alternation consumes the escaped-backslash match first. The GREEN-phase catch: the Latin-1 letters (é ñ ü, 0xA0–0xFF) initially mapped to space under the ASCII-only printable check.

**R98-C the lint gate vs generated Playwright artifacts (FIXED, config hygiene):** a failed E2E run leaves trace bundles in `test-results/` (gitignored but NOT eslint-ignored) — the dead first E2E boot (the chromium-1248 reinstall trap re-fired: 150 × 1ms failures until `bunx playwright install chromium`) put 1,948 problems into the lint gate. `test-results/**` + `playwright-report/**` join the eslint ignores (generated artifacts, not source — the web-application skill §3 contract).

**THE E2E LEG (born-green + MUTATION-PROOFED at both layers):** the new `tests/e2e/session98-multistream-cvflow.spec.ts` drives a two-stream PDF (page 2 ALONE carries the job's keyword vocabulary, so a nonzero score PROVES page 2 reached the scorer) with octal escapes in page 1's strings, through the actual UI → the analysis card → the persisted API row → the cleanup. The mutation proofs: R98-A reverted → rebuild → exactly 1 RED (the session98 spec) while the session97 specs stayed green; R98-B reverted → exactly 1 RED (unit) while R98-A + the guard stayed green; both restored → all green.

**THE STANDING CLASSIFICATIONS RE-VERIFIED (no clone change):** the REF-broken mobile set HOLDS (hrreports + interviewassistant empty `#root`; employeeselfservice the loading shell; employeedetail the empty shell; /recruitment renders at 390, scrollW 550) · the mobile-nav cross-side pair PARITY live-verified with the §109 FIXED-AWARE read (the REF's 28×28 `lucide-panel-left` hamburger + its fixed z-50 w=288 h=844 drawer; the clone's `aria-label` + `role=dialog` supersets; the clone's menu cycle open → Training LMS → `/training` + AUTO-CLOSED) · the patch watch HOLD at ^16.4.2 (16.4.3 published; neo-crm now at session-188 — a ZERO-product-code-touch docs round, nothing to adopt) · TW-v4 oklch clean · secrets zero.

**THE LIVE POST-FIX VERIFY:** the real two-stream + octal PDF through the :3200 UI → the analysis card rendered (the "r98 real cv" name + AI score 7/100 + Skills match 8% + the matched keywords) → the candidate swept + the r45-probe user swept (DB pristine: users 1 / jobs 3 / candidates 0).

**THE GATES:** lint 0/0 (with R98-C) · tsc ✓ · 1001/1001 unit (998 + 3 R98) · build ✓ 116/116 · E2E 550/550 (the 549 standing + the 1 new; the final gate ALONE) · the evidence chain (7 r98 PNGs).

**THE ROUND'S TRAPS:** the SERVED-BUILD STALENESS trap (after the mutation proof's source restore, :3200 kept serving the MUTATION BUILD — the live upload "failed" and an hour of debugging chased the browser before `grep` on the served chunk found the reverted `lastIndex=g`; the protocol: the restore step MUST end with a REBUILD before any live :3200 verification) · the self-fulfilling diagnostic (the first live "confirmation" reimplemented the FIXED scan inside the eval — diagnosing the diagnostic, not the served code; the authoritative check reads the served bundle) · the page-1-under-guard coincidence (the live fixture's page-1 text is 39 alnums — under the 40-alnum guard, so a page-2-losing extraction returns `""`, making the live probe STRICTER than the E2E fixture — now a deliberate design property) · the `//`-comment-inside-an-eval trap re-fired (one-lined evals with `//` comments die with `SyntaxError: Unexpected end of input`) · the auth-before-probes order (the standing probes assume `auth-sessions.mjs` ran first).
