The workspace exists with the eon-hr repo already cloned. Let me check its current git state and understand what's been done so far.
`git pull` brought in the new `docs/session_223.md`. Now let me set up the task plan and begin the deep document review.
Now I understand the session structure. Session 98 (parity round 97) just landed at commit `7e45143`. The next round is **Session 99 / Parity Round 98**. Let me read the core docs.
The persisted outputs are nesting. Let me read the files directly in controlled chunks.
Excellent. Now I have the session-98 picture. Let me read the remaining core docs — README and the architecture document.
The worklog tail gives me the full r99 queue. Now let me check the AGENTS.md structure and the skills catalog.
I've internalized the web-application skill. Now let me validate the codebase structure and environment alignment.
Environment is aligned: `.env` has the correct `DATABASE_URL="file:../db/custom.db"`, db/ at repo root, both test frameworks configured. Let me verify the test configs and run baseline gates.
Test infrastructure is fully in place. Let me check the environment guard and run the baseline gates.
The documented exported-`DATABASE_URL` trap is active (sandbox exports an absolute path into the parent dir). All Prisma CLI work will use `env -u DATABASE_URL`. Now the baseline gates:
All baseline gates green: lint 0/0, tsc ✓, 1001/1001 unit. Let me start the production build in the background and audit the frontier file while it runs.
Prisma client needs regeneration in this workspace. Let me fix that and use a persistent script.
DB is pristine (1 user / 0 candidates). Now let me audit the r99 queue's frontier file — `src/lib/cv-text.ts` — for the stream-delimiter variant candidates.
The frontier file is clear. The r99 queue names the **stream-delimiter space variant** (`stream \r\n` with a space — the current regex `/stream\r?\n/g` would miss it entirely). Let me check the existing test fixtures, then verify the hypothesis empirically.
All fixtures use the standard `stream\r\n` — the space variant is unpinned. Let me verify the hypothesis empirically with a probe script.
**R99-A VERIFIED** — four delimiter variants are silently lost: bare-CR `stream\r`, and all space variants (`stream \r\n`, `stream \n`, `stream  \r\n`). This is a real defect class matching the r99 queue's named candidate.

Now let me check the standing probe inventory and the REF-side opening read (deploy watch).
Let me create the r99 deploy-watch (checking against the 66th-deploy state) and run the REF opening read.
**REF is QUIET at the 66th deploy state** — both fingerprints unchanged. The r98 standing ladder classifications hold. Now the second queue candidate: a real Acrobat-produced PDF. Let me try downloading real-world PDFs.
The real PDF yields **0 chars** — a genuine extraction failure! Let me diagnose what the inflated streams actually contain.
Only one stream inflated, and it's binary (font data). The garbled Producer hints at encryption or unusual filters. Let me check the object dicts and the /Encrypt presence.
This PDF is **encrypted** (`/Encrypt` present) — extraction correctly yields "" (the right best-effort behavior). I need an unencrypted real-world PDF. Let me try more sources.
Two real findings: the arXiv paper **extracts fine** (112K chars), but the **W3C dummy.pdf yields 0** — an unencrypted, text-carrying real PDF that fails! Let me diagnose it.
**R99-B VERIFIED — a REAL defect class.** The W3C dummy.pdf (real, unencrypted, text-carrying) fails because it uses **hex strings** `<01020303> Tj` with a **subset-font ToUnicode CMap** (`<01>→D, <02>→u, <03>→m…` = "Dummy PDF file") — forms the current literal-only extractor can't read. The arXiv paper (literal strings) works fine.

Let me now run the standing scans (oklch, secrets, patch watch, space-y).
Standing scans clean. Let me check the space-y inline-flow watch and recharts grid watch.
Both watches hold. Now the mobile-nav verification (the user's emphasis). Let me examine the r98 REF nav probes to re-run them for r99.
Let me boot :3200 with the current build and create the r99 mobile-nav probes.
REF mobile-nav verified at the standing contract (28px hamburger, 288×844 fixed drawer, 16 items; /employeedetail still the empty shell). Now the clone-side pair:
**Clone mobile-nav: PARITY** — 28px hamburger, 288×844 fixed drawer, menu cycle `/training` + AUTO-CLOSED. Both sides verified working (the user's emphasis confirmed: no Tailwind v4 regression).

Now let me read the full cv-text test file to write the RED specs.
The E2E baseline takes ~11 minutes — let me start it in the background now (per the ALONE protocol) while I write the remediation plan.
E2E baseline running (18/550 green already). While it runs, let me validate the fix design with a prototype before writing the remediation plan.
**Prototype validated** — all 5 delimiter forms extract, the real W3C dummy.pdf now extracts ("Dumm y   PDF  fi le" via CMap decode), the arXiv paper gains text (115,900 chars — pdfTeX hex strings now decoded), the encrypted PDF correctly still yields "", and the literal path needs the existing unescape kept (my prototype skipped it — the real implementation won't).

Let me check E2E progress, then write the remediation plan.
E2E at 19/550, zero failures. Now the remediation plan:
Plan written. Now validating it against the codebase — let me study the session98 E2E spec pattern for the new spec design.
Plan validated against the codebase (seed job vocabulary, E2E pattern, count lockstep). Now the RED phase — writing the failing unit specs first:
Let me refine three specs — the r97 lesson (fixture must clear the 40-alnum guard and pin the RIGHT assertion) applies:
Now let me confirm the RED state against the unmodified code:
**RED 7/7 as designed** — all new specs fail, all 12 existing specs stay green. Now the GREEN phase — implementing the fixes:
Now the GREEN run:
One GREEN-phase catch — the 2-byte CID spec. Let me diagnose:
The r97 fixture-length lesson strikes again — "HR HR…" ×11 = only 22 alnums, under the 40-alnum guard. The fixture needs lengthening (not the code):
**GREEN 19/19.** The real W3C dummy.pdf now extracts its raw text ("Dumm y   PDF  fi le" — 13 alnums, correctly rejected by the too-short-CV guard; the unit spec pins the mechanism with CV-length vocabulary). The arXiv paper extracts fully. Let me check the E2E baseline, then write the E2E leg.
The E2E baseline died silently (process-group kill). The r98-close final gate (550/550) on this identical tree remains the documented baseline. Now the E2E leg — the new session99 spec with clean mutation-proof isolation:
Now the fast gates on the fixed tree, then rebuild:
Unit 1008/1008 (1001+7). Two fixes needed — the octal-escape TS error in my spec (must be literal backslash+digits like r98's) and a lint error:
The build compiled but hit the exported-`DATABASE_URL` trap during page-data collection (the sandbox's absolute path override). Per the documented protocol, the build must run under `env -u DATABASE_URL` — rebuilding cleanly:
Build clean. Now the born-green E2E run for the new spec:
**E2E born-green 2/2.** Now the mutation proofs at both layers. First the unit layer — Mutation A (revert the delimiter fix):
**Unit mutation A: exactly 2 RED** — the delimiter pins fire, everything else green. Now Mutation B (neutralize the hex/CMap decode):
**Unit mutation B: exactly 5 RED** — clean isolation again. Restore, then the E2E-layer mutation proofs with rebuilds:
**E2E mutation A: exactly 1 RED** — the R99-A spec fails, R99-B and session98 stay green. Now mutation B:
TS narrowing issue with the mutation form — fixing it:
**E2E mutation B: exactly 1 RED.** Both fixes mutation-proven at both layers. Now restore, rebuild (the r98 REBUILD-AFTER-MUTATION-RESTORE rule), and boot :3200 for the live verify:
Now the live post-fix verify. Let me check the r98 upload-evidence pattern (the agent-browser upload quirk was documented):
I have the full pattern. Let me build the r99 live-verify fixture (both new paths in one real-shaped file) and the verify script:
**LIVE POST-FIX VERIFY: GREEN** — the analysis card rendered (r99 real cv, AI score 12/100, Skills match 17%, matched keywords admin/tech/technology/specialist), API row persisted, cleanup 200. Let me re-verify the mobile nav on the remediated build and check DB pristine:
Mobile nav parity confirmed on the remediated build, DB pristine. Now the FINAL E2E gate — ALONE protocol (all browser sessions closed first):
Final E2E running. Now the docs layer — first let me check the AGENTS.md session-98 layer format:
Now let me write the docs layer. First the SKILL.md §111 + version bump:
Now the AGENTS.md session-99 layer:
The background E2E died again — the sandbox reaps detached processes. Let me test survival mechanisms:
The node-spawn protocol survives but shell setsid doesn't. Let me use the same mechanism for the E2E gate:
E2E gate running detached (30 specs, 8 workers). While it runs, the count-lockstep updates:
Now the session_224.md narrative:
Now the remediation plan's execution appendix and the worklog entry:
E2E at 103/552. While it runs, let me verify the evidence chain and review the change set:
All evidence in place. Let me verify the final file states and the README edit, then wait for the E2E gate:
All states verified. While the E2E runs, let me prepare the SSH push infrastructure per the repo's skill doc:
Let me deploy the paramiko shim (outside the repo) and materialize the operator key:
Key verified. Checking E2E progress:
E2E at 167/552, zero failures. While waiting, final pre-commit checks:
Gitignore solid. Waiting for the E2E gate to complete:
**FINAL E2E GATE: 552/552 GREEN (10.5m, zero failures).** All gates pass on the remediated tree. Final DB check, then commit:
Commit `f28c4eb` landed. Now the SSH wrapper push — dry-run first:
Dry-run clean (`b780125..f28c4eb` fast-forward). Executing the real push:
**PUSH VERIFIED** — remote main @ `f28c4eb` == local HEAD. Shredding the operator key per protocol and cleaning up:
## Round complete — Session 99 / Parity Round 98 landed ✅

The full pipeline ran end-to-end: workspace refreshed, all docs internalized, codebase validated, audited with the repo's skills, and both r98-queue candidates pinned as **verified defects, TDD-fixed, and mutation-proofed** at both layers:

- **R99-A — the stream-delimiter matrix:** bare-CR and every space-form delimiter (`stream \r\n`, `stream \n`) silently lost the whole stream. Fixed with the generalized regex + the endstream guard.
- **R99-B — the hex-string + ToUnicode CMap class:** a **real downloaded W3C dummy.pdf extracted zero characters** (hex glyph codes + a trailing bfchar CMap — forms no crafted fixture had ever exercised). Fixed with the third operator alternative, TJ hex atoms, and the two-phase CMap-collecting walk.

**Everything else verified:** REF quiet at the 66th deploy, mobile-nav **parity live on both sides** (your emphasis — menu cycle works, no Tailwind v4 regression), all gates green (1008 unit + 552 E2E), live UI verify at AI score 12/100, docs in lockstep, and the push **verified** (remote main == `f28c4eb`, key shredded).

**Suggested next:** the r100 queue in `docs/session_224.md` — the ObjStm compressed-object edge and a real Acrobat-distilled PDF pin are the next CV-flow candidates.
