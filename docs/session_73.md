# Session 73 — eon-hr parity round 36 (the form-contract family)

*The empty-submit probe: click Create with empty fields, read the DOM.
It found what two geometry audits had missed — REF's dialogs are real
forms with native validation, and the clone's were button-driven
imitations with invented error text.*

## The opening state

No redeploy (the login static build + the app chunks all unchanged —
every app-level pin holds; every diff clone-side). REF still zero-data
(the with-data frontier stays blocked). Standing audits green: the
mobile bottom nav byte-identical (nav 766y+78h+390w, tabs
x=10/79/139/204/313), the mobile drawer byte-identical (288px @ x=0,
#FAFAFA, 1px #e5e5e5), the desktop navmap byte-identical (all 13
items at 141…621, links vs group buttons matched by tag), the bell
popover identical (384×175 @ (0,617)), the dashboard Quick Actions
geometry-identical (four tiles 150×66 at x=313/471, y=217/291 — REF
styles an inner DIV inside plain anchors, the clone the anchor itself;
the clone's ?new=1 deep-links are the documented superset).

## The census — the empty-submit probe

Round 35's frontier note named "form-error surfaces on the new
dialogs". The probe: open each dialog on REF, click Create with empty
fields, read the DOM. The finding generalized — REF's whole dialog
family is `<form class="space-y-4">`-based: the header sits outside
the form; the fields AND the footer sit inside; the primary action is
`type="submit"`; every secondary action is an explicit
`type="button"`; the required fields carry `required` (the browser's
native tooltip IS the error surface — no custom error text ever
renders). Two supporting mechanics: an untyped `<button>` reports
`type:"submit"` in the DOM and submits the form it sits in; Radix
renders its hidden native `<select>` only when the Select participates
in a form (its absence on the clone was the missing-form symptom, not
a Select drift).

### R36-A — the two settings dialogs

The round-35 rebuilds (geometry-census-built) were button-driven with
invented inline-error Ps ("Workflow name is required" / "Shift name is
required") that REF never renders. Converted both to the form
architecture; the inline Ps deleted; API failures now surface via the
page's toast pattern (the superset — REF's zero-data Create does
nothing observable). Add Shift's content diffs: Name/Start/End carry
required; **Break (minutes) defaults 60 and Tolerance (minutes)
defaults 0** (REF live-measured val="60"/"0"; the clone shipped empty
strings); the Status row rides INSIDE the grid as the 7th cell (a
223px column + the w-full trigger — the clone's hard-pinned
w-[223px] full-width row rendered the same 223×36 but was the wrong
recipe).

### R36-B — the Add Department rebuild

The dialog interior had never been re-measured since its invention
(round 35 took the tab body only). REF's contract: max-w-lg (512×372),
three stacked space-y-2 fields — **"Department Name \*"** (required,
ph "e.g., Human Resources"), **Description** (ph "Brief description"),
**Manager Email** (type=email, ph "manager@company.com") — the footer
`flex justify-end gap-3` with Cancel (outline 81×36, button) +
**Create** (dark solid rgb(23,23,23) 79×36, submit — measured in
light mode after catching the session in a persisted dark state, the
round-35 lesson). The clone's max-w-md Name+Code pair ("Sales"/"SLS"
placeholders), the "Add Department"-labeled submit, and the bg-card
inputs were all invented. The Department model + the departments API
gained `description` + `managerEmail` columns (db:push to both DBs;
`code` stays in the API for compat — the wizard still reads it).

### R36-C — the asset dialog's text layer

The round-34 interior audit measured geometry, not placeholder text:
REF's Name ph is "e.g., Macbook Air 2024" (clone: "e.g. MacBook Pro
16\""), the Serial ph is empty (clone: "Optional"), the assignment
option reads "Not assigned" (clone: "Not Assigned"). The New Loan
Request dialog re-probed CLEAN — the round-34 loans rebuild was
complete.

## The mt-2 amendment (the v4 inline-label re-fire)

The first live pair of the rebuilt departments dialog measured 512×348
vs REF's 512×372 — exactly 3×8px. The label→input gap: REF 12px, the
clone 4px (the documented v4 collapse, re-fired because the round-35
dialog builds never needed the compensation — their fields were
placeholder-only or grid-positioned). The verified recipes, grounded
on the round-34 asset dialog (re-measured on both apps at 12px):
Input cells = space-y-2 wrapper + `className="mt-2"` on the Input;
Select cells = BARE div (no space-y — the Radix native-select
last-child trap) + `className="mt-2"` on the trigger. Applied to all
three dialogs; all three pairs then measured byte-identical
(departments 512×372 gap 12; workflow 768×252 nameGap 12 trigY 415
levelsY 476; shift 512×456 nameGap 12 cancelY 617 statusTrigY 565).

## The E2E flake cascade (three races, live-debugged)

The full suite's first re-run failed the settings empty-recipes spec.
The forensic trail (audit-log timestamps + error contexts) uncovered a
cascade: (1) the Add Department post-create assertion
`getByText("E2E Probe Department")` resolved to BOTH the list row AND
the toast's description ("…is ready.") — a strict-mode violation
racing the toast's auto-dismiss; when it failed, the cleanup never
ran, and the leftover broke the NEXT run's empty-state spec (and the
run after that via the unique-name CONFLICT). Fixes: `{ exact: true }`
on the row text, a describe-level pre-clean (the round-31 pattern),
and an ASSERTED cleanup (the fire-and-forget delete had failed
silently once). (2) 511 vs 512 — the zoom-in-95 enter animation's tail
(the round-35 precedent: ±1 tolerance). (3) the Logs test read
mid-load (hasEmptyLine=false, rowCount=0 — the counter renders before
the list settles): an expect.poll to the settled state, then one
read. After the fixes: 10/10 stable solo runs + the full suite green.

## The verify-script traps (both produced false confidence)

The first verify-r36 run reported 18/22 — but the four "failing"
probes were eval errors on BOTH sides, and worse, every multi-line
probe record that "MATCHED" was VACUOUS (both sides ERR →
undefined === undefined): multi-line evals through execSync +
JSON.stringify leave literal `\n` sequences that break the CLI's JS
parser. Fix: flatten newlines before stringify. The second trap: the
round-35 `ref=` regex bug re-introduced — `\[ref=` never matches
`[expanded=false, ref=e…]` attribute lines, and REF's dialog triggers
carry aria-expanded, so every REF-side dialog click silently
no-opped. Fix: `ref=(\w+)\]` without the bracket requirement (the
verify-r35 fix, re-applied — with the lesson recorded twice now).
After both fixes: **22/22 MATCH** with real comparisons (form
presence, formCls, inputs with placeholders/types/required/values,
nativeSelects, button label/type maps, widths, the geometry w/h/gap,
the status trigger, the department height, the asset options text) —
plus the manual empty-submit pair (both apps keep the dialog open,
focus on the Name input, no DOM error text).

## Gates + delivery

**lint 0/0 · tsc ✓ · 569/569 unit (+13) · build ✓ · 158/158 E2E
(+1)** — the Add Department dialog spec (the field contract, the
512±1 geometry, the native-validation empty submit, the button types,
the round-trip with pre-clean + asserted cleanup), and the
workflow/shift specs gained the native-validation + defaults
assertions. The round-35 lint warning (the logout button's intentional
`window.location.href`) now carries its justified eslint-disable.

8 screenshots (136-139, ref+loc pairs: the add-department rebuild, the
workflow form dialog, the add-shift 60/0 defaults, the asset text
layer) → **180 PNG captures**. DB pristine. `.env.example` re-verified
against the codebase (the two documented variables).

Docs: AGENTS session-37 layer, SKILL 3.20.0 + §49, PAD [S37],
CLAUDE/README counts (569 unit · 158 E2E · 180 captures), this session
log, the plan's completion record, the worklog.
