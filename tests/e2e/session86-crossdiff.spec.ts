import { expect, test } from "@playwright/test";

// Session 86 — the cross-side at-rest pixel-diff round (the r85
// close-out's named frontier: the program's FIRST REF↔LOC pixel
// comparison at scale, extending the focused-pair instrument class
// that caught the platform badge + the logo derivative to the full
// standing route set). The instrument (r86-crossdiff-capture/diff/
// triage) found FIVE clone-authored visual defects — every one
// per-side BYTE-STABLE against the r85 baselines (long-standing
// deltas invisible to the per-side byte chains, which compare each
// side against ITSELF across rounds):
//
//   R86-A the payrollreports page's FIVE-member structural divergence
//        (296 differing cells, nearly the whole content column):
//        A1 the thead-level table-header typography (REF
//           `bg-slate-50 text-slate-600 text-xs uppercase` on the
//           THEAD, 12px/700/UPPERCASE th's, the header row h40; the
//           LOC rode the table's text-sm → 14px Title-case, h44)
//        A2 the +24px container offset — a NEW TW-v4 trap class: the
//           REF's v3-style space-y puts margin-TOP on sibling
//           children; with the container's FIRST child the md:hidden
//           mobile sticky header (display:none at desktop), the
//           SECOND child (the desktop header row) carries mt24 which
//           COLLAPSES out of the padding-less container → the whole
//           container sits 24px lower (y56 vs y32). TW-v4's space-y
//           compiles to margin-block-end on :not(:last-child) — no
//           first-child margin-top, no collapse. Fixed with mt-6 on
//           the PageHeader's desktop row (inert at mobile where the
//           row is display:none and the REF has no offset either).
//        A3 the summary-card header row's extra border-b (REF:
//           `flex flex-col space-y-1.5 p-6 pb-3`, borderless)
//        A4 the stats section (REF: CardContent p-0 + the grid itself
//           `grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-b
//           border-slate-100` + `bg-slate-50 rounded-lg p-3` cells
//           with DIV children; the LOC: CardContent p-6 + a mb-6 grid
//           + bare cells with P children — the grid renders h48 vs
//           the REF's h105)
//   R86-B the payroll toolbar's month filter defaulting EMPTY (the
//        REF pre-fills the current period — "October 2026")
//   R86-C the settings tab icons (Company: Building2 → the gear
//        `Settings`; Approval Workflows: Workflow →
//        `CircleCheckBig` — path-data-verified against the REF's
//        rendered svgs)
//   R86-D the training empty-state icon (GraduationCap → the video
//        camera `Video` — path-data-verified)
//   R86-E the assetmanagement Actions th rendering text-RIGHT (the
//        REF is text-left; the page's `className="text-right"`
//        override dropped)
//
// The data-driven clusters (no action, classified): employees
// (the REF's emptied tenant vs the seeded LOC card), recruitment
// (the REF's 1 job posting vs the documented 0-job seed), attendance
// (the REF's role-restricted view for its non-Admin user vs the
// LOC admin's overview — the r81-classified role-scoped state),
// login (the r85 logo subpixel residual), dashboard (2-cell
// sidebar AA noise, maxdelta 7).

test.describe("session-86 cross-side at-rest pixel-diff — the remediated routes", () => {
  // R86-A1 — the payrollreports table-header typography lives on the
  // THEAD (inherited by the th's), not on the table's text-sm.
  test("R86-A1: the payrollreports thead carries the 12px uppercase typography (the header row at h40)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/payrollreports");
    await page.waitForSelector("table thead tr th");
    const read = await page.evaluate(() => {
      const thead = document.querySelector("table thead");
      const th = thead?.querySelector("th");
      const tr = th?.closest("tr");
      if (!thead || !th || !tr) return null;
      const cs = getComputedStyle(th);
      const trr = tr.getBoundingClientRect();
      return {
        theadCls: thead.className,
        thFs: cs.fontSize,
        thTt: cs.textTransform,
        thFw: cs.fontWeight,
        thColor: cs.color,
        rowH: Math.round(trr.height),
      };
    });
    expect(read).not.toBeNull();
    // REF-measured: the thead class set + the computed 12px/700/UPPERCASE
    // th's (text-slate-600) + the 40px header row (12px line-height +
    // py-3 x2). Pre-fix: 14px/none + h44.
    expect(read!.theadCls).toContain("text-xs");
    expect(read!.theadCls).toContain("uppercase");
    expect(read!.theadCls).toContain("text-slate-600");
    expect(read!.thFs).toBe("12px");
    expect(read!.thTt).toBe("uppercase");
    expect(read!.thFw).toBe("700");
    expect(read!.thColor).toBe("rgb(71, 85, 105)");
    expect(read!.rowH).toBe(40);
  });

  // R86-A2 — the space-y margin-collapse trap: the desktop header row
  // (the container's 2nd child, first RENDERED child at desktop) must
  // carry mt-6 so the margin collapses out of the padding-less
  // container exactly as the REF's v3-style space-y produces.
  test("R86-A2: the payrollreports desktop header row carries mt-6 (the container's +24px collapse offset)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/payrollreports");
    await page.waitForSelector(".max-w-7xl");
    const read = await page.evaluate(() => {
      const container = [...document.querySelectorAll("div")].find((d) =>
        (d.className || "").toString().includes("max-w-7xl")
      );
      if (!container) return null;
      const desktopRow = [...container.children].find(
        (c) => (c.className || "").toString().includes("md:flex")
      );
      if (!desktopRow) return null;
      const cs = getComputedStyle(desktopRow);
      const cr = container.getBoundingClientRect();
      const wrapper = container.parentElement;
      const wr = wrapper ? wrapper.getBoundingClientRect() : null;
      const wcs = wrapper ? getComputedStyle(wrapper) : null;
      return {
        rowMt: cs.marginTop,
        containerY: Math.round(cr.y),
        wrapperPadTop: wcs ? wcs.paddingTop : null,
        wrapperY: wr ? Math.round(wr.y) : null,
      };
    });
    expect(read).not.toBeNull();
    // REF-measured: the desktop row mt24 → collapses through the
    // padding-less container → the container at wrapper.y + 32 (pad)
    // + 24 (collapsed margin) = y56. Pre-fix: mt0, container y32.
    expect(read!.rowMt).toBe("24px");
    expect(read!.wrapperPadTop).toBe("32px");
    expect(read!.containerY).toBe(
      read!.wrapperY! + 32 + 24
    );
  });

  // R86-A3/A4 — the summary-card structure: the borderless header row,
  // the p-0 body, the grid carrying its own padding+border, and the
  // boxed stat cells with DIV children.
  test("R86-A3/A4: the payrollreports summary card matches the REF recipe (borderless header, p-0 body, boxed stat cells)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/payrollreports");
    await page.waitForSelector("table thead tr th");
    const read = await page.evaluate(() => {
      const card = [...document.querySelectorAll("[class*=bg-card]")].filter((c) =>
        /Monthly Payroll Summary/i.test(c.textContent || "")
      )[0];
      if (!card) return null;
      const header = card.children[0] as HTMLElement;
      const body = card.children[1] as HTMLElement;
      const grid = body.querySelector("[class*=grid]");
      const cell = grid ? (grid.children[0] as HTMLElement) : null;
      return {
        headerCls: header.className,
        headerBorderBottom: getComputedStyle(header).borderBottomWidth,
        bodyCls: body.className,
        gridCls: grid ? grid.className : null,
        gridH: grid ? Math.round(grid.getBoundingClientRect().height) : 0,
        cellCls: cell ? cell.className : null,
        cellChildTags: cell ? [...cell.children].map((c) => c.tagName.toLowerCase()) : [],
      };
    });
    expect(read).not.toBeNull();
    // REF-measured recipes.
    expect(read!.headerCls).toBe("flex flex-col space-y-1.5 p-6 pb-3");
    expect(read!.headerBorderBottom).toBe("0px");
    expect(read!.bodyCls).toBe("p-0");
    expect(read!.gridCls).toContain("p-4");
    expect(read!.gridCls).toContain("border-b");
    expect(read!.gridCls).toContain("border-slate-100");
    expect(read!.gridCls).toContain("md:grid-cols-4");
    expect(read!.cellCls).toBe("bg-slate-50 rounded-lg p-3");
    expect(read!.cellChildTags).toEqual(["div", "div"]);
    // the REF's boxed stat cells render the grid at h105 (the bare
    // pre-fix cells rendered h48)
    expect(read!.gridH).toBeGreaterThan(90);
  });

  // R86-B — the payroll toolbar's month filter pre-fills the current
  // period (the REF renders "October 2026" — value="2026-10").
  test("R86-B: the payroll month filter defaults to the current period", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/payroll");
    await page.waitForSelector("input[type=month]");
    const read = await page.evaluate(() => {
      const inp = document.querySelector("input[type=month]") as HTMLInputElement | null;
      if (!inp) return null;
      const now = new Date();
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      return { value: inp.value, expected };
    });
    expect(read).not.toBeNull();
    expect(read!.value).toBe(read!.expected);
  });

  // R86-C — the settings tab icons: path-data signatures.
  test("R86-C: the settings tabs carry the REF icons (Company=Settings gear, Approval Workflows=CircleCheckBig)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/settings");
    await page.waitForSelector("[role=tablist] [role=tab]");
    const read = await page.evaluate(() => {
      const tabs = [...document.querySelectorAll("[role=tablist] [role=tab]")];
      const sig = (label: string) => {
        const tab = tabs.find((t) => (t.textContent || "").trim().startsWith(label));
        if (!tab) return null;
        const svg = tab.querySelector("svg");
        if (!svg) return null;
        // the first path's d signature (the distinctive member)
        const firstPath = svg.querySelector("path");
        return firstPath ? firstPath.getAttribute("d")?.slice(0, 24) ?? null : null;
      };
      return { company: sig("Company"), workflows: sig("Approval Workflows") };
    });
    expect(read).not.toBeNull();
    // REF-measured path signatures: the Settings gear starts
    // "M12.22 2h-.44a2 2 0 0 0-2 2…"; CircleCheckBig starts
    // "M21.801 10A10 10 0 1 1 17 3.335".
    expect(read!.company).toBe("M12.22 2h-.44a2 2 0 0 0-");
    expect(read!.workflows).toBe("M21.801 10A10 10 0 1 1 1");
  });

  // R86-D — the training empty-state icon: the Video camera signature.
  test("R86-D: the training empty-state icon is the Video camera", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/training");
    await page.waitForTimeout(800);
    const read = await page.evaluate(() => {
      const svgs = [...document.querySelectorAll("svg")].filter((s) => {
        const r = s.getBoundingClientRect();
        return r.width > 40 && r.width < 80;
      });
      if (!svgs.length) return null;
      const firstPath = svgs[0].querySelector("path");
      return firstPath ? firstPath.getAttribute("d")?.slice(0, 24) ?? null : null;
    });
    expect(read).not.toBeNull();
    // REF-measured: the lucide Video camera starts
    // "m16 13 5.223 3.482a.5.5 0 0 0…". Pre-fix: GraduationCap
    // ("M21.42 10.922a1 1 0 0 0-.01…").
    expect(read).toBe("m16 13 5.223 3.482a.5.5 ");
  });

  // R86-E — the assetmanagement Actions th renders text-left.
  test("R86-E: the assetmanagement Actions column header is text-left", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/assetmanagement");
    await page.waitForSelector("table th");
    const read = await page.evaluate(() => {
      const th = [...document.querySelectorAll("th")].find(
        (t) => (t.textContent || "").trim() === "Actions"
      );
      if (!th) return null;
      const cs = getComputedStyle(th);
      const r = th.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(th);
      const tb = range.getBoundingClientRect();
      return {
        ta: cs.textAlign,
        cls: th.className,
        thX: Math.round(r.x),
        textX: Math.round(tb.x),
      };
    });
    expect(read).not.toBeNull();
    // REF-measured: text-left, the text inset at the 16px padding
    // (textX = thX + 16). Pre-fix: text-right (textX flush right).
    expect(read!.ta).toBe("left");
    expect(read!.textX).toBe(read!.thX + 16);
  });

  // R86-F — the payroll header's "Reports & Export" button icon: the
  // bar chart (ChartColumn), path-data-verified.
  test("R86-F: the payroll Reports & Export button carries the ChartColumn bar chart", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/payroll");
    await page.waitForSelector('button:has-text("Reports & Export")');
    const read = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) =>
        (b.textContent || "").includes("Reports & Export")
      );
      if (!btn) return null;
      const svg = btn.querySelector("svg");
      const firstPath = svg ? svg.querySelector("path") : null;
      return firstPath ? firstPath.getAttribute("d")?.slice(0, 24) ?? null : null;
    });
    expect(read).not.toBeNull();
    // REF-measured: the ChartColumn signature "M3 3v16a2 2 0 0 0 2 2h16…".
    // Pre-fix: the FileDown download glyph.
    expect(read).toBe("M3 3v16a2 2 0 0 0 2 2h16");
  });

  // R86-G — the settings Company tab's Edit button icon: the square
  // pen (SquarePen), path-data-verified.
  test("R86-G: the settings Edit button carries the SquarePen icon", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/settings");
    await page.waitForSelector('button:has-text("Edit")');
    const read = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find(
        (b) => (b.textContent || "").trim() === "Edit"
      );
      if (!btn) return null;
      const svg = btn.querySelector("svg");
      const firstPath = svg ? svg.querySelector("path") : null;
      return firstPath ? firstPath.getAttribute("d")?.slice(0, 24) ?? null : null;
    });
    expect(read).not.toBeNull();
    // REF-measured: the SquarePen signature "M12 3H5a2 2 0 0 0-2 2v14…".
    // Pre-fix: the Pencil glyph ("M21.174 6.812…").
    expect(read).toBe("M12 3H5a2 2 0 0 0-2 2v14");
  });
});
