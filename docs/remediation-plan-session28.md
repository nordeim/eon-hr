# Remediation Plan — Session 28 / Parity Round 27

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app),
both sessions explicitly pinned at 1440×900 for desktop sweeps (NEW probe
lesson: the ref session defaulted to 800×900 this round and produced two
phantom DIFFs — /payroll y=136 vs 116 and /profile x=288 vs 336 — root-caused
to the viewport, not to a REF redeploy; always `set viewport` before
sweeping). Standing audits first: **redeploy check PASSED** (12 canonical
routes, h1 text/font/x/y byte-identical after the viewport pin — REF
unchanged since round 26); **mobile navigation audit PASSED** (direct
measurement — strip 342×40 transparent @ (24,16) both, hamburger 28×28 @
(24,22) both, tabs x=10/79/139/204/313 with the blue-50 active pill, kicker
"Dashboard" y=101 h=28 fs=18px, drawer overlay 390×844 rgba(0,0,0,.8) z-50 —
no Tailwind v4 bug); **with-data re-check**: REF still renders zero data
(0 rows on employees/payroll/leavemanagement/taskmanager — frontier stays
blocked, documented).

## The round's dimension — DnD depth (session-46's suggested next step)

Round 26 shipped HTML5 DnD onto the taskmanager kanban (cross-column moves
via the existing moveTask PATCH, E2E round-tripped). Two depth items remain
on the DnD surface, both pure supersets (REF ships zero draggables on either
board — taskmanager documented since session-21; recruitment re-verified
this round: 0 draggables, 0 cursor-grab cards, 5 `w-64` columns):

### 1. The recruitment pipeline census → superset

REF's /recruitmentkanban: five stage columns (applied / interviewing /
offer / hired / rejected), cards with a "Move to" dropdown only, zero
draggables. The clone mirrors the board exactly (w-64 columns, border-2
slate-300, min-h-32 drop-styled zone) with the same dropdown-only move
path (`onMove` → PATCH /api/candidates `{stage}` + reload + toast).

### 2. The taskmanager within-column ordering census → superset

The clone's kanban renders column cards in API order —
`orderBy: { createdAt: "desc" }` — so a column is strictly newest-first.
Cross-column DnD exists (round 26); within-column reordering does not: the
Task model has no position field, and dropping a card inside its own column
is a no-op (`task.status !== col.id` guard). No keyboard path reorders
either (the Move-to dropdown only changes status).

## Gap groups

- **R27-A (recruitment pipeline DnD superset — recruitmentkanban page)**:
  mirror the round-26 taskmanager wiring onto the candidate cards:
  `draggable` + `onDragStart` (dataTransfer `text/plain` = candidate id +
  a `dragCandId` state driving the mid-drag `opacity-50` affordance) +
  `onDragEnd` clear; column `onDragOver`/`onDragEnter` preventDefault (the
  HTML5 contract) + a `ring-blue-500/40` highlight on non-source columns
  while dragging + `onDrop` → the existing `onMove` (stage PATCH + optimistic
  update + toast + reload). The "Move to" dropdown stays as the
  keyboard/a11y path. The card gains `cursor-grab active:cursor-grabbing`
  (hover-state-only superset — REF's cards offer no grab affordance, but a
  draggable card that does not look draggable is a usability defect; same
  category as the round-24 aria-label supersets). Visual grammar at rest
  unchanged (no layout, color, or geometry change).
- **R27-B (taskmanager within-column reorder superset — schema + API + page)**:
  - `prisma/schema.prisma`: Task gains `position Int @default(0)` (db push;
    existing rows backfill to 0).
  - `GET /api/tasks`: `orderBy: [{ position: "asc" }, { createdAt: "desc" }]`
    — the tiebreak preserves today's newest-first render for untouched
    columns (all positions equal).
  - `PATCH /api/tasks` TaskPatch gains optional `order: string[]` (zod:
    array of cuid strings, max 200) — after the field update, reassign
    `position = index` for every id in the array (validate existence via
    findMany + count check, NOT_FOUND on mismatch). Combined with `status`
    this expresses "move to column X inserted before card Y".
  - taskmanager page: cards become insertion drop targets (`onDragOver`
    preventDefault + a `dragOverId` state driving an insertion ring on the
    hovered card; `onDrop` → `reorderTask(draggedId, targetColumn,
    beforeId)`); the column drop zones gain same-column semantics (drop on
    the column body = append to end). `reorderTask` computes the new column
    order, optimistically rewrites the tasks array (array order = render
    order), PATCHes `{ status?, order }`, toasts on error + reloads.
  - E2E: a second test in tests/e2e/taskmanager-dnd.spec.ts — create two
    tasks in Backlog, drag B before A (synthetic dragstart on B, dragover +
    drop on A), assert the visual order flips, reload, assert persistence,
    cleanup.

## Verified non-gaps (documented, no action)

- Print dimension: session-18 audited ZERO `@media print` rules on either
  side — parity is clean (both rely on browser defaults). Re-confirmed this
  round (globals.css has no print block; a print SUPERSET stays a future
  frontier item, not this round's scope).
- Keyboard Tab order — parity documented round 26 (login 8/8, dashboard
  14/16 with the two kept aria-label supersets).
- Redeploy / mobile chrome / with-data — the three standing audits above.

## Documented divergences (clone supersets / REF junk not replicated)

- Both DnD behaviors are deliberate supersets on surfaces where REF ships
  nothing (zero draggables) — same category as round 26's kanban DnD.
- The recruitment card's `cursor-grab` (hover-state only) — the affordance
  superset; REF's card shows the default cursor while being un-draggable.
- The insertion ring + mid-drag opacity on both boards — interaction-state
  only; nothing renders differently at rest.

## Execution order (TDD)

1. RED pins (`tests/unit/recipes.test.ts` session-28 block):
   - R27-A pins: the recruitmentkanban source — `draggable` on the card,
     `onDragStart` with `dataTransfer.setData`, `onDragOver` with
     `preventDefault`, `onDrop` wired to `onMove`, the mid-drag `opacity-50`,
     the `cursor-grab` affordance, and the kept `Move to` dropdown.
   - R27-B pins: `prisma/schema.prisma` Task `position Int @default(0)`;
     the tasks route source — `order` in the TaskPatch zod schema, the
     position-reassignment update loop, GET `orderBy` position asc; the
     taskmanager page source — card `onDragOver`/`onDrop` insertion
     handlers, the `reorderTask` function, the `{ status?, order }` PATCH
     body.
2. GREEN: the schema edit + `db:push`; the API route edits; the two page
   edits.
3. E2E: tests/e2e/recruitment-dnd.spec.ts (the round-trip on the pipeline)
   + the second taskmanager-dnd test (the within-column reorder).
4. Gates: lint → typecheck → unit → build → E2E (restart :3200 after the
   build — the stale-server lesson).
5. Live dual-browser verification: (a) the recruitment DnD live probe on
   :3200 — create a candidate via the API, drag applied → interviewing,
   assert the optimistic move + toast + persistence after reload, cleanup;
   (b) the within-column reorder live probe — create two tasks, drag B
   before A, assert order + persistence, cleanup; (c) regressions — the
   12-route geometry sweep (viewports pinned!) + the mobile chrome sweep +
   the round-26 cross-column DnD still green.
6. Screenshots: the round's evidence page + the recruitment mid-drag
   capture + the taskmanager reorder before/after → docs/screenshots/.
7. Docs: AGENTS session-28 layer + counts, SKILL §40 + counts, PAD [S28],
   CLAUDE/README counts, session log (docs/session_48.md), worklog, this
   plan's completion record.

## Completion record (session 28)

All 2 gap groups executed TDD-first (7 new pins in
tests/unit/recipes.test.ts, all RED before implementation → GREEN; one
mid-flight pin fix — the `s` regex flag is unavailable under the tsconfig
target, `[\s\S]*` instead):

- **R27-A**: the recruitmentkanban DnD — cards `draggable` +
  onDragStart (dataTransfer payload + dragCandId state → the mid-drag
  opacity-50) + onDragEnd; columns onDragOver/onDragEnter preventDefault
  + the ring-blue-500/40 highlight on non-source columns + onDrop → the
  existing onMove stage PATCH; the Move-to dropdown kept as the keyboard
  path; the card's cursor-grab/active:cursor-grabbing affordance
  (hover-state superset). E2E tests/e2e/recruitment-dnd.spec.ts
  (synthetic DragEvents — create job + candidate → drag Applied →
  Interviewing → toast → reload → persisted → cleanup via the job
  cascade) — first-run pass.
- **R27-B**: the taskmanager within-column reorder — `Task.position Int
  @default(0)` (schema pushed); GET `orderBy: [{ position: "asc" },
  { createdAt: "desc" }]`; PATCH `order: string[]` (full ordered id list
  for one column, position = index in a $transaction,
  existence-validated, NOT_FOUND on mismatch); cards as insertion drop
  targets (onDragOver + dragOverId state → ring-2 ring-inset
  ring-blue-500/40 on the hovered card; onDrop inserts BEFORE with
  stopPropagation; the column-body drop appends via the unified
  reorderTask — the round-26 cross-column contract unchanged, toast
  "Task moved" preserved); optimistic state = array order IS render
  order. E2E: the second taskmanager-dnd test (Alpha onto Beta → order
  flip → "Order updated" → reload → persisted → cleanup) — first-run
  pass.

Gates: lint 0/0 · tsc ✓ · 445/445 unit (+7) · build ✓ · 89/89 E2E (+2).
Live-verified: the pipeline round-trip (optimistic + persisted + opacity
0.5→1 + cursor grab + the Interviewing ring VLM-confirmed); the reorder
round-trip ([Beta,Alpha] → [Alpha,Beta], persisted); the round-26
cross-column regression PASS; the insertion ring DOM-verified
(lab(54.6 8.76 -65.79 / 0.4) 0 0 0 2px inset) + pixel-verified (1034
pixels at rgb(177,205,251) = blue-500@40% over white; VLM cannot
perceive the 2px 40%-alpha ring — computed DOM + pixel sampling are the
ground truth); the 12-route geometry sweep 12/12 MATCH at pinned
1440×900; mobile chrome byte-identical. 3 evidence screenshots (88/89/90
— 90 re-captured after the same-eval React-flush lesson) + 2 standards
refreshed → 103 total. DB pristine (users=1, employees=1,
leaveBalances=2, payroll=0, expenseClaims=0, tasks=0, candidates=0,
jobs=0).
