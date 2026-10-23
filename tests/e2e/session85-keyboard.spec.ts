import { expect, test } from "@playwright/test";

// Session 85 — the keyboard-navigation cycle (the round's fresh-eyes
// instrument: the last of the r83 close-out's named candidates — the
// focus-visible rings, the tab walks, the drawer's keyboard contract —
// the interaction surface the program had never audited; every one of
// the 1182 standing PNGs is an at-rest, unfocused capture).
//
// The matrix's live verdict (r85-keyboard-recon + r85-keyboard-deep +
// r85-keyboard-focus-png):
//   - the TAB ORDERS parity-locked (login 9 stops / dashboard 15 stops,
//     the same sequences both sides, the LOC keeping its aria superset)
//   - the DRAWER's keyboard contract identical (open → focus lands on
//     Employees → the trap holds → Escape closes → post-Escape BODY)
//   - the custom-ringed surfaces render the same visible box-shadow
//     layers (the login inputs' white+slate, the CTA's white+zinc, the
//     nav's blue-500)
//   - TWO clone-authored defects found and fixed this round:
//     R85-A the TW-v4 preflight's `* { outline-color: color-mix(in
//          oklab, var(--ring) 50%, transparent) }` renders every
//          UA-default focus ring at 50% alpha; the REF rides the raw UA
//          default (opaque rgb(16,16,16) — blank-page-proven). Fixed by
//          the same-layer-later `* { outline-color: rgb(16,16,16) }`
//          restore in globals.css's @layer base (the `outline-color:
//          auto` first form is NOT robust — Chrome 155's parser drops
//          the longhand-auto rule while Chrome 1248 accepts it; and
//          transition-all buttons need a ~450ms settle before the
//          computed read).
//     R85-B the REF's platform-injected "Edit with Base44" badge
//          (fixed bottom-right black pill on EVERY page, session-only
//          close) never replicated — invisible to the per-side byte
//          chains and the text-bearing DOM census for 20+ rounds.
//          Fixed by the root-layout Base44EditBadge (vendored assets,
//          the REF-measured geometry, the functional-anchor superset).

// The login-surface tests opt out of the shared storageState (the
// logged-out surface — see playwright.config.ts); the authed-surface
// tests (B3/D) keep it via their own describe.
test.describe("session-85 keyboard-navigation cycle — the logged-out login surface", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("R85-A: the social button's keyboard focus ring resolves the UA default — opaque rgb(16, 16, 16)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/login");
    // 1 Tab → the first focusable: Continue with Google; then let the
    // button's transition-all (200ms) settle — outline-width/color
    // transition on focus, and an immediate read catches the midpoint
    await page.keyboard.press("Tab");
    await page.waitForTimeout(450);
    const read = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return { who: null, fv: false, style: "", width: "", color: "" };
      const cs = getComputedStyle(el);
      return {
        who: (el.textContent || "").trim(),
        fv: el.matches(":focus-visible"),
        style: cs.outlineStyle,
        width: cs.outlineWidth,
        color: cs.outlineColor,
      };
    });
    expect(read.who).toBe("Continue with Google");
    expect(read.fv).toBe(true);
    // the REF rides the raw UA default: auto 1px OPAQUE rgb(16,16,16).
    // (Pre-fix the LOC read oklab(0.140764 … / 0.5) — the ring at 50%
    // alpha, pixel-proven fainter than the REF's.)
    expect(read.style).toBe("auto");
    expect(read.width).toBe("1px");
    expect(read.color).toBe("rgb(16, 16, 16)");
  });

  test("R85-B1: the base44 edit badge renders at the REF-measured geometry (fixed bottom-right black pill)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/login");
    const badge = page.locator("#base44-edit-badge");
    await expect(badge).toBeVisible();
    const read = await badge.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const img = el.querySelector("img");
      const close = el.querySelector("#badge-close");
      return {
        x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
        pos: cs.position, bottom: cs.bottom, right: cs.right, z: cs.zIndex,
        bg: cs.backgroundColor, br: cs.borderRadius, pad: cs.padding,
        symbolSrc: img ? (img.getAttribute("src") || "") : null,
        text: (el.textContent || "").trim(),
        closeAria: close ? close.getAttribute("aria-label") : null,
      };
    });
    // the REF-measured geometry @1440x900 (live-read both sides)
    expect(read.pos).toBe("fixed");
    expect(read.bottom).toBe("16px");
    expect(read.right).toBe("16px");
    expect(read.z).toBe("999999");
    expect(read.bg).toBe("rgb(0, 0, 0)");
    expect(read.br).toBe("6px");
    expect(read.pad).toBe("8px 12px");
    expect(read.x).toBeGreaterThanOrEqual(1224);
    expect(read.x).toBeLessThanOrEqual(1230);
    expect(read.y).toBeGreaterThanOrEqual(842);
    expect(read.y).toBeLessThanOrEqual(848);
    expect(read.w).toBeGreaterThanOrEqual(194);
    expect(read.w).toBeLessThanOrEqual(200);
    expect(read.h).toBeGreaterThanOrEqual(37);
    expect(read.h).toBeLessThanOrEqual(41);
    // the self-hosted vendored symbol (the zero-external-resources doctrine)
    expect(read.symbolSrc).toBe("/base44-symbol-orange.png");
    expect(read.text).toContain("Edit with");
    expect(read.closeAria).toBe("Close badge");
    // the wordmark img
    await expect(badge.locator('img[alt="Base44"]')).toBeVisible();
  });

  test("R85-B2: the badge's close is session-only dismissal (node unmounts, no storage key, reload restores)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/login");
    await expect(page.locator("#base44-edit-badge")).toBeVisible();
    await page.click("#badge-close");
    await expect(page.locator("#base44-edit-badge")).toHaveCount(0);
    // the REF's close writes NO storage key (session-only; reappears on
    // reload — live-verified on the reference)
    const keys = await page.evaluate(() => Object.keys(localStorage));
    expect(keys.filter((k) => /badge/i.test(k))).toEqual([]);
    await page.reload();
    await expect(page.locator("#base44-edit-badge")).toBeVisible();
  });

  test("R85-C: the login tab-order contract — the REF-measured 9-stop sequence", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/login");
    const stops: string[] = [];
    for (let i = 0; i < 9; i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(120);
      const read = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return "BODY";
        if (el.tagName === "INPUT") return el.getAttribute("type") || "input";
        const t = (el.textContent || "").trim().replace(/\s+/g, " ");
        if (t) return t.slice(0, 24);
        return `#${el.id || ""}[${el.getAttribute("aria-label") || el.tagName}]`;
      });
      stops.push(read);
    }
    // the REF's walk (r85-keyboard-recon): the 3 socials → email →
    // password → Sign in → Forgot → Sign up → the badge's close (the
    // icon-only #badge-close) — then the wrap.
    expect(stops).toEqual([
      "Continue with Google",
      "Continue with Microsoft",
      "Continue with Apple",
      "email",
      "password",
      "Sign in",
      "Forgot password?",
      "Need an account? Sign up",
      "#badge-close[Close badge]",
    ]);
  });

  test("R85-E: the login inputs' focused rings render the REF's visible layers (white 2px + slate-400 4px)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/login");
    for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
    await page.waitForTimeout(150);
    const read = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return { who: null, fv: false, shadow: "" };
      return { who: el.getAttribute("type"), fv: el.matches(":focus-visible"), shadow: getComputedStyle(el).boxShadow };
    });
    expect(read.who).toBe("email");
    expect(read.fv).toBe(true);
    // the REF's visible layers, live-measured both sides (the LOC's
    // leading transparent --tw-inset-* slots are the v4 composition's
    // empty serialization — visually inert)
    expect(read.shadow).toContain("rgb(255, 255, 255) 0px 0px 0px 2px");
    expect(read.shadow).toContain("rgb(148, 163, 184) 0px 0px 0px 4px");
  });
});

test.describe("session-85 keyboard-navigation cycle — the authed surface", () => {
  test("R85-B3: the badge rides the root layout — present on an authed route too", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/dashboard");
    await expect(page.locator("#base44-edit-badge")).toBeVisible();
    const y = await page.evaluate(() => Math.round(document.getElementById("base44-edit-badge")!.getBoundingClientRect().y));
    expect(y).toBeGreaterThan(800); // the fixed bottom band
  });

  test("R85-D: the mobile drawer's keyboard contract — focus lands inside, Escape closes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard");
    // open the drawer via the Toggle Sidebar trigger (the accessible
    // name — the r49-standing lesson: the name rides the sr-only span
    // with the aria-label superset on top)
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    await page.waitForTimeout(600);
    const landing = await page.evaluate(() => {
      const el = document.activeElement;
      return el && el !== document.body ? (el.textContent || "").trim().slice(0, 24) : "BODY";
    });
    // the REF's contract: focus lands on the first nav item (Employees)
    expect(landing).toBe("Employees");
    // Escape closes the drawer (both sides — live-verified)
    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);
    const closed = await page.evaluate(() => !document.querySelector('[role="dialog"][data-state="open"]'));
    expect(closed).toBe(true);
  });
});
