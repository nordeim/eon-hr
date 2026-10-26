Session_218.md 和 remediation-plan-session95.md 存在 —— 第 95 轮（parity 第 94 轮）已经落地（commit `2f3cfd3`）。所以这一轮是 **Session 96 / Parity Round 95**。让我阅读一下上一轮的结案文档。
现在我已经完全掌握了上一轮的关闭情况。接下来是 **Session 96 / Parity Round 95** —— 即 r96 队列。让我来阅读整改计划和关键项目文档，以便重新进行全局梳理。
已完全了解上下文。现在让我重新锚定核心项目文档（AGENTS.md、SKILL.md 技能、README）。
让我先检查一下 AGENTS.md 中关于 session-95 的内容，确认远程同步，并验证环境。
Remote 已在 `2f3cfd3` 同步 —— session 95 已完全落地。本轮任务：**Session 96 / Parity Round 95**。让我检查一下环境状态并阅读最新的 SKILL 课程部分。
exported-DATABASE_URL 陷阱再次生效（沙箱导出了一个指向父目录的绝对路径）。让我验证一下 repo DB 的状态并读取最新的 SKILL 课程（§106/§107）。
数据库完好，且符合植入的租户契约（1 个用户，3 个职位：系统管理员处于激活状态 + 2 个 HR 草稿，0 个候选人）。现在让我来制定待办事项列表并运行基线检查。
Lint 0/0 · tsc ✓。接下来进行单元门控。
995/995 unit ✓ — 匹配 session-95 的关闭状态。现在开始构建 gate。
构建 ✓ 116/116。现在进行 E2E 基准测试——首先检查 chromium 和 playwright config。
配置已确认。正在以分离模式启动 E2E gate（node-spawn 协议 — 它必须单独运行）。
E2E 运行中 (25/0)。在通过的同时——进行标准的并行审计：`patch watch`、`TW-v4` 扫描、`secrets` 检查。同时正在检查 `skills` 目录。
现在开始进行例行审计，同时运行 E2E。首先检查 patch watch 和 TW-v4 扫描。
补丁监控：`next` 16.4.3 已发布（仓库版本锁定在 16.4.2 —— 根据常规策略维持现状，稍后记录）。现在开始 TW-v4 扫描和密钥检查。
扫描结果：TW-v4 正常（oklch 仅出现在文档注释中），secrets 为零。现在进行 agent-browser 的初始读取。让我检查一下工具和 REF 站点。
agent-browser 0.39.0 已就绪。现在开始读取 —— 部署监控（自第 64 次部署 `index-CI-M8KyE`/`index-ByKl99Mk` 以来的 REF 登录资产指纹）。
App-side bundle 在记录的 fingerprints 处 QUIET。现在进行 login-page 配对。
**检测到第 65 次登录部署** —— 登录 JS `index-CI-M8KyE` → `index-Cb4GrjTt`（CSS 在 `ByKl99Mk` 处保持不变）。根据协议，必须触发常规流程。让我先找到流程工具。
剧本归档保持完好。让我检查一下 `login-pair` instrument 和 `boot3200` protocol。
**Ladder step 1 GREEN** — 第 65 次部署的登录页面字节一致（`69aa4241…`）。正在检查 E2E 进度，随后启动 :3200 独立实例以进行后续的 ladder 步骤。
:3200 已启动。现在进行 ladder 步骤 2+3 —— 即经过身份验证的会话。我来检查一下 `verify` 脚本协议。
verify-r49 会启动浏览器会话——必须等待 E2E 完成（这是 E2E 并发资源类问题）。与此同时，进行源码端的工作：边界界面的源码审查。
很好 —— 我现在明白了 kanban 的源码。r96 边界重测了 REF 的 403 损坏的创建路径（以防它已修复），并测试了克隆的 working-pipeline 内部实现。在等待的同时，我先查看一下 E2E 的进度。
E2E 182/0。正在准备队列 #3 —— 移动端溢出（mobile-overflow）源端普查：查找所有选项卡式（tabbed）路由及其选项卡列表（tablist）标签。
统计结果显示有 6 个 tablist 候选对象超过了 390（settings/evaluations/staffrequests/profile/payrollreports/attendance）。我来检查一下哪些对象已经完成了移动端验证。
staffrequests = 单个触发器（无风险）。实际候选对象：**settings (7个标签页)， attendance (3个带图标标签页)， profile (4个标签页)**。接下来是 neo-crm 技术栈模式检查。
neo-crm 的 stack 一致（next 16.4.2 HOLD，TW 4.3.3，recharts 3.10.1）。它们第 187 次会话的关键发现是：**the v4 space-y INLINE-FLOW variant**（按钮行掉落 8px —— 解决方法为 `[&>*+*]:mt-2`）。让我扫描一下 eon-hr 中是否存在相同的陷阱系列。
该 trap family 有 14 个启发式候选项 —— 其中真正的可疑对象都需要进行实时的 cross-side 读取。让我检查一下 E2E 的进度，并查看运行中的 leading 候选项。
误报 —— 两者都有 `li` (block) 直接子元素；`button` 是一个更深层的后代。让我直接检查其余部分。
select.tsx 的按钮采用了 `w-full flex` (块级) — 也是安全的。**结论：v4 space-y 内联流扫描 → 0 个真实实例**（所有子元素均为块级；既定的修复方案涵盖了实际案例）。现在我来起草本轮的整改计划。
E2E 已完成 398/0。正在准备 REF 端的 R96-A 探测（在 E2E 完成后运行）。
在 E2E 完成的同时，正在准备 R96-C 移动端溢出（mobile-overflow）普查脚本。
546/547，在 session93 WhatsApp 对话框规范中有 1 处失败。根据 r95 协议：在诊断之前，先在空闲机器上重新运行故障规格。
Casualty 在空闲机器上通过了 13/13 的测试 —— 资源压力级别，基准保持在 **547/547**。现在进行 R96-C 移动端普查。
登录未能跳转（仍停留在 /login — 达到了速率限制或时机未掌握）。正在进行诊断。
手动登录成功（URL → `/`）。脚本中出现了计时上的小问题。正在使用 carefully re-auth 重试模式（即 verify-r49 的经验）优化脚本。
发现 bug —— 在双引号内包含 `$Abcd1234` 会被 bash 展开为变量（变为空值）。我之前的调试中使用的是单引号。正在修复脚本。
6 个溢出路由！settings 1003 / attendance 943 / profile 539 / payrollreports 583 / compliancedashboard 451 / **recruitment 550（一个 r95 回归问题？）**。Tablist 是 settings/profile/payrollreports 上的主要原因；attendance/compliancedashboard/recruitment 的正文中还有其他溢出内容。让我获取完整的 recruitment 细节，然后检查 REF 自己的移动端状态。
找到了——我的 `eval` 字符串中包含一个 `//` 注释；`split("\n").join(" ")` 的单行化操作把它后面的所有内容都注释掉了。正在移除 `eval` 表达式中的注释。
招聘选项卡列表显示为 **未换行**（3 个同行触发器，w439）——但 r95 修复版本在 pill 上放置了 `flex-wrap`。让我检查一下源码，看看 r95 到底修改了什么。
`flex-wrap` 确实在源码中，但在 390 宽度下没有产生*效果* —— 有其他东西强制将页面的 `min-content` 变为了 550，所以 `pill` 在 518 的可用宽度下从未换行。正在运行 r95 的 `progressive-hide bisect` 以找出原因。
单个 `max-w-7xl` 包装器——`bisect` 必须深入一层。正在扩展到该包装器的子节点。
bisect 针对的是 wrapper 本身，而非其子项。正在修正深度设置。
**已找到根本原因**：`div.space-y-6`（Tabs 块）强制设为 550。再往下细分一层 —— 即 tablist 与 tab content。
**根本原因已定位**：applicants TABLE（6 列，最小内容约为 550）通过 flex-1 main 的 min-width:auto 将页面撑宽了。让我检查一下代码库中标准的 table-wrapper 模式。
`overflow-x-auto` 是标准做法（共 17 处使用），但招聘模块中缺失。让我通过实验进行测试——实时注入此修复并测量。
基准线不一致 —— 可能是认证频率限制（约 8 次登录）。正在检查。
触发了认证速率限制（约 15 分钟内进行了 9 次脚本登录）。正在重启 ：3200 以清除内存中的限制器。
**已解码**：(b) `main` 上的 `min-w-0` 释放了 flex `min-width:auto` 陷阱 → 页面 390，pill 进行换行，而 (a) `overflow-x-auto` 使表格在局部可滚动。现在进行一致性校验：`REF` 在 390 宽度下在这些路由上渲染什么？
**惊艳对齐**：REF 在所有 6 条路由上的溢出情况在字节级完全一致（1003/943/539/583/451/550 — 相同的 `scrollWidths`，相同的 `tablist` 宽度 971/471/507/551/331/439，相同的 `trigger` 位置）。这些不是 `clone-authored divergences` — 而是 REF 自身忠克隆的移动端行为。此外值得注意的是：现在 REF 在 390 宽度下可以渲染 /recruitment（`r95` 文档记载的 “~640 以下为空” 的说法不再成立）。让我也重新检查一下其他记录在案的 `REF-broken` 移动端路由。
REF-broken 移动端设置保持不变（hrreports/interviewassistant 为空；selfservice/detail 为外壳）。但 **REF /recruitmentkanban 在 390 处 = 1376 宽** — 并且该克隆未经过人口普查。正在检查克隆的值。
转义问题 —— 改用 `computed styles` 代替 `class selectors`。
资源耗尽（`pthread_create` 失败）—— 这是已记录的线程耗尽问题。正在清理残留的浏览器进程。
:3200 服务器已宕机（可能是由于资源耗尽）。正在重启。
**FULL PARITY**：位于 1376 的 LOC 看板 = 位于 1376 的 REF（相同的 5×256 列）。所有被标记的路由在字节上完全一致。再进行一次确认 —— r95 的声明是 “REF 在 ~640 以下渲染为空”；今天 390 可以渲染。正在检查 640-767 的 sub-band。
REF 在所有宽度下均能渲染 /recruitment —— r95 的 "empty below ~640" 声明现已过时（重新分类）。移动端统计完全关闭。现在进行 R96-A：REF 的 Add Applicant 创建重新测试。
对话框打开了，且七个标签完好，但职位选择是一个自定义组合框（“Select job”按钮），而不是原生的 select —— 我的填充操作未生效，因此提交按钮按设计保持未激活状态。现在开始驱动实际的组合框。
组合框（combobox）已打开，但显示为零选项——即 r95 记录的失败。正在通过原始 DOM 读取来验证，以排除选择器不匹配的问题。
**已确认**：REF 的列表框已打开但未渲染任何内容 —— 挂单（creation path）无法完成。r95 分类结果依然成立。现在进行 R96-B：通过端到端对话驱动流程，处理克隆代码中带有申请人的内部管道。
探测基本顺利完成——但脚本运行了两次（创建了 2 个候选人，只删除了 1 个——仍保留 1 个），且两次读取失败（操作菜单 + `interviewassistant` 的选择使用了错误的 `selector`）。现在先清理残留。
DB pristine. Now the two corrected reads — the Actions dropdown menu + the interviewassistant combobox (Radix, not native).
`interviewassistant` 组合框在有数据时可以正常工作（选项：`Unassigned` + 候选人）。Actions 下拉菜单需要点击 `native CDP`（`Radix` 需要 `pointerdown`）。重新进行探测。
快照包含行，但正则表达式不匹配。正在检查实际的快照标签格式。
找到了 —— 标签包含 `[expanded=false,`（我的正则表达式漏掉了它）。现在点击触发器并读取菜单。
**Actions 菜单已解码**：项目 `Interviewing/Offer/Hired/Rejected/Remove`（移动到菜单 + Remove），geo x1267 w128。证据已捕获。正在清理 + 检查证据链。
证据链已建立，数据库处于原始状态。现在进行阶梯步骤 2+3 —— 即现有的阶梯 (verify-r45, verify-r49, 路由扫描, 实验)。
常驻审计 5/5 + 路由扫描 12/12。现在进行 verify-r45 和 verify-r49 的读取。
验证 r45 13/13 + 验证 r49 13/13。完整阶梯状态为 GREEN。现在开始运行实验检测（通过 `/api/frontend-config.js` 协议进行的暗带监测）。
实验系统已激活（`tagline` 变体，v19）。最终常规监控 —— `recharts` 网格类 `census`。
再次发生线程耗尽 + LOC 读取到 0 张图表。正在清理，然后直接检查 `attendancedashboard`。
The :3200 rate limiter fired again (~12 logins). Restarting and re-running the grid census as the final LOC read.
**recharts class 保持不变**：LOC 23+7 对比 REF 16+7（已记录的 2.x-vs-3.x 残差，图表数量 5=5，水平方向 7=7）。该轮的前沿任务已完成。让我验证一下 `git state` 和 `research/ignore status`，然后撰写文档层。
**users: 2** — 异常（原始合约 = 1）。正在排查是谁创建了第二个用户。
已记录的 `loading-probe` 产物（源自 ladder-rest 的 standing audits，在 :3200 上运行）。正在将其清除。
DB 已清理。现在开始处理文档层 —— 首先是该计划的执行附录。
下面是本轮的总结文档。
现在是 AGENTS.md 的 session-96 层。让我检查一下 session-95 的层结构。
Now the SKILL.md version bump + lesson section.
现在进行 SKILL.md 头部版本更新。
Version line 已完成。正在检查 CLAUDE.md/README.md 的数量对齐情况（数量未变 — 本轮没有新增测试）。
Counts unchanged and correct. Now the worklog entry, then commit + push.
已提交 `0f6e679`。现在进行 SSH-wrapper 推送——首先阅读指南。
工作区中没有密钥材料（根据协议已销毁，且重置已将其清除）。正在检查是否存在任何活跃的凭证路径。
SSH 部署密钥不在此沙箱中（它在过往会话中由操作员提供，根据协议已销毁，且上下文摘要不包含密钥）。提交已在本地 `main` 分支的安全状态——在密钥到位之前无法推送。让我更新 worklog 和 plan 以反映确切的推送就绪状态。
**Session 96 / Parity Round 95 — 已完成并提交**（`0f6e679` + 文档提交 `50a7c0f`，比 origin 领先 2 个提交，DB 干净，所有检查项均通过）。

本次轮次——**首次纯验证 + 分类会话**：在 6 个被标记的路由（settings 1003、attendance 943、profile 539、payrollreports 583、compliance 451、recruitment 550、kanban 1376——tablist 宽度和触发器位置像素级一致）上与 REF 实现**零克隆作者偏差和字节级完全一致**。关键发现：REF 自身的移动端溢出与我们的相同，因此“干净的 pill-wrap”将是*偏差*，而非改进——该前提已被撤销。克隆端带有申请人的内部结构验证了端到端工作正常（对话框 → 看板卡片 → 表格行 → 操作菜单 → 面试助手组合框 → 移动端 390）。REF 的添加申请人（Add Applicant）创建功能仍然从根本上损坏（职位组合框打开时列表框为空）。还注意到：REF 修复了其在 /recruitment 上的移动端渲染（r95 声明已撤销——该平台正在积极修复其移动端带宽）。

**一个阻塞问题**：**SSH 推送需要你的部署密钥**——它不在当前的沙箱中（过去会话中由操作员提供，根据协议已销毁）。本地 main 分支上的提交已准备就绪；一旦你将密钥具体化（粘贴到 `/tmp/deploy.key`，`chmod 600`），我将进行 dry-run（试运行）→ 推送 → 通过 wrapper 验证。需要我在这里粘贴一次密钥，还是先继续进行 r97 队列（AI CV 实际文件解析流程，看板列内 DnD）？
