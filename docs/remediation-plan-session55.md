# Remediation plan — session 55 (parity round 54)

> The round-53 frontier said the mobile navigation surface is complete
> across both its static families (rounds 50–52) and its interaction
> family (round 53). This round's census took the §64 lesson to the
> next surface that every prior round PASSED THROUGH but never measured:
> the **auth-boundary navigation family** — the URL-level user journey
> at the session boundary. Every census signs in and signs out to reach
> its surface; the landing URLs themselves were never the measured
> object. All contracts live-measured this window (REF @1440×900 vs the
> seeded LOC :3200 standalone, `scripts/r55-census.mjs`).

## The round's context

- Workspace continued from `dcf2f22` (the owner's session_110 journal,
  docs-only on the landed round-53 `7207390`). Environment verified
  intact (bun install, `.env` with `DATABASE_URL="file:../db/custom.db"`
  + AUTH_SECRET, db seeded, playwright chromium). Baseline gates ALL
  GREEN: lint 0/0 · tsc ✓ · 793/793 unit · build ✓ · 258/258 E2E (no
  flakes this window).
- The skills audit (Phase 2): the session-53 delta fresh-eyed (the
  R54-A default-group-map pin + the drawer-geometry comment fix —
  clean, conventions hold); the standing TW-v4 sweeps (!important
  confined to the documented globals.css blocks; template-string
  classes interpolate pre-authored static constants); the structural
  doc counts verified current (61 routes / 54 API files / 47 models /
  793 / 258). scandihaven (the tech-stack model) unchanged since
  Oct 4 (remote HEAD `d4789c3`).
- The deploy watch: **both sides QUIET** — login fingerprints
  `C2ujlke6`/`D5oCh2kx` unchanged (no 21st deploy), app fingerprints
  `C-IrDy5f`/`BGNH4KkS` unchanged. The confirmation ladder re-run
  green: standing audits **5/5** + route sweep **12/12** +
  **verify-r49 13/13** + **verify-r45 13/13**.

## The findings (all live-measured)

### A. THE AUTH-BOUNDARY NAVIGATION WALK (the census record — 6 real gaps)

The round's fresh paired-live census (`scripts/r55-census.mjs`,
seven paired phases, desktop 1440×900 — the boundary family is
URL-level, viewport-independent):

- **(A) The post-login landing (no from_url — a DIRECT /login visit)**:
  REF lands on the **ROOT `/`** — which serves the dashboard content
  (h1 "EonHR" brand + "Welcome back" + Quick Actions), the URL staying
  at `/`. The clone lands at `/dashboard` (`router.replace("/dashboard")`
  since session 1 — never paired against REF's landing). **DIFF.**
- **(B) The root-route serve**: REF's `/` renders the dashboard
  **URL-unchanged** (the SPA's index route maps to the dashboard page —
  headings + Quick Actions + Annual Leave identical to `/dashboard`).
  The clone's `/` is a server **redirect** to `/dashboard`
  (`src/app/page.tsx` — the URL bar changes). **DIFF — the same family
  as (A).**
- **(C) The root-route guard**: REF's logged-out `/` bounces to
  `/login?from_url=https://eon.base44.app/` (the FULL root URL as the
  param). The clone's logged-out `/` redirects to a plain `/login`
  (no param). **DIFF.**
- **(D) The deep-route logged-out guard**: REF's logged-out `/settings`
  bounces to `/login?from_url=https://eon.base44.app/settings` — the
  param carries **the requested URL**. The clone's (app) layout guard
  hardcodes `from_url=/dashboard` for EVERY guarded route
  (`src/app/(app)/layout.tsx`). **DIFF — REF preserves the deep link;
  the clone loses it.**
- **(E) The from_url ROUND-TRIP**: signing in from (D)'s landing
  returns REF to `/settings` (the page the user asked for — the
  deep-link continuation). The clone lands at `/dashboard` (the
  hardcoded param). **DIFF — the round-trip breaks end-to-end on the
  clone today.**
- **(F) The LOGOUT walk** (user menu → Logout from `/settings`): REF
  lands at `/login?from_url=https://eon.base44.app/settings` — the
  param carries **the current page's URL**. The clone's `/logout`
  route redirects to a plain `/login` (drops the context). **DIFF.**
- **(G) Authed /login**: REF has NO redirect-away guard — the sign-in
  form stays renderable while authenticated; the clone matches (no
  session check on the login page). **MATCH — 1/7.**

**Verdict: 1/7 MATCH — six genuine functional-parity gaps, one
family.** The auth-boundary round-trip (share a deep link → sign in →
land where you meant to go) works on REF and breaks on the clone.

### B. The from_url FORMAT divergence (the design consideration)

REF's `from_url` param carries the **full absolute URL**
(`https://eon.base44.app/settings`). The clone's login handler only
honors path-form values (`from.startsWith("/")`), so even a correctly
-formed absolute param would fall back to `/dashboard`. The fix must
accept BOTH forms — but ONLY same-origin absolute URLs (an absolute
`from_url` is an open-redirect vector if honored blindly; the resolver
must verify `url.origin === location.origin` and extract the path).
Protocol-relative (`//evil.com`) and backslash-leading (`/\evil.com`)
forms are rejected outright. The path-form check gets the same guards.
This is the security-preserving superset of REF's behavior.

### C. The instrument lessons (the r55 orchestrator's false reads)

- **The oneLine eval rule re-hit**: multi-line eval expressions fail
  with "Invalid or unexpected token" (the literal `\n` between JS
  tokens) — every expression is one-lined BEFORE `JSON.stringify`
  (the r54 evalOn pattern, now in `evalStr`).
- **The localhost/127.0.0.1 origin note**: the clone's `/logout`
  redirect resolved its origin to `localhost:3200` while the browser
  requested `127.0.0.1:3200` (the standalone server's URL resolution
  uses the configured hostname differently than the request's Host
  header) — cosmetic in the sandbox, but the rewritten logout route
  should build its redirect from the REQUEST's own origin (the Referer
  when same-origin), not a re-derived one.

## The fixes (file map)

1. **`src/proxy.ts` (NEW)** — the Next 16 proxy (the `proxy.ts`
   convention; `middleware.ts` is the deprecated name — Next 16.4
   supports both, `PROXY_LOCATION_REGEXP=(?:src/)?proxy`): guards every
   (app) route at the edge. No `eon_session` cookie → redirect to
   `/login?from_url=<the request's absolute URL>` (REF's format). The
   matcher excludes `/login`, `/logout`, `/api`, `_next/*`, and
   dot-files. Cookie-PRESENCE only (cheap, edge-safe); the (app)
   layout's full HMAC + DB verification stays as defense-in-depth for
   present-but-invalid cookies.
2. **`next.config.ts`** — the root rewrite
   `{ source: "/", destination: "/dashboard" }` (the session-51
   URL-unchanged-serve pattern, exactly the `/Dashboard` casing fix's
   sibling): REF serves the dashboard AT the root; the clone now does
   too — no client-visible redirect.
3. **`src/app/page.tsx` (REMOVED)** — the root redirect page is dead
   code under the rewrite (beforeFiles rewrites precede the filesystem);
   the logged-out root guard moves to the proxy.
4. **`src/lib/login-redirect.ts` (NEW)** — `resolveFromUrl(from,
   origin)`: the PURE from_url resolver (the TDD seam). Path-form
   (leading `/`, not `//` or `/\`) → as-is; same-origin absolute URL →
   pathname + search; everything else → null. Exported for the login
   page + the unit layer.
5. **`src/app/login/page.tsx`** — the post-login target:
   `router.replace(resolveFromUrl(params.get("from_url"),
   window.location.origin) ?? "/")` — the default becomes the ROOT
   (REF's landing), the param goes through the secure resolver.
6. **`src/app/logout/route.ts`** — GET + POST carry the `Referer` as
   `from_url` when same-origin (the user-menu logout navigates via
   `window.location.href` — the browser attaches the current page as
   Referer); a plain `/login` otherwise (foreign/absent referer —
   never an open redirect).
7. **`tests/unit/login-redirect.test.ts` (NEW)** — the resolver's unit
   pins: path-form, same-origin absolute (with search), foreign
   origin, protocol-relative, backslash-leading, null/empty, non-URL
   garbage.
8. **`tests/e2e/session55-auth-boundary.spec.ts` (NEW)** — the round's
   E2E pins (R55-A..E below).
9. **`src/app/(app)/layout.tsx`** — UNCHANGED in behavior: the guard's
   hardcoded `from_url=/dashboard` remains as the invalid-cookie
   fallback (the proxy handles the logged-out case with the real
   requested URL; the layout only fires for present-but-invalid
   cookies, where `/dashboard` is the sensible recovery target).

## The pins (TDD)

- **R55-A (unit, RED-first)**: `resolveFromUrl` — the seven-form table
  (the file map #7).
- **R55-A (E2E)**: the post-login landing is the ROOT — a real UI
  sign-in from a direct `/login` visit lands at URL `/` with the
  dashboard content (Welcome back + Quick Actions).
- **R55-B (E2E)**: the root serves the dashboard URL-unchanged — an
  authed `goto("/")` stays at `/` with the dashboard content (the
  rewrite, not a redirect).
- **R55-C (E2E)**: the deep-link round-trip — logged-out
  `goto("/settings")` → `/login?from_url=http://localhost:3100/settings`
  → sign in → lands at `/settings` with the Settings heading.
- **R55-D (E2E)**: the logout carries the current page — authed at
  `/settings` → user-menu Logout → `/login?from_url=…/settings`.
- **R55-E (E2E)**: the open-redirect guard —
  `/login?from_url=https://evil.example.com/phish` → sign in → lands
  at `/` (never the foreign origin). The unit table covers
  `//evil.com` + `/\evil.com`.

## The verification gates

lint 0/0 · tsc ✓ · unit 793 + 7 (the resolver table) · build ✓ ·
E2E 258 + 5 (R55-A..E) = 263 · the auth-boundary census re-run
post-fix (7/7 expected) · standing audits 5/5 + route sweep 12/12 +
verify-r49 13/13 + verify-r45 13/13 (already green this window) ·
DB pristine · `.env.example` verified.

---

## Completion record (session 55, delivered)

- **Gates**: lint 0/0 · tsc ✓ · **802/802 unit** (+9 — the resolver
  table, RED-first) · build ✓ · **264/264 E2E** (+6 — R55-A..E + G;
  the one session-40 input-family flake re-verified green isolated,
  the documented dialog-animation read under load).
- **Live verification**: the auth-boundary census re-run post-fix —
  **7/7 MATCH** (the pre-fix record: 1/7, the six DIFFs all closed:
  the root landing, the root serve, the root guard, the deep-route
  guard, the from_url round-trip, the logout carry) + standing
  audits **5/5** + route sweep **12/12** + **verify-r49 13/13** +
  **verify-r45 13/13** + both deploy sides QUIET (login
  `C2ujlke6`/`D5oCh2kx`, app `C-IrDy5f`/`BGNH4KkS` — no 21st login
  deploy this window).
- **The pin updates riding the fix**: the R51-A2 rewrite-scope pin
  extended (the root joined the closed rewrite family — the pin's
  no-wildcard intent intact), the session-47 signup-landing pin
  re-targeted to the root (the signup rides the same landing
  contract).
- **Screenshots**: 8 captures (the 246–249 pairs — the post-login
  root landing, the deep-link round-trip landing on /settings, the
  logout-carry login, the authed-/login stays) → 408 files in
  `docs/screenshots/`.
- **The push protocol held**: the code batch committed + pushed at
  the FIRST green stack (`a556781` via the ssh wrapper + the
  paramiko shim 5.0.0 on python3.13 + the explicit `--remote
  git@github.com:nordeim/eon-hr.git`; remote verified == HEAD; the
  operator key shredded), the screenshots/docs layer after.
- **Tooling lessons**: the auth-boundary walk (§65 — the journeys
  between surfaces are themselves a parity family); the in-place
  sign-in rule (a capture that re-opens /login fresh wipes the
  guard's from_url param — sign in AT the guard's landing when the
  round-trip is the evidence); the Host-header authority rule
  (standalone mode can spell the host differently in req.nextUrl
  than the browser requested — build the from_url on the Host
  header or the same-origin resolver silently rejects the
  round-trip); the oneLine eval rule re-hit.
