import { expect, test } from "@playwright/test";

/**
 * Session 33 (R32-A + R32-B): the dark-theme + RTL contracts.
 *
 * REF's Moon toggles a real shadcn-neutral dark theme (html.dark +
 * localStorage darkMode="true", body rgb(10,10,10)) and REF's عربي flips
 * the app to RTL (dir=rtl + localStorage app_lang="ar") — both persist
 * across reloads (the pre-paint boot script in src/app/layout.tsx
 * re-applies them). These specs pin the clone's implementation of the
 * same contracts.
 *
 * Every color assertion polls: the surfaces carry transition-all, so a
 * read taken the moment html.dark lands can catch the value mid-flight
 * (the round-32 probe lesson — one read at ~155 of a 115->163 flip).
 */
test.describe("dark mode (session 33, R32-A)", () => {
  test("the Moon click flips the theme tokens and persists darkMode", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.getByRole("button", { name: "Switch to dark mode" }).click();

    await expect
      .poll(() => page.evaluate(() => document.documentElement.className))
      .toBe("dark");
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor))
      .toBe("rgb(10, 10, 10)");
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.body).color))
      .toBe("rgb(250, 250, 250)");
    const stored = await page.evaluate(() => localStorage.getItem("darkMode"));
    expect(stored).toBe("true");
  });

  test("the Sun replaces the Moon while dark (class-driven icon swap)", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Switch to dark mode" }).click();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.className))
      .toBe("dark");

    // The swap is class-driven (dark:hidden / hidden dark:block), so the
    // visible icon tracks the applied theme with zero state lag.
    const moon = page.getByRole("button", { name: "Switch to light mode" }).locator("svg").first();
    const sun = page.getByRole("button", { name: "Switch to light mode" }).locator("svg").nth(1);
    await expect(moon).toBeHidden();
    await expect(sun).toBeVisible();
  });

  test("the theme survives a reload (the pre-paint boot applies it)", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Switch to dark mode" }).click();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.className))
      .toBe("dark");

    await page.reload();
    // The boot script runs before first paint — the class is present
    // immediately after the reload settles.
    await expect
      .poll(() => page.evaluate(() => document.documentElement.className))
      .toBe("dark");
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor))
      .toBe("rgb(10, 10, 10)");
  });

  test("the mobile chrome flips to the dark slate palette", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard");
    // On mobile the Moon lives inside the drawer's footer — open it first.
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation menu" });
    await expect(drawer).toBeVisible();
    await page.getByRole("button", { name: "Switch to dark mode" }).click();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.className))
      .toBe("dark");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);

    const header = await page.evaluate(() => {
      const el = document.querySelector("header");
      const cs = getComputedStyle(el!);
      return { bg: cs.backgroundColor, brd: cs.borderBottomColor };
    });
    expect(header.bg).toBe("rgb(15, 23, 42)"); // slate-900
    expect(header.brd).toBe("rgb(30, 41, 59)"); // slate-800
    const nav = await page.evaluate(() => {
      const el = [...document.querySelectorAll("nav")].find((n) => n.getBoundingClientRect().y > 700);
      const cs = getComputedStyle(el!);
      return { bg: cs.backgroundColor, brd: cs.borderTopColor };
    });
    expect(nav.bg).toBe("rgb(15, 23, 42)");
    expect(nav.brd).toBe("rgb(30, 41, 59)");
  });

  test("toggling back to light restores the light tokens", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Switch to dark mode" }).click();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.className))
      .toBe("dark");
    await page.getByRole("button", { name: "Switch to light mode" }).click();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.className))
      .toBe("");
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor))
      .toBe("rgb(255, 255, 255)");
    expect(await page.evaluate(() => localStorage.getItem("darkMode"))).toBe("false");
  });
});

test.describe("RTL mode (session 33, R32-B)", () => {
  test("the عربي click mirrors the layout and persists app_lang", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const asideLTR = await page.evaluate(() => Math.round(document.querySelector("aside")!.getBoundingClientRect().x));
    expect(asideLTR).toBe(0);

    await page.getByRole("button", { name: "عربي", exact: true }).click();

    await expect
      .poll(() => page.evaluate(() => document.documentElement.getAttribute("dir")))
      .toBe("rtl");
    expect(await page.evaluate(() => localStorage.getItem("app_lang"))).toBe("ar");
    // The button flipped to EN with REF's Arabic title.
    const en = page.getByRole("button", { name: "EN", exact: true });
    await expect(en).toBeVisible();
    expect(await en.getAttribute("title")).toBe("التبديل إلى الإنجليزية");
    // The desktop sidebar mirrored to the right edge.
    const asideRTL = await page.evaluate(() => Math.round(document.querySelector("aside")!.getBoundingClientRect().x));
    expect(asideRTL).toBeGreaterThan(900);
  });

  test("RTL survives a reload (the pre-paint boot applies it)", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "عربي", exact: true }).click();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.getAttribute("dir")))
      .toBe("rtl");

    await page.reload();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.getAttribute("dir")))
      .toBe("rtl");
    // The strings stay English (REF's i18n is not wired — only the
    // direction flips). The desktop dashboard h1 is the welcome line.
    await expect(page.getByRole("heading", { name: /Welcome back/ })).toBeVisible();
  });

  test("EN toggles back to LTR", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "عربي", exact: true }).click();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.getAttribute("dir")))
      .toBe("rtl");
    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.getAttribute("dir")))
      .toBe("ltr");
    expect(await page.evaluate(() => localStorage.getItem("app_lang"))).toBe("en");
  });
});
