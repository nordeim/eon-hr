# Session 108 — the 13th-writer round (parity round 107)

The round the four-round Quartz hunt finally **SOURCED** (the xmlcalabash test-suite's `longer.pdf` — Producer "macOS Version 26.5 (Build 25F71) Quartz PDFContext", Bear-authored, PDF 1.3, 2 pages, md5 `27575d59…`) and whose file exposed **TWO stacked decode defects** — plus the round's own audit found the fresh-clone gate break. **Session 108 / Parity Round 107** — HEAD `92f0e8e` (the session-107 close + its session log), the workspace freshly cloned (the environment rebuilt per protocol: bun install, the QUOTED `.env` pair, db push + seed, playwright chromium; the corpus PDFs re-sourced with the r107-pinned md5s verified).

## The opening read — the 72nd deploy, login-side only

The login probe (r108, the r107 pattern): JS `index-BUB_QBH0`, CSS `index-Bwz2pKfc` — **BOTH moved from the 70th state → THE 72nd DEPLOY**; the app-side census QUIET (the r42 baseline `C-IrDy5f`/`BGNH4KkS` holds); the fresh login capture at the VERIFIED 1440×900 **BYTE-IDENTICAL** to the standing `69aa4241…` baseline → classified NON-VISUAL (the 69th/70th churn pattern, third repeat). The mobile-nav pair at 390×844: **PARITY** — both sides 28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer; REF 16 items (Close `display:none`), the clone 15 (the a11y supersets). The drawer fourth-deploy watch: the REF `/training` + STILL-OPEN (the 69th's flip persists through its third deploy); the clone keeps the AUTO-CLOSED superset. The REF-broken `/employeedetail` holds (66 nodes vs the clone's 248). No Tailwind v4 regression in the mobile band.

## R108-A — the fresh-clone gate break (fixed before the plan)

`bun run typecheck` and `bun run build` **fail on any fresh workspace**: the committed `scripts/r107-ground-truth.ts` carries `await import("/tmp/r107-head-cv-text")` — a literal `/tmp` specifier. The file existed at the r107 gate time; on the fresh clone the module is gone and the type-check dies (`TS2307`). The same class bit this round's own probe script (the `.ts`-extension variant). **The fix**: the variable-path import — invisible to the static resolver (the gate stays environment-independent) while bun resolves the module at runtime. tsc ✓ + build ✓ verified immediately. The §110 family's fourth member: a gate proves the tree at the moment it runs — a committed artifact whose type-check depends on /tmp state was never really gated.

## The 13th writer — R108-B, two stacked decode defects

The sourced file's text extracts cleanly (2,697 alnums, zero letter-soup — the r103/r104 walk rules hold the Quartz form), but one line reads **"There\ufffd s"** where pdftotext reads **"There's"**. The forensics:

- **LEG A — the UTF-8 stream decode**: `extractPdfText` decoded every INFLATED content stream through `new TextDecoder()` — **the UTF-8 default**. PDF content streams are byte strings: any byte ≥ 0x80 in a literal atom became U+FFFD before the decode tables ever saw it. The outer raw scan already used latin1; the inflated path silently bypassed it. The fix: `TextDecoder("latin1")` at the two stream-decode sites (the .docx XML paths stay UTF-8).
- **LEG B — the MacRoman named encoding**: the fonts declare `/Encoding /MacRomanEncoding` (both BearSansUI subsets, `LastChar 213` = 0xD5), and MacRoman 0xD5 is **' U+2019**, not Õ U+00D5. The measured atom: a RAW single byte `(\xD5)` in a Flate stream, kerned 35.5/18.1 (joins). The fix — the R105-B doctrine's second member ("a font that NAMES its encoding is its own ToUnicode"): the authoritative MacRoman table as a marker CodeMap, the objMacRoman census (raw + ObjStm), the /Font-dict-region name collector (the Quartz fonts are `/Tc2` — NOT F-prefixed; the pairs live inside `/Font << … >>` dict regions), the cmapsFor marker push, and the literal remap at assembly.

**The blast radius measured by prototype BEFORE the plan**: five members byte-identical through LEG A; arXiv the 49 pre-existing Type3-charproc garbage lines only (alnums unchanged — pdftotext extracts none of them); Quartz exactly the 1 quote line.

## The TDD round

RED 4/4 with the exact designed signatures (the U+FFFD defect verbatim ×3 + the Õ hex path) — one fixture-helper note: the new specs' describe block needed a local `encS` + the latin1 `encL` stream encoder (a high byte in a Flate fixture must deflate as ITS byte, not its UTF-8 encoding — the fixture-must-exercise-the-fixed-path lesson, ninth application). GREEN **1060/1060** (1056 + 4 net new). The mutation matrix: M1 (LEG A reverted) → exactly 3 RED (spec 4 GREEN — the hex text is ASCII in the stream) · M2 (the census removed) → 2 RED · M3 (the collector removed) → 2 RED · M4 (the literal remap removed) → exactly 1 RED (the hex path keeps its teeth) · M5 (the marker push removed) → 2 RED. The restored file re-verified green.

## The real-file ground truth — and the round's second finding

The member diff (HEAD's extractor vs the remediated one): dvipdfmx · fontspec · LO Calc · LO Writer **BYTE-IDENTICAL**; arXiv the garbage-layer-only drift; **the IRS member: the /Font-dict-region collector ACTIVATES the r105-B ZapfDingbats marker on the real file** — the 73 Form-XObject checkbox glyphs' `/ZaDb 268 0 R` pairs (NOT F-prefixed — the standing F\w+ scan never bound them) now resolve the marker: the 73 `<34>` atoms read \u2714 (the spec-correct Adobe reading) where the Latin-1 fallback read "4" (5,871 − 73 = 5,798 exactly). The R106-A "inert on real files" class repeating at the BINDING layer — the r105 fixture's F-name shape never exercised the real file's /ZaDb form. The pin re-anchored with the mechanism documented. **The QUARTZ member: exactly the quote line cured** — "There\u2019s going", matching pdftotext member-for-member, U+FFFD gone.

**The live UI verify (the r104 protocol):** the real file through the recruitment AI-CV-Upload tab → the candidate "quartz longer" persisted with the stored cvText carrying "There\u2019s going" (quoteCured: true, fffd: false) — the probe candidates swept, the DB pristine.

## R108-C — the neo-crm s199 doctrine transfer

The dialog-open a11y coverage census (the s199 F-172c criterion — a Radix Dialog's content is ABSENT while closed), in the eon-hr form: the runtime accessible-name census, two passes (the DialogTrigger set via the R25-pinned `aria-haspopup="dialog"` contract + the controlled-dialog set via the create-ish action buttons). **58 dialog-open states censused, ZERO unnamed controls** — the one candidate defect was a census ARTIFACT (Radix's internal `aria-hidden tabindex=-1` BubbleSelect mirrors, correctly excluded from the a11y tree; the comboboxes are named via `label[for]`). The s195 "already covered" pattern: the R37-A aria-contract pins + the R25 layer hold the surface. The census scripts commit for future rounds.

## The standing watches

The patch watch: **16.4.3 published 2026-10-23 — a non-security backport round** (font URLs, proxy runtime, OTel traces, the standalone React bootstrap); `npm audit --omit=dev` reads NO next advisory; the documented **^16.4.2 HOLD stands**. `bun audit`: the deepmerge-ts-only state (the documented dev-chain acceptance). Turnstile: 0-rendered. The Quartz hunt closes as SOURCED; **the corpus grows to SEVEN members (13 writer families)**.

## The close

Gates: lint 0/0 · tsc ✓ · **1060/1060 unit** · build ✓ · E2E 559/559 via the detached node-spawn protocol · the corpus pins all hold (the IRS re-anchored) · the DB pristine. The mobile-nav pair re-verified on the remediated build. The docs layer: the plan + its execution appendix · session_247 + session_248 · the AGENTS session-108 layer · SKILL v3.95.0 + §120 · the count lockstep 1060 + 559 = 1619 · the worklog round-107 entry · `.env.example` verified unchanged.

**Suggested next:** the r109 queue — the width table (still the watch), the positive-gap-writer class (standing), the non-ASCII /Differences remap (standing), the WinAnsi raw-literal remap (the new watch — the same named-encoding doctrine's WinAnsi member), the 73rd-deploy watch, the REF stay-open drawer (fifth-deploy watch), the standing watches.
