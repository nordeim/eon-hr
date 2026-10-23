我将恢复 eon-hr 项目的长期工作流。首先建立本轮 TODO 清单，然后从 `git pull` 开始执行。
工作区健康。执行 `git pull` 刷新：
工作区已刷新至 `60dc185`（新增 `docs/session_187.md`）。Session 82（parity round 81）已完整入库。现在标记任务 1 完成，开始精读文档。先看文件规模：
先完整阅读最新的会话文档与整改计划：
Session 82/Round 81 已完成并推送（`87fbae0`），本轮映射为 **Session 83 / Parity Round 82**。继续读整改计划与 worklog：
worklog 输出过大，用 Read 读取末尾部分：
Round 81 全貌清晰。现在读 AGENTS.md 的 session-82 层（尾部）、CLAUDE.md、README.md：
长行文档，用 grep 提取 session-82 关键条款：
文档层已重新锚定。本轮映射为 **Session 83 / Parity Round 82**。现在对照代码库验证 r82 修复与测试是否在位，并检查环境状态：
环境与上轮连续（.env、db/custom.db、node_modules 均在），R82-A 修复在位。继续验证 r82 工具脚本与测试契约：
对齐验证通过。检查工作树状态并运行基线门禁：
工作树干净。运行基线门禁（先检查 exported DATABASE_URL 陷阱是否活跃）：
陷阱确认：exported `DATABASE_URL` 活跃（第 6 个连续沙箱）——所有 DB 相关命令用 `env -u` 防护。lint 0/0、tsc clean。运行单元测试门禁：
941/941 unit ✓。运行 build 门禁：
Build ✓。清理陈旧服务器，启动 standalone 并验证健康：
Standalone 健康。运行 standing checks（patch watch、audit、TW-v4 扫描、secrets）：
Standing checks 全绿。检查 DB 初始状态：
数据库处于原始状态。**所有基线检查项和常规检查项均已通过**。现在进入开局读取——部署监控。首先读取 `r82-deploy-watch` 工具构造：
理解 watch 模式。先检查 agent-browser 守护进程健康，再构建 r83 watch（armed at post-55th finals）：
守护进程健康。构建 r83 部署监控（armed at post-55th finals）：
修正残留注释并运行 r83 watch：
**开局读取：双向静默 (BOTH SIDES QUIET)——第 55 代持续保持。** 登录 DOM 普查无变化（零 Turnstile）。按既定协议，在 55 代上运行完整确认流程。先读取 r82-login-probe 构造 r83 版本：
构造 r83-login-probe 并执行阶梯步骤 1：
**阶梯步骤 1 GREEN** — 登录对字节一致（`69aa4241…`）。继续步骤 2-5，查找 standing/sweep/verify 工具：
运行阶梯步骤 2-3（r52 orchestrator: standing audits + route sweep）：
0/5 + 0/12 异常——两端会话疑似 stale（REF 卡在 /dashboard 标题，LOC 读到登录页 H2）。这是已知的 r80 daemon 退化模式。先看 orchestrator 完整结构与 sweep 脚本，再诊断会话状态：
诊断明确：**两个会话都被弹回 /login**（loc 被重定向到登录页，ref 带 `from_url` 落在登录页）——ref 会话 cookie 过期 + loc 认证未持久。这是标准 stale-cookie 模式。检查 :3200 归属并按协议重认证：
loc 已重新认证（URL=/）。但 h1 读数仍为 "EonHR"——需确认 sweep 脚本到底读什么元素。先读 sweep 脚本，再重认证 ref 会话：
需要直接观察两端实际渲染。打开 loc /dashboard 读取全部标题结构，并检查 app shell 源码的 brand 元素：
真相大白：REF 会话在 sweep 期间未认证——每条路由都被弹到 /login，其 h1 正是登录页的 "Welcome to Eon HR"（30px 居中）；而 LOC 认证后的首个 h1 是侧边栏品牌 "EonHR"。先重认证 ref 会话并验证其 /dashboard 结构：
REF 认证成功且结构与 LOC 完全一致（首个 h1 均为侧边栏品牌 "EonHR"）。确认 sweep 的 DIFF 纯系 ref stale-cookie。重跑 standing audit + route sweep：
**阶梯步骤 2-3 GREEN：standing 5/5 + sweep 12/12**（stale-cookie 陷阱已退役）。继续步骤 4-5（verify-r49 + verify-r45）：
验证 r49 读取 1/13——LOC 侧全部读到登录页。查看完整输出与脚本逻辑：
全部 13 对 DIFF——系统性故障。查看首对完整读数以定位极性：
**verify-r49: 13/13 MATCH** —— 首跑 1/13 系 verify-r49 缺少 careful-retry 的 fill-timing miss（r78 教训未覆盖该旧脚本）。顺手给 verify-r49 加上重试加固，然后跑 verify-r45：
verify-r49 已加固。运行 verify-r45（阶梯步骤 5）：
**完整阶梯在 55 代上 GREEN：login 字节一致 + 5/5 + 12/12 + 13/13 + 13/13 → NON-VISUAL。** 应用 r81 陷阱协议（重认证 loc + 清理 :3201）：
协议应用完毕。读取 r82-screenshots 工具构造 r83 字节链版本：
阶梯全绿。现在进入审计阶段——按指令读取 `skills` 目录与 `catalog`，选定审计技能：
读取 `web-app-foundation` 技能与 `r82` 源码 `diff` 用于审计：
审计 r82 源码变更（commit 87fbae0 的 source diff）：
r82 diff 审计结论：干净（单一源修复 + spec + pin，全部文档化）。现在侦察本轮 fresh-eyes 角度——先查 REF 用户菜单是否有暗色模式开关，以及角色相关表面：
重大发现：REF 有 **"عربي"（阿拉伯语切换）按钮**！这是一个从未被审计过的功能表面积。先点击验证 REF 行为，再查克隆是否实现：
REF 切换后 `dir="rtl" lang="ar"` ——**阿拉伯语 RTL 功能确认存在**！深入读取 REF 阿拉伯语状态的内容翻译范围，并检查克隆是否实现该功能：
REF 的阿拉伯语切换只翻转 `dir=rtl lang=ar`（内容字符串未翻译），按钮变 "EN"。**克隆有相关代码**（sidebar-nav、layout、button）！检查克隆实现细节：
克隆已实现 RTL 切换（Session 33 R32-B）。两个从未测量的状态表面浮现：**RTL 模式 + 暗色模式**（standing 截图全部是 LIGHT+LTR）。检查 REF 的暗色模式开关：
**REF 确认有暗色模式**（html.dark + rgb(10,10,10) 背景）。两个从未测量的状态表面确认：**暗色模式 + RTL**——966 张标准截图全部是 LIGHT+LTR。这就是本轮全新审视的工具角度。先验证克隆的暗色渲染：
克隆暗色渲染与 REF 一致（html.dark + rgb(10,10,10)），THEME_BOOT 契约文档完备。**本轮 fresh-eyes 工具确定：THE DARK-MODE + RTL (THEME-DIRECTION) MATRIX**。先重置两端状态并普查切换按钮 UI：
关键发现：**REF 只有一个 عربي 按钮（80×32 @ x=104），没有可见的暗色切换按钮**；而克隆在左侧多了一个 Moon 按钮（36×36 @ x=60）。但 REF 的 darkMode 又确实生效——深入查找 REF 的暗色切换入口：
REF 的暗色切换是一个**无 aria-label 的纯图标按钮**（lucide-moon w-5 h-5）——之前的 census 正则漏掉了它。测量其精确几何与位置：
**Moon 按钮两端几何完全一致**（x=60 y=796 36×36；REF 无 aria-label = 站立既有的无名称范式，克隆 aria 为既有超集）。切换 UI 对等已锁定。现在构建暗色矩阵 + RTL 矩阵工具：
eval 命令执行失败。直接测试 READ 表达式定位原始错误：
直接 eval 正常。问题在长表达式的某处。写个快速测试打印完整错误：
找到 bug：`cs(null).backgroundColor` 在无 `<aside>` 元素的页面上抛 TypeError（这些页面的侧边栏不是 aside 标签）。先确认侧边栏真实选择器，再修 instrument：
侧边栏是 `div.group.peer`（main 的前兄弟）。看 r82 矩阵如何读 shell，沿用其选择器模式：
修复矩阵 instrument：null-safe 读数 + 正确的侧边栏选择器。先在 REF 上验证 `main.previousElementSibling` 模式：
REF 结构与克隆完全一致（div.group.peer @ x=0 w=256, main x=256 w=1184）。重写矩阵 instrument（null-safe + 正确选择器）：
**矩阵结果：dark 6/7 + rtl 6/7——每阶段一个 FIND，均在 /attendance 的 headCol**（REF 固定 slate-900，LOC 随主题翻转）。需深读分类：这是角色分歧表面还是克隆缺陷？读取两端 /attendance 的首个 h2 元素细节：
深读结果：REF 的 /attendance 在暗色模式下 **main 内零个 h2**——我的 READ 回落到 h1；而 LOC 首个 h2 是 "Today's Overview"。需确认 REF 的 h1 是什么元素、是否可见、颜色是否是其暗色主题的未完成表面：
**分类完成——零克隆缺陷**：两端 /attendance 的 h1 普查**逐像素一致**（隐藏 "EonHR" h1 + 可见 "Staff Attendance" h1：slate-900、48px、{288,84,312,96} 完全相同；类名顺序差异 = cn() merge 顺序，render-neutral）。headCol FIND 系 instrument 的 h2||h1 读取顺序伪影（REF 受限态无 h2 → 读到隐藏 h1；LOC 读到 admin 超集的 h2）。补一个几何不变性抽查：
**几何不变性精确成立**（dark 与 light 完全一致；RTL 精确镜像：mainX 0/-118，宽度和溢出不变）。按用户重点要求，验证 **390 移动端抽屉在暗色 + RTL 状态下的导航循环**：
**移动抽屉主题矩阵：完美对等**（dark: zinc-900 双端一致；RTL: dir=rtl 双端一致；功能循环 GREEN）。主题方向程序零克隆缺陷。现在为本轮新表面写契约钉子 spec——先查 playwright 配置：
编写 session83-theme 契约 spec（本轮新表面的 green pin）：
运行新 spec（应为立即 GREEN——契约钉子）：
4/5 通过。查看两个失败的详情：
两个失败均为 spec 工具 bug（about:blank 上写 localStorage 的 SecurityError + 390 下 "Welcome back" h1 隐藏）。快速验证 REF 在 390 是否同样隐藏该 h1（确认是 parity 还是异常）：
**REF 同样在 390 隐藏该 h1——对等确认**（REF-authored 行为）。修复 spec 的两个工具 bug：
**session83-theme spec: 6/6 GREEN**（5 新钉子 + 1 setup）。现在构建 r83 字节链截图工具（编号 785-889，含首批 dark/RTL 基线）：
字节链大部分 GREEN（19 轮链保持、路由/平板/边界全稳定），**但 390 移动集 7/7 双端 DRIFT**——原因是我脚本的 bug：`widthRoutePair` 统一用了高度 1024，而 r82 移动基线是 390×**844**。纯捕获几何伪影。写修复脚本以正确高度重捕移动集：
6/7 双端 STABLE，唯一 DRIFT 是 **REF 侧 /payroll @390**。LOC 7/7 稳定。疑似日期驱动的数据内容变化（r82 距今约一天）。读取 REF /payroll 页面找日期相关内容：
页面文本 "2026-10 Current Period" 是月度驱动（10 月内不变）。直接做像素 diff 定位变化区域：
diff 覆盖整页（123K px，全宽 0-765）——非小部件变化，是整页内容状态差异。连续两次重捕验证当前 REF 状态的确定性：
双捕字节一致——REF 今日 /payroll@390 状态稳定，r82 基线捕获的是另一个稳定态。且 **1440 桌面版 REF payroll STABLE**——变化仅限 390 移动渲染。做逐行 diff 定位布局位移点：
连续 diff y=21→765 = 顶部某元素高度变化导致整体下移。用行相关法估算位移像素数：
偏移不一致（-48/+11/+36/-20/-15）——非平移而是真实 re-flow。提取 REF /payroll 当前完整文本内容找变化源：
**分类完成：REF DATA-AUTHORED** —— REF 租户的 payroll 记录在两轮之间被清空（"No payroll records" 空态）；桌面 1440 捕获不受影响系记录区位于 900px 折叠线下，而 390 单列布局使空态进入视口。与 r82 的 "0 employees" 同类（租户数据被逐步清空）。LOC 侧 7/7 稳定，无需行动。

现在跑完整 E2E 门禁（407 standing + 5 新 = 412 预期）：
**E2E 412/412 全绿**（407 standing + 5 新钉子，6.7 分钟零抖动）。补跑 lint/tsc/unit 确认测试文件合规：
门禁全绿，但 DB 出现 **r45 探针用户残留**（loading-probe@example.com）——运行 r72 sweep 清理：
DB 恢复 pristine。轮末部署监控读取（第 55 代是否保持）：
**第 55 代贯穿整轮保持**（连续第二个单代轮次）。现在进入文档层。先看 AGENTS.md 尾部结构确定 session-83 层插入点：
现在写文档层。先核对 PNG 计数：
1072 PNG 精确对账（966+106）。写整改计划文档：
写叙事文档 session_188.md：
现在写 docs 补丁脚本更新五个 standing 文档（AGENTS/SKILL/CLAUDE/README/worklog）：
写 r83 docs 补丁脚本：
文档层已应用。最终预提交验证（lint 覆盖新脚本）+ 暂存提交：
122 文件就绪。创建 house-style commit：
提交 `5ee7618` 已落至 main。现在执行 SSH wrapper push 协议。先检查 shim 与 wrapper 状态：
shim 与 paramiko 就绪（r82 遗产）。物化密钥并验证指纹：
指纹匹配 standing 记录（`SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU`）。wrapper 干跑（显式 `--remote`，r81 教训）：
需要将 shim 目录加入 PATH（r82 部署的 paramiko shim）。重跑 dry-run：
Dry-run 通过（快进 `60dc185..5ee7618`）。执行正式 push：
**PUSH 完成——远程验证：`refs/heads/main @ 5ee7618 == local HEAD`。** 双重验证 + 密钥销毁 + 最后的 transcript 步骤：
远程双重验证通过，密钥已销毁。写本轮工作 transcript（session_189.md）并提交推送：
Transcript commit `20180e1` 已推送并远程验证。最终状态核查：
**Round 82 / Session 83 complete — pushed to main (remote-verified, key shredded).**

**本轮进展：**

1. **开局读取** — 第 55 代部署保持静默，完整确认阶梯全绿（登录对字节一致 + 5/5 + 12/12 + 13/13 + 13/13 → 非视觉变更）。连续第二个单代次轮次。

2. **全新视角工具 — 暗黑模式 + RTL（主题方向）矩阵** — 开启了最后一个从未测量的用户侧界面（全部 966 张基准 PNG 均为 LIGHT+LTR）：切换 UI 几何尺寸完全一致（Moon 36×36 + عربي 80×32 双端相同），几何不变形（暗黑 ≡ 亮色；RTL 镜像对称），移动端抽屉在两种状态下均完全相同且导航循环呈绿色（无 TW-v4 回归）。**零克隆引发的缺陷** —— 该状态现已锁定（session83-theme 规范，5 个测试）。

3. **门禁** — lint 0/0 · tsc · 941/941 单元测试 · E2E **412/412** 零抖动（flakes） · 19 轮字节链保持 · 首次暗黑/RTL 基准 (859-889) · 1072 张截图 · DB 原始状态（pristine）。

**工具强化落地：** verify-r49 增加了仔细重试（careful-retry）机制；REF 会话重新认证协议现已应用到每次读取前（本轮 0/5+0/12 过期 cookie 教训）。唯一一处 REF 侧漂移被归类为 **数据授权（data-authored）**（REF 租户的薪资记录在两次轮次之间被清空）。

**下一轮（r84）准备就绪：** 监控在第 55 次之后的决战中保持静默；候选切入点 —— 打印/导出工具栏操作、表单验证错误状态、键盘导航，或者对 REF 逐渐清空的租户界面进行重新遍历。
