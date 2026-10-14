import { expect, test } from "@playwright/test";

/**
 * Session 36 (R35-A): the user-dropdown menu contract — the round's
 * census measured the footer user menu's interior for the first time
 * (round 22 had pinned only its MOTION).
 *
 * REF-measured at 1440×900:
 *  - the menu renders TWO items only (My Profile + Logout — no role
 *    Label, no Separator): 192×74, the width a FIXED w-48
 *  - align=end (the menu's right edge = the trigger's right edge) and
 *    sideOffset=4 (the menu's bottom sits 4px above the trigger)
 *  - the container: rounded-md (6px), p-1, w-48 (192px)
 *  - the items: cursor-default + rounded-sm, 32px rows, 16px icons
 *    (CircleUser + LogOut, both mr-2 over the item's gap-2 → 16px
 *    icon-to-text), Logout at red-600
 */
test.describe("user menu (session 36)", () => {
  test("opens on click with REF's two-item interior and the align=end geometry", async ({ page }) => {
    await page.goto("/settings");
    const trigger = page.getByRole("button", { name: /sepnetflix2023/ }).first();
    // Measure the trigger BEFORE opening — Radix marks the outside world
    // aria-hidden while the menu is open, which hides the trigger from
    // role-based locators.
    const triggerBox = await trigger.boundingBox();
    expect(triggerBox).not.toBeNull();
    await trigger.click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    // The enter animation (zoom-in-95) scales the box mid-flight — the
    // earlier failures (191/190) measured the transform's tail. Poll
    // until the transform reaches its settled range (≥190 of the 192)
    // BEFORE reading the interior.
    await expect
      .poll(async () => Math.round((await menu.boundingBox())!.width), {
        timeout: 3000,
        intervals: [50],
      })
      .toBeGreaterThanOrEqual(190);

    const geo = await menu.evaluate((m: HTMLElement) => {
      const items = Array.from(m.querySelectorAll('[role="menuitem"]'));
      const first = items[0] as HTMLElement;
      const fcs = getComputedStyle(first);
      const logout = items[items.length - 1] as HTMLElement;
      const lcs = getComputedStyle(logout);
      const firstSvg = first.querySelector("svg") as SVGElement;
      const firstSvgBox = firstSvg.getBoundingClientRect();
      const firstText = Array.from(first.childNodes).find(
        (n) => n.nodeType === 3 && n.textContent?.trim()
      ) as Text | undefined;
      const range = document.createRange();
      if (firstText) range.selectNodeContents(firstText);
      const textBox = firstText ? range.getBoundingClientRect() : null;
      const mr = m.getBoundingClientRect();
      const mcs = getComputedStyle(m);
      return {
        itemCount: items.length,
        hasLabel: m.textContent?.includes("Admin") ?? false,
        itemH: Math.round(first.getBoundingClientRect().height),
        itemCursor: fcs.cursor,
        logoutColor: lcs.color,
        menuRadius: mcs.borderRadius,
        menuW: Math.round(mr.width),
        iconW: Math.round(firstSvgBox.width),
        iconToText: textBox ? Math.round(textBox.x - (firstSvgBox.x + firstSvgBox.width)) : -1,
      };
    });
    expect(geo.itemCount).toBe(2);
    expect(geo.hasLabel).toBe(false);
    expect(geo.itemH).toBe(32);
    expect(geo.itemCursor).toBe("default");
    expect(geo.logoutColor).toBe("rgb(220, 38, 38)"); // red-600
    expect(geo.menuRadius).toBe("6px");
    // The FIXED w-48: 192px regardless of content (the re-measure
    // amendment — the initial content-sized build rendered 128).
    // ±2: the 12rem border-box rounds ±1 at some viewports and the
    // zoom-in-95 enter animation can still be a hair from settled
    // (the pin stays decisive: 128 vs 192 is a 64px gap).
    expect(Math.abs(geo.menuW - 192)).toBeLessThanOrEqual(2);
    expect(geo.iconW).toBe(16);
    // REF's icon-to-text: the svg's mr-2 rides ON TOP of the item's
    // gap-2 → 16px (REF-measured 60→92 on both items).
    expect(geo.iconToText).toBe(16);

    // The align=end contract: the menu's right edge meets the trigger's
    // (triggerBox captured before the click — see above).
    const menuBox = await menu.boundingBox();
    expect(menuBox).not.toBeNull();
    expect(Math.abs(menuBox!.x + menuBox!.width - (triggerBox!.x + triggerBox!.width))).toBeLessThanOrEqual(2);
    // The 4px sideOffset: the menu's bottom sits just above the trigger.
    expect(triggerBox!.y - (menuBox!.y + menuBox!.height)).toBeLessThanOrEqual(6);
  });

  test("opening the menu does NOT log the user out (the Link-prefetch regression)", async ({ page }) => {
    // Session 36 (R35-A amendment): Logout was first implemented as a
    // <Link href="/logout"> — Next prefetched it the moment the menu
    // opened, the prefetch GET hit the route handler, and the session
    // cookie was cleared. No spec navigated after opening the menu, so
    // the full suite stayed green while every real session died. This
    // guard navigates AFTER the menu round-trip.
    await page.goto("/settings");
    await page.getByRole("button", { name: /sepnetflix2023/ }).first().click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByText("Logout")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).not.toBeVisible();

    // Give any (now impossible) prefetch a window, then navigate.
    await page.waitForTimeout(700);
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: /Welcome back/ })
    ).toBeVisible();
    expect(page.url()).not.toContain("/login");
  });
});
