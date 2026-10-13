# Remediation Plan — Session 35 / Parity Round 34

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app),
viewports pinned (1440×900 desktop, 390×844 mobile). Baseline at HEAD
`cafc05b` ALL GREEN: lint 0/0 · tsc ✓ · 507/507 unit · build ✓ · 135/135
E2E. REF's CSS chunk UNCHANGED (`index-BGNH4KkS.css` — the same chunk as
rounds 32–33) → every diff below is clone-side, never REF movement. REF's
data state is unchanged (0 employees — the with-data surfaces stay blocked;
the zero-data contract remains the parity target).

## The census — the dialog interiors + the deep-RTL frontier

Round 33 audited the at-rest bodies of the nine wired pages and the login
form-error surface. This round's census took the frontier's next
candidates: the **dialog-interior dimension** (the loans + assets dialogs —
the only two dialogs REF exposes at zero data — measured geometrically for
the first time), the **deep-RTL polish** (the round-32 delivery re-verified
against REF's actual painted geometry), the **payrollreports tab contents**
(frontier item), and the standing mobile-nav check.

Findings:

1. **The asset dialog interior carries four genuine gaps** (the dialog was
   built in round 30 against the field SET — the interior geometry was
   never inventoried): an invented description line, a stacked Type/Serial
   pair REF renders as a 2-col row, an icon on the Add button REF renders
   text-only, and the dialog-title line-height.
2. **The loans dialog carries two gaps** in otherwise-matching geometry:
   the Monthly Installment value renders as plain neutral text (REF: a
   semibold blue-700 P) and the Paid From input carries an invented
   placeholder.
3. **The systemic dialog-title recipe**: REF's dialog H2s measure
   18px / line-height 18px / weight 600 on BOTH dialogs — `text-lg
   font-semibold leading-none`. The clone's shared DialogTitle is `text-lg
   font-semibold` (LH 28px) — 10px too tall on every dialog in the app.
4. **The deep-RTL find (the headline)**: REF's desktop sidebar does NOT
   mirror in عربي mode. Its architecture is a **fixed painting panel +
   an in-flow transparent peer spacer**: the peer (in normal flow) mirrors
   with `dir=rtl` to the right edge, but the fixed panel stays
   physically LEFT (left:0, right:1184 at 1440 — identical computed
   offsets in LTR and RTL), its internals mirroring (icons right, text
   rtl). Net REF RTL rendering: the sidebar paints at x=0..256 OVER the
   main area's start edge, the main content spans 0..1184 (right-aligned
   text, h1 at x=823), and a transparent 256px gap sits at the right
   edge showing the canvas gradient. The round-32 "RTL mirror matches"
   verification measured the PEER wrapper (which does mirror at x=1184)
   — the same class of selector artifact as the round-31 aside-fallback
   probe. The clone currently mirrors its in-flow aside to the right —
   a proper mirror REF does not render.
5. **The payrollreports tabs are STILL inert on REF** (clicking Tax &
   Deductions changes nothing — re-verified this round) → wiring them to
   real aggregates is pure superset territory (the frontier's framing).
6. Verified non-gaps: the mobile chrome byte-identical (drawer 288@x0,
   header 73h/1px rgb(226,232,240), bottom tabs 766y/78h both apps);
   the wizard empty-submit contract matches (2 HTML5-invalid fields,
   step blocked, both apps); the loans/asset dialogs' required-attribute
   matrices and noValidate=false match; the asset-dialog box geometry
   (512 wide) and Cancel buttons match.

## REF ground truth (all live-measured this round)

### The dialog-title recipe (both dialogs)

`text-lg font-semibold leading-none` — fontSize 18px, lineHeight 18px,
weight 600 (computed). The H2-only header (round 23's loans finding)
generalizes: no dialog on REF renders a description line at zero data.

### /assets — the Add Asset dialog interior

| Element | REF measured |
|---|---|
| box | 512×372 (p-6 grid gap-4 + the 462 inner width) |
| H2 | 462×18 — the leading-none recipe |
| Asset Name | Label 84×16 + Input 462×36 (full width, required) |
| **Type + Serial row** | **2-col**: Type label x489 + Serial label x728 at the same y; select trigger 223×36 x489 + serial input 223×36 x728 (labels 16px above each) |
| Assign To (Optional) | Label + full-width select trigger 462×36 |
| footer | Cancel 81×36 + **Add Asset 102×36 text-only** (no icon), right-aligned |
| validation | HTML5 (name required; noValidate=false — matches the clone) |

### /loans — the installment display + Paid From

| Element | REF measured |
|---|---|
| installment box | `p-2.5 bg-slate-100 border border-slate-200 rounded-md text-center` 303×46 (the clone's box classes already match) |
| installment value | **P** inside the box: fontSize 16px, weight 600, color rgb(29,78,216) = blue-700 |
| Paid From input | 622×36, placeholder **empty** |

### The RTL desktop shell (REF's actual rendering at 1440×900)

| Surface | REF measured (RTL) | REF measured (LTR) |
|---|---|---|
| fixed painting panel | x=0..256, z-10, flex, #FAFAFA + nav (internals mirrored: link svg at x=207, text rtl) | x=0..256 (identical offsets) |
| in-flow peer spacer | x=1184..1440, block, **transparent inner box** (canvas shows) | x=0..256 |
| main column | x=0, w=1184 (h1 right-aligned at x=823) | x=256, w=1184 |
| computed panel offsets | left:0px, right:1184px (both directions — never flips) | left:0px, right:1184px |

## Gap groups

### R34-A — the asset dialog interior

Four fixes: (1) drop the `DialogDescription` line (the H2-only header —
the loans pattern); (2) the Type + Serial fields ride a
`grid grid-cols-2 gap-4` row (labels above each, 223+223); (3) the Add
Asset submit renders text-only (drop the Plus icon); (4) via R34-C.

### R34-B — the loans dialog installment + placeholder

(1) The SAR value wraps in `<p className="text-base font-semibold
text-blue-700">` inside the existing box; (2) the Paid From input loses
its placeholder.

### R34-C — the systemic DialogTitle recipe (the shared component)

`src/components/ui/dialog.tsx`: `text-lg font-semibold` → `text-lg
font-semibold leading-none` — REF-measured on both dialogs; every dialog
title in the app inherits the corrected 18px box.

### R34-D — the RTL desktop sidebar (REF's fixed-panel + peer pattern)

Rebuild the desktop aside in `app-shell.tsx` to REF's architecture:

- An in-flow **peer spacer** (`hidden md:block h-screen w-64 shrink-0`,
  sticky top-0, aria-hidden) reserves the column — it mirrors with
  `dir=rtl` (left in LTR, right in RTL) and paints nothing.
- The **aside becomes the fixed painting panel**: `fixed left-0 top-0
  z-10 hidden h-screen w-64 … md:flex md:flex-col` — physically LEFT in
  both directions (REF's fixed container never flips), internals
  mirroring via the cascading `dir`.
- LTR: spacer at 0..256 + panel over it + main at 256..1440 — visually
  identical to today. RTL: panel at 0..256 (overlapping the main area's
  start edge), main 0..1184, transparent gap at 1184..1440 — REF's exact
  rendering.
- The mobile drawer, header, bottom tabs, and swipe handlers are
  untouched (REF's mobile RTL already matches: drawer left-anchored,
  hamburger mirrored).

### R34-E — the payrollreports tab contents (the superset)

Wire the 4 tabs to real aggregates (REF's are inert — the with-data
superset the frontier framed): controlled `tab` state renders a sibling
card per tab (the Tabs component keeps rendering only the list — the
at-rest Monthly DOM stays byte-identical):

- **Monthly** (default): the current summary card — unchanged.
- **Tax & Deductions**: per-employee breakdown (Employee | Gross |
  Deductions | Effective Rate | Net) + the totals, month-scoped.
- **History**: the processed periods table (Period | Records | Gross |
  Deductions | Net), descending.
- **Custom**: a from/to month + employee range form + Generate → the
  range-filtered table.

All cards reuse REF's card grammar (border-slate-200, the p-6 header
pattern, the thead bg-slate-50 uppercase recipe, the "No records" TD
empty states). Zero data renders the empty states.

## Verified non-gaps (documented, no action)

- The mobile chrome (drawer 288@x0 / header 73h / tabs 766y+78h) —
  byte-identical, the standing user-priority check.
- The wizard empty-submit (2 invalid fields, HTML5 blocking) — matches.
- The loans/asset dialogs' required matrices + noValidate=false — match.
- The with-data surfaces — still blocked on REF's zero-data account
  (the frontier's standing note); dark with-data likewise.
- REF's careers live job data — not a parity target (round-31 stance).

## Execution order (TDD)

1. RED pins: the session-35 block in `tests/unit/recipes.test.ts`
   (R34-A/B/C/D/E source contracts) + the R30-C2 evolution (the asset
   dialog's 2-col row + text-only button) + the shell-recipe pin for the
   peer/fixed split.
2. GREEN: dialog.tsx (R34-C) → assets dialog (R34-A) → loans dialog
   (R34-B) → app-shell (R34-D) → payrollreports tabs (R34-E).
3. E2E: evolve the RTL pin in dark-mode.spec (aside x=0 + the peer gap +
   main 1184) + a new payrollreports-tabs spec (the four tabs' round-trip
   at zero data) + the loans installment/asset dialog geometry pins.
4. Gates: lint → typecheck → unit → build → E2E.
5. Live dual-browser verification: the two dialogs' geometry inventories,
   the RTL desktop pair (REF's panel-left rendering), the standing
   audits (mobile chrome, light redeploy spot-check, navmap), and the
   payrollreports at-rest + tab round-trip.
6. Screenshots: the asset-dialog pair, the loans-dialog pair, the RTL
   desktop pair, the payrollreports tabs → `docs/screenshots/`.
7. Docs: AGENTS session-35 layer + counts, SKILL version + §47, PAD
   [S35], CLAUDE/README counts, `docs/session_67.md` +
   `docs/session_68.md`, worklog, this plan's completion record.

## Completion record (session 35)

All five gap groups delivered, plus three finds the live verification
itself uncovered (the census-then-verify loop working as designed):

- **R34-A**: the asset dialog rebuilt to byte-identical geometry — box
  512×**372** (was 444), every element y-for-y with REF (H2 462×18,
  name 462×36, Type+Serial 223+223 on one grid row, Assign 462×36,
  Cancel 81×36, Add **102×36 text-only**). The description line, the
  Plus icon, and the stacked fields are gone.
- **R34-B**: the loans installment renders REF's P (16px/600/blue-700)
  inside the matched slate-100 box; the Paid From placeholder removed;
  the dialog box now 672×**696** (REF 698 — every element ±1px).
- **R34-C**: the systemic DialogTitle `leading-none` (18px/18px/600 on
  every dialog) + **the dialog backdrop bg-black/80** (the verification
  screenshots caught the shadcn-default /50: REF's overlay measured
  rgba(0,0,0,0.8) — a 30-point never-audited gap, now pinned).
- **R34-D**: the desktop sidebar rebuilt to REF's fixed-panel + peer
  architecture — LTR visually unchanged (verified: aside x=0, main
  x=256, h1 x=288, navmap byte-identical); RTL now renders REF's exact
  layout (panel x=0 fixed, spacer x=1184, main 0..1184, h1 x=823,
  sidebar internals mirrored — svg x=207). **PLUS the surface
  correction**: REF's visible sidebar = the inner `bg-sidebar` div
  (#FAFAFA light pixel-verified / #18181b dark computed) — the round-32
  "authored bg-white" pin had measured the COVERED container; the aside
  now uses the token (same surface as the drawer, as REF renders).
- **R34-E**: the four tabs wired — the at-rest Monthly DOM unchanged
  (pinned); Tax & Deductions (per-employee breakdown + effective rate),
  History (the periods table), Custom (from/to + employee + Generate)
  all live on REF's card grammar with zero-data empty states.
- **The two NEW v4 engine lessons** (found during the live verification):
  (1) the v4 inline-label gap collapse was silently affecting BOTH
  dialogs (REF's v3 space-y-2 renders 12px label→control; the clone's
  4px — compensated with explicit mt-2 on every control, the
  session-34 recipe applied at dialog scale); (2) **the Radix
  native-select last-child trap** — Radix's hidden `<select>` renders
  after the trigger, so v4's `:not(:last-child)` puts the space-y mb on
  the TRIGGER (a phantom 8px inside every Select wrapper; REF's v3
  `* + *` selector never did) — Select-ending wrappers drop space-y and
  let the mt-2 carry the gap alone.

Gates: lint 0/0 · tsc ✓ · **521/521 unit (+14)** · build ✓ · **142/142
E2E (+7: the payrollreports-tabs spec's 5 + the dialog-interiors
spec's 2)**. Live-verified: both dialogs byte-identical element-by-
element; the overlay 51 vs 50 (1 unit); the RTL pair 2-4% boundary
noise with identical surfaces (sidebar #FAFAFA, gap canvas); the dark
sidebar #18181b both apps; the mobile chrome + navmap byte-identical;
the wizard empty-submit + loans/asset required matrices match. 11 new
screenshots (121 the RTL pair, 122/123 the dialog pairs, 124-126 the
payrollreports tabs, 127 the dark sidebar pair) → 156 PNG captures.
DB pristine.
