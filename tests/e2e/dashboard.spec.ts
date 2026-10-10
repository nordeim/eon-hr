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

  test("primary CTA buttons use the reference gradient recipe (session 4)", async ({ page }) => {
    await page.goto("/employees");
    // Reference: blue-600 -> indigo-600 gradient (#2563EB -> #4F46E5), sRGB
    // interpolation (the ref's computed value is "linear-gradient(to right,
    // rgb(37,99,235), rgb(79,70,229))"; Chromium may serialize the direction
    // keyword as the equivalent 90deg — both render identically), radius 6px,
    // text #FAFAFA. NOT solid #1877F2, NOT oklab interpolation.
    const add = page.getByRole("button", { name: "Add Employee" }).first();
    const bg = await add.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg).toContain("rgb(37, 99, 235)");
    expect(bg).toContain("rgb(79, 70, 229)");
    expect(bg).not.toContain("in oklab");
    expect(/to right|90deg/.test(bg)).toBe(true);
    await expect(add).toHaveCSS("border-radius", "6px");
    await expect(add).toHaveCSS("color", "rgb(250, 250, 250)");
  });

  test("dashboard cards render the reference card recipe (session 6)", async ({ page }) => {
    await page.goto("/dashboard");
    // Reference (live-measured): CardTitle 16px/600 with 24px line-height,
    // color #0A0A0A (the neutral foreground token); the leave-balances card
    // lands at y=160 h=222 with its 56px header and 217px content block.
    const title = page.getByRole("heading", { name: "My Leave Balances" });
    await expect(title).toHaveCSS("font-size", "16px");
    await expect(title).toHaveCSS("font-weight", "600");
    await expect(title).toHaveCSS("line-height", "24px");
    await expect(title).toHaveCSS("color", "rgb(10, 10, 10)");
    const card = page.locator("[data-widget='leave-balances']");
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.round(box!.y)).toBe(160);
    expect(Math.round(box!.height)).toBe(222);
    // Balance value inherits the neutral foreground (rgb(10,10,10)), NOT
    // slate-900.
    await expect(page.getByText("21 / 21 days")).toHaveCSS("color", "rgb(10, 10, 10)");
    // Quick-actions grid: 8px gaps (gap-2), not 12px.
    const grid = page.locator("[data-widget='quick-actions'] .grid");
    await expect(grid).toHaveCSS("gap", "8px");
    // Body text is the neutral foreground, not slate-tinted #111827.
    await expect(page.locator("body")).toHaveCSS("color", "rgb(10, 10, 10)");
  });

  test("shell canvas gradient paints on the shell root (session 6)", async ({ page }) => {
    await page.goto("/dashboard");
    // Reference: the shell root div carries the slate-50 -> blue-50 canvas
    // gradient (stretches with content, unlike a fixed body background).
    // main's parent's parent = the shell root.
    const shell = page.locator("main").locator("xpath=../..");
    const img = await shell.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(img).toContain("rgb(248, 250, 252)");
    expect(img).toContain("rgb(239, 246, 255)");
    expect(img).not.toContain("in oklab");
    // The body keeps a plain white base (reference --background 0 0% 100%).
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  });

  test("payroll page renders the reference per-page canvas + CTA (session 6)", async ({ page }) => {
    await page.goto("/payroll");
    // Reference: page root paints from-green-50 to-blue-50 over the shell
    // canvas; the header CTA is the green->emerald gradient (#16A34A ->
    // #059669); stat tiles are 48px bg-green-100 with 24px green-600 icons
    // and 30px/700 values; the empty-state CTA is the dark shadcn default
    // (#171717).
    const pageGrad = page.locator("main > div");
    const img = await pageGrad.first().evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(img).toContain("rgb(240, 253, 244)");
    expect(img).toContain("rgb(239, 246, 255)");
    const cta = page.getByRole("button", { name: "Add Payroll" }).first();
    const bg = await cta.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg).toContain("rgb(22, 163, 74)");
    expect(bg).toContain("rgb(5, 150, 105)");
    expect(bg).not.toContain("in oklab");
    const tile = page.locator(".text-3xl").first().locator("xpath=../..").locator("div[class*='p-3']");
    await expect(tile).toHaveCSS("background-color", "rgb(220, 252, 231)");
    const val = page.getByText("0 SAR");
    await expect(val).toHaveCSS("font-size", "30px");
    await expect(val).toHaveCSS("color", "rgb(15, 23, 42)");
    const emptyBtn = page.locator("div[class*='p-12']").getByRole("button", { name: "Add Payroll" });
    await expect(emptyBtn).toHaveCSS("background-color", "rgb(23, 23, 23)");
    await expect(emptyBtn).toHaveCSS("color", "rgb(250, 250, 250)");
  });

  test("task manager renders the reference board + toggle (session 6)", async ({ page }) => {
    await page.goto("/taskmanager");
    // Reference: plain flex gap-2 toggle — active button is the shadcn
    // default dark (#171717), inactive is outline; board goes 5-up from md;
    // columns are bare space-y-3 rounded-lg p-3; count chips are
    // rounded-md font-semibold slate-700 on slate-100; empty columns
    // render nothing below the header.
    const kanban = page.getByRole("button", { name: "Kanban", exact: true });
    await expect(kanban).toHaveCSS("background-color", "rgb(23, 23, 23)");
    await expect(kanban).toHaveCSS("color", "rgb(250, 250, 250)");
    await expect(page.getByRole("button", { name: "Projects", exact: true })).toHaveCSS(
      "background-color",
      "rgb(255, 255, 255)"
    );
    const board = page.locator("div.md\\:grid-cols-5").first();
    await expect(board).toHaveCSS("grid-template-columns", /^(\d+(\.\d+)?px ){4}\d+(\.\d+)?px$/);
    const chip = page.locator("span.text-xs.font-semibold").first();
    await expect(chip).toHaveCSS("border-radius", "6px");
    await expect(chip).toHaveCSS("color", "rgb(51, 65, 85)");
    await expect(chip).toHaveCSS("background-color", "rgb(241, 245, 249)");
    expect(await page.getByText("No tasks").count()).toBe(0);
  });
});

// End-to-end CRUD through the real UI — the reference 4-step Add Employee
// wizard: personal → job → contract → documents, then delete (restores the
// seeded state). Session 7 (R6-C): the wizard renders as an INLINE
// page-replacing view (back button + h1 + max-w-4xl card) — not a modal.
test.describe("employees CRUD (4-step wizard)", () => {
  test("create → list → search → delete round-trip", async ({ page }) => {
    await page.goto("/employees");
    await expect(page.getByRole("heading", { name: "Employees", exact: true })).toBeVisible();

    // Open the wizard — the list view is replaced by the inline wizard
    await page.getByRole("button", { name: "Add Employee" }).first().click();
    const wizard = page.locator("main");
    await expect(wizard.getByRole("heading", { name: "Add New Employee" })).toBeVisible();
    await expect(wizard.getByRole("button", { name: "Back to employees" })).toBeVisible();

    // Inline card recipe (reference: max-w-4xl mx-auto, p-8 interior) and
    // step rail (48px icon circles, active blue-600).
    const card = wizard.locator("div.max-w-4xl");
    await expect(card).toBeVisible();
    await expect(card).toHaveCSS("border-radius", "12px");
    const activeCircle = card.locator("div.h-12").first();
    await expect(activeCircle).toHaveCSS("background-color", "rgb(37, 99, 235)");
    await expect(activeCircle.locator("svg")).toHaveCSS("height", "24px");

    // Step 1 — Personal Information (Next disabled until required fields)
    const next = wizard.getByRole("button", { name: "Next" });
    await expect(next).toBeDisabled();
    await wizard.getByLabel("Full Name *").fill("E2E Temperson");
    await wizard.getByLabel("Work Email *").fill("e2e-temp@eon-hr.test");
    await wizard.getByLabel("Nationality").fill("Saudi Arabia");
    await expect(next).toBeEnabled();
    await next.click();

    // Step 2 — Job Information
    await expect(wizard.getByText("Job Information")).toBeVisible();
    await expect(next).toBeDisabled();
    await wizard.getByLabel("Job Title *").fill("QA Probe");
    await wizard.getByLabel("Start Date *").fill("2026-10-01");
    await expect(next).toBeEnabled();
    await next.click();

    // Step 3 — Contract Information (all optional, defaults visible)
    await expect(wizard.getByText("Contract Information")).toBeVisible();
    await next.click();

    // Step 4 — Documents & Attachments → Create; the wizard unmounts and
    // the list view returns.
    await expect(wizard.getByText("Documents & Attachments")).toBeVisible();
    await wizard.getByRole("button", { name: "Create Employee" }).click();
    await expect(wizard.getByRole("heading", { name: "Add New Employee" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Employees", exact: true })).toBeVisible();

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
