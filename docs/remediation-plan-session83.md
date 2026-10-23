# Remediation Plan — Session 83 / Parity Round 82: the theme-direction audit round (the 55th login deploy holding through a SECOND consecutive single-generation round + THE DARK-MODE + RTL (THEME-DIRECTION) MATRIX — the two toggle states never measured by the program's 966 LIGHT+LTR PNGs — reading ZERO clone-authored defects, the states parity-locked, pinned by the session83-theme spec) + the NINETEEN-round byte chain + the first dark/RTL baselines

**The round's motivation.** The session-82 completion record (the
breakpoint-boundary remediation round) closed the responsive-band program —
every TW-v4 breakpoint boundary member-measured on both sides
(390/640/768/1024-1279/1280/1440) — and left two standing notes for r83:
the opening read = the full ladder on the 55th-or-newer generation, and the
byte-compare of the new baselines (the boundary 757-783 + the mobile
729-741 + the tablet 743-755 sets). The fresh-eyes surface left unmeasured:
**the two TOGGLE STATES both apps carry** — dark mode (localStorage
`darkMode` → `html.dark`) and RTL/Arabic (localStorage `app_lang` →
`dir=rtl` + `lang=ar`, the عربي button). Every one of the program's 966
standing PNGs is LIGHT + LTR; the theme-direction states had never been
captured, censused, or byte-compared. Both toggles are user-facing
surface (the Moon + عربي buttons in the sidebar bottom) and both were
implemented by the clone in earlier sessions (the session-33 R32-B عربي
button + the session-40 R39-B THEME_BOOT contract) without a live
both-sides audit since.

**The session's environment note.** The workspace HELD across sessions
(the sixth-consecutive-exported-DATABASE_URL sandbox — the `env -u` guard
per invocation throughout); the environment needed no rebuild (.env, the
seeded `db/custom.db`, and `node_modules` all in place; DB pristine
verified at the start: users = [sepnetflix2023@outlook.com], employees 1,
balances 2, jobs 0).

1. **THE OPENING READ: THE 55TH HELD — THE FULL LADDER GREEN
   NON-VISUAL.** The r83 watch (`scripts/r83-deploy-watch.mjs`, armed at
   the post-55th finals) read BOTH SIDES QUIET (login JS `index-BdweUDbT`
   + CSS `index--4Ltml9o`; the app side `C-IrDy5f`/`BGNH4KkS`; the login
   DOM census unchanged — the six-button set, one form, zero Turnstile,
   zero iframes). Per the r82 carry-forward, the full ladder ran as this
   session's opening read on the 55th: the fresh logged-out login pair
   **BYTE-IDENTICAL** to the standing `69aa4241…` baseline
   (`scripts/r83-login-probe.mjs`) + standing **5/5** + sweep **12/12** +
   verify-r49 **13/13** + verify-r45 **13/13** → **NON-VISUAL.**

2. **THE OPENING-LADDER TRAPS (all infrastructure, retired before the
   audit began):**
   - **The ref stale-cookie trap re-fired** (the standing r78 lesson, now
     in a new costume): the r52 orchestrator re-auths only the LOC session
     — the `ref` session rode a cookie expired since the r82 round, so the
     first standing+sweep read returned **0/5 + 0/12 all-DIFF** with the
     REF side reading the LOGIN page's "Welcome to Eon HR" h1 on every
     route (every `open ${route}` bounced to `/login?from_url=…`). The
     careful re-auth of BOTH sessions restored the read: standing 5/5 +
     sweep 12/12 MATCH. The protocol addition: **re-auth the ref session
     before EVERY standing/sweep run, not only after deploys.**
   - **verify-r49's missing careful-retry** (the r78 fill-timing lesson
     never applied to the older script): a loc0 fill-timing miss read as a
     systematic **1/13 all-DIFF** round (every route bouncing to /login).
     The re-run passed 13/13 — and the retry was ADDED to
     `scripts/verify-r49.mjs` in-place (the hardening lands this round).
   - The r45 probe-user DB contamination (the ladder's signup flow left
     `loading-probe@example.com` in `custom.db`) — swept by the standing
     r72 instrument at the close.
   - The stale :3201 verify server — killed at the ladder's close (the
     r81 lesson).

3. **THE CODE AUDIT (the repo skills' lens — `skills/web-app-foundation`
   + the catalog): the r82 diff CLEAN.** The r82 round's source diff (the
   single attendance row-wrap removal + the updated in-source comment +
   the session82-boundary spec + the R17-A pin update) re-reviewed against
   the foundation skill's contracts (§18 the TW-v4 trap register — zero
   row-level flex-wrap; §13 the testing strategy — the regression guards
   in place): documented, measured, regression-guarded — no findings. The
   standing code-level checks re-verified green: the patch watch QUIET
   (16.4.2 the latest stable; the 16.5 line at 16.5.0-canary.24) · `bun
   audit` UNCHANGED (the two upstream-blocked dev-chain advisories) · the
   TW-v4 scan clean (15 `!important` all in globals.css; oklch 6/6
   comments-only) · secrets zero · the DOM-XSS sink census the same
   classified ZERO-UNSAFE family.

4. **THE FRESH-EYES INSTRUMENT — THE DARK-MODE + RTL (THEME-DIRECTION)
   MATRIX (`scripts/r83-theme-recon.mjs` + `r83-theme-matrix.mjs` +
   `r83-theme-mobile.mjs`): ZERO clone-authored defects — the states
   parity-locked.**

   **The toggle UI recon:** the Moon buttons are **GEOMETRY-IDENTICAL**
   on both sides (@1440: x=60 y=796 36×36, the same Button component
   classes, the same siblings BUTTON/BUTTON/عربي) — the REF's is a
   nameless icon-only button (the standing REF-authored a11y class; the
   LOC keeps its documented `aria-label` superset "Switch to dark mode"),
   and the عربي pair is IDENTICAL (80×32 @ x=104, the same recipe). The
   REF's dark-mode entry was initially MISSED by a text/aria census
   (nameless + icon-only) — found via the `svg.lucide-moon` selector; the
   recon refined accordingly.

   **The dark matrix** (the 7 standing routes × both sides, darkMode=true
   + LTR): **6/7 MATCH** — the theme census (htmlCls=dark, bodyBg
   rgb(10,10,10), the sidebar foreground, the first-card background, the
   heading colors) + the geometry census (sidebar 0+256, main 256+1184,
   scrollW) matched on every member of six routes. The one FIND
   (/attendance `headCol`: the REF rgb(15,23,42) vs the LOC
   rgb(250,250,250)) was classified by the deep read as **an instrument
   read-order artifact over the standing role-divergence**: the census
   read `h2 || h1` — the REF's /attendance (the access-restricted state
   for this role-"User" tenant) renders **ZERO h2 elements**, so the read
   fell through to the REF's hidden "EonHR" h1 (pinned slate-900), while
   the LOC's admin superset renders the "Today's Overview" h2
   (theme-aware foreground). The member-level truth: **BOTH sides render
   the IDENTICAL h1 census** — the hidden "EonHR" h1 AND the visible
   "Staff Attendance" page-title h1 `{text-slate-900, 48px, x=288 y=84
   w=312 h=96}` pixel-identical (the REF's own dark mode leaves the
   pinned slate-900 title un-themed; the clone matches it exactly). NOT a
   defect.

   **The RTL matrix** (the same walk, app_lang=ar + LIGHT): **6/7 MATCH**
   with the same single FIND classified identically.

   **The geometry-invariance proof (the re-paint-not-re-flow contract):**
   DARK ≡ LIGHT on every measured route (dashboard {main 256+1184,
   scrollW 1440}, attendance {256+1302, scrollW 1558}, payroll {256+1184,
   1440} — identical across the states); RTL mirrors EXACTLY (dashboard
   mainX 256→0 with the sidebar flipping to 1184+256; attendance mainX
   →-118 — the mirrored overflow — with the widths and scrollW
   unchanged).

   **The mobile drawer in both states (the standing user emphasis):**
   DARK — the drawer bg **rgb(24,24,27)** (zinc-900) on BOTH sides, dir
   ltr, w=288, the same link set; RTL — bg rgb(250,250,250), dir rtl,
   w=288 on BOTH sides; and the functional cycle GREEN in dark (toggle →
   the drawer → the Training LMS link CLICKED:/training → the URL lands
   on /training → the auto-close `open:false` — no TW-v4 regression in
   either theme state).

5. **THE CONTRACT PINS — `tests/e2e/session83-theme.spec.ts` (5 tests,
   all GREEN — the standing-contract green-pin pattern, the behavior
   live-proven before pinning):** R83-A the dark boot + the
   re-paint-not-re-flow invariance (html.dark + bodyBg rgb(10,10,10) +
   mainRect/scrollW identical to the LIGHT read); R83-B the RTL boot +
   the exact mirror (dir=rtl + mainX 0 / sidebar 1184+256 with mainW and
   scrollW held); R83-C the login theme-inertia (the session-40 R39-B
   contract — html.dark never applies on /login with the key armed);
   R83-D the toggle pair geometry (Moon x=60 36×36 + عربي x=104 80×32);
   R83-E the dark mobile drawer (bg rgb(24,24,27) + the Training LMS nav
   cycle → auto-close). Two instrument bugs in the spec's first draft
   (an about:blank localStorage SecurityError — evaluate before the
   first goto; and a mobile readiness signal — the "Welcome back" h1 is
   HIDDEN at 390 on BOTH sides, live-verified on the REF, the
   REF-authored mobile behavior) were fixed in place; the suite reads
   **412/412** (the 407 standing + the 5 new, 6.7m, zero flakes).

6. **THE BYTE CHAINS (`scripts/r83-screenshots.mjs`, numbers 785-889,
   106 PNGs → 1072 tracked).** The login pair 785 ≡ the r82 711 pair on
   BOTH sides (`bd718ed0…` / `69aa4241…`) + the mobile drawer pair 801 ≡
   the r82 727 pair on BOTH sides (loc `e3df921…`, ref `bfaa0da5…` — the
   **NINETEEN-round chain**
   801≡727≡681≡649≡632≡615≡597≡579≡561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366).
   The 1440 route pairs (787-799): **7/7 BYTE-STABLE both sides** — the
   first fully-stable @1440 set since the r82 fix landed in the r82
   captures. The mobile re-baselines (803-815): 6/7 stable with
   **805-m-payroll-390-REF DRIFTING — REF DATA-AUTHORED** (the REF
   tenant's payroll records were EMPTIED between rounds: the live read
   shows the "No payroll records" empty state + "0 SAR / 0 Employees / 0
   Approved" — the same tenant-emptying class as the r82 "0 employees"
   note; the desktop pair 789 STABLE because the records section sits
   below the 1440x900 fold, invisible to the capture; the LOC side 7/7
   STABLE; the double-capture determinism check passed — today's REF
   state is stable, the r82 baseline captured the pre-emptying state; the
   r83 capture `062ad84b…` becomes the chained baseline). The tablet
   re-baselines (817-829): **7/7 STABLE**. The sm-boundary re-baselines
   (831-843): **7/7 STABLE — the FIRST byte-compare of the r82 boundary
   set, holding.** The xl-boundary re-baselines (845-857): **7/7
   STABLE.** **THE FIRST DARK-MODE + RTL BASELINES** (859-871 dark +
   873-885 RTL @1440 + 887 the dark drawer pair + 889 the RTL drawer
   pair @390) — the theme-direction program's chained evidence for r84+.
   The mobile-menu cycle GREEN (the standing user emphasis).

   **The round's own instrument bug, caught and fixed in-round:** the
   r83-screenshots widthRoutePair initially captured the mobile set at
   390x1024 (the boundary-pattern height) — the whole set read 7/7
   DRIFT on BOTH sides; re-captured at the standing 390x844 (six of the
   seven re-reading STABLE immediately, the payroll-ref finding then
   classified as above). The lesson recorded: the mobile set's height is
   844, not 1024 — the height is part of the baseline contract.

7. **THE ROUND-END READS: THE 55TH HELD THROUGH A SECOND CONSECUTIVE
   ROUND.** The round-end watch read the SAME fingerprints as the opening
   (login JS `index-BdweUDbT` + CSS `index--4Ltml9o`; the app side
   `C-IrDy5f`/`BGNH4KkS`) — no 56th deploy; the deploy cadence has
   stayed quiet for two full rounds. **The full standing ladder on the
   55th-or-newer = r84's opening read.**

8. **THE STANDING CHECKS at the round's close:** the patch watch QUIET
   (16.4.2 the latest stable; the 16.5 line at 16.5.0-canary.24 — one
   canary bump) · `bun audit` UNCHANGED · the TW-v4 scan clean · secrets
   zero · the XSS sink census the same classified family · **DB pristine
   at close** (the r72 sweep after the last ladder/E2E run; users =
   [sepnetflix2023@outlook.com], employees 1, balances 2, jobs 0) ·
   `.env.example` re-verified (the two-variable contract unchanged).

9. **GATES:** lint 0/0 · tsc clean · **941/941 unit** · build OK · **E2E
   412/412 (6.7m, zero flakes — the 407 standing + the 5 new)** ·
   byte-stability 801≡727 (the nineteen-round chain, both sides, on the
   holding 55th generation) + 785≡711 (the login pair, both sides) + the
   route pairs 7/7 + the tablet 7/7 + the boundary sets 7/7+7/7 (the
   first boundary byte-compare) + the mobile 6/7 (the payroll-ref drift
   REF DATA-AUTHORED) + the first dark/RTL baselines · **1072 tracked
   screenshots (+106)** · DB pristine.

**The round's verdict: ZERO clone-authored defects — the theme-direction
states parity-locked and PINNED.** The round's diff: the session83-theme
spec (5 tests) + the verify-r49 careful-retry hardening + the four
instruments (`scripts/r83-deploy-watch.mjs` + `r83-login-probe.mjs` +
`r83-theme-recon.mjs` + `r83-theme-matrix.mjs` + `r83-theme-mobile.mjs` +
`r83-screenshots.mjs`) + the evidence (106 screenshots, 785-889) + the
docs layer. No source changes — the third consecutive round the codebase
needs none on its own surfaces (the r81/r82 remediations holding), and
the first round to extend the parity PROOF rather than the parity FIX:
the two toggle states join the measured-and-pinned contract.

**Standing watches carried forward:** the deploy watch (armed at the
post-55th finals — still quiet; **r84's opening read = the full ladder on
the 55th-or-newer**), the deploy-cadence watch (two consecutive
single-generation rounds — the cadence quiet since the 55th), the
design-system-growth watch, the byte chains (the nineteen-round chain +
the mobile/tablet/boundary sets + **the NEW dark/RTL sets 859-889 —
byte-compared from r84**), the Next.js patch watch (16.4.2 latest stable;
the 16.5 line at canary), the Turnstile rollout (login-side, watch-only,
zero widgets), the upstream dependency watch (braces 3.0.4+; the Prisma
deepmerge-ts path), the cluster-member watch (the r81 map), the
role-parity note (the REF tenant is being progressively EMPTIED — its
employees AND payroll records now read zero; expect more data-authored
drifts on the ref side of the chains), and **the NEW ref-session
re-auth protocol** (re-auth the ref session before every standing/sweep
run — the r83 0/5+0/12 lesson).
