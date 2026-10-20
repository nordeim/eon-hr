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

test.describe("dialog focus + trigger contracts (session 38, R37)", () => {
  /* The keyboard/focus census: REF's dialog triggers are Radix
     DialogTriggers (aria-haspopup="dialog" + aria-expanded) and focus
     RETURNS to the trigger on close; the clone's plain onClick buttons
     dropped focus to BODY (the triggerRef null path in
     @radix-ui/react-dialog 1.2.0's DialogContentModal). Plus the asset
     submit's at-rest enabled state and the loans defaults. */

  const FOCUS_RESTORE = async (page: import("@playwright/test").Page, path: string, trigger: string) => {
    await page.goto(path);
    const btn = page.getByRole("button", { name: trigger }).first();
    await btn.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // initial focus lands inside the dialog (the first tabbable — the
    // employee combobox on loans, the first input elsewhere)
    await expect
      .poll(() => dialog.evaluate((dl) => dl.contains(document.activeElement)), { timeout: 5000 })
      .toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    // the trigger regains focus (REF's contract — was BODY before R37-A)
    await expect(btn).toBeFocused();
  };

  test("the assets dialog restores focus to its DialogTrigger on Escape (R37-A)", async ({ page }) => {
    await FOCUS_RESTORE(page, "/assets", "Add Asset");
  });

  test("the loans dialog restores focus to its DialogTrigger on Escape (R37-A)", async ({ page }) => {
    await FOCUS_RESTORE(page, "/loans", "New Loan Request");
  });

  test("the three settings dialogs restore focus to their DialogTriggers on Escape (R37-A)", async ({ page }) => {
    for (const [tab, trigger] of [
      ["Departments", "Add Department"],
      ["Approval Workflows", "Add Workflow"],
      ["Shifts", "Add Shift"],
    ] as const) {
      await page.goto("/settings");
      await page.getByRole("tab", { name: tab }).click();
      const btn = page.getByRole("button", { name: trigger });
      await btn.click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(btn).toBeFocused();
    }
  });

  test("the five parity triggers carry REF's DialogTrigger aria contract (R37-A)", async ({ page }) => {
    await page.goto("/assets");
    const asset = page.getByRole("button", { name: "Add Asset" }).first();
    await expect(asset).toHaveAttribute("aria-haspopup", "dialog");
    await expect(asset).toHaveAttribute("aria-expanded", "false");
    await page.goto("/loans");
    const loan = page.getByRole("button", { name: "New Loan Request" }).first();
    await expect(loan).toHaveAttribute("aria-haspopup", "dialog");
    for (const [tab, trigger] of [
      ["Departments", "Add Department"],
      ["Approval Workflows", "Add Workflow"],
      ["Shifts", "Add Shift"],
    ] as const) {
      await page.goto("/settings");
      await page.getByRole("tab", { name: tab }).click();
      const btn = page.getByRole("button", { name: trigger });
      await expect(btn).toHaveAttribute("aria-haspopup", "dialog");
      await expect(btn).toHaveAttribute("aria-expanded", "false");
    }
  });

  test("the asset dialog's submit is ENABLED at rest (R37-B — the empty-submit fires native validation, not a dead button)", async ({ page }) => {
    await page.goto("/assets");
    await page.getByRole("button", { name: "Add Asset" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const submit = dialog.locator('button[type="submit"]');
    await expect(submit).toBeEnabled();
  });

  test("the loans dialog ships REF's text/contract layer (R37-D — reason required + the apartment placeholder, amount 0, paid-from New Era LLC, no min/max/step)", async ({ page }) => {
    await page.goto("/loans");
    await page.getByRole("button", { name: "New Loan Request" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const geo = await dialog.evaluate((dl: HTMLElement) => {
      const reason = dl.querySelector("#loan-reason") as HTMLTextAreaElement;
      const amount = dl.querySelector("#loan-amount") as HTMLInputElement;
      const months = dl.querySelector("#loan-months") as HTMLInputElement;
      const paidFrom = dl.querySelector("#loan-paid-from") as HTMLInputElement;
      return {
        reasonPh: reason.getAttribute("placeholder"),
        reasonReq: reason.required,
        amountVal: amount.value,
        amountMin: amount.getAttribute("min"),
        monthsMax: months.getAttribute("max"),
        pfVal: paidFrom.value,
      };
    });
    expect(geo.reasonPh).toBe("Hi, I'm buying an apartment and I need a loan for the down payment.");
    expect(geo.reasonReq).toBe(true);
    expect(geo.amountVal).toBe("0");
    expect(geo.amountMin).toBe(null);
    expect(geo.monthsMax).toBe(null);
    expect(geo.pfVal).toBe("New Era LLC");
  });

  test("the workflow dialog's Add Level rides 113px (R37-C — the mr-1 recipe; the clone's mr-2 measured 117)", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("tab", { name: "Approval Workflows" }).click();
    await page.getByRole("button", { name: "Add Workflow" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // Session-67 (R67 lesson): the width MUST settle before the read — the
    // dialog's data-[state=open]:zoom-in-95 animate-in means toBeVisible()
    // passes at mount while the scale transition is still in flight, and a
    // mid-transition read lands at 113 × scale ≈ 109 (the full-suite 109.06
    // failure was exactly this; isolated reruns on a warm server settle
    // before the evaluate). The poll-until-stable read replaces the single
    // read: two consecutive equal widths = the transition has finished.
    const readW = () => dialog.evaluate((dl: HTMLElement) => {
      const b = Array.from(dl.querySelectorAll("button")).find((x) => x.textContent?.trim() === "Add Level");
      return b ? b.getBoundingClientRect().width : 0;
    });
    let w = await readW();
    for (let i = 0; i < 12; i++) {
      await page.waitForTimeout(120);
      const w2 = await readW();
      if (w2 === w && w > 0) break;
      w = w2;
    }
    // REF = 113 in the paired browser probe (12px pads + 16px icon + 4px
    // mr-1 + text); headless Chromium rasterizes the text ~2px narrower —
    // the range pins the mr-1 recipe while tolerating the rasterization
    // (the old mr-2 measured 117+ everywhere).
    expect(w).toBeGreaterThanOrEqual(110);
    expect(w).toBeLessThanOrEqual(115);
  });
});
