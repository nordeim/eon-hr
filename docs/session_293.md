The workspace continuing (the /tmp corpus SURVIVED the recycle — all 7
pins re-verified EXACT at HEAD, the 16 family members regenerated ALL
EXACT, the baseline gates reproducing the documented session-123 close
exactly: lint 0/0 · tsc ✓ · 1174/1174 unit). The round is **Session 124 /
Parity Round 123** with the r124 queue armed. The opening read ran
through a REF-watch subagent (the login census + the app-side assets +
the dashboard pair + the mobile-nav pair) while the standalone build
booted on :3200.

**The 88th-deploy watch: RENDER-STABLE — and the round's first trap
caught.** The login JS churned again (`CCUlq8S3` → `6xnUqbWf`, the CSS
held) and the subagent flagged a "social button border changed"
computed-style delta — but the REF login capture came back
**BYTE-IDENTICAL** to the r123 capture (md5 `e04112c8`, the dashboard
likewise `965b41b0`): a byte-identical render cannot change a border. The
flag was a wrapper-vs-button measurement artifact (the subagent's eval
read the `[data-ds]` WRAPPER's computed border; the standing protocol
measures the BUTTON). The same artifact class hit my own drawer census —
`cand[0]` matched the hidden `display:none` desktop sidebar (256px, z:10)
where the true mobile drawer is 288px z:50; the visibility-filtered
re-census read the standing state. The mobile-nav pair (the user's named
focus): **PARITY** — the REF stay-open regression through its NINETEENTH
deploy, the clone auto-close superset holding (the drawer fully
unmounted after the `/training` navigation), no Tailwind v4 regression.

The audit legs: the neo-crm HEAD moved `e21269a` → `1b093de` but
DOCS-ONLY (the session_445 transcript of the already-studied s211 round
— no s212+ layer due); the advisory census unchanged; the patch watch
quiet (16.4.5 still latest).

## The hunt — the r124 queue's named blind pockets, measured end-to-end

The bx-coverage census confirmed the queue's numbers exactly (IRS 94.7%
· arXiv 97.3% · ReportLab 95.6%, every other member 100%). An
instrumented proto copy (a blindness-cause logger patched into the
widthFor failure sites) decoded the three pockets' anatomies:

- **ReportLab (103 root sites → 546 blind pieces, all `no-table`)**: the
  parts' pageMap carries ONLY `FormXob.<32-hex>` keys. The decoded page
  form: `/Resources << /Font 1 0 R /XObject << /FormXob.… N 0 R >> >>` —
  the `/Font` VALUE itself an indirect ref (object 1 = the shared pure
  pair dict `/F1 2 0 R … /F21+0 387 0 R`, all 135 pages referencing it,
  zero inline `/Font` dicts in the file). The page scan's F-pattern
  collects the XObject entry FIRST — `FormXob.<hex>` **starts with F** —
  so the false pair makes `fonts.size` truthy and the R107-B shape-(a)
  else-if chain never queues the `pendingFontRef` resolution.
- **arXiv (453 root sites, all `code-uncovered`)**: the F5/F6
  descendants carry `/DW 0 /W [ 0 92 600.098 ]` — a 3-token array the
  parser reads as the pair `{0: 92}` with the 600.098
  dangling-discarded (CourierNew is monospaced; the R121-A range-triple
  intent is CIDs 0-92 at 600.098).
- **IRS (108 fontless pieces)**: text-shows with no Tf in scope — the
  ZaDb appearance-stream class, undiagnosed this round (the r125 queue).

The patched-proto experiments measured both cures before any source
change: **R124-A** (the fontRef always-queue + the replace semantics at
both scan sites) took ReportLab to **100.0% bx coverage** with the 6
other members IDENTICAL and the 16 families EXACT — the word-stream
identical, the raw line-axis **TOWARD** (+0.0015: the page-number
columns read cell-per-line `00\n01\n02` where the HEAD read them run
together, the two cover headers split — pdftotext's own forms). **R124-B**
(the odd-length pair-invalidity: `pairsValid` initializes to
`nums.length % 2 === 0`) took arXiv to **99.2% bx** with the OUTPUT
IDENTICAL on every member — a zero-drift un-blinding in the R120
width-blind-elimination class. The fire-separation censuses: the
indirect `/Font` form rides ReportLab ALONE; the odd-3n `/W` re-read
touches six members without moving a byte.

## The TDD round and the gates

RED 2/2 (the indirect-/Font tracked column split · the odd-length /W
tracked split) + 3 born-green guards (the no-/Font fire-separation · the
inline-/Font standing form · the r121 c-c-w pin) → the cures in
`src/lib/cv-text.ts` → **GREEN 1179/1179** (1174 + 5; the first
full-suite run's exit-1 was the proto sync arm catching the stale proto
— resynced and green). **The mutation matrix exact**
(`scripts/r124-mutations.py`): M1 [the raw-site fontRef queue re-gated]
1 · M2 [the replace semantics weakened] 1 · M3 [the odd-length
invalidity dropped] 1 · M4 [the range expansion dropped] 2 (the r124
spec + the r121 range-triple spec — the shared load-bearing arm) · M5
[the oddness inverted] 1.

The drift ledger on the final source: 6 IDENTICAL + ReportLab TOWARD
(alnums exact) · the 16 family members ALL EXACT. The gates: lint 0/0 ·
tsc ✓ · 1179/1179 unit · build ✓ · E2E **565/565** (the 3-chunk
foreground split 200+187+180; one chunk-3 flake — the R93-E WhatsApp
dialog timing under chunk load — passed clean on both the isolated
re-run and the chunk re-run) · DB pristine. The live UI verify (the
r104 protocol): the Typst resume2 probe through the recruitment
AI-CV-Upload tab — name-first, dateSplit TRUE ×2 in the STORED cvText,
zero U+FFFD — swept by the REAL id, the DB PRISTINE (1/1/0/3/2/0). The
4 r124 screenshots captured on the REMEDIATED build (the login and
dashboard pairs byte-identical to the r123 captures — the cures are
extraction-engine-only; the mobile-nav pair + the training cycle with
the auto-close superset verified).

**The docs layer**: the plan (docs/remediation-plan-session124.md) ·
this narrative · the AGENTS session-124 layer · the SKILL v4.11.0 §136 ·
the CLAUDE/README/AGENTS count lockstep (1179 + 565 = 1744) · the
worklog round-123 entry with the r125 queue armed.

The r125 queue: the arXiv residual pocket (0.8% — the Font2 null-glyph
class at CID 1 under the Calibri array's zero-width entry, the f-0-0
class, and the mixed-form `/W` range arms — the `c [w…] cfirst clast w`
shape), the IRS fontless pocket (the ZaDb appearance-stream class), the
Typst sub-em residuals (output-neutral today, a precision hunt), and the
standing watches (the REF stay-open drawer through its 20th+ deploy; the
neo-crm s212+ layer at the `1b093de` baseline; the LO Calc re-source;
the advisory census; the next patch watch).
