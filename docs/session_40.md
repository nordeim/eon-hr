# Session 40 — Parity Round 23: The cursor + selection dimension

Continuing the parity cycle after round 22 (`37415a9` + session log
`a00272b`). The owner's brief pointed at session_38/39 +
remediation-plan-session23; session_38's suggested next steps were: re-run
the redeploy check, the with-data story (still blocked on REF's zero-data
state), the checkbox focus recipe (still no measurable REF surface),
reduced-motion (open on both apps), and the NEW dimensions — "the cursor
dimension (`cursor:` states were never swept), the selection/caret
dimension (`::selection` / caret-color), and a dialog-surface sweep". The
cursor + selection dimension became this round's core (the dialog surface
was partially covered in round 22 via the loans recipe).

Workspace RESET (fresh sandbox): fresh clone at `a00272b`; `.env` recreated
(`DATABASE_URL="file:../db/custom.db"` + fresh AUTH_SECRET); bun install;
db:push + db:seed (pristine users=1/employees=1/leaveBalances=2/payroll=0/
expenses=0); the shell `DATABASE_URL` trap guarded with `env -u` on every
DB/build command.

**Baseline gates: lint 0/0 · tsc ✓ · 411/411 unit · build ✓ · 86/86 E2E**
— the `a00272b` state exactly.

Skills consulted (repo `skills/`): tdd (red→green vertical slices),
agent-browser (dual-session probing), clone-app-pat-pro (computed styles
as ground truth — decisive this round), tailwind-patterns (v4 preflight /
layer-cascade rules).

**Redeploy check PASSED** — 12 probe routes byte-identical (h1
text/font/x/y; width deltas remain the documented REF-overflow family).
REF unchanged since round 22. **Mobile navigation audit PASSED
byte-identical** (top bar 390×73, tabs 10/79/139/204/313, drawer
288×844 #FAFAFA z-50, kickers 53/69, md boundary 767/800 — no Tailwind v4
bug). **With-data re-check**: REF still renders zero data (0 rows, empty
table text) — the frontier stays blocked (documented).

**The round's core — the FIRST cursor + selection/caret dimension audit**:

- **Static CSSOM enumeration is BLIND on REF** — a full cssText scan
  (cursor/user-select/::selection, @layer-aware) found zero rules on
  either side, yet REF computes `cursor: pointer` on every measured
  button. REF's rules live behind an unreadable sheet (cross-origin/blob
  family). Computed DOM census is the only ground truth on that side —
  the clone-app-pat-pro lesson, now load-bearing.
- **The systemic button-cursor gap**: EVERY REF button computes pointer
  (sidebar group toggles, header bell/moon/عربي/user trigger, dialog
  Cancel/Submit/Close, login socials + Sign in + Forgot password — 100%
  of measured buttons, all enabled). EVERY LOC button computed default
  (except tabs/switches/CTA tiles carrying explicit `cursor-pointer`).
  Root cause: **Tailwind v3's preflight ships `button { cursor: pointer }`
  and v4 REMOVED it** — a documented v4 breaking change the clone never
  compensated.
- **The touch-pan-y select-none wrapper discovery**: REF wraps page
  content in `div.touch-pan-y` (between `div.relative.overflow-hidden`
  and the page root) computing `user-select: none`. Chrome INHERITS
  user-select — so ALL page content (h1, cards, CTA tiles, table text,
  INPUTS) computes none on the wrapped pages while portaled surfaces
  (dialogs, dropdowns, the drawer) escape to auto. Element-level
  parent-chain walks pinpointed the author after the census showed
  inherited values.
- **The 46-route user-select classification sweep**: EXACTLY 8 REF routes
  are none-wrapped — /dashboard, /employees, /payroll, /attendance,
  /leavemanagement, /expenses, /loans, /taskmanager (the base44
  core-module family). The other 37 content routes compute auto (REF
  per-page inconsistent — /settings renders its tabs directly in the page
  root with NO touch-pan-y layer; /chat has no h1; /employeeselfservice
  is REF's dead spinner page).
- **Chrome recipes resolved element-by-element**: REF's moon
  (theme toggle) self-authors select-none (the clone's moon already
  matched); REF's bell/عربي/user trigger/group toggles are auto (match);
  REF's "Customize" computes none (the clone renders CustomizeButton
  inside the /dashboard page root — covered by the page-root fix); REF's
  attendance tabs compute none via the page wrapper (same fix).
- **Verified matches (no action)**: caret-color rgb(10,10,10) on every
  measured input both apps; input cursor text/default per type; links
  pointer (UA default); tabs/switch pointer; table th/td auto; kanban
  zero [draggable] both; dialog buttons auto/pointer (portal escape
  both); ::selection — zero authored rules on either side and identical
  empirical application (the h1 selection Range test matches).
- **Blocked (documented)**: checkbox cursor (zero REF surfaces on
  zero-data), [role=option] cursor (the synthetic select-open click did
  not register the listbox), disabled-button cursor (REF renders no
  disabled button on any measurable surface — the loans Submit Request
  computes pointer/enabled at an empty form).

`docs/remediation-plan-session24.md` written (2 gap groups + the cursor +
selection map + non-goals) and codebase-validated before execution.

**TDD**: 5 new pins (recipes.test.ts session-24 block — all RED before
implementation; one mid-flight correction: the first B1/B2 draft pinned
the pre-fix strings and passed vacuously — rewritten to pin the post-fix
contract, the r19/r20/r22 false-green lesson). GREEN: `@layer base {
button { cursor: pointer } }` in globals.css (R23-A — utilities still win
the v4 cascade, so `disabled:cursor-not-allowed` surfaces are unaffected)
+ `select-none` on exactly the 8 page roots (R23-B — the chrome, portals,
and the 38 auto routes stay auto, matching REF's computed map).

**Gates: lint 0/0 · tsc ✓ · 416/416 unit (+5) · build ✓ · 86/86 E2E.**

**Live dual-browser verification** (13 + 12 checks green): buttons now
13/13, 18/18, 20/20, 15/15 pointer across /dashboard /employees /settings
/payroll (+ tabs pointer, login 6/6 pointer); the 8 wrapped routes compute
none + the 3 auto representatives (settings, compliance, profile) stay
auto; the attendance tab + the employees search input now none; the loans
dialog buttons stay auto + pointer (portal escape); the canonical
12-route geometry sweep 12/12 MATCH + the mobile top bar 390×73 — zero
layout impact. Probe-tooling lessons documented: REF's stylesheet is
CSSOM-unreadable (computed census only); bare-string agent-browser evals
must be JSON.stringify'd or the harness parses them into error objects;
the agent-browser daemon resolves relative screenshot paths from ITS cwd,
not the shell's (absolute paths required).

**3 new evidence screenshots** (78-loans-dialog-pointer-cursor,
79-employees-select-none-page, 80-settings-selectable-scope) + 2 standards
refreshed (02-dashboard, 11-mobile-dashboard) → **95 total**.

Documentation updated: AGENTS session-24 layer + 416 specs; SKILL v3.7.0
+ §36 + counts (recipes 279); PAD [S24] row + Last Updated; CLAUDE
502-spec pyramid + session-24 pins; README 416 specs + 95 captures + the
cursor/selection parity row; this session log; worklog;
remediation-plan completion record.

## Session complete — parity round 23 pushed to `nordeim/eon-hr@main`

**Audit**: redeploy check (REF unchanged), mobile navigation verified
byte-identical (no Tailwind v4 bug), with-data re-check (still blocked),
and the FIRST cursor + selection/caret audit — computed census +
parent-chain walks + the 46-route user-select classification, with the
CSSOM-blind-on-REF discovery (computed DOM is the ground truth).

**Fixes (2 gap groups, TDD)**: the v4 button-cursor restoration
(`@layer base { button { cursor: pointer } }` — REF computes pointer on
100% of measured buttons; v4 dropped the v3 preflight rule) and the
touch-pan-y select-none contract (`select-none` on exactly the 8
REF-wrapped page roots; page content incl. inputs inherits none like REF
while portals escape to auto; the 38 auto routes pinned negatively).

**Gates**: lint 0/0 · tsc ✓ · **416/416 unit** · build ✓ · **86/86 E2E**
· 3 new screenshots · DB pristine.

**Suggested next steps**: re-run the redeploy check next round; the
interaction map now covers focus + hover + pressed + motion + scroll +
cursor/selection; remaining frontier — the with-data story (re-check
whether the reference gains data), the checkbox focus recipe (still no
measurable REF surface), reduced-motion (open on both apps), a
dialog-surface sweep of the clone's other dialogs against REF (only the
loans dialog is measurable — the rest are dead controls on zero-data
REF), and possible NEW dimensions: the `aria-*`/a11y attribute dimension
(labels, describedby, roles were never swept as a family), the
form-validation error-surface dimension (REF's zero-data state hides them
all), and the print/reading dimension beyond the session-18 print
stylesheet audit (page-break + print colors).
