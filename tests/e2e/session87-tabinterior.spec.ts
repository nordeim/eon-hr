import { expect, test } from "@playwright/test";

// Session 87 — parity round 86: the payrollreports TAB-INTERIOR round (the
// r86 close-out's named frontier — the Tax/History/Custom panels were wired
// as the session-35 superset WITHOUT measuring the REF, whose triggers were
// believed inert; the r87 tab-interior instrument proved them interactive
// and the cross-side pixel-diff read 93/117/219 structural cells on the
// three never-measured panels while the Monthly control pair sat at 0).
// All recipes REF-measured live in the active panels @1440×900 LIGHT.
//
//   R87-A  the Tax & Deductions panel: the trending-up title icon
//          (text-orange-600), "Tax & Deductions Report" +
//          "Breakdown of deductions and estimated tax", the From/To
//          month-range toolbar (From defaulting to January of the current
//          year, To to the current month) with the CSV/PDF pair, the
//          r86-K thead recipe, the SEVEN-column contract (Employee/Month/
//          Insurance/Loans/Late-Absent/Total Deductions/Est. Tax (15%)),
//          the divide-y tbody, the "No records for selected period" TD.
//   R87-B  the History panel: the dollar-sign title icon (text-green-600),
//          "Employee Earnings History" + "Complete salary history per
//          employee", the top-aligned CSV/PDF pair, the NINE-column
//          contract (Employee/Month/Basic/Housing/Transport/Overtime/
//          Total Earnings/Net Salary/Slip), "No payroll history found".
//   R87-C  the Custom panel: the REF's THREE-card architecture (Report
//          Filters with the filter icon + the 4-cell grid + the Status
//          select; Select Columns with the FOURTEEN toggle chips in the
//          REF's order + default states; Report Preview with the records
//          span + the chip-driven column set), and NO Generate button.
//
// The latent R87-D member (the PayrollRow field mismatch) is pinned at the
// unit layer (the recipes spec) — the e2e DB carries no payroll records,
// so the data-row rendering is the with-data superset surface.

const now = new Date();
const cur = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
const jan = `${now.getFullYear()}-01`;

const PANEL = '[role="tabpanel"][data-state="active"]';

test.describe("session-87 — the payrollreports tab interiors (REF-measured recipes)", () => {
  test("R87-A1: the Tax panel title block — the trending-up icon + the REF's title/description", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/payrollreports");
    await page.waitForTimeout(1200);
    await page.getByRole("tab", { name: "Tax & Deductions" }).click();
    await page.waitForTimeout(400);
    const read = await page.evaluate((sel: string) => {
      const panel = document.querySelector(sel);
      const title = panel?.querySelector(".font-semibold.leading-none.tracking-tight");
      const icon = title ? title.querySelector("svg") : null;
      const desc = panel?.querySelector("p.text-sm");
      const header = panel?.querySelector('[class*="p-6"]');
      if (!panel || !title || !desc) return null;
      return {
        titleCls: title.getAttribute("class"),
        titleTxt: title.textContent ? title.textContent.trim() : "",
        iconCls: icon ? icon.getAttribute("class") : "",
        descTxt: desc.textContent ? desc.textContent.trim() : "",
        headerCls: header ? header.getAttribute("class") : "",
      };
    }, PANEL);
    expect(read).not.toBeNull();
    expect(read!.titleCls).toContain("font-semibold leading-none tracking-tight flex items-center gap-2");
    expect(read!.titleTxt).toContain("Tax & Deductions Report");
    expect(read!.iconCls).toContain("lucide-trending-up");
    expect(read!.iconCls).toContain("text-orange-600");
    expect(read!.descTxt).toBe("Breakdown of deductions and estimated tax");
    // the REF's card header carries NO border-b (the r86-A3 member)
    expect(read!.headerCls).not.toContain("border-b");
  });

  test("R87-A2: the Tax panel's From/To range toolbar with the January/current-month defaults + the CSV/PDF pair", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/payrollreports");
    await page.waitForTimeout(1200);
    await page.getByRole("tab", { name: "Tax & Deductions" }).click();
    await page.waitForTimeout(400);
    const read = await page.evaluate((sel: string) => {
      const panel = document.querySelector(sel);
      if (!panel) return null;
      const labels = [...panel.querySelectorAll("label")].map((l) => (l.textContent || "").trim());
      const inputs = [...panel.querySelectorAll<HTMLInputElement>("input[type=month]")].map((i) => ({
        value: i.value,
        w: Math.round(i.getBoundingClientRect().width),
      }));
      const btns = [...panel.querySelectorAll("button")].map((b) => (b.textContent || "").trim()).filter(Boolean);
      return { labels, inputs, btns };
    }, PANEL);
    expect(read).not.toBeNull();
    expect(read!.labels).toContain("From");
    expect(read!.labels).toContain("To");
    expect(read!.inputs.length).toBe(2);
    expect(read!.inputs[0].value).toBe(jan);
    expect(read!.inputs[1].value).toBe(cur);
    expect(read!.inputs[0].w).toBe(144); // w-36
    expect(read!.btns).toContain("CSV");
    expect(read!.btns).toContain("PDF");
  });

  test("R87-A3: the Tax table — the r86-K thead recipe + the SEVEN-column contract", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/payrollreports");
    await page.waitForTimeout(1200);
    await page.getByRole("tab", { name: "Tax & Deductions" }).click();
    await page.waitForTimeout(400);
    const read = await page.evaluate((sel: string) => {
      const panel = document.querySelector(sel);
      const thead = panel?.querySelector("thead");
      const tbody = panel?.querySelector("tbody");
      if (!panel || !thead || !tbody) return null;
      const ths = [...panel.querySelectorAll("th")].map((th) => ({
        t: (th.textContent || "").trim(),
        cls: th.getAttribute("class") || "",
        align: getComputedStyle(th).textAlign,
      }));
      return { theadCls: thead.getAttribute("class") || "", ths, tbodyCls: tbody.getAttribute("class") || "" };
    }, PANEL);
    expect(read).not.toBeNull();
    expect(read!.theadCls).toBe("bg-slate-50 text-slate-600 text-xs uppercase");
    expect(read!.ths.map((x) => x.t)).toEqual([
      "Employee",
      "Month",
      "Insurance",
      "Loans",
      "Late/Absent",
      "Total Deductions",
      "Est. Tax (15%)",
    ]);
    expect(read!.ths[0].align).toBe("left");
    expect(read!.ths[1].align).toBe("center");
    expect(read!.ths[2].cls).toContain("hidden md:table-cell");
    expect(read!.ths[3].cls).toContain("hidden md:table-cell");
    expect(read!.ths[4].cls).toContain("hidden md:table-cell");
    expect(read!.ths[5].align).toBe("right");
    expect(read!.ths[6].align).toBe("right");
    expect(read!.tbodyCls).toContain("divide-y divide-slate-100");
  });

  test("R87-A4: the Tax empty state — the REF's period-independent copy at colSpan 7", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/payrollreports");
    await page.waitForTimeout(1200);
    await page.getByRole("tab", { name: "Tax & Deductions" }).click();
    await page.waitForTimeout(400);
    const read = await page.evaluate((sel: string) => {
      const td = document.querySelector(`${sel} tbody td`) as HTMLTableCellElement | null;
      if (!td) return null;
      return { txt: (td.textContent || "").trim(), span: td.colSpan, cls: td.getAttribute("class") || "" };
    }, PANEL);
    expect(read).not.toBeNull();
    expect(read!.txt).toBe("No records for selected period");
    expect(read!.span).toBe(7);
    expect(read!.cls).toContain("py-12 text-center text-slate-400");
  });

  test("R87-B1: the History panel title block — the dollar-sign icon + the REF's title/description + the export pair", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/payrollreports");
    await page.waitForTimeout(1200);
    await page.getByRole("tab", { name: "History" }).click();
    await page.waitForTimeout(400);
    const read = await page.evaluate((sel: string) => {
      const panel = document.querySelector(sel);
      const title = panel?.querySelector(".font-semibold.leading-none.tracking-tight");
      const icon = title ? title.querySelector("svg") : null;
      const desc = panel?.querySelector("p.text-sm");
      const header = panel?.querySelector('[class*="p-6"]');
      if (!panel || !title || !desc) return null;
      const btns = [...panel.querySelectorAll("button")].map((b) => (b.textContent || "").trim()).filter(Boolean);
      return {
        titleTxt: title.textContent ? title.textContent.trim() : "",
        iconCls: icon ? icon.getAttribute("class") : "",
        descTxt: desc.textContent ? desc.textContent.trim() : "",
        btns,
        headerCls: header ? header.getAttribute("class") : "",
      };
    }, PANEL);
    expect(read).not.toBeNull();
    expect(read!.titleTxt).toContain("Employee Earnings History");
    expect(read!.iconCls).toContain("lucide-dollar-sign");
    expect(read!.iconCls).toContain("text-green-600");
    expect(read!.descTxt).toBe("Complete salary history per employee");
    expect(read!.btns).toContain("CSV");
    expect(read!.btns).toContain("PDF");
    expect(read!.headerCls).not.toContain("border-b");
  });

  test("R87-B2: the History table — the NINE-column contract + the REF's empty copy", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/payrollreports");
    await page.waitForTimeout(1200);
    await page.getByRole("tab", { name: "History" }).click();
    await page.waitForTimeout(400);
    const read = await page.evaluate((sel: string) => {
      const panel = document.querySelector(sel);
      const td = panel?.querySelector("tbody td") as HTMLTableCellElement | null;
      if (!panel || !td) return null;
      const ths = [...panel.querySelectorAll("th")].map((th) => ({
        t: (th.textContent || "").trim(),
        cls: th.getAttribute("class") || "",
      }));
      return { ths, emptyTxt: (td.textContent || "").trim(), span: td.colSpan };
    }, PANEL);
    expect(read).not.toBeNull();
    expect(read!.ths.map((x) => x.t)).toEqual([
      "Employee",
      "Month",
      "Basic",
      "Housing",
      "Transport",
      "Overtime",
      "Total Earnings",
      "Net Salary",
      "Slip",
    ]);
    expect(read!.ths[2].cls).toContain("hidden md:table-cell");
    expect(read!.ths[7].cls).toContain("font-bold");
    expect(read!.ths[8].cls).toContain("text-center");
    expect(read!.emptyTxt).toBe("No payroll history found");
    expect(read!.span).toBe(9);
  });

  test("R87-C1: the Custom panel's THREE-card architecture + the filter icon", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/payrollreports");
    await page.waitForTimeout(1200);
    await page.getByRole("tab", { name: "Custom" }).click();
    await page.waitForTimeout(400);
    const read = await page.evaluate((sel: string) => {
      const panel = document.querySelector(sel);
      if (!panel) return null;
      const cards = [...panel.querySelectorAll(":scope > div > div")].filter(
        (c) => (c.getAttribute("class") || "").includes("rounded-xl border bg-card"),
      );
      const titles = [...panel.querySelectorAll(".font-semibold.tracking-tight")].map((d) =>
        d.textContent ? d.textContent.trim() : "",
      );
      const firstTitleIcon = panel.querySelector(".font-semibold.tracking-tight svg");
      return { nCards: cards.length, titles, firstIconCls: firstTitleIcon ? firstTitleIcon.getAttribute("class") : "" };
    }, PANEL);
    expect(read).not.toBeNull();
    expect(read!.nCards).toBe(3);
    expect(read!.titles[0]).toContain("Report Filters");
    expect(read!.titles[1]).toContain("Select Columns");
    expect(read!.titles[2]).toContain("Report Preview");
    /* Session 87 (R87-C): the REF's lucide-filter glyph — VENDORED (the
       0.525 Funnel carries different path geometry, pixel-proven
       maxdelta 221 — the lucide-version watch's escalation executed);
       the class form + the polygon path match the REF exactly. */
    expect(read!.firstIconCls).toContain("lucide-filter");
  });

  test("R87-C2: the Report Filters grid — the four labels, the current-month defaults, the Status options", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/payrollreports");
    await page.waitForTimeout(1200);
    await page.getByRole("tab", { name: "Custom" }).click();
    await page.waitForTimeout(400);
    const read = await page.evaluate((sel: string) => {
      const panel = document.querySelector(sel);
      if (!panel) return null;
      const labels = [...panel.querySelectorAll("label")].map((l) => (l.textContent || "").trim());
      const inputs = [...panel.querySelectorAll<HTMLInputElement>("input[type=month]")].map((i) => ({
        value: i.value,
        w: Math.round(i.getBoundingClientRect().width),
      }));
      const combos = [...panel.querySelectorAll("button[role=combobox]")].map((b) =>
        b.textContent ? b.textContent.trim() : "",
      );
      return { labels, inputs, combos };
    }, PANEL);
    expect(read).not.toBeNull();
    expect(read!.labels).toEqual(["From Month", "To Month", "Employee", "Status"]);
    expect(read!.inputs.length).toBe(2);
    expect(read!.inputs[0].value).toBe(cur);
    expect(read!.inputs[1].value).toBe(cur);
    expect(read!.inputs[0].w).toBe(256); // w-full inside the grid cell
    expect(read!.combos).toEqual(["All Employees", "All Statuses"]);
    // the Status select's option set (the PayrollRecord status enum) —
    // scoped to the PANEL's second combobox (the page-top Filter by
    // Employee select is also a combobox; a bare nth(1) hits it)
    await page.locator('[role="tabpanel"] [role="combobox"]').nth(1).click();
    await page.waitForTimeout(400);
    const options = await page.evaluate(() =>
      [...document.querySelectorAll('[role=option]')].map((o) => (o.textContent || "").trim()),
    );
    expect(options).toEqual(["All Statuses", "Draft", "Approved", "Paid"]);
  });

  test("R87-C3: the Select Columns chips — FOURTEEN in the REF's order with the default states + the class pair", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/payrollreports");
    await page.waitForTimeout(1200);
    await page.getByRole("tab", { name: "Custom" }).click();
    await page.waitForTimeout(400);
    const read = await page.evaluate((sel: string) => {
      const panel = document.querySelector(sel);
      if (!panel) return null;
      const chips = [...panel.querySelectorAll("button.rounded-full")].map((b) => ({
        t: (b.textContent || "").trim(),
        cls: b.getAttribute("class") || "",
      }));
      return { chips };
    }, PANEL);
    expect(read).not.toBeNull();
    expect(read!.chips.map((c) => c.t)).toEqual([
      "Employee Name",
      "Month",
      "Basic Salary",
      "Housing Allowance",
      "Transport Allowance",
      "Food Allowance",
      "Overtime Hours",
      "Overtime Amount",
      "Total Earnings",
      "Insurance",
      "Loans",
      "Total Deductions",
      "Net Salary",
      "Status",
    ]);
    const on = read!.chips.filter((c) => c.cls.includes("bg-blue-600")).map((c) => c.t);
    const off = read!.chips.filter((c) => c.cls.includes("bg-white")).map((c) => c.t);
    expect(on).toEqual(["Employee Name", "Month", "Basic Salary", "Total Earnings", "Total Deductions", "Net Salary", "Status"]);
    expect(off).toEqual([
      "Housing Allowance",
      "Transport Allowance",
      "Food Allowance",
      "Overtime Hours",
      "Overtime Amount",
      "Insurance",
      "Loans",
    ]);
    expect(read!.chips[0].cls).toContain("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors");
  });

  test("R87-C4: the Report Preview — the chip-driven columns (functional), the records span, the empty TD, NO Generate button", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/payrollreports");
    await page.waitForTimeout(1200);
    await page.getByRole("tab", { name: "Custom" }).click();
    await page.waitForTimeout(400);
    // the preview table's default column set = the default-ON chips
    const before = await page.evaluate((sel: string) => {
      const panel = document.querySelector(sel);
      const td = panel?.querySelector("tbody td") as HTMLTableCellElement | null;
      if (!panel || !td) return null;
      const ths = [...panel.querySelectorAll("thead th")].map((th) => (th.textContent || "").trim());
      const span = panel.querySelector("span.text-slate-400");
      const generate = [...panel.querySelectorAll("button")].find((b) => /Generate/i.test(b.textContent || ""));
      const previewBtns = [...panel.querySelectorAll("button")]
        .filter((b) => b.textContent.trim() === "CSV" || b.textContent.trim() === "PDF")
        .map((b) => ({ t: b.textContent.trim(), disabled: (b as HTMLButtonElement).disabled }));
      return {
        ths,
        records: span ? span.textContent.trim() : "",
        empty: (td.textContent || "").trim(),
        hasGenerate: !!generate,
        previewBtns,
      };
    }, PANEL);
    expect(before).not.toBeNull();
    expect(before!.ths).toEqual([
      "Employee Name",
      "Month",
      "Basic Salary",
      "Total Earnings",
      "Total Deductions",
      "Net Salary",
      "Status",
    ]);
    expect(before!.records).toBe("0 records");
    expect(before!.empty).toBe("No data for selected filters");
    expect(before!.hasGenerate).toBe(false);
    /* the REF's export contract: the PREVIEW exports DISABLE at 0 records
       (live-read disabled + opacity-0.5); the other tabs' exports stay
       enabled (their 0-cell pairs prove it) */
    expect(before!.previewBtns.every((b: { disabled: boolean }) => b.disabled)).toBe(true);
    // the functional pin: toggling a chip adds its column live
    await page.getByRole("button", { name: "Housing Allowance", exact: true }).click();
    await page.waitForTimeout(300);
    const after = await page.evaluate((sel: string) => ({
      ths: [...(document.querySelector(`${sel} thead`)?.querySelectorAll("th") || [])].map((th) =>
        th.textContent ? th.textContent.trim() : "",
      ),
      span: (document.querySelector(`${sel} tbody td`) as HTMLTableCellElement | null)?.colSpan ?? 0,
    }), PANEL);
    expect(after.ths).toContain("Housing Allowance");
    expect(after.ths.length).toBe(8);
    // and the empty row's colSpan follows the active-chip count
    expect(after.span).toBe(8);
  });
});
