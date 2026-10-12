I'll execute immediately this time — no more planning loops. Let me set up the todo list and start with workspace refresh right away.
Workspace was reset. Cloning now:
已克隆。最新提交显示已完成第 22/23 轮一致性修复。现在让我检查文档大小并读取它们：
Key findings: no `.env`, empty `db/`, vitest+playwright already configured. Reading the 4 session docs now (most current state first):
Clear picture: this is **Session 25 / Parity Round 24**. Previous round (23) restored the v4 button-cursor + select-none contract. Reading the remediation plan and worklog tail:
Full context acquired. This is **Session 25 / Parity Round 24**. The frontier: standing audits + the never-swept **a11y-attribute dimension** (aria-*, roles, labels). Starting environment setup immediately — `.env` + install in background while I skim root docs:
理解已验证。现在正在检查安装进度并设置 DB：
DB seeded. Running baseline gates (lint + typecheck + unit):
416/416 unit green. Now building (background) while checking E2E config:
在构建运行的同时，让我来配置 SSH wrapper 并检查技能目录：
检查构建状态并准备 E2E 基准：
Build ✓. Running the 86-spec E2E baseline:
**All baseline gates green**: lint 0/0 · tsc ✓ · 416/416 unit · build ✓ · 86/86 E2E. Now starting the standalone server and setting up dual-browser probing:
Server up. Checking agent-browser availability and session commands:
Setting up dual sessions — authenticating LOC (clone) first:
LOC authenticated. Now REF session:
两个会话均已通过身份验证。现在开始进行**重新部署检查** —— 首先找到规范的 12 条路线探测：
已存在丰富的探测基础设施。正在检查重新部署探测模式：
Writing this round's redeploy probe (r24) reusing the established pattern:
LOC session lost auth (showing login page on every route — the known cookie flake). Re-authenticating:
Something's off — LOC keeps landing on the login page. Debugging directly:
Found it — origin mismatch: I authed on `localhost:3200` but the probe uses `127.0.0.1:3200` (different cookie origins). Re-authenticating on the probe origin:
**Redeploy check PASSED 12/12** — REF unchanged since round 23. Now the **mobile navigation audit** (user's priority). Checking the prior probe:
Writing this round's mobile navigation audit (the standing byte-identical structural check):
Tabs + drawer MATCH. The topbar/boundary readings look like probe artifacts — verifying with a brand-anchored probe:
移动端导航审计**已通过** — 顶部栏 390×73 白色 ✓，汉堡按钮 24/22 28×28 ✓，标签页 10/79/139/204/313 ✓，抽屉 288×844 #FAFAFA z-50 ✓，kicker y=101 h=28 ✓，800px 侧边栏品牌位于 x=76 y=25 双端 ✓。未发现 Tailwind v4 bug（`nav=false` 读取属于 probe 伪影 — REF 的侧边栏是一个 div）。

现在进行**数据重检**：
**With-data re-check: REF still zero-data** — blocked (documented). All standing audits done. Now this round's core — **the a11y-attribute dimension audit** (aria-*, roles, labels — never swept as a family):
发现显著的 a11y 系列差异。正在转储元素级细节以对它们进行分类（差距 vs 超集）：
REF dump 出错。正在调试原始输出：
Key discovery: REF's group toggles carry `aria-controls` even when collapsed (Radix older behavior); LOC's only when open. Also REF renders 2 base44-branded `<img>` per route. Dumping REF's remaining families:
REF 图片是 base44 平台品牌标识（刻意不进行克隆）。现在在 REF 上定位未命名的 `hp=dialog` 按钮，并检查 /employees + /settings 页面：
REF's bell is a dialog trigger (`hp=dialog` + controls + expanded) at the sidebar footer; REF's list/grid view toggles + moon are unnamed. Checking LOC's bell wiring + REF's settings tabs:
Two real gaps confirmed. Checking the bell's implementation in the codebase:
Now checking how Radix Collapsible handles aria-controls (spread order determines the fix):
Radix spreads user props **after** its own aria-controls — so a manual override works cleanly. Checking REF's bell click behavior before writing the plan:
REF's bell opens a real dialog. Capturing its content for the recipe:
REF's bell is a Radix Popover (384px wide, "Notifications" + "No notifications yet"). Getting the text recipes + checking LOC's popover component:
Complete popover recipe captured. Checking the loans dialog a11y on both apps + login page census:
发现差异：REF 的 `loans` 对话框包含 `aria-describedby`，而 LOC 的则没有。正在检查 REF 的描述内容：
REF's `aria-describedby` is a **dangling reference** (id doesn't resolve in DOM) — a REF bug, not a contract to replicate. Documenting as non-gap. Now the login-page a11y census via throwaway sessions:
Login a11y byte-identical ✓. One final check — the mobile drawer's dialog semantics on both apps:
Fixed-position elements report `offsetParent: null` — retrying without the filter:
Neither app's drawer uses role=dialog — checking the drawer container's actual semantics on both:
**Drawer contract matches** (role=dialog, no aria-modal, both sides). The a11y audit is complete. Now writing the remediation plan. First checking the test patterns + popover component:
There's no `popover.tsx` yet — I'll create it (@radix-ui/react-popover is already a dependency). Writing the remediation plan first:
Plan saved. Validating insertion points — reading the rest of the footer:
Now checking the dropdown-menu.tsx style conventions for the new popover component:
Writing the RED pins. Checking the test file header first:
RED confirmed (popover.tsx missing → file-level failure). Verifying then going GREEN — creating the popover primitive:
RED confirmed at the right spot. Now GREEN — creating `popover.tsx`:
Now the sidebar-nav edits — R24-A (stable content id) + R24-B (bell popover):
All edits applied. Running the test suite for GREEN:
**420/420 GREEN** (+4), lint 0/0, tsc ✓. Building + E2E:
All gates green. Restarting :3200 on the fresh build (stale-server lesson) and running live verification:
Session persisted. Running the live verification — group toggles + bell + popover:
8/8 group toggles now carry aria-controls ✓. Popover geometry nearly exact (384×175 y=617 ✓) but two deltas: popover x=16 vs REF x=0, and the closed bell lacks aria-controls. Checking Radix Popover's attribute behavior:
Same override pattern works for Popover. Quick REF re-measure to confirm the x=0 offset before fixing:
Confirmed: REF popover at x=0 (alignOffset −16 from the bell). Strengthening the pins first, then implementing:
RED as expected. Implementing GREEN:
**Every value matches REF byte-for-byte** — 384×175 @ x=0 y=617, full aria contract. Running the final E2E + regression sweeps:
Mobile regression clean (both DIFF readings are the documented probe artifacts — brand-anchored probe proved both top strips 390×73 and sidebar brand x=76 y=25). Verifying the bell popover works inside the mobile drawer too:
The query grabbed the drawer (also role=dialog). Re-querying for the popover specifically:
Mobile drawer popover works (384×175 anchored to the drawer bell). All verification green. Capturing the round's evidence screenshots:
93 screenshots currently (session_40 claimed 95 — will recount after adding). Capturing the round's evidence — the open popover on desktop:
95 screenshots total. Now updating documentation. Checking current counts in each doc:
All anchors found. Updating all documentation:
Now SKILL, PAD, CLAUDE, README:
Now writing the session log (docs/session_42.md) + remediation plan completion record:
Now the worklog entry:
Worklog updated. Final pre-commit verification and commit:
Committed at `a6d028b`. Setting up the SSH wrapper push:
No ssh binary + no paramiko (PEP 668). Reading Appendix A (the paramiko shim) and installing paramiko properly:
paramiko available. Deploying the shim (outside the repo per the operator contract):
Key parses. Dry-run first:
Dry-run passed (fast-forward `19df86b..a6d028b`). Real push:
**Pushed and verified: `a6d028b` == remote main.** Shredding the operator key + post-push smoke:
**Session 25 / Parity Round 24 complete — pushed to `nordeim/eon-hr@main` at `a6d028b`** (remote verified, key shredded, post-push smoke green). This makes two full execution cycles in a row.

**This round's work:**
- **Standing audits**: redeploy check 12/12 MATCH (REF unchanged), mobile navigation byte-identical (tabs/drawer/hamburger/topbar — no Tailwind v4 bug), with-data still blocked (REF zero-data)
- **Core audit — the a11y-attribute dimension** (never swept): full role/aria/label census + element-level dumps, discovering that REF's group toggles carry `aria-controls` in both states and its bell opens a real notifications popover
- **2 TDD fixes**: the stable-useId aria-controls contract on the Collapsible groups, and the notifications bell popover (new `ui/popover.tsx` + the exact 384×175 DOM-measured recipe — replacing the clone's dead button, the last measured REF-only behavior)
- **Gates**: lint 0/0 · tsc ✓ · **420/420 unit (+4)** · build ✓ · **86/86 E2E**; popover verified byte-exact (384×175 @ x=0 y=617); 2 new screenshots → 95 total; all docs updated

**Suggested next steps**: spot-check screenshot 81 (the popover evidence); next round's frontier — reduced-motion, the form-error/print dimensions, or the SEO/meta dimension, plus the standing re-checks.
