# Session 65 — Working Log (the session-34 execution narrative)

立即执行，不再规划空转。git pull 带入 session_63.md（上一会话的
叙述稿）——确认 round 32 已推送（753f1d9 + 889cda3），本会话 =
**session 34 / parity round 33**。五份根文档 + 会话文档全部复读，
基线门禁全绿（lint 0/0 · tsc ✓ · 493/493 · build ✓ · 133/133），
standing audits 复跑干净（4 个 DIFF 全部命中已记录伪差；深色
drawer 经专用 probe 复核 MATCH）。

本轮普查（census）：**round-31 接线的九个页面的 at-rest DOM 清单**
（按钮/输入/文本盘点——R31 只审了 h1+hero）+ 表单错误维度
（login 错误面，从未审过）。发现：

- REF 资产指纹未变（index-BGNH4KkS.css）→ 差距是克隆侧漂移。
- **/payrollreports**：统计卡漂在过滤栏上方（REF 在汇总卡内）；
  3 个深色 active tab（REF 4 个白色 token 契约 + 缺 Custom）；
  无月份选择器、无表头、空态文案不同；canvas 色错（蓝靛 vs 石板蓝）；
  WhatsApp 按钮图标错（Send vs MessageCircle）。
- **/requestreports**：缺 4 张分区卡（Requests by Category 等）+
  Request Log 表；tile 类名漂移（shadow-sm/border-slate-200 vs
  默认 shadow/token border）。
- **/requestsettings**：审批区结构完全不同（克隆多了 Category/
  Select approver，缺 REF 的 name/email 输入与 Add Limit 行）；
  表头未带图标（Shield/Users）；标题居中 vs REF 左对齐。
- **/shiftswap**：多了 REF 没有的 "Request Swap" 头部按钮；空态
  文案两 tab 应同为 "No swap requests in this category"；tab 药丸
  缺 REF 的白底描边容器。
- **/payrollai**：空态缺 CircleCheckBig + "All Clear!"；CTA 是蓝色
  默认变体且位置低（REF：绿色渐变、badge 行 y=32）。
- **/careers**：缺页面自身 canvas；hero 缺 max-w-6xl 容器与搜索框
  （h=220 vs 302）；副标题 blue-200 vs blue-100；缺 Browse H2；
  芯片几何漂移。
- **/login**：错误面是手写 P（REF 是 shadcn Alert——red-50/70 半透明
  + red-200 边 + rounded-xl，368×54）；整个登录卡片纵向结构从未
  审计（py-10 vs p-4、双块 vs 单包裹、noValidate 破坏 REF 的
  HTML5 空提交拦截）。
- **/settings**：3-unit 边框微差（border-slate-200）。

TDD：session-34 RED 块 14 pin → GREEN 逐页重建。三轮实测修正：
(1) 药丸类名顺序对齐 REF 字面量；(2) thead 补 uppercase；(3)
WhatsApp CTA 的**渐变覆盖陷阱**——默认变体的 CTA 渐变是背景图，
会盖住 className 里的 bg-green-600（tailwind-merge 无法跨
bg-image/bg-color 组去重）→ `bg-none`；像素级复核（PIL 采样 +
VLM 双盲）抓到并修复。同类修复：requestsettings 的 Add/Add Limit
→ dark 变体（#171717 实色）。

**v4 新陷阱（本轮引擎课）**：v4 的 space-y 把 margin 挂在
`:not(:last-child)` 上——若首子元素是 INLINE label，其
margin-bottom 垂直方向被忽略（v3 是给后续块加 mt）→ 标签到输入框
的间距静默塌陷。命中两次（login 字段、payrollreports 过滤器），
修法：后续块显式 `mt-*`。**组件课**：shadcn 子组件必须用 cn 合并
className（AlertDescription 初版丢弃 text-red-700，被 E2E 颜色
断言抓到）。

几何对齐的连环修正（每轮实测驱动）：login 栈（label leading-5 +
input mt-1.5 → card 842/pw 683/signin 751 全对齐）；Back 按钮
（默认 ghost sm 85px + ArrowLeft mr-2 h-4，两页 h1 x=385/465 对齐）；
payrollreports 过滤器（space-y-1 + select mt-1）+ tabs/card 的
space-y-4 包裹 + 卡头重构（inline Calendar + flex gap-2 flex-wrap
右块 + FileSpreadsheet/FileText mr-1）；requestreports 右控件
gap-2；requestsettings level 行 space-y-2 + limits 网格 mb-4 +
图标化卡头；shiftswap tab 容器；payrollai actionsStart + green
变体 + Sparkles 图标。

E2E 演进：shiftswap 往返改经 "n" 快捷键；requestsettings 改填
name+email；新增 login-error.spec（Alert 几何 + lab()/rgba()
双序列化接受 + 空提交 HTML5 契约）；auth.spec 的旧 P 选择器演进。

门禁：lint 0/0 · tsc ✓ · **507/507 unit（+14）** · build ✓ ·
**135/135 E2E（+2）**。Live：verify-r33 **19/19 MATCH 0 DIFF**
（payrollreports/requestreports/requestsettings/shiftswap/payrollai
的按钮+颜色+几何清单全部字节一致——payrollai 的唯一 DIFF 是已
记录的 to-right/90deg 序列化伪差）；login 栈 + Alert 对 MATCH；
standing audits 持平。11 张新截图（114-120）→ 145 PNG。DB pristine。

文档链（AGENTS session-34 层 + 507/135 计数、SKILL 3.17.0 + §46、
PAD [S34]、CLAUDE 642-pyramid、README 145 captures、session_64/65、
worklog、计划完成记录）→ commit + SSH wrapper push 到 main。
