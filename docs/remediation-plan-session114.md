# Remediation Plan — Session 114 / Parity Round 113

The 19th-writer round. The hunt took **fpdf2 2.8.5** — the modern PyFPDF
lineage (Olivier Plathey's FPDF → PyFPDF → the fpdf2 fork), a distinct
writer family from ReportLab with its own TTF subsetter, its own
ToUnicode/CID layout, and the standard Python quick-CV/invoice path for
generations of web apps. The measured specimen (a modern-cv-shaped resume
with embedded Liberation Sans + justified paragraphs) read **0 of
pdftotext's 860 alnums** at HEAD — a total-extraction failure with TWO
stacked defects beneath. The 78th-deploy watch read QUIET on both sides
(no new deploy; the 77th state stands); the app side QUIET at the r42
baseline.

## The opening read (the 78th-deploy watch)

| Leg | Result |
| --- | --- |
| Login asset census | JS `index-CcEolDtM` (unchanged), CSS `index-BHjkUcdg` (unchanged) — **QUIET, no 78th deploy**; the 77th state stands (`scripts/r114-login-probe.mjs`, `docs/screenshots/r114-probe-login-ref.png`) |
| Login render | BYTE-IDENTICAL to the standing `69aa4241…` baseline (the ninth consecutive probe capture) |
| App-side assets | `index-C-IrDy5f` / `index-BGNH4KkS` — **QUIET, the r42 baseline holds** (`scripts/r114-app-census.mjs`) |
| Mobile-nav pair (390×844, the user's named focus) | **PARITY** — both sides 28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer (REF 16 items, Close `display:none`; clone 15, the a11y supersets); the menu cycle `/training`: REF STILL-OPEN (the 69th's regression through its NINTH deploy), clone AUTO-CLOSED (the pinned superset); `/employeedetail` REF 66 vs clone 248 nodes (the standing hold); **no Tailwind v4 regression — identical geometry** (`scripts/r114-nav-pair.mjs`) |

## THE HUNT (the 19th writer family)

- **Target selection**: CV-relevant writers not yet in the corpus. The
  available-tooling census first (Ghostscript 10.05, pandoc, java present;
  groff/wkhtmltopdf/php absent), then the quick probes. **fpdf2 2.8.5**
  (pip) is the genuine 19th family: the PyFPDF lineage with its own subset
  TTF writer — the standard Python programmatic-CV path.
- **The specimens**: a modern-cv-shaped resume
  (`scripts/r114-fpdf-probe.py` — embedded Liberation Sans, the justified
  `multi_cell` paragraphs that are fpdf2's default body form) plus five
  variants pinning the pattern's generality — no-positioning control,
  SetXY absolutely-placed date column (the hoist class), two pages,
  per-char letter-spacing, and base-14 core fonts with NO embedding (the
  1-byte literal class) (`scripts/r114-fpdf-variants.py`).
- **The HEAD measurement**: **0 of 860 alnums** — the file read EMPTY.
  The corpus re-verified FIRST at HEAD (the /tmp corpus survived from
  r113 — all 24 member pins + the 17 byte-level md5s re-measured before
  any change).

## THE FINDINGS

### R114-A — the literal-interior census mask (the fpdf2 dead-file)

fpdf2 writes every text show as a literal string carrying **2-byte
Identity-H codes as RAW control bytes** — the high byte of every code is
`0x00`, so roughly half the literal payload bytes are NULs. The content
stream measured **51.8% printable** on the standing whole-stream census
(the R102-A leg-3 gate) — under the 60% threshold — and the gate silently
skipped the stream: the WHOLE file read 0 characters.

The gate's intent was always SYNTAX vetting (keep font programs and binary
out of the operator walk), but it measured the payload too. **THE FIX:**
the census now measures the stream's syntax only — the literal spans are
collected with a **linear depth-tracked scan** (`(`, `)` with escape
skipping; a regex mask was rejected — it would re-introduce the
pathological-backtracking class the guard exists to prevent), sampled
positions inside a span are skipped, and an unclosed span is discarded
(binary junk with a stray `(` never masks the tail). A stream whose every
sample lands inside a literal (`taken === 0`) stays rejected.

### R114-B — the kern+space-glyph word-gap duality (the doubled gaps)

With the census cured, the file read **860/860 alnums — but with DOUBLED
word gaps**: "Human  resources  leader" where pdftotext reads "Human
resources leader" (the count-pin blind spot class, the THIRD consecutive
round; the form probes caught it in-round). The anatomy: fpdf2's justified
`multi_cell` writes every word gap **DOUBLY encoded** — a negative kern
(`-177.696`, over the ≤ -100 word-gap boundary → our separator fires)
AND a **leading space glyph inside the next atom** (the code the ToUnicode
maps to U+0020 → a second space).

**THE FIX:** the kern word-gap branch marks its piece `condKern`, and at
assembly the separator collapses when — and ONLY when — the atom's leading
space is **the writer's own**: a cmap-declared U+0020 (the R111-A literal
branch or the covering hex discipline, `hexLeadingIsSpace`) or a real
`0x20` byte (`raw.charCodeAt(0) === 0x20`, covering the core-font 1-byte
form and octal-escaped spaces). A leading space that survives only
through the printable scrub — pdfTeX's `\034` fi-ligature remap — is NOT
the writer's space: the kern's separator stands there (the arXiv/dvipdfmx
byte-identity preserved; the first prototype draft without this guard
drifted both members and was rebuilt in-round).

## THE TDD ROUND

- **RED 4/4** at HEAD with the exact designed signatures — the raw-code
  dead-file (`''` — 0 chars), the 1-byte kern+space form, the 2-byte
  cmap kern+space-code form, and the hex-atom form (each
  "JohnSmith  SeniorHRManager" doubled) — after the **fixture-geometry
  verification** (the r112 lesson; two fixtures rebuilt in-round: the
  raw-code pad broke the `<40-alphanumeric` yield guard, and one pad rode
  an invalid hex-string form).
- **3 born-green guards** — the paren-free binary decoy stays rejected
  (the masking must not open the binary gate), the pdfTeX scrub-class
  kern gap KEEPS its double space (the arXiv fi-ligature guard), and the
  sub-threshold `-92.953` kern keeps the standing join (the boundary
  guard — fpdf2's SKILLS line class reads single-spaced at HEAD and
  after).
- **GREEN 1102/1102** = 1092 standing + 7 net new + 3 census (below).
- **THE MUTATION MATRIX** (each reverted in isolation, the file
  re-verified green after): M1 [the census mask removed] exactly **1** ·
  M2 [the R114-B collapse removed, the standing kern rule intact]
  exactly **3** — the first M2 draft accidentally removed the standing
  kern word-gap rule itself and read 16 RED; the isolation rebuilt ·
  M3 [the genuine check removed] exactly **1** · M4 [the hex genuine
  check removed] exactly **1**.

## THE REAL-FILE GROUND TRUTH

All SEVENTEEN standing members **BYTE-IDENTICAL** through the final
source (full-text md5: arXiv 4d55b9e8 · dvipdfmx 997b1521 · fontspec
dc116383 · IRS 3b8da084 · LO Calc 4e6f6a0c · QUARTZ 7c7e6529 · ReportLab
155ca508 · Prawn 82da488f · the four Typst members · the five Skia
members) — all alnum pins hold. The six WEASYPRINT members re-verified at
their r113 pins. The six FPDF2 members: **860/860 · 860/860 · 860/860 ·
860/860 · 860/860 · 1020/1020 — each EXACTLY pdftotext's count (100.00%)**,
zero doubled gaps, zero U+FFFD, the ORDER probes matching member-for-
member, and the FORM probes (joined name, single-spaced body, no doubled
gaps) beside the count pins. **THE CORPUS GROWS TO 30 MEMBERS, 19 WRITER
FAMILIES.**

## THE LIVE UI VERIFY (the r104 protocol)

A fpdf2-shaped probe CV (the "r114 fpdf probe" name — reads EMPTY at
HEAD) through the recruitment AI-CV-Upload tab on the remediated
standalone build → the stored cvText opens **"r114 fpdf probe\nSenior HR
Manager\nr114.fpdf@example.com · "** with the dates at position 364
(name-first), zero U+FFFD, the single-spaced body, no doubled gaps,
aiScore 22. The probe swept by its REAL id (the r112 lesson); the DB
verified pristine through direct Prisma reads (1 user / 0 candidates /
3 job postings).

## THE ENV-FACE TOTALITY CENSUS (the r114-queued item, the s205 doctrine's full transfer)

- **The census** (comment-stripped, skills/ excluded): the app face is
  accurate (`DATABASE_URL` + `AUTH_SECRET`; `NODE_ENV`/`NEXT_RUNTIME` are
  Next.js built-ins). The test/tooling face reads `E2E_PORT`
  (playwright.config.ts:21 — documented r113) and **`CI`**
  (playwright.config.ts:59 — `reuseExistingServer`) — the one undocumented
  knob → **cured in `.env.example`** (the informational tooling block).
- **THE GENUS PIN** — `tests/unit/env-face.test.ts` (the neo-crm s205
  D-205a2 form adapted): a standing unit census that walks src/ + tests/ +
  the root configs for every non-framework `process.env.*` consumer and
  asserts each appears in `.env.example`, plus the REVERSE arm (every
  documented knob is a real consumer) and a self-check leg (the walk
  actually sees the three live knobs). scripts/ excluded by design — the
  round-local probe tooling (the r63–r74 `R*_DUMP`/`PROBE_BASE` one-off
  knobs) is historical, never operator configuration. **Born-green 3/3**;
  the mutation proof: a planted undocumented consumer → exactly 1 RED; a
  planted phantom knob → exactly 1 RED.

## THE AUDIT LEGS

- **The session-113 changes** (R113-A sawNum) re-verified structurally at
  HEAD before any change — gates green at the documented 1092; the
  R112-A `repairHoistedPrefix` signature + the R113-A `sawNum` tracker
  both present.
- **The neo-crm layer check**: s205 landed since the last consumed layer
  (the ENV-FACE TOTALITY CONTRACT) — **transferred in full this round**
  (the CI documentation cure + the genus pin above); the next layer
  (s206+) queued for the r115 watch.
- **The advisory state**: the documented standing census (deepmerge-ts
  dev-chain high + minimatch moderate — both dev-toolchain transitive,
  zero runtime exposure). The patch watch: next 16.4.4 NOT published;
  16.4.3 remains the latest (non-security) → the **^16.4.2 HOLD stands**.

## Gates

lint 0/0 · tsc ✓ · **1102/1102 unit** (1092 + 7 hunt + 3 census) · build ✓
(116/116 static pages; env -u DATABASE_URL; NODE_OPTIONS=--max-old-space-
size=3072) · E2E the standing 559 net (the fixes ride the unit layer per
the r100/r102 documented split) · DB pristine.

## The evidence chain

The 12 r114 PNGs under `docs/screenshots/`: the byte-identical login
probe, the REF + clone mobile-nav pair (open + post-nav drawer states),
the desktop set (login, dashboard, employees, recruitment, the CV tab,
loans) on the remediated build, and the fpdf2-CV tab capture.

## The ToDo list (the plan as executed)

- [x] The 78th-deploy watch: QUIET (both sides at the 77th state; the
      render byte-identical)
- [x] The mobile-nav pair on the standing build: PARITY (the user's named
      focus; the REF stay-open regression persists through its ninth
      deploy — the classification STANDS)
- [x] The audit of the session-113 changes (R113-A re-verified
      structurally; the gates green at the documented 1092)
- [x] The corpus verified at HEAD (all 24 pins + 17 byte-level md5s — the
      /tmp corpus survived from r113, no re-source needed)
- [x] The hunt: fpdf2 2.8.5 (the available-tooling census, then the
      probe) — the HEAD measurement: 0 of 860 alnums
- [x] R114-A diagnosed (the 51.8% census false-reject) + prototyped +
      blast-radius measured (all 17 byte-identical through the prototype)
- [x] R114-B diagnosed (the kern+space duality; the form probes caught
      the doubled gaps the count pins could not see) + the genuine-space
      refinement after the first draft drifted arXiv/dvipdfmx (rebuilt to
      a zero blast radius)
- [x] The fixture-geometry verification, then RED 4/4 → GREEN 1102/1102 →
      the mutations M1 (1) + M2 (3) + M3 (1) + M4 (1) exact
- [x] The real-file ground truth (17 byte-identical, 6 WeasyPrint pins,
      6 fpdf2 members at 100.00% with order + form probes matching)
- [x] The live UI verify (the r104 protocol; the probe swept by its real
      id; the DB verified pristine through direct Prisma reads)
- [x] The env-face totality census (the r114-queued item): the CI cure +
      THE GENUS PIN (`tests/unit/env-face.test.ts`, born-green 3/3, the
      two-leg mutation proof)
- [x] Build (116/116) + the 12 screenshots (before the E2E gate) + the
      E2E gate
- [x] The docs layer (this plan + the session log + the AGENTS
      session-114 layer + the SKILL v4.1.0 §126 + the CLAUDE/README/
      AGENTS count lockstep 1102 + 559 = 1661 + the worklog round-113
      entry)
- [x] Commit + push to main via the SSH wrapper
