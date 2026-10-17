# Session 99 (2026-10-17) — parity round 48 re-executed: the bare hero architecture

> Re-execution note: the original round-48 window completed its GREEN
> body but was lost to a workspace reset before the push landed (the
> local commit never reached the remote). This session re-ran the round
> from a FRESH census — every contract below is live-measured in this
> window, not remembered — and pushed at the FIRST green gate stack
> (the lost-work lesson: commit+push early, verify+docs after).

## What the round delivered

- **The hero-block architecture** (the fresh census's core finding):
  REF renders the hero block CLASSLESS (`DIV[]`) on every measured page
  — taskmanager and leavemanagement included. The clone's `min-w-0`
  (+ `flex-1` when centered) wrapper retired universally; the centered
  variant renders `text-center` ONLY (every measured centered page is
  row-less, so the r9 fill-the-row rationale never applied).
- **The BARE-15 family**: organogram, companywall, evaluations,
  training, hrassistant (text-center); reports, interviewassistant,
  securitysettings, communications, settings, profile, analytics,
  notificationpreferences, announcements (classless); hrassistantchat
  (`mb-6` via heroClassName) render the hero block as a DIRECT child of
  the content wrapper — NO hero row at all. New `bare` prop.
- **The always-row families**: the always-start eight (offboarding,
  compliance, performance, workflowautomation, allleaverequests,
  payrollai, assets, advancedanalytics) render the UNPREFIXED
  `flex justify-between items-start`; hrreports/requestreports
  `flex items-center justify-between` (+ templates mb-8,
  workflowconfigpage mb-6 via className); loans joins payrollreports'
  SHORT hidden row. New `alwaysRow` prop.
- **The actions clusters**: REF wraps multi-button clusters in bare
  `flex gap-2` (hrreports/requestreports — actionsBare) and renders
  SINGLE actions DIRECTLY in the row (leavemanagement, assets,
  payrollreports, offboarding, compliance, workflowautomation,
  allleaverequests, payrollai, advancedanalytics — actionsUnwrapped).
- **The C pages**: interviewassistant's two-card grid (Select Candidate
  + Interview Notes, labels Candidate/Notes); securitysettings' alert
  H3 + circle-alert + the slate DIV badges + circle-check-big + the
  FIRST live-measured checkbox (the old shadcn border-primary/shadow/
  ring-1 form); payrollreports rebuilt (kicker + back button +
  select-none, the short hidden row, the WhatsApp CTA direct +
  text-white + the full-width mobile copy, Radix-verbatim tabs with
  all four panels mounted, the bare px-4 py-3 th family); hrreports'
  Label-component form labels (text-xs text-slate-500 — twMerge
  collapses leading-none under the later text-xs, the TW v4 lesson);
  evaluations' Radix-verbatim panels; requestreports' horizontal-bare
  stats (the 40×40 rounded-lg tile + P/P pair in the classless div) +
  the pb-2 pr-4 th family + the always-row header; analytics' BARE
  root (`p-4 md:p-8` only, no gradient canvas); recruitmentkanban +
  chat confirmed conforming.
- **The E chart family**: every chart page renders DUAL-direction
  CartesianGrids (the 14 `vertical={false}` pins retired across the 6
  charts.tsx files; the line COUNTS stay Recharts internals —
  direction parity is the contract).
- **The F avatar module (functional superset)**: REF's Change Photo
  button + hidden input now WORK — the 96×96 center-crop canvas
  downscale → POST /api/profile/avatar (guard/requireUser/parseBody +
  the data-URL validation + the audit log) → the optimistic swap; the
  purge script resets user avatars (E2E pristine).
- **The G fixes**: profile's stray wrap-level icon-only footer P
  removed; hrassistant's badge glyph Bot at text-blue-600; assets'
  Laptop at text-green-600 + the utility-form green gradient CTA
  (bg-gradient-to-r from-green-600 to-emerald-600, hover:bg-primary/90);
  the Button base's cursor-pointer retired.

## Gates

lint 0/0 · tsc ✓ · **771/771 unit** (+26: A1-A5, C1-C9, E, F1-F2,
G1-G6 + 13 predecessor amendments) · build ✓ · **243/243 E2E** (+16:
the session-49 bare-interiors spec — the bare heroes, the always-rows,
the unwrapped actions, the two-card form, the checkbox, the payroll
kicker/panels/th, the label form, the value-in-tile, the
horizontal-bare stats, the bare root, the dual grids, the stray footer,
the WORKING avatar upload with a real PNG) · **verify-r48 29/29 pairs
MATCH** (member-set normalized: the class-order variance, the dark:
superset pairs, the guard-span icon translation, the tab token pair,
the mt-8/space-y margin collapse, the Recharts direction-parity) ·
standing audits 5/5 · route sweep 12/12 · DB pristine (users=1,
employees=1, balances=2, avatarUrl=null) · `.env.example` verified.

## The round's tooling lessons

- **The shell-quoting trap**: the demo password `$Abcd1234` inside
  DOUBLE quotes gets variable-expanded — the browser fills an EMPTY
  password and the login silently bounces to `/login?`. Single-quote.
- **The stale-server trap (re-learned)**: `pkill -f "standalone/server"`
  NEVER matches — Next renames its process to `next-server (v16.4.0)`.
  A stale server holding :3201 served DEAD chunk names (500s) — the
  page never hydrated and the login form fell back to a NATIVE submit.
  Kill by port-derived PID (`ss -tlnp`) before every boot.
- **The fragment-block bug (caught by E2E)**: the PageHeader rewrite
  initially rendered HeroBlock as a fragment inside the row — the h1
  attached DIRECTLY to the row, losing REF's `row > DIV[] > badge/h1/p`
  nesting. The spec's parentElement walk caught it; the wrapper restored.
- The agent-browser `eval` one-liner joins newlines to spaces — `//`
  comments inside reader literals eat the expression (the session-46
  lesson, still true). Reader files stay comment-free inside templates.

## Frontier after this round

The login build stays under ACTIVE development (the watch stays
armed); the deferred byte-parity backlog (the badge span
leading-5/text-slate-700 member-order variance, the CardTitle
text-base/leading-none per-page forms, REF's hover gradient no-ops);
the chart line-count parity (data-dependent, Recharts internals); the
tax/history/custom superset panels stay REF-unmeasured; the remaining
~15 never-deep-measured routes (payrollmodule's eval timeouts — the
page needs a slow-load census pass).
