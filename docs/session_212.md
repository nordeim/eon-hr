# Session 212 — Session 92 / Parity Round 91: the dialog-interior inventory round

**Session file numbering:** this file continues the owner-facing chain (session_210.md = the session-91 narrative, session_211.md = the owner's transcript archive of that round). The remediation plan for this round lives at `docs/remediation-plan-session92.md`.

## The round in one paragraph

The r91 sweep read the **at-rest** comboboxes; the r92 queue's insight was that the pages named "selectless at rest" (leavemanagement, documenttracker, payroll, training, announcements, hrletters, …) hold their selects **inside dialogs** — a whole surface the open-state discipline had never reached. The round built the **dialog-interior sweep** (route → the New/Add button → the dialog opens → every interior select opened + read, both sides, plus the full label/input/geometry read) and found **thirteen clone-authored divergences, all TDD-fixed** (RED → GREEN 15/15): the three requestsettings limit selects, the workflowautomation dialog's full event-based rebuild (the round's biggest member), the leave dialogs' seven-type contract, the documenttracker ten-type taxonomy, the payroll grouped form, the task dialog's field set, the goal category/priority, the review raw-five, the offboarding fields, the shift dialog's width, and the payslip's Bonus+Notes contract. The opening read classified the REF **quiet at the 61st deploy** (both sides' fingerprints unchanged), and the at-parity set was verified (assets, task priority, the loans level select, the REF-inert buttons).

## The thirteen members

| # | Surface | The REF's live contract | The clone's invention |
|---|---|---|---|
| R92-A | requestsettings limit category | Finance, HR, IT, Operations, Tools & Equipment, Other, All Categories | Finance, IT, HR, Facilities, Admin |
| R92-B | requestsettings limit period | Daily, Weekly, Monthly, Annual | Monthly, Quarterly, Yearly |
| R92-C | requestsettings limit scope | All Staff, Specific Employee | All Staff, Per Department |
| R92-D | workflowautomation Create Workflow | Workflow Name + **Trigger Type** (New Employee Onboarding/Employee Offboarding/Work Anniversary/Birthday/Probation End/Contract Renewal) + Target Department (Optional) + the **Actions builder** (Action Type: Send Email/Create Task/Send Notification/Assign Template + Delay (days) + Email Message + Add Action), 768 wide | Module (General/Leave/Expense/Recruitment) + Trigger (Manual/…) + Conditions/Actions textareas + an Activate switch |
| R92-E | the leave dialogs (×2) | "Create Leave Request" 672: Employee, the SEVEN leave types, Total Days, Supporting Document (Optional) + Upload Document | "New Leave Request" 512: the four-type seeded set, no Employee/Total Days/upload |
| R92-F | documenttracker Add Document | "Add Document" 576: Employee*, **Document Type\*** (National ID … Professional License, TEN), Document Number ("e.g. A123456"), the real Upload Document file input | a seven-type invented set + "Document Name" + a "Pending upload (no file yet)" checkbox |
| R92-G | payroll Add Payroll Record | "Add Payroll Record" 672: Employee*, Month*, Basic Salary, **Overtime Hours**, the grouped Allowances (Housing/Transport/Food/Other) + Deductions (Late Days/Absent Days/Unpaid Leave/Loans/Insurance/Other) | the flat five-field form with Bonus + Status selects |
| R92-H | taskmanager Create Task | "Create Task": Task Title, Description, **Assign To** (employee select), Priority, Due Date | "New Task" with Title/Assignee + the Status + Project selects |
| R92-I | performancemanagement Set New Goal | "Set Performance Goal" 672: the Category FIVE (Productivity/Quality/Skills/Leadership/Innovation) + **Priority** (Low/Medium/High/Critical) + Target Date | the invented four-category set, no priority, "Due Date" |
| R92-J | evaluations Create Performance Review | "Create Performance Review": Employee*, Review Period* ("e.g. Q2 2025, Annual 2025"), Review Type (the RAW lowercase FIVE incl. promotion), Review Date, **Create & Notify** | "New Review" with Cycle Name + the prettified four + Period Start/End |
| R92-K | offboarding | "Start Offboarding Process": Employee, **Notice Date, Termination Date, Final Settlement (SAR)** | "New Offboarding": Employee, Last Working Day, Reason |
| R92-L | shiftcalendar Assign Shift | 448 wide | 512 wide |
| R92-M | payrollmodule Add Payslip | "Add Payslip": Employee*, **Bonus (SAR), Notes** ("Optional notes..."), Generate Payslip | the full payroll field set |

The schema carried eight new columns (LeaveRequest.attachmentName, PayrollRecord.overtimeHours + notes, Goal.priority, ReviewCycle.reviewDate, OffboardingProcess.noticeDate/terminationDate/finalSettlement, Workflow.triggerType + targetDepartment) and the seed gained the three missing leave types (Personal/Emergency/Paternity — the REF's own popper order, which is NOT alphabetical).

## The verification

- **Gates: lint 0/0 · tsc ✓ · 974/974 unit** (963 + 11 R92 pins) · **build ✓ 116/116** · **E2E 526/526** (the 512 standing + the 14 new, 9.7m, zero flakes) · DB pristine.
- **The live post-fix re-read**: every dialog's labels, option sets, and geometries re-read on the remediated standalone — matching the REF reads verbatim (the offboarding field order caught and fixed at this pass).
- **THE MOBILE-MENU CYCLE GREEN** (the standing user emphasis): open → Training LMS → `/training` → the auto-close superset.
- **The R90-B mobile sheet on the new selects**: the requestsettings category select at 390 opens the bottom sheet with the REF's seven options.
- **The leave dialog at 390**: the full seven-field contract renders.
- **The evidence chain 1485-1509** (13 PNGs — the dashboard, the ten dialog captures, the mobile sheet) → **1643 tracked PNGs**.

## The round's traps

The PWA service-worker offline cache (the SW served the "You're offline" fallback after the :3200 restart — the unregister protocol); the bash-reaper firing on BOTH `nohup` and `setsid` this sandbox (the node-spawn boot survives); the `$`-prefixed password looking like an auth regression in shell probes; the **zoom-in-95 measurement trap** (dialog geometry must be measured after the open animation settles — computed 448, mid-animation 433-446); the **Radix placeholder-at-empty-string** (`value=""` is a value, not the placeholder state); the leave-type order; and the spec's manual-login dead-end (the storageState is the standing pattern).

## The r93 queue

1. The remaining dialog surfaces the sweep could not read — the REF's employee-select interiors on its zero-employee pages render empty (the data-volume class), and the REF's shift-option vocabulary needs a data-populated probe.
2. The seed-data parity question (the REF's 3-job tenant — the standing scoped decision).
3. The dark-band data residuals + the recharts grid class (the standing watches).
4. The 61st-or-newer login ladder (re-armed — both sides quiet this round).
