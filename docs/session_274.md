# Session 118 — Parity Round 117 — THE ICON-ANCHORED SUB-THRESHOLD COLUMN ROUND

The r118-queued hunt class — the Typst contacts phone|email pair that pdftotext reads on
separate lines while our extraction joins them — measured end-to-end before any code, and
the measurement refuted the queue's own hypothesis in the process.

## The refutation that opened the round

The queue named the class "an empty-text icon glyph between two tiny-gap blocks; NOT
gap-driven." The controlled-variant census (the recompiled modern-cv specimen with a
patched separator/icon row, typst 0.15.1 pinned) killed it in six variants:

| Variant | Change | pdftotext verdict |
| --- | --- | --- |
| base | icon + 5pt separator | **SPLIT** |
| v2 | no icons, 5pt separator | **SPLIT** — the icons are NOT required |
| v3 | icons, NO separator | **JOIN** — the icons are NOT sufficient |
| v4 | text glyphs (P/E), 5pt separator | **SPLIT** — the icon font/PUA is irrelevant |
| w1–w5 | separator bisect 1/2/3/4/5pt | 1–4pt JOIN, 5pt SPLIT — the word-gap boundary at 0.944–1.056 em |
| a1–a4 | + bridge words above/below | all SPLIT — the single-word vertical bridge is dead |

**The split is gap-driven.** The icons act as bridge words at sub-em gaps; the separator
box's 5pt is what pushes the phone→icon word gap over poppler's ~1 em boundary.

## The artifact join exposed

The definitive separation-band census (on `pdftotext -bbox-layout` — poppler's OWN
block/line/word analysis, zero output matching) found **no joined numeric pair anywhere
in the Prawn output**: every tick label reads on its own line with a blank between. The
r117 "11.78 em Prawn chart-tick join" — the calibration's highest measured join — was a
nearest-word matching artifact. The "ReportLab cover 33.6-em trailless join" re-verified
as a cross-page adjacency. Corpus-wide a pure gap threshold stays dead (arXiv joins at
2.05 em; sub-em splits ride font/baseline micro-signals) — **but the icon-anchored
walk-back population separates cleanly: 0.89 em (the Skia em-dash JOIN) to 1.06 em (the
Typst contacts SPLIT), zero candidates on every other corpus member.**

## The cure (R118-A)

A zero-alnum content block (an icon/symbol/punctuation anchor — never a space run) at a
same-baseline block boundary whose walk-back content block sits **≥ 0.95 em** behind
upgrades the separator to a clean "\n" — the consumed space runs emit nothing (the
R117-A dropText form), a left trail strips when present, and the icon then joins the
FOLLOWING content at its sub-threshold gap: pdftotext's exact
`<phone-icon> +1 (555) 010-9911` / `<mail-icon> john.smith@example.com` line form. The
R117-A guards verbatim (never a join, never an existing "\n", both pieces stamped, blind
fonts stay blind); the adjacent-piece baseline check kills the cross-line walk-back.

## The second material — the neo-crm s208 transfer

neo-crm shipped session-208 (the doc-claim totality census — the layer beyond the s207
the last round consumed). The eon-hr adaptation found the count axis STALE: **"54 route
handlers" (live 57), "47 Prisma models" (live 48), "49 endpoints"/"46 routes" (PAD §3)**
— fossils from the initial commit's "46 routes, 49 API handlers, 45 models" that rode
85+ sessions while every gate stayed green. D-118a cured the six live-section claims;
D-118b pinned the structural live-census (the route/handler/model counts read LIVE from
the tree vs the doc claims) and the command arm (every bun-run claim resolves), both
mutation-proven.

## The verification

RED 3/3 + 5 born-green guards → **GREEN 1135/1135** → the mutation matrix exact
(M1 3 · M2 2 · M3 1 · M4 3; the doc-pin DM1 1 · DM2 1); **all 7 corpus pins
BYTE-IDENTICAL** (zero drift — the blast-radius census's zero-candidate prediction
exact); the 16 family members exact (the Skia em-dash join preserved at 0.89 em); the
Typst family +1 clean newline each — the contacts split cured, the alnum streams
identical HEAD↔final; the live UI verify passed (name-first, zero U+FFFD, aiScore 23,
**contactsSplit TRUE in the stored cvText**, the sweep by the REAL ids, the DB pristine
through direct Prisma reads); the 82nd deploy non-visual (login-side-only, the churn
pattern's twelfth repeat); the mobile-nav pair **PARITY** (no Tailwind v4 regression).

## The round's traps

The queue hypothesis refuted by measurement (every queued hypothesis gets measured
before it gets coded); the artifact join (a verdict matcher's nearest-occurrence forms
read page-boundary adjacencies as joins — the bbox-layout line membership is the only
authoritative verdict); the eval-escape mangling (template-literal eval expressions need
fromCharCode for \n/\uXXXX); the in-memory login rate limiter (10/15-min — restart the
standalone to clear); the mutation-runner restore path (restore to the EXACT filename
and re-verify green after every leg).

## Next steps when you're ready

The r119 queue is armed in the worklog — the sub-13 em alnum-rich toward-splits (the
"Jun 2018" 5.1 em pair + the ReportLab 8.7–9.4 em table rows, now armed with this
round's census data: poppler splits ALL same-baseline word gaps ≥ ~1 em; a
vertical-alignment or same-line-context license is the candidate material), the
ReportLab TOC dot-order divergence (the ORDER class), and the November 3 security
release watch (the patch bump decision) lead it.
