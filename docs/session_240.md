I'll start by reviewing my operating instructions (which I've internalized from the pasted content), then set up the workspace. Let me first check the current state of the local workspace.
The eon-hr repo doesn't exist locally yet. Let me clone it and set up the workspace.
Repo cloned successfully. Let me create a comprehensive TODO list for this complex task, then start reviewing documentation.
The repo is substantial with 286 commits of history. Key observations: `.env.example` already uses `DATABASE_URL="file:../db/custom.db"`, and vitest/playwright are already in package.json. Let me review the core docs — many are large, so I'll read strategically.
The docs have very long lines. Let me use subagents to review the large docs in parallel while I read the session docs directly.
Excellent! I now have deep context. The project is at **Session 104 complete / next is Session 105 (Parity Round 104)**. The user's asks map to running the next parity round following established conventions. Let me examine the repo's skills catalog and key sections of AGENTS.md.
I now have full context. This is **Session 105 / Parity Round 104**. Let me set up the environment: install deps, create `.env`, and validate the baseline gates.
Lint is clean. Database is at `db/custom.db` as required. Now typecheck and unit tests:
Baseline gates all green (lint 0/0, tsc ✓, 1044/1044 unit). Now let me audit the recent session-104 changes:
Now I understand the session-104 changes. Let me delegate the code audit of recent changes to a subagent while I start the REF-side parity check in parallel.
The audit is complete with actionable findings. Now let me check the REF site for parity verification. First, let me check available browsing tools:
agent-browser is ready. Let me open the REF site and log in:
Logged into REF successfully. Now let me check the standing probe scripts from the repo for deploy detection:
Now let me write the r105 deploy-watch probe following the repo's protocol:
**69th deploy detected** (login JS `index-DcYiwvas`→`index-D52diwdP`, CSS `index-D3d5-7RD`→`index-DrXNg8Ix`) — but the login render is **BYTE-IDENTICAL (NON-VISUAL)**. Let me check the app-side assets too:
App side is **QUIET** (C-IrDy5f/BGNH4KkS — the r42 baseline holds). The 69th deploy is login-side asset churn, classified **NON-VISUAL**. Now the standing mobile-nav emphasis check on the REF at 390×844:
The viewport drift trap hit (the r104 lesson — viewport lost on relaunch). Let me fix the probe with the VERIFIED-VIEWPORT guard:
Mobile nav contract verified on REF (28×28 hamburger, 288×844 drawer). The drawer-still-open reading needs verification — let me check with a precise visibility probe:
The agent-browser session cookie lapsed. Let me switch to the repo's established Playwright protocol for the nav pair. First, start the local dev server:
Dev server is up. Let me examine the r104 nav-pair probe pattern and write the r105 cross-side version:
Now let me write the r105 cross-side nav pair script with the canonical checks:
Two issues to investigate: REF drawer reading STILL-OPEN (differs from r104), and LOC login failed. Let me debug the local login first:
The classic documented trap — Prisma Error 14. The dev server inherited an exported `DATABASE_URL` from the shell. Let me check:
Confirmed: the sandbox exports `DATABASE_URL=file:/home/z/my-project/db/custom.db` (workspace root) which overrides the repo `.env`. Per the documented protocol, restart the dev server with `env -u DATABASE_URL`:
No POST hit the server — the inline script's quoting mangled the fill. Let me re-run the proper nav-pair script now that the server is fixed:
Both sides render now. Two discrepancies need investigation: REF drawer reads STILL-OPEN (was AUTO-CLOSED at 68th state), and item counts differ (16 vs 15). Let me probe deeper:
Critical findings: (1) REF drawer now has a "Close" button item and **stays open after navigation** — a behavior change vs the 68th state (r104 verified AUTO-CLOSED on both sides); (2) LOC auto-closes (superset behavior). Let me examine the REF's Close button geometry to understand its nature:
The REF's "Close" button is a shadcn DialogClose X with `display:none` — invisible at mobile width. Visual parity holds (no visible X on either side); the count difference is a DOM artifact. Now let me check the clone's drawer implementation and the pinned E2E spec:
Line 32 looks suspicious: `const obileOpen, setMobileOpen]` — let me read the actual file:
Line 32 is fine (grep display artifact). The clone auto-closes via `useEffect` on pathname (line 47-50). Let me verify what the r104 session recorded about the REF-side menu cycle behavior:
Confirmed: r104 recorded REF AUTO-CLOSED at the 68th state — the 69th deploy changed the behavior. Let me get the full Close button class to understand how it's hidden:
The Close button is display:none via CSS on the REF (invisible). Visual parity holds. Let me visually compare the two drawer screenshots:
Let me use the VLM skill to verify the screenshot contents:
Visual parity confirmed. Now let me verify the post-nav state screenshots (the REF behavior change evidence):
Confirmed with visual evidence — the REF's drawer now stays open post-navigation (69th-deploy behavior change), the clone keeps the superior auto-close superset. Now let me run the standing ladder checks. Let me find those scripts:
Let me check the mobile-navigation E2E spec pins, then plan the round:
The auto-close superset is already pinned (line 77). Now let me build the standalone app and boot :3200 for the ladder runs:
Build is running. Meanwhile, let me read the core file for this round's work — `src/lib/cv-text.ts`:
Let me check the build status and continue reviewing the key middle section:
Build was OOM-killed (exit 137). Let me free memory (stop the dev server) and retry:
While the build runs, let me verify the .env.example matches the codebase (only DATABASE_URL + AUTH_SECRET read):
`.env.example` matches the codebase (only `DATABASE_URL` + `AUTH_SECRET`). Let me review the session-104 plan format to replicate the structure:
Now let me check the build and write the session-105 remediation plan:
Plan created. Now the TDD round — first let me study the existing test fixtures to match their style:
Now I understand the fixture patterns. Let me check the build, then write the RED specs:
:3200 server up. Let me run the standing ladders while I write the RED specs:
Now let me write the RED specs for the round. First, the R105-A/B/C/D test specs:
Let me check the ladder progress and then fetch the authoritative ZapfDingbats table for the R105-B implementation:
The ladder shows LOC-side `gone:true` DIFFs — likely the documented cold-cache/hydration flake class. Let me wait for it to complete, then re-run:
The shell is resource-blocked — the ladder's Chrome sessions exhausted the 4GB RAM (the documented "stale-chrome resource exhaustion" quirk). Let me wait for it to settle:
The shell is fork-blocked by stale Chrome processes. Let me delegate cleanup to a subagent which may execute in a fresh context:

The session was interrupted by resource exhaustion from the browser automation sessions. Let me check the current state and continue from where I left off.
Shell is responsive again with memory freed. Let me verify the environment state and clean up any stale processes:
The ladder was killed mid-run by the OOM (LOC-side reads failed with command errors — an environment artifact, not a parity diff). The REF-side reads succeeded. I'll re-run the ladder serially later. Let me update my TODO state and prioritize the memory-safe TDD round first:
Now the TDD round. Let me first read the remaining critical section of `cv-text.ts` (the operator walk state) to plan the exact edits:
The ladder re-run will wait — memory-safe serialization is required. Now the core TDD round. Let me write the RED specs first (following the repo's TDD protocol):
Now let me run the RED verification:
**RED 5/5 as designed** — the Latin-1 fallback reads "34" (exactly as predicted), and the 49 standing specs hold. Now the GREEN implementation. First, R105-A — the budget-capped inflate:
Now R105-B — the marker tables (insert after the CodeMap interface):
Now R105-D (L-2) — the lastFreshTd clear in the Tm handler:
Now the objBaseFont capture in the raw font-object scan + the R105-C page-tree scan:
Now the ObjStm harvest — add BaseFont capture and page registration:
Now the pending type change and the assembly rewrite (memoized cmapsFor + marker tables + page-tree localFor):
All four fixes implemented. Now run the GREEN check:
**GREEN 54/54.** Now the full unit suite + lint + typecheck:
**1049/1049 unit · lint 0/0 · tsc ✓.** Now the mutation proof M1–M4 (each mutation must turn exactly its spec RED):
**Mutation matrix M1–M4 all RED as designed, restored to 54/54 GREEN.** Let me verify restore integrity and check for corpus files:
Corpus files lived outside the repo (workspace reset). Let me re-establish the real-file ground truth — download the IRS + arXiv corpus files:
Corpus re-established. Let me write the ground-truth verification script (extract through the same code path, count alnums vs the standing pins):
**CORPUS HOLDS — both real files IDENTICAL through the remedicated code.** Now rebuild for E2E. First check the detached E2E protocol:
E2E gate is running detached. While it runs, let me do the documentation layer. First, examine the session-104 AGENTS.md layer format:
Now let me check E2E progress and write the AGENTS.md session-105 layer:
31 instant failures (1ms each) — this is infrastructure, not test logic. Let me inspect the error:
Setup passed but every browser test fails at 1ms — the classic browser-binary mismatch. Let me kill the run and check:
chromium-1248 installed (the documented fresh-workspace quirk). Re-launch the E2E gate:
41 passed, 0 failed — E2E is healthy now. While it runs (~11 min), let me write the documentation layer. First the AGENTS.md session-105 layer:
Now the count lockstep (1044→1049 unit, 1602→1607 total) across CLAUDE.md, README.md, AGENTS.md:
Lockstep done, E2E at 76✓/0✘. Now the SKILL.md version bump — let me find the version header and lesson §116:
Now the SKILL.md version bump v3.92.0 + §117 lesson:
Now append §117 to SKILL.md:
Check E2E progress, then write the session narrative docs:
Now fill the remediation plan's execution appendix:
Now the worklog round-104 entry. Let me check the worklog format first:
E2E at 218✓/0✘. Now append the worklog round-104 entry:
While E2E finishes, let me check the full git status and README session references:
E2E at 268✓. Let me fix the noted Recharts doc drift (CLAUDE.md says "Recharts 2", package.json has ^3.10.1):
**E2E 558/558 — a clean single run (10.9m), zero failures. All five gates green.** Now boot :3200 on the remediated build and re-verify the mobile-nav pair + capture screenshots:
Mobile-nav pair verified on the remediated build (auto-close superset intact). Now capture the desktop screenshot set:
Screenshots captured. Let me spot-check the dashboard renders correctly with VLM:
Dashboard verified. Now the serialized verify-r45 ladder re-run (memory-aware — nothing else competing):
**verify-r45: 13/13 MATCH** — the earlier DIFFs confirmed as the OOM artifact. Now the second standing ladder (verify-r49):
verify-r49 boots its own :3201 zero-tenant server. Launch it:
The classic **REF-SESSION COOKIE LAPSE** (documented r104 trap): every REF read shows the login page. The session must be re-authed and the ladder re-run. Let me check the auth mechanism:
The `ref` named session needs re-auth (the r104 cure). Re-auth then re-run:
Ref session re-authed. Re-run the r49 ladder:
12/13 + 1 DIFF (stats-surveyanalytics) — exactly the r104 pattern (the documented slow-load flake class). Per protocol, the direct 8s re-read:
The 9s re-read shows a **stable** geometry difference — not the r104 flake class. Let me check what r104 actually verified and investigate whether this is data-authored:
The r104 re-read compared rootCls only — never the chart geometry. Let me investigate the actual cause (container structure + data):
Same legends, different container widths (REF 466/958 vs LOC 546/1118 — an 80/160px content-area delta). Let me compare the shell geometry directly:
REF's main is 160px narrower (1024 vs 1184) at the same viewport. Since r49 passed 13/13 in earlier rounds, something changed. Let me check whether it's shell-wide or page-specific:
**Viewport drift hit the ref session again** (viewportW: 1280, not 1440) — my width comparison is invalid. Re-apply the VERIFIED viewport and re-read:
At the **verified** 1440 viewport: REF main 1184, containers [546,546,1118] — **IDENTICAL to LOC**. The whole DIFF was the viewport-drift trap. Let me do the definitive svg census comparison at verified viewports:
Charts are **IDENTICAL** at the verified viewport (the width diff was pure viewport drift). The only real member: the download icon's class-string (`w-4 h-4 mr-2` vs `mr-2`, geometry 16×16 both). The r49 ladder documents a translation for exactly this class — let me check normalize():
The full picture is now proven: `svgEntryEq` normalizes the icon-class diff away (SIZE_COLOR drops size members) — the ONLY diff was the chart geometry read at the drifted 1280 viewport. **r49 = effectively 13/13** (the surveyanalytics member verified identical at the verified viewport). Let me update the plan's ladder row with the final results:
Now update session_238 and AGENTS.md with the final ladder results:
Docs updated. Now the pre-commit protocol: DB pristine check, process cleanup, and the final verification:
2 users (the r45 ladder's signup probe — the documented class). Sweep it per the pristine protocol:
DB pristine (1 user / 0 candidates). Clean up processes and run the final gates on the exact commit tree:
All gates green. Now stage and commit:
Commit `2d143f4` landed on main with a clean tree. Now the SSH push — first read the wrapper skill:
Now execute the push protocol. First check the wrapper's default remote and the ssh binary situation:
Now write the operator key (0600), verify its fingerprint, and dry-run:
Dry-run clean (`cb94f77..2d143f4` fast-forward). The real push:
**PUSHED — remote verified at `2d143f4` == local HEAD.** Now shred the operator key (protocol step 6) and verify the final state:
The push is verified (the wrapper confirmed `remote verified: refs/heads/main @ 2d143f4 == local HEAD` before shredding; `git status` agrees). The key is destroyed. Let me finalize the TODO list:
## Round Complete — Session 105 / Parity Round 104 pushed ✅

**Commit `2d143f4` on `main`, remote verified, keys shredded.** What this round delivered:

**The audit → the fixes (all TDD, RED 5/5 → GREEN 1049/1049, mutation-proofed 4/4):**
- **R105-A** — streaming 8MB inflate budget (the audit's M-1: deflate bombs in non-image streams expanded unbounded)
- **R105-B** — standard-14 marker decode (ZapfDingbats `<33>` → ✓, Symbol `<41>` → Α — never Latin-1)
- **R105-C** — page-tree-aware font chain (fontspec's "Dont selection" → "Font selection" class)
- **R105-D** — two hardenings (stale-origin clear + cmapsFor memo)

**Parity verification:** 69th REF deploy detected → classified NON-VISUAL (login byte-identical); mobile-nav pair PARITY at 390×844 (the REF's new drawer-stays-open behavior classified a REF regression; the clone keeps the auto-close superset); both standing ladders green; corpus IDENTICAL (5,871 + 67,744 alnums).

**Gates:** lint 0/0 · tsc ✓ · 1049 unit · build ✓ · E2E 558/558 (clean 10.9m) · DB pristine.

**Suggested next:** the r106 queue (docs/session_238.md) — the two-pass width table (now unblocked), the `/Differences` harvest for the dvipdfmx homoglyphs, the Quartz 13th-writer hunt, and the 70th-deploy drawer watch.
