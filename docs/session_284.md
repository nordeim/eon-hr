# Session 120 — Execution Transcript

The round's working log, as it happened (the progress narration for the
next round's context).

1. Workspace fresh-cloned (the sandbox reset — both eon-hr and neo-crm
   re-cloned). Core docs read (CLAUDE, README, the r119 plan +
   session_280/281 + the worklog tail); the environment rebuilt (bun
   install 523 packages, `.env` with `DATABASE_URL="file:../db/custom.db"`
   + a fresh AUTH_SECRET, db:push + db:seed). Baseline gates: lint 0/0 ·
   unit 1145/1145 — the documented session-119 close state; **tsc RED —
   the round's first find**.
2. The tsc/build failure diagnosed: 23 census scripts importing
   `/tmp/r116-r119-proto/cv-text` — the fresh-clone reproducibility
   defect (the neo-crm s210 genus; s210 checked out the same hour as this
   round's opening — the transfer consumed directly).
3. The corpus re-sourced (the fresh-sandbox intake): the seven members
   re-downloaded (dvipdfmx via texdoc.org — the mirrors.ctan.org 404;
   QUARTZ via the `xmlcalabash/test-suite` submodule trail, file md5
   `27575d59` EXACT), the LO Calc member not re-sourceable (the r103
   precedent), the families regenerated through their committed
   generators (typst 0.15.1 installed; the Playwright chromium 1248
   shell; the WeasyPrint/fpdf2 scripts). All 7 pins + 4 Typst members +
   16 family members EXACT at HEAD.
4. The opening read: the 84th-deploy watch — the login JS moved
   (`OLDXOew4`→`CKrafp-m`), the render byte-identical to the `69aa4241`
   baseline → NON-VISUAL login-side-only; the app side QUIET. The
   mobile-nav pair PARITY (the user's named focus). The patch watch:
   16.4.3 latest, the Nov 3 release not landed → the `^16.4.2` HOLD
   stands. The advisory census unchanged.
5. THE HUNT: the bx-coverage census re-run (arXiv/dvipdfmx/fontspec/IRS/
   QUARTZ/WeasyPrint 0.0%); the diagnosis script built (the first draft
   hit the WHATWG latin1 = windows-1252 re-encode corruption — the
   byte-safe rewrite); the three layers measured; the piece-level
   resolution trace (the /tmp/r120-diag instrumentation).
6. The candidate prototyped (/tmp/r120-proto); the first drift ledger
   showed AWAY drift on four members — the fire-separation censuses
   began (the first census draft had the cross-page flattening bug —
   the r118 lesson's mirror, caught in-round).
7. The root causes, each verified against poppler's word boxes: the
   kern-sign inversion (the "a → self-speculative" pair: true 0.33 em,
   measured 7.8 em); the Tw/Tz blindness (the Prawn ":overflow" cell:
   true ~0.4 em, measured 3.07 em — the `1.16165 Tw` discovery in the
   raw stream); the TOC leader anchors (the fontspec/dvipdfmx same-block
   dot runs + the IRS per-dot repositioned pieces).
8. The cures iterated on the candidate: R120-A (the indirect arrays) →
   R120-B (the bindings) → R120-C (the fallback) → R120-D (the sign) →
   R120-E (the leader guard — the first draft missed the same-block step-0
   form and the repositioned-dot form; the extended guard covers both) →
   R120-F (the Tw/Tz). **The drift ledger: TOWARD on four members,
   IDENTICAL everywhere else, zero away.**
9. The remediation plan written (docs/remediation-plan-session120.md) and
   validated against the codebase; the TDD round: the session-120 spec
   block (the fixture min-alnum floor caught — a 32-alnum CV reads ""),
   RED 7/7 + 3 born-green guards.
10. The implementation applied to the real source — **the crash-before-
    write trap hit**: the patch script died mid-list (an escaping bug at
    the F3 edit) leaving the console saying "applied" while the file
    never changed; the follow-up patches landed F-only, then A-E. A
    careless `git checkout` during the mutation-runner debug reverted
    the cured source — **the /tmp proto copy saved the round** (the hook
    stripped, the cures verified present, 153/153 green again).
11. The repoints (27 scripts → the committed proto; the path bug
    `../protos` → `./protos` caught by tsc); the proto regenerated; the
    mutation matrix run (the stale-json trap — a mis-quoted spec list
    leaves the PREVIOUS output.json; the argv fix) — measured: M1 4 ·
    M2-M6 2 each · DM1/DM2 1.
12. The ground truth: arXiv/dvipdfmx/fontspec re-pinned at the cured
    md5s (alnums exact); the families + the Typst probes verified; the
    build ✓ (116/116).
13. The live UI verify: the WeasyPrint CV through the real upload flow —
    name-first, aiScore 23, dateSplit TRUE ×2 in the stored cvText;
    swept by the REAL id; the DB PRISTINE. The 10 screenshots (6 desktop
    + the mobile-nav pair both sides) captured and verified non-blank.
14. The E2E gate launched detached (the node-spawn protocol) — **559/559,
    a clean 11.0m run**; the docs layer worked in parallel (the count
    lockstep 1158 + 559 = 1717; the AGENTS session-120 layer; the SKILL
    v4.7.0 §132; the plan's ToDo updated; the worklog round-119 entry
    with the r121 queue armed).
15. The commit `b7ac880` + the SSH-wrapper push (the dry-run first, then
    the real push — remote verified `main @ b7ac880 == local HEAD`, the
    tracking ref synced, the keys shredded).
16. The close-log correction: the narrative initially overwrote the r119
    close-summary slot (session_279.md) — restored from git, the
    round's narrative moved to session_282.md, the close-summary
    (session_283.md) and this transcript (session_284.md) follow as the
    close-log commits.

## Round summary

**Session 120 / Parity Round 119 — THE WIDTH-BLIND ELIMINATION ROUND —
pushed to `main`** (`b7ac880` + the close logs, remote refs verified, keys
shredded, tree clean).

**The material**: the fresh-clone reproducibility cure (the s210 genus —
the committed census proto + the three-arm pin) and the width machinery's
full un-blinding through six measured cures — with the three stacked
tracking errors (the kern sign, Tw/Tz, the leaders) found by the
fire-separation measurement and killed before any code shipped.

**The verification**: RED 7/7 → GREEN **1158/1158** → the mutation matrix
measured; the zero-away drift ledger (TOWARD on four members); the three
re-pins alnum-exact; the live UI verify reading the r120 splits through
the real upload flow; the DB pristine; the E2E 559/559; the mobile-nav
pair PARITY (no Tailwind v4 regression); the 84th deploy QUIET.

**Next steps when you're ready**: the r121 queue is armed in the worklog —
the November 3 security-release bump decision (the release lands
tomorrow), the resume2 intra-block under-tracking, the ReportLab TOC
dot-order divergence, the remaining blind pockets, and the standing
watches.
