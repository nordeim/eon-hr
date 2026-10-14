# Remediation Plan — Session 37 / Parity Round 36

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app),
viewports pinned (1440×900 desktop, 390×844 mobile). Baseline at HEAD
`f9363a4` ALL GREEN: lint 0/0 · tsc ✓ · 556/556 unit · build ✓ · 157/157
E2E.

## The opening state (the redeploy watch + the standing audits)

- **No redeploy**: REF's /login static build is unchanged
  (`static/index-CneaUv24.js` + `static/index-D0Q6-tUz.css` — the round-35
  fingerprints) and the app chunks are unchanged post-login
  (`/assets/index-C-IrDy5f.js` + `/assets/index-BGNH4KkS.css`) → every
  app-level pin holds; every diff below is clone-side.
- **REF remains zero-data** ("No requests yet" / "0 SAR total") → the
  with-data frontier stays blocked.
- **Standing audits green**: the mobile bottom nav byte-identical (nav
  766y+78h+390w, tabs x=10/79/139/204/313, all 775y+61h, widths
  65/57/62/104/68), the mobile drawer byte-identical (panel 288px @ x=0,
  #FAFAFA, 1px #e5e5e5 border-right), the desktop navmap byte-identical
  (13 items: Dashboard 141 / Employees 181 / Payroll 221 / Recruitment
  261 / Training LMS 301 / Compliance 341 / Performance 381 / Assets 421
  / Staff Requests 461 / Communications 501 / Analytics 541 / AI HR
  Assistant 581 / Settings 621 — links vs group buttons matched by tag),
  the bell popover identical (384×175 @ (0,617), 6px radius), and the
  dashboard Quick Actions geometry-identical (four tiles 150×66 at
  x=313/471, y=217/291; REF styles an inner DIV inside plain anchors,
  the clone styles the anchor — same render; the clone's ?new=1
  deep-links are the documented superset).

## The census — the form-contract family (the round's frontier)

Round 35 named the frontier: "form-error surfaces on the new dialogs".
The probe: empty-submit each dialog on REF and read the DOM. The finding
is bigger than error text — **REF's dialogs are real `<form>` documents
with native validation**, and the round-35 rebuilds (built from
geometry-only census data) shipped button-driven dialogs instead.

REF's measured contract (all three settings dialogs + both round-34
dialogs): DialogContent > (the header DIV, outside) + (`<form
className="space-y-4">` wrapping the fields AND the footer). Inside the
form: required inputs + Cancel `type="button"` + the primary action
`type="submit"`. Empty-submit → the browser's native validation tooltip
(the `required` attribute) — **no custom error text is ever rendered**.

Probe lessons: (1) a button with no `type` attribute reports
`type:"submit"` in the DOM — inside a form that makes every footer
button a submit; REF sets `type="button"` explicitly on the
non-primary actions. (2) Radix renders its hidden native `<select>`
when the Select participates in a form — its absence on the clone was
the form-wrapper symptom, not a Select recipe drift.

### Findings

1. **R36-A — the Add Workflow + Add Shift dialogs' form contracts**
   (live-measured at 1440×900):
   - Add Workflow: REF `hasForm` with the Name input `required`; the
     clone has NO form, no required, and renders an invented inline
     error P ("Workflow name is required") on empty-submit that REF
     never renders. REF's buttons: Leave/Add Level/Cancel =
     `type="button"`, Create = `type="submit"`; the clone renders
     Add Level/Cancel as default-submit buttons.
   - Add Shift: same family PLUS three content diffs — Shift Name /
     Start Time / End Time are `required` on REF; **Break (minutes)
     defaults to 60 and Tolerance (minutes) defaults to 0** on REF
     (the clone defaults both to empty); and REF's Status row lives
     INSIDE the `grid grid-cols-2 gap-4` as the 7th cell (a 223px
     column + the w-full Select trigger) — the clone hard-pins
     `w-[223px]` on a full-width row outside the grid (same render
     today, wrong recipe — it would drift at any other dialog width).
2. **R36-B — the Add Department dialog interior** (never re-measured
   since its invention; the round-35 census took the TAB body only):
   REF = max-w-lg (512×372), `<form class="space-y-4">`, three stacked
   `space-y-2` fields — **"Department Name \*"** (required, ph
   "e.g., Human Resources"), **"Description"** (ph "Brief
   description"), **"Manager Email"** (type=email, ph
   "manager@company.com") — footer `flex justify-end gap-3` with
   Cancel (button) + **Create** (submit). The clone ships max-w-md
   (448×290), a Name+Code pair (ph "Sales" / "SLS"), the submit
   labeled "Add Department", `bg-card` inputs, and the flex-col
   gap-1.5 recipes — a full rebuild.
3. **R36-C — the Add Asset dialog's text layer** (the round-34
   interior audit measured geometry, not placeholder text): REF's
   Name placeholder is **"e.g., Macbook Air 2024"** (clone: "e.g.
   MacBook Pro 16\""), the Serial placeholder is **empty** (clone:
   "Optional"), and the assignment option reads **"Not assigned"**
   (clone: "Not Assigned"). The New Loan Request dialog re-probed
   CLEAN (form, required, buttons, placeholders all match) — the
   round-34 loans rebuild was complete.

### Verified non-gaps (recorded for the next round)

- The loans dialog: form + required + button contracts all match.
- The dashboard Quick Actions + leave balances + request/claim cards:
  geometry-identical (measured this round).
- REF's Customize remains inert (the clone's is the wired superset).
- The toaster interior: still unfireable on zero-data REF.

## The plan (TDD)

1. **RED**: the session-37 pin block in `tests/unit/recipes.test.ts` —
   A1-A6 (the two settings dialogs' form contracts: the form wrapper,
   the required attributes, the 60/0 defaults, the status-in-grid
   recipe, the button types, the death of the inline-error P),
   B1-B4 (the departments dialog: max-w-lg, the three fields with
   REF's labels/placeholders/types, the Create submit, the schema +
   API columns), C1-C3 (the asset dialog's text layer).
2. **GREEN**:
   - R36-A: convert both dialogs to REF's form architecture (header
     outside, `<form className="space-y-4">` wrapping fields + footer,
     Create = submit, Cancel/Add Level = explicit `type="button"`,
     required on REF's required fields, breakMinutes/toleranceMinutes
     defaults 60/0, the Status row into the grid with the w-full
     trigger). The custom inline-error P dies; API failures surface
     via the page's toast pattern (the superset — REF's zero-data
     Create does nothing observable).
   - R36-B: rebuild the Add Department dialog to the measured contract
     (max-w-lg, "Department Name \*", Description, Manager Email,
     Create submit, space-y recipes, bg-transparent inputs). The
     Department model + the departments API gain `description` +
     `managerEmail` columns (db:push; the API keeps `code` for
     compat). The empty-submit path becomes native validation.
   - R36-C: the three text fixes in the assets dialog.
3. **E2E**: evolve settings-tabs.spec.ts — the Add Department dialog
   gets its field contract + a create round-trip with API cleanup
   (the existing workflow/shift round-trips survive the form
   conversion: same fill + Create click, now a submit). The asset
   dialog's placeholders join the legacy-assets contract.
4. Gates: lint → typecheck → unit → build → E2E.
5. Live dual-browser verification: the three dialog pairs (structure,
   required attributes, defaults, empty-submit behavior — the native
   tooltip fires on both), plus the standing regression probes.
6. Screenshots: the departments dialog pair, the two settings dialog
   pairs (the form state), the asset dialog pair → continue the
   numbering at 136.
7. Docs: AGENTS session-37 layer + counts, SKILL version + §49, PAD
   [S37], CLAUDE/README counts, `docs/session_73.md`, worklog, this
   plan's completion record.

## Completion record (session 37)

Delivered in one window (session 73; see docs/session_73.md):

- **R36-A** (the settings dialogs' form contracts): DONE + AMENDED —
  the mt-2 amendment (the v4 inline-label re-fire: the departments
  pair measured 348 vs 372 until the verified asset-dialog recipes
  were applied to all three dialogs; all pairs then byte-identical).
- **R36-B** (the Add Department rebuild): DONE — max-w-lg, the three
  REF fields, Create submit, the space-y recipes; the Department
  model + API persist description/managerEmail (code stays for
  compat).
- **R36-C** (the asset dialog's text layer): DONE (the three text
  fixes; the loans dialog re-probed clean).
- Gates at delivery: lint 0/0 · tsc ✓ · 569/569 unit · build ✓ ·
  158/158 E2E. Live: **22/22 pair MATCH** (verify-r36.mjs, after the
  two script fixes — the newline flattening and the re-learned ref=
  regex) + the empty-submit pair + the standing audits. The E2E flake
  cascade (the toast-name strict-mode violation, the 511/512
  zoom tail, the mid-load logs read) fixed with exact:true +
  pre-clean/asserted-cleanup + settled-state polls — 10/10 stable.
  8 screenshots (136-139) → 180 PNG. DB pristine.
