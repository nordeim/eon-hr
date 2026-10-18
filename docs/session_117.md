# Session 117 (2026-10-19) — parity round 57: the CTA-fill recipe family

> The round-56 frontier said the affordance-stub family is censused
> and closed. This round's census took the fill dimension to the
> layer every button census SEES but never reads — **the CTA-fill
> recipe family** (the computed background fill of every primary
> action button, switch, and checkbox across all 50 app routes,
> paired live). The clone had converged on ONE blue gradient for
> nearly every primary action; REF maintains **five distinct fill
> recipes** (the blue gradient CTA, the DARK solid, the BLUE-600
> solid, the INDIGO-600 solid, the TEAL-600 solid) plus two one-off
> gradients. Pre-fix: **12 fill-drift sites + 1 P1 invisible button
> + the form-control token mis-mapping**. Post-fix census: **16/16
> route fills MATCH** (12 exact + 4 gradient-serialization
> equivalences) with the toggle pair byte-exact.

## What the round delivered

- **The deploy watch: the login side deployed again (the 22nd)** —
  login JS `DEszsFDJ` → `DclSb8FG` AND login CSS `D5oCh2kx` →
  `V5v1Fmok` (both sides rolled this time; the app side
  `C-IrDy5f`/`BGNH4KkS` unchanged). Per protocol the login re-audit
  ran: **verify-r45 13/13 MATCH — a non-visual rebuild** (the first
  CSS-side roll was also non-visual). The confirmation ladder green
  after the REF session re-auth (the stale-session DIFF pattern,
  met once more at the standing audits): standing **5/5** + route
  sweep **12/12** + **verify-r49 13/13** + **verify-r45 13/13**.
- **The census instrument**: `scripts/r58-fills-final.mjs` (+ the
  `r58-census.mjs` / `r58-cta-map.mjs` / `r58-cta-verify.mjs`
  iterations) — every `main button`'s computed fill
  (background-color + background-image) read paired across all 50
  routes, with the REF recipe taxonomy mapped per site.
- **The DARK-solid drifts closed (R58-1..7)** — REF's `bg-primary`
  #171717 recipe (hover /90; dark-mode #fafafa) restored at: the
  wall's Post, the profile's four save buttons (Save Changes /
  Save Accounts / Save Preferences / Update Password), the loans
  empty-state CTA (joining its four dark siblings — the documented
  session-6 recipe), tenantsetup's Continue, securitysettings' Save
  (with REF's LOCK glyph replacing the invented ShieldCheck),
  the hrassistant send (REF's 48×36 default-size icon-only — the
  clone rendered a 48×48 gradient square), and the employees
  view-toggle pair (the dark+sm recipe: `h-8 rounded-md px-3
  text-xs`).
- **The BLUE-600 solid drifts closed (R58-8..12)** — REF's
  `bg-blue-600 hover:bg-blue-700` (#2563EB→#1D4ED8, both
  palette-pinned) at: staffrequests' New Request,
  documenttracker's Add Document, workflowconfigpage's New
  Workflow + Create First Workflow (the inline `bg-blue-600`
  className hack — which the gradient default PAINTED OVER:
  background-image wins over background-color in the same button —
  retired for the variant), recruitmentkanban's Add Applicant, and
  notificationpreferences' Save Preferences.
- **The INDIGO-600 and TEAL-600 solids (R58-13..15)** — REF's
  `bg-indigo-600` at evaluations' New Review (at size sm, 125×32)
  and performancemanagement's Set New Goal; REF's `bg-teal-600` at
  surveyanalytics' Run AI Analysis (teal-700 UNPINNED — added to
  the `@theme` pins).
- **The gradient one-offs (R58-16..18)** — REF's REVERSED
  indigo→blue gradient on recruitment's Post New Job
  (from-indigo-600 to-blue-600 — the endpoints swapped vs the
  default CTA; a new `indigoBlue` variant), REF's purple→pink
  gradient on expenses' New Expense (the existing `pink` variant,
  verbatim), and **the P1 fix**: the assets' Add Asset — the old
  authoring (`bg-none` + v3-style gradient utilities) rendered NO
  fill at all in the v4 cascade (background-image: none sorts after
  the gradient utilities) — near-white text on a transparent
  button, effectively invisible. Now `variant="green"` (the
  sRGB-pinned trap-3 recipe).
- **The form-control checked-fill family (R58-19..20)** — the root
  cause: the clone's `--color-primary` deliberately carries the
  Facebook blue (#1877F2 — for the active-nav custom classes), but
  the shared Switch and Checkbox resolve `data-[state=checked]:
  bg-primary` against it — every checked switch/checkbox rendered
  the Facebook blue where REF renders the dark neutral #171717
  (verified live on: the profile Preferences pair, the six
  notificationpreferences switches, the four securitysettings
  checkboxes). Both components now pin the literal values
  (#171717, dark #fafafa) — the token stays for the nav.
- **The toggle-order + gap re-measure (R58-24)** — the employees
  view-toggle pair re-measured live: REF renders **LIST FIRST**
  (x=1301), GRID second (x=1349), with `flex gap-2` (8px) — the
  session-14 "Grid first" order flipped in one of the 22 deploys
  since (and the clone's gap-1 measured 4px). The clone flipped to
  the live truth: post-fix the pair reads **byte-identical both
  sides** (list@1301 dark 40 / grid@1349 white 42).
- **The interviewassistant CTA (R58-21)** — REF's Analyze
  Interview is `w-full` as a direct child of the `p-6 space-y-4`
  card body (498px at 1440); the clone rendered it auto-width
  (181px) nested inside the notes' `space-y-2` div. Fixed to the
  direct-child w-full recipe.
- **The profile DELETE relation walk (R58-22, the Phase-2 audit
  finding — Verified)**: a full FK map of `prisma/schema.prisma`
  against the walk found **three missing non-cascade relations**:
  `Asset.assignedToId` (optional — detach), `Review.reviewerId`
  (required — the reviewer's pending reviews go), and
  `SurveyResponse.employeeId` (required — the responses go). Any
  account whose employee held an assigned asset, a reviewer duty,
  or a survey response got **P2003** and a 500 — the account could
  not be deleted (the r57 round-trip only exercised a fresh signup
  user, so the gaps never fired). The walk clears all three now;
  the E2E regression guard plants all three rows on a fresh user
  and deletes it cleanly.
- **The posts multipart cap (R58-23, the second audit finding)**:
  the JSON path enforced `PostInput`'s content `max(2000)` but the
  multipart path did not — a multipart post could store arbitrarily
  long content. The cap now guards both paths.

## The instrument lessons (transferable)

1. **A bash `$(...)` command substitution mangles nested template
   strings** — the census verification loop produced a row of
   false MATCHes (both sides read as empty objects) before the
   reads moved into the node `evalOn` path. Never wrap the
   agent-browser eval one-liners in bash substitution.
2. **Hover states contaminate computed-color reads** — the census
   toggle reads after an agent-browser click read
   `rgba(23,23,23,0.9)` (the parked mouse held the `:hover`
   state), and playwright's click parks the mouse the same way
   (Chromium serializes the `/90` color-mix as `lab()`/`oklab()`,
   not `rgb()`). Move the mouse away before at-rest reads; the
   E2E pins do `page.mouse.move(5, 5)`.
3. **The census reader's fill taxonomy must include the solids** —
   the first fill census only matched dark/blue-600/gradient and
   MISSED REF's indigo-600 and teal-600 solid CTAs entirely (they
   surfaced only when the reader took every non-white fill).
   Classify by "any non-plain fill", not by the expected set.
4. **The serialization equivalence is not a drift** — REF's
   gradients serialize `to right` where the clone's
   arbitrary-value gradients serialize `90deg` (Chromium's
   equivalent forms of the same direction); the rendered colors
   are identical. The census treats them as documented-allowance
   MATCHes.
5. **JSX attribute expressions take plain comments, not brace
   comments** — `{/* … */}` inside `actions={…}` is a parse error
   (it parses as an object literal); the pattern for prop-value
   comments is `/* … */` after the opening brace. (Two edits
   needed re-fixing mid-round.)

## Gates

lint 0/0 · tsc ✓ · **823/823 unit** (+10, RED-first) · build ✓ ·
**286/276+10 E2E** (+10, no flakes) · post-fix census **16/16
fills MATCH** (12 exact + 4 serialization equivalences; the toggle
pair byte-exact after the order+gap re-measure) · confirmation
ladder re-run green (standing 5/5 + sweep 12/12) · DB pristine
(1 user / 1 employee / 2 balances — the loading-probe user swept)
· **440 screenshot files** (+12: the 259-263 pairs + the 264 LOC
superset evidence pair, all hash-verified distinct).

## The frontier after this round

The CTA-fill recipe family is censused and closed: REF's five fill
recipes are all carried (the three new Button variants — blue,
solidIndigo, teal, plus indigoBlue — and the site conversions),
the form-control checked fills render the dark neutral, and the
P1 invisible button is fixed. Open items: the Next.js 16.4.0
history bug (the upgrade watch — the one recorded functional
divergence whose fix lives upstream), the login build stays under
ACTIVE development (the 22nd deploy rolled both JS and CSS this
window — the watch stays armed), the remaining with-data superset
surfaces stay REF-unmeasurable at the shared demo's zero state,
and the byte-parity backlog remains documented-allowance
territory.
