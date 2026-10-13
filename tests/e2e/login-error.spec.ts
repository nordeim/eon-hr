import { test, expect } from "@playwright/test";

/**
 * The login form-error surface — parity round 33 (R33-G).
 *
 * REF's wrong-credentials error is the shadcn Alert (live-measured:
 * the translucent red-50/70 bg, the 1px red-200 border, the 12px
 * radius, p-4, the text-red-700 text-sm description — 368×54 under
 * the card's input stack). This spec pins the clone's Alert contract.
 */
test.describe("login error surface (session 34)", () => {
  test("wrong credentials render the shadcn Alert with REF's geometry", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[type="email"]').fill("wronguser@test.invalid");
    await page.locator('input[type="password"]').fill("WrongPass123!");
    await page.getByRole("button", { name: "Sign in" }).click();

    const alert = page.locator("[data-slot=alert]");
    await expect(alert).toBeVisible({ timeout: 8000 });
    await expect(alert).toHaveText(/Invalid email or password/i);

    // REF's measured contract: translucent red-50/70, red-200 border,
    // 12px radius, 16px padding — expect.poll for the transition race.
    // v4 serializes the alpha-blended palette colors as lab() (the
    // documented round-32 notation artifact — same color as REF's
    // rgba()); both serializations are accepted.
    await expect
      .poll(async () => alert.evaluate((el) => getComputedStyle(el).backgroundColor))
      .toMatch(/rgba\(254, 242, 242, 0\.7\)|lab\([\d. ]+ \/ 0\.7\)/);
    await expect
      .poll(async () => alert.evaluate((el) => getComputedStyle(el).borderTopColor))
      .toMatch(/rgb\(254, 202, 202\)|lab\(/);
    await expect
      .poll(async () => alert.evaluate((el) => getComputedStyle(el).borderRadius))
      .toBe("12px");
    await expect
      .poll(async () => alert.evaluate((el) => getComputedStyle(el).padding))
      .toBe("16px");
    // REF's alert geometry (round 33): x=536, w=368, h=54
    const box = await alert.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.round(box!.width)).toBe(368);
    expect(Math.round(box!.height)).toBe(54);
    // the description carries REF's red-700 14px text
    const desc = alert.locator("[data-slot=alert-description]");
    await expect(desc).toHaveText(/Invalid email or password/i);
    await expect
      .poll(async () => desc.evaluate((el) => getComputedStyle(el).color))
      .toBe("rgb(185, 28, 28)");
  });

  test("the empty-submit stays on HTML5 required validation (no alert)", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.locator("[data-slot=alert]")).toHaveCount(0);
    await expect(page).toHaveURL(/\/login/);
  });
});
