#!/usr/bin/env node
// probe-r13-dump.mjs — dump every button (text, w, h, x, y, icon, mR) on a
// route for both sides. Usage: node scripts/probe-r13-dump.mjs /profile
const { execSync } = await import("node:child_process");

const PROBE = `(() => {
  const btns = [...document.querySelectorAll("main button")];
  return JSON.stringify(btns.map(b => {
    const r = b.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return null;
    const svg = b.querySelector("svg");
    return { t: b.textContent.trim().replace(/ +/g, " ").slice(0, 24), w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y), svg: svg ? Math.round(svg.getBoundingClientRect().width) : 0, mR: svg ? getComputedStyle(svg).marginRight : "-" };
  }).filter(Boolean).slice(0, 24));
})()`;

async function measure(session, base, route) {
  const url = base + route;
  try { execSync(`agent-browser --session ${session} open "${url}"`, { stdio: "pipe", timeout: 45000 }); } catch { }
  await new Promise(r => setTimeout(r, 1800));
  const oneLine = PROBE.split("\n").join(" ");
  try {
    const out = execSync(`agent-browser --session ${session} eval ${JSON.stringify(oneLine)}`, { stdio: "pipe", timeout: 30000 });
    return JSON.parse(out.toString().trim().replace(/^"|"$/g, "").replace(/\\"/g, '"'));
  } catch (e) { return [{ error: String(e).slice(0, 50) }]; }
}

const route = process.argv[2] || "/profile";
const ref = await measure("ref", "https://eon.base44.app", route);
const loc = await measure("loc", "http://127.0.0.1:3200", route);
console.log(`=== ${route} REF (${ref.length}) ===`);
ref.forEach((b, i) => console.log(` [${i}] "${b.t}" ${b.w}x${b.h}@${b.x},${b.y} svg${b.svg} mR${b.mR}`));
console.log(`=== ${route} LOC (${loc.length}) ===`);
loc.forEach((b, i) => console.log(` [${i}] "${b.t}" ${b.w}x${b.h}@${b.x},${b.y} svg${b.svg} mR${b.mR}`));
