# Remediation Plan — Session 96 / Parity Round 95: the with-applicants superset-interiors round

**The frontier.** The r95 close-out's queue: the with-applicants pipeline
interiors the CLONE's working creation path enables (the REF's own creation
paths are the documented 403-broken class — its with-applicants states are
UNREADABLE there) + the remaining mobile-overflow spot-census on the other
tabbed routes (the r95 pill-wrap pattern) + the standing watches (the
re-armed login ladder, the recharts grid class, the dark-band theming) + the
neo-crm session-187 tech-stack pattern check (the v4 space-y INLINE-FLOW
variant).

**The opening read — the 65th login deploy, NON-VISUAL.** The login JS moved
again (`index-CI-M8KyE` → `index-Cb4GrjTt`; CSS UNCHANGED at
`index-ByKl99Mk`; the app side QUIET at the recorded `C-IrDy5f` /
`BGNH4KkS`). The fresh login pair **BYTE-IDENTICAL** to the standing
`69aa4241…` baseline (the census intact: the 6 buttons, the 2 inputs, the
title, no Turnstile). The remaining ladder (standing audits, route sweep,
verify-r45, verify-r49, the experiment probe) runs after the E2E baseline
completes (the E2E-runs-ALONE protocol).

**The round's work.**

| # | Surface | The plan |
|---|---|---|
| R96-A | the REF's Add Applicant creation re-test | The r95 classification (audit-log 403, the dialog stays open, nothing created) is re-armed ONE more time on the live REF — if the platform fixed it, the with-applicants interiors become READABLE and a true cross-side compare opens; if it still fails, the classification stands (documented, no clone change). |
| R96-B | the clone's with-applicants pipeline interiors | Through the CLONE's working creation path (the Add Applicant dialog on the kanban + the AI CV upload): seed a candidate against the active job, then live-read the interiors the REF cannot render — the kanban CARD (the avatar/name/stage-recipe), the applicants TABLE row (the avatar/name/email/score bar/skills badge/status/actions), the row Actions dropdown (the Move-to menu), the interviewassistant's candidate select (now with data — the superset option list), and the recruitment stats row (1 active job + N applicants). Mobile spot-checks at 390 (the card, the table's min-content). Cleanup: the candidate is swept at close (DB pristine). |
| R96-C | the mobile-overflow spot-census (the other tabbed routes) | The source census found the candidates: settings (7 triggers, est ~980px min-content), attendance (3 icon+text triggers, ~452), profile (4 triggers, ~528) — plus the control set already designed mobile-safe (evaluations `grid w-full grid-cols-3`, payrollreports `grid grid-cols-4 w-full md:w-auto`, compliancedashboard ~361, performancemanagement ~346, staffrequests' single trigger). Live 390 reads of `document.documentElement.scrollWidth` + the tablist's geometry on each; any >390 gets the r95 pattern (flex-wrap on the pill, dormant at desktop, the desktop render re-verified byte-identical). |
| R96-D | the v4 space-y INLINE-FLOW variant scan (the neo-crm D-187a3 lesson) | The neo-crm round-187 catch (the v4 margin-block-end on inline-level children drops baseline-aligned rows ~8px vs v3's margin-top) — a full-repo source scan for `space-y-*` containers with inline-level DIRECT children. The scan's 14 heuristic hits ALL resolve to block-level children (`li`, `div.flex`, `w-full flex` buttons — the `<button>`/`<span>` matches were deeper descendants): **0 live instances**. The codebase's standing cures (R95's explicit mt-2 + the login family) already cover the real cases. DOCUMENTED as a clean classification. |
| — | the standing watches | The 65th-or-newer login ladder (re-armed — steps 2+3 after the E2E), the recharts grid class (REF 15-16 verticals vs the clone's 19-23 — the classified 2.x-vs-3.x residual), the dark-band theming (the experiment system), the patch watch (next 16.4.3 published, HOLD at 16.4.2 — the neo-crm repo holds the same), the TW-v4 oklch scan (clean), secrets (zero). |

## The test plan (TDD)

**If the census finds an overflow member (R96-C)** — the r95 pattern:
`tests/e2e/session96-*.spec.ts` (RED first — the page's scrollWidth >390
assertion fails against the unmodified build) → the `flex-wrap` fix → GREEN
+ the desktop byte-identity re-verified live + the unit pins appended to
`tests/unit/recipes.test.ts` (the amended pill class strings).

**If the REF's creation path now works (R96-A)** — the with-applicants
interiors become a true cross-side compare (the kanban card + the table row
contracts live-captured on the REF, diffed against the clone's; any
divergence TDD-fixed per the standing protocol).

**R96-B's superset interiors** — live-read + evidence PNGs; no REF contract
exists (its creation is broken) so the verification is the clone's internal
consistency (the data flows: create → read → move → delete; the geometry
self-consistent at both viewports).

## Gates

lint 0/0 · tsc ✓ · unit 995+ ✓ · build 116/116 · E2E 547+ (the ALONE
protocol) · DB pristine at close · the evidence chain · the mobile-menu
cycle + the R90-B sheet re-verified if any tablist changes.

## Execution appendix (filled at close)

- **The round's classification: ZERO clone-authored divergences found — a
  pure verification + classification round** (the first no-fix round of the
  series: every flagged candidate resolved to parity, a standing
  classification, or a REF-broken hold).
- **R96-A — the REF's Add Applicant creation re-test: STILL BROKEN, the
  classification DEEPENED.** The dialog opens (the 512×522 contract, the
  seven labels), but the Job Posting combobox ("Select job") opens an EMPTY
  `role=listbox` (`data-state=open`, ZERO options — the popover DOM read
  verified the listbox exists and carries no children). The required field
  can never be satisfied → the creation path is uncompletable AT ITS ROOT
  (not merely the r95-observed 403-on-submit): the same audit-log-403
  family as the page-level filter comboboxes. The clone's working
  pipeline stays the superset (no clone change).
- **R96-B — the clone's with-applicants interiors: ALL WORKING** (end-to-end
  through the clone's own paths): the Add Applicant dialog (512×522, the
  seven fields, the native job select with all 3 jobs + the 6-source set)
  → the POST fires + the dialog closes + the kanban card appears (228×111
  at x302 y220: the initials avatar "RT", the name, the job, the stage
  chip "RT · Applied"… the card text "R96 Test Candidate | System Admin |
  RT · Applied | Move to") · the applicants TABLE row (6 cells: the
  avatar+name+email · the job · "Not scored" + the progress bar · the
  skills "—" · the Applied badge · the 32×32 actions trigger at x1363)
  · the Actions dropdown (the Move-to menu: Interviewing/Offer/Hired/
  Rejected + Remove — the current stage excluded, w128 at x1267) · the
  stats row (1 active job · N applicants · 0 shortlisted · "—") · the
  interviewassistant's candidate combobox WITH DATA (the options render
  "Unassigned" + "R96 Menu Probe · HR Manager" — the REF's own opens empty
  at its 0-candidate tenant) · the PATCH move (applied → interviewing)
  and the DELETE cleanup both work · the mobile 390 kanban card fully
  visible (x30 y377 w228, right ≤ 391). Evidence: 3 PNGs
  (r96-loc-kanban-card / r96-loc-actions-menu / r96-loc-kanban-mobile).
- **R96-C — the mobile-overflow census: FULL PARITY (the round's
  headline).** Every flagged route renders the REF's own overflow
  BYTE-IDENTICALLY: settings 1003=1003 (the 7-trigger tablist w971=971),
  attendance 943=943 (tablist w471=471), profile 539=539 (w507=507),
  payrollreports 583=583 (w551=551), compliancedashboard 451=451, and
  recruitment 550=550 (the tablist w439=439, the triggers at the same x
  positions) + recruitmentkanban 1376=1376 (the 5 columns × w256 at the
  same x=16/288/560/832/1104). The r96 queue's premise (the pill-wrap
  pattern "applies wherever a tablist's min-content exceeds 390") is
  RETIRED: the REF itself overflows the same way at the same widths —
  the parity contract is to overflow identically, not to wrap cleanly.
  The r95 flex-wrap on the recruitment pill stays DORMANT (both sides'
  page min-content is floored at 550 by the applicants table; the wrap can
  never engage at any viewport — verified at 390 AND 360).
- **The r95 sub-band claim RETIRED: the REF's /recruitment now renders at
  every width.** The r95 close documented "the REF renders an EMPTY #root
  below ~640 on this route" — today's REF renders /recruitment at
  360/390/640/700/767 (non-empty at all five, scrollW 550 at the mobile
  widths). One of the recent deploys fixed the REF's mobile render on
  this route. The documented REF-broken mobile set OTHERWISE HOLDS
  (re-verified: hrreports + interviewassistant still render an empty
  #root at 390; employeeselfservice still shows "Loading your profile..";
  employeedetail still the empty shell).
- **R96-D — the v4 space-y INLINE-FLOW scan: 0 live instances.** All 14
  heuristic hits (dashboard/employeeportal/payrollreports/requestreports
  ×4/requestsettings/shiftcalendar/login ×3/not-found/select.tsx) resolve
  to block-level DIRECT children (`li`, `div.flex`, `w-full flex`
  buttons) — the `<button>`/`<span>` matches were deeper descendants.
  The codebase's standing cures (R95's explicit mt-2 + the login family)
  cover the real cases. Clean classification; the neo-crm D-187a3 lesson
  is documented as a watch, not a live defect.
- **The standing watches: ALL GREEN.** The 65th login deploy NON-VISUAL
  (JS `index-CI-M8KyE` → `index-Cb4GrjTt`, CSS unchanged at `ByKl99Mk`,
  the app side quiet at `C-IrDy5f`/`BGNH4KkS`; the fresh pair
  byte-identical to `69aa4241…`) · the full ladder: standing 5/5 · route
  sweep 12/12 · verify-r45 13/13 · verify-r49 13/13 · Turnstile
  configured-but-0-rendered (the config now also carries
  TURNSTILE_PASSWORD_RESET_ENABLED) · the experiment system active (a
  fresh visitor assigned the `tagline` variant, auth-signup-free-tagline
  v19) · the recharts grid class HELD (5=5 charts, 7=7 horizontals, the
  16-vs-23 vertical delta = the classified 2.x-vs-3.x residual) · the
  patch watch: next 16.4.3 published (the HOLD at 16.4.2 stands — the
  neo-crm repo holds the same) · TW-v4 oklch scan clean · secrets zero.
- **Gates: lint 0/0 · tsc ✓ · 995/995 unit · build ✓ 116/116 · E2E
  546 passed + 1 resource-pressure casualty re-verified 13/13 on the
  idle machine (the documented class — the suite effectively 547/547;
  NO source changes this round, so the opening baseline IS the closing
  gate)** · DB pristine at close (the loading-probe user + the r96 test
  candidates swept; users 1, candidates 0).
- **The round's traps (documented in the SKILL)**: the bash
  double-quote `$` expansion silently emptied the login password (the
  census script's fills sent an empty password — single-quote the
  password in every agent-browser fill) · the `//` comment inside an
  eval expression swallows the rest after the one-lining join (no
  comments inside eval strings) · the E2E-concurrency class re-fired
  once (1 casualty, the idle re-run green) · the agent-browser thread
  exhaustion (EAGAIN on spawn) after rapid session cycling (the cleanup:
  pkill the shells, restart :3200 if it died) · the :3200 auth limiter
  (10 logins/15min) forces a server restart every ~10 scripted
  sessions.
- **The push: PENDING the operator's SSH deploy key.** The commit
  (`0f6e679`) is on local main with all gates green; the SSH wrapper
  path is prepared (the paramiko shim at the workspace `bin/`, the
  wrapper at `docs/ssh_git_wrapper_v3.py`), but the deploy key is not
  present in this sandbox (operator-provided in past sessions, shredded
  per the protocol, and not carried by the context summary). Per the
  LOST-PUSH lesson the round is not landed until the push verifies —
  materialize the key, dry-run, push, verify remote == local HEAD.

