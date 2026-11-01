# Session 257 — Session 112 / Parity Round 111 (THE 17th-WRITER ROUND)

The working log of round 111 (session 112): the hunt took the
**17th writer family — Chromium/Skia print-to-PDF** (headless
Chromium's `page.pdf()`, the modern "Download CV" path — the repo's own
Playwright chromium compiled the specimens). The first measurement read
**alnums EXACT (1553/1553) with the READING ORDER WRONG** — Chromium
paints floated boxes before the in-flow content, so a right-floated date
column hoisted above the candidate's name in the stored cvText. The fix
is a device-space position tracker plus a seven-guard hoist repair, all
TDD-first. The round continues the standing program: opening deploy read
→ the hunt → the prototype-measured blast radius → RED/GREEN/mutations
→ the real-file ground truth → the live UI verify → gates → docs.

## The opening read (the 76th-deploy watch)

- **THE 76th DEPLOY detected** — login JS `index-BFu7mt5f`→`index-CXmO9oF_`
  (the CSS quiet), but the render is **BYTE-IDENTICAL** to the standing
  `69aa4241…` baseline → NON-VISUAL (the churn pattern's seventh repeat).
  The app side QUIET at the r42 baseline.
- **The mobile-nav pair (the user's named focus): PARITY** — both sides
  28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer (REF 16
  items, Close `display:none`; clone 15, the a11y supersets); the menu
  cycle `/training`: REF STILL-OPEN (the 69th's regression through its
  SEVENTH deploy — the classification STANDS), clone AUTO-CLOSED (the
  pinned superset); `/employeedetail` REF 66 vs clone 248 nodes (the
  standing hold); **no Tailwind v4 regression — identical geometry**.

## The hunt

1. The corpus re-sourced and verified first: **all 12 pins hold at HEAD**
   (md5-exact re-downloads — LO Calc `dbb10a2b…`, QUARTZ `27575d59…`,
   Prawn `699ebcab…`, ReportLab `0f64df85…`; the four Typst specimens
   still pinned at pdftotext-exact).
2. The audit of the session-111 changes: R111-A/B/C re-verified
   structurally against the remediation plan (the `unescapeRaw` +
   own-binding-chain literal CID decode, the `[Ff]` five sites, the
   nested-paren class) — gates green at the documented 1079.
3. Writer target: **Chromium/Skia print-to-PDF** — the most common modern
   CV emission path, and the repo's Playwright chromium compiles genuine
   specimens (the modern-cv-style resume + four variants: no-float
   control, float-last-in-DOM, absolutely-positioned, two pages).
4. **The HEAD measurement**: alnums EXACT (1553/1553 — the decode paths
   were already sound) but the four floated date spans read FIRST, before
   the name — **an ORDER defect invisible to every alnum pin** (count
   pins prove consistency, not order). The variants pinned the pattern:
   floats hoist regardless of DOM position; absolute boxes do not hoist;
   each page's stream carries its own hoist.

## The defect and the fix

- **R112-A — the hoisted-prefix repair**: Chromium's print pipeline paints
  FLOATED boxes before the in-flow content; the extractor joined pieces
  in stream order, so every float read at the document's head regardless
  of its layout position. pdftotext emits the merged reading order. THE
  FIX: a device-space position tracker (CTM through `cm` concatenation
  with a bounded `q/Q` stack; the text-line matrix through `BT`/`Tm`/`Td`
  — `px`/`py`/`ps` per piece; only EXPLICIT placements count, so the IRS
  XFA-XML garbage riding the BT-default origin never positions) + the
  guarded merge (the prefix stably merges into the UNTOUCHED suffix by
  descending y with a same-line x tiebreak; relocated block heads carry
  `"\n"` seps).
- **The seven-guard signature — every guard born of a measured false
  positive**: the column (suffix-above), the QUARTZ top-edge stray
  (step2), the ReportLab running-header furniture (suffix-max), the arXiv
  scaled figure spaces (suffix-max), the LO Calc page-floor footer
  (reading-band — a VERIFIED pdftotext improvement deliberately left to
  stream order by the conservative bar), the IRS XFA garbage
  (explicit-positioning), the ReportLab TOC trailing header
  (suffix-substance at two-thirds — a plain majority bound MISFIRED on
  the short-CV probe class at 53%).
- **The guard-ladder discipline**: the prototype measured every form
  against the corpus — the first draft's "exactly one ascent" blocked the
  TARGET ITSELF (the specimen's skills section is `column-count: 2`); the
  "first ascent" form then opened three corpus false fires; each guard
  was added only after its false positive was measured and member-diffed.
  The two fixture-geometry errors (the stray, the XFA tail) were caught
  by 0-RED mutations — other guards covered the flawed fixtures.

## The TDD round

RED 2/2 at HEAD with the exact designed signatures (`indexOf("Mar 2021")
= 0` — the dates hoisted to position 0) + 6 born-green guards (one per
guard leg) → GREEN **1087/1087** (1079 + 8 net new) → **MUTATIONS: M1
[the repair removed] exactly 2 · M2 [suffix-substance] exactly 1 · M2b
[column suffix-above] exactly 1 · M3 [step2] exactly 1 · M4 [suffix-max]
exactly 1 · M5 [reading-band] exactly 1 · M6 [explicit-positioning]
exactly 1** — the restored file re-verified green after each.

## The ground truth

All TWELVE standing members **BYTE-IDENTICAL** through the final source
(full-text md5: arXiv 4d55b9e838 · dvipdfmx 997b1521c7 · fontspec
dc11638357 · IRS 3b8da08420 · LO Calc 4e6f6a0c70 · QUARTZ 7c7e6529b8 ·
ReportLab 155ca50888 · Prawn 82da488f2d · the four Typst members) — all
twelve alnum pins hold. The five SKIA members: **1553/1553 · 438/438 ·
433/433 · 423/423 · 1616/1616 alnums — each EXACTLY pdftotext's count
(100.00%)** — and the ORDER probes match pdftotext member-for-member
(name before dates, entry line before its date, summary before
experience, skills before certifications, education after experience).
**THE CORPUS GROWS TO 18 MEMBERS, 17 WRITER FAMILIES.**

## The live UI verify (the r104 protocol)

A Chromium-shaped probe CV (floated dates hoisted above the "r112 skia
probe" name — reads DATES-FIRST at HEAD) through the recruitment
AI-CV-Upload tab on the remediated standalone build → the stored cvText
opens **"r112 skia probe Senior HR Manager r112.skia@example.com…"**
with the dates at position 389 (name-first: TRUE), zero U+FFFD, aiScore
23. The DB swept pristine (1 user / 0 candidates / 3 job postings,
verified directly through SQLite — the sweep regex's job-id misprint
["swept job-hrmanager" ×5 on unknown-id no-op DELETEs] caught and the
probe candidate swept by its real id).

## The environment notes

- The documented DATABASE_URL trap live again (an exported
  `file:/home/z/my-project/db/custom.db` outside the repo) — `env -u
  DATABASE_URL` on every Prisma/server/build leg.
- The E2E runner kills the :3200 standalone holder by port (the r107
  lesson) — the screenshots run BEFORE the E2E gate.
- The unit/E2E split: the reading-order fix rides the unit layer (the
  r100/r102 documented split — the E2E corpus pins the UI surfaces, the
  unit layer pins the extractor).

## Gates

lint 0/0 · tsc ✓ · **1087/1087 unit** (1079 + 8 net new) · build ✓ ·
E2E **559/559** · DB pristine. The evidence chain: 12 r112 PNGs (the
byte-identical login probe, the REF + clone mobile-nav pair, the desktop
set incl. the CV tab + the Skia-CV tab capture).
