import { expect, test, type Page } from "@playwright/test";

// Session 60 — the dark-mode fill family (R60-A..F). The r60 census
// (scripts/r60-darkfill-census.mjs, 49 routes, paired live, DARK mode via
// the shared localStorage contract) found: the checkbox's dark pair
// inverted on the clone (bg #171717 + white check vs REF's #fafafa +
// #171717) plus a both-themes 12px glyph (REF authors h-4 w-4), the
// employees default view inverted (REF boots GRID-active — the r58-24
// set-comparison blind spot), the compliance notify buttons' severity
// text tints, the blue-600 text-color split, and the payrollengine's
// gradient-over-emerald P1 bug (a bg+backgroundImage census catches
// what a color-only census cannot). These pins hold the fixes with
// COMPUTED truth, both themes where the finding spans them.

const DARK = "rgb(23, 23, 23)";
const NEUTRAL50 = "rgb(250, 250, 250)";

async function setDark(page: Page, on: boolean) {
  await page.evaluate((v) => {
    localStorage.setItem("darkMode", v ? "true" : "false");
    document.documentElement.classList.toggle("dark", v);
  }, on);
  // the buttons carry transition-colors (150ms) — a color read taken
  // immediately after the class toggle catches the MID-FLIGHT blend
  // (e.g. rgb(60,60,60) between #fafafa and #171717). Settle first.
  await page.waitForTimeout(350);
}

test.describe("session-60 dark-mode fill family (computed truth)", () => {
  test("R60-A: the checkbox renders REF's both-theme pair (light #171717/white + dark #fafafa/#171717) with the 16px glyph", async ({ page }) => {
    await page.goto("/securitysettings");
    // content wait — the settings rows render after the fetch (the r59 lesson)
    const checked = page.locator("main [role=checkbox][aria-checked=true]").first();
    await expect(checked).toBeVisible({ timeout: 15000 });
    // LIGHT: the r58 pair — #171717 fill + the white check. The glyph
    // renders 14x16 (REF-measured: the authored h-4 w-4 class rides the
    // 14px flex content box — the same mechanics on both sides)
    let fill = await checked.evaluate((c) => {
      const cs = getComputedStyle(c);
      const svg = c.querySelector("svg");
      return { bg: cs.backgroundColor, c: cs.color, svgW: svg ? Math.round(svg.getBoundingClientRect().width) : 0, svgCls: svg ? svg.getAttribute("class") : null };
    });
    expect(fill).toEqual({ bg: DARK, c: NEUTRAL50, svgW: 14, svgCls: "lucide lucide-check h-4 w-4" });

    // DARK: REF's measured pair — #fafafa fill + the #171717 check
    await setDark(page, true);
    await expect(checked).toBeVisible();
    fill = await checked.evaluate((c) => {
      const cs = getComputedStyle(c);
      const svg = c.querySelector("svg");
      return { bg: cs.backgroundColor, c: cs.color, svgW: svg ? Math.round(svg.getBoundingClientRect().width) : 0, svgCls: svg ? svg.getAttribute("class") : null };
    });
    expect(fill.bg).toBe(NEUTRAL50);
    expect(fill.c).toBe(DARK);
    expect(fill.svgW).toBe(14);
    await setDark(page, false);
  });

  test("R60-B: the employees page boots GRID-active — the toggle pair in both themes", async ({ page }) => {
    const readPair = () =>
      page.evaluate(() => {
        const btns = [...document.querySelectorAll("main button")].filter((b) => {
          const s = (b.querySelector("svg") || {}).className?.baseVal || "";
          return s.includes("grid3x3") || s.includes("lucide-list");
        });
        return btns.map((b) => {
          const cs = getComputedStyle(b);
          const r = b.getBoundingClientRect();
          return {
            svg: (b.querySelector("svg") as SVGElement).className.baseVal.includes("grid3x3") ? "GRID" : "LIST",
            bg: cs.backgroundColor,
            h: Math.round(r.height),
            w: Math.round(r.width),
          };
        });
      });
    await page.goto("/employees");
    await expect(page.getByRole("button", { name: "Add Employee" })).toBeVisible();
    // LIGHT: REF's fresh default — GRID primary-filled (40px), LIST
    // outline (42px); the same two fills the r58 pin saw, on REF's
    // buttons (the set-comparison blind spot closed)
    let pair = await readPair();
    expect(pair).toEqual([
      { svg: "LIST", bg: "rgb(255, 255, 255)", h: 32, w: 42 },
      { svg: "GRID", bg: DARK, h: 32, w: 40 },
    ]);

    // DARK: REF's resolution — the outline flips to #0a0a0a, the
    // dark-variant to #fafafa (the buttons keep their roles)
    await setDark(page, true);
    await expect(page.getByRole("button", { name: "Add Employee" })).toBeVisible();
    pair = await readPair();
    expect(pair).toEqual([
      { svg: "LIST", bg: "rgb(10, 10, 10)", h: 32, w: 42 },
      { svg: "GRID", bg: NEUTRAL50, h: 32, w: 40 },
    ]);
    await setDark(page, false);

    // the grid content renders (the seeded employee as a card — the
    // with-data superset surface REF cannot show at its zero state).
    // .first(): concurrent specs (the import round-trip) may leave extra
    // rows in the shared e2e db — any one card proves the grid renders.
    await expect(page.locator("main [class*=grid-cols-3] [class*=rounded-xl]").first()).toBeVisible();
  });

  test("R60-D: the compliance notify buttons carry the severity text tints (both themes)", async ({ page }) => {
    await page.goto("/compliancedashboard");
    // content wait — the notify buttons render after the document fetch
    await expect(page.getByRole("button", { name: /Notify All ≤ 7 days/ })).toBeVisible({ timeout: 15000 });
    const readColors = () =>
      page.evaluate(() => {
        const read = (t: string) => {
          const b = [...document.querySelectorAll("main button")].find((x) => (x.textContent || "").includes(t));
          return b ? getComputedStyle(b).color : null;
        };
        return { d7: read("7 days"), d15: read("15 days"), d30: read("30 days") };
      });
    // LIGHT: the tinted text on the outline base
    let colors = await readColors();
    expect(colors).toEqual({
      d7: "rgb(220, 38, 38)",
      d15: "rgb(234, 88, 12)",
      d30: "rgb(202, 138, 4)",
    });
    // DARK: the tints do NOT flip (only the outline bg does)
    await setDark(page, true);
    colors = await readColors();
    expect(colors).toEqual({
      d7: "rgb(220, 38, 38)",
      d15: "rgb(234, 88, 12)",
      d30: "rgb(202, 138, 4)",
    });
    await setDark(page, false);
  });

  test("R60-E: the blue-600 text split — the text-white sites + the chat token (both themes)", async ({ page }) => {
    // workflowconfigpage: REF's literal text-white (255,255,255 in BOTH themes)
    await page.goto("/workflowconfigpage");
    const nw = page.getByRole("button", { name: "New Workflow" });
    await expect(nw).toBeVisible();
    let c = await nw.evaluate((b) => getComputedStyle(b).color);
    expect(c).toBe("rgb(255, 255, 255)");
    await setDark(page, true);
    c = await nw.evaluate((b) => getComputedStyle(b).color);
    expect(c).toBe("rgb(255, 255, 255)");
    await setDark(page, false);

    // notificationpreferences: the same literal
    await page.goto("/notificationpreferences");
    await expect(page.locator("main [role=switch]").first()).toBeVisible({ timeout: 15000 });
    const sp = page.getByRole("button", { name: "Save Preferences" });
    c = await sp.evaluate((b) => getComputedStyle(b).color);
    expect(c).toBe("rgb(255, 255, 255)");

    // chat: the new-chat button rides the flipping token
    // (light #fafafa / dark #171717)
    await page.goto("/chat");
    const newChat = page.locator('button[aria-label="New conversation"]');
    await expect(newChat).toBeVisible();
    c = await newChat.evaluate((b) => getComputedStyle(b).color);
    expect(c).toBe(NEUTRAL50);
    await setDark(page, true);
    c = await newChat.evaluate((b) => getComputedStyle(b).color);
    expect(c).toBe(DARK);
    await setDark(page, false);
  });

  test("R60-F: the payrollengine Generate Payroll is the FLAT emerald solid (no backgroundImage, both themes)", async ({ page }) => {
    await page.goto("/payrollengine");
    const gen = page.getByRole("button", { name: "Generate Payroll" });
    await expect(gen).toBeVisible();
    const readFill = () =>
      gen.evaluate((b) => {
        const cs = getComputedStyle(b);
        return { bg: cs.backgroundColor, bgi: cs.backgroundImage, c: cs.color };
      });
    // LIGHT: the flat emerald + the primary-foreground text
    let fill = await readFill();
    expect(fill).toEqual({ bg: "rgb(5, 150, 105)", bgi: "none", c: NEUTRAL50 });
    // DARK: the text flips, the fill stays
    await setDark(page, true);
    fill = await readFill();
    expect(fill).toEqual({ bg: "rgb(5, 150, 105)", bgi: "none", c: DARK });
    await setDark(page, false);
  });

  test("R60-C: the settings Company edit — REF's inline 12-field form flip with the working PATCH round-trip", async ({ page }) => {
    await page.goto("/settings");
    const edit = page.getByRole("button", { name: "Edit", exact: true });
    await expect(edit).toBeVisible({ timeout: 15000 });

    // press: the card flips INLINE (no dialog) — Save Changes replaces
    // the Edit button in the header; the 12 fields render with REF's
    // placeholders; Cancel sits at the form's bottom-right
    await edit.click();
    await expect(page.getByRole("button", { name: "Save Changes" })).toBeVisible();
    await expect(page.locator('[role=dialog]')).toHaveCount(0);
    for (const ph of [
      "Company name",
      "https://example.com/logo.png",
      "Technology, Healthcare, etc.",
      "Street address",
      "City",
      "Country",
      "Company phone",
      "contact@company.com",
      "https://www.company.com",
      "Tax identification number",
      "Company registration number",
    ]) {
      await expect(page.locator(`main input[placeholder="${ph}"]`)).toBeVisible();
    }
    // the 12-label set (the select carries "Select size")
    const labels = await page.locator("main label").allTextContents();
    for (const l of ["Company Name", "Logo URL", "Industry", "Company Size", "Address", "City", "Country", "Phone", "Email", "Website", "Tax ID", "Registration Number"]) {
      expect(labels).toContain(l);
    }

    // the superset round-trip: edit the city + save → the PATCH lands,
    // the toast renders, the card flips back to the read-only tiles
    const city = page.locator('main input[placeholder="City"]');
    await city.fill("Singapore");
    const name = page.locator('main input[placeholder="Company name"]');
    await name.fill("Demo");
    await page.getByRole("button", { name: "Save Changes" }).click();
    await expect(page.getByText("Company updated")).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: "Edit", exact: true })).toBeVisible();
    await expect(page.getByText("Singapore").first()).toBeVisible();

    // Cancel restores the tiles without a round-trip
    await page.getByRole("button", { name: "Edit", exact: true }).click();
    await expect(page.getByRole("button", { name: "Save Changes" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("button", { name: "Edit", exact: true })).toBeVisible();
  });
});
