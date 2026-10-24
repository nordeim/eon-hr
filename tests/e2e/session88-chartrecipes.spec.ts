import { test, expect } from "@playwright/test";

/**
 * Session 88 / Parity Round 87 — the chart-suite + stale-measurement round.
 * The 14 contract pins for the r88 fix set (the r87 close-out's named
 * frontier #1 — the surveyanalytics 3-chart reconfiguration — plus the
 * re-measured residuals: the attendancedashboard month input + chart
 * geometry + summary card, the tenantsetup +6 header, the reports icon
 * family, the hrreports grid-only chart + icons, the shiftswap stat tiles
 * (the R49-B1 stale-measurement retirement), the companywall +8 composer).
 *
 * Every assertion is the live-measured REF recipe (the r88 deep-probe
 * passes, both sides @1440×900 LIGHT LTR at the shared zero-data state).
 */

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
});

// ---------------------------------------------------------------------------
// R88-A — the surveyanalytics 3-chart zero-state reconfiguration
// ---------------------------------------------------------------------------

test("R88-A1: surveyanalytics chart 1 renders the REF's empty surface at the zero state", async ({ page }) => {
  await page.goto("/surveyanalytics");
  await page.waitForSelector("text=Sentiment Distribution");
  await page.waitForTimeout(1500);
  const read = await page.evaluate(() => {
    // the first chart card's MAIN svg (filter by width — the DOM-order
    // trap: the 3.x legend-icon svgs precede the chart svgs)
    const svgs = [...document.querySelectorAll("svg.recharts-surface")].filter(
      (s) => Math.round(s.getBoundingClientRect().width) === 498
    );
    const svg = svgs[0];
    if (!svg) return null;
    return {
      grid: svg.querySelectorAll(".recharts-cartesian-grid").length,
      axisLayers: svg.querySelectorAll("g[class*=recharts-cartesian-axis]").length,
      axisLines: svg.querySelectorAll(".recharts-cartesian-axis-line").length,
      texts: [...svg.querySelectorAll("text")].map((t) => t.textContent.trim()).filter(Boolean),
      h: Math.round(svg.getBoundingClientRect().height),
    };
  });
  expect(read).not.toBeNull();
  // REF-measured: a COMPLETELY empty surface — [title, desc, defs] only.
  expect(read!.grid).toBe(0);
  expect(read!.axisLayers).toBe(0);
  expect(read!.axisLines).toBe(0);
  expect(read!.texts).toEqual([]);
  expect(read!.h).toBe(240);
});

test("R88-A2: surveyanalytics chart 2 renders the REF's -100..100 reference scale (left axis, no months)", async ({ page }) => {
  await page.goto("/surveyanalytics");
  await page.waitForSelector("text=Sentiment Trend Over Time");
  await page.waitForTimeout(1500);
  const read = await page.evaluate(() => {
    const svgs = [...document.querySelectorAll("svg.recharts-surface")].filter(
      (s) => Math.round(s.getBoundingClientRect().width) === 498
    );
    const svg = svgs[1];
    if (!svg) return null;
    const yAxisLayer = svg.querySelector("g[class*=recharts-yAxis]");
    const xAxisLayer = svg.querySelector("g[class*=recharts-xAxis]");
    const axisLine = svg.querySelector(".recharts-cartesian-axis-line");
    const firstTick = svg.querySelector("g[class*=recharts-yAxis] text");
    return {
      yAxisLayer: !!yAxisLayer,
      xAxisLayer: !!xAxisLayer,
      yTexts: [...svg.querySelectorAll("g[class*=recharts-yAxis] text")].map((t) => t.textContent.trim()),
      gridLines: svg.querySelectorAll(".recharts-cartesian-grid line").length,
      curves: svg.querySelectorAll(".recharts-line-curve").length,
      monthTexts: [...svg.querySelectorAll("text")].map((t) => t.textContent.trim()).filter((t) => t.includes(" 2")),
      axisX: axisLine ? axisLine.getAttribute("x1") : null,
      tickFont: firstTick ? getComputedStyle(firstTick).fontSize : null,
      allTexts: [...svg.querySelectorAll("text")].map((t) => t.textContent.trim()).filter(Boolean),
    };
  });
  expect(read).not.toBeNull();
  // REF-measured: grid + the left YAxis reference scale ONLY — the 5
  // ticks, the 7-line grid (5 horizontal + 2 edge verticals), the axis
  // line at x65, the 16px INHERITED tick font, no months, no curve.
  expect(read!.yAxisLayer).toBe(true);
  expect(read!.xAxisLayer).toBe(false);
  expect(read!.yTexts).toEqual(["-100", "-50", "0", "50", "100"]);
  expect(read!.gridLines).toBe(7);
  expect(read!.curves).toBe(0);
  expect(read!.monthTexts).toEqual([]);
  expect(read!.axisX).toBe("65");
  expect(read!.tickFont).toBe("16px");
});

test("R88-A3: surveyanalytics chart 3 renders the REF's right-axis reference scale + the legend pair", async ({ page }) => {
  await page.goto("/surveyanalytics");
  await page.waitForSelector("text=Response Count");
  await page.waitForTimeout(1500);
  const read = await page.evaluate(() => {
    const svgs = [...document.querySelectorAll("svg.recharts-surface")].filter(
      (s) => Math.round(s.getBoundingClientRect().width) > 1000
    );
    const svg = svgs[0];
    if (!svg) return null;
    const axisLine = svg.querySelector(".recharts-cartesian-axis-line");
    const tick = svg.querySelector("g[class*=recharts-yAxis] text");
    const legend = svg.parentElement?.querySelectorAll(".recharts-legend-item-text") ?? [];
    return {
      xAxisLayer: !!svg.querySelector("g[class*=recharts-xAxis]"),
      yTexts: [...svg.querySelectorAll("g[class*=recharts-yAxis] text")].map((t) => t.textContent.trim()),
      gridLines: svg.querySelectorAll(".recharts-cartesian-grid line").length,
      bars: svg.querySelectorAll(".recharts-bar-rectangle").length,
      axisX: axisLine ? axisLine.getAttribute("x1") : null,
      tickX: tick ? tick.getAttribute("x") : null,
      legend: [...legend].map((t) => t.textContent.trim()),
    };
  });
  expect(read).not.toBeNull();
  // REF-measured: the RIGHT-orientation YAxis (the line at x1005 = the
  // 1070-65 plot edge, the tick texts at x1013 RIGHT of the axis) + the
  // 7-line grid + NO XAxis + the legend pair + zero bars.
  expect(read!.xAxisLayer).toBe(false);
  expect(read!.yTexts).toEqual(["-100", "-50", "0", "50", "100"]);
  expect(read!.gridLines).toBe(7);
  expect(read!.bars).toBe(0);
  expect(read!.axisX).toBe("1005");
  expect(read!.tickX).toBe("1013");
  expect(read!.legend).toEqual(["Responses", "Avg Sentiment %"]);
});

// ---------------------------------------------------------------------------
// R88-B — the attendancedashboard family
// ---------------------------------------------------------------------------

test("R88-B1: the attendancedashboard header carries the month input (w-40, the current month)", async ({ page }) => {
  await page.goto("/attendancedashboard");
  await page.waitForSelector("text=Daily Attendance Trend");
  const read = await page.evaluate(() => {
    const inp = document.querySelector("main input[type=month]");
    if (!inp) return null;
    const r = inp.getBoundingClientRect();
    return {
      w: Math.round(r.width),
      h: Math.round(r.height),
      val: (inp as HTMLInputElement).value,
      x: Math.round(r.x),
    };
  });
  expect(read).not.toBeNull();
  // REF-measured: the type=month Input at w-40 (160px) before the
  // department select, value the current month.
  expect(read!.w).toBe(160);
  expect(read!.h).toBe(36);
  expect(read!.val).toBe("2026-10");
});

test("R88-B2: the Daily Attendance Trend renders the REF's geometry + tick cadence", async ({ page }) => {
  await page.goto("/attendancedashboard");
  await page.waitForSelector("text=Daily Attendance Trend");
  await page.waitForTimeout(1500);
  const read = await page.evaluate(() => {
    const svgs = [...document.querySelectorAll("svg.recharts-surface")].filter(
      (s) => Math.round(s.getBoundingClientRect().width) === 498 && s.getBoundingClientRect().x < 800
    );
    const svg = svgs[0];
    if (!svg) return null;
    const axisLine = svg.querySelector(".recharts-cartesian-axis-line");
    const firstTick = svg.querySelector("g[class*=yAxis] text, g[class*=recharts-yAxis] text");
    const xTexts = [...svg.querySelectorAll("text")].map((t) => t.textContent.trim());
    return {
      axisX: axisLine ? axisLine.getAttribute("x1") : null,
      tickFont: firstTick ? getComputedStyle(firstTick).fontSize : null,
      texts: xTexts,
      legendOrder: [...(svg.parentElement?.querySelectorAll(".recharts-legend-item-text") ?? [])].map((t) => t.textContent.trim()),
    };
  });
  expect(read).not.toBeNull();
  // REF-measured: the YAxis at x65 (width 65), the 16px Y-tick font (the
  // session-89 clarification R89-A1: this selector reads the Y AXIS first —
  // the REF renders the MIXED form, X ticks 11px / Y ticks 16px, both
  // live-verified 3× stable on both themes; the r88 comment's blanket
  // "inherited tick font" claim covered only the Y side), the 2.x adaptive
  // X cadence: [1..8, then the evens 10..30].
  expect(read!.axisX).toBe("65");
  expect(read!.tickFont).toBe("16px");
  const expected = ["1", "2", "3", "4", "5", "6", "7", "8", "10", "12", "14", "16", "18", "20", "22", "24", "26", "28", "30"];
  for (const t of expected) expect(read!.texts).toContain(t);
  expect(read!.texts).not.toContain("9");
  expect(read!.texts).not.toContain("31");
  expect(read!.legendOrder).toEqual(["Present", "Late", "Absent"]);
});

test("R88-B3: the Clock-In chart renders the REF's grid-only form", async ({ page }) => {
  await page.goto("/attendancedashboard");
  await page.waitForSelector("text=Clock-In Time Distribution");
  await page.waitForTimeout(1500);
  const read = await page.evaluate(() => {
    const svgs = [...document.querySelectorAll("svg.recharts-surface")].filter(
      (s) => Math.round(s.getBoundingClientRect().width) === 498 && s.getBoundingClientRect().x > 800
    );
    const svg = svgs[0];
    if (!svg) return null;
    const lines = [...svg.querySelectorAll(".recharts-cartesian-grid line")].map((l) => ({
      x1: l.getAttribute("x1"),
      y1: l.getAttribute("y1"),
      x2: l.getAttribute("x2"),
      y2: l.getAttribute("y2"),
    }));
    return {
      axisLayers: svg.querySelectorAll("g[class*=recharts-cartesian-axis]").length,
      texts: [...svg.querySelectorAll("text")].map((t) => t.textContent.trim()).filter(Boolean),
      lines: lines,
    };
  });
  expect(read).not.toBeNull();
  // REF-measured: GRID-ONLY — no axis layers, no tick texts, the 4-line
  // plot border at [65,493]x[5,225].
  expect(read!.axisLayers).toBe(0);
  expect(read!.texts).toEqual([]);
  expect(read!.lines).toHaveLength(4);
  expect(read!.lines).toContainEqual({ x1: "65", y1: "5", x2: "493", y2: "5" });
  expect(read!.lines).toContainEqual({ x1: "65", y1: "225", x2: "493", y2: "225" });
  expect(read!.lines).toContainEqual({ x1: "65", y1: "5", x2: "65", y2: "225" });
  expect(read!.lines).toContainEqual({ x1: "493", y1: "5", x2: "493", y2: "225" });
});

test("R88-B4: the summary card renders the REF's plain header + Rate column + plain table", async ({ page }) => {
  await page.goto("/attendancedashboard");
  await page.waitForSelector("text=Employee Attendance Summary");
  const read = await page.evaluate(() => {
    const cards = [...document.querySelectorAll("[class*=rounded-xl]")];
    const card = cards.find((c) => (c.textContent || "").includes("Employee Attendance Summary"));
    if (!card) return null;
    const header = [...card.children].find((c) => (c.getAttribute("class") || "").includes("p-6"));
    const row = header ? header.querySelector(".justify-between") : null;
    const table = card.querySelector("table");
    const thead = table ? table.querySelector("thead") : null;
    const tr = thead ? thead.querySelector("tr") : null;
    const ths = table ? [...table.querySelectorAll("th")].map((t) => t.textContent.trim()) : [];
    return {
      hdrH: header ? Math.round(header.getBoundingClientRect().height) : null,
      hdrCls: header ? header.getAttribute("class") : null,
      hasRow: !!row,
      hasDescription: !!(header && header.querySelector(".text-sm.text-muted-foreground, p.text-sm")),
      ths: ths,
      theadCls: thead ? thead.getAttribute("class") : undefined,
      trCls: tr ? tr.getAttribute("class") : null,
      firstThCls: table?.querySelector("th")?.getAttribute("class") ?? null,
    };
  });
  expect(read).not.toBeNull();
  // REF-measured: the plain h80 CardHeader (title-only, no description)
  // wrapping one justify-between row; the plain table (thead with NO
  // class, the tr border-b border-slate-200, the bare th recipe) with
  // the last column "Rate" (not "Rate %").
  expect(read!.hdrH).toBe(80);
  expect(read!.hdrCls).toContain("flex flex-col space-y-1.5 p-6");
  expect(read!.hasRow).toBe(true);
  expect(read!.hasDescription).toBe(false);
  expect(read!.ths).toEqual(["Employee", "Department", "Present", "Absent", "Late", "Rate"]);
  expect(read!.theadCls).toBe(null);
  expect(read!.trCls).toBe("border-b border-slate-200");
  expect(read!.firstThCls).toBe("text-left py-2 px-3 text-slate-500 font-medium");
});

// ---------------------------------------------------------------------------
// R88-C — the tenantsetup +6 header
// ---------------------------------------------------------------------------

test("R88-C: the tenantsetup wizard header renders the REF's h197 with the 22px circle-title gap", async ({ page }) => {
  await page.goto("/tenantsetup");
  await page.waitForSelector("text=Welcome to EonHR");
  const read = await page.evaluate(() => {
    const form = document.querySelector("form");
    if (!form) return null;
    const card = form.closest("[class*=rounded-xl]");
    if (!card) return null;
    const header = [...card.children].find((c) => !c.contains(form));
    if (!header) return null;
    const circle = header.querySelector(".rounded-full");
    const title = header.querySelector("[class*=text-2xl]");
    if (!circle || !title) return null;
    const cr = circle.getBoundingClientRect();
    const tr = title.getBoundingClientRect();
    return {
      hdrH: Math.round(header.getBoundingClientRect().height),
      cardH: Math.round(card.getBoundingClientRect().height),
      gap: Math.round(tr.y - (cr.y + cr.height)),
    };
  });
  expect(read).not.toBeNull();
  // REF-measured: the header h197 (the card h483) — the circle's mb-4
  // (16px) + the space-y-1.5 (6px) STACK to the 22px gap (the REF's v3
  // margin-top form; the v4 margin-bottom form collides with the mb-4
  // and drops the 6px — the explicit mt-1.5 restores it).
  expect(read!.hdrH).toBe(197);
  expect(read!.cardH).toBe(483);
  expect(read!.gap).toBe(22);
});

// ---------------------------------------------------------------------------
// R88-D — the reports icon family
// ---------------------------------------------------------------------------

test("R88-D1: the reports card title renders the REF's bare 20px icon (no blue wrapper span)", async ({ page }) => {
  await page.goto("/reports");
  await page.waitForSelector("text=Employee Master Reports");
  const read = await page.evaluate(() => {
    const cards = [...document.querySelectorAll("[class*=rounded-xl]")];
    const card = cards.find((c) => (c.textContent || "").includes("Employee Master Reports"));
    if (!card) return null;
    const header = [...card.children].find((c) => (c.getAttribute("class") || "").includes("p-6"));
    const title = header?.firstElementChild ?? null;
    if (!title) return null;
    const svg = title.querySelector("svg");
    return {
      hdrCls: header ? header.getAttribute("class") : null,
      titleCls: title.getAttribute("class"),
      svgParentCls: svg?.parentElement?.getAttribute("class") ?? null,
      svgCls: svg ? svg.getAttribute("class") : null,
      svgW: svg ? Math.round(svg.getBoundingClientRect().width) : null,
      svgColor: svg ? getComputedStyle(svg).color : null,
    };
  });
  expect(read).not.toBeNull();
  // REF-measured: the BARE icon — a DIRECT svg child of the title div at
  // w-5 h-5 (20px), currentColor (the title's own ink, not blue-600).
  expect(read!.svgParentCls).toBe(read!.titleCls);
  expect(read!.svgCls).toContain("w-5 h-5");
  expect(read!.svgW).toBe(20);
  expect(read!.svgColor).not.toBe("rgb(37, 99, 235)");
  // R88-D5: the header carries the REF's gradient band (the sRGB-pinned
  // arbitrary-value form — the TW-v4 trap-3 rule; the computed left edge
  // reads rgb(239,246,255)).
  expect(read!.hdrCls).toContain("bg-[linear-gradient(to_right,#eff6ff,#eef2ff)]");
});

test("R88-D2: the reports tabs carry the REF's full 11-glyph set", async ({ page }) => {
  await page.goto("/reports");
  await page.waitForSelector("[role=tab]");
  const read = await page.evaluate(() => {
    return [...document.querySelectorAll("[role=tab]")].map((b) => ({
      txt: (b.textContent || "").trim().slice(0, 20),
      svgCls: b.querySelector("svg")?.getAttribute("class") ?? null,
    }));
  });
  // REF-measured (the FULL two-row census — the first probe pass caught
  // only row 1's Plane/DollarSign swaps; row 2 carries two more):
  // users, clock, plane, dollar-sign, trending-up, graduation-cap,
  // SHIELD (not heart-handshake), FILE-CHECK (not file-text), log-out,
  // building2, chart-column.
  const want = [
    ["Employee Master", "lucide-users"],
    ["Attendance & Time", "lucide-clock"],
    ["Leave & Absence", "lucide-plane"],
    ["Payroll & Comp", "lucide-dollar-sign"],
    ["Performance & App", "lucide-trending-up"],
    ["Training & Dev", "lucide-graduation-cap"],
    ["Employee Relations", "lucide-shield"],
    ["Contracts & Comp", "lucide-file-check"],
    ["Exit & Sep", "lucide-log-out"],
    ["Organizational", "lucide-building2"],
    ["Analytics & Dec", "lucide-chart-column"],
  ];
  expect(read.length).toBe(11);
  for (const [prefix, glyph] of want) {
    const tab = read.find((r) => r.txt.startsWith(prefix));
    expect(tab, `tab ${prefix}`).toBeDefined();
    expect(tab!.svgCls, `tab ${prefix} glyph`).toContain(glyph);
  }
});

test("R88-D3: the Report Filters title carries the REF's classic-triangle Filter glyph", async ({ page }) => {
  await page.goto("/reports");
  await page.waitForSelector("text=Report Filters");
  const read = await page.evaluate(() => {
    const cards = [...document.querySelectorAll("[class*=rounded-xl]")];
    const card = cards.find((c) => (c.textContent || "").includes("Report Filters"));
    if (!card) return null;
    const header = [...card.children].find((c) => (c.getAttribute("class") || "").includes("p-6"));
    const title = header?.firstElementChild ?? null;
    if (!title) return null;
    const svg = title.querySelector("svg");
    const poly = svg ? svg.querySelector("polygon") : null;
    return {
      svgCls: svg ? svg.getAttribute("class") : null,
      polyPoints: poly ? poly.getAttribute("points") : null,
    };
  });
  expect(read).not.toBeNull();
  // REF-measured: the classic-triangle funnel (the r87 lucide-version
  // escalation — lucide 0.525's Funnel has different geometry; the
  // vendored polygon carries the REF's exact points).
  expect(read!.svgCls).toContain("lucide-filter");
  expect(read!.polyPoints).toBe("22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3");
});

test("R88-D4: the reports export buttons both carry the REF's Download glyph", async ({ page }) => {
  await page.goto("/reports");
  await page.waitForSelector("text=Employee Master Reports");
  const read = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")].filter(
      (b) => (b.textContent || "").trim() === "CSV" || (b.textContent || "").trim() === "PDF"
    );
    return btns.slice(0, 4).map((b) => ({
      txt: (b.textContent || "").trim(),
      svgCls: b.querySelector("svg")?.getAttribute("class") ?? null,
    }));
  });
  // REF-measured: Download on BOTH buttons (the clone's Printer on the
  // PDF was an invention; the w-3 h-3 classes are dead — the button's
  // [&_svg]:size-4 wins and the icon renders 16px, computed-verified).
  expect(read.length).toBeGreaterThanOrEqual(4);
  for (const b of read) {
    expect(b.svgCls).toContain("lucide-download");
    expect(b.svgCls).not.toContain("lucide-printer");
  }
});

// ---------------------------------------------------------------------------
// R88-E — the hrreports family
// ---------------------------------------------------------------------------

test("R88-E1: the hrreports chart renders the REF's grid-only form", async ({ page }) => {
  await page.goto("/hrreports");
  await page.waitForSelector("text=Data Table");
  await page.waitForTimeout(1500);
  const read = await page.evaluate(() => {
    const svg = document.querySelector("svg.recharts-surface");
    if (!svg) return null;
    const lines = [...svg.querySelectorAll(".recharts-cartesian-grid line")].map((l) => ({
      x1: l.getAttribute("x1"),
      y1: l.getAttribute("y1"),
      x2: l.getAttribute("x2"),
      y2: l.getAttribute("y2"),
    }));
    return {
      axisLayers: svg.querySelectorAll("g[class*=recharts-cartesian-axis]").length,
      texts: [...svg.querySelectorAll("text")].map((t) => t.textContent.trim()).filter(Boolean),
      lines: lines,
    };
  });
  expect(read).not.toBeNull();
  // REF-measured: GRID-ONLY — no axis layers, no tick texts, the 4-line
  // plot border at [65,1081]x[5,255] (the 1086x320 surface).
  expect(read!.axisLayers).toBe(0);
  expect(read!.texts).toEqual([]);
  expect(read!.lines).toHaveLength(4);
  expect(read!.lines).toContainEqual({ x1: "65", y1: "5", x2: "1081", y2: "5" });
  expect(read!.lines).toContainEqual({ x1: "65", y1: "255", x2: "1081", y2: "255" });
  expect(read!.lines).toContainEqual({ x1: "65", y1: "5", x2: "65", y2: "255" });
  expect(read!.lines).toContainEqual({ x1: "1081", y1: "5", x2: "1081", y2: "255" });
});

test("R88-E2: the hrreports export buttons carry the REF's FileSpreadsheet + Download pair", async ({ page }) => {
  await page.goto("/hrreports");
  await page.waitForSelector("text=Export CSV");
  const read = await page.evaluate(() => {
    const csv = [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === "Export CSV");
    const pdf = [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === "Export PDF");
    return {
      csvCls: csv?.querySelector("svg")?.getAttribute("class") ?? null,
      pdfCls: pdf?.querySelector("svg")?.getAttribute("class") ?? null,
    };
  });
  // REF-measured: FileSpreadsheet (CSV) + Download (PDF) — the clone's
  // Download + Printer was an invention.
  expect(read!.csvCls).toContain("lucide-file-spreadsheet");
  expect(read!.pdfCls).toContain("lucide-download");
  expect(read!.pdfCls).not.toContain("lucide-printer");
});

// ---------------------------------------------------------------------------
// R88-F — the shiftswap stat tiles (the R49-B1 stale-measurement retirement)
// ---------------------------------------------------------------------------

test("R88-F: the shiftswap stat cards carry the REF's 40px icon tiles", async ({ page }) => {
  await page.goto("/shiftswap");
  await page.waitForSelector("text=My Requests");
  const read = await page.evaluate(() => {
    const cards = [...document.querySelectorAll("[class*=rounded-xl]")].filter(
      (e) => /border/.test(e.className) && e.querySelector("p")
    );
    return cards.slice(0, 4).map((c) => {
      const tile = c.querySelector("div[class*=w-10]");
      const svg = tile ? tile.querySelector("svg") : null;
      return {
        tileCls: tile ? tile.getAttribute("class") : null,
        iconCls: svg ? svg.getAttribute("class") : null,
      };
    });
  });
  expect(read).toHaveLength(4);
  // REF-measured: the 40px tiles (w-10 h-10 rounded-xl, the
  // blue/yellow/orange/green-100 family) wrapping the 20px icons — the
  // r49 "inline icon" measurement was STALE (the R50-A7 precedent).
  const wantTiles = [
    "w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100",
    "w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-100",
    "w-10 h-10 rounded-xl flex items-center justify-center bg-orange-100",
    "w-10 h-10 rounded-xl flex items-center justify-center bg-green-100",
  ];
  const wantIcons = [
    "lucide lucide-users w-5 h-5 text-blue-600",
    "lucide lucide-clock w-5 h-5 text-yellow-600",
    "lucide lucide-calendar w-5 h-5 text-orange-600",
    "lucide lucide-circle-check-big w-5 h-5 text-green-600",
  ];
  for (let i = 0; i < 4; i++) {
    expect(read[i].tileCls).toBe(wantTiles[i]);
    expect(read[i].iconCls).toBe(wantIcons[i]);
  }
});

// ---------------------------------------------------------------------------
// R88-G — the companywall +8 composer member
// ---------------------------------------------------------------------------

test("R88-G: the companywall audience group renders the REF's 8px label-to-trigger gap", async ({ page }) => {
  await page.goto("/companywall");
  await page.waitForSelector("text=Who can see this post?");
  const read = await page.evaluate(() => {
    const label = [...document.querySelectorAll("label")].find((l) => (l.textContent || "").includes("Who can see"));
    if (!label) return null;
    const trigger = document.querySelector("button[aria-label=Audience]");
    if (!trigger) return null;
    const lr = label.getBoundingClientRect();
    const tr = trigger.getBoundingClientRect();
    return {
      gap: Math.round(tr.y - (lr.y + lr.height)),
      groupH: Math.round((label.parentElement as HTMLElement).getBoundingClientRect().height),
    };
  });
  expect(read).not.toBeNull();
  // REF-measured (live, both sides): the label rect h16 (leading-none,
  // inline) inside the 24px strut line box + the explicit mt-2 on the
  // trigger (the v3 space-y semantics — margin on the BLOCK-LEVEL
  // control, not the ignored inline label) = the rect-math gap 12 BOTH
  // SIDES + the h68 group. Pre-fix: the gap read 4 (the v4 mb-on-inline
  // trap) and the group h60.
  expect(read!.gap).toBe(12);
  expect(read!.groupH).toBe(68);
});
