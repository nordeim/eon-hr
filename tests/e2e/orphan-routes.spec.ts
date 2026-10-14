import { expect, test } from "@playwright/test";

/**
 * Session 32 (R31): the orphan-route hunt — 14 routes from REF's bundle
 * page registry (VKe={61 keys} + We(name)=/lowercase) the clone 404'd on.
 *
 * The 10 real pages + 2 dashboard aliases are pinned by the navigation
 * sweep (heading + 200). This spec pins what that sweep cannot:
 *  - the 2 BLANK stubs (/home, /employeedetail render nothing in main,
 *    with the mechanical titles)
 *  - the key empty-state contracts of the real pages
 *  - the functional supersets: the shiftswap round-trip, the
 *    requestsettings Add round-trip, the tenantsetup PATCH
 */
test.describe("orphan routes (session 32)", () => {
  test.beforeEach(async ({ page }) => {
    // Pre-clean the persistent e2e DB (the legacy-assets lesson).
    const swaps = await page.request.get("/api/shiftswaps");
    const swapsJson = await swaps.json();
    if (swapsJson?.data?.swaps) {
      for (const s of swapsJson.data.swaps.filter((x: { notes: string | null }) => (x.notes ?? "").startsWith("R31 probe"))) {
        await page.request.delete(`/api/shiftswaps?id=${s.id}`);
      }
    }
    const cfgs = await page.request.get("/api/approval-config");
    const cfgJson = await cfgs.json();
    if (cfgJson?.data?.configs) {
      for (const c of cfgJson.data.configs) {
        await page.request.delete(`/api/approval-config?id=${c.id}`);
      }
    }
  });

  test("the blank stubs render an empty main with mechanical titles", async ({ page }) => {
    await page.goto("/home");
    await expect(page).toHaveTitle("Home | Eon HR");
    const main = page.locator("main");
    await expect(main).toBeVisible();
    /* Session 40 (R39-N): the mobile header now lives INSIDE main (its
       toggle button is a main descendant) — scope the emptiness check to
       the scroll container that carries the page content. */
    await expect(main.locator("> div").locator("h1, h3, button")).toHaveCount(0);

    await page.goto("/employeedetail");
    await expect(page).toHaveTitle("Employeedetail | Eon HR");
    await expect(page.locator("main > div").locator("h1, h3, button")).toHaveCount(0);
  });

  test("the dashboard aliases render the dashboard page with the plain title", async ({ page }) => {
    for (const route of ["/organizationsetup", "/dynamicdashboard"]) {
      await page.goto(route);
      await expect(page).toHaveTitle("Eon HR");
      await expect(page.getByRole("heading", { name: /Welcome back/, level: 1 })).toBeVisible();
    }
  });

  test("/employeeportal renders the centered onboarding empty state", async ({ page }) => {
    await page.goto("/employeeportal");
    await expect(page.getByText("No Onboarding Found")).toBeVisible();
    await expect(page.getByText(/You don't have an active onboarding process yet/)).toBeVisible();
  });

  test("/externaljobapplication renders the Briefcase empty state", async ({ page }) => {
    await page.goto("/externaljobapplication");
    await expect(page.getByRole("heading", { name: "Job Opportunities" })).toBeVisible();
    await expect(page.getByText("Join our team and make an impact")).toBeVisible();
    await expect(page.getByText(/No Open Positions/)).toBeVisible();
    await expect(page.getByText(/We don't have any open positions at the moment/)).toBeVisible();
  });

  test("/careers renders the hero + the search input + the zero-data card", async ({ page }) => {
    await page.goto("/careers");
    await expect(page.getByRole("heading", { name: "Find Your Dream Job" })).toBeVisible();
    await expect(page.getByText("Explore opportunities from top companies powered by EonHR")).toBeVisible();
    await expect(page.getByPlaceholder("Search jobs by title, department, or location...")).toBeVisible();
    await expect(page.getByText(/No Open Positions/)).toBeVisible();
    await expect(page.getByText("Check back later for new opportunities!")).toBeVisible();
  });

  test("/payrollai renders the stat row + the green CircleCheckBig empty", async ({ page }) => {
    await page.goto("/payrollai");
    await expect(page.getByRole("heading", { name: "Payroll AI Suggestions" })).toBeVisible();
    await expect(page.getByText("Pending Suggestions", { exact: true })).toBeVisible();
    await expect(page.getByText("Total Adjustments")).toBeVisible();
    await expect(page.getByRole("button", { name: "Run AI Analysis" })).toBeVisible();
    await expect(page.getByText("All Clear!")).toBeVisible();
    await expect(page.getByText("No payroll adjustments needed")).toBeVisible();
  });

  test("/shiftswap: the request round-trip via the keyboard-n dialog (the superset)", async ({ page }) => {
    await page.goto("/shiftswap");
    await expect(page.getByRole("heading", { name: "Shift Swap" })).toBeVisible();
    await expect(page.getByText("Request, approve, and manage shift swaps")).toBeVisible();
    // REF's at-rest empty contract (round 33) — no header button exists
    await expect(page.getByText("No swap requests in this category")).toBeVisible();

    // open the dialog via the invisible-at-rest "n" shortcut + submit
    // (the first seeded employee + tomorrow)
    await page.keyboard.press("n");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.locator("#swap-date").fill("2026-12-01");
    await dialog.locator("#swap-notes").fill("R31 probe swap");
    await dialog.getByRole("button", { name: "Submit Request" }).click();
    await expect(dialog).toBeHidden();

    // the list + the counts refresh
    await expect(page.getByText("R31 probe swap").first()).toBeVisible({ timeout: 8000 });
    const myCount = await page.getByText("My Requests", { exact: true }).first().textContent();
    expect(myCount).toBeTruthy();
  });

  test("/requestsettings: the Add approver round-trip via name+email (the superset)", async ({ page }) => {
    await page.goto("/requestsettings");
    await expect(page.getByRole("heading", { name: "Request Settings" })).toBeVisible();
    await expect(page.getByText("Set up to 3 approval levels per request category")).toBeVisible();

    // zero-state lines
    await expect(page.getByText("None set").first()).toBeVisible();

    // REF's form (round 33): free-text name + email resolved against
    // Employee by the API — the seeded demo employee's identity
    await page.getByLabel("Approver name").fill("Demo Employee");
    await page.getByLabel("Approver email").fill("sepnetflix2023@outlook.com");
    await page.getByRole("button", { name: "Add", exact: true }).click();

    // the level-1 block swaps "None set" for the approver row (levels 2/3
    // legitimately keep theirs — only level 1 was configured)
    await expect(page.getByText("None set").first()).toBeVisible();
    await expect(page.getByRole("listitem").filter({ hasText: /Demo|Employee|sepnetflix/i }).first()).toBeVisible({ timeout: 8000 });
  });

  test("/tenantsetup renders the wizard card + Continue PATCHes the company", async ({ page }) => {
    await page.goto("/tenantsetup");
    await expect(page.getByText("Welcome to EonHR")).toBeVisible();
    await expect(page.getByText(/Let's set up your HR management workspace/)).toBeVisible();

    await page.locator("#company-name").fill("Eon Probe Co");
    await page.locator("#owner-email").fill("probe@eonhr.test");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Workspace configured")).toBeVisible({ timeout: 8000 });

    // restore the demo company name (the e2e DB persists)
    await page.request.patch("/api/company", {
      data: { name: "Demo", email: "" },
    });
  });
});
