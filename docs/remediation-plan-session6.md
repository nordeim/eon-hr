# Remediation Plan — Session 6 (Parity Round 5: content-area recipes)

Every gap below was measured live against `https://eon.base44.app` in a dual
agent-browser setup (default session = reference, `--session loc` = clone;
DOM ground truth — computed styles + bounding boxes, both sides measured).
Reference measurements at 1440×900 (desktop) and 390×844 (mobile), plus
1600×900 for the width-cap probes.

Baseline at session start: lint ✓ (0 errors) · tsc ✓ · 90/90 unit ✓ · build ✓
· 78/78 E2E ✓ (remote `0297e44`, re-validated fresh after merge).

Audit: secret scan clean; session-5 changes reviewed sound; no doc drift
found (session 5 already aligned CLAUDE/PAD/SKILL). This session's code
changes are driven purely by the fresh live measurements below.

---

## Part 1 — Design tokens (globals.css `@theme`)

Extracted the reference's FULL `:root` CSS-variable set from its live
stylesheets (first time captured verbatim):

```
--background: 0 0% 100%        --foreground: 0 0% 3.9%
--card: 0 0% 100%              --card-foreground: 0 0% 3.9%
--popover: 0 0% 100%           --popover-foreground: 0 0% 3.9%
--primary: 0 0% 9%             --primary-foreground: 0 0% 98%
--secondary: 0 0% 96.1%        --secondary-foreground: 0 0% 9%
--muted: 0 0% 96.1%            --muted-foreground: 0 0% 45.1%
--accent: 0 0% 96.1%           --accent-foreground: 0 0% 9%
--destructive: 0 84.2% 60.2%   --border/--input: 0 0% 89.8%
--ring: 0 0% 3.9%              --radius: .5rem
--primary-color: #1877f2  --secondary-color: #42b72a  --accent-color: #e4e6eb
```

The reference's shadcn layer is a PURE-NEUTRAL palette; the slate/blue
rendering comes from explicit utility classes. Rendered deltas to fix:

| ID | Token | LOC today | Reference | Rendered where |
|----|-------|-----------|-----------|----------------|
| T1 | `--color-foreground` (+ card/popover-foreground) | hsl(221 39% 11%) = #111827 | **#0A0A0A** | body text, all card titles (measured #0a0a0a) |
| T2 | `--color-background` | #f8fafc | **#FFFFFF** | outline-button bg (Customize renders white) |
| T3 | `--color-secondary` (+ fg) | #F1F5F9 / hsl(222 47% 11%) | **#F5F5F5 / #171717** | dropdown item hover |
| T4 | `--color-accent` (+ fg) | #DBEAFE-ish / #1877f2 | **#F5F5F5 / #171717** | outline-button hover (hover:bg-accent) |
| T5 | `--color-ring` | #1877f2 | **#0A0A0A** | focus rings |
| T6 | `--color-destructive` | hsl(0 84% 60%) ≈ #EF4343 | **hsl(0 84.2% 60.2%)** = #EF4444 | destructive surfaces |
| T7 | NEW `--color-neutral-900` | — | **#171717** | dark button variant (toggle/empty-state CTAs) |

**Deliberately NOT changed**: `--color-muted-foreground` stays #64748b
(slate-500). The reference's token is #737373 (neutral-400), but every
reference element we measured renders explicit slate classes (Demo/Dashboard
subtitles #64748b, stat labels #475569, empty p #64748b, table heads
slate-500); the neutral token value never visibly renders on any probed
surface. The LOC's 336 `text-muted-foreground` usages currently render the
slate-500 value that the reference actually shows — changing the token would
move all of them OFF parity. Rendered truth wins.

Also verified equal today (no action): sidebar border-r #e2e8f0 (both),
`--border` #e5e5e5 (both), `--primary-foreground` #FAFAFA (both).

## Part 2 — Card component family

### C1. CardTitle (src/components/ui/card.tsx)
Reference (dashboard "My Leave Balances", payroll cards): `div` at
`text-base font-semibold tracking-tight` — fs 16 / fw 600 / **lh 24**
(color #0A0A0A inherited). LOC: `font-semibold leading-none tracking-tight`
renders lh 16 → 24px-tall rows in the reference become 16px (card height
222 vs 218 — the driver). Fix: `text-base font-semibold tracking-tight`
(drop `leading-none`; `text-base` pins 16/24).

### C2. Card root
Reference class: `rounded-xl border bg-card text-card-foreground shadow` —
no explicit border color (the `* { border-border }` base layer supplies
#E5E5E5). LOC adds a redundant `border-[#e5e5e5]`. Same rendered color;
simplify to plain `border` for class parity.

### C3. StatCard rewrite (src/components/shared/stat-card.tsx)
Reference recipe (payroll + analytics measured):

```
Card: rounded-xl border bg-card text-card-foreground shadow border-slate-200
└── div.p-6
    ├── div.flex items-start justify-between mb-3
    │   └── div.{color}-100 p-3 rounded-xl   (48×48 tile, 24px icon, text-{color}-600)
    ├── div.text-3xl font-bold text-slate-900 mb-1   (30px/700 #0f172a)
    └── div.text-sm text-slate-600                  (14px #475569)
```

LOC today: 32px rounded-lg accent tile right-aligned, 16px icon, value
text-2xl #111827 (24px), label text-muted-foreground — every value off.
Measured tile color maps: payroll = green/blue/purple/orange;
analytics = blue/purple/green/orange. Component gains a `tileClassName`
prop; per-page call sites pass measured colors (pages whose reference
counterpart has no stat cards keep the recipe with module-family colors —
superset surfaces, reference-consistent geometry).

### C4. EmptyState rewrite (src/components/shared/empty-state.tsx)
Reference recipe (payroll "No payroll records"):

```
div.p-12 text-center
├── icon 64×64 text-slate-300
├── h3 text-lg font-semibold text-slate-900 mb-2   (18px/600)
├── p  text-slate-500 mb-4                          (16px)
└── button = shadcn DEFAULT variant (bg #171717, #FAFAFA text) — NOT gradient
```

LOC today: 14px/500 muted head, gradient CTA. Full rewrite.

### C5. Dashboard cards (src/app/(app)/dashboard/page.tsx)
- CardHeader restructure: reference renders the standard column header
  `flex flex-col space-y-1.5 p-6 pb-2` whose FIRST child is a
  `flex items-center justify-between` row containing title + link. LOC
  flattens the header itself into a row (`flex p-6 flex-row … space-y-0`).
  After C1 the rendered geometry converges; restructure to the reference
  nesting for class parity.
- Leave-balances value span: `font-medium text-slate-900` → `font-medium`
  (inherits #0A0A0A — measured rgb(10,10,10)).
- Quick-actions grid: `gap-3` → **`gap-2`** (measured 8px gaps; card heights
  222 vs 218 close the delta once C1 + this land).
- Quick Actions CardTitle becomes a direct child (no `space-y-0.5` wrapper).

## Part 3 — Button variant map (src/components/ui/button.tsx)

The reference uses TWO additional button recipes beyond the gradient CTA
and outline:

1. **shadcn default (dark)**: `bg-primary text-primary-foreground shadow
   hover:bg-primary/90 h-9 px-4 py-2` where `--primary` = #171717 → renders
   **#171717 bg, #FAFAFA text**. Measured on: taskmanager Kanban toggle
   (active), payroll empty-state CTA. Add LOC variant `dark`
   (`bg-[#171717] hover:bg-[#171717]/90`).
2. **Per-page gradient CTAs** (measured, all `to right`, sRGB):

| Route | CTA | Gradient |
|---|---|---|
| default (employees, loans, offboarding, assetmanagement, allleaverequests, advancedanalytics) | | #2563EB → #4F46E5 (current default) |
| payroll, payrollmodule, interviewassistant | Add Payroll / Add Payslip / Analyze Interview | #16A34A → #059669 (green→emerald) |
| attendance | Import Attendance | #2563EB → #0891B2 (blue→cyan) |
| compliancedashboard | Run Compliance Scan | #DC2626 → #EA580C (red→orange) |
| hrassistantchat | New Chat | #9333EA → #4F46E5 (purple→indigo) |
| templates | Create Template | #4F46E5 → #9333EA (indigo→purple) |
| workflowautomation | Create Workflow | #9333EA → #DB2777 (purple→pink) |

Add `gradient` variants: `blue` (default), `green`, `cyan`, `red`,
`purple`, `indigo`, `pink` — arbitrary sRGB values per Tailwind v4 trap 3.
(Reference hover does not change the gradient; keep the LOC's darker hover
shades as a superset nicety — resting state byte-equal.)

## Part 4 — Task manager (src/app/(app)/taskmanager/page.tsx)

- **Kanban/Projects toggle**: reference = `div.flex gap-2` containing two
  h-9 buttons — active = shadcn default dark (#171717), inactive = outline
  (`border border-input bg-background shadow-sm hover:bg-accent
  hover:text-accent-foreground`). LOC: pill segmented control
  (`inline-flex h-9 rounded-lg bg-secondary p-1` + 28px inner buttons).
  Replace.
- **Board grid**: reference `grid grid-cols-1 md:grid-cols-5 gap-4` (5
  columns from md up). LOC: `sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`.
- **Column**: reference `space-y-3 rounded-lg p-3` — NO bg, NO border
  (LOC: `rounded-xl border bg-secondary/30`). Header row
  `flex items-center justify-between` (drop px-1), h3
  `font-semibold text-slate-900` (fs 16 — LOC renders 14 text-foreground),
  count chip `inline-flex items-center rounded-md border px-2.5 py-0.5
  text-xs font-semibold bg-slate-100 text-slate-700` (rounded-md 6px,
  font-semibold, slate-700 — LOC: rounded-full, font-medium, #0f172a).
- **Empty column text**: reference renders NOTHING under the header when
  a column is empty (column height = p-3 + header). LOC adds "No tasks"
  (68px). Remove.

## Part 5 — Shell + page architecture

### S1. Shell canvas gradient
Reference: shell root = `div.min-h-screen flex w-full bg-gradient-to-br
from-slate-50 to-blue-50` — gradient painted on the shell div (grows with
content height; body itself is white). LOC: gradient on `<body>` with
`background-attachment: fixed` (viewport-anchored; never completes on tall
pages). Move the gradient to the AppShell root div (same colors:
`linear-gradient(to right bottom, #f8fafc, #eff6ff)` measured identical),
drop the body image + fixed attachment.

### S2. Per-page gradient canvases + wrapper restructure (the big one)
The reference paints a PER-PAGE gradient on each module page's root div
and applies page padding there — `main` itself is bare
(`flex-1 flex flex-col pb-20 md:pb-0`). LOC: uniform
`main.p-4.md:p-8` + `max-w-7xl` wrappers, no page gradients.

Restructure: `main` loses `p-4 md:p-8`; every page gains a root div
carrying its measured gradient + `p-4 md:p-8` (+ `min-h-screen` on
gradient roots), and the existing `max-w-7xl mx-auto gap-8/space-y-8`
wrapper moves inside it. Measured per-route map:

| Route | Root | Wrapper |
|---|---|---|
| dashboard | `p-4 md:p-8 space-y-8` (no gradient, no max-w) | — |
| employees | `p-4 md:p-8` | `max-w-7xl mx-auto` |
| analytics, announcements (`space-y-6` on root), recruitmentkanban (`p-4 md:p-8 space-y-6`), templates (root `p-4 md:p-8`) | plain root | `max-w-7xl mx-auto` (analytics `space-y-8`; templates no space-y) |
| taskmanager, leavemanagement, settings, reports, advancedanalytics, companywall, chat (wrapper no space-y), loans, offboarding | `min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8` | `max-w-7xl mx-auto space-y-8` |
| profile | same slate→blue | **`max-w-5xl`** `mx-auto space-y-8` |
| securitysettings | same slate→blue | **`max-w-4xl`** `mx-auto space-y-8` |
| payroll | `from-green-50 to-blue-50` | `max-w-7xl mx-auto space-y-8` |
| payrollmodule | `from-green-50 to-emerald-50` (+ root space-y-8) | — |
| payrollengine | `from-emerald-50 to-teal-50` | `max-w-7xl mx-auto space-y-6` |
| training, communications, expenses (`from-purple-50 to-pink-50`), hrassistantchat (wrapper no space-y) | `from-purple-50 to-blue-50` (expenses: pink) | `max-w-7xl mx-auto space-y-8` |
| interviewassistant | `from-purple-50 to-indigo-50` | `max-w-7xl mx-auto space-y-8` |
| recruitment | `from-indigo-50 to-blue-50` | `max-w-7xl mx-auto space-y-8` |
| allleaverequests, documenttracker (wrapper space-y-6) | `from-blue-50 to-indigo-50` | `max-w-7xl mx-auto space-y-8` |
| attendance | `from-blue-50 to-cyan-50` | `max-w-7xl mx-auto space-y-8` |
| attendancedashboard | `from-blue-50 to-cyan-50` + root space-y-8 | — |
| evaluations, hrletters | `from-indigo-50 to-purple-50` | `max-w-7xl mx-auto space-y-8` |
| compliancedashboard | `from-red-50 to-orange-50` | `max-w-7xl mx-auto space-y-8` |
| organogram, surveyanalytics | `from-teal-50 to-green-50` / `from-teal-50 to-slate-50` (+ root space-y-8) | — |
| surveys | `from-teal-50 to-cyan-50` | `max-w-7xl mx-auto space-y-8` |
| shiftcalendar | `from-violet-50 to-indigo-50` | `max-w-7xl mx-auto space-y-6` |
| performancemanagement | `from-slate-50 to-indigo-50` | `max-w-7xl mx-auto space-y-8` |
| workflowautomation | `from-slate-50 to-purple-50` | `max-w-7xl mx-auto space-y-8` |
| hrreports | (no root) | `p-6 space-y-6 max-w-7xl mx-auto` |
| notificationpreferences | (no root) | `p-6 max-w-3xl mx-auto space-y-6` |
| workflowconfigpage | (no root) | `p-6 max-w-5xl mx-auto` |
| staffrequests | combined root: `p-4 md:p-8 max-w-7xl mx-auto space-y-6` | — |
| assetmanagement, surveyanalytics | root `p-4 md:p-8 space-y-8 min-h-screen bg-…` | — |
| employeeselfservice | reference page is broken (stuck loading — known ref defect) | keep LOC structure |

All gradients use the v3-pinned `*-50` hexes via `bg-[linear-gradient(to
right bottom, X, Y)]` arbitrary form (trap 3) — the ref's own oklab-free
v3 output renders `linear-gradient(to right bottom, rgb(a), rgb(b))`.

`main` keeps `pb-20 md:pb-0` (bottom-tab clearance) and stays the sticky
context for the top bar.

### S3. Mobile dashboard kicker (dashboard/page.tsx)
Reference (mobile): `div.md:hidden.sticky.top-0.z-20.bg-white.border-b
.border-slate-200.px-4.py-3` inside the page's p-4 wrapper (inset 16px —
NOT full-bleed), containing `flex items-center gap-3 > div.flex-1.min-w-0 >
h1.text-lg.font-bold.text-slate-900.truncate "Dashboard"` (title x=32,
y=101, 18px/700). It STICKS below the 73px top bar while content scrolls
(the session-3 "overflow-hidden ancestor" conclusion was wrong — the
ancestor is `overflow-auto`; sticky works). LOC: static `py-3` bar without
internal padding, scrolls away. Fix: reference classes + sticky
`top-[73px]` (the LOC's page-level scroll needs the explicit offset to
land below the sticky top bar, which is exactly 73px at mobile).

### S4. Sidebar user name (sidebar-nav.tsx)
Reference renders the UserMenu name at `rgb(15,23,42)` (slate-900) — LOC
`text-foreground` (#111827). Fix: `text-slate-900`.

## Part 6 — Verified non-gaps (no action)

- Leave-balance rows (label slate-600 / value font-medium inherit,
  254×32 rows, h-2 bars blue/green) — byte-equal once tokens land.
- Expense card "0 SAR total" block (24px/700 #0f172a + 14px #64748b span)
  — byte-equal.
- Quick-action chip classes (border slate-200, p-3, gap-2, 16px blue-600
  icons, text-sm slate-700) — byte-equal.
- Customize outline button (h-9, 36×~140, gear icon) — geometry equal
  (bg/hover colors converge via T2/T4).
- Top bar (73px, sticky, z-10), bottom tabs, drawer 288px — session-5
  verified, unchanged.
- Page-header recipes (six layouts + icon map) — session-5 byte-verified;
  re-probe spot-checks after the wrapper codemod.
- Brand tile + avatar gradients (#2563EB→#4F46E5, #3B82F6→#6366F1).
- Employee wizard, E2E CRUD — functional, untouched.

## Part 7 — Execution order (TDD)

1. **RED unit pins** (tests/unit): extend `tokens.test.ts` (T1–T7) and
   `recipes.test.ts` (C1–C5, Part 3 variant map, Part 4 board recipe,
   Part 5 gradient/wrapper map, S3 kicker, S4 user name).
2. **GREEN tokens** (globals.css) → token tests.
3. **GREEN components**: card.tsx (C1/C2), stat-card.tsx (C3),
   empty-state.tsx (C4), button.tsx (Part 3), sidebar-nav.tsx (S4).
4. **GREEN pages**: dashboard (C5 + S3), taskmanager (Part 4), per-page
   StatCard/EmptyState/CTA call-site sweeps, then the S2 wrapper codemod
   (scripted per-route map over all 45 pages, manually reviewed diff).
5. **E2E updates**: dashboard card-geometry pin (222px card), mobile
   kicker sticky pin, taskmanager board pins (md:grid-cols-5, chip
   rounded-md font-semibold, no empty text).
6. **Full gates**: lint → tsc → unit → build → E2E.
7. **Live dual-browser re-verify** of every fixed surface (dashboard cards,
   payroll stats/empty, taskmanager board, per-page gradients, kicker at
   mobile, 1600px width probes). Screenshots refresh to `docs/screenshots/`.
8. Docs: AGENTS/CLAUDE/README/PAD/SKILL/session log/worklog.

All changes on `main`; no new branches.
