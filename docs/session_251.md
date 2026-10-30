# Session 109 — raw execution transcript (parity round 108)

The condensed execution log of docs/session_250.md — the same round from the operator's chair.

**The open.** The workspace CONTINUING (no reset — the r108 close intact, the corpus + environment alive). `git pull` brought `docs/session_249.md` (the session-108 process log). The five core docs re-read (AGENTS protocol head + the session-108 layer; CLAUDE; README; the architecture doc; the SKILL). The baseline gates: lint 0/0 · tsc ✓ · 1060/1060 unit.

**The opening read.** The r109 login probe: JS `BUB_QBH0` → **`XEFf4q1x`** (CSS unchanged) → **THE 73rd DEPLOY**, login-side JS only; the render BYTE-IDENTICAL (`69aa4241…`) → NON-VISUAL. The app census QUIET (the r42 baseline). The mobile-nav pair at 390×844: **PARITY** (28×28 hamburger + 288×844 drawer both sides); the drawer FIFTH watch — REF STILL-OPEN (the REF-side regression classification stands), clone AUTO-CLOSED; `/employeedetail` REF-broken holds (66 vs 248).

**The audit.** neo-crm at session-200 (the page-surface a11y coverage audit): consumed — already covered by the standing pins, no stale count claims in the specs (the s195 pattern). The patch watch quiet (16.4.3 latest). The advisory state matches the documented posture (deepmerge-ts-only). The /Differences watch: the p596 0x90 candidate is a structure-tree /Alt attribute — not content.

**The hunt.** The WinAnsi census: only arXiv declares it, no live page-content target (the alnum pin is non-alnum-blind). The surviving r108 candidates + the xmlcalabash test-suite: no hits. **ReportLab's own user guide sourced** (md5 `0f64df85…`) — the canonical family specimen: 15+ WinAnsi base-14 fonts, no ToUnicode.

**THE TOTAL-EXTRACTION FAILURE.** Our extraction: **0 chars** vs pdftotext's 213,156 alnums. The forensics: 138/147 streams declare `/Filter [ /ASCII85Decode /FlateDecode ]` — no ASCII85Decode leg in the extractor; the inflate fails on the armor; every stream silently dropped. **R109-A.**

**THE WHATWG DISCOVERY.** The first RED spec for the WinAnsi remap PASSED at HEAD. The trace: the fixture's 0x97 byte survives to the decoded stream, but `new TextDecoder("latin1")` produces **U+2014** — the WHATWG Encoding Standard maps the "latin1" label to **windows-1252** (verified empirically in bun; the same in node and browsers). The WinAnsi raw-literal class was already covered — the watch closes with two born-green pins. **R109-B.**

**THE DISCOVERY'S TWIN.** The aliasing breaks the r108 MacRoman literal remap on the C1 zone: `[\u0080-\u00ff]` never matches the cp1252 chars (0x87 → ‡ U+2021) — MacRoman 0x87 (á) / 0x80 (Ä) read "‡€". No live corpus target (the QUARTZ high bytes are all ≥ 0xA0), but spec-wrong. THE FIX: the char-space `MAC_ROMAN_LIT_REMAP` map. **R109-D.**

**THE BULLETS.** pdftotext reads 101 `•`, ours 2: the bullets are `(\267) Tj` octal literals under Symbol — the marker tables fired only on HEX atoms, and SYMBOL_FONT had **no high zone** (0xB7 → · the fallback). THE FIX: the authoritative high zone (generated through the AGL, verified against an all-bytes probe PDF through pdftotext) + the marker-font literal remap under the covering discipline. **R109-C.**

**The plan.** `docs/remediation-plan-session109.md` — written AFTER the prototype blast-radius measurement (all 7 standing members BYTE-IDENTICAL; the RL member 0 → 213,160 = 100.00% of pdftotext) and validated against the code sites before execution.

**The TDD round.** RED 5/5 with the exact signatures (the empty ×2, `·`-not-`•`, `ab`-not-`αβ`, `‡€`-not-`áÄ`) + 2 born-green pins → GREEN **1067/1067** (the A85 encoder fixture built for the stacked-filter specs — the fixture's-own-encoder lesson, tenth application). The in-round catch: the base-85 weight **52200625** (the first draft typoed 5220067 — right length, every byte wrong; caught by the python reference diff). The mutation matrix: M1→2, M2→2, M3→1, M4→1, M5→3 — each biting exactly its designed specs; the restored file green after each.

**The ground truth.** The member diff: all 7 standing members BYTE-IDENTICAL, every pin holds; the corpus grows to EIGHT members (the RL guide pinned 213,160 + the em-dash/bullet/zero-C1 member checks) — `CORPUS: ALL PINS HOLD`.

**The live UI verify.** The full guide through the recruitment CV tab: "Analysis failed / Validation failed" — the fix's own proof (the pre-fix build toasted "Couldn't read the CV text"; the remediated extraction returned 292,766 chars and hit the API's intentional 20K-char cvText cap). The airtight leg: a ReportLab-shaped CV-sized probe (python-generated, the authoritative a85 encoder) through the real UI → the stored cvText carries the em-dash, 4 × •, the U+2019 quote, zero U+FFFD. The probe swept (directly through Prisma), the DB pristine.

**The gates.** lint 0/0 · tsc ✓ (one type fix in a forensic script) · 1067/1067 unit · build ✓ (116/116 pages) · E2E 559/559 via the detached node-spawn protocol · the mobile-nav pair re-verified on the remediated build.

**The docs layer.** The plan + its execution appendix · the narrative (session_250) + this transcript · the AGENTS session-109 layer · the SKILL v3.96.0 + §121 · the count lockstep (1067 + 559 = 1626) · the worklog round-108 entry · `.env.example` verified unchanged.

## Round complete — Session 109 / Parity Round 108

The 14th-writer round: the WinAnsi watch became the hunt, the hunt sourced the ReportLab guide, and the guide exposed the missing ASCII85Decode leg (a total extraction failure on a mainstream writer) with the WinAnsi/WHATWG-aliasing discovery and the Symbol-literal/high-zone class stacked beneath — all cured TDD-first with the 5-mutation matrix, the corpus verified member-for-member (7 byte-identical, the new member at 100.00% of pdftotext), the live UI verify passed through the real upload flow, and the DB swept pristine. The 73rd deploy non-visual; the mobile-nav pair PARITY.

**Suggested next:** the r110 queue — the width table, the positive-gap-writer class, the non-ASCII /Differences remap, the uncompressed-content-stream watch (NEW), the 74th-deploy watch, the REF stay-open drawer (sixth-deploy watch).
