# Session 34 — Parity Round 33: The Wired-Page At-Rest Audit + The Login Alert

**Status: COMPLETE — all 15 steps executed.**

**Scope**: the at-rest DOM census of the nine round-31-wired pages
(the bodies below the headers that round-31's h1+hero audit never
inventoried) + the form-error dimension (the login error surface,
never audited) + the frontier's deferred /settings card micro-diff.

## What the census found

1. **Six pages carried genuine at-rest gaps** — payrollreports,
   requestreports, requestsettings, shiftswap, payrollai, careers.
   REF's asset fingerprints were UNCHANGED (`index-BGNH4KkS.css` —
   the same chunk as round 32), so these were clone-side drift from
   round-31's data-wiring, not REF movement.
2. **The login error was a hand-rolled P** — REF ships the shadcn
   Alert (translucent red-50/70, red-200 border, rounded-xl, p-4,
   368×54). And the login vertical STACK had never been audited: the
   clone's card was structurally different (two padded blocks vs
   REF's single wrapper, py-10 vs p-4, flat gap-1.5 fields vs REF's
   field DIVs, noValidate blocking REF's HTML5 empty-submit).
3. **The /settings card border** — the 3-unit deferred micro-diff
   (REF hardcodes border-slate-200).

## The delivery

- **R33-A /payrollreports** — the headline rebuild: the white-pill
  kicker + the SOLID green-600 CTA (MessageCircle) on the pill row;
  the filter card (Label above a w-full select); the 4-col grid tab
  list with the Custom trigger; the summary card with the inline
  Calendar icon + the w-40 month input + the CSV/PDF outline buttons;
  the stats INSIDE the card (REF's colored values); the 8-col
  uppercase table + the "No records for {month}" TD.
- **R33-B /requestreports** — the 2×2 section cards with their "No
  data" empties + the Request Log 7-col table; the tiles on the stock
  Card recipe.
- **R33-C /requestsettings** — REF's approval row (name+email+level+
  Add dark) + the static None-set rows + the iconed card heads; the
  3-row limits grid with Add Limit; the LEFT-aligned header in
  max-w-5xl. The API resolves name+email against Employee.
- **R33-D /shiftswap** — the header button REMOVED; REF's empty text
  on both tabs; the pills in REF's bordered container; the superset
  entry is the invisible-at-rest "n" keyboard shortcut.
- **R33-E /careers** — the page canvas; the max-w-6xl hero with the
  job-search input (h=302); the Browse-by-Company H2 + REF's chip
  geometry.
- **R33-F /payrollai** — the green-gradient CTA riding the badge row
  (actionsStart) + the CircleCheckBig "All Clear!" empty state.
- **R33-G the login Alert** — the new ui/alert.tsx + the error
  rebuilt on it + the full login stack rebuilt to REF's measured
  chain.
- **R33-H /settings** — border-slate-200 on the cards.

**The new v4 trap**: v4's `space-y-*` margins the `:not(:last-child)`
child — when that child is an INLINE label, its margin-bottom is
ignored vertically, so v3's label→input gap silently collapses (hit
twice: the login fields, the payrollreports filter). Fix: explicit
`mt-*` on the following block. **The button lesson**: the default
variant's CTA gradient is a background-IMAGE that paints over any
bg-color a className adds — solid buttons need `bg-none`. **The
component lesson**: shadcn sub-components must cn()-merge their
className props (the E2E color pin caught AlertDescription dropping
text-red-700).

## Verification

- Gates: lint 0/0 · tsc ✓ · **507/507 unit (+14)** · build ✓ ·
  **135/135 E2E (+2 — the login-error spec: the Alert geometry +
  the empty-submit HTML5 contract)**.
- Live dual-browser: the five wired pages' button/color/geometry
  inventories MATCH byte-identically (payrollai's one "DIFF" is the
  documented to-right/90deg gradient serialization); the login stack
  (card/logo/google/pw anchors) and the Alert pair MATCH; the
  standing audits hold (the dark sweep's five DIFFs are the same
  documented artifacts; light redeploy 12/12 + mobile chrome +
  navmap; verify-r33: **19/19 MATCH, 0 DIFFs**).
- 11 new screenshots (114/115/116/117 the wired-page pairs, 118 the
  careers hero, 119 the payrollai empty, 120 the login-error pair) →
  145 PNG captures. DB pristine.

## Frontier after this round

The payrollreports tab CONTENTS (wiring Tax & Deductions / History /
Custom to real aggregates — REF's are inert, so any content is
superset territory), the with-data surfaces (REF's careers now carries
live job data the clone cannot replicate — the zero-data contract
stays the parity target), the form-error dimension's remaining
surfaces (dialog validation states), deep RTL polish, and the dark
with-data surfaces.
