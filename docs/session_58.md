# Session 32 — Parity Round 31: The Orphan-Route Hunt (14 recovered routes)

**Status: COMPLETE — all 15 steps executed and pushed to main.**

## What happened

The standing audits opened the round green (redeploy 12/12, mobile chrome
byte-identical, REF still zero-data, sidebar navmap 865/905 — the round-29/30
fixes hold). Then the round's census pursued session-56/57's suggested
frontier — a **systematic orphan-route hunt**.

The method: REF's SPA bundle (`/assets/index-C-IrDy5f.js`, fetched via plain
curl) contains the complete page registry (`VKe={...61 keys}`) plus the
mechanical path function `We(name)="/" + name.toLowerCase()`. Cross-
referencing the 61 registry names against the clone's 47 served routes found
**14 routes REF serves that the clone 404'd on** — the largest route-coverage
gap since the project began, invisible to every prior audit because nothing
links to these routes from the sidebar.

## The recovered routes

- **10 real pages** (each measured live at 1440×900 + 390×844, then
  replicated): /careers (public jobs, sRGB hero), /employeeportal (centered
  onboarding card), /externaljobapplication (public job board), /hrassistant
  (single-pane AI chat), /payrollai, /payrollreports (a page-specific
  hand-rolled header), /requestreports, /requestsettings, /shiftswap,
  /tenantsetup (setup wizard).
- **2 dashboard aliases**: /organizationsetup + /dynamicdashboard re-export
  the dashboard page with the plain "Eon HR" title.
- **2 blank stubs**: /home + /employeedetail render null (REF renders
  nothing in main on both — verified twice).

Functional supersets wired throughout: two new Prisma models (ShiftSwap +
ApprovalConfig) with their APIs; careers/externaljobapplication read
JobPosting; employeeportal reads OnboardingProcess; payrollai/payrollreports/
requestreports aggregate real data with CSV export; requestsettings persists
approval configs; tenantsetup PATCHes the Company; shiftswap runs a full
request round-trip.

## Verification

- Gates: lint 0/0 · tsc ✓ · **480/480 unit (+16 pins)** · build ✓ ·
  **121/121 E2E (+21)**.
- Live dual-browser: **13/14 routes byte-identical** (the /careers line diff
  is REF's fluctuating live job data — h1+hero byte-identical, the zero-data
  contract verified matching on the empty load; documented divergence).
- Regressions: 12/12 redeploy MATCH · mobile chrome byte-identical
  (tabs/kicker/drawer border 1px #e5e5e5) · sidebar navmap 865/905.
- DB pristine (users=1, employees=1, leaveBalances=2, rest 0).

## Notable lessons

- The v4 space-y flip bites inside cards: REF's v3 `mb-4 + space-y-1.5`
  stack to 22px; v4's `:where()` lets the utility win — explicit
  `mb-[22px]` compensates (tenantsetup).
- A failed server restart (EADDRINUSE) silently leaves the STALE build
  serving — kill by PID and re-verify before trusting live reads.
- Probe evals joined to one line die on `//` comments.
- The bundle-registry census beats route-guessing forever.

## Artifacts

- 9 new screenshots (102 evidence, 103/103b shiftswap pair, 104 tenantsetup,
  105 careers, 106 payrollai, 107 hrassistant, 108 mobile) + 02/11 refreshed
  → 127 PNG captures.
- docs/remediation-plan-session32.md (the plan + completion record).
- 16 new unit pins; the R25-A4 route count pin 47→61.

**Suggested next**: with route coverage complete, the frontier narrows to
with-data surfaces (blocked on REF), the checkbox-focus recipe (no REF
surface), form-error surfaces (zero-data hidden), the deferred print-button
decision, and mobile gesture depth (swipe-to-open from the screen edge).
