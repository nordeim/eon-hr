# Session 255 — Session 111 / Parity Round 110 (THE 16th-WRITER ROUND)

The working log of round 110 (session 111): the hunt took the
**16th writer family — Typst** (the Rust-based LaTeX alternative whose CV
templates increasingly reach real recruitment pipelines), sourced four
genuine specimens through the official binary + the official
`@preview/modern-cv` template, and the resume read **125 of pdftotext's
2,422 alnums (5%)** with THREE stacked defects beneath — all cured
TDD-first. The round continues the standing program: opening deploy read →
the hunt → the prototype-measured blast radius → RED/GREEN/mutations →
the real-file ground truth → the live UI verify → gates → docs.

## The opening read (the 75th-deploy watch)

- **THE 75th DEPLOY detected** — login JS `index-DnufpLgl`→`index-BFu7mt5f`
  AND CSS `index-s8d1FO8M`→`index-BHjkUcdg` (both assets moved), but the
  render is **BYTE-IDENTICAL** to the standing `69aa4241…` baseline →
  NON-VISUAL (the churn pattern's sixth repeat). The app side QUIET at
  the r42 baseline (`index-C-IrDy5f` / `index-BGNH4KkS`).
- **The mobile-nav pair (the user's named focus): PARITY** — both sides
  28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer (REF 16
  items, Close `display:none`; clone 15, the a11y supersets); the menu
  cycle `/training`: REF STILL-OPEN (the 69th's regression through its
  SIXTH deploy — the classification STANDS), clone AUTO-CLOSED (the
  pinned superset); `/employeedetail` REF 66 vs clone 248 nodes (the
  standing hold); **no Tailwind v4 regression — identical geometry**.

## The hunt

1. The corpus re-sourced and verified first: **all 8 pins hold at HEAD**
   (md5-exact re-downloads — LO Calc `dbb10a2b…`, QUARTZ `27575d59…`,
   Prawn `699ebcab…`, ReportLab `0f64df85…`).
2. The audit of the session-110 changes re-verified R110-A..E at byte
   level — including the **`[m` display-swallow trap**: the output
   renderer swallows the literal two-char sequence `[m` (ANSI-reset
   interpretation), which FAKED a syntax error in `return [mk, …]` in
   every sed/cat/node display; `od -c` and the green tsc proved the code
   correct. Machine-readable diagnostics beat display output (§3).
3. Writer targets: TCPDF/FPDF unreachable (site 404s, wayback timeouts) →
   **Typst 0.15.1** (the official GitHub-release binary) compiling the
   official `@preview/modern-cv:0.10.0` template → four specimens
   (resume, resume2, coverletter, coverletter2).
4. **The HEAD measurement**: resume 125/2,422 alnums (5%) — the output
   was control-char soup (the per-byte latin1 scrub of 2-byte codes).

## The three defects (the full evidence chain in the remediation plan)

- **R111-A — the literal-form CID decode**: Typst writes every text show
  as a LITERAL string carrying 2-byte Identity-H codes
  (`(\000\001\000\002\000\003\000\004)Tj` = "John" under the font's
  ToUnicode) — and the CMap decode only ever fired on HEX atoms. THE FIX:
  `unescapeRaw` (escapes → true bytes, no scrub) + at assembly a literal
  whose font's **OWN-BINDING chain** resolves a fully-covering `codeLen-2`
  map decodes through it. **The narrowing is load-bearing**: the first
  draft's full-chain form misdecoded a dvipdfmx region ("MET䅚OST") and
  an IRS region — a foreign CJK map covered a 1-byte-font literal's byte
  pairs. The arXiv member carried the same latent class (raw control
  bytes in literals).
- **R111-B — the lowercase /f-name bindings**: Typst names fonts `/f0`,
  `/f1` and two pages' resources bind the SAME name to DIFFERENT fonts
  (page 1: f0→Regular, page 2: f0→Bold). The uppercase-`F` page-tree scan
  never bound them; page 2's pieces rode the file-order chain and the
  wrong page's map covered — "Education"/"Example University" read as
  interleaved garbage ("vnxaEnhfp"). THE FIX: `[Ff]` at all five F-pair
  sites.
- **R111-C — the raw nested parens**: Typst emits code bytes 0x28/0x29
  (the `(` `)` glyphs inside words like "consectetur") as RAW unescaped
  parens inside literal strings (a PDF §7.3.4.2 violation pdf.js and
  pdftotext tolerate by depth). The flat string alternative ended the
  literal at the inner `)` and the TJ-array body died at the orphaned
  paren — **whole paragraphs vanished** ("• • •"). THE FIX: the
  one-nesting-level paren class at the three string sites. **A
  whole-stream depth-tracking pre-pass was prototyped and REJECTED**: the
  IRS XFA payload's embedded JavaScript (`getField("c1_01(0)")`) corrupted
  the tracker and swallowed 48 real literals.

## The TDD round

RED 4/4 at HEAD with the exact designed signatures (`''`, `''`, `ZZZ…`,
`''`) + 2 born-green guards (the false-cover pin, the odd-length pin) —
**leg isolation**: the raw-bytes fixture's code range skips the paren
bytes 0x28/0x29 (a first draft coupled it to R111-C; the gap restored
isolation) → GREEN **1079/1079** (1073 + 6 net new) → MUTATIONS: M1 [the
lit-CID removed] exactly 2 · M2 [the lowercase reverted at ALL five
sites] exactly 1 · M3 [the nested-paren reverted at BOTH regex lines]
exactly 1 · M4 [the own-chain → the full localFor chain] exactly 1 — the
restored file re-verified green after each.

## The ground truth

All SEVEN standing members BYTE-IDENTICAL (dvipdfmx 61,437 · fontspec
106,179 · IRS 5,798 · LO Calc 695,014 · QUARTZ 2,697 · ReportLab 213,160
· Prawn 83,657). **The arXiv pin MOVES 67,744 → 70,646** — the documented
improvement: HEAD's pin contained the garbled literal-CID region; the fix
decodes it exactly as pdftotext reads it ("Token 01…Token 05"), control
chars 14,250 → 237, the member now at 99.38% of pdftotext (HEAD was
95.30%). The four TYPST members: **2422/2422 · 2013/2013 · 1872/1872 ·
2083/2083 — each EXACTLY pdftotext's count (100.00%)**, zero U+FFFD,
every applicable probe passes. **THE CORPUS GROWS TO 13 MEMBERS, 16
WRITER FAMILIES.**

## The live UI verify (the r104 protocol)

A Typst-shaped CV (octal-escaped literal codes, a lowercase /f0 binding,
a raw nested paren in a TJ array — reads EMPTY at HEAD) through the
recruitment AI-CV-Upload tab on the remediated standalone build → the
stored cvText carries **JohnSmithSeniorHRManager…** + **Senior HR
Ma(nager)** with zero U+FFFD; the probes swept, the DB pristine
(1 user / 0 candidates, verified directly through Prisma).

## The environment notes

- The documented DATABASE_URL trap live again (an exported
  `file:/home/z/my-project/db/custom.db` outside the repo) — `env -u
  DATABASE_URL` on every Prisma/server leg.
- The standalone `.env` copy needs the real AUTH_SECRET (set in the local
  git-ignored `.env`; the committed `.env.example` keeps the documented
  template — only DATABASE_URL + AUTH_SECRET are read).
- The r111 probe/diag scripts ride the variable-path import (the R108-A
  lesson).

## Gates

lint 0/0 · tsc ✓ · **1079/1079 unit** (1073 + 6 net new) · build ✓ ·
E2E **559/559** (a clean 11.0m single run — after the pinned-browser
install repeated the r110 trap and three standing specs were cured of
their literal October-2026 date-coupling: the Nov 1 UTC rollover flake) ·
DB pristine. The evidence chain: 12 r111
PNGs (the byte-identical login probe, the REF + clone mobile-nav pair,
the desktop set incl. the CV tab + the Typst-CV tab capture).
