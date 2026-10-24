import { expect, test } from "@playwright/test";

/**
 * Session 35 (R34-E): the payrollreports tab contents — AMENDED at session
 * 87 (the r87 tab-interior instrument measured the REF's ACTUAL tab panels:
 * its triggers are INTERACTIVE, and the session-35 "inert triggers" belief
 * was wrong — the three non-Monthly interiors were invented without
 * measurement and have been rebuilt to the REF recipes; see
 * tests/e2e/session87-tabinterior.spec.ts for the full contract pins and
 * docs/remediation-plan-session87.md). This spec keeps the round-trip
 * coverage: each tab swaps the sibling panel, and the zero-data empty
 * states render the REF-measured copy.
 */
test.describe("payrollreports tabs (session 35, R34-E; session-87 amendment)", () => {
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
    // Session 87 (R87-A): the REF-measured title/description (the old
    // "Deduction breakdown for {month}" was the session-35 invention).
    await expect(page.getByText("Tax & Deductions Report")).toBeVisible();
    await expect(page.getByText("Breakdown of deductions and estimated tax")).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Est. Tax (15%)" })).toBeVisible();
    // the REF's period-independent empty copy
    await expect(page.getByText("No records for selected period")).toBeVisible();
  });

  test("History swaps in the per-employee card with its empty state", async ({ page }) => {
    await page.getByRole("tab", { name: "History" }).click();
    await expect(page.getByRole("tab", { name: "History" })).toHaveAttribute("aria-selected", "true");
    // Session 87 (R87-B): the REF-measured per-EMPLOYEE history (the old
    // per-period aggregate was the session-35 invention).
    await expect(page.getByText("Employee Earnings History")).toBeVisible();
    await expect(page.getByText("Complete salary history per employee")).toBeVisible();
    await expect(page.getByText("No payroll history found")).toBeVisible();
  });

  test("Custom renders the REF's three-card form and the reactive zero-data preview", async ({ page }) => {
    await page.getByRole("tab", { name: "Custom" }).click();
    await expect(page.getByRole("tab", { name: "Custom" })).toHaveAttribute("aria-selected", "true");
    // Session 87 (R87-C): the REF's THREE-card architecture (the old
    // one-card form + Generate button was the session-35 invention).
    await expect(page.getByText("Report Filters")).toBeVisible();
    await expect(page.getByText("Select Columns")).toBeVisible();
    await expect(page.getByText("Report Preview")).toBeVisible();
    await expect(page.getByLabel("From Month")).toBeVisible();
    await expect(page.getByLabel("To Month")).toBeVisible();
    // the preview derives reactively — the zero-data state renders without
    // any Generate click (no Generate button exists on the REF)
    await expect(page.getByText("No data for selected filters")).toBeVisible();
    await expect(page.getByText("0 records")).toBeVisible();
  });

  test("back to Monthly restores the summary card", async ({ page }) => {
    await page.getByRole("tab", { name: "History" }).click();
    await expect(page.getByText("Employee Earnings History")).toBeVisible();
    await page.getByRole("tab", { name: "Monthly" }).click();
    await expect(page.getByText("Monthly Payroll Summary")).toBeVisible();
    await expect(page.getByText("Employee Earnings History")).toHaveCount(0);
  });
});
