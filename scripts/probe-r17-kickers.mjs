#!/usr/bin/env node
// probe-r17-kickers.mjs — do REF's category-A mobile kickers carry the
// leading 36px back button (found on /profile)? Sweep all kickers at 390.
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 45000 }).toString();
  } catch (e) {
    return "ERR:" + String(e).slice(0, 100);
  }
}

const PROBE = `(() => {
  const out = {};
  const kickers = [...document.querySelectorAll("main div")].filter(d => {
    const cs = getComputedStyle(d); const r = d.getBoundingClientRect();
    return cs.borderBottomWidth === "1px" && cs.backgroundColor === "rgb(255, 255, 255)" && r.y > 70 && r.y < 130 && r.height > 40 && r.height < 70 && cs.display !== "none";
  });
  const k = kickers[0];
  if (!k) return JSON.stringify({ noKicker: true });
  const kr = k.getBoundingClientRect();
  out.kicker = { y: Math.round(kr.y), h: Math.round(kr.height) };
  const btn = k.querySelector("button");
  if (btn) { const br = btn.getBoundingClientRect();
    const svg = btn.querySelector("svg");
    out.btn = { x: Math.round(br.x), y: Math.round(br.y), w: Math.round(br.width), h: Math.round(br.height), icon: svg ? [...svg.classList].find(c => c.includes("lucide-")) : null, iconSize: svg ? svg.getAttribute("class")?.match(/w-\d+ h-\d+/)?.[0] : null }; }
  const h1 = k.querySelector("h1");
  if (h1) { const hr = h1.getBoundingClientRect();
    out.h1 = { t: h1.textContent.trim().slice(0, 16), x: Math.round(hr.x), y: Math.round(hr.y), fs: getComputedStyle(h1).fontSize }; }
  return JSON.stringify(out);
})()`;

async function measure(session, base, route) {
  run(`agent-browser --session ${session} open "${base}${route}"`);
  await new Promise(r => setTimeout(r, 2200));
  const oneLine = PROBE.split("\n").join(" ");
  const out = run(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`);
  try {
    return JSON.parse(out.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\n/g, " "));
  } catch {
    return { error: out.slice(0, 80) };
  }
}

const ROUTES = ["/dashboard", "/employees", "/payroll", "/taskmanager", "/leavemanagement", "/expenses", "/loans", "/profile"];
const baseRef = "https://eon.base44.app", baseLoc = "http://127.0.0.1:3200";
run(`agent-browser --session ref set viewport 390 844`);
run(`agent-browser --session loc set viewport 390 844`);
await new Promise(r => setTimeout(r, 600));
for (const route of ROUTES) {
  const ref = await measure("ref", baseRef, route);
  const loc = await measure("loc", baseLoc, route);
  console.log(`${route}`);
  console.log(`  REF: ${JSON.stringify(ref)}`);
  console.log(`  LOC: ${JSON.stringify(loc)}`);
}
run(`agent-browser --session ref set viewport 1440 900`);
run(`agent-browser --session loc set viewport 1440 900`);
