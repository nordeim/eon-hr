# Remediation Plan — Session 66 / Parity Round 65: The Margin/Gap Census (margin 4 sides + rowGap/columnGap)

**Census instrument**: `scripts/r66-margin-census.mjs` — the computed
`margin` (4 sides) + `rowGap`/`columnGap` of every margin/gap-bearing
element in `main` (buttons included), all 49 routes, paired live in LIGHT
mode (margins are authored theme-invariant in this corpus — no
`dark:mt-*` members exist), deduped (tag|margin|gap) tuples, set
comparison, three batches with DIFF dumps. **Pre-fix: 19/49 MATCH,
30 DIFF.**

The round's motivation: the computed-style matrix covered color
(fill/text/border × light/dark — r57..r63) and geometry (padding +
radius, light — r65), but NO census had ever read MARGINS or GAPS —
the same structural blindness the r64/r65 lessons recorded (the
iconed-input paddings drifted 51 rounds; the stat-tile p-3 split was
invisible to every color read).

## Instrument notes (the r66 lessons baked in)

1. **The space-y direction-flip normalization (mark II)**: TW v3 (REF)
   authors `space-y-*` as margin-TOP on `* + *`; TW v4 (the clone) as
   margin-BLOCK-END on `:not(:last-child)`. The SAME visual container
   distributes opposite-sided margins per child. Mark I normalized
   one-sided pairs to `v:N` — but the ZERO lands on DIFFERENT elements
   (first on v3, last on v4), and since the tuple bundles the element's
   own gap, position-equal sets still diverged (batch-1 first run:
   1/17). Mark II parses the parent's `space-y-N` value from its class
   (the rem scale mapped to px; the LAST matching token wins —
   responsive variants sort after plain ones) and emits `v:N` for EVERY
   child whose pair is (0,0), (N,0), (0,N) or (N,N) — position-
   independent on both engines. Batch 1 rose to 4/17 with the same
   code (the dissolved DIFFs were pure positional noise).
2. **Census MATCH ≠ element parity (set blindness, third face)**: a
   route can MATCH while the mb-3 lives on different elements per side
   (allleaverequests matched — its REF page carries ANOTHER
   `0,0,12,0` element that satisfied the set while the StatCard row's
   mb-3 was REF-absent). The per-element probes are the verdict; the
   E2E pins are the contract.
3. **Mid-load census transients**: REF's evaluations tabs read
   `(v:24, ml:304)` with mr=0 at census time (+6.4s post-open) but
   `(0,304,0,304)` settled — a loading-state artifact (the r63
   taskmanager lesson family). Element-level re-probes at rest are the
   tiebreaker; never fix against a transient read.
4. **The deploy watch ran FIRST and detected THE 29TH LOGIN DEPLOY**
   (login JS `DcjXLM5U`→`q8Uif46n` + CSS `D_pxMX7I`→`CiCfCTzx`; the
   app side QUIET `C-IrDy5f`/`BGNH4KkS`). The full confirmation ladder
   re-audited it NON-VISUAL after a fresh re-auth (standing 5/5 + sweep
   12/12 + verify-r49 13/13 + verify-r45 13/13). The watch finals are
   the post-29th hashes.

## Census verdict — the 30 DIFFs decomposed

Every DIFF decomposed element-level (`r66-probe.mjs` — the same-
normalized element inventory; `r66-probe-cmp.mjs` — the symmetric
diff with class/rect/text attribution; targeted live probes for the
families the dumps flagged): **17 fix families + the documented
allowances** (employees' seeded grid cards, attendance's admin
superset + the restricted card behind the admin login, careers' live
demo data + hero superset, interviewassistant's r48-C1 AI Analysis
card, onboardingtemplates' r36 anchor — the standing set) + the
documented census transients (evaluations' mid-load tabs read).

## The fix families

- **R66-A — the page-scroll band (PageCanvas's third member)**: REF
  renders `absolute top-0 left-0 right-0 flex justify-center
  items-center h-20 -mt-20` (an over-the-top negative-margin band
  holding a `div[style=transform:none]` with the refresh-cw
  `w-6 h-6 text-blue-600` spinner) as the scroll/pull-refresh widget
  on the 8 PageCanvas routes (dashboard, employees, payroll,
  taskmanager, leavemanagement, expenses, loans, attendance) — the
  session-47 r47-A measurement documented it as "non-clone"; the
  margin census promotes it to clone (its `-80,0,0,0` tuple is the
  top REF-only family, ×8). Fix: PageCanvas renders the band (the
  census tuple + the authoring; invisible at rest, clipped by
  `overflow-hidden`).
- **R66-B — the EmptyState icon authoring**: REF puts the empty-state
  icon classes ON THE SVG (`lucide-{name} w-16 h-16 mx-auto mb-4
  text-slate-300`); the clone wraps (`div.mb-4.flex.justify-center >
  div.[&_svg]:h-16 [&_svg]:w-16 [&_svg]:text-slate-300 > svg`). Same
  visual, different structure — the mx-auto margin (479/303/96px by
  container) is the census signal (REF-only `svg|0,{w},16,{w}` vs
  LOC-only `div|0,0,16,0` on payroll, expenses, loans, training,
  offboarding, companywall, hrassistantchat). Fix: empty-state.tsx
  renders the icon via cloneElement with REF's member set on the svg;
  the wrappers retire. Call sites pass bare icons; offboarding's
  icon changes LogOut → **UserMinus** (REF's live icon). The iconChip
  branch (templates, census-MATCHED) is untouched.
- **R66-C — the StatCard tileFixed row+value recipes**: REF's live
  standard-tile pages split TWICE — the p-3 padded pages (payroll,
  expenses, surveys, attendance) render the row `flex items-start
  justify-between mb-3` + the value `div.text-3xl font-bold
  text-slate-900 mb-1`; the tileFixed pages (advancedanalytics,
  allleaverequests, payrollai) render the row WITHOUT mb-3 and the
  value as `p.text-3xl font-bold text-slate-900 mt-4`. The clone
  renders the padded form everywhere (the mb-3 row + mb-1 value);
  allleaverequests censused MATCH via set-absorption (the third face
  of set blindness). Fix: the standard+tileFixed branch — row loses
  mb-3, the value becomes the mt-4 P form.
- **R66-D — the employees header row + grid recipes**: REF's row is
  `hidden md:flex items-center justify-between mb-8` (the alwaysRow
  family — no flex-col, no gap member, no sm: members) and the grid
  is `grid md:grid-cols-2 lg:grid-cols-3 gap-6`; the clone renders
  the default breakpoint row (`flex flex-col gap-4 sm:flex-row
  sm:justify-between sm:items-center hidden md:flex mb-8`) and
  `grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3`. Fix: the
  PageHeader gains `alwaysRow`; the grid adopts REF's recipe.
- **R66-E — the recruitment tabbed structure**: REF's TabsList is a
  direct space-y-6 child (`inline-flex h-9 items-center
  justify-center rounded-lg p-1 text-muted-foreground bg-white border
  border-slate-200` reads v:24), the applicants content is a space-y-4
  flow whose first members are the bordered filter box (`flex
  flex-wrap gap-3 items-center bg-white p-4 rounded-xl border
  border-slate-200` — the R65-D compliance idiom, second instance)
  and the table card (`bg-white rounded-xl border
  border-slate-200 overflow-hidden`), both v:16. The clone renders
  the shadcn Tabs wrapper (bare root — the List/Content read literal
  margins), the content as `mt-6 flex flex-col gap-4` (children
  gap-driven, not space-y), and the filter row as a bare
  `mt-6 flex flex-col gap-4`. Fix: the Tabs root gains space-y-6;
  the TabsContent becomes `mt-6 space-y-4`; the filter row adopts
  the bordered box; the table wrapper keeps REF's card form.
- **R66-F — the actions-cluster per-page truth (the session-5 "gap-3"
  frozen generalization, re-measured)**: REF's live actions cluster
  has THREE forms — `flex gap-3` (multi-button rows: employees,
  taskmanager, attendance), `flex gap-2` (staffrequests), and the RAW
  BUTTON with NO wrapper at all (expenses, loans, recruitment,
  recruitmentkanban, workflowconfigpage — the button sits directly in
  the justify-between row). The clone renders the uniform `flex
  flex-wrap items-center gap-3` wrapper on all of them. The
  PageHeader already carries the `actionsBare`/`actionsUnwrapped`
  escapes (used by 10 other routes). Fix: staffrequests →
  `actionsBare`; the raw-button five → `actionsUnwrapped`.
- **R66-G — the companywall composer's audience group**: REF renders
  the "Who can see this post?" group as `space-y-2` with the bare
  Label (`text-sm font-medium leading-none …`) and the w-full select
  trigger; the clone authors `space-y-3` + `Label className="block
  leading-5"` (the R10-C pin — a frozen measurement now drifted on
  REF's side). Fix: `space-y-2`; the Label drops `block leading-5`
  (the trigger's w-full is already in place).
- **R66-H — the payrollengine form groups**: REF's Month/Department
  groups are `space-y-1` (4px label→control); the clone renders
  `space-y-2 leading-5` (8px). Fix: both groups → `space-y-1`.
- **R66-I — the requestsettings empty line**: REF's line is
  `text-slate-400 text-sm` as a space-y-2 child; the clone renders
  `text-sm text-slate-400` in a space-y-4 flow. Fix: member order +
  the container's space-y value.
- **R66-J — the tenantsetup identity circle + footer**: REF's circle
  is `w-16 h-16 bg-blue-100 rounded-full flex items-center
  justify-center mx-auto mb-4` (a space-y-4 child); the clone
  authors `mx-auto mb-[22px] …` (the 22px custom value, plus an
  mt member). REF's Continue button carries the resolved ml-auto
  (527.047 in the ~622px column) — the footer is NOT justify-end;
  the clone's footer is `flex justify-end pt-4` (ml computes 0).
  Fix: the circle → `mx-auto mb-4` (the mt retires); the footer →
  `flex pt-4` + the button gains `ml-auto`.
- **R66-K — the workflowconfigpage empty-state CTA**: REF's "Create
  First Workflow" button carries `mt-4` DIRECTLY (m=16,0,0,0, no
  wrapper); the clone wraps it in a `mt-4` div (the button reads 0).
  Fix: unwrap — the button carries the member.
- **R66-L — the performancemanagement tabs rhythm**: REF's goals grid
  is the bare `grid gap-6` (a space-y-6 child, 24px gap, no
  responsive cols member); the clone renders `grid grid-cols-1 gap-4
  sm:grid-cols-2 xl:grid-cols-3` (16px gap) and rides the shadcn
  TabsContent BASE mt-2 (8px tabs→content gap vs REF's 24px). Fix:
  the goals grid → `grid gap-6`; the Tabs root gains space-y-6 and
  both TabsContents gain mt-6 (the R61-F evaluations pattern — the
  explicit member survives the v4 flip, the root normalizes the
  census read).
- **R66-M — the shiftswap empty card**: REF's "No swap requests…"
  empty state rides inside a CARD (`rounded-xl border bg-card
  text-card-foreground shadow`, a space-y-4 child) containing the
  `w-12 h-12 mx-auto mb-3` icon + the p; the clone renders the icon +
  p BARE (no card — the r13 measurement never saw the wrapper).
  Fix: the card wrapper (REF's exact member set).
- **R66-N — the surveyanalytics chart section (a REAL layout
  restructure)**: REF renders ONE `grid md:grid-cols-2 gap-6`
  containing [Sentiment Distribution, Sentiment Trend Over Time,
  Response Count & Avg Sentiment (md:col-span-2)] — the third card
  spans full-width INSIDE the grid; the clone renders
  `space-y-6 > [grid grid-cols-1 md:grid-cols-2 gap-6 > (first two),
  the third card as a sibling]`. Visually identical at rest, but the
  structure (and the census tuples) differ. Fix: adopt REF's single
  grid + col-span form.
- **R66-O — the offboarding empty-state grid gap**: REF's empty grid
  is `grid md:grid-cols-2 lg:grid-cols-3 gap-6` (24px gap, a
  space-y-8 child); the clone's grid carries NO gap member. Fix: add
  `gap-6`. (The col-span-full card + the R13-G structure are already
  in place.)
- **R66-P — the hrassistant pane's empty-state h-full div**: REF's
  pane is EMPTY at rest (zero children); the clone renders a
  persistent `<div class="h-full"></div>` (the R65-E loader-branch
  centering div leaked into the settled state). Fix: the div renders
  only in the loading branch (the settled pane is empty).
- **R66-Q — the chat new-chat button's gap member**: REF's button is
  the shadcn base (`inline-flex items-center justify-center gap-2
  …`); the clone's R65-C2 hand-authored form dropped gap-2 (computed
  gap 0 vs REF's 8). Fix: the button gains `gap-2`.
- **R66-R — the recruitmentkanban root + drop zone**: REF's page root
  is the R10-K flat `p-4 md:p-8` (the List/Content ride the page's
  space-y rhythm); the clone nests an extra `flex flex-col space-y-6`
  wrapper (reads v:24 vs REF's flat form) and its DnD drop zone
  carries `flex min-h-32 flex-col gap-2` (REF's zone is the bare
  `min-h-32 rounded-md`). Fix: retire the middle wrapper (the
  R10-K flat root); the zone adopts REF's bare form and the gap-2
  card-stack moves to a with-data-only inner wrapper (the zero-state
  zone renders empty, the with-data DnD keeps its spacing).

## Fixes (TDD — RED first)

| ID | File(s) | Change |
|----|---------|--------|
| R66-A | `src/components/shared/page-canvas.tsx` | render the band: `absolute top-0 left-0 right-0 flex justify-center items-center h-20 -mt-20` > `div[transform:none]` > `RefreshCw w-6 h-6 text-blue-600` (aria-hidden) |
| R66-B | `src/components/shared/empty-state.tsx` + the 7 call sites | the icon branch renders the svg with `w-16 h-16 mx-auto mb-4 text-slate-300` (cloneElement); the `mb-4 flex justify-center` + `[&_svg]` wrappers retire; offboarding's icon → UserMinus |
| R66-C | `src/components/shared/stat-card.tsx` | the standard+tileFixed branch: row loses mb-3; the value becomes `text-3xl font-bold text-slate-900 mt-4` (P tag) |
| R66-D | `src/app/(app)/employees/page.tsx` | PageHeader gains `alwaysRow`; the grid → `grid md:grid-cols-2 lg:grid-cols-3 gap-6` |
| R66-E | `src/app/(app)/recruitment/page.tsx` | Tabs root `space-y-6`; TabsContent `mt-6 space-y-4`; the filter row → the bordered box; the table card keeps REF's form |
| R66-F1 | `src/app/(app)/staffrequests/page.tsx` | PageHeader `actionsBare` |
| R66-F2 | expenses, loans, recruitment, recruitmentkanban, workflowconfigpage | PageHeader `actionsUnwrapped` |
| R66-G | `src/app/(app)/companywall/page.tsx` | `space-y-3` → `space-y-2`; the Label drops `block leading-5` |
| R66-H | `src/app/(app)/payrollengine/page.tsx` | 2 × `space-y-2 leading-5` → `space-y-1` |
| R66-I | `src/app/(app)/requestsettings/page.tsx` | the p → `text-slate-400 text-sm`; the container → space-y-2 |
| R66-J | `src/app/(app)/tenantsetup/page.tsx` | the circle → `mx-auto mb-4`; the footer `flex pt-4` + Continue `ml-auto` |
| R66-K | `src/app/(app)/workflowconfigpage/page.tsx` | unwrap the CTA; the button carries `mt-4` |
| R66-L | `src/app/(app)/performancemanagement/page.tsx` | the goals grid → `grid gap-6`; Tabs root `space-y-6`; both TabsContents `mt-6` |
| R66-M | `src/app/(app)/shiftswap/page.tsx` | the empty state rides REF's card wrapper |
| R66-N | `src/app/(app)/surveyanalytics/analytics.tsx` | the single `grid md:grid-cols-2 gap-6` + the third card `md:col-span-2` |
| R66-O | `src/app/(app)/offboarding/page.tsx` | the empty grid gains `gap-6` |
| R66-P | `src/app/(app)/hrassistant/page.tsx` | the `h-full` div renders only while loading |
| R66-Q | `src/app/(app)/chat/page.tsx` | the new-chat button gains `gap-2` |
| R66-R | `src/app/(app)/recruitmentkanban/page.tsx` | the flat R10-K root (the wrapper retires); the drop zone → `min-h-32 rounded-md` + the with-data gap-2 inner stack |

## Legacy pins to amend (audited at plan time)

- `tests/unit/recipes.test.ts` session-10 StatCard block: the standard
  row/value assertions gain the tileFixed two-form contract (the R65-A
  amendment extends).
- The R10-C companywall composer pin (`space-y-3` + `block leading-5`
  label) → REF's live `space-y-2` + leading-none form.
- The R10-K recruitmentkanban root pin → the flat form.
- The R13-G offboarding grid pin gains `gap-6`.
- The R48-C7/R65-F Back-button family is untouched (requestreports is
  census-clean).

## Documented allowances (the census DIFFs that stay)

employees (the seeded grid cards: dl/span/badges — the standing
seeded-data allowance), attendance (the admin superset + the
restricted card behind the admin login — REF's demo user sees the
restricted view; the clone's seed is the admin), careers (REF's live
demo data + the clone's hero superset), interviewassistant (the
r48-C1 AI Analysis superset card + the REF-only trending-up mr-2
icon inside it), onboardingtemplates (the r36 anchor superset),
evaluations' mid-load tabs transient (the settled read matches), the
advancedanalytics hidden-tooltip artifact (r63).

## Verification plan

1. TDD RED: the R66 describe block in `tests/unit/recipes.test.ts`
   (~14 pins) — RED before the fixes; retirement assertions scoped
   per the r63 pin-defect lessons (no retired literals in comments).
2. GREEN: apply the source changes; unit green (892 + ~14).
3. E2E: `tests/e2e/session66-margin-gap.spec.ts` — computed truth:
   the scroll band (-80px top margin on /dashboard + /attendance),
   the empty-state svg mx-auto (479px on /payroll), the tileFixed
   row padding-bottom 0 + the padded row 12px, the employees row
   gap (0px) + grid gap (24px), the staffrequests actions gap-2
   (8px) + the expenses raw button (no cluster), the companywall
   group gap (8px), the payrollengine label→control gap (4px), the
   tenantsetup circle mb (16px), the surveyanalytics single-grid
   structure (grid-cols 2 at 1440 + the col-span card), the
   performancemanagement tabs→content gap (24px) + grid gap (24px),
   the hrassistant pane emptiness, the chat button gap (8px), the
   shiftswap card wrapper, the workflowconfigpage CTA margin (16px).
4. Post-fix census re-run (3 batches) — projection: **49/49 minus the
   allowance families** (the 6 standing allowances; every remaining
   DIFF's tuples byte-identical to this round's allowance dumps).
5. Full gates: lint 0/0 · tsc ✓ · unit · build ✓ (via `bun run build`)
   · E2E full suite (the flake-check protocol for any mid-suite
   failure).
6. Screenshots (the dev server running the remediated codebase) under
   `docs/screenshots/` — the fix-family pair set + the standing
   mobile drawer pair @390×844 (the mobile-menu check evidence).

## Post-fix projection

The 17 families move 24 routes from DIFF to MATCH-eligible. The
allowance routes (employees, attendance, careers, interviewassistant,
onboardingtemplates) stay DIFF with documented tuples. Census
projection ≈ 43/49 (49 − 6 allowances; evaluations' transient may
re-fire or not — its settled read MATCHes).

---

## Completion record (filled post-execution)

- **All 19 source changes applied as planned** + four execution-time
  corrections the round's own verification loop caught:
  1. **The Radix tabs rhythm correction (R66-E/L)**: the first form
     (space-y-6 Tabs root + the content mt-6) rendered a 48px
     tabs-to-content gap — the v4 space-y margin-block-end lands on the
     INLINE-FLEX TabsList whose vertical margins never collapse with
     the next sibling (the 48px trap). The corrected form adds the
     R22-B `mb-0!` kill to the List (recruitment, evaluations,
     performancemanagement): census v:24 both sides, visual 24 on
     both engines.
  2. **The shiftswap structure correction (R66-M)**: REF's pills ride
     the page space-y-8 DIRECTLY (their 32px top margin is part of the
     census truth); ONLY the card rides the space-y-4 wrapper. The
     first form wrapped pills+card together — corrected after the
     post-fix census flagged the REF-only `4,4|v:32` pills tuple.
  3. **The hrassistantchat second empty state**: the pane-bottom
     hand-authored empty (line ~340, not the shared EmptyState
     component) needed the same svg-authored form — caught by the
     post-fix census (the icon still read the wrapper form).
  4. **The workflowautomation grid gate (R66-O)**: the empty grid was
     decomposed in the batch analysis but dropped from the plan's fix
     table — the post-fix census flagged its gap tuple; gated on
     `workflows.length > 0` (the R16-B zero-render pattern).
- **Post-fix census: 45/49 MATCH — better than the 43 projection**.
  The 4 remaining DIFFs are the documented allowances: employees (the
  seeded grid cards), attendance (the admin superset + the restricted
  card behind the admin login), careers (REF's live demo data + the
  hero superset), interviewassistant (the r48-C1 AI Analysis card).
  evaluations + onboardingtemplates matched after their fixes.
- **The baseline "session-58 transient" RETIRED**: the
  switch/checkbox spec fired 3× consecutively in isolation (not the
  documented transient behavior) — root cause: the count ran
  immediately after goto with NO wait, racing the async
  security-settings fetch (0 matches while settings === null; the
  post-failure snapshot showed the correct 4 checked). The wait
  mirrors the switches block; 3× green post-fix. Its true mechanism is
  recorded as the r66 lesson 5.
- **Legacy pins amended (7)**: the R13-K payrollengine group value
  (space-y-2 → space-y-1), the R46-A1 PageCanvas non-clone REVERSAL
  (the band is cloned), the R58 tenantsetup Continue member set
  (ml-auto), the R60-E workflowconfigpage regex (the mt-4 form), the
  R14-A/C pill pins (the mb-0! member), the R30-B2 hrassistantchat
  icon form (the svg-authored member set) + the legacy session-31 E2E
  icon locator (div.text-center > svg).
- **Gates**: lint 0/0 · tsc ✓ · **910/910 unit** (+18 RED-first) ·
  build ✓ (via `bun run build`) · **360/360 E2E** (+14 in
  `tests/e2e/session66-margin-gap.spec.ts`) · post-fix census 45/49 ·
  DB pristine.
- **Screenshots**: the 368–403 pair set (36 files — the scroll-band
  pages, the svg-authored empty states, the tileFixed row, the
  employees row/grid, the recruitment tabs, the actions-cluster truth
  pair, the companywall group, the payrollengine groups, the
  tenantsetup circle, the surveyanalytics grid, the PM tabs, the
  shiftswap wrapper, the evaluations line, the kanban root, the
  hrassistant pair, the mobile drawer @390×844 as the standing
  mobile-menu check evidence). 580 screenshot files total; no ref/loc
  pair collisions; the 402 mobile pair byte-matches the r65 366 pair
  (cross-round byte-stability of the standing surface, documented).
- **Deploy watch**: the 29th login deploy detected this round (JS
  `DcjXLM5U`→`q8Uif46n` + CSS `D_pxMX7I`→`CiCfCTzx`; the app side
  quiet) — re-audited NON-VISUAL via the full ladder after a fresh
  re-auth (standing 5/5 + sweep 12/12 + verify-r49 13/13 + verify-r45
  13/13). The watch finals updated to the post-29th hashes.
- **Docs**: AGENTS session-66 layer + the six r66 instrument lessons +
  the Commands counts (910/360), CLAUDE (the 1270-spec pyramid =
  910+360, 44 spec files), README (the counts + the session-66 spec
  tail), eon-hr_SKILL.md 3.49.0 + §76 + the State line, this
  completion record, the session journals, the worklog; .env.example
  verified (only DATABASE_URL + AUTH_SECRET are read).
