# Session 48 — Parity Round 27: The DnD depth dimension

Continuing the parity cycle after round 26 (`a882a79` + session log
`45122f3`). The owner's brief pointed at session_46/47 +
remediation-plan-session27; session_46's suggested next steps were: re-run
the redeploy check, the with-data story (still blocked on REF's zero-data
state), the checkbox focus recipe (still no measurable REF surface), the
form-validation error-surface dimension (still hidden by REF's zero-data
state), the print/reading dimension beyond session-18 (re-checked this
round: session-18's audit found ZERO `@media print` rules on either side —
parity clean, a print superset stays a future frontier item), and superset
depth on the new DnD surface. This round took the last item — **the DnD
depth dimension** — in both of its concrete forms: the within-column
reordering on the taskmanager kanban and the drag-drop on the recruitment
pipeline kanban.

Workspace SURVIVED (no reset): `git pull a882a79..45122f3` (session_47.md
added); `.env` intact (`DATABASE_URL="file:../db/custom.db"`); DB pristine
(users=1/employees=1/leaveBalances=2/payroll=0/expenseClaims=0/tasks=0/
candidates=0/jobs=0); `env -u DATABASE_URL` guard on every DB command.
One lint incident: a throwaway db-check script tripped no-require-imports
(the session-26 lesson, re-hit) — deleted.

**Baseline gates: lint 0/0 · tsc ✓ · 438/438 unit · build ✓ · 86/86
E2E** — the `45122f3` state exactly.

Skills consulted (repo `skills/`): tdd (red→green, source pins),
agent-browser (dual sessions + viewport pinning), clone-app-pat-pro
(computed DOM as ground truth — the round's recurring theme).

**Standing audits — all green, with one new probe lesson.** The FIRST
redeploy-sweep run read 10/12: /payroll (ref y=136 vs loc y=116) and
/profile (ref x=288 vs loc x=336) DIFFed. Root cause: NOT a REF
redeploy — the ref session had defaulted to **800×900** while loc was
1440×900. At 800px the payroll header's title column shrinks to
min-content 186px (the badge text wraps to 56px, the subtitle to 3
lines), and the centered profile header re-centers. After explicitly
pinning both viewports to 1440×900: **12/12 MATCH — REF unchanged since
round 26.** The lesson is now pinned in the plan + AGENTS + SKILL:
ALWAYS `set viewport` before sweeping. Mobile navigation audit PASSED
byte-identical (hamburger 28×28 @ (24,22), strip 342×40 transparent,
tabs x=10/79/139/204/313 with the blue-50 active pill, kicker "Dashboard"
y=101 h=28 fs=18px, drawer overlay 390×844 rgba(0,0,0,.8) z-50 — no
Tailwind v4 bug). With-data re-check: REF still renders zero data (0 rows
on 4 surfaces) — the frontier stays blocked (documented).

**The round's core — the DnD depth census**: REF's recruitmentkanban
re-verified at ZERO draggables and ZERO cursor-grab cards (5 w-64
columns, dropdown-only moves) — a pure superset opportunity; the clone's
taskmanager had cross-column DnD (round 26) but no within-column
reordering (the Task model had no position field; the column drop was a
no-op for same-column drops).

`docs/remediation-plan-session28.md` written (2 gap groups + the census
+ the viewport lesson + divergences) and codebase-validated before
execution.

**TDD**: 7 new pins (tests/unit/recipes.test.ts session-28 block — all
RED before implementation, 301 existing green; one mid-flight pin fix:
the `s` regex flag is not allowed under the tsconfig target — `[\s\S]*`
instead). GREEN:

- **R27-A (the recruitment pipeline DnD superset)**: the candidate cards
  are HTML5-draggable (`draggable` + `onDragStart` dataTransfer payload +
  a `dragCandId` state driving the mid-drag `opacity-50` + `onDragEnd`);
  the w-64 columns are drop zones (`onDragOver`/`onDragEnter`
  preventDefault — the HTML5 contract — + the `ring-blue-500/40`
  highlight on non-source columns + `onDrop` → the existing `onMove`
  stage PATCH). The "Move to" dropdown stays as the keyboard/a11y path.
  The card carries `cursor-grab active:cursor-grabbing` — the
  hover-state-only affordance superset (REF's card shows the default
  cursor while being un-draggable).
- **R27-B (the taskmanager within-column reorder superset)**:
  `Task.position Int @default(0)` (schema + db push); GET orders
  `[{ position: "asc" }, { createdAt: "desc" }]` — untouched columns keep
  the newest-first render (all positions tie at 0); PATCH accepts
  `order: string[]` (the full ordered id list for ONE column —
  reassigns position 0..n-1 in a `db.$transaction`, existence-validated
  via findMany + count, NOT_FOUND on mismatch); the kanban cards are
  insertion drop targets (`onDragOver` + a `dragOverId` state driving a
  `ring-2 ring-inset ring-blue-500/40` insertion ring on the hovered
  card; `onDrop` on a card inserts the dragged card BEFORE it with
  `stopPropagation` so the column handler does not double-fire; the
  column-body drop appends to the end via the unified `reorderTask`).
  Optimistic state: array order IS render order (splice before the
  insertion point; per-column render follows the array subsequence).
  The cross-column toast stays "Task moved" (the round-26 E2E contract);
  same-column reorders toast "Order updated".
- **E2E +2, both first-run passes**:
  `tests/e2e/recruitment-dnd.spec.ts` (create job + candidate via the
  API → synthetic dragstart/dragover/drop Applied → Interviewing →
  optimistic move + toast → reload → persisted → cleanup with the job
  cascade) and the second test in
  `tests/e2e/taskmanager-dnd.spec.ts` (create Alpha + Beta — Beta renders
  above via the createdAt tiebreak → drag Alpha ONTO Beta → order flips
  → "Order updated" toast → reload → persisted via the position column
  → cleanup).

**Gates: lint 0/0 · tsc ✓ · 445/445 unit (+7) · build ✓ · 89/89 E2E
(+2).**

**Live dual-browser verification** (all green):
- The pipeline round-trip: Applied → Interviewing optimistic move +
  persistence after reload; the mid-drag opacity 0.5 → 1 after dragend;
  cursor grab; the Interviewing column ring VLM-confirmed in the capture.
- The reorder round-trip: order [Beta, Alpha] → [Alpha, Beta], persisted
  after reload; the round-26 cross-column regression PASSes through the
  unified reorderTask path.
- The insertion ring: DOM-verified (`lab(54.6 8.76 -65.79 / 0.4) 0px
  0px 0px 2px inset`) + pixel-verified (1034 blue pixels at
  rgb(177,205,251) = blue-500@40% over white) — the VLM cannot perceive
  the 2px 40%-alpha ring (documented limitation; computed DOM + pixel
  sampling are the ground truth).
- Regressions: the 12-route geometry sweep 12/12 MATCH (viewports
  pinned); the mobile chrome byte-identical (tabs/kicker/drawer).

**3 new evidence screenshots** (88-dnd-depth-evidence — the round's
census report rendered as an evidence page, 89-recruitment-drag-mid-flight
— the live mid-drag state with the column ring, 90-taskmanager-insertion-ring
— the live insertion-ring state; take-1 of 90 missed the ring: dragstart
and dragover dispatched in the SAME eval — React state had not flushed,
so the dragover guard returned early; re-captured with separated
dispatches) + 2 standards refreshed (02-dashboard-desktop,
11-mobile-dashboard) → **103 total**.

Probe-tooling lessons this round: (1) pin BOTH viewports before
sweeping — the ref session's 800×900 default produced two phantom
redeploy DIFFs; (2) React state does NOT flush inside a single eval —
dispatch and read in SEPARATE evals (the round-26 lesson, re-hit on the
screenshot capture); (3) Chrome serializes modern colors as lab() —
match ring assertions on geometry or parse tolerantly; (4) a file://
evidence page breaks relative in-page fetch() calls — navigate back to
the app before API-driving from the page.

Documentation updated: AGENTS session-28 layer + 445/89 counts; SKILL
v3.11.0 + §40 + counts; PAD [S28] row + test table + checklist counts;
CLAUDE 534-spec pyramid + the session-28 pins + the DnD E2E entries;
README 445/89 + 103 captures + the DnD-depth parity row; this session
log; worklog; remediation-plan completion record.

## Session complete — parity round 27 ready for push

**Audit**: redeploy check (REF unchanged — after the viewport-pin
lesson), mobile navigation verified byte-identical (no Tailwind v4 bug),
with-data re-check (still blocked), print dimension re-checked (clean on
both sides since session-18 — future superset), the recruitment DnD
census (REF: zero draggables, zero cursor-grab), the taskmanager ordering
census (no position field, no reorder path).

**Fixes (2 gap groups, TDD, both deliberate supersets)**: the recruitment
pipeline drag-drop (real DnD on the dropdown-only board, routing through
the existing onMove stage PATCH, keyboard path preserved, E2E
round-tripped) and the taskmanager within-column reorder (a position
column + the order-array PATCH contract + card-level insertion targets
with the ring affordance — the board's ordering is now fully
drag-driven and persistent).

**Gates**: lint 0/0 · tsc ✓ · **445/445 unit (+7)** · build ✓ ·
**89/89 E2E (+2)** · 3 new screenshots · DB pristine.

**Suggested next steps**: re-run the redeploy check next round (with the
viewport pin); the remaining frontier — the with-data story (re-check
whether the reference gains data), the checkbox focus recipe (still no
measurable REF surface), the form-validation error-surface dimension
(still hidden by REF's zero-data state), the print superset (both apps
rely on browser defaults today), and possible further superset depth
(recruitment pipeline within-stage ordering — the same position-column
pattern applied to candidates; or drag-drop on the organogram).
