# Remediation Plan — Session 11 (Parity Round 10: header action alignment, read-only headers, shiftcalendar toolbar, kanban board, reports icon chips, profile card, composer precision)

Every gap below was measured live against `https://eon.base44.app` in a dual
agent-browser setup (default session = reference, `--session loc` = clone;
DOM ground truth — computed styles + bounding boxes, both sides measured).
Reference measurements at 1440×900 (desktop) and 390×844 (mobile).

Baseline at session start (workspace continuing from remote `819dc03`, the
session-10 push + its transcript): lint 0 errors + 0 warnings · tsc ✓ · **194/194
unit** · build ✓ · **86/86 E2E** — re-validated from scratch this session.

Environment: `.env` present (`DATABASE_URL="file:../db/custom.db"` +
`AUTH_SECRET`), `db/custom.db` + `db/e2e.db` at the repo root; the shell's
exported absolute `DATABASE_URL` unset for the build legs per the AGENTS.md
rule.

## Audit context

Audit scope per the user's brief: repo skills consulted
(`skills/skills-catalog.md` → `code-review-and-audit` methodology — secret
scan clean on the session-10 diff, no `any`/empty-catch/eval/
`dangerouslySetInnerHTML`/`@ts-ignore` in `src/`, `process.env` reads
confined to the four server-only seams; `agent-browser` for the dual-browser
sweep; `tdd-workflow` for the fix cycle; `clone-app-pat-pro` extraction
discipline; avant-garde mobile-nav taxonomy A–H re-checked — no failure
present).

**Mobile navigation (the user's priority) re-verified end-to-end and
byte-identical**: top bar 73px sticky white `rgb(226,232,240)` border; 5
bottom tabs (61px items, active `rgb(37,99,235)`, 14px labels — every tab
width exact: 65/57/62/104/68); drawer 288×844 `#FAFAFA` +
`rgba(0,0,0,0.8)` overlay; Employees submenu expansion identical (36px
y-pitch, 231px sub-items); kicker geometry y=89/h=53/18px/700 **and rendered
scroll behavior** (both sides scroll away identically — the reference's
`sticky` is still inert inside its non-scrolling wrapper stack); the md
boundary identical (767px mobile chrome → 800/1024px sidebar 255px inner);
no horizontal overflow. **No Tailwind v4 bug present** — all six documented
traps remain pinned by the token/recipe tests.

The coarse 46-route sweep (h1/font/geometry, stat-card heights/value sizes,
page-root gradients, header button sets) passed EVERY route; the gaps below
come from a **deeper second-tier content sweep** (per-button y-position
taxonomy, full DOM structure dumps, text-node geometry diffs, composer
internals) — the same escalation pattern that found rounds 8 and 9. The
reference was NOT redeployed: every still-pinned surface from sessions 2–10
re-verified unchanged (centered headers all at 848, attendance 7-button
widths byte-exact 86/81/90/121/123/142/195, training tabs, companywall 768px
wrapper, StatCard variants).

---

## Gaps found (the fixes)

### R10-A (High) — Attendance Devices button: wrong palette family + unpinned shade

Measured: REF Devices text `rgb(14, 116, 144)` = v3 **cyan-700** `#0E7490`;
clone renders `text-teal-700` — the wrong family AND `teal-700` is not in
the `@theme` pin (only teal-50/500/600), so Tailwind v4 falls back to oklch
(`lab(44.41 -33.14 -4.22)` — visible color drift). The sibling buttons are
correct (Settings `rgb(10,10,10)`, Dashboard `rgb(29,78,216)` = pinned
blue-700).

**Fix** — `src/app/(app)/attendance/page.tsx`: `text-teal-700` →
`text-cyan-700`; pin `--color-cyan-700: #0e7490` in `globals.css` `@theme`
(the cyan family is currently entirely unpinned; the cyan CTA gradient is
already sRGB-pinned in button.tsx).

### R10-B (Medium) — Attendance Report Type select too wide

Measured: REF select trigger **192px** (`w-48`); clone `w-full max-w-sm`
→ 384px. Card geometry otherwise verified (1120 fitting vs the reference's
overflowing 1238 — documented superset; y=256 vs 280 due to the title-wrap
fitting layout, also documented).

**Fix** — `src/app/(app)/attendance/page.tsx`: SelectTrigger className →
`w-48`.

### R10-C (High) — Companywall composer precision (4 residuals)

Measured deltas: CardContent **p-5 → REF p-6** (4px offsets everywhere:
avatar 485→489, textarea 541→545, card 244→264 tall); avatar gradient
renders **oklab** (`bg-gradient-to-br from-blue-500 to-indigo-500` — trap 3)
→ REF sRGB `linear-gradient(to right bottom, #3b82f6, #6366f1)`, initials
**14px → REF 16px/600**; Photo/Video **84 → REF 90** and Post **85 → REF
93** — every REF icon carries `mr-2` (the documented 16px effective
icon-text gap; the session-10 fix applied it to attendance but missed the
composer); interior structure: REF = one `flex items-start gap-4` row
wrapping the avatar + a `flex-1 space-y-4` column (textarea `min-h-[60px]`
rows=3 → 78px; `space-y-2` label+select group; `flex items-center
justify-between` action row; Photo/Video `h-8 px-3 text-xs` outline; Post
`bg-primary h-9 px-4` flat primary with leading Send icon).

**Fix** — `src/app/(app)/companywall/page.tsx`: rebuild the composer to the
captured recipe (structure above, verbatim classes); keep the pl-14
equivalent via the flex-1 column (the reference's own indentation).

### R10-D (Medium) — Toast viewport geometry

Measured: REF renders the shadcn Toaster viewport even when empty —
`fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4
sm:bottom-0 sm:right-0 sm:top-auto` + **420px max width** (measured 420×32
at bottom-right, two mounts on the reference). The clone renders
`fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2` —
384px, flex-col (oldest-last stacking), no container padding. No reference
toast was ever fired (every REF action that would toast is a dead control)
so the toast CARD interior stays the clone's design; the viewport geometry
is the measurable contract.

**Fix** — `src/components/ui/toast.tsx`: viewport → the reference classes
with `sm:max-w-[420px]`, items rendered inside the p-4 padding.

### R10-E (High) — Header actions alignment: the reference has TWO patterns

Session-9's R8-A fix (items-center, actions on the h1 row) over-generalized.
Measured taxonomy of the reference's header rows:

| Pattern | Pages | Row classes | Button y |
|---|---|---|---|
| items-center (h1 row) | taskmanager, payroll, expenses, leavemanagement (116), employees (46) | `flex-col md:flex-row justify-between items-center` | h1 row |
| **items-start (badge row)** | offboarding, compliancedashboard, allleaverequests, workflowautomation (32), loans (64 — raised), advancedanalytics (32) | `flex justify-between items-start` | badge row |

The clone centers all of them (offboarding 80 vs 32, compliance 76 vs 32,
allleaverequests 80 vs 32, workflowautomation 80 vs 32, loans 112 vs 64,
advancedanalytics 80 vs 32).

**Fix** — `src/components/shared/page-header.tsx`: new `actionsStart?: boolean`
prop → the row gains `sm:items-start` instead of `sm:items-center` (only
when actions exist + the prop is set). Set it on the six pages above. The
action cluster gap stays gap-3.

### R10-F (High) — /hrletters: header action + count line + empty state

REF: NO header action; card `CardHeader` = title only ("Letter Requests",
`flex flex-col space-y-1.5 p-6 border-b border-slate-200`, title at
(313,229)) — NO CardDescription; `CardContent p-0` with the empty state
inside (`p-12 text-center`: 64px FileText icon at y=318, `h3` 18px/600 "No
letter requests yet" at y=398, `p.text-slate-500` 16px at y=434, NO CTA).
Card 1120×303 at (288,204). The clone renders a "New Request" header button
(y=84), a "N requests · N pending review" description (pushing the empty
state to y=415), and a dark CTA in the empty state.

**Fix** — `src/app/(app)/hrletters/page.tsx`: remove the header `actions`;
remove the CardDescription; card header border-b; `CardContent p-0` with the
`p-12` empty state (EmptyState `simple`-mode geometry: icon+h3+p at the
reference y's). **Superset (documented)**: the reference's own copy invites
the action ("Request your first HR letter to get started") and the sibling
/loans page renders the exact CTA recipe — keep ONE working "New Request"
CTA in the empty state (icon+h3+p `mb-4` + CTA 194×36, the loans recipe),
the same affordance rule as the training H2-row slot.

### R10-G (Medium) — /surveys: header action + empty grid

REF: NO header action; below the 4 standard stat cards the reference renders
an EMPTY `grid md:grid-cols-2 gap-6` (h=0, no children, no empty state).
The clone renders a "New Survey" header button + an EmptyState card with a
CTA below the stats.

**Fix** — remove the header `actions`; render the `grid md:grid-cols-2
gap-6` wrapper (survey cards when data exists). **Superset (documented)**:
the reference's own subtitle says "Create surveys and gather employee
feedback" — keep an EmptyState cell (`col-span-full`) inside the reference's
grid container with the working "New Survey" CTA (content-furniture
superset, same category as the hrreports sixth filter column).

### R10-H (Medium) — /announcements: header action + bare-text empty state

REF: NO header action; content = `space-y-3` + a BARE empty state:
`div.text-center.py-16.text-slate-400` "No announcements at this time"
(152px, no card, no icon). The clone renders a "New Announcement" header
button + the full EmptyState card (icon+h3+p+CTA).

**Fix** — remove the header `actions`; render the bare centered slate-400
text (py-16, no card). **Superset (documented)**: keep the working New
Announcement dialog reachable via a small centered CTA button rendered
below the bare text (the training-slot pattern — a button riding the
reference's own furniture, not replacing it).

### R10-I (High) — /payrollengine: Generate Payroll belongs in a toolbar card

REF: NO header action; a toolbar card at y=172 (1120×132, `border-0`,
`p-5`): `flex flex-wrap items-end gap-4` with Month field (`space-y-1`,
176px), Department field (`space-y-1`, 192px select "All Departments"),
**Generate Payroll button 180×36** at (708,220), and a hint line
`p.text-xs.text-slate-500.mt-3` at y=268. Empty card below (y=328,
`p-6 py-20 text-center`, **56px** Calculator icon w-14 h-14). The clone
renders Generate Payroll as a header button.

**Fix** — `src/app/(app)/payrollengine/page.tsx`: remove the header
`actions`; add the toolbar card (Month + Department + Generate Payroll +
hint — the clone's existing month/department/generate state rides the
reference's furniture); empty state card `p-6 py-20` with the w-14 icon.

### R10-J (High) — /shiftcalendar: standalone toolbar + mini-stat refinement

REF (measured):
- **Toolbar row** between header and stats (y=172, `flex flex-wrap
  items-center gap-4`): prev-month button 36×36 outline, month label
  `font-semibold text-slate-800 min-w-36 text-center` (144×24, "October
  2026"), next-month 36×36, then the **All Departments** select 192×36.
  NO "Today" button.
- **Stats**: mini cards 82px with `border-0 shadow-sm` (NOT
  border-slate-200): value `text-2xl font-bold` **colored per card** —
  blue-600 `#2563eb`, violet-600 `#7c3aed`, emerald-600 `#059669`,
  amber-600 `#d97706`; label `text-xs text-slate-500 mt-0.5` (16px — the
  clone renders text-sm/20px → 86px cards).
- **Calendar card**: `p-0` interior with an `overflow-x-auto` wrapper; day
  grid = `table w-full border-collapse text-xs` (thead Mon..Sun + 5 week
  rows, 41px cells). NO in-card month navigation.
- **Summary card**: CardHeader `border-b border-slate-100` ("Employee
  Schedule Summary — October 2026") + `CardContent p-0`.
- Header "Shift Swaps" control: 147×36 (the clone renders 139 — the icon
  misses `mr-2`).

**Fix** — `src/app/(app)/shiftcalendar/page.tsx`: extract the month nav +
department filter into the standalone toolbar row (the reference's own
furniture — the clone's working month/department state rides it; drop the
"Today" button); StatCard `mini` variant refined (border-0 + shadow-sm,
`valueClassName` colors, label `text-xs text-slate-500 mt-0.5`); calendar
card `p-0` (the table already matches — verify); summary card header
border-slate-100; Shift Swaps icon gains `mr-2`.

### R10-K (High) — /recruitmentkanban: full-width board page

REF (measured): page root `p-4 md:p-8 space-y-6` — **NO max-w container**
(content 1344px at 1440); header (small 24px h1) with "Add Applicant"
161×36 at the far right (x=1471); filter row y=112 (`flex flex-col
sm:flex-row gap-3`): search input `flex-1` (1140×36) + "All Jobs" select
192×36; board y=172: `flex gap-4 overflow-x-auto pb-4` with **5 columns**
`w-64` (256×400): `rounded-lg border-2 bg-slate-100 border-slate-300`
(≈p-3.5), column header `flex items-center justify-between mb-3` with
`h3.font-semibold.text-slate-700.text-sm` + count badge
`inline-flex items-center rounded-md border px-2.5` (30×22), drop zone
`min-h-32 rounded-md` (228×128). Columns: **Applied, Interviewing, Offer,
Hired, Rejected**. The clone renders a max-w-7xl page (1120), both controls
in the header, no search row, and an EmptyState card instead of the board.

**Fix** — `src/app/(app)/recruitmentkanban/page.tsx`: full-width root; Add
Applicant only in the header; add the search + All Jobs filter row; render
the 5-column board with the reference's column furniture (the clone's
kanban data rides it; empty drop zones render like the reference).

### R10-L (High) — /reports: category chips with icons in a white wrapping pill

REF (measured): the selector container = `inline-flex items-center
justify-center rounded-lg p-1 text-muted-foreground bg-white border
border-slate-200 flex-wrap h-auto` (94px tall at rest — WHITE bordered
pill, not the gray bg-secondary) with rows CENTERED and NO row gap (28px
pitch); each chip = shadcn TabsTrigger + `gap-2` + a 16px icon
(stroke `#0A0A0A`): "Employee Master" 170px (icon+8+text 122), etc. The
clone renders the gray secondary pill, left-aligned, icon-less chips
(146px), gap-1 rows (32px pitch).

**Fix** — `src/app/(app)/reports/page.tsx`: container → the white bordered
wrapping pill; chips gain per-category 16px icons + gap-2; drop the row
gap; rows center. (Icons: the reference's per-category lucide set — map
sensibly: Users, Clock, CalendarDays, Banknote, TrendingUp, GraduationCap,
HeartHandshake, FileText, LogOut, Building2, BarChart3.)

### R10-M (High) — /profile: avatar card restructure

REF (measured): card 1024×154, `CardContent p-6` → `flex items-center
gap-6`: **96×96 gradient circle** (`bg-gradient-to-br from-blue-500
to-indigo-500` — sRGB on the reference → pin
`bg-[linear-gradient(to_bottom_right,#3b82f6,#6366f1)]`) with a 64px
`circle-user` white icon (NOT initials); `flex-1` column: `h2.text-2xl
font-bold` name, `p.text-slate-600.mb-3` email, **Change Photo button
164×36** below the email (inside the column); "User" role badge at the
right (`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs
font-semibold bg-blue-50 text-blue-700 border-blue-200`, 53×22, vertically
centered). The clone renders a 64px initials avatar, text-lg name, the
button at the card's right edge, and no badge.

**Fix** — `src/app/(app)/profile/page.tsx`: restructure to the recipe; keep
the working photo-upload dialog wired to the reference-positioned button.

### R10-N (Medium) — /hrassistantchat: grid + sidebar geometry

REF (measured): content = `grid lg:grid-cols-4 gap-6
h-[calc(100vh-250px)]` at y=188 (subtitle ends 164 + mb-6 24); left column
`lg:col-span-1 space-y-4` (262px): **New Chat button 262×36 directly at the
column top** (Plus icon mr-2) + conversations card at y=240. The clone
renders `grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]` at y=196 with the
button (266×32) INSIDE a padded card.

**Fix** — `src/app/(app)/hrassistantchat/page.tsx`: grid →
`lg:grid-cols-4 gap-6 h-[calc(100vh-250px)]`; sidebar column space-y-4 with
the button outside the card (h-9 default size); conversations card below.

### R10-O (High) — /loans: header alignment + empty state recipe

REF (measured): header row `hidden md:flex justify-between items-start`
(button y=64 — covered by R10-E); content = `grid md:grid-cols-1
lg:grid-cols-2 gap-6` at y=228 containing ONE bare card 1120×290:
`p-12 text-center` with 64px DollarSign icon (y=277), `h3` "No loans yet"
(y=357), `p.text-slate-500.mb-4` (y=393), **CTA 194×36** `bg-primary` flat
(+icon mr-2) at (751,433). The clone renders the empty state inside a
card with a `p-5 pb-0` header structure.

**Fix** — `src/app/(app)/loans/page.tsx`: empty state inside the
`md:grid-cols-1 lg:grid-cols-2 gap-6` wrapper (loan cards when data
exists); bare card `p-12 text-center` with the recipe above.

### R10-P (High) — /staffrequests: filter row out of the card + segmented toggle

REF (measured): header (small 24px h1 + "New Request" 156×36 at y=42 ✓
already matching); then a BARE filter row y=112 (`flex flex-wrap gap-3`):
search input 792×36 (`flex-1 min-w-[200px]` with 16px search icon at
left-3 top-2.5) + "All Categories" select 160×36 + "All Status" select
144×36; then the **segmented toggle** y=172 (`inline-flex h-9 items-center
justify-center rounded-lg bg-muted p-1 text-muted-foreground`, 145×36,
inner trigger 137×28 — "My Requests (0)"); then the card at y=216 (`mt-2`)
with `text-center py-16` interior (264px). The clone wraps the toggle +
selects in ONE card (no search input at all).

**Fix** — `src/app/(app)/staffrequests/page.tsx`: bare filter row (add the
working search input — superset over the reference's unwired one); the
segmented toggle as its own element (the clone's my-requests filter state
rides it); the card below with the py-16 empty state.

### R10-Q (Medium) — /workflowconfigpage: empty-state CTA

REF (measured): page root `p-6 max-w-5xl mx-auto` (no gradient — already
matching); header row `flex items-center justify-between mb-6` with "New
Workflow" 163×36 ✓; the card (976×266) interior: **48px** Settings2 icon
(`w-12 h-12 mx-auto`, slate-400), `p.text-slate-500` "No workflows
configured yet" (y=229), and a **"Create First Workflow" CTA 213×36** at
y=269. The clone renders the icon+p but NO CTA.

**Fix** — `src/app/(app)/workflowconfigpage/page.tsx`: add the CTA (wired
to the existing create dialog — superset over the reference's dead button)
+ the 48px icon size.

### R10-R (Medium) — /notificationpreferences: Mark All Read card interior

REF (measured): third card 229×86 (stretched by the grid) with
`CardContent p-4 flex items-center justify-center` — the inner div is
content-height (64px) and TOP-ALIGNED in the stretched cell, so the button
(h-8 outline, 12px, px-3, 16px icon with **mr-1** 4px, text 82px → 136×32)
sits at y=121 (not vertically centered at 131 like the clone's flex
centering).

**Fix** — `src/app/(app)/notificationpreferences/page.tsx`: the Mark All
Read card = plain Card + `CardContent p-4 flex items-center justify-center`
(no card-level flex centering) + `Button variant="outline" size="sm"` with
the CheckCheck icon `mr-1`.

## Verified non-gaps / deliberate deviations (no action)

- **training "New Platform"** in the H2 row, **hrreports "Status" sixth
  filter column**, **attendance fitting layout** (title one line, cluster
  wrapped, docW 1440 vs the reference's own 1558 overflow), **attendance
  toolbar card at 1120** (vs the reference's overflowing 1238), the
  **Devices/Settings info toasts** — all documented session-10 supersets,
  re-verified unchanged this session.
- **hrreports Export buttons y=32 vs clone 34** — 2px line-height rounding
  on the small-page header; within tolerance.
- **Drawer submenu lower groups at +4px y** (513/517, 633/637, 793/797) and
  the 247/248 sub-item width — the documented sub-pixel rounding, stable
  since session 9.
- **/evaluations, /templates, /organogram, /communications, /chat,
  /companywall, /interviewassistant, /surveyanalytics, /attendancedashboard,
  /payrollmodule, /performancemanagement, /settings, /securitysettings,
  /employeeselfservice, /announcements-header-shape, /compliance (404 both
  sides)** — button sets and geometry match (the new R10 items are the
  exhaustive remainder).
- **Toast card interior** — unmeasurable on the reference (it never fires
  one); the clone's design stays (R10-D fixes only the viewport geometry).
- All six Tailwind v4 traps remain pinned; mobile-nav taxonomy A–H absent.

## Execution order (TDD)

1. **RED unit pins** — extend `tests/unit/shell-recipes.test.ts` +
   `tests/unit/recipes.test.ts` with a session-11 block: cyan-700 pin +
   attendance Devices class + select w-48 (R10-A/B); companywall composer
   recipe (p-6, sRGB avatar, mr-2 icons, Post bg-primary — R10-C); toast
   viewport classes (R10-D); PageHeader `actionsStart` + the six-page
   matrix (R10-E); hrletters/surveys/announcements/payrollengine headers
   without actions + their content recipes (R10-F/G/H/I); shiftcalendar
   toolbar + mini refinement + Shift Swaps mr-2 (R10-J); recruitmentkanban
   full-width + board furniture (R10-K); reports white pill + icon chips
   (R10-L); profile card recipe (R10-M); hrassistantchat grid (R10-N);
   loans empty state (R10-O); staffrequests filter row + toggle (R10-P);
   workflowconfigpage CTA (R10-Q); notificationpreferences card interior
   (R10-R).
2. **GREEN** — the component + page edits above (page-header prop first,
   then the per-page sweep, then the restructures).
3. **E2E** — existing specs must stay green; adjust pins only where they
   assert the old structures (search for staffrequests/loans/shiftcalendar
   assertions first).
4. **Full gates**: lint → tsc → unit → build → E2E.
5. **Live dual-browser re-verify** of every fixed surface (button y=32/64
   on the six items-start pages; composer 264px card + 90/93 buttons;
   shiftcalendar toolbar at y=172 + 82px stats; kanban board 1344 wide;
   reports 94px white pill; profile 154px card; etc.) + a mobile-nav
   regression re-check.
6. Screenshots refresh + docs updates (AGENTS.md header-action taxonomy +
   recipes, CLAUDE.md counts, README counts, PAD checklist,
   eon-hr_SKILL.md session-11 layer, session log, worklog).
7. `.env.example` re-verified (no change expected).

All changes on `main`; no new branches.

---

## Completion record (executed 2026-10-10)

All eighteen remediation items landed, TDD (21 RED pins first, then GREEN;
one stale R8-A pin refined; several live-verify corrections during the
re-measure loop):

- **R10-A** — `text-cyan-700` + `--color-cyan-700: #0e7490` pinned in
  `@theme`. Live-verified: Devices renders `rgb(14,116,144)` — exact.
- **R10-B** — Report Type select `w-48` (192px measured).
- **R10-C** — composer rebuilt to the captured recipe (p-6, items-start
  gap-4 row + flex-1 space-y-4 column, sRGB avatar with 16px initials,
  ghost Photo/Video, Post with Send mr-2). Live-verify corrections: the
  label group is `space-y-3` with a `block leading-5` label (the
  reference's 20px line box + 12px gap); Photo/Video are GHOST (the
  outline border added 2px). Final: card 264, Photo 90, Post 93 —
  byte-exact.
- **R10-D** — toast viewport geometry matched (420px, p-4,
  flex-col-reverse, sm:bottom-0 sm:right-0).
- **R10-E** — `actionsStart` prop; six pages opted in. Live-verified: all
  six at y=32 (loans y=64) — exact.
- **R10-F** — hrletters: no header action, no count description, card
  header border-b with `leading-none` title (65px), CardContent p-0 +
  p-12 empty state. Live-verified: card 204, header 65, icon 318, h3 398
  — byte-exact; the loans-recipe CTA rides as the documented superset.
- **R10-G** — surveys: no header action; empty state inside the
  reference's md:grid-cols-2 container (col-span-full superset cell);
  the Avg Sentiment value renders "%" at 0 surveys (reference quirk).
- **R10-H** — announcements: no header action; bare `py-16 text-slate-400`
  line (byte-identical: y=112 h=152) + small CTA superset below.
- **R10-I** — payrollengine: toolbar card (Month + Department + flat
  emerald-600 Generate + hint) + p-6 py-20 rest card with the 56px icon.
  Content diff: 0 diffs.
- **R10-J** — shiftcalendar: standalone toolbar (y=172 exact), mini stats
  border-0 + shadow-sm + colored values + xs labels (82px exact), the
  border-collapse table calendar, the border-slate-100 summary card,
  Shift Swaps mr-2. All verified live.
- **R10-K** — recruitmentkanban: full-width, filter row with working
  search, five w-64 border-2 columns (Applied/Interviewing/Offer/
  Hired/Rejected). The reference's own page overflows (docW 1664) — the
  clone keeps the fitting internal scroll (documented superset).
- **R10-L** — reports: white bordered wrapping pill + 16px icon chips
  (gap-2). Live-verified: listBg white, 94px, first chip 170px with icon.
- **R10-M** — profile: 96px gradient circle + circle-user icon, h2
  text-2xl, button below the email (164px exact at y=297), role badge
  right. Card 154px — byte-exact (badge text is data-driven: Admin vs
  the reference's User).
- **R10-N** — hrassistantchat: lg:grid-cols-4 + h-[calc(100vh-250px)];
  New Chat (purple, h-9) at the column top outside any card. y=188 —
  exact (the wrapper switched to an mb-6 header stack).
- **R10-O** — loans empty state: grid wrapper + bare p-12 card. CTA at
  y=433 w=194 — byte-exact (after the systemic EmptyState mb-4 fix).
- **R10-P** — staffrequests: bare filter row (search + two selects),
  segmented bg-muted toggle (145x36 pill, h-7 trigger), mt-2 card with
  the py-16 empty state (48px icon, slate-500 line, 207px dark CTA
  without icon). CTA y=381 vs 380 (1px), w=207 exact.
- **R10-Q** — workflowconfigpage: py-16 ON the card, 48px Settings2 icon
  mb-3, the 213px flat blue-600 CTA. Trailing period restored.
- **R10-R** — notificationpreferences: content-height CardContent (p-4,
  top-aligned in the stretched cell) + h-8 outline sm button with
  CheckCheck mr-1.
- **Systemic (R10 follow-up)** — the shared EmptyState icon wrapper
  gained mb-4 (every empty state had been 16px short — re-measured on
  payroll AND loans); the hrletters CardTitle gained leading-none
  (border-b CardHeader titles are 16px on the reference; regular
  in-card titles keep text-base 24px — the dashboard pattern).

Gates after remediation: lint 0 errors + 0 warnings · tsc clean ·
**216/216 unit** (22 new session-11 pins; 1 stale R8-A pin refined;
several pin regexes corrected during the live-verify loop) · build ·
**86/86 E2E**. Full 47-route sweep + the mobile-nav regression re-run
after the fixes: top bar/tabs/drawer byte-identical, no horizontal
overflow. 24 screenshots refreshed via capture-all (production
standalone build); DB pristine after capture (users=1, employees=1,
leaveBalances=2).
