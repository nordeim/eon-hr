# Remediation Plan — Session 72 / Parity Round 71: the Trusted-Types rung (the CSP strictness ladder's next step: `trusted-types default` + `require-trusted-types-for 'script'` + the nonced default-policy bootstrap) + the PWA/offline story (the service worker + the offline fallback — REF measured with ZERO service workers) + the 34th-deploy confirmation ladder

**The round's motivation.** The round-70 completion record left the backlog
EMPTY of open visual/functional items — the matrix complete (r66), the
transport layer parity-hardened AND superseded (r68 headers + r70/r71 CSP +
the elem/attr split), the SEO surface complete (r70), the TLS deployment
story shipped + pinned (r71). The standing watches were: the deploy watch
(re-armed at the post-33rd finals: login JS `BCr9BMlh` + CSS `BpSyi-cD` +
the app side `C-IrDy5f`/`BGNH4KkS`), the Next.js patch watch (16.4.3+), the
Turnstile platform rollout (the login-side watch item), and the
candor-ordered superset candidates from session_155: "the remaining CSP
strictness rungs (a Trusted-Types story), a PWA/offline story (the manifest
already self-hosted), and whatever the next deploy carries."

1. **The r72 deploy watch (scripts/r72-deploy-watch.mjs, the post-33rd
   finals armed): THE 34TH LOGIN DEPLOY DETECTED** — login JS
   `BCr9BMlh`→`DOgRuj38` (login CSS QUIET `BpSyi-cD`; the
   frontend-config preload holds; the app side QUIET
   `C-IrDy5f`/`BGNH4KkS`). The fresh re-auth succeeded clean — Turnstile
   stays unenforced for our session/IP (the standing watch item holds).
   The full confirmation ladder (below) audited the 34th NON-VISUAL. The
   watch finals are the post-34th hashes.
2. **The Next.js patch watch: QUIET** — `npm view next` reads 16.4.2 as
   the latest stable (unchanged). No action; the watch stays armed at
   16.4.3+.
3. **THE R71 DELTA AUDIT (the recent-changes review, the r71 lesson
   applied — read the served bytes)**: the fresh build's /login serves
   ZERO un-nonced script/style members (all 8 script tags + the moved
   `<style>` + all 3 `application/ld+json` blocks carry the nonce) —
   the r71 CSP completion verified intact on the current HEAD. The
   dangling-path probe found the standing behavior unchanged: dotted
   MISSING paths (e.g. `/sw.js` today) fall through the proxy's
   dot-exclusion matcher to the (app) not-found chain → the layout
   guard's plain-`/login` 307 — which means a REAL `public/sw.js` will
   serve 200 un-authed exactly like `/manifest.json` does (static file
   handling precedes the router; NO proxy matcher change needed).
4. **THE PWA-LAYER CENSUS (the new-layer sweep, both sides measured)**:
   REF's login surface links `/manifest.json` (served direct: name "Eon
   HR", a STALE platform-template description mentioning "OnboardFlow",
   icons = EXTERNAL supabase URLs, absolute start_url); REF's authed
   dashboard shell links NO manifest; and REF registers ZERO service
   workers on any surface (the `getRegistrations()` probe read 0, no
   controller). The clone: the manifest already self-hosts everything
   (relative icons at `/icon-192.png` + `/icon-512.png`, the honest
   description, `start_url:"/"`, display:standalone — the standing
   zero-external-resources policy) and links it on EVERY page — the
   clone ALREADY SUPERSETS REF on the manifest surface. The missing
   piece for a true PWA superset: **the service worker** (offline
   support). The clone has none — no `public/sw.js`, no registration
   anywhere (`navigator.serviceWorker` appears nowhere in src/).
5. **THE TRUSTED-TYPES PRE-SCOPE (the sink census)**: the whole source
   reads ZERO raw DOM-XSS sinks (`innerHTML`, `outerHTML`,
   `insertAdjacentHTML`, `document.write` — all zero hits) and exactly
   FIVE `dangerouslySetInnerHTML` members (the root layout's THEME_BOOT
   + Website JSON-LD + Organization JSON-LD; the login layout's
   BreadcrumbList JSON-LD + the moved focus-cascade `<style>` mirror) —
   every one server-rendered, constant-authored (JSON.stringify of
   constant objects or template-literal CSS), and nonce'd. No dynamic or
   user-derived content reaches any sink; recharts/Radix/vaul render
   through React's createElement (no innerHTML). The TT rung is
   therefore tractable: enforce + a pass-through DEFAULT policy (the
   CSP3 mechanism — a `default` policy auto-wraps plain strings at every
   TT sink) + the policy-NAME allowlist (`trusted-types default` — no
   other policy name can be created, so a future attacker-with-JS cannot
   mint a new policy) + the honest note that a pass-through default
   policy EARNS the enforcement machinery and makes every future sink
   use loud in the console, but does not sanitize by itself.
   Placement: the nonced bootstrap runs as the FIRST authored script in
   `<head>` — before the flight-data inline scripts parse (hydration
   consumes those), so the policy exists before any client-side mount
   could write a sink. Chromium-only enforcement (Firefox/Safari ignore
   the directives — graceful).

## The ToDo list (validated against the codebase)

1. **[DONE]** Baseline gates on the surviving workspace (fast-forward
   `9e7b0f1..f971509`, only `docs/session_156.md`): lint 0/0 · tsc ✓ ·
   **924/924 unit** · build ✓ (the standalone rebuilt + the served-bytes
   audit green). **E2E 379/380 + 1 infrastructure flake**: the full-suite
   launch ran CONCURRENTLY with the 34th-deploy confirmation ladder
   (the ladder's :3200/:3201 standalones + the re-auth probes) and one
   organogram spec crashed at `browserContext.newPage: Target crashed`;
   the spec reads 3/3 GREEN in isolation post-cleanup (6.3s) —
   classified as machine-load infrastructure, not source debt (the
   varying failure set across runs confirms it: `Target crashed` →
   context-setup timeout → clean). The final sequential suite runs at
   GREEN time (the round's proof run). The exported-DATABASE_URL trap
   ACTIVE again (unset per db-touching invocation; the :3200 audit boot
   hit it once — `env -u DATABASE_URL` is the fix, exactly as the r52
   orchestrator does).
2. **[DONE]** The r72 deploy watch: **THE 34TH LOGIN DEPLOY** — login JS
   `BCr9BMlh`→`DOgRuj38`, CSS QUIET, app side QUIET, the frontend-config
   preload holding; the fresh re-auth clean (Turnstile unenforced — the
   standing watch item). The patch watch QUIET (16.4.2 the latest
   stable).
3. **[DONE]** The 34th-deploy confirmation ladder (the fresh re-auth +
   the four instruments): standing **5/5** + sweep **12/12** (the r52
   orchestrator, seeded :3200) + verify-r49 **13/13** (the zero-tenant
   :3201 boot — the FIRST run read 0/13 on a zero.db re-create race, the
   re-run read exactly the documented 13/13: infrastructure, classified
   before touching source) + verify-r45 **13/13** (the login-view
   family via r52-login-reaudit) → **THE 34TH LOGIN DEPLOY IS
   NON-VISUAL**. The watch finals are the post-34th hashes.
4. **[DONE]** The R71 delta audit + the PWA/TT scoping censi (findings 3-5
   above; the served-bytes sweep, the REF manifest/SW probes, the sink
   census, the proxy-matcher path-behavior probe).
5. **R72-A: the Trusted-Types rung** (TDD):
   - RED: `tests/e2e/session72-trusted-types.spec.ts` — (a) the served
     CSP on /login + /dashboard carries `trusted-types default` +
     `require-trusted-types-for 'script'` + `worker-src 'self'`;
     (b) the served HTML carries the nonced TT default-policy bootstrap
     (the `createPolicy('default'` script with the nonce attribute);
     (c) the LIVE enforcement probe: creating a ROGUE policy
     (`trustedTypes.createPolicy('rogue-…', …)`) THROWS under
     enforcement (pre-change: any name is allowed → no throw → the
     assertion fails RED). FAILS 3/3 on the current build.
   - GREEN: `src/lib/csp.ts` (production adds the `trusted-types
     default` + `require-trusted-types-for 'script'` directives AFTER
     the existing members — dev stays WITHOUT them, the mirror of the
     dev-only unsafe-eval allowance: Turbopack dev injects scripts/evals
     that would violate; + the explicit `worker-src 'self'` in BOTH
     shapes — the CSP3 fallback chain would inherit it from script-src,
     but the explicit member documents the R72-B contract) +
     `src/app/layout.tsx` (the TT_BOOT nonced inline script FIRST in
     `<head>` — the createPolicy default pass-through, guarded to
     feature-detect `window.trustedTypes`, production-only render) +
     the unit pins (`tests/unit/csp.test.ts`: the prod TT directives
     present + the dev shape WITHOUT them + worker-src in both).
   - The functional proof: the TT-violation console probe (the
     drawer + a dialog + a chart under enforcement) + the FULL suite
     green.
6. **R72-B: the PWA/offline story** (TDD):
   - RED: `tests/e2e/session72-pwa-offline.spec.ts` — (a) GET `/sw.js`
     un-authed → 200 + `application/javascript` (or
     `text/javascript`) + the r69 5-header set (today: the 307
     not-found redirect — RED); (b) the served /login HTML carries the
     nonced SW-registration script; (c) the LIVE registration:
     `navigator.serviceWorker.ready` resolves + the registration scope
     ends `/` + after one reload `navigator.serviceWorker.controller`
     is truthy; (d) THE OFFLINE FALLBACK: `context.setOffline(true)` →
     `page.goto` an uncached route → the offline page's marker renders
     (today: no SW → navigation fails — RED).
   - GREEN: `public/sw.js` (CACHE `eon-hr-shell-r72`: the static
     asset list — `/_next/static/` + the manifest + the icons + the
     logo + og-image + `/offline.html` — cache-first; NAVIGATIONS:
     network-only with the offline fallback to the cached
     `/offline.html` on fetch failure — page HTML is NEVER cached or
     served from cache, the authed-HTML-leak-free design; `/api/` and
     everything else: pass-through; skipWaiting + clients.claim, the
     activate cleans stale caches) + `public/offline.html` (a minimal
     static page, CSP-clean by construction: zero `<script>`, zero
     `<style>` ELEMENTS — inline style ATTRIBUTES only — so it stays
     valid even if the CSP ever extends to public surfaces) +
     `src/app/layout.tsx` (the nonced SW_REGISTRATION inline script,
     production-only — `process.env.NODE_ENV === "production"`: in dev
     the SW would cache-serve STALE Turbopack chunks and break HMR;
     the E2E suite + the standalones run the production build, dev
     stays SW-free) + the unit pins
     (`tests/unit/pwa-surface.test.ts`: the sw shape — the CACHE name,
     the navigate handler, the offline.html fallback, the
     never-cache-HTML marker; the offline.html marker text; the
     manifest's SELF-HOSTED icons contract — the icons resolve
     relative, no external URLs, the REF superset).
   - The functional proof: the live registration + offline specs above
     + the FULL suite green WITH the SW active (fresh contexts
     re-register per test — no cross-test pollution; the fetch handler
     is behavior-neutral online: same bytes from cache or network).
7. **The standing checks**: the mobile-menu full functional cycle
   (toggle → the drawer with the nav links → the Training LMS link
   navigates → auto-close `open:false`) + the byte-stability pair (the
   new LIGHT mobile drawer pair vs the r71 492 pair — expecting the
   EIGHT-round chain new≡492≡474≡456≡438≡418≡402≡366: both r72 fix
   families live at the script/policy layer — the new `<head>` scripts
   are non-visual, zero rendered bytes) + the TW-v4 standing scan
   (`!important` 15, oklch all comments — both verified this round) +
   DB pristine (users = [sepnetflix2023@outlook.com] only — the probe
   user swept per the r61 protocol mid-round; the sweep re-runs at
   close if the ladder re-fires it).
8. **Screenshots**: the 493-510 pair set via `scripts/r72-screenshots.mjs`
   (templated from r71 with the corrected drawer mechanism — the
   accessible-name snapshot-ref mouse click; the standing LOC route
   pairs + the mobile drawer pair + the inline mobile-menu cycle;
   detached server spawn) → saved to `docs/screenshots/`;
   pair-uniqueness + byte-stability verified (676 → 694 tracked).
9. **Docs**: AGENTS session-72 layer + the Commands counts, CLAUDE (the
   pyramid + the test table + both session-72 test-list entries),
   README (the counts + the session-72 spec tail), eon-hr_SKILL.md
   3.55.0 + §82 + the State line + the carry-forward lessons, this
   plan's completion record, `docs/session_157.md` (the narrative) +
   `docs/session_158.md` (the raw log), the worklog; `.env.example`
   re-verified (only DATABASE_URL + AUTH_SECRET are read — the SW and
   the TT bootstrap read NOTHING from the environment; the contract
   unchanged).
10. **Commit ×3 + SSH push to main** (the `fix:` commit with the round
    message, the `docs+verify:` commit, the `update session log` journal
    commit) via `docs/ssh_git_wrapper_v3.py` per the wrapper skill; NO
    new branches.

## The standing non-goals (recorded, not changed this round)

- The Turnstile platform rollout: the challenge stays unenforced for our
  session/IP (the re-auth succeeded clean); no clone-side action while
  unenforced.
- The with-data superset surfaces stay REF-unmeasurable at the demo's
  zero state (standing allowance note).
- REF's soft-404 (HTTP 200 SPA shell on unknown routes): the clone's
  guard-redirect + not-found chain is the production-grade superset —
  kept, documented (the dotted-path 307→/login is the standing
  behavior, unchanged this round).
- No `upgrade-insecure-requests` in the CSP (the r70 note; HSTS covers
  TLS — documented in DEPLOYMENT.md §8).
- `style-src-attr` keeps `'unsafe-inline'` (the r71 note — the
  attribute side is dynamic by nature).
- **The TT default policy is a pass-through, not a sanitizer** — the
  rung's honest value: the enforcement machinery (policy-name control +
  loud console violations for any future sink) + the DOMPurify-ready
  foundation; the five current sinks are constant-authored + nonced,
  nothing to sanitize. Recorded, not oversold.
- **The SW never caches page HTML and never serves `/api/`** — the
  authed-HTML/stale-data leak-free design; the offline story is the
  static shell + the fallback page, NOT offline data sync.

---

## Completion record (session-72, executed 2026-10-21)

- **[1 — DONE]** Baseline gates: lint 0/0 · tsc ✓ · 924/924 unit ·
  build ✓ · E2E 379/380 + 1 target-crash under CONCURRENT load (the
  organogram spec 3/3 green in isolation post-cleanup — infrastructure,
  classified before touching source; the final sequential suite runs
  below). The DATABASE_URL trap retired per invocation all round.
- **[2 — DONE]** The r72 deploy watch: **THE 34TH LOGIN DEPLOY
  DETECTED** — login JS `BCr9BMlh`→`DOgRuj38` (CSS QUIET `BpSyi-cD`,
  the preload holding; the app side QUIET `C-IrDy5f`/`BGNH4KkS`); the
  fresh re-auth clean. The patch watch QUIET (16.4.2).
- **[3 — DONE]** The 34th-deploy confirmation ladder: standing **5/5** +
  sweep **12/12** + verify-r49 **13/13** (after one 0/13 zero.db
  re-create race, re-run green — infra, not source) + verify-r45
  **13/13** → **NON-VISUAL**. The watch finals are the post-34th
  hashes.
- **[4 — DONE]** The R71 delta audit (0 un-nonced members on the served
  /login) + the PWA census (REF: login-only manifest + ZERO SW; the
  clone: every-page manifest, self-hosted, no SW) + the TT sink census
  (0 raw sinks, 5 constant-authored nonced dSHI members).
- **[5 — DONE]** R72-A execution: the RED phase confirmed first (the
  R72-A1..A3 triple failing on the unpatched build: the directives
  absent, no bootstrap script, the rogue-policy creation allowed with
  defaultPolicy null) → `src/lib/csp.ts` (the prod-only TT pair
  appended after the existing members + `worker-src 'self'` in BOTH
  shapes) + `src/app/layout.tsx` (the TT_BOOT nonced bootstrap FIRST
  in <head>, production-only) → GREEN (the R72-A triple + the amended
  R70/R71 families 11/11 on the patched build). The
  CSP+TT-violation console probe: the Add Payroll dialog, the vaul
  mobile drawer, and 3 recharts svgs on /advancedanalytics all render
  with ZERO violations under the hardened policy.
- **[6 — DONE]** R72-B execution: the RED phase confirmed first (the
  R72-B1..B4 quadruple failing: the un-authed /sw.js fetch 307, no
  registration script, `serviceWorker.ready` never resolving, the
  offline navigation failing) → `public/sw.js` + `public/offline.html`
  + the nonced production-only SW_REGISTRATION bootstrap → GREEN
  (8/8 with the auth setup; the R72-B quadruple + the full suite
  below). One assertion-vs-authoring normalization in the unit layer
  (the /sw.js quote style — the semantic contract, not the authoring
  style).
- **[7 — DONE]** The standing checks: the mobile-menu cycle green
  (toggle → the drawer with Dashboard/Training LMS/Assets/Staff
  Requests → the Training LMS link CLICKED:/training → auto-close
  `open:false` — the script-native cycle); the byte-stability pair
  509 BYTE-MATCHES the r71 492 pair on BOTH sides (loc `e3df921…`,
  ref `bfaa0da…`) — **the EIGHT-round chain
  509≡492≡474≡456≡438≡418≡402≡366** (both r72 fix families changed
  zero rendered bytes; the corrected open-drawer REF baseline
  reproduces); all 9 pairs byte-stable vs the r71 set (493≡476
  through 509≡492 — the login pair byte-confirms the 34th deploy
  non-visual); the TW-v4 scan clean (`!important` 15, oklch all
  comments); DB pristine (users = [sepnetflix2023@outlook.com] only,
  re-verified at close).
- **[8 — DONE]** Screenshots: the 493-509 set (18 files → 694
  tracked on disk; all 9 same-number pairs hash-distinct; every pair
  byte-stable vs the r71 set on both sides).
- **[9 — DONE]** Docs: AGENTS session-72 layer + the Commands counts
  (937/387), CLAUDE (the 1324-spec pyramid + the test table 10/53 +
  both session-72 test-list entries), README (the counts + the
  session-72 spec tail), eon-hr_SKILL.md 3.55.0 + §82 + the State
  line + the three carry-forward lessons (port-safe is not load-safe;
  re-run before root-cause; a functional superset needs a leak-free
  design), this completion record, docs/session_157.md (the narrative)
  + docs/session_158.md (the raw log), the worklog. .env.example
  verified (the process.env sweep reads only DATABASE_URL +
  AUTH_SECRET — NEXT_RUNTIME/NODE_ENV are framework internals, not
  config; the TT/SW boots read NOTHING from the environment; the
  contract unchanged).
- **[10 — DONE]** Commit ×3 + the SSH-wrapper push to main; no new
  branches.
- **The gates at push time**: lint 0/0 · tsc ✓ · 937/937 unit (+13) ·
  build ✓ · E2E 387/387 (+7, zero flakes — the SEQUENTIAL proof run;
  the mid-round 379/380+1 read was concurrent-load infrastructure) ·
  byte-stability 509≡492 (the eight-round chain, both sides) · the
  ladder 43/43 NON-VISUAL · 694 tracked screenshots (+18) · DB
  pristine.
- **The round's headline**: THE TRUSTED-TYPES RUNG SHIPPED (the CSP
  strictness ladder's next step — the policy-name allowlist + the
  sink enforcement + the nonced pass-through default policy, with the
  LIVE rogue-policy-THROWS proof) + THE PWA/OFFLINE STORY SHIPPED
  (the leak-free service worker + the CSP-clean offline fallback —
  REF measured with ZERO service workers) + THE 34TH LOGIN DEPLOY
  LADDERED NON-VISUAL (byte-confirmed) + THE EIGHT-ROUND BYTE CHAIN
  HOLDS THROUGH BOTH FIX FAMILIES.
