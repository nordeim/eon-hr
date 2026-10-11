The local workspace exists. Let me create a TODO list and start the full cycle.
Pull successful — remote added `docs/session_29.md`. Let me check the new HEAD and read the documents.
Now let me read the 5 root documents in parallel.
Now let me read README.md and Project_Architecture_Document.md.
现在让我阅读会话文档 —— session_28、remediation-plan-session18、worklog 和 session_29。
Now the worklog and remediation-plan-session18:
I have the full picture now. **Current state**: Parity Round 17 complete (pushed `f5412ff`), 363 unit + 86 E2E green, viewport matrix fully swept 390→1440. This session = **Session 19 / Parity Round 18**. Frontier: redeploy check, sub-390 band (320–389), interaction-parity dimension (focus rings/keyboard order).

Let me update todos and validate the environment state.
DB pristine ✓. Now baseline gates — lint, typecheck, unit:
**Baseline fully validated: lint 0/0 · tsc ✓ · 363/363 unit · build ✓ · 86/86 E2E** — the `66859ec` state exactly. Now the static audit of the R17 diff and skills consultation:
Skills internalized. Now let me set up the audit infrastructure — LOC server + dual browser sessions:
Auth failed — the documented fill flake. Let me debug the current state:
Both sessions have email filled but password didn't take — the documented flake. Filling password manually:
LOC is authenticated. REF shows "/" — checking if it settled:
Both sessions authenticated at 1440×900. Now the **redeploy check** (first priority per session_28) — reusing the r17 probe:
**重新部署检查通过** — REF 自第 17 轮以来未更改。现在进行**移动端导航审计**（用户优先）—— 正在检查 `r17` 探测：
The r17 probe has a known weakness — REF's hamburger lacks aria-label. Writing the r18 mobile probe with a geometry-located hamburger click:
**Mobile navigation audit PASSED — byte-identical end-to-end** (top bar, tabs, drawer with live-captured REF panel, both kicker variants, md boundary — no Tailwind v4 bug). Now the round's frontier audits — **sub-390 band (320–389)**:
The sub-390 sweep shows mixed signals — some REF @389 readings look like the documented mid-hydration artifact, plus two LOC overflow candidates (attendance 487, profile 523). Let me capture the full output and re-probe with longer settle:
The @344/@389 REF readings look like the documented mid-hydration artifact (61px bar, 40px card = Base44 badge). Let me settle-check REF at those widths with a focused probe:
**Settle-check confirms: the @344/@389 sweep diffs were mid-hydration artifacts.** Settled REF readings are byte-identical to LOC (dashboard/employees/staffrequests @344/389 — kicker h1 = vw−64 exactly on both). The sub-390 band is clean: all residual diffs are the documented REF-overflow family (clone fits or overflows less).

Now the second frontier — **interaction parity: focus rings + keyboard traversal order** (the new dimension):
**Tab traversal ORDER is byte-identical everywhere** (same elements, same sequence — a strong parity result). But the **focus ring styles** show a systemic diff family. My ring strings were truncated — let me dump full computed styles on key focused elements and read the clone's component classes:
This is a **real systemic gap family — the first interaction-parity findings**. The Tab order matches perfectly, but focus rings differ. Let me read the clone's components to map the code points:
已确认 Button/Input 基础差异。接下来是 shell hamburger、sidebar-nav 和 login 页面：
All code points confirmed. Now let me verify the remaining unknowns — REF's sidebar group-button ring color, the login `--ring` var, the employees search input, and tab/select trigger recipes:
The taxonomy is now complete. REF's focus recipes: **buttons = ring-1 ring-ring (no offset)**; **sidebar = ring-2 ring-sidebar-ring (blue-500)**; **tab triggers = ring-2 ring-ring offset-2**; **login inputs = slate-400 + offset-2**; **login --ring = zinc-950** (page-scoped). Let me check the clone's remaining components:
Let me check tabs.tsx structure, grep test pins for focus-class assertions, and probe REF's switch recipe to complete the dimension:
tabs.tsx trigger confirmed (missing offset-2), no test pins on focus classes, globals has the sidebar token family. One last probe — REF's switch recipe on /notificationpreferences:
No switches in the first 18 desktop stops (sidebar consumes them). Retrying at mobile width where content comes first:
**Switch recipe: MATCH** (ring-2 offset-2 both sides, byte-identical visible layers). The gap inventory is complete. Let me sweep all remaining focus-class call sites to make the fix exhaustive:
Complete inventory (staffrequests local tab copy and employees native select already match REF recipes). Now let me check the tokens test structure, then write the remediation plan:
Now writing the remediation plan:
Plan written and all 8 code points already verified against the codebase (read during audit). Now TDD — let me check the recipes test structure and write the RED pins:
**9 RED confirmed** — exactly the expected set. Now GREEN — implementing all fixes:
Now the login page, select, and tabs fixes:
All 7 fixes applied. Adding the token pin and running the unit gate:
**373/373 unit GREEN** (+10 pins). Now build + E2E:
**All gates green: lint 0/0 · tsc ✓ · 373/373 unit (+10) · build ✓ · 86/86 E2E.** Now restarting the LOC server with the new build and re-running the live keyboard audit:
LOC re-authenticated on the fresh build. Re-running the keyboard audit:
The audit script's 40-char truncation hides the visible ring layers — the proper check is the full-string dump. Re-running it:
Nearly byte-exact everywhere — one residual: the login **input** ring renders #0A0A0A instead of slate-400. Root cause: `focus:ring-slate-400` (focus variant) loses the v4 cascade battle with the base's `focus-visible:ring-ring`, and tailwind-merge doesn't dedup across different variants. The fix: use the same variant so tailwind-merge deterministically dedups:
The Sign in pin's `not.toContain("focus-visible:ring-slate-400")` now conflicts with the inputs' new classes — scoping it to the submit button:
**Login input ring now byte-exact** (white 2px + slate-400 4px). Now verifying the tab trigger and select trigger on LOC:
Tab trigger and sidebar group verified byte-exact. The hrreports stops landed on footer buttons — let me find the select triggers by role:
Shell quoting is mangling the eval — writing a proper script instead:
**Select trigger verified byte-exact** (1px #0A0A0A, no offset) — plus bonus verification of chevrons and the Shift Swaps anchor. All 7 gap groups are live-verified. Now the post-fix regression sweep (canonical 12-route + mobile chrome):
The probe ran at the leftover 390px viewport (mobile top-bar h1). Resetting viewports and re-running:
11/12 MATCH — the /settings ERR is a transient REF read failure (it matched in the pre-fix run). Re-probing it alone:
REF /settings confirmed identical — **post-fix sweep 12/12 MATCH, zero layout regressions**. Running the mobile chrome regression:
Mobile regression clean. Now capturing focus-ring evidence screenshots — checking the existing naming sequence first:
Captured (75 total). Let me spot-check the two key focus-ring captures with VLM:
Both surfaces VLM-confirmed (computed styles remain the ground truth — byte-exact). Now checking git status before documentation updates:
All changes tracked cleanly. Let me get exact per-file spec counts for accurate doc updates:
Vitest truth: recipes 236 (+9), tokens 19 (+1) — total 373. Now the documentation updates. Starting with AGENTS.md:
Now CLAUDE.md and README.md:
Now the PAD — revision row, date, and test table:
Now the SKILL doc — checking version and structure:
All counts current. Now the session log:
Now the remediation-plan completion record and the worklog entry:
Now the final pre-commit checks — .env.example, secrets scan, and commit:
The paramiko shim is deployed at `/home/z/my-project/bin/ssh` (python3.13). Materializing the key and dry-running the wrapper:
The dry-run authenticated but targeted the wrapper's default remote (task-management). Re-running with the correct eon-hr remote:
Dry-run PASSED — remote at `66859ec`, fast-forward to `d1c0d7c` confirmed. Real push:
Push verified, key shredded, smoke green. Final pristine check and todo wrap-up:
## Session complete — Parity Round 18 pushed to `nordeim/eon-hr@main` ✅

**Pushed**: `d1c0d7c` (remote verified == local HEAD via SSH wrapper, key shredded, post-push smoke green, working tree clean, DB pristine).

**What shipped this round**:
- **Audits**: redeploy check PASS (REF unchanged), mobile navigation **byte-identical end-to-end** via an improved geometry-located drawer probe, the **first sub-390 band sweep** (clean — residuals are REF's own overflow bugs), and the **first interaction-parity audit** — Tab order is byte-identical everywhere, but the focus rings weren't
- **7 focus-recipe fixes** (10 new TDD pins): the systemic button ring-1 recipe, input offset-2, the **blue sidebar focus ring** (#3B82F6 token), hamburger focus classes, the login slate-400/zinc-950 pair, select + tab trigger recipes — every surface live-verified byte-exact, including a Tailwind v4 same-variant lesson (ring-color overrides must use `focus-visible:`, not `focus:`)
- **Gates**: lint 0/0 · tsc ✓ · **373/373 unit** · build ✓ · **86/86 E2E** · 8 screenshots → 75 total

**Suggested next**: spot-check the new focus-ring captures (59–62); next round could open a **hover/active-state parity dimension** (button hover colors are pinned for CTAs but not swept systematically), or tackle the with-data story if the reference ever gains seeded data.
