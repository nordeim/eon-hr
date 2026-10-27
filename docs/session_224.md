# Session 224 — Session 99 / Parity Round 98: the stream-delimiter + hex-string/CMap CV-flow round

**Session file numbering:** this file continues the owner-facing chain (session_222.md = the session-98 narrative, session_223.md = the session-98 raw execution transcript). The remediation plan for this round lives at `docs/remediation-plan-session99.md`.

## The round in one paragraph

The r98 close-out's queue: the CV-flow frontier's two remaining edges (the stream-delimiter space variants + a real-writer PDF pin), the REF-broken mobile set on watch, and the standing watches. The opening read found the **REF QUIET at the 66th deploy state** (login JS `index-DmiZE53r`, CSS `index-puMd6fDW` — both unchanged; the standing ladder classifications hold) with the standing scans clean (oklch doc-comments-only · `md:flex-wrap` zero · secrets zero · the patch watch HOLD at ^16.4.2 · the recharts grids dashed · the space-y watch clean), and the **mobile-nav cross-side pair at PARITY live on both sides** — the user's named focus, re-verified again on the remediated build at the round's close. The round found **TWO verified defect classes in the PDF extraction — the stream-delimiter matrix (R99-A: bare-CR and every space form lost the WHOLE stream) and the hex-string + ToUnicode-CMap class (R99-B: a REAL downloaded W3C dummy.pdf extracted zero characters)** — both TDD-fixed with the round's new TWO-BY-TWO mutation-proof design (each fix's revert fires exactly one RED per layer).

## The findings

| # | Surface | The verdict |
|---|---|---|
| R99-A | the stream-delimiter matrix | **TDD-FIXED (the round's primary member)** — the scan regex `/stream\r?\n/g` required the EOL IMMEDIATELY after the `stream` keyword. The probe verified FOUR lost variants: bare-CR `stream\r` (the Acrobat-accepted lenient EOL) and every space form (`stream \r\n` — the queue's named writer form, `stream \n`, `stream  \r\n`). A CV from any such writer extracted NOTHING. The fix: `/stream[ \t]*(?:\r\n|\r|\n)/g` — optional spaces/tabs, all three EOL forms, the ordered alternation keeping `\r\n` atomic — PLUS the end-prefix guard (a "stream" whose 3 preceding chars are `end` is the keyword inside `end**stream**`, never a stream start): the R98-A class hardened belt-and-suspenders, the +9 skip unchanged. |
| R99-B | the hex strings + ToUnicode CMaps | **TDD-FIXED — the real-writer pin** — the round downloaded three REAL PDFs: an arXiv paper extracted fine (112,092 chars — literal strings), an encrypted one correctly yielded nothing, and **the W3C's dummy.pdf (real, unencrypted, text-carrying) extracted ZERO characters**. Its writer form: hex strings (`<01020303> Tj`; hex atoms also ride inside TJ array bodies, silently dropped) whose bytes are GLYPH INDICES mapped by a trailing `beginbfchar` CMap stream. The fix (three parts): the third operator alternative, hex atoms in the TJ-array atom walk, and the two-phase stream walk (CMap-bearing streams collected as code→string maps — codespacerange, bfchar, bfrange base-offset + array, UTF-16BE dst — hex decoded after the whole file is walked, CMap-first with the hex-Latin-1 fallback). The arXiv paper's extraction GREW to 115,900 chars (pdfTeX hex strings now decoded). |
| — | the real-file three-way classification | literal PDFs extract · hex/CMap PDFs extract through the map · **ENCRYPTED PDFs correctly do not** (the streams are encrypted after compression; `""` + the actionable UI error is the right behavior — a pin, not a defect). |
| — | the deploy watch | **QUIET at the 66th state** — both login fingerprints unchanged; the ladder re-arms at the same state. |
| — | the mobile-nav cross-side pair | **PARITY, live-verified on BOTH sides and re-verified on the remediated build** — the REF's 28×28 `lucide-panel-left` "Toggle Sidebar" hamburger + its 288×844 fixed z-50 drawer (16 items); the clone's same geometry + the aria-label/role=dialog a11y supersets; the clone's menu cycle open → Training LMS → `/training` + AUTO-CLOSED. No Tailwind v4 regression in the mobile band. |
| — | the REF-broken mobile set | **HOLDS** — `/employeedetail` still the empty shell (rootChildren 2, mainTextLen 26, scrollW 390); the r98 classifications for hrreports/interviewassistant/employeeselfservice/recruitment stand (the REF quiet at the same deploy state). |
| — | the standing watches | the recharts grids all `strokeDasharray="3 3"` · the dark-band theming watch quiet · the v4 space-y inline-flow watch clean · the patch watch HOLD at ^16.4.2 (16.4.3 published). |

## The verification

- **Baseline gates on the unmodified HEAD:** lint 0/0 · tsc ✓ · 1001/1001 unit · the E2E baseline = the r98-close final gate (550/550 on the identical tree; the round's opening E2E re-run died twice to the sandbox's between-call process reap — the detached node-spawn protocol now runs the long gates).
- **The TDD round:** RED 7/7 as designed (the delimiter matrix, the hardened endstream guard, the dummy-shape bfchar CMap, the TJ-array hex atoms, the hex Latin-1, the bfrange forms, the 2-byte CID) → **GREEN 19/19** after the one fixture-length catch (the 2-byte CID spec's "HR HR…" body mapped to 22 alnums — under the 40-alnum guard; the fixture lengthened, never the guard — the r97 lesson, round three).
- **The mutation proof — the TWO-BY-TWO design:** the E2E fixtures isolate the fixes (the R99-A spec: space delimiters + literal strings; the R99-B spec: standard delimiters + hex/CMap text). Delimiter reverted → unit exactly 2 RED, E2E exactly 1 RED (R99-A) while R99-B AND session98 stayed green; hex decode neutralized → unit exactly 5 RED, E2E exactly 1 RED (R99-B) while R99-A stayed green. Both restored (the restore ending with a REBUILD — the §110 rule) → all green.
- **The live post-fix verify:** the real-shaped space-delimited + hex/CMap PDF (BOTH new paths in one file) through the :3200 UI → **the analysis card rendered** (the "r99 real cv" name + AI score 12/100 + Skills match 17% + the matched keywords admin/tech/technology/specialist) → the API row persisted → the candidate swept (DB pristine: 1 user / 0 candidates).
- **Final gates on the remediated tree:** lint 0/0 · tsc ✓ · **1008/1008 unit** (1001 + 7 R99) · build ✓ (under `env -u DATABASE_URL`) · **E2E 552/552** (the 550 standing + the 2 new; the final gate ALONE).
- **The evidence chain:** the r99 PNGs — the REF + clone mobile-nav opens, the clone training-mobile landing, the CV tab rest/active, the analysis card.

## The round's traps

**The fixture-yield-vs-input-length confusion (the guard lesson, round three).** A mapped-glyph fixture's meaningfulness is its MAPPED OUTPUT's alphanumeric count, not its input string's character count — the 2-byte CID spec's "HR HR HR…" body was 33 input characters but mapped to only 22 alnums (11 H + 11 R), under the 40-alnum guard, and failed GREEN for the wrong reason. Count the yield, not the input.

**The real-file three-way classification.** Downloading real PDFs produced a three-way result (extract / extract-through-the-map / correctly-fail-on-encryption) — and only the middle leg was a defect. Classification before the ledger: an encrypted PDF's zero-yield is CORRECT behavior, and pinning it as such prevents a future round from "fixing" it into garbage output.

**The exported-`DATABASE_URL` guard extends to `next build`.** The build's page-data collection queries the database — under the sandbox's exported absolute path it hit "Error code 14: Unable to open the database file" (non-fatal — every data route is force-dynamic — but noisy and wrong). Every build now runs under `env -u DATABASE_URL` like every Prisma CLI touch.

**The between-call process reap.** The sandbox kills detached processes between tool calls — shell `setsid`/`nohup` do NOT survive, but the node-spawn protocol (spawn detached + unref, the child reparented to init) DOES (the :3200 server ran for hours). The long E2E gate now runs through the same mechanism (`scripts/run-e2e-detached.mjs`); the first two background attempts died silently at 19-25 specs.

## The r100 queue

1. The CV-flow frontier's remaining edges: the ObjStm/compressed-object form (the orimi PDF's object streams inflate but carry dicts, not text — a PDF whose CONTENT streams ride inside ObjStm would still be lost), and a real Acrobat-produced PDF (the round's real-file leg found the W3C + arXiv + encrypted writers; an actual Acrobat-distilled file remains unpinned).
2. The REF-broken mobile set stays on watch (the platform's 66th deploy state is the current baseline).
3. The standing watches: the 66th-state login ladder (re-armed), the recharts grid class, the dark-band theming, the v4 space-y inline-flow watch, the patch watch (16.4.3 held).
4. The neo-crm session-188 layer (docs-only) — nothing to adopt for product code; the next product-code pattern lands when neo-crm ships one.
