工作区已被重置（eon-hr 仓库随沙箱一同消失），且上一窗口的 session-40 工作未提交——根据任务书重新克隆仓库（远程库处于 round-38 状态 `2e74e0d`），环境重建（bun install · .env（生成的 AUTH_SECRET）· db:push + db:seed · playwright chromium），并确认 shell 层的 `DATABASE_URL` 覆盖陷阱依然存在（构建时未设置）。

基准门禁全部通过：lint 0/0 · tsc ✓ · 598/598 unit · build ✓ · 167/167 E2E —— 与记录的 round-38 状态一致。当前窗口：**session-40 / parity round 39**。

重新部署监控：REF 的登录 JS chunk 已再次重新部署（`BYE5Ojxh` → `Cqb_n9sO` → `BIuE7r17` —— 连续第三次仅限登录的部署；登录 CSS 和两个应用 chunk 未变）。常规审计 5/5 通过（在使用 Escape 重置模式后，抽屉对 288px @ x=0 字节一致）。

本回合在三个战线进行检测——所有数据均基于两个应用重新实测（中断会话的发现已重新验证，而非盲目信任）：

**战线 1 —— 登录重新审计**：社交按钮去掉了 `type="submit"`（REF 渲染 type:null ×3）；登录被证实为**主题无关（theme-inert）**（启用 `darkMode="true"` 后，该键值在存储中得以保留，但 html.dark/dir 从未被应用 —— 登录构建版本未包含主题引导；应用页面在登录后引导 —— 两端均已验证）。

**战线 2 —— 全局 Input/Textarea/Select 迁移**（一次静默的 round-19 后重新部署，在贷款对话框中捕获）：v4 shadcn 系列 —— bg-transparent、text-base md:text-sm（移动端字体维度）、静态 shadow-sm、ring-1 offset-0、file:text-foreground；Textarea min-h-[60px]；SelectTrigger + shadow-sm + ring-offset-background + focus: 前缀。登录页面通过显式计数器保持了迁移前的系列（两构建分离）。Careers hero `pl-12 py-6 text-lg bg-white` (h=50)；tenantsetup 去掉了陈旧的 h-11。

**战线 3 —— app-shell 重构**（REF 的 shadcn Sidebar 架构）：非类名根节点 > group/sidebar-wrapper（内联 --sidebar-width: 16rem）> 画布；sidebar 作为 div.group.peer（非 aside —— REF 未在任何地方使用 aria-hidden），包含 RTL 间距符 + 固定面板（bg-white 容器，内部 data-sidebar=sidebar 绘制 bg-sidebar token）；header 位于 main 内部；所有页面内容均在 `flex-1 overflow-auto` 滚动容器中；底部导航作为画布的子元素。Toggle 采用 v4 Button 系列 + data-sidebar=trigger + sr-only span（保留了 a11y superset）。品牌块嵌套（flex-col gap-2 外层 > row > flex-1 min-w-0 容器，拉伸至 155px + truncate p 子元素）。Print superset 迁移（转义的 `.group\/sidebar-wrapper` 选择器 + main>div 溢出重置）。

**Careers**：带数据表面最终可测量（REF 的公共看板：517 个跨租户 chips）—— v4 outline chips（h-auto py-3 px-4），计数 h3，以及 `?org=` 组织视图（后退按钮 + 组织 h2 text-3xl，通过 useSearchParams 实现 URL 驱动）。

**TDD**：30 个 RED → 619/619 GREEN (+21)。RED 阶段重新学习了注释与源码的正则膨胀问题（注释中引用了类字符串）以及运行时合并字符串的陷阱（Button 变体 + className 分开检查）。

**两次构建时的捕获**：(1) `w-[--sidebar-width]` 在 v4 下编译为无效的原始 `width:--sidebar-width` —— REF 的 CSS 发布了 `width:var(--sidebar-width)`；v4 的括号形式 `w-(--sidebar-width)` 生成了相同的输出（固定在源码 + pins 中）。(2) v4 的内容检测会扫描 docs/*.md —— 计划中的配方引用生成了无效的括号规则；通过 `@source not "../../docs"` 修复（干净构建验证）。

**E2E**：修改了五个规范（aside 选择器 → `[data-sidebar="sidebar"]`；orphan-routes 重新限定范围；dashboard 链；auth 社交类型 → null）+ 新的 session40 规范（8 个测试，包含主题无关登录 + tenantsetup 移动端 —— 这是中断窗口中未验证的两个）。**174/174 E2E GREEN (+7)** —— 有一个 flake（严格模式 "New Loan Request" ×2 → `.first()`），在完整重新运行后确认稳定。

**实时验证**：verify-r39.mjs —— shell 树配对字节一致；7 个中的 4 个原始匹配（MATCH），3 个 diff 均有记录（shadow-none 透明零字符串；v4/v3 shadow-slot 序列化 —— 渲染完全一致；REF 的跨租户 careers 数据 vs 克隆的空租户）。常规审计 5/5。16 张截图（148-155，包括通过 API 播种任务获取的组织视图配对，并在捕获后删除）→ 212 张捕获。DB 初始状态。

**文档**：AGENTS session-40 层，SKILL 3.23.0 + §52，PAD [S40]，CLAUDE/README 计数（793 规范金字塔），docs/session_81.md，计划完成记录，工作日志。
