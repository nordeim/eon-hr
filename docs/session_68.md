# Session 68 — Working Log (the session-35 execution narrative)

工作区被重置（上一会话结束后的沙箱回收）：fresh clone at cafc05b
（session_34 的 owner 补推了 session_66.md 叙述稿）。.env 重建
（file:../db/custom.db + 新 AUTH_SECRET）；bun install；db:push +
db:seed（pristine users=1/employees=1/leaveBalances=2）；五份根文档 +
四份会话文档（session_64/65/66 + remediation-plan-session34 +
worklog）全部复读；基线门禁全绿（lint 0/0 · tsc ✓ · 507/507 ·
build ✓ · 135/135）。

本轮普查（frontier 逐项）：**dialog-interior 维度**（loans + assets
——REF 零数据下仅有的两个可测对话框，首次几何级盘点）+ **deep-RTL**
+ payrollreports tab contents + 移动端导航常检。REF CSS chunk 未变
（index-BGNH4KkS.css）→ 全部为克隆侧差距。

- **asset 对话框 4 处真差距**：杜撰的描述行（"Register a new
  company asset."）；Type+Serial 应为 2 列行（223+223）而非全宽堆叠；
  Add 按钮多一个 Plus 图标（126 vs 102px）；DialogTitle 行高 28 vs
  REF 18。
- **loans 对话框 2 处**：分期金额是普通中性 DIV（REF：P 16px/600/
  blue-700）；Paid From 杜撰 placeholder。
- **deep-RTL 头条发现**：REF 桌面侧栏在 عربي 模式下**不镜像**——
  fixed 绘制面板（left:0/right:1184 两方向恒定）+ 透明 in-flow peer
  占位（随 dir 镜像）。round-32 的"RTL mirror matches"验证量的是
  PEER（它镜像）——aside 选择器伪影的桌面孪生。像素证据：REF RTL
  的 x=0..256 = #FAFAFA+蓝色 active link，x=1184..1440 = 画布渐变
  空带。
- **payrollreports tabs 仍然 inert**（重新验证）→ 接线即超集。
- 非差距：移动端 chrome 逐字节一致（drawer 288@x0 / header 73h /
  tabs 766y+78h）；wizard 空提交契约一致；required 矩阵一致。

TDD：session-35 RED 块 14 pin → GREEN：dialog.tsx（leading-none）→
assets（H2-only 头 + grid-cols-2 行 + 纯文本按钮）→ loans（分期 P +
裸输入框）→ app-shell（peer spacer + fixed 面板）→ payrollreports
（受控 tabs + 三张卡）。

**实测驱动的三轮追加**（census-then-verify 循环的产出）：

1. **v4 inline-label 塌陷的对话框级泛化**：REF 的 v3 space-y-2 在
   控件上落 margin-top（实测 12px gap）；v4 把 mb 挂在 INLINE label
   上被忽略（4px）。两个对话框全部命中 → 每个控件显式 mt-2。
2. **新 v4 陷阱——Radix 原生 select 的 last-child 陷阱**：Radix 在
   trigger 之后渲染隐藏原生 `<select>`，于是 trigger 不再是
   :last-child，v4 的 space-y 把 mb 挂在 TRIGGER 上（单元格内幻影
   8px；REF 的 v3 `* + *` 从不如此）→ Select 结尾的包裹层去掉
   space-y，mt-2 独挑 12px。grid 单元格 76→68px 的追因测量直接
   定位到该元素。
3. **对话框遮罩**：验证截图发现遮罩过浅——REF 的 overlay 是
   rgba(0,0,0,0.8)（bg-black/80），克隆的 shadcn 默认 /50（白底上
   rgb(125) vs REF rgb(51)）→ 全局修正 + pin。
4. **侧栏表面勘误（round-32 误测的纠正）**：REF 可见侧栏表面 =
   内层 bg-sidebar div（浅色 #FAFAFA——LTR+RTL 像素验证；深色
   #18181b——computed，并非 slate-900）。round-32 的"authored
   bg-white"量的是被完全遮盖的 fixed 容器 → aside 改回 token（与
   抽屉同表面），R32-A4/R30 pin 演进。

E2E：dark-mode.spec 的 RTL pin 演进（aside x=0 fixed + peer gap +
main 1024@1280 视口）；新 payrollreports-tabs.spec（5）+ 新
dialog-interiors.spec（2）——两轮 locator 修正（tab 名与卡标题同名
的 strict-mode 歧义 → getByRole("paragraph") 过滤；getByLabel("To")
子串命中 Toggle Sidebar → exact:true）。

门禁：lint 0/0 · tsc ✓ · **521/521 unit（+14）** · build ✓ ·
**142/142 E2E（+7）**。Live：两对话框逐元素字节一致（asset
512×372 全对齐；loans ±1px）；遮罩 1 unit；RTL pair 表面一致
（2-4% 文字边界噪声）；深色侧栏 #18181b 双端一致；移动端 chrome +
navmap 逐字节一致。截图三轮重拍教训：REF 会话的 dark/RTL 状态在
评测间漂移（遮罩像素 rgb(51) 暴露了 stale dark 状态；LOC 的 121
拍到了未关的对话框叠加层）——每次拍摄前显式校验
`document.documentElement.className` + 对话框关闭态。11 张新截图
（121-127）→ 156 PNG。DB pristine。

文档链（AGENTS session-35 层 + 521/142 计数、SKILL 3.18.0 + §47、
PAD [S35]、CLAUDE 663-pyramid、README 156 captures、
session_67/68、worklog、计划完成记录）→ commit + SSH wrapper push
到 main。
