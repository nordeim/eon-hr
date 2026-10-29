Workspace has been reset — the eon-hr repo is absent. I'll clone it fresh and start the parity round protocol.
Repo cloned and current with origin/main (HEAD at session-107/parity round 106 complete). Now let me read the core documentation files.
Session 246 confirms round 106 (session-107) completed and pushed. This round is **Session 108 / Parity Round 107**. Now reading the core docs — checking sizes first.
Now reading the core docs — CLAUDE.md, README.md in full, and the AGENTS.md protocol head + session-107 tail layer.
Now the AGENTS.md — checking structure, then reading the protocol head and the session-107 layer.
Docs fully digested. Now validating the environment state and the codebase alignment — checking .env, db/, package.json, and the R107 code legs.
Fresh clone — needs environment setup (.env, install, db). First let me validate the R107 code legs exist as documented.
Codebase validation complete — all R107 legs confirmed in the code. Now setting up the fresh environment (.env, install, db).
Environment ready. Running baseline gates now — lint, typecheck, unit tests.
One stale artifact: `scripts/r107-ground-truth.ts` references a deleted `/tmp` module. Let me inspect it.
Found a real fresh-clone defect: the committed r107 probe script breaks `tsc` when /tmp is wiped. Checking tsconfig scope and sibling scripts for the same pattern.
The script uses a literal `/tmp` import that breaks tsc on fresh workspaces — a genuine R108 finding. Continuing baseline gates: unit tests.
Unit baseline **1056/1056 GREEN**. Now updating the todo and starting the audit + opening read (deploy watch).
Probe patterns understood. Writing the r108 opening-read probes now (login probe + app census).
**72nd deploy detected** — login JS `C8D2zqWd→BUB_QBH0`, CSS `CZZ4z0cl→Bwz2pKfc`, but the render is **BYTE-IDENTICAL** to the standing baseline (the 69th-pattern: non-visual churn). Running the app-side census.
App side QUIET — the 72nd deploy is login-side-only churn, non-visual. Now the audit phase: checking neo-crm for the session-199+ layer, the advisory state, and the Next patch watch.
neo-crm has landed session-199 since the last consumed layer. Checking the full extent and reading the session-199 doc.
The session-199 doctrine (dialog-open a11y coverage census) is a transfer candidate. Checking eon-hr's current dialog-open a11y coverage state.
36 dialog files; only the 5 parity dialogs carry open-surface a11y pins. Noting the s199 transfer candidate. Now checking the advisory state and the Next patch watch.
New finding: **Next 16.4.3 released 2026-10-29** — the patch watch (HOLD at ^16.4.2) needs re-evaluation. Checking the documented rationale for the hold.
16.4.3 is a non-security bugfix release, but it touches the standalone server bootstrap (relevant to our standalone output). Checking the remaining queue items — the /Differences watch and the Quartz hunt state.
Advisory state = exactly the documented deepmerge-ts-only chain; the 16.4.2 HOLD conditions verified. Now the time-boxed Quartz 13th-writer hunt (4th attempt).
Strong leads — FCC filings and the xmlcalabash test suite carry Quartz PDFContext files. Downloading candidates.
**THE QUARTZ 13th-WRITER IS SOURCED** — a genuine macOS Quartz PDFContext file (70KB, PDF 1.3, Bear-authored, June 2026). Checking for the second test document too.
Only `longer.pdf` is Quartz — it's THE 13th-writer specimen. Now the critical measurement: how does our extractor read it vs the pdftotext reference?
The Quartz file extracts cleanly (2,697 alnums, zero soup) — but one artifact: `There�s` — the curly quote reads as � (U+FFFD). Checking the reference extractor and the font's encoding declaration.
**REAL DEFECT FOUND** — pdftotext reads `There's` (U+2019), ours reads `There�s` (0x92 → U+0092 via Latin-1). Examining the file's font encoding declarations.
MacRomanEncoding confirmed (LastChar 213 = 0xD5 = U+2019 in MacRoman). Let me trace how our extractor decodes literal high bytes.
Line ~1043 looks mangled — `return k, ...cmapsFor(font)];`. Reading precisely.
**ROOT CAUSE FOUND** — line 838: `new TextDecoder()` defaults to **UTF-8**, so byte 0xD5 in the inflated stream becomes U+FFFD. And even Latin-1 would give Õ, not the MacRoman ' — the fonts declare `/Encoding /MacRomanEncoding`. This is a two-leg defect (the 13th-writer class). Now re-sourcing the corpus to measure blast radius.
Corpus URLs aren't in scripts — re-sourcing from canonical locations and verifying against the recorded md5s.
fontspec md5 **752e9929** — exact match with the r107-pinned build. Now the IRS member.
**Full corpus re-sourced with exact md5 matches** (fontspec `752e9929`, lo-calc `dbb10a2b` — the r107-pinned builds). Running the corpus verification against HEAD.
arxiv/dvipdfmx were lost from the parallel download — re-fetching sequentially.
lo-writer vanished from /tmp — something is cleaning large files. Re-checking and re-downloading.
**ALL CORPUS PINS HOLD** on the fresh workspace + the Quartz defect confirmed. Now the critical pre-fix measurement: do any corpus members' compressed streams carry high bytes (the latin1-decode blast radius)?
The probe overcounts (no printable gate) — binary junk in parens. Building the true prototype diff: current vs latin1-decode, every corpus member, exact output text.
The prototype diff is decisive: **5 members byte-identical, arXiv drifts only on 49 pre-existing garbage lines (Type3 charprocs, alnums identical), Quartz exactly 1 line** (still needs LEG B for MacRoman). Now building for the nav-pair verification while I draft the plan.
The build blocks on BOTH the r107 script (R108-A confirmed as build-blocking) and my new probe script (same class). Fixing both with the variable-path pattern now — this is R108-A's fix.
**R108-A 已修复** — 全新工作区构建已通过。正在启动 :3200 环境以进行移动端导航栏配对和对话 a11y 普查。
**Mobile-nav pair: PARITY at the 72nd state** — REF stay-open persists (4th watch), clone keeps the auto-close superset, /employeedetail REF-broken holds. Now the s199 doctrine transfer: the dialog-open a11y census.
My guessed trigger texts were wrong — extracting the REAL trigger labels from the source.
Radix dialog triggers carry `aria-haspopup="dialog"` (the R25 layer pinned this contract). Rewriting the census to enumerate them at runtime.
Zero triggers everywhere — the session likely failed to log in. Debugging interactively.
The selector works directly — the census session's login must have failed silently. Adding a diagnostic and fixing the quoting.
The python rewrite dropped the login block entirely. Restoring it.
Triggers found, but the click-eval quoting is broken. Switching to index-based clicking (no label matching).
**2 REAL DEFECTS FOUND** — the loans and assets dialogs each carry 2 unnamed selects. Checking why other pages show only the Notifications trigger (controlled-state dialogs without DialogTrigger?).
Many pages use controlled dialogs (no DialogTrigger). But first — the parity question for the found defects: what does the REF's loans dialog do with those selects?
The census may have caught Radix's internal hidden native-select mirrors — checking the live DOM for aria-hidden and the combobox triggers' names.
The loans "defect" is a census artifact — the selects are Radix's `aria-hidden` internal mirrors (correctly excluded from the a11y tree), and the real comboboxes ARE labeled via `label[for]`. Fixing the census: skip aria-hidden mirrors, census the comboboxes.
Regression — dialogs now fail to open. Debugging the live state directly.
Found it — my comment inside the eval template gets joined into a single line, commenting out the rest of the expression. Removing it.
DialogTrigger dialogs all clean. Now the second pass: the CONTROLLED dialogs (state-opened, no trigger attribute).
58 dialog-open states censused, ZERO defects. Quick spot-check on the icon-only-trigger pages the verb census missed.
The full census: **58 dialog-open states, 0 defects** — the a11y surface holds (the s195 "already covered" pattern). The audit is complete. Now studying the test fixture patterns before writing the plan.
The fixture patterns are clear (CompressionStream-deflated streams). Before writing the plan, generating the authoritative MacRoman table from Python's codec (no memory-reconstruction risk).
The authoritative table is generated and verified (0xD5 → U+2019, matching pdftotext). Now studying the collector sites to mirror in the fix design.
The audit is complete and the fix design is fully informed. Writing the remediation plan now.
Plan written. Now validating the design against the codebase — checking the MARKER_TABLES construction shape to mirror for MAC_ROMAN.
Design validated. Now finding the R107 spec insertion point in the test file to write the R108 specs.
Now checking the Tm axis-aligned condition to confirm the fixture's flipped-Y form is handled.
设计已完全验证。正在编写 RED 规格（4 个规格，采用 latin1-stream 固定装置）。
The `encS` helper is scoped to another describe block. Adding a local definition.
**RED 4/4 with the exact designed signatures** — the U+FFFD defect verbatim + the Õ hex path. Now implementing GREEN. Snapshot first for the mutation matrix.
Now LEG B — the MAC_ROMAN table + CodeMap after MARKER_TABLES:
Now the objMacRoman census + the /Font-dict-region collector:
Now the ObjStm harvest legs — extending the font-object census + region collector to ObjStm bodies:
Now the cmapsFor marker push and the assembly literal remap:
**GREEN 65/65**. Running the full unit suite + tsc + lint, then the mutation matrix.
**1060/1060, tsc ✓, lint 0/0** — the plan's exact projection. Now the mutation matrix. M1: LEG A reverted.
Line numbers shifted — the mutation didn't apply. Patching the correct lines.
**M1 → exactly 3 RED + spec 4 GREEN** as designed. Restoring and running M2 (objMacRoman census removed).
**M3 → exactly 2 RED** (specs 1+4). Restoring, then M4 (the literal remap removed).
**Mutation matrix complete** — M1→3, M2→2, M3→2, M4→1, M5→2, each biting exactly its designed specs. Full suite 1060/1060 restored. Now the real-file ground truth.
**A REAL FINDING on the IRS member** — 73 lines changed "4" → "✔" (the ZapfDingbats marker now RESOLVES on the real file; the r105 binding never did — the same "inert on real files" class as R106-A). The arbiter: pdftotext.
pdftotext extracts NOTHING for the checkbox glyphs (neither "4" nor "✔"). Verifying the atoms really ride the Dingbats font (not real digits).
**Fully confirmed**: 73 Form XObjects carry `/ZaDb 268 0 R` (NOT F-prefixed — the standing regex never bound it). The r105 marker fix was INERT on the real IRS file; the region collector activates it — the spec-correct ✔ decode (5871−73=5798 exactly). Accepting the activation and re-anchoring the pin.
**GROUND TRUTH: ALL HOLDS** — IRS the 73-glyph activation, arXiv garbage-only, 4 members byte-identical, Quartz cured. Updating the corpus-verify script pin, then the live UI verify.
All pins hold, the quote reads "There's". Now rebuilding the remediated tree and booting for the live UI verify.
The upload input needs the cvupload tab + a selected job. Fixing the verify flow.
The programmatic `.click()` doesn't activate Radix tabs — using real CDP clicks via snapshot refs.
The snapshot's composite attribute form bit me — the §3.90 lesson. Fixing the regex.
The python assert aborted before writing. Editing directly.
Upload works but the parsed text isn't rendering yet — checking the post-upload surface and timing.
The UI renders the score, not the raw text — the verify must read the candidate's stored cvText from the API.
**LIVE UI VERIFY PASSED** — the real file through the UI stores "There's" (U+2019), zero U+FFFD. Now sweeping the probe candidate (DB-pristine protocol).
Three probe candidates accumulated from the verify runs — sweeping all.
All swept — DB pristine. Fixing the script's sweep step for posterity, then kicking the final E2E gate.
E2E gate running (~11 min). While it runs — the docs layer. First the plan's execution appendix.
Now the session narrative (session_247.md):
E2E at 53/559. Writing the AGENTS.md session-108 layer while it runs.
Now the SKILL.md v3.95.0 bump + §120 lesson.
Now the count lockstep across CLAUDE/README/AGENTS (1056→1060, 1615→1619).
Count lockstep done. Now the worklog round-107 entry.
E2E at 152. Reviewing the full change set while it runs.
**FINAL E2E GATE: 559/559 — a clean 11.1m run.** All gates green. Now the mobile-nav pair re-verify on the remediated build.
**PARITY holds on the remediated build.** Now the desktop screenshot set.
12 r108 screenshots. Final pre-commit protocol: DB pristine check + final gates.
All gates green. Cleaning up and preparing the commit — checking the SSH wrapper protocol.
Shim ready. Writing the operator key and committing the round.
## Round Complete — Session 108 / Parity Round 107 pushed ✅

**Commit `a7285af` on `main`, remote verified, operator key shredded, tree clean.**

**The 13th-writer round** — the four-round Quartz hunt finally sourced a macOS Quartz PDFContext file, and it exposed two stacked decode defects, both cured TDD-first:

- **R108-A**: the committed probe script broke `tsc`/`build` on fresh clones (a literal `/tmp` import) — fixed
- **R108-B**: the UTF-8 stream decode (every high byte → U+FFFD) + the MacRoman named encoding (0xD5 = ', matching pdftotext) — plus the **IRS activation**: the fix woke the r105 ZapfDingbats marker dormant on the real f1040 (73 checkboxes now spec-correct)
- **R108-C**: the s199 dialog-a11y census — 58 states, zero defects

**Parity**: 72nd deploy non-visual; mobile-nav pair PARITY; no Tailwind v4 regression. **Gates**: lint 0/0 · tsc ✓ · 1060/1060 unit · E2E 559/559 · DB pristine.

**Next**: the r109 queue — the WinAnsi raw-literal remap (new watch), width table, 73rd-deploy watch, and the standing watches.
