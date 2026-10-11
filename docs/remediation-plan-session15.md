# Remediation Plan — Session 15 / Parity Round 14

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app)
computed-style diffing at 1440×900 + 390×844. Redeploy check PASSED (route
h1s byte-identical on 12 probe routes — REF unchanged since round 13).
Mobile navigation audited end-to-end per the standing user priority: top bar
(390×73 white + 1px slate-200 border, sticky z-10), bottom tabs (78@766,
5 tabs byte-identical incl. x-pitches 10/79/139/204/313, 14px labels, 20px
icons, active rgb(37,99,235)), drawer (288×844 #FAFAFA z-50, footer
121@723, submenu links at identical y's), kicker (53px@89, 18px/700) +
scroll-away, md boundary (767 mobile chrome + hamburger 28×28@24 both → 800
desktop sidebar + Main Menu both) — **all byte-identical, no Tailwind v4
bug**.

Full 46-route desktop sweep (h1 metrics + stat cards + header buttons + the
NEW tab-pill layer) + per-page DOM dumps + a data-bearing-state audit
(compliance counters, reports tile clicks, profile save flow). The round's
core finds: **two more muted tab pills that should be the white shrink-wrap
recipe (recruitment, performancemanagement), a 491px pill-centering bug on
staffrequests (flex-col cross-axis stretch), a profile tab-content
value bug (the Preferences card renders under "general"), the compliance
notify buttons rendered at the default size instead of h-8, and the
training h2-row superset button breaking the measured row height.**

## Verified non-gaps (documented, no action)

- **Category-A h1 block-width furniture** (interviewassistant,
  communications, analytics, reports, settings, securitysettings,
  notificationpreferences, hrassistantchat, profile): REF h1 fills the
  content flow (720–1120px), clone shrink-wraps — x/y/font identical, zero
  visual impact (documented since round 12). The profile h1 width (1024 vs
  463) is this category.
- **REF's own bugs kept as fitting supersets**: /attendance docW 1558 +
  2-line h1 (all seven header-button widths + the 471px white pill +
  167/189/104 triggers byte-identical; only the y-offset differs);
  /recruitmentkanban docW 1664; /employeeselfservice stuck at "Loading
  your profile…" (LOC renders the working superset page).
- **allleaverequests h1 x=294 vs 288**: transient mid-hydration reading —
  re-probe shows x=288 w=423 identical on both sides (the LOC parent's
  min-w-0 class is DOM furniture).
- **Reports tile buttons are dead on REF**: clicking CSV on REF fires NO
  toast and no download (all-buttons probe; no toaster in the REF DOM).
  LOC's tiles generate real CSVs — the functional superset stands.
- **Compliance data state**: REF is also at zero data (8 stat "0"s at the
  same y's, 0 table rows, "0 at-risk documents" counter identical) — the
  zero-state surfaces are the comparable ones.
- **staffrequests semantics**: REF wraps its single "My Requests (N)"
  trigger in a Radix TabsList (role=tablist); LOC keeps the aria-pressed
  toggle button (a single-tab tablist that toggles is semantically wrong;
  the toggle is the better-a11y reading). Geometry now fixed by R14-D.
- **Profile Save Changes**: 164×36@724 type=submit — byte-identical on
  both sides (an earlier "missing" reading was a hydration race).

## Gap groups

- **R14-A recruitment tab pill + trigger icons**: REF pill = 439×36
  `bg-white border border-slate-200` (the white shrink-wrap recipe from
  R13); triggers "Applicants & Ranking" 190 / "AI CV Upload" 131 / "Job
  Postings" 108 — the first two carry 12px lucide icons (users, sparkles)
  with gap-1 (the compliance trigger recipe). LOC renders the muted
  `bg-secondary` pill (405) with icon-less triggers (174/115/108). Fix:
  `<TabsList className="bg-white border border-slate-200">` + gap-1
  h-3 w-3 icons on the first two triggers.
- **R14-B training section furniture**: REF renders the "Training
  Platforms" h2 row EMPTY (32px row = the h2 line only) and the simple
  202px empty card; the whole REF page has NO create affordance
  (all-buttons = the 7 category chips only). LOC: (a) the chip-row
  container carries `role="tablist"` (REF: plain div; a tablist without
  tab children is invalid ARIA) — switch to `role="group"` (a11y
  superset); (b) the h2 row carries a 158×36 "New Platform" button making
  the row 36px — REMOVE it (row returns to 32px parity); (c) keep the
  create affordance as the documented content-position superset: a
  loans-recipe CTA below the empty-state line, and a trailing dashed
  add-tile in the with-data grid.
- **R14-C performancemanagement tab pill**: REF = 296×36 white pill
  (`bg-white border border-slate-200`), triggers 112/174 (no icons —
  identical widths already). LOC: muted bg-secondary pill (294). Fix: the
  TabsList className.
- **R14-D staffrequests pill stretch (the round's visual bug)**: REF pill
  = 145×36@(288,172) muted TabsList with the 137×28 trigger at x=292 —
  the pill shrink-wraps inside a plain BLOCK parent (the Radix Tabs
  root). LOC renders the pill as a direct child of a `flex flex-col`
  wrapper → the cross-axis `align-items: stretch` stretches it to 1120px
  and `justify-center` centers the trigger at x=779 — **491px off** (all
  prior rounds compared w×h only; x was never pinned). Fix: drop the
  `flex flex-col` from the wrapper (plain block div) — pill left-aligns
  at 145px.
- **R14-E profile Preferences tab content**: the Language/Timezone card
  ("General Settings" card with the two selects + Save General Settings)
  renders inside `<TabsContent value="general">` — a copy-paste bug from
  the R13-C rebuild. The General tab shows 6 fields (4 measured + the
  56px Language/Timezone pair at y=908) and the actual "preferences" tab
  renders EMPTY. REF General = exactly 4 fields (Full Name/Email @540,
  Phone/Job Title @632). Fix: the TabsContent value → "preferences"
  (+ harden Change Photo with type="button" — it currently reports the
  HTML default "submit").
- **R14-F compliance notify buttons**: REF renders the three notify
  buttons at the h-8 size (32px, padding 0 12px, text 12px — the
  size="sm" variant), widths 166/173/173 with 16px mr-1 icons. LOC
  renders the default h-9 (36px, 8px 16px, 14px), widths 192/201/201.
  Fix: `size="sm"` on the three Notify All buttons.

## Execution order (TDD)

1. RED pins in tests/unit/recipes.test.ts (session-15 describe blocks):
   the recruitment white pill + iconed triggers, the training h2-row
   emptiness + role=group container + empty-state CTA + grid add-tile,
   the performancemanagement white pill, the staffrequests plain-div
   wrapper (no flex-col), the profile preferences TabsContent value +
   General 4-field recipe, the compliance size="sm" notify buttons.
2. GREEN: R14-C/A (one-line className + icon edits), R14-D (wrapper),
   R14-F (size), R14-E (value + type), R14-B last (the training
   restructure: row, container role, empty-state CTA, add-tile).
3. Gates: lint → typecheck → unit → build → E2E (86).
4. Live dual-browser re-verification of every fixed surface + full-route
   sweep + mobile-nav regression.
5. With-data smoke (training platform injected → add-tile renders;
   DB restored + pristine-check) + screenshots refresh + docs
   (AGENTS session-15 layer, SKILL §27, PAD [S15], CLAUDE/README counts,
   session log, worklog).

## Documented non-goals / supersets kept

- LOC keeps its functional supersets: working reports CSV/PDF generation
  (REF's buttons are dead), the working employeeselfservice page, the
  admin attendance form, the training-platform CRUD (now reached via the
  content-position affordances instead of the h2 row).
- The training empty-state card grows ~52px taller than REF's 202px with
  the CTA below the line — the documented hrletters/loans-recipe superset
  category (content-position CTA).
- Category-A h1 furniture stays (documented since round 12).
- The staffrequests toggle button keeps aria-pressed semantics (no
  role=tablist) — documented a11y superset.

## Completion record (session 15)

All six gap groups executed TDD-first (13 new pins; 12 RED + 1 incidental
guard; 2 pins refined during implementation — the profile TabsContent
regex windows widened for the 4.5KB/2.8KB blocks): R14-A recruitment
white pill + gap-1 h-3 w-3 trigger icons, R14-B training role=group chip
row + empty 32px h2 row + empty-state CTA superset + dashed add-tile,
R14-C performancemanagement white pill, R14-D staffrequests plain-block
wrapper (pill 145@288, trigger 137@292 — the 491px centering bug), R14-E
profile preferences TabsContent value + type=button Change Photo, R14-F
compliance size="sm" notify buttons. Gates: lint 0/0 · tsc · 337/337 unit
· build · 86/86 E2E. Live dual-browser verification: 6/6 checks
byte-exact (training's empty-state card is +48px with the documented
loans-recipe CTA superset). Full-route sweep re-run — all fixed surfaces
out of the diff; mobile regression clean; with-data smoke passed
(platform card + add-tile render, DB restored pristine).
