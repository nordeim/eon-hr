# Remediation Plan — Session 100 / Parity Round 99: the per-glyph Tj+Td CV-flow round

**The frontier.** The r99 close-out's queue: (1) the CV-flow's remaining
edges — the ObjStm/compressed-object form and a real Acrobat-produced PDF
pin (the r99 round's real-file leg found the W3C + arXiv + encrypted
writers; an actual Acrobat-family file remained unpinned), (2) the
REF-broken mobile set on watch, (3) the standing watches (the 66th-state
login ladder re-armed, the recharts grid class, the dark-band theming, the
v4 space-y inline-flow watch, the patch watch at ^16.4.2 with 16.4.3
published), (4) the neo-crm session-188 layer (docs-only).

## The opening read (the standing ladder)

| Ladder step | Result |
|---|---|
| Workspace | `git pull` fast-forward `f28c4eb → 6adb13d` (docs only: the session_225 raw transcript) — the session-99 close state intact |
| Baseline gates | lint 0/0 · tsc ✓ · **1008/1008 unit** · the E2E baseline = the r99-close final gate (552/552 on the identical tree) |
| The exported-`DATABASE_URL` guard | ACTIVE all round (the sandbox exports `file:/home/z/my-project/db/custom.db` — every Prisma CLI touch AND every `next build` runs under `env -u DATABASE_URL`) |
| The deploy watch | **REF QUIET at the 66th state** — login JS `index-DmiZE53r`, CSS `index-puMd6fDW`, both unchanged (the r100-deploy-watch probe); the standing ladder classifications hold, no re-classification pass needed |
| The standing scans | oklch clean (globals.css doc comments only) · `md:flex-wrap` zero · secrets zero · the patch watch HOLD at ^16.4.2 · every CartesianGrid site pins `strokeDasharray="3 3"` · the space-y inline-flow watch clean (0 heuristic hits, the dashboard's explicit-`mt-8` pattern intact) |
| The mobile-nav cross-side pair (the standing emphasis) | **PARITY, live-verified both sides** — REF: hamburger 28×28 `lucide-panel-left` "Toggle Sidebar" + drawer 288×844 fixed z-50 with the 16-item nav; clone: the same geometry + the `aria-label`/`role=dialog` a11y supersets; the clone menu cycle open → Training LMS → `/training` + AUTO-CLOSED. No Tailwind v4 regression in the mobile band. |
| The REF-broken mobile set | HOLDS — `/employeedetail` still the empty shell (rootChildren 2, mainTextLen 26, scrollW 390); the standing classifications for hrreports/interviewassistant/employeeselfservice/recruitment stand (REF quiet at the same deploy state) |
| The neo-crm pattern check | session-189 landed — a product-code round on **CRM-only surfaces** (the leads saved-views select open faces + the calendar month-nav arms): no eon-hr-adoptable product pattern (different product surface); the process patterns (the discovery-probe adjudication, the fresh-clone baseline gate) are already embodied in the standing protocol |

## THE ROUND'S FINDINGS (empirically verified before the fix)

**R100-A — the per-glyph Tj+Td positioning form extracts as LETTER SOUP
(VERIFIED, HIGH within the superset flow — the real-Acrobat-pin round's
find).** The queue asked for "a real Acrobat-produced PDF"; the round
downloaded the **IRS f1040** (a real Acrobat/LiveCycle XFA-family form:
PDF 1.7, 30 ObjStm objects, XRef stream — the compressed-object form the
queue ALSO named) plus a fresh W3C dummy and the standing arXiv paper.
The IRS form extracts 10,153 chars — but as **letter soup**:

```
before: "F o r   t h e   y e a r" · "1 0 4 0" · "F o r m"
after (the fix design): "For the year Jan. 1–Dec. 31, 2025" · "Form 1040"
```

The writer form (verified in the inflated content streams): LiveCycle
writes each glyph as its OWN `(X)Tj` show, with a glyph-advance `Td` move
between them —

```
/T1_5 1 Tf
6.79 0 0 7 472 676.002 Tm
(S)Tj 0.641 0 Td (p)Tj 0.603 0 Td (o)Tj 0.603 0 Td (u)Tj …
```

— while word gaps are BIGGER Td moves (`2.356 0 Td`, `8.1 0 Td`, the dot
leaders at `1.5 0 Td`) and spaces ride INSIDE atoms (`(IRA distributions )Tj`).
The current `pdfTextAtoms` collects every show as a separate atom and
`extractPdfText` joins ALL atoms with `" "` → every glyph space-separated.
Downstream the scorer's `tokenize` filters tokens under 3 chars —
**every word becomes unmatchable** (`payroll` → `p a y r o l l` → zero
matched keywords, score = the floor 5). A CV from any LiveCycle/Acrobat
Forms writer scores as gibberish through the tab's core promise
("PDF, DOC, DOCX — AI will parse & score automatically").

**The units, resolved empirically** (the Td-census over the real form):
`em = |tx| / Tf_size` — the Tm scale cancels (device move = tx × Tm_a;
one em = Tf_size × Tm_a). The real form's intra-word advances run
0.209–0.641 em and its word gaps 1.2–36.6 em — a threshold at **1.0 em**
separates the classes with margin on both sides.

**The fix (the position-aware atom join):** `pdfTextAtoms` becomes a
sequential operator walk that returns separator-annotated pieces —
`Tf` tracks the em denominator (default 1); `Td`/`TD` accumulate the
pending em displacement (`|tx|/Tf_size`) and the y move; at each show the
pending move decides the separator: **ty ≠ 0 → newline; em ≥ 1.0 (or a
backwards tx) → space; em < 1.0 → NO space (the per-glyph advance)**;
`T*`/`'`/`"` start a new line; with NO positioning between shows the
standing space-join holds. **The TJ-array INTERNALS keep the current
space-join untouched** — their inter-atom numbers are thousandths of text
space (a different unit system), and the R97 fixture
(`[(Senior HR Manager) -120 (with payroll)] TJ` — the -120 IS the word
gap) pins that semantics; the r97/r98/r99 regression net must stay green
verbatim. The two-phase hex/CMap decode is preserved (hex pieces decode
after the whole-file walk, CMap-first — unchanged).

**R100-B — the ObjStm/compressed-object form: a CLASSIFICATION, not a
defect (empirically pinned on two real files).** Both real ObjStm-bearing
PDFs extract through the current scanner — the arXiv paper (11 ObjStm,
pdfTeX): 112,478 chars; the IRS form (30 ObjStm, Acrobat/LiveCycle):
10,153 chars. The reason is the spec itself: **ISO 32000-1 §7.5.7 forbids
stream objects inside object streams** — a page's content streams are
ALWAYS standalone `stream…endstream` objects, exactly what the scanner
walks. The queue's worry ("a PDF whose CONTENT streams ride inside ObjStm
would still be lost") describes a spec-impossible file for compliant
writers. The ObjStm bodies' inflated dicts contribute no text atoms (the
IRS extraction is clean form text, no garbage), and the XRef streams and
XFA JavaScript streams likewise mine to nothing. The cure for the
assumption is the pin: an ObjStm-shaped unit fixture (an ObjStm stream
body carrying dicts + a standalone content stream) locking the walk
green — a born-guard against a future scanner change breaking the
ObjStm-bearing class.

**The real-file three-way classification, extended:** literal PDFs
extract · hex/CMap PDFs extract through the map · per-glyph Tj+Td PDFs
extract as words AFTER this round's fix · encrypted PDFs correctly do
not (the streams are encrypted after compression; `""` + the actionable
UI error is the right behavior — the standing pin).

## The test plan (TDD)

1. **RED (unit, `tests/unit/cv-text.test.ts`)** — (a) the per-glyph
   IRS-shape spec: single-char shows with 0.2–0.65 em Td moves +
   word-gap Td's — asserts the contiguous words ("Spouse…", "Admin
   specialist payroll experience") — RED today (letter soup); (b) the
   Tf-12 point-unit variant (a size-12 writer, point-unit Td moves);
   (c) the em-threshold boundary (0.9 em → no space, 1.1 em → space);
   (d) the ty≠0 line-break rule (a newline, not a space).
2. **BORN-GREEN guards** — (e) adjacent shows with NO positioning
   between them keep the space join; (f) TJ-array internals keep the
   space join (the R97 semantics — the over-fix guard); (g) the
   ObjStm-bearing PDF pin (R100-B): the ObjStm stream body (dicts only)
   contributes nothing, the standalone content stream extracts.
3. **GREEN** — the `cv-text.ts` walk restructure. The 19 existing cv-text
   specs must stay green (the literal path, the octal path, the
   multi-stream path, the delimiter matrix, the hex/CMap path — the
   regression net).
4. **RED→GREEN (E2E, born-green + mutation-proofed)** — the new
   `tests/e2e/session100-perglyph-cvflow.spec.ts`: a per-glyph PDF whose
   CV vocabulary (the seeded job's keywords) is written as single-char
   shows with glyph-advance Td moves — through the actual UI → the
   analysis card with MATCHED KEYWORDS (the letter soup scores the floor
   with zero matched keywords — the mutation proof: revert the join fix →
   the card loses its matched keywords → exactly 1 RED).
5. **Gates** — lint 0/0 · tsc ✓ · unit 1008+7 (4 RED + 3 born-green
   guards) · build ✓ · E2E 552+1 (the new spec's PDF carries an
   ObjStm-shaped stream alongside the per-glyph content — both queue
   members pinned in one E2E leg; the final gate ALONE, the detached
   node-spawn protocol) · DB pristine at close.

## The round's verification legs (the standing protocol)

- The real-file ground truth after the fix: the IRS f1040's extraction
  transformed from letter soup to readable words; the arXiv paper's yield
  roughly unchanged; the W3C dummy's raw 13-alnum yield unchanged (the
  guard pin).
- The live post-fix verify on :3200 — a per-glyph CV-shaped PDF (the
  Acrobat/LiveCycle writer form, the job's keyword vocabulary written as
  per-glyph runs) through the actual UI (tab → job select → upload) →
  the analysis card (screenshot evidence) with matched keywords → the
  candidate swept (DB pristine).
- The mobile-nav pair re-verified on the remediated build (the standing
  emphasis): the menu cycle + the drawer contract.
- The evidence chain: r100 PNGs under `docs/screenshots/`.
- The docs layer: this plan + the narrative (`docs/session_226.md`) +
  the AGENTS session-100 layer + the SKILL §112 lesson + the
  CLAUDE/README/AGENTS count lockstep + the worklog entry.

## Execution appendix (filled at close)

- **RED 4/4 as designed** — the per-glyph IRS-shape spec (the letter-soup
  members: "Spouse"/"Admin"/"payroll"/"senior experience" while the
  whole-word atom "IRA distributions" stayed green as the old-code member),
  the Tf-12 point-unit variant ("payroll admin"), the 1.0-em boundary
  (0.9 em joins → "abcd", 1.1 em separates), and the ty≠0 line-break rule
  ("experience\nHRIS"). The three born-green members (the adjacent-shows
  space-join guard, the TJ-array internal space-join guard, the ObjStm
  pin) held green from the first run.
- **The one fixture-length catch (the r97 lesson, round FOUR)** — the
  adjacent-shows guard's initial fixture ("Senior HR Manager/with/payroll")
  yielded 21 alnums, UNDER the 40-alnum guard, and failed for the wrong
  reason; the fixture body lengthened, never the guard.
- **GREEN 26/26** — the `pdfTextPieces` restructure: the sequential
  operator walk (Tf tracks the em denominator; the Td/TD moves accumulate
  the pending em displacement and the y move; the separator decision at
  each show — ty≠0 → newline, ≥1.0 em or backwards → space, under 1.0 em →
  no space; `T*`/`'`/`"` next-line shows; Tm resets to the default space;
  the TJ-array internals and the no-positioning adjacent shows keep the
  standing space join verbatim).
- **The mutation proof — the two-branch matrix:** M1 (the glyph-advance
  join neutralized) → unit exactly 3 RED (the three join-rule specs), E2E
  exactly 1 RED (the session100 spec's `skillsMatch > 0` assertion) while
  the session97/98/99 specs stayed green; M2 (the ty line-break
  neutralized, isolated) → unit exactly 1 RED (the ty spec) while the
  session100 E2E stayed GREEN (the spec carries no ty moves — the E2E leg
  pins the join rule specifically). Both restored — the restore ending
  with a REBUILD (the §110 rule) — → all green.
- **The E2E fixture discrimination catch (the r97 lesson at the E2E
  layer):** the first session100 fixture carried whole-word atoms with
  matchable keywords ("administration specialist", "senior manager",
  "system support GOSI reporting") — the spec PASSED under M1 because the
  whole-word atoms alone matched keywords. The redesign: the ENTIRE CV
  vocabulary rides per-glyph runs; the whole-word carrier is gone (the
  soup's own alnums still clear the 40-alnum guard). After the redesign
  the M1 run fired exactly 1 RED as designed.
- **The real-file ground truth after the fix:** the IRS f1040 transformed
  from letter soup to readable words ("Form 1040 20 25 U.S. Individual
  Income Tax Return … For the year Jan. 1–Dec. 31, 2025" — the SAME
  5,871 alnums, properly spaced); the arXiv paper's alnum yield unchanged
  (68,047 — the join only re-spaces); the W3C dummy's raw 13-alnum yield
  unchanged (the guard pin holds).
- **The live post-fix verify:** the real-shaped per-glyph PDF (every
  keyword per-glyph + the ObjStm-shaped stream) through the :3200 UI →
  **the analysis card rendered** (the "r100 real cv" name + AI score
  22/100 + Skills match 13% + the matched keywords admin/specialist/
  platform — real words matched from per-glyph runs) → the API row
  persisted (score 22, skills 13) → the candidate swept (DB pristine: 1
  user / 0 candidates). The mobile-nav pair re-verified on the remediated
  build (the same PARITY contract, the menu cycle green).
- **The final-gate pollution catch (the round's last trap):** the first
  final-gate run came back 551 passed + 2 failed — BOTH casualties the
  SAME root cause, and the root was this round's own mutation protocol:
  the session100 fixture DELIBERATELY clears the 40-alnum extraction
  guard (so the letter-soup flow reaches the assertions), which means a
  FAILED mutation run still POSTs its candidate before the assertions
  fire — and the never-reached cleanup LEAKED the row into the persistent
  db/e2e.db. The leaked "r100 perglyph cv" row then broke two DOWNSTREAM
  specs (the recruitment-dnd exact-order assertion gained an extra row;
  the session65 zero-state spec lost its "No applicants found" cell). The
  r99-spec failures never leaked — their payloads died BEFORE the POST.
  **The cure:** the spec gains the /assets-pattern pre-clean beforeEach
  (any leaked rows swept before the test) + the one leaked row swept from
  the e2e.db + both casualty specs re-verified green (11/11) + the final
  gate re-run ALONE.
- **Final gates on the remediated tree:** lint 0/0 · tsc ✓ · **1015/1015
  unit** (1008 + 7 R100) · build ✓ (under `env -u DATABASE_URL`) ·
  **E2E 553/553** (the 552 standing + the 1 new; the final gate ALONE via
  the detached node-spawn protocol — the re-run after the pollution
  catch).
- **The evidence chain:** the r100 PNGs (the REF + clone mobile-nav opens,
  the clone training-mobile landing, the CV tab rest/active, the analysis
  card).
- **The docs layer:** this plan + the narrative (`docs/session_226.md`) +
  the AGENTS session-100 layer + the SKILL v3.87.0 §112 + the
  CLAUDE/README/AGENTS count lockstep (1015 + 553 = 1568) + the worklog
  entry.

## The round's traps (the execution appendix's process ledger)

**The stale served process (the §110 family, round two).** The :3200
server had been running since the PREVIOUS session's close (pid from
00:09, the r98-close build). Every `pkill -f "3200"` in this round
matched NOTHING — the port rides in the spawn ENV, not the command line —
so every "reboot" died EADDRINUSE while the stale server kept answering,
and the live-verify flow mysteriously failed (the tab clicks landing on a
degraded long-lived process). The cure: kill by the SERVER.JS PROCESS
(pkill -f "standalone/server.js"), verify `ps` shows zero survivors, then
boot — and re-verify the served build's freshness when anything behaves
oddly.

**The E2E fixture discrimination hole.** A mutation proof's E2E fixture
must carry the fix's payload EXCLUSIVELY through the new path — a
whole-word atom with a matchable keyword lets the spec pass with the fix
reverted (the r97 "literals alone clear the guard" lesson, now at the E2E
layer: the whole-word atoms alone matched the job keywords).

**The accessible-name leading space.** The snapshot line reads `- tab "
AI CV Upload"` — the icon + text label renders a LEADING SPACE in the
accessible name; an exact-match `/- tab "AI CV Upload"/` regex silently
never matches. The tolerant `\s*` form is required (and the flow must LOG
whether the ref matched — a silent no-match looks like a click failure).

**The scorer's first-24 keyword cap.** `scoreCv` caps the job's keyword
set at the FIRST 24 unique non-stopword tokens — for the System Admin
job, "onboarding"/"HRIS"/"training" sit PAST the cap (they appear late in
the description); the matched set (admin/specialist/platform) is what the
first-24 cap exposes. Not a defect — a documented scorer property the
fixture design must respect.

**The synthetic-click inertness.** A synthetic `element.click()` (the
eval path) does NOT switch the clone's CONTROLLED Radix tabs — the
controlled `onValueChange` needs the full pointer-event sequence; the
agent-browser snapshot-ref click (real CDP input events) is the reliable
path, and the keyboard path (focus + Enter) is the fallback.
