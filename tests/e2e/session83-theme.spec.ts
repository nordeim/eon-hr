import { expect, test } from "@playwright/test";

// Session 83 — the theme-direction family (the round's fresh-eyes
// instrument: THE DARK-MODE + RTL (THEME-DIRECTION) MATRIX). The parity
// program's 966 standing PNGs are ALL LIGHT + LTR — the two toggle states
// both apps carry (the REF: localStorage darkMode/app_lang → html.dark +
// dir=rtl; the clone: the session-33 R32-B عربي button + the session-40
// R39-B THEME_BOOT contract) were NEVER measured until this round.
//
// The matrix's live verdict (r83-theme-matrix + r83-theme-mobile): the
// states are PARITY-LOCKED — the theme census matched REF/LOC on every
// real member (the one raw headCol FIND on /attendance classified an
// instrument read-order artifact over the standing role-divergence: the
// REF's restricted state renders no section h2s, so the h2||h1 read hit
// different elements per side; the member-level h1 recipes are
// pixel-identical — the hidden "EonHR" h1 AND the visible "Staff
// Attendance" h1 {text-slate-900, 48px, 288/84/312/96} on BOTH sides),
// the geometry invariance is exact (dark ≡ light: main 256+1184 +
// scrollW 1440/1558 unchanged; RTL: the mirror x=0/-118 with w/scrollW
// unchanged), and the 390 drawer renders identical in both states
// (dark bg rgb(24,24,27), RTL dir=rtl — both sides) with the nav cycle
// green. These pins guard that contract on the LOC side.
//
// R83-A the dark-mode boot + the re-paint-not-re-flow invariance
// R83-B the RTL boot + the exact mirror (x flips, w and scrollW hold)
// R83-C the login theme-inertia (the session-40 R39-B contract — the
//       login page never applies html.dark even with the key armed)
// R83-D the toggle UI geometry (the Moon 36×36 + عربي 80×32 sidebar
//       pair — measured identical on both sides this round)
// R83-E the mobile drawer in dark (the 390 vaul drawer re-themed
//       bg rgb(24,24,27) + the Training LMS nav cycle → auto-close)

test.describe("session-83 theme-direction family (computed truth)", () => {
  test("R83-A: dark mode boots html.dark and re-paints WITHOUT re-flowing the layout", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/dashboard");
    await expect(page.locator("h1", { hasText: "Welcome back" })).toBeVisible({ timeout: 15000 });
    const light = await page.evaluate(() => {
      const main = document.querySelector("main")!;
      const r = main.getBoundingClientRect();
      return { cls: document.documentElement.className, bg: getComputedStyle(document.body).backgroundColor, x: Math.round(r.x), w: Math.round(r.width), scrollW: document.documentElement.scrollWidth };
    });
    expect(light.cls).not.toContain("dark");
    await page.evaluate(() => localStorage.setItem("darkMode", "true"));
    await page.reload();
    await expect(page.locator("h1", { hasText: "Welcome back" })).toBeVisible({ timeout: 15000 });
    const dark = await page.evaluate(() => {
      const main = document.querySelector("main")!;
      const r = main.getBoundingClientRect();
      return { cls: document.documentElement.className, bg: getComputedStyle(document.body).backgroundColor, x: Math.round(r.x), w: Math.round(r.width), scrollW: document.documentElement.scrollWidth };
    });
    // the boot applies the theme class + the dark body background
    expect(dark.cls).toContain("dark");
    expect(dark.bg).toBe("rgb(10, 10, 10)");
    // the INVARIANCE contract: the toggle re-paints, it must NOT re-flow
    expect(dark.x).toBe(light.x);
    expect(dark.w).toBe(light.w);
    expect(dark.scrollW).toBe(light.scrollW);
    await page.evaluate(() => localStorage.setItem("darkMode", "false"));
  });

  test("R83-B: RTL mode boots dir=rtl and mirrors the shell exactly (x flips, w holds)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    // land on the app origin first (localStorage is origin-scoped — an
    // evaluate before any goto runs against about:blank and throws)
    await page.goto("/dashboard");
    await expect(page.locator("h1", { hasText: "Welcome back" })).toBeVisible({ timeout: 15000 });
    await page.evaluate(() => localStorage.setItem("app_lang", "ar"));
    await page.reload();
    const rtl = await page.evaluate(() => {
      const main = document.querySelector("main")!;
      const sb = main.previousElementSibling as HTMLElement | null;
      const r = main.getBoundingClientRect();
      const s = sb?.getBoundingClientRect();
      return { dir: document.documentElement.getAttribute("dir"), mainX: Math.round(r.x), mainW: Math.round(r.width), sbX: s ? Math.round(s.x) : null, sbW: s ? Math.round(s.width) : null, scrollW: document.documentElement.scrollWidth };
    });
    expect(rtl.dir).toBe("rtl");
    // the LTR shell reads main 256+1184 + sidebar 0+256 (the standing
    // @1440 contract) — the mirror flips x, keeps the widths
    expect(rtl.mainX).toBe(0);
    expect(rtl.mainW).toBe(1184);
    expect(rtl.sbX).toBe(1184);
    expect(rtl.sbW).toBe(256);
    expect(rtl.scrollW).toBe(1440);
    await page.evaluate(() => localStorage.removeItem("app_lang"));
  });

  test("R83-C: the login surface is theme-inert (html.dark never applies with the key armed)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/login");
    await expect(page.getByText("Welcome to Eon HR")).toBeVisible({ timeout: 15000 });
    await page.evaluate(() => localStorage.setItem("darkMode", "true"));
    await page.reload();
    await expect(page.getByText("Welcome to Eon HR")).toBeVisible({ timeout: 15000 });
    const read = await page.evaluate(() => ({
      cls: document.documentElement.className,
      bg: getComputedStyle(document.body).backgroundColor,
    }));
    // the session-40 R39-B contract: REF's login ships no theme boot —
    // the key survives in storage but the class never applies
    expect(read.cls).not.toContain("dark");
    expect(read.bg).toBe("rgb(255, 255, 255)");
    await page.evaluate(() => localStorage.setItem("darkMode", "false"));
  });

  test("R83-D: the toggle pair renders the REF-measured geometry (Moon 36×36 + عربي 80×32)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/dashboard");
    await expect(page.locator("h1", { hasText: "Welcome back" })).toBeVisible({ timeout: 15000 });
    const toggles = await page.evaluate(() => {
      const out: Record<string, { x: number; y: number; w: number; h: number }> = {};
      for (const b of document.querySelectorAll("button")) {
        const t = (b.textContent || "").trim();
        if (t === "عربي" || /switch to (dark|light) mode/i.test(b.getAttribute("aria-label") || "")) {
          const r = b.getBoundingClientRect();
          out[/عربي/.test(t) ? "arabic" : "moon"] = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
        }
      }
      return out;
    });
    // both-sides live-measured @1440 this round: Moon x=60 y≈796 36×36,
    // عربي x=104 y≈798 80×32 (the y depends on the sidebar's bottom
    // stack — pinned as the x/w/h contract)
    expect(toggles.moon).toMatchObject({ x: 60, w: 36, h: 36 });
    expect(toggles.arabic).toMatchObject({ x: 104, w: 80, h: 32 });
  });

  test("R83-E: the mobile drawer re-themes in dark and the nav cycle stays green", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard");
    // the welcome h1 is HIDDEN at 390 on both sides (the REF-authored
    // mobile behavior, live-verified this round) — the Toggle Sidebar
    // button is the mobile readiness signal
    const toggle = page.getByRole("button", { name: "Toggle Sidebar" });
    await expect(toggle).toBeVisible({ timeout: 15000 });
    await page.evaluate(() => localStorage.setItem("darkMode", "true"));
    await page.reload();
    await expect(toggle).toBeVisible({ timeout: 15000 });
    await toggle.click();
    const drawer = page.locator("[role=dialog]");
    await expect(drawer).toBeVisible();
    const bg = await drawer.evaluate((d) => getComputedStyle(d).backgroundColor);
    // the both-sides live-measured dark drawer background (zinc-900)
    expect(bg).toBe("rgb(24, 24, 27)");
    // the standing functional cycle: Training LMS → /training → auto-close
    await drawer.getByRole("link", { name: /training lms/i }).click();
    await expect(page).toHaveURL(/\/training$/, { timeout: 15000 });
    await expect(drawer).toHaveCount(0);
    await page.evaluate(() => localStorage.setItem("darkMode", "false"));
  });
});
