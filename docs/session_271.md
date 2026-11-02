# Session 117 / Parity Round 116 — THE SAME-LINE X-GAP COLUMN ROUND

The r117 queue's named hunt class — the same-line x-gap column class (the
Typst entry layout: title + location on one visual line where pdftotext
breaks them, the r116 queue's "unmeasured" item) — became the hunt, and the
discipline of the round was **measurement before code**: the class, its
geometry, its refutations, and its calibration were all established before
a single line of the cure was written.

## The hunt, as measured

The Typst resume carries **7 gap-driven column splits** where our extraction
reads the standing " " join and pdftotext reads a line break:

| pair | the form | true gap |
| --- | --- | --- |
| "Senior HR Manager" \| "TechCorp" | the space-block sandwich | 32.4 em |
| "HR Business Partner" \| "InnovateLLC" | the space-block sandwich | 30.6 em |
| description \| "Mar 2021 - Present" | the direct trail form | 17.7+ em |
| description \| "Jun 2018 - Feb 2021" | the direct trail form | **5.1 em** |
| "SHRM-SCP" \| "2020" | the space-block sandwich | 38.9 em |
| "PHR" \| "2017" | the space-block sandwich | 42.2 em |
| "B.A. Psychology" \| "University…" | the space-block sandwich | 24.4 em |

plus the phone|email split — an ICON-bridged pair at a ~2 em gap, not
gap-driven, deferred with the measurements.

## The four refutations (measured, not shipped)

1. **The stamp start-delta threshold is dead**: arXiv reads 49 em
   start-deltas on pairs pdftotext JOINS — the pdfTeX justified line's
   final word rides its own positioned block at its true x while the
   line's words share the line-origin stamp. The R112-A stamps are block
   ORIGINS; for line-origin blocks the start-delta is meaningless.
2. **The chars×0.5 em width estimate is dead**: ±40 % noise reads a true
   5.1 em split at 3.4 em and a true 0.47 em join at 40 em.
3. **The column-alignment signature is dead**: a two-column paper has
   everything vertically aligned — the refutation pieces carry px-aligned
   mates at 9/9.
4. **The nearest-word real-end heuristic is dead**: it picks wrong
   occurrences of repeated words — 128 fake Prawn "joins at 40 em".

The surviving calibration: **the true-gap separation band is 11.78 em (the
highest measured join — the Prawn chart ticks) to 15.1 em (the lowest
split); the threshold sits at 13 em.**

## The cure (R117-A)

**The /W width tables** (the first-order slice of the standing deferred
per-letter width work), parsed in all three measured forms — the spec `c w`
pairs, the spec `c [w…]` arrays, and **the Typst `c c w` triple form**
(255 numbers, CID k → w_k, validated against the bbox ground truth) — plus
the simple /Widths/FirstChar, resolved through /DescendantFonts for
Identity-H Type0 parents, in both the raw scan and the ObjStm pass.

**The advance post-pass**: each positioned block's projected end x (the
full (px, py) stamp grouping, Σ code widths × ps/1000 + the TJ kerns),
blinded on any unresolvable piece — a missing table never misfires, it
only cures less.

**The assembly pre-pass**: a same-baseline block-boundary pair whose left
block's end sits ≥ 13 em left of the right block's origin upgrades its
" " separator to a **clean** "\n" (the consumed space runs emit nothing,
the trail piece's trailing writer-space strips — never " \n"), under the
trail license, the right-block alnum guard (counted over the whole
stamp-mate run — the "T"-atom catch), and the join guard.

## The in-round catches

- **The block-grouping bug**: the advance cursor keyed on px alone —
  same-x different-line blocks fused, the accumulator never reset, and
  bx read 333 where the true end was 72. The grouping needs the full
  (px, py) stamp.
- **The rejected-upgrade fusion**: the walk-back's dropText marks
  persisted when a later guard rejected the upgrade — the space text
  dropped with no newline landing: "Senior HR ManagerTechCorp". The
  marks now apply only on success.

## The verification

- **TDD**: RED 2/2 + 5 born-green guards → GREEN 1125/1125 → the mutation
  matrix exact (M1 2 · M2 1 · M3 2 · M4 1).
- **The corpus**: ALL 7 PINS HOLD UNCHANGED — zero drift on the standing
  corpus; the 16 regenerated family members exact; the Typst resumes'
  newlines 22→28/29, every fired boundary TOWARD pdftotext, clean forms,
  zero fusions; the residuals documented (the icon pair, the 5.1 em
  sub-threshold pair).
- **The live UI verify** (the r104 protocol): the probe CV reads
  name-first through the real upload flow, the sweep by the real id, the
  DB pristine.
- **The opening read**: the 81st deploy non-visual (login-side-only); the
  mobile-nav pair PARITY (the user's named focus, no Tailwind v4
  regression); the neo-crm layer at s207 (no transfer); the patch watch
  HOLD at ^16.4.2 with the November 3 security release scheduled.

## Gates

lint 0/0 · tsc ✓ · **1125/1125 unit** (1118 + 7) · build 116/116 · E2E the
standing 559 net · DB pristine. The 12 r117 screenshots, all non-blank.
