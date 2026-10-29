# Session 107 — raw execution transcript (parity round 106)

The condensed execution log of docs/session_244.md — the same round from the operator's chair.

**The open.** The pull brought one commit (`769e4a2` — the session-106 session log). HEAD = the session-106 close; the tree clean; the environment INTACT (the corpus PDFs at /tmp, the chromium-1248, the screenshots — no reset this break). Baseline: lint 0/0 · tsc ✓ · 1051/1051 unit.

**The opening read.** The r107 login probe: login JS `C8D2zqWd` + CSS `CZZ4z0cl` — UNCHANGED from the 70th state → **NO 71st deploy**; the render BYTE-IDENTICAL (`69aa4241…`); the app census QUIET (the r42 baseline). The mobile-nav pair at 390×844: **PARITY — all four fresh captures BYTE-IDENTICAL to the r106-verified pair** (md5-for-md5: the REF + LOC drawer-open and post-nav states unchanged; the VLM pixel-parity inherited). The REF stay-open persists at the same state; `/employeedetail` REF-broken (66 nodes vs 248).

**The audit.** The R106-A three legs re-read — correct. The Tz/Ts census (`r107-tzts-census.mjs`): **ZERO Tz/Ts/Tc/Tw operators across all six corpus members** — the watch REFUTED (no live target). The LO guides re-sourced (the Calc 7.0 + the Writer 7.6) — and the corpus verify found the pins drifting: lo-calc 695,014 vs the 691,268 pin, fontspec 106,179 vs the documented 101,515. **The isolation**: the extraction is deterministic (byte-identical twice); the r102-era extractor re-run on today's lo-calc reads the SAME 695,014 → **the FILE changed, not the code** (the site re-serves a regenerated build); the fontspec numbers were measured on the r106 session's deleted first download (the member-level cure — "Font selection" — reproduces exactly on the surviving file). The pins re-anchor with the md5s.

**The real defect.** The split-digit probe on the fresh lo-calc found ZERO split digits — but the LO negative-tracking census (`r107-lo-negtracking-census.mjs`) found 26 band kerns (−113..−154) with sequential-glyph neighbors. The trace (`r107-band-trace.mjs` + `r107-f14-decode.mjs`): the band kerns ride the COVER's display typography — the 26pt title "Calc Guide" and the 20pt subtitle "Working With Spreadsheets", every letter kerned, the word gaps as space glyphs — and the extraction reads them as **"C a l c   G u i d e"** (letter-split soup; pdftotext reads the joined titles).

**The naive fix refuted.** The prototype diff (`r107-prototype-diff.ts`): the band conditional joins fontspec's interword glue (L1277 fuses "anyeffectontextinthisfont…") and arXiv's math thin-spaces ("J(X; Y; t)" → "J(X;Y;t)") — pdftotext reads BOTH spaced. Three writer families share the −150..−196 band. **The discriminator** (the per-array census, `r107-per-run-census.mjs`): the display-tracking signature — every pair kerned + all kerns in (−200,−100] + all atoms single-glyph + count ≥ 4. Only the LO covers satisfy all four across the corpus.

**The second finding.** The cover page's font map (`r107-f14-decode.mjs`): `pageFonts.get(2836)` = {Font: 4234} — the dict KEY captured as a font name. The page-form taxonomy: the cover's inline-/Resources-with-referenced-/Font and the 545 pages' two-hop — neither feeds the chain; the false "Font" pair blocks the resolution. Benign today (single candidates) — a hardening with real fixture value.

**The plan.** `docs/remediation-plan-session107.md` — the opening-read table, the findings (R107-A the display class; R107-B the third page form; R107-C the spine freeze — the s196 doctrine; R107-D the advisories census — the s198 doctrine), the TDD plan (3 RED + 2 guards + M1–M6), the verification legs. Validated against the fixture patterns (the R106 spec style) and the blast radius (the prototype diff + the per-array census).

**The TDD round.** RED 3/3 — 'C a l c   G u i d e' (the defect verbatim) + the chain-theft ×2 — with two fixture repairs along the way (the 2-atom math form must ride inside a TJ array; the space glyph's code collision). GREEN 1056/1056 after the two fixes (the per-array pre-scan; the three /Font-ref legs). M1→1, M2→1 (the multi-CID guard), M3→1 (the math guard), M4→1, M5→1 — every mutation bites exactly its own spec; the type refactor (the tsc error on the ternary) re-verified with the M1 recheck.

**The real-file ground truth.** The member diff (`r107-ground-truth.ts`): IRS · arXiv · dvipdfmx · fontspec · lo-writer ALL BYTE-IDENTICAL; **lo-calc EXACTLY the two cover lines cured** — "Calc Guide" / "Working With Spreadsheets" — matching pdftotext member-for-member, the alnum pin unchanged.

**The doctrine transfers.** The spine measured (`r107-spine-measure.mjs`: sheet 0,0,288,844 · header 0,0,287,89 · h2 76,25,187,23 · nav 0,89,287,634 · UL 20,141,247,516 · footer 0,723,287,121) and the leg written (born-green + the M6 mutation proof). The zod override applied + the stale nested copy swept; `bun audit` reads the deepmerge-ts-only state.

**The gates.** The dev server killed by the port holder; the build (122 routes); the final E2E gate ALONE via the detached node-spawn protocol. The spine leg's first run RED (the sheet selector matched nothing inside the dialog — the selector repair + the isolated re-run, documented in session_244).

**The docs layer.** The plan + its execution appendix · the narrative (session_244) + this transcript (session_245) · the AGENTS session-107 layer · the SKILL v3.94.0 + §119 (structure over magnitude, the pin-vs-build identity, the stale nested override copy) · the count lockstep (1056 + 559 = 1615) · the worklog round-106 entry · `.env.example` verified unchanged.

## Round complete — Session 107 / Parity Round 106

The round that refuted its own queue's named item by measurement (Tz/Ts: zero operators corpus-wide — 1,034 LO streams included) and found the real defect in the re-sourcing: the LO display-tracking class, cured with the per-array signature — the corpus five-member byte-identical, exactly the two cover lines joined ("Calc Guide" where "C a l c   G u i d e" stood), matching pdftotext member-for-member. Plus the third page-form blind spot, the drawer-open spine freeze, and the advisories census. The 71st deploy QUIET; the mobile-nav pair PARITY byte-identical to the r106-verified state.

**Suggested next:** the r108 queue — the width table (still the watch), the Quartz hunt (fourth round), the positive-gap-writer class, the non-ASCII /Differences remap, the 72nd-deploy watch, the REF stay-open drawer (fourth-deploy watch).
