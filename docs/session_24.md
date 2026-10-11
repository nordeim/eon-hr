# Session 24 — Parity Round 15: tab-pill token colors, footer colors, cluster fitting, organogram bare card, staffrequests surface

Continuing the parity cycle after round 14 (`01fe8f6` + session-log
`357fb65`). The owner's brief pointed at session_22/23 +
remediation-plan-session15; session_23's suggested next steps were: re-run
the redeploy check first, then push on the with-data frontier and keep the
REF-dead pages as superset showcases.

Workspace had been RESET (fresh sandbox): fresh clone at `357fb65`, .env
recreated (`DATABASE_URL="file:../db/custom.db"` + fresh AUTH_SECRET),
bun install, db:push + db:seed (pristine: users=1, employees=1,
leaveBalances=2), Playwright chromium installed. **Baseline gates: lint
0/0 · tsc ✓ · 337/337 unit · build ✓ · 86/86 E2E** — the `357fb65` push
state exactly. Static audit of the R14 diff: clean.

Skills consulted (repo `skills/`): tdd (red→green vertical slices, seam
discipline), agent-browser (dual-session probing), clone-app-pat-pro
(computed styles as ground truth), tailwind-patterns (v4 CSS-first
rules).

**Redeploy check PASSED** — 12 probe routes byte-identical (h1
text/font/x/y); REF unchanged since round 14.

**Mobile navigation audit (user priority)**: top bar 390×73 sticky white +
1px slate-200 border; bottom tabs 78@766 with identical x-pitches
(10/79/139/204/313), 14px labels, 20px icons, active rgb(37,99,235);
drawer 288×844 #FAFAFA z-50 + footer 121@723 + submenu links at identical
y's + NO close button (the prior rounds' REF-drawer "miss" was a probe
bug: `offsetParent` is null for fixed-position elements — the panel probe
now asserts on position:fixed geometry); kicker 53px@89 (18px/700) +
scroll-away; md boundary 767 (mobile chrome + hamburger 28×28@24 on both)
→ 800 (desktop sidebar + Main Menu on both) — **all byte-identical, no
Tailwind v4 bug**.

**Full 46-route desktop sweep + a NEW zero-data empty-state sweep (13
routes) + a mid-viewport fitting audit (docW at 1280/1100) + a
token-surface color audit** found 5 gap groups (R15-A…E):

- **R15-A (systemic — tab-pill inactive color, 9 surfaces)**: REF
  inactive trigger text = rgb(115,115,115) = #737373 — the reference's
  `--muted-foreground` TOKEN (`0 0% 45.1%`), which DOES visibly render
  on tab surfaces (the session-6 "never visibly renders" claim was
  per-surface wrong). LOC rendered #64748B (the clone's token). Fixed by
  pinning `--color-neutral-500: #737373` and switching the TabsList
  default + the reports selector + the staffrequests pill to
  `text-neutral-500`. The muted-foreground TOKEN itself stays #64748b
  (300+ usages render REF's explicit slate classes — group labels, Demo
  labels verified byte-identical both sides).
- **R15-B (sidebar footer — three stale measurements)**: REF Bell =
  slate-600, REF Moon = zinc-700 #3F3F46, REF user name = zinc-700 (the
  session-6 slate-900 name reading is stale — REF redeployed). Fixed
  with explicit classes + the `--color-zinc-700` palette pin; applies to
  desktop sidebar AND mobile drawer footer (shared component).
- **R15-C (actions-cluster mid-viewport fitting)**: at 1100 the
  attendance page overflowed (docW 1199) — the cluster's `shrink-0`
  kept it at 911px inside the wrapping header row, defeating the
  documented R9-E "wraps the cluster to a second row" intent. Removed
  shrink-0 from the PageHeader default cluster: docW 1199 → 1100, and
  1440 geometry unchanged (h1 457, cluster 192, all header buttons
  byte-exact — shrinking only engages under constraint). The settings
  pill overflow at 1100 is REF parity (pill right edge 1259 both sides)
  — pills can't wrap.
- **R15-D (organogram)**: REF renders a BARE centered card 783×202 (NO
  CardHeader) with the simple empty recipe (64px slate-300 icon + ONE
  16px slate-500 line) inside `overflow-x-auto pb-8` >
  `min-w-max flex justify-center p-8`. LOC had a full-width headed card
  + full EmptyState. Rebuilt — now byte-exact; the with-data tree rides
  the same wrapper (smoke-verified with 2 injected reports).
- **R15-E (staffrequests)**: pill bg `bg-muted` (#F1F5F9) →
  `bg-secondary` (#F5F5F5 — REF's measured surface); default scope
  "all" → "mine" (the trigger now renders REF's SELECTED look at load:
  white bg + #0A0A0A; the toggle-to-all remains the superset).

**Documented non-gaps**: Category-A h1 furniture (9 routes, since R12);
the attendance fitting family (REF docW 1558 + 235px cards +
lg:grid-cols-5 vs the clone's fitting 211px + xl — REF's own overflow
bug); /templates +36px + /hrletters +52px CTA supersets; the
/evaluations sweep miss (hydration race — settles byte-identical);
REF's dead user button + dead reports tiles (clone supersets);
staffrequests aria-pressed toggle (a11y superset); documenttracker
empty state byte-identical (the probe had caught a stat tile).

`docs/remediation-plan-session16.md` written (5 groups + non-goals) and
codebase-validated before execution.

**TDD**: 12 new pins (all RED first) → GREEN; 3 stale pins updated (the
session-6 user-name color pin, the R14-D pill-classes window, the
shrink-0 cluster pin). Two pins refined during implementation (the
staffrequests comment broke a `\s*` window — widened to `[\s\S]{0,400}`;
the organogram `not.toMatch(/EmptyState/)` matched its own comment —
scoped to `<EmptyState`).

**Gates: lint 0/0 · tsc ✓ · 349/349 unit (+12) · build ✓ · 86/86 E2E.**

**Live dual-browser verification**: 9/9 pill surfaces byte-exact
(rgb(115,115,115) inactive everywhere; staffrequests pill
rgb(245,245,245) + white/dark selected trigger 137px); sidebar footer
colors byte-exact (Bell rgb(71,85,105), Moon rgb(63,63,70), name
rgb(63,63,70)) on desktop AND the mobile drawer; organogram byte-exact
(783×202@457, icon 64@277, line @357, h3 absent); attendance fit fixed
at 1100 with 1440 unchanged; full-route sweep re-run clean of
non-documented diffs; mobile regression clean. With-data smoke: 2
injected reports rendered the org tree in the new wrapper, then removed;
DB pristine (users=1, employees=1, leaveBalances=2).

**13 screenshots** captured/refreshed (21-organogram, 32-staffrequests,
33-settings, 34-profile, 35-attendance, 36-compliance, 37-reports,
40-recruitment, 20-evaluations, 42-performancemanagement,
02-dashboard, 11-mobile-dashboard, 12-mobile-drawer-open) → 53 total.

Documentation updated: AGENTS session-16 layer + 349 specs; SKILL v2.9.0
+ §28; PAD [S16] row + Last Updated + corrected test-distribution table
(recipes 220 / tokens 18); CLAUDE 435-spec pyramid + session-16 pins;
README 349 specs; this session log; worklog; remediation-plan
completion record.

## Session complete — parity round 15 pushed to `nordeim/eon-hr@main`

**Audit**: redeploy check (REF unchanged), mobile navigation verified
byte-identical end-to-end (no Tailwind v4 bug; the REF-drawer probe bug
itself was found and fixed), 46-route sweep, a new empty-state sweep, a
mid-viewport fitting audit, and a token-surface color audit.

**Fixes**: 5 gap groups with 12 new TDD pins — the systemic tab-pill
inactive color (the per-surface token lesson), three sidebar footer
colors (including the stale session-6 name measurement), the
actions-cluster fitting rule, the organogram bare-card rebuild, and the
staffrequests surface + default state.

**Gates**: lint 0/0 · tsc ✓ · **349/349 unit** · build ✓ · **86/86 E2E**
· 13 screenshots · DB pristine.

**Suggested next steps**: re-run the redeploy check next round; the
remaining frontier is with-data parity (both apps sit at zero data on
most modules — a seeded data state would unlock table-row/card-list
recipe comparisons), plus the REF-dead pages as polished superset
showcases; a tablet-band (768-1024) geometry sweep would extend the
fitting audit beyond the 1100/1280 points.
