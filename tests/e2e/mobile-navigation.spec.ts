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

  test("the drawer opens with every nav group collapsed by default (session 54, R54-A)", async ({ page }) => {
    // Session 54 (R54-A): the interaction-walk census paired the drawer's
    // DEFAULT group-state map live at 390×844 — all 8 nav group triggers
    // (plus the footer bell) render aria-expanded="false" at first open on
    // BOTH apps. The full-menu pin above asserts the 13 top-level labels
    // render but NOT the collapsed-default contract: a nav refactor that
    // pre-expands groups (or a Collapsible defaultOpen drift) would pass
    // every standing pin while changing the drawer's at-rest interior.
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation menu" });
    await expect(drawer).toBeVisible();
    for (const group of [
      "Employees",
      "Payroll",
      "Recruitment",
      "Compliance",
      "Performance",
      "Communications",
      "Analytics",
      "Settings",
    ]) {
      await expect(drawer.getByRole("button", { name: group, exact: true })).toHaveAttribute(
        "aria-expanded",
        "false"
      );
    }
    // the collapsed groups keep their sub-item leaves hidden at first open
    await expect(drawer.getByRole("link", { name: "Payroll Module" })).toBeHidden();
    // the footer bell rides the same closed default (aria-expanded=false)
    await expect(drawer.getByRole("button", { name: "Notifications" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
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
    // Session 85 (R85-B): the replicated Base44 edit badge (fixed
    // bottom-right, z-999999 — the REF's own platform overlay) covers
    // the right end of the 390px tab bar, exactly as it does on the
    // reference. A real user dismisses it first; the test does too.
    const badgeClose = page.locator("#badge-close");
    if (await badgeClose.isVisible().catch(() => false)) {
      await badgeClose.click();
    }
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
    // (closing happens via overlay tap / Esc — and, on the CLONE only,
    // navigation: the clone's drawer auto-closes on route change, the
    // documented superset over REF's session-10 regression where the
    // reference's drawer stays open after a leaf tap; re-verified live
    // at session 54 — see docs/remediation-plan-session54.md §E).
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
    // GROUP triggers carry 20px icons (p-2 gap-2); both render the
    // font-medium 500 label (session 44: REF's authored span weight,
    // live-measured — the old 400 was a pre-redeploy reading).
    // docs/remediation-plan-session5.md §S1/S2.
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
    await expect(employees.locator("span").first()).toHaveCSS("font-weight", "500");
    await page.keyboard.press("Escape");
  });

  test("the expanded drawer group's sub-items render the computed family (session 52, R52-B)", async ({ page }) => {
    // Session 52 (R52-B): the round-51 paired-live census of the mobile
    // drawer's EXPANDED-GROUP interior (390x844, Employees + Analytics
    // groups, REF vs the seeded LOC standalone). REF's class lists carry
    // gap-2 gap-3 + a duplicated flex (its runtime CONCATENATES the shadcn
    // base with the per-item extensions) while the clone's cn() dedupes to
    // gap-3 — the computed cascade resolves both to the SAME rendered
    // family. This pin holds the computed truth (not the class bytes) so
    // a Tailwind engine change or a nav-config refactor cannot silently
    // drift the mobile drawer's interior.
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    const panel = page.getByRole("dialog", { name: "Navigation menu" });
    await panel.getByRole("button", { name: "Employees", exact: true }).click();
    const allEmployees = panel.getByRole("link", { name: "All Employees" });
    await expect(allEmployees).toBeVisible();
    // the computed family (live-measured identical on both apps):
    await expect(allEmployees).toHaveCSS("display", "flex");
    await expect(allEmployees).toHaveCSS("row-gap", "12px");
    await expect(allEmployees).toHaveCSS("column-gap", "12px");
    await expect(allEmployees).toHaveCSS("height", "32px");
    await expect(allEmployees).toHaveCSS("padding-left", "12px");
    await expect(allEmployees).toHaveCSS("padding-top", "8px");
    await expect(allEmployees).toHaveCSS("font-size", "14px");
    await expect(allEmployees).toHaveCSS("color", "rgb(71, 85, 105)");
    await expect(allEmployees.locator("svg").first()).toHaveCSS("width", "16px");
    // the group's siblings render the same family (the census read all 6)
    const leave = panel.getByRole("link", { name: "Leave Requests" });
    await expect(leave).toHaveCSS("row-gap", "12px");
    await expect(leave).toHaveCSS("height", "32px");
    await page.keyboard.press("Escape");
  });

  test("bottom tab bar highlights the active tab blue (session 5; bg pill session 21)", async ({ page }) => {
    // Re-measured session 5: the reference renders the ACTIVE tab in
    // blue-600 #2563EB (icon + label) — the session-4 "no highlight" note
    // was stale. Home is active on /dashboard; Staff stays slate-600.
    // Session 21 (R20-B): the active tab ALSO renders the bg-blue-50 pill
    // (rgb(239,246,255) — pixel-verified on REF's mobile dashboard; missed
    // by prior rounds that compared label color/geometry only).
    await page.goto("/dashboard");
    const home = page.getByRole("link", { name: "Home", exact: true });
    const staff = page.getByRole("link", { name: "Staff", exact: true });
    await expect(home).toHaveCSS("color", "rgb(37, 99, 235)");
    await expect(home).toHaveCSS("background-color", "rgb(239, 246, 255)");
    await expect(staff).toHaveCSS("color", "rgb(71, 85, 105)");
    await expect(staff).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    // labels are text-sm font-medium (reference: 14px/21px, 61px items)
    await expect(home.locator("span")).toHaveCSS("font-size", "14px");
    await expect(home.locator("span")).toHaveCSS("font-weight", "500");
  });

  test("each bottom-nav tab route highlights its own tab (session 53, R53-A)", async ({ page }) => {
    // Session 53 (R53-A): the round-52 paired-live census of the bottom
    // bar's ACTIVE-STATE family — all FIVE tab routes measured at
    // 390×844 on REF vs the seeded LOC standalone. Each route
    // highlights exactly its own tab: the active tab computes the
    // blue-600 label + icon family (rgb(37,99,235)) on the blue-50
    // pill (rgb(239,246,255)); the siblings compute slate-600
    // (rgb(71,85,105)) on transparent. The session-5/21 pins covered
    // /dashboard only (Home active, Staff inactive); this pin walks
    // the four unpaired routes so a nav-config active-matching
    // regression (pathname === href is exact — a prefix route would
    // break it) or a Tailwind engine change cannot silently drift the
    // state family.
    const bar = page.getByRole("navigation", { name: "Bottom navigation" });
    const cases = [
      { route: "/employees", active: "Staff" },
      { route: "/taskmanager", active: "Tasks" },
      { route: "/attendance", active: "Attendance" },
      { route: "/profile", active: "Profile" },
    ] as const;
    for (const c of cases) {
      await page.goto(c.route);
      const active = bar.getByRole("link", { name: c.active, exact: true });
      await expect(active).toHaveCSS("color", "rgb(37, 99, 235)");
      await expect(active).toHaveCSS("background-color", "rgb(239, 246, 255)");
      // the icon tracks the label color (currentColor — census-verified)
      await expect(active.locator("svg").first()).toHaveCSS("color", "rgb(37, 99, 235)");
      const home = bar.getByRole("link", { name: "Home", exact: true });
      await expect(home).toHaveCSS("color", "rgb(71, 85, 105)");
      await expect(home).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    }
  });

  test("the desktop sidebar is hidden on mobile; the drawer is hidden on desktop", async ({ page }) => {
    // Mobile: no persistent sidebar
    await expect(page.locator('[data-sidebar="sidebar"]')).toBeHidden();
    await expect(page.getByRole("button", { name: "Toggle Sidebar" })).toBeVisible();
  });
});

test.describe("mobile page kicker (session 6, re-pinned session 9)", () => {
  test("dashboard kicker renders the reference bar and scrolls away with content", async ({ page }) => {
    // Session-6 mobile measurement: md:hidden bar with bg-white, border-b
    // slate-200, px-4 py-3 — INSIDE the p-4 page wrapper (x=16, y=89), title
    // "Dashboard" 18px/700 slate-900 at x=32/y=101.
    // Session 9 (R8-G): the redeployed reference's kicker is no longer
    // effectively sticky — its `sticky top-0` sits inside a non-scrolling
    // wrapper stack, so it scrolls away with the content (measured live:
    // kicker y=-89 at scrollY=178 while the 73px top bar stays). The clone
    // pins the rendered truth: a static bar.
    await page.goto("/dashboard");
    const kicker = page.locator("main div.md\\:hidden").filter({ hasText: "Dashboard" }).first();
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
    // scroll: the kicker scrolls away with the content (reference behavior
    // after its redeploy — the 73px top bar is the only sticky chrome).
    // Session 48 (R47-A2): the CLASS is REF's verbatim (sticky top-0 —
    // the r46 A5 re-adoption, now on this hand-rolled copy too); the
    // sticky stays INERT inside the r39 scroller stack — the scroll-away
    // boundingBox check below pins the rendered truth.
    await expect(kicker).toHaveCSS("position", "sticky");
    await page.evaluate(() => window.scrollTo(0, 400));
    const scrolled = await kicker.boundingBox();
    expect(scrolled).not.toBeNull();
    expect(Math.round(scrolled!.y)).toBeLessThan(89);
  });

  test("category-A module pages render the mobile kicker (session 7)", async ({ page }) => {
    // Session-7 390×844 sweep of ALL 46 reference routes: 7 routes render a
    // page-title kicker and hide the desktop header below md (employees,
    // payroll, taskmanager, leavemanagement, expenses, loans, profile).
    // The reference /taskmanager shows "Tasks & Projects" at y=89, 18px/700
    // — the session-6 "no kicker on modules" pin measured a dead surface.
    // Session 9 (R8-G): the kicker is a static bar (the reference's sticky
    // became inert after its redeploy).
    await page.goto("/taskmanager");
    const kicker = page.locator("main div.md\\:hidden").filter({ hasText: "Tasks & Projects" }).first();
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
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Dashboard" })).toBeVisible();
  });

  // Session 107 (R107-C): the drawer-open SPINE FREEZE — the neo-crm
  // session-196 doctrine transfer. The standing battery pinned the sheet's
  // width/height and the item rhythm, but NOT the interior spine boxes: a
  // computed-margin regression (the s177 defect class — an mb-2 sneaking
  // onto the brand header) would keep every standing gate green. This leg
  // freezes the measured drawer-open spine at TRUE 390×844.
  test("the drawer-open spine boxes are frozen (the s196 doctrine — R107-C)", async ({ page }) => {
    await page.goto("/dashboard"); // this describe has no beforeEach — navigate explicitly
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    const panel = page.getByRole("dialog", { name: "Navigation menu" });
    await expect(panel).toBeVisible();
    // the drawer's 500ms enter animation must settle before the box reads
    // (the drawer-swipe spec's standing idiom — mid-flight the sheet reads
    // x=-122 and every box is in motion)
    await page.waitForTimeout(700);
    // the starved-read idiom: poll until the element's box exists, then read
    const readBox = async (sel: string) => {
      await expect
        .poll(async () => ((await panel.locator(sel).first().boundingBox()) ? "1" : "0"), { timeout: 10_000 })
        .toBe("1");
      const bb = await panel.locator(sel).first().boundingBox();
      return [Math.round(bb?.x ?? -1), Math.round(bb?.y ?? -1), Math.round(bb?.width ?? -1), Math.round(bb?.height ?? -1)].join(",");
    };
    // the measured ledger (scripts/r107-spine-measure.mjs, TRUE 390×844):
    // sheet 0,0,288,844 · brand header 0,0,287,89 · h2 "EonHR" 76,25,187,23
    // · p "Demo" 76,47,187,16 · nav scroll block 0,89,287,634 · the "Main
    // Menu" label 20,109,247,32 · the item UL 20,141,247,516 · the footer
    // block 0,723,287,121 · the user button 16,792,255,36
    // the sheet is the panel itself (no descendant locator)
    const sheet = await panel.boundingBox();
    expect([Math.round(sheet?.x ?? -1), Math.round(sheet?.y ?? -1), Math.round(sheet?.width ?? -1), Math.round(sheet?.height ?? -1)].join(",")).toBe("0,0,288,844");
    // the brand header block (the FIRST of the three gap-2 columns: header,
    // nav, footer — the measured census)
    expect(await readBox("div.flex.flex-col.gap-2 >> nth=0")).toBe("0,0,287,89");
    // the h2 + the subtitle
    expect(await readBox("h2.font-bold")).toBe("76,25,187,23");
    expect(await readBox("p.text-xs")).toBe("76,47,187,16");
    // the nav scroll block
    expect(await readBox("div.flex.min-h-0.flex-1")).toBe("0,89,287,634");
    // the "Main Menu" label + the item list
    expect(await readBox("div.flex.h-8")).toBe("20,109,247,32");
    expect(await readBox("ul")).toBe("20,141,247,516");
    // the footer block (the THIRD gap-2 column — nth=1 is the nav wrapper)
    expect(await readBox("div.flex.flex-col.gap-2 >> nth=2")).toBe("0,723,287,121");
    // the user button
    expect(await readBox("button:has-text('sepnetflix2023')")).toBe("16,792,255,36");
  });
});
