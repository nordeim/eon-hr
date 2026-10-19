import { expect, test, type Page } from "@playwright/test";

// Session 62 — the dark-mode border-color family (R62-A..K). The r62
// census (scripts/r62-border-census.mjs, 49 routes, paired live, DARK
// mode) read the computed border-color of every visibly-bordered
// element in main, buttons INCLUDED (button borders were never read by
// any prior census). Pre-fix 29/49; twenty DIFF routes decomposed
// element-level. These pins hold the fixes with COMPUTED truth, both
// themes where the finding spans them: the Customize button's token
// flip, the checkbox literal pair (a BOTH-theme divergence), the four
// new palette pins rendering rgb() (not oklch lab()), the
// border-slate-200 card family (REF's cards stay LIGHT-bordered in
// dark), the attendance per-color action buttons + the restructured
// Report Type card, the per-stage kanban columns, the calendar ths,
// the thead-row recipes, the profile badge's div tag, the severity
// cards' two-level shape, and the textarea resize-none.

const NEUTRAL200 = "rgb(229, 229, 229)"; // #e5e5e5 — the light --border/--input
const NEUTRAL800 = "rgb(38, 38, 38)"; // #262626 — the dark --border/--input
const DARK = "rgb(23, 23, 23)"; // #171717
const NEUTRAL50 = "rgb(250, 250, 250)"; // #fafafa
const SLATE200 = "rgb(226, 232, 240)"; // #e2e8f0
const SLATE300 = "rgb(203, 213, 225)"; // #cbd5e1
const SLATE100 = "rgb(241, 245, 249)"; // #f1f5f9

async function setDark(page: Page, on: boolean) {
  await page.evaluate((v) => {
    localStorage.setItem("darkMode", v ? "true" : "false");
    document.documentElement.classList.toggle("dark", v);
  }, on);
  await page.waitForTimeout(350);
}

test.describe("session-62 dark-mode border-color family (computed truth)", () => {
  test("R62-A: the Customize button rides the flipping border-input pair (light #e5e5e5, dark #262626)", async ({ page }) => {
    await page.goto("/dashboard");
    const btn = page.getByRole("button", { name: "Customize" });
    await expect(btn).toBeVisible({ timeout: 15000 });
    // LIGHT: identical to the retired frozen literal
    expect(await btn.evaluate((b) => getComputedStyle(b).borderTopColor)).toBe(NEUTRAL200);
    // DARK: REF's measured flip (the token supplies it now)
    await setDark(page, true);
    expect(await btn.evaluate((b) => getComputedStyle(b).borderTopColor)).toBe(NEUTRAL800);
    await setDark(page, false);
  });

  test("R62-B: the checkbox border carries REF's literal pair (light #171717, dark #fafafa)", async ({ page }) => {
    await page.goto("/securitysettings");
    // content wait — the feature rows render after the fetch
    const box = page.locator("main [role=checkbox]").first();
    await expect(box).toBeVisible({ timeout: 15000 });
    // LIGHT: #171717 (was the nav-blue #1877f2 — the both-theme bug)
    expect(await box.evaluate((c) => getComputedStyle(c).borderTopColor)).toBe(DARK);
    // DARK: #fafafa
    await setDark(page, true);
    expect(await box.evaluate((c) => getComputedStyle(c).borderTopColor)).toBe(NEUTRAL50);
    await setDark(page, false);
  });

  test("R62-C: the four new palette pins render their v3 sRGB values (green-200/amber-200/cyan-300/cyan-50)", async ({ page }) => {
    // green-200 = #bbf7d0 — the securitysettings Enabled badge border
    // (the unpinned form drifted lab(92.42% -26.47 12.94))
    await page.goto("/securitysettings");
    const badge = page.locator("main div", { hasText: /^Enabled$/ }).first();
    await expect(badge).toBeVisible({ timeout: 15000 });
    expect(await badge.evaluate((b) => getComputedStyle(b).borderTopColor)).toBe("rgb(187, 247, 208)");

    // cyan-300 = #67e8f9 — the attendance Devices button border
    await page.goto("/attendance");
    const devices = page.getByRole("button", { name: "Devices" });
    await expect(devices).toBeVisible({ timeout: 15000 });
    expect(await devices.evaluate((b) => getComputedStyle(b).borderTopColor)).toBe("rgb(103, 232, 249)");
    // cyan-50 = #ecfeff — the Devices hover fill (hover, then settle)
    await devices.hover();
    await page.waitForTimeout(400);
    expect(await devices.evaluate((b) => getComputedStyle(b).backgroundColor)).toBe("rgb(236, 254, 255)");
  });

  test("R62-D1: the empty-state cards render the unflipping slate-200 border in DARK (loans + offboarding)", async ({ page }) => {
    await page.goto("/loans");
    await setDark(page, true);
    const card = page.locator("main div", { hasText: "No loans yet" }).locator("xpath=ancestor::div[contains(@class, 'border-slate-200')]").first();
    await expect(card).toBeVisible({ timeout: 15000 });
    expect(await card.evaluate((c) => getComputedStyle(c).borderTopColor)).toBe(SLATE200);

    await page.goto("/offboarding");
    const card2 = page.locator("main div", { hasText: "No offboarding processes" }).locator("xpath=ancestor::div[contains(@class, 'border-slate-200')]").first();
    await expect(card2).toBeVisible({ timeout: 15000 });
    expect(await card2.evaluate((c) => getComputedStyle(c).borderTopColor)).toBe(SLATE200);
    await setDark(page, false);
  });

  test("R62-D2: the standard-Card pages render slate-200 borders in DARK (hrletters + analytics + profile)", async ({ page }) => {
    await page.goto("/hrletters");
    await setDark(page, true);
    const card = page.locator("main div", { hasText: "Letter Requests" }).locator("xpath=ancestor-or-self::div[contains(@class, 'border-slate-200')]").first();
    await expect(card).toBeVisible({ timeout: 15000 });
    expect(await card.evaluate((c) => getComputedStyle(c).borderTopColor)).toBe(SLATE200);

    await page.goto("/analytics");
    const chart = page.locator("main div", { hasText: "Employee Status Distribution" }).locator("xpath=ancestor::div[contains(@class, 'border-slate-200')]").first();
    await expect(chart).toBeVisible({ timeout: 15000 });
    expect(await chart.evaluate((c) => getComputedStyle(c).borderTopColor)).toBe(SLATE200);

    await page.goto("/profile");
    const ident = page.locator("main div", { hasText: "Personal Information" }).locator("xpath=ancestor::div[contains(@class, 'border-slate-200')]").first();
    await expect(ident).toBeVisible({ timeout: 15000 });
    expect(await ident.evaluate((c) => getComputedStyle(c).borderTopColor)).toBe(SLATE200);
    await setDark(page, false);
  });

  test("R62-D3: the attendance Report Type card is REF's 3-level shape with the slate-200 border (DARK)", async ({ page }) => {
    await page.goto("/attendance");
    await setDark(page, true);
    const card = page.locator("main div", { hasText: "Report Type:" }).locator("xpath=ancestor::div[contains(@class, 'border-slate-200')]").first();
    await expect(card).toBeVisible({ timeout: 15000 });
    expect(await card.evaluate((c) => getComputedStyle(c).borderTopColor)).toBe(SLATE200);
    // the inner two levels: p-4 wrapper > flex gap-4 items-center row
    const row = card.locator("div.flex.gap-4.items-center").first();
    await expect(row).toBeVisible();
    await setDark(page, false);
  });

  test("R62-E: the attendance action-button trio carries REF's per-color borders (slate-300/blue-300 companions to cyan-300)", async ({ page }) => {
    await page.goto("/attendance");
    const devices = page.getByRole("button", { name: "Devices" });
    await expect(devices).toBeVisible({ timeout: 15000 });
    // the siblings after Devices in the action row (the page carries a
    // second accessible-Settings control elsewhere — strict mode)
    const settings = devices.locator("xpath=following-sibling::button[1]");
    await expect(settings).toBeVisible();
    expect(await settings.evaluate((b) => getComputedStyle(b).borderTopColor)).toBe(SLATE300);
    const dash = devices.locator("xpath=following-sibling::button[2]");
    await expect(dash).toBeVisible();
    expect(await dash.evaluate((b) => getComputedStyle(b).borderTopColor)).toBe("rgb(147, 197, 253)");
  });

  test("R62-F: the recruitmentkanban columns render the five per-stage border pairs", async ({ page }) => {
    await page.goto("/recruitmentkanban");
    const expectColumn = async (label: string, color: string) => {
      // the column div is an ANCESTOR of the h3 (not a following node)
      const col = page.locator("main h3", { hasText: label }).locator("xpath=ancestor::div[starts-with(@class, 'rounded-lg border-2')]");
      await expect(col).toBeVisible({ timeout: 15000 });
      expect(await col.evaluate((c) => getComputedStyle(c).borderTopColor)).toBe(color);
      return col;
    };
    await expectColumn("Applied", SLATE300);
    await expectColumn("Interviewing", "rgb(191, 219, 254)"); // blue-200
    await expectColumn("Offer", "rgb(253, 230, 138)"); // amber-200
    const hired = await expectColumn("Hired", "rgb(187, 247, 208)"); // green-200
    expect(await hired.evaluate((c) => getComputedStyle(c).minHeight)).toBe("400px");
    await expectColumn("Rejected", "rgb(254, 202, 202)"); // red-200
  });

  test("R62-G: the shiftcalendar ths carry the border-b slate-200 + the weekend variant", async ({ page }) => {
    await page.goto("/shiftcalendar");
    const mon = page.locator("main th", { hasText: "Mon" });
    await expect(mon).toBeVisible({ timeout: 15000 });
    expect(await mon.evaluate((t) => getComputedStyle(t).borderBottomColor)).toBe(SLATE200);
    expect(await mon.evaluate((t) => getComputedStyle(t).backgroundColor)).toBe("rgb(255, 255, 255)");
    const sat = page.locator("main th", { hasText: "Sat" });
    await expect(sat).toBeVisible();
    // bg-slate-50 = #f8fafc (REF's weekend member)
    expect(await sat.evaluate((t) => getComputedStyle(t).backgroundColor)).toBe("rgb(248, 250, 252)");
  });

  test("R62-H: the header rows carry the slate-200/slate-50 pair; the recruitment thead's inner tr renders no border", async ({ page }) => {
    await page.goto("/assetmanagement");
    const headRow = page.locator("main thead tr").first();
    await expect(headRow).toBeVisible({ timeout: 15000 });
    expect(await headRow.evaluate((r) => getComputedStyle(r).borderBottomColor)).toBe(SLATE200);
    // bg-slate-50 = #f8fafc
    expect(await headRow.evaluate((r) => getComputedStyle(r).backgroundColor)).toBe("rgb(248, 250, 252)");

    await page.goto("/recruitment");
    const tr = page.locator("main thead tr").first();
    await expect(tr).toBeVisible({ timeout: 15000 });
    // the border lives on the THEAD (slate-200); the inner tr carries none
    expect(await tr.evaluate((r) => getComputedStyle(r).borderBottomWidth)).toBe("0px");
    const thead = page.locator("main thead").first();
    expect(await thead.evaluate((t) => getComputedStyle(t).borderBottomColor)).toBe(SLATE200);
  });

  test("R62-I: the profile role badge is a DIV with the blue-200 border", async ({ page }) => {
    await page.goto("/profile");
    const badge = page.locator("main div", { hasText: /^(Admin|User)$/ }).first();
    await expect(badge).toBeVisible({ timeout: 15000 });
    expect(await badge.evaluate((b) => b.tagName)).toBe("DIV");
    expect(await badge.evaluate((b) => getComputedStyle(b).borderTopColor)).toBe("rgb(191, 219, 254)");
  });

  test("R62-J: the compliance severity cards are the two-level shape (border on the card, p-4 text-center inner)", async ({ page }) => {
    await page.goto("/compliancedashboard");
    const expired = page.locator("main div", { hasText: "Expired" }).locator("xpath=ancestor::div[contains(@class, 'border-red-200')]").first();
    await expect(expired).toBeVisible({ timeout: 15000 });
    // the padding lives on the INNER wrapper, not the card
    expect(await expired.evaluate((c) => getComputedStyle(c).paddingTop)).toBe("0px");
    const inner = expired.locator("div.p-4.text-center").first();
    await expect(inner).toBeVisible();
    expect(await inner.evaluate((i) => getComputedStyle(i).paddingTop)).toBe("16px");
    // the At-Risk card carries REF's overflow-hidden member
    const atRisk = page.locator("main div", { hasText: "At-Risk Employees" }).locator("xpath=ancestor::div[contains(@class, 'overflow-hidden')]").first();
    await expect(atRisk).toBeVisible();
  });

  test("R62-K: the shared textarea renders REF's resize-none", async ({ page }) => {
    await page.goto("/companywall");
    const ta = page.locator("main textarea").first();
    await expect(ta).toBeVisible({ timeout: 15000 });
    expect(await ta.evaluate((t) => getComputedStyle(t).resize)).toBe("none");
  });
});
