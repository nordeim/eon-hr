# Remediation Plan — Session 116 / Parity Round 115

The cm-carried line-structure round. The r116-queued hunt class — **the
Typst `cm` translations never feed the separator tracker** (the r115
deferral: "the line structure reads space-joined where pdftotext reads
newlines") — became the hunt, and the hunt took the **whole Typst family**:
all four members read alnums EXACT (793/793/897/871 — the count-pin blind
spot class, the FIFTH consecutive round) with **ZERO newlines** where
pdftotext reads 46/46/22/22.

The 80th-deploy watch read **QUIET-NONVISUAL on the login side** (the JS
`DA6CuPbY`→`BgVoVawV`, the CSS `CMHVFeas`→`CapATpwD` — both moved, the
render BYTE-IDENTICAL to the standing `69aa4241…` baseline — the churn
pattern's tenth repeat); the app side QUIET at the r42 baseline.

## The opening read (the 80th-deploy watch)

| Leg | Result |
| --- | --- |
| Login asset census | JS `index-BgVoVawV` (moved), CSS `index-CapATpwD` (moved) — **the 80th deploy, login-side-only**; the render BYTE-IDENTICAL to the standing baseline (`scripts/r116-login-probe.mjs`, `docs/screenshots/r116-probe-login-ref.png`) |
| Login render | BYTE-IDENTICAL to `69aa4241…` (the eleventh consecutive probe capture) |
| App-side assets | `index-C-IrDy5f` / `index-BGNH4KkS` — **QUIET, the r42 baseline holds** (`scripts/r116-app-census.mjs`) |
| Mobile-nav pair (390×844, the user's named focus) | **PARITY** — both sides 28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer (REF 16 items, Close `display:none`; clone 15, the a11y supersets); the menu cycle `/training`: REF STILL-OPEN (the 69th's regression through its ELEVENTH deploy — the classification STANDS), clone AUTO-CLOSED (the pinned superset); `/employeedetail` REF 66 vs clone 248 nodes (the standing hold); **no Tailwind v4 regression — identical geometry** (`scripts/r116-nav-pair.mjs`) |

## THE CORPUS RE-SOURCE (the fresh-sandbox intake)

The /tmp corpus did NOT survive the fresh sandbox — the full re-source (the
r109 protocol): **seven members re-sourced with every extraction pin
BYTE-IDENTICAL at HEAD before any change** — arXiv 2404.16710 (`051ac68a` /
70,646) · dvipdfmx (texdoc.org — the mirrors.ctan.org URL 404'd this round;
the texdoc build extraction-identical `997b1521` / 61,437) · fontspec
(`dc116383` / 106,179) · IRS f1040 (`4166158e` / 5,798) · QUARTZ
`longer.pdf` (**the submodule-repo trail**: the xmlcalabash3 repo moved
`tests/extra-suite` to a submodule — the live path is now
`xmlcalabash/test-suite/test-suite/documents/longer.pdf`, the file md5
`27575d59` EXACT — `7c7e6529` / 2,697) · ReportLab userguide (`0f64df85`
file-exact — `397aa0c2` / 213,160) · Prawn manual (`699ebcab` file-exact —
`404277d9` / 83,657). The **LO Calc member could NOT be re-sourced** (the
LibreOffice docs site restructure; the documented r103 precedent). The
generated families regenerated through their committed generators: the five
**Skia** members (after the pinned-browser install — the fresh install
floated to the 1248 shell, the cache held 1200: `bunx playwright install
chromium`, the r110/r112/r115 trap live for the THIRD consecutive round) —
every pin+ref EXACT; the six **WeasyPrint** members — every pin exact; the
six **fpdf2** members — every pin exact; the four **Typst** members
recompiled (typst 0.15.1 + `@preview/modern-cv` 0.6.0, the pinned date) —
793/793/897/871 EXACT. The **pin-label-swap trap** (the r115 in-round
lesson) recurred in the verification script — three label pairs swapped;
every member verified against its OWN pdftotext count (all sixteen exact).

## THE HUNT (the r116-queued line-structure class — MEASURED ON TYPST)

The recompiled Typst resume read **793/793 alnums with ZERO newlines** where
pdftotext reads 46 — 27 line-structure mismatches, every one a pdftotext
"\n" (or "\n\n") where ours read " ". The anatomy, decoded from the raw
stream: **every word is its own `q / 1 0 0 -1 tx ty cm / BT / Tf / Tm /
show / ET / Q` block** — the flip-y carried by BOTH the `cm` and the `Tm`
(the double flip cancels; the R112-A tracker stamps the untranslated
`(tx, ty)` as the device position), so **the `cm` translation carries the
line position but never feeds the walk's separator tracker** — it only
concatenates the CTM. A line move (ty 792.4873 → 768.3653 → 751.6433…)
therefore reads as the STANDING " " join.

## THE FIX (R116-A — the cm-carried line move)

At assembly, a positioned piece pair whose **DEVICE-space y-delta
≥ 0.5 em** (the max-ps denominator — the hoist repair's tolerance
precedent) upgrades its " " separator to a line break. Three guards,
each born from a measured refutation:

- **The " "-only guard** — never a join (the condGap/kern resolutions
  stand), never an existing "\n". The r115 refutation's mirror: re-breaking
  joins is the same word-fusion class in reverse.
- **The 0.5-em threshold** — the arXiv math accents ride SUB-EM device
  deltas (pdftotext keeps them same-line); the Typst line steps measure
  0.754–2.68 em. Measured separation: the accent deltas stay under, the
  line steps stay over.
- **The both-stamped guard** — only pieces carrying R112-A position stamps
  (an explicit Tm/Td line matrix); the BT-default origin class (the XFA-XML
  garbage) stays blind.

**THE REFUTED FIRST DRAFT (measured, not shipped):** the r115 first draft's
JOIN arm fused the arXiv accents ("ˆinference" where pdftotext reads
"ˆ inference") — this round's cure upgrades ONLY " " separators and never
fuses. A second draft — **the same-line x-order repair** (a maximal run of
pieces sharing an EXACT device py, sorted stably by px — the
pdftotext within-line reading order, targeting the ReportLab TOC's
dots-before-entry form) — was **REFUTED by the IRS member**: the f1040
date-box fields rearranged and word FUSIONS appeared ("YYYYSpouseMM"); the
global x-sort is dead, and the TOC dot-order divergence is deferred to the
r117 queue with the measurements (see the away ledger below).

## THE TDD ROUND

- **RED 2/2** at HEAD with the exact designed signatures — the same-size
  line step ("First\nSecond", was "First Second") and the cross-size
  header-to-contacts step ("John\nSenior", was "John Senior") — after the
  **fixture-geometry verification** caught the `Qq` fusion trap (concatenated
  Typst-block fixtures fuse the closing `Q` and opening `q` into an
  unmatchable token — the word-boundary regex sees neither; the blocks need
  separators).
- **4 born-green guards** — the same-line keep (dy=0 never breaks), the
  arXiv accent guard (0.3 em never breaks), the join guard (a 0.25-em Td
  glyph-advance join survives a 20-unit device shift), the unpositioned
  guard (a stamp-less following block keeps the standing space).
- **One standing spec amended with justification**: the R105-D mixed-form
  hardening (the stale pre-Tm origin) pinned "skia beta" — its synthetic
  fixture's pieces sit ~50 em apart in device space, a TRUE line move; the
  R116-A upgrade correctly reads "skia\nbeta". The spec's CORE guard (the
  stale-origin JOIN never fires — `not.toContain("skiabeta")`) stands
  verbatim; only the separator FORM moved to the positionally-true newline.
- **GREEN 1118/1118** (1112 + 6).
- **THE MUTATION MATRIX** (each reverted in isolation, the file re-verified
  green after): M1 [the rule removed] exactly **3** (the 2 hunt specs + the
  amended R105-D) · M2 [the sep guard removed] exactly **1** · M3 [the
  threshold zeroed] exactly **19** · M4 [the stamp guard removed] exactly
  **1** (after the unpositioned-guard fixture was strengthened in-round —
  the first draft's fixture had no teeth against the mutation).

## THE REAL-FILE GROUND TRUTH

All four **TYPST members 100.00% of pdftotext** (793/793/897/871) with the
**LINE STRUCTURE RESTORED** — newlines 0→22/22/17/17 against pdftotext's
46/46/22/22 (the residual = pdftotext's blank lines between sections); the
boundary-level line-separator agreement on the coverletters 158/159 and
153/154; the five ORDER probes matching; the FORM probes (joined name,
single-spaced body, no doubled gaps, line-broken header, line-broken
section) passing; zero U+FFFD. The **byte-identical members HOLD**: QUARTZ
`7c7e6529` · Prawn `404277d9`. The **five RE-PINNED members** (the r111/r115
precedent): arXiv `4358a2f1` (nl 1584→1831) · dvipdfmx `efc40f81`
(2051→2080) · fontspec `09396ac8` (3762→3777) · IRS `eeb0ce16` (352→354) ·
ReportLab `31d88eec` (5135→5641) — **every alnum pin holds** (70,646 /
61,437 / 106,179 / 5,798 / 213,160).

**THE DRIFT LEDGER** (the difflib-aligned word-stream classifier,
`scripts/r116-toward-away-v2.py`): **457 boundaries TOWARD pdftotext, 73
AWAY — every away boundary is the ReportLab TOC phase-shift class**: the TOC
paints its leader-dot run BEFORE the entry it belongs to (same baseline,
larger x), so our stream order pairs entry(k) with dots(k+1); the R116-A
newline at that boundary is geometrically TRUE (they sit a line step apart)
and the TOC rows now group one-per-line (the line STRUCTURE matches
pdftotext exactly — verified member-locally), but the word-pair alignment
reads "away" because pdftotext pairs entry(k) with dots(k) (its own,
same-line). The within-line dot ORDER divergence is pre-existing at HEAD
(documented in the r117 queue with these measurements). Zero word fusions,
zero word-stream changes, zero alnum changes anywhere in the corpus.

## THE AUDIT LEGS

- The session-115 changes (R115-A/B/C + the hex-order cure) re-verified
  structurally at HEAD before any change; the baseline gates green at the
  documented 1112.
- The advisory state: the documented standing census (deepmerge-ts
  dev-chain high + minimatch moderate — both dev-toolchain transitive,
  zero runtime exposure). The patch watch: 16.4.3 remains the latest
  (16.5.0-canary.36 is a canary) → the **^16.4.2 HOLD stands**.
- The neo-crm layer check: HEAD at s207 (the s206/s207 transfers stand);
  the newest commit adds the session transcript only — no new layer.
- The browser-version trap pre-cured in-round (the 1248 shell install).

## THE LIVE UI VERIFY (the r104 protocol)

The r116 Typst probe CV through the real upload flow reads "r116 typst
probe Probe Senior HR Manager San Francisco, CA…" name-first (namePos 0,
dates 564), zero U+FFFD, aiScore 23. **The sweep-regex job-id misprint
class RECURRED and was caught in-round** (the sweep's `[^}]*?` spanned JSON
objects and grabbed a JOB's id — the r115 lesson, repeating): the sweep
rebuilt to PARSE the response and delete by the candidate's REAL id; the DB
verified pristine through direct Prisma reads (1 user / 1 employee /
0 candidates / 2 balances / 0 payroll / 0 expenses).

## Gates

lint 0/0 · tsc ✓ · **1118/1118 unit** (1112 + 6 hunt) · build ✓ (116/116;
env -u DATABASE_URL; NODE_OPTIONS=--max-old-space-size=3072) · E2E the
standing 559 net (the fix rides the unit layer per the r100/r102 documented
split) · DB pristine.

## The evidence chain

The 12 r116 PNGs under `docs/screenshots/`: the byte-identical login
probe, the REF + clone mobile-nav pair (open + post-nav drawer states),
the desktop set (login, dashboard, employees, recruitment, the CV tab —
re-captured with a real tab click after the `?tab=cv` param form proved
byte-identical to the plain capture, loans), and the Typst-CV tab capture.

## The ToDo list (the plan as executed)

- [x] The 80th-deploy watch: QUIET-NONVISUAL (login-side asset churn, the
      render byte-identical; the app side at the r42 baseline)
- [x] The mobile-nav pair on the standing build: PARITY (the user's named
      focus; the REF stay-open regression through its eleventh deploy —
      the classification STANDS)
- [x] The audit of the session-115 changes (R115-A/B/C re-verified
      structurally; the gates green at the documented 1112)
- [x] The corpus re-source (the fresh sandbox): 7 re-sourced members
      byte-identical at HEAD (dvipdfmx via texdoc.org — the CTAN mirror
      404; QUARTZ via the submodule-repo trail); LO Calc not re-sourceable
      (documented); the generated families regenerated (Skia/WeasyPrint/
      fpdf2/Typst) — all sixteen exact against their own pdftotext counts
- [x] The hunt: the r116-queued line-structure class MEASURED on the
      recompiled Typst family (793/793 alnums, ZERO newlines)
- [x] The prototype blast radius: the same-line x-order draft REFUTED by
      the IRS member (date-box word fusions); the refined R116-A rule
      landed at zero word-fusion risk
- [x] The fixture-geometry verification (the `Qq` fusion trap), then
      RED 2/2 → GREEN 1118/1118 → the mutations M1 (3) + M2 (1) + M3 (19)
      + M4 (1) exact
- [x] The real-file ground truth (2 byte-identical, 5 re-pinned with the
      457-toward/73-away-phase-shift ledger, the Typst family at 100.00%
      with the line structure restored)
- [x] The live UI verify (the r104 protocol): the probe CV reads
      name-first, zero U+FFFD; the sweep-regex misprint caught and cured
      in-round; the DB verified pristine
- [x] Build (116/116) + the 12 screenshots + the E2E gate
- [x] The docs layer (this plan + the narrative + the AGENTS session-116
      layer + the SKILL §128 + the CLAUDE/README/AGENTS count lockstep
      1118 + 559 = 1677 + the worklog round-115 entry)
- [x] Commit + push to main via the SSH wrapper
