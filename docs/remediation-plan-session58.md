# Remediation plan — session 58 (parity round 57)

> The round-56 frontier said the affordance-stub family is censused and
> the clone now opens REF's real dialogs behind the toast stubs. This
> round's census took the fill dimension to the layer every button
> census SEES but never reads — **the CTA-fill recipe family** (the
> actual background fill of every primary action button, switch, and
> checkbox across the app, paired live). The clone had converged on ONE
> gradient recipe for nearly every primary action; REF maintains FIVE
> distinct fill recipes and the round mapped every consumer. All
> contracts live-measured this window (REF @1440×900 vs the seeded LOC
> :3200 standalone, `scripts/r58-fills-final.mjs` — the census instrument).

## The round's context

- Workspace re-cloned from `4648058` (the round-56 landing). Environment
  rebuilt (.env with `DATABASE_URL="file:../db/custom.db"` + AUTH_SECRET;
  the exported-DATABASE_URL shell trap unset before every db-touching
  command; db pushed + seeded inside the repo; playwright chromium
  installed). Repo path moved to `/home/z/eon-hr` — the standing scripts
  with hardcoded absolute paths patched to derive the repo from the
  script location (`verify-r49.mjs`; the `:3200` scripts were already
  path-free).
- Baseline gates ALL GREEN: lint 0/0 · tsc ✓ · **813/813 unit** ·
  build ✓ · **276/276 E2E** (1 session-40 input-spec flake, 8/8 green in
  isolation — the documented round-54 family).
- The skills audit (Phase 2): the session-57 delta re-audited fresh-eyed
  — TWO real internal findings (R58-22/R58-23 below, the delete-walk FK
  gaps live-verified with `scripts/r58-audit-delete-walk.mjs` on a
  throwaway db copy: `P2003`). Structural counts verified current (62
  pages / 57 API files / 48 models / 35 E2E spec files); scandihaven
  (the tech-stack model) unchanged (`d4789c3`).
- The deploy watch: **the login side deployed again (the 22nd)** — login
  JS `DEszsFDJ` → `DclSb8FG`, login CSS `D5oCh2kx` → `V5v1Fmok` (BOTH
  sides rolled this time; the app side `C-IrDy5f`/`BGNH4KkS` unchanged).
  Per protocol the login re-audit ran: **verify-r45 13/13 MATCH — a
  non-visual rebuild** (the first CSS-side roll was also non-visual).
  The confirmation ladder green after the REF session re-auth (the
  stale-session DIFF pattern, re-met once more): standing **5/5** +
  route sweep **12/12** + **verify-r49 13/13** + **verify-r45 13/13**.

## THE CTA-FILL CENSUS (the record)

`scripts/r58-fills-final.mjs` (+ `r58-census.mjs`, `r58-cta-map.mjs`,
`r58-cta-verify.mjs` — the instrument iterations), paired live at
1440×900 across all 50 app routes. The instrument reads every
`main button`'s computed fill (background-color + background-image) and
diffs the sets. **REF maintains five fill recipes; the clone renders its
blue gradient (`variant="default"`) at nearly every site:**

1. **The blue gradient CTA** — `bg-[linear-gradient(#2563EB→#4F46E5)]`,
   the pinned session-4 recipe. REF uses it on: employees Add Employee,
   attendance Import Attendance, payroll Add Payroll, loans New Loan
   Request (header), assets Add Asset (green variant), leavemanagement,
   allleaverequests, offboarding, assetmanagement, advancedanalytics —
   **the clone matches ALL of these** ✓ (the `to right` vs `90deg`
   serialization difference is the documented Chromium equivalence).
2. **The DARK solid** — `bg-primary text-primary-foreground shadow
   hover:bg-primary/90` = **#171717** (dark: #fafafa). REF uses it on:
   the wall's Post, the profile's four save buttons, the loans
   empty-state CTA, tenantsetup Continue, securitysettings Save, the
   employees view-toggle pair (at `size="sm"`), the hrassistant send
   (48×36, default size, icon-only), taskmanager's Kanban toggle, the
   staffrequests empty-state CTA, the recruitment empty-state CTA — the
   clone's `dark` variant already covers the last four ✓; **the first
   seven drifted to the gradient** (R58-1..7).
3. **The BLUE-600 solid** — `bg-blue-600 hover:bg-blue-700
   text-white` (#2563EB → #1D4ED8, both palette-pinned). REF uses it
   on: staffrequests New Request, documenttracker Add Document,
   workflowconfigpage New Workflow + Create First Workflow,
   recruitmentkanban Add Applicant, notificationpreferences Save
   Preferences — **all five drifted to the gradient** (R58-8..12).
4. **The INDIGO-600 solid** — `bg-indigo-600 hover:bg-indigo-700
   text-primary-foreground` (#4F46E5→#4338CA, pinned). REF: evaluations
   New Review (at `size="sm"`), performancemanagement Set New Goal —
   **both drifted** (R58-13..14).
5. **The TEAL-600 solid** — `bg-teal-600 hover:bg-teal-700 text-white`
   (#0D9488→#0F766E; teal-700 UNPINNED — added this round). REF:
   surveyanalytics Run AI Analysis — **drifted** (R58-15).

Plus three one-off gradient/recipe variants:

- **R58-16 — the REVERSED blue gradient**: REF's recruitment "Post New
  Job" is `from-indigo-600 to-blue-600` (#4F46E5→#2563EB — the endpoints
  SWAPPED vs the default CTA); the clone renders the standard direction.
- **R58-17 — the purple→pink gradient**: REF's expenses "New Expense"
  is `from-purple-600 to-pink-600` (#9333EA→#DB2777) — the clone's
  existing `pink` variant matches verbatim; the page just uses the
  default gradient.
- **R58-18 — the bg-none bug (P1)**: the assets "Add Asset" renders
  **NO fill at all** — `bg-none bg-gradient-to-r from-green-600
  to-emerald-600` authoring where Tailwind's `bg-none`
  (background-image: none) sorts AFTER the gradient utilities in v4's
  single layer and kills them: the button renders near-white text on a
  transparent background = effectively invisible. REF renders the green
  gradient. Fix: `variant="green"` (the sRGB-pinned trap-3 recipe).

And the form-control checked-fill family (the token-level root cause):

- **R58-19 — the Switch checked track**: REF's switches render
  `data-[state=checked]:bg-primary` = **#171717** (dark #fafafa); the
  clone's shared `switch.tsx` resolves `bg-primary` to
  `--color-primary: #1877F2` (the Facebook-blue mapping the theme
  deliberately keeps for the active-nav custom classes) — every checked
  switch renders the **Facebook blue** where REF renders the dark
  neutral. Live-verified on: profile Preferences (2), notification
  preferences (6), and (via checkbox) security settings.
- **R58-20 — the Checkbox checked fill**: same root cause, same fix in
  `checkbox.tsx` (securitysettings' four 16×16 checkboxes render blue on
  the clone, dark on REF).
- **R58-21 — the interviewassistant Analyze Interview width**: REF
  renders the green CTA `w-full` as a direct child of the `p-6
  space-y-4` card body (498px); the clone renders it auto-width (181px)
  nested inside the `space-y-2` notes div.

And the two internal-soundness findings (the Phase-2 audit, both
Verified live on a throwaway db copy):

- **R58-22 (α) — the profile DELETE relation walk misses three
  non-cascade relations** (a full FK map of `prisma/schema.prisma`
  vs the walk in `src/app/api/profile/route.ts`): `Asset.assignedToId`
  (optional, no cascade — detach to null), `Review.reviewerId`
  (required, no cascade — delete the reviewer's pending reviews),
  `SurveyResponse.employeeId` (required, no cascade — delete the
  responses). Any account whose employee row holds an assigned asset,
  a reviewer duty, or a survey response gets `P2003` and a 500 —
  the account cannot be deleted (the r57 E2E round-trip only exercised
  a fresh signup user, so the gaps never fired).
- **R58-23 (β) — the posts multipart path skips the content cap**: the
  JSON path enforces `PostInput`'s `max(2000)`; the multipart path
  validates the audience but not the content length — a multipart post
  can store arbitrarily long content.

## The fix plan (TDD)

**Unit pins first (RED)**: a new `describe` block in
`tests/unit/recipes.test.ts` — the R58 family pins: the five button
variants (the `blue`/`solidIndigo`/`teal` additions in `button.tsx` +
the `indigoBlue` reversed gradient + teal-700 palette pin), the seven
DARK-site conversions, the five BLUE-600 sites, the two INDIGO sites,
the teal site, the assets `variant="green"`, the expenses
`variant="pink"`, the switch/checkbox checked pins, the hrassistant
send geometry, the interviewassistant w-full + nesting, the
securitysettings Lock icon, and the profile-API walk additions + the
posts content cap (the API contract pins).

**GREEN** (source order):
1. `src/app/globals.css` — add `--color-teal-700: #0f766e`.
2. `src/components/ui/button.tsx` — add the three variants: `blue`
   (`text-primary-foreground shadow bg-blue-600 hover:bg-blue-700`),
   `solidIndigo` (`text-primary-foreground shadow bg-indigo-600
   hover:bg-indigo-700`), `teal` (`text-white shadow bg-teal-600
   hover:bg-teal-700`), and `indigoBlue` (the reversed gradient:
   `text-primary-foreground shadow
   bg-[linear-gradient(to_right,#4F46E5,#2563EB)]
   hover:bg-[linear-gradient(to_right,#4338CA,#1D4ED8)]`).
3. `src/components/ui/switch.tsx` + `checkbox.tsx` — pin the checked
   fill to `bg-[#171717] dark:bg-[#fafafa]` (leave the token for the
   nav's custom classes).
4. The seven DARK sites: companywall Post, profile ×4 saves, loans
   empty-state, tenantsetup Continue, securitysettings Save (+ the
   Lock icon swap), hrassistant send (48×36 default size), employees
   view-toggle pair (`variant="dark" size="sm"`).
5. The five BLUE sites + two INDIGO + one TEAL + the two gradient
   one-offs (recruitment reversed, expenses pink) + the assets green.
6. The interviewassistant w-full + un-nesting.
7. `src/app/api/profile/route.ts` — the three walk additions (asset
   detach, review delete, surveyResponse delete).
8. `src/app/api/posts/route.ts` — the multipart content cap
   (trim + 1..2000, the same contract as PostInput).

**E2E** (`tests/e2e/session58-cta-fills.spec.ts`): computed-truth pins
— the fills per route (DARK rgb(23,23,23) / BLUE600 rgb(37,99,235) /
INDIGO600 rgb(79,70,229) / TEAL600 rgb(13,148,136) / the two gradients'
endpoints), the switch + checkbox checked colors, the employees toggle
pair (fill + 32px height + 12px font), the hrassistant send geometry,
the interviewassistant full-width CTA, and the with-data deletion
round-trip (a user whose employee holds an asset + a review + a survey
response → DELETE → 200 → gone; the R58-22 regression guard).

**Census re-run** post-fix (the same instrument, all 50 routes) →
expect MATCH everywhere except the documented allowances (the attendance
fitting superset position shift; the careers data-dependent pair).

**Gates**: lint → typecheck → unit (+~30) → build → E2E (+~10) → the
confirmation ladder re-run → DB pristine check → screenshots → docs.

## Completion record (filled at landing)

- [x] Census instrument iterations: the bash `$(...)` loop mangling the
      nested template strings produced false MATCHes — every paired
      read must run through the node `evalOn` path (recorded in the
      instrument lessons).
- [x] The census re-run: **16/16 route fills MATCH** post-fix (12
      exact + 4 gradient-serialization equivalences — `to right` ≡
      `90deg`, documented allowances; the careers data-dependent pair
      excepted) + the toggle pair **byte-identical** after the order +
      gap re-measure (R58-24: LIST first @1301, GRID @1349, gap-2 — the
      session-14 "Grid first" order flipped in a deploy) + the
      switch/checkbox pairs MATCH on profile/securitysettings/
      notificationpreferences.
- [x] The E2E spec: `tests/e2e/session58-cta-fills.spec.ts` — 10
      chromium specs, all green on the final code (the fills per
      route, the toggle geometry + round-trip, the send geometry, the
      w-full CTA, the switch/checkbox colors, the multipart cap, the
      with-data deletion round-trip with all three P2003 rows
      planted).
- [x] Gates: lint 0/0 · tsc ✓ · **823/823 unit** (+10) · build ✓ ·
      **286/286 E2E** (+10, no flakes) · confirmation ladder re-run
      green (standing 5/5 + sweep 12/12).
- [x] DB pristine: 1/1/2 after the loading-probe sweep; 440
      screenshot files (+12, all hash-verified distinct).
