import { expect, test } from "@playwright/test";

/**
 * Session 36 (R35-C): the compliance filter selects' option sets — the
 * census found the clone's document-type taxonomy invented (certificate/
 * medical/id/other) where REF renders its Saudi set (Iqama, Visa,
 * Passport, Contract, Probation), and the window filter carrying the
 * stat-tile taxonomy ("Expiring ≤ N days") where REF's select reads
 * "All / Within N days".
 */
test.describe("compliance filter selects (session 36)", () => {
  test("the type + window selects render REF's option sets", async ({ page }) => {
    await page.goto("/compliancedashboard");

    // The window select's at-rest trigger reads "All" (not "All Alerts").
    await expect(page.getByRole("combobox", { name: "Filter by window" })).toHaveText(/All/);

    await page.getByRole("combobox", { name: "Filter by document type" }).click();
    const types = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[role="option"]')).map((o) => o.textContent?.trim())
    );
    expect(types).toEqual(["All Types", "Iqama", "Visa", "Passport", "Contract", "Probation"]);
    await page.keyboard.press("Escape");

    await page.getByRole("combobox", { name: "Filter by window" }).click();
    const windows = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[role="option"]')).map((o) => o.textContent?.trim())
    );
    expect(windows).toEqual(["All", "Expired", "Within 7 days", "Within 15 days", "Within 30 days"]);

    // The stat tiles keep their own taxonomy (both render on REF).
    await expect(page.getByText("Expiring ≤ 7 days")).toBeVisible();
  });
});
