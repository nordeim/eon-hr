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
| Unit tests | `bun run test` (Vitest, 457 specs) |
| E2E tests | `bun run test:e2e` (Playwright, 93 specs — needs `bun run build` first; the runner does NOT build for you) |
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
