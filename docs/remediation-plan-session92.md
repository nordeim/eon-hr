# Remediation Plan — Session 92 / Parity Round 91: the dialog-interior inventory round

**The round's frontier.** The r91 close-out's queue: (1) the remaining
unopened dialog interiors — the r91 sweep read the AT-REST comboboxes only;
the pages named "selectless at rest" (leavemanagement, documenttracker,
payroll, training, announcements, hrletters, …) hold their selects INSIDE
dialogs, (2) the named members — the requestsettings approver chain + the
workflowautomation forms, (3) the standing watches (the seed-data parity
question, the recharts grid class, the login ladder — re-armed at the 61st).

## The opening read (the standing ladder)

The r92 deploy watch read **BOTH SIDES QUIET** — the 61st login deploy still
the last observed generation (login JS `index-34zv7ZR0`, login CSS
`index-BlYK4iZ6`, app JS `C-IrDy5f`, app CSS `BGNH4KkS`), the
experiment-assignment probe (`tagline`), the Turnstile census 0 widgets. No
ladder required (no new deploy to classify). The REF re-auth fired once
mid-read (the documented session-expiry class) and the PWA service-worker
offline-cache trap retired on the LOC side (the SW served the offline
fallback after the :3200 restart — unregister + caches cleared; the
bash-reaper killed the nohup'd server twice — the node-spawn detached boot
re-adopted).

## The frontier instrument

`r92-dialog-sweep.mjs` / `r92-dialog-sweep2.mjs` (route → button label →
dialog open → every interior select opened + read) + `r92-dialog-deep.mjs` /
`r92-dialog-deep2.mjs` (the full label/input/select/button + geometry read)
— run on both sides (REF + the seeded standalone on :3200), 15 routes.

## The findings — THIRTEEN members

### The at-parity set (no fix)

- **assets Add Asset**: the type set `Laptop, Desktop, Phone, Tablet,
  Monitor, Other` + the assignee select + the 512×372 geometry — IDENTICAL.
- **taskmanager Priority**: `Low, Medium, High, Urgent` — IDENTICAL.
- **shiftcalendar Assign Shift labels**: `Employee, Shift` — IDENTICAL (the
  option sets are data-driven both sides — the documented data-volume class).
- **requestsettings approval level**: `Level 1 (First), Level 2,
  Level 3 (Final)` — IDENTICAL.
- **the REF-inert buttons** (leavemanagement/expenses/templates "New X" +
  training/announcements/hrletters with NO creation button at all): the
  REF's buttons dispatch no dialog — the clone's working dialogs stay the
  functional supersets (the documented pattern).

### R92-A/B/C — the requestsettings limit selects (three invented sets)

REF (live-read, desktop poppers):
- **Limit category (7)**: `Finance, HR, IT, Operations, Tools & Equipment,
  Other, All Categories` — the clone offers `Finance, IT, HR, Facilities,
  Admin`.
- **Limit period (4)**: `Daily, Weekly, Monthly, Annual` — the clone offers
  `Monthly, Quarterly, Yearly`.
- **Limit scope (2)**: `All Staff, Specific Employee` — the clone offers
  `All Staff, Per Department`.

**Fix**: the three option sets (page-level constants; the limits are
in-memory — no schema).

### R92-D — the workflowautomation Create Workflow dialog (the round's biggest member)

REF "Create Automated Workflow" (768×617, live-read): `Workflow Name`
(placeholder "e.g., Welcome New Hires") · **Trigger Type** (6:
`New Employee Onboarding, Employee Offboarding, Work Anniversary, Birthday,
Probation End, Contract Renewal`) · `Target Department (Optional)` (text,
"Leave empty for all") · the **Actions** section — **Action Type** (4:
`Send Email, Create Task, Send Notification, Assign Template`) + `Delay
(days)` (number) + `Email Message` (text, "Welcome to the team!") + the `Add
Action` button · `Cancel / Create Workflow` footer. The clone's dialog is an
invention (`Module: General/Leave/Expense/Recruitment` + `Trigger: Manual
trigger/When a record is created/When a status changes/On a schedule` +
Conditions/Actions textareas + an Activate switch).

**Fix**: the dialog rebuilt to the REF's contract; the Workflow schema gains
`triggerType` + `targetDepartment` (the actions column carries the new JSON
list shape: `[{type, delayDays, message}]`); the API Zod follows; the list
renders the trigger-type label; the page's MODULES/TRIGGERS constants
retired.

### R92-E — the leave dialogs (both pages)

REF "Create Leave Request" (672×582, live-read on /allleaverequests; the
/leavemanagement button is REF-inert): `Employee` (select) · **Leave Type**
(7: `Annual Leave, Sick Leave, Personal Leave, Emergency Leave, Unpaid
Leave, Maternity Leave, Paternity Leave`) · `Total Days` (number) · `Start
Date` · `End Date` · `Reason` · `Supporting Document (Optional)` (file +
`Upload Document` button) · `Cancel / Submit Request`. The clone's "New
Leave Request" (512×404) offers the 4-type seeded set, no Employee/Total
Days/Supporting Document.

**Fix**: both pages' dialogs (the shared field contract; the 672 geometry);
the seed gains the 3 missing leave types (Personal/Emergency/Paternity);
the schema gains `attachmentName String?`; the API accepts the optional
`employeeId` (the dialog's Employee select) + `attachmentName`.

### R92-F — the documenttracker Add Document dialog

REF "Add Document" (576×528, live-read): `Employee *` (select) · **Document
Type *** (10: `National ID, Passport, Iqama, Visa, Medical Certificate,
Driving License, Work Permit, Education Certificate, Professional License,
Other`) · `Document Number` (text, "e.g. A123456") · `Issue Date` ·
`Expiry Date` · `Upload Document` (real file input) · `Notes` (text,
"Optional notes") · `Cancel / Save Document`. The clone's dialog (512×530)
offers a 7-type invented set + a "Document Name" field + a "Pending upload
(no file yet)" placeholder.

**Fix**: the type taxonomy (the 10 REF values, verbatim, in the REF's
order); "Document Name" → "Document Number" (placeholder "e.g. A123456");
the real file input (the name stored, `fileUrl`); the 576 geometry; the
label "Document Type *" with the required mark; `Save Document` footer.

### R92-G — the payroll Add Payroll Record dialog

REF "Add Payroll Record" (672×600, live-read): `Employee *` (select) ·
`Month *` (month input) · `Basic Salary` (number) · `Overtime Hours`
(number) · **Allowances** (a GROUPED block: `Housing, Transport, Food,
Other` — 4 number inputs) · **Deductions** (a GROUPED block: `Late Days,
Absent Days, Unpaid Leave, Loans, Insurance, Other` — 6 number inputs) ·
`Cancel / Create Payroll`. The clone's "Add Payroll" (512×488) offers
Employee/Period/Basic Salary (SAR)/Allowances (SAR)/Bonus (SAR)/Deductions
(SAR)/Status — the Bonus + Status fields are dialog inventions, the groups
are absent.

**Fix**: the dialog rebuilt to the REF's grouped contract (the sub-inputs
summed into `allowances`/`deductions`; `overtimeHours` stored in the new
column); the schema gains `overtimeHours Int @default(0)` + `notes String?`
(the payslip dialog's field); Bonus stays in the schema (the payrollmodule
table's verified-at-parity Bonus column) but leaves the dialog; Status
leaves the dialog (new records default draft).

### R92-H — the taskmanager Create Task dialog

REF "Create Task" (512×498, live-read): `Task Title, Description, Assign To`
(employee select), `Priority` (Low/Medium/High/Urgent — at parity ✓),
`Due Date` · `Cancel / Create Task`. The clone's "New Task" (512×548) adds
`Status` (Backlog/To Do/…) + `Project` selects and labels the assignee
"Assignee" / the title "Title".

**Fix**: the labels (Task Title, Assign To); the Status + Project selects
retired from the dialog (new tasks default `backlog` + no project — the
kanban DnD still assigns both); the title "Create Task".

### R92-I — the performancemanagement Set Performance Goal dialog

REF "Set Performance Goal" (672×498, live-read): `Employee` (select) · `Goal
Title` · `Description` · **Category** (5: `Productivity, Quality, Skills,
Leadership, Innovation`) · **Priority** (4: `Low, Medium, High, Critical`) ·
`Target Date` · footer. The clone's "Set New Goal" (512×476) offers the
invented Category (`Performance, Development, Okr, Kpi`), no Priority, and
"Due Date" + "Description (optional)".

**Fix**: the category set (5), the Priority select (the schema gains
`priority String @default("medium")`), "Target Date" (the label), the 672
geometry, the "(optional)" suffix dropped.

### R92-J — the evaluations Create Performance Review dialog

REF "Create Performance Review" (512×396, live-read): `Employee *` (select)
· `Review Period *` (text, "e.g. Q2 2025, Annual 2025") · **Review Type**
(5 RAW lowercase: `quarterly, annual, probation, promotion, 360`) ·
`Review Date` (date) · `Cancel / Create & Notify`. The clone's "New Review"
(512×362) offers Cycle Name + Review Type (`Annual, Quarterly, Probation,
360°` — wrong case, missing `promotion`) + Period Start/Period End.

**Fix**: the dialog rebuilt to the REF's field set; the ReviewCycle schema
gains `reviewDate DateTime?`; the type enum gains `promotion`; the submit
creates the cycle (name = Review Period) + the employee's first Review row
(the Create & Notify semantics); the type badge renders the raw values.

### R92-K — the offboarding Start Offboarding Process dialog

REF "Start Offboarding Process" (512×372, live-read): `Employee` (select) ·
`Notice Date` · `Last Working Day` · `Termination Date` · `Final Settlement
(SAR)` (number) · `Cancel / Start Offboarding`. The clone's "New
Offboarding" (512×424) offers Employee/Last Working Day/Reason.

**Fix**: the three new date/settlement fields (the schema gains
`noticeDate`, `terminationDate`, `finalSettlement Int?`), the Reason field
retired from the dialog (the column stays), the title/button ("Start
Offboarding Process" / "Start Offboarding").

### R92-L — the shiftcalendar Assign Shift geometry

REF 448×316 (`max-w-md`) vs the clone's 512×300 — the width fix.

### R92-M — the payrollmodule Add Payslip dialog

REF "Add Payslip" (512×372, live-read): `Employee *` (select) · `Bonus
(SAR)` (number) · `Notes` (text, "Optional notes...") · `Cancel / Generate
Payslip`. The clone's "Add Payslip" (512×416) offers the full payroll field
set (Period/Basic/Allowances/Bonus/Deductions).

**Fix**: the dialog reduced to the REF's Bonus+Notes contract (the payslip
generated from the employee's baseSalary for the current period + the
bonus + notes stored).

## The plan (TDD)

1. **RED**: `tests/e2e/session92-dialogs.spec.ts` — the contract pins:
   - R92-A/B/C: the requestsettings three option sets.
   - R92-D: the workflow dialog (the 6 triggers + the 4 actions + the
     labels + the Add Action presence).
   - R92-E: the leave dialog (the 7 types + the labels + the file input).
   - R92-F: the document type 10 + the Document Number placeholder.
   - R92-G: the payroll dialog's grouped labels (Housing/Transport/Food/
     Late Days/…/Overtime Hours; NO Bonus/Status fields).
   - R92-H: the task dialog labels (Task Title/Assign To; NO Status select).
   - R92-I: the goal category 5 + the priority 4 + Target Date.
   - R92-J: the review dialog (the 5 raw types + Review Period/Review Date
     + Create & Notify).
   - R92-K: the offboarding labels (Notice Date/Termination Date/Final
     Settlement).
   - R92-L: the shift dialog width (448).
   - R92-M: the payslip dialog (Bonus + Notes + Generate Payslip).
2. **GREEN** (the fixes, in dependency order):
   1. `prisma/schema.prisma` (the 8 new columns) → `db:push`.
   2. `prisma/seed.ts` (+3 leave types).
   3. The API layer: documents (the 10-type enum), goals (the category 5 +
      priority), review-cycles (the type enum + reviewDate + the employee
      review), leave-requests (employeeId + attachmentName), payroll
      (overtimeHours + notes), workflows (the new contract), offboarding
      (the new fields), tasks (no change — the page-level default).
   4. The pages: requestsettings, workflowautomation, allleaverequests +
      leavemanagement, documenttracker, payroll, taskmanager,
      performancemanagement, evaluations, offboarding, shiftcalendar,
      payrollmodule.
3. **The unit pins** (`recipes.test.ts`): the option constants + the schema
   fields + the label contracts.
4. **Full gates**: lint 0/0 · tsc ✓ · unit (963 + the new) · build ✓ ·
   E2E (512 + the new).
5. **The post-fix live re-verify**: the same dialog instruments on the
   remediated build + the mobile-menu cycle (the standing user emphasis) +
   the mobile sheet spot-check on the new selects.
6. **The evidence chain + the docs layer** (the session_212 narrative, the
   AGENTS session-92 layer, the SKILL §104 + version, the count lockstep,
   this worklog).

## The validation sequence

Validate every fix site in source before writing the spec (the option
constants, the API enums, the schema fields, the dialog forms — done, the
read lists above), then RED → GREEN → full gates → the live re-verify on
the seeded standalone (:3200) against the REF.

## The risk register

- **The leave-type seed change**: the LeaveBalance rows are per-type — the
  3 new types get no balances (the REF's own zero-balance state for
  non-core types); the leave PAGES that render balance tables were verified
  at-rest with the 4-type seed — the new types appear in the leave-type
  SELECTS only where the dialog feeds from `/api/leave-requests`'s
  leaveTypes list. Verify the leavemanagement page's at-rest tables for
  balance-row diffs (the documented data-volume class — the REF's own
  tenant renders its own types).
- **The payroll dialog restructure**: the payroll PAGES' table columns
  (Bonus on payrollmodule etc.) are verified-at-parity and untouched; only
  the dialog changes. The API keeps accepting the flat
  allowances/deductions sums (the page sums the groups client-side).
- **The taskmanager Status/Project retirement**: the kanban DnD specs seed
  tasks through the API (not the dialog) — verified untouched; the
  dialog-created tasks default to backlog + no project (the first column —
  the REF's own behavior for new tasks).
- **The evaluations mapping**: the REF's dialog (Employee + Review Period
  text + Review Date) maps to the cycle model (name/type/reviewDate) + an
  auto-created employee Review row — the documented data-volume class
  decision (the REF's cycle list is zero-data, unverifiable).
- **The offboarding fields**: nullable — the seed's checklist flow
  untouched.
- **The R91-D1 guard + the R90-B sheet**: the new selects route through the
  wrapper (the mobile sheet interplay guarded by the session90 spec's
  pattern).

---

# Execution appendix — the round executed

## The GREEN-phase catches (four retired)

1. **The spec's manual login** (the first full run failed 14/14 at the
   beforeEach): the suite runs on the shared storageState (the standing
   pattern — `auth.setup.ts` signs in once); a manual `/login` flow inside
   `beforeEach` dead-ends when the state is already authed. Removed — the
   storageState carries the session.
2. **The zoom-in-95 measurement trap** (R92-L): the Assign Shift width read
   446 mid-animation — computed 448, the `data-[state=open]:zoom-in-95`
   scale still settling. The spec now waits 450ms before measuring (the
   capture-settle rule generalized to dialogs).
3. **The Radix placeholder-at-empty-string trap** (R92-F): `value=""` is an
   ACTUAL value to Radix — the placeholder renders only at `undefined`. The
   documenttracker type select maps the empty state through
   `form.type || undefined`.
4. **The leave-type ORDER** (R92-E): the REF's popper renders Annual, Sick,
   Personal, Emergency, Unpaid, Maternity, Paternity — NOT alphabetical.
   The API now emits the canonical order (the unknown types tail the list).

## The flaky-race fix (functional)

The leave dialogs' type trigger could render its placeholder when the page's
fetch had not yet delivered `leaveTypes` at open time — the form's
`useState` initializer only runs once. The dialogs' open-effect now re-syncs
on `[open, employees, leaveTypes]` so a late-arriving list populates the
default (a real UX fix, not just test appeasement).

## The offboarding field order

The REF's dialog order is Notice Date → Last Working Day → Termination
Date → Final Settlement; the first implementation rendered Last Working Day
before Notice — reordered at the live re-verify.

## The unit-pin amendment

**R35-C3** pinned the documents API's five-type taxonomy as a single
`as const` line — amended to the session92 ten-type dialog taxonomy + the
legacy-values union (the compliance page's own filter set remains a
different verified surface, untouched).

## The gates at close

lint 0/0 · tsc ✓ · **974/974 unit** (963 + 11 R92 pins: the three
requestsettings sets, the workflow trigger/action vocabularies, the leave
contract + the seed types, the document ten + number field, the payroll
groups + the schema column, the task labels, the goal category/priority
sets + the schema column, the review raw five + the schema column, the
offboarding fields + the schema columns, the payslip contract) · build ✓
116/116 · **E2E 526/526** (the 512 standing + the 14 session92 pins, 9.7m,
zero flakes) · DB pristine · `.env.example` re-verified (the two-variable
contract unchanged).

## The live post-fix verification

- **The deep dialog re-reads** (the remediated standalone on :3200): the
  payroll "Add Payroll Record" 672 with the grouped labels; the offboarding
  "Start Offboarding Process" 512 with the REF's field order; the
  documenttracker "Add Document" 576 with the ten-type popper; the
  shiftcalendar "Assign Shift" at the settled 448; the leave "Create Leave
  Request" 672 with the seven types in the REF's order — all matching the
  REF reads verbatim.
- **The sweep2 re-read**: the task Create Task (Task Title/Assign To, no
  Status/Project), the goal Set New Goal 672 (the category five + the
  priority four + Target Date), the review Create Performance Review (the
  raw lowercase five + Review Period/Date), the workflow dialog 768 (the
  six triggers + the four actions + the Actions builder).
- **The requestsettings sweep**: the category seven + the period four + the
  scope two, all matching.
- **THE MOBILE-MENU CYCLE GREEN** (the standing user emphasis): the drawer
  opens via the Toggle Sidebar snapshot ref, the Training LMS navigation
  lands `/training`, the drawer auto-closes (the documented superset).
- **THE R90-B MOBILE SHEET GREEN on the new selects**: the requestsettings
  category select at 390 opens the bottom sheet with the REF's seven
  options (390-wide sheet, the "Select an option" h2).
- **THE LEAVE DIALOG AT 390**: the full seven-label contract renders
  (Employee … Supporting Document (Optional)) — the REF's mobile form
  (the REF's own /allleaverequests is desktop-only readable; its
  /leavemanagement button is inert).

## The evidence chain 1485-1509

13 PNGs: the dev dashboard, the workflow dialog + its trigger popper, the
leave/document/payroll/task/goal/review/offboarding/payslip dialogs, the
requestsettings category popper, the mobile sheet → **1643 tracked PNGs**
(1630 + 13).

## The round's instruments

`r92-deploy-watch.mjs` (the 61st finals + the experiment probe — BOTH SIDES
QUIET) · `r92-structure-read.mjs` · `r92-btn-census.mjs` ·
`r92-inventory-sweep.mjs` (the r91 instrument re-run on the new routes) ·
`r92-dialog-sweep.mjs` / `r92-dialog-sweep2.mjs` (the frontier instrument —
the dialog-interior reader, both sides) · `r92-dialog-deep.mjs` /
`r92-dialog-deep2.mjs` (the full label/input/geometry read) ·
`r92-wf-dialog-probe.mjs` · `r92-width-probe.mjs` (the zoom-in-95 root
cause) · `r92-docprobe.mjs` (the placeholder root cause) ·
`r92-mobile-verify.mjs` (the cycle + the sheet + the 390 leave dialog) ·
`r92-screenshots.mjs`.

## The traps retired this round

- **The PWA service-worker offline cache**: the LOC session's SW served the
  "You're offline" fallback after the :3200 restart mid-round — the
  unregister + `caches.delete` sweep + re-auth protocol.
- **The bash-reaper (twice more)**: `nohup ... &` and `setsid ... &` BOTH
  died with the tool shell this sandbox — the node-spawn detached boot
  (`r90-boot3200.mjs`) is the only surviving form (the SEVENTEENTH
  consecutive sandbox).
- **The session-expiry class**: the REF re-auth fired once mid-read (the
  documented between-rounds cookie protocol).
- **The `$`-prefixed password in shell contexts**: the probe used
  `Abcd1234` where the seeded password is `$Abcd1234` — the 307-to-/login
  read looked like an auth regression before the DB hash check.
- **The zoom-in-95 dialog measurement** (the capture-settle rule extended
  to dialogs: measure AFTER the open animation settles).
- **The Radix placeholder-at-empty-string** (the placeholder renders only
  at `undefined`).
