# Remediation Plan — Session 118 / Parity Round 117

The icon-anchored sub-threshold column round. The r118-queued hunt class —
**the Typst contacts split (the phone|email pair that pdftotext reads on
separate lines while our extraction joins them)** — became the hunt, and
the hunt MEASURED IT END-TO-END BEFORE ANY CODE, refuting the queue's own
hypothesis in the process: the split is **gap-driven, not icon-driven**
(the controlled-variant census: the no-icons variant still splits; the
icons-without-separator variant joins; text-glyph "icons" split identically
— the r118 queue's "an empty-text icon glyph between two tiny-gap blocks;
NOT gap-driven" hypothesis is DEAD by measurement).

The 82nd-deploy watch read **QUIET-NONVISUAL on the login side** (the JS
`l0vUUttr`→`OLDXOew4` moved, the CSS `CapATpwD` held — the render
BYTE-IDENTICAL to the standing `69aa4241…` baseline — the churn pattern's
twelfth repeat); the app side QUIET at the r42 baseline.

## The opening read (the 82nd-deploy watch)

| Leg | Result |
| --- | --- |
| Login asset census | JS `index-OLDXOew4` (moved), CSS `index-CapATpwD` (held) — **the 82nd deploy, login-side-only**; the render BYTE-IDENTICAL to the standing baseline (`scripts/r118-login-probe.mjs`) |
| App-side assets | `index-C-IrDy5f` / `index-BGNH4KkS` — **QUIET, the r42 baseline holds** (`scripts/r118-app-census.mjs`) |
| Mobile-nav pair (390×844, the user's named focus) | **PARITY** — both sides 28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer (REF 16 items, Close `display:none`; clone 15, the a11y supersets); the menu cycle `/training`: REF STILL-OPEN (the 69th's regression through its THIRTEENTH deploy — the classification STANDS), clone AUTO-CLOSED (the pinned superset); `/employeedetail` REF 66 vs clone 248 nodes (the standing hold); **no Tailwind v4 regression — identical geometry** (`scripts/r118-nav-pair.mjs`) |

## THE HUNT (the r118-queued icon-bridged contacts class — MEASURED)

**The class**: pdftotext reads the Typst contacts row as
`<U+F098> +1 (555) 010-9911` / blank / `<U+F0E0> john.smith@example.com`
(two lines); our extraction reads `…010-9911 <U+F0E0> john.smith…` (one
line). The icons decode to PUA codepoints in BOTH readers (U+F098/U+F0E0 —
the ToUnicode CMap verified byte-exact: `<0001> <F098>`, `<0002> <F0E0>`).

**The controlled-variant census** (the recompiled modern-cv specimen with
a patched separator/icon row, `scripts/r118-bridge-experiments.py` +
`scripts/r118-bc-experiments.py`):

| Variant | Change | pdftotext verdict |
| --- | --- | --- |
| base | icon + 5pt separator | **SPLIT** |
| v2 | no icons, 5pt separator | **SPLIT** — the icons are NOT required |
| v3 | icons, NO separator | **JOIN** — the icons are NOT sufficient |
| v4 | text glyphs (P/E), 5pt separator | **SPLIT** — the icon font/PUA is irrelevant |
| v5 | icons, 20pt separator | **SPLIT** |
| v6 | no icons, no separator | **JOIN** |
| w1–w5 | separator bisect 1/2/3/4/5pt | 1–4pt JOIN, 5pt SPLIT — the boundary sits at a word gap ≈ 0.94–1.06 em |
| a1–a4 | + bridge words above/below the gap | all SPLIT — the single-word vertical bridge is refuted |

**THE MEASURED REFUTATIONS** (each killed a candidate design before any
code was written):

1. **The queue's icon hypothesis is DEAD** (the v2/v3/v4 rows above).
2. **The single-word vertical bridge is DEAD** (a1–a4: bridge words
   above, below, and both — the split persists; the Prawn table rows'
   joins are NOT reproduced by mere column alignment either — the b2
   three-row aligned table still splits).
3. **The r117 "11.78 em Prawn chart-tick join" was a measurement
   artifact**: no joined numeric pair exists anywhere in the Prawn output
   (each tick label reads on its own line with a blank between); the
   r117 nearest-word real-gap heuristic manufactured the "join". The
   definitive separation-band census (`scripts/r118-separation-band2.ts`,
   poppler's own `-bbox-layout` block/line/word analysis, zero output
   matching) reads the corpus-wide word-gap structure: the Typst family
   joins ≤ 0.80 em and splits ≥ 1.06 em (the split pair IS the
   phone→icon boundary), but corpus-wide a pure gap threshold is DEAD
   (arXiv joins at 2.05 em, ReportLab at 1.66 em, Prawn at 1.61 em;
   sub-em splits ride font/baseline micro-signals in the math/code
   members).
4. **The ReportLab cover "trailless join" refutation re-verified as a
   cross-page artifact**: "User Guide" ends page 1; "Table of contents"
   opens page 2 — the 33.6 em "join" is a page-boundary adjacency, not a
   same-line join.

**THE CALIBRATION** (the icon-anchored walk-back census,
`scripts/r118-icon-census2.ts`): the population — same-baseline
block-boundary pairs whose RIGHT block is a zero-alnum content block (an
icon/symbol/punctuation anchor), walking back over intervening space-run
blocks to the content block A, gapEm = (B.px − A.bx)/max(ps) in
[0.3, 13) — contains **exactly the hunt targets plus one refutation**:

- Typst resume ×2 + coverletter ×2: the phone→icon pair at **1.06 em**
  (resume, coverletter — verdict SPLIT verified) and **2.43 em**
  (resume2, coverletter2 — verdict SPLIT verified directly)
- Skia CV: the em-dash block at **0.89 em** — verdict **JOIN** (the
  "Senior HR Manager — TechCorp Inc." line stays joined)
- **every other corpus member: ZERO candidates** (arXiv, dvipdfmx,
  fontspec, IRS, QUARTZ, ReportLab, Prawn, WeasyPrint, fpdf2 — the
  blast radius is empty)

**The separation band for the icon-anchored class: 0.89 em (join) to
1.06 em (split); the threshold sits at 0.95 em.**

## THE FIX (R118-A — the icon-anchored sub-threshold column split)

A same-baseline BLOCK-BOUNDARY pair (the R117-A geometry guards verbatim:
stamped pieces, different origins, |Δpy| < 0.5·max(ps)) whose RIGHT block
is a **zero-alnum content anchor** (text.trim() non-empty, zero
`[A-Za-z0-9]` — an icon/symbol/punctuation glyph, never a space run),
whose walk-back content block A (skipping consecutive space-run blocks)
carries a defined `bx`, and whose **gapEm = (B.px − A.bx)/max(A.ps, B.ps)
≥ 0.95**, upgrades the pair's separator to a CLEAN "\n" — the consumed
space runs emit nothing (the R117-A dropText form), the left block's
trailing writer-space strips only when present (the stripTrail form), and
the icon then joins the FOLLOWING content at its sub-threshold gap
(the measured 0.25 em icon→email boundary keeps its space — pdftotext's
exact `<icon> email` line form).

Guards, each refutation-driven: the 0.95 em threshold (the Skia em-dash
JOIN at 0.89 em); the zero-alnum anchor (an alnum-rich right block never
fires — the "Jun 2018" 5.1 em class and the ReportLab 8.7–9.4 em table
rows stay joined, unchanged this round); the R117-A discipline verbatim
(never a join, never an existing "\n", only " " separators, both pieces
stamped, `bx` defined — blind fonts stay blind); and the R116-A interplay
(a cross-line pair keeps its standing newline — no double effect).

**What R118-A deliberately does NOT do**: lower the R117-A 13 em
threshold (the corpus-wide census kills a global threshold — the sub-em
splits and >1.5 em joins overlap outside the icon-anchored class); cure
the sub-13 em alnum-rich toward-splits (the "Jun 2018" + ReportLab table
classes — the queue keeps them with this round's census data); or touch
the ReportLab TOC dot-order divergence (the ORDER class, still queued).

## THE SECOND MATERIAL (the neo-crm s208 transfer — the doc-claim totality census)

neo-crm shipped **session-208** (the layer beyond the s207 the last round
consumed): THE DOC-CLAIM TOTALITY CENSUS — the genus "code pins guard the
code, but nothing guards the DOC CLAIMS". Transferred to eon-hr this
round via `scripts/r118-doc-claim-census.py` (the s208 method: the live
doc sections walked — README/CLAUDE whole-file, AGENTS head, PAD §1–§7
head + §7.2–§12, the s206 scoping doctrine):

- **The path axis is CLEAN** (45 distinct backticked path claims checked;
  the 11 regex-flagged forms are all glob/URL/partial-path patterns —
  doctrine-covered, not phantoms).
- **The command axis is CLEAN** (every `bun run X` claim in README/CLAUDE
  resolves in package.json scripts).
- **The count axis is STALE — the s208 specimen class, live in eon-hr**:
  the docs claim **"54 route handlers"** (CLAUDE §Implementation +
  README's structure tree) while the tree carries **57** API route files
  (42 top-level + 15 nested); **"47 Prisma models"** (CLAUDE §Database)
  while `prisma/schema.prisma` declares **48**; **"49 endpoints"**
  (CLAUDE §Identity + PAD §3 + PAD §6) and **"46 routes"** (PAD §3's
  stack table) — fossils from the initial commit ("46 routes, 49 API
  handlers, 45 models") that rode 85+ sessions stale. The app-route claim
  ("61 application routes") is CORRECT.

**THE CURE (D-118a)**: the six live-section doc flips (CLAUDE ×3,
README ×1, PAD ×2 — 57 route handlers, 48 Prisma models, 57 endpoints,
"61 routes and 57 endpoints"); the session records and ADR decision-time
contexts keep their ship-time counts (the s206 doctrine).

**THE PIN (D-118b — the structural live-census, the D-208a1/D-208a2
forms adapted)**: two new `it`s in `tests/unit/doc-family.test.ts`:
- **it-4 THE STRUCTURAL LIVE-CENSUS**: the app-route count, the API
  route-file count, and the Prisma model count read LIVE from the tree
  (globs + schema walk) must equal the counts the LIVE doc sections claim
  (CLAUDE's handler/model/endpoint lines, README's structure-tree line,
  PAD's stack-table row) — either face drifting goes RED (a route added
  without a doc flip, or a doc flipped without the code).
- **it-5 THE COMMAND ARM**: every `bun run X` claim in README + CLAUDE
  resolves in package.json scripts (the D-208a2 command arm; born-green —
  the census verified the family clean, the pin keeps it clean).

## THE TDD ROUND (the plan)

- **RED at HEAD**: the R118-A hunt specs — the Typst contacts form (a
  phone block + two space-run blocks + an icon block at a 1.1 em
  walk-back gap + a following email block → reads
  "phone\n<icon> email", was "phone <icon> email"); the wider-gap form
  (the resume2 class at 2.4 em → the same split). The D-118b structural
  pin — RED on the stale claims (54/47/49 vs the live 57/48/57) before
  the doc cures.
- **Born-green guards**: the Skia em-dash form (0.89 em — keeps the
  space); the no-separator form (0.5 em — keeps the space); the
  blind-font form (no /W — keeps the space); the alnum-right form (a
  content block at 2 em — keeps the space, the "Jun 2018" class); the
  R116-A interplay (a cross-line icon pair — the standing newline, no
  double effect); the R117-A interplay (an icon at ≥ 13 em — the
  R118-A form, not a doubled newline).
- **THE MUTATION MATRIX**: M1 [the R118-A rule removed] exactly the hunt
  count · M2 [the threshold zeroed] the Skia guard RED · M3 [the
  zero-alnum anchor removed] the alnum-right guard RED · M4 [the
  walk-back removed] the hunt RED (the adjacent-space gap reads 0) —
  each reverted in isolation, exact RED counts, green restored after.
  The doc-pin mutations: the stale count re-planted → it-4 RED; the
  phantom command planted → it-5 RED.

## THE GROUND-TRUTH LEDGER (the plan)

The full corpus at the final source: the Typst family with the
**contacts-split probes** (the phone|email pair reading "\n" between the
phone line and the icon-led email line — resume ×2 + coverletter ×2)
beside the standing count/order/form probes; every other member diffed
boundary-by-boundary — **the expected drift surface is EXACTLY the 4
Typst contacts pairs** (the icon-anchored census found zero other
candidates in [0.3, 13) em); the byte-identical members (QUARTZ, Prawn)
verified unchanged; the alnum pins ALL hold; the family members (Skia ×5,
WeasyPrint ×6, fpdf2 ×5 — including the Skia em-dash member) exact.

## THE AUDIT LEGS

- The session-117 changes (R117-A) re-verified structurally at HEAD
  before any change (the assembly rule at the source, the corpus pins
  green at 1125/1125, all 16 family members exact).
- The neo-crm HEAD at **s208** (`399bda3`/`bb2c402` — the doc-claim
  totality census layer; the D-208a1/D-208a2 transfer is this round's
  second material).
- The advisory state: the documented standing census (deepmerge-ts
  dev-chain high + minimatch moderate, zero runtime exposure) — unchanged.
- The patch watch: 16.4.3 remains the latest stable (16.5.0-canary.36 is
  a canary) → **the ^16.4.2 HOLD stands**; **the November 3, 2026
  security release is SCHEDULED (tomorrow at the round's write)** — the
  next round's watch item leads with the bump decision.

## THE ToDo list (the plan as to execute)

- [x] The 82nd-deploy watch: QUIET-NONVISUAL (login-side JS churn, the
      render byte-identical; the app side at the r42 baseline)
- [x] The mobile-nav pair on the standing build: PARITY (the user's named
      focus; the REF stay-open regression through its thirteenth deploy)
- [x] The hunt measured end-to-end: the controlled-variant census (the
      icon hypothesis refuted, the gap-driven truth established), the
      boundary bisect (0.94–1.06 em), the bridge refutations (a1–a4, b2)
- [x] The definitive separation-band census (poppler's own -bbox-layout
      analysis; the r117 "11.78 em join" artifact exposed)
- [x] The icon-anchored blast-radius census (the hunt targets + one Skia
      refutation; every other member zero)
- [x] The R118-A assembly rule (the icon-anchored walk-back split at
      0.95 em, the R117-A guards verbatim, the clean "\n" emission)
- [x] RED 3/3 (the split-asserting trio) + 5 born-green guards → GREEN
      1133/1133 → the mutation matrix exact: M1 3 · M2 2 · M3 1 · M4 3
- [x] The D-118b structural live-census pin (RED on the stale counts) +
      the D-118a doc cures (CLAUDE ×3, README ×1, PAD ×2) → GREEN 1135/1135
      with the doc-pin mutations exact: DM1 1 · DM2 1
- [x] The real-file ground truth (ALL 7 corpus pins BYTE-IDENTICAL with
      zero drift; the 4 Typst contacts splits toward — +1 clean newline each;
      the 16 family members exact incl. the Skia em-dash join preserved)
- [x] The live UI verify (the r104 protocol): name-first (namePos 0,
      dates 569), zero U+FFFD, aiScore 23, contactsSplit TRUE in the stored
      cvText; the sweep by the REAL ids; the DB pristine (1 user / 1 employee
      / 0 candidates / 3 jobs / 2 balances / 0 expenses)
- [x] Build ✓ + the 12 screenshots (all verified non-blank) + the E2E gate
      (the standing 559 net; the fix rides the unit layer per the r100/r102
      documented split)
- [x] The docs layer (this plan + the narrative docs/session_274.md + the
      AGENTS session-118 layer + the SKILL v4.5.0 §130 + the
      CLAUDE/README/AGENTS count lockstep 1135 + 559 = 1694 + the worklog
      round-117 entry with the r119 queue armed)
- [x] Commit + push to main via the SSH wrapper (remote-verified, keys
      shredded)

## The r119 queue (armed by this round)

- The sub-13 em alnum-rich toward-splits (the description|"Jun 2018"
  5.1 em pair + the ReportLab 8.7–9.4 em table rows — this round's
  census data arms the design: poppler splits ALL same-baseline word
  gaps ≥ ~1 em; a vertical-alignment or a same-line-context license is
  the candidate material)
- The ReportLab TOC dot-order divergence (the r116 carry-over — the
  dots-before-entry stream form; the ORDER class)
- The November 3 security release watch (the patch bump decision — the
  release is scheduled for tomorrow)
- The standing watches (the two-pass per-letter width table's REMAINING
  surface — intra-block per-word positions; the REF stay-open drawer;
  the neo-crm session-209+ layer; the LO Calc re-source; the advisory
  census)
