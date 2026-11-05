I'll start by internalizing the operating instructions and setting up the workspace. Let me create a comprehensive plan first.
仓库已克隆。这是一个拥有 125 次以上补救会话历史的高度成熟的项目。这些文档非常庞大（AGENTS.md 765KB，worklog.md 903KB），因此我将通过子智能体并行审查它们，同时检查关键的结构事实。
The repo is at session 125 complete (HEAD `8271ee8`). My work this round is **Session 126 / Parity Round 125** with the r126 queue armed. Let me read the remediation plan and worklog tail.
现在我来阅读 worklog 的尾部以及 CLAUDE.md，以理解其工作流协议。
现在让我阅读 CLAUDE.md（工作流协议）和 README 统计部分。
我现在对该项目有了全面的了解：**Session 126 / Parity Round 125**，且已配置好 r126 队列（arXiv 残留 18 件套、Typst 亚 em 残差、常规监控）。让我更新一下我的计划，并开始进行环境验证。
Environment confirmed: bun 1.3.14, node v24. The `.env.example` and `db/` folder are already correctly structured. Let me install dependencies and set up the database.
数据库已正确地放置在 `<repo>/db/custom.db`，且数据已填充，lint 检查无误。现在进行类型检查和单元测试基准检查。
Baseline gates reproduce the documented close exactly: **lint 0/0 · tsc ✓ · 1189/1189 unit**. Now let me review the repo skills catalog for the audit phase as instructed.
Let me check the available tooling (agent-browser CLI) and the corpus scripts, then dispatch the audit legs in parallel.
Now I'll dispatch the two audit legs as parallel subagents (REF-watch + neo-crm audit) while I run the corpus re-source and build in the foreground.
Both audit legs returned:
- **AUDIT-A (REF-watch)**: The **90th deploy shipped** — login JS+CSS both churned (`6xnUqbWf→DyOb2xUE`, `BVWWKVEJ→Bt66wgTd`) but **NON-VISUAL** (captures byte-identical to r125 pins). App side HELD. Mobile drawer STILL-OPEN (standing regression). Warm tokens stable.
- **AUDIT-B (neo-crm)**: HEAD `36aee3e` — 4 commits since baseline, **zero src changes** (s213/s214 were test-census rounds). Nothing to transfer. New baseline `36aee3e`. One operational lesson: the fresh-clone phantom-DB hazard.

Now the corpus re-source (fresh sandbox — /tmp lost the standing members).
Standard 404s on dvipdfmx (196B) and QUARTZ (11B) — the documented corrections needed. Let me apply the known fixes and verify all pins.
dvipdfmx fixed (244,290 B ✓). Now the QUARTZ fix — let me find the documented submodule trail correction.
QUARTZ fixed — md5 `27575d59` EXACT ✓. All 7 downloaded members sourced. Now the toolchain check (typst, chromium, weasyprint, fpdf2) and family generation.
Now I need to regenerate the 16 family members. Let me check the toolchain: typst (missing), chromium (1200 vs needed 1248), weasyprint ✓, fpdf ✓, pdftotext.
chromium-1248 installed. Now regenerate the four families — let me check the generator scripts.
All 16 family members regenerated. Now let me write the r126 corpus verification script with the post-r125 HEAD pins and run the baseline drift ledger.
Drift ledger ALL-IDENTICAL at HEAD, 16 family members EXACT. The bx census needs the instrumented proto (the source doesn't carry the hooks). Let me sync the proto and check.
bx coverage reproduces the documented r125 close exactly: **arXiv 99.9% (18 residual) · IRS 100.0% · ReportLab 100.0%**. Corpus fully verified at HEAD. Now the build (prerequisite for E2E + the standalone boot), then the hunt.
Build succeeded. Now the hunt — measuring the r126 queue's named pockets. Let me study the r125 instrumentation first.
现在，让我来编写针对 r126 队列中 arXiv 残留 18 项数据包（odd-bytes + outside codes）的 r126 盲因监测。
Measured: **arXiv has 12 blind events — 1 code-uncovered (`f-0-0` code 122 'z') + 11 odd-bytes (ALL rawLen=0, empty raws!)**. The r125 queue's "odd-length raws" description is actually empty-raw events. Let me examine the source context.
The anatomy is taking shape: 11 empty-raw events (Font2:7, Font1:2, Font3:2) + 1 code-uncovered ('z' beyond /LastChar, def=0). Let me measure the DAMAGE (are subsequent pieces in these blocks being blinded?) and the 'z' font anatomy.
The debug surface must project fewer fields. Let me check what `__r119pages` captures.
The flat form `__r118pieces` carries the raw piece fields. Let me fix the script.
Key findings: **(a) the 11 empty-raw pieces cause ZERO damage** (no subsequent blinded pieces — isolated empty shows). **(b) the 'z' is a ps=54 display-class glyph at px=1509**. Let me get the deeper anatomy: the page context and pdftotext ground truth.
The 'z' is in "sized" — figure text on page 8, shown per-glyph. The f-0-0 chain resolves to obj 292 (FC=32 LC=121, code 122 OUTSIDE) while obj 439 covers 'z' at 500. Let me determine: page binding or candidate-chain misbind, plus the pdftotext ground truth.
The 'z' part (obj 321) has **NO page binding** — pageBind=undefined, and the widthFor resolved through the candidate chain (got=true, def=0). This looks like the R125-D genus with a new shape: the form's /Resources may be an INDIRECT ref. Let me investigate obj 321's parent structure.
obj 431 declares `/XObject << /Im5 321 0 R >>` with fonts F130/F33/F41/F79 — no `f-0-0` in the parent resources. Let me find obj 321's own dict (the form's own /Resources).
**The anatomy is complete**: obj 321 (`./figures/motivation.pdf`) declares its OWN `/Font << /f-0-0 439 0 R >>` — and obj 439 COVERS code 122 at width 500! The R125-D form binding should have bound this, but pageBind=undefined. The form's `/Resources << /ExtGState << /a0 << /CA 1 /ca 1 >> >> /Font << ... >> >>` — the nested ExtGState dict may break the binding regex. Let me examine the R125-D implementation.
**找到根本原因**：F 前缀对扫描 `/\/([Ff]\w+(?:\.\w+)*)\s+(\d+)\s+0\s+R/g` 使用了 `\w`，它**不匹配连字符** —— matplotlib 形式的名称 `f-0-0` 从未被捕获到 `fonts` 映射中，因此 R125-D 表单绑定（受 `fonts.size` 控制）永远不会对这些表单触发。与此同时，`fontPairsOf`（其字符类中包含 `\-`）确实捕获了它们用于候选链。让我针对所有连字符名称的表单评估一下全貌。
The census is decisive: **4 matplotlib forms (181/321/547/548) carry hyphen names (f-0-0/f-0-1), declared 4×/2× with COLLIDING objects, and the width tables diverge on 5–15 codes**. The same `\w`-miss may affect the PAGE branch too. Let me run the corpus-wide fire-separation census.
The census reveals the class is BIGGER: **IRS carries 73 hyphen-forms + 2 hyphen-pages with T1_N names** (missed by the F-scan because they don't start with F/f!) with T1_1/T1_2/T1_3 collisions. Let me sample the IRS form shapes.
**主要发现**：第 2403 页（即 r125-cured Contents-array 页面）声明了 INLINE `/T1_N` 名称 —— F-san 未匹配到所有这些名称，因此没有页面绑定；candidate chain 解析了这些名称。并且第 1 页声明了用于 T1_1/T1_2/T1_3 的不同对象 —— 实际冲突。让我检查一下这些冲突对象是否携带不同的 width tables。
所声明的字体对象在文件中不存在——处于悬空引用状态！让我验证一下文件的对象范围，以及 T1_N 片段是如何在 HEAD 处实际解析的。
字体对象确实不存在于 IRS 中（悬空引用）。然而 HEAD 处的 IRS bx 为 100% —— T1_N 片段必须通过其他路径进行解析。让我追踪一下实际的分辨率。
所有 IRS 文本片段均已解析。该解析必须通过我的快速扫描遗漏的 ObjStm 进行。让我使用源自身的 ObjStm 框架检查一下该文件的实际结构。
The T1_N fonts live in ObjStms — all placeholder widths (500/571). The full fire-separation is now measurable. Let me check the r126 queue's third item (the Typst sub-em residuals) before designing the cures.
Let me reconcile the 18 vs 12 count and study the full scan structure (raw + ObjStm passes) before designing the cure.
**严重不对称性发现**：ObjStm 页面位置（第 1673 行）已经包含了 R120-B `fontPairsOf` 合并（注释为 "the IRS T1_0 class"），但 **raw 页面位置缺少它** —— 并且 IRS 页面是 raw-carried 的。该修复已在错误的站点落地。现在让我来协调 18 对 12 件套的计数并衡量剩余部分。
**18 项残留已完全核对**：11 empty-raw（零损伤）+ 7 in the 'z' block（来自单个未覆盖 'z' 的级联）。随着 R126-A 解除 'z' 的盲区，该区块将重新获得 bx。让我快速测量一下 Typst 的 sub-em 残差（队列项 3）以完成排查。
Typst 亚 em 残差已测量：**1/76 和 0/73 的间隙处于亚 em 范围内 —— 输出无变化，该常设分类依然有效**（监控项，非修复目标）。搜寻已完成。现在让我检查 `r125` 的 spec 结构，以进行 `TDD` 轮次设计。
排查工作已完成 —— 所有队列项已测量。现在进行 patched-proto 实验，以在计划前进行端到端验证修复（r125 规范）。
The proto may have debug insertions inside the page branch. Let me check the proto's actual text.
Found it — my template literal needs doubled backslashes (unrecognized escapes like `\s` drop the backslash). Let me fix the anchor strings.
My Write had inconsistent escaping (mixed single/double backslashes). Let me rewrite the anchor section cleanly.
Only line 23 has single backslashes (dropped in template literals). Fixing:
**Decisive results**: arXiv bx **99.9% → 100.0%** (21,503/21,503), IRS IDENTICAL, all families EXACT, 11/12 members IDENTICAL, arXiv changed with alnums exact. Now the toward/away classification.
4 个 arXiv 数据块全部是**连字解码修正**：`ﬀ` → `ﬁ`（例如 "Use ﬀrst" → "Use ﬁrst"，"Pre ﬀll" → "Pre ﬁll"）—— 错误的字体 CMap 解码了连字代码。让我验证一下 pdftotext 的 ground truth。
**PERFECT VERIFICATION**: pdftotext reads 4×`ﬁ` + 1×`ﬀ`; HEAD decodes 5×`ﬀ` (4 wrong); CURED reads **exactly pdftotext's distribution**. The experiment is decisive. Let me review the launch-verify probe for the D-126a extension, then write the plan.
Parent workspace is clean. Now writing the remediation plan.
Now the TDD round. First let me understand how `bx` feeds the output (to design a RED-able spec for the empty-show cure).
我来研究一下 walk 是如何计算同一 BT 运行中连续 shows 的 px 的（这是 empty-show RED spec 的设计所必需的）。
Let me verify the empty piece survives into the decoded array (critical for the R126-C spec design).
设计已验证。现在让我来编写 session-126 的 RED specs。首先检查测试文件的导入情况。
现在正在将 session-126 的 RED specs 追加到测试文件中：
All 4 ran but I must verify the failure MODE matches the design. Let me see the full output.
The fixtures have structural bugs (font-name mismatches + object-number reindexing). Let me check the pushCandidate call sites first, then rewrite the specs correctly.
The global /Font-region scan (line 1236) feeds all region pairs as candidates — my RED mechanism holds. Now let me rewrite the specs with correct numbering and parametrized font names.
Spec 3/4's catalog points at the page instead of the pages tree (my bug), but spec 1 follows the r125-D layout exactly and still fails — the Tf name pattern may reject hyphens. Let me check.
The Tf pattern accepts hyphens. Let me debug the spec-1 fixture directly with intermediate dumps.
The r125-D fixture includes a PAD block (the ≥40-alnum guard — the r97 fixture-length lesson). My fixtures lack it. Let me confirm the guard.
找到了：`MIN_ALPHANUMERIC = 40` — 我的 fixtures（23 个字母数字）被丢弃了。PAD 块是必需的。我来修复所有这四个 specs。
**RED 3/3 + 1 born-green — the designed TDD state.** Let me verify the RED failures show the space-joined symptom (not another defect).
**RED 3/3 + 1 born-green confirmed** — all showing the designed misbind symptoms. Now applying the cures to `src/lib/cv-text.ts`.
已应用所有三个修复。现在进行 proto resync 和全套测试。
需要两处修复：R126-C 规范和 script-portability 禁用机制（我的 `r126-z-binding.ts` 导入了一个 `/tmp` 原型）。让我检查一下这两处。
The upgrade fired but the emission has spaces around the newline. Let me dump the exact output bytes.
The R119-A doctrine says the upgrade must land CLEAN ("never ' \n'") — the empty piece's separator pollutes it. The walk-back should consume zero-text pieces. Let me check the dropText emission first.
让我看看在 emission loop 中 sep 是从哪里获取的。
应用 clean-emission 修复 — 升级重置边界前零文本片段的分隔符：
现在正在修复脚本可移植性限制（我的 `r126-z-binding.ts` 中使用了字面量 `/tmp` 导入 —— `r125` 模式使用的是变量）：
**GREEN 1193/1193** (1189 + 4). Now the drift ledger on the FINAL source.
11/12 IDENTICAL, arXiv at the experiment-predicted pin `75436914` (the sep-reset changed nothing on the corpus — as measured). Now the bx census via the resynced proto + the toward/away classification.
所有口袋均已达到 **100.0% bx**。5 个数据块：4 处连字修正 + 1 处换行符插入（sep-reset 已在实际成员上生效）。让我对该换行符数据块进行趋势分类。
让我直接调试末尾的换行机制——dump 最后一部分和切片。
The "trailing newline" is a `console.log` artifact in my classify script — the real cured output needs a file-based comparison.
**最终判定：4 处变更，全部趋向于精确匹配 pdftotext 的连字分布** (ﬁ=4 ﬀ=1)。现在处理变异矩阵 —— 让我研究一下 r125 runner 模式。
让我添加 hex 端 spec（为 hex mutation 提供支撑），然后编写 mutation runner。
hex spec 在 cured 状态下呈绿色。让我通过临时的 source revert 来证明其在 HEAD 时呈红色 (RED)。
The `<>` atom never matches the walk's hex regex (`[0-9A-Fa-f\s]+` needs ≥1 char) — the empty-hx class arises from a whitespace-only atom `< >`. Fixing the spec:
The hex spec demonstrates RED-then-GREEN. **178/178 passed.** Now the mutation matrix runner.
M1–M4 精确无误。M5/M6 需要精确的终止计数。让我来识别这些故障。
**M5 kills 2** (both empty specs — the sep reset serves both); **M6 kills 8** (the odd-guard is load-bearing across 7 historical fixtures that pin odd-raw blindness). Updating the runner with the exact counts:
**MUTATION MATRIX EXACT** (M1 1 · M2 1 · M3 1 · M4 1 · M5 2 · M6 8). Now the D-126a parent-hygiene probe.
All gates green: **lint 0/0 · tsc ✓ · 1194/1194 unit** (1189 + 5 new). Now the build.
E2E 需要文档中记载的 3-chunk 前台分割（完整运行约 11 分钟 > 工具超时）。让我检查一下分块模式。
**E2E PASSED — zero failures across all 84 files** (211+176+180, matching the documented chunk protocol). Now boot the remediated server on :3200 for the live UI verify + DB pristine + screenshots.
**LIVE UI VERIFY PASSED** (name-first, dateSplit ×2, zero U+FFFD, swept by real id). Now the DB pristine check.
**DB PRISTINE** (1/1/2/0/0). Now the launch-verify probe (the standing bun .env watch).
The sandbox exports the parent's absolute `DATABASE_URL` — Leg B fails LOUDLY (no phantom created; the designed passthrough). Now the screenshots on the remediated build.
The Training link wasn't matched and the URL stayed "/" — the drawer may not have opened. Let me check the captures and debug.
The two mobile captures are identical (the click never fired). Let me run the mobile flow as a careful standalone session (the documented viewport-at-session-start trap).
**移动端导航已验证**：抽屉自动关闭（克隆的超集），URL → /training。现在进行与 REF 捕获的像素差异对比。
**Pixel parity at the standing levels**: login 0.0350% · dashboard 1 pixel in 1,024,000 · mobile-nav 1 pixel. Let me verify all captures are non-blank.
All captures verified non-blank. Now the docs layer — first the count lockstep (1189+565=1754 → 1194+565=1759).
Now the docs layer. First, updating the remediation plan's executed ToDo items:
Now the AGENTS.md session-126 layer:
Now the count lockstep updates (CLAUDE.md, README.md, AGENTS.md commands) and the SKILL banner:
Now the SKILL banner (v4.13.0):
Now the SKILL §138 section — let me check the §137 structure first.
Now the session narrative (docs/session_298.md):
Now the worklog round-125 entry:
文档层已完成。进行最终的验证检查——首先是我之前看到的 CLAUDE.md 测试表：
The tree is complete (8 modified + 25 new). Let me verify the .env.example tracking and do the placeholder scan before the commit.
一切已验证。现在让我阅读 SSH 推送技能协议，然后再进行提交。
paramiko 5.1.0 ready, no OpenSSH binary — the shim is needed. Let me read the complete Appendix A and set it up.
Let me extract the complete shim from the skill file and install it outside the repo.
The shim works. Now materialize the operator key (never inside the repo):
Key fingerprint matches the documented operator key (`4FSV1Prot+...`). Now the commit with the repo's descriptive style:
已提交 `2e04c17`。现在进行 SSH 推送 —— 先进行 dry-run，然后执行实际推送：
**已推送并验证**：远程 `refs/heads/main @ 2e04c17` == 本地 HEAD。操作员密钥已销毁。遵循仓库的惯例，本轮对话记录将作为一个单独的“更新会话日志”提交 —— 让我来写下它。
The key was shredded after the first push — re-materializing for the transcript push:
**已完成 — 已推送并验证**：远程 `refs/heads/main @ 33e56b0` == 本地 HEAD，工作区干净，操作员密钥已销毁，未创建任何新分支。让我来进行最终审查。
**会话 126 / 一致性第 125 轮 — 已完成并推送至 `main` 分支 @ `33e56b0`**（已远程验证，未创建新分支，操作员密钥已被销毁）。

## 本次会话交付内容

**问题排查（均已测量，非猜测）：**
- r126 队列中命名的 arXiv 18 项残留数据包已**完成至 100.0% bx 覆盖率**（21,503/21,503）。根本原因在于：F 前缀对扫描（pair scan）中的 `\w` **不匹配连字符** — 4 个 matplotlib 图表形式的 `f-0-0` 名称未能进入绑定映射（binding map），导致候选链将其解析为*另一个*表单的字体子集（错误对象上未覆盖 'z'，而表单自身声明的字体实际上覆盖了它）。
- 第二个根本原因：**r120 不对称性** — 页面级合并落在了 ObjStm 扫描站点，其注释指定的却是原始携带的 IRS 页面。原始站点从未接收到该合并。
- Typst 亚 em 残差已测量（1/76 + 0/73 间隙） — 输出保持不变，作为监测项延后处理。

**三个 TDD 修复方案**（RED 3/3 → **GREEN 1194/1194**，变异矩阵精确 1/1/1/1/2/8）：通用名称表单绑定（R126-A）、原始页面合并（R126-B）以及空显示零内容 + 干净的输出分隔符重置（R126-C）。arXiv 的输出偏差精确修正了 **4 个连字解码（`Pre ﬀll` → `Preﬁll`） — 与 pdftotext 精确的 4×ﬁ+1×ﬀ 分布一致**。

**保持一致性：** 第 90 次 REF 部署（登录资源更迭 — *非视觉*，捕获字节一致）；移动导航一致（REF 抽屉仍处于打开状态 = 其长期存在的回归；克隆版本自动关闭 = 超集）；像素差异处于既有水平（仪表盘：1,024,000 像素中的 1 个像素）；**无 Tailwind v4 回归**。此外：启动验证 A/B、全新的父级卫生探针（neo-crm s214 谱系）、E2E 565/565、数据库原始状态检查、8 张截图，以及完整的文档层（计划、叙述、AGENTS/SKILL v4.13.0、数量同步、工作日志 — r127 队列已准备就绪）。
