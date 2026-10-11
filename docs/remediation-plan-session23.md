# Remediation Plan — Session 23 / Parity Round 22

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app)
**the scroll dimension audit** — the never-swept interaction layer per
session_36/37's suggested next steps ("a possible scroll dimension — sticky
behaviors and scroll-away kickers are pinned, but scroll-driven effects were
never swept"). Method: static CSSOM enumeration of every scroll-relevant rule
(position:sticky, overflow:*, scrollbar-*, overscroll-*, scroll-behavior/
snap/margin) with @layer-aware walking + live DOM census of elements whose
computed scroll styles differ from defaults + empirical scrolling (real
scrollTo + settled geometry reads) + a full 46-route docH sweep.

Standing audits this round: **redeploy check PASSED** (12 canonical routes,
h1 text/font/x/y byte-identical — REF unchanged since round 21; width deltas
remain the documented REF-overflow family; one stale-server incident: the
fresh `bun run build` replaced `.next/standalone` under the running :3200
process → 404s → restart fixed it — document: ALWAYS restart the standalone
server after a rebuild). **Mobile navigation audit PASSED byte-identical**
(top bar 390×73 sticky pinned during real scroll; tabs x 10/79/139/204/313;
drawer 288×844 #FAFAFA z-50; kickers 53/69; md boundary 767/800 — no
Tailwind v4 bug). **Mobile scroll behavior verified byte-identical**: real
scrollTo(400) on /dashboard @390×844 — both apps scroll to exactly 178, top
bar stays pinned at y=0 h=73, the kicker scrolls away (the session-9 static
kicker pin, now empirically re-confirmed). **With-data re-check**: REF still
renders zero data (employees 0 rows) — the with-data frontier stays blocked.

## The scroll map (measured)

**REF stylesheet**: zero authored scroll-special rules (no scrollbar styling,
no scroll-behavior/snap/margin, no overscroll outside the sonner library).
**LOC stylesheet**: the custom `.scrollbar-thin` class (scrollbar-width: thin
+ scrollbar-color #cbd5e1/transparent + ::-webkit-scrollbar 6px + rounded-3px
slate-300 thumb) + the v4 registry utilities (.scroll-mt-24/28,
.overscroll-contain — generated but unused in the live DOM). **JS scroll
APIs**: zero usage in the clone (no scrollTo/scrollIntoView/scroll
listeners); both apps scroll at the document level.

**Sidebar architecture**: REF = `position: fixed` inner container (shadcn
sidebar internals) with the internal `flex min-h-0` nav scroll container;
LOC = `position: sticky top-0` aside with the internal `overflow-y-auto`
nav. **Functionally identical** — both pinned at every scroll offset, the
nav scroll containers match byte-exactly (rect [0,89,255,690], sh=872>ch=690
on pages whose active group expands). Documented non-gap.

**Drawer** (@390×844): panel fixed 288×844 both; nav scroll container
[0,89,288,634] both; `overscroll-behavior: contain` on body on BOTH (Radix
RemoveScroll / vaul library behavior — match). The mobile drawer slide
timings were pinned in round 21 (500ms/300ms) — unchanged.

**Empirical scroll**: /advancedanalytics @1440×900 — REF docH 1579 vs LOC
1577 (2px knife-edge); nav scroll range identical. The toast viewport
[1020,868,420,32] matches. /dashboard @390×844 mobile — identical pinned
top bar + scrolled-away kicker at scrollY 178.

**Full 46-route docH sweep @1440×900**: 39/45 byte-identical. Deltas:
/attendance -68 (REF's own overflow family, documented), /attendancedashboard
-30 (table recipe gap R22-F + with-data row), /compliancedashboard +21
(phantom margin R22-B, net of -3 knife-edge), /advancedanalytics -2
(knife-edge), /hrreports +227 (table empty-state gap R22-E),
/settings +24 (phantom margin R22-B), /employeeselfservice +310 (REF renders
a dead "Loading your profile..." page — the clone's working page is the
documented superset, the session-18 hrreports-dead-mobile category).

## Gap groups

- **R22-A (the scrollbar dimension — systemic)**: the clone styles its
  scrollbars; REF never does (0 scrollbar rules, computed `auto` everywhere).
  Live evidence: the sidebar nav SCROLLS on /settings and /advancedanalytics
  (sh=872 > ch=690) — the clone renders a 6px slate-300 rounded thumb (both
  the standard `scrollbar-width: thin` and the ::-webkit 6px pair), REF
  renders the browser default. Also on `ui/dialog.tsx` DialogContent
  (dormant until a dialog overflows). Fix: remove `scrollbar-thin` from
  `src/components/layout/sidebar-nav.tsx` (nav) + `src/components/ui/dialog.tsx`
  (DialogContent) + delete the `.scrollbar-thin` block from
  `src/app/globals.css` @layer utilities.
- **R22-B (the v4 trailing space-y margin — the phantom 24px, systemic)**:
  Tailwind v4's `space-y-*` emits `margin-block-end` on `:not(:last-child)`
  (trap 6's selector flip). On the four `space-y-6` tab roots (settings,
  attendance, compliancedashboard, profile) the ACTIVE TabsContent is
  followed only by display:none Radix siblings — it still carries mb-24,
  leaving 24px dead space below the tab card. REF's v3 (margin-top on
  `* + *`) never trails. Live: /settings docH 943 vs 919; compliance tab
  stack 572 vs 551 (net +21 after a -3 interior knife-edge). attendance and
  profile currently absorb the phantom under the min-h-screen floor, but it
  surfaces at shorter viewports and with data. Fix: the TabsContent base in
  `src/components/ui/tabs.tsx` gains `mb-0!` (the v4 important form) — kills
  the trailing margin on every tab root; the pill→card gap survives (the
  pill's own mb-24 provides it); no-op in non-space-y contexts.
  `reports/reports-browser.tsx` already uses the `flex flex-col gap-6`
  pattern (the in-codebase precedent — gap ignores display:none children).
- **R22-C (the loans dialog — functional + visual gap, the round's core)**:
  REF's "New Loan Request" dialog (the only dialog that opens on zero-data
  REF — settings Edit, expenses etc. are dead controls there): 672px wide
  (max-w-2xl), H2-only header (NO description), form `space-y-4` with
  `space-y-2` field rows (label text-sm font-medium leading-none + control),
  an Employee select, a "Requesting for" preview card (`p-4 bg-blue-50
  rounded-lg` with a 20px user icon + name/email, rendered when an employee
  is selected), a `grid grid-cols-2 gap-4` of Loan Type (select: Standard
  Loan / Emergency Loan / Salary Advance / Personal Loan), Amount (SAR),
  Duration (Months), and a read-only Monthly Installment display
  (`p-2.5 bg-slate-100 border` — "SAR 0.00", computed = amount ÷ months),
  a Reason textarea (min-h-[60px]), a Paid From text input, and a
  `flex justify-end gap-3` actions row (Cancel outline + "Submit Request").
  The clone's current dialog: 512px (max-w-lg), a DialogDescription REF
  lacks, gap-1.5 field rows, no Loan Type / Monthly Installment / Paid From
  / preview card, a `flex-col-reverse` DialogFooter with "Create Request".
  Fix: `src/app/(app)/loans/page.tsx` (form + state), `prisma/schema.prisma`
  (Loan gains `loanType String @default("standard")` + `paidFrom String?`),
  `src/app/api/loans/route.ts` (LoanInput gains the two fields), and the
  loans table gains a Type column (REF's table unmeasurable — zero-data;
  superset display). The dialog keeps the 85vh cap + oy-auto as the fitting
  superset (REF's un-capped dialog would clip on short viewports — its own
  bug family), minus the scrollbar-thin (R22-A).
- **R22-D (compliance monitor tab)**: the stat tile order is Expired, ≤7,
  ≤15, ≤30 on REF (the clone renders ≤7/≤15/≤30/Expired), and the monitor
  tab's table card title is "At-Risk Employees" on REF (the clone renders
  "Document Expiry Monitor" — it already has an At-Risk Employees title in
  the OTHER tab). Fix `src/app/(app)/compliancedashboard/page.tsx`: swap the
  StatCard order + retitle the monitor table card.
- **R22-E (hrreports data table)**: REF's table th = `px-3 py-2 text-left
  text-xs font-semibold text-slate-600 uppercase` (33px) with LOWERCASE DOM
  texts (full name, job title, department id, employment status, employment
  type, start date — the uppercase class renders them). At 0 records REF
  renders the HEADER ROW ONLY (no empty state, no empty row — the table just
  ends; card 139px). The clone renders the systemic 45px th + a 284px
  EmptyState block ("No records found"). Fix
  `src/app/(app)/hrreports/page.tsx`: per-page TableHead recipe (33px,
  lowercase texts), header-only table at 0 records (drop the EmptyState),
  keep the with-data rows as the superset.
- **R22-F (attendancedashboard summary table)**: REF's th = `text-left py-2
  px-3 text-slate-500 font-medium` (37px, ALL six columns text-left —
  including the numeric Present/Absent/Late/Rate). At 0 rows REF renders the
  th row + a bare `P.text-center.text-slate-400.py-8` "No employees found
  for selected filter." (88px) inside the table wrapper. The clone renders
  the systemic 45px th with text-right numeric columns and swaps the whole
  table for the EmptyState component at 0 rows. Fix
  `src/app/(app)/attendancedashboard/dashboard.tsx`: per-page th recipe (37px
  all-left), the P empty state at 0 rows (table header + P, not EmptyState),
  numeric td left-aligned to stay coherent with the measured th (REF's td
  unmeasurable — zero-data; documented inference).

## Verified non-gaps (documented, no action)

- **Mobile scroll behavior**: byte-identical (pinned top bar, static kicker,
  same 178px scroll range on /dashboard @390×844).
- **overscroll-behavior: contain on body**: both apps (drawer-open state;
  Radix RemoveScroll on the clone, vaul on REF — library parity).
- **scroll-behavior / scroll-snap / scroll-margin**: nothing authored on
  either side; the v4 registry utilities (.scroll-mt-*, .overscroll-contain)
  are generated-but-unused in the clone's DOM.
- **Sidebar fixed vs sticky**: architecture difference, zero visible
  divergence (both pinned at every offset; nav scroll containers match
  byte-exactly).
- **/employeeselfservice**: REF = dead "Loading your profile..." page — the
  clone's working 1210px page is the documented superset (the session-18
  hrreports-dead-mobile category).
- **/attendance -68**: REF's own title-wrap overflow family (documented
  since session 10).
- **Knife-edges**: /advancedanalytics -2, compliance toolbar -2 + table card
  -1 (2px/1px rounding family — sub-visible).
- **The dialog 85vh cap + oy-auto**: kept as the fitting superset (REF's
  un-capped dialog clips on short viewports); only the scrollbar-thin goes
  (R22-A).
- **attendance/loans table td styling with data**: unmeasurable on REF
  (zero-data) — the clone's with-data rendering stays the documented
  superset.
- **JS scroll APIs**: zero usage in the clone — nothing to mirror.
- **reduced-motion**: unchanged from round 21 (open a11y item on both apps).
- **checkbox focus recipe**: still no measurable REF surface (blocked).

## Execution order (TDD)

1. RED pins (`tests/unit/recipes.test.ts` session-23 block):
   - sidebar-nav: nav carries overflow-y-auto but NOT scrollbar-thin
   - dialog.tsx: DialogContent carries max-h-[85vh] overflow-y-auto but NOT
     scrollbar-thin
   - globals.css: no .scrollbar-thin block remains
   - tabs.tsx: TabsContent carries mb-0! (the phantom killer)
   - loans page: max-w-2xl, no DialogDescription, the Loan Type select +
     the four options, the Monthly Installment display recipe, the Paid
     From field, the Requesting-for card, justify-end gap-3 actions +
     "Submit Request", the space-y-2 field rows, min-h-[60px] textarea
   - loans API: LoanInput gains loanType (enum) + paidFrom (optional)
   - loans table: the Type column
   - compliance: Expired-first stat order + "At-Risk Employees" title
   - hrreports: the 33px uppercase th recipe + lowercase texts + no
     EmptyState in the table card (header-only at 0 records)
   - attendancedashboard: the 37px all-left th recipe + the py-8 P empty
     state (no EmptyState)
2. GREEN: schema (Loan.loanType/paidFrom) + db:push; the 8 file edits
   (globals.css, tabs.tsx, sidebar-nav.tsx, dialog.tsx, loans page + API +
   table, compliance page, hrreports page, attendancedashboard dashboard).
3. Gates: lint → typecheck → unit → build → E2E (86) — restart :3200 after
   the build (the stale-server lesson).
4. Live dual-browser verification: nav scrollbar computed auto on LOC;
   /settings + /compliance docH now matching REF (919/949 ± knife-edge);
   the loans dialog 672px with the full REF field set + computed installment
   + preview card; the hrreports header-only table; the attendance 37px th
   + P empty state (via a filtered department to force 0 rows); post-fix
   regression: the canonical 12-route sweep + mobile chrome + the full docH
   sweep re-run.
5. Screenshots: the loans dialog open (the round's core evidence), the
   sidebar nav scrollbar state, hrreports table, attendancedashboard table +
   2 standards refreshed → docs/screenshots/.
6. Docs: AGENTS session-23 layer, SKILL §35, PAD [S23], CLAUDE/README
   counts, session log (docs/session_38.md), worklog, this plan's
   completion record.

## Documented non-goals / supersets kept

- The dialog 85vh cap + internal scroll (fitting superset over REF's clip).
- The loans table Type column + with-data rows (REF unmeasurable).
- The attendance td left-alignment (th-measured-adjacent inference; REF's
  td unmeasurable).
- The employeeselfservice working page (REF's dead spinner page).
- No scrollbar styling ANYWHERE (REF's contract — the .scrollbar-thin class
  is deleted, not neutralized).

## Completion record (session 23)

All six gap groups executed TDD-first (13 new pins in
tests/unit/recipes.test.ts, all RED before implementation → GREEN; six
mid-flight pin corrections — the comment-literal lesson struck for the
third consecutive round: reword the comments, don't fight the pins):

- **R22-A**: `.scrollbar-thin` deleted from globals.css + sidebar-nav.tsx
  + dialog.tsx. Live-verified: the nav computes `scrollbar-width: auto`
  with 0 styled elements (it scrolls at 872>690 with the browser-default
  scrollbar like REF).
- **R22-B**: `mb-0!` on the TabsContent base (`ui/tabs.tsx`). Live-verified:
  /settings docH 943 → 919 = REF EXACT; the compliance tab stack 572 →
  (net -3 residual = the toolbar -2 + card -1 knife-edge); the pill→card
  24px gap preserved (the pill's own mb-24).
- **R22-C**: the loans dialog rebuilt — `max-w-2xl` (672px), H2-only
  header, `space-y-2` field rows, the always-rendered Requesting-for card
  (622×88 vs REF 622×88-90), the 4-option Loan Type select, the live
  Monthly Installment display (303×46, "SAR 0.00" → "SAR 100.00" on
  1200/12 — prefix + 2 decimals, text-center, border-slate-200), Reason
  min-h-[60px], Paid From, and the `flex justify-end gap-3` Cancel +
  Submit Request actions. Schema: Loan.loanType (default "standard") +
  Loan.paidFrom (db:push, additive); the API validates a 4-value enum; the
  table gained the Type column. VLM-verified.
- **R22-D**: the compliance stat order is now [Expired, ≤7, ≤15, ≤30] and
  the monitor table card is titled "At-Risk Employees".
- **R22-E**: the hrreports table renders the 33px uppercase th with
  lowercase DOM texts (TABLE_HEADERS const; the CSV export keeps the
  uppercase literals) and the HEADER-ONLY table at 0 records — card 139 =
  REF 139 EXACT, docH 949 = REF 949 EXACT.
- **R22-F**: the attendancedashboard table renders the 37px all-left th on
  all six columns + the bare `text-center text-slate-400 py-8` P "No
  employees found for selected filter." as the table's sibling at 0 rows.

Gates: lint 0/0 · tsc ✓ · 411/411 unit (+13) · build ✓ · 86/86 E2E.
Post-fix regressions: canonical 12-route sweep 12/12 MATCH + mobile chrome
byte-identical + the full 46-route docH sweep re-run (the settings/
hrreports/compliance deltas eliminated; the /employees + /offboarding
mid-sweep reads re-probed settled 900=900 — mid-hydration artifacts).
6 screenshots (4 evidence + 2 standards) → 92 total. DB pristine
(users=1, employees=1, leaveBalances=2, payroll=0, expenses=0).
