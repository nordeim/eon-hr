# Remediation Plan — Session 88 / Parity Round 87: THE MOBILE-BAND CROSS-SIDE ROUND (the r87 close-out's named frontier: "the first cross-side pass over the mobile bands (the 52 routes at 390)") — the program's first full-registry cross-side pixel-diff at 390×844 (all 61 authed routes, LIGHT LTR, the badge visible per the r85 contract) finding TWELVE clone-authored defects (FOUR icon-identity families + TWO REF-authored mobile-overflow chains + the missing functional month filter + the chat mobile-usability regression + the surveyanalytics zero-data charts + the shiftswap stale-measurement retirement + the tenantsetup hero glyph + the workflowconfigpage card token), ALL TDD-FIXED

**The round's motivation.** The session-87 completion record named this round's frontier candidates: "the first cross-side pass over the mobile bands (the 52 routes at 390), the surveyanalytics 3-chart reconfiguration (the biggest remaining structural divergence), the attendancedashboard header member, the tenantsetup title member, the reports wrap class". The desktop band (1440×900) has been full-registry-covered since r87; the mobile band (390×844 — the responsive boundary is md/768 per session 7) had NEVER been cross-compared. The mobile band is also the standing user emphasis (the mobile-menu cycle is re-verified every round), and it is where TW-v4 layout traps (space-y margins, flex-wrap collapses, overflow chains) express differently than at desktop.

**The instrument.** `scripts/r88-mobile-capture.mjs` (resume-capable, batched, foreground per the background-reaper protocol; viewport re-asserted before EVERY capture per the r87 stale-viewport lesson; fresh-sessions auth at the MOBILE viewport with the careful fill-settle-click retry) captured all 61 authed routes as at-rest pairs at 390×844 LIGHT LTR. `scripts/r88-mobile-diff.py` (the r86/r87 PIL grid diff — 48px cells, AA floor ≤2, MINOR 3-8/few-cells, STRUCTURAL >8) read: **39 STRUCTURAL / 22 MINOR/AA**. The triage: `scripts/r88-mobile-triage.mjs` (both-sides text digest + elementFromPoint probes) + `scripts/r88-crop-diff.py` (cluster-bbox cropped side-by-sides) + the VLM crop reads + targeted DOM probes on BOTH sides + **the 3× reload stability verification** (`scripts/r88-variant-stability2.mjs` — the r87 REF-second-build-variant finding means every recipe must be re-read on fresh loads before pinning; ALL twelve read STABLE 3/3).

**THE CLASSIFICATION.** DATA-DRIVEN (no action, documented): careers (the live job board's company chips overflow 602 vs the 0-job seed), employeeselfservice (the REF's profile-fetch loading loop for its employee-less user), analytics/advancedanalytics/analyticsdashboard (the 0-vs-1 employee stats), employees (the empty vs seeded employee card), attendancedashboard/hrreports (the bottom table's 0-vs-1-row widths), recruitment (Active Jobs 1-vs-0), profile (the role badge — standing note). **CLONE-AUTHORED (the twelve defects below).** The MOBILE-MENU CYCLE re-verified GREEN at the opening on the remediated build (open → Training LMS → /training → auto-close; the 17/17 mobile-navigation suite also stands in the E2E baseline).

---

## THE TWELVE DEFECTS (recipes live-measured on the REF @390×844, all STABLE 3/3 reloads)

### R88-A: the reports CATEGORY ICON family (four glyph identities)
The reports page's category buttons carry wrong lucide identities (the r86-E/R87 glyph-identity class):
- Leave & Absence: REF **`lucide-plane`** vs LOC `lucide-calendar-days`
- Payroll & Compensation: REF **`lucide-dollar-sign`** vs LOC `lucide-banknote`
- Employee Relations: REF **`lucide-shield`** vs LOC `lucide-heart-handshake`
- Contracts & Compliance: REF **`lucide-file-check`** vs LOC `lucide-file-text`
(Employee Master=users ✓, Attendance & Time=clock ✓, Training=graduation-cap ✓, Exit=log-out ✓, Organizational=building2 ✓ — only the four above diverge.)
**Fix**: `src/app/(app)/reports/page.tsx` — swap the four icon imports/components. All four exist in lucide-react 0.525 (`Plane`, `DollarSign`, `Shield`, `FileCheck`).

### R88-B: the advancedanalytics Schedule Report CTA glyph
REF: `lucide-plus` (`M5 12h14 ~ M12 5v14`, w-4 h-4, mr-2). LOC: `CalendarClock`.
**Fix**: `src/app/(app)/advancedanalytics/schedule-report-button.tsx` — `CalendarClock` → `Plus`.

### R88-C: the surveyanalytics ZERO-DATA CHART policy (the queue's #1 structural divergence)
At zero responses the REF renders: Distribution = an EMPTY chart svg (only title/desc/defs — no grid, no axes, no legend); Trend = Y-domain tick labels only (-100..100, no X month labels, no gridlines); Response Count = the legend ([Responses, Avg Sentiment %]) + the same Y-tick-only axis. The LOC renders the INVENTED members: Distribution = 3 zero-valued slices (X category ticks + Y 0-4 ticks + grid + legend); Trend = a synthetic 6-month window (X month ticks May 26… + grid); Response Count already passes data=[] (legend ✓).
**Fix** (recharts 3.x renders nothing at data=[] — matching the Distribution exactly; the Y-tick labels on Trend are a recharts 2.x-only behavior at empty data, documented as the version-class residual): in `src/app/(app)/surveyanalytics/analytics.tsx`, when `responses.length === 0` pass `data={[]}` to BOTH `SentimentDistributionBar` and `SentimentTrendLine` (SurveyComparisonBar already empty). The with-data behavior is unchanged (the functional superset: the 6-month window, categories, and legend all render when data exists).

### R88-D: the analyticsdashboard actions cluster WRAP (a REF-authored overflow chain)
REF cluster: `flex items-center gap-3` (**no flex-wrap**) → natural width 456px at mobile → the app-shell's `flex-1 overflow-auto` root widens to 488 (document horizontal scroll) → the subtitle "Visual overview of key HR metrics and trends" fits ONE line (h=24, P w=363). LOC cluster: the PageHeader default `flex flex-wrap items-center gap-3` → wraps (84px, two rows) → no overflow (scrollW 390) → the subtitle wraps to TWO lines (h=48).
**ONE root cause, TWO symptoms** (the payrollreports chain class). **Fix**: `src/app/(app)/analyticsdashboard/dashboard.tsx` — pass `actionsClassName="flex-nowrap"` (twMerge retires flex-wrap; the rendered class becomes the REF's `flex items-center gap-3` + nowrap member). Desktop band unchanged (the cluster fits any ≥768 row).

### R88-E: the attendancedashboard MONTH FILTER (the missing functional member — the r87 queue's "header member")
REF header cluster (`flex items-center gap-3 flex-wrap`): **FIRST child = `<input type="month">`** (w=160/h=36, the standard Input classes, value=current month) + the All Departments select + Export Report. The LOC renders only select + export — the month input is MISSING (a functional gap: no way to view another month's dashboard).
**Fix**: `src/app/(app)/attendancedashboard/dashboard.tsx` + `page.tsx` — add the month `<Input type="month" className="w-40">` as the first header action, defaulting to the current month, wired functionally (the superset): changing it navigates with `?month=YYYY-MM` and the server component reads the search param to load that month's records (window, title, daysInMonth). The visual recipe matches at rest (the input is present, first, w-40).

### R88-F: the profile ICON family (three glyphs)
- Change Photo button: REF **`lucide-upload`** vs LOC `lucide-camera`
- General tab: REF **`lucide-circle-user`** vs LOC `lucide-user`
- Social Accounts tab: REF **`lucide-share2`** vs LOC `lucide-globe`
(Security=lock ✓.) **Fix**: `src/app/(app)/profile/page.tsx` — `Camera`→`Upload`, `User`→`CircleUser` (already imported for the hero), `Globe`→`Share2` on the tab (keep Globe if used elsewhere on the page). Lockstep: `tests/unit/recipes.test.ts` R13-C pins `<User className="h-4 w-4 mr-2"` + `<Globe className="h-4 w-4 mr-2"` — amend both to the REF forms.

### R88-G: the chat conversations list HIDDEN at mobile (a functional regression + visual defect)
REF: the conversation sidebar is **always visible** — `w-80 border-r border-slate-200 flex flex-col` (320px) + the chat pane `flex-1 flex flex-col` squeezed to 131px; the page scrolls horizontally (485). LOC: `hidden w-80 shrink-0 flex-col border-r border-slate-200 md:flex` — the list is display:none below md, leaving ONLY the "Select a conversation" empty pane with NO way to open a conversation at mobile (the LOC is LESS functional than the REF at 390).
**Fix**: `src/app/(app)/chat/page.tsx` line ~208 — replace `hidden w-80 shrink-0 flex-col border-r border-slate-200 md:flex` with the REF's `w-80 border-r border-slate-200 flex flex-col` (drop `hidden`, `shrink-0`, `md:flex`). Desktop band: `hidden md:flex` ≡ `flex` at ≥768 — pixel-identical; mobile gains the REF's authored two-pane overflow.

### R88-H: the shiftcalendar TABLE MIN-WIDTH (the second REF-authored overflow chain)
REF: `<table class="w-full border-collapse text-xs" style="min-width: 700px">` — the inline 700px min-width drives: 100px day columns (7×100), the page scroll 732, and the month toolbar + All Departments select fitting ONE row (y=281 both children). LOC: no min-width → 61px columns (the assign-button min-content), page scroll 463, the toolbar WRAPS (select on its own row at y=357).
**Fix**: `src/app/(app)/shiftcalendar/page.tsx` — `<table className="w-full border-collapse text-xs" style={{ minWidth: 700 }}>`. The td/th recipes already match (member-set verified).

### R88-I: the workflowconfigpage empty-state CARD TOKEN
REF empty-state card: `rounded-xl border bg-card text-card-foreground shadow text-center py-16`. LOC: `rounded-xl border bg-card text-center shadow py-16` — **missing `text-card-foreground`** (the r87-I card family — the same token was added to the reports cards; this call site was missed).
**Fix**: `src/app/(app)/workflowconfigpage/page.tsx` — add `text-card-foreground` to the empty-state div.

### R88-J: the shiftswap stat-card TILES (the r49 STALE-MEASUREMENT retirement)
REF (live 3/3 stable): each stat card = `p-4 flex items-center gap-3` with the icon in a **`w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100`** tile (blue-100/yellow-100/orange-100/green-100 for users/clock/calendar/circle-check-big, the icon `w-5 h-5 text-*-600`) + `text-2xl font-bold text-slate-900` value + `text-xs text-slate-500` label. LOC: the icons render INLINE (no tiles) — the session-50 "inline family" pin was measured on the pre-58th REF build (the stale-measurement class; the r50 spec text itself says "live-measured" — the REF has since redeployed).
**Fix**: `src/app/(app)/shiftswap/page.tsx` — wrap each icon in the 40px tile with the measured bg color. Lockstep: `tests/e2e/session50-interiors.spec.ts` R50-B1 pins the inline `lucide lucide-users w-5 h-5 text-blue-600` form — amend to the tile recipe.

### R88-K: the tenantsetup hero GLYPH
REF: the welcome card's 64px circle wrapper (`w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4` — the wrapper already matches) carries **`lucide-building2 w-8 h-8 text-blue-600`**. LOC: `lucide-users h-8 w-8 text-blue-600`.
**Fix**: `src/app/(app)/tenantsetup/page.tsx` line ~57 — `Users` → `Building2`.

### R88-L: the companywall FILTER TRIGGER GLYPH
REF "All Employees" select trigger: the value span carries **`lucide-users`** (inside the span, before the text) + the trailing `lucide-chevron-down`. LOC: chevron only.
**Fix**: `src/app/(app)/companywall/page.tsx` — add `<Users className="..."/>` inside the SelectTrigger before `<SelectValue />` (visual: [users] [All Employees] [chevron]).

---

## THE CONTRACT PINS — `tests/e2e/session88-mobileband.spec.ts` (new, ~14 tests)

RED first (all twelve fail on the current build as designed), then GREEN after the fixes. Each test pins the REF-measured recipe (icon class names via `svg[class*=lucide-]` reads, structural classes, geometry where load-bearing):

1. R88-A ×4: the reports category icons (plane / dollar-sign / shield / file-check by lucide class)
2. R88-B: the advancedanalytics Schedule Report glyph (lucide-plus)
3. R88-C ×2: surveyanalytics at zero data — the Distribution chart renders NO axis ticks; the Trend chart renders NO X month ticks
4. R88-D: the analyticsdashboard cluster does not wrap (natural width > viewport at 390; subtitle h=24 one line)
5. R88-E: the attendancedashboard month input (type=month, w≈160, first in the cluster) + the ?month= round-trip (functional superset pin)
6. R88-F ×3: the profile glyph family (upload / circle-user / share2)
7. R88-G: the chat conversations list is visible at 390 (w=320, the pane beside it)
8. R88-H: the shiftcalendar table's 700px min-width (columns ≥100px)
9. R88-I: the workflowconfigpage empty-state card carries text-card-foreground
10. R88-J: the shiftswap stat tiles (w-10 h-10 rounded-xl bg-blue-100 + the icon inside)
11. R88-K: the tenantsetup hero glyph (building2)
12. R88-L: the companywall filter trigger carries the users glyph

**Lockstep amendments** (the count-lockstep rule — stale pins retired in the same commit):
- `tests/e2e/session50-interiors.spec.ts` R50-B1: the shiftswap inline-icon pin → the tile recipe
- `tests/unit/recipes.test.ts` (profile tabs, R13-C): `<User …>` → `<CircleUser …>`, `<Globe …>` → `<Share2 …>`
- Any other pin that reads the changed members (survey-months, chat `hidden`, workflowconfigpage card class) — verified at execution time by the RED run.

## THE EXECUTION ORDER (TDD)

1. **RED**: write the spec; run it against the current build — expect 14/14 RED (each failing on the measured member).
2. **GREEN**: apply the twelve fixes (source-only; no config/schema changes).
3. **Gates**: `lint → typecheck → 941 unit (+amendments) → build → E2E full suite` (460 + 14 new = **474** expected, zero flakes).
4. **The mobile-band pixel re-verify**: re-capture the twelve remediated routes cross-side at 390×844; the expectation: each closed to the AA/MINOR floor or its classified data-driven/variant residual (the trend Y-ticks = the recharts version class, documented).
5. **The desktop-band regression check**: re-capture the affected routes at 1440×900 (the chat/shiftswap/tenantsetup/profile/reports/analyticsdashboard/shiftcalendar surfaces changed at mobile — their desktop bands must be unchanged; the E2E suite's standing pins are the primary guard).
6. **The byte chain** (r88 evidence, numbers continuing from 1295): the login standing pair + the standing route pairs + the twelve mobile re-baseline pairs + the mobile-menu cycle re-run on the remediated build.
7. **Docs**: this plan's execution appendix + `docs/session_202.md` (the round narrative) + the AGENTS session-88 layer + `eon-hr_SKILL.md` §99 + the CLAUDE/README/AGENTS count-lockstep (941 unit + 474 E2E = 1415 total specs) + the worklog round-87 entry + `.env.example` re-verified.

## THE CARRIED-FORWARD QUEUE (after this round)

- The surveyanalytics Trend Y-tick labels at zero data (the recharts 2.x-only axis behavior — the version-class residual, watch-only)
- The attendancedashboard bottom-table width (data-driven: 0-vs-1 employee rows)
- The REF theme-variance root cause (the frontend-config theme flags — the r87 standing finding)
- The lucide-composition drift watch (8 AA-residual icons — vendoring fires only if a delta crosses the visible bar)
- The remaining mobile-band MINOR/AA residuals (22 routes at the ≤2/3-8 floor — the badge overlay class and the glyph AA drift)

## THE ROUND'S TRAPS (retired, documented)

- The daemon overload fired at the capture phase (65 chrome processes → close --all + pkill; the second run clean)
- The chromium version wipe (1200 installed vs 1248 needed → `bunx playwright install chromium` — the standing r1248 lesson re-fired in this sandbox)
- The resource-exhaustion EAGAIN/Cannot-fork class (too many concurrent sessions + servers — single-session instruments from the stability probe onward)
- The stale-viewport race in the triage probes (the elementFromPoint sidebar ghost — a fresh re-read wins; the screenshots are ground truth)
- The exported DATABASE_URL trap (ACTIVE — the `env -u` guard on every build/db invocation)

---

## EXECUTION APPENDIX (the round's close-out)

**Executed 2026-10-24. RED 12/12 as designed (the R88-C selector initially mis-read the recharts 3.x tick element — the `.recharts-cartesian-axis-tick text` form returns 0 in 3.x; the element count is the working form, fixed before the RED confirmation). GREEN 12/12 post-fix.**

**The gates:** lint 0/0 · tsc ✓ · 941/941 unit (the two lockstep amendments: the profile tab pair + the Schedule Report glyph) · build ✓ · E2E **472/472** (the 460 standing + the 12 new, 8.1m, zero flakes).

**The post-fix mobile re-verify (the twelve routes, cross-side at 390×844):**

| Route | Pre | Post | The residual class |
|---|---|---|---|
| chat | 73 | **4** | AA (the glyph edges) |
| shiftcalendar | 101 | **3** | the assign-label + AA |
| shiftswap | 65 | **2** | AA (the badge overlay) |
| workflowconfigpage | 11 | **2** | AA (the bottom tabs) |
| analyticsdashboard | 120 | **29** | data-driven (the 0-vs-1 stats + charts) |
| surveyanalytics | 12 | 10 | the recharts version class (the Trend's Y-domain tick labels) |
| reports | 26 | 22 | data-driven (the report list) |
| advancedanalytics | 9 | 8 | data-driven (the stats) |
| attendancedashboard | 109 | 103 | data-driven (the bottom table + charts) |
| profile | 106 | 106 | data-driven (the avatar/name/role) |
| tenantsetup | 74 | 74 | the title font member (carried forward) |
| companywall | 49 | 50 | the composer offset (carried forward) |

**The desktop-band regression check (the twelve at 1440×900):** the changed surfaces clean — chat 4, shiftswap 3, workflowconfigpage 4, profile 9 cells; the residuals within the documented data-driven classes; the standing E2E pins (472/472) the primary guard.

**The mobile-menu cycle: GREEN** (open → Training LMS → /training → auto-close; no TW-v4 regression under the twelve fixes).

**The byte chain:** 1297-1345 (the login pair BYTE-IDENTICAL to `69aa4241…` — the 58th holding — + the twelve mobile re-baselines + the twelve desktop guards) + the dev-server set 1347-1357 → **1534 tracked PNGs**.

**The carried-forward queue (r89):** the tenantsetup title font member (the top structural item), the companywall composer offset, the surveyanalytics version-class residual, the dark/RTL mobile bands (never cross-compared), the REF theme-variance root cause.
