import { expect, test, type Page } from "@playwright/test";

// Session 63 — the light-mode text-color family (R63-A..G). The r63
// census (scripts/r63-lighttext-census.mjs, 49 routes, paired live,
// LIGHT mode) read the computed color of every text-bearing element
// in main — BUTTONS INCLUDED (button text/icons were never read by
// any prior census in ANY theme) — plus ::placeholder colors. Pre-fix
// 26/49. These pins hold the fixes with COMPUTED truth, both themes
// where the finding spans them: the placeholder literal pair (REF's
// ::placeholder rides ITS muted token — #737373 light / #a3a3a3 dark
// — while the clone's token pins slate-500 for subtitle parity), the
// hrreports empty Group By trigger (a BOTH-theme button-text
// divergence: REF's trigger has NO data-placeholder attribute and
// renders its own foreground pair), the profile kicker subtitle's
// flipping pair (the r61-O pin was a dark-only measurement), the
// shiftcalendar assign affordance's Plus icon + unflipping slate-300,
// the summary header's Users icon + foreground pair, and the
// recruitment AI Score th's TrendingUp icon.
//
// R63-G (the attendance restricted card's X icon + slate-800 h3) has
// NO live pin here: the card renders for non-admin users only and the
// E2E session user is the admin seed — the unit pin (R63-G in
// tests/unit/recipes.test.ts) holds it member-level, per the r61-W
// precedent.

const NEUTRAL500 = "rgb(115, 115, 115)"; // #737373 — REF's light ::placeholder
const NEUTRAL400 = "rgb(163, 163, 163)"; // #a3a3a3 — REF's dark ::placeholder
const FOREGROUND_LIGHT = "rgb(10, 10, 10)"; // #0a0a0a
const FOREGROUND_DARK = "rgb(250, 250, 250)"; // #fafafa
const SLATE500 = "rgb(100, 116, 139)"; // #64748b
const SLATE400 = "rgb(148, 163, 184)"; // #94a3b8
const SLATE300 = "rgb(203, 213, 225)"; // #cbd5e1 — unflipping (REF, both themes)
const SLATE600 = "rgb(71, 85, 105)"; // #475569 — unflipping (REF, both themes)

async function setDark(page: Page, on: boolean) {
  // the r62 lesson: setDark needs the app origin loaded first (goto
  // BEFORE the localStorage write) or the toggle races the shell boot
  await page.evaluate((v) => {
    localStorage.setItem("darkMode", v ? "true" : "false");
    document.documentElement.classList.toggle("dark", v);
  }, on);
  await page.waitForTimeout(350);
}

test.describe("session-63 light-mode text-color family (computed truth)", () => {
  test("R63-A: the payroll search placeholder rides REF's muted literal pair (light #737373, dark #a3a3a3)", async ({ page }) => {
    await page.goto("/payroll");
    const search = page.getByLabel("Search employee");
    await expect(search).toBeVisible({ timeout: 15000 });
    // LIGHT: REF's muted #737373 — the token's slate-500 tint retired
    expect(await search.evaluate((i) => getComputedStyle(i, "::placeholder").color)).toBe(NEUTRAL500);
    // DARK: #a3a3a3 (the r60/r61 dark censuses verified this side)
    await setDark(page, true);
    expect(await search.evaluate((i) => getComputedStyle(i, "::placeholder").color)).toBe(NEUTRAL400);
    await setDark(page, false);
  });

  test("R63-B: the hrreports empty Group By trigger renders the foreground pair (light #0a0a0a, dark #fafafa)", async ({ page }) => {
    await page.goto("/hrreports");
    const trigger = page.locator("#hr-group");
    await expect(trigger).toBeVisible({ timeout: 15000 });
    // LIGHT: the trigger's own foreground — the base's neutral literal
    // (R37-E, the loans dialog pin) is overridden back on this instance
    expect(await trigger.evaluate((t) => getComputedStyle(t).color)).toBe(FOREGROUND_LIGHT);
    // DARK: #fafafa
    await setDark(page, true);
    expect(await trigger.evaluate((t) => getComputedStyle(t).color)).toBe(FOREGROUND_DARK);
    await setDark(page, false);
  });

  test("R63-C: the profile kicker subtitle renders the flipping pair at 390×844 (light slate-500, dark slate-400)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/profile");
    const subtitle = page.locator("main p", { hasText: "Manage your account" });
    await expect(subtitle).toBeVisible({ timeout: 15000 });
    // LIGHT: slate-500 (the r61-O pin froze dark's slate-400 for BOTH —
    // the r63 light census caught the light side at this same viewport)
    expect(await subtitle.evaluate((p) => getComputedStyle(p).color)).toBe(SLATE500);
    // DARK: slate-400
    await setDark(page, true);
    expect(await subtitle.evaluate((p) => getComputedStyle(p).color)).toBe(SLATE400);
    await setDark(page, false);
  });

  test("R63-D: the shiftcalendar assign affordance carries the Plus icon + the unflipping slate-300 (both themes)", async ({ page }) => {
    await page.goto("/shiftcalendar");
    const assign = page.getByRole("button", { name: "assign" }).first();
    await expect(assign).toBeVisible({ timeout: 15000 });
    // the icon: lucide-plus w-3 h-3 before the "assign" text
    expect(await assign.locator("svg").count()).toBe(1);
    // LIGHT: slate-300 (unflipping on REF — live-measured both themes)
    expect(await assign.evaluate((b) => getComputedStyle(b).color)).toBe(SLATE300);
    // DARK: still slate-300
    await setDark(page, true);
    expect(await assign.evaluate((b) => getComputedStyle(b).color)).toBe(SLATE300);
    await setDark(page, false);
  });

  test("R63-E: the shiftcalendar summary title carries the Users icon + the foreground pair (the pb-3 header)", async ({ page }) => {
    await page.goto("/shiftcalendar");
    const title = page.locator("main div").filter({ hasText: /^Employee Schedule Summary/ }).locator("div.font-semibold").first();
    await expect(title).toBeVisible({ timeout: 15000 });
    // the icon rides the title's foreground pair
    expect(await title.locator("svg").count()).toBe(1);
    // LIGHT: the foreground #0a0a0a (the census "color diff" here was a
    // children-filter artifact — the color always matched)
    expect(await title.evaluate((t) => getComputedStyle(t).color)).toBe(FOREGROUND_LIGHT);
    // DARK: #fafafa
    await setDark(page, true);
    expect(await title.evaluate((t) => getComputedStyle(t).color)).toBe(FOREGROUND_DARK);
    await setDark(page, false);
    // the header's pb-3 override (12px, not p-6's 24px)
    const header = title.locator("xpath=..");
    expect(await header.evaluate((h) => getComputedStyle(h).paddingBottom)).toBe("12px");
  });

  test("R63-F: the recruitment AI Score th carries the TrendingUp icon inside the flex wrapper (slate-600 unflipping)", async ({ page }) => {
    await page.goto("/recruitment");
    const th = page.locator("main th", { hasText: "AI Score" }).first();
    await expect(th).toBeVisible({ timeout: 15000 });
    // the icon: lucide-trending-up w-3 h-3 inside the flex gap-1 wrapper
    const wrapper = th.locator("div.flex.items-center.gap-1");
    await expect(wrapper).toBeVisible();
    expect(await wrapper.locator("svg").count()).toBe(1);
    // LIGHT: the th's unflipping slate-600
    expect(await th.evaluate((t) => getComputedStyle(t).color)).toBe(SLATE600);
    // DARK: still slate-600
    await setDark(page, true);
    expect(await th.evaluate((t) => getComputedStyle(t).color)).toBe(SLATE600);
    await setDark(page, false);
  });
});
