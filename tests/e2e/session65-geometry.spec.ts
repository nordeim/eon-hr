import { expect, test } from "@playwright/test";

// Session 65 — parity round 64: the geometry census (padding +
// border-radius) — the FIRST full-population computed read of the two
// dimensions every color census was blind to (the r64 lesson: color
// censuses cannot see PADDING). Pre-fix 32/49; all 17 DIFFs decomposed
// element-level to 7 fix families + the documented allowances. These pins
// hold the fixes with COMPUTED truth.
//
// R65-A the StatCard standard tile is padding-driven (REF live: bg-{c}-100
//   p-3 rounded-xl 48×48 on payroll/expenses/surveys/attendance; the
//   advancedanalytics/allleaverequests/payrollai pages keep the FIXED
//   w-12 h-12 form via tileFixed — the session-17 zero-padding
//   measurement was page-specific, not a family truth).
// R65-B the td/th base-layer restoration (TW v4's preflight universal
//   padding reset zeroes the UA 1px REF's runtime keeps — the R23-A
//   cursor precedent; live reads: the py-10/py-12 empty-state tds, the
//   pb-2 pr-4 ths, the shiftcalendar cells).
// R65-C the chat column header — ONE p-4 border-b wrapper (the split
//   authoring dropped the border-b; the r63 border census's set
//   comparison could not see it) + the padding-driven px-3 button.
// R65-D the compliance filter row is a bordered white box.
// R65-E the hrassistant pane (h-500 p-6 space-y-4) + input row
//   (border-t p-4 flex gap-3) + the min-h-[60px] textarea.
// R65-F the requestreports Back button rides the sm size (the
//   default-size override leaked the base py-2 as an 8px vertical pad).
// R65-G --radius-sm 0.25rem (REF's live rounded-sm computes 4px — the
//   v4 scale; measured on the securitysettings checkboxes).

test.describe("session-65 geometry census (computed truth)", () => {
  test("R65-A: the standard-variant stat tiles are padding-driven (12px) on the four default pages; the tileFixed pages keep 0px", async ({ page }) => {
    await page.goto("/payroll");
    const payrollTile = page.locator("main div.bg-green-100.rounded-xl").first();
    await expect(payrollTile).toBeVisible({ timeout: 15000 });
    expect(await payrollTile.evaluate((el) => getComputedStyle(el).paddingLeft)).toBe("12px");

    await page.goto("/expenses");
    const expensesTile = page.locator("main div.bg-yellow-100.rounded-xl").first();
    await expect(expensesTile).toBeVisible({ timeout: 15000 });
    expect(await expensesTile.evaluate((el) => getComputedStyle(el).paddingLeft)).toBe("12px");

    await page.goto("/surveys");
    const surveysTile = page.locator("main div.bg-teal-100.rounded-xl").first();
    await expect(surveysTile).toBeVisible({ timeout: 15000 });
    expect(await surveysTile.evaluate((el) => getComputedStyle(el).paddingLeft)).toBe("12px");

    await page.goto("/attendance");
    const attendanceTile = page.locator("main div.bg-blue-100.rounded-xl").first();
    await expect(attendanceTile).toBeVisible({ timeout: 15000 });
    expect(await attendanceTile.evaluate((el) => getComputedStyle(el).paddingLeft)).toBe("12px");

    // The tileFixed pages render the FIXED form (padding 0)
    await page.goto("/advancedanalytics");
    const advTile = page.locator("main div.bg-blue-100.rounded-xl").first();
    await expect(advTile).toBeVisible({ timeout: 15000 });
    expect(await advTile.evaluate((el) => getComputedStyle(el).paddingLeft)).toBe("0px");
  });

  test("R65-B: the td/th UA-padding restoration — the unstyled sides ride the 1px like REF (the v4-preflight reset retired)", async ({ page }) => {
    await page.goto("/recruitment");
    const emptyTd = page.locator('main td:text-is("No applicants found")');
    await expect(emptyTd).toBeVisible({ timeout: 15000 });
    const tdPad = await emptyTd.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { left: cs.paddingLeft, right: cs.paddingRight, top: cs.paddingTop };
    });
    expect(tdPad.left).toBe("1px");
    expect(tdPad.right).toBe("1px");
    expect(tdPad.top).toBe("40px"); // py-10 holds; the horizontal rides the UA 1px

    await page.goto("/requestreports");
    const th = page.locator('main th:text-is("Ref #")');
    await expect(th).toBeVisible({ timeout: 15000 });
    const thPad = await th.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { top: cs.paddingTop, left: cs.paddingLeft, bottom: cs.paddingBottom };
    });
    expect(thPad.top).toBe("1px");
    expect(thPad.left).toBe("1px");
    expect(thPad.bottom).toBe("8px"); // pb-2 holds
  });

  test("R65-C: the chat column header — the single p-4 border-b wrapper + the padding-driven new-chat button", async ({ page }) => {
    await page.goto("/chat");
    const h2 = page.locator("main h2", { hasText: "Messages" });
    await expect(h2).toBeVisible({ timeout: 15000 });
    // The wrapper: the h2 row's parent's parent carries the border-b
    const wrapper = page.locator("main div.p-4.border-b.border-slate-200").first();
    await expect(wrapper).toBeVisible({ timeout: 15000 });
    expect(await wrapper.evaluate((el) => getComputedStyle(el).borderBottomWidth)).toBe("1px");
    const wrapPad = await wrapper.evaluate((el) => {
      const cs = getComputedStyle(el);
      return [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(",");
    });
    expect(wrapPad).toBe("16px,16px,16px,16px");
    // The new-chat button: padding-driven (px-3 → 0px 12px)
    const newChat = page.getByLabel("New conversation");
    await expect(newChat).toBeVisible({ timeout: 15000 });
    expect(await newChat.evaluate((el) => getComputedStyle(el).padding)).toBe("0px 12px");
  });

  test("R65-D: the compliance filter row renders the bordered white box (rounded-xl + border)", async ({ page }) => {
    await page.goto("/compliancedashboard");
    const row = page.locator("main div.rounded-xl.border.border-slate-200.bg-white.p-4").first();
    await expect(row).toBeVisible({ timeout: 15000 });
    const geo = await row.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { radius: cs.borderRadius, borderTopWidth: cs.borderTopWidth, bg: cs.backgroundColor };
    });
    expect(geo.radius).toBe("12px");
    expect(geo.borderTopWidth).toBe("1px");
    expect(geo.bg).toBe("rgb(255, 255, 255)");
  });

  test("R65-E: the hrassistant chat geometry — the 500px p-6 pane, the p-4 input row, the 60px textarea", async ({ page }) => {
    await page.goto("/hrassistant");
    const pane = page.locator("main div.h-\\[500px\\]").first();
    await expect(pane).toBeVisible({ timeout: 15000 });
    const paneGeo = await pane.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { h: cs.height, p: cs.padding };
    });
    expect(paneGeo.h).toBe("500px");
    expect(paneGeo.p).toBe("24px");
    const row = page.locator("main div.border-t.p-4").first();
    await expect(row).toBeVisible({ timeout: 15000 });
    expect(await row.evaluate((el) => getComputedStyle(el).padding)).toBe("16px");
    const ta = page.locator("main textarea").first();
    await expect(ta).toBeVisible({ timeout: 15000 });
    expect(await ta.evaluate((el) => getComputedStyle(el).minHeight)).toBe("60px");
  });

  test("R65-F: the requestreports Back button rides the sm size (padding 0px 12px — no py-2 leak)", async ({ page }) => {
    await page.goto("/requestreports");
    const back = page.locator("main button", { hasText: "Back" }).first();
    await expect(back).toBeVisible({ timeout: 15000 });
    expect(await back.evaluate((el) => getComputedStyle(el).padding)).toBe("0px 12px");
  });

  test("R65-G: the securitysettings checkboxes render REF's 4px rounded-sm (the --radius-sm token re-pinned)", async ({ page }) => {
    await page.goto("/securitysettings");
    const checkbox = page.locator("main button.peer").first();
    await expect(checkbox).toBeVisible({ timeout: 15000 });
    expect(await checkbox.evaluate((el) => getComputedStyle(el).borderRadius)).toBe("4px");
  });
});
