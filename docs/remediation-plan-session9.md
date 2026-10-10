# Remediation Plan — Session 9 (Parity Round 8: header recipes, actions alignment, employees filter row, page-root repair)

Every gap below was measured live against `https://eon.base44.app` in a dual
agent-browser setup (default session = reference, `--session loc` = clone;
DOM ground truth — computed styles + bounding boxes, both sides measured).
Reference measurements at 1440×900 (desktop) and 390×844 (mobile).

Baseline at session start (workspace continuing from remote `6787f8e`):
lint 0 errors + 0 warnings · tsc ✓ · **144/144 unit** · build ✓ · **86/86
E2E** — the session-8 push state, re-validated from scratch.

Environment: `.env` present (`DATABASE_URL="file:../db/custom.db"` +
`AUTH_SECRET`), `db/custom.db` + `db/e2e.db` at the repo root (db-path
contract honored; the shell's exported absolute `DATABASE_URL` unset for
the build legs per the AGENTS.md rule).

## Audit context

Audit scope per the user's brief: repo skills consulted
(`skills/skills-catalog.md` → `code-review-and-audit` methodology —
secret scan clean on the session-8 diff, no `any`/empty-catch/eval/
`dangerouslySetInnerHTML`/`@ts-ignore` in `src/`, `process.env` reads
confined to server-only seams; `agent-browser` skill for the dual-browser
sweep; `tdd-workflow` for the fix cycle; the avant-garde mobile-nav
failure taxonomy A–H re-checked — no class A–H failure present).

**Headline: the live reference has been redeployed since session 8.**
The mobile navigation surface the user prioritized was re-audited
end-to-end and is byte-identical at rest (top bar 73px, 5 bottom tabs
61px, drawer 288×844 `#FAFAFA` + `rgba(0,0,0,0.8)` overlay, submenu
expansion, category-A kicker geometry y=89/h=53/w=358 18px/700, 800px
boundary, wizard 896×872 @ (400,128) with 97×36 Next, dashboard cards
y=160/h=222 + y=406/h=162, login card 448 / slate-900 sign-in / 48px
fields). The gaps below are all NEW drift introduced by the reference's
redeploy (its header recipes, kicker stickiness, and employees filter
row changed) plus two latent clone defects this audit exposed.

---

## Gaps found (the fixes)

### R8-A (High) — PageHeader action buttons are top-aligned; the reference centers them in the header block

Reference header rows are `… justify-between items-center` — the actions
cluster is **vertically centered in the whole header block**:

| Page (recipe) | Ref block h | Ref action y | Clone action y |
|---|---|---|---|
| /taskmanager (raised-48) | 140px | **116** (= h1 row) | 32 |
| /payroll (raised-48) | 140px | **116** | 32 |
| /employees (bare, 64px block) | 64px | **46** | 32 |

The clone's row is `sm:items-start`, so every action button floats at the
top of the header — an 84px vertical offset on raised pages. Additionally
the reference's actions cluster is `flex gap-3` (12px between buttons,
Import CSV 145 + 12 + Add 165 = 322px) while the clone uses `gap-2`
(8px → 310px).

**Fix** — `src/components/shared/page-header.tsx`:
`sm:items-start` → `sm:items-center` on the header row; actions wrapper
`gap-2` → `gap-3`. One component, every page with actions aligns.

### R8-B (Medium) — Four pages render centered headers in the reference

`/training`, `/evaluations`, `/companywall`, `/organogram` wrap their
header block in `text-center` on the reference (badge + h1 + subtitle all
`text-align: center`, measured both sides). The clone renders them
left-aligned.

**Fix** — `PageHeader` gains a `centered?: boolean` prop that adds
`text-center` to the title block (the badge is inline-flex, so the
parent's text-align centers it exactly like the reference); the four call
sites pass `centered`.

### R8-C (Medium) — Nine pages carry the wrong header recipe

Fresh desktop measurements (all re-verified with long waits — not loading
races):

| Route | Reference (measured) | Clone (now) | Fix |
|---|---|---|---|
| /payrollengine | badge "Payroll Engine" **flat-tight** (badge y=32, h1 y=80, 36px), Calculator icon **emerald-600 #059669** | raised-48 (y=116, 48px), Calculator blue-600 | `layout="flat-tight"`, `iconClassName="text-emerald-600"` |
| /advancedanalytics | badge "Advanced Analytics" **flat36** (y=84, 36px), TrendingUp blue-600 | raised-48 | `layout="flat36"` |
| /securitysettings | badge "Security Configuration" **flat36**, **Shield** icon blue-600 | raised-48, ShieldCheck | `layout="flat36"`, icon `Shield` |
| /reports | badge **"HR Reports & Analytics"** (FileText, blue-600) + h1 "Reports" **flat36** | no badge, bare 30px h1 at y=32 | add badge + `layout="flat36"` |
| /recruitmentkanban | bare h1 **24px** at y=32 | 30px | `size="md"` |
| /hrreports | bare h1 **24px** at y=24 | 30px | `size="md"` |
| /staffrequests | bare h1 **24px** at y=32 | 30px | `size="md"` |
| /notificationpreferences | bare h1 **24px** at y=24 | 30px | `size="md"` |
| /workflowconfigpage | bare h1 **24px** at y=24 | 30px | `size="md"` |

(`/announcements` already renders 24px and matches — the `size="md"`
recipe exists.)

### R8-D (High) — /analyticsdashboard has NO page root (latent clone defect)

The clone renders its content wrapper directly under `main` — **no
gradient canvas, no padding** (h1 at y=0, content flush to the viewport
top). The reference's root: `p-4 md:p-8 space-y-8 min-h-screen
bg-gradient-to-br from-slate-50 to-blue-50` (slate→blue, sRGB) — this
route was missed by the session-6 S2 wrapper codemod (it is absent from
the S2 route table in `docs/remediation-plan-session6.md`).

**Fix** — `src/app/(app)/analyticsdashboard/dashboard.tsx`: wrap the
existing `mx-auto flex w-full max-w-7xl flex-col gap-8` wrapper in
`min-h-screen bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)] p-4
md:p-8` (same pattern as the attendancedashboard sibling).

### R8-E (Medium) — /employees filter row structure

Reference (measured desktop + mobile):

```
div.bg-white.rounded-xl.shadow-sm.border.border-slate-200.p-4.mb-6   ← card
└── div.flex.flex-col.md:flex-row.gap-4.items-center.justify-between ← interior
    ├── div.flex.gap-2.w-full.md:w-auto                              ← row 1
    │   ├── div.relative.flex-1.md:flex-none                         ← search wrap
    │   │   └── input …pl-10.w-full.md:w-64 bg-transparent           ← 256px @md
    │   └── select.px-3.py-2.border.border-slate-300.rounded-lg.text-sm ← NATIVE, 125×36
    └── div (toggles): List + Grid3x3, h-8 px-3 → 42/40×32
```

Desktop: [search 256 + native select 125] left, toggles right (y=147).
Mobile: [search flex-1 + select 125] on row 1 (y=159), toggles centered
below (x=150). Card→content gap **24px** (mb-6), header→card 32px (mb-8).

Clone today: search `flex-1` fills 834px, Radix select 160px pushed to
the far right, `LayoutGrid` toggle icons at 32×32 `size="iconSm"`, all
interior rows stacked `gap-3`, card→content 32px (wrapper gap-8).

**Fix** — `src/app/(app)/employees/page.tsx` filter bar:
- card: `rounded-xl border border-slate-200 bg-white p-4 shadow-sm mb-6`
- interior: `flex flex-col gap-4 items-center justify-between md:flex-row`
- search wrapper `relative flex-1 md:flex-none`, input
  `w-full md:w-64 bg-transparent` (keep pl-10 search icon)
- status filter becomes a **native `<select>`** with the reference's
  classes (`h-9 px-3 py-2 border border-slate-300 rounded-lg text-sm`)
  — the reference renders a native select (OS-gray `#EFEFEF` bg, 125px)
  and a Radix trigger cannot reproduce that geometry
- toggles: `List` + **`Grid3x3`** icons (reference icon set), `h-8 px-3`
  buttons instead of `size="iconSm"`
- page wrapper drops `gap-8`; the PageHeader gets `mb-8` (via
  `className`), the card carries `mb-6` — reproduces 32/24 exactly.

### R8-F (Low) — /templates subtitle is a live count on the reference

Reference subtitle: "0 templates available" (dynamic, 16px slate-500).
Clone: static "Create reusable onboarding task templates".

**Fix** — the templates page passes
`subtitle={`${rows.length} template${rows.length === 1 ? "" : "s"} available`}`
(the page already loads the rows; proper pluralization is the
production-quality choice for the n=1 case the reference's empty DB
cannot show).

### R8-G (Medium) — Mobile kicker no longer sticks on the reference

The reference's kicker is now `md:hidden sticky top-0 z-20 …` INSIDE a
`flex-1 overflow-auto > relative overflow-hidden` wrapper stack whose
scrollport never scrolls — measured on both /dashboard and /employees at
390×844: the **window** scrolls (wheel + touch), no scrollable ancestor
exists, and the kicker scrolls away with the content (kicker y=-89 at
scrollY=178; the 73px header stays). The clone's kicker
(`sticky top-[73px]`, pinned by unit + E2E specs since session 6) stays
fixed under the top bar — a visible difference in the scrolled state
(the reference shows 53px MORE content).

Sessions 6–8 measured `top-[73px]` on the then-current reference; the
redeploy changed it. Visual parity mandate → match the rendered truth.

**Fix** — `page-header.tsx` kicker: drop `sticky top-[73px] z-20`
(keep `md:hidden border-b border-slate-200 bg-white px-4 py-3` + the
18px/700 h1). Invert the unit pin and the E2E sticky assertion to pin
the non-sticky behavior.

## Verified non-gaps / deliberate deviations (no action)

- **Drawer auto-close**: the reference's drawer now STAYS OPEN after
  link navigation (3/3 trials: Dashboard, Training LMS, Assets, Staff
  Requests — overlay + sheet remain visible; only Escape/overlay closes
  it). The clone auto-closes on route change. **Kept as the documented
  functional superset** — a drawer that stays open after selecting a
  destination is broken mobile UX (same category as the /Dashboard
  case-fix and the mobile training overflow: replicate the good, fix
  the broken, document the deviation).
- **/employeeselfservice on the reference is broken** — stuck on
  "Loading your profile…" forever (8s+ wait, still loading). Clone
  renders the page. Known reference defect (documented since session 6).
- **/hrreports on the reference renders BLANK at mobile** (no top bar,
  no content, docH=844, body text = builder badge only). Clone renders
  normally — superset.
- **/employees empty state**: with 0 employees the reference renders
  NOTHING below the filter card (empty grid, no empty-state copy); the
  clone renders its EmptyState card. Kept — helpful empty states are a
  core superset behavior pinned by exact reference-measured copy from
  earlier sessions.
- **/advancedanalytics mobile badge wraps to 56px** on the reference
  (content wraps in the constrained pill at 390px); the clone's badge
  renders 36px like every other page. Not replicated (a wrapped badge
  is a reference quirk, not a recipe).
- **Dashboard card titles**: the reference uses `<div>` for card titles;
  the clone uses `<h3>` (better a11y, same rendered geometry 222px).
- All six Tailwind v4 traps remain pinned (token + recipe tests green);
  no `bg-gradient-to-*` utilities exist in `src/` outside CSS comments;
  mobile-nav failure taxonomy A–H: no failures.

## Execution order (TDD)

1. **RED unit pins** — extend `tests/unit/shell-recipes.test.ts` with a
   session-9 block: actions `sm:items-center` + `gap-3` (R8-A),
   `centered` prop + 4 call sites (R8-B), the 9-page recipe matrix
   (R8-C, extend `tests/unit/recipes.test.ts` BADGE_PAGES + size map),
   analyticsdashboard root (R8-D), employees native-select filter row
   (R8-E), templates count subtitle (R8-F), non-sticky kicker (R8-G —
   inverts the session-7 pin).
2. **GREEN** — the component + page edits above.
3. **E2E** — update `tests/e2e/mobile-navigation.spec.ts` kicker pin
   (sticky → static); the wizard CRUD spec must stay green; sweep the
   navigation spec (titles unchanged).
4. **Full gates**: lint → tsc → unit → build → E2E.
5. **Live dual-browser re-verify** of every fixed surface (actions y on
   raised/flat/bare pages, the 9 recipe pages, centered headers,
   analyticsdashboard canvas, employees filter row at desktop + mobile,
   kicker scroll behavior) + mobile-nav regression re-check.
6. Screenshots refresh + docs updates (AGENTS.md recipe notes, session
   log, worklog, README counts if specs change).
7. `.env.example` re-verified (no change expected).

All changes on `main`; no new branches.

---

## Completion record (executed 2026-10-10)

All seven remediation items landed, TDD (20 RED pins first, then GREEN;
one follow-up correction during live verify):

- **R8-A** — header row is now `sm:items-center` with the actions cluster
  `flex gap-3`; the raised recipes moved their 32px offset from the badge
  to the ROW (`recipe.row: "mt-8"`, badge pages only — the first GREEN
  attempt centered against a 172px row because the mt-8 still lived on
  the badge; re-measured and corrected the same session). Live-verified:
  taskmanager row y=64/h=140 with the button at y=116 (ref 116);
  employees' Add Employee at y=46 (ref 46).
- **R8-B** — `PageHeader` gained `centered` (title block `text-center`);
  training, evaluations, companywall, organogram pass it. Live-verified
  center on all four (y=84, 48/36px like the ref).
- **R8-C** — payrollengine flat-tight + emerald-600 Calculator badge
  (y=80/36px ✓); advancedanalytics flat36 (y=84 ✓); securitysettings
  flat36 with Shield (y=84 ✓); reports carries the "HR Reports &
  Analytics" FileText badge on flat36 (badge y=32, h1 y=84 ✓); the five
  small pages render 24px (`size="md"`): recruitmentkanban y=32,
  hrreports y=24, staffrequests y=32, notificationpreferences y=24,
  workflowconfigpage y=24 — all byte-identical to the fresh reference
  measurements.
- **R8-D** — /analyticsdashboard now paints
  `min-h-screen bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)]
  p-4 md:p-8` around its content wrapper. Live-verified: the computed
  gradient serializes
  `linear-gradient(to right bottom, rgb(248, 250, 252), rgb(239, 246,
  255))` — byte-identical to the reference; h1 y=32 (was y=0).
- **R8-E** — the employees filter card restructured to the reference:
  card y=128 with border-slate-200 bg-white p-4 shadow-sm mb-6; desktop
  search 256px (md:w-64, bg-transparent) + NATIVE select 125×36 @ x=569
  + toggles right; mobile search 191 + select 125 @ y=159 with centered
  toggles at y=211 (x≈150-200); card→content gap 24px (was 32); Grid3x3
  replaces LayoutGrid. Live-verified byte-identical at both breakpoints.
- **R8-F** — templates subtitle renders "0 templates available" with the
  seeded empty DB (dynamic count, proper pluralization).
- **R8-G** — the mobile kicker is a static bar in both the PageHeader
  component and the dashboard's own kicker. Live-verified: static, y=89,
  h=53 at rest; scrolls to y=-89 at scrollY=178 — the reference's exact
  rendered behavior (the 73px top bar is the only sticky chrome).

Gates after remediation: lint 0 errors + 0 warnings · tsc clean ·
**164/164 unit** (20 new session-9 pins; two stale session-6/7 sticky
pins inverted) · build · **86/86 E2E** (the dashboard/category-A kicker
specs re-pinned to the static behavior). 24 screenshots refreshed via
capture-all (production standalone build); DB pristine after capture
(users=1, employees=1, leaveBalances=2). Mobile navigation re-verified
after the fixes: top bar, drawer geometry, submenu expansion, bottom
tabs, boundary — all unchanged and matching the reference.
