I'll start by understanding the task and setting up a systematic plan. This is a complex multi-phase engineering task: repo refresh → docs review → codebase audit → parity iteration vs the live reference site → remediation → testing → screenshots → docs update → commit & push.
Workspace is fresh — no local eon-hr checkout exists, so I'll clone it now.
Repo cloned successfully on `main`, clean tree, up to date with origin. Now let me review the repository structure and read the key documentation files.
The repo is large with an extensive history. Let me check the sizes of the key docs to plan my reading strategy.
Let me read the smaller key docs first, in parallel.
现在让我阅读剩下的关键文档。我会先阅读架构文档和技能目录，并从保存的输出中阅读完整的 README 和 CLAUDE。
The docs are large; I'll read them strategically. First, let me check the current environment state (.env, db location, package.json, test configs) since the user's task explicitly involves the DATABASE_URL setup.
`.env` is missing (needs creation from `.env.example` — which already specifies `DATABASE_URL="file:../db/custom.db"`), and `db/` exists at root. Let me check package.json, test configs, and the exported-DATABASE_URL trap the docs warn about.
Key finding: **the exported `DATABASE_URL` trap is ACTIVE (9th consecutive sandbox)** — the env exports `DATABASE_URL=file:/home/z/my-project/db/custom.db` pointing outside the repo, so all DB commands need the `env -u` guard. The `.env.example` already matches the user's required contract. Let me set up the environment now (create `.env`, install deps) and read the remaining docs while it runs.
Environment built. Let me verify the DB landed at the repo root and run the baseline gates (lint + typecheck + unit tests).
All baseline gates green: lint 0/0 · tsc clean · **941/941 unit** (matches documented standing count) · DB at repo root. Now the build gate:
Build gate green. Now let me strategically review the large docs — worklog structure, AGENTS.md latest session layer, and the SKILL version.
My session maps to **Session 86 / Parity Round 85** per the established convention. Let me read the SKILL §95 layer and check the vitest/playwright configs and tests structure.
测试基础设施 (vitest + playwright) 已完全配置到位。现在让我验证 r85 的修复是否已提交到代码库中（进行对齐检查），并阅读工作日志的最后一轮记录。
Documentation and codebase are fully aligned. Now let me load the audit lens from the repo's skills folder as instructed.
The audit lens is loaded. Now let me check the recent commits' contents and validate the standing checks (TW-v4 scan, secrets scan, patch watch).
Standing checks green (TW-v4 scan clean: 16 `!important` all in globals.css · oklch comments-only · zero row-level `md:flex-wrap` · secrets zero in src). Last 3 commits are docs/skills-only. Now let me review the standing instrument scripts for the opening read protocol.
Now let me boot the standalone server and verify agent-browser availability — the opening-read prerequisites.
Standalone healthy on `:3200` (db up — the `env -u` guard worked). Now the **r86 opening read**: running the deploy watch to check the REF side against the 57th-generation finals.
**The 58th login deploy has landed** — login JS `BgH6kzLl → DzlN4LV0` + a new `frontend-config` entry, **CSS MOVED** (`--4Ltml9o → BD8HgQNX`, first CSS movement in ~19 generations), app side QUIET, DOM census unchanged. Per protocol: ladder every observed generation. Step 1 — the fresh login-pair byte-compare vs the standing `69aa4241…` baseline:
**Ladder Step 1 GREEN** — the 58th deploy is **NON-VISUAL** (byte-identical login pair despite the JS+CSS movements). Now steps 2–3 require the ref-session re-auth protocol first, then the standing + sweep runs:
Let me re-auth the ref session (the r83 protocol) then run the standing orchestrator:
Ref session re-authed (`/` — AUTH-OK). Now steps 2–3: the standing audits + route sweep:
Steps 2–3 GREEN (standing 5/5 + sweep 12/12). Now steps 4–5: verify-r49 and verify-r45:
**FULL LADDER GREEN — the 58th deploy is FULLY LADDERED NON-VISUAL** (byte-identical login + 5/5 + 12/12 + 13/13 + 13/13). Now retiring the close-out traps: re-auth the loc session (the r81 cookie-contamination trap) and verify DB state:
Loc session re-authed. But `users: 2` — the verify-r45 probe user contamination (the standing trap). Running the r72 DB sweep to restore pristine state:
数据库已达到初始纯净状态，开题审阅已完成。现在进行本轮独具慧眼的探索：**将跨侧像素差异（pixel-diff）扩展至静止路由对**（即该程序首个大规模的 REF↔LOC 像素协议 —— 这正是 r85 中发现徽章/徽标/圆环缺陷的技术）。让我来研究一下 r85 的差异方法：
让我研究一下 r85 截图捕获约定（等待、状态处理），以便 r86 工具与之保持一致：
Now I'll write the r86 instruments — the at-rest cross-side pixel-diff protocol (the fresh-eyes frontier). First the capture script:
Now the cross-side pixel-diff script:
Byte chain: **every capture STABLE both sides except 1133-mobile-drawer loc DRIFT** — and the capture log shows the LOC side found no "Toggle Sidebar" button (the r84-C readiness lesson). Let me check how r85's drawer pair handled this:
The r85 approach searches any snapshot line containing "Toggle Sidebar" — my exact-regex was too strict, so the LOC drawer never opened (an instrument artifact, not a code defect). Fixing and re-capturing the 1133 pair:
The LOC drawer now opens (STABLE vs 1023 — byte-determinism proven), but the REF click landed pre-hydration this time (`open: false`). Retrying the REF capture with settle verification:
1133 REF drawer now STABLE — **the full 21-round byte chain holds on every pair, and the r85 baselines' first byte-compare is GREEN**. Now the fresh-eyes read: the **first cross-side pixel-diff across the at-rest route registry**:
**The first at-rest cross-side pixel-diff at scale — a major fresh-eyes harvest: 507 real diff-cells across the registry** (invisible to the 21-round per-side byte chains — exactly the protocol blind spot this instrument was designed to expose). Key clusters:

- **payrollreports**: 265 cells (massive left-column cluster, orange tones)
- **attendance**: 130 cells · **employees** (desktop+mobile): 66 cells with an orange `(222,130,10)` signature
- **payroll/recruitment/settings/assetmanagement/training**: 3–11 cells each
- **dashboard + mobile dashboard**: 0 cells (perfect parity)
- **login**: the known logo AA class + badge-edge cells

Let me audit the biggest cluster member-by-member — payrollreports first:
**MAJOR FINDING — the payrollreports page content is vertically shifted between the sides**: the REF's tab bar sits at y~360 with a `p-4` filter block and a `p-4 border-slate-100` summary grid; the LOC renders the standard `p-6 pb-3` CardHeader geometry with the tabs higher (y~310). Let me get the full structural geometry of both page headers:
Two precise findings on payrollreports: **(1) the filter block sits 24px lower on the REF** (label y227 vs 203, tablist y326 vs 302) and **(2) the tablist container class differs** (`bg-muted` REF vs `bg-secondary` LOC). Let me crop the actual pixels to see the orange delta at the top and verify the tablist colors:
The delta is a **blue-600 icon at different Y positions** — both sides have the icon but the geometry differs. Let me map the full title-block structure precisely:
**Root cause localized**: the REF's `max-w-7xl` wrapper starts at **y56** vs the LOC's **y32** — a 24px page-top offset, plus the tablist uses `bg-muted` (REF) vs `bg-secondary` (LOC), plus the Monthly card interiors differ (p-4/border-b vs p-6). Let me walk the card interiors and read the full wrapper classes:
Three real deltas isolated on /payrollreports: the 24px wrapper offset, the CardHeader `border-b` + 16px title-block height difference, and the whole card content interior (REF: `p-0` + `border-b` + `bg-slate-50 rounded-lg p-3` stat tiles + full-bleed table vs LOC: standard `p-6` + bare tiles). The tablist bg computes IDENTICAL (rgb(245,245,245) both) — not a defect. Let me find the 24px offset's root cause:
Identical computed styles but different positions — something invisible occupies the REF's y32-56 band. Let me probe what elements exist there:
The REF's wrapper starts at y56 with zero margin — suspicious of a positional offset. Let me read the wrapper's full positioning computed styles:
24px from nowhere with identical box model — let me enumerate ALL matching content divs and snapshot the REF page top to find any hidden structural element:
`offsetTop: 56` — the layout engine genuinely places it there. One remaining suspect: a pseudo-element. Let me check `::before` on the content div:
No pseudo-elements, no margins — the 24px is genuinely in layout. Let me run an empirical style-mutation test on the live REF to definitively locate it:
The 24px is in-flow space before the wrapper. Let me scan the REF's stylesheets for rules matching the wrapper that set margin:
**ROOT CAUSE FOUND — a Tailwind v4 behavioral difference!** The empirical test proves 24px of in-flow space: the REF's `space-y-6` uses the **margin-top form** (`* + *`), so the first in-flow child's 24px top-margin collapses through the wrapper's edge (the wrapper's own computed margin reads 0 — the classic collapse illusion). TW v4's `space-y-6` uses **margin-bottom on `:not(:last-child)`** — top-margin collapse can never happen. Let me confirm by reading the REF's actual CSS rule:
**CONFIRMED** — the REF ships the TW-v3-style rule `.space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem }`: class-hidden siblings still count in the chain, so the first visible child's 24px top margin collapses through the wrapper. **This is exactly the Tailwind v4 bug class the user warned about** (TW v4's `space-y-*` switched to margin-bottom on `:not(:last-child)`, so the collapse geometry can never reproduce). Let me survey which routes carry this pattern:
**Survey decisive**: only `/payrollreports` carries the 24px offset (unique DOM arrangement: mobile-sticky-header first child + desktop-header second child inside the `space-y-6` wrapper). All other routes' wrappers match. Now let me audit the remaining clusters — starting with the employees orange delta:
The LOC renders content where the REF shows flat background — a layout-level difference on /employees. Let me probe the DOM structure:
The LOC renders a seeded-employee profile card the REF doesn't show there — possibly the documented "REF tenant progressively EMPTIED" data drift. Let me compare both pages' full structures:
**R86-B CLASSIFIED: data-state drift, not a defect** — the REF tenant has **0 employees** ("Manage your 0 employees", the documented tenant-emptying) while the LOC seeds 1 per its DB-pristine contract. The orange pixels are the LOC's employee card content vs the REF's flat background. No fix warranted (the seeded data is contractual). Next: the /attendance cluster (130 cells):
**R86-C FOUND — a real functional parity gap**: the REF renders an "**Access Restricted — Only Admin or Sec...**" block (h292) where the LOC renders the "Today's Overview" card. Let me read the full restriction text and check the role states:
The REF user lacks Admin/Security role (tenant state drift); the LOC's seeded user is `admin` per contract. The key question: does the clone implement the same role gate? Let me check the source:
**R86-C RESOLVED — not a defect**: the clone fully implements the Access Restricted gate (`!canMark` branch, with session-61/63 measured recipes). The seeded user is `admin` per contract → shows the marking UI; the REF's live-tenant user is non-admin → shows the restricted state. Role-state drift, code parity holds. Now the remaining clusters in one batch:
Login cells = the r85-classified AA residual (same ~46 samples, stable — not new). The mobile drawer shows a real text-color delta (zinc-700 vs near-black). Let me batch-probe the remaining pages' DOM at their diff regions:
Several leads: recruitment's "Post New Job" button renders light on REF vs blue on LOC; payroll inputs show dark text (values?) on REF; assetmanagement's Actions column is x-shifted; training icon glyphs differ. Let me probe precisely:
**R86-D FOUND**: the REF's payroll month input defaults to `2026-10` (current month) — the LOC's is empty. The recruitment button styles compute IDENTICAL (transparent bg) — so the blue pixel must come from what's *behind* it. Let me probe the stack:
Both buttons carry the same gradient NOW — but the captures differ. Let me inspect the actual captured PNGs' button regions:
Both captures have the button at x1254-1407 — the difference is the **internal content start**: the REF's white glyphs reach x1282, the LOC's start at ~1304 (~22px later — an icon/gap layout difference, the R13-A recipe class). Let me read the button's inner structure:
The **icon glyph** differs (REF: 49px dense glyph vs LOC: 21px sparse) while the text layout matches. Let me identify the icons:
**R86-E CONFIRMED — real defect**: REF uses `lucide-user-plus` (dense person+plus glyph); LOC uses `lucide-plus` (sparse). Text layout is identical. Let me find and fix the source:
Two call sites: the header CTA (line 320, the measured defect) and the empty-state button (line 667, unmeasurable on the REF — its tenant has 1 posting). I'll fix the measured one. Now let me find the payroll month-input source (R86-D):
R86-D source found: `useState("")` at line 82 vs the REF's current-month default. The page already has a `currentPeriod()` helper — let me check it, plus verify the payroll header cell (x1056-1104):
Payroll header cell = text-glyph AA (555 vs 548 light px, computed styles identical) — below the parity bar. Let me finish the remaining probes: assetmanagement TH position, training icon, m-settings, and the mobile drawer text color:
More real defects harvested: **assetmanagement "Actions" TH alignment** (REF left-aligned glyphs vs LOC right-shifted), **training empty-state icon** (REF `lucide-video` vs LOC `lucide-graduation-cap`), **mobile drawer item color** (REF `rgb(63,63,70)` vs LOC `rgb(10,10,10)`). Let me pin the remaining identifications:
All defects identified. Let me close out the last two settings questions (desktop Edit button + the x960-1008 cell):
The Edit buttons compute identically; the two tile-icon glyph defects explain the settings diffs. Let me verify the Edit-button diff is just text AA, then check the font stacks:
160 px in a 15×15 box at the "E" glyph with identical fonts/geometry — suspicious. Let me dump the actual button pixels:
The LOC renders a **pencil icon** where the REF renders the "E" text glyph. Let me see the full button row:
**R86-J CONFIRMED**: both Edit buttons are icon+text with identical rendered geometry — the delta is the glyph: REF `lucide-square-pen` vs LOC `lucide-pencil`. Let me complete the payrollreports A2 details and find the source call sites:
The REF's title is a DIV (not heading). Let me read both sides' title/description computed styles directly:
All findings are characterized. Let me locate the mobile drawer theme-toggle source (R86-H) and the settings tiles source:
R86-H root cause: the desktop sidebar wrapper carries `text-sidebar-foreground` (line 170) but the **drawer panel doesn't** — the moon button inherits the body default instead of zinc-700. Now the remaining sources — settings tiles, assetmanagement TH, training icon:
All source locations confirmed. Let me verify the mobile payrollreports geometry (pre-fix) and check for test pins on the affected surfaces:
Mobile parity confirmed (wY=89 both — the fix is desktop-only, mobile-safe). Existing unit pins found for the icons — let me map all affected test pins:
R33-A3 pin is compatible with the planned fixes. The complete findings set is characterized. Now let me write the remediation plan document:
Plan saved. Now the validation pass against the codebase before execution — verifying every edit site:
All sites validated — the plan aligns with the codebase. Now TDD: let me study the existing spec conventions, then write the RED spec:
Now writing the RED spec — `tests/e2e/session86-pixel-parity.spec.ts` pinning all ten contracts:
现在进入 RED 阶段——首先清除资源（:3200 + 浏览器守护进程，遵循 r81 协议），然后针对修复前的构建运行新的 spec：
11 个 defect pins 全部为 RED —— 但移动端 guard 也失败了（预期结果为 GREEN）。让我检查一下它的具体读取情况：
浏览器二进制文件的小问题——但第一次运行确实有实际的断言读取。让我从其错误上下文中读取移动端 guard 的实际失败原因：
All 11 failures were browser-launch errors (the fresh sandbox lacks the Playwright binaries — the r84 "fresh-sandbox chromium" lesson). Installing FOREGROUND per the standing protocol:
**RED confirmed on 9 pins** — but R86-H passed for the wrong element: `document.querySelector` found the hidden desktop sidebar's moon (which inherits the token correctly) instead of the drawer's. Fixing the selector to scope inside the open dialog:
**R86-H RED confirmed** (received `rgb(10,10,10)` — the body default). RED phase complete: 10 defect pins RED + mobile guard GREEN, exactly as designed. Now the GREEN phase — applying the ten fixes. First, payrollreports (A1+A2+A3):
Now the remaining seven fixes across five files:
`Plus` still used at line 674 — import stays. Now assetmanagement, training, and app-shell:
Now the drawer panel (R86-H) and settings (R86-I + R86-J):
All ten fixes applied. Let me check for now-unused imports and update the recipe pins to the new REF-measured contract:
`Pencil` and the `Workflow` icon are now unused (only type names remain) — removing them from the import; `Building2` stays (line 1136, a different measured surface):
Now updating the unit recipe pins to the new REF-measured contract (same-commit lockstep):
Now the fast gates (lint + tsc + unit), then rebuild and run GREEN:
JSX syntax break — the comment inside the parenthesized expression. Let me fix it:
One TS error in my spec — `className.baseVal` typing. Switching to `getAttribute("class")`:
All fast gates green (lint 0/0 · tsc clean · 941/941 unit with updated pins). Now rebuild and run GREEN:
**GREEN: 12/12.** Now the full E2E gate (the 424 standing + 11 new):
**FULL E2E GATE GREEN: 435/435** (424 standing + 11 new, 7.4m, zero flakes — the mobile-navigation suite included). Now the post-fix evidence: re-capture the fixed pairs and re-run the cross-side diff:
Byte compares exactly as designed (REF stable, LOC drift-by-design on all 7). Now the decisive check — the cross-side re-diff on the fixed surfaces:
Major progress (training 0 ✓, drawer 0 ✓, assetmanagement 2-AA ✓, payroll D-cells gone ✓, PNJ icon gone ✓) — but the re-diff surfaces residuals to audit: the payrollreports table band (50 cells), a **pink delta on the first-ever mobile payrollreports pair** (38 cells), and the recruitment leftovers. Let me audit:
Card geometry now matches EXACTLY (378/80/459/105/0/564 both) — only the **thead height** differs (40 vs 44, cascading 4px). Let me read the th computed styles:
**R86-K follow-up found**: the REF's thead carries `bg-slate-50 text-slate-600 text-xs uppercase` — the LOC's has only `bg-slate-50` (th text: 12px slate-600 UPPERCASE vs 14px default-case). Now the mobile pink delta:
The "pink" is green-vs-background at offset positions — the mobile WhatsApp CTA button sits at different X. Let me measure the mobile CTA row precisely:
Desktop width matches (253 both) but mobile intrinsic width differs (551/558) with identical computed styles — something structural. Comparing the mobile button's innerHTML:
Structures identical. Let me measure the text node's rendered width directly on both sides:
Text width identical (197) but buttons stretched differently (551/558) — the container stretches them. Tracing the parent chain:
Let me see the actual rendered pixels of the mobile CTA region:
The text sits ~8px apart. Let me measure the content's exact X positions:
The 7px mobile overflow traces back to **the thead recipe too** (the 14px th labels widen the table's min-content → the whole mobile column 583 vs 590 → the centered text 3.7px apart). One root cause, two symptoms. Let me apply R86-K and check the remaining icon-AA questions:
The palette icons have **different path data** (the REF ships a different lucide build — the version-drift class; AA-level residual, below the parity bar, documented as a watch). Now let me pin R86-K in the spec, rebuild, and re-verify:
**13/13 GREEN** with the K pin. Now the final re-capture of the payrollreports pairs and the decisive re-diff:
**PERFECT PARITY: 0 diff cells on both payrollreports pairs** (desktop was 265 → 0; mobile was 38 → 0). All eleven defects fixed and pixel-verified. Now the byte-chain compare and the mobile-menu cycle verification (the user's emphasis):
Byte chain: **ref STABLE / loc DRIFT-BY-DESIGN on all 7** ✓. Now the mobile-menu functional cycle on the fixed build:
**Mobile-menu cycle GREEN** (open → Training LMS → /training → auto-close — no TW-v4 regression). Now the final full gates with the K fix:
**ALL GATES GREEN: 436/436 E2E** (424 standing + 12 new) · 941/941 unit · lint 0/0 · tsc clean. Now the round-end deploy read and the close-out checks:
Same 58th generation holding at the round-end (no 59th) — the watch needs re-arming. DB pristine ✓, env contract ✓. Let me create the re-armed r86 watch and check the doc count references for lockstep updates:
The docs follow an append-per-session layer pattern. Let me read the current heads/tails to append the session-86 clauses in house style:
Now the docs layer. First, the execution appendix to the remediation plan:
Now the session narrative — `docs/session_195.md`:
Now the AGENTS.md session-86 layer:
Now the SKILL version bump + §96, and the CLAUDE/README clauses:
Fixing a small string-mangling artifact in the SKILL version line (`:not(idden])` → `:not([hidden])`):
Now the worklog round-85 entry:
Worklog complete. Final pre-commit verification — the full change set:
Clean change set (13 modified + 53 new; no forbidden files; .env.example tracked ✓). Let me verify test artifacts are ignored, then stage and commit:
Commit `8070337` created (66 files, +1087). Now the push protocol — reading the SSH wrapper skill first:
The procedure is clear (gate green ✓ — all four gates passed this round). Executing the push protocol — key to a 0600 temp file outside the repo, ssh preflight, fingerprint check:
No `ssh` binary — the paramiko shim path is needed (the field-tested Appendix A). Let me set up the shim and key separately:
paramiko 5.1.0 ready. Writing the key and verifying its fingerprint:
Fingerprint `3ddaNlFh…` matches the standing record from session 194 ✓. Deploying the paramiko shim outside the repo:
The direct echo test hangs on stdin (the r85 lesson — test via git's actual invocation shape instead). Going straight to the git-based auth test:
Auth works — but the remote main has **moved ahead** (`b889274` vs my clone base `6a190c0`). Fetching and inspecting the new commits before pushing:
**A parallel session-86 round is already published on the remote** (`2d0b604`) — same findings family, overlapping fixes, plus two fixes mine classified differently, and missing two of my unique finds (the drawer token, the recruitment UserPlus). The clean path: rebase onto the published round, reconcile to the union, re-gate, push. Let me inspect their versions of the overlapping files first:
The published round and mine overlap heavily; theirs is canonical. The clean path: **reset to origin/main, verify their fixes live, then apply a surgical companion commit** carrying only my unique value (the drawer token + the recruitment UserPlus + unique evidence/docs). Their payroll `ChartColumn` fix (path-data-verified) supersedes my AA classification — accepted. Executing:
Their spec covers 9 pins; my unique additions are exactly 3 (drawer moon, recruitment UserPlus, the mobile geometry guard). Executing the reconciliation — reset to the published round:
Reset confirmed; my two unique defects verified present in their tree (drawer moon + PNJ icon). Rebuilding their code and verifying both their fixes and my two remaining defects live:
Confirmed live: their fixes hold (y56 ✓, thead ✓) and **my two defects remain** (drawer moon `rgb(10,10,10)`, PNJ `lucide-plus`). Applying the two companion fixes:
Now the companion spec with the three unique pins:
**All 29 GREEN** (companion 3 + their 9 + mobile-navigation 17). Full suite now:
**436/436 GREEN.** Now the companion evidence captures (non-colliding numbers ≥1225). Let me find their published pair numbers for the byte-compare:
Their set: recruitment=1125, drawer=1135. Companion evidence at 1225 (recruitment) + 1227 (drawer), byte-compared against their published pairs:
The LOC moon now reads `rgb(63,63,70)` live ✓; byte compares perfect (ref STABLE / loc DRIFT-BY-DESIGN). The cross-side diff on the companion pairs:
**Drawer: 0 cells (pixel-perfect)**; recruitment reduced to the classified data/AA floors (the PNJ icon cell gone). Companion pass verified end-to-end. Now the companion docs layer — first their plan's tail:
Appending the companion appendix to the published plan:
Two replacements missed their targets — let me find the actual tails in the published docs:
Fixing a double-article typo from the replace, then the worklog companion entry:
`session_196.md` shows as Modified — the published round already had one. Let me check what I overwrote:
The published `session_196.md` was the first pass's working log — I must not overwrite it. Restoring theirs and moving my narrative to `session_197.md`:
Fixed. Final change set review and the companion commit:
**PUSH SUCCESSFUL — remote verified `main @ b5ba83e == local HEAD`** and the wrapper shredded its temp key. Final verification + operator-key shredding:
All work is complete and pushed. Here's the session summary:

## Round complete — Session 86 / Parity Round 85 ✅

**The interesting twist**: the push preflight (`git ls-remote`) revealed a **parallel agent session had already published its own session-86 round** on the remote. I reconciled: reset onto the published round, re-verified its fixes live, confirmed my two unique defects still present in its tree, and landed a companion commit with only the union's new value.

**What this session delivered** (pushed as `b5ba83e`, remote-verified):

1. **The full opening protocol**: the 58th REF login deploy detected + fully laddered non-visual (byte-identical login pair + 5/5 + 12/12 + 13/13 + 13/13); the 21-round byte chain verified
2. **The at-rest cross-side pixel protocol at scale** — 15 pairs, both viewports, 507 diff-cells harvested — surfacing **11 defects across the two parallel executions**, including the program's first **Tailwind v4 space-y margin-form find** (the exact TW-v4 bug class you flagged: the REF's v3-style margin-top rule collapses through the wrapper; v4's margin-bottom form never can)
3. **Two companion TDD fixes** the first pass missed: the mobile drawer's missing `text-sidebar-foreground` (the moon toggle now reads the REF's zinc-700) + the recruitment CTA's `UserPlus` glyph — the drawer pair now reads **zero cross-side diff cells**
4. **Mobile nav verified** end-to-end (drawer cycle, five-tab bar, auto-close — all green under the fixes)
5. **Gates**: lint 0/0 · tsc · 941/941 unit · **E2E 436/436** (zero flakes) · DB pristine
6. **Docs lockstep**: the companion appendix on `remediation-plan-session86.md`, `session_197.md`, AGENTS/SKILL 3.69.1/CLAUDE/README layers, worklog — plus evidence at `docs/screenshots/1225/1227` and a new lucide-version standing watch

**Suggested next**: r87's opening read is the full ladder on the 58th-or-newer; the frontier candidates are the payrollreports Tax/History/Custom tab interiors (never cross-compared) and the lucide-version glyph census (how many icons differ at the path level?).
