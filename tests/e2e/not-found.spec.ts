import { expect, test } from "@playwright/test";

/**
 * Session 36 (R35-D): the 404 contract — round 10 pinned only the two
 * headings; this round measured REF's full page.
 *
 * REF-measured:
 *  - "404" at 72px/300 slate-300; "Page Not Found" at 24px/500
 *    slate-800; a 2px × 64px slate-200 divider bar between them
 *  - the sentence 'The page "{full pathname}" could not be found in this
 *    application.' (16px slate-600, the route in a quoted 500-weight
 *    slate-700 span)
 *  - the Go Home outline button (white bg, slate-200 border, rounded-lg)
 *  - the title: "{LastSegment} | Eon HR" (the LAST path segment,
 *    first-letter capitalized)
 *  - logged-out visitors redirect to /login (REF's guard behavior)
 */
test.describe("the 404 page (session 36)", () => {
  test("unknown route renders REF's full contract inside the shell", async ({ page }) => {
    await page.goto("/nonexistentroute123");

    await expect(page.getByRole("heading", { name: "404", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();

    const geo = await page.evaluate(() => {
      const h1 = Array.from(document.querySelectorAll("main h1")).find((h) => h.textContent === "404")!;
      const h2 = Array.from(document.querySelectorAll("main h2")).find((h) => h.textContent === "Page Not Found")!;
      const p = Array.from(document.querySelectorAll("main p")).find((x) =>
        x.textContent?.includes("could not be found in this application")
      )!;
      const span = p.querySelector("span")!;
      const bar = h1.parentElement!.querySelector("div[aria-hidden]") as HTMLElement;
      const btn = Array.from(document.querySelectorAll("main a, main button")).find((b) =>
        /Go Home/.test(b.textContent ?? "")
      )!;
      const bcs = getComputedStyle(btn);
      return {
        h1Color: getComputedStyle(h1).color,
        h1fs: getComputedStyle(h1).fontSize,
        h2Color: getComputedStyle(h2).color,
        sentence: p.textContent,
        spanText: span.textContent,
        spanColor: getComputedStyle(span).color,
        spanWeight: getComputedStyle(span).fontWeight,
        barW: Math.round(bar.getBoundingClientRect().width),
        barH: Math.round(bar.getBoundingClientRect().height),
        btnText: btn.textContent?.trim(),
        btnBg: bcs.backgroundColor,
        btnBorder: bcs.borderColor,
        btnRadius: bcs.borderRadius,
      };
    });
    expect(geo.h1Color).toBe("rgb(203, 213, 225)"); // slate-300
    expect(geo.h1fs).toBe("72px");
    expect(geo.h2Color).toBe("rgb(30, 41, 59)"); // slate-800
    expect(geo.sentence).toContain('The page "nonexistentroute123" could not be found in this application.');
    expect(geo.spanText).toBe('"nonexistentroute123"');
    expect(geo.spanColor).toBe("rgb(51, 65, 85)"); // slate-700
    expect(geo.spanWeight).toBe("500");
    expect(geo.barW).toBe(64);
    expect(geo.barH).toBe(2);
    expect(geo.btnText).toBe("Go Home");
    expect(geo.btnBg).toBe("rgb(255, 255, 255)");
    expect(geo.btnBorder).toBe("rgb(226, 232, 240)"); // slate-200
    expect(geo.btnRadius).toBe("8px");
    // Session 36 (R35-F11/F12): REF's wrapper + icon contracts — the
    // content centers at y=306 of the 900px viewport (min-h-screen; the
    // clone's old pb-40 pushed it to 226), and Go Home carries the 16px
    // Home icon (123px wide with it, 99px without).
    const stack = await page.evaluate(() => {
      const h1 = Array.from(document.querySelectorAll("main h1")).find(
        (x) => x.getBoundingClientRect().width > 0
      )!;
      const btn = Array.from(document.querySelectorAll("main a, main button")).find((b) =>
        /Go Home/.test(b.textContent ?? "")
      )!;
      const icon = btn.querySelector("svg");
      return {
        h1Y: Math.round(h1.getBoundingClientRect().y),
        vh: window.innerHeight,
        btnW: Math.round(btn.getBoundingClientRect().width),
        iconW: icon ? Math.round(icon.getBoundingClientRect().width) : 0,
        iconMr: icon ? getComputedStyle(icon).marginRight : null,
      };
    });
    // Viewport-relative centering: (vh - 288 content) / 2 — 306 at 900,
    // 216 at the default 720. The content height is viewport-independent
    // (the 448px max-w-md column).
    expect(stack.h1Y).toBe(Math.round((stack.vh - 288) / 2));
    expect(stack.btnW).toBe(123);
    expect(stack.iconW).toBe(16);
    expect(stack.iconMr).toBe("8px");
    // The last-segment slug title (polling — the island's cleanup lands
    // ~250ms after hydration, past Next's metadata re-assertion).
    await expect(page).toHaveTitle("Nonexistentroute123 | Eon HR");
  });

  test("nested unknown paths quote the full path but title the last segment", async ({ page }) => {
    await page.goto("/foo/bar");
    await expect(page.getByText('could not be found in this application')).toBeVisible();
    const spanText = await page.evaluate(() => {
      const p = Array.from(document.querySelectorAll("main p")).find((x) =>
        x.textContent?.includes("could not be found")
      )!;
      return p.querySelector("span")!.textContent;
    });
    expect(spanText).toBe('"foo/bar"');
    await expect(page).toHaveTitle("Bar | Eon HR");
  });

  // Session 104 (R104-A/B): the 404 interior's arms re-measured live at the
  // 68th deploy state — the neo-crm D-194 doctrine's eon-hr members. The Go
  // Home icon IDENTITY (the r35 pin measured geometry only): REF ships the
  // heroicons v1 outline home (ONE path, the stroke-width ON the path, NO
  // width/height attrs, the w-first "w-4 h-4 mr-2" class order) — the lucide
  // House (two paths, the stroke-width on the svg) retired. The multi-word
  // title form: REF Title-Cases every hyphen-separated word of the last
  // segment (the r35 fixtures were single-word — the blind spot).
  test("the Go Home icon identity (REF's heroicons v1 outline home) and the multi-word title (session 104)", async ({ page }) => {
    await page.goto("/definitely-not-a-real-route-r104");

    const icon = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("main a, main button")).find((b) =>
        /Go Home/.test(b.textContent ?? "")
      )!;
      const svg = btn.querySelector("svg")!;
      const path = svg.querySelector("path")!;
      const bcs = getComputedStyle(svg);
      return {
        pathCount: svg.querySelectorAll("path").length,
        svgStrokeWidth: svg.getAttribute("stroke-width"),
        hasWH: svg.hasAttribute("width") || svg.hasAttribute("height"),
        cls: svg.getAttribute("class"),
        pathStrokeWidth: path.getAttribute("stroke-width"),
        btnBox: Math.round(btn.getBoundingClientRect().width) + "x" + Math.round(btn.getBoundingClientRect().height),
        iconW: Math.round(svg.getBoundingClientRect().width),
        iconMr: bcs.marginRight,
      };
    });
    expect(icon.pathCount).toBe(1); // ← RED before the fix: the lucide House = 2 paths
    expect(icon.svgStrokeWidth).toBeNull(); // ← RED before: "2" on the svg
    expect(icon.hasWH).toBe(false); // ← RED before: the lucide width/height attrs
    expect(icon.cls).toBe("w-4 h-4 mr-2"); // ← RED before: the h-first lucide order
    expect(icon.pathStrokeWidth).toBe("2");
    expect(icon.btnBox).toBe("123x38"); // the r35 geometry pin survives
    expect(icon.iconW).toBe(16);
    expect(icon.iconMr).toBe("8px");

    // the multi-word title (R104-B): every hyphen-separated word capitalized
    await expect(page).toHaveTitle("Definitely Not A Real Route R104 | Eon HR"); // ← RED before: "Definitely-not-a-real-route-r104"
  });
});

// Logged-out surface (the auth.spec.ts opt-out pattern — scoped to this
// describe so the logged-in contract above keeps the shared storageState).
test.describe("the logged-out 404", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test("unknown routes redirect unauthenticated visitors to /login (REF's guard)", async ({ page }) => {
    await page.goto("/nonexistentroute123");
    await expect(page).toHaveURL(/\/login/);
  });
});
