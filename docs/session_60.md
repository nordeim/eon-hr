工作区完好。立即执行第 1 步：`git pull` 刷新。
Pull 成功，新增 `docs/session_57.md`。现在精读 5 份根文档（第 2 步）。
AGENTS.md 已精读（session-31 / parity round 30 已完成）。继续读其余根文档。
现在读取 4 份会话文档（session_56、remediation-plan-session31、worklog、session_57）。
4 份会话文档已读完。当前状态清晰：**round 30 已完成并推送（`adfc2ef`+`f661dc6`），本会话 = session 32 / parity round 31**。建立任务清单后立即继续执行。
PAD 已含 [S31] 修订。现在验证代码库状态并设置环境。
环境配置完好。检查 DB 状态并启动基线门禁。
DB 打不开——检查 db 文件状态与脚本内容。
已知教训：raw PrismaClient 需要绝对 URL。用绝对路径重跑：
**DB pristine 确认**（users=1/employees=1/leaveBalances=2）。启动基线门禁：
lint 0/0 · tsc ✓ · **464/464 unit** ✓。现在 build + E2E：
Build ✓（注意：shell 带有陈旧 `DATABASE_URL` 导出指向错误路径——已用 `env -u` 守卫，已知陷阱）。运行 E2E：
1 个 E2E 失败（legacy-assets 的 add-asset round-trip）。单独重跑查看详情：
单独跑 3/3 通过——是级联/时序问题。检查 e2e.db 是否有残留数据，再重跑全套确认：
**基线门禁全绿：lint 0/0 · tsc ✓ · 464/464 unit · build ✓ · 100/100 E2E**（首轮 1 个 flake，复跑通过；DB pristine）。与推送状态完全一致。

现在审计 skills/ 目录（第 5-6 步）：
技能目录已审计。本会话相关技能：`agent-browser`（差距探测）、`tdd`、`tailwind-patterns`（v4 陷阱）、`clone-app-pat-pro`（克隆模式）、`code-review`。项目自身已内化 v4 陷阱知识（docs/Tailwind-V4-Validation-Report.md）。

现在启动常设审计。先看上一轮探测脚本的模式与 agent-browser 可用性：
工具链齐备。启动 ：3200 standalone 服务器并认证双会话：
双会话认证完成。查看上轮验证脚本的常设审计部分，然后写本轮审计脚本：
写本轮常设审计脚本前，先找 12-route redeploy 扫测的路由清单：
模式齐全。写 Round-31 常设审计脚本：
两个 DIFF 均疑似探针伪差（REF 侧边栏为 div 结构、kicker 可能滚动偏移、drawer 未打开）。查看上轮 sidebar census 的选择器与流程：
上轮 navmap 探针同样用 `aside button, a` 但当时能读到 REF。我的审计中 REF 读空 + kicker 差 12px——疑似会话状态/时序伪差。写一个复核探针（新开页面、充分等待、含滚动复位）：
Kicker 复核：**双侧 y=101 MATCH**（先前 89 是未稳定的瞬态）。navmap 探针崩了——改用上轮的双 stringify 模式修复：
REF 桌面侧边栏是 div 结构（无 `<aside>`）。查看 round-30 的第二个 navmap 探针如何定位 REF：
用 round-30 的 div.min-h-screen 模式重写完整 navmap 对比（折叠态 + 展开态 roots 865/905）：
**Sidebar navmap 字节级一致**（折叠 141→621、展开 577→829、roots 865/905；仅 LOC 图标按钮 aria-label 为文档化 a11y 超集）。补验 round-30 的 drawer border（审计中 drawer 未打开成功）：
**Round-30 修复保持**（drawer border 1px rgb(229,229,229) 双侧一致）。

✅ 常设审计全绿：redeploy 12/12 · mobile chrome（tabs/kicker/drawer border）· REF zero-data · sidebar navmap 865/905。

现在执行 **Round-31 新探测——系统性 orphan-route hunt**。最系统的路径：从 REF 的 JS bundle 提取完整路由表：
登录页只有 auth chunks。用已认证的 ref 会话收集完整 chunk 清单：
主应用 bundle 在 `/assets/index-C-IrDy5f.js`。拉取并提取路由表：
主 bundle 只有 9 条路由字符串，其余为懒加载。改从运行时 router 提取——在 ref 会话里枚举 React Router 路由表：
找到关键结构：页面注册表 `Expenses:J5e, HRAssistantChat:jze...` 与路径函数 `We()`。提取完整注册表与 `We` 定义：
页面注册表找到了。提取完整清单与 `We()` 路径函数：
**重大发现**：从 REF bundle 提取出完整页面注册表（61 个页面名）与路径函数 `We(name)="/" + lowercase`。对照克隆的 47 条路由，有 **14 个候选 orphan 路由**。列出克隆路由清单并逐一活探 REF：
克隆 47 条路由确认。写 orphan-route 探针，逐一活探 REF 的 14 个候选路由：
**14 个候选路由全部在 REF 上返回真实页面（零 404）**——这是比 /assets 大得多的 route-coverage 差距。分类：

- **10 个真实页面**：/careers（公共招聘页）、/employeeportal（入职状态）、/externaljobapplication（公共职位页）、/hrassistant（AI 助手）、/payrollai、/payrollreports、/requestreports、/requestsettings、/shiftswap、/tenantsetup（设置向导）
- **2 个 dashboard 别名**：/organizationsetup、/dynamicdashboard（渲染 EmployeePortal 内容）
- **2 个空白桩**：/home、/employeedetail

深入测量各页 DOM 结构以规划复刻。先验证别名与空白桩的真实行为：
边界情况清晰：/home、/employeedetail 永久空白桩；/organizationsetup、/dynamicdashboard 是 Dashboard 的真别名（连 title 都是 "Eon HR"）。现在对 10 个真实页面做全面结构化 DOM 测量（构建契约）：
eval 返回异常。调试单路由看错误：
找到 bug：eval 字符串里的 `//` 注释在 join 成单行后把整个表达式注释掉了。去掉注释重写：
全部 10 页测量完成。审查测量数据：
数据丰富。需补充关键细节：各路由的 shell 存在性、/careers 的职位数据（REF 有真实数据！）、/hrassistant 结构、空白页根类。继续深挖：
关键发现：全部 14 路由都在 app shell 内；/careers 数据动态波动（空态才是契约）；/employeeportal 与 /tenantsetup 是渐变画布上的居中卡片。检查 schema 中可复用的模型以规划功能超集：
查看 StaffRequest 与 SecuritySettings 模型结构，决定 requestsettings 页的功能接线方案：
方案定型：新增 `ShiftSwap` + `ApprovalConfig` 两模型，14 路由全复刻。补最后测量：/hrassistant 头部细节 + 全部新页移动端扫测：
/hrassistant = 居中 kicker pill + 居中 h1（max-w-4xl）。移动端全部为标准 chrome、无特殊 kicker。最后补测 /careers 空态卡片（其数据波动，空态才是契约）：
测量阶段完成。现在验证代码库模式（以 round-30 的 /assets 页为最近先例），然后写修复计划：
模式全部就绪。现在写修复计划文档（Step 9）：
计划已写。开始 TDD——先看 session-31 pin 块的模式，再写 session-32 RED pins：
Pin 模式清晰。查看测试文件头部 helper，然后写 session-32 RED pin 块：
**RED 确认：16/16 新 pin 全部失败**（327 旧 pin 通过）。开始 GREEN。先加 schema 模型并 push：
Schema 已同步。写两个 API 路由：
检查 parseBody 签名确保 API 用法正确：
签名正确。更新 meta.ts 并开始构建页面：
现在是 14 页。先构建简单的页面（空白 + 别名），然后构建实际页面：
空白桩与别名完成。查看 PageHeader 完整 API 以正确使用 recipes：
写 10 个真实页面。先查 chat 与 jobs API 模式以复用：
模式齐备。开始写 10 个真实页面（每页 + layout）：
接下来是 /externaljobapplication 和 /careers：
接下来是 /hrassistant（单窗格聊天）：
现在是 /requestsettings 和 /shiftswap：
更新 R25-A4 路由计数 pin（47→61）并运行测试：
7 个失败均为 pin 字面量与实现的匹配问题。逐一修正（页面类序对齐 REF、pin 正则适配多空格、raw h1 页改 pin 断言）：
修复撇号转义与模板字面量匹配问题：
**343/343 unit GREEN**（+16 新 pin）。运行 lint + typecheck：
PATCH 处理器用错了解构模式。修复：
tsc ✓。写 E2E spec（orphan-routes）并扩充 navigation 扫测：
/ 和 /employeedetail 空白页不宜进 heading 断言扫测——放进专用 spec。查看 legacy-assets spec 的模式后编写 orphan-routes.spec.ts：
Build ✓ 全部新路由编译。运行完整测试套件：
480/480 单元 ✓。4 个 E2E 失败需要调试。查看 navigation 断言模式：
/employeeportal 与 /tenantsetup 无 h1（REF 亦然——测量确认 h1: NONE）。移出 ROUTES 数组，加专用断言（/chat 先例）：
两处测试侧修复：严格模式（exact: true）与 level-1 定位：
第一个 combobox 是 Category 选择器而非 approver 选择器。改用 nth(1)（approver select）：
orphan-routes 10/10 ✓。运行完整 E2E 套件确认总数：
**全门禁绿：lint 0/0 · tsc ✓ · 480/480 unit · build ✓ · 121/121 E2E**（+21）。

现在 live 双浏览器验证——重启 ：3200（新 build）并运行 14 路由对比扫测：
LOC 全部报 "This page couldn't load"——:3200 服务器在新路由上出错。查日志：
原因找到：**旧服务器未被杀死**（EADDRINUSE——新服务器启动失败，旧 build 仍在服务）。ShiftSwap 表已存在 ✓。彻底重启：
新服务器就位（307 = 认证重定向，正常）。重新认证并复跑 live 验证：
4/4 别名+空白 MATCH，3 页头 MATCH。剩余 7 个 DIFF 为像素级偏移。对 REF 做一轮针对性精测：
精测数据齐备。应用 7 项修正（icon 顺序、h2 20px、mt-3 sub、手写 payrollreports 头部、mt-0 sub、tenantsetup 圆形图标 + h-11 输入框）：
11/14 MATCH。externaljobapplication 差 40px（图标上方需 pt-12）、tenantsetup 差 5px、careers 为 REF 数据波动（已文档化）。先量 LOC tenantsetup 定位 5px 来源：
定位清晰：v4 的 space-y 翻转（trap 6）使 circle 的 mb-4 覆盖了 space-y 间隙（REF v3 = 22px 叠加），加上表单区差 16px。修正三处：
externaljobapplication 还差 16px。直接量 LOC DOM 定位：
卡片顶部差 16px：REF 头部到卡片的间隙是 48px（space-y-12）而非我的 32px。修正：
**13/14 字节级 MATCH**（唯一 DIFF = /careers 的 REF 实时数据波动，h1+hero 一致，零数据契约已验证——文档化）。跑回归扫测确认无破坏：
两个 DIFF 均为已知探针伪差（audit 脚本的 aside 选择器不适配 REF 的 div 结构 + drawer 点击瞬态）。用专用探针复确认：
全部回归绿。运行最终全量 E2E（页面微调后）：
**121/121 E2E ✓ · DB pristine ✓**。捕获本轮截图（Step 12）：
截图完成（全部有效尺寸）。更新文档链（Step 13）——AGENTS.md session-32 层：
更新各文档的计数与版本。先 AGENTS.md 头部命令表：
写 session 日志对（58 正式 + 59 工作日志）、计划完成记录与 worklog：
现在处理仓库 worklog 条目：
所有文件就绪。最终门禁已在文档更新前验证（480/480 + 121/121 + build ✓，此后仅改 .md）。现在 commit + push。先读 SSH wrapper 用法：
流程清晰。先 commit，再执行 SSH wrapper push：
无 ssh 二进制——按 Appendix A 部署 paramiko shim 到仓库外：
远端有新提交（非 fast-forward）。fetch 查看差异：
远端在 f661dc6，本地 99bf223 领先——应为 fast-forward。检查分支状态：
状态正常（ahead 1，应可 fast-forward）。重跑 dry-run 看完整输出：
找到原因：wrapper 默认推到 `task-management.git`（其原始项目）。需显式传 `--remote`：
Dry-run 干净（f661dc6..99bf223 fast-forward）。执行真实 push：
**Push 成功并已验证**：远端 main @ `99bf223` == 本地 HEAD，操作密钥已销毁。更新外层 worklog 并收尾：
**Session 32 / parity round 31 — 全部 15 步执行完毕并推送到 main @ `99bf223`**（远端已验证，操作密钥已销毁）。

## 本轮核心成果：orphan-route hunt（孤儿路由猎捕）

**方法突破**：直接从 REF 的 SPA bundle（`/assets/index-C-IrDy5f.js`，2.2MB）提取出完整页面注册表 `VKe={61 keys}` + 机械路径函数 `We(name)`，与克隆的 47 条路由交叉比对——一次性发现 **14 条 REF 在服务但克隆 404 的路由**（此前所有审计都看不见它们，因为侧边栏没有链接）。

**全部恢复**：
- **10 个真实页面**（逐一实测 1440×900 + 390×844 后字节级复刻）：/careers、/employeeportal、/externaljobapplication、/hrassistant、/payrollai、/payrollreports、/requestreports、/requestsettings、/shiftswap、/tenantsetup
- **2 个 dashboard 别名**（/organizationsetup、/dynamicdashboard）+ **2 个空白桩**（/home、/employeedetail）
- **功能超集**：新增 `ShiftSwap` + `ApprovalConfig` 两模型及 API——shiftswap 请求闭环、审批配置闭环、tenantsetup 的 Company PATCH、真实聚合 + CSV 导出均有 E2E 证明

**验证**：lint 0/0 · tsc ✓ · **480/480 unit (+16)** · build ✓ · **121/121 E2E (+21)** · live 13/14 字节一致（唯一差异是 /careers 的 REF 实时数据波动，已文档化）· 回归扫测全绿 · DB pristine · 9 张新截图（127 总计）。

**下一步建议**：路由覆盖已完整，前沿收窄为——with-data 表面（等 REF）、移动手势深化（swipe-to-open）、延期的 print-button 决策；也可复查截图 102-108 或运行 `bun run dev` 亲测新路由。
