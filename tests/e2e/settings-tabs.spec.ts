import { expect, test } from "@playwright/test";

/**
 * Session 36 (R35-E): the settings tab interiors — round 13 pinned only
 * the tab strip + the Company card; the six non-Company tab bodies were
 * never inventoried. This round measured them all (see
 * docs/remediation-plan-session36.md).
 *
 * REF ground truth (at 1440×900, zero data):
 *  - every tab: the title-only border-b header (16px leading-none DIV)
 *  - Workflows / Shifts: the 48px slate-300 icon + the single 16px
 *    slate-500 line ("No workflows configured" / "No shifts configured")
 *  - Departments: the h-9 dark Add button + the two-line P empty
 *  - Integrations: FOUR text-chip tiles (WhatsApp/SMS/Email/ZKT), Email
 *    carrying the Active badge
 *  - Theme: the three color fields + preview + Menu Position + collapse
 *    checkboxes + the Save Theme header button
 *  - System Logs: the five-field filter grid + Clear Filters + the
 *    "No logs found matching your filters" line
 */
test.describe("settings tab interiors (session 36)", () => {
  test("workflows + shifts + departments render REF's empty recipes", async ({ page }) => {
    await page.goto("/settings");

    await page.getByRole("tab", { name: "Approval Workflows" }).click();
    await expect(page.getByText("No workflows configured")).toBeVisible();
    const wf = await page.evaluate(() => {
      const card = Array.from(document.querySelectorAll("main .rounded-xl")).find(
        (c) => c.textContent?.includes("No workflows configured")
      )!;
      const icon = card.querySelector("svg[class*='text-slate-300']")!;
      const p = Array.from(card.querySelectorAll("p")).find((x) => /No workflows/.test(x.textContent!))!;
      return {
        iconW: Math.round(icon.getBoundingClientRect().width),
        pColor: getComputedStyle(p).color,
        pSize: getComputedStyle(p).fontSize,
        secondLine: Array.from(card.querySelectorAll("p")).filter((x) => /Set up a workflow/.test(x.textContent!)).length,
      };
    });
    expect(wf.iconW).toBe(48);
    expect(wf.pColor).toBe("rgb(100, 116, 139)"); // slate-500
    expect(wf.pSize).toBe("16px");
    expect(wf.secondLine).toBe(0);

    await page.getByRole("tab", { name: "Shifts" }).click();
    await expect(page.getByText("No shifts configured")).toBeVisible();
    await expect(page.getByText("Work Shifts", { exact: true })).toBeVisible();

    await page.getByRole("tab", { name: "Departments" }).click();
    await expect(page.getByText("No departments yet")).toBeVisible();
    await expect(page.getByText(/Click "Add Department" to create your first department/)).toBeVisible();
    const addBtn = page.getByRole("button", { name: "Add Department" });
    await expect(addBtn).toBeVisible();
    const addH = (await addBtn.boundingBox())?.height;
    expect(addH).toBe(36); // REF's h-9 dark Add (the clone's size-sm was 32)
  });

  test("integrations renders REF's four text-chip tiles with the Active badge", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("tab", { name: "Integrations" }).click();

    for (const name of ["WhatsApp Integration", "SMS Gateway", "Email Service", "ZKT BioTime Cloud"]) {
      await expect(page.getByText(name, { exact: true })).toBeVisible();
    }
    const geo = await page.evaluate(() => {
      const chips = Array.from(document.querySelectorAll("main .grid > div > div > div"))
        .filter((d) => /^WASMS@ZKT$/.test(d.textContent?.trim() ?? "") === false)
        .filter((d) => ["WA", "SMS", "@", "ZKT"].includes(d.textContent?.trim() ?? ""));
      const badge = Array.from(document.querySelectorAll("main span")).find((s) => s.textContent?.trim() === "Active");
      const bcs = badge ? getComputedStyle(badge) : null;
      return {
        chipCount: chips.length,
        chipTexts: chips.map((c) => c.textContent?.trim()),
        badgeColor: bcs?.color,
        badgeBg: bcs?.backgroundColor,
      };
    });
    expect(geo.chipCount).toBe(4);
    expect(geo.chipTexts).toEqual(["WA", "SMS", "@", "ZKT"]);
    expect(geo.badgeColor).toBe("rgb(21, 128, 61)"); // green-700
    expect(geo.badgeBg).toBe("rgb(220, 252, 231)"); // green-100
  });

  test("theme renders the real form (colors + preview + layout settings)", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("tab", { name: "Theme & Layout" }).click();

    await expect(page.getByText("Theme & Layout Settings")).toBeVisible();
    await expect(page.getByRole("button", { name: "Save Theme" })).toBeVisible();
    await expect(page.getByText("Colors", { exact: true })).toBeVisible();
    await expect(page.getByText("Preview:", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Layout Settings" })).toBeVisible();
    await expect(page.getByText("Allow sidebar to collapse")).toBeVisible();
    await expect(page.getByText("Start with sidebar collapsed")).toBeVisible();

    const geo = await page.evaluate(() => {
      const colors = Array.from(document.querySelectorAll('input[type="color"]'));
      const swatches = Array.from(document.querySelectorAll("main .bg-slate-50 .w-20"));
      return {
        colorCount: colors.length,
        values: colors.map((c) => (c as HTMLInputElement).value),
        swatchCount: swatches.length,
      };
    });
    expect(geo.colorCount).toBe(3);
    expect(geo.values).toEqual(["#1877f2", "#42b72a", "#e4e6eb"]);
    expect(geo.swatchCount).toBe(3);
  });

  test("system logs renders the filter shell + the empty line", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("tab", { name: "System Logs" }).click();

    await expect(page.getByText("System Audit Logs")).toBeVisible();
    // The counter always renders — the persistent e2e DB may carry audit
    // logs from earlier CRUD round-trips, so assert the format, then the
    // matching empty/table state.
    await expect(page.getByText(/\d+ total logs/)).toBeVisible();

    const geo = await page.evaluate(() => {
      const card = Array.from(document.querySelectorAll("main .rounded-xl")).find((c) =>
        c.textContent?.includes("System Audit Logs")
      )!;
      const labels = Array.from(card.querySelectorAll("label"))
        .map((l) => l.textContent?.trim())
        .filter(Boolean);
      const clear = Array.from(card.querySelectorAll("button")).find((b) => b.textContent?.trim() === "Clear Filters")!;
      const emptyP = Array.from(card.querySelectorAll("p")).find((p) => /No logs found/.test(p.textContent!));
      const rowCount = card.querySelectorAll("tbody tr").length;
      return {
        labels,
        clearH: Math.round(clear.getBoundingClientRect().height),
        hasEmptyLine: emptyP !== undefined && emptyP !== null,
        emptyColor: emptyP ? getComputedStyle(emptyP).color : null,
        rowCount,
      };
    });
    expect(geo.labels).toEqual(["Search", "User", "Action", "From Date", "To Date"]);
    expect(geo.clearH).toBe(32);
    // Zero logs → the empty line at slate-500; with logs → the table.
    if (geo.hasEmptyLine) {
      expect(geo.emptyColor).toBe("rgb(100, 116, 139)"); // slate-500
      expect(geo.rowCount).toBe(0);
    } else {
      expect(geo.rowCount).toBeGreaterThan(0);
    }
  });
});

/**
 * Session 36 (R35-F): the live-verification amendments — the re-measure
 * found what the census missed: the header action buttons on Workflows +
 * Shifts, the Create Approval Workflow + Add Shift dialogs, the Quick
 * Presets cards, the Save Theme icon, and the Logs slate-50 island.
 */
test.describe("settings tab actions (session 36, R35-F)", () => {
  test("the four header actions render REF's dark solid (rgb(23,23,23) + white)", async ({ page }) => {
    await page.goto("/settings");

    for (const [tab, label] of [
      ["Approval Workflows", "Add Workflow"],
      ["Shifts", "Add Shift"],
      ["Departments", "Add Department"],
      ["Theme & Layout", "Save Theme"],
    ] as const) {
      await page.getByRole("tab", { name: tab }).click();
      const btn = page.getByRole("button", { name: label });
      await expect(btn).toBeVisible();
      const geo = await btn.evaluate((b: HTMLElement) => {
        const cs = getComputedStyle(b);
        const r = b.getBoundingClientRect();
        const svg = b.querySelector("svg");
        return {
          bg: cs.backgroundColor,
          color: cs.color,
          h: Math.round(r.height),
          hasIcon: !!svg,
          iconMr: svg ? getComputedStyle(svg).marginRight : null,
        };
      });
      expect(geo.bg).toBe("rgb(23, 23, 23)"); // REF's bg-primary solid
      expect(geo.color).toBe("rgb(250, 250, 250)");
      expect(geo.h).toBe(36);
      expect(geo.hasIcon).toBe(true);
      expect(geo.iconMr).toBe("8px"); // mr-2 over the button gap
    }
  });

  test("Add Workflow opens REF's Create Approval Workflow dialog and Create persists (superset)", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("tab", { name: "Approval Workflows" }).click();
    await page.getByRole("button", { name: "Add Workflow" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Create Approval Workflow")).toBeVisible();

    // REF's Type select: the five options.
    await dialog.getByRole("combobox").click();
    for (const option of ["Leave", "Expense", "Loan", "Payroll", "Recruitment"]) {
      await expect(page.getByRole("option", { name: option, exact: true })).toBeVisible();
    }
    await page.keyboard.press("Escape");

    // Add Level → the level card with REF's placeholders + Mandatory.
    await dialog.getByRole("button", { name: "Add Level" }).click();
    await expect(dialog.getByText("Level 1")).toBeVisible();
    await expect(dialog.getByPlaceholder("Level Name (e.g., Manager)")).toBeVisible();
    await expect(dialog.getByPlaceholder("Role (e.g., Department Head)")).toBeVisible();
    await expect(dialog.getByPlaceholder("Delay (hours)")).toBeVisible();
    await expect(dialog.getByText("Mandatory")).toBeVisible();

    // Superset wiring: Create persists via the API, the list refreshes.
    await dialog.getByLabel("Workflow Name").fill("E2E Probe Workflow");
    await dialog.getByRole("button", { name: "Create", exact: true }).click();
    await expect(page.getByText("E2E Probe Workflow")).toBeVisible();

    // Cleanup — keep the zero-data at-rest state for the other specs.
    const list = await page.evaluate(async () => {
      const res = await fetch("/api/approval-workflows");
      const json = await res.json();
      return json.ok ? (json.data.workflows as { id: string; name: string }[]) : [];
    });
    const probe = list.find((w) => w.name === "E2E Probe Workflow");
    expect(probe).toBeDefined();
    await page.evaluate(async (id: string) => {
      await fetch(`/api/approval-workflows?id=${id}`, { method: "DELETE" });
    }, probe!.id);
  });

  test("Add Shift opens REF's dialog and Create persists via the shape-discriminated API (superset)", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("tab", { name: "Shifts" }).click();
    await page.getByRole("button", { name: "Add Shift" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Add Shift", { exact: true })).toBeVisible();

    await expect(dialog.getByLabel("Shift Name")).toBeVisible();
    await expect(dialog.getByPlaceholder("e.g., M, E, N")).toBeVisible();
    await expect(dialog.getByLabel("Start Time")).toBeVisible();
    await expect(dialog.getByLabel("End Time")).toBeVisible();
    await expect(dialog.getByLabel("Break (minutes)")).toBeVisible();
    await expect(dialog.getByLabel("Tolerance (minutes)")).toBeVisible();
    await expect(dialog.getByPlaceholder("0")).toBeVisible();
    await expect(dialog.getByText("Status")).toBeVisible();

    await dialog.getByLabel("Shift Name").fill("E2E Probe Shift");
    await dialog.getByLabel("Code").fill("E");
    await dialog.getByRole("button", { name: "Create", exact: true }).click();
    await expect(page.getByRole("cell", { name: "E2E Probe Shift" })).toBeVisible();

    // Cleanup — keep the zero-data at-rest state (the ?shiftId= branch).
    const shifts = await page.evaluate(async () => {
      const res = await fetch("/api/shifts");
      const json = await res.json();
      return json.ok ? (json.data.shifts as { id: string; name: string }[]) : [];
    });
    const probe = shifts.find((s) => s.name === "E2E Probe Shift");
    expect(probe).toBeDefined();
    await page.evaluate(async (id: string) => {
      await fetch(`/api/shifts?shiftId=${id}`, { method: "DELETE" });
    }, probe!.id);
  });

  test("the Quick Presets render REF's three cards and populate the color fields on click", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("tab", { name: "Theme & Layout" }).click();
    await expect(page.getByText("Quick Presets")).toBeVisible();

    const cards = page.getByRole("button", { name: /Facebook|Professional|Fresh/ });
    expect(await cards.count()).toBe(3);
    await expect(page.getByRole("button", { name: /Facebook/ })).toContainText("Facebook (Default)");

    const cardGeo = await cards.first().evaluate((c: HTMLElement) => {
      const r = c.getBoundingClientRect();
      const cs = getComputedStyle(c);
      const swatches = Array.from(c.querySelectorAll("div")).filter(
        (d) => Math.round(d.getBoundingClientRect().width) === 24
      );
      return {
        h: Math.round(r.height),
        w: Math.round(r.width),
        bg: cs.backgroundColor, // transparent — outline, not the dark solid
        swatchCount: swatches.length,
        swatch0: swatches[0] ? getComputedStyle(swatches[0]).backgroundColor : null,
      };
    });
    expect(cardGeo.h).toBe(86); // REF: h-auto p-4 + content = 86
    // REF's outline card rides bg-background (white) — not the dark solid.
    expect(cardGeo.bg).toBe("rgb(255, 255, 255)");
    expect(cardGeo.swatchCount).toBe(3);
    expect(cardGeo.swatch0).toBe("rgb(24, 119, 242)"); // #1877f2

    // Click populates the three custom color fields (REF behavior).
    await page.getByRole("button", { name: /Professional Blue/ }).click();
    const colors = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLInputElement>('input[type="color"]')).map((i) => i.value)
    );
    expect(colors).toEqual(["#3b82f6", "#6366f1", "#e0e7ff"]);
  });

  test("the Logs filter area rides REF's slate-50 island (195px columns, Clear Filters 32px)", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("tab", { name: "System Logs" }).click();
    const geo = await page.evaluate(() => {
      const trig = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("All Users")
      )!;
      const island = trig.closest("div.bg-slate-50")!;
      const clear = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent?.trim() === "Clear Filters"
      )!;
      const ir = island.getBoundingClientRect();
      return {
        islandCls: island.getAttribute("class"),
        islandW: Math.round(ir.width),
        trigW: Math.round(trig.getBoundingClientRect().width),
        clearH: Math.round(clear.getBoundingClientRect().height),
      };
    });
    expect(geo.islandCls).toContain("mb-6 p-4 bg-slate-50 rounded-lg space-y-4");
    // Viewport-independent: the triggers fill their grid columns exactly —
    // (islandW - 2×16 padding - 4×16 gap) / 5 columns (REF's w-full).
    const expectedCol = (geo.islandW - 32 - 64) / 5;
    expect(Math.abs(geo.trigW - expectedCol)).toBeLessThanOrEqual(1);
    expect(geo.clearH).toBe(32);
  });
});
