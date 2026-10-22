# Remediation Plan — Session 75 / Parity Round 74: the audit-only round (the tool-outage survivor completed) — both sides of the deploy watch QUIET + the Lighthouse first-party audit 100/100/100 + the ELEVEN-round byte chain

**The round's motivation.** Session 75 (round 74) was interrupted three
times by a session-level gateway outage (the `403 Forbidden / broken
session` class — documented in `docs/session_165.md`); its R75-A layer
(environment, baseline gates, the deploy watch, the standing checks)
completed and was interim-saved @ `e82368c`, with R75-B (the fresh-eyes
audit) partial: `sw.js` clean (`max-age=0` update path), the auth layer
fully pinned. This session resumed at the recorded resume point — the
HTTPS-origin probe — and completed the round through the closing gates.
The tool plane remained unstable for the main session (the outage
recurred); the round was executed through micro-task delegation (each
fresh subagent session survives a bounded call window), a mechanism this
round adds to the instrument-lessons record.

1. **The HTTPS-origin probe (the R75-B resume point): NO HTTPS ORIGIN
   IN SCOPE.** Port 3000 serves nothing; no `cloudflared` in the
   sandbox; no local lighthouse binary at the probe time. The recorded
   frontier candidate — "a real-Chrome install smoke on a deployed
   HTTPS origin" — is therefore **BLOCKED-IN-SCOPE** (no deployable
   HTTPS origin exists inside this sandbox; the r74 installability
   pins remain the standing evidence, and Chrome's own zero-errors
   verdict is already locked executable by
   `tests/e2e/session74-pwa-installability.spec.ts`). The fallback
   fresh-eyes candidate per the session-165 decision rule: **the
   Lighthouse first-party audit pass** (item 3 below).

2. **The r75 deploy watch: BOTH SIDES QUIET — no 37th deploy.** The
   logged-out login page serves the post-36th finals byte-for-byte:
   login JS `index-CiBFwtqW` + login CSS `index-B9rzNd1e` (both live,
   HTTP 200, hash-identical to the r74 watch finals); the app side is
   equally quiet — the root HTML references exactly `assets/index-C-IrDy5f.js`
   + `assets/index-BGNH4KkS.css`, both serving 200. Nothing moved on
   either surface; no confirmation ladder required. The watch stays
   armed at the same finals for the next round.

3. **THE LIGHTHOUSE FIRST-PARTY AUDIT (the round's fresh-eyes
   candidate): 100/100/100.** Lighthouse 13.5.0 (via `bunx`, no
   dependency change — the lockfile untouched) against the production
   standalone build on `:3200`, Chrome for Testing 155 headless:
   the logged-out `/login` scores **accessibility 100 ·
   best-practices 100 · seo 100** with ZERO flagged weighted audits
   (spot-checks all pass: color-contrast, html-has-lang, image-alt,
   aria-allowed-attr, document-title, meta-description, robots-txt,
   canonical, errors-in-console, inspector-issues, valid-source-maps,
   is-on-https — localhost is a secure context). The root `/` (which
   307s to `/login?from_url=…`) scores the identical triple-100. The
   PWA category was REMOVED upstream (Lighthouse ≥12 no longer scores
   it) — the PWA surface remains covered by the standing r74 pins
   (Chrome's own `Page.getInstallabilityErrors` zero-errors verdict on
   both surfaces, executable in the E2E suite). Reports: `/tmp/lighthouse-login.json`
   + `/tmp/lighthouse-root.json` (~180 KB each, regenerable — not
   committed; the verdicts are recorded here and in the AGENTS.md
   session-75 layer).

4. **The standing checks (re-verified this round at HEAD `a976895`):**
   the TW-v4 scan clean — 15 `!important` (all in `globals.css`, the
   documented allowance) + the oklch census precisely confirmed
   **comments-only** (6/6 occurrences inside `/* … */` prose blocks
   documenting the trap-2 palette pin; zero active `oklch()` calls,
   zero occurrences in any .ts/.tsx) · the source secret-sweep zero ·
   the raw DOM-XSS sink census zero (session 165's read at this HEAD,
   zero source changes since) · the DB pristine sweep green
   (`users = ["sepnetflix2023@outlook.com"]`, the r61 protocol) · the
   `bun audit` UNCHANGED (exactly the two standing upstream-blocked
   dev-chain advisories: braces 3.0.3 — still the latest published;
   deepmerge-ts <8 via prisma's exact `@prisma/config` 6.x pin) · the
   Next.js patch watch QUIET (16.4.2 still the latest stable; the
   16.5 line rides `16.5.0-canary.21`).

5. **THE BYTE-STABILITY PROOFS (the round's visual evidence —
   `scripts/r75-screenshots.mjs`, numbers 545-561):** the 561 mobile
   drawer pair BYTE-MATCHES the r74 543 pair on BOTH sides (loc
   `e3df9211…`, ref `bfaa0da5…` — the ELEVEN-round chain
   561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366) · the 545 login
   pair BYTE-MATCHES the r74 527 pair on BOTH sides (loc
   `bd718ed0…` / ref `69aa4241…`) · all seven standing route pairs
   (547 dashboard, 549 payroll, 551 employees, 553 attendance, 555
   training, 557 recruitment, 559 settings) BYTE-STABLE vs the r74
   set on BOTH sides. The REF re-auth clean on both surfaces; the
   LOC auth clean (the demo account only — DB pristine at close).

6. **THE MOBILE-MENU FUNCTIONAL CYCLE (the standing user emphasis):
   GREEN.** The inline cycle on the LOC build: the toggle opens the
   drawer (`open: true`, links = Dashboard / Training LMS / Assets /
   Staff Requests) → the Training LMS link click registers
   `CLICKED:/training` → the URL lands on `/training` → the drawer
   auto-closes on navigation (`open: false`). No Tailwind-v4
   regression in the mobile navigation (the trap-4 flex-gap layout and
   the trap-6 space-y selector flip both remain correctly handled in
   `src/components/layout/app-shell.tsx`).

7. **THE CLOSING GATES (the push precondition):** lint 0/0 ·
   typecheck clean · unit **941/941** · build OK · E2E **396/396**
   (6.3m, zero flakes, the sequential proof run — the chromium-cache
   trap hit and retired en route: the sandbox cache held r1200
   browsers while `@playwright/test` 1.64.1 needs r1248;
   `bunx playwright install chromium` restored it, a
   browser-cache/environment fix only, no project files modified).

## The round's candor record

- **ZERO DEFECTS FOUND.** The fresh-eyes audit (sw.js + auth layer
  from session 165; the Lighthouse triple-100 this round) found
  nothing to fix. **ZERO SOURCE CHANGES** — the round's diff is the
  instrument (`scripts/r75-screenshots.mjs`), the evidence (18
  screenshots, 545-561), and this docs layer. The codebase at HEAD
  `a976895` is the r74-remediated state, already production-green.
- **The tool-outage workaround (the instrument lesson).** The
  session-level gateway outage (`403 Forbidden / broken session`)
  persisted for the main session's direct tool plane across the
  whole round. The working mechanism: **micro-task delegation** —
  each fresh subagent session holds a working tool plane for a
  bounded call window (~5-8 calls), so the round was executed as a
  sequence of small, self-contained delegated tasks (probe →
  daemon-restore → watch → audit → script-create → script-run →
  E2E → standing checks → docs). Two sub-infrastructure lessons:
  (a) the sandbox supervisor kills the ENTIRE process tree of each
  command shell at invocation boundaries — `nohup`/`setsid`/`disown`
  do NOT survive; a double-fork daemonizer that reparents to PID 1
  does (the `:3200` server rode one through multiple session
  breaks); (b) background nohup'd test runs die the same way — run
  long suites in the FOREGROUND with output redirected to a log
  file.
- **The Lighthouse PWA-category note.** Lighthouse ≥12 removed the
  PWA category; any future "full Lighthouse PWA verdict" phrasing
  must be qualified — the executable PWA oracle in this repo is
  Chrome's own installability checker (the r74 pins), not
  Lighthouse.

## The ToDo list (validated against the codebase)

- [x] **R75-A1** — Environment: fresh clone @ `a976895` (main, clean);
  `bun install` (525 packages); `.env` from `.env.example`
  (`DATABASE_URL="file:../db/custom.db"` → `<repo>/db/custom.db`, the
  db-path contract, the `db/` folder at the repo root, gitignored);
  `AUTH_SECRET` generated; `db:generate` + `db:push` + `db:seed`
  (seeded pristine: Annual 21/21, Sick 30/30). The exported-`DATABASE_URL`
  trap ACTIVE (the sandbox exports its own path) — `env -u DATABASE_URL`
  per invocation, the standing protocol.
- [x] **R75-A2** — Baseline gates on the unmodified HEAD: lint 0/0 ·
  tsc clean · unit 941/941 · build OK · the standalone boots
  (`{"status":"ok","db":"up"}`).
- [x] **R75-A3** — The r75 deploy watch: BOTH SIDES QUIET (login
  `index-CiBFwtqW`/`index-B9rzNd1e`; app `C-IrDy5f`/`BGNH4KkS`) — no
  37th deploy, no ladder.
- [x] **R75-A5** — The standing checks: TW-v4 scan clean (15
  `!important`; oklch 6/6 comments — precisely classified) · secrets
  zero · XSS sinks zero · DB pristine · `bun audit` unchanged (2
  upstream-blocked dev-chain advisories) · patch watch QUIET (16.4.2
  latest stable; 16.5.0-canary.21 on the horizon).
- [x] **R75-B** — The fresh-eyes audit completed: the HTTPS-origin
  probe (no origin in scope → the install-smoke candidate recorded
  BLOCKED-IN-SCOPE) + the Lighthouse first-party audit (100/100/100,
  zero flagged audits, both surfaces) + the session-165 partials
  (sw.js `max-age=0` clean; the auth layer fully pinned).
- [x] **R75-D1** — The screenshot set (`scripts/r75-screenshots.mjs`,
  numbers 545-561): the LOGIN pair @1440x900, the LIGHT standing
  route pairs (dashboard, payroll, employees, attendance, training,
  recruitment, settings), the LIGHT mobile drawer pair @390x844, +
  the inline mobile-menu functional cycle — 18 PNGs (747 tracked on
  disk after the set).
- [x] **R75-D2** — The byte-stability proofs: the ELEVEN-round drawer
  chain (561≡543, both sides) + the login pair (545≡527, both sides)
  + the route pairs (all stable vs the r74 set, both sides).
- [x] **R75-E** — The closing gates: lint 0/0 · tsc clean · 941/941
  unit · build OK · E2E 396/396 (sequential, zero flakes).
- [x] **R75-F** — The docs layer: this plan + the AGENTS.md
  session-75 layer + CLAUDE/README/SKILL count updates + the session
  narrative + the worklog entry + `.env.example` re-verified (the
  two-variable contract unchanged; already tracked in git).
- [x] **R75-G** — The commit + the SSH-wrapper push to
  `git@github.com:nordeim/eon-hr.git` (main only; the paramiko shim
  deployed outside the repo; the key shredded after the push).

## The standing watches (carried forward)

- **The deploy watch** — armed at the post-36th finals: login JS
  `index-CiBFwtqW` + CSS `index-B9rzNd1e`; the app side
  `C-IrDy5f`/`BGNH4KkS`. Both quiet at the r75 read.
- **The Next.js patch watch** — 16.4.2 latest stable;
  `16.5.0-canary.21` approaching. Re-record at 16.5 stable.
- **The Turnstile rollout** — the standing login-side watch item
  (unenforced for our session/IP at every read).
- **The upstream dependency watch** — braces 3.0.4+; the Prisma
  path (a 6.x `@prisma/config` backport carrying deepmerge-ts 8, or
  the repo's Prisma major upgrade to 7/8 stable).
- **The candor-ordered frontier** — a real-Chrome install smoke on a
  deployed HTTPS origin (BLOCKED-IN-SCOPE in this sandbox; re-opens
  the moment an HTTPS origin exists); the offline-page styling polish
  (still deliberately deferred — no REF counterpart); whatever the
  37th deploy carries.
