import { expect, test } from "@playwright/test";

// Session 87 — the full-registry cross-side pixel-diff round (the r86
// close-out's named frontier: the standing cross-side at-rest pixel-diff
// protocol extended to the REMAINING 52 registry routes — the program's
// first complete 61-route cross-side coverage). The instrument
// (r87-crossdiff-capture/diff/triage + four deep-probe passes) found
// FOURTEEN clone-authored defects — every one a long-standing delta
// invisible to the per-side byte chains:
//
//   R87-A the assets empty-state icon (Inbox → the Laptop glyph in the
//         REF's direct-svg form — no wrapper div)
//   R87-B the organogram empty-state icon (Network → Users)
//   R87-C the payrollmodule empty-state sentence (truncated → the REF's
//         full 'Click "Generate All" to create them.')
//   R87-D the chat new-conversation button icon (MessageSquarePlus →
//         the Plus glyph)
//   R87-E the offboarding kicker icon (CircleCheckBig → the Users glyph)
//   R87-F the employeeportal empty-state icon wrapper (the bare 32px
//         Briefcase → the REF's 64px bg-blue-100 circle wrapper)
//   R87-G the interviewassistant at-rest card set (the always-rendered
//         AI Analysis card → analysis-conditional; the word counter
//         dropped; the two titles to the h16 title-div form)
//   R87-H the payrollai card-title line box (the text-base h24 form →
//         the REF's leading-none h16 div)
//   R87-I the reports card family (the default border → the REF's
//         border-slate-200 + shadow + text-card-foreground set)
//   R87-J the tenantsetup form-field spacing (h60 fields → the REF's
//         h68; the Continue row's justify-between member)
//   R87-K the payrollengine filter-field spacing (h60 → h64, the card
//         128 → 132)
//   R87-L the loans container offset (the space-y-8 member of the r86-A2
//         margin-collapse class — mt-8 on the desktop header row)
//   R87-M the dynamicdashboard nav-active mapping (nothing active → the
//         REF's Dashboard-active desktop + Home-active mobile)
//   R87-N the attendancedashboard chart type (LineChart → the REF's
//         grouped BarChart with the Present/Late/Absent order)
//
// The data-driven clusters (no action, classified): the REF's emptied
// tenant on advancedanalytics/analytics/analyticsdashboard, careers'
// live public job board, employeeselfservice's REF-side profile-loading
// loop, profile's role badge, shiftcalendar's employee count. The
// carried-forward queue: the surveyanalytics 3-chart reconfiguration,
// the companywall composer offset, the sidebar lucide composition
// drift, the shiftswap stat badge, the unresolved AA-class smalls.

test.describe("session-87 full-registry cross-side pixel-diff — the remediated routes", () => {
  // R87-A — the assets empty state: the Laptop glyph as a DIRECT svg
  // child of the p-12 (the REF's class set, no wrapper div).
  test("R87-A: the assets empty-state icon is the Laptop glyph in the direct form", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/assets");
    await page.waitForSelector("text=No assets yet");
    const read = await page.evaluate(() => {
      const p12 = [...document.querySelectorAll("main [class*='p-12']")].find((el) =>
        el.textContent?.includes("No assets yet"),
      );
      if (!p12) return null;
      const svg = p12.querySelector("svg");
      const first = p12.firstElementChild;
      if (!svg || !first) return null;
      const sr = svg.getBoundingClientRect();
      return {
        svgCls: svg.getAttribute("class") ?? "",
        firstTag: first.tagName.toLowerCase(),
        svgW: Math.round(sr.width),
        svgH: Math.round(sr.height),
        polylines: svg.querySelectorAll("polyline").length,
        pathHead: svg.querySelector("path")?.getAttribute("d")?.slice(0, 12) ?? "",
      };
    });
    expect(read).not.toBeNull();
    // REF-measured: lucide-laptop w-16 h-16 mx-auto mb-4 text-slate-300,
    // a direct svg child (h64). NOTE (the lucide-composition watch): the
    // REF's Laptop rides an older lucide path set ("M20 16V7a2 2 0 0
    // 0-2-2H6a2…") than the pinned 0.525 — the identity + form are the
    // pin; the path-level drift is the documented standing watch.
    expect(read!.svgCls).toContain("lucide-laptop");
    expect(read!.svgCls).toContain("mx-auto");
    expect(read!.svgCls).toContain("mb-4");
    expect(read!.firstTag).toBe("svg");
    expect(read!.svgH).toBe(64);
    // not the Inbox glyph (whose signature is the tray polyline).
    expect(read!.polylines).toBe(0);
  });

  // R87-B — the organogram empty state: the Users glyph.
  test("R87-B: the organogram empty-state icon is the Users glyph", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/organogram");
    await page.waitForSelector("text=No reporting structure");
    const read = await page.evaluate(() => {
      const svg = [...document.querySelectorAll("main svg")].find((el) => Math.round(el.getBoundingClientRect().height) === 64);
      if (!svg) return null;
      return {
        svgCls: svg.getAttribute("class") ?? "",
        paths: [...svg.querySelectorAll("path")].map((p) => p.getAttribute("d")?.slice(0, 44) ?? ""),
        circles: svg.querySelectorAll("circle").length,
      };
    });
    expect(read).not.toBeNull();
    // REF-measured: lucide-users w-16 h-16 mx-auto mb-4 text-slate-300 —
    // the three Users paths + the 9,7 r4 circle.
    expect(read!.svgCls).toContain("lucide-users");
    expect(read!.svgCls).toContain("mx-auto");
    expect(read!.circles).toBe(1);
    expect(read!.paths[0]).toContain("M16 21v-2a4 4 0 0 0-4-4H6a4 4");
  });

  // R87-C — the payrollmodule empty state: the REF's FULL sentence.
  test("R87-C: the payrollmodule empty state carries the full Generate All sentence", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/payrollmodule");
    await page.waitForSelector("td");
    const text = await page.evaluate(() => {
      const td = [...document.querySelectorAll("td")].find((t) => t.textContent?.includes("No payslips"));
      return td?.textContent ?? "";
    });
    // REF-measured (live-read): 'No payslips for October 2026. Click
    // "Generate All" to create them.' Pre-fix: truncated after the period.
    expect(text).toContain('Click "Generate All" to create them.');
  });

  // R87-D — the chat new-conversation button: the Plus glyph.
  test("R87-D: the chat new-conversation button carries the Plus glyph", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/chat");
    await page.waitForSelector("text=Messages");
    const read = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("main button")].find((b) => {
        const r = b.getBoundingClientRect();
        const bg = getComputedStyle(b).backgroundColor;
        return Math.round(r.width) === 40 && Math.round(r.height) === 32 && bg.includes("37, 99, 235");
      });
      if (!btn) return null;
      const svg = btn.querySelector("svg");
      return { paths: svg ? [...svg.querySelectorAll("path")].map((p) => p.getAttribute("d") ?? "") : [] };
    });
    expect(read).not.toBeNull();
    // REF-measured: the Plus glyph — "M5 12h14" + "M12 5v14" (the
    // pre-fix MessageSquarePlus carries the speech-bubble path set).
    expect(read!.paths).toContain("M5 12h14");
    expect(read!.paths).toContain("M12 5v14");
  });

  // R87-E — the offboarding kicker: the Users glyph.
  test("R87-E: the offboarding kicker icon is the Users glyph", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/offboarding");
    await page.waitForSelector("text=Offboarding Journey");
    const read = await page.evaluate(() => {
      // the kicker icon: the 16px svg at the top of the content column
      const svg = [...document.querySelectorAll("main svg")].find((el) => {
        const r = el.getBoundingClientRect();
        return Math.round(r.width) === 16 && r.y < 60 && r.x > 240;
      });
      if (!svg) return null;
      return {
        paths: [...svg.querySelectorAll("path")].map((p) => p.getAttribute("d")?.slice(0, 44) ?? ""),
        circles: svg.querySelectorAll("circle").length,
      };
    });
    expect(read).not.toBeNull();
    // REF-measured: the Users glyph (paths + the 9,7 r4 circle), not
    // CircleCheckBig ("M21.801 10A10 10 0 1 1 17 3.335").
    expect(read!.circles).toBe(1);
    expect(read!.paths.join("|")).toContain("M16 21v-2a4 4 0 0 0-4-4H6a4");
    expect(read!.paths.join("|")).not.toContain("M21.801 10A10 10");
  });

  // R87-F — the employeeportal empty state: the 64px blue-100 circle
  // wrapping the 32px Briefcase.
  test("R87-F: the employeeportal empty icon rides the bg-blue-100 circle wrapper", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/employeeportal");
    await page.waitForSelector("text=No Onboarding Found");
    const read = await page.evaluate(() => {
      const h2 = [...document.querySelectorAll("h2")].find((h) => h.textContent?.includes("No Onboarding Found"));
      if (!h2) return null;
      const wrap = h2.previousElementSibling;
      if (!wrap) return null;
      const svg = wrap.querySelector("svg");
      const wr = wrap.getBoundingClientRect();
      return {
        wrapCls: (wrap as HTMLElement).className,
        wrapH: Math.round(wr.height),
        svgCls: svg?.getAttribute("class") ?? "",
        svgW: svg ? Math.round(svg.getBoundingClientRect().width) : 0,
      };
    });
    expect(read).not.toBeNull();
    // REF-measured: div.w-16.h-16.bg-blue-100.rounded-full.mx-auto.mb-4
    // (h64) wrapping the w-8 h-8 text-blue-600 briefcase. Pre-fix: the
    // bare 32px svg with no wrapper.
    expect(read!.wrapCls).toContain("bg-blue-100");
    expect(read!.wrapCls).toContain("rounded-full");
    expect(read!.wrapH).toBe(64);
    expect(read!.svgCls).toContain("lucide-briefcase");
    expect(read!.svgW).toBe(32);
  });

  // R87-G — the interviewassistant at-rest set: TWO cards, no AI
  // Analysis, no word counter, h16 titles.
  test("R87-G: the interviewassistant at-rest card set matches the REF (2 cards, h16 titles)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/interviewassistant");
    await page.waitForSelector("text=Select Candidate");
    const read = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("main .rounded-xl")];
      const titles = [...document.querySelectorAll("main .rounded-xl .font-semibold")].map((t) => {
        const r = t.getBoundingClientRect();
        return { text: t.textContent ?? "", h: Math.round(r.height) };
      });
      return {
        cardCount: cards.length,
        hasAiAnalysis: document.body.textContent?.includes("AI Analysis") ?? false,
        hasWordCounter: /0 words/.test(document.body.textContent ?? ""),
        titles,
      };
    });
    // REF-measured at rest: exactly TWO cards (Select Candidate +
    // Interview Notes) — the AI Analysis card renders only after an
    // analysis exists; no word counter; both titles the h16
    // leading-none div form (the text-base default renders h24).
    expect(read.cardCount).toBe(2);
    expect(read.hasAiAnalysis).toBe(false);
    expect(read.hasWordCounter).toBe(false);
    const selectable = read.titles.filter((t) => ["Select Candidate", "Interview Notes"].includes(t.text));
    expect(selectable.length).toBe(2);
    for (const t of selectable) expect(t.h).toBe(16);
  });

  // R87-H — the payrollai card title: the h16 line box.
  test("R87-H: the payrollai AI Suggestions title renders the h16 line box", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/payrollai");
    await page.waitForSelector("text=AI Suggestions");
    const read = await page.evaluate(() => {
      const el = [...document.querySelectorAll("main .font-semibold")].find((t) => t.textContent === "AI Suggestions");
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { h: Math.round(r.height), cls: (el as HTMLElement).className };
    });
    expect(read).not.toBeNull();
    // REF-measured: the header renders h65 with the title div at h16
    // (font-semibold leading-none tracking-tight — no text-base). The
    // pre-fix default CardTitle renders h24 (header h73, card h359).
    expect(read!.h).toBe(16);
    expect(read!.cls).toContain("leading-none");
    expect(read!.cls).not.toContain("text-base");
  });

  // R87-I — the reports cards: the border-slate-200 + shadow family.
  test("R87-I: the reports cards carry the border-slate-200 + shadow set", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/reports");
    await page.waitForSelector("text=Saudization");
    const read = await page.evaluate(() => {
      const h3 = [...document.querySelectorAll("main h3")].find((h) => h.textContent?.includes("Saudization"));
      const card = h3?.closest(".rounded-xl") as HTMLElement | null;
      if (!card) return null;
      const cs = getComputedStyle(card);
      return {
        cls: card.className,
        borderTopColor: cs.borderTopColor,
        boxShadow: cs.boxShadow,
      };
    });
    expect(read).not.toBeNull();
    // REF-measured: 'rounded-xl border bg-card text-card-foreground
    // shadow border-slate-200' — computed border rgb(226, 232, 240).
    // Pre-fix: the default border rgb(229, 229, 229), no shadow.
    expect(read!.cls).toContain("border-slate-200");
    expect(read!.cls).toContain("shadow");
    expect(read!.borderTopColor).toBe("rgb(226, 232, 240)");
    expect(read!.boxShadow).not.toBe("none");
  });

  // R87-J — the tenantsetup form: the h68 fields + the h236 form.
  test("R87-J: the tenantsetup fields render the REF's h68 spacing", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/tenantsetup");
    await page.waitForSelector("text=Company Name");
    const read = await page.evaluate(() => {
      const form = document.querySelector("form");
      if (!form) return null;
      const fields = [...form.querySelectorAll(".space-y-2")];
      const row = [...form.children].find((c) => (c as HTMLElement).className.includes("pt-4"));
      return {
        formH: Math.round(form.getBoundingClientRect().height),
        fieldHs: fields.map((f) => Math.round(f.getBoundingClientRect().height)),
        rowCls: row ? (row as HTMLElement).className : "",
      };
    });
    expect(read).not.toBeNull();
    // REF-measured: the fields render h68 each (label 16 + gap 8 +
    // input 36 + 8 — the REF's trailing slot elements feed the space-y
    // chain) → the form h236; the Continue row carries justify-between
    // (class parity; inert with one child). Pre-fix: h60/h60/h220.
    expect(read!.fieldHs.length).toBe(2);
    expect(read!.fieldHs[0]).toBe(68);
    expect(read!.fieldHs[1]).toBe(68);
    expect(read!.formH).toBe(236);
    expect(read!.rowCls).toContain("justify-between");
  });

  // R87-K — the payrollengine filter card: the h64 fields + the h132 card.
  test("R87-K: the payrollengine filter fields render the REF's h64 spacing", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/payrollengine");
    await page.waitForSelector("text=Payroll Month");
    const read = await page.evaluate(() => {
      const card = [...document.querySelectorAll("main .rounded-xl")].find((c) => c.textContent?.includes("Payroll Month"));
      if (!card) return null;
      const fields = [...card.querySelectorAll(".space-y-1")];
      return {
        cardH: Math.round(card.getBoundingClientRect().height),
        fieldHs: fields.map((f) => Math.round(f.getBoundingClientRect().height)),
      };
    });
    expect(read).not.toBeNull();
    // REF-measured: the two fields render h64 each (label 16 + gap 4 +
    // input 36 + 8 of trailing-slot spacing) → the card h132.
    // Pre-fix: h60/h60/h128.
    expect(read!.fieldHs.length).toBe(2);
    expect(read!.fieldHs[0]).toBe(64);
    expect(read!.fieldHs[1]).toBe(64);
    expect(read!.cardH).toBe(132);
  });

  // R87-L — the loans container offset: the mt-8 desktop header row.
  test("R87-L: the loans desktop header row carries the mt-8 offset (the A2 space-y-8 member)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/loans");
    await page.waitForSelector("text=No loans yet");
    const read = await page.evaluate(() => {
      const container = [...document.querySelectorAll("main .max-w-7xl")].find((c) =>
        c.className.includes("space-y-8"),
      );
      if (!container) return null;
      // the desktop header row: the first md:flex row inside the
      // container's PageHeader (the space-y second child)
      const header = [...container.querySelectorAll("header, [class*='hidden md:flex'], .md\\:flex")][0] as HTMLElement | undefined;
      const rows = [...container.children].flatMap((ch) => [...(ch as HTMLElement).querySelectorAll?.("*") ?? []]);
      const deskRow = (rows as HTMLElement[]).find((el) => getComputedStyle(el).display === "flex" && el.className.includes("mt-8"));
      const anyMt8 = [...container.querySelectorAll("*")].find((el) => getComputedStyle(el).marginTop === "32px");
      const cr = container.getBoundingClientRect();
      return {
        containerCls: container.className,
        containerY: Math.round(cr.y),
        mt8El: deskRow ? deskRow.className.slice(0, 60) : (anyMt8 ? (anyMt8 as HTMLElement).className.slice(0, 60) : null),
      };
    });
    expect(read).not.toBeNull();
    // REF-measured: the REF's v3-style space-y-8 collapse puts the
    // container 32px lower (the card at y228 vs the LOC's y196); the
    // r86-A2 recipe's mt-8 variant restores it (inert at mobile).
    expect(read!.mt8El).not.toBeNull();
  });

  // R87-M — the dynamicdashboard nav-active mapping: Dashboard active
  // on desktop + Home active on mobile.
  test("R87-M: the dynamicdashboard route marks Dashboard/Home active", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/dynamicdashboard");
    await page.waitForSelector("text=Welcome back");
    const desktop = await page.evaluate(() => {
      const links = [...document.querySelectorAll("a")];
      const act = links.filter((a) => {
        const bg = getComputedStyle(a).backgroundColor;
        const r = a.getBoundingClientRect();
        return bg && bg !== "rgba(0, 0, 0, 0)" && r.x < 240 && r.width > 50;
      });
      return act.map((a) => ({ text: a.textContent?.trim().slice(0, 20), bg: getComputedStyle(a).backgroundColor }));
    });
    // REF-measured (live-read): the desktop sidebar marks "Dashboard"
    // ACTIVE (the blue-600 filled item rgb(24, 119, 242)) on
    // /dynamicdashboard; pre-fix nothing is active.
    expect(desktop.some((a) => a.text === "Dashboard" && a.bg === "rgb(24, 119, 242)")).toBe(true);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dynamicdashboard");
    await page.waitForTimeout(1200);
    const mobile = await page.evaluate(() => {
      const links = [...document.querySelectorAll("a")];
      const act = links.filter((a) => {
        const bg = getComputedStyle(a).backgroundColor;
        const r = a.getBoundingClientRect();
        return bg && bg !== "rgba(0, 0, 0, 0)" && r.y > 700 && r.width > 40;
      });
      return act.map((a) => a.textContent?.trim().slice(0, 20));
    });
    // REF-measured: the mobile bottom bar marks "Home" active.
    expect(mobile).toContain("Home");
  });

  // R87-N — the attendancedashboard chart: the grouped BarChart.
  test("R87-N: the Daily Attendance Trend renders the REF's grouped bar chart", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/attendancedashboard");
    await page.waitForSelector("text=Daily Attendance Trend");
    await page.waitForTimeout(1500);
    const read = await page.evaluate(() => {
      const chart = [...document.querySelectorAll(".recharts-wrapper")].find((c) =>
        c.textContent?.includes("Daily Attendance Trend") ||
        c.closest(".rounded-xl")?.textContent?.includes("Daily Attendance Trend"),
      );
      const target = chart ?? [...document.querySelectorAll(".recharts-wrapper")][0];
      if (!target) return null;
      const legend = target.querySelector(".recharts-legend-wrapper");
      const ticks = [...target.querySelectorAll("text")].map((t) => t.textContent?.trim() ?? "").filter(Boolean);
      return {
        ticks,
        legendText: legend?.textContent?.trim() ?? "",
        hasBarContainer: !!target.querySelector(".recharts-bar"),
        hasLineContainer: !!target.querySelector(".recharts-line"),
      };
    });
    expect(read).not.toBeNull();
    // REF-measured: a grouped BAR chart (the recharts-bar container; the
    // REF's 2.x recharts renders zero-height rects at zero data — the
    // pinned 3.x skips them, both visually empty) + the Present/Late/
    // Absent legend order + the day ticks. Pre-fix: a LineChart (the
    // .recharts-line container).
    expect(read!.hasBarContainer).toBe(true);
    expect(read!.hasLineContainer).toBe(false);
    expect(read!.legendText.startsWith("Present")).toBe(true);
    expect(read!.ticks.filter((t) => t === "1" || t === "2").length).toBeGreaterThan(0);
  });
});
