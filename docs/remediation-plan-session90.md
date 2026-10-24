# Remediation Plan — Session 90 / Parity Round 89: the RTL select-mirroring + mobile bottom-sheet round

**The round's frontier.** The r89 close-out's named queue: the two RTL-specific
members (the assetmanagement select-chevron position, the allleaverequests
header icon spacing) + the standing adoption of the experiment-assignment
probe + the re-armed deploy watch. The opening read ran the full standing
ladder on the detected 60th login deploy (login JS `index-BWZiPLrS →
index-CrrEG27W`, CSS → `index-BlYK4iZ6`, app-side QUIET): the fresh login
pair **BYTE-IDENTICAL** (the 60th classified NON-VISUAL) + standing 5/5 +
sweep 12/12 + verify-r49 13/13 + verify-r45 13/13 + the Turnstile census 0
widgets. The experiment-assignment probe adopted as the standing capture
step (this round's reads: `control` / `tagline` / `tagline` across three
visitors — the per-visitor variant system reconfirmed).

## The triage of the two flagged members

**The assetmanagement select-chevron position (4 cells): CONFIRMED — a
clone-authored defect (R90-A) + a second, larger finding behind it (R90-B).**

The RTL-band re-capture (fresh pairs, 390×844, `app_lang=ar`, the
experiment probe + the `dir|lang` validity check) read STRUCTURAL 6 hot/5
bad/max245 on the filter rows (cluster 168,600-390,696). The DOM probes:

- **R90-A the SelectTrigger `dir="ltr"` stamping.** The trigger geometry is
  IDENTICAL cross-side (x=-185 w=176, the same class strings, the same
  `justify-between` recipe) — but the chevron INSIDE differs: the REF's at
  the trigger's LEFT edge (x=-172, the RTL-mirrored `justify-between` form)
  vs the LOC's at the RIGHT (x=-38, the LTR form). The root cause:
  **Radix's `SelectPrimitive.Trigger` stamps `dir={context.dir}` on the
  button, and `context.dir` comes from `useDirection` whose fallback is
  `"ltr"`** (`localDir || globalDir || Direction.LTR` — the clone passes no
  `dir` and mounts no DirectionProvider). The REF's trigger carries NO dir
  attribute (live-verified: `dirAttr: null`, computed direction follows the
  html → `rtl`) — so the REF's select is not the stock Radix trigger form.
  The stamped `dir="ltr"` pins the trigger's interior to LTR on every select
  in the app while the page is RTL — the chevron never mirrors. (The
  CONTENT-side is at parity: the REF's desktop popper listbox ALSO carries
  `dir="ltr"` — no fix needed there.)
- **R90-B the mobile select BOTTOM-SHEET (the bigger finding behind the
  chevron).** While probing the trigger family, the select's OPEN state was
  cross-compared for the first time at mobile: **the REF swaps the desktop
  popper for a bottom-sheet dialog below 768px** (live-verified: 736 and 640
  → the sheet; 768 → the popper). The recipe (extracted verbatim from the
  live DOM):
  - overlay `fixed inset-0 z-50 bg-black/80` (rgba(0,0,0,0.8))
  - sheet `fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col
    rounded-t-[10px] border bg-background` (bg white, radius 10px top)
  - drag handle `mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted`
  - header `grid gap-1.5 p-4 text-center sm:text-left` >
    `h2.text-lg font-semibold leading-none tracking-tight` — the generic
    text **"Select an option"**
  - list `p-4 pb-8 space-y-2 max-h-[60vh] overflow-y-auto`
  - option buttons `w-full flex items-center justify-between p-4 rounded-lg
    border transition-colors min-h-[44px]` — selected `bg-blue-50
    border-blue-200 text-blue-900` + `Check h-4 w-4 text-blue-600` at the
    end; unselected `bg-white border-slate-200 hover:bg-slate-50`
  - the mobile TRIGGER is a **plain button** (no role, no aria-expanded, no
    data-state, no dir — live-verified on the REF)
  The LOC renders the desktop Radix popper (162px, dir="ltr" stamped) at
  mobile — a functional + visual mobile divergence on EVERY select in the
  app. The at-rest band captures never saw it (the selects were never
  opened cross-side).
- **R90-C the assetmanagement option sets (found while reading the open
  state).** The REF's live option inventories:
  - STATUS (5): `All Statuses, Available, Assigned, Returned, Pending
    Return` — the LOC offers `Repair, Retired` where the REF offers
    `Returned, Pending Return`.
  - TYPE (12): `All Types, 💻 laptop, 🖥️ desktop, 📱 phone, 📟 tablet,
    🖥️ monitor, ⌨️ keyboard, 🖱️ mouse, 🎧 headset, 🪑 furniture, 🚗
    vehicle, 📦 other` — the LOC offers 7 plain labels (no emoji; missing
    desktop/tablet/keyboard/mouse/headset).
  The at-rest surface is unaffected (the stat cards Total Assets/Assigned/
  Available/In Repair and the table headers match cross-side — verified).

**The allleaverequests header icon spacing (3 cells): CLASSIFIED — the AA/
subpixel floor, NOT a clone defect (member CLOSED).** The re-capture with
the long settle (8s — the capture-settle rule) still reads 4 hot cells at
the pill, but the subpixel probe decomposes it: the pill geometry is
IDENTICAL to 0.01px (x=185.98 w=188.02 both sides; gap 8px; padding 8px
16px; radius 9999px), the icon identical (16px box, rgb(37,99,235), the
same lucide plane markup) and the text identical (14px/500, rgb(51,65,85))
— the deltas are the REF's own 0.66px icon undersizing (the REF's svg
measures 15.34px wide vs the clone's clean 16.00px w-4) and the 0.65px text
width difference, producing glyph-edge pixels at delta up to 158. The
clone's 16.00px is the correct `w-4` render; the REF's 15.34 is its own
subpixel artifact. No clone fix (chasing it would replicate a REF rendering
artifact). The member joins the documented systematic bidi AA floor.

## The plan (TDD)

1. **RED**: `tests/e2e/session90-rtlmobile.spec.ts` — the contract pins:
   - R90-A1: at RTL, a select trigger carries NO `dir` attribute and its
     computed direction follows the html (`rtl`) — the chevron mirrors.
   - R90-B1: at 390px, clicking a select trigger opens the bottom sheet
     (the overlay + the `fixed inset-x-0 bottom-0` sheet + the drag
     handle + the "Select an option" h2) — no `role=listbox` popper.
   - R90-B2: the sheet's options render the button form (w-full, min-h-44,
     rounded-lg) with the selected carrying bg-blue-50 + the Check.
   - R90-B3: selecting an option updates the trigger text and closes the
     sheet (the full interaction cycle).
   - R90-B4: at desktop (1280), the select still opens the standard popper
     (the regression guard for the 494-spec suite).
   - R90-C1: the assetmanagement type select offers the REF's 12 (emoji
     labels).
   - R90-C2: the assetmanagement status select offers the REF's 5
     (Returned + Pending Return).
2. **GREEN — the three fixes**:
   - R90-A: `ui/select.tsx` — the trigger passes `dir={undefined}` after
     the props spread (React drops the attribute; the computed direction
     then follows the html).
   - R90-B: `ui/select.tsx` — the `Select` wrapper renders the mobile
     bottom-sheet below 768px (a guarded `matchMedia` hook, the trigger
     swapping to a plain button with the identical classes, the portal
     sheet with the REF's verbatim recipe, the option list collected from
     the `SelectItem` children, the controlled/uncontrolled value flows
     preserved). Desktop path untouched.
   - R90-C: `assetmanagement/page.tsx` — `STATUS_OPTIONS` →
     `[all, available, assigned, returned, pending_return]`,
     `TYPE_OPTIONS` → the REF's 11 + all with the emoji label map.
3. **The unit pins** (`recipes.test.ts`): the sheet recipe class strings +
   the option-set pins + the trigger dir contract (the count-lockstep
   rule applied to any pin the fixes touch).
4. **Full gates**: lint 0/0 · tsc ✓ · unit (944 + the new) · build ✓ ·
   E2E 494 + the new (the desktop-path guard R90-B4 proving no
   regression).
5. **The post-fix re-verify**: the fresh RTL mobile re-capture of the two
   flagged routes (the chevron now mirroring; the cluster retired) + the
   mobile-menu cycle on the remediated build (the standing user emphasis)
   + the desktop select-interaction spot-check.
6. **The evidence chain + the docs layer** (the session_208 narrative, the
   SKILL §102, the AGENTS/CLAUDE/README count lockstep, the worklog).

## The validation sequence

Validate the fix sites in source before writing the spec (done —
`ui/select.tsx` lines 12-43 the trigger, 61-99 the content, 107-131 the
item; `assetmanagement/page.tsx` lines 66/315-328 the option sets), then
RED → GREEN → full gates → the live re-verify on the seeded standalone
(:3200) against the REF (the same instrument pattern as this round's
probes).

## The risk register

- The mobile sheet changes the select's interactive DOM below 768 — the
  494-spec E2E suite runs at Desktop Chrome (1280×720), the popper path
  untouched (R90-B4 the explicit guard).
- jsdom (unit layer) lacks `matchMedia` — the hook guards it and defaults
  to the desktop path (no hydration mismatch: SSR renders desktop, the
  client effect flips after mount).
- The uncontrolled selects (`defaultValue`, e.g. requestreports' monthly)
  — the wrapper's internal value shadow keeps the trigger text correct
  after a sheet selection.
- The schema's status field is a free string — the new filter values
  (`returned`, `pending_return`) need no migration; the seeded assets'
  statuses (available/assigned/repair) remain valid (the "In Repair"
  stat card unchanged, matching the REF's own card).

---

# Execution appendix — the round executed (with one revision)

## The revision to R90-A (the desktop probe)

The initial R90-A fix stripped the `dir` attribute at ALL widths. The
post-fix live verification then read the REF's DESKTOP RTL trigger for the
first time (1440, `app_lang=ar`): **the REF's desktop trigger CARRIES
Radix's `dir="ltr"` stamp** (`dirAttr: "ltr"`, computed ltr, the chevron at
the trigger's right — rightGap 13) while its MOBILE trigger (the plain
button) carries NO dir (computed rtl, the chevron mirrored to the start
side). The REF's responsive select therefore swaps the WHOLE trigger form:
the stock Radix trigger at ≥768 and the plain button below. THE FIX WAS
REVISED: the desktop branch keeps the stock Radix stamping (no strip); the
mirrored form comes from the mobile plain-button branch (which never had a
dir). The R90-A1 pin was rewritten to the two-viewport contract.

## The GREEN-phase engineering notes (the three implementation lessons)

1. **The native-select trap.** The first mobile implementation kept the
   Radix `Root` and swapped only the trigger for a plain button — but a
   Root without its Trigger reads `isFormControl = true` (the `trigger ?
   … : true` fallback) and mounts the hidden native `<select>`, whose
   option texts polluted the page's textContent (caught by the R88-D
   legacy pin — the analyticsdashboard bar finder's 120-char budget). THE
   FIX: no Radix at all below 768 — the SelectValue becomes a plain span,
   the SelectContent drops out of the tree.
2. **The nested SelectValue.** The SelectValue lives INSIDE SelectTrigger,
   not as a direct child of Select — a top-level-only `Children.map`
   replacement left it rendering without a Root and crashed the page
   (`SelectValue must be used within Select`). THE FIX: the replacement
   recurses into the trigger's children.
3. **The authored-interior pattern.** Some pages pass CHILDREN to
   SelectValue (the companywall Users-glyph trigger — the R88-G3
   contract): the replacement keeps the authored children (dropping only
   the Radix wrapper) and renders the selected label ONLY for the bare
   placeholder pattern.

## The gates at close

lint 0/0 · tsc ✓ · **950/950 unit** (944 + 6 R90 pins) · build ✓ 116/116 ·
**E2E 501/501** (the 494 standing + the 7 session90 pins, 8.8m, zero
flakes) · DB pristine · `.env.example` re-verified (the two-variable
contract unchanged).

## The live post-fix verification

- **The cross-side sheet comparison** (both sides at 390, the sheet open):
  IDENTICAL recipes — the overlay rgba(0,0,0,.8)/oklab(0 0 0/.8) (the v4
  serialization), the sheet y=262 h=582 radius 10px, the 100px muted
  handle, the "Select an option" h2, the `p-4 pb-8 space-y-2
  max-h-[60vh]` list, **12 options both sides** (the R90-C fix), the
  selected option bg rgb(239,246,255) min-h 44px + the blue Check.
- **The RTL mobile re-capture**: assetmanagement **STRUCTURAL 6 hot/max245
  → MINOR 2 hot/max11** (the chevron now mirrors; the residual is the AA
  floor). allleaverequests unchanged (4 hot/max158 = the documented pill
  glyph-edge class — the REF's own 0.66px icon undersizing; the member
  CLOSED as the AA floor, the pill geometry identical to 0.01px
  cross-side).
- **The mobile-menu cycle GREEN** on the remediated build (drawer opens →
  Training LMS → /training → the auto-close superset; no TW-v4 regression
  under the three fixes).
- **The evidence chain 1453-1467** (10 PNGs: the dev dashboard, the
  post-fix mobile filter row, the sheet open on both sides, the RTL
  post-fix pairs, the companywall mobile, the desktop popper guard) →
  **1615 tracked PNGs**.
