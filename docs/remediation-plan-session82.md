# Remediation Plan — Session 82 / Parity Round 81: the breakpoint-boundary remediation round (the 55th login deploy fully laddered at the opening and holding through the whole round) + THE BREAKPOINT-BOUNDARY MATRIX (the sm 640 + xl 1280 edges + their 639/1279 off-by-one edges) finding ONE clone-authored defect, TDD-FIXED (the attendance row-level wrap — the r81 "records data" misclassification corrected)

**The round's motivation.** The session-81 completion record (the tablet-band
remediation round) left the responsive parity proof covering 1440x900 (the
standing chain), 390x844 (the r80 mobile matrix + the 651-663/683-695
baselines), 768x1024 + the 767 edge (the r81 tablet matrix + the 697-709
baselines), and the 1024-1279 lg band (the r81 grid census). The remaining
UNMEASURED breakpoint boundaries: the **sm edge (640 + the 639 off-by-one)**
and the **xl edge (1280 + the 1279 off-by-one)** — the last two TW-v4
breakpoint surfaces (the exact class where an xl:-vs-lg: member bug bites:
the R81-A lesson). Closing them completes the responsive-band program:
every breakpoint boundary member-measured on both sides.

**The session's reconstruction note.** The pre-round sandbox was reset AGAIN
(the fifth consecutive reset); this session rebuilt the environment from a
fresh clone (`9813a58` — main, clean, remote-matched, including the r81
audit `709d30b` + the two owner transcript commits): .env from .env.example
(DATABASE_URL="file:../db/custom.db", AUTH_SECRET generated), `bun install`
(525 packages), db:generate + db:push + db:seed (Annual 21/21, Sick 30/30),
DB pristine verified (users=1, employees=1, balances=2, jobs=0), the
exported-DATABASE_URL trap checked ACTIVE (the fifth sandbox — `env -u` per
invocation throughout), and chromium r1248 installed FOREGROUND before the
E2E gates (the fresh sandbox carried only the stale r1200).

1. **THE OPENING READ: THE 55TH-LINE LOGIN DEPLOY DETECTED + FULLY
   LADDERED NON-VISUAL.** The r82 watch (`scripts/r82-deploy-watch.mjs`,
   armed at the post-54th finals) read the login side at a NEW generation —
   login JS `index-Bl8PUA_n`→`index-BdweUDbT`, login CSS QUIET at
   `index--4Ltml9o` (a JS-only movement, the chunk-graph-rebuild
   signature); the app side QUIET (`C-IrDy5f`/`BGNH4KkS`); the login DOM
   census unchanged (the six-button set, one form, zero Turnstile, zero
   iframes). The FULL CONFIRMATION LADDER ran on the 55th as the opening
   read: the fresh logged-out login pair **BYTE-IDENTICAL** to the standing
   `69aa4241…` baseline (`scripts/r82-login-probe.mjs`) + standing **5/5**
   + sweep **12/12** (the r52 orchestrator, first-try clean) + verify-r49
   **13/13** + verify-r45 **13/13** → **NON-VISUAL.** The r81 trap protocol
   applied at the close: the loc session re-authed as the seeded user (the
   verify-r45 signup flow leaves it as the probe user) + the stale :3201
   verify server killed.

2. **THE FRESH-EYES INSTRUMENT: THE BREAKPOINT-BOUNDARY MATRIX — one
   clone-authored defect found, TDD-fixed.** The recon
   (`scripts/r82-boundary-recon.mjs`) walked /dashboard on BOTH sides at
   640/639/1280/1279: the sm boundary keeps the mobile chrome live
   identically (the header h=73 + the bottom tabs on both sides at 640 AND
   the 639 edge), the xl boundary runs the desktop layout identically
   (main x=256 w=1024, the mobile header unmounted) — the shells
   parity-locked at all four edges. The matrix
   (`scripts/r82-boundary-matrix.mjs`) walked the 12-route sweep set at 640
   AND 1280 (LIGHT, authed sessions) reading shell+geometry+**the computed
   grid-column census** member-wise: RAW 9/12 MATCH at BOTH widths, with
   the R81-A fix confirmed at the xl edge (the attendance stats grid
   renders FIVE computed columns on BOTH sides at 1280). The three FINDs at
   each width, classified by the detail reads
   (`scripts/r82-boundary-detail.mjs` + `r82-attendance-deep.mjs` +
   `r82-toolbar-census.mjs` + `r82-hero-cluster.mjs`):

   **/employees — DATA-AUTHORED.** The REF's employees page reads "Manage
   your 0 employees" (its tenant carries no employee records) with an
   empty list — zero visible grids — while the LOC's 1 seeded employee
   renders the 1-card grid (`grid md:grid-cols-2 lg:grid-cols-3`). The
   standing seeded-difference class (documented since the build; the PNG
   chains stable); no action.

   **/careers — DATA-AUTHORED.** The REF's 1 job posting ("1 Open
   Position" + the 2-col Browse-by-Company grid) vs the LOC's 0-job board
   ("0 Open Positions" + the empty state) — the r80 chip-seed proof class;
   no action.

   **/attendance — R82-A, THE ROUND'S DEFECT (below).**

3. **R82-A — /attendance's PageHeader row carried an extra `md:flex-wrap`
   member the REF's row lacks — the r81 "records data" misclassification
   CORRECTED.** The deep read surfaced the mechanism chain: the REF's
   /attendance renders the **ACCESS RESTRICTED state for this user** (its
   /profile reads the role chip "User"; the page shows the stats grid with
   role-scoped zeros — "0 Total Employees, 0 Present Today, 0 Absent
   Today, 0 Late Arrivals, 0% Attendance Rate" — plus the "Access
   Restricted / Only Admin or Security role users can mark attendance"
   notice; NO records section at all), while the LOC's seeded user is
   admin (the full Today's Overview + Recent Records superset — the
   clone's role gate already implemented: the restricted recipe at the
   `!canMark` branch with the r61/r63-measured icon/color/copy + the
   API's `requireRole(["admin","hr","security"])`). **The classification
   correction:** the r81 record attributed the attendance @768 remainder
   (LOC 1231 vs REF 1558) to "the records data" — the deep read proves
   the REF renders NO records; the remainder was the ROW-WRAP member. The
   mechanism (the hero/cluster census, measured live @1280 on both
   sides): the clusters are IDENTICAL (`flex gap-3`, min-content 911, the
   same seven buttons — Print/PDF/Excel/Devices/Settings/Dashboard/Import
   Attendance) and the heroes are IDENTICAL (min-content 312) — but the
   REF's row is the no-wrap md family (`flex flex-col md:flex-row
   justify-between items-start md:items-center gap-4`, min-content 1238 =
   hero 312 + gap 16 + cluster 911 — the page overflows by design:
   **scrollW 1558 CONSTANT across 768/1024/1280/1440**), while the LOC's
   row carried `md:flex-wrap` (a session-10 R9-E anti-overflow choice
   predating the REF-authored-overflow parity standard established
   r79/r81; min-content 911 = the widest member — the row wrapped the
   cluster to a second line and the page fitted at 1280+). FIXED: the
   wrap member removed (`src/app/(app)/attendance/page.tsx`, the stale
   session-10 comment updated with the measured rationale).
   **THE FIX'S LIVE VERIFICATION AT EVERY BAND:** the attendance page now
   renders **BYTE-IDENTICAL with the REF at EVERY md+ band** — scrollW
   1558 + main 256+1302 at 768, 1024, 1280 AND 1440 (was scrollW
   1280/main 1024 at 1280; the r81 1231 at 768); the hero geometry
   identical to the pixel ({312 wide, rowH 216, titleH 96} both sides —
   the REF's two-line title squeeze restored); the 390 mobile band
   UNAFFECTED (943/943 byte-identical — the flex-col row below md).

4. **THE TDD PROOFS — `tests/e2e/session82-boundary.spec.ts` (4 tests,
   RED → GREEN).** R82-A: the row's no-wrap md-family contract (no
   flex-wrap member anywhere in the row class); the hero squeeze to the
   REF's 312px min-content (300-320 band); the page overflow parity at
   the md+ bands (scrollW 1558, > innerW); the 390 regression guard
   (943). All RED pre-fix on the exact defect assertions (the flex-wrap
   member present; the hero unsqueezed at 457; scrollW 1280 ≠ 1558); all
   GREEN post-fix; the full suite **407/407** (the 403 standing + the 4
   new — zero regressions, zero flakes, 6.6m). The R17-A unit pin
   (`tests/unit/shell-recipes.test.ts`) UPDATED to guard the new
   contract: the session-18 pin asserted the OLD wrap member (the
   fitting-wrap choice); it now asserts its ABSENCE + the
   `rowBreakpoint="md"` member, with the history documented in-place (the
   deliberate contract change on the full measurement evidence); the unit
   gate **941/941** post-update.

5. **THE BYTE CHAINS (`scripts/r82-screenshots.mjs`, numbers 711-783, 74
   PNGs → 966 tracked).** The login pair 711 ≡ the r81 665 pair on BOTH
   sides (`bd718ed0…` / `69aa4241…`) + the mobile drawer pair 727 ≡ the
   r81 681 pair on BOTH sides (loc `e3df921…`, ref `bfaa0da5…` — the
   **EIGHTEEN-round chain**) — both standing pairs captured ON the 55th
   generation (the generation the round closes on: **the 55th HELD
   through the whole round** — the round-end watch read the same
   fingerprints as the opening; no 56th deploy; no re-capture needed).
   The seven 1440 route pairs (713-725): 6/7 BYTE-STABLE both sides with
   **719-attendance-light-loc DRIFTING BY DESIGN** (the R82-A fix
   re-authors the 1440 rendering to the REF's 312px two-line hero + the
   1558 overflow; the ref side STABLE). The mobile re-baselines
   (729-741): **7/7 BYTE-STABLE** both sides (the fix is inert at 390).
   The tablet re-baselines (743-755): 6/7 BYTE-STABLE with
   **749-t-attendance-768-loc DRIFTING BY DESIGN** (toward the REF's
   1558 — was the r81 wrapped 1231). **THE FIRST BOUNDARY-WIDTH PER-SIDE
   BASELINES (757-769 @640 + 771-783 @1280)** — the seven standing
   routes at both boundaries, the chained evidence byte-compared from r83
   onward. **The mobile-menu functional cycle GREEN** (toggle → the
   drawer → the Training LMS link CLICKED:/training → /training → the
   auto-close — the standing user emphasis, no TW-v4 regression).

6. **THE ROUND-END DEPLOY READ: THE 55TH HELD.** The round-end watch read
   the SAME fingerprints as the opening (login JS `index-BdweUDbT`, CSS
   `-4Ltml9o`; the app side `C-IrDy5f`/`BGNH4KkS`) — the round opens and
   closes on the same generation, the first single-generation round since
   the cadence compressed (r78+); **the full standing ladder on the
   55th-or-newer = r83's opening read.**

7. **THE STANDING CHECKS at the round's close (re-verified POST-FIX):**
   the patch watch QUIET (16.4.2 the latest stable; the 16.5 line at
   16.5.0-canary.23) · `bun audit` UNCHANGED (the two upstream-blocked
   dev-chain advisories: braces ≤3.0.3 still the latest published;
   deepmerge-ts <8 under prisma's @prisma/config 6.x pin) · the TW-v4
   scan clean (15 `!important` all globals.css; oklch 6/6 comments-only;
   zero row-level flex-wrap anywhere in the pages) · secrets zero · the
   DOM-XSS sink census ZERO-UNSAFE (the same classified family) · **DB
   pristine at close** (the r72 sweep ran clean after the last
   ladder/E2E run; users = [sepnetflix2023@outlook.com], employees 1,
   balances 2, jobs 0).

8. **THE INSTRUMENT TRAPS RETIRED (all infrastructure, classified before
   touching source):** (1) the exported-`DATABASE_URL` trap ACTIVE (the
   FIFTH consecutive sandbox — `env -u` per invocation throughout);
   (2) the chromium-cache trap PRE-RETIRED (r1248 installed FOREGROUND —
   the fresh sandbox carried only the stale r1200); (3) the standing r45
   re-auth protocol applied at the ladder's close (the r81 contamination
   trap — the loc session re-authed before any subsequent loc-side
   read); (4) the stale :3201 verify server killed at the ladder's close
   (the r81 E2E-crash lesson).

9. **GATES:** lint 0/0 · tsc clean · **941/941 unit (post-fix, the R17-A
   pin updated to the new contract)** · build OK · **E2E 407/407 (6.6m,
   zero flakes — the 403 standing + the 4 new)** · byte-stability
   727≡681 (the eighteen-round chain, both sides, on the closing 55th
   generation) + 711≡665 (the login pair, both sides) + the route pairs
   stable (6/7, the attendance drift BY DESIGN) + the mobile re-baselines
   stable (7/7) + the tablet re-baselines stable (6/7, the attendance
   drift BY DESIGN) + the first boundary-width baselines (757-783) ·
   **966 tracked screenshots (+74 — the 892 pre-round PNG git truth; the
   prior "898" count included the 6 HTML evidence files, the accounting
   split recorded here)** · DB pristine.

**The round's verdict: ONE CLONE-AUTHORED DEFECT FOUND — TDD-FIXED (the
second consecutive remediation round).** The round's diff: the single
source fix (the attendance row-wrap removal + the updated in-source
comment) + the session82-boundary spec (4 tests) + the R17-A unit-pin
update + the ten instruments (the deploy watch + the login probe + the
boundary recon/matrix/detail + the attendance deep read + the toolbar
census + the hero-cluster census + the screenshots + the db-verify
helper) + the evidence (74 screenshots, 711-783) + the docs layer. The
fresh-eyes instrument closed the responsive-band program — every TW-v4
breakpoint boundary member-measured on both sides — and the fix's live
proof at every band: **the attendance page renders BYTE-IDENTICAL with
the REF at every md+ width (the 1558 constant) with the mobile band
untouched.**

**Standing watches carried forward:** the deploy watch (armed at the
post-55th finals — login JS `index-BdweUDbT` + CSS `index--4Ltml9o`; the
app side `C-IrDy5f`/`BGNH4KkS`; **r83's opening read = the full ladder on
the 55th-or-newer**), the deploy-cadence watch (the 55th held a full
round — the first single-generation round since r77), the
design-system-growth watch, the byte chains (the eighteen-round chain +
the mobile 651-663/683-695/729-741 sets + the tablet 697-709/743-755
sets + **the NEW boundary sets 757-769/771-783** — byte-compared from
r83), the Next.js patch watch (16.4.2 latest stable; 16.5 at canary),
the Turnstile rollout (login-side, watch-only), the upstream dependency
watch (braces 3.0.4+; the Prisma deepmerge-ts path), the cluster-member
watch (the r81 map), and **the NEW role-parity note** (the REF's user is
role "User" — its /attendance renders the access-restricted state with
role-scoped zeros; the LOC's seeded admin sees the full superset; the
clone's role gate is implemented and measured — any future role-adjacent
surface should be read on the REF as the restricted state first).
