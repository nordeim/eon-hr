I'll continue the task from where we left off. Let me set up the workspace and begin the multi-stage process.
Workspace has been reset. Cloning both repos:
Repo cloned successfully — it's on `main` at commit `1fac7f0` (session 112 completed). Let me check the docs structure:
Both session docs exist. Let me read the core documents — starting with the smaller ones in full:
session_258.md is the previous round's working narrative. Let me check the recent commit structure and read the remediation plan:
Now I understand the structure — the last complete round is session 112 (parity round 111). My round is **session 113 / parity round 112**. Let me read the remediation plan and worklog tail:
Let me read the worklog tail with the latest round entry and the r113 queue:
现在我来阅读 AGENTS.md 中的核心协议部分：
Let me read the SKILL.md head and the writer-family registry:
I have a deep picture now. My round is **Session 113 / Parity Round 112**. Let me validate the codebase state — package.json, configs, .env.example, and the cv-text.ts core:
Test configs are in place. Now let me set up the environment — install deps, configure `.env`, and clone neo-crm for reference in parallel:
The documented DATABASE_URL trap is live again (exported var pointing outside the repo). Let me verify the db landed correctly:
Database at `<repo>/db/custom.db` seeded. Running baseline gates (lint → typecheck → unit):
Baseline gates confirmed: **lint 0/0 · tsc ✓ · 1087/1087 unit**. Now let me check the corpus location and the r112 protocol scripts to adapt for r113:
The /tmp corpus was wiped (fresh sandbox) — I need to re-source it. Let me find the download URLs from the earlier round scripts:
Let me find the corpus sources from the docs and worklog:
The corpus needs re-sourcing from canonical locations. Let me download and verify against the recorded md5 pins:
ReportLab and Prawn are md5-exact. fontspec 404'd — let me find the right CTAN path, plus the LO Calc guide and Quartz file:
fontspec found. Now let me locate the LO Calc guide and Quartz specimen:
LO Calc re-served a regenerated build (documented behavior). Now let me find the Quartz specimen from the xmlcalabash test suite:
找到了 — Codeberg 路径。正在下载 Quartz 样本：
QUARTZ md5-exact. Now let me recompile the Typst specimens — checking the r111 scripts:
The previous round used archive.org for the LO Calc 7.0 guide. Let me find it:
LO Calc md5-exact. Now let me run the corpus verify on the 8 downloaded members, then recompile Typst + Skia specimens:
**ALL 8 STANDING PINS HOLD.** Now the Typst specimens — downloading the official typst binary:
Coverletters drifted by +1/+2 alnums. Let me diagnose — comparing against pdftotext and checking dates:
The drift is the compile-date embedded in the coverletters ("October 31" → "November 01" = +1/+2 alnums). Let me pin the date in the template for deterministic compiles:
All 4 Typst pins hold — corpus is now compile-date deterministic. Now the Skia specimens:
The documented r110/r112 browser-version trap. Let me check the locked playwright version vs cache:
Variant pins are cyclically shifted — the variants likely use randomized content. Let me check the generation script:
My mapping was wrong — the r112 doc listed pins in descending order, not variant order. Computing manually: control=423, floatlast=438, absolute=433. Let me run the r112 member-checks which have the correct mapping and order probes:
**The complete 18-member corpus (17 writer families) is re-sourced and verified at HEAD** — all pins hold, order probes match. Updating progress and moving to the opening read (the 77th-deploy watch):
**THE 77th DEPLOY DETECTED** — login JS `CXmO9oF_`→`CcEolDtM` (CSS quiet), render **BYTE-IDENTICAL** to the standing baseline → NON-VISUAL. Now the app-side census:
App side QUIET — the 77th deploy is login-side-only churn. Now let me kick off the production build in the background and run the audit phase meanwhile:
R112-A structurally verified — all seven guards present, corpus pins hold. Now the neo-crm layer check and advisory state:
neo-crm is at session 205 — three unconsumed layers (s203/s204/s205). Let me survey them:
The neo-crm s203-205 layers are surveyed — the s205 env-face totality census is a transfer candidate. Now let me plan the hunt — probing the 18th-writer candidates (pdfkit, jsPDF — the standard "Download CV" web-app paths):
Both read 100% — no defects. Let me try WeasyPrint (Python, the European CV/document path):
**REAL DEFECT FOUND** — WeasyPrint reads alnums EXACT (692/692) but the body text is **LETTER-SPACED SOUP**: "J o h n   S m i t h" instead of "John Smith" — invisible to alnum pins (the r112 count-pin blind spot class again). Let me diagnose the stream structure:
The anatomy is clear: **WeasyPrint writes every glyph as its own hex atom with inter-atom kern numbers (mostly 0)** — `[<0030>0<0044>0<0055>…] TJ`. Let me examine how our extractor handles TJ-array atoms:
**ROOT CAUSE FOUND** — WeasyPrint writes an explicit `0` kern between every glyph pair (`<0030>0<0044>0…`), and the code's `if (kern !== 0)` conflates "explicit zero kern" with "no number at all" — the latter keeps the standing space join. Let me read the `push` helper to design the fix:
The h2 "SUMMARY" reads joined (its `letter-spacing: 1pt` produces positive kerns → join) while the body's explicit `0` kerns fall through `kern !== 0` → space join. **THE FIX**: distinguish "explicit number token" (even net-zero) from "no number". Let me confirm the h2 encoding and check the float/hoist behavior:
Anatomy pinned: body kerns are exactly `0` → fall through `kern !== 0` → space join (the soup); the h2's positive kerns (+584) join fine. Let me write the prototype — the `sawNum` distinction:
**The soup is CURED** — alnums 100.00%, and the entire corpus is byte-identical through the prototype. Now the order check on the float region:
Order probes all MATCH, but there's a local divergence: pdftotext reads the floated dates BEFORE the role line; our stream order reads them after. Let me examine the geometry:
The floats ARE painted at the stream head (blocks 0/1 = the two date spans). Let me check the cm transforms and how the tracker saw them:
Let me empirically instrument the tracker to see the px/py values the guards see on the WeasyPrint file:
Bun's latin1 roundtrip isn't byte-identical — the binary walk works. Let me fix the diagnostic:
The tracker confirms: the floats sit at py 577/518 (mid-page), the flow starts at py 761 (top) — **the exact Skia hoist class, and all seven guards pass** — the R112-A repair already fires on WeasyPrint, placing dates near their entries. The primary defect is the kern-0 soup. Let me pin the pattern's generality with variants:
The census regex required whitespace — the actual form is `<0030>0<0044>` with none. Fixing:
**The pattern is pinned across all six specimens** — HEAD reads soup, prototype cures all, alnums exact. Now the TDD round — let me study the existing TJ-array fixtures to match the spec style:
Let me study the test file tail (the r112 specs) and the helper to append the new specs in the established style:
Let me verify the fixture geometry at HEAD before writing the specs (the r112 fixture-isolation lesson):
Fixture geometry verified — the RED signatures are exact. Let me check the `pdfWithContent` helper then write the TDD specs:
Now writing the TDD specs (RED-first at HEAD):
5 failed — the 2 guard specs should be born-green. Let me inspect their failures:
The specs landed in the wrong describe block (a nested one without the helper in scope). Let me fix the placement:
The relocation broke the structure. Let me restore and redo it cleanly:
The fixtures hit the `<40-alphanumeric` yield guard — the standing specs pad with filler text. Let me fix all five:
Guard 5's "qrs" assertion is target-class (RED at HEAD), not guard-class. Fixing it to assert only the gap-preservation leg:
**RED 3/3 with exact designed signatures + 2 born-green guards.** Let me verify the RED detail, then port the validated prototype to the source:
Target 2 returns empty — let me inspect the written fixture and debug:
The target-2 padding replace silently failed (backslash-count mismatch). Fixing directly:
All three RED signatures are the designed soup forms. Now the port — applying the measured prototype verbatim to the source:
**GREEN 97/97** on cv-text (only a comment differs from the measured prototype). Full unit suite:
**GREEN 1092/1092** (1087 + 5 net new). Now the mutation matrix — M1 [repair removed] and M2 [reset leg removed]:
**MUTATION MATRIX EXACT: M1 → 3 · M2 → 1 · restored green.** Now the real-file ground truth on the final source:
**GROUND TRUTH PERFECT** — all 6 WeasyPrint members at 100.00% with order probes matching, all 17 standing pins hold. Now the byte-level blast radius + lint:
**All 17 members byte-identical, lint 0/0, tsc clean.** Checking the build status:
The background build died silently. Re-running with the documented env:
Build complete. Booting the :3200 standalone server for the mobile-nav pair and live UI verify:
Server healthy. Now the mobile-nav pair — the user's named focus:
**MOBILE-NAV PAIR: PARITY** — identical geometry both sides; the REF stay-open regression persists through its eighth deploy (classification stands); clone keeps the auto-close superset. Now the live UI verify with the WeasyPrint-shaped probe CV:
Let me create the WeasyPrint-shaped probe CV and the r113 UI-verify script:
The second check used the stale pre-fix instrumented module. Verifying with the actual current source:
Probe reads clean on the fixed source (name at 0, dates at 402). Now the live UI verify through the real upload flow:
UI verify passed (name-first, joined, zero U+FFFD) — but the sweep-regex misprint repeated (matched job ids). Verifying the DB directly and sweeping by real id:
**DB pristine** (1 user / 0 candidates / 3 jobs). Now the desktop screenshots before the E2E gate:
12 screenshots captured. Spot-checking the dashboard render, then starting E2E:
Screenshots verified non-blank. Starting the E2E gate (detached node-spawn protocol):
E2E running detached. While it runs — the audit legs: the env-face census (the neo-crm s205 transfer candidate) and the advisory state:
**ENV-FACE CENSUS FINDING**: `E2E_PORT` is an undocumented tooling knob (playwright.config.ts:21) — exactly the neo-crm s205 class. The app face (DATABASE_URL + AUTH_SECRET) is accurate. Applying the documentation cure:
Advisory state matches the documented census (deepmerge-ts dev-chain + minimatch, zero runtime exposure); the ^16.4.2 patch HOLD stands (16.4.3 = non-security). Checking E2E progress:
E2E climbing (43 passing). Writing the docs layer — the remediation plan first:
Now the session narrative (session_259.md):
E2E at 150. Adding the AGENTS.md session-113 layer:
Now the SKILL v4.0.0 + §125:
Now the count lockstep across CLAUDE.md, README.md, AGENTS.md:
E2E at 243. Now the worklog round-112 entry:
E2E at 283. Let me audit my new scripts for the R108-A literal-import trap (fresh-clone tsc breakage):
The diagnostics live outside the repo — the repo's scripts are clean. Let me add the blast-radius script (the r112 drift-diffs equivalent) with the proper convention:
The source diff is surgical. Polling E2E until completion:
**E2E 559/559 — a clean 10.7m run. All gates green.** Final verification sweep, then the commit + push:
我已掌握了推送协议。正在提交轮次：
Now the commit — using the established commit-message format:
Committed `7046e6a` (33 files). Now the push — setting up the key and the paramiko shim (no ssh binary):
Dry-run clean (fast-forward `1fac7f0..7046e6a`). Real push:
**PUSH VERIFIED** — `7046e6a` on `main`, remote ref == local HEAD, key shredded, tree clean. Final verification of the committed state:
**Session 113 / Parity Round 112 — complete and pushed** (`7046e6a` → `git@github.com:nordeim/eon-hr.git` main, remote ref verified == local HEAD, key shredded, tree clean).

## What this round delivered

**The 18th-writer round** — the hunt took **WeasyPrint 68.0** (the Python HTML-to-PDF engine behind many CV/invoice pipelines). The pdfkit and jsPDF probes read 100% clean first; WeasyPrint read **alnums EXACT (692/692) as LETTER SOUP** — "J o h n   S m i t h" where pdftotext reads "John Smith" (the count-pin blind spot class, the second consecutive round).

- **R113-A — the explicit-zero kern**: WeasyPrint writes an explicit `0` kern between every glyph pair (`[<4A>0<6F>0<68>…] TJ`), and the TJ-internals' `kern !== 0` trigger conflated that contiguous-placement intent with the absence of a number (the dummy.pdf shape that keeps the space join). The fix: `sawNum` — a token-presence tracker. **Zero blast radius**: all 17 standing corpus members byte-identical.
- **The hoist interaction measured**: the R112-A reading-order repair fires on WeasyPrint too — the merged output reads name-first with dates at their layout position.
- **Your named focus — mobile-nav pair: PARITY** at the 77th deploy state (28×28 hamburger + 288×844 drawer both sides; the REF stay-open regression persists through its 8th deploy — classification stands; clone keeps the auto-close superset; **no Tailwind v4 regression**).
- **Gates**: lint 0/0 · tsc ✓ · **1092/1092 unit** (+5) · build ✓ · **E2E 559/559** (clean 10.7m) · DB pristine.
- **Ground truth**: the 6 WeasyPrint members each exactly 100.00% of pdftotext with order probes matching — **corpus now 24 members, 18 writer families**.
- **Extras**: the neo-crm s205 env-face doctrine transferred (`E2E_PORT` documented in `.env.example`), the Typst corpus compile-date pinned (now deterministic), and 12 r113 screenshots.

Deliverables: `docs/remediation-plan-session113.md`, `docs/session_259.md`, the AGENTS session-113 layer, SKILL v4.0.0 §125, count lockstep (1092+559=1651), and the worklog round-112 entry with the r114 queue armed.
