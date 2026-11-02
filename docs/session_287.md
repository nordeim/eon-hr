# Session 121 — Execution Transcript

The round's working log, as it happened (the progress narration for the
next round's context).

1. Workspace fresh-cloned (the sandbox reset). Core docs read (CLAUDE,
   README, the r120 plan + session_282–285 + the worklog tail); the
   environment rebuilt (bun install 524 packages, `.env` with
   `DATABASE_URL="file:../db/custom.db"` + a fresh AUTH_SECRET,
   db:push + db:seed). Baseline gates: lint 0/0 · unit 1158/1158 —
   the documented session-120 close state; tsc ✓ (the D-120a proto cure
   holding on the fresh clone), build ✓.
2. THE PATCH WATCH (the r121 queue's lead item): `next@16.4.4` LANDED as
   `latest` on npm — the November 3 security release (seven medium
   vulnerabilities per the October 27 advance notice). The lockfile
   pinned 16.4.2. **The decision: BUMP** — `bun add next@^16.4.4` +
   `eslint-config-next@^16.4.4`; lint/tsc/unit/build green on the bumped
   tree.
3. The first E2E attempt launched detached — **171 failures from test
   389** (`ERR_CONNECTION_REFUSED` at :3100: the standalone server died
   mid-run). No crash logs; the system has 3.9 GB and no swap, and the
   round's browser sessions + the :3200 dev server were running
   concurrently. The isolated re-run (everything else closed): **559/559
   clean, 10.8m** — environmental, not the bump.
4. The corpus re-sourced (the fresh-sandbox intake): arXiv, dvipdfmx via
   texdoc.org, fontspec, IRS, ReportLab, Prawn — all direct; **QUARTZ
   fought back** (the codeberg raw URL 404'd at 11 bytes — the fix: the
   extra-suite is a SUBMODULE, its documents live at
   `test-suite/documents/longer.pdf` in `xmlcalabash/test-suite`, found
   via the git trees API; file md5 `27575d59` EXACT); typst 0.15.1
   re-installed; the families regenerated. All 7 pins + 4 Typst + 16
   family members EXACT at HEAD.
5. THE OPENING READ: **the 85th-deploy watch — the deploy RENDERED** (the
   login JS AND the CSS moved; the render bytes differ from the standing
   baseline — the first visual login movement since the 69th). The
   member-by-member delta audit (pixel diff bbox → the social row + the
   or-divider only; computed-style census + a REAL mouse hover): the
   social-auth row moved cool slate → warm neutrals, the or-chip text
   neutralized; everything else byte-stable. The app side QUIET (the r42
   assets hold). The mobile-nav pair PARITY (the user's named focus; the
   REF stay-open regression through its SIXTEENTH deploy).
6. THE LOGIN CURE (D-121b): the measured-hex parity pins in the login
   page + the 4 E2E specs (R121-A/B/C/D — the fire-separation guard
   pinning the unchanged members) + the 3 dead-premise rewrites
   (auth.spec R38-K, recipes R38-F1/R38-K1/R39-A1).
7. THE HUNT (the r121 queue's named class — the resume2 intra-block
   under-tracking): the per-word census isolated a uniform ~45%
   under-advance on the f0 body-text blocks (the tracked end 259.7 vs
   the true 435.8); the raw /W read side-by-side with the parse found
   **THE ROOT CAUSE — ONE RANGE TRIPLE** (`15 16 485`) among the k-k-w
   singles: the strict triple detection dies, the pair fallback reads
   garbage (wrong widths where covered, BLINDNESS where a range-covered
   code lands as a pair value). resume (v1) all-singles (255 tokens) —
   accurate; resume2's longer text grew the subset past a same-width run
   (258 tokens) — the same writer, a different subset shape.
8. The TDD round: RED 1/1 + 2 born-green guards (two in-round fixture
   off-by-twos fixed — the PHRASE indexOf code mapping; the min-alnum
   floor hit again — the PAD must ride the CONTENT). The cure (R121-A):
   the range reading with the structural-disjointness pair-validity
   check + the full range expansion. **GREEN 3/3 → 1161/1161.**
9. The mutation matrix (the vitest-5 stale-json trap fixed — the JSON
   reporter writes `.vitest/json/output.json`, not stdout): M1 2 · M2 2 ·
   M3 1 — **the M3 finding**: the both-valid ambiguity's behavioral
   surface is EMPTY (the 4th spec untestable by construction; replaced
   with the documented finding note in the spec file).
10. The drift ledger: the 7 corpus pins HOLD; the Typst members'
    extractions byte-identical HEAD ↔ cured (the phantom gap inflated
    the MEASUREMENT, not the output — both verdicts SPLIT); the 16
    family members exact; the bx coverage unchanged. The measured cure:
    the worst line 19.99 vs the true 20.24 (was 31.29), the cert|year
    pairs accurate to ~0.25 em.
11. The rebuild + the final E2E gate on the remediated build — the
    R121-B hover spec's mid-transition read caught in-round (the
    transition-all duration-200 settle wait added); the docs layer
    worked in parallel (the plan + the narrative + the AGENTS layer +
    the SKILL v4.8.0 §133 + the count lockstep 1161 + 563 = 1724 + the
    worklog round-120 entry with the r122 queue armed).
12. The commit + the SSH-wrapper push (the dry-run first, then the real
    push — remote verified, the keys shredded).

## Round summary

**Session 121 / Parity Round 120 — THE SECURITY-BUMP + WARM-TOKEN +
RANGE-TRIPLE ROUND — pushed to `main`** (remote refs verified, keys
shredded, tree clean).

**The material**: the November 3 security release shipped (`next@^16.4.4`,
the first E2E's failure isolated to sandbox memory pressure — the clean
isolated re-run), the 85th-deploy login delta cured (the first rendered
login deploy since the 69th — the warm social row + the or chip, the
fire-separation guard pinning the unchanged members), and the resume2
intra-block under-tracking hunted to its root cause (the /W range-triple
parse defect) and cured with the structural-disjointness range reading.

**The verification**: RED 1/1 + 2 born-green guards → GREEN **1161/1161**
→ the mutation matrix exact (M1 2 · M2 2 · M3 1); the zero-away drift
ledger (the Typst members byte-identical); the measured cure 19.99 vs the
true 20.24 (was 31.29); the live UI verify through the real upload flow;
the DB pristine; the E2E **563/563** on the remediated build; the
mobile-nav pair PARITY (no Tailwind v4 regression).

**Next steps when you're ready**: the r122 queue is armed in the worklog —
the ReportLab TOC dot-order class, the remaining blind pockets (IRS 94.7% /
arXiv 97.3% / ReportLab 95.6%), the Typst sub-em residuals, and the
standing watches.
