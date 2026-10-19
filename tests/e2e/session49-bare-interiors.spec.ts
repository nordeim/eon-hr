import { expect, test } from "@playwright/test";

/**
 * Session 49 (parity round 48) — the bare interiors + the header
 * architecture.
 *
 * The round's census (probe-r49-*.mjs, live REF @1440×900 vs the
 * zero-tenant :3201 clone): REF renders the hero block CLASSLESS on
 * every measured page, the BARE family (15 pages) renders NO hero row,
 * the always-row families are UNPREFIXED, single actions ride the row
 * directly, the chart family renders dual-direction gridlines, and the
 * C pages carry fresh per-page contracts. The round also ships the
 * WORKING avatar upload (the functional superset over REF's inert
 * button) — E2E-pinned here with a real file upload.
 */
test.describe("session-49 bare interiors", () => {
  test("R48-A1: the bare family — organogram's hero renders as a DIRECT text-center child of the content wrapper (no hero row)", async ({ page }) => {
    await page.goto("/organogram");
    await expect(page.getByRole("heading", { name: "Organogram" })).toBeVisible();
    const info = await page.evaluate(() => {
      const h1 = [...document.querySelectorAll("h1")].find((h) => h.textContent?.trim() === "Organogram");
      if (!h1) return null;
      const block = h1.parentElement as HTMLElement;
      const wrap = block.parentElement as HTMLElement;
      return { blockCls: block.className, wrapCls: wrap.className, rowCls: wrap.parentElement?.className ?? null };
    });
    expect(info).toBeTruthy();
    expect(info!.blockCls.trim()).toBe("text-center");
    expect(info!.wrapCls).toContain("max-w-full mx-auto space-y-8");
  });

  test("R48-A2: securitysettings' bare hero block is CLASSLESS (no min-w-0, no row wrapper)", async ({ page }) => {
    await page.goto("/securitysettings");
    await expect(page.getByRole("heading", { name: "Security Settings" })).toBeVisible();
    const info = await page.evaluate(() => {
      const h1 = [...document.querySelectorAll("h1")].find((h) => h.textContent?.trim() === "Security Settings");
      if (!h1) return null;
      const block = h1.parentElement as HTMLElement;
      return { blockCls: block.className, wrapCls: (block.parentElement as HTMLElement).className };
    });
    expect(info).toBeTruthy();
    expect(info!.blockCls.trim()).toBe("");
    expect(info!.wrapCls).toContain("max-w-4xl mx-auto space-y-8");
  });

  test("R48-A3: hrreports' header is the UNPREFIXED center always-row with the BARE flex gap-2 cluster", async ({ page }) => {
    await page.goto("/hrreports");
    await expect(page.getByRole("heading", { name: "HR Reports & Analytics" })).toBeVisible();
    const info = await page.evaluate(() => {
      const h1 = [...document.querySelectorAll("h1")].find((h) => h.textContent?.includes("HR Reports"));
      if (!h1) return null;
      const block = h1.parentElement as HTMLElement;
      const row = block.parentElement as HTMLElement;
      const cluster = row.querySelector("div.flex.gap-2");
      return { rowCls: row.className, clusterCls: cluster ? cluster.className : null };
    });
    expect(info).toBeTruthy();
    expect(info!.rowCls).toContain("flex");
    expect(info!.rowCls).toContain("justify-between");
    expect(info!.rowCls).toContain("items-center");
    expect(info!.rowCls).not.toContain("flex-col");
    expect(info!.rowCls).not.toContain("md:flex-row");
    expect(info!.clusterCls).toContain("flex gap-2");
    expect(info!.clusterCls).not.toContain("flex-wrap");
  });

  test("R48-A3b: assets' header is the always-start row with the Add Asset button DIRECTLY in the row (unwrapped)", async ({ page }) => {
    await page.goto("/assets");
    await expect(page.getByRole("heading", { name: "Assets" })).toBeVisible();
    const info = await page.evaluate(() => {
      const h1 = [...document.querySelectorAll("h1")].find((h) => h.textContent?.trim() === "Assets");
      if (!h1) return null;
      const block = h1.parentElement as HTMLElement;
      const row = block.parentElement as HTMLElement;
      const btn = row.querySelector("button");
      return {
        rowCls: row.className,
        btnDirect: btn ? btn.parentElement === row : false,
        btnText: btn ? btn.textContent : null,
      };
    });
    expect(info).toBeTruthy();
    expect(info!.rowCls.replace(/\s+/g, " ")).toBe("flex justify-between items-start");
    expect(info!.btnDirect).toBe(true);
    expect(info!.btnText).toContain("Add Asset");
  });

  test("R48-A4: taskmanager's desktop row is the hidden md:flex RESPONSIVE md family", async ({ page }) => {
    await page.goto("/taskmanager");
    await expect(page.getByRole("heading", { name: "Tasks & Projects" })).toBeVisible();
    const rowCls = await page.evaluate(() => {
      const h1s = [...document.querySelectorAll("h1")].filter((h) => {
        const txt = h.textContent?.trim();
        if (txt !== "Tasks & Projects") return false;
        // skip the kicker's copy (it lives inside a md:hidden bar)
        return !h.closest('[class*="md:hidden"]');
      });
      const h1 = h1s[0];
      const block = h1?.parentElement as HTMLElement | null;
      const row = block?.parentElement as HTMLElement | null;
      return row ? row.className.replace(/\s+/g, " ") : null;
    });
    expect(rowCls).toBeTruthy();
    expect(rowCls).toContain("hidden md:flex");
    expect(rowCls).toContain("flex-col");
    expect(rowCls).toContain("md:flex-row");
    expect(rowCls).toContain("items-start");
    expect(rowCls).toContain("md:items-center");
  });

  test("R48-C1: interviewassistant renders the two-card grid (Select Candidate + Interview Notes)", async ({ page }) => {
    await page.goto("/interviewassistant");
    await expect(page.getByRole("heading", { name: "Interview Assistant" })).toBeVisible();
    const grid = page.locator("div.grid.lg\\:grid-cols-2").first();
    await expect(grid).toBeVisible();
    await expect(page.getByText("Select Candidate", { exact: true })).toBeVisible();
    await expect(page.getByText("Interview Notes", { exact: true })).toBeVisible();
    await expect(page.locator("label[for=ia-candidate]")).toHaveText("Candidate");
    await expect(page.locator("label[for=ia-notes]")).toHaveText("Notes");
  });

  test("R48-C2: securitysettings — the circle-alert alert card with the H3 title + the slate DIV badges + the old-form checkbox", async ({ page }) => {
    await page.goto("/securitysettings");
    await expect(page.getByRole("heading", { name: "Security Configuration Required" })).toBeVisible();
    const h3cls = await page.locator("h3").first().getAttribute("class");
    expect(h3cls).toContain("text-lg font-semibold text-orange-900");
    const cb = page.locator("[role=checkbox]").first();
    const cbCls = await cb.getAttribute("class");
    /* Session 62 amendment (R62-B): the border member moved to the
       literal pair border-[#171717] dark:border-[#fafafa] — REF's
       checkbox border rides ITS flipping --primary token (both themes
       live-measured in the r62 border census); the clone's --primary
       is the documented nav-blue repurposing. */
    expect(cbCls).toContain("border border-[#171717] dark:border-[#fafafa] shadow");
    expect(cbCls).not.toContain("border border-primary");
    expect(cbCls).toContain("focus-visible:ring-1");
    expect(cbCls).not.toContain("data-[state=checked]:border-primary");
    const badge = page.locator("div.inline-flex.items-center.rounded-md").first();
    await expect(badge).toHaveText("Disabled");
    const badgeCls = await badge.getAttribute("class");
    expect(badgeCls).toContain("bg-slate-100 text-slate-700");
    expect(badgeCls).toContain("font-semibold");
  });

  test("R48-C3: payrollreports — the kicker back button + the 4 Radix panels + the bare Monthly th + the WhatsApp text-white", async ({ page }) => {
    await page.goto("/payrollreports");
    await expect(page.getByRole("heading", { name: "Payroll Reports" }).first()).toBeVisible();
    // the kicker (md:hidden) carries the back button — rendered as an
    // ANCHOR (Button asChild + Link), so the query targets the kicker's a
    const kickBack = page.locator("div.md\\:hidden.sticky a").first();
    const kickBtnCls = await kickBack.getAttribute("class");
    expect(kickBtnCls).toContain("h-9 w-9 select-none");
    // all four panels mount (Radix TabsContent)
    const panelCount = await page.locator("[role=tabpanel]").count();
    expect(panelCount).toBe(4);
    // the Monthly table's bare th family
    const th = page.locator("table thead th").first();
    const thCls = await th.getAttribute("class");
    expect(thCls!.replace(/\s+/g, " ")).toBe("px-4 py-3 text-left");
    // the WhatsApp CTA renders text-white (not the primary-foreground token)
    const wa = page.getByRole("button", { name: "Send Payslips via WhatsApp" }).first();
    const waCls = await wa.getAttribute("class");
    expect(waCls).toContain("text-white");
    expect(waCls).not.toContain("text-primary-foreground");
    // the full-width mobile copy sits in a md:hidden div
    const mobileWa = page.locator("div.md\\:hidden:not([class*=sticky]) button");
    await expect(mobileWa.first()).toBeAttached();
  });

  test("R48-C5: hrreports' form labels render the Label-component form (font-medium peer-disabled pair + text-xs — member-wise, leading-none collapsed by twMerge)", async ({ page }) => {
    await page.goto("/hrreports");
    await expect(page.getByRole("heading", { name: "HR Reports & Analytics" })).toBeVisible();
    const label = page.locator("label[for=hr-source]");
    const cls = (await label.getAttribute("class"))!.replace(/\s+/g, " ");
    expect(cls).toContain("font-medium");
    expect(cls).toContain("peer-disabled:cursor-not-allowed");
    expect(cls).toContain("peer-disabled:opacity-70");
    expect(cls).toContain("text-xs text-slate-500");
    // tailwind-merge collapses leading-none under the later text-xs —
    // the rendered truth (the TW v4 lesson, pinned)
    expect(cls).not.toContain("leading-none");
  });

  test("R48-C6: evaluations — the value-in-tile stats + the Radix-verbatim panels", async ({ page }) => {
    await page.goto("/evaluations");
    await expect(page.getByRole("heading", { name: "360° Evaluations & Appraisals" })).toBeVisible();
    const tile = page.locator("div.w-10.h-10.rounded-xl.bg-slate-100").first();
    await expect(tile).toBeVisible();
    await expect(tile.locator("span")).toHaveText("0");
    const panel = page.locator("[role=tabpanel]").first();
    const panelCls = (await panel.getAttribute("class"))!.replace(/\s+/g, " ");
    expect(panelCls).toContain("ring-offset-background");
    expect(panelCls).toContain("space-y-6");
  });

  test("R48-C7: requestreports — the horizontal-bare stats (tile + P/P pair) + the pb-2 pr-4 th family", async ({ page }) => {
    await page.goto("/requestreports");
    await expect(page.getByRole("heading", { name: "Request Reports" })).toBeVisible();
    const card = page.locator("div.grid.md\\:grid-cols-4 > div").first();
    const cls = (await card.getAttribute("class"))!.replace(/\s+/g, " ");
    expect(cls).toContain("rounded-xl border bg-card text-card-foreground shadow");
    expect(cls).not.toContain("border-slate-200");
    const inner = await card.evaluate((el) => {
      const row = el.querySelector("div.p-4") as HTMLElement | null;
      const tile = row?.querySelector("div.w-10") as HTMLElement | null;
      const ps = row ? [...row.querySelectorAll("p")].map((p) => (p as HTMLElement).className) : [];
      return { rowCls: row?.className ?? null, tileCls: tile?.className ?? null, ps };
    });
    expect(inner.rowCls).toContain("flex items-center gap-3");
    expect(inner.tileCls).toContain("w-10 h-10 rounded-lg");
    expect(inner.ps[0]).toContain("text-2xl font-bold text-slate-900");
    expect(inner.ps[1]).toContain("text-xs text-slate-500");
    const th = page.locator("table thead th").first();
    expect((await th.getAttribute("class"))!.replace(/\s+/g, " ")).toBe("pb-2 pr-4");
  });

  test("R48-C8: analytics — the BARE root (no gradient canvas) with the verbatim max-w-7xl wrapper", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page.getByRole("heading", { name: "Analytics Dashboard" })).toBeVisible();
    const info = await page.evaluate(() => {
      const main = document.querySelector("main");
      const sc = main?.querySelector("div.overflow-auto, div.overflow-y-auto") ?? main;
      const root = sc?.firstElementChild as HTMLElement | null;
      const wrap = root?.firstElementChild as HTMLElement | null;
      return { rootCls: root?.className ?? null, wrapCls: wrap?.className ?? null };
    });
    expect(info.rootCls!.replace(/\s+/g, " ")).toBe("p-4 md:p-8");
    expect(info.wrapCls).toContain("max-w-7xl mx-auto space-y-8");
  });

  test("R48-E: the chart family renders DUAL-direction gridlines (attendancedashboard)", async ({ page }) => {
    await page.goto("/attendancedashboard");
    await expect(page.getByRole("heading", { name: "Attendance Dashboard" })).toBeVisible();
    const grids = await page.evaluate(() => ({
      h: document.querySelectorAll("g.recharts-cartesian-grid-horizontal line").length,
      v: document.querySelectorAll("g.recharts-cartesian-grid-vertical line").length,
    }));
    expect(grids.h).toBeGreaterThan(0);
    expect(grids.v).toBeGreaterThan(0);
  });

  test("R48-G1: profile carries NO stray wrap-level icon-only footer", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Profile Settings" })).toBeVisible();
    const stray = await page.evaluate(() => {
      const h1 = [...document.querySelectorAll("h1")].find((h) => h.textContent?.includes("Profile Settings"));
      const wrap = h1?.parentElement?.parentElement as HTMLElement | null;
      if (!wrap) return null;
      return [...wrap.children].map((c) => (c as HTMLElement).className).join(" | ");
    });
    expect(stray).not.toContain("text-xs text-muted-foreground");
  });

  test("R48-F1: the avatar upload WORKS — pick a file, the 96px canvas POSTs, the avatar swaps in (the functional superset)", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Profile Settings" })).toBeVisible();
    // a tiny 8x8 red PNG
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFklEQVR4nGP8z8Dwn4EIwESMolGFI0chAG+bAR85cT5jAAAAAElFTkSuQmCC",
      "base64"
    );
    await page.setInputFiles("#avatar", {
      name: "avatar.png",
      mimeType: "image/png",
      buffer: png,
    });
    // the optimistic swap: the AvatarImage <img> appears inside the 96px circle
    const circle = page.locator("div.w-24.h-24").first();
    await expect(circle.locator("img")).toBeVisible({ timeout: 15_000 });
    const src = await circle.locator("img").getAttribute("src");
    expect(src).toMatch(/^data:image\/jpeg;base64,/);
    // a toast confirms
    await expect(page.getByText("Photo updated")).toBeVisible({ timeout: 10_000 });
  });
});
