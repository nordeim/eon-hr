# Remediation Plan — Session 76 / Parity Round 75: the double-deploy round (the 37th + the 38th, both laddered non-visual) + the bundle forensics (the chunk-graph rebuild mechanism) + the TWELVE-round byte chain

**The round's motivation.** The session-75 completion record (the
audit-only round) left the backlog EMPTY of open visual/functional
items; the standing watches were the deploy watch (armed at the
post-36th finals — login JS `index-CiBFwtqW` + CSS `index-B9rzNd1e`;
the app side `C-IrDy5f`/`BGNH4KkS`), the Next.js patch watch, the
Turnstile rollout, and the upstream dependency watch. The deploy
watch fired TWICE this round — the 37th login deploy at the round's
opening read, and the 38th a ~10-minute follow-up detected mid-round
while the 37th's bundle was being fetched for the forensic diff.
Both were laddered to NON-VISUAL by the full confirmation protocol;
the round adds the bundle-forensics instrument (the deploy-content
classification beyond the rendered-surface proof) and extends the
byte chain to twelve rounds.

1. **THE 37TH LOGIN DEPLOY: DETECTED + LADDERED NON-VISUAL.** The
   r76 watch (`scripts/r76-deploy-watch.mjs`, armed at the post-36th
   finals) read login JS `index-CiBFwtqW`→`index-BVGv30vf` (the
   `frontend-config` preload holding) with login CSS QUIET
   (`index-B9rzNd1e`) and the app side QUIET (`C-IrDy5f`/`BGNH4KkS`).
   The fresh re-auth on the new deploy clean (Turnstile unenforced —
   the standing login-side watch item; the login DOM census unchanged:
   the same social-button set, one email/password form, zero rendered
   Turnstile widgets). The full confirmation ladder: the fresh
   logged-out login pair BYTE-IDENTICAL to the standing baseline
   (`69aa4241…`, the r73..r75 REF login PNG) + standing **5/5** +
   sweep **12/12** + verify-r49 **13/13** + verify-r45 **13/13** →
   **THE 37TH LOGIN DEPLOY IS NON-VISUAL.**

2. **THE 38TH LOGIN DEPLOY: DETECTED MID-ROUND + LADDERED NON-VISUAL.**
   While fetching the 37th's bundle for the forensic diff, the raw
   HTML served a NEWER entry (`index-CXV35yah`) — a second deploy had
   landed ~10 minutes after the first. The watch re-read confirmed:
   login JS `index-BVGv30vf`→`index-CXV35yah` (CSS again QUIET, the
   app side again QUIET). The full ladder re-run green on the new
   deploy: the fresh login pair again BYTE-IDENTICAL to `69aa4241…` +
   standing 5/5 + sweep 12/12 + verify-r49 13/13 + verify-r45 13/13 →
   **THE 38TH LOGIN DEPLOY IS NON-VISUAL.**

3. **THE BUNDLE FORENSICS (the round's fresh-eyes instrument): BOTH
   DEPLOYS ARE CHUNK-GRAPH REBUILDS.** All three entry generations
   fetched live (the 36th `CiBFwtqW` 97530 bytes, the 37th `BVGv30vf`
   97529, the 38th `CXV35yah` 97529 — three distinct md5s). The
   generation-over-generation diff is dominated by the
   `__vite__mapDeps` dependency-map chunk-hash churn: ~840 chunk-name
   references regenerated between generations (`mixpanelUtils`,
   `i18n`, `UserAppMain`, `axiosClient`, `vendor-utils`, …) while the
   entry bundle's own code stays the same size and the login page's
   rendered output stays BYTE-IDENTICAL (the PNG proof above). The
   classification: the base44 platform re-deployed the login app
   twice (a platform-side rebuild — chunk-graph regeneration), with
   ZERO rendered change either time. The watch re-armed at the
   post-38th finals (`login JS index-CXV35yah` + CSS
   `index-B9rzNd1e`; the app side `C-IrDy5f`/`BGNH4KkS`) reads BOTH
   SIDES QUIET.

4. **THE STANDING CHECKS (re-verified this round at HEAD `61ac313`):**
   the patch watch QUIET (next 16.4.2 still the latest stable;
   dist-tags.latest = 16.4.2) · `bun audit` UNCHANGED (exactly the two
   upstream-blocked dev-chain advisories: braces ≤3.0.3 via the
   eslint-config-next→fast-glob→micromatch chain — 3.0.3 still the
   latest published; deepmerge-ts <8.0.0 via prisma's exact
   `@prisma/config` 6.x pin — the fix still ships only in the Prisma
   8 line) · the TW-v4 scan clean (15 `!important`, all in
   `globals.css`, the documented allowance; oklch 6/6 occurrences
   comments-only, zero active calls) · the source secret-sweep zero ·
   the raw DOM-XSS sink census zero-unsafe (the 9 pattern matches
   classify: 2 comments + 4 JSON-LD `JSON.stringify` blocks + 3
   constant-authored nonced boot scripts + 1 constant style block —
   all server-rendered, all nonced, zero user input) · DB pristine
   after the sweep (the verify-r45 signup-flow probe user
   `loading-probe@example.com` swept per the r61 protocol; users =
   [sepnetflix2023@outlook.com] at close, employees 1/1, balances 2/2).

5. **THE BYTE-STABILITY PROOFS (`scripts/r76-screenshots.mjs`,
   numbers 563-579):** the 579 mobile drawer pair BYTE-MATCHES the
   r75 561 pair on BOTH sides (loc `e3df921…`, ref `bfaa0da5…` — the
   TWELVE-round chain 579≡561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366)
   · the 563 login pair BYTE-MATCHES the r75 545 pair on BOTH sides
   (`bd718ed0…` / `69aa4241…`) — past BOTH the 37th and the 38th
   deploys · all seven standing route pairs (565 dashboard, 567
   payroll, 569 employees, 571 attendance, 573 training, 575
   recruitment, 577 settings) BYTE-STABLE vs the r75 set on BOTH
   sides. The REF + LOC auths clean.

6. **THE MOBILE-MENU FUNCTIONAL CYCLE (the standing user emphasis):
   GREEN.** The inline cycle on the LOC build: the toggle opens the
   drawer (`open: true`, links = Dashboard / Training LMS / Assets /
   Staff Requests) → the Training LMS link click registers
   `CLICKED:/training` → the URL lands on `/training` → the drawer
   auto-closes on navigation (`open: false`). No Tailwind-v4
   regression in the mobile navigation (the trap-4 flex-gap layout
   and the trap-6 space-y selector flip both remain correctly handled
   in `src/components/layout/app-shell.tsx`).

7. **THE CLOSING GATES (the push precondition):** lint 0/0 ·
   typecheck clean · unit **941/941** · build OK · E2E **396/396**
   (6.3m, zero flakes, the sequential proof run — the chromium-cache
   trap hit and retired en route again: the sandbox cache held r1200
   browsers while `@playwright/test` 1.64.1 needs r1248;
   `bunx playwright install chromium` restored it, a
   browser-cache/environment fix only, no project files modified).

## The round's candor record

- **ZERO DEFECTS FOUND — ZERO SOURCE CHANGES** (the third consecutive
  audit-only round). The two deploys both laddered non-visual; the
  forensics classify them as platform-side chunk-graph rebuilds; the
  byte chain extends; the standing checks and gates all green. The
  round's diff is the instruments (`scripts/r76-deploy-watch.mjs` +
  `scripts/r76-login-probe.mjs` + `scripts/r76-screenshots.mjs`), the
  evidence (18 screenshots, 563-579), and the docs layer.
- **The instrument traps retired this round** (all infrastructure,
  classified before touching source): (a) the STALE REF SESSION
  COOKIE after a deploy — the first ladder read 0/5 standing + 0/12
  sweep because the deploy invalidated the `ref` session's auth and
  every route read the login page's h1; re-auth + re-run green (the
  documented "verify the authed surface on a warm session" lesson,
  now re-proven); (b) the FRESH-SESSION VIEWPORT DEFAULT — after a
  daemon reset the re-authed `ref` session defaulted to 1280px while
  the ladder's loc0 read 1440px, making every responsive recharts
  container read narrow (the surveyanalytics "diff" was pure
  viewport); always `set viewport 1440 900` before reads; (c) the
  agent-browser daemon overload (`spawnSync /bin/sh EAGAIN` under
  many live sessions — `close --all` + pkill + restart restores it),
  with the side effect that `close --all` also wipes the warm `ref`
  session auth (re-auth after every reset); (d) the chromium-cache
  trap (r1200 vs r1248) — retired per protocol; (e) the
  exported-`DATABASE_URL` trap ACTIVE again (the sandbox exports
  `file:/home/z/my-project/db/custom.db` — `env -u DATABASE_URL` per
  invocation; the wrong-path DB swept); (f) the verify-r45
  signup-flow probe user swept per the r61 protocol (DB pristine at
  close).
- **The deploy-cadence observation.** Two login deploys inside ~10
  minutes (the 37th + the 38th) with identical non-visual content
  (same-size entries, chunk-hash churn only) suggests the base44
  platform entered a rebuild/redeploy cadence. The watch stays armed
  at the post-38th finals; the next round should expect further
  deploys of the same class and ladder them the same way.

## The ToDo list (validated against the codebase)

- [x] **R76-A1** — Environment: fresh clone @ `61ac313` (main, clean,
  remote-matched); `bun install` (525 packages); `.env` from
  `.env.example` (`DATABASE_URL="file:../db/custom.db"` →
  `<repo>/db/custom.db`, the db-path contract, the `db/` folder at the
  repo root, gitignored); `AUTH_SECRET` generated; `db:generate` +
  `db:push` + `db:seed` (seeded pristine: Annual 21/21, Sick 30/30).
  The exported-`DATABASE_URL` trap ACTIVE (the sandbox exports its own
  path) — `env -u DATABASE_URL` per invocation, the standing protocol;
  the wrong-path DB swept.
- [x] **R76-A2** — Baseline gates on the unmodified HEAD: lint 0/0 ·
  tsc clean · unit 941/941 · build OK · the standalone boots
  (`{"status":"ok","db":"up"}` on :3200, the env-trap guard applied).
- [x] **R76-B1** — The r76 deploy watch (armed at the post-36th
  finals): THE 37TH LOGIN DEPLOY DETECTED (login JS
  `CiBFwtqW`→`BVGv30vf`; CSS + the app side QUIET) + the full
  confirmation ladder → NON-VISUAL.
- [x] **R76-B2** — The 38TH DEPLOY DETECTED MID-ROUND (login JS
  `BVGv30vf`→`CXV35yah`) + the full ladder re-run → NON-VISUAL; the
  watch re-armed at the post-38th finals reads BOTH SIDES QUIET.
- [x] **R76-B3** — The bundle forensics: three generations fetched +
  diffed — the chunk-graph-rebuild classification (~840 chunk-hash
  refs churned, same-size entries, zero rendered delta).
- [x] **R76-A5** — The standing checks: the patch watch QUIET (16.4.2
  latest stable) · `bun audit` unchanged (2 upstream-blocked dev-chain
  advisories) · the TW-v4 scan clean (15 `!important`; oklch 6/6
  comments) · secrets zero · XSS sinks zero-unsafe · DB pristine
  (after the probe-user sweep).
- [x] **R76-D1** — The screenshot set (`scripts/r76-screenshots.mjs`,
  numbers 563-579): the LOGIN pair @1440x900, the LIGHT standing route
  pairs (dashboard, payroll, employees, attendance, training,
  recruitment, settings), the LIGHT mobile drawer pair @390x844, +
  the inline mobile-menu functional cycle — 18 PNGs (765 tracked on
  disk after the set).
- [x] **R76-D2** — The byte-stability proofs: the TWELVE-round drawer
  chain (579≡561, both sides) + the login pair (563≡545, both sides)
  + the route pairs (all stable vs the r75 set, both sides).
- [x] **R76-E** — The closing gates: lint 0/0 · tsc clean · 941/941
  unit · build OK · E2E 396/396 (sequential, zero flakes, 6.3m).
- [x] **R76-F** — The docs layer: this plan + the AGENTS.md
  session-76 layer + CLAUDE/README/SKILL updates + the session
  narrative + the worklog entry + `.env.example` re-verified (the
  two-variable contract unchanged; already tracked in git).
- [x] **R76-G** — The commit + the SSH-wrapper push to
  `git@github.com:nordeim/eon-hr.git` (main only; the paramiko shim
  deployed outside the repo; the key shredded after the push).

## The standing watches (carried forward)

- **The deploy watch** — armed at the post-38th finals: login JS
  `index-CXV35yah` + CSS `index-B9rzNd1e`; the app side
  `C-IrDy5f`/`BGNH4KkS`. Quiet at the round's closing read.
- **The Next.js patch watch** — 16.4.2 latest stable (the dist-tag
  read this round); the 16.5 line still at canary. Re-record at 16.5
  stable.
- **The Turnstile rollout** — the standing login-side watch item
  (unenforced for our session/IP at every read, including both fresh
  re-auths this round).
- **The upstream dependency watch** — braces 3.0.4+ (3.0.3 still the
  latest published); the Prisma path (a 6.x `@prisma/config` backport
  carrying deepmerge-ts 8, or the repo's Prisma major upgrade).
- **The deploy-cadence watch (new)** — two non-visual login rebuilds
  inside ~10 minutes; the next round should expect further deploys of
  the same chunk-graph-rebuild class and ladder them the same way.
- **The candor-ordered frontier** — a real-Chrome install smoke on a
  deployed HTTPS origin (BLOCKED-IN-SCOPE in this sandbox; re-opens
  the moment an HTTPS origin exists); the offline-page styling polish
  (still deliberately deferred — no REF counterpart).
