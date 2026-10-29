# Session 108 — raw execution transcript (parity round 107)

The condensed execution log of docs/session_247.md — the same round from the operator's chair.

**The open.** The workspace RESET — the fresh clone at `92f0e8e` (the session-107 close + session_246); the environment rebuilt per protocol (bun install 524 pkgs, `.env` with the QUOTED `DATABASE_URL="file:../db/custom.db"`, db push + seed, playwright chromium-1248). The baseline gates: lint 0/0 · **tsc RED** (the committed `r107-ground-truth.ts`'s literal `/tmp` import — the fresh-clone gate break, R108-A) · 1056/1056 unit.

**The opening read.** The r108 login probe: JS `BUB_QBH0` + CSS `Bwz2pKfc` — BOTH moved from the 70th state → **THE 72nd DEPLOY**; the render BYTE-IDENTICAL (`69aa4241…`) → NON-VISUAL; the app census QUIET (the r42 baseline). The mobile-nav pair at 390×844: **PARITY** (28×28 hamburger + 288×844 drawer both sides; the REF 16 items Close `display:none`, the clone 15 supersets). The REF stay-open persists (the fourth-deploy watch); `/employeedetail` REF-broken (66 vs 248).

**The audit.** The neo-crm check: session-199 landed (the a11y dialog-open coverage doctrine) — consumed as the census below. `bun audit`: the documented deepmerge-ts-only state. The patch watch: 16.4.3 published — non-security (the release notes: font URLs, proxy runtime, OTel, the standalone React bootstrap) → the ^16.4.2 HOLD re-verified. The Quartz hunt, fourth round: **SOURCED** — the xmlcalabash test-suite's `documents/longer.pdf` (the codeberg submodule trail: `.gitmodules` → the test-suite repo → the raw file), Producer "macOS Version 26.5 (Build 25F71) Quartz PDFContext", 70,017 bytes, PDF 1.3.

**The corpus re-sourced.** The six standing members re-downloaded with the r107-pinned md5s verified: fontspec `752e9929…` (texdoc.org), LO Calc `dbb10a2b…` + LO Writer `0aee12c6…` (documentation.libreoffice.org), IRS + arXiv + dvipdfmx (the canonical sources). **All six pins + both member-level cures verified on the fresh workspace before any code change.**

**The 13th-writer forensics.** The Quartz extraction: 2,697 alnums, zero soup, all word probes hit — but "There\ufffd s" where pdftotext reads "There's". The root cause, two layers: [LEG A] `new TextDecoder()` — the UTF-8 default — on every INFLATED content stream (byte 0xD5 → U+FFFD before any table); [LEG B] the fonts declare `/Encoding /MacRomanEncoding` and 0xD5 is ' U+2019, not Õ. The blast radius measured by prototype FIRST: five members byte-identical, arXiv the 49 Type3-charproc garbage lines only, Quartz exactly 1 line.

**The plan.** `docs/remediation-plan-session108.md` — R108-A (fixed in-round), R108-B (the two-leg fix), R108-C (the s199 census), R108-D (the standing watches). Validated against the code sites (the marker-table shape, the collector sites, the assembly seam) and the fixture patterns (a local latin1 `encL` encoder needed — the TextEncoder default would UTF-8 the high bytes).

**The TDD round.** RED 4/4 (the U+FFFD signatures ×3 + the Õ hex path) → GREEN **1060/1060** after the five legs (the two TextDecoder sites; the MAC_ROMAN table + CodeMap; the objMacRoman census [raw + ObjStm]; the /Font-dict-region collector [raw + ObjStm]; the cmapsFor marker push + the literal remap). The mutation matrix: M1→3 RED (spec 4 GREEN — the LEG-A isolation), M2→2, M3→2, M4→exactly 1 (the hex path's independence), M5→2 — every mutation bites exactly its designed specs; the restored file green (md5 `52c8159b…`).

**The ground truth — and the second finding.** The member diff: 4 byte-identical, arXiv garbage-only, **the IRS member ACTIVATED the r105-B ZapfDingbats marker** (the 73 `/ZaDb` checkbox pairs — NOT F-prefixed — now bind; "4" → \u2714, the spec-correct reading; 5,871 − 73 = 5,798 exactly) — the R106-A inert-on-real-files class at the BINDING layer. The pin re-anchored. The QUARTZ member: the quote line cured, U+FFFD gone.

**The live UI verify.** The real file through the recruitment AI-CV-Upload tab (the ref-click protocol — the Radix tabs need REAL pointer events; the §3.90 composite-attribute regex for the snapshot) → the candidate "quartz longer" persisted, the stored cvText carries "There\u2019s going" (quoteCured: true, fffd: false) — the probes swept, the DB pristine.

**The s199 census.** Two passes (the `aria-haspopup="dialog"` triggers + the controlled-dialog create-ish buttons): **58 dialog-open states, ZERO unnamed controls**. The loans/assets "defect" was the census artifact (the Radix BubbleSelect mirrors — `aria-hidden`, `tabindex=-1`, correctly out of the a11y tree; the comboboxes named via `label[for]`). The surface holds — the census scripts commit.

**The gates.** The build (after one type fix in the ground-truth script — the untyped `never[]` array); the final E2E gate ALONE via the detached node-spawn protocol; the mobile-nav pair re-verified on the remediated build; the desktop screenshot set.

**The docs layer.** The plan + its execution appendix · the narrative (session_247) + this transcript (session_248) · the AGENTS session-108 layer · the SKILL v3.95.0 + §120 · the count lockstep (1060 + 559 = 1619) · the worklog round-107 entry · `.env.example` verified unchanged.

## Round complete — Session 108 / Parity Round 107

The 13th-writer round: the four-round Quartz hunt sourced the file (macOS Quartz PDFContext — the corpus's 13th writer family), the file exposed the two stacked decode defects (the UTF-8 stream decode + the MacRoman named encoding), both cured TDD-first with the mutation matrix, the corpus verified member-for-member (4 byte-identical, arXiv garbage-only, the IRS marker activation documented + re-anchored, the Quartz quote cured matching pdftotext), the live UI verify passed, and the round's own audit fixed the fresh-clone gate break + transferred the s199 census doctrine (58 states, 0 defects). The 72nd deploy non-visual; the mobile-nav pair PARITY.

**Suggested next:** the r109 queue — the width table, the positive-gap-writer class, the non-ASCII /Differences remap, the WinAnsi raw-literal remap (the new watch), the 73rd-deploy watch, the REF stay-open drawer (fifth-deploy watch).
