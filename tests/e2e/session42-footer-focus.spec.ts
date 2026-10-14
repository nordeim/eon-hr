import { expect, test } from "@playwright/test";

/**
 * Session 43 (parity round 41) — the footer focus family + the user-menu
 * item stretch + the employees filter row + the shadcn Sidebar attribute
 * family.
 *
 * The round's census walked the keyboard/focus dimension across the
 * popover/menu family (the session-38 named remainder): the bell Popover
 * and the user DropdownMenu proved structurally identical both sides, but
 * REF's footer ghosts carry the full v4 Button base whose focus-visible
 * ring-1 pair renders a 1px #0A0A0A ring under keyboard focus — the
 * clone's hand-rolled strings rendered the browser-default outline.
 * The user-menu items are plain Radix divs on REF (182px full-row
 * stretch); the asChild-wrapped a/button surfaced their tags and the
 * Logout button shrank to 96px. The employees native select keeps the UA
 * buttonface fill on REF (v4's preflight resets it to transparent) and
 * defaults to "active".
 */
test.describe("session-42 footer focus family (parity round 41)", () => {
  test("the footer ghosts render REF's keyboard-focus ring — the v4 base's focus-visible:ring-1 pair, outline suppressed", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Tab until the bell is focused (it sits deep in the shell order).
    const focusBell = async () => {
      for (let i = 0; i < 24; i++) {
        await page.keyboard.press("Tab");
        const hit = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          return !!el && el.getAttribute("aria-label") === "Notifications";
        });
        if (hit) return true;
      }
      return false;
    };
    expect(await focusBell()).toBe(true);

    const readFocused = () =>
      page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const cs = getComputedStyle(el);
        return {
          label: el.getAttribute("aria-label") || el.textContent?.trim().slice(0, 10) || "",
          shadow: cs.boxShadow,
          outline: cs.outlineStyle,
        };
      });

    // The bell: the 1px #0A0A0A ring, no browser-default outline.
    const bell = await readFocused();
    expect(bell.shadow).toContain("rgb(10, 10, 10) 0px 0px 0px 1px");
    expect(bell.outline).toBe("none");

    // The moon — one Tab further.
    await page.keyboard.press("Tab");
    let read = await readFocused();
    expect(read.label).toContain("Switch to dark mode");
    expect(read.shadow).toContain("rgb(10, 10, 10) 0px 0px 0px 1px");
    expect(read.outline).toBe("none");

    // عربي — one more Tab (the outlined variant: the ring rides ON TOP of
    // its shadow-sm, both in the box-shadow stack).
    await page.keyboard.press("Tab");
    read = await readFocused();
    expect(read.label).toContain("عربي");
    expect(read.shadow).toContain("rgb(10, 10, 10) 0px 0px 0px 1px");
    expect(read.outline).toBe("none");
  });

  test("the moon renders ONE conditional glyph — the moon in light (no hidden sun node)", async ({ page }) => {
    await page.goto("/dashboard");
    const btn = page.getByRole("button", { name: "Switch to dark mode" });
    await expect(btn.locator("svg")).toHaveCount(1);
    await expect(btn.locator("svg.lucide-moon")).toBeVisible();
  });

  test("the user-menu items are plain DIV menuitems stretching the full 182px row (the Logout button-shrink retired)", async ({ page }) => {
    await page.goto("/dashboard");
    const trigger = page.getByRole("button", { name: /sepnetflix2023/ }).first();
    await trigger.click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();

    const geo = await menu.evaluate((m: HTMLElement) => {
      const items = Array.from(m.querySelectorAll('[role="menuitem"]'));
      return items.map((it) => {
        const r = it.getBoundingClientRect();
        return { tag: it.tagName.toLowerCase(), w: Math.round(r.width), h: Math.round(r.height) };
      });
    });
    expect(geo).toHaveLength(2);
    for (const it of geo) {
      expect(it.tag).toBe("div");
      expect(it.h).toBe(32);
      // The full-row stretch: 192px menu - 2x4px container padding - 2px
      // borders = 182px (REF-measured; the asChild button rendered 96).
      expect(Math.abs(it.w - 182)).toBeLessThanOrEqual(2);
    }
    await page.keyboard.press("Escape");
    await expect(menu).not.toBeVisible();
  });

  test("the employees filter row — the FIXED 256px search, the select at x=569 defaulting to Active with the buttonface fill", async ({ page }) => {
    await page.goto("/employees");
    await expect(page.getByPlaceholder("Search employees...")).toBeVisible();

    const geo = await page.evaluate(() => {
      const search = document.querySelector('input[placeholder*="Search"]') as HTMLElement;
      const select = document.querySelector("select") as HTMLSelectElement;
      const scs = getComputedStyle(select);
      return {
        searchW: Math.round(search.getBoundingClientRect().width),
        selectX: Math.round(select.getBoundingClientRect().x),
        selectW: Math.round(select.getBoundingClientRect().width),
        selectH: Math.round(select.getBoundingClientRect().height),
        selectValue: select.value,
        selectBg: scs.backgroundColor,
      };
    });
    // REF re-measured: the search FIXED at 256 (md:w-64 + flex-none), the
    // select starting at x=569 (the clone's 228px search left it at 541).
    expect(Math.abs(geo.searchW - 256)).toBeLessThanOrEqual(2);
    expect(Math.abs(geo.selectX - 569)).toBeLessThanOrEqual(2);
    expect(geo.selectW).toBe(125);
    expect(geo.selectH).toBe(36);
    // REF's live default (three fresh loads) — NOT "all".
    expect(geo.selectValue).toBe("active");
    // The UA buttonface fill — v4's preflight resets native select
    // backgrounds to transparent; bg-[buttonface] restores REF's gray.
    expect(geo.selectBg).toBe("rgb(239, 239, 239)");

    // The blue-500 focus pair fires on ANY focus (authored focus:, not
    // focus-visible:) — programmatic focus suffices.
    const focused = await page.evaluate(() => {
      const select = document.querySelector("select") as HTMLElement;
      select.focus();
      return getComputedStyle(select).boxShadow;
    });
    expect(focused).toContain("rgb(59, 130, 246)");
    expect(focused).toContain("2px");
  });

  test("the shadcn Sidebar attribute family — REF's full data-sidebar map on the shell", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const counts = await page.evaluate(() => {
      const out: Record<string, number> = {};
      for (const el of document.querySelectorAll("[data-sidebar]")) {
        const k = el.getAttribute("data-sidebar")!;
        out[k] = (out[k] || 0) + 1;
      }
      return out;
    });
    // REF live-counted on its shell (the drawer's copy unmounts at rest —
    // the Radix portal — so the desktop sidebar is the single source).
    expect(counts.trigger).toBe(1);
    expect(counts.sidebar).toBe(1);
    expect(counts.header).toBe(1);
    expect(counts.content).toBe(1);
    expect(counts.group).toBe(1);
    expect(counts["group-label"]).toBe(1);
    expect(counts["group-content"]).toBe(1);
    expect(counts.menu).toBe(1);
    expect(counts["menu-button"]).toBe(13);
    // The 5 standalone links only — the group toggles sit bare in the ul.
    expect(counts["menu-item"]).toBe(5);
    expect(counts.footer).toBe(1);
  });
});
