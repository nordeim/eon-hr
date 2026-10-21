# Remediation Plan — Session 73 / Parity Round 72: the security-isolation rung (the transport-layer ladder's next step: Cross-Origin-Opener-Policy + Cross-Origin-Resource-Policy + Cross-Origin-Embedder-Policy) + the PWA manifest-linkage completion (the authed-shell gap the r72 census mis-reported) + the 35th-deploy confirmation ladder

**The round's motivation.** The session-72 completion record left the
backlog EMPTY of open visual/functional items — the matrix complete
(r66), the transport layer parity-hardened AND superseded (r68 headers +
r70/r71 CSP + the elem/attr split + the Trusted-Types rung), the SEO
surface complete (r70), the TLS deployment story shipped + pinned (r71),
the PWA offline shell shipped (r72). The standing watches were: the
deploy watch (re-armed at the post-34th finals: login JS `DOgRuj38` + CSS
`BpSyi-cD` + the app side `C-IrDy5f`/`BGNH4KkS`), the Next.js patch watch
(16.4.3+), the Turnstile platform rollout (the login-side watch item),
and the candor-ordered superset candidates from session_157: "the
remaining PWA rungs (a web-app-installability pass, the offline-page
styling parity), a security-headers second pass (COOP/COEP/CORP — REF
serves none, the superset stays open), and whatever the next deploy
carries." This round executes exactly that frontier — and the deploy
carried.

1. **The r73 deploy watch (the r72 instrument re-armed at the post-34th
   finals): THE 35TH LOGIN DEPLOY DETECTED** — login JS
   `DOgRuj38`→`BANnI-PC` AND — the first CSS movement since r70 — login
   CSS `BpSyi-cD`→`COgwiEvt` (the frontend-config preload holds; the app
   side QUIET `C-IrDy5f`/`BGNH4KkS`). The fresh re-auth succeeded clean —
   Turnstile stays unenforced for our session/IP (the standing watch item
   holds; the login DOM census re-read the unchanged 7-button set, one
   email+password form, zero rendered Turnstile widgets). The full
   confirmation ladder (below) audited the 35th NON-VISUAL. The watch
   finals are the post-35th hashes.

2. **The Next.js patch watch: QUIET** — 16.4.2 remains the latest stable
   (16.5.x canary-only at the r73 read). No action; the watch stays armed
   at 16.4.3+.

3. **THE R73 DELTA AUDIT (the recent-changes review — the r72 files
   re-verified on the fresh build + the audit-skill sweep)**: the session-72
   fix family re-reads clean on the current HEAD — `src/lib/csp.ts` (the
   TT pair + worker-src + the elem/attr split), `src/app/layout.tsx` (the
   three nonced boots: TT_BOOT + THEME_BOOT + SW_REGISTRATION, the
   production-only gates), `public/sw.js` (the leak-free navigation
   design: the EXACTLY-ONE `caches.match`), `public/offline.html`
   (CSP-clean by construction), the sitemap/robots pair, and the
   next.config header block. `bun audit` reads TWO advisories, both in
   DEV-TOOLING transitive chains, both upstream-blocked (see item 6).
   The source secret-sweep reads zero hardcoded credentials; the raw
   DOM-XSS sink census still reads zero (only comment mentions).

4. **THE SECURITY-HEADERS SECOND PASS (the candor-ordered candidate, the
   r73 superset)**: the live REF re-measured (curl -sI, this round)
   serves NO `Cross-Origin-Opener-Policy`, NO `Cross-Origin-Embedder-Policy`,
   and NO `Cross-Origin-Resource-Policy` on any surface — the r68 census
   finding holds, and the superset stayed open. The clone earns all
   three: the whole-source URL sweep (session-70, re-verified) reads
   ZERO external runtime resources — every asset self-hosted, no external
   fonts/images/scripts — so `Cross-Origin-Embedder-Policy: require-corp`
   blocks nothing we load. The r69 `/:path*` catch-already covers EVERY
   response (verified this round on a page route, an API route, a
   `/_next/static` chunk, `public/sw.js`, and `public/icon-192.png`), so
   `Cross-Origin-Resource-Policy: same-origin` lands on every subresource
   response — exactly the condition COEP `require-corp` needs. The three
   headers are non-visual (response-layer): the byte-stability chain is
   unaffected by construction. **R73-B ships the trio on the same
   catch-all, pinned by a RED-first E2E pair (a page route + an API
   route), the r69 pattern followed verbatim.**

5. **THE PWA MANIFEST-LINKAGE GAP (the round's found-and-fixed bug)**:
   the r72 census claimed "the clone already superSETS the manifest
   surface (every-page linkage)" — the claim is FALSE as measured this
   round. The manifest link lives ONLY in `src/app/login/layout.tsx`
   (metadata.manifest); the root layout's `generateMetadata` and
   `src/lib/meta.ts`'s `pageMetadata()` set NO manifest, so the ENTIRE
   authed app shell (all 61 routes — the (app) group's layouts all ride
   `pageMetadata()`) serves ZERO `<link rel="manifest">` (measured live
   on the authed dashboard: `manifest:false, themeColor:null`). The
   service worker registers on every page (r72, `controlled:true` on the
   authed shell), but Chrome's installability criteria require the
   manifest LINK on the page being installed — the surface where users
   live has none. **R73-C completes the r72 claim: hoist
   `manifest: "/manifest.json"` + the apple-touch-icon to the ROOT
   layout's metadata (Next's per-field inheritance carries it to every
   page the child does not override; login's own value is identical), a
   non-visual head element (byte-stability unaffected), pinned by a
   RED-first E2E spec asserting the manifest link + the apple icon on an
   AUTHED page (plus the standing login-page contract) + the unit-level
   manifest-fields pin.**

6. **THE DEPENDENCY AUDIT (the skill's Phase-2 sweep, the candor-ordered
   record)**: `bun audit` reads exactly two advisories, both HIGH, both
   DEV-TOOLING transitive chains, both upstream-blocked:
   `braces@3.0.3` (GHSA-vfj7-8cjw-p6xm — stack-exhaustion via deeply
   nested glob patterns; the chain is eslint-config-next →
   @next/eslint-plugin-next → fast-glob → micromatch; 3.0.3 IS the
   latest published version — no fix exists in the ecosystem yet) and
   `deepmerge-ts@7.1.5` (GHSA-ggr8-5vv4-36mx — stack exhaustion merging
   recursive graphs; the chain is prisma → @prisma/config, which pins
   the ^7 line; the fix (deepmerge-ts 8) ships only in the Prisma 8
   line, still RC). Neither package is in the RUNTIME dependency graph
   of the standalone server (both are lint/CLI-era tooling); neither is
   attacker-reachable (the inputs are local eslint globs and prisma
   config files). A surgical `bun update` attempt was made and
   REVERTED: it pollutes package.json with two fake DIRECT dependencies
   (braces + deepmerge-ts) while leaving the real nested consumer
   (@prisma/config) untouched — a false fix. **Recorded as accepted
   dev-chain advisories with the upstream watch (braces 3.0.4+; Prisma
   stable 8), no dependency change this round** (the standing pinned
   stack — next 16.4.2 — stays byte-verified).

7. **THE STANDING CHECKS (the r72 protocol carried forward)**: the
   mobile-menu functional cycle (toggle → the drawer → the Training LMS
   link → auto-close `open:false`), the mobile-drawer byte-stability pair
   vs the r72 509 pair (the NINE-round chain 510≡509≡492≡474≡456≡438≡
   418≡402≡366), the TW-v4 scan (the standing allowance: 15 `!important`,
   oklch in comments only — re-read this round, clean), and the DB
   pristine sweep (the r61 protocol; the ladder's loading-probe user
   swept — re-verified `users = [sepnetflix2023@outlook.com]`).

## The ToDo list (validated against the codebase)

- [x] **R73-A1** — Workspace refresh: clone, `bun install`, `.env` from
  `.env.example` (`DATABASE_URL="file:../db/custom.db"` — the db-path
  contract: resolves against prisma/schema.prisma → `<repo>/db/custom.db`,
  the `db/` folder at the repo root, gitignored), `db:generate` +
  `db:push` + `db:seed` (seeded clean: Annual 21/21, Sick 30/30), and an
  `AUTH_SECRET` (openssl rand -hex 32) for the production-mode
  instrumentation gate. **Verified live: health `{"status":"ok","db":"up"}`,
  /login 200, / 307-auth-redirect.**
- [x] **R73-A2** — The baseline gates on the unmodified HEAD: lint 0/0 ·
  typecheck clean · unit **937/937** · build OK (the standalone boots).
- [x] **R73-A3** — The r73 deploy watch: **the 35TH LOGIN DEPLOY
  DETECTED** (JS `BANnI-PC` + CSS `COgwiEvt`, the app side quiet) —
  scripts/r73-login-probe.mjs classifies it (the fresh logged-out login
  pair @1440x900 LIGHT byte-compared against the r72 493 baseline).
- [x] **R73-A4** — The confirmation ladder: the fresh REF re-auth →
  **standing 5/5 + sweep 12/12 + verify-r49 13/13 (zero-tenant) +
  verify-r45 13/13 (login reaudit)** → **THE 35TH DEPLOY IS NON-VISUAL**
  (the login pair BYTE-IDENTICAL to the r72 493 pair on the REF side:
  `69aa4241…` both). Watch finals updated to the post-35th hashes.
- [x] **R73-A5** — The standing checks pre-pass: TW-v4 scan clean (15
  documented `!important`, oklch comments-only) · DB pristine (the
  probe user swept, users = the demo account only).
- [ ] **R73-B1** — **RED**: the `tests/e2e/session73-security-isolation.spec.ts`
  pin — the three headers (`Cross-Origin-Opener-Policy: same-origin`,
  `Cross-Origin-Resource-Policy: same-origin`,
  `Cross-Origin-Embedder-Policy: require-corp`) asserted on a page route
  (/login) AND an API route (/api/health) against the served standalone —
  written first, **3 failing assertions expected on the unpatched build**
  (the r69 pattern: headers are absent).
- [ ] **R73-B2** — **GREEN**: next.config.ts `headers()` — add the trio to
  the existing r69 catch-all block (the same `/:path*` source; the
  comment block documents the REF-none measurement + the zero-external-
  resources justification + the COEP/CORP pairing).
- [ ] **R73-B3** — Verify: rebuild + the spec green + the r69 spec family
  still green (presence-only assertions — no conflict by construction) +
  `curl -sI` parity-verified on the standalone (page + API + a static
  chunk + sw.js all carry the trio).
- [ ] **R73-C1** — **RED**: the `tests/e2e/session73-pwa-linkage.spec.ts`
  pin — the manifest link + the apple-touch-icon asserted on an AUTHED
  page (/dashboard, storageState'd) AND on /login (the standing contract),
  + the manifest's installability fields (name, 192+512 icons,
  start_url, display:standalone) via a direct manifest fetch — **failing
  on the unpatched build** (the authed shell has no manifest link).
- [ ] **R73-C2** — **GREEN**: the root layout's `generateMetadata` — add
  `manifest: "/manifest.json"` + `icons: { icon: "/icon-192.png", apple:
  "/apple-touch-icon.png" }` (Next's per-field inheritance carries them
  to every route; login's own identical values stay). Non-visual head
  elements — the rendered surface unchanged.
- [ ] **R73-C3** — Verify: rebuild + the spec green + the unit manifest
  pin family (pwa-surface.test.ts) still green + the served authed
  dashboard re-read in the live browser: `manifest:true`.
- [ ] **R73-D1** — The screenshot set (scripts/r73-screenshots.mjs,
  numbers 510-527): the LOGIN pair @1440x900 (the post-35th surface), the
  LIGHT standing route pairs (dashboard, payroll, employees, attendance,
  training, recruitment, settings — REF-LOC), the LIGHT mobile drawer
  pair @390x844 (the standing byte-stability check vs the r72 509 pair —
  the NINE-round chain), + the inline mobile-menu functional cycle
  (toggle → the drawer with the nav links → the Training LMS link
  CLICKED:/training → auto-close `open:false`).
- [ ] **R73-D2** — The byte-stability proof: the new drawer pair
  BYTE-MATCHES the r72 509 pair on both sides (the fix families are
  head/header-layer — zero rendered bytes).
- [ ] **R73-E1** — The FULL E2E suite as the final proof (sequential, the
  r72 load lesson): **387 + the r73 pins, zero flakes expected**.
- [ ] **R73-E2** — The full gate ladder: lint 0/0 · typecheck clean ·
  unit 937/937 (+ the r73 additions if any) · build OK.
- [ ] **R73-F1** — The docs layer: AGENTS.md (the session-73 layer + the
  Commands counts), CLAUDE.md (the pyramid + the test table), README.md
  (the counts + the spec tail), eon-hr_SKILL.md (the version + §83 + the
  State line), this plan's completion record, docs/session_160.md (the
  narrative) + docs/session_161.md (the raw log), worklog.md (the
  round-72 entry).
- [ ] **R73-F2** — `.env.example` re-verified (only DATABASE_URL +
  AUTH_SECRET read — the process.env sweep re-run on the patched source).
- [ ] **R73-F3** — The commit (main only) + the SSH-wrapper push
  (docs/ssh_git_wrapper_v3.py, the how-to runbook followed verbatim).

## The standing non-goals (recorded, not changed this round)

- Turnstile stays unenforced for our session/IP (the standing REF
  login-side watch item — login-side only, watch-only).
- The with-data superset surfaces stay REF-unmeasurable at the demo's
  zero state (the r72 record).
- No `upgrade-insecure-requests` (HSTS covers TLS; the standalone/E2E
  transport is plain HTTP — the r68/r70 record).
- `style-src-attr` keeps `'unsafe-inline'` (the Radix/vaul/recharts
  dynamic-attribute reality — the r71 record).
- The TT default policy stays a pass-through, not a sanitizer (the
  r72 HONEST SCOPE record).
- The SW never caches page HTML/API (the leak-free design — the r72
  record; offline data sync stays out of scope).
- The two `bun audit` advisories stay accepted dev-chain items until
  upstream fixes exist (braces 3.0.4+; Prisma stable 8 carrying
  deepmerge-ts 8) — the runtime graph is unaffected.
- The offline page keeps its minimal CSP-clean styling (the
  offline-page-styling-parity candidate deliberately deferred: the
  current page matches the app's neutral palette + typography family;
  no REF counterpart exists to parity against).

## Completion record (session-73, executed 2026-10-21/22)

- [x] **R73-A1** — DONE. Workspace cloned; `.env` from `.env.example` with
  `DATABASE_URL="file:../db/custom.db"` (the db-path contract holds:
  `<repo>/db/custom.db`, `db/` at the repo root, gitignored); prisma
  generate + db push + seed clean (Annual 21/21, Sick 30/30); AUTH_SECRET
  generated (openssl rand -hex 32). Health `{"status":"ok","db":"up"}`,
  /login 200, / 307-auth-redirect — verified live.
- [x] **R73-A2** — DONE. Unmodified-HEAD baseline: lint 0/0 · tsc clean ·
  unit 937/937 · build OK (one build re-run under `env -u DATABASE_URL` —
  the standing exported-env trap, infrastructure not source).
- [x] **R73-A3** — DONE. `scripts/r73-deploy-watch.mjs` (the r72
  instrument re-armed at the post-34th finals) + the r73 login probe
  (`scripts/r73-login-probe.mjs`): **THE 35TH LOGIN DEPLOY DETECTED** —
  login JS `DOgRuj38`→`BANnI-PC` AND login CSS `BpSyi-cD`→`COgwiEvt`
  (the first CSS movement since r70); the app side QUIET
  `C-IrDy5f`/`BGNH4KkS`; the fresh re-auth clean; the login DOM census
  unchanged (7-button set, one form, zero Turnstile widgets).
- [x] **R73-A4** — DONE. The full ladder: the fresh login pair
  BYTE-IDENTICAL to the r72 493 REF baseline (`69aa4241…`) + standing
  **5/5** + sweep **12/12** + verify-r49 **13/13** + verify-r45
  **13/13** → **THE 35TH DEPLOY IS NON-VISUAL**. The watch re-armed at
  the post-35th finals reads BOTH SIDES QUIET (`scripts/r73-deploy-watch.mjs`
  carries the new finals: login JS `BANnI-PC` + CSS `COgwiEvt`).
- [x] **R73-A5** — DONE. TW-v4 scan clean (15 documented `!important`;
  oklch in comments only) · DB pristine (the probe user swept; users =
  the demo account only, re-verified twice).
- [x] **R73-B1** — DONE (RED). `tests/e2e/session73-security-isolation.spec.ts`
  — R73-Ba/Bb/Bc all failing on the unpatched build (the trio absent).
- [x] **R73-B2** — DONE (GREEN). `next.config.ts` — the trio added to
  the r69 catch-all (COOP `same-origin` · CORP `same-origin` · COEP
  `require-corp`), the comment block documenting the REF-none
  measurement + the zero-external-resources justification.
- [x] **R73-B3** — DONE. Curl parity verified on the standalone: the
  trio on `/login`, `/api/health`, a `/_next/static` chunk, and
  `public/sw.js`; the r69/r70/r71/r72 spec families 20/20 on the
  patched build (presence-only assertions — no conflict, by
  construction).
- [x] **R73-C1** — DONE (RED). `tests/e2e/session73-pwa-linkage.spec.ts`
  — R73-Ca failing on the unpatched build (the authed shell has no
  manifest link); Cb/Cc green (the standing login + manifest-field
  contracts); Cd green after the r72-proven ready+reload pattern
  replaced the racing direct read (the first draft's failure was the
  timing race, not the contract).
- [x] **R73-C2** — DONE (GREEN). `src/app/layout.tsx` — `manifest:
  "/manifest.json"` + `icons { icon, apple }` hoisted to the root
  `generateMetadata`; the served authed dashboard re-reads
  `manifest:true` in the live browser.
- [x] **R73-C3** — DONE. Rebuild + the spec 8/8 green + the unit
  manifest pin family (pwa-surface.test.ts) still green + unit suite
  937/937.
- [x] **R73-D1** — DONE. `scripts/r73-screenshots.mjs` — the 510-526
  set (17 captures): the LOGIN pair (the post-35th surface), the LIGHT
  standing route pairs (dashboard/payroll/employees/attendance/
  training/recruitment/settings REF-LOC), the LIGHT mobile drawer pair
  @390x844 + the inline mobile-menu functional cycle (toggle → the
  drawer Dashboard/Training LMS/Assets/Staff Requests → Training LMS
  CLICKED:/training → auto-close `open:false`).
- [x] **R73-D2** — DONE. The byte-stability proofs: the 526 drawer pair
  BYTE-MATCHES the r72 509 pair on BOTH sides (loc `e3df921…`, ref
  `bfaa0da…` — the NINE-round chain 526≡509≡492≡474≡456≡438≡418≡402≡366)
  AND the 510 login pair BYTE-MATCHES the r72 493 pair on BOTH sides
  (`bd718ed…` / `69aa4241…`) — both fix families changed zero rendered
  bytes and the 35th deploy left both surfaces byte-identical.
- [x] **R73-E1** — DONE. The FULL E2E suite, sequential: **394/394**
  (+7 pins, zero flakes, 6.5m) — every pre-existing spec green WITH the
  isolation trio served on every response AND the manifest link on
  every page.
- [x] **R73-E2** — DONE. The gate ladder: lint 0/0 · typecheck clean ·
  unit 937/937 · build OK.
- [x] **R73-F1** — DONE. The docs layer: AGENTS.md (the session-73
  layer + the Commands counts), CLAUDE.md (the 1331-spec pyramid + the
  test table), README.md (the counts + the session-73 spec tail),
  eon-hr_SKILL.md (3.56.0 + §83 + the State line), this completion
  record, docs/session_160.md (the narrative), worklog.md (the round-72
  entry).
- [x] **R73-F2** — DONE. `.env.example` re-verified: the patched source
  reads only `DATABASE_URL` + `AUTH_SECRET` (NEXT_RUNTIME/NODE_ENV are
  framework internals) — the contract unchanged.
- [x] **R73-F3** — DONE. The commit (main only) + the SSH-wrapper push
  (docs/ssh_git_wrapper_v3.py + the paramiko shim, the how-to runbook
  followed verbatim; the remote ref verified; the operator key
  shredded).

**The round's carry-forward lessons:** (1) the playwright
chromium-cache mismatch classifies as INFRASTRUCTURE — the environment
held 1200-series browsers while playwright 1.63 needs 1248;
`bunx playwright install chromium` restores it, never touch source for
it; (2) an SW-control assertion races the registration lifecycle unless
it follows the ready+reload pattern; (3) verify documented-but-unpinned
census claims with a live read — the r72 "every-page manifest linkage"
was falsified exactly this way, and the fix turned the claim into an
executable contract.
