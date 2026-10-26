# Remediation Plan — Session 98 / Parity Round 97: the multi-stream + octal-escape CV-flow round

**The frontier.** The r97 close-out's queue: (1) the CV-flow frontier's
next candidates — the octal-escape unescaping in PDF strings (the `\053`
class) and a multi-stream real PDF pin ("the scanner handles it but it's
never been pinned"), (2) the REF-broken mobile set stays on watch (any
route that starts rendering becomes a parity target), (3) the standing
watches (the 65th-or-newer login ladder re-armed, the recharts grid
class, the dark-band theming, the v4 space-y inline-flow watch, the
patch watch at next ^16.4.2 with 16.4.3 published).

## The opening read (the standing ladder)

| Ladder step | Result |
|---|---|
| Baseline gates on the unmodified HEAD | lint 0/0 · tsc ✓ · 998/998 unit · build ✓ 116/116 (the chromium-1248 reinstall trap re-fired — the first E2E boot died 150×1ms until `bunx playwright install chromium`) · E2E 549/549 (10.4m, zero flakes) |
| The exported-`DATABASE_URL` guard | ACTIVE all round (the sandbox exports an absolute path into the repo's parent; every Prisma CLI touch ran under `env -u DATABASE_URL`) — the repo's `db/custom.db` seeded 1 user / 3 jobs / 0 candidates |
| The standing scans | oklch clean (doc comments only) · `md:flex-wrap` zero · secrets zero · the patch watch: next 16.4.3 published, the HOLD at ^16.4.2 stands (neo-crm now at session-188 — a ZERO-product-code-touch round, docs-layer cure only; its D-187a3 v4 space-y inline-flow lesson was already consumed by eon-hr session 96) |

## THE ROUND'S FINDINGS (both empirically verified before the fix)

**R98-A — the multi-stream PDF loses every stream after the first
(VERIFIED, HIGH within the superset flow).** `src/lib/cv-text.ts`'s
stream scan sets `streamRe.lastIndex = end` where `end` is the position
of `endstream` — but `/stream\r?\n/g` then re-matches the "stream"
INSIDE "end"**`stream`**`\r\n`, so every chunk after the first starts
right after the PREVIOUS endstream (object-dict garbage + the next
stream's compressed bytes) and fails to inflate → every stream after the
first is silently lost. Empirically verified with a crafted two-stream
(two-page) PDF: page 1 extracted, page 2 absent. Impact: a multi-page CV
(a 2-page résumé is the NORM, not the edge) loses every page after the
first — the AI CV Upload tab's core promise fails on the most common
real CV shape. The r97 queue's assumption ("the scanner handles it")
was wrong — the §109 fixture-form blind-spot lesson one round deeper:
the r95/r97 fixtures were all single-stream, so the bug survived two
rounds of green gates.

**The fix:** skip past the WHOLE `endstream` token —
`streamRe.lastIndex = end + "endstream".length` — so the inner
"stream" can never re-match. One line; the chunk boundaries are
otherwise unchanged.

**R98-B — the octal escapes stay literal garbage (VERIFIED, MEDIUM).**
PDF strings carry non-ASCII as octal escapes under WinAnsiEncoding —
`\227` = em-dash, `\351` = é, curly quotes `\223/\224` — exactly how
Word's Save-as-PDF and Acrobat write the characters CVs are full of
("Manager — 10 years", "Bachelor's degree", "résumé"). The old
`unescape` handled only `\(`, `\)`, `\\`, and `\n`, so the extracted
text carried literal `\227` garbage. Empirically verified: a
TJ-array string with `\227`/`\351` extracted with both escapes verbatim.

**The fix:** a single-pass alternation unescape — octal `\ddd` (1-3
digits, mod 256 per spec), the standard `\n \r \t \b \f` (→ space, the
existing `\n` contract kept), the existing literal pair `\(` `\)` `\\`,
and the line-continuation `\<EOL>`. The 0x80–0x9F octal range decodes
through the WinAnsi (cp1252) delta map — the curly-quote/em-dash block
where WinAnsi diverges from Latin-1; 0xA0–0xFF decode as Latin-1 (é ñ ü,
where WinAnsi == Latin-1); control characters become spaces. The
single-pass form is REQUIRED: a sequential replace cannot tell `\\053`
(escaped backslash + literal digits) from `\053` (octal escape) — the
alternation consumes the whole escaped-backslash match before the octal
branch can misread its tail (pinned by a born-green guard spec).

**R98-C — the lint gate breaks on generated Playwright artifacts
(VERIFIED, config hygiene).** A failed E2E run leaves trace bundles in
`test-results/` (gitignored but NOT eslint-ignored) — the dead first
E2E boot (the chromium trap) left 1,947 warnings + 1 error in the lint
gate. The fix: `test-results/**` + `playwright-report/**` join the
eslint ignores (generated artifacts, not source — the web-application
skill §3 "ignore non-app dirs" contract; NOT a guardrail weakening).

## The test plan (TDD)

1. **RED** — `tests/unit/cv-text.test.ts` gains: (a) the two-stream PDF
   spec (page 1 + page 2 fragments + reading order across streams);
   (b) the octal-escape spec (`\227` → em-dash via WinAnsi, `\351` → é,
   no literal escape garbage remains); (c) the born-green `\\053`
   disambiguation guard. RED 2/2 as designed (the guard passes against
   the old code by construction — it pins against a sequential-replace
   regression).
2. **GREEN** — the two `cv-text.ts` fixes above. GREEN 12/12 (the
   GREEN-phase catch: the 0xA0–0xFF Latin-1 letters initially mapped to
   space under the ASCII-only printable check — é needed the extended
   range).
3. **RED→GREEN (E2E, born-green + mutation-proofed)** — the new
   `tests/e2e/session98-multistream-cvflow.spec.ts` drives a two-stream
   PDF (page 2 alone carries the job's keyword vocabulary, so a nonzero
   score PROVES page 2 reached the scorer) with octal escapes in page
   1's strings, through the actual UI upload → the analysis card → the
   persisted API row → the cleanup.
4. **Gates** — lint 0/0 (with R98-C) · tsc ✓ · unit 998+3 · build
   116/116 · E2E 549+1 (the ALONE protocol — the final gate runs with
   no browser sessions live) · DB pristine at close.

## The round's verification legs (the standing protocol)

- The REF live walk: the deploy watch (the 65th-or-newer state), the
  fresh login pair, the standing audits, the route sweep, verify-r45 +
  verify-r49, the mobile-render sweep of the broken set, the mobile-nav
  cross-side pair (the standing emphasis), the Add Applicant
  classification.
- The live post-fix verify on :3200 — the real multi-stream PDF through
  the actual UI → the analysis card (screenshot evidence) → the
  candidate swept (DB pristine).
- The evidence chain: r98 PNGs under `docs/screenshots/`.
- The mutation proof at BOTH layers: restore the pre-R98 code → exactly
  the R98 REDs fire (unit: 2; E2E: the session98 spec) while the r95/r97
  pins stay green — the pin has teeth; restore → all green.

## Execution appendix (filled at close)

- **RED 2/2 as designed** (R98-A: page-2 text absent from the two-stream
  extraction; R98-B: the literal `\227`/`\351` garbage) · the `\\053`
  disambiguation guard born-green against the old code (it pins against
  a sequential-replace regression).
- **GREEN 12/12** after the one GREEN-phase catch: the Latin-1 letters
  (0xA0–0xFF — é ñ ü) initially mapped to space under the ASCII-only
  printable check; the extended range restored.
- **The mutation proof at BOTH layers:** R98-A reverted → rebuild →
  the session98 E2E spec **exactly 1 RED** while the session97 real-file
  specs stayed green; R98-B reverted (unit) → **exactly 1 RED** while
  R98-A + the guard stayed green; both restored → all green.
- **The E2E leg born-green:** the new
  `tests/e2e/session98-multistream-cvflow.spec.ts` — a two-stream PDF
  whose SECOND page alone carries the job's keyword vocabulary (so a
  nonzero score PROVES page 2 reached the scorer) — 2/2 (setup + spec).
- **The live post-fix verify:** the real two-stream + octal PDF through
  the :3200 UI → the analysis card rendered (the "r98 real cv" name +
  AI score 7/100 + Skills match 8% + the matched keywords admin/
  specialist) → the candidate swept + the r45-probe user swept (DB
  pristine: users 1 / jobs 3 / candidates 0).
- **THE ROUND'S PROCESS CATCH — the stale served build:** the first
  live verify "failed" because :3200 was still serving the MUTATION
  BUILD (the source was restored but the standalone was not rebuilt);
  the served chunk's `grep` (`lastIndex=g` vs `lastIndex=g+9`) is the
  authoritative check. The protocol: a mutation proof's restore step
  MUST end with a REBUILD before any live-server verification. The
  coincidence that made it worse-to-better: the live fixture's page-1
  text is 39 alnums — under the 40-alnum guard — so the page-2-losing
  build returns `""` (not partial text): the live probe is now
  STRICTER than the E2E fixture by design.
- **Final gates on the remediated tree:** lint 0/0 (with R98-C) ·
  tsc ✓ · **1001/1001 unit** (998 + 3 R98) · build ✓ 116/116 ·
  **E2E 550/550** (the 549 standing + the 1 new; the final gate ALONE).
- **The evidence chain:** 7 r98 PNGs (the login-pair probe, the REF
  mobile-nav open, the clone mobile-nav open, the clone training-mobile
  landing, the CV tab rest/active, the analysis card).
- **The docs layer:** this plan + the narrative (`docs/session_222.md`)
  + the AGENTS session-98 layer + the SKILL v3.85.0 §110 + the
  CLAUDE/README/AGENTS count lockstep (1001 + 550 = 1551) + the
  README's stale duplicate count lines cleaned (512/941/476/494 — a
  pre-existing count-lockstep violation) + the worklog entry.
