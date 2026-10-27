# Remediation Plan — Session 99 / Parity Round 98: the stream-delimiter + hex-string/CMap CV-flow round

**The frontier.** The r98 close-out's queue: (1) the CV-flow frontier's
remaining edges — the stream-delimiter space variants ("some writers emit
`stream \r\n` with a space") and a real-writer PDF pin (the fixtures remain
writer-crafted), (2) the REF-broken mobile set stays on watch, (3) the
standing watches (the 66th-state login ladder re-armed, the recharts grid
class, the dark-band theming, the v4 space-y inline-flow watch, the patch
watch at ^16.4.2 with 16.4.3 published).

## The opening read (the standing ladder)

| Ladder step | Result |
|---|---|
| Workspace | `git pull` fast-forward `7e45143 → b780125` (docs only: the session_223 raw transcript) — the session-98 close state intact |
| Baseline gates | lint 0/0 · tsc ✓ · 1001/1001 unit · E2E baseline on the unmodified HEAD running (the r98-close final gate already proved 550/550 on this exact tree) |
| The exported-`DATABASE_URL` guard | ACTIVE all round (the sandbox exports `file:/home/z/my-project/db/custom.db` — every Prisma CLI touch runs under `env -u DATABASE_URL`; the repo's `db/custom.db` seeded 1 user / 1 employee / 0 candidates) |
| The deploy watch | **REF QUIET at the 66th state** — login JS `index-DmiZE53r`, CSS `index-puMd6fDW`, both unchanged (the r99-deploy-watch probe); the standing ladder classifications hold, no re-classification pass needed |
| The standing scans | oklch clean (doc comments only) · `md:flex-wrap` zero · secrets zero · the patch watch HOLD at ^16.4.2 (16.4.3 published) · the recharts grid watch: every CartesianGrid site pins `strokeDasharray="3 3"` (the dashed contract) · the space-y inline-flow watch: the dashboard's explicit-`mt-8` pattern intact, no live `mt/mb`-inside-`space-y` instances |
| The mobile-nav cross-side pair (the standing emphasis) | **PARITY, live-verified both sides** — REF: hamburger 28×28 `lucide-panel-left` "Toggle Sidebar" + drawer 288×844 fixed z-50 with the 16-item nav; clone: the same geometry + the `aria-label`/`role=dialog` a11y supersets; the clone menu cycle open → Training LMS → `/training` + AUTO-CLOSED. No Tailwind v4 regression in the mobile band. |
| The REF-broken mobile set | HOLDS — `/employeedetail` still the empty shell (rootChildren 2, mainTextLen 26, scrollW 390); the r98 classifications for hrreports/interviewassistant/employeeselfservice/recruitment stand (REF quiet at the same deploy state) |

## THE ROUND'S FINDINGS (both empirically verified before the fix)

**R99-A — the stream-delimiter variants are silently lost (VERIFIED, HIGH
within the superset flow).** `src/lib/cv-text.ts`'s stream scan matches
`/stream\r?\n/g` — the EOL must follow the keyword IMMEDIATELY. Real-world
writers emit more forms, and every one of them loses the WHOLE stream today
(verified with crafted two-byte-exact fixtures):

| Delimiter form | Status |
|---|---|
| `stream\r\n` (standard) | extracted |
| `stream\n` (LF-only — Unix writers) | extracted |
| `stream\r` (bare CR — the Acrobat-accepted lenient form) | **LOST** |
| `stream \r\n` (SPACE + CRLF — the queue's named form) | **LOST** |
| `stream \n` (SPACE + LF) | **LOST** |
| `stream  \r\n` (multiple spaces) | **LOST** |

A CV PDF written by any of these writers extracts NOTHING (the stream never
matches → no chunk → `""` → "Couldn't read the CV text" on a file the user
can read fine in any viewer). The fix: the delimiter regex becomes
`/stream[ \t]*(?:\r\n|\r|\n)/g` — optional spaces/tabs between the keyword
and the EOL, all three EOL forms — PLUS a belt-and-suspenders guard: a match
whose 3 preceding chars are `end` is the "stream" inside `end**stream**`,
never a stream start (skip it). The guard protects the R98-A class even if a
future edit moves the scan position (the +9 skip stays).

**R99-B — hex strings + subset-font CMaps are unreadable (VERIFIED, HIGH
within the superset flow — the real-writer pin).** The queue asked for "a
real Acrobat-produced PDF" — the round downloaded three REAL PDFs and ran
them through the pipeline:

| Real PDF | Writer | Result before the fix |
|---|---|---|
| W3C `dummy.pdf` (unencrypted, text-carrying) | subset-font producer | **0 chars** — the failure pin |
| arXiv paper `2404.16710` (1.5 MB, 506 streams) | pdfTeX-1.40.25 | 112,092 chars (literal strings work) |
| orimi `pdf-test.pdf` | encrypted (`/Encrypt`) | 0 chars — CORRECT best-effort behavior |

The W3C dummy.pdf failure decomposes into TWO unhandled real-writer forms:

1. **Hex strings.** The content stream writes text as `<01020303> Tj` and
   `[<01> -120 <0203>] TJ` — the PDF-spec alternative to literal `(…)`
   strings. The extractor's operator regex matches ONLY literal strings, so
   every hex atom is silently dropped (they ride INSIDE the TJ-array body
   today — the array regex admits `<`/`>` as plain chars, but the
   atom-extraction walk only collects `(…)`) and a `<…> Tj` never matches at
   all. Result: the whole file yields `""`.
2. **Subset-font ToUnicode CMaps.** The hex bytes in such files are GLYPH
   INDICES (01, 02, 03…), not character codes — the mapping to real text
   (`<01>→D, <02>→u, <03>→m…` spelling "Dummy PDF file") lives in a separate
   FlateDecode stream carrying a `beginbfchar`/`beginbfrange` CMap. Without
   parsing it, even extracted hex bytes are meaningless.

**The fix (both parts):**

- The operator regex gains a third alternative — `<hex> Tj|TJ|'|"` — and the
  TJ-array atom walk extracts `<hex>` atoms alongside `(…)` atoms, in
  reading order.
- A ToUnicode CMap parser: during the stream walk, an inflated stream
  containing `beginbfchar`/`beginbfrange` is COLLECTED as a CMap (parsed:
  the codespacerange decides 1-byte vs 2-byte codes; bfchar pairs; bfrange
  base-offset and array forms; dst is UTF-16BE) instead of being mined for
  text operators. After the walk, hex atoms decode through the FIRST CMap
  that covers ALL their codes (CMap-first — a ToUnicode map is authoritative
  when it covers the codes); with no covering CMap they fall back to the
  hex-encoded Latin-1/WinAnsi decode (the Word-style `<44756D6D79> Tj`
  form — printable bytes kept, the WinAnsi 0x80–0x9F delta map, controls →
  space). Literal atoms keep the existing unescape untouched (R98-B
  semantics — no regression surface).
- The stream walk becomes two-phase: collect atoms per stream, decode after
  all streams are walked (a file's CMap stream can FOLLOW its content
  streams — the W3C dummy.pdf has the CMap LAST).

**R99-C — the round's hygiene member (the fixture-coverage gap, §109 one
round deeper).** Every existing PDF fixture uses the `stream\r\n` delimiter
and literal strings only — the exact forms the code already handled. The
blind-spot class that survived r97/r98 (single-stream fixtures hid R98-A;
literal-only fixtures hid R99-B) gets its cure: this round's fixtures pin
the delimiter matrix AND the hex/CMap shapes AND the real-writer ground
truth (the W3C dummy.pdf SHAPE, crafted in-repo).

## The test plan (TDD)

1. **RED (unit, `tests/unit/cv-text.test.ts`)** — (a) the delimiter matrix:
   one spec pinning all five EOL/space forms (bare-CR, space+CRLF, space+LF,
   plus the standard two as regression members); (b) the hex-string spec: a
   dummy.pdf-shaped fixture (hex `Tj` atoms + a trailing bfchar CMap stream)
   extracting "Dummy PDF file"-vocabulary through the CMap; (c) the hex-array
   TJ spec: `[<hex> -120 <hex>] TJ` atoms in reading order; (d) the
   hex-Latin-1 spec (no CMap — the Word-style form); (e) the bfrange spec
   (base-offset + array forms); (f) the 2-byte codespace spec (Identity-H
   shape). Expect RED on (a)–(f) minus the standard-form members.
2. **GREEN** — the `cv-text.ts` fixes above. The existing 12 specs must stay
   green (the literal path, the octal path, the multi-stream path, the
   `\\053` guard — the regression net).
3. **RED→GREEN (E2E, born-green + mutation-proofed)** — the new
   `tests/e2e/session99-delimiter-hexcmap-cvflow.spec.ts`: a crafted PDF
   whose SECOND page alone carries the job's keyword vocabulary, written
   with the space+CRLF delimiter AND hex strings mapped through a bfchar
   CMap — both new paths must work for the analysis card to render with a
   nonzero score. Mutation proof at both layers: revert the delimiter fix →
   the new spec REDs (the standing specs stay green); revert the hex/CMap
   fix → the new spec REDs at the unit layer.
4. **Gates** — lint 0/0 · tsc ✓ · unit 1001+6 · build 116/116 · E2E 550+2
   (the final gate ALONE) · DB pristine at close.

## The round's verification legs (the standing protocol)

- The live post-fix verify on :3200 — a real-shaped space-delimited +
  hex/CMap PDF through the actual UI (tab → job select → upload) → the
  analysis card (screenshot evidence) → the candidate swept (DB pristine).
- The mobile-nav pair re-verified on the remediated build (the standing
  emphasis — the user's named focus): the menu cycle + the drawer contract.
- The evidence chain: r99 PNGs under `docs/screenshots/` (the REF + clone
  mobile-nav opens already captured at r99-*, the CV-flow evidence to come).
- The docs layer: this plan + the narrative (`docs/session_224.md`) + the
  AGENTS session-99 layer + the SKILL §111 lesson + the CLAUDE/README/AGENTS
  count lockstep (1001+6 unit + 550+2 E2E) + the worklog entry.

## Execution appendix (filled at close)

- **RED 7/7 as designed** — the delimiter matrix (the three lost variants
  firing while the two standard forms stayed green), the hardened
  endstream-guard spec (space-delimited streams + `endstream \r\n` tails —
  a form where a naive space-tolerant regex could re-open the R98-A
  wound), the dummy-shape bfchar CMap, the TJ-array hex atoms (the
  literals alone clearing the 40-alnum guard so the RED pins the hex
  atoms specifically), the hex Latin-1, the bfrange base-offset + array
  forms, and the 2-byte Identity-H CID.
- **GREEN 19/19** after the one fixture-length catch: the 2-byte CID
  spec's "HR HR HR…" body mapped to 22 alnums — under the 40-alnum guard
  (the mapped YIELD is what counts, not the input length — the r97
  lesson, round three); the fixture lengthened to 21 code triples, never
  the guard.
- **The mutation proof — the TWO-BY-TWO design:** delimiter reverted →
  unit exactly 2 RED (the matrix + the guard spec), E2E exactly 1 RED
  (the R99-A spec) while the R99-B spec AND the session98 spec stayed
  green; hex decode neutralized → unit exactly 5 RED, E2E exactly 1 RED
  (the R99-B spec) while the R99-A spec stayed green. Both restored —
  each restore ending with a REBUILD (the §110 rule) — → all green.
- **The E2E leg born-green:** the new
  `tests/e2e/session99-delimiter-hexcmap-cvflow.spec.ts` — the R99-A
  spec drives a both-streams space-delimited PDF whose second page alone
  carries the job's keywords; the R99-B spec drives a hex/CMap PDF whose
  mapped vocabulary carries them — 2/2 + the setup.
- **The real-file ground truth:** the W3C dummy.pdf's raw extraction came
  back ("Dumm y   PDF  fi le" — 13 alnums, correctly under the
  too-short-CV guard; the mechanism pinned by the CV-length unit
  fixture) · the arXiv paper's extraction GREW 112,092 → 115,900 chars
  (pdfTeX hex strings now decoded) · the encrypted orimi PDF correctly
  still yields nothing.
- **The live post-fix verify:** the real-shaped space-delimited +
  hex/CMap PDF (BOTH new paths in one file) through the :3200 UI → the
  analysis card rendered (the "r99 real cv" name + AI score 12/100 +
  Skills match 17% + the matched keywords admin/tech/technology/
  specialist) → the candidate swept (DB pristine: 1 user / 0
  candidates). The mobile-nav pair re-verified on the remediated build
  (the same PARITY contract, the menu cycle green).
- **Final gates on the remediated tree:** lint 0/0 · tsc ✓ · **1008/1008
  unit** (1001 + 7 R99) · build ✓ (under `env -u DATABASE_URL` — the
  guard's build leg) · **E2E 552/552** (the 550 standing + the 2 new;
  the final gate ALONE, run through the detached node-spawn protocol
  after two between-call process reaps killed the naive background
  attempts).
- **The evidence chain:** the r99 PNGs (the REF + clone mobile-nav opens,
  the clone training-mobile landing, the CV tab rest/active, the
  analysis card).
- **The docs layer:** this plan + the narrative (`docs/session_224.md`) +
  the AGENTS session-99 layer + the SKILL v3.86.0 §111 (the
  real-files-not-just-fixtures lesson, the two-by-two mutation design,
  the guard lesson round three, the encrypted-PDF classification pin) +
  the CLAUDE/README/AGENTS count lockstep (1008 + 552 = 1560) + the
  worklog entry.
