# Remediation Plan — Session 127 / Parity Round 126

Two materials, both measured end-to-end through the patched-proto
experiment (three iterations — the Tf-clear bug and the missing Tm setter
were caught and cured in-round by the regression probes) before any source
change: **the pen-continues join** (R127-A — the walk's standing `" "`
join between ADJACENT SHOW OPS is wrong for the same-text-object class: a
show op with no positioning op and no text-object/graphics change since
the previous show continues the pen exactly where the last glyph ended
(ISO 32000-1 §9.4.1), so the pieces are CONTIGUOUS — the matplotlib PTEX
figure class reads "di ﬀ erent" where pdftotext reads "diﬀerent", the
arXiv bibliography reads "( 2023" where pdftotext reads "(2023" — 111
measured inversions — and the ReportLab sentence/URL period class reads
"reportlab.com ." where pdftotext reads "reportlab.com.") and **the
test-hygiene genus transfer** (D-127a — the neo-crm s215 lessons: the
boundary-blind marker slice and the comment-blind assertion face, both of
which eon-hr's tokens.test.ts carries today).

## The opening read (the 91st-deploy watch)

| Leg | Result |
| --- | --- |
| Login asset census | JS `index-DyOb2xUE.js` HELD · CSS `index-Bt66wgTd.css` HELD (the r126 close values) — **NO 91st deploy** |
| App asset census | JS `index-C-IrDy5f.js` HELD · CSS `index-BGNH4KkS.css` HELD (the r42 baseline) |
| Login capture (1280×800) | **BYTE-IDENTICAL to the r126 pin** (md5 `e04112c8`, 167,497 B) |
| Dashboard capture (1280×800) | **BYTE-IDENTICAL to the r126 pin** (md5 `965b41b0`, 190,117 B) |
| Mobile-nav pair (390×844, the user's named focus) | The REF drawer **STILL-OPEN** after the Training LMS click (`{"w":"288px","left":0,"z":"50","opacity":"1"}`, URL → `/training`) — the 69th-deploy regression standing; the hamburger 28×28 `lucide-panel-left` intact; **no Tailwind v4 regression** |
| Warm-token census | All byte-stable: social button `rgb(15,14,14)`, or-chip `rgb(93,93,93)` @ 12px, h1 `rgb(15,23,42)` @ 30px, input border `rgb(226,232,240)` |
| neo-crm HEAD | `36aee3e` → `d38f6a2` — **2 commits, ZERO src changes** (s215 = the Tailwind-bullet semantic-prose census round — the THIRD consecutive test-census round; src/ byte-identical to the s212 ship `838db00`). The s215 test-hygiene lessons transferred as D-127a. The next-audit baseline `d38f6a2` |
| Advisory census | UNCHANGED — 11 vulnerabilities (8 moderate, 3 high), both the standing dev-toolchain classes (deepmerge-ts via prisma CLI; minimatch via typescript-eslint/eslint-config-next), zero runtime exposure |
| Patch watch | QUIET — `next@16.4.5` still latest |
| Corpus at HEAD | The 12-member ledger reproducing the r126 close exactly (arXiv at the r126 pin `75436914`, the other 11 IDENTICAL at their standing pins); the 16 family members EXACT; bx via the committed proto: arXiv 100.0% (21,503/21,503) · IRS 100.0% · ReportLab 100.0%; baseline gates **lint 0/0 · tsc ✓ · 1194/1194 unit** |

## MATERIAL 1 (R127-A) — the pen-continues join

**The anatomy** (the r127 queue's named item — the arXiv figure-region
line-form residuals — traced to its root): the matplotlib PTEX forms'
figure rows interleave TJ arrays with single-CID hex shows under a
mid-word font switch — `Tm /f-0-0 Tf [(... t)12(o cr)10(e)7(a)11(t)14(e
di)]TJ /f-0-1 Tf <0001>Tj /f-0-0 Tf [(er)10(ent si)11(z)...]TJ` — the ﬀ
ligature (a Type0/CID glyph, obj 440, /W CID 1 = 556) framed by two TJ
shows of the SAME text object with NO positioning op between them. The
walk's `push()` gives every not-moved boundary the standing `" "` join
("the standing join: adjacent shows separate" — the R100-A era), so the
row reads "di ﬀ erent" / "Use ﬁ rst" / "Pre ﬁ ll" where pdftotext reads
"diﬀerent" / "Use ﬁrst" / "Preﬁll".

**The fire-separation census** (the opSeq-instrumented proto — every
not-moved `" "` boundary classified by its intervening ops):
- **Class A — the pen continues** (a NEW show op, NO positioning op
  Td/TD/Tm/T*, NO text-object/graphics change BT/cm/q/Q, only
  Tf/Tw/Tz/nothing between the shows; the output actually emits the
  space): arXiv **261** (the bibliography "(" + "2023" class ×252 + the
  ﬀ/Tf class ×9) · ReportLab **1885** (the sentence/URL/code period
  class — 652 decisive) · Prawn **47** (the €/'/CJK font-switch glyph
  class) · IRS **12** — and **ZERO** on dvipdfmx/fontspec/QUARTZ/
  WeasyPrint and ALL FOUR Typst members.
- **Class B — a new text object** (BT in the intervening ops): the Typst
  every-word-its-own-q/cm/BT form (155 boundaries across the 4 members)
  — the standing `" "` IS the word separator there (the Tm origin is
  constant (0,0), the position rides the cm, the origin-to-origin delta
  reads 0, so `moved` stays false and the standing join fires).
- **The positioned-but-not-moved class** (a 0-delta Tm/Td in the ops —
  the sticky memory must hold): the IRS per-word-Tm title class
  ("Form"[T1_0] + "1040"[T1_1], both Tms at the same origin) and the
  R116-A-upgrade classes (the ReportLab code-block lines
  `T*;Q;Q;q;cm;BT;Tm;Tf` — the Tm reset eats the pending move, the
  standing `" "` feeds the assembly-time y-delta upgrade that produces
  the newlines; the arXiv table rows "Wikipedia Test" + "10" the same
  genus).

**The ground truth** (pdftotext's own reading at every Class A
boundary): 255 decisive junctions, **ALL JOIN** — zero reads a space.
The bibliography inversion is total: our output "( 2023" ×111 /
"2023 )" ×101 vs pdftotext "(2023" ×111 / "2023)." ×101. The word-window
verdict on the decisive set: arXiv 3 + IRS 1 + ReportLab 244 + Prawn 7
JOIN, 0 SPACE.

**The cure**: in `push()`, a not-moved boundary whose piece opens a NEW
show op (a different Tj/TJ match from the previous piece's — tracked by
a walk-level `showOpSeq`/`lastPushSeq` pair) and whose intervening ops
touched NOTHING but the text state (a sticky `nonTextTouched` flag: set
by Td/TD, T*, Tm, BT, cm, q, Q; NEVER cleared by the neutral
Tf/Tw/Tz; cleared only at the next push) joins with `""` — the pen
continues. The standing `" "` survives for the TJ-internal no-number
atoms (the same `showOpSeq` — the W3C dummy.pdf pin) and every boundary
whose ops touched the positioning/text-object/graphics state (the Typst
word separator, the IRS per-word-Tm titles, and the R116-A-upgrade
classes keep their `" "` so the assembly upgrades still fire).

**The two in-round patch bugs the regression probes caught** (the
experiment's three iterations):
1. **The Tf-clear bug** (iteration 2): the first patch let the Tf
   handler CLEAR the sticky flag — the ReportLab code-block class
   (`...BT;Tm;/F9 8 Tf;` — the Tf LAST) lost its standing `" "`, the
   R116-A upgrade starved, and the whole code block fused
   ("setTextOrigin(x,y)textobject.setTextTransform…"). The cure: the
   sticky semantics — Tf/Tw/Tz are NEUTRAL, only the positioning/
   text-object/graphics ops set the flag.
2. **The missing Tm setter** (iteration 3): the second patch omitted
   the Tm handler from the sticky setters — the IRS title class
   ("Form" + "1040", both Tms at the same origin) wrongly joined
   ("Form1040") where pdftotext reads the break. The cure: Tm joins
   the setters (the origin-to-origin delta rule may leave
   `moved === false`; the positioning memory must not).

**The measured cure** (the final patched proto): **4 members TOWARD —
arXiv word-stream 0.7082 → 0.7238 + line-form 0.1184 → 0.1470 (144
hunks, all pure space removals) · IRS 0.3692 → 0.4505 (12/12 pure) ·
ReportLab 0.9080 → 0.9543 + line-form 0.3930 → 0.5174 (804/816 pure,
the 12 residual also space removals around markup) · Prawn 0.8319 →
0.8330 (8/8 pure) — ZERO AWAY**; **8 members IDENTICAL** (dvipdfmx,
fontspec, QUARTZ, WeasyPrint, and all four Typst members — the Typst
word-separator pin and the fontspec Tm-positioned class held); alnums
EXACT on every member; **the 16 family members ALL EXACT**; the
regression probes all PASS (the ReportLab code-block newlines, the
arXiv table-row newlines, the IRS "Form 1040" space — PRESERVED) and
the cure targets all LAND (the ligature junctions JOINED, the
bibliography "(2023)." CURED).

**The test-suite fire map** (the full 1194-spec suite audited against
the cure): exactly ONE existing spec flips — the session-100 synthetic
guard "keeps the standing space join between adjacent shows with no
positioning between them" (its fixture `(Senior HR Manager)Tj (with)Tj
(payroll compliance…)Tj` is the Class A shape verbatim; its expectation
"Manager with" was conservative-guard born — no real-writer measurement
ever backed it; the real-writer evidence this round reads it contiguous
— the bibliography class exactly). The spec is REWRITTEN as the R127-A
pin (the same fixture, the corrected expectation, the census citations).
Every other standing-join reference rides a blocked class: the
TJ-internal guard (line 598 — the W3C dummy.pdf pin), the R116-A Typst
upgrade specs (the typstBlock BT+cm form), the R117-A column specs
(typstBlock/rlBlock BT forms), the XFA per-glyph guard (Td-driven
glyph-advance joins), and the R119-A overlap-band guards — all
born-green through the cure.

## MATERIAL 2 (D-127a) — the boundary-blind slice + the comment-blind face (the neo-crm s215 genus)

**The neo-crm s215 lessons** (both from its own birth defects): (1) a
doc section sliced by start/end markers goes VACUOUSLY GREEN when the
end marker's live form changes — `indexOf` returns −1, the slice
silently runs to EOF, and every assertion then matches anywhere in the
file; (2) an explanatory comment carrying a rule's literal text keeps a
raw-text assertion GREEN even when the rule itself is deleted.

**eon-hr's exposure — BOTH, directly** (the audit): 
`tests/unit/tokens.test.ts` slices `globals.css` by markers —
`css.slice(css.indexOf(":root"), css.indexOf(".dark {"))`,
`css.slice(css.indexOf(".dark {"), css.lastIndexOf("@theme inline"))`,
`css.slice(css.lastIndexOf("@theme inline"), css.indexOf("@layer
base"))` — a `.dark {` → `.dark{` formatting change (or an `@layer base`
rename) sends the slice to EOF and the root/dark/theme assertions go
vacuous; and every assertion reads the RAW css (a comment carrying a
rule literal — the file already carries 20+ inline value comments —
would mask a rule deletion).

**The cure** (the s215 forms verbatim, scoped surgical): a
`sliceBetween(text, startMarker, endMarker, label)` helper that THROWS
when either marker misses or precedes the start (the suite exits RED,
never vacuously green) + a `noComments()` stripped face for the
css-derived assertions. The recipes.test.ts / shell-recipes.test.ts
marker slices (15+ sites — the same genus, TSX-source faces) are
surveyed and noted for the r128 queue (the surgical boundary: this
round hardens the direct globals-derived face; the TSX slice census is
its own follow-up).

## The watch items (measured, deferred)

- **The Typst sub-em residual**: re-measured — resume **1/76** and
  resume2 **0/73** sub-em inter-piece gaps — UNCHANGED from the r126
  close (output-neutral; the watch continues).
- **The REF stay-open drawer**: standing through the 91st-deploy watch
  (no new deploy; the 69th's regression unbroken).
- **The neo-crm s216+ layer**: baseline `d38f6a2`; the watch remains
  "any src/ movement since `838db00`".
- **The recipes/shell-recipes marker-slice census**: the D-127a
  follow-up (the TSX-source faces).
- The standing watches: the LO Calc re-source; the advisory census; the
  next patch watch; the bun .env-absolutization watch (Leg A of the
  launch-verify probe); the parent-hygiene probe (D-126a).

## The ToDo list (the round as executed)

- [x] The opening read: the 91st-deploy watch (NO new deploy — all asset
      pins HELD; both desktop captures BYTE-IDENTICAL to the r126 pins;
      the mobile-nav drawer STILL-OPEN on the REF — the standing
      regression; no Tailwind v4 regression) · the audit legs (neo-crm
      `d38f6a2` zero-src — the s215 test-hygiene lessons transferred as
      D-127a; advisory unchanged; patch quiet)
- [x] The corpus verified at HEAD (the ledger reproducing the r126
      close; the 16 family members EXACT; bx 100.0% × 3; the baseline
      gates 1194/1194)
- [x] The hunt: the r127 queue's named pocket measured end-to-end (the
      arXiv figure-region residual traced to the standing-join root
      cause; the opSeq census — Class A 2205 / Class B 176 / positioned
      across the corpus; the ground truth 255 decisive JOIN / 0 SPACE;
      the bibliography inversion 111 + 101; the Typst sub-em band
      re-measured 1/76 + 0/73)
- [x] The patched-proto experiment (THREE iterations — the Tf-clear bug
      and the missing Tm setter caught by the regression probes and
      cured in-round): 4 members TOWARD (zero away) · 8 IDENTICAL ·
      alnums exact · 16 families EXACT · the regression probes PASS
- [x] This plan written BEFORE the source change (the r125 discipline)
- [x] The TDD round: the R127-A RED specs (the mid-word font-switch
      ligature join · the bibliography adjacent-show join · the ReportLab
      sentence-period join · the updated session-100 guard — RED 4/4
      demonstrated by source revert with the exact designed symptoms
      "di ﬀ erent" / "( 2023 ) ;" / "reportlab.com .") + the fire-separation
      guards (the Tm-positioned title class · the fresh-0-delta-Td class ·
      the R116-A upgrade-starvation class — born-green 3/3) → the cure in
      `src/lib/cv-text.ts` → the D-127a tokens.test.ts hardening →
      **GREEN 1200/1200** (1194 + 6; two fixture traps hit in-round: the
      40-alnum isMeaningful guard dropped the bibliography spec's output,
      and a 2-operand "Tm" is unmatched garbage — the full 6-operand form
      required)
- [x] The mutation matrix EXACT (`scripts/r127-mutations.py`): M1 [the
      cure line dropped] 4 (the three R127-A specs + the rewritten
      session-100 guard) · M2 [the Tm setter dropped] 1 (the title guard)
      · M3 [the BT setter dropped] 1 (the unpositioned-BT guard) · M4
      [the Td setter dropped] 0 — the structural redundancy documented
      (the only not-moved Td path is the fresh branch, which requires a
      BT; the setter retained as defense-in-depth) · M5a [the lastPushSeq
      update dropped] 2 (the W3C dummy.pdf pin + the R113-A reset leg)
      · M5b [the nonTextTouched clear dropped] 4 · M6 [the showOpSeq
      increment dropped] 4 · M7a [globals.css's END marker mutated, WITH
      the D-127a guard] the LOUD throw (rc 1) · M7b [the same mutation,
      guard reverted] the VACUOUS PASS (rc 0) — the trap demonstrated
- [x] The proto resync after every source change (the D-120a discipline)
      + the final-source drift ledger: ALL 12 members IDENTICAL at their
      r127 pins (arXiv `30da3b23` · IRS `18a4a823` · ReportLab `adc22376`
      · Prawn `c4c4f6f8` — the four cure members; the other 8 at their
      standing pins) · alnums exact everywhere · bx: arXiv 100.0%
      (21,503/21,503) · IRS 100.0% · ReportLab 100.0% (the cure is
      separator-only — the positions and widths untouched) · the 16
      family members ALL EXACT
- [x] The full gate chain: lint 0/0 · tsc ✓ · **1200/1200 unit** ·
      build ✓ · E2E **565/565** (the --list census; the 3-chunk
      foreground split 192+192+183 = 567 with the standing +2 run
      artifact, zero failures) · DB PRISTINE (1/1/0/3/2/0) · the live UI
      verify PASSED (the r104 protocol — the Typst resume2 probe:
      name-first, dateSplit ×2, zero U+FFFD, swept by the real id 200) ·
      the launch-verify probe Leg A PASS (the clean .env-only launch, no
      phantom parent DB) + Leg B LOUD (the sandbox-exported absolute URL
      — the server never comes up) · the parent-hygiene probe OK
- [x] The screenshots (docs/screenshots/) on the REMEDIATED build: the
      4 REF captures (login md5 `e04112c8` 167,497 B + dashboard md5
      `965b41b0` 190,117 B — both BYTE-IDENTICAL to the r126 pins; the
      mobile-nav pair) + the 4 clone captures (the mobile flow as a
      STANDALONE session — the viewport-at-session-start trap hit and
      cured in-round, the desktop-session mobile leg's stale a11y tree
      documented); all 8 verified non-blank; the pixel diffs vs the REF:
      **login 0.0350% (the standing level) · dashboard 1 pixel in
      1,024,000 · mobile-nav 1 pixel**; the training diff the documented
      auto-close superset (the clone's drawer fully unmounted, URL →
      /training); the REF drawer STILL-OPEN (the 69th-deploy regression
      through the 91st-deploy watch); no Tailwind v4 regression
- [ ] The docs layer (the AGENTS session-127 layer + the SKILL banner +
      §139 · the count lockstep · the session_301 narrative · the
      worklog round-126 entry with the r128 queue armed)
- [ ] Commit + push to main via the SSH wrapper [the round's final step]
