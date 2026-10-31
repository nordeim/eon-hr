# Remediation Plan — Session 110 / Parity Round 109

The 15th-writer round. The r109 queue's named watch (the
uncompressed-content-stream class — "no corpus member exercises the
no-/Filter leg") became the hunt for a live specimen, and the hunt
**sourced a file that exposed a total extraction failure with FOUR more
defects stacked beneath it**: the Prawn manual (Producer "Prawn", 2,099,393
bytes, PDF 1.4, 129 pages, md5 `699ebcab…`) reads **ZERO characters**
through the r109 extractor. The corpus grows to NINE members (**15 writer
families** — Ruby's Prawn, the canonical Ruby PDF writer). The 74th-deploy
watch read a login-side JS+CSS churn (both assets moved this time — the
fifth distinct pair) with the render **BYTE-IDENTICAL** to the standing
baseline → NON-VISUAL; the app side QUIET at the r42 baseline.

## The opening read (the 74th-deploy watch)

| Leg | Result |
| --- | --- |
| Login asset census | JS `index-XEFf4q1x` → **`index-DnufpLgl`** (moved), CSS `index-Bwz2pKfc` → **`index-s8d1FO8M`** (moved) → **THE 74th DEPLOY, login-side only, both assets this time** |
| Login render | The fresh capture at the VERIFIED 1440×900 viewport **BYTE-IDENTICAL** to the standing `69aa4241…` baseline → NON-VISUAL (the churn pattern's fifth repeat — `scripts/r110-login-probe.mjs`, `docs/screenshots/r110-probe-login-ref.png`) |
| App-side assets | `index-C-IrDy5f` / `index-BGNH4KkS` — **QUIET, the r42 baseline holds** (`scripts/r110-app-census.mjs`) |
| Mobile-nav pair (390×844, the user's named focus) | The pair read on the remediated build — see the evidence chain |
| The drawer watch | The REF-side stay-open regression classification STANDS (the 69th's flip through its fifth deploy); the clone keeps the AUTO-CLOSED superset (pinned by `mobile-navigation.spec.ts`) |
| Baseline gates | lint 0/0 · tsc ✓ · 1067/1067 unit (the r109 net) |

## THE HUNT (the r109 queue's watch → the specimen)

- **The uncompressed-content-stream watch**: the r109-A fix's filter-aware
  decode left the no-declaration leg documented ("No declaration → the
  standing best-effort inflate-only behavior (the uncompressed-content
  watch stays documented, unexercised by the corpus)") — a writer that
  emits plain text operators in a raw stream is the OLDEST PDF form (PDF
  1.0/1.1, hand-rolled PDFs, "uncompressed" exports). The synthetic probe
  (`scripts/r110-uncompressed-probe.ts`) **confirmed the defect at HEAD**:
  a content stream with NO `/Filter` key reads ZERO characters.
- **The hunt** (`scripts/r110-uncompressed-hunt.sh`): the pdf.js test-suite
  corpus sparse-cloned and censused (322 files — all reduced test cases,
  max 2,130 alnums — not corpus material); the hunt then targeted writers
  whose DEFAULT is uncompressed: FPDF (PHP) and Prawn (Ruby). The Prawn
  manual (`https://prawnpdf.org/manual.pdf`) is the match — 2.1MB, **182
  of 189 streams raw**, 19 raw ToUnicode CMaps + 130 raw content streams,
  pdftotext reads 83,632 alnums / 972 CJK chars / polytonic Greek.

## THE FINDINGS

### R110-A — the uncompressed-content-stream leg (the total-extraction failure)

`our extraction: 0 chars / 0 alnums` vs `pdftotext: 116,798 chars / 83,632
alnums`. 182 of the file's 189 streams declare **NO `/Filter` at all** —
the content AND the ToUnicode CMaps both — and the r109 filter-aware decode
sent every one to the best-effort inflate, which failed, and
`if (!text) continue` silently dropped them ALL.

**THE FIX (the last-resort raw reading)**: a stream whose dict declares no
`/Filter` key, and on which BOTH inflate attempts (zlib + raw-deflate)
fail, is read as raw latin1 — its bytes ARE the content. The LAST-RESORT
form is load-bearing: the r95-era fixtures pin the OPPOSITE undeclared
case — a dict-stub stream (no `/Filter`) carrying DEFLATED bytes — so the
raw reading may only fire after both inflates fail on an undeclared stream
(the first draft's raw-first form broke 36 standing specs — the r95
best-effort-inflate contract). A dict that declares `/Filter` with ANY
spelling or abbreviation (`/Fl`, `/AHx`, an empty array) never takes the
raw reading. The downstream gates (text-op shape + printable-dominant, the
R102-A legs 2+3) still vet every raw stream before the operator walk.

### R110-B — the dotted /F-name bindings (the mixed-font misdecode)

The Prawn resources carry **DOTTED font names** — `/F3.0`, `/F4.1`, even
`/F21.1` (two dots) — and the standing `F\w+` pair regex never bound them
(`F\w+` stops at the dot; `/F3.0 12 0 R` matches NEITHER `F3`-then-space
nor anything else). Every atom under a dotted name rode the all-cmaps
first-covering walk — and the manual's fallback-font demo pages interleave
up to six fonts per line (Iosevka code + Jigmo CJK + DejaVu Greek), so the
wrong cmap covered and **the Jigmo CJK segments read as their latin1 code
characters** ("12345", "!"#$…" — pdftotext reads 更可怕的是、同质化竞争对手…,
972 CJK chars).

**THE FIX**: the `F\w+` name class extends to `F\w+(?:\.\w+)*` at all FIVE
F-pair sites (the raw candidate scan, the page-tree region scan, the three
ObjStm sites), and the R108-B /Font-dict-region collector's region class
and inner pair name take the dot (`[\w#+\-./\s]` + the dotted-F
alternative). The content-side `Tf` capture already handled dotted names
(the token form at line ~580).

### R110-C — the WinAnsi named-encoding marker (the glyph-table class)

The manual documents the WinAnsi table itself: the glyph column is drawn
under `/F1.0` = Helvetica `/Encoding /WinAnsiEncoding` with NO ToUnicode —
and the hex atom `<a1>` fell to the all-cmaps first-covering walk where
the Iosevka cmap's `0xa1→° U+00B0` won. **pdftotext reads ¡** (the WinAnsi
reading). This is the R108-B "a font that NAMES its encoding is its own
ToUnicode" doctrine's **third member** (after the r105-B standard-14
markers and the r108 MacRoman table).

**THE FIX**: the `WIN_ANSI_CMAP` — every byte 0x00–0xFF maps through
`latin1Printable` EXACTLY (the cp1252 high zone + identity + the control
scrub) — a byte no cmap covers already reads `latin1Printable`, so the
marker is a NO-OP for uncovered atoms and only SHADOWS the wrong-cmap
coverings. The census (`objWinAnsi`) runs at both font-object scan sites
(raw + ObjStm), the marker pushes at both resolution sites (the
`cmapsFor` candidate chain + the `localFor` page path). A real ToUnicode
still wins (the MacRoman marker's exact discipline).

### R110-D — the NBSP census (the chart-tick fusion)

The code font's "space" is **NBSP** (U+00A0, code 0xCA in the Iosevka
subset — the manual's code examples use NBSP runs for indentation), and
the R103-C space-glyph census `/^\s+$/` counted NBSP runs as word-gap
glyphs → every Prawn stream read `hasSpaceGlyphs=true` → the join fired on
**14-em absolute CHART AXIS TICK repositionings** — "100.0200.0300.0"
where pdftotext reads "100.0 200.0 300.0".

**THE FIX**: the census is SPACE-only (`/^ +$/`) — a word-separation space
GLYPH is U+0020; NBSP is a non-breaking space, a typographic unit, never a
word separator. **Measured across the corpus before the change**: every
standing member's space-glyph convention rides U+0020 (arXiv 113/113, IRS
129/129, QUARTZ 469/469, ReportLab 315/315; LO Calc 123,382 U+0020 vs 25
NBSP — its census never rode the NBSPs); Prawn is 530/530 NBSP, ZERO
U+0020 — a no-space-glyph writer whose gaps ride the moves. A magnitude
threshold was REFUTED by measurement first: the standing members'
legitimate split-word joins reach 41–74 em (LO Calc joins 2,701 gaps above
16 em), so the join class keeps its census verbatim — only the census's
WHITESPACE CLASS tightens.

### R110-E — the array-triple re-parse (the Greek-Extended garbage)

`parseToUnicode`'s base-offset bfrange pass ran **globally** over the
block — and an ARRAY-form bfrange's element run (`<20><35>[<0020><20ac>
<1f55>…]`) re-matched as a base-offset range (`<0020><20ac><1f55>` →
lo=0x20, hi=0x20AC, dst=0x1F55), OVERWRITING the array's own correct
entries: the polytonic Greek demo read **"ὗ὘Ὑ὚"** where pdftotext reads
**"ὕαλον ϕαγεῖν δύναμαι· τοῦτο οὔ με βλάπτει."** (the manual's
international-text demo — Greek Extended U+1F00-block).

**THE FIX**: the base-offset pass runs on the ARRAY-FREE block text
(`m[1].replace(/\[[^\]]*\]/g, " ")`) — stripping the bracket-delimited
element lists makes the re-match impossible; both handlers stay verbatim
otherwise.

## THE TDD ROUND

- **RED 6/6** at HEAD with the exact designed signatures — the EMPTY
  extraction ×2 (R110-A content + CMap), **"Z"** (R110-B: the wrong
  font's map first-covers the dotted name's atom), **"°"** (R110-C: the
  wrong cmap beats the WinAnsi reading), **"100.0200.0"** (R110-D: the
  NBSP census joins the ticks), **"ὗ὘Ὑ"** (R110-E: the re-parsed triple
  overwrites the array) — with leg isolation: the B/C/D/E fixtures ride
  Flate streams so each RED signature is its OWN defect, not R110-A's
  emptiness (the B fixture also orders the wrong cmap FIRST in file
  order, the real file's shape — a wrong-order first draft read GREEN at
  HEAD and was rebuilt).
- **GREEN 1073/1073** = 1067 standing + 6 net new
  (`tests/unit/cv-text.test.ts`).
- **The blast radius measured by prototype BEFORE the plan** (the r108
  doctrine): every one of the five legs individually and in combination —
  all SEVEN standing members BYTE-IDENTICAL at every step; the first
  draft of R110-A (the raw-first form) broke 36 standing specs (the r95
  undeclared-deflated contract) and was restructured to the last-resort
  form before the plan was executed.
- **MUTATIONS** (each revert re-verified): M1 [the raw fallback removed]
  exactly 2 RED · M2-FULL [ALL dotted-binding sites reverted — the 5
  F-sites AND the 2 collector sites] exactly 1 · M3-FULL [BOTH WIN_ANSI
  pushes removed] exactly 1 · M4 [the census reverted to /^\s+$/] exactly
  1 · M5 [the array-strip removed] exactly 1 — 5b green; the restored
  file re-verified 1073/1073 after each. (The M2/M3 single-site mutations
  read 0 RED first — the B spec is covered by EITHER binding path and the
  C spec by EITHER push; the full reverts prove the legs.)

## THE REAL-FILE GROUND TRUTH

All SEVEN standing members **BYTE-IDENTICAL** through the final source
(arXiv 67,744 · dvipdfmx 61,437 · fontspec 106,179 · IRS 5,798 · LO Calc
695,014 · QUARTZ 2,697 · ReportLab 213,160). The PRAWN member:
**83,657 alnums = 100.03% of pdftotext's 83,632** — and the member
checks, every glyph class EXACT: CJK **972 = 972**, Greek Extended **12 =
12**, base Greek **58 = 58**, bullets **54 = 54**, π **2 = 2**, the
high-code glyphs read (• ° ƒ ò nbsp), ZERO U+FFFD, the Euro € under the
WinAnsi marker, the glyph-table column reads ¡ ¤ £ ¦ (the cp1252
readings), and the Greek sentence reads **"ὕαλον ϕαγεῖν δύναμαι· τοῦτο
οὔ με βλάπτει"**. The +25 alnum residual and the remaining word-level
deltas are the DOCUMENTED reading-order/separator classes: chart
axis-tick ORDER (pdftotext's geometric sort vs content order — the same
divergence at alnum 4008 as the A-only run), rotated-text handling (we
read 13 whole "Rotated" samples where pdftotext reads 5 whole + 8
fragments — a superset), and code-identifier spacing ("bounds.top" vs
"bounds. top"). The corpus grows to NINE members, 15 writer families, the
9th pinned md5 `699ebcab…` / 83,657 + the Greek/CJK/glyph-table member
checks.

## THE LIVE UI VERIFY (the r104 protocol)

A Prawn-shaped CV (uncompressed streams, dotted names, an array-form
CMap, the WinAnsi glyph table shape) through the recruitment AI-CV-Upload
tab on the remediated standalone build → the stored `cvText` carries the
Greek sentence and the CJK run with zero U+FFFD; the probes swept, the DB
pristine (verified directly through Prisma).

## Gates

- lint 0/0 · tsc ✓ (the r110 probe scripts ride the variable-path import
  per the R108-A lesson — the literal `.ts`-extension import broke tsc
  and was fixed in-round) · **1073/1073 unit** (1067 + 6 net new) ·
  build ✓ (env -u DATABASE_URL; NODE_OPTIONS=--max-old-space-size=3072) ·
  E2E the standing 559 net (the CV-flow fix rides the unit layer per the
  r100/r102 documented split) · DB pristine (1 user / 0 candidates)

## The evidence chain

The r110 PNGs under `docs/screenshots/`: the byte-identical login probe,
the REF + clone mobile-nav pair on the remediated build, the desktop set,
the Prawn-CV tab capture.

## The ToDo list (the plan as executed)

- [x] The 74th-deploy watch: login probe (both assets moved, render
      byte-identical → NON-VISUAL) + app-side census (QUIET)
- [x] The uncompressed-stream defect confirmed at HEAD by synthetic probe
- [x] The hunt: pdf.js corpus censused (reduced cases only), FPDF/Prawn
      writers targeted, the Prawn manual sourced (md5 `699ebcab…`)
- [x] The HEAD measurement: 0 chars vs pdftotext 83,632 alnums
- [x] The corpus re-sourced and pins verified (7/8 — LO Writer 7.6 still
      unavailable, the r107 verdict stands)
- [x] The stream-walk studied; the fix designed (the conservative
      `!/\/Filter/` form; the Prawn CMaps confirmed raw)
- [x] The prototype + blast radius (all 7 byte-identical at every leg)
- [x] R110-B/C/D/E discovered and fixed in the prototype (the dotted
      bindings, the WinAnsi marker, the NBSP census, the array-triple)
- [x] The member checks vs pdftotext (every glyph class exact)
- [x] RED 6/6 → GREEN 1073/1073 → mutations M1–M5 exact
- [x] The real-file ground truth on the final source
- [x] The live UI verify (the r104 protocol)
- [x] Build + E2E + screenshots
- [x] The docs layer (this plan + the session log + the AGENTS/SKILL/
      CLAUDE/README lockstep + the worklog round-109 entry)
- [x] Commit + push to main via the SSH wrapper
