import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage();
await p.goto("http://127.0.0.1:3200/login");
await p.fill('input[type="email"]', "sepnetflix2023@outlook.com");
await p.fill('input[type="password"]', "$Abcd1234");
await p.click('button[type="submit"]');
await p.waitForURL((u) => !u.pathname.includes("/login"));
await p.goto("http://127.0.0.1:3200/shiftcalendar");
await p.getByRole("button", { name: "assign" }).first().click();
await p.waitForSelector("[role=dialog]");
const info = await p.evaluate(() => {
  const d = [...document.querySelectorAll("[role=dialog]")].pop();
  const chain = [];
  let el = d;
  while (el && el !== document.documentElement) {
    const cs = getComputedStyle(el);
    chain.push({ tag: el.tagName, cls: (el.className && String(el.className).slice(0, 60)), w: Math.round(el.getBoundingClientRect().width * 10) / 10, transform: cs.transform !== "none", zoom: cs.zoom });
    el = el.parentElement;
  }
  const cs = getComputedStyle(d);
  return { rect: d.getBoundingClientRect().width, width: cs.width, maxW: cs.maxWidth, display: cs.display, fullClass: d.className, chain };
});
console.log(JSON.stringify(info, null, 1));
await b.close();
