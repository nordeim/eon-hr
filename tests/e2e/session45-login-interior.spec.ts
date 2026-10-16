import { expect, test } from "@playwright/test";

/**
 * Session 45 (parity round 44) — the login redeploy re-audit: the icon
 * colors + the runtime ring cascade + the loading interior.
 *
 * REF redeployed the login twice this round (the 8th + 9th deploys). The
 * at-rest surface stayed byte-identical — the census reached the COLOR and
 * INTERIOR dimensions 43 rounds never measured: the platform runtime
 * injects a second Tailwind stylesheet INLINE after the linked one (its
 * two plain-:focus rules beat focus-visible:ring-ring in the cascade —
 * the keyboard-focused inputs render slate-400), the field icons are
 * slate-500 with the older-lucide Mail glyph, the Apple logo carries a
 * path-level black fill, REF's Microsoft squares ship their own blue/green
 * variant, the loading state swaps the button text, and the title/subtitle
 * member order.
 */
test.describe("session-45 login interior (logged out)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("the field icons render REF's colors + glyphs (slate-500 stroke, the older-lucide Mail: rect first + the 1.94 flap)", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toBeVisible();

    const icons = await page.evaluate(() => {
      const svgs = [...document.querySelectorAll("svg")];
      const mail = svgs.find((v) => (v.getAttribute("class") || "").includes("lucide-mail"));
      const lock = svgs.find((v) => (v.getAttribute("class") || "").includes("lucide-lock"));
      return {
        mailCls: mail?.getAttribute("class") || null,
        mailStroke: mail ? getComputedStyle(mail).color : null,
        mailChildren: mail ? [...mail.children].map((c) => c.tagName) : [],
        mailFlap: mail?.children[1]?.getAttribute("d") || null,
        lockStroke: lock ? getComputedStyle(lock).color : null,
        lockCls: lock?.getAttribute("class") || null,
      };
    });

    // REF's verbatim class (the v3 transform member + slate-500, no
    // pointer-events-none)
    expect(icons.mailCls).toBe(
      "lucide lucide-mail absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500"
    );
    expect(icons.lockCls).toBe(
      "lucide lucide-lock absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500"
    );
    // the rendered color is REF's darker slate-500 (NOT the old slate-400)
    expect(icons.mailStroke).toBe("rgb(100, 116, 139)");
    expect(icons.lockStroke).toBe("rgb(100, 116, 139)");
    // the older-lucide glyph: the envelope rect renders BEFORE the flap
    expect(icons.mailChildren).toEqual(["rect", "path"]);
    expect(icons.mailFlap).toBe("m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7");
  });

  test("the social icons render REF's fills (the BLACK Apple logo + REF's Microsoft square variant)", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toBeVisible();

    const fills = await page.evaluate(() => {
      const btns = [...document.querySelectorAll("button")];
      const apple = btns.find((b) => /apple/i.test(b.textContent || ""))!.querySelector("svg")!;
      const ms = btns.find((b) => /microsoft/i.test(b.textContent || ""))!.querySelector("svg")!;
      return {
        appleSvgFill: apple.getAttribute("fill"),
        applePathFill: apple.querySelector("path")!.getAttribute("fill"),
        appleRendered: getComputedStyle(apple.querySelector("path")!).fill,
        msSquares: [...ms.querySelectorAll("path")].map((p) => ({
          fill: p.getAttribute("fill"),
          d: p.getAttribute("d")!.slice(0, 12),
        })),
      };
    });

    // the fill lives on the path (no svg-level fill) — the logo renders BLACK
    expect(fills.appleSvgFill).toBeNull();
    expect(fills.applePathFill).toBe("#000000");
    expect(fills.appleRendered).toBe("rgb(0, 0, 0)");
    // REF's own square variant: blue top-right, green bottom-left
    expect(fills.msSquares).toEqual([
      { fill: "#F25022", d: "M1 1h10v10H1" },
      { fill: "#00A4EF", d: "M13 1h10v10H" },
      { fill: "#7FBA00", d: "M1 13h10v10H" },
      { fill: "#FFB900", d: "M13 13h10v10" },
    ]);
  });

  test("the keyboard-focused input ring renders SLATE-400 (the injected runtime rules beat the focus-visible token) while the Sign in keeps its zinc-950 token ring", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toBeVisible();

    // the style block sits in the BODY — after the head stylesheet links
    const stylePos = await page.evaluate(() => {
      const style = [...document.querySelectorAll("style")].find((s) =>
        (s.textContent || "").includes("focus\\:ring-slate-400")
      );
      if (!style) return { found: false };
      const firstLink = document.querySelector('link[rel="stylesheet"]');
      return {
        found: true,
        inBody: !!style.closest("body"),
        linkPrecedesStyle: !!(style.compareDocumentPosition(firstLink!) & Node.DOCUMENT_POSITION_PRECEDING),
      };
    });
    expect(stylePos.found).toBe(true);
    expect(stylePos.inBody).toBe(true);
    // the link PRECEDES the style (the style is later in document order —
    // the winning cascade position)
    expect(stylePos.linkPrecedesStyle).toBeTruthy();

    // Tab into the email input (Google, Microsoft, Apple come first)
    for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
    await page.waitForTimeout(450); // the 200ms transition + settle

    const ring = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const cs = getComputedStyle(el);
      return { tag: el.tagName, ph: (el as HTMLInputElement).placeholder || null, ring: cs.getPropertyValue("--tw-ring-color").trim() };
    });
    expect(ring.tag).toBe("INPUT");
    expect(ring.ph).toBe("you@example.com");
    // REF's live render: the slate-400 ring (the runtime rules win)
    expect(ring.ring).toBe("rgb(148 163 184 / 1)");

    // continue to the Sign in (password, then the button) — its ring
    // stays the zinc-950 token
    for (let i = 0; i < 2; i++) await page.keyboard.press("Tab");
    await page.waitForTimeout(450);
    const btnRing = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const cs = getComputedStyle(el);
      return { txt: (el.textContent || "").trim(), ring: cs.getPropertyValue("--tw-ring-color").trim() };
    });
    expect(btnRing.txt).toBe("Sign in");
    expect(btnRing.ring).toBe("#09090b");
  });

  test("the loading state swaps the copy + carries the mr-2 spinner (the login API held open via route interception)", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toBeVisible();

    // hold the login API open so the loading state persists
    let release: (() => void) | null = null;
    await page.route("**/api/auth/login", async (route) => {
      await new Promise<void>((resolve) => {
        release = resolve;
      });
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, error: { code: "UNAUTHENTICATED", message: "Invalid email or password" } }),
      });
    });

    await page.fill('input[type="email"]', "someone@example.com");
    await page.fill('input[type="password"]', "WrongPassword1!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Signing in...")).toBeVisible();

    const loading = await page.evaluate(() => {
      const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").includes("Signing in"))!;
      const svg = b.querySelector("svg");
      return { disabled: b.disabled, spinCls: svg?.getAttribute("class") || null };
    });
    expect(loading.disabled).toBe(true);
    expect(loading.spinCls).toBe("lucide lucide-loader-circle mr-2 h-4 w-4 animate-spin");

    release!();
    // the Alert surfaces after the release + settle
    await expect(page.getByText("Invalid email or password")).toBeVisible({ timeout: 10_000 });
    // and the button restores its at-rest copy
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeEnabled();
  });

  test("the title + subtitle carry REF's member order (the responsive pair first, the weight/color/track members after)", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome to Eon HR" })).toBeVisible();

    const titles = await page.evaluate(() => {
      const h = document.querySelector("h1")!;
      const p = h.parentElement!.querySelector("p")!;
      return { h1: h.className, p: p.className };
    });
    expect(titles.h1).toBe("text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight");
    expect(titles.p).toBe("text-slate-500 text-sm sm:text-base font-medium");
  });
});
