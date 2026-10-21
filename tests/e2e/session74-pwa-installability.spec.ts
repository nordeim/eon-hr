import { test, expect, type CDPSession } from "@playwright/test";

// Session-74 (parity round 73) — the PWA installability end-to-end pass
// (R74-B): the candor-ordered candidate from session_160, executed as a
// measurement FIRST (the r73 lesson: verify documented-but-unpinned
// claims with a live read — "structurally complete" is an assertion
// until Chrome itself says so).
//
// The instrument: Chrome's own installability checker — CDP
// Page.getInstallabilityErrors — the same verdict the browser's
// install-omnibox and Lighthouse's installable audit ride. The method
// re-runs the WHOLE criteria chain inside the browser: the manifest
// link, the field set, the 192/512 icon decodes (size + type +
// fetchability), the service-worker registration with a fetch
// handler, and the secure context. Zero errors == the page is
// installable END-TO-END — the strongest headless-achievable proof of
// the r72/r73 PWA stack (the offline shell + the manifest hoist).
//
// Measured this round BEFORE the pin (scripts/r74-installability-probe.mjs):
// installabilityErrors: [] on BOTH surfaces — the logged-out /login
// AND the authed /dashboard. The claim measured TRUE; these specs are
// the standing-contract pins (the R73-Cb/Cc precedent — green today,
// the regression tripwire that keeps the chain from silently
// regressing: an icon swap, a manifest field edit, a SW registration
// change, or a header/csp change that breaks any criterion turns
// these RED).
//
// The beforeinstallprompt capture: CONSIDERED AND DECLINED (the plan's
// non-goal record) — in a real desktop Chrome the event fires on these
// same criteria (with engagement) and the browser's own install
// affordances (omnibox icon / menu) work with zero page code; a
// page-side capture exists only to drive a CUSTOM install UI, which
// has no REF counterpart (the offline-page-polish deferral precedent).

test.describe("session-74 PWA installability end-to-end pass (R74-B)", () => {
  test("R74-B1a: Chrome's installability verdict on the LOGGED-OUT /login surface — zero errors", async ({ page, context }) => {
    await page.goto("/login", { waitUntil: "load" });
    // The SW registers on 'load'; settle the registration + the
    // manifest read before the verdict query.
    await page.evaluate(() => navigator.serviceWorker.ready).catch(() => {});
    await page.waitForTimeout(2500);
    const cdp: CDPSession = await context.newCDPSession(page);
    const verdict = (await cdp.send("Page.getInstallabilityErrors" as never)) as { installabilityErrors: unknown[] };
    expect(verdict.installabilityErrors, "Chrome's own installability verdict: no criteria may fail").toEqual([]);
    await cdp.detach();
  });

  test("R74-B1b: Chrome's installability verdict on the AUTHED /dashboard surface — zero errors", async ({ page, context }) => {
    // The surface where users live — the r73 manifest-hoist target.
    await page.goto("/dashboard", { waitUntil: "load" });
    await page.evaluate(() => navigator.serviceWorker.ready).catch(() => {});
    await page.waitForTimeout(2500);
    const cdp: CDPSession = await context.newCDPSession(page);
    const verdict = (await cdp.send("Page.getInstallabilityErrors" as never)) as { installabilityErrors: unknown[] };
    expect(verdict.installabilityErrors, "the authed shell is installable end-to-end").toEqual([]);
    await cdp.detach();
  });
});
