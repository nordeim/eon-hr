import { expect, test } from "@playwright/test";

/**
 * Session 29 (R28-B): the print-media superset — E2E verification.
 *
 * Session-18's census (re-confirmed rounds 22 and 27): ZERO @media print
 * rules on either side — both apps hand printing to the browser defaults.
 * The clone supersedes with a scoped unlayered print block in globals.css:
 * the shell chrome (sidebar / mobile topbar / bottom tabs / Radix portals)
 * hides, the tab-bar padding reserve and min-h-screen root reset, and
 * cards + table rows do not split across page boundaries.
 *
 * agent-browser's `set media` supports only dark|light|reduced-motion —
 * print emulation lives HERE (page.emulateMedia), which is why this is a
 * permanent spec rather than a CLI probe: it pins the cascade contract
 * (unlayered !important beats the v4 utilities layer) against regressions.
 */
test.describe("print media superset (session 29)", () => {
  test("shell chrome hides under print emulation and restores on screen", async ({ page }) => {
    // --- Desktop viewport + print media --------------------------------
    await page.emulateMedia({ media: "print" });
    await page.goto("/employees");

    // The desktop sidebar: `hidden md:flex` computes flex at this width —
    // the print block must force none (the cascade proof).
    const aside = page.locator("aside").first();
    await expect(aside).toHaveCSS("display", "none");

    // The sidebar's inner nav (block by default at desktop) must hide.
    await expect(page.locator("nav").first()).toHaveCSS("display", "none");

    // The root drops min-h-screen (100vh would compute to the viewport
    // height; the print reset forces 0). NOTE: the FIRST body>div is
    // Next.js's hidden bootstrap div — the app root is the min-h-screen
    // flex div (a body>div sibling, also covered by the print rule).
    const root = page.locator("body > div.min-h-screen").first();
    await expect(root).toHaveCSS("min-height", "0px");

    // Cards do not split across page boundaries (auto without the block).
    const card = page.locator(".rounded-xl").first();
    await expect(card).toHaveCSS("break-inside", "avoid");

    // Session 30 (R29-C): the print color fidelity — the browser default
    // (economy) strips backgrounds from print output, blanking every
    // status badge and table tint; the block forces exact on everything.
    await expect(card).toHaveCSS("print-color-adjust", "exact");
    await expect(card).toHaveCSS("-webkit-print-color-adjust", "exact");

    // --- Mobile viewport + print media ---------------------------------
    // At 390px the mobile topbar (<header>, md:hidden does NOT apply) and
    // the pb-20 tab-bar reserve are live — the print block must override
    // both.
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator("header").first()).toHaveCSS("display", "none");
    await expect(page.locator("main").first()).toHaveCSS("padding-bottom", "0px");

    // --- Screen media restores everything -------------------------------
    await page.emulateMedia({ media: "screen" });
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(aside).toHaveCSS("display", "flex");
    await expect(root).toHaveCSS("min-height", "720px");
  });
});
