# Session 109 (2026-10-18) — parity round 53: the mobile-nav interaction walk

> The round-52 frontier said the parity surface holds through the 20th
> login deploy with the mobile navigation surface complete across its
> static families (at-rest chrome, panel/footer, expanded-group
> interiors, per-route active states). This round's census took the
> user-called-out surface to its deepest level: the **full user
> journey paired live at 390×844** — hamburger tap → drawer open →
> group expansion → leaf tap → overlay close → bottom-tab tap. No new
> gaps; the one interaction divergence found is the long-documented
> reference regression (the drawer auto-close), re-verified live 43
> rounds after its session-10 discovery.

## What the round delivered

- **The deploy watch: both sides QUIET** — login fingerprints
  `C2ujlke6`/`D5oCh2kx` unchanged (no 21st deploy), app fingerprints
  `C-IrDy5f`/`BGNH4KkS` unchanged. The confirmation ladder re-run
  green: standing audits **5/5** + route sweep **12/12** +
  **verify-r49 13/13** + **verify-r45 13/13**.
- **THE MOBILE-NAV INTERACTION WALK** (`scripts/r54-census.mjs`,
  both apps at 390×844, seven paired phases):
  - (A) the at-rest chrome (hamburger 28×28 + the 5-tab 78px bar):
    **MATCH**.
  - (B) the hamburger tap's settled drawer family (overlay
    rgba(0,0,0,0.8), panel 288px / rgb(250,250,250) / border-r
    rgb(229,229,229), transform settled — computed-truth only; the
    panel class bytes are the documented construction allowance):
    **MATCH**.
  - (C) the drawer's DEFAULT group-state map (all 9 aria-controls
    triggers collapsed — the 8 nav groups + the footer bell):
    **MATCH**.
  - (D) the Payroll group expansion round-trip (aria flip + the 5
    sub-item labels/hrefs): **MATCH**.
  - (E) **the leaf-tap round-trip — the ONE interaction divergence**:
    REF navigates to /training and KEEPS the drawer open
    (`data-state="open"` at 500ms and 1900ms, real CDP clicks); the
    clone navigates and CLOSES it (GONE by 500ms). This is the
    **documented reference regression** found at session 10/11 (3/3
    trials then; the SKILL §21 deviation list: "the drawer
    auto-closes on navigation (the redeployed reference's stays
    open)"), re-verified live 43 rounds and 20 login deploys later.
    The deviation direction is kept deliberately: the clone's
    auto-close is the superset (standard mobile UX + the
    pathname-change effect covering the browser-back edge).
  - (F) the overlay tap (the FULL pointerdown/up sequence — Radix
    ignores bare click() dispatches): **MATCH** — closes both sides.
  - (G) the bottom-tab tap + the active computed pair (Staff
    blue-600 on the blue-50 pill, Home slate-600 on transparent):
    **MATCH**.
  - **Verdict: 7/9 MATCH, the 2 DIFFs both being the documented
    deviation — no new gaps.**
- **The pin (R54-A)**: the drawer's default collapsed-group map E2E
  guard — all 8 nav group triggers + the footer bell render
  `aria-expanded="false"` at first open, the collapsed groups'
  sub-item leaves hidden. The full-menu pin asserts the 13 labels
  render but not the collapsed-default contract; a nav refactor that
  pre-expands groups would pass every standing pin while changing the
  drawer's at-rest interior.
- **The comment fix**: the drawer-geometry E2E test's "(closing
  happens via overlay tap / Esc / navigation)" line implied
  navigation-close is universal REF behavior — now cites the
  documented deviation (the session-10 regression + this round's
  re-verification) so future agents don't treat the clone's superset
  as a parity contract to "fix" backward.
- **The standing sweeps** (clean): the session-53 delta fresh-eyed
  (the R53-A route-walking pin + the vitest.config comment — clean);
  the TW-v4 cross-checks (template-string classes interpolate
  pre-authored static constants; `!important` confined to the
  documented globals.css blocks); the structural doc counts verified
  current (61 routes / 54 API files / 47 models / 793 / 257 — the
  round-52 refresh holds, zero drift this round). scandihaven (the
  tech-stack model) unchanged since Oct 4.

## Gates

lint 0/0 · tsc ✓ · **793/793 unit** (unchanged) · build ✓ ·
**258/258 E2E** (+1 — R54-A) · standing audits 5/5 · route sweep
12/12 · verify-r49 13/13 · verify-r45 13/13 · the interaction-walk
census record (7/9 + the documented deviation re-verified) · DB
pristine (the loading-probe user swept) · `.env.example` verified.

## The round's tooling lessons

- **The interaction-walk census** (§64): when a surface's static
  families are all pinned, the next frontier is the full user
  journey (open → expand → navigate → dismiss) — the interaction
  family is where never-paired-live divergences hide.
- **The visible-link rule**: a raw selector click hits the FIRST DOM
  match — on the clone that's the hidden desktop-sidebar copy (DOM
  order differs between the platforms); filter for visibility before
  clicking, or the instrument silently measures nothing.
- **The symmetric-settling rule**: paired reads must settle for the
  same delay after their dispatches — the mid-exit read is a false
  DIFF.
- **The Radix overlay rule**: the Dialog outside-close contract
  listens for pointerdown/up, not bare click() — synthetic overlay
  taps need the full pointer sequence.

## Frontier after this round

The parity surface holds with both deploy sides quiet (login watch at
20 deploys). The mobile navigation surface is now censused across
BOTH its static families (rounds 50–52) AND its interaction family
(this round — the full user journey paired live, the at-rest
collapsed map pinned). The watch items: the login build stays under
ACTIVE development (20 deploys); the with-data superset surfaces
(payrollmodule's existing records, staffrequests' table, the
payrollreports tax/history/custom panels) stay REF-unmeasurable at
the shared demo's zero state; the byte-parity backlog remains
documented-allowance territory (no rendered delta).
