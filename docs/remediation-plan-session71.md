# Remediation Plan — Session 71 / Parity Round 70: the CSP completion pair (the missed JSON-LD nonce + the style-src elem/attr split) + the TLS-fronted deployment story (the x-forwarded-proto contract pin + the DEPLOYMENT.md rewrite) + the 33rd-deploy confirmation ladder

**The round's motivation.** The round-69 completion record left the backlog
EMPTY of open visual/functional items — the matrix complete (r66), the
transport layer parity-hardened AND superseded (r68 headers + r70 CSP), the
SEO surface complete (r70). The standing watches were: the deploy watch
(re-arm at the post-32nd finals), the Next.js patch watch (16.4.3+), the
Turnstile platform rollout (the login-side watch item), and the
candor-ordered superset candidates from session_151: "a TLS-fronted
deployment story (HSTS only bites behind real TLS), CSP style-src hardening
(a nonce'd style pipeline — touches every Radix primitive for zero REF
delta), and whatever the next deploy carries."

1. **The r71 deploy watch (scripts/r71-deploy-watch.mjs, the post-32nd
   finals armed): THE 33RD LOGIN DEPLOY DETECTED** — login JS
   `CKnh3tRk`→`BCr9BMlh` (login CSS QUIET `BpSyi-cD`; the
   frontend-config preload holds; the app side QUIET
   `C-IrDy5f`/`BGNH4KkS`). The fresh re-auth succeeded clean — Turnstile
   stays unenforced for our session/IP (the standing watch item holds).
   The full confirmation ladder (below) audited the 33rd NON-VISUAL. The
   watch finals are the post-33rd hashes.
2. **The Next.js patch watch: QUIET** — `npm view next` reads 16.4.2 as
   the latest stable. No action; the watch stays armed.
3. **THE R70 DELTA AUDIT (the recent-changes review) FOUND A REAL
   COMPLETENESS GAP IN THE CSP PIPELINE**: the root layout's two JSON-LD
   blocks carry the nonce (r70), but the LOGIN LAYOUT's own
   BreadcrumbList JSON-LD script serves WITHOUT one — curl-verified live
   on the standalone (`<script type="application/ld+json">` bare). CSP
   applies to non-executable script types too (the r70 note), so the
   browser BLOCKS the breadcrumb block under the nonce policy — silently,
   because JSON-LD is not executed: the full E2E suite could not catch
   it. The same audit swept the whole served surface for `<style>`
   elements: the login page's session-45 focus-cascade mirror block is
   the ONLY one (27 app routes + 404 + logout read zero) — the
   style-src-elem hardening is therefore tractable with a SINGLE nonce'd
   authoring change, not "every Radix primitive" (those write style
   ATTRIBUTES, which CSP gates separately under style-src-attr).
4. **THE style-src HARDENING, RESHAPED BY THE AUDIT**: the session-151
   candidate ("a nonce'd style pipeline") was flagged as touching every
   primitive — but the CSP spec splits the style policy in two:
   `style-src-elem` governs `<style>` ELEMENTS (nonce-able) while
   `style-src-attr` governs inline style ATTRIBUTES (Radix popper
   positioning, vaul drawer transforms, recharts svg styles — dynamic
   values, un-nonce-able). The hardening that is ACHIEVABLE and correct:
   `style-src-elem 'self' 'nonce-N'` (elements: the linked CSS + the one
   authored login block, both nonce'd/self) + `style-src-attr
   'unsafe-inline'` (attributes: the documented necessity) — strictly
   harder than the blanket `style-src 'self' 'unsafe-inline'` for
   elements, honest about the attribute reality. Dev adds
   `'unsafe-inline'` to style-src-elem (Turbopack injects `<style>`
   elements in dev; the mirrors of the dev-only script-src 'unsafe-eval'
   + ws: allowances).
5. **THE TLS-FRONTED DEPLOYMENT STORY (R71-B)**: HSTS is already served
   (the r69 5-header set) but "only bites behind real TLS" — the missing
   piece is the PROXY CONTRACT, verified live this round: with
   `x-forwarded-proto: https` spoofed against the standalone, the
   sitemap locs, the robots Sitemap line, AND the page canonical all
   resolve `https://` (curl-verified on :3200). The metadataBase →
   canonical/og → sitemap → robots origin chain is the full
   TLS-front story; it needs (a) an E2E pin locking the contract so a
   future refactor cannot silently break TLS deployments, and (b) the
   DEPLOYMENT.md rewrite — the guide is stale in four measured ways: the
   pre-rename "ORBITAL" name, "16 API route handlers" (the tree reads
   42 route.ts files), a `NEXT_PUBLIC_SITE_URL` row documenting a
   variable NOTHING reads (the process.env sweep reads only
   DATABASE_URL + AUTH_SECRET; the origin story is headers-based), and
   no TLS/proxy section at all.

## The ToDo list (validated against the codebase)

1. **[DONE]** Baseline gates on the fresh clone (the workspace was RESET —
   re-cloned at `f2c3bd8`): lint 0/0 · tsc ✓ · **922/922 unit** ·
   build ✓ · **E2E 374/374 (5.9m, zero flakes)**. INFRASTRUCTURE TRAP
   (not source debt): the first E2E launch failed 367/374 — the fresh
   machine's playwright cache held chromium-1200 while the pinned
   @playwright/test 1.63 expects chromium_headless_shell-1248;
   `bunx playwright install chromium` retired it. The exported
   DATABASE_URL trap ACTIVE again (unset per db-touching command).
2. **[DONE]** The r71 deploy watch: **THE 33RD LOGIN DEPLOY** — login JS
   `CKnh3tRk`→`BCr9BMlh`, CSS QUIET, app side QUIET; the fresh re-auth
   clean. The patch watch QUIET (16.4.2 latest stable).
3. **[DONE]** The 33rd-deploy confirmation ladder (the re-auth + the four
   instruments): standing **5/5** + sweep **12/12** (the r52
   orchestrator, seeded :3200) + verify-r49 **13/13** (the zero-tenant
   :3201 boot) + verify-r45 **13/13** (the login-view family via
   r52-login-reaudit) → **THE 33RD LOGIN DEPLOY IS NON-VISUAL**. The
   watch finals are the post-33rd hashes.
4. **The R70 delta audit findings (validated in source + live)**: the
   login layout's un-nonced BreadcrumbList JSON-LD (src/app/login/
   layout.tsx:67 — the root layout's two blocks carry the nonce; this
   one does not) + the single `<style>` element surface (src/app/login/
   page.tsx:357, the session-45 cascade mirror — client-rendered, needs
   the server layout to stamp the nonce) + the stale DEPLOYMENT.md
   facts (measured above).
5. **R71-A: the CSP completion pair** (TDD):
   - RED: `tests/e2e/session71-csp-hardening.spec.ts` — (a) /login +
     /dashboard CSP headers carry `style-src-elem 'self' 'nonce-` +
     `style-src-attr 'unsafe-inline'` and NOT the blanket `style-src`;
     (b) the login HTML's `<style>` element AND every
     `application/ld+json` script carry `nonce="…"` (zero un-nonced);
     (c) the app page classes keep the full policy shape. FAILS on the
     current build (blanket style-src; bare breadcrumb + style tags).
   - GREEN: `src/lib/csp.ts` (the style-src directive replaced by the
     elem/attr pair; dev adds 'unsafe-inline' to elem) +
     `src/app/login/layout.tsx` (async; reads `x-nonce` via headers()
     exactly like the root layout; the nonce stamped on the
     BreadcrumbList script; the cascade-mirror `<style>` block MOVED
     from the client page — rendered before {children}, keeping the
     body-after-head-links winning cascade position, no precedence prop)
     + `src/app/login/page.tsx` (the block removed) + the unit pins
     (tests/unit/csp.test.ts: the new prod/dev directive shapes) + the
     session70-csp.spec.ts pin updated to the new contract.
   - The functional proof: the FULL E2E suite on the patched build +
     a CSP-violation console probe (dialog + drawer + chart
     interactions under the hardened policy).
6. **R71-B: the TLS-fronted deployment story** (pin + docs):
   - PIN: `tests/e2e/session71-tls-origin.spec.ts` — GET /sitemap.xml +
     /robots.txt + /login with the `x-forwarded-proto: https` request
     header → the loc URLs / the Sitemap line / the canonical link all
     resolve `https://`. Verified live pre-pin (curl, :3200) — this
     LOCKS the existing correct contract (a verification pin, the
     r67 pattern, not a RED fix).
   - DOCS: the DEPLOYMENT.md rewrite — the Eon HR name, the measured
     counts, the honest env table (DATABASE_URL + AUTH_SECRET only;
     the NEXT_PUBLIC_SITE_URL row deleted — nothing reads it), the
     x-forwarded-proto contract section (cookie scheme + metadataBase
     + canonical/og + sitemap + robots), and the NEW §8: the
     TLS-fronted deployment story (nginx + Caddy reverse-proxy
     examples, the HSTS note — served unconditionally, only bites
     behind real TLS; the CSP note — no upgrade-insecure-requests by
     design, safe behind TLS; the security-header set the app serves
     itself, so the proxy adds nothing but TLS + the forwarding
     headers).
7. **The standing checks**: the mobile-menu full functional cycle
   (toggle → the drawer with the nav links → the Training LMS link
   navigates → auto-close `open:false`) + the byte-stability pair (the
   new LIGHT mobile drawer pair vs the r70 474 pair — expecting the
   SEVEN-round chain new≡474≡456≡438≡418≡402≡366: both fix families
   live at the header/meta layer, zero rendered bytes) + the TW-v4
   standing scan (`!important` 15, oklch all comments) + DB pristine
   (users = [sepnetflix2023@outlook.com] only).
8. **Screenshots**: the 476+ pair set via `scripts/r71-screenshots.mjs`
   (the standing LOC route pairs + the mobile drawer pair + the inline
   mobile-menu cycle; detached server spawn per the r69/r70 lesson) →
   saved to `docs/screenshots/`; pair-uniqueness + byte-stability
   verified.
9. **Docs**: AGENTS session-71 layer + the Commands counts, CLAUDE (the
   pyramid + the test table), README (the counts + the session-71 spec
   tail), eon-hr_SKILL.md 3.54.0 + §81 + the State line, this plan's
   completion record, `docs/session_152.md` (the narrative) +
   `docs/session_153.md` (the raw log), the worklog; `.env.example`
   re-verified (only DATABASE_URL + AUTH_SECRET are read — the contract
   unchanged; DEPLOYMENT.md now agrees).
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
  proper 404 + its not-found page is the production-grade superset —
  kept, documented.
- No `upgrade-insecure-requests` in the CSP: the local standalone + E2E
  transport is plain HTTP; HSTS already covers the TLS-fronted
  production case (now documented in DEPLOYMENT.md §8).
- `style-src-attr` keeps `'unsafe-inline'`: the Radix/vaul/recharts
  style attributes carry dynamic runtime values (popper px offsets,
  drawer transforms) that cannot be nonce'd or hashed — the elem/attr
  split takes the element-side hardening and documents the attribute
  reality instead of pretending at a hash pipeline.

---

## Completion record (session-71, executed 2026-10-21)

- **[1 — DONE]** Baseline gates on the fresh clone (the workspace was
  RESET — re-cloned at `f2c3bd8`; the environment rebuilt per protocol:
  bun install, .env with the QUOTED pair, db push + seed, playwright
  chromium): lint 0/0 · tsc ✓ · **922/922 unit** · build ✓ ·
  **E2E 374/374 (5.9m, zero flakes)** on the SECOND launch — the
  first failed 367/374 on INFRASTRUCTURE (the fresh machine's
  playwright cache held chromium-1200 where @playwright/test 1.63
  pins the 1248 shell; `bunx playwright install chromium` retired
  it — classified as infra, not source, before touching any code).
  The exported-DATABASE_URL trap ACTIVE again (unset per invocation).
- **[2 — DONE]** The r71 deploy watch: **THE 33RD LOGIN DEPLOY
  DETECTED** — login JS `CKnh3tRk`→`BCr9BMlh` (CSS QUIET `BpSyi-cD`,
  the frontend-config preload holding; the app side QUIET
  `C-IrDy5f`/`BGNH4KkS`); the fresh re-auth clean (Turnstile
  unenforced — the standing watch item). The patch watch QUIET
  (16.4.2 the latest stable).
- **[3 — DONE]** The 33rd-deploy confirmation ladder: standing
  **5/5** + sweep **12/12** (the r52 orchestrator on the seeded
  :3200) + verify-r49 **13/13** (the zero-tenant :3201 boot) +
  verify-r45 **13/13** (the login-view family via r52-login-reaudit)
  → **NON-VISUAL** — and this round the login standing pair
  BYTE-CONFIRMS it (476 ≡ the r70 458 pair on BOTH sides). The watch
  finals are the post-33rd hashes.
- **[4 — DONE]** The R70 delta audit: the login layout's
  BreadcrumbList JSON-LD UN-NONCED (curl-verified: a bare
  `<script type="application/ld+json">` — CSP gates non-executable
  types too; a silent block the 374-spec suite could not catch) +
  the single-`<style>`-element surface (the session-45 login
  cascade mirror; 27 app routes + 404 + logout read zero) + the
  stale DEPLOYMENT.md facts measured (the ORBITAL name, the "16
  handlers" count, the phantom NEXT_PUBLIC_SITE_URL row).
- **[5 — DONE]** R71-A: the CSP completion pair — RED first (the
  R71-A1..A3 triple failing on the unpatched build: the blanket
  style-src, the bare breadcrumb, the un-nonced `<style>`) →
  `src/lib/csp.ts` (the style-src elem/attr split; dev adds elem
  'unsafe-inline' for Turbopack) + `src/app/login/layout.tsx`
  (async; `x-nonce` via headers(); the nonce on the BreadcrumbList
  + the cascade mirror `<style>` MOVED here from the client page,
  rendered before {children} — the winning body-after-head-links
  cascade position preserved) + `src/app/login/page.tsx` (the block
  removed) → GREEN (the R71-A triple + the amended session70 pair +
  the amended R44-A1 legacy pin: 924/924 unit). The
  CSP-violation console probe: the Radix dialog, the select popper,
  9 recharts svgs, and the vaul drawer all render with ZERO
  violations under the hardened policy.
- **[6 — DONE]** R71-B: the TLS-fronted deployment story — the
  R71-B1..B3 triple (live-curl-verified pre-pin; GREEN on the
  current build, the r67 verification-pin pattern; one
  assertion-vs-renderer normalization: the robots `User-Agent:`
  capitalization — the r70 lesson repeating on the round's own
  spec) + the DEPLOYMENT.md rewrite (the Eon HR name, the
  42-handler/54-endpoint counts, the honest two-variable env table,
  the §2 proxy note, the §7 missing-header row, and the new §8: the
  nginx + Caddy TLS proxy story with the x-forwarded-proto contract
  table and the why-no-UIR note).
- **[7 — DONE]** The standing checks: the mobile-menu cycle green
  TWICE — the inline probe (under the hardened policy) + the
  screenshots script's own cycle (the FIXED auto-close eval reading
  `open:false` natively: toggle → the drawer with
  Dashboard/Training LMS/Assets/Staff Requests → the Training LMS
  link CLICKED:/training → auto-closed); the byte-stability pair
  492 BYTE-MATCHES the r70 474 pair on the LOC side (md5-identical
  e3df921…) — **the SEVEN-round chain
  492≡474≡456≡438≡418≡402≡366** — after the DRAWER-INSTRUMENT
  CORRECTION (the r70 template's aria-label selector never matched
  REF since r46: every r66-r70 REF "drawer pair" captured the
  drawer CLOSED; the corrected snapshot-ref mechanism also exposed
  the eval-click's onOpenAutoFocus focus-ring state — both
  documented, the script carries the fix forward, and the REF side
  is captured OPEN for the first time: bfaa0da…, the corrected
  baseline; ref-vs-loc open-drawer delta 3.6%, the panel means
  within 4 sRGB units, the scrims identical); the TW-v4 scan clean
  (`!important` 15, oklch all comments); DB pristine (the known
  loading-probe user swept per the r61 protocol → users =
  [sepnetflix2023@outlook.com] only).
- **[8 — DONE]** Screenshots: the 476-492 set (18 files → 676
  tracked on disk; all 9 same-number pairs hash-distinct; the route
  pairs byte-stable vs the r70 set on both sides — the 33rd deploy
  byte-confirmed non-visual on the login surface, the r71 fix
  families byte-confirmed render-neutral on the route surfaces).
- **[9 — DONE]** Docs: the full layer set updated (AGENTS
  session-71 layer + the Commands counts (924/380), CLAUDE (the
  1304-spec pyramid + the test table 9/51 + both session-71
  test-list entries), README (the counts + the session-71 spec
  tail), eon-hr_SKILL.md 3.54.0 + §81 + the State line + the three
  carry-forward lessons, this completion record, docs/session_152.md
  (the narrative) + docs/session_153.md (the raw log), the worklog,
  DEPLOYMENT.md §1-§8); `.env.example` verified (only DATABASE_URL +
  AUTH_SECRET are read — the contract unchanged; DEPLOYMENT.md now
  agrees with it).
- **[10 — PENDING at write time; executed before push]** Commit ×3
  + the SSH-wrapper push to main; no new branches.
- **The gates at push time**: lint 0/0 · tsc ✓ · 924/924 unit ·
  build ✓ · E2E 380/380 · byte-stability 492≡474 (the seven-round
  chain, LOC side; the REF baseline corrected) · the ladder 43/43
  NON-VISUAL · DB pristine.
- **The round's headline**: THE CSP PIPELINE COMPLETED (the missed
  JSON-LD nonce + the style-src elem/attr split — the security
  superset deepened, proven violation-free by the console probe +
  the full suite) + THE TLS-FRONTED DEPLOYMENT STORY SHIPPED (the
  proxy contract pinned + the honest DEPLOYMENT.md) + THE 33RD
  DEPLOY LADDERED NON-VISUAL (byte-confirmed for the first time) +
  THE DRAWER INSTRUMENT CORRECTED (a six-round evidence defect
  found, root-caused, and fixed with the chain still holding).
