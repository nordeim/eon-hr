# Remediation Plan — Session 115 / Parity Round 114

The Typst positioned-space duality round. The r115-queued hunt class —
**the kern+space TRAILING-glyph form** ("the fpdf2 leading-space form is
cured; a TRAILING-space-in-previous-atom writer is unmeasured") — became
the hunt, and the hunt took the **Typst modern-cv family** (the 16th
writer's FORM round): the r111 originals were count-pinned but never
form-probed (the form probes started r113), and the reconstructed specimen
(a committed generator closing the r111 ad-hoc-generator reproducibility
gap) read alnums EXACT (**793/793** — the count-pin blind spot class, the
FOURTH consecutive round) with **18 doubled-gap runs where pdftotext reads
zero**.

The 79th-deploy watch read **QUIET-NONVISUAL** on the login side (the JS
`CcEolDtM`→`DA6CuPbY`, the CSS `BHjkUcdg`→`CMHVFeas` — both moved, the
render BYTE-IDENTICAL to the standing `69aa4241…` baseline); the app side
QUIET at the r42 baseline.

## The opening read (the 79th-deploy watch)

| Leg | Result |
| --- | --- |
| Login asset census | JS `index-DA6CuPbY` (moved), CSS `index-CMHVFeas` (moved) — **the 79th deploy, login-side-only**; the render BYTE-IDENTICAL to the standing baseline (`scripts/r115-login-probe.mjs`, `docs/screenshots/r115-probe-login-ref.png`) |
| Login render | BYTE-IDENTICAL to `69aa4241…` (the tenth consecutive probe capture) |
| App-side assets | `index-C-IrDy5f` / `index-BGNH4KkS` — **QUIET, the r42 baseline holds** (`scripts/r115-app-census.mjs`) |
| Mobile-nav pair (390×844, the user's named focus) | **PARITY** — both sides 28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer (REF 16 items, Close `display:none`; clone 15, the a11y supersets); the menu cycle `/training`: REF STILL-OPEN (the 69th's regression through its TENTH deploy — the classification STANDS), clone AUTO-CLOSED (the pinned superset); `/employeedetail` REF 66 vs clone 248 nodes (the standing hold); **no Tailwind v4 regression — identical geometry** (`scripts/r115-nav-pair.mjs`) |

## THE CORPUS RE-SOURCE (the fresh-sandbox intake)

The /tmp corpus did NOT survive the fresh sandbox — the full re-source
(the r109 protocol): **seven members re-sourced with every extraction pin
BYTE-IDENTICAL at HEAD before any change** — arXiv 2404.16710 (`4d55b9e8`
/ 70,646) · dvipdfmx (texdoc.org, `997b1521` / 61,437) · fontspec
(`dc116383` / 106,179) · IRS f1040 (`3b8da084` / 5,798) · QUARTZ
`longer.pdf` (the xmlcalabash test-suite trail, file md5 `27575d59`
EXACT — `7c7e6529` / 2,697) · ReportLab userguide (`0f64df85` file-exact —
`155ca508` / 213,160) · Prawn manual (`699ebcab` file-exact — `82da488f`
/ 83,657). The **LO Calc member could NOT be re-sourced** (the
LibreOffice docs site restructured; no wayback snapshot — the documented
r103 precedent: the unit net's writer-form pins carry it). The generated
families regenerated through their committed generators: the five **Skia**
members (the r112 scripts, after the in-round pinned-browser install —
chromium 1248 vs the 1200 cache, the r110/r112 trap live AGAIN) — every
pin+ref EXACT; the six **WeasyPrint** members — five pins exact, the CV
member RECONSTRUCTED as a committed script (`scripts/r115-weasy-cv.py`,
closing the r113 ad-hoc-generator gap) re-based at 782/782 (100.00%); the
six **fpdf2** members — every pin+ref EXACT; the four **Typst** members
recompiled (typst 0.15.1 + `@preview/modern-cv` 0.6.0, the compile date
PINNED to October 31 2026 — the r113 determinism fix; the modern-cv
coverletter's linguify layer is INCOMPATIBLE with typst 0.15.1 — the
letters built on the resume() form, the engine-level writer forms
identical).

## THE HUNT (the r115-queued trailing-glyph class — MEASURED ON TYPST)

The reconstructed Typst resume read **793/793 alnums — with 18 doubled-gap
runs** ("John   Smith", "design  and", "010-9911     john.smith") where
pdftotext reads zero. The anatomy, decoded piece-by-piece:

- **The positioned space run** — the Typst engine places every header-grid
  word as its own repositioned run (`q/cm/BT` blocks, the text matrix at
  origin) and writes the word separator as a STANDALONE space-glyph piece
  between them: "John"[sep=" "] + " "[sep=" "] + "Smith"[sep=" "] — THREE
  separators around one space glyph.
- **The trailing-glyph kern duality** — the r115-QUEUED CLASS, measured:
  Typst's justified paragraphs write every word gap as the word atom's
  TRAILING space glyph + an adjustment kern; the justification SQUEEZE
  kerns (≤ −100) fire the R102-C word-gap rule and double with the glyph
  ("design " + sep " " + "and").
- **The consecutive space runs** — the contacts separator written as TWO
  standalone space-glyph pieces.
- **The empty icon pieces** — blank glyph runs between contact items
  (measured, then EXCLUDED from the cure — see the refutations).

## THE FIX (three assembly-space rules + the hex-order cure)

**R115-A — the genuine space-run collapse:** a piece whose ENTIRE decoded
text is the writer's OWN space (genuine — the R114-B discipline: a
cmap-declared U+0020 or a real 0x20 byte, never the printable-scrub
remap) is the writer's separator POSITIONED AS ITS OWN RUN: its own " "
sep collapses, and the FOLLOWING piece's " " sep collapses (the
separation was already emitted).

**R115-B — the trailing-glyph duality (the queued hunt class):** a piece
whose text ENDS with the writer's own space (the `trail` flag — the
cmap-branch `text.endsWith(" ")`, the raw-byte branch
`raw.charCodeAt(len-1) === 0x20`, the hex branch `hexTrailingIsSpace`)
collapses the NEXT piece's " " sep. The mirror of R114-B's leading form.

**R115-C — the consecutive space-run collapse:** a space run contributes
nothing when the accumulated output already ends whitespace (tracked
through an `outTail` char — a regex on the growing output would be O(n²),
the in-round perf catch).

**THE HEX-ORDER CURE (the fontspec guard):** `hexTrailingIsSpace` (and
`hexLeadingIsSpace` — the same latent class) now run the cmap-covering
branches FIRST with the bare 0x20 byte check as the FALLBACK. The
fontspec TOC specimen: a hex atom ending with the code `0x0020` whose
ToUnicode maps to **"?"** — the r114 byte-first order fired on the code's
LOW byte and would have FUSED "fonts?" + "dotleader" into "fonts?dotleader"
(a word LOSS, caught by measurement in-round; the r114 order was a latent
misfire class that never fired on the r114 corpus).

**THE REFUTED FIRST DRAFTS (measured, not shipped):**
- **The empty-piece rule** — an empty-text piece's " " sep collapsing was
  REFUTED by fontspec: the TOC leader dots keep a real layout gap after
  an empty glyph run ("fonts? . . . ." — pdftotext reads the space).
- **The cm-gap device-delta separator** (the walk-space root cause — the
  Typst `cm` translations never feed the separator tracker, so the line
  structure reads space-joined where pdftotext reads newlines) — the
  first draft derived seps from the device-space deltas and DID restore
  the line structure, but its JOIN branch FUSED the arXiv math accents
  ("ˆinference" — pdftotext reads them separated; the accent rides a
  sub-em device delta). The line-structure class is DEFERRED to the
  standing queue with the measured findings; this round's cure stays
  assembly-space (the doubled gaps) with a zero word-fusion risk.

## THE TDD ROUND

- **RED 4/4** at HEAD with the exact designed signatures — the sandwich
  ("John   Smith"), the consecutive ("John     Smith"), the 1-byte
  trailing ("design  and organizational"), the hex trailing (the same) —
  after the fixture-geometry verification (the PAD guard; the hex
  fixture's internal space rebuilt in-round on its own code).
- **3 born-green guards** — the trailing scrub guard (the pdfTeX `\034`
  class keeps its double), the fontspec cmap-first guard (the 0x0020
  code mapping to "?" keeps its separator — the fixture rebuilt to the
  REAL 0x0020 class after the first draft's 0030 fixture showed no
  mutation teeth), the newline guard (a line move after a trailing space
  keeps "\n").
- **GREEN 1112/1112** (1102 + 7 hunt + 3 doc-family below).
- **THE MUTATION MATRIX** (each reverted in isolation, the file
  re-verified green after): M1 [the space-run rules removed] exactly
  **2** · M2 [the R115-C collapse removed] exactly **1** · M3 [the
  trailing rule removed] exactly **2** · M4 [the hexTrailingIsSpace
  byte-first order restored] exactly **1**.

## THE REAL-FILE GROUND TRUTH

All four TYPST members **100.00% of pdftotext** (793/793/897/871) with
**ZERO doubled gaps** (ours 0, pdftotext 0), zero U+FFFD, the five ORDER
probes matching, the FORM probes (joined name, single-spaced body, no
doubled gaps) passing. The byte-identical members HOLD: dvipdfmx
`997b1521` · fontspec `dc116383` (the hex-order cure verified inert on
it) · QUARTZ `7c7e6529`. The four **RE-PINNED** members (the r111
precedent — every drift classified TOWARD pdftotext, zero away, by the
whitespace-aligned word diff over pdftotext's reading): arXiv
`051ac68a` (dbl 151→123, all 28 changes toward; alnums 70,646 EXACT) ·
IRS `4166158e` (dbl 57→30) · Prawn `404277d9` (dbl 933→682) · ReportLab
`397aa0c2` (dbl 3881→2524). The regenerated families: WeasyPrint
(782/423/438/433/1616/243), fpdf2 (860×5/1020), Skia (1553/438/433/423/
1616) — every pin+ref EXACT, zero doubled gaps.

## THE DOC-FAMILY PIN (the neo-crm s206/s207 transfer — the r115 watch item)

The neo-crm layers landed since the s205 consumption: **s206 THE
STRICTNESS DOC-CONTRACT + s207 THE CHART-STACK DOC-FAMILY PIN** — the
genus: code pins guard the code, nothing guards the DOC CLAIMS. The
eon-hr census found the LIVE specimen: the docs pinned **"Playwright
1.63"** (the README badge + tooling table, the CLAUDE stack line, the
SKILL §2 row) while package.json held **^1.64.1** for the whole
r114→r115 window — every gate green, the doc contradicting the manifest.
**THE CURE:** the four doc faces flipped to 1.64 + **THE GENUS PIN**
`tests/unit/doc-family.test.ts` (three arms): it-1 the stack instance
(every doc face naming the @playwright/test minor carries the LIVE minor
from package.json) · it-2 the count lockstep genus (the CLAUDE
pyramid + table, the README quickstart, the AGENTS command table
mutually consistent, total = unit + e2e — historical session records
keep their ship-time counts by the s206 scoping doctrine) · it-3 the
phantom reverse arm (the CLAUDE stack majors all exist in package.json).
RED 1/3 at birth (the stale badge) → GREEN 3/3; **the mutation proof:
the stale badge re-planted → exactly 1 RED · the pyramid count broken →
exactly 1 RED** — restored green.

## THE AUDIT LEGS

- The session-114 changes (R114-A/B) re-verified structurally at HEAD
  before any change (the census mask + the condKern collapse + the
  `sawNum` tracker), gates green at the documented 1102.
- The advisory state: the documented standing census (deepmerge-ts
  dev-chain high + minimatch moderate — both dev-toolchain transitive,
  zero runtime exposure). The patch watch: next 16.4.4 NOT published;
  16.4.3 remains the latest (canaries only) → the **^16.4.2 HOLD
  stands**.
- The browser-version trap pre-cured in-round (the fresh install floats
  @playwright/test to the 1248 shell — `bunx playwright install
  chromium`).

## Gates

lint 0/0 · tsc ✓ · **1112/1112 unit** (1102 + 7 hunt + 3 doc-family) ·
build ✓ (116/116; env -u DATABASE_URL; NODE_OPTIONS=--max-old-space-
size=3072) · E2E the standing 559 net (the fixes ride the unit layer per
the r100/r102 documented split) · DB pristine (1 user / 1 employee / 2
balances / 0 payroll / 0 expenses; the probe candidates swept by their
REAL ids).

## The evidence chain

The 12 r115 PNGs under `docs/screenshots/`: the byte-identical login
probe, the REF + clone mobile-nav pair (open + post-nav drawer states),
the desktop set (login, dashboard, employees, recruitment, the CV tab,
loans) on the remediated build, and the Typst-CV tab capture.

## The ToDo list (the plan as executed)

- [x] The 79th-deploy watch: QUIET-NONVISUAL (login-side asset churn, the
      render byte-identical; the app side at the r42 baseline)
- [x] The mobile-nav pair on the standing build: PARITY (the user's named
      focus; the REF stay-open regression persists through its tenth
      deploy — the classification STANDS)
- [x] The audit of the session-114 changes (R114-A/B re-verified
      structurally; the gates green at the documented 1102)
- [x] The corpus re-source (the fresh sandbox): 7 re-sourced members
      byte-identical at HEAD; LO Calc not re-sourceable (documented); the
      generated families regenerated (Skia/WeasyPrint/fpdf2/Typst) with
      the WeasyPrint CV + the Typst family reconstructed as committed
      generators (the reproducibility gaps closed)
- [x] The hunt: the r115-queued trailing-glyph class MEASURED on the
      reconstructed Typst family (793/793 alnums, 18 doubled gaps)
- [x] The prototype blast radius: the first drafts' empty-piece rule and
      cm-gap join branch REFUTED by measurement (fontspec's TOC gap; the
      arXiv accent fusion) — the refined three-rule cure + the hex-order
      fix landed at zero word-fusion risk
- [x] The fixture-geometry verification, then RED 4/4 → GREEN
      1112/1112 → the mutations M1 (2) + M2 (1) + M3 (2) + M4 (1) exact
- [x] The real-file ground truth (3 byte-identical, 4 re-pinned
      toward-pdftotext, the Typst family at 100.00% with zero doubled
      gaps, the regenerated families exact)
- [x] The live UI verify (the r104 protocol): the Typst probe CV through
      the real upload flow reads "r115 typst probe Senior HR Manager…"
      name-first (namePos 0, dates 558), zero U+FFFD, aiScore 23; the
      probes swept by their REAL ids (the sweep-regex job-id misprint
      caught and cured in-round); the DB verified pristine
- [x] The neo-crm s206/s207 transfer: the Playwright doc claims cured +
      THE DOC-FAMILY GENUS PIN (born RED 1/3 on the stale badge, the
      two-leg mutation proof)
- [x] Build (116/116) + the 12 screenshots (before the E2E gate) + the
      E2E gate
- [x] The docs layer (this plan + the session log + the AGENTS
      session-115 layer + the SKILL v4.2.0 §127 + the CLAUDE/README/
      AGENTS count lockstep 1112 + 559 = 1671 + the worklog round-114
      entry)
- [x] Commit + push to main via the SSH wrapper
