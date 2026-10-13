import { expect, test } from "@playwright/test";

/**
 * Session 35 (R34-A/B/C): the dialog-interior contracts — the census's
 * first geometric pass over the only two REF-exposed dialogs.
 *
 * REF-measured this round:
 *  - the systemic DialogTitle: 18px font / 18px line-height / 600 weight
 *    (leading-none — the H2-only header recipe)
 *  - the asset dialog: no description line, Type + Serial on one 2-col
 *    row (223+223), the footer Add button text-only (102×36)
 *  - the loans installment: the value is a P at 16px/600/blue-700 inside
 *    the matched slate-100 box; Paid From carries no placeholder
 */
test.describe("dialog interiors (session 35)", () => {
  test("the asset dialog: H2-only header, the 2-col Type+Serial row, the text-only Add", async ({ page }) => {
    await page.goto("/assets");
    await page.getByRole("button", { name: "Add Asset" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const geo = await dialog.evaluate((dl: HTMLElement) => {
      const h2 = dl.querySelector("h2")!;
      const hcs = getComputedStyle(h2);
      const typeTrigger = dl.querySelector('[aria-label="Asset type"]')!;
      const serial = dl.querySelector("#asset-serial") as HTMLInputElement;
      const tr = typeTrigger.getBoundingClientRect();
      const sr = serial.getBoundingClientRect();
      const addBtn = Array.from(dl.querySelectorAll("button"))
        .filter((b) => b.textContent?.trim() === "Add Asset")
        .pop()!;
      return {
        h2lh: hcs.lineHeight,
        h2fs: hcs.fontSize,
        typeY: Math.round(tr.y),
        typeW: Math.round(tr.width),
        serialY: Math.round(sr.y),
        serialW: Math.round(sr.width),
        addSvg: addBtn.querySelector("svg") !== null,
        addW: Math.round(addBtn.getBoundingClientRect().width),
        hasDescription: dl.querySelectorAll("[data-slot=dialog-description], p.text-sm.text-muted-foreground").length > 0,
      };
    });
    expect(geo.h2fs).toBe("18px");
    expect(geo.h2lh).toBe("18px");
    expect(geo.hasDescription).toBe(false);
    // The 2-col row: same y, half-width fields (223 each over the 462 inner).
    expect(geo.typeY).toBe(geo.serialY);
    expect(geo.typeW).toBe(geo.serialW);
    expect(geo.typeW).toBeGreaterThan(200);
    expect(geo.typeW).toBeLessThan(240);
    // Text-only footer button.
    expect(geo.addSvg).toBe(false);
  });

  test("the loans dialog: the installment P recipe + the bare Paid From", async ({ page }) => {
    await page.goto("/loans");
    const triggers = page.getByRole("button", { name: "New Loan Request" });
    await triggers.last().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const geo = await dialog.evaluate((dl: HTMLElement) => {
      const p = Array.from(dl.querySelectorAll("p")).find((x) => /SAR 0/.test(x.textContent ?? ""));
      const pcs = p ? getComputedStyle(p) : null;
      const paidFrom = dl.querySelector("#loan-paid-from") as HTMLInputElement;
      const h2 = dl.querySelector("h2")!;
      return {
        hasP: p !== null && p !== undefined,
        fs: pcs?.fontSize,
        fw: pcs?.fontWeight,
        color: pcs?.color,
        pfPlaceholder: paidFrom?.placeholder,
        h2lh: getComputedStyle(h2).lineHeight,
      };
    });
    expect(geo.h2lh).toBe("18px");
    expect(geo.hasP).toBe(true);
    expect(geo.fs).toBe("16px");
    expect(geo.fw).toBe("600");
    expect(geo.color).toBe("rgb(29, 78, 216)"); // blue-700
    expect(geo.pfPlaceholder).toBe("");
  });
});
