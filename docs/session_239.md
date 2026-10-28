# Session 105 — raw execution transcript (parity round 104)

The condensed execution log of docs/session_238.md — the same round from the operator's chair.

**The open.** Fresh clone at `cb94f77`; `bun install` (525 packages); `.env` from `.env.example`; `db:push` + `db:seed` → 1 user / 0 candidates, `db/custom.db` at the repo root. Baseline: lint 0/0 · tsc ✓ · 1044/1044 unit — the session-104 close re-verified.

**The deploy watch.** `scripts/r105-login-probe.mjs` (the r104 probe adapted, the VERIFIED-VIEWPORT guard): the login census reads JS `index-D52diwdP` + CSS `index-DrXNg8Ix` — BOTH moved from the 68th state (`index-DcYiwvas` / `index-D3d5-7RD`); the app side QUIET (`C-IrDy5f`/`BGNH4KkS`, the r42 baseline). The capture at the verified 1440×900: **BYTE-IDENTICAL to the `69aa4241…` baseline** → the 69th deploy classified NON-VISUAL.

**The mobile-nav pair.** The first probe run hit the viewport drift trap again (w:0/h:0 at a 1280 desktop layout) — the guard'd re-run at the verified 390×844: REF hamburger 28×28 `lucide-panel-left`, drawer 288×844 fixed z-50. The menu cycle: `/training` + STILL-OPEN — NOT the r104 AUTO-CLOSED. The forensics (`scripts/r105-drawer-forensics.mjs`): the panel state=open, x=0, transform none, stable +7s; the REF's drawer item list now includes a "Close" button — a shadcn DialogClose X with `display:none` at mobile (invisible; the 16-vs-15 count delta is the DOM artifact). The VLM cross-check of the pair: pixel-identical drawer interiors, no visible X either side. **DECISION: the clone keeps the auto-close superset** — the pinned E2E contract; the REF's stay-open classified a REF-side regression (the content stays covered), WATCH the 70th.

**The dev-server DATABASE_URL leg.** The first LOC login failed — the API answered Prisma Error 14 while the pages rendered: the sandbox's exported `DATABASE_URL` (a false workspace-root path) overrode the `.env`. The `env -u DATABASE_URL` restart (by the port holder) cured it; the cross-side pair then read clean on both sides.

**The audit.** The session-104 changes re-read in full (cv-text.ts 818 lines, the title seam, the 404 pair, the test net): M-1 the uncapped inflate (MEDIUM — ObjStm/Form streams inflate before any gate), L-2 the stale lastFreshTd, L-4 the per-piece candidate re-resolution, L-1/L-3/L-5 accepted-and-documented. The r105-queue feasibility sketched: the page-tree chain first, the Dingbats decode, the width table as watch.

**The remediation plan.** `docs/remediation-plan-session105.md` — the frontier, the opening-read ladder, the four findings (R105-A/B/C/D), the TDD plan, the mutation matrix, the verification legs. Validated against the codebase (the fixture shapes checked against the actual scan patterns — the doubly-nested /Resources shape the dict-pattern cannot capture became the region-scan design note).

**The TDD round.** RED 5/5 as designed — the bomb's decoys pollute; "34" for ✓✔; "Aa" for Αα; page A through page B's wrong letters; "skiabeta". GREEN after the four fixes — 54/54 in the changed file, 1049/1049 across the suite.

**The mutation proof.** M1 the budget → Infinity: exactly 1 RED. M2 the marker lookup removed: exactly 2 RED. M3 the page map disabled: exactly 1 RED. M4 the lastFreshTd clear removed: exactly 1 RED. Restored: 54/54 re-verified.

**The corpus.** IRS f1040 + arXiv-2404.16710 re-downloaded; `scripts/r105-corpus-verify.ts` through the remediated code: **5,871 + 67,744 alnums — IDENTICAL, CORPUS HOLDS.**

**The build OOM.** The first `bun run build` died at exit 137 (the dev server co-resident on 4GB); the retry with the dev server killed + `NODE_OPTIONS=--max-old-space-size=3072` compiled clean (8.5s) and generated 116/116 static pages.

**The E2E gate, take one.** The detached run failed EVERY chromium test at 1ms with the setup project green — the fresh workspace had lost the matching playwright browser build (chromium-1248; the cache held 1200 only). `bunx playwright install chromium` (120MB) and the re-run: green from the first test.

**The gates.** lint 0/0 · tsc ✓ · 1049/1049 unit · build ✓ (env -u) · E2E 558/558 (the standing net, the final gate ALONE via the detached node-spawn protocol).

**The docs layer.** The plan + its execution appendix · the narrative (session_238) · this transcript (session_239) · the AGENTS session-105 layer · the SKILL v3.92.0 + §117 (the gate after the cost, the named encoding, the binding context, the dying-box diff) · the CLAUDE/README/AGENTS count lockstep (1049 + 558 = 1607) · the worklog round-104 entry · `.env.example` verified unchanged (only DATABASE_URL + AUTH_SECRET are read).

## Round complete — Session 105 / Parity Round 104 landed ✅

The round that audited its own predecessor: the session-104 source review found the uncapped inflate (the deflate-bomb class), and the r105 queue's two named CV-flow items — the standard-14 marker decode and the page-tree-aware font chain — plus the two hardenings all landed TDD-fixed, mutation-proofed, with the real-file corpus IDENTICAL. The 69th deploy detected and classified NON-VISUAL (login render byte-identical). The mobile-nav pair PARITY at the 69th state, with the REF's new stay-open drawer behavior classified and the clone's auto-close superset kept. Five gates green.

**Suggested next:** the r106 queue — docs/session_238.md §"The r106 queue" — the two-pass width table (unblocked by the page-tree chain), the /Differences harvest (the dvipdfmx homoglyph class), the Quartz hunt, the 70th-deploy drawer watch.
