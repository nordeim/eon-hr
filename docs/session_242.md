# Session 106 — raw execution transcript (parity round 105)

The condensed execution log of docs/session_241.md — the same round from the operator's chair.

**The open.** Fresh clone at `1e53902` (288 commits); `bun install` (525 packages); `.env` from `.env.example`; `db:push` + `db:seed` → 1 user / 0 candidates. Baseline: lint 0/0 · tsc ✓ · 1049/1049 unit.

**The deploy watch.** `scripts/r106-login-probe.mjs` (the r105 probe adapted): login JS `index-D52diwdP` → `index-C8D2zqWd` AND CSS `index-DrXNg8Ix` → `index-CZZ4z0cl` — BOTH moved → **THE 70TH DEPLOY**; the app-side census (`scripts/r106-app-census.mjs` — the first probe run's classification line had a flat.includes() element-match bug, fixed to .some(x => x.includes(...))) reads `C-IrDy5f`/`BGNH4KkS` — QUIET, the r42 baseline holds; the login capture at the verified 1440×900 **BYTE-IDENTICAL** to `69aa4241…` → NON-VISUAL, the 69th pattern repeating.

**The mobile-nav pair.** `scripts/r106-nav-pair.mjs` at 390×844 (the VERIFIED-VIEWPORT guard): REF 28×28 lucide-panel-left + 288×844 fixed z-50 drawer (16 items, Close button `display:none`); LOC same geometry + the supersets (15 items). The VLM cross-check: **pixel-identical drawer interiors** — "the two screenshots appear to be exact copies of each other." The menu cycle: REF `/training` + STILL-OPEN (the 69th's behavior persists through its second deploy); LOC `/training` + AUTO-CLOSED. The `/employeedetail` REF-broken member HOLDS (66 nodes vs the clone's 250).

**The corpus re-established.** IRS f1040 + arXiv-2404.16710 re-downloaded (the standing pins hold through the round: 5,871 + 67,744); the dvipdfmx manual + the CURRENT fontspec.pdf v2.9h (2026-08-11 — a NEWER build than r104's 20260317) fetched from the CTAN ibiblio mirror (the mirrors.ctan.org redirect 404s; the first fontspec download was accidentally rm'd with the 404 stubs — re-downloaded).

**The audit's turn to the real files.** The writer census on the new fontspec: "Dont selection for X\nƎ\nL\nA\nT\nE\nX…" — the F→D residual still live, plus the per-letter title-logo form. The forensics ladder: `r106-homoglyph-forensics.mjs` (the wrong-map chain trace) → `r106-objstm-pages.mjs` (the page-structure census: 71/71 fontspec + 50/50 dvipdfmx pages ObjStm-carried, array-form /Contents, referenced-Resources-in-ObjStm — the R105-C chain INERT) → `r106-debug-pages.mjs` (the verbatim page bodies — the first draft lost the image-skip and read zero; the inflate needed the EOL-trimmed chunk) → `r106-stream-atoms.mjs` (the title stream's per-atom sources: `<0027>` 'F' via EBGaramond → 'D') → `r106-title-resolve.mjs` (the page's true /F1 = obj 4 Pagella, 114-entry ToUnicode, ALL title CIDs covered — the cure verified BEFORE the fix).

**The pdftotext ground truth.** The reference extractor reads fontspec's title "Font selection for XƎLATEX and LuaLATEX" (the F→D is OUR defect; the Ǝ is the official XƎTeX logo) and the dvipdfmx title "Tհe Dvipdfmx սser maոսal" — the IDENTICAL Armenian homoglyphs (the class is a dvipdfmx authoring artifact; the /Differences hypothesis REFUTED — zero /Differences arrays in the file).

**The queue measured.** The width table's target does not manifest (`r106-fusion-census.mjs`: the fused 25+ runs are URLs/LaTeX commands/OTF names; the word probes hit whole words). The Quartz hunt: the ABC orszag.pdf URL now serves a Word 2007 file; the Hamilton paper was re-processed by PDFsharp; the DTU paper is Distiller; SSRN/HAL bot-walled — not sourceable.

**The plan.** `docs/remediation-plan-session106.md` — the opening-read table, the audit findings (R106-A the real defect; R106-B/C/D the measured queue verdicts), the TDD plan (2 RED specs + the M1-M3 matrix), the verification legs. Validated against the codebase (the fixture patterns checked against pdfWithObjects/the R105-C template; the corpus blast-radius pre-checked: IRS 1 bracket page, arXiv 1 bracket page + the raw page maps already active).

**The TDD round.** RED 2/2 (the identical chain-theft signature on both specs). GREEN after the three legs (the contentsRefs helper, the ObjStm objFonts feed, the post-walk pendingRes resolution) — 56/56 in the changed file, 1051/1051 across the suite. M1 → exactly 2 RED; M2 → exactly 1 RED; M3 → exactly 1 RED; the restored file byte-clean (md5 `5de5acf5…`) + 56/56.

**The real-file verify.** The corpus IDENTICAL (IRS 5,871 + arXiv 67,744); fontspec CURED ("Font selection" present, "Dont selection" gone, 101,529 → 101,515); dvipdfmx UNCHANGED (61,437, 12,922 Armenian chars — the own-map class).

**The gates.** The dev server killed by the port holder; the build with NODE_OPTIONS=--max-old-space-size=3072 (116/116 static pages); the chromium-1248 reinstall (the fresh workspace held 1200 only — the documented class); the final E2E gate ALONE via the detached node-spawn protocol (`scripts/r106-final-e2e.mjs`).

**The docs layer.** The plan + its execution appendix · the narrative (session_241) · this transcript (session_242) · the AGENTS session-106 layer · the SKILL v3.93.0 + §118 (the real writer's shape, the reference extractor as ground truth, the queue item refuted by measurement) · the CLAUDE/README/AGENTS count lockstep (1051 + 558 = 1609) · the worklog round-105 entry · `.env.example` verified unchanged.

## Round complete — Session 106 / Parity Round 105 landed ✅

The round that measured its own queue: two of the three named CV-flow items refuted by evidence (the /Differences harvest — zero arrays in the file, pdftotext reads the same homoglyphs; the width table — no live target in the sourceable corpus), and the real defect the audit found — the R105-C page-tree chain inert on both real xdvipdfmx builds — fixed with three legs, TDD'd (RED 2/2 → GREEN 1051/1051), mutation-proofed (M1→2, M2→1, M3→1), with fontspec cured member-for-member ("Font selection" where "Dont selection" stood) and the corpus IDENTICAL. The 70th deploy detected and classified NON-VISUAL. The mobile-nav pair PARITY at the 70th state, the REF's stay-open drawer persisting (classification stands). Five gates green.

**Suggested next:** the r107 queue — docs/session_241.md §"The r107 queue" — the width table (still the watch), the Quartz hunt, the non-default Tz/Ts, the LO negative-tracking class, the 71st-deploy watch, the stay-open drawer's third-deploy watch.
