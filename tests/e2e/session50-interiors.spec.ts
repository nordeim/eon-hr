import { expect, test } from "@playwright/test";

/**
 * Session 50 (parity round 49) — the never-deep-measured interiors.
 *
 * The round's census (scripts/r50-eval.txt via probe-r50-deep.mjs +
 * r50-boot-loc0.mjs, live REF @1440×900 vs the zero-tenant :3201
 * clone): the never-measured routes hid a whole glyph family (wand →
 * calculator, cog → calculator, sparkles → brain, check-check →
 * check, clipboard-list → briefcase, calendar-days →
 * arrow-left-right), shiftswap's stat cards carry an inline icon
 * family REF renders, staffrequests' toggle is the RADIX TABS form
 * with the zero state DIRECT in the panel, and a handful of card/
 * title/class contracts (payrollengine's shadow-sm, requestsettings'
 * space-y-4 interiors, hrletters' plain CardTitle). Every assertion
 * below is the live-measured contract (docs/remediation-plan-
 * session50.md).
 */
test.describe("session-50 deep interiors", () => {
  /* Session 50 (R49-B1) → Session 88 (R88-F, the lockstep amendment — the
   * stale-measurement retirement, the R50-A7 precedent): the r88 live
   * re-measure proved the REF's stat cards carry 40px ICON TILES
   * (w-10 h-10 rounded-xl + the blue/yellow/orange/green-100 family)
   * wrapping the 20px icons — the r49 probe measured the icons INLINE
   * and missed the tiles. The pin now asserts the tile contract. */
  test("R50-B1: shiftswap's stat cards carry the 40px icon tiles + P/P pairs on the PLAIN card", async ({ page }) => {
    await page.goto("/shiftswap");
    await expect(page.getByRole("heading", { name: "Shift Swap" })).toBeVisible();
    const stats = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("[class*=rounded-xl]")].filter(
        (e) => /border/.test(e.className) && e.querySelector("p")
      );
      return cards.slice(0, 4).map((c) => ({
        cardCls: c.className.replace(/\s+/g, " ").trim(),
        tileCls: c.querySelector("div[class*=w-10]")?.getAttribute("class") ?? null,
        svgCls: c.querySelector("svg")?.getAttribute("class") ?? null,
        valCls: c.querySelectorAll("p")[0]?.className ?? null,
        labelCls: c.querySelectorAll("p")[1]?.className ?? null,
      }));
    });
    expect(stats).toHaveLength(4);
    const wantTiles = [
      "w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100",
      "w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-100",
      "w-10 h-10 rounded-xl flex items-center justify-center bg-orange-100",
      "w-10 h-10 rounded-xl flex items-center justify-center bg-green-100",
    ];
    const want = [
      "lucide lucide-users w-5 h-5 text-blue-600",
      "lucide lucide-clock w-5 h-5 text-yellow-600",
      "lucide lucide-calendar w-5 h-5 text-orange-600",
      "lucide lucide-circle-check-big w-5 h-5 text-green-600",
    ];
    for (let i = 0; i < 4; i++) {
      expect(stats[i].cardCls).not.toContain("border-slate-200");
      expect(stats[i].cardCls).not.toContain("shadow-sm");
      expect(stats[i].tileCls).toBe(wantTiles[i]);
      expect(stats[i].svgCls).toBe(want[i]);
      expect(stats[i].valCls.replace(/\s+/g, " ")).toContain("text-2xl font-bold text-slate-900");
      expect(stats[i].labelCls).toContain("text-xs text-slate-500");
    }
  });

  test("R50-A8+B2+B3: shiftswap's badge glyph, the py-2 pills, and the p-12 empty card with the arrow-left-right glyph", async ({ page }) => {
    await page.goto("/shiftswap");
    await expect(page.getByRole("heading", { name: "Shift Swap" })).toBeVisible();
    await expect(page.getByText("No swap requests in this category")).toBeVisible();
    const info = await page.evaluate(() => {
      const norm = (c: string | null) => (c || "").replace(/\s+/g, " ").trim();
      const badgeSpan = [...document.querySelectorAll("span")].find((s) => s.textContent?.trim() === "Shift Management");
      const badge = badgeSpan?.closest("[class*=rounded-full]");
      const pills = [...document.querySelectorAll("button")].filter((b) => /My Requests$|Peer Approval/.test(b.textContent || ""));
      const emptyCard = [...document.querySelectorAll("[class*=rounded-xl]")].find(
        (e) => e.textContent?.includes("No swap requests in this category")
      );
      return {
        badgeSvg: badge?.querySelector("svg")?.getAttribute("class") ?? null,
        pillCls: pills.map((b) => norm(b.getAttribute("class"))),
        emptyCls: emptyCard ? norm(emptyCard.className) : null,
        emptyKid: emptyCard ? norm(emptyCard.children[0]?.className) : null,
        emptySvg: emptyCard?.querySelector("svg")?.getAttribute("class") ?? null,
        emptyP: emptyCard?.querySelector("p")?.className ?? null,
      };
    });
    expect(info.badgeSvg).toContain("lucide-arrow-left-right");
    expect(info.pillCls[0]).toContain("px-4 py-2 text-sm font-medium rounded-lg transition-colors");
    expect(info.pillCls[0]).not.toContain("h-9");
    expect(info.pillCls[1]).toContain("hover:bg-slate-50");
    expect(info.emptyCls).not.toContain("border-slate-200");
    expect(info.emptyKid).toContain("p-12 text-center");
    expect(info.emptySvg).toBe("lucide lucide-arrow-left-right w-12 h-12 mx-auto mb-3 text-slate-300");
    expect(info.emptyP?.replace(/\s+/g, " ")).toBe("text-slate-500");
  });

  test("R50-B4: staffrequests' toggle is the RADIX TABS form — tablist + single tab + the mt-2 panel with the zero state DIRECT", async ({ page }) => {
    await page.goto("/staffrequests");
    await expect(page.getByRole("heading", { name: "Staff Requests" })).toBeVisible();
    await expect(page.getByRole("tab", { name: /My Requests/ })).toBeVisible();
    await expect(page.getByText("No requests found")).toBeVisible();
    const info = await page.evaluate(() => {
      const norm = (c: string | null) => (c || "").replace(/\s+/g, " ").trim();
      const tablist = document.querySelector('[role=tablist]');
      const tab = document.querySelector('[role=tab]');
      const panel = document.querySelector('[role=tabpanel]');
      return {
        tablistCls: tablist ? norm(tablist.getAttribute("class")) : null,
        tabText: tab ? (tab.textContent || "").trim() : null,
        tabState: tab?.getAttribute("data-state") ?? null,
        panelCls: panel ? norm(panel.getAttribute("class")) : null,
        zeroSvg: panel?.querySelector("svg[class*=file-text]")?.getAttribute("class") ?? null,
        zeroP: panel?.querySelector("p")?.className ?? null,
        ctaCls: [...(panel?.querySelectorAll("button") ?? [])].find((b) => /first request/.test(b.textContent || ""))?.className ?? null,
        cardInPanel: panel ? [...panel.querySelectorAll("[class*=rounded-xl]")].map((c) => norm(c.className)) : null,
      };
    });
    expect(info.tablistCls).toContain("inline-flex h-9 items-center justify-center rounded-lg");
    expect(info.tabText).toBe("My Requests (0)");
    expect(info.tabState).toBe("active");
    expect(info.panelCls).toContain("mt-2");
    expect(info.zeroSvg).toBe("lucide lucide-file-text w-12 h-12 mx-auto mb-3 text-slate-300");
    expect(info.zeroP).toBe("text-slate-500");
    expect(info.ctaCls?.replace(/\s+/g, " ")).toContain("mt-4");
    expect(info.cardInPanel).toEqual([]); // the zero state rides the panel DIRECT — no Card
  });

  test("R50-A1+B5: payrollmodule — the calculator glyph, the slate-400 search icon, and the bare th family", async ({ page }) => {
    await page.goto("/payrollmodule");
    await expect(page.getByRole("heading", { name: "Payroll Module" })).toBeVisible();
    await expect(page.getByText(/No payslips for October/)).toBeVisible();
    const info = await page.evaluate(() => {
      const norm = (c: string | null) => (c || "").replace(/\s+/g, " ").trim();
      const genBtn = [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Generate All");
      const search = document.querySelector("svg[class*=lucide-search]");
      const ths = [...document.querySelectorAll("thead th")].slice(0, 3);
      const wrap = document.querySelector("table")?.parentElement;
      return {
        genSvg: genBtn?.querySelector("svg")?.getAttribute("class") ?? null,
        searchSvg: search ? norm(search.getAttribute("class")) : null,
        ths: ths.map((t) => norm(t.getAttribute("class"))),
        wrapCls: wrap ? norm(wrap.getAttribute("class")) : null,
      };
    });
    expect(info.genSvg).toContain("lucide-calculator");
    expect(info.searchSvg).toContain("text-slate-400");
    expect(info.searchSvg).not.toContain("pointer-events-none");
    for (const th of info.ths) {
      expect(th).toContain("text-left py-3 px-4 font-medium text-slate-500");
    }
    expect(info.wrapCls).toBe("overflow-x-auto");
  });

  test("R50-A2+B6: payrollengine — the calculator glyph + the border-0 shadow-sm cards", async ({ page }) => {
    await page.goto("/payrollengine");
    await expect(page.getByRole("heading", { name: "Payroll Calculator" })).toBeVisible();
    await expect(page.getByText('Select a month and click "Generate Payroll"')).toBeVisible();
    const info = await page.evaluate(() => {
      const norm = (c: string | null) => (c || "").replace(/\s+/g, " ").trim();
      const genBtn = [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Generate Payroll");
      const cards = [...document.querySelectorAll("[class*=rounded-xl]")].filter((e) => /card/.test(e.className));
      return {
        genSvg: genBtn?.querySelector("svg")?.getAttribute("class") ?? null,
        cards: cards.map((c) => norm(c.getAttribute("class"))),
      };
    });
    expect(info.genSvg).toContain("lucide-calculator");
    expect(info.genSvg).not.toContain("lucide-cog");
    const flat = info.cards.filter((c) => c.includes("border-0"));
    expect(flat).toHaveLength(2);
    for (const c of flat) expect(c).toContain("shadow-sm");
  });

  test("R50-A3: surveyanalytics — the brain glyph on Run AI Analysis", async ({ page }) => {
    await page.goto("/surveyanalytics");
    await expect(page.getByRole("heading", { name: "Survey Analytics" })).toBeVisible();
    const info = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Run AI Analysis");
      return btn?.querySelector("svg")?.getAttribute("class") ?? null;
    });
    expect(info).toContain("lucide-brain");
  });

  test("R50-A4+A5+A6: notificationpreferences — the check on Mark All Read, the bell/check/smartphone switch family, the bell opacity-30 zero", async ({ page }) => {
    await page.goto("/notificationpreferences");
    await expect(page.getByRole("heading", { name: "Notification Settings" })).toBeVisible();
    await expect(page.locator('button[role=switch]').first()).toBeVisible();
    const info = await page.evaluate(() => {
      const norm = (c: string | null) => (c || "").replace(/\s+/g, " ").trim();
      const markBtn = [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Mark All Read");
      const rows = [...document.querySelectorAll('button[role=switch]')].map((b) => {
        const row = b.closest("div[class*=flex]");
        const svg = row?.querySelector("svg");
        return svg ? norm(svg.getAttribute("class")) : null;
      });
      const zero = [...document.querySelectorAll("svg")].find((s) => (s.getAttribute("class") || "").includes("opacity-30"));
      return {
        markSvg: markBtn?.querySelector("svg")?.getAttribute("class") ?? null,
        rows,
        zeroSvg: zero ? norm(zero.getAttribute("class")) : null,
      };
    });
    expect(info.markSvg).toContain("lucide-check ");
    expect(info.markSvg).not.toContain("lucide-check-check");
    expect(info.rows).toEqual([
      "lucide lucide-mail w-4 h-4 text-slate-600",
      "lucide lucide-bell w-4 h-4 text-slate-600",
      "lucide lucide-check w-4 h-4 text-slate-600",
      "lucide lucide-bell w-4 h-4 text-slate-600",
      "lucide lucide-smartphone w-4 h-4 text-slate-600",
      "lucide lucide-bell w-4 h-4 text-slate-600",
    ]);
    expect(info.zeroSvg).toBe("lucide lucide-bell w-8 h-8 mx-auto mb-2 opacity-30");
  });

  // Session 87 amendment (R87-F): the full-registry cross-side pixel-diff
  // re-measured the zero card — the REF renders a 64px bg-blue-100
  // rounded-full circle WRAPPING the briefcase (live-read h64/h32); the
  // r50-era "direct glyph, no chip" measurement was stale.
  test("R50-A7: employeeportal's zero card — the briefcase glyph rides the bg-blue-100 circle wrapper (session 87 re-measure), H2 mb-2, the mt-less P", async ({ page }) => {
    await page.goto("/employeeportal");
    await expect(page.getByRole("heading", { name: "No Onboarding Found" })).toBeVisible();
    const info = await page.evaluate(() => {
      const norm = (c: string | null) => (c || "").replace(/\s+/g, " ").trim();
      const h2 = [...document.querySelectorAll("h2")].find((h) => h.textContent?.includes("No Onboarding"));
      const content = h2?.parentElement;
      const svg = content?.querySelector("svg");
      const p = h2?.nextElementSibling;
      const wrap = svg?.parentElement;
      const wrapR = wrap?.getBoundingClientRect();
      return {
        svgCls: svg ? norm(svg.getAttribute("class")) : null,
        wrapCls: wrap ? norm(wrap.getAttribute("class")) : null,
        wrapH: wrapR ? Math.round(wrapR.height) : 0,
        h2Cls: h2 ? norm(h2.getAttribute("class")) : null,
        pCls: p ? norm(p.getAttribute("class")) : null,
      };
    });
    expect(info.svgCls).toBe("lucide lucide-briefcase w-8 h-8 text-blue-600");
    // the REF's circle wrapper (h64): w-16 h-16 bg-blue-100 rounded-full
    // mx-auto mb-4, the briefcase centered inside.
    expect(info.wrapCls).toContain("bg-blue-100");
    expect(info.wrapCls).toContain("rounded-full");
    expect(info.wrapCls).toContain("mx-auto");
    expect(info.wrapH).toBe(64);
    expect(info.h2Cls).toContain("mb-2");
    expect(info.pCls).toBe("text-slate-600");
  });

  test("R50-B7+B8: requestsettings' plain cards + space-y-4 interiors; hrletters' plain CardTitle", async ({ page }) => {
    await page.goto("/requestsettings");
    await expect(page.getByRole("heading", { name: "Request Settings" })).toBeVisible();
    const rs = await page.evaluate(() => {
      const norm = (c: string | null) => (c || "").replace(/\s+/g, " ").trim();
      const cards = [...document.querySelectorAll("[class*=rounded-xl]")].filter((e) => /border/.test(e.className) && e.querySelector("h3, [class*=tracking-tight]"));
      return {
        cards: cards.map((c) => norm(c.getAttribute("class"))),
        interiors: cards.map((c) => norm(c.children[1]?.getAttribute("class") ?? "")),
        subs: [...document.querySelectorAll("p")].filter((p) => /Set up to 3|max request/i.test(p.textContent || "")).map((p) => norm(p.getAttribute("class"))),
      };
    });
    expect(rs.cards).toHaveLength(2);
    for (const c of rs.cards) expect(c).not.toContain("border-slate-200");
    for (const i of rs.interiors) expect(i).toContain("p-6 space-y-4");
    for (const s of rs.subs) expect(s).toContain("text-slate-500");

    await page.goto("/hrletters");
    await expect(page.getByRole("heading", { name: "HR Letters" })).toBeVisible();
    const hl = await page.evaluate(() => {
      const t = [...document.querySelectorAll("[class*=tracking-tight]")].find((e) => e.textContent?.includes("Letter Requests"));
      return t ? t.getAttribute("class") : null;
    });
    expect(hl?.replace(/\s+/g, " ")).toBe("font-semibold tracking-tight text-base leading-none");
  });
});
