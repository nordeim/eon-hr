# Remediation Plan — Session 27 / Parity Round 26

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app)
with `agent-browser set media reduced-motion` emulation for the motion
dimension. Standing audits first: **redeploy check PASSED** (12 canonical
routes, h1 text/font/x/y byte-identical — REF unchanged since round 25);
**mobile navigation audit PASSED** (direct measurement — strip 342×40
transparent @ (24,16) both, hamburger 28×28 @ (24,22) both, tabs
x=10/79/139/204/313, drawer 288×844 #FAFAFA z-50, kicker "Dashboard" y=101
h=28 fs=18px, 800px brand H2 x=76 y=25 18px/700 both — no Tailwind v4 bug);
**with-data re-check**: REF still renders zero data (0 rows on
employees/payroll/leavemanagement/taskmanager — frontier stays blocked).

## The round's two dimensions

### 1. The reduced-motion dimension (the frontier's "open on both apps" item)

**The census** (emulated `prefers-reduced-motion: reduce` on both sessions,
computed-DOM ground truth — REF's CSSOM is cross-origin-unreadable):

| surface | REF under reduce | LOC under reduce |
|---|---|---|
| sidebar group trigger | transition 0.2s all | transition 0.2s all |
| sidebar nav leaf | transition 0.2s all | transition 0.2s all |
| mobile drawer panel | animation enter 0.5s | animation enter 0.5s |
| user dropdown menu | animation enter 0.15s | animation enter 0.15s |

Both apps IGNORE the preference entirely (sonner's toast internals are the
only reduced-motion-aware rules on either side — documented session-22).
The WCAG 2.3.3-style a11y gap is open on both apps.

**The fix — a deliberate a11y SUPERSET** (the same category as the round-24
aria-label supersets: REF's behavior is a defect, not a design choice): the
clone respects `prefers-reduced-motion: reduce` while REF keeps animating.
Under DEFAULT media the new block does not apply at all — visual parity is
byte-identical (the regression sweep re-proves it).

### 2. The keyboard-navigation sweep (the frontier's keyboard-shortcut item)

NEW dimension, never swept: Tab-order census on /login and /dashboard.

- **/login: 8/8 MATCH** — Google → Microsoft → Apple → email → password →
  Sign in → Forgot password → Need an account, same order, same geometry.
  REF's extra tab-9 focus stop ("Close badge" @ 1393,856) is the base44
  platform builder badge — the documented non-goal.
- **/dashboard: 14/16 MATCH** — Dashboard → Employees → … → Settings →
  bell → moon → عربي, order byte-identical. The 2 diffs are the clone's
  KEPT aria-label supersets (REF's bell/moon buttons are unnamed; the clone
  labels them "Notifications" / "Switch to dark mode").
- Verdict: keyboard navigation at parity; no action (the sweep becomes the
  documented evidence).

### 3. The kanban drag-drop census → superset

REF's taskmanager kanban has zero draggables (documented since session-21 —
nothing to compare). The clone's cards carry the REF cursor-grab visual
recipe and a "Move to" dropdown path (`moveTask` → PATCH /api/tasks +
optimistic state + toast) but NO actual drag-and-drop. For the
production-ready-superset goal: wire real HTML5 DnD onto the existing
moveTask path — cards become draggable, columns become drop zones.

## Gap groups

- **R26-A (reduced-motion superset — globals.css)**: add a top-level
  (unlayered) `@media (prefers-reduced-motion: reduce)` block:
  `*, ::before, ::after { animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important; transition-duration: 0.01ms
  !important; scroll-behavior: auto !important; }` — the modern-normalize
  recipe. CRITICAL CONSTRAINT: durations 0.01ms, NOT `animation: none` —
  Radix waits for `animationend` before unmounting portal content
  (dialog/drawer/dropdown/select close paths); `none` would hang the
  unmount. At 0.01ms every animation still "completes" instantly and the
  event fires. Unlayered + `!important` wins the v4 cascade over the
  utilities layer (the session-21 unlayered-class lesson).
- **R26-B (kanban drag-drop superset — taskmanager page)**: card
  `draggable` + `onDragStart` (dataTransfer `text/plain` = task id + an
  `opacity-50` dragging class), column `onDragOver` (preventDefault + a
  subtle ring highlight while a card hovers) + `onDrop` (→ moveTask). The
  "Move to" dropdown stays as the keyboard/a11y path. Visual grammar
  unchanged at rest (cursor-grab is already the REF recipe).

## Verified non-gaps (documented, no action)

- Keyboard Tab order on both measured surfaces — byte-identical (above).
- Login a11y attributes — byte-identical (round-24 census).
- `scroll-behavior` — both apps compute auto everywhere (no smooth scroll
  to disable); the rule is belt-and-braces for future drift.

## Documented divergences (clone supersets / REF junk not replicated)

- Under reduce the clone calms down while REF keeps animating — the
  deliberate a11y superset (WCAG 2.3.3 alignment). Under default media the
  two apps render byte-identically (regression-swept).
- The clone's named bell/moon buttons (REF's are unnamed) — the round-24
  superset, re-confirmed by the keyboard sweep.
- REF's "Close badge" focus stop — the base44 platform badge, non-goal.

## Execution order (TDD)

1. RED pins (`tests/unit/recipes.test.ts` session-27 block):
   - R26-A pins: globals.css carries the `prefers-reduced-motion: reduce`
     block; pins the 0.01ms animation/transition durations, the
     iteration-count 1, and scroll-behavior auto; NEGATIVE pin — no
     `animation: none` anywhere in the block (the Radix unmount trap);
     the block must be unlayered (not inside `@layer base`).
   - R26-B pins: the taskmanager page source — `draggable` on the task
     card, `onDragStart` with `dataTransfer.setData`, `onDragOver` with
     `preventDefault`, `onDrop` wired to `moveTask`.
2. GREEN: the two edits (globals.css block; taskmanager DnD wiring).
3. E2E: extend the taskmanager spec with a DnD round-trip — create a task
   via the API-backed dialog, dispatch dragstart/dragover/drop (HTML5 DnD
   needs synthetic events), assert the card moved columns, reload, assert
   persistence, then clean up (restore the seeded state).
4. Gates: lint → typecheck → unit → build → E2E (restart :3200 after the
   build — the stale-server lesson).
5. Live dual-browser verification: (a) reduced-motion re-probe — LOC
   durations drop to ~0.01ms while REF stays 0.2s/0.5s/0.15s (the
   documented superset); the drawer still opens/closes cleanly (the
   animationend contract); (b) DEFAULT-media regression — the 12-route
   geometry sweep 12/12 MATCH, the mobile chrome byte-identical, the
   motion family unchanged (drawer 500ms slide, dropdown 150ms enter);
   (c) the DnD live probe on :3200 (card drag → column move → toast →
   persistence after reload).
6. Screenshots: the reduced-motion evidence (default vs reduce
   side-by-side captures), the DnD mid-drag capture → docs/screenshots/.
7. Docs: AGENTS session-27 layer + counts, SKILL §39 + counts, PAD [S27],
   CLAUDE/README counts, session log (docs/session_46.md), worklog, this
   plan's completion record.

## Completion record (session 27)

All 2 gap groups executed TDD-first (6 new pins in
tests/unit/recipes.test.ts, all RED before implementation → GREEN; no
mid-flight pin corrections this round):

- **R26-A**: the top-level UNLAYERED `@media (prefers-reduced-motion:
  reduce)` block in globals.css — 0.01ms animation/transition
  durations + iteration-count 1 + scroll-behavior auto, all
  `!important`, on `*, ::before, ::after`. Never `animation: none`
  (the Radix animationend unmount trap — the drawer close verified
  clean under reduce). Inert under default media.
- **R26-B**: the taskmanager kanban DnD — cards `draggable` +
  onDragStart (dataTransfer payload + dragTaskId state → the mid-drag
  opacity-50) + onDragEnd; columns onDragOver/onDragEnter preventDefault
  + the ring-blue-500/40 highlight while dragging + onDrop → moveTask;
  the Move-to dropdown kept as the keyboard path; E2E
  tests/e2e/taskmanager-dnd.spec.ts (synthetic DragEvents — create →
  drag Backlog→Done → toast → reload → persisted → cleanup).

Gates: lint 0/0 · tsc ✓ · 438/438 unit (+6) · build ✓ · 87/87 E2E (+1).
Live-verified: LOC calms under reduce (1e-05s group/dropdown) while REF
keeps animating (0.2s / enter 0.15s); drawer unmount clean both sides;
default media byte-parity restored (0.2s / 0.15s); the 12-route
geometry sweep 12/12 MATCH; mobile chrome byte-identical; mid-drag
opacity 0.5→1 DOM-verified; drop-target rings VLM-confirmed. 2 evidence
screenshots (86/87) + 2 standards refreshed → 100 total. DB pristine
(users=1, employees=1, leaveBalances=2, payroll=0, expenses=0).
