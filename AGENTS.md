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
| Unit tests | `bun run test` (Vitest, 265 specs) |
| E2E tests | `bun run test:e2e` (Playwright, 86 specs — needs `bun run build` first; the runner does NOT build for you) |
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
