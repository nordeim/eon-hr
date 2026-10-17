# Remediation plan — session 54 (parity round 53)

> The round-52 frontier said the parity surface holds through the 20th
> login deploy with the registry tripwire pinned and the mobile
> navigation surface complete across its STATIC families (at-rest
> chrome, panel/footer, expanded-group interiors, per-route
> active states). This round's census took the user-called-out
> surface to its deepest level: the **mobile-nav full interaction
> walk** — the complete user journey paired live at 390×844 (hamburger
> tap → drawer opens → group expansion → leaf tap → overlay close →
> bottom-tab tap). No new gaps surfaced; the one interaction
> divergence found is the long-documented reference regression
> (the drawer auto-close), re-verified live 43 rounds after its
> session-10 discovery. All contracts live-measured this window (REF
> @390×844 vs the seeded LOC :3200 standalone).

## The round's context

- Fresh clone to `aad1e74` (the owner's session_108 journal — the
  session-53 process log, docs-only on the landed round-52 `dc2201c`).
  Environment rebuilt (bun install, .env with
  `DATABASE_URL="file:../db/custom.db"` + a generated AUTH_SECRET,
  db:push + db:seed with DATABASE_URL unset inline, playwright
  chromium). Baseline gates ALL GREEN: lint 0/0 · tsc ✓ · 793/793
  unit · build ✓ · 257/257 E2E (no flakes this window).
- The skills audit (Phase 2): the session-53 delta fresh-eyed (the
  R53-A route-walking pin + the vitest.config comment alignment —
  clean, conventions hold); the standing TW-v4 sweeps (template-string
  classes interpolate pre-authored static constants — the
  statusChipClassName literal-branch family; `!important` confined to
  the documented globals.css blocks; the bare `border` safe via the
  base-layer pin) — no findings; the structural doc counts verified
  current (61 routes / 54 API files / 47 models / 793 / 257 — the
  round-52 refresh holds, zero drift this round).
- The deploy watch: **both sides QUIET** — login fingerprints
  `C2ujlke6`/`D5oCh2kx` unchanged (no 21st deploy), app fingerprints
  `C-IrDy5f`/`BGNH4KkS` unchanged. The standing audits 5/5 + route
  sweep 12/12 + verify-r49 13/13 + verify-r45 13/13 (the full
  confirmation ladder, all green).
- scandihaven (the tech-stack model repo) unchanged since Oct 4 —
  no new patterns to absorb.

## The findings (all live-measured)

### A. The mobile-nav INTERACTION WALK (verified-matching — the census record)

The round's fresh paired-live census (`scripts/r54-census.mjs`,
both apps at 390×844, self-contained orchestrator):

- **(A) The at-rest chrome**: MATCH (hamburger 28×28 with the
  sr-only "Toggle Sidebar" label, the 5-tab bottom bar, 78px).
- **(B) The hamburger tap → drawer open**: MATCH on the computed
  family (overlay rgba(0,0,0,0.8), panel 288px / rgb(250,250,250) /
  border-r rgb(229,229,229), transform settled). The panel class-list
  bytes differ (REF concatenates the shadcn Sheet base; the clone
  hand-authors the geometry) — the documented class-construction
  allowance family (the r52 cn()-merge lesson: pin the computed
  cascade, never the bytes).
- **(C) The drawer's default group-state map**: MATCH — all 9 group
  triggers render `aria-expanded="false"` at first open, both sides.
- **(D) The Payroll group expansion round-trip**: MATCH (the trigger
  flips to `aria-expanded="true"`, the 5 sub-items render with
  labels+hrefs identical).
- **(E) The leaf-tap round-trip**: the ONE interaction divergence —
  REF navigates to /training and **keeps the drawer open**
  (data-state="open" at 500ms and 1900ms); the clone navigates and
  **closes the drawer** (GONE by 500ms). This is the **documented
  reference regression** found at session 10/11 (3/3 trials then;
  the SKILL's §21 documented-deviations list: "the drawer
  auto-closes on navigation (the redeployed reference's stays
  open)") — re-verified live this round, 43 rounds and 20 login
  deploys later. The deviation direction is kept deliberately (the
  clone's behavior is the superset — standard mobile UX; the clone
  also closes the drawer on pathname change, covering the
  browser-back edge REF leaves the drawer open through).
- **(F) The overlay tap (full pointerdown/up sequence — Radix
  ignores bare click() dispatches)**: MATCH — closes on both sides.
- **(G) The bottom-tab tap**: MATCH — lands on /employees with the
  active computed pair (Staff blue-600 on the blue-50 pill, Home
  slate-600 on transparent) identical both sides.

**Verdict: 7/9 MATCH, the 2 DIFFs both being finding (E) — the
long-documented deviation, not a new gap.** The mobile navigation
surface is now censused across BOTH its static families (rounds
50–52) AND its interaction family (this round).

### B. The instrument lessons (the r54 orchestrator's two false DIFFs)

- **The visible-link rule**: a raw selector click
  (`a[href="/training"]`) hits the FIRST DOM match — on the clone
  that's the hidden desktop-sidebar copy (DOM order differs between
  the platforms; REF's drawer portal precedes its sidebar). The fair
  instrument finds the visible link (`offsetParent !== null`) before
  clicking. A census that navigates via drawer links must filter for
  visibility or scope to the drawer's own container.
- **The symmetric settling rule**: the overlay-close phase's first
  draft read REF ~1.2s after its dispatch but LOC ~0ms after (mid
  exit-animation) — a false DIFF. Both reads must settle for the
  same delay after their respective dispatches.

### C. The E2E comment misattribution (REAL fix — small alignment)

`tests/e2e/mobile-navigation.spec.ts`'s drawer-geometry comment
says "(closing happens via overlay tap / Esc / navigation)" —
implying navigation-close is universal REF behavior. The truth:
overlay tap and Esc close on both sides, but navigation-close is
the **clone's documented superset** (REF regressed at session 10;
re-verified this round). The comment is updated to cite the
documented deviation so future agents don't treat the clone's
superset as a parity contract to be "fixed" backward.

### D. The drawer's default group-state map (pinned — R54-A)

The at-rest drawer's 9 group triggers all render collapsed. The
existing "hamburger opens the drawer with the full menu" pin asserts
the 13 top-level labels are visible but NOT the collapsed-default
contract — a future nav refactor that pre-expands groups (or a
Radix/shadcn default-open drift) would pass every standing pin
while changing the drawer's at-rest interior. **Pinned (R54-A)**:
an E2E test asserting all 9 group triggers compute
`aria-expanded="false"` at first open (the census-verified both-sides
state).

## The fixes (file map)

1. `tests/e2e/mobile-navigation.spec.ts` — R54-A: the drawer's
   default group-state map pin (9 triggers, aria-expanded="false"
   at first open) + the (C) comment correction citing the
   documented deviation.
2. `scripts/r54-census.mjs` — the round's census orchestrator
   (persisted: the interaction-walk instrument with the two lessons
   baked in).
3. `AGENTS.md` — the session-54 layer.
4. `eon-hr_SKILL.md` — version 3.37.0 + the State line + §64 (the
   round's transferable lesson: the interaction-walk census —
   when a surface's static families are all pinned, the next
   frontier is the full user journey; and the visible-link +
   symmetric-settling instrument rules).
5. `CLAUDE.md` — the E2E count 257→258 + the session-54 tail.
6. `README.md` — the E2E count 257→258 + the session-54 E2E tail.
7. `docs/session_109.md` — the round journal (the owner's
   session_108 took the 108 slot).
8. `docs/remediation-plan-session54.md` — this plan + its
   completion record.
9. Screenshots → `docs/screenshots/` (the interaction-walk pairs:
   the drawer open + the group expansion + the leaf-tap retention
   divergence evidence).
10. `worklog.md` — the round's record.

## The verification gates

lint 0/0 · tsc ✓ · unit 793 (unchanged) · build ✓ · E2E 257 + R54-A =
258 · the interaction-walk census record (done) · standing audits
5/5 + route sweep 12/12 (done) · verify-r49 13/13 + verify-r45
13/13 (done) · DB pristine (the loading-probe user swept) ·
`.env.example` verified.

---

## Completion record (session 54, delivered)

- **Gates**: lint 0/0 · tsc ✓ · **793/793 unit** (unchanged) ·
  build ✓ · **258/258 E2E** (+1 — R54-A: the drawer's default
  group-state map — all 9 group triggers collapsed at first open).
- **Live verification**: the **mobile-nav full interaction walk**
  7/9 MATCH (the 2 DIFFs = the documented drawer auto-close
  deviation, re-verified live — REF keeps the drawer open after
  leaf navigation at 500ms/1900ms, the clone closes it) + standing
  audits **5/5** + route sweep **12/12** + **verify-r49 13/13** +
  **verify-r45 13/13** + both sides' deploy fingerprints QUIET
  (login `C2ujlke6`/`D5oCh2kx`, app `C-IrDy5f`/`BGNH4KkS` — no
  21st login deploy this window).
- **Screenshots**: the interaction-walk evidence pairs (the drawer
  open with the group map, the Payroll expansion, the leaf-tap
  retention divergence both sides) → `docs/screenshots/`.
- **The push protocol held**: the code batch committed + pushed at
  the FIRST green stack via the ssh wrapper + the paramiko shim +
  the explicit `--remote git@github.com:nordeim/eon-hr.git`, the
  screenshots/docs layer after.
- **Tooling lessons**: the interaction-walk census (§64 — when a
  surface's static families are all pinned, census the full user
  journey: open → expand → navigate → dismiss; the interaction
  family is where never-paired-live divergences hide); the
  visible-link rule (raw selector clicks hit the first DOM match —
  the clone's hidden desktop-sidebar copy — filter for visibility
  before clicking); the symmetric-settling rule (paired reads must
  settle for the same delay after their dispatches — the mid-exit
  read is a false DIFF); the Radix overlay rule (the outside-close
  contract listens for pointerdown/up, not bare click() — synthetic
  overlay taps need the full pointer sequence).
