# Remediation Plan — Session 30 / Parity Round 29

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app),
both sessions pinned at 1440×900 before every sweep (the round-27/28 lesson,
applied from the start). Standing audits first: **redeploy check PASSED
12/12** (h1 text/font/x/y byte-identical on the 12 canonical routes — REF
unchanged since round 28); **mobile navigation audit PASSED** (tabs
x=10/79/139/204/313, kicker "Dashboard" y=101 h=28 fs=18px fw=700, drawer
overlay 390×844 rgba(0,0,0,0.8) z-50 — byte-identical, no Tailwind v4 bug);
**with-data re-check**: REF still renders zero data (0 rows on
employees/payroll/leavemanagement/taskmanager — frontier stays blocked,
documented).

Baseline gates at HEAD `c9635fe`: lint 0/0 · tsc ✓ · 451/451 unit ·
build ✓ · 91/91 E2E — the exact pushed state. DB pristine (users=1,
employees=1, leaveBalances=2, payroll=0, expenseClaims=0, tasks=0,
candidates=0, jobs=0).

## The round's census — a NEW desktop-sidebar dimension (the round's find)

The round opened a sidebar-internal census (the standing audits pin h1
geometry only — sidebar internals were last deeply measured session 5).
Full nav y-map on both apps (buttons AND links, /organogram):

- Structure identical: same 12 groups, same 40px group pitch, same
  36px leaf pitch, same x=20 roots / x=36 leaves, same footer cluster
  (y=796/848), same عربي button.
- ONE divergence: after the expanded Analytics group's LAST leaf
  (Organogram, ends y=861), the next root item (AI HR Assistant) starts
  at **y=865 on REF vs y=869 on the clone — a 4px trailing-gap
  divergence**. Root cause: REF's Collapsible leaves are direct flow
  content (the trailing gap = the root list's 4px gap-1 only), while the
  clone nests its leaves in a `mt-1 mb-1` ul (trailing = mb-1 4px + the
  root wrapper's gap-1 4px = 8px). The LEADING side is identical (first
  leaf y=577 on both — REF via the root gap, the clone via mt-1), which
  is why the session-5 pin ("4px top gap") got the top right but
  over-generalized the bottom. The 4px shift accumulates into every
  element below an expanded group (Settings group button y=905 REF vs
  909 clone) on every page — invisible to the h1-only redeploy sweep.
- REF's extra "Toggle Sidebar" button (0×0, hidden) and the 18×18
  "Close badge" button at (1393,856) are the documented base44 builder
  artifacts — not replicated (non-gap).

## Gap groups

### R29-A — the sidebar leaf-list trailing-margin parity fix (REAL parity bug)

Remove `mb-1` from the leaf-list ul in
`src/components/layout/sidebar-nav.tsx` (line 182): the trailing gap
after an expanded group's last leaf becomes the root wrapper's 4px
gap-1 only — REF's measured contract (next root at +4, Settings at
905). The leading mt-1 stays (first leaf at +4, identical both sides).
The session-5 pin updates: `mt-1 flex flex-col gap-1 pl-4`. Applies to
the desktop sidebar AND the mobile drawer (the same SidebarNav
component renders both). At-rest visual grammar otherwise unchanged.

### R29-B — the organogram drag-drop superset (the frontier's DnD depth)

Census: REF /organogram ships zero draggables (re-verified this round,
both apps render the empty state — REF is zero-data); the clone's
organogram is a read-only server-rendered tree. The superset applies
the proven DnD pattern (rounds 26–28) to org-chart re-parenting:

- `src/app/(app)/organogram/organogram-tree.tsx` — a NEW client island
  (the page-folder convention: employee-wizard, customize-button). The
  server page keeps the tree-build (roots, cycle-guard render, direct
  reports) and passes the serializable `OrgNodeData[]` as props; the
  island renders the exact same DOM as today plus DnD.
- Node cards: `draggable` + `onDragStart` (dataTransfer setData +
  draggedId state + `opacity-50` mid-drag) + the round-27
  `cursor-grab` affordance (hover-state superset, the established
  precedent).
- Node cards as drop targets: `onDragOver` (preventDefault + dragOverId
  state → `ring-2 ring-inset ring-blue-500/40` on the hovered card) +
  `onDrop` → the unified `reparent(draggedId, targetId)`.
- `reparent`: client cycle guard FIRST (walk the local tree — if the
  target is a descendant of the dragged node, toast the error, no
  request), then the optimistic local re-parent (array surgery IS
  render order), then `PATCH /api/employees { managerId: targetId }`,
  then `router.refresh()` on success (server re-reads — directReports
  counts recompute; the island re-syncs from refreshed props), revert +
  error toast on failure.
- Toast contract: `${name} now reports to ${targetName}` on success.
- `PATCH /api/employees`: a cycle guard after the existing
  manager-existence check — walk the new manager's ancestor chain; if
  it reaches the employee being moved, VALIDATION "This manager
  assignment would create a reporting cycle" (the page's render cycle
  guard already tolerates corrupt data, but the API must not create
  it). POST needs no guard (a new employee cannot be anyone's manager
  yet).
- Keyboard path: the employee edit form already changes managers —
  unchanged.
- E2E: `tests/e2e/organogram-dnd.spec.ts` — (1) the re-parent
  round-trip (create A→B→C chain via API, drag C onto A, assert the
  optimistic move + toast, reload, assert persistence: C renders under
  A not B, cleanup); (2) the cycle rejection (drag A onto C — its own
  descendant — assert the error toast + no persistence).

### R29-C — the print color fidelity (the print-polish frontier item)

The round-28 print block hides chrome and avoids page-splits; the
browser's print default still STRIPS backgrounds — badges, table
header fills and chart colors vanish. Add to the same UNLAYERED
`@media print` block in globals.css:

- `* { print-color-adjust: exact !important;
  -webkit-print-color-adjust: exact !important; }` — "print what you
  see" for the semantic colors (status badges, severity buckets, chart
  fills, table header tints).
- `@page { margin: 10mm; }` — consistent print margins across
  browsers (REF ships zero print rules; browser defaults vary).

Media-scoped like the rest of the block — zero screen-media impact
(re-proven by the 12-route geometry + mobile chrome regression sweeps).
The print-button-on-report-pages idea from the frontier list is
CONSIDERED AND DEFERRED: a visible at-rest button would break visual
parity on report surfaces — documented as a future decision, not
shipped this round.

## Verified non-gaps (documented, no action)

- Redeploy / mobile chrome / with-data — the three standing audits
  (all green).
- REF's "Toggle Sidebar" + "Close badge" buttons — base44 builder
  artifacts (documented round 3, re-verified).
- The organogram empty state — byte-identical (h1 36px x=288 y=84,
  2 cards, scroller y=196 h=298 both sides).
- Keyboard Tab order — parity documented rounds 26–27.

## Documented divergences (clone supersets / REF junk not replicated)

- The organogram DnD — a deliberate superset on a surface where REF
  ships nothing (zero draggables; dropdown/form-only re-parenting) —
  the same category as rounds 26–28's DnD. Interaction-state only at
  rest (cursor-grab, the ring, mid-drag opacity).
- print-color-adjust + @page — a superset over REF's browser-default
  printing (REF has zero print rules).
- The 4px trailing-gap fix — a parity RESTORATION (the clone now
  matches REF's measured 865/905 geometry).

## Execution order (TDD)

1. RED pins (`tests/unit/recipes.test.ts` session-30 block): R29-A1
   (the leaf-list ul without mb-1 + the old pin updated), R29-B1 (the
   page delegates to the client island), R29-B2 (the island's DnD
   source contract: draggable/setData/dragOverId/reparent/PATCH
   managerId/router.refresh), R29-B3 (the client cycle guard),
   R29-B4 (the API ancestor-walk cycle guard), R29-C1 (the print block
   color-adjust + @page).
2. GREEN: the sidebar-nav edit; the island + page edit; the API guard;
   the globals.css print-block extension.
3. E2E: the organogram-dnd spec (2 tests).
4. Gates: lint → typecheck → unit → build → E2E (restart :3200 after
   the build — the stale-server lesson).
5. Live dual-browser verification: (a) the sidebar geometry re-probe
   (REF vs LOC: AI HR Assistant y=865=865, Settings y=905=905) + the
   12-route redeploy sweep re-run + the mobile chrome audit re-run
   (the fix touches the drawer nav too); (b) the organogram re-parent
   live probe (create the A→B→C chain via API, drag C onto A, assert
   the optimistic move + persistence, cycle rejection, cleanup); (c)
   the print-color probe (emulated print media: computed
   print-color-adjust on a badge element).
6. Screenshots: the round's evidence page + the sidebar before/after
   + the organogram mid-drag ring + the print color pair →
   docs/screenshots/.
7. Docs: AGENTS session-30 layer + counts, SKILL v3.13.0 + §42, PAD
   [S30], CLAUDE/README counts, the session log docs/session_52.md +
   the working log docs/session_53.md (the previous round's pair was
   50/51), worklog, this plan's completion record.

## Completion record (session 30)

All 3 gap groups executed TDD-first (6 new pins in
tests/unit/recipes.test.ts, all RED before implementation → GREEN; the
session-5 sub-list pin corrected in the same pass):

- **R29-A**: the sidebar leaf-gap parity RESTORATION — the leaf-list ul
  drops `mb-1` (`mt-1 flex flex-col gap-1 pl-4`); post-fix the
  expanded-group trailing geometry reads 865=865 / 905=905
  byte-identical on both apps (the 4px divergence eliminated); the same
  SidebarNav renders the mobile drawer — the mobile chrome audit re-ran
  clean.
- **R29-B**: the organogram drag-drop superset — the server page keeps
  the tree-build and delegates the render to the client island
  `organogram-tree.tsx` (draggable cards + dataTransfer + dragOverId →
  ring-2 ring-inset ring-blue-500/40 + mid-drag opacity-50 +
  cursor-grab; reparent = the client isDescendant cycle guard BEFORE
  any request → optimistic removeNode/insertChild/recount surgery →
  PATCH { managerId } → the `${name} now reports to ${target}` toast →
  router.refresh() with prop re-sync; failures revert). The API PATCH
  gains the ancestor-walk cycle guard (1000-deep, VALIDATION "reporting
  cycle"). E2E +2: the re-parent round-trip + the cycle rejection (one
  box-shadow regex fix — Chrome serializes rings with the inset
  geometry LAST).
- **R29-C**: the print color fidelity — `* { print-color-adjust: exact
  !important; -webkit-print-color-adjust: exact !important }` +
  `@page { margin: 10mm }` in the unlayered print block; the E2E
  print-media spec pins the computed print-color-adjust under
  emulation; zero screen-media impact (re-proven by the 12-route +
  mobile sweeps).

Gates: lint 0/0 · tsc ✓ · 457/457 unit (+6) · build ✓ · 93/93 E2E
(+2). Live-verified: the sidebar geometry byte-identical
(861/865/905 both sides); the re-parent round-trip (ring
lab(54.6 8.76 -65.79 / 0.4) 0px 0px 0px 2px inset + opacity 0.5 +
depths 0/1/2 → C moves 2→1, persisted after reload); the cycle
rejection (A stays depth 0, no request); the served CSS ships
print-color-adjust + @page. 5 evidence screenshots (94 the evidence
page, 95 the organogram ring VLM-confirmed, 96 the sidebar fixed
geometry, 97/97b the print-color pair VLM-confirmed) + 02/11 standards
refreshed → 112 PNG captures. DB pristine (users=1, employees=1,
leaveBalances=2, payroll=0, expenseClaims=0, tasks=0, candidates=0,
jobs=0).
