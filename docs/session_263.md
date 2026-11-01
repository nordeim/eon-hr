The workspace exists with a previous session's progress. Let me refresh it with `git pull` and set up a task plan.
仓库现已是最新，已更新至 session 113 (commit 90ca932)。这是一项长期的 parity-remediation 项目。让我先制定任务计划，然后阅读文档。
`AGENTS.md` (6.2k 行) 和 `SKILL.md` (6.5k 行) 文件非常庞大 —— 我将阅读最新相关的内容。首先从会话文档和较小的文件开始。
Now the worklog tail — the latest round entry and the r114 queue:
I now have the full picture: my round is **Session 114 / Parity Round 113** (the 19th-writer round), with the r114 queue defined. Let me read the core docs — README, CLAUDE.md first, then key AGENTS.md sections.
I now have a solid picture. My round is **Session 114 / Parity Round 113** (the 19th-writer round). Let me validate the codebase state — checking scripts, environment, source, and the skills catalog.
R113-A 和 R112-A 均已在结构上呈现。现在让我运行基准门 (lint → typecheck → unit) 以确认会话结束状态：
基线门限已确认：**lint 0/0 · tsc ✓ · 1092/1092 unit** —— 符合 session-113 的关闭状态。让我更新待办事项列表，并通过检查协议脚本（protocol scripts）来开始这一轮的工作。
Now I need the corpus source URLs. Let me search the scripts and docs for them:
/tmp 实际上保留了许多语料库！让我检查一下有什么可用内容：
The corpus survived in /tmp from the r113 session. Let me verify all 24 member pins at HEAD:
All 24 corpus members verified at HEAD — the corpus survived intact. Let me also verify the byte-level ground truth (the r113 final md5s):
All 17 standing members byte-identical at HEAD. The audit + corpus legs are complete. Now the **opening read** — the 78th-deploy watch. Creating the r114 scripts:
**The 78th-deploy watch: QUIET** — login assets unchanged (JS `CcEolDtM`, CSS `BHjkUcdg`), render byte-identical to the standing baseline. Now the app-side census:
App side QUIET — the r42 baseline holds. Now the mobile-nav pair (the user's named focus):
The nav pair needs the :3200 standalone server. Let me check if a build exists from the r113 session:
A standalone build exists from r113 (matches current HEAD — no code changes yet). Booting :3200 and running the nav pair:
**MOBILE-NAV PAIR: PARITY** — identical geometry both sides; REF stay-open regression persists (the classification stands); clone keeps the auto-close superset; no Tailwind v4 regression. The opening read is complete.

Now the hunt — the 19th writer family. Checking available tooling for candidate writers:
Ghostscript 10.05 + pandoc + java available; no groff/wkhtmltopdf. Quick probes: **fpdf2** (pip) and **ps2pdf** (the troff/PostScript heritage path). Installing fpdf2 first:
**REAL DEFECT FOUND** — the fpdf2 probe reads **ZERO characters** at HEAD (0 of 860 alnums). A total-extraction failure — the genuine 19th-writer hunt target. Diagnosing the file structure:
字体字典看起来是标准的（Type0/Identity-H + ToUnicode）。问题肯定出在 content stream 中。让我来解码它：
The fpdf2 signature is emerging: separate `BT /F2 Tf ET` blocks with no show, then `BT Td (...) Tj ET` blocks. Let me get exact bytes:
The literal is 2-byte big-endian GID codes (`0001 0002 0003...` = "John") — the R111-A literal-CID class. Yet HEAD reads zero. Let me inspect the ToUnicode CMap:
The ToUnicode CMap is **uncompressed** (no /Filter). Let me check the resources dict and then read the cv-text.ts decode paths to find where it breaks:
结构看起来完全标准。现在让我追踪一下提取器在哪里失败了 —— 正在读取 `cv-text.ts` 的解码路径：
现在让我看看 `pdfTextPieces` 的 BT/Tf 处理方式 —— 单独的 `BT /F2 Tf ET` 块是可疑点：
Tf state persists across BT — that's fine. Let me see the R111-A literal-CID decode at assembly:
让我编写一个诊断脚本，对该 pipeline 进行分段插桩：
**ROOT CAUSE FOUND** — the content stream's printable census reads **51.8%** (below the 60% gate): fpdf2 writes raw 2-byte GID codes in literals (high byte `0x00`), so ~36% of the stream bytes are NULs. The stream is skipped → 0 chars. Let me read the `unescape` helpers to confirm the rest of the path would work:
The decode path is sound (R111-A handles raw-byte literals). The single blocker is the printable census gate. Let me prototype the fix — masking literal interiors in the census — and check for stacked defects beneath:
Now measuring the prototype against the fpdf2 probe and the full corpus:
原型工作正常 — 860/860 字母数字，所有顺序探针均匹配，零爆炸半径。但存在一个**格式缺陷**：我们读取到的是 `Human  resources`（双空格），而 pdftotext 显示为 `Human resources` — 这属于 `count-pin` 盲点类（连续第三次）。让我排查一下双空格的来源：
The TJ atoms carry **leading space glyphs** (`\x00 ` = code 0x20) after each `-92.953` kern. Let me look at the TJ-internals separator logic to pin the double-space source:
双空格的来源需要精确的字节级检查。让我 hex-dump 摘要区域：
**ROOT CAUSE 2 PINNED** — fpdf2's justified `multi_cell` writes word gaps DOUBLY encoded: a `-177.696` kern (fires our word-gap rule → space) PLUS a leading space glyph in the next atom (`00 20` = ' ') → double spaces. pdftotext reads single. Let me read the full `push` helper to design the collapse:
现在我已经掌握了完整的信息。该设计增加第二个修复（R114-B）：kern 单词间距通过一个 `condKern` 标记，在组装时，如果原子（atom）解码后的文本以空格字形（space glyph）开头，该标记就会折叠。让我来构建这个原型：
Both prototype fixes applied. Now the variant battery to pin the pattern's generality:
All variants generated. Measuring the prototype (both fixes) on the full fpdf2 battery + corpus:
**严重**：电池测试在全六个文件上均已通过（100.00% 完全一致，无双空格），但 R114-B 导致 2 个语料库成员出现偏差（arXiv，dvipdfmx）。在设计优化之前，让我先诊断一下：
关键问题：pdftotext 在这些区域读取的是单空格还是双空格？如果 pdftotext 读出的是单空格，那么折叠操作就是一种*改进*（即固定值变动）；如果是双空格，则属于回归错误。正在测量：
pdftotext reads arXiv with **zero double-spaces** (HEAD: 145, PROTO: 70 — the collapse moves toward pdftotext). Let me verify dvipdfmx the same way:
pdftotext reads dvipdfmx with zero double-spaces too. Before deciding the design, let me inspect the actual arXiv TJ atoms in the drifted region — understanding why the atom carries a leading space:
arXiv 的前导空格是一个**可打印的连字字符净化**（`\034` = fi 连字 → ' '），而不是真正的空格字形 —— 折叠机制在此处被误触发了。改进后的设计：仅在空格是**写入者自身的**（cmap 映射或真实的 0x20 字节）时才进行折叠。让我再检查一下 dvipdfmx 区域：
Now implementing the **refined R114-B**: the collapse fires only on the writer's OWN space (cmap-declared or a real 0x20 byte) — never the printable-scrub remap of a control byte (the pdfTeX ligature class). Rewriting the prototype:
**ZERO BLAST RADIUS + FULL CURE** — all 6 battery files at 100.00%, all 17 corpus members byte-identical. Let me verify the order probes and hoist behavior on the absolute variant before the TDD round:
**ALL ORDER PROBES MATCH** across the battery. The hunt is complete — two stacked defects (R114-A census false-reject + R114-B kern/space duality), zero blast radius. Now the TDD round. Let me study the existing spec style:
Let me check the existing census-guard specs (streams that must stay rejected) to design the guard spec correctly:
Now writing the TDD specs. First, let me verify the fixture geometry at HEAD and post-fix (the r112 fixture-isolation lesson):
F1/F2/F5/F6/F7 已验证完全符合设计。F3/F4 的读取结果均为 0 —— 需要调试该 fixture：
F3 works with the ASCII pad (the raw-code pad broke the yield guard — the r113 fixture-padding lesson live). Verifying F4 the same way:
F4's pad became an invalid hex string. Fixing it to a plain literal pad:
**ALL 7 FIXTURES VERIFIED** — 4 exact RED signatures + 3 born-green guards. Now writing the TDD specs into the test file:
Now the RED run at HEAD (the fix is not yet ported to the source):
**RED 4/4** with the 3 guards green. Verifying the exact RED signatures of all four:
**RED 4/4 with exact designed signatures.** Now porting the validated prototype to the source:
Now the remaining R114-B pieces — the `hexLeadingIsSpace` helper, the `genuine` flags in the decoded callback, and the assembly collapse:
All edits ported. Running the full unit suite (expecting GREEN 1099/1099 = 1092 + 7 net new):
**GREEN 1099/1099** (1092 + 7 net new). Now the mutation matrix — each leg removed in isolation, exact RED counts:
M1/M3/M4 are exact (1 each), but M2's mutation was too broad — it removed the standing kern word-gap rule itself (16 RED). The correct M2 isolates only the collapse. Redoing:
**MUTATION MATRIX EXACT: M1 → 1 · M2 → 3 · M3 → 1 · M4 → 1** — restored green, md5-verified. Now the real-file ground truth on the final source:
**GROUND TRUTH PERFECT** — all 6 fpdf2 members at 100.00% with order+form probes matching; all 17 standing members byte-identical; WeasyPrint pins hold. **The corpus grows to 30 members, 19 writer families.** Running lint + typecheck:
The documented R108-A trap caught in-round — the literal `.ts` import in my diagnostic script. Fixing with the variable-path import:
TSC + LINT clean. Now the **env-face totality census** — the r114-queued item (the s205 doctrine's full transfer). Census every `process.env` read across app + test + tooling:
**THE ENV-FACE TOTALITY CENSUS**: the app face is accurate (`DATABASE_URL` + `AUTH_SECRET` + the Next.js built-ins `NODE_ENV`/`NEXT_RUNTIME`); the test side reads `E2E_PORT` (documented r113) and **`CI`** (playwright.config.ts:59 — `reuseExistingServer`) — the one undocumented knob. Applying the cure:
Env-face census complete. Now the build (the source changed) — then the live UI verify:
Build complete (116/116 pages). Re-booting :3200 on the remediated build and adapting the UI-verify script:
The candidate was created (named from the filename: "fpdf ui probe"). Let me read its stored cvText directly:
**LIVE UI VERIFY PASSED** — the stored cvText opens "r114 fpdf probe" name-first (position 0, dates at 364), zero U+FFFD, single-spaced body, no doubled gaps. Now sweeping the probe and verifying DB pristine:
**DB PRISTINE** (1 user / 0 candidates / 3 job postings) — probe swept by its real id. Now the desktop screenshots (before E2E — the documented ordering). Adapting the r113 shots script:
**12 r114 screenshots captured, all non-blank.** Now the E2E gate — first checking the browser-version trap, then the detached run:
Both chromium versions cached (the trap cured). Spawning the E2E gate detached:
E2E 运行已分离。在轮询的同时 —— 带有文档层的审计分支。首先进行 neo-crm 层检查和补丁监控：
**neo-crm session 205 landed** — the ENV-FACE TOTALITY CONTRACT (the genus pin as a standing test). The r114-queued item's complete form. Let me measure what the full census finds across the repo:
The census findings: the live face (src/+tests/+configs) is clean and documented; the `R*_DUMP`/`PROBE_BASE` knobs are round-local historical probe tooling, not the operator face. Implementing the **genus pin** — the standing totality census test (the s205 doctrine adapted):
Born-green 3/3. The mutation proof (the s205 doctrine's matrix — planted undocumented consumer + planted phantom knob):
**CENSUS MUTATIONS EXACT: M-A → 1 · M-B → 1**, restored green. Full suite with the census:
**1102/1102 unit** (1099 + 3 census). E2E climbing (127 passing). While it runs — the docs layer. First the count lockstep locations:
E2E climbing. Writing the docs layer — the remediation plan first:
Now the session narrative (session_261.md):
Now the AGENTS.md session-114 layer and count lockstep:
Now the count lockstep across CLAUDE.md, README.md, AGENTS.md:
Now the SKILL.md v4.1.0 — the version head, state line, and §126:
Now the worklog round-113 entry. Checking E2E progress first:
Docs layer complete. Polling the E2E gate:
**E2E 559/559 — a clean 10.5m run. ALL GATES GREEN.** Final verification sweep before the commit:
All gates re-verified. Staging and committing with the established message format:
Committed `e7786a2` (37 files), tree clean. Now the push — following the SSH wrapper skill:
The shim and paramiko are in place. Executing the push sequence — key materialization, dry-run, then the real push:
Dry-run clean (fast-forward `90ca932..e7786a2`). The real push:
**PUSH VERIFIED** — `e7786a2` on main, remote ref == local HEAD, key shredded, tree clean. Following the established two-commit pattern, the session transcript (session_262.md) comes next:
All twelve tasks complete. The final state verified: `main` at `6316e0f`, remote == local, tree clean, keys shredded.

## Session 114 / Parity Round 113 — complete and pushed

**The 19th-writer round.** The hunt took **fpdf2 2.8.5** (the PyFPDF lineage — the standard Python CV path), and the probe read **0 of 860 alnums**: two stacked defects, both cured TDD-first:

- **R114-A — the literal-interior census mask**: fpdf2 writes 2-byte Identity-H codes as raw control bytes (NUL high bytes); a genuine content stream measured 51.8% printable and the stream gate silently killed the whole file. The census now measures syntax, never the literal payload.
- **R114-B — the kern+space-glyph duality**: justified paragraphs write every word gap doubly (a ≤ −100 kern **and** a leading space glyph) — doubled gaps the count pins can't see. The collapse fires only on the *writer's own* space (cmap-declared or a real 0x20 byte), preserving arXiv/dvipdfmx byte-identity.
- **The env-face totality census** (the queued item): the `CI` cure + a standing genus pin (`env-face.test.ts`) that keeps every future env var documented.

**Gates**: lint 0/0 · tsc ✓ · **1102/1102 unit** · build 116/116 · **E2E 559/559** · DB pristine. **Corpus: 30 members, 19 writer families.** Your named focus — mobile-nav pair PARITY, no Tailwind v4 regression; the 78th-deploy watch QUIET. Pushed to main (`e7786a2` + the session log) via the SSH wrapper, remote ref verified.
