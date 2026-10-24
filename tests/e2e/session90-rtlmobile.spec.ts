import { expect, test } from "@playwright/test";

// Session 90 — the RTL select-mirroring + mobile bottom-sheet round (the
// r89 close-out's named RTL-specific members, triaged into three defects
// + one closed classification):
//
//   R90-A the SelectTrigger `dir="ltr"` stamping — Radix's
//         `useDirection` fallback ("ltr" when no dir prop and no
//         DirectionProvider) pins EVERY select trigger's interior to LTR
//         while the page is RTL: the chevron never mirrors to the trigger's
//         start side (live-measured on assetmanagement RTL: the REF renders
//         the chevron at the trigger's LEFT edge x=-172 with NO dir
//         attribute; the LOC stamped dir="ltr" and kept the chevron at the
//         RIGHT x=-38). The REF's desktop popper content ALSO carries
//         dir="ltr" (parity there) — only the TRIGGER differs.
//   R90-B the mobile select BOTTOM-SHEET — the REF swaps the desktop
//         popper for a bottom-sheet dialog below 768px (live-verified:
//         736/640 → sheet, 768 → popper): the bg-black/80 overlay, the
//         rounded-t-[10px] sheet with the 100px drag handle, the generic
//         "Select an option" h2, and the w-full min-h-[44px] option
//         buttons (selected = bg-blue-50 + the blue Check). The mobile
//         trigger is a PLAIN button (no role/aria/data-state). The clone
//         rendered the desktop Radix popper at mobile.
//   R90-C the assetmanagement option sets — the REF's live inventories:
//         STATUS [All Statuses, Available, Assigned, Returned, Pending
//         Return] (the clone offered Repair/Retired) and TYPE 12 emoji-
//         labeled entries (the clone offered 7 plain).
//
//   CLOSED (no fix): the allleaverequests header icon spacing — the pill
//   geometry is identical to 0.01px cross-side; the deltas are the REF's
//   own 0.66px svg undersizing (15.34 vs the clone's clean 16.00 w-4) +
//   the 0.65px text width — the glyph-edge AA floor, not a clone defect.

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 720 };

test.describe("session-90 — the select family at RTL + mobile", () => {
  test("R90-A1: the RTL chevron contract — MIRRORED at mobile (no dir), STOCK at desktop (Radix dir=ltr)", async ({ page }) => {
    await page.addInitScript("localStorage.setItem('app_lang','ar'); localStorage.setItem('darkMode','false')");
    // --- the mobile form: the REF's plain button — no dir attribute, the
    //     computed direction follows the html, the chevron MIRRORS to the
    //     trigger's start (left) side (live-measured on the REF at 390 RTL)
    await page.setViewportSize(MOBILE);
    await page.goto("/assetmanagement");
    await page.waitForSelector("text=Asset Management");
    await page.waitForTimeout(1200);
    const mobile = await page.evaluate(() => {
      const t = [...document.querySelectorAll("button")].find((b) =>
        (b.textContent || "").includes("All Types"),
      );
      if (!t) return { found: false };
      const svg = t.querySelector("svg");
      const tb = t.getBoundingClientRect();
      const sb = svg ? svg.getBoundingClientRect() : null;
      return {
        found: true,
        htmlDir: document.documentElement.dir,
        dirAttr: t.getAttribute("dir"),
        computedDir: getComputedStyle(t).direction,
        chevronLeftGap: sb ? Math.round(sb.x - tb.x) : null,
        chevronRightGap: sb ? Math.round(tb.x + tb.width - (sb.x + sb.width)) : null,
      };
    });
    expect(mobile.found).toBe(true);
    expect(mobile.htmlDir).toBe("rtl");
    expect(mobile.dirAttr).toBeNull(); // the REF's mobile form: NO dir attribute
    expect(mobile.computedDir).toBe("rtl");
    expect(mobile.chevronLeftGap).toBeLessThanOrEqual(16);
    expect(mobile.chevronRightGap).toBeGreaterThan(16);

    // --- the desktop form: the REF's stock Radix trigger — dir="ltr"
    //     stamped, the chevron stays at the right (live-measured on the
    //     REF at 1440 RTL: dirAttr "ltr", computed ltr, rightGap 13)
    await page.setViewportSize(DESKTOP);
    await page.goto("/assetmanagement");
    await page.waitForSelector("text=Asset Management");
    await page.waitForTimeout(1200);
    const desktop = await page.evaluate(() => {
      const t = [...document.querySelectorAll("button")].find((b) =>
        (b.textContent || "").includes("All Types"),
      );
      if (!t) return { found: false };
      const svg = t.querySelector("svg");
      const tb = t.getBoundingClientRect();
      const sb = svg ? svg.getBoundingClientRect() : null;
      return {
        found: true,
        dirAttr: t.getAttribute("dir"),
        computedDir: getComputedStyle(t).direction,
        chevronLeftGap: sb ? Math.round(sb.x - tb.x) : null,
        chevronRightGap: sb ? Math.round(tb.x + tb.width - (sb.x + sb.width)) : null,
      };
    });
    expect(desktop.found).toBe(true);
    expect(desktop.dirAttr).toBe("ltr"); // the stock Radix stamp — the REF's desktop form
    expect(desktop.computedDir).toBe("ltr");
    expect(desktop.chevronRightGap).toBeLessThanOrEqual(16);
    expect(desktop.chevronLeftGap).toBeGreaterThan(16);
  });

  test("R90-B1: at 390px clicking a select opens the BOTTOM SHEET (not the desktop popper)", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/assetmanagement");
    await page.waitForSelector("text=Asset Management");
    await page.waitForTimeout(1200);
    const trigger = page.locator("button", { hasText: "All Types" }).first();
    await trigger.click();
    await page.waitForTimeout(600);
    const read = await page.evaluate(() => {
      const sheet = document.querySelector("div.fixed.inset-x-0.bottom-0");
      const listbox = document.querySelector('[role="listbox"]');
      const overlay = document.querySelector("div.fixed.inset-0.bg-black\\/80");
      const handle = sheet ? sheet.querySelector(".mx-auto.h-2") : null;
      const h2 = sheet ? sheet.querySelector("h2") : null;
      return {
        sheetPresent: !!sheet,
        sheetCls: sheet ? sheet.className : null,
        listboxPresent: !!listbox,
        overlayPresent: !!overlay,
        handlePresent: !!handle,
        handleCls: handle ? handle.className : null,
        h2Text: h2 ? h2.textContent : null,
        h2Cls: h2 ? h2.className : null,
      };
    });
    expect(read.sheetPresent).toBe(true);
    expect(read.sheetCls).toContain("rounded-t-[10px]");
    expect(read.listboxPresent).toBe(false); // the desktop popper stays closed
    expect(read.overlayPresent).toBe(true);
    expect(read.handlePresent).toBe(true);
    expect(read.handleCls).toContain("w-[100px]");
    expect(read.h2Text).toBe("Select an option");
    expect(read.h2Cls).toContain("text-lg font-semibold");
  });

  test("R90-B2: the sheet's options render the REF's button form with the selected check", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/assetmanagement");
    await page.waitForSelector("text=Asset Management");
    await page.waitForTimeout(1200);
    await page.locator("button", { hasText: "All Types" }).first().click();
    await page.waitForTimeout(600);
    const read = await page.evaluate(() => {
      const sheet = document.querySelector("div.fixed.inset-x-0.bottom-0");
      if (!sheet) return { sheetPresent: false };
      const list = [...sheet.children].find((c) =>
        String(c.className).includes("overflow-y-auto"),
      );
      if (!list) return { sheetPresent: true, listPresent: false };
      const btns = [...list.querySelectorAll("button")];
      const first = btns[0];
      const cs = first ? getComputedStyle(first) : null;
      const check = first ? first.querySelector("svg.lucide-check") : null;
      return {
        sheetPresent: true,
        listPresent: true,
        listCls: list.className,
        optCount: btns.length,
        firstCls: first ? first.className : null,
        firstBg: cs ? cs.backgroundColor : null,
        firstMinH: cs ? cs.minHeight : null,
        firstRadius: cs ? cs.borderRadius : null,
        firstText: first ? (first.textContent || "").trim() : null,
        checkPresent: !!check,
        // svg.className is SVGAnimatedString — read the attribute
        checkCls: check ? check.getAttribute("class") : null,
      };
    });
    expect(read.sheetPresent).toBe(true);
    expect(read.listPresent).toBe(true);
    expect(read.listCls).toContain("max-h-[60vh]");
    expect(read.firstCls).toContain("min-h-[44px]");
    expect(read.firstBg).toBe("rgb(239, 246, 255)"); // bg-blue-50 (selected)
    expect(read.firstMinH).toBe("44px");
    expect(read.firstRadius).toBe("8px");
    expect(read.checkPresent).toBe(true);
    expect(read.checkCls).toContain("text-blue-600");
  });

  test("R90-B3: selecting an option in the sheet updates the trigger and closes it", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/assetmanagement");
    await page.waitForSelector("text=Asset Management");
    await page.waitForTimeout(1200);
    await page.locator("button", { hasText: "All Types" }).first().click();
    await page.waitForTimeout(600);
    // pick the phone option (the REF's emoji-labeled form)
    const phone = page.locator("div.fixed.inset-x-0.bottom-0 button", { hasText: "phone" }).first();
    await phone.click();
    await page.waitForTimeout(800);
    const read = await page.evaluate(() => {
      const sheet = document.querySelector("div.fixed.inset-x-0.bottom-0");
      const overlay = document.querySelector("div.fixed.inset-0.bg-black\\/80");
      const t = [...document.querySelectorAll("button")].find((b) =>
        (b.textContent || "").includes("phone"),
      );
      return {
        sheetGone: !sheet,
        overlayGone: !overlay,
        triggerText: t ? (t.textContent || "").trim() : null,
      };
    });
    expect(read.sheetGone).toBe(true);
    expect(read.overlayGone).toBe(true);
    expect(read.triggerText).toContain("phone");
  });

  test("R90-B4: at desktop the select still opens the standard popper listbox (the regression guard)", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/assetmanagement");
    await page.waitForSelector("text=Asset Management");
    await page.waitForTimeout(1200);
    const trigger = page.locator("button", { hasText: "All Types" }).first();
    await trigger.click();
    await page.waitForTimeout(600);
    const read = await page.evaluate(() => {
      const listbox = document.querySelector('[role="listbox"]');
      const sheet = document.querySelector("div.fixed.inset-x-0.bottom-0");
      const t = [...document.querySelectorAll("button")].find((b) =>
        (b.textContent || "").includes("All Types"),
      );
      return {
        listboxPresent: !!listbox,
        sheetPresent: !!sheet,
        role: t ? t.getAttribute("role") : null,
        expanded: t ? t.getAttribute("aria-expanded") : null,
      };
    });
    expect(read.listboxPresent).toBe(true);
    expect(read.sheetPresent).toBe(false);
    expect(read.role).toBe("combobox");
    expect(read.expanded).toBe("true");
  });

  test("R90-C1: the assetmanagement type select offers the REF's 12 emoji-labeled options", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/assetmanagement");
    await page.waitForSelector("text=Asset Management");
    await page.waitForTimeout(1200);
    await page.locator("button", { hasText: "All Types" }).first().click();
    await page.waitForTimeout(600);
    const opts = await page.evaluate(() =>
      [...document.querySelectorAll('[role="option"]')].map((o) => (o.textContent || "").trim()),
    );
    expect(opts).toEqual([
      "All Types",
      "💻 laptop",
      "🖥️ desktop",
      "📱 phone",
      "📟 tablet",
      "🖥️ monitor",
      "⌨️ keyboard",
      "🖱️ mouse",
      "🎧 headset",
      "🪑 furniture",
      "🚗 vehicle",
      "📦 other",
    ]);
  });

  test("R90-C2: the assetmanagement status select offers the REF's five (Returned + Pending Return)", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/assetmanagement");
    await page.waitForSelector("text=Asset Management");
    await page.waitForTimeout(1200);
    await page.locator("button", { hasText: "All Statuses" }).first().click();
    await page.waitForTimeout(600);
    const opts = await page.evaluate(() =>
      [...document.querySelectorAll('[role="option"]')].map((o) => (o.textContent || "").trim()),
    );
    expect(opts).toEqual([
      "All Statuses",
      "Available",
      "Assigned",
      "Returned",
      "Pending Return",
    ]);
  });
});
