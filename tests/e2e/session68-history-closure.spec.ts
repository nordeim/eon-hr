import { test, expect } from "@playwright/test";

// Session-68 (parity round 67) — the history-corruption closure pins.
//
// Context: the session-56 R56-E record documented a Next.js 16.4.0 App
// Router framework bug — after a full document load of any (app) route,
// the SECOND consecutive client-side navigation replaced the
// fresh-loaded entry's URL with a duplicate of the entry below it
// (Navigation API entries: ["/profile", "/"] → ["/profile", "/",
// "/staffrequests"] → ["/profile", "/profile", "/staffrequests",
// "/training"]), so back-back SKIPPED the page the user landed on.
// The clone's own code performs no history manipulation (verified
// session-56); the E2E layer pinned the CORRECT one-click contract
// (session56-readonly-family R56-E) and the repro script
// (scripts/r68-history-detector.mjs, the revived entries dump) stayed
// the standing detector.
//
// This round upgraded next 16.4.0 → 16.4.2 (16.4.1 ships two CRITICAL
// unauthenticated-RCE security fixes — use-cache typed arrays + the
// Image Optimization API with SVG — and a Server-Actions DoS fix; 16.4.2
// adds Turbopack stability fixes) and the detector came back CLEAN:
// every click pushes exactly one entry (prefix preserved, no replaces,
// no adjacent duplicates) and back-back reaches the loaded page.
//
// These pins lock the FIXED contract so a future framework upgrade that
// reintroduces the corruption trips the gate. On 16.4.0 these specs
// would FAIL (the 5/5-deterministic repro of remediation-plan-§56B);
// on 16.4.2 they are green — the red/green pair is the upstream fix.

test.describe("session-68 history-corruption closure (computed truth)", () => {
  test("R68-A: the two-deep back contract — back-back after a full load + TWO client navigations reaches the loaded page", async ({ page }) => {
    // The exact corruption shape: full document load, then TWO consecutive
    // client-side navigations, then back-back. On 16.4.0 the second back
    // landed on the pre-load page (the loaded entry was corrupted away);
    // on 16.4.2 the stack walks both pushed entries back to the load.
    await page.goto("/profile");
    await page.evaluate(() => {
      const a = [...document.querySelectorAll("[data-sidebar=menu-button]")]
        .filter((x) => x.tagName === "A" && /staff requests/i.test(x.textContent || ""))
        .find((x) => (x as HTMLElement).offsetParent !== null) as HTMLAnchorElement | undefined;
      a?.click();
    });
    await expect(page).toHaveURL(/\/staffrequests$/);
    await page.evaluate(() => {
      const a = [...document.querySelectorAll("[data-sidebar=menu-button]")]
        .filter((x) => x.tagName === "A" && /training lms/i.test(x.textContent || ""))
        .find((x) => (x as HTMLElement).offsetParent !== null) as HTMLAnchorElement | undefined;
      a?.click();
    });
    await expect(page).toHaveURL(/\/training$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/staffrequests$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole("heading", { name: "Profile Settings" })).toBeVisible();
  });

  test("R68-B: the push-only entries contract — two client navigations push two entries, no duplicates, prefix preserved", async ({ page }) => {
    // The computed-truth form of the fix: the Navigation API entry list
    // after a full load + two pushes grows by exactly one entry per
    // click, preserves the pre-click stack as a prefix, and contains no
    // adjacent duplicate pair (the 16.4.0 corruption's signature was the
    // loaded entry REPLACED by the duplicate of the entry below it).
    await page.goto("/profile");
    const before = await page.evaluate(() => {
      const nav = (window as unknown as { navigation?: { entries: () => { url: string }[] } }).navigation;
      if (!nav) return null;
      return nav.entries().map((e) => new URL(e.url).pathname);
    });
    expect(before).not.toBeNull();
    await page.evaluate(() => {
      const a = [...document.querySelectorAll("[data-sidebar=menu-button]")]
        .filter((x) => x.tagName === "A" && /staff requests/i.test(x.textContent || ""))
        .find((x) => (x as HTMLElement).offsetParent !== null) as HTMLAnchorElement | undefined;
      a?.click();
    });
    await expect(page).toHaveURL(/\/staffrequests$/);
    await page.evaluate(() => {
      const a = [...document.querySelectorAll("[data-sidebar=menu-button]")]
        .filter((x) => x.tagName === "A" && /training lms/i.test(x.textContent || ""))
        .find((x) => (x as HTMLElement).offsetParent !== null) as HTMLAnchorElement | undefined;
      a?.click();
    });
    await expect(page).toHaveURL(/\/training$/);
    const after = await page.evaluate(() => {
      const nav = (window as unknown as { navigation?: { entries: () => { url: string }[] } }).navigation;
      if (!nav) return null;
      return nav.entries().map((e) => new URL(e.url).pathname);
    }) as string[] | null;
    expect(after).not.toBeNull();
    // (a) each click pushed exactly one entry
    expect(after!.length).toBe(before!.length + 2);
    // (b) the pre-click stack survives as a prefix — no replaces
    const prefixHolds = before!.every((p, i) => after![i] === p);
    expect(prefixHolds).toBe(true);
    // (c) no adjacent duplicate pair — the 16.4.0 corruption signature
    const hasDup = after!.some((p, i) => i > 0 && p === after![i - 1]);
    expect(hasDup).toBe(false);
    // (d) the tail is the two pushed routes, in order
    expect(after!.slice(-2)).toEqual(["/staffrequests", "/training"]);
  });
});
