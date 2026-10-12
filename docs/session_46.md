# Session 46 — Parity Round 26: The reduced-motion + drag-drop dimensions

Continuing the parity cycle after round 25 (`037b8f6` + session log
`cb85ba2`). The owner's brief pointed at session_44/45 +
remediation-plan-session26; session_44's suggested next steps were:
re-run the redeploy check, the with-data story (still blocked on REF's
zero-data state), the checkbox focus recipe (still no measurable REF
surface), the form-validation error-surface dimension (still hidden by
REF's zero-data state), reduced-motion (open on both apps), the
drag-and-drop/keyboard-shortcut dimension, and the print/reading
dimension beyond session-18. This round took the two most tractable
open items — **the reduced-motion dimension** (fully measurable via
emulated media) and **the drag-and-drop/keyboard-shortcut dimension**
(the keyboard half measurable directly; the drag half a clean superset
opportunity on the clone's own board).

Workspace RESET (fresh sandbox): fresh clone at `cb85ba2`; `.env`
recreated (`DATABASE_URL="file:../db/custom.db"` + fresh AUTH_SECRET);
bun install; db:push + db:seed (pristine users=1/employees=1/
leaveBalances=2/payroll=0/expenses=0); `env -u DATABASE_URL` guard on
every DB/build command.

**Baseline gates: lint 0/0 · tsc ✓ · 432/432 unit · build ✓ · 86/86
E2E** — the `cb85ba2` state exactly.

Skills consulted (repo `skills/`): tdd (red→green, source pins),
agent-browser (dual sessions + `set media reduced-motion` emulation —
the enabler for the whole round), clone-app-pat-pro (computed DOM as
ground truth — REF's CSSOM stays cross-origin-unreadable).

**Standing audits — all green.** Redeploy check PASSED (12 canonical
routes, h1 text/font/x/y byte-identical — REF unchanged since round
25; the width deltas on attendance/settings/profile/reports remain the
documented REF-overflow family). Mobile navigation audit PASSED (the
r24/r25 probe's `topbar:false`-on-REF artifact bypassed by the direct
measurement: strip 342×40 transparent @ (24,16) both, hamburger 28×28
@ (24,22) both, tabs x=10/79/139/204/313 byte-identical, drawer
288×844 #FAFAFA z-50, kicker "Dashboard" y=101 h=28 fs=18px, 800px
brand H2 x=76 y=25 18px/700 both — no Tailwind v4 bug). With-data
re-check: REF still renders zero data (0 rows on 4 surfaces) — the
frontier stays blocked (documented).

**The round's core — the reduced-motion dimension**: with
`agent-browser set media reduced-motion` emulated on both sessions, the
computed-DOM census found **both apps ignore the preference entirely** —
the sidebar group/leaf transitions still compute `0.2s all`, the drawer
panel `enter 0.5s`, the user dropdown `enter 0.15s` on BOTH (sonner's
toast internals are the only reduced-motion-aware rules on either side
— the documented session-22 note; the WCAG 2.3.3 a11y gap was open on
both apps).

**The keyboard Tab-order sweep (the first of the dimension)**: /login
8/8 MATCH (Google → Microsoft → Apple → email → password → Sign in →
Forgot password → Need an account — order + geometry byte-identical;
REF's extra tab-9 stop is its base44 "Close badge" platform artifact,
the documented non-goal). /dashboard 14/16 MATCH (Dashboard →
Employees → … → Settings → bell → moon → عربي byte-identical; the 2
label diffs are the clone's KEPT aria-label supersets — REF's bell and
moon buttons are unnamed). Verdict: keyboard navigation at parity; the
sweep is the documented evidence, no action.

**The drag-drop census**: REF's taskmanager kanban ships zero
draggables (documented since session-21) while its cards LOOK grabbable
(the cursor-grab recipe); the clone's cards carried the same recipe and
a "Move to" dropdown path (`moveTask` → PATCH /api/tasks + optimistic
state + toast) but no actual DnD — the superset opportunity.

`docs/remediation-plan-session27.md` written (2 gap groups + the census
maps + the keyboard evidence + documented divergences) and
codebase-validated before execution.

**TDD**: 6 new pins (tests/unit/recipes.test.ts session-27 block — all
RED before implementation, 295 existing green). GREEN:

- **R26-A (the reduced-motion SUPERSET)**: a top-level UNLAYERED
  `@media (prefers-reduced-motion: reduce)` block in globals.css —
  `*, ::before, ::after { animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important; transition-duration:
  0.01ms !important; scroll-behavior: auto !important; }` (the
  modern-normalize recipe). Two hard constraints held: (1) 0.01ms
  durations, NEVER `animation: none` — Radix waits for `animationend`
  before unmounting portal content, and at 0.01ms every animation
  still completes instantly and the event fires (the drawer close
  stays clean — live-verified); (2) unlayered + `!important` so the
  block beats the v4 utilities layer (the session-21 unlayered-class
  lesson). Under DEFAULT media the block is inert.
- **R26-B (the kanban drag-drop SUPERSET)**: the taskmanager cards
  became `draggable` with `onDragStart` (dataTransfer payload + a
  `dragTaskId` state driving the mid-drag `opacity-50` affordance) and
  the columns became drop zones (`onDragOver` preventDefault — the
  HTML5 contract — + a `ring-blue-500/40` highlight on non-source
  columns while dragging + `onDrop` → the existing `moveTask` PATCH).
  The "Move to" dropdown stays as the keyboard/a11y path. New E2E spec
  `tests/e2e/taskmanager-dnd.spec.ts`: HTML5 DnD cannot be driven by
  mouse events, so the spec dispatches synthetic DragEvents
  (dragstart → dragover → drop) with a real DataTransfer — create a
  task via the API, drag Backlog → Done, assert the optimistic move +
  toast, reload, assert persistence, then cleanup.

**Gates: lint 0/0 · tsc ✓ · 438/438 unit (+6) · build ✓ · 87/87 E2E
(+1 — the DnD round-trip passed first run).**

**Live dual-browser verification** (all green):
- **Under reduce**: LOC's group transition computes `1e-05s` (Chrome's
  serialization of 0.01ms) and the dropdown `enter 1e-05s`, while REF
  keeps `0.2s` / `enter 0.15s` — the clone supersedes REF on the WCAG
  2.3.3 axis (the deliberate divergence, same category as the round-24
  aria-label supersets). The drawer close unmounts cleanly on BOTH
  under reduce (0 panels left after Escape — the Radix animationend
  contract holds).
- **Under default media**: LOC restores `0.2s` group / `enter 0.15s`
  dropdown — byte-parity with REF.
- **The mid-drag affordance**: computed opacity 0.5 while dragging → 1
  after dragend (DOM-verified; the drop-target rings VLM-confirmed in
  the capture).
- **Regressions**: the 12-route geometry sweep 12/12 MATCH (after one
  LOC re-auth — the documented cookie flake); the mobile chrome
  byte-identical (tabs/drawer/kicker; the TOP BAR probe "DIFF" is the
  documented text-named-hamburger artifact, byte-verified directly
  earlier in the round).

**2 new evidence screenshots** (86-reduced-motion-dnd-evidence — the
round's full census report rendered as an evidence page,
87-kanban-drag-mid-flight — the live mid-drag state with the ring
highlights) + 2 standards refreshed (02-dashboard-desktop,
11-mobile-dashboard) → **100 total**.

Probe-tooling lessons this round: `//` comments inside flattened
one-line evals swallow the rest of the line (the session-21 lesson
re-hit — use `/* */`); REF's group chevron is `lucide-chevron-right`
when COLLAPSED (chevron-down only when expanded — locate group buttons
via `[aria-expanded]`); REF's CDN-JIT Tailwind layout went stale once
after viewport/media churn within a session (a fresh session + fresh
auth recovered it); agent-browser's full-page flag is `--full` (not
`--full-page` — re-confirmed after it wrote a file literally named
`--full-page`).

Documentation updated: AGENTS session-27 layer + 438/87 counts;
SKILL v3.10.0 + §39 + counts; PAD [S27] row + Last Updated; CLAUDE
525-spec pyramid + the session-27 pin + DnD E2E entries; README 438/87
+ 100 captures + the reduced-motion/DnD parity rows; this session log;
worklog; remediation-plan completion record.

## Session complete — parity round 26 ready for push

**Audit**: redeploy check (REF unchanged), mobile navigation verified
byte-identical (no Tailwind v4 bug), with-data re-check (still
blocked), the emulated-media reduced-motion census (both apps ignore
the preference), the FIRST keyboard Tab-order sweep (parity — the 2
label diffs are the clone's kept supersets), and the kanban drag-drop
census (REF: zero draggables).

**Fixes (2 gap groups, TDD, both deliberate supersets)**: the
prefers-reduced-motion block (near-zero durations preserving the Radix
unmount contract — the clone now respects the OS-level a11y preference
REF ignores) and the kanban HTML5 drag-and-drop (real DnD on the
reference's merely-visual cursor-grab recipe, routing through the
existing moveTask PATCH, keyboard path preserved, E2E round-trip).

**Gates**: lint 0/0 · tsc ✓ · **438/438 unit (+6)** · build ✓ ·
**87/87 E2E (+1)** · 2 new screenshots · DB pristine.

**Suggested next steps**: re-run the redeploy check next round; the
remaining frontier — the with-data story (re-check whether the
reference gains data), the checkbox focus recipe (still no measurable
REF surface), the form-validation error-surface dimension (still
hidden by REF's zero-data state), the print/reading dimension beyond
the session-18 print stylesheet audit, and possible superset depth on
the new DnD surface (drag reordering within a column, or drag-drop on
the recruitment pipeline kanban).
