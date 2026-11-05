# Remediation Plan — Session 126 / Parity Round 125

Three materials, all measured end-to-end through the patched-proto
experiment before any source change: **the general-name form own-resources
binding** (R126-A — the R125-D binding gated on the F-prefixed scan's
pairs, whose `\w` class rejects the hyphenated names `f-0-0`/`f-0-1` [the
matplotlib PTEX figure class] and every non-F-prefixed name [the IRS
AcroForm `ZaDb`/`T1_N` class] — those forms' own bindings never fired and
the candidate chain resolved the name to the FIRST same-named object in
file order, a different form's subset), **the raw-page site's fontPairsOf
merge** (R126-B — the r120 asymmetry: the merge landed at the ObjStm page
site with the comment naming "the IRS T1_0 class," but the IRS pages are
raw-carried — the raw site never got the merge), and **the empty-show
known-zero-content** (R126-C — an empty literal/hex show op advances
nothing and blinds nothing; the 11-piece arXiv residual class). Plus the
genus-transfer leg (D-126a): the neo-crm s214 stale-parent-DB hazard, a
standing pre-gate hygiene probe.

## The opening read (the 90th-deploy watch)

| Leg | Result |
| --- | --- |
| Login asset census | JS `index-DyOb2xUE` CHURNED (from `6xnUqbWf`) · CSS `index-Bt66wgTd` CHURNED (from `BVWWKVEJ`) — **the 90th deploy shipped, login-side only**; the app side HELD (`index-C-IrDy5f.js` / `index-BGNH4KkS.css` — the r42 baseline). Classification: **NON-VISUAL** — both pinned captures byte-identical through the double churn (the same render-stable class as the 88th) |
| Login capture (1280×800) | **BYTE-IDENTICAL to the r125 pin** (md5 `e04112c8`, 167,497 B — first pass, no animation-in-flight) |
| Dashboard capture (1280×800) | **BYTE-IDENTICAL to the r125 pin** (md5 `965b41b0`, 190,117 B) |
| Mobile-nav pair (390×844, the user's named focus) | The REF drawer **STILL-OPEN** after the Training LMS click (`{"w":"288px","left":0,"z":"50","opacity":"1"}`, URL → `/training`) — the 69th-deploy regression standing through the 90th; the hamburger 28×28 `lucide-panel-left` intact; **no Tailwind v4 regression** |
| Warm-token census | All byte-stable: social button `rgb(15,14,14)`, or-chip `rgb(93,93,93)` @ 12px, h1 `rgb(15,23,42)`, input border `rgb(226,232,240)` |
| neo-crm HEAD | `b0bb8cd` → `36aee3e` — **4 commits, ZERO src changes** (s213 + s214 both test-census rounds: the facts-census semantic-prose pins and the auth-bullet census; src/ last touched at the s212 ship). Nothing to transfer code-wise; the s214 OPERATIONAL lesson transferred as D-126a. The next-audit baseline `36aee3e` |
| Corpus pins | All members re-sourced (the fresh sandbox): arXiv 1,543,672 B EXACT · dvipdfmx 244,290 B (texdoc.org — the mirrors.ctan.org 404 again) · fontspec 528,597 B · IRS · QUARTZ md5 `27575d59` EXACT (the submodule trail) · ReportLab md5 `0f64df85` EXACT · Prawn md5 `699ebcab` EXACT · LO Calc not re-sourceable (the r103 precedent). Typst 0.15.1 re-installed; chromium-1248 re-installed; the 16 family members regenerated. Baseline gates reproducing the documented close: **lint 0/0 · tsc ✓ · 1189/1189 unit**; the drift ledger all-IDENTICAL at HEAD (the post-r125 pins: arXiv `1c189607` · fontspec `9366f8a9`); **16 family members EXACT**; bx: arXiv 99.9% (21,485/21,503) · IRS 100.0% · ReportLab 100.0% |

## MATERIAL 0 (D-126a) — the stale-parent-DB hygiene probe (the neo-crm s214 genus)

**The neo-crm operational lesson (s214)**: a fresh-clone round after a
sandbox reset found a **stale parent-of-repo `db/custom.db`** restored
(the pre-s212 phantom-drift hazard) — it was probed before the drift gates
reused the listener and removed. eon-hr's db-path anchor search
(`candidateRoots()`: standalone root → module root → CWD) is
unconditional, so a stray schema-bearing parent could in principle
capture resolution silently.

**The standing guard** (`scripts/r126-parent-hygiene.mjs`): a zero-dependency
pre-gate probe that walks the repo's ancestor chain and exits non-zero
with the offending path if any `db/custom.db` or `prisma/schema.prisma`
exists ABOVE the repo root. Run before any DB-touching gate
(`db:push`, `db:seed`, the E2E boot, the launch-verify legs); a future
sandbox reset that resurrects the phantom fails LOUDLY instead of
drifting the gates.

## MATERIAL 1 (R126-A) — the general-name form own-resources binding

**The anatomy** (the instrumented binding probe + the fire-separation
census): the arXiv residual 18-piece pocket splits into the 7-piece 'z'
block (the f-0-0 pieces of form obj 321, `./figures/motivation.pdf` — the
block-blind cascade from ONE uncovered code) + the 11 empty-raw pieces
(isolated, zero downstream damage). The 'z' piece's form declares its OWN
`/Resources << … /Font << /f-0-0 439 0 R /f-0-1 440 0 R >> >>` — and obj
439 (CIJKLF+NimbusSans, FC 32 LC 122) **covers code 122 at width 500**.
But the R125-D form binding gates on `fonts.size` — the F-prefixed scan
`/\/([Ff]\w+(?:\.\w+)*)\s+…/` whose `\w` class **rejects the hyphen** —
so `f-0-0` never entered the map and the binding never fired. The
widthFor fell to the R120-C candidate chain, which resolved `f-0-0` to
obj 292 (GTDJSU+NimbusSans, FC 32 LC 121 — the FIRST same-named object,
a DIFFERENT form's subset whose /Widths does not cover 122) → the map-miss
blind → the block-blind cascade.

**The fire-separation census** (corpus-wide, both scan sites): the
hyphen-name form class rides **arXiv alone** — 4 matplotlib PTEX forms
(obj 181 `overview.pdf`, 321 `motivation.pdf`, 547
`early_exit_inference.pdf`, 548 `self_speculative_decoding.pdf`), the
names `f-0-0` (declared 4×: objects 292/439/566/579 — a collision) and
`f-0-1` (2×: 440/580). The non-F-prefixed form class rides **IRS alone**
— 73 AcroForm appearance-stream forms carrying `ZaDb` (single declaration
→ the chain already lands right; the binding changes nothing) and the
T1_N names. The width tables of the colliding f-0-0 candidates diverge on
5–15 codes per pair (292 vs 439: 5; vs 566: 10; vs 579: 15) — the
wrong-subset resolution corrupted every tracked end on those codes.

**The cure**: in the object scan's non-page branch, the form binding
fires on the **MERGED pairs** — the F-prefixed scan's `fonts` plus the
`fontPairsOf(body)` region pairs (whose character class `[\w#+\-./]`
accepts the hyphen). The FontN-named forms (the r125-cured class) are
unaffected: their names match both scans identically.

**The measured cure** (the patched-proto experiment, A+B+C together):
the arXiv 'z' block un-blinds (the form's own 439 covers the code at
500 — the advance 27pt at ps 54) and the 4 matplotlib forms' ~600 pieces
resolve through their OWN subsets. **The output drift**: alnums EXACT
(70,646), the word-stream similarity IDENTICAL (0.7359), the line-form
aggregate IDENTICAL (0.1282), and **4 single-character decode
corrections** — `Use ﬀrst N layers` → `Use ﬁrst N layers`, `Pre ﬀll
Latency` → `Preﬁll Latency` (×2), `pre ﬀll` → `preﬁll` — the wrong-font
CMap decoded the ﬁ-ligature code as ﬀ; pdftotext's own distribution is
4× `ﬁ` + 1× `ﬀ` and the cured output matches it EXACTLY (the HEAD reads
5× `ﬀ`). The IRS member IDENTICAL (the ZaDb/T1_N bindings land on the
same objects the chain already picked — the placeholder-500 width
agreement), the other 10 members IDENTICAL, **all 16 family members
EXACT**; **bx: arXiv 99.9% → 100.0%** (21,503/21,503).

## MATERIAL 2 (R126-B) — the raw-page site's fontPairsOf merge (the r120 asymmetry)

**The anatomy**: the R120-B cure added `for (const [k, v] of
fontPairsOf(body)) fonts.set(k, v);` at the **ObjStm** page site — the
comment names "the inline /Font region pairs (the IRS T1_0 class)" — but
the IRS pages are **raw-carried** (page obj 2403 — the r125-cured
8-stream /Contents page — and page obj 1). The raw site never received
the merge: a page with inline `/Resources << /Font << /T1_0 2431 0 R … >>
>>` binds NOTHING (the F-scan rejects `T1_0` — not F-prefixed), and its
content streams resolve through the candidate chain.

**The collision**: page 1 declares `T1_1→2441, T1_2→2445, T1_3→269` while
page 2403 declares `T1_1→2433, T1_2→2435, T1_3→2437` — the candidate
chain (first in file order) picks page 1's objects for BOTH pages' pieces.
The colliding objects are HelveticaNeueLTStd subsets riding ObjStms with
**placeholder /Widths** (uniform 500; obj 269 uniform 571) — the
wrong-page resolution happened to be width-compatible on T1_1/T1_2 (both
500) and differs only on T1_3 (571 vs 500, 3 pieces).

**The cure**: the raw-page site gains the ObjStm site's own merge line
VERBATIM (the asymmetry cured — both sites now share the identical
merged-pairs form). **The measured cure**: IRS IDENTICAL (the
placeholder-500 agreement holds; the 3 T1_3 pieces' width change
crossed no threshold); no other member carries the shape (the census:
hyphen-pages IRS 2, everywhere else 0).

## MATERIAL 3 (R126-C) — the empty-show known-zero-content

**The anatomy**: the 11 empty-raw pieces (arXiv Font1×2, Font2×7,
Font3×2 — isolated empty literal shows `() Tj` under codeLen-2 fonts)
fire `raw.length === 0 || raw.length % 2 !== 0` → `blind = true`. The
damage census measured ZERO downstream pieces denied bx (every empty
piece is the last of its block) — but the semantics are wrong: an empty
show op advances nothing and blinds nothing (the R125-B known-zero
doctrine's mirror: a KNOWN zero-content event, not an unknown-width
signal).

**The cure**: `if (raw.length === 0) { (piece as { bx?: number }).bx =
origin + adv; continue; }` — the piece takes the block's current tracked
position (a zero-width occupant) and the block keeps tracking. The
hex side (`<> Tj`) takes the same form. A genuinely-odd raw (a dangling
byte under codeLen-2) KEEPS the standing blind — no live instance in the
corpus, the conservative guard stands (the fire-separation spec pins it).

**The measured cure**: the 11 pieces take bx; every member's output
IDENTICAL except the R126-A decode corrections (alnums exact
everywhere); the family members EXACT.

## The Typst sub-em residual (the queue's watch item — measured, deferred again)

The residual band measurement: **resume 1/76 and resume2 0/73 sub-em
inter-piece gaps (0.05–0.5 em)** — the kern-accumulation class has been
absorbed by the standing cures to a single gap on one member, the output
word-count delta unchanged (+1/+2, the standing split). Output-neutral
today; the watch continues.

## The r127 queue (armed by this round's measurement)

- The arXiv figure-region line-form residuals (the matplotlib forms'
  per-glyph show rows — the tracked-end changes from the own-subset
  widths crossed no threshold this round; the pdftotext form of the
  figure rows remains the hunt target if the next round's ledger moves)
- The Typst sub-em residual watch (1 gap on resume — output-neutral)
- The standing watches (the REF stay-open drawer through its 21st+
  deploy; the neo-crm s215+ layer — baseline `36aee3e`; the LO Calc
  re-source; the advisory census; the next patch watch; the bun
  .env-absolutization watch — Leg A of the launch-verify probe; the
  parent-hygiene probe — D-126a)

## The ToDo list (the round as executed)

- [x] The opening read: the 90th-deploy watch (login-side churn
      NON-VISUAL — the captures byte-identical; the app side HELD; the
      mobile-nav drawer STILL-OPEN on the REF — the standing regression;
      no Tailwind v4 regression) · the audit legs (neo-crm `36aee3e`
      zero-src — the s214 operational lesson transferred as D-126a;
      advisory unchanged; patch quiet)
- [x] The corpus re-sourced and verified at HEAD (all pins; the drift
      ledger all-IDENTICAL at the post-r125 pins; the 16 family members
      EXACT; the baseline gates 1189/1189)
- [x] The hunt: the r126 queue's named pockets measured end-to-end (the
      instrumented blindness-cause walk — 12 events: 1 code-uncovered +
      11 empty-raw; the block-cascade reconciliation 18 = 7 + 11; the
      binding probe — pageBind=undefined on all 4 matplotlib forms; the
      fire-separation census corpus-wide — arXiv 4 hyphen-forms + IRS 73
      ZaDb/T1_N forms + 2 raw pages; the collision width-table
      divergence 5–15 codes; the Typst sub-em band 1/76 + 0/73)
- [x] The patched-proto experiment (A+B+C): arXiv bx 99.9% → **100.0%**
      with alnums exact and 4 decode corrections EXACT-MATCHING
      pdftotext's ligature distribution; IRS IDENTICAL; 10 members
      IDENTICAL; 16 families EXACT
- [x] The TDD round: RED 3/3 (the hyphen-name form binding · the raw-page
      merge · the empty-show zero-content) + the odd-raw fire-separation
      guard (born-green) + the hex-empty spec (RED demonstrated by source
      revert — the `<>` atom never matches the walk's hex regex; the
      whitespace-only `< >` atom is the real class) + the clean-emission
      sep reset (the never-" \n" doctrine — the upgrade consumes the empty
      piece's boundary-artifact separator) → the cures in
      `src/lib/cv-text.ts` → **GREEN 1194/1194** (1189 + 5)
- [x] The mutation matrix EXACT (`scripts/r126-mutations.py`): M1 [the
      form binding reverted to the F-scan gate] 1 · M2 [the raw-page region
      merge dropped] 1 · M3 [the literal empty-show blind restored] 1 · M4
      [the hex empty-show blind restored] 1 · M5 [the clean-emission sep
      reset dropped] 2 (both empty specs — the sep reset serves the whole
      zero-content class) · M6 [the odd-raw conservative blind inverted] 8
      (the odd-guard spec + the 7 historical specs whose fixtures carry
      odd raws whose blind is load-bearing — the conservative blind deeply
      pinned across the fixture family)
- [x] The drift ledger + family checks on the FINAL source (the proto
      resynced after every change): 11 members IDENTICAL + arXiv TOWARD
      (the new pin `75436914`, alnums 70,646 exact, the word-stream and
      line-form aggregates IDENTICAL, 4 ligature-decode corrections
      exactly matching pdftotext's ﬁ=4/ﬀ=1 distribution — the HEAD read
      5×ﬀ); the 16 family members EXACT; **bx: arXiv 100.0% (21,503/21,503)
      · IRS 100.0% · ReportLab 100.0%**
- [x] The full gate chain: lint 0/0 · tsc ✓ · **1194/1194 unit** · build ✓
      · E2E **565/565** (the 3-chunk foreground split 211+176+180, zero
      failures) · DB pristine (1/1/2/0/0) · the live UI verify PASSED (the
      r104 protocol — name-first, dateSplit ×2, zero U+FFFD, swept by the
      real id) · the launch-verify probe: Leg A PASS (the clean .env-only
      launch, no phantom parent DB), Leg B LOUD (the sandbox-exported
      absolute URL — the server never comes up, no phantom created) · the
      parent-hygiene probe OK
- [x] The screenshots (docs/screenshots/) on the REMEDIATED build: the 4
      REF captures (login md5 `e04112c8` 167,497 B + dashboard md5
      `965b41b0` 190,117 B — both BYTE-IDENTICAL to the r125 pins; the
      mobile-nav pair) + the 4 clone captures (the mobile flow as a
      STANDALONE session — the documented viewport-at-session-start trap);
      all 8 verified non-blank; the pixel diffs vs the REF: **login
      0.0350% (the standing level) · dashboard 1 pixel in 1,024,000 ·
      mobile-nav 1 pixel**; the training diff the documented auto-close
      superset (the clone's drawer fully unmounted, URL → /training); the
      REF drawer STILL-OPEN (the 69th-deploy regression through the 90th
      deploy); no Tailwind v4 regression
- [ ] The docs layer (this plan + the session_298 narrative + the AGENTS
      session-126 layer + the SKILL v4.13.0 §138 + the count lockstep +
      the worklog round-125 entry with the r127 queue armed)
- [ ] Commit + push to main via the SSH wrapper [the round's final step]
