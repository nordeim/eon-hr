import { expect, test } from "@playwright/test";

/**
 * Session 48 (parity round 47) — the unmapped-route interiors.
 *
 * Round 46 covered 12 canonical routes; this round censused the
 * REMAINING ~46 (three census batches + the rows/rootmap/zone readers,
 * live REF vs the zero-tenant :3201 clone). The E2E layer pins the
 * rendered contracts that hold at ANY data state: the kicker's dark
 * pair (R47-A1) + the dashboard's hand-rolled kicker verbatim (A2),
 * the md-family row members (C1), the per-page stat tags (D1/D2), the
 * no-tile rewrite's label-top order (D1b), the advancedanalytics label
 * texts (D3), the root families (B1-B4), and the stubs (B7).
 */
test.describe("session-48 unmapped interiors", () => {
  test("R47-A1/A2: the kicker h1 carries the dark pair — the PageHeader's and the dashboard's hand-rolled copy", async ({ page }) => {
    await page.goto("/payroll");
    // The kicker is md:hidden — hidden at the desktop E2E viewport; the
    // class contract is the assertion (no visibility wait).
    const h1cls = await page.locator("div.md\\:hidden h1").first().getAttribute("class");
    expect(h1cls).toContain("text-lg font-bold text-slate-900 dark:text-white truncate");

    await page.goto("/dashboard");
    const dashCls = await page.locator("div.md\\:hidden").first().getAttribute("class");
    expect(dashCls).toContain("md:hidden sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 safe-area-top");
    const dashH1 = await page.locator("div.md\\:hidden h1").first().getAttribute("class");
    expect(dashH1).toContain("dark:text-white");
  });

  test("R47-C1: the md-family header row carries the unprefixed justify-between + items-start members (hrletters)", async ({ page }) => {
    await page.goto("/hrletters");
    await expect(page.getByRole("heading", { name: "HR Letters" })).toBeVisible();
    const rowCls = await page.evaluate(() => {
      const h1 = [...document.querySelectorAll("h1")].find((h) => h.textContent === "HR Letters");
      const row = h1?.closest("div[class*=flex-col]");
      return row ? row.className : null;
    });
    expect(rowCls).toContain("justify-between");
    expect(rowCls).toContain("items-start");
    expect(rowCls).toContain("md:flex-row");
    expect(rowCls).toContain("md:items-center");
  });

  test("R47-D2a: the four analytics compacts render P values + P slate-600 labels (attendancedashboard)", async ({ page }) => {
    await page.goto("/attendancedashboard");
    await expect(page.getByRole("heading", { name: "Attendance Dashboard" })).toBeVisible();
    const statZone = page.locator("div[class*=md\\:grid-cols-4]").first();
    await expect(page.getByText("Present Days")).toBeVisible();
    const tags = await statZone.evaluate((zone) => {
      const card = zone.children[0] as HTMLElement;
      const value = card.querySelector("[class*=text-2xl]");
      const label = [...card.querySelectorAll("*")].filter((d) => /text-sm/.test(d.className || "")).pop() as HTMLElement;
      return { valueTag: value?.tagName, labelTag: label?.tagName, labelCls: label?.className };
    });
    expect(tags.valueTag).toBe("P");
    expect(tags.labelTag).toBe("P");
    expect(tags.labelCls).toContain("text-slate-600");
  });

  test("R47-D1b: the no-tile rewrite — label-TOP p + value-BELOW p mt-1 + the bare 40px icon (performancemanagement)", async ({ page }) => {
    await page.goto("/performancemanagement");
    await expect(page.getByRole("heading", { name: "Goals & Reviews" })).toBeVisible();
    const card = await page.evaluate(() => {
      const grid = [...document.querySelectorAll("main div")].find((d) =>
        /^grid/.test(d.className || "") && /grid-cols-4/.test(d.className || "")
      );
      if (!grid) return null;
      const c = grid.children[0] as HTMLElement;
      const ps = [...c.querySelectorAll("p")];
      const svg = c.querySelector("svg");
      return {
        p0: ps[0]?.className,
        p0text: ps[0]?.textContent,
        p1: ps[1]?.className,
        svgCls: svg?.getAttribute("class"),
        svgParentIsCard: svg?.parentElement?.closest(".flex") !== null,
      };
    });
    expect(card?.p0).toBe("text-sm text-slate-600");
    expect(card?.p0text).toBe("Total Goals");
    expect(card?.p1).toContain("text-3xl font-bold text-slate-900 mt-1");
    expect(card?.svgCls).toContain("w-10 h-10 text-blue-500");
  });

  test("R47-D2c/D3: advancedanalytics renders the p/p mt-4 family + REF's label texts", async ({ page }) => {
    await page.goto("/advancedanalytics");
    await expect(page.getByRole("heading", { name: "Analytics & Insights" })).toBeVisible();
    const zone = await page.evaluate(() => {
      const grid = [...document.querySelectorAll("main div")].find((d) =>
        /^grid/.test(d.className || "") && /grid-cols-4/.test(d.className || "")
      );
      if (!grid) return null;
      const card = grid.children[0] as HTMLElement;
      const ps = [...card.querySelectorAll("p")];
      const labels = [...grid.querySelectorAll("p")].filter((p) => /text-sm/.test(p.className)).map((p) => p.textContent);
      return {
        valueCls: ps.find((p) => /text-3xl/.test(p.className))?.className,
        labels: labels.slice(0, 4),
      };
    });
    expect(zone?.valueCls).toContain("mt-4");
    expect(zone?.labels).toContain("Avg Tenure (months)");
    expect(zone?.labels).toContain("At Risk (AI Prediction)");
  });

  test("R47-B1/B2: the v3 gradient + space-y wrapper families (compliancedashboard + hrletters + organogram)", async ({ page }) => {
    await page.goto("/compliancedashboard");
    await expect(page.getByRole("heading", { name: "Compliance Dashboard" })).toBeVisible();
    const rootPair = await page.evaluate(() => {
      const main = document.querySelector("main");
      const sc = (main?.querySelector("div.overflow-auto, div.overflow-y-auto") || main) as HTMLElement;
      const grad = sc.querySelector("div.min-h-screen");
      const inner = grad?.querySelector("div[class*=max-w-7xl]") as HTMLElement;
      return { grad: grad?.className, inner: inner?.className };
    });
    expect(rootPair.grad).toContain("bg-gradient-to-br from-red-50 to-orange-50");
    expect(rootPair.inner).toBe("max-w-7xl mx-auto space-y-8");

    await page.goto("/organogram");
    const organInner = await page.evaluate(() => {
      const main = document.querySelector("main");
      const sc = (main?.querySelector("div.overflow-auto, div.overflow-y-auto") || main) as HTMLElement;
      return sc.querySelector("div[class*=max-w-full]")?.className;
    });
    expect(organInner).toBe("max-w-full mx-auto space-y-8");
  });

  test("R47-B3: the merged-root five — space-y-8 + gradient ON the root, no max-w wrapper (attendancedashboard)", async ({ page }) => {
    await page.goto("/attendancedashboard");
    await expect(page.getByRole("heading", { name: "Attendance Dashboard" })).toBeVisible();
    const merged = await page.evaluate(() => {
      const main = document.querySelector("main");
      const sc = (main?.querySelector("div.overflow-auto, div.overflow-y-auto") || main) as HTMLElement;
      const root = sc.querySelector("div.min-h-screen") as HTMLElement;
      const hasMaxW = !!root.querySelector("div[class*=max-w-7xl]");
      return { root: root?.className, hasMaxW };
    });
    expect(merged.root).toContain("p-4 md:p-8 space-y-8 min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50");
    expect(merged.hasMaxW).toBe(false);
  });

  test("R47-B4: the bare roots — announcements + requestreports (no gradient, no extra wrapper)", async ({ page }) => {
    await page.goto("/announcements");
    await expect(page.getByRole("heading", { name: "Company Announcements" })).toBeVisible();
    const annRoot = await page.evaluate(() => {
      const main = document.querySelector("main");
      const sc = (main?.querySelector("div.overflow-auto, div.overflow-y-auto") || main) as HTMLElement;
      const first = sc.children[0] as HTMLElement;
      return { root: first?.className, childMax: !!first.querySelector("div[class*=max-w-]") };
    });
    expect(annRoot.root).toBe("p-4 md:p-8 space-y-6");
    expect(annRoot.childMax).toBe(false);

    await page.goto("/requestreports");
    await expect(page.getByRole("heading", { name: "Request Reports" })).toBeVisible();
    const rrRoot = await page.evaluate(() => {
      const main = document.querySelector("main");
      const sc = (main?.querySelector("div.overflow-auto, div.overflow-y-auto") || main) as HTMLElement;
      return (sc.children[0] as HTMLElement)?.className;
    });
    expect(rrRoot).toBe("p-4 md:p-8 max-w-7xl mx-auto space-y-6");
  });

  test("R47-B7: the stubs — /home renders the empty div, /employeedetail renders the centered spinner", async ({ page }) => {
    await page.goto("/home");
    const homeInner = await page.evaluate(() => {
      const main = document.querySelector("main");
      const sc = (main?.querySelector("div.overflow-auto, div.overflow-y-auto") || main) as HTMLElement;
      return { childCount: sc.children.length, empty: (sc.children[0] as HTMLElement)?.innerHTML === "" };
    });
    expect(homeInner.childCount).toBe(1);
    expect(homeInner.empty).toBe(true);

    await page.goto("/employeedetail");
    const ed = await page.evaluate(() => {
      const main = document.querySelector("main");
      const sc = (main?.querySelector("div.overflow-auto, div.overflow-y-auto") || main) as HTMLElement;
      const root = sc.children[0] as HTMLElement;
      const spinner = root?.querySelector("div[class*=animate-spin]") as HTMLElement;
      return { root: root?.className, spinner: spinner?.className };
    });
    expect(ed.root).toBe("flex items-center justify-center min-h-screen");
    expect(ed.spinner).toContain("w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin");
  });

  test("R47-E3: templates renders ONE Create Template button (the row CTA — the duplicate retired)", async ({ page }) => {
    await page.goto("/templates");
    await expect(page.getByRole("heading", { name: "Onboarding Templates" })).toBeVisible();
    const buttons = await page.evaluate(() =>
      [...document.querySelectorAll("main button")].filter((b) => b.textContent?.trim() === "Create Template").length
    );
    expect(buttons).toBe(1);
  });

  test("R47-F3: recruitmentkanban's stage-count chips are DIVs", async ({ page }) => {
    await page.goto("/recruitmentkanban");
    await expect(page.getByRole("heading", { name: "Recruitment Pipeline" })).toBeVisible();
    // the columns render after the candidate fetch settles
    await expect(page.getByRole("heading", { name: "Applied", exact: true })).toBeVisible();
    const chip = await page.evaluate(() => {
      const chipEl = [...document.querySelectorAll("main div")].find((d) =>
        /bg-slate-200 text-slate-700/.test(d.className || "")
      );
      return chipEl ? { tag: chipEl.tagName, cls: chipEl.className } : null;
    });
    expect(chip?.tag).toBe("DIV");
    expect(chip?.cls).toContain("rounded-md border px-2.5 py-0.5 font-semibold");
  });
});
