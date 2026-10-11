# Session 38 — Parity Round 22: The scroll dimension + the dialog surface

Continuing the parity cycle after round 21 (`f3de0ba` + session log
`7e45e08`). The owner's brief pointed at session_36/37 +
remediation-plan-session22; session_36's suggested next steps were: re-run
the redeploy check, the with-data story (still blocked on REF's zero-data
state), the checkbox focus recipe (still no measurable REF surface),
reduced-motion (open on both apps), and **"a possible scroll dimension —
sticky behaviors and scroll-away kickers are pinned, but scroll-driven
effects were never swept"**. The scroll dimension became this round's core.

Workspace SURVIVED (git pull added session_37.md at `7e45e08`): `.env`
intact (`DATABASE_URL="file:../db/custom.db"`), deps installed, DB pristine
(users=1, employees=1, leaveBalances=2, payroll=0, expenses=0); the shell
`DATABASE_URL` trap guarded with `env -u` on every DB/build command (one
self-inflicted miss re-confirmed the documented trap — db-state failed
with error 14 until re-guarded).

**Baseline gates: lint 0/0 · tsc ✓ · 398/398 unit · build ✓ · 86/86 E2E**
— the `7e45e08` push state exactly.

Skills consulted (repo `skills/`): tdd (red→green vertical slices),
agent-browser (dual-session probing), clone-app-pat-pro (computed styles as
ground truth), tailwind-patterns (v4 CSS-first rules + @layer walking).

**Redeploy check PASSED** — 12 probe routes byte-identical (h1
text/font/x/y; the four width deltas are the documented REF-overflow
family). REF unchanged since round 21. **Mobile navigation audit PASSED
byte-identical** (top bar 390×73, tabs 10/79/139/204/313, drawer
288×844 #FAFAFA z-50, kickers 53/69, md boundary 767/800 — no Tailwind v4
bug). **Mobile scroll behavior verified byte-identical EMPIRICALLY** (real
scrollTo(400) on /dashboard @390×844: both apps scroll to exactly 178, top
bar pinned at y=0 h=73, kicker scrolled away — the session-9 static-kicker
pin re-confirmed). **With-data re-check**: REF still renders zero data —
the frontier stays blocked (documented). One stale-server incident during
the first redeploy run: the fresh `bun run build` had replaced
`.next/standalone` under the running :3200 process → every route served
the not-found page (h1 "EonHR") → 0/12; restarting the server restored
12/12 (the restart-after-rebuild lesson, now documented).

**The round's core — the FIRST scroll dimension audit**:

- **Static CSSOM enumeration** (@layer-aware walker — v4 wraps rules in
  CSSLayerBlockRule, which type-number walking skips): REF authors ZERO
  scroll-special rules (no scrollbar styling, no scroll-behavior/snap/
  margin, no overscroll outside the sonner library). LOC carried the
  custom `.scrollbar-thin` class (6px slate-300 rounded thumb) + the v4
  registry utilities (`.scroll-mt-24/28`, `.overscroll-contain` —
  generated but unused in the live DOM).
- **Live DOM census**: the clone's sidebar nav styles its scrollbar
  (`scrollbar-width: thin` + `scrollbar-color: rgb(203,213,225)…`) — and
  the nav SCROLLS live (sh=872 > ch=690 on expanded-group pages) — a
  visible divergence. The dialog content carried the same class.
- **The full 46-route docH sweep**: 39/45 byte-identical. Three real
  deltas: /settings +24 and /compliancedashboard +21 → **the v4 trailing
  space-y margin** (v4's `space-y-6` emits margin-block-end on
  `:not(:last-child)`; the ACTIVE TabsContent followed only by
  display:none Radix siblings kept mb-24 → 24px dead space below tab
  cards; REF's v3 margin-top model never trails); /hrreports +227 → the
  clone's EmptyState block under a 0-record table (REF renders the header
  row only, 139px card).
- **The dialog surface discovery** (via the scrollbar thread): REF's loans
  dialog — the only dialog that opens on zero-data REF — is 672px
  (`max-w-2xl`) with no max-height and a richer form than the clone's
  512px `max-w-lg`: Loan Type (Standard/Emergency/Salary Advance/Personal),
  a computed Monthly Installment display ("SAR 0.00", prefix + 2 decimals),
  Paid From, and the always-rendered Requesting-for preview card
  (`p-4 bg-blue-50 rounded-lg`).
- **Attendancedashboard/compliance residuals**: the attendance table th is
  37px all-left (`text-left py-2 px-3 text-slate-500 font-medium` — ALL
  six columns) with a bare `py-8` P empty state; the hrreports th is 33px
  uppercase with lowercase DOM texts; the compliance stat order is Expired
  first and the monitor table card is titled "At-Risk Employees".

`docs/remediation-plan-session23.md` written (6 gap groups + the scroll
map + non-goals) and codebase-validated before execution.

**TDD**: 13 new pins (recipes.test.ts session-23 block — all RED before
implementation). Six mid-flight pin corrections (the r19/r20/r22 lesson
now three-for-three): comments containing forbidden literals (dialog.tsx +
globals.css reworded), the installment-display slice anchor (the comment's
"Monthly Installment" matched first — switched to a direct contains), the
Type-column window (260→420 — the session comment pushed the pin out),
the TABLE_HEADERS const pin (the map renders a variable, not literals),
and the attendancedashboard anchor (the th gained a className — the bare
`<TableHead>Employee` literal no longer exists).

**Gates: lint 0/0 · tsc ✓ · 411/411 unit (+13) · build ✓ · 86/86 E2E.**
The built CSS carries `.mb-0\!{margin-bottom:0!important}` and no live
scrollbar styling (a dead `.scrollbar-thin` rule persists as v4 registry
noise from scanner hits on comments/test literals — no element carries
the class; documented).

**Live dual-browser verification**: nav scrollbar computes `auto` with 0
styled elements; /settings docH 919 = REF 919 EXACT and /hrreports card
139 = REF 139 + docH 949 = 949 EXACT; /compliance -3 (the documented
toolbar -2 + card -1 knife-edge); the loans dialog renders 672px with all
7 REF labels, the 622×88 Requesting-for card (REF 622×88-90), the
303×46 installment display computing "SAR 0.00" → "SAR 100.00" live
(1200/12), Cancel + Submit Request right-aligned; the hrreports 33px
uppercase th with 1 header row; the attendance 37px all-left th; the
compliance [Expired, ≤7, ≤15, ≤30] order + At-Risk Employees title.
Post-fix regressions: canonical 12-route sweep 12/12 MATCH + mobile chrome
byte-identical + the full docH sweep re-run (settings/hrreports/compliance
deltas eliminated; /employees + /offboarding transiently read +110/+74
mid-sweep — re-probed settled 900=900 both, a mid-hydration artifact, not
a real delta). One REF session death mid-sweep (the documented
Secure-cookie flake) — re-authed, re-ran clean.

**6 screenshots** (4 evidence: 74-loans-dialog-672-ref-recipe,
75-loans-dialog-installment-computed, 76-hrreports-header-only-table,
77-attendancedashboard-37px-th; 2 standards refreshed: 02-dashboard,
11-mobile-dashboard) → **92 total**. VLM spot-checks (createVision +
glm-4.6v) confirmed the dialog's ~50-60% width, the full field stack, the
gray centered "SAR 100.00" installment box, and the Standard Loan default.

Documentation updated: AGENTS session-23 layer + 411 specs; SKILL v3.6.0
+ §35 + counts (recipes 274); PAD [S23] row + Last Updated; CLAUDE
497-spec pyramid + session-23 pins; README 411 specs + 92 captures + the
scroll-parity + loan-management feature rows; this session log; worklog;
remediation-plan completion record.

## Session complete — parity round 22 pushed to `nordeim/eon-hr@main`

**Audit**: redeploy check (REF unchanged), mobile navigation verified
byte-identical (no Tailwind v4 bug), mobile scroll behavior verified
byte-identical empirically, with-data re-check (still blocked), and the
FIRST scroll audit — CSSOM enumeration + DOM census + empirical scrolling
+ the full 46-route docH sweep, which opened the dialog surface.

**Fixes (6 gap groups, TDD)**: the scrollbar-styling removal (browser
defaults everywhere like REF), the v4 trailing space-y phantom margin
(24px dead space below tab cards — `mb-0!` on TabsContent), the loans
dialog rebuilt to the REF recipe (672px, Loan Type + Monthly Installment +
Paid From + the Requesting-for card + Submit Request; schema + API +
table column), the compliance Expired-first stat order + At-Risk Employees
title, the hrreports 33px header-only table, and the attendancedashboard
37px all-left th + the P empty state.

**Gates**: lint 0/0 · tsc ✓ · **411/411 unit** · build ✓ · **86/86 E2E**
· 6 screenshots · DB pristine.

**Suggested next steps**: re-run the redeploy check next round; the
interaction map now covers focus + hover + pressed + motion + scroll;
remaining frontier — the with-data story (re-check whether the reference
gains data), the checkbox focus recipe (still no measurable REF surface),
reduced-motion (open on both apps), and possible NEW dimensions: the
cursor dimension (`cursor:` states were never swept), the selection/caret
dimension (`::selection` / caret-color), and a dialog-surface sweep of the
clone's other dialogs against REF (only the loans dialog is measurable —
the rest are dead controls on zero-data REF).
