# Session 214 — Session 93 / Parity Round 92: the unscanned creation surfaces round

**Session file numbering:** this file continues the owner-facing chain (session_212.md = the session-92 narrative, session_213.md = the owner's transcript archive of that round). The remediation plan for this round lives at `docs/remediation-plan-session93.md`.

**The lost first execution.** This round executed once before — the full TDD cycle landed as local commit `5cb73bf`, but the push never completed and a sandbox reset destroyed the workspace before it could. This execution re-derived the round from origin HEAD (`009ee3d`) with fresh REF captures (2026-10-25); every contract the prior transcript recorded was re-read live and CONFIRMED, and the whole RED → GREEN cycle re-run. The lesson joins the standing trap log: a round is not landed until the push is verified, and the SSH wrapper step is part of the round's critical path (the commit hash below is the SECOND execution's).

## The round in one paragraph

The r92 sweep read DIALOG interiors; every creation surface that renders as an **inline view or a full-page editor** was invisible to it — the third open-state blind spot. This round walked those surfaces cross-side and found **eight clone-authored divergences, all TDD-fixed** (RED 11/11 as designed → GREEN 13/13): the employee wizard's five field-level contracts (the step-1 placeholders, the "Reports To" label, the Contract Type four, the Basic Salary field, the no-span field order), the Post New Job **inline form** (a dialog with a different field set before), the workflowconfigpage's **full-page editor** with the levels builder, the Schedule Recurring Report dialog's full field set, the Send Payslips via WhatsApp dialog (the clone fired a bare toast), the New Chat dialog (the clone POSTed directly), the Add Applicant dialog's invented description/placeholder layer, and the job-postings **vocabulary + seed + card** family (draft|active, the REF's three-job tenant, the card's exact recipe). The opening read classified the login surface **NON-VISUAL** (the fresh login pair BYTE-IDENTICAL to the standing `69aa4241…` baseline) with the app side quiet, and the full standing ladder GREEN.

## The eight members

| # | Surface | The REF's live contract | The clone's divergence |
|---|---|---|---|
| R93-A | employees Add Employee (the wizard) | Step 1: the four placeholders (John Doe / john@company.com / john@personal.com / +966 5XX XXX XXX); Step 2: **Reports To** in the LEFT column; Step 3: **Contract Type four** (Indefinite/Fixed Term/Probation/Internship) + **Basic Salary (SAR)** (number, ph "0") + the 3×2 no-span order | No placeholders; "Manager" with sm:col-span-2; two contract types; no salary field; GOSI spanned |
| R93-B | recruitment Post New Job | An **INLINE FORM CARD** (shadow-xl, the indigo→blue gradient header) between the tab bar and the filter row: Job Title* \| Department* / Location \| Employment Type (Full Time/Part Time/Contract/**Internship**) / Job Description* / Requirements (ph "List required skills, experience, qualifications...") + Cancel/Create Job | A dialog with Type/Openings fields, invented placeholders, a "Post Job" CTA |
| R93-C | workflowconfigpage New Workflow | A **full-page editor**: ← Back + Workflow Name / Applies To (**Staff Requests, Expense Claims**) / Active switch / Min-Max Amount (SAR) / Categories (comma separated, blank = all) + the **levels builder** (blue numbered circle + name input w-48 + trash; Approver Type **six**; Auto-approve hours; the Approver Emails field rides the Specific User(s) type; Add Level) + Cancel/Save Workflow | A four-field dialog (name/levels count/appliesTo/threshold) |
| R93-D | advancedanalytics Schedule Report | "Schedule Recurring Report" 512×380: Report Name / Report Type (**six**) \| Frequency (**four**) same row / Recipients (ph "email@company.com") + Add; Cancel/Schedule Report; no description | A Frequency-only "Schedule" dialog with a description |
| R93-E | payrollreports Send Payslips via WhatsApp | A **672×310 dialog**: Select Payroll Month + the month input + **Send All** on one row; a data-driven payslip area ("No payrolls found for {period}"); Close | A bare toast on click |
| R93-F | hrassistantchat New Chat | "Start New Chat" 512×172: "Project name (optional)" + Cancel/Create | The POST fired directly, no dialog |
| R93-G | recruitmentkanban Add Applicant | The **bare form** 512×522: no description, NO placeholders, the 3-row Cover Letter textarea | A description line + five invented placeholders + a 4-row textarea (568 tall) |
| R93-H | the job postings family | The status vocabulary **draft \| active** (raw lowercase badges: slate-100/slate-600 and green-100/green-700, rounded-md semibold); the REF's **three-job tenant** (HR Manager draft, HR Director draft, System Admin active — with the full verbatim description blobs); the card: text-lg title + "dept · location" + badge + line-clamp-2 + "N applicants" + the Upload CV outline button; the stats count ACTIVE jobs; the public board lists only active | The open/paused/closed vocabulary, an empty board, a different card design, "open" on the public pages |

The schema carried no new columns (JobPosting's free-string `status` carries the new vocabulary); the seed gained the three REF jobs (idempotent upserts whose update arm also carries `postedAt` — the convergence rule); the jobs API's status enum became `draft | active` (default draft) and POST accepts `requirements` (appended to the description blob — the REF's own descriptions inline their responsibilities); the approval-workflows API gained `expense_claims` + the editor's level-object array and amount window (the Zod union keeps the settings page's legacy dialog shape working).

## The verification

- **Gates: lint 0/0 · tsc ✓ · 981/981 unit** (974 + 7 R93 pins; the R58-8..12/R58-16 pins amended to the new openers) · **build ✓ 116/116** · **E2E 538/538** (the 526 standing + the 12 new session93 members — the session40/41 careers specs amended for the seed: the zero-board tests via the API route-intercept, the with-data counts at two, the apply-CTA scoped to the posted card; the externaljobapplication page's fetch moved to `status=active`).
- **The live post-fix re-read**: every remediated surface re-read on the remediated standalone (below).
- **THE MOBILE-MENU CYCLE GREEN** (the standing user emphasis) + the wizard's Contract Type through the R90-B bottom sheet at 390.
- **DB pristine** after the E2E (the probe chat swept by the purge script's new `E2E `-prefixed chat sweep — the ai-chat API has no DELETE route).

## The round's traps

The lost-push lesson (a round is not landed until the push is verified — the wrapper step is part of the critical path); the floating **base44 wordmark badge** intercepting pointer events over the workflow editor's footer (hidden for the click in the spec); the **stats load race** (the recruitment stats read before the jobs fetch settles — the "N candidates" wait); the **two Close buttons** in the payslips dialog (the footer's + the built-in X — strict-mode scoping); and the R91-C3 spec's assertion set being placeholder-free (the R93-G fix needed no amendment).

## The r94 queue

1. The remaining REF-inert buttons (payrollengine/payrollmodule — the clone's working supersets stay; a final classification sweep of the remaining unscanned routes if any).
2. The dark-band data residuals + the recharts grid class (the standing watches).
3. The login ladder — re-armed at the current generation (the 62nd-or-newer line, NON-VISUAL this round).
4. The seeded-tenant's with-data surfaces now that the jobs exist (the applicant-pipeline with-data contracts — the Add Applicant flow against the three seeded jobs).
