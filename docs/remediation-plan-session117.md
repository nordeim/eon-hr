# Remediation Plan — Session 117 / Parity Round 116

The same-line x-gap column round. The r117-queued hunt class — **the Typst
entry layout: title + location on one visual line where pdftotext breaks
them** (the r116 queue's "unmeasured" item) — became the hunt, and the hunt
measured it end-to-end before any code: **7 gap-driven column splits on the
resume** (title|company ×2, description|dates ×2, cert|year ×2,
degree|university) + 1 icon-bridged split (phone|email, a ~2em gap with an
empty-text icon glyph between — NOT gap-driven, deferred), with **TRUE
device-space gaps of 15.1–42.2 em** (measured against `pdftotext -bbox`
word xMax ground truth), where our extraction reads every one as the
standing " " join.

The 81st-deploy watch read **QUIET-NONVISUAL on the login side** (the JS
`BgVoVawV`→`l0vUUttr` moved, the CSS `CapATpwD` held — the render
BYTE-IDENTICAL to the standing `69aa4241…` baseline — the churn pattern's
eleventh repeat); the app side QUIET at the r42 baseline.

## The opening read (the 81st-deploy watch)

| Leg | Result |
| --- | --- |
| Login asset census | JS `index-l0vUUttr` (moved), CSS `index-CapATpwD` (held) — **the 81st deploy, login-side-only**; the render BYTE-IDENTICAL to the standing baseline (`scripts/r117-login-probe.mjs`, `docs/screenshots/r117-probe-login-ref.png`) |
| App-side assets | `index-C-IrDy5f` / `index-BGNH4KkS` — **QUIET, the r42 baseline holds** (`scripts/r117-app-census.mjs`) |
| Mobile-nav pair (390×844, the user's named focus) | **PARITY** — both sides 28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer (REF 16 items, Close `display:none`; clone 15, the a11y supersets); the menu cycle `/training`: REF STILL-OPEN (the 69th's regression through its TWELFTH deploy — the classification STANDS), clone AUTO-CLOSED (the pinned superset); `/employeedetail` REF 66 vs clone 248 nodes (the standing hold); **no Tailwind v4 regression — identical geometry** (`scripts/r117-nav-pair.mjs`) |

## THE HUNT (the r117-queued same-line x-gap column class — MEASURED)

**The class, measured on the Typst family through the instrumented module
copy** (`/tmp/r117-proto/cv-text.ts`, the r116 prototype pattern): our
output joins "Senior HR Manager TechCorp", "…compliance training. Mar 2021
- Present", "SHRM-SCP 2020", "B.A. Psychology University of California…"
where pdftotext reads each pair on separate lines — 7 same-baseline
boundaries, every one at a **q/cm BLOCK boundary** (the Typst form: every
positioned element its own `q / 1 0 0 -1 tx ty cm / BT / Tf / Tm / show /
ET / Q` block; the justified description lines are single TJ blocks whose
pieces share the line-origin stamp).

**THE MEASURED REFUTATIONS** (each one killed a candidate design before any
code was written — the r116 discipline):

1. **The naive gap threshold is DEAD**: the raw stamp start-deltas read
   49 em on arXiv pairs pdftotext JOINS ("comprehension. 2017" — the
   pdfTeX justified line's final word positioned as its own block at
   px=521.2 while the line's words share the line-origin stamp px=80.6).
   The R112-A stamps are BLOCK ORIGINS; for line-origin-stamped blocks the
   start-delta is MEANINGLESS.
2. **The chars×0.5em width estimate is DEAD**: its ±40% noise reads the
   Typst "new hires.|Jun 2018" split at 3.4 em (true 15.1) and reads
   Prawn prose joins at 40 em (true 0.47) — the estimate band overlaps
   itself across members.
3. **The column-alignment signature is DEAD**: arXiv (a 2-column paper)
   has EVERYTHING vertically aligned — 9/9 of the refutation "2017"
   pieces carry px-aligned mates.
4. **The bbox-derived "real gap" with nearest-word matching is DEAD**: the
   nearest-word-to-origin heuristic picks wrong occurrences of repeated
   words ("the" nearest the line origin is an early one) — 128 fake Prawn
   "joins at 40 em" whose true gap is a normal word space (4.7 pt).

**THE CALIBRATION** (the surviving design space, all measured):

- The **TRUE gaps** (B.px − A's last bbox word xMax): the Typst splits
  sit at **15.1 / 15.6 / 17.7 / 17.8 / 24.7 / 38.9 / 42.2 em**; the
  Prawn chart-tick joins at **11.78 em** (the highest measured true-gap
  join); the Prawn/pdfTeX prose joins at **< 1 em**. **The separation
  band is 11.78–15.1 em; the threshold sits at 13 em.**
- The right-block alnum guard kills the one measured ≥13 em join class
  (the IRS "(See instructions.)"→"." pair at 39.8 em — pdftotext joins
  the bare periods).
- Fonts without parseable width data stay **BLIND** (the conservative
  guard — Prawn's width declarations are not visible in the raw object
  scan; if unresolvable through ObjStms too, the Prawn members simply
  never fire).

## THE FIX (R117-A — the /W-width advance tracking + the block-boundary column rule)

**The width tables**: parse per font object, in BOTH the raw object scan
and the ObjStm pass (mirroring the objToTu infrastructure):
- CID fonts: the descendant's `/W` in all three measured forms — the spec
  `c w` pair form (dvipdfmx/fontspec/WeasyPrint), the spec `c [w1 w2 …]`
  array form (Skia, fpdf2), and **the Typst `c c w` triple form**
  (measured: 255 numbers, CID k → width w_k, validated against the bbox
  ground truth — the space 250, digits 465, letters 431–839) — plus `/DW`
  defaults.
- Simple fonts: `/Widths` + `/FirstChar`/`/LastChar` + the descriptor's
  `/MissingWidth` (arXiv's Type1 fonts, ReportLab, QUARTZ).
- Type0 parents resolve through `/DescendantFonts [N 0 R]`; the code
  length is 2 for Identity-H Type0 fonts, 1 for simple fonts.

**The advance cursor in the walk**: a per-stream `advPt` accumulator —
each show adds its piece's advance (Σ width(code)/1000 × ps over its
codes, the TJ kerns at kern/1000 × ps), reset when the stamp origin
changes (a new positioned block). Each piece carries `bx` — its block's
projected end x (origin + accumulated advance). Unresolvable fonts leave
`bx` undefined (the blind class).

**The assembly rule (R117-A)**: a " " separator between two stamped
pieces whose stamps sit on the SAME baseline (|Δpy| < 0.5·max(ps)) at a
BLOCK BOUNDARY (different stamp origins) with the left piece's `bx`
defined and **gapEm = (right.px − left.bx)/max(ps) ≥ 13** upgrades to
"\n". The R116-A discipline verbatim: never a join, never an existing
"\n", only " " separators, both pieces stamped.

## THE TDD ROUND (the plan)

- **RED at HEAD**: the hunt specs — a synthetic fixture in the Typst form
  (the q/cm/BT block per element, the /W triple-form widths, a title
  block + trailing-space block + company block 16 em away) reading
  "Title\nCompany" (was "Title Company"); the justified-line form (a TJ
  block + a dates block 15 em past its true end) reading
  "line text\nMar 2021".
- **Born-green guards**: the Prawn tick form (two single-word blocks
  11.78 em apart — keeps the space); the prose word-space form (a
  line-origin TJ block + a next-word block at a true 0.5 em gap — keeps
  the space); the blind-font form (no /W — keeps the space); the
  cross-line form (a 16 em x-gap at a 2 em y-delta — the R116-A newline
  stands, no double effect); the join guard (a condGap/kern join never
  upgrades).
- **THE MUTATION MATRIX**: M1 [the assembly rule removed] exactly the
  hunt count · M2 [the threshold zeroed] · M3 [the advance tracking
  removed] · M4 [the same-baseline guard removed] — each reverted in
  isolation, exact RED counts, green restored after.

## THE GROUND-TRUTH LEDGER (the plan)

The full corpus at the final source: the Typst family with the
**column-split probes** (the 7 pairs reading "\n") beside the standing
count/order/form probes; every other member diffed boundary-by-boundary
through the difflib-aligned classifier (the r116 `toward-away`
discipline) — every drifted boundary classified TOWARD (a split pdftotext
also reads) or defended; the byte-identical members (QUARTZ, Prawn)
verified unchanged; the alnum pins ALL hold.

## THE AUDIT LEGS

- The session-116 changes (R116-A) re-verified structurally at HEAD
  before any change (the assembly rule at the source, the corpus pins
  green at 1118/1118).
- The neo-crm HEAD at s207 (`6372207` adds the session_437 transcript
  only — no new layer; the s206/s207 transfers stand).
- The advisory state: the documented standing census (deepmerge-ts
  dev-chain high + minimatch moderate, zero runtime exposure).
- The patch watch: 16.4.3 remains the latest stable → **the ^16.4.2 HOLD
  stands**; **the November 3, 2026 security release is SCHEDULED** (seven
  medium vulnerabilities — the watch item for the next round).

## THE ToDo list (the plan as to execute)

- [x] The 81st-deploy watch: QUIET-NONVISUAL (login-side JS churn, the
      render byte-identical; the app side at the r42 baseline)
- [x] The mobile-nav pair on the standing build: PARITY (the user's named
      focus; the REF stay-open regression through its twelfth deploy)
- [x] The hunt measured: the 7 gap-driven Typst column splits with true
      gaps 15.1–42.2 em; the icon-bridged contacts split deferred (not
      gap-driven)
- [x] The four refutations measured (the naive threshold, the width
      estimate, the column-alignment signature, the nearest-word bbox
      heuristic — each documented above)
- [x] The corpus width-form survey (the three /W forms + /Widths, the
      ObjStm caveat)
- [x] The width-table parsing (raw + ObjStm passes, the three /W forms,
      /Widths/FirstChar/MissingWidth, the DescendantFonts resolution)
- [x] The advance cursor (the post-pass form: piece advances + TJ kerns, the
      full-(px,py) block grouping, the `bx` stamp — the in-round px-only grouping
      bug caught and cured)
- [x] The R117-A assembly rule (13 em, same-baseline, block-boundary, the trail
      license, the stamp-mate alnum guard, the join guard, the clean "\n" emission
      — the in-round rejected-upgrade fusion caught and cured)
- [x] RED 2/2 + 5 born-green guards → GREEN 1125/1125 → the mutation matrix
      M1 (2) + M2 (1) + M3 (2) + M4 (1) exact
- [x] The real-file ground truth (ALL 7 corpus pins HOLD with zero drift, the 16
      family members exact, the Typst resumes 22→28/29 newlines all toward with
      the 2 documented residuals: the icon pair + the 5.1 em sub-threshold pair)
- [x] The live UI verify (the r104 protocol): name-first, zero U+FFFD, aiScore 23;
      the sweep by the REAL id; the DB pristine through direct Prisma reads
- [x] Build (116/116) + the 12 screenshots (the CV tab with a real tab click ON
      /recruitment) + the E2E gate
- [x] The docs layer (this plan + the narrative docs/session_271.md + the AGENTS
      session-117 layer + the SKILL v4.4.0 §129 + the CLAUDE/README/AGENTS count
      lockstep 1125 + 559 = 1684 + the worklog round-116 entry)
- [x] Commit + push to main via the SSH wrapper

## The r118 queue (armed by this round)

- The icon-bridged contacts split (the Typst phone|email pair — an
  empty-text icon glyph between two tiny-gap blocks; NOT gap-driven)
- The ReportLab TOC dot-order divergence (the r116 carry-over — the
  dots-before-entry stream form; the phase-shift measurements stand)
- The sub-13em toward-splits (the ReportLab table rows at 8.7–9.4 em —
  below the conservative threshold, unchanged this round)
- The November 3 security release watch (the patch bump decision)
- The standing watches (the two-pass per-letter width table's REMAINING
  surface — intra-block per-word positions; the REF stay-open drawer; the
  neo-crm session-208+ layer; the LO Calc re-source; the advisory
  census)
