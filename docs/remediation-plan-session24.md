# Remediation Plan — Session 24 / Parity Round 23

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app)
**the cursor + selection/caret dimension audit** — the never-swept interaction
layer per session_38's suggested next steps ("the cursor dimension (`cursor:`
states were never swept), the selection/caret dimension (`::selection` /
caret-color)"). Method: static CSSOM enumeration (blind on REF — its rules
live behind an unreadable sheet, so computed DOM census is the ground truth,
per clone-app-pat-pro) + live computed `cursor`/`user-select`/`caret-color`
census on 4 surfaces + element-level parent-chain walks (Chrome inherits
user-select, so the chain pinpoints the authoring element) + a full 46-route
user-select classification sweep + login-page census via throwaway sessions.

Standing audits this round: **redeploy check PASSED** (12 canonical routes,
h1 text/font/x/y byte-identical — REF unchanged since round 22). **Mobile
navigation audit PASSED byte-identical** (top bar 390×73, tabs
10/79/139/204/313, drawer 288×844 #FAFAFA z-50, kickers 53/69, md boundary
767/800 — no Tailwind v4 bug). **With-data re-check**: REF still renders
zero data (0 rows, empty table) — the frontier stays blocked.

## The cursor + selection map (measured)

**Buttons — the systemic gap**: EVERY REF button computes `cursor: pointer`
(sidebar group toggles, header bell/moon/عربي/user trigger, dialog
Cancel/Submit/Close, login socials + Sign in + Forgot password — 100% of
measured buttons, all enabled). EVERY LOC button computes `cursor: default`
except tabs/switches (they carry explicit `cursor-pointer` utilities) and
the dashboard CTA tiles (explicit `cursor-pointer`). Root cause: Tailwind
v3's preflight (REF's engine) ships `button { cursor: pointer }`; **v4's
preflight removed it** (a documented v4 breaking change). The clone never
re-authored it. Fix: one base-layer rule in globals.css.

**user-select — the touch-pan-y wrapper discovery**: REF wraps page content
in `div.touch-pan-y` (between `div.relative.overflow-hidden` and the page
root) which computes `user-select: none`. Chrome inherits user-select, so
ALL page content (h1, cards, CTA tiles, table text, INPUTS) computes none
on the wrapped pages, while portaled surfaces (dialogs, dropdowns, the
drawer) escape to auto. The clone has no equivalent — everything computes
auto. The 46-route sweep classifies REF: **exactly 8 routes are
none-wrapped** — /dashboard, /employees, /payroll, /attendance,
/leavemanagement, /expenses, /loans, /taskmanager (the base44 core-module
family). The other 37 content routes compute auto (REF per-page
inconsistent — its /settings, /compliancedashboard, /profile render the
tabs directly in the page root with NO touch-pan-y layer; /chat has no h1;
/employeeselfservice is REF's dead spinner page).

**Chrome recipes (element-level)**: REF moon (theme toggle) = self-authored
`select-none` + pointer — the clone's moon already carries `select-none` ✓
(only the cursor differs → covered by the base rule). REF bell/عربي/user
trigger/group toggles = auto + pointer (the clone matches on user-select;
cursor via the base rule). REF "Customize" (an <a> in the page content
DOM) = pointer + none — the clone renders CustomizeButton inside the
/dashboard page root, so the page-root select-none covers it. REF
attendance tabs = none (inside the wrapped page content) vs the clone's
auto — also covered by the page-root fix.

**Verified matches (no action)**: caret-color rgb(10,10,10) on every
measured input both apps; input cursor `text`/`default` per type both
apps; links pointer (UA default) both apps; tabs/switch cursor pointer
both apps; `::selection` — REF authors zero measurable ::selection rules
and selection applies identically (selCount/geometry match on the h1
empirical test); dialog buttons user-select auto (portal escape) both
apps; table th/td cursor auto both apps; kanban — zero `[draggable]`
elements on either app (pointer-event dragging, not attribute).

**Blocked/unmeasurable (documented)**: checkbox focus/cursor recipe (zero
checkbox surfaces on zero-data REF); `[role=option]` cursor (the synthetic
select-open click did not register the listbox); disabled-button cursor
(REF renders no disabled button on any measurable surface — the loans
Submit Request computes pointer/enabled at an empty form).

## Gap groups

- **R23-A (the button cursor — systemic)**: add to globals.css `@layer
  base`: `button { cursor: pointer }` — restores the v3 preflight contract
  REF computes everywhere. Layer safety: v4 utilities (e.g.
  `disabled:cursor-not-allowed` on switch/inputs) sit in the utilities
  layer and keep beating the base layer, so existing
  cursor-not-allowed surfaces are unaffected. Covers: sidebar group
  toggles, header bell/moon/عربي/user trigger, all page-action buttons,
  dialog buttons, login buttons — every <button> in the tree.
- **R23-B (the 8-page select-none contract)**: add `select-none` to the
  page ROOT div of exactly the 8 REF-wrapped routes — /dashboard
  (`p-4 md:p-8 space-y-8`), /employees (`p-4 md:p-8`), /payroll,
  /attendance, /leavemanagement, /expenses, /loans, /taskmanager (each
  `min-h-screen bg-[gradient] p-4 md:p-8`). Everything inside inherits
  none like REF (h1, cards, CTAs, inputs); the shell chrome (sidebar,
  top bar, bottom tabs) and portaled surfaces (dialogs, dropdowns,
  drawer, toasts) stay auto — matching REF's computed map exactly. The
  38 auto routes are pinned NEGATIVELY (settings as the representative)
  to lock the scope.

## Verified non-gaps (documented, no action)

- caret-color (rgb(10,10,10) both), ::selection (zero authored rules,
  identical empirical application), input cursor text/default per type,
  tab/switch pointer, link pointer, table cell auto, kanban no-draggable.
- The moon's select-none (clone already matches), the bell/عربي/user
  auto user-select (match), the CTA tiles' explicit cursor-pointer (match).
- The 38 auto pages (REF renders them unwrapped; the clone already
  matches — pinned to prevent over-fixing).
- Dialog/dropdown portal user-select auto (library parity — Radix portals
  escape the page root exactly like REF's).
- /announcements + /hrletters `btn:-/auto` — REF renders no live button
  in main on zero data (the clone's working controls are the documented
  superset; user-select matches on both).

## Execution order (TDD)

1. RED pins (`tests/unit/recipes.test.ts` session-24 block):
   - globals.css: the base-layer `button { cursor: pointer }` rule exists
     inside @layer base
   - the 8 page roots carry `select-none` (dashboard, employees, payroll,
     attendance, leavemanagement, expenses, loans, taskmanager)
   - the scope lock: settings page root does NOT carry select-none (the
     38-route auto contract)
2. GREEN: globals.css + the 8 page-root className edits.
3. Gates: lint → typecheck → unit → build → E2E (86) — restart :3200
   after the build (the stale-server lesson).
4. Live dual-browser verification: the cursor census re-run (buttons
   pointer on the previously-default surfaces: group toggles, header,
   login), the user-select sweep re-run (8 routes none, settings auto),
   the attendance tabs now none, the loans dialog buttons stay
   auto/pointer (portal), the mobile chrome regression + canonical
   12-route redeploy sweep (cursor/user-select changes must not move
   geometry).
5. Screenshots: the dashboard CTA hover with the pointer cursor visible
   (the round's core evidence), the text-selection attempt on a wrapped
   card vs an unwrapped page, + 2 standards refreshed → docs/screenshots/.
6. Docs: AGENTS session-24 layer + counts, SKILL §36 + counts, PAD [S24],
   CLAUDE/README counts, session log (docs/session_39.md is the prior
   round's transcript — this round writes docs/session_40.md), worklog,
   this plan's completion record.

## Documented non-goals / supersets kept

- No changes to checkbox/option/disabled cursor recipes (unmeasurable on
  zero-data REF — the standing blocked list).
- No select-none beyond the 8 routes (REF's own 38 auto pages stay auto).
- No ::selection rules authored (REF authors none; browser defaults match).
- The CTA tiles keep their explicit cursor-pointer utilities (they now
  coincide with the base rule — harmless, and pinned by earlier rounds).

## Completion record (session 24)

Both gap groups executed TDD-first (5 new pins in tests/unit/recipes.test.ts,
all RED before implementation → GREEN; one mid-flight correction — the first
B1/B2 draft pinned the pre-fix root strings and passed vacuously, rewritten
to pin the post-fix contract — the r19/r20/r22 false-green lesson):

- **R23-A**: `@layer base { button { cursor: pointer } }` authored in
  globals.css (with the v4-preflight-removal comment). Live-verified:
  13/13 + 18/18 + 20/20 + 15/15 buttons pointer across /dashboard,
  /employees, /settings, /payroll; login 6/6 pointer; tabs/switches
  unchanged (already pointer via utilities); the
  `disabled:cursor-not-allowed` surfaces unaffected (utilities beat base
  in the v4 cascade).
- **R23-B**: `select-none` added to exactly the 8 REF-wrapped page roots
  (dashboard `p-4 md:p-8 space-y-8`, employees `p-4 md:p-8`, and the six
  `min-h-screen` gradient roots). Live-verified: the 8 routes compute
  none (h1 + attendance tab + employees search input); settings,
  compliancedashboard, profile stay auto (the 38-route contract, pinned
  negatively); the loans dialog buttons stay auto + pointer (portal
  escape); the canonical 12-route geometry sweep 12/12 MATCH + the mobile
  top bar 390×73 — zero layout impact.

Gates: lint 0/0 · tsc ✓ · 416/416 unit (+5) · build ✓ · 86/86 E2E.
3 evidence screenshots (78/79/80) + 2 standards refreshed → 95 total.
DB pristine (users=1, employees=1, leaveBalances=2, payroll=0,
expenses=0).
