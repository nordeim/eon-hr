import { expect, test } from "@playwright/test";

// Session 84 — the export/print toolbar action family (the round's
// fresh-eyes instrument: THE EXPORT/PRINT TOOLBAR ACTION MATRIX — the
// r83 close-out's first suggested frontier, never audited before).
//
// The matrix's live verdict (r84-export-recon + the functional probes):
// the cluster lives on exactly FIVE routes on BOTH sides (/attendance
// {Print, PDF, Excel} · /assetmanagement {Export} · /attendancedashboard
// {Export Report, Export} · /payrollreports {CSV, PDF} · /surveyanalytics
// {Export}) — 59/59 label-set MATCH across the full registry. The REF's
// cluster is functionally 1-real (attendance Print → window.print) +
// 1-stub (payrollreports PDF → window.open("") blank window) + 7-dead;
// the clone ships REAL exports everywhere (the CSV downloads — the
// standing superset doctrine, verified end to end for the first time).
//
// R84-A the assetmanagement Export geometry — the session-14 R13-A
//      systemic recipe (the svg's mr-2 ON TOP of the button's gap-2)
//      had ONE missed call site: this button's icon rode bare and the
//      button rendered 104px vs the REF's 112px. Fixed this round.
// R84-B the payrollreports PDF opens the REAL print dialog — the REF's
//      button opens a BLANK window (window.open("")); the clone's old
//      behavior was an advisory toast. Upgraded to window.print() this
//      round (the session-29 R28-B/R29-C print superset in one click).
// R84-C the cluster membership contract — the FIVE census routes carry
//      the cluster and the sampled non-cluster routes carry none.
// R84-D the attendance Print parity — the ONE real action both sides.
// R84-E the toast-superset contract — the attendance PDF/Excel toasts
//      (the documented superset for the REF's dead buttons).

test.describe("session-84 export/print toolbar family (computed truth)", () => {
  test("R84-A: the assetmanagement Export renders the REF-measured geometry (112×36 + the icon's mr-2)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/assetmanagement");
    const exportBtn = page.getByRole("button", { name: "Export", exact: true });
    await expect(exportBtn).toBeVisible({ timeout: 15000 });
    const read = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("main button")].find((b) => (b.textContent || "").trim() === "Export")!;
      const r = btn.getBoundingClientRect();
      const svg = btn.querySelector("svg");
      return { w: Math.round(r.width), h: Math.round(r.height), iconCls: svg ? svg.getAttribute("class") : null };
    });
    // the both-sides live-measured geometry @1440 (the pre-fix LOC read
    // 104×36 with a bare icon — the 8px the mr-2 member restores)
    expect(read.w).toBe(112);
    expect(read.h).toBe(36);
    // the R13-A recipe member: mr-2 on the svg (on top of the button's gap-2)
    expect(read.iconCls).toContain("mr-2");
  });

  test("R84-B: the payrollreports PDF button opens the real print dialog (window.print)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/payrollreports");
    const pdfBtn = page.getByRole("button", { name: "PDF", exact: true });
    await expect(pdfBtn).toBeVisible({ timeout: 15000 });
    // stub the print dialog so headless Chromium never opens one
    await page.evaluate(() => {
      (window as unknown as { __printCalls: number }).__printCalls = 0;
      window.print = () => { (window as unknown as { __printCalls: number }).__printCalls++; };
    });
    await pdfBtn.click();
    // the session-29 print superset in one click (was: an advisory toast)
    await expect.poll(() => page.evaluate(() => (window as unknown as { __printCalls: number }).__printCalls)).toBe(1);
  });

  test("R84-C: the export/print cluster lives on exactly the five census routes", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const CLUSTER: Array<[string, string[]]> = [
      ["/attendance", ["Print", "PDF", "Excel"]],
      ["/assetmanagement", ["Export"]],
      ["/attendancedashboard", ["Export Report", "Export"]],
      ["/payrollreports", ["CSV", "PDF"]],
      ["/surveyanalytics", ["Export"]],
    ];
    const NON_CLUSTER = ["/dashboard", "/employees", "/payroll", "/taskmanager", "/training", "/settings"];
    for (const [route, labels] of CLUSTER) {
      await page.goto(route);
      for (const label of labels) {
        await expect(page.getByRole("button", { name: label, exact: true }), `${route} should carry [${label}]`).toBeVisible({ timeout: 15000 });
      }
    }
    for (const route of NON_CLUSTER) {
      await page.goto(route);
      // settle the client render, then census the export family (a
      // late render would false-pass an immediate empty read). The
      // readiness signal is main — the routes ride different shells
      // (/dashboard's employee-portal header carries no Toggle
      // Sidebar button; the admin pages do)
      await expect(page.locator("main")).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(900);
      const found = await page.evaluate(() =>
        [...document.querySelectorAll("main button")]
          .map((b) => (b.textContent || "").trim())
          .filter((t) => /^(print|pdf|excel|export|export report|csv)$/i.test(t)),
      );
      expect(found, `${route} should carry NO export cluster`).toEqual([]);
    }
  });

  test("R84-D: the attendance Print button calls window.print (the one REAL action both sides)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/attendance");
    const printBtn = page.getByRole("button", { name: "Print", exact: true });
    await expect(printBtn).toBeVisible({ timeout: 15000 });
    await page.evaluate(() => {
      (window as unknown as { __printCalls: number }).__printCalls = 0;
      window.print = () => { (window as unknown as { __printCalls: number }).__printCalls++; };
    });
    await printBtn.click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { __printCalls: number }).__printCalls)).toBe(1);
  });

  test("R84-E: the attendance PDF/Excel buttons toast the export-queued superset (the REF leaves both dead)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/attendance");
    await expect(page.getByRole("button", { name: "PDF", exact: true })).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: "PDF", exact: true }).click();
    // the two toasts carry distinct descriptions (both fire "Export
    // queued" titles; the descriptions name the artifact)
    await expect(page.getByText("Your PDF report is being generated.")).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: "Excel", exact: true }).click();
    await expect(page.getByText("Your Excel export is being generated.")).toBeVisible({ timeout: 5000 });
  });
});
