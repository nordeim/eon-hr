import { expect, test } from "@playwright/test";

/**
 * Session 35 (R34-E): the payrollreports tab contents — the with-data
 * superset. REF's four triggers are INERT (clicking Tax & Deductions /
 * History / Custom changes nothing on REF — re-verified live this round),
 * so any tab content is superset territory. This spec pins:
 *  - the at-rest contract: Monthly active, the summary card present
 *  - the superset round-trip: each tab swaps the sibling card, and the
 *    zero-data empty states render REF's card grammar
 *  - the Custom form's Generate flow (the zero-data path)
 */
test.describe("payrollreports tabs (session 35, R34-E)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/payrollreports");
    await expect(page.getByRole("heading", { name: "Payroll Reports" })).toBeVisible();
  });

  test("at-rest: Monthly is active and the summary card renders", async ({ page }) => {
    const monthly = page.getByRole("tab", { name: "Monthly" });
    await expect(monthly).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Monthly Payroll Summary")).toBeVisible();
    // The REF-measured empty state.
    await expect(page.getByText(/No records for \d{4}-\d{2}/)).toBeVisible();
  });

  test("Tax & Deductions swaps in the breakdown card with its empty state", async ({ page }) => {
    await page.getByRole("tab", { name: "Tax & Deductions" }).click();
    await expect(page.getByRole("tab", { name: "Tax & Deductions" })).toHaveAttribute("aria-selected", "true");
    // Scope to the card title (the tab trigger shares the string — the
    // strict-mode locator quirk).
    const cardTitle = page.getByRole("paragraph").filter({ hasText: "Tax & Deductions" });
    await expect(cardTitle).toBeVisible();
    await expect(page.getByText("Deduction breakdown for", { exact: false })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Effective Rate" })).toBeVisible();
    await expect(page.getByText(/No records for \d{4}-\d{2}/)).toBeVisible();
  });

  test("History swaps in the periods card with its empty state", async ({ page }) => {
    await page.getByRole("tab", { name: "History" }).click();
    await expect(page.getByRole("tab", { name: "History" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("paragraph").filter({ hasText: "Payroll History" })).toBeVisible();
    await expect(page.getByRole("paragraph").filter({ hasText: "All processed periods" })).toBeVisible();
    await expect(page.getByText("No payroll history yet")).toBeVisible();
  });

  test("Custom renders the range form and Generate runs the zero-data report", async ({ page }) => {
    await page.getByRole("tab", { name: "Custom" }).click();
    await expect(page.getByRole("paragraph").filter({ hasText: "Custom Report" })).toBeVisible();
    await expect(page.getByRole("paragraph").filter({ hasText: "Build a report for any range" })).toBeVisible();
    await expect(page.getByLabel("From", { exact: true })).toBeVisible();
    await expect(page.getByLabel("To", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Generate Report" }).click();
    await expect(page.getByText("No records in range")).toBeVisible();
  });

  test("back to Monthly restores the summary card", async ({ page }) => {
    await page.getByRole("tab", { name: "History" }).click();
    await expect(page.getByRole("paragraph").filter({ hasText: "Payroll History" })).toBeVisible();
    await page.getByRole("tab", { name: "Monthly" }).click();
    await expect(page.getByText("Monthly Payroll Summary")).toBeVisible();
    await expect(page.getByRole("paragraph").filter({ hasText: "Payroll History" })).toHaveCount(0);
  });
});
