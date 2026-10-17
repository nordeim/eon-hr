# Session 107 (2026-10-18) — parity round 52: the 20th-deploy re-audit + the bottom-nav active-state family

> The round-51 frontier said the parity surface holds through the 19th
> login deploy with the registry tripwire pinned and the mobile nav
> fully censused. This round's census re-armed the live edges through a
> **20TH login deploy — the first to change BOTH chunks** — and
> completed the called-out mobile-nav surface's state family: the
> bottom bar's active-tab truth paired across ALL FIVE tab routes
> (rounds 50/51 measured /dashboard only). No real gaps surfaced; the
> state family is pinned.

## What the round delivered

- **THE 20TH LOGIN DEPLOY — both chunks changed** (JS `CimHfPLG` →
  `C2ujlke6`, CSS `CpjiugAb` → `D5oCh2kx` — the first CSS churn in
  ~15 deploys; app fingerprints `C-IrDy5f`/`BGNH4KkS` unchanged) —
  verify-r45 re-audited standalone: **13/13 MATCH**. App side quiet
  through the deploy: standing audits **5/5** + route sweep **12/12**
  + **verify-r49 13/13** (the confirmation ladder).
- **THE NAV-REGISTRY DRIFT RE-CHECK** (the strongest re-read
  justification yet — both chunks churned): BOTH sides' complete
  desktop trees re-read live (all groups expanded, 1440×900): **52
  entries each — 10 group triggers + 44 leaves — labels, hrefs, and
  order all MATCH**. Zero drift through the 20th deploy; the R52-A1/A2
  tripwires remain the standing guard.
- **THE BOTTOM-NAV ACTIVE-STATE FAMILY** (the called-out surface's
  last state gap): all five tab routes paired live at 390×844 — each
  route highlights exactly its own tab (Home/Staff/Tasks/Attendance/
  Profile), the active tab computing `rgb(37,99,235)` on the
  `rgb(239,246,255)` pill, the siblings `rgb(71,85,105)` on
  transparent, icons tracking their labels — identical both sides on
  all five routes. **Pinned** (R53-A): the E2E test walking the four
  unpaired tab routes — the active-matching logic (pathname === href,
  exact) is now guarded per-route, not per-recipe.
- **The audit's small fix**: the vitest.config.ts header comment still
  carried another project's domain list ("router, clarify questions,
  plan sanitizer, check-in mapping" — the task-management heritage);
  aligned to the real unit seams. No behavior change.
- **The standing sweeps** (clean): the session-52 delta fresh-eyed
  (the R52 pins — clean); the TW-v4 cross-checks (bare `border` safe
  via the base-layer pin; template-string classes interpolate
  pre-authored static constants; `!important` confined to the
  documented globals.css blocks); the structural doc counts verified
  current (61 routes / 54 API files / 47 models / 793 / 256 — the
  round-51 refresh holds).

## Gates

lint 0/0 · tsc ✓ · **793/793 unit** (unchanged) · build ✓ ·
**257/257 E2E** (+1 — R53-A) · verify-r45 13/13 (the 20th deploy) ·
standing audits 5/5 · route sweep 12/12 · verify-r49 13/13 · the
registry + active-state-family census records pinned · DB pristine
(the loading-probe user swept) · `.env.example` verified.

## The round's tooling lessons

- **The per-route state-family census** (§63): when a state recipe is
  route-dependent (the active tab), census the family across EVERY
  route that exhibits it, not just the first; pin the family as a
  route-walking E2E test so the active-matching logic is guarded
  per-route.
- **The both-chunks deploy lesson**: a login deploy that changes BOTH
  the JS and the CSS justifies re-reading every registry-shaped
  surface the deploy could touch, even when the app-side fingerprints
  are quiet — the hash-change scare converts into a census record
  (52-entry tree re-read, zero drift).

## Frontier after this round

The parity surface holds through the 20th login deploy (the registry
re-verified drift-free, the bottom-nav state family censused and
pinned — the mobile navigation surface is now complete: at-rest
chrome, panel/footer, expanded-group interiors, and the per-route
active-state family). The watch items: the login build stays under
ACTIVE development (20 deploys); the with-data superset surfaces
(payrollmodule's existing records, staffrequests' table, the
payrollreports tax/history/custom panels) stay REF-unmeasurable at the
shared demo's zero state; the byte-parity backlog remains
documented-allowance territory (no rendered delta).
