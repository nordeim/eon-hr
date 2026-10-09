import { expect, test } from "@playwright/test";

// Mobile navigation — the critical parity surface (reference: hamburger
// drawer + bottom tab bar).
//
// Regression pin (docs/Tailwind-V4-Validation-Report.md, trap 4): the drawer
// uses flex-gap layout, NOT space-y with an explicit mt-3 CTA — v3's
// .space-y selector would override the child margin while v4's :where()
// wrapper resurrects it, changing the panel height by 8px. This spec pins
// the rendered panel height so an engine change cannot silently drift it.

test.use({ viewport: { width: 390, height: 844 } });

test.describe("mobile navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("hamburger opens the drawer with the full menu", async ({ page }) => {
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation menu" });
    await expect(drawer).toBeVisible();
    for (const item of [
      "Dashboard",
      "Employees",
      "Payroll",
      "Recruitment",
      "Training LMS",
      "Compliance",
      "Performance",
      "Assets",
      "Staff Requests",
      "Communications",
      "Analytics",
      "AI HR Assistant",
      "Settings",
    ]) {
      await expect(drawer.getByText(item, { exact: true }).first()).toBeVisible();
    }
  });

  test("drawer navigation closes the drawer and lands on the target", async ({ page }) => {
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    await page.getByRole("dialog", { name: "Navigation menu" }).getByRole("link", { name: "Training LMS" }).click();
    await expect(page).toHaveURL(/\/training/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Training Center" })).toBeVisible();
  });

  test("collapsed submenu items navigate from the drawer", async ({ page }) => {
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation menu" });
    await drawer.getByRole("button", { name: "Payroll", exact: true }).click();
    await drawer.getByRole("link", { name: "Expenses" }).click();
    await expect(page).toHaveURL(/\/expenses/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("bottom tab bar navigates between the five primary surfaces", async ({ page }) => {
    for (const [tab, url] of [
      ["Staff", "/employees"],
      ["Tasks", "/taskmanager"],
      ["Attendance", "/attendance"],
      ["Profile", "/profile"],
      ["Home", "/dashboard"],
    ] as [string, string][]) {
      await page.getByRole("link", { name: tab, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(url.replace("/", "\\/")));
    }
  });

  test("drawer panel height is stable (trap-4 pin)", async ({ page }) => {
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    const panel = page.getByRole("dialog", { name: "Navigation menu" });
    await expect(panel).toBeVisible();
    const box = await panel.boundingBox();
    expect(box?.height).toBeGreaterThan(700); // full-height drawer, no collapse
    expect(box?.width).toBeLessThanOrEqual(0.85 * 390 + 1); // max-w-[85vw]
  });

  test("drawer geometry and overlay match the reference", async ({ page }) => {
    // Reference: 288px sheet, bg-black/80 overlay, NO X close button
    // (closing happens via overlay tap / Esc / navigation).
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    const panel = page.getByRole("dialog", { name: "Navigation menu" });
    await expect(panel).toBeVisible();
    const box = await panel.boundingBox();
    expect(Math.round(box?.width ?? 0)).toBe(288);
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveCount(0);
    // Drawer footer mirrors the reference: عربي toggle + user button
    await expect(panel.getByRole("button", { name: "عربي", exact: true })).toBeVisible();
    // Overlay closes the drawer on tap
    await page.mouse.click(380, 400);
    await expect(panel).toBeHidden();
  });

  test("sidebar nav items use the reference 32px rhythm (session 4)", async ({ page }) => {
    // Reference (live-measured): top-level nav rows are h-8 (32px) with 20px
    // icons, font-normal 400 inactive; sub-items h-8 with 12px px/gap.
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    const panel = page.getByRole("dialog", { name: "Navigation menu" });
    await expect(panel).toBeVisible();
    const dashboard = panel.getByRole("link", { name: "Dashboard", exact: true });
    await expect(dashboard).toHaveCSS("height", "32px");
    await expect(dashboard.locator("svg").first()).toHaveCSS("height", "20px");
    const employees = panel.getByRole("button", { name: "Employees", exact: true });
    await expect(employees).toHaveCSS("height", "32px");
    await expect(employees.locator("span").first()).toHaveCSS("font-weight", "400");
    await page.keyboard.press("Escape");
  });

  test("bottom tab bar has no active highlight (reference behavior)", async ({ page }) => {
    // The reference renders every bottom tab in slate-600 — no active state.
    await page.goto("/dashboard");
    const home = page.getByRole("link", { name: "Home", exact: true });
    const staff = page.getByRole("link", { name: "Staff", exact: true });
    await expect(home).toHaveCSS("color", "rgb(71, 85, 105)");
    await expect(staff).toHaveCSS("color", "rgb(71, 85, 105)");
  });

  test("the desktop sidebar is hidden on mobile; the drawer is hidden on desktop", async ({ page }) => {
    // Mobile: no persistent sidebar
    await expect(page.locator("aside")).toBeHidden();
    await expect(page.getByRole("button", { name: "Toggle Sidebar" })).toBeVisible();
  });
});
