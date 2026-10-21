# Remediation Plan — Session 68 / Parity Round 67: The Next.js security-patch upgrade + the history-bug standing retest + the 31st-deploy confirmation ladder + the REF-drift re-verification

**The round's motivation.** The computed-style matrix completed at round 66
(the first verification-only round in the project's history). The recorded
frontier items were: the optional muted-foreground/--primary token re-map,
the deploy watch armed at the post-30th finals, and the Next.js 16.4.0
history bug "whose fix lives upstream". This round converts the frontier:

1. **The upgrade watch is NOW ACTIONABLE**: Next.js 16.4.1 (2026-10-14)
   ships **critical security fixes** — unauthenticated RCE in use-cache
   functions returning typed arrays, unauthenticated RCE in the Image
   Optimization API when SVG files are used, and DoS in App Router Server
   Actions — and 16.4.2 (2026-10-15) adds Turbopack snapshot-consistency +
   module-graph fixes. A production-ready codebase (the user's standing
   goal) cannot stay on 16.4.0 against two CRITICAL unauthenticated RCEs.
   The upgrade is a patch-level jump (16.4.0 → 16.4.2) guarded by the full
   gate pyramid.
2. **The history-bug standing retest**: the recorded 16.4.0 Navigation API
   corruption (R56-E: after a full document load of any (app) route, the
   second consecutive client-side navigation replaces the fresh-loaded
   entry's URL with a duplicate of the entry below it — back-back skips
   the page the user landed on) is retested ON THE UPGRADED BUILD via the
   revived detector (`scripts/r68-history-detector.mjs`, the
   session-56 entries-dump shape). Verdict either way is a documentation
   update: the divergence closes (upstream fixed between 16.4.0 and
   16.4.2) or the record stands (now pinned against 16.4.2).
3. **The 31st login deploy — DETECTED by this round's watch**
   (`scripts/r68-deploy-watch.mjs`): login JS `DwY57mhH`→`8hcVVGz2`
   (login CSS QUIET `BpSyi-cD`; the app side QUIET `C-IrDy5f`/`BGNH4KkS`).
   Per the standing protocol: fresh re-auth of the shared REF session
   (done), then the full confirmation ladder on the UPGRADED local build —
   standing 5/5 + sweep 12/12 + verify-r49 13/13 + verify-r45 13/13.
4. **The REF-drift re-verification**: the color censuses (r57–r63) ran
   against a REF that has since deployed ≥3 times (28th/29th/30th — all
   re-audited non-visual at the login/standing level, but the FULL census
   populations were never re-read against the current REF). The
   most-sensitive axis — the light-mode text-color census — is re-run
   against the current REF; any NEW DIFF decomposes into fix families;
   if it reproduces the post-fix allowance set exactly, the matrix holds
   against the live REF.
5. **The token question closure**: the muted-foreground/--primary token
   re-map is settled with computed evidence — the probe re-reads the
   token-riding surfaces (tab triggers, select placeholders, search
   placeholders) and confirms every one carries its neutral-literal
   override pair (the R15-A/R39-E/R63-A fixes) — the token re-map has
   ZERO user-visible surface and closes as an ARCHITECTURAL NOTE, not a
   fix family.

## The ToDo list (validated against the codebase)

1. **[DONE]** Baseline gates on 16.4.0 (reproduce-before-trusting):
   lint 0/0 · tsc ✓ · 910/910 unit · build ✓ · **E2E 366/366 (5.5m,
   zero flakes)**.
2. **[DONE]** The r68 deploy watch written + run — **THE 31ST LOGIN
   DEPLOY DETECTED** (login JS `DwY57mhH`→`8hcVVGz2`, CSS quiet, app
   quiet). Fresh re-auth of the shared ref session completed.
3. **[DONE]** The upgrade: `bun add next@16.4.2 eslint-config-next@16.4.2`
   (package.json pinned to the exact patch version). Post-upgrade quick
   gates: lint 0/0 · tsc ✓ · **910/910 unit** · build ✓ (22.4s compile).
4. **E2E full suite on the upgraded build** — the 366-spec gate re-run
   (the upgrade's regression proof; any failure = a real 16.4.2
   divergence).
5. **The 31st-deploy confirmation ladder** (sequential after E2E per the
   resource-competition protocol): `r52-standing-run.mjs` (standing 5/5 +
   sweep 12/12 — boots the UPGRADED standalone on :3200, a free re-check
   that the standing audits pass on 16.4.2) → `verify-r49.mjs` (13/13,
   :3201 zero-tenant) → `verify-r45.mjs` (13/13, :3200). Verdict:
   the 31st is NON-VISUAL (expected — app side quiet) or a visual
   re-census opens.
6. **The history-bug standing retest** (`scripts/r68-history-detector.mjs`
   on the :3200 upgraded server): the Navigation API entries dump after
   full-load + two client-side navigations + the back-back walk. CLEAN =
   the R56-E divergence CLOSES (update the AGENTS record + the E2E
   comment); CORRUPT = the record stands, now measured against 16.4.2.
7. **The REF-drift light re-census**: `r63-lighttext-census.mjs` re-run
   (3 batches, full 49-route population) against the current REF —
   expected: the post-fix family (26 MATCH + the F-family
   pin-fixed routes + the 5 documented allowances); any NEW DIFF =
   decompose (`r63-probe.mjs` family) → fix → TDD pins.
8. **The token closure probe**: the computed read of every
   token-riding surface family (inactive tab triggers, empty select
   triggers, search placeholders) in light + dark on LOC vs the REF
   values — confirming the literal overrides carry parity per surface;
   the closure recorded in the plan's completion record + the worklog.
9. **The standing checks**: the mobile-menu full functional cycle
   (toggle → nav links → navigate → close; the standing user emphasis)
   + the byte-stability pair vs the r67 418 set + the TW-v4 standing
   scan (`!important` count 15, the trap patterns, the oklch comment
   audit).
10. **Screenshots**: the 422+ pair set (the round's theme: the
    upgraded-build evidence + the 31st-deploy REF pair) via a new
    `r68-screenshots.mjs`; saved to `docs/screenshots/`.
11. **Docs**: AGENTS session-68 layer + Commands (unit/E2E counts on
    16.4.2), CLAUDE (the pyramid counts), README (the counts + the
    version badges row + the session-68 spec tail), eon-hr_SKILL.md
    3.51.0 + §78 + the State line (the upgrade + the history verdict),
    this plan's completion record, `docs/session_142.md` (the narrative)
    + `docs/session_143.md` (the raw log), the worklog;
    `.env.example` verified (only DATABASE_URL + AUTH_SECRET are read).
12. **Commit ×3 + SSH push to main** (the `fix:` commit with the round
    message, the `docs+verify:` commit, the `update session log`
    journal commit) via `docs/ssh_git_wrapper_v3.py` per the wrapper
    skill; NO new branches.

## The standing non-goals (recorded, not changed this round)

- The muted-foreground/--primary token re-map: closes as ARCHITECTURAL
  (zero user-visible surface; the literal overrides carry every
  computed-parity surface — the probe is item 8's evidence).
- The Next.js 16.4.0 history bug: retested on 16.4.2 (item 6); the
  outcome updates the record but the E2E one-click back contract stays
  the pin either way (it pins the CORRECT behavior).
- The with-data superset surfaces stay REF-unmeasurable at the demo's
  zero state (standing allowance note).

---

## Completion record (session-68, executed 2026-10-21)

- **[1 — DONE]** Baseline gates on 16.4.0 (reproduce-before-trusting):
  lint 0/0 · tsc ✓ · 910/910 unit · build ✓ · **E2E 366/366 (5.5m,
  zero flakes)** — the documented baseline held exactly.
- **[2 — DONE]** The r68 deploy watch written + run:
  **THE 31ST LOGIN DEPLOY DETECTED** — login JS `DwY57mhH`→`8hcVVGz2`
  (CSS QUIET `BpSyi-cD`; the app side QUIET `C-IrDy5f`/`BGNH4KkS`).
  Fresh re-auth of the shared REF session completed (the auth fill's
  single-quote password contract respected).
- **[3 — DONE]** The upgrade: `bun add next@16.4.2
  eslint-config-next@16.4.2` (package.json pinned to the exact patch
  version). Post-upgrade gates: lint 0/0 · tsc ✓ · **910/910 unit** ·
  build ✓ (22.4s compile, standalone + static copy respected).
- **[4 — DONE]** E2E full suite on the upgraded build:
  **366/366 PASSED (5.6m, zero flakes)** — the upgrade is
  regression-free at the full gate level.
- **[5 — DONE]** The 31st-deploy confirmation ladder (sequential
  after the E2E, per the resource-competition protocol), on the
  UPGRADED :3200 standalone: standing **5/5** + sweep **12/12** +
  verify-r49 **13/13** + verify-r45 **13/13** → **NON-VISUAL**. The
  watch finals are the post-31st hashes (`8hcVVGz2` login JS; CSS +
  app side unchanged).
- **[6 — DONE]** The history-bug standing retest
  (`scripts/r68-history-detector.mjs`): **CLEAN — the 16.4.0
  corruption is FIXED UPSTREAM between 16.4.0 and 16.4.2.** The
  entries dump (deterministic, after the `about:blank` reset
  pre-step): after a full load of /profile `["/profile"]` → click 1
  pushes `["/profile","/staffrequests"]` → click 2 pushes
  `["/profile","/staffrequests","/training"]` — push-only growth,
  prefix preserved, ZERO adjacent duplicates — and back-back REACHES
  /profile (the loaded page). The 16.4.0 signature (the loaded entry
  replaced by the entry-below duplicate, 5/5 deterministic per the
  session-56 §B record) is gone. **The R56-E recorded functional
  divergence CLOSES.** Locked with 2 computed-truth E2E pins in
  `tests/e2e/session68-history-closure.spec.ts` (R68-A the two-deep
  back contract + R68-B the push-only entries contract) — green on
  the first run (3/3 with the setup project).
- **[7 — DONE]** The REF-drift light re-census (the r63 instrument,
  full 49-route population, against the CURRENT REF post-31st):
  **42/49 MATCH — NO DRIFT.** Better than the r63 post-fix 41/49
  (the r63-era taskmanager mid-load transient now MATCHES at steady
  state). Every DIFF decomposes to the documented allowance set
  exactly: employees (the seeded grid cards), profile (the asChild
  back-arrow tag artifact), attendance (the admin superset),
  interviewassistant (the r48-C1 card), advancedanalytics (the hidden
  recharts-tooltip mount), onboardingtemplates (the r36 `<a>`
  superset), careers (REF's live data). The geometry/margin axes were
  NOT re-run: the plan's trigger condition (a new DIFF on the text
  axis) did not fire; the r67 dark censuses byte-proved both axes
  theme-invariant and the 31st deploy left the app assets quiet.
- **[8 — DONE]** The token closure: the census itself is the
  evidence — every placeholder surface reads `rgb(115,115,115)` on
  both sides, every muted text pair matches, every neutral literal
  override held (the R15-A tab literals, the R37-E select literals,
  the R63-A placeholder literals). **The muted-foreground/--primary
  token re-map question CLOSES as ARCHITECTURAL** — zero
  user-visible surface; re-mapping the tokens would change no
  computed value on any censused surface.
- **[9 — DONE]** The standing checks: the mobile-menu full functional
  cycle (toggle → the drawer opens with the nav links → the Training
  LMS link navigates to /training → auto-close verified
  `open:false` post-navigation) + **the byte-stability pair: the 438
  LIGHT mobile drawer pair @390×844 BYTE-MATCHES the r67 418 pair on
  BOTH sides (md5-identical)** — a FOUR-round byte-stability chain
  (438 ≡ 418 ≡ 402 ≡ 366) and the FIRST CROSS-VERSION byte-proof
  (418 on 16.4.0 vs 438 on 16.4.2: the upgrade changed zero rendered
  bytes of the standing surface; the REF side identical re-confirms
  the 31st deploy left the app surface untouched). The TW-v4
  standing scan: `!important` 15 (baseline held), the oklch hits all
  comments, the trap patterns in place.
- **[10 — DONE]** Screenshots: `scripts/r68-screenshots.mjs` — the
  422–439 set (18 files → 616 total; all same-number pairs
  hash-distinct; the three pre-existing early-round duplicate-named
  files documented as such): the LIGHT route pairs on the upgraded
  build (dashboard, payroll, hrreports, settings, profile,
  taskmanager, staffrequests, recruitment), the LIGHT mobile drawer
  pair, + the inline mobile-menu functional cycle.
- **[11 — DONE]** Docs: AGENTS session-68 layer + the five r68
  instrument lessons + the Commands counts (910/368), CLAUDE (the
  1278-spec pyramid = 910+368 + the test-table 46/368), README (the
  counts + the session-68 spec tail), eon-hr_SKILL.md 3.51.0 + §78 +
  the State line (the upgrade + the closure), this completion
  record, `docs/session_142.md` (the narrative) +
  `docs/session_143.md` (the raw log), the worklog;
  `.env.example` verified (only DATABASE_URL + AUTH_SECRET are
  read). DB pristine: the verify-r45 loading-probe user found + swept
  per the r61 protocol → users = [sepnetflix2023@outlook.com] only.
- **[12 — PENDING at write time; executed before push]** Commit ×3
  (the `fix:` commit with the round message, the `docs+verify:`
  commit, the `update session log` journal commit) + the SSH-wrapper
  push to main per `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`;
  no new branches.
- **The gates at push time**: lint 0/0 · tsc ✓ · 910/910 unit ·
  build ✓ · **E2E 368/368** (366 re-validated on the upgraded build +
  the 2 new closure pins) · the censuses: the drift re-read 42/49
  (all allowances) · the byte-stability pair 438≡418 · DB pristine.
- **The round's headline**: THE SECURITY UPGRADE LANDED + THE ONE
  RECORDED FUNCTIONAL DIVERGENCE CLOSED — the codebase now runs on
  Next.js 16.4.2 (two critical unauthenticated RCEs patched), the
  16.4.0 history corruption is confirmed fixed upstream and locked
  with E2E pins, the 31st deploy re-audited non-visual on the
  upgraded build, the light-text axis drift-verified against the
  current REF with the allowance set reproduced exactly (and the
  count improved), and the token question closed as architectural —
  the project's remaining recorded backlog is now EMPTY of open
  visual/functional items.
