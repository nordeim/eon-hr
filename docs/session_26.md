# Session 26 — Parity Round 16: StatCard flex-centered tile, tablet-band fitting, chat/workflowautomation/surveys zero states

Continuing the parity cycle after round 15 (`7932739` + session-log
`6389482`). The owner's brief pointed at session_24/25 +
remediation-plan-session16; session_25's suggested next steps were: re-run
the redeploy check first, push the tablet-band (768–1024) geometry sweep,
and keep the REF-dead pages as superset showcases.

Workspace survived at `6389482` (git pull clean, one-file delta — this
session log). Integrity verified: `.env` `DATABASE_URL="file:../db/custom.db"`,
`db/` at repo root (custom.db + e2e.db), pristine seed (users=1,
employees=1, leaveBalances=2). **Baseline gates: lint 0/0 · tsc ✓ ·
349/349 unit · build ✓ · 86/86 E2E** — the `6389482` push state exactly.
Static audit of the R15 diff (`357fb65..7932739`): clean (0 `any`, no
debug/secrets).

Skills consulted (repo `skills/`): tdd (red→green vertical slices, seam
discipline), agent-browser (dual-session probing), clone-app-pat-pro
(computed styles as ground truth), tailwind-patterns (v4 CSS-first
rules).

**Redeploy check PASSED** — 12 probe routes byte-identical (h1
text/font/x/y); REF unchanged since round 15.

**Mobile navigation audit (user priority)**: top bar 390×73 sticky white +
1px slate-200 border (the transient 61px reading re-confirmed as a
mid-hydration artifact — settles to 73 on re-probe); bottom tabs 78@766
with identical x-pitches (10/79/139/204/313), 14px labels, 20px icons,
active rgb(37,99,235); drawer 288×844 #FAFAFA z-50 fixed — verified with
a NEW geometry-located probe (`scripts/probe-r16-drawer.mjs`: finds the
panel by position:fixed + width + full-height rather than
`[data-state]`/offsetParent — offsetParent is null for fixed elements);
links at identical y's (141/301/421/461/581), footer 121@723, overlay
390×844 z-50, hamburger 28×28@24,22; kicker 53px@89 (18px/700) +
scroll-away; md boundary 767 (mobile chrome) → 800 (desktop sidebar) —
**all byte-identical, no Tailwind v4 bug**.

**Full 46-route desktop sweep (1440×900)**: 33 OK; the 12 diffs are all
documented non-gaps (Category-A h1 block-width furniture ×9, the
attendance fitting family, the staffrequests aria-pressed superset
toggle, REF's dead /employeeselfservice).

**NEW: tablet-band sweep (768/900/1024 × 17 fitting-sensitive routes) +
zero-data surface-content sweep (18 routes)** — session_25's frontier.
Findings: 5 gap groups (R16-A…E) + a documented REF-overflow family
(REF's `flex-1 overflow-auto` wrapper keeps its body at viewport width
while its content overflows internally: attendance 1558, settings 1291,
employees 849, payroll 861, taskmanager 847, hrreports 893, recruitment
838, leavemanagement 789, profile 827, chat 773 at 768; pills never
wrap — settings/profile overflow identically on both sides; hrreports
900–1024 = REF's 1px knife-edge where the clone's wrapped cluster shifts
the h1 4px — the fitting-superset family).

- **R16-A (surveys)**: REF's 4th stat value renders "0%" at zero
  surveys; LOC rendered a bare "%". Fixed (the number stays at zero).
- **R16-B (workflowautomation)**: REF renders NOTHING below the stat row
  at 0 workflows (wrapper 306 = header + stats only — the employees/
  surveys zero-render pattern); LOC rendered a 290px EmptyState card +
  a second Create Workflow CTA. Fixed — the header CTA is the
  affordance (offboarding R13-G pattern); the loading spinner stays.
- **R16-C (chat)**: REF's sidebar zero state = `div.p-8.text-center`
  (319×144) with a 48px MessageCircle (`mx-auto mb-3 text-slate-300`) +
  ONE `p.text-sm.text-slate-500` line; LOC rendered the full h3
  EmptyState. The right pane = a BARE `flex flex-1 items-center
  justify-center` (no p-8) wrapping `div.text-center` with an 80px
  MessageCircle + h3 + p (156px @340); LOC rendered the p-12 EmptyState
  with a 64px icon. Both rebuilt to the measured recipes — byte-exact
  (holder 319×144/156px @340, icon 48/80, h3 @436, p @472; 1px sidebar
  p-y delta documented).
- **R16-D (StatCard tile, systemic — the round's core find)**: REF's
  48×48 tile computes `padding: 0` — it is `flex h-12 w-12
  items-center justify-center` with the 24px svg centered by flexbox.
  LOC's `p-3` tile has min-content 48 (padding + svg) and can NEVER
  flex-shrink — at constrained card widths (/analytics @768: 94px
  cards) REF's tile squeezes to 24px while LOC's stayed 48 and pushed
  docW to 797. Removing shrink-0 alone changed nothing (the min-content
  floor) — the fix is the flex-centered tile (min-content = the bare
  svg). Verified byte-exact: tile 24px@749, pad 0, svg 24@749 both
  sides; LOC docW 797→773 (REF's 768 = its wrapper clamp); @1024 REF
  squeezes to 26.03px — same flex mechanics. compact/horizontal tiles
  were already flex-centered. One E2E locator updated (p-3 → h-12).
  **Lesson: read the reference's COMPUTED padding, not just the box
  size.**
- **R16-E (employees filter row)**: at 768–815 the rigid search
  (`md:flex-none` + `md:w-64` = 256px) + native select (125) + view
  toggles (86) + gaps overflowed the 448px content area (docW 796).
  Fixed with the R15-C shrink-under-constraint philosophy: wrapper
  `md:flex-initial` + input `md:max-w-64` — 256px at 1440
  (byte-identical), shrinks only in the tight band (docW 796→768; REF
  overflows the same row at 849 — its own bug).

`docs/remediation-plan-session17.md` written (5 groups + non-goals +
the REF-overflow family) and codebase-validated before execution.

**TDD**: 7 new pins (all RED first) → GREEN; 1 stale pin updated (the
R8-E employees filter-row classes); one E2E locator updated with the
tile recipe change. Two mid-flight corrections from live verification:
the surveys value is "0%" (no space — the first "0 %" reading was a
text-node artifact), and the chat right pane needed its own rebuild
(the initial fix only covered the sidebar).

**Gates: lint 0/0 · tsc ✓ · 356/356 unit (+7) · build ✓ · 86/86 E2E.**

**Live dual-browser verification**: surveys values byte-exact (all four
212×36 @289); workflowautomation byte-exact (wrapper 306=306, 3 stat
cards, no h3); chat sidebar (319×144 holder, 48px icon, one 14px
slate-500 line) + right pane (156px @340, 80px icon, h3 @436, p @472)
byte-exact; analytics tile @768 byte-exact (24px@749 pad 0); employees
@768 fits (REF 849). Full-route sweep re-run: the same 12 documented
diffs — no regressions. Mobile regression clean. DB pristine
(users=1, employees=1, leaveBalances=2).

**9 screenshots** captured/refreshed (6 new: 38-surveys,
43-workflowautomation, 13-chat, 50-analytics-tablet-768,
51-employees-tablet-768, 52-chat-mobile; 3 standards refreshed) → 59
total. VLM spot-checks confirmed the surveys "0%" value, the
workflowautomation zero-render, and both chat zero states.

Documentation updated: AGENTS session-17 layer + 356 specs; SKILL v3.0.0
+ §29 + fixed stale 194-spec counts; PAD [S17] row + Last Updated +
recipes 227; CLAUDE 442-spec pyramid + session-17 pins; README 356
specs; this session log; worklog; remediation-plan completion record.

## Session complete — parity round 16 pushed to `nordeim/eon-hr@main`

**Audit**: redeploy check (REF unchanged), mobile navigation verified
byte-identical end-to-end (no Tailwind v4 bug), 46-route sweep clean of
non-documented diffs, the FIRST tablet-band sweep (768/900/1024), and a
zero-data surface-content sweep.

**Fixes**: 5 gap groups with 7 new TDD pins — the systemic
flex-centered StatCard tile (the computed-padding lesson), the
workflowautomation zero-render, both chat zero-state recipes, the
surveys "0%" value, and the employees filter-row fitting.

**Gates**: lint 0/0 · tsc ✓ · **356/356 unit** · build ✓ · **86/86 E2E**
· 9 screenshots · DB pristine.

**Suggested next steps**: re-run the redeploy check next round; the
remaining frontier is a second tablet-band pass on the REMAINING ~29
routes (this round swept 17 fitting-sensitive ones) and the
with-data story stays blocked on REF's zero-data state (both apps sit
at zero data on every module — a seeded data state would unlock
table-row/card-list recipe comparisons only if REF ever carries data);
consider a print-stylesheet audit (window.print() surfaces) as a new
parity dimension.
