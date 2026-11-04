# Remediation Plan — Session 125 / Parity Round 124

Five materials, all measured end-to-end through the patched-proto
experiments before any source change: **the mixed /W range arms** (R125-A —
the /W value capture is bracket-balanced and the bare number groups read
as the spec's `cfirst clast w` RANGE entries), **the known-zero advance**
(R125-B — a code the width table COVERS at 0 is a legitimate zero advance,
the .null-glyph class), **the /Contents-array text-state carry** (R125-C —
a mid-array stream that shows text before any Tf inherits the predecessor
stream's font state, the IRS pocket's cause), and **the Form XObject's own
resources** (R125-D — added in-round: the embedded-figure forms bind their
own /Resources /Font pairs; the candidate-chain misbind was corrupting
both the width tracking AND the ToUnicode decode). Plus the
genus-transfer leg (D-125a): the neo-crm s212 standalone bun-launch DB
re-anchor, verified against eon-hr's seam.

## The opening read (the 89th-deploy watch)

| Leg | Result |
| --- | --- |
| Login asset census | JS `index-6xnUqbWf` HELD · CSS `index-BVWWKVEJ` HELD — **no new deploy** (the 88th's state standing). The warm-token computed census: social button `rgb(15,14,14)`, or-chip `rgb(93,93,93)` 12px, h1 `rgb(15,23,42)`, input border `rgb(226,232,240)` — all byte-stable |
| Login capture (1280×800) | **BYTE-IDENTICAL to the r124 REF capture** (md5 `e04112c8`, 167,497 B — the render-stable standing state) |
| App-side assets | `index-C-IrDy5f.js` / `index-BGNH4KkS.css` — **QUIET, the r42 baseline holds** |
| Dashboard render (1280×800) | The REF capture byte-identical to the r124 capture (md5 `965b41b0`, 190,117 B); the clone pair captured on the remediated build |
| Mobile-nav pair (390×844, the user's named focus) | **PARITY** — both sides 28×28 hamburger + 288×844 fixed z-50 drawer (the visibility-filtered census; the hidden 256px z:10 desktop sidebar excluded); the menu cycle `/training`: REF STILL-OPEN (the 69th's regression standing through the 88th-deploy state — the assets held, no new deploy to move it), clone AUTO-CLOSED (the pinned superset); **no Tailwind v4 regression** |
| Patch watch | **QUIET** — `next@16.4.5` still latest; the lockfile current |
| Advisory census | unchanged: 2 vulnerabilities (1 high, 1 moderate) — deepmerge-ts dev-chain + minimatch, both dev-toolchain transitive, zero runtime exposure |
| neo-crm HEAD | `1b093de` → `b0bb8cd` — **session-212 SHIPPED a SRC change** (`838db00`: THE STANDALONE BUN-LAUNCH DB RE-ANCHOR — `src/lib/db-path.ts`, the launch-dir recovery hoisted out of the `isRelativeFileUrl(envFileUrl)` guard; the bun .env absolutization trap; the test-blind-spot genus) + `b0bb8cd` docs-only. **The genus transferred this round as D-125a** (measured below); the next-audit baseline `b0bb8cd` |
| Corpus pins | All members re-sourced (the fresh sandbox): arXiv 1,543,672 B · dvipdfmx 244,290 B (texdoc.org — the mirrors.ctan.org 404 again) · fontspec 528,597 B · IRS · QUARTZ md5 `27575d59` EXACT (the submodule trail `test-suite/documents/longer.pdf` in `xmlcalabash/test-suite`) · ReportLab md5 `0f64df85` EXACT · Prawn md5 `699ebcab` EXACT. Typst 0.15.1 re-installed; chromium-1248 re-installed; the 16 family members regenerated. Baseline gates reproducing the documented close: **lint 0/0 · tsc ✓ · 1179/1179 unit**; the drift ledger all-IDENTICAL at HEAD (ReportLab `880ec001` — the r124-cured pin); **16 family members EXACT** |

## MATERIAL 0 (D-125a) — the neo-crm s212 genus: the standalone bun-launch DB re-anchor

**The neo-crm defect (F-212a)**: `bun run start` (the standalone launch)
silently opened `<repo-parent>/db/custom.db` — bun auto-loads `.env` and
(the neo-crm environment) absolutizes the relative `file:` URL against the
.env's own directory; the standalone `chdir()` then defeats the
launch-dir recovery, which was dead code nested inside the
`isRelativeFileUrl(envFileUrl)` guard for 42 sessions.

**The eon-hr verification (the genus-transfer probe,
`scripts/r125-launch-verify.mjs`)**:

- **Leg A (the clean `.env`-only launch)**: PASS — the natural launch
  shape (bun + the `.env` auto-load + the standalone chdir + the traced
  `.next/standalone/.env` artifact) opens `<repo>/db/custom.db` (the
  seeded login succeeds, no phantom parent DB created). **eon-hr's seam
  already implements the hoisted shape**: `candidateRoots()` computes the
  standalone anchor UNCONDITIONALLY — the recovery is not nested inside
  any value-shape guard.
- **Leg B (the sandbox-exported absolute `DATABASE_URL`)**: the trap is
  LIVE but LOUD — the server boots, `/api/health` answers
  `{"status":"degraded","db":"down"}`, every API call fails INTERNAL; no
  phantom DB is created (the exported path's parent does not exist). The
  designed passthrough (absolute URLs pass untouched) + the documented
  operator rule ("unset it first").
- **The bun-version note**: bun 1.3.14 (this sandbox) loads `.env` values
  RAW (`file:../db/custom.db` — measured), NOT absolutized — the neo-crm
  absolutization shape does not reproduce here. The signature-defense
  (re-anchoring absolutized values by launch-dir signature) is DEFERRED as
  speculative-for-eon-hr: the committed `r125-launch-verify.mjs` probe is
  the standing guard — a future bun that absolutizes would fail Leg A
  loudly and land with measured evidence.

**The blind-spot closing (the born-green pin)**: the standing
`tests/db-path.test.ts` fixtures never model the REAL standalone artifact
shape — `.next/standalone/.env` EXISTS in the build (the file tracer
copies it; verified this round). A new describe pins the with-.env shape:
the traced `.env`'s presence is IRRELEVANT to the resolution (the anchor
order decides) — the test-blind-spot genus (a fixture that stops mirroring
the real artifact) closed in the born-green direction.

## MATERIAL 1 (R125-A) — the mixed /W range arms + the bracket-balanced capture

**The anatomy** (the instrumented blindness-cause walk on arXiv): 39 of
the 55 `w<=0` blind events ride the Font2 class — the Calibri descendant
(obj 366) carrying the MIXED /W array:

```
/W [ 0 [ 506 0 0 226 578 ] 5 12 0 13 [ 533 0 615 0 488 ] 18 22 0 … 191 221 0 222 223 498 ]
```

The spec's two entry forms interleaved: array entries (`c [w1 … wn]` —
CIDs c..c+n−1) and RANGE entries (`cfirst clast w` — CIDs cfirst..clast,
INCLUDING the w=0 gap-ranges `5 12 0` = CIDs 5–12 at width 0). **TWO
stacked defects**: (a) the /W value capture `\[([^\]]*)\]` TRUNCATED at
the first `]` (the leading entry's closer) — the map kept only the `0 [
506 0 0 226 578 ]` fragment, every later entry and arm silently dropped
to /DW; (b) the bracket-walk read the bare number groups as PAIRS —
`5 12 0 13 [` → pair(5,12), pair(0,13), the bracket skipped, the array's
widths read as more pairs — the real widths interleaving as fake CIDs.

**The fire-separation census** (bracket-balanced, the CIDFont-dict scan):
the TRUE mixed form (array entries + ≥1 bare 3-number range group) rides
**arXiv (14) + fpdf2 control (1)** — the fpdf2 form
`0 [ 0 556 ] 2 4 611 5 [ 667 889 … ] 13 16 667 17 […]` carries the same
range arms. WeasyPrint's /W arrays are PURE array-entry forms (the
earlier "mixed" flags were regex artifacts — the capture ran past the
array into the next objects); dvipdfmx/fontspec/IRS/QUARTZ/ReportLab/
Prawn/Typst/Skia: zero.

**The cure (two arms)**: (a) the /W value capture is BRACKET-BALANCED (a
depth walk from the `/W [` to its matching `]`), sliced AFTER the opening
bracket so the pure-number forms keep the validated no-bracket readings
(the R121-A/R124-B paths verbatim — the in-round discovery: a capture
including the leading `[` routed EVERY inline /W through the bracket walk,
bypassing the pure-pair self-rejection guards); (b) in the bracket-walk,
a number NOT followed by `[` consumes THREE tokens as the range
`cfirst clast w` (CIDs cfirst..clast at w — including w=0, the legitimate
gap class); a trailing 2-number group keeps the pair reading (the graceful
tail). The pure-pair /W (no brackets at all) never enters this walk — the
standing pairs members keep their parse verbatim (the structural
disjointness).

## MATERIAL 2 (R125-B) — the known-zero advance

**The anatomy**: the advance guard `w === undefined || w <= 0` conflates
two distinct signals: (a) a code the table does NOT cover (an unknown
width — the conservative blind signal, the R117-A doctrine) and (b) a
code the table COVERS at width 0 (a KNOWN zero advance — the .null-glyph
class: the Calibri array's `0 [ 506 0 0 226 578 ]` puts CIDs 1–2 at 0
legitimately; the arXiv f-0-0 subsets zero-out gap codes the content
nonetheless shows — 16 measured events). Case (b) is not blindness: the
pen does not advance, the block keeps tracking.

**The cure**: `const hit = we.map.get(c); const w = hit ?? we.def;` —
blind only when `w === undefined || w < 0 || (hit === undefined && w <=
0)`. A map-hit 0 advances 0; a map-miss with a positive /DW or
/MissingWidth default advances the default; a map-miss with no positive
default stays blind (the standing guard verbatim).

## MATERIAL 3 (R125-C) — the /Contents-array text-state carry

**The anatomy** (the instrumented walk on IRS): all 108 fontless blind
pieces live in the mid-array streams of page 2403's
`/Contents[2405 0 R 2406 0 R 2407 0 R 2408 0 R 2409 0 R 2410 0 R 2411 0
R 2412 0 R]` — an 8-stream array (ISO 32000-1 §7.7.4: the streams process
AS-IF-CONCATENATED; the text state persists across the boundaries).
Stream 2407's FIRST text run (`8 0 0 8 110 526.538 Tm (If treating…)Tj`
+ the per-glyph `name (see instructions…)` run) carries NO Tf — the font
state inherits from stream 2406's LAST Tf (`/T1_0 1 Tf`). The walker
walks each stream independently (`curFont = ""` at each start) → the
pieces carry `font: ""` → `widthFor(undefined)` → `no-table` → the whole
block blind.

**The fire-separation census**: the /Contents-array form rides arXiv (1
page) + IRS (1 page); the Tf-less-first-show streams ride **IRS alone**
(4 streams — 2407/2409/2410/2411; arXiv's array streams all set their Tf
before any show). The cure is IRS-exclusive by construction.

**The cure**: `contentsPrev` maps each array member to its immediate
predecessor (built during the page scan); `pdfTextPieces` gains an
optional carry parameter (the initial `curFont/effSize/curTw/curTz`,
written back at the walk's end); the stream walk threads the predecessor's
recorded final state into each array member's walk. A stream whose
predecessor was not walked (skipped by the gates) keeps the fresh-state
default — the standing behavior.

**The measured cure** (the final source — A+B+C+D): IRS bx coverage
**94.7% → 100.0%** with the OUTPUT **IDENTICAL** (the zero-drift un-blinding
class — the pieces were already in the stream, only the bx tracking was
missing); arXiv bx **99.2% → 99.9%** (21321 → 21485 of 21503; the residual
18 = the odd-byte pieces + the genuinely-outside codes, the conservative
blind signal standing); ReportLab 100.0% held; the other 10 members
IDENTICAL except fontspec (TOWARD — the R125-D decode corrections); **all
16 family members EXACT** (the mixed-/W cure held fpdf2 and WeasyPrint —
their corrected width tables crossed no line-grouping threshold).

**The arXiv drift classified** (the difflib discipline, the FINAL source
with R125-D): the word-stream similarity **TOWARD** (0.7357 → 0.7359
autojunk=False), alnums exact (70,646), the line-form aggregate
**IDENTICAL** (0.1172 → 0.1172 — the experiment's intermediate state
without R125-D showed 14 false-split hunks; the form binding's real Arial
widths restore the flowing tracked end and the splits vanish) — 3 hunks,
all decode corrections ("New aork" → "New York", "aou can visit" → "You
can visit" — the wrong-CMap garbage class, matching pdftotext's exact
reading).

## MATERIAL 4 (R125-D — added in-round) — the Form XObject's own resources

**The anatomy** (surfaced by the R125-A experiment's false column splits):
the arXiv PTEX figure PDFs (the LaTeX `\includegraphics` class — obj 628
`continual_7B_generation.pdf`, obj 764 `pretraining_7B_generation.pdf`,
the `/Im10`-class Form XObjects) carry their OWN
`/Resources << /Font << /Font0 798 0 R /Font1 799 0 R … >> >>` — but
their content streams walk as candidates with NO page binding (they are
referenced from the parent's /XObject subdict, not any page's /Contents).
The widthFor's candidate chain resolved `/Font1` to the FIRST same-named
font in file order — obj 358, a DIFFERENT form's Calibri-Bold subset —
while the pieces' real font is the ArialMT subset (@799/@829/@1010). The
misbind corrupted BOTH:

- **the width tracking**: the codes fell on the wrong font's /W zero
  arms — the tracked end severely under-advanced (24 glyphs → 15.5pt
  instead of ~96pt) — the block-boundary gap inflated past the 2.5-em
  upgrade band — FALSE column splits ("The capital of Egypt is" /
  "Egyptian Egyptian…", 14 hunks, line-form 0.1172 → 0.1164 AWAY);
- **the ToUnicode decode**: the pieces decoded through the WRONG font's
  CMap — a STANDING garbage-decode on fontspec (7 hunks: "Utfiight SMALL
  JAPS" → the truth "Upright SMALL CAPS"; "harj po find" → "hard to
  find"; "flqkR text Wqfi our R•ample" → "Some text for our example";
  "USE TR!IKING FOR QISPL!Y I!PS TEXT" → "USE TRACKING FOR DISPLAY CAPS
  TEXT") and on arXiv ("New aork" → "New York", "aou can visit" → "You
  can visit") — every hunk matching pdftotext's exact reading.

**The cure**: in the object scan's non-page branch, a Form XObject
(`/Subtype /Form`) carrying an inline /Resources /Font region binds ITS
OWN object number in pageFonts — the form's own pairs are its stream's
REAL bindings, exactly like a page's own (the R105-C genus extended to
forms). Stream objects never ride ObjStms (PDF §7.5), so the raw-site
cure covers every form.

**The measured cure**: the arXiv false splits GONE (the line-form
aggregate back to IDENTICAL 0.1172, the word-stream TOWARD +0.0002
autojunk=False, alnums exact, the 3 decode corrections); fontspec's 7
hunks exact-corrected (word-stream TOWARD +0.0002 autojunk=False,
delete/insert −4 — the alnum pin moves 106179 → 106183 with the
corrections' net content, every hunk matching pdftotext); every other
member IDENTICAL; the 16 family members EXACT.

**The in-round trap (the autojunk artifact)**: the difflib word-stream
similarity with default autojunk read fontspec 0.903 → 0.9016 (AWAY) —
the autojunk heuristic's frequency-junking shifted when the corrected
words changed the profile; with `autojunk=False` the true verdict is
0.9047 → 0.9049 TOWARD. Classify with autojunk=False (or per-hunk
evidence) when corrections change word frequencies.

## The r126 queue (armed by this round's measurement)

- The arXiv residual 18-piece pocket: the odd-byte pieces (7 Font2 + 2
  Font1 + 2 Font3 — odd-length raws under codeLen-2) + the
  genuinely-outside codes (the f-0-0 'z' class on the 292/566 subsets —
  codes beyond /LastChar with no /MissingWidth)
- The Typst sub-em residuals (~0.25 em — the kern accumulation class;
  output-neutral today, a precision hunt)
- The standing watches (the REF stay-open drawer through its 20th+ deploy;
  the neo-crm s213+ layer — baseline `b0bb8cd`; the LO Calc re-source; the
  advisory census; the next patch watch; the bun .env-absolutization watch
  — Leg A of the launch-verify probe)

## The ToDo list (the round as executed)

- [x] The opening read: the 89th-deploy watch (render-stable — the login
      pair BYTE-IDENTICAL both sides; the assets all HELD; the mobile-nav
      pair PARITY with the visibility-filtered census) · the audit legs
      (neo-crm s212 SRC-shipped — the genus transferred; advisory
      unchanged; patch quiet)
- [x] The corpus re-sourced and verified at HEAD (all pins; the drift
      ledger all-IDENTICAL; the 16 family members EXACT; the baseline
      gates 1179/1179)
- [x] The genus-transfer leg (D-125a): the launch-shape probe measured
      (Leg A PASS — the seam already hoisted; Leg B the loud trap); the
      launch-verify script committed as the standing guard
- [x] The hunt: the blind-pocket anatomies measured end-to-end (the
      instrumented blindness-cause walk; the fire-separation censuses —
      the mixed-/W bracket-balanced census, the /Contents-array census,
      the Tf-less-stream census; the patched-proto experiment with the
      drift ledger + family checks + the toward/away classification)
- [x] The TDD round: RED 3/3 (the mixed-/W range arm · the known-zero
      advance · the Contents-array carry — the pure-array guard RED at HEAD
      too via the truncation) + RED 1/1 in-round (the R125-D form-binding
      misbind, demonstrated RED-then-GREEN by source revert) + the D-125a
      born-green launch pins (3) + the fire-separation guards → the cures
      in `src/lib/cv-text.ts` → GREEN 1189/1189 (1179 + 10)
- [x] The mutation matrix EXACT (`scripts/r125-mutations.py`): M1 [the
      bare-group range reading reverted] 1 · M2 [the /W capture
      bracket-balance dropped] 2 · M3 [the known-zero refinement
      reverted] 1 · M4 [the carry init dropped] 1 · M5 [the form
      own-resources binding dropped] 1 · M6 [the carry write-back
      dropped] 1 — the M1 first run's 9-kill mismatch exposed the
      leading-bracket capture bug (the no-bracket branch bypassed), fixed
      in-round (the slice moves AFTER the opening bracket)
- [x] The drift ledger + family checks on the FINAL source (the members
      IDENTICAL except arXiv `1c189607` / fontspec `9366f8a9` both TOWARD;
      the 16 family members EXACT; bx: IRS 100.0% · arXiv 99.9% ·
      ReportLab 100.0%)
- [ ] The full gate chain: lint 0/0 · tsc ✓ · unit · build ✓ · E2E (the
      3-chunk split) · DB pristine · the live UI verify (the r104
      protocol)
- [ ] The screenshots (docs/screenshots/) on the REMEDIATED build
- [ ] The docs layer (this plan + the session_295 narrative + the AGENTS
      session-125 layer + the SKILL v4.12.0 §137 + the count lockstep +
      the worklog round-124 entry with the r126 queue armed)
- [ ] Commit + push to main via the SSH wrapper [the round's final step]
