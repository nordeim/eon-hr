The workspace exists with a clean tree at commit `67b882f` (session-106, parity round 105, already pushed). Let me refresh and check the state of the referenced documents.
The pull brought in `docs/session_243.md` from the remote. Let me check what it contains and its provenance.
One new commit `769e4a2` came from the interrupted session — it only added `docs/session_243.md`. Let me read it plus the other referenced documents to understand where the interrupted round stood.
Session-106 (Round 105) completed and pushed; session_243.md is its log. **This round is Session 107 / Parity Round 106.** Let me review the key documents — session_242, the remediation plan, the worklog tail, and the r107 queue source (session_241).
Both docs are clear. Now the r107 queue from session_241.md and the worklog tail:
Full round-105 context established. Now let me verify the environment state (.env, db, test configs) and check the AGENTS.md protocol layer:
Environment is fully in place. Now let me review the AGENTS.md session-106 layer (the protocol) and the skills catalog:
Full protocol context established. This is **Session 107 / Parity Round 106**. Let me check the standing probe scripts and skills catalog:
The r106 probe infrastructure exists. Let me examine the deploy-watch and nav-pair probes to adapt them for r107:
I have the full probe patterns. Let me check the corpus state, boot script, and screenshots baseline:
Workspace is **fully intact** — corpus PDFs, chromium-1248, screenshots, node_modules all survived. This round is **Session 107 / Parity Round 106**. Let me set up the round plan:
Now validating the session-106 changes in the codebase — the three legs of R106-A in `src/lib/cv-text.ts`:
All three R106-A legs validated in the code. Now running the baseline gates:
Lint 0/0 · tsc ✓. Now the unit gate:
**Baseline gates GREEN: lint 0/0 · tsc ✓ · 1051/1051 unit** — the session-106 close re-verified. Now the opening read — the deploy-watch probe. Let me check the baseline PNG state first:
The standing render baseline is `69aa4241…`, agent-browser available. Writing the r107 opening-read probes (adapted from the r106 pattern):
**THE 71st-DEPLOY WATCH: QUIET** — login JS/CSS unchanged from the 70th state (`C8D2zqWd`/`CZZ4z0cl`), render byte-identical (`69aa4241…`). No new deploy. Now the app-side census + the mobile-nav pair. Let me check the boot script's remainder first:
The standing build is current. Writing the r107 app census, boot script, and nav pair:
App side QUIET — the r42 baseline holds. Now booting the LOC server at :3200 and writing the nav-pair script:
**The mobile-nav pair: PARITY at the standing 70th state** — identical geometry both sides (28×28 hamburger, 288×844 fixed z-50 drawer), REF stay-open persists, clone keeps auto-close superset, `/employeedetail` REF-broken (66 nodes) vs clone superset (248). Let me check whether the fresh captures are byte-identical to the r106 pair (the same deploy state):
All four fresh captures are **BYTE-IDENTICAL to the r106-verified pair** — the VLM pixel-parity verification is inherited byte-for-byte. The opening read is complete. Now the audit phase. First, let me find the Tz/Ts queue item's origin context:
The Tz/Ts item is a long-standing watch ("until a real file surfaces"). Let me examine the operator walk's current handling of `Tz`/`Ts`:
The walk handles Tf/Td/T*/BT/TJ/Tm but has **no Tz/Ts tracking** — the watch's question is whether real files carry non-default values that distort the em-thresholds. Let me finish the file re-read (assembly section), then measure:
Full session-106 re-read complete — all three legs correctly implemented and consumed. Now the audit's empirical legs. The Tz/Ts census + the LO negative-tracking class both need real files. Let me find the LO guide URLs from the r102 scripts:
The URLs aren't in the docs. Let me write the Tz/Ts census script for the available corpus files, and try re-sourcing the LO guides in parallel:
All four available corpus members carry **ZERO Tz/Ts/Tc/Tw operators** — the watch class doesn't manifest in them. The LO guides (the PDF 2.0 members, the natural Tz/Ts carriers via their layout engine) need re-sourcing. Let me find them:
Found the URL patterns. Let me download the Calc 7.0 guide (the confirmed r102 member) and try the Writer guide variants:
Both LO guides downloaded (Calc 7.0 PDF 1.6, Writer 7.6 PDF 1.7). Now the Tz/Ts census on the LO files:
**DECISIVE: ZERO Tz/Ts/Tc/Tw operators across ALL SIX corpus files** (1,034 content streams in the LO guides alone) — the non-default Tz/Ts queue item has NO live target, refuted by measurement. Now the LO negative-tracking class — let me census the negative TJ numbers in the LO files and check for digit splits:
**THE LO NEGATIVE-TRACKING CLASS IS LIVE** — the r102 watch's exact prediction: the Calc guide carries 26 negative kerns in the −100…−200 threshold band, and the neighbors show sequential digits (`01 ← −116 → 02 ← −113 → 03…`) being split by the ≤ −100 word-gap rule. Let me measure the actual extraction damage — full corpus verify + the split-digit probe:
Pins: IRS/arXiv/dvipdfmx IDENTICAL, but **fontspec reads 106,179 vs the r106 close's 101,515 — a +4,664 drift on an unchanged tree**, and LO Calc reads 695,014 vs the 691,268 pin (+3,746). Same code, same files — this needs forensic isolation. Let me find the r106 member-check script that measured 101,515:
No r106 script measured fontspec's 101,515 — it was an ad-hoc measurement. Two drifts to isolate: fontspec (+4,664) and lo-calc (+3,746). First, determinism — run the extraction twice and compare, then check the file provenance:
All deterministic — the drift is file-side or measurement-side. Let me check the fontspec build date and test counting variants to see what the r106 101,515 actually measured:
No counting variant matches — let me test whether the r106 numbers describe the pre-fix code on THIS file (the M1-revert experiment) and what pdftotext reads:
Decisive: pre-fix=106,188 → post-fix=106,179 on the current file (delta 9), while the r106 docs say 101,529 → 101,515 (delta 14). pdftotext reads 105,799. The documented numbers were measured on **different bytes**. Let me search the r106 scripts for where 101,529 was computed:
The fusion census takes args — the r106 numbers came from the deleted first download. The critical forensic now: did the LO Calc reading change through the r103→r106 code changes (the LO pins were unpoliceable while the files were un-sourceable)? Let me run the **r102-era code against today's file**:
The r102-era code reads **695,014 — exactly what HEAD reads on this file**. The code path is stable; the pin delta is the file build. But the split-digit probe found 0 in the extraction despite 26 band kerns — let me trace where those digit pairs land in the extracted text:
The extraction has ZERO split pairs — the 26 band kerns don't manifest in the output. Let me trace the exact stream carrying `(01) -116 (02)` through the pipeline:
The trace regex only matched literal atoms — the LO digits are likely **hex atoms**. Let me fix the trace to accept both:
The band kerns ride **hex atoms `<01> ← −116 → <02>…` — sequential subset-font glyph codes**, in one content stream that PASSES all gates. The question is what these glyphs decode to and whether the −116 kerns split real words. Let me trace this stream's decoded output:
Sequential glyphs with heavy kerns and repetitions — this looks like a logo/decorative element. Let me decode what F15's glyphs actually render as and find this in the final extraction:
The ad-hoc decode gives garbish "This bokfr" — but my mini-census lacks the real extractor's page-tree chain. Let me check what the REAL extractor produces for this region:
The real extractor reads **"This book is adapted and updated from the LibreOffice 6.4 Calc Guide" — CORRECT and UNSPLIT**. The −116 kerns ride between glyph atoms but the words don't split — this smells like the R103-C space-glyph conditional already cures this class. Let me verify the push/condGap mechanics:
The mechanics say fromKern=true → condGap=FALSE → the −116 kern SHOULD split. Yet "This book" is intact — maybe it comes from a different stream. Let me identify stream 2836's content and find its exact landing spot in the extraction:
The band kerns are **display typography on the cover** — F14 26pt title + 20pt subtitle with tight display kerns, while the body text (F15 13pt) rides small −25..−35 kerns (all joins). Let me see the extraction's cover region and decode the title through F14's chain:
The extraction head **starts with the legalese — the F14 26pt title and 20pt subtitle are MISSING from the extraction entirely!** Let me decode the F14 title atoms through the file's chains to find what they should say:
The page's font map captured **"Font"→4234 — the /Font dict KEY matched as a font name** (`F\w+` matches "Font"). The real extractor falls back to the candidate chain (F14→4193→ToUnicode 4192). Let me decode the title through that chain:
**THE COVER TEXT**: title = "Calc Guide" (26pt), subtitle = "Working With Spreadsheets" (20pt), "About this book:" (13pt). Let me check whether ANY of these appear in the actual extraction:
**THE REAL R107-A DEFECT — THE LO DISPLAY-KERN CLASS**: at extraction @988030 the cover reads `"C a l c   G u i d e\nW o r k i n g   W i t h   S p r e a d s h e e t s"` — every letter split by the −113..−154 display kerns firing the ≤ −100 word-gap rule. Both covers (front + back, "Index | 545") are hit. Let me check the standing fixtures that police the kern rule before designing the fix:
The fixture landscape is clear: the R97 −120 and pdfTeX −322 guards have **no standalone space atoms** — a magnitude-banded conditional is safe for them. Before designing the fix, let me complete the blast-radius census: the (−200,−100) band + space-glyph co-occurrence across ALL corpus files, and the F-name candidate multiplicities (the R107-B theft vector):
The blast radius is measured:
- **arXiv**: 6 band streams but ZERO space-glyph streams → untouched by a conditional fix
- **fontspec**: 49 band streams (hex atoms — XeTeX font kerns, likely should join too)
- **lo-calc**: the 1 band stream = the cover (hex space glyphs present → the fix fires)
- **FIX B**: lo-calc's 545 pages are all referenced-/Resources; the cover's form (inline /Resources + referenced /Font) rides an ObjStm — the census's raw pass missed it, confirming the third page-form blind spot

Let me complete the remaining queue items — the Quartz time-boxed retry and the neo-crm session-195+ check:
Quartz hunt: no sourceable sample again (third round running) — stays a WATCH. Now the neo-crm session-195+ check:
neo-crm is at session-198 (sessions 195-198 landed since the last consumed layer 193/194). Let me scan them for methodology transfers:
The s196 doctrine — **the drawer-open spine freeze** (box-level geometry pins at TRUE 390×844) — is a genuine transfer candidate. Let me check what eon-hr's mobile-navigation spec currently pins:
The spec pins drawer width/height/rhythm but **not the interior spine boxes** — the s196 gap transfers. Let me check the 404 coverage (s195's doctrine) and run the advisories census (s198's doctrine) on eon-hr:
`bun audit` finds **2 HIGH advisories** (zod + deepmerge-ts) — the s198 triage doctrine transfers directly. Let me get the full chains and usage census:
The advisories census is complete. Now let me check the lockfile situation and the s197 sweep-state record before writing the plan:
Both lockfiles are committed (the override must land in package.json + bun.lock). The audit is complete. Before writing the plan, let me run the fix prototype in a throwaway script to pre-measure the expected real-file drift (the plan-validation discipline):
The prototype exposes **two problems**: arXiv drifts 15 lines (math kerns joining: "J(X; Y; t)" → "J(X;Y;t)") and fontspec line L1277 **catastrophically fuses** ("any effect on text" → "anyeffectontextinthisfont"). The band conditional is too coarse — xdvipdfmx writes real interword glue in the same magnitude band. Let me measure the per-run (BT-block) structure to find the sharper discriminator:
The per-run census reveals the true structure — the LO cover kerns sit between **single-CID atoms with uniform tracking** (every pair kerned, tight range), while fontspec/arXiv band kerns sit between **multi-CID word chunks** with mixed magnitudes. But fontspec @52186 shows a uniform −194 pattern too. Let me settle the contested members with pdftotext (the reference extractor):
pdftotext confirms: arXiv "J(X, Y, t)" and fontspec's line read **with spaces** — the band conditional is refuted; only the LO display class should join. The refined discriminator: **single-glyph atoms + 100% kern coverage + tight band** = display tracking. The critical check — the arXiv math arrays must fail the rule:
pdftotext settles it: spaces stay in both arXiv and fontspec. The refined rule — **the per-TJ-array display-tracking signature** (≥4 atoms, 100% kern-pair coverage, all kerns in (−200,−100], all single-glyph atoms) — joins only the LO cover class; the arXiv 2-atom math arrays and fontspec multi-CID chunks fail it. Now let me measure the drawer-open spine geometry for R107-C (the s196 doctrine transfer):
The sheet/header measured but the nav selector missed. Let me dump the drawer's interior structure to identify the spine elements:
The complete spine ledger measured. Now writing the remediation plan:
Plan written. Now validating against the codebase — studying the fixture helpers and the R106 spec patterns:
All patterns studied. Let me find the test file's insertion point and write the RED specs:
Now writing the RED specs + born-green guards (appending after the R106 specs):
There's a numbering bug in R107-B spec 1 — the `/Font 20 0 R` ref must target the fixture's actual object number (obj 9). Let me fix:
Now the RED verification — all three R107 specs must fail, both guards must pass, on the current code:
4 RED as designed, but the math guard was supposed to be born-green — a fixture bug. Let me see the actual output:
The fixture bug: `(;) -167 (Y)` outside a TJ array — the `(;)` isn't operator-adjacent so the regex drops it. The real form rides inside a TJ array. Fixing:
**RED 3/3 as designed + both guards born-green.** Let me confirm the RED reasons are the designed signatures:
The RED reasons are exactly right, but the A-spec fixture has a code collision (space "05" overwrote "G"'s code). Fixing:
**RED 3/3 with the exact designed signatures** — 'C a l c   G u i d e' (the real defect) and 'qwzv xjkjqvwwz…' (the chain theft). Now the GREEN implementation. Let me check all the F-pair collection sites first:
All five sites identified. Now implementing the GREEN — first the R107-A display-tracking signature in the TJ handler:
R107-A in. Now the R107-B three legs — the "Font" exclusion, fontRefOf links, and pendingFontRef queue:
Now the ObjStm harvest section + the post-walk resolution:
Now the post-walk resolution — the two-hop + the pendingFontRef loop:
All legs implemented. Running the GREEN verification:
**GREEN 1056/1056** (1051 + 5 net new). Now the mutation matrix M1–M5. Snapshot first, then M1 (the display-join reverted):
M1 → exactly 1 RED ✓. Restore, then M2 (single-glyph condition removed):
M2/M3 → exactly 1 RED each ✓. Now M4 (pendingFontRef queue removed) and M5 (fontRefOf link removed):
**M4/M5 → exactly 1 RED each.** The matrix is complete: M1→1, M2→1, M3→1, M4→1, M5→1 — every mutation bites exactly its own spec. Restore and verify byte-clean:
Two tsc fixes needed — the prototype script's .ts import and a type-narrowing issue in the display signature:
All gates green. The type refactor changed the file after the matrix — re-verifying M1's teeth on the final code, then re-snapshotting:
M1-recheck ✓ on the final code, restored byte-clean. Now the real-file ground truth — the full corpus member diff (HEAD's extractor vs the remediated one):
**GROUND TRUTH: ALL HOLDS** — 5 members byte-identical, lo-calc exactly 2 cover lines cured, matching pdftotext. Now R107-C — the spine e2e leg. Let me study the existing spec's drawer pattern:
Now writing the spine-freeze leg (the s196 doctrine, born-green):
The leg has a convoluted leftover line. Let me clean it up:
The poll's `.toBe()` doesn't return a value — fixing the readBox to poll-settle then read:
Now R107-D — the zod override (the s198 doctrine):
The audit dropped to 1 high but the nested copy shows 4.6.5 still. Let me inspect what the audit reports and the actual resolution:
The audit reads 1 (zod cured in resolution) but the stale nested 4.6.5 dir survives on disk — the s198 lesson: Node runtime would still load it. Clean reinstall:
Nested gone, audit at the documented 1 (deepmerge-ts dev-chain), lint green. Now the build gate — kill the :3200 server first (the port-holder protocol), then build:
Two build errors — the ground-truth script's .ts dynamic import and the poll timeout placement. Fixing both:
Build succeeded. Let me verify the page count and launch the E2E gate (the detached node-spawn protocol):
E2E gate running detached (~11 min). While it runs — the documentation lockstep. First the count-lockstep locations:
Let me check E2E progress, then do the count-lockstep updates:
Now README's three references:
Now the AGENTS.md session-107 layer (appending after session-106):
Now the SKILL.md v3.94.0 bump + §119 lesson:
The SKILL bump — the surgical version splice + State line + §119:
E2E at 68. While it runs — the plan's execution appendix:
Now the session narrative (session_244) while E2E runs:
**The spine leg FAILED** (45.1s timeout). Let me see the failure detail:
The spine leg timed out — likely the sheet selector (`[data-slot=sidebar-container], [role=dialog]` matches nothing INSIDE the dialog). While E2E finishes, let me write the worklog entry, then debug the leg:
Worklog appended. Now session_245 (the transcript):
E2E at 302. Let me review the full change set while waiting:
E2E done: **558 passed + 1 failed (only my new spine leg — the standing net all green)**. Now debugging the spine selectors against :3200:
The failure cause confirmed: `[data-slot=sidebar-container]` matches nothing (and the dialog isn't its own descendant). Also `div.flex.flex-col.gap-2` has **n=3** — I need the nth=1/nth=2 boxes before fixing the spec:
nth=1 is the **nav block**, not the footer — the footer is nth=2. Fixing the spec (the sheet read via panel.boundingBox + the footer index):
Spec fixed. Now the M6 mutation proof — find the drawer's brand header component and plant the s177-style regression:
The M6 mutation: plant `mb-2` on the logo row (the s177 shape — the header grows 89→97). Plant, rebuild, run the spine leg:
The mutation did NOT apply (anchor count 2) — yet the spine test STILL failed on unmutated code! My selector fix didn't cure it. Let me see the actual failure:
The real failure: the hamburger button never appears — my test landed inside the wrong `describe` block ("mobile page kicker") whose beforeEach navigates elsewhere. Let me check the structure:
My test has no navigation — it needs `page.goto("/dashboard")` (the first describe's beforeEach doesn't reach it). Fixing:
The test runs now and fails on a box assertion. Which one:
The sheet reads x=-122 — **the drawer's enter-animation is mid-flight** (the documented 500ms slide). Let me check the standing swipe test's settle pattern:
The established idiom: `waitForTimeout(700)` for the 500ms enter animation. Adding it:
**Spine leg GREEN.** Now the M6 mutation proof — with a disambiguated anchor (2 `flex items-center gap-3` occurrences exist):
**M6 proof: the pin RED exactly at the header box** (Expected 89 / Received 97 — the s177 shape caught). Restore, rebuild, and run the full mobile-navigation spec:
**Full mobile-navigation spec: 18/18** on the restored tree. Now the clean full-suite re-run on the final tree (the protocol's final gate):
**FINAL E2E GATE: 559/559 — the clean 10.9m single run.** All gates green. Now the mobile-nav pair re-verify on the remediated build + the desktop screenshot set:
**Pair re-verified on the remediated build: PARITY holds.** Now the desktop screenshot set:
Evidence set complete (10 r107 PNGs). Now the pre-commit protocol — DB pristine check, .env.example verify, final gates:
The DB check hit the documented sandbox false-export guard — re-run with `env -u DATABASE_URL`:
**DB pristine: 1 user / 0 candidates.** All checks green. Now the process cleanup + commit. Let me review the SSH push protocol first:
Full protocol understood. Process cleanup, then the commit:
The shim is ready. Now the commit — staging + the conventional message:
**Commit `a6228e2` landed** (43 files, 2132 insertions). Now the SSH-wrapper push sequence:
The wrapper defaulted to the wrong repo (task-management) — the explicit remote is needed:
Dry-run clean (`769e4a2..a6228e2` fast-forward). The real push:
## Round Complete — Session 107 / Parity Round 106 pushed ✅

**Commit `a6228e2` on `main`, remote verified (`refs/heads/main == local HEAD`), operator key shredded, working tree clean.**

**The display-tracking round** — the round that refuted its own queue's named item by measurement:

- **Tz/Ts: REFUTED** — zero `Tz`/`Ts`/`Tc`/`Tw` operators across all six corpus members (1,034 LO content streams included)
- **R107-A (the real defect, fixed)**: the Calc guide's covers extracted as **"C a l c   G u i d e"** letter-split soup — LibreOffice's display tracking (−113..−154 kerns between every letter) firing the word-gap rule. The naive band conditional was refuted by prototype (it fuses xdvipdfmx glue + pdfTeX math); the cure is the **per-array display-tracking signature** (every pair kerned + all in (−200,−100] + single-glyph + ≥4 atoms). Corpus: 5 members byte-identical, exactly the 2 cover lines cured — matching pdftotext
- **R107-B**: the third page-form blind spot (the referenced `/Font` dict + the false "Font"-key capture) — drift-free hardening
- **R107-C/D**: the neo-crm s196/s198 doctrine transfers (the drawer-open spine freeze, mutation-proven at the header box; the zod override + the stale-nested sweep)

**Parity**: 71st deploy QUIET; mobile-nav pair byte-identical to the r106-verified state; auto-close superset intact; no Tailwind v4 regression.

**Gates**: lint 0/0 · tsc ✓ · 1056/1056 unit · build ✓ · E2E 559/559 (clean 10.9m run) · audit at the documented state · DB pristine.

**Next**: the r108 queue (docs/session_244.md) — width table (watch), Quartz hunt, 72nd-deploy watch, and the standing watches.
