# Remediation plan — session 53 (parity round 52)

> The round-51 frontier said the parity surface holds through the 19th
> login deploy with the registry tripwire pinned and the mobile nav fully
> censused (at-rest chrome + panel/footer + expanded-group interiors).
> This round's census re-armed the live edges through a **20TH login
> deploy — the first to change BOTH chunks (JS `CimHfPLG`→`C2ujlke6`,
> CSS `CpjiugAb`→`D5oCh2kx`)** and extended them with two fresh paired
> measurements: the nav-registry drift re-check (the strongest re-read
> justification yet — both chunks churned) and the bottom-nav
> ACTIVE-STATE family across all five tab routes (rounds 50/51 censused
> the active tab on /dashboard only). No real gaps surfaced; the census
> record is pinned. All contracts live-measured this window (REF
> @1440×900 + @390×844 vs the seeded LOC :3200 standalone).

## The round's context

- Fresh clone to `da2abaf` (the owner's session_106 journal — the
  session-52 process log, docs-only on the landed round-51 `17182a9`).
  Baseline gates ALL GREEN: lint 0/0 · tsc ✓ · 793/793 unit · build ✓ ·
  256/256 E2E (no flakes this window).
- The `.env` / db / test-config audit: `DATABASE_URL="file:../db/
  custom.db"` ✓, `db/` at the repo root ✓, vitest + playwright configs
  intact (the green suites prove them).
- The skills audit (Phase 2): the session-52 delta fresh-eyed (the
  R52-A1/A2 registry tripwire + the R52-B computed-contract pin — clean,
  conventions hold); the standing TW-v4 sweeps (bare `border` safe via
  the base-layer pin; template-string classes all interpolate
  pre-authored static constants; `!important` confined to the documented
  globals.css blocks) — no findings; the structural doc counts verified
  current (61 routes / 54 API files / 47 models / 793 / 256 — the
  round-51 refresh holds, zero drift this round).

## The findings (all live-measured)

### A. The 20TH login deploy (re-audited — no action)

Login JS `CimHfPLG` → `C2ujlke6` AND CSS `CpjiugAb` → `D5oCh2kx` (the
first CSS change in ~15 deploys); app fingerprints `index-C-IrDy5f.js` /
`index-BGNH4KkS.css` unchanged — only the login build redeployed.
verify-r45 re-audited standalone: **13/13 MATCH** (reset/signup views
both bands, the sibling inputs, the hidden views' icons, the
success/duplicate Alerts, the loading interiors, the --foreground token,
the at-rest regression, the view swap). App side quiet through the
deploy: standing audits **5/5** + route sweep **12/12** + **verify-r49
13/13** (the confirmation ladder).

### B. The nav-registry drift re-check (verified-matching — the pin already stands)

Both chunks of the login build churned — the strongest justification
yet for re-reading REF's complete nav tree (the R52-A1 tripwire guards
the clone's NAV_ITEMS against refactors, but a REF-side module addition
is only catchable live). This round re-read BOTH sides' complete trees
(all groups expanded, desktop 1440×900): **52 entries each — 10 group
triggers + 44 leaves — labels, hrefs, and order all MATCH**. Zero drift
through the 20th deploy. The R52-A1/A2 pins remain the standing guard;
no new pin needed (the re-read is the census record).

### C. The bottom-nav ACTIVE-STATE family (verified-matching — pinned)

The user-called-out surface's last state gap: rounds 50/51 censused the
active tab's computed truth on /dashboard only (Home active; the E2E pin
likewise asserts Home-active + Staff-inactive there). This round paired
ALL FIVE tab routes live at 390×844 — /dashboard, /employees,
/taskmanager, /attendance, /profile:

- **The active-tab mapping**: each route highlights exactly its own tab
  (Home/Staff/Tasks/Attendance/Profile) on BOTH apps.
- **The computed family**: the active tab computes color
  `rgb(37,99,235)` (blue-600) + background `rgb(239,246,255)` (the
  blue-50 pill, session-21); the inactive tabs compute
  `rgb(71,85,105)` (slate-600) + transparent; icon colors track their
  labels; identical both sides on all five routes.
- **The pin (R53-A)**: an E2E test walking the four unpaired tab routes
  asserting each tab's active computed styles + an inactive sibling —
  so a nav-config active-matching regression (e.g. an exact-path check
  breaking on a prefix route) or a Tailwind engine change cannot
  silently drift the bottom bar's state family.

### D. The doc counts (verified current — no action)

The round-52 refresh holds: 61 (app) routes / 54 API route files /
47 models / 793 unit / 256 E2E — re-verified against the tree this
round (recursive `route.ts` glob = 54; `(app)` dirs = 61; `^model` =
47). No structural drift found.

### E. The vitest.config.ts header comment (REAL fix — small alignment)

The config's header comment still carries another project's domain
list ("router, clarify questions, plan sanitizer, check-in mapping" —
the task-management repo heritage, also visible in the SSH wrapper's
DEFAULT_REMOTE). The actual unit layer covers db-path resolution, auth
crypto/session, money/date utils, design tokens, validation, and the
parity recipe pins. The comment is updated to describe the real seams —
a documentation-alignment fix inside a config file (no behavior change;
the include/exclude patterns stay byte-identical).

## The fixes (file map)

1. `tests/e2e/mobile-navigation.spec.ts` — R53-A: the bottom-nav
   active-state family across the four unpaired tab routes
   (/employees, /taskmanager, /attendance, /profile — each tab's active
   computed color/bg + an inactive sibling), 390×844.
2. `vitest.config.ts` — the header comment aligned to the real unit
   seams (E).
3. `AGENTS.md` — the session-53 layer + the Commands counts (793/257).
4. `eon-hr_SKILL.md` — version 3.36.0 + the State line + §63 (the
   round's transferable lesson: the per-route state-family census —
   when a state recipe (active tab) is route-dependent, census the
   family across every route that exhibits it, not just the first).
5. `CLAUDE.md` — the E2E count 256→257 + the session-53 tail.
6. `README.md` — the E2E count 256→257 + the session-53 E2E tail.
7. `docs/session_107.md` — the round journal (the owner's session_106
   took the 106 slot).
8. `docs/remediation-plan-session53.md` — this plan + its completion
   record.
9. Screenshots → `docs/screenshots/` (the registry re-check pair + the
   bottom-nav active-state pairs).
10. `worklog.md` — the round's record.

## The verification gates

lint 0/0 · tsc ✓ · unit 793 (unchanged) · build ✓ · E2E 256 + R53-A =
257 · verify-r45 13/13 on the 20th deploy (done) · standing audits 5/5
+ route sweep 12/12 (done) · verify-r49 13/13 (done) · the
registry-drift + active-state-family census records (done, R53-A
pinned) · DB pristine (the loading-probe user swept) · `.env.example`
verified.
