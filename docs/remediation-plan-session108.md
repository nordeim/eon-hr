# Remediation Plan — Session 108 / Parity Round 107

The 13th-writer round: the four-round Quartz hunt **SOURCED** (the
xmlcalabash test-suite's `longer.pdf` — Producer "macOS Version 26.5 (Build
25F71) Quartz PDFContext", Bear-authored, PDF 1.3, 2 pages, md5 `27575d59…`)
and the file exposed **TWO stacked decode defects** in the CV-flow extractor
— plus the round's own audit found the fresh-clone gate break (a committed
probe script whose literal `/tmp` import kills `tsc` and `bun run build` on
any workspace where the /tmp file does not exist). The 72nd-deploy watch
read a login-side-only asset churn (non-visual, render byte-identical); the
mobile-nav pair PARITY at the standing state; the neo-crm session-199
doctrine (the dialog-open a11y coverage census) transferred and found the
eon-hr dialog surface CLEAN (58 dialog-open states, zero unnamed controls).

## The opening read (the 72nd-deploy watch)

| Leg | Result |
| --- | --- |
| Login asset census | JS `index-BUB_QBH0`, CSS `index-Bwz2pKfc` — **BOTH moved from the 70th state (C8D2zqWd/CZZ4z0cl) → THE 72nd DEPLOY, login-side only** |
| Login render | The fresh capture at the VERIFIED 1440×900 viewport **BYTE-IDENTICAL** to the standing `69aa4241…` baseline → classified NON-VISUAL (the 69th/70th churn pattern) |
| App-side assets | `index-C-IrDy5f` / `index-BGNH4KkS` — **QUIET, the r42 baseline holds** |
| Mobile-nav pair (390×844, the user's named focus) | **PARITY** — both sides 28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer; REF 16 items (Close `display:none`), clone 15 (the a11y supersets) |
| The drawer watch (fourth read) | REF `/training` + **STILL-OPEN** at the 72nd state (the 69th's flip persists through its third deploy); the clone keeps the AUTO-CLOSED superset (pinned by `mobile-navigation.spec.ts`) |
| The REF-broken mobile set | `/employeedetail` the empty shell (66 nodes vs the clone's 248) — HOLDS |
| Tailwind v4 scans | The mobile band clean — identical geometry both sides, no regression |
| Baseline gates | lint 0/0 · **tsc RED on the fresh clone** (R108-A below) · 1056/1056 unit |

## THE FINDINGS

### R108-A — the fresh-clone gate break (FIXED in-round, the gate-blocking class)

`bun run typecheck` and `bun run build` **fail on any fresh workspace**: the
committed `scripts/r107-ground-truth.ts` carries `await
import("/tmp/r107-head-cv-text")` — a LITERAL `/tmp` specifier. The file
existed at the r107 gate time (the session had created it), so the gate
passed THEN; on the fresh clone (this session's first action) the module is
gone and the type-check phase dies (`TS2307`). The same class bit this
round's own probe script (`r108-prototype-diff.ts`, the `.ts`-extension
variant — `TS5097`). **THE FIX**: the variable-path import —
`const headPath = "/tmp/…"; (await import(headPath)) as { … }` — invisible
to the static resolver (the gate stays environment-independent) while bun
still resolves the module at runtime. **VERIFIED**: tsc ✓ + build ✓ on the
fresh tree after the two-file fix. The lesson (the §110 family's fourth
member): a gate proves the tree at the moment it runs — and a committed
artifact whose TYPE-CHECK depends on /tmp state was never really gated.

### R108-B — the Quartz 13th-writer class (THE round's defect, two legs)

The sourced file's text extracts cleanly (2,697 alnums, zero letter-soup,
all word probes hit — the r103/r104 walk rules hold the Quartz form: every
word its own BT block with a Tm, per-letter literal TJ atoms with
sub-thousandth kerns). ONE line reads wrong: **"There\ufffd s" where
pdftotext reads "There's"** — and the forensics found TWO stacked defects:

**LEG A — the UTF-8 stream decode (the universal bug).**
`extractPdfText` decodes every INFLATED content stream with
`new TextDecoder()` — **the UTF-8 default** (cv-text.ts:832/836). PDF
content streams are BYTE strings, not UTF-8: any byte ≥ 0x80 in a literal
atom becomes U+FFFD before the decode tables ever see it. The outer raw
scan already uses `TextDecoder("latin1")` (line 658) and
`latin1Printable`'s WinAnsi/Latin-1 tables — the inflated-stream path
silently bypassed both. THE FIX: `new TextDecoder("latin1")` at the two
PDF stream-decode sites (the .docx XML paths stay UTF-8 — XML is UTF-8 by
spec).

**LEG B — the MacRoman named-encoding decode (the R105-B doctrine's second
member).** Even Latin-1 is wrong for this file: the fonts declare
`/Encoding /MacRomanEncoding` (both subset Type1s —
`/Tc1` BearSansUIHeading, `/Tc2` BearSansUI-Regular, `LastChar 213` =
0xD5), and MacRoman 0xD5 is **' U+2019** (the right single quote), not Õ
U+00D5. The measured atom sequence (the real stream):
`[(\() -0.1 (T) 0.2 (h) 0.2 (e) 0.5 (r) 10.2 (e) 35.5 (\xD5) 18.1 (s ) 0.5
(g)…] TJ` — the quote is a RAW single-byte atom (no octal escape, no hex).
THE FIX, the "a font that NAMES its encoding is its own ToUnicode"
doctrine: [1] the **MAC_ROMAN static table** (the authoritative 0x80–0xFF
zone, generated from the canonical Apple mapping — 0xD5→U+2019,
0xD4→U+2018, 0xD0/0xD1→en/em-dash, 0xAB→™, …) exposed as a CodeMap
(0x20–0x7F identity + the high block); [2] the **objMacRoman census** —
font-object bodies (the raw dict scan + the ObjStm harvest, the same sites
as `objBaseFont`) carrying `/Encoding /MacRomanEncoding`; [3] the
**/Font-dict-region name collector** — the Quartz writer names its fonts
`/Tc1` `/Tc2` (NOT `/F…` — the standing `F\w+` pair regex never binds
them); the pairs live inside `/Font << … >>` dict regions where every
`Name N 0 R` pair IS a font binding by construction (the R107-B "Font" key
exclusion kept); [4] the **cmapsFor marker push** — a candidate object in
`objMacRoman` contributes the MAC_ROMAN marker map to the font's own chain
(a real ToUnicode still wins — the writer's own truth); [5] the **literal
remap at assembly** — a literal piece whose font chain resolves the
MAC_ROMAN marker remaps chars U+0080–U+00FF through the table (hex atoms
get it free through `decodeHexString`'s covering rule).

**The blast radius (measured by prototype BEFORE the plan —
`scripts/r108-prototype-diff.ts`)**: IRS · dvipdfmx · fontspec · lo-calc ·
lo-writer — **BYTE-IDENTICAL** through the LEG-A prototype; **arXiv** — 49
differing lines, ALL in the pre-existing Type3-charproc garbage layer (the
NUL-interleaved glyph procedures that pass the content gates — U+FFFD →
the byte-faithful Latin-1 chars; the alnum pin 67,744 UNCHANGED;
pdftotext extracts none of those lines — they are not page content);
**Quartz** — exactly the 1 quote line changes (U+FFFD → Õ; ' after LEG B).

### R108-C — the s199 doctrine transfer (the dialog-open a11y census)

The neo-crm session-199 doctrine — "a Radix Dialog's content is ABSENT
from the DOM while closed, so every dialog-open state deserves its own
open-surface a11y teeth" — transferred in the eon-hr form (the
computed-truth doctrine, no new dependency): a runtime census of every
dialog-open state's form controls for an accessible name. **Two passes**
(the DialogTrigger set via `aria-haspopup="dialog"` — the R25-pinned
contract — and the CONTROLLED-dialog set via the create-ish action
buttons): **58 dialog-open states censused, ZERO unnamed controls**. The
one candidate defect the first pass surfaced (the loans/assets dialogs'
"unnamed selects") was a CENSUS ARTIFACT — Radix's internal
`aria-hidden tabindex=-1` BubbleSelect mirrors, correctly excluded from
the a11y tree; the accessible comboboxes are properly named via
`label[for]` (`loan-employee`/`loan-type`). The R37-A aria-contract pins +
the R25 layer hold the whole surface — the s195 "already covered"
pattern. The census scripts commit for future rounds
(`r108-dialog-a11y-census.mjs` + `-census2.mjs`).

### R108-D — the standing watch verifications

- **The Next.js patch watch**: 16.4.3 published 2026-10-23 — a
  non-security backport round (font URLs, proxy runtime, OTel traces, the
  standalone React bootstrap); `npm audit --omit=dev` reads NO next
  advisory; the documented **^16.4.2 HOLD stands** (the 16.4.2 upgrade was
  the security round — no advisory drives a 16.4.3 move).
- **`bun audit`**: the documented deepmerge-ts-only state (1 high,
  @prisma/config's dev-CLI chain — the v8 override crosses a major onto
  the Prisma CLI's internals; the upstream Prisma bump is the watch).
- **Turnstile**: 0-rendered at the fresh login read (the standing watch).
- **The Quartz hunt closes as SOURCED** (the fourth round); the corpus
  grows to SEVEN members (13 writer families); the LO guides + fontspec
  re-sourced with the r107-pinned md5s verified (fontspec `752e9929…`,
  lo-calc `dbb10a2b…`) — the corpus discipline holds on the fresh
  workspace (all six standing alnum pins + both member-level cures
  verified before any code change).

## The TDD plan (RED → GREEN → mutation-proof)

**RED specs (written first, all failing — `tests/unit/cv-text.test.ts`):**

1. **Spec 1 (the real-file form, LEG A + LEG B combined)**: the measured
   Quartz shape — a Flate-compressed latin1 content stream carrying
   `[(\() -0.1 (T) 0.2 (h) 0.2 (e) 0.5 (r) 10.2 (e) 35.5 (\xD5) 18.1 (s )
   0.5 (g)…] TJ` under `/Tc2`; the font object declares
   `/Encoding /MacRomanEncoding` (Type1, no ToUnicode); the resources
   object carries `/Font << /Tc2 N 0 R >>` → the extraction reads
   **"There's" (U+2019)** + the guard-clearing body text. RED today:
   "There\ufffd".
2. **Spec 2 (LEG A alone)**: a Flate-compressed latin1 stream with a raw
   high-byte literal `(\xC7)` under a font with NO MacRoman declaration →
   reads **"Ç" (U+00C7)**. RED today: U+FFFD.
3. **Spec 3 (the no-declaration guard)**: the same compressed form with
   byte 0xD5 under a font declaring `/Encoding /WinAnsiEncoding` →
   **stays "Õ" (U+00D5)** — the MacRoman remap never fires without the
   declaration (the over-application guard; the WinAnsi raw-literal class
   stays the documented watch). RED today: U+FFFD.
4. **Spec 4 (the hex-atom form)**: a hex atom `<D5>` under the MacRoman
   font → **U+2019** (the `cmapsFor` marker leg through
   `decodeHexString`'s covering rule). RED today: Õ.

**Mutation proof:**

- M1: LEG A reverted (the two TextDecoder calls back to UTF-8) → specs
  1+2+3 RED (U+FFFD returns); spec 4 GREEN (the hex text is ASCII in the
  stream — the leg isolates LEG B).
- M2: the objMacRoman census removed → specs 1+4 RED (Õ).
- M3: the /Font-dict-region collector removed → specs 1+4 RED (no
  `/Tc2` binding → no marker in the chain).
- M4: the literal remap at assembly removed → spec 1 RED only (the
  hex path keeps its teeth — spec 4 GREEN).
- M5: the cmapsFor marker push removed → specs 1+4 RED (the shared
  chain).

**Gates:** lint 0/0 · tsc ✓ · unit **1056 + 4 net new = 1060** ·
`env -u DATABASE_URL` build (NODE_OPTIONS=--max-old-space-size=3072, the
dev server killed by the port holder first) · E2E **559** (the standing
net — the CV-flow fix rides the unit layer per the r100/r102 documented
split: the scorer's tokenizer is non-alnum-blind, the quote char never
scores) + the corpus member diff + the Quartz live UI verify (the real
file through the recruitment CV upload, the r104 protocol).

## Verification legs

1. The unit RED→GREEN + the mutation matrix M1–M5.
2. The real-file ground truth: the corpus member diff (HEAD's extractor
   vs the remediated one) — IRS · dvipdfmx · fontspec · lo-calc ·
   lo-writer **BYTE-IDENTICAL**; arXiv the 49 pre-existing garbage lines
   only (the alnum pin 67,744 unchanged); the QUARTZ member: exactly the
   quote line cured ("There's"), matching pdftotext member-for-member.
3. The Quartz live UI verify: the real file through the recruitment CV
   tab → the parsed candidate text carries "There's" (U+2019).
4. The final E2E gate ALONE (the detached node-spawn protocol).
5. The mobile-nav pair re-verified on the remediated build.

## Execution appendix (filled at close)

- **R108-A (the fresh-clone gate break): FIXED in-round, before the plan.**
  The variable-path import in both scripts (`r107-ground-truth.ts` +
  `r108-prototype-diff.ts`); tsc ✓ + build ✓ verified on the fresh tree
  immediately after. The gate-blocking class: the committed probe's
  type-check depended on /tmp state — "a gate proves the tree at the
  moment it runs" (§110 family, fourth member).
- **RED: 4/4 as designed** — spec 1 `(There\ufffds going` (the U+FFFD —
  the real defect verbatim, the `(` atom and the ±0.2..35.5 kerns mirrored
  from the measured stream), spec 2 `\ufffd` (LEG A alone), spec 3
  `There\ufffds ` (LEG A + the over-application guard), spec 4
  `There\u00D5s` (the hex path through latin1Printable — LEG B's cmapsFor
  leg). One fixture-helper repair along the way: the new specs live in a
  describe block without the `encS` scope — the local definition (and the
  latin1 `encL` stream encoder: a high byte in a Flate stream must
  deflate as ITS byte, not its UTF-8 encoding — the fixture-must-
  exercise-the-fixed-path lesson, ninth application: an ASCII-only
  fixture would never touch the stream decoder).
- **GREEN: 1060/1060** (1056 + 4 net new) — LEG A (the two
  `TextDecoder("latin1")` stream-decode sites), LEG B (the MAC_ROMAN
  table + CodeMap, the objMacRoman census [raw + ObjStm], the
  /Font-dict-region collector [raw + ObjStm], the cmapsFor marker push,
  the literal remap at assembly). lint 0/0 · tsc ✓.
- **THE MUTATION MATRIX:** M1 (LEG A reverted) → exactly 3 RED (specs
  1+2+3; spec 4 GREEN — the hex text is ASCII in the stream, the leg
  isolates LEG B) · M2 (the objMacRoman census removed) → exactly 2 RED
  (specs 1+4) · M3 (the region collector removed) → exactly 2 RED (specs
  1+4 — no /Tc2 binding) · M4 (the literal remap removed) → exactly 1 RED
  (spec 1 only — the hex path keeps its teeth) · M5 (the cmapsFor marker
  push removed) → exactly 2 RED (specs 1+4 — the shared chain). Every
  mutation bites exactly its designed specs; the restored file re-verified
  green (md5 `52c8159b…`).
- **THE REAL-FILE GROUND TRUTH (the member diff, HEAD's extractor vs the
  remediated one):** dvipdfmx 61,437 · fontspec 106,179 · LO Calc 695,014
  · LO Writer 646,207 — **BYTE-IDENTICAL**; arXiv 67,744 the 49
  pre-existing Type3-charproc garbage lines only (U+FFFD → the
  byte-faithful Latin-1 chars; the alnum pin unchanged; pdftotext
  extracts none of those lines — not page content); **the IRS member: the
  round's second finding — the /Font-dict-region collector ACTIVATES the
  r105-B ZapfDingbats marker on the real file** (the 73 Form-XObject
  checkbox glyphs' `/ZaDb 268 0 R` pairs — NOT F-prefixed, the standing
  F\w+ scan never bound them — read \u2714, the spec-correct Adobe
  reading, where the Latin-1 fallback read "4"; 5,871 − 73 = 5,798
  exactly; the R106-A "inert on real files" class repeating at the
  BINDING layer — the r105 unit fixture's F-name shape never exercised
  the real file's /ZaDb form); **the QUARTZ member: exactly the 1 quote
  line cured** — "(There\uFFFDs going" → "(There\u2019s going", matching
  pdftotext member-for-member, U+FFFD gone from the whole extraction.
  The IRS pin re-anchored 5,871 → 5,798 with the mechanism documented.
- **THE LIVE UI VERIFY (the r104 protocol):** the real Quartz file through
  the actual UI — the recruitment AI-CV-Upload tab → the job select → the
  upload → the candidate "quartz longer" persisted with **quoteCured:
  true** (the stored cvText carries "There\u2019s going") · **fffd:
  false** · aiScore 10; the probe candidates swept (the API login + the
  DELETE loop), the DB back to pristine.
- **R108-C (the s199 census): 58 dialog-open states censused (36
  DialogTrigger + 22 controlled), ZERO unnamed controls.** The one
  candidate defect (the loans/assets "unnamed selects") was a census
  ARTIFACT — Radix's internal `aria-hidden tabindex=-1` BubbleSelect
  mirrors, correctly excluded from the a11y tree; the accessible
  comboboxes are named via `label[for]` (`loan-employee`/`loan-type`).
  The R37-A aria-contract pins + the R25 layer hold the whole surface —
  the s195 "already covered" pattern. The census scripts commit for
  future rounds.
- **Gates:** lint 0/0 · tsc ✓ · **1060/1060 unit** (1056 + 4 net new) ·
  build ✓ (env -u DATABASE_URL; NODE_OPTIONS=--max-old-space-size=3072;
  the dev server killed by the port holder first) · E2E 559/559 via the
  detached node-spawn protocol (the standing net — the CV-flow fix rides
  the unit layer per the r100/r102 documented split: the scorer's
  tokenizer is non-alnum-blind, the quote char never scores).
- **Docs lockstep:** the plan (this file) · session_247 (narrative) +
  session_248 (transcript) · the AGENTS session-108 layer · SKILL v3.95.0
  + §120 (the byte-string-not-UTF-8 stream decode, the named-encoding
  marker round two, the inert-fix activation at the binding layer) · the
  CLAUDE/README/AGENTS count lockstep (1060 + 559 = 1619) · the worklog
  round-107 entry · `.env.example` verified unchanged (only DATABASE_URL
  + AUTH_SECRET are read).
