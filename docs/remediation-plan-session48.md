# Remediation plan — session 48 (parity round 47)

## The round's context

- Continuation window: fresh `git pull` to `def9974` (round 46 + the
  session-96 journal; docs-only delta). Env intact (both LOC servers
  alive; the loc session cookie re-authenticated — the standing-audit
  LOC-auth blip). Baseline gates ALL GREEN: lint 0/0 · tsc ✓ · 718/718
  unit · build + E2E verified at this exact code state in round 46.
- **Redeploy watch: the 14th login deploy** (login JS `Dwv9uuCD` →
  `CSVhrsEz`; CSS `CpjiugAb` quiet; app `C-IrDy5f`/`BGNH4KkS` quiet).
  Per the round-42 precedent the full login re-audit ran: **verify-r45
  13/13 MATCH** — the 14th deploy is visually quiet.
- Standing audits 5/5 + route sweep 12/12.
- **The round's vein — the unmapped-route interiors**: r46 covered 12
  canonical routes; this round censused the REMAINING ~46 (three census
  batches + the systematic rows/stats/rootmap readers + targeted zone
  reads), all live-measured REF @1440×900 vs the zero-tenant clone
  (:3201).

## THE INSTRUMENT CORRECTION (this round's transferable lesson)

The census/zone readers join adjacent child text nodes with `' '` —
JSX interpolation (`Peer Approval ({count})`) produces phantom spaces
(`Peer Approval ( 0 )`). Raw-textContent verification DISSOLVED the
entire suspected "space-in-template" family (shiftswap, surveys,
analytics, securitysettings, hrreports' "Data Table (0 records)",
the dashboard welcome line — all byte-identical renders). **Lesson
(the r46 census lesson extended): a text-outline instrument may never
be trusted for spacing claims — compare raw `textContent` only.**
The REAL text diffs found instead: advancedanalytics' two stat labels
("Avg Tenure (months)" / "At Risk (AI Prediction)").

## The findings (all live-measured, REF @1440×900 vs zero-tenant LOC)

### A. The kicker family (2 real diffs)

1. **A1 — the kicker H1 lacks `dark:text-white`** on EVERY clone kicker
   (measured: leavemanagement, expenses, loans, payroll + the REF
   reference reads) — a REAL dark-mode diff. Component-level fix
   (`page-header.tsx`).
2. **A2 — the dashboard's hand-rolled kicker is the pre-r46 form** —
   `md:hidden border-b border-slate-200 bg-white px-4 py-3` vs REF's
   current verbatim `md:hidden sticky top-0 z-20 bg-white
   dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800
   px-4 py-3 safe-area-top` (the r46 A5 fix updated the PageHeader
   component but the dashboard page hand-rolls its own kicker — a
   miss). Its h1 lacks `dark:text-white` too. Fixes the aliases
   (dynamicdashboard/organizationsetup re-export the dashboard).

### B. The page-root families (the rootmap, 48 routes)

1. **B1 — the v3 gradient swaps** (27 pages still ship the r46-era
   arbitrary `bg-[linear-gradient(to_right_bottom,…)]` form):
   compliancedashboard (red→orange), performancemanagement
   (slate→indigo), organogram (teal→green), surveys (teal→cyan),
   companywall (slate→blue), chat (slate→blue), evaluations
   (indigo→purple), shiftcalendar (violet→indigo), hrletters
   (indigo→purple), offboarding (slate→blue), analyticsdashboard
   (slate→blue), attendancedashboard (blue→cyan), surveyanalytics
   (teal→slate), advancedanalytics (slate→blue), reports
   (slate→blue), payrollreports (blue→indigo), payrollai
   (green→blue), payrollengine (emerald→teal), payrollmodule
   (green→emerald), interviewassistant (purple→indigo),
   workflowautomation (slate→purple), hrossistantchat
   (purple→blue), securitysettings (slate→blue), shiftswap
   (violet→blue), allleaverequests (blue→indigo), communications
   (purple→blue), assets (green→blue).
2. **B2 — the content wrappers** — REF `max-w-Nxl mx-auto space-y-N`
   vs the clone's trap-4 mitigation `mx-auto flex w-full max-w-Nxl
   flex-col gap-N`: adopt the verbatim forms WITH the per-page trap-4
   audit (authored mt/mb on direct children) + trap-6 audit (hidden
   first sibling → the raised rows keep their mt-8, which together
   with v4 space-y reproduces v3 geometry exactly — kicker mb-32 at
   mobile, row mt-32 at desktop). Special forms: organogram
   `max-w-full` (NOT 7xl!), chat + hrossistantchat `max-w-7xl
   mx-auto` (NO space-y), hrreports root `p-6 space-y-6 max-w-7xl
   mx-auto`, workflowconfigpage `p-6 max-w-5xl mx-auto` (no space),
   notificationpreferences `p-6 max-w-3xl mx-auto space-y-6`.
3. **B3 — the merged-root five** (assetmanagement, analyticsdashboard,
   attendancedashboard, surveyanalytics, payrollmodule): REF carries
   `p-4 md:p-8 space-y-8` + gradient ON THE ROOT — NO inner max-w
   wrapper at all (full-width content). Drop the clone's inner
   wrapper.
4. **B4 — the bare roots**: announcements `p-4 md:p-8 space-y-6` (no
   gradient, no min-h, no max-w), recruitmentkanban `p-4 md:p-8
   space-y-6` (no max-w), requestreports `p-4 md:p-8 max-w-7xl
   mx-auto space-y-6` + requestsettings `p-4 md:p-8 max-w-5xl
   mx-auto space-y-6` (both DROP the clone's extra gradient wrapper
   level).
5. **B5 — payrollreports carries the trio** (`relative
   overflow-hidden > touch-pan-y`) the clone lacks.
6. **B6 — the small-root fixes**: employeeportal root += `p-4`;
   tenantsetup `H2:Welcome to EonHR` → `DIV`; hrossistant +
   employeeportal + tenantsetup class-order alignments.
7. **B7 — the stubs**: REF /home = literally `<div></div>` (the clone
   renders nothing); REF /employeedetail = a centered CSS spinner
   (`flex items-center justify-center min-h-screen > w-16 h-16
   border-4 border-blue-600 border-t-transparent rounded-full
   animate-spin`); REF /employeeselfservice = a centered loader
   (`flex items-center justify-center min-h-screen > text-center >
   P:Loading your profile...`) — mirror the loader for the fetch
   phase (the resolved no-profile state stays the clone's superset).

### C. The header-row family

1. **C1 (component)** — the md-family rows miss the base `items-start`
   member: REF `flex flex-col md:flex-row justify-between items-start
   md:items-center gap-4` (also the unprefixed `justify-between`).
   Component renders the member for `rowBreakpoint="md"`.
2. **C2 — the rowBreakpoint="md" passes** (REF switches at md, the
   clone still sm): analyticsdashboard, surveyanalytics, payrollengine,
   hrletters, shiftswap, surveys.
3. **C3 — performancemanagement** is an actionsStart page (REF `flex
   justify-between items-start`) but the clone renders items-center —
   pass `actionsStart`.
4. Documented non-gaps (stay): the always-row families
   (always-start: compliance/performance/offboarding/advancedanalytics/
   payrollai/workflowautomation/allleaverequests/assets; always-center:
   announcements/hrreports/requestreports + the mb-variants chat mb-4 /
   workflowconfigpage mb-6 / templates mb-8) keep the session-18
   fitting superset (col below sm/md); the hero `min-w-0` wrapper; the
   actions `flex flex-wrap items-center gap-3` wrapper; the badge span
   icon guard — all render-neutral documented translations.

### D. The stat family (per-page REF contracts)

1. **D1 (component `stat-card.tsx`)**:
   - `valueTag` / `labelTag` call-site overrides (REF's tags vary
     per page within a variant).
   - The **no-tile rewrite** (performancemanagement + workflowautomation,
     live-measured): label-TOP `P.text-sm text-slate-600` + value-BELOW
     `P.text-3xl font-bold {color} mt-1` + the BARE per-color svg
     (`lucide lucide-target w-10 h-10 text-blue-500` — classes on the
     svg, NO wrapper div) + the card WITHOUT border-slate-200
     (`rounded-xl border bg-card text-card-foreground shadow`). NOTE:
     this CORRECTS the session-14 R13-I contract (value-first + mb-1 +
     the h-10 wrapper) — the r46 instrument lesson again (this round's
     full-tree read is authoritative).
   - tile-right (analytics): the stacked label DIV → P.
   - mini (shiftcalendar) + mini-centered (notificationpreferences) +
     compact-s (payrollmodule): label DIV → P.
   - The standard branch's tile row `mb-3` → parametrizable
     (`tileRowClassName`) — advancedanalytics/payrollai/
     allleaverequests render the tile row WITHOUT mb and the value
     with `mt-4`.
2. **D2 (call sites)**:
   - The four analytics compacts (analyticsdashboard,
     attendancedashboard, surveyanalytics, assetmanagement):
     valueTag/labelTag `p`/`p` + label `text-slate-600` (recruitment +
     compliance keep the r46 compact contract: DIV/DIV + slate-500).
   - payrollmodule: labelTag `p`.
   - performancemanagement values: slate-900 / green-600 / orange-600 /
     purple-600; workflowautomation: slate-900 / green-600 / blue-600.
   - advancedanalytics + payrollai + allleaverequests: `p`/`p` +
     valueClassName `mt-4 mb-0` + the no-mb tile row.
   - shiftcalendar + notificationpreferences: labelTag `p`.
3. **D3 — the label TEXTS**: advancedanalytics "Avg Tenure" → "Avg
   Tenure (months)", "At Risk" → "At Risk (AI Prediction)" (the only
   real text diffs — see the instrument correction).

### E. The zero-state affordances (REF hides at zero)

1. **announcements**: NO "New Announcement" button at zero; the empty
   state is a bare `DIV.text-center py-16 text-slate-400` with direct
   text (the clone renders a P + the button + the pb-4 wrapper).
2. **hrletters**: the empty state = the bare svg
   (`lucide-file-text w-16 h-16 mx-auto mb-4 text-slate-300` — classes
   on the svg, no wrapper divs) + `P.text-slate-500` (NO mb-4) + NO
   "New Request" button (the clone's empty-state button is a
   duplicate affordance); the card keeps `shadow border-slate-200`.
3. **templates**: the clone renders the Create Template button TWICE
   (the row + the empty card) — dedupe to the row button; REF's card
   = `border-slate-200 shadow-sm`; REF's row = `flex items-center
   justify-between mb-8` with hero `flex items-center gap-4`.
4. **performancemanagement**: at zero the Goals tab renders ONLY the
   Set New Goal row (`flex justify-end`) + an EMPTY grid — the clone's
   count line ("0 goals across the team") + the empty-state card are
   zero-state-only supersets → conditionalize on data presence.
5. **hrossistant**: the zero-state suggestion P ("Ask about leave…")
   renders on the clone only → remove at zero.

### F. Page-specific contracts

1. **compliancedashboard**: the At-Risk card header = `flex flex-col
   space-y-1.5 p-6 border-b border-slate-200 bg-slate-50 py-3` with
   the title `tracking-tight text-sm font-semibold text-slate-700
   flex items-center gap-2` (the clone: plain p-3 header, different
   title classes); the empty P carries NO class (the clone:
   `P.text-sm`); the "0 at-risk documents" span class order
   (`text-sm text-slate-500 ml-auto`).
2. **requestreports**: the "Total Amount" value renders `0` on REF vs
   `0.00` on the clone (integer display at zero).
3. **recruitmentkanban**: the stage-count chips are `DIV:0` on REF vs
   `SPAN:0` on the clone.
4. **performancemanagement tabs**: TabsList `text-muted-foreground
   bg-white` (the clone: text-neutral-500 dark:text-neutral-400);
   TabsContent = REF's Radix verbatim `mt-2 ring-offset-background
   focus-visible:outline-none focus-visible:ring-2
   focus-visible:ring-ring focus-visible:ring-offset-2 space-y-6`.

### The documented non-gaps (checked, not fixed)

- The phantom-space family (the instrument correction — see above).
- The chart svg internals (g/path counts — Recharts internals at zero
  data; the with-data charts are the superset).
- The always-row families + the wrapper translations (C4 above).
- employeeselfservice's resolved no-profile state (the clone's
  informative superset vs REF's permanent loader — the LOADER root is
  mirrored for the fetch phase only).
- The badge `shadow-sm` per-page variance (hrletters lacks it) and
  the CardTitle `text-base` per-page variance (hrletters lacks it) —
  render-neutral (16px inherited), deferred with the byte-parity
  backlog.
- REF's hrreports inter-element whitespace text nodes.

## The fixes (file map)

1. `src/components/shared/page-header.tsx` — A1 (kicker h1
   dark:text-white) + C1 (the md-family base items-start +
   unprefixed justify-between).
2. `src/app/(app)/dashboard/page.tsx` — A2 (the hand-rolled kicker
   verbatim + its h1).
3. `src/components/shared/stat-card.tsx` — D1 (the tag overrides, the
   no-tile rewrite, the tile-right/mini/mini-centered/compact-s label
   tags, the tileRowClassName).
4. The 27 B1 pages + the B2/B3/B4/B5/B6/B7 root edits (see the
   findings table) — one-line class swaps + wrapper drops, each with
   the trap-4/6 audit.
5. The C2/C3 rowBreakpoint/actionsStart passes (7 pages).
6. The D2 stat call sites (12 pages) + D3 (advancedanalytics labels).
7. The E affordances (5 pages) + F page-specifics (3 pages).
8. Unit pins (`tests/unit/recipes.test.ts`, the session-48 block ~30
   pins) + the predecessor amendments (the arbitrary-gradient pins,
   the no-tile R13-I pins, the kicker pins).
9. E2E (`tests/e2e/session48-unmapped-interiors.spec.ts` ~10 tests).
10. `scripts/verify-r47.mjs` — the round pairs (the 48-route rootmap,
    the stat zones, the kicker dark, the affordances, the stubs).
11. Screenshots (the unmapped-page interiors: REF + zero-tenant LOC
    pairs) → `docs/screenshots/`.
12. Docs: AGENTS session-48 layer, SKILL/PAD/README/CLAUDE counts,
    `docs/session_97.md`, this plan's completion record, worklog.

## The verification gates

lint 0/0 · tsc ✓ · unit (718 + ~30 new, amended predecessors green) ·
build ✓ · E2E (217 + ~10) · verify-r47 (the round pairs) · standing
audits 5/5 · route sweep 12/12 · verify-r45 13/13 (the login watch).

---

## Completion record (session 48, delivered)

- **Gates**: lint 0/0 · tsc ✓ · **745/745 unit** (+27: A1-A2, B1-B7,
  C1-C3, D1a-D1b-c, D2a-D2d, E1-E5, F1-F3) · build ✓ · **228/228 E2E**
  (+11 — the session48-unmapped-interiors spec: the kicker dark pair +
  the dashboard verbatim, the md-row members, the four-analytics p/p
  tags, the no-tile rewrite, the mt-4 family + the advancedanalytics
  labels, the root families, the merged roots, the bare roots, the
  stubs, the templates dedupe, the kanban chips) + 2 amended E2E (the
  kicker position contract sticky, the tenantsetup DIV).
- **Predecessor amendments**: 20 pins + 2 E2E — the dashboard kicker,
  the shell kicker h1, R8-A (the row's split template), R8-D (the
  merged root), R8-F (the JSX-expression count), R10-F/R10-H (the
  with-data header actions), R10-J (the labelTag insertion), the
  48px-tile pin (the guard family retired), R46-B1/B2 (the icon
  classes on the svg), R30-C1/R31-C5/R31-C9/R33-A1 (the v3 gradient
  forms), R31-C7/C8 (the bare roots), R31-D1 (the stubs re-measured —
  the r31 "blank" read was an instrument artifact).
- **THE TILE-ARCHITECTURE EXTENSION (found by verify-r46)**: the r46
  re-run caught the attendance standard-tile icons losing their size +
  color (the guard retirement rippled to a call site that relied on
  it) — the attendance family re-measured (users blue/circle-check-big
  green/circle-x red/clock orange/trending-up purple) + the r46
  contract re-verified 25/25. The census→GREEN→verify loop closed the
  loop the way it is designed to.
- **Live verification**: **verify-r47 24/24 MATCH** — the 48-route
  rootmap (normalized for member order; /employeeselfservice excluded
  as the documented resolved-superset divergence), the stat zones
  WITH the tile + svg-class contracts (sorted-member + mb-0-strip
  normalizations for the render-neutral splits), the kicker dark pair
  both copies, the md-row members, the affordances (buttons + text
  both sides), the stubs (the suspense comment markers stripped), the
  quick hits. + verify-r46 25/25 + verify-r45 13/13 (**the 15th login
  deploy** — `CSVhrsEz` → `DCDf2KCA`, visually quiet) + standing
  audits 5/5 + route sweep 12/12.
- **Screenshots**: 18 (184-192 — the attendancedashboard compacts, the
  performance no-tile + tabs, the advancedanalytics mt-4 family, the
  announcements/hrletters/templates affordances, the assetmanagement
  merged root, the employeedetail spinner, the compliance card family;
  REF + zero-tenant pairs) → **294 PNG**. DB pristine (the
  loading-probe user swept AGAIN — the verify-r45 trap re-fires every
  window). `.env.example` verified.
- **Tooling lessons**: the Next standalone server does NOT load `.env`
  — pass `DATABASE_URL` inline on every restart (the :3200 restart
  bit once: "Unable to open the database file" on login); the
  agent-browser evals flake under sustained load — verify-r47's
  evalOn retries once; the MultiEdit tool's partial-failure mode (the
  tile-right edit silently didn't land — caught by the live verify);
  the E2E dialog-animation read flakes under full-suite load (the
  input-family test — passes isolated + on re-runs; noted, not
  suppressed).
