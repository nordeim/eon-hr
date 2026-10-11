# Session 22 — Parity Round 14: white-pill completion, the staffrequests x-pin bug, profile tab-value fix, training affordance relocation

Continuing the parity cycle after round 13 (`5d7954d` + session-log `6110587`).
The repo owner's brief pointed at session_20/21 + remediation-plan-session14;
session_21's suggested next steps were: re-run the redeploy check first, then
push on the data-bearing frontier (compliance rows, reports tile
interactions, profile saves) and treat the REF-dead pages as superset
showcases.

Workspace SURVIVED this time (no reset): `.env` correct
(`DATABASE_URL="file:../db/custom.db"`), db/ at root, deps installed,
Playwright browsers cached, probe tooling intact. **Baseline gates:
lint 0/0 · tsc ✓ · 324/324 unit · build ✓ · 86/86 E2E** — the `6110587`
push state exactly. Static audit of the R13 diff: clean.

Skills consulted (repo `skills/`): tdd (red→green vertical slices,
seam discipline), agent-browser (dual-session probing), clone-app-pat-pro
(computed styles as ground truth), tailwind-patterns (v4 CSS-first rules).

**Redeploy check PASSED** — 12 probe routes byte-identical (h1
text/font/x/y); REF unchanged since round 13.

**Mobile navigation audit (user priority)**: top bar 390×73 sticky white +
1px slate-200 border; bottom tabs 78@766 with identical x-pitches
(10/79/139/204/313), 14px labels, 20px icons, active rgb(37,99,235);
drawer 288×844 #FAFAFA z-50 + overlay rgba(0,0,0,0.8) + footer 121@723;
submenu links at identical y's; kicker 53px@89 (18px/700) + scroll-away;
md boundary 767 (mobile chrome + 28×28 hamburger@24 on both) → 800
(desktop sidebar + Main Menu on both) — **all byte-identical, no Tailwind
v4 bug**. (A transient 61px REF top-bar reading was the documented
mid-hydration artifact; settled = 73px both sides.)

**Full 46-route sweep (now including a tab-pill layer) + per-page DOM
dumps + data-bearing probes** found 6 gap groups (R14-A…F):

- **R14-A recruitment**: the tab pill is the WHITE shrink-wrap recipe
  (`bg-white border border-slate-200`, 439px) — not `bg-secondary`; the
  first two triggers carry 12px lucide icons (users/sparkles) with gap-1
  (190/131/108).
- **R14-B training**: chip-row container carried `role="tablist"`
  (invalid ARIA — its children are aria-pressed toggles; REF renders a
  plain div) → `role="group"`; the h2 row carried a 158×36 New Platform
  button making the row 36px (REF: EMPTY 32px row, and REF's whole-page
  button inventory is the 7 category chips only) → button removed, the
  superset affordance relocated to a loans-recipe CTA below the
  empty-state line + a trailing dashed Add Platform tile in the with-data
  grid.
- **R14-C performancemanagement**: white pill (296px).
- **R14-D staffrequests — the round's real visual bug**: the My Requests
  pill rendered as a direct child of a `flex flex-col` wrapper →
  cross-axis stretch blew it to 1120px and justify-center parked the
  trigger at x=779 (REF: pill 145@288, trigger 137@292 — a 491px offset
  every prior round missed because only w×h were pinned, never X).
  Fix: plain block wrapper.
- **R14-E profile**: the Language/Timezone card was mounted under
  `<TabsContent value="general">` — a copy-paste bug from the R13-C
  rebuild (General showed 6 fields + the preferences tab rendered
  EMPTY). Fix: value="preferences"; General back to exactly the 4
  reference fields; Change Photo hardened with type="button".
- **R14-F compliance**: the three Notify All buttons rendered at the
  default h-9 (36px/14px) — REF uses `size="sm"` (32px/12px,
  166/173/173).

**Data-bearing frontier findings (documented non-gaps)**: REF's reports
tile buttons are dead (CSV click fires no toast, no toaster in the DOM —
LOC's real CSV generation stands as the superset); REF's compliance page
is also at zero data (8 stat "0"s, 0 rows, "0 at-risk documents" —
identical); REF's profile Save Changes (164×36@724, type=submit) matches
LOC byte-for-byte (an earlier "missing" reading was a hydration race).

`docs/remediation-plan-session15.md` written (6 groups + execution order
+ documented non-goals) and validated against the codebase before
execution.

**TDD**: 13 new session-15 pins (12 RED + 1 incidental guard) → GREEN.
Two pins refined during implementation (regex windows widened — the
profile TabsContent blocks are 4.5KB/2.8KB).

**Gates: lint 0/0 · tsc ✓ · 337/337 unit (+13) · build ✓ · 86/86 E2E.**

**Live dual-browser verification**: 6/6 fixed surfaces byte-exact —
recruitment pill 439 + triggers 190/131/108 (12px icons);
performancemanagement pill 296; staffrequests pill 145@288 + trigger
137@292; profile General 4 fields @540/632 + save 164@724 + the
Preferences tab renders the lang/tz card + notification toggles (verified
via real tab click); compliance notify 166/173/173 @32px/12px; training
h2 row 32@276 + CTA in the empty state (card 250 vs REF 202 — the
documented +48px superset). Full-route sweep re-run: every fixed surface
out of the diff; remaining diffs are the documented categories
(Category-A h1 furniture ×9, REF's attendance 2-line header + overflow,
REF-dead employeeselfservice, the staffrequests role=tablist DOM
furniture). Mobile regression clean. With-data smoke: injected platform
renders card + dashed add-tile, then removed; DB pristine
(users=1, employees=1, leaveBalances=2).

**12 screenshots** captured/refreshed (40-recruitment, 41-training,
42-performancemanagement, 43-profile-preferences, 44-mobile-training new;
32/34/36 + dashboard/employees/mobile set refreshed) → 53 total.

Documentation updated: AGENTS session-15 layer + 337 specs; SKILL v2.8.0
+ §27; PAD [S15] row + Last Updated + corrected test-distribution table;
CLAUDE 423-spec pyramid + session-15 pins; README 337 specs + 53 captures;
this session log; worklog; remediation-plan completion record.

## Session complete — parity round 14 pushed to `nordeim/eon-hr@main`

**Audit**: redeploy check (REF unchanged), mobile navigation verified
byte-identical end-to-end (no Tailwind v4 bug), 46-route sweep with the
new tab-pill layer, per-page DOM dumps, and the data-bearing frontier
(reports tile clicks, compliance counters, profile save flow).

**Fixes**: 6 gap groups with 13 new TDD pins — two more white pills
(recruitment with iconed triggers, performancemanagement), the 491px
staffrequests pill-centering bug (the X-position lesson), the profile
preferences tab-value bug, the training affordance relocation, and the
compliance notify size.

**Gates**: lint 0/0 · tsc ✓ · **337/337 unit** · build ✓ · **86/86 E2E**
· 12 screenshots · DB pristine.

**Suggested next steps**: re-run the redeploy check next round; the
remaining frontier is deeper with-data parity (both apps sit at zero
data on most modules — a seeded REF-side data state or a LOC data-rich
screenshot pass would unlock table-row/card-list recipe comparisons),
plus the REF-dead pages as polished superset showcases.
