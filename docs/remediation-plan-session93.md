# Remediation Plan — Session 93 / Parity Round 92: the unscanned creation surfaces round

**The round's frontier.** The r92 close-out's queue: (1) the remaining
dialog surfaces the r92 sweep could not read — the r92 instrument swept
DIALOGS, so every creation surface that renders as an INLINE VIEW or a
full-page editor was invisible to it (the third open-state blind spot:
employees' Add Employee opens a full-page WIZARD, recruitment's Post New
Job renders an INLINE FORM SECTION, workflowconfigpage's New Workflow
opens a full-page EDITOR); (2) the seed-jobs parity decision (the REF's
3-job tenant vs the clone's empty board — the standing scoped decision);
(3) the standing watches (the dark-band data residuals, the recharts grid
class, the login ladder — re-armed at the 61st, classified at the 62nd by
the prior execution).

**NOTE — the lost first execution.** This round executed once before
(committed `5cb73bf` locally) but the push never landed and a sandbox
reset destroyed the commit. This plan re-derives the round from the
current origin HEAD (`009ee3d`) with fresh REF captures (2026-10-25) —
every contract below was re-read live from the REF this execution; where
the prior transcript recorded a contract, the fresh reads CONFIRMED it
(the wizard's four Contract Types, the wizard's Basic Salary row, the
Reports To label, the Post New Job inline form's field set, the workflow
editor's full structure, the three dialog geometries, the three-job
tenant).

## The opening read (the standing ladder)

The r93 login-pair probe (`scripts/r93-login-pair.mjs`, the r88
instrument pattern): the fresh logged-out REF login PNG at 1440×900 LIGHT
**md5 `69aa4241efa1…` — BYTE-IDENTICAL to the standing baseline**
(`docs/screenshots/493-login-standing-ref.png`). The login asset
filenames moved since the 61st (login JS `index-34zv7ZR0` →
`index-DlxedS3b`, CSS `index-BlYK4iZ6` → `index-CrV5b32v` — the
62nd-or-newer generation line, the same chunk-graph-movement class the
prior execution classified at the 62nd), the login DOM census unchanged
(6 buttons + Sign in, email/password inputs, **Turnstile 0**), and the
app side **QUIET** at the recorded fingerprints (app JS `C-IrDy5f` / app
CSS `BGNH4KkS` — live-read on the authed REF dashboard). The full
standing ladder GREEN: standing audits **5/5** (`probe-r37-standing`),
route sweep **12/12** (`probe-r41-routesweep`), verify-r49 **13/13**,
verify-r45 **13/13**. **VERDICT: the current login generation NON-VISUAL,
both sides quiet — no ladder escalation required.**

## The frontier instrument

`scripts/r93-wizard-capture.mjs` + `r93-wizard-capture2.mjs` (the REF
employee wizard walked all 4 steps with no-creation Cancel exits) +
`scripts/r93-surfaces-capture.mjs` / `r93-surfaces-capture2.mjs` (the
Post New Job inline form, the workflow editor + its combo options, the
Schedule Recurring Report / Send Payslips / New Chat / Add Applicant
dialog interiors) — run on the authed REF session; the clone side read
from source (the affected pages were all previously TDD-pinned at rest,
so the divergence set is purely the creation-surface layer).

## The findings — EIGHT members

### The at-parity / REF-inert set (no fix)

- **/payrollengine Generate Payroll, /payrollmodule Generate All** — the
  REF's buttons dispatch NO dialog (no-action classes at rest); the
  clone's working flows stay the functional supersets (the documented
  pattern).
- **/staffrequests New Request** — REF-BROKEN (the r91 finding: its open
  path's audit-log 403); the clone's working dialog stays.
- **The wizard's structural shell** — the clone's EmployeeWizard
  (session 7 R6-C) already renders the correct page-replacing view, step
  rail, and footer; only the field-level contracts diverge (R93-A).

### R93-A — the employee wizard's five field-level divergences

The REF's Add Employee (live-walked 2026-10-25, all four steps, no
creation):

| Step | The REF's live contract | The clone's divergence |
|---|---|---|
| 1 Personal Info | `Full Name *` (ph "John Doe"), `Work Email *` (ph "john@company.com"), `Private Email` (ph "john@personal.com"), `Phone Number` (ph "+966 5XX XXX XXX"), `Date of Birth`, `Gender` (Male/Female), `Nationality`, `National ID`, `Iqama Number`, `Iqama Expiry` + the photo upload | **the four placeholders missing** |
| 2 Job Info | `Job Title *` (ph "Software Engineer"), `Department` (combobox "Select department", data-driven), `Employment Type` (combobox, default "Full Time"; Full Time/Part Time/Contract/Intern), `Start Date *`, **`Reports To`** (combobox "Select manager", LEFT column, no span) | label reads **"Manager"** with `sm:col-span-2` |
| 3 Contract Info | `Contract Type` (**Indefinite/Fixed Term/Probation/Internship** — four), `Contract Start Date`, **`Basic Salary (SAR)`** (number, ph "0"), `Bank Name`, `IBAN`, `GOSI Number` — 3 rows × 2 cols, no spans | Contract Type **two** options; **Basic Salary missing**; GOSI carries `sm:col-span-2` |
| 4 Documents | `Onboarding Template (Optional)` (combobox "Select template", data-driven), `Upload Documents` (file input), footer **`Create Employee`** | at parity |

**Fix**: the five members above; `baseSalary` joins the form state and
the save payload (minor units); `WizardEmployee` + the employees page's
row mapping carry `baseSalary` for edit mode.

### R93-B — Post New Job renders an INLINE FORM, not a dialog

The REF (live-read): clicking "Post New Job" inserts a **form card**
(`rounded-xl border bg-card border-slate-200 shadow-xl`, 1120×587) with
the indigo→blue gradient header ("Post New Job") between the tab bar and
the filter row — the table stays visible below:

- `Job Title *` | `Department *` (2-col grid, `md:grid-cols-2 gap-4`, `space-y-1` fields)
- `Location` | `Employment Type` (combobox: **Full Time/Part Time/Contract/Internship** — note the -ship here vs the wizard's "Intern")
- `Job Description *` (textarea, full width)
- `Requirements` (textarea, full width, ph "List required skills, experience, qualifications...")
- right-aligned `Cancel` | **`Create Job`**

The clone renders a **dialog** with a different field set (Type label,
Openings number, "Post Job" CTA, invented placeholders).

**Fix**: the dialog retired; the inline form section renders on the
Applicants tab above the filter row; the Tabs component becomes
controlled (the form shows/hides via the button). The API's POST accepts
`requirements` (optional string, appended to the stored description
blob — the REF's own descriptions inline their responsibilities).

### R93-C — workflowconfigpage's New Workflow opens a full-page EDITOR

The REF (live-read): the list view swaps to an editor page — `← Back` +
h1 "New Workflow":

- `Workflow Name` (ph "e.g. Finance Approval") | `Applies To` (combobox: **Staff Requests / Expense Claims**) | `Active` (switch)
- `Min Amount (SAR)` (ph "e.g. 500") | `Max Amount (SAR)` (ph "e.g. 10000")
- `Categories (comma separated, blank = all)` (ph "finance, hr, it")
- the **levels builder**: bordered sub-cards (`border border-slate-200 rounded-lg p-4 bg-white`) — a blue numbered circle (`w-7 h-7 bg-blue-600 text-white rounded-full text-sm font-bold`) + a name input (`w-48`, ph "Level name (e.g. Line Manager)", L1 default value "Line Manager") + a trash button (`h-9 w-9 text-red-400 hover:text-red-600`); the level grid `md:grid-cols-2 gap-3` carries **Approver Type** (combobox: Staff Requests / Expense Claims / Specific User(s) / Department Head / Direct Manager / Any Admin; L1 default "Direct Manager", added levels default "Specific User(s)") + **Auto-approve after (hours, 0 = disabled)** (number); the **Approver Emails (comma separated)** field (ph "email1@company.com, email2@company.com") renders for the Specific User(s) type
- `Add Level` | footer `Cancel` | **`Save Workflow`**

The clone renders a **dialog** (name/levels/appliesTo/threshold) — an
invention relative to this contract.

**Fix**: the dialog retired; the page gains a list↔editor mode swap (the
employees wizard pattern). The API: `APPLIES_TO` gains `expense_claims`;
`WorkflowInput` makes `levels`/`threshold` optional with defaults and
accepts the editor shape (`minAmount`/`maxAmount`/`categories` +
`levels` as the level-object array); the conditions JSON carries the
editor structure; the legacy dialog shape (the settings page's pinned
flow) keeps working unchanged.

### R93-D — the Schedule Recurring Report dialog

The REF (live-read, 512×380): title **"Schedule Recurring Report"**, NO
description; `Report Name` (text) / `Report Type` (**Attendance, Payroll,
Overtime, Leave, Turnover, Headcount** — six) | `Frequency`
(**Daily, Weekly, Monthly, Quarterly** — four) on the same row /
`Recipients` (email, ph "email@company.com") + an **`Add`** button;
footer `Cancel` | **`Schedule Report`**. The label rhythm 84px
(323/407/491). The clone renders a Frequency-only "Schedule" dialog
with a description — an invention.

**Fix**: the dialog rebuilt to the full contract (the recipients list is
a local array — the Add button appends typed emails; scheduling stays
the local toast superset).

### R93-E — the Send Payslips via WhatsApp dialog

The REF (live-read, 672×310): the header CTA OPENS A DIALOG — title "Send
Payslips via WhatsApp"; the **`Select Payroll Month`** label + a
`type=month` input + the **`Send All`** button on the same row; below, a
data-driven area (the REF's zero-tenant renders "No payrolls found for
2026-10"); `Close`. The clone fires a toast directly — no dialog.

**Fix**: the dialog (672) on BOTH the desktop CTA and the mobile
full-width copy; the month defaults to the current month; the body lists
`/api/payroll?period={month}` records (the functional superset) or the
"No payrolls found for {period}" line; Send All dispatches the toast +
closes.

### R93-F — the New Chat dialog

The REF (live-read, 512×172): "New Chat" OPENS A DIALOG — title **"Start
New Chat"**; one input ph **"Project name (optional)"**; `Cancel` |
**`Create`**. The clone fires the POST directly.

**Fix**: the dialog; `Create` sends the existing `POST /api/chats` with
the optional project name as the title (falling back to the existing
default title when empty).

### R93-G — the Add Applicant dialog's invented layer

The REF (live-read, 512×522): **no description**; **no placeholders**
(all seven inputs bare); the Cover Letter textarea renders **3 rows**
(h=78). The clone carries a description line, five invented placeholders
("e.g. Sara Almutairi", "name@example.com", "+966 5X XXX XXXX", "e.g.
5", "Tell us why you're a great fit") and a 4-row textarea (568px tall).

**Fix**: the description + the five placeholders removed; `rows={3}`.
(The R91-C field-contract pin is unaffected — it asserts labels +
sources only.)

### R93-H — the job-postings vocabulary, seed, and card

The REF's tenant (live-read): **three jobs** — the in-app Job Postings
tab renders job CARDS (NOT the applicants table on that tab): `HR
Manager` (HR · Jeddah, **draft**), `HR Director` (HR · Riyadh,
**draft**), `System Admin` (IT · Jeddah, **active**) — the order
HR Manager → HR Director → System Admin (2-col grid, cards 548 wide).
The stats trio reads "1 Active Jobs / 0 Total Applicants / 0 Shortlisted
/ — Avg AI Score". The card contract (live HTML read):

- outer `rounded-xl border bg-card text-card-foreground shadow border-slate-200 hover:shadow-lg transition-shadow`
- header (p-6, border-b): `font-semibold tracking-tight text-lg` title + `text-sm text-slate-500` "**dept · location**" + the status badge (right)
- badge: `inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold` + `border-transparent` + **draft: `bg-slate-100 text-slate-600`** / **active: `bg-green-100 text-green-700`** — the RAW lowercase text, h=22, radius 6px
- body (p-4): `text-sm text-slate-600 line-clamp-2 mb-3` description
- footer `flex items-center justify-between text-sm`: `text-slate-500` "**N applicants**" + an outline button (`h-8 px-3 text-xs`, lucide-upload `w-3 h-3 mr-1`) "**Upload CV**" (REF-inert on click — the clone wires the superset: switch to the AI CV Upload tab with the job preselected)

The "Upload CV" click on the REF dispatches nothing observable (no
dialog, no tab switch, no URL change) — classified REF-inert.

The careers page shows only the **active** job (System Admin: company
"Company", meta IT / Jeddah / full time / 12000-15000 — live-read).

**Fix**:
1. **Seed**: the three REF jobs with their full descriptions
   (HR Manager "Role Overview The HR Manager at Rimac Logistics –
   Jeddah…", HR Director "Job Description We are seeking…", System
   Admin "We're looking for a detail-oriented…"), postedAt ordered for
   the DESC list (System Admin < HR Director < HR Manager),
   **idempotent upserts** (the update arm also carries postedAt — the
   convergence rule).
2. **API**: the status enum `draft | active` (default `draft`); POST
   accepts `requirements`.
3. **The page**: the Job Postings tab renders the REF card design (the
   StatusBadge type-chip row retired; the title/dept·location/badge/
   description/applicants+Upload CV contract); the stats count
   `status === "active"`; the clone's Pause/Reopen becomes
   Publish/Unpublish (draft↔active superset); the "All Jobs" filter
   lists the jobs (the REF's own filter now matches: All Jobs, HR
   Manager, HR Director, System Admin).
4. **Careers**: fetch `?status=active`; the badge label for active jobs
   stays the careers page's own "Open" design (the session-40/41 pins —
   the REF's public board also shows "Open").
5. **Existing spec amendments** (the seed's blast radius):
   `session40-restructure` (1 POST `status: "open"` → `"active"`),
   `session41-careers-family` (3 POST bodies; the zero-board tests gain
   an API route-intercept returning the empty list so the zero-state
   family stays pinned; the with-data count "1 Open Position" →
   "2 Open Positions"; the apply-CTA test scopes `.first()`).

## The TDD protocol

1. **RED**: `tests/e2e/session93-surfaces.spec.ts` — one spec block per
   member (A1–A4 the wizard's step contracts; B the inline form; C the
   editor; D/E/F the dialogs; G the applicant dialog's bare form; H the
   seed + card + badges + stats). Run against the unmodified build —
   expect the full designed-failure set.
2. **GREEN**: the fixes in dependency order — schema/seed → APIs → the
   pages/dialogs.
3. **The gates**: lint 0/0 · tsc ✓ · unit (the seed's unit pins) · build
   116/116 · the FULL E2E suite (the 526 standing + the new session93
   spec + the amended session40/41 specs).
4. **The live post-fix verify**: the :3200 standalone re-read of every
   remediated surface cross-side; the standing mobile-menu cycle + the
   mobile sheet spot-check (the user emphasis); the evidence screenshots
   into `docs/screenshots/`.

## The verification plan (post-GREEN)

- The wizard's four steps re-read on the LOC (labels, placeholders,
  combos, options).
- The Post New Job form + the Job Postings cards + the badges re-read;
  the three seeded jobs visible in the REF's order.
- The workflow editor's labels/options/level builder re-read.
- The three dialogs' geometry + interiors re-read (512×380 / 672×~310 /
  512×172).
- The Add Applicant dialog — the bare form, 512×522.
- The mobile-menu cycle (open → navigate → auto-close) + the wizard's
  contract-type trigger through the R90-B bottom sheet at 390 (the mobile
  member check).
- DB pristine after the E2E (the probe-user cleanup class).

---

## Execution appendix (the round's close-out)

**RED**: `tests/e2e/session93-surfaces.spec.ts` — 11 designed failures confirmed
on the unmodified build (A4 — the wizard's Employment Type four — was already
at parity, the round's one pre-green member).

**GREEN — the implementation order actually executed**:

1. The seed (the three REF jobs, idempotent upserts, the postedAt DESC order
   reproducing the REF's card order) + the schema comment.
2. The jobs API (draft|active default draft + the requirements append).
3. The approval-workflows API (`expense_claims` + the level-object union +
   minAmount/maxAmount/categories; the GET maps the array length).
4. The employee wizard (the five members + `WizardEmployee.baseSalary`).
5. The recruitment page (the controlled tabs + the inline form + the REF
   card + Publish/Unpublish + the Upload CV superset deep-link).
6. The careers + externaljobapplication pages (`status=active`).
7. The workflowconfigpage (the list↔editor swap, the levels builder).
8. The three dialogs (schedule-report-button, payrollreports, hrassistantchat)
   + the recruitmentkanban bare form.
9. The spec amendments: session40 (1 POST body + the two-open count), the
   session41 zero-board intercepts + counts + the `.first()` scoping, the
   R58-8..12/R58-16 unit pins, the purge script's chat sweep.

**The GREEN-phase catches** (all retired): the A2 width threshold (the
half-column is 407 in the 872px card — the assertion tightened to <450), the
base44 wordmark overlay intercepting the Save Workflow click, the stats load
race (the "N candidates" wait), the two-Close strict-mode violation, the
quoted-JSX-text unit pins (the `it` blocks re-anchored to the verbatim
source), and the externaljobapplication page's own `status=open` fetch (found
by the amended apply-CTA spec — the last `open` in the tree).

**The final gates**: lint 0/0 · tsc ✓ · **981/981 unit** (+7 R93 pins) ·
build ✓ 116/116 · **E2E 538/538** (the 526 standing + the 12 new).
