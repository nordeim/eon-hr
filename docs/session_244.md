# Session 107 — the display-tracking round (parity round 106)

The round that refuted its own queue's named item by measurement and found the real defect in the re-sourcing. **Session 107 / Parity Round 106** — HEAD `769e4a2` (the session-106 close + its session log), the tree clean, the standing environment intact (the corpus PDFs, the chromium-1248, the screenshots all survived the session break).

## The opening read — the 71st-deploy watch QUIET

The login probe (r107, adapted from the r105/r106 pattern): JS `index-C8D2zqWd`, CSS `index-CZZ4z0cl` — **UNCHANGED from the 70th state → NO 71st deploy**; the app-side census quiet (the r42 baseline `C-IrDy5f`/`BGNH4KkS` holds); the fresh login capture at the VERIFIED 1440×900 **BYTE-IDENTICAL** to the standing `69aa4241…` baseline. The mobile-nav pair at 390×844: **PARITY, and stronger — all four fresh captures (REF + LOC, drawer-open + post-nav) BYTE-IDENTICAL to the r106-verified pair** — the same deploy state rendering the same bytes on both sides, the VLM pixel-parity inherited member-for-member. The drawer third-deploy watch: the REF stay-open persists at the unchanged 70th state (no state change to re-classify); the clone keeps the auto-close superset. The REF-broken `/employeedetail` holds (66 nodes vs the clone's 248). Baseline gates: lint 0/0 · tsc ✓ · 1051/1051 unit.

## The audit — the queue measured, the re-sourcing's two findings

The session-106 changes re-read in full (the R106-A three legs correctly implemented and consumed). The r107 queue taken to the real files:

- **Tz/Ts REFUTED BY MEASUREMENT**: the census walks every corpus member's decompressed content streams — zero `Tz`/`Ts`/`Tc`/`Tw` operators of ANY value across all six members (1,034 content streams in the re-sourced LO guides alone). The watch closes as NO-LIVE-TARGET.
- **The LO guides re-sourced** (Calc 7.0, 11.4MB PDF 1.6 + Writer 7.6, 20.4MB PDF 1.7) — and the corpus verification found TWO documentation-accuracy findings: the current Calc download reads 695,014 alnums (the old 691,268 pin was a different build — proven by re-running the r102-era extractor on today's file: IDENTICAL counts through old and new code, the file changed, not the code); the surviving fontspec.pdf reads 106,179 at HEAD (the r106-documented "101,529 → 101,515" was measured on the deleted first download — the member-level cure reproduces exactly). The pins re-anchor with the file md5s recorded.
- **The Quartz hunt**: not sourceable again — the third round running.

## The real defect — R107-A, the LO display-tracking class

The Calc guide's cover extracts as letter-split soup: **"C a l c   G u i d e" / "W o r k i n g   W i t h   S p r e a d s h e e t s"** where pdftotext reads the joined titles. The measured mechanism: the cover's 26pt title and 20pt subtitle are TJ arrays of single-CID hex atoms with a kern between EVERY consecutive pair (−113..−154 — the display typography's uniform tracking), while the WORD gaps ride space-GLYPH atoms. The `kern ≤ −100` word-gap rule splits every letter.

The naive fix — band kerns conditional in space-glyph streams — was **REFUTED BY PROTOTYPE** before any spec: the prototype diff showed it fusing fontspec's L1277 line ("anyeffectontextinthisfont…", where pdftotext reads the words spaced) and joining arXiv's math thin-spaces ("J(X; Y; t)" → "J(X;Y;t)"). Three writer families share the −150..−196 magnitude band. **The discriminator is the per-array display-tracking SIGNATURE**: every pair kerned, all kerns in (−200,−100], all atoms single-glyph, count ≥ 4 — measured against every band-carrying array in the corpus, only the LO title and subtitle satisfy all four conditions.

## The second finding — R107-B, the third page-form blind spot

The cover page's measured shape: `/Resources << /Font 4234 0 R >>` — inline resources whose /Font VALUE is a reference; the 545 body pages: the two-hop `/Resources N 0 R` → obj N = `<< /Font M 0 R >>`. Neither form feeds the page chain — and the F-pair regex captures the dict KEY "Font" as a font name, a false pair that BLOCKS the resolution. Benign in the current corpus (single candidates) but a live vector for the R102-B class. The fix: the "Font" key exclusion + the fontRefOf link map + the two-hop resolution + the pendingFontRef queue — drift-free on the corpus (proven by the member diff).

## The doctrine transfers — R107-C and R107-D

The neo-crm session-195..198 layer consumed: **s196's drawer-open spine freeze** → the born-green e2e pinning the measured drawer-open interior boxes at TRUE 390×844 (sheet 0,0,288,844 · header 0,0,287,89 · h2 76,25,187,23 · nav 0,89,287,634 · UL 20,141,247,516 · footer 0,723,287,121); **s198's advisories census** → `bun audit`'s nested zod@4.6.5 cured by the overrides patch-bump + the stale-nested-copy sweep (the override changes the resolution; the sweep changes the disk), deepmerge-ts documented as the accepted dev-chain advisory. s195's 404 gate-coverage: already covered by the standing R104 pins; s197's coverage-sweep: methodology noted.

## The TDD round

RED 3/3 with the exact designed signatures ('C a l c   G u i d e' — the real defect verbatim; 'qwzv xjkjqvwwz…' — the chain theft) + two born-green guards (the xdvipdfmx multi-CID form, the pdfTeX 2–3-atom math form — one fixture repair: the 2-atom math form must ride inside a TJ array, a bare non-operator-adjacent `(;)` is dropped by the ops regex). GREEN **1056/1056** (1051 + 5 net new). The mutation matrix M1–M5: each exactly 1 RED — M1 the display-join (spec 1), M2 the single-glyph condition (the multi-CID guard), M3 the atom-count gate (the math guard), M4 the pendingFontRef resolution (the cover form), M5 the two-hop link (the 545-page form). The restored file byte-clean + the M1 recheck on the final type-refactored code.

## The real-file ground truth

The member diff (HEAD's extractor vs the remediated one): **IRS 5,871 · arXiv 67,744 · dvipdfmx 61,437 · fontspec 106,179 · LO Writer 646,207 — ALL BYTE-IDENTICAL**; **LO Calc 695,014 with EXACTLY the two cover lines cured** — "Calc Guide" / "Working With Spreadsheets", matching pdftotext member-for-member, the alnum pin unchanged. Five members untouched through both fixes is the strongest drift-free proof the round can carry.

## The close

Gates: lint 0/0 · tsc ✓ · 1056/1056 unit · build ✓ (122 routes) · E2E 559/559 (558 standing + the spine leg) via the detached node-spawn protocol · `bun audit` at the documented deepmerge-ts-only state. The mobile-nav pair re-verified on the remediated build. The docs layer: the plan + its execution appendix · session_244 + session_245 · the AGENTS session-107 layer · SKILL v3.94.0 + §119 (structure over magnitude, the pin-vs-build identity, the stale nested override copy) · the count lockstep 1056 + 559 = 1615 · the worklog round-106 entry · `.env.example` verified unchanged.

**Suggested next:** the r108 queue — the width table (still the watch), the Quartz hunt (fourth round), the positive-gap-writer class, the non-ASCII /Differences remap, the 72nd-deploy watch, the REF stay-open drawer (fourth-deploy watch), the standing watches.
