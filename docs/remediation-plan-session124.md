# Remediation Plan — Session 124 / Parity Round 123

Two materials, both measured end-to-end before any code: **the indirect
/Font dictionary resolution** (R124-A — the ReportLab blind pocket's
completion: the page's `/Font` itself rides an indirect ref that a false
F-prefixed pair silently suppresses) and **the odd-length /W
pair-invalidity** (R124-B — the R121-A range-triple reading's guard
misfire on 3-token arrays, the arXiv F5 class). The standing watches all
measured quiet.

## The opening read (the 88th-deploy watch)

| Leg | Result |
| --- | --- |
| Login asset census | JS `index-CCUlq8S3` → `index-6xnUqbWf` CHURNED, the CSS `index-BVWWKVEJ` HELD (the JS-only churn form). The computed census: **RENDER-STABLE** — the island intact, every warm token byte-stable (social text `rgb(15,14,14)`, or-chip `rgb(93,93,93)` 12px/500 tracking 0.6px, h1 slate-900, inputs slate-200, the Google label span 164.3px on the Wix Madefor Text, the webfont `loaded`). The login capture **BYTE-IDENTICAL** to the r123 REF capture (md5 `e04112c8` — an attempted "social border changed" flag was REFUTED as a wrapper-vs-button measurement artifact: a byte-identical render cannot change a border) |
| App-side assets | `index-C-IrDy5f.js` / `index-BGNH4KkS.css` — **QUIET, the r42 baseline holds** |
| Dashboard render (1280×800) | **1 pixel in 1,024,000** — parity; the capture **BYTE-IDENTICAL** to the r123 REF capture (md5 `965b41b0`) |
| Mobile-nav pair (390×844, the user's named focus) | **PARITY** — both sides 28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer (the clone census re-verified with the display-visibility filter — the first probe read the hidden 256px desktop sidebar, z-10, the same measurement-artifact class as the login flag); the menu cycle `/training`: REF STILL-OPEN (the 69th's regression through its **NINETEENTH** deploy — the drawer at x:0, transform none, opacity 1 after the navigation), clone AUTO-CLOSED (the drawer fully unmounted, the pinned superset); **no Tailwind v4 regression** |
| Patch watch | **QUIET** — `next@16.4.5` still latest; the lockfile holds 16.4.5 (the r123 bump current) |
| Advisory census | unchanged: deepmerge-ts dev-chain high + minimatch moderate, both dev-toolchain transitive, zero runtime exposure (`bun audit` 2 vulns) |
| neo-crm HEAD | `e21269a` → `1b093de` — **DOCS-ONLY** (the session_445 transcript of the already-studied s211 login semi-island round; zero `src/` changes). **No s212+ layer to transfer**; the next-audit baseline is `1b093de` |
| Corpus pins | All 7 members re-verified at HEAD: ReportLab `0f64df85` EXACT · Prawn `699ebcab` EXACT · QUARTZ `27575d59` EXACT · arXiv 1,543,672 bytes EXACT · dvipdfmx 244,290 bytes (the texdoc.org form) · fontspec · IRS. The drift ledger: 6 IDENTICAL + ReportLab at the r123-cured state, every alnum pin exact. The **16 family members ALL EXACT** (the /tmp corpus survived the recycle — no re-source needed this round) |

## MATERIAL 1 — R124-A: the indirect /Font dictionary resolution

**The anatomy** (the piece-census + the instrumented blindness-cause walk,
measured on the re-verified ReportLab member): 103 root blindness sites →
546 blind pieces (bx coverage 95.6%), every one the `no-table` cause, the
pieces' parts carrying a pageMap whose ONLY key is `FormXob.<32-hex>` —
an XObject resource name. The decoded page form:

```
<< /Contents 496 0 R /MediaBox [...] /Parent 495 0 R
   /Resources << /Font 1 0 R /ProcSet [...] /XObject << /FormXob.2740… 5 0 R >> >> >>
```

The page's `/Font` value is ITSELF an indirect ref — `/Font 1 0 R` — and
object 1 is the shared pure pair dict `<< /F1 2 0 R /F2 3 0 R … /F20+0
383 0 R /F21+0 387 0 R … >>` (all 135 pages reference it; zero inline
`/Font << … >>` dicts in the file). The walker's page scan fills its
`fonts` map from the F-pattern `/([Ff]\w+(?:\.\w+)*)\s+(\d+)\s+0\s+R/` —
and the XObject entry's name **`FormXob.<hex>` starts with F**, so the
false pair `{FormXob.2740…: 5}` makes `fonts.size` truthy and the
`else if (fontRef !== null) pendingFontRef.push(…)` branch (the R107-B
shape-(a) resolution) NEVER FIRES. The pageMap binds the XObject name,
every real font lookup fails the "pageMap exists but lacks this font"
misbind guard, and the whole page's blocks go width-blind.

**The fire-separation census** (the indirect `/Font N 0 R` form across
the corpus + the families): ReportLab **135 refs — the ONLY member that
carries the form** (zero on the other 6 members and the 16 family
members; zero inside the IRS/arXiv ObjStm bodies). The cure is
ReportLab-exclusive by construction.

**The cure**: at BOTH page-scan sites (the raw pass and the ObjStm pass),
the branch chain restructures so the `pendingFontRef` queue fires
WHENEVER the page carries the indirect form — the direct-pairs map still
lands first (the standing behavior for the false pair's harmless entry —
no Tf ever names it), and the post-walk resolution REPLACES the map for
those content refs (the R107-B replace semantics — the fontRef target's
pairs are the page's REAL bindings; any F-pairs in the page body are
XObject subdict noise when the /Font value is a reference). The
`/Resources R 0 R` referenced-resources queue keeps its exact standing
gating (only when no direct pairs — the lo-calc precedence preserved).

**The measured cure** (the patched-proto experiment): ReportLab bx
coverage **95.6% → 100.0%** (12432/12432 — every positioned piece
tracked); the drift ledger: the 6 other members IDENTICAL, the 16 family
members EXACT, ReportLab CHANGED with alnums exact; the word-stream
similarity **identical** (0.9080 — the words and their order unchanged);
the raw line-axis similarity **0.3915 → 0.3930 TOWARD** (+0.0015 — the
page-number columns read cell-per-line `00\n01\n02` where the HEAD read
them run together `00 01 02`, and the two cover header lines split to
pdftotext's own forms; the R123-B "word-stream identical, line form
toward" doctrine class).

## MATERIAL 2 — R124-B: the odd-length /W pair-invalidity

**The anatomy** (the instrumented walk on the arXiv member): 453
root `code-uncovered` sites → 580 blind pieces, the F5/F6 fonts
(`BAAAAA+CourierNew`/`CAAAAA+CourierNew-Bold`, Type0/Identity-H) carrying
the descendant `/W [ 0 92 600.098 ]` — a THREE-TOKEN pure-number array.
The parse: the c-c-w singleton-range check fails (0 ≠ 92), the R121-A
range-triple check passes (0 ≤ 92, 600.098 > 0), but the `pairsValid`
guard — designed to prove the pair reading invalid — reads the pair
`(0, 92)` as plausible (`600.098 > 0`, `92 > 0`) and the pair reading
wins: `{0: 92}` with **the 600.098 DANGLING-discarded**. Every CID > 0
falls to `/DW 0` → the `w <= 0` guard blinds every F5 block.

**The writer's intent is the range form** (the R121-A class, the Typst
range-run genus): CourierNew is monospaced — `[0 92 600.098]` = CIDs
0–92 at 600.098 (the c-w-n spec reading is impossible: n = 600.098 is
not an integer count; the pair reading silently discards a real width).

**The bug in the guard**: a pair list must consume EVERY number — a
3-token array under the pair reading always dangles its last value.
Oddness itself proves the pair reading invalid.

**The fire-separation census** (every pure-number /W array in the corpus
+ families): the odd-3n form rides arXiv (3), dvipdfmx (1), fontspec (1),
IRS (3), Typst (2), WeasyPrint (1) — and the drift ledger under the cure
holds **every one IDENTICAL** (the dvipdfmx `1 3 2` class re-reads as the
range {1:2, 2:2, 3:2} — its used-CID widths change by ≤ 1/1000 em,
sub-threshold to every rule; the IRS `1 2 1`/`1 3 1` forms already
range-read today via the standing `nums[i+2] > nums[i]` check; the Typst
c-c-w forms never reach the range branch).

**The cure**: inside the R121-A range branch, `pairsValid` initializes to
`nums.length % 2 === 0` — an odd token count pre-invalidates the pair
reading (the dangling-number proof), then the standing loop checks run as
before. The mixed `/W [ c [w…] cfirst clast w … ]` form (the arXiv
Calibri `5 12 0` gap-triple class) is **NOT touched** this round — the
mixed branch's range arms stay queued for r125 (measured below).

**The measured cure**: arXiv bx coverage **97.3% → 99.2%** (21321/21503 —
the F5/F6 classes un-blinded); the OUTPUT **IDENTICAL on every member**
(the newly-tracked advances stay below every rule threshold — a
zero-drift un-blinding in the R120 width-blind-elimination class); the 16
family members EXACT.

## The r125 queue (armed by this round's measurement)

- The arXiv residual pocket (0.8% — 182 pieces): the Font2 null-glyph
  class (CID 1 shows under the Calibri array's zero-width entry — the
  `w <= 0` blindness on a legitimately-zero .null glyph) + the f-0-0
  class + **the mixed-form /W range arms** (the `c [w…] cfirst clast w`
  shape — the Calibri gap-triples `5 12 0` = CIDs 5–12 at width 0, the
  bare-number groups between the arrays)
- The IRS fontless pocket (108 pieces — text-show operators with no Tf
  in scope; the ZaDb appearance-stream class, undiagnosed this round)
- The Typst sub-em residuals (~0.25 em — the kern accumulation class;
  output-neutral today, a precision hunt)
- The standing watches (the REF stay-open drawer through its 20th+ deploy;
  the neo-crm s212+ layer — baseline `1b093de`; the LO Calc re-source;
  the advisory census; the next patch watch)

## The ToDo list (the round as executed)

- [x] The opening read: the 88th-deploy watch (render-stable — the login
      pair BYTE-IDENTICAL both sides; the wrapper-border flag refuted;
      the mobile-nav pair PARITY with the drawer census re-verified
      through the visibility filter) · the app-side assets QUIET · the
      audit legs (neo-crm docs-only · advisory unchanged · patch quiet)
- [x] The corpus verified at HEAD (all pins, the drift ledger, the 16
      family members EXACT — no re-source needed)
- [x] The hunt: the blind-pocket anatomy measured end-to-end (the
      instrumented blindness-cause walk on ReportLab/arXiv/IRS; the
      indirect-/Font census; the /W token-parity census; the patched-proto
      experiments with the drift ledger + family checks + the
      toward/away classification)
- [x] The TDD round: RED 2/2 + 3 born-green guards → the cures in
      `src/lib/cv-text.ts` → GREEN 1179/1179 → the proto resync (the
      sync arm caught the stale proto on the first post-cure run — the
      D-120a discipline holding)
- [x] The mutation matrix EXACT (`scripts/r124-mutations.py`): M1 1 · M2 1 · M3 1 · M4 2 · M5 1
- [x] The drift ledger + family checks on the FINAL source (6 IDENTICAL +
      ReportLab TOWARD, alnums exact · 16 family members EXACT — the final
      extraction byte-identical to the experiment)
- [x] The full gate chain: lint 0/0 · tsc ✓ · 1179/1179 unit · build ✓ ·
      E2E 565/565 (the 3-chunk split 200+187+180, zero failures — one
      chunk-3 timing flake passed clean on both re-runs) · DB pristine
- [x] The live UI verify (the r104 protocol — the Typst resume2 probe:
      name-first, dateSplit ×2, zero U+FFFD, swept, DB pristine)
- [x] The screenshots (docs/screenshots/) — the 4 r124 captures on the
      REMEDIATED build, verified non-blank (the login + dashboard pairs
      byte-identical to the r123 captures; the mobile-nav pair + the
      training cycle with the auto-close superset verified)
- [x] The docs layer (this plan + the session_293 narrative + the AGENTS
      session-124 layer + the SKILL v4.11.0 §136 + the count lockstep
      1179 + 565 = 1744 + the worklog round-123 entry with the r125 queue
      armed)
- [ ] Commit + push to main via the SSH wrapper [the round's final step]
