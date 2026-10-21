#!/usr/bin/env node
// r74-installability-probe.mjs — session-74 / parity round 73: the honest
// live measurement BEFORE the pin. Chrome's own installability verdict on
// the patched build (the r73 "structurally complete" claim is a
// documented-but-unmeasured assertion — the r73 lesson: measure it).
// Reuses an already-running seeded :3200 server. Uses the playwright
// chromium directly with a CDP session.
import { chromium } from "@playwright/test";

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3200";
const out = (m) => console.log(m);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);

out(`base: ${BASE}`);
await page.goto(`${BASE}/login`, { waitUntil: "load" });
await page.evaluate(() => navigator.serviceWorker.ready).catch((e) => out(`sw.ready: ${String(e).slice(0, 120)}`));
await page.waitForTimeout(2500);

out("--- login page: installability errors ---");
try {
  const r = await cdp.send("Page.getInstallabilityErrors");
  out(JSON.stringify(r, null, 1));
} catch (e) {
  out(`CDP ERR: ${String(e).slice(0, 200)}`);
}

// domain sanity check (naming drift check)
out("--- Page domain sanity ---");
try {
  const d = await cdp.send("Page.getLayoutMetrics");
  out(`domain alive (getLayoutMetrics ok: ${!!d})`);
} catch (e) { out(`domain sanity ERR: ${String(e).slice(0, 100)}`); }

// ---- authed surface: sign in in-page, then re-query on /dashboard ----
out("--- authed dashboard: installability errors ---");
try {
  await page.goto(`${BASE}/login`, { waitUntil: "load" });
  await page.fill('input[type=email]', 'sepnetflix2023@outlook.com');
  await page.fill('input[type=password]', '$Abcd1234');
  await page.click('button[type=submit]');
  await page.waitForURL(/dashboard|\/$/, { timeout: 15000 });
  await page.evaluate(() => navigator.serviceWorker.ready).catch(() => {});
  await page.waitForTimeout(2500);
  const r2 = await cdp.send("Page.getInstallabilityErrors");
  out(JSON.stringify(r2, null, 1));
  out(`authed url: ${page.url()}`);
} catch (e) {
  out(`authed probe ERR: ${String(e).slice(0, 300)}`);
}

await browser.close();
process.exit(0);
