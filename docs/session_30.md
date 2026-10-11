# Session 30 — Parity Round 18: The interaction dimension (keyboard focus rings) + the sub-390 band sweep

Continuing the parity cycle after round 17 (`f5412ff` + session log
`66859ec`). The owner's brief pointed at session_28/29 +
remediation-plan-session18; session_28's suggested next steps were: re-run
the redeploy check first, sweep the sub-390 band (320–389) if the
reference supports small phones, and open an **interaction-parity
dimension** (focus rings / keyboard traversal) as the geometry map
saturates. All three executed this round.

Workspace survived at `66859ec`; `.env` intact
(`DATABASE_URL="file:../db/custom.db"`); DB pristine (users=1, employees=1,
balances=2, payroll=0, expenses=0); the shell `DATABASE_URL` trap guarded
with `env -u DATABASE_URL` on every DB/build command.

**Baseline gates: lint 0/0 · tsc ✓ · 363/363 unit · build ✓ · 86/86 E2E**
— the `66859ec` push state exactly. Static audit of the R17 diff
(`a977ef0..f5412ff`): clean (0 `any`, no console.log/secrets).

Skills consulted (repo `skills/`): tdd (red→green vertical slices, seam
discipline), agent-browser (dual-session probing), clone-app-pat-pro
(computed styles as ground truth), tailwind-patterns (v4 CSS-first rules).

**Redeploy check PASSED** — 12 probe routes byte-identical (h1
text/font/x/y); REF unchanged since round 17.

**Mobile navigation audit (user priority, re-run with an improved probe —
the drawer now opens via a GEOMETRY-LOCATED hamburger click; REF's
hamburger carries no aria-label)**: top bar 390×73 white sticky + 1px
slate-200; bottom tabs x 10/79/139/204/313, 14px labels, 20px icons,
active rgb(37,99,235); drawer 288×844 #FAFAFA z-50 fixed (links
141/301/421/461/581, footer 121@723, no close button); kickers — standard
53px h1@32 AND the profile 69px variant (back button 36@32,105 + subtitle
"Manage your account"); md boundary 767/800 — **all byte-identical, no
Tailwind v4 bug**.

**The first sub-390 band sweep (320/344/360/389 × 10 representative
routes)**: settled probes byte-identical on the fitting pages
(dashboard/employees/staffrequests — kicker h1 = vw−64 exactly both
sides); every residual diff is REF's own overflow family extended below
390 (attendance 943–1199, settings pill 1003–1259, shiftcalendar 732–988,
recruitmentkanban 1376–1632, documenttracker 390–646, payroll 344@320,
profile 539) where the clone fits or overflows less (487/987/523/348).
**Settle lesson: REF needs ≥5s at odd sub-390 widths** — the fast sweep
captured the 61px mid-hydration state at 344/389 (docW 430, squeezed h1s,
the Base44 badge as the only "card"); settled re-probes (5s + re-read,
STABLE across two reads) match byte-for-byte.

**The interaction-parity audit (the round's core — the new dimension)**:
real Tab presses through both apps, full computed outline + box-shadow
dumps at every stop.

- **Tab traversal ORDER: byte-identical** on every swept surface
  (/dashboard desktop 12 stops, mobile 10, /login 8, /employees 10 — same
  elements, same sequence, same x/y). The strongest result of the
  dimension.
- **Switch recipe: byte-identical** (ring-2 ring-ring ring-offset-2 —
  white 2px + #0A0A0A 2px; measured on /notificationpreferences' twelve
  switches, both sides).
- **Browser-default outlines: parity** — bottom tabs, quick-action links,
  "View all" links and login socials carry no custom focus classes on
  either app; both render `auto 1px` (REF serializes rgba(10,10,10,0.5),
  the clone lab(2.74/0.5) — the same dark-50% color in different color
  spaces; the browser-auto-serialization family).
- **Seven focus-recipe gap groups (R18-A..G)** — REF's taxonomy, all
  measured with full-string dumps:
  - **R18-A (Button base, systemic)**: REF buttons render
    `focus-visible:ring-1 focus-visible:ring-ring` (1px #0A0A0A, NO
    offset — measured on hamburger/عربي/user/Import CSV/Add
    Employee/Edit); the clone's base was ring-2 + ring-offset-1 (3px).
  - **R18-B (Input/Textarea offset, systemic)**: REF inputs render
    ring-2 ring-ring **ring-offset-2** (white 2 + ring 2 = 4px); the
    clone's offset was 1.
  - **R18-C (sidebar ring color)**: REF's sidebar links, group buttons
    AND sub-items focus in `ring-sidebar-ring` = **blue-500 #3B82F6**
    (its `--sidebar-ring` token 217.2 91.2% 59.8%, rendered
    rgb(59,130,246)); the clone used the dark global ring.
  - **R18-D (mobile hamburger)**: the clone's bare toggle button carried
    NO focus classes (browser-default outline); REF's carries the button
    recipe.
  - **R18-E (login page scope)**: REF redefines `--ring: 240 10% 3.9%`
    (zinc-950 #09090B) on the login page — Sign in's ring is zinc-950,
    and the email/password inputs carry the page pair
    `focus:border-slate-400 focus:ring-slate-400` (slate-400 ring, white
    2px offset). The clone had the generic dark input ring and a
    slate-400 BUTTON ring (the pair half-swapped).
  - **R18-F (select trigger)**: REF's Radix select triggers carry the
    button recipe (focus-visible:ring-1); the clone's had focus:ring-2.
  - **R18-G (tab trigger offset)**: REF's tab triggers render
    ring-2 ring-ring **ring-offset-2** (4px total, /settings Company);
    the clone's lacked the offset.

`docs/remediation-plan-session19.md` written (7 gap groups + the taxonomy
table + non-goals: REF's focusable settings card is an extra tab stop NOT
cloned; the checkbox recipe unaudited on REF's zero-data surfaces;
staffrequests' local tab copy + employees' native select already matched)
and codebase-validated before execution.

**TDD**: 10 new pins (9 in recipes.test.ts + 1 token pin in
tokens.test.ts), all RED before implementation → GREEN. One mid-flight
correction from live verification: the login input ring-color override
must use the SAME variant as the base (`focus-visible:ring-slate-400`,
not `focus:`) — tailwind-merge only dedups within a variant, and the bare
focus: utility loses the v4 cascade battle against the base's
focus-visible:ring-ring (rendered #0A0A0A instead of slate-400 until the
variant was aligned). The same-variant lesson is now pinned in the test
comment + AGENTS + SKILL §31.

**Gates: lint 0/0 · tsc ✓ · 373/373 unit (+10) · build ✓ · 86/86 E2E.**

**Live dual-browser verification**: every fixed surface byte-exact —
sidebar leaf rgb(59,130,246)@2px both; group button rgb(59,130,246)@2px
both; hamburger rgb(10,10,10)@1px both; Import CSV / Add Employee
rgb(10,10,10)@1px both; login input white 2px + rgb(148,163,184)@4px
both; Sign in white 2px + rgb(9,9,11)@4px both; settings Company tab
white 2px + rgb(10,10,10)@4px both; shiftcalendar All Departments select
rgb(10,10,10)@1px both; chevrons + Shift Swaps anchor @1px both (bonus).
The clone's extra leading transparent 0-width shadow layers are v4
ring-var serialization — invisible. Post-fix regression sweeps: canonical
12-route 12/12 MATCH (one transient REF /settings read, re-probed
identical — focus changes are box-shadow-only, zero layout impact) +
mobile chrome regression clean (top bar/tabs/drawer/boundary byte-identical).

**8 screenshots** (4 new focus-ring evidence captures —
59-sidebar-focus-ring-blue, 60-cta-focus-ring-1px,
61-login-input-focus-slate400, 62-tab-focus-ring-offset2, each with the
ring made visible via real Tab focus; 4 standards refreshed) → 75 total.
VLM spot-checks confirmed the blue sidebar ring and the login input focus
indicator (computed styles remain the byte-exact ground truth).

Documentation updated: AGENTS session-19 layer + 373 specs; SKILL v3.2.0
+ §31 + counts; PAD [S19] row + Last Updated + corrected test table
(recipes 236 / tokens 19); CLAUDE 459-spec pyramid + session-19 pins;
README 373 specs + 75 captures + focus-parity feature row; this session
log; worklog; remediation-plan completion record.

## Session complete — parity round 18 pushed to `nordeim/eon-hr@main`

**Audit**: redeploy check (REF unchanged), mobile navigation verified
byte-identical end-to-end via the geometry-located drawer probe (no
Tailwind v4 bug), the FIRST sub-390 band sweep (clean — settled probes
byte-identical; residuals = REF's own overflow family), and the FIRST
interaction-parity audit (Tab order byte-identical everywhere; the focus
ring recipes were the gap).

**Fixes**: 7 gap groups with 10 new TDD pins — the systemic button
ring-1-no-offset recipe, the Input/Textarea offset-2, the sidebar
blue-500 focus token (+ its 3 call sites), the mobile hamburger focus
classes, the login slate-400/zinc-950 pair (with the same-variant
tailwind-merge lesson), the select trigger recipe, the TabsTrigger
offset-2.

**Gates**: lint 0/0 · tsc ✓ · **373/373 unit** · build ✓ · **86/86 E2E**
· 8 screenshots · DB pristine.

**Suggested next steps**: re-run the redeploy check next round; the
geometry AND interaction maps are now swept (390→1440 + keyboard focus);
remaining frontier — the with-data story (still blocked on REF's zero-data
state), the checkbox focus recipe (no measurable REF surface yet),
hover/active state parity (a third interaction dimension: button hover
colors are pinned for CTAs but not swept systematically), and reduced-
motion support (the open a11y item in PAD §10).
