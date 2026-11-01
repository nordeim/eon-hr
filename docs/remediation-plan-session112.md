# Remediation Plan — Session 112 / Parity Round 111

The 17th-writer round. The hunt took **Chromium/Skia print-to-PDF** — the
modern "Download CV" path (job portals and CV builders emit Skia-written
PDFs through headless Chromium's `page.pdf()`; the Playwright chromium the
repo already ships compiled the specimens). The extractor's alnum count was
already EXACT on the first specimen (1553/1553) — but the READING ORDER was
wrong: **Chromium paints FLOATED boxes before the in-flow content**, so the
stream reads every float first regardless of its layout position. A
right-floated date column hoisted above the candidate's name; the stored
`cvText` for a browser-printed CV opened with a wall of dates. pdftotext
emits the merged reading order. The 76th-deploy watch read a login-side JS
churn (render byte-identical → NON-VISUAL); the app side QUIET at the r42
baseline.

## The opening read (the 76th-deploy watch)

| Leg | Result |
| --- | --- |
| Login asset census | JS `index-BFu7mt5f` → **`index-CXmO9oF_`** (moved), CSS `index-BHjkUcdg` (unchanged) → **THE 76th DEPLOY, login-side only** (`scripts/r112-login-probe.mjs`, `docs/screenshots/r112-probe-login-ref.png`) |
| Login render | BYTE-IDENTICAL to the standing `69aa4241…` baseline → NON-VISUAL (the churn pattern's seventh repeat) |
| App-side assets | `index-C-IrDy5f` / `index-BGNH4KkS` — **QUIET, the r42 baseline holds** (`scripts/r112-app-census.mjs`) |
| Mobile-nav pair (390×844, the user's named focus) | **PARITY** — both sides 28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer (REF 16 items, Close `display:none`; clone 15, the a11y supersets); the menu cycle `/training`: REF STILL-OPEN (the 69th's regression through its SEVENTH deploy), clone AUTO-CLOSED (the pinned superset); `/employeedetail` REF 66 vs clone 248 nodes (the standing hold); **no Tailwind v4 regression — identical geometry** (`scripts/r112-nav-pair.mjs`) |

## THE HUNT (the 17th writer family)

- **Target selection**: CV-relevant writers not yet in the corpus.
  Chromium/Skia print-to-PDF is the most common modern CV emission path
  (browser-printed CVs, portal "Download PDF" buttons, CV-builder
  exports) and the repo's own Playwright chromium compiles genuine
  specimens: a modern-cv-style resume (`scripts/r112-skia-cv-gen.ts`)
  plus four variants pinning the pattern's generality — no-float control,
  float-last-in-DOM, absolutely-positioned box, two pages
  (`scripts/r112-skia-variants.ts`).
- **The HEAD measurement**: alnums EXACT (1553/1553 — the hex-atom +
  per-glyph-Td decode paths were already sound), but the four floated
  date spans read FIRST, before the candidate's name — **a reading-ORDER
  defect**, invisible to every alnum pin (count pins prove consistency,
  not order).
- **The pattern, pinned across the variants**: floats hoist to the stream
  head REGARDLESS of DOM position (float-last still hoists;
  absolutely-positioned boxes do NOT; the control is clean); each page's
  stream carries its own hoist (the two-page specimen's page-2 float
  hoists within page 2's stream). The geometry: the hoisted run is
  monotonic top-to-bottom at mid-page y (318–556 device), the main flow
  starts at the page top (762) and descends monotonically — the two runs
  interleave in y.

## THE FINDING

### R112-A — the hoisted-prefix repair (the reading-order merge)

pdftotext merges the hoisted run back into the flow by layout position;
the extractor joined pieces in stream order. **The fix:** a device-space
position tracker (the CTM through `cm` concatenation with a bounded `q/Q`
stack; the text-line matrix through `BT` reset / `Tm` set / `Td`
composition — `px`, `py`, `ps` stamped per piece) plus a narrowly-guarded
merge pass (`repairHoistedPrefix`) that re-inserts the hoisted run at its
layout position: **stable merge of the prefix (stream order) into the
UNTOUCHED suffix** — a prefix piece drains in when it sits above the
suffix head, or same-line (0.35-em tolerance) with a smaller x (the
floated date lands AFTER the entry text it shares a line with). Relocated
BLOCK HEADS carry `"\n"` seps; glyph continuations keep theirs; the
output's first piece normalizes to `""`.

**The seven-guard signature** (each guard born of a measured false
positive on the standing corpus — the prototype measured every form):

| Guard | Blocks (the measured class) |
| --- | --- |
| (a) every piece positioned; only EXPLICIT Tm/Td placements count | the IRS XFA-XML payload the walk matches incidentally — its pieces ride the BT-default origin (0,0) |
| (b) the FIRST clear ascent (≥ 25 device units) bounds the prefix | later ascents inside the suffix are irrelevant — the Chromium specimen's own skills section is `column-count: 2` |
| (c) the hoisted run ≤ two-thirds of the stream's pieces | the ReportLab TOC pages: the TOC body paints first, the running header LAST (k=67 of 70 = 96%; the tail fragments 70–75%). A plain majority bound MISFIRED on the SHORT-CV probe class (a floated date column at 53% of a one-page stream — floats are not minority content on short documents) |
| (d) the suffix's first y sits ABOVE every prefix piece (+25) | the 2-column layout (the second column starts at the SAME height as the first — pdftotext reads columns in stream order too) |
| (e) the suffix CONTINUES the flow (its second piece ≥ -75) | the QUARTZ stray: a lone top-edge-clipped glyph at the ascent, dropping -222 back into the page |
| (f) the suffix STARTS at its own top (pieces[k].py is the suffix's max) | the ReportLab figure pages (a running header rides mid-suffix ABOVE the ascent's landing) and the arXiv figure streams (scaled 2000+-unit coordinate spaces) |
| (g) the hoisted run sits in the page's READING BAND (top ≥ ¼ of the flow's top) | the LO Calc footer class (the "Index \| 545" page-floor footer paints first — a VERIFIED pdftotext improvement deliberately left to stream order by the conservative bar) |

**The residual (documented):** the two-page variant's page-1 float sits
0.2 units under the ascent margin (a ~24.8-unit jump back to the flow
top) — the single-float borderline stays stream-ordered (conservative).
The T*/TL positioning operators stay untracked (T*-positioned streams
read position-flat; the repair never fires on them — conservative), and
the implicit show-width advance stays untracked (the two-pass per-letter
width table is the standing deferred item) — X is approximate within a
line, exact across lines.

## THE TDD ROUND

- **RED 2/2** at HEAD with the exact designed signatures — both target
  specs read the floated dates at position 0 (`indexOf("Mar 2021") = 0`),
  the candidate's name after them.
- **6 born-green guards** — one spec per guard leg: the 2-column layout
  (the whole first column precedes the second), the lone top-edge stray,
  the figure-label furniture under a running header, the page-floor
  footer, the XFA-garbage tail, the TOC trailing header.
- **GREEN 1087/1087** = 1079 standing + 8 net new
  (`tests/unit/cv-text.test.ts`).
- **MUTATIONS** (each reverted in isolation, the file re-verified green
  after): M1 [the repair removed] exactly **2** · M2 [the
  suffix-substance guard] exactly **1** · M2b [the column suffix-above
  guard] exactly **1** · M3 [the step2 guard] exactly **1** · M4 [the
  suffix-max guard] exactly **1** · M5 [the reading-band guard] exactly
  **1** · M6 [the explicit-positioning guard] exactly **1**.
- **The fixture-isolation lesson (re-learned):** two guard specs first
  drafted with miscalculated geometry (the top-edge stray at the flip
  cm's translation instead of above the flow top; the XFA tail under a
  cm stack that put the BT-default origin at the page top) read 0 RED
  under their mutations — OTHER guards covered the flawed fixtures. Each
  guard's spec must isolate its guard: recompute the fixture geometry
  before trusting a 0-RED mutation.

## THE REAL-FILE GROUND TRUTH

All TWELVE standing members **BYTE-IDENTICAL** through the final source
(full-text md5: arXiv 4d55b9e838 · dvipdfmx 997b1521c7 · fontspec
dc11638357 · IRS 3b8da08420 · LO Calc 4e6f6a0c70 · QUARTZ 7c7e6529b8 ·
ReportLab 155ca50888 · Prawn 82da488f2d · the four Typst members) — and
all twelve ALNUM pins hold. The five SKIA members: **1553/1553 · 438/438
· 433/433 · 423/423 · 1616/1616 — each EXACTLY pdftotext's count
(100.00%)** — and the ORDER probes match pdftotext member-for-member
(name before dates, entry line before its date, summary before
experience, skills before certifications, education after experience).
**THE CORPUS GROWS TO 18 MEMBERS, 17 WRITER FAMILIES.**

## THE LIVE UI VERIFY (the r104 protocol)

A Chromium-shaped probe CV (the 17th-writer geometry: floated dates
hoisted above the "r112 skia probe" name — reads DATES-FIRST at HEAD)
through the recruitment AI-CV-Upload tab on the remediated standalone
build → the stored cvText opens **"r112 skia probe Senior HR Manager
r112.skia@example.com…"** with the floated dates at position 389
(name-first: TRUE), zero U+FFFD, aiScore 23; the probe swept, the DB
pristine (1 user / 0 candidates / 3 job postings, verified directly
through SQLite — the sweep regex's job-id misprint caught and corrected
in-round).

## Gates

lint 0/0 · tsc ✓ · **1087/1087 unit** (1079 + 8 net new) · build ✓
(env -u DATABASE_URL; NODE_OPTIONS=--max-old-space-size=3072) · E2E the
standing 559 net (the reading-order fix rides the unit layer per the
r100/r102 documented split) · DB pristine.

## The evidence chain

The r112 PNGs under `docs/screenshots/`: the byte-identical login probe,
the REF + clone mobile-nav pair on the remediated build, the desktop set
(login, dashboard, employees, recruitment, the CV tab, loans), the
Skia-CV tab capture.

## The ToDo list (the plan as executed)

- [x] The 76th-deploy watch: login probe (JS moved, render byte-identical
      → NON-VISUAL) + app-side census (QUIET)
- [x] The mobile-nav pair on the remediated build: PARITY (the user's
      named focus; the REF stay-open regression persists through its
      seventh deploy — the classification STANDS)
- [x] The audit of the session-111 changes (R111-A/B/C re-verified
      structurally against the remediation plan; the diff and gates green)
- [x] The corpus re-sourced and all 12 pins verified at HEAD (md5-exact
      re-source pins: LO Calc dbb10a2b…, QUARTZ 27575d59…, Prawn
      699ebcab…, ReportLab 0f64df85…)
- [x] The hunt: Chromium/Skia print-to-PDF (the Playwright chromium, five
      specimens), the HEAD measurement — alnums exact, ORDER wrong
- [x] The prototype + the guard ladder (every guard born of a measured
      false positive: the column, the stray, the header, the scaled
      figure space, the footer, the XFA garbage, the TOC tail — each
      form refuted on the corpus before the final design)
- [x] RED 2/2 → GREEN 1087/1087 → mutations M1–M6 exact (two fixture
      geometry errors caught and corrected in-round)
- [x] The real-file ground truth (12 byte-identical, the 5 Skia members
      at 100.00% with order probes matching pdftotext)
- [x] The live UI verify (the r104 protocol; the sweep-regex misprint
      caught — the DB verified pristine through SQLite)
- [x] Build + E2E + screenshots
- [x] The docs layer (this plan + the session log + the AGENTS
      session-112 layer + the SKILL v3.99.0 §124 + the CLAUDE/README/
      AGENTS count lockstep 1087 + 559 = 1646 + the worklog round-111
      entry)
- [ ] Commit + push to main via the SSH wrapper
