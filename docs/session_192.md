我将恢复 eon-hr 的长期工作流。会话文档编号已推进到 session_189/190 与 remediation-plan-session83，说明 git pull 后需先核实 Sessions 87+ 的最新推进状态。先建立本轮 TODO，然后刷新工作区。
工作区已被重置（无 eon-hr 仓库）。执行重新 clone：
Clone 完成。最新 commit 显示 Session 83（parity round 82 — theme-direction audit round）已完成。现在查看关键文档存在性并精读：
Step 2：精读核心项目文档。先看文件大小，再并行阅读：
README 和 CLAUDE.md 已加载（内容较长，已保存持久化输出）。现在读最关键的当前状态文档 —— session_189、session_190、remediation-plan-session83：
session_189/190 已读：**Session 83 / Parity Round 82 已完成并推送**（`5ee7618` + transcript `20180e1`、`e75dc3f`）。本轮映射为 **Session 84 / Parity Round 83**。继续读 remediation-plan-session83 与 worklog 尾部：
整改计划已读。本轮 = **Session 84 / Parity Round 83**。携带任务：开局全阶梯（55 代或更新）+ 新 dark/RTL 基线字节比对 + fresh-eyes 前沿（打印/导出、表单验证错误态、键盘导航、或 REF 空租户重走）。继续读 worklog 尾部与 AGENTS.md 的 session-83 层：
worklog 确认：仓库处于 Round 82 收尾状态，本轮 = **Session 84 / Parity Round 83**。现在读 AGENTS.md 尾部（session-83 层）与持久化的 CLAUDE.md/README 输出：
AGENTS.md session-83 层已读。快速核对 CLAUDE.md/README 的 session-83 条款与持久化输出的关键部分：
文档层与 Session 83 完全对齐。现在对照代码库验证状态（全新 clone，环境需重建）：
环境状态确认：全新 clone —— 无 .env、无 node_modules、db/ 空。开始重建环境（标记任务 2 完成，任务 3 已完成大半，进入验证阶段）：
**陷阱确认：exported `DATABASE_URL` 活跃**（第 7 个连续沙箱，指向 `/home/z/my-project/db/custom.db`）——所有 DB 相关命令需 `env -u` 防护。创建 .env 并安装依赖：
DB 已 seed（Annual 21/21, Sick 30/30）。验证 DB pristine 状态并运行基线门禁：
DB pristine（users=1, employees=1, balances=2）。jobs 模型名不同，快速核对后跑 lint + tsc：
lint 0/0 · tsc clean。运行单元测试门禁（预期 941/941）：
**941/941 unit ✓**。运行 build 门禁：
Build ✓。启动 standalone 并验证健康：
Standalone 健康但跑在 :3000 —— 历轮脚本用 :3200。核对 r83 脚本的端口约定：
确认 LOC 约定 :3200。重启 standalone 到标准端口，然后跑 standing checks：
TW-v4 扫描 15 !important 全在 globals.css。核实 oklch 6 处是否注释内（standing 记录为 comments-only）：
环境全绿。进入 Step 5 —— 代码审计。先读 skills catalog 与 web-app-foundation 技能：
web-app-foundation 技能已完整加载（§18 TW-v4 陷阱登记、§13 测试策略、§17 反模式为审计镜片）。现在审计 r83 轮的代码变更：
r83 diff = spec + verify-r49 加固 + 工具 + 截图 + 文档（无 src/ 变更）。精读两个代码相关文件进行审计：
**r83 diff 审计结论：CLEAN，无发现**。spec 用 computed-style 断言（符合 §18 T8）、行为测试而非 source-pin（§13.5）、localStorage 自清理；verify-r49 重试幂等且有教训引注。快速验证 standing 不变量（行级 flex-wrap 零），然后进入开局读取：
行级 `md:flex-wrap` 为零（页面内 flex-wrap 均为 chip-bag 类，r81 已分类）。agent-browser 0.39.0 就绪。**Step 6：开局读取**。先读 r83-deploy-watch 构造 r84 版本：
构造 r84 部署监控（armed at post-55th finals——与 r83 相同指纹，因 55 代贯穿 r83 全轮）：
**开局读取：双向静默 (BOTH SIDES QUIET)——第 55 代贯穿第三个连续轮次**。DOM 普查无变化（零 Turnstile）。按携带任务执行完整阶梯。先读 r83-login-probe 构造 r84 版：
**阶梯步骤 1 绿色 (GREEN)** — 登录对字节一致（`69aa4241…`）。继续步骤 2-3（standing + sweep）。先读 r52 orchestrator 了解会话结构：
r52 orchestrator 只重认证 loc 会话。按 r83 新协议需先重认证 ref 会话。查 standing/sweep 使用的会话名：
ref 会话已重认证（URL=`/`）。运行 r52 orchestrator（阶梯步骤 2-3）：
**阶梯步骤 2-3 绿色：standing 5/5 + sweep 12/12 匹配**（ref 重认证协议生效，本轮无 stale-cookie 陷阱）。继续步骤 4（verify-r49，已带 careful-retry 加固）：
**阶梯步骤 4 GREEN：verify-r49 13/13**（r83 加固生效，首跑即过）。步骤 5（verify-r45，via r52-login-reaudit）：
**完整阶梯绿色 —— 第 55 代非视觉**（登录对字节一致 + 5/5 + 12/12 + 13/13 + 13/13）。应用陷阱收尾协议：重认证 loc 会话（r45 探针污染陷阱）+ 清理 :3201 + r72 DB 清理：
r72 清理失败——疑似导出的 DATABASE_URL 陷阱。检查脚本并用 `env -u` 防护重跑：
DB 清理完成（users = [sepnetflix2023]）。**开局阶梯完成，全部 GREEN。** 进入 Step 7 —— 本轮全新审视 (fresh-eyes) 侦察。r83 收尾候选：打印/导出动作、表单验证错误态、键盘导航。先侦察两端表单验证错误表面：
选择器集未命中。深查 REF 空-submit 后的 DOM 实际状态（原生 HTML5 校验 / toast / 无反应）：
REF 登录用**原生 HTML5 校验**（无自定义错误 UI）。对照 LOC 登录 + 侦察两端更丰富的应用侧表单验证表面：
登录两端原生校验对等。侦察两端应用侧表单的自定义验证表面（ richer surface ）：
LOC 自定义验证表面很薄（仅 profile + bulk-import-dialog，零 aria-invalid）——与 REF 原生校验主导一致。侦察打印/导出工具栏动作候选表面：
**重大发现：REF /attendance 有导出/打印工具栏群**（Print / PDF / Excel）——r83 收尾建议的表面确认存在！对照 LOC：
LOC 也有同群（Print/PDF/Excel 位置一致）。这是从未审计的功能表面。先查 LOC 源码实现方式：
LOC 实现：Print→`window.print()`（真实功能）、PDF/Excel→toast 占位。注释表明 Devices/Settings REF 为死按钮（已知）。**未审计表面：REF 的 Print/PDF/Excel 点击行为**。功能探测 REF 侧——先注入监听再逐个点击：
REF Print → `window.print()`（与 LOC 对等）。探测 REF PDF / Excel：
REF PDF → **无任何可观察行为**（无 print/open/toast）——死按钮候选。探测 Excel：
REF Excel → 同样无行为。**分类浮现：REF 导出群中 Print 真实（window.print）、PDF/Excel 死按钮；LOC Print 对等 + PDF/Excel toast 超集（既有文档化模式）**。构建全路由普查工具核实该分类的普适性：
**导出群普查：59 路由 label-set 全 MATCH，0 DIVERGE**——5 条路由有导出群（attendance、assetmanagement、attendancedashboard、payrollreports、surveyanalytics），两端完全一致。**唯一 FIND：/assetmanagement Export 宽度 REF 112 vs LOC 104（8px）**。深读该分歧：
机制定位：REF Export 图标带 `mr-2`（与按钮 `gap-2` 叠加 = 16px 间距），LOC 仅 `gap-2`（8px）→ 恰好 8px 宽度差。查这是否为已分类的既有分歧 + LOC 源码：
AGENTS.md:357 已有 `mr-2 + gap-2` 模式记录。读该上下文 + 探测 REF assetmanagement Export 功能行为：
**定位到克隆缺陷（R84-A 候选）**：R13-A 系统性模式（REF 图标按钮 svg 带 `mr-2` 叠加 `gap-2`）在 session-14 已钉住多调用点，但 **assetmanagement Export 是漏网调用点**——LOC `<Download>` 无 mr-2 → 104px vs REF 112px。先探测 REF 该按钮功能行为（LOC 已有真实 CSV 导出超集）：
REF assetmanagement Export → **死按钮**；LOC 有真实 CSV 导出（超集 ✓）。查 LOC 图标 16px 的来源（无 size class 却非 24px 默认）：
Button 组件 `[&_svg]:size-4` 解释 16px。payrollreports 用 `mr-1`（宽度已匹配）。核对 attendancedashboard / surveyanalytics 的 LOC 图标边距（宽度已匹配者应已带边距）：
sibling 模式确认 R13-A recipe（attendancedashboard: `mr-2`/`mr-1`）。**R84-A 缺陷确认：assetmanagement Export 图标漏 `mr-2`**。核验 surveyanalytics（已匹配 97x32）后做完整缺陷清单：
修正：该 112 读数来自仍停留在 /assetmanagement 的 ref 会话（assetmanagement Export），非 surveyanalytics。surveyanalytics 已由普查确认匹配（97x32 双端）+ LOC 源码 mr-2 ✓。继续功能分类——探测 REF 侧其余三个导出按钮：
payrollreports 有一次 `window.open("")`。分离探测 CSV 与 PDF 以精确归因：
分离探测报错。检查 ref 会话当前页面状态与按钮实际文本：
ref 会话停在 /surveyanalytics（循环最后路由）——分离探测跑错了页面。重开 /payrollreports 正确探测：
**REF 分类完成**：payrollreports CSV 死、PDF `window.open("")` 空桩；LOC CSV 真实导出 + PDF print-dialog 提示。核读 LOC 三个源文件的功能实现：
**功能矩阵完整浮现**：REF 导出群几乎全死（仅 attendance Print 真实 + payrollreports PDF 空桩 open）；LOC 全面真实 CSV 导出（超集模式首次端到端验证）。检查 payrollreports 的 print-optimized 声明是否属实（决定 PDF 按钮是否升级为 window.print）：
打印超集已存在（Session 29 R28-B/R29-C：@media print 规则 + print-color-adjust）。**R84-B 候选成立：payrollreports PDF 升级为 window.print() 一键打印**。先对 assetmanagement 全按钮群做宽度对账，确认 R84-A 缺陷孤立性：
表达式语法问题。用已验证的简单模式重试：
**R84-A 缺陷孤立性确认**：assetmanagement 唯一 Export 按钮缺 mr-2（Add Asset 134x134 ✓ 其余全匹配）。本轮发现完整。写整改计划（Step 9）：
计划已写。对照代码库复验两个修复点，然后 TDD 执行：
两个修复点验证完毕。检查 playwright 配置以正确编写 spec：
配置已明确（authed specs via storageState）。查 toast DOM 结构后编写 spec：
Toast 结构明确（`role=status` viewport + 4500ms 自动消失，PDF/Excel 描述文本不同可区分）。编写 session84-export spec（TDD RED 先行）：
**红色阶段 (RED 阶段)**：运行新 spec 确认两个修复目标失败（R84-A/R84-B RED，R84-C/D/E 应为绿色 (GREEN)）：
失败原因是**全新沙箱缺 chromium**（standing 教训：需前台先安装）。安装后重跑：
RED 确认：R84-A/B 如预期失败，R84-D/E 如预期通过。但 R84-C 也失败（预期 GREEN）——查失败详情：
R84-C 失败于 /dashboard 上找不到 Toggle Sidebar 按钮（页面仅见 sidebar 骨架）。读完整 error-context 快照：
发现 R84-C 根因：**/dashboard 在 1440 是 employee-portal 布局，无 Toggle Sidebar 按钮**（该按钮是 attendance 等管理页的 header 元素）。修正 readiness 信号为 `main`。另查 R84-E 本次快速失败原因：
R84-E 失败为瞬时 `ERR_ABORTED`（资源压力——:3200 standalone + e2e 服务器并行；首跑该测试通过）。修正 R84-C readiness 信号后重跑：
R84-C 仍快速失败。读最新 error context：
R84-C 亦被 `ERR_ABORTED` 击中——**r81 资源过载级联**（:3200 standalone + agent-browser 守护进程 + e2e 服务器三重负载）。按 standing 协议：E2E 前清场。杀 :3200 + 关闭 agent-browser，重跑：
**RED 阶段完美确认**：R84-A（112≠104）与 R84-B（无 print 调用）如预期 RED，R84-C/D/E GREEN。ERR_ABORTED 确系资源负载（清场后消失，记录为工具陷阱）。进入 **GREEN 阶段**——应用两个修复：
修复已应用。检查 payrollreports 的 toast 导入是否仍被使用（避免 lint 未用变量），然后 rebuild + 重跑 spec：
lint 0/0 · tsc clean（toast 仍有 4 处使用）。rebuild + 重跑 spec（GREEN 验证）：
**GREEN 阶段完成：5/5 全过**。重启 :3200（新 build）做修复后活体验证，然后进入字节链。先读 r83-screenshots 构造 r84 版本：
loc 会话被弹回 /login（守护进程重启清了会话）。重认证后再验证：
**修复后活体验证双绿**：Export 112×36 + mr-2（与 REF 字节对等）；PDF → window.print 单次调用零 toast。进入字节链（Step 10）。读 r83-screenshots 构造 r84 版：
r83 脚本已读。关键核查：r83 移动基线实际高度（教训：390x844 为基线契约）。验证 PNG 实际尺寸：
基线确认 390x844。查 r83 脚本是否有 844 修正路径：
r83 脚本遗留 1024 高度 bug（PNG 为事后修正捕获）。构造 r84 脚本（高度作为基线契约的一部分显式参数化）：
**字节链全绿**！查被截断的 login pair 与移动菜单循环输出：
Login 对字节一致（bd718ed0…/69aa4241…）✓，新 PNG 110 张（891-999）✓。补验移动菜单功能循环输出（standing 用户重点）：
循环走到 /training ✓。补一次干净的自关闭读数：
**移动菜单循环 GREEN**（/training + 自动关闭，无 TW-v4 回归）。字节链任务完成。进入全门禁（Step 11）——按资源教训先清场再跑完整 E2E：
**941/941 单元 ✓**。运行完整 E2E 门禁（预期 417 = 412 standing + 5 新）：
**E2E 417/417 全绿（6.8m，零抖动）**。收尾：DB pristine 检查 + 轮末部署监控 + .env.example 核对：
数据库初始状态 ✓ · .env.example 契约不变 ✓。轮末部署监控（第 55 代或更新读取）：
**轮末监控：第 55 代贯穿全轮（第三个连续单代轮次）**。PNG 对账 + 更新补救计划中的实际数字，然后写叙事文档：
PNG 对账精确：1182 = 1072 + 110 ✓。写叙事文档 session_191.md：
叙事文档已写。现在应用文档层（AGENTS/SKILL/CLAUDE/README/worklog）。先看 r83 补丁脚本模式：
模式明确。编写 r84 文档层补丁脚本：
文档层已应用。最终预提交验证（lint 覆盖新脚本 + 文件清点）：
清单完备：7 修改 + 118 新增（110 PNG + 计划 + 叙事 + 5 脚本 + 1 spec）。lint 0/0 · tsc clean。暂存并创建 house-style commit：
Commit `b7284e4` 已落至 main，工作树干净。执行 SSH wrapper push 协议。先读用法文档与 wrapper：
按协议执行 push。检查 ssh 二进制/shim 状态（全新沙箱）：
无 ssh 二进制、无 shim、无 paramiko（全新沙箱）。部署：安装 paramiko + Appendix A shim 到仓库外 bin/：
shim 已部署（/dev/stdin 空测试预期报错）。物化实际密钥到 /tmp（0600）并验证指纹：
**指纹匹配 standing 记录**（`SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU`）。干跑（shim 上 PATH + 显式 --remote，r81 教训）：
Dry-run 通过（快进 `e75dc3f..b7284e4`）。执行正式 push：
**PUSH 完成——远程验证：`refs/heads/main @ b7284e4 == local HEAD`**。双重验证（公共 https 读取）+ 销毁操作密钥：
**远程双重验证通过 + 密钥已销毁**。最后更新编排器 worklog：
**Round 83 / Session 84 complete — pushed to main (`b7284e4`, remote-verified, key shredded).**

本轮完成：工作区重置后全环境重建，第 55 代部署第三轮保持静默，全阶梯非视觉确认。全新审视工具**导出/打印工具栏动作矩阵**首次审计该表面：群成员 59/59 对等、REF 分类 1-real + 1-stub + 7-dead、克隆真实导出超集首次端到端验证。**TDD 修复**：R84-A（assetmanagement Export 图标漏 `mr-2`，104→112px 对等）+ R84-B（payrollreports PDF 升级为真实 `window.print()` 打印超集）。字节链 20 轮链保持 + **首次 dark/RTL 字节比对 7/7+7/7** + 移动菜单循环 GREEN（无 TW-v4 回归）。门禁：lint 0/0 · 941/941 unit · **E2E 417/417** 零抖动 · DB pristine · 1182 张截图。

**建议下一步（r85）**：键盘导航循环（焦点环/tab 遍历/抽屉键盘契约——r83 收尾名单最后一项）、REF 空租户表面重走、或修复证据基线 907/909 首次字节比对。
