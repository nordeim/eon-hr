#!/usr/bin/env node
// probe-m10-routesweep.mjs — full-route header sweep comparing ref vs loc
// Usage: node scripts/probe-m10-routesweep.mjs <base_ref> <base_loc> [routes...]
// Reads route list from argv; prints JSON per route: h1 metrics + first stat-card height + canvas.
const routes = process.argv.slice(4);
const [baseRef, baseLoc] = [process.argv[2], process.argv[3]];

const PROBE = `(() => {
  const out = { url: location.pathname };
  const h1 = document.querySelector("h1");
  if (h1) {
    const r = h1.getBoundingClientRect();
    const cs = getComputedStyle(h1);
    out.h1 = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), fs: cs.fontSize, fw: cs.fontWeight, color: cs.color, align: cs.textAlign };
  }
  // first stat-like card: a Card div with a big number
  const cards = [...document.querySelectorAll("main .grid > div")].slice(0, 6);
  out.gridCards = cards.map(c => {
    const r = c.getBoundingClientRect();
    const big = c.querySelector("p[class*='3xl'], p[class*='2xl'], p[class*='xl']");
    return { w: Math.round(r.width), h: Math.round(r.height), valueFs: big ? getComputedStyle(big).fontSize : null };
  }).filter(c => c.h > 40 && c.h < 400);
  // canvas gradient
  const root = document.querySelector("main > div");
  if (root) {
    const cs = getComputedStyle(root);
    out.root = { bgImg: cs.backgroundImage.slice(0, 90), pad: cs.padding };
  }
  // actions in the header row
  const btns = [...document.querySelectorAll("main button")].filter(b => b.getBoundingClientRect().y < 260 && b.getBoundingClientRect().y > 40);
  out.headerBtns = btns.map(b => { const r = b.getBoundingClientRect(); return { y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), t: (b.textContent || "").trim().slice(0, 14) }; }).slice(0, 9);
  return JSON.stringify(out);
})()`;

async function measure(session, base, route) {
  const { execSync } = await import("node:child_process");
  const url = base + route;
  try {
    execSync(`agent-browser --session ${session} open "${url}"`, { stdio: "pipe", timeout: 30000 });
  } catch { /* continue */ }
  await new Promise(r => setTimeout(r, 1400));
  try {
    const out = execSync(`agent-browser --session ${session} eval ${JSON.stringify(PROBE)}`, { stdio: "pipe", timeout: 30000 });
    return JSON.parse(out.toString().trim().replace(/^"|"$/g, "").replace(/\\"/g, '"').replace(/\\\\/g, "\\\\"));
  } catch (e) {
    return { error: String(e).slice(0, 80) };
  }
}

const all = routes.length ? routes : ["/dashboard"];
const refBase = baseRef, locBase = baseLoc;
for (const route of all) {
  const ref = await measure("ref", refBase, route);
  const loc = await measure("loc", locBase, route);
  // compare
  const diffs = [];
  const cmp = (a, b, path) => {
    if (JSON.stringify(a) !== JSON.stringify(b)) diffs.push(`${path}: ref=${JSON.stringify(a)} loc=${JSON.stringify(b)}`);
  };
  if (ref.h1 && loc.h1) {
    cmp(ref.h1.fs, loc.h1.fs, "h1.fs"); cmp(ref.h1.fw, loc.h1.fw, "h1.fw"); cmp(ref.h1.y, loc.h1.y, "h1.y");
    if (Math.abs(ref.h1.x - loc.h1.x) > 12) diffs.push(`h1.x: ref=${ref.h1.x} loc=${loc.h1.x}`);
    cmp(ref.h1.color, loc.h1.color, "h1.color");
  } else if (ref.h1 || loc.h1) diffs.push(`h1 presence: ref=${!!ref.h1} loc=${!!loc.h1}`);
  if (ref.root && loc.root) cmp(ref.root.bgImg.slice(0, 60), loc.root.bgImg.slice(0, 60), "root.bg");
  const n = Math.min(ref.gridCards?.length || 0, loc.gridCards?.length || 0);
  if ((ref.gridCards?.length || 0) !== (loc.gridCards?.length || 0) && route !== "/dashboard") diffs.push(`statCount: ref=${ref.gridCards?.length} loc=${loc.gridCards?.length}`);
  for (let i = 0; i < n; i++) {
    if (Math.abs(ref.gridCards[i].h - loc.gridCards[i].h) > 8) diffs.push(`card[${i}].h: ref=${ref.gridCards[i].h} loc=${loc.gridCards[i].h}`);
    if (ref.gridCards[i].valueFs !== loc.gridCards[i].valueFs) diffs.push(`card[${i}].valueFs: ref=${ref.gridCards[i].valueFs} loc=${loc.gridCards[i].valueFs}`);
  }
  const rb = (ref.headerBtns || []).map(b => b.t + ":" + b.w + "x" + b.h);
  const lb = (loc.headerBtns || []).map(b => b.t + ":" + b.w + "x" + b.h);
  if (JSON.stringify(rb) !== JSON.stringify(lb)) diffs.push(`headerBtns: ref=${JSON.stringify(rb)} loc=${JSON.stringify(lb)}`);
  console.log(`${diffs.length ? "DIFF " : "OK   "} ${route}${diffs.length ? "\n       " + diffs.join("\n       ") : ""}`);
}
