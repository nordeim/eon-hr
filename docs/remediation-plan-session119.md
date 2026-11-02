# Remediation Plan — Session 119 / Parity Round 118

The sub-13 em alnum-rich threshold round. The r119-queued hunt class — **the
toward-splits our extractor joins while pdftotext splits** — became the hunt,
and the hunt MEASURED IT END-TO-END BEFORE ANY CODE: the fresh word-level
separation census (poppler's own `-bbox-layout` line membership, the r118
method) reads **joins ≤ 2.05 em and splits at every gap ≥ 2.06 em across the
whole 14-member corpus** (arXiv max-join 2.05, ReportLab 1.66, Prawn 1.61,
Skia 5.44+ all splits, Typst 4.99 split) — the r118 "corpus-wide a pure gap
threshold is DEAD" verdict was about the [1, 2) em overlap band; ABOVE it the
gap alone is decisive. The piece-level guarded population in [2.5, 13) em is
EXACTLY the hunt target (the Typst description|"Jun 2018" pair at 4.80 em,
SPLIT verdict) — zero joins, zero other candidates.

The second measured find: **the width-tracking blind zone**. The `/W` +
`/Widths` parse covers only 3 of 11 members (Typst 99.4%, fpdf2/Skia 100%,
**the other eight at 0.0%**) — the R117-A/R118-A column machinery has been
blind on arXiv/dvipdfmx/fontspec/IRS/QUARTZ/ReportLab/Prawn/WeasyPrint since
session 117. The ReportLab family is blind because it uses the **standard-14
convention** (Helvetica/Times/Courier/Symbol/ZapfDingbats, no `/Widths` — the
viewer-supplies-metrics contract). The queue's named second target — the
ReportLab 8.7–9.4 em table rows (the form-field reference tables, pages
60–64: `fieldFlags | Blank separated field flags (see below) | 'required'`
read cell-per-line by pdftotext, joined by us) — needs BOTH the standard-14
width tables AND the trail-license retirement.

The 83rd-deploy watch read **QUIET** (the login assets at the 82nd state —
JS `index-OLDXOew4`, CSS `index-CapATpwD` — the render BYTE-IDENTICAL to the
standing `69aa4241…` baseline; the app side QUIET at the r42 baseline).

## The opening read (the 83rd-deploy watch)

| Leg | Result |
| --- | --- |
| Login asset census | JS `index-OLDXOew4` / CSS `index-CapATpwD` — UNCHANGED (the 82nd state stands); the render BYTE-IDENTICAL (`scripts/r118-login-probe.mjs`) |
| App-side assets | `index-C-IrDy5f` / `index-BGNH4KkS` — **QUIET, the r42 baseline holds** (`scripts/r118-app-census.mjs`) |
| Mobile-nav pair (390×844, the user's named focus) | **PARITY** — both sides 28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer (REF 16 items, Close `display:none`; clone 15, the a11y supersets); the menu cycle `/training`: REF STILL-OPEN (the 69th's regression through its FOURTEENTH deploy — the classification STANDS), clone AUTO-CLOSED (the pinned superset); `/employeedetail` REF 66 vs clone 248 nodes (the standing hold); **no Tailwind v4 regression — identical geometry** (`scripts/r118-nav-pair.mjs`) |
| Patch watch | **16.4.3 remains the latest stable** (16.5.0-canary.36 is a canary) — the November 3, 2026 security release has NOT landed at the round's write (Nov 2) → **the `^16.4.2` HOLD stands**; the bump decision moves to the r120 queue (the release is scheduled for tomorrow) |
| Advisory census | UNCHANGED — deepmerge-ts dev-chain high (prisma → @prisma/config) + minimatch moderate (eslint chain), both dev-toolchain transitive, zero runtime exposure (`bun audit`) |

## THE HUNT (the r119-queued toward-split class — MEASURED)

**The class**: pdftotext splits the Typst resume's experience-entry row
`Owned the performance review cycle and the onboarding program for 200 new
hires.` | `Jun 2018 - Feb 2021` (the description's last line and the date
range share a baseline, the true word gap 51.2 pt = **4.99 em**); our
extraction reads them JOINED. The R117-A rule measures the piece-level gap
at **4.80 em** (the `/W`-tracked end 433.87 vs the origin 481.85, ps 10) —
below the 13 em threshold → no fire. resume2's copy of the same pair reads
22.14 em (its `/W` tracking under-measures — the standing intra-block
per-word watch) and fires R117-A — the outcome correct, the measurement
inflated.

**The separation census** (`scripts/r119-census1.ts` — the word-level
verdicts from poppler's own block/line/word XML, zero output matching):

| Member | pairs in [1,13) em | splits | joins | max JOIN | min SPLIT |
| --- | --- | --- | --- | --- | --- |
| Typst resume/resume2 | 2 | 2 | 0 | 0.80 em | 1.06 em |
| arXiv | 723 | 697 | 26 | **2.05 em** | 1.02 em |
| ReportLab | 760 | 601 | 159 | 1.66 em | 1.09 em |
| Prawn | 289 | 277 | 12 | 1.61 em | 1.20 em |
| Skia CV | 6 | 6 | 0 | — | 5.44 em |
| WeasyPrint | 0 | 0 | 0 | — | — |

**Every join above 1 em lives in [1, 2.05] em; every pair ≥ 2.06 em
splits.** The vertical-alignment license the queue hypothesized is NOT
needed above the overlap band — the gap alone is decisive once past it.

**The piece-level blast-radius census** (`scripts/r119-census3.ts` +
`r119-census4.ts` — the R117-A guards verbatim minus the threshold, minus
the trail license, the verdicts by line membership): the guarded population
in [1, 13) em across the 14 members is **EXACTLY ONE PAIR** — the Typst
`hires. | Jun` at 4.80 em, verdict **SPLIT**. The trail-licensed and
trailless populations coincide (zero trailless pairs on the tracked
members). **The threshold can drop to 2.5 em with a measured-empty blast
radius on the tracked members.**

**The width-blind census** (`scripts/r119-debug10.ts`): `bx` coverage —
Typst 99.4% · fpdf2 100% · Skia 100% · **arXiv/dvipdfmx/fontspec/IRS/
QUARTZ/ReportLab/Prawn/WeasyPrint 0.0%**. The blind taxonomy (three
mechanically distinct layers, each its own future round):

1. **The standard-14 convention** (ReportLab — the round's cure, R119-B):
   24 font objects name core fonts (Helvetica ×2 incl. one MacRoman, the
   Times/Courier families, Symbol, ZapfDingbats) with NO `/Widths`.
2. **The indirect `/Widths` form** (`/Widths 514 0 R` — Prawn's embedded
   DejaVu/Iosevka fonts ×19, arXiv ×36): the parse reads inline arrays
   only. NOT cured this round (the queue keeps it).
3. **The ObjStm-carried `/W` parse failure** (dvipdfmx/fontspec/IRS read
   `objWidths` 0 despite inline `/W`) + **the WeasyPrint pageMap gap**
   (widths parse, no page binding — the candidate chain resolves the fonts
   but `widthFor` requires the page map). NOT cured this round.

**The standard-14 un-blinding measured on the prototype** (`/tmp/r119-proto`
— the seeding from the reportlab 4.4.9 reference AFM data, run-length
encoded, WinAnsi + MacRoman for the 12 text fonts + the built-in Symbol/
ZapfDingbats tables): ReportLab's `bx` coverage 0.03% → **94.6%**; the
fieldFlags table rows read `fieldFlags` / `Blank separated field flags
(see below)` / `'required'` — **exactly pdftotext's cell-per-line form**.

## THE FIX

### R119-A — the threshold drop + the trail-license retirement

The R117-A same-line x-gap column move's threshold drops **13 em → 2.5 em**
(above the 2.05 em max observed word-level join + margin; below the 4.80 em
hunt target; the [1, 2.5) em overlap band stays untouched — the conservative
bar), and **the trail license is RETIRED for the ≥ 2.5 em class**: the
license's load-bearing refutation (the ReportLab cover's 33.6-em "trailless
join") was exposed by the r118 census as a cross-page adjacency — a
same-line trailless join at that gap does not exist in the corpus. The
walk-back still consumes intervening space runs for the clean emission (the
R117-A dropText form). The remaining guards verbatim: the same-baseline
check (the R116-A interplay), the block boundary, the alnum right ≥ 2 (the
IRS bare-period class), and the condGap/condKern join guards.

### R119-B — the standard-14 width tables

A simple font whose `/BaseFont` names a core font (the standard-14) but
carries no parseable `/Widths` seeds its width table from the embedded AFM
metrics (run-length triples `firstCode,width,count;…`), resolved by the
DECLARED encoding: WinAnsiEncoding → the WinAnsi byte map,
MacRomanEncoding → the MacRoman map, Symbol/ZapfDingbats → their built-in
maps (an undeclared text font stays blind — the conservative guard). The
seeding is strictly additive: fonts with real `/Widths` or `/W` keep their
parsed tables (`objWidths.has` short-circuits); subset-prefixed BaseFonts
strip to non-core names and stay blind. The widths are Adobe's core-font
AFM values (the reportlab 4.4.9 reference data — Helvetica space 278 / A
667 / l 222, Times-Roman space 250, Courier 600 — byte-verified against
the source tables at generation).

### The interplay

The R118-A icon-anchored rule (zero-alnum anchors at ≥ 0.95 em) is
unchanged — an icon pair at ≥ 2.5 em fires both pre-passes to the same
"\n" (no double effect). The R117-A ≥ 13 em column class keeps firing
(the Typst 15.1–42.2 em splits — their trails now optional). The
[1, 2.5) em band keeps the R115/R118 behavior verbatim.

### THE FULL-CORPUS DRIFT LEDGER (the candidate, measured before the plan)

| Member | md5 (pin → candidate) | verdict |
| --- | --- | --- |
| arXiv / dvipdfmx / fontspec / IRS / QUARTZ / WeasyPrint / fpdf2 / Skia / Typst resume2 / coverletter / coverletter2 | IDENTICAL | zero drift — the blind members stay blind (their fonts are embedded or ObjStm-carried; the seeding adds nothing) |
| Typst resume | `5a26804b` → `7e3033d7` | **TOWARD 2 / away 0** — the hunt target cured (the `hires. | Jun` split) |
| ReportLab | `31d88eec` → `e5752ab1` | **TOWARD** — the difflib ratio 0.8265 → 0.8281 (+15.5 bp); 7 toward hunks, 0 away (the 707-line table-row split family, alnums preserved 213160/213160) |
| Prawn | `404277d9` → `fe969d8d` | **TOWARD** — the ratio 0.7224 → 0.7230 (+6.0 bp); the chart ticks read tick-per-line and the figure labels split (verified against the ref's rendered region: `Nonzero Winding Number` / blank / `Even-Odd` — pdftotext's exact form; the one difflib "away" hunk was a probe-window artifact, the code block matched instead of the rendered output) |

## THE SECOND MATERIAL (the neo-crm s209 transfer — the push-ritual remote contract)

neo-crm shipped **session-209** (the layer beyond the s208 the last round
consumed): THE PUSH-RITUAL REMOTE CONTRACT — the genus "the operational
push pair rides the SIBLING REPO's remote". **The genus is LIVE in eon-hr**
(the s209 specimen class, measured):

- `docs/ssh_git_wrapper_v3.py`: the docstring's canonical-remote claim, the
  Options default, and `DEFAULT_REMOTE` itself all read
  `git@github.com:nordeim/task-management.git` — **the sibling repo**, not
  eon-hr's canonical `git@github.com:nordeim/eon-hr.git`.
- `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`: the purpose line, the
  `cd task-management`, the expected-output block ×2, the variants ×2, the
  troubleshooting push-rights + ls-remote lines, and the
  AGENTS-corroboration claim ("AGENTS.md: clone remote is
  `https://github.com/nordeim/task-management.git`" — **factually wrong
  twice**: eon-hr's AGENTS.md carries no clone-remote claim at all, and the
  canonical remote is eon-hr).
- The runbook's PRIMARY sequence (step 5) invokes the wrapper with NO
  `--remote` — riding the stale default. Every round pushed safely only
  because the operator's briefs and the session logs carry the explicit
  remote (the AGENTS session-50 lesson documents the trap but the stale
  default was never cured — the correct-and-lucky genus).

**THE CURE (D-119b1)**: the remote-contract flips — the wrapper ×3
(docstring, Options, `DEFAULT_REMOTE`) + the runbook ×9 (purpose, cd,
expected-output ×2, variants ×2, push-rights, ls-remote, the
AGENTS-corroboration line rewritten to the repo's actual contract). The
field-tested narration (names no repo) and the AGENTS session-50 record (a
session record, the s206 doctrine) keep their ship-time form; the wrapper's
key-delimiter constants byte-verified intact at the flip (the
display-redaction artifact the runbook itself documents).

**THE PIN (D-119b2)**: two new `it`s in `tests/unit/doc-family.test.ts`:
- **it-6 THE WRAPPER ARM**: `DEFAULT_REMOTE` read LIVE from the wrapper
  source equals `git@github.com:nordeim/eon-hr.git`; the docstring
  parenthetical + the Options default carry the same URL; the
  `task-management` form banned in the live wrapper.
- **it-7 THE RUNBOOK ARM**: the canonical SSH remote at the claim sites
  (purpose · cd · expected-output · variants · push-rights · ls-remote);
  the stale `task-management` / `cd task-management` forms banned.

## THE TDD ROUND (the plan)

- **RED at HEAD**: the R119-A hunt specs — the Typst sub-threshold trail
  form (a description block + trailing space + a date block at 4.8 em →
  reads "…hires.\nJun 2018 - Feb 2021", was joined); the ReportLab
  table-row form (TRAILLESS standard-14 cells at ~8.6 em → reads
  "fieldFlags\nBlank separated field flags (see below)\n'required'", was
  one joined line).
- **Born-green guards**: the [1, 2.5) em band stays joined (a 2.0 em pair —
  the arXiv max-join class); the blind-font guard (an unknown BaseFont
  without widths stays joined — the conservative guard verbatim); the
  bare-period right block (alnum < 2 — the IRS class); the R118-A icon
  interplay (a zero-alnum anchor at ≥ 2.5 em keeps the iconSplit path);
  the R116-A cross-line interplay (a different-baseline pair never fires);
  the real-font precedence guard (a standard-14 name WITH /Widths keeps
  the parsed table — the seeding never overrides).
- **THE MUTATION MATRIX**: M1 [the threshold restored to 13] the Typst
  hunt spec RED · M2 [the threshold zeroed] the sub-2.5 band guard RED ·
  M3 [the trail license restored] the table-row spec RED · M4 [the alnum
  guard removed] the bare-period guard RED · M5 [the seeding removed] the
  table-row spec RED (the font goes blind) — each reverted in isolation,
  exact RED counts, green restored after. The doc-pin mutations: the stale
  remote re-planted → it-6/it-7 RED; the phantom canonical-remote claim
  planted → it-7 RED.

## THE GROUND-TRUTH LEDGER (the plan)

The full corpus at the final source: the 7 standing pins re-verified
(ReportLab + Prawn RE-PINNED at the cured md5s — the toward drift is the
cure); the Typst family with the contacts-split probes + the new
description-split probe; the family members (Skia ×5, WeasyPrint ×6,
fpdf2 ×5) exact; the byte-identical members (arXiv, dvipdfmx, fontspec,
IRS, QUARTZ) verified unchanged; the alnum pins ALL hold (213160
preserved on ReportLab, 83657 on Prawn).

## THE AUDIT LEGS

- The session-118 changes (R118-A + D-118b) re-verified structurally at
  HEAD before any change (the anchor rule at the source, the corpus pins
  green at 1135/1135, all 16 family members exact).
- The neo-crm HEAD at **s209** (`7bd4f3d` — the push-ritual remote
  contract layer; the D-209a1/D-209a2 transfer is this round's second
  material).
- The advisory state unchanged; the patch watch — the November 3 release
  not yet landed, the `^16.4.2` HOLD stands (the r120 queue leads with the
  bump decision).

## THE ToDo list (the plan as to execute)

- [x] The 83rd-deploy watch: QUIET (the 82nd login state, the render
      byte-identical; the app side at the r42 baseline)
- [x] The mobile-nav pair on the standing build: PARITY (the user's named
      focus; the REF stay-open regression through its fourteenth deploy)
- [x] The hunt measured end-to-end: the word-level separation census (the
      [1, 2.05] em join ceiling), the piece-level blast-radius census
      (exactly the hunt target in [2.5, 13) em), the width-blind taxonomy
      (the three layers), the standard-14 un-blinding prototype (94.6%)
- [x] The candidate's full-corpus drift ledger: everything IDENTICAL or
      TOWARD (the Typst pair, the ReportLab table rows +15.5 bp, the Prawn
      ticks/labels +6.0 bp — the one "away" a probe-window artifact,
      re-verified against the ref's rendered region)
- [x] RED 2/2 (the Typst sub-threshold trail form + the ReportLab
      table-row form) + 6 born-green guards → GREEN 1145/1145 (incl. the two
      doctrine-updating rewrites of the dead-premise session-117 guards) →
      the mutation matrix exact: M1 2 · M2 2 · M3 1 · M4 1 · M5 1
- [x] The D-119b1 remote-contract flips (wrapper ×3 + runbook ×9) + the
      D-119b2 pin (it-6 the wrapper arm + it-7 the runbook arm) → GREEN 7/7
      with the doc-pin mutations exact: DM1 1 · DM2 1
- [x] The real-file ground truth (the 7 pins hold with ReportLab + Prawn
      re-pinned at the cured md5s; the Typst family descSplit CURED; the 16
      family members ALL EXACT at 100.00%)
- [x] The live UI verify (the r104 protocol): the r119 Typst probe CV
      reads name-first, zero U+FFFD, aiScore 22, descSplit TRUE in the STORED
      cvText; the sweep by the REAL id; the DB pristine (1/1/0/3/2/0)
- [x] Build ✓ (116/116) + the 8 screenshots (6 desktop + the mobile-nav
      pair, all non-blank) + the E2E gate (the standing 559 net; the fix
      rides the unit layer per the r100/r102 documented split)
- [x] The docs layer (this plan + the narrative docs/session_278.md + the
      AGENTS session-119 layer + the SKILL v4.6.0 §131 + the
      CLAUDE/README/AGENTS count lockstep 1145 + 559 = 1704 + the worklog
      round-118 entry with the r120 queue armed)
- [x] Commit + push to main via the SSH wrapper (the CURED wrapper — the
      default now the repo's own remote; remote-verified, keys shredded)
      [the round's final step]

## The r120 queue (armed by this round)

- The November 3 security release watch (the patch bump decision — the
  release lands tomorrow; the `^16.4.2` HOLD decision)
- The width-blind taxonomy's remaining layers: the indirect `/Widths`
  form (Prawn ×19 + arXiv ×36), the ObjStm-carried `/W` parse failure
  (dvipdfmx/fontspec/IRS), the WeasyPrint pageMap fallback (the candidate
  chain feeding `widthFor`)
- The ReportLab TOC dot-order divergence (the r116 carry-over — the
  dots-before-entry stream form; the ORDER class, mechanically distinct
  from the separation classes)
- The two-pass per-letter width table's REMAINING surface (intra-block
  per-word positions — the resume2 under-tracking, measured this round:
  the same text tracks bx 433.87 in resume vs 260.42 in resume2)
- The standing watches (the REF stay-open drawer; the neo-crm session-210+
  layer; the LO Calc re-source; the advisory census)
