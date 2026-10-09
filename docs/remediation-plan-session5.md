# Remediation Plan — Session 5

Parity round 4 + doc alignment. Every gap below was measured live against
`https://eon.base44.app` (dual agent-browser sessions at the default session
= reference, `--session loc` = clone; DOM ground truth — computed styles and
bounding boxes). Reference measurements taken at 1440×900 (desktop) and
390×844 (mobile).

Baseline at session start: lint ✓ (0 errors, 12 pre-existing warnings) ·
tsc ✓ · 52/52 unit ✓ · build ✓ · 78/78 E2E ✓ (commit `4d01f82`).

Audit: secret scan clean; session-4 changes reviewed (Button gradient,
PageHeader badge, sidebar rhythm, login, capture tooling) — all sound.
Stale-doc findings: `CLAUDE.md` still says "`next/font` loads Inter" and
`Project_Architecture_Document.md` still documents an Inter/`--font-inter`
pipeline — both removed in session 4. This session's code changes were
driven purely by fresh live measurements below.

---

## Part 1 — Sidebar (desktop + mobile drawer, shared component)

### S1. Top-level LEAF links (nav-config routes without children)

Reference (computed, `/dashboard`): `h=32, fs=14, fw=400 (500 active),
px=12, py=10, gap=12`, leading icon **16×16**, `rounded-lg`, **`mb-1`** on
the item, list `gap-1` → 40px pitch (141 → 181 → 221 …). Active:
`custom-primary-bg` (#1877F2) + `text-white` + `font-medium` + `shadow-sm`.
Inactive: `text-slate-600`, hover `custom-accent-bg` + `opacity-80`.

Reference CSS ground truth (extracted from live stylesheets):
`:root { --primary-color:#1877f2; --accent-color:#e4e6eb; }`
`.custom-primary-bg { background-color: var(--primary-color) !important }`
`.custom-accent-bg { background-color: var(--accent-color) !important }`

Current clone: leaf links use `px-2 py-2 gap-2` + 20px icons + no `mb-1`
(36px pitch) — this matches the reference's GROUP-BUTTON geometry, not its
leaf-link geometry (session-4 measured the group button and applied it to
both).

Fix `NavLink` in `src/components/layout/sidebar-nav.tsx`:
`flex h-8 items-center gap-3 rounded-lg px-3 py-2.5 text-sm mb-1
transition-all duration-200 hover:opacity-80`, icons `h-4 w-4`,
inactive `text-slate-600 hover:bg-[#e4e6eb]`, active keeps
`bg-primary font-medium text-white shadow-sm`. Result: icon x=32,
text x=60, pitch 40 — byte-equal to reference.

### S2. Group (collapsible) trigger buttons

Reference: `h-8 p-2 gap-2` + **20px** leading icon, 16px chevron, `mb-1`,
`text-slate-600`, hover **`bg-blue-50` + `text-blue-700`** (not slate-100).
Current clone: geometry ✓, hover `bg-slate-100 text-foreground` ✗, no
`mb-1` ✗. Fix the trigger classes; add `mb-1`.

### S3. Sub-list spacing

Reference: 4px gap between the group trigger and the first sub-item
(trigger bottom 213 → first sub y 217). Clone: 0px (177+32=209 = sub y).
Fix: add `mt-1` to the sub-list `ul`. Sub-items themselves already match
byte-exactly (x=36, `px-3 py-2 gap-3`, 16px icons, 36px pitch, active
`bg-primary font-medium text-white`).

### S4. Sidebar brand header

| Property | Reference | Clone | Fix |
|---|---|---|---|
| Row padding | `p-6` (tile x=24) | `px-4` (tile x=16) | `px-4` → `px-6` |
| Brand h2 | `text-lg` 18px/700, `text-slate-900` (#0f172a) | `text-base` 16px, `text-foreground` (gray-900) | `text-lg text-slate-900` |
| "Demo" sub | `text-xs` 12px | `text-[11px]` | `text-[11px]` → `text-xs` |
| gap tile→text | 12px (h2 x=76) | 12px ✓ (x=68 differs only via px) | keep `gap-3` |

Row height 89px, tile 40×40 r12 gradient `#2563EB→#4F46E5` sRGB, border-b
`#e2e8f0` — already byte-equal.

## Part 2 — Mobile chrome

### M1. Mobile top bar (app-shell.tsx)

Reference (390×844): header 73px, `px-6 py-4`, border-b slate-200 — clone
matches. Inside: a **40px content row**: toggle button **28×28 with a 16px
`PanelLeft` icon** (x=24, y=22, vertically centered) + **`<h1>` "EonHR"
16px/700/`leading-6`, `text-slate-900`, x=68, top-aligned** — no "Demo"
sub-line.
Clone: toggle 40×40 with 24px icon, brand `<span>` + "Demo" span.
Fix: toggle `h-7 w-7` + icon `h-4 w-4` (self-center), brand → single
`<h1 className="text-base font-bold leading-6 text-slate-900">EonHR</h1>`
inside a `flex h-10 items-start gap-4` row.

### M2. Mobile bottom tab bar

Reference: labels **`text-sm font-medium`** (14px, lh 21px — clone:
`text-xs` 400), tab height 61 (clone 56), bar height 78 (clone 73), and the
**active tab is highlighted `text-blue-600` (#2563EB)** — icon + label
(the clone renders all tabs slate-600; sessions 2-4 recorded "no active
highlight", which the live site now contradicts).
Fix: label `text-xs` → `text-sm font-medium`; active tab (pathname match,
"Home" active on `/dashboard`) gets `text-blue-600`; base color stays
`text-slate-600`. Icon 20px, `gap-1 px-3 py-2 min-h-[44px]` — unchanged.

### M3. Mobile drawer

288px width, dark overlay, no X button, auto-close on nav — all verified
still matching (the "Close" matches in the ref DOM are the Base44 builder
badge and the user-menu email, both false positives). S1-S4 fixes propagate
into the drawer automatically (shared component). Post-fix verification:
first nav item y=141, leaf pitch 40.

## Part 3 — Page headers (the reference's six measured layout recipes)

The reference does NOT use one uniform header: session-4 consolidated 28
badge pages onto the "raised" recipe. Fresh measurement shows five more
recipes. Ground-truth classes (from live DOM, `text-4xl` = 36px/40 lh,
`text-5xl` = 48px/48 lh):

| Recipe | Badge | h1 | subtitle | y (badge/h1/sub) | Pages |
|---|---|---|---|---|---|
| raised-48 | `mt-8 mb-4` | `text-4xl md:text-5xl … mb-3` | `text-lg text-slate-600` | 64/116/176 | taskmanager, payroll, expenses, leavemanagement |
| raised-36 | `mt-8 mb-4` | `text-4xl … mb-3` | `text-lg text-slate-600` | 64/116/168 | loans |
| flat36 | `mb-4` | `text-4xl … mb-3` | `text-lg text-slate-600` | 32/84/136 | allleaverequests, interviewassistant, offboarding, performancemanagement, workflowautomation, communications, organogram, hrassistantchat, settings |
| flat36-sm | `mb-4` | `text-4xl … mb-2` | `text-slate-600` (16px) | 32/84/132 | recruitment, compliancedashboard |
| flat48 | `mb-4` | `text-4xl md:text-5xl … mb-3` | `text-lg text-slate-600` | 32/84/144 | training, hrletters, surveys, evaluations, companywall, profile |
| flat-tight | `mb-3` | `text-4xl` (no mb) | `text-slate-600 mt-1` | 32/80/124 | shiftcalendar, documenttracker |

(attendance = flat48 plus a reference-only `h1` line-height quirk that makes
its element 96px tall and pushes the subtitle to y=192 — replicated via an
explicit `leading-[2]` override on that page's title.)

Badge text: reference renders the span at **`text-sm font-medium
text-slate-700`** (14px/500/#334155) — session-4 measured the wrapper div
(16px/400/#0a0a0a) and the clone pinned that. Fix the PageHeader span.
Badge icon: wrapper is per-module colored in the reference — the clone
hardcodes `text-blue-600`.

### Per-page icon color map (measured)

| Class (v3 hex) | Routes |
|---|---|
| `text-blue-600` #2563eb | taskmanager, loans, leavemanagement, allleaverequests, attendance, documenttracker, offboarding, companywall, settings, profile |
| `text-green-600` #16a34a | payroll |
| `text-purple-600` #9333ea | expenses, interviewassistant, training, workflowautomation, communications, hrassistantchat |
| `text-indigo-600` #4f46e5 | recruitment, hrletters, performancemanagement, evaluations |
| `text-red-600` #dc2626 | compliancedashboard |
| `text-teal-600` #0d9488 | surveys, organogram |
| `text-violet-600` #7c3aed | shiftcalendar |

Fix: `PageHeader` gains `layout` (recipe enum, default `raised-48` keeps
today's behavior), `iconClassName` (default `text-blue-600`), and
`titleClassName` (attendance override). Every badge page passes its recipe
+ icon class. Unit tests pin the six recipes (y-math encoded via class
presence) and the icon map.

## Part 4 — Verified non-gaps (no action)

- Employees page: h1 30px/700 y=32, CTA 36×165 gradient #2563EB→#4F46E5
  r6 #FAFAFA, search input h36 r6 #e5e5e5 pl-40, table head 14/500
  slate-500 — byte-equal.
- Dashboard: h1 30px y=64, body font stack, canvas gradient, card
  radius-12/border-#e5e5e5 — byte-equal.
- Group trigger geometry (p-2/gap-2/20px icon), sub-item geometry + active
  state, active leaf #1877F2+white+500, nav container 20px inset (flat
  `px-5` = ref's `px-3`+`p-2`), Main Menu 32px row, first nav y=141.
- Drawer 288px/no-X/overlay; bottom-tab set (Home/Staff/Tasks/Attendance/
  Profile) and icons; page h1 "Dashboard" 18px/700 y=101 at mobile.
- Announcements header (h1 24px y=32) — bare recipe, unchanged.
- `chat` — no page header, already restructured in session 4.

## Part 5 — Doc alignment (audit findings)

| ID | Finding | Fix |
|---|---|---|
| DOC-1 | `CLAUDE.md` L48: "`next/font` loads Inter; never import fonts via `<link>`" — Inter was dropped in session 4 | Rewrite: system stack is pinned in `@theme`; do NOT add webfonts |
| DOC-2 | `Project_Architecture_Document.md` L175/L313/L320: Inter/`--font-inter` references | Update to the pinned `ui-sans-serif` stack story |
| DOC-3 | `globals.css` header comment says "All five engine traps" — trap 6 exists | "six engine traps" |

## Part 6 — Execution order (TDD)

1. **R1 token/unit pins first (RED)**: extend `tests/unit/tokens.test.ts`
   with the `--accent-color`/hover geometry contract where CSS-pinnable;
   add a `sidebar-recipes.test.ts` unit spec that parses
   `sidebar-nav.tsx`/`page-header.tsx` sources for the class contracts
   (px-3 py-2.5 gap-3, h-4 icons, mb-1, mt-1 sub-list, badge text-sm
   font-medium text-slate-700, six recipes, icon map).
2. **R2 sidebar-nav.tsx** (S1-S4) → unit GREEN.
3. **R3 app-shell.tsx** mobile header + bottom tabs (M1/M2).
4. **R4 PageHeader recipes + per-page sweep** (Part 3): component first,
   then a scripted per-page `layout`/`iconClassName` sweep over the 26
   badge pages (codemod script, manually reviewed diff).
5. **R5 E2E updates**: mobile-navigation spec gains the bottom-tab
   active-state pin + nav pitch pin (y 181); taskmanager badge-text spec
   (14px/500 slate-700) tightened in navigation spec where present.
6. **R6 docs** (Part 5) + screenshots refresh (capture-all.sh).
7. Full gates: lint → tsc → unit → build → E2E. Live browser re-verify of
   every fixed surface (desktop sidebar, mobile drawer, bottom tabs,
   header recipes on 6+ representative routes). Screenshots to
   `docs/screenshots/`.

All changes on `main`; no new branches.
