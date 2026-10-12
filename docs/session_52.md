# Session 52 — Parity Round 29: The sidebar leaf-gap + organogram DnD + print color dimensions

Continuing the parity cycle after round 28 (`73a6df9` + session log
`c9635fe`). The owner's brief pointed at session_50/51 +
remediation-plan-session29; session_50's suggested next steps included
the with-data story (re-check), further DnD depth (organogram
drag-drop) and print polish (print-color-adjust decisions). This round
took the organogram DnD + print color — and the round's opening census
found something better than either: a REAL at-rest parity bug that had
survived 28 rounds undetected.

Workspace RESET (fresh sandbox): fresh clone at `c9635fe`; `.env`
recreated (`DATABASE_URL="file:../db/custom.db"` + fresh AUTH_SECRET);
bun install; db:push + db:seed (pristine users=1/employees=1/
leaveBalances=2/payroll=0/expenseClaims=0/tasks=0/candidates=0/jobs=0);
`env -u DATABASE_URL` guard on every DB command.

**Baseline gates: lint 0/0 · tsc ✓ · 451/451 unit · build ✓ · 89→91/91
E2E — the `c9635fe` state exactly.**

Skills consulted (repo `skills/`): tdd (red→green, source pins),
agent-browser (dual sessions + viewport pinning), clone-app-pat-pro
(computed DOM as ground truth).

**Standing audits — all green.** Redeploy check (viewports pinned
1440×900 from the start): **12/12 MATCH — REF unchanged since round
28.** Mobile navigation audit PASSED (tabs x=10/79/139/204/313, kicker
"Dashboard" y=101 h=28 fs=18px fw=700, drawer overlay 390×844
rgba(0,0,0,0.8) z-50 — no Tailwind v4 bug). With-data re-check: REF
still renders zero data (0 rows on 4 surfaces) — the frontier stays
blocked (documented).

**The round's find (R29-A — the sidebar-internal census):** the
standing audits pin h1 geometry only, so this round opened a NEW probe:
a full nav y-map reading buttons AND links together (REF's "Training
LMS"/"Assets"/"Staff Requests"/"AI HR Assistant" entries are
single-route ANCHORS, not collapsible buttons — a button-only census
under-counts REF's nav). The census found the expanded-group trailing
gap diverging: after the expanded Analytics group's last leaf (ends
y=861), the next root item sits at **+4px on REF (AI HR Assistant
y=865, Settings group y=905)** but **+8px on the clone (869/909)** —
the clone's nested leaf-ul (`mt-1 mb-1`) contributes mb-1 PLUS the root
wrapper's gap-1. The LEADING side always matched (first leaf y=577 on
both — REF via the root gap, the clone via mt-1), which is how the
session-5 pin got the top right and over-generalized the bottom. FIX:
the leaf-list ul drops `mb-1` (the session-5 pin corrected). Post-fix:
**865=865 / 905=905 byte-identical**; the same SidebarNav renders the
mobile drawer, and the mobile chrome audit re-ran clean.

`docs/remediation-plan-session30.md` written (3 gap groups + the
census map + non-goals + the deferred print-button decision) and
codebase-validated before execution.

**TDD**: 6 new pins (tests/unit/recipes.test.ts session-30 block — all
RED before implementation, 314 existing green). GREEN:

- **R29-A (the sidebar leaf-gap parity fix)**: one class edit —
  `mt-1 flex flex-col gap-1 pl-4` — plus the corrected session-5 pin.
- **R29-B (the organogram drag-drop superset)**: REF ships zero
  draggables on /organogram (re-verified; the zero-data empty state is
  byte-identical). The server page keeps the tree-build (roots, render
  cycle guard, directReports) and delegates the render to the client
  island `organogram-tree.tsx` (the page-folder convention): node
  cards draggable + dataTransfer + mid-drag opacity-50 + the round-27
  cursor-grab affordance; drop targets via dragOverId → `ring-2
  ring-inset ring-blue-500/40`. The unified `reparent`: the CLIENT
  cycle guard first (`isDescendant` walks the local tree — the request
  never fires for a cycle), then the optimistic surgery
  (removeNode/insertChild/recount — the local forest IS render order),
  then `PATCH /api/employees { managerId }`, the toast `${name} now
  reports to ${targetName}`, and `router.refresh()` (server is truth;
  the island re-syncs from refreshed props). The API PATCH gains the
  ANCESTOR-WALK cycle guard (1000-deep; VALIDATION "This manager
  assignment would create a reporting cycle"). Keyboard path: the
  employee edit form, unchanged.
- **R29-C (the print color fidelity)**: the round-28 print block gains
  `* { print-color-adjust: exact !important;
  -webkit-print-color-adjust: exact !important }` (the browser economy
  default strips badge/chart/table-tint backgrounds from print) +
  `@page { margin: 10mm }`. Media-scoped — zero screen impact. The
  print-button-on-report-pages idea is CONSIDERED AND DEFERRED (a
  visible at-rest button would break visual parity).
- **E2E +2**: tests/e2e/organogram-dnd.spec.ts — the re-parent
  round-trip (A→B→C chain via the API, depths 0/1/2, drag C onto A,
  depth 2→1, persisted after reload, cleanup leaves-first) + the cycle
  rejection (drag A onto its own descendant C — toast, no move, no
  persistence). One box-shadow regex fix on the way (Chrome serializes
  rings with the inset geometry LAST — `/0px 0px 0px 2px inset/`, not
  `/2px 0px 0px 0px/`); the ring itself rendered correctly on the
  first run. The print-media spec gained the computed
  print-color-adjust assertion.

**Gates: lint 0/0 · tsc ✓ · 457/457 unit (+6) · build ✓ · 93/93 E2E
(+2).**

**Live dual-browser verification** (all green):
- The sidebar geometry: last leaf bottom 861=861, next root 865=865,
  Settings 905=905 — the 4px divergence eliminated, byte-identical.
- The organogram re-parent round-trip: the insertion ring on A
  computes `lab(54.6 8.76 -65.79 / 0.4) 0px 0px 0px 2px inset` + C's
  mid-drag opacity 0.5; the optimistic move (C depth 2→1); persistence
  after reload (C=1, B=1); the cycle rejection (A stays depth 0).
- The print CSS ships print-color-adjust + @page in the served
  stylesheet; the E2E pins the computed contract under emulation.
- Regressions: the 12-route redeploy sweep 12/12 MATCH; the mobile
  chrome byte-identical; DB pristine after all probes.

**5 new evidence screenshots** (94-sidebar-organogram-print-evidence —
the round's census report rendered as an evidence page,
95-organogram-reparent-ring — the live mid-drag state with the
insertion ring, VLM-confirmed (three-node tree + blue ring on Root +
semi-transparent Leaf), 96-sidebar-leafgap-fixed — the corrected
geometry, 97-print-color-exact + 97b-screen-media-contrast — the
print-color pair, VLM-confirmed (no chrome, colors retained)) + 2
standards refreshed (02-dashboard-desktop, 11-mobile-dashboard) →
**112 PNG captures** (117 files with the HTML evidence pages).

Probe-tooling lessons this round: (1) the standing audits pin h1
geometry only — sidebar internals drifted undetected since session 5;
the sidebar-internal census (buttons AND links together) is now part
of the round's standing probes; (2) Chrome serializes ring
box-shadows with the inset geometry LAST; (3) in-page fetch evals
break on JSON bodies (double quotes inside double-quoted shell words)
— drive the API from Node with the session cookie, and md5-compare
screenshot pairs before trusting a capture (identical hashes = the
dispatch sequence never registered — the first 95 capture was a
silent no-op, re-run with per-dispatch logging).

Documentation updated: AGENTS session-30 layer + 457/93 counts; SKILL
v3.13.0 + §42 + counts; PAD [S30] row + test table + Last Updated;
CLAUDE 550-spec pyramid + the session-30 pins + the organogram/print
E2E entries; README 457/93 + 112 captures + the sidebar/organogram/
print-color parity extension; this session log; worklog;
remediation-plan completion record.

## Session complete — parity round 29 ready for push

**Audit**: redeploy check (REF unchanged — viewports pinned from the
start), mobile navigation verified byte-identical (no Tailwind v4
bug), with-data re-check (still blocked), the NEW sidebar-internal
census (found the 28-round-invisible 4px trailing-gap divergence), the
organogram census (REF zero draggables, empty state byte-identical),
the print-color census (the economy default strips backgrounds).

**Fixes (3 gap groups, TDD)**: the sidebar leaf-gap parity RESTORATION
(mb-1 removed — 865/905 byte-identical), the organogram DnD superset
(re-parenting with dual cycle guards + optimistic tree surgery +
router.refresh), and the print color fidelity (print-color-adjust
exact + @page 10mm, media-scoped).

**Gates**: lint 0/0 · tsc ✓ · **457/457 unit (+6)** · build ✓ ·
**93/93 E2E (+2)** · 5 new screenshots (2 VLM-confirmed) · DB
pristine.

**Suggested next steps**: re-run the redeploy check + the NEW
sidebar-internal census next round; the remaining frontier — the
with-data story (re-check whether the reference gains data), the
checkbox focus recipe (still no measurable REF surface), the
form-validation error-surface dimension (still hidden by REF's
zero-data state), the deferred print-button decision (report-bearing
pages), and further sidebar-internal depth (the collapsed-group
boundaries, the drawer's expanded-state geometry).
