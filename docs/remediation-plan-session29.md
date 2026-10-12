# Remediation Plan — Session 29 / Parity Round 28

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app),
BOTH sessions explicitly pinned at 1440×900 before any sweep (the round-27
viewport lesson, applied from the start this round — the first sweep run
without the pin reproduced the exact phantom-DIFF signature: every route
read the sidebar brand "EonHR" h1 at (68,16), the 800×900-default artifact).
Standing audits first: **redeploy check PASSED 12/12** (h1 text/font/x/y
byte-identical on the 12 canonical routes — REF unchanged since round 27);
**mobile navigation audit PASSED** (tabs x=10/79/139/204/313 byte-identical,
drawer 288×844 #FAFAFA z-50, kicker "Dashboard" y=101 h=28 fs=18px; the
probe's topbar:false-on-REF is the documented markup artifact — and this
round the b800 sidebar:false-on-REF reading was root-caused the same way:
REF does not render nav/aside elements, so the probe's tag-based detector
misses its sidebar; the DIRECT geometry check at 800×900 shows h1 x=288 on
BOTH apps — both render the desktop sidebar at the md boundary; no
Tailwind v4 bug); **with-data re-check**: REF still renders zero data
(0 rows on employees/payroll/leavemanagement/taskmanager — frontier stays
blocked, documented).

Baseline gates at HEAD `2496211`: lint 0/0 · tsc ✓ · 445/445 unit ·
build ✓ · 89/89 E2E — the exact pushed state.

## The round's dimensions (session-48's suggested next steps)

Two concrete items from the frontier list, both pure supersets:

### 1. The recruitment pipeline within-stage ordering (R28-A)

Round 27 gave the pipeline real DnD (cross-stage moves through the existing
stage PATCH) and gave the taskmanager persistent within-column positions
(`Task.position` + the `order: string[]` PATCH contract + card-level
insertion targets). The recruitment board still renders each stage column
in `appliedAt desc` order with no within-stage reordering — the exact state
the taskmanager was in before R27-B. The superset applies the same proven
pattern to candidates:

- `prisma/schema.prisma`: `Candidate.position Int @default(0)` (db push;
  existing rows backfill to 0).
- `GET /api/candidates`: `orderBy: [{ position: "asc" }, { appliedAt:
  "desc" }]` — the tiebreak preserves today's newest-first render for
  untouched stages. (The `sort=aiScore` client-side re-sort stays: the
  kanban page does not use it, and the /recruitment analytics page keeps
  its own sort.)
- `PATCH /api/candidates`: CandidatePatch gains `order: string[]` (zod
  array of cuids, max 200) — after the field update, reassign
  `position = index` in a `$transaction`, existence-validated via findMany
  + count (NOT_FOUND on mismatch). Combined with `stage` this expresses
  "move to stage X inserted before candidate Y".
- recruitmentkanban page: cards become insertion drop targets
  (`dragOverId` state driving the `ring-2 ring-inset ring-blue-500/40`
  insertion ring on the hovered card; `onDrop` inserts the dragged card
  BEFORE it with `stopPropagation`; the column-body drop appends to the
  end). The new `reorderCandidate(draggedId, targetStage, beforeId)`
  computes the new stage order over the FULL candidate list for that
  stage — NOT the filtered view — so an active job filter or search query
  cannot corrupt the persisted positions (the filtered render follows the
  array subsequence, the taskmanager contract). Optimistic state: array
  order IS render order. The unified path PATCHes `{ stage?, order }`;
  the cross-stage toast stays `${name} → ${Label}` (the round-27 E2E
  contract), same-stage reorders toast "Order updated".
- E2E: a second test in tests/e2e/recruitment-dnd.spec.ts — create a job
  + two candidates in Applied (Beta renders above Alpha via the appliedAt
  tiebreak), drag Alpha ONTO Beta, assert the order flips + the "Order
  updated" toast, reload, assert persistence via the position column,
  cleanup with the job cascade.

### 2. The print superset (R28-B)

Session-18's audit (re-confirmed rounds 22 and 27): ZERO `@media print`
rules on either side — both apps hand printing to the browser defaults,
which prints the sticky sidebar, the mobile chrome, and the page
backgrounds as noise. The clone supersedes with a scoped, unlayered
`@media print` block in globals.css (the same placement rule as the
round-26 reduced-motion block — unlayered + !important beats every v4
cascade layer, and the block does not apply at all under screen media, so
visual parity is untouched):

- Hide the shell chrome: `aside, header, nav` (verified safe by census:
  the app-shell's sidebar/topbar/bottom-tabs are the ONLY such elements
  in the tree — the sidebar-nav's inner nav lives inside the hidden
  aside; PageHeader renders divs).
- Hide `[data-radix-portal]` (an open drawer/dialog/toast must not print
  over the page).
- `main { padding-bottom: 0 !important; }` (drop the pb-20 tab-bar
  reserve) and `body > div { min-height: 0 !important; }` (drop
  min-h-screen so short pages do not force a blank page).
- `break-inside: avoid` on `.rounded-xl` (the card recipe class) and
  `table tr` (rows and cards do not split across pages).

At-rest screen rendering is unchanged (a print-media block never applies
on screen — re-proven by the 12-route geometry + mobile chrome regression
sweeps after implementation).

## Gap groups

- **R28-A (recruitment within-stage ordering — schema + API + page + E2E)**
  as detailed above. Visual grammar at rest unchanged.
- **R28-B (print superset — globals.css only)** as detailed above. Zero
  screen-media impact.

## Verified non-gaps (documented, no action)

- Redeploy / mobile chrome / with-data — the three standing audits above
  (all green, two documented REF probe artifacts root-caused).
- Keyboard Tab order — parity documented rounds 26–27.
- Checkbox focus recipe / form-error surfaces — still hidden by REF's
  zero-data state.
- taskmanager DnD — complete as of round 27 (cross-column + within-column,
  E2E round-tripped).

## Documented divergences (clone supersets / REF junk not replicated)

- The within-stage candidate ordering is a deliberate superset on a
  surface where REF ships nothing (zero draggables, dropdown-only moves,
  appliedAt-desc render) — the same category as rounds 26–27's DnD.
- The insertion ring + mid-drag opacity — interaction-state only; nothing
  renders differently at rest.
- The print block — a superset over REF's browser-default printing (REF
  has zero print rules; the clone's print output becomes clean while REF's
  stays chrome-laden).

## Execution order (TDD)

1. RED pins (`tests/unit/recipes.test.ts` session-29 block):
   - R28-A pins: schema `position Int @default(0)` on Candidate; GET
     orderBy position-asc/appliedAt-desc; CandidatePatch `order` schema +
     the position-reassignment loop; the page's `dragOverId` +
     `reorderCandidate` + card insertion handlers + the `{ stage?, order }`
     PATCH body.
   - R28-B pins: the globals.css `@media print` block with its selectors
     (aside/header/nav/[data-radix-portal] hidden, main padding, root
     min-height, break-inside avoid).
2. GREEN: the schema edit + `db:push`; the API route edit; the page edit;
   the globals.css block.
3. E2E: the second recruitment-dnd test (the within-stage reorder
   round-trip).
4. Gates: lint → typecheck → unit → build → E2E (restart :3200 after the
   build — the stale-server lesson).
5. Live dual-browser verification: (a) the within-stage reorder live probe
   (create two candidates, drag Alpha onto Beta, assert order flip +
   persistence, cleanup); (b) the print-media probe — emulated print
   media on the loc session, assert the computed display:none on the
   shell chrome + the padding/min-height resets, and REF under the same
   emulation still shows its chrome; (c) regressions — the 12-route
   geometry sweep (viewports pinned) + the mobile chrome sweep + the
   round-27 DnD regressions.
6. Screenshots: the round's evidence page + the reorder live state + the
   print-emulation state → docs/screenshots/.
7. Docs: AGENTS session-29 layer + counts, SKILL §41 + counts, PAD [S29],
   CLAUDE/README counts, session log (docs/session_50.md), worklog, this
   plan's completion record.

## Completion record (session 29)

All 2 gap groups executed TDD-first (6 new pins in
tests/unit/recipes.test.ts, all RED before implementation → GREEN):

- **R28-A**: the recruitment within-stage ordering — `Candidate.position
  Int @default(0)` (schema pushed); GET `orderBy: [{ position: "asc" },
  { appliedAt: "desc" }]`; PATCH `order: string[]` (one stage's full
  ordered id list, position = index in a $transaction,
  existence-validated, NOT_FOUND on mismatch); the pipeline cards as
  insertion drop targets (onDragOver + dragOverId state → ring-2
  ring-inset ring-blue-500/40 on the hovered card; onDrop inserts BEFORE
  with stopPropagation; the column-body drop appends via the unified
  reorderCandidate; the order computed over the FULL candidates array so
  filters cannot corrupt persisted positions; the cross-stage toast
  contract preserved, same-stage reorders toast "Order updated"). E2E:
  the second recruitment-dnd test (Alpha onto Beta → order flip →
  "Order updated" → reload → persisted → cleanup via the job cascade) —
  first-run pass.
- **R28-B**: the print superset — the UNLAYERED `@media print` block in
  globals.css (aside/header/nav/[data-radix-portal] display:none
  !important; main padding-bottom reset; body > div min-height reset;
  .rounded-xl + table tr break-inside avoid; zero screen-media impact).
  E2E: tests/e2e/print-media.spec.ts (page.emulateMedia print — the
  sidebar computes display:none vs `flex` from md:flex, the cascade
  proof; mobile header hides + pb-20 drops at 390px; screen media
  restores everything) — first-run pass after one locator fix (the first
  body>div is Next.js's hidden bootstrap div, not the app root).

Gates: lint 0/0 · tsc ✓ · 451/451 unit (+6) · build ✓ · 91/91 E2E (+2).
Live-verified: the reorder round-trip ([Beta,Alpha] → [Alpha,Beta],
persisted; the insertion ring on Beta + mid-drag opacity on Alpha
VLM-confirmed); the print emulation VLM-confirmed (content-only
"Employees" page, no sidebar/topbar) + the screen contrast shot; the
12-route geometry sweep 12/12 MATCH at pinned 1440×900 (after one loc
cookie-flake re-auth — the sweep read a 0/12 login-page signature);
mobile chrome byte-identical (after one transient drawer-click re-run).
4 evidence screenshots (91 evidence page, 92 the insertion ring, 93/93b
the print pair) + 2 standards refreshed → 107 PNG captures. DB pristine
(users=1, employees=1, leaveBalances=2, payroll=0, tasks=0, candidates=0,
jobs=0).
