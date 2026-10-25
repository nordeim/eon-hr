import { expect, test } from "@playwright/test";

// Session 91 — the open-state inventory round (the r90 discipline extended:
// the r90-C assetmanagement read generalized to the whole filtered surface).
//
//   R91-A the staffrequests option inventories — the REF's live filter sets:
//         CATEGORY [All Categories, Finance, HR, IT, Operations,
//         Tools & Equipment, Other] (the clone offered General/Facilities/
//         Admin) and STATUS [All Status, Pending, L1 Approved, L2 Approved,
//         Approved, Rejected, Completed] (the clone offered In Progress/
//         Resolved — an invented vocabulary outside the REF's workflow).
//   R91-B the hrreports multi-entity report builder — the REF reports over
//         FOUR entities (Employees, Staff Requests, Expense Claims, Leave
//         Requests) with entity-dependent group-by fields + table headers,
//         the constant 6-value status union, and the Bar/Line/Pie order;
//         the clone was employees-only with its own group/status sets.
//   R91-C the recruitment inventories — the table filter's STATUS set (the
//         REF's 7 lowercase raw values) + the 3-mode sort (AI Score,
//         Application Date, Experience) + the Add Applicant dialog's field
//         contract (Full Name*, Email*, Phone, Experience (years), Job
//         Posting, Source, Cover Letter — the Source options Direct, Bayt,
//         Linkedin, Facebook, Referral, Website; the clone's Stage select
//         was an invention).
//   R91-D the dropdown-family no-swap guard — the user menu at 390 opens
//         the STANDARD Radix popper cross-side (r90's bottom-sheet swap is
//         select-family-only; live-verified identical geometry both sides).

const REF_CATEGORIES = ["All Categories", "Finance", "HR", "IT", "Operations", "Tools & Equipment", "Other"];
const REF_REQ_STATUSES = ["All Status", "Pending", "L1 Approved", "L2 Approved", "Approved", "Rejected", "Completed"];
const REF_ENTITIES = ["Employees", "Staff Requests", "Expense Claims", "Leave Requests"];
const REF_EMP_GROUPS = ["job title", "department id", "employment status", "employment type", "start date"];
const REF_SR_GROUPS = ["category", "status", "priority", "amount", "created date"];
const REF_EC_GROUPS = ["expense type", "amount", "status", "date"];
const REF_LR_GROUPS = ["leave type", "status", "start date", "end date"];
const REF_REPORT_STATUSES = ["All", "Pending", "Approved", "Rejected", "Active", "Completed"];
const REF_CHARTS = ["Bar Chart", "Line Chart", "Pie Chart"];
const REF_CAND_STATUSES = ["new", "reviewed", "shortlisted", "interview scheduled", "offered", "hired", "rejected"];
const REF_SORTS = ["AI Score", "Application Date", "Experience"];
const REF_SOURCES = ["Direct", "Bayt", "Linkedin", "Facebook", "Referral", "Website"];

/** Opens every combobox on the page and reads each option set, in DOM order. */
async function readAllSelectOptions(page: import("@playwright/test").Page) {
  return page.evaluate(async () => {
    const results: { trigger: string; options: string[] }[] = [];
    // snapshot the trigger list FIRST (opening changes the DOM)
    const triggers = [...document.querySelectorAll("button[role=combobox], button[aria-haspopup=listbox]")]
      .filter((t) => (t as HTMLElement).offsetParent !== null)
      .map((t) => (t.textContent || "").trim());
    for (let i = 0; i < triggers.length; i++) {
      const ts = [...document.querySelectorAll("button[role=combobox], button[aria-haspopup=listbox]")]
        .filter((t) => (t as HTMLElement).offsetParent !== null);
      (ts[i] as HTMLElement).dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      await new Promise((r) => setTimeout(r, 350));
      const lbs = [...document.querySelectorAll("[role=listbox]")];
      const opts = lbs.length
        ? [...lbs[lbs.length - 1].querySelectorAll("[role=option]")].map((o) => (o.textContent || "").trim())
        : [];
      results.push({ trigger: triggers[i], options: opts });
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await new Promise((r) => setTimeout(r, 150));
    }
    return results;
  });
}

test.describe("session-91 — the open-state inventory round", () => {
  test("R91-A1: staffrequests category filter offers the REF's seven", async ({ page }) => {
    await page.goto("/staffrequests");
    await page.waitForSelector("text=Staff Requests");
    await page.waitForTimeout(800);
    const selects = await readAllSelectOptions(page);
    const cat = selects.find((s) => s.trigger.includes("All Categories"));
    expect(cat, "the category filter trigger renders").toBeTruthy();
    expect(cat!.options).toEqual(REF_CATEGORIES);
  });

  test("R91-A2: staffrequests status filter offers the REF's workflow seven", async ({ page }) => {
    await page.goto("/staffrequests");
    await page.waitForSelector("text=Staff Requests");
    await page.waitForTimeout(800);
    const selects = await readAllSelectOptions(page);
    const st = selects.find((s) => s.trigger.includes("All Status"));
    expect(st, "the status filter trigger renders").toBeTruthy();
    expect(st!.options).toEqual(REF_REQ_STATUSES);
  });

  test("R91-B1: hrreports data source offers the REF's four entities", async ({ page }) => {
    await page.goto("/hrreports");
    await page.waitForSelector("text=HR Reports");
    await page.waitForTimeout(1000);
    const selects = await readAllSelectOptions(page);
    const src = selects.find((s) => s.trigger.includes("Employees"));
    expect(src, "the data source trigger renders").toBeTruthy();
    expect(src!.options).toEqual(REF_ENTITIES);
  });

  test("R91-B2: hrreports group-by offers the employees' five REF fields", async ({ page }) => {
    await page.goto("/hrreports");
    await page.waitForSelector("text=HR Reports");
    await page.waitForTimeout(1000);
    const selects = await readAllSelectOptions(page);
    const group = selects.find((s) => s.options.length >= 5 && s.options.some((o) => o === "start date"));
    expect(group, "the group-by trigger renders with the employees' field set").toBeTruthy();
    expect(group!.options).toEqual(REF_EMP_GROUPS);
  });

  test("R91-B3: hrreports group-by + table headers switch with the entity (staff-requests)", async ({ page }) => {
    await page.goto("/hrreports");
    await page.waitForSelector("text=HR Reports");
    await page.waitForTimeout(1000);
    // switch the data source to Staff Requests
    await page.evaluate(async () => {
      const ts = [...document.querySelectorAll("button[role=combobox], button[aria-haspopup=listbox]")]
        .filter((t) => (t as HTMLElement).offsetParent !== null);
      (ts[0] as HTMLElement).dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      await new Promise((r) => setTimeout(r, 350));
      const lbs = [...document.querySelectorAll("[role=listbox]")];
      const opt = [...lbs[lbs.length - 1].querySelectorAll("[role=option]")].find((o) =>
        /Staff Requests/.test(o.textContent || ""),
      );
      (opt as HTMLElement).dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      await new Promise((r) => setTimeout(r, 600));
    });
    await page.waitForTimeout(800);
    const selects = await readAllSelectOptions(page);
    const group = selects.find((s) => s.options.length >= 5 && s.options.some((o) => o === "created date"));
    expect(group, "the staff-requests group-by set renders").toBeTruthy();
    expect(group!.options).toEqual(REF_SR_GROUPS);
    const headers = await page.evaluate(() =>
      [...document.querySelectorAll("table th")].map((t) => (t.textContent || "").trim()),
    );
    expect(headers).toEqual(["employee name", "category", "status", "priority", "amount", "created date"]);
  });

  test("R91-B4: hrreports status filter offers the REF's constant union six", async ({ page }) => {
    await page.goto("/hrreports");
    await page.waitForSelector("text=HR Reports");
    await page.waitForTimeout(1000);
    const selects = await readAllSelectOptions(page);
    const st = selects.find((s) => s.options.includes("Completed") && s.options.includes("Active"));
    expect(st, "the status filter trigger renders").toBeTruthy();
    expect(st!.options).toEqual(REF_REPORT_STATUSES);
  });

  test("R91-B5: hrreports chart type offers the REF's Bar, Line, Pie order", async ({ page }) => {
    await page.goto("/hrreports");
    await page.waitForSelector("text=HR Reports");
    await page.waitForTimeout(1000);
    const selects = await readAllSelectOptions(page);
    const chart = selects.find((s) => s.options.includes("Pie Chart"));
    expect(chart, "the chart type trigger renders").toBeTruthy();
    expect(chart!.options).toEqual(REF_CHARTS);
  });

  test("R91-C1: recruitment status filter offers the REF's seven raw values", async ({ page }) => {
    await page.goto("/recruitment");
    await page.waitForSelector("text=Applicants");
    await page.waitForTimeout(1000);
    const selects = await readAllSelectOptions(page);
    const st = selects.find((s) => s.options.includes("hired") && s.options.includes("shortlisted"));
    expect(st, "the status filter trigger renders").toBeTruthy();
    expect(st!.options).toEqual(["All Status", ...REF_CAND_STATUSES]);
  });

  test("R91-C2: recruitment sort offers the REF's three modes", async ({ page }) => {
    await page.goto("/recruitment");
    await page.waitForSelector("text=Applicants");
    await page.waitForTimeout(1000);
    const selects = await readAllSelectOptions(page);
    const sort = selects.find((s) => s.options.includes("Application Date"));
    expect(sort, "the sort trigger renders").toBeTruthy();
    expect(sort!.options).toEqual(REF_SORTS);
  });

  test("R91-C3: the Add Applicant dialog renders the REF's field contract", async ({ page }) => {
    await page.goto("/recruitmentkanban");
    await page.waitForSelector("text=Recruitment Pipeline");
    await page.waitForTimeout(1200);
    await page.getByRole("button", { name: "Add Applicant" }).click();
    const dialog = page.locator("[role=dialog]");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Add Applicant" })).toBeVisible();
    // the REF's seven labels — Full Name *, Email *, Phone, Experience
    // (years), Job Posting, Source, Cover Letter — and NO Stage field
    // (the clone's old invention).
    for (const label of ["Full Name", "Email", "Phone", "Experience (years)", "Job Posting", "Source", "Cover Letter"]) {
      await expect(dialog.getByText(label, { exact: false })).toBeVisible();
    }
    await expect(dialog.getByText("Stage")).toHaveCount(0);
    // the Source select offers the REF's six
    await page.evaluate(async () => {
      const d = [...document.querySelectorAll("[role=dialog]")].find((x) => x.getBoundingClientRect().width > 0);
      const sels = [...(d?.querySelectorAll("button[role=combobox]") ?? [])];
      const src = sels.find((s) => /Direct/.test(s.textContent || ""));
      (src as HTMLElement)?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      await new Promise((r) => setTimeout(r, 350));
    });
    const sources = await page.evaluate(() => {
      const lbs = [...document.querySelectorAll("[role=listbox]")];
      return lbs.length ? [...lbs[lbs.length - 1].querySelectorAll("[role=option]")].map((o) => (o.textContent || "").trim()) : [];
    });
    expect(sources).toEqual(REF_SOURCES);
  });

  test("R91-D1: the user menu at 390 opens the STANDARD popper (the dropdown family's no-swap guard)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard");
    await page.waitForSelector("text=Quick Actions");
    // open the drawer then the user trigger
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    await page.waitForTimeout(800);
    await page.getByRole("button", { name: /sepnetflix2023/ }).click();
    await page.waitForTimeout(800);
    const menu = await page.evaluate(() => {
      const m = document.querySelector("[role=menu]");
      if (!m) return { found: false };
      const b = m.getBoundingClientRect();
      const drawer = document.querySelector('[role=dialog]');
      return {
        found: true,
        w: Math.round(b.width),
        h: Math.round(b.height),
        dir: m.getAttribute("dir"),
        items: [...m.querySelectorAll("[role=menuitem]")].map((i) => (i.textContent || "").trim()),
        noSheet: !document.querySelector("h2") || ![...document.querySelectorAll("h2")].some((h) => h.textContent?.trim() === "Select an option"),
        hasDrawer: !!drawer,
      };
    });
    expect(menu.found).toBe(true);
    expect(menu.w).toBe(192); // the cross-side live-measured width (both sides x=79 y=714 w=192 h=74)
    expect(menu.items).toEqual(["My Profile", "Logout"]);
    expect(menu.noSheet).toBe(true); // the dropdown family does NOT swap to the r90-B bottom-sheet
  });
});
