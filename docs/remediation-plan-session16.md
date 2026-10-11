# Remediation Plan — Session 16 / Parity Round 15

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app)
computed-style diffing at 1440×900 + 390×844 + mid-viewport fitting probes
(1280/1100). Redeploy check PASSED (route h1s byte-identical on 12 probe
routes — REF unchanged since round 14). Mobile navigation audited
end-to-end per the standing user priority: top bar (390×73 white + 1px
slate-200 border, sticky z-10), bottom tabs (78@766, 5 tabs byte-identical
incl. x-pitches 10/79/139/204/313, 14px labels, 20px icons, active
rgb(37,99,235)), drawer (288×844 #FAFAFA z-50, footer 121@723, submenu
links at identical y's, NO close button — prior probes missed the REF
panel because `offsetParent` is null for fixed-position elements),
kicker (53px@89, 18px/700) + scroll-away, md boundary (767 mobile chrome +
hamburger 28×28@24 both → 800 desktop sidebar + Main Menu both) — **all
byte-identical, no Tailwind v4 bug**.

Full 46-route desktop sweep (h1 metrics + stat cards + header buttons +
tab pills) + a zero-data empty-state sweep across 13 routes + a
mid-viewport fitting audit (docW at 1280/1100) + a token-surface color
audit (sidebar footer, tab pills, placeholders, descriptions). The
round's core finds: **the tab-pill inactive-trigger color is systemically
wrong (REF renders its muted-foreground TOKEN #737373 there — the
session-6 "never visibly renders" claim is stale), the sidebar footer
cluster carries three wrong colors (Bell slate-600, Moon zinc-700, user
name zinc-700), the attendance actions cluster overflows at mid-viewports
(shrink-0 blocks the documented wrap), the organogram renders a headed
card where REF renders a bare centered card with the simple empty
recipe, and the staffrequests pill mixes the wrong surface token
(bg-muted vs REF's #F5F5F5 secondary) with the wrong default trigger
state.**

## Verified non-gaps (documented, no action)

- **Category-A h1 block-width furniture** (interviewassistant,
  communications, analytics, reports, settings, securitysettings,
  notificationpreferences, hrassistantchat, profile): REF h1 fills the
  content flow (720–1120px), clone shrink-wraps — x/y/font identical,
  zero visual impact (documented since round 12).
- **REF's attendance overflow family**: REF docW 1558 + 312px two-line
  h1 + 235px stat cards (its overflowing 1238px wrapper) + the
  `lg:grid-cols-5` breakpoint; the clone's fitting page keeps the one-line
  title, wraps the cluster, 211px cards and switches to 5 columns at xl —
  the documented fitting-superset category (R9-E). At 1100 REF renders 5
  overflowing columns; the clone renders a fitting 3+2.
- **Settings pill overflow at 1100 = REF parity**: pill right edge 1259
  on BOTH sides (REF docW 1291 — its own additional overflow). A tab
  pill cannot wrap without breaking the recipe; REF overflows too.
- **/templates (+36px) and /hrletters (+52px) empty cards**: the
  documented loans-recipe CTA supersets (R10-F/R11-B).
- **/evaluations sweep miss = hydration race**: settles byte-identical
  (h1/pill/triggers/New Review all exact on re-probe).
- **REF's user button is dead** (no menu opens); the clone's dropdown is
  the superset. REF's reports tile buttons remain dead (clone CSVs =
  superset).
- **staffrequests semantics**: REF wraps its trigger in a Radix
  tablist; the clone keeps the aria-pressed toggle (documented a11y
  superset — a single-tab tablist that toggles is semantically wrong).
- **documenttracker empty state**: byte-identical (card 1120×214@338,
  p-6 py-16, 48px icon, one 16px line) — the audit probe had caught a
  stat tile on REF.
- **Sidebar group labels + "Demo" labels**: both sides render explicit
  slate-500 (rgb(100,116,139)) — the muted-foreground TOKEN is not
  involved there and must NOT be changed globally (311 usages).

## Gap groups

- **R15-A (systemic — tab-pill inactive trigger color, 9 surfaces)**:
  REF inactive trigger text = `rgb(115,115,115)` (#737373 — the
  reference's `--muted-foreground` token `0 0% 45.1%`, which DOES
  visibly render on tab surfaces). LOC renders `#64748B` (the clone's
  slate-500 token). Affected pills (all widths already byte-exact):
  settings 971, profile 507, attendance 471, compliance 331, recruitment
  439, performancemanagement 296, evaluations 512, the reports selector
  chips, and the staffrequests local pill. Fix: pin
  `--color-neutral-500: #737373` in the palette; `ui/tabs.tsx`
  TabsList default `text-muted-foreground` → `text-neutral-500`;
  `reports-browser.tsx`'s explicit `text-muted-foreground` override →
  `text-neutral-500`. The muted-foreground TOKEN itself stays #64748b
  (311 usages render slate-500 on REF via explicit classes).
- **R15-B (sidebar footer colors — three stale measurements)**: REF
  Bell ghost icon = `rgb(71,85,105)` (slate-600) vs LOC slate-500;
  REF Moon ghost icon = `rgb(63,63,70)` (zinc-700 #3F3F46) vs LOC
  slate-500; REF user name = `rgb(63,63,70)` (zinc-700) vs LOC
  slate-900 (the session-6 "name at slate-900" measurement is stale —
  the reference redeployed). Email (slate-500), عربي (slate-700) and
  the avatar icon (white) already match. Fix: pin
  `--color-zinc-700: #3f3f46`; explicit `text-slate-600` on the Bell
  trigger, `text-zinc-700` on the Moon trigger and the name paragraph
  (applies to the desktop sidebar AND the mobile drawer footer — same
  component).
- **R15-C (attendance actions cluster mid-viewport fitting)**: at 1100
  the LOC page overflows (docW 1199) — the cluster's `shrink-0` keeps
  it at its 911px natural width inside the wrapping header row, so it
  overflows its own line instead of letting its internal `flex-wrap`
  wrap the seven buttons. The documented R9-E intent is "wraps the
  cluster to a second row (sm:flex-wrap)" — the attendance row already
  wraps at 1440 (title line + cluster line); the shrink-0 breaks the
  fit at 640–1280. Fix: remove `shrink-0` from the PageHeader default
  actions cluster (`flex flex-wrap items-center gap-3`). Zero change at
  1440 (every header cluster fits its row — the R14 sweep verified all
  header-button geometry byte-exact; shrinking only engages under
  constraint). The settings pill overflow is NOT this bug (pills can't
  wrap — REF parity, see non-gaps).
- **R15-D (organogram empty state)**: REF renders a BARE centered card
  783×202@(288,228) — NO CardHeader (no "Reporting Structure" title, no
  description) — with the simple empty recipe: `p-12 text-center`
  interior, 64px icon (y=277), ONE 16px slate-500 line "No reporting
  structure defined." (y=357). The card sits in a
  `min-w-max flex justify-center p-8` wrapper inside
  `overflow-x-auto pb-8` (wide org trees scroll horizontally). LOC
  renders a full-width 1120×360 card with CardTitle +
  CardDescription + the full EmptyState (icon + h3 + description).
  Fix: drop the CardHeader, render the simple empty recipe (icon + one
  line), adopt the centering + overflow wrapper for both empty and
  with-data states.
- **R15-E (staffrequests pill recipe + default state)**: (a) pill
  background: REF `rgb(245,245,245)` = #F5F5F5 (the SECONDARY surface)
  vs LOC `bg-muted` #F1F5F9 (slate-100) — switch to `bg-secondary`;
  (b) the pill's inactive text inherits R15-A's neutral-500; (c) the
  trigger's DEFAULT state: REF's single tab always renders SELECTED
  (white bg + #0A0A0A text + shadow, 137px) while LOC's scope toggle
  defaults to `scope === "all"` (inactive look: transparent + slate-500,
  aria-pressed=false). The reference page IS "My Requests (N)" — fix the
  default scope to `"mine"` so the trigger renders the selected look at
  load and the table lists the user's requests (the toggle-to-all
  remains the documented superset; at pristine 0 requests both scopes
  render the same empty state).

## Execution order (TDD)

1. RED pins: `tests/unit/tokens.test.ts` gains the `--color-neutral-500:
   #737373` + `--color-zinc-700: #3f3f46` palette pins;
   `tests/unit/recipes.test.ts` gains a session-16 describe block —
   tabs.tsx TabsList `text-neutral-500`, reports-browser override,
   sidebar-nav Bell/Moon/name classes, page-header cluster without
   shrink-0, organogram bare card + simple empty + overflow wrapper,
   staffrequests `bg-secondary p-1 text-neutral-500` + default scope
   "mine". Update the three stale pins (shell-recipes 577 bg-muted →
   bg-secondary; shell-recipes 230 shrink-0 removal; recipes 1267/1268
   the R14-D wrapper pin's pill classes).
2. GREEN: R15-A (palette + tabs + reports-browser), R15-B (footer
   colors), R15-E (staffrequests pill + scope), R15-C (shrink-0),
   R15-D (organogram rebuild) last.
3. Gates: lint → typecheck → unit → build → E2E (86).
4. Live dual-browser re-verification of every fixed surface (pill colors
   on 9 pages, footer colors, attendance fit at 1100 + 1440, organogram
   geometry, staffrequests pill + trigger) + full-route sweep + mobile
   regression.
5. Screenshots refresh + docs (AGENTS session-16 layer, SKILL §28,
   PAD [S16], CLAUDE/README counts, session log, worklog).

## Documented non-goals / supersets kept

- The muted-foreground TOKEN stays #64748b — only tab surfaces switch to
  the pinned neutral-500 (the sidebar group labels, Demo labels and
  300+ other usages render REF's explicit slate classes).
- LOC keeps its functional supersets: working reports CSV/PDF, the
  working employeeselfservice page, the admin attendance form, the
  training-platform CRUD, the staffrequests scope toggle (now
  defaulting to the reference's "mine" view), the user dropdown menu.
- The attendance/stat-row fitting family stays (one-line title, wrapped
  cluster, 211px cards, xl breakpoint) — REF's overflow is its own bug.
- The settings pill keeps its 971px single-line geometry (REF overflows
  identically at mid-viewports).

## Completion record (session 16)

All five gap groups executed TDD-first (12 new pins, all RED before
implementation; 3 stale pins updated — the session-6 user-name color,
the R14-D pill-classes window, and the shrink-0 cluster pin): R15-A the
systemic tab-pill neutral-500 inactive color (tabs.tsx +
reports-browser + staffrequests; --color-neutral-500 pinned), R15-B the
sidebar footer Bell slate-600 / Moon zinc-700 / name zinc-700
(--color-zinc-700 pinned; desktop + mobile drawer), R15-C the
actions-cluster shrink-0 removal (attendance docW 1199 → 1100 at 1100px;
1440 geometry unchanged), R15-D the organogram bare-card rebuild
(byte-exact: 783×202@457, icon 64@277, line 16px@357), R15-E the
staffrequests bg-secondary pill + mine default scope (trigger renders
the selected look at load). Gates: lint 0/0 · tsc · 349/349 unit ·
build · 86/86 E2E. Live dual-browser verification: 9/9 pill surfaces
byte-exact (rgb(115,115,115) everywhere; staffrequests pill
rgb(245,245,245) + white/dark trigger), footer colors byte-exact,
organogram byte-exact, attendance fit fixed with 1440 unchanged,
full-route sweep clean of non-documented diffs, mobile regression clean
(drawer footer colors verified). With-data smoke passed (2-report tree
rendered in the new wrapper, DB restored pristine: users=1, employees=1,
leaveBalances=2). 13 screenshots captured/refreshed.
