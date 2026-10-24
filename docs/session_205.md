# Session 205 — Session 89 / Parity Round 88: The Dark/RTL Mobile-Band Round

**The frontier (the r88 close-out's named queue):** the first cross-side
DARK/RTL MOBILE-BAND pass at 390×844 — the two theme-direction states the
session-83 round opened but never cross-compared, now walked over the full
61-route registry on both sides. Plus the standing user emphasis (the
mobile-menu cycle) and the carried queue (the tenantsetup title member +
the companywall composer offset — both verified ALREADY CLOSED by the
parallel round's published fixes).

## The baseline

The eleventh workspace reset (the fresh clone @ `94694f7` = the round-87
union + the owner's `session_204` transcript archive). The environment
rebuilt per the standing protocol: `.env` pinned
(`DATABASE_URL="file:../db/custom.db"`), the exported-`DATABASE_URL` trap
confirmed ACTIVE for the eleventh consecutive sandbox (the `env -u` guard
on every gate), `bun install` 525, db push/seed clean.

**Baseline gates on the unmodified HEAD: lint 0/0 · tsc ✓ · 941/941 unit ·
build ✓ (116/116) · E2E 488/488 (8.8m, zero flakes)** — the chromium
version-wipe trap fired AGAIN (cache 1200, 1.64 needs 1248 — the documented
class, re-installed).

## The audit

The standing checks: the patch watch HOLDs (npm latest 16.4.3 = bug-fix
backports only, no security content — the codebase holds ^16.4.2 per the
standing precedent); the TW-v4 scan clean (16 documented `!important`, zero
row-level `md:flex-wrap`); secrets zero; the r88 union forms verified
in-source with the classification comments (spot-checks: the
surveyanalytics explicit-ticks contract, the chat `w-80 border-r` column,
the shiftswap `cn()` tiles).

## The opening read — the 59TH LOGIN DEPLOY (NON-VISUAL)

The deploy watch read the login JS MOVED: `index-DzlN4LV0 → index-BWZiPLrS`
— with the `frontend-config` script now loading on the LOGIN page too
(the first time; previously app-side only). **The full standing ladder ran
GREEN on the 59th:** the fresh logged-out login pair **BYTE-IDENTICAL** to
the `69aa4241…` baseline (the deploy classified NON-VISUAL) + standing 5/5
+ sweep 12/12 (after the documented cookie re-auth) + verify-r49 13/13 +
verify-r45 13/13 + the Turnstile census **0 widgets**.

**The frontend-config DECODED** (the standing escalation's first contents
read): `TURNSTILE_SITE_KEY` + `TURNSTILE_LOGIN_ENABLED: "true"` +
`TURNSTILE_PASSWORD_RESET_ENABLED: "true"` + the `PRE_AUTH_EXPERIMENTS`
system — see the standing findings below.

## THE THEME-VARIANCE ROOT CAUSE DECODED (the queue's named item)

The documented "non-deterministic REF theme variance" (the r86/r87
dark-sidebar palette flips + the light-mode build variant) is now
ROOT-CAUSED: the platform runs **per-visitor A/B experiments** —
`window.__APP_CONFIG__.PRE_AUTH_EXPERIMENTS` assigns a `visitor_id` per
session and serves variant builds. Direct evidence: two fresh sessions read
`auth-signup-free-tagline: {variant: "tagline"}` vs `{variant: "control"}`
— different assignments for the same route, no deploy in between. The
capture protocol gains a standing step: **probe the experiment assignment
before classifying any REF variant read.** (The experiment system also
explains the "second build per page load" observations — the variant
assignment is per-visitor, so captures across sessions can read either
variant.)

## THE DARK MOBILE-BAND READ: 26 IDENTICAL / 13 MINOR-AA / 22 STRUCTURAL

The instrument (`r89-theme-mobile-capture.mjs` — parameterized dark/rtl,
resume-capable, the experiment-state probe included; `r89-theme-mobile-diff.py`
— the same 48px-cell classification as r88): the full 61-route authed
registry captured as at-rest pairs at 390×844 DARK (darkMode=true, the
pre-paint boot contract). The triage (`r89-dark-triage.mjs` digests +
`r89-cluster-locate.py` composites + the VLM reads with DOM-probe
verification — the VLM misread rate stayed high: the profile pill/tab,
surveys cards, and careers search-input "differences" all disproven by
computed-style probes) decomposed the 22 structural routes:

- **4 REF-BROKEN routes** (the round's biggest standing finding — below)
- **10 data-driven / role-scoped classes** (careers' live job board,
  attendance's role-restricted state, employees' emptied list, the
  one-card deltas on evaluations/payrollengine/allleaverequests/
  advancedanalytics/analytics, recruitmentkanban/compliancedashboard/
  settings AA/data)
- **8 clone-authored candidates → 5 confirmed defects** (R89-A..E below;
  the other 3 disproven by DOM probes)

## THE REF-BROKEN MOBILE SET (4 routes — the functional-superset proof)

The reference site's mobile experience is BROKEN on four routes
(width-dependent below ~640px, theme-independent, live-verified):

- **hrreports + interviewassistant**: the React app renders an **EMPTY
  `#root`** (the full crash — only the Base44 edit badge remains)
- **employeeselfservice + employeedetail**: an empty shell (main present,
  zero cards)

The clone renders all four fully — the functional superset in its
clearest form. **The r88 classification of employeeselfservice ("the
data-driven loading-loop class") is RETRACTED** — it was the empty shell
all along. No clone fix (the clone's render is the correct form); the
standing finding documents the REF's defect.

## THE FIVE DEFECTS (all TDD-fixed; RED 6/6 → GREEN)

- **R89-A the attendancedashboard tick-font inversion + the mobile
  Export-button off-canvas chain.** The REF renders the
  DailyAttendanceTrend XAxis ticks at **11px** (live-verified both themes,
  3× reload-stable; the YAxis ticks at the inherited 16px — the MIXED
  form). The r88-B2 round's comment claimed the REF computed 16px on the
  XAxis and retired the 11px pin — **a measurement error in that parallel
  round** (its standing pin asserted the wrong axis too). The inherited
  16px form widened the visible ticks AND the chart's internal
  min-content, and the page min-content (575 vs the REF's 544) flipped
  the actions row's wrap decision: the Export Report button landed
  OFF-CANVAS (x=376 on the 390 viewport — unreachable at scroll-x=0, a
  functional mobile defect). THE FIX: the XAxis `tick={{ fontSize: 11 }}`
  restored + the YAxis pinned 16px (the mixed form) + the REF's authored
  card-body wrapper adopted (`overflow-x-auto > w-full text-sm`) + the
  button wrapped in `w-full md:w-auto` (the verified simulation: x=16/
  y=217/w=163 — the REF's exact rendered form; at md+ the wrapper
  collapses and the desktop row is unchanged).
- **R89-B the analyticsdashboard tick-font inversion (the mirror).** The
  REF renders ALL ticks on that page at the inherited 16px; the LOC pinned
  `tick={{ fontSize: 11 }}` on its three charts (a stale pin from an
  earlier measurement — the mirror image of R89-A). THE FIX: the three
  pins removed.
- **R89-C the requestsettings approver-email input type.** The REF
  authors `type="text"`; the LOC rendered `type="email"` (a mobile
  keyboard/validation behavioral difference). THE FIX: `type="text"`.
- **R89-D the hrassistantchat grid height.** The REF's
  `h-[calc(100vh-250px)]` applies at ALL widths (the mobile grid renders
  594px, the conversation card sitting lower); the LOC gated it behind
  `lg:` (rendering the natural 329px — a 265px structural divergence).
  THE FIX: the unconditional height + the REF's exact class order.
  **POST-FIX: the route CLOSED to IDENTICAL (max delta 2).**
- **R89-E the profile kicker placement (the 32px mobile offset).** The
  REF's profile tree hoists the mobile kicker OUT of the content column
  (`p-4 root > [kicker, max-w-5xl > [hero…]]` — every other kicker page
  renders it inside); the LOC's in-column kicker became the space-y-8
  column's first child and the 32px gap below it offset the whole page
  (the avatar at y=383 vs the REF's 351). THE FIX: the kicker extracted
  into an exported `PageHeaderMobileKicker` (the internal path renders
  the same component — zero change for the other pages) and the profile
  page renders it as the page root's direct child.
  **POST-FIX: 86 → 5 cells** (the residual = the data/AA class).

**The lockstep amendments (the count-lockstep rule):** the R88-B2 e2e pin
(the wrong-axis 16px claim — corrected to the Y-tick contract with the
mixed-form clarification), the R61-O/R63-C/R17-B unit pins (the profile
kicker props moved to the standalone component — five pins amended, the
count 941 unchanged).

## THE RTL MOBILE-BAND READ: 0 IDENTICAL / 34 MINOR-AA / 27 STRUCTURAL

The second half of the frontier: the same 61-route registry at 390×844
RTL (`app_lang="ar"`, LIGHT). **The capture-validity trap retired:** the
first VLM direction-check misjudged both captures LTR — the decisive
byte-compare (a fresh verified-`dir=rtl` capture vs the band file:
md5 `dbe7e9dc8f` identical) proved the band rendered RTL all along.
The read: a systematic AA floor (the mirrored bidi text rendering — 34
routes at the ≤5 AA class) + the SAME residual classes as the dark band
(the data-driven sets, the REF-broken four, the version class on
attendancedashboard) + two RTL-specific members flagged for the next
round (the assetmanagement select-chevron position, the allleaverequests
header icon spacing — 4 and 3 cells).

## The round's other proofs

- **The mobile-menu cycle: GREEN on the baseline AND the fixed build**
  (drawer opens → Training LMS navigates to `/training` → the auto-close
  verified; no TW-v4 regression under the five fixes). The r87
  instrument's hang = the session-ref staleness class (documented; the
  manual proof stands).
- **The post-fix dark re-capture:** hrassistantchat 56 → **IDENTICAL**;
  profile 86 → 5; attendancedashboard 88 → 35 (the residual = the
  documented recharts-version grid class — 15 vs 19 verticals, not
  decouplable via the 3.x API + the data table row);
  analyticsdashboard/requestsettings unchanged (the data classes).
- **Gates: lint 0/0 · tsc ✓ · 941/941 unit · build ✓ · E2E 494/494** (the
  488 standing + the 6 new session89 pins, 8.9m, zero flakes) · DB
  pristine · `.env.example` re-verified (the two-variable contract
  unchanged).
- **The evidence chain 1403-1427** (the dev-server set 1403-1413 + the
  dark/RTL band pairs 1415-1427) → **1596 tracked PNGs**.

## The instruments and traps (this round)

`r89-theme-mobile-capture.mjs` (the parameterized band capture) ·
`r89-theme-mobile-diff.py` · `r89-cluster-locate.py` ·
`r89-dark-triage.mjs` · `r89-tickfont-probe.mjs` ·
`r89-devserver-shots.mjs`. The traps retired: the daemon-degradation
class (three firings — the mid-run daemon death ate the first RTL batch;
the cleanup + retry protocol), the session-expiry class (both sides
re-authed mid-round), the stale-server trap (the :3200 kill-by-PID
protocol), the VLM misread rate (the DOM-probe verification discipline —
five misreads caught), the wrong-axis pin (the R88-B2 selector reads the
Y axis first — the mixed-form clarification), the `lg:`-gated-height
misread, and the capture-validity byte-compare (the RTL direction proof).

## The r90 queue

The two RTL-specific members (the assetmanagement chevron, the
allleaverequests icon spacing); the dark-band data-driven residuals'
re-reads (the REF tenant's state); the recharts-version grid class
(the standing watch); the experiment-assignment protocol's standing
adoption; the 59th-or-newer login deploy ladder (the re-armed watch).
