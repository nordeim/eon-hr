# Remediation Plan — Session 104 / Parity Round 103: the XeTeX real-writer round + the 404 interior arms

**The frontier.** The r103 close-out's queue: (1) the CV-flow watches — the
non-ASCII `/Differences` remap, the non-default `Tz`/`Ts`, the LO
negative-tracking class, the positive-gap-writer class, the LuaTeX
narrow-ending word-gap class (a two-pass per-letter width table could
re-open it) — plus the **12th-writer hunt: macOS Quartz and XeTeX remain
unpinned**; (2) the REF-broken mobile set on watch (the 67th-state
baseline); (3) the standing watches (the 67th-state login ladder re-armed,
the recharts grid class, the dark-band theming, the v4 space-y inline-flow
watch, the patch watch at ^16.4.2 with 16.4.3 published); (4) the neo-crm
session-193+ layer when it lands.

## The opening read (the standing ladder — the 68TH deploy state)

| Ladder step | Result |
|---|---|
| Workspace | Fresh clone at `2a83afd` (the session-103 close + the session_234 transcript); `bun install` (525 packages) + `.env` (the two-variable contract) + `db:push`/`db:seed` (1 user / 0 candidates) + the production build + the :3200 boot (the node-spawn detached protocol) |
| Baseline gates | lint 0/0 · tsc ✓ · **1034/1034 unit** — matches the session-103 close |
| The exported-`DATABASE_URL` guard | ACTIVE all round (`env -u DATABASE_URL` on every Prisma CLI touch, every build, and the boot — it fired on the round's first DB probe exactly as documented) |
| The deploy watch | **THE 68TH DEPLOY detected — login JS `index-D__5Nn5J` → `index-DcYiwvas` AND login CSS `index-Dv2nVyxn` → `index-D3d5-7RD` (BOTH moved; the app side QUIET: `index-C-IrDy5f`/`index-BGNH4KkS`, the r42 baseline holds)** → classified **NON-VISUAL**: the fresh login capture at the VERIFIED 1440×900 viewport is **BYTE-IDENTICAL to the standing `69aa4241…` baseline** (md5-verified; the DOM census intact — the six-button set, the two-input form, zero Turnstile). The first capture came out 1280×577 — the FRESH-SESSION VIEWPORT DRIFT trap (below), not a deploy delta |
| The standing ladders | **verify-r45: 13/13** (one cold-cache hydration flake on the first run — the r78 fill-timing class — clean on the re-run) · **verify-r49: 12/13 + 1 flake** (`stats-surveyanalytics` read `undefined` at the 3000ms read — a slow-load flake; the direct 8s re-read renders the IDENTICAL rootCls) — **effectively 13/13** |
| The mobile-nav cross-side pair (the standing emphasis) | **PARITY, live-verified on BOTH sides at the 68th state** — REF: hamburger 28×28 `lucide-panel-left` "Toggle Sidebar" + drawer 288×844 fixed z-50 (16 items incl. Close); clone: the same geometry + the `aria-label`/`role=dialog` a11y supersets; the clone menu cycle open → Training LMS → `/training` + **AUTO-CLOSED**. No Tailwind v4 regression in the mobile band |
| The REF-broken mobile set | **HOLDS at the 68th state** — `/employeedetail` the empty shell (rootChildren 2, mainTextLen 26, scrollW 390), re-read live at the verified 390px viewport |
| The standing scans | oklch clean (globals.css doc comments only) · `md:flex-wrap` zero · secrets zero · the patch watch HOLD at ^16.4.2 (16.4.3 — no newer) · every CartesianGrid site `strokeDasharray="3 3"` · the space-y inline-flow watch clean |
| DB state | pristine (1 user / 0 candidates) after the fresh seed |
| The neo-crm session-193/194 layer | **CONSUMED — CRM-ONLY surfaces (the marketing interiors walk66, the 404 interior walk67), but TWO METHODOLOGY TRANSFERS land with REAL eon-hr teeth**: D-194a3 the Go Home glyph (the cross-library icon family — heroicons vs lucide) and D-194a4 the 404 title form — both re-measured LIVE on the eon-hr REF and both DIVERGE (findings R104-A/B below). The outline-color census (D-193a1) is already covered by the session-85 layer (eon-hr's REF rides the OPAQUE UA default — the opposite of neo-crm's 50% ring — pinned R85-A) |

## THE ROUND'S FINDINGS (empirically verified before the fix)

**R104-A — the 404 Go Home glyph: the heroicons cross-library icon family
(VERIFIED live on the 68th-state REF — HIGH, a real visual delta).** The
neo-crm D-194a3 doctrine's eon-hr member. The REF's 404 Go Home button
(123×38, `<button>` tag) ships the **heroicons v1 outline home**:

```html
<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
</svg>
```

— ONE path, `stroke-width` ON THE PATH (not the svg), NO width/height
attrs, the bare **`w-4 h-4 mr-2`** class order (w-first). The clone ships
the lucide `House` (imported `Home`): TWO paths (the door is a separate
path), `stroke-width="2"` on the svg, `width`/`height` attrs, the
`lucide lucide-house h-4 w-4 mr-2` class (h-first). The r35 pin measured
the GEOMETRY (123×38, 16px icon, mr-2 = 8px) but never the icon IDENTITY —
the two glyphs are visibly different houses (the heroicons form draws the
door inside the single path). The 68-deploy-stale pin re-measured live.

**The fix:** inline the REF's exact SVG at the Go Home site (retire the
lucide `Home` import there), keep the clone's `aria-hidden` (the s19
a11y-superset doctrine), keep the `<a>` tag (the D-194a2 kept-superset
doctrine — the clone's real-href navigation superset, every visible layer
byte-equal).

**R104-B — the 404 title's multi-word form (VERIFIED live — MEDIUM).** The
neo-crm D-194a4 doctrine's eon-hr member. The REF titles an unknown route
`definitely-not-a-real-route-r104` → **"Definitely Not A Real Route R104 |
Eon HR"** — Title Case with hyphens→spaces, EVERY word capitalized. The
clone renders "Definitely-not-a-real-route-r104 | Eon HR" — the raw segment
with the first letter capitalized. The r35 pin's fixtures were single-word
segments (`/nonexistentroute123`, `/foo/bar`) — the multi-word form was
never measured (the fixture blind spot).

**The fix:** the client island's slug transform splits the last segment on
hyphens, capitalizes every word, joins with spaces (the single-word r35
pins survive verbatim).

**R104-C — the XeTeX family (the 12th writer) extracts as WORD-PER-LINE
SOUP (VERIFIED on the real Tanmay_CV.pdf — CRITICAL within the superset
flow).** The 12th-writer hunt pinned **XeTeX** (Producer "xdvipdfmx
\(20210318\)" — the Tanmay CV, a real XeTeX-compiled resume, the exact
job-applicant flow surface; plus two 2026 doc files: the dvipdfmx manual,
Producer "XeTeX version 0.999998", and fontspec.pdf, Producer "xdvipdfmx
\(20260317\)"). The CV's operator form (census: BT=379, TJ=383, Tf=380,
**Td=383, Tm=0** — no Tm at all):

```
BT /F8 9.4645 Tf -7.856 -147.305 Td[<01f8>]TJ ET
BT /F8 9.4645 Tf .073 -147.305 Td[<01a5036302640345>]TJ ET
BT /F8 9.4645 Tf 23.502 -147.305 Td[<005f03b1...>]TJ ET
```

— **every word its own BT block with an ABSOLUTE Td** (same-line words
share the identical ty; the next line's ty differs by the leading). The
walk has NO BT/ET awareness: `shownSinceTm` stays true (no Tm in the
stream), so every word's fresh Td takes the between-shows path —
`pendingTy += -147.305` → `sep = "\n"` per word → the file extracts as
"Zooked\nis\na\ntechnology-based\nstart-up…" (2,243 alnums, words intact
but every one on its own line — the r103 Skia word-per-line class with a
DIFFERENT mechanism: the position rides the Td, not the Tm). The header
lines extract correctly (multi-show BT blocks with within-block relative
Tds, ty=0 — the r100-A form).

**The fix (the R103-B pattern extended to the Tm-less absolute-Td form):**
the operator regex gains a **BT alternative**; a BT begins a FRESH RUN
(`btFresh = true`, `tmInRun = false`); any show clears it. A Td arriving
in a fresh run **without an intervening Tm** (the XeTeX/pdfTeX form — the
Tm forms keep the r103-B rules verbatim) is an ABSOLUTE placement: the
walk tracks the last fresh-run Td origin (`lastFreshTd`), and the
**origin-to-origin delta drives the separator exactly like the Tm rule**:
`|dy|/size ≥ 0.5 em` → a line move (pdfTeX's per-line absolute Tds —
ty always differs by the leading — keep their newlines); same-ty →
same-line: a backwards or ≥1.0-em dx → a word gap, a forward sub-em dx →
a glyph continuation (the join). The residual (single-letter words whose
width + space < 1.0 em fuse with the next word — "a technology-based" →
"atechnology-based") is the same unthresholdable class as the r103 LuaTeX
narrow-ending word-gap residual (the two-pass per-letter width table
watch) — measured and documented, not silently dropped.

**R104-D — the multi-page /F-name collision: the font chain's last-wins
mapping decodes multi-page docs through the WRONG font's CMap (VERIFIED on
the real fontspec.pdf — HIGH).** `cv-text.ts`'s R102-B font chain builds
`fToObj` as `Map<string, number>` — `matchAll(/\/(F\w+)\s+(\d+)\s+0\s+R/g)`
with `fToObj.set(fm[1], …)`: **the LAST /F1 → object pair in the WHOLE
file wins**. fontspec.pdf carries 60+ pages, each page's resource dict
naming its OWN fonts /F1…/F10 — the title page's /F1
(QERJRC+TeXGyrePagella-Regular, whose CMap decodes the title codes
CORRECTLY: bfrange `<0022><003B><0041>` → 0x27→'F', 0x50→'o'…) loses to
the last page's /F1, and the title's atoms decode through the wrong
font's map — "Font selection for XeLaTeX" → **"Dnms rdkdbshnm knq X i L
A T E X"** (85,986 alnums, 1 soup run — the wrong-map decode class). The
dvipdfmx manual carries the same class (Armenian homoglyphs in the title
font: "Tհe Dvipdfmx սser maոսal" — the wrong per-page map).

**The fix:** `fToObj` becomes `Map<string, number[]>` (EVERY /F-name →
object pair collected in file order); `cmapsFor(font)` returns the
font's FULL candidate list (each candidate's own CMap via the standing
objToTu/tuToCmap chain) before the global fallback. The
first-FULLY-COVERING rule in `decodeHexString` then picks the per-page
map: the atom's own page's map covers its codes; the same-name maps from
other pages (different subset glyph-ID assignments) generally do not.
Single-page files (the whole standing corpus) keep exactly one candidate —
the previous behavior verbatim.

## The classification round (the hunt's other members)

- **The Dingbats marker decode** (the Tanmay CV's list bullets, F6 =
  `/BaseFont /KVHOJR+Dingbats`, FirstChar/LastChar 212, **NO /ToUnicode**):
  the literal `(\324)` decodes through latin1 as "Ô" — a cosmetic
  no-ToUnicode-simple-font decode (the marker glyph, not a keyword
  carrier; all real words ride the Type0+ToUnicode hex atoms). CLASSIFIED
  + WATCHED (the standard-encoding font decode — Dingbats/Standard/Symbol
  — could map the Adobe standard encodings; the watch). The queue's
  non-ASCII `/Differences` remap class remains UNsurfaced (the XeTeX
  files use Identity-H + ToUnicode, no /Differences).
- **The macOS Quartz hunt**: the fichier-pdf.fr Quartz CV candidate timed
  out — the 13th-writer hunt stays on the queue.

## The test plan (TDD)

1. **RED (unit, `tests/unit/cv-text.test.ts`, the session-104 block)** —
   (a) the XETEX FORM: a per-word-BT PDF with absolute Tds (same-ty words
   + a line move) → the words extract space-separated on their line, the
   lines newline-separated (RED today: word-per-line); (b) the XETEX
   LINE-MOVE guard: pdfTeX's per-line absolute Tds keep their newlines
   (born-green — the fresh-Td dy rule); (c) the XETEX SUB-EM CONTINUATION:
   a same-line forward sub-em fresh Td joins (the bullet→word class);
   (d) the F-NAME COLLISION: a two-page-shaped PDF with TWO /F1 → object
   mappings, each font with its OWN ToUnicode, the atoms decode through
   their OWN page's map (RED today: the last mapping wins for both);
   (e) the SINGLE-PAGE guard: the standing single-font chain keeps its
   behavior (born-green — the whole standing session-102 block is the
   regression net).
2. **RED (unit, `tests/unit/recipes.test.ts` or the not-found island)** —
   the title transform: "definitely-not-a-real-route-r104" → "Definitely
   Not A Real Route R104" (RED today: the raw-segment form); the
   single-word pins ("nonexistentroute123" → "Nonexistentroute123",
   "foo/bar" → "Bar") survive verbatim.
3. **GREEN** — the `cv-text.ts` changes (the BT alternative + the
   fresh-run Td origin-delta rule + the multi-candidate font chain) and
   the `not-found.tsx`/`not-found-copy.tsx` changes (the heroicons SVG
   inline + the title transform).
4. **RED→GREEN (E2E)** — extend `tests/e2e/not-found.spec.ts`: the Go
   Home icon identity (1 path, no svg stroke-width, no width/height
   attrs, the `w-4 h-4 mr-2` class) + the multi-word title. A new
   `tests/e2e/session104-xetex-cvflow.spec.ts`: a per-word-BT
   XeTeX-shaped CV through the actual UI (tab → job select → upload) →
   the analysis card → the persisted row → the cleanup (the r103 spec
   pattern; the fixture audit run BEFORE the spec).
5. **The mutation proof (one branch per fix)** — M1: the fresh-Td
   origin-delta rule neutralized (back to the standing ty rule) → the
   XETEX spec RED; M2: the multi-candidate font chain reverted (last-wins)
   → the COLLISION spec RED; M3: the title transform reverted → the title
   spec RED; M4: the inlined icon swapped back to lucide → the E2E icon
   identity RED. Each mutation: RED exactly as designed; restore →
   REBUILD (the §110 rule) → all green.
6. **Gates** — lint 0/0 · tsc ✓ · unit 1034+N · build ✓ (under
   `env -u DATABASE_URL`) · E2E 556+M (the final gate ALONE, the detached
   node-spawn protocol) · DB pristine at close.

## The round's verification legs (the standing protocol)

- The real-file ground truth after the fix: the Tanmay CV (word-per-line →
  readable lines with the documented narrow-word fusion residual), the
  dvipdfmx manual (the homoglyph class re-measured), fontspec.pdf (the
  title decode re-measured), plus the standing corpus re-established
  (IRS f1040, an arXiv paper, the LO guides — the alnum pins IDENTICAL).
- The live post-fix verify on :3200 — a XeTeX-shaped CV through the actual
  UI (tab → job select → upload) → the analysis card (screenshot
  evidence) → the candidate swept (DB pristine). The 404 interior pair
  (icon identity + title) re-verified against the live REF.
- The mobile-nav pair re-verified on the remediated build (the standing
  emphasis).
- The evidence chain: r104 PNGs under `docs/screenshots/`.
- The docs layer: this plan + the narrative (`docs/session_235.md`) + the
  raw transcript (`docs/session_236.md`) + the AGENTS session-104 layer +
  the SKILL lesson + the CLAUDE/README/AGENTS count lockstep + the worklog
  round-103 entry.

## The round's traps (found live, retired here)

- **THE FRESH-SESSION VIEWPORT DRIFT**: `agent-browser --session X set
  viewport 1440 900` on a FRESH session launches the browser and sets the
  viewport — but the first `open` (or a later relaunch) can reset it to
  the 1280×577 default. The first login probe captured at 1280×577 and
  read as a 12.9%-pixel DIFF; the VERIFIED-VIEWPORT guard (re-apply +
  verify `window.innerWidth` after every open) cured it — the re-capture
  was BYTE-IDENTICAL to the baseline. The lesson: a viewport claim is
  only as good as its verification at read time.
- **THE REF-SESSION COOKIE LAPSE**: the verify-r49 ladder's "ref" named
  session profile carried a lapsed auth cookie (expired since the
  session-103 close) — every REF route read bounced to /login and the
  ladder read 0/13 all-DIFF (the r78 systematic-bounce class). The cure:
  re-auth the named session, re-run. A standing-ladder run that reads
  ALL-DIFF is a login bounce until proven otherwise.
- **THE BETWEEN-CALL PROCESS REAP (round four)**: the nohup'd background
  verify-r49 run died silently between bash calls with an EMPTY log —
  only the detached node-spawn protocol survives between calls.
- **THE AGENT-BROWSER THREAD EXHAUSTION (round three)**: 57 orphaned
  chrome processes after a killed ladder — pkill, settle 4s, then
  serialize all browser work (never a probe and a ladder at once).

## Execution appendix (filled at close)

- **RED 3/3 as designed** — the XeTeX word-per-line spec ("securely\nsupport\nspecialist…" under the pristine walk), the sub-em continuation join spec, and the F-name collision spec; the pdfTeX per-line guard born-green; the not-found-title seam's 6 pins (the seam extracted at the GREEN step — the seam's unit spec pins its contract; the production RED rode the E2E layer).
- **GREEN 1044/1044** (1034 + 10 net new: +4 cv-text, +6 title-seam) · tsc ✓ · lint 0/0.
- **The GREEN verification's three fixture catches:** (1) the sub-em spec's 30-alnum draft vs the 40-alnum guard (the r97 fixture-length lesson, EIGHTH application); (2) the sub-em assertion pointed at the wrong pair (the join lands between the 0.33-em-delta pair); (3) **the collision fixture's raw objects missing `<< >>`** — the objToTu scan never engaged, the chain never ran, the GREEN was the global fallback's ACCIDENT. The M2 mutation exposed it (the revert changed nothing); the brackets landed and the teeth appeared. **THE FIXTURE-MUST-EXERCISE-THE-FIXED-PATH LESSON.**
- **The mutation proof (four branches):** M1 (the fresh-Td rule neutralized) → unit exactly **2 RED**; M2 (the font chain reverted to last-wins, the type-safe form) → unit exactly **1 RED** + E2E exactly **1 RED** at the designed assertion (skillsMatch 29 < 45); M3 (the island's title reverted) → E2E exactly **1 RED**; M4 (the icon swapped back to lucide) → E2E exactly **1 RED**. **The M1 E2E leg documented NO-TEETH** — the scorer's tokenizer splits on `/[^a-z0-9+#]+/` (newlines are whitespace); the leg rides the unit layer (the r100/r102 documented split).
- **The E2E fixture audit (run BEFORE the spec):** FIX matched=14 / skillsMatch=58 vs M2 matched=7 / 29; the guard cleared 106/106 both sides. The first E2E run's 4 not-found failures = the stale-chrome resource exhaustion (53 orphaned processes; pkill + settle + serialize), not assertions; the re-run born-green 5/5 + 1/1.
- **The real-file ground truth after the fix:** the Tanmay CV reads as lines — "ZOOKED INDIA | UI/UX DESIGNER (INTERN) / June 2022 – Current | Remote / Ô Zooked is atechnology-based start-up that provides software as aservice…" — 2,243 alnums IDENTICAL, 0 soup, the single-letter-word fusions the documented unthresholdable residual (the same class as the r103 LuaTeX 38-fusion residual; the two-pass per-letter width table watch). fontspec.pdf's title 100%-garble → "Dont selection for X Ǝ L A T E X and LuaL A T E X" (the one-letter residual = the position-based candidate order; the page-tree-aware chain is the future work). The dvipdfmx manual's Armenian homoglyphs persist (the same order residual; the alnums 60,195 → 61,437 — MORE Latin letters through the right maps). The standing corpus re-established: **IRS 5,871 IDENTICAL · arXiv-2404.16710 67,744 IDENTICAL** (the LO guides and the r101/r103 CV corpus files could not be re-sourced — the URL patterns dead-ended; the 1044-spec unit net carries their writer-form pins). **The corpus: TWELVE writers.**
- **The live post-fix verify (after the port-holder boot fix):** the REAL XeTeX CV bytes through the actual UI → the candidate "tanmay xetex cv" persisted (aiScore 24, skillsMatch 25) → swept (DB pristine: 1 user / 0 candidates after the verify-r45 signup-probe user swept). The mobile-nav pair re-verified on the remediated build (the PARITY contract, the menu cycle green).
- **THE PORT-HOLDER TRAP (retired):** the environ-based kill skipped the original :3200 server (its /proc/PID/environ unreadable); the new boots' health checks answered from the OLD process still holding the port — every "post-fix" read silently hit the pre-fix build (the tab clicks that would not switch, the rate limiter that "survived" a reboot, the login timeouts). The cure: kill BY THE PORT HOLDER (ss -tlnp → the pid → the parent spawn); the boot script rewritten.
- **Final gates on the remediated tree:** lint 0/0 · tsc ✓ · **1044/1044 unit** · build ✓ (under `env -u DATABASE_URL`) · E2E **558/558** (the 556 standing + the 2 new; the final gate ALONE via the detached node-spawn protocol) · DB pristine at close.
- **The evidence chain:** the r104 PNGs (the 68th-state login probe + the deploy-diff side-by-side, the REF + clone mobile-nav opens, the clone training-mobile landing, the CV tab, the analysis card).
- **The docs layer:** this plan + the narrative (docs/session_235.md) + the raw transcript (docs/session_236.md) + the AGENTS session-104 layer + the SKILL v3.91.0 §116 + the CLAUDE/README/AGENTS count lockstep (1044 + 558 = 1602) + the worklog round-103 entry.
