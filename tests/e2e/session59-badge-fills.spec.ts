import { expect, test, type Page } from "@playwright/test";

// Session 59 — the badge/chip fill family (R59-A..E). The r59 census
// (scripts/r59-badge-census.mjs, 49 routes, paired live) found the two
// kanban boards rendering UNIFORM slate count chips where REF tints
// each column/stage by status (the session-6 pin measured only Backlog
// and generalized the slate), and the lab() serializations exposed the
// trap-2 oklch drift on every unpinned shade in active use
// (emerald/amber/yellow/red-100/purple-700/violet). These pins hold the
// fixes with COMPUTED truth.
//
// R59-C (the profile role badge "Admin" vs REF's "User") is a
// documented data-level divergence — the seed's admin role is
// load-bearing for the superset gates; no pin (see
// docs/remediation-plan-session59.md).

const CHIP = {
  slate100: "rgb(241, 245, 249)",
  slate200: "rgb(226, 232, 240)",
  slate700: "rgb(51, 65, 85)",
  blue100: "rgb(219, 234, 254)",
  blue700: "rgb(29, 78, 216)",
  yellow100: "rgb(254, 249, 195)",
  yellow700: "rgb(161, 98, 7)",
  purple100: "rgb(243, 232, 255)",
  purple700: "rgb(126, 34, 206)",
  green100: "rgb(220, 252, 231)",
  green700: "rgb(21, 128, 61)",
  amber100: "rgb(254, 243, 199)",
  amber700: "rgb(180, 83, 9)",
  red100: "rgb(254, 226, 226)",
  red700: "rgb(185, 28, 28)",
};

async function readBoardChips(page: Page): Promise<Record<string, { bg: string; c: string; h: number }>> {
  return page.evaluate(() => {
    const out: Record<string, { bg: string; c: string; h: number }> = {};
    for (const h of document.querySelectorAll("main h3")) {
      const col = h.textContent?.trim() ?? "";
      const chip = h.parentElement?.querySelector("div.inline-flex");
      if (chip) {
        const cs = getComputedStyle(chip);
        out[col] = {
          bg: cs.backgroundColor,
          c: cs.color,
          h: Math.round(chip.getBoundingClientRect().height),
        };
      }
    }
    return out;
  });
}

test.describe("session-59 badge/chip fill family (computed truth)", () => {
  test("R59-A: the taskmanager count chips are status-tinted per column (REF's five recipes)", async ({ page }) => {
    await page.goto("/taskmanager");
    await expect(page.getByRole("heading", { name: "Backlog" })).toBeVisible();
    const chips = await readBoardChips(page);
    expect(chips["Backlog"]).toEqual({ bg: CHIP.slate100, c: CHIP.slate700, h: 22 });
    expect(chips["To Do"]).toEqual({ bg: CHIP.blue100, c: CHIP.blue700, h: 22 });
    expect(chips["In Progress"]).toEqual({ bg: CHIP.yellow100, c: CHIP.yellow700, h: 22 });
    expect(chips["Review"]).toEqual({ bg: CHIP.purple100, c: CHIP.purple700, h: 22 });
    expect(chips["Done"]).toEqual({ bg: CHIP.green100, c: CHIP.green700, h: 22 });
  });

  test("R59-B: the recruitmentkanban count chips are status-tinted per stage (REF's five recipes)", async ({ page }) => {
    await page.goto("/recruitmentkanban");
    await expect(page.getByRole("heading", { name: "Applied" })).toBeVisible();
    const chips = await readBoardChips(page);
    expect(chips["Applied"]).toEqual({ bg: CHIP.slate200, c: CHIP.slate700, h: 22 });
    expect(chips["Interviewing"]).toEqual({ bg: CHIP.blue100, c: CHIP.blue700, h: 22 });
    // REF's Offer is AMBER here where the taskmanager's In-Progress is
    // YELLOW — REF keeps two different warning shades across its pages
    expect(chips["Offer"]).toEqual({ bg: CHIP.amber100, c: CHIP.amber700, h: 22 });
    expect(chips["Hired"]).toEqual({ bg: CHIP.green100, c: CHIP.green700, h: 22 });
    expect(chips["Rejected"]).toEqual({ bg: CHIP.red100, c: CHIP.red700, h: 22 });
  });

  test("R59-D: the pinned palette renders rgb(), not the oklch lab() drift", async ({ page }) => {
    // The classes are all source-used (badge.tsx variants + the two
    // boards + the analytics icons), so their utilities generate; the
    // probe reads what the engine renders for each — pre-fix these
    // serialized as lab(...) (the trap-2 drift).
    await page.goto("/dashboard");
    const palette = await page.evaluate(() => {
      const probe = (cls: string): string => {
        const d = document.createElement("div");
        d.className = cls;
        document.body.appendChild(d);
        const cs = getComputedStyle(d);
        const v = cls.startsWith("bg") ? cs.backgroundColor : cs.color;
        d.remove();
        return v;
      };
      return {
        emerald100: probe("bg-emerald-100"),
        emerald700: probe("text-emerald-700"),
        amber100: probe("bg-amber-100"),
        amber700: probe("text-amber-700"),
        yellow600: probe("text-yellow-600"),
        yellow700: probe("text-yellow-700"),
        red100: probe("bg-red-100"),
        violet100: probe("bg-violet-100"),
        violet700: probe("text-violet-700"),
        purple700: probe("text-purple-700"),
      };
    });
    expect(palette.emerald100).toBe("rgb(209, 250, 229)");
    expect(palette.emerald700).toBe("rgb(4, 120, 87)");
    expect(palette.amber100).toBe(CHIP.amber100);
    expect(palette.amber700).toBe(CHIP.amber700);
    expect(palette.yellow600).toBe("rgb(202, 138, 4)");
    expect(palette.yellow700).toBe(CHIP.yellow700);
    expect(palette.red100).toBe(CHIP.red100);
    expect(palette.violet100).toBe("rgb(237, 233, 254)");
    expect(palette.violet700).toBe("rgb(109, 40, 217)");
    expect(palette.purple700).toBe(CHIP.purple700);
  });

  test("R59-D2: the employees table's Active badge renders the pinned emerald pair (the seeded row)", async ({ page }) => {
    await page.goto("/employees");
    // the seeded demo employee's row exists in the isolated e2e db
    const badge = page.locator("main tbody span", { hasText: "Active" }).first();
    await expect(badge).toBeVisible();
    const fill = await badge.evaluate((b) => {
      const cs = getComputedStyle(b);
      return { bg: cs.backgroundColor, c: cs.color };
    });
    expect(fill.bg).toBe("rgb(209, 250, 229)");
    expect(fill.c).toBe("rgb(4, 120, 87)");
  });

  test("R59-E: the securitysettings five badges render REF's exact recipes (the Enabled form carries the CircleCheckBig glyph)", async ({ page }) => {
    await page.goto("/securitysettings");
    // the data-gated render: wait for the CONTENT, not network idle (the
    // r59 census instrument lesson — a fixed-ms wait read REF mid-load
    // and produced a false DIFF). The rows render only after the
    // settings fetch resolves (the Loader2 gate above).
    await expect(page.getByText("Security Features", { exact: true })).toBeVisible();
    await expect(page.locator("main").getByText("GDPR Compliance", { exact: true })).toBeVisible();
    const badges = await page.evaluate(() => {
      return [...document.querySelectorAll("main div")]
        .filter((e) => ["Enabled", "Disabled"].includes(e.textContent?.trim() ?? ""))
        .map((e) => {
          const cs = getComputedStyle(e);
          const r = e.getBoundingClientRect();
          const icon = e.querySelector("svg");
          return {
            t: e.textContent?.trim() ?? "",
            bg: cs.backgroundColor,
            c: cs.color,
            w: Math.round(r.width),
            icon: icon ? `${icon.getAttribute("class")?.slice(-12)}` : null,
          };
        });
    });
    expect(badges).toHaveLength(5);
    // the Disabled form: plain slate, no icon, no shadow
    expect(badges[0].t).toBe("Disabled");
    expect(badges[0].bg).toBe(CHIP.slate100);
    expect(badges[0].c).toBe(CHIP.slate700);
    expect(badges[0].icon).toBeNull();
    // the four Enabled forms: green pair + REF's CircleCheckBig glyph
    // (w-3 h-3 mr-1 — 92px) + the shadow/border-green-200 members
    for (let i = 1; i < 5; i++) {
      expect(badges[i].t).toBe("Enabled");
      expect(badges[i].bg).toBe(CHIP.green100);
      expect(badges[i].c).toBe(CHIP.green700);
      expect(badges[i].icon).toContain("w-3 h-3 mr-1");
      expect(badges[i].w).toBe(92);
    }
  });
});
