# Remediation plan — session 59 (parity round 58): the badge/chip fill family

> The round-57 frontier said the CTA-fill family is censused and closed —
> every primary action's fill now carries REF's five-recipe taxonomy. This
> round's census took the same fill dimension to the layer the button
> census SEES but never reads — **the badge/chip fill family**: every leaf
> element (span/div/td/a/p, NOT inside a button) with a non-plain
> background and badge-ish shape, all 49 routes, paired live (REF
> @1440×900 vs the seeded LOC :3200 standalone,
> `scripts/r59-badge-census.mjs` — the census instrument). The r58
> instrument lesson applied from the start: classify "any non-plain fill",
> not the expected set.

## The round's context

- Workspace re-cloned from `5275d41` (the round-57 landing + the
  session-118 docs). Environment rebuilt (.env with
  `DATABASE_URL="file:../db/custom.db"` + a generated AUTH_SECRET; the
  exported-DATABASE_URL shell trap unset before every db-touching command;
  db pushed + seeded inside the repo; playwright chromium installed).
- Baseline gates ALL GREEN: lint 0/0 · tsc ✓ · **823/823 unit** ·
  build ✓ · **285/286 E2E** (1 session-58 switch/checkbox flake under
  full-suite load, 11/11 green in isolation — the documented
  flake-check protocol).
- The skills audit (Phase 2): the session-58 delta re-audited fresh-eyed
  — the posts multipart cap and the profile DELETE walk verified complete
  against a full FK map of `prisma/schema.prisma` (all 18 non-cascade
  relations covered; `Review.employeeId` cascades via the schema,
  `reviewerId` is walked explicitly). Structural counts verified current
  (61 pages / 57 API files / 48 models / 36 E2E spec files); scandihaven
  (the tech-stack model) unchanged (`d4789c3`).
- The deploy watch: **the login side deployed AGAIN (the 23rd)** — login
  JS `DclSb8FG` → `CpCk8Zmk`, login CSS `V5v1Fmok` → `A8a43VEI` (both
  rolled; the app side `C-IrDy5f`/`BGNH4KkS` unchanged). Per protocol the
  login re-audit ran: **verify-r45 13/13 MATCH — a non-visual rebuild**.
  The confirmation ladder green after the REF session re-auth (the
  stale-session DIFF pattern, met once more): standing **5/5** + route
  sweep **12/12** + **verify-r49 13/13** + **verify-r45 13/13**.

## THE BADGE/CHIP FILL CENSUS (the record)

`scripts/r59-badge-census.mjs` (+ `r59-badge-recon.mjs` — the
reconnaissance probe), paired live at 1440×900 across 49 routes. The
instrument reads every non-button leaf's computed fill + text + geometry,
deduped by (text, fill, height). **Pre-fix: 44/49 MATCH / 5 DIFF.**

The five DIFFs, triaged:

1. **`/taskmanager` (REAL — R59-A)**: REF renders **five distinct
   status-tinted count chips** on the kanban columns — Backlog
   `bg-slate-100 text-slate-700`, To Do `bg-blue-100 text-blue-700`, In
   Progress `bg-yellow-100 text-yellow-700`, Review `bg-purple-100
   text-purple-700`, Done `bg-green-100 text-green-700` (all on the
   `inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs
   font-semibold transition-colors focus:outline-none focus:ring-2
   focus:ring-ring focus:ring-offset-2` shape). The clone renders the
   **uniform slate-100 chip on every column** — the session-6 pin
   measured only the FIRST column (Backlog) and generalized it; the
   classic census blind spot. Computed REF truth: slate rgb(241,245,249)/
   rgb(51,65,85), blue rgb(219,234,254)/rgb(29,78,216), yellow
   rgb(254,249,195)/rgb(161,98,7), purple rgb(243,232,255)/
   rgb(126,34,206), green rgb(220,252,231)/rgb(21,128,61).
2. **`/recruitmentkanban` (REAL — R59-B)**: same family — REF's five
   stage chips are status-tinted: Applied `bg-slate-200 text-slate-700`,
   Interviewing `bg-blue-100 text-blue-700`, Offer `bg-amber-100
   text-amber-700` (rgb(254,243,199)/rgb(180,83,9) — AMBER, not the
   taskmanager's yellow: REF keeps two different in-progress/warning
   shades across its own pages), Hired `bg-green-100 text-green-700`,
   Rejected `bg-red-100 text-red-700` (rgb(254,226,226)/rgb(185,28,28)).
   The clone renders the uniform slate-200 chip (the class prefix already
   byte-identical to REF's — only the tint members drift).
3. **`/profile` (DATA-LEVEL — R59-C, documented allowance)**: the role
   badge recipe matches byte-for-byte (`inline-flex shrink-0 items-center
   rounded-md border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs
   font-semibold text-blue-700`), but the TEXT reads **"Admin" on the
   clone vs "User" on REF** — the clone's seed sets the shared demo
   account's role to `admin`, which is load-bearing for the functional
   superset (`requireRole(["admin","hr"])` gates on the import, employee
   and config mutations + the E2E suite's admin-gated round-trips).
   REF's demo account renders "User" (base44's role default) while still
   exposing every admin affordance its UI has. Changing the seed role
   would break 30+ admin-gated E2E flows to flip one badge's text — the
   wrong trade. Recorded as the documented divergence: the clone's demo
   account is admin (the superset), REF's renders "User".
4. **`/employees` (WITH-DATA — REF-unmeasurable)**: the clone's seeded
   employee row renders two badges REF cannot show — the 32px avatar
   initial (`bg-primary` — the Facebook-blue token) and the "Active"
   status badge (`bg-emerald-100 text-emerald-700` rendering **lab()**
   — the oklch drift). REF's demo tenant has **zero employees** and its
   own Create Employee wizard is a **silent no-op live** (walked this
   round: 4 steps → Create Employee → no row, no toast, no error —
   consistent with the r57 findings that REF's write paths are broken on
   the demo). The avatar fill and the table-badge recipes stay
   REF-unmeasurable (inventing one would be the R14-E anti-pattern); the
   emerald oklch drift itself IS fixable (R59-D — pin the palette).
5. **`/securitysettings` (FALSE-DIFF — R59-E, instrument lesson)**: the
   census read REF at a 400ms wait vs LOC at 300ms and REF's four
   "Enabled" badges had not rendered yet (the data-gated load). With
   equal content waits both sides read **byte-identical** (1 Disabled
   slate-100/slate-700 + 4 Enabled green-100/green-700). No code change.

## The trap-2 sweep (the palette layer — R59-D)

The census's `lab()` serializations exposed the root cause: a
used-vs-pinned shade sweep of the whole `src/` tree against the
`@theme` pins found **unpinned shades in active use** — Tailwind v4's
oklch defaults drift 1–3 sRGB units per channel (the documented trap 2),
and every one of these renders drifted today:

| Family | Pinned | Used + unpinned (sites) |
|---|---|---|
| emerald | 50/500/600 | **100 (3), 700 (2)** — the Badge success variant (badge.tsx), communications chips, payrollmodule tiles |
| amber | 50/500 | **100 (2), 400 (1), 600 (7), 700 (1)** — the Badge warning variant, compliance alerts |
| yellow | — | **100 (9), 600 (10), 700 (1)** — surveyanalytics/analytics/attendance/shiftswap/expenses icon colors |
| red | 50/200/400/500/600/700/800/900 | **100** — the Badge destructive variant |
| purple | 100/600 | **700** — the new taskmanager Review chip |
| violet | 600 | **100, 700** — the Badge purple variant |
| pink | — | **600** (the expenses CTA gradient endpoint — matches REF today; pin for stability) |

The pins land as the v3 hexes (the reference-ecosystem values — and
byte-identical to the REF-measured rgb() truths above):
`--color-yellow-100: #FEF9C3; --color-yellow-600: #CA8A04;
--color-yellow-700: #A16207; --color-amber-100: #FEF3C7;
--color-amber-400: #FBBF24; --color-amber-600: #D97706;
--color-amber-700: #B45309; --color-red-100: #FEE2E2;
--color-purple-100: #F3E8FF; --color-purple-700: #7E22CE;
--color-emerald-100: #D1FAE5; --color-emerald-700: #047857;
--color-violet-100: #EDE9FE; --color-violet-700: #6D28D9;
--color-pink-600: #DB2777;`

## The fix plan (TDD)

**Unit pins first (RED)**: a new `describe` block in
`tests/unit/recipes.test.ts` — the R59 family pins: the taskmanager
per-column chip map (R59-A), the recruitmentkanban per-stage chip map
(R59-B), the sixteen palette pins in `globals.css` (R59-D), and the
census-lesson negative pin (the uniform-slate authoring is gone).

**GREEN** (source order):
1. `src/app/globals.css` — the sixteen pinned shades (the R59-D block,
   with the session-58-style comment explaining the drift family).
2. `src/app/(app)/taskmanager/page.tsx` — the columns config gains a
   per-column `chip` member; the count chip renders REF's exact class
   string (adding the `transition-colors focus:outline-none
   focus:ring-2 focus:ring-ring focus:ring-offset-2` members the
   session-6 authoring lacked) + `col.chip`.
3. `src/app/(app)/recruitmentkanban/page.tsx` — the columns config gains
   the per-stage `chip` member; the count chip's
   `bg-slate-200 text-slate-700` tail becomes `${col.chip}`.

**E2E** (`tests/e2e/session59-badge-fills.spec.ts`): computed-truth pins
— the five taskmanager chip fills (slate/blue/yellow/purple/green
pairs), the five recruitmentkanban chip fills (slate-200/blue/amber/
green/red pairs), the pinned-palette renders (a probe page rendering
emerald-100/700 + amber-100/700 + yellow-100/700 computes the v3 rgb()
values, not lab()), and the securitysettings five-badge regression (the
r56 family + the content-wait lesson).

**Census re-run** post-fix (the same instrument, all 49 routes) →
expect MATCH everywhere except the two documented allowances (/profile
role text — R59-C; /employees with-data — REF-unmeasurable) and the
securitysettings false-DIFF disappears under equal waits.

**Gates**: lint → typecheck → unit (+~6) → build → E2E (+~5) → the
confirmation ladder re-run → DB pristine check → screenshots → docs.

## Completion record (filled at landing)

- [ ] (to be filled after the round lands)
