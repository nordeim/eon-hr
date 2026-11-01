# Remediation Plan — Session 113 / Parity Round 112

The 18th-writer round. The hunt took **WeasyPrint** — the Python
HTML-to-PDF engine (v68.0, the official pip release) behind many
CV/invoice/document pipelines in the Python ecosystem. The measured
specimen (a modern-cv-shaped resume compiled from genuine HTML/CSS) read
**alnums EXACT (692/692) as LETTER SOUP** — "J o h n   S m i t h" where
pdftotext reads "John Smith" — the count-pin blind spot class, the second
consecutive round (an alnum pin proves consistency, not form). The 77th
deploy watch read a login-side JS churn (render byte-identical →
NON-VISUAL); the app side QUIET at the r42 baseline.

## The opening read (the 77th-deploy watch)

| Leg | Result |
| --- | --- |
| Login asset census | JS `index-CXmO9oF_` → **`index-CcEolDtM`** (moved), CSS `index-BHjkUcdg` (unchanged) → **THE 77th DEPLOY, login-side only** (`scripts/r113-login-probe.mjs`, `docs/screenshots/r113-probe-login-ref.png`) |
| Login render | BYTE-IDENTICAL to the standing `69aa4241…` baseline → NON-VISUAL (the churn pattern's eighth repeat) |
| App-side assets | `index-C-IrDy5f` / `index-BGNH4KkS` — **QUIET, the r42 baseline holds** (`scripts/r113-app-census.mjs`) |
| Mobile-nav pair (390×844, the user's named focus) | **PARITY** — both sides 28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer (REF 16 items, Close `display:none`; clone 15, the a11y supersets); the menu cycle `/training`: REF STILL-OPEN (the 69th's regression through its EIGHTH deploy), clone AUTO-CLOSED (the pinned superset); `/employeedetail` REF 66 vs clone 247 nodes (the standing hold); **no Tailwind v4 regression — identical geometry** (`scripts/r113-nav-pair.mjs`) |

## THE HUNT (the 18th writer family)

- **Target selection**: CV-relevant writers not yet in the corpus. The
  quick probes first — pdfkit (Node) and jsPDF (browser) both read
  **100.00% clean** (base-14 simple-font writers; the standing decode
  paths already cover them). **WeasyPrint 68.0** (pip) is the genuine
  18th family: the Pango-text-layout engine with its own PDF writer,
  the standard Python document/CV/invoice path.
- **The specimens**: a modern-cv-shaped resume
  (`scripts/r113-weasy-probe.py`'s generator class) plus five variants
  pinning the pattern's generality — no-float control, float-last-in-DOM,
  absolutely-positioned box, two pages, letter-spaced display text
  (`scripts/r113-weasy-variants.py`).
- **The HEAD measurement**: alnums EXACT (692/692 — the hex-atom decode
  was already sound) but the body text read as **LETTER SOUP** — every
  glyph separated. The h2 headings (CSS `letter-spacing: 1pt`) read
  JOINED while the body read SPACED — the discriminating clue.

## THE FINDING

### R113-A — the explicit-zero kern (the WeasyPrint per-glyph form)

WeasyPrint writes every glyph as its own hex atom with an **explicit `0`
kern** between pairs: `[<0030>0<0044>0<0055>0<0003>…] TJ` is "Mar " under
the font's ToUnicode. The TJ-array internals' `kern !== 0` check
conflated two different writer intents:

- an **explicit NUMBER token** (even one summing to zero) — the writer's
  contiguous-placement intent (the kern adjustment is exactly 0);
- the **ABSENCE of a number** — the W3C dummy.pdf shape, whose adjacent
  atoms are separate text runs and keep the standing space join
  (the R99-B contract, pinned by a standing spec).

A `0` kern fell through `kern !== 0` to the token-free adjacency → the
space join fired on every glyph pair → the soup. The letter-spaced
headings carried positive kerns (+584 thousandths at 16px/1pt — the
r102 sign census joins positive kerns at any magnitude) which is why
they alone read correctly.

**The fix:** `sawNum` — a boolean tracking whether a NUMBER token has
appeared since the last atom. The trigger becomes `kern !== 0 || sawNum`;
a sawNum with a 0 sum sets `moved` + `pendingEm = 0` → the glyph-advance
join; the flag resets at every atom push (the token-free adjacency after
a kerned pair keeps its space); `fromKern` rides `sawNum` (a
kern-decided gap is never conditional). **Zero blast radius:** all 17
standing corpus members BYTE-IDENTICAL through the prototype
(member-for-member full-text md5s measured before the port).

**The hoist interaction (measured):** the R112-A reading-order repair
FIRES on WeasyPrint too — the engine paints floated boxes at the stream
head (the same class as Chromium), and all seven guards pass on the
measured geometry (floats at device y 577/518, the flow starting at 761):
the merged output reads name-first with the dates landing at their
layout position (position 402 on the probe).

**The residual (documented):** the entry-local date order — ours reads
role-then-date, pdftotext reads date-then-role (its line clustering
splits the 1.1-unit baseline offset into separate lines). All five
standing ORDER probes match member-for-member; the conservative bar
keeps the current drain rule (the r112 single-float-borderline posture).

## THE TDD ROUND

- **RED 3/3** at HEAD with the exact designed signatures — the per-glyph
  zero-kern form ("J o h n   S m i t h !"), the genuine stream slice
  (the flip Tm + the 54 kern + the line move), and the net-zero
  multi-number form ("Joh n Smi th").
- **2 born-green guards** — the reset leg (the token-free adjacency
  after a kerned pair keeps its space) and the mixed form (the -322 gap
  keeps its space inside a zero-kern array).
- **GREEN 1092/1092** = 1087 standing + 5 net new
  (`tests/unit/cv-text.test.ts`).
- **MUTATIONS** (each reverted in isolation, the file re-verified green
  after): M1 [the repair removed] exactly **3** · M2 [the sawNum reset
  removed] exactly **1**.
- **The fixture-padding lesson (re-learned):** the first draft of the
  specs hit the `<40-alphanumeric` yield guard (empty extractions) — the
  standing specs pad their fixtures with a long leading literal; the
  padding replace for the stream-slice spec silently missed (an escaping
  mismatch) and read as an assertion failure until re-verified against
  the direct probe.

## THE REAL-FILE GROUND TRUTH

All SEVENTEEN standing members **BYTE-IDENTICAL** through the final
source (full-text md5: arXiv 4d55b9e838 · dvipdfmx 997b1521c7 · fontspec
dc11638357 · IRS 3b8da08420 · LO Calc 4e6f6a0c70 · QUARTZ 7c7e6529b8 ·
ReportLab 155ca50888 · Prawn 82da488f2d · the four Typst members · the
five Skia members) — all seventeen alnum pins hold. The six WEASYPRINT
members: **692/692 · 423/423 · 438/438 · 433/433 · 1616/1616 · 243/243
— each EXACTLY pdftotext's count (100.00%), zero soup, zero U+FFFD**,
and the ORDER probes match pdftotext member-for-member (name before
dates, role before its bullet, summary before experience, skills before
certifications, education after experience). **THE CORPUS GROWS TO 24
MEMBERS, 18 WRITER FAMILIES.**

## THE LIVE UI VERIFY (the r104 protocol)

A WeasyPrint-shaped probe CV (the "r113 weasy probe" name — reads
"r 1 1 3   w e a s y   p r o b e" at HEAD) through the recruitment
AI-CV-Upload tab on the remediated standalone build → the stored cvText
opens **"r113 weasy probe Senior HR Manager r113.weasy@example.com · "**
with the floated dates at position 402 (name-first), zero U+FFFD,
aiScore 23. The sweep-regex job-id misprint recurred (the r112 class —
unknown-id DELETEs are no-ops); the DB verified pristine through direct
Prisma reads (1 user / 0 candidates / 3 job postings) and the probe
swept by its real id.

## THE AUDIT LEGS

- **The session-112 audit**: R112-A re-verified structurally at HEAD
  (the `repairHoistedPrefix` seven-guard signature, the tracker hooks,
  the corpus pins) — gates green at the documented 1087.
- **The neo-crm layer check**: s203/s204/s205 landed since the last
  consumed layer — the **s205 ENV-FACE TOTALITY doctrine transferred**:
  the eon-hr census found the app face accurate (`DATABASE_URL` +
  `AUTH_SECRET` only, comment-stripped src/ walk) but **`E2E_PORT`
  undocumented** (playwright.config.ts:21) — cured in `.env.example`
  (the informational tooling block; the defaults stay authoritative).
  The full test-side totality census is queued for r114.
- **The advisory state**: exactly the documented standing census (the
  deepmerge-ts dev-chain high + the minimatch moderate — both
  dev-toolchain transitive, zero runtime exposure). The patch watch:
  next 16.4.3 published (non-security — font URLs, proxy runtime, OTel,
  the standalone React bootstrap) → the **^16.4.2 HOLD stands**.
- **The corpus re-sourced and verified FIRST**: all 17 pins held at HEAD
  before any change (md5-exact files: LO Calc dbb10a2b…, QUARTZ
  27575d59…, ReportLab 0f64df85…, Prawn 699ebcab…; the Typst specimens
  recompiled with the compile date PINNED to "October 31, 2026" — the
  coverletters' embedded `datetime.today()` made the pins compile-date
  dependent, now deterministic).

## Gates

lint 0/0 · tsc ✓ · **1092/1092 unit** (1087 + 5 net new) · build ✓
(env -u DATABASE_URL; NODE_OPTIONS=--max-old-space-size=3072) · E2E the
standing 559 net (the zero-kern fix rides the unit layer per the
r100/r102 documented split) · DB pristine.

## The evidence chain

The r113 PNGs under `docs/screenshots/`: the byte-identical login probe,
the REF + clone mobile-nav pair on the remediated build, the desktop set
(login, dashboard, employees, recruitment, the CV tab, loans), the
WeasyPrint-CV tab capture.

## The ToDo list (the plan as executed)

- [x] The 77th-deploy watch: login probe (JS moved, render byte-identical
      → NON-VISUAL) + app-side census (QUIET)
- [x] The mobile-nav pair on the remediated build: PARITY (the user's
      named focus; the REF stay-open regression persists through its
      eighth deploy — the classification STANDS)
- [x] The audit of the session-112 changes (R112-A re-verified
      structurally; the gates green at the documented 1087)
- [x] The corpus re-sourced and all 17 pins verified at HEAD (the Typst
      compile-date pin making the corpus deterministic)
- [x] The hunt: WeasyPrint 68.0 (six specimens — the pdfkit/jsPDF probes
      read clean first), the HEAD measurement — alnums exact, SOUP
- [x] The prototype + the blast radius (all 17 members byte-identical
      through the prototype before the port; the hoist-repair
      interaction measured — all seven guards pass)
- [x] RED 3/3 → GREEN 1092/1092 → mutations M1 (3) + M2 (1) exact (the
      fixture-padding trap caught in-round)
- [x] The real-file ground truth (17 byte-identical, the 6 WeasyPrint
      members at 100.00% with order probes matching pdftotext)
- [x] The live UI verify (the r104 protocol; the sweep-regex misprint
      recurred — the DB verified pristine through direct Prisma reads)
- [x] The env-face census (the neo-crm s205 transfer): `E2E_PORT`
      documented in `.env.example`
- [x] Build + screenshots + the E2E gate
- [x] The docs layer (this plan + the session log + the AGENTS
      session-113 layer + the SKILL v4.0.0 §125 + the CLAUDE/README/
      AGENTS count lockstep 1092 + 559 = 1651 + the worklog round-112
      entry)
- [x] Commit + push to main via the SSH wrapper
