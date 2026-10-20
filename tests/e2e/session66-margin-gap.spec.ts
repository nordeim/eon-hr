import { expect, test } from "@playwright/test";

// Session 66 — parity round 65: the margin/gap census (margin 4 sides +
// rowGap/columnGap) — the FIRST full-population read of the two dimensions
// NO census had ever covered (color r57-63, padding+radius r65). Pre-fix
// 19/49; all 30 DIFFs decomposed element-level to 18 fix families + the
// documented allowances. These pins hold the fixes with COMPUTED truth.
//
// The space-y normalization context (the r66 instrument lesson): TW v3
// (REF) authors space-y as margin-TOP on `* + *`; TW v4 (the clone) as
// margin-BLOCK-END on `:not(:last-child)`. The E2E pins read the SETTLED
// computed truth — the visible gaps, not the per-side distribution.
//
// R66-A the PageCanvas scroll band (the r47 documented non-clone,
//   promoted: -80px top margin, clipped invisible at rest).
// R66-B the EmptyState icon is SVG-authored (mx-auto resolves the
//   479px centered margins on the payroll empty state).
// R66-C the StatCard tileFixed row loses mb-3 (0px bottom margin) while
//   the padded pages keep 12px.
// R66-D the employees header row (gap 0) + the grid (gap 24px).
// R66-F the actions cluster: staffrequests gap-2 (8px) + the expenses
//   raw button (no cluster div — the button rides the row directly).
// R66-G the companywall audience group (8px label-to-trigger gap).
// R66-H the payrollengine label-to-control gap (4px).
// R66-J the tenantsetup circle (mb 16px) + the Continue ml-auto.
// R66-L the performancemanagement tabs→content gap (24px) + goals grid
//   gap (24px).
// R66-M the shiftswap pills→card rhythm (16px).
// R66-N the surveyanalytics ONE-grid structure (2 computed tracks + the
//   col-span third card).
// R66-P the hrassistant settled pane renders ZERO children.
// R66-Q the chat new-chat button keeps the 8px gap member.
// R66-K the workflowconfigpage CTA carries the 16px top margin itself.

test.describe("session-66 margin/gap census (computed truth)", () => {
  test("R66-A: the PageCanvas scroll band renders on the band pages (-80px top margin, hidden above the canvas)", async ({ page }) => {
    await page.goto("/dashboard");
    const band = page.locator("main div.-mt-20").first();
    await expect(band).toHaveCount(1);
    expect(await band.evaluate((el) => getComputedStyle(el).marginTop)).toBe("-80px");
    expect(await band.evaluate((el) => getComputedStyle(el).height)).toBe("80px");
    await expect(band.locator("svg")).toBeAttached();

    await page.goto("/attendance");
    const band2 = page.locator("main div.-mt-20").first();
    await expect(band2).toHaveCount(1);
    expect(await band2.evaluate((el) => getComputedStyle(el).marginTop)).toBe("-80px");

    // the band does NOT render on non-PageCanvas routes
    await page.goto("/settings");
    await expect(page.locator("main div.-mt-20")).toHaveCount(0);
  });

  test("R66-B: the EmptyState icon is SVG-AUTHORED — the payroll empty-state icon carries the centered auto margins", async ({ page }) => {
    await page.goto("/payroll");
    const icon = page.locator("main svg.w-16.h-16").first();
    await expect(icon).toBeVisible({ timeout: 15000 });
    const ml = await icon.evaluate((el) => getComputedStyle(el).marginLeft);
    expect(parseFloat(ml)).toBeGreaterThan(300);
    expect(await icon.evaluate((el) => getComputedStyle(el).marginBottom)).toBe("16px");
    // the wrapper div is retired: no justify-center wrapper precedes it
    expect(await icon.evaluate((el) => (el.parentElement?.getAttribute("class") || ""))).toContain("p-12");
  });

  test("R66-C: the StatCard tileFixed rows are unspaced (bottom margin 0) while the padded payroll row keeps 12px", async ({ page }) => {
    await page.goto("/advancedanalytics");
    const advRow = page.locator("main div.bg-blue-100.rounded-xl").first().locator("xpath=..");
    await expect(advRow).toBeVisible({ timeout: 15000 });
    expect(await advRow.evaluate((el) => getComputedStyle(el).marginBottom)).toBe("0px");

    await page.goto("/payroll");
    const payRow = page.locator("main div.bg-green-100.rounded-xl").first().locator("xpath=..");
    await expect(payRow).toBeVisible({ timeout: 15000 });
    expect(await payRow.evaluate((el) => getComputedStyle(el).marginBottom)).toBe("12px");
  });

  test("R66-D: the employees header row computes gap 0 (the alwaysRow family) and the grid gap is 24px", async ({ page }) => {
    await page.goto("/employees");
    const grid = page.locator("main div[class*='lg:grid-cols-3']").first();
    await expect(grid).toBeVisible({ timeout: 15000 });
    expect(await grid.evaluate((el) => getComputedStyle(el).columnGap)).toBe("24px");
    // the header row: hidden md:flex items-center justify-between mb-8 — no gap member
    const row = grid.locator("xpath=preceding-sibling::div[contains(@class,'mb-8')][1]");
    await expect(row).toBeVisible();
    expect(await row.evaluate((el) => getComputedStyle(el).columnGap)).toBe("normal");
    expect(await row.evaluate((el) => getComputedStyle(el).marginBottom)).toBe("32px");
  });

  test("R66-F: the actions cluster per-page truth — staffrequests gap-2; the expenses raw button rides the row directly", async ({ page }) => {
    await page.goto("/staffrequests");
    const h1 = page.locator("main h1", { hasText: "Staff Requests" }).first();
    await expect(h1).toBeVisible({ timeout: 15000 });
    let row = h1.locator("xpath=ancestor::div[contains(@class,'justify-between')][1]");
    const cluster = row.locator("div.gap-2").last();
    await expect(cluster).toBeVisible();
    expect(await cluster.evaluate((el) => getComputedStyle(el).columnGap)).toBe("8px");

    await page.goto("/expenses");
    // the LAST matching h1 is the visible desktop header (the mobile
    // kicker's h1 precedes it in the DOM and is md:hidden)
    const h1e = page.locator("main h1", { hasText: "Expense" }).last();
    await expect(h1e).toBeVisible({ timeout: 15000 });
    row = h1e.locator("xpath=ancestor::div[contains(@class,'justify-between')][1]");
    // the actions slot renders the BUTTON directly — no cluster div
    const direct = row.locator("xpath=./button");
    await expect(direct).toBeVisible();
    expect(await direct.evaluate((el) => getComputedStyle(el).columnGap)).toBe("8px");
  });

  test("R66-G: the companywall audience group is the 8px space-y-2 rhythm with the leading-none label", async ({ page }) => {
    await page.goto("/companywall");
    const label = page.locator("main label", { hasText: "Who can see this post?" });
    await expect(label).toBeVisible({ timeout: 15000 });
    expect(await label.evaluate((el) => getComputedStyle(el).lineHeight)).toBe("14px");
    // the settled v4 space-y-2 distribution: the non-last LABEL carries
    // the 8px margin-bottom (the v4 :not(:last-child) form)
    expect(await label.evaluate((el) => getComputedStyle(el).marginBottom)).toBe("8px");
    const trigger = page.locator("main button[aria-label='Audience']");
    await expect(trigger).toBeVisible();
  });

  test("R66-H: the payrollengine label-to-control gap is 4px (space-y-1)", async ({ page }) => {
    await page.goto("/payrollengine");
    const trigger = page.locator("main button[aria-label='Department'], main #pe-department").first();
    await expect(trigger).toBeVisible({ timeout: 15000 });
    // the settled v4 space-y-1: the non-last label carries margin-bottom 4px
    const label = page.locator("main label", { hasText: "Department" }).first();
    expect(await label.evaluate((el) => getComputedStyle(el).marginBottom)).toBe("4px");
  });

  test("R66-J: the tenantsetup circle rides mb-4 and the Continue button right-aligns via ml-auto", async ({ page }) => {
    await page.goto("/tenantsetup");
    const circle = page.locator("main div.rounded-full.bg-blue-100").first();
    await expect(circle).toBeVisible({ timeout: 15000 });
    expect(await circle.evaluate((el) => getComputedStyle(el).marginBottom)).toBe("16px");
    const cont = page.locator("main button", { hasText: "Continue" }).first();
    await expect(cont).toBeVisible();
    const ml = await cont.evaluate((el) => getComputedStyle(el).marginLeft);
    expect(parseFloat(ml)).toBeGreaterThan(100);
  });

  test("R66-K: the workflowconfigpage empty-state CTA carries the 16px top margin on the button itself", async ({ page }) => {
    await page.goto("/workflowconfigpage");
    const btn = page.locator("main button", { hasText: "Create First Workflow" });
    await expect(btn).toBeVisible({ timeout: 15000 });
    expect(await btn.evaluate((el) => getComputedStyle(el).marginTop)).toBe("16px");
  });

  test("R66-L: the performancemanagement tabs→content gap is 24px and the goals grid gap is 24px", async ({ page }) => {
    await page.goto("/performancemanagement");
    const tabs = page.locator("main [role=tablist]").first();
    await expect(tabs).toBeVisible({ timeout: 15000 });
    const grid = page.locator("main [data-state='active'] div.grid.gap-6").first();
    // the goals grid renders EMPTY at the zero state (h=0 — REF's own
    // zero-state form; Playwright treats zero-size as hidden, so the pin
    // attaches + reads the computed truth)
    await expect(grid).toBeAttached();
    expect(await grid.evaluate((el) => getComputedStyle(el).rowGap)).toBe("24px");
    // the settled content gap: the goals content block's top edge sits
    // 24px below the tablist's bottom (the content's mt-6 collapses with
    // the v4 space-y-6 rhythm to REF's 24px)
    const content = page.locator("main div.mt-6.ring-offset-background").first();
    await expect(content).toBeAttached();
    const gap = await tabs.evaluate((t, g) => {
      const tr = t.getBoundingClientRect();
      const gr = (g as HTMLElement).getBoundingClientRect();
      return Math.round(gr.top - tr.bottom);
    }, await content.elementHandle());
    expect(gap).toBe(24);
  });

  test("R66-M: the shiftswap pills-to-card rhythm — the pills ride the page space-y-8 (32px), the card rides REF's card-only space-y-4 wrapper", async ({ page }) => {
    await page.goto("/shiftswap");
    const pills = page.locator("main div.flex.gap-1.bg-white").first();
    await expect(pills).toBeVisible({ timeout: 15000 });
    const card = page.locator("main .rounded-xl.border.bg-card").last();
    await expect(card).toBeVisible();
    const gap = await pills.evaluate((p, c) => {
      const pr = p.getBoundingClientRect();
      const cr = (c as HTMLElement).getBoundingClientRect();
      return Math.round(cr.top - pr.bottom);
    }, await card.elementHandle());
    expect(gap).toBe(32);
  });

  test("R66-N: the surveyanalytics chart section is ONE grid — two computed tracks, the third card spans both", async ({ page }) => {
    await page.goto("/surveyanalytics");
    const grid = page.locator("main div.grid.md\\:grid-cols-2").first();
    await expect(grid).toBeVisible({ timeout: 15000 });
    expect(await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length)).toBe(2);
    const third = grid.locator("xpath=./div[3]");
    expect(await third.evaluate((el) => getComputedStyle(el).gridColumn)).toContain("span");
    expect(await third.evaluate((el) => getComputedStyle(el).gridColumn)).toContain("2");
  });

  test("R66-P: the hrassistant settled pane renders ZERO children (the loader div unmounts)", async ({ page }) => {
    await page.goto("/hrassistant");
    const pane = page.locator("main div.h-\\[500px\\]").first();
    await expect(pane).toBeVisible({ timeout: 15000 });
    await page.waitForFunction(() => {
      const pane = document.querySelector("main div[class*='h-[500px]']");
      return pane ? pane.children.length === 0 : false;
    }, undefined, { timeout: 15000 });
    expect(await pane.evaluate((el) => el.children.length)).toBe(0);
  });

  test("R66-Q: the chat new-chat button keeps the 8px gap member", async ({ page }) => {
    await page.goto("/chat");
    const btn = page.locator("main button.bg-blue-600").first();
    await expect(btn).toBeVisible({ timeout: 15000 });
    expect(await btn.evaluate((el) => getComputedStyle(el).columnGap)).toBe("8px");
  });
});
