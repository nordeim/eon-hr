// capture-screenshots.mjs — regenerate the docs/screenshots catalog from the
// production standalone server on :3000 (seeded db/custom.db).
// Catalog (Eon HR, session-3/4/7 naming): login, dashboard ×2, employees,
// wizard steps 1–4 (session 7: INLINE view), ten module pages, mobile
// shots + the session-7 kicker and tablet-boundary surfaces.
// Run via ./scripts/capture-all.sh (boots the server + reseeds first).
import { chromium } from "@playwright/test";
import { mkdirSync, rmSync } from "node:fs";

const BASE = "http://localhost:3000";
const OUT = new URL("../docs/screenshots/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const desktop = { width: 1440, height: 900 };
const mobile = { width: 390, height: 844 };

const browser = await chromium.launch();

// Sign in once (fresh server — the in-memory rate limiter is clear).
const loginCtx = await browser.newContext({ viewport: desktop });
const lp = await loginCtx.newPage();
await lp.goto(BASE + "/login", { waitUntil: "networkidle" });
await lp.fill('input[id="email"]', "sepnetflix2023@outlook.com");
await lp.fill('input[id="password"]', "$Abcd1234");
await lp.click('button[type="submit"]');
await lp.waitForURL(BASE + "/dashboard", { timeout: 20_000 });
const cookies = await loginCtx.cookies(BASE);
const session = cookies.find((c) => c.name === "eon_session");
if (!session) throw new Error("no eon_session cookie after login");
await loginCtx.close();

const ctx = await browser.newContext({ viewport: desktop });
await ctx.addCookies([
  { name: "eon_session", value: session.value, url: BASE },
]);
const page = await ctx.newPage();

async function shot(name, path, { fullPage = false, run } = {}) {
  if (path) await page.goto(BASE + path, { waitUntil: "networkidle" });
  if (run) await run(page);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}${name}.png`, fullPage });
  console.log(`captured ${name}`);
}

// 01 — login surface (fresh, logged-out context)
{
  const anon = await browser.newContext({ viewport: desktop });
  const anonPage = await anon.newPage();
  await anonPage.goto(BASE + "/login", { waitUntil: "networkidle" });
  await anonPage.waitForTimeout(400);
  await anonPage.screenshot({ path: `${OUT}01-login-desktop.png` });
  console.log("captured 01-login-desktop");
  await anon.close();
}

// 02 — dashboard (viewport crop + full page)
await shot("02-dashboard-desktop", "/dashboard");
await shot("02-dashboard-desktop-full", null, { fullPage: true });

// 03 — employees table
await shot("03-employees-desktop", "/employees");

// 04–07 — the 4-step Add Employee wizard (session 7: INLINE view — back
// button + h1 + max-w-4xl card; fill but never submit; the E2E suite
// covers the full round-trip including persistence + delete)
await page.goto(BASE + "/employees", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Add Employee" }).first().click();
const wizard = page.locator("main");
await wizard.getByRole("heading", { name: "Add New Employee" }).waitFor();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}04-employee-wizard-step1.png` });
console.log("captured 04-employee-wizard-step1");

await wizard.getByLabel("Full Name *").fill("Capture Wizard");
await wizard.getByLabel("Work Email *").fill("capture-wizard@eon-hr.test");
await wizard.getByLabel("Nationality").fill("Saudi Arabia");
await wizard.getByRole("button", { name: "Next" }).click();
await wizard.getByText("Job Information").waitFor();
await wizard.getByLabel("Job Title *").fill("Software Engineer");
await wizard.getByLabel("Start Date *").fill("2026-10-01");
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}05-employee-wizard-step2.png` });
console.log("captured 05-employee-wizard-step2");

await wizard.getByRole("button", { name: "Next" }).click();
await wizard.getByText("Contract Information").waitFor();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}06-employee-wizard-step3.png` });
console.log("captured 06-employee-wizard-step3");

await wizard.getByRole("button", { name: "Next" }).click();
await wizard.getByText("Documents & Attachments").waitFor();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}07-employee-wizard-step4.png` });
console.log("captured 07-employee-wizard-step4");
// Back out of the wizard (session 7: inline view has no Esc-close)
for (let i = 0; i < 3; i++) {
  await wizard.getByRole("button", { name: "Back", exact: true }).click();
}
await wizard.getByRole("button", { name: "Cancel" }).click();
await wizard.getByRole("heading", { name: "Employees", exact: true }).waitFor();
await page.waitForTimeout(400);

// 09–10 — module pages
const modules = [
  ["09-leavemanagement-desktop", "/leavemanagement"],
  ["10-analyticsdashboard-desktop", "/analytics"],
  ["10-attendance-desktop", "/attendance"],
  ["10-compliance-desktop", "/compliancedashboard"],
  ["10-expenses-desktop", "/expenses"],
  ["10-hrletters-desktop", "/hrletters"],
  ["10-payroll-desktop", "/payroll"],
  ["10-recruitment-desktop", "/recruitment"],
  ["10-settings-desktop", "/settings"],
  ["10-taskmanager-desktop", "/taskmanager"],
  ["10-training-desktop", "/training"],
];
for (const [name, path] of modules) {
  await shot(name, path);
}

await ctx.close();

// 11–13 — mobile surface
const mctx = await browser.newContext({ viewport: mobile });
await mctx.addCookies([{ name: "eon_session", value: session.value, url: BASE }]);
const mp = await mctx.newPage();
await mp.goto(BASE + "/dashboard", { waitUntil: "networkidle" });
await mp.waitForTimeout(600);
await mp.screenshot({ path: `${OUT}11-mobile-dashboard.png` });
console.log("captured 11-mobile-dashboard");

await mp.getByRole("button", { name: "Toggle Sidebar" }).click();
await mp.getByRole("dialog", { name: "Navigation menu" }).waitFor();
await mp.waitForTimeout(600);
await mp.screenshot({ path: `${OUT}12-mobile-drawer-open.png` });
console.log("captured 12-mobile-drawer-open");

await mp.getByRole("dialog", { name: "Navigation menu" })
  .getByRole("button", { name: "Employees", exact: true }).click();
await mp.getByRole("dialog", { name: "Navigation menu" })
  .getByRole("link", { name: "All Employees", exact: true }).click();
await mp.waitForURL("**/employees");
await mp.waitForTimeout(600);
await mp.screenshot({ path: `${OUT}13-mobile-after-drawer-nav.png` });
console.log("captured 13-mobile-after-drawer-nav");

// 14 — session-7 mobile kicker (category-A pages: sticky page-title bar
// replaces the desktop header below md)
await mp.goto(BASE + "/taskmanager", { waitUntil: "networkidle" });
await mp.waitForTimeout(600);
await mp.screenshot({ path: `${OUT}14-mobile-kicker-taskmanager.png` });
console.log("captured 14-mobile-kicker-taskmanager");

// 15 — session-7 tablet boundary (800px: desktop chrome per the reference's
// md switch — sidebar visible, no mobile top bar / bottom tabs)
await mp.setViewportSize({ width: 800, height: 900 });
await mp.goto(BASE + "/dashboard", { waitUntil: "networkidle" });
await mp.waitForTimeout(600);
await mp.screenshot({ path: `${OUT}15-tablet-800px-desktop-chrome.png` });
console.log("captured 15-tablet-800px-desktop-chrome");
await mctx.close();

// stale scaffold-era shots (01-dashboard.png / 02-goals.png) no longer match
// any route — remove them so the catalog stays honest.
for (const stale of ["01-dashboard.png", "02-goals.png"]) {
  try {
    rmSync(`${OUT}${stale}`);
    console.log(`removed stale ${stale}`);
  } catch {
    /* not present */
  }
}

await browser.close();
console.log("capture-screenshots: done");
