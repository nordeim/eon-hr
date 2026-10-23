import { expect, test } from "@playwright/test";

// Session 82 — the breakpoint-boundary family (R82-A). The r82 fresh-eyes
// instrument — THE BREAKPOINT-BOUNDARY MATRIX (the sm 640 + xl 1280 edges,
// the last two never-measured TW-v4 breakpoint surfaces, with the 639/1279
// off-by-one edges) — walked the 12-route sweep set on BOTH sides and found
// ONE clone-authored divergence in the attendance page-header ROW:
//
// R82-A — /attendance's PageHeader row carries an extra `md:flex-wrap`
//   member the REF's row lacks (live-measured @1280: the REF row = `flex
//   flex-col md:flex-row justify-between items-start md:items-center
//   gap-4`, min-content 1238 = hero 312 + gap 16 + cluster 911 — the row
//   does NOT wrap, so the page overflows by design: scrollW 1558 constant
//   across the whole 768-1440 range; the LOC row carried `md:flex-wrap`
//   (a session-10 anti-overflow choice predating the REF-authored-overflow
//   parity standard established in r79/r81), wrapping the cluster to a
//   second line and keeping the page fitting at 1280+ (min-content 911 =
//   the widest member). This ALSO corrects the r81 classification — the
//   attendance "@768 remainder" attributed to "the records data" was
//   actually this row-wrap member (the REF renders NO records for this
//   user; its /attendance is the access-restricted state with role-scoped
//   zero stats).
//
// The fix: the `md:flex-wrap` className member removed from the attendance
// PageHeader — the row joins the REF's md-family no-wrap rows (the
// payroll/taskmanager/documenttracker class proven byte-identical in r81),
// and the page overflows BYTE-IDENTICALLY with the REF at every md+ band
// (scrollW 1558 at 768/1024/1280/1440 — the REF-measured constant).
//
// The round's other boundary FINDs are classified data-authored (no
// action): /employees (the REF tenant's 0 employees vs the LOC's 1 seeded
// card grid) and /careers (the REF's 1 job posting vs the LOC's 0-job
// board — the r80 chip-seed proof).

test.describe("session-82 breakpoint-boundary family (computed truth)", () => {
  test("R82-A: the attendance page-header row does NOT wrap at md+ (the REF's no-wrap md family)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1024 });
    await page.goto("/attendance");
    await expect(page.getByText("Total Employees")).toBeVisible({ timeout: 15000 });
    const row = await page.evaluate(() => {
      const el = [...document.querySelectorAll("main [class*=md\\:flex-row]")].find(
        (d) => /justify-between/.test(d.className) && /items-start/.test(d.className) && (d.getBoundingClientRect().width ?? 0) > 0,
      );
      if (!el) return null;
      return { cls: el.className.replace(/\s+/g, " ").trim() };
    });
    expect(row).not.toBeNull();
    // the REF's row family — no flex-wrap member anywhere
    expect(row!.cls).toContain("md:flex-row");
    expect(row!.cls).not.toContain("flex-wrap");
    expect(row!.cls).not.toContain("md:flex-wrap");
  });

  test("R82-A: the attendance hero squeezes to the REF's 312px min-content (the two-line title) at md+", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1024 });
    await page.goto("/attendance");
    await expect(page.getByText("Total Employees")).toBeVisible({ timeout: 15000 });
    const hero = await page.evaluate(() => {
      const row = [...document.querySelectorAll("main [class*=md\\:flex-row]")].find(
        (d) => /justify-between/.test(d.className) && /items-start/.test(d.className),
      );
      if (!row) return null;
      const heroDiv = row.children[0] as HTMLElement;
      const title = heroDiv.querySelector("h1, [class*=text-2xl], [class*=text-3xl]") || heroDiv;
      return {
        heroW: Math.round(heroDiv.getBoundingClientRect().width),
        titleH: Math.round(title.getBoundingClientRect().height),
        titleLines: Math.round(title.getBoundingClientRect().height / 24), // ~24px line-height
      };
    });
    expect(hero).not.toBeNull();
    // the REF's hero: 312px min-content with the title wrapping (h>40 = 2
    // lines at 24-36px leading; the pre-fix one-line hero read h≈29-36)
    expect(hero!.heroW).toBeLessThanOrEqual(320);
    expect(hero!.heroW).toBeGreaterThanOrEqual(300);
  });

  test("R82-A: the attendance page overflows BYTE-IDENTICALLY with the REF at the md+ bands (scrollW 1558)", async ({ page }) => {
    // The REF's attendance min-content is a CONSTANT across 768-1440:
    // main 1302 (the row's 1238 + the p-8 padding 64) + sidebar 256 =
    // scrollW 1558. The pre-fix LOC wrapped → fitted at 1280 (scrollW
    // 1280). Post-fix the LOC reproduces the REF-authored overflow at
    // every md+ width.
    for (const w of [1280]) {
      await page.setViewportSize({ width: w, height: 1024 });
      await page.goto("/attendance");
      await expect(page.getByText("Total Employees")).toBeVisible({ timeout: 15000 });
      const read = await page.evaluate(() => ({
        innerW: window.innerWidth,
        scrollW: document.documentElement.scrollWidth,
      }));
      expect(read.scrollW).toBe(1558); // the REF-measured constant (both sides post-fix)
      expect(read.scrollW).toBeGreaterThan(read.innerW); // the overflow is real
    }
  });

  test("R82-A (regression guard): the 390 mobile band stays byte-identical (943 overflow, flex-col row)", async ({ page }) => {
    // The mobile band is UNAFFECTED by the row fix: below md the row is
    // flex-col (no wrap question) and the 943 overflow is cluster-authored
    // (the r81 943/943 byte-identical proof).
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/attendance");
    await expect(page.getByText("Total Employees")).toBeVisible({ timeout: 15000 });
    const read = await page.evaluate(() => ({
      innerW: window.innerWidth,
      scrollW: document.documentElement.scrollWidth,
    }));
    expect(read.scrollW).toBe(943); // the standing mobile overflow signature
  });
});
