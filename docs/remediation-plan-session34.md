# Remediation Plan — Session 34 / Parity Round 33

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app),
viewports pinned (1440×900 desktop, 390×844 mobile). Baseline at HEAD
`889cda3` ALL GREEN: lint 0/0 · tsc ✓ · 493/493 unit · build ✓ · 133/133
E2E. The standing audits from round 32 re-run clean at this HEAD (the dark
sweep byte-identical; the dark drawer re-verified MATCH via the dedicated
probe after the known cold-session flake; RTL matches; the light redeploy
12/12 + mobile chrome + navmap byte-identical — all four sweep DIFFs
resolved as the documented artifacts: the to-right/90deg serialization,
the lab()/rgba() notation, the aside-fallback, the drawer flake). DB
pristine (users=1, employees=1, leaveBalances=2).

## The census — the at-rest DOM parity of the round-31-wired pages

Round 31 recovered 14 orphan routes and wired data supersets into nine of
them, then audited "h1+hero byte-identical" — the body structures below
the header were never inventoried. This round's census (button/text/input
inventories on all nine wired pages + the form-error surfaces) found:

1. **REF's asset fingerprints are UNCHANGED** (`index-BGNH4KkS.css` —
   same chunk as round 32) — no CSS redeploy. The diffs below are
   clone-side drift from round 31's wiring (or never-measured bodies),
   not REF movement. One exception: REF's /careers now carries LIVE job
   data (companies + postings in its base44 backend), which round 31
   already documented as fluctuating.
2. **Six pages carry genuine at-rest gaps** (payrollreports,
   requestreports, requestsettings, shiftswap, payrollai, careers) plus
   the login error surface (the form-error dimension — never audited)
   and the deferred /settings card border micro-diff.

## REF ground truth (all live-measured this round)

### /payrollreports (the biggest rebuild)

| Element | REF measured |
|---|---|
| canvas | `linear-gradient(to right bottom, slate-50, blue-50)` — rgb(248,250,252)→rgb(239,246,255) |
| kicker | white pill `inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-4`, 16×16 blue-600 icon, x=288 y=56 |
| h1 | "Payroll Reports" `text-4xl font-bold text-slate-900 mb-2` 36px x=288 y=108 |
| sub | 16px y=156 |
| WhatsApp CTA | solid **green-600** (#16A34A) + `lucide-message-circle w-4 h-4` white — x=1155 y=56 253×36 |
| filter | LABEL `Filter by Employee` fs12 fw500 y=227 (shadcn Label) above a **w-full** Radix select (968×36) in `space-y-1 flex-1 min-w-[180px]` inside `flex flex-wrap gap-4 items-end` inside a p-4 card; "0 total records" right |
| tabs | `h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground grid grid-cols-4 w-full` — **4 triggers** (Monthly active=bg-background white, Tax & Deductions, History, **Custom**), 278px each; INERT on REF (clicking changes nothing) |
| card header | `lucide-calendar w-5 h-5 text-blue-600` + "Monthly Payroll Summary" 16px/600 + sub 14px + **input[type=month]** (w-40, 160×36, val=current month) + CSV (78×32) / PDF (77×32) outline buttons y=403 |
| stats | INSIDE the card below the border-b header — labels `text-xs text-slate-500 mb-1`, values `font-bold text-lg` + **text-blue-700 / text-red-600 / text-green-700 / text-slate-700** |
| table | `<table>` with thead (bg slate-50, 8 th fs12/700 slate-600: Employee left · Basic/Allowances/Overtime/Deductions/Net Salary right · Status/Payslip center) + empty TD `py-12 text-center text-slate-400` **"No records for 2026-10"** |

### /requestreports

- Stats tiles: `rounded-xl border bg-card text-card-foreground shadow`
  (**default border token + `shadow`**, not border-slate-200/shadow-sm).
- **4 missing section cards** in a 2×2 grid: "Requests by Category" /
  "Status Breakdown" (row 1, heads y=239) + "Financial Amount by
  Category (SAR)" / "Top Requesters" (row 2, y=449) — each the shadcn
  Card (head `flex flex-col space-y-1.5 p-6` with DIV title
  `font-semibold tracking-tight text-base`; content `p-6 pt-0`) whose
  empty state is P `text-slate-400 text-center py-8` "No data" (the
  financial one: "No financial requests").
- **Missing Request Log card** (full-width, title "Request Log -
  Monthly" y=659) with a 7-column table (Ref # / Employee / Category /
  Title / Amount / Status / Date — th fs14, left-aligned, transparent
  thead) and an empty tbody.

### /requestsettings

- Approval Workflow card: ONE 4-col row y=228 — [Input "Approver name"
  219×36][Input "Approver email" 219×36][Select "Level 1 (First)"
  219×36][Add dark 219×36] — then 3 static rows "Level N Approvers"
  (12px slate-500) + "None set" (14px slate-400). NO Category select.
- Request Limits card: 3 rows — y=585 [Input "Limit name (e.g. Petty
  Cash Monthly)" 295][Select "Finance" 295][Select "Monthly" 295]; y=633
  [Input "Sub-type (e.g. petty_cash)" 295][Input "Max requests
  (optional)" number 295][Input "Max amount SAR (optional)" number
  295]; y=681 [Select "All Staff" 295][Add Limit dark 295] — then "No
  limits configured". Scope label is **"All Staff"** (not "All
  Employees").

### /shiftswap

- Header carries NO action button (REF's at-rest: exactly two buttons —
  "My Requests" 121×36 + "Peer Approval (0)" 154×36, both y=315).
- Empty text on BOTH tabs: **"No swap requests in this category"**
  `text-slate-500` (the clone ships tab-dependent strings, one of which
  references its own extra button).

### /payrollai

- Empty state: `lucide-circle-check-big w-16 h-16 mx-auto mb-4
  text-green-500` (64×64, centered) + H3 **"All Clear!"** `text-lg
  font-semibold text-slate-900 mb-2` + P **"No payroll adjustments
  needed"** `text-slate-500` 16px. The clone renders a single
  hand-rolled line.

### /careers

- Page root carries its own canvas: `min-h-screen bg-gradient-to-br
  from-blue-50 to-indigo-50` (the clone's root is bare — the shell
  canvas shows through).
- Hero (py-16, h=302): `max-w-6xl mx-auto px-4` > `text-center` >
  [H1 `text-5xl font-bold mb-4`][P `text-xl text-blue-100 mb-8`][**a
  job-search input** — `max-w-2xl mx-auto` wrapper, placeholder
  "Search jobs by title, department, or location...", 672×50]. The
  clone's hero (h=220) lacks the wrapper + the input; its sub is
  blue-200 (REF: blue-100).
- With-data: "Browse by Company" H2 `text-2xl font-bold text-slate-900
  mb-4` (y=350) + company chips = Button outline geometry at **h-46**
  (rounded-md 6px, border token #e5e5e5, text-sm/500 foreground) — the
  clone renders no H2 and chips with rounded-lg + border-slate-200 +
  an extra "All Companies" chip REF doesn't have.

### /login (the form-error dimension — never audited)

- Wrong-credentials error = the shadcn **Alert**: outer DIV `relative
  w-full border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px]
  [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground
  text-foreground bg-red-50/70 border-red-200 rounded-xl` + inner DIV
  `[&_p]:leading-relaxed text-red-700 text-sm` — 368×54 at x=536 y=738
  (translucent red-50/70 bg, 1px red-200 border, 12px radius, 16px
  padding, NO icon rendered). The clone ships a hand-rolled P
  (`rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700`, 368×36).
- Empty-submit parity holds (HTML5 required on both); tenantsetup
  likewise (no custom error text on either).

### /settings (the deferred micro-diff)

- REF's Card: `rounded-xl border bg-card text-card-foreground shadow
  border-slate-200` → border rgb(226,232,240). The clone's renders the
  token border rgb(229,229,229). 3 units, one page.

## Gap groups

### R33-A — /payrollreports rebuild (the headline)

Rebuild the page body to REF's measured structure: canvas slate-50→
blue-50 (sRGB-pinned); the white pill kicker + 16px icon; the green-600
CTA with MessageCircle; the filter card (Label above a w-full select,
`space-y-1 flex-1 min-w-[180px]` in `flex flex-wrap gap-4 items-end` in
p-4, records count right); the 4-col grid tab list (standard token
contract — active = bg-background — plus the 4th "Custom" trigger,
inert like REF's); the summary card with the Calendar icon + month
input (w-40, defaults to the current month) + CSV/PDF buttons; the
stats INSIDE the card (colored `font-bold text-lg` values); the real
`<table>` (8-col thead + the colspan "No records for {YYYY-MM}" TD).
Supersets preserved: the CSV export (real rows), the month input
re-filters the aggregation, payroll totals from /api/payroll.

### R33-B — /requestreports sections

Align the stat tiles (`shadow` + default border). Add the 4 section
cards (2×2) with the "No data" empty states + the Request Log card with
its 7-col table (empty tbody at zero data). Supersets: the sections
compute real distributions from /api/staff-requests when data exists
(with-data rendering is unmeasurable on REF — the documented superset
territory); the CSV export stays.

### R33-C — /requestsettings forms

Rebuild the Approval Workflow card to REF's row (Approver name input +
Approver email input + Level select + Add) + the 3 static "Level N
Approvers / None set" rows; rebuild the Request Limits card to REF's
3-row grid (Limit name / Sub-type / Max requests / Max amount inputs +
Finance / Monthly / All Staff selects + Add Limit) + "No limits
configured". Superset: the Add flow resolves the email against Employee
(persisting ApprovalConfig rows exactly as today — the API gains an
optional approverEmail path); Add Limit persists a documented limit
record (in-memory page state; REF's is inert).

### R33-D — /shiftswap at-rest parity

Remove the "Request Swap" PageHeader action (REF's at-rest has none) and
ship REF's empty text on both tabs. Superset preserved via an
**invisible-at-rest entry**: the dialog opens on the "n" keyboard
shortcut (Gmail/Linear precedent — no at-rest chrome, E2E-able), and the
/api/shiftswaps CRUD + status flow are unchanged.

### R33-E — /careers structure

Add the page canvas (blue-50→indigo-50); restructure the hero to REF's
(max-w-6xl mx-auto px-4 > text-center > h1 mb-4 + sub blue-100 mb-8 +
the search input); add the "Browse by Company" H2; align the chips
(rounded-md, border token, foreground text, drop "All Companies" —
clicking the active company chip again clears the filter, the superset
behavior). The search input filters the job list client-side (superset).

### R33-F — /payrollai empty state

CircleCheckBig 64px green-500 + "All Clear!" H3 + "No payroll
adjustments needed" P (REF's exact strings/classes).

### R33-G — the login Alert (new ui component)

Create `src/components/ui/alert.tsx` (the shadcn Alert/AlertTitle/
AlertDescription primitives) and rebuild the login error with it —
`bg-red-50/70 border-red-200 rounded-xl` + AlertDescription
`text-red-700` (no icon, REF renders none).

### R33-H — /settings card border

`border-slate-200` on the settings page Card (the 3-unit deferred
micro-diff).

## Verified non-gaps (documented, no action)

- /employeeportal, /externaljobapplication, /tenantsetup: at-rest text
  + button inventories byte-match (modulo REF's sidebar-in-main DOM
  artifact).
- /careers job DATA: REF's live base44 data (20+ companies) cannot be
  replicated — the zero-data contract stays the parity target (round
  31's documented stance); the clone's with-data rendering follows
  REF's measured with-data geometry this round.
- REF's payrollreports tabs are inert (clicking Tax/Custom changes
  nothing) — the clone keeps its inert triggers + adds the Custom one;
  wiring real per-tab content would be a with-data superset for a
  future round.
- The payrollai "Run AI Analysis" button + stat row already match.

## Execution order (TDD)

1. RED pins: the session-34 block in `tests/unit/recipes.test.ts`
   (R33-A…H source contracts) + the evolved R31-C1/C5/C6/C7/C8/C9 pins
   (they pin the structures this round replaces).
2. GREEN: alert.tsx → login → payrollreports → requestreports →
   requestsettings → shiftswap → careers → payrollai → settings.
3. E2E: evolve the orphan-routes spec (shiftswap round-trip via the
   keyboard shortcut; requestsettings Add via name+email; payrollai/
   careers empty states) + a new login-error spec (the Alert contract).
4. Gates: lint → typecheck → unit → build → E2E.
5. Live dual-browser verification: the nine wired pages' at-rest
   inventories (buttons/inputs/text) + the standing audits (dark sweep,
   light redeploy 12, mobile chrome, navmap) + the login error pair.
6. Screenshots: the payrollreports pair, requestreports pair,
   requestsettings pair, shiftswap pair, careers hero, payrollai empty,
   login error pair → `docs/screenshots/`.
7. Docs: AGENTS session-34 layer + counts, SKILL version + section, PAD
   [S34], CLAUDE/README counts, `docs/session_64.md` +
   `docs/session_65.md`, worklog, this plan's completion record.

## Completion record (session 34)

All eight gap groups delivered; the census's follow-up measurements
drove three extra alignment rounds beyond the plan (the standing
inventory probes only compared text lists — button COLORS and
sub-pixel geometry needed dedicated passes):

- **R33-A**: the full payrollreports rebuild + the follow-ups — the
  kicker/CTA row restructure (items-start, the pill's mb-4 spacing),
  the SOLID-green fix (`bg-none` — the default variant's gradient is
  a bg-image painting over className bg-colors), the thead
  `uppercase`, the CSV/PDF FileSpreadsheet/FileText `mr-1` icons, the
  filter `space-y-1` + the select's explicit `mt-1` (the v4
  inline-label trap), the space-y-4 tabs/card wrapper, and the card
  header restructure (inline Calendar title + `flex gap-2 flex-wrap`
  right block). Chain now byte-identical: filter [204,302], select
  249, tabs [326,362], card 378, CSV/PDF 403.
- **R33-B**: the 4 section cards + the Request Log table + the tile
  class revert + the right-controls gap-2.
- **R33-C**: REF's forms + the iconed heads (Shield/Users) + the
  space-y-2 level rows + the limits mb-4 + the LEFT-aligned header +
  the default-ghost Back (85px). The API's name+email resolution
  (JS-side — SQLite has no case-insensitive equals).
- **R33-D**: the button removed; the "n" shortcut; the pill
  container; REF's empty text.
- **R33-E**: the canvas + hero + search input + Browse H2 + chips.
- **R33-F**: the green CTA (variant + actionsStart + Sparkles) + the
  All Clear! empty.
- **R33-G**: ui/alert.tsx (with the cn-merge fix) + the login error +
  the full stack rebuild (p-4, one wrapper, leading-5 labels,
  mt-1.5 inputs, noValidate removed).
- **R33-H**: border-slate-200 on the settings cards.

Gates: lint 0/0 · tsc ✓ · 507/507 unit (+14) · build ✓ · 135/135
E2E (+2). Live-verified: verify-r33 19/19 MATCH, 0 DIFFs; the
wired-page button/color/geometry inventories byte-identical
(payrollai's serialization artifact aside); the login stack + Alert
pair MATCH; the standing audits hold. 11 screenshots (114-120) →
145 PNG captures. DB pristine.
