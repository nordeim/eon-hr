#!/usr/bin/env node
// capture-r28-print.mjs — session-29 / parity round 28: screenshot 93, the
// print-media superset state. agent-browser's `set media` supports only
// dark|light|reduced-motion — print emulation lives in the Playwright layer
// (page.emulateMedia). Logs into :3200 via the UI (one rate-limited attempt),
// emulates print, captures /employees; then captures the screen-media
// contrast shot from the same page.
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

// --- the print-media state: the shell chrome hidden ---
await page.emulateMedia({ media: "print" });
await page.goto(`${BASE}/employees`);
// NOTE: wait on the LAST main h1 — the first is the mobile kicker
// (md:hidden at 1280px); the desktop page h1 follows it.
await page.locator("main h1").last().waitFor({ state: "visible", timeout: 20000 });
await page.screenshot({ path: `${SHOTS}/93-print-emulation-chrome-hidden.png` });
console.log("93 captured (print emulation — chrome hidden)");

// --- the contrast: the same page under screen media ---
await page.emulateMedia({ media: "screen" });
await page.waitForTimeout(600);
await page.screenshot({ path: `${SHOTS}/93b-screen-media-contrast.png` });
console.log("93b captured (screen media contrast)");

await browser.close();
