import { expect, test } from "@playwright/test";

/**
 * Session-44 / parity round 43 — the shadcn sidebar architecture + the
 * desktop collapse contracts.
 *
 * Covers the round's three fronts end to end:
 *  1. the SidebarNav restructure (the data-sidebar content div family,
 *     the shared menu-button base, the no-ul submenu, the attribute
 *     contract, the active custom-primary-bg recipe),
 *  2. the desktop collapse (the peer's data attrs flip, the 47px icon
 *     rail, the label/brand collapse, the expand-back),
 *  3. the trigger's matchMedia branch (desktop toggles the collapse —
 *     a programmatic click, the trigger is 0×0 inside the collapsed
 *     mobile header at desktop, REF's own dormant-UI placement; mobile
 *     opens the drawer instead).
 *
 * No hover assertions here — the documented headless
 * `@media (hover: hover)` trap (v4 wraps hover variants in the media
 * query, headless Chrome doesn't match it); the hover dimension stays
 * covered by the unit pins + the round's live verify script.
 */
const RAIL_WAIT = 450; // past the 200ms width/padding transitions

test.describe("session-44 sidebar shadcn architecture + desktop collapse", () => {
  test("the peer carries REF's four data attrs in the expanded state", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("[data-sidebar=\"sidebar\"]")).toBeVisible();

    const peer = page.locator(".group.peer");
    await expect(peer).toHaveAttribute("data-state", "expanded");
    await expect(peer).toHaveAttribute("data-collapsible", "");
    await expect(peer).toHaveAttribute("data-variant", "sidebar");
    await expect(peer).toHaveAttribute("data-side", "left");
  });

  test("the desktop trigger click collapses the sidebar to the 47px icon rail", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("[data-sidebar=\"sidebar\"]")).toBeVisible();

    // The trigger is 0×0 at desktop (it lives inside the md:hidden mobile
    // header — REF's own placement; dormant UI, reachable programmatically).
    await page.evaluate(() => {
      const btn = document.querySelector('[data-sidebar="trigger"]');
      if (!(btn instanceof HTMLElement)) throw new Error("trigger not found");
      btn.click();
    });
    await page.waitForTimeout(RAIL_WAIT);

    const peer = page.locator(".group.peer");
    await expect(peer).toHaveAttribute("data-state", "collapsed");
    await expect(peer).toHaveAttribute("data-collapsible", "icon");

    const rail = await page.evaluate(() => {
      const peer = document.querySelector(".group.peer")!;
      const wrap = peer.children[1] as HTMLElement;
      const inner = peer.querySelector('[data-sidebar="sidebar"]')!;
      const leaf = peer.querySelector('a[data-sidebar="menu-button"]')!;
      const content = peer.querySelector('[data-sidebar="content"]')!;
      const r = (el: Element) => el.getBoundingClientRect();
      const cs = getComputedStyle(leaf);
      return {
        wrapW: Math.round(r(wrap).width),
        innerW: Math.round(r(inner).width),
        leafW: Math.round(r(leaf).width),
        leafH: Math.round(r(leaf).height),
        leafPad: cs.padding,
        contentOverflow: getComputedStyle(content).overflow,
      };
    });
    // REF-measured rail geometry (live census): 48px wrap, 47px inner
    // (the border takes 1px), 32×32 buttons with the important-prefixed
    // 8px padding, the content's overflow member flips to hidden.
    expect(rail.wrapW).toBe(48);
    expect(rail.innerW).toBe(47);
    expect(rail.leafW).toBe(32);
    expect(rail.leafH).toBe(32);
    expect(rail.leafPad).toBe("8px");
    expect(rail.contentOverflow).toBe("hidden");
  });

  test("the rail collapses the group label and the brand text (the -mt-8/opacity-0 + 0-width members)", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("[data-sidebar=\"sidebar\"]")).toBeVisible();
    await page.evaluate(() => {
      const btn = document.querySelector('[data-sidebar="trigger"]');
      if (!(btn instanceof HTMLElement)) throw new Error("trigger not found");
      btn.click();
    });
    await page.waitForTimeout(RAIL_WAIT);

    const collapsed = await page.evaluate(() => {
      const peer = document.querySelector(".group.peer")!;
      const label = peer.querySelector('[data-sidebar="group-label"]')!;
      const labelCs = getComputedStyle(label);
      const h2 = peer.querySelector("h2")!;
      const span = peer.querySelector('a[data-sidebar="menu-button"] span');
      return {
        labelOpacity: labelCs.opacity,
        labelMarginTop: labelCs.marginTop,
        h2Width: Math.round(h2.getBoundingClientRect().width),
        spanWidth: span ? Math.round(span.getBoundingClientRect().width) : -1,
      };
    });
    expect(collapsed.labelOpacity).toBe("0");
    expect(collapsed.labelMarginTop).toBe("-32px");
    expect(collapsed.h2Width).toBe(0);
    expect(collapsed.spanWidth).toBe(0);
  });

  test("the second click expands back to the 256px sidebar", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("[data-sidebar=\"sidebar\"]")).toBeVisible();
    const clickTrigger = () =>
      page.evaluate(() => {
        const btn = document.querySelector('[data-sidebar="trigger"]');
        if (!(btn instanceof HTMLElement)) throw new Error("trigger not found");
        btn.click();
      });
    await clickTrigger();
    await page.waitForTimeout(RAIL_WAIT);
    await clickTrigger();
    await page.waitForTimeout(RAIL_WAIT);

    const peer = page.locator(".group.peer");
    await expect(peer).toHaveAttribute("data-state", "expanded");
    await expect(peer).toHaveAttribute("data-collapsible", "");
    const spacerW = await page.evaluate(() => {
      const peer = document.querySelector(".group.peer")!;
      return Math.round((peer.children[0] as HTMLElement).getBoundingClientRect().width);
    });
    expect(spacerW).toBe(256);
  });

  test("the mobile trigger opens the drawer, never the collapse", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard");
    // Mobile-ready signal: the bottom tab bar (the desktop sidebar is
    // display:none at this width).
    await expect(page.getByRole("link", { name: "Home", exact: true })).toBeVisible();

    // At 390px the header is live — the trigger is a visible button and the
    // authored branch routes the click to the drawer.
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    const panel = page.getByRole("dialog", { name: "Navigation menu" });
    await expect(panel).toBeVisible();

    // The peer never flipped (it is display:none at this width anyway — the
    // assertion pins the authored branch, not the rendering).
    await expect(page.locator(".group.peer")).toHaveAttribute("data-collapsible", "");
    await expect(page.locator(".group.peer")).toHaveAttribute("data-state", "expanded");
  });

  test("the attribute contract + the live counts on an open-group page (19 menu-buttons / 11 menu-items)", async ({ page }) => {
    await page.goto("/employees");
    await expect(page.getByRole("link", { name: "All Employees" })).toBeVisible();

    const census = await page.evaluate(() => {
      const scope = document.querySelector('[data-sidebar="sidebar"]')!;
      const buttons = [...scope.querySelectorAll('[data-sidebar="menu-button"]')];
      const items = [...scope.querySelectorAll('[data-sidebar="menu-item"]')];
      const submenu = scope.querySelector('[data-sidebar="menu"] > div[data-state] > div.pl-4, [data-sidebar="menu"] div.pl-4.space-y-1');
      const noUlInsideSubmenu = submenu ? !submenu.querySelector("ul") : null;
      const subleafLi = submenu ? [...submenu.children].map((c) => c.tagName.toLowerCase() + ":" + (c.getAttribute("data-sidebar") || "")) : [];
      const contractOK = buttons.every(
        (b) => b.getAttribute("data-size") === "default" && b.getAttribute("data-active") === "false"
      );
      const contentTag = scope.querySelector('[data-sidebar="content"]')!.tagName.toLowerCase();
      return {
        buttons: buttons.length,
        items: items.length,
        contractOK,
        contentTag,
        submenuClass: submenu ? submenu.className : null,
        noUlInsideSubmenu,
        subleafLi: subleafLi.slice(0, 2),
      };
    });
    // 5 standalone links + 8 toggles + 6 open-group subleaves (the Employees
    // group auto-opens on its child route); 5 standalone li + 6 subleaf li.
    expect(census.buttons).toBe(19);
    expect(census.items).toBe(11);
    expect(census.contractOK).toBe(true);
    expect(census.contentTag).toBe("div");
    expect(census.submenuClass).toBe("pl-4 space-y-1");
    expect(census.noUlInsideSubmenu).toBe(true);
    expect(census.subleafLi).toEqual(["li:menu-item", "li:menu-item"]);
  });

  test("the active subleaf carries the custom-primary-bg recipe + the inline blue style (REF's authored attributes)", async ({ page }) => {
    await page.goto("/employees");
    const active = page.locator('[data-sidebar="sidebar"] a[aria-current="page"]');
    await expect(active).toHaveAttribute("href", "/employees");
    // The hand-authored class (the unlayered rule paints the blue).
    await expect(active).toHaveClass(/custom-primary-bg/);
    // REF's authored inline style — React serializes it without the trailing
    // semicolon (the SSR-vs-CSR split; the CSSOM normalizes with it), so the
    // matcher accepts both forms.
    await expect(active).toHaveAttribute("style", /background-color:\s*rgb\(24,\s*119,\s*242\)/);
    // The rendered blue + white text + the 500 weight (the link's
    // font-medium, inherited by the text-sm span).
    await expect(active).toHaveCSS("background-color", "rgb(24, 119, 242)");
    await expect(active).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(active.locator("span")).toHaveCSS("font-weight", "500");
    // The toggle itself stays inactive (no pill on the group button).
    const toggle = page.getByRole("button", { name: "Employees", exact: true });
    await expect(toggle).toHaveClass(/text-slate-600/);
  });

  test("the open group's chevron is the down glyph, the closed group's the right glyph (no rotation)", async ({ page }) => {
    await page.goto("/employees");
    await expect(page.getByRole("link", { name: "All Employees" })).toBeVisible();
    const openToggle = page.getByRole("button", { name: "Employees", exact: true });
    await expect(openToggle.locator(".lucide-chevron-down")).toHaveCount(1);
    await expect(openToggle.locator(".lucide-chevron-right")).toHaveCount(0);

    // A closed group (Payroll) carries the right glyph.
    const closedToggle = page.getByRole("button", { name: "Payroll", exact: true });
    await expect(closedToggle.locator(".lucide-chevron-right")).toHaveCount(1);
    await expect(closedToggle.locator(".lucide-chevron-down")).toHaveCount(0);
  });
});
