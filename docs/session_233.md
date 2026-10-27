# Session 233 — Session 103 raw execution transcript (Parity Round 102)

工作区已重置（eon-hr 目录为空）。按协议重新 clone，执行 fresh-workspace intake：bun install · .env（两变量契约）· db:push/db:seed（1 user / 0 candidates）· 生产构建 · :3200 boot（node-spawn 分离协议）· playwright chromium-1248 重装。

文档层精读：session_230 + session_231 + remediation-plan-session102 + worklog + AGENTS/CLAUDE/README/PAD/SKILL + skills-catalog（web-application SKILL 全文）。

基线门禁第一跑：**lint RED** —— scripts/r102-analysis-card.mjs:121 未终止字符串（上一会话在门禁运行之后提交的半成品 shell-escaping 修补）。**R103-A**：DELETE 命令先构建为变量再执行，lint 0/0 恢复。"gate 只证明它运行那一刻的树"—— 记为本轮第一课。

基线门禁（修复后）：lint 0/0 · tsc ✓ · 1028/1028 unit · DB pristine。standing scans 全清。

Opening read：REF QUIET at the 67th state（两个指纹均未变）；mobile-nav 跨侧配对 PARITY（REF 28×28 hamburger + 288×844 fixed drawer；clone 同几何 + a11y 超集；菜单循环 /training + AUTO-CLOSED）；REF-broken 移动端集合保持；neo-crm 推进到 session-191/192 —— CRM-only（联系人/账户创建对话框 + CRM 登录/落地页），无可采用模式；**方法论迁移执行**：D-192 id/for 字面奇偶校验 census 跑在 eon-hr 登录面 —— PARITY 保持（autoComplete 为超集）。

Frontier hunt（第 9 家族）：Google Docs CV 模板导出（Producer "Skia/PDF m158 Google Docs Renderer"）。census：Tj=0/TJ=0 但 Tm=626 —— 文本显示为 hex 形式。提取产物 = **word-per-line 汤**（每个词被 \n 分隔）+ 12 个 kern 分词（"COMP ANY"、"W ith"、"Of fice"、"Pr ofessional"）。dump 内容流：每词一个 BT 块 —— `Tm(1 0 0 -1 ex ey)` + 常量基线 `Td(tx, -14.2578125)`；分词为同 BT 内 `Td(前半宽度, 0)` 继续显示；词间隙是显式空格字形。

第 10 家族：martino-lualatex.pdf（LuaTeX-0.80 开发者简历）。提取产物 = **字母汤**（1,012 runs —— "N o v . 1 5"、"I n k r e m e n t"）。dump：每字形单码 TJ 数组 + 独立 Tm。Tm 形状 census 全语料：gdocs 全部翻转 [1 0 0 -1]；arXiv 也有 94 个翻转 Tm + 常量 ty（-12.21）—— **操作符层面不可分**，判别必须看 Tm 平移增量与 Td 时序。

原型迭代一：Tm 增量规则初稿用 Td 累加位置对比 —— Skia 同行词的常量基线 ty 污染比较基准，改 **origin-to-origin**（lastTm 对 lastTm）。初稿 freshRun 条件写反 —— 重命名 shownSinceTm 并反转。gdocs 修复生效（词正确空格连接，alnum 不变）。

原型迭代二：LuaTeX 字母汤 1012 → 0，但 **38 个融合词**（"WebAPIonthebackendandRazor"）。测量 Tm 增量分布（3,400 个同行增量）：字母步进 0.2–0.95em（众数 0.5–0.6），词间隙 = 字宽+0.25em 空格 → 0.25–1.15em —— **完全重叠，无阈值可分**。1.0em 为经验最优（38 融合 vs 1012 汤为巨大净改善），残留按 r100/r102 先例记录为 watch。

原型迭代三：空格字形条件 join 初稿（"任何空格 piece ⇒ 所有 gap join"）—— **arXiv 回归：350 词融合**（pdfTeX 同时写少量空格 piece 和 -322 TJ 内部数字 gap）。**fromKern 限制**：TJ 内部数字 gap 是写作者的显式意图，永不条件化 —— 修复后 arXiv 0 融合、alnum 不变。

全语料回归（原型）：IRS 5,871 / pitt 24,464 / tisch 42,379 / stanford 38,339 / arXiv 67,744 / lo 641,482 / 691,268 全部 IDENTICAL；dummy guard pin 保持；gdocs 完全可读；martino 0 汤。1028/1028 全绿（原型完全向后兼容）。

写整改计划 docs/remediation-plan-session103.md 并对照代码库验证（pdfWithObjects helper 可承载全部 fixture 形态）。

TDD RED：3 个新行为 spec（Skia word-per-line、同 BT 分词、LuaTeX 字母汤）—— pristine 上 3 RED 精确如设计；3 个 guard born-green（pdfTeX 每行 Tm 步进、IRS 旋转 Tm、fromKern 规则）。一个 fixture 教训：Skia spec 初稿 32 alnums 未过 40 守卫（r97 教训第七次应用）。

TDD GREEN：应用修复 → 45/45 → **1034/1034**（1028 + 6 净新）· tsc ✓ · lint 0/0。

突变证明：M1（Tm 规则中和）→ unit 精确 2 RED；M2（条件移除）→ unit 精确 2 RED；M3（fromKern 移除）→ unit 精确 1 RED。每支恢复后验证。

E2E fixture 审计（spec 之前）：live 计算 scorer 前 24 关键词。**初稿教训一**：1 字符拆分前缀（"s|ystems"）通过 scorer 的 4 字符前缀规则杀死关键词，但 1 字符部分也是亚 em（0.55em）—— 继续显示走 standing join，不触碰条件路径 —— 第一轮 M2 E2E 支路 2/2 通过（无牙齿）。**重设计**：3 字符前缀（"sys|tems"—— scorer 侧 min 长度 3<4、代码侧 1.4em≥1.0）。**初稿教训二**：builder 用 codeOf.get("sys")（多字符 → undefined，部分静默消失）—— 改 hexOf。离线 verify（构建精确字节跑提取器 + scorer）：FIX matched=15/63%/38 vs M1 9/38/23 vs M2 11/46/28。

E2E born-green：chromium-1248 重装后 2/2。突变 E2E 支路（每支先 REBUILD）：M1 → 1 RED ✓；M2 → 1 RED ✓。M3 E2E 支路按文档化 split 走 unit 层。

Live post-fix verify：:3200 杀旧进程（server.js 进程号）→ REBUILD → 重启 → Skia+LuaTeX fixture 走真实 UI（tab → 选岗 → 上传）→ **分析卡片渲染审计预测的精确数字**（"r103 live cv" + AI 38/100 + Skills 63% + 15 个关键词全中）→ API 行持久化（38/63）→ 候选人清扫（DB pristine）。mobile-nav 配对在修复后构建上复验（PARITY，菜单循环绿）。证据链：5 张 r103 PNG。

最终门禁：lint 0/0 · tsc ✓ · 1034/1034 unit · build ✓（env -u）→ 最终 E2E 门禁分离运行（556 specs）。

文档 lockstep：计划执行附录 + session_232.md 叙事 + session_233.md 实录 + AGENTS session-103 层 + SKILL v3.90.0 §115（被忽略的操作符、流约定排他性、未门控工件、双阈值 fixture 牙齿、被测量的死路）+ CLAUDE/README/AGENTS 计数 lockstep（1034 + 556 = 1590）+ 双 worklog 条目 + .env.example 验证不变。

## Round complete — Session 103 / Parity Round 102 landed ✅

第 9 与第 10 真实 writer 家族（Google Docs/Skia —— 最常见的简历导出路径 —— 与 LuaTeX）暴露同一根缺陷（walk 盲重置 Tm），三腿修复全部 TDD 完成并双层突变证明。gdocs 文件从 word-per-line + 12 分词 → **完全可读**；LuaTeX 从 1,012 汤运行 → **0**。全部语料 alnum 计数 IDENTICAL。live UI 渲染审计的精确预测数字。REF 保持在第 67 状态；mobile-nav 双侧 PARITY；R103-A 未门控 lint 破损修复。全五门绿。

**建议下一步**：docs/session_232.md 的 r104 队列 —— CV-flow 的五个 watch（/Differences 重映射、非默认 Tz/Ts、LO 负向字距、正向 gap writer、LuaTeX 窄尾词隙的双遍宽度表）、第 12 家族猎捕（macOS Quartz、XeTeX）、standing ladder。
