# Remediation Plan — Session 17 / Parity Round 16

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app)
computed-style diffing at 1440×900 + 390×844 + a NEW tablet-band sweep
(768/900/1024, per session_25's suggested frontier) + a zero-data
surface-content sweep (18 routes, text/DOM level). Redeploy check PASSED
(12 probe routes byte-identical — REF unchanged since round 15). Mobile
navigation audited end-to-end per the standing user priority: top bar
(390×73 white sticky, settled past the known mid-hydration 61px artifact),
bottom tabs (78@766, x-pitches 10/79/139/204/313, active rgb(37,99,235)),
drawer (288×844 #FAFAFA z-50 fixed — geometry-located probe; links at
identical y's 141/301/421/461/581; footer 121@723; overlay 390×844 z-50;
hamburger 28×28@24,22), kicker (53@89, 18px/700, scroll-away), md boundary
(767 mobile chrome → 800 desktop sidebar) — **all byte-identical, no
Tailwind v4 bug**.

Full 46-route desktop sweep at 1440: 33 OK; the 13 diffs are all documented
non-gaps (Category-A h1 block-width furniture ×9, the attendance fitting
family, the staffrequests aria-pressed superset toggle, REF's dead
/employeeselfservice). The tablet-band sweep (768/900/1024 across 17
fitting-sensitive routes) + the zero-data content sweep surfaced 5 gap
groups (R16-A…E).

## Verified non-gaps (documented, no action)

- **REF's own tablet overflows** (its `flex-1 overflow-auto` wrapper
  family): /attendance docW 1558 at 768–1024, /settings 1291 (pill),
  /employees 849, /payroll 861, /taskmanager 847, /hrreports 893,
  /recruitment 838, /leavemanagement 789, /profile 827, /chat 773 at 768 —
  REF's own fitting bugs; the clone fits (superset) except where pills
  cannot wrap (/settings, /profile — REF overflows identically).
- **hrreports @900–1024 knife-edge**: REF's title+cluster fill the row to
  ~1px (no gap, no wrap — h1 stays y=24; at 900 REF squeezes the h1 to two
  lines); LOC's cluster carries flex-wrap + the row's gap-4, so the actions
  wrap to a second row and the h1 centers 4px lower (y=28). The documented
  fitting-superset family (R9-E); 1440 geometry byte-identical.
- **compliance/workflowautomation h1 16px line-box deltas at 900** (396 vs
  380 / 401 vs 385): same text, same wrap count, same height/y — box-width
  furniture from REF's flex distribution, zero visual impact.
- **surveys REF's +32px trailing wrapper space**: REF keeps an empty
  (zero-height) list grid container whose space-y-8 gap adds 32px of
  invisible trailing space; every visible element matches.
- **documenttracker/announcements/companywall/loans/expenses/
  leavemanagement/payroll/training/recruitment/assetmanagement/
  communications/templates zero-data states** — byte-identical (content
  text + geometry).
- **REF renders stat values as DIVs, the clone as Ps** — internal DOM
  choice, identical geometry (the sweep's gridCards layer matches).
- **/chat right-pane 8px y-offset (REF 436 vs LOC 428)** — re-verify after
  the R16-C sidebar fix; both panes center similarly, no border/background
  surface to make 8px visible.
- Standing supersets kept: working reports CSV/PDF, working
  employeeselfservice, admin attendance form, training-platform CRUD,
  staffrequests scope toggle, user dropdown, drawer auto-close.

## Gap groups

- **R16-A (surveys — Avg Sentiment zero value)**: REF renders the 4th stat
  value as **"0 %"** at 0 surveys (212×36 tile, same y as the other zeros);
  LOC renders just "%" (the `stats.total ? \`${avg}%\` : "%"` branch drops
  the number). Fix: the zero branch renders "0 %".
- **R16-B (workflowautomation — zero-render below the stat row)**: REF
  renders NOTHING below the stat row at 0 workflows (content wrapper 306px
  = header + stat row only; the employees/surveys zero-render pattern);
  LOC renders a 290px card with the full EmptyState (h3 "No workflows yet"
  + description + a second Create Workflow CTA). The create affordance
  already lives in the header (actionsStart CTA — the offboarding R13-G
  pattern). Fix: drop the empty branch — the (empty) grid renders nothing
  at 0 rows; keep the loading spinner (transient, functional).
- **R16-C (chat sidebar zero state)**: REF renders `div.p-8.text-center`
  (319×144) containing a 48px `MessageCircle` icon (`mx-auto mb-3
  text-slate-300`) + ONE `p.text-slate-500.text-sm` line "No conversations
  yet" (255×20@321,242). LOC renders the full EmptyState component (64px
  inbox icon + h3 + description, ~200px). Fix: replace the sidebar
  EmptyState with the measured recipe.
- **R16-D (StatCard tile shrink — systemic, the R15-C lesson repeated)**:
  the shared tile element carries `shrink-0`
  (`cn(tileClasses, "shrink-0", tile)`) which REF's tiles do NOT have. At
  constrained card widths (/analytics @768: 94px cards, 46px interiors)
  REF's tile flex-shrinks (measured 24px) while LOC's stays 48px and
  overflows the document (docW 797 vs REF 768 — VLM-verified: both sides
  visually cut the 4th tile; REF's inner scroll wrapper keeps its body
  scroll at 768). Fix: remove `shrink-0` from the shared tile (all five
  tiled variants — shrink only engages under constraint; standard/compact/
  horizontal tiles never sit beside unshrinkable content, 1440 geometry
  unchanged). The value-in-tile and no-tile icon boxes keep their own
  pinned recipes.
- **R16-E (employees filter row mid-viewport fitting)**: at 768–~815 the
  row (search 256 fixed + native select 125 + toggles 86 + gaps 32 = 499)
  overflows the 448px content area (docW 796; toggle cluster right edge
  796). REF overflows worse (849 — its own bug), but the clone's
  documented fitting-superset intent is to FIT. Fix (the R15-C
  shrink-under-constraint philosophy): make the search shrinkable —
  wrapper `relative flex-1 md:flex-initial` (no grow, natural basis,
  shrink allowed) + input `w-full bg-transparent pl-10 md:max-w-64`
  (256 at 1440, shrinks only under constraint). 1440 renders
  byte-identical; the 768–815 band fits on one row.

## Execution order (TDD)

1. RED pins: `tests/unit/recipes.test.ts` gains a session-17 describe
   block — surveys "0 %" zero value; workflowautomation zero-render (no
   EmptyState below the stat row); chat sidebar p-8 text-center recipe
   (MessageCircle w-12 h-12 mx-auto mb-3 text-slate-300 + one
   text-sm slate-500 line, no h3); stat-card tile without shrink-0;
   employees `relative flex-1 md:flex-initial` + `md:max-w-64`.
   Update the stale R8-E pin (shell-recipes 270-271: flex-none →
   flex-initial, md:w-64 → md:max-w-64).
2. GREEN: R16-A (surveys value), R16-C (chat sidebar), R16-B
   (workflowautomation zero-render), R16-D (tile shrink-0), R16-E
   (employees filter row).
3. Gates: lint → typecheck → unit → build → E2E (86).
4. Live dual-browser re-verification: the five fixed surfaces at 1440 +
   the tablet band (768/900/1024 docW on /analytics + /employees + the
   full fitting set), the /chat right-pane 8px re-check, full-route sweep
   re-run, mobile regression.
5. Screenshots refresh + docs (AGENTS session-17 layer, SKILL §29 + v3.0.0,
   PAD [S17], CLAUDE/README counts, session log, worklog).

## Documented non-goals / supersets kept

- The clone keeps fitting pages where REF overflows (attendance,
  recruitmentkanban, hrreports, payroll, taskmanager, recruitment,
  leavemanagement, chat at 768) — REF's overflow bugs are not cloned.
- Pills never wrap (settings 971px, profile 507px) — REF parity.
- The chat loading spinner and the workflowautomation loading card stay
  (transient, functional; REF's own loading behavior is unmeasurable).
- The /chat right-pane 8px y-offset stays unless the R16-C fix resolves
  it (both panes have no visible boundary at the offset).

## Completion record (session 17)

All five gap groups executed TDD-first (7 new pins, all RED before
implementation; 1 stale pin updated — the R8-E employees filter-row
classes): R16-A the surveys "0%" zero value (byte-exact: 212×36 tile at
y=289, all four values identical), R16-B the workflowautomation
zero-render (wrapper 306=306, statCards 3=3, no h3 either side), R16-C
the chat zero states (sidebar holder p-8 text-center 319×144 with the
48px MessageCircle + one 14px slate-500 line — 1px p-y delta documented;
right pane REBUILT to the measured bare-centered recipe: 156px content
@340, 80px MessageCircle, h3 @436, p @472 — byte-exact; the with-data
rows keep their px-2 pb-4 inside the branch), R16-D the systemic
StatCard flex-centered tile (REF's computed padding is 0 — the p-3
tile's min-content 48 blocked shrinking; the flex-centered tile's
min-content is the bare svg: /analytics @768 tile 24px@749 pad 0 svg
24@749 BYTE-EXACT both sides, LOC docW 797→773 with REF's 768 being its
overflow-auto wrapper clamp; one E2E locator updated p-3→h-12), R16-E
the employees shrinkable filter-row search (docW 796→768 at 768 — fits
where REF overflows 849; 1440 byte-identical via md:max-w-64). Gates:
lint 0/0 · tsc · 356/356 unit (+7) · build · 86/86 E2E. Live
dual-browser verification: all fixed surfaces byte-exact or documented
(1px chat sidebar p-y); full-route sweep re-run = the same 12 documented
diffs (no regressions); mobile regression clean; tablet-band re-check
900/1024 clean. 9 screenshots captured/refreshed (6 new: 38-surveys,
43-workflowautomation, 13-chat, 50-analytics-tablet-768,
51-employees-tablet-768, 52-chat-mobile) → 59 total. DB pristine
(users=1, employees=1, leaveBalances=2).
