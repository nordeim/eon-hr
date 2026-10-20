# Remediation Plan — Session 63 / Parity Round 62: The Light-Mode Text-Color Census

**Census instrument**: `scripts/r63-lighttext-census.mjs` — the computed
`color` of every text-bearing element in `main` — headings, text leaves,
svgs, **BUTTONS INCLUDED** (button text/icon colors were never read by any
prior census in ANY theme — the r60/r61 blind spot closed this round) —
plus input/textarea `::placeholder` colors, all 49 routes, paired live in
LIGHT mode. Deduped (tag|color) set comparison. Batches 17/17/15 with DIFF
dumps saved to `/tmp/r63-b{1,2,3}.log`. Pre-fix: **26/49 MATCH, 23 DIFF**.
Decomposition: `scripts/r63-probe.mjs` (element inventory with signatures
+ hidden/kicker flags) + `r63-probe-cmp.mjs` (symmetric set diff) +
`r63-probe{2,3,4,5}.mjs` (targeted DOM contexts + the dark pairs).

## The recorded gaps this round fills

1. **No computed-color text census ever ran in LIGHT mode** — r60/r61
   read text in DARK only; the light recipes were pinned member-level in
   rounds 1–58 (byte comparisons, not computed reads).
2. **Button text/icon colors were never censused in any theme** — the
   r59 census read button FILLS, the r61/r62 censuses read button
   BORDERS, but no census ever read what the buttons' text computes to.
3. This census is the vehicle for the documented byte-parity backlog:
   REF's `--muted-foreground` = neutral-500 #737373 light (the clone's
   token pins slate-500 #64748b) — the un-compensated token riders
   surface as computed diffs.

## Root causes (families)

- **A. The placeholder token rider (the dominant — 15 routes)**: REF's
  `::placeholder` rides ITS `--muted-foreground` — #737373 light /
  #a3a3a3 dark. The clone's Input/Textarea bases carry
  `placeholder:text-muted-foreground` → the clone's token renders
  #64748b light (WRONG — a visible slate-blue tint shift) / #a3a3a3 dark
  (correct — why the r60/r61 dark censuses matched). Routes: employees,
  payroll, compliancedashboard, assetmanagement, staffrequests,
  companywall, chat, documenttracker, recruitmentkanban,
  interviewassistant, payrollmodule, hrassistant, requestsettings,
  tenantsetup, careers.
- **B. The empty-trigger foreground override (hrreports Group By)**:
  the clone's empty Group By select fires Radix's data-placeholder →
  the R37-E neutral literal paints it #737373. REF's empty trigger has
  NO data-placeholder attribute (its runtime mounts differently) and
  renders the trigger's own FOREGROUND pair: #0a0a0a light / #fafafa
  dark (live-measured both). A both-theme divergence invisible to every
  prior census (the trigger is a BUTTON — button text was never read).
- **C. The profile kicker subtitle was pinned dark-only (R61-O)**:
  REF's kicker subtitle = slate-500 #64748b in LIGHT (live-measured at
  390×844) and slate-400 #94a3b8 in dark (the r61 measurement). The
  r61-O pin froze slate-400 UNFLIPPING — wrong for light.
- **D. The shiftcalendar assign affordance is iconed**: REF's button =
  `text-xs text-slate-300 hover:text-blue-500 flex items-center gap-0.5
  mt-1` + a `lucide-plus w-3 h-3` icon before the "assign" text
  (unflipping slate-300 both themes, live-measured). The clone renders
  the button text-only without gap-0.5/mt-1.
- **E. The shiftcalendar summary header carries an icon + structural
  members**: REF = header `flex flex-col space-y-1.5 p-6 border-b
  border-slate-100 pb-3` > title div `font-semibold tracking-tight
  text-base flex items-center gap-2` with a `lucide-users w-4 h-4`
  icon riding the foreground pair (10,10,10 light / 250,250,250 dark —
  same color as the clone; the icon + members are the divergence; the
  census "color diff" here was a children-filter artifact: REF's
  title carries children → invisible to the leaf read, the clone's
  childless title showed as an extra set member).
- **F. The recruitment AI Score th carries a trending-up icon**: REF =
  `lucide-trending-up w-3 h-3` inside a `flex items-center gap-1` div
  within the th (font-semibold text-slate-600, unflipping — the th
  color already matches; only the icon is missing).
- **G. The attendance restricted card's recipe pair**: REF's icon is
  **lucide-x** (`w-8 h-8 text-red-500`, unflipping) — NOT ShieldAlert
  (the r61-W fix corrected the color but the shape was never measured —
  color censuses cannot see icon shapes); and the h3 is
  **text-slate-800** (`text-lg font-semibold text-slate-800 mb-2`,
  30,41,59 both themes — the clone pins slate-900). Both surfaces
  render for non-admin users only — recipe-aligned per the r61-W
  precedent (the admin seed cannot census them).

## Fixes (TDD — RED first)

| ID | File(s) | Change |
|----|---------|--------|
| R63-A | `src/components/ui/input.tsx` (Input + Textarea bases) | `placeholder:text-muted-foreground` → `placeholder:text-[#737373] dark:placeholder:text-[#a3a3a3]` (REF's muted pair as literals — the established R62-B pattern; the token stays pinned for the subtitle/tab parity) |
| R63-B | `src/app/(app)/hrreports/page.tsx` | the Group By `<SelectTrigger id="hr-group" className="mt-1 w-full">` → `"mt-1 w-full data-[placeholder]:text-foreground"` (the empty trigger renders REF's foreground pair; the R37-E neutral literal on the BASE stays — the loans dialog placeholder pin is untouched) |
| R63-C | `src/app/(app)/profile/page.tsx` | `mobileKickerSubtitleClassName="text-slate-400"` → `"text-slate-500 dark:text-slate-400"` (REF's live pair, both themes measured) |
| R63-D | `src/app/(app)/shiftcalendar/page.tsx` | the assign button → `className="text-xs text-slate-300 hover:text-blue-500 flex items-center gap-0.5 mt-1"` + `<Plus className="w-3 h-3" aria-hidden="true" />` before the "assign" text |
| R63-E | `src/app/(app)/shiftcalendar/page.tsx` | the summary header → `flex flex-col space-y-1.5 p-6 border-b border-slate-100 pb-3`; the title div → `font-semibold tracking-tight text-base flex items-center gap-2` + `<Users className="w-4 h-4" aria-hidden="true" />` |
| R63-F | `src/app/(app)/recruitment/page.tsx` (both tables) | the AI Score `<TableHead>` gains `<div className="flex items-center gap-1"><TrendingUp className="w-3 h-3" aria-hidden="true" />AI Score</div>` (+ the TrendingUp import) |
| R63-G | `src/app/(app)/attendance/page.tsx` | the restricted icon `<ShieldAlert className="h-8 w-8 text-red-500">` → `<X className="h-8 w-8 text-red-500" aria-hidden="true" />`; the h3 → `mb-2 text-lg font-semibold text-slate-800` (+ the X import; ShieldAlert removed if unused) |

## Legacy pins to amend (the re-measured-truth protocol)

- **R39-D1** (the Input base): the placeholder member → the literal pair.
- **R61-O** (the profile kicker subtitle): the unflipping slate-400 →
  the flipping pair.
- **R61-W** (the restricted icon): ShieldAlert red-500 → the X icon
  (color member unchanged).

## Documented allowances (no fix — verified this round)

- **advancedanalytics** — the hidden recharts-tooltip label: REF's
  recharts mounts the tooltip node WITH a default label ("May"),
  `visibility: hidden` at rest; the clone's recharts mounts it empty.
  Invisible in every at-rest state — a census artifact (the new
  visibility lesson), not a visual divergence. Hover parity holds (both
  render Tooltip elements).
- **employees** — the seeded data leaves + REF's transient refresh-cw
  loading icon (r61-documented, re-confirmed).
- **careers** — REF's live demo company data.
- **attendance** — the admin superset cards (Today's Overview h2 +
  Latest 5 span; census-visible by design — R61-documented).
- **onboardingtemplates** — the 404 Go-Home `<a>` superset (r36).
- **interviewassistant** — the r48-C1 AI Analysis superset card.
- **taskmanager / loans** — the transient mid-load census reads (both
  re-read MATCH at steady state; confirmed via r63-probe3).
- **profile** — the asChild back-arrow tag artifact (the r61
  hidden-kicker artifact; computed colors identical).

## Verification plan

1. TDD RED: the R63 describe block in `tests/unit/recipes.test.ts`
   (~9 pins) — RED before the fixes.
2. GREEN: apply A–G; amend the three legacy pins; unit suite green
   (873 + new).
3. E2E: `tests/e2e/session63-light-text.spec.ts` — the computed pairs,
   both themes where applicable (setDark AFTER goto — the r62 lesson):
   the placeholder pair (payroll search input), the Group By trigger
   pair, the kicker subtitle pair @390, the assign button icon + color,
   the summary title icon + foreground pair, the AI Score th icon.
4. Post-fix census re-run (3 batches) — projection: **45/49** (the
   remaining DIFFs = the eight documented allowances: advancedanalytics,
   employees, careers, attendance, onboardingtemplates,
   interviewassistant, + the transient pair documented as timing).
5. Full gates: lint 0/0 · tsc ✓ · unit · build ✓ · E2E full suite
   (kill the manual :3200 server first — the rate-limiter trap).
6. Screenshots (the dev server running the remediated codebase) under
   `docs/screenshots/` (the 314+ pair set).

## Post-fix census projection

26 → **45/49** MATCH. Remaining DIFFs = the documented allowances above.

---

## Completion record (filled post-execution)

- **Fixes A–G applied as planned.** Two plan-level corrections made
  during execution: (1) R63-B's trigger override gained the
  `dark:data-[placeholder]:text-foreground` member — the light-only
  override left the base's dark neutral member live (cn()/tw-merge
  replaces the base member PER VARIANT; the E2E dark assertion
  caught it); (2) R63-D's "+N more" overflow button KEEPS the r11
  recipe — it renders only when a cell holds >2 assignments
  (REF-unmeasurable at the demo's zero state), so the retirement
  assertion was scoped to the assign affordance and the sharer
  pinned positively.
- **Legacy pins amended per the re-measured-truth protocol**:
  R39-D1 (the Input base's placeholder literal pair), R61-O (the
  flipping kicker pair — unit + the session-61 E2E spec), R61-W (the
  X icon). Three pin defects of the amendment phase fixed: the
  attendance source comment contained the retired icon name (broke
  the `.not.toContain`), the session-14 hrreports regex window broke
  twice as the recipe comment grew (300→900→1200, re-anchored on
  `>Group By</Label>`), and the globally-scoped assign-class
  `.not.toContain` hit the "+N more" sharer.
- **Post-fix census: 41/49 MATCH** (pre-fix 26/49). The plan's
  "45/49" projection was an arithmetic slip — its own allowance
  list contains EIGHT routes (advancedanalytics, employees, careers,
  attendance, onboardingtemplates, interviewassistant, taskmanager
  the transient, profile the back-arrow artifact) and 49−8 = 41.
  Measured truth: 41/49 with every DIFF decomposed to its documented
  allowance — employees (the seeded leaves + REF's transient
  refresh-cw), taskmanager (the mid-load read; steady-state MATCH
  re-confirmed), profile (the asChild back-arrow tag artifact),
  attendance (the admin superset — REF's side renders the R63-G
  restricted card exactly: the h3 slate-800 + the red-500 X,
  census-verified), interviewassistant (the r48-C1 superset card),
  advancedanalytics (the hidden recharts-tooltip artifact),
  onboardingtemplates (the 404 `<a>` superset), careers (REF's live
  data).
- **Gates**: lint 0/0 · tsc ✓ · **880/880 unit** (+7, the R63 block
  RED-first) · build ✓ · **333/333 E2E** (+6 in
  `tests/e2e/session63-light-text.spec.ts` + the session-61 R61-O
  spec amended to the flipping pair) — the two documented
  transients (the session-58 switch/checkbox flake + the session-40
  dialog-animation read) each fired once mid-verification, both
  5/5 in isolation per the flake-check; DB pristine.
- **The standalone static-copy trap discovered**: `npx next build`
  alone leaves `.next/standalone/.next/static` EMPTY — the E2E run
  against the uncopied build served UNSTYLED pages (computed colors
  read as the Chrome UA defaults, ::placeholder rgb(117,117,117));
  always build via `bun run build` (the copy steps live in the
  script). Recorded in the r63 instrument lessons.
- **Screenshots**: the 314–325 pair set (12 files, hash-verified
  distinct — the 320 pair captured at 390×844 after the
  single-viewport collision made the desktop 318/320 pair
  byte-identical; fresh agent-browser sessions used when the
  viewport state went stale after restore cycles). 502 screenshot
  files total.
- **Deploy watch**: the 26th login deploy (JS Doo5f9jm→D3ArZVPB +
  CSS A8a43VEI→OJK0Y98H) was detected mid-round by this round's own
  instrument and re-audited NON-VISUAL via the full ladder (standing
  5/5 + sweep 12/12 + verify-r49 13/13 + verify-r45 13/13); the
  watch finals updated to the post-26th truths; both sides quiet at
  round close.
- **Docs**: AGENTS session-63 layer + the r63 instrument lessons +
  the Commands counts (880/333), CLAUDE (the 1213-spec pyramid), the
  README spec tails + counts, eon-hr_SKILL.md 3.46.0 + §73 + the
  State line, docs/session_129.md (the narrative), this completion
  record, the worklog; `.env.example` verified (only DATABASE_URL +
  AUTH_SECRET are read).
