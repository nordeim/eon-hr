# Remediation Plan — Session 64 / Parity Round 63: The Light-Mode Border-Color Census

**Census instrument**: `scripts/r64-lightborder-census.mjs` — the computed
`border-color` of every visibly-bordered element in `main`, buttons included
(button borders were read only in dark at r61), all 49 routes, paired live in
LIGHT mode (html NOT .dark, `localStorage.darkMode="false"`), the deduped
(tag|color) set comparison. Three batches (17/17/15) with DIFF dumps saved to
`/tmp/r64-b{1,2,3}.log`. **Pre-fix: 44/49 MATCH, 5 DIFF.**

## The recorded gaps this round fills

1. **No border-color census ever ran in LIGHT mode** — the r61 census read
   DARK only; this is the LAST uncensured cell of the computed-color matrix
   (fill r57 light + r59 dark, text r60 dark + r62 light, border r61 dark
   + **r63 light**). The SKILL §73 frontier line's "both themes" claim was
   a slip — border-light had never run; corrected this round.
2. **The census set-comparison inversion risk** — same (tag|color) sets on
   different elements would MATCH; the element-level symmetric diff
   (`r64-probe-cmp.mjs`) plus two per-dimension extension probes close it.
3. **Two never-censused input-family dimensions** surfaced by the inversion
   check: the iconed-search-input LEFT PADDING (`r64-probe2.mjs`, all 49
   routes, both sides) and the placeholder TEXT values (`r64-probe3.mjs`,
   all 49 routes, both sides — r60/r63 read placeholder COLORS only).

## Census verdict — the border family is already at parity

All 5 border DIFFs decomposed to DOCUMENTED ALLOWANCES (element-level probes
`r64-probe.mjs`): employees (the seeded grid card + its "Full Time" badge —
with-data surfaces REF cannot render at the demo's zero state), attendance
(the "Today's Overview" + "Recent Records" admin superset cards — R61), the
interviewassistant AI Analysis card (the r48-C1 superset), onboardingtemplates
(the r36 404 Go-Home `<a>` — members byte-identical, tag superset), careers
(REF's live demo company buttons). **No border fixes required.**

## The real divergences (the probe findings — the fix families)

- **R64-A — the iconed-search-input left padding (4 routes)**: REF clears
  the `absolute left-3` search icon with `pl-10` (payroll — 40px) or `pl-9`
  (payrollmodule / documenttracker / assetmanagement — 36px,
  live-measured). The clone renders the same iconed wrapper WITHOUT the
  padding member — typed text starts at 12px and COLLIDES with the icon (a
  visible UX defect, not just parity drift). employees / chat /
  staffrequests / careers already carry their measured members (pl-10 /
  pl-10 / pl-9 / pl-12 — MATCH, no change). The r64 probe2 read all 49
  routes: these 4 are the complete set. Session-12's R11-H pin measured
  the payroll toolbar's outer geometry (862px / relative / flex-1) but
  never the interior padding member — a session-12 measurement gap,
  live-caught.
- **R64-B — the compliance search placeholder text**: REF's live input
  reads "Search employee..." (live-measured); the clone ships an authored
  "Search documents" (unpinned invention — the query filters document name
  AND employeeName). The aria-label (a clone a11y superset REF lacks)
  follows the REF semantics: "Search employee".
- **R64-C — the recruitmentkanban search placeholder text**: REF's live
  input reads "Search applicants..." (live-measured); the clone ships an
  authored "Search candidates, jobs or emails…". aria-label follows:
  "Search applicants".
- **R64-D — the interviewassistant notes textarea placeholder**: REF's live
  textarea reads "Enter your interview observations, candidate responses,
  and overall impressions..." (live-measured); the clone ships an authored
  example essay ("e.g. Led the redesign project…"). The R61-L pin held the
  SELECT's placeholder ("Select candidate") — the textarea's string was
  never measured.
- **R64-E — the tenantsetup wizard placeholders**: REF's live inputs read
  "Acme Corporation" (Company Name) and "admin@acme.com" (Owner Email) —
  live-measured; the clone ships "Your company name" / "owner@company.com"
  (unpinned inventions; the R31-C10 pin held the LABELS only).

## Fixes (TDD — RED first)

| ID | File(s) | Change |
|----|---------|--------|
| R64-A1 | `src/app/(app)/payroll/page.tsx` | the search `<Input>` gains `className="pl-10"` (REF 40px, live-measured) |
| R64-A2 | `src/app/(app)/payrollmodule/page.tsx` | the search `<Input>` gains `className="pl-9"` (REF 36px) |
| R64-A3 | `src/app/(app)/documenttracker/page.tsx` | the search `<Input>` gains `className="pl-9"` (REF 36px) |
| R64-A4 | `src/app/(app)/assetmanagement/page.tsx` | the search `<Input>` gains `className="pl-9"` (REF 36px) |
| R64-B | `src/app/(app)/compliancedashboard/page.tsx` | `placeholder="Search employee..."` + `aria-label="Search employee"` (the authored "documents" string retired) |
| R64-C | `src/app/(app)/recruitmentkanban/page.tsx` | `placeholder="Search applicants..."` + `aria-label="Search applicants"` |
| R64-D | `src/app/(app)/interviewassistant/page.tsx` | the textarea `placeholder="Enter your interview observations, candidate responses, and overall impressions..."` |
| R64-E | `src/app/(app)/tenantsetup/page.tsx` | `placeholder="Acme Corporation"` + `placeholder="admin@acme.com"` |

## Legacy pins

None amended this round — no existing pin holds any retired string (the
Acme-string hits in the careers specs are unrelated test-data "Acme
Rockets"; verified). The recipe comments written with the fixes must NOT
contain the retired literals (the r63 pin-defect lesson (a)).

## Documented allowances (the census DIFFs — re-confirmed this round)

- **employees** — the seeded grid card + the "Full Time" type badge
  (with-data superset surfaces, REF-unmeasurable at zero state).
- **attendance** — the "Today's Overview" + "Recent Records" admin
  superset cards (R61-documented; the census user is admin).
- **interviewassistant** — the r48-C1 AI Analysis superset card.
- **onboardingtemplates** — the r36 404 Go-Home `<a>` superset (the
  class members are byte-identical; only the tag differs).
- **careers** — REF's live demo company/job buttons (REF data state).
- **Authorship splits (computed-equal, no action)**: REF's inputs carry
  `placeholder:text-muted-foreground` vs the clone's R63-A literal pair,
  and REF's `focus-visible:ring` member ordering — the documented literal-
  pair strategy; the census matched every computed dimension.

## Verification plan

1. TDD RED: the R64 describe block in `tests/unit/recipes.test.ts`
   (~5 pins) — RED before the fixes; retirement assertions scoped to the
   measured page source.
2. GREEN: apply the 8 source changes; unit suite green (880 + 5).
3. E2E: `tests/e2e/session64-light-border.spec.ts` — computed truth: the
   4 iconed paddings (40px/36px ×3, `evaluate` paddingLeft), the 4
   placeholder-text surfaces (placeholder attribute), and the round's
   border-census truth pin (the payroll search input's computed
   border-color: light rgb(229,229,229) / dark rgb(38,38,38) — the
   border-input token pair, setDark AFTER goto).
4. Post-fix census re-run (3 batches) — projection: **49/49 possible on
   the border dimension minus the 5 allowance routes = 44/49 unchanged**
   (no border fixes — the census stands); the two extension probes
   re-run: the padding probe 49/49 iconed-set parity, the placeholder-text
   probe 49/49.
5. Full gates: lint 0/0 · tsc ✓ · unit · build ✓ (via `bun run build` —
   the static-copy trap) · E2E full suite.
6. Screenshots (the dev server running the remediated codebase) under
   `docs/screenshots/` (the 326+ pair set: the 4 padding fixes + the
   placeholder-text fixes, paired).

## Post-fix projection

Border census 44/49 (unchanged — all 5 DIFFs are allowances). Padding
probe: 9/9 iconed surfaces parity (was 5/9). Placeholder-text census:
49/49 (was 45/49).

---

## Completion record (filled post-execution)

- **The border census stands at 44/49 pre = 44/49 post, exactly as
  projected** — zero border fixes; the post-fix DIFF sets are
  byte-identical to the pre-fix dumps (the same five allowance
  routes: employees, attendance, interviewassistant,
  onboardingtemplates, careers). The computed-color matrix is now
  complete: fill (light r57-58 + dark r59), text (dark r60 + light
  r62), border (dark r61 + light r63).
- **All 8 source changes applied as planned** (R64-A1..A4 the padding
  members, R64-B..E the placeholder/label verbatim strings). No plan
  corrections were needed during execution — every fix site matched
  the plan's file/line validation.
- **Post-fix probes**: the padding probe reads 9/9 iconed surfaces at
  parity (payroll 40px; payrollmodule / documenttracker /
  assetmanagement 36px; employees / chat / staffrequests /
  recruitmentkanban / careers all match); the placeholder-text census
  reads **49/49 routes MATCH** (was 45/49).
- **Gates**: lint 0/0 · tsc ✓ · **885/885 unit** (+5, the R64 block
  RED-first) · build ✓ (via `bun run build`) · **339/339 E2E** (+6 in
  `tests/e2e/session64-light-border.spec.ts` — zero flakes; both
  documented transients stayed quiet this run) · DB pristine.
- **Screenshots**: the 326–343 pair set (18 files, hash-verified
  distinct — the four typed-text padding pairs, the four
  placeholder-text pairs, the mobile drawer pair @390×844 as the
  standing mobile-menu check evidence; fresh "ref64"/"loc64"
  agent-browser sessions per the r63 stale-viewport lesson). 520
  screenshot files total.
- **Deploy watch**: both sides quiet (the post-26th finals JS
  `D3ArZVPB` / CSS `OJK0Y98H` held; no 27th deploy).
- **Docs**: AGENTS session-64 layer + the r64 instrument lessons (5)
  + the Commands counts (885/339), CLAUDE (the 1224-spec pyramid =
  885 + 339, 42 E2E spec files), the README spec tail + counts,
  eon-hr_SKILL.md 3.47.0 + §74 + the §73 frontier-line correction
  (the "both themes" slip), docs/session_131.md (the narrative), this
  completion record, the worklog; `.env.example` verified (only
  DATABASE_URL + AUTH_SECRET are read).
