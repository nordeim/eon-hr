# Session 253 — Session 110 / Parity Round 109 (THE 15th-WRITER ROUND)

The working log of round 109 (session 110): the r109 queue's
uncompressed-content-stream watch became the hunt, the hunt sourced the
Prawn manual (the 15th writer family), and the file read ZERO characters
with FIVE stacked defects beneath — all cured TDD-first. The round
continues the standing program: opening deploy read → the hunt → the
prototype-measured blast radius → RED/GREEN/mutations → the real-file
ground truth → the live UI verify → gates → docs.

## The opening read (the 74th-deploy watch)

- **THE 74th DEPLOY detected** — login JS `XEFf4q1x`→`DnufpLgl` AND CSS
  `Bwz2pKfc`→`s8d1FO8M` (BOTH assets moved this time, the fifth distinct
  pair), but the render is **BYTE-IDENTICAL** to the standing
  `69aa4241…` baseline → NON-VISUAL (the churn pattern's fifth repeat).
- The app-side census: `index-C-IrDy5f` / `index-BGNH4KkS` — QUIET, the
  r42 baseline holds. The 74th deploy is login-side only.
- The neo-crm state: HEAD at session-309 (was 299 at eon-hr r109); the
  unconsumed layers s201 (phone-width dialog-open a11y) and s202
  (login-card client-state) assessed as census candidates against the
  standing pins — the s195 "already covered" pattern; the r110 queue
  item (the uncompressed-stream watch) took the round's focus instead.

## The hunt

1. The synthetic probe (`r110-uncompressed-probe.ts`) **confirmed the
   defect at HEAD**: a content stream with NO `/Filter` reads 0 chars.
2. The pdf.js test-suite corpus sparse-cloned and censused
   (`r110-uncompressed-hunt.sh`): 322 candidate files — all reduced test
   cases (max 2,130 alnums) — not corpus material.
3. The hunt targeted writers whose DEFAULT is uncompressed (FPDF/PHP,
   Prawn/Ruby): the **Prawn manual** (`https://prawnpdf.org/manual.pdf`,
   2,099,393 bytes, md5 `699ebcab…`) — 189 real streams, **182 raw**
   (130 content-like + 19 ToUnicode CMaps), pdftotext reads 83,632
   alnums / 972 CJK chars / polytonic Greek.
4. The corpus re-sourced with the r109-pinned md5s: 7/8 verified (LO
   Writer 7.6 still unavailable — the r107 verdict stands).

## The five defects (the full evidence chain in the remediation plan)

- **R110-A** — 182/189 streams declare NO `/Filter`; the best-effort
  inflate failed on every one → 0 chars extracted. THE FIX: the
  last-resort raw reading (undeclared + both inflates failed → the bytes
  ARE the content). The FIRST DRAFT (raw-first) broke 36 standing specs
  (the r95 undeclared-DEFLATED contract — the dict-stub fixtures) and
  was restructured in-round.
- **R110-B** — the DOTTED font names (`/F3.0`, `/F4.1`, `/F21.1` — two
  dots!) never bind under `F\w+`; the mixed-font pages misdecoded (the
  Jigmo CJK read as its latin1 code chars). THE FIX: the
  `F\w+(?:\.\w+)*` class at all five F-sites + the dot in the R108-B
  /Font-dict-region collector.
- **R110-C** — the glyph-table pages render the WinAnsi table under
  Helvetica `/Encoding /WinAnsiEncoding` with no ToUnicode; `<a1>` read
  ° (the Iosevka cmap first-covered) where pdftotext reads ¡. THE FIX:
  the `WIN_ANSI_CMAP` marker (latin1Printable's exact mapping — a NO-OP
  for uncovered atoms, a shadow for wrong coverings), the named-encoding
  doctrine's third member.
- **R110-D** — the code font's "space" is NBSP (0xCA→U+00A0); the R103-C
  census `/^\s+$/` counted NBSP runs → every stream joined its condGaps →
  the 14-em chart axis ticks fused ("100.0200.0300.0"). A magnitude
  threshold was REFUTED by measurement (the standing joins reach 41–74
  em). THE FIX: the census is SPACE-only (`/^ +$/`) — measured first:
  every standing member rides U+0020 (LO Calc 123,382 U+0020 vs 25 NBSP);
  Prawn is 530/530 NBSP, ZERO U+0020.
- **R110-E** — `parseToUnicode`'s base-offset pass ran globally over the
  bfrange block; ARRAY element triples (`<0020><20ac><1f55>`) re-matched
  as a range (lo=0x20, hi=0x20AC) and OVERWROTE the array's entries —
  the Greek demo read "ὗ὘Ὑ὚" where pdftotext reads "ὕαλον ϕαγεῖν". THE
  FIX: the base-offset pass runs on the array-free text.

## The TDD round

RED 6/6 at HEAD with leg-isolated fixtures (the B/C/D/E specs ride Flate
streams so each RED is its own defect; the B fixture orders the wrong
cmap FIRST — a wrong-order first draft read GREEN at HEAD and was
rebuilt) → GREEN **1073/1073** (1067 + 6 net new) → MUTATIONS: M1
(raw fallback removed) exactly 2 RED · M2-FULL (ALL binding sites) 1 ·
M3-FULL (BOTH marker pushes) 1 · M4 (census reverted) 1 · M5
(array-strip removed) 1. The M2/M3 single-site mutations read 0 RED
first (each fix has two redundant push paths) — the full reverts prove
the legs.

## The ground truth

All 7 standing members BYTE-IDENTICAL. The PRAWN member: **83,657
alnums = 100.03% of pdftotext** — every glyph class EXACT: CJK 972=972,
GreekExt 12=12, Greek 58=58, bullets 54=54, π 2=2, zero U+FFFD, the €
under the WinAnsi marker, the glyph table reads ¡ ¤ £ ¦, and the Greek
sentence reads ὕαλον ϕαγεῖν δύναμαι· τοῦτο οὔ με βλάπτει. The residual
+25 alnums: the documented reading-order/rotated-text classes (we read
13 whole "Rotated" samples where pdftotext reads 5 — a superset).

## The live UI verify (the r104 protocol)

A Prawn-shaped CV (raw streams, dotted names, an array-form CMap, the
WinAnsi glyph row, Greek + CJK + NBSP + 14-em ticks — 2,778 bytes, reads
EMPTY at HEAD) through the recruitment AI-CV-Upload tab on the
remediated standalone build → the stored cvText carries **ὕαλονϕ
更可怕的 ¡ 100.0 200.0 •••** with zero U+FFFD. The probes swept, the DB
pristine (0 candidates / 1 user, verified through Prisma).

## The mobile-nav pair (the user's named focus)

On the remediated build at 390×844 — **PARITY**: both sides 28×28
`lucide-panel-left` hamburger + 288×844 fixed z-50 drawer (REF 16 items,
Close `display:none`; clone 15, the a11y supersets); the menu cycle
`/training` — REF STILL-OPEN (the 69th's regression through its fifth
deploy), clone AUTO-CLOSED (the superset, pinned); `/employeedetail`
REF 66 nodes vs clone 248 (the standing hold). No Tailwind v4
regression — identical geometry both sides.

## The environment notes

- The documented DATABASE_URL trap struck again: an exported
  `DATABASE_URL=file:/home/z/my-project/db/custom.db` (outside the repo)
  overrode the `.env` and broke the seed/server — unset for every run
  (`env -u DATABASE_URL`).
- The standalone server requires a real AUTH_SECRET (≥16 chars) in
  production — set in the local `.env` (git-ignored) for the verify
  runs; the committed `.env.example` keeps the documented empty-string
  template.
- The r110 probe scripts ride the variable-path import (the R108-A
  lesson): the first draft's literal `.ts`-extension import broke tsc
  (TS5097) and was fixed in-round.

## Gates

lint 0/0 · tsc ✓ · **1073/1073 unit** (1067 + 6 net new) · build ✓
(116/116 static pages; env -u DATABASE_URL;
NODE_OPTIONS=--max-old-space-size=3072) · E2E the standing 559 net (the
detached node-spawn protocol — the fix rides the unit layer per the
r100/r102 documented split) · DB pristine. The evidence chain: 12 r110
PNGs (the byte-identical login probe, the REF + clone mobile-nav pair,
the desktop set, the Prawn-CV tab capture).
