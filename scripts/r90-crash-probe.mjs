// r90-crash-probe.mjs — capture the client error on /assetmanagement at 390.
import { chromium } from "@playwright/test";

const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + String(e).slice(0, 500)));
  page.on("console", (m) => { if (m.type() === "error") errors.push("CONSOLE: " + m.text().slice(0, 500)); });
  // auth via the login form first
  await page.goto("http://127.0.0.1:3200/login", { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.fill("input[type=email]", "sepnetflix2023@outlook.com");
  await page.fill("input[type=password]", "$Abcd1234");
  await page.click("button[type=submit]");
  await page.waitForTimeout(4000);
  await page.goto("http://127.0.0.1:3200/assetmanagement", { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.waitForTimeout(5000);
  console.log("body text:", (await page.locator("body").innerText().catch(() => "N/A")).slice(0, 150));
  console.log("errors:", errors.length ? "\n" + errors.join("\n---\n") : "none captured");
  await browser.close();
};
run();
