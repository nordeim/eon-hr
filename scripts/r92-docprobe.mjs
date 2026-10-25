import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage();
await p.goto("http://127.0.0.1:3200/login");
await p.fill('input[type="email"]', "sepnetflix2023@outlook.com");
await p.fill('input[type="password"]', "$Abcd1234");
await p.click('button[type="submit"]');
await p.waitForURL((u) => !u.pathname.includes("/login"));
await p.goto("http://127.0.0.1:3200/documenttracker");
await p.getByRole("button", { name: "Add Document" }).click();
await p.waitForSelector("[role=dialog]");
await p.waitForTimeout(800);
const info = await p.evaluate(() => {
  const dr = [...document.querySelectorAll("[role=dialog]")].pop();
  const combos = [...dr.querySelectorAll("button[role=combobox]")];
  return combos.map((c) => ({ text: c.textContent.trim(), html: c.innerHTML.slice(0, 160) }));
});
console.log(JSON.stringify(info, null, 1));
await b.close();
