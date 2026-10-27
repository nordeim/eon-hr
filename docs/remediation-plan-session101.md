# Remediation Plan — Session 101 / Parity Round 100: the TJ-kern real-writer round

**The frontier.** The r100 close-out's queue: (1) the CV-flow's remaining
operator-shape edges — the `Tz`/`Ts`-bearing scaled text and the Type3-font
forms — plus a real **Word-Save-as-PDF** pin (the R97 fixture's writer family,
still fixture-only), (2) the REF-broken mobile set on watch, (3) the standing
watches (the 66th-state login ladder re-armed, the recharts grid class, the
dark-band theming, the v4 space-y inline-flow watch, the patch watch at
^16.4.2 with 16.4.3 published), (4) the neo-crm session-190 layer.

## The opening read (the standing ladder — the 67TH DEPLOY detected)

| Ladder step | Result |
|---|---|
| Workspace | `git pull` fast-forward `f6abc0c → f7357fd` (docs only: the session_227 raw transcript) — the session-100 close state intact |
| Baseline gates | lint 0/0 · tsc ✓ · **1015/1015 unit** · the E2E baseline = the r100-close final gate (553/553 on the identical tree) |
| The exported-`DATABASE_URL` guard | ACTIVE all round (the sandbox exports `file:/home/z/my-project/db/custom.db` — every Prisma CLI touch AND every `next build` runs under `env -u DATABASE_URL`) |
| The deploy watch | **THE 67TH LOGIN DEPLOY detected** — login JS `index-DmiZE53r` → `index-D__5Nn5J`, CSS `index-puMd6fDW` → `index-Dv2nVyxn` (BOTH moved) → **classified NON-VISUAL**: the fresh login pair renders **BYTE-IDENTICAL** to the standing `69aa4241…` baseline; the census intact (the 6 buttons, the 2 inputs, "Welcome to Eon HR", no Turnstile) |
| The mobile-nav cross-side pair (the standing emphasis) | **PARITY, live-verified on BOTH sides on the 67th-deploy REF** — REF: hamburger 28×28 `lucide-panel-left` "Toggle Sidebar" + drawer 288×844 fixed z-50, 16 items; clone: the same geometry + the `aria-label`/`role=dialog` a11y supersets; the clone menu cycle open → Training LMS → `/training` + **AUTO-CLOSED**. No Tailwind v4 regression in the mobile band. |
| The REF-broken mobile set | **HOLDS at the 67th state** — `/hrreports` + `/interviewassistant` empty `#root` (rootChildren 0); `/employeeselfservice` the loading shell (rootChildren 2, textLen 98); `/employeedetail` the empty shell (rootChildren 2, mainTextLen 26, scrollW 390); `/recruitment` renders at 390 (scrollW 550 — the r96 retirement) |
| The standing scans | oklch clean (globals.css doc comments only) · `md:flex-wrap` zero · secrets zero · the patch watch HOLD at ^16.4.2 (16.4.3 published — no newer) · every CartesianGrid site `strokeDasharray="3 3"` (the 7 non-dash greps are import lines + a doc comment) · the space-y inline-flow watch clean |
| verify-r45 / verify-r49 | **13/13 MATCH** both (the r49 first run's single DIFF was a REF render transient — the re-run clean, twice) |
| The neo-crm session-190 layer | Consumed — "THE REPORTS SAVE-CUSTOM-VIEW DIALOG OPEN FACES (walk63)": a product-code round on **CRM-only reports surfaces** (the saved-view dialog on CRM reports); eon-hr's reports module has no REF-mandated saved-view feature — adopting one would be scope creep beyond the parity contract. The process patterns (dialog open-face enumeration) are already embodied in the standing protocol. |

## THE ROUND'S FINDINGS (empirically verified before the fix)

**R101-A — the TJ-array internal space-join splits every KERNED word
(VERIFIED on THREE real writers — HIGH within the superset flow).** The
queue asked for "a real Word-Save-as-PDF pin"; the round downloaded three
NEW real files — **pitt-word.pdf** (Producer "Microsoft® Word for Office
365" — the exact R97-fixture writer family, PDF 1.7, 5 ObjStm), 
**tisch-resume.pdf** (Adobe PDF Library 11.0 — the InDesign family, 52
ObjStm), and **stanford-resume.pdf** (iText 5.5.2) — plus the standing
corpus (the IRS f1040, the arXiv paper, the W3C dummy). The Word and Adobe
files extract as **letter soup** and the arXiv paper carries the same
artifacts:

```
Word (pitt):    "Pitt In for m ation  T e c h n o logy"   (1,692 soup runs)
Adobe (tisch):  "Tisch Office of Car eer Development"     (4,713 soup runs)
pdfTeX (arXiv): "Lay erSkip: Enabling Early Exit"          (619 soup runs)
```

The writer forms (verified in the inflated content streams):

```
Word:    [(In)-4(for)7(m)-6(ation)-2( T)-2(e)4(c)4(h)-3(n)-3(o)10(logy)] TJ
Adobe:   [(Tisch Of\037ce of Car)18(eer Development)]TJ
pdfTeX:  [(Lay)25(erSkip:)-322(Enabling)-211(Early)-211(Exit)-211(Inference)]TJ
```

— the inter-atom numbers are **KERNING adjustments in thousandths of text
space**, and the words' SPACES ride INSIDE atoms (`(ation)-2( T)` — Word;
`(call )Tj` — Adobe). The current walk joins EVERY TJ atom with `" "` →
every kerned word splits. The R97 round's fixture assumed "`-120` IS the
word gap" — a fixture-form blind spot (the r97 lesson, round five): real
writers encode word gaps as TJ numbers ONLY in the pdfTeX family, and
those gaps are 0.209–0.442 em, far from the kern class.

**The threshold census (every number, every real file):**

| Class | Writer | Inter-atom numbers (thousandths) | em |
|---|---|---|---|
| KERN (join) | Word (pitt) | −11 … 10 | ≤ 0.011 |
| KERN (join) | Adobe (tisch) | 10, 18, 55, 92 | ≤ 0.092 |
| KERN (join) | pdfTeX (arXiv) | 25, 27, 28, 29, 52 | ≤ 0.052 |
| GAP (space) | pdfTeX (arXiv) | 209, 211, 262, 322, 334, 442 | 0.209–0.442 |
| GAP (space) | the R97 fixture | −120, −250 | 0.120–0.250 |

The empty band between the kern class (≤ 92) and the gap class (≥ 120)
contains **100 thousandths = 0.1 em — the typographic definition of a
kern** (sub-10%-of-an-em adjustment; a real space glyph is ≥ 0.2 em in
every common font). **THE FIX: the TJ-array internals switch from the
blind space-join to the 0.1-em threshold — `|N| ≥ 100` (thousandths) is a
word gap → the space rule; under is a kern → the atoms join with NO
space; consecutive numbers SUM (the spec allows them; the |sum| decides);
adjacent atoms with NO number keep the standing space join.** The outer
Tf/Td/Td/Tm state machinery is untouched — the R100-A per-glyph walk
survives verbatim.

**The impact map (validated before the plan):** every existing TJ fixture
survives VERBATIM — the R97 fixtures carry `-120`/`-250` (≥ 100 → space,
assertions unchanged), the R98/R99 fixtures are single-atom arrays, the
R100 fixture rides Td moves (no arrays), the R99 hex-in-array fixture
carries `-250` (space) and an adjacent-atom pair (no number → the
standing join). **A prototype of the fix validated the design end-to-end**:
all three regression fixtures OK; the Word file extracts "Pitt Information
Technology … Microsoft Word 2019 Fundamentals Workshop" (soup 1692 → 1);
the Adobe file "726 Broadway, 2nd Floor … tisch.career@nyu.edu … Reverse
Chronological resume Samples" (soup 4713 → 2); the arXiv paper
"LayerSkip: Enabling Early Exit Inference and Self-Speculative Decoding …
Akshat Shrivastava" (soup 619 → 83); the IRS form unchanged (0 soup runs).

**R101-B — the `Tz`/`Ts` operators: a CLASSIFICATION, not a defect
(watch).** The corpus census (all five real files, all inflated streams):
ONLY the Adobe file writes them — and ALL 24 `Tz` operands are `100` (the
default) and ALL 24 `Ts` operands are `0` (the default). No real writer in
the corpus uses a non-default `Tz`/`Ts`. The theoretical break (a
non-default `Tz` skewing the em normalization by `Tz/100`) stays
documented as a WATCH with no action — the same pattern as the r96
inline-flow watch. A non-default value in a future real file re-opens the
candidate.

**R101-C — the Type3-font forms: a CLASSIFICATION, not a defect (watch,
pinned).** The arXiv paper carries **7 Type3 fonts** — all from the
Matplotlib pdf backend (`/Subtype /Type3 /BaseFont /BMQQDV+DejaVuSans`
with `/CharProcs` + `/Encoding /Differences`). The decisive property: the
`/Differences` arrays map **ASCII-valued codes to the standard Latin
glyph names** (`43 /plus`, `45 /hyphen`, `48 /zero`, `/one`, `/two` …) —
so a literal show through such a font carries bytes that already decode
as the correct characters through the standing Latin-1 path. The arXiv
extraction is clean (68,047 alnums — the figure labels extract as real
text). A Type3 font with a NON-ASCII `/Differences` remap would need the
Differences parse — no real file in the corpus has one. WATCH, with a
born-green pin shaped like the Matplotlib form (a Type3-declared font's
literal show extracts — the classification locked green).

**The real-file classification, extended:** literal PDFs extract · hex/CMap
PDFs extract through the map · per-glyph Tj+Td PDFs extract as words
(R100) · **kerned TJ-array PDFs extract as words AFTER this round's fix
(the Word/Adobe/pdfTeX families)** · encrypted PDFs correctly do not.

## The test plan (TDD)

1. **RED (unit, `tests/unit/cv-text.test.ts`)** — (a) the WORD form:
   `[(In)-4(for)7(m)-6(ation)-2( T)-2(e)4(c)4(h)-3(n)-3(o)10(logy)] TJ` →
   "Information Technology" (RED today: "In for m ation T e c h n o logy");
   (b) the ADOBE form: `[(Tisch Of)18(fice of Car)18(eer Development)] TJ`
   → "Tisch Office of Career Development" (RED today: "Car eer"); (c) the
   PDFTEX form: `[(Lay)25(erSkip:)-322(Enabling)-211(Early)-211(Exit)] TJ`
   → "LayerSkip: Enabling Early Exit" (RED today: "Lay erSkip:"); (d) the
   0.1-em boundary: `[(word) 99 (join)] TJ` → "wordjoin" AND
   `[(word) 100 (gap)] TJ` → "word gap" (RED today: both space-join);
   (e) the consecutive-number SUM: `[(pay) -50 -40 (roll)] TJ` → "payroll"
   (90 < 100 → join; RED today: "pay roll"); (f) the kern-join with HEX
   atoms: `[<61 62> 18 <63 64>] TJ` → "abcd" (RED today: "ab cd").
2. **BORN-GREEN guards** — (g) adjacent atoms with NO number keep the
   standing space join (`[(Senior HR Manager) (with payroll)] TJ`); (h)
   the R97 `-120` semantics survive verbatim (the existing fixture — the
   over-fix guard, must stay green untouched); (i) the Type3 pin
   (R101-C): a Type3-declared font's literal show extracts (the
   Matplotlib shape — the classification locked).
3. **GREEN** — the `cv-text.ts` TJ-array walk: the atoms AND the
   inter-atom numbers walk together; the |sum| of consecutive numbers
   decides (`≥ 100` → the space rule via the state machine; under → no
   separator; none → the standing join); the hex decode phase untouched.
   The 26 existing cv-text specs must stay green (the regression net).
4. **RED→GREEN (E2E, born-green + mutation-proofed)** — the new
   `tests/e2e/session101-wordkern-cvflow.spec.ts`: a Word-shaped PDF whose
   ENTIRE CV vocabulary rides sub-100 kern-split clusters (`(ad)4(min)`,
   `(pay)5(roll)` — the payload-exclusivity rule; under the mutation the
   split tokens match zero keywords) through the actual UI → the analysis
   card → the persisted API row (`skillsMatch > 0`, `aiScore > 5`) → the
   cleanup, with the `/assets`-pattern pre-clean beforeEach (the
   guard-clearing-payload rule: the soup clears the 40-alnum guard, so a
   failed run still POSTs).
5. **The mutation proof (single branch — one rule)** — M1: the TJ-internal
   kern rule neutralized (the blind space-join restored) → unit exactly
   the join-direction specs RED (a–f minus the gap members) + E2E exactly
   1 RED (the session101 spec) while session97/98/99/100 stay green;
   restore → REBUILD (the §110 rule) → all green.
6. **Gates** — lint 0/0 · tsc ✓ · unit 1015+N · build ✓ (under
   `env -u DATABASE_URL`) · E2E 553+1 (the final gate ALONE, the detached
   node-spawn protocol) · DB pristine at close.

## The round's verification legs (the standing protocol)

- The real-file ground truth after the fix: the three NEW writers
  (Word/Adobe/iText) + the standing corpus — the yields, the soup-run
  collapses, and the alnum-count stability (the join re-spaces; the
  counts must hold: IRS 5,871 · arXiv ~68,047 · the W3C dummy's 13-alnum
  guard pin).
- The live post-fix verify on :3200 — a Word-shaped kern-split CV through
  the actual UI (tab → job select → upload) → the analysis card
  (screenshot evidence) with matched keywords → the candidate swept (DB
  pristine). The stale-server trap: kill by the server.js process, verify
  zero survivors, then boot on the REBUILT standalone.
- The mobile-nav pair re-verified on the remediated build (the standing
  emphasis).
- The evidence chain: r101 PNGs under `docs/screenshots/`.
- The docs layer: this plan + the narrative (`docs/session_228.md`) + the
  AGENTS session-101 layer + the SKILL §113 lesson + the
  CLAUDE/README/AGENTS count lockstep + the worklog entry.

## Execution appendix (filled at close)

- **RED 6/6 as designed** — the Word form (all three assertions: "Information
  Technology" / "technology.pitt.edu" / "Last Updated: 11/01/19"), the Adobe
  form ("Tisch Office of Career Development" / "726 Broadway, 2nd Floor"),
  the pdfTeX form ("LayerSkip: Enabling Early Exit Inference and" /
  "Self-Speculative Decoding"), the 0.1-em boundary (99 → "wordwordword
  joinjoinjoin" split wrong today; the 100-gap member green both sides), the
  consecutive-number sum ("administration" / "HRIS"), and the hex-in-array
  kern ("abcd"). The three born-green members (the adjacent-atoms space-join
  guard, the pdfTeX gap-class guard, the Type3 pin) held green from the
  first run, and all 26 standing cv-text specs stayed green (29 passed).
- **GREEN 35/35** — the array walk: the atoms AND the inter-atom numbers
  walk together (`|(-?[\d.]+)|` joins the atom alternation); the |sum| of
  consecutive numbers decides (`kern ≥ 100` → `pendingEm = 1.0` fires the
  space rule; under → `pendingEm = 0` joins; NO number between atoms → the
  standing space join; a trailing number discarded). Full unit:
  **1024/1024** (1015 + 9 R101) · tsc ✓ · lint 0/0.
- **The E2E fixture audit (the discrimination proof, run BEFORE the spec)**:
  the scorer's exact STOPWORDS + tokenize + the seeded System Admin job
  computed live — the first-24 keyword set is
  `system admin detail oriented tech savvy technology specialist support
  implementation management optimization driven platform closely people
  leaders ensure systems run smoothly securely effectively key`. The
  fixture's 3-char clusters audit SAFE against every keyword (no cluster
  can exact- or prefix-match — the prefix rule needs ≥ 4 chars on both
  sides). **Two fixture-design catches the audit surfaced:** (1) the
  original kernWord put the word's trailing space OUTSIDE the atoms — the
  fixed build FUSED the words ("administrationspecialistplatform", and the
  match rode the whole-fused-token prefix rule — fragile); the cure: the
  trailing space rides INSIDE the last atom (the real Word form
  `(ation)-2( T)`). (2) The original "5 years" member SURVIVES the mutation
  (the years regex parses the split soup too — its +10 broke the
  `aiScore > 5` discrimination: the mutated score was 10); the cure: no
  years member. After both fixes: **MUTATION matched=0, skillsMatch=0,
  aiScore=5 (the floor) → both assertions RED; FIX matched=8 (system admin
  tech technology specialist platform systems securely), skillsMatch=33,
  aiScore=24 → GREEN.**
- **The born-green E2E catch — the §110 stale-served-build trap at the E2E
  layer:** the first run FAILED (skillsMatch 0) with the fix in the source —
  because the playwright webServer runs the PREBUILT
  `.next/standalone/server.js` (the r100-close build, pre-fix). The E2E
  gate needs the SAME rebuild-before-run discipline as :3200. After the
  rebuild: **born-green 2/2.**
- **The mutation proof (single branch, both layers)** — M1 (the array
  numbers dropped from the walk — the blind space-join restored): unit
  exactly **6 RED** (the six join-direction specs; the 3 guards + 26
  standing green); E2E exactly **1 RED** (the session101 spec's
  `skillsMatch > 0`) while session97 (both members), session98, session99
  (both members), and session100 ALL GREEN — unique teeth. Restored →
  REBUILD → unit 35/35 + E2E 2/2 re-verified green.
- **The real-file ground truth after the fix:** the Word file transformed
  from "Pitt In for m ation  T e c h n o logy" to **"Pitt Information
  Technology     technology.pitt.edu   Last Updated: 11/01/19 … Microsoft
  Word 2019 Fundamentals Workshop … Faculty and Staff Development
  Program"** (letter-soup runs 1692 → 1); the Adobe file from "Tisch Office
  of Car eer Development" to **"Tisch Office of Career Development / 726
  Broadway, 2nd Floor … tisch.career@nyu.edu … Reverse Chronological
  resume Samples"** (4713 → 2); the arXiv paper from "Lay erSkip:
  Enabling" to **"LayerSkip: Enabling Early Exit Inference and
  Self-Speculative Decoding … Akshat Shrivastava"** (619 → 83 — the
  residual is the per-glyph Td figure labels); the stanford iText file
  12 → 1. **Every alnum count IDENTICAL to the pre-fix yields (24581 /
  43137 / 38370 / 68047 / 5871) — the join only re-spaces, exactly as
  designed.** The IRS form unchanged (0 soup runs, 5,871 alnums — the R100
  pin holds); the W3C dummy's 13-alnum guard pin holds.
- **The live post-fix verify:** the real-shaped Word-kern CV through the
  :3200 UI → **the analysis card rendered** ("r101 real cv" + AI score
  24/100 + Skills match 33% + the matched keywords system/admin/tech/
  technology/specialist/platform/systems/securely — 8 real keywords matched
  from kern-split clusters, exactly the audit's prediction) → the API row
  persisted (score 24, skills 33) → the candidate swept (DB pristine:
  1 user / 0 candidates after the loading-probe sweep). The mobile-nav
  pair re-verified on the remediated build (the same PARITY contract, the
  menu cycle green). The e2e.db clean (the spec's pre-clean beforeEach
  swept the pre-rebuild failure's leaked row — the r100 hardening working
  as designed).
- **The round's process traps:** the exported-`DATABASE_URL` guard's THIRD
  leg (the :3200 server BOOT — the boot inherited the sandbox's exported
  `file:/home/z/my-project/db/custom.db` and the API answered Prisma Error
  14 "Unable to open the database file" on every login; the cure: `env -u
  DATABASE_URL` on the server boot, same as the build and the CLI legs)
  · the agent-browser thread-exhaustion round two (the rapid session
  cycling exhausted the sandbox's threads — `fork: retry` + CDP connect
  refusals; the standing cure: pkill the headless shells, settle, batch)
  · the E2E-layer stale-served-build (above).
- **Final gates on the remediated tree:** lint 0/0 · tsc ✓ · **1024/1024
  unit** · build ✓ (under `env -u DATABASE_URL`) · **E2E 554/554** (the 553
  standing + the 1 new; the final gate ALONE via the detached node-spawn
  protocol) · DB pristine at close.
- **The evidence chain:** the r101 PNGs (the REF + clone mobile-nav opens,
  the clone training-mobile landing, the CV tab rest/active, the analysis
  card).
- **The docs layer:** this plan + the narrative (`docs/session_228.md`) +
  the AGENTS session-101 layer + the SKILL v3.88.0 §113 + the
  CLAUDE/README/AGENTS count lockstep (1024 + 554 = 1578) + the worklog
  round-100 entry.
