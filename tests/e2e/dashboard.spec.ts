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
    await expect(page.getByText("0 SAR")).toBeVisible();
    await expect(page.getByText("No claims yet")).toBeVisible();
    await expect(page.getByText("No requests yet")).toBeVisible();
  });
});

// End-to-end CRUD through the real UI: add an employee, see it in the
// directory, then delete it (restores the seeded state).
test.describe("employees CRUD (golden path)", () => {
  test("add → list → delete round-trip", async ({ page }) => {
    await page.goto("/employees");
    await expect(page.getByRole("heading", { name: "Employees", exact: true })).toBeVisible();

    // Add
    await page.getByRole("button", { name: "Add Employee" }).first().click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("First Name").fill("E2E");
    await dialog.getByLabel("Last Name").fill("Temperson");
    await dialog.getByLabel("Email").fill("e2e-temp@eon-hr.test");
    await dialog.getByLabel("Job Title").fill("QA Probe");
    await dialog.getByRole("button", { name: "Add Employee" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText("e2e-temp@eon-hr.test")).toBeVisible();
    await expect(page.getByText(/manage your \d+ employees/i)).toBeVisible();

    // Search narrows the list
    await page.getByLabel("Search employees").fill("Temperson");
    await expect(page.getByText("E2E Temperson")).toBeVisible();

    // Delete (confirm dialog)
    await page.getByRole("button", { name: "Delete E2E" }).click();
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "Delete E2E" }).click();
    await expect(page.getByText("e2e-temp@eon-hr.test")).toHaveCount(0);
  });
});
