# Remediation Plan — Session 65 / Parity Round 64: The Geometry Census (padding + border-radius)

**Census instrument**: `scripts/r65-geometry-census.mjs` — the computed
`padding` (4 sides) + `border-radius` of every geometry-bearing element in
`main` (non-zero padding on any side OR non-zero radius; non-zero rect per
the r61 w:0 lesson; buttons included), all 49 routes, paired live in LIGHT
mode (geometry is authored theme-invariant in this corpus — no dark:padding
members exist), deduped (tag|pad|radius) tuples, set comparison. Three
batches (17/17/15) with DIFF dumps (`/tmp/r65-b{1,2,3}.log`).
**Pre-fix: 32/49 MATCH, 17 DIFF.**

The round's motivation is the r64 lesson: **color censuses cannot see
PADDING** — the iconed-search family drifted 51 rounds because no computed
read covered the dimension. This census extends the computed-style matrix
from color into geometry, the first full-population read of the two
dimensions every color census was blind to.

**Instrument notes (the r65 lessons baked in)**:
1. The `rounded-full` serialization split: TW v4 authors
   `calc(infinity * 1px)` which Chrome serializes as `33554432px` (2^25)
   while REF's v3-era `9999px` stays `9999px` — both render fully round.
   The census normalizes any radius ≥ 9999 to `full` (a normalization bug
   in the first run keyed the padding-only census to 2/17 — the
   serialization family is a false-positive family, not a divergence).
2. No `//` comments inside eval strings — `evalOn` flattens newlines and a
   `//` comment swallows the rest of the one-liner (the census read broke
   until the comment moved to the .mjs header).
3. The deploy watch ran FIRST and detected **the 28th login deploy**
   (JS `D3ArZVPB`→`DcjXLM5U` + CSS `OJK0Y98H`→`D_pxMX7I`, the
   frontend-config chunk held; the app side quiet `C-IrDy5f`/`BGNH4KkS`).
   The full confirmation ladder re-audited it NON-VISUAL: standing 5/5 +
   sweep 12/12 + verify-r49 13/13 + verify-r45 13/13. The watch finals are
   updated to the post-28th truths. NOTE: the 28th deploy invalidated all
   REF sessions — the first ladder run read the LOGIN page on every route
   (0/5 + 0/12); a fresh re-auth restored the truth (the stale-session
   artifact, recorded).

## Census verdict — 17 DIFFs decomposed

Every DIFF decomposed element-level (`r65-probe.mjs` + `r65-probe-cmp.mjs`,
the symmetric tuple diff with class/rect/text attribution; `r65-probe2.mjs`
the per-tile recipe probe across the 18 stat-tile pages):

- **7 fix families** (below).
- **Documented allowances (no fix)**: employees (the seeded grid surfaces),
  attendance (the admin superset cards R61 + the restricted card — the
  clone's non-admin surface re-verified at geometry parity this round:
  the 64×64 circle + mb-4 + the py-16 row all byte-match REF's live
  recipe), interviewassistant (the r48-C1 AI Analysis card),
  onboardingtemplates (the r36 `<a>` superset — byte-identical members,
  tag superset), careers (REF's live demo company buttons/chips + the
  clone's hero superset — the bad probe read re-verified via the small
  tuple read: the DIFF tuples are the live-data family).

## The fix families

- **R65-A — the StatCard standard-variant tile is PADDING-DRIVEN (`p-3
  rounded-xl`), and only on 4 pages**: REF live-measures `bg-{c}-100 p-3
  rounded-xl` 48×48 (12+24+12) on payroll, expenses, surveys, attendance —
  the clone renders the R16-D-era fixed `w-12 h-12 rounded-xl` (padding 0)
  everywhere. The session-17 R16-D "NOT p-3" note was a generalization
  error: its 0-padding measurement was taken on the OTHER 48px-tile pages —
  advancedanalytics, analytics (tile-right), allleaverequests, payrollai
  all live-measure `w-12 h-12 … rounded-xl` FIXED on REF (probe2 verified
  all 18 stat-tile pages; the compacts stay `w-10 h-10` fixed, the
  horizontals `w-11`/`rounded-lg` fixed). At rest both forms compute
  48×48 — the divergence is invisible to every color census and to size
  reads; only the padding dimension sees it. Fix: the standard branch's
  tile base becomes `p-3 rounded-xl flex items-center justify-center
  bg-blue-100` with a new `tileFixed` escape hatch (`w-12 h-12 …`) that
  advancedanalytics / allleaverequests / payrollai pass (they keep REF's
  fixed form). The R16-D doc comment is corrected. The `w-12 h-12`
  legacy pin (recipes.test.ts:255, session-10) is amended to the new
  two-form contract.
- **R65-B — the td/th UA-padding restoration (a REAL Tailwind v4 engine
  difference)**: TW v4's preflight carries
  `*,:after,:before,::backdrop{…;margin:0;padding:0}` — the universal
  padding reset zeroes the Chrome UA's `td,th{padding:1px}`. REF's runtime
  does NOT: every unstyled side of a table cell rides the surviving UA
  1px. Live reads: the empty-state tds (`py-10`/`py-12` cells read
  `40,1,40,1`/`48,1,48,1` on REF vs `…,0,…,0` on the clone — recruitment,
  assetmanagement, payrollmodule), the requestreports th family
  (`pb-2 pr-4` reads `1,16,8,1` on REF vs `0,16,8,0`), the shiftcalendar
  cells (pure UA `1,1,1,1` vs `0,0,0,0`). Fix: a base-layer restoration in
  globals.css (the R23-A `button{cursor:pointer}` precedent — v4's
  preflight dropped what REF's runtime keeps):
  `@layer base { th, td { padding: 1px; } }`. Class-set sides keep their
  utility values (the utilities layer wins); unstyled sides ride 1px like
  REF. No existing pin asserts a 0 on an unstyled td/th side (audited).
- **R65-C — the /chat conversation column header**: REF authors ONE
  `p-4 border-b border-slate-200` wrapper containing the h2 row
  (`flex items-center justify-between mb-4` — NO padding, NO gap-2) and
  the BARE `relative` search wrapper. The clone splits the padding into
  two divs (`px-4 py-4` h2 row + `px-4 pb-4` search div) AND **dropped
  the border-b entirely** — the r63 border census matched because the
  page's other slate-200 borders satisfied the set comparison (the
  geometry census's per-element attribution caught the missing line).
  The new-chat button is also authored differently: REF's is
  padding-driven (`px-3`, 40×32 from 16px icon + 24px padding) while the
  clone's is fixed (`w-10 h-8`) — both 40×32 at rest. Fix: restructure to
  REF's exact recipe (single wrapper + border-b restored at REF's y; the
  h2 row loses `gap-2 px-4 py-4` and gains `mb-4`; the search wrapper
  drops its wrapper div) and the button swaps `w-10` for `px-3`. The h2
  string and the Search icon member-sets are pinned unchanged (R61-H/I
  hold). Visible positions are unchanged (h2 y=49, input y=97); the
  border-b at y≈150 is the visible fix.
- **R65-D — the compliance filter row is a bordered white box**: REF
  authors `flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl
  border border-slate-200` (live-measured full string) — the clone
  renders the same row as a bare `flex flex-wrap gap-3 p-4` inside the
  card (no bg, no radius, no border, no items-center). The fill censuses
  could not see it (the clone's Card root supplies an identical white
  tuple — set blindness); the geometry census caught the missing
  `16,16,16,16|12` tuple. Fix: adopt REF's full member set.
- **R65-E — the hrassistant chat pane + input row geometry**: REF's pane
  is `h-[500px] overflow-y-auto p-6 space-y-4` (500px, 24px padding) —
  the clone's is `flex h-[460px] flex-col gap-3 overflow-y-auto p-4`
  (40px shorter, 16px padding). REF's input row is `border-t p-4 flex
  gap-3` (16px padding, row h≈93) — the clone's is
  `flex items-end gap-2 border-t p-3` (12px, h≈73). REF's textarea is
  `min-h-[60px]` — the clone's is `min-h-[48px]`. These are visible
  layout differences (the pane is 40px shorter and the input row 20px
  shorter on the clone). Fix: adopt REF's three recipes (the pane drops
  the flex stack for REF's block + space-y-4 — the loader branch gets an
  h-full centering div to keep the loading state visible; the send
  Button keeps the R58-6 pin — REF's 48×36 dark solid, verified unchanged
  this round).
- **R65-F — the requestreports Back button's py-2 leak**: the clone
  authors `variant="ghost" className="h-8 rounded-md px-3 text-xs"` on
  the DEFAULT button size — tw-merge replaces h-9→h-8 and px-4→px-3 but
  the base `py-2` (8px) survives: the button computes `8px 12px` vs REF's
  `0px 12px` (85×32 both). REF's live tail IS the sm size
  (`h-8 rounded-md px-3 text-xs` with NO py). Fix: `variant="ghost"
  size="sm"` (the exact REF member set, className dropped) — the py
  member never enters. The R48-C7 pin (recipes.test.ts:5522) is amended.
- **R65-G — the `--radius-sm` token (2px → 4px, REF's live rounded-sm)**:
  REF's live runtime computes `rounded-sm` as **4px** (the v4 scale —
  v3's `rounded` slot), live-measured on the securitysettings checkboxes
  (the only visible-at-rest rounded-sm surface; the census flagged
  `button|0,0,0,0|4` REF vs `|2` clone). The clone's @theme pins the v3
  default `0.125rem` (2px) — an early-session assumption never
  computed-verified (the "Radii (v3 defaults)" block). Every OTHER radius
  matches live (md 6px, lg 8px, xl 12px — census-verified on buttons,
  requestreports tiles, stat tiles). Fix: pin `--radius-sm: 0.25rem` with
  the live-measurement comment. The rounded-sm MEMBER pins (R35-A4/B1/B2
  dropdown/select items) are class-string pins — they hold. No E2E
  asserts a computed rounded-sm value (audited: the radius assertions in
  user-menu/session56/login-error/not-found read 6px/8px/other tokens).

## Fixes (TDD — RED first)

| ID | File(s) | Change |
|----|---------|--------|
| R65-A1 | `src/components/shared/stat-card.tsx` | the standard tile base → `p-3 rounded-xl flex items-center justify-center bg-blue-100` (default) + the new `tileFixed?: boolean` prop (`w-12 h-12 …` escape); the R16-D doc comment corrected (the 0-padding measurement was page-specific) |
| R65-A2 | `src/app/(app)/advancedanalytics/page.tsx` | the 4 StatCards pass `tileFixed` (REF renders them fixed — probe2) |
| R65-A3 | `src/app/(app)/allleaverequests/page.tsx` | the 3 StatCards pass `tileFixed` |
| R65-A4 | `src/app/(app)/payrollai/page.tsx` | the 3 StatCards pass `tileFixed` |
| R65-B | `src/app/globals.css` | `@layer base { th, td { padding: 1px; } }` (after the R23-A cursor block, same comment pattern — the v4-preflight restoration) |
| R65-C1 | `src/app/(app)/chat/page.tsx` | the column header restructured: ONE `p-4 border-b border-slate-200` div wrapping the h2 row (`flex items-center justify-between mb-4`) + the bare `relative` search wrapper (the two split divs retired) |
| R65-C2 | `src/app/(app)/chat/page.tsx` | the new-chat button: `w-10` → `px-3` (padding-driven 40×32, REF's authored form) |
| R65-D | `src/app/(app)/compliancedashboard/page.tsx` | the filter row: `flex flex-wrap gap-3 p-4` → `flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl border border-slate-200` |
| R65-E1 | `src/app/(app)/hrassistant/page.tsx` | the pane: `flex h-[460px] flex-col gap-3 overflow-y-auto p-4` → `h-[500px] overflow-y-auto p-6 space-y-4` (+ the loader branch's h-full centering) |
| R65-E2 | `src/app/(app)/hrassistant/page.tsx` | the input row: `flex items-end gap-2 border-t p-3` → `border-t p-4 flex gap-3` |
| R65-E3 | `src/app/(app)/hrassistant/page.tsx` | the textarea: `min-h-[48px] flex-1 resize-none` → `min-h-[60px] flex-1 resize-none` |
| R65-F | `src/app/(app)/requestreports/page.tsx` | the Back button: `variant="ghost" className="h-8 rounded-md px-3 text-xs"` → `variant="ghost" size="sm"` |
| R65-G | `src/app/globals.css` | `--radius-sm: 0.125rem` → `--radius-sm: 0.25rem` (live-measured comment) |

## Legacy pins amended

- `tests/unit/recipes.test.ts:255` (session-10 StatCard): the standard-tile
  assertion moves to the two-form contract (padded default + tileFixed).
- `tests/unit/recipes.test.ts:5522` (R48-C7): the Back-button member
  assertion becomes the `size="sm"` form.
- Hold unchanged (audited): R61-H/R61-I (the chat h2 + the search icon
  member-sets), R39-E1 (the Textarea base — the hrassistant instance
  overrides min-h only), R35-A4/B1/B2 (rounded-sm class-string pins),
  R62-K (the shared Textarea resize-none), R58-6 (the hrassistant send
  button), the session-49 value-in-tile locator (its own hardcoded div).

## Documented allowances (the census DIFFs — re-confirmed)

employees (seeded grid), attendance (admin superset + the non-admin
restricted card — geometry-verified at parity: 64×64 circle + mb-4 +
py-16 row), interviewassistant (r48-C1), onboardingtemplates (r36 anchor),
careers (REF live data + the clone's hero superset), the advancedanalytics
hidden-tooltip artifact (r63), the hrassistant textarea's
placeholder-token authorship split (computed-equal, r63's literal pair
holds the color truth).

## Verification plan

1. TDD RED: the R65 describe block in `tests/unit/recipes.test.ts`
   (~7 pins) — RED before the fixes; retirement assertions scoped to the
   measured page sources; no retired literals in comments (the r63
   pin-defect lessons).
2. GREEN: apply the 13 source changes; unit green (885 + ~7).
3. E2E: `tests/e2e/session65-geometry.spec.ts` — computed truth: the 4
   padded stat tiles (paddingLeft 12px) + the 3 fixed pages (0px), the
   empty-state td horizontal padding (1px) on recruitment + the
   requestreports th top/left (1px), the chat wrapper's border-bottom
   width (1px) + the button computed padding (0px 12px), the compliance
   row's borderRadius (12px) + border, the hrassistant pane height (500px)
   + input row padding (16px), the requestreports Back computed padding
   (0px 12px), the securitysettings checkbox borderRadius (4px).
4. Post-fix census re-run (3 batches) — projection: **49/49 minus the
   allowance families**; the DIFF set collapses to the 5 allowance routes
   (employees, attendance, interviewassistant, onboardingtemplates,
   careers) whose decomposed tuples are all documented (≈37-44/49; the
   exact count depends on the td-restoration shifting which routes'
   tuple sets collide — the projection: the 7 fixed routes all MATCH, the
   5 allowance routes stay DIFF with byte-identical allowance tuples).
5. Full gates: lint 0/0 · tsc ✓ · unit · build ✓ (via `bun run build` —
   the static-copy trap) · E2E full suite (the flake-check protocol for
   any mid-suite failure — the session-42 user-menu transient joined the
   documented family this round: 338/339 mid-suite, 6/6 isolated).
6. Screenshots (the dev server running the remediated codebase) under
   `docs/screenshots/` — fresh ref/loc sessions (the stale-viewport
   lesson): the 4 padded-tile pages pair set, the chat column-header pair
   (the restored border-b), the compliance filter-row pair, the
   hrassistant pair, the checkbox pair, the requestreports Back pair,
   the td-restoration pairs (recruitment empty state, requestreports th,
   shiftcalendar cells), the mobile drawer pair @390×844 (the standing
   mobile-menu check evidence).

## Post-fix projection

The 7 fix families move 12 routes from DIFF to MATCH-eligible
(payroll, expenses, surveys, attendance, recruitment, assetmanagement,
payrollmodule, requestreports, shiftcalendar, chat, compliancedashboard,
hrassistant, securitysettings — 13 routes minus the attendance allowance
residue). The 5 allowance routes stay DIFF with documented tuples. Census
projection ≈ 44/49 (49 − 5 allowances); every remaining DIFF decomposed
and byte-identical to this round's allowance dumps.

---

## Completion record (filled post-execution)

- **All 13 source changes applied as planned** (R65-A1..A4 the tile
  family, R65-B the td/th restoration, R65-C1/C2 the chat restructure,
  R65-D the compliance row, R65-E1..E3 the hrassistant geometry,
  R65-F the Back button, R65-G the radius token) — plus one
  execution-time correction the plan's verification loop itself
  caught: the tile-right branch of R65-A needed the fixed form by
  CONTRACT (`tileFixed || variant === "tile-right"`) — the first
  post-fix census run flagged /analytics (a MATCH route regressed to
  DIFF), the condition was fixed, the rebuild re-verified (analytics
  + the two tileFixed pages MATCH).
- **Post-fix census: 44/49 MATCH — exactly the projection** (49 − the
  5 allowance routes employees / attendance / interviewassistant /
  onboardingtemplates / careers; every remaining DIFF's tuples
  byte-identical to the pre-fix allowance dumps).
- **Legacy pins**: the 2 scheduled amendments applied (the session-10
  tile pin → the two-form contract; the R48-C7 Back pin → the sm
  size) + 1 execution-time amendment (the R60-E chat member pin
  re-ordered for the inserted px-3 member — the color contract
  unchanged). All other audited pins held without edits.
- **Gates**: lint 0/0 · tsc ✓ · **892/892 unit** (+7 RED-first) ·
  build ✓ (via `bun run build`) · **346/346 E2E** (+7 in
  `tests/e2e/session65-geometry.spec.ts`; the session-58
  switch/checkbox documented transient fired once mid-suite, 11/11 in
  isolation per the flake-check; the baseline run's session-42
  user-menu transient also 6/6 isolated) · DB pristine.
- **Screenshots**: the 344–367 pair set (24 files — the four padded
  stat-tile pages, the chat column header with the restored border-b,
  the compliance filter row box, the hrassistant pane/row, the
  checkbox radius, the requestreports Back + th, the recruitment
  empty-state td, the shiftcalendar cells, the mobile drawer pair
  @390×844 as the standing mobile-menu check evidence). 550
  screenshot files total; no ref/loc pair collisions — the 366 mobile
  pair byte-matches the r64 342 pair (cross-round byte-stability of
  the standing surface, documented).
- **Deploy watch**: the 28th login deploy detected this round (JS
  `D3ArZVPB`→`DcjXLM5U` + CSS `OJK0Y98H`→`D_pxMX7I`; app side quiet)
  — re-audited NON-VISUAL via the full ladder (standing 5/5 + sweep
  12/12 + verify-r49 13/13 + verify-r45 13/13 — after a fresh re-auth;
  the first ladder run hit the stale-session artifact, 0/5 + 0/12
  reading the login page on every route, recorded as an instrument
  lesson). The watch finals updated to the post-28th hashes.
- **Docs**: AGENTS session-65 layer + the 5 r65 instrument lessons +
  the Commands counts (892/346), CLAUDE (the 1238-spec pyramid =
  892+346, 43 E2E spec files), README (the counts + the session-65
  spec tail), eon-hr_SKILL.md 3.48.0 + §75 + the State line,
  docs/session_133.md (the narrative), this completion record, the
  worklog; `.env.example` verified (only DATABASE_URL + AUTH_SECRET
  are read).
