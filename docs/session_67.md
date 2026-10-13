# Session 67 — Parity Round 34: The Dialog Interiors + The Deep-RTL Find

**Status: COMPLETE — all 15 steps executed.**

**Scope**: the dialog-interior dimension (the loans + assets dialogs —
the only two REF-exposed — measured geometrically for the first time),
the deep-RTL polish (the frontier item), the payrollreports tab
contents (the superset), and the standing mobile-nav check.

## What the census found

1. **The asset dialog carried four genuine gaps** (built in round 30
   against the field SET — the interior was never inventoried): an
   invented description line, a stacked Type/Serial pair REF renders
   as a 2-col row, a Plus icon on the text-only Add button, and the
   dialog-title line-height.
2. **The loans dialog carried two gaps**: a plain-neutral installment
   value (REF: a semibold blue-700 P) and an invented Paid From
   placeholder.
3. **The systemic DialogTitle**: REF's dialog H2s measure 18px/18px/600
   on both dialogs — the clone's shared component rendered 28px tall.
4. **The deep-RTL find (the headline)**: REF's desktop sidebar does NOT
   mirror in عربي mode — a fixed painting panel (left:0/right:1184,
   never flips) over a transparent peer spacer that mirrors with dir.
   The round-32 "RTL mirror matches" verification had measured the
   PEER — the aside-selector artifact's desktop twin.
5. **The payrollreports tabs are still inert on REF** (re-verified) →
   wiring them is the with-data superset.
6. Verified non-gaps: the mobile chrome byte-identical (the standing
   user-priority check), the wizard empty-submit, the required-attribute
   matrices, REF still zero-data (the with-data frontier stays blocked).

## The delivery

- **R34-A /assets dialog**: rebuilt to byte-identical geometry — box
  512×372 with every element y-for-y (H2-only header, the Type+Serial
  `grid grid-cols-2 gap-4` row, the text-only 102×36 Add button).
- **R34-B /loans dialog**: the installment P (`text-base font-semibold
  text-blue-700`), the bare Paid From, every control + mt-2 (below).
- **R34-C the systemic recipes**: DialogTitle `leading-none` + the
  backdrop `bg-black/80` (the verification screenshots caught the
  shadcn /50: REF's overlay = rgba(0,0,0,0.8)).
- **R34-D the RTL shell**: the peer spacer + the fixed panel — LTR
  visually unchanged (verified), RTL = REF's exact layout (panel x=0,
  spacer 1184, main 0..1184, h1 x=823, internals mirrored). Plus the
  surface correction: the aside = the `bg-sidebar` token (#FAFAFA
  light / #18181b dark — the round-32 "authored bg-white" pin had
  measured the covered container).
- **R34-E the payrollreports tabs**: controlled state + three sibling
  cards (Tax & Deductions / History / Custom) on REF's card grammar;
  the at-rest Monthly DOM byte-identical.
- **Two new v4 engine traps**: the inline-label gap collapse at dialog
  scale (REF's v3 space-y-2 = 12px gaps; the clone's 4px — mt-2 on
  every control) + **the Radix native-select last-child trap** (the
  hidden select makes the trigger :not(:last-child) → v4 puts the
  space-y mb on the TRIGGER, a phantom 8px — Select wrappers drop
  space-y).

## Verification

- Gates: lint 0/0 · tsc ✓ · **521/521 unit (+14)** · build ✓ ·
  **142/142 E2E (+7: the payrollreports-tabs spec ×5 + the
  dialog-interiors spec ×2)**; the dark-mode RTL pin evolved to the
  fixed-panel contract.
- Live dual-browser: both dialogs element-identical (the asset box
  512×372 y-for-y; the loans ±1px); the overlay 1 unit; the RTL pair
  surfaces identical (2-4% text-boundary noise); the dark sidebar
  #18181b both apps; the mobile chrome (drawer 288@x0 / header 73h /
  tabs 766y+78h) + the navmap byte-identical.
- 11 new screenshots (121 the RTL pair, 122/123 the dialog pairs,
  124-126 the payrollreports tabs, 127 the dark-sidebar pair) → 156
  PNG captures. DB pristine.

## Frontier after this round

The remaining dialog interiors beyond the two REF-exposed ones (the
clone's other 30+ dialogs have no REF counterpart at zero data), the
with-data surfaces (blocked on REF's account), deep RTL with data, and
the print/dashboard dark-mode corners. The dialog-recipe lessons
(leading-none, 80% backdrop, mt-2, the native-select trap) now apply
app-wide and are pinned.
