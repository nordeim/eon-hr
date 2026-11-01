# Session 259 — Session 113 / Parity Round 112 (THE 18th-WRITER ROUND)

The working log of round 112 (session 113): the hunt took the
**18th writer family — WeasyPrint 68.0** (the Python HTML-to-PDF engine
behind many CV/invoice/document pipelines, sourced through the official
pip release and compiled from genuine HTML/CSS). The first measurement
read **alnums EXACT (692/692) as LETTER SOUP** — "J o h n   S m i t h"
where pdftotext reads "John Smith". The root cause is a one-token
conflation in the TJ-array internals: WeasyPrint writes an **explicit
`0` kern between every glyph pair**, and the `kern !== 0` trigger read
the writer's contiguous-placement intent as the token-free adjacency
(the W3C dummy.pdf shape, which keeps the standing space join). The fix
is `sawNum` — a number-token tracker — cured TDD-first with a zero
blast radius. The round continues the standing program: opening deploy
read → the hunt → the prototype-measured blast radius →
RED/GREEN/mutations → the real-file ground truth → the live UI verify →
gates → docs.

## The opening read (the 77th-deploy watch)

- **THE 77th DEPLOY detected** — login JS `index-CXmO9oF_`→`index-CcEolDtM`
  (the CSS quiet), but the render is **BYTE-IDENTICAL** to the standing
  `69aa4241…` baseline → NON-VISUAL (the churn pattern's eighth repeat).
  The app side QUIET at the r42 baseline.
- **The mobile-nav pair (the user's named focus): PARITY** — both sides
  28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer (REF 16
  items, Close `display:none`; clone 15, the a11y supersets); the menu
  cycle `/training`: REF STILL-OPEN (the 69th's regression through its
  EIGHTH deploy — the classification STANDS), clone AUTO-CLOSED (the
  pinned superset); `/employeedetail` REF 66 vs clone 247 nodes (the
  standing hold); **no Tailwind v4 regression — identical geometry**.

## The hunt

1. The corpus re-sourced and verified first: **all 17 pins hold at HEAD**
   (md5-exact re-downloads — LO Calc dbb10a2b…, QUARTZ 27575d59…,
   ReportLab 0f64df85…, Prawn 699ebcab…; the Typst specimens recompiled
   with the compile date pinned to "October 31, 2026" — the coverletters
   embed `datetime.today()`, which had made the pins compile-date
   dependent; the corpus is now deterministic).
2. The quick writer probes: **pdfkit and jsPDF both read 100.00% clean**
   (the Node/browser "Download CV" paths are base-14 simple-font writers
   the standing decode already covers).
3. Writer target: **WeasyPrint 68.0** — the Python HTML-to-PDF engine
   (Pango text layout, its own PDF writer). The specimen: a
   modern-cv-shaped resume from genuine HTML/CSS + five variants
   (no-float control, float-last-in-DOM, absolutely-positioned, two
   pages, letter-spaced display text).
4. **The HEAD measurement**: alnums EXACT (692/692) but the body read as
   **LETTER SOUP** — every glyph spaced. The discriminating clue: the
   CSS-letter-spaced headings read JOINED while the plain body read
   SPACED (the headings carry +584-thousandth kerns; the body carries
   explicit `0` kerns).

## The defect and the fix

- **R113-A — the explicit-zero kern**: WeasyPrint writes every glyph as
  its own hex atom with an explicit `0` between pairs —
  `[<0030>0<0044>0<0055>…] TJ`. The TJ-internals' `kern !== 0` trigger
  conflated the explicit-number form (the writer's contiguous intent —
  the adjustment is exactly zero) with the token-free adjacency (the
  dummy.pdf shape, a separate-runs form that keeps the standing space
  join). THE FIX: `sawNum` — a number-token tracker; `kern !== 0 ||
  sawNum` triggers the kern decision (a 0 sum joins), the flag resets at
  every atom push, and `fromKern` rides `sawNum` (a kern-decided gap is
  never conditional).
- **The hoist interaction (measured)**: the R112-A reading-order repair
  fires on WeasyPrint too — the engine paints floats at the stream head
  (the Chromium class) and all seven guards pass on the measured
  geometry; the probe's stored text reads name-first with the dates at
  their layout position.
- **The residual (documented)**: the entry-local date order — ours
  role-then-date, pdftotext date-then-role (its line clustering splits
  the 1.1-unit baseline offset). All five standing ORDER probes match;
  the conservative bar keeps the drain rule.

## The TDD round

RED 3/3 at HEAD with the exact designed signatures (the per-glyph
zero-kern soup, the genuine stream slice with the flip Tm + the 54 kern,
the net-zero multi-number form) + 2 born-green guards (the reset leg,
the mixed -322 gap form) → GREEN **1092/1092** (1087 + 5 net new) →
**MUTATIONS: M1 [the repair removed] exactly 3 · M2 [the sawNum reset
removed] exactly 1** — the restored file re-verified green after each.
Two in-round traps: the first spec draft hit the `<40-alphanumeric` yield
guard (empty extractions — the standing specs pad their fixtures), and
one padding replace silently missed on an escaping mismatch.

## The ground truth

All SEVENTEEN standing members **BYTE-IDENTICAL** through the final
source (full-text md5: arXiv 4d55b9e838 · dvipdfmx 997b1521c7 · fontspec
dc11638357 · IRS 3b8da08420 · LO Calc 4e6f6a0c70 · QUARTZ 7c7e6529b8 ·
ReportLab 155ca50888 · Prawn 82da488f2d · the four Typst members · the
five Skia members) — all seventeen alnum pins hold. The six WEASYPRINT
members: **692/692 · 423/423 · 438/438 · 433/433 · 1616/1616 · 243/243
— each EXACTLY pdftotext's count (100.00%)**, zero soup, zero U+FFFD,
the ORDER probes matching member-for-member. **THE CORPUS GROWS TO 24
MEMBERS, 18 WRITER FAMILIES.**

## The live UI verify (the r104 protocol)

A WeasyPrint-shaped probe CV (reads "r 1 1 3   w e a s y   p r o b e"
at HEAD) through the recruitment AI-CV-Upload tab on the remediated
standalone build → the stored cvText opens **"r113 weasy probe Senior HR
Manager r113.weasy@example.com · "** with the dates at position 402
(name-first), zero U+FFFD, aiScore 23. The sweep-regex job-id misprint
recurred (the r112 class — unknown-id DELETEs are no-ops); the DB
verified pristine through direct Prisma reads (1 user / 0 candidates /
3 job postings) and the probe swept by its real id.

## The audit legs

- The session-112 changes (R112-A) re-verified structurally against the
  remediation plan — gates green at the documented 1087.
- The neo-crm s203/s204/s205 layers surveyed; the **s205 ENV-FACE
  TOTALITY doctrine transferred**: the app face is accurate
  (`DATABASE_URL` + `AUTH_SECRET` only) but **`E2E_PORT` was
  undocumented** — cured in `.env.example` (the informational tooling
  block). The full test-side census is queued for r114.
- The advisory state: the documented deepmerge-ts dev-chain high + the
  minimatch moderate (both dev-toolchain transitive, zero runtime
  exposure). The patch watch: 16.4.3 published, non-security → the
  ^16.4.2 HOLD stands.

## The environment notes

- The documented DATABASE_URL trap live again (an exported
  `file:/home/z/my-project/db/custom.db` outside the repo) — `env -u
  DATABASE_URL` on every Prisma/server/build leg.
- The Playwright browser-version trap recurred (the fresh install wanted
  chromium 1248 while the cache held 1200) — the in-round pinned-browser
  install, the documented r110/r112 cure.
- The E2E runner kills the :3200 standalone holder by port — the
  screenshots ran BEFORE the E2E gate.
- The corpus Typst recompile needed the compile date pinned (the
  coverletters' embedded `datetime.today()` drifted the pins +1/+2
  alnums across days).

## Gates

lint 0/0 · tsc ✓ · **1092/1092 unit** (1087 + 5 net new) · build ✓ ·
E2E the standing 559 net (the fix rides the unit layer per the
r100/r102 documented split) · DB pristine. The evidence chain: 12 r113
PNGs (the byte-identical login probe, the REF + clone mobile-nav pair,
the desktop set incl. the CV tab + the WeasyPrint-CV tab capture).
