# Session 62 — parity round 61: the dark-mode border-color family

工作区被沙箱重置 — 从 `4cd0aa4` 重新克隆（round-60 的落地 + session_126 叙事）。按协议重建环境（bun install、.env（DATABASE_URL="file:../db/custom.db" + 生成的 AUTH_SECRET）、db push + seed、playwright chromium），随后跑基线门禁。

基线门禁全绿：lint 0/0 · tsc ✓ · 858/858 unit · build ✓ · 314/314 E2E（4.6m，无 flake）。

部署监控：**检测到第 25 次登录侧部署** — 登录 JS `Bt_cFPps`→`Doo5f9jm`（外加一个新的 `frontend-config` chunk），登录 CSS 与 app 侧静默。按协议触发确认阶梯：standing 5/5 + sweep 12/12 + verify-r49 13/13 + **verify-r45 13/13 — 第 25 次部署是非视觉重建**。

第 61 轮普查：**暗色边框颜色层**（r62-border-census.mjs — main 内每个可见边框元素的四边计算 border-color，按钮 INCLUDED（此前任何普查从未读过按钮边框），49 条路由配对实时暗色读取，去重 (tag|color) 集合比较；可见性过滤：rect 非零 + 边宽>0 + 样式≠none）。三批跑完：**修复前 29/49 MATCH，20 个 DIFF**。

20 个 DIFF 逐一元素级分解（r62-probe.mjs 清单 + r62-probe-cmp.mjs 对称类集合差）：

- **dashboard**：Customize 按钮的 session-3 冻结字面量 `border-[#e5e5e5]`（光模式测量被冻结，不翻转）— REF 按钮走翻转的 border-input token（暗色 #262626）。
- **securitysettings**：Checkbox 边框走 `border-primary` — 但克隆的 --primary 是 nav 蓝重用（#1877f2 双主题），REF 的 checkbox 边框走 REF 自己的翻转 --primary（**#171717 光 / #fafafa 暗 — 双主题偏差**，光模式下也错，任何 fill/text 普查都看不见）+ Enabled 徽章的 green-200 **oklch 漂移实测**（lab(92.42% -26.47 12.94) vs rgb(187,247,208)）。
- **loans/training/offboarding**：REF 的页面卡片带显式 `border-slate-200`（暗色下保持浅色边框，不翻转），克隆的卡片走翻转 token（暗色 #262626）。
- **attendance**：三个彩色边框动作按钮（Devices cyan-300、Settings slate-300、Dashboard blue-300）+ 报表卡三层结构（Card > p-4 > flex gap-4 items-center）+ 统计卡的 hover:shadow-lg transition-shadow 成员缺失。
- **recruitmentkanban**：REF 的五列是**分阶段配色**（slate/blue/amber/green/red 的 border-2 + bg 对，flex-shrink-0 w-64 包装 + p-3 + min-h-[400px]）— session-11 把 Applied 列的 slate 泛化到了全部五列（r59 单列测量盲区再现）。
- **shiftcalendar**：th 缺 border-b border-slate-200 bg-white + 周末变体（bg-slate-50 text-slate-400）。
- **assetmanagement/payrollmodule**：REF 表头行带 `border-b border-slate-200 bg-slate-50`；**recruitment**：REF 把边框放在 THEAD 上（共享 TableHeader 的 `[&_tr]:border-b` 在该页需中和）。
- **profile**：徽章是 DIV（克隆是 span）+ 两张卡片缺 border-slate-200。
- **compliancedashboard**：At-Risk 卡缺 border-slate-200 overflow-hidden；严重度卡片是**两层结构**（边框在卡上、p-4 text-center 在内层 — 克隆是拍扁的）。
- **companywall/hrletters/analytics**：空态卡缺 border-slate-200 家族成员；textarea 缺 `resize-none`（REF 2/2 实测）。
- **employees/careers/interviewassistant/onboardingtemplates**：数据叶子与文档化超集（不修）。

整改计划写入 `docs/remediation-plan-session62.md`（R62-A..K + 遗留 pin 修订清单 + 文档化豁免 + 验证计划），对照代码库逐站点验证后 TDD 执行。

TDD：15 个 unit pin（recipes.test.ts 的 R62 describe 块）先 RED（15 failing / 711 old green），随后 GREEN 修复：Customize 字面量退役、checkbox 字面量对、四个调色板 pin、九张卡的 border-slate-200 家族、attendance 三按钮 + 报表卡 + 统计卡 hover、kanban 分阶段列（含包装 div 重构）、日历 th + 周末变体、两处表头行配方、recruitment `[&_tr]:border-0`、profile 徽章 DIV、严重度卡两层结构、textarea resize-none。三个遗留 pin 修订到实测真相（R48-C2b checkbox、R59-B kanban 配置行、R39-E1 textarea 基座）。unit 873/873。

E2E：`tests/e2e/session62-border-colors.spec.ts`（14 条 chromium spec，计算边框真值，双主题适用处双读）— 首跑 7/14，修复 spec 自身的三处缺陷（setDark 需先 goto 到应用源、Settings 按钮的 strict-mode 歧义用兄弟轴定位、kanban xpath 用 ancestor 轴、bg-slate-50 期望值 #f8fafc 而非 #f1f5f9）后 14/14。session-49 的 R48-C2 spec 修订。全套：327/327（session-58 switch/checkbox 文档化 flake 中途触发一次，隔离 5/5 复验确认）。

修复后普查（三批）：**44/49 MATCH** — 与计划投影完全一致；剩余 5 个 DIFF 全部为文档化豁免（employees 种子数据叶、attendance admin 超集、interviewassistant r48-C1 超集卡、onboardingtemplates 404 `<a>` 超集、careers REF 演示数据）。DB pristine 1/1/2（loading-probe 用户清扫）。

截图：20 张配对证据（294–313 对：kanban 分阶段列、attendance 三按钮 + 报表卡、securitysettings checkbox 边框、loans 空态卡、shiftcalendar th、assetmanagement 表头、compliance 严重度 + At-Risk、dashboard Customize、profile 卡 + 徽章）→ 496 文件，全部哈希验证互异（310 对初拍撞哈希 — 暗色下 LOC 的 attendance 页无滚动内容，改用元素级截图重拍）。

文档：AGENTS session-62 层 + r62 仪表经验（含**截断类字符串陷阱**：tw-merge 重排成员，170 字符前缀比较会产生假成员差 — 必须比较排序后的成员集合）+ Commands 计数（873/327）、CLAUDE 金字塔（1200 = 873+327、40 个 spec 文件）、README（327 ×2 + 873 + session-62 E2E 尾行）、SKILL 3.45.0 §72 + State 行、本日志、计划的完成记录、worklog。

**Round 61（内部会话 62）完成并推送。** 边框维度至此普查完毕 — fill（浅/暗）、text（浅/暗）、border（暗）三维全部覆盖；剩余的文档化字节差异（tabs/select 的 neutral 字面量 vs token）与 --primary token 重映射留给后续轮次。
