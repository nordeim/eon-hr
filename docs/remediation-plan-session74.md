# Remediation Plan — Session 74 / Parity Round 73: the PWA installability end-to-end pass (Chrome's own zero-errors verdict, pinned executable) + the SW cache-lifecycle hardening (the found-and-fixed audit gap: the un-bumped generation + the unbounded chunk cache) + the 36th-deploy confirmation ladder

**The round's motivation.** The session-73 completion record left the
backlog EMPTY of open visual/functional items — the matrix complete,
the transport layer parity-hardened and four-times superseded (r68
headers + r70/r71 CSP + the elem/attr split + Trusted-Types + the
cross-origin isolation trio), the SEO surface complete, the TLS
deployment story pinned, the PWA offline shell shipped and LINKED
everywhere (the r73 manifest hoist). The standing watches were: the
deploy watch (re-armed at the post-35th finals: login JS `BANnI-PC` +
CSS `COgwiEvt` + the preload; the app side `C-IrDy5f`/`BGNH4KkS`),
the Next.js patch watch (16.4.3+), the Turnstile rollout (login-side,
watch-only), and the upstream dependency watch (braces 3.0.4+; Prisma
stable 8 carrying deepmerge-ts 8). The candor-ordered candidates from
session_160: "run the r74 deploy watch; the candor-ordered superset
candidates are the offline-page styling polish (deliberately deferred
— no REF counterpart), the PWA installability end-to-end pass (a
beforeinstallprompt-driven install on the patched build, now
structurally complete after this round's manifest hoist), and
whatever the next deploy carries." This round executes exactly that
frontier — the deploy carried (again), and the fresh-eyes audit of
the r72-era SW found the round's fix.

1. **The r74 deploy watch (the r73 instrument re-armed at the post-35th
   finals): THE 36TH LOGIN DEPLOY DETECTED** — login JS
   `BANnI-PC`→`index-CiBFwtqW` AND login CSS `COgwiEvt`→
   `index-B9rzNd1e` (the second CSS movement in two rounds; the app
   side QUIET `C-IrDy5f`/`BGNH4KkS`; the `frontend-config` preload
   holding). The fresh re-auth clean — Turnstile stays unenforced for
   our session/IP (the standing watch item holds; the login DOM
   census re-read the unchanged structure: the social-button set, one
   email+password form, zero rendered Turnstile widgets). The full
   confirmation ladder (below) audited the 36th NON-VISUAL. The watch
   is re-armed at the post-36th finals (`scripts/r74-deploy-watch.mjs`:
   login JS `index-CiBFwtqW` + CSS `index-B9rzNd1e`; the app side
   `C-IrDy5f`/`BGNH4KkS`) and reads BOTH SIDES QUIET.

2. **The Next.js patch watch: QUIET** — 16.4.2 remains the latest
   stable (16.5.0 canary-only at the r74 read). No action; the watch
   stays armed at 16.4.3+.

3. **The upstream dependency watch: the record AMENDED (the
   measurement moved, the action unchanged).** `bun audit` still
   reads exactly two HIGH advisories, both DEV-TOOLING transitive
   chains: `braces@3.0.3` (GHSA-vfj7-8cjw-p6xm; QUIET — 3.0.3 is
   still the latest published, no ecosystem fix) and `deepmerge-ts`
   (GHSA-ggr8-5vv4-36mx) — where the upstream state MOVED: the fix
   (`deepmerge-ts 8.0.2`) has now shipped inside `@prisma/config@7.10.1`
   (the 7.x line), and Prisma's `latest` dist-tag now points at the
   `8.0.0-rc` line. But the repo's stable `prisma@6.19.3` pins
   `@prisma/config: 6.19.3` EXACTLY (a lockfile-verified exact pin, no
   caret), and the 6.x stable line ENDS at 6.19.3 — there is no 6.x
   `@prisma/config` carrying the fix. Taking the 7.x config package
   under the 6.x CLI would be an unsupported cross-major mix; forcing
   it via overrides would be the same class of false fix the r73
   round correctly REVERTED. **No dependency change this round; the
   watch re-records at "a 6.x backport or the repo's Prisma major
   upgrade (7/8 stable)."**

4. **THE R74 DELTA AUDIT (the recent-changes review — the r73 files
   re-verified on the fresh build + the audit-skill sweep)**: the
   session-73 fix family re-reads clean on the current HEAD —
   `next.config.ts` (the COOP/CORP/COEP trio on the r69 catch-all),
   `src/app/layout.tsx` (the manifest hoist + the three nonced boots),
   the r73 spec pair. The source secret-sweep reads zero hardcoded
   credentials; the raw DOM-XSS sink census still reads zero (only
   comment mentions); the five dSHI members all server-rendered,
   constant-authored and nonced. The TW-v4 standing scan clean
   (`!important` 15 — the documented allowance; oklch comments-only).

5. **THE PWA INSTALLABILITY END-TO-END PASS (the candor-ordered
   candidate, R74-B)**: the r73 completion record claimed the
   installability chain "structurally complete" — a
   documented-but-unmeasured assertion, exactly the class the r73
   lesson warns about ("verify documented-but-unpinned claims with a
   live read"). Measured this round via Chrome's own installability
   checker (CDP `Page.getInstallabilityErrors`, the same instrument
   Lighthouse's installable audit rides —
   `scripts/r74-installability-probe.mjs`): **ZERO installability
   errors on BOTH surfaces** — the logged-out /login AND the authed
   /dashboard (`installabilityErrors: []` twice, the manifest link +
   fields + the 192/512 icon decodes + the SW registration + the
   secure-context all verified by Chrome itself). The claim measures
   TRUE. **R74-B pins the verdict executable: a RED-first-intent E2E
   pair (`tests/e2e/session74-pwa-installability.spec.ts`) asserting
   Chrome's zero-errors verdict on both surfaces — green today (the
   standing-contract precedent, R73-Cb/Cc), the tripwire that keeps
   the chain from silently regressing.** The `beforeinstallprompt`
   capture is CONSIDERED AND DECLINED: in a real desktop Chrome the
   event fires on these criteria (with engagement) and the browser's
   own install affordances (omnibox icon / menu) work with ZERO page
   code; a page-side capture exists only to drive a CUSTOM install UI,
   which is a visual-parity non-starter (no REF counterpart — the same
   record as the offline-page polish deferral). No capture, no UI.

6. **THE SW CACHE-LIFECYCLE HARDENING (the round's found-and-fixed
   bug, R74-C)**: the fresh-eyes audit of the r72-era `public/sw.js`
   measured TWO lifecycle defects the r72 design left open —
   **(a) THE FROZEN SHELL**: the SHELL precache (offline.html,
   manifest.json, icon-192/512, eon-logo, og-image) re-fetches ONLY
   at the install event, and the install re-fires ONLY when
   sw.js bytes change — sw.js has not changed since r72, so every
   existing client holds the r72-era shell bytes INDEFINITELY; the day
   a shell asset changes (an icon re-export, a manifest field, the
   deferred offline-page polish), every installed client serves the
   stale copy forever unless someone remembers the hand-bump. The
   bump protocol exists in prose but is UNENFORCED — a latent update
   bug. **(b) THE UNBOUNDED CHUNK CACHE**: `/_next/static/` chunks
   ride cache-first into the same-named cache; every deploy's new
   hash-named chunks accumulate and NOTHING evicts them (the
   activate sweep deletes only OTHER-named caches) — a slow storage
   leak bounded only by the browser's whole-origin eviction.
   **R74-C ships the generation mechanism + the bound**: sw.js gains
   the `GEN = "r74"` constant + the generation-stamped
   `SHELL_CACHE = "eon-hr-shell-r74"` + the stable-across-generations
   `CHUNKS_CACHE = "eon-hr-chunks"` (immutable chunks survive shell
   bumps — no re-download) + the `CHUNKS_CAP = 120` oldest-first trim
   on every chunk put (bounded accumulation; Cache Storage keys()
   return insertion order in Chromium — the trim deletes the
   oldest-first, worst-case a random chunk re-fetches lazily,
   harmless); the activate sweep keeps exactly the current pair, so
   every existing r72-generation client migrates on this update. The
   bump protocol turns EXECUTABLE: the unit tripwire
   (R74-C1) hashes every SHELL asset and pins the digest to the GEN —
   editing a shell asset without bumping GEN (and the pinned digest)
   goes RED with the message that guides the bump. **Non-visual by
   construction (a head-layer static file + the test layer); the
   byte-stability chain is unaffected.**

7. **THE STANDING CHECKS (the r73 protocol carried forward)**: the
   mobile-menu functional cycle (toggle → the drawer → the Training
   LMS link → auto-close `open:false`), the mobile-drawer byte-stability
   pair vs the r73 526 pair (the TEN-round chain 527≡526≡509≡492≡
   474≡456≡438≡418≡402≡366, both sides), the TW-v4 scan (15
   `!important`, oklch comments-only), and the DB pristine sweep (the
   r61 protocol; the ladder's loading-probe user swept — verified
   `users = [sepnetflix2023@outlook.com]`).

## The ToDo list (validated against the codebase)

- [x] **R74-A1** — Workspace refresh: fresh clone @ f806e1b, `bun
  install` (525 packages), `.env` from `.env.example`
  (`DATABASE_URL="file:../db/custom.db"` — resolves against
  prisma/schema.prisma → `<repo>/db/custom.db`, the `db/` folder at
  the repo root, gitignored) + an `AUTH_SECRET` (openssl rand -hex
  32), `db:generate` + `db:push` + `db:seed` (seeded clean: Annual
  21/21, Sick 30/30). The exported-DATABASE_URL trap hit and retired
  (the sandbox exports `DATABASE_URL=file:/home/z/my-project/db/custom.db`;
  `env -u DATABASE_URL` per invocation, the wrong-path DB swept).
  **Verified live: health `{"status":"ok","db":"up"}`.**
- [x] **R74-A2** — The baseline gates on the unmodified HEAD: lint 0/0 ·
  typecheck clean · unit **937/937** · build OK (the standalone boots).
- [x] **R74-A3** — The r74 deploy watch: **THE 36TH LOGIN DEPLOY
  DETECTED** (login JS `BANnI-PC`→`index-CiBFwtqW` + the preload AND
  login CSS `COgwiEvt`→`index-B9rzNd1e`; the app side QUIET) —
  `scripts/r74-login-probe.mjs` classifies it.
- [x] **R74-A4** — The confirmation ladder: the fresh logged-out login
  pair BYTE-IDENTICAL to the r73 510 baseline (`69aa4241…` both) +
  the fresh REF re-auth → **standing 5/5 + sweep 12/12 (the r52
  orchestrator, the seeded :3200) + verify-r49 13/13 (the zero-tenant
  :3201) + verify-r45 13/13 (the standalone login reaudit)** →
  **THE 36TH DEPLOY IS NON-VISUAL**. The watch re-armed at the
  post-36th finals (`scripts/r74-deploy-watch.mjs`) reads BOTH SIDES
  QUIET.
- [x] **R74-A5** — The standing checks pre-pass: TW-v4 scan clean (15
  documented `!important`, oklch comments-only) · DB pristine (the
  probe user swept; users = the demo account only) · the r73 fix
  family re-read clean · the secret/sink census zero · the
  chromium-cache trap retired (`bunx playwright install chromium` —
  1248 restored).
- [ ] **R74-B1** — **RED-first-intent**: the
  `tests/e2e/session74-pwa-installability.spec.ts` pin — Chrome's own
  installability verdict (CDP `Page.getInstallabilityErrors`) asserted
  EMPTY on the logged-out /login (R74-B1a) AND on the authed
  /dashboard (R74-B1b, storageState'd, SW-ready-settled). Measured
  TRUE this round (the probe); expected GREEN on HEAD — the
  standing-contract pin (the R73-Cb/Cc precedent), the regression
  tripwire for the whole installability chain (manifest link → fields
  → icon decodes → SW registration → secure context).
- [ ] **R74-C1** — **RED**: the unit tripwire in
  `tests/unit/pwa-surface.test.ts` (R74-C1): (a) the generation
  mechanism pins — `GEN` exists, `SHELL_CACHE` derives from it
  (`eon-hr-shell-${GEN}` literal-consistency), `CHUNKS_CACHE` is the
  stable name, `CHUNKS_CAP` is a number; (b) the shell-drift
  tripwire — the sha256 digest over the six SHELL asset bytes pinned
  to the current GEN (an asset edit without a GEN bump goes RED with
  the bump-guiding message); (c) the chunks-bound pins — the trim on
  put (`keys().length > CHUNKS_CAP` → oldest-first delete) + the
  activate sweep keeping exactly the current pair. **Failing on the
  unpatched build** (the mechanism absent — sw.js still reads the
  r72 literals).
- [ ] **R74-C2** — **GREEN**: the `public/sw.js` amendment — the `GEN`
  constant + the generation-stamped `SHELL_CACHE` + the stable
  `CHUNKS_CACHE` + the `CHUNKS_CAP` trim on the chunk put + the
  activate sweep amended to keep exactly the pair. The navigation
  branch UNTOUCHED (the leak-free design: the EXACTLY-ONE
  `caches.match(offlineUrl)` pin holds). The registration bootstrap
  UNTOUCHED (scope, production-only, the nonced render).
- [ ] **R74-C3** — The spec-family amendments (the contract evolves,
  the r73 precedent): the r72 unit pin "the versioned cache name"
  (`toContain("eon-hr-shell-r72")`) amends to the generation-derived
  name; the r72 E2E semantic contract (R72-B1's
  `toContain("eon-hr-shell-r72")`) amends the same way; the whole r72
  family (R72-B1..B4) + the r73 PWA family (R73-Ca..Cd) re-run GREEN
  on the patched build (the offline fallback + the SW control + the
  manifest linkage all ride the amended sw.js).
- [ ] **R74-D1** — The screenshot set (`scripts/r74-screenshots.mjs`,
  numbers 527+): the LOGIN pair @1440x900 (the post-36th surface),
  the LIGHT standing route pairs (dashboard, payroll, employees,
  attendance, training, recruitment, settings — REF-LOC), the LIGHT
  mobile drawer pair @390x844 (the standing byte-stability check vs
  the r73 526 pair — the TEN-round chain), + the inline mobile-menu
  functional cycle (toggle → the drawer with the nav links → the
  Training LMS link CLICKED:/training → auto-close `open:false`).
- [ ] **R74-D2** — The byte-stability proof: the new drawer pair
  BYTE-MATCHES the r73 526 pair on both sides (the fix is
  head-layer — zero rendered bytes), the login pair BYTE-MATCHES the
  r73 510 pair, and the standing route pairs stay byte-stable vs the
  r73 set.
- [ ] **R74-E1** — The FULL E2E suite as the final proof (sequential,
  the r72 load lesson): **394 + the r74 pins, zero flakes expected**.
- [ ] **R74-E2** — The full gate ladder: lint 0/0 · typecheck clean ·
  unit 937/937 (+ the R74-C additions) · build OK.
- [ ] **R74-F1** — The docs layer: AGENTS.md (the session-74 layer +
  the Commands counts), CLAUDE.md (the pyramid + the test table),
  README.md (the counts + the spec tail), eon-hr_SKILL.md (the version
  + §84 + the State line), this plan's completion record,
  docs/session_162.md (the narrative) + docs/session_163.md (the raw
  log), worklog.md (the round-73 entry).
- [ ] **R74-F2** — `.env.example` re-verified (only DATABASE_URL +
  AUTH_SECRET read — the process.env sweep re-run on the patched
  source).
- [ ] **R74-F3** — The commit (main only) + the SSH-wrapper push
  (docs/ssh_git_wrapper_v3.py, `--remote git@github.com:nordeim/eon-hr.git`
  — the r71 correction, the how-to runbook followed verbatim, the key
  materialized outside the repo + shredded after).

## The standing non-goals (recorded, not changed this round)

- Turnstile stays unenforced for our session/IP (the standing REF
  login-side watch item — login-side only, watch-only).
- No `beforeinstallprompt` capture + no custom install UI (the
  browser's own install affordances work with zero page code; a
  custom UI has no REF counterpart — the offline-page-polish
  precedent).
- No manifest `id` / `purpose: maskable` additions (considered;
  Chrome reads zero installability errors without them —
  `id` defaults to start_url, the default `purpose: any` renders
  fine; adding un-earned fields is speculative).
- The offline page keeps its minimal CSP-clean styling (the
  offline-page-styling-parity candidate deliberately deferred: no REF
  counterpart exists to parity against).
- No `upgrade-insecure-requests` (HSTS covers TLS; the
  standalone/E2E transport is plain HTTP — the r68/r70 record).
- `style-src-attr` keeps `'unsafe-inline'` (the Radix/vaul/recharts
  dynamic-attribute reality — the r71 record).
- The TT default policy stays a pass-through, not a sanitizer (the
  r72 HONEST SCOPE record).
- The SW never caches page HTML/API (the leak-free design — the r72
  record; offline data sync stays out of scope).
- The two `bun audit` advisories stay accepted dev-chain items
  (braces: no fix exists; deepmerge-ts: the fix is upstream in the
  7.x config line but unreachable under the repo's exact-pinned
  stable-6 CLI) — the runtime graph is unaffected.
- The `CHUNKS_CAP` trim's insertion-order assumption is documented
  in-source (the Cache Storage spec does not guarantee key order;
  Chromium returns insertion order — the worst case is trimming a
  random still-valid chunk that lazily re-fetches, harmless).

## Completion record (session-74, executed 2026-10-21/22)

- [x] **R74-A1** — DONE. Fresh clone @ f806e1b; `bun install` (525
  packages); `.env` from `.env.example` with
  `DATABASE_URL="file:../db/custom.db"` (the db-path contract holds:
  `<repo>/db/custom.db`, `db/` at the repo root, gitignored); prisma
  generate + db push + seed clean (Annual 21/21, Sick 30/30);
  AUTH_SECRET generated. The exported-DATABASE_URL trap hit and
  retired (the sandbox exports its own DATABASE_URL —
  `env -u DATABASE_URL` per invocation; the wrong-path DB swept).
  Health `{"status":"ok","db":"up"}` verified live.
- [x] **R74-A2** — DONE. Unmodified-HEAD baseline: lint 0/0 · tsc
  clean · unit 937/937 · build OK (the standalone boots).
- [x] **R74-A3** — DONE. `scripts/r74-login-probe.mjs` (the r73
  instrument, re-based at the 510 baseline): **THE 36TH LOGIN DEPLOY
  DETECTED** — login JS `BANnI-PC`→`index-CiBFwtqW` + the
  `frontend-config` preload AND login CSS `COgwiEvt`→`index-B9rzNd1e`
  (the second CSS movement in two rounds); the app side QUIET
  `C-IrDy5f`/`BGNH4KkS`; the fresh re-auth clean (Turnstile
  unenforced — the standing watch item; the login DOM census
  unchanged).
- [x] **R74-A4** — DONE. The full ladder: the fresh logged-out login
  pair BYTE-IDENTICAL to the r73 510 baseline (`69aa4241…` both) + the
  fresh REF re-auth → **standing 5/5 + sweep 12/12** (the r52
  orchestrator, the seeded :3200) **+ verify-r49 13/13** (the
  zero-tenant :3201) **+ verify-r45 13/13** (the standalone login
  reaudit) → **THE 36TH DEPLOY IS NON-VISUAL**. The watch re-armed at
  the post-36th finals (`scripts/r74-deploy-watch.mjs`: login JS
  `index-CiBFwtqW` + CSS `index-B9rzNd1e`) reads BOTH SIDES QUIET —
  after retiring one instrument trap: the first re-armed run's eval
  timeouts read the LOGIN page's bundles as the "app side" (a
  daemon-overload + navigation-race artifact; verified the authed
  surface on a warm session before classifying — the lesson recorded).
- [x] **R74-A5** — DONE. The standing checks pre-pass: TW-v4 scan
  clean (15 documented `!important`; oklch comments-only) · DB
  pristine (the probe user swept; users = the demo account only) ·
  the r73 fix family re-read clean · the secret/sink census zero ·
  the chromium-cache trap retired (`bunx playwright install
  chromium` — 1248 restored).
- [x] **R74-B1** — DONE (GREEN-on-HEAD, the standing-contract pin).
  Measured FIRST via `scripts/r74-installability-probe.mjs` (CDP
  `Page.getInstallabilityErrors`): **ZERO installability errors on
  BOTH surfaces** — the logged-out /login AND the authed /dashboard
  (`installabilityErrors: []` twice). Pinned by
  `tests/e2e/session74-pwa-installability.spec.ts` (R74-B1a/b) —
  green on the unpatched HEAD (3 passed incl. setup), the r73
  "structurally complete" claim now an executable contract.
- [x] **R74-C1** — DONE (RED). The unit tripwire in
  `tests/unit/pwa-surface.test.ts`: R74-C0..C3 — the GEN mechanism
  pins + the shell-drift tripwire (`r74:37b1d2ee6cc95c840bee0eaba2ec3a3b`
  — the sha256 of the six SHELL asset bytes pinned to the generation)
  + the chunks-bound pins + the activate-sweep pin. **4 failing on
  the unpatched build (the mechanism absent) while the 10 standing
  R72/R73 pins stayed green — the exact RED state.**
- [x] **R74-C2** — DONE (GREEN). The `public/sw.js` amendment: `GEN
  = "r74"` + the generation-stamped `SHELL_CACHE =
  "eon-hr-shell-r74"` + the stable `CHUNKS_CACHE = "eon-hr-chunks"`
  + the `CHUNKS_CAP = 120` oldest-first trim on every chunk put + the
  activate sweep keeping exactly the current pair. The navigation
  branch UNTOUCHED (the EXACTLY-ONE `caches.match(offlineUrl)` pin
  holds); the registration bootstrap UNTOUCHED. Unit 14/14 green;
  941/941 total (+4).
- [x] **R74-C3** — DONE. The spec-family amendments: the r72 unit
  versioned-cache pin amended to the generation-stamped name (with
  the amendment rationale in the comment); the r72 E2E R72-B1
  served-contract assertion amended the same way; the WHOLE r72/r73
  PWA family + the new r74 spec GREEN on the patched build (11
  passed: the offline fallback, the SW control, the manifest linkage,
  the un-authed sw.js fetch, the installability verdicts — all riding
  the amended worker). Curl parity: the served /sw.js carries the
  generation mechanism + the r73 header trio still rides it.
- [x] **R74-D1** — DONE. `scripts/r74-screenshots.mjs` — the 527-543
  set (18 captures): the LOGIN pair (the post-36th surface), the
  LIGHT standing route pairs (dashboard/payroll/employees/attendance/
  training/recruitment/settings REF-LOC), the LIGHT mobile drawer pair
  @390x844 + the inline mobile-menu functional cycle (toggle → the
  drawer Dashboard/Training LMS/Assets/Staff Requests → Training LMS
  CLICKED:/training → auto-close `open:false`).
- [x] **R74-D2** — DONE. The byte-stability proofs: the 543 drawer
  pair BYTE-MATCHES the r73 526 pair on BOTH sides (loc
  `e3df921…`, ref `bfaa0da…` — the TEN-round chain
  543≡526≡509≡492≡474≡456≡438≡418≡402≡366) AND the 527 login pair
  BYTE-MATCHES the r73 510 pair on BOTH sides (`bd718ed…` /
  `69aa4241…`) AND all seven standing route pairs byte-stable vs the
  r73 set on both sides — both fix families changed zero rendered
  bytes and the 36th deploy left both surfaces byte-identical.
- [x] **R74-E1** — DONE. The FULL E2E suite, sequential: **396/396**
  (+2 pins, zero flakes, 6.5m) — every pre-existing spec green WITH
  the generation-mechanism worker active AND the installability
  verdict pins live.
- [x] **R74-E2** — DONE. The gate ladder: lint 0/0 · typecheck clean ·
  unit 941/941 · build OK.
- [x] **R74-F1** — DONE. The docs layer: AGENTS.md (the session-74
  layer + the Commands counts 941/396), CLAUDE.md (the 1337-spec
  pyramid + the test table 10/56 + both session-74 test-list
  entries), README.md (the counts + the session-74 spec tail),
  eon-hr_SKILL.md (3.57.0 + §84 + the State line + the three
  carry-forward lessons), this completion record, docs/session_162.md
  (the narrative), worklog.md (the round-73 entry).
- [x] **R74-F2** — DONE. `.env.example` verified (the process.env
  sweep on the patched source: only DATABASE_URL + AUTH_SECRET are
  read; NODE_ENV/NEXT_RUNTIME are framework internals — the contract
  unchanged).
- [x] **R74-F3** — DONE. The commit (main only) + the SSH-wrapper
  push (`python3 docs/ssh_git_wrapper_v3.py --key-file … --remote
  git@github.com:nordeim/eon-hr.git`, the dry-run first, the key
  materialized outside the repo + shredded after, the remote
  verified).
