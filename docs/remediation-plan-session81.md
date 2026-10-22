# Remediation Plan — Session 81 / Parity Round 80: the tablet-band remediation round (the 52nd fully laddered at the opening + the 53rd fully laddered + the 54th step-1-proven at the close — the ninth CSS movement a pure dead-code sweep) + THE TABLET (md-boundary) VIEWPORT MATRIX + THE lg-BAND GRID CENSUS finding THREE clone-authored defects, ALL TDD-FIXED (the first source changes in eight rounds)

**The round's motivation.** The session-80 completion record (the
quadruple-generation cadence round) left the backlog empty of open
visual/functional items; the standing watches were the deploy watch (armed
at the post-52nd finals — login JS `index-By5t4Bdg` + CSS
`index-dbXqk6oa`; the app side `C-IrDy5f`/`BGNH4KkS`), the ESCALATED
deploy-cadence watch, the design-system-growth watch, the NEW mobile-width
byte chain (the 651-663 baselines), the Next.js patch watch, the Turnstile
rollout watch, and the upstream dependency watch. This round's fresh-eyes
candidate: the responsive parity proof had never covered the CONTENT
routes at the md boundary (768x1024) nor the whole 1024-1279 lg band — the
session-7 R6-A sweep verified the NAV SHELL boundary only, and the standing
PNG chains pin 390 and 1440. The tablet middle was the last unmeasured
responsive band, and the lg band is a classic TW-v4 off-by-one surface.

**The session's reconstruction note.** The pre-round sandbox was reset AGAIN
(the fourth consecutive reset); this session rebuilt the environment from a
fresh clone (`582d3f3` — including the owner-pushed session_180/session_181
transcripts) and re-derived every result from scratch: .env from
.env.example (DATABASE_URL="file:../db/custom.db", AUTH_SECRET generated),
`bun install` (525 packages), db:generate + db:push + db:seed (Annual
21/21, Sick 30/30), DB pristine verified, the exported-DATABASE_URL trap
checked ACTIVE (`env -u` per invocation), and chromium r1248 installed
FOREGROUND before the E2E gates.

1. **THE OPENING READ: BOTH SIDES QUIET + THE 52ND'S FULL LADDER.** The
   r81 watch (`scripts/r81-deploy-watch.mjs`, armed at the post-52nd
   finals) read the login side QUIET (`By5t4Bdg`/`dbXqk6oa`) and the app
   side QUIET (`C-IrDy5f`/`BGNH4KkS`); the login DOM census unchanged (the
   six-button set, one form, zero Turnstile, zero iframes). Per the
   standing carry-forward, the 52nd generation — step-1-proven at the r80
   close — received its FULL standing ladder as this session's opening
   read: the fresh logged-out login pair **BYTE-IDENTICAL** to the standing
   `69aa4241…` baseline (`scripts/r81-login-probe.mjs`) + standing **5/5**
   + sweep **12/12** (the r52 orchestrator, first-try clean) + verify-r49
   **13/13** + verify-r45 **13/13** → **NON-VISUAL.**

2. **THE FRESH-EYES INSTRUMENT: THE TABLET (md-BOUNDARY) VIEWPORT MATRIX +
   THE lg-BAND GRID CENSUS — three clone-authored defects found, all
   TDD-fixed.** The recon (`scripts/r81-tablet-recon.mjs`) walked
   /dashboard on both sides at 768x1024 + the 767 off-by-one edge: the
   mobile header unmounts (`md:hidden`, h=0, identical classes), the
   desktop sidebar mounts (main x=256 w=512 IDENTICAL both sides), the 767
   edge keeps the mobile chrome live on both sides — the shell boundary is
   parity-locked. The matrix (`scripts/r81-tablet-matrix.mjs`, the
   12-route sweep set at 768x1024 member-wise) read RAW 2/12 MATCH / 10
   FINDs; the detail reads (`scripts/r81-tablet-detail.mjs` + the inline
   chain-diff / leaf-author / stat-card / fonts censuses) classified every
   FIND and surfaced THREE clone-authored defects:

   **R81-A — /attendance's stats grid: `xl:grid-cols-5` where the REF rides
   `lg:grid-cols-5`** (live-measured at 1024: the REF renders FIVE computed
   columns, the LOC THREE, across the whole 1024-1279 band — invisible to
   the 390/1440 audits: both are grid-cols-2 at 390 and 5 columns at 1440).
   FIXED: the member corrected to `lg:grid-cols-5`
   (`src/app/(app)/attendance/page.tsx`).

   **R81-B — /payroll's PageHeader row omitted `rowBreakpoint="md"`** (the
   sm default emitted `sm:flex-row sm:justify-between sm:items-center`
   where the REF's row carries the md family: `hidden md:flex flex-col
   md:flex-row justify-between items-start md:items-center gap-4` —
   live-measured). Visually inert (display:none below md on BOTH sides,
   row at md+, the raised offset rowY=64 identical, the 1440 geometry
   byte-identical) — the DOM member contract aligned.
   FIXED: `rowBreakpoint="md"` added (`src/app/(app)/payroll/page.tsx`).

   **R81-C — THE ACTIONS-CLUSTER WRAP CLASS.** The r81 cluster census
   (34 pages read on BOTH sides @1024) measured the REF PER-PAGE
   INCONSISTENT: payrollmodule + attendancedashboard wrap (`flex
   items-center gap-3 flex-wrap` — the clone default MATCHES those),
   staffrequests rides `flex gap-2` (the clone's actionsBare ✓),
   recruitment/expenses/leavemanagement/recruitmentkanban render single
   actions DIRECTLY (the clone's actionsUnwrapped ✓), the alwaysRow 13 all
   match — and FIVE pages (payroll, taskmanager, documenttracker,
   attendance, assetmanagement) ride the BARE UNWRAPPED `flex gap-3`. The
   clone's flex-wrap default (the session-16 anti-overflow choice) on those
   five COLLAPSED their header rows at tablet width where the REF's rows
   keep their natural min-content and the page overflows — the
   REF-authored-overflow parity class. The mechanism hunt pinned it: the
   grid-to-body chains are structurally IDENTICAL; Tailwind's grid-cols-4
   is `repeat(4, minmax(0, 1fr))` (NO min-content floor — proven by the
   transient width clamp collapsing the tracks to 0); the fonts are
   IDENTICAL (same stacks, same canvas metrics); the growth author is the
   header ROW: the REF's unwrapped 339px cluster + hero-min ≈ 540px
   row-min → main 605 → scrollW 861 at 768, while the wrapped cluster
   collapses the row and the page fits. FIXED: the `actionsNowrap` variant
   (`flex gap-3`) added to PageHeader + applied to the five measured pages.
   **POST-FIX LIVE VERIFICATION AT EVERY BAND:** at 768 the
   payroll/taskmanager/documenttracker overflows went **BYTE-IDENTICAL**
   (861/861, 847/847, 901/901 — was 861/768, 847/768, 901/768) and
   attendance converged 791→1231 toward the REF's 1558 (the remainder =
   the records data, the mechanism identical); at 390 the attendance
   overflow went **BYTE-IDENTICAL** (943/943 — was 943/503, CORRECTING the
   r80 misclassification: that delta was the cluster mechanism, not data);
   at 1440 the attendance cluster's wrap WAS ENGAGED pre-fix (the
   7-button cluster is 1190px > the 1120px wrap — the pre-fix LOC rendered
   it 2-line where the REF renders ONE line 911px h=36, a standing-width
   divergence no prior audit caught: the PNG chains are per-side and no
   member audit read the cluster's line count) — post-fix the LOC renders
   it IDENTICAL (`flex gap-3`, 911px, one line, h=36). The lg-band grid
   census went from 2 FINDs to **12/12 MATCH** post-fix.

3. **THE NEW INSTRUMENT TRAP — THE r45 PROBE-USER COOKIE CONTAMINATION.**
   The verify-r45 signup flow (ladder step 5) leaves the `loc` browser
   session authed as `loading-probe@example.com`; every subsequent
   loc-side read runs as the wrong identity (the /profile read renders the
   probe user's data). The tablet matrix's first /profile read was
   contaminated (a raw 581-vs-571 mainRect delta that VANISHED on the
   clean re-auth — the clean read is byte-identical 571/571 + 827/827
   both-sides overflow). The r80 mobile matrix's /profile read was ALSO
   probe-authored (its classification conclusion still held, but on the
   wrong-user evidence — re-classified this round on the clean read). The
   protocol addition: **re-auth the loc session as the seeded user after
   every r45 ladder run, before any subsequent loc-side read.**

4. **THE TDD PROOFS — `tests/e2e/session81-lg-band.spec.ts` (7 tests,
   RED → GREEN).** R81-A: the attendance grid at 1024 renders FIVE
   columns + the `lg:grid-cols-5` member + the boundary (3 at 768, 5 at
   1440). R81-B: the payroll row's md-family members + the below-md
   hidden boundary. R81-C: the five bare-cluster pages render `flex
   gap-3`, the payroll @768 overflow parity (scrollW > innerW — the
   REF-authored overflow no longer wrapped away), and the wrap-variant
   regression guard (payrollmodule + attendancedashboard KEEP flex-wrap).
   All RED pre-fix on the exact defect assertions; all GREEN post-fix;
   the full suite **403/403** (the 396 standing + the 7 new — zero
   regressions, zero flakes, 6.6m).

5. **THE BYTE CHAINS (`scripts/r81-screenshots.mjs`, numbers 665-709, 46
   PNGs → 892 tracked).** The login pair 665 ≡ the r80 633 pair on BOTH
   sides (`bd718ed0…` / `69aa4241…`) + the mobile drawer pair 681 ≡ the
   r80 649 pair on BOTH sides (loc `e3df921…`, ref `bfaa0da5…` — the
   SEVENTEEN-round chain) — both standing pairs RE-CAPTURED on the
   closing 54th generation (`scripts/r81-final-pairs.mjs`) so the chain
   claims are made on the generation the round closes on. The seven 1440
   route pairs (667-679): 6/7 BYTE-STABLE both sides with
   **673-attendance-light-loc DRIFTING BY DESIGN** (the R81-C unwrap
   re-authors the attendance cluster at 1440 — the ref side STABLE — the
   drift IS the remediation's 1440-band proof). The mobile re-baselines
   (683-695): 6/7 BYTE-STABLE with **689-attendance-390-loc DRIFTING BY
   DESIGN** (the unwrap re-authors the attendance mobile overflow toward
   the REF's own 943 signature; the ref side STABLE). **THE FIRST
   TABLET-WIDTH (768x1024) PER-SIDE BASELINES (697-709)** — the seven
   standing routes captured at the md boundary, the chained evidence
   byte-compared from r82 onward. **The mobile-menu functional cycle
   GREEN** (toggle → the drawer with Dashboard/Training LMS/Assets/Staff
   Requests → the Training LMS link CLICKED:/training → the URL lands on
   /training → the drawer auto-closes `open: false` — the standing user
   emphasis, no TW-v4 regression).

6. **THE ROUND-END DEPLOY READS: THE 53RD FULLY LADDERED + THE 54TH
   STEP-1-PROVEN.** The round-end watch read the **53RD-LINE LOGIN DEPLOY**
   (login JS `By5t4Bdg`→`CYumVlcN` AND CSS `dbXqk6oa`→`-4Ltml9o` — the
   NINTH login-CSS movement; the app side QUIET). The FULL LADDER GREEN on
   the 53rd (the fresh login pair BYTE-IDENTICAL to `69aa4241…` + standing
   5/5 + sweep 12/12 + verify-r49 13/13 + verify-r45 13/13 → NON-VISUAL),
   after the daemon's spawn-err degradation (the reset protocol at the
   first degradation read). The ninth movement's forensics: `dbXqk6oa`
   903630 → `-4Ltml9o` 903434 (**−196 B: 5 removed / 0 added** — the
   `.pb-72`, `.sm:w-[320px]`, `.sm:py-5`, `.sm:pb-48`, `.lg:px-[72px]`
   rules swept); the PRECISE full-name usage sweep against the real 53rd
   entry (`index-CYumVlcN.js`, 97493 bytes via stat): **ZERO usages — a
   pure DEAD-CODE SWEEP** (the second consecutive). **THE 54TH-LINE
   landed during the forensics** (login JS `CYumVlcN`→`index-Bl8PUA_n`,
   CSS QUIET; the entry 97493 bytes — the same size, the
   chunk-graph-rebuild signature): step-1-proven at the close (the fresh
   login pair BYTE-IDENTICAL); **the full standing ladder on the
   54th-or-newer = r82's opening read.**

7. **THE STANDING CHECKS at the round's close:** the patch watch QUIET
   (16.4.2 the latest stable; the 16.5 line at 16.5.0-canary.23) ·
   `bun audit` UNCHANGED (the two upstream-blocked dev-chain advisories) ·
   the TW-v4 scan clean (15 `!important` all globals.css; oklch 6/6
   comments-only — re-verified POST-FIX) · secrets zero · the DOM-XSS sink
   census ZERO-UNSAFE · **DB pristine at close** (the r72 sweep ran clean
   after the last ladder/E2E run; users =
   [sepnetflix2023@outlook.com], employees 1, balances 2, jobs 0).

8. **THE INSTRUMENT TRAPS RETIRED (all infrastructure, classified before
   touching source):** (1) **the r45 probe-user cookie contamination**
   (the NEW trap — re-auth the loc session after every r45 ladder run);
   (2) the agent-browser daemon overload THREE times (the spawn-err mode,
   then the r79 stuck-evals mode — the reset protocol each time at the
   FIRST degradation read); (3) the E2E-server resource crash (the
   "Target crashed"/ERR_ABORTED cascade — the stale :3201 verify server
   killed + the daemon closed restored it); (4) the exported-DATABASE_URL
   trap ACTIVE (the fourth sandbox); (5) the chromium-cache trap
   pre-retired (r1248 FOREGROUND); (6) **the sweep-usage argv subtlety**
   (the entry name must be the FULL `index-NAME.js` filename — the bare
   hash fetches a 22-byte 404 and the sweep reads false-NEGATIVE against
   an empty string; the ninth movement's classification re-run valid).

9. **GATES:** lint 0/0 · tsc clean · **941/941 unit (post-fix)** · build
   OK · **E2E 403/403 (6.6m, zero flakes — the 396 standing + the 7 new)**
   · byte-stability 681≡649 (the seventeen-round chain, both sides,
   re-proven on the closing 54th generation) + 665≡633 (the login pair,
   both sides) + the route pairs stable (6/7, the attendance drift BY
   DESIGN, the ref side stable) + the mobile re-baselines stable (6/7,
   the attendance drift BY DESIGN) + the first tablet baselines (697-709)
   · **898 tracked screenshots (+46 — the 852 pre-round git truth; the r80 record's 846 was a 6-file arithmetic drift, corrected here)** · DB pristine.

**The round's verdict: THREE CLONE-AUTHORED DEFECTS FOUND — ALL TDD-FIXED**
(the first source changes in eight rounds: the attendance grid member, the
payroll row member, the cluster-wrap class across five pages + the
PageHeader variant). The round's diff: the three source fixes + the
session81-lg-band spec (7 tests) + the six instruments
(`scripts/r81-deploy-watch.mjs` + `r81-login-probe.mjs` +
`r81-tablet-recon.mjs` + `r81-tablet-matrix.mjs` + `r81-tablet-detail.mjs`
+ `r81-screenshots.mjs` + `r81-final-pairs.mjs`) + the evidence (46
screenshots, 665-709) + the docs layer. The fresh-eyes instrument closed
the last unmeasured responsive band and proved the fix at every width:
**the tablet band now renders byte-identical overflows on the
cluster-authored pages, the 390 attendance delta is corrected to
byte-identical, and the 1440 attendance cluster divergence (invisible to
every prior audit) is fixed.**

**Standing watches carried forward:** the deploy watch (armed at the
post-54th finals — login JS `index-Bl8PUA_n` + CSS `index--4Ltml9o`; the
app side `C-IrDy5f`/`BGNH4KkS`; **r82's opening read = the full ladder on
the 54th-or-newer**), the deploy-cadence watch (twelve generations across
the last four rounds; the stale-cookie + daemon-overload traps fire
together — re-auth AND reset at the first degradation read), the
design-system-growth watch (the ninth movement swept 5 — the
dead-code-sweep cycle continuing), the byte chains (the seventeen-round
chain + the mobile 651-663/683-695 sets + **the NEW tablet 697-709
baselines** — byte-compared from r82), the Next.js patch watch (16.4.2
latest stable; 16.5 at canary), the Turnstile rollout (login-side,
watch-only), the upstream dependency watch (braces 3.0.4+; the Prisma
deepmerge-ts path), and **the NEW cluster-member watch** (the per-page
cluster map is on the record — the actionsNowrap five + the wrap two +
the bare/unwrapped families; any future PageHeader page must be measured
against the REF's cluster before choosing the variant).
