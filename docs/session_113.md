# Session 113 (2026-10-18) — parity round 55: the history journey walk + the read-only surface family

> The round-54 frontier said the auth-boundary navigation family is
> censused and pinned. This round's census took the §65 lesson to the
> next journey layer — the **history stack's walks** (back, forward,
> scroll restore, the drawer journey, the tab journey) — plus the
> **read-only surface family** the mobile-grid reconnaissance
> surfaced. Pre-fix: **5/11 MATCH** — four real visual gaps in REF's
> `bg-slate-50` read-only recipe, plus the history-stack corruption
> root-caused as a Next.js framework bug (recorded, not fixed).
> Post-fix census: **10/11 MATCH** — the one DIFF is the documented
> session-10 drawer deviation.

## What the round delivered

- **The deploy watch: both sides QUIET** — login fingerprints
  `C2ujlke6`/`D5oCh2kx` unchanged (no 21st deploy), app fingerprints
  `C-IrDy5f`/`BGNH4KkS` unchanged. The confirmation ladder green:
  standing audits **5/5** + route sweep **12/12** + **verify-r49
  13/13** + **verify-r45 13/13**.
- **THE HISTORY JOURNEY WALK** (`scripts/r56-census.mjs`, seven
  paired phases at 1440×900 + the mobile drawer phase at 390×844):
  the simple back, the forward restore, the two-deep chain, the
  scroll restoration (3-run arrays — the steady-state contract), the
  settings tab journey, the /Dashboard casing, and the mobile drawer
  journey. 6/7 walk contracts MATCH — including the scroll family
  (both apps restore in steady state; REF's FIRST popstate after a
  fresh load can reset to top, the SPA initial-mount race,
  non-deterministic [0,40,40] — not a contract) and the tab journey
  (both reset to the default tab — component state never survives
  popstate on either side). The mobile drawer journey is the
  documented session-10 deviation re-verified through its
  back-navigation extension (REF keeps the drawer open through the
  leaf tap AND the back; the clone closes — the superset).
- **R56-E — THE HISTORY-STACK CORRUPTION** (the census's two-deep
  chain DIFF, root-caused with the Navigation API entry dumps):
  after a **full document load of any (app) route**, the **second
  consecutive client-side navigation** replaces the fresh-loaded
  entry's URL with a duplicate of the entry below it —
  `["/profile", "/"]` → click → `["/profile", "/", "/staffrequests"]`
  → click → `["/profile", "/profile", "/staffrequests", "/training"]`.
  The user loses the page they landed on (back-back skips it). 5/5
  deterministic in the isolated repro (`scripts/r56-probe8.mjs`),
  generic across routes (the beforeFiles rewrite is INNOCENT —
  verified with plain /compliance and /dashboard loads); the clone's
  own code performs no history manipulation — a **Next.js 16.4.0 App
  Router framework bug**. Recorded with the evidence trail in
  `docs/remediation-plan-session56.md` §B; the E2E pins the CORRECT
  one-click back contract, and the repro script stays the standing
  detector for the framework fix (the Next upgrade watch).
- **THE READ-ONLY SURFACE FAMILY** (the supplementary census — four
  real visual gaps in REF's `bg-slate-50` recipe, ALL closed with
  TDD):
  - **R56-A — the settings Company Information tiles**: the 9
    read-only tiles now render `p-4 bg-slate-50 rounded-lg`
    (computed `rgb(248,250,252)` + 8px) with the **Address tile's
    UNPREFIXED `col-span-2`** — the always-on span that forces the
    2-track implicit grid below md (REF at 390px computes 2
    content-sized tracks; the clone had a single stacked 921px
    column). The longest-lived gap of the family: the session-14
    pin (R13-B) covered the grid + label classes, never the tile
    interiors — 42 rounds of green gates over a visible divergence.
  - **R56-B — the profile identity Email**: the disabled +
    `bg-slate-50` read-only field (REF live-measured; the clone
    rendered it fully editable — the profile save still carries the
    unchanged value).
  - **R56-C — the profile Phone/Job Title placeholders**: removed —
    REF renders both empty fields bare (the placeholders were an
    early-build authoring, never REF-verified).
  - **R56-D — the hrreports thead row**: a plain
    `<tr className="border-b bg-slate-50">` (REF's computed
    `rgb(248,250,252)` 33px inert header; the clone rode the shadcn
    hover-tinted TableRow default).
- **The pins**: R56-A..E (5 E2E in
  `tests/e2e/session56-readonly-family.spec.ts` — computed-truth:
  the tiles' bg/radius/span map, the mobile 2-track grid, the Email
  disabled+bg, the absent placeholders, the thead bg, the one-click
  back) + 4 unit pins (the R56-A..D recipe family in
  `tests/unit/recipes.test.ts`, RED-first).
- **The standing sweeps** (clean): the session-55 delta fresh-eyed
  (src/proxy.ts, the resolver, the logout route — clean); the TW-v4
  cross-checks (!important confined to the documented blocks);
  the structural doc counts verified current (61 routes / 54 API
  files / 47 models / 802 / 264 at round start, refreshed to
  806 / 269 this round). scandihaven (the tech-stack model)
  unchanged since Oct 4 (remote HEAD `d4789c3`).

## Gates

lint 0/0 · tsc ✓ · **806/806 unit** (+4) · build ✓ · **269/269 E2E**
(+5 — the session56 spec) · standing audits 5/5 · route sweep 12/12 ·
verify-r49 13/13 · verify-r45 13/13 · the history-journey + read-only
census record (pre-fix 5/11 → post-fix **10/11 MATCH**, the one DIFF
the documented drawer deviation) · DB pristine (the loading-probe
user swept) · `.env.example` verified.

## The round's tooling lessons

- **The Navigation API rule** (§66): `navigation.entries()` is the
  ground truth for history-stack forensics — the URL bar and
  `history.length` cannot distinguish a replaced entry from a
  truncated one (a corrupted stack LOOKS like a stuck back button).
- **The viewport-verification rule**: verify `window.innerWidth` in
  the same session before mobile-grid measurements —
  `agent-browser set viewport` failures are silent and the default
  viewport is ~1280 (a "mobile" census that never re-settles
  measures desktop widths and invents phantom divergences).
- **The sub-threshold-interior lesson**: a surface's STATIC pin can
  pass while its tile-level computed truth diverges — the R13-B pin
  asserted the grid container and never the tile interiors. When a
  divergence hides below the measurement threshold, the fix is the
  computed-truth method applied one level deeper, not a new census
  family.
- **The raw-comparison rule**: the census `ev()` wrapper's
  ERR-strings still compare soundly (agent-browser returns raw
  objects unquoted and string values quoted — the double-parse
  ERR-wraps half the returns; compare the RAW forms, not extracted
  fields).

## Frontier after this round

The parity surface holds with both deploy sides quiet (the login
watch stays armed at 20 deploys). The history journey family is
censused — the walk contracts pinned, the framework-bug corruption
root-caused with the evidence trail and the standing detector. The
read-only recipe family is restored on all four surfaces. The watch
items: the Next.js 16.4.0 history bug (the upgrade watch — the one
recorded functional divergence whose fix lives upstream), the login
build stays under ACTIVE development, the with-data superset
surfaces stay REF-unmeasurable at the shared demo's zero state, and
the byte-parity backlog remains documented-allowance territory.
