# Session 222 — Session 98 / Parity Round 97: the multi-stream + octal-escape CV-flow round

**Session file numbering:** this file continues the owner-facing chain (session_220.md = the session-97 narrative, session_221.md = the session-97 raw execution transcript). The remediation plan for this round lives at `docs/remediation-plan-session98.md`.

## The round in one paragraph

The r97 close-out's queue: the CV-flow frontier's two named candidates (the octal-escape unescaping class + the multi-stream PDF pin), the REF-broken mobile set on watch, and the standing watches. The opening read found the **66TH LOGIN DEPLOY** (login JS `index-Cb4GrjTt` → `index-DmiZE53r`, CSS `index-ByKl99Mk` → `index-puMd6fDW` — BOTH moved) classified **NON-VISUAL** (the fresh login pair BYTE-IDENTICAL to the standing `69aa4241…` baseline; the census intact) and the **full standing ladder GREEN** (audits 5/5 · sweep 12/12 · verify-r45 13/13 · verify-r49 13/13). The round found **TWO verified defects in the PDF extraction — the multi-stream scan bug (R98-A, every stream after the first silently lost) and the octal-escape garbage (R98-B)** — both TDD-fixed (RED 2/2 → GREEN 12/12, mutation-proofed at both layers), plus one lint-gate hygiene fix (R98-C). The mobile-nav cross-side pair re-verified at PARITY live, and the REF-broken mobile set all hold.

## The findings

| # | Surface | The verdict |
|---|---|---|
| R98-A | the multi-stream PDF scan | **TDD-FIXED (the round's primary member)** — the stream scan's `streamRe.lastIndex = end` re-matched the "stream" INSIDE "endstream" (end**stream**`\r\n`), so every chunk after the first started at the PREVIOUS endstream (object-dict garbage + the next stream's compressed bytes) and failed to inflate → **every stream after the first was silently lost**. Empirically verified with a crafted two-stream PDF: page 1 extracted, page 2 absent. A multi-page CV (the norm, not the edge) yielded page 1 only. The r97 queue's assumption "the scanner handles it" was wrong — the §109 fixture-form blind spot one round deeper: the r95/r97 fixtures were all single-stream, so the bug survived two rounds of green gates. The fix: skip past the whole `endstream` token (`lastIndex = end + 9`). |
| R98-B | the octal escapes in PDF strings | **TDD-FIXED** — PDF strings carry non-ASCII as octal escapes under WinAnsiEncoding (`\227` = em-dash, `\351` = é, curly quotes `\223/\224` — how Word/Acrobat write the characters CVs are full of). The old unescape handled only `\(`, `\)`, `\\`, `\n`, leaving literal `\227` garbage in the extracted text. The fix: a single-pass alternation unescape (octal `\ddd` mod-256 + the WinAnsi 0x80–0x9F delta map + Latin-1 0xA0–0xFF + `\n\r\t\b\f` → space + the line continuation), with the `\\053`-vs-`\053` disambiguation pinned by a born-green guard spec (a sequential replace cannot tell them apart — the alternation consumes the escaped-backslash match first). |
| R98-C | the lint gate vs generated Playwright artifacts | **FIXED (config hygiene)** — a failed E2E run leaves trace bundles in `test-results/` (gitignored but NOT eslint-ignored): the dead first E2E boot (the chromium-1248 reinstall trap re-fired) put 1,948 problems into the lint gate. `test-results/**` + `playwright-report/**` join the eslint ignores (generated artifacts, not source — the web-application skill §3 "ignore non-app dirs" contract). |
| — | the 66th login deploy | **NON-VISUAL** — both login fingerprints moved (JS `index-DmiZE53r`, CSS `index-puMd6fDW`) but the fresh login pair renders BYTE-IDENTICAL to the standing `69aa4241…` baseline (the 6 buttons, the 2 inputs, "Welcome to Eon HR", no Turnstile). The ladder re-arms at the 66th state. |
| — | the standing ladder | **ALL GREEN** — standing audits 5/5 (the first run's `found:false` pairs were the unauthed sessions — the documented prerequisite order: `auth-sessions.mjs` BEFORE the probes) · route sweep 12/12 · verify-r45 13/13 · verify-r49 13/13. |
| — | the REF-broken mobile set | **HOLDS** — hrreports + interviewassistant still the empty `#root`; employeeselfservice still "Loading your profile…"; employeedetail still the empty shell (rootChildren=2, main 26 chars); /recruitment renders at 390 (scrollW 550, the r96 retirement). |
| — | the mobile-nav cross-side pair | **PARITY, live-verified with the §109 fixed-aware read** — the REF's hamburger (28×28, `lucide-panel-left`, accessible name "Toggle Sidebar" via the sr-only span) + its drawer (fixed, z-50, **w=288 h=844**, 16 items) byte-match the clone's contract (the clone's `aria-label` trigger + `role=dialog` drawer remain the standing a11y supersets). The clone's mobile-menu cycle on the remediated build: open → Training LMS → `/training` + AUTO-CLOSED. |
| — | the REF's Add Applicant creation | not re-probed this round (the r96/r97 empty-listbox classification stands; the clone's working pipeline remains the superset). |
| — | the standing scans | oklch clean (doc comments only) · `md:flex-wrap` zero · secrets zero · the patch watch: next 16.4.3 published, the HOLD at ^16.4.2 stands (neo-crm now at session-188 — a ZERO-product-code-touch round, docs-layer cure only; its D-187a3 v4 space-y inline-flow lesson was already consumed by eon-hr session 96). |

## The verification

- **Baseline gates on the unmodified HEAD:** lint 0/0 · tsc ✓ · 998/998 unit · build ✓ 116/116 · **E2E 549/549 (12.4m, zero flakes)** — the chromium-1248 reinstall trap re-fired (the first E2E boot died 150×1ms until `bunx playwright install chromium`).
- **The TDD round:** RED 2/2 as designed (the R98-A page-2 loss + the R98-B literal `\227`/`\351` garbage) · the `\\053` disambiguation guard born-green · **GREEN 12/12** after the one GREEN-phase catch (the Latin-1 0xA0–0xFF letters initially mapped to space under the ASCII-only printable check — é needed the extended range).
- **The mutation proof at BOTH layers:** R98-A reverted → rebuild → the new `session98-multistream-cvflow` spec **exactly 1 RED** while the session97 real-file specs stayed green; R98-B reverted (unit) → **exactly 1 RED** while R98-A + the guard stayed green. Both restored → all green.
- **The live post-fix verify:** the real two-stream + octal-carrying PDF through the :3200 UI (tab → job select → upload) → **the analysis card rendered** (the "r98 real cv" name + AI score 7/100 + Skills match 8% + the matched keywords admin/specialist — page 2's vocabulary drove the nonzero score) → the candidate swept (DB pristine: users 1, jobs 3, candidates 0 after the r45-probe user sweep).
- **Final gates on the remediated tree:** lint 0/0 · tsc ✓ · **1001/1001 unit** (998 + 3 R98) · build ✓ 116/116 · **E2E 550/550** (the 549 standing + the 1 new; the final gate ALONE).
- **The evidence chain:** 7 r98 PNGs — the login pair probe, the REF mobile-nav open (fixed-aware), the clone mobile-nav open, the clone training-mobile (the menu cycle's landing), the CV tab rest / active / the analysis card.

## The round's traps

**The served-build staleness trap (the round's process lesson).** After the mutation proof restored the source, the :3200 standalone kept serving the MUTATION BUILD — the live upload "failed" ("Couldn't read the CV text") and an hour of debugging chased the browser before `grep` on the served chunk found `f.lastIndex=g` (the reverted form). The protocol: **the mutation proof's restore step MUST end with a rebuild before any live :3200 verification** — the standalone is a build artifact, not the source tree.

**The self-fulfilling diagnostic.** The first live diagnosis "confirmed the fix works" by reimplementing the FIXED scan inside the diagnostic eval — diagnosing the diagnostic, not the served code. The authoritative check is reading the SERVED bundle (`grep` the minified pattern) or exercising the app itself.

**The page-1-under-guard coincidence.** The live failure's second cause: the fixture's page-1 text is 39 alphanumerics — under the 40-alnum meaningfulness guard — so a page-2-losing extraction returns `""` (not partial text). By accident this made the live fixture STRICTER than the E2E one (page 1 alone can never pass) — the r97 "fixture-length guard gotcha" lesson, now a deliberate design property of the live probe.

**The `//`-comment-inside-an-eval trap re-fired** (the session-96 documented form): one-lined evals die with `SyntaxError: Unexpected end of input` when they carry `//` comments — the comment eats the joined tail. No comments in one-lined evals.

**The auth-before-probes order.** The standing audits' first run read `found:false` on BOTH sides — the `ref`/`loc` sessions were unauthed (the probe scripts assume `auth-sessions.mjs` ran first). The transcript order in session_221 hides this because that round authed earlier in its flow.

## The r99 queue

1. The REF-broken mobile set stays on watch (the platform actively patches its mobile band — the 66th deploy is the current state).
2. The standing watches: the 66th-state login ladder (re-armed), the recharts grid class, the dark-band theming, the v4 space-y inline-flow watch, the patch watch (16.4.3 held).
3. The CV-flow frontier's remaining edges: the `\r\n`-only stream delimiter variants (some writers emit `stream \r\n` with a space), and a real Acrobat-produced PDF (the fixtures remain writer-crafted).
4. The neo-crm session-188 layer (docs-only) — nothing to adopt for product code; the next product-code pattern lands when neo-crm ships one.
