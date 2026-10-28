# Remediation Plan — Session 106 / Parity Round 105

The round that measured its own queue: the r106 queue's three named CV-flow
items were taken to the real files, and the measurements rewrote the round —
the `/Differences` harvest hypothesis is REFUTED (the dvipdfmx homoglyphs are
the document's own text layer, matching pdftotext member-for-member), the
two-pass width table does not manifest in any sourceable real file, and the
REAL defect the audit found is that the R105-C page-tree chain — the previous
round's flagship fix — is INERT on real modern files (two structural blind
spots measured on both real xdvipdfmx builds). The 70th deploy detected and
classified NON-VISUAL; the mobile-nav pair PARITY holds with the REF's
stay-open drawer persisting (the classification stands).

## The opening read (the standing ladder — the 70TH deploy state)

| Leg | Result |
| --- | --- |
| Login asset census | JS `index-D52diwdP` → `index-C8D2zqWd`, CSS `index-DrXNg8Ix` → `index-CZZ4z0cl` — BOTH moved → **THE 70TH DEPLOY detected** |
| App-side assets | `index-C-IrDy5f` / `index-BGNH4KkS` — **QUIET, the r42 baseline holds** |
| Login render | The fresh capture at the VERIFIED 1440×900 viewport **BYTE-IDENTICAL** to the standing `69aa4241…` baseline → the deploy classified **NON-VISUAL** (login-side asset churn, the 69th pattern repeating) |
| Mobile-nav pair (390×844, the user's named focus) | **PARITY on BOTH sides** — REF 28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer (16 items, the Close button still `display:none` — the DOM artifact); the clone same geometry + the a11y supersets (15 items, no Close button); **VLM-verified pixel-identical drawer interiors** |
| The drawer watch (the 70th) | The REF menu cycle: `/training` + **STILL-OPEN** — the 69th's stay-open behavior persists through its second deploy; the clone keeps the AUTO-CLOSED superset (pinned by tests/e2e/mobile-navigation.spec.ts). The REF-side-regression classification STANDS |
| The REF-broken mobile set | `/employeedetail` the empty shell (66 nodes vs the clone's 250) — HOLDS |
| Tailwind v4 scans | The mobile band clean — no regression (the standing scans' geometry census identical) |
| Baseline gates | lint 0/0 · tsc ✓ · **1049/1049 unit** — the session-105 close re-verified on the fresh clone |

## The audit (the session-105 changes, re-read in full)

The R105-A/B/C/D implementations re-read line-by-line in `src/lib/cv-text.ts`
(1002 lines): the streaming budget rides the read correctly (the producer
canceled at the cap); the marker tables keyed lowercased with subset prefixes
stripped; the memo and the Tm-clear correct. The audit's findings:

- **A-1 (THE DEFECT — became R106-A)**: the R105-C page-tree chain never
  fires on the real files. Measured on fontspec v2.9h (71 pages) and
  dvipdfmx.pdf (50 pages): **100% of both files' pages are ObjStm-carried,
  100% carry the `/Contents[36 0 R]` ARRAY form, and 100% reference
  `/Resources` objects that are THEMSELVES ObjStm-carried**. The extractor's
  scalar `/Contents` regex matches neither file's pages → `pageFonts` is
  empty → assembly decodes every atom through the file-order candidate chain.
  The synthetic R105-C fixture used a raw page with a scalar `/Contents` —
  the fixture-synthesis gap (the §116 fixture-must-exercise-the-fixed-path
  lesson, round two: the fixture exercised the fixed path, but the REAL
  writers' shape never reaches it).
- **A-2 (the live damage, measured)**: with no page map, single-CID atoms are
  stolen by earlier wrong-font candidates. On fontspec's title stream (obj
  36): `<0027>` — the 'F' of "Font selection" — decodes through EBGaramond's
  map (obj 220, sorted before the true font obj 4) as **'D'**, producing
  "**Dont** selection for XƎLATEX"; `<0046>` ('e') is stolen by
  TeXGyreAdventor (right only by luck). pdftotext reads "**Font** selection
  for XƎLATEX" — the member-by-member reference. The page's true /F1 (obj 4,
  TeXGyrePagella, 114-entry ToUnicode) covers ALL the title's CIDs including
  0x27→"F" — the page map cures the theft class exactly.
- **L-1**: the region scan's `[\s\S]*?endobj` can cut an object region early
  on an "endobj" byte sequence inside stream binary — accepted (the standing
  scans' tolerance class).
- **L-2**: `/Contents` arrays with MULTIPLE refs (`[4 0 R 5 0 R]`) — the fix
  registers every ref (a page's content split across streams), last-wins on
  a shared stream (the rare form; watch).
- **L-3**: the ObjStm page registration keeps its inline-fonts-only raw-pass
  twin for non-array scalar pages — both forms now share one helper.

## THE ROUND'S FINDINGS (empirically verified before the fix)

### R106-A — the page-tree chain's real-file activation (THE round's fix)

The two blind spots, both measured:

1. **The `/Contents` ARRAY form.** Every real xdvipdfmx page writes
   `/Contents[36 0 R]` (bracket, often no space). The scalar regex
   `/\/Contents\s+(\d+)\s+0\s+R/` requires whitespace-then-digits and never
   matches. Fix: a contents-refs helper — bracket form captures to `]` and
   registers EVERY ref; scalar form registers the single ref — applied to
   BOTH the raw region scan and the ObjStm page registration.
2. **The ObjStm-carried referenced `/Resources`.** Every real page's
   `/Resources` object is itself inside an ObjStm. The current deferred
   resolution runs right after the RAW pass (before the stream walk) and
   consults raw-only `objFonts` — zero resolution. Fix: the ObjStm harvest
   (a) feeds non-page bodies carrying `/Font` pairs into `objFonts`, (b)
   queues referenced-`/Resources` ObjStm pages into `pendingRes`; the
   `pendingRes` resolution MOVES to after the full stream walk (the
   resources object may sit in a later ObjStm).

Expected outcome: fontspec "Dont selection" → "Font selection" (the pdftotext
member-for-member reference); the single-CID theft class cured file-wide; the
corpus IDENTICAL (IRS 5,871 + arXiv 67,744 — both files' pages resolve
through the raw pass for all but one bracket-form page each, and those pages'
fonts match the chain's winners; the pins police it).

### R106-B — the dvipdfmx homoglyph class: MEASURED, NOT A DEFECT

The r106 queue's named item — "an unnamed custom encoding — a per-font
/Differences harvest" — is REFUTED by measurement:

- The file contains **ZERO `/Differences` arrays** (the full-object region
  census).
- The Armenian chars (հ ս ո օ for h u n o; 12,922 document-wide) come from
  the font's OWN ToUnicode (obj 1017, `YSDERE+NewCM10-Regular-Identity-H`):
  its own map assigns CID 0x0049→U+0570 where the glyph is Latin-h-shaped.
  There is exactly ONE candidate for /F1 — no chain theft; the own map IS
  the reading.
- **pdftotext reads the identical homoglyphs** ("Tհe Dvipdfmx սser maոսal") —
  the document's text layer says Armenian; a conforming extractor (poppler)
  and ours agree member-for-member. The class is a dvipdfmx AUTHORING
  artifact (its ToUnicode generation from the font's confused glyph names),
  faithfully extracted. NO code change — script-consistency transliteration
  would DIVERGE from both the spec-authoritative ToUnicode and the reference
  extractor.

The fontspec 'Ǝ' is the same class: the official XƎTeX logo's reversed-E
(pdftotext agrees). NOT a defect.

### R106-C — the two-pass width table: MEASURED, NOT MANIFESTING

The r103-documented narrow-ending word-gap fusion (the width table's target)
does not manifest in any sourceable real file: fontspec's 242 fused 25+ runs
are URLs, LaTeX commands, and OTF file names (legitimate unbroken strings);
dvipdfmx's 27 and IRS's 3 likewise (dotted leaders); the word-integrity probes
("selection" ×25, "options" ×65, "package" ×42 on fontspec) hit whole words.
The 38-fused LuaTeX residual's carrier (martino-lualatex.pdf) is not
re-sourceable. The width table STAYS A WATCH (the corpus re-run budget is
the gate — and the budget says no live target).

### R106-D — the Quartz 13th-writer hunt: NOT SOURCEABLE this round

Candidates measured: the ABC orszag.pdf (the URL now serves a Word 2007
file, not the indexed Quartz letter), the Hamilton Levitt paper (re-processed
by PDFsharp — the Quartz string rides the ORIGINAL metadata only), the DTU
flm_1900837 (Acrobat Distiller), SSRN/HAL/scispace (bot-walled). The hunt
STAYS A WATCH.

## The TDD plan (RED → GREEN → mutation-proof)

**RED specs (written first, both failing):**

1. `tests/unit/cv-text.test.ts` — R106-A spec 1 (the raw-pass array form): a
   fixture whose page objects carry `/Contents[4 0 R]` (bracket form) with
   INLINE fonts; a decoy `/F1 → wrong-font` pair placed EARLIER in file order
   than the page's own pair (the chain-theft shape); page 1's atom must read
   "Font" through page 1's own map, not the decoy's "Dont". Clears the
   40-alnum guard on BOTH sides of the mutation.
2. `tests/unit/cv-text.test.ts` — R106-A spec 2 (the real fontspec shape): an
   ObjStm carrying the `/Type /Page` body with `/Resources 20 0 R` +
   `/Contents[30 0 R]`; a SECOND ObjStm (later in the file) carrying the
   resources object (obj 20, `/Font<</F1 8 0 R>>`); the raw decoy `/F1` pair
   earlier still; stream 30's atom must read "Font" through the page's
   resolved map. Exercises all three legs: the array form, the ObjStm
   resources harvest, and the post-walk resolution ordering.

**Mutation proof (the r104/r105 protocol):**

- M1: the contents-refs helper reverted to the scalar regex → specs 1 AND 2
  RED (both use the array form).
- M2: the ObjStm `objFonts` feed removed → spec 2 RED only (spec 1's
  resources are inline).
- M3: the `pendingRes` resolution moved back before the stream walk → spec 2
  RED only (the resources object sits in a LATER ObjStm — the ordering is
  the teeth).

**Gates:** lint 0/0 · tsc ✓ · unit (1049 + 2 net new = 1051) · `env -u
DATABASE_URL` build (NODE_OPTIONS=--max-old-space-size=3072, the dev server
killed first) · E2E 558/558 (the standing net; no new E2E legs — the fix is
unit-layer per the r104 documented split) + the mobile-nav pair re-verified
on the remediated build.

## Verification legs

1. The unit RED→GREEN + the mutation matrix M1–M3.
2. The real-file ground truth: the corpus re-run (IRS 5,871 + arXiv 67,744
   IDENTICAL — no drift) + the fontspec member check (the title reads "Font
   selection for XƎLATEX" post-fix, matching pdftotext) + the dvipdfmx
   member check (the extraction UNCHANGED — 61,437 alnums, the own-map
   Armenian class identical).
3. The mobile-nav pair (REF + LOC) re-verified on the remediated :3200
   build — the auto-close superset intact, no Tailwind v4 regression.
4. The final E2E gate ALONE (the detached node-spawn protocol).

## Execution appendix (filled at close)

- **RED:** 2/2 as designed — both specs failed with the identical chain-theft
  signature ("qwzv xjkjqvwwz qwz vvj xjkjvjx kzwvjz…" — the a-vocabulary
  through the wrong-font map, the "Dont selection" class), each on the
  designed assertion, never the 40-alnum guard (the wrong letters are still
  alnums — the fixture-guard honesty rule held on both sides of every
  mutation).
- **GREEN:** 1051/1051 (1049 + 2 net new) — the three legs landed in
  `src/lib/cv-text.ts`: the `contentsRefs` helper (array + scalar +
  multi-ref, shared by the raw region scan and the ObjStm page
  registration); the ObjStm `objFonts` feed (non-page bodies with /Font
  pairs); the `pendingRes` resolution moved after the stream walk with
  per-entry content-ref arrays.
- **Mutation matrix:** M1 (contentsRefs reverted to the scalar regex) →
  exactly 2 RED (both specs); M2 (the ObjStm objFonts feed removed) →
  exactly 1 RED (spec 2); M3 (the resolution moved back before the walk) →
  exactly 1 RED (spec 2 — the ordering teeth: the resources object rides a
  LATER ObjStm than the page). The restored file re-verified byte-clean
  (md5 `5de5acf5…` against the green snapshot) and 56/56.
- **The real-file ground truth:** the corpus IDENTICAL (IRS f1040 5,871 ·
  arXiv-2404.16710 67,744 — no drift through the activation); **fontspec
  CURED member-for-member** — the title now reads "The fontspec package /
  **Font selection** for XƎLATEX and LuaLATEX", "Dont selection" GONE
  (101,529 → 101,515 alnums — the theft cures), matching pdftotext on the
  fixed member; **dvipdfmx UNCHANGED** (61,437 alnums, 12,922 Armenian
  chars, "Tհe Dvipdfmx սser maոսal" — the own-map class, matching pdftotext
  verbatim; the R106-B not-a-defect classification holds through the fix).
- **Gates:** lint 0/0 · tsc ✓ · 1051/1051 unit · build ✓ (env -u
  DATABASE_URL; NODE_OPTIONS=--max-old-space-size=3072; the dev server
  killed by the port holder first) · E2E 558/558 (the standing net, the
  final gate ALONE via the detached node-spawn protocol, after the
  chromium-1248 reinstall cured the fresh-workspace 1ms-failure class).
- **Evidence:** the r106 PNG set — the byte-identical 70th-state login
  probe, the REF + clone mobile-nav pair (VLM-verified pixel-identical
  drawer interiors), the post-nav stay-open vs auto-close contrast, and the
  remediated-build re-verify set.
- **Docs lockstep:** the plan (this file) · session_241 (narrative) +
  session_242 (transcript) · the AGENTS session-106 layer · SKILL v3.93.0 +
  §118 (the real writer's shape, the reference extractor as ground truth,
  the queue item refuted by measurement) · the CLAUDE/README/AGENTS count
  lockstep (1051 + 558 = 1609) · the worklog round-105 entry · `.env.example`
  verified unchanged (only DATABASE_URL + AUTH_SECRET are read).
