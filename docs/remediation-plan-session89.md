# Remediation Plan — Session 89 / Parity Round 88

**The round's frontier:** the first cross-side DARK/RTL MOBILE-BAND pass (390×844) —
the r88 close-out's named frontier ("the dark/RTL mobile bands — never
cross-compared") — plus the standing user emphasis (the mobile-menu cycle) and
the carried queue (tenantsetup title, companywall composer — both verified
ALREADY CLOSED by the parallel round's published fixes).

**The instruments (this round):** `r89-theme-mobile-capture.mjs` (the DARK/RTL
mobile-band capture, parameterized, resume-capable, the experiment-state probe
included) · `r89-theme-mobile-diff.py` (the band diff, the same 48px-cell
classification as r88) · `r89-cluster-locate.py` (the crop composites) ·
`r89-dark-triage.mjs` (the text-digest triage) · `r89-tickfont-probe.mjs` (the
chart tick-font family probe).

## The harvest

**THE DARK MOBILE-BAND READ: 26 IDENTICAL / 13 MINOR-AA / 22 STRUCTURAL.**
The base dark palettes, headers, bottom navs, and cards render
pixel-identical on 26 of 61 routes (max delta 2) — the session-83 dark-mode
architecture holds. The triage decomposed the 22 structural routes into:

- **4 REF-BROKEN routes** (see Standing Findings) — the diff is the REF's
  own render failure; the LOC's full render is the correct superset.
- **10 data-driven / role-scoped classes** — careers (the live job board +
  the emptied tenant), surveys (data), attendance (the role-restricted
  state), employees (the REF's emptied employee list), evaluations /
  payrollengine / allleaverequests / advancedanalytics / analytics (one-card
  data deltas), recruitmentkanban / compliancedashboard / settings (AA/data).
- **8 clone-authored defect candidates** — five confirmed members below
  (R89-A..E), the rest disproven by DOM probes (the VLM misreads: profile
  pill/tab identical, surveys cards identical, careers search identical).

## The defects (all TDD-fixed)

- **R89-A the attendancedashboard chart tick-font inversion + the mobile
  Export-button off-canvas chain.** The REF renders the DailyAttendanceTrend
  XAxis ticks at **11px** (live-verified both themes, 3× reload-stable) while
  the LOC renders the INHERITED 16px page font — the r88-B2 comment's claim
  ("the REF's computed tick style" = 16px inherited) was a measurement error
  in that parallel round; the 11px pin it removed was correct. The 16px ticks
  widen the chart's internal min-content by 31px (493 vs the REF's 462), the
  page min-content follows (575 vs 544), and the actions row's wrap decision
  flips: the REF's Export Report button wraps to a visible row (x=16, y=217)
  while the LOC's stays pushed OFF-CANVAS (x=376 at the 390px viewport — a
  functional mobile defect: the button unreachable at scroll-x=0). ONE root
  cause, THREE symptoms (the visible 16px ticks, the 31px page-min delta,
  the off-canvas button). THE FIX: restore `tick={{ fontSize: 11 }}` on the
  XAxis + adopt the REF's authored card-body wrapper
  (`p-6 pt-0 > div.overflow-x-auto > div.w-full.text-sm > chart`).
- **R89-B the analyticsdashboard tick-font inversion (the mirror image).**
  The same family, inverted: the REF renders ALL ticks on that page at the
  inherited **16px** while the LOC pins `tick={{ fontSize: 11 }}` on its
  three charts (a stale pin from an earlier measurement). THE FIX: remove
  the three pins (the inherited 16px is the REF's form).
- **R89-C the requestsettings approver-email input type.** The REF authors
  the "Approver email" field as `type="text"`; the LOC renders
  `type="email"` (a semantic improvement the REF does not carry — and a
  mobile-keyboard/validation behavioral difference). THE FIX: `type="text"`
  per the REF's authored form.
- **R89-D the hrassistantchat grid height member.** The REF's grid rides
  `grid lg:grid-cols-4 gap-6 h-[calc(100vh-250px)]` — the fixed height
  applies at ALL widths (the mobile grid renders 594px tall, the
  conversation card positioned lower). The LOC gates the height behind
  `lg:` (`lg:h-[calc(100vh-250px)]`), rendering the natural 329px at mobile
  — a 265px structural divergence. THE FIX: the unconditional height + the
  REF's exact class order.
- **R89-E the profile kicker placement (the 32px mobile offset).** The REF's
  profile tree hoists the mobile kicker OUT of the content column
  (`p-4 root > [kicker, max-w-5xl > [hero, cards…]]`); the LOC renders it
  INSIDE `max-w-5xl space-y-8` — the kicker becomes the column's first child
  and the space-y-8 adds a 32px gap below it, offsetting the whole page
  (avatar y 351 vs 383). Every other kicker page (dashboard et al.) matches
  the REF's root-level placement — this is profile-specific. THE FIX:
  extract the kicker into an exported `PageHeaderMobileKicker`, render it as
  a direct child of the page root on /profile, drop the mobileKicker* props
  from the in-column PageHeader.

## Standing findings (no clone fix)

- **THE REF-BROKEN MOBILE SET (4 routes):** `hrreports` + `interviewassistant`
  render an EMPTY `#root` (the full React crash) and `employeeselfservice` +
  `employeedetail` render an empty shell (main present, zero cards) at
  mobile widths (< ~640px, theme-independent, live-verified). The reference
  site's mobile experience is BROKEN on these four routes; the clone renders
  all four fully — the functional superset in its clearest form. The r88
  classification of employeeselfservice ("the data-driven loading-loop
  class") is RETRACTED — it was the empty shell all along.
- **THE THEME-VARIANCE ROOT CAUSE DECODED:** the REF's non-deterministic
  theme/build variants (the documented r86/r87 dark-sidebar flips + the
  light-mode build variant) are the platform's per-visitor A/B experiment
  system — `window.__APP_CONFIG__.PRE_AUTH_EXPERIMENTS` assigns a
  `visitor_id` per session and serves variant builds (`auth-signup-free-
  tagline`: "tagline" vs "control" observed across two fresh sessions). The
  capture protocol gains a standing step: probe the experiment assignment
  before classifying any REF variant read.
- **THE 59TH LOGIN DEPLOY (the opening read):** the login JS moved
  `index-DzlN4LV0 → index-BWZiPLrS` with the `frontend-config` script now
  loading on the LOGIN page too — carrying `TURNSTILE_SITE_KEY` +
  `TURNSTILE_LOGIN_ENABLED: "true"` (the standing Turnstile escalation
  watch: the arming is now configured for login, but 0 widgets render —
  verified). The full standing ladder ran GREEN: the fresh login pair
  BYTE-IDENTICAL to the 69aa4241 baseline (the deploy classified
  NON-VISUAL), standing 5/5, sweep 12/12 (after the documented cookie
  re-auth), verify-r49 13/13, verify-r45 13/13.
- **The mobile-menu cycle: GREEN on the baseline** (drawer opens → Training
  LMS navigates to /training → the auto-close verified; no TW-v4
  regression). The r87 instrument's hang is a session-ref staleness class
  (documented; the manual proof stands).

## The validation sequence (TDD)

1. **RED**: `tests/e2e/session89-darkmobile.spec.ts` — the seven contract
   pins (A1 the 11px tick font, A2 the overflow-x-auto wrapper + the Export
   button visible-wrapped at 390px, B the 16px inherited ticks, C the
   input type, D the grid height, E the kicker tree placement). All RED on
   the unfixed build.
2. **GREEN**: the five fixes (A/B/C/D/E).
3. **Full gates**: lint 0/0 · tsc ✓ · 941/941 unit · build ✓ · E2E 494/494
   (the 488 standing + the 6 new).
4. **The post-fix re-verify**: the dark-band re-capture of the five fixed
   routes (the residual read) + the RTL mobile-band capture (the
   frontier's second half) + the mobile-menu cycle re-verified.
5. **The evidence chain + the dev-server screenshots + the docs layer.**

## The residual classifications (carried)

The dark band's remaining structural set: the 4 REF-broken routes (the
superset stands), the data-driven classes (careers/surveys/attendance/
employees + the one-card deltas), the AA floor. The RTL band's residuals:
TBD by the post-fix capture.
