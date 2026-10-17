# Remediation plan — session 49 (parity round 48)

> Re-execution note: the original round-48 working tree (plan + GREEN
> changes) was lost to a workspace reset before the push landed. This
> plan was rebuilt from a FRESH census (REF @1440×900 vs zero-tenant
> LOC :3201, this window) following the same block structure; every
> contract below is live-measured, not remembered.

## The round's context

- Continuation window: fresh `git clone` to `9d0222b` (round-47 +
  the owner's session_98 journal; docs-only delta). Baseline gates
  ALL GREEN: lint 0/0 · tsc ✓ · 745/745 unit · build ✓ (E2E rides
  the same build).
- The census instrument family: `scripts/probe-r49-*.mjs` (headers,
  path, zone, sub, eval) + `scripts/r49-boot-loc0.mjs` (the one-call
  orchestrator: zero-db push + seed + :3201 boot + loc0 re-auth +
  reader — the sandbox reaps background children between calls, so
  every LOC read runs inside one process tree).
- **The shell-quoting trap (this round's tooling lesson)**: the demo
  password `$Abcd1234` inside DOUBLE quotes gets variable-expanded by
  the shell → the login fills an empty password. Single-quote it.

## The findings (all live-measured, REF @1440×900 vs zero-tenant LOC)

### A. The hero-block architecture (universal)

REF renders the hero block (badge + h1 + subtitle) as a CLASSLESS
`DIV[]` on EVERY measured page — taskmanager and leavemanagement
included. The clone's `min-w-0` (+ `flex-1` when centered) block
wrapper is a universal divergence (the round-47 C4 "documented
translation" was wrong — this round re-measured and flipped it).

1. **A1 — the block wrapper**: drop `min-w-0`; the centered variant
   renders `text-center` ONLY (no flex-1 — centered pages are all
   row-less, so the fill-the-row rationale never applies).
2. **A2 — the BARE family (15 pages, NO hero row at all)**: REF
   renders the hero block as a DIRECT child of the content wrapper.
   organogram/companywall/evaluations/training/hrassistant →
   `DIV[text-center]`; reports/interviewassistant/securitysettings/
   communications/settings/profile/analytics/notificationpreferences/
   announcements → `DIV[]`; hrassistantchat → `DIV[mb-6]`.
   New `bare` prop: PageHeader renders no row — the block only.
3. **A3 — the always-row families** (REF true always-rows, the clone
   still renders the responsive superset):
   - `flex justify-between items-start` — offboarding,
     compliancedashboard, performancemanagement, workflowautomation,
     allleaverequests, payrollai, assets, advancedanalytics.
   - `flex items-center justify-between` — hrreports,
     requestreports; the mb-variants templates `… mb-8`,
     workflowconfigpage `… mb-6`.
   New `alwaysRow` prop: the row renders the unprefixed members only.
4. **A4 — the responsive md-family passes**: taskmanager,
   leavemanagement, expenses (kicker + `hidden md:flex flex-col
   md:flex-row justify-between items-start md:items-center gap-4`)
   still ride the sm family on the clone → `rowBreakpoint="md"`.
   loans + payrollreports render the SHORT hidden row
   `hidden md:flex justify-between items-start` (no responsive
   members) — loans passes today with the full form.
5. **A5 — the actions clusters**: REF wraps MULTI-button clusters in
   `flex gap-3` (taskmanager) or `flex gap-2` (hrreports,
   requestreports — BARE, no flex-wrap/items-center) and renders
   SINGLE actions DIRECTLY in the row (leavemanagement, assets,
   payrollreports' WhatsApp). New `actionsBare` (the `flex gap-2`
   cluster) + `actionsUnwrapped` (no wrapper) props; the default
   `flex flex-wrap items-center gap-3` stays for the responsive
   families (the r15-C fitting superset).

### B. The C-page contracts

1. **C1 — interviewassistant**: hero `DIV[]` (bare) + the two-card
   grid `grid lg:grid-cols-2 gap-6` (clone: `grid grid-cols-1 gap-4
   lg:grid-cols-2`) — Select Candidate card + Interview Notes card;
   the clone's analysis features stay (superset).
2. **C2 — securitysettings**: bare hero + the alert card
   `rounded-xl text-card-foreground shadow border-2 border-orange-500
   bg-orange-50` + `p-6 > flex items-center gap-4` + circle-alert
   `w-12 h-12 text-orange-600` + DIV > H3 `text-lg font-semibold
   text-orange-900` + P `text-sm text-orange-700`; feature rows
   `flex items-center justify-between p-4 bg-slate-50 rounded-lg` >
   `flex items-center gap-3` > old-shadcn checkbox (NO
   data-[state=checked]:border-primary) + LABEL `text-base
   font-medium cursor-pointer` + slate Badge DIV; recommendations
   `flex gap-3` > circle-check-big `w-3 h-3 mr-1` + P > STRONG.
3. **C3 — payrollreports** (full rebuild): kicker w/ back button
   (h-9 w-9 + select-none) + SHORT hidden row `hidden md:flex
   justify-between items-start` + classless hero (badge
   chart-column `w-4 h-4 text-blue-600`, H1 `text-4xl font-bold
   text-slate-900 mb-2`, P `text-slate-600`) + WhatsApp button
   DIRECT in row (`shadow h-9 px-4 py-2 bg-green-600 hover:bg-
   green-700 text-white gap-2`; mobile copy in `DIV[md:hidden]` +
   w-full) + TabsList `h-9 items-center justify-center rounded-lg
   bg-muted p-1 text-muted-foreground grid grid-cols-4 w-full
   md:w-auto` + Radix-verbatim panels (`… space-y-4 mt-4`) + th
   `px-4 py-3 text-left/text-right…`; the tax/history/custom cards
   are the clone's superset (REF tabs are inert).
4. **C4 — chat**: root + card-only wrap verified MATCH (class order
   is the only variance — render-neutral, stays).
5. **C5 — hrreports**: alwaysRow + bare block + actionsBare; labels
   `text-xs text-slate-500` (twMerge: text-xs lands AFTER
   font-medium — member-wise assertions); th `px-3 py-2 text-left
   text-xs font-semibold text-slate-600 uppercase`; the nprefs minis
   keep the bare variant (no border-slate-200).
6. **C6 — evaluations**: bare hero + the value-in-tile stats — card
   `rounded-xl border bg-card text-card-foreground shadow
   border-slate-200` > `p-4 flex items-center gap-3` > tile
   `w-10 h-10 rounded-xl bg-slate-100` > SPAN `text-lg font-bold
   text-slate-700` (the VALUE lives in the tile) + SPAN `text-sm
   text-slate-600`; TabsList `h-9 … p-1 text-muted-foreground
   bg-white border border-slate-200 grid w-full max-w-lg mx-auto
   grid-cols-3` + panels `mt-2 … space-y-6`.
7. **C7 — requestreports**: row `flex items-center justify-between`
   + hero `flex items-center gap-3` (Back ghost `h-8 rounded-md
   px-3 text-xs` + DIV > H1 `text-2xl font-bold text-slate-900` +
   P `text-slate-500 text-sm`) + actionsBare + the HORIZONTAL bare
   stats: card `rounded-xl border bg-card text-card-foreground
   shadow` > `p-4 flex items-center gap-3` > tile `w-10 h-10
   rounded-lg bg-blue-100 flex items-center justify-center` >
   svg `w-5 h-5` + DIV > P `text-2xl font-bold text-slate-900` +
   P `text-xs text-slate-500`; th `pb-2 pr-4` (bare).
8. **C8 — analytics**: the bare root — `p-4 md:p-8` wrapper ONLY
   (no min-h-screen, no gradient) > `max-w-7xl mx-auto space-y-8` >
   classless hero (H1 `text-3xl font-bold text-slate-900`).
9. **C9 — recruitmentkanban**: the p-4 root's row = the md family
   `flex flex-col md:flex-row items-start md:items-center
   justify-between gap-4` + classless hero (H1 `text-2xl font-bold
   text-slate-900`).

### E. The chart gridline family

REF renders DUAL-direction CartesianGrids on every chart page
(analytics 2H/2V, attendancedashboard 7H/19V, analyticsdashboard
17H/22V, surveyanalytics 10H/4V, advancedanalytics 10H/14V,
hrreports 2H/2V). The clone pins `vertical={false}` on all 14
instances across the 6 charts.tsx files → drop the flag (the
Recharts default renders both directions).

### F. The avatar module (functional superset)

REF /profile renders a "Change Photo" button + hidden file input
(measured). The clone gains the WORKING upload: `POST
/api/profile/avatar` (guard + requireUser + parseBody, data-URL
body, 96px canvas downscale, optimistic swap) + the purge script
resets the demo user's avatarUrl (keeps E2E pristine).

### G. The quick fixes (verify-found)

1. profile: the stray wrap-level footer P (icon-only check-circle
   cruft) — remove.
2. hrassistant badge icon: purple-600 → `text-blue-600` (REF bot
   glyph); assets badge icon: blue-600 → `text-green-600` (REF
   laptop glyph).
3. securitysettings checkbox: drop `data-[state=checked]:
   border-primary` (REF lacks it).
4. payrollreports WhatsApp: `text-white` (NOT
   text-primary-foreground — #fff vs #fafafa).
5. Button: drop `cursor-pointer` (REF's buttons carry none).

## The fixes (file map)

1. `src/components/shared/page-header.tsx` — A1/A2/A3/A5 (bare,
   alwaysRow, actionsBare, actionsUnwrapped, the block rewrite).
2. `src/components/shared/stat-card.tsx` — the horizontal bare form
   (C7) + the value-in-tile form (C6).
3. `src/components/ui/button.tsx` — G5.
4. `src/components/ui/checkbox.tsx` — G3.
5. The BARE-15 + alwaysRow + md-row page passes (~30 pages).
6. `src/app/(app)/payrollreports/page.tsx` — the C3 rebuild.
7. `src/app/(app)/securitysettings/page.tsx` — C2 interior.
8. `src/app/(app)/interviewassistant/page.tsx` — C1.
9. `src/app/(app)/requestreports/page.tsx` + hrreports + evaluations
   + analytics + recruitmentkanban — C5-C9.
10. The 6 `charts.tsx` files — E.
11. `src/app/api/profile/avatar/route.ts` (new) + profile wiring +
    `tests/e2e/purge-test-data.ts` — F.
12. Unit pins (`tests/unit/recipes.test.ts` round-48 block) + the
    predecessor amendments (the evolved hero/row/cluster forms).
13. `tests/e2e/session49-bare-interiors.spec.ts` (~14 tests).
14. `scripts/verify-r48.mjs` — the round's live verification pairs.
15. Screenshots + docs + worklog.

## The verification gates

lint 0/0 · tsc ✓ · unit (745 + round-48 pins, amended predecessors
green) · build ✓ · E2E (228 + ~14) · verify-r48 (the round pairs,
sort-normalized for member order) · standing audits + route sweep ·
DB pristine · `.env.example` verified.
