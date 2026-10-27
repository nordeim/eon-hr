// r104-live-playwright.mjs — the live post-fix verify on the :3200 server
// with Playwright (the real-click reliability the agent-browser probe
// couldn't deliver): the REAL XeTeX CV bytes (Tanmay_CV.pdf — the 12th
// writer family) through the actual UI (login → tab → job select → upload)
// → the analysis card → the API row → the cleanup. Screenshots for the
// evidence chain. DB rows swept at the end.
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const repo = "/home/z/my-project/eon-hr";
const pdf = readFileSync("/home/z/my-project/tmp-r104/tanmay-xetex.pdf");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto("http://127.0.0.1:3200/login");
await page.fill('input[type=email]', "sepnetflix2023@outlook.com");
await page.fill('input[type=password]', "$Abcd1234");
await page.getByRole("button", { name: "Sign in" }).click();
await page.waitForURL("http://127.0.0.1:3200/", { timeout: 15000 });
console.log("logged in:", page.url());

await page.goto("http://127.0.0.1:3200/recruitment", { waitUntil: "networkidle" });
await page.waitForTimeout(4000); // the hydration window — a click before it completes is swallowed (the r78 first-interaction race)
await page.getByRole("tab", { name: "AI CV Upload" }).click();
await page.waitForTimeout(600);
const sel = await page.locator('[role=tab]').evaluateAll((els) => els.map((e) => [e.textContent?.trim(), e.getAttribute("aria-selected")]).filter(([, v]) => v === "true").map(([n]) => n));
console.log("active tab:", JSON.stringify(sel));
if (!sel.includes("AI CV Upload")) {
  await page.getByRole("tab", { name: "AI CV Upload" }).click(); // one retry
  await page.waitForTimeout(800);
}
await page.waitForTimeout(800);
await page.screenshot({ path: `${repo}/docs/screenshots/r104-cv-tab.png` });

await page.getByRole("combobox", { name: /Select Job/i }).click();
await page.getByRole("option", { name: /System Admin/i }).click();
await page.waitForTimeout(600);

await page.locator("input[type=file]").setInputFiles({
  name: "tanmay-xetex-cv.pdf",
  mimeType: "application/pdf",
  buffer: pdf,
});
await page.waitForTimeout(8000);
await page.screenshot({ path: `${repo}/docs/screenshots/r104-analysis-card.png` });

const panelText = await page.locator('[role=tabpanel]').innerText().catch(() => "");
console.log("card (first 600):", JSON.stringify(panelText.slice(0, 600)));

const row = await page.evaluate(async () => {
  const j = await fetch("/api/candidates").then((r) => r.json());
  const c = (j.data?.candidates ?? []).find((x) => /tanmay/i.test(x.name ?? ""));
  return { count: (j.data?.candidates ?? []).length, name: c?.name, aiScore: c?.aiScore, skillsMatch: c?.skillsMatch, matched: c?.matchedKeywords };
});
console.log("api row:", JSON.stringify(row));

// the cleanup (DB pristine)
if (row.name) {
  const j = await page.evaluate(async (name) => {
    const list = await fetch("/api/candidates").then((r) => r.json());
    const c = (list.data?.candidates ?? []).find((x) => x.name === name);
    if (c) await fetch(`/api/candidates?id=${encodeURIComponent(c.id)}`, { method: "DELETE" });
    return c ? "swept" : "not-found";
  }, row.name);
  console.log("cleanup:", j);
}
await browser.close();
