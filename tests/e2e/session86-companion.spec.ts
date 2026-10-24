import { expect, test } from "@playwright/test";

// Session 86 — COMPANION PASS (the second execution of the round-85
// frontier, reconciled onto the published session-86 commit 2d0b604).
// The published round's spec (session86-crossdiff.spec.ts, 9 tests)
// pinned the payrollreports structural family (A1-A4), the payroll
// month default, the settings/training/Edit icons, the Actions TH, and
// the Reports & Export ChartColumn. This companion spec pins the TWO
// defects the published round did not reach — both found by the same
// at-rest cross-side pixel-diff instrument in the second execution —
// plus the payrollreports mobile-geometry guard:
//
//   R86-H  the mobile drawer panel's missing text-sidebar-foreground
//          (the r41 token fix's missing call site): the desktop
//          sidebar's wrapper carries the class; the drawer panel did
//          not, so the theme toggle (the panel's one color-inheriting
//          member) read the body default rgb(10,10,10) instead of the
//          REF's --sidebar-foreground zinc-700 rgb(63,63,70).
//          INSTRUMENT TRAP (retired here): a bare
//          querySelector([aria-label=…]) matches the HIDDEN desktop
//          moon (display:none at 390, earlier in DOM order, carrying
//          the correct inherited token) — the test would pass against
//          the WRONG element. The selector is scoped to the open
//          [role=dialog].
//   R86-E  the recruitment "Post New Job" CTA icon: REF
//          lucide-user-plus (the person+plus glyph — 49 white pixels
//          vs the plain plus's 21 in the icon cell; the text geometry
//          identical). The glyph identity is invisible to the
//          color/text censuses (the r63 lesson class).
//   GUARD  the published A2 fix (mt-6 on the PageHeader's desktop row)
//          must stay MOBILE-INERT: at 390 the payrollreports wrapper
//          keeps the REF's mobile geometry (y89 both sides — the
//          sticky mobile header is the first in-flow child there; no
//          collapse, no offset).

test.describe("session-86 companion pass — the two unfixed defects + the mobile guard", () => {
  test("R86-H: the mobile drawer's theme toggle inherits the sidebar token — zinc-700 rgb(63, 63, 70)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard");
    await page.waitForTimeout(1200);
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    await page.waitForTimeout(600);
    const read = await page.evaluate(() => {
      // scoped INSIDE the open drawer: the desktop sidebar's moon button
      // (same aria-label, display:none at 390) precedes it in DOM order
      // and a bare querySelector would read the hidden element's
      // inherited token — the wrong element
      const btn = document.querySelector('[role="dialog"] button[aria-label="Switch to dark mode"]');
      if (!btn) return { found: false, color: null };
      return { found: true, color: getComputedStyle(btn).color };
    });
    expect(read.found).toBe(true);
    expect(read.color).toBe("rgb(63, 63, 70)");
  });

  test("R86-E: the recruitment Post New Job CTA carries the lucide-user-plus glyph", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/recruitment");
    await page.waitForTimeout(1200);
    const read = await page.evaluate(() => {
      const b = [...document.querySelectorAll("main button")].find((x) => /Post New Job/.test(x.textContent || ""));
      if (!b) return { found: false, cls: null };
      const svg = b.querySelector("svg");
      return { found: true, cls: svg ? svg.getAttribute("class") : null };
    });
    expect(read.found).toBe(true);
    expect(read.cls).toContain("lucide-user-plus");
  });

  test("GUARD: the payrollreports wrapper keeps the REF's mobile geometry at 390 (the A2 fix mobile-inert)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/payrollreports");
    await page.waitForTimeout(1200);
    const read = await page.evaluate(() => {
      const content = [...document.querySelectorAll("main div")].find(
        (d) => d.className && String(d.className).includes("p-4 md:p-8"),
      );
      if (!content) return { found: false, wY: null };
      const wrapper = content.firstElementChild as HTMLElement | null;
      return { found: !!wrapper, wY: wrapper ? Math.round(wrapper.getBoundingClientRect().y) : null };
    });
    expect(read.found).toBe(true);
    // both sides live-read y89 at 390 (the sticky mobile header is the
    // first in-flow child there — no collapse, no offset)
    expect(read.wY).toBe(89);
  });
});
