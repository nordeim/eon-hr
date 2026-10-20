import { expect, test, type Page } from "@playwright/test";

// Session 64 — parity round 63: the light-mode border-color census + the
// input-family probes (R64-A..E). The r64 census
// (scripts/r64-lightborder-census.mjs, 49 routes, paired live, LIGHT mode)
// read the computed border-color of every visibly-bordered element in
// main — the LAST uncensured cell of the computed-color matrix — and
// found the border family already at parity (pre-fix 44/49 with all 5
// DIFFs documented allowances: the seeded employees grid surfaces, the
// attendance admin superset cards, the interviewassistant r48-C1 card,
// the onboardingtemplates r36 anchor superset, REF's live careers data).
// The round's REAL finds came from the two per-dimension probes the
// census's set-comparison inversion risk motivated: the iconed-search
// LEFT PADDING (REF clears the absolute left-3 icon — the clone rendered
// the same wrappers WITHOUT the padding member, typed text colliding
// with the icon) and the placeholder TEXT values (r60/r63 read colors
// only; 4 authored strings diverged from REF's live verbatim copy).
// These pins hold the fixes with COMPUTED truth.

const INPUT_BORDER_LIGHT = "rgb(229, 229, 229)"; // #e5e5e5 — the border-input token, light
const INPUT_BORDER_DARK = "rgb(38, 38, 38)"; // #262626 — the border-input token dark flip

async function setDark(page: Page, on: boolean) {
  // the r62 lesson: setDark needs the app origin loaded first (goto
  // BEFORE the localStorage write) or the toggle races the shell boot
  await page.evaluate((v) => {
    localStorage.setItem("darkMode", v ? "true" : "false");
    document.documentElement.classList.toggle("dark", v);
  }, on);
  await page.waitForTimeout(350);
}

test.describe("session-64 light-mode border census + the input-family probes (computed truth)", () => {
  test("R64-A: the iconed-search inputs clear the absolute left-3 icon (payroll 40px; payrollmodule / documenttracker / assetmanagement 36px)", async ({ page }) => {
    await page.goto("/payroll");
    const payroll = page.getByLabel("Search employee");
    await expect(payroll).toBeVisible({ timeout: 15000 });
    expect(await payroll.evaluate((i) => getComputedStyle(i).paddingLeft)).toBe("40px");

    await page.goto("/payrollmodule");
    const payrollmodule = page.getByLabel("Search employees");
    await expect(payrollmodule).toBeVisible({ timeout: 15000 });
    expect(await payrollmodule.evaluate((i) => getComputedStyle(i).paddingLeft)).toBe("36px");

    await page.goto("/documenttracker");
    const documenttracker = page.getByLabel("Search documents");
    await expect(documenttracker).toBeVisible({ timeout: 15000 });
    expect(await documenttracker.evaluate((i) => getComputedStyle(i).paddingLeft)).toBe("36px");

    await page.goto("/assetmanagement");
    const assetmanagement = page.getByLabel("Search assets");
    await expect(assetmanagement).toBeVisible({ timeout: 15000 });
    expect(await assetmanagement.evaluate((i) => getComputedStyle(i).paddingLeft)).toBe("36px");
  });

  test("R64-B: the compliance search input rides REF's live placeholder (the employee dimension)", async ({ page }) => {
    await page.goto("/compliancedashboard");
    const input = page.getByLabel("Search employee");
    await expect(input).toBeVisible({ timeout: 15000 });
    expect(await input.getAttribute("placeholder")).toBe("Search employee...");
  });

  test("R64-C: the recruitmentkanban search input rides REF's live placeholder", async ({ page }) => {
    await page.goto("/recruitmentkanban");
    const input = page.getByLabel("Search applicants");
    await expect(input).toBeVisible({ timeout: 15000 });
    expect(await input.getAttribute("placeholder")).toBe("Search applicants...");
  });

  test("R64-D: the interviewassistant notes textarea rides REF's live verbatim placeholder", async ({ page }) => {
    await page.goto("/interviewassistant");
    const notes = page.getByLabel("Notes");
    await expect(notes).toBeVisible({ timeout: 15000 });
    expect(await notes.getAttribute("placeholder")).toBe("Enter your interview observations, candidate responses, and overall impressions...");
  });

  test("R64-E: the tenantsetup wizard placeholders ride REF's live example values", async ({ page }) => {
    await page.goto("/tenantsetup");
    const company = page.locator("#company-name");
    const email = page.locator("#owner-email");
    await expect(company).toBeVisible({ timeout: 15000 });
    expect(await company.getAttribute("placeholder")).toBe("Acme Corporation");
    expect(await email.getAttribute("placeholder")).toBe("admin@acme.com");
  });

  test("R64-F: the round's border-census truth — the payroll search input rides the border-input token pair (light #e5e5e5, dark #262626)", async ({ page }) => {
    await page.goto("/payroll");
    const input = page.getByLabel("Search employee");
    await expect(input).toBeVisible({ timeout: 15000 });
    // LIGHT: the default border token — census-verified paired live
    expect(await input.evaluate((i) => getComputedStyle(i).borderTopColor)).toBe(INPUT_BORDER_LIGHT);
    // DARK: the token's flip (the r62-A documented REF measurement)
    await setDark(page, true);
    expect(await input.evaluate((i) => getComputedStyle(i).borderTopColor)).toBe(INPUT_BORDER_DARK);
    await setDark(page, false);
  });
});
