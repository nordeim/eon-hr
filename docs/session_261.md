# Session 261 — Session 114 / Parity Round 113 (THE 19th-WRITER ROUND)

The working log of round 113 (session 114): the hunt took the
**19th writer family — fpdf2 2.8.5** (the modern PyFPDF lineage — a
distinct family from ReportLab with its own TTF subsetter and ToUnicode
layout; the standard Python programmatic-CV path, sourced through the
official pip release). The first measurement read **0 of pdftotext's 860
alnums** — a total-extraction failure with two stacked defects: the
literal-interior census false-reject (a genuine content stream at 51.8%
printable — the raw 2-byte Identity-H codes carry a NUL high byte —
silently skipped by the whole-stream gate) and, beneath it, the
kern+space-glyph word-gap duality (justified paragraphs write every gap
DOUBLY — a ≤ -100 kern AND a leading space glyph — reading "Human 
resources" where pdftotext reads "Human resources"). Both cured TDD-first
with a zero blast radius. The round also transferred the neo-crm s205
ENV-FACE TOTALITY doctrine in full: the CI documentation cure + the
standing genus pin. The opening deploy watch read QUIET (no 78th deploy).

## The opening read (the 78th-deploy watch)

- **QUIET** — the login assets unchanged (JS `index-CcEolDtM`, CSS
  `index-BHjkUcdg` — the 77th state stands), the render BYTE-IDENTICAL to
  the standing `69aa4241…` baseline (the ninth consecutive probe capture);
  the app side QUIET at the r42 baseline (`C-IrDy5f` / `BGNH4KkS`).
- **The mobile-nav pair (the user's named focus): PARITY** — both sides
  28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer (REF 16
  items, Close `display:none`; clone 15, the a11y supersets); the menu
  cycle `/training`: REF STILL-OPEN (the 69th's regression through its
  NINTH deploy — the classification STANDS), clone AUTO-CLOSED (the
  pinned superset); `/employeedetail` REF 66 vs clone 248 nodes (the
  standing hold); **no Tailwind v4 regression — identical geometry**.

## The hunt

1. The corpus verified at HEAD first: the /tmp corpus SURVIVED from the
   r113 session (the sandbox was not reset) — all 24 member pins + the 17
   byte-level md5s re-measured before any change.
2. The available-tooling census: Ghostscript 10.05, pandoc, java present;
   groff/wkhtmltopdf/php absent. **fpdf2 2.8.5** (pip) — the genuine 19th
   family: the PyFPDF lineage, its own subset TTF writer.
3. The specimen: a modern-cv-shaped resume (embedded Liberation Sans,
   the justified `multi_cell` paragraphs that are fpdf2's DEFAULT body
   form) + five variants — control, SetXY absolute dates (the hoist
   class), two pages, letter-spacing, and base-14 core fonts (the 1-byte
   literal class).
4. **The HEAD measurement: 0 of 860 alnums** — the file read EMPTY.

## The defects and the fixes

- **R114-A — the literal-interior census mask**: fpdf2 writes 2-byte
  Identity-H codes as RAW control bytes in literals (the high byte every
  code is `0x00` — half the literal payload is NULs); the content stream
  measured 51.8% printable and the R102-A leg-3 gate silently skipped it.
  THE FIX: the census measures the stream's SYNTAX — the literal spans
  collected by a LINEAR depth-tracked scan (a regex mask rejected: it
  would re-introduce the pathological-backtracking class the guard
  prevents), sampled positions inside a span skipped, an unclosed span
  discarded, `taken === 0` rejected.
- **R114-B — the kern+space-glyph duality**: with the census cured the
  file read 860/860 — with DOUBLED word gaps (the count-pin blind spot
  class, the third consecutive round; the form probes caught it).
  fpdf2's justified `multi_cell` writes every word gap DOUBLY: a
  `-177.696` kern (over the ≤ -100 boundary → our separator) AND a
  leading space glyph in the next atom (the ToUnicode's U+0020). THE FIX:
  the `condKern` marker + the assembly collapse when the leading space is
  **the writer's own** (a cmap-declared U+0020 or a real 0x20 byte) —
  never the printable-scrub remap (pdfTeX's `\034` fi-ligature). The
  first draft without the genuine check drifted arXiv + dvipdfmx (the
  scrub-class "spaces") — rebuilt to the refined form and a zero blast
  radius.

## The TDD round

The fixture-geometry verification first (the r112 lesson — two fixtures
rebuilt in-round: a raw-code pad broke the `<40-alphanumeric` yield
guard, another rode an invalid hex form) → RED 4/4 with the exact
designed signatures (the dead-file `''`, the 1-byte / 2-byte-cmap / hex
doubled-gap forms) + 3 born-green guards (the paren-free binary decoy
stays rejected; the scrub-class kern gap KEEPS its double space; the
sub-threshold `-92.953` kern keeps the standing join) → GREEN **1102/1102**
(1092 + 7 net new + the 3 census specs below) → **MUTATIONS: M1 [the
census mask removed] exactly 1 · M2 [the collapse removed] exactly 3 (the
first M2 draft removed the standing kern rule itself — 16 RED — and was
rebuilt to the isolated form) · M3 [the genuine check removed] exactly 1
· M4 [the hex genuine check removed] exactly 1** — the restored file
re-verified green after each.

## The ground truth

All SEVENTEEN standing members **BYTE-IDENTICAL** through the final
source (full-text md5: arXiv 4d55b9e8 · dvipdfmx 997b1521 · fontspec
dc116383 · IRS 3b8da084 · LO Calc 4e6f6a0c · QUARTZ 7c7e6529 · ReportLab
155ca508 · Prawn 82da488f · the four Typst members · the five Skia
members); the six WeasyPrint members re-verified at their r113 pins. The
six FPDF2 members: **860/860 ×5 · 1020/1020 — each EXACTLY pdftotext's
count (100.00%)**, zero doubled gaps, zero U+FFFD, the ORDER probes
matching member-for-member, the FORM probes (joined name, single-spaced
body) beside the count pins. **THE CORPUS GROWS TO 30 MEMBERS, 19 WRITER
FAMILIES.**

## The live UI verify (the r104 protocol)

A fpdf2-shaped probe CV (reads EMPTY at HEAD) through the recruitment
AI-CV-Upload tab on the remediated standalone build → the stored cvText
opens **"r114 fpdf probe\nSenior HR Manager\nr114.fpdf@example.com · "**
with the dates at position 364 (name-first), zero U+FFFD, the
single-spaced body, no doubled gaps, aiScore 22. The probe swept by its
REAL id; the DB verified pristine through direct Prisma reads (1 user /
0 candidates / 3 job postings).

## The env-face totality census (the r114-queued item)

- The census (comment-stripped, skills/ excluded): the app face accurate
  (`DATABASE_URL` + `AUTH_SECRET`); the test side reads `E2E_PORT`
  (documented r113) and **`CI`** (playwright.config.ts:59) — the one
  undocumented knob → cured in `.env.example`.
- **THE GENUS PIN** — `tests/unit/env-face.test.ts` (the neo-crm s205
  D-205a2 form adapted): the standing census walks src/ + tests/ + the
  root configs, asserts every non-framework consumer appears in
  `.env.example` (+ the reverse arm + the self-check leg; scripts/
  excluded by design — the round-local probe knobs are historical
  tooling). Born-green 3/3; the mutation proof: the planted consumer →
  exactly 1 RED, the planted phantom knob → exactly 1 RED.

## The audit legs

- The session-113 changes (R113-A) re-verified structurally at HEAD —
  gates green at the documented 1092.
- The neo-crm s205 layer (the ENV-FACE TOTALITY CONTRACT) transferred in
  full; the s206+ layer queued for the r115 watch.
- The advisory state: the documented standing census (deepmerge-ts
  dev-chain + minimatch, zero runtime exposure); the patch watch: 16.4.4
  NOT published, 16.3's successor 16.4.3 non-security → the ^16.4.2 HOLD
  stands.

## The environment notes

- The documented DATABASE_URL trap live again (an exported
  `file:/home/z/my-project/db/custom.db` outside the repo) — `env -u
  DATABASE_URL` on every Prisma/server/build leg.
- The /tmp corpus SURVIVED from r113 (the same sandbox) — no re-source
  needed; the pins re-verified at HEAD before any change.
- The E2E runner kills the :3200 holder by port — the screenshots ran
  BEFORE the E2E gate.
- The r110-era browser trap pre-cured: both chromium 1200 + 1248 in the
  cache.

## Gates

lint 0/0 · tsc ✓ · **1102/1102 unit** (1092 + 7 net new + 3 census) ·
build ✓ (116/116) · E2E the standing 559 net (the fixes ride the unit
layer per the r100/r102 documented split) · DB pristine. The evidence
chain: 12 r114 PNGs (the byte-identical login probe, the REF + clone
mobile-nav pair, the desktop set incl. the CV tab + the fpdf2-CV tab
capture).
