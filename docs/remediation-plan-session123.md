# Remediation Plan — Session 123 / Parity Round 122

Two materials, each measured end-to-end before any code: **the November 4
security bump** (`next@16.4.5` landed as latest — seven moderate
vulnerabilities, the release after the 16.4.4 one) and **the ReportLab TOC
residual re-orders** (R123-A the squeezed-number wrapped-entry class +
R123-B the chapter-header class — the r122 queue's named residuals). The
standing watches all measured quiet.

## The opening read (the 87th-deploy watch)

| Leg | Result |
| --- | --- |
| Login asset census | JS `index-C_KCpRIS` → `index-CCUlq8S3` AND the CSS `index-xihcXjhm` → `index-BVWWKVEJ` (the CSS had held since the 85th — the double-churn form). The computed census: **RENDER-STABLE** — the island intact (`data-ds="base44"`, the social group + the or-divider, the form its sibling), every warm token byte-stable at the session-121/122 baselines (social text `rgb(15,14,14)`, border `rgb(233,230,224)`, bg white, or-chip `rgb(93,93,93)` 12px/500 `tracking 0.6px` on the Wix Madefor Text, h1 slate-900, inputs slate-200, Sign-in slate-900), the Google label span **164.25px on "Wix Madefor Text"** (the session-122 mirror holding), the webfont `loaded` — **the 87th deploy is render-stable** (a recompile, not a redesign) |
| App-side assets | `index-C-IrDy5f.js` / `index-BGNH4KkS.css` — **QUIET, the r42 baseline holds** |
| Dashboard render (1280×800) | **1 pixel in 1,024,000** — parity (a single antialiasing artifact; the first capture pair's 28.9% was an animation-in-flight artifact — the settle-wait re-capture the standing parity). The text census IDENTICAL |
| Mobile-nav pair (390×844, the user's named focus) | **PARITY** — both sides 28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer (REF 16 items, Close `display:none` verified w:0; clone 15 + the a11y supersets); the menu cycle `/training`: REF STILL-OPEN (the 69th's regression through its **EIGHTEENTH** deploy — the drawer at x:0, transform none, opacity 1 after the /training navigation), clone AUTO-CLOSED (the drawer fully unmounted, the pinned superset); **no Tailwind v4 regression** |
| Patch watch | **`next@16.4.5` IS NOW LATEST** — a security release (Nov 3, seven moderates: the cross-tenant `use cache` disclosure family, the cross-client response injection in SELF-HOSTED apps [our deployment form], the SVG rejection bypass, the HttpOnly cookie exposure). The lockfile holds 16.4.4 → **the bump decision: BUMP** (the r121 doctrine — a security release ships same-round) |
| Advisory census | unchanged: deepmerge-ts dev-chain high + minimatch moderate, both dev-toolchain transitive, zero runtime exposure (`bun audit` 2 vulns) |
| neo-crm HEAD | **s211** (`e21269a`) — UNCHANGED since the session-122 audit (the login semi-island event; the genus already transferred as D-122a). **No s212+ layer to transfer** |
| Corpus re-source | The seven members re-sourced and verified at HEAD: ReportLab `0f64df85` EXACT · Prawn `699ebcab` EXACT · QUARTZ `27575d59` EXACT (the submodule trail `test-suite/documents/longer.pdf` in `xmlcalabash/test-suite`) · arXiv 1,543,672 bytes EXACT · dvipdfmx via texdoc.org (244,290 bytes — the mirrors.ctan.org 404 again) · IRS · fontspec. The extraction ledger: 6 IDENTICAL at the r120-cured pins + ReportLab at the r122-cured state (similarity 0.9076, 87 entry-first rows — the standing TOWARD), **every alnum pin exact**. typst 0.15.1 re-installed; the chromium-1248 build re-installed; the 16 family members regenerated through their committed generators — **ALL EXACT** |

## MATERIAL 1 — the security bump (the r123 lead item)

`next@16.4.5` (Nov 3, 2026): seven moderate vulnerabilities — the cross-tenant
`use cache` disclosure via `unstable_cache`, the cache leak across root param
values, the fallback-shell cache poisoning, the cross-user cache
disclosure/poisoning with binary arguments, **the cross-client response
injection and disclosure in self-hosted Next.js apps forwarding fetched
responses** (the standalone-server deployment form this repo ships), the SVG
rejection bypass in image optimization, and the HttpOnly cookie exposure
through the internal response header on Edge runtime routes.

**The cure**: `bun add next@^16.4.5` + `bun add -d eslint-config-next@^16.4.5`
(the r121 form), then the full gate chain re-run on the bumped tree (lint ·
tsc · unit · build · E2E). The E2E runs ISOLATED (every browser session
closed, the :3200 dev server killed — the r121 concurrent-memory trap).

## MATERIAL 2 — THE HUNT: the ReportLab TOC residuals (R123-A + R123-B)

The r122 queue's named residual classes, measured on the re-sourced member.

### R123-A — the squeezed-number re-order (the wrapped-entry class)

**The anatomy** (the piece census, the 8.3 row): a wrapped TOC entry paints
its page number as a BARE number at a TINY font — the piece `"92"` at px
511.5, py 748.9, **ps 5.165607** (0.43× the entry's ps 12) painted BEFORE
the entry `"8.3 DocPara(self, expr, format=None, style=None, klass=None,
escape=True)"` at px 98, the SAME baseline, the entry's tracked end **bx
511.5** — the number's start EXACTLY at the entry's end (gap 0, the squeeze:
the long entry consumed the whole line, the leader dots squeezed to zero, the
number shrunken into the remaining sliver). Our stream order reads
`92 8.3 DocPara(…)`; pdftotext reads `8.3 DocPara(…escape=True)92` — **the
number GLUED to the entry's end** (the geometric adjacency: gap 0).

**The root cause**: the r122 leader cure's shape guard requires ≥2 dots — a
squeezed row has NO dots (the bare number). The phase shift stands.

**The cure**: a bare-number piece (1–3 digits, no dots, no letters) painted
before a same-baseline alnum-rich entry at SMALLER px, with the number's px
within [−1, +3.5] em of the entry's tracked end (the contiguity window — the
same band as the r122 leader cure) **AND the number's ps < the entry's ps**
(the tiny-number signature) swaps the emission positions; the number's sep
resets to `""` (the glue — the measured gap-0 form: the number emits fused
to the entry's last word, exactly pdftotext's `escape=True)92`).

**The fire-separation measurement** (the bare-number census across the whole
corpus — a bare-number piece followed same-baseline by an alnum-rich piece at
smaller px): ReportLab 14 pairs (the 13 chapter rows + this squeezed row) ·
IRS 1 pair — the f1040 title row: `"25"` at px 298 **ps 20** before
`"U.S. Individual Income Tax Return"` at px 97.6 ps 12, the title's bx
283.8 → **gap 1.18 em — INSIDE the contiguity band**. The swap on the IRS
pair measures word-stream NEUTRAL (the "20 25" split-year construction: the
swap moves "25" after "Return" where pdftotext reads the glued "2025" —
ratio-identical, not toward) — a pin drift without a toward verdict, the
zero-away discipline's violation. **The ps guard is load-bearing**: the IRS
number's ps 20 > the title's ps 12 → never fires (the IRS stays IDENTICAL);
the squeezed number's ps 5.17 < 12 → fires. arXiv/dvipdfmx/fontspec/QUARTZ/
Prawn: ZERO candidate pairs.

### R123-B — the chapter-header re-order (the number-before-title class)

**The anatomy** (the piece census): each chapter header paints its page
number BEFORE the title — the bare number `"6"` at px 510.3 (the page-number
column at the right edge), py 674.9, ps 14, painted FIRST, followed by the
entry `"Chapter 1 Introduction"` at px 78, the SAME baseline, the entry's
tracked end bx 218 — **the gap 292.3 units = 20.9 em at ps 14** (the
page-number column: the number floats at the right margin, far from the
title). Our stream order reads `6 Chapter 1 Introduction`; pdftotext reads
`Chapter 1 Introduction\n\n6` — the title first, the number on its OWN line
(poppler's block assembly: the far-apart pieces read as separate blocks).

**The census**: 13 chapter/appendix rows + the self-referential TOC row
(`2 Table of contents` — pdftotext's `Table of contents\n\n2`), every one
the same shape. The 14th census pair is the squeezed row (R123-A's).

**The cure**: a bare-number piece (1–3 digits) painted before a
same-baseline alnum-rich entry at SMALLER px, with the number's px ≥ 13 em
past the entry's tracked end (**the column band — the machinery's own R117-A
column-move threshold**: a ≥13-em same-baseline gap IS a column by the
standing doctrine) swaps the emission positions; the number's sep resets to
`"\n"` (the number lands on its own line — pdftotext's block form; the
word-stream is identical either way, the line form matches the ground
truth).

**The fire-separation**: the ≥13-em gap excludes the IRS pair (1.18 em) and
the squeezed row (gap 0) by construction; the census's zero pairs on the
other five members hold. The two cures are DISJOINT on the gap axis
(contiguity vs column band) and double-separated on the ps axis.

**The guards shared with the r122 form**: same-baseline only (the 0.5-em
tolerance), the entry at smaller px, the entry alnum-rich (≥4 alnums), the
entry's bx defined. The r122 leader shape (dots ≥2) never matches a bare
number; the bare-number shape never matches a dots piece — the three passes
are pairwise disjoint.

## The ToDo list (the round as executed)

- [x] The opening read: the 87th-deploy watch (render-stable; both JS+CSS
      churned, every token byte-stable) · the app-side assets QUIET · the
      dashboard 1 pixel · the mobile-nav pair PARITY (the REF stay-open
      regression through its 18th deploy; no Tailwind v4 regression)
- [x] The corpus re-sourced + verified at HEAD (all pins, every alnum exact)
      + the 16 family members regenerated + EXACT
- [x] The audit legs: neo-crm HEAD at s211 (unchanged — no transfer due) ·
      the advisory census unchanged · the patch watch: 16.4.5 IS a security
      release → the bump decision
- [x] MATERIAL 1: the security bump (next@^16.4.5 + eslint-config-next@^16.4.5)
      + the full gate chain on the bumped tree
- [x] MATERIAL 2: R123-A + R123-B measured (the piece census, the
      fire-separation census, the pdftotext ground-truth forms) → the TDD
      round: RED specs (the squeezed swap+glue · the IRS ps-guard
      fire-separation · the chapter swap+own-line · the unmeasured-band
      guard) → the cures → GREEN → the mutation matrix
- [x] The drift ledger: the 7 corpus members re-verified (6 IDENTICAL +
      ReportLab TOWARD — the residual rows re-ordered, alnums exact) · the
      16 family members EXACT
- [x] The full gate chain on the remediated build: lint · tsc · unit ·
      build · E2E (isolated)
- [x] The screenshots (docs/screenshots/) + the DB pristine check
- [x] The docs layer (this plan + the narrative + the AGENTS session-123
      layer + the SKILL layer + the count lockstep + the worklog entry with
      the r124 queue armed)
- [ ] Commit + push to main via the SSH wrapper [the round's final step]

## The r124 queue (armed by this round)

- The remaining blind pockets: IRS 94.7% (the ZaDb/unmapped ~5%), arXiv
  97.3% (the CJK unbound parts), ReportLab ~95% (the residual MacRoman-class
  glyphs)
- The Typst sub-em residuals (~0.25 em — the kern accumulation class;
  output-neutral today: every split decision already correct, only the
  tracked gap values drift — a precision hunt, not a correctness hunt)
- The standing watches (the REF stay-open drawer through its 19th+ deploy;
  the neo-crm s212+ layer; the LO Calc re-source; the advisory census; the
  next patch watch)
