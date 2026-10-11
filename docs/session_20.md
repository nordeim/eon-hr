# Session 20 — Parity Round 13: systemic iconed-button margins, white tab pills, settings/profile/attendance/compliance/reports rebuilds

Context: continuing the parity cycle after round 12 (`94959e9`, 285 unit +
86 E2E). The repo owner supplied `docs/session_19.md` — the round-12
transcript — whose suggested next steps were: spot-check the new
screenshots, re-run the redeploy check first, and focus on data-bearing
states. This round executed the redeploy check and a full second-tier
surface audit (iconed buttons, tab pills, field recipes, per-page card
interiors) that found the gap groups below.

Workspace was reset before this session; fresh clone at `e0b7ea6` (= the
R12 push + session-log commit). Setup: `.env`
(`DATABASE_URL="file:../db/custom.db"` + fresh `AUTH_SECRET`), `bun
install`, `db:push` + `db:seed`, Playwright browsers cached. DB pristine
(users=1, employees=1, leaveBalances=2). The `ensure-server.sh` guard was
recreated (check-and-restart the :3200 standalone server before every
browser step — the sandbox reaps background processes between tool calls).

**Baseline fully validated: lint 0/0 · tsc ✓ · 285/285 unit · build ✓ ·
86/86 E2E** — exactly the `e0b7ea6` push state. Static audit of the R12
diff: clean (no `any`, no secrets, no debug patterns).

**Redeploy check**: visible-h1 text/font/weight/position byte-identical
on 11 probe routes — REF unchanged since round 12. (A transient 61px REF
mobile top-bar reading was diagnosed as a mid-hydration measurement; the
settled value is 73px on both sides.)

**Mobile navigation audit (user priority)**: top bar (390×73 white +
1px border), bottom tabs (78@766, 5 tabs, 14px labels, 20px icons, x
10/79/139/204/313), drawer (288×844 #FAFAFA z-50, overlay
rgba(0,0,0,0.8), footer 121@723, 16px icons), submenu expansion (links
at identical y's), kicker (53px@89, 18px/700) + scroll-away (−64 at
scrollY 200, top bar pinned), md boundary (767 mobile chrome → 800
desktop 256px sidebar, group labels identical) — **all byte-identical;
no Tailwind v4 bug**.

**Full 46-route sweep + iconed-button enumeration + per-page DOM dumps**
found 12 gap groups (R13-A…L):
- **R13-A systemic**: the reference's iconed buttons carry svg `mr-2`
  (16px effective gap) or `mr-1` — ten call sites were missing it
  (employees/payroll/payrollmodule/taskmanager/attendancedashboard/
  documenttracker/surveyanalytics/analyticsdashboard/advancedanalytics/
  compliance). advancedanalytics Schedule Report was also the wrong
  VARIANT (default gradient, not outline).
- **R13-B settings**: the tab pill is the DEFAULT shrink-wrapped TabsList
  with `bg-white border border-slate-200` (971px — not the full-width
  muted pill); 7 iconed tabs (16px svgs); Company card = border-b
  title-only header + iconed h-9 Edit + `grid md:grid-cols-2 gap-6` of
  p-4 read-only tiles; 631px card.
- **R13-C profile**: exactly 4 iconed tabs (no User tab); General tab =
  border-b DIV-title header + p-6 form (68px line-box fields + Save
  Changes iconed INSIDE the form); no CardFooter; h2 drops truncate.
- **R13-D attendance**: the stat tabs are Mark Attendance / Employee
  Summary / Records (iconed, 471px white pill); non-admins get the
  centered access-restricted recipe (64px red-100 circle chip).
- **R13-E compliancedashboard**: text-only header CTA; tab content =
  90px mini-centered stat row + notify row (mr-1) + `p-4` toolbar (bare
  search svg + w-48 input + two w-36 selects + ml-auto counter) +
  title-only table card.
- **R13-F reports**: one card per category (20px-iconed leading-none
  title) wrapping `grid md:grid-cols-2 lg:grid-cols-3 gap-4` of 346×126
  tiles (two flex-1 iconed 152×32 buttons); Report Filters card =
  `grid md:grid-cols-4` with a Status field.
- **R13-G offboarding**: `grid md:grid-cols-2 lg:grid-cols-3` with the
  empty state as ONE `col-span-full` 238px card — no CTA (the header
  button is the affordance).
- **R13-H selects/Export**: surveyanalytics w-48 + h-8 Export (97×32);
  analyticsdashboard w-36; attendancedashboard w-44.
- **R13-I StatCard no-tile variant**: flex row — text stack left +
  40×40 icon right; 108px cards.
- **R13-J taskmanager**: empty columns keep their `space-y-2` list
  container (60px); count badge is a DIV.
- **R13-K payrollengine**: `space-y-2 leading-5` fields + mt-2 controls
  (64px fields, 132px card).
- **R13-L small pins**: hrreports Group By defaults EMPTY (Status Filter
  shows All); shiftcalendar chevrons+label ride a `gap-2` cluster inside
  the gap-4 toolbar; Shift Swaps renders as an ANCHOR
  (href="/ShiftSwap") opening the superset dialog; employees view
  toggles render Grid first; surveys zero-render (nothing below the stat
  row at 0 surveys — the employees pattern).

**Engineering finds during implementation (the round's hard-won
knowledge):**
- **agent-browser eval does NOT un-escape JSON string args** — flatten
  probe scripts to one line before `eval` (a `\n` literal breaks the
  browser-side parse). All r13 probe scripts do
  `PROBE.split("\n").join(" ")`.
- **Lucide icons default to 24px** — tab triggers need explicit
  `h-4 w-4`/`h-3 w-3` classes or every pill grows +8px per tab.
- **Tab roots with `space-y-6` need every TabsContent `mt-0`**: the
  default `mt-2` STACKS with the pill's 24px margin-block-end because
  margins don't collapse across an inline-flex sibling — an 8px
  tab-content offset on three pages.
- **The line-box field recipe (R12-B lesson generalized)**: bare
  `div.space-y-2` > INLINE label + control with `mt-2`. The inline
  label's line box provides the 4px top offset; vertical margins on the
  inline label are ignored by layout. Flex wrappers and `pt-1`/
  `space-y-3` fight the line box.
- **REF's Schedule Report button is the default gradient variant** —
  its 179px width decodes as border-0 + the standard CTA recipe.

`docs/remediation-plan-session14.md` written (12 gap groups + execution
order + documented non-goals) and validated against the codebase before
execution.

**TDD**: 39 new session-14 pin blocks (all confirmed RED; 2 refined
during implementation — the compliance text-only regex and the offboarding
multi-line CTA matcher; 1 stale session-11 pin updated to min-w-36 after
the gap-2 cluster decode). GREEN via: StatCard no-tile flex row, then the
per-page sweeps. One E2E spec updated (the taskmanager badge selector —
span→div, scoped to the board to avoid the sidebar "Main Menu" label).

**All gates green: lint 0/0 · tsc ✓ · 324/324 unit (+39) · build ✓ ·
86/86 E2E.**

**Live dual-browser verification** (37-check probe across every fixed
surface): 34 PASS + 3 documented — profile h2 777 vs 765 (the reference
block-fills its column — Category-A furniture, same as the sidebar-brand
h2), attendance pill y+24 (the reference's own 2-line header overflow
bug), compliance stack 491 vs 492 (1px sub-pixel). Every fixed surface
byte-exact: settings pill 971 + card 631; profile pill 507 + tabs
103/106/158/130 + card 335; attendance tabs 167/189/104; compliance pill
331 + tabs 219/102 + scan 184; reports card 387 + filters 187; offboarding
238; selects 192/144/176; Export 97×32; no-tile stats 110 with 40px
icons; taskmanager 60; payrollengine 132; shiftcalendar anchor 147@1261,72
+ chev2@484; hrreports select texts `["Employees","","Bar Chart","All"]`.

Full-route sweep re-run: every fixed surface out of the diff; the
remaining diffs are the documented categories (Category-A h1 furniture ×8,
REF's attendance overflow/2-line header, employeeselfservice dead page,
profile Category-A h2). Mobile regression clean (top bar 73, bottom tabs
78@766, settings pill 971@16 even at 390px).

**19 screenshots** captured/refreshed to `docs/screenshots/` (the seven
rebuilt pages + nine standards + the mobile set).

Documentation updated: AGENTS.md session-14 recipe layer + 324 specs;
SKILL v2.7.0 + §26; PAD `[S14]` row + Last Updated; CLAUDE.md 410-spec
pyramid + session-14 pin list; README 324 specs + 48 captures; this
session log; repo worklog.md; remediation-plan completion record.

DB pristine (users=1, employees=1, leaveBalances=2, payroll=0,
expenses=0).

## Session complete — parity round 13 pushed to `nordeim/eon-hr@main`

**Audit**: redeploy check (REF unchanged), mobile navigation verified
byte-identical end-to-end (no Tailwind v4 bug), full 46-route sweep, an
iconed-button enumeration across 22 routes, and per-page DOM dumps of
every suspect surface.

**Fixes**: 12 gap groups — the systemic iconed-button margin matrix, the
white shrink-wrapped tab-pill recipe on four pages (with the space-y-6 +
mt-0 root pattern), the generalized line-box field recipe, the settings
and profile card rebuilds, the attendance/compliance/reports/offboarding
restructures, the no-tile StatCard variant, the surveys zero-render, and
five small pins. 39 new TDD pins.

**Gates**: lint 0/0 · tsc ✓ · **324/324 unit** · build ✓ · **86/86 E2E**
· 19 screenshots · DB pristine.

**Suggested next steps**: re-run the redeploy check next round; the
remaining audit frontier is data-bearing states on the rebuilt pages
(compliance table rows, reports tile interactions, profile form saves)
and the REF-dead pages as functional-superset showcases.
