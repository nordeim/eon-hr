import { expect, test, type Page } from "@playwright/test";

// Session 61 — the dark-mode text-color family (R61-A..W). The r61
// census (scripts/r61-textcolor-census.mjs, 49 routes, paired live,
// DARK mode) read the computed `color` of every text-bearing
// NON-button element + ::placeholder colors — the recorded r59/r60
// blind spot extended past buttons. Nineteen findings, decomposed
// element-level by seven probes. These pins hold the fixes with
// COMPUTED truth, both themes where the finding spans them:
// the four palette pins rendering rgb() (not oklch lab()), the
// compliance severity chips (both themes), the evaluations tile
// colors + the mt-6 gap, the authored-slate-400 search icons (both
// themes), the chat h2 + No-chats line (dark), the recommendations
// Shield glyphs, the payroll DollarSign empty icon, the payrollai
// CardHeader contract, the interviewassistant at-rest copy, the
// hrassistant empty pane, the chart legend presence/absence + colors,
// and the at-risk empty-state icon.

const SLATE400 = "rgb(148, 163, 184)";
const SLATE500 = "rgb(100, 116, 139)";

async function setDark(page: Page, on: boolean) {
  await page.evaluate((v) => {
    localStorage.setItem("darkMode", v ? "true" : "false");
    document.documentElement.classList.toggle("dark", v);
  }, on);
  // the transition-colors settle (the r60 lesson: mid-flight reads
  // catch the blend)
  await page.waitForTimeout(350);
}

test.describe("session-61 dark-mode text-color family (computed truth)", () => {
  test("R61-A: the four pinned shades render their v3 sRGB values (not the oklch lab() drift)", async ({ page }) => {
    await page.goto("/securitysettings");
    const h3 = page.locator("main h3", { hasText: "Security Configuration" });
    await expect(h3).toBeVisible({ timeout: 15000 });
    const read = () =>
      h3.evaluate((el) => ({ c: getComputedStyle(el).color }));
    // orange-900 = #7c2d12 (REF-measured; the unpinned form drifted
    // lab(30.2951 36.0434 37.671))
    expect((await read()).c).toBe("rgb(124, 45, 18)");
    const p = h3.locator("xpath=following-sibling::p[1]");
    await expect(p).toBeVisible();
    // orange-700 = #c2410c
    expect(await p.evaluate((el) => getComputedStyle(el).color)).toBe("rgb(194, 65, 12)");

    // hrreports: the stat value orange-500 = #f97316
    await page.goto("/hrreports");
    const stat = page.locator("main p.text-3xl", { hasText: /^0$/ }).nth(1);
    await expect(stat).toBeVisible({ timeout: 15000 });
    expect(await stat.evaluate((el) => getComputedStyle(el).color)).toBe("rgb(249, 115, 22)");

    // workflowautomation: the zap icon purple-500 = #a855f7
    await page.goto("/workflowautomation");
    const zap = page.locator('main svg.lucide-zap[class*="w-10"]').first();
    await expect(zap).toBeVisible({ timeout: 15000 });
    expect(await zap.evaluate((el) => getComputedStyle(el).color)).toBe("rgb(168, 85, 247)");
  });

  test("R61-B: the search icons render authored slate-400 in BOTH themes", async ({ page }) => {
    await page.goto("/payroll");
    const search = page.locator('main input[placeholder="Search employee..."]');
    await expect(search).toBeVisible({ timeout: 15000 });
    const icon = page.locator("main svg.lucide-search").first();
    // LIGHT: slate-400 (NOT muted-foreground #64748B)
    expect(await icon.evaluate((el) => getComputedStyle(el).color)).toBe(SLATE400);
    // DARK: unflipping — still slate-400 (the muted token would flip to
    // #a3a3a3)
    await setDark(page, true);
    expect(await icon.evaluate((el) => getComputedStyle(el).color)).toBe(SLATE400);
    await setDark(page, false);

    // the documenttracker + recruitmentkanban + recruitment sites ride
    // the same authored shade
    for (const route of ["/documenttracker", "/recruitmentkanban"]) {
      await page.goto(route);
      await page.waitForTimeout(1200);
      const ic = page.locator("main svg.lucide-search").first();
      await expect(ic).toHaveCount(1);
      expect(await ic.evaluate((el) => getComputedStyle(el).color)).toBe(SLATE400);
    }
    await page.goto("/recruitment");
    await page.waitForTimeout(1500);
    // lucide-react's Filter is the funnel glyph — the DOM class is
    // lucide-funnel (the r58 CircleCheckBig library-version family)
    const filter = page.locator('main svg[class*="funnel"], main svg[class*="lucide-filter"]').first();
    await expect(filter).toHaveCount(1);
    expect(await filter.evaluate((el) => getComputedStyle(el).color)).toBe(SLATE400);
  });

  test("R61-C: the compliance severity chips — per-severity borders + colored DIV values + xs labels (both themes)", async ({ page }) => {
    await page.goto("/compliancedashboard");
    await expect(page.getByText("At-Risk Employees")).toBeVisible({ timeout: 15000 });
    const readChips = () =>
      page.evaluate(() => {
        const cards = [...document.querySelectorAll("main div")].filter((d) =>
          /^border-(red|orange|yellow|blue)-200$/.test(
            (d.getAttribute("class") || "").split(" ").find((c) => c.startsWith("border-") && c.includes("-200")) || ""
          )
        );
        return cards.map((c) => {
          const cs = getComputedStyle(c);
          const value = c.querySelector("div.text-3xl");
          const label = c.querySelector("div.text-xs");
          return {
            border: cs.borderColor,
            valueC: value ? getComputedStyle(value).color : null,
            valueTag: value ? value.tagName.toLowerCase() : null,
            labelC: label ? getComputedStyle(label).color : null,
            labelFs: label ? getComputedStyle(label).fontSize : null,
            labelTag: label ? label.tagName.toLowerCase() : null,
          };
        });
      });
    // LIGHT: REF's measured recipe (both themes — the values/borders do
    // NOT flip; only the card bg does)
    let chips = await readChips();
    expect(chips.length).toBe(4);
    expect(chips[0]).toEqual({ border: "rgb(254, 202, 202)", valueC: "rgb(185, 28, 28)", valueTag: "div", labelC: SLATE500, labelFs: "12px", labelTag: "div" });
    expect(chips[1]).toEqual({ border: "rgb(254, 215, 170)", valueC: "rgb(194, 65, 12)", valueTag: "div", labelC: SLATE500, labelFs: "12px", labelTag: "div" });
    expect(chips[2]).toEqual({ border: "rgb(254, 240, 138)", valueC: "rgb(161, 98, 7)", valueTag: "div", labelC: SLATE500, labelFs: "12px", labelTag: "div" });
    expect(chips[3]).toEqual({ border: "rgb(191, 219, 254)", valueC: "rgb(29, 78, 216)", valueTag: "div", labelC: SLATE500, labelFs: "12px", labelTag: "div" });
    // DARK: the borders + values stay (authored, unflipping)
    await setDark(page, true);
    chips = await readChips();
    expect(chips.length).toBe(4);
    expect(chips[0].border).toBe("rgb(254, 202, 202)");
    expect(chips[0].valueC).toBe("rgb(185, 28, 28)");
    expect(chips[2].valueC).toBe("rgb(161, 98, 7)");
    await setDark(page, false);
  });

  test("R61-D: the compliance at-risk empty state — the 48px green-400 CircleCheckBig", async ({ page }) => {
    await page.goto("/compliancedashboard");
    const icon = page.locator('main svg.lucide-circle-check-big[class*="w-12"]').first();
    await expect(icon).toBeVisible({ timeout: 15000 });
    const read = () =>
      icon.evaluate((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return { c: cs.color, w: Math.round(r.width), cls: el.getAttribute("class") };
      });
    const { c, w, cls } = await read();
    expect(c).toBe("rgb(74, 222, 128)"); // green-400
    expect(w).toBe(48);
    expect(cls).toContain("w-12 h-12 mx-auto mb-3 text-green-400");
    // the alerts title-row icon is the TriangleAlert (orange-500, pinned)
    // the h-4 one — the first TriangleAlert in DOM is the High Priority
    // stat icon (orange-600, w-5); the at-risk title-row icon is h-4
    const rowIcon = page.locator('main svg.lucide-triangle-alert[class*="h-4"]').first();
    await expect(rowIcon).toBeVisible();
    expect(await rowIcon.evaluate((el) => getComputedStyle(el).color)).toBe("rgb(249, 115, 22)");
  });

  test("R61-E/F: the evaluations tiles carry per-tile colors + the 24px tab→stats gap", async ({ page }) => {
    await page.goto("/evaluations");
    const tiles = page.locator("main [role=tabpanel] div.bg-slate-100 span");
    await expect(tiles.first()).toBeVisible({ timeout: 15000 });
    const colors = await tiles.evaluateAll((els) => els.map((el) => getComputedStyle(el).color));
    expect(colors).toEqual(["rgb(51, 65, 85)", "rgb(21, 128, 61)", "rgb(194, 65, 12)", "rgb(100, 116, 139)"]);
    // the tab→stats gap: 24px (the restored mt-6; the clone sat at 8px)
    const gap = await page.evaluate(() => {
      const tl = document.querySelector('[role=tablist]')!;
      const card = document.querySelector('[role=tabpanel] > div')!;
      return Math.round(card.getBoundingClientRect().top - tl.getBoundingClientRect().bottom);
    });
    expect(gap).toBe(24);
  });

  test("R61-G: the securitysettings recommendations render the 20px blue Shield glyphs", async ({ page }) => {
    await page.goto("/securitysettings");
    const recs = page.locator('main svg.lucide-shield[class*="flex-shrink-0"]');
    await expect(recs.first()).toBeVisible({ timeout: 15000 });
    const read = await recs.evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { c: getComputedStyle(el).color, w: Math.round(r.width), cls: el.getAttribute("class") };
      })
    );
    expect(read.length).toBeGreaterThanOrEqual(5);
    for (const r of read) {
      expect(r.c).toBe("rgb(37, 99, 235)"); // blue-600
      expect(r.w).toBe(20);
      expect(r.cls).toContain("w-5 h-5 text-blue-600 flex-shrink-0");
    }
  });

  test("R61-H/N: the chat Messages h2 + the hrassistantchat No-chats line — unflipping in dark", async ({ page }) => {
    await page.goto("/chat");
    const h2 = page.locator("main h2", { hasText: "Messages" });
    await expect(h2).toBeVisible({ timeout: 15000 });
    await setDark(page, true);
    // REF authors slate-900 — it does NOT flip to #fafafa in dark
    expect(await h2.evaluate((el) => getComputedStyle(el).color)).toBe("rgb(15, 23, 42)");

    await page.goto("/hrassistantchat");
    const line = page.locator("main p", { hasText: "No chats" });
    await expect(line).toBeVisible({ timeout: 15000 });
    const read = await line.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { c: cs.color, cls: el.getAttribute("class") };
    });
    expect(read.c).toBe(SLATE500); // slate-500 in dark (unflipping)
    expect(read.cls).toBe("text-sm text-slate-500 p-4 text-center");
    await setDark(page, false);
  });

  test("R61-I: the chat search icon centers on the input (the bare wrapper)", async ({ page }) => {
    await page.goto("/chat");
    const input = page.locator('main input[placeholder="Search conversations..."]');
    await expect(input).toBeVisible({ timeout: 15000 });
    const read = await page.evaluate(() => {
      const inp = document.querySelector('main input[placeholder="Search conversations..."]')!;
      const wrap = inp.parentElement!;
      const sv = wrap.querySelector("svg")!;
      const ir = inp.getBoundingClientRect();
      const wr = wrap.getBoundingClientRect();
      const sr = sv.getBoundingClientRect();
      return {
        wrapCls: wrap.getAttribute("class"),
        wrapH: Math.round(wr.height),
        iconCenterY: Math.round(sr.y + sr.height / 2),
        inputCenterY: Math.round(ir.y + ir.height / 2),
        iconX: Math.round(sr.x),
      };
    });
    expect(read.wrapCls).toBe("relative");
    expect(read.wrapH).toBe(36);
    expect(read.iconCenterY).toBe(read.inputCenterY);
    expect(read.iconX).toBe(317);
  });

  test("R61-J: the payroll empty state renders the DollarSign icon (not the default Inbox)", async ({ page }) => {
    await page.goto("/payroll");
    // content wait FIRST (the r59 lesson): .last() can resolve against the
    // header/stat icons while the records fetch is still in flight — the
    // empty state's h3 pins the moment the DollarSign exists
    await expect(page.locator("main h3", { hasText: "No payroll records" })).toBeVisible({ timeout: 15000 });
    const icon = page.locator("main svg.lucide-dollar-sign").last(); // the 64px empty-state icon (the header + the first stat precede it)
    await expect(icon).toBeVisible();
    const read = await icon.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return { c: cs.color, w: Math.round(r.width) };
    });
    expect(read.c).toBe("rgb(203, 213, 225)"); // slate-300
    expect(read.w).toBe(64);
  });

  test("R61-K: the payrollai suggestions card — the CardHeader + the p-6/py-12 stack", async ({ page }) => {
    await page.goto("/payrollai");
    const title = page.locator("main div", { hasText: "AI Suggestions" }).first();
    await expect(title).toBeVisible({ timeout: 15000 });
    const read = await page.evaluate(() => {
      const t = [...document.querySelectorAll("main div")].find((d) => (d.textContent || "").trim() === "AI Suggestions" && (d.getAttribute("class") || "").includes("font-semibold"))!;
      const header = t.parentElement!;
      const content = [...header.parentElement!.children].find((c) => c !== header)!;
      const inner = content.firstElementChild!;
      return {
        headerCls: header.getAttribute("class"),
        contentCls: content.getAttribute("class"),
        innerCls: inner.getAttribute("class"),
        h3X: Math.round(inner.querySelector("h3")!.getBoundingClientRect().x),
      };
    });
    expect(read.headerCls).toContain("p-6 border-b border-slate-200");
    expect(read.contentCls).toBe("p-6");
    expect(read.innerCls).toBe("text-center py-12");
    expect(read.h3X).toBe(313);
  });

  test("R61-L: the interviewassistant at-rest contract — the standard placeholder, no invented hint", async ({ page }) => {
    await page.goto("/interviewassistant");
    const trigger = page.locator("main button[role=combobox]");
    await expect(trigger).toBeVisible({ timeout: 15000 });
    await expect(trigger).toHaveText(/Select candidate/);
    // the hint copy is gone
    await expect(page.getByText("Add candidates in Recruitment first")).toHaveCount(0);
  });

  test("R61-M: the hrassistant zero-message pane renders NOTHING (no sparkles)", async ({ page }) => {
    await page.goto("/hrassistant");
    const input = page.locator("main textarea");
    await expect(input).toBeVisible({ timeout: 15000 });
    // settle the boot, then read the pane's svgs — only the bot kicker +
    // the send icon remain; NO slate-300 sparkles
    await page.waitForTimeout(800);
    const svgs = await page.evaluate(() =>
      [...document.querySelectorAll("main svg")]
        .filter((s) => !s.closest("button"))
        .map((s) => ({ cls: s.getAttribute("class") || "", c: getComputedStyle(s).color }))
    );
    const sparkles = svgs.filter((s) => s.cls.includes("sparkles") || s.cls.includes("slate-300"));
    expect(sparkles).toEqual([]);
  });

  test("R61-O: the profile kicker subtitle renders slate-400", async ({ page }) => {
    // the kicker renders hidden at desktop (md:hidden) — the class is
    // still readable (the census's hidden-element lesson)
    await page.goto("/profile");
    await expect(page.locator("main h2", { hasText: "sepnetflix2023" })).toBeVisible({ timeout: 15000 });
    const c = await page.evaluate(() => {
      const p = [...document.querySelectorAll("main p")].find((el) => (el.textContent || "").trim() === "Manage your account");
      return p ? getComputedStyle(p).color : null;
    });
    expect(c).toBe(SLATE400);
  });

  test("R61-P: the surveyanalytics legend — Responses blue-500 + the Avg Sentiment % name", async ({ page }) => {
    await page.goto("/surveyanalytics");
    const legend = page.locator("main .recharts-legend-item-text");
    await expect(legend.first()).toBeVisible({ timeout: 15000 });
    const items = await legend.evaluateAll((els) =>
      els.map((el) => ({ t: (el.textContent || "").trim(), c: getComputedStyle(el).color, x: Math.round(el.getBoundingClientRect().x) }))
    );
    expect(items.length).toBe(2);
    // DOM order: Responses first, then Avg Sentiment % (by x)
    const byX = [...items].sort((a, b) => a.x - b.x);
    expect(byX[0].t).toBe("Responses");
    expect(byX[0].c).toBe("rgb(59, 130, 246)"); // blue-500
    expect(byX[1].t).toBe("Avg Sentiment %");
    expect(byX[1].c).toBe("rgb(16, 185, 129)"); // emerald-500
  });

  test("R61-Q/R: the analytics + advancedanalytics charts render NO legend", async ({ page }) => {
    await page.goto("/analytics");
    await page.waitForTimeout(1500);
    expect(await page.locator("main .recharts-legend-item-text").count()).toBe(0);
    await page.goto("/advancedanalytics");
    await page.waitForTimeout(1500);
    expect(await page.locator("main .recharts-legend-item-text").count()).toBe(0);
  });

  test("R61-S/T/U: the header + stat icon shapes", async ({ page }) => {
    await page.goto("/workflowautomation");
    await page.waitForTimeout(1000);
    expect(await page.locator("main svg.lucide-zap").count()).toBeGreaterThanOrEqual(2); // the header icon + the stat tile
    await page.goto("/compliancedashboard");
    await page.waitForTimeout(1000);
    // the header icon is Shield — and NO ShieldCheck anywhere
    expect(await page.locator("main svg.lucide-shield").count()).toBeGreaterThanOrEqual(1);
    expect(await page.locator("main svg.lucide-shield-check").count()).toBe(0);
    await page.goto("/performancemanagement");
    await page.waitForTimeout(1000);
    expect(await page.locator("main svg.lucide-circle-check-big").count()).toBeGreaterThanOrEqual(1);
    expect(await page.locator("main svg.lucide-circle-alert").count()).toBeGreaterThanOrEqual(1);
    expect(await page.locator("main svg.lucide-award").count()).toBeGreaterThanOrEqual(1);
  });
  test("R61-X: the requestreports header row — slate-500, unflipping in dark", async ({ page }) => {
    await page.goto("/requestreports");
    const th = page.locator("main th").first();
    await expect(th).toBeVisible({ timeout: 15000 });
    expect(await th.evaluate((el) => getComputedStyle(el).color)).toBe(SLATE500);
    await setDark(page, true);
    // REF authors slate-500 on the tr — it does NOT flip to #fafafa
    expect(await th.evaluate((el) => getComputedStyle(el).color)).toBe(SLATE500);
    await setDark(page, false);
  });
});
