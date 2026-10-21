# Remediation Plan — Session 69 / Parity Round 68: The 32nd-deploy confirmation ladder + the security-headers parity set + the standing checks

**The round's motivation.** The recorded backlog came out of round 67 EMPTY of
open visual/functional items (the matrix complete, the security patches
current, the history divergence closed and pinned, the text axis
drift-verified, the token question closed). The round-67 completion record
left two standing watches and one open consideration: the deploy watch
(re-armed at the post-31st finals), the Next.js patch watch (16.4.3+), and
"functional superset expansion". This round converts all three:

1. **THE 32ND LOGIN DEPLOY — DETECTED by this round's watch**
   (`scripts/r69-deploy-watch.mjs`, the post-31st finals armed): login JS
   `8hcVVGz2`→`CKnh3tRk` plus a NEW `api/frontend-config.js?v=3` script
   (login CSS QUIET `BpSyi-cD`; the app side QUIET
   `C-IrDy5f`/`BGNH4KkS`). The frontend-config payload is a Base44
   PLATFORM-level config (Datadog tokens, Turnstile site key,
   `TURNSTILE_LOGIN_ENABLED: "true"`, Google client ID, platform URLs) —
   NOT an Eon-HR-app change. The login DOM recon: structurally unchanged
   (the same 7 buttons — Continue with Google/Microsoft/Apple, Sign in,
   Forgot password?, Need an account? Sign up — one form, email+password
   inputs, ZERO Turnstile iframes/widgets rendered for this session). Per
   the standing protocol the full confirmation ladder is still REQUIRED
   (a login-side change can presage an app rollout), with the login-view
   family (verify-r45) as the direct paired audit of the changed surface.
2. **The Next.js patch watch: QUIET** — `npm view next` reads 16.4.2 as
   the latest stable (16.5.0 is canary-only). The codebase is current;
   the watch stays armed.
3. **The functional superset expansion — an HTTP-layer parity gap found**:
   67 rounds of audits lived at the DOM/computed-style layer; the HTTP
   response-header layer was never censused. The live REF serves a
   5-header security set on every response
   (`curl -sI https://eon.base44.app/login`):
   `permissions-policy: camera=(self), microphone=(self), geolocation=(self), payment=(self), usb=(self), magnetometer=(), gyroscope=()`
   · `referrer-policy: strict-origin-when-cross-origin` ·
   `strict-transport-security: max-age=31536000` ·
   `x-content-type-options: nosniff` · `x-frame-options: DENY`.
   The clone's standalone serves NONE of them (next.config.ts has no
   `headers()`; src/proxy.ts adds none; zero existing tests). This is
   simultaneously (a) a REF-parity gap at a layer no census covered and
   (b) the canonical OWASP production-hardening set — the round's fix
   family. Zero visual impact (headers are invisible to the rendered
   surface — no byte-stability risk).

## The ToDo list (validated against the codebase)

1. **[DONE]** Baseline gates (reproduce-before-trusting, fresh clone):
   `bun install` (525 pkgs) · `.env` rebuilt (QUOTED DATABASE_URL +
   AUTH_SECRET pair — the ladder greps the quoted form) · db push + seed
   (sepnetflix2023@outlook.com / Demo, balances 21/21 + 30/30) ·
   playwright chromium · lint 0/0 · tsc ✓ · **910/910 unit** · build ✓ ·
   E2E full suite (expect 368/368 on 16.4.2).
2. **[DONE]** The r69 deploy watch written + run — **THE 32ND LOGIN
   DEPLOY DETECTED** (login JS `8hcVVGz2`→`CKnh3tRk` + the NEW
   `frontend-config.js`; CSS + the app side quiet). The login DOM recon
   recorded (structurally unchanged; the Turnstile config noted — no
   widget rendered in our flow).
3. **The full confirmation ladder** (sequential after E2E per the
   resource-competition protocol): fresh re-auth of the shared `ref`
   session → `scripts/r52-standing-run.mjs` (standing 5/5 + sweep 12/12;
   boots the SEEDED standalone on :3200) → `scripts/verify-r49.mjs`
   (13/13, the :3201 zero-tenant boot) → `scripts/verify-r45.mjs`
   (13/13, :3200 — the login-view family pairs: THE DIRECT AUDIT of the
   32nd-deploy surface). Verdict: NON-VISUAL (expected — the app side
   quiet + the DOM recon clean) or a re-census opens.
4. **R69-A: the security-headers parity set** (TDD):
   - RED: `tests/e2e/session69-security-headers.spec.ts` — request a
     page route + an API route from the standalone server and assert
     all 5 REF-matching headers + values; confirm it FAILS on the
     current build (headers absent).
   - GREEN: add `async headers()` to `next.config.ts` — source
     `/:path**` (every route, pages + API), the exact 5-header set with
     the REF's exact values (HSTS included: browsers ignore it over
     plain HTTP, it protects real TLS-fronted deployments, and it
     matches REF).
   - Re-build + the pin green + the full E2E suite green (368 + 2 pins).
   - Verify against the served standalone (curl -I parity vs the REF
     set).
5. **The standing checks**: the mobile-menu full functional cycle
   (toggle → the drawer opens with the nav links → the Training LMS
   link navigates → auto-close verified) + the byte-stability pair (the
   456 LIGHT mobile drawer pair vs the r68 438 set — expecting the
   FIVE-round chain 456≡438≡418≡402≡366) + the TW-v4 standing scan
   ([DONE] `!important` 15, oklch all comments) + DB pristine (the
   verify-r45 loading-probe user sweep per the r61 protocol).
6. **Screenshots**: the 440+ pair set via `scripts/r69-screenshots.mjs`
   (theme: the 32nd-deploy REF login pair + the standing LOC route pairs
   + the mobile drawer pair + the inline mobile-menu cycle) → saved to
   `docs/screenshots/`; pair-uniqueness + byte-stability verified.
7. **Docs**: AGENTS session-69 layer + the Commands counts (910/370),
   CLAUDE (the 1280-spec pyramid + the test-table), README (the counts +
   the session-69 spec tail), eon-hr_SKILL.md 3.52.0 + §79 + the State
   line, this plan's completion record, `docs/session_145.md` (the
   narrative) + `docs/session_146.md` (the raw log), the worklog;
   `.env.example` verified (only DATABASE_URL + AUTH_SECRET are read).
8. **Commit ×3 + SSH push to main** (the `fix:` commit with the round
   message, the `docs+verify:` commit, the `update session log` journal
   commit) via `docs/ssh_git_wrapper_v3.py` per the wrapper skill; NO
   new branches.

## The standing non-goals (recorded, not changed this round)

- The Turnstile platform rollout: REF's `frontend-config.js` carries
  `TURNSTILE_LOGIN_ENABLED: "true"` but no widget renders for our flow —
  no clone-side action while the challenge stays unenforced; the watch
  notes it (a future enforced rollout would break the watch's own re-auth
  and REQUIRE a re-audit of the login surface + a clone-side bot-guard
  decision).
- The with-data superset surfaces stay REF-unmeasurable at the demo's
  zero state (standing allowance note).
- CSP: NOT added this round — a Next.js CSP needs a nonce/nonce-hash
  pipeline (inline scripts, hydration chunks) that is its own project;
  the 5-header set matches REF exactly (REF serves no CSP either —
  measured).

---

## Completion record (session-69, executed 2026-10-21)

- **[1 — DONE]** Baseline gates: lint 0/0 · tsc ✓ · 910/910 unit ·
  build ✓ (standalone + static copy respected) · **E2E 368/368 PASSED
  (zero flakes)** — the documented round-67 baseline held exactly on
  the fresh clone.
- **[2 — DONE]** The r69 deploy watch: **THE 32ND LOGIN DEPLOY
  DETECTED** — login JS `8hcVVGz2`→`CKnh3tRk` + the NEW
  `api/frontend-config.js?v=3` (CSS QUIET `BpSyi-cD`; the app side QUIET
  `C-IrDy5f`/`BGNH4KkS`). The DOM recon: the 7-button surface, one
  form, email+password, ZERO Turnstile widgets — structurally
  unchanged; the platform config (Turnstile site key, Datadog, Google
  client ID) recorded.
- **[3 — DONE]** The full confirmation ladder: **NON-VISUAL** —
  standing 5/5 + sweep 12/12 + verify-r49 13/13 + verify-r45 13/13
  (the login-view family pairs green against the 32nd-deploy REF).
  The watch finals are the post-32nd hashes.
- **[4 — DONE]** R69-A: the security-headers parity set — the E2E pin
  RED (2 specs failing on the headerless build) → `headers()` added to
  next.config.ts (the exact REF 5-header set, source `/:path*`) →
  re-build → pin GREEN (3/3 with the setup project) → curl parity
  verified against the standalone (page + API both carry the set;
  values byte-identical to REF — the casing difference is
  transport-level HTTP/1.1 vs HTTP/2 normalization). E2E 368 → 370.
  The one legacy amendment the fix required (R51-A2, per the r65/r66
  protocol): the rewrite-scope pin's whole-file `source:` regex tripped
  on the headers() block's own `source: "/:path*"` — the pin now reads
  the rewrites() block (its true contract) and additionally pins the
  headers contract (exactly one catch-all; the surfaces separate).
  910/910 green after the amendment.
- **[5 — DONE]** The standing checks: the mobile-menu cycle green
  (toggle → the drawer opens with Dashboard/Training LMS/Assets/Staff
  Requests/AI HR Assistant → the Training LMS link navigates to
  /training → auto-close `open:false` verified); **the byte-stability
  pair 456≡438 on BOTH sides (md5-identical) — the FIVE-round chain
  (456≡438≡418≡402≡366)**; TW-v4 scan clean (`!important` 15, oklch
  all comments); DB pristine (the verify-r45 loading-probe user swept
  per the r61 protocol → users = [sepnetflix2023@outlook.com] only).
- **[6 — DONE]** Screenshots: the 440–457 set (18 files → 640 on disk;
  all 9 same-number pairs hash-distinct) — the LOGIN page pair on the
  32nd-deploy REF (captured logged-out, fresh sessions) + the LIGHT
  standing route pairs (dashboard, payroll, employees, attendance,
  training, recruitment, settings) + the LIGHT mobile drawer pair
  (456, the byte-stability evidence) + the inline mobile-menu cycle.
- **[7 — DONE]** Docs: AGENTS session-69 layer + Commands (910/370),
  CLAUDE (the 1280-spec pyramid), README (the counts + the spec tail),
  SKILL 3.52.0 + §79 + the State line, the session_145/146 journals,
  the worklog; `.env.example` verified.
- **[8 — PENDING at write time; executed before push]** Commit ×3 +
  the SSH-wrapper push to main; no new branches.
- **The gates at push time**: lint 0/0 · tsc ✓ · 910/910 unit ·
  build ✓ · **E2E 370/370** · the ladder NON-VISUAL (43/43) ·
  byte-stability 456≡438 · DB pristine.
- **The round's headline**: THE 32ND DEPLOY AUDITED NON-VISUAL + THE
  HTTP-LAYER PARITY GAP CLOSED — the clone now serves REF's exact
  5-header security set on every route (the first fix family below
  the DOM layer in the project's history), the 32nd login deploy is
  ladder-verified green, the mobile surface byte-stable across a
  FIFTH round, and the codebase's production hardening now covers
  the transport layer alongside the complete computed-style matrix.
