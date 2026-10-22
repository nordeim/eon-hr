# Remediation Plan — Session 77 / Parity Round 76: the triple-deploy round (the 39th + the 40th both laddered non-visual, the CSS movement classified as a dead-code sweep) + the transfer-weight audit (the first page-weight measurement) + the THIRTEEN-round byte chain

**The round's motivation.** The session-76 completion record (the
double-deploy round) left the backlog EMPTY of open visual/functional
items; the standing watches were the deploy watch (armed at the
post-38th finals — login JS `index-CXV35yah` + CSS `index-B9rzNd1e`;
the app side `C-IrDy5f`/`BGNH4KkS`), the NEW deploy-cadence watch
(two non-visual rebuilds inside ~10 minutes — "expect more of the
same class"), the Next.js patch watch, the Turnstile rollout, and the
upstream dependency watch. The cadence prediction held immediately:
the watch fired TWICE this round — the 39TH login deploy at the
opening read (login JS AND login CSS — the first CSS movement since
the 35th deploy) and a 40TH mid-round (login JS again, ~20 minutes
later, detected while the probe classified the 39th). Both were
laddered to NON-VISUAL by the full confirmation protocol; the round
adds the CSS-delta classification (the dead-code sweep) and the
transfer-weight audit (the first page-weight measurement in the
program) and extends the byte chain to thirteen rounds.

1. **THE 39TH LOGIN DEPLOY: DETECTED — JS AND CSS BOTH MOVED.** The
   r76 watch (`scripts/r76-deploy-watch.mjs`, armed at the post-38th
   finals) read login JS `index-CXV35yah`→`index-BOwtYlPm` AND login
   CSS `index-B9rzNd1e`→`index-DS1aCkan` (the FIRST login-CSS
   movement since the 35th deploy; the `frontend-config` preload
   holding; the app side QUIET `C-IrDy5f`/`BGNH4KkS`). A CSS movement
   makes the ladder critical — a stylesheet change can render. The
   fresh re-auth clean (Turnstile unenforced — the standing login-side
   watch item); the login DOM census unchanged (the same six-button
   set, one email/password form, zero rendered Turnstile widgets).

2. **THE 40TH LOGIN DEPLOY: DETECTED MID-ROUND.** While the r77 login
   probe (`scripts/r77-login-probe.mjs`) captured the fresh logged-out
   login pair, its census read login JS `index-HY4zt1AJ` — a THIRD
   generation inside one round (`CXV35yah`→`BOwtYlPm`→`HY4zt1AJ`),
   the 40th deploy superseding the 39th's JS entry ~20 minutes in
   (login CSS quiet at `DS1aCkan`; the app side quiet). The
   deploy-cadence watch's prediction is confirmed: the platform is in
   an aggressive rebuild/redeploy cadence.

3. **THE CONFIRMATION LADDER (run on the current — 40th — generation,
   which carries the 39th's CSS):** the fresh login pair
   BYTE-IDENTICAL to the standing `69aa4241…` baseline (the r73..r76
   REF login PNG) + standing **5/5** + sweep **12/12** + verify-r49
   **13/13** + verify-r45 **13/13** → **BOTH DEPLOYS NON-VISUAL.**
   The 39th's unique content is covered transitively: the CSS it
   shipped (`DS1aCkan`) is the CSS the byte-identical proof ran on;
   its JS entry (`BOwtYlPm`) was superseded before any surface could
   be measured, and the generation after it renders byte-identically.

4. **THE CSS-DELTA CLASSIFICATION (the round's forensic work): the
   39th's CSS movement is a DEAD-CODE SWEEP.** Both CSS generations
   fetched live (`B9rzNd1e` 902707 bytes / `DS1aCkan` 902076 bytes —
   a 631-byte shrink). The rule-level diff: **8 arbitrary-value
   utility rules REMOVED** (`bg-[#e2e5ee]`, `bg-[#e9eef6]`,
   `bg-[#fbfcfd]`, `border-[#d6e6fe]/70`, their `.dark:` variants,
   and `dark:text-[#868aa5]`) + **1 rule ADDED**
   (`sm:grid-cols-[11rem_minmax(0,1fr)]`). A usage sweep of the
   current entry bundle (`index-HY4zt1AJ.js`) and the served login
   HTML found **ZERO references** to any of the removed class names —
   dead utilities from an older login-app iteration, swept by the
   platform build. The added grid utility is equally unreferenced.
   The JS entry sizes: `CXV35yah` 97529 → `HY4zt1AJ` 97481 bytes —
   the near-same-size chunk-graph-rebuild signature (the r75
   mechanism).

5. **THE TRANSFER-WEIGHT AUDIT (the round's fresh-eyes instrument —
   `scripts/r77-asset-audit.mjs`): the FIRST page-weight measurement
   in the 76-round program.** Both apps measured per standing surface
   via the browser's OWN PerformanceResourceTiming accounting
   (`performance.getEntriesByType('resource')` — request count,
   transferSize, decodedBodySize, the biggest assets). The verdict:
   **ALL ROUTES HEALTHY on the LOC side** — no route over 2 MiB total
   transfer, no single asset over 1.5 MiB; the authed routes decode
   834-900 KiB each (login 971 KiB), comfortably LEANER than the REF
   SPA's ~2.3 MiB decoded app bundle per authed route (the
   architecture trade: REF ships 3.9 KiB HTML shells + one big SPA;
   LOC server-renders 59-74 KiB HTML per route + smaller per-route
   payloads). The REF record: login 76 requests / 1809 KiB decoded
   on a cold-ish read; the authed routes 3 requests / 2327 KiB from
   the warm cache. Zero anomalies, zero findings.

6. **THE STANDING CHECKS (re-verified this round at HEAD `2ec8d57`):**
   the patch watch QUIET (next 16.4.2 still the latest stable;
   dist-tags.latest = 16.4.2; the 16.5 line at
   `16.5.0-canary.21`) · `bun audit` UNCHANGED (exactly the two
   upstream-blocked dev-chain advisories: braces ≤3.0.3 — still the
   latest published; deepmerge-ts <8 under prisma's exact
   `@prisma/config` 6.x pin) · the TW-v4 scan clean (15 `!important`,
   all in `globals.css`, the documented allowance; oklch 6/6
   occurrences comments-only, zero active calls) · the source
   secret-sweep zero · the raw DOM-XSS sink census zero-unsafe (the
   9 pattern matches classify: 2 comments + 3 JSON-LD
   `JSON.stringify` blocks + 3 constant-authored nonced boot scripts
   + 1 constant style block — all server-rendered, all nonced, zero
   user input) · DB pristine after the sweep (the verify-r45
   signup-flow probe user `loading-probe@example.com` swept per the
   r61 protocol — AFTER the last ladder run; users =
   [sepnetflix2023@outlook.com] at close, employees 1/1, balances
   2/2).

7. **THE BYTE-STABILITY PROOFS (`scripts/r77-screenshots.mjs`,
   numbers 581-597):** the 597 mobile drawer pair BYTE-MATCHES the
   r76 579 pair on BOTH sides (loc `e3df921…`, ref `bfaa0da5…` — the
   THIRTEEN-round chain
   597≡579≡561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366) · the 581
   login pair BYTE-MATCHES the r76 563 pair on BOTH sides
   (`bd718ed0…` / `69aa4241…`) — past BOTH the 39th and the 40th
   deploys (including the CSS movement) · all seven standing route
   pairs (583 dashboard, 585 payroll, 587 employees, 589 attendance,
   591 training, 593 recruitment, 595 settings) BYTE-STABLE vs the
   r76 set on BOTH sides. The REF + LOC auths clean.

8. **THE MOBILE-MENU FUNCTIONAL CYCLE (the standing user emphasis):
   GREEN.** The inline cycle on the LOC build: the toggle opens the
   drawer (`open: true`, links = Dashboard / Training LMS / Assets /
   Staff Requests) → the Training LMS link click registers
   `CLICKED:/training` → the URL lands on `/training` → the drawer
   auto-closes on navigation (`open: false`). No Tailwind-v4
   regression in the mobile navigation (the trap-4 flex-gap layout
   and the trap-6 space-y selector flip both remain correctly handled
   in `src/components/layout/app-shell.tsx`).

9. **THE CLOSING GATES (the push precondition):** lint 0/0 ·
   typecheck clean · unit **941/941** · build OK · E2E **396/396**
   (6.3m, zero flakes, the sequential proof run; the chromium-cache
   pre-checked — both r1200 and r1248 present, no install needed this
   round).

## The round's candor record

- **ZERO DEFECTS FOUND — ZERO SOURCE CHANGES** (the fourth
  consecutive audit-only round). Both deploys laddered non-visual;
  the CSS delta classified as a platform-side dead-code sweep (zero
  usages, PNG-proven); the transfer-weight audit found the LOC side
  healthy and lean; the byte chain extends; the standing checks and
  gates all green. The round's diff is the instruments
  (`scripts/r77-login-probe.mjs` + `scripts/r77-asset-audit.mjs` +
  `scripts/r77-screenshots.mjs`), the evidence (18 screenshots,
  581-597), and the docs layer.
- **The instrument traps retired this round** (all infrastructure,
  classified before touching source): (a) the agent-browser daemon
  overload AGAIN — the first standing-run read 0/5 with the `loc`
  session stuck on `about:blank` and a `CDP command timed out:
  Runtime.evaluate` on the diagnostic — `close --all` + pkill +
  restart + re-auth (the r75 trap re-proven, including the
  close-all-wipes-the-ref-auth side effect); (b) the
  exported-`DATABASE_URL` trap ACTIVE (the sandbox exports its own
  path — `env -u DATABASE_URL` per invocation, the standing
  protocol); (c) the verify-r45 signup-flow probe user swept per the
  r61 protocol AFTER the last ladder run (it re-appeared between the
  sweep and the close once already — the sweep must follow the final
  ladder execution); (d) /tmp does not persist between tool
  invocations in this sandbox — the forensic bundles fetched to a
  repo-local scratch dir (`.tmp-r77/`, swept before the commit).
- **The deploy-cadence watch CONFIRMED.** Three login JS generations
  inside one round (`CXV35yah`→`BOwtYlPm`→`HY4zt1AJ`), the last two
  ~20 minutes apart; the first carried the only CSS movement since
  the 35th deploy (itself a dead-code sweep). The watch stays armed
  at the post-40th finals; the next round should expect further
  deploys of the same class and ladder them the same way.

## The ToDo list (validated against the codebase)

- [x] **R77-A1** — Environment: workspace refreshed (`git pull`,
  fast-forward `87e04df`→`2ec8d57` — the session_169 transcript
  commit; main, clean, remote-matched); `bun install` re-verified
  (530 installs, no changes); `.env` verified
  (`DATABASE_URL="file:../db/custom.db"` → `<repo>/db/custom.db`,
  the db-path contract, the `db/` folder at the repo root,
  gitignored; `AUTH_SECRET` present); DB pristine at round open
  (users = [sepnetflix2023@outlook.com], employees 1/1, balances
  2/2, payroll 0, expenses 0). The exported-`DATABASE_URL` trap
  ACTIVE (the sandbox exports its own path) — `env -u DATABASE_URL`
  per invocation, the standing protocol.
- [x] **R77-A2** — Baseline gates on the unmodified HEAD: lint 0/0 ·
  tsc clean · unit 941/941 · build OK · the standalone boots
  (`{"status":"ok","db":"up"}` on :3200, the env-trap guard
  applied; /login 200).
- [x] **R77-B1** — The r76 deploy watch (armed at the post-38th
  finals): THE 39TH LOGIN DEPLOY DETECTED (login JS
  `CXV35yah`→`BOwtYlPm` AND login CSS `B9rzNd1e`→`DS1aCkan` — the
  first CSS movement since the 35th; the app side QUIET) + the full
  confirmation ladder → NON-VISUAL.
- [x] **R77-B2** — THE 40TH DEPLOY DETECTED MID-ROUND (login JS
  `BOwtYlPm`→`HY4zt1AJ`, read by the probe's census ~20 minutes
  after the 39th; CSS quiet at `DS1aCkan`) — the ladder ran on the
  current generation (which carries the 39th's CSS) → NON-VISUAL;
  the watch re-armed at the post-40th finals.
- [x] **R77-B3** — The CSS-delta classification: both CSS
  generations fetched + rule-level diffed — the dead-code sweep (8
  removed arbitrary-value rules + 1 added, zero usages in the entry
  bundle or the rendered HTML); the JS entry sizes recorded
  (97529→97481 bytes, the chunk-graph-rebuild signature).
- [x] **R77-A5** — The standing checks: the patch watch QUIET (16.4.2
  latest stable; `16.5.0-canary.21`) · `bun audit` unchanged (2
  upstream-blocked dev-chain advisories) · the TW-v4 scan clean (15
  `!important`; oklch 6/6 comments) · secrets zero · XSS sinks
  zero-unsafe · DB pristine (after the probe-user sweep).
- [x] **R77-C** — The fresh-eyes candidate: THE TRANSFER-WEIGHT AUDIT
  (`scripts/r77-asset-audit.mjs`) — both apps measured per standing
  surface via PerformanceResourceTiming; ALL ROUTES HEALTHY (no
  route over 2 MiB, no single asset over 1.5 MiB; LOC authed 834-900
  KiB decoded vs REF's ~2.3 MiB SPA bundle); the REF record captured.
- [x] **R77-D1** — The screenshot set (`scripts/r77-screenshots.mjs`,
  numbers 581-597): the LOGIN pair @1440x900, the LIGHT standing
  route pairs (dashboard, payroll, employees, attendance, training,
  recruitment, settings), the LIGHT mobile drawer pair @390x844 —
  18 PNGs (784 tracked on disk after the set).
- [x] **R77-D2** — The byte-stability proofs: the THIRTEEN-round
  drawer chain (597≡579, both sides) + the login pair (581≡563, both
  sides) + the route pairs (all stable vs the r76 set, both sides) +
  the inline mobile-menu functional cycle GREEN.
- [x] **R77-E** — The closing gates: lint 0/0 · tsc clean · 941/941
  unit · build OK · E2E 396/396 (sequential, zero flakes, 6.3m).
- [x] **R77-F** — The docs layer: this plan + the AGENTS.md
  session-77 layer + CLAUDE/README/SKILL updates + the session
  narrative + the worklog entry + `.env.example` re-verified (the
  two-variable contract unchanged; already tracked in git).
- [x] **R77-G** — The commit + the SSH-wrapper push to
  `git@github.com:nordeim/eon-hr.git` (main only; the key shredded
  after the push).

## The standing watches (carried forward)

- **The deploy watch** — armed at the post-40th finals: login JS
  `index-HY4zt1AJ` + CSS `index-DS1aCkan`; the app side
  `C-IrDy5f`/`BGNH4KkS`. Quiet at the round's closing read.
- **The deploy-cadence watch** — CONFIRMED: three login JS
  generations inside one round, ~10-20 minute spacing; expect more
  of the same class; ladder them the same way.
- **The Next.js patch watch** — 16.4.2 latest stable (the dist-tag
  read this round); the 16.5 line at `16.5.0-canary.21`. Re-record
  at 16.5 stable.
- **The Turnstile rollout** — the standing login-side watch item
  (unenforced for our session/IP at every read, including this
  round's fresh re-auths).
- **The upstream dependency watch** — braces 3.0.4+ (3.0.3 still the
  latest published); the Prisma path (a 6.x `@prisma/config` backport
  carrying deepmerge-ts 8, or the repo's Prisma major upgrade).
- **The candor-ordered frontier** — a real-Chrome install smoke on a
  deployed HTTPS origin (BLOCKED-IN-SCOPE in this sandbox; re-opens
  the moment an HTTPS origin exists); the offline-page styling polish
  (still deliberately deferred — no REF counterpart).
