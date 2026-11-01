# Remediation Plan — Session 111 / Parity Round 110

The 16th-writer round. The r110 queue's standing items (the two-pass
per-letter width table, the positive-gap-writer class, the non-ASCII
/Differences remap) stayed deferred; the round's hunt targeted the
**17th modern writer family: Typst** — the fast-growing LaTeX alternative
(Rust) whose CV templates are increasingly common in real recruitment
pipelines. The hunt sourced **four genuine Typst 0.15.1 specimens**
(the official `@preview/modern-cv` template compiled with the official
binary: a resume, its variant, and two cover letters) — and the extractor
read **125 of pdftotext's 2,422 alnums (5%)** on the resume: a
total-extraction failure with THREE stacked defects beneath, all cured
TDD-first. The 75th-deploy watch read a login-side JS+CSS churn (render
byte-identical → NON-VISUAL); the app side QUIET at the r42 baseline.

## The opening read (the 75th-deploy watch)

| Leg | Result |
| --- | --- |
| Login asset census | JS `index-DnufpLgl` → **`index-BFu7mt5f`** (moved), CSS `index-s8d1FO8M` → **`index-BHjkUcdg`** (moved) → **THE 75th DEPLOY, login-side only** (`scripts/r111-login-probe.mjs`, `docs/screenshots/r111-probe-login-ref.png`) |
| Login render | BYTE-IDENTICAL to the standing `69aa4241…` baseline → NON-VISUAL (the churn pattern's sixth repeat) |
| App-side assets | `index-C-IrDy5f` / `index-BGNH4KkS` — **QUIET, the r42 baseline holds** (`scripts/r111-app-census.mjs`) |
| Mobile-nav pair (390×844, the user's named focus) | **PARITY** — both sides 28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer (REF 16 items, Close `display:none`; clone 15, the a11y supersets); the menu cycle `/training`: REF STILL-OPEN (the 69th's regression through its SIXTH deploy), clone AUTO-CLOSED (the pinned superset); `/employeedetail` REF 66 vs clone 248 nodes (the standing hold); **no Tailwind v4 regression — identical geometry** (`scripts/r111-nav-pair.mjs`) |

## THE HUNT (the 16th writer family)

- **Target selection**: CV-relevant writers not yet in the corpus —
  TCPDF/FPDF (PHP) unreachable (site 404s, wayback timeouts), so the hunt
  took the official **Typst 0.15.1 binary** (GitHub release) and compiled
  the official `@preview/modern-cv:0.10.0` template (resume, resume2,
  coverletter, coverletter2 — 4 specimens, Libertinus Serif, Type0
  Identity-H fonts with ToUnicode CMaps, Flate streams).
- **The HEAD measurement**: resume **125 alnums vs pdftotext's 2,422
  (5%)**; coverletter 340/1,872 (18%). The output was control-char soup —
  the per-byte latin1 scrub of 2-byte Identity-H codes.

## THE FINDINGS

### R111-A — the literal-form CID decode (the total-extraction failure)

The Typst writer encodes **every text show as a LITERAL string carrying
2-byte Identity-H codes** — `(\000\001\000\002\000\003\000\004)Tj` is
"John" under the font's ToUnicode — not as hex atoms. The CMap decode
(`decodeHexString`) only ever fired on HEX pieces; literals went through
`unescape()`'s per-byte `latin1Printable` (control bytes → spaces),
destroying the code pairing before any map could see it. **The arXiv
member carried the same latent class** (raw control bytes in literals —
HEAD read the region as `\x00J\x00o…` soup where pdftotext reads
"Token 01…Token 05").

**THE FIX**: (1) `unescapeRaw` — escapes resolved to TRUE bytes (octal →
the byte value, ws shortforms → the control byte, no printable scrub);
lit pieces carry `raw`. (2) At assembly, a literal whose font's
**OWN-BINDING chain** (the pageMap + candidate resolutions — never the
global all-cmaps fallback) resolves a `codeLen-2` CMap that **fully
covers** its byte-paired codes decodes through it; everything else keeps
today's behavior verbatim. **The narrowing is load-bearing**: the first
draft rode the full `localFor` chain and the loose first-covering walk
misdecoded a dvipdfmx region ("MET䅚OST" for "METPOST") and an IRS region
— a foreign CJK map happened to cover a 1-byte-font literal's byte
pairs. Odd raw lengths never pair (the XFA per-glyph class stays
verbatim).

### R111-B — the lowercase /f-name bindings (the swapped-page-dict misdecode)

Typst names its fonts **`/f0`, `/f1`…** (lowercase) and — the real trap —
**two pages' resources bind the SAME name to DIFFERENT fonts** (page 1:
f0→Regular, page 2: f0→Bold). The page-tree/objFonts scans rode the
uppercase-`F` pair regex, so `/f0` never bound through the page tree;
page 2's pieces fell to the file-order candidate chain where the FIRST
(wrong-page) map covered — the "Education"/"Example University" region
read as interleaved garbage ("vnxaEnhfp").

**THE FIX**: the pair-regex name class extends to `[Ff]` at all FIVE
F-pair sites (the raw candidate scan, the raw page/object scan, the three
ObjStm sites). The /Font-dict-region collector's general-name alternative
already handled lowercase (unchanged); the R107-B "Font" key exclusion
stays exact-case (PDF resource keys are canonically `/Font`).

### R111-C — the raw nested parens inside literal strings (the vanishing paragraphs)

Typst emits subset-font code bytes **0x28/0x29 — the `(` and `)` GLYPHS
inside words like "consectetur" — as RAW unescaped parens inside literal
strings** (a PDF §7.3.4.2 violation that pdf.js and pdftotext tolerate by
nesting depth). The flat string alternative `\((?:\\.|[^\\()])*\)` ended
the literal at the inner `)`, and the TJ-array body then died at the
orphaned paren — **whole paragraphs vanished** (the Experience and
Education bullet runs read as "• • •").

**THE FIX (the regex form, not a pre-pass)**: the paren-string class
extends with ONE nesting level — `(?:\\.|[^\\()]|\((?:\\.|[^\\()])*\))*`
— at the three string sites (the ops show-literal alternative, the
array-body paren alternative, the atomRe literal). **A whole-stream
depth-tracking pre-pass was prototyped first and REJECTED**: the IRS XFA
payload embeds JavaScript whose `getField("c1_01(0)")` parens corrupted
the tracker and swallowed 48 real `(0)Tj` literals — the regex form is
safe precisely because it only fires where a show/array match is already
anchored.

## THE TDD ROUND

- **RED 4/4** at HEAD with the exact designed signatures — the octal
  literal spec reads `''` (the scrubbed spaces fall under the 40-alnum
  readability guard), the raw-bytes spec reads `''`, the lowercase-f0
  spec reads **`ZZZ…`** (the wrong page's map covered first — the real
  file's "vnxaEnhfp" class), the nested-paren spec reads `''` (the array
  body died). Plus **2 born-green guards** (the dvipdfmx false-cover
  pin, the XFA odd-length pin).
- **Leg isolation**: the raw-bytes fixture's code range skips the paren
  bytes 0x28/0x29 (a first draft coupled it to R111-C — its M3 mutation
  read 2 RED; the gap restored the isolation).
- **GREEN 1079/1079** = 1073 standing + 6 net new
  (`tests/unit/cv-text.test.ts`).
- **MUTATIONS** (each reverted in isolation, the file re-verified green
  after): M1 [the lit-CID decode removed] exactly **2** · M2 [the
  lowercase class reverted at ALL five sites] exactly **1** · M3 [the
  nested-paren extension reverted at BOTH regex lines] exactly **1** ·
  M4 [the own-chain narrowed to the full localFor chain] exactly **1**.

## THE REAL-FILE GROUND TRUTH

All SEVEN standing members **BYTE-IDENTICAL** through the final source
(dvipdfmx 61,437 · fontspec 106,179 · IRS 5,798 · LO Calc 695,014 ·
QUARTZ 2,697 · ReportLab 213,160 · Prawn 83,657). **The arXiv pin MOVES
67,744 → 70,646** — the documented improvement: HEAD's pin contained the
garbled literal-CID region (per-byte soup, 14,250 control chars); the fix
decodes it through the font's own ToUnicode exactly as pdftotext reads it
("Token 01…Token 05"), control chars 14,250 → 237, and the member moves
to 99.38% of pdftotext's 71,086 (HEAD was 95.30%). The four TYPST
members: **2422/2422 · 2013/2013 · 1872/1872 · 2083/2083 alnums — each
EXACTLY pdftotext's count (100.00%)**, zero U+FFFD, every applicable
probe passes (John Smith, Software Engineer, Lorem ipsum, thread pool
library, Example University, B.S. in Computer Science, consectetur
adipiscing, Company Recruitement Team, Google, Inc.). **THE CORPUS GROWS
TO 13 MEMBERS, 16 WRITER FAMILIES** (the 4 Typst specimens pinned).

## THE LIVE UI VERIFY (the r104 protocol)

A Typst-shaped CV (octal-escaped literal codes, a lowercase /f0 binding,
a raw nested paren in a TJ array — reads EMPTY at HEAD) through the
recruitment AI-CV-Upload tab on the remediated standalone build → the
stored cvText carries the decoded phrase; the probes swept, the DB
pristine (verified directly through Prisma).

## Gates

lint 0/0 · tsc ✓ · **1079/1079 unit** (1073 + 6 net new) · build ✓
(env -u DATABASE_URL; NODE_OPTIONS=--max-old-space-size=3072) · E2E the
standing 559 net (the CV-flow fix rides the unit layer per the r100/r102
documented split) · DB pristine.

## The evidence chain

The r111 PNGs under `docs/screenshots/`: the byte-identical login probe,
the REF + clone mobile-nav pair on the remediated build, the desktop set,
the Typst-CV tab capture.

## The ToDo list (the plan as executed)

- [x] The 75th-deploy watch: login probe (both assets moved, render
      byte-identical → NON-VISUAL) + app-side census (QUIET)
- [x] The mobile-nav pair on the remediated build: PARITY (the user's
      named focus; the REF stay-open regression persists through its
      sixth deploy — the classification STANDS)
- [x] The audit of the session-110 changes (R110-A..E re-verified at
      byte level — the `[m` display-swallow trap documented: an
      output-renderer artifact faked a syntax error in `return [mk, …]`)
- [x] The corpus re-sourced and all 8 pins verified at HEAD (md5-exact:
      LO Calc dbb10a2b…, QUARTZ 27575d59…, Prawn 699ebcab…, ReportLab
      0f64df85…)
- [x] The hunt: Typst 0.15.1 sourced (official binary + official
      modern-cv template), the HEAD measurement 125/2,422 (5%)
- [x] R111-B/C discovered beneath (the swapped-page lowercase bindings,
      the raw nested parens)
- [x] The prototype + blast radius (the pre-pass form REJECTED on the
      IRS XFA hazard; the own-chain narrowing added on the dvipdfmx/IRS
      false-cover)
- [x] RED 4/4 → GREEN 1079/1079 → mutations M1–M4 exact
- [x] The real-file ground truth (7 byte-identical, arXiv improved and
      re-pinned 70,646, the 4 Typst members at 100.00%)
- [x] The live UI verify (the r104 protocol)
- [x] Build + E2E + screenshots
- [x] The docs layer (this plan + the session log + the AGENTS
      session-111 layer + the SKILL v3.98.0 §123 + the CLAUDE/README/
      AGENTS count lockstep 1079 + 559 = 1638 + the worklog round-110
      entry)
- [x] Commit + push to main via the SSH wrapper
