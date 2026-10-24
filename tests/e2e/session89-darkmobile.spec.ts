import { expect, test } from "@playwright/test";

// Session 89 — the DARK/RTL mobile-band round (the r88 close-out's named
// frontier: the first cross-side pass over the theme-direction states at
// 390×844). The instrument (r89-theme-mobile-capture/diff + cluster-locate
// + the dark-triage digests + both-sides DOM probes + the 3× stability
// verification) found FIVE clone-authored defects:
//
//   R89-A the attendancedashboard chart tick-font inversion + the mobile
//         Export-button off-canvas chain (the REF's XAxis ticks render at
//         11px — live-verified both themes, 3× stable; the LOC rendered the
//         inherited 16px after the r88-B2 round wrongly retired the 11px
//         pin — its comment claimed the REF computed 16px. The 16px ticks
//         widen the chart min-content 31px (493 vs 462), the page follows
//         (575 vs 544), and the actions row stops wrapping the Export
//         Report button — it lands OFF-CANVAS at x=376 on the 390px
//         viewport: a functional mobile defect. ONE root cause, THREE
//         symptoms)
//   R89-B the analyticsdashboard tick-font inversion (the mirror image:
//         the REF renders ALL ticks there at the inherited 16px; the LOC
//         pins 11px on its three charts — a stale pin)
//   R89-C the requestsettings approver-email input (the REF authors
//         type="text"; the LOC rendered type="email")
//   R89-D the hrassistantchat grid height (the REF's
//         h-[calc(100vh-250px)] applies at ALL widths; the LOC gated it
//         behind lg: — the mobile grid renders 329px vs the REF's 594px)
//   R89-E the profile kicker placement (the REF hoists the mobile kicker
//         OUT of the content column; the LOC renders it inside the
//         max-w-5xl space-y-8 column — the 32px first-child gap offsets
//         the whole page at mobile)
//
// Standing findings (no clone fix): the REF-BROKEN mobile set (hrreports +
// interviewassistant render an EMPTY #root; employeeselfservice +
// employeedetail render an empty shell — below ~640px, theme-independent;
// the LOC's full render is the superset), the theme-variance root cause
// (the PRE_AUTH_EXPERIMENTS per-visitor variant system), the 59th login
// deploy (frontend-config on login + TURNSTILE_LOGIN_ENABLED configured,
// 0 widgets rendered).

const MOBILE = { width: 390, height: 844 };

test.describe("session-89 dark/rtl mobile-band — the remediated surfaces", () => {
  test("R89-A1: the attendancedashboard XAxis ticks render at 11px (the REF's measured font)", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/attendancedashboard");
    await page.waitForSelector("text=Daily clock-in/out trends");
    await page.waitForTimeout(1200); // the chart settles (the recharts measure)
    const font = await page.evaluate(() => {
      const svg = [...document.querySelectorAll(".recharts-responsive-container svg")].find(
        (s) => s.getAttribute("viewBox") && s.querySelectorAll("text").length > 0,
      );
      if (!svg) return null;
      const t = svg.querySelector("text");
      return t ? getComputedStyle(t).fontSize : null;
    });
    expect(font).toBe("11px");
  });

  test("R89-A2: the chart card carries the REF's overflow-x-auto wrapper and the Export button wraps into view", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/attendancedashboard");
    await page.waitForSelector("text=Daily clock-in/out trends");
    await page.waitForTimeout(1200);
    const read = await page.evaluate(() => {
      const chart = document.querySelector(".recharts-responsive-container");
      if (!chart) return { wrapper: null, btnX: null };
      // the REF's authored card body: p-6 pt-0 > div.overflow-x-auto >
      // div.w-full.text-sm > chart
      const p = chart.parentElement;
      const pp = p?.parentElement;
      const wrapper =
        pp && String(pp.className).includes("overflow-x-auto")
          ? String(pp.className)
          : null;
      const btn = [...document.querySelectorAll("button")].find(
        (b) => b.textContent?.trim() === "Export Report",
      );
      return {
        wrapper,
        btnX: btn ? Math.round(btn.getBoundingClientRect().x) : null,
        btnY: btn ? Math.round(btn.getBoundingClientRect().y) : null,
      };
    });
    expect(read.wrapper).toContain("overflow-x-auto");
    // the functional pin: the button wraps onto its own visible row (the
    // REF renders it at x=16 — NOT pushed off-canvas at x≈376)
    expect(read.btnX).not.toBeNull();
    expect(Number(read.btnX)).toBeLessThanOrEqual(40);
    expect(Number(read.btnY)).toBeGreaterThan(180);
  });

  test("R89-B: the analyticsdashboard chart ticks render at the inherited 16px (no stale 11px pin)", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/analyticsdashboard");
    await page.waitForSelector("text=Visual overview of key");
    await page.waitForTimeout(1200);
    const fonts = await page.evaluate(() => {
      const svgs = [...document.querySelectorAll(".recharts-responsive-container svg")].filter(
        (s) => s.getAttribute("viewBox") && s.querySelectorAll("text").length > 0,
      );
      const out: string[] = [];
      for (const s of svgs) {
        for (const t of s.querySelectorAll("text")) out.push(getComputedStyle(t).fontSize);
      }
      return out;
    });
    expect(fonts.length).toBeGreaterThan(0);
    // the REF renders EVERY tick on this page at the inherited 16px
    expect(new Set(fonts)).toEqual(new Set(["16px"]));
  });

  test("R89-C: the requestsettings approver-email input is the REF's type=text", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/requestsettings");
    await page.waitForSelector("text=Approval Workflow");
    const type = await page.evaluate(() => {
      const i = [...document.querySelectorAll("input")].find(
        (x) => x.placeholder === "Approver email",
      );
      return i?.type ?? null;
    });
    expect(type).toBe("text");
  });

  test("R89-D: the hrassistantchat grid keeps the fixed height at mobile (the unconditional calc)", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/hrassistantchat");
    // the unique VISIBLE anchor ("text=HR Assistant" resolves to the hidden
    // sidebar's "AI HR Assistant" span first — the R88 selector lesson)
    await page.waitForSelector("button:has-text('New Chat')");
    await page.waitForTimeout(800);
    const read = await page.evaluate(() => {
      const g = [...document.querySelectorAll("main .grid")].find((x) =>
        String(x.className).includes("grid-cols-4"),
      );
      if (!g) return null;
      return {
        h: Math.round(g.getBoundingClientRect().height),
        cls: String(g.className),
      };
    });
    expect(read).toBeTruthy();
    if (!read) return;
    // the REF's h-[calc(100vh-250px)] applies at ALL widths — at 844 tall
    // the grid must be ~594, not the natural ~329
    expect(Number(read.h)).toBeGreaterThan(500);
    expect(read.cls).toContain("h-[calc(100vh-250px)]");
    expect(read.cls).not.toContain("lg:h-");
  });

  test("R89-E: the profile kicker sits outside the content column (the REF's tree, no 32px first-child gap)", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/profile");
    await page.waitForSelector("text=Manage your account");
    const read = await page.evaluate(() => {
      const kicker = [...document.querySelectorAll("div")].find(
        (d) =>
          String(d.className).includes("md:hidden") &&
          String(d.className).includes("sticky"),
      );
      if (!kicker) return null;
      const col = kicker.parentElement?.querySelector(".max-w-5xl") ?? null;
      return {
        parentCls: String(kicker.parentElement?.className ?? ""),
        siblingIsColumn: kicker.nextElementSibling === col || kicker.parentElement === col?.parentElement,
        gap: col
          ? Math.round(
              col.getBoundingClientRect().y -
                (kicker.getBoundingClientRect().y + kicker.getBoundingClientRect().height),
            )
          : null,
      };
    });
    expect(read).toBeTruthy();
    if (!read) return;
    // the REF's tree: p-4 root > [kicker, max-w-5xl > [hero…]] — the
    // kicker is a ROOT child, the column its sibling
    expect(read.parentCls).toContain("p-4");
    expect(read.siblingIsColumn).toBe(true);
    // no space-y-8 first-child gap below the kicker (the 32px offset retired)
    expect(Number(read.gap)).toBeLessThanOrEqual(4);
  });
});
