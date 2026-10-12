我立即开始执行本轮指令（第九个会话，避免再次空转）。先刷新工作区，再精读文档。
工作区存在。现在执行 `git pull` 刷新：
Pull 成功（a6d028b → 2d8fd6e，新增 session_43.md）。现在精读会话文档（最新的 session_42/43 + remediation-plan-25 + worklog）：
Session 42/43 已读：上一轮（Parity Round 24）完成 a11y 维度审计 + bell popover 修复并已 push（a6d028b）。现在读 remediation-plan-25 和 worklog 尾部：
上下文完整。这是 **Session 26 / Parity Round 25**。上轮（Round 24，a11y 维度）已推送至 `2d8fd6e`。前沿建议：SEO/meta 维度（从未扫描）、reduced-motion、表单错误面（被 REF 零数据阻塞）等。

现在检查环境状态并快速验证根文档：
环境完好：`.env` 正确、db/custom.db 存在、依赖已装。快速验证根文档关键部分 + DB 状态：
DB 干净（users=1, employees=1, leaveBalances=2, payroll=0 — Expense 实为 ExpenseClaim）。现在跑基线门禁（lint → typecheck → unit），同时查 skills 目录：
Lint 报 1 个错误 — 可能是我刚加的 `scripts/r25-dbcheck.js`。查看详情：
是我的一时性诊断脚本所致。删除它恢复 lint 基线：
基线：lint 0/0 · tsc ✓ · 420/420 unit ✓ — 与 `2d8fd6e` 状态完全一致。现在后台跑 build，同时读 README/PAD 验证对齐：
README 对齐确认。现在快速查看本轮核心维度（SEO/meta）的现状 — 根 layout 的 metadata：
Clone 仅有根级 metadata（title + description），无 og/favicon/逐页 metadata。本轮核心维度选定为 **SEO/meta 维度**（session_42 建议的从未扫描新维度）。

先看既有 probe 基础设施以复用模式，并检查 build 进度：
Probe 模式已明确。Build 进行中 — 先写本轮核心的 **SEO/meta 头部普查 probe**（复用既有模式）：
Build 进行中。同时检查 public/ 与 login 页头部相关现状：
Build 进程被静默终止（后台进程未存活）。前台重新跑 build：
Build ✓（46 路由全部动态渲染）。启动独立服务器于 :3200 并验证：
服务器就绪。认证双浏览器会话（严格用 `127.0.0.1:3200` 避免上轮的 cookie-origin 教训）：
认证失败。调试两个会话的登录页状态：
REF 邮箱已填但密码未填上（已知的密码填充不稳定问题）。补填密码并点击登录：
REF 会话 ✓。现在处理 LOC 会话：
服务器又死了。检查日志并重启：
服务器存活（next-server pid 15555，自改名）。重新认证 LOC：
双会话认证 ✓（REF + LOC 均在 /dashboard）。开始**常设审计 #1：redeploy check**（12 条规范路由）：
**Redeploy check 12/12 通过** — REF 自上轮未变。常设审计 #2：移动端导航（用户重点）：
Tabs/drawer/kicker MATCH。两个 DIFF 读数是上轮已记录的 probe 伪影（REF 侧边栏是 div 基）。用上轮的**品牌锚定 probe** 验证：
探测未命中。直接调试 REF 的 390px 视口状态：
REF 有 “Toggle Sidebar” 按钮。直接测其几何：
顶条 MATCH 确认：REF [24,16,342,40] 透明 + 按钮 [24,22,28,28] — 与 LOC 完全一致（r24 探测器要求 aria-label 或 lucide-menu 而 REF 用的是隐藏文本，伪影根因已明确）。现在验证 800px 边界的品牌位置：
800px 品牌位置 MATCH（x=76 y=25 双端）但宽度 REF=155 vs LOC=66。检查 REF 的 H2 内容：
**移动端导航审计通过**：顶条 342×40 + 汉堡 28×28 + tabs + drawer + kicker + 800px 边界全部字节一致，无 Tailwind v4 bug。常设审计 #3：with-data 复检：
三项常设审计完成。现在执行**本轮核心：SEO/meta 维度普查**（13 条路由全 head 清单）：
**SEO/meta 普查发现重大差距**：REF 有完整的逐页 title/og/twitter/canonical/icon/jsonld 合约，而 clone 全部缺失（title 恒为 "Eon HR"、无 og、无 canonical、无 icon link — 连 favicon 都没接上）。

现在转储细节（twitter 标签名、og:image 完整 URL、jsonld 内容、完整 description）：
完整合约已明确。检查 clone 的 `eon-logo.png`（可用于 og:image）并补转储 login 的 jsonld 第三项与完整基础描述：
Login jsonld = WebSite + Organization + BreadcrumbList；app 路由 = 前两项。`eon-logo.png` 是 1563×1563 方形 logo。快速查看 REF 的 og:image 渲染效果：
Logo bbox 比例一致（2.56 vs 2.58）— 同一 logo。取 REF 的 manifest.json 作参考：
完整合约已获取（含完整基础描述与 manifest 结构）。现在检查路由清单与 login 页结构，为 codemod 做准备：
Login 是 client component — 需要一个 `login/layout.tsx` 服务器包装来承载 metadata。列出全部 46 个应用路由：
检查 (app) 页面是 server 还是 client component（决定 metadata 导出方式）：
关键发现：大多数 (app) 页面是 client component（不能导出 metadata）→ 需用**逐路由 layout.tsx** 模式（Next 惯用法）。读取 (app)/layout.tsx 与 recipes.test.ts 的 session-25 块作为插入锚点：
锚点齐备。现在编写本轮修复计划 `docs/remediation-plan-session26.md`：
计划已存。验证代码库对齐：检查是否已有冲突的 per-route layout，并枚举 codemod 目标：
路由清单确认：46 个 (app) 页面 + login + logout。检查 vitest 别名支持后写 RED pins：
Vitest 支持 @ 别名。查看测试文件结尾并追加 session-26 RED pins：
修正一个设计问题：manifestJson 在 describe 顶层读取会让整个测试文件崩溃（RED 噪音过大）。移入测试体内：
修复 R25-A4 中的 `require`（ESM 下不可用）— 改用顶层 import：
Now run RED verification:
**RED 确认：12/12 新 pins 失败于正确位置**（现有 283 保持绿色）。开始 GREEN。先生成资产族（PIL 脚本）：
资产生成 ✓。现在创建 `src/lib/meta.ts`（机械规则助手）：
补上 pin 要求的 twitter.card（每路由自述更稳健）：
Now the root layout rewrite (generateMetadata + JSON-LD + site defaults):
Root layout 完成。现在写 `login/layout.tsx`（REF 平台壳分布的登录特例合约）：
修正 pin 中的字段名错误（Next API 用 `alt`，非 `imageAlt`）：
Now `public/manifest.json` and the 44 per-route layouts codemod:
46 个路由布局生成。运行单元测试验证 GREEN：
实现正确（REF 的 og:title 是完整 "Employees | Eon HR"），pin 写错了期望值。修正 pin：
twitter:title 同理修正（REF 实测 "Employees | Eon HR"）：
**432/432 单元测试通过（+12）**。跑 lint + typecheck：
Lint 0/0 · tsc ✓。构建：
Build 干净，standalone 携带全部新资产。运行 E2E（86 specs）：
**全部门禁通过：lint 0/0 · tsc ✓ · 432/432 单元 · 构建 ✓ · 86/86 E2E**。重启 :3200 服务器（陈旧服务器教训）并做活体验证：
认证又遇填充不稳定。逐个排查 — REF 先：
双会话重新认证 ✓。现在写**本轮活体验证 probe**（13 路由头部合约逐项对比 REF）：
**Titles 13/13 完美匹配** — 但 Next 的 metadata 合并行为与我假设不同（子 openGraph 整体替换父级）。转储 LOC 实际渲染的 head：
og:url 已绝对化但 canonical 未解析、og:type/site_name 被子级替换丢失。转储 login head 看遗漏项：
Login head 接近完美（theme/manifest/og dims/alt 全在）— manifest 渲染为相对路径是我的 probe 检查过严。真正缺口：og:type/site_name 被子级整体替换（需在 helper 内自述）+ login 缺 canonical。实施修复：
Now strengthen the pin (og:type/siteName per-route 是合并行为的必要自述) and fix the probe's canonical/manifest expectations:
重新跑单测 → 重建 → 重启 → 复验证：
ogType/ogSite 已修复。查看 canonical 实际渲染值：
乌龙 — canonical 一直就是绝对路径（Next 确实会用 metadataBase 解析它）；run 1 的 login 失败只是缺 alternates（已补）。probe 期望改回绝对形式：
**完美：13/13 titles 字节匹配 + 13/13 结构 OK**。现在跑回归 — 几何 12 路由扫描 + 移动端 + E2E 复跑：
移动端无回归（DIFF 读数是已记录的 probe 伪影 — 本轮早前已字节验证）。E2E 复跑：
**全部门禁绿色**。现在采集本轮证据截图。查看现有截图命名：
98 张 PNG（95+3 新证据）。现在更新文档链。先看 AGENTS.md 的 session-25 层结构：
写入 AGENTS.md 的 session-26 层 + 更新各文档计数：
更新 SKILL.md（版本 3.9.0 + §38 + 计数）：
TOC 无需扩展（既有惯例）。更新 CLAUDE.md 与 README.md：
现在更新 PAD（[S26] 行 + Last Updated + 计数）：
写会话日志 `docs/session_44.md`：
Now the remediation plan completion record + worklog entry:
验证 `.env.example` 一致性 + 最终门禁：
全部门禁绿色，`.env.example` 无需变更（metadataBase 来自 headers()）。提交：
删除误生成的 `--full-page` 杂散文件后提交：
已提交 `037b8f6`。现在设置 SSH wrapper push — 先读用法文档：
程序明确。检查 wrapper 默认 remote 与 ssh 可用性：
无 ssh 二进制，paramiko 5.0.0 可用，需显式 `--remote`。检查既有 shim（外层 ssh-push 目录）：
Shim 已就位（`/home/z/my-project/ssh-push/ssh`）。写入操作员密钥并验证解析：
密钥解析成功（ed25519）。Dry-run 测试：
Dry-run 通过（`2d8fd6e..037b8f6` fast-forward）。执行真实 push：
**Push 成功并验证：remote main @ `037b8f6` == local HEAD。** 销毁操作员密钥 + push 后冒烟测试：
Push 后冒烟全绿 — SSR HTML 直接携带 `<title>Employees | Eon HR</title>`（爬虫可见）。更新外层共享 worklog 并做最终状态确认：
全部完成。调用 Complete 标记本轮代码开发交付：
**本轮（Session 26 / Parity Round 25 — SEO/meta 维度）已完整执行并推送至 main @ `037b8f6`**，remote 已验证，密钥已销毁。

**核心成果**：
- **审计**：13 路由 head 普查发现 clone 全面缺失（title 恒为 "Eon HR"、无 og/twitter/canonical/JSON-LD、连 favicon 都未接线）；逆向出 REF 的机械逐页规则（"Taskmanager | Eon HR" 这类 slug 模式）
- **修复**：`src/lib/meta.ts` + 46 个逐路由 layout + headers() 驱动的 metadataBase + 自托管资产族（og-image/icons/manifest）+ JSON-LD 三件套
- **验证**：13/13 titles 字节一致 + 13/13 结构 OK；门禁全绿（**432/432 单元 +12 · 86/86 E2E**）；移动端导航复核无 Tailwind v4 bug（上轮 probe 伪影已根因定位）

**建议下一步**：下轮前沿可选 reduced-motion、表单错误面（仍受 REF 零数据阻塞）、拖拽/键盘快捷键维度；也可先查看截图 83（本轮证据报告）确认 head 合约效果。
