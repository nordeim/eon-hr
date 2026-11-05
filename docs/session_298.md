# Session 126 — Parity Round 125 (2026-11-05)

The round's process narrative (the worklog entry carries the measured
close; this is the working log).

1. Workspace reset — fresh clone at HEAD `8271ee8` (the session-125
   close + the transcript logs). The round is **Session 126 / Parity
   Round 125** with the r126 queue armed.
2. Core docs reviewed: CLAUDE.md (the six-phase workflow, the parity
   principles, the Tailwind v4 trap log), AGENTS.md (the session-125
   layer), the r125 remediation plan + the session_296/297 transcripts,
   the worklog round-124 entry. The r126 queue: the arXiv residual
   18-piece pocket, the Typst sub-em residuals, the standing watches.
3. Environment: bun 1.3.14 ✓, node v24 ✓, bun install ✓, .env from
   .env.example ✓, db:push + db:seed (the seeded admin + the 21/21 +
   30/30 balances) ✓. Baseline gates reproduce the documented close
   exactly: lint 0/0 · tsc ✓ · 1189/1189.
4. The corpus re-source (the fresh sandbox): all 7 downloaded members
   re-sourced (dvipdfmx via texdoc.org — the mirrors.ctan 404 again;
   QUARTZ via the corrected submodule trail `xmlcalabash/test-suite` at
   `test-suite/documents/longer.pdf`, md5 `27575d59` EXACT; ReportLab
   `0f64df85` + Prawn `699ebcab` EXACT first try; LO Calc not
   re-sourceable — the r103 precedent). typst 0.15.1 re-installed;
   chromium-1248 re-installed; the Typst ×4 + WeasyPrint ×6 + fpdf2 ×5 +
   Skia ×5 families regenerated. The drift ledger ALL-IDENTICAL at HEAD
   (the post-r125 pins: arXiv `1c189607`, fontspec `9366f8a9`); the 16
   family members EXACT; bx: arXiv 99.9% · IRS 100.0% · ReportLab 100.0%.
5. The audit legs dispatched as parallel subagents: the REF-watch (the
   90th-deploy watch) and the neo-crm HEAD audit (baseline `b0bb8cd`).
6. The REF-watch returned: **the 90th deploy shipped** — the login
   JS+CSS both churned (`6xnUqbWf`→`DyOb2xUE`,
   `BVWWKVEJ`→`Bt66wgTd`), the app side HELD (the r42 baseline) — but
   **NON-VISUAL**: both pinned captures byte-identical (login
   `e04112c8` 167,497 B, dashboard `965b41b0` 190,117 B — first pass,
   no animation-in-flight); the warm tokens byte-stable; the mobile
   drawer STILL-OPEN after /training (the 69th-deploy regression
   standing through the 90th; 288px z:50 opacity 1); no anomalies.
7. The neo-crm audit returned: HEAD `36aee3e` — 4 commits since
   `b0bb8cd`, ZERO src changes (s213 + s214 both test-census rounds —
   the facts-census semantic-prose pins and the auth-bullet semantic
   census; src/ last touched at the s212 ship). Nothing code-level to
   transfer; the s214 OPERATIONAL lesson (a fresh-clone sandbox reset
   resurrected a stale parent-of-repo `db/custom.db` — the phantom
   hazard) transferred as this round's D-126a. The new baseline
   `36aee3e`.
8. The hunt: the instrumented blindness-cause walk on the arXiv residual
   — **12 blind events**: 1 `code-uncovered` (the f-0-0 code 122 'z' at
   px 1509 py 38 ps 54) + 11 `odd-bytes` ALL rawLen=0 (EMPTY shows — the
   r125 queue's "odd-length raws" description was the census bucket, not
   the byte shape). The damage census: the 11 empties are isolated (zero
   downstream pieces denied bx); the residual reconciles as 7 (the 'z'
   block cascade) + 11.
9. The 'z' anatomy: the piece lives in the figure text "to create
   different sized models with shared weights" (page 8, the per-glyph
   show form). The font f-0-0's candidate chain resolves to obj 292
   (GTDJSU+NimbusSans FC 32 LC 121 — code 122 OUTSIDE). The form (obj
   321, `./figures/motivation.pdf`) declares its OWN
   `/Font << /f-0-0 439 0 R >>` — and obj 439 (CIJKLF+NimbusSans FC 32
   LC 122) COVERS 122 at 500. The binding probe: pageBind=undefined on
   the part — the R125-D form binding never fired.
10. **THE ROOT CAUSE**: the F-prefixed pair scan
    `/\/([Ff]\w+(?:\.\w+)*)\s+…/` — **`\w` rejects the hyphen**. The
    `f-0-0` name never entered the `fonts` map; the R125-D gate
    (`fonts.size`) never fired. The fire-separation census (corpus-wide,
    both scan sites): 4 hyphen-name forms on arXiv (the matplotlib PTEX
    class: overview/motivation/early_exit_inference/
    self_speculative_decoding — f-0-0 declared 4× with the width tables
    diverging on 5/10/15 codes, f-0-1 2×), **73 ZaDb/T1_N forms + 2 raw
    pages on IRS** (the non-F-prefixed class — the AcroForm appearance
    streams and the pages 2403/1 whose inline /T1_N pairs the F-scan
    also rejects), zero everywhere else.
11. **THE SECOND ROOT CAUSE (the r120 asymmetry)**: the R120-B merge
    landed at the ObjStm page site — its comment names "the IRS T1_0
    class" — but the IRS pages are RAW-carried. The raw site never got
    the merge. The colliding T1_N objects (HelveticaNeueLTStd subsets
    riding ObjStms) carry PLACEHOLDER /Widths (uniform 500; obj 269
    571).
12. The patched-proto experiment (A+B+C): **arXiv bx 99.9% → 100.0%**
    (21,503/21,503) with alnums exact; IRS IDENTICAL; 10 members
    IDENTICAL; 16 families EXACT; 4 single-character decode corrections
    (ﬀ→ﬁ — "Use ﬁrst N layers", "Preﬁll Latency" ×2) — **pdftotext's own
    distribution is 4×ﬁ+1×ﬀ and the cured output matches it EXACTLY**
    (the HEAD read 5×ﬀ). The Typst sub-em band measured: 1/76 and 0/73
    gaps — output-neutral, the watch continues. The plan written
    (docs/remediation-plan-session126.md).
13. The TDD round: the four specs appended. THREE fixture traps hit and
    cured in-round: the 40-alnum isMeaningful guard (the first drafts
    returned EMPTY — the PAD block required, the r97 lesson's NINTH
    application), the catalog pointing at the PAGE instead of the PAGES
    TREE, and the object-number reindexing of the shared font templates.
    RED 3/3 + the odd-raw guard born-green.
14. The cures applied to `src/lib/cv-text.ts`: the R126-A merged-pairs
    form binding, the R126-B raw-page merge line, the R126-C empty-show
    guards (the literal + the hex). The proto resynced. GREEN 1192 — but
    the empty-show spec failed: the upgrade landed as
    "SeniorHRManager \nTechCorp" — the empty piece's walk-time separator
    polluting the boundary. **The never-" \n" doctrine**: the R119-A
    upgrade's walk-back now resets the zero-text pieces' separators (the
    clean emission). GREEN 1193 — then the hex-empty spec added (the
    `<>` atom never matches the walk's hex regex — the piece never
    exists; the whitespace-only `< >` atom is the real class; RED
    demonstrated by source revert). **GREEN 1194/1194** (1189 + 5).
15. The mutation matrix: M1-M4 exact (1 kill each). M5 (the sep reset
    dropped) killed **2** (both empty specs — the sep reset serves the
    whole zero-content class). M6 (the odd-raw blind inverted) killed
    **8** — the odd-guard spec + the 7 historical specs whose fixtures
    carry odd raws whose blind is load-bearing (the R118-A Skia em-dash
    + 0.5-em guards, the R121-A over-reach, the R122-B dots re-order,
    the R123-A squeezed + disjointness, the R125-B uncovered-code guard)
    — the conservative blind deeply pinned. The counts documented, the
    matrix re-run **EXACT**.
16. The final-source drift ledger: 11 members IDENTICAL + arXiv TOWARD
    (the new pin `75436914`; the classification via FILE-BASED dumps —
    the console.log trailing newline read as a phantom hunk in the first
    subprocess-based classifier, documented as the round's trap); the
    word-stream and line-form aggregates IDENTICAL; alnums exact; the 16
    families EXACT; **bx: arXiv 100.0% · IRS 100.0% · ReportLab
    100.0%**.
17. The D-126a parent-hygiene probe written
    (scripts/r126-parent-hygiene.mjs) — the ancestor-chain walk, the
    loud fail on any stray db/custom.db or prisma/schema.prisma above
    the repo root. This sandbox CLEAN.
18. The gates: lint 0/0 · tsc ✓ · 1194/1194 unit · build ✓ · E2E
    565/565 (the 3-chunk foreground split 211+176+180, zero failures —
    the chunking by spec file, one worker each).
19. The remediated server booted on :3200 (the health `{"status":"ok",
    "db":"up"}`). The live UI verify (the r104 protocol): the Typst
    resume2 probe through the recruitment AI-CV-Upload tab — name-first
    (namePos 0), dateSplit TRUE ×2, zero U+FFFD, swept by the REAL id
    (200). **DB PRISTINE (1/1/2/0/0)** — the first pristine run failed
    because the sandbox shell exports the parent's absolute
    DATABASE_URL (the documented trap; `env -u DATABASE_URL` the cure).
    The launch-verify probe: Leg A PASS (the clean .env-only launch, no
    phantom parent DB); Leg B LOUD (the sandbox-exported absolute URL —
    the server never comes up, no phantom created). The parent-hygiene
    probe OK.
20. The screenshots: the first mobile run hit the documented
    viewport-at-session-start trap (the Training link unmatched, the URL
    stuck at "/", the two mobile captures identical) — the standalone
    mobile session (a fresh 390×844-from-login session) cured it: the
    drawer-open captured, the Training LMS click → /training, the drawer
    DRAWER UNMOUNTED (auto-closed — the clone's pinned superset). All 8
    captures verified non-blank; the pixel diffs vs the REF: login
    0.0350% (the standing level), the dashboard 1 pixel in 1,024,000,
    the mobile-nav 1 pixel; the training diff the documented auto-close
    superset.
21. The docs layer: the remediation plan's ToDo updated, the AGENTS
    session-126 layer, the SKILL v4.13.0 banner + §138, the count
    lockstep (CLAUDE 1759 = 1194 + 565; AGENTS table 1194; README 1194),
    this narrative, the worklog round-125 entry.

**Session 126 / Parity Round 125 — complete.** The round delivered: the
arXiv residual 18-piece pocket **completed to 100.0% bx** (the hyphen
the F-scan never saw — the matplotlib forms' own bindings restored, the
'z' un-blinded, the ﬀ→ﬁ ligature decodes corrected to pdftotext's exact
distribution), the r120 raw-page asymmetry cured (the IRS T1_N pages
bind their own fonts), the empty-show zero-content doctrine (never a
blind; the clean-emission sep reset), and the parent-hygiene probe (the
neo-crm s214 operational genus). The 90th deploy watched (non-visual);
the visual parity standing; no Tailwind v4 regression.

**Next when ready**: the r127 queue — the arXiv figure-region
line-form residuals, the Typst sub-em residual watch, the standing
watches (the REF stay-open drawer through its 21st+ deploy; neo-crm
s215+ at `36aee3e`; the LO Calc re-source; the advisory census; the
next patch watch; the bun .env watch; the parent-hygiene probe).
