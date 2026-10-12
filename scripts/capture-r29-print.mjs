#!/usr/bin/env node
// capture-r29-print.mjs — session-30 / parity round 29: screenshots 97/97b,
// the print color fidelity pair. agent-browser's `set media` supports only
// dark|light|reduced-motion — print emulation lives in the Playwright layer
// (page.emulateMedia). Logs into :3200 via the UI, emulates print, captures
// /dashboard (colored quick-action chips + stat cards stay saturated under
// print-color-adjust: exact); then the screen-media contrast shot.
import { chromium } from "@playwright/test";

const BASE = "http://127.0.0.1:3200";
const SHOTS = "/home/z/my-project/eon-hr/docs/screenshots";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto(`${BASE}/login`);
await page.fill('input[type=email]', "sepnetflix2023@outlook.com");
await page.fill('input[type=password]', "$Abcd1234");
await page.click('button[type=submit]');
await page.waitForURL("**/dashboard", { timeout: 20000 });

// --- the print-media state: chrome hidden AND colors kept ---
await page.emulateMedia({ media: "print" });
await page.goto(`${BASE}/dashboard`);
await page.locator("main h1").last().waitFor({ state: "visible", timeout: 20000 });
// the color-fidelity proof (computed): a card computes print-color-adjust exact
const pca = await page.locator(".rounded-xl").first().evaluate((el) => getComputedStyle(el).printColorAdjust);
console.log(`print-color-adjust on card: ${pca}`);
await page.screenshot({ path: `${SHOTS}/97-print-color-exact.png` });
console.log("97 captured (print emulation — colors kept, chrome hidden)");

// --- the contrast: the same page under screen media ---
await page.emulateMedia({ media: "screen" });
await page.waitForTimeout(600);
await page.screenshot({ path: `${SHOTS}/97b-screen-media-contrast.png` });
console.log("97b captured (screen media contrast)");

await browser.close();
