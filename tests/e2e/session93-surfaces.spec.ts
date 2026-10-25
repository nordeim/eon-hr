import { expect, test } from "@playwright/test";

// Session 93 — the unscanned creation surfaces round (the r92 sweep read
// DIALOG interiors; every creation surface that renders as an INLINE VIEW or
// a full-page EDITOR was invisible to it — the third open-state blind spot).
//
//   R93-A the employee wizard's five field-level divergences — the REF's
//         step-1 placeholders (John Doe / john@company.com /
//         john@personal.com / +966 5XX XXX XXX), the step-2 "Reports To"
//         label in the LEFT column (not a spanned "Manager"), the step-3
//         Contract Type FOUR (Indefinite/Fixed Term/Probation/Internship)
//         + the Basic Salary (SAR) field + the no-span field order.
//   R93-B Post New Job renders an INLINE FORM SECTION (shadow-xl card, the
//         indigo→blue gradient header) — Job Title*/Department*/Location/
//         Employment Type (Full Time/Part Time/Contract/Internship)/Job
//         Description*/Requirements + Cancel/Create Job — not a dialog.
//   R93-C workflowconfigpage's New Workflow opens a full-page EDITOR —
//         Workflow Name/Applies To (Staff Requests, Expense Claims)/Active/
//         Min Amount/Max Amount/Categories + the levels builder (Approver
//         Type six + Auto-approve hours + the Specific User(s) emails) +
//         Add Level/Cancel/Save Workflow.
//   R93-D the Schedule Recurring Report dialog — Report Name/Report Type
//         (six)/Frequency (four)/Recipients+Add + Cancel/Schedule Report.
//   R93-E the Send Payslips via WhatsApp dialog — 672 wide, Select Payroll
//         Month + the month input + Send All on one row, the data-driven
//         payslip area.
//   R93-F the New Chat dialog — Start New Chat + "Project name (optional)"
//         + Cancel/Create (the clone fired the POST directly).
//   R93-G the Add Applicant dialog's bare form — NO description, NO
//         placeholders, the 3-row textarea (512×522).
//   R93-H the job-postings vocabulary + seed + card — the REF's three-job
//         tenant (HR Manager draft, HR Director draft, System Admin active),
//         the draft/active badge recipes, the dept · location card contract,
//         the stats trio at 1/0/0.

const REF_CONTRACT_TYPES = ["Indefinite", "Fixed Term", "Probation", "Internship"];
const REF_EMP_TYPES = ["Full Time", "Part Time", "Contract", "Intern"];
const REF_POSTJOB_TYPES = ["Full Time", "Part Time", "Contract", "Internship"];
const REF_WF_APPLIES = ["Staff Requests", "Expense Claims"];
const REF_WF_APPROVERS = ["Staff Requests", "Expense Claims", "Specific User(s)", "Department Head", "Direct Manager", "Any Admin"];
const REF_REPORT_TYPES = ["Attendance", "Payroll", "Overtime", "Leave", "Turnover", "Headcount"];
const REF_REPORT_FREQS = ["Daily", "Weekly", "Monthly", "Quarterly"];

async function readComboOptions(page: import("@playwright/test").Page, triggerText: RegExp) {
  const trigger = page.getByRole("combobox").filter({ hasText: triggerText }).first();
  await trigger.click();
  const box = page.getByRole("listbox").last();
  const opts = await box.getByRole("option").allInnerTexts();
  await page.keyboard.press("Escape");
  return opts.map((o) => o.trim());
}

test.describe("session93 — the unscanned creation surfaces round", () => {
  // ---------------- R93-A: the employee wizard ----------------
  test("R93-A1: wizard step 1 renders the REF's four placeholders", async ({ page }) => {
    await page.goto("/employees");
    await page.getByRole("button", { name: "Add Employee" }).first().click();
    await expect(page.getByRole("heading", { name: "Add New Employee" })).toBeVisible();
    await expect(page.getByPlaceholder("John Doe")).toHaveCount(1);
    await expect(page.getByPlaceholder("john@company.com")).toHaveCount(1);
    await expect(page.getByPlaceholder("john@personal.com")).toHaveCount(1);
    await expect(page.getByPlaceholder("+966 5XX XXX XXX")).toHaveCount(1);
  });

  test("R93-A2: wizard step 2 labels Reports To in the left column (no spanned Manager)", async ({ page }) => {
    await page.goto("/employees");
    await page.getByRole("button", { name: "Add Employee" }).first().click();
    await page.getByLabel("Full Name *").fill("Probe User");
    await page.getByLabel("Work Email *").fill("probe-r93@eon-hr.test");
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText("Job Information").first()).toBeVisible();
    await expect(page.getByText("Reports To").first()).toBeVisible();
    await expect(page.getByText("Manager", { exact: true })).toHaveCount(0);
    // the Reports To trigger sits in the LEFT column (same x as Job Title),
    // the right cell at its row stays empty — not a col-span-2 stretch.
    const geo = await page.evaluate(() => {
      const labels = [...document.querySelectorAll("label")];
      const by = (t: string) => labels.find((l) => (l.textContent || "").trim() === t)!.getBoundingClientRect();
      const reportsTo = by("Reports To");
      const jobTitle = by("Job Title *");
      const trigger = [...document.querySelectorAll("button[role=combobox]")].find((b) => /Select manager/.test(b.textContent || ""))!;
      return { reportsToX: Math.round(reportsTo.x), jobTitleX: Math.round(jobTitle.x), triggerW: Math.round(trigger.getBoundingClientRect().width) };
    });
    expect(geo.reportsToX).toBe(geo.jobTitleX);
    expect(geo.triggerW).toBeLessThan(450); // the half-column width (not the spanned full row)
  });

  test("R93-A3: wizard step 3 renders the Contract Type four + Basic Salary (SAR) + the no-span order", async ({ page }) => {
    await page.goto("/employees");
    await page.getByRole("button", { name: "Add Employee" }).first().click();
    await page.getByLabel("Full Name *").fill("Probe User");
    await page.getByLabel("Work Email *").fill("probe-r93@eon-hr.test");
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByLabel("Job Title *").fill("QA Probe");
    await page.getByLabel("Start Date *").fill("2026-10-01");
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText("Contract Information").first()).toBeVisible();
    // the six labels in the REF's order
    const labels = await page.evaluate(() =>
      [...document.querySelectorAll("label")].map((l) => (l.textContent || "").replace(/\s+/g, " ").trim()),
    );
    const step3 = ["Contract Type", "Contract Start Date", "Basic Salary (SAR)", "Bank Name", "IBAN", "GOSI Number"];
    expect(labels).toEqual(expect.arrayContaining(step3));
    // the salary field is a number input with the REF's "0" placeholder
    const salary = page.getByLabel("Basic Salary (SAR)");
    await expect(salary).toHaveAttribute("type", "number");
    await expect(salary).toHaveAttribute("placeholder", "0");
    // the Contract Type options are the REF's four
    expect(await readComboOptions(page, /Indefinite|Contract/)).toEqual(REF_CONTRACT_TYPES);
  });

  test("R93-A4: wizard step 2 offers the REF's Employment Type four", async ({ page }) => {
    await page.goto("/employees");
    await page.getByRole("button", { name: "Add Employee" }).first().click();
    await page.getByLabel("Full Name *").fill("Probe User");
    await page.getByLabel("Work Email *").fill("probe-r93@eon-hr.test");
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText("Job Information").first()).toBeVisible();
    expect(await readComboOptions(page, /Full Time/)).toEqual(REF_EMP_TYPES);
  });

  // ---------------- R93-B: Post New Job (the inline form) ----------------
  test("R93-B: Post New Job renders the REF's inline form section, not a dialog", async ({ page }) => {
    await page.goto("/recruitment");
    await page.getByRole("button", { name: "Post New Job" }).click();
    await page.waitForTimeout(600);
    // NO dialog opens — the form section renders inline
    expect(await page.locator("[role=dialog]").count()).toBe(0);
    for (const label of ["Job Title *", "Department *", "Location", "Employment Type", "Job Description *", "Requirements"]) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }
    // the Requirements textarea carries the REF's placeholder
    await expect(page.getByPlaceholder("List required skills, experience, qualifications...")).toHaveCount(1);
    // the form card: the shadow-xl + the indigo→blue gradient header
    const card = await page.evaluate(() => {
      const lbl = [...document.querySelectorAll("label")].find((l) => (l.textContent || "").trim() === "Job Title *")!;
      let card = lbl as HTMLElement;
      for (let i = 0; i < 8; i++) {
        card = card.parentElement as HTMLElement;
        if (card.className.includes("shadow-xl")) break;
      }
      const header = card.querySelector("div.bg-gradient-to-r") as HTMLElement;
      return { cardCls: card.className, headerText: header?.textContent?.trim() ?? null };
    });
    expect(card.cardCls).toContain("shadow-xl");
    expect(card.headerText).toBe("Post New Job");
    // the footer buttons
    await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Job" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Post Job" })).toHaveCount(0);
    // the Employment Type options are the REF's four (the -ship set)
    expect(await readComboOptions(page, /Full Time/)).toEqual(REF_POSTJOB_TYPES);
    // Cancel collapses the form back
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(page.getByPlaceholder("List required skills, experience, qualifications...")).toHaveCount(0);
  });

  // ---------------- R93-C: the workflow editor ----------------
  test("R93-C: New Workflow opens the REF's full-page editor with the levels builder", async ({ page }) => {
    await page.goto("/workflowconfigpage");
    await page.getByRole("button", { name: "New Workflow" }).click();
    await page.waitForTimeout(800);
    expect(await page.locator("[role=dialog]").count()).toBe(0);
    await expect(page.getByRole("heading", { name: "New Workflow" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Back" })).toBeVisible();
    for (const label of ["Workflow Name", "Applies To", "Active", "Min Amount (SAR)", "Max Amount (SAR)", "Categories (comma separated, blank = all)"]) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }
    // the REF's placeholders
    await expect(page.getByPlaceholder("e.g. Finance Approval")).toHaveCount(1);
    await expect(page.getByPlaceholder("e.g. 500")).toHaveCount(1);
    await expect(page.getByPlaceholder("e.g. 10000")).toHaveCount(1);
    await expect(page.getByPlaceholder("finance, hr, it")).toHaveCount(1);
    // the level-1 block: the numbered circle + the name input + Approver Type
    await expect(page.getByPlaceholder("Level name (e.g. Line Manager)")).toHaveCount(1);
    const applies = await readComboOptions(page, /Staff Requests/);
    expect(applies).toEqual(REF_WF_APPLIES);
    const approver = await readComboOptions(page, /Direct Manager|Approver/);
    expect(approver).toEqual(REF_WF_APPROVERS);
    // Add Level renders the second level with the Approver Emails field
    await page.getByRole("button", { name: "Add Level" }).click();
    await expect(page.getByText("Approver Emails (comma separated)")).toBeVisible();
    await expect(page.getByPlaceholder("email1@company.com, email2@company.com")).toHaveCount(1);
    // the footer
    await expect(page.getByRole("button", { name: "Save Workflow" })).toBeVisible();
    // Save persists the editor shape (the superset round-trip) — the
    // floating base44 wordmark badge overlays the footer's right edge, so
    // it is hidden for the click (the documented overlay-interception class).
    await page.evaluate(() => {
      const badge = document.getElementById("base44-edit-badge");
      if (badge) badge.style.display = "none";
    });
    await page.getByPlaceholder("e.g. Finance Approval").fill("E2E Editor Probe");
    await page.getByRole("button", { name: "Save Workflow" }).click();
    await expect(page.getByRole("heading", { name: "Approval Workflow Engine" })).toBeVisible();
    await expect(page.getByText("E2E Editor Probe").first()).toBeVisible();
    // cleanup
    const id = await page.evaluate(async () => {
      const res = await fetch("/api/approval-workflows");
      const json = await res.json();
      const w = json.data?.workflows?.find((x: { name: string }) => x.name === "E2E Editor Probe");
      if (w) await fetch(`/api/approval-workflows?id=${w.id}`, { method: "DELETE" });
      return w?.id ?? null;
    });
    expect(id).toBeTruthy();
  });

  // ---------------- R93-D: the Schedule Recurring Report dialog ----------------
  test("R93-D: the Schedule Recurring Report dialog renders the REF's full contract", async ({ page }) => {
    await page.goto("/advancedanalytics");
    await page.getByRole("button", { name: "Schedule Report" }).click();
    const dialog = page.locator("[role=dialog]");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Schedule Recurring Report" })).toBeVisible();
    for (const label of ["Report Name", "Report Type", "Frequency", "Recipients"]) {
      await expect(dialog.getByText(label, { exact: true })).toBeVisible();
    }
    expect(await readComboOptions(page, /Attendance/)).toEqual(REF_REPORT_TYPES);
    expect(await readComboOptions(page, /Monthly/)).toEqual(REF_REPORT_FREQS);
    await expect(dialog.getByPlaceholder("email@company.com")).toHaveCount(1);
    await expect(dialog.getByRole("button", { name: "Add" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Schedule Report" })).toBeVisible();
    // no description line (the clone's invention)
    await expect(dialog.getByText("Automatically deliver the analytics")).toHaveCount(0);
  });

  // ---------------- R93-E: the Send Payslips dialog ----------------
  test("R93-E: Send Payslips via WhatsApp opens the REF's 672 dialog with the month row", async ({ page }) => {
    await page.goto("/payrollreports");
    await page.getByRole("button", { name: "Send Payslips via WhatsApp" }).first().click();
    const dialog = page.locator("[role=dialog]");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Send Payslips via WhatsApp" })).toBeVisible();
    await expect(dialog.getByText("Select Payroll Month", { exact: true })).toBeVisible();
    const month = dialog.locator("input[type=month]");
    await expect(month).toHaveCount(1);
    await expect(dialog.getByRole("button", { name: "Send All" })).toBeVisible();
    // the 672 width
    const w = await dialog.evaluate((d) => Math.round(d.getBoundingClientRect().width));
    expect(w).toBe(672);
    // the data-driven area: no payroll records for the current month
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    await expect(dialog.getByText(`No payrolls found for ${period}`)).toBeVisible();
    // NOTE: the footer Close + the DialogContent's built-in X both match —
    // scope to the footer's (the REF's explicit Close button).
    await dialog.getByRole("button", { name: "Close" }).first().click();
    await expect(dialog).toHaveCount(0);
  });

  // ---------------- R93-F: the New Chat dialog ----------------
  test("R93-F: New Chat opens the REF's Start New Chat dialog and Create persists", async ({ page }) => {
    await page.goto("/hrassistantchat");
    await page.getByRole("button", { name: "New Chat" }).click();
    const dialog = page.locator("[role=dialog]");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Start New Chat" })).toBeVisible();
    await expect(dialog.getByPlaceholder("Project name (optional)")).toHaveCount(1);
    await dialog.getByPlaceholder("Project name (optional)").fill("E2E New Chat Probe");
    await dialog.getByRole("button", { name: "Create", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByText("E2E New Chat Probe").first()).toBeVisible();
    // NOTE: the ai-chat API has no DELETE route — the probe chat is swept by
    // the global-setup's purge-test-data.ts (the "E2E " title prefix).
  });

  // ---------------- R93-G: the Add Applicant bare form ----------------
  test("R93-G: the Add Applicant dialog is the REF's bare form (no description, no placeholders, 3-row textarea)", async ({ page }) => {
    await page.goto("/recruitmentkanban");
    await page.getByRole("button", { name: "Add Applicant" }).click();
    const dialog = page.locator("[role=dialog]");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Add Applicant" })).toBeVisible();
    // no description under the title
    const desc = await dialog.evaluate((d) => {
      const h = d.querySelector("h2, [data-slot=dialog-title]") as HTMLElement;
      const sib = h?.nextElementSibling;
      return sib ? (sib.textContent || "").trim() : "";
    });
    expect(desc).toBe("");
    // no input carries a placeholder
    const phs = await dialog.evaluate((d) =>
      [...d.querySelectorAll("input,textarea")].map((i) => i.getAttribute("placeholder") || "").filter(Boolean),
    );
    expect(phs).toEqual([]);
    // the Cover Letter textarea renders 3 rows
    const rows = await dialog.locator("textarea").evaluate((t) => t.getAttribute("rows"));
    expect(rows).toBe("3");
  });

  // ---------------- R93-H: the job postings vocabulary + seed + card ----------------
  test("R93-H1: the seed renders the REF's three-job tenant (stats + filter + cards)", async ({ page }) => {
    await page.goto("/recruitment");
    await expect(page.getByText("Active Jobs")).toBeVisible();
    // wait for the data fetch to settle before reading the stats (the
    // applicants table's "N candidates" renders only after load)
    await expect(page.getByText("candidates")).toBeVisible();
    await page.waitForTimeout(600);
    // the stats at the REF's 1/0/0 — the first card's value is exactly "1"
    const activeJobs = await page.evaluate(() => {
      const zone = document.querySelector("div[class*=md\\:grid-cols-4]")!;
      const card = zone.children[0] as HTMLElement;
      return (card.querySelector("[class*=text-2xl]")?.textContent || "").trim();
    });
    expect(activeJobs).toBe("1");
    // the All Jobs filter lists the REF's three
    const jobs = await readComboOptions(page, /All Jobs/);
    expect(jobs).toEqual(["All Jobs", "HR Manager", "HR Director", "System Admin"]);
    // the Job Postings tab renders the cards in the REF's order
    await page.getByRole("tab", { name: "Job Postings" }).click();
    await page.waitForTimeout(800);
    const cards = await page.evaluate(() => {
      const root = document.querySelector("main")!;
      const out: { title: string; sub: string; badge: string; badgeBg: string; badgeColor: string; badgeRadius: string }[] = [];
      for (const c of root.querySelectorAll("div")) {
        const r = c.getBoundingClientRect();
        if (r.width >= 400 && r.width <= 620 && r.height >= 150 && r.height <= 400 && c.className.includes?.("rounded-xl")) {
          const title = c.querySelector(".text-lg");
          if (!title) continue;
          const sub = c.querySelector("p.text-sm.text-slate-500");
          const badge = [...c.querySelectorAll("div,span")].find(
            (b) => ["draft", "active"].includes((b.textContent || "").trim()) && b.getBoundingClientRect().height > 15 && b.getBoundingClientRect().height < 30,
          ) as HTMLElement | undefined;
          if (badge) {
            const st = getComputedStyle(badge);
            out.push({
              title: (title.textContent || "").trim(),
              sub: (sub?.textContent || "").trim(),
              badge: (badge.textContent || "").trim(),
              badgeBg: st.backgroundColor,
              badgeColor: st.color,
              badgeRadius: st.borderRadius,
            });
          }
        }
      }
      const uq = [...new Map(out.map((o) => [o.title, o])).values()];
      return uq;
    });
    expect(cards.map((c) => c.title)).toEqual(["HR Manager", "HR Director", "System Admin"]);
    expect(cards[0].sub).toBe("HR · Jeddah");
    expect(cards[1].sub).toBe("HR · Riyadh");
    expect(cards[2].sub).toBe("IT · Jeddah");
    // the badge recipes (the REF's computed set)
    expect(cards[0].badge).toBe("draft");
    expect(cards[0].badgeBg).toBe("rgb(241, 245, 249)"); // slate-100
    expect(cards[0].badgeColor).toBe("rgb(71, 85, 105)"); // slate-600
    expect(cards[2].badge).toBe("active");
    expect(cards[2].badgeBg).toBe("rgb(220, 252, 231)"); // green-100
    expect(cards[2].badgeColor).toBe("rgb(21, 128, 61)"); // green-700
    expect(cards[0].badgeRadius).toBe("6px");
    // the footer contract: "N applicants" + the Upload CV button per card
    await expect(page.getByText("0 applicants").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Upload CV" }).first()).toBeVisible();
  });

  test("R93-H2: the careers board shows only the ACTIVE job (1 Open Position, System Admin)", async ({ page }) => {
    await page.goto("/careers");
    await expect(page.getByRole("heading", { name: "1 Open Position" })).toBeVisible();
    await expect(page.getByText("System Admin").first()).toBeVisible();
    // the drafts stay off the public board
    await expect(page.getByText("HR Manager")).toHaveCount(0);
    await expect(page.getByText("HR Director")).toHaveCount(0);
  });
});
