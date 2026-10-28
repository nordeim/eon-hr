# Remediation Plan — Session 105 / Parity Round 104: the inflate budget round + the marker decode + the page-tree chain

**The frontier.** The r104 close-out's queue (docs/session_235.md §"The r105
queue"): (1) the CV-flow watches — the non-ASCII `/Differences` remap, the
non-default `Tz`/`Ts`, the LO negative-tracking class, the positive-gap-writer
class, the LuaTeX/XeTeX narrow-ending word-gap class (the two-pass per-letter
width table could re-open BOTH), and now the **no-ToUnicode simple-font marker
decode** (the Dingbats class) + the **page-tree-aware font chain** (the
position-based candidate order's one-letter residual on the 60+-page docs);
the **13th-writer hunt: macOS Quartz remains unpinned**; (2) the REF-broken
mobile set stays on watch (the 68th-state baseline); (3) the standing watches
(the 68th-state login ladder re-armed, the recharts grid class, the dark-band
theming, the v4 space-y inline-flow watch, the patch watch HOLD at ^16.4.2);
(4) the neo-crm session-195+ layer when it lands. PLUS the round's own audit
of the session-104 source changes (the M-1/L-class findings below).

## The opening read (the standing ladder — the 69TH deploy state)

| Ladder step | Result |
|---|---|
| Workspace | Fresh clone at `cb94f77` (the session-104 close + the session_237 transcript); `bun install` (525 packages) + `.env` (the two-variable contract, `DATABASE_URL="file:../db/custom.db"`) + `db:push`/`db:seed` (1 user / 0 candidates) + the production build + the :3200 boot (the node-spawn detached protocol) |
| Baseline gates | lint 0/0 · tsc ✓ · **1044/1044 unit** — matches the session-104 close |
| The exported-`DATABASE_URL` guard | ACTIVE all round (the sandbox exports `file:/home/z/my-project/db/custom.db` — a false path; `env -u DATABASE_URL` on every Prisma CLI touch, every build, and the boot — it fired on the round's first dev-server login exactly as documented: Prisma Error 14) |
| The deploy watch | **THE 69TH DEPLOY detected — login JS `index-DcYiwvas` → `index-D52diwdP` AND login CSS `index-D3d5-7RD` → `index-DrXNg8Ix` (BOTH moved; the app side QUIET: `index-C-IrDy5f`/`index-BGNH4KkS`, the r42 baseline holds)** → classified **NON-VISUAL**: the fresh login capture at the VERIFIED 1440×900 viewport is **BYTE-IDENTICAL to the standing `69aa4241…` baseline** (md5-verified; the DOM census intact — the six-button set, the two-input form, zero Turnstile) |
| The standing ladders | **verify-r45: 13/13 MATCH** (the clean serialized re-run — the round's first attempt died in the sandbox OOM with `gone:true` LOC reads, proven an environment artifact) · **verify-r49: 12/13 + 1 verified-identical** (`stats-surveyanalytics` read DIFF — the REFRESH-SESSION VIEWPORT DRIFT trap, round two: the ref session's browser relaunched at 1280 mid-ladder and every chart container read 160px narrower [418/910 vs 498/1070]; the VERIFIED-viewport direct re-read — REF main 1184, containers [546,546,1118], charts [498×240 ×2, 1070×260] — IDENTICAL to LOC member-for-member; the lucide-download class-string delta [`w-4 h-4 mr-2` vs `mr-2`] is the documented `[&_svg]:size-4 ≡ w-4 h-4` Button-guard translation, geometry 16×16 both sides — normalized by the ladder's own SIZE_COLOR rule) |
| The mobile-nav cross-side pair (the standing emphasis) | **PARITY at the 69th state, live-verified on BOTH sides at 390×844** — REF: hamburger 28×28 `lucide-panel-left` "Toggle Sidebar" + drawer 288×844 fixed z-50; clone: the same geometry + the `aria-label`/`role=dialog` a11y supersets; VLM-verified pixel-identical drawer interiors (same items, same styling, no visible X on either side — the REF's DialogClose is `display:none` at mobile, a DOM-only artifact). **NEW AT THE 69TH: the REF drawer STAYS OPEN after menu navigation** (panel state=open, x=0, visible, stable +7s — at the 68th state the same cycle AUTO-CLOSED, r104-verified). **DECISION: the clone KEEPS the auto-close superset** — pinned by `tests/e2e/mobile-navigation.spec.ts` ("drawer navigation closes the drawer and lands on the target"); the REF's stay-open is classified a REF-side behavior regression (mobile content stays covered), a WATCH item for the 70th deploy |
| The REF-broken mobile set | **HOLDS at the 69th state** — `/employeedetail` the empty shell (rootChildren 2, mainTextLen 26, scrollW 390), re-read live at the verified 390px viewport |
| The standing scans | oklch clean · `md:flex-wrap` zero · secrets zero · the patch watch HOLD at ^16.4.2 · the space-y inline-flow watch clean — no Tailwind v4 regression in the mobile band (the pair verified) |
| DB state | pristine (1 user / 0 candidates) after the fresh seed |
| The session-104 audit | **M-1 (MEDIUM): the inflate path has NO output cap** — the R102-A dict gate skips `/Image` + `/FontFile` streams BEFORE inflating, but ObjStm/Form/Metadata streams inflate to completion before the text-op gate runs; a crafted deflate bomb inside an ObjStm expands unbounded in the tab (client-side self-DoS). L-2 (LOW): `lastFreshTd` is never cleared when a Tm-based run intervenes (a mixed XeTeX+Skia stream compares against a stale origin). L-4 (LOW): `cmapsFor(p.font)` re-sorts + re-resolves the candidate chain for EVERY hex piece. L-1/L-3/L-5: accepted standing exposures (documented in-code) |

## THE ROUND'S FINDINGS (empirically verified before the fix)

**R105-A — the inflate has no output budget (VERIFIED by code walk — MEDIUM,
the M-1 audit finding).** `inflate()` (src/lib/cv-text.ts:19-24) pipes the
whole stream through `DecompressionStream` and materializes the full output
via `new Response(stream).arrayBuffer()`. The R102-A pre-inflate dict gate
correctly skips `/Subtype /Image` and `/FontFile` streams (the 26MB real-world
image class), but every OTHER stream type — ObjStm, Form XObject, Metadata —
inflates to completion before the text-op gate (line 687) or the
printable-ratio gate (line 688-698) can reject it. A crafted PDF carrying a
deflate bomb inside an ObjStm or Form stream expands to unbounded memory in
the browser tab. The surface is client-side (the upload flow), so the threat
is self-DoS (a user uploading a hostile CV freezes their own tab), not a
server compromise — but the R102-A image-gate lesson (bounded work per
stream) demands the same bound on the inflate itself.

**The fix:** the streaming byte budget — read the decompressed stream in
chunks through a bounded accumulator; a stream whose inflated output exceeds
the budget (8MB — 2 orders of magnitude above the largest legitimate content
/ ObjStm / CMap stream in the 12-writer corpus, far below the 26MB image
streams that never reach inflate) aborts as a failed inflate and falls to the
standing best-effort `""`. The per-stream `continue` contract (one bad stream
never kills the file) holds verbatim.

**R105-B — the no-ToUnicode simple-font marker decode: the Dingbats class
(VERIFIED as a corpus gap — MEDIUM within the superset flow, the r105 queue
item).** The R99-B CMap chain resolves subset fonts through their ToUnicode
maps, and `decodeHexString` falls back to Latin-1/WinAnsi when no map covers
the codes. But a simple font that ships NEITHER a ToUnicode map NOR Latin-1
semantics — the standard 14's `/BaseFont /ZapfDingbats` (bullets ✓ ✗ ► ●,
the resume-decoration class) and `/BaseFont /Symbol` — decodes through the
wrong table: `<33>` reads "3" instead of ✓. The r102/r104 corpora never
carried a marker font; the dvipdfmx manual's `Ǝ` homoglyphs are a DIFFERENT
residual (an unnamed custom encoding — verified this round, out of scope).

**The fix:** the standard-14 marker tables as static `CodeMap`s — a
`/BaseFont` capture in BOTH font-object scans (the raw scan + the ObjStm
harvest) feeds a fontObj→baseFont map; `cmapsFor` returns the ZapfDingbats
(or Symbol) table when the font object carries that BaseFont and no ToUnicode
resolves. The tables are codeLen 1; `decodeHexString` consumes them
unchanged.

**R105-C — the page-tree-aware font chain (VERIFIED residual — MEDIUM, the
r105 queue item).** The R104-D candidate chain resolves a /F-name through
EVERY font object that name maps to, in file order, picking the
first-FULLY-COVERING map. On fontspec.pdf (60+ pages, each page's /F1 → a
DIFFERENT font object, all names /F1../F10) two pages' maps can BOTH fully
cover an atom's codes while mapping them to different letters — the
first-covering rule then picks the WRONG page's map and the title reads
"Dont selection" instead of "Font selection" (the one-letter residual, live
at the 68th and 69th states).

**The fix:** the page-tree chain — collect `/Type /Page` objects (their
`/Contents N 0 R` + their `/Resources` `/Font << /F1 M 0 R >>` dicts, both
raw and ObjStm-carried); each content stream's pieces carry their stream's
object number; at assembly, stream objNum → the page that declares it → that
page's /F-name → the font object → its ToUnicode CMap. The candidate chain
remains the fallback when the tree doesn't resolve (single-page files keep
the previous behavior verbatim).

**R105-D — the two one-line hardenings (the L-2 + L-4 audit findings).**
L-2: `lastFreshTd = null` when a Tm run intervenes (a mixed Tm/fresh-Td
stream must not delta against a stale origin — one line, born-green under
the standing corpus). L-4: memoize `cmapsFor` per font name (the candidate
chain re-sorts + re-resolves per hex piece — a trivial per-font Map).

**Watch items (NOT fixed this round):** the two-pass per-letter width table
(the narrow-ending word-gap class — the r105 queue's named future work; the
regression budget needs the corpus re-run and rides AFTER R105-C lands);
macOS Quartz (the 13th-writer hunt — no sourceable real file found this
round); the dvipdfmx `Ǝ` homoglyph class (an unnamed custom encoding — a
per-font /Differences harvest is the future work); the non-ASCII
`/Differences` remap, the non-default `Tz`/`Ts`, the LO negative-tracking
class, the positive-gap-writer class (standing).

## The TDD plan (RED → GREEN → mutation-proof)

**RED specs (written first, all failing):**

1. `tests/unit/cv-text.test.ts` — R105-A: a fixture whose stream inflates
   past the budget aborts as `""` (the per-stream continue contract: the
   file's OTHER streams still extract). Fixture shape: a real deflate of a
   >8MB text body inside a stream object — the budget aborts, a small second
   stream still yields its text. (The fixture must exercise the FIXED path:
   the bomb must be a NON-image stream that passes the dict gate — the
   fixture-must-exercise-the-fixed-path lesson, §116.)
2. `tests/unit/cv-text.test.ts` — R105-B: a fixture with
   `/BaseFont /ZapfDingbats` (no /ToUnicode), hex atoms `<33><34><35>` →
   "✓✗►" through the static table; a `/BaseFont /Symbol` twin; the Latin-1
   fallback pins survive verbatim for unnamed fonts.
3. `tests/unit/cv-text.test.ts` — R105-C: a two-page fixture where BOTH
   pages' /F1 maps fully cover the same codes but map them differently (the
   exact first-covering blind spot) — page 1's atom must read through page
   1's map ("Font") not page 2's ("Dont"); the single-page corpus pins
   survive verbatim.
4. R105-D: no dedicated RED (both are hardenings) — born-green under the
   standing corpus + the L-2 mixed-form fixture.

**Mutation proof (the r104 protocol):**

- M1: the budget neutralized (cap = Infinity) → the R105-A spec RED.
- M2: the Dingbats table removed from cmapsFor → the R105-B spec RED.
- M3: the page-tree chain reverted to candidate-order-only → the R105-C
  spec RED (the "Dont" residual returns).
- M4: the lastFreshTd clear removed → the mixed-form fixture RED.

**Gates:** lint 0/0 · tsc ✓ · unit (1044 + the net new) · `env -u
DATABASE_URL` build · E2E 558/558 (the standing net; no E2E legs this round
— the CV-flow fixes are unit-layer per the r104 documented split, the
scorer's tokenizer being whitespace-blind to the defect classes) + the
mobile-nav pair re-verified on the remediated build.

## Verification legs

1. The unit RED→GREEN + the mutation matrix M1–M4.
2. The real-file ground truth: the standing corpus re-run (the 12-writer
   pins must hold IDENTICAL — no alnum drift).
3. The mobile-nav pair (REF + LOC) re-verified on the remediated :3200
   build — the auto-close superset intact, no Tailwind v4 regression.
4. The final E2E gate ALONE (the detached node-spawn protocol).

## Execution appendix (filled at close)

- **RED:** 5/5 as designed — the bomb's decoys pollute the yield (`BOMBGARBAGE777` appears with the real text); "34" for ✓✔; "Aa" for Αα; page A's atoms decode through page B's wrong letters; "skiabeta" (the stale-origin sub-em join). Each RED fired on the designed assertion, never the 40-alnum guard (the fixture-length lesson applied: every fixture clears the guard on BOTH sides of its mutation).
- **GREEN:** 1049/1049 (1044 + 5 net new) — the four fixes landed in `src/lib/cv-text.ts`: the streaming `MAX_INFLATED_BYTES` budget in `inflate()`; the `ZAPF_DINGBATS`/`SYMBOL_FONT` marker tables + the `/BaseFont` capture in both font-object scans + the marker resolution in `cmapsFor`; the `pageFonts` region scan + the ObjStm page registration + the `localFor` page-first resolution at assembly; the `lastFreshTd = null` Tm clear + the `cmapsForMemo`.
- **Mutation matrix:** M1 (budget → Infinity) → exactly 1 RED; M2 (marker lookup removed) → exactly 2 RED (both twins); M3 (page map disabled) → exactly 1 RED; M4 (lastFreshTd clear removed) → exactly 1 RED. The restored file re-verified 54/54 (the mutation edits reverted byte-clean, diff-checked against the green snapshot).
- **Corpus:** IRS f1040 5,871 alnums · arXiv-2404.16710 67,744 alnums — **IDENTICAL through the remediated code, CORPUS HOLDS** (the two re-sourceable members re-downloaded fresh; the 54 cv-text unit pins carry the writer forms).
- **Gates:** lint 0/0 · tsc ✓ · 1049/1049 unit · build ✓ (env -u DATABASE_URL; NODE_OPTIONS=--max-old-space-size=3072 after the first build OOM'd with the dev server co-resident) · E2E **558/558** (the standing net, the final gate ALONE via the detached node-spawn protocol — after the chromium-1248 reinstall cured the fresh-workspace 1ms-failure class).
- **Evidence:** the r105 PNG set — `r105-probe-login-ref.png` (the byte-identical deploy-watch capture), `r105-ref-mobilenav-open.png` + `r105-loc-mobilenav-open.png` (the pair), `r105-ref-postnav-drawerstate.png` + `r105-loc-postnav-drawerstate.png` (the stay-open vs auto-close contrast), `r105-ref-training-mobile.png` + `r105-loc-training-mobile.png`, and the remediated-build re-verify set.
- **Docs lockstep:** the plan (this file) · session_238 (narrative) + session_239 (transcript) · the AGENTS session-105 layer · SKILL v3.92.0 + §117 · the CLAUDE/README/AGENTS count lockstep (1049 + 558 = 1607) · the worklog round-104 entry · `.env.example` verified unchanged.
