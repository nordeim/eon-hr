# Session 6 — Parity round 5: content-area recipes (tokens, cards, per-page canvases, CTAs)

Baseline: remote `0297e44` (session-5 audit + session log). Fresh workspace
merge (the local sandbox had been reset to an unrelated initial commit —
remote added, fetched, merged, `.env` recreated with
`DATABASE_URL="file:../db/custom.db"` + fresh `AUTH_SECRET`), `bun install`,
`db:generate`/`db:push`/`db:seed`. All four prior session docs re-read
(session_5, remediation-plan-session5, session_6 raw notes, worklog) and
validated against the code — the pushed session-5 state reproduced cleanly.

## Narrative

Re-validated every gate from scratch: lint 0 errors · tsc · 90/90 unit ·
build · 78/78 E2E (after `bunx playwright install chromium`). Audit: secret
scan clean on the session-5 diff; session-5's components reviewed sound; no
doc drift found. The session then concentrated on the one surface sessions
2–5 had not measured end-to-end: **page CONTENT areas** (card interiors,
stat cards, empty states, per-page canvases, module CTAs).

Parity round 5 (dual agent-browser — default session = reference,
`--session loc` = clone; every value computed-style/bounding-box measured
on BOTH sides):

- **Reference token layer extracted verbatim** (first time): dumped the
  ref's full `:root` CSS-variable set from its live stylesheets — its
  shadcn layer is a PURE-NEUTRAL palette (foreground `0 0% 3.9%` = #0A0A0A,
  secondary/accent `0 0% 96.1%` = #F5F5F5, background white, ring
  near-black, destructive exactly #EF4444). The clone's slate-tinted
  foreground/secondary/accent/background values drifted every neutral
  surface blue — fixed (7 token groups). muted-foreground deliberately kept
  slate-500: the ref's neutral token never visibly renders (all probed
  surfaces use explicit slate classes), so rendered truth wins.
- **Card recipe:** measured the ref's dashboard cards title-by-title —
  CardTitle is 16px/600 with 24px line-height (#0A0A0A inherited), and the
  title+link row nests INSIDE the standard column CardHeader. The
  scaffold's zero line-height had shrunk every title row 8px (cards 218 vs
  222). Post-fix probe: the leave-balances card is byte-identical (y=160
  h=222, header 56, title row 24, link y=189, content y=217 h=104, balance
  values #0A0A0A).
- **StatCard:** the reference renders 48px colored icon tiles (p-3
  rounded-xl bg-{color}-100, 24px icons), 30px/700 values, slate-600
  labels, border-slate-200 cards — the clone had 32px accent tiles,
  24px values, muted labels. Rewritten; per-stat tile colors measured
  (payroll green/blue/purple/orange, analytics blue/purple/green/orange);
  grids `gap-6 md:grid-cols-4`.
- **EmptyState:** `p-12 text-center`, 64px slate-300 icons, 18px/600 heads,
  16px slate-500 descriptions, and — the surprise — the action button is
  the reference's dark shadcn default (#171717), NOT the gradient CTA.
  Rewritten; 22 pages' empty-state CTAs switched via codemod.
- **Per-page canvas gradients:** the reference paints each module page's
  root with its own gradient (payroll green-50→blue-50, payrollmodule
  green→emerald, payrollengine emerald→teal, training/communications/
  hrassistantchat purple→blue, expenses purple→pink, interviewassistant
  purple→indigo, recruitment indigo→blue, allleaverequests/documenttracker
  blue→indigo, attendance(+dashboard) blue→cyan, evaluations/hrletters
  indigo→purple, compliance red→orange, organogram teal→green, surveys
  teal→cyan, surveyanalytics teal→slate, shiftcalendar violet→indigo,
  performance slate→indigo, workflowautomation slate→purple; rest
  slate→blue; nine pages plain) — mapped by sweeping all 46 ref routes.
  Applied via `scripts/apply-page-roots.mjs` (depth-tracking wrapper
  codemod — 5 files needed manual repair after the counter tripped on
  conditional JSX; all anchored and re-verified). `main` is now bare
  (`flex-1 flex flex-col pb-20 md:pb-0`) exactly like the reference; the
  shell canvas gradient moved from body (fixed) to the AppShell root
  (stretches with content like the ref).
- **Per-page CTA gradients + dark variant:** the reference's CTA colors are
  per-module (payroll green→emerald, attendance blue→cyan, compliance
  red→orange, assistant chat purple→indigo, templates indigo→purple,
  workflows purple→pink; default blue) and its dark #171717 default button
  appears on the taskmanager toggle + empty states. Button gained a `dark`
  variant + six gradient variants (sRGB endpoints per trap 3).
- **Task manager:** toggle = plain `flex gap-2` of h-9 dark/outline buttons
  (the segmented pill removed), board `grid grid-cols-1 md:grid-cols-5
  gap-4`, bare `space-y-3 rounded-lg p-3` columns (no bg/border), h3 16px
  semibold slate-900, count chips rounded-md/font-semibold/slate-700 on
  slate-100, and empty columns render NOTHING below the header (the
  "No tasks" filler removed — the ref ends after the header).
- **Mobile dashboard kicker:** re-measured — the ref's kicker is
  `md:hidden sticky top-0 z-20 bg-white border-b border-slate-200 px-4
  py-3` INSIDE the p-4 wrapper (x=16/y=89, title x=32/y=101) and it
  STICKS below the 73px top bar on scroll (the session-3
  "overflow-hidden ancestor" conclusion was wrong — the ancestor is
  overflow-auto). Replicated with `sticky top-[73px] z-20` (the clone
  scrolls at page level, so the explicit offset lands it under the sticky
  top bar). Module pages have no kicker — verified.
- **Sidebar user name:** slate-900 (#0f172a, measured), not the neutral
  foreground token.

TDD: 27 new unit contracts written RED first (token pins + recipe pins),
then GREEN; 6 new E2E pins (dashboard card recipe incl. the 222px card +
24px titles + #0A0A0A tokens, shell canvas on the shell root, payroll
canvas/CTA/tiles/dark-empty-CTA, taskmanager board/toggle/chips, the
sticky kicker, no-kicker-on-modules). One E2E expectation adapted for
Chromium's gap serialization ("8px", not "8px 8px") and the grid-template
fractional columns.

Gates after remediation: lint 0 errors · tsc clean · **102/102 unit** ·
build · **84/84 E2E** · 22 screenshots refreshed · DB pristine after
capture (users=1, employees=1, leaveBalances=2).

Docs: AGENTS.md (counts, trap-3 gradient scope, the page-architecture
section), CLAUDE.md (counts + session-6 test description), README (counts
+ design-token table), Project_Architecture_Document.md (token table
re-measured, §5.5 page canvas architecture), eon-hr_SKILL.md (session-6
recipe layer + updated color reference), this log, worklog.md,
docs/remediation-plan-session6.md.

## What this session delivered

**Parity round 5 — the content areas are now measured-recipe-faithful:**
the reference's complete token layer (extracted verbatim from its live
stylesheets), the card/StatCard/EmptyState family, per-page gradient
canvases across all 46 routes, per-module CTA colors + the dark default
variant, the taskmanager board, and the sticky mobile kicker. Every fixed
surface re-probed live and byte-identical (dashboard cards 222/56/24/217,
payroll tiles/CTA/empty state, taskmanager board, per-page gradients,
profile/securitysettings/notificationpreferences widths).

**Tooling:** `scripts/apply-page-roots.mjs` (per-page gradient/wrapper
codemod with the measured route map), `scripts/apply-empty-state-dark.mjs`
(empty-state CTA sweep), `scripts/probe-dual.sh` + the r5 probe family
(reusable dual-session DOM probes).

**Tests:** 27 new unit recipe pins + 6 E2E pins; 102 unit + 84 E2E green.

**Suggested next steps:** dialog interiors (the wizard's step content was
parity-checked in session 4 but the module dialogs' internals were not
byte-diffed), table-row interiors on data-bearing pages (employees was
verified; payroll/expenses tables render empty today), and the reference's
own defects remain replicated-but-noteworthy (ESS stuck loading,
attendance's tall title). A future session could also sweep the remaining
~20 superset StatCard call sites onto measured tile colors.
