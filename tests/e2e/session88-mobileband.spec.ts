import { expect, test } from "@playwright/test";

// Session 88 — the mobile-band cross-side round (the r87 close-out's named
// frontier: the first full-registry cross-side pass at 390×844 — all 61
// authed routes captured as at-rest pairs, LIGHT LTR, the badge visible
// per the r85 contract). The instrument (r88-mobile-capture/diff +
// triage + crop-diff + the VLM reads + both-sides DOM probes + the 3×
// reload stability verification per the r87 second-build-variant finding)
// found TWELVE clone-authored defects:
//
//   R88-A the reports CATEGORY ICON family (four glyph identities:
//         calendar-days→Plane, banknote→DollarSign,
//         heart-handshake→Shield, file-text→FileCheck)
//   R88-B the advancedanalytics Schedule Report CTA glyph
//         (CalendarClock → the Plus glyph)
//   R88-C the surveyanalytics zero-data charts (the invented X axes:
//         the Distribution's three zero slices + the Trend's synthetic
//         6-month window → data=[] at zero responses, matching the
//         REF's empty chart surfaces)
//   R88-D the analyticsdashboard actions cluster (flex-wrap → the REF's
//         unwrapped flex items-center gap-3; the REF-authored mobile
//         overflow chain that keeps the subtitle on one line)
//   R88-E the attendancedashboard MONTH FILTER (the missing functional
//         member: a type=month input as the first header action, wired
//         to ?month=YYYY-MM — the functional superset)
//   R88-F the profile icon family (camera→Upload, user→CircleUser on
//         the General tab, globe→Share2 on the Social tab)
//   R88-G the chat conversations list (hidden md:flex → the REF's
//         always-visible w-80 column — restoring mobile usability)
//   R88-H the shiftcalendar table min-width (the REF's inline 700px →
//         100px day columns + the one-row toolbar)
//   R88-I the workflowconfigpage empty-state card (missing
//         text-card-foreground — the r87-I card-family call site)
//   R88-J the shiftswap stat-card tiles (the inline icons → the REF's
//         w-10 h-10 rounded-xl bg-*-100 tiles; the r49 inline pin was
//         a stale measurement)
//   R88-K the tenantsetup hero glyph (Users → Building2)
//   R88-L the companywall filter trigger glyph (the missing Users icon
//         inside the value span's flex items-center gap-2 wrapper)
//
// The data-driven clusters (no action, classified): careers' live job
// board, employeeselfservice's REF-side loading loop, the 0-vs-1
// employee stats (analytics family), the bottom-table widths
// (attendancedashboard/hrreports), recruitment's Active Jobs.
// The version-class residual: the surveyanalytics Trend's Y-domain tick
// labels at zero data (recharts 2.x renders them at data=[], 3.x does
// not) — documented, watch-only.

const MOBILE = { width: 390, height: 844 };

test.describe("session-88 mobile-band cross-side — the remediated surfaces", () => {
  // R88-A — the reports category icons (four identities, live-measured on
  // the REF, stable 3/3 reloads).
  test("R88-A: the reports category icons — plane / dollar-sign / shield / file-check", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/reports");
    // the subtitle anchor is unique + visible (the "HR Reports" text
    // also matches the hidden sidebar's nav item, which stalls strict
    // waits at mobile — the r88 selector lesson)
    await page.waitForSelector("text=Generate comprehensive HR reports");
    const icons = await page.evaluate(() => {
      const els = [...document.querySelectorAll("button")].filter(
        (e) =>
          /Leave & Absence|Payroll & Compensation|Employee Relations|Contracts & Compliance/.test(
            e.textContent ?? "",
          ) &&
          e.querySelectorAll("svg").length >= 1 &&
          (e.textContent ?? "").length < 60,
      );
      const out: Record<string, string | null> = {};
      for (const e of els) {
        const svg = e.querySelector("svg");
        out[(e.textContent ?? "").trim().slice(0, 24)] =
          svg?.getAttribute("class")?.match(/lucide-[a-z0-9-]+/)?.[0] ?? null;
      }
      return out;
    });
    expect(icons["Leave & Absence"]).toBe("lucide-plane");
    expect(icons["Payroll & Compensation"]).toBe("lucide-dollar-sign");
    expect(icons["Employee Relations"]).toBe("lucide-shield");
    expect(icons["Contracts & Compliance"]).toBe("lucide-file-check");
  });

  // R88-B — the advancedanalytics Schedule Report CTA carries the Plus
  // glyph (the REF's plain plus, mr-2).
  test("R88-B: the advancedanalytics Schedule Report CTA glyph is Plus", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/advancedanalytics");
    await page.waitForSelector("text=Schedule Report");
    const icon = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) =>
        /Schedule Report/i.test(b.textContent ?? ""),
      );
      if (!btn) return null;
      return btn.querySelector("svg")?.getAttribute("class")?.match(/lucide-[a-z0-9-]+/)?.[0] ?? null;
    });
    expect(icon).toBe("lucide-plus");
  });

  // R88-C — the surveyanalytics zero-data charts render the REF's
  // contract (the union with the published chart-suite round): the
  // Distribution is the EMPTY surface (no axes); the Trend renders the
  // -100..100 REFERENCE SCALE (the explicit 5-tick ladder + grid, NO
  // X month axis).
  test("R88-C: surveyanalytics at zero data renders the REF's chart contract", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/surveyanalytics");
    await page.waitForSelector("text=Sentiment Distribution");
    await page.waitForTimeout(600);
    const read = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("div")].filter(
        (d) =>
          /Sentiment Distribution|Sentiment Trend Over Time/.test(d.textContent ?? "") &&
          d.querySelectorAll("svg.recharts-surface").length === 1 &&
          (d.textContent ?? "").length < 90,
      );
      const out: Record<string, number> = {};
      for (const c of cards) {
        const t = (c.textContent ?? "").replace(/\s+/g, " ").slice(0, 24);
        out[t] = c.querySelectorAll(".recharts-cartesian-axis-tick").length;
      }
      return out;
    });
    const distKey = Object.keys(read).find((k) => k.startsWith("Sentiment Distribution"));
    const trendKey = Object.keys(read).find((k) => k.startsWith("Sentiment Trend"));
    // the Distribution: the EMPTY surface — zero axis ticks
    expect(distKey && read[distKey]).toBe(0);
    // the Trend: the -100..100 reference scale — exactly the 5-tick ladder
    expect(trendKey && read[trendKey]).toBe(5);
  });

  // R88-D — the analyticsdashboard cluster does not wrap (the REF's
  // unwrapped flex items-center gap-3) and the subtitle stays one line.
  test("R88-D: the analyticsdashboard actions cluster is unwrapped (the REF-authored overflow)", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/analyticsdashboard");
    await page.waitForSelector("text=Analytics Dashboard");
    const read = await page.evaluate(() => {
      const bar = [...document.querySelectorAll("div")].find(
        (d) =>
          /Last 6 months/.test(d.textContent ?? "") &&
          (d.textContent ?? "").length < 120 &&
          d.querySelectorAll("button").length >= 2,
      );
      if (!bar) return null;
      const cluster = [...bar.children].find((c) =>
        (c.getAttribute("class") ?? "").includes("flex"),
      );
      const sub = [...document.querySelectorAll("p")].find((x) =>
        /Visual overview of key/.test(x.textContent ?? ""),
      );
      return {
        clusterCls: cluster?.getAttribute("class") ?? null,
        wrapped: cluster ? cluster.getBoundingClientRect().height > 48 : null,
        subH: sub ? Math.round(sub.getBoundingClientRect().height) : null,
      };
    });
    expect(read).toBeTruthy();
    if (!read) return;
    expect(read.clusterCls).toContain("flex-nowrap");
    expect(read.wrapped).toBe(false);
    expect(read.subH).toBe(24);
  });

  // R88-E — the attendancedashboard month filter: a type=month input as
  // the FIRST header action (~160px wide), wired to ?month= (superset).
  test("R88-E: the attendancedashboard month input renders first and navigates", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/attendancedashboard");
    // the subtitle anchor is unique + visible ("Attendance Dashboard"
    // also matches the hidden sidebar nav item — the R88-A lesson)
    await page.waitForSelector("text=Daily clock-in/out trends");
    const read = await page.evaluate(() => {
      const hdr = [...document.querySelectorAll("div")].find(
        (d) =>
          /All Departments/.test(d.textContent ?? "") &&
          d.querySelectorAll("button").length >= 1 &&
          (d.textContent ?? "").length < 150 &&
          !/Dashboard/i.test(d.textContent ?? ""),
      );
      if (!hdr) return null;
      const inp = hdr.querySelector("input");
      const kids = [...hdr.querySelectorAll("input, button")];
      return {
        type: inp?.getAttribute("type") ?? null,
        w: inp ? Math.round(inp.getBoundingClientRect().width) : null,
        first: kids[0] === inp,
      };
    });
    expect(read).toBeTruthy();
    if (!read) return;
    expect(read.type).toBe("month");
    expect(read.first).toBe(true);
    expect(Math.abs(Number(read.w) - 160)).toBeLessThanOrEqual(8);
    // the functional round-trip: ?month= re-renders that month's title
    await page.goto("/attendancedashboard?month=2026-01");
    await page.waitForSelector("text=Daily clock-in/out trends");
    await expect(page.locator("body")).toContainText("January 2026");
  });

  // R88-F — the profile glyph family (upload / circle-user / share2).
  test("R88-F: the profile icons — Upload on Change Photo, CircleUser + Share2 tabs", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/profile");
    await page.waitForSelector("text=Change Photo");
    const read = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) =>
        /Change Photo/i.test(b.textContent ?? ""),
      );
      const tabs = [...document.querySelectorAll("[role=tab], button")].filter((t) =>
        /^(General|Social Accounts)$/.test((t.textContent ?? "").trim()),
      );
      const ic = (el: Element | undefined) =>
        el?.querySelector("svg")?.getAttribute("class")?.match(/lucide-[a-z0-9-]+/)?.[0] ?? null;
      return { changePhoto: ic(btn), general: ic(tabs[0]), social: ic(tabs[1]) };
    });
    expect(read.changePhoto).toBe("lucide-upload");
    expect(read.general).toBe("lucide-circle-user");
    expect(read.social).toBe("lucide-share2");
  });

  // R88-G — the chat conversations list is VISIBLE at mobile (the REF's
  // always-on w-80 column beside the pane).
  test("R88-G: the chat conversation list is visible at 390 (no hidden md:flex)", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/chat");
    await page.waitForSelector("text=No conversations yet");
    const read = await page.evaluate(() => {
      const list = [...document.querySelectorAll("div")].find(
        (e) => /w-80/.test(e.getAttribute("class") ?? "") && /Messages/i.test(e.textContent ?? ""),
      );
      if (!list) return null;
      const r = list.getBoundingClientRect();
      return {
        cls: list.getAttribute("class"),
        visible: r.width > 200 && getComputedStyle(list).display !== "none",
        w: Math.round(r.width),
      };
    });
    expect(read).toBeTruthy();
    if (!read) return;
    expect(read.cls).not.toContain("hidden");
    expect(read.cls).toContain("w-80");
    expect(read.visible).toBe(true);
    expect(read.w).toBeGreaterThanOrEqual(300);
  });

  // R88-H — the shiftcalendar table carries the REF's 700px min-width
  // (100px day columns; the one-row toolbar follows from the overflow).
  test("R88-H: the shiftcalendar table min-width is 700px", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/shiftcalendar");
    await page.waitForSelector("text=October 2026");
    const read = await page.evaluate(() => {
      const t = document.querySelector("table");
      if (!t) return null;
      const th = t.querySelector("th");
      return {
        minWidth: (t as HTMLElement).style.minWidth,
        w: Math.round(t.getBoundingClientRect().width),
        colW: th ? Math.round(th.getBoundingClientRect().width) : null,
      };
    });
    expect(read).toBeTruthy();
    if (!read) return;
    expect(read.minWidth).toBe("700px");
    expect(read.w).toBeGreaterThanOrEqual(700);
    expect(read.colW).toBeGreaterThanOrEqual(100);
  });

  // R88-I — the workflowconfigpage empty-state card carries the
  // text-card-foreground token (the r87-I card-family member).
  test("R88-I: the workflowconfigpage empty-state card carries text-card-foreground", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/workflowconfigpage");
    await page.waitForSelector("text=No workflows configured yet");
    const read = await page.evaluate(() => {
      const el = [...document.querySelectorAll("div")].find(
        (e) => /No workflows configured yet\./.test(e.textContent ?? "") && (e.textContent ?? "").length < 90,
      );
      return el?.getAttribute("class") ?? null;
    });
    expect(read).toContain("text-card-foreground");
  });

  // R88-J — the shiftswap stat cards carry the 40px colored tiles with
  // the icon inside (the r49 inline pin retired).
  test("R88-J: the shiftswap stat cards carry the w-10 bg-*-100 icon tiles", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/shiftswap");
    await page.waitForSelector("text=My Requests");
    const read = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("div")].filter(
        (e) => (e.getAttribute("class") ?? "") === "p-4 flex items-center gap-3",
      );
      return cards.slice(0, 4).map((c) => {
        const tile = c.querySelector("div.w-10");
        const svg = c.querySelector("svg");
        return {
          hasTile: !!tile,
          tileCls: tile?.getAttribute("class") ?? null,
          icon: svg?.getAttribute("class")?.match(/lucide-[a-z0-9-]+/)?.[0] ?? null,
        };
      });
    });
    expect(read.length).toBeGreaterThanOrEqual(4);
    expect(read[0]).toEqual({ hasTile: true, tileCls: expect.stringContaining("bg-blue-100"), icon: "lucide-users" });
    expect(read[1]).toEqual({ hasTile: true, tileCls: expect.stringContaining("bg-yellow-100"), icon: "lucide-clock" });
    expect(read[2]).toEqual({ hasTile: true, tileCls: expect.stringContaining("bg-orange-100"), icon: "lucide-calendar" });
    expect(read[3]).toEqual({ hasTile: true, tileCls: expect.stringContaining("bg-green-100"), icon: "lucide-circle-check-big" });
  });

  // R88-K — the tenantsetup hero glyph is Building2 (inside the 64px
  // blue-100 circle wrapper).
  test("R88-K: the tenantsetup hero glyph is Building2", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/tenantsetup");
    await page.waitForSelector("text=Welcome to EonHR");
    const icon = await page.evaluate(() => {
      const el = [...document.querySelectorAll("div")].find(
        (e) => /Welcome to EonHR/.test(e.textContent ?? "") && (e.textContent ?? "").length < 60,
      );
      if (!el) return null;
      const svg = el.querySelector("svg");
      return svg?.getAttribute("class")?.match(/lucide-[a-z0-9-]+/)?.[0] ?? null;
    });
    expect(icon).toBe("lucide-building2");
  });

  // R88-L — the companywall audience filter carries the Users icon in
  // the trigger's value span (the flex items-center gap-2 wrapper).
  test("R88-L: the companywall filter trigger carries the Users glyph", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/companywall");
    await page.waitForSelector("text=All Employees");
    const read = await page.evaluate(() => {
      const sel = [...document.querySelectorAll("button")].find(
        (c) => /All Employees/i.test(c.textContent ?? "") && (c.textContent ?? "").length < 25,
      );
      if (!sel) return null;
      return {
        icons: [...sel.querySelectorAll("svg")].map(
          (s) => s.getAttribute("class")?.match(/lucide-[a-z0-9-]+/)?.[0] ?? null,
        ),
      };
    });
    expect(read).toBeTruthy();
    if (!read) return;
    expect(read.icons).toContain("lucide-users");
    expect(read.icons).toContain("lucide-chevron-down");
  });
});
