# Remediation plan — session 56 (parity round 55)

> The round-54 frontier said the auth-boundary navigation family is
> censused and pinned. This round's census took the §65 lesson to the
> next journey layer — the **history stack's walks** (back, forward,
> scroll restore, the drawer journey, the tab journey) — plus the
> **read-only surface family** the mobile-grid reconnaissance surfaced.
> All contracts live-measured this window (REF @1440×900 + 390×844 vs
> the seeded LOC :3200 standalone, `scripts/r56-census.mjs`).

## The round's context

- Workspace continued from `a720c84` (git pull brought the owner's
  session_112 journal — docs-only on the landed round-54). Environment
  verified intact (`.env` with `DATABASE_URL="file:../db/custom.db"` +
  AUTH_SECRET, db seeded, playwright chromium). Baseline gates ALL
  GREEN: lint 0/0 · tsc ✓ · 802/802 unit · build ✓ · 264/264 E2E (no
  flakes this window).
- The skills audit (Phase 2): the session-55 delta fresh-eyed
  (`src/proxy.ts`, `src/lib/login-redirect.ts`, the logout route, the
  login resolver wiring — clean, conventions hold); the standing TW-v4
  sweeps (!important confined to the documented blocks; template-string
  classes interpolate pre-authored static constants); the structural
  doc counts verified current (61 routes / 54 API files / 47 models /
  802 / 264). scandihaven (the tech-stack model) unchanged since Oct 4
  (remote HEAD `d4789c3`).
- The deploy watch: **both sides QUIET** — login fingerprints
  `C2ujlke6`/`D5oCh2kx` unchanged (no 21st deploy), app fingerprints
  `C-IrDy5f`/`BGNH4KkS` unchanged. The confirmation ladder green:
  standing audits **5/5** + route sweep **12/12** + **verify-r49
  13/13** + **verify-r45 13/13**.

## THE HISTORY JOURNEY WALK (the census record — 6/9 MATCH)

The round's fresh paired-live census (`scripts/r56-census.mjs`,
desktop 1440×900 + the mobile drawer phase at 390×844):

- **(A) The simple back** (root → sidebar leaf → back): URL, content,
  and the active leaf (the `rgb(24, 119, 242)` sidebar contract)
  restore identically — **MATCH**.
- **(B) The forward restore**: identical — **MATCH**.
- **(C) The two-deep chain** (root → /staffrequests → /settings →
  back ×2): REF unwinds both entries (landing back on the root);
  **the clone CORRUPTS the stack — a genuine functional divergence
  (see R56-E below: a Next.js 16.4.0 framework bug, root-caused this
  round with the Navigation API evidence, 5/5 deterministic).**
- **(D) The scroll restoration on back**: both apps restore in steady
  state (the probe8 3-run arrays: REF [0,40,40], LOC [40,40,40] —
  REF's FIRST popstate after a fresh load can reset to top, the SPA
  initial-mount scroll race — non-deterministic on REF's side, not a
  contract). **MATCH on the steady-state contract.**
- **(E) The settings tab journey** (Departments tab → nav away →
  back): both reset to the Company tab — component state does not
  survive popstate on either side — **MATCH**.
- **(F) The /Dashboard casing**: both serve `/Dashboard` URL-unchanged
  and both restore the casing after back — **MATCH** (the session-51
  contract holds through history navigation).
- **(G) The mobile drawer journey** (390×844: drawer open → Training
  leaf → back): REF keeps the drawer open through the leaf tap AND the
  back; the clone closes it — **the documented session-10 deviation
  (the clone's auto-close is the superset), re-verified live through
  its back-navigation extension.**
- **(H)/(I)/(J) The read-only surface census** — see the findings
  below: **3 real visual gaps, one family.**

## THE FINDINGS (all live-measured)

### A. THE READ-ONLY SURFACE FAMILY (4 real gaps — the round's fix targets)

**R56-A — the settings Company Information tiles** (desktop + mobile):
REF renders the 9 read-only tiles as `p-4 bg-slate-50 rounded-lg`
(computed bg `rgb(248, 250, 252)`, radius 8px) with the **Address
tile carrying an UNPREFIXED `col-span-2`** — the always-on span that
forces the implicit 2-column grid at every width (at 390px the grid
computes 2 content-sized tracks; at desktop the Address row spans
full-width and Tax ID/Registration Number share the last row). The
clone renders plain `p-4` tiles with no span — transparent
background, 0px radius, and a single 921px column at mobile (the
~400px-taller stacked layout). **The longest-lived gap of the family:
the session-14 pin (R13-B) pinned the grid + label classes but never
the tile interiors; the desktop censuses measured the card geometry
(631px card, the header, the Edit button) but never the tile-level
computed background.**

**R56-B — the profile General tab's Email field**: REF renders the
identity email as a **disabled input with an authored `bg-slate-50`**
(read-only: `disabled: true`, computed bg `rgb(248, 250, 252)`); the
clone renders it fully editable. The session-15 pin checked the
4-field set + the General default, never the per-field disabled/bg
interiors.

**R56-C — the profile General tab's Phone/Job Title placeholders**:
REF renders both fields empty with NO placeholders; the clone carries
authored placeholders (`+65 87651230`, `Operations Manager`) that
show on the empty seeded demo user — never REF-verified (an early
build authoring).

**R56-D — the hrreports thead row**: REF's table header row carries
`border-b bg-slate-50` (computed bg `rgb(248, 250, 252)`); the clone
renders the shadcn default (transparent + hover tint classes). The
session-13/23 pins covered the 33px uppercase th and the
header-only-at-zero contract, never the thead row's own background.

### B. THE HISTORY-STACK CORRUPTION (R56-E — a Next.js framework bug, recorded not fixed)

**The empirical contract** (root-caused with the Navigation API entry
dumps, 5/5 deterministic, `scripts/r56-probe8.mjs` + the entries
evolution capture): after a **full document load of ANY (app) route**
(the root, /dashboard, /compliance — the beforeFiles rewrite is
innocent, verified with plain routes), the **second consecutive
client-side navigation** triggers the Next router to replace the
fresh-loaded entry's URL with a duplicate of the entry below it:

```
after goto /:        ["/profile", "/"]
after click 1:       ["/profile", "/", "/staffrequests"]   // push ✓
after click 2:       ["/profile", "/profile", "/staffrequests", "/training"]  // ← the / entry replaced by a /profile duplicate
```

The user-visible effect: back-back after landing on a page and
clicking two links **skips the page they landed on** (back2 lands on
the pre-load page). REF's SPA never corrupts the stack (the census
A-B-C matched REF's model every time). The clone's own code performs
no history manipulation (verified: no `router.replace`/`push`/
`replaceState` in the shell, the dashboard, or the (app) layout —
the corruption happens inside Next 16.4.0's router commit). **Not
fixable in-app without hand-patching framework internals; the
follow-up is the Next upgrade watch** (a dedicated upgrade round
with a full re-census, per the parity discipline). The E2E layer
pins the CORRECT one-click contract (back after a fresh load + one
client navigation returns to the loaded page — which passes today),
and the census record + the repro script keep the pressure on.

### C. The recorded non-gaps (the honest accounting)

- The scroll-restoration family: steady-state parity; REF's
  first-popstate reset is a non-deterministic SPA quirk (measured
  [0,40,40] across 3 runs), not a contract — no change.
- The mobile drawer retention: the documented session-10 deviation
  (the clone's auto-close = the superset), re-verified through the
  back-navigation extension — no change.
- The settings-page horizontal overflow at 390 (docW 1003, driven by
  the 971px 7-tab strip): **identical on both apps** — the shared
  reference behavior, not a gap.

## The remediation (TDD — red first, then the fixes)

| ID | Fix | File(s) | Pin |
|----|-----|---------|-----|
| R56-A | The 9 Company tiles → `p-4 bg-slate-50 rounded-lg`; the Address tile gains the always-on `col-span-2` | `src/app/(app)/settings/page.tsx` | unit (the R13-B recipe update) + E2E computed (bg/radius/span + the mobile 2-track grid) |
| R56-B | The Email input → `disabled` + `className="mt-2 bg-slate-50"` | `src/app/(app)/profile/page.tsx` | unit + E2E computed (disabled + bg) |
| R56-C | Remove the Phone/Job Title placeholders | `src/app/(app)/profile/page.tsx` | unit (negative) + E2E |
| R56-D | The hrreports thead row → a plain `<tr className="border-b bg-slate-50">` (REF's exact DOM — no hover tint on the header row) | `src/app/(app)/hrreports/page.tsx` | unit + E2E computed (bg) |
| R56-E | No code change — the framework-bug record (this document + the census record + the AGENTS layer); the E2E pins the 1-click back contract; the repro script (`scripts/r56-probe8.mjs`) becomes the standing detector | — | E2E (the 1-click back pin) |

The E2E layer lands as `tests/e2e/session56-readonly-family.spec.ts`
(computed-truth pins, the r52 method: assert the computed result, not
the class-list bytes) and the unit pins extend the existing
`tests/unit/recipes.test.ts` sections (the settings/profile/hrreports
recipe families — updating the R13-B/R13-C pins to the full measured
contracts).

## Validation

- The plan validates against the codebase: the four fix targets are
  the exact live-measured surfaces; no existing pins assert the OLD
  tile/input/thead classes (the R13-B pin asserts the grid + labels —
  extendable; no pin covers the placeholders; the hrreports th pins
  are orthogonal to the thead row).
- Post-fix: the full gate stack (lint → tsc → 802+ unit → build →
  264+ E2E) + the census re-run (expected: (H)/(H-m)/(I)/(J) →
  MATCH; (C) stays the recorded framework-bug DIFF; (G) stays the
  documented deviation).

## Completion record (2026-10-18, end of session 56)

All four fix-target findings closed with TDD (RED → GREEN), the full
gate stack green, and the post-fix census re-run at the target:

- **R56-A ✓** — the settings Company tiles: `p-4 bg-slate-50
  rounded-lg` on all 9 tiles + the Address tile's always-on
  `col-span-2` (`src/app/(app)/settings/page.tsx`). The desktop
  computed truth now matches REF (bg rgb(248,250,252), 8px radius,
  the span map `------SPAN--`), and the mobile grid computes 2
  content-sized tracks at 390 (the census (H) + (H-m) MATCH).
- **R56-B ✓** — the profile identity Email: `disabled` +
  `className="mt-2 bg-slate-50"` (census (I) MATCH).
- **R56-C ✓** — the Phone/Job Title placeholders removed (census (I)
  MATCH).
- **R56-D ✓** — the hrreports thead: the plain
  `<tr className="border-b bg-slate-50">` (census (J) MATCH; the
  R22-E pin's 500-char window accommodated by shortening the code
  comment, not by weakening the pin).
- **R56-E — RECORDED, not fixed (by design)**: the Next.js 16.4.0
  history-stack corruption stands documented (§B above + the AGENTS
  session-56 layer + the census record); the E2E pins the correct
  one-click back contract (which holds —
  `tests/e2e/session56-readonly-family.spec.ts` R56-E), and
  `scripts/r56-probe8.mjs` remains the standing detector for the
  upstream fix (the Next upgrade watch). One accuracy note for the
  record: the corruption reproduced 5/5 in the isolated probe shape
  and in 2 of 3 pre-fix census runs, but the post-fix census's (C)
  phase happened to walk clean (the trigger is
  navigation-timing-dependent inside the router commit) — the bug is
  real, deterministic in its isolated shape, and intermittent under
  census cadence; the recorded contract stands.

Gates at completion: lint 0/0 · tsc ✓ · **806/806 unit** (+4 — the
R56-A..D recipe pins, RED-first) · build ✓ · **269/269 E2E** (+5 —
the R56-A..E computed-truth spec) · post-fix census **10/11 MATCH**
(the one DIFF = the documented session-10 drawer deviation) · DB
pristine · `.env.example` verified. Code batch pushed at `41313c3`
(ssh wrapper, remote verified, operator key shredded); this docs
layer rides the follow-up commit.
