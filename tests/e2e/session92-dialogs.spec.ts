import { expect, test } from "@playwright/test";

// Session 92 — the dialog-interior inventory round (the r91 sweep read the
// AT-REST comboboxes only; the selects inside the DIALOGS were never opened
// cross-side before this round).
//
//   R92-A/B/C the requestsettings limit selects — the REF's category seven
//         (Finance/HR/IT/Operations/Tools & Equipment/Other/All Categories),
//         the period four (Daily/Weekly/Monthly/Annual), the scope two
//         (All Staff/Specific Employee); the clone offered three invented
//         sets.
//   R92-D the workflowautomation Create Workflow dialog — the REF's
//         event-based builder: Workflow Name + Trigger Type (New Employee
//         Onboarding/Employee Offboarding/Work Anniversary/Birthday/
//         Probation End/Contract Renewal) + Target Department (Optional) +
//         the Actions block (Action Type: Send Email/Create Task/Send
//         Notification/Assign Template + Delay (days) + Email Message +
//         Add Action); the clone's Module/Trigger/Conditions form was an
//         invention.
//   R92-E the leave dialogs — the REF's Create Leave Request: Employee +
//         the SEVEN leave types (Personal/Emergency/Paternity were missing)
//         + Total Days + Supporting Document (file); geometry 672 wide.
//   R92-F the documenttracker Add Document — the REF's TEN-type taxonomy +
//         Document Number ("e.g. A123456") + the real Upload Document input;
//         geometry 576 wide.
//   R92-G the payroll Add Payroll Record — the REF's grouped form: Overtime
//         Hours + Allowances (Housing/Transport/Food/Other) + Deductions
//         (Late Days/Absent Days/Unpaid Leave/Loans/Insurance/Other); NO
//         Bonus/Status fields in the dialog; geometry 672 wide.
//   R92-H the taskmanager Create Task — Task Title/Assign To (employee
//         select); the Status + Project selects retired from the dialog.
//   R92-I the performancemanagement Set Performance Goal — the REF's
//         Category five (Productivity/Quality/Skills/Leadership/
//         Innovation) + Priority (Low/Medium/High/Critical) + Target Date;
//         geometry 672 wide.
//   R92-J the evaluations Create Performance Review — the REF's Employee +
//         Review Period + Review Type (quarterly/annual/probation/
//         promotion/360 — RAW lowercase) + Review Date + Create & Notify.
//   R92-K the offboarding Start Offboarding Process — Notice Date/
//         Termination Date/Final Settlement (SAR) alongside Employee +
//         Last Working Day; the Reason field retired.
//   R92-L the shiftcalendar Assign Shift — the REF's 448px width.
//   R92-M the payrollmodule Add Payslip — the REF's Bonus (SAR) + Notes +
//         Generate Payslip contract.

const REF_LIMIT_CATEGORIES = ["Finance", "HR", "IT", "Operations", "Tools & Equipment", "Other", "All Categories"];
const REF_LIMIT_PERIODS = ["Daily", "Weekly", "Monthly", "Annual"];
const REF_LIMIT_SCOPES = ["All Staff", "Specific Employee"];
const REF_WF_TRIGGERS = ["New Employee Onboarding", "Employee Offboarding", "Work Anniversary", "Birthday", "Probation End", "Contract Renewal"];
const REF_WF_ACTIONS = ["Send Email", "Create Task", "Send Notification", "Assign Template"];
const REF_LEAVE_TYPES = ["Annual Leave", "Sick Leave", "Personal Leave", "Emergency Leave", "Unpaid Leave", "Maternity Leave", "Paternity Leave"];
const REF_DOC_TYPES = ["National ID", "Passport", "Iqama", "Visa", "Medical Certificate", "Driving License", "Work Permit", "Education Certificate", "Professional License", "Other"];
const REF_GOAL_CATEGORIES = ["Productivity", "Quality", "Skills", "Leadership", "Innovation"];
const REF_GOAL_PRIORITIES = ["Low", "Medium", "High", "Critical"];
const REF_REVIEW_TYPES = ["quarterly", "annual", "probation", "promotion", "360"];

// Auth: the shared storageState from tests/e2e/auth.setup.ts (the standing
// pattern — no manual login in beforeEach).

async function openOptions(page: import("@playwright/test").Page, trigger: string) {
  const sel = page.getByRole("combobox").filter({ hasText: new RegExp(trigger) }).first();
  await sel.click();
  const box = page.getByRole("listbox").last();
  const opts = await box.getByRole("option").allInnerTexts();
  await page.keyboard.press("Escape");
  return opts.map((o) => o.trim());
}

test.describe("session92 — the dialog-interior inventory round", () => {
  test("R92-A: requestsettings limit category offers the REF's seven", async ({ page }) => {
    await page.goto("/requestsettings");
    const opts = await openOptions(page, "Finance");
    expect(opts).toEqual(REF_LIMIT_CATEGORIES);
  });

  test("R92-B: requestsettings limit period offers the REF's four", async ({ page }) => {
    await page.goto("/requestsettings");
    const opts = await openOptions(page, "Monthly");
    expect(opts).toEqual(REF_LIMIT_PERIODS);
  });

  test("R92-C: requestsettings limit scope offers the REF's two", async ({ page }) => {
    await page.goto("/requestsettings");
    const opts = await openOptions(page, "All Staff");
    expect(opts).toEqual(REF_LIMIT_SCOPES);
  });

  test("R92-D: the Create Workflow dialog renders the REF's event-based contract", async ({ page }) => {
    await page.goto("/workflowautomation");
    await page.getByRole("button", { name: "Create Workflow" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    for (const label of ["Workflow Name", "Trigger Type", "Target Department (Optional)", "Action Type", "Delay (days)", "Email Message"]) {
      await expect(dialog.getByLabel(label, { exact: true })).toBeVisible();
    }
    await expect(dialog.getByRole("button", { name: "Add Action" })).toBeVisible();
    await expect(dialog.getByLabel("Module")).toHaveCount(0);
    await expect(dialog.getByLabel("Trigger", { exact: true })).toHaveCount(0);
    await expect(dialog.getByLabel("Conditions (comma-separated)")).toHaveCount(0);
    const triggers = await openOptions(page, "New Employee Onboarding");
    expect(triggers).toEqual(REF_WF_TRIGGERS);
    const actions = await openOptions(page, "Send Email");
    expect(actions).toEqual(REF_WF_ACTIONS);
  });

  test("R92-E: the leave dialog renders the REF's seven types + field set (allleaverequests)", async ({ page }) => {
    await page.goto("/allleaverequests");
    await page.getByRole("button", { name: "New Leave Request" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    for (const label of ["Employee", "Leave Type", "Total Days", "Start Date", "End Date", "Reason"]) {
      await expect(dialog.getByLabel(label, { exact: true }).first()).toBeVisible();
    }
    await expect(dialog.getByText("Supporting Document (Optional)")).toBeVisible();
    await expect(dialog.locator('input[type="file"]')).toHaveCount(1);
    const types = await openOptions(page, "Annual Leave");
    expect(types).toEqual(REF_LEAVE_TYPES);
  });

  test("R92-E2: the leave dialog renders the same contract on leavemanagement", async ({ page }) => {
    await page.goto("/leavemanagement");
    await page.getByRole("button", { name: "New Leave Request" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    for (const label of ["Employee", "Leave Type", "Total Days", "Start Date", "End Date"]) {
      await expect(dialog.getByLabel(label, { exact: true }).first()).toBeVisible();
    }
    const types = await openOptions(page, "Annual Leave");
    expect(types).toEqual(REF_LEAVE_TYPES);
  });

  test("R92-F: the Add Document dialog renders the REF's ten-type taxonomy + number field", async ({ page }) => {
    await page.goto("/documenttracker");
    await page.getByRole("button", { name: "Add Document" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("Document Number")).toBeVisible();
    await expect(dialog.getByPlaceholder("e.g. A123456")).toBeVisible();
    await expect(dialog.getByText("Upload Document")).toBeVisible();
    await expect(dialog.locator('input[type="file"]')).toHaveCount(1);
    await expect(dialog.getByLabel("Document Name")).toHaveCount(0);
    const types = await openOptions(page, "Select type");
    expect(types).toEqual(REF_DOC_TYPES);
  });

  test("R92-G: the Add Payroll Record dialog renders the REF's grouped form", async ({ page }) => {
    await page.goto("/payroll");
    await page.getByRole("button", { name: "Add Payroll" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    for (const label of ["Employee *", "Month *", "Basic Salary", "Overtime Hours", "Housing", "Transport", "Food", "Other", "Late Days", "Absent Days", "Unpaid Leave", "Loans", "Insurance"]) {
      await expect(dialog.getByLabel(label, { exact: true }).first()).toBeVisible();
    }
    // the dialog inventions retired: no Bonus field, no Status select
    await expect(dialog.getByLabel("Bonus")).toHaveCount(0);
    await expect(dialog.getByLabel("Status")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Create Payroll" })).toBeVisible();
  });

  test("R92-H: the Create Task dialog renders the REF's five fields (no Status/Project selects)", async ({ page }) => {
    await page.goto("/taskmanager");
    await page.getByRole("button", { name: "New Task" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    for (const label of ["Task Title", "Description", "Assign To", "Priority", "Due Date"]) {
      await expect(dialog.getByLabel(label, { exact: true })).toBeVisible();
    }
    await expect(dialog.getByLabel("Status")).toHaveCount(0);
    await expect(dialog.getByLabel("Project")).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: "Create Task" })).toBeVisible();
  });

  test("R92-I: the Set Performance Goal dialog renders the REF's category five + priority", async ({ page }) => {
    await page.goto("/performancemanagement");
    await page.getByRole("button", { name: "Set New Goal" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    for (const label of ["Employee", "Goal Title", "Description", "Category", "Priority", "Target Date"]) {
      await expect(dialog.getByLabel(label, { exact: true }).first()).toBeVisible();
    }
    await expect(dialog.getByLabel("Due Date")).toHaveCount(0);
    await expect(dialog.getByLabel("Description (optional)")).toHaveCount(0);
    const cats = await openOptions(page, "Productivity");
    expect(cats).toEqual(REF_GOAL_CATEGORIES);
    const pris = await openOptions(page, "Medium");
    expect(pris).toEqual(REF_GOAL_PRIORITIES);
  });

  test("R92-J: the Create Performance Review dialog renders the REF's contract", async ({ page }) => {
    await page.goto("/evaluations");
    await page.getByRole("button", { name: "New Review" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    for (const label of ["Employee *", "Review Period *", "Review Type", "Review Date"]) {
      await expect(dialog.getByLabel(label, { exact: true }).first()).toBeVisible();
    }
    await expect(dialog.getByLabel("Cycle Name")).toHaveCount(0);
    await expect(dialog.getByPlaceholder("e.g. Q2 2025, Annual 2025")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Create & Notify" })).toBeVisible();
    const types = await openOptions(page, "annual");
    expect(types).toEqual(REF_REVIEW_TYPES);
  });

  test("R92-K: the Start Offboarding dialog renders the REF's field set", async ({ page }) => {
    await page.goto("/offboarding");
    await page.getByRole("button", { name: "New Offboarding" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    for (const label of ["Employee", "Notice Date", "Last Working Day", "Termination Date", "Final Settlement (SAR)"]) {
      await expect(dialog.getByLabel(label, { exact: true }).first()).toBeVisible();
    }
    await expect(dialog.getByLabel("Reason")).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: "Start Offboarding" })).toBeVisible();
  });

  test("R92-L: the Assign Shift dialog carries the REF's 448px width", async ({ page }) => {
    await page.goto("/shiftcalendar");
    await page.getByRole("button", { name: "assign" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(450); // the zoom-in-95 open animation settles
    const w = await dialog.evaluate((el) => el.getBoundingClientRect().width);
    expect(Math.round(w)).toBe(448);
  });

  test("R92-M: the Add Payslip dialog renders the REF's Bonus + Notes contract", async ({ page }) => {
    await page.goto("/payrollmodule");
    await page.getByRole("button", { name: "Add Payslip" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    for (const label of ["Employee *", "Bonus (SAR)", "Notes"]) {
      await expect(dialog.getByLabel(label, { exact: true }).first()).toBeVisible();
    }
    await expect(dialog.getByPlaceholder("Optional notes...")).toBeVisible();
    // the dialog inventions retired
    await expect(dialog.getByLabel("Period")).toHaveCount(0);
    await expect(dialog.getByLabel("Basic Salary (SAR)")).toHaveCount(0);
    await expect(dialog.getByLabel("Allowances (SAR)")).toHaveCount(0);
    await expect(dialog.getByLabel("Deductions (SAR)")).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: "Generate Payslip" })).toBeVisible();
  });
});
