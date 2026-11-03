# Session 123 — Narrative

## The security-bump + bare-number re-order round (parity round 122)

The workspace fresh-cloned (the sandbox reset again), the environment
rebuilt (bun install 524 packages; `.env` with
`DATABASE_URL="file:../db/custom.db"` + a fresh AUTH_SECRET; db:push +
db:seed), and the baseline gates reproduced the documented session-122
close exactly: lint 0/0 · tsc ✓ · **1169/1169 unit**. The corpus
re-source ran in the foreground (the reaping trap): the seven members
re-downloaded — ReportLab `0f64df85` EXACT, Prawn `699ebcab` EXACT,
QUARTZ `27575d59` EXACT via the submodule trail, arXiv at exactly
1,543,672 bytes, dvipdfmx via texdoc.org, fontspec, IRS — the extraction
ledger at the r122-cured state (6 pins IDENTICAL + ReportLab at the
r122-cured form), every alnum exact. typst 0.15.1 re-installed, the
chromium-1248 build re-installed, the 16 family members regenerated
through their committed generators — ALL EXACT at HEAD.

## The opening read — the 87th-deploy watch

The login asset census read BOTH the JS and the CSS churned
(`index-C_KCpRIS` → `index-CCUlq8S3`, the CSS `index-xihcXjhm` →
`index-BVWWKVEJ` — the CSS had held since the 85th, so a double-churn).
The computed census: **RENDER-STABLE** — the island intact, every warm
token byte-stable at the session-121/122 baselines, the Google label
span **164.25px on the Wix Madefor Text** (the r122 mirror holding), the
webfont `loaded`. The app side quiet (the r42 assets). The dashboard: 1
pixel in 1,024,000 — after one trap: the FIRST capture pair diffed
28.9% because the reference's cards animate in on load and the capture
caught mid-flight frames; the settle-wait re-capture read the standing
parity (the text census IDENTICAL — the diagnostic that the 28.9% was
temporal, not structural). The mobile-nav pair (the user's named
focus): PARITY — the REF's stay-open drawer regression persists through
its EIGHTEENTH deploy (the drawer at x:0, transform none, opacity 1
after the /training navigation) while the clone's auto-close superset
holds (the drawer fully unmounted), with no Tailwind v4 regression
anywhere.

The audit legs: the neo-crm HEAD UNCHANGED at s211 (the login semi-island
event — the genus already transferred as D-122a; no s212+ layer due);
the advisory census unchanged (2 dev-toolchain vulns, zero runtime
exposure); and **the patch watch fired: `next@16.4.5` landed as latest —
a security release** (the day after 16.4.4: seven moderates, including
the cross-client response injection in self-hosted apps — this repo's
own standalone deployment form). Per the r121 doctrine the bump shipped
same-round: `next@^16.4.5` + `eslint-config-next@^16.4.5`, the gates
green on the bumped tree before the hunt began.

## The hunt (R123-A/B) — the two residual shapes the dots-leader cure never touched

The r123 queue's named classes, measured end-to-end on the re-sourced
ReportLab member. The piece census decoded two shapes that paint the
page number BEFORE the entry with NO dots for the r122 shape guard to
match:

- **The squeezed-number class** (the wrapped 8.3 row): the page number
  renders as a BARE number at a TINY ps (`"92"` at px 511.5, **ps
  5.165607** = 0.43× the entry's ps 12) whose px sits EXACTLY at the
  entry's tracked end (bx 511.5 — the gap-0 squeeze: the long entry
  consumed the whole line, the leader dots squeezed to zero, the number
  shrunken into the remaining sliver). Our stream order read
  `92 8.3 DocPara(…)`; pdftotext reads the number GLUED to the entry's
  last word — `…escape=True)92`.
- **The chapter-header class**: the 13 chapter/appendix rows + the
  self-referential TOC row (`2 Table of contents`) paint the number
  BEFORE the title, right-aligned in the page-number column (px
  503.3–510.3, every number's bx 517.3). Our stream order read
  `6 Chapter 1 Introduction`; pdftotext reads `Chapter 1
  Introduction\n\n6` — the number on its OWN line (the block assembly).

**The fire-separation census** (the bare-number pairs across the whole
corpus): ReportLab 14 pairs, IRS 1 pair — the f1040 title row (`"25"` at
ps 20 before `"U.S. Individual Income Tax Return"` at ps 12, the title's
end 1.18 em back — INSIDE the contiguity band), where the swap measures
word-stream NEUTRAL (the split-year `"20 25"` construction: pdftotext
reads the glued `"2025"`) — a pin drift without a toward verdict. The
IRS pair must NOT fire.

**The in-round refutation**: the first chapter-class design guarded the
gap (≥ 13 em — the R117-A column band, measured on the first chapter
row's 20.9-em geometry). The real member refuted it: the long titles
leave gaps of 1–12.5 em (Chapter 5's title ends 1.01 em from its
number), and 4 rows stayed uncured. **The gap axis is not the class's
invariant** — the cures were redesigned on the axes that hold:

1. **The ps axis**: the chapter numbers render at the title's OWN ps
   (`np.ps ≥ ep.ps`) — the squeezed tiny numbers never fire there,
   keeping the two passes disjoint (the squeezed pass: `np.ps < ep.ps`).
2. **The boxed-pair guard**: the IRS year-box paints `"20"` then `"25"`
   at the SAME origin (px 298, py 748.7) — a number immediately preceded
   by a same-origin piece is a boxed pair, never a column number. The
   sole guard keeping the IRS member IDENTICAL (the IRS pair passes the
   ps axis at 20 ≥ 12).
3. The overlap floor (the number's px at/past the entry's tracked end —
   belt-and-suspenders, no measured member).

**The cures**: R123-A swaps the contiguous tiny number to the entry's
end with the sep reset to `""` (the GLUE — the measured gap-0 form);
R123-B swaps the column number after the title with the sep reset to
`"\n"` (the number on its own line, pdftotext's block form).

The TDD round: RED 2/2 + 3 born-green guards → **GREEN 1174/1174**
(1169 + 5); the mid-band guard spec REWRITTEN to the new doctrine (the
gap-axis refutation — the r118 doctrine: a refuted guard spec gets
rewritten, not deleted); the proto resynced after every source change.

**The measured cure**: the number-first rows 14 → 1 (the sole remainder
the cover address block, correctly in stream order); the
title-first-own-line rows 20 → 33; the word-stream similarity
0.9076 → **0.9080 TOWARD**; alnums 213,160 exact; the 8.3 row reading
`8.3 DocPara(…escape=True)92` — byte-form pdftotext's own.

**The mutation matrix exact** (`scripts/r123-mutations.py` — the runner
resyncs the proto after every mutation so the sync arm stays green by
construction): M1 [the squeezed pass disabled] 1 · M2 [the tiny-ps guard
dropped] 1 — the IRS boxed-pair spec goes RED because the squeezed pass
fires the pair · M3 [the chapter pass disabled] 2 · M4 [the boxed-pair
guard dropped] 1 — the chapter pass fires the pair · M5 [the sep resets
dropped] 3 — the glued form + the two own-line forms.

## The verification

- **The drift ledger (zero away)**: the 7 corpus members — 6 IDENTICAL
  at the cured source (**the IRS pin `eeb0ce16` held — the boxed-pair
  guard's proof**) + ReportLab TOWARD; the **16 family members ALL
  EXACT**.
- **The live UI verify (the r104 protocol)**: the Typst resume2 probe
  through the recruitment AI-CV-Upload tab — name-first (namePos 0),
  dateSplit TRUE ×2 in the STORED cvText, zero U+FFFD; swept by the REAL
  id (200); the DB PRISTINE (1/1/0/3/2/0). **The in-round finding**: the
  ReportLab userguide (the hunt member) is NOT uploadable through the CV
  surface — its 291,107-char extraction exceeds the `cvText` validation
  cap (max 20,000, the designed CV boundary; the POST 400s) — the
  member's cure verification stays at the corpus layer, documented in
  the script.
- **Gates**: lint 0/0 · tsc ✓ · **1174/1174 unit** · build ✓ · E2E
  **565/565** (run in 3 foreground chunks — 200 + 187 + 180, zero
  failures; the ~11m full run against the 10-minute tool timeout).
- The 7 r123 screenshots verified non-blank: the login pair at
  **0.0214%** (the r122 island mirror holding through the 87th deploy),
  the dashboard pair at 1 pixel, the mobile-nav pair, and the training
  cycle.
- **The docs layer**: the plan (docs/remediation-plan-session123.md) ·
  this narrative · the AGENTS session-123 layer · the SKILL v4.10.0
  §135 · the count lockstep (CLAUDE/README/AGENTS: 1174 + 565 = 1739) ·
  the worklog round-122 entry with the r124 queue armed.

The r124 queue: the remaining blind pockets (IRS 94.7% ZaDb · arXiv
97.3% CJK · ReportLab ~95% the MacRoman-class glyphs), the Typst sub-em
residuals (output-neutral today — a precision hunt), and the standing
watches (the REF stay-open drawer; the neo-crm s212+ layer; the LO Calc
re-source; the advisory census; the next patch watch).
