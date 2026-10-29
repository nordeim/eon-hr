# Remediation Plan — Session 107 / Parity Round 106

The round that took the Tz/Ts watch to the real files: the queue's named
CV-flow item is REFUTED by measurement (zero `Tz`/`Ts`/`Tc`/`Tw` operators
across ALL SIX corpus members — 1,034 content streams in the LibreOffice
guides alone), and the re-sourcing of the LO guides for the census found the
round's REAL defect: **the LO display-tracking class** — the Calc guide's
cover title extracts as letter-split soup ("C a l c   G u i d e" /
"W o r k i n g   W i t h   S p r e a d s h e e t s") because LibreOffice's
display typography kerns (−113..−154 thousandths, measured) fire the
`kern ≤ −100` word-gap rule between every letter. The 71st-deploy watch
read QUIET on both sides; the mobile-nav pair PARITY byte-identical to the
r106-verified captures. Two doctrine transfers land from the neo-crm
session-195..198 layer (the drawer-open spine freeze; the advisories
census), and the corpus pins re-anchor to the re-sourced builds.

## The opening read (the standing ladder — the 70th state, no 71st deploy)

| Leg | Result |
| --- | --- |
| Login asset census | JS `index-C8D2zqWd`, CSS `index-CZZ4z0cl` — **UNCHANGED from the 70th state → NO 71st deploy** |
| Login render | The fresh capture at the VERIFIED 1440×900 viewport **BYTE-IDENTICAL** to the standing `69aa4241…` baseline |
| App-side assets | `index-C-IrDy5f` / `index-BGNH4KkS` — **QUIET, the r42 baseline holds** |
| Mobile-nav pair (390×844, the user's named focus) | **PARITY — all four fresh captures BYTE-IDENTICAL to the r106-verified pair** (the VLM pixel-parity verification inherited member-for-member): both sides 28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer; the REF 16 items (Close button `display:none`), the clone 15 items (the a11y supersets) |
| The drawer watch (third read) | REF `/training` + **STILL-OPEN** (the 70th state persists — no new deploy, the same behavior state); the clone keeps the AUTO-CLOSED superset (pinned by tests/e2e/mobile-navigation.spec.ts) |
| The REF-broken mobile set | `/employeedetail` the empty shell (66 nodes vs the clone's 248) — HOLDS |
| Tailwind v4 scans | The mobile band clean — no regression (the byte-identical captures are the strongest form) |
| Baseline gates | lint 0/0 · tsc ✓ · **1051/1051 unit** — the session-106 close re-verified on the pulled tree |

## The audit (the session-106 changes re-read + the queue measured)

The R106-A three legs re-read in full (the `contentsRefs` helper, the ObjStm
`objFonts` feed, the post-walk `pendingRes` resolution — all correctly
implemented and consumed at assembly). The queue taken to the real files:

- **The non-default `Tz`/`Ts` — REFUTED by measurement.** The census
  (`scripts/r107-tzts-census.mjs`) walks every corpus member's decompressed
  content streams: IRS 84, arXiv 65, dvipdfmx 51, fontspec 114, LO Writer
  489, LO Calc 545 — **ZERO `Tz`, `Ts`, `Tc`, or `Tw` operators of ANY
  value** (not even default-value writes). No real writer in the
  12-writer-corpus emits them. The watch closes as NO-LIVE-TARGET (re-opens
  only when a real file carrying them surfaces).
- **The corpus re-sourcing (the LO guides re-downloaded)**: the Calc 7.0
  guide (11.4MB, PDF 1.6) + the Writer 7.6 guide (20.4MB, PDF 1.7) — the
  LO guides lost in the r103 workspace reset are back. Two documentation-
  accuracy findings: **(1)** the current Calc download reads **695,014
  alnums — IDENTICAL through the r102-era code and HEAD** (the code path
  stable through r103..r106; the old 691,268 pin was a DIFFERENT build of
  the same guide — the site re-serves a regenerated file); **(2)** the
  current fontspec.pdf (the r106 session's own re-download, md5
  `752e9929…`) reads **106,179 alnums at HEAD and 106,188 through the
  M1-reverted pre-fix code** — the r106-documented "101,529 → 101,515" was
  measured on the DELETED FIRST download (a different build of the same
  v2.9h); the member-level cure ("Font selection" where "Dont selection"
  stood) reproduces exactly on the surviving file. The pins re-anchor to
  the measured current-build values with the file md5s recorded.
- **The Quartz 13th-writer hunt**: not sourceable again (the search round
  bot-walled or non-PDF) — stays a WATCH, third round running.

## THE ROUND'S FINDINGS (empirically verified before the fix)

### R107-A — the LO display-tracking class (THE round's fix)

The re-sourced Calc guide's cover extracts as letter-split soup. The
measured mechanism (`scripts/r107-stream-2836-trace.mjs` +
`r107-f15-decode.mjs` + `r107-f14-decode.mjs`): the cover's F14 26pt title
and 20pt subtitle are TJ arrays of single-CID hex atoms with a kern between
EVERY consecutive pair — `…<01>-116<02>-116<03>-113<04>-116<05>-…` — the
display typography's uniform tracking (−113..−154), with the WORD gaps
carried by space-GLYPH atoms (`<05>` decodes to " " through the font's
ToUnicode). The walk's `kern ≤ -100 → word gap` rule (calibrated on
pdfTeX's body-size interword glue) fires between every letter:
**"C a l c   G u i d e"** where pdftotext reads **"Calc Guide"**.

The naive fix — making band kerns conditional in space-glyph streams — is
**REFUTED by the prototype** (`scripts/r107-prototype-diff.ts`): it joins
xdvipdfmx's real interword glue (fontspec L1277 fuses
"anyeffectontextinthisfont…", where pdftotext reads the words spaced) and
pdfTeX's math thin-spaces (arXiv "J(X; Y; t)" → "J(X;Y;t)", where pdftotext
reads the spaces). The band (−200,−100] is NOT a clean LO band — three
writer families share it.

**THE DISCRIMINATOR (measured per-array)**: the display-tracking SIGNATURE
— a TJ array where [1] EVERY consecutive atom pair carries a kern, [2] ALL
the kerns fall in (−200,−100], [3] ALL the atoms are single-glyph
(single-CID hex or single-char literal), and [4] the atom count ≥ 4.
Measured against every band-carrying array in the corpus: the LO title
(10 atoms, 9 kerns, −113..−116) and subtitle (25 atoms, 24 kerns,
−136..−154) are the ONLY members that satisfy all four conditions. The
fontspec interword-glue arrays ride multi-CID word chunks (condition 3
fails); the arXiv math arrays are 2–3 atoms or coverage-broken by +26
kerns (conditions 1/4 fail); the R97 fixture's −120 rides multi-char
literals (condition 3 fails); the pdfTeX −322 glue is ≤ −200 (condition 2
fails). **THE FIX**: a per-TJ-array pre-scan; when the signature holds,
the array's kerns are TRACKING (pendingEm 0 — the atoms join, the space
glyphs carry the word separation); every other shape keeps the standing
rules verbatim.

Expected real-file outcome: the Calc guide's cover reads "Calc Guide" /
"Working With Spreadsheets" (exactly 2 extraction lines change — the
prototype's member diff); every other corpus member BYTE-IDENTICAL.

### R107-B — the third page-form blind spot: the referenced /Font dict

The cover page's resource shape (measured by `r107-f14-decode.mjs`): the
page carries `/Resources << /Font 4234 0 R >>` — INLINE resources whose
/Font VALUE is a REFERENCE to the font dict object (4234 =
`<< /F14 4193 0 R /F15 4188 0 R /F3 4208 0 R >>`). The R105-C/R106-A page
chain handles (a) inline font dicts and (b) referenced /Resources — but
NOT (c) the referenced-/Font-inside-inline-/Resources form. Worse, the
F-pair regex `\/(F\w+)\s+(\d+)\s+0\s+R/` captures the dict KEY "Font" as a
font name ("Font"→4234), which (i) stores a USELESS map in `pageFonts` for
form-(c) pages and (ii) makes the `objFonts` feed store the false
{Font:4234} map for the RESOURCES objects of the 545 referenced-resources
pages — blocking the pendingRes resolution from ever reaching the real
font dict. Benign in the current corpus (every F-name has exactly ONE
candidate — no theft possible), but a live vector for the R102-B
multi-candidate class. **THE FIX, three legs**: [1] the "Font" key
exclusion in every F-pair collector (a font named exactly "Font" is always
the dict key — no writer selects `/Font 12 Tf`); [2] the `fontRefOf` link
map — a body carrying `/Font N 0 R` records objNum→N; [3] the two-hop
resolution — `pendingRes` follows the link when the direct `objFonts`
lookup misses, and form-(c) pages queue a `pendingFontRef` resolved
post-walk the same way. Expected real-file outcome: ZERO drift (the page
maps bind the same objects the candidate chain already resolves).

### R107-C — the drawer-open spine freeze (the neo-crm s196 doctrine transfer)

The neo-crm session-196 round froze its drawer-open spine at the box level
after finding that its standing battery would stay green through a
computed-margin regression. The eon-hr gap is the same shape: the mobile
spec pins the drawer's width (288), height stability, and the item rhythm
— but NOT the interior spine boxes. The measured ledger at TRUE 390×844
(`scripts/r107-spine-measure.mjs`): sheet 0,0,288,844 · the brand header
block 0,0,287,89 (h2 "EonHR" 76,25,187,23 · p "Demo" 76,47,187,16) · the
nav scroll block 0,89,287,634 (the "Main Menu" label 20,109,247,32 · the
UL 20,141,247,516) · the footer block 0,723,287,121 (the user button
16,792,255,36). **THE FIX**: the born-green e2e registration (the
`expect.poll` starved-read idiom on the box reads) freezing the spine.
Mutation-proven by the planted `mb-2` regression (the s177 defect's exact
shape — the header box shifts, the pin REDs at exactly the shifted box).

### R107-D — the advisories census (the neo-crm s198 doctrine transfer)

`bun audit` reads **2 high**: [1] `zod@4.6.5` nested inside
`eslint-plugin-react-hooks` (GHSA-mrhx-c7xc-m3w5 — the direct runtime
zod@4.6.7 is NOT vulnerable; the nested copy is lint-time-only, validating
static lint configs — never user input, never runtime); [2]
`deepmerge-ts@7.1.5` inside `@prisma/config` (GHSA-ggr8-5vv4-36mx — the
Prisma CLI's config merger at db:push/migrate time; developer-controlled
input only). **THE FIX**: the zod override — `overrides.zod = "^4.6.7"` in
package.json (a patch bump satisfying the plugin's `^3.25.0 || ^4.0.0`
range; cleans the audit to the deepmerge-ts-only state); deepmerge-ts is
DOCUMENTED as the accepted dev-chain advisory (the v8 override crosses a
major version onto the Prisma CLI's internals — the override risk exceeds
the advisory's zero reachability; the Prisma upstream bump is the watch).

## The TDD plan (RED → GREEN → mutation-proof)

**RED specs (written first, all failing):**

1. `tests/unit/cv-text.test.ts` — R107-A spec 1 (the display-tracking
   form, mirrored from the measured cover): a hex font whose CMap maps
   01→C, 02→a, 03→l, 04→c, 05→" ", 06→G, 07→u, 08→i, 09→d, 0A→e + a TJ
   array of single-CID atoms with a −113..−116 kern between EVERY pair
   (≥4 atoms) + guard-clearing body text → the extraction reads
   "Calc Guide" (never "C a l c   G u i d e").
2. `tests/unit/cv-text.test.ts` — R107-B spec 1 (the form-(c) page): the
   page carries `/Resources << /Font 20 0 R >>`; obj 20 is the font dict
   (/F1 → fontObj → ToUnicode); a decoy /F1 pair sits EARLIER in file
   order; the page's atoms read "Font" through the page's OWN map (the
   deferred pendingFontRef), not the decoy's "Dont".
3. `tests/unit/cv-text.test.ts` — R107-B spec 2 (the two-hop form): the
   page carries `/Resources 30 0 R`; obj 30 = `<< /Font 20 0 R >>`; obj 20
   = the font dict; the decoy earlier still; the page's atoms read
   "Font" through the resolved two-hop chain.

**Born-green guards (the over-fix guards, run in the mutation matrix):**

4. R107-A guard 1 (the xdvipdfmx form): a TJ array of MULTI-CID hex word
   chunks with −198/−199 kerns between every pair → the gaps KEEP their
   spaces (fontspec's interword glue never joins).
5. R107-A guard 2 (the pdfTeX math form): 2-atom `(;)-167(Y)` and 3-atom
   `(a)-161(b)-161(c)` arrays → the thin-spaces keep their gaps.

**Mutation proof (the r105/r106 protocol):**

- M1: the display-join reverted (the signature check disabled) → spec 1
  RED only.
- M2: the single-glyph condition removed → guard 1 RED only.
- M3: the atom-count gate removed → guard 2 RED only.
- M4: the pendingFontRef queue removed → spec 2 RED only.
- M5: the fontRefOf link resolution removed → spec 3 RED only.
- M6 (e2e): the planted `mb-2` on the drawer's brand header → the spine
  pin RED exactly at the header box.

**Gates:** lint 0/0 · tsc ✓ · unit (1051 + 3 net new = 1054) · `env -u
DATABASE_URL` build (NODE_OPTIONS=--max-old-space-size=3072, the dev
server killed first) · E2E (558 standing + 1 spine leg = 559) + the
mobile-nav pair re-verified on the remediated build + `bun audit` at the
deepmerge-ts-only state.

## Verification legs

1. The unit RED→GREEN + the mutation matrix M1–M6.
2. The real-file ground truth: the corpus member diff — IRS 5,871 /
   arXiv 67,744 / dvipdfmx 61,437 / fontspec 106,179 / lo-writer 646,207
   all BYTE-IDENTICAL through the fix; lo-calc 695,014 with EXACTLY the
   two cover lines cured ("Calc Guide" / "Working With Spreadsheets" —
   matching pdftotext member-for-member); the R107-B drift-free assertion
   (zero additional lines change).
3. The e2e spine leg born-green + the M6 mutation proof.
4. The final E2E gate ALONE (the detached node-spawn protocol).
5. The mobile-nav pair (REF + LOC) re-verified on the remediated :3200
   build — the auto-close superset intact, no Tailwind v4 regression.

## Execution appendix (filled at close)

- **RED:** 3/3 as designed — spec 1 (the display form) failing with the
  EXACT real-file signature 'C a l c   G u i d e' (the fixture mirrored
  from the measured cover: 1-byte hex codes, the −113..−116 tracking
  kerns between every pair, the space glyph carrying the word gap); specs
  2+3 (the two /Font-ref page forms) failing with the chain-theft
  signature 'qwzv xjkjqvwwz…' (the wrong letters still alnums — the
  fixture-guard honesty rule held on both sides of every mutation). TWO
  born-green guards (the xdvipdfmx multi-CID form, the pdfTeX 2–3-atom
  math form) — one fixture repair along the way (the math guard's
  2-atom `(;) -167 (Y)` form must ride INSIDE a TJ array: a bare
  `(;)` not operator-adjacent is dropped by the ops regex entirely —
  a real-form correction, not a workaround) and one code-collision
  repair (the space glyph's code colliding with a letter's code in the
  display fixture — the G decoded as a space).
- **GREEN:** 1056/1056 (1051 + 5 net new) — R107-A's per-array pre-scan
  + the `!displayTracked` guard on the pendingEm assignment; R107-B's
  three legs (the "Font" key exclusion across all five F-pair collectors,
  the fontRefOf links, the pendingFontRef queue + the two-hop pendingRes
  resolution).
- **Mutation matrix:** M1 (the display-join neutralized) → exactly 1 RED
  (spec 1) · M2 (the single-glyph condition removed) → exactly 1 RED
  (the multi-CID guard — the fontspec form would fuse) · M3 (the
  atom-count gate removed) → exactly 1 RED (the math guard) · M4 (the
  pendingFontRef resolution removed) → exactly 1 RED (the cover form) ·
  M5 (the two-hop link removed) → exactly 1 RED (the 545-page form) —
  every mutation bites exactly its own spec; the restored file
  re-verified byte-clean (md5 `763d76f4…`) + the M1 recheck on the
  final (type-refactored) code.
- **The real-file ground truth (the member diff — HEAD's extractor vs
  the remediated one):** IRS 5,871 · arXiv 67,744 · dvipdfmx 61,437 ·
  fontspec 106,179 · LO Writer 646,207 — ALL BYTE-IDENTICAL; **LO Calc
  695,014 with EXACTLY the two cover lines cured** ("Calc Guide" /
  "Working With Spreadsheets", matching pdftotext member-for-member,
  the alnum pin unchanged). The corpus pins re-anchored with the file
  md5s recorded (fontspec `752e9929…`, lo-calc `dbb10a2b…`).
- **R107-C:** the spine leg born-green on the measured ledger; the M6
  mutation proof (the planted `mb-2` on the drawer's brand header → the
  pin RED exactly at the header box) — see the E2E evidence below.
- **R107-D:** `overrides.zod = "^4.6.7"` + the stale nested sweep;
  `bun audit` reads the deepmerge-ts-only state (the documented dev-chain
  acceptance — the v8 override would cross a major onto the Prisma CLI's
  internals).
- **Gates:** lint 0/0 · tsc ✓ · 1056/1056 unit · build ✓ (env -u
  DATABASE_URL; NODE_OPTIONS=--max-old-space-size=3072; the dev server
  killed by the port holder first) · E2E 559/559 (558 standing + the
  spine leg) via the detached node-spawn protocol.
- **Docs lockstep:** the plan (this file) · session_244 (narrative) +
  session_245 (transcript) · the AGENTS session-107 layer · SKILL v3.94.0
  + §119 (structure over magnitude, the pin-vs-build identity, the stale
  nested override copy) · the CLAUDE/README/AGENTS count lockstep (1056
  + 559 = 1615) · the worklog round-106 entry · `.env.example` verified
  unchanged (only DATABASE_URL + AUTH_SECRET are read).
