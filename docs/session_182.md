# Session 81 — Parity Round 80 (the tablet-band remediation round: three clone-authored defects found in the never-measured lg band + the cluster-wrap class, all TDD-fixed — the first source changes in eight rounds)

**The sandbox was reset AGAIN (the fourth consecutive reset).** The workspace
held only the bare scaffold. Fresh clone from
`https://github.com/nordeim/eon-hr.git` at `582d3f3` (main, clean,
remote-matched): the r80 audit `9366114` + the two owner transcript commits
(`1c7c147` session_180 + `582d3f3` session_181). This session maps to
**Session 81 / Parity Round 80**, the narrative at session_182, the plan at
`docs/remediation-plan-session81.md`.

## The rebuild (R81-A)

Environment rebuilt from zero per the standing protocol: `.env` from
`.env.example` (DATABASE_URL="file:../db/custom.db", AUTH_SECRET generated),
`bun install` (525 packages), db:generate + db:push + db:seed (Annual 21/21,
Sick 30/30), DB pristine verified (users=1, employees=1, balances=2, jobs=0).
**The exported-DATABASE_URL trap ACTIVE again** (the sandbox exports
`file:/home/z/my-project/db/custom.db` — the `env -u DATABASE_URL` guard on
every invocation, the fourth-sandbox running).

## The gates (R81-B/C)

Baseline gates on the unmodified HEAD, all green first-try: **lint 0/0 ·
tsc clean · 941/941 unit · build OK · the standalone healthy on :3200**
(`{"status":"ok","db":"up"}`, /login 200). The standing checks all green:
the patch watch QUIET (next 16.4.2 the latest stable; the 16.5 line at
16.5.0-canary.23) · `bun audit` UNCHANGED (the two upstream-blocked
dev-chain advisories: braces ≤3.0.3 still the latest published;
deepmerge-ts <8 under prisma's exact `@prisma/config` 6.x pin) · the TW-v4
scan clean (15 `!important` all globals.css; oklch 6/6 comments-only) ·
secrets zero (the standing seed fixture from the initial commit) · the
DOM-XSS sink census ZERO-UNSAFE (the 9 pattern matches classified exactly
per the standing census).

## The opening read (R81-D): BOTH SIDES QUIET + the 52nd's full ladder

The r81 watch (armed at the post-52nd finals) read **BOTH SIDES QUIET** —
login JS `index-By5t4Bdg` + CSS `index-dbXqk6oa`, the app side
`C-IrDy5f`/`BGNH4KkS`, the login DOM census unchanged (the six-button set,
one form, zero Turnstile, zero iframes). Per the standing carry-forward,
**the 52nd generation's FULL standing ladder ran as this session's opening
read**: the fresh logged-out login pair BYTE-IDENTICAL to the standing
`69aa4241…` baseline (`scripts/r81-login-probe.mjs`) + standing **5/5** +
sweep **12/12** (the r52 orchestrator, first-try clean) + verify-r49
**13/13** + verify-r45 **13/13** → **the 52nd generation FULLY LADDERED
NON-VISUAL.**

## The fresh-eyes instrument (R81-E): THE TABLET (md-BOUNDARY) VIEWPORT MATRIX + THE lg-BAND GRID CENSUS — THREE CLONE-AUTHORED DEFECTS

The program's responsive parity proof covered 1440x900 (the standing byte
chain, seventeen rounds) and 390x844 (the r80 mobile viewport matrix + the
651-663 baselines); the session-7 R6-A sweep verified the NAV SHELL boundary
at 700/767/768/800/900/1024 — but the CONTENT ROUTES' rendering at the md
boundary (768x1024) and in the whole 1024-1279 lg band was NEVER audited.
The tablet middle was the last unmeasured responsive band, and the lg band
is a classic TW-v4 off-by-one bug surface. The instrument chain: the recon
(`scripts/r81-tablet-recon.mjs` — /dashboard on both sides at 768 + the 767
off-by-one edge: the mobile header unmounts, the desktop sidebar mounts,
main pushed to x=256 w=512 IDENTICAL, the 767 edge keeps the mobile chrome
live on both sides) → the matrix (`scripts/r81-tablet-matrix.mjs` — the
12-route sweep set at 768x1024, member-wise) → the detail reads
(`scripts/r81-tablet-detail.mjs` + the inline chain-diff/leaf-author/
stat-card censuses).

RAW at 768: 2/12 MATCH, 10 FINDs. The detail reads classified every FIND —
and the deep-dives (the overflow-author census, the grid-to-body chain
diff, the transient min-content clamp, the fonts census — the fonts
IDENTICAL on both sides) surfaced THREE clone-authored defects plus one
NEW INSTRUMENT TRAP:

**R81-A — /attendance's stats grid carried `xl:grid-cols-5` where the REF
rides `lg:grid-cols-5`.** Live-measured at 1024: the REF renders FIVE
computed columns (`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4`)
while the LOC rendered THREE (`… xl:grid-cols-5`) across the whole
1024-1279 band — a band the standing 390/1440 audits could never see (at
390 both are grid-cols-2, at 1440 both are 5 columns). FIXED: the member
corrected to `lg:grid-cols-5` (the comment documents the live
measurement).

**R81-B — /payroll's PageHeader row omitted `rowBreakpoint="md"`.** The
REF's payroll row is the md family (`hidden md:flex flex-col md:flex-row
justify-between items-start md:items-center gap-4` — live-measured); the
LOC's emitted the sm default (`sm:flex-row sm:justify-between
sm:items-center`). Visually inert (the row is hidden below md on both
sides — display:none measured at 700; row at md+; the raised offset rowY=64
verified identical; the 1440 geometry byte-identical to the pixel), but the
DOM member contract now matches the REF. FIXED: `rowBreakpoint="md"` added.

**R81-C — THE ACTIONS-CLUSTER WRAP CLASS (the round's deepest find).** The
r81 cluster census (34 pages read on BOTH sides @1024 — the responsive-row
16 + the alwaysRow 13 + the sweep set) measured the REF PER-PAGE
INCONSISTENT: payrollmodule + attendancedashboard wrap (`flex items-center
gap-3 flex-wrap` — the clone's default MATCHES those two), staffrequests
rides `flex gap-2` (the clone's actionsBare ✓), recruitment/expenses/
leavemanagement/recruitmentkanban render single actions DIRECTLY in the row
(the clone's actionsUnwrapped ✓), the alwaysRow pages all match — and FIVE
pages (payroll, taskmanager, documenttracker, attendance, assetmanagement)
ride the BARE UNWRAPPED `flex gap-3`. The clone's flex-wrap default on
those five COLLAPSED their header rows at tablet width where the REF's rows
keep their natural min-content and the page overflows — the session-16
anti-overflow divergence contradicting the r78-r80 REF-authored-overflow
parity standard. The mechanism hunt (the grid-to-body chain diff —
structurally IDENTICAL chains with different used widths; the transient
width clamp proving Tailwind's grid-cols-4 = `repeat(4, minmax(0, 1fr))`
has NO min-content floor; the fonts census — IDENTICAL stacks and metrics)
pinned the author: the REF's unwrapped clusters force the header ROW's
min-content (payroll: hero-min + gap + 339px cluster ≈ 540 → wrap 541 →
main 605 → scrollW 861) while the wrapped clusters collapse. FIXED: the
`actionsNowrap` variant added to PageHeader (`flex gap-3`) + applied to the
five measured pages. **The fix's live effect, verified at every band:**
at 768 the payroll/taskmanager/documenttracker overflows went to
**BYTE-IDENTICAL** (861/861, 847/847, 901/901 — was 861/768, 847/768,
901/768) and attendance converged 791→1231 toward the REF's 1558 (the
remainder = the records data, the mechanism identical); at 390 the
attendance overflow went **BYTE-IDENTICAL** (943/943 — was 943/503,
correcting the r80 "data-authored" misclassification: that delta was the
cluster mechanism); **at 1440 the attendance cluster's wrap was ENGAGED
pre-fix** (the 7-button cluster is 1190px > the 1120px wrap — the pre-fix
LOC rendered it 2-line where the REF renders one line 911px, h=36 — a
standing-width divergence no prior audit caught because the PNG chains are
per-side and no member audit read the cluster's line count); post-fix the
LOC renders the cluster IDENTICAL to the REF (flex gap-3, 911px, one line,
h=36). The lg-band grid census (`/tmp`-scoped matrix, 12 routes at 1024)
went from 2 FINDs to **12/12 MATCH** post-fix.

**THE NEW INSTRUMENT TRAP — the r45 probe-user cookie contamination:** the
verify-r45 signup flow (ladder step 5) leaves the `loc` browser session
authed as `loading-probe@example.com` — every subsequent loc-side read runs
as the wrong identity, and the /profile read renders the probe user's
profile (its truncate email paragraph) instead of the seeded user's. The
tablet matrix's first /profile read was contaminated (the raw FIND showed a
mainRect delta 571 vs 581 that VANISHED on the clean re-auth — the clean
read is byte-identical 571/571 + 827/827). The r80 mobile matrix's
/profile read was ALSO probe-authored (the r80 classification conclusion —
shell-authored both-sides overflow — still held, but on the wrong-user
evidence). The protocol addition: **re-auth the loc session as the seeded
user after every r45 ladder run, before any subsequent loc-side read.**

## The TDD proofs (the session81-lg-band spec — RED → GREEN)

`tests/e2e/session81-lg-band.spec.ts` (7 tests): R81-A the attendance grid
at 1024 = FIVE columns + the member contract + the boundary (3 at 768, 5 at
1440); R81-B the payroll row's md-family members + the below-md hidden
boundary; R81-C the five bare-cluster pages render `flex gap-3`, the
payroll @768 overflow parity (scrollW > innerW), and the wrap-variant
regression guard (payrollmodule + attendancedashboard keep flex-wrap). All
RED pre-fix on the exact defect assertions (3≠5 columns; `sm:flex-row`
≠ `md:flex-row`; `flex flex-wrap items-center gap-3` ≠ `flex gap-3`), all
GREEN post-fix.

## The byte chains (R81-F/G) — `scripts/r81-screenshots.mjs`, numbers 665-709

The login pair 665 ≡ the r80 633 pair on BOTH sides (`bd718ed0…` /
`69aa4241…`) · the mobile drawer pair 681 ≡ the r80 649 pair on BOTH sides
(loc `e3df921…`, ref `bfaa0da5…` — the SEVENTEEN-round chain
681≡649≡632≡615≡597≡579≡561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366) —
both standing pairs RE-CAPTURED on the closing 54th generation
(`scripts/r81-final-pairs.mjs`) so the chain claims are made on the
generation the round closes on · the seven 1440 route pairs (667-679): 6/7
BYTE-STABLE both sides with **673-attendance-light-loc DRIFTING BY DESIGN**
(the R81-C unwrap re-authors the attendance cluster at 1440 — the pre-fix
2-line wrap corrected to the REF's one-line 911px cluster; the ref side
STABLE — the drift is the remediation's 1440-band proof) · the mobile
re-baselines (683-695): 6/7 BYTE-STABLE with **689-attendance-390-loc
DRIFTING BY DESIGN** (the unwrap re-authors the attendance mobile overflow
toward the REF's own 943 signature; the ref side STABLE) · **THE FIRST
TABLET-WIDTH (768x1024) PER-SIDE BASELINES (697-709)** — the seven standing
routes captured per-side at the md boundary, the round's fresh-eyes angle,
the chained evidence byte-compared from r82 onward. **The mobile-menu
functional cycle GREEN** (the standing user emphasis): toggle → the drawer
(Dashboard / Training LMS / Assets / Staff Requests) → the Training LMS
link CLICKED:/training → the URL lands on /training → the drawer
auto-closes (`open: false`) — no TW-v4 regression. 46 PNGs (852 pre-round by the git truth — the r80 record's 846 was another 6-file arithmetic drift, corrected here → 898
tracked).

## The round-end deploy reads (R81-I): the 53rd fully laddered + the 54th step-1-proven

The round-end watch read **THE 53RD-LINE LOGIN DEPLOY** (login JS
`index-By5t4Bdg`→`index-CYumVlcN` AND login CSS `index-dbXqk6oa`→
`index--4Ltml9o` — the NINTH login-CSS movement; the app side QUIET). The
FULL CONFIRMATION LADDER GREEN on the 53rd: the fresh login pair
BYTE-IDENTICAL to the `69aa4241…` baseline + standing **5/5** + sweep
**12/12** + verify-r49 **13/13** + verify-r45 **13/13** → **NON-VISUAL.**
The ninth movement's forensics (fetched live from `/static/`): `dbXqk6oa`
903630 → `-4Ltml9o` 903434 (**−196 B: 5 removed / 0 added** — the `.pb-72`,
`.sm:w-[320px]`, `.sm:py-5`, `.sm:pb-48`, `.lg:px-[72px]` rules swept); the
PRECISE full-name usage sweep against the real 53rd entry
(`index-CYumVlcN.js`, 97493 bytes via stat): **ZERO usages — a pure
DEAD-CODE SWEEP** (the second consecutive; the eighth swept 16, the ninth
sweeps 5). **THE 54TH-LINE DEPLOY landed during the forensics** (login JS
`CYumVlcN`→`index-Bl8PUA_n`, CSS QUIET at `-4Ltml9o`; the entry 97493
bytes, the same size — the chunk-graph-rebuild signature): step-1-proven at
the close (the fresh login pair BYTE-IDENTICAL to the `69aa4241…`
baseline); **the full standing ladder on the 54th-or-newer = r82's opening
read** (the app side QUIET through every generation — the standing results
carry across login-side-only deploys).

## The instrument traps retired (R81 — all infrastructure, classified before touching source)

(1) **The r45 probe-user cookie contamination** (the NEW trap — the
verify-r45 signup flow leaves the loc session authed as the probe user;
re-auth the loc session after every r45 ladder run before subsequent
loc-side reads; the r80 /profile mobile read re-classified on the clean
evidence); (2) the agent-browser daemon overload THREE times (the spawn-err
degradation, then the r79 stuck-evals mode — the session-list command
itself hung at 60s; the reset protocol — `close --all` + `pkill -9` +
respawn + re-auth — each time at the FIRST degradation read); (3) the
E2E-server resource crash (the "Target crashed"/ERR_ABORTED cascade under
the two-standalone + daemon load — the stale :3201 verify server killed +
the daemon closed restored it); (4) the exported-DATABASE_URL trap ACTIVE
(the fourth sandbox); (5) the chromium-cache trap pre-retired (r1248
FOREGROUND — the fresh sandbox carried only the stale r1200); (6) the
sweep-usage argv subtlety (the entry name must be the FULL
`index-NAME.js` filename — the bare hash fetches a 22-byte 404 and the
sweep reads false-NEGATIVE against an empty string; re-run valid).

## The gates at close

lint 0/0 · tsc clean · **941/941 unit** (post-fix) · build OK · **E2E
403/403 (6.6m, zero flakes — the 396 standing + the 7 new session-81
tests)** · byte-stability: 681≡649 (the seventeen-round chain, both sides,
re-proven on the closing 54th generation) + 665≡633 (the login pair, both
sides) + the route pairs stable (6/7, the attendance drifts BY DESIGN with
the ref side stable) + the mobile re-baselines stable (6/7, the attendance
drift BY DESIGN) + the first tablet baselines recorded (697-709) · DB
pristine at close (users = [sepnetflix2023@outlook.com], employees 1,
balances 2, jobs 0 — the probe user swept per the r61 protocol AFTER the
last ladder run).

**Standing watches carried forward:** the deploy watch ARMED at the
post-54th finals (login JS `index-Bl8PUA_n` + CSS `index--4Ltml9o`; the
app side `C-IrDy5f`/`BGNH4KkS`) with **r82's opening read = the full
ladder on the 54th-or-newer**; the deploy-cadence watch (twelve generations
across the last four rounds); the design-system-growth watch (the ninth
movement swept 5); the byte chains (the seventeen-round chain + the mobile
651-663/683-695 sets + the NEW tablet 697-709 baselines — byte-compared
from r82); the Next.js patch watch (16.4.2 latest stable; 16.5 at canary);
the Turnstile rollout (login-side, watch-only); the upstream dependency
watch (braces 3.0.4+; the Prisma deepmerge-ts path); the NEW
cluster-member watch (the per-page cluster map is now on the record — the
`actionsNowrap` five + the wrap two + the bare/unwrapped families; any
future PageHeader page must be measured against the REF's cluster before
choosing the variant).
