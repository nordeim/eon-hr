import { expect, test } from "@playwright/test";

// Session 81 — the lg-band responsive family (R81-A..B). The r81 fresh-eyes
// instrument — the TABLET (md-boundary) VIEWPORT MATRIX + the lg-band grid
// census — read the 12-route sweep set at 768x1024 and 1024x768 on BOTH
// sides and found two clone-authored divergences in the never-measured
// 1024-1279 band (the standing audits covered 390 and 1440 only):
//
// R81-A — /attendance's stats grid: the REF switches to FIVE columns at lg
//   (`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4` — live-measured
//   5 computed columns @1024) while the clone emitted `xl:grid-cols-5`
//   (3 columns across the whole 1024-1279 band). Fixed to the REF's lg
//   member this round.
//
// R81-B — /payroll's PageHeader row: the REF's row is the md family
//   (`hidden md:flex flex-col md:flex-row justify-between items-start
//   md:items-center gap-4` — live-measured) while the clone omitted
//   rowBreakpoint="md" (the sm default emitted `sm:flex-row
//   sm:justify-between sm:items-center`). Visually inert (the row is
//   hidden below md on both sides and row at md+), but the DOM member
//   contract now matches the REF. The raised offset (rowY=64) was
//   verified identical on both sides pre-fix.

test.describe("session-81 lg-band responsive family (computed truth)", () => {
  test("R81-A: the attendance stats grid renders FIVE columns at 1024 (lg), the REF's member", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/attendance");
    await expect(page.getByText("Total Employees")).toBeVisible({ timeout: 15000 });
    const statsGrid = page.evaluate(() => {
      const el = [...document.querySelectorAll("main div")].find(
        (d) => /grid-cols-2/.test(d.className) && /grid-cols-(3|5)/.test(d.className) && d.children.length >= 5,
      );
      if (!el) return null;
      return {
        cls: el.className.replace(/\s+/g, " ").trim(),
        cols: getComputedStyle(el).gridTemplateColumns.split(" ").length,
      };
    });
    const read = await statsGrid;
    expect(read).not.toBeNull();
    expect(read!.cols).toBe(5); // REF: lg:grid-cols-5 — five columns from 1024 up
    expect(read!.cls).toContain("lg:grid-cols-5"); // the member contract
    expect(read!.cls).not.toContain("xl:grid-cols-5");
  });

  test("R81-A (boundary): the attendance stats grid keeps THREE columns at 768 (md) and FIVE at 1440", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/attendance");
    await expect(page.getByText("Total Employees")).toBeVisible({ timeout: 15000 });
    const colsAt768 = await page.evaluate(() => {
      const el = [...document.querySelectorAll("main div")].find(
        (d) => /grid-cols-2/.test(d.className) && /grid-cols-(3|5)/.test(d.className) && d.children.length >= 5,
      );
      return el ? getComputedStyle(el).gridTemplateColumns.split(" ").length : null;
    });
    expect(colsAt768).toBe(3); // md:grid-cols-3 — unchanged by the fix

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/attendance");
    await expect(page.getByText("Total Employees")).toBeVisible({ timeout: 15000 });
    const colsAt1440 = await page.evaluate(() => {
      const el = [...document.querySelectorAll("main div")].find(
        (d) => /grid-cols-2/.test(d.className) && /grid-cols-(3|5)/.test(d.className) && d.children.length >= 5,
      );
      return el ? getComputedStyle(el).gridTemplateColumns.split(" ").length : null;
    });
    expect(colsAt1440).toBe(5); // five at the standing audit width too
  });

  test("R81-B: the payroll PageHeader row carries the REF's md-family members", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/payroll");
    // the kicker h1 + the page h1 share the name — wait for the row itself
    await page.waitForFunction(() =>
      [...document.querySelectorAll("main div")].some(
        (d) => /flex-row/.test(d.className) && d.querySelector("h1"),
      ), { timeout: 15000 });
    const row = await page.evaluate(() => {
      const el = [...document.querySelectorAll("main div")].find(
        (d) => /flex-row/.test(d.className) && d.querySelector("h1"),
      );
      if (!el) return null;
      const cs = getComputedStyle(el);
      return {
        cls: el.className.replace(/\s+/g, " ").trim(),
        display: cs.display,
        dir: cs.flexDirection,
      };
    });
    expect(row).not.toBeNull();
    // the md-family member contract (the REF's own set):
    expect(row!.cls).toContain("md:flex-row");
    expect(row!.cls).toContain("md:items-center");
    expect(row!.cls).not.toMatch(/(^|\s)sm:flex-row(\s|$)/); // the sm default retired
    // the behavior at md+: row
    expect(row!.display).toBe("flex");
    expect(row!.dir).toBe("row");
  });

  test("R81-B (boundary): the payroll header row stays hidden below md (the kicker's surface)", async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 900 });
    await page.goto("/payroll");
    // below md the desktop header (badge included) is hidden — the kicker
    // bar + the stats grid are the visible surface; wait on a stat card.
    await expect(page.getByText("Total This Month")).toBeVisible({ timeout: 15000 });
    const read = await page.evaluate(() => {
      const el = [...document.querySelectorAll("main div")].find(
        (d) => /flex-row/.test(d.className) && d.querySelector("h1"),
      );
      if (!el) return null;
      return { display: getComputedStyle(el).display, hasHiddenMd: /(^|\s)hidden(\s|$)/.test(el.className) && /md:flex/.test(el.className) };
    });
    expect(read).not.toBeNull();
    expect(read!.display).toBe("none"); // hidden md:flex — the category-A kicker pattern
    expect(read!.hasHiddenMd).toBe(true);
  });

  // R81-C — the actions-cluster wrap divergence (the r81 cluster census:
  // 34 pages read on BOTH sides @1024). The REF is per-page inconsistent:
  // payrollmodule + attendancedashboard wrap (`flex items-center gap-3
  // flex-wrap` — the clone default matches those two), staffreports rides
  // `flex gap-2`, five more ride the BARE UNWRAPPED `flex gap-3`, and the
  // rest render single actions directly. The clone's flex-wrap default on
  // those five made their header rows COLLAPSE at tablet where the REF's
  // rows keep their natural min-content and the page overflows (the
  // REF-authored overflow class — payroll ref 861 vs loc 768 pre-fix).
  test("R81-C: the five bare-cluster pages render the REF's unwrapped `flex gap-3` actions cluster", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    for (const route of ["/payroll", "/taskmanager", "/documenttracker", "/attendance", "/assetmanagement"]) {
      await page.goto(route);
      // wait for the md:flex-row header row itself (the FIRST main h1 is the
      // hidden kicker brand — never visible at desktop widths)
      await page.waitForFunction(() =>
        [...document.querySelectorAll("main div")].some(
          (d) => /(^|\s)md:flex-row(\s|$)/.test(d.className) && d.querySelector("h1"),
        ), { timeout: 15000 });
      const cluster = await page.evaluate(() => {
        const row = [...document.querySelectorAll("main div")].find(
          (d) => /(^|\s)md:flex-row(\s|$)/.test(d.className) && d.querySelector("h1"),
        );
        if (!row) return null;
        const last = row.children[row.children.length - 1];
        if (last.tagName !== "DIV") return { tag: last.tagName };
        return { cls: last.className.replace(/\s+/g, " ").trim() };
      });
      expect(cluster, `${route} cluster`).not.toBeNull();
      expect(cluster!.cls, `${route} cluster class`).toBe("flex gap-3"); // the REF's bare member set
    }
  });

  test("R81-C (parity): the payroll page overflows horizontally at 768 like the REF (the row's natural min-content)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/payroll");
    await expect(page.getByText("Total This Month")).toBeVisible({ timeout: 15000 });
    const read = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
    }));
    // REF-measured: scrollW 861 at 768 (main 605 = the row's min-content
    // via the unwrapped cluster; the page grows past the viewport).
    expect(read.scrollW).toBeGreaterThan(read.innerW); // the REF-authored overflow — no longer wrapped away
  });

  test("R81-C (regression): the wrapping pages keep the REF's flex-wrap cluster (payrollmodule, attendancedashboard)", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    for (const route of ["/payrollmodule", "/attendancedashboard"]) {
      await page.goto(route);
      await page.waitForFunction(() =>
        [...document.querySelectorAll("main div")].some(
          (d) => /(^|\s)md:flex-row(\s|$)/.test(d.className) && d.querySelector("h1"),
        ), { timeout: 15000 });
      const cluster = await page.evaluate(() => {
        const row = [...document.querySelectorAll("main div")].find(
          (d) => /(^|\s)md:flex-row(\s|$)/.test(d.className) && d.querySelector("h1"),
        );
        if (!row) return null;
        const last = row.children[row.children.length - 1];
        return last.tagName === "DIV" ? { cls: last.className.replace(/\s+/g, " ").trim() } : { tag: last.tagName };
      });
      expect(cluster, `${route} cluster`).not.toBeNull();
      expect(cluster!.cls, `${route} keeps the wrap`).toBe("flex flex-wrap items-center gap-3");
    }
  });
});
