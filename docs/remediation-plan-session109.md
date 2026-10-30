# Remediation Plan — Session 109 / Parity Round 108

The 14th-writer round. The r109 queue's named watch (the WinAnsi raw-literal
remap) became the hunt for a live target, and the hunt **sourced a specimen
that exposed a defect an order of magnitude bigger**: ReportLab's own user
guide (Producer "ReportLab PDF Library - (opensource", 565,444 bytes, PDF
1.4, md5 `0f64df85…`) reads **ZERO characters** through the current
extractor — a total extraction failure on a mainstream writer — with the
WinAnsi defect stacked beneath it. The corpus grows to EIGHT members
(**14 writer families**). The 73rd-deploy watch read a login-side-only JS
churn (non-visual, render byte-identical); the mobile-nav pair PARITY; the
neo-crm session-200 doctrine (the page-surface a11y coverage audit)
consumed and found the eon-hr surface already covered (the s195 pattern).

## The opening read (the 73rd-deploy watch)

| Leg | Result |
| --- | --- |
| Login asset census | JS `index-BUB_QBH0` → **`index-XEFf4q1x`** (moved), CSS `index-Bwz2pKfc` unchanged → **THE 73rd DEPLOY, login-side JS only** |
| Login render | The fresh capture at the VERIFIED 1440×900 viewport **BYTE-IDENTICAL** to the standing `69aa4241…` baseline → NON-VISUAL (the 69th/70th/72nd churn pattern, fourth repeat) |
| App-side assets | `index-C-IrDy5f` / `index-BGNH4KkS` — **QUIET, the r42 baseline holds** |
| Mobile-nav pair (390×844, the user's named focus) | **PARITY** — both sides 28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer; REF 16 items (Close `display:none`), clone 15 (the a11y supersets) |
| The drawer watch (fifth read) | REF `/training` + **STILL-OPEN** at the 73rd state (the 69th's flip persists through its fourth deploy); the clone keeps the AUTO-CLOSED superset (pinned by `mobile-navigation.spec.ts`) |
| The REF-broken mobile set | `/employeedetail` the empty shell (66 nodes vs the clone's 248) — HOLDS |
| Tailwind v4 scans | The mobile band clean — identical geometry both sides, no regression |
| Baseline gates | lint 0/0 · tsc ✓ · **1060/1060 unit** (the standing net) |

## THE HUNT (the r109 queue's watch → the specimen)

- **The WinAnsi raw-literal watch**: the named-encoding doctrine's WinAnsi
  member — a WinAnsi-declared font's raw literal high bytes keep the Latin-1
  reading. The corpus census: **only arXiv declares `/WinAnsiEncoding`**
  (4 raw + 4 ObjStm-carried fonts), and its C1 chars ride the pre-existing
  Type3-charproc garbage layer only (the alnum pin is non-alnum-blind — a
  U+0092-vs-U+2019 never changes it; the pdftotext comparison found no
  live page-content target). **NO corpus member exercises the watch.**
- **The hunt**: the surviving r108 Quartz-hunt candidates probed (no hits);
  the xmlcalabash test-suite re-walked (Bear/Quartz files only); the
  ReportLab user guide sourced as the canonical ReportLab-family specimen
  (`https://www.reportlab.com/docs/reportlab-userguide.pdf` — md5
  `0f64df85637fa65775b24e871d96dab8`, 565,444 bytes) — the family that
  writes the exact watch shape: **15+ base-14 fonts (Helvetica/Times/Courier)
  declaring `/Encoding /WinAnsiEncoding` with NO ToUnicode**.

## THE FINDINGS

### R109-A — the ASCII85Decode filter leg (the total-extraction failure)

`our extraction: 0 chars / 0 alnums` vs `pdftotext: 280,767 chars / 213,156
alnums`. **138 of the file's 147 streams declare `/Filter [
/ASCII85Decode /FlateDecode ]`** (ReportLab's default armor) — and
`extractPdfText` has **NO ASCII85Decode leg**: it feeds the armored bytes
straight to `inflate`, the inflate fails, `text = ""`, and
`if (!text) continue` silently drops **every content stream**. The corpus
never noticed because all seven standing members are Flate-only.

**THE FIX** (the filter-aware decode at the two stream-decode sites): read
the stream's own `/Filter` from its dict region (already computed for the
R102-A image gate); an `/ASCII85Decode` (or `/A85`) declaration decodes the
armor FIRST — then Flate inflates when also declared (the array order is
the decode order), and an ASCII85-only stream's decoded bytes ARE the
content. No declaration → the standing best-effort inflate-only behavior
(the uncompressed-content watch stays documented, unexercised by the
corpus). **The decoder**: ISO 32000-1 §7.4.2 — whitespace is never data,
`z` is a full zero group (only between groups), `~>` ends the data, a
final partial group of n chars yields n−1 bytes (padded with `u`), and the
Adobe `<~` prefix is tolerated. The base-85 weight bug found in-round:
85⁴ = **52,200,625** (the prototype's first draft typoed 5,220,067 —
byte-identical LENGTH, wrong every byte; caught by the python
`base64.a85decode` reference diff).

### R109-B — the WinAnsi raw-literal watch: RESOLVED BY DISCOVERY (no code change)

With the file readable, the forensics: **273 high-byte literals** across
the content streams — `To die\x97to sleep` (pdftotext reads "To
die—to sleep", U+2014) — and the first RED spec **PASSED at HEAD**: the
raw-literal path already reads WinAnsi. **THE DISCOVERY: the WHATWG
Encoding Standard maps the label "latin1" to windows-1252** — in every
WHATWG runtime (bun, node, and the browsers the client-side extractor
runs in), `new TextDecoder("latin1")` decodes byte 0x97 as U+2014, NOT
U+0097 (verified empirically: bytes 80 87 8a 97 d5 e9 → U+20AC U+2021
U+0160 U+2014 U+00D5 U+00E9). The r108-B LEG A "latin1" decode IS a
cp1252 decoder — the WinAnsi raw-literal class was already covered, the
s195 "already covered" pattern. THE CLOSURE: two born-green specs pin the
behavior forever (the em-dash/quote members + the C1-zone boundary guard
— a WinAnsi font's 0xD5 keeps Õ while the MacRoman font's 0xD5 keeps ';
cp1252 = Latin-1 above 0x9F). No marker, no census, no remap leg — the
smallest possible change is NO change, pinned.

### R109-D — the MacRoman C1-zone latent defect (the discovery's twin)

The aliasing discovery cut BOTH ways: **the r108 MacRoman literal remap
is broken on the C1 zone**. The remap matches `[\u0080-\u00ff]` — but a
MacRoman byte 0x80–0x9F arrives at assembly as its **cp1252 char**
(U+20AC for 0x80, U+2021 for 0x87 …), which the class NEVER MATCHES:
MacRoman 0x87 (á) and 0x80 (Ä) read "**\u2021\u20AC**" today. The
identity zone (0xA0–0xFF) is unaffected — cp1252 = Latin-1 there, the
QUARTZ 0xD5 pin holds. No live corpus target (the QUARTZ file's high
bytes are all \u2265 0xA0 — English text), but the defect is real and
spec-wrong.

**THE FIX**: the literal remap operates on the **cp1252 CHAR space** — a
`MAC_ROMAN_LIT_REMAP` map built from the table: for every byte 0x80–0xFF,
the char that byte becomes through the WHATWG decode
(`WIN_ANSI_HIGH[b]` for the C1 zone, `chr(b)` above) → `MAC_ROMAN_HIGH[b]`;
the remap pass replaces every non-ASCII char through the map (identity
entries collapse to no-ops). The byte-keyed paths (hex atoms via the
MARKER map, the `MAC_ROMAN_MAP` covering rule) were already correct in
both zones — only the char-space literal pass was broken.

### R109-C — the Symbol marker-font LITERAL path + the authoritative high zone

The second member-level delta: pdftotext reads **101 `•` bullets**, ours
read 2. The mechanism: the bullets are octal-escape literals
`(\267) Tj` (= 0xB7) under `/F4` = Symbol — and **the marker tables fire
only on HEX atoms** (decodeHexString's covering rule; the r105 ZapfDingbats
and r108 MacRoman literal paths were separate passes). Worse, **SYMBOL_FONT
has no high zone at all** (the table ends at 0x7E): 0xB7 fell to the
`latin1Printable` fallback → "·" (U+00B7, the Latin-1 middle dot).

**THE FIX**, two legs: [1] the **authoritative Symbol high zone** (0xA1–0xE5,
generated through the AGL — `bullet`→•, `divide`→÷, `notequal`→≠,
`summation`→∑… — never hand-reconstructed; the PUA corporate slots
(registerserif/sans etc.) normalize to ® © ™, poppler parity; verified
slot-by-slot against a generated all-bytes probe PDF read through
pdftotext); [2] the **marker-font literal remap at assembly** — a literal
piece whose font chain resolves a MARKER_TABLES map (Symbol/ZapfDingbats)
remaps its chars through it under the covering discipline (only when the
map covers the WHOLE literal — a misbound multi-char word stays verbatim;
the marker rides only the no-ToUnicode fonts).

### The blast radius (measured by prototype BEFORE the plan — all three legs)

The 7 standing corpus members: **BYTE-IDENTICAL** through the full
prototype (IRS 5,798 · arXiv 67,744 · dvipdfmx 61,437 · fontspec 106,179 ·
LO Calc 695,014 · LO Writer 646,207 · QUARTZ 2,697). **The REPORTLAB
member: 0 → 213,160 alnums = 100.0% of pdftotext's 213,156** — the
em-dash probe reads "To die—to sleep," (U+2014, matching pdftotext), the
WinAnsi quote family reads ‘ ’ “ ” – — correctly, **zero C1 controls in
the output**, and 94 list bullets decode `•` attached to their items
(pdftotext renders the same bullets as standalone lines — a layout-form
difference; the CV scorer's tokenizer reads the same words either way).
The family-count deltas (ours 17 em-dashes vs 16, 5 ™ vs 2 …) are the
guide's own font-specimen showcase pages — read differently by design.

### R109-D — the standing watch verifications (all quiet)

- **The neo-crm session-200 doctrine** (the page-surface a11y coverage
  audit): consumed — the eon-hr page-surface a11y layer is held by the
  standing pins (the R37-A aria-contract family + the R25 layer + the
  orphan-route census + the r108 dialog-open census, 58 states zero
  defects), and the spec files carry no stale count claims (the counts
  live only in the docs lockstep — verified). The s195 "already covered"
  pattern; no eon-hr-side action.
- **The Next.js patch watch**: 16.4.3 remains the latest (published
  2026-10-23, non-security) — no new release; the documented ^16.4.2 HOLD
  stands. No `next` advisory in `npm audit --omit=dev`.
- **`bun audit`**: the documented deepmerge-ts-only state (the
  @prisma/config dev-CLI chain; the upstream Prisma bump is the cure).
- **The /Differences watch**: NOT advanced — the p596 "What\x90s New"
  candidate measured to a structure-tree `/Alt` attribute (not page
  content); the watch stands.
- **Turnstile**: 0-rendered at the fresh login read.

## The TDD plan (RED → GREEN → mutation-proof)

**RED specs (written first — 5 RED verified with the exact signatures, 2
born-green pins — `tests/unit/cv-text.test.ts`):**

1. **Spec 1 (R109-A — the stacked filter)** — RED: a stream declaring
   `/Filter [ /ASCII85Decode /FlateDecode ]` carrying the ReportLab
   content shape → the extraction is EMPTY today
   (`expected '' to contain 'ReportLab PDF Library'`).
   **The fixture's own ASCII85 ENCODER** (the fixture-must-exercise-the-
   fixed-path lesson, tenth application — the encoder proves the decoder
   handles real armor: full groups, the z zero-group, the partial final
   group, the `~>` EOD).
2. **Spec 2 (R109-A — ASCII85-only)** — RED: `/Filter /ASCII85Decode`
   with UNCOMPRESSED content → EMPTY today.
3. **Spec 3 (R109-B — the WinAnsi raw-literal pin, BORN-GREEN)**: the
   measured ReportLab shape — a Flate stream under a WinAnsi-declared
   font carrying raw 0x97/0x92 atoms → "To die\u2014to sleep" + the
   U+2019 quote — PASSES at HEAD (the WHATWG aliasing discovery) and
   pins the behavior forever.
4. **Spec 4 (R109-B — the C1-zone boundary guard, BORN-GREEN)**: the
   WinAnsi font's raw 0xD5 stays Õ while the MacRoman font's 0xD5 keeps
   its ' remap (the r108 behavior) — the zone boundary in one spec.
5. **Spec 5a (R109-C — the Symbol high zone)** — RED: `(\267) Tj` under
   Symbol reads "·" today (`expected '· What is ReportLab…' to contain
   '•'`).
6. **Spec 5b (R109-C — the ASCII-zone marker remap)** — RED: `(ab)` under
   Symbol rides verbatim today (the marker tables fired only on hex
   atoms).
7. **Spec 6 (R109-D — the MacRoman C1-zone fix)** — RED: raw 0x87 0x80
   under a MacRoman font read "\u2021\u20AC" today
   (`expected 'cafÈ‡€grande…' to contain 'áÄ'`).

**MUTATION MATRIX** (each mutation must bite exactly its designed specs):

- **M1** (the ASCII85Decode leg reverted — the filter-blind inflate
  restored): specs 1 + 2 RED exactly.
- **M2** (the marker-font literal remap removed): specs 5a + 5b RED.
- **M3** (the Symbol high zone removed): spec 5a RED EXACTLY — 5b stays
  green (the ASCII zone was always present: the leg isolation).
- **M4** (the MacRoman literal remap reverted to the old
  `[\u0080-\u00ff]` char-class form): spec 6 RED exactly (the C1
  members) — the QUARTZ identity-zone spec stays green.
- **M5** (the MacRoman literal remap removed entirely): specs 4 + 6 +
  the r108 QUARTZ quote spec RED (3 — the whole pass).

**THE REAL-FILE GROUND TRUTH** (the member diff, HEAD's extractor vs the
remediated one): the 7 standing members BYTE-IDENTICAL (the pins hold);
the REPORTLAB member reads 213,160 alnums (the new pin) with the
member-level checks: the em-dash probe "To die—to sleep," matching
pdftotext member-for-member, the WinAnsi quote family matching, zero C1
chars, and the bullet decode verified.

**THE LIVE UI VERIFY** (the r104 protocol): the real file through the
recruitment AI-CV-Upload tab → the candidate's stored cvText carries the
em-dash (U+2014) and bullet (U+2022) readings; the probes swept, the DB
pristine.

**THE CORPUS PIN**: the corpus grows to EIGHT members — the RL user guide
pinned at md5 `0f64df85…` / 213,160 alnums (the corpus-verify script gains
the member).

## The gates

lint 0/0 · tsc ✓ · unit **1060 → 1067** (7 net new: 5 RED + 2 born-green pins) · build ✓ (env -u
DATABASE_URL; NODE_OPTIONS=--max-old-space-size=3072) · E2E **559/559**
(the standing net — the CV-flow fix rides the unit layer per the r100/r102
documented split) · the mobile-nav pair re-verified on the remediated
build · DB pristine (1 user / 0 candidates).

## The docs layer

The plan (this file) + its execution appendix · the narrative
(`docs/session_250.md`) + the raw transcript (`docs/session_251.md`) · the
AGENTS session-109 layer · the SKILL v3.96.0 + §121 (the
filter-chain-is-part-of-the-format lesson) · the CLAUDE/README/AGENTS count
lockstep (1067 + 559 = 1626) · the worklog round-108 entry · `.env.example`
verified unchanged (only DATABASE_URL + AUTH_SECRET are read).

---

## THE EXECUTION RECORD (the appendix — what actually happened)

**The RED round**: 5 RED specs verified with the exact designed signatures —
specs 1+2 (`expected '' to contain …` — the EMPTY extraction), spec 5a
(`expected '· What is ReportLab…' to contain '•'`), spec 5b (`expected 'ab…' to
contain 'αβ'`), spec 6 (`expected 'cafÈ‡€grande…' to contain 'áÄ'`) — plus the
2 born-green pins (the WinAnsi em-dash/quote at HEAD — THE WHATWG DISCOVERY —
and the C1-zone boundary guard).

**The GREEN round**: the three legs landed in `src/lib/cv-text.ts` — the
`ascii85Decode` decoder + the filter-aware stream decode (R109-A); the
authoritative Symbol high zone + the marker-font literal remap under the
covering discipline (R109-C); the `MAC_ROMAN_LIT_REMAP` cp1252-char-space map
+ the char-space literal pass (R109-D). R109-B needed NO code — the discovery
closed the watch as already-covered, pinned by the two born-green specs.
**1067/1067** (1060 + 7 net new).

**The mutation matrix** (each mutation biting exactly its designed specs, the
restored file re-verified green after each):
- **M1** (the A85 leg reverted) → **exactly 2 RED** (specs 1+2)
- **M2** (the marker-font literal remap removed) → **exactly 2 RED** (5a+5b)
- **M3** (the Symbol high zone removed) → **exactly 1 RED** (5a — 5b green:
  the ASCII-zone isolation)
- **M4** (the MacRoman remap reverted to the old `[\u0080-\u00ff]` form) →
  **exactly 1 RED** (spec 6 — the QUARTZ identity-zone spec green)
- **M5** (the MacRoman literal remap removed entirely) → **exactly 3 RED**
  (the r108 QUARTZ quote spec + the zone-guard spec + spec 6)

**The real-file ground truth** (`scripts/r109-ground-truth.ts`): all 7
standing members **BYTE-IDENTICAL** (every pin holds: IRS 5,798 · arXiv
67,744 · dvipdfmx 61,437 · fontspec 106,179 · LO Calc 695,014 · LO Writer
646,207 · QUARTZ 2,697); the REPORTLAB member **0 → 213,160 alnums = 100.00%
of pdftotext's 213,156** — the em-dash probe "To die—to sleep," matching
pdftotext member-for-member, bullets present, **zero C1 controls**, the
WinAnsi family 125 vs pdftotext's 130 (the guide's own font-specimen showcase
pages, read differently by design — documented). The corpus-verify script
gains the 8th member (md5 `0f64df85…`, pin 213,160 + the em-dash/bullet/
zero-C1 member-level checks) — **CORPUS: ALL PINS HOLD**.

**The live UI verify** (the r104 protocol, `scripts/r109-rl-ui-verify.mjs`):
the full user guide through the recruitment AI-CV-Upload tab reads the
**"Analysis failed / Validation failed"** toast — itself the fix's live proof
(the pre-fix build's client-side extraction returned "" and toasted "Couldn't
read the CV text"; the remediated build's extraction returned 292,766 chars
and the POST hit the API's intentional 20,000-char cvText cap — a 138-page
book is not a CV). The airtight stored-cvText leg: a ReportLab-shaped
CV-sized probe (the same A85+WinAnsi+Symbol shape, generated by
`scripts/r109-rl-probe-gen.py` with python's authoritative a85 encoder)
through the real UI → **the stored cvText carries "To die—to sleep"
(U+2014), 4 × • (U+2022), "It's" (U+2019), zero U+FFFD** (aiScore 5) — the
probe swept, the DB pristine (1 user / 0 candidates, verified directly
through Prisma).

**The gates**: lint 0/0 · tsc ✓ (after one type fix in the forensic
measurement script) · **1067/1067 unit** · build ✓ (env -u DATABASE_URL;
NODE_OPTIONS=--max-old-space-size=3072; 116/116 static pages) · E2E 559/559
(the standing net — the CV-flow fix rides the unit layer per the r100/r102
documented split) · the mobile-nav pair re-verified on the remediated build.

**The in-round lessons** (the §121 candidates): the
**filter-chain-is-part-of-the-format** lesson (a stream's /Filter array is
not metadata — a reader that ignores one filter leg reads NOTHING from every
writer that uses it, silently); **the WHATWG latin1-label trap** (the
"latin1" TextDecoder label maps to windows-1252 — in EVERY runtime — which is
sometimes a lucky correctness (the WinAnsi fonts) and sometimes a latent
defect (any char-range logic written against the ISO-8859-1 identity
assumption); the label's semantics are the decoder's contract, not its name);
**the base-85 weight typo class** (52200625, not 5220067 — a wrong constant
produces byte-identical LENGTH with every byte wrong; a new decoder needs a
reference-implementation diff, not just a length check).
