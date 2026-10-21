# Remediation Plan — Session 70 / Parity Round 69: The SEO-surface parity pair (sitemap.xml + the robots Sitemap directive) + the CSP nonce pipeline (the pure superset) + the standing checks

**The round's motivation.** The round-68 completion record left the recorded
backlog EMPTY of open visual/functional items — the matrix complete (r66),
the transport layer parity-hardened (r68's 5-header security set), the
security patches current (16.4.2), the divergence closed (r67). The standing
watches were: the deploy watch (re-arm at the post-32nd finals), the Next.js
patch watch (16.4.3+), the Turnstile platform rollout (the login-side watch
item), and the superset-expansion consideration (session_147's suggestion:
"a CSP nonce pipeline — REF serves none, so it would be a pure superset").
This round converts the watches and extends the r68 lesson ("census new
LAYERS, not just new members") one layer further:

1. **The deploy watch (scripts/r70-deploy-watch.mjs, the post-32nd finals
   armed): QUIET** — the login side holds at JS `CKnh3tRk` + CSS `BpSyi-cD`
   (+ the `frontend-config` platform preload), the app side holds at
   `C-IrDy5f`/`BGNH4KkS`. NO 33rd deploy → NO confirmation ladder required
   this round. The fresh re-auth succeeded — the Turnstile challenge stays
   unenforced for our session/IP (the standing watch item holds).
2. **The Next.js patch watch: QUIET** — `npm view next` reads 16.4.2 as the
   latest stable (16.5.0 canary-only). No action; the watch stays armed.
3. **THE HTTP-LAYER SWEEP #2 (the r68 lesson applied again)** found a real
   parity gap at the SEO surface: **the live REF serves a `sitemap.xml`**
   (200, application/xml, 61 `<url>` entries: `/` at priority 1.0 + the
   60 app routes at 0.8, every one `changefreq weekly`, no `<lastmod>`) and
   **its robots.txt declares the sitemap**
   (`Sitemap: https://eon.base44.app/sitemap.xml`). The clone serves NO
   sitemap route at all (`src/app/sitemap.*` does not exist) and its static
   `public/robots.txt` carries no Sitemap directive. This is a gap in the
   very SEO/meta layer the clone otherwise supersedes (per-route titles
   byte-identical, per-route canonicals resolved against the serving
   origin, JSON-LD WebSite + Organization, the manifest + self-hosted
   og-image/icon family — all audited in r25/r31). Also swept: REF's
   unknown-route response is HTTP 200 (the SPA shell — the clone's proper
   404 with its own not-found page is the production-grade superset,
   documented, not changed), and REF's manifest/favicon 302-redirect to
   platform infra (the clone self-hosts both — already the superset).
4. **The superset candidate assessed and green-lit: the CSP nonce
   pipeline**. The r68 plan deferred CSP as "its own project"; this round
   takes it with the official Next.js middleware-nonce pattern. The
   audit that gates it: the clone loads ZERO external runtime resources
   (a full-source URL sweep reads only placeholder strings in seed data —
   no external fonts, images, scripts, or connect endpoints; every asset
   self-hosted). A strict `default-src 'self'` policy is therefore viable:
   script-src `'self' 'nonce-<per-request>' 'strict-dynamic'` (Next reads
   the nonce from the middleware's CSP REQUEST header and stamps it on
   every script it renders — the documented mechanism), the root layout's
   own inline scripts (the THEME_BOOT pre-paint boot + the two JSON-LD
   blocks) get the nonce explicitly, style-src `'unsafe-inline'` (TW4's
   compiled <link> CSS is 'self'; the inline style ATTRIBUTES — Radix,
   vaul, recharts — need the inline allowance), and the full E2E suite
   (370 specs on the production standalone) is the functional safety net:
   any blocked script breaks hydration and fails the suite loudly.

## The ToDo list (validated against the codebase)

1. **[DONE]** Baseline gates (the workspace survived this time — git pull
   fast-forwarded `1322530..34b7c2b`): lint 0/0 · tsc ✓ · **910/910 unit**
   · build ✓ · E2E full suite in flight (expect 370/370 on 16.4.2). The
   exported-DATABASE_URL trap ACTIVE again (unset per db-touching command).
   TRAP re-retired: the first detached E2E launch died silently (18-byte
   log) — the surviving pattern is the parenthesized subshell
   `(setsid nohup … < /dev/null &)`.
2. **[DONE]** The r70 deploy watch written + run: **BOTH SIDES QUIET** —
   no 33rd deploy; the watch finals stay the post-32nd hashes. The Next.js
   patch watch: QUIET (16.4.2 latest stable). No ladder this round.
3. **The HTTP-layer sweep #2** (curl, REF-side, safe during E2E): the
   sitemap gap + the robots Sitemap directive CONFIRMED (above); the 404
   semantics + manifest/favicon recorded as the standing supersets.
4. **R70-A: the SEO-surface parity pair** (TDD):
   - RED: `tests/e2e/session70-seo-surface.spec.ts` — GET `/sitemap.xml`
     (200 · application/xml · the 62-entry set: `<loc>` count 62 ·
     `<priority>1.0</priority>` ×1 · `<priority>0.8</priority>` ×61 ·
     `<changefreq>weekly</changefreq>` ×62 · the spot members `/`,
     `/dashboard`, `/employees`, `/careers`, `/organizationsetup` present)
     + GET `/robots.txt` (the User-agent/Allow/Disallow: /api/ set + the
     `Sitemap:` directive). Both FAIL on the current build (404 / no
     directive).
   - GREEN: `src/lib/sitemap-routes.ts` (the canonical route registry —
     the 61 `(app)` slugs, the session-32 complete page registry, as a
     pure `buildSitemap(origin)` function) + `src/app/sitemap.ts` (the
     Next metadata route, origin resolved via headers() exactly like the
     root layout's metadataBase) + `src/app/robots.ts` (the dynamic
     robots: `User-agent: *` · `Allow: /` · `Disallow: /api/` ·
     `Sitemap: <origin>/sitemap.xml`) + DELETE `public/robots.txt` (the
     static file would shadow the route).
   - Unit pins: the registry is exactly the `(app)` route set; the
     buildSitemap shape (62 entries, the 1.0/0.8 split, weekly).
   - The design note: the URL set = REF's 61-URL list mirrored in the
     clone's canonical lowercase form + `/dashboard` (the clone's own
     canonical dashboard route — its page canonical points there; REF
     omits it only because its dashboard IS `/`). 62 URLs, the one-entry
     superset documented.
5. **R70-B: the CSP nonce pipeline** (TDD, the pure superset — REF serves
   no CSP, measured in r68):
   - RED: `tests/e2e/session70-csp.spec.ts` — GET `/login` + `/dashboard`
     assert the `Content-Security-Policy` response header with
     `'strict-dynamic'` + `'nonce-` + the `default-src 'self'` shape (the
     two page classes: the logged-out login surface + the authed app
     surface). FAILS on the current build (no CSP).
   - GREEN: `src/lib/csp.ts` (`buildCsp(nonce, isDev)` pure — prod:
     default-src 'self'; base-uri 'self'; form-action 'self';
     frame-ancestors 'none'; object-src 'none'; script-src 'self'
     'nonce-N' 'strict-dynamic'; style-src 'self' 'unsafe-inline';
     img-src 'self' data: blob:; font-src 'self' data:; connect-src
     'self'. dev adds `'unsafe-eval'` to script-src + `ws:` to
     connect-src for HMR. NO upgrade-insecure-requests — it would break
     the plain-HTTP standalone + E2E transport) + `src/proxy.ts` extended
     (the nonce generated per request; the CSP set on the REQUEST headers
     — Next's auto-nonce mechanism — AND the response; the matcher
     widened to include `/login` + `/logout` (documents need the policy)
     while the auth-redirect is scoped to non-auth pages) +
     `src/app/layout.tsx` (the nonce read from headers and stamped on the
     THEME_BOOT script + the two JSON-LD blocks — CSP applies to
     non-executable script types too).
   - Unit pins: the buildCsp prod/dev shapes (the exact directive
     strings).
   - The regression proof: the FULL E2E suite on the patched build
     (370 + this round's pins) — hydration intact across every surface.
6. **The standing checks**: the mobile-menu full functional cycle (toggle
   → the drawer opens with the nav links → the Training LMS link
   navigates → auto-close verified) + the byte-stability pair (the new
   LIGHT mobile drawer pair vs the r69 456 pair — expecting the SIX-round
   chain new≡456≡438≡418≡402≡366: both fix families live at the
   header/meta layer, zero rendered bytes) + the TW-v4 standing scan
   (`!important` 15, oklch all comments) + DB pristine (the verify-r45
   loading-probe user sweep per the r61 protocol).
7. **Screenshots**: the 458+ pair set via `scripts/r70-screenshots.mjs`
   (theme: the standing LOC route pairs + the mobile drawer pair + the
   inline mobile-menu cycle) → saved to `docs/screenshots/`;
   pair-uniqueness + byte-stability verified.
8. **Docs**: AGENTS session-70 layer + the Commands counts, CLAUDE (the
   pyramid + the test table), README (the counts + the session-70 spec
   tail), eon-hr_SKILL.md 3.53.0 + §80 + the State line, this plan's
   completion record, `docs/session_148.md` (the narrative) +
   `docs/session_149.md` (the raw log), the worklog; `.env.example`
   re-verified (only DATABASE_URL + AUTH_SECRET are read).
9. **Commit ×3 + SSH push to main** (the `fix:` commit with the round
   message, the `docs+verify:` commit, the `update session log` journal
   commit) via `docs/ssh_git_wrapper_v3.py` per the wrapper skill; NO
   new branches.

## The standing non-goals (recorded, not changed this round)

- The Turnstile platform rollout: the challenge stays unenforced for our
  session/IP (the re-auth succeeded clean); no clone-side action while
  unenforced. An enforced rollout would break the watch's own re-auth and
  REQUIRE a login-surface re-audit + a clone-side bot-guard decision.
- The with-data superset surfaces stay REF-unmeasurable at the demo's
  zero state (standing allowance note).
- REF's soft-404 (HTTP 200 SPA shell on unknown routes): the clone's
  proper 404 + its not-found page is the production-grade superset —
  kept, documented.
- No `upgrade-insecure-requests` in the CSP: the local standalone + E2E
  transport is plain HTTP; the directive would upgrade subresource
  requests to https and break them (HSTS already covers the TLS-fronted
  production case, and REF serves no UIR either).

---

## Completion record (session-70, executed 2026-10-21)

- **[1 — DONE]** Baseline gates: lint 0/0 · tsc ✓ · 910/910 unit ·
  build ✓ · **E2E 370/370 PASSED (zero flakes)** on the unpatched build —
  the documented round-68 baseline held exactly (the first detached
  launch died silently; the parenthesized-subshell pattern retired it).
- **[2 — DONE]** The r70 deploy watch: **BOTH SIDES QUIET** — no 33rd
  deploy (login JS `CKnh3tRk` + CSS `BpSyi-cD` + the frontend-config
  preload; the app side `C-IrDy5f`/`BGNH4KkS`); the fresh re-auth clean
  (Turnstile unenforced). The Next.js patch watch: QUIET (16.4.2 latest
  stable). No ladder required.
- **[3 — DONE]** The HTTP-layer sweep #2: the sitemap gap CONFIRMED
  (REF serves the 61-entry sitemap.xml + the robots Sitemap directive;
  the clone had neither) + the 404/manifest/favicon supersets recorded.
- **[4 — DONE]** R70-A: the SEO-surface parity pair — the E2E pin RED
  (both specs failing on the unpatched build: the 404 sitemap + the
  directive-less robots) → `src/lib/sitemap-routes.ts` (the 61-slug
  registry + the pure builder) + `src/app/sitemap.ts` (the metadata
  route, origin via headers()) + `src/app/robots.ts` (the dynamic
  robots with the Sitemap directive) + `public/robots.txt` DELETED
  (the static file shadows the route) → pin GREEN + the 7 unit pins
  green (tests/unit/seo-surface.test.ts: the registry == the (app)
  readdirSync tree, the REF-mirror member list, the builder shape) +
  curl parity verified against the standalone (62 locs, 62 weekly, 62
  priorities, the origin-resolved robots set). Two renderer
  normalizations documented (priority `1` vs REF's `1.0` —
  xsd:decimal-equal; the robots `User-Agent:` capitalization — the
  spec is case-insensitive). The live URL-set diff: REF's 61 ⊆ the
  clone's 62, the one superset member `/dashboard`.
- **[5 — DONE]** R70-B: the CSP nonce pipeline — the E2E pin RED (both
  specs failing: no CSP header) → `src/lib/csp.ts` (buildCsp prod/dev,
  5 unit pins: the exact directive strings, the NO-unsafe-eval +
  NO-upgrade-insecure-requests production pins, the dev eval/ws
  allowances) + `src/proxy.ts` extended (per-request nonce, the CSP on
  request AND response headers — Next's auto-nonce mechanism
  curl-verified: the chunks carry nonce="…"; the matcher widened to
  /login + /logout; the auth-redirect scoped past them) +
  `src/app/layout.tsx` (the nonce stamped on the THEME_BOOT + JSON-LD
  scripts) → pin GREEN (5/5 with the SEO pair) + the FULL suite green
  on the patched build: **E2E 374/374 (5.6m, zero flakes)** —
  hydration intact across every surface; the suite is the functional
  proof.
- **[6 — DONE]** The standing checks: the mobile-menu cycle green
  (toggle → the drawer opens with Dashboard/Training LMS/Assets/Staff
  Requests → the Training LMS link CLICKED:/training → auto-close
  `open:false` verified — the r69 template's auto-close eval had an
  unbalanced paren, re-verified directly); the byte-stability pair
  474 BYTE-MATCHES the r69 456 pair on BOTH sides (md5-identical: ref
  e24ad06…, loc e3df921…) — the SIX-round chain
  (474≡456≡438≡418≡402≡366); the TW-v4 scan clean (`!important` 15,
  oklch all comments); DB pristine (users =
  [sepnetflix2023@outlook.com] only).
- **[7 — DONE]** Screenshots: the 458–475 set (18 files → 658 on
  disk; all 9 same-number pairs hash-distinct) — the LOGIN standing
  pair (the watch read both sides quiet) + the LIGHT standing route
  pairs (dashboard, payroll, employees, attendance, training,
  recruitment, settings) + the LIGHT mobile drawer pair (474, the
  byte-stability evidence) + the inline mobile-menu cycle.
- **[8 — DONE]** Docs: the full layer set updated (AGENTS session-70
  layer + the Commands counts (922/374), CLAUDE (the 1296-spec
  pyramid + the test-table 9/49 + both session-70 test-list entries),
  README (the counts + the session-70 spec tail), eon-hr_SKILL.md
  3.53.0 + §80 + the State line + the three carry-forward lessons,
  this completion record, docs/session_148.md + docs/session_149.md,
  the worklog); `.env.example` verified (only DATABASE_URL +
  AUTH_SECRET are read — the contract unchanged this round).
- **[9 — PENDING at write time; executed before push]** Commit ×3 + the
  SSH-wrapper push to main; no new branches.
- **The gates at push time**: lint 0/0 · tsc ✓ · 922/922 unit ·
  build ✓ · E2E 374/374 · byte-stability 474≡456 (the six-round
  chain) · DB pristine.
- **The round's headline**: THE SEO SURFACE REACHES FULL PARITY (the
  sitemap + the robots Sitemap directive — the last uncensused member
  of the r25 SEO layer, live-diff-verified REF 61 ⊆ clone 62) + THE
  FIRST SECURITY-POLICY SUPERSET (the CSP nonce pipeline — REF serves
  none; the clone's transport layer now exceeds the reference's
  hardening, proven functionally by the full-suite green under the
  policy).
