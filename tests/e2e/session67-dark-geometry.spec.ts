import { expect, test } from "@playwright/test";

// Session 67 — parity round 66: the DARK-MODE geometry/spacing re-census —
// the matrix-completion verification round. The computed-style matrix
// already covered color × both themes (r57–r63) and the LIGHT cells of
// geometry (r65: padding + radius) + spacing (r66: margin + gap). This
// round re-read BOTH axes in DARK (the instruments: r67-dark-geometry-
// census + r67-dark-margin-census): dark geometry 44/49 + dark margin
// 45/49 — EVERY DIFF a byte-identical standing allowance, and the
// allowance routes re-read in LIGHT vs DARK produce byte-identical tuples
// on both axes (theme-invariance computed-verified end to end).
//
// These pins lock the THEME-INVARIANCE CONTRACT with computed truth: a
// future dark: geometry/spacing member (or a cascade change under
// html.dark that moves a value) trips this gate. The light-mode values
// are pinned by the session65/session66 specs; these are the dark twins.
//
// The dark-arm pattern: page.addInitScript sets localStorage darkMode
// BEFORE any page script runs on every navigation — the boot script
// (src/app/layout.tsx THEME_BOOT) then applies html.dark pre-paint.
// /login is theme-inert by contract (R39-B: the boot script early-
// returns on /login — REF's login build ships no theme boot).

test.describe("session-67 dark-mode geometry (computed truth, theme-invariance contract)", () => {
  test("R67-A: the boot script applies html.dark on app pages and /login is theme-inert", async ({ page }) => {
    await page.addInitScript("localStorage.setItem('darkMode','true')");
    await page.goto("/dashboard");
    await expect(page.locator("main")).toBeVisible({ timeout: 15000 });
    expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(true);
    // the dark cascade is live: the body background is the dark canvas token
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(10, 10, 10)");

    // /login is THEME-INERT (the R39-B contract): the key survives but
    // html.dark never applies on the login surface
    await page.goto("/login");
    await expect(page.locator("input[type=email]")).toBeVisible({ timeout: 15000 });
    expect(await page.evaluate(() => localStorage.getItem("darkMode"))).toBe("true");
    expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(false);

    // the contract re-arms on the next app navigation
    await page.goto("/dashboard");
    await expect(page.locator("main")).toBeVisible({ timeout: 15000 });
    expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(true);
  });

  test("R67-B: the dark StatCard geometry — the payroll padded row keeps 12px, the tileFixed row keeps 0px (the R66-C dark twin)", async ({ page }) => {
    await page.addInitScript("localStorage.setItem('darkMode','true')");
    await page.goto("/payroll");
    const payRow = page.locator("main div.bg-green-100.rounded-xl").first().locator("xpath=..");
    await expect(payRow).toBeVisible({ timeout: 15000 });
    expect(await payRow.evaluate((el) => getComputedStyle(el).marginBottom)).toBe("12px");

    await page.goto("/advancedanalytics");
    const advRow = page.locator("main div.bg-blue-100.rounded-xl").first().locator("xpath=..");
    await expect(advRow).toBeVisible({ timeout: 15000 });
    expect(await advRow.evaluate((el) => getComputedStyle(el).marginBottom)).toBe("0px");
    // the dark mode is verified live on this read too
    expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(true);
  });

  test("R67-C: the dark PageCanvas scroll band renders -80px on the band pages and is absent on the others (the R66-A dark twin)", async ({ page }) => {
    await page.addInitScript("localStorage.setItem('darkMode','true')");
    await page.goto("/dashboard");
    const band = page.locator("main div.-mt-20").first();
    await expect(band).toHaveCount(1);
    expect(await band.evaluate((el) => getComputedStyle(el).marginTop)).toBe("-80px");
    expect(await band.evaluate((el) => getComputedStyle(el).height)).toBe("80px");

    await page.goto("/settings");
    await expect(page.locator("main div.-mt-20")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(true);
  });

  test("R67-D: the dark empty-state icon keeps the svg-authored centered auto margins (the R66-B dark twin)", async ({ page }) => {
    await page.addInitScript("localStorage.setItem('darkMode','true')");
    await page.goto("/payroll");
    const icon = page.locator("main svg.w-16.h-16").first();
    await expect(icon).toBeVisible({ timeout: 15000 });
    const ml = await icon.evaluate((el) => getComputedStyle(el).marginLeft);
    expect(parseFloat(ml)).toBeGreaterThan(300);
    expect(await icon.evaluate((el) => getComputedStyle(el).marginBottom)).toBe("16px");
    expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(true);
  });

  test("R67-E: the dark employees grid keeps the 24px gap + the alwaysRow 0-gap/32px mb (the R66-D dark twin)", async ({ page }) => {
    await page.addInitScript("localStorage.setItem('darkMode','true')");
    await page.goto("/employees");
    const grid = page.locator("main div[class*='lg:grid-cols-3']").first();
    await expect(grid).toBeVisible({ timeout: 15000 });
    expect(await grid.evaluate((el) => getComputedStyle(el).columnGap)).toBe("24px");
    const row = grid.locator("xpath=preceding-sibling::div[contains(@class,'mb-8')][1]");
    await expect(row).toBeVisible();
    expect(await row.evaluate((el) => getComputedStyle(el).columnGap)).toBe("normal");
    expect(await row.evaluate((el) => getComputedStyle(el).marginBottom)).toBe("32px");
  });

  test("R67-F: the dark tenantsetup circle keeps mb-4 and the Continue keeps ml-auto (the R66-J dark twin)", async ({ page }) => {
    await page.addInitScript("localStorage.setItem('darkMode','true')");
    await page.goto("/tenantsetup");
    const circle = page.locator("main div.rounded-full.bg-blue-100").first();
    await expect(circle).toBeVisible({ timeout: 15000 });
    expect(await circle.evaluate((el) => getComputedStyle(el).marginBottom)).toBe("16px");
    const cont = page.locator("main button", { hasText: "Continue" }).first();
    await expect(cont).toBeVisible();
    const ml = await cont.evaluate((el) => getComputedStyle(el).marginLeft);
    expect(parseFloat(ml)).toBeGreaterThan(100);
  });
});
