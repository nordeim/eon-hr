# Remediation Plan — Session 7 (Parity Round 6: responsive boundary, mobile kickers, inline wizard)

Every gap below was measured live against `https://eon.base44.app` in a dual
agent-browser setup (default session = reference, `--session loc` = clone;
DOM ground truth — computed styles + bounding boxes, both sides measured).
Reference measurements at 1440×900 (desktop), 390×844 (mobile), and
700/767/768/800/900/1024 (breakpoint sweep).

Baseline at session start (fresh clone of remote `3f30e17`): lint 0 errors ·
tsc ✓ · **117/117 unit** (docs said 102 — see E1) · build ✓ · **84/84 E2E**.
Environment: `.env` recreated (`DATABASE_URL="file:../db/custom.db"` + fresh
`AUTH_SECRET`), `bun install`, `db:generate`/`db:push`/`db:seed`; dev server
restarted with `env -u DATABASE_URL` after the exported-env trap silently
pointed the first boot at the sandbox workspace DB (AGENTS.md warning).

Audit: secret scan clean on the session-6 diff; session-6 components
(card/stat-card/empty-state/button/app-shell/globals.css) reviewed sound.
The findings below come from surfaces sessions 1–6 had not measured: the
**768–1023px tablet band**, the **module-page mobile headers**, and the
**Add-Employee wizard's presentation**.

---

## R6-A (Critical) — Responsive boundary: reference switches chrome at md (768px), clone at lg (1024px)

Viewport sweep, chrome visibility (sidebar / mobile top bar / bottom tabs):

| Width | Reference | Clone |
|-------|-----------|-------|
| 700   | mobile    | mobile ✓ |
| 767   | mobile    | mobile ✓ |
| 768   | **desktop sidebar, no mobile chrome** | mobile ✗ |
| 800   | desktop   | mobile ✗ |
| 900   | desktop   | mobile ✗ |
| 1024  | desktop   | desktop ✓ |

The reference's own classes confirm it: bottom nav is `md:hidden`, the
sidebar container is a shadcn-style `w-[--sidebar-width]` div that mounts
from md up. The entire 768–1023px band renders the mobile drawer UI on the
clone where the reference shows the desktop sidebar.

**Fix** — `src/components/layout/app-shell.tsx` (5 classes, nothing else
uses lg: chrome classes; no E2E pins reference 1024):
- aside: `hidden lg:flex lg:flex-col` → `hidden md:flex md:flex-col`
- drawer overlay + drawer content: `lg:hidden` → `md:hidden`
- mobile top bar: `lg:hidden` → `md:hidden`
- bottom tab bar: `lg:hidden` → `md:hidden`

`main` already uses `pb-20 md:pb-0` ✓. The mobile kicker recipe is already
`md:hidden` ✓. (Docs' SKILL §17 breakpoint table must be updated lg→md.)

## R6-B (High) — Mobile page kicker + hidden desktop header on the 7 "category A" routes

Fresh 390×844 sweep of ALL 46 reference routes classified the mobile header
patterns (`scripts/probe-r6-kicker-sweep.sh`, output in
`docs/research-r6-ref-kickers.txt`):

- **Category A (kicker + desktop header hidden below md)** — 7 routes:
  /employees, /payroll, /taskmanager, /leavemanagement, /expenses, /loans,
  /profile. Mobile renders ONLY a sticky kicker: `md:hidden sticky top-0
  z-20 bg-white border-b border-slate-200 px-4 py-3` inside the page
  wrapper (x=16, y=89, w=358, h=53) containing h1 `text-lg font-bold
  text-slate-900 truncate` (18px/700, x=32/y=101). The desktop header
  block is `hidden md:flex items-center justify-between mb-8` — page
  actions (Add Employee, Import CSV, New Leave Request…) are **desktop-only
  on the reference**. /profile is the one variant: kicker + its content h1
  "Profile Settings" stays visible (no hidden wrapper). /dashboard already
  implements this pattern in the clone (session 6) ✓.
- **Category B (full header visible at mobile)** — ~35 routes
  (training, settings, recruitment, compliancedashboard…): the reference
  renders its full desktop header at mobile. The clone already matches ✓.
- **Category C**: /chat — no page h1 either side ✓.

Session 6's conclusion "module pages have no kicker" was a measurement miss
(its E2E pin `module pages render without a mobile kicker` asserts
/taskmanager has 0 sticky divs — the reference /taskmanager HAS a kicker
titled "Tasks & Projects"). That pin must be inverted as part of this fix.

**Fix** — `src/components/shared/page-header.tsx` gains two props:
- `mobileKicker?: boolean` — renders the reference kicker block (same
  recipe as the dashboard's, including the `top-[73px]` sticky offset for
  page-level scroll) with the page `title` as its h1
- `mobileHeader?: "visible" | "hidden"` (default "visible") — adds
  `hidden md:flex` to the desktop header block when "hidden"

Call-site updates (6 pages: employees, payroll, taskmanager,
leavemanagement, expenses, loans → `mobileKicker mobileHeader="hidden"`;
profile → `mobileKicker` only). All other pages unchanged.

## R6-C (High) — Add Employee wizard: the reference renders an INLINE view, not a modal dialog

Measured on the reference (desktop, opened via Add Employee):

```
page content area (max-w-7xl wrapper) — the list is REPLACED by:
├── row: back button 36×36 (icon, x=288/y=46) + h1 "Add New Employee"
│   30px/700 + subtitle "Add a new team member" 16px slate-500
└── div.rounded-xl.border.bg-card.max-w-4xl.mx-auto.border-slate-200 (896×872)
    └── div.p-8 (interior)
        ├── step rail: flex items-center justify-between mb-8 (h=76):
        │   4 × div.flex.flex-col.items-center — 48px circle
        │   (w-12 h-12 rounded-full) with a 24px WHITE lucide icon
        │   [User, Briefcase, FileText, Paperclip] + label p 14px/500 mb-2
        │   below. ACTIVE: circle bg #2563EB, label #2563EB;
        │   INACTIVE: circle bg #E2E8F0 (slate-200), label #64748B.
        │   Connectors ~49px between segments.
        ├── form: 2-col grid (inputs 407×36, 84px row pitch)
        └── footer: Cancel (outline h-9, white bg) left + Next
            (gradient CTA #2563EB→#4F46E5, h-9) right-aligned
```

Back/Next gating identical to the clone's (required fields disable Next —
verified by attempting empty advances). The final step's submit label could
not be reached (the reference's step-2 select wouldn't open under
automation) — keep "Create Employee" as the documented judgment call.

On reference MOBILE the wizard is unreachable (the Add Employee button
lives in the hidden desktop header — R6-B), so the mobile wizard is a
superset surface: responsive inline card (w-full at <sm, 1-col form).

The clone currently opens a modal `Dialog` (max-w-2xl) with a numbered
step rail. Session 2 mirrored the wizard's FLOW (4 steps, Saudi fields,
full-name split) but not its PRESENTATION.

**Fix** — `src/app/(app)/employees/page.tsx` + `employee-wizard.tsx`:
- Employees page gains view state `list | wizard` (add + edit reuse it)
- The wizard renders inline: back button + h1 30px/700 + subtitle, then
  the max-w-4xl card with the icon-circle step rail, 2-col form, and the
  Cancel/Back + Next/Create footer (all `type="button"` — AP-5 rule stays)
- The dialog wrapper is removed; the wizard component keeps its step
  state/validation/submit logic (API + EMP-XXXX flow unchanged)
- E2E: the CRUD spec's `getByRole("dialog")` locators move to main-content
  locators; new pins: inline card max-w-4xl, step-rail circles
  (48px, active blue-600), footer buttons

## R6-D (Low) — Drawer overlay computed-style serialization

Clone `bg-black/80` serializes as `oklab(0 0 0 / 0.8)`; the reference's is
`rgba(0, 0, 0, 0.8)`. Rendered color identical (oklab(0 0 0) IS black) —
but computed-style parity is cheap: switch the overlay to
`bg-[rgba(0,0,0,0.8)]`. No visual change; E2E pins are behavioral and
unaffected.

## R6-E (Low) — Doc drift + lint warnings

- Docs claim 102 unit specs; vitest reports **117** (test.each expansion
  was hand-tallied by `it(` line counts in session 6). Update AGENTS.md,
  CLAUDE.md, README.md with runner-reported counts (and E2E count after
  this session's additions).
- `eslint .` reports 12 warnings (`import/no-anonymous-default-export`) —
  all in `scripts/probe-*.mjs` (session-4/5/6 probe files export anonymous
  default objects). The SKILL pre-ship checklist says "zero warnings" —
  fix the probe scripts (assign to a named const first) or scope eslint to
  ignore generated probes. Decision: fix the scripts (they're repo tools;
  naming them is trivial and keeps the gate honest).

## Verified non-gaps (no action)

- Mobile drawer: 288px/0/0/844, bg #FAFAFA, 80% overlay, no visible X on
  either side (the reference's shadcn `Close` button is rendered but
  invisible — `offsetParent: null`).
- Mobile top bar (73px) and bottom tabs (78px bar, active tab blue-600,
  14px/500 labels) — byte-identical.
- Dashboard mobile kicker — byte-identical (y=89/h=53/18px/700).
- The reference's "New Leave Request" button is a dead control (no dialog,
  no toast) — the clone's working dialog is the documented superset.
- The reference's per-page gradient map, cards, StatCards, empty states —
  session-6 verified; spot-checks during this audit found no regressions.

## Execution order (TDD)

1. **RED unit pins** (`tests/unit/recipes.test.ts` + a new
   `tests/unit/shell-recipes.test.ts`): R6-A md-class contract on
   app-shell source, R6-B PageHeader mobile props (kicker recipe classes +
   hidden-below-md), R6-C wizard inline recipes (max-w-4xl card, 48px
   icon circles, footer button map), R6-D overlay class.
2. **GREEN shell**: app-shell lg→md + overlay rgba (R6-A, R6-D).
3. **GREEN PageHeader + 7 call sites** (R6-B).
4. **GREEN wizard inline conversion** (R6-C) — biggest change; the dialog
   internals (step state, validation, submit) are preserved.
5. **E2E updates**: invert the taskmanager kicker pin; add employees
   kicker + hidden-header pin; md-boundary pin (800px viewport → sidebar
   visible); wizard CRUD spec locators → inline view; overlay pin stays.
6. **Probe-script lint fixes** (R6-E) + doc count updates.
7. **Full gates**: lint → tsc → unit → build → E2E.
8. **Live dual-browser re-verify** of every fixed surface (768/800/900/1024
   chrome, category-A kickers at 390, the wizard at 1440 + 390).
   Screenshots refresh to `docs/screenshots/`.
9. Docs: AGENTS/CLAUDE/README/PAD/SKILL (md boundary, kicker map, wizard
   architecture, counts), `docs/remediation-plan-session7.md` (this file),
   `docs/session_7.md` append, `worklog.md`.

All changes on `main`; no new branches.

---

## Completion record (executed 2026-10-10)

All five remediation items landed, TDD (RED 19/21 first, then GREEN):

- **R6-A** — app-shell lg→md (5 classes); verified live at 767/800/900/1024
  (identical to the reference sweep); E2E boundary pin added.
- **R6-B** — PageHeader `mobileKicker`/`mobileKickerTitle`/`mobileHeader`
  props; 7 call sites updated; live-verified byte-identical (y=89, x=16,
  w=358, h=53, 18px/700 on all 7; profile kicker "Profile" override);
  the inverted taskmanager-kicker E2E pin + category-B regression pin.
- **R6-C** — EmployeeWizard rewritten as an inline view (back + h1 +
  max-w-4xl card: gradient header, 48px icon-circle rail with green
  passed-connectors, 96px photo-upload circle, gap-3 fields on
  md:grid-cols-2, border-t footer); employees page `list | wizard` view
  state; live-verified geometry (h1 y=32/30px, back 36×36 at x=288,
  card x=400/y=128/w=896, rail y=242/h=76, seg w=145, inputs 407×36);
  known residual: ~6px/row label-box slack (the reference's own label
  rendering artifact — card 842 vs 872).
- **R6-D** — overlay `bg-[rgba(0,0,0,0.8)]`.
- **R6-E** — 12 probe scripts de-anonymized (lint now 0/0); doc counts
  corrected everywhere (142 unit + 86 E2E).

Gates after remediation: lint 0 errors + 0 warnings · tsc clean ·
**142/142 unit** · build · **86/86 E2E** · 24 screenshots refreshed · DB
pristine after capture (users=1, employees=1, leaveBalances=2).
