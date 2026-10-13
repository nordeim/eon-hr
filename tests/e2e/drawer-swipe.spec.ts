import { expect, test } from "@playwright/test";

/**
 * Session 31 (R30-A + R30-D): the mobile drawer's border + swipe superset.
 *
 * R30-A: REF's drawer panel carries a 1px right border in the default
 * #e5e5e5 — pinned here as a computed-style assertion (the standing
 * mobile audit pins the overlay only).
 *
 * R30-D: the swipe-to-close gesture. HTML5 touch events are driven via
 * CDP Input.dispatchTouchEvent (the same event sequence a native swipe
 * produces): past the 96px threshold the drawer closes; below it the
 * panel springs back and stays open.
 */
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

test.describe("drawer border + swipe-to-close (session 31)", () => {
  test("the open drawer panel carries REF's 1px #e5e5e5 right border", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation menu" });
    await expect(drawer).toBeVisible();

    const border = await drawer.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { w: cs.borderRightWidth, c: cs.borderRightColor, width: Math.round(el.getBoundingClientRect().width) };
    });
    expect(border.w).toBe("1px");
    expect(border.c).toBe("rgb(229, 229, 229)");
    expect(border.width).toBe(288);
  });

  test("a leftward swipe past the threshold closes the drawer", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation menu" });
    await expect(drawer).toBeVisible();

    const cdp = await page.context().newCDPSession(page);
    /* Probe lesson (round 30, two parts): (1) the touch must wait out
       the drawer's 500ms enter animation — mid-flight, the panel hasn't
       slid under the touch point yet and the touch targets the OVERLAY
       (the Content's sibling), so the React handlers never see it;
       (2) back-to-back CDP dispatches DROP the touchMove — the input
       pipeline needs a frame between gesture phases (the round-26
       separate-evals lesson, touch edition). */
    await page.waitForTimeout(700);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: 240, y: 400 }],
    });
    await page.waitForTimeout(100);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: 120, y: 400 }],
    });
    await page.waitForTimeout(100);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });

    // The drawer unmounts (Radix waits for the exit animation).
    await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 5000 });
    // The route is unchanged — the swipe only closed the nav.
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("a sub-threshold swipe springs the panel back and stays open", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation menu" });
    await expect(drawer).toBeVisible();

    const cdp = await page.context().newCDPSession(page);
    await page.waitForTimeout(700); // the enter animation must settle (see test 2)
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: 240, y: 400 }],
    });
    await page.waitForTimeout(100);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: 200, y: 400 }], // 40px — below the 96px threshold
    });
    // Mid-gesture: the panel follows the finger (non-vacuous probe —
    // the transform must be live before the release).
    await expect
      .poll(() => drawer.evaluate((el) => (el as HTMLElement).style.transform))
      .toContain("translateX(-40px)");
    await page.waitForTimeout(100);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });

    // The drawer stays open and the panel springs back to rest.
    await expect(drawer).toBeVisible();
    await page.waitForTimeout(400); // the 300ms spring-back
    const transform = await drawer.evaluate((el) => el.style.transform);
    expect(transform).toBe("");
    const x = await drawer.evaluate((el) => Math.round(el.getBoundingClientRect().x));
    expect(x).toBe(0);
  });
});
