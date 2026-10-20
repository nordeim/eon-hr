# Remediation Plan — Session 67 / Parity Round 66: The Dark-Mode Geometry/Spacing Re-Census (the matrix-completion verification round)

**Census instruments**: `scripts/r67-dark-geometry-census.mjs` (the r65
population re-read in DARK — the computed padding 4 sides + border-radius of
every geometry-bearing element in main) + `scripts/r67-dark-margin-census.mjs`
(the r66 population re-read in DARK — the computed margin 4 sides +
rowGap/columnGap of every margin/gap-bearing element in main), all 49 routes,
paired live in DARK mode (localStorage `darkMode="true"`; html.dark verified
via the body background `rgb(10,10,10)` on both sides after navigation — the
boot script applies the class pre-paint on every load; `/login` is theme-inert
by contract).

**The round's motivation**: the computed-style matrix covered color × both
themes (r57–r63) and the light cells of geometry (r65) + spacing (r66). The
two DARK cells of the geometry/spacing axes — theme-invariant BY AUTHORING
(no `dark:padding-*`, `dark:rounded-*`, `dark:mt-*` members exist in the
corpus) — had never been computed-verified. A dark-only cascade divergence
(a `dark:` geometry member, a preflight difference under html.dark, an
inherited family resolving differently) would only be visible in this read.
**This is the first VERIFICATION-ONLY round in the project's history: zero
geometry/spacing fix families surfaced.**

## The census results (pre = post; no fixes on these axes)

- **Dark geometry**: **44/49 MATCH** — the 5 DIFFs are the STANDING
  documented allowances, byte-identical tuples: employees (the seeded grid
  cards), attendance (the admin superset + the restricted card),
  interviewassistant (the r48-C1 AI Analysis card), onboardingtemplates
  (the r36 `<a>` superset — identical `8,16,8,16|r:8` geometry, the tag is
  the superset), careers (REF's live demo data + the clone's hero superset).
- **Dark margin/gap**: **45/49 MATCH** — the 4 DIFFs are the standing
  allowances (employees, attendance, interviewassistant, careers),
  byte-identical tuples. onboardingtemplates MATCHED in dark margin (as it
  did in light after the r66 fixes).
- **The theme-invariance proof (the round's strongest evidence)**: the
  allowance routes re-read in LIGHT vs DARK produce **BYTE-IDENTICAL census
  tuples** on BOTH axes (the 5-route geometry re-read + the 4-route
  margin re-read, diffed file-vs-file: zero differences). The geometry and
  spacing axes are computed-verified theme-invariant end to end.

## The deploy watch — THE 30TH LOGIN DEPLOY (non-visual)

`scripts/r67-deploy-watch.mjs` (the post-29th finals armed): login JS
`q8Uif46n`→`DwY57mhH` + CSS `CiCfCTzx`→`BpSyi-cD`; the app side QUIET
(`C-IrDy5f`/`BGNH4KkS`). After a fresh re-auth of the shared REF session
(the stale-session lesson), the full confirmation ladder re-audited the
30th **NON-VISUAL**: standing 5/5 + sweep 12/12 + verify-r49 13/13 +
verify-r45 13/13. The watch finals are the post-30th hashes
(`DwY57mhH`/`BpSyi-cD` + the quiet app side).

## The one real defect found — the R37-C spec race (RETIRED)

The full-suite baseline ran 359/360: the session-38 R37-C spec ("the
workflow dialog's Add Level rides 113px") measured **109.06px** vs the
110–115 pin — but passed 3× isolated. Root cause (the r66 lesson-5 family,
a MEASURE-without-settle race this time): the dialog's
`data-[state=open]:zoom-in-95` animate-in means `toBeVisible()` passes at
MOUNT while the scale transition is still in flight — 113 × mid-transition
scale ≈ 109.06 exactly. The fix: the poll-until-stable read (two consecutive
equal widths = the transition settled), mirroring the r66 race-retirement
protocol. This is a SPEC-only change (no source change).

## The ToDo list (validated against the codebase)

1. **[DONE — spec-only]** R67 lesson-1: the R37-C settle-wait hardening in
   `tests/e2e/dialog-interiors.spec.ts` (poll-until-stable ×12 @120ms;
   green 3× isolated). No source change; no unit pin needed.
2. **E2E — `tests/e2e/session67-dark-geometry.spec.ts` (6 computed-truth
   pins)**: the theme-invariance contract, locked so a future dark: member
   or cascade change trips a gate:
   - **R67-A** the boot-script dark contract (localStorage armed → html.dark
     on the app pages; `/login` theme-inert);
   - **R67-B** the dark StatCard geometry (payroll's padded tile 12px row
     margin + the tileFixed 0px row — the R66-C pins re-read in dark);
   - **R67-C** the dark PageCanvas scroll band (-80px on /dashboard; absent
     on /settings);
   - **R67-D** the dark empty-state icon (the svg-authored 479px centered
     auto-margins + 16px mb on /payroll);
   - **R67-E** the dark employees grid (24px column gap + the alwaysRow
     0-gap/32px mb);
   - **R67-F** the dark tenantsetup circle (16px mb) + the ml-auto Continue.
3. **Unit pins**: none — zero source changes; the verification layer's
   regression protection is the E2E computed-truth block (the census +
   byte-identity evidence live in this plan + the session journals).
4. **Screenshots** (`scripts/r67-screenshots.mjs`): the 404–421 set — the
   dark dashboard + payroll + advancedanalytics + recruitment + tenantsetup
   + employees + surveyanalytics pairs (REF/LOC), the LIGHT mobile drawer
   pair @390×844 (the standing byte-stability check vs the r66 402 pair),
   the DARK mobile drawer pair (the new dark-surface evidence), + the
   inline mobile-menu functional open→navigate→close cycle (the standing
   user emphasis).
5. **Full gates**: lint 0/0 · tsc ✓ · 910/910 unit (unchanged — no source
   delta) · build ✓ · **E2E full suite** (the re-validated 360/360 with the
   hardened R37-C) · DB pristine (the loading-probe sweep per the r61
   protocol).
6. **Docs**: AGENTS session-67 layer + the r67 instrument lessons + the
   Commands counts, CLAUDE (the counts), README (the counts + the spec
   tail), eon-hr_SKILL.md 3.50.0 + §77 + the State line (the matrix
   COMPLETE), this plan's completion record, `docs/session_139.md` (the
   narrative) + `docs/session_140.md` (the raw log), the worklog;
   `.env.example` verified (only DATABASE_URL + AUTH_SECRET are read).

## The round's instrument lessons (carry-forward)

1. **The measure-without-settle race**: an animated surface (dialog
   zoom-in-95) passes `toBeVisible()` at mount while the transform is in
   flight — a width/height read taken then measures the animation, not the
   element (109.06 = 113 × 0.965). The poll-until-stable read (two
   consecutive equal values) is the settle contract for ANY geometry read
   on an animated surface.
2. **The theme re-census needs a NAVIGATION after the localStorage write**:
   the boot script applies html.dark pre-paint on LOAD — setting
   `darkMode="true"` does not toggle the CURRENT page (the Moon click
   handler does that). The census's route-opens all navigate, so the reads
   are correctly dark — but the sanity print that checks `html.dark`
   immediately after the set reads FALSE and is EXPECTED to; verify dark
   via the post-navigation body background (`rgb(10,10,10)`) instead.
3. **A verification round still needs the allowance byte-proof**: a census
   that returns all-allowance is weak evidence on its own (the r64
   zero-fix lesson); the byte-identity diff (the same routes re-read in
   LIGHT vs DARK, tuples compared file-vs-file) is the strong form — it
   proves theme-invariance per route, not just per axis.
4. **The per-batch DIFF dump overwrites by default**: the r62 mid-batch dump
   protocol saves each batch's DIFFs, but a re-run of a later batch
   OVERWRITES the file — re-run the DIFF routes as their own batch (or set
   R67_DUMP) before byte-diffing across reads.

---

## Completion record (session-67, executed 2026-10-21)

- **[1 — DONE, spec-only]** The R37-C settle-wait hardening shipped in
  `tests/e2e/dialog-interiors.spec.ts` (the poll-until-stable read ×12
  @120ms; green 2× isolated post-fix). The spec change retires the
  full-suite 109.06 transient with its mechanism recorded (the zoom-in-95
  mount race); the Add-Level pin keeps its 110–115 range.
- **[2 — DONE]** `tests/e2e/session67-dark-geometry.spec.ts` — all 6
  computed-truth pins GREEN on the first run (the theme-invariance
  contract locked: R67-A the boot-script dark contract incl. the /login
  theme-inert split, R67-B the dark StatCard padded/tileFixed twins,
  R67-C the dark scroll band, R67-D the dark svg-authored empty-state
  margins, R67-E the dark employees grid + alwaysRow, R67-F the dark
  tenantsetup circle + ml-auto).
- **[3 — N/A]** Zero unit pins — zero source changes (the verification
  round's regression protection is the E2E block).
- **[4 — DONE]** `scripts/r67-screenshots.mjs`: the 404–421 set (18
  files → 604 total): the dark dashboard/payroll/advancedanalytics/
  recruitment/tenantsetup/employees/surveyanalytics REF-LOC pairs, the
  LIGHT mobile drawer pair (418/419 — BYTE-MATCHES the r66 402 pair on
  both sides, the standing byte-stability check held; transitively the
  r65 366 pair — three-round stability), the DARK mobile drawer pair
  (420/421 — the new dark-surface evidence), + the inline mobile-menu
  functional cycle (open → nav links visible → the Training LMS link
  navigates to /training → Escape closes).
- **[5 — gates]** lint 0/0 · tsc ✓ · **910/910 unit** (unchanged) ·
  build ✓ (via `bun run build`) · **E2E full suite re-validated** ·
  the censuses: dark geometry 44/49 + dark margin/gap 45/49 (every DIFF
  a byte-identical standing allowance) · the byte-identity proofs: the
  5-route geometry + 4-route margin light-vs-dark re-reads diffed
  file-vs-file, zero differences · DB pristine.
- **[6 — docs]** AGENTS session-67 layer + the five r67 instrument
  lessons + the Commands counts (910/366), CLAUDE (the 1276-spec
  pyramid = 910+366), README (the counts + the session-67 spec tail),
  eon-hr_SKILL.md 3.50.0 + §77 + the State line (the matrix COMPLETE),
  this completion record, `docs/session_139.md` + `docs/session_140.md`,
  the worklog; `.env.example` verified (only DATABASE_URL +
  AUTH_SECRET are read).
- **The deploy record**: the 30th login deploy detected (login JS
  `q8Uif46n`→`DwY57mhH` + CSS `CiCfCTzx`→`BpSyi-cD`; the app side
  quiet) — re-audited NON-VISUAL via the full ladder after a fresh
  re-auth. The watch finals are the post-30th hashes.
- **The round's headline**: THE COMPUTED-STYLE MATRIX IS COMPLETE —
  color (fill/text/border) × light/dark, geometry (padding + radius) ×
  light/dark, spacing (margin + gap) × light/dark. Every axis of the
  clone's computed rendering has now been census-verified against the
  live reference in BOTH themes, and every standing DIFF is a
  documented allowance with byte-stable evidence. This is the first
  verification-only round in the project's history — the perfect
  outcome the sixty-plus remediation rounds were building toward.
