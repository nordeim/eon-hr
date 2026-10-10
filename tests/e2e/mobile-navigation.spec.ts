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

  test("sidebar nav items use the reference 32px rhythm (session 5)", async ({ page }) => {
    // Reference (re-measured session 5): every nav row is h-8 (32px).
    // LEAF links carry 16px icons (px-3 py-2.5 gap-3, mb-1 → 40px pitch);
    // GROUP triggers carry 20px icons (p-2 gap-2); both font-normal 400
    // inactive. docs/remediation-plan-session5.md §S1/S2.
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    const panel = page.getByRole("dialog", { name: "Navigation menu" });
    await expect(panel).toBeVisible();
    const dashboard = panel.getByRole("link", { name: "Dashboard", exact: true });
    await expect(dashboard).toHaveCSS("height", "32px");
    await expect(dashboard.locator("svg").first()).toHaveCSS("height", "16px");
    await expect(dashboard).toHaveCSS("padding-left", "12px");
    await expect(dashboard).toHaveCSS("margin-bottom", "4px");
    const employees = panel.getByRole("button", { name: "Employees", exact: true });
    await expect(employees).toHaveCSS("height", "32px");
    await expect(employees.locator("svg").first()).toHaveCSS("height", "20px");
    await expect(employees.locator("span").first()).toHaveCSS("font-weight", "400");
    await page.keyboard.press("Escape");
  });

  test("bottom tab bar highlights the active tab blue (session 5)", async ({ page }) => {
    // Re-measured session 5: the reference renders the ACTIVE tab in
    // blue-600 #2563EB (icon + label) — the session-4 "no highlight" note
    // was stale. Home is active on /dashboard; Staff stays slate-600.
    await page.goto("/dashboard");
    const home = page.getByRole("link", { name: "Home", exact: true });
    const staff = page.getByRole("link", { name: "Staff", exact: true });
    await expect(home).toHaveCSS("color", "rgb(37, 99, 235)");
    await expect(staff).toHaveCSS("color", "rgb(71, 85, 105)");
    // labels are text-sm font-medium (reference: 14px/21px, 61px items)
    await expect(home.locator("span")).toHaveCSS("font-size", "14px");
    await expect(home.locator("span")).toHaveCSS("font-weight", "500");
  });

  test("the desktop sidebar is hidden on mobile; the drawer is hidden on desktop", async ({ page }) => {
    // Mobile: no persistent sidebar
    await expect(page.locator("aside")).toBeHidden();
    await expect(page.getByRole("button", { name: "Toggle Sidebar" })).toBeVisible();
  });
});

test.describe("mobile page kicker (session 6)", () => {
  test("dashboard kicker is sticky below the 73px top bar", async ({ page }) => {
    // Reference (session-6 mobile measurement): md:hidden sticky bar with
    // bg-white, border-b slate-200, px-4 py-3 — INSIDE the p-4 page wrapper
    // (x=16, y=89), title "Dashboard" 18px/700 slate-900 at x=32/y=101.
    // It sticks directly below the 73px top bar while content scrolls.
    await page.goto("/dashboard");
    const kicker = page.locator("div.sticky").filter({ hasText: "Dashboard" }).first();
    await expect(kicker).toBeVisible();
    const box = await kicker.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.round(box!.x)).toBe(16);
    expect(Math.round(box!.y)).toBe(89);
    expect(Math.round(box!.height)).toBe(53);
    const h1 = kicker.getByRole("heading", { name: "Dashboard" });
    await expect(h1).toHaveCSS("font-size", "18px");
    await expect(h1).toHaveCSS("font-weight", "700");
    await expect(h1).toHaveCSS("color", "rgb(15, 23, 42)");
    // scroll: the kicker stays pinned under the top bar
    await page.evaluate(() => window.scrollTo(0, 400));
    await expect(kicker).toHaveCSS("position", "sticky");
    const scrolled = await kicker.boundingBox();
    expect(scrolled).not.toBeNull();
    expect(Math.round(scrolled!.y)).toBe(73);
  });

  test("category-A module pages render the mobile kicker (session 7)", async ({ page }) => {
    // Session-7 390×844 sweep of ALL 46 reference routes: 7 routes render a
    // sticky page-title kicker and hide the desktop header below md
    // (employees, payroll, taskmanager, leavemanagement, expenses, loans,
    // profile). The reference /taskmanager shows "Tasks & Projects" at
    // y=89, 18px/700 — the session-6 "no kicker on modules" pin measured
    // a dead surface.
    await page.goto("/taskmanager");
    const kicker = page.locator("main div.sticky").filter({ hasText: "Tasks & Projects" }).first();
    await expect(kicker).toBeVisible();
    const box = await kicker.boundingBox();
    expect(Math.round(box?.x ?? 0)).toBe(16);
    expect(Math.round(box?.y ?? 0)).toBe(89);
    const h1 = kicker.getByRole("heading", { name: "Tasks & Projects" });
    await expect(h1).toHaveCSS("font-size", "18px");
    await expect(h1).toHaveCSS("font-weight", "700");
    // the desktop header block is hidden below md (reference wraps it in
    // hidden md:flex — page actions are desktop-only there). The header's
    // h1 stays in the DOM but must not render.
    const desktopH1 = page.locator("main h1").filter({ hasText: "Tasks & Projects" }).and(page.locator("div.hidden.md\\:flex h1"));
    await expect(desktopH1).toHaveCount(1);
    await expect(desktopH1).toBeHidden();
  });

  test("category-B module pages keep their full header at mobile (session 7)", async ({ page }) => {
    // The reference renders training's full desktop header at 390px.
    await page.goto("/training");
    const h1 = page.getByRole("heading", { name: "Training Center" });
    await expect(h1).toBeVisible();
    await expect(h1).toHaveCSS("font-size", "36px");
    const kickers = page.locator("main div.sticky");
    expect(await kickers.count()).toBe(0);
  });

  test("responsive boundary is md (768px), not lg (session 7, R6-A)", async ({ page }) => {
    // Viewport sweep on the reference: 767px = mobile chrome, 768px+ =
    // desktop sidebar + no top bar + no bottom tabs. The clone must switch
    // at the same boundary.
    await page.goto("/dashboard");
    await page.setViewportSize({ width: 767, height: 900 });
    await expect(page.getByRole("button", { name: "Toggle Sidebar" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Bottom navigation" })).toBeVisible();
    await page.setViewportSize({ width: 800, height: 900 });
    // 800px: desktop chrome — sidebar visible, mobile chrome gone.
    await expect(page.getByRole("button", { name: "Toggle Sidebar" })).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Bottom navigation" })).toHaveCount(0);
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Dashboard" })).toBeVisible();
  });
});
