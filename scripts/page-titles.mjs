#!/usr/bin/env node
// page-titles.mjs — walk all routes in an app (via agent-browser session),
// extract visible h1 + its sibling subtitle, print JSON map.
// Usage: bun scripts/page-titles.mjs <session> <base> [routesJsonFile]
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const [, , session, base, routesFile] = process.argv;
const routes = JSON.parse(readFileSync(routesFile, "utf8"));

const results = {};
for (const r of routes) {
  try {
    execSync(`agent-browser --session ${session} open "${base}${r}"`, { stdio: "pipe" });
    execSync("sleep 1.2");
    const out = execSync(
      `agent-browser --session ${session} eval "(() => { const vis=(e)=>e&&e.offsetParent!==null; const h1=[...document.querySelectorAll('h1')].find(vis); const sub=h1?[...h1.parentElement.children].filter(c=>c!==h1&&c.tagName==='P').map(c=>c.textContent.trim()).filter(Boolean)[0]:null; return JSON.stringify({h1:h1?h1.textContent.trim():null,sub:sub?sub.slice(0,80):null}); })()"`,
      { stdio: "pipe", maxBuffer: 16 * 1024 * 1024 },
    );
    const raw = out.toString().trim();
    results[r] = JSON.parse(JSON.parse(raw));
  } catch (e) {
    results[r] = { error: String(e.message).slice(0, 80) };
  }
}
console.log(JSON.stringify(results, null, 1));
