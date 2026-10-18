# Session 111 (2026-10-18) — parity round 54: the auth-boundary navigation walk

> The round-53 frontier said the mobile navigation surface is complete
> across both its static families (rounds 50–52) and its interaction
> family (round 53 — the full user journey paired live). This round's
> census took the §64 lesson to the family every prior round passed
> THROUGH but never measured: the **auth-boundary navigation walk** —
> the URL-level user journey at the session boundary. The pre-fix
> census found **1/7 MATCH — six genuine functional gaps, one
> family**; all six closed this round; the post-fix census re-run is
> **7/7 MATCH**. The deep-link round-trip (share a URL → sign in →
> land where you meant to go) now works identically on both apps.

## What the round delivered

- **The deploy watch: both sides QUIET** — login fingerprints
  `C2ujlke6`/`D5oCh2kx` unchanged (no 21st deploy), app fingerprints
  `C-IrDy5f`/`BGNH4KkS` unchanged. The confirmation ladder green:
  standing audits **5/5** + route sweep **12/12** + **verify-r49
  13/13** + **verify-r45 13/13**.
- **THE AUTH-BOUNDARY NAVIGATION WALK** (`scripts/r55-census.mjs`,
  seven paired phases, desktop 1440×900 — the boundary family is
  URL-level, viewport-independent). The pre-fix verdict: 1/7 MATCH,
  the six DIFFs:
  - **(A) The post-login landing**: REF lands on the ROOT `/` —
    which serves the dashboard content URL-unchanged (its SPA's
    index route maps to the dashboard page: headings, Quick
    Actions, Annual Leave identical to /dashboard); the clone
    landed at `/dashboard` (`router.replace("/dashboard")` since
    session 1 — never paired against REF's landing).
  - **(B) The root serve**: REF's `/` renders the dashboard with the
    URL staying at `/`; the clone's `/` was a server redirect to
    /dashboard (the URL bar changed).
  - **(C) The root guard**: REF's logged-out `/` bounces to
    `/login?from_url=https://eon.base44.app/` (the full root URL);
    the clone dropped the param entirely.
  - **(D) The deep-route guard**: REF's logged-out `/settings`
    carries the REQUESTED URL (`from_url=…/settings`); the clone's
    (app) layout guard hardcoded `from_url=/dashboard` for every
    route (App Router layouts receive no pathname — the param could
    never carry the real path).
  - **(E) The from_url round-trip**: signing in from (D)'s landing
    returns REF to `/settings` — the deep-link continuation; the
    clone landed at `/dashboard` (the hardcoded param) — the
    round-trip broke end-to-end.
  - **(F) The logout walk**: REF's logout lands at
    `/login?from_url=<the current page's URL>`; the clone's /logout
    redirected to a plain /login.
  - **(G) Authed /login**: both stay renderable (REF has no
    redirect-away guard) — the one MATCH.
- **The fixes** (all live-verified; post-fix census **7/7 MATCH**):
  - **The root rewrite** — `next.config.ts` gains
    `{ source: "/", destination: "/dashboard" }` (the session-51
    URL-unchanged-serve pattern's sibling); `src/app/page.tsx`
    removed (dead code under a beforeFiles rewrite).
  - **The edge proxy** — `src/proxy.ts` (NEW): Next 16's proxy.ts
    convention. Cookie-presence guard carrying
    `from_url=<the request's absolute URL>` built on the Host
    header (the browser's actual authority — `req.nextUrl`'s
    re-derived origin spells the host differently in standalone
    mode, and the login's same-origin resolver would silently
    reject the mismatched param). The (app) layout's full HMAC +
    DB verify stays as defense-in-depth for present-but-invalid
    cookies — the two-tier design.
  - **The resolver** — `src/lib/login-redirect.ts` (NEW):
    `resolveFromUrl(from, origin)`, the open-redirect guard.
    Path-form (leading `/`, not `//` or `/\`) passes; same-origin
    absolute URLs extract pathname + search; foreign origins,
    protocol-relative, backslash-leading, and garbage resolve to
    null — the login's default replace target became the ROOT.
  - **The logout carry** — `src/app/logout/route.ts`: the
    same-origin Referer rides as `from_url` (the user-menu logout
    navigates via `window.location.href` — the R35-A6 anti-prefetch
    contract — so the browser attaches the current page).
- **The pins**: R55-A..E + G (6 E2E in
  `tests/e2e/session55-auth-boundary.spec.ts`: the post-login ROOT
  landing, the root-serve URL-unchanged rewrite, the deep-link
  round-trip, the logout carry, the open-redirect guard, the
  authed-/login stays) + the 9-form resolver unit table
  (`tests/unit/login-redirect.test.ts`, RED-first TDD) + the R51-A2
  rewrite-scope pin extended (the root joined the closed rewrite
  family) + the session-47 signup-landing pin re-targeted to the
  root (the signup rides the same landing contract — the
  view-swapped login shares one URL).
- **The standing sweeps** (clean): the session-53 delta fresh-eyed
  (the R54-A pin + the comment fix — clean); the TW-v4 cross-checks
  (no new dynamic classes; `!important` confined to the documented
  blocks); the structural doc counts verified current (61 routes /
  54 API files / 47 models / 793 / 258 at round start, refreshed to
  802 / 264 this round). scandihaven (the tech-stack model)
  unchanged since Oct 4 (remote HEAD `d4789c3`).

## Gates

lint 0/0 · tsc ✓ · **802/802 unit** (+9 — the resolver table) ·
build ✓ · **264/264 E2E** (+6 — the one session-40 input-family
flake re-verified green isolated, the documented dialog-animation
read under load) · standing audits 5/5 · route sweep 12/12 ·
verify-r49 13/13 · verify-r45 13/13 · the auth-boundary census
record (pre-fix 1/7 → post-fix **7/7 MATCH**) · DB pristine (the
loading-probe user swept) · `.env.example` verified.

## The round's tooling lessons

- **The auth-boundary walk** (§65): the census frontier is not just
  surfaces — the JOURNEYS BETWEEN surfaces (sign-in, guard, logout)
  are themselves a parity family, and every prior round passed
  through them unmeasured. URL-level parity is functional parity.
- **The in-place sign-in rule**: a capture that re-opens `/login`
  fresh WIPES the guard's from_url param — round-trip evidence
  requires signing in AT the guard's landing URL (the same class as
  the §64 visible-link rule: the instrument's navigation must
  preserve the state it measures).
- **The Host-header authority rule**: standalone mode can spell the
  host differently in `req.nextUrl` than the browser requested
  (localhost vs 127.0.0.1) — build redirect targets and from_url
  params on the Host header, or the same-origin resolver silently
  rejects the round-trip.
- **The oneLine eval rule re-hit**: multi-line eval expressions fail
  on the literal `\n` between tokens — one-line every expression
  before `JSON.stringify`.

## Frontier after this round

The parity surface holds with both deploy sides quiet (the login
watch stays armed at 20 deploys). The auth-boundary navigation
family — the post-login landing, the root serve, the guard's
deep-link carry, the round-trip, the logout carry, the
open-redirect-guarded resolver — is now censused AND pinned (the
family the security surface lives on: the parity fix and the
hardening landed together). The watch items: the login build stays
under ACTIVE development; the with-data superset surfaces (payroll
records, staff requests tables, the payrollreports tax/history
panels) stay REF-unmeasurable at the shared demo's zero state; the
byte-parity backlog remains documented-allowance territory.
