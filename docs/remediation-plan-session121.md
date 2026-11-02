# Remediation Plan — Session 121 / Parity Round 120

Three materials, each measured end-to-end before any code: the November 3
security-release bump decision (the r121 queue's lead item — the release
landed as `next@16.4.4` the morning of this round), the 85th-deploy login
delta (the FIRST visual movement on the login surface since the 69th
deploy — the opening read's find), and the resume2 intra-block
under-tracking hunt (the r121 queue's named hunt class — the /W
range-triple parse defect).

## The opening read (the 85th-deploy watch)

| Leg | Result |
| --- | --- |
| Login asset census | JS `index-CKrafp-m` → `index-r0DWh4vL` **AND** CSS `index-CapATpwD` → `index-xihcXjhm` (the CSS had held since the 82nd) — the render **BYTES DIFFER** from the standing `69aa4241…` baseline (probe `6e493378…`): **the 85th deploy RENDERED** — the first visual login movement since the 69th |
| The delta (member-by-member, diff bbox 536–903 × 309–531 = the social row + the or-divider only) | the social-auth row moved cool-slate → warm neutrals: text `slate-700 rgb(51,65,85)` → `#0F0E0E rgb(15,14,14)` · border `slate-200 rgb(226,232,240)` → `#E9E6E0 rgb(233,230,224)` · hover bg `#F1EEEA` + border `#DDD8D2` + the v3 `--shadow-sm` geometry · the or-chip text `slate-500` → `#5D5D5D rgb(93,93,93)` — **everything else byte-stable** (h1 slate-900, labels slate-700, the divider LINE slate-200, the input borders slate-200, the Sign-in fill slate-900, the forgot/signup slate-400, the card) |
| App-side assets | `index-C-IrDy5f` / `index-BGNH4KkS` — **QUIET, the r42 baseline holds** (the 85th is login-side-only) |
| Mobile-nav pair (390×844, the user's named focus) | **PARITY** — both sides 28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer (REF 16 items, Close `display:none`; clone 15, the a11y supersets); the menu cycle `/training`: REF STILL-OPEN (the 69th's regression through its SIXTEENTH deploy), clone AUTO-CLOSED (the pinned superset); **no Tailwind v4 regression** |
| Patch watch | **the November 3, 2026 security release LANDED** — `next@16.4.4` is `latest` on npm (the advance notice: seven medium vulnerabilities) → **the bump decision: BUMP** (below) |
| Advisory census | unchanged: deepmerge-ts dev-chain high + minimatch moderate, both dev-toolchain transitive, zero runtime exposure (`bun audit` 2 vulns) |
| neo-crm HEAD | **s210-close** (`839cce7` — the session_443 transcript, the rotation trigger; the s210 census checkout-portability genus already transferred as eon-hr's D-120a) |

## THE CORPUS RE-SOURCE (the fresh sandbox)

The workspace fresh-cloned (the standing brief's contingency): bun install
(524 packages) + `.env` (the two-variable contract) + db:push/db:seed;
baseline gates at the documented session-120 close (lint 0/0 · tsc ✓ ·
**1158/1158 unit** — the D-120a proto cure holding on the fresh clone).
The /tmp corpus re-sourced and verified at HEAD before any change:
arXiv · dvipdfmx via texdoc.org (the mirrors.ctan.org 404 again) ·
fontspec (a fresh build — the extraction pin is the test) · IRS · QUARTZ
via **the submodule repo tree path** (`codeberg.org/xmlcalabash/test-suite`,
`test-suite/documents/longer.pdf` — the codeberg raw 404 was a PATH issue:
the extra-suite is a submodule whose documents live one level deeper; file
md5 `27575d59` EXACT) · ReportLab (`0f64df85` EXACT) · Prawn (`699ebcab`
EXACT); the LO Calc member NOT re-sourceable (the r103 precedent); typst
0.15.1 re-installed, the 4 members + the 16 family members regenerated
through their committed generators — **all 7 pins + 4 Typst + 16 family
members EXACT at HEAD**.

## MATERIAL 1 — the November 3 security-release bump (the lead item)

**The decision**: the standing `^16.4.2` HOLD existed because 16.4.3 was a
routine release; the Nov 3 release was announced (7 medium
vulnerabilities) and **landed the morning of this round** as `16.4.4`
(the `latest` dist-tag; the lockfile pinned 16.4.2). The r121 queue named
this decision as its lead item → **BUMP**: `bun add next@^16.4.4` +
`bun add -d eslint-config-next@^16.4.4` (the AGENTS rule: bun add, never
hand-edit package.json).

**The validation**: lint 0/0 · tsc ✓ · 1158/1158 unit · build ✓ on the
bumped tree. The first E2E run failed 171 specs mid-run
(`ERR_CONNECTION_REFUSED` at :3100 from test 389) — the isolated re-run
(without the round's concurrent browser sessions + the :3200 dev server
eating the 3.9 GB no-swap sandbox's memory) came back **559/559 clean
(10.8m)**: the failure class was ENVIRONMENTAL (memory pressure), not a
16.4.4 regression. The final gate re-ran on the remediated build: clean
(see the gates below).

## MATERIAL 2 — the 85th-deploy login delta (D-121b)

The first RENDERED login deploy since the 69th: the social-auth row's
warm-token move (measured above). **The cure** (`src/app/login/page.tsx`):
the three social buttons — `text-slate-700` → `text-[#0F0E0E]`,
`border-slate-200` → `border-[#E9E6E0]`, `hover:bg-slate-50` →
`hover:bg-[#F1EEEA]`, `hover:border-slate-300` →
`hover:border-[#DDD8D2]` (the `hover:shadow-sm` keeps the v3-pinned
geometry — the live-measured hover shadow IS `rgba(0,0,0,0.05) 0px 1px
2px 0px`); the or-chip — `text-slate-500` → `text-[#5D5D5D]` (the
divider LINE stays slate-200 — the deploy kept it). The measured-hex
parity-pin pattern (the card's own `text-[#09090b]` precedent).

**The pins** (`tests/e2e/session121-login-warm-tokens.spec.ts`): R121-A
the at-rest warm tokens (all three buttons: text `rgb(15,14,14)`, border
`rgb(233,230,224)`, bg white) · R121-B the hover pair (bg `rgb(241,238,234)`,
border `rgb(221,216,210)`, the v3 shadow-sm geometry, the text holds) ·
R121-C the or-chip (`rgb(93,93,93)`, 12px/500) · R121-D **the
fire-separation guard** — the UNCHANGED members stay at the standing
values (h1 slate-900, the input borders slate-200, the divider LINE
slate-200, the Sign-in fill slate-900, the forgot link slate-400) so the
cure cannot over-reach.

**The dead-premise rewrites** (the doctrine — a spec riding a refuted
measurement gets rewritten to the new truth, not deleted): the or-chip
pin in `auth.spec.ts` (R38-K: `rgb(100,116,139)` → `rgb(93,93,93)`, the
refutation note inline) and the three class-list pins in
`recipes.test.ts` (R38-F1 the social family's full class list, R38-K1 the
or-chip class, R39-A1 the count anchor — each carrying its session-121
amendment note).

## MATERIAL 3 — THE HUNT: the resume2 intra-block under-tracking (R121-A)

**The r121 queue's named hunt class**, measured end-to-end before any
code: resume2's standing watch — the pair at **ours 22.21 em vs the true
4.99** (poppler's word boxes). The per-word census
(`scripts/r121-resume2-hunt.ts`) isolated the mis-tracked line's anatomy:
the justified line "Owned the performance review cycle and the onboarding
program for 200 new hires." — ONE TJ array of 81 glyphs in three
kern-split pieces, all stamped at the line origin (px 42.5), the tracked
end (bx) accumulating to **259.7 against the true 435.8 — a uniform ~45%
under-advance**.

**THE ROOT CAUSE** (the raw /W table read side-by-side with the parse):
the Typst writer's /W table on resume2 carries **ONE RANGE TRIPLE** —
`15 16 485` (consecutive subset CIDs 15–16 sharing width 485) — among
the k-k-w singles. The r117 triple detection requires `nums[i] ===
nums[i+1]` on EVERY group; the range triple kills it and the table falls
to the PAIR reading, which reads the triple sequence as interleaved
garbage (widths land as fake CIDs). On the real member every code
happened to stay a key with a wrong value (the ~45% under-advance); on
subsets where a range-covered code lands as a pair VALUE, the code goes
MISSING from the map and — with `/DW 0` — the whole block goes
width-blind (no bx, the column rule disarmed). **resume (v1) tracks
accurately because its subset is all single-CID triples (255 tokens,
strict form holds); resume2's longer text grew the subset past a
same-width run boundary (258 tokens, one range) — the same writer, the
same fonts, a different subset shape.**

**THE CURE (R121-A)** in `parseWidthsArray`: after the strict k-k-w
check, a RANGE reading — every group `(cfirst, clast, w)` validating
`cfirst ≤ clast`, `w > 0`, the groups strictly ascending without overlap
(`nums[i-2]` = the previous group's clast) — AND the pair reading
INVALID (a real `c w` pair sequence reads as ascending pair-CIDs; a
triple sequence's pair reading descends — the two readings are
structurally disjoint under that check, so a standing pairs member keeps
its parse verbatim). The expansion assigns the shared width to every CID
in `[cfirst, clast]`.

**THE MEASURED CURE** (the hunt census re-run): the phantom pair GONE
(below the 5-em display floor — it now reads ~5.12, the true value); the
"compliance training" line **19.99 em vs the true 20.24 (was 31.29)**;
the cert|year pairs 38.69/41.93 vs the true 38.94/42.18 (accurate) —
the intra-block under-tracking CURED, the residuals ~0.25 em (the sub-em
kern class).

**The TDD round**: RED 1/1 (the hunt spec — a range-triple /W table
whose range-covered code goes missing under the pair reading → blind →
joined; GREEN after the cure: the range expands, the column rule arms,
the split fires) + 2 born-green guards (the over-reach guard — a
sub-threshold pair stays joined under the range-triple table; the
pair-form preservation — a pure ascending /W pair sequence still parses
as pairs and carries its split on the PAIR widths).

**The in-round design finding** (documented in the spec file): the
both-valid ambiguity — a /W sequence where BOTH readings validate —
yields near-identical maps wherever the coverages overlap, and the only
behavioral divergence (a range-gap code going missing) requires the pair
keys to skip codes, which makes the pair sequence itself non-covering
for any realistic fixture text. The pairs preference (the standing
behavior) is therefore behaviorally indistinguishable on this class; the
pair-validity guard is belt-and-suspenders, pinned by the mutation
matrix's M3 arm (the sync arm only) rather than a spec.

**THE MUTATION MATRIX** (`scripts/r121-mutations.py`, the fresh-file
assert against the stale-json trap): M1 [the range reading removed] **2**
(the hunt spec + the sync arm) · M2 [the expansion collapsed to the
single-CID form] **2** (the hunt spec — code 62 goes missing → blind +
the sync arm) · M3 [the pair-validity guard dropped] **1** (the sync arm
only — the empty behavioral surface above) — each restored green.

**The drift ledger** (the discipline — every member IDENTICAL or TOWARD,
zero away): the 7 corpus pins HOLD at the cured source (arXiv/dvipdfmx/
fontspec/IRS/QUARTZ/ReportLab/Prawn — the pair-form members keep their
pair parse verbatim); the 4 Typst members' extractions **byte-identical**
HEAD ↔ cured (the phantom gap inflated the MEASUREMENT, not the OUTPUT —
both verdicts were SPLIT, so the split fired either way; the cure's value
is the accurate gap feeding the ≥ 2.5 em threshold and the disarmed-blind
class); the 16 family members EXACT. The bx coverage unchanged
(dvipdfmx/fontspec/QUARTZ/Prawn/WeasyPrint 100% · arXiv 97.3% · IRS
94.7% · ReportLab 95.6% — the blind pockets stay the r122 queue).

## THE ToDo list (the round as executed)

- [x] The 85th-deploy watch: RENDERED login-side-only (the JS AND CSS
      moved; the app side QUIET at the r42 baseline) — the delta audited
      member by member (the warm social row + the or chip; everything
      else byte-stable)
- [x] The mobile-nav pair: PARITY (the user's named focus; the REF
      stay-open regression through its sixteenth deploy)
- [x] The corpus re-sourced + verified at HEAD (the QUARTZ trail
      corrected: the submodule repo's `test-suite/documents/longer.pdf`
      path; all pins + families exact)
- [x] THE BUMP: `next@16.4.4` + `eslint-config-next@16.4.4` — the Nov 3
      security release (7 medium) landed; validated through the full gate
      chain (the first E2E's 171-failure run isolated to memory pressure,
      the clean re-run 559/559)
- [x] THE LOGIN DELTA cured (D-121b): the warm-token social row + the
      or chip; the 4 new E2E specs + the 3 dead-premise rewrites; the
      fire-separation guard pins the unchanged members
- [x] THE HUNT measured and cured (R121-A): the range-triple /W parse —
      the root cause of the resume2 intra-block under-tracking (the
      22.21-em phantom vs the true 4.99); RED 1/1 + 2 born-green guards →
      GREEN; the mutation matrix exact (M1 2 · M2 2 · M3 1); the corpus
      drift ledger zero-away (the Typst members byte-identical)
- [x] The full gate chain on the remediated build: lint 0/0 · tsc ✓ ·
      **1161/1161 unit** · build ✓ · E2E **563/563** (559 + the 4
      session-121 specs)
- [x] The docs layer (this plan + the narrative + the AGENTS session-121
      layer + the SKILL v4.8.0 §133 + the CLAUDE/README/AGENTS count
      lockstep 1161 + 563 = 1724 + the worklog round-120 entry with the
      r122 queue armed)
- [ ] Commit + push to main via the SSH wrapper (remote-verified, keys
      shredded) [the round's final step — in flight]

## The r122 queue (armed by this round)

- The ReportLab TOC dot-order divergence (the ORDER class — the r116
  carry-over)
- The remaining blind pockets: IRS 94.7% (the ZaDb/unmapped ~5%), arXiv
  97.3% (the CJK unbound parts), ReportLab 95.6% (the MacRoman core
  fonts)
- The Typst sub-em residuals (~0.25 em — the kern accumulation class)
- The standing watches (the REF stay-open drawer through its 16th deploy;
  the neo-crm s211+ layer — the session_443 rotation trigger; the LO
  Calc re-source; the advisory census; the next Next.js patch watch)
