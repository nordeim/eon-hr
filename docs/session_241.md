# Session 106 — the page-tree activation round (parity round 105)

The narrative of the round that measured its own queue. The condensed
execution transcript is docs/session_242.md; the plan with its filled
execution appendix is docs/remediation-plan-session106.md.

## The open

Fresh clone at `1e53902` (the session-105 close); `bun install` (525
packages); `.env` from `.env.example`; `db:push` + `db:seed` → 1 user / 0
candidates. Baseline: lint 0/0 · tsc ✓ · **1049/1049 unit** — the
session-105 close re-verified. The exported-`DATABASE_URL` guard armed for
the round (the sandbox's false workspace-root path).

## The opening read — the 70TH deploy, NON-VISUAL

`scripts/r106-login-probe.mjs`: the login census reads JS `index-C8D2zqWd`
+ CSS `index-CZZ4z0cl` — BOTH moved from the 69th state; the app-side census
(`scripts/r106-app-census.mjs`) reads `index-C-IrDy5f`/`index-BGNH4KkS` —
QUIET, the r42 baseline holds. The fresh login capture at the VERIFIED
1440×900 viewport: **BYTE-IDENTICAL to the standing `69aa4241…` baseline**
→ the 70th classified NON-VISUAL (login-side asset churn, the 69th pattern
repeating).

## The mobile-nav pair — PARITY at the 70th, the drawer watch

`scripts/r106-nav-pair.mjs` at 390×844 with the VERIFIED-VIEWPORT guard:
REF 28×28 `lucide-panel-left` hamburger + 288×844 fixed z-50 drawer (16
items, the Close button still `display:none` — the DOM artifact); the clone
same geometry + the a11y supersets (15 items, no Close button).
**VLM-verified pixel-identical drawer interiors.** The menu cycle: REF
lands `/training` + **STILL-OPEN** — the 69th's stay-open behavior persists
through its second deploy; the clone keeps the AUTO-CLOSED superset. The
REF-side-regression classification STANDS (the content stays covered; WATCH
the 71st). The REF-broken mobile set HOLDS (`/employeedetail` the empty
shell). No Tailwind v4 regression in the mobile band.

## The audit — the R105-C chain is inert on the real files

The session-105 changes re-read in full (`src/lib/cv-text.ts`, 1002 lines),
then taken to the real files — and the measurement found the flagship fix
never fires:

- **Both real xdvipdfmx builds** (fontspec v2.9h — the current CTAN build,
  71 pages; the dvipdfmx manual, 50 pages) carry **100% of their pages
  inside ObjStms, 100% with the `/Contents[36 0 R]` ARRAY form, and 100%
  with `/Resources` references that are themselves ObjStm-carried**
  (`scripts/r106-objstm-pages.mjs`). The scalar `/Contents` regex matches
  neither file's pages → `pageFonts` empty → every atom rides the
  file-order candidate chain.
- **The live damage** (`scripts/r106-homoglyph-forensics.mjs` +
  `scripts/r106-stream-atoms.mjs`): fontspec's title atom `<0027>` (the 'F'
  of "Font") is stolen by EBGaramond's map (obj 220 sorts before the true
  font obj 4) → "**Dont** selection for XƎLATEX"; `<0046>` ('e') stolen by
  TeXGyreAdventor — right only by luck. pdftotext reads "**Font** selection
  for XƎLATEX" — the member-by-member reference.
- **The cure verified before the fix** (`scripts/r106-title-resolve.mjs`):
  the title page's true /F1 (obj 4, TeXGyrePagella, 114-entry ToUnicode)
  covers ALL the title's CIDs including 0x27→"F" — the page map cures the
  theft class exactly.

## The queue, measured

- **R106-B — the dvipdfmx homoglyph class: NOT a defect.** The file contains
  ZERO `/Differences` arrays (the full-object census); the Armenian
  lookalikes (հ ս ո օ for h u n o, 12,922 document-wide) come from the
  font's OWN ToUnicode (`YSDERE+NewCM10-Regular-Identity-H` — exactly ONE
  candidate, no theft possible); **pdftotext reads the identical
  homoglyphs** ("Tհe Dvipdfmx սser maոսal"). The class is a dvipdfmx
  AUTHORING artifact faithfully extracted. The fontspec Ǝ is the same
  class — the official XƎTeX logo, pdftotext agrees. The r106 queue's
  /Differences-harvest hypothesis is REFUTED by measurement.
- **R106-C — the two-pass width table: not manifesting.** fontspec's 242
  fused 25+ runs are URLs, LaTeX commands, OTF file names — legitimate
  unbroken strings; dvipdfmx's 27 and IRS's 3 likewise; the word-integrity
  probes hit whole words. The 38-fused LuaTeX carrier is un-sourceable.
  Stays a WATCH.
- **R106-D — the Quartz 13th-writer hunt: not sourceable this round.** The
  ABC orszag.pdf URL now serves a Word 2007 file; the Hamilton paper was
  re-processed by PDFsharp; the DTU paper is Acrobat Distiller; SSRN/HAL
  are bot-walled. Stays a WATCH.

## The fix — R106-A, three legs

1. **The `contentsRefs` helper**: the ARRAY form `/Contents[4 0 R 5 0 R]`
   (bracket, every ref — a page's content may span streams; a shared stream
   last-wins) and the scalar form — shared by BOTH the raw region scan and
   the ObjStm page registration.
2. **The ObjStm `objFonts` feed**: non-page bodies carrying `/Font` pairs
   (the real fontspec /Resources objects) join the raw-pass resource
   collection.
3. **The `pendingRes` resolution moved after the stream walk**: the
   resources object may ride an ObjStm the walk meets LATER than the page's
   own ObjStm — the real fontspec ordering.

## The TDD round

**RED 2/2 as designed** — both specs failing with the identical chain-theft
signature ("qwzv xjkjqvwwz…" — the a-vocabulary through the wrong-font map;
the wrong letters are still alnums, so the 40-alnum guard held on both
sides of every mutation). Spec 1: the raw-pass array form with inline
fonts; spec 2: the real fontspec shape — an ObjStm-carried page with a
referenced ObjStm-carried /Resources, the resources object in a LATER
ObjStm, a decoy pair leading the raw file order. **GREEN 1051/1051** (1049
+ 2 net new).

**The mutation proof**: M1 (contentsRefs reverted to the scalar regex) →
exactly 2 RED; M2 (the ObjStm objFonts feed removed) → exactly 1 RED; M3
(the resolution moved back before the walk) → exactly 1 RED — the ordering
teeth. The restored file re-verified byte-clean + 56/56.

## The real-file ground truth

The corpus **IDENTICAL** (IRS f1040 5,871 · arXiv-2404.16710 67,744 — no
drift through the activation). **fontspec CURED member-for-member**: the
title now reads "The fontspec package / **Font selection** for XƎLATEX and
LuaLATEX", "Dont selection" GONE (101,529 → 101,515 alnums — the theft
cures), matching pdftotext on the fixed member. **dvipdfmx UNCHANGED**
(61,437 alnums, 12,922 Armenian chars — the own-map class identical through
the fix, matching pdftotext verbatim).

## The gates

lint 0/0 · tsc ✓ · 1051/1051 unit · build ✓ (env -u DATABASE_URL;
NODE_OPTIONS=--max-old-space-size=3072; the dev server killed by the port
holder first; 116/116 static pages) · E2E **558/558** (the standing net;
the final gate ALONE via the detached node-spawn protocol, after the
chromium-1248 reinstall cured the fresh-workspace 1ms-failure class; no new
E2E legs — the fix is unit-layer per the r104 documented split) + the
mobile-nav pair re-verified on the remediated build.

## The r107 queue

The two-pass per-letter width table (STILL the watch — no live target in
the sourceable corpus), the macOS Quartz 13th-writer hunt, the non-default
`Tz`/`Ts`, the LO negative-tracking class, the positive-gap-writer class,
the 71st-deploy watch, the REF stay-open drawer (third-deploy watch), the
standing watches (the recharts grid class, the dark-band theming, the v4
space-y inline-flow watch, the patch watch HOLD at ^16.4.2, the neo-crm
session-195+ layer when it lands).
