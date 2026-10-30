# Session 109 — Parity Round 108: the 14th-writer round (the ReportLab ASCII85 hunt)

The round the r109 queue's named watch became a hunt, the hunt sourced a specimen that read **ZERO characters**, and the total-extraction failure turned out to be a missing ASCII85Decode filter leg with the WinAnsi class — and a WHATWG aliasing discovery — stacked beneath it. **Session 109 / Parity Round 108**, HEAD `9365b7b` (the session-108 close + session_249), the workspace continuing (no reset — the corpus and environment intact from the r108 close).

## The opening read (the 73rd-deploy watch)

- **THE 73rd DEPLOY detected**: login JS `BUB_QBH0` → `XEFf4q1x` (CSS `Bwz2pKfc` unchanged), the app side QUIET at the r42 baseline → the render **BYTE-IDENTICAL** to the standing `69aa4241…` baseline → NON-VISUAL, the login-side churn pattern's fourth repeat.
- **The mobile-nav pair PARITY** at 390×844: both sides 28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer; the REF 16 items (Close `display:none`), the clone 15 (the a11y supersets). The drawer watch's FIFTH read: the REF `/training` STILL-OPEN (the 69th's flip persisting through its fourth deploy — the documented REF-side regression classification STANDS); the clone keeps the AUTO-CLOSED superset. The REF-broken `/employeedetail` holds (66 vs 248 nodes). No Tailwind v4 regression in the mobile band.
- The baseline gates: lint 0/0 · tsc ✓ · 1060/1060 unit.

## The audit

- **neo-crm at session-200** (the a11y register's page-surface coverage audit): consumed — the eon-hr page-surface a11y layer is held by the standing pins (R37-A + R25 + the orphan-route census + the r108 dialog-open census), and the spec files carry no stale count claims (the counts live only in the docs lockstep — verified). The s195 "already covered" pattern; no action.
- The patch watch: 16.4.3 still the latest (no new release) — the ^16.4.2 HOLD stands. `bun audit` at the documented deepmerge-ts-only state. Turnstile 0-rendered.
- **The /Differences watch**: NOT advanced — the p596 "What\x90s New" candidate measured to a structure-tree `/Alt` attribute (not page content).

## The hunt and the findings

The r109 queue's named watch: **the WinAnsi raw-literal remap** — "no corpus member exercises it". The corpus census confirmed (only arXiv declares WinAnsi, its C1 chars ride the garbage layer; the alnum pin is non-alnum-blind — a U+0092-vs-U+2019 never changes the count). The hunt: the surviving r108 Quartz-hunt candidates (no hits), the xmlcalabash test-suite (Bear files only), then **ReportLab's own user guide** — the canonical ReportLab-family specimen (md5 `0f64df85…`): 15+ base-14 fonts declaring `/Encoding /WinAnsiEncoding` with no ToUnicode, and **the extraction reads 0 chars vs pdftotext's 213,156 alnums**.

- **R109-A — the ASCII85Decode filter leg (the total-extraction failure)**: 138 of the file's 147 streams declare `/Filter [ /ASCII85Decode /FlateDecode ]` (ReportLab's default armor); the extractor had NO ASCII85 leg — the armored bytes failed to inflate and EVERY content stream was silently dropped. THE FIX: the `ascii85Decode` decoder (ISO 32000-1 §7.4.2 — whitespace never data, `z` zero-groups, `~>` EOD, partial final groups, the `<~` prefix tolerated) + the filter-aware decode (the armor comes off first, then Flate; ASCII85-only streams' decoded bytes ARE the content). The in-round catch: the base-85 weight 85⁴ = **52,200,625** — the first draft typoed 5,220,067 (right LENGTH, every byte wrong — caught by the python `base64.a85decode` reference diff).
- **R109-B — the WinAnsi raw-literal watch: RESOLVED BY DISCOVERY (no code change)**: the first RED spec PASSED at HEAD — **the WHATWG Encoding Standard maps the "latin1" TextDecoder label to windows-1252** (verified: bytes 80 87 8a 97 d5 e9 → € ‡ Š — Õ é, in bun, node, and the browsers the client-side extractor runs in). The r108-B LEG A "latin1" decode IS a cp1252 decoder — the WinAnsi raw-literal class was already covered. Two born-green specs pin it forever (the em-dash/quote members + the C1-zone boundary guard).
- **R109-D — the MacRoman C1-zone latent defect (the discovery's twin)**: the aliasing cuts both ways — the r108 MacRoman literal remap matches `[\u0080-\u00ff]`, a class the C1-zone bytes NEVER land in (0x87 arrives as ‡ U+2021): MacRoman 0x87 (á) and 0x80 (Ä) read "‡€". THE FIX: the `MAC_ROMAN_LIT_REMAP` char-space map (every high byte's WHATWG-decoded char → the MacRoman reading; the identity zone's entries are no-ops — the QUARTZ pin verbatim).
- **R109-C — the Symbol marker-font LITERAL path + the authoritative high zone**: pdftotext reads 101 `•` bullets, ours read 2 — the bullets are `(\267) Tj` octal literals under `/F4` = Symbol, and the marker tables fired only on HEX atoms; worse, SYMBOL_FONT had **no high zone at all** (0xB7 fell to the fallback → · the Latin-1 middle dot). THE FIX: the authoritative Symbol high zone (0xA1–0xE5, generated through the AGL, verified slot-by-slot against an all-bytes probe PDF read through pdftotext; the PUA corporate slots normalize to ® © ™) + the marker-font literal remap under the covering discipline (a misbound multi-char word never garbles).
- **The blast radius, measured by prototype BEFORE the plan**: all 7 standing members BYTE-IDENTICAL through the full three-leg prototype; the REPORTLAB member 0 → 213,160 alnums = **100.00% of pdftotext**.

## The TDD round

RED 5/5 with the exact designed signatures (the empty extraction ×2, the `·`-not-`•`, the `ab`-not-`αβ`, the `‡€`-not-`áÄ`) + 2 born-green pins → GREEN **1067/1067** (1060 + 7 net new). **THE MUTATION MATRIX**: M1 (the A85 leg reverted) → exactly 2 RED · M2 (the marker-literal remap removed) → exactly 2 · M3 (the Symbol high zone removed) → exactly 1 (5b green — the ASCII-zone isolation) · M4 (the MacRoman remap reverted to the old form) → exactly 1 · M5 (the MacRoman literal pass removed) → exactly 3 (the QUARTZ spec + the zone guard + spec 6). The restored file re-verified green after each.

## The ground truth and the live verify

All 7 standing members BYTE-IDENTICAL (every pin holds); the corpus grows to **EIGHT members — 14 writer families** (the RL guide pinned md5 `0f64df85…` / 213,160 alnums + the em-dash/bullet/zero-C1 member-level checks). The em-dash probe reads "To die—to sleep," matching pdftotext member-for-member; zero C1 controls in the output.

The live UI verify (the r104 protocol): the full guide through the recruitment AI-CV-Upload tab toasts "Analysis failed / Validation failed" — itself the live proof (the pre-fix build toasted "Couldn't read the CV text"; the remediated extraction returned 292,766 chars and the POST hit the API's intentional 20,000-char cvText cap — a 138-page book is not a CV). The airtight stored-cvText leg: a ReportLab-shaped CV-sized probe through the real UI → the stored cvText carries the em-dash, 4 × •, the U+2019 quote, zero U+FFFD; the probe swept, the DB pristine (verified directly through Prisma: 1 user / 0 candidates).

## The gates and the docs

lint 0/0 · tsc ✓ · **1067/1067 unit** · build ✓ (116/116 static pages) · E2E **559/559** (the standing net — the fix rides the unit layer per the r100/r102 split) · the mobile-nav pair re-verified on the remediated build. The docs layer: the plan + its execution appendix (`docs/remediation-plan-session109.md`) · this narrative + the transcript (`docs/session_251.md`) · the AGENTS session-109 layer · the SKILL v3.96.0 + §121 · the CLAUDE/README/AGENTS count lockstep (1067 + 559 = 1626) · the worklog round-108 entry · `.env.example` verified unchanged (only DATABASE_URL + AUTH_SECRET are read).

## The r110 queue

The two-pass per-letter width table (standing), the positive-gap-writer class (standing), the non-ASCII /Differences remap (standing), the uncompressed-content-stream watch (NEW — the no-/Filter leg documented but unexercised by the corpus), the 74th-deploy watch, the REF stay-open drawer (sixth-deploy watch), the standing watches (the recharts grid class, the dark-band theming, the v4 space-y inline-flow, the patch watch HOLD at ^16.4.2, the deepmerge-ts dev-chain advisory, the neo-crm session-201+ layer when it lands).
