# Remediation plan — session 50 (parity round 49)

> The never-deep-measured routes: this round deep-censused the ~15 routes
> whose interiors never got a full read (the round-48 frontier), including
> payrollmodule — the page whose evals kept timing out in prior rounds
> (solved with an 11s settle). Every contract below is live-measured this
> window (REF @1440×900 vs zero-tenant LOC :3201, scripts/r50-eval.txt —
> the shared deep reader).

## The round's context

- Fresh clone to `c2ed36e` (the owner's session_100 journal — docs-only
  on top of the landed round-48 `7274edb`). Baseline gates ALL GREEN:
  lint 0/0 · tsc ✓ · 771/771 unit · build ✓ (E2E 243/243 verified at
  this exact state in round 48).
- **The 16th login deploy shipped** (login JS `DCDf2KCA` → `BBQoN-vG`,
  CSS + app quiet) — the login re-audit (verify-r45) re-runs this round.
- Census instrument: `scripts/r50-eval.txt` (the deep reader: root +
  titles + 42-element outline + card structures + table th/td + tabs +
  buttons + svg classes) + `probe-r50-deep.mjs` (REF) +
  `r50-boot-loc0.mjs` (the one-call zero-tenant LOC orchestrator) +
  `probe-r50-zone.mjs` (targeted re-reads).
- **The census routes (15 deep-read both sides)**: careers,
  externaljobapplication, staffrequests, payrollengine, payrollai,
  organizationsetup, employeeportal, employeeselfservice,
  requestsettings, surveys, shiftswap, hrletters,
  notificationpreferences, surveyanalytics, payrollmodule.

## The findings (all live-measured)

### A. The glyph corrections (8 pages)

REF renders specific lucide glyphs the clone gets wrong — the
never-measured interiors hid a whole family:

1. **A1 payrollmodule**: Generate All carries `Wand2` (wand-sparkles);
   REF = `calculator w-4 h-4 mr-2`.
2. **A2 payrollengine**: Generate Payroll carries `Cog`; REF =
   `calculator w-4 h-4 mr-2`.
3. **A3 surveyanalytics**: Run AI Analysis carries `Sparkles`; REF =
   `brain w-4 h-4 mr-2`.
4. **A4 notificationpreferences**: Mark All Read carries `CheckCheck`;
   REF = `check w-4 h-4 mr-1`.
5. **A5 notificationpreferences switch rows**: the clone's
   CheckCircle2/UserPlus/XCircle/Megaphone/Info set is wrong — REF's
   six rows = mail / **bell** / **check** / **bell** / **smartphone** /
   **bell**, all `w-4 h-4 text-slate-600` (the row class
   `flex items-center justify-between py-3 border-b last:border-0`
   matches ✓).
6. **A6 notificationpreferences zero state**: `FileText` → REF
   `bell w-8 h-8 mx-auto mb-2 opacity-30` (the wrapper
   `text-center py-8 text-slate-400` + P `text-sm` already match ✓).
7. **A7 employeeportal**: the zero card renders a 64px rounded-full
   chip with `ClipboardList`; REF renders `briefcase w-8 h-8
   text-blue-600` DIRECT (inline, centered by the p-8 text-center) —
   no chip. H2 carries `mb-2`; the P carries NO mt.
8. **A8 shiftswap**: the badge icon is `CalendarDays`; REF =
   `arrow-left-right` (iconClassName text-violet-600 already ✓).
   The empty-state icon is `ArrowLeft`; REF = `arrow-left-right
   w-12 h-12 mx-auto mb-3 text-slate-300`.

### B. The structure/class fixes (7 pages)

1. **B1 shiftswap stat cards**: the four cards carry `border-slate-200
   shadow-sm` and NO icons; REF = the plain Card (default shadow) with
   the INLINE icon family: `users w-5 h-5 text-blue-600` / `clock w-5
   h-5 text-yellow-600` / `calendar w-5 h-5 text-orange-600` /
   `circle-check-big w-5 h-5 text-green-600` before each P/P pair.
2. **B2 shiftswap tab pills**: `h-9` → REF `py-2`; the inactive
   `hover:bg-slate-100` → REF `hover:bg-slate-50` (full REF form:
   `px-4 py-2 text-sm font-medium rounded-lg transition-colors
   text-slate-600 hover:bg-slate-50`; active `bg-violet-600 text-white`
   ✓ already).
3. **B3 shiftswap empty card**: the Card carries `border-slate-200` +
   CardContent `p-6` + a `py-10 text-center` + `mb-3 flex justify-center`
   wrapper; REF = the plain Card + CardContent `p-12 text-center` + the
   icon DIRECT (`w-12 h-12 mx-auto mb-3 text-slate-300`) + P
   `text-slate-500` (no text-sm).
4. **B4 staffrequests**: the "My Requests (N)" toggle is a hand-rolled
   chip button (aria-pressed) + a `mt-2` Card wrapping content; REF =
   the **Radix Tabs form**: TabsList `inline-flex h-9 items-center
   justify-center rounded-lg bg-muted p-1 text-muted-foreground` + a
   single TabsTrigger (the Radix variant classes with
   data-[state=active]:*) + TabsContent `mt-2` with the zero state
   DIRECT inside (no Card): `DIV[text-center py-16]` > file-text
   `w-12 h-12 mx-auto mb-3 text-slate-300` + P `text-slate-500` + the
   CTA button carrying `mt-4` ITSELF (no wrapper div; the dark-variant
   surface stays — bg-primary token ≡ #171717, the session-6/r32-A
   documented translation). The with-data Table stays the clone's
   superset (REF is at zero — with-data unverifiable).
5. **B5 payrollmodule**: the search icon carries `pointer-events-none`
   + `text-muted-foreground`; REF = `absolute left-3 top-1/2
   -translate-y-1/2 w-4 h-4 text-slate-400` (no pointer-events-none,
   the slate-400 literal). The table wrapper `w-full overflow-x-auto` →
   REF `overflow-x-auto` (drop w-full). The th family: REF = the bare
   `text-left py-3 px-4 font-medium text-slate-500` — the component's
   `align-middle` + `[&:has([role=checkbox])]` extras are inert
   (browser-default vertical-align; the guard needs a checkbox) —
   normalized, not stripped (the r48 precedent).
6. **B6 payrollengine**: both the toolbar Card and the zero-state Card
   pass `border-0` only; REF = `border-0 shadow-sm` (the base shadow
   vs REF's shadow-sm).
7. **B7 requestsettings**: both Cards carry `border-slate-200` (REF =
   the plain Card); both CardContents are `p-6` (REF = `p-6
   space-y-4`); both card subtitles are `text-muted-foreground` (REF =
   `text-slate-500`); both Plus icons are `mr-2` (REF = `mr-1`).
8. **B8 hrletters**: CardTitle passes `className="leading-none"`;
   REF = the plain `font-semibold leading-none tracking-tight` (the
   byte-parity backlog's CardTitle per-page form, now live-measured).

### C. Verified-matching (no change; pinned for regression)

- **payrollmodule**: root `p-4 md:p-8 space-y-8 min-h-screen
  bg-gradient-to-br from-green-50 to-emerald-50`, badge-less H1
  text-3xl + P mt-1, the month input, the dollar-sign stat family
  (green/blue/emerald/yellow w-5 h-5), the CardTitle `Payslips —
  October 2026` (plain form), the card header `border-b
  border-slate-200`, the zero row `py-12 text-center text-slate-400`.
- **surveyanalytics**: root `p-4 md:p-8 space-y-8 … from-teal-50
  to-slate-50`, H1 text-3xl badge-less, the icon-stat family
  (message-square blue / minus yellow / users purple / trending-up
  green, w-5 h-5 + P/P), the text-base CardTitles, the Export button,
  the recharts surfaces.
- **surveys**: root `from-teal-50 to-cyan-50`, the badge (message-square
  teal-600 — guard-size translation), the DIV/DIV stat family, the
  hidden w-6 h-6 icon set, the border-slate-200 cards, "0%" tight
  textContent.
- **payrollai**: root `from-green-50 to-blue-50`, badge sparkles
  green-600, the P/P stats, the hidden icon set, the zero card p-12,
  "All Clear!". (mb-0 on stats = inert no-op member — normalized.)
- **requestsettings**: the Back ghost + H1 text-2xl + the CardTitle
  `leading-none tracking-tight flex items-center gap-2` form + shield
  blue-600 / users purple-600 + the Level approvers P family.
- **staffrequests**: root `flex-1 overflow-auto`, H1 text-2xl + P
  mt-1, the filter selects, the search input, "(0)" tight textContent
  (the raw-probe lesson: the agent-browser childNodes read shows React
  SSR comment separators as phantom " " nodes — textContent itself is
  tight).
- **externaljobapplication / employeeportal cards**: the gradient
  roots + max-w-md shadow-xl cards match.
- **organizationsetup / dynamicdashboard**: the R31-B1 dashboard-alias
  pins (re-export, not redirect) hold — REF redirects to /Dashboard
  (its casing quirk), the clone renders the identical portal content
  in place.
- **employeeselfservice**: the pinned ess superset (REF spins a
  forever-loader for this user; the clone renders the full portal).
- **careers**: the r33/r40 pins hold (the zero-data No Open Positions
  card + the with-data Browse-by-Company chips — REF carries live
  company data today).

### D. The documented allowances (verify-r49 normalizations)

- **The badge-span leading-5 no-op**: REF's badge spans are per-page
  inconsistent — the verify-r48 hero pages carry `text-sm font-medium
  leading-5 text-slate-700`, today's five badge pages (payrollengine,
  payrollai, surveys, shiftswap, hrletters) render `text-sm
  font-medium text-slate-700` (no leading-5). text-sm's default
  line-height IS 1.25rem = leading-5 → render-identical. The shared
  component keeps the leading-5 form; verify normalizes.
- **The guard-size translations**: badge/button icons without explicit
  sizes ride the parent's `[&_svg]:size-4` (or the Button base's
  `[&_svg]:size-4`) — render-equal to REF's explicit `w-4 h-4`.
- **The th inert extras**: `align-middle` (the th default) + the
  `[&:has([role=checkbox])]:pr-0` guard — no-ops on these tables.
- **Member-order variances** + the `#171717 ≡ bg-primary` +
  `neutral-500 ≡ muted-foreground` + `bg-secondary ≡ bg-muted` token
  pairs (the standing r15/r48 translations).

## The fixes (file map)

1. `src/app/(app)/payrollmodule/page.tsx` — A1, B5.
2. `src/app/(app)/payrollengine/page.tsx` — A2, B6.
3. `src/app/(app)/surveyanalytics/analytics.tsx` — A3.
4. `src/app/(app)/notificationpreferences/page.tsx` — A4, A5, A6.
5. `src/app/(app)/employeeportal/page.tsx` — A7.
6. `src/app/(app)/shiftswap/page.tsx` — A8, B1, B2, B3.
7. `src/app/(app)/staffrequests/page.tsx` — B4 (+ A8's search/file-text
   color literals).
8. `src/app/(app)/requestsettings/page.tsx` — B7.
9. `src/app/(app)/hrletters/page.tsx` — B8.
10. Unit pins (the round-50 block in `tests/unit/recipes.test.ts`) +
    any predecessor amendments.
11. `tests/e2e/session-50-interiors.spec.ts` (~8 tests) + the suite.
12. `scripts/verify-r49.mjs` — the round's live pairs (~16 routes).
13. Screenshots + docs + worklog + the login re-audit (verify-r45 on
    the 16th deploy).

## The verification gates

lint 0/0 · tsc ✓ · unit (771 + the round-50 pins) · build ✓ · E2E
(243 + ~8) · verify-r49 (the census pairs, member-set normalized) ·
verify-r45 (the 16th login deploy re-audit) · standing audits + route
sweep · DB pristine · `.env.example` verified.
