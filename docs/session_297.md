I'll start by setting up my task plan and refreshing the workspace. Let me create a comprehensive TODO list first, then check the current workspace state.
The workspace has been reset — no existing eon-hr clone. Let me clone the repository.
Repository cloned successfully (7065 files). Let me check the current git state and repo structure.
Repo cloned. Now let me review the git state and read the core documentation files.
The repo is at the latest state — session 124 (round 123) is complete. My work this round will be session 125. Let me update my todos and read the core documentation.
Let me read the core documentation files. I'll start with the smaller ones completely and strategic sections of the large ones.
Let me read these files in sections to avoid truncation issues.
The file has very long lines. Let me read it via bash with line wrapping.
现在让我查看最新的会话文档和补救计划。
Session 124 (Round 123) is complete; the r125 queue is armed. My round is **Session 125 / Parity Round 124**. Let me read the previous remediation plan and worklog tail.
I now have the full round context. My round is **Session 125 / Parity Round 124** with the r125 queue armed. Let me review the AGENTS.md structure and architecture doc, then validate the environment.
Full documentation context established. Now let me validate the environment state (fresh sandbox — the /tmp corpus likely needs re-sourcing) and read the session-124 AGENTS layer.
已确认全新的沙箱环境——需要重新获取语料库。让我先检查一下语料库工具脚本，以遵循文档中记录的重新获取协议。
Found the corpus re-source protocol. Let me set up the workspace: install dependencies, create .env, and start the corpus re-source.
The `.env.example` correctly documents `DATABASE_URL="file:../db/custom.db"`. Let me install dependencies and set up the environment.
Database ready. Now the corpus re-source (foreground — the documented reaping trap).
Three members need attention: dvipdfmx (196 bytes — truncated), QUARTZ (11 bytes — the documented submodule path issue), LO Calc (571 bytes — documented as not re-sourceable). Let me diagnose and fix.
All 404s. Let me fix dvipdfmx via texdoc and QUARTZ via the documented submodule trail correction.
dvipdfmx fixed (244,290 bytes — pin exact). Now finding the QUARTZ file via the trees API recursively.
QUARTZ fixed (md5 27575d59 — pin EXACT). Let me examine the r124 corpus scripts to understand the expected corpus layout and pins.
Let me find the family generators and check the r124 mutations runner for the working protocol.
All tools available. Now generating the family members — Typst first.
The typst package download seems to have stalled. Let me check the actual error.
resume.pdf compiled. Let me finish the remaining three.
Typst×4 done. Now WeasyPrint and fpdf2 families.
Simple fix — the output directory doesn't exist.
WeasyPrint×6 + fpdf2×5 done. Now the Skia family — checking the generator and playwright browser availability.
The sandbox has chromium-1200 but the repo's playwright 1.64 needs chromium-1248. Let me check and install the right build.
chromium-1248 installed. Now generating the Skia family.
Only the main specimen generated — the 4 variants must come from another script. Let me find it.
All corpus members regenerated. Now running the baseline gates.
Baseline gates green (lint 0/0 · tsc ✓ · 1179/1179). Now verifying the corpus drift ledger at HEAD.
Drift ledger at HEAD: all members IDENTICAL (proto synced). ReportLab at the r124-cured pin `880ec001`. Now the family checks.
ALL 16 FAMILY MEMBERS EXACT — corpus fully verified at HEAD. Now let me review the repo skills for the audit phase.
Now let me check the audit legs (patch watch, advisory census) and look at the previous round's capture infrastructure.
Advisory unchanged (2 dev-toolchain vulns), agent-browser ready. Let me check how the previous REF-watch captures were done, then dispatch the audit legs as subagents while the build runs.
Now I'll dispatch the two audit legs as parallel subagents (REF-watch + neo-crm HEAD audit) while I run the build in the foreground.
Both audit legs returned:
- **REF-watch (89th deploy): RENDER-STABLE** — all assets HELD, captures byte-identical to r124, mobile drawer still-open regression persists (no auto-close)
- **neo-crm: MOVED** — session-212 shipped a **standalone bun-launch DB re-anchor** fix (`src/lib/db-path.ts`): bun absolutizes relative `DATABASE_URL` against `.env`'s directory, and the launch-dir recovery was dead code nested inside a wrong guard — directly transferable to eon-hr's identical db-path seam!

Let me update my todos and build the app for the clone-side verification.
Build done. Let me check the boot script and start the server on :3200.
The boot scripts mask the DB seam with absolute-path overrides. Let me read eon-hr's db-path resolver — the critical genus-transfer check.
The eon-hr resolver passes absolute URLs through untouched — the exact neo-crm defect shape if bun absolutizes `.env` values. Let me verify empirically.
The shell exports a stale `DATABASE_URL`. Let me test the clean case — what bun does with the `.env` file alone.
Bun loads `.env` values raw (not absolutized) — unlike neo-crm's documented case. Let me test the actual `bun run start` launch shape end-to-end to see which DB the standalone server really opens.
Key finding: `.next/standalone/.env` exists (traced copy). Let me check what the existing tests pin and then empirically verify the natural `bun run start` launch.
The unit tests pin the resolver but no test pins the **end-to-end launch contract** (the exact blindness neo-crm documented). Let me empirically verify the natural `bun run start` launch.
The server didn't come up. Let me debug the boot directly.
The probe's servers ARE running — the health check must have failed. Let me probe them directly.
Both servers hit the AUTH_SECRET production boot guard (500). My probe missed the `AUTH_SECRET`. Let me fix and re-run.
**Leg A PASSES** — the natural `bun run start` launch opens the correct `<repo>/db/custom.db` (seeded login works, no phantom). Leg B (the exported absolute DATABASE_URL) fails to boot entirely. Let me document Leg B's exact failure mode.
Leg B boots fine when clean. Let me probe what DB it actually serves.
**Leg B verdict: the operator trap fails LOUDLY** (health `db:down`, login INTERNAL) — not neo-crm's silent wrong-file shape. The launch contract itself works. Let me check what the existing test fixtures pin.
The existing fixture never models the traced `.env` — the exact test-blind-spot genus neo-crm documented. The launch contract is verified empirically (leg A/B). Now **the hunt** — measuring the r125 queue's blind pockets. Let me find the bx-coverage census tooling.
The census confirms the r125 queue exactly: **arXiv 99.2% (182 blind)** and **IRS 94.7% (108 blind)** — everything else at 100%. Now the anatomy of both pockets.
The anatomy is decoded: IRS = 108 fontless pieces; arXiv = 129 `f-0-0` + 46 `Font2` (Calibri) + 3 `f-0-1` + 4 empty. Let me write the r125 diagnostic to dump the font dictionaries and /W arrays.
Rich anatomies decoded! Three distinct mechanisms:
1. **f-0-0 (129)**: Type1 subset fonts with /Widths arrays — pieces landing on zero-width/out-of-range codes
2. **Font2 (46)**: the mixed-form `/W [ 0 [ 506 0 0 226 578 ] 5 12 0 13 [ … ] ]` — array-form + range-triples mixed
3. **IRS (108)**: AcroForm appearance streams (the "name (see instructions)" placeholder) — the form's own `/Resources << /Font << /ZaDb 268 0 R >>` never consulted

Let me examine the widthFor machinery in the source to design the cures.
The mixed-form `/W` parse is corrupted — the range triples `5 12 0` read as pairs. Let me study how simple-font `/Widths` and the font tables are built, and instrument the f-0-0 failure cause.
Let me read the widthFor implementation and the piece-walk to design the instrumentation.
Now let me build the instrumented diagnostic — patching a proto copy to log per-piece blindness causes (the r124 discipline).
The causes are measured:
- **arXiv**: 55 `w<=0` events (Font2's mis-parsed mixed /W + f-0-0's zero-gap entries) + 11 `odd-bytes`
- **IRS**: all 108 are `no-table` with **font="" and no pageMap** — the appearance-stream parts carry no font binding at all

Let me examine how the Tf handler sets piece.font.
The pieces have ps but no font — let me dump a decompressed IRS appearance stream to see its actual content form.
No literal-text appearance streams in raw objects — they must live in ObjStms. Let me search inside the compressed object streams.
The "name (see instructions" text is in obj 2407 — a page content stream. Let me dump the full blind-piece records to see why their font is empty.
The pieces carry `font: ""` — the BT block resets or the font was never re-set. Let me examine the BT handler.
Let me find which objNum the blind part belongs to and where the Tf-less run starts.
Let me instrument the part-level objNum to identify exactly which stream the blind pieces come from.
The fontless pieces come FIRST in each part — before any Tf fires. Let me examine how streams are walked and where the walk begins.
Let me map obj 2407's full structure — where each text run sits and which have Tf.
**THE ANATOMY**: Stream 2407's FIRST text run has NO Tf — it inherits text state from the PREVIOUS stream in the page's /Contents array (streams are processed as-if-concatenated per PDF spec). The walker walks each stream independently with `curFont=""`. Let me verify the /Contents array structure.
Pages live in ObjStms. Let me decompress and search there.
**已确认**：页面 2403 的 `/Contents[2405…2412]` — 一个 8 流数组。流 2407 以一个无 Tf 的 BT 开头，并继承了来自流 2406 最后一个 Tf 的文本状态。步进器（walker）独立处理每个流（`curFont=""` 重置）→ 108 个字体缺失的盲块。让我验证一下前一个流设置了什么字体。
All mid-array streams inherit state. Now let me diagnose the f-0-0 zero-width question — which subset object did the pageMap bind?
The f-0-0 subsets genuinely zero-out used codes. Now let me census the fire-separation for all three cure candidates across the whole corpus + families.
Clean fire-separation: C1 is IRS-exclusive; C2 (mixed /W) rides arXiv (16!) + fpdf2 (2) + Skia (2); C3's zero entries are widespread but only bite where blocks are blind. Let me examine the fpdf2/Skia mixed arrays — the drift-ledger risk.
The raw-ascii scan picks up binary false-positives. Let me refine the census to real font objects only.
The nested `<<>>` in CIDSystemInfo breaks the regex. Let me fix the scan.
My census miscounted — the CID prefix before each `[` isn't a bare group. Let me walk the token stream properly.
The true census: **arXiv 28 · WeasyPrint 2 · fpdf2 1** mixed arrays. Let me examine the WeasyPrint form fully before designing the cure.
The WeasyPrint "mixed" hits were regex artifacts (capture ran past the array). Let me verify fpdf2 with bracket-balanced matching — the decisive check.
**fpdf2's mixed array is real** — range triples `2 4 611` + array entries. The fire-separation: mixed /W rides arXiv + fpdf2; WeasyPrint is pure-array (safe). Now let me study the stream-walk driver for the Contents-array state carry.
The design is clear. Let me verify the carried font (T1_0 → obj 2431) resolves the IRS pieces' codes.
T1_0 covers all the blind codes with real widths — the IRS cure would fully un-blind. Now let me count arXiv's true mixed arrays, then build the patched-proto experiment.
14 true mixed arrays in arXiv + 1 in fpdf2 — the fire-separation is verified. Now let me build the patched-proto experiment with all three cures.
**REMARKABLE RESULTS**: IRS 94.7%→**100.0%** with IDENTICAL output (zero-drift un-blinding!); arXiv 99.2%→**99.9%** with alnums exact; all 16 families EXACT; 11/12 members IDENTICAL. Only arXiv's output form changed. Now the toward/away classification.
Word-stream identical, one line-split hunk in the garbage-text region. Let me check the standing classifier's exact metrics (the r122 discipline).
The experiment is decisive: **IRS 100.0% (zero-drift) · arXiv 99.9% (word-stream identical, alnums exact) · all families EXACT**. Now let me write the remediation plan, then execute the TDD round. First, let me check the existing spec structure.
Now let me write the remediation plan before executing the TDD round.
计划已保存。现在开始 TDD 阶段 —— 将 `session-125` 的 `RED specs` 追加到 `cv-text` 测试文件中。
I need to fix the object numbering in the R125-C fixture — the Contents refs are wrong.
One more fixture refinement — s1's literal should be properly 2-byte coded under the Identity-H font.
Now let me run the new specs to confirm the designed RED state.
**RED 3/3 + 3 born-green guards** — the designed TDD state. Now the D-125a db-path launch-contract pin (born-green).
D-125a born-green (18/18). Now applying the three cures to `src/lib/cv-text.ts`.
Now the remaining C-patches: the write-back, the state maps, and the call-site threading.
All cures applied. Now the proto resync (the D-120a discipline) and the full unit suite.
Two failures — my R125-A patch didn't land correctly. Let me inspect the current state of parseWidthsArray.
**Deeper defect found**: the `/W` extraction regex `\[([^\]]*)\]` truncates at the first `]` — the mixed array never reaches parseWidthsArray intact! My spec-4 fixture was also accidentally green. Let me find all the /W matchers.
The root cause is deeper — the `/W` capture regex truncates nested arrays. Let me fix the extraction with a bracket-balanced walk.
Now fixing the spec-4 fixture (the zero must land on a shown code) and updating the spec-2 comment.
Now resync the proto and run the full suite.
**GREEN 1188/1188**. The final source now includes the bracket-balanced capture (beyond the experiment) — I must re-measure the drift ledger on the final source.
Final source: IRS IDENTICAL at 100.0% bx; arXiv at new pin `e842276b` (alnums exact). Now family checks + the re-classification of the final arXiv drift.
The balanced capture produces more line splits. Let me check pdftotext's form for these regions — the decisive toward/away evidence.
pdftotext reads these as single lines — the splits are away-drift. Let me probe the actual piece geometry to understand the split mechanics.
The gap is only 8.48em — under the 13em band. The split must come from the conditional-gap resolution. Let me read the push/condGap machinery.
The upgrade fires at ≥2.5em block-boundary gaps — the tracked end is severely under-tracked. Let me dump the actual codes and their map hits for the Font1 piece.
The codes hit mostly zero entries — my /W reading must be wrong. Let me get pdftotext's own layout ground truth with -bbox.
pdftotext computes real flowing positions — my /W reading is wrong for this font. Font1 has 4 refs — let me dump ALL its descendants' /W arrays.
The real Arial widths would give the exact flowing end — but my cure's probe shows the piece resolving wrong. Let me instrument which object the pageMap binds for Font1 on that part.
The Font1 pieces resolve through the candidate chain (no pageMap) — hitting the FIRST Font1 object (Calibri-Bold) instead of their real ArialMT font. Let me investigate why these parts lack page bindings.
The pages use referenced /Resources (the pendingRes path). Let me probe whether the capital part's page binding resolves.
The 4 Font1 parts (355, 628, 629, 764) have no pageMap. Let me trace why the pendingRes resolution missed them.
These streams are orphans — not referenced by any /Contents! Let me find what references them.
**THE FULL ANATOMY**: the figure PDFs are Form XObjects with their OWN `/Resources /Font` — but their content streams walk as unbound candidates, misbinding Font1 to the first candidate (Calibri-Bold instead of ArialMT). The cure: bind a Form XObject's own object number to its inline font pairs. Let me implement R125-D.
Now let me check whether the ObjStm harvest needs the same form-binding treatment.
Forms can't live in ObjStms (stream objects) — the raw-site cure is complete. Now resync, test, and re-measure the drift ledger.
fontspec now drifts (+4 alnums) under R125-D — a regression to investigate. Let me diff its output.
R125-D **fixed fontspec's text decode** — "Utfiight SMALL JAPS" → "Upright SMALL CAPS"! The HEAD was decoding through the wrong font's CMap. Let me verify this is toward pdftotext's ground truth.
The hunks match pdftotext exactly. But the global similarity dropped — something else degraded. Let me examine the remaining hunks.
All 7 hunks are corrections toward pdftotext. The similarity metric paradox needs a word-level look.
**autojunk artifact exposed**: with `autojunk=False`, fontspec is TOWARD (+0.0002, delete/insert −4) — and R125-D fixed a long-standing CMap decode misbind. Now let me classify the final arXiv drift.
**PERFECT**: arXiv word-stream TOWARD (+0.0002), line-form IDENTICAL (false splits gone), alnums exact, and 3 CMap-decode corrections ("aork"→"York")! R125-D completes the round. Let me add its RED spec.
The spec is green. Let me demonstrate its RED state by temporarily reverting the R125-D hunk.
The spec passed even reverted — the candidate chain skips Type0 parents. Let me check the descendant merge.
The spec unexpectedly passed while reverted — let me debug the reverted state directly.
Found it — my fixture's obj 7 `/W [ 0 [ 506 ]` is missing the outer `]`, making the wrong font unparseable so the chain skips it. Let me fix the fixture.
**PERFECT RED/GREEN demonstrated**. Now the full suite + the final verification chain.
TSC fails — a 3-tuple pushed into a 2-tuple array in my script. Let me locate and fix it.
Gates clean. Now the mutation matrix — let me study the r124 runner pattern first.
Now let me write the r125 mutation matrix runner.
M1 killed 9 specs — the pair-revert broke historical specs too. Let me identify them.
Unexpected historical-spec failures under M1. Let me examine one failure's detail.
Let me see the actual assertion failure under M1.
Something's off with the M1 mutation itself. Let me diff the mutated file against the backup.
The mutation is clean but kills historical specs. Let me test the r124 fixture directly against the mutated source.
**CRITICAL DISCOVERY**: my balanced capture includes the leading `[` in wInner — routing ALL inline /W values through the bracket walk (the no-bracket branch is now dead). The pure-pair forms would mis-parse as ranges! Let me check the r121 pure-pair spec.
**THE BUG**: my capture includes the leading `[` — all inline /W now route through the bracket walk, bypassing the validated no-bracket branch. The fix: slice from AFTER the `[`.
All pins hold with the fix. Now re-run the mutation matrix.
M1 exact. M2's anchor needs updating for the new slice line.
**MUTATION MATRIX EXACT** (M1 1 · M2 2 · M3 1 · M4 1 · M5 1 · M6 1). Let me update the remediation plan with R125-D and the in-round discoveries.
Now let me add the R125-D material section and update the measured-cure results.
Now let me update the MATERIAL 3 measured-cure text and the ToDo list.
The plan is complete. Now the build + E2E gates.
**E2E 565/565** (200+187+180, zero failures). Now the DB pristine check and the live UI verify.
Let me boot the remediated server on :3200 and run the live UI verify.
The candidate is "resume2" (the known filename-derived name quirk). Let me probe it directly.
Login is failing. Let me check the login API directly.
The API works via curl. Let me debug the browser-side login with the response.
**Found it**: the shell expands `$Abcd1234` inside the double-quoted eval expression → empty password → 400. The fill-based login avoids this. Let me re-run with the safe pattern.
Let me see the actual login error on the page.
**The bash single-quote nesting mangled my inline script** — `$Abcd1234` got shell-expanded. The file-based approach avoids this. Let me fix the r125 verify script properly.
**LIVE UI VERIFY PASSED** — name-first, dateSplit ×2, zero U+FFFD, swept by real id. Now the DB pristine check.
**DB PRISTINE** (1/1/2/0/0). Now the screenshots on the remediated build.
The training cycle didn't navigate (URL stayed "/"). Let me run the mobile-nav cycle as a careful standalone sequence.
The hamburger has `[expanded=false, ref=e19]` — my regex needs to tolerate attributes. Let me fix and re-run.
Let me make the mobile probe robust with retry logic and re-run it.
The snapshot has the content but the regex fails. Let me test the regex against the exact bytes.
Let me dump the actual snapshot content in the failing flow.
**The rate limiter tripped** (my debug runs exhausted the 10/15min budget). Let me restart the server (resetting the in-memory limiter) and do ONE clean full capture run.
The viewport change after load may need a reload. Let me check with a dump.
The mobile viewport must be set from the session start. Let me run the mobile captures standalone.
The regex itself must be the issue. Let me test it directly.
The regex mysteriously fails. Let me dissect it.
**Found it** — the format is `[expanded=false, ref=e19]`, not `[ref=e19]`. The tolerant pattern `\[[^\]]*ref=(\w+)\]` works. Let me fix and re-run.
**Mobile-nav pair verified: drawer 288px z:50, /training navigation, auto-closed superset.** Let me verify the screenshots are non-blank and pixel-diff against the REF captures.
**Parity verified**: dashboard 1 pixel, login at the standing level, mobile-nav census PARITY, training diff = the documented auto-close superset. Let me byte-compare against the r124 clone captures (the cures are engine-only).
**All captures byte-identical to r124** — engine-only cures confirmed. Now the docs layer. Let me find the count references first.
Let me update all the count references and write the docs layer.
Now the SKILL version banner bump.
Now the SKILL §137 section. Let me check the section structure.
Now the AGENTS.md session-125 layer.
Now the session narrative (docs/session_295.md).
Now the worklog round-124 entry.
The docs layer is complete. Now the final verification and the commit. Let me check the tree state.
Clean. Let me run the final gate verification, then read the SSH push skill.
Let me install paramiko and set up the SSH shim from the skill doc.
The shim works. Now the commit with the repo's descriptive style.
**Committed `5e36ce0`.** Now the SSH push protocol — materialize the operator key.
Dry-run clean (`a75c458..5e36ce0 → main`). Now the real push.
**Pushed and verified: `refs/heads/main @ 5e36ce0 == local HEAD`.** Now shred the operator key and run the final checks.
Push verified. Let me check what the previous round's "update session log" commit contained to complete the pattern.
The pattern needs a follow-up transcript commit (session_296.md). Let me write it.
All pushed and verified. Let me finalize the task list.
**Session 125 / Parity Round 124 — complete and pushed to `main` @ `0fa9a93`** (remote verified, operator key shredded, tree clean, no new branches).

**The round delivered five measured cures for the r125 queue:**

1. **R125-A** — The mixed `/W` range arms + the bracket-balanced capture: the arXiv Calibri descendants interleave array entries with range triples, but the value capture truncated at the first `]` and the bare groups read as pairs. The mutation matrix's M1 mismatch exposed a deeper bug in-round (the leading-bracket capture bypassed the validated no-bracket readings) — fixed with the after-bracket slice.
2. **R125-B** — The known-zero advance: a map-covered width of 0 (the .null-glyph class) now advances 0 instead of blinding the block.
3. **R125-C** — The /Contents-array text-state carry: the IRS page's 8 streams process as-if-concatenated, so the Tf-less mid-array streams inherit the predecessor's font — **IRS pocket cured to 100.0% bx with identical output**.
4. **R125-D** (found in-round) — The Form XObject's own resources: the LaTeX figure PDFs' fonts were misbound through the candidate chain, corrupting both width tracking and the ToUnicode decode — **fontspec's standing "Utfiiight SMALL JAPS" garbage corrected to pdftotext's exact "Upright SMALL CAPS"** (7 hunks, plus arXiv's "New aork"→"New York").
5. **D-125a** — The neo-crm s212 DB-re-anchor genus verified transferred: eon-hr's seam already has the hoisted shape (launch probe committed as the standing guard; the traced-.env fixture blind spot closed with 3 born-green pins).

**Verification**: RED→GREEN 1189/1189, mutation matrix exact, drift ledger zero-away, E2E 565/565, build ✓, DB pristine, live UI verify passed, 4 screenshots byte-identical to the prior round, visual parity standing (render-stable reference, mobile-nav parity with the auto-close superset, no Tailwind v4 regression). All docs, the remediation plan, and the worklog updated and committed.

**Next when ready**: the r126 queue is armed — the arXiv residual 18-piece pocket, the Typst sub-em residuals, and the standing watches.
