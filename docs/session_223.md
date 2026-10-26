I'll start by internalizing the operating instructions and then set up a structured plan for this comprehensive task. Let me first check the workspace state and refresh the repository.
The workspace has been reset — the eon-hr repo is not present locally. Let me clone it:
Repository cloned successfully. Let me examine the repo structure and read the key documentation:
The repo is at session-97 state. Now let me read the key documentation files. Given their size (AGENTS.md is 510KB, eon-hr_SKILL.md is 421KB, worklog.md is 614KB), I'll read strategically — starting with README, CLAUDE.md, and checking the session docs:
`session_221.md` is the raw transcript of the completed session-97 round. Let me read the remediation plan and the worklog tail to understand current state:
I now have the session-97 state clear. The next round is **Session 98 / Parity Round 97**. Let me read the core documentation — CLAUDE.md and README.md first:
The output keeps nesting. Let me read CLAUDE.md in direct chunks:
CLAUDE.md understood. Now let me review README.md structure:
Now let me check the AGENTS.md recent session layer and the skills catalog:
Now let me review the repo's skills catalog and the web-application skill as instructed:
I've internalized the web-application skill. Now let me validate the environment setup and check alignment with the codebase. First, the environment state:
Key findings: the sandbox exports `DATABASE_URL=file:/home/z/my-project/db/custom.db` (the documented exported-DATABASE_URL trap). I must use `env -u DATABASE_URL` for all Prisma CLI work. Let me set up the environment:
Database seeded at `<repo>/db/custom.db`. Now let me run the baseline gates (lint → typecheck → unit):
Lint ✓, tsc ✓, 998/998 unit ✓. Now let me start the production build in the background and begin the source-side audit while it runs:
While the build runs, let me audit the frontier file — `src/lib/cv-text.ts` (the r98 queue names the octal-escape class and multi-stream PDFs as next candidates):
Now let me examine the existing CV-flow tests and verify the multi-stream hypothesis empirically — the r98 queue names it as "never pinned":
All fixtures are single-stream — exactly the blind spot. Let me verify the multi-stream hypothesis empirically:
**Both r98 queue candidates are now VERIFIED defects:**
1. **R98-A (multi-stream):** page-2 text is LOST in a 2-stream PDF — the scanner never extracts streams after the first
2. **R98-B (octal escapes):** `\227`, `\351` remain literal garbage in extracted text

Let me check the build and continue the audit — mobile navigation and the standing scans:
The mobile nav matches the documented contract. Now let me run the standing audit scans (oklch, secrets, patch watch) and verify the test configs:
Standing scans clean. Let me verify the test configs and build status:
Configs are in place and comprehensive. Let me check the standing probe scripts and agent-browser tooling:
The build died early. Let me rerun it properly:
Build ✓ 116/116. Now let me start the E2E baseline (runs ~10.5 min, ALONE protocol) while I continue source-side audit work:
neo-crm has advanced to session-188 (a zero-product-code-touch round — docs-layer cure only; its D-187a3 Tailwind v4 lesson was already consumed by eon-hr session 96). Nothing new to adopt for eon-hr product code.

Let me check E2E progress and write the RED unit tests for the two verified defects:
Let me write the RED unit tests for the two verified defects (TDD discipline):
Now let me see the rest of the session97 E2E spec for the cleanup pattern:
The E2E died. Let me investigate and restart it properly:
All tests failing instantly — an environment/boot issue. Let me diagnose:
Every test fails instantly — this is the documented chromium-binary trap from the worklog. Let me kill the run and install the browser binary:
E2E baseline now running properly (19 ✓, 0 ✘). The chromium-1248 reinstall trap re-fired as documented. While E2E runs, let me confirm the RED state of the new unit tests:
**RED 2/2 as designed** — R98-A (multi-stream) and R98-B (octal) both fail against the current code; the escaped-backslash guard pin passes (it pins against future sequential-replace regressions). Now the GREEN phase:
The em-dash and multi-stream pass now, but `\351` (é, 0xE9=233) maps to space because my printable check only covers ASCII. Latin-1's 160-255 range (é, ñ, ü…) must decode through `fromCharCode`:
**GREEN 12/12.** Let me run the full unit suite and check E2E progress:
Lint failures come from Playwright trace artifacts left by the dead first E2E run (`test-results/`). Let me check the eslint ignores and clean up:
The lint errors are transient artifacts from the dead E2E run. The current (live) run has cleaned `test-results/`. Let me verify and re-lint:
The live E2E run is writing trace artifacts into `test-results/` — a generated-artifacts dir (already gitignored) that eslint doesn't ignore. Any failed E2E run breaks the lint gate. This is a config-hygiene gap to fix this round:
All gates green: lint 0/0, tsc ✓, 1001/1001 unit. Now let me write the E2E spec for the round (born-green + mutation-proof pattern):
Now let me write the remediation plan for this round:
While the E2E baseline runs, let me prepare the REF probe scripts. Let me check the standing probe inventory:
E2E at 332/549, zero failures. Let me create the r98 probe scripts while waiting:
**E2E BASELINE: 549/549 GREEN (12.4m, zero flakes).** All baseline gates pass on the unmodified HEAD. Now let me rebuild with the fix and run the new E2E spec (born-green + mutation proof):
E2E born-green 2/2. Now the **mutation proof** — revert the fix temporarily, rebuild, and count REDs:
**R98-A mutation proof: exactly 1 RED** — the session98 spec fails against the pre-fix build while session97 stays green. Now restore R98-A and mutation-proof R98-B at the unit layer:
**R98-B mutation proof: exactly 1 RED** at the unit layer, 11 others green. Restore the full fix:
Fix restored, all green. Now the REF-side opening read — deploy watch first:
**66th DEPLOY DETECTED** — both login JS and CSS fingerprints moved. Per protocol, the full ladder must run. Login pair first:
**Login pair BYTE-IDENTICAL** — the 66th deploy is NON-VISUAL. Now boot :3200 with the remediated build and run the standing ladder:
1/5 with `found:false` on both sides — the auth legs likely didn't complete (the documented transient). Let me see the full output:
Desktop navmap matches but all mobile members read `found:false` on both sides. Let me inspect the probe's session setup:
The probe expects pre-authed `ref`/`loc` sessions. Let me check the auth script:
**Standing audits 5/5.** Now the route sweep and verify ladders:
**FULL STANDING LADDER GREEN** — 5/5 + 12/12 + 13/13 + 13/13, login pair byte-identical. Now the REF mobile sweep (broken set + mobile-nav pair):
The broken-set classifications HOLD (hrreports/interviewassistant empty, employeeselfservice loading shell, /recruitment renders at 550). The menu button + /employee/1 probes need the follow-up pattern (as in r97). Let me check the r97 nav probe:
The `NODIALOG` read is the documented `offsetParent` fallacy on fixed-position portals (§109 trap). Let me write the fixed-aware follow-up probe:
**Mobile-nav pair verified: PARITY** — REF hamburger 28px + drawer 288×844 fixed z-50 with the 16-item nav. `/employeedetail` shell classification HOLDS. Now the clone-side pair:
**Clone mobile-nav pair: PARITY** — 28px hamburger, 288×844 fixed z-50 drawer, menu cycle `/training` + auto-close works. Now the live post-fix CV verify — a real multi-stream PDF through the actual UI:
Let me build the real multi-stream PDF and write the reliable verification script (snapshot-ref pattern per §109):
The file landed in the workspace scripts folder. Let me move it and run:
Upload done but no card rendered. Let me debug interactively — the E2E passed with the same PDF, so this is likely an agent-browser upload quirk:
The upload command completes but React's onChange never fires. Let me check how r97's working evidence script did it:
The r97 script used the same command. The change event may need manual dispatch. Let me test:
`files=NONE` — the upload reports Done but files don't stick. Let me check agent-browser's upload semantics:
The docs prefer ref-based upload. Let me use the snapshot-ref form:
The hidden input isn't in the a11y snapshot. Let me read the page's upload implementation:
The input is `hidden` with a React onChange. Let me set the file via DataTransfer + base64 in-page (bypassing the flaky upload command):
The handler consumed the file (the `value=""` clear proves it ran) but no candidate was created. Let me instrument the file count before dispatch:
The documented session-96 trap re-fired: `//` comments swallow the rest of a one-lined eval. Remove the comment:
The toast confirms the handler ran but extraction returned "". The same bytes pass in Playwright Chromium — this is environmental. Let me decompose the pipeline step-by-step in the live page:
The scan+inflate work in the page — but which build is :3200 serving? Let me check the standalone build's mtime vs my restore time:
The live page showed FIXED behavior ("86,115") while the old code yields "86,156". Let me verify what's actually in the served chunk:
**ROOT CAUSE FOUND — process error**: the served chunk contains `f.lastIndex=g` — :3200 is serving the **mutation build** (I restored the source but never rebuilt). And my page-1 text is 39 alnums — under the 40-alnum guard when page 2 is lost, explaining the "Couldn't read" toast. The live-verify failure actually *proves* the fix's necessity. Rebuild and reboot:
`lastIndex=g+9` — the fix is now in the served build. Reboot :3200 and re-run the live verify:
**LIVE POST-FIX VERIFY: GREEN** — analysis card rendered ("r98 real cv", AI score 7, skills match 8%, matched keywords), API row persisted, cleanup 200. Let me clean up debug artifacts and verify the evidence:
users=2 — one extra user beyond the seed's 1. Let me check who:
The `loading-probe` user comes from verify-r45's signup probe (documented standing behavior — r97 swept it at close). Let me sweep it for the pristine close:
DB pristine. Now the FINAL full E2E gate — closing all browser sessions first (ALONE protocol):
Final E2E running. While it runs, let me write the docs layer — the session narrative first:
Now the AGENTS.md session-98 layer. Let me check the session-97 layer format:
Now the SKILL.md §110 lesson:
Now the count-lockstep updates across docs:
The README testing block has stale duplicate lines (512/941 specs). Let me inspect and fix:
Stale duplicate count lines accumulated over sessions — a count-lockstep violation. Fixing the block:
Now fill the remediation plan's execution appendix and update the CLAUDE.md test table:
Now fill the remediation plan's execution appendix:
E2E at 153/550. Let me write the worklog entry while it runs:
While E2E finishes, let me prepare the commit — review changes and the SSH wrapper instructions:
No ssh binary — I'll need the paramiko shim from the wrapper doc's Appendix A:
paramiko needs installing. Let me set it up and create the shim outside the repo:
paramiko OK. Let me create the ssh shim from the doc's Appendix A:
**FINAL E2E GATE: 550/550 GREEN (10.7m, zero flakes).** All gates pass on the remediated tree. Let me clean up the transient debug scripts (following the house pattern of keeping the round's instruments), run the final verification, and commit:
All gates green. Now staging and committing:
Commit `7e45143` on main, tree clean, no secrets. Now the SSH wrapper push — materialize the key and dry-run:
Dry-run clean (`116e685..7e45143` fast-forward). Executing the real push:
**PUSH VERIFIED** — remote main @ `7e45143` == local HEAD. Shredding the operator key per protocol:
All tasks complete. Final cleanup:
## Round complete — Session 98 / Parity Round 97 landed ✅

**The full pipeline ran end-to-end:** workspace refreshed (clone @ `116e685`), all five baseline gates green (998 unit · 549 E2E), the REF audited live, two real defects found and TDD-fixed, and the push **verified** (remote `main` == `7e45143`, key shredded).

**The round's finds (both from the r97 queue's named frontier):**
- **R98-A — the multi-stream PDF bug:** the stream scan re-matched "stream" *inside* "endstream", silently losing **every page after the first** of a multi-page CV. The r97 queue's "the scanner handles it" assumption was wrong — the fixture-form blind spot one round deeper. One-line fix, mutation-proofed at both layers.
- **R98-B — the octal-escape class:** Word/Acrobat write é/em-dashes/curly-quotes as `\351`/`\227` octal escapes — the old unescape left them as literal garbage. Fixed with a single-pass alternation unescape + the WinAnsi delta map.
- **R98-C:** eslint now ignores Playwright's generated trace artifacts (a failed E2E run was breaking the lint gate with 1,948 problems).

**Everything else verified:** 66th login deploy classified non-visual (login pair byte-identical), full standing ladder green (5/5 + 12/12 + 13/13 + 13/13), mobile-nav pair at parity live (28px hamburger + 288×844 drawer, menu cycle auto-closes), REF-broken mobile set holds. Final gates: **1001 unit + 550 E2E, all green**; 7 evidence PNGs; docs + worklog + remediation plan in lockstep.

**Suggested next:** the r99 queue is in `docs/session_222.md` — worth watching the REF's mobile band (their platform is actively patching; the 66th deploy just landed) and pinning a real Acrobat-produced PDF.
