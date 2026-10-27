# Remediation Plan — Session 103 / Parity Round 102: the Google Docs/Skia + LuaTeX real-writer round

**The frontier.** The r102 close-out's queue: (1) the CV-flow watches — the
non-ASCII `/Differences` remap, the non-default `Tz`/`Ts`, the LibreOffice
negative-tracking class, the positive-gap-writer class (all still awaiting
real files) — plus the standing invitation to pin MORE real writer families
(the corpus stood at nine: W3C, arXiv/pdfTeX, encrypted-orimi, IRS/Acrobat,
Word-365, Adobe-PDF-Library, iText, LibreOffice ×2), with Google Docs/Skia,
macOS Quartz and XeTeX the named candidates, (2) the REF-broken mobile set on
watch (the 67th-state baseline), (3) the standing watches (the 67th-state
login ladder re-armed, the recharts grid class, the dark-band theming, the v4
space-y inline-flow watch, the patch watch at ^16.4.2 with 16.4.3 published),
(4) the neo-crm session-191/192 layer.

## The opening read (the standing ladder — the REF QUIET at the 67th state)

| Ladder step | Result |
|---|---|
| Workspace | The workspace had been RESET (the eon-hr directory empty) — re-cloned from `nordeim/eon-hr` at `f422cc3` (the session-102 close + the session_231 transcript); `bun install` + `.env` (the two-variable contract) + `db:push`/`db:seed` + the production build + the :3200 boot (the node-spawn detached protocol) all fresh |
| **R103-A — the baseline lint break (found and fixed)** | **The HEAD's lint gate was RED** — `scripts/r102-analysis-card.mjs:121` carried an unterminated string literal (the previous session's shell-escaping workaround for the cleanup DELETE was committed mid-repair; the r102 final gates ran before the script landed). Fixed: the DELETE command built in a variable first. lint 0/0 restored — a real, committed-later-than-the-gate defect on the unmodified HEAD |
| Baseline gates (after R103-A) | lint 0/0 · tsc ✓ · **1028/1028 unit** — matches the session-102 close |
| The exported-`DATABASE_URL` guard | ACTIVE all round (`file:/home/z/my-project/db/custom.db` exported by the sandbox — `env -u DATABASE_URL` on every Prisma CLI touch, every `next build`, and the :3200 boot) |
| The deploy watch | **THE REF QUIET at the 67TH deploy state** — login JS `index-D__5Nn5J` and CSS `index-Dv2nVyxn` BOTH unchanged (the r103-deploy-watch probe) — no 68th deploy; the r102 ladder classifications hold verbatim |
| The mobile-nav cross-side pair (the standing emphasis) | **PARITY, live-verified on BOTH sides** — REF: hamburger 28×28 `lucide-panel-left` "Toggle Sidebar" + drawer 288×844 fixed z-50 (16 items); clone: the same geometry + the `aria-label`/`role=dialog` a11y supersets; the clone menu cycle open → Training LMS → `/training` + **AUTO-CLOSED** (the r103 probes). No Tailwind v4 regression in the mobile band |
| The REF-broken mobile set | **HOLDS at the 67th state** — `/employeedetail` the empty shell (rootChildren 2, mainTextLen 26, scrollW 390), re-read live in the r103 ref-nav probe |
| The standing scans | oklch clean (globals.css doc comments only) · `md:flex-wrap` zero · secrets zero · the patch watch HOLD at ^16.4.2 (16.4.3 — no newer) · every CartesianGrid site `strokeDasharray="3 3"` · the space-y inline-flow watch clean |
| DB state | pristine (1 user / 0 candidates) after the fresh seed |
| The neo-crm session-191/192 layer | **CONSUMED — CRM-ONLY, nothing eon-hr-adoptable** (session-191: the contact/account create-dialog open faces + the id-parity cures on CRM surfaces eon-hr does not carry; session-192: the CRM login anon-surface interiors + the landing marketing arms). **The methodology transfer executed instead**: the D-192 id/for literal-parity census ran on the eon-hr login surface — REF `id="email"`/`id="password"` + `for=` wiring vs the clone's — **PARITY holds** (the clone's `autoComplete` pair is the a11y superset, not a divergence) |

## THE ROUND'S FINDINGS (empirically verified before the fix)

**R103-B — the Tm-position-aware separator: the Google Docs/Skia and LuaTeX
writer families extract as WORD SOUP (VERIFIED on two NEW real files —
CRITICAL within the superset flow).** The round downloaded the **9th real
writer family — Google Docs** (gdocs-cv-template.pdf, Producer "Skia/PDF
m158 Google Docs Renderer", PDF 1.4 — a real CV template, the exact
job-applicant flow surface) and the **10th — LuaTeX** (martino-lualatex.pdf,
Producer "LuaTeX-0.80.0" — a real full-stack-developer CV). Both carry their
word positioning in the **Tm translation**, which the walk blind-reset:

- **The Skia form**: every word is its own BT block — `Tm(1 0 0 -1 ex ey)`
  (a FLIPPED axis-aligned matrix) + `Td(tx, -14.2578125)` (a CONSTANT
  baseline ty, identical for every word on the page) + a hex `Tj`. The line
  geometry lives in the enclosing `q … cm … Q` block. Under the standing
  walk: the Tm resets the pending state and the constant-baseline ty≠0 fires
  the newline rule for **EVERY word** — the file extracts as
  word-per-line soup ("Name\n \nof\n \nCurrent\n \nEmployer ,") — and the
  same-BT split-word continuations ("COMP" `Td(47.6875,0)` "ANY" — Skia's
  kern-pair shaping splits, the tx exactly the preceding part's width) fire
  the ≥1.0-em gap rule → **"COMP ANY", "W ith", "Of fice", "Pr ofessional",
  "YouT ube"** — keywords the scorer's tokenizer loses ("pr"+"ofessional"
  matches nothing; the 4-char-prefix rule saves only some).
- **The LuaTeX form**: every word AND every glyph is its own BT block — a
  single-code hex `TJ` array under its own axis-aligned `Tm`. The standing
  Tm reset gives every piece the default space join → the file extracts as
  **letter soup** ("N o v . 1 5 - N o w", "I n k r e m e n t") — **1,012
  letter-soup runs; every keyword dies** (single letters are sub-3-char
  tokens).

**The fix (R103-B, two legs):**

1. **The Tm-origin delta rule** — the Tm alternative in the operator walk
   now captures the SIX operands. For an AXIS-ALIGNED matrix (|b|,|c| ≈ 0)
   the translation (e,f) is the run's origin, and the ORIGIN-TO-ORIGIN
   delta from the last axis-aligned Tm drives the separator exactly like a
   between-shows move: |dy|/(size·|d|) ≥ 0.5 em → a line move (pdfTeX's
   per-line Tm steps); a backwards or ≥ 1.0-em dx → a word gap; a forward
   dx under 1.0 em → a glyph continuation (the join — the LuaTeX
   per-glyph form). A ROTATED matrix (the IRS's sideways labels) keeps the
   standing blind reset and drops the origin track.
2. **The fresh-run baseline rule** — a Td arriving BEFORE any show in a
   fresh run (`shownSinceTm=false`) carries a BASELINE placement, not a
   line move: its ty does not fire the newline rule (the Skia
   constant-baseline class); between-shows Tds keep the standing ty rule
   (the IRS/pdfTeX line moves — the arXiv `-12.21` class, verified: its
   line Tds ride per-line Tm origins whose dy already carries the signal).

**R103-C — the space-glyph conditional for split-word continuations
(VERIFIED — HIGH).** The Skia split words are same-BT `Td(tx, 0)`
continuations whose tx equals the preceding part's width —
operator-identical to a real word gap (the IRS `2.356 0 Td` class). The
discriminator is the STREAM's convention: Skia (like LibreOffice) encodes
word gaps as EXPLICIT standalone space-glyph pieces and NEVER as bare moves,
so a bare em-gap move between non-space shows is a continuation. The fix: a
piece whose `" "` separator came from a MOVE-driven forward em-gap
(Td/Tm — never a TJ-array internal NUMBER, which is pdfTeX's explicit
numeric-gap intent) carries `condGap`; at assembly time (after the hex
decode), a stream containing standalone whitespace pieces resolves its
condGaps to JOINS — the space pieces themselves carry the word separation.
Streams without space glyphs (IRS, pdfTeX, Word, Adobe) keep every gap.

**The empirical validation (the prototype on the real corpus):**

| File | The r102 close | The prototype | Verdict |
|---|---|---|---|
| irs-f1040 | 5,871 alnums · 0 soup | 5,871 · 0 · 0 fused | IDENTICAL |
| pitt-word | 24,464 | 24,464 · 0 · 0 | IDENTICAL |
| tisch-resume | 42,379 | 42,379 · 0 · 0 | IDENTICAL |
| stanford-resume | 38,339 | 38,339 · 0 · 0 | IDENTICAL |
| arxiv-2404 | 67,744 · soup 83 | 67,744 · soup 82 · 0 fused | alnum IDENTICAL (the first prototype draft FUSED 350 words — the pdfTeX space-piece trap, cured by the fromKern restriction below) |
| lo-writer-guide | 641,482 · 0 | 641,482 · 0 · 0 | IDENTICAL |
| lo-calc-guide | 691,268 · soup 8 | 691,268 · 0 · 2 "fused" (both `createFilterDescriptorByObject` — a real LO API name, correctly one word) | alnum IDENTICAL |
| w3c-dummy | "" (the guard pin) | "" | IDENTICAL |
| **gdocs (NEW)** | word-per-line + 12 split words | **readable, 0 soup, 0 fused — every split word joined** ("COMPANY", "With", "Office", "Professional", "YouTube", "References", "Provider", "Accredited", "curriculum") | **FIXED** |
| **martino-luatex (NEW)** | 1,012 soup runs | **0 soup · 38 fused 25+ runs** (the narrow-ending word gaps) | **FIXED** (the residual documented) |

**The design's empirical dead-ends (both verified on the real bytes, both
documented as the round's lessons):**

- **The Tm-per-glyph word gap is unthresholdable.** The measured martino
  same-line delta distribution: letter advances 0.2–0.95 em (the mode
  0.5–0.6, 1,613 of 3,400), word gaps = width(last letter) + ~0.25 em space
  → **0.25–1.15 em — fully overlapping the letter distribution** (the
  +0.25-em space signal is smaller than the 0.65-em letter-width variance).
  The 1.0-em threshold is the empirical sweet spot: wide-ending word gaps
  space correctly, narrow-ending gaps fuse — 38 fused runs vs the pre-fix
  1,012 soup runs (a total keyword loss). The residual is the same class as
  the r100 arXiv per-glyph labels and the r102 LO negative-tracking splits;
  a future two-pass per-letter width table could re-open it (the watch).
- **The pdfTeX space-piece trap (the prototype's own regression, caught by
  the corpus discipline).** pdfTeX writes a FEW standalone space pieces in
  some streams — the first draft's "any space piece ⇒ all gaps join"
  conditional fused 350 arXiv words (its `-322` TJ-internal numeric gaps
  joined). The cure: **condGap is NEVER set for TJ-array internal numeric
  gaps** (the writer's explicit kern/gap intent — `fromKern`) — only
  move-driven gaps are conditional. After the restriction: arXiv 0 fused,
  alnums IDENTICAL.

## The test plan (TDD)

1. **RED (unit, `tests/unit/cv-text.test.ts`)** — (a) the SKIA FORM: a
   two-"line" PDF with the flipped Tm + constant-baseline Td + hex words +
   explicit space-glyph pieces → the words extract space-separated on their
   line (RED today: every word "\n"); (b) the SKIA SPLIT-WORD: the same-BT
   `Td(2.5 em, 0)` continuation "s"+"ystems" in a space-glyph stream →
   "systems" (RED today: "s ystems"); (c) the LUATEX FORM: single-glyph Tms
   at sub-em deltas with ≥1.2-em word gaps → the word assembles (RED today:
   letter soup).
2. **BORN-GREEN guards** — (d) the pdfTeX Tm+Td line move: per-line Tm
   origins + `Td(0, -1.2em)` baselines keep their newlines (the fresh-run
   suppression must not lose pdfTeX line breaks); (e) the rotated-Tm form
   keeps the standing reset; (f) the fromKern guard: a stream with a space
   piece AND a TJ-internal `-322` gap keeps the gap (the arXiv regression
   guard — teeth for M3); (g) the standing R100-A per-glyph Td fixtures
   VERBATIM (the whole session-100 layer — untouched by the fix).
3. **GREEN** — the `cv-text.ts` changes: the Tm operand capture (groups
   9–14), the origin-delta rule, the fresh-run baseline suppression, the
   condGap marking (move-driven only), and the assembly-time space-glyph
   conditional. All 34 standing cv-text specs stay green (validated: the
   prototype run — 1028/1028).
4. **RED→GREEN (E2E, born-green + mutation-proofed)** — the new
   `tests/e2e/session103-gdocs-luatex-cvflow.spec.ts`: a two-stream PDF
   (stream 1: the Skia region — whole words + space glyphs + THREE
   first-letter split continuations; stream 2: the LuaTeX per-glyph region)
   through the actual UI → the analysis card → the persisted row → the
   cleanup, with the `/assets`-pattern pre-clean beforeEach. **The fixture
   audit (run BEFORE the spec — the r101 discipline):** the scorer's exact
   first-24 keyword set computed live; the FIX simulation matched=14 /
   skillsMatch=58 vs M1 (the Tm rule reverted — the LuaTeX region soup'd)
   matched=8 / 33 and M2 (the condGap conditional removed — the
   first-letter splits stay split; a first-letter cut is the only split
   that kills a keyword under the 4-char-prefix rule) matched=10 / 42. The
   split words ride "s|ystems", "d|etail", "p|latform" (1-char prefixes
   cannot prefix-match).
5. **The mutation proof (three branches — one per rule leg)** — M1: the Tm
   handler reverted to the standing reset + the ty rule restored → the
   Skia-form and LuaTeX-form specs RED + the E2E leg RED; M2: the
   assembly-time conditional removed → the split-word spec RED + the E2E
   leg RED; M3: the fromKern restriction removed (TJ numeric gaps
   conditional again) → the fromKern guard RED (the arXiv-regression
   teeth). Each mutation: unit RED exactly as designed; restore → REBUILD
   (the §110 rule) → all green.
6. **Gates** — lint 0/0 · tsc ✓ · unit 1028+N · build ✓ (under
   `env -u DATABASE_URL`) · E2E 555+1 (the final gate ALONE, the detached
   node-spawn protocol) · DB pristine at close.

## The round's verification legs (the standing protocol)

- The real-file ground truth after the fix: the two NEW files (the gdocs
  template readable end-to-end; the martino CV readable with the 38-fusion
  residual) + the standing corpus (the IRS 5,871 IDENTICAL pin, the
  encrypted class pinned by the unit fixture — the r97 corpus file is not
  present in the fresh workspace, the W3C dummy's guard pin, the
  pitt/tisch/stanford/arXiv/LO alnum pins IDENTICAL, every sample verified
  intact).
- The live post-fix verify on :3200 — a Skia+LuaTeX-shaped CV through the
  actual UI (tab → job select → upload) → the analysis card (screenshot
  evidence) → the candidate swept (DB pristine). The stale-server traps:
  kill by the server.js process; `env -u DATABASE_URL` on the boot.
- The mobile-nav pair re-verified on the remediated build (the standing
  emphasis).
- The evidence chain: r103 PNGs under `docs/screenshots/`.
- The docs layer: this plan + the narrative (`docs/session_232.md`) + the
  AGENTS session-103 layer + the SKILL §115 lesson + the CLAUDE/README/
  AGENTS count lockstep + the worklog round-102 entry.

## Execution appendix (filled at close)

- **R103-A (the baseline lint break)** — fixed FIRST, before the frontier:
  the HEAD's `scripts/r102-analysis-card.mjs:121` unterminated string
  (the previous session's mid-repair shell-escaping workaround, committed
  after its lint gate ran). The DELETE command now builds in a variable
  first. lint 0/0 restored on the unmodified tree — the round's first
  finding, a committed-later-than-the-gate defect.
- **RED 3/3 as designed** — the Skia form spec (every word "\n"-separated
  under the pristine walk), the split-word spec ("s ystems" under the ≥1-em
  gap rule), and the LuaTeX per-glyph spec ("t e c h n o l o g y" under the
  blind Tm reset). The three guards born-green (the pdfTeX per-line Tm
  steps, the rotated-Tm IRS form, the fromKern numeric-gap rule). One
  fixture catch: the Skia spec's first draft cleared only 32 alnums — the
  40-alnum guard swallowed the RED (the r97 fixture-length lesson, seventh
  application — lengthen the fixture, never the guard).
- **GREEN 45/45** → full unit **1034/1034** (1028 + 6 net new) · tsc ✓ ·
  lint 0/0.
- **The mutation proof (three branches, both layers):** M1 (the Tm-origin
  rule + the fresh-run suppression neutralized) → unit exactly **2 RED**
  (the Skia + LuaTeX specs) + E2E exactly **1 RED**; M2 (the assembly-time
  conditional removed) → unit exactly **2 RED** (the split-word + Skia
  specs) + E2E exactly **1 RED**; M3 (the fromKern restriction removed) →
  unit exactly **1 RED** (the fromKern guard — the arXiv-regression teeth;
  the E2E fixture carries no TJ-internal numeric gaps, so this leg rides
  the unit layer — the r100/r102 documented split). Each mutation ended
  with a REBUILD before its E2E leg (the §110 rule).
- **The E2E fixture audit, refined on live evidence:** the first fixture
  draft used 1-char split prefixes ("s|ystems") — the offline verify
  caught that a 1-char part is also SUB-EM (0.55 em), so the continuation
  rides the standing join, not the conditional (M2 had no E2E teeth — the
  first M2 leg passed 2/2). The redesign: **3-char prefixes** ("sys|tems",
  "det|ail", "pla|tform") — under the 4-char prefix rule (min length 3 <
  4, no match) AND over the 1.0-em gap rule (22–24 units at Tf 16 = 1.4 –
  1.5 em — the conditional required). A second catch: the spec builder's
  split first part encoded `codeOf.get(first)` (undefined for a 3-char
  string — the part silently vanished); fixed to `hexOf(first)`. After
  both: **FIX matched=15 / skillsMatch=63 / aiScore=38 vs M1 9/38/23 and
  M2 11/46/28** — and the live card rendered EXACTLY these numbers.
- **The real-file ground truth after the fix:** the gdocs CV template
  extracts **readable end-to-end** — "Name of Current Employer, Address
  Line 1, Address Line 2. City, Country. Mobile: (+000) 123456789 …
  Insights Discovery Accredited Practitioner (Personality profiling based
  on the four colour energies)" — 1,306 alnums (unchanged), 0 soup, 0
  fused, every split word joined (COMPANY, With, Office, Professional,
  YouTube, References, Provider, Accredited, curriculum). The martino
  LuaTeX CV: **0 soup (was 1,012 runs)**, 3,704 alnums (unchanged), 38
  fused 25+ runs (the narrow-ending word-gap residual — the measured
  delta distribution: letter advances 0.2–0.95 em vs word gaps
  0.25–1.15 em, fully overlapping; the watch). The standing corpus:
  IRS 5,871 IDENTICAL · pitt 24,464 · tisch 42,379 · stanford 38,339 ·
  arXiv 67,744 (0 fused — the fromKern cure) · lo-writer 641,482 ·
  lo-calc 691,268 · the W3C dummy "" (the guard pin) — every alnum count
  IDENTICAL to the r102 closes, every sample verified intact.
- **The live post-fix verify on :3200:** the Skia+LuaTeX fixture through
  the actual UI (tab → job select → upload) → **the analysis card rendered
  ("r103 live cv" + AI score 38/100 + Skills match 63% + all 15 matched
  keywords — system/admin/detail/oriented/tech/technology/specialist/
  support/management/optimization/platform/closely/people/systems/
  securely — the audit's EXACT prediction)** → the API row persisted
  (score 38, skills 63) → the candidate swept (DB pristine: 1 user /
  0 candidates). The mobile-nav pair re-verified on the remediated build
  (the same PARITY contract: 28×28 hamburger, 288×844 fixed z-50 drawer,
  the menu cycle /training + AUTO-CLOSED — no Tailwind v4 regression).
- **The round's process traps:** the fresh-workspace intake (the reset
  workspace lost the corpus PDFs, the playwright chromium-1248 binary,
  and the .env — all re-established; the encrypted-orimi corpus file is
  gone, its class still pinned by the unit fixture) · the E2E fixture's
  sub-em split prefix (the offline verify caught it BEFORE the mutation
  legs wasted rebuilds) · the `codeOf.get(multi-char)` undefined
  (the silent-vanishing part) · the MultiEdit sequential-application
  behavior (edits before a failed match DO land — re-read before
  re-applying).
- **Final gates on the remediated tree:** lint 0/0 · tsc ✓ · **1034/1034
  unit** · build ✓ (under `env -u DATABASE_URL`) · E2E **556/556** (the
  555 standing + the 1 new; the final gate ALONE via the detached
  node-spawn protocol) · DB pristine at close.
- **The evidence chain:** the r103 PNGs (the REF + clone mobile-nav opens,
  the clone training-mobile landing, the CV tab, the analysis card).
- **The docs layer:** this plan + the narrative (`docs/session_232.md`) +
  the AGENTS session-103 layer + the SKILL v3.90.0 §115 + the
  CLAUDE/README/AGENTS count lockstep (1034 + 556 = 1590) + the worklog
  round-102 entry.
