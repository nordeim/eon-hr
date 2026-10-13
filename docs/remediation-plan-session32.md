# Remediation Plan — Session 32 / Parity Round 31

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app),
viewports pinned (1440×900 desktop, 390×844 mobile). Standing audits first:
**redeploy check PASSED 12/12** (h1 text/font/x/y byte-identical — REF
unchanged since round 30); **mobile chrome PASSED** (tabs x=10/79/139/204/313
blue-500/slate-500 split, kicker y=101 h=28 fs=18px fw=700 after settle — the
first read's y=89 was an un-settled transient, re-run clean; drawer panel
288px + border-right 1px rgb(229,229,229) + overlay 390×844 rgba(0,0,0,0.8)
z-50 — byte-identical, no Tailwind v4 bug); **with-data re-check**: REF still
renders zero data on the core module surfaces (with ONE new exception — see
the /careers note); **sidebar navmap PASSED** (collapsed 141→621, expanded
leaves 577→829, roots 865/905 — the round-29/30 fixes hold; LOC's footer
aria-labels remain the documented a11y superset).

Baseline gates at HEAD `f661dc6`: lint 0/0 · tsc ✓ · 464/464 unit ·
build ✓ · 100/100 E2E (one first-run flake on the legacy-assets round-trip —
re-run clean in isolation and in the second full pass; the known cold-start
category). DB pristine (users=1, employees=1, leaveBalances=2, payroll=0,
expenseClaims=0, tasks=0, candidates=0, jobs=0, assets=0).

## The round's census — the systematic orphan-route hunt (session-56/57's suggested frontier)

Method: REF's SPA bundle (`/assets/index-C-IrDy5f.js`, 2.2MB, fetched via
curl) contains the full page registry — `VKe={AdvancedAnalytics:…, 61 keys}`
— plus the mechanical path function `We(name)=
"/"+name.toLowerCase().replace(/ /g,"-")`. Cross-referencing the registry's
61 page names against the clone's 47 served routes yields **14 routes REF
serves that the clone 404s on**. All 14 were probed live on REF (shell
presence: main x=256, 17 nav items — ALL render inside the app shell):

| Route | REF's page | Class |
|---|---|---|
| /careers | "Find Your Dream Job" hero + job grid | real page (data fluctuates) |
| /employeeportal | centered max-w-md card, "No Onboarding Found" | real page |
| /externaljobapplication | "Job Opportunities" + Briefcase empty | real page |
| /hrassistant | single-pane AI chat (kicker + centered h1) | real page |
| /payrollai | "Payroll AI Suggestions", 3 stat tiles | real page |
| /payrollreports | "Payroll Reports", 4 stat tiles + tabs | real page |
| /requestreports | "Request Reports", Back button + 4 tiles | real page |
| /requestsettings | "Request Settings", 960px config cards | real page |
| /shiftswap | "Shift Swap", 4 tiles + violet tab row | real page |
| /tenantsetup | centered max-w-2xl setup wizard card | real page |
| /organizationsetup | renders the Dashboard page (title "Eon HR") | alias |
| /dynamicdashboard | renders the Dashboard page (title "Eon HR") | alias |
| /home | permanently blank (title "Home \| Eon HR") | blank stub |
| /employeedetail | permanently blank (?id= changes nothing; /1 → 404) | blank stub |

The /careers note: REF's job list is dynamic (one load rendered 5 companies
+ real postings — "System Admin Company Open IT Jeddah full time
12000-15000…"; the next load rendered the "No Open Positions" empty state).
The **zero-data contract is the parity target**; the clone renders its own
`JobPosting` rows (the functional superset, /assets precedent).

## Gap groups

### R31-A — the 10 real orphan pages (route-coverage parity + functional supersets)

All measured at 1440×900 (y-maps in `/tmp/orphan-pages.json` + the probe
logs). Canvas classes are sRGB-pinned per Tailwind v4 trap 3 where gradients
apply.

1. **/careers** — hero `bg-[linear-gradient(to_right,#2563eb,#4f46e5)]` (the
   blue-600→indigo-600 sRGB pair) `text-white py-16 text-center` (h=174):
   h1 "Find Your Dream Job" 48px/700 white y=64 + p "Explore opportunities
   from top companies powered by EonHR" 20px blue-200 y=128. Below: the
   company chip row (white h-46 buttons, with-data only) + the 2-col job
   grid (548px `shadow hover:shadow-lg` cards, border-b p-6 headers,
   14px slate-600 "Company" label + 16px slate-700 description). Zero-data:
   one "No Open Positions / Check back later for new opportunities!" card.
   Superset: reads the published `JobPosting` rows; chips filter by company.
2. **/employeeportal** — canvas `min-h-screen bg-gradient-to-br from-blue-50
   to-indigo-100 flex items-center justify-center`; card `max-w-md w-full
   border-slate-200 shadow-xl` p-8 text-center (448px, y=335): "No
   Onboarding Found" + p 16px slate-600 "You don't have an active onboarding
   process yet. Please contact your HR team." Superset: reads
   `OnboardingProcess` for the linked employee (progress render with data).
3. **/externaljobapplication** — canvas blue-50→indigo-50 p-4 md:p-8;
   centered header (h1 "Job Opportunities" 36px/700 y=32 + p 18px slate-600
   y=84, text-center); Card 1120×262 `CardContent p-6 pt-0` text-center: h3
   "No Open Positions" 20px + 64px slate-300 Briefcase (y=209) + p 16px
   slate-600 "We don't have any open positions at the moment. Check back
   later!" (y=325). Superset: lists published `JobPosting` rows.
4. **/hrassistant** — canvas blue-50→indigo-50 p-4 md:p-8; `max-w-4xl
   mx-auto space-y-6`; centered header: kicker pill "AI HR Assistant"
   (107px @ x=807 y=40) + h1 "HR Assistant" y=84 text-center + p "Ask me
   anything about HR policies, leave, payroll, and more" 18px y=136; chat
   card `rounded-xl border shadow-xl` 896px h≈595 CardContent p-0: message
   area + textarea "Ask me anything about HR..." (802px) + dark 48px send
   button. Superset: persists via the existing AIChat/AIMessage API (the
   /hrassistantchat pattern, single-pane).
5. **/payrollai** — canvas green-50→blue-50 p-4 md:p-8 (the /assets twin);
   flat36 header (h1 "Payroll AI Suggestions" 36px y=84 + sub 18px y=136) +
   "Run AI Analysis" gradient Button 171px @ y=32 x=1237; 3-col gap-6 stat
   tiles (p-6, 170h, 48px icon chips, 30px values, 14px labels): "0 Pending
   Suggestions" / "0 Accepted" / "0 SAR Total Adjustments"; empty state:
   centered 64px green-500 CheckCircle (y=536) + line. Superset: Run AI
   Analysis runs a deterministic analysis over `PayrollRecord` (the
   recruitment AI-CV-scoring precedent).
6. **/payrollreports** — canvas blue-50→indigo-50; raised-36 header (h1 y=108
   36px + sub 16px y=156) + "Send Payslips via WhatsApp" green-600 Button
   253px y=56; 4-col gap-4 72h horizontal stat tiles ("Total Earnings 0.00
   SAR" / "Total Deductions 0.00 SAR" / "Net Payroll 0.00 SAR" / "Employees
   0"); filter card p-4 (1120×98 y=204): "Filter by Employee" + All
   Employees select + "0 total records"; white tab pills h-28 (Monthly / Tax
   & Deductions / History, y=330); report card border-b p-6 pb-3 (y=378):
   "Monthly Payroll Summary" + "All employees for selected month" + CSV/PDF
   buttons + the zero-row table. Superset: aggregates `PayrollRecord`; CSV
   export generates a real file.
7. **/requestreports** — canvas `min-h-screen flex w-full
   bg-gradient-to-br from-slate-50 to-blue-50`; CENTERED 24px h1 x=385 y=32
   + Back ghost button (12px, h-32, x=288 y=42) + sub 14px y=64 + Monthly
   select 144px x=1111 y=40 + "Export CSV" white Button 145px x=1263 y=40;
   4-col 82h `p-4 flex items-center gap-3` horizontal stat tiles (the
   documenttracker recipe): "0 Total Requests" / "0 Approved" / "0 Pending"
   / "0 Total Amount (SAR)" with 24px values + 12px labels. Superset:
   aggregates `StaffRequest`.
8. **/requestsettings** — canvas slate-50→blue-50; CENTERED 24px h1 x=465
   y=32 + Back ghost + sub 14px y=64; card 1 `max-w-[960px] mx-auto` (960px):
   border-b p-6 CardHeader "Approval Workflow" + "Set up to 3 approval
   levels per request category" + per-level rows (Level 1 (First) select
   219px + Add dark Button 219px) + "Level N Approvers" 12px slate-500
   labels + "None set" 14px slate-400 lines; card 2: "Request Limits" +
   "Set max request counts or financial limits per period (petty cash,
   fuel, etc.)" + Finance select 295px + Monthly + All fields. Superset:
   the new `ApprovalConfig` model + `/api/approval-config` — the Add flow
   persists approver rows.
9. **/shiftswap** — canvas violet-50→blue-50 p-4 md:p-8; flat36 header (h1
   "Shift Swap" 36px y=84 + sub 18px y=136); 4-col 82h horizontal stat
   tiles ("0 My Requests" / "0 Peer Approval Needed" / "0 Manager Review" /
   "0 Approved"); tab row y=315: "My Requests" violet-600 Button 121px +
   "Peer Approval (0)" ghost 154px; empty state: 48px slate-300 ArrowLeft
   (y=437) + line. Superset: the new `ShiftSwap` model +
   `/api/shiftswaps` (full CRUD; the request dialog + status flow).
10. **/tenantsetup** — canvas `min-h-screen bg-gradient-to-br from-blue-50
    to-indigo-50 flex items-center justify-center`; card `max-w-2xl w-full
    shadow` (672px, y=209): border-b p-6 text-center CardHeader ("Welcome
    to EonHR" + "Let's set up your HR management workspace" 16px slate-600
    y=358) + CardContent p-6: "Company Name *" + "Owner Email *" fields +
    `flex justify-end` Continue dark Button 95px y=631. Superset: PATCHes
    the `Company` profile.

### R31-B — the 2 dashboard aliases

`/organizationsetup` + `/dynamicdashboard` re-export the Dashboard page
component; both take the plain "Eon HR" title (REF renders the dashboard
including its metadata — measured title "Eon HR" on both).

### R31-C — the 2 blank stubs

`/home` + `/employeedetail` render `null` content inside the shell with the
mechanical titles ("Home | Eon HR", "Employeedetail | Eon HR"). REF renders
nothing in main on both (verified twice with settle; /employeedetail?id=1
changes nothing; a path segment → REF's own 404).

### Schema + API (the functional supersets)

- `ShiftSwap` model: id, requesterId → Employee, shiftDate, notes?,
  status (pending | peer_approved | manager_review | approved | rejected),
  createdAt. API `/api/shiftswaps` (GET list, POST create, PATCH status,
  DELETE) — the standard ApiResult envelope + Zod validation.
- `ApprovalConfig` model: id, category, level (1|2|3), approverId →
  Employee, createdAt, @@unique([category, level, approverId]). API
  `/api/approval-config` (GET, POST, DELETE).
- `db:push` for both; no seed changes (zero-data is the parity contract).

### SEO/meta

The 14 routes join `pageMetadata`'s mechanical map (titles "Careers | Eon
HR", "Employeeportal | Eon HR", …; /organizationsetup + /dynamicdashboard
join PLAIN_TITLE_ROUTES as "Eon HR" aliases). The R25-A4 route-coverage pin
count updates 47→61.

## Verified non-gaps (documented, no action)

- The 12-route redeploy, mobile chrome (tabs/kicker/drawer overlay+border),
  sidebar navmap (collapsed/expanded/roots) — all byte-identical (above).
- REF's /employeeselfservice "Loading your profile…" stub — round-30
  documented; the clone's full My Portal page stays (with-data frontier).
- The /careers live-data fluctuation — REF-side backend data; NOT a parity
  target (the zero-data contract is; the clone renders its own JobPosting
  rows).
- REF's "Toggle Sidebar" + "Close badge" buttons — base44 builder
  artifacts (documented since round 3).

## Documented divergences (clone supersets)

- All 10 real pages carry live data wiring (models + APIs above) where REF
  ships zero-data stubs — the /assets + organogram precedent.
- /careers renders the clone's own published jobs (REF's fluctuating
  backend data is not replicable by design).

## Execution order (TDD)

1. RED pins (`tests/unit/recipes.test.ts` session-32 block): the 10 page
   recipes (canvas classes, header geometry, stat variants, empty states),
   the 2 aliases (dashboard re-export + plain title), the 2 blanks (null
   render + mechanical title), the schema additions (ShiftSwap +
   ApprovalConfig fields), the API route files' existence contracts.
2. Schema push + the two API routes.
3. GREEN: the 14 page files (+ layouts with pageMetadata), meta.ts route
   additions.
4. E2E: `tests/e2e/orphan-routes.spec.ts` (each of the 14 renders its
   contract — h1/empty-state/blank; the shiftswap create round-trip; the
   requestsettings Add round-trip; the tenantsetup Continue PATCH) +
   navigation.spec.ts gains the 14 rows (47→61).
5. Gates: lint → typecheck → unit → build → E2E.
6. Live dual-browser verification: the 14-route y-map sweep (desktop) +
   the mobile chrome spot-check + the regression sweeps (12-route redeploy
   + mobile chrome + sidebar navmap).
7. Screenshots: the round's evidence page + the key new-route pairs →
   `docs/screenshots/` (+ the 02/11 standards refresh).
8. Docs: AGENTS session-32 layer + counts, SKILL version + new section,
   PAD [S32], CLAUDE/README counts, the session log pair (docs/session_58
   .md + docs/session_59.md), worklog, this plan's completion record.

## Completion record (session 32)

All gap groups executed TDD-first (16 new pins in tests/unit/recipes.test.ts,
all RED before implementation → GREEN after three pin-literal iterations —
class-order alignments to REF's measured chains, raw-h1 pins for the
non-PageHeader pages, apostrophe literals, the schema multi-space regex;
the R25-A4 route-coverage pin updated 47→61):

- **R31-A**: all 10 real pages built to the measured contracts. Three
  live-verification fix rounds landed them byte-identical: the
  employeeportal 64px icon circle + H2 20px/700; the externaljobapplication
  icon-first empty (Briefcase y=209 → h3 y=289 → line y=325) + the mt-3
  sub + the space-y-12 wrapper; the payrollreports page-specific header
  (badge+CTA row y=56, h1 y=108, 16px sub y=156 — hand-rolled); the
  requestreports/requestsettings flush mt-0 subs; the tenantsetup
  mb-[22px] circle (the v4 space-y-flip compensation) + pt-4 button row +
  h-11 inputs (card 483px at y=209 exactly).
- **R31-B**: the aliases re-export the dashboard page; PLAIN_TITLE_ROUTES
  extended; live-verified byte-identical (bodyLen 322 + plain title).
- **R31-C**: the blanks render null with mechanical titles; pinned by
  E2E (zero h1/h3/button in main) + live-verified.
- **R31-S**: ShiftSwap + ApprovalConfig models pushed; the two APIs live
  (the parseBody destructure fix after tsc); all the page wiring works —
  the shiftswap dialog round-trip, the requestsettings Add round-trip,
  and the tenantsetup Company PATCH are E2E-proven.

E2E +21: navigation.spec.ts +12 (10 route rows + 2 no-h1 specials — the
/chat precedent) + orphan-routes.spec.ts +10 (with the describe-scoped
pre-clean for the persistent e2e DB and the combobox nth(1) fix — #0 is
the category select).

Gates: lint 0/0 · tsc ✓ · 480/480 unit (+16) · build ✓ · 121/121 E2E
(+21). Live-verified: 13/14 routes byte-identical (the /careers line diff
is REF's fluctuating live job data — h1+hero byte-identical, the
zero-data contract verified matching on the empty load; documented
divergence); 12/12 redeploy MATCH; mobile chrome byte-identical
(tabs/kicker/drawer border); sidebar navmap 865/905; DB pristine
(users=1, employees=1, leaveBalances=2, payroll=0, expenseClaims=0,
tasks=0, candidates=0, jobs=0). 9 new screenshots (102 evidence, 103/103b
the shiftswap pair, 104 tenantsetup, 105 careers, 106 payrollai, 107
hrassistant, 108 mobile shiftswap) + 02/11 standards refreshed → 127 PNG
captures.

The round's probe lessons are recorded in AGENTS.md + SKILL §44: the
bundle-registry census method, the aside-selector navmap artifact, the
EADDRINUSE stale-server trap, the // comment eval trap, the un-settled
kicker transient, and the v4 space-y-flip-inside-cards compensation.
