# Remediation Plan — Session 102 / Parity Round 101: the LibreOffice real-writer round

**The frontier.** The r101 close-out's queue: (1) the CV-flow's remaining
edge classes — the non-ASCII `/Differences` remap and the non-default
`Tz`/`Ts` (both watches until a real file surfaces) — plus the standing
invitation to pin MORE real writer families (the corpus stood at seven:
W3C, arXiv/pdfTeX, encrypted-orimi, IRS/Acrobat, Word-365,
Adobe-PDF-Library, iText), (2) the REF-broken mobile set on watch (the
67th-state baseline), (3) the standing watches (the 67th-state login
ladder re-armed, the recharts grid class, the dark-band theming, the v4
space-y inline-flow watch, the patch watch at ^16.4.2 with 16.4.3
published), (4) the neo-crm session-191 layer.

## The opening read (the standing ladder — the REF QUIET at the 67th state)

| Ladder step | Result |
|---|---|
| Workspace | `git pull` fast-forward `f0601f2 → a3c9dc3` (docs only: the session_229 raw transcript) — the session-101 close state intact |
| Baseline gates | lint 0/0 · tsc ✓ · **1024/1024 unit** — matches the session-101 close |
| The exported-`DATABASE_URL` guard | ACTIVE all round (the sandbox exports `file:/home/z/my-project/db/custom.db` — every Prisma CLI touch, every `next build`, AND every :3200 server boot runs under `env -u DATABASE_URL`; the guard fired on the round's first DB probe exactly as documented) |
| The deploy watch | **THE REF QUIET at the 67TH deploy state** — login JS `index-D__5Nn5J` and CSS `index-Dv2nVyxn` BOTH unchanged (the r102-deploy-watch probe) — no 68th deploy; the r101 ladder classifications hold verbatim |
| The mobile-nav cross-side pair (the standing emphasis) | **PARITY, live-verified on BOTH sides** — REF: hamburger 28×28 `lucide-panel-left` "Toggle Sidebar" + drawer 288×844 fixed z-50 (16 items); clone: the same geometry + the `aria-label`/`role=dialog` a11y supersets; the clone menu cycle open → Training LMS → `/training` + **AUTO-CLOSED** (the r102 probes). No Tailwind v4 regression in the mobile band. |
| The REF-broken mobile set | **HOLDS at the 67th state** — `/employeedetail` the empty shell (rootChildren 2, mainTextLen 26, scrollW 390), re-read live in the r102 ref-nav probe |
| The standing scans | oklch clean (globals.css doc comments only) · `md:flex-wrap` zero · secrets zero · the patch watch HOLD at ^16.4.2 (16.4.3 published — no newer) · every CartesianGrid site `strokeDasharray="3 3"` · the space-y inline-flow watch clean |
| DB state | pristine (1 user / 0 candidates) · a stale :3201 next-server process (cwd deleted) killed per the §110 rule; :3200 serves the r101-close standalone (the current HEAD state) |
| The neo-crm session-191 layer | **QUIET** — the raw worklog (fetched fresh) tops out at session-190 (the CRM-only reports round consumed at r101); no new adoptable pattern. The process patterns are already embodied. |

## THE ROUND'S FINDINGS (empirically verified before the fix)

**R102-A — the non-content-stream CRASH: any file with a large embedded
binary stream yields ZERO text (VERIFIED on the real LibreOffice file —
CRITICAL within the superset flow).** The round downloaded the **8th real
writer family**: **lo-writer-guide.pdf** (Producer "LibreOffice 26.2.1.2
(X86_64)", **PDF 2.0** — the corpus's first PDF-2.0 file; the LibreOffice
Writer 25.2 guide, 29MB) and **lo-calc-guide.pdf** (the Calc 7.0 guide,
11MB). The extraction pipeline returned **length 0** — the throw (traced
live): `RangeError: Maximum call stack size exceeded` at the ops
`RegExp.exec` inside `pdfTextPieces`. The mechanism (measured): the file
carries **26MB/25MB/8.7MB `/Subtype /Image` streams** whose inflated
binary bytes decode as text-like garbage (913 stray parens in the
biggest); the literal-show alternative's `(?:\\.|[^\\()])*` star pushes
choice points until V8's backtracking stack dies — and `extractPdfText`
has NO per-stream guard, so ONE garbage stream kills the WHOLE file (the
`extractTextFromFile` catch silently returns ""). **The fix (three
legs, all prototyped on the real file):**

1. **The pre-inflate DICT gate** — a stream whose object dict (the
   region between the last `endobj` and the `stream` keyword) declares
   `/Subtype /Image` or `/FontFile[23]?` is never a content stream:
   skip it entirely (no inflate, no walk). Also ~5x faster (5.9s → 1.1s
   on the writer guide).
2. **The post-inflate CONTENT gate** — a stream is walked only if it
   carries a real text-op shape (`)`, `]`, or `>` immediately before a
   `Tj`/`TJ`/`'`/`"`) AND an even-sampled printable ratio ≥ 0.6 (the
   head-only sample was rejected: a content stream with a leading
   inline image would be lost; the stride sampler covers the whole
   stream).
3. **The per-stream try/catch** — a pathological stream (the
   stack-overflow class) is skipped, never fatal.

**R102-B — the font-scoped CMap decode: multi-font subset files decode
as GIBBERISH (VERIFIED — HIGH).** LibreOffice embeds 15 subset fonts
(LiberationSans/DejaVu/Noto CJK…), each with its own ToUnicode CMap,
and **every font restarts its glyph codes at `<01>`** (F1's 01 = "•",
F2's 01 = "T"). The standing `decodeHexString` rule — "the FIRST CMap
that covers all the atom's codes wins" — decodes F2's atoms through F1's
map: with the R102-A gates alone the file yields mis-decoded gibberish
("G ye", "S fr", "LbbiuneOGudAnyofoiGye" — the wrong-font glyph soup).
**The fix: the three-link font chain** — `/F-name → font object` (the
`/F1 5289 0 R` resource-dict pairs, raw-ascii scan), `font object →
/ToUnicode object` (the `/ToUnicode 5248 0 R` refs in the `/Type /Font`
dicts, raw-ascii scan), `/ToUnicode object → its CMap` (the stream walk
now records each stream's OBJECT NUMBER via the endobj-bounded lookback,
anchored with an unanchored first-object fallback). The `Tf` operator's
match text yields the current font name (zero regex-group churn — the
name comes from `m[0].split(/\s+/)[0]`), every `TextPiece` carries it,
and each hex piece decodes through **its own font's CMap first**, then
falls back to the standing first-covering walk (files without the chain
— the W3C dummy, the encrypted file — keep the current behavior). After
the prototype: "Copyright This document is Copyright © 2025 by the
LibreOffice Documentation Team. Contributors are listed below. This
document may be distributed and/or modified under the terms of either
the GNU General Public License (https://www.gnu.org/licenses/gpl.html)…"
— **readable words, letter-soup runs 0, 641,482 alnums (was ZERO).**

**R102-C — the TJ sign rule: LibreOffice's T-overhang kerns fire the
word-gap rule (VERIFIED — MEDIUM).** With A+B in place one systematic
artifact remains: **every capital-T word splits** ("T eam", "T ool",
"T ables", "T svetelina" — 471 capital-split artifacts, 3.89% of
words). The raw form (dumped from the real streams):
`<05>18<01>110<0B>` — F2's code 05 is the SPACE GLYPH, 01 = "T", 0B =
"e": the **+110 between the T-atom and the eam-atom is the classic
T-lowercase overhang kern** (genuinely ~0.11 em in LiberationSans — the
biggest kern class in common fonts). The r101 census (Word ≤ 11, Adobe
≤ 92, pdfTeX ≤ 52) never saw a kern ≥ 100 because no corpus font wrote
one. **The sign census (the decisive evidence, both LO files):** every
REAL word gap in the corpus is NEGATIVE — pdfTeX's interword glue
−209…−442, the R97 fixture's −120/−250 — while the positive ≥ 100 class
is kerns (LibreOffice's +110…+149 T-overhangs; LibreOffice encodes word
spaces as GLYPHS, never as numbers). The rare LibreOffice negatives
(−113/−116 tracking corrections, 34 numbers in 1.7M; −997/−999 column
jumps) behave acceptably: the tracking class mis-splits a handful of
digit runs (the same residual class as the arXiv per-glyph labels —
documented), the column jumps ARE gaps. **The fix: the gap rule becomes
sign-aware — the consecutive-number SUM ≤ −100 fires the gap; positive
sums (any magnitude) and small negatives join.** The R97 fixture's −120
stays a gap VERBATIM; pdfTeX's −322s stay gaps; LibreOffice's +110s
join ("Documentation Team" — verified in the prototype). **Spec
impact (exactly one, by design):** the R101 boundary spec's synthetic
`[(gapgapgap) 100 (separated)]` member (a POSITIVE gap — an assumption
no real writer backs) flips to a join; it is redesigned to the
sign-aware form (−100 gaps, +100 joins) — the r97 lesson's sixth
application (real files override fixture assumptions). The full unit
suite was run against the prototype: **34/35 green, the single failure
exactly the predicted member.**

**The real-file classification, extended:** literal PDFs extract ·
hex/CMap PDFs extract through the map · per-glyph Tj+Td PDFs extract as
words (R100) · kerned TJ-array PDFs extract as words (R101) · **the
non-content-stream crash class and the multi-font subset form extract
after this round's fix (the LibreOffice family — PDF 2.0, 15 fonts,
glyph-coded hex atoms, T-overhang kerns)** · encrypted PDFs correctly
do not. The corpus: **NINE writers** (W3C, arXiv/pdfTeX,
encrypted-orimi, IRS/Acrobat, Word-365, Adobe-PDF-Library, iText,
LibreOffice ×2).

**The ground-truth delta (intentional):** the font-program garbage that
the pristine walk mined out of embedded TrueType/Type1 programs (the
`glyf`/`cmap`/`%!FontType1` bytes) exits the yield — alnum counts DROP
on font-bearing files (pitt −117, tisch −758, stanford −31, arXiv −215)
and HOLD where no font programs ride (IRS 5,871 IDENTICAL; the
encrypted file 0; the W3C dummy's 12-alnum guard pin). Every sample
verified intact. The two NEW LibreOffice files: **0 → 641,482 and 0 →
691,268 readable alnums.**

## The test plan (TDD)

1. **RED (unit, `tests/unit/cv-text.test.ts`)** — (a) the CRASH form: a
   PDF with an `/Subtype /Image` stream (a large binary body with stray
   parens) followed by a real content stream → the text extracts (RED
   today: the whole file dies in the RangeError); (b) the
   FONT-SCOPED form: a two-font PDF (F1's CMap 01→"A", F2's CMap 01→"B";
   the resource dict `/F1 4 0 R /F2 6 0 R`, the font dicts with
   `/ToUnicode`, both CMap streams, a content stream alternating
   `/F1 … <01> … /F2 … <01>`) → "A" and "B" both correct (RED today:
   first-covering decodes both through F1's map); (c) the T-KERN form:
   `[(T) 110 (eam )] TJ` → "Team" (RED today: "T eam"); (d) the
   sign-aware boundary: `[(gap) -100 (split)] TJ` → "gap split" AND
   `[(word) 100 (join)] TJ` → "wordjoin" (the +100 member RED today:
   "word join").
2. **BORN-GREEN guards** — (e) the R97 fixture VERBATIM (the −120 gap
   member — the over-fix guard, must stay green untouched); (f) pdfTeX's
   −322 gaps keep their spaces (the standing over-fix guard); (g) the
   /Image-dict skip loses no text (the content stream in the same file
   still extracts — the gates' precision guard); (h) a stream with no
   text-op shape is not walked (a pure-graphics stream contributes
   nothing and does not crash).
3. **GREEN** — the `cv-text.ts` changes: the dict gate, the content
   gate, the per-stream guard, the font chain (the three raw scans +
   the objNum lookback + the font-carrying pieces + the scoped decode),
   and the sign rule (the SUM ≤ −100 gap test). All 34 standing cv-text
   specs stay green (validated: the prototype run).
4. **The R101 spec redesign** — the boundary spec's `[(gapgapgap) 100
   (separated)]` member becomes the sign-aware pair (−100 gaps, +100
   joins), its comment updated to cite the LibreOffice T-kern census
   (the r97 lesson protocol).
5. **RED→GREEN (E2E, born-green + mutation-proofed)** — the new
   `tests/e2e/session102-libreoffice-cvflow.spec.ts`: a
   LibreOffice-shaped PDF (an /Image garbage stream + a two-font chain +
   hex atoms + T-kern-split vocabulary) through the actual UI → the
   analysis card → the persisted row (`skillsMatch > 0`, `aiScore > 5`)
   → the cleanup, with the `/assets`-pattern pre-clean beforeEach (the
   guard-clearing-payload rule). The fixture audit runs BEFORE the spec
   (the r101 discipline): the scorer's exact first-24 keyword set
   computed live; every payload fragment must ride EXCLUSIVELY the new
   paths — the keywords die under M1 (the crash kills the file), M2
   (the wrong-CMap soup matches nothing), AND M3 (the T-kern split
   fragments are sub-4-char).
6. **The mutation proof (three branches — one per fix leg)** — M1: the
   three gate legs removed → the crash fixture RED; M2: the scoped
   resolution removed (first-covering restored) → the two-font fixture
   RED; M3: the sign rule reverted (|sum| ≥ 100) → the T-kern fixture
   RED. Each mutation: unit RED exactly as designed + the E2E spec RED;
   restore → REBUILD (the §110 rule) → all green.
7. **Gates** — lint 0/0 · tsc ✓ · unit 1024+N · build ✓ (under
   `env -u DATABASE_URL`) · E2E 554+1 (the final gate ALONE, the
   detached node-spawn protocol) · DB pristine at close.

## The round's verification legs (the standing protocol)

- The real-file ground truth after the fix: the two NEW LibreOffice
  files (readable words, soup runs, alnum yields) + the standing corpus
  (the IRS 5,871 pin IDENTICAL, the encrypted 0 pin, the dummy's guard
  pin, the font-garbage exits on pitt/tisch/stanford/arXiv — samples
  verified intact).
- The live post-fix verify on :3200 — a LibreOffice-shaped CV (the
  kern-split + font-chain + image-stream form) through the actual UI
  (tab → job select → upload) → the analysis card (screenshot
  evidence) → the candidate swept (DB pristine). The stale-server
  traps: kill by the server.js process; `env -u DATABASE_URL` on the
  boot.
- The mobile-nav pair re-verified on the remediated build (the standing
  emphasis).
- The evidence chain: r102 PNGs under `docs/screenshots/`.
- The docs layer: this plan + the narrative (`docs/session_230.md`) +
  the AGENTS session-102 layer + the SKILL §114 lesson + the
  CLAUDE/README/AGENTS count lockstep + the worklog entry.

## Execution appendix (filled at close)

- **RED 4/4 as designed** — the gates spec (the yield carried
  "IMAGEGARBAGE999 IMAGEGARBAGE999…" — the /Image decoys polluted, plus the
  ratio-gate member's TEXTGARBAGE888), the font-chain spec (the yield was
  exactly **"A A payroll admin compliance training…"** — both fonts' atoms
  decoded through F1's map, the predicted first-covering failure), the
  T-kern spec ("T eam  T ools"), and the sign-boundary spec (the +100
  member split: "joinword edword"). The graphics-stream guard spec was
  born-green (35 passed = the 34 standing + the guard).
- **The TDD-phase fixture catches:** (1) the multi-object helper's first
  draft collided with the file's outer `enc` TextEncoder — the standing
  helper pattern is `enc.encode(…)`, never a callable encoder; (2) the
  font-chain fixture needed its guard-clearing vocabulary BEFORE the RED
  was honest (a bare "A A" yield dies at the 40-alnum guard — the RED
  must fire on the DECODE, not the guard — the r97 fixture-length lesson,
  fifth application); (3) the raw fixture objects needed their own
  `<< >>` — the font-dict scan requires the delimiters.
- **GREEN 39/39** → full unit **1028/1028** (1024 + 4 net new: +5 specs,
  the r101 boundary spec redesigned into the sign-aware form) · tsc ✓ ·
  lint 0/0.
- **The mutation proof (three branches, both layers):** M1 (all three gate
  legs neutralized) → unit exactly **1 RED** (the crash spec — the garbage
  pollutes); M2 (the font scoping neutralized) → unit exactly **1 RED** +
  E2E exactly **1 RED** (the wrong-CMap gibberish matches nothing); M3
  (the sign rule reverted to the r101 sign-blind form) → unit exactly **2
  RED** (both R102-C specs) + E2E exactly **1 RED** (the split fragments
  match nothing). Each restore ended with a REBUILD (the §110 rule); all
  green re-verified after the final restore (unit 1028/1028 + the 9
  standing CV-flow E2E specs green).
- **The M1 E2E leg (the documented split):** the crash class needs the
  real 26MB stream's specific byte shape to blow the V8 stack — the
  bisect found the smallest throwing prefix at ~11.9M chars, and compact
  synthetic shapes (pure runs, random garbage at 1M/3M/8M) do NOT throw.
  The M1 teeth live in the unit layer (the pollution assertions — exactly
  1 RED, verified); the E2E fixture carries the authentic /Image member
  (the shape) and the M2/M3 legs carry the E2E discrimination (the r100
  matrix precedent: a leg with no UI-layer observable rides the unit leg
  alone).
- **The E2E fixture audit (run BEFORE the spec — the r101 discipline):**
  the scorer's exact first-24 keyword set computed live from the seeded
  System Admin job (identical to the r101 set); every split fragment
  audited SAFE ("echnology", "ystems", "ecurely", "upport",
  "pecialist", "latform" — no fragment can exact- or prefix-match any
  keyword); every whole word MATCHES. **The discrimination: FIX
  matched=8 / skillsMatch=33 / aiScore=20 vs M2 AND M3 both matched=0 /
  skillsMatch=0 / aiScore=5 (the floor)** — and the live card later
  rendered EXACTLY these numbers.
- **The born-green E2E catch (the §110 family, round four):** the first
  run needed the REBUILD before the standalone served the fix (the rule
  applied proactively this round — the rebuild ran before the first E2E
  attempt, zero failed runs).
- **The real-file ground truth after the fix:** the two NEW LibreOffice
  files extract as readable words — the writer guide "Copyright This
  document is Copyright © 2025 by the LibreOffice Documentation Team.
  Contributors are listed below. This document may be distributed and/or
  modified under the terms of either the GNU General Public License
  (https://www.gnu.org/licenses/gpl.html)…" (**0 → 641,482 alnums**,
  letter-soup runs 0, "Documentation Team" joined — was "T eam") and the
  calc guide (**0 → 691,268 alnums**, soup 8 — the residual is the rare
  negative-tracking digit splits). The standing corpus: the IRS form
  **5,871 alnums IDENTICAL** (the R100 pin); the encrypted file 0 (the
  standing pin); the W3C dummy "" through the full flow (the 12-alnum
  guard pin); pitt 24,464 / tisch 42,379 / stanford 38,339 / arXiv 67,744
  — **the font-program garbage exits the yield** (the `glyf`/`cmap`
  TrueType tables and the `%!FontType1` programs the pristine walk mined
  as fake text: −117 / −758 / −31 / −303 vs the r101 closes) with every
  sample verified intact. The prototype-vs-final yields verified
  BYTE-IDENTICAL on the arXiv file.
- **The live post-fix verify on :3200:** the LibreOffice-shaped CV (the
  /Image member + the two-font chain + the +110 kern-split vocabulary)
  through the actual UI → **the analysis card rendered** ("r102 live cv"
  + AI score **20/100** + Skills match **33%** + the matched keywords
  system/tech/technology/specialist/support/platform/systems/securely —
  the audit's exact prediction) → **the API row persisted (score 20,
  skills 33)** → the candidate swept (DB pristine: 1 user / 0
  candidates). The mobile-nav pair re-verified on the remediated build
  (the same PARITY contract: 28×28 hamburger, 288×844 fixed z-50 drawer,
  the menu cycle /training + AUTO-CLOSED — no Tailwind v4 regression).
  The e2e.db clean (0 candidates — the pre-clean beforeEach held through
  all the mutation runs).
- **The round's process traps:** the between-call process reap (the
  nohup :3200 boot died silently between two bash calls — the standing
  cure: the node-spawn detached protocol, `scripts/boot3200.mjs`) · the
  agent-browser snapshot's attribute form (`[expanded=false, ref=e60]` —
  a `[^\\]]*` gap before `ref=` in the match regex) · the upload command
  is `agent-browser upload` (not set-file) · the shell's Bad-substitution
  on nested template interpolation (the cleanup DELETE rides the in-page
  fetch with backtick-quoted URLs) · the exported-DATABASE_URL guard
  ACTIVE all round (it fired on the round's first DB probe exactly as
  documented).
- **Final gates on the remediated tree:** lint 0/0 · tsc ✓ · **1028/1028
  unit** · build ✓ (under `env -u DATABASE_URL`) · **E2E 555/555** (the
  554 standing + the 1 new; the final gate ALONE via the detached
  node-spawn protocol) · DB pristine at close.
- **The evidence chain:** the r102 PNGs (the REF + clone mobile-nav
  opens, the clone training-mobile landing, the CV tab, the analysis
  card).
- **The docs layer:** this plan + the narrative (`docs/session_230.md`) +
  the AGENTS session-102 layer + the SKILL v3.89.0 §114 + the
  CLAUDE/README/AGENTS count lockstep (1028 + 555 = 1583) + the worklog
  round-101 entry.
