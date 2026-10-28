# Session 105 — Parity Round 104: the inflate budget round + the marker decode + the page-tree chain

**Task ID:** round-104 · **Agent:** main (Super Z) · **Repo state at open:** `cb94f77` (the session-104 close + the session_237 transcript)

## The opening read (the 69TH deploy state)

The fresh workspace re-cloned at `cb94f77`, `bun install` (525 packages), `.env` from `.env.example` (`DATABASE_URL="file:../db/custom.db"` — the two-variable contract), `db:push` + `db:seed` (1 user / 0 candidates). The baseline gates: lint 0/0 · tsc ✓ · **1044/1044 unit** — matches the session-104 close. The exported-`DATABASE_URL` guard ACTIVE all round (the sandbox exports `file:/home/z/my-project/db/custom.db` — a false path; it fired on the round's first dev-server login exactly as documented: Prisma Error 14 while the pages rendered fine — the `env -u DATABASE_URL` restart cured it).

**THE 69TH DEPLOY detected** — login JS `index-DcYiwvas` → `index-D52diwdP` AND login CSS `index-D3d5-7RD` → `index-DrXNg8Ix` (BOTH moved; the app side QUIET: `index-C-IrDy5f`/`index-BGNH4KkS`, the r42 baseline holds) → **classified NON-VISUAL**: the fresh login capture at the VERIFIED 1440×900 LIGHT viewport is **BYTE-IDENTICAL to the standing `69aa4241…` baseline** (md5-verified; the DOM census intact — the six-button set, the two-input form, zero Turnstile).

**The mobile-nav cross-side pair (the standing emphasis — the user's named focus):** PARITY at the 69th state, live-verified on BOTH sides at 390×844 with the VERIFIED-VIEWPORT guard:

| Contract | REF | Clone |
|---|---|---|
| Hamburger | 28×28 `lucide-panel-left` "Toggle Sidebar" | 28×28 same glyph + the aria-label superset |
| Drawer | 288×844 fixed z-50, 16 items | 288×844 fixed z-50, 15 items (the DOM-only delta) |
| Visible X | NONE (the DialogClose is `display:none` at mobile) | NONE (by design) |
| Menu cycle | `/training` + **STILL-OPEN** (NEW at the 69th) | `/training` + **AUTO-CLOSED** |

**The 69th-deploy behavior change:** the REF's drawer now STAYS OPEN after menu navigation (panel state=open, x=0, transform none, stable +7s — at the 68th state the same cycle AUTO-CLOSED, r104-verified on both sides). **DECISION: the clone KEEPS the auto-close superset** — the pinned E2E contract (`tests/e2e/mobile-navigation.spec.ts` "drawer navigation closes the drawer and lands on the target") holds; the REF's stay-open classified a REF-side behavior regression (the mobile content stays covered after navigation), a WATCH item for the 70th deploy. The item-count 16-vs-15 delta is a DOM artifact: the REF's shadcn DialogClose X carries `display:none` at mobile — invisible on BOTH sides (VLM-verified pixel-identical drawer interiors: same items, same styling, no visible X either side). The REF-broken mobile set HOLDS (`/employeedetail` the empty shell: rootChildren 2, mainTextLen 26, scrollW 390).

## The session-104 audit (the round's own code review)

The audit of the session-104 source changes (cv-text.ts, not-found-title.ts, the 404 pages, the test net) — read-only, both changed unit specs re-run green:

- **M-1 (MEDIUM):** the inflate path had NO output cap — the R102-A dict gate skips `/Image` + `/FontFile` streams BEFORE inflating, but ObjStm/Form/Metadata streams inflate to completion before any gate could reject (a crafted deflate bomb inside an ObjStm expands unbounded in the tab — client-side self-DoS).
- **L-2 (LOW):** `lastFreshTd` never cleared when a Tm run intervenes (a mixed XeTeX+Skia stream deltas a stale origin).
- **L-4 (LOW):** `cmapsFor(p.font)` re-sorts + re-resolves the candidate chain per hex piece.
- **L-1/L-3/L-5 (accepted standing exposures, documented in-code):** the bare-BT token exposure; the fresh-Td em math ignoring `cm` scale (no corpus writer combines them); the ObjStm header's trailing-whitespace requirement.
- **The r105-queue feasibility:** the page-tree chain (moderate, highest value), the Dingbats decode (lowest, clean seam fit), the two-pass width table (medium-high, keep as watch until the chain lands).

## The round's findings — all TDD-fixed

**R105-A the streaming inflate budget.** `MAX_INFLATED_BYTES = 8MB` — `inflate()` reads the decompressed stream chunk-wise and cancels the producer the moment the accumulated output crosses the cap. An over-budget stream throws; the callers' best-effort catches turn it into "" and the per-stream `continue` contract holds (one bomb never kills the file — the real stream in the same file still extracts). The budget must ride the READ — a plain `arrayBuffer()` would materialize the bomb whole before any check.

**R105-B the standard-14 marker decode.** The Adobe standard encodings (PDF 32000-1 Annex D) as static `CodeMap`s — `ZAPF_DINGBATS` (0x20-0x7E) and `SYMBOL_FONT` (0x20-0x7E, the private-use extenders omitted) — keyed lowercased with subset "ABCDEF+" prefixes stripped. The `/BaseFont` capture rides BOTH font-object scans (the raw dict scan + the ObjStm harvest); `cmapsFor` returns the marker table when the font object carries that BaseFont and no ToUnicode resolves. `<33>` → ✓ U+2713, `<41>` → Α U+0391 — never the Latin-1 "3"/"A".

**R105-C the page-tree-aware font chain.** A region scan (obj header → endobj — tolerant of the doubly-nested `/Resources << /Font << /F1 N 0 R >> >>` shape the dict-pattern cannot capture) collects `/Type /Page` objects' `/Contents` + their inline font dicts; referenced `/Resources N 0 R` pages resolve after the pass; the ObjStm harvest registers ObjStm-carried pages. Each content stream's pieces carry the stream's object number; assembly resolves stream → page → that page's /F-name → font object → its ToUnicode CMap FIRST, the candidate chain as the fallback. Single-page and tree-less files keep the previous behavior verbatim (the R104-D and R102-B fixtures pass unchanged).

**R105-D the two hardenings.** `lastFreshTd = null` when a Tm run intervenes (the mixed-form stream's later fresh Td takes the conservative word-gap branch — "skia beta", never "skiabeta"); the `cmapsForMemo` (the candidate chain resolves once per font, not per hex piece).

## The TDD round

**RED 5/5 as designed:** the bomb pollutes the yield (`BOMBGARBAGE777` appears); "34" for ✓✔; "Aa" for Αα; page A's atoms decode through page B's wrong letters; "skiabeta". **GREEN 1049/1049** (1044 + 5 net new). **The mutation proof:** M1 (the budget neutralized to Infinity) → exactly 1 RED; M2 (the marker lookup removed) → exactly 2 RED (both twins); M3 (the page map disabled) → exactly 1 RED; M4 (the lastFreshTd clear removed) → exactly 1 RED — each mutation bites exactly its own spec; the standing 1044 never wavers (verified by the restore re-run, 54/54 in the changed file).

## The real-file ground truth

The corpus re-established (the two re-sourceable members re-downloaded fresh) and **IDENTICAL through the remediated code: IRS f1040 5,871 alnums · arXiv-2404.16710 67,744 alnums — CORPUS HOLDS, zero drift**. The R105 fixes change nothing on the standing writers (the pure Tm/fresh-Td forms and the single-page font chains take their previous paths verbatim); the 54 cv-text unit pins carry the writer forms.

**The standing ladders (the serialized re-runs):** **verify-r45: 13/13 MATCH** — the clean re-run on a healthy box (the round's first attempt died in the sandbox OOM with `gone:true` LOC reads, proven an environment artifact, not a parity diff). **verify-r49: 12/13 + 1 verified-identical** — `stats-surveyanalytics` read DIFF, root-caused to **the REFRESH-SESSION VIEWPORT DRIFT trap, round two**: the ref session's browser relaunched at 1280 mid-ladder and every chart container read 160px narrower (418/910 vs the true 498/1070). The VERIFIED-viewport direct re-read (REF main 1184, containers [546,546,1118], charts [498×240 ×2, 1070×260]) — **IDENTICAL to LOC member-for-member**; the lucide-download class-string delta (`w-4 h-4 mr-2` vs `mr-2`) is the documented `[&_svg]:size-4 ≡ w-4 h-4` Button-guard translation (geometry 16×16 both sides, normalized by the ladder's own SIZE_COLOR rule). The r104 session's flake disposition re-confirmed — this time with the root cause PROVEN. (The standing r49 script predates the VERIFIED-VIEWPORT guard; the ladder-hardening is a future round's item.)

## The gates

lint 0/0 · tsc ✓ · **1049/1049 unit** (1044 + 5 net new) · build ✓ (under `env -u DATABASE_URL`, NODE_OPTIONS heap cap after the first build OOM'd with the dev server co-resident) · E2E **558/558** (the standing net; no new E2E legs — the CV-flow fixes are unit-layer per the r104 documented split, the scorer's tokenizer being whitespace-blind to these defect classes) + the mobile-nav pair re-verified on the remediated build (the PARITY contract, the auto-close superset intact).

## The round's traps

- **The verify-r45 ladder OOM** — the standing ladder's parallel agent-browser Chrome sessions exhausted the sandbox's 4GB and fork-blocked the shell mid-run; the interrupted log's `gone:true` LOC reads were the environment's death, not a parity diff (the re-run on a healthy box is the arbiter; serialize browser work, never run ladders beside a build).
- **The playwright chromium-1248 reinstall** — the fresh workspace lost the matching browser build; every E2E test failed at 1ms with the setup project green; `bunx playwright install chromium` before the gate.
- **The build OOM round two** — the production build was OOM-killed (exit 137) with a dev server co-resident; the cure: kill the dev server first, `NODE_OPTIONS=--max-old-space-size=3072`.
- **The 69th-deploy drawer behavior change** — the REF's mobile drawer stays open after menu navigation (the r104 AUTO-CLOSED contract flipped server-side); classified REF-regression, the clone's superset kept, WATCH the 70th.
- **The dev-server DATABASE_URL leg** — the documented guard fired again on the round's first login (Prisma Error 14 with pages rendering fine): the `env -u` restart, not a code change.

## The r106 queue

1. The CV-flow frontier: the two-pass per-letter width table (the narrow-ending word-gap class — now unblocked by the landed page-tree chain; the corpus re-run budget is the gate), the non-ASCII `/Differences` remap, the non-default `Tz`/`Ts`, the LO negative-tracking class, the positive-gap-writer class, the dvipdfmx `Ǝ` homoglyph class (an unnamed custom encoding — a per-font /Differences harvest), the macOS Quartz 13th-writer hunt.
2. The REF-broken mobile set + the NEW stay-open drawer behavior — watch the 70th deploy for the drawer class.
3. The standing watches: the 69th-state login ladder (re-armed), the recharts grid class, the dark-band theming, the v4 space-y inline-flow watch, the patch watch (HOLD at ^16.4.2).
4. The neo-crm session-195+ layer when it lands.
