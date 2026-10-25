# Remediation Plan — Session 91 / Parity Round 90: the open-state inventory round

**The round's frontier.** The r90 close-out's queue: (1) the dropdown-menu
family's responsive question (does the REF swap its dropdowns at mobile the
way r90 verified it swaps its SELECTS?), (2) the other pages' option
inventories cross-side (the open-state read r90 did for assetmanagement,
extended systemically), (3) the standing watches (the dark-band data
residuals, the recharts grid class, the login deploy ladder).

## The opening read (the standing ladder)

The deploy watch detected the **61ST LOGIN DEPLOY** (login JS
`index-CrrEG27W` → `index-34zv7ZR0`; login CSS + app side QUIET at the
post-60th finals). The full standing ladder ran: the fresh login pair
**BYTE-IDENTICAL** (`69aa4241efa1` — the 61st classified NON-VISUAL) +
standing 5/5 + sweep 12/12 + verify-r49 13/13 + verify-r45 13/13 + the
Turnstile census 0 widgets + the experiment-assignment probe (`tagline`
variant, `e3eae294…`/`bc2d81a2…` visitors — the per-visitor system holding).

## The frontier triage

### 1. The dropdown-menu family's responsive question — ANSWERED: NO SWAP (the round's classification finding)

The user menu (the one dropdown live on every page cross-side) was probed
at 390×844 on both sides through the drawer: the REF opens the **standard
Radix popper** (`role=menu` at x=79 y=714 w=192 h=74, `dir="ltr"`, the
shadcn `z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1`
recipe, the two-item interior "My Profile" / "Logout") — and the LOC opens
the **identical popper at the identical geometry**. The responsive
bottom-sheet swap is a SELECT-family-only pattern (r90-B); the dropdown
family keeps the popper at mobile. **AT PARITY — no clone fix.** The finding
is pinned as the R91-D1 guard spec (the no-swap contract).

The probe's traps retired: the Radix dropdown opens on **pointerdown**
(a synthetic `dispatchEvent('click')` opens drawers but NOT Radix menu
triggers — the native CDP click via the snapshot `@ref` element refs is
required); agent-browser 0.39's **XPath selectors are broken** (`//button`
returns "Element not found" even when present — the snapshot-ref path is
the working form); the EAGAIN daemon bounce (the documented cleanup +
re-auth protocol).

### 2. The loans inventories — AT PARITY (member CLOSED)

The New Loan Request dialog reads identical cross-side: the 672×698
geometry, the seven labels (Employee, Loan Type, Amount (SAR), Duration
(Months), Monthly Installment, Reason, Paid From), and the Loan Type
options `Standard Loan | Emergency Loan | Salary Advance | Personal Loan`
— the clone's set verbatim. No fix.

### 3. R91-A — the staffrequests option inventories (CONFIRMED clone-authored defect)

The REF's live filter inventories (the open-state read, desktop poppers):

- **CATEGORY (7)**: `All Categories, Finance, HR, IT, Operations,
  Tools & Equipment, Other`
- **STATUS (7)**: `All Status, Pending, L1 Approved, L2 Approved,
  Approved, Rejected, Completed`

The clone offers `General, IT, HR, Facilities, Finance, Admin` (the
authored set) and `Pending, In Progress, Resolved, Rejected` — both sets
invented. The REF's status vocabulary implies its two-level approval
workflow (L1 → L2 → Approved), a superset of the clone's start/respond
flow.

**The REF's New Request dialog is REF-BROKEN** (the documented class): it
mounts (the console's DialogTitle warning fires) then instantly closes —
the open path's `Error creating audit log: 403` (the REF's own backend
denies the audit-log write for this user) kills the flow. The dialog's
interior is therefore unverifiable on the REF; the FILTER sets are the
ground truth. The clone's working dialog stays the functional superset.

**The fix**: `CATEGORIES` → the REF's set (`finance, hr, it, operations,
tools_equipment, other`); `STATUSES` → the REF's (`pending, l1_approved,
l2_approved, approved, rejected, completed`); the flow vocabulary mapped —
the Start button advances the approval chain (`pending → l1_approved →
l2_approved → approved`) and the Respond dialog's Resolve/Reject set
`completed`/`rejected` (every reachable state stays inside the filter's
vocabulary — the coherence rule); the API PATCH enum + the Zod category
enum follow; the StatusBadge map gains `l1_approved` (info) +
`l2_approved` (purple); the StaffRequest schema's comments updated (free
strings — no migration); the dialog's default category `general` → `it`.

### 4. R91-B — the hrreports multi-entity report builder (CONFIRMED functional divergence — the round's biggest member)

The REF's /hrreports is a **four-entity report builder**; the clone is
employees-only. The live contract (each entity's selects opened + read):

| Entity | Group-by options | Table headers |
|---|---|---|
| Employees | job title, department id, employment status, employment type, start date | full name, job title, department id, employment status, employment type, start date |
| Staff Requests | category, status, priority, amount, created date | employee name, category, status, priority, amount, created date |
| Expense Claims | expense type, amount, status, date | employee name, expense type, amount, status, date |
| Leave Requests | leave type, status, start date, end date | employee name, leave type, status, start date, end date |

- The **status filter is a constant union set**: `All, Pending, Approved,
  Rejected, Active, Completed` across ALL entities (per-entity matching:
  values outside the entity's status vocabulary match nothing — the REF's
  own design).
- The **chart order**: `Bar Chart, Line Chart, Pie Chart` (the clone has
  Bar, Pie, Line — the order fix).
- The **group-by trigger carries the selection across entity switches
  when still valid** (live-observed: "status" survived the
  employees → staff-requests switch) — the carry-if-valid rule.
- The REF's API touches its Base44 entities (`Employee`, `StaffRequest`,
  `ExpenseClaim`, `LeaveRequest`) — the clone's `/api/hr-reports` needs
  the four-source implementation.

**The schemas**: StaffRequest needs `amount Int?` (the report's amount
column + group-by; the REF's dialog is broken so no input surface —
nullable, renders "—"); ExpenseClaim (category → "expense type",
amount ✓, status ✓, date ✓, employee ✓) and LeaveRequest (leaveTypeId →
LeaveType.name, status ✓, start/end ✓, employee ✓) are complete.

**The fix**: the entity select (4), the entity-dependent GROUP_OPTIONS +
TABLE_HEADERS + CSV columns, the 6-value status set, the chart order, the
carry-if-valid groupBy, the per-entity date filter (start/date/created
dates), the API's four-source query + grouping + stats
(totalRecords/uniqueGroups/activeCount — the per-entity "active"
definition), and the chart card's title (`{Entity} by {group}`).

### 5. R91-C — the recruitment option inventories + the Add Applicant contract (CONFIRMED)

The REF's applicants-table filter row (live-read):

- **STATUS (7, lowercase raw values)**: `new, reviewed, shortlisted,
  interview scheduled, offered, hired, rejected` — the REF's raw candidate
  pipeline vocabulary (its kanban uses the 5-stage `stage` field; the
  table filter uses this separate 7-value `status` vocabulary).
- **SORT (3)**: `AI Score, Application Date, Experience` (the clone
  offers 2: AI Score / AI Score: High to Low).

The **Add Applicant dialog** (REF, 512×522, live-read): `Full Name *,
Email *, Phone, Experience (years), Job Posting, Source, Cover Letter`
with the Source options `Direct, Bayt, Linkedin, Facebook, Referral,
Website` — the clone's dialog offers Full Name, Email, Job, Stage (the
Stage select is a clone invention; the REF has no Stage field — new
applicants land in the first column).

**The fix**: the Candidate schema gains `experience Int?`, `source
String?`, `coverLetter String?` (phone ✓ exists); the status filter
offers the REF's 7 verbatim with the stage→status mapping predicate
(applied→new, interviewing→interview scheduled, offer→offered,
hired/rejected→identity; reviewed/shortlisted match nothing — the clone's
5-stage pipeline has no such states, the same effective behavior as the
REF's zero-candidate data); the sort becomes the 3-mode contract
(aiScore desc with nulls last, appliedAt desc, experience desc with
nulls last); the Add Applicant dialog rebuilds to the REF's field set
(the required marks, the years number input, the Source select with the
6 values, the Cover Letter textarea; the Stage select retired — new
applicants default to "applied"); the candidates API input follows.

### 6. The systemic inventory sweep — the at-parity members

The full-route sweep (both sides, every combobox opened + read):
**attendance** (All Staff Report | Individual Employee | Department
Report ✓) and **compliancedashboard** (both filter sets ✓) — AT PARITY.
The no-select pages match (leavemanagement, allleaverequests,
documenttracker, payroll, payrollmodule, training, announcements,
hrletters — both sides at-rest selectless). The recruitment JOB filter is
data-driven both sides (the REF's tenant holds 3 jobs; the clone's seed
holds none — the documented data-volume class, not a defect).

## The plan (TDD)

1. **RED**: `tests/e2e/session91-inventories.spec.ts` — the contract pins:
   - R91-A1/A2: the staffrequests filter sets (7 + 7).
   - R91-B1..B6: the hrreports entity/group-by/status/chart/headers
     contract (the entity switch included).
   - R91-C1..C3: the recruitment filter sets + the Add Applicant field
     contract (labels + the Source options).
   - R91-D1: the user menu at 390 opens the popper (the no-swap guard).
2. **GREEN** (the fixes above, in dependency order):
   1. `prisma/schema.prisma` (+ amount, + experience/source/coverLetter)
      → `db:push` (SQLite — the nullable columns need no migration).
   2. `src/lib/validation.ts` (the staffrequests category enum).
   3. `src/app/api/staff-requests/route.ts` (the PATCH enum +
      the completed/rejected respond flow).
   4. `src/app/(app)/staffrequests/page.tsx` (the option sets + the flow
      vocabulary).
   5. `src/components/shared/status-badge.tsx` (l1_approved, l2_approved).
   6. `src/app/api/hr-reports/route.ts` (the four-source builder).
   7. `src/app/(app)/hrreports/page.tsx` (the multi-entity UI).
   8. `src/app/api/candidates/route.ts` (the new input fields).
   9. `src/app/(app)/recruitment/page.tsx` (the filters + the sort).
   10. `src/app/(app)/recruitmentkanban/page.tsx` (the dialog rebuild).
3. **The unit pins** (`recipes.test.ts`): the option-set constants + the
   schema fields + the badge map members + the carry-if-valid rule.
4. **Full gates**: lint 0/0 · tsc ✓ · unit (950 + the new) · build ✓ ·
   E2E 501 + the new.
5. **The post-fix live re-verify**: the cross-side inventory re-read on
   the remediated build (the same instrument) + the mobile-menu cycle
   (the standing user emphasis) + the mobile sheet spot-check on the new
   selects (the R90-B interplay).
6. **The evidence chain + the docs layer** (the session_210 narrative,
   the AGENTS session-91 layer, the SKILL §103 + version, the count
   lockstep, this worklog).

## The validation sequence

Validate every fix site in source before writing the spec (done — the
option constants, the API enums, the schema fields, the dialog forms all
located above), then RED → GREEN → full gates → the live re-verify on
the seeded standalone (:3200) against the REF.

## The risk register

- The StaffRequest.amount column: nullable — the seeds and the "In
  Repair"-class stats are untouched; the report renders "—" at null
  (the clone's established null convention).
- The status-flow redesign (the l1/l2 chain): no E2E spec pins the old
  in_progress/resolved flow (verified by grep — the flows were untested
  at E2E; the unit layer pins only the option constants).
- The hrreports API change: the `source` literal widens from
  employees-only to the 4-source enum — the page always sends a valid
  source; the old groupBy values (department/status/type) map into the
  new employees field set (department → department id, type → employment
  type) — the default state preserved.
- The Add Applicant dialog rebuild: the kanban DnD specs seed candidates
  through the API (not the dialog) — verified untouched; the
  session58 CTA-fill spec pins only the button color.
- The E2E suite runs at Desktop Chrome — the R90-B mobile sheet
  interplay for the new selects is guarded by the existing session90
  spec's pattern (all selects route through the wrapper).
- jsdom (unit layer) lacks `matchMedia` — no new matchMedia usage in the
  fixes (the sheet logic is the existing wrapper's).

---

# Execution appendix — the round executed

## The GREEN-phase regressions (both retired at one root cause)

The first full E2E run after the four-entity rewrite failed two legacy pins:
**R88-E1** (the hrreports grid-only chart — the new API returned a `""`
catch-all group where the old flow returned the empty set) and **R61-A**
(the 0/0/0 stat values — the new API returned real counts at the initial
state). Both pointed at the same root cause: the old API achieved the
REF-matching zero state BY ACCIDENT (its zod enum rejected the empty
`groupBy` → the null-data default). The fix — the **run-only-when-grouped
contract**: no valid group → the explicit empty report (0/0/0 stats, no
groups, no records). One fix, both pins green.

## The GREEN-phase spec-side catch

The R91-C3 assertion `dialog.getByText("Add Applicant")` matched BOTH the
dialog heading and the submit button (the strict-mode violation) — fixed
to the heading role. The dialog itself was already correct.

## The unit-pin amendment

The R22-E hrreports pin referenced the retired `TABLE_HEADERS` const —
amended to the ENTITY_CONTRACT row that carries the same lowercase texts
(the behavior the pin guards is unchanged: the compact uppercase th recipe
+ the header-only 0-record table).

## The gates at close

lint 0/0 · tsc ✓ · **963/963 unit** (950 + 13 R91 pins: the option sets,
the entity contract, the status union, the chart order, the carry-if-valid
rule, the run-only-when-grouped contract, the schema fields, the badge
members) · build ✓ 116/116 · **E2E 512/512** (the 501 standing + the 11
session91 pins, 9.4m, zero flakes) · DB pristine · `.env.example`
re-verified (the two-variable contract unchanged).

## The live post-fix verification

- **The inventory re-read** (the remediated standalone on :3200): the
  staffrequests sets (7 + 7), the hrreports four entities + the employees'
  five group-bys + Bar/Line/Pie + the union six, the recruitment 7 raw
  statuses + the 3-mode sort — all matching the REF reads verbatim.
- **The entity switch**: the staff-requests table headers render the
  REF's six.
- **The mobile sheet interplay**: the new staffrequests category select
  opens the r90-B bottom-sheet with the seven options.
- **The mobile-menu cycle GREEN** (open → Training LMS → /training →
  the auto-close superset).
- **The evidence chain 1469-1483** (8 dev-server PNGs) → 1623 tracked.
