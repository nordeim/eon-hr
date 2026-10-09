import { expect, test } from "@playwright/test";

// Dashboard parity + core interactions (the employee-portal view).
test.describe("dashboard", () => {
  test("renders the reference welcome and widgets", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /Welcome back, sepnetflix2023!/ })).toBeVisible();
    await expect(page.getByText("Your personal employee portal.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Quick Actions" })).toBeVisible();
    for (const action of ["My Portal", "Submit Request", "Claim Expense", "Request Leave"]) {
      await expect(page.getByRole("link", { name: action, exact: true })).toBeVisible();
    }
    await expect(page.getByRole("heading", { name: "My Leave Balances" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "My Recent Requests" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "My Expense Claims" })).toBeVisible();
  });

  test("leave balances show the seeded quotas", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Annual Leave")).toBeVisible();
    await expect(page.getByText("21 / 21 days")).toBeVisible();
    await expect(page.getByText("Sick Leave")).toBeVisible();
    await expect(page.getByText("30 / 30 days")).toBeVisible();
  });

  test("quick actions navigate to their modules", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: "My Portal", exact: true }).click();
    await expect(page).toHaveURL(/\/employeeselfservice/);
  });

  test("customize dialog toggles widgets and persists", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Customize" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("switch", { name: /Recent Requests/i }).first().click();
    await expect(page.locator("[data-widget='recent-requests']")).toBeHidden();
    // Re-enable for other specs
    await dialog.getByRole("switch", { name: /Recent Requests/i }).first().click();
    await expect(page.locator("[data-widget='recent-requests']")).toBeVisible();
    await page.reload();
    await expect(page.locator("[data-widget='recent-requests']")).toBeVisible();
  });

  test("expense total renders the seeded 0 SAR state", async ({ page }) => {
    await page.goto("/dashboard");
    // Reference: single-line "0 SAR total" (text-2xl bold), "No claims yet"
    // in slate-400.
    await expect(page.getByText("0 SAR total")).toBeVisible();
    await expect(page.getByText("No claims yet")).toBeVisible();
    await expect(page.getByText("No requests yet")).toBeVisible();
  });

  test("quick actions use the reference bordered-chip styling", async ({ page }) => {
    await page.goto("/dashboard");
    // Reference: border-slate-200 chips with small inline blue-600 icons,
    // NOT icon tiles.
    const chip = page.getByRole("link", { name: "My Portal", exact: true });
    await expect(chip).toHaveCSS("border-top-color", "rgb(226, 232, 240)");
    await expect(chip.locator("svg")).toHaveCSS("color", "rgb(37, 99, 235)");
    // Reference active-nav/primary blue is #1877F2.
    await expect(page.locator("aside nav a[aria-current='page']")).toHaveCSS(
      "background-color",
      "rgb(24, 119, 242)"
    );
  });

  test("active nav and language toggle match the reference", async ({ page }) => {
    await page.goto("/dashboard");
    // Reference sidebar footer: Languages icon + "عربي" label (Arabic target).
    await expect(page.getByRole("button", { name: "عربي", exact: true })).toBeVisible();
  });
});

// End-to-end CRUD through the real UI — the reference 4-step Add Employee
// wizard: personal → job → contract → documents, then delete (restores the
// seeded state).
test.describe("employees CRUD (4-step wizard)", () => {
  test("create → list → search → delete round-trip", async ({ page }) => {
    await page.goto("/employees");
    await expect(page.getByRole("heading", { name: "Employees", exact: true })).toBeVisible();

    // Open the wizard
    await page.getByRole("button", { name: "Add Employee" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Add New Employee" })).toBeVisible();

    // Step 1 — Personal Information (Next disabled until required fields)
    const next = dialog.getByRole("button", { name: "Next" });
    await expect(next).toBeDisabled();
    await dialog.getByLabel("Full Name *").fill("E2E Temperson");
    await dialog.getByLabel("Work Email *").fill("e2e-temp@eon-hr.test");
    await dialog.getByLabel("Nationality").fill("Saudi Arabia");
    await expect(next).toBeEnabled();
    await next.click();

    // Step 2 — Job Information
    await expect(dialog.getByText("Job Information")).toBeVisible();
    await expect(next).toBeDisabled();
    await dialog.getByLabel("Job Title *").fill("QA Probe");
    await dialog.getByLabel("Start Date *").fill("2026-10-01");
    await expect(next).toBeEnabled();
    await next.click();

    // Step 3 — Contract Information (all optional, defaults visible)
    await expect(dialog.getByText("Contract Information")).toBeVisible();
    await next.click();

    // Step 4 — Documents & Attachments → Create
    await expect(dialog.getByText("Documents & Attachments")).toBeVisible();
    await dialog.getByRole("button", { name: "Create Employee" }).click();
    await expect(dialog).toBeHidden();

    // Appears in the directory (reference columns: Employee, Job Title,
    // Status, Start Date, Actions — no Employment column).
    await expect(page.getByText("e2e-temp@eon-hr.test")).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Employment" })).toHaveCount(0);
    await expect(page.getByText(/manage your \d+ employees/i)).toBeVisible();

    // Search narrows the list (exact: the success toast also mentions the name)
    await page.getByLabel("Search employees").fill("Temperson");
    await expect(page.getByText("E2E Temperson", { exact: true })).toBeVisible();

    // Delete (confirm dialog)
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "Delete E2E" }).click();
    await expect(page.getByText("e2e-temp@eon-hr.test")).toHaveCount(0);
  });
});
