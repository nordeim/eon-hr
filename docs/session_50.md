# Session 50 — Parity Round 28: The within-stage ordering + print dimensions

Continuing the parity cycle after round 27 (`d3473a8` + session log
`2496211`). The owner's brief pointed at session_48/49 +
remediation-plan-session28; session_48's suggested next steps included
further superset depth (the recruitment pipeline within-stage ordering —
the same position-column pattern applied to candidates) and the print
superset (both apps rely on browser defaults since the session-18 census).
This round took BOTH.

Workspace SURVIVED (no reset): `git pull d3473a8..2496211` (session_49.md
added); `.env` intact (`DATABASE_URL="file:../db/custom.db"`); DB pristine
(users=1/employees=1/leaveBalances=2/payroll=0/tasks=0/candidates=0/jobs=0);
`env -u DATABASE_URL` guard on every DB command.

**Baseline gates: lint 0/0 · tsc ✓ · 445/445 unit · build ✓ · 89/89
E2E** — the `2496211` state exactly.

Skills consulted (repo `skills/`): tdd (red→green, source pins),
agent-browser (dual sessions + viewport pinning), clone-app-pat-pro
(computed DOM as ground truth).

**Standing audits — all green, two REF probe artifacts root-caused.** The
FIRST redeploy-sweep run (before the viewport pin) read 0/12 with every
route showing the sidebar brand "EonHR" h1 at (68,16) — the 800×900-default
viewport artifact reproducing its round-27 signature. After pinning both
viewports to 1440×900: **12/12 MATCH — REF unchanged since round 27.**
Mobile navigation audit PASSED (tabs x=10/79/139/204/313, kicker
"Dashboard" y=101 h=28 fs=18px, drawer 288×844 #FAFAFA z-50 — no Tailwind
v4 bug). This round the probe's b800 `sidebar:false`-on-REF reading was
root-caused the same way as topbar:false: REF renders no nav/aside
ELEMENTS, so the probe's tag-based detector misses its sidebar — the
DIRECT 800×900 geometry check reads h1 x=288 on BOTH apps (both render the
desktop sidebar at the md boundary). One mobile run read a DRAWER DIFF —
a transient (the drawer-open click did not register that run); the re-run
is clean. With-data re-check: REF still renders zero data (0 rows on 4
surfaces) — the frontier stays blocked (documented).

**The round's core — two dimensions, both pure supersets:**

`docs/remediation-plan-session29.md` written (2 gap groups + the censuses
+ the two new probe lessons + divergences) and codebase-validated before
execution.

**TDD**: 6 new pins (tests/unit/recipes.test.ts session-29 block — all
RED before implementation, 308 existing green). GREEN:

- **R28-A (the recruitment within-stage ordering superset)**:
  `Candidate.position Int @default(0)` (schema + db push); GET orders
  `[{ position: "asc" }, { appliedAt: "desc" }]` — untouched stages keep
  the newest-first render; PATCH accepts `order: string[]` (one stage's
  full ordered id list; reassigns position 0..n-1 in a `db.$transaction`,
  existence-validated via findMany + count, NOT_FOUND on mismatch); the
  pipeline cards are insertion drop targets (`onDragOver` + the
  `dragOverId` state driving a `ring-2 ring-inset ring-blue-500/40`
  insertion ring on the hovered card; `onDrop` inserts the dragged card
  BEFORE it with `stopPropagation`; the column-body drop appends via the
  unified `reorderCandidate`). **The new order computes over the FULL
  `candidates` array — NOT the filtered `visible` view** — so an active
  job filter or search cannot corrupt persisted positions. The cross-stage
  toast stays `${name} → ${Label}` (the round-27 E2E contract); same-stage
  reorders toast "Order updated".
- **R28-B (the print superset)**: an UNLAYERED `@media print` block in
  globals.css (the reduced-motion placement rule — unlayered !important
  beats every v4 cascade layer; zero screen-media impact): `aside, header,
  nav, [data-radix-portal] { display: none !important }` (census: the app
  shell's elements are the ONLY such tags in the tree), `main {
  padding-bottom: 0 !important }`, `body > div { min-height: 0 !important
  }`, `.rounded-xl, table tr { break-inside: avoid }`. REF ships zero
  print rules — the clone's print output becomes clean while REF's stays
  chrome-laden.
- **E2E +2, both first-run passes**: the second
  tests/e2e/recruitment-dnd.spec.ts test (create job + Alpha + Beta — Beta
  renders above via the appliedAt tiebreak → drag Alpha ONTO Beta → order
  flips + "Order updated" toast → reload → persisted via the position
  column → cleanup with the job cascade) and the new
  tests/e2e/print-media.spec.ts (under `page.emulateMedia({ media: "print"
  })`: the sidebar computes display:none vs `flex` from `md:flex` — the
  cascade proof; the nav/header hide; the root drops min-h-screen; cards
  break-inside avoid; at 390px the header hides and main drops pb-20;
  under screen media everything restores).

**Gates: lint 0/0 · tsc ✓ · 451/451 unit (+6) · build ✓ · 91/91 E2E
(+2).**

**Live dual-browser verification** (all green):
- The within-stage reorder round-trip: [Beta, Alpha] → [Alpha, Beta],
  persisted after reload via the position column; the insertion ring on
  Beta + the mid-drag opacity on Alpha VLM-confirmed in the capture.
- The print emulation: captured under Playwright's print media — the
  VLM confirms a content-only "Employees" page with NO sidebar/topbar
  chrome, plus the screen-media contrast shot from the same page.
- Regressions: the 12-route geometry sweep 12/12 MATCH (viewports
  pinned); the mobile chrome byte-identical (after one transient drawer
  re-run); the round-27 DnD regressions still green in the E2E suite.

**4 new evidence screenshots** (91-ordering-print-evidence — the round's
census report rendered as an evidence page, 92-recruitment-reorder-ring —
the live mid-drag state with the insertion ring, 93-print-emulation-
chrome-hidden + 93b-screen-media-contrast — the Playwright print-emulation
pair) + 2 standards refreshed (02-dashboard-desktop,
11-mobile-dashboard) → **107 PNG captures** (110 files with the 3 HTML
evidence pages).

Probe-tooling lessons this round: (1) agent-browser's `set media`
supports only dark|light|reduced-motion — print emulation lives in the
Playwright layer (`page.emulateMedia`), which is why the print
verification is a permanent E2E spec; (2) the FIRST `body > div` is
Next.js's hidden bootstrap div — locate the app root as `body >
div.min-h-screen` (a probe reading the hidden div's min-height 0px is a
false positive); (3) the loc session cookie flakes after server
restarts — the sweep suddenly reads a 0/12 login-page signature; re-run
scripts/auth-r22.mjs. One mobile-audit DRAWER DIFF was a transient
un-registered click — re-run before diagnosing.

Documentation updated: AGENTS session-29 layer + 451/91 counts; SKILL
v3.12.0 + §41 + counts; PAD [S29] row + test table + Last Updated;
CLAUDE 542-spec pyramid + the session-29 pins + the print/reorder E2E
entries; README 451/91 + 107 captures + the ordering/print parity
extension; this session log; worklog; remediation-plan completion record.

## Session complete — parity round 28 ready for push

**Audit**: redeploy check (REF unchanged — viewports pinned from the
start), mobile navigation verified byte-identical (no Tailwind v4 bug;
the b800 sidebar:false artifact root-caused as REF markup, direct
geometry 288=288), with-data re-check (still blocked), the within-stage
ordering census (the pipeline rendered appliedAt-desc only), the print
census (zero rules on both sides since session-18).

**Fixes (2 gap groups, TDD, both deliberate supersets)**: the recruitment
within-stage ordering (the position column + the order-array PATCH
contract + card-level insertion targets — the pipeline's stage ordering
is now fully drag-driven, persistent, and filter-safe) and the print
superset (the unlayered print block — clean print output with the shell
chrome, portals, tab-bar padding, and min-h-screen neutralized, cards and
rows unsplit).

**Gates**: lint 0/0 · tsc ✓ · **451/451 unit (+6)** · build ✓ ·
**91/91 E2E (+2)** · 4 new screenshots · DB pristine.

**Suggested next steps**: re-run the redeploy check next round (with the
viewport pin); the remaining frontier — the with-data story (re-check
whether the reference gains data), the checkbox focus recipe (still no
measurable REF surface), the form-validation error-surface dimension
(still hidden by REF's zero-data state), further DnD depth (organogram
drag-drop), and possible print polish (a print button on report-bearing
pages, or `print-color-adjust` decisions).
